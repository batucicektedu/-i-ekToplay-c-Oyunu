// Cevrimdisi testi: (1) localhost disi her istek iptal -> 0 hata; (2) service worker kurulduktan sonra
// context.setOffline(true) ile her bolum acilir ve kendi sayfasidir.
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const CH = [['', 'Çiçek Bahçesi'], ['sahil/', 'Sahil Balıkçısı'], ['ciftlik/', 'Hayvan Çiftliği']];
(async () => {
  const bad = [];
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const ext = [];
  await ctx.route('**/*', rt => { const u = rt.request().url(); if (/^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(u)) rt.continue(); else { ext.push(u); rt.abort(); } });
  const errs = [];
  const watch = pg => { pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(e.message)); };
  const probe = pg => pg.evaluate(() => ({ title: document.title, game: typeof window.__game, cv: !!document.querySelector('canvas'), three: typeof THREE, msg: (document.getElementById('msg') || { style: {} }).style.display }));
  // 1) ilk yukleme (ag yalnizca localhost)
  for (const [p, title] of CH) {
    const pg = await ctx.newPage(); watch(pg); await pg.goto(base + p); await pg.waitForTimeout(2500);
    const s = await probe(pg); console.log('online', p || '/', JSON.stringify(s));
    if (s.title !== title || s.three !== 'object' || !s.cv || s.msg === 'flex') bad.push('online load ' + p);
    await pg.close();
  }
  if (ext.length) bad.push('external requests: ' + [...new Set(ext)].slice(0, 5).join(', '));
  // 2) SW hazir
  const pg0 = await ctx.newPage(); watch(pg0); await pg0.goto(base);
  await pg0.evaluate(() => navigator.serviceWorker.ready.then(() => 1)); await pg0.waitForTimeout(2500);
  const keys = await pg0.evaluate(async () => { const out = {}; for (const k of await caches.keys()) out[k] = (await (await caches.open(k)).keys()).length; return out; });
  console.log('caches', JSON.stringify(keys)); if (!keys['cicek-v4'] || keys['cicek-v4'] < 18) bad.push('precache incomplete'); if (Object.keys(keys).length !== 1) bad.push('old caches');
  await pg0.close();
  // 3) cevrimdisi
  await ctx.setOffline(true);
  for (const [p, title] of CH) for (const suffix of ['', 'index.html', '?q=low']) {
    const pg = await ctx.newPage(); watch(pg);
    try { await pg.goto(base + p + suffix); await pg.waitForTimeout(2500); const s = await probe(pg); console.log('offline', p + suffix || '/', JSON.stringify(s));
      if (s.title !== title || s.three !== 'object' || !s.cv || s.msg === 'flex') bad.push('offline load ' + p + suffix); }
    catch (e) { bad.push('offline goto ' + p + suffix + ' ' + e.message.split('\n')[0]); }
    await pg.close();
  }
  console.log('errors', errs.slice(0, 5)); if (errs.length) bad.push('errors: ' + errs.length);
  console.log(bad.length ? 'FAIL ' + bad.join(' | ') : 'PASS'); await b.close(); srv.close(); process.exit(bad.length ? 1 : 0);
})();
