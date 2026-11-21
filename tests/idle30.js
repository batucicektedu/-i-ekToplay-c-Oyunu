// 30 sim dakika, tüm çalışanlar alınmış + max yükseltme. TR=1: tüm toplayıcılar traktöre evrilmiş. NOHELP=1: sadece temel (yeni) çalışanlar.
const h=require('./h.js');
(async()=>{const TR=process.env.TR==='1';
const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/max.json',wait:1500,patch:sv=>{Object.assign(sv.lv,{wedW:1,portSpd:1,portCap:1,beeW:1,bonW:1,portW:1,cityW:1,cafeW:1,sunW:1,parfW:1,lavW:1,cafeG:1,
 helpCap:4,helperN:2,lavCap:4,lavN:2,parfCap:4,parfN:2,cafeGCap:4,cafeGN:2,sunCap:4,sunN:2,bonCap:4,bonN:2,carN:2,cashN:2,wedSpd:5,potSpd:5,bus:1,busSpd:5,busCap:4,busN:2});
 if(TR)Object.assign(sv.lv,{helperT:1,lavT:1,parfT:1,cafeGT:1,bonT:1});sv.money=1000;}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2);window.__m0=__game.S.money;window.__s0=Object.assign({},__game.stats)});
for(let m=0;m<30;m+=10){await page.evaluate(()=>{for(let i=0;i<600;i++)__game.sim(1)});}
const r=await page.evaluate(()=>{const g=__game,st=g.stats,o={};for(const k in st)if(k.startsWith('s_'))o[k]=st[k]-(window.__s0[k]||0);
 const c=g.city(),cf=g.cafe();
 return {money:Math.round(g.S.money-window.__m0),stalls:st.stalls||0,sold:o,wed:st.weddings||0,wedItems:st.wedItems||0,vanRuns:st.vanRuns||0,exports:st.exportsDone||0,citySold:st.citySold||0,cityQueue:c?c.queue.length:-1,cafeServed:st.cafeServed||0,carry:g.P().stack.length,
  gard:g.GARD.map(x=>x.kind+(x.tr?'T':'')).join(','),tr:g.GARD.filter(x=>x.tr).length,busTrips:st.busTrips||0,cityBy:Object.fromEntries(Object.keys(st).filter(k=>k.startsWith('c_')).map(k=>[k,st[k]])),wd:(window.__wdLog||[]).slice(0,5)}});
console.log(JSON.stringify(r));console.log(errs);
const bad=[];if(r.stalls)bad.push('stalls');if(!r.citySold)bad.push('city');if(!r.cafeServed)bad.push('tea');for(const k of ['s_bouquet','s_pot','s_sachet','s_perfume','s_sbq','s_honey','s_bonsai'])if(!r.sold[k])bad.push(k);if(errs.length)bad.push('errors');
if(!r.cityBy.c_perfume)bad.push('city perfume');if(TR&&r.tr<5)bad.push('tractors '+r.tr);
console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
