// Bölüm 2 kayıt uyumluluğu testi: node tests/sahil/saves.js (tests/sahil/saves + Bölüm 1 örnek kayıtları da yüklenir)
// Gerekenler: playwright + three@0.128.0 (npm i three@0.128.0). cdnjs/jsdelivr yerel dosyadan verilir.
// Ortam: THREE_DIR (three paketi klasörü), PW (playwright modülü yolu), GAME (index.html yolu)
const fs = require('fs'), path = require('path');
const PW = process.env.PW || (fs.existsSync('/opt/node22/lib/node_modules/playwright') ? '/opt/node22/lib/node_modules/playwright' : 'playwright');
const { chromium } = require(PW);
const THREE = process.env.THREE_DIR || path.dirname(require.resolve('three/package.json'));
const GAME = 'file://' + path.resolve(process.env.GAME || path.join(__dirname, '../../sahil/index.html'));
const KEY = 'bolum2_sahil';
const DIRS = process.env.CH1 ? [path.join(__dirname, 'saves'), path.join(__dirname, '../saves')] : [path.join(__dirname, 'saves')];
const files = []; for (const d of DIRS) for (const f of fs.readdirSync(d).filter(f => f.endsWith('.json'))) files.push(path.join(d, f));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } };
async function open(b, pre, arg) {
  const page = await (await b.newContext({ viewport: { width: 600, height: 800 } })).newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/vibrate/.test(m.text())) errs.push(m.text()); });
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
    const fx = JSON.parse(fs.readFileSync(f, 'utf8')), sv = fx.value; console.log(f);
    const { page, errs } = await open(b, ([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); window.__resetting = true; }, [KEY, JSON.stringify(sv)]).catch(e => ({ page: null, errs: [String(e)] }));
    if (!page) { ok(false, 'açılamadı ' + errs); continue; }
    const r = await page.evaluate(() => { const g = __game; return { money: g.S.money, lv: JSON.parse(JSON.stringify(g.S.lv)), helper: !!g.helper(), cashier: !!g.cashier, carrier: !!g.carrier, z2: g.zone2 && !g.zone2.locked, z3: g.zone3 && !g.zone3.locked, boats: g.BOATS.filter(b => b.on).length, hamals: g.HAMALS().length, svc: g.SVCW ? g.SVCW.length : -1, hall: g.HALL.active, eat: g.EATS.filter(e => e.active).length, fin: !!(g.FIN.cafe && g.FIN.cafe.visible), bridge: !!(g.FIN.bridge && g.FIN.bridge.visible) }; });
    const oldVer = sv.ver || 1, OLDZ = ['lav', 'parf', 'cafe', 'wed', 'sunf', 'city', 'bee', 'jap', 'port', 'fest', 'mus'], NEWZ = ['boat', 'gboat', 'cage', 'hall', 'bridge', 'fener'], KEEPK = ['cap', 'speed', 'pack', 'bed', 'helper', 'cashier', 'carrier', 'cashSpd', 'carSpd', 'carCap', 'helpSpd', 'sera', 'van', 'helpCap', 'helperN', 'helperT', 'carN', 'cashN', 'potSpd', 'stars', 'gate'];
    ok(r.money >= Math.floor(sv.money) - 1e-6, `para ${r.money} < ${sv.money}`);
    if (oldVer < 8) { const n = OLDZ.filter(k => sv.lv[k] > 0).length; for (let i = 0; i < Math.min(n, NEWZ.length); i++) ok(r.lv[NEWZ[i]] > 0, 'eşlenen yeni bölge kilitli ' + NEWZ[i] + ' (eski bölge sayısı ' + n + ')'); for (const k of KEEPK) ok((r.lv[k] || 0) >= (sv.lv[k] || 0), `seviye ${k}: ${r.lv[k]} < ${sv.lv[k]}`); if (n > NEWZ.length || OLDZ.some(k => sv.lv[k + 'W'] > 0)) ok(r.money > sv.money, 'iade yok'); }
    else for (const k in sv.lv) ok((r.lv[k] || 0) >= sv.lv[k], `seviye ${k}: ${r.lv[k]} < ${sv.lv[k]}`);
    ok(!sv.lv.helper || r.helper, 'yardımcı yok'); ok(!sv.lv.cashier || r.cashier, 'kasiyer yok'); ok(!sv.lv.carrier || r.carrier, 'taşıyıcı yok');
    ok(!sv.lv.sera || r.z2, 'sera kilitli'); ok(!sv.lv.van || r.z3, 'van bölgesi kilitli');
    ok(r.boats === (r.lv.boat > 0 ? 1 + (r.lv.boatN || 0) : 0), 'tekne sayısı ' + r.boats); ok(r.hamals === (r.lv.hamal > 0 ? 1 + (r.lv.hamalN || 0) : 0), 'hamal sayısı'); ok(!(r.lv.hall > 0) || r.hall, 'hal kilitli'); ok(!(r.lv.fener > 0) || (r.fin && r.bridge), 'fener adası kilitli'); ok(!(r.lv.gboat > 0) || r.eat >= 1, 'balık-ekmek kilitli');
    { const w = k => (r.lv[k] > 0 ? 1 + (r.lv[k + 'N'] || 0) : 0); ok(r.svc === w('tez') + w('kcir') + w('mez') + w('yuk'), 'servis çalışanı sayısı ' + r.svc); }
    if (sv.tier) { const t = await page.evaluate(() => JSON.parse(JSON.stringify(__game.S.tier))); for (const k in sv.tier) ok(t[k] >= sv.tier[k], 'tier ' + k); }
    await page.evaluate(() => __game.sim(60)); await page.waitForTimeout(100);
    const after = await page.evaluate(k => { const o = JSON.parse(localStorage.getItem(k)); return { money: o.money, ver: o.ver, lv: o.lv }; }, KEY);
    ok(after.money >= sv.money && after.ver >= 8, 'yeniden yazılan kayıt eksik (ver ' + after.ver + ')');
    for (const k in r.lv) ok((after.lv[k] || 0) >= r.lv[k], 'yazılan seviye ' + k);
    ok(errs.length === 0, 'konsol hatası: ' + errs.slice(0, 2).join(' | ')); await page.context().close();
  }
  // Bozuk ana kayıt + yedek: yedekten yüklenmeli
  { console.log('bozuk-ana+yedek'); const sv = JSON.parse(fs.readFileSync(files[files.length - 1], 'utf8')).value;
    const { page, errs } = await open(b, ([k, v]) => { localStorage.clear(); localStorage.setItem(k, '{bozuk'); localStorage.setItem(k + '_bak', v); window.__resetting = true; }, [KEY, JSON.stringify(sv)]);
    const m = await page.evaluate(() => __game.S.money); ok(m >= Math.floor(sv.money), 'yedekten yüklenmedi ' + m);
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
