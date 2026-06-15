/* ================================================================
   ThinkToWake — service-worker.js
   Strategy: Cache-first for static assets, network-first for HTML.
   This makes the app fully usable offline after first load.
   ================================================================ */

const CACHE_NAME   = "thinktowake-v3.3";
const CACHE_ASSETS = [
  "./",
  "./index.html",
  "./script.js",
  "./style.css",
  "./questions.js",
  "./manifest.json",
  "./assets/alarm.mp3",
  "./assets/sounds/digital.mp3",
  "./assets/sounds/bell.mp3",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

/* ---------- Install: pre-cache all static assets ---------- */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

/* ---------- Activate: remove old caches ---------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k  => caches.delete(k))
      )
    ).then(() => self.clients.claim())   // take control of all open tabs
  );
});

/* ---------- Fetch: cache-first for assets, network for HTML ---------- */
self.addEventListener("fetch", event => {
  // Only handle same-origin GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // HTML: network-first so refreshes always get latest code
  if (url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname.endsWith("/")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh HTML
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))   // offline fallback
    );
    return;
  }

  // Everything else: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
