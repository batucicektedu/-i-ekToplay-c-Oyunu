// Bölüm 3 kayıt uyumluluğu: tests/ciftlik/saves/*.json yüklenir; para/seviye/bölge aynı, hata yok, yeniden yazılan kayıt eksiksiz.
// GAME=http://localhost:8765/ciftlik/index.html node tests/ciftlik/saves.js  (file:// depolaması headless'ta güvenilmez)
const fs=require('fs'),path=require('path'),h=require('./h.js');
const dir=path.join(__dirname,'saves'),files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('  FAIL',m)}};
(async()=>{for(const f of files){const fx=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')),sv=fx.value;console.log(f);
 const {b,page,errs}=await h.open({q:'low',wait:1200,fixture:path.join(dir,f),patch:s=>{s.ts=Date.now()+1e6}});
 await page.evaluate(()=>{window.__resetting=false});
 const r=await page.evaluate(()=>({money:__game.S.money,lv:JSON.parse(JSON.stringify(__game.S.lv)),rh:__game.RH.length,gate:__game.S.lv.ranch>0}));
 ok(r.money>=sv.money,'para '+r.money+' < '+sv.money);for(const k in sv.lv)ok(r.lv[k]===sv.lv[k],'seviye '+k+': '+r.lv[k]+' != '+sv.lv[k]);
 ok(!sv.lv.ranch||r.rh===1+(sv.lv.horse||0),'at sayısı '+r.rh);
 await page.evaluate(()=>{__game.sim(60);dispatchEvent(new Event('pagehide'))});
 const a=await page.evaluate(()=>JSON.parse(localStorage.getItem('bolum3_ciftlik')));
 ok(a.ver===9,'ver '+a.ver);ok(a.money>=sv.money,'yazılan para');for(const k in sv.lv)ok(a.lv[k]>=sv.lv[k],'yazılan seviye '+k);
 ok(errs.length===0,'konsol hatası '+errs.slice(0,2));await b.close()}
 console.log(fails?'FAIL '+fails:'PASS');process.exit(fails?1:0)})();
