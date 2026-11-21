// Önce ağ: güncellemeler hemen görünür; ağ yoksa önbellek. Yalnızca aynı origin; CDN'e dokunmaz.
// Bölüm sayfaları (sahil/, ciftlik/): gezinme istekleri tam URL ile önbelleğe alınır; çevrimdışıyken
// yalnızca aynı URL'nin kopyası verilir. Kök index.html asla başka bir bölüm yerine sunulmaz.
const C = 'cicek-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  const u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  const nav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  const root = new URL('./', self.registration.scope).pathname, sub = u.pathname.startsWith(root) ? u.pathname.slice(root.length) : '';
  const own = nav && /^(sahil|ciftlik)(\/|$)/.test(sub); // kendi sayfası olan bölüm
  e.respondWith((nav ? fetch(req, { cache: 'no-store' }) : fetch(req)).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)).catch(() => {}); }
    return r;
  }).catch(() => caches.match(req).then(hit => {
    if (hit) return hit;
    if (!nav) return undefined;
    if (own) return Response.error(); // bölüm sayfası: asla kök index.html verme
    return caches.match('index.html').then(h => h || caches.match('./'));
  })));
});
