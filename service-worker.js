const CACHE_NAME = 'vacinal-escolar-v1';

const ASSETS = [
  './',
  './?pwa=1',
  './?manifest=1'
];

// INSTALAÇÃO
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ATIVAÇÃO
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH — estratégia: Network First, fallback Cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(resp =>
          resp || new Response(
            `
            <html>
              <body style="font-family:Arial;text-align:center;padding:40px">
                <h2>Aplicativo offline</h2>
                <p>Conecte-se à internet para continuar.</p>
              </body>
            </html>
            `,
            { headers: { 'Content-Type': 'text/html; charset=UTF-8' } }
          )
        )
      )
  );
});

