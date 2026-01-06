// Clarity Service Worker - Offline Support
// Caches the entire app on first load, then works offline forever

const CACHE_NAME = 'clarity-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install - cache everything on first load
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache the basics
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then(response => {
          // Don't cache if not a successful response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Network request failed, try to return cached version
          return caches.match(event.request).then(response => {
            if (response) {
              return response;
            }
            // Return offline page if nothing is cached
            return caches.match('/index.html');
          });
        });
    })
  );
});
