// Ayarlar menüsü + çift onaylı sıfırlama + final kartı ekran görüntüleri. W/H env.
const h=require('./h.js'),path=require('path');
(async()=>{const W=+process.env.W||360,H=+process.env.H||740,OUT=path.resolve(__dirname,'../../docs/release/ciftlik_ui_'+W+'x'+H+'_');
const {b,page,errs}=await h.open({q:'low',w:W,h:H,wait:1200,fixture:__dirname+'/saves/c3-v10-auto.json',patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;sv.seen=sv.seen||{};sv.seen.fin=1}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
await page.click('#reset');await page.waitForTimeout(200);await h.shot(page,OUT+'menu');
// kutuların taşması / dokunma hedefi
const r=await page.evaluate(()=>[...document.querySelectorAll('#menu button')].filter(b=>b.offsetParent).map(b=>{const q=b.getBoundingClientRect();return [b.id,Math.round(q.width),Math.round(q.height),Math.round(q.top),Math.round(q.bottom)]}));
console.log(JSON.stringify(r),'inner',innerHeight=await page.evaluate(()=>innerHeight));
await page.click('#mSnd');await page.click('#mVib');
console.log('ayar',await page.evaluate(()=>localStorage.getItem('ciftlik_ayar')));
await page.click('#mReset');await page.waitForTimeout(200);await h.shot(page,OUT+'reset1');
await page.click('#chapCard button >> text=Devam');await page.waitForTimeout(200);await h.shot(page,OUT+'reset2');
await page.click('#chapCard button >> text=Hayır');
console.log('save var',await page.evaluate(()=>!!localStorage.getItem('bolum3_ciftlik')));
await page.evaluate(()=>{__game.S.seen.fin=0;__game.sim(0.1)});await page.evaluate(()=>{__game.S.seen.fin=0;__game.sim(6)});await page.waitForTimeout(300);await h.shot(page,OUT+'finale');
console.log(errs);await b.close()})();
