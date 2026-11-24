// FTUE: taze kayıt, bot hedef okunu izler; belirli anlarda ekran görüntüsü; ok/objective tutarlılığı. W=390 H=844 node tests/ciftlik/ftue.js
const h=require('./h.js'),path=require('path');
(async()=>{const W=+process.env.W||390,H=+process.env.H||844,OUT=path.resolve(__dirname,'../../docs/release/ciftlik_ftue_');
const {b,page,errs}=await h.open({q:'high',w:W,h:H,wait:1500});
let n=0;const shot=async(tag)=>{n++;await h.shot(page,OUT+String(n).padStart(2,'0')+'_'+tag)};
await shot('intro');
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();window.__T=0;window.__mis=[];window.__ms={}});
await page.waitForTimeout(300);await shot('start');
const step=async(sec)=>page.evaluate((sec)=>{const g=__game,ev=[];const n=Math.round(sec/0.1);
  for(let i=0;i<n;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;
   if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>0.15){dx/=L;dz/=L}else{dx=dz=0}}
   g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);window.__T+=0.1;
   if(i%5===0){const hs=g.hintState();if(o&&o.ok&&hs.arrow&&Math.hypot(hs.x-o.x,hs.z-o.z)>3)window.__mis.push([+window.__T.toFixed(1),hs.lb,[+hs.x.toFixed(1),+hs.z.toFixed(1)],[+o.x.toFixed(1),+o.z.toFixed(1)]]);
    if(o&&o.ok&&!hs.arrow&&!window.__noarr)window.__noarr=(window.__noarr||0)+1}}
  const s=g.S;return {T:window.__T,m:Math.round(s.money),lv:JSON.stringify(s.lv).slice(0,80),st:JSON.stringify(g.stats),hs:g.hintState(),o:g.objective(),tut:s.tut}},sec);
const marks=[['m>0',r=>r.m>0],['m>=20',r=>r.m>=20],['m>=100',r=>r.m>=100],['m>=300',r=>r.m>=300]];
let seen={},last=0;
for(let t=0;t<700;t+=4){const r=await step(4);
  for(const [k,f] of marks) if(!seen[k]&&f(r)){seen[k]=1;await shot(k.replace(/[^\w]/g,'_')+'_t'+Math.round(r.T))}
  if(Math.round(r.T)%60===0&&Math.round(r.T)!==last){last=Math.round(r.T);await shot('t'+last+'_m'+r.m)}
  if(t%40===0)console.log(Math.round(r.T),'m',r.m,'tut',r.tut,r.hs.lb,'|',r.lv)}
const x=await page.evaluate(()=>({mis:window.__mis.slice(0,15),n:window.__mis.length,noarr:window.__noarr}));
console.log(JSON.stringify(x),errs.slice(0,5));await b.close()})();
