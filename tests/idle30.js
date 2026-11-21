const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/max.json',wait:1500,patch:sv=>{Object.assign(sv.lv,{wedW:1,portSpd:1,portCap:1,beeW:1,bonW:1,portW:1,cityW:1,cafeW:1,sunW:1,parfW:1,lavW:1});sv.money=1000;}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2);window.__m0=__game.S.money;window.__s0=Object.assign({},__game.stats)});
for(let m=0;m<30;m+=10){await page.evaluate(()=>{for(let i=0;i<600;i++)__game.sim(1)});}
const r=await page.evaluate(()=>{const g=__game,st=g.stats,o={};for(const k in st)if(k.startsWith('s_'))o[k]=st[k]-(window.__s0[k]||0);return {money:Math.round(g.S.money-window.__m0),stalls:st.stalls||0,sold:o,wed:st.weddings||0,wedItems:st.wedItems||0,vanRuns:st.vanRuns||0,exports:st.exportsDone||0,carry:g.P().stack.length}});
console.log(JSON.stringify(r));console.log(errs);await b.close()})();
