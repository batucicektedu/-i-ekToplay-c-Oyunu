// Yardim kurali: ayni isci 3 sn'den sik rol/yardim degistirmemeli (salinim yok). node tests/sahil/helpsw.js [fixture] [sec]
const h = require('./h.js'), path = require('path');
(async () => {
  const fx = path.resolve(process.argv[2] || path.join(__dirname, 'saves/sahil-end-v8.json')), SEC = +process.argv[3] || 600;
  const { b, page, errs } = await h.open({ q: 'low', fixture: fx, wait: 1500, patch: sv => { sv.ts = Date.now() + 1e6; } });
  const r = await page.evaluate(SEC => { window.__resetting = false; const g = __game; g.hideIntro(); g.tp(24, 4); const p = g.P().group.position; const m0 = g.S.money;
    for (let i = 0; i < SEC * 10; i++) { g.sim(0.1); p.x = 24; p.z = 4; }
    return { sw: g.stats.helpSw || 0, minGap: g.stats.helpMinGap === undefined ? null : +g.stats.helpMinGap.toFixed(2), earned: Math.round(g.S.money - m0) }; }, SEC);
  console.log(JSON.stringify(r), errs.filter(e => !/vibrate/.test(e)));
  const bad = r.minGap !== null && r.minGap < 3; console.log(bad ? 'FAIL' : 'PASS'); await b.close(); process.exit(bad ? 1 : 0);
})();
