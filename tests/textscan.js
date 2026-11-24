// Metin taraması: NaN/undefined/null/Infinity/[object Object] görünür metinde (DOM + pad etiketleri + açılır paneller)
// node tests/textscan.js
const h = require('./h.js'), path = require('path'), fs = require('fs');
const BAD = /undefined|NaN|\bnull\b|Infinity|\[object|\$\{/;
let fails = 0;
(async () => {
  const fx = [['max.json', 1], ['saves/c7-v7.json', 1], ['saves/mid-game-pre-fix.json', 1], [null, 0]];
  for (const [f] of fx) {
    const { b, page, errs } = await h.open({ q: 'low', w: 390, h: 844, wait: 1200, noRaf: true, fixture: f ? path.join(__dirname, f) : undefined, patch: sv => { sv.ts = Date.now() + 1e6; sv.op = 0; } });
    const r = await page.evaluate(async (BADs) => {
      const BAD = new RegExp(BADs), g = __game, out = [];
      window.__resetting = false; g.hideIntro(); g.sim(5);
      const chk = (tag, t) => { if (t != null && BAD.test(String(t))) out.push(tag + ': ' + String(t).slice(0, 80)); };
      for (const k in g.upPads) { const u = g.upPads[k]; try { if (u.done || !u.group.visible) continue; chk('pad.cost ' + k, g.upPads[k].cost()); chk('pad.sub ' + k, u.sub && u.sub()); } catch (e) { out.push('pad exc ' + k + e.message); } }
      for (const k in g.UPG) { chk('UPG.name ' + k, g.UPG[k].name); }
      const body = () => document.body.innerText;
      chk('body', body());
      for (const id of ['reset', 'bQuest', 'bBook', 'wardBtn']) { const e = document.getElementById(id); if (e && getComputedStyle(e).display !== 'none') { e.click(); await new Promise(r => setTimeout(r, 120)); chk('panel ' + id, body()); for (const ov of ['ward', 'menu', 'quest', 'book', 'bookPanel']) { const o = document.getElementById(ov); if (o) o.style.display = 'none'; } } }
      // tüm ek panel/kart elemanları (gizli olanlar dahil) metni
      for (const e of document.querySelectorAll('#app *')) { if (e.children.length === 0 && e.textContent) chk('el#' + e.id + '.' + e.className, e.textContent); }
      chk('money', document.getElementById('moneyV').textContent);
      return out;
    }, BAD.source);
    console.log((f || 'taze') + ': ' + (r.length ? r.join('\n  ') : 'temiz'), errs.length ? errs : '');
    fails += r.length + errs.length; await b.close();
  }
  console.log(fails ? 'FAIL ' + fails : 'PASS'); process.exit(fails ? 1 : 0);
})();
