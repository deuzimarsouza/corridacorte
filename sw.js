const CACHE = 'meu-corre-v11-drag-stickers';
const FILES = ['./', 'index.html', 'style.css', 'install.css', 'schedule.js', 'formats.js', 'app.js', 'stickers.js', 'stickers/bora-correr.png', 'stickers/vai-ser-top.png', 'stickers/ansioso-demais.png', 'stickers/to-na-contagem.png', 'stickers/bora-bora.png', 'pwa.js', 'logo.jpg', 'manifest.webmanifest', 'icons/runner-192.png', 'icons/runner-512.png', 'icons/runner-maskable-512.png', 'icons/runner-apple-180.png'];
const URLS = FILES.map(file => new URL(file, self.registration.scope).href);
const PAGES = ['./', 'index.html'].map(file => new URL(file, self.registration.scope));

function isAppPage(response) {
  return response.ok && !response.redirected
    ? response.clone().text().then(html => html.includes('data-app="corrida-app"'))
    : Promise.resolve(false);
}

self.addEventListener('install', event => event.waitUntil((async () => {
  // Validate before saving: an authentication page must never replace the app.
  const entries = await Promise.all(URLS.map(async url => {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
    if (!response.ok || response.redirected) throw new Error('App asset unavailable');
    if (PAGES.some(page => page.href === url)) {
      if (!await isAppPage(response)) throw new Error('App page unavailable');
    } else if ((response.headers.get('content-type') || '').includes('text/html')) {
      throw new Error('Unexpected HTML for app asset');
    }
    return [url, response];
  }));
  const cache = await caches.open(CACHE);
  await Promise.all(entries.map(([url, response]) => cache.put(url, response)));
})()));

self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith('meu-corre-') && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' && PAGES.some(page => page.pathname === url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(new URL('index.html', self.registration.scope).href);
      try {
        const response = await fetch(request);
        return await isAppPage(response) ? (cached || response) : response;
      } catch { return cached || Response.error(); }
    })());
    return;
  }
  // Keep every asset on the active app version; don't mix caches from updates.
  if (URLS.includes(url.href)) event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(request) || fetch(request);
  })());
});
