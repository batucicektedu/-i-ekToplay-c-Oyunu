// Oynanış botu: node tests/ciftlik/bot.js [dakika=60] [kayıt_çıktı.json] -> açılış zaman çizelgesi (benzetim süresi)
const h=require('./h.js'),fs=require('fs');
(async()=>{const MIN=+process.argv[2]||60,OUT=process.argv[3];
const {b,page,errs}=await h.open({q:'low',w:200,h:300,wait:1200,fixture:process.env.FIX});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();window.__seen={};window.__T=0;
 window.__chunk=(sec)=>{const g=__game,ev=[];const n=Math.round(sec/0.1);
  for(let i=0;i<n;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;
   if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>0.15){dx/=L;dz/=L}else{dx=dz=0}}
   g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);window.__T+=0.1;
   if(i%10===0){for(const k in g.upPads){const u=g.upPads[k];const key=k+':'+g.S.lv[k];if(g.S.lv[k]>0&&!window.__seen[key]){window.__seen[key]=1;ev.push([k,g.S.lv[k]])}}
    for(const id in g.EXTZ){if(!g.EXTZ[id].locked&&!window.__seen['z'+id]){window.__seen['z'+id]=1;ev.push(['ZONE',id])}}
    if(g.zone2&&!g.zone2.locked&&!window.__seen.z2){window.__seen.z2=1;ev.push(['ZONE','sera'])}
    if(g.zone3&&!g.zone3.locked&&!window.__seen.z3){window.__seen.z3=1;ev.push(['ZONE','van'])}}}
  return {T:window.__T,ev,m:Math.round(g.S.money)}}});
const t0=Date.now();
for(let T=0;T<MIN*60;T+=10){const r=await page.evaluate(()=>window.__chunk(10));
  for(const e of r.ev){const mm=Math.floor(r.T/60),ss=Math.round(r.T%60);console.log((mm+':'+String(ss).padStart(2,'0')).padStart(7),e.join(' '),'$'+r.m)}}
if(OUT){const sv=await page.evaluate(()=>{__game.sim(0.1);dispatchEvent(new Event('pagehide'));return localStorage.getItem('bolum3_ciftlik')});fs.writeFileSync(OUT,JSON.stringify({key:'bolum3_ciftlik',value:JSON.parse(sv)},null,1))}
console.log('wall',((Date.now()-t0)/1000|0)+'s','errs',errs.slice(0,5));await b.close()})();
