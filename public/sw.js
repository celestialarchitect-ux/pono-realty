// Ralph Foulger's Academy of Real Estate — service worker.
// Goals:
//   1. Make the academy installable as a Progressive Web App so students
//      can save it to their phone's home screen with the RF icon and
//      launch directly into their profile.
//   2. Cache the app shell so a tap on the home-screen icon doesn't show
//      a white screen during the network round-trip — UX is snappier and
//      stays usable on a flaky cell signal.
//   3. NEVER intercept POST or auth-bearing routes. Anything dynamic
//      (auth, payments, time tracking, tutor) must always hit the network
//      for correctness. The worker is a shell-cache, not a data-cache.
//   4. Cache-bust on every deploy via the version bump below.
//
// To force a cache reset, bump CACHE_VERSION and redeploy.

// Bump on every deploy that ships new SW code or icons. Cache name change
// triggers the `activate` cleanup pass which deletes stale caches.
const CACHE_VERSION = 'rfa-shell-v3-rf-only-icon';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
];

// On install: precache the bare minimum shell. We DON'T auto-skipWaiting
// here — the client orchestrates that via a SKIP_WAITING message so the
// reload happens at a predictable moment, not while the user is mid-tap.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// Client tells us to activate the new worker immediately. Fired from
// PWAInstaller after the install event so home-screen PWAs (which can't
// rely on a hard refresh) update on the user's next app launch.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// On activate: drop every cache from older versions, take control of every
// already-open tab.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Fetch strategy.
//
// Bypass cache for:
//   - any POST / PUT / PATCH / DELETE (mutations always hit network)
//   - /api/* (auth, payments, tracking — must be live)
//   - cross-origin requests (Stripe, fonts.googleapis, etc.)
//
// Network-first for HTML navigations (fall back to cached shell offline).
// Cache-first for static assets (icon, manifest, /_next/static/* hashed bundles).
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return; // never intercept mutations

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin: skip
  if (url.pathname.startsWith('/api/'))   return; // API: always network

  const isHTML = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  const isHashedAsset = url.pathname.startsWith('/_next/static/') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.webp');

  if (isHTML) {
    // Network-first; fall back to cached /
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match('/');
      })
    );
    return;
  }

  if (isHashedAsset) {
    // Cache-first; populate cache on miss.
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((res) => {
          // Only cache successful, basic-typed responses.
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else: pass through, no cache.
});

// Future: push notifications hook. The handler is in place; we just need
// the VAPID server keys + a /api/push/subscribe endpoint to start using it.
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    event.waitUntil(
      self.registration.showNotification(payload.title || 'Ralph Foulger Academy', {
        body: payload.body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        data: payload.data || {},
        tag: payload.tag || 'rfa',
      })
    );
  } catch {
    // Malformed push payload — silently drop.
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/profile';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && 'focus' in w) return w.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
