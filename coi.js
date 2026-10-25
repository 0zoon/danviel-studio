/* DANVIEL Studio · retired service worker: removes itself and reloads open pages without it. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.registration.unregister()
  .then(() => self.clients.matchAll({type: "window"}))
  .then(cs => cs.forEach(c => c.navigate(c.url)))));
