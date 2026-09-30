/* Service worker de Plan Aguinaldo. Se genera en cada build (vite.config.js).
   - Archivos de la app: primero cache, así abre sin internet.
   - Navegación: primero red, y si no hay conexión usa la copia guardada.
   - config.js: primero red, para que tus cambios se vean sin esperar a un build. */
const VERSION = '5f4dae9793';
const CACHE = 'plan-aguinaldo-' + VERSION;
const ASSETS = [
  "./",
  "assets/index-CyqlhNY0.css",
  "assets/index-c4b1nDGV.js",
  "assets/pdf-X6Vo3Jog.js",
  "assets/switzer-600-DSnGZNn0.woff2",
  "assets/switzer-700-9JzFtTp4.woff2",
  "config.js",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
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

  if (req.mode === 'navigate' || url.pathname.endsWith('/config.js')) {
    event.respondWith(networkFirst());
    return;
  }
  event.respondWith(caches.match(req).then(r => r || networkFirst()));
});
