import { verifyPaymentApi } from "../api-endpoint/sms/smsEndpoints";

/**
 * Paystack redirect / return helpers.
 *
 * The browser callback is cosmetic: we only use it to trigger a server-side
 * verify poll. Success is decided by the server (webhook is source of truth).
 */
const PENDING_KEY = "ace_pending_payment_reference";
const RETURN_KEY = "ace_payment_return_path";

export function beginPaystackCheckout({ authorizationUrl, reference, returnPath }) {
  try {
    if (reference) sessionStorage.setItem(PENDING_KEY, reference);
    sessionStorage.setItem(RETURN_KEY, returnPath || window.location.pathname);
  } catch {
    // sessionStorage can be unavailable in strict privacy modes; the callback
    // query string still carries the reference.
  }
  window.location.assign(authorizationUrl);
}

export function getPendingReference() {
  try {
    return sessionStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export function getPaymentReturnPath() {
  try {
    const path = sessionStorage.getItem(RETURN_KEY);
    return path && path.startsWith("/") ? path : "/";
  } catch {
    return "/";
  }
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Poll GET /payments/verify/:reference until the transaction leaves "pending".
 * Returns the safe status payload or null when it never settled in time.
 */
export async function pollPaymentStatus(reference, { attempts = 15, intervalMs = 2500 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await verifyPaymentApi(reference);
      const status = res?.data?.status;
      if (status && status !== "pending") return res.data;
    } catch {
      // transient network/verify errors: keep polling
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return null;
}
