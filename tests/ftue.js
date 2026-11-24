// FTUE: taze kayıttan ilk 5 dk. node tests/ftue.js [w] [h] [tag]  -> docs/release/ch1_ftue_<tag>_NN_*.png
const h = require('./h.js'), path = require('path');
(async () => {
  const w = +process.argv[2] || 390, hh = +process.argv[3] || 844, tag = process.argv[4] || (w + 'x' + hh);
  const { b, page, errs } = await h.open({ q: 'low', w, h: hh, wait: 1200, noRaf: true });
  const out = n => path.resolve(__dirname, '../docs/release/ch1_ftue_' + tag + '_' + n);
  let k = 0; const shot = async name => { await h.shot(page, out(String(++k).padStart(2, '0') + '_' + name)); };
  await page.evaluate(() => __game.sim(0.2));
  await shot('story');
  await page.evaluate(() => document.getElementById('storyGo').click()); await page.waitForTimeout(300);
  await shot('intro');
  const log = []; let simT = 0, lastKind = null, lastGoal = null, noHint = 0, firstSeen = {};
  const snap = () => page.evaluate(() => { const g = __game, o = g.objective(), hs = g.hintState(), st = g.stats; return { o, hs, money: Math.round(g.S.money), tut: g.S.tut, goal: g.goal && g.goal.key, st: Object.assign({}, st), hintDisp: document.getElementById('hint').style.display, hintTxt: document.getElementById('hintT').textContent, goalDisp: document.getElementById('goal').style.display, goalTxt: document.getElementById('goalN').textContent + ' ' + document.getElementById('goalP').textContent, cap: document.getElementById('capV').textContent }; });
  // oyuncu "kaydırır": intro'yu kapatmak için bot
  await page.evaluate(() => { __game.hideIntro(); });
  for (let i = 0; i < 2000 && simT < (+process.argv[5] || 300); i++) {
    const s = await snap();
    if (s.o.ok) { noHint = 0; await page.evaluate(([tx, tz]) => { const g = __game, gp = g.P().group.position, d = Math.hypot(tx - gp.x, tz - gp.z); if (d < 0.5) { g.bot(0, 0); return; } const pth = g.path(tx, tz); let w = pth[pth.length - 1]; for (let q = 1; q < pth.length; q++) if (Math.hypot(pth[q][0] - gp.x, pth[q][1] - gp.z) > 0.6) { w = pth[q]; break; } const dx = w[0] - gp.x, dz = w[1] - gp.z, l = Math.hypot(dx, dz) || 1; g.bot(dx / l, dz / l); }, [s.o.x, s.o.z]); } else { noHint += 0.25; await page.evaluate(() => __game.bot(0, 0)); }
    const key = s.o.ok ? s.o.kind : 'none';
    if (key !== lastKind) { log.push(simT.toFixed(1) + 's ' + key + ' money=' + s.money + ' tut=' + s.tut + ' hint=' + s.hintDisp + ':' + s.hintTxt + ' goal=' + s.goalTxt + ' cap=' + s.cap); lastKind = key; if (!firstSeen[key] && key !== 'none') { firstSeen[key] = 1; await shot('hint_' + key); } }
    if (Math.abs(noHint - 3) < 0.01) { log.push(simT.toFixed(1) + 's !! 3 sn ipucu yok money=' + s.money); await shot('nohint'); }
    if (s.goal !== lastGoal) { log.push(simT.toFixed(1) + 's GOAL -> ' + s.goal); lastGoal = s.goal; if (s.goal) await shot('goal_' + s.goal); }
    await page.evaluate(() => __game.sim(0.25)); simT += 0.25;
  }
  const f = await snap(); console.log(log.join('\n')); console.log('final', JSON.stringify({ money: f.money, tut: f.tut, goal: f.goal, st: f.st })); console.log('errs', errs); await b.close();
})();
