const CACHE_NAME = 'control-dp-v1';
const urlsToCache = [
  '/control-derechos-peticion/',
  '/control-derechos-peticion/index.html',
  '/control-derechos-peticion/manifest.json',
  '/control-derechos-peticion/icons/icon-192.png',
  '/control-derechos-peticion/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Error cacheando:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          if (fetchResponse.ok) {
            const clone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return fetchResponse;
        });
      })
    );
  } else {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0; 
                background: #f2f2f7;
                text-align: center;
                padding: 20px;
              }
              .offline-box { max-width: 300px; }
              .offline-icon { font-size: 64px; margin-bottom: 16px; }
              .offline-title { font-size: 20px; font-weight: 700; color: #1a3a5c; margin-bottom: 8px; }
              .offline-text { font-size: 14px; color: #8e8e93; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="offline-box">
              <div class="offline-icon">📴</div>
              <div class="offline-title">Sin conexión</div>
              <div class="offline-text">No se puede conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.</div>
            </div>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
  }
});
