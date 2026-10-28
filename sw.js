/* DANVIEL Studio offline cache.
   The page itself: network first (updates arrive right away), the saved copy only when you're offline.
   Fonts, encoder and pictures: from the cache first, they never change under the same name. */
const CACHE = "danviel-v1";
const FONTS = ["bigshouldersdisplay-600.woff2", "bigshouldersdisplay-800.woff2", "unbounded-600.woff2", "unbounded-800.woff2", "herrvonmuellerhoff-400.woff2", "dmserifdisplay-400.woff2", "permanentmarker-400.woff2", "instrumentsans-400.woff2", "instrumentsans-500.woff2", "instrumentsans-600.woff2", "ibmplexmono-400.woff2", "ibmplexmono-500.woff2", "bebasneue-400.woff2", "anton-400.woff2", "cinzel-700.woff2", "playfairdisplay-700i.woff2", "caveat-700.woff2", "unbounded-700.woff2", "unifrakturmaguntia-400.woff2", "oswald-700.woff2", "archivoblack-400.woff2", "abrilfatface-400.woff2", "montserrat-900.woff2", "cormorantgaramond-600i.woff2", "orbitron-800.woff2", "monoton-400.woff2", "pacifico-400.woff2", "rubikglitch-400.woff2", "bungee-400.woff2", "syne-800.woff2", "pressstart2p-400.woff2", "dancingscript-700.woff2", "lobster-400.woff2", "righteous-400.woff2", "bangers-400.woff2", "teko-600.woff2", "blackopsone-400.woff2", "greatvibes-400.woff2", "satisfy-400.woff2", "fredoka-700.woff2", "rye-400.woff2", "sixcaps-400.woff2", "shrikhand-400.woff2", "creepster-400.woff2", "rocksalt-400.woff2", "specialelite-400.woff2", "audiowide-400.woff2", "alfaslabone-400.woff2", "boogaloo-400.woff2", "nosifer-400.woff2", "codystar-400.woff2", "kaushanscript-400.woff2", "yellowtail-400.woff2", "staatliches-400.woff2", "bowlbyone-400.woff2", "majormonodisplay-400.woff2", "fasterone-400.woff2", "vibur-400.woff2", "silkscreen-400.woff2", "sedgwickavedisplay-400.woff2", "rubikspraypaint-400.woff2", "rubikwetpaint-400.woff2", "rubikdistressed-400.woff2", "sairastencilone-400.woff2", "wallpoet-400.woff2", "pirataone-400.woff2", "grenzegotisch-700.woff2", "delagothicone-400.woff2", "metalmania-400.woff2", "newrocker-400.woff2", "bodonimoda-700.woff2", "italiana-400.woff2", "marcellus-400.woff2", "tenorsans-400.woff2", "allura-400.woff2", "sacramento-400.woff2", "homemadeapple-400.woff2", "bungeeshade-400.woff2", "bungeeinline-400.woff2", "rampartone-400.woff2", "tiltwarp-400.woff2", "bagelfatone-400.woff2", "michroma-400.woff2", "russoone-400.woff2", "kronaone-400.woff2"]; // filled in by build.py
const CORE = ["./", "privacy.html", "vendor/lame.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "DANVIEL.ico"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => {
    // all cover fonts in the background, so every font works offline too (a missing one doesn't stop the install)
    FONTS.forEach(f => c.match("fonts/" + f).then(h => h || c.add("fonts/" + f)).catch(() => {}));
  })).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== location.origin) return;   // AI models, links etc. go straight to the network
  const isPage = req.mode === "navigate" || /\.html$|\/$/.test(url.pathname);
  if(isPage){
    e.respondWith(fetch(req).then(r => { if(r.ok){ const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if(r.ok && /\/(fonts|vendor)\/|\.(png|ico|webmanifest)$/.test(url.pathname)){ const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return r;
  })));
});
