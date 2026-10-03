/* Service worker de Plan Aguinaldo. Se genera en cada build (vite.config.js).
   - Navegación e index.html: primero red, y si no hay conexión usa la copia guardada.
   - Íconos y manifest: primero cache.
   - config.js: primero red, para que tus cambios se vean sin volver a compilar. */
const VERSION = '91c56e30d9';
const CACHE = 'plan-aguinaldo-' + VERSION;
const ASSETS = [
  "./",
  "config.js",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "index.html",
  "jspdf.min.js",
  "manifest.webmanifest"
];

self.addEventListener('install', event => {
  // Si falta algún archivo opcional (íconos, manifest), igual se instala.
  event.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('plan-aguinaldo-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const networkFirst = () =>
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./')));

  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('/config.js')) {
    event.respondWith(networkFirst());
    return;
  }
  event.respondWith(caches.match(req).then(r => r || networkFirst()));
});
