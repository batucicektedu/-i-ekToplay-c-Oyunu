// iPhone emülasyonu (Bölüm 1): canvas ve #app tam pencere yüksekliğini kaplamalı, altta boş şerit olmamalı. node tests/viewport.js
const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright'), path = require('path');
const SP = process.env.THREE_ROOT || '/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad';
const URL = process.env.GAME || 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist'] }), bad = [];
  for (const [n, dev] of [['iPhone 13', devices['iPhone 13']], ['iPhone 15 Pro', Object.assign({}, devices['iPhone 13'], { viewport: { width: 393, height: 659 }, screen: { width: 393, height: 852 } })]]) {
    const ctx = await b.newContext(dev), page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(() => { window.__noAuto = true; });
    await page.route('**/three.min.js', r => r.fulfill({ path: SP + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**', r => { const u = r.request().url().split('examples/js/')[1]; r.fulfill({ path: SP + '/node_modules/three/examples/js/' + u, contentType: 'application/javascript' }); });
    await page.goto(URL); await page.waitForTimeout(1500);
    const m = () => page.evaluate(() => { const c = document.getElementById('c').getBoundingClientRect(), a = document.getElementById('app').getBoundingClientRect(); return { ih: innerHeight, cb: c.bottom, ab: a.bottom, bufH: document.getElementById('c').height, dpr: Math.min(devicePixelRatio, 1.5) }; });
    for (const [tag, vs] of [['dik', null], ['yatay', { width: dev.viewport.height, height: dev.viewport.width }]]) {
      if (vs) { await page.setViewportSize(vs); await page.waitForTimeout(500); }
      const r = await m(); console.log(n, tag, JSON.stringify(r));
      if (r.cb < r.ih - 0.5 || r.ab < r.ih - 0.5) bad.push(n + ' ' + tag + ': canvas/app penceredan kısa');
      if (Math.abs(r.bufH - r.ih * r.dpr) > 2) bad.push(n + ' ' + tag + ': çizim tamponu yüksekliği uyumsuz');
    }
    if (errs.length) bad.push('hata ' + errs[0]); await ctx.close();
  }
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'PASS'); await b.close(); process.exit(bad.length ? 1 : 0);
})();
