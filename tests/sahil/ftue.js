// FTUE: taze kayit, bot ile ilk dakikalar; hedef degisince ekran goruntusu (docs/release/sahil_ftue_NN.png). Hedef denizde mi kontrol eder.
const h=require('./h.js'),path=require('path');
const W=+process.env.W||390,H=+process.env.H||844,TAG=process.env.TAG||'';
(async()=>{const bad=[];const {b,page,errs}=await h.open({q:'high',w:W,h:H,wait:1500});
const out=path.resolve(__dirname,'../../docs/release/sahil_ftue_'+TAG);let n=0;
const shot=async(l)=>{n++;await h.shot(page,out+String(n).padStart(2,'0')+'_'+l)};
await shot('card');
const card=await page.evaluate(()=>({card:(document.getElementById('chapCard')||{style:{}}).style.display,txt:(document.querySelector('#chapCard .cb')||{}).innerText}));console.log(JSON.stringify(card));
if(card.card!=='flex')bad.push('no story card');
await page.click('#chapCard button');await page.waitForTimeout(300);await shot('intro');
let lastK='',lastT=-9;
for(let i=0;i<6000&&n<26;i++){
 const r=await page.evaluate(()=>{const g=__game;g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>(o.kind==='harvest'?0.7:0.15)){dx/=L;dz/=L}else dx=dz=0}g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);
  const hint=document.getElementById('hintT');return {k:o.kind,ok:o.ok,x:o.x,z:o.z,px:p.x,pz:p.z,ht:hint?hint.textContent:'',hv:document.getElementById('hint').style.display,m:Math.round(g.S.money),st:JSON.stringify(g.stats)}});
 // deniz kontrolu: hedef x<-28.5 ve |z|>1.7 ise deniz
 if(r.ok&&r.x>-60&&r.x<-10.3&&Math.abs(r.z)>3.9&&r.x<-14)bad.push('target in sea? '+JSON.stringify(r));
 const key=r.k+'|'+r.hv;
 if(key!==lastK&&i-lastT>8){lastK=key;lastT=i;console.log(i/10+'s',r.k,r.ok,r.x&&r.x.toFixed(1),r.z&&r.z.toFixed(1),'hint:',r.ht,'$',r.m);await page.evaluate(()=>__game.bot(0,0));await shot(String(r.k));}
}
console.log(errs.slice(0,5));console.log(bad.slice(0,8));await b.close();})();
