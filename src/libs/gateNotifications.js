import axios from "axios";

// Never use the staff Axios instance or persist guardian credentials.
const guardianApi = axios.create({
  baseURL: import.meta.env?.VITE_BACKEND_URL,
  adapter: "fetch",
  withCredentials: false,
  withXSRFToken: false,
  fetchOptions: { credentials: "omit" },
  timeout: 15000,
  headers: { "Content-Type": "application/json", Authorization: null },
});

let session = null;
let sessionView = null;
let revision = 0;
let expiryTimer;
let confirmedEndpoint = null;
let cleanup = Promise.resolve();
let pushTask = Promise.resolve();
const listeners = new Set();
const WORKER_PATH = "/gate-push-sw.js";

const gateError = (code, message) => Object.assign(new Error(message), { code });
const emit = () => listeners.forEach((listener) => listener());
const matchesStudent = (a, b) => a != null && b != null && String(a) === String(b);

export const subscribeGateNotificationSession = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getGateNotificationSession = (studentId) =>
  session && session.expiresAtMs > Date.now() && matchesStudent(session.student.id, studentId)
    ? sessionView
    : null;

const requireSession = (studentId) => {
  if (!getGateNotificationSession(studentId)) {
    if (session && session.expiresAtMs <= Date.now()) {
      void resetGateNotificationSession();
    }
    throw gateError("SESSION_EXPIRED", "Activate your private notification inbox again.");
  }
  return session;
};

const requireCurrent = (captured) => {
  if (session !== captured || captured.expiresAtMs <= Date.now()) {
    if (session === captured) void resetGateNotificationSession();
    throw gateError("SESSION_EXPIRED", "Activate your private notification inbox again.");
  }
};

const request = async (method, path, { token, data, signal } = {}) => {
  const response = await guardianApi.request({
    method,
    url: `/gate/guardian${path}`,
    headers: { Authorization: token ? `Bearer ${token}` : null },
    data,
    signal,
  });
  if (response.data?.success !== true) {
    throw gateError("REQUEST_FAILED", "The notification request could not be completed.");
  }
  return response.data.data;
};

const authenticatedRequest = async (studentId, method, path, options = {}) => {
  const captured = requireSession(studentId);
  try {
    const data = await request(method, path, { ...options, token: captured.token });
    requireCurrent(captured);
    return data;
  } catch (error) {
    if (error.response?.status === 401 && session === captured) {
      void resetGateNotificationSession();
      throw gateError("SESSION_EXPIRED", "Activate your private notification inbox again.");
    }
    throw error;
  }
};

export const activateGateNotificationSession = async ({ studentId, studentCode, accessCode, signal }) => {
  if (studentId == null || !studentCode || !accessCode) {
    throw gateError("ACTIVATION_FAILED", "Check the private activation code supplied by your school.");
  }
  const attempt = ++revision;
  const data = await request("post", "/session", {
    data: { studentCode, accessCode },
    signal,
  });
  if (attempt !== revision || signal?.aborted) {
    throw gateError("CANCELLED", "Activation was cancelled.");
  }
  const expiresAtMs = Date.parse(data?.expiresAt);
  if (!matchesStudent(data?.student?.id, studentId) || data.student.studentCode !== studentCode) {
    throw gateError("ACTIVATION_FAILED", "Check the private activation code supplied by your school.");
  }
  if (typeof data?.token !== "string" || !data.token || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    throw gateError("ACTIVATION_FAILED", "The school could not start a private notification session.");
  }
  clearTimeout(expiryTimer);
  confirmedEndpoint = null;
  session = {
    token: data.token,
    student: data.student,
    institution: data.institution,
    notificationsEnabled: data.notificationsEnabled === true,
    expiresAtMs,
  };
  sessionView = {
    student: data.student,
    institution: data.institution,
    expiresAt: data.expiresAt,
    notificationsEnabled: data.notificationsEnabled === true,
  };
  expiryTimer = setTimeout(() => {
    void resetGateNotificationSession();
  }, Math.min(expiresAtMs - Date.now(), 2147483647));
  emit();
  return sessionView;
};

export const getGateNotifications = async (studentId, signal) => {
  const data = await authenticatedRequest(studentId, "get", "/notifications", { signal });
  if (!Array.isArray(data?.notifications) || !Number.isInteger(data.unreadCount) || data.unreadCount < 0
    || !data.notifications.every((item) => item?.id && typeof item.body === "string")) {
    throw gateError("REQUEST_FAILED", "The server did not confirm the notification inbox.");
  }
  return data;
};

export const markGateNotificationRead = (studentId, notificationId, signal) =>
  authenticatedRequest(studentId, "put", `/notifications/${encodeURIComponent(notificationId)}/read`, { signal });

export const getGatePushConfig = async (studentId, signal) => {
  const data = await authenticatedRequest(studentId, "get", "/push-config", { signal });
  if (typeof data?.configured !== "boolean") {
    throw gateError("PUSH_UNCONFIGURED", "The school did not confirm its browser push configuration. The in-app inbox remains available.");
  }
  return data;
};

export const getGatePushCapability = () => {
  if (typeof window === "undefined" || !window.isSecureContext) {
    return { supported: false, reason: "Browser alerts require HTTPS (or localhost)." };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { supported: false, reason: "This browser does not support web push here. Your private in-app inbox still works." };
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
  if (isIOS && !installed) {
    return { supported: false, reason: "On iPhone or iPad, web push requires a supported OS and an installed Home Screen web app. This notification worker does not install a web app. Use the in-app inbox here." };
  }
  return { supported: true, reason: "" };
};

export const vapidPublicKeyToBytes = (publicKey) => {
  if (typeof publicKey !== "string" || !/^[A-Za-z0-9_-]+={0,2}$/.test(publicKey)) {
    throw gateError("PUSH_UNCONFIGURED", "The school has not configured a valid browser push key.");
  }
  const base64 = publicKey.replace(/-/g, "+").replace(/_/g, "/");
  let binary;
  try {
    binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
  } catch {
    throw gateError("PUSH_UNCONFIGURED", "The school has not configured a valid browser push key.");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length !== 65 || bytes[0] !== 4) {
    throw gateError("PUSH_UNCONFIGURED", "The school has not configured a valid browser push key.");
  }
  return bytes;
};

const isGateRegistration = (registration) => {
  const workers = [registration.active, registration.waiting, registration.installing].filter(Boolean);
  return registration.scope === new URL("/", window.location.origin).href &&
    workers.length > 0 && workers.every((worker) => worker.scriptURL === new URL(WORKER_PATH, window.location.origin).href);
};

const findGateRegistration = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.find(isGateRegistration) || null;
};

const registerGateWorker = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const root = registrations.find((registration) => registration.scope === new URL("/", window.location.origin).href);
  if (root && !isGateRegistration(root)) {
    throw gateError("SW_CONFLICT", "Another service worker already manages this site. Browser alerts cannot be enabled safely; use the in-app inbox.");
  }
  const registration = root || await navigator.serviceWorker.register(WORKER_PATH, { scope: "/" });
  if (!registration.active) {
    await new Promise((resolve, reject) => {
      const worker = registration.installing || registration.waiting;
      if (!worker) {
        reject(gateError("PUSH_FAILED", "The browser notification worker is not ready. Try again."));
        return;
      }
      const finish = () => {
        if (worker.state !== "activated" && worker.state !== "redundant") return;
        clearTimeout(timer);
        worker.removeEventListener("statechange", finish);
        if (worker.state === "activated") resolve();
        else reject(gateError("PUSH_FAILED", "The browser notification worker could not start."));
      };
      const timer = setTimeout(() => {
        worker.removeEventListener("statechange", finish);
        reject(gateError("PUSH_FAILED", "The browser notification worker did not start. Try again."));
      }, 15000);
      worker.addEventListener("statechange", finish);
      finish();
    });
  }
  return registration;
};

const removeSubscription = async (captured, subscription) => {
  if (!subscription) return { browserRemoved: true, serverRemoved: null };
  const [serverRemoved, browserRemoved] = await Promise.all([
    captured?.token
      ? request("delete", "/push-subscriptions", { token: captured.token, data: { endpoint: subscription.endpoint } })
        .then(() => true, (error) => {
          if (error.response?.status === 401 && session === captured) {
            void resetGateNotificationSession({ unsubscribe: true });
          }
          return false;
        })
      : Promise.resolve(false),
    Promise.resolve().then(() => subscription.unsubscribe()).then((removed) => removed !== false, () => false),
  ]);
  return { serverRemoved, browserRemoved };
};

// Clear bearer memory synchronously, including when activation or push is in flight.
export const resetGateNotificationSession = ({ unsubscribe = false } = {}) => {
  const captured = session;
  ++revision;
  session = null;
  sessionView = null;
  confirmedEndpoint = null;
  clearTimeout(expiryTimer);
  emit();
  if (!unsubscribe) return Promise.resolve({ browserRemoved: false, serverRemoved: null });
  const pendingPush = pushTask;
  cleanup = cleanup.catch(() => undefined).then(() => pendingPush).then(async () => {
    const registration = await findGateRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    return removeSubscription(captured, subscription);
  }).catch(() => ({ serverRemoved: false, browserRemoved: false }));
  return cleanup;
};

export const inspectGatePushSubscription = async (studentId) => {
  const captured = requireSession(studentId);
  const registration = await findGateRegistration();
  const subscription = await registration?.pushManager?.getSubscription();
  requireCurrent(captured);
  return {
    enabled: Boolean(subscription && subscription.endpoint === confirmedEndpoint && window.Notification?.permission === "granted"),
    localSubscription: Boolean(subscription),
  };
};

// Called only by an explicit click. Permission is requested before any network await.
export const enableGateBrowserPush = async (studentId, pushConfig) => {
  const captured = requireSession(studentId);
  const capability = getGatePushCapability();
  if (!capability.supported) throw gateError("PUSH_UNSUPPORTED", capability.reason);
  if (!captured.notificationsEnabled || pushConfig?.configured !== true) {
    throw gateError("PUSH_UNCONFIGURED", "The school has not enabled browser alerts. The in-app inbox remains available.");
  }
  const applicationServerKey = vapidPublicKeyToBytes(pushConfig.publicKey);
  const permissionRequest = Notification.permission === "granted"
    ? Promise.resolve("granted")
    : Notification.requestPermission();
  const previousCleanup = cleanup;
  const previousPush = pushTask;
  const operation = (async () => {
    const permission = await permissionRequest;
    if (permission !== "granted") {
      throw gateError("PUSH_PERMISSION", permission === "denied"
        ? "Notifications are blocked. Change this site's notification permission in browser or device settings, then try again."
        : "Notification permission was not granted. The in-app inbox still works.");
    }
    // A sign-out waits for pending subscription rollback; the next child waits for sign-out.
    await previousCleanup;
    await previousPush;
    requireCurrent(captured);
    const registration = await registerGateWorker();
    requireCurrent(captured);
    let subscription = await registration.pushManager.getSubscription();
    requireCurrent(captured);
    // A subscription surviving a reload is not proof of a server-confirmed guardian binding.
    if (subscription && subscription.endpoint !== confirmedEndpoint) {
      if (!await subscription.unsubscribe()) {
        throw gateError("PUSH_FAILED", "The previous browser subscription could not be removed. Use browser settings to clear it before reconnecting.");
      }
      subscription = null;
    }
    requireCurrent(captured);
    subscription ||= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    try {
      requireCurrent(captured);
      const json = subscription.toJSON();
      const confirmation = await authenticatedRequest(studentId, "post", "/push-subscriptions", {
        data: { subscription: { endpoint: json.endpoint, keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth } } },
      });
      if (confirmation?.active !== true || typeof confirmation.id !== "string") {
        throw gateError("PUSH_FAILED", "The school did not confirm this browser subscription.");
      }
      requireCurrent(captured);
      confirmedEndpoint = subscription.endpoint;
      return { enabled: true, localSubscription: true };
    } catch (error) {
      confirmedEndpoint = null;
      const result = await removeSubscription(captured, subscription);
      if (!result.browserRemoved) {
        throw gateError("PUSH_ROLLBACK_FAILED", "School activation failed and the browser subscription could not be removed. Disable it here or in browser settings; alerts are not confirmed enabled.");
      }
      error.pushCleanup = result;
      throw error;
    }
  })();
  pushTask = operation.catch(() => undefined);
  return operation;
};

export const disableGateBrowserPush = async (studentId) => {
  const captured = requireSession(studentId);
  confirmedEndpoint = null;
  const previousCleanup = cleanup;
  const previousPush = pushTask;
  const operation = (async () => {
    await previousCleanup;
    await previousPush;
    requireCurrent(captured);
    confirmedEndpoint = null;
    const registration = await findGateRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    return removeSubscription(captured, subscription);
  })();
  pushTask = operation.catch(() => undefined);
  return operation;
};
