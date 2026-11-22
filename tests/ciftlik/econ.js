// Ekonomi ölçümü: sıfırdan bot oynar; her yükseltmenin alındığı dakikayı ve "alacak şey yok" boşluklarını yazar.
// SEC=5400 GAME=http://localhost:8765/ciftlik/index.html node tests/ciftlik/econ.js
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1000});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();window.__log=[];window.__prev=JSON.stringify(__game.S.lv);window.__t=0;
window.__chunk=(sec)=>{const g=__game;for(let i=0;i<sec*10;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>0.15){dx/=L;dz/=L}else dx=dz=0}g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);window.__t+=0.1}
 const lv=g.S.lv,pv=JSON.parse(window.__prev);for(const k in lv)if(lv[k]>(pv[k]||0))window.__log.push([Math.round(window.__t/6)/10,k+lv[k],Math.round(g.S.money)]);window.__prev=JSON.stringify(lv);g.bot(0,0)}});
const SEC=+process.env.SEC||5400;let done=false;
for(let i=0;i<SEC/10&&!done;i++){done=await page.evaluate(()=>{window.__chunk(10);return __game.S.lv.ranch>0&&window.__t>60&&(window.__ranchAt=window.__ranchAt||window.__t,window.__t>window.__ranchAt+(+0))});}
const r=await page.evaluate(()=>({min:Math.round(window.__t/6)/10,log:window.__log,money:Math.round(__game.S.money)}));
let gap=0,prev=0;for(const e of r.log){gap=Math.max(gap,e[0]-prev);prev=e[0]}
console.log(r.log.map(e=>e[0]+'m '+e[1]).join(' | '));console.log('sim minutes',r.min,'max gap between purchases',Math.round(gap*10)/10,'min; errors',errs.length);await b.close()})();
