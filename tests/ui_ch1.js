// Bölüm 1 arayüz denetimi: ayarlar menüsü, çift onaylı sıfırlama, dokunma hedefleri, HUD çakışması, güvenli alan
// node tests/ui_ch1.js  -> docs/release/ch1_ui_*.png
const h = require('./h.js'), path = require('path');
const VP = [[390, 844], [360, 740], [320, 568], [768, 1024]];
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } };
(async () => {
  for (const [w, hh] of VP) {
    console.log('== ' + w + 'x' + hh);
    const { b, page, errs } = await h.open({ q: 'low', w, h: hh, wait: 1200, noRaf: true, fixture: path.join(__dirname, 'max.json'), patch: sv => { sv.ts = Date.now() + 1e6; sv.op = 0; } });
    await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); __game.sim(3); });
    const shot = n => h.shot(page, path.resolve(__dirname, '../docs/release/ch1_ui_' + w + 'x' + hh + '_' + n));
    await shot('hud');
    // HUD çakışma: görünür HUD parçalarının kutuları kesişmesin
    const hud = await page.evaluate(() => { const ids = ['money', 'stars', 'capP', 'beauty', 'wardBtn', 'goal', 'hint', 'reset', 'fsBtn']; const r = []; for (const id of ids) { const e = document.getElementById(id); if (!e) continue; const cs = getComputedStyle(e); if (cs.display === 'none') continue; const b = e.getBoundingClientRect(); if (b.width) r.push([id, b.left, b.top, b.right, b.bottom]); } return r; });
    for (let i = 0; i < hud.length; i++) for (let j = i + 1; j < hud.length; j++) { const a = hud[i], c = hud[j]; if (a[1] < c[3] - 1 && c[1] < a[3] - 1 && a[2] < c[4] - 1 && c[2] < a[4] - 1) ok(false, 'HUD çakışma ' + a[0] + ' x ' + c[0] + ' ' + JSON.stringify([a, c])); }
    for (const [id, l, t, r, bt] of hud) ok(l >= -0.5 && r <= w + 0.5 && t >= -0.5 && bt <= hh + 0.5, 'HUD taşma ' + id + ' ' + [l, t, r, bt]);
    // menü
    await page.evaluate(() => document.getElementById('reset').click()); await page.waitForTimeout(100);
    await shot('menu');
    const m = await page.evaluate(() => { const box = document.querySelector('.mbox').getBoundingClientRect(); const bs = [...document.querySelectorAll('#menu button, #menu a')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return [e.id, r.width, r.height, r.left, r.right, e.scrollWidth > e.clientWidth + 1, e.textContent]; }); const mb = document.querySelector('.mbox'); return { box: [box.left, box.top, box.right, box.bottom], bs, scroll: mb.scrollHeight > mb.clientHeight + 1 }; });
    for (const [id, bw, bh, l, r, ov, tx] of m.bs) { ok(bh >= 43.5 && bw >= 43.5, 'menü hedefi küçük ' + id + ' ' + Math.round(bw) + 'x' + Math.round(bh)); ok(!ov, 'menü metni taşıyor ' + id + ' "' + tx + '"'); ok(l >= 0 && r <= w, 'menü düğmesi ekran dışı ' + id); }
    ok(m.box[1] >= 0 && m.box[3] <= hh, 'menü kutusu ekrandan taşıyor ' + m.box);
    console.log('  menü', m.bs.length, 'düğme, kutu', m.box.map(Math.round), 'kaydırma', m.scroll);
    // ses/titreşim
    await page.evaluate(() => { document.getElementById('mSnd').click(); document.getElementById('mVib').click(); });
    const p1 = await page.evaluate(() => [localStorage.getItem('cicek_ayar'), document.getElementById('mSnd').textContent, document.getElementById('mVib').textContent]);
    ok(p1[0] === '{"snd":false,"vib":false}' && /Kapalı/.test(p1[1]) && /Kapalı/.test(p1[2]), 'ayar kaydı ' + p1);
    await shot('menu_off');
    await page.evaluate(() => { document.getElementById('mSnd').click(); document.getElementById('mVib').click(); });
    // sıfırlama: iki adım, vazgeç kaydı korur
    const before = await page.evaluate(() => { __game.S.money = 12345; return 1; });
    await page.evaluate(() => document.getElementById('mReset').click()); await shot('reset1');
    const s1 = await page.evaluate(() => [getComputedStyle(document.getElementById('rstCard')).display, document.getElementById('rstT').textContent, document.getElementById('rstYes').textContent]);
    ok(s1[0] === 'flex', 'reset kartı açılmadı'); 
    await page.evaluate(() => document.getElementById('rstYes').click()); // 1. onay
    const s2 = await page.evaluate(() => [document.getElementById('rstT').textContent, document.getElementById('rstYes').textContent, document.getElementById('rstYes').disabled, !!localStorage.getItem('cicek_bahcesi_v1')]);
    ok(s2[0] === 'Son uyarı' && s2[2] === true && s2[3], 'ikinci adım ' + s2);
    await page.evaluate(() => document.getElementById('rstYes').click()); // devre dışıyken işlem yapmamalı
    ok(await page.evaluate(() => !!localStorage.getItem('cicek_bahcesi_v1')), 'devre dışı düğme sildi');
    await shot('reset2');
    await page.evaluate(() => document.getElementById('rstNo').click());
    ok(await page.evaluate(() => getComputedStyle(document.getElementById('rstCard')).display === 'none' && !!localStorage.getItem('cicek_bahcesi_v1')), 'vazgeç kaydı bozdu');
    // oyun alanındaki tüm görünür düğmeler (HUD)
    const t = await page.evaluate(() => [...document.querySelectorAll('#hud button, #bQuest, #bBook, #wardBtn')].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').map(e => { const r = e.getBoundingClientRect(); return [e.id, r.width, r.height]; }));
    for (const [id, bw, bh] of t) if (bw) ok(bw >= 43.5 && bh >= 43.5, 'HUD hedefi küçük ' + id + ' ' + Math.round(bw) + 'x' + Math.round(bh));
    console.log('  hata:', errs); ok(!errs.length, 'konsol hatası');
    await b.close();
  }
  console.log(fails ? 'FAIL ' + fails : 'PASS'); process.exit(fails ? 1 : 0);
})();
