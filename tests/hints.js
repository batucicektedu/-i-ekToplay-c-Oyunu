// Ipucu (ok/iz) doğrulama testi: node tests/hints.js
const fs = require('fs'), path = require('path'), h = require('./h.js');
const FIX = (process.env.FIX ? process.env.FIX.split(',') : ['saves/c6-v6.json', 'saves/late-game-all-zones-pre-fix.json', 'max.json']);
const CARRY = ['none', 'bouquet', 'pot', 'sachet', 'perfume', 'sbq', 'tea', 'orchid', 'lav', 'sun', 'rosep', 'flower', 'mixprod', 'mixraw'];
(async () => {
  let total = 0, bad = [], errsAll = 0; const kinds = {};
  for (const f of FIX) {
    const { b, page, errs } = await h.open({ q: 'low', fixture: path.join(__dirname, f), wait: 1200 });
    await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); });
    const r = await page.evaluate((CARRY) => {
      const g = __game, P = g.P(), res = { n: 0, bad: [], kinds: {} }, PL = ['bouquet', 'pot', 'sachet', 'perfume', 'sbq'];
      const cnt = t => P.stack.count(t);
      const chk = (o, tag) => {
        if (!o.ok) return; res.n++; res.kinds[o.kind] = (res.kinds[o.kind] || 0) + 1; let why = null; const city = g.city(), wed = g.wed(), cafe = g.cafe();
        switch (o.kind) {
          case 'city': if (!city || city.z.locked) why = 'city locked'; else if (!PL.some(t => cnt(t) > 0 && city.stock.count(t) < 4) || city.stock.length + (city.stock.pend || 0) >= 28) why = 'city cannot accept carried ' + JSON.stringify(PL.map(t => [t, cnt(t), city.stock.count(t)])); break;
          case 'counter': if (!PL.some(t => cnt(t) > 0 && g.hintOK.canCounter(t))) why = 'counter cannot accept'; else if (g.cashier && !PL.some(t => cnt(t) > 0 && g.hintOK.canCounter(t))) why = 'shelf full'; break;
          case 'wed': if (!wed || wed.z.locked || !wed.ord || !PL.some(t => cnt(t) > 0 && (wed.ord.got[t] || 0) < (wed.ord.need[t] || 0)) && !g.c3x().PORT) why = 'wed not accepted'; break;
          case 'tea': if (cnt('tea') <= 0 || !g.hintOK.canTable()) why = 'tea'; break;
          case 'drop': { const ok = g.STN && Object.values(g.STN).some(sn => !sn.zone.locked && sn.ins.some(q => cnt(q.type) > 0 && q.stack.length + (q.stack.pend || 0) < 24 && Math.abs(q.zone.x - o.x) < 0.01 && Math.abs(q.zone.z - o.z) < 0.01)); if (!ok) why = 'drop: no station input takes carried type'; break; }
          case 'pot': if (cnt('orchid') <= 0 || !g.zone2 || g.zone2.locked) why = 'pot'; break;
          case 'pack': if (cnt('flower') <= 0 && false) why = 'pack'; break;
          case 'out': if (!g.outputPile.length || P.free() <= 0) why = 'out empty/full'; break;
          case 'potOut': if (!g.potOutput.length || P.free() <= 0) why = 'potOut empty'; break;
          case 'money': break;
        }
        if (['harvest', 'take', 'out', 'potOut', 'comb'].includes(o.kind) && P.free() <= 0) why = o.kind + ' but hands full';
        if (why) res.bad.push([tag, o.kind, why]);
      };
      const rnd = (() => { let s = 12345; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
      const spots = [[-5.5, 2.6], [20, -60], [-10, -130]];
      for (const tag of CARRY) for (const capState of ['normal', 'cityFull', 'shelfFull', 'bothFull']) for (let rep = 0; rep < 2; rep++) {
        while (P.stack.length) P.stack.items.pop();
        const gv = tag === 'mixprod' ? PL : tag === 'mixraw' ? ['lav', 'orchid', 'sun', 'rosep', 'flower'] : tag === 'none' ? [] : [tag];
        for (const t of gv) g.give(t, 4);
        const city = g.city(); if (city && (capState === 'cityFull' || capState === 'bothFull')) for (const t of PL) while (city.stock.count(t) < 4 && city.stock.length < 27) city.stock.add(g.hintOK.makeItemOf(t), t);
        if (capState === 'shelfFull' || capState === 'bothFull') { for (const t of PL) { const L = g.hintOK.lane(t); let k = 0; while (g.hintOK.shelfFree(t) > 0 && k++ < 60) L.add(g.hintOK.makeItemOf(t), t); } }
        for (const sp of spots) { g.tp(sp[0] + rnd(), sp[1] + rnd()); for (let i = 0; i < 2; i++) { g.S.money = 0; g.sim(0.05); g.S.money = 0; const o = g.objective(); chk(o, tag + '/' + capState); } }
      }
      return res;
    }, CARRY);
    total += r.n; for (const k in r.kinds) kinds[k] = (kinds[k] || 0) + r.kinds[k];
    console.log(f, 'samples', r.n, 'bad', r.bad.length, 'errs', errs.length); for (const x of r.bad.slice(0, 8)) console.log('  BAD', JSON.stringify(x));
    bad.push(...r.bad); errsAll += errs.length; if (errs.length) console.log(errs.slice(0, 3)); await b.close();
  }
  console.log('TOTAL samples', total, 'invalid', bad.length, 'consoleErrors', errsAll, JSON.stringify(kinds));
  process.exit(bad.length || errsAll ? 1 : 0);
})();
