/* DANVIEL Studio · © 2026 DANVIEL. All rights reserved.
   Small service worker: adds the headers that let the browser run the stem-splitter AI on several
   processor cores at once (cross-origin isolation). Pages served by GitHub can't set these headers. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request;
  if(r.cache === "only-if-cached" && r.mode !== "same-origin") return;
  if(new URL(r.url).origin !== self.location.origin) return;   // only our own pages get the headers
  e.respondWith(fetch(r).then(res => {
    if(res.status === 0 || !(res.headers.get("content-type") || "").includes("text/html")) return res;
    const h = new Headers(res.headers);
    h.set("Cross-Origin-Embedder-Policy", "credentialless");
    h.set("Cross-Origin-Opener-Policy", "same-origin");
    return new Response(res.body, {status: res.status, statusText: res.statusText, headers: h});
  }).catch(() => fetch(r)));
});
