// FTUE: taze kayıt, bot hedef okunu izler; belirli anlarda ekran görüntüsü; ok/objective tutarlılığı. W=390 H=844 node tests/ciftlik/ftue.js
const h=require('./h.js'),path=require('path');
(async()=>{const W=+process.env.W||390,H=+process.env.H||844,OUT=path.resolve(__dirname,'../../docs/release/ciftlik_ftue_'+(process.env.TAG?process.env.TAG+'_':''));
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
const mk=(k,f)=>({k,f,done:false});
const marks=[mk('ilk_yumurta',r=>r.st.harvested>=1),mk('ilk_koli',r=>r.st.packed>=1),mk('ilk_satis',r=>r.st.sold>=1),mk('ilk_para',r=>r.st.collected>=1),mk('ilk_pad',r=>r.st.upgrades>=1),mk('ilk_kasiyer',r=>(r.lvm.cashier||0)>=1),mk('ilk_yardimci',r=>(r.lvm.helper||0)>=1),mk('ilk_tasiyici',r=>(r.lvm.carrier||0)>=1)];
const times=[1.5,5,10,20,40];let ti=0;
for(let t=0;t<(+process.env.SIM||700);t+=1){const r=await step(1);r.st=JSON.parse(r.st);r.lvm=await page.evaluate(()=>__game.S.lv);
  for(const m of marks) if(!m.done&&m.f(r)){m.done=true;await shot(m.k+'_t'+Math.round(r.T))}
  if(ti<times.length&&r.T>=times[ti]){ti++;await shot('t'+Math.round(r.T))}
  if(t%40===0)console.log(Math.round(r.T),'m',r.m,'tut',r.tut,r.hs.lb)}
const x=await page.evaluate(()=>({mis:window.__mis.slice(0,40),n:window.__mis.length,noarr:window.__noarr}));
console.log(JSON.stringify(x),errs.slice(0,5));await b.close()})();
