// Panel taşma denetimi (320x568 / 360x740): hikâye kartı, gardırop, görevler, koleksiyon, ayarlar, çevrimdışı kazanç
const h = require('./h.js'), path = require('path');
(async () => {
  let fails = 0;
  for (const [w, hh] of [[320, 568], [360, 740]]) {
    // taze: hikâye
    let r = await h.open({ q: 'low', w, h: hh, wait: 1000, noRaf: true });
    await h.shot(r.page, path.resolve(__dirname, '../docs/release/ch1_panel_story_' + w)); await r.b.close();
    r = await h.open({ q: 'low', w, h: hh, wait: 1200, noRaf: true, fixture: path.join(__dirname, 'max.json'), patch: sv => { sv.ts = Date.now() - 3 * 3600 * 1000; sv.op = 0; } });
    const { page, errs, b } = r;
    await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); __game.sim(2); });
    await page.waitForTimeout(300);
    for (const id of ['offc', 'ward', 'bQuest', 'bBook']) {
      await page.evaluate(id => { if (id === 'ward') document.getElementById('wardBtn').click(); else if (id === 'offc') { /* zaten açık olabilir */ } else document.getElementById(id).click(); }, id);
      await page.waitForTimeout(200);
      await h.shot(page, path.resolve(__dirname, '../docs/release/ch1_panel_' + id + '_' + w));
      const ov = await page.evaluate(() => { const W = innerWidth, H = innerHeight, o = []; for (const e of document.querySelectorAll('#app *')) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.tagName === 'CANVAS') continue; const rc = e.getBoundingClientRect(); if (!rc.width) continue; if (e.children.length === 0 && (e.textContent || '').trim() && e.scrollWidth > e.clientWidth + 2 && cs.overflowX !== 'hidden') o.push(['txt', e.id || e.className, e.textContent.trim().slice(0, 30), e.scrollWidth, e.clientWidth]); if (cs.position === 'fixed' && (rc.right > W + 1 || rc.left < -1)) o.push(['fixed-out', e.id || e.className, Math.round(rc.left), Math.round(rc.right)]); } return o; });
      console.log(w + ' ' + id, JSON.stringify(ov)); fails += ov.length;
      await page.evaluate(() => { for (const x of ['ward', 'quest', 'book', 'offc', 'menu']) { const o = document.getElementById(x); if (o) o.style.display = 'none'; } document.querySelectorAll('[id$=Card],[id$=Panel],#qpanel,#bpanel').forEach(e => { if (getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }); });
    }
    console.log('errs', errs); fails += errs.length; await b.close();
  }
  console.log(fails ? 'FAIL ' + fails : 'PASS');
})();
