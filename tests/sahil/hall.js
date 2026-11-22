// Balık Hali: stok -> zil -> kalabalık -> toplu satış (çarpan 1.5-2.6) -> para
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;Object.assign(sv.lv,{boat:1,gboat:1,cage:1,hall:1})}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.P().stack.items.length=0});
const r=await page.evaluate(()=>{const g=__game,H=g.HALL;const out={};g.tp(H.cx,29);g.sim(0.5);for(let i=0;i<4;i++){g.give('bouquet',8);g.sim(1.5)}out.stock=H.stock.length;
 let sawBell=false,sawCrowd=0;for(let i=0;i<70*4;i++){g.sim(0.25);if(H.state==='bell')sawBell=true;sawCrowd=Math.max(sawCrowd,H.buyers.length);if((g.stats.auctions||0)>0&&H.state==='wait')break}
 out.bell=sawBell;out.crowd=sawCrowd;out.auctions=g.stats.auctions||0;out.sum=g.stats.auctionSum||0;out.left=H.stock.length;
 g.tp(-8.6,35.1);const m0=g.S.money;g.sim(6);out.gain=g.S.money-m0;out.buyersGone=H.buyers.length;return out});
console.log(JSON.stringify(r));const bad=[];if(r.stock<10)bad.push('stock');if(!r.bell)bad.push('no bell');if(r.crowd<4)bad.push('no crowd');if(!r.auctions)bad.push('no auction');if(r.left>0)bad.push('stock left');if(r.gain<=0)bad.push('no money');
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
