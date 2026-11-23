// Titreme (flicker) testi, Bölüm 3 (Çiftlik): node tests/ciftlik/flicker.js   (GAME=http://localhost:PORT/index.html önerilir)
// 1) sabit kameralarda 30 kare: ardışık kare farkı = 0 olmalı (sim durdurulmuş)
// 2) mikro-kayma testi: kamera 0.003 birim oynar; z-fighting alanları büyük renk sıçraması verir
// 3) sim açık + oyuncu pad sınırında: pad görünürlük değişimi ve ipucu hedefi değişimi <= 1 / 2 sn
// 4) statik tarama: yatay düzlemleri <0.02 y farkıyla örtüşen mesh çiftleri
const fs = require('fs'), path = require('path'), h = require('./h.js'), scan = require('../flicker_scan.js');
const OUT = path.join(__dirname, '..', '..', 'docs', 'qa'), TAG = process.env.TAG || 'after', FIX = process.env.FIX || path.join(__dirname, 'saves', 'c3-v8-all.json');
(async () => {
  const bad = [], note = m => { console.log(m); };
  const { b, page, errs } = await h.open({ q: process.env.Q || 'high', fixture: FIX, wait: 1500, w: +(process.env.W || 300), h: +(process.env.H || 520) });
  await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); __game.sim(2); });
  // ---- 4) tarama ----
  const sc = await page.evaluate('(' + scan.toString() + ')({visOnly:true})');
  const un = sc.pairs.filter(p => !p.safe && p.area >= 0.1);
  note('tarama: ' + sc.flats + ' ince mesh, ' + sc.pairs.length + ' aday cift, korumasiz ' + un.length);
  for (const p of un.slice(0, 40)) note('  ' + JSON.stringify(p));
  if (un.length) bad.push('coplanar ' + un.length);
  // ---- 1+2) sabit kamera ----
  const spots = await page.evaluate(NS => { const zs = __game.zones.map(z => [z.x, z.z]).filter(p => isFinite(p[0]) && isFinite(p[1])), pick = [[-5.5, 2.6], [3.6, 3.3]]; for (const z of zs) if (pick.every(q => Math.hypot(q[0] - z[0], q[1] - z[1]) > 11)) pick.push(z); return pick.slice(0, NS); }, +(process.env.SPOTS || 8));
  note('kamera noktasi: ' + spots.length);
  const grab = `(() => { const g = __game; return (jit) => { const c = g.camera; const ox = c.position.x; c.position.x += jit; c.updateMatrixWorld(true); g.render(); const src = document.getElementById('c') || document.querySelector('canvas'); const w = src.width, hh = src.height; let cv = window.__cv; if (!cv) { cv = window.__cv = document.createElement('canvas'); } cv.width = w; cv.height = hh; const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0); c.position.x = ox; c.updateMatrixWorld(true); return x.getImageData(0, 0, w, hh).data; }; })()`;
  let idx = 0;
  for (const sp of (process.env.DYNONLY ? [] : spots)) {
    const r = await page.evaluate(([x, z, grabSrc]) => {
      window.__freeze = true; __game.camAt(x, z); const grab = eval(grabSrc);
      const N = 30, cnt = (a, b, th) => { let n = 0; for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); if (d > th) n++; } return n; };
      let prev = grab(0), stat = 0, maxStat = 0; for (let i = 1; i < N; i++) { const cur = grab(0); const n = cnt(prev, cur, 6); maxStat = Math.max(maxStat, n); stat += n; prev = cur; }
      // mikro-kayma: 0 ve +0.003 arasinda 10 cift
      let jmax = 0; for (let i = 0; i < 4; i++) { const A = grab(0), B = grab(0.003 * (1 + i * 0.3)); jmax = Math.max(jmax, cnt(A, B, 60)); }
      window.__freeze = false; return { maxStat, jmax, px: prev.length / 4 };
    }, [sp[0], sp[1], grab]);
    note(`  [${idx}] (${sp[0].toFixed(1)},${sp[1].toFixed(1)}) sabit-fark max ${r.maxStat}  mikro-kayma sicrama ${r.jmax} (${(100 * r.jmax / r.px).toFixed(3)}%)`);
    if (r.maxStat > 0) bad.push('static diff @' + idx + ' ' + r.maxStat);
    if (r.jmax / r.px > 0.006) bad.push('jitter @' + idx + ' ' + r.jmax);
    if (idx < 6 || process.env.SHOTS) { await page.evaluate(() => { window.__freeze = true; }); await h.shot(page, path.join(OUT, `flicker_ciftlik_${TAG}_${idx}`)); }
    idx++;
  }
  await page.evaluate(() => { window.__freeze = false; });
  if (errs.length) bad.push('errors ' + errs[0]);
  await b.close();
  // ---- 3) dinamik (orta oyun kaydi: pad esikleri hareketli) ----
  const D = await h.open({ q: 'low', fixture: process.env.FIXD || path.join(__dirname, 'saves', 'c3-v10-auto.json'), wait: 1500, w: 300, h: 520 });
  const page2 = D.page; await page2.evaluate(() => { window.__resetting = false; __game.hideIntro(); __game.sim(2); });
  const dyn = await page2.evaluate(async () => {
    const g = __game, ups = g.upPads, keys = Object.keys(ups); g.hideIntro();
    const tog = {}, vis = {}, hint = []; let lastH = null, hs = 0, simT = 0;
    const route = [[-5.5, 2.6], [8, 4], [8, 18], [-5, 10], [20, -10], [3, 3]]; let ri = 0;
    let trackH = true; const step = () => {
      const P = g.P(); const tgt = route[ri % route.length]; const dx = tgt[0] - P.group.position.x, dz = tgt[1] - P.group.position.z;
      if (Math.hypot(dx, dz) < 1.5) ri++; g.bot(tgt[0], tgt[1]);
      const p0 = g.P().group.position.clone(); g.sim(1 / 30); simT += 1 / 30; const moved = p0.distanceTo(g.P().group.position) > 0.05; if (moved) lastH = null; // yurume sirasinda hedefin yanindan gecmek titreme degil
      for (const k of keys) { const v = !!ups[k].group.visible; if (k in vis && vis[k] !== v) (tog[k] = tog[k] || []).push(+simT.toFixed(2)); vis[k] = v; }
      const s = g.hintState(), ro = g.objective(), sig =  (s.arrow ? 1 : 0) + '|' + s.lb + '|' + s.x.toFixed(1) + '|' + s.z.toFixed(1) + '|' + s.disp;
      if (moved || !trackH || lastH === null) lastH = trackH && !moved ? sig : null; else if (sig !== lastH) { hint.push(+simT.toFixed(2)); hint.sigs = (hint.sigs || []); (window.__hs = window.__hs || []).push(simT.toFixed(2) + ' ' + sig + ' P' + g.P().group.position.x.toFixed(1) + ',' + g.P().group.position.z.toFixed(1) + ' m' + (g.S.money | 0) + ' hold' + s.hold.toFixed(2) + ' raw' + ro.x.toFixed(1) + ',' + ro.z.toFixed(1)); lastH = sig; }
    };
    const scen = (name, fn, frames) => { trackH = name !== 'walk'; lastH = null; for (let i = 0; i < frames; i++) { fn(i); step(); } };
    // A) hedef pad'in satin alinabilirligi esikte dalgalanir (gelir/harcama) + cok pad esikleri
    scen('money', i => { if (i % 15 === 0) { const gk = g.goal && g.goal.key, u = gk && ups[gk]; const c = u ? u.cost() : 100; g.S.money = (i % 30 ? 0.9 : 1.05) * c; } }, 30 * 20);
    // B) oyuncu gorunur pad'lerin kenarinda ileri geri (inside degisir -> 4 pad limiti oynar)
    const vis0 = keys.filter(k => ups[k].group.visible && !ups[k].done);
    for (const k of vis0) { const u = ups[k]; scen('edge', i => { g.S.money = Math.max(g.S.money, 50); const off = (Math.floor(i / 5) % 2 ? 1 : -1) * 0.12; g.bot(0, 0); g.bot(); g.tp(u.x + u.w / 2 + off, u.z); }, 30 * 6); }
    // D) oyuncu ipucu hedefinin 'yakin' yaricapi sinirinda ileri geri
    { const hs0 = g.hintState(); if (hs0.arrow) scen('near', i => { const off = (Math.floor(i / 5) % 2 ? 1 : -1) * 0.25; g.tp(hs0.x + 1.55 + off, hs0.z); }, 30 * 6); }
    // C) esik para dalgalanmasi, oyuncu yuruyor
    scen('walk', i => { if (i % 90 === 0) g.S.money = Math.max(0, g.S.money * (i % 180 ? 0.35 : 3)); const tgt = route[Math.floor(i / 120) % route.length]; g.bot(tgt[0], tgt[1]); }, 30 * 30);
    return { tog, hint, hs: window.__hs };
  });
  let worst = 99; for (const k in dyn.tog) { const t = dyn.tog[k]; for (let i = 1; i < t.length; i++) worst = Math.min(worst, t[i] - t[i - 1]); }
  note('pad gorunurluk degisimi: ' + JSON.stringify(Object.fromEntries(Object.entries(dyn.tog).map(([k, v]) => [k, v.length]))) + '  en kisa aralik ' + worst + ' sn');
  let hw = 99; for (let i = 1; i < dyn.hint.length; i++) hw = Math.min(hw, dyn.hint[i] - dyn.hint[i - 1]);
  if (hw < 2) console.log('  ipucu gecisleri: ' + JSON.stringify(dyn.hs));
  note('ipucu hedefi degisimi: ' + dyn.hint.length + ' kez, en kisa aralik ' + hw + ' sn');
  if (worst < 2) bad.push('pad toggle <2s: ' + worst);
  if (hw < 2 - 1e-6) bad.push('hint change <2s: ' + hw);
  if (D.errs.length) bad.push('errors ' + D.errs[0]);
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'PASS'); await D.b.close(); process.exit(bad.length ? 1 : 0);
})();
