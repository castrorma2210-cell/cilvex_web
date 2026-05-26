/* ===================================
   CILVEX — Service Worker
   Soporte offline básico + instalación PWA confiable
   =================================== */

const VERSION = 'v1';
const CACHE = `cilvex-${VERSION}`;

/* App shell — solo URLs estables (sin assets con hash, sin videos pesados) */
const PRECACHE_URLS = [
  '/',
  '/logo-cilvex.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest',
];

/* Instalación: precachear el app shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Activación: limpiar cachés de versiones anteriores */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Estrategias de fetch */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo peticiones GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // No cachear el propio service worker
  if (url.pathname === '/sw.js') return;

  // Videos (pesados): siempre desde la red, nunca se cachean
  if (request.destination === 'video' || url.pathname.endsWith('.mp4')) return;

  // Navegación HTML: network-first (contenido siempre fresco), con respaldo offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('/', copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Resto de assets (CSS, JS, imágenes, fuentes): stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
