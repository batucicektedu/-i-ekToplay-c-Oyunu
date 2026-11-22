// Balık-Ekmek Teknesi: sandık doldur -> ızgara -> rıhtımda müşteri -> para -> topla
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;Object.assign(sv.lv,{boat:1,gboat:1})}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.P().stack.items.length=0});
const r=await page.evaluate(()=>{const g=__game,E=g.EATS[0];const out={};g.tp(42,22.4);g.sim(0.5);
 for(let i=0;i<10;i++){g.give('bouquet',6);g.sim(1.2)}
 out.inp=E.input.length;g.sim(40);out.grilled=g.stats.grilled||0;out.eaten=g.stats.eaten||0;out.cs=E.cs.length;out.pile=E.pile.length+E.pile.extra;
 g.tp(40.5,28.9);const m0=g.S.money;g.sim(8);out.gain=g.S.money-m0;out.pile2=E.pile.length+E.pile.extra;out.badPos=E.cs.some(c=>c.group.position.x>48.2);return out});
console.log(JSON.stringify(r));const bad=[];if(!r.grilled)bad.push('no grilling');if(!r.eaten)bad.push('no customers served');if(r.gain<=0)bad.push('no money collected');if(r.badPos)bad.push('customer in sea');
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
