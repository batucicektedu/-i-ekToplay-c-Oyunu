// Kayıt uyumluluğu testi: node tests/saves/check.js
// Gerekenler: playwright + three@0.128.0 (npm i three@0.128.0). cdnjs/jsdelivr yerel dosyadan verilir.
// Ortam: THREE_DIR (three paketi klasörü), PW (playwright modülü yolu), GAME (index.html yolu)
const fs = require('fs'), path = require('path');
const PW = process.env.PW || (fs.existsSync('/opt/node22/lib/node_modules/playwright') ? '/opt/node22/lib/node_modules/playwright' : 'playwright');
const { chromium } = require(PW);
const THREE = process.env.THREE_DIR || path.dirname(require.resolve('three/package.json'));
const GAME = 'file://' + path.resolve(process.env.GAME || path.join(__dirname, '../../index.html'));
const KEY = 'cicek_bahcesi_v1';
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.json'));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } };
async function open(b, pre, arg) {
  const page = await (await b.newContext({ viewport: { width: 600, height: 800 } })).newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.addInitScript(() => { window.__noAuto = true; });
  await page.route('**/three.min.js', r => r.fulfill({ path: THREE + '/build/three.min.js', contentType: 'application/javascript' }));
  await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**', r => { const u = r.request().url().split('examples/js/')[1]; r.fulfill({ path: THREE + '/examples/js/' + u, contentType: 'application/javascript' }); });
  await page.goto(GAME); await page.waitForTimeout(300);
  await page.evaluate(pre, arg); await page.goto(GAME); await page.waitForTimeout(800);
  return { page, errs };
}
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  for (const f of files) {
    const fx = JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')), sv = fx.value; console.log(f);
    const { page, errs } = await open(b, ([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); window.__resetting = true; }, [KEY, JSON.stringify(sv)]).catch(e => ({ page: null, errs: [String(e)] }));
    if (!page) { ok(false, 'açılamadı ' + errs); continue; }
    const r = await page.evaluate(() => { const g = __game; const z = id => g.EXTZ[id] && !g.EXTZ[id].locked; return { money: g.S.money, lv: JSON.parse(JSON.stringify(g.S.lv)), helper: !!g.helper(), cashier: !!g.cashier, carrier: !!g.carrier, z2: g.zone2 && !g.zone2.locked, z3: g.zone3 && !g.zone3.locked, ext: { lav: z('lav'), parf: z('parf'), cafe: z('cafe'), wed: z('wed'), sunf: z('sunf'), city: z('city') }, gard: g.GARD.length, tractor: !!g.tractor() }; });
    ok(r.money >= sv.money, `para ${r.money} < ${sv.money}`);
    for (const k in sv.lv) ok(r.lv[k] >= Math.min(sv.lv[k], 99) || r.lv[k] === sv.lv[k], `seviye ${k}: ${r.lv[k]} != ${sv.lv[k]}`);
    ok(!sv.lv.helper || r.helper, 'yardımcı yok'); ok(!sv.lv.cashier || r.cashier, 'kasiyer yok'); ok(!sv.lv.carrier || r.carrier, 'taşıyıcı yok');
    ok(!sv.lv.sera || r.z2, 'sera kilitli'); ok(!sv.lv.van || r.z3, 'van bölgesi kilitli');
    for (const k of ['lav', 'parf', 'cafe', 'wed', 'sunf', 'city']) ok(!(sv.lv[k] > 0) || r.ext[k], k + ' bölgesi kilitli');
    ok(!sv.lv.lavW || r.gard >= 1, 'lavanta bahçıvanı yok'); ok(!sv.lv.sunW || r.tractor, 'traktör yok');
    await page.evaluate(() => __game.sim(60)); await page.waitForTimeout(100);
    const after = await page.evaluate(k => { const o = JSON.parse(localStorage.getItem(k)); return { money: o.money, ver: o.ver, lv: o.lv }; }, KEY);
    ok(after.money >= sv.money && after.ver >= 2, 'yeniden yazılan kayıt eksik'); for (const k in sv.lv) ok(after.lv[k] === sv.lv[k] || after.lv[k] > sv.lv[k], 'yazılan seviye ' + k);
    ok(errs.length === 0, 'konsol hatası: ' + errs.slice(0, 2).join(' | ')); await page.context().close();
  }
  // Bozuk ana kayıt + yedek: yedekten yüklenmeli
  { console.log('bozuk-ana+yedek'); const sv = JSON.parse(fs.readFileSync(path.join(__dirname, files[files.length - 1]), 'utf8')).value;
    const { page, errs } = await open(b, ([k, v]) => { localStorage.clear(); localStorage.setItem(k, '{bozuk'); localStorage.setItem(k + '_bak', v); window.__resetting = true; }, [KEY, JSON.stringify(sv)]);
    const m = await page.evaluate(() => __game.S.money); ok(m >= sv.money, 'yedekten yüklenmedi ' + m);
    await page.evaluate(() => __game.sim(10)); ok(JSON.parse(await page.evaluate(k => localStorage.getItem(k), KEY)).money >= sv.money, 'yedekten sonra kayıt bozuldu'); ok(errs.length === 0, 'hata ' + errs); await page.context().close(); }
  // Bozuk ana kayıt, yedek yok: taze oyun eski kaydın üstüne YAZMAMALI
  { console.log('bozuk-ana, yedek yok'); const { page, errs } = await open(b, ([k]) => { localStorage.clear(); localStorage.setItem(k, '{"money":5000,"lv":{"cap":3}'); window.__resetting = true; }, [KEY]);
    await page.evaluate(() => { __game.sim(20); window.__resetting = false; dispatchEvent(new Event('pagehide')); });
    const raw = await page.evaluate(k => localStorage.getItem(k), KEY); ok(raw === '{"money":5000,"lv":{"cap":3}', 'bozuk kayıt üzerine yazıldı: ' + raw); ok(errs.length === 0, 'hata ' + errs); await page.context().close(); }
  // NaN / eksik alan onarımı
  { console.log('nan-onarım'); const { page, errs } = await open(b, ([k]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify({ money: 'x', lv: { cap: null, speed: 'a', helper: 1 }, tut: 12 })); window.__resetting = true; }, [KEY]);
    const r = await page.evaluate(() => ({ m: __game.S.money, c: __game.S.lv.cap, h: __game.S.lv.helper })); ok(r.m === 0 && r.c === 0 && r.h === 1, JSON.stringify(r)); ok(errs.length === 0, 'hata ' + errs); await page.context().close(); }
  await b.close(); console.log(fails ? 'BAŞARISIZ: ' + fails : 'TÜMÜ GEÇTİ'); process.exit(fails ? 1 : 0);
})();
