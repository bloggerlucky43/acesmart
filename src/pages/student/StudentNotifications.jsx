import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Badge, Box, Button, Flex, Icon, Input, Text } from "@chakra-ui/react";
import { FaBell, FaCheck, FaLock, FaSyncAlt } from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import { PortalCard, PortalEmpty, PortalLoader } from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import {
  activateGateNotificationSession,
  disableGateBrowserPush,
  enableGateBrowserPush,
  getGateNotificationSession,
  getGateNotifications,
  getGatePushCapability,
  getGatePushConfig,
  inspectGatePushSubscription,
  markGateNotificationRead,
  resetGateNotificationSession,
  subscribeGateNotificationSession,
} from "../../libs/gateNotifications";

const errorMessage = (error, activating = false) => {
  if (error.code === "SESSION_EXPIRED") return "Your private notification session has ended. Activate it again with your school-issued code.";
  if (error.response?.status === 400 || error.response?.status === 401 || error.code === "ACTIVATION_FAILED") {
    return activating
      ? "Unable to activate. Check the private code supplied by your school and try again."
      : "The notification request could not be completed. Refresh or activate your inbox again.";
  }
  if (error.response?.status === 403) return "Your school has not enabled optional gate notifications, or access is no longer available. Contact the school; normal attendance is unaffected.";
  if (error.response?.status === 429) return "Too many attempts. Wait a little before trying again.";
  if (error.code?.startsWith("PUSH_") || error.code === "SW_CONFLICT") return error.message;
  return "Unable to reach school notifications. Check your connection and try again. Existing attendance is unaffected.";
};

const isCancelled = (error) => error.code === "ERR_CANCELED" || error.code === "CANCELLED";
const formatTime = (value) => {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime())
    ? `${new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }).format(date)} WAT`
    : "Time unavailable";
};

const StudentNotificationInbox = ({ student }) => {
  const studentId = student.id;
  const studentCode = student.studentId || student.studentCode || "";
  const guardian = useSyncExternalStore(
    subscribeGateNotificationSession,
    () => getGateNotificationSession(studentId),
    () => null,
  );
  const [accessCode, setAccessCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [readBusy, setReadBusy] = useState(null);
  const [pushConfig, setPushConfig] = useState(null);
  const [pushState, setPushState] = useState({ enabled: false, localSubscription: false });
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState("");
  const [permission, setPermission] = useState(() => window.Notification?.permission || "unavailable");
  const lifetime = useRef(null);
  const previouslyActivated = useRef(Boolean(guardian));
  const capability = getGatePushCapability();
  const schoolEnabled = guardian?.notificationsEnabled === true;

  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!guardian) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setLastUpdated(null);
      setPushConfig(null);
      setPushState({ enabled: false, localSubscription: false });
      setPushMessage("");
      if (previouslyActivated.current) {
        setMessage("Your private notification session has ended. Activate it again with your school-issued code.");
      }
      return;
    }
    previouslyActivated.current = true;
    if (!guardian.notificationsEnabled) return;
    const controller = new AbortController();
    let pending = false;
    const load = async () => {
      if (document.visibilityState !== "visible" || pending) return;
      pending = true;
      setLoading(true);
      try {
        const data = await getGateNotifications(studentId, controller.signal);
        if (controller.signal.aborted) return;
        setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
        setUnreadCount(Number.isFinite(data?.unreadCount) ? data.unreadCount : 0);
        setLastUpdated(new Date());
        setMessage("");
      } catch (error) {
        if (!controller.signal.aborted && !isCancelled(error)) setMessage(errorMessage(error));
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    const loadPush = async () => {
      try {
        const config = await getGatePushConfig(studentId, controller.signal);
        if (!controller.signal.aborted) setPushConfig(config);
      } catch (error) {
        if (!controller.signal.aborted && !isCancelled(error)) {
          setPushConfig({ configured: false });
          setPushMessage(errorMessage(error));
        }
      }
      try {
        const state = await inspectGatePushSubscription(studentId);
        if (!controller.signal.aborted) setPushState(state);
      } catch (error) {
        if (!controller.signal.aborted && !isCancelled(error)) {
          setPushMessage(error.code === "SESSION_EXPIRED" ? errorMessage(error) : "Browser subscription status could not be checked. Alerts are not confirmed enabled.");
        }
      }
    };
    const onVisible = () => {
      setPermission(window.Notification?.permission || "unavailable");
      if (document.visibilityState === "visible") {
        void load();
        void loadPush();
      }
    };
    void load();
    void loadPush();
    const interval = setInterval(load, 60000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [guardian, studentId, refreshVersion]);

  const activate = async (event) => {
    event.preventDefault();
    if (activating || !accessCode.trim()) return;
    setActivating(true);
    setMessage("");
    const privateCode = accessCode.trim();
    const signal = lifetime.current?.signal;
    setAccessCode("");
    try {
      await activateGateNotificationSession({ studentId, studentCode, accessCode: privateCode, signal });
    } catch (error) {
      if (!signal?.aborted && !isCancelled(error)) setMessage(errorMessage(error, true));
    } finally {
      if (!signal?.aborted) setActivating(false);
    }
  };

  const markRead = async (id) => {
    if (readBusy != null) return;
    const signal = lifetime.current?.signal;
    setReadBusy(id);
    try {
      await markGateNotificationRead(studentId, id, signal);
      if (!signal?.aborted) setRefreshVersion((value) => value + 1);
    } catch (error) {
      if (!signal?.aborted && !isCancelled(error)) setMessage(errorMessage(error));
    } finally {
      if (!signal?.aborted) setReadBusy(null);
    }
  };

  const enablePush = async () => {
    if (pushBusy) return;
    const signal = lifetime.current?.signal;
    setPushBusy(true);
    setPushMessage("");
    try {
      const state = await enableGateBrowserPush(studentId, pushConfig);
      if (!signal?.aborted) {
        setPushState(state);
        setPushMessage("Browser alerts are enabled for this device. Delivery is not guaranteed; use your in-app inbox to check updates.");
      }
    } catch (error) {
      if (!signal?.aborted) {
        setPushState({ enabled: false, localSubscription: error.code === "PUSH_ROLLBACK_FAILED" });
        setPushMessage(error.pushCleanup?.serverRemoved === false
          ? `${errorMessage(error)} The local browser subscription was removed, but removal at the school could not be confirmed.`
          : errorMessage(error));
        try {
          const state = await inspectGatePushSubscription(studentId);
          if (!signal?.aborted) setPushState(state);
        } catch {
          // The session may have expired; never describe an unverified subscription as enabled.
        }
      }
    } finally {
      if (!signal?.aborted) {
        setPermission(window.Notification?.permission || "unavailable");
        setPushBusy(false);
      }
    }
  };

  const disablePush = async () => {
    if (pushBusy) return;
    const signal = lifetime.current?.signal;
    setPushBusy(true);
    setPushState((state) => ({ ...state, enabled: false }));
    try {
      const result = await disableGateBrowserPush(studentId);
      if (!signal?.aborted) {
        setPushState({ enabled: false, localSubscription: !result.browserRemoved });
        setPushMessage(result.browserRemoved
          ? result.serverRemoved === false
            ? "Browser subscription removed. Removal at the school could not be confirmed; the browser endpoint is no longer active."
            : "Browser alerts are disabled on this device. Your in-app inbox is still available."
          : result.serverRemoved === true
            ? "School subscription removed, but the browser subscription remains. Retry disabling or remove this site's notification permission in browser settings."
            : "Removal could not be confirmed. Retry disabling or block this site's notifications in browser settings.");
      }
    } catch (error) {
      if (!signal?.aborted) setPushMessage(errorMessage(error));
    } finally {
      if (!signal?.aborted) setPushBusy(false);
    }
  };

  const closeInbox = async () => {
    const signal = lifetime.current?.signal;
    const result = await resetGateNotificationSession({ unsubscribe: true });
    if (!signal?.aborted && (!result.browserRemoved || result.serverRemoved === false)) {
      setMessage(result.browserRemoved
        ? "Your private inbox is closed and the browser subscription was removed. Removal at the school could not be confirmed."
        : "Your private inbox is closed, but browser subscription removal could not be confirmed. Block this site's notifications in browser settings on shared devices.");
    }
  };

  return (
    <Box>
      <StudentPageHeading
        title="Notifications"
        description="Private guardian updates for optional school gate arrivals."
        icon={FaBell}
        action={guardian && (
          <Button size="sm" variant="outline" borderRadius="xl" onClick={closeInbox}>
            Close Private Inbox
          </Button>
        )}
      />

      {message && <Box role="status" mb={5} p={4} bg="#FFF7ED" border="1px solid #FED7AA" borderRadius="xl"><Text fontSize="13px" color="#9A3412">{message}</Text></Box>}

      {!guardian ? (
        <PortalCard maxW="620px">
          <Flex align="center" gap={3} mb={3}>
            <Icon as={FaLock} color="#4338CA" />
            <Text fontSize="17px" fontWeight="800" color="#0F172A">Activate Your Private Inbox</Text>
          </Flex>
          <Text color="#64748B" fontSize="13px" lineHeight="1.7" mb={5}>
            Ask your school for a private guardian activation code. Your student code and surname alone do not unlock these updates. This extra activation only protects notifications; it does not change your existing portal login.
          </Text>
          <Box as="form" onSubmit={activate} autoComplete="off">
            <Box as="label" htmlFor="gate-student-code" display="block" fontWeight="700" fontSize="12px" color="#334155" mb={2}>STUDENT CODE</Box>
            <Input id="gate-student-code" value={studentCode} readOnly bg="#F8FAFC" borderColor="#CBD5E1" borderRadius="xl" h="44px" mb={4} />
            <Box as="label" htmlFor="gate-private-code" display="block" fontWeight="700" fontSize="12px" color="#334155" mb={2}>PRIVATE GUARDIAN ACTIVATION CODE</Box>
            <Input id="gate-private-code" type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required maxLength={256} autoComplete="off" spellCheck={false} autoCapitalize="none" aria-describedby="gate-code-help" placeholder="Code issued privately by your school" borderColor="#CBD5E1" borderRadius="xl" h="44px" />
            <Text id="gate-code-help" mt={2} fontSize="12px" color="#64748B">Keep this code private. It is not saved by the app; the notification session ends on refresh, expiry, student change, or sign-out.</Text>
            <Button type="submit" loading={activating} disabled={!studentCode || !accessCode.trim()} mt={5} w={{ base: "100%", sm: "auto" }} bg="#4338CA" color="white" borderRadius="xl">Activate Private Inbox</Button>
          </Box>
          <Text mt={5} fontSize="12px" lineHeight="1.7" color="#64748B">Gate alerts are optional and depend on your school's settings. They do not change normal attendance and do not send SMS. A school can revoke access by rotating the private code.</Text>
        </PortalCard>
      ) : !schoolEnabled ? (
        <PortalEmpty icon={FaBell} title="Optional Gate Notifications Are Off" description="Your school has not enabled this optional feature. Normal attendance and the rest of the portal are unaffected. Contact the school for availability." />
      ) : (
        <Flex direction="column" gap={5}>
          <PortalCard>
            <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={4}>
              <Box>
                <Flex align="center" gap={2} mb={1}>
                  <Text fontSize="16px" fontWeight="800" color="#0F172A">Browser Alerts</Text>
                  <Badge colorPalette={pushState.enabled && permission === "granted" ? "green" : "gray"} borderRadius="full">{pushState.enabled && permission === "granted" ? "Enabled on this device" : "Not confirmed enabled"}</Badge>
                </Flex>
                <Text fontSize="13px" color="#64748B" lineHeight="1.7">Permission: {permission}. Alerts are optional, device-specific, and never requested automatically.</Text>
              </Box>
              <Flex gap={2} wrap="wrap" w={{ base: "100%", md: "auto" }}>
                {(!pushState.enabled || permission !== "granted") && <Button size="sm" bg="#4338CA" color="white" borderRadius="xl" loading={pushBusy} disabled={pushBusy || !capability.supported || !pushConfig?.configured || permission === "denied"} onClick={enablePush}>Enable Browser Alerts</Button>}
                <Button size="sm" variant="outline" borderRadius="xl" disabled={pushBusy || !capability.supported} loading={pushBusy && pushState.localSubscription} onClick={disablePush}>Disable / Remove Subscription</Button>
              </Flex>
            </Flex>
            <Text mt={3} fontSize="12px" color="#64748B" lineHeight="1.7">{!capability.supported ? capability.reason : pushConfig == null ? "Checking the school's browser push configuration. The in-app inbox works independently." : !pushConfig.configured ? "Browser push is not configured by the school. You can still read updates below." : "Browser alerts remain subscribed when the private inbox session expires. Disable alerts or sign out to remove this device's subscription. Only enable alerts on a device you trust."}</Text>
            {permission === "denied" && <Text mt={2} color="#9A3412" fontSize="12px">Notifications are blocked. Allow this site's notifications in browser or device settings before enabling again.</Text>}
            <Text mt={2} fontSize="12px" color="#64748B" lineHeight="1.7">On iPhone or iPad, web push requires a supported OS version and an installed Home Screen web app. This notification worker does not install a web app or provide offline access. Site installation support must be configured separately; use this inbox when browser push is unavailable.</Text>
            <Text mt={2} fontSize="12px" color="#64748B" lineHeight="1.7">Delivery is not guaranteed and can be delayed by browser, device, or network restrictions. These alerts are not an emergency or child-safety tracking service. Browser banners use generic text to protect private student details.</Text>
            {pushState.localSubscription && !pushState.enabled && <Text mt={3} fontSize="12px" color="#9A3412">A local browser subscription exists, but school activation is not confirmed. Enable to reconnect or remove it here.</Text>}
            {pushMessage && <Text role="status" mt={3} fontSize="13px" lineHeight="1.7" color="#334155">{pushMessage}</Text>}
          </PortalCard>

          <Flex justify="space-between" align="center" gap={3} wrap="wrap">
            <Box>
              <Flex gap={2} align="center"><Text fontSize="17px" fontWeight="800" color="#0F172A">Private Inbox</Text><Badge bg="#EEF2FF" color="#4338CA" borderRadius="full">{unreadCount} unread</Badge></Flex>
              <Text fontSize="12px" color="#64748B" mt={1}>Checks every 60 seconds while this page is visible.{lastUpdated ? ` Updated ${lastUpdated.toLocaleTimeString()}.` : ""}</Text>
            </Box>
            <Button size="sm" variant="outline" borderRadius="xl" loading={loading} onClick={() => setRefreshVersion((value) => value + 1)}><Icon as={FaSyncAlt} boxSize={3} />Refresh</Button>
          </Flex>
          {loading && !notifications.length ? <PortalLoader label="Loading private notifications..." /> : !notifications.length ? (
            <PortalEmpty icon={FaBell} title="No Gate Updates Yet" description="When your school records an eligible arrival and enables notifications, the update will appear here. An empty inbox is not proof of absence." />
          ) : <Flex direction="column" gap={3}>{notifications.map((item) => (
            <PortalCard key={item.id} borderLeft={!item.readAt ? "4px solid #4338CA" : undefined}>
              <Flex gap={4} direction={{ base: "column", sm: "row" }} justify="space-between" align="flex-start">
                <Box minW={0} flex={1}>
                  <Flex align="center" wrap="wrap" gap={2} mb={2}><Text fontSize="15px" fontWeight="800" color="#0F172A" overflowWrap="anywhere">{item.title || "School gate update"}</Text>{!item.readAt && <Badge bg="#EEF2FF" color="#4338CA" borderRadius="full">Unread</Badge>}</Flex>
                  <Text fontSize="13px" color="#334155" lineHeight="1.7" whiteSpace="pre-wrap" overflowWrap="anywhere">{item.body}</Text>
                  <Text as="time" dateTime={item.occurredAt || undefined} fontSize="12px" color="#64748B" display="block" mt={2}>{formatTime(item.occurredAt)}</Text>
                </Box>
                {!item.readAt ? <Button size="sm" variant="outline" borderRadius="xl" disabled={readBusy != null} loading={readBusy === item.id} onClick={() => markRead(item.id)}><Icon as={FaCheck} boxSize={3} />Mark Read</Button> : <Text fontSize="12px" color="#64748B">Read</Text>}
              </Flex>
            </PortalCard>
          ))}</Flex>}
        </Flex>
      )}
    </Box>
  );
};

const StudentNotifications = () => {
  const { student, institution } = useStudentPortal();
  if (!student) return null;
  if (institution?.gateNotificationsEnabled === false) {
    return (
      <Box>
        <StudentPageHeading title="Notifications" description="Optional private guardian updates for school gate arrivals." icon={FaBell} />
        <PortalEmpty icon={FaBell} title="Optional Gate Notifications Are Off" description="Your school has not enabled this optional feature. No activation code is needed here. Normal attendance and the rest of the portal are unaffected. Contact the school for availability." />
      </Box>
    );
  }
  return <StudentNotificationInbox key={student.id} student={student} />;
};

export default StudentNotifications;
