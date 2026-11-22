// İpucu (ok/iz) doğrulama testi: her ipucu hedefi o an gerçekten işe yaramalı. node tests/sahil/hints.js
const path = require('path'), h = require('./h.js');
const FIX = process.env.FIX ? process.env.FIX.split(',') : ['saves/sahil-mid-v8.json', 'saves/sahil-late-v8.json', 'saves/sahil-end-v8.json'];
const CARRY = ['none', 'bouquet', 'pot', 'flower', 'shrimp', 'crab', 'mixprod', 'mixall'];
(async () => {
  let total = 0, bad = [], errsAll = 0; const kinds = {};
  for (const f of FIX) {
    const { b, page, errs } = await h.open({ q: 'low', fixture: path.join(__dirname, f), wait: 1200, patch: sv => { sv.ts = Date.now() + 1e6; } });
    await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); });
    const r = await page.evaluate((CARRY) => {
      const g = __game, P = g.P(), res = { n: 0, bad: [], kinds: {} }, PL = ['bouquet', 'pot'];
      const cnt = t => P.stack.count(t);
      const chk = (o, tag) => {
        if (!o.ok) return; res.n++; res.kinds[o.kind] = (res.kinds[o.kind] || 0) + 1; let why = null;
        const near = (a, bb) => Math.abs(a.x - bb.x) < 0.5 && Math.abs(a.z - bb.z) < 0.9;
        switch (o.kind) {
          case 'counter': if (!PL.some(t => cnt(t) > 0 && g.hintOK.canCounter(t))) why = 'counter cannot accept'; break;
          case 'eat': { const ok = g.EATS.some(e => e.active && near(e.inZone, o) && [e.o.inType, e.o.inType2].some(t => t && cnt(t) > 0) && e.input.length + (e.input.pend || 0) < 24); if (!ok) why = 'eat: no eatery takes carried type'; break; }
          case 'hall': if (!g.HALL.active || cnt('bouquet') <= 0 || g.HALL.stock.length >= 40) why = 'hall'; break;
          case 'cage': if (!g.CAGES.some(c => near(c.zone, o) && c.tray.length > 0) || P.free() <= 0) why = 'cage tray empty/full hands'; break;
          case 'dock': if (!g.DOCK.stack.length || P.free() <= 0) why = 'dock empty/full hands'; break;
          case 'out': if (!g.outputPile.length || P.free() <= 0) why = 'out empty/full'; break;
          case 'potOut': if (!g.potOutput.length || P.free() <= 0) why = 'potOut empty'; break;
          case 'pot': if (cnt('orchid') <= 0 || !g.zone2 || g.zone2.locked) why = 'pot'; break;
          case 'money': break;
        }
        if (['harvest', 'take', 'out', 'potOut', 'cage', 'dock'].includes(o.kind) && P.free() <= 0) why = o.kind + ' but hands full';
        if (why) res.bad.push([tag, o.kind, why]);
      };
      const rnd = (() => { let s = 12345; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
      const spots = [[-5.5, 2.6], [40, 25], [-14, 30], [30, 38]];
      for (const tag of CARRY) for (const full of [false, true]) for (let rep = 0; rep < 2; rep++) {
        while (P.stack.length) P.stack.items.pop();
        const gv = tag === 'mixprod' ? PL : tag === 'mixall' ? ['bouquet', 'pot', 'flower', 'shrimp', 'crab'] : tag === 'none' ? [] : [tag];
        for (const t of gv) g.give(t, 4);
        if (full) { for (const e of g.EATS) while (e.input.length < 24) e.input.add(g.hintOK.makeItemOf(e.o.inType), e.o.inType); while (g.HALL.stock.length < 40) g.HALL.stock.add(g.hintOK.makeItemOf('bouquet'), 'bouquet'); }
        for (const sp of spots) { g.tp(sp[0] + rnd(), sp[1] + rnd()); for (let i = 0; i < 2; i++) { g.S.money = 0; g.sim(0.05); g.S.money = 0; const o = g.objective(); chk(o, tag + '/' + full); } }
      }
      return res;
    }, CARRY);
    total += r.n; for (const k in r.kinds) kinds[k] = (kinds[k] || 0) + r.kinds[k];
    console.log(f, 'samples', r.n, 'bad', r.bad.length, 'errs', errs.length); for (const x of r.bad.slice(0, 8)) console.log('  BAD', JSON.stringify(x));
    bad.push(...r.bad); errsAll += errs.filter(e => !/vibrate/.test(e)).length; await b.close();
  }
  console.log('TOTAL samples', total, 'invalid', bad.length, 'consoleErrors', errsAll, JSON.stringify(kinds));
  process.exit(bad.length || errsAll ? 1 : 0);
})();
