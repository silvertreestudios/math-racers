/**
 * Math Racers — Service Worker
 *
 * Strategy: network-first (network falling back to cache).
 *
 * On install:   pre-cache the shell (HTML + manifest + icons).
 * On fetch:     try network first; on success update the cache and return the
 *               response. On network failure, fall back to cache. This means
 *               users always get the latest deploy when online, but the game
 *               still works fully offline after the first load.
 * On activate:  delete any caches that don't match CACHE_NAME so old
 *               bundles are cleaned up when the SW version is bumped.
 *
 * Vite hashes JS/CSS filenames, so we can't hard-code them. Instead we
 * cache every successful same-origin GET response on first successful fetch.
 */

const CACHE_NAME = 'math-racers-v2';

// Resources to pre-cache on install (shell only — bundle is cached lazily)
const PRECACHE = [
  './',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  // Take control immediately rather than waiting for old SW to retire
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Claim all clients so the new SW controls pages immediately
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin resources
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful, non-opaque responses
        if (response && response.status === 200 && response.type === 'basic') {
          const toCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        }
        return response;
      })
      .catch(() => {
        // Network failed — fall back to cache
        return caches.match(event.request);
      })
  );
});
