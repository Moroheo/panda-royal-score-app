const CACHE_NAME = 'panda-royal-v2';
const URLS = [
  './panda-royale-score.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&family=Boogaloo&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for HTML files to always get latest version
  const isOwnHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname === '/panda-royal-score-app/' || url.pathname === '/panda-royal-score-app/index.html' || url.pathname === '/panda-royal-score-app/panda-royale-score.html';
  
  if(isOwnHTML){
    // Network-first strategy for HTML files
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./panda-royale-score.html')))
    );
  } else {
    // Cache-first for external resources (fonts, CDN libs)
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return res;
        });
      }).catch(() => caches.match('./panda-royale-score.html'))
    );
  }
});
