// Bastan sona bot + her yeni acilan bolge/pad icin ekran goruntusu: docs/qa/sahil_<ad>.png. node tests/sahil/playshots.js [dakika=90]
const h=require('./h.js'),fs=require('fs');
(async()=>{const MIN=+process.argv[2]||90;fs.mkdirSync(__dirname+'/../../docs/qa',{recursive:true});
const {b,page,errs}=await h.open({q:'high',w:390,h:844,wait:1500});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();window.__seen={};window.__T=0;
 window.__chunk=(sec)=>{const g=__game,ev=[];const n=Math.round(sec/0.1);
  for(let i=0;i<n;i++){g.bot(0,0);const p=g.P().group.position;let dx=0,dz=0;
   if(i%5===0||!window.__o){window.__o=g.objective();window.__pa=null}const o=window.__o;
   if(o&&o.ok){if(!window.__pa||i%10===0)window.__pa=g.path(o.x,o.z);const pa=window.__pa;let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>(o.kind==='harvest'?0.7:0.15)){dx/=L;dz/=L}else{dx=dz=0}}
   g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);window.__T+=0.1;
   if(i%10===0){for(const k in g.upPads){const u=g.upPads[k];const key=k+':'+g.S.lv[k];if(g.S.lv[k]>0&&!window.__seen[key]&&!window.__seen['u'+k]){window.__seen['u'+k]=1;window.__seen[key]=1;ev.push(['pad_'+k,p.x,p.z])}}
    for(const id in g.EXTZ){if(!g.EXTZ[id].locked&&!window.__seen['z'+id]){window.__seen['z'+id]=1;ev.push(['zone_'+id,g.EXTZ[id].x,g.EXTZ[id].z])}}
    if(g.zone2&&!g.zone2.locked&&!window.__seen.z2){window.__seen.z2=1;ev.push(['zone_sera',p.x,p.z])}
    if(g.zone3&&!g.zone3.locked&&!window.__seen.z3){window.__seen.z3=1;ev.push(['zone_van',p.x,p.z])}}}
  return {T:window.__T,ev,m:Math.round(g.S.money)}}});
for(let T=0;T<MIN*60;T+=10){const r=await page.evaluate(()=>window.__chunk(10));
  for(const e of r.ev){console.log(Math.round(r.T)+'s',e[0],'$'+r.m);
   await page.evaluate(()=>{window.__freeze=true});await h.shot(page,__dirname+'/../../docs/qa/sahil_'+e[0]);}}
await h.shot(page,__dirname+'/../../docs/qa/sahil_final');console.log('errs',errs.filter(e=>!/vibrate/.test(e)).slice(0,5));await b.close()})();
