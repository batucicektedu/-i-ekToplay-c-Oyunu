const h=require('./h.js'),path=require('path');
(async()=>{const {b,page,errs}=await h.open({q:'high',w:390,h:844,fixture:__dirname+'/saves/sahil-late-v8.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;sv.money=900000;Object.assign(sv.lv,{boat:1,gboat:1,cage:1,hall:1,bridge:1,fener:1})}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();const u=__game.allPads().find(p=>p.key==='gate');__game.tp(u.x,u.z);__game.sim(1.2)});
const out=path.resolve(__dirname,'../../docs/release/sahil_finale_');
await h.shot(page,out+'1_fireworks');await page.evaluate(()=>__game.sim(2.6));await h.shot(page,out+'2_card');
console.log(await page.evaluate(()=>document.getElementById('chapCard').innerText),errs.filter(e=>!/vibrate/.test(e)));await b.close()})();
