// Çevrimdışı çalışma: tüm bölümler + vendor + ikonlar kurulumda önbelleğe alınır.
// Gezinme: önce ağ (güncellemeler hemen görünür), ağ yoksa AYNI yolun kopyası. Hiçbir bölüm
// başka bir bölümün index.html'i ile karşılanmaz. Yalnızca aynı origin.
const C = 'cicek-v5';
const FILES = [
  './', 'index.html', 'sahil/', 'sahil/index.html', 'ciftlik/', 'ciftlik/index.html', 'privacy.html',
  'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png', 'icons/apple-touch-icon.png', 'safety.js',
  'vendor/three.min.js',
  'vendor/examples/js/shaders/CopyShader.js', 'vendor/examples/js/shaders/LuminosityHighPassShader.js', 'vendor/examples/js/shaders/FXAAShader.js',
  'vendor/examples/js/postprocessing/EffectComposer.js', 'vendor/examples/js/postprocessing/RenderPass.js',
  'vendor/examples/js/postprocessing/ShaderPass.js', 'vendor/examples/js/postprocessing/UnrealBloomPass.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, { cache: 'reload' })).then(r => { if (r.ok) return c.put(f, r); }).catch(() => {})
  ))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function navHit(u) { // aynı yol; "/x/" ile "/x/index.html" eşdeğer, sorgu yok sayılır
  const p = u.pathname, alt = p.endsWith('/') ? p + 'index.html' : (p.endsWith('/index.html') ? p.slice(0, -10) : null);
  return caches.match(u.origin + p, { ignoreSearch: true }).then(h => h || (alt ? caches.match(u.origin + alt, { ignoreSearch: true }) : undefined));
}
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  const nav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  const root = new URL('./', self.registration.scope).pathname;
  const sub = u.pathname.startsWith(root) ? u.pathname.slice(root.length) : '';
  const isLib = /^(vendor|icons)\//.test(sub);
  const store = r => { if (r.ok && r.status === 200) { const cp = r.clone(); caches.open(C).then(c => c.put(u.origin + u.pathname, cp)).catch(() => {}); } return r; };
  if (isLib) { // sürümlü/değişmez dosyalar: önce önbellek
    e.respondWith(caches.match(u.origin + u.pathname).then(h => h || fetch(req).then(store)));
    return;
  }
  e.respondWith((nav ? fetch(req, { cache: 'no-store' }) : fetch(req)).then(store).catch(() => {
    if (nav) return navHit(u).then(h => h || Response.error()); // başka bölüm sayfası asla verilmez
    return caches.match(u.origin + u.pathname, { ignoreSearch: true }).then(h => h || Response.error());
  }));
});
