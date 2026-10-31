/* FixAm service worker — app-shell offline support.
 * Scope: / (served from site root). Versioned cache, old caches purged.
 * Strategy:
 *  - Navigations: network-first, fall back to cached shell (/app), then an
 *    inline offline page. POSTs are never cached or replayed.
 *  - Same-origin static GET (/_next/, icons, demo photo): cache-first.
 *  - Same-origin API GET (health, community-prices, motion-status polls):
 *    network-first with cached fallback so stale prices beat no prices.
 */
const VERSION = "fixam-v1";
const SHELL = ["/app", "/", "/manifest.json", "/icon-192.png", "/icon-512.png", "/demo/gen-tiger.jpg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function offlinePage() {
  return new Response(
    "<!doctype html><title>FixAm offline</title><body style=\"font-family:sans-serif;padding:32px\">" +
    "<h1>You are offline</h1><p>FixAm needs a connection for live diagnosis. " +
    "Your last cached pages still work — try the back button.</p></body>",
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !isSameOrigin(new URL(req.url))) return;

  const url = new URL(req.url);

  // Navigations: network, then cached shell, then inline offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/app")) || offlinePage())
    );
    return;
  }

  // Versioned build assets + public files: cache-first.
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/demo/") ||
      url.pathname.startsWith("/icon") || url.pathname === "/manifest.json" ||
      url.pathname === "/apple-touch-icon.png") {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // API GETs: network-first, cached fallback.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => {
          if (hit) return hit;
          return Response.json({ error: "offline" }, { status: 503 });
        }))
    );
  }
});
