// Uzun oyun kararlılığı: max kayıtta N dk simülasyon; sahne/geometri/materyal/doku/DOM sayıları ve JS yığını büyümemeli
// node tests/longplay.js [dk=60] [fixture=max.json]
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const SP = process.env.THREE_DIR || '/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad/node_modules/three';
const GAME = process.env.GAME || 'file://' + path.resolve(__dirname, '..', 'index.html');
const MIN = +process.argv[2] || 60, FIX = process.argv[3] || 'max.json';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(() => { window.__noAuto = true; window.requestAnimationFrame = () => 0; try { localStorage.setItem('cicek_grafik', 'low'); } catch (e) {} });
  await page.route('**/three.min.js', r => r.fulfill({ path: SP + '/build/three.min.js', contentType: 'application/javascript' }));
  await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**', r => { const u = r.request().url().split('examples/js/')[1]; r.fulfill({ path: SP + '/examples/js/' + u, contentType: 'application/javascript' }); });
  const sv = JSON.parse(fs.readFileSync(path.join(__dirname, FIX), 'utf8')).value; sv.ts = Date.now() + 1e6; sv.op = 0;
  await page.addInitScript(([k, v]) => { if (!sessionStorage.getItem('__seed')) { sessionStorage.setItem('__seed', '1'); localStorage.setItem(k, v); window.__resetting = true; } }, ['cicek_bahcesi_v1', JSON.stringify(sv)]);
  await page.goto(GAME); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); });
  const snap = () => page.evaluate(() => { const g = __game, sc = g.scene, geo = new Set(), mat = new Set(), tex = new Set(); let n = 0, vis = 0;
    sc.traverse(o => { n++; if (o.visible) vis++; if (o.geometry) geo.add(o.geometry); const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) { mat.add(m); for (const k in m) if (m[k] && m[k].isTexture) tex.add(m[k]); } });
    if (window.gc) window.gc(); const pm = performance.memory || {};
    return { nodes: n, vis, geo: geo.size, mat: mat.size, tex: tex.size, dom: document.getElementsByTagName('*').length, fx: document.getElementById('fx').children.length, heapMB: +(pm.usedJSHeapSize / 1048576).toFixed(1), money: Math.round(g.S.money), cust: g.customers.length, children: sc.children.length }; });
  const rows = []; const t0 = Date.now(); let worst = 0;
  rows.push(['t0', await snap()]);
  for (let m = 1; m <= MIN; m++) {
    // 1 dk sim: oyuncu 6 sn'de bir rastgele noktaya gider (durgun + hareketli karışık), sim 1/30 adım, adım süresi ölçülür
    const r = await page.evaluate(() => { const g = __game; let mx = 0, tot = 0; for (let s = 0; s < 10; s++) { const a = Math.random() * 6.28, rad = 3 + Math.random() * 25; g.tp(Math.cos(a) * rad, Math.sin(a) * rad * 0.6); for (let i = 0; i < 180; i++) { const t = performance.now(); g.sim(1 / 30); const d = performance.now() - t; tot += d; if (d > mx) mx = d; } } g.render(); return { mx, avg: tot / 1800 }; });
    worst = Math.max(worst, r.mx);
    if (m % 5 === 0 || m === 1) { const s = await snap(); s.updAvgMs = +r.avg.toFixed(2); s.updMaxMs = +r.mx.toFixed(1); rows.push(['t' + m, s]); console.log('t=' + m + 'dk', JSON.stringify(s), ((Date.now() - t0) / 1000 | 0) + 's'); }
  }
  const a = rows[1][1], z = rows[rows.length - 1][1]; const grow = {}; for (const k of ['nodes', 'geo', 'mat', 'tex', 'dom', 'fx', 'children']) grow[k] = z[k] - a[k];
  console.log('büyüme (t1 -> son):', JSON.stringify(grow), 'heap', a.heapMB, '->', z.heapMB, 'en kötü adım ms', worst.toFixed(1), 'errs', errs);
  await b.close();
})();
