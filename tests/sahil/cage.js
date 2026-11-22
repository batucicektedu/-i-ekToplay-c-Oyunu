// Karides & Yengeç kafesleri: vinç çeker -> tepsi -> oyuncu alır -> Deniz Tabağı -> müşteri -> para
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;Object.assign(sv.lv,{boat:1,gboat:1,cage:1})}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.P().stack.items.length=0});
const r=await page.evaluate(()=>{const g=__game,E=g.EATS.find(e=>e.id==='cage'),C=g.CAGES;const out={};g.tp(26,36);g.sim(40);out.tray=C.map(c=>c.tray.length);out.states=C.map(c=>c.st);
 for(const c of C){g.tp(c.def.tx,c.def.tz-2.3);g.sim(3)} out.held=g.P().stack.count('shrimp')+g.P().stack.count('crab');
 g.tp(E.o.inZone[0],E.o.inZone[1]);g.sim(2);out.inp=E.input.length;g.sim(30);out.plates=g.stats.eaten||0;g.tp(E.o.money[0],E.o.money[1]+2.1);const m0=g.S.money;g.sim(6);out.gain=g.S.money-m0;return out});
console.log(JSON.stringify(r));const bad=[];if(!r.tray.some(x=>x>0))bad.push('no catch');if(r.held<1)bad.push('not picked');if(!r.inp&&!r.plates)bad.push('no input');if(!r.plates)bad.push('no plates sold');
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
