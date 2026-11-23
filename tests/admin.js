// Gizli yönetici paneli testi (3 bölüm): node tests/admin.js
// Ortam: THREE_DIR (three paketi), NODE_PATH (playwright), BASE (http kökü; yoksa yerel sunucu açılır)
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const THREE = process.env.THREE_DIR || path.dirname(require.resolve('three/package.json'));
const ROOT = path.resolve(__dirname, '..'), MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
(async () => {
  let BASE = process.env.BASE, srv;
  if (!BASE) { srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); const ff = fs.existsSync(f) && fs.statSync(f).isDirectory() ? path.join(f, 'index.html') : f; if (!ff.startsWith(ROOT) || !fs.existsSync(ff)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(ff)] || 'application/octet-stream' }); fs.createReadStream(ff).pipe(r); }); await new Promise(o => srv.listen(0, '127.0.0.1', o)); BASE = 'http://127.0.0.1:' + srv.address().port + '/'; }
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  const CH = [['', 1], ['sahil/', 2], ['ciftlik/', 3]];
  for (const [sub, n] of CH) {
    console.log('--- Bölüm', n);
    const page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(() => { window.__noAuto = true; try { localStorage.setItem('cicek_grafik', 'low'); } catch (e) {} });
    await page.route('**/three.min.js', r => r.fulfill({ path: THREE + '/build/three.min.js', contentType: 'application/javascript' }));
    await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**', r => r.fulfill({ path: THREE + '/examples/js/' + r.request().url().split('examples/js/')[1], contentType: 'application/javascript' }));
    await page.goto(BASE + sub + '?q=low'); await page.waitForTimeout(1200);
    await page.evaluate(() => { try { __game.hideIntro(); } catch (e) {} for (const id of ['storyCard', 'chapCard']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; } });
    const taps = k => page.evaluate(k => { const e = document.getElementById('money'); for (let i = 0; i < k; i++) e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }, k);
    const isOpen = () => page.evaluate(() => __game.admin.isOpen);
    const money = () => page.evaluate(() => __game.S.money);
    // 6 dokunuş açmaz
    await taps(6); ok(!(await isOpen()), 'B' + n + ': 6 dokunuş açmaz');
    await taps(1); ok(await isOpen(), 'B' + n + ': 7 dokunuş PIN kutusunu açar');
    // yanlış PIN sessizce kapanır
    for (const d of '1111') await page.click('#adm .pad button:text-is("' + d + '")'); ok(!(await isOpen()) && !(await page.evaluate(() => localStorage.getItem('cicek_admin'))), 'B' + n + ': yanlış PIN kapanır, admin yok');
    await taps(7);
    for (const d of '2468') await page.click('#adm .pad button:text-is("' + d + '")');
    ok(await isOpen() && await page.$('#adm button[data-ch]'), 'B' + n + ': doğru PIN paneli açar');
    ok(await page.evaluate(() => localStorage.getItem('cicek_admin') === '1'), 'B' + n + ': cicek_admin=1');
    ok(await page.evaluate(n => document.querySelector('#adm button[data-ch="' + n + '"]').disabled, n), 'B' + n + ': mevcut bölüm devre dışı');
    if (n === 1) { await page.screenshot({ path: path.join(ROOT, 'docs', 'admin.png') }); }
    const m0 = await money(); await page.click('#adm button:text-is("+1M")'); const m1 = await money();
    ok(m1 === m0 + 1e6, 'B' + n + ': +1M ' + m0 + ' -> ' + m1);
    await page.click('#adm button:text-is("+100K")'); await page.click('#adm button:text-is("+10M")'); ok(await money() === m1 + 1.01e7, 'B' + n + ': +100K/+10M');
    // sınırsız para
    await page.click('#adm button[data-k="inf"]');
    ok(await page.evaluate(n => JSON.parse(localStorage.getItem('cicek_admin_inf'))[n] === true, n), 'B' + n + ': inf bayrağı kayıtlı');
    await page.evaluate(() => { __game.S.money = 5; }); await page.waitForTimeout(400);
    ok(await money() >= 9.99e8, 'B' + n + ': sınırsız para para düşmez (' + await money() + ')');
    await page.evaluate(() => { __game.S.money -= 5e8; }); await page.waitForTimeout(400);
    ok(await money() >= 9.99e8, 'B' + n + ': harcama sonrası tekrar dolar');
    await page.click('#adm button:text-is("Kapat")'); ok(!(await isOpen()), 'B' + n + ': Kapat');
    // kayıt dosyasında inf yok: kayıt anahtarlarında 'cicek_admin' geçmez
    // admin hatırlanır: 7 dokunuş PIN'siz panel
    await taps(7);
    ok(await isOpen() && await page.$('#adm button[data-ch]'), 'B' + n + ': admin kayıtlıyken PIN yok');
    // bölüm geçişleri
    for (const [, m] of CH) { if (m === n) continue;
      const exp = { 1: '/', 2: '/sahil/', 3: '/ciftlik/' }[m];
      if (!(await isOpen())) await taps(7);
      await Promise.all([page.waitForURL(u => u.pathname.endsWith(exp), { timeout: 8000 }).then(() => true).catch(() => false).then(r => ok(r, 'B' + n + ' -> B' + m + ' gezindi')), page.click('#adm button[data-ch="' + m + '"]')]);
      await page.goto(BASE + sub + '?q=low'); await page.waitForTimeout(1200);
    }
    // çıkış
    await taps(7);
    await page.click('#adm button:text-is("Admin\'den çık")');
    ok(await page.evaluate(() => localStorage.getItem('cicek_admin') === null && localStorage.getItem('cicek_admin_inf') === null), 'B' + n + ": Admin'den çık anahtarları siler");
    ok(errs.length === 0, 'B' + n + ' konsol hatası yok ' + JSON.stringify(errs.slice(0, 3)));
    await page.context().close();
  }
  await b.close(); if (srv) srv.close(); console.log(fails ? fails + ' FAIL' : 'ALL OK'); process.exit(fails ? 1 : 0);
})();
