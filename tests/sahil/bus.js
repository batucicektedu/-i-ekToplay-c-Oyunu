// Tur Otobusu: ekran disinda gelir/gider (pop-in yok), 6-8 yolcu birakir, ihracat gemisi su uzerinde. node tests/sahil/bus.js  (SHOT=1 -> docs/sahil/demand_bus.png)
const path = require('path'), h = require('./h.js');
(async () => {
  const { b, page, errs } = await h.open({ q: 'low', fixture: path.join(__dirname, 'saves', 'sahil-v10.json'), wait: 1200, patch: sv => { sv.ts = Date.now() + 1e6; sv.lv.tbus = 1; sv.lv.cashier = 1; } });
  const r = await page.evaluate(async () => {
    window.__resetting = false; const g = __game; g.hideIntro(); g.tp(0, -2); const B = g.BUS, cam = g.camera, V = new cam.position.constructor(), out = { log: [], pax: 0, visibleAtSpawn: null, leaveVisible: null, maxQueue: 0 };
    const proj = (x, z) => { cam.updateMatrixWorld(); V.set(x, 1.5, z).project(cam); return Math.abs(V.x) <= 1.05 && Math.abs(V.y) <= 1.05 && V.z <= 1; };
    g.sim(1); B.t = 61; let seen = {}, prev = B.st, c0 = g.stats.busPax || 0;
    for (let i = 0; i < 60 * 30; i++) {
      g.sim(1 / 30); const p = g.P().group.position; p.x = 0; p.z = -2;
      if (B.st !== prev) { out.log.push([prev + '>' + B.st, +B.z.toFixed(1), Math.round(i / 30)]); if (prev === 'away' && B.st === 'in') out.visibleAtSpawn = proj(B.x, B.z); prev = B.st; }
      if (B.g.visible && proj(B.x, B.z)) out.onScreen = (out.onScreen || 0) + 1;
      out.maxQueue = Math.max(out.maxQueue, g.queue.length);
      if (B.st === 'away' && i > 60) break;
    }
    out.pax = (g.stats.busPax || 0) - c0; out.hidden = !B.g.visible;
    const S = g.SHIP; out.ship = { st: S.st, water: g.isWater(54.2, -1) };
    return out;
  });
  console.log(JSON.stringify(r));
  const bad = []; if (r.visibleAtSpawn) bad.push('otobus ekranda belirdi'); if (r.onScreen) bad.push('otobus ekranda gorundu ' + r.onScreen); if (r.pax < 6 || r.pax > 8) bad.push('yolcu ' + r.pax); if (!r.hidden) bad.push('otobus gitmedi'); if (!r.ship.water) bad.push('gemi yeri su degil');
  const ee = errs.filter(e => !/vibrate/.test(e)); if (ee.length) bad.push('errors ' + ee[0]);
  if (process.env.SHOT) {
    await page.evaluate(() => { const g = __game; g.BUS.t = 61; g.tp(0, -2); for (let i = 0; i < 90 && g.BUS.st === 'away'; i++) g.sim(1 / 30); g.tp(8, 27); g.sim(0.1); for (let i = 0; i < 400 && g.BUS.st !== 'stop'; i++) g.sim(1 / 30); g.sim(1.6); });
    await h.shot(page, path.resolve(__dirname, '../../docs/sahil/demand_bus'));
  }
  console.log(bad.length ? 'FAIL\n' + bad.join('\n') : 'BUS PASS'); await b.close(); process.exit(bad.length ? 1 : 0);
})();
