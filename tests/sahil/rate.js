// Pasif gelir ölçümü ($/sn): temel zincir, +tekneler, tam kadro. node tests/sahil/rate.js
const h=require('./h.js');
const cfgs={base:{boat:0,boatN:0,hamal:0,hamalN:0,gboat:0,cage:0,hall:0,bridge:0,fener:0},boats:{boat:1,boatN:2,boatCap:2,boatSpd:2,hamal:1,hamalN:1,gboat:0,cage:0,hall:0,bridge:0,fener:0},full:{}};
(async()=>{for(const k of ['base','boats','full']){const {b,page,errs}=await h.open({q:'low',wait:900,fixture:__dirname+'/saves/sahil-end-v8.json',patch:sv=>{sv.ts=Date.now()+1e6;Object.assign(sv.lv,cfgs[k]);sv.money=1000;sv.lv.helper=1;sv.lv.helperN=2;sv.lv.helpCap=3;sv.lv.cashier=1;sv.lv.carrier=1}});
const r=await page.evaluate(()=>{const g=__game;g.hideIntro();g.tp(8,2);const m0=g.S.money;for(let i=0;i<300;i++)g.sim(1);return {gain:Math.round(g.S.money-m0),sold:g.stats.sold,stalls:g.stats.stalls||0}});console.log(k,JSON.stringify(r),'=> $/s',(r.gain/300).toFixed(1));await b.close()}})();
