const CACHE_NAME = 'control-dp-v1';
const urlsToCache = [
  '/control-derechos-peticion/',
  '/control-derechos-peticion/index.html',
  '/control-derechos-peticion/manifest.json',
  '/control-derechos-peticion/icons/icon-192.png',
  '/control-derechos-peticion/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
