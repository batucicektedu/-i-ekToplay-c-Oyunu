// 30 sim dakikası: tüm yükseltmeler/çalışanlar alınmış Sahil kaydı (kendi fixture'ı), oyuncu pasif. Takılma yok, tüm zincirler çalışmalı. Sonra osc.js.
const h=require('./h.js');
(async()=>{
const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/saves/sahil-end-v8.json',wait:1500,patch:sv=>{Object.assign(sv.lv,{helper:1,helperN:2,helpCap:4,cashier:1,carrier:1,carN:2,cashN:2,carSpd:3,carCap:3});sv.money=1000;sv.ts=Date.now()+1e6}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2);window.__m0=__game.S.money;window.__s0=Object.assign({},__game.stats)});
for(let m=0;m<30;m+=10){await page.evaluate(()=>{for(let i=0;i<600;i++)__game.sim(1)});}
const r=await page.evaluate(()=>{const g=__game,st=g.stats;return {money:Math.round(g.S.money-window.__m0),stalls:st.stalls||0,sold:st.sold||0,carted:st.carted||0,grilled:st.grilled||0,eaten:st.eaten||0,auctions:st.auctions||0,vanRuns:st.vanRuns||0,dock:g.DOCK.stack.length,wd:(window.__wdLog||[]).reduce((a,x)=>{const k=x[1]+'|'+x[2];a[k]=(a[k]||0)+1;return a},{})}});
console.log(JSON.stringify(r));const ee=errs.filter(e=>!/vibrate/.test(e));console.log(ee);
const bad=[];if(r.stalls)bad.push('stalls '+r.stalls);if(!r.sold)bad.push('no main sales');if(!r.carted)bad.push('porters idle');if(!r.vanRuns)bad.push('van idle');if(ee.length)bad.push('errors');
await b.close();{const o=require('child_process').spawnSync('node',[__dirname+'/osc.js'],{env:Object.assign({},process.env,{SEC:'120'}),encoding:'utf8'});console.log(o.stdout.split('\n').slice(-2).join(' '));if(o.status)bad.push('oscillation');}
console.log(bad.length?'FAIL '+bad:'PASS');process.exit(bad.length?1:0)})();
