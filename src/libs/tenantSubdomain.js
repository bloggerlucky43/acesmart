/**
 * Tenant Subdomain Resolution Helper
 * Detects whether the current session is on a school's custom subdomain
 * e.g., grace.acesmart.site -> "grace"
 */

export const getTenantSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();

  // Check URL query parameter override for testing/dev (e.g. ?school=grace or ?subdomain=grace)
  const urlParams = new URLSearchParams(window.location.search);
  const querySubdomain = urlParams.get("school") || urlParams.get("subdomain");
  if (querySubdomain) {
    sessionStorage.setItem("TENANT_SUBDOMAIN", querySubdomain.toLowerCase().trim());
    return querySubdomain.toLowerCase().trim();
  }

  const storedSubdomain = sessionStorage.getItem("TENANT_SUBDOMAIN");

  // Production domain check: <slug>.acesmart.site
  if (hostname.endsWith("acesmart.site")) {
    const parts = hostname.split(".");
    // If hostname is "grace.acesmart.site", parts length is 3 and subdomain is "grace"
    if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "app") {
      return parts[0];
    }
  }

  // Localhost subdomain check: grace.localhost
  if (hostname.includes("localhost")) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0] !== "localhost") {
      return parts[0];
    }
  }

  return storedSubdomain || null;
};

export const formatTenantDomain = (subdomain) => {
  if (!subdomain) return "school.acesmart.site";
  return `${subdomain.toLowerCase().trim()}.acesmart.site`;
};
