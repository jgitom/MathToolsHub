/* NexCompany AI — demo service worker (offline app shell + cache-first static assets). */
const CACHE = "nexcompany-demo-v1";
const ASSETS = [
  "./nexcompany_ai_management_system.html",
  "./css/style.css",
  "./js/config.js",
  "./js/core.js",
  "./js/app.js",
  "./vendor/sql-wasm.js",
  "./vendor/sql-wasm.wasm",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(ASSETS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match("./nexcompany_ai_management_system.html"));
    })
  );
});
