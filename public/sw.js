// Selip service worker. Minimal app-shell cache so the PWA is installable
// (Chromium fires beforeinstallprompt only when a fetch-handling SW is present)
// and the core pages open instantly / survive a flaky connection.
//
// Strategy: network-first for same-origin GET pages, falling back to cache when
// offline. API routes are never cached (always fresh gift data).

const CACHE = "selip-v1";
const SHELL = ["/", "/create", "/gifts"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // skip cross-origin
  if (url.pathname.startsWith("/api/")) return; // never cache API responses

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches
          .open(CACHE)
          .then((cache) => cache.put(request, copy))
          .catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/")),
      ),
  );
});
