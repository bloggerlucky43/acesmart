const INBOX_PATH = "/student/notifications";

self.addEventListener("push", (event) => {
  // Payloads are untrusted. No private identity or supplied URL is displayed.
  let payload;
  try {
    payload = event.data?.json();
  } catch {
    payload = null;
  }
  const isArrival = payload?.type === "gate_arrival";
  event.waitUntil(self.registration.showNotification("School gate update", {
    body: isArrival
      ? "A school arrival update is available. Open your private notification inbox."
      : "A new school update is available. Open your private notification inbox.",
    tag: "school-gate-update",
    data: { path: INBOX_PATH },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(INBOX_PATH, self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const sameOrigin = windows.filter((client) => {
      try {
        return new URL(client.url).origin === self.location.origin;
      } catch {
        return false;
      }
    });
    const existing = sameOrigin.find((client) => new URL(client.url).pathname === INBOX_PATH) || sameOrigin[0];
    if (existing) {
      try {
        const client = existing.url === target ? existing : await existing.navigate(target);
        if (client) return await client.focus();
      } catch {
        // A closed or non-navigable client falls back to the fixed same-origin inbox.
      }
    }
    return self.clients.openWindow(target);
  })());
});
