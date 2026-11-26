// (ch1) Karakterler ekranda belirip kaybolmamali: 3 sim dk boyunca musteri/yemek musterisi/mezat alicisi dogarken ve silinirken
// ekran dikdortgeninin (NDC |x|,|y| > 1) DISINDA olmali (sadece 25 sn sonra kucultme/batma guvenligi haric). node tests/popin.js [fixture] [sec]
const h = require('./h.js'), path = require('path');
(async () => {
  const fx = path.resolve(process.argv[2] || path.join(__dirname, 'saves/late-game-all-zones-pre-fix.json')), SEC = +process.argv[3] || 180;
  const { b, page, errs } = await h.open({ q: 'low', fixture: fx, wait: 1500, patch: sv => { sv.ts = Date.now() + 1e6; } });
  const r = await page.evaluate(SEC => {
    window.__resetting = false; const g = __game; g.hideIntro(); const p = g.P().group.position, cam = g.camera, V = cam.position.constructor;
    const ndc = (x, z) => { cam.updateMatrixWorld(); cam.matrixWorldInverse.copy(cam.matrixWorld).invert(); const v = new V(x, 1, z).applyMatrix4(cam.matrixWorldInverse); if (v.z > -0.1) return [9, 9]; v.applyMatrix4(cam.projectionMatrix); return [v.x, v.y]; };
    const on = (x, z) => { const q = ndc(x, z); return Math.abs(q[0]) <= 1 && Math.abs(q[1]) <= 1; };
    const chars = () => { const l = []; for (const c of g.customers) l.push(c); return l; };
    const seen = new Map(), bad = []; let soft = 0, spawned = 0, removed = 0, fades = 0, jumps = 0; const spots = [[0, 3], [10, 20], [-10, 3], [14, 30], [24, 4]]; let si = 0;
    g.tp(...spots[0]); window.__feed = () => {};
    g.sim(2); for (const c of chars()) seen.set(c, null); // baslangictakiler sayilmaz
    for (let i = 0; i < SEC * 10; i++) {
      if (i % 300 === 0) { const s = spots[si++ % spots.length]; g.tp(s[0], s[1]); }
      if (i % 150 === 0) window.__feed(); g.sim(0.1); const cur = new Set(chars()); 
      for (const c of cur) { if (!seen.has(c)) { spawned++; const q = c.group.position; if (on(q.x, q.z)) { if (c.spawnT !== undefined) soft++; else bad.push(['spawn-on-screen', +q.x.toFixed(1), +q.z.toFixed(1), Math.round(i / 10)]); } } const q = c.group.position; seen.set(c, [q.x, q.z, !!(c.fade > 0 || (c.jmp && c.jmp.sink > 0))]); }
      for (const [c, last] of seen) if (!cur.has(c)) { seen.delete(c); if (last === null) continue; removed++; if (last[2]) { fades++; continue; } if (on(last[0], last[1])) bad.push(['remove-on-screen', +last[0].toFixed(1), +last[1].toFixed(1), Math.round(i / 10)]); }
    }
    return { soft, spawned, removed, fades, jumps, bad: bad.slice(0, 10), nbad: bad.length };
  }, SEC);
  console.log(JSON.stringify(r), errs.filter(e => !/vibrate/.test(e)));
  const bad = r.nbad > 0 || r.spawned < 3; console.log(bad ? 'FAIL' : 'PASS'); await b.close(); process.exit(bad ? 1 : 0);
})();
