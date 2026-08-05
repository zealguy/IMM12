/**
 * Enterprise Service Worker for Immortal Electronics
 * Provides offline caching, asset pre-fetching, and background request fallback strategy.
 */

const CACHE_NAME = 'immortal-enterprise-v1';
const DYNAMIC_CACHE = 'immortal-dynamic-v1';

// Static assets to precache for offline application shell availability
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/metadata.json'
];

// Install Event: Precache static core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing enterprise SW version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching static app shell assets...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up legacy caches and take control
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating SW & claiming clients...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removing old cache bucket:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First / Stale-While-Revalidate with Cache Fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests, Vite HMR, WebSockets, Chrome Extensions, or Dev Server internal pings
  if (
    req.method !== 'GET' ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@id/') ||
    url.pathname.includes('browser-sync') ||
    url.protocol.startsWith('chrome-extension') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // 1. API Endpoints Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          console.warn(`[Service Worker] Network request for ${url.pathname} failed. Serving cached API response...`);
          const cachedRes = await caches.match(req);
          if (cachedRes) {
            return cachedRes;
          }
          // Return synthetic offline response if not in cache
          return new Response(
            JSON.stringify({ offline: true, message: 'Platform operating in offline mode. Local cached state active.' }),
            { status: 200, headers: { 'Content-Type': 'application/json', 'X-Offline-Fallback': 'true' } }
          );
        })
    );
    return;
  }

  // 2. Images (Unsplash, Firebase Storage, Local media) Stale-While-Revalidate
  if (
    req.destination === 'image' ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, resClone));
            }
            return networkRes;
          })
          .catch(() => cachedRes);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // 3. Application Shell / HTML Navigation Requests Stale-While-Revalidate
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedShell = await caches.match('/');
          if (cachedShell) return cachedShell;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 4. Default Static Assets Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Fetch background refresh
        fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, networkRes));
          }
        }).catch(() => {});
        return cachedRes;
      }
      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      });
    })
  );
});

// Listener for postMessage actions from UI
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});
