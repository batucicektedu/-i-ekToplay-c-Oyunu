// Magaza ekran goruntuleri: docs/store/shot_*.png (1080x1920, portre; yonetici paneli kapali/PIN arkasinda, gorunmez).
// Kullanim: node tests/store_shots.js   (NODE_PATH=/opt/node22/lib/node_modules)
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'docs', 'store');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const SHOTS = [ // [dosya, sayfa, kayit anahtari, fixture, tp(x,z) veya null, sim saniye]
  ['shot_1_bahce', '', 'cicek_bahcesi_v1', 'tests/saves/c5-v5.json', process.env.T1 ? JSON.parse(process.env.T1) : [28, -4], 4],
  ['shot_2_bahce_buyuk', '', 'cicek_bahcesi_v1', 'tests/saves/c7-v7.json', process.env.T2 ? JSON.parse(process.env.T2) : null, 4],
  ['shot_3_sahil', 'sahil/', 'bolum2_sahil', 'tests/sahil/saves/sahil-mid-v8.json', null, 4],
  ['shot_4_sahil_liman', 'sahil/', 'bolum2_sahil', 'tests/sahil/saves/sahil-late-v8.json', process.env.T4 ? JSON.parse(process.env.T4) : [-40, -6], 4],
  ['shot_5_ciftlik', 'ciftlik/', 'bolum3_ciftlik', 'tests/ciftlik/ranch2.json', process.env.T5 ? JSON.parse(process.env.T5) : [7, -40], 4]
];
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  for (const [name, pg, key, fx, tp, sec] of SHOTS) {
    if (process.env.ONLY && !name.includes(process.env.ONLY)) continue;
    const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
    const page = await ctx.newPage(); const sv = JSON.parse(fs.readFileSync(path.join(ROOT, fx), 'utf8')).value;
    await page.addInitScript(([k, v]) => { window.__noAuto = true; try { localStorage.setItem('cicek_grafik', 'high'); if (!sessionStorage.getItem('__seed')) { sessionStorage.setItem('__seed', '1'); localStorage.setItem(k, v); window.__resetting = true; } } catch (e) {} }, [key, JSON.stringify(sv)]);
    await page.goto(base + pg + '?q=high'); await page.waitForFunction(() => window.__game, null, { timeout: 30000 }); await page.waitForTimeout(1500);
    await page.evaluate(() => { document.querySelectorAll('#offc .obtn, #offc button').forEach(b => b.click()); }); await page.waitForTimeout(600);
    await page.evaluate(([tp, sec]) => { const g = window.__game; g.hideIntro && g.hideIntro(); window.__freeze = true; if (tp) g.tp(tp[0], tp[1]); g.sim(sec); g.render(); }, [tp, sec]);
    await page.evaluate(() => { const c = document.getElementById('chapCard'); if (c) c.style.display = 'none'; });
    await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, name + '.png') });
    const sz = await page.evaluate(() => [innerWidth, innerHeight]); console.log(name, sz);
    await ctx.close();
  }
  await b.close(); srv.close();
})();
