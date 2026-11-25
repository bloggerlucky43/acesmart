let portalToken = "";

export const setStudentPortalToken = (token) => { portalToken = typeof token === "string" ? token : ""; };

export const isCurrentPortalSessionError = (error) => {
  const headers = error.config?.headers;
  const token = headers?.get?.("X-Student-Portal-Token") || headers?.["X-Student-Portal-Token"];
  return error.response?.status === 401 && Boolean(token) && token === portalToken;
};

export const studentPortalHeaders = (url) => portalToken &&
  /^\/(?:portal\/|sms-results\/report-card\/|feedback(?:\?|$))/.test(String(url || ""))
  ? { "X-Student-Portal-Token": portalToken } : {};
