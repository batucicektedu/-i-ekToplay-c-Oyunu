// Balik Hali uctan uca (gercek oyuncu gibi): pad ile ac (12000) -> Kaptan Riza toast -> temiz balik tasi
// (ok hale gostermeli) -> stok 0/10 tabelasi -> zil -> mezat -> para yigini -> topla -> para artar.
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-mid-v8.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;Object.assign(sv.lv,{boat:1,gboat:1,cage:1});sv.lv.hall=0;sv.lv.hallBonus=0;sv.lv.hallSpd=0;sv.money=12600}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.P().stack.items.length=0});await page.evaluate(h.WALK);
const r=await page.evaluate(()=>{const g=__game,H=g.HALL,o={};window.__walkR=0.4;
 o.activeBefore=H.active;g.tp(0,22);g.sim(1);
 const pad=g.upPads.hall;o.padVisible=pad.group.visible;o.padCost=pad.cost();o.padAt=[pad.x,pad.z];
 // 1) pad uzerinde dur: satin al
 window.__walk(pad.x,pad.z,40);for(let i=0;i<300&&g.S.lv.hall<1;i++)g.sim(0.1);
 o.bought=g.S.lv.hall;g.sim(3);o.active=H.active;o.zoneVis=H.zone.group.visible;o.rizaSeen=!!g.S.seen.m_hall;o.toast=document.getElementById('toast').textContent;
 // 2) balik tasi
 g.tp(0,22);g.sim(0.5);g.P().stack.items.length=0;g.give('bouquet',10);o.carry=g.P().stack.count('bouquet');
 g.sim(0.5);const ob=g.objective();o.arrow=[ob.kind,+ob.x.toFixed(1),+ob.z.toFixed(1)];
 // oku izle (bot gibi): hedefe yuru
 window.__walk(ob.x,ob.z,60,null,()=>H.zone.inside);o.inside=H.zone.inside;g.sim(5);
 o.stock=H.stock.length;o.left=g.P().stack.count('bouquet');
 o.sprite=H.sig;
 // 3) mezat
 let bell=false,crowd=0,sold=false;const m0=g.S.money;
 for(let i=0;i<60*4&&!(g.stats.auctions>0);i++){g.sim(0.25);if(H.state==='bell')bell=true;crowd=Math.max(crowd,H.buyers.length)}
 o.bell=bell;o.crowd=crowd;o.auctions=g.stats.auctions||0;o.sum=Math.round(g.stats.auctionSum||0);g.sim(6);
 o.pile=H.pile.length+H.pile.extra;o.stockAfter=H.stock.length;
 // 4) parayi topla (ok para bolgesini gostermeli)
 const ob2=g.objective();o.arrow2=[ob2.kind,+ob2.x.toFixed(1),+ob2.z.toFixed(1)];
 const m1=g.S.money;window.__walk(H.monZone.x,H.monZone.z,40,null,()=>H.monZone.inside);g.sim(6);o.gain=Math.round(g.S.money-m1);o.pileAfter=H.pile.length+H.pile.extra;
 return o});
console.log(JSON.stringify(r,null,1));const bad=[];
if(!r.padVisible)bad.push('hall pad not visible');if(r.bought<1)bad.push('hall not bought');if(!r.active)bad.push('hall inactive');if(!r.zoneVis)bad.push('drop zone hidden');
if(!/Hal|hal/.test(r.toast)&&!r.rizaSeen)bad.push('no Riza toast');
if(r.arrow[0]!=='hall')bad.push('arrow does not point to hall: '+r.arrow);
if(!r.inside)bad.push('zone not reached');if(r.stock<10)bad.push('stock '+r.stock);if(r.left>0)bad.push('items left in hand');
if(!/10/.test(r.sprite))bad.push('sign text '+r.sprite);
if(!r.bell)bad.push('no bell');if(r.crowd<4)bad.push('no crowd');if(!r.auctions)bad.push('no auction');if(r.pile<1&&r.gain<=0)bad.push('no money pile');
if(r.gain<=0)bad.push('money did not increase');
const e=errs.filter(e=>!/vibrate/.test(e));if(e.length){console.log(e);bad.push('errors')}
await page.evaluate(()=>{__game.tp(-14.5,24);__game.give('bouquet',3);__game.sim(1)});await h.shot(page,__dirname+'/../../docs/sahil/fix_hall_1');
console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
