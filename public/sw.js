const CACHE = 'simba-v1';

// Pre-cached on install
const PRECACHE = [
  '/',
  '/offline',
  '/products',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/simba-logo.jpeg',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests from same origin
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Skip Next.js internal routes and API calls
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached version immediately while revalidating in background
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Offline: serve the offline page for navigations
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('', { status: 503 });
        });

      return cached || networkFetch;
    })
  );
});
