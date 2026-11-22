// Çiftlik 30 dk boşta (oyuncu hareketsiz, yalnız çalışanlar): para artar, at sevgisi >0, salınım/duraksama yok.
// FX=workers.json SEC=1800 GAME=http://localhost:8765/ciftlik/index.html node tests/ciftlik/idle30.js
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:__dirname+'/'+(process.env.FX||'workers.json'),patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;sv.money=1000}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(7,-8);window.__m0=__game.S.money;window.__s0=Object.assign({},__game.stats);window.__minLove=100;window.__chg={};window.__last={}});
const SEC=+process.env.SEC||1800;
for(let m=0;m<SEC/60;m++){await page.evaluate(()=>{const g=__game;for(let i=0;i<60;i++){g.sim(1);const p=g.P().group.position;p.x=7;p.z=-8;for(const r of g.RH)window.__minLove=Math.min(window.__minLove,r.love);g.FWU.concat(g.GARD,g.CARX).forEach((w,k)=>{const key=k;if(window.__last[key]!==w.state){window.__chg[key]=(window.__chg[key]||0)+1;window.__last[key]=w.state}})}})}
const r=await page.evaluate(()=>{const g=__game,st=g.stats,o={};for(const k in st)if(/^s_|^made|^sheared|^rides|^fed|^fwReset|^shows/.test(k))o[k]=st[k]-(window.__s0[k]||0);return{money:Math.round(g.S.money-window.__m0),minLove:Math.round(window.__minLove),o,chg:window.__chg,rh:g.RH.map(x=>Math.round(x.love)),wk:g.FWU.map(w=>w.role+':'+w.state),gard:g.GARD.length,carx:g.CARX.length,tr:g.GARD.filter(w=>w.tr).length+g.CARX.filter(w=>w.tr).length+(g.helper()&&g.helper().tr?1:0)+(g.carrier&&g.carrier.tr?1:0)}});
console.log(JSON.stringify(r));console.log(errs.slice(0,3));
const bad=[];if(r.money<=0)bad.push('money');if(r.minLove<=0)bad.push('love hit 0');if(r.o.fwReset)bad.push('watchdog resets '+r.o.fwReset);if(!r.o.sheared)bad.push('no shearing');if(!(r.o.s_sweater))bad.push('no sweater sales');if(!r.o.s_cheese)bad.push('no cheese sales');if(!r.o.fed)bad.push('no feeding');
for(const k in r.chg)if(r.chg[k]>SEC/60*40)bad.push('oscillation worker '+k+': '+r.chg[k]);if(process.env.FX==='auto.json'&&r.tr<3)bad.push('tractors '+r.tr);if(errs.length)bad.push('errors');
console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
