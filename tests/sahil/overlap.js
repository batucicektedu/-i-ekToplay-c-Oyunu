// Iscilerin ust uste durmamasi: sahil-v9 kaydi, 5 sim dk; herhangi iki isci <0.6 birim mesafede 2 sn'den uzun kalmamali.
// node tests/sahil/overlap.js
const h = require('./h.js'), path = require('path');
(async () => {
  const { b, page, errs } = await h.open({ q: 'low', fixture: path.resolve(__dirname, 'saves/sahil-v9.json'), wait: 1500, patch: sv => { sv.ts = Date.now() + 1e6; } });
  const r = await page.evaluate(() => {
    window.__resetting = false; const g = __game; g.hideIntro(); g.tp(24, 4); const P = g.P().group.position;
    const workers = () => { const l = []; const add = (w, n) => { if (w && w.group && w.group.visible !== false) l.push([n, w]); };
      add(g.helper(), 'helper'); add(g.cashier, 'cashier'); add(g.carrier, 'carrier'); (g.GARD || []).forEach((w, i) => add(w, 'gard' + i)); (g.SVCW || []).forEach((w, i) => add(w, 'svc' + i)); return l; };
    const pairT = {}; let worst = 0, worstPair = '', n = 0, cnt = 0;
    for (let i = 0; i < 3000; i++) { g.sim(0.1); P.x = 24; P.z = 4; const l = workers(); cnt = Math.max(cnt, l.length);
      for (let a = 0; a < l.length; a++) for (let c = a + 1; c < l.length; c++) { const A = l[a][1].group.position, B = l[c][1].group.position, k = l[a][0] + '|' + l[c][0];
        if (Math.hypot(A.x - B.x, A.z - B.z) < 0.6) { pairT[k] = (pairT[k] || 0) + 0.1; if (pairT[k] > worst) { worst = pairT[k]; worstPair = k; } } else pairT[k] = 0; } }
    return { worst: +worst.toFixed(1), worstPair, workers: cnt };
  });
  console.log(JSON.stringify(r), errs.filter(e => !/vibrate/.test(e)));
  const bad = r.worst > 2; console.log(bad ? 'FAIL' : 'PASS'); await b.close(); process.exit(bad ? 1 : 0);
})();
