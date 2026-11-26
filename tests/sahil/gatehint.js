// Rehber oku/ipucu "SIRADAKİ BÖLÜME GEÇ" kapısını (Hayvan Çiftliği pad'i) bütün diğer hedefler bitmeden göstermemeli.
// 1) mid/late/end/v9/v10 örnek kayıtlarında (hiçbirinde her şey maksimum değil): hedef ve ok asla kapı olmamalı, bol parayla bile.
// 2) her pad maksimumda (kapı hariç) sentetik kayıtta: hedef kapı olmalı. Calistir: NODE_PATH=... node tests/sahil/gatehint.js
const path = require('path'), fs = require('fs'), h = require('../auto/_h.js');
const FIX = ['sahil-mid-v8', 'sahil-late-v8', 'sahil-end-v8', 'sahil-v9', 'sahil-v10', 'sahil-v11'];
(async () => {
  const bad = [];
  for (const f of FIX) {
    const fx = path.join(__dirname, 'saves', f + '.json');
    for (const money of [0, 5e6]) {
      const { b, page, errs } = await h.open('sahil', { fixture: fx, wait: 1200, patch: sv => { sv.ts = Date.now() + 1e6; sv.money = money; } });
      const r = await page.evaluate(() => {
        window.__resetting = false; const g = __game; g.hideIntro(); const gate = g.allPads().find(p => p.key === 'gate'), out = { n: 0, goalGate: 0, hintGate: 0, goals: {} };
        for (let i = 0; i < 40; i++) { g.sim(1.5); const o = g.objective(), cg = g.goal; out.n++; if (cg && cg.key === 'gate') out.goalGate++; if (o.ok && Math.hypot(o.x - gate.x, o.z - gate.z) < 3) out.hintGate++; if (cg) out.goals[cg.key] = 1; }
        out.gateLv = g.S.lv.gate; return out;
      });
      console.log(f, 'money', money, JSON.stringify({ n: r.n, goalGate: r.goalGate, hintGate: r.hintGate, goal: Object.keys(r.goals).slice(0, 4) }));
      if (r.goalGate || r.hintGate) bad.push(f + ' money=' + money + ' goalGate=' + r.goalGate + ' hintGate=' + r.hintGate);
      const ee = errs.filter(e => !/vibrate/.test(e)); if (ee.length) bad.push(f + ' errors ' + ee[0]);
      await b.close();
    }
  }
  // sentetik: her şey maksimum
  { const { b, page, errs } = await h.openAll('sahil', { fixture: path.join(__dirname, 'saves', 'sahil-end-v8.json'), patch: sv => { sv.money = 5e6; } });
    const r = await page.evaluate(() => {
      window.__resetting = false; const g = __game; g.hideIntro(); g.tp(-60, 3); g.sim(6); const gate = g.allPads().find(p => p.key === 'gate'), o = g.objective(), cg = g.goal;
      return { goal: cg && cg.key, ok: o.ok, kind: o.kind, near: o.ok && Math.hypot(o.x - gate.x, o.z - gate.z) < 3, gateVisible: gate.group.visible };
    });
    console.log('hepsi maksimum', JSON.stringify(r));
    if (r.goal !== 'gate') bad.push('hepsi maksimumda hedef kapi degil: ' + r.goal);
    if (!r.near) bad.push('hepsi maksimumda ipucu kapiyi gostermiyor ' + JSON.stringify(r));
    const ee = errs.filter(e => !/vibrate/.test(e)); if (ee.length) bad.push('errors ' + ee[0]); await b.close(); }
  console.log(bad.length ? 'FAIL\n' + bad.join('\n') : 'GATEHINT PASS'); process.exit(bad.length ? 1 : 0);
})();
