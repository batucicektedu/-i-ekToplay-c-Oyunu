// Uzun oyun kararlılığı: otomasyon kayıtta 60 dk benzetim (bot oynar), 5 dk'da bir nesne/bellek sayımı. MIN=60 FX=saves/c3-v10-auto.json
const h=require('./h.js');
(async()=>{const MIN=+process.env.MIN||60;
const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:__dirname+'/'+(process.env.FX||'saves/c3-v10-auto.json'),patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;sv.seen=sv.seen||{};sv.seen.fin=1}});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();
 window.__cnt=()=>{const g=__game;let n=0,v=0,mesh=0;g.scene.traverse(o=>{n++;if(o.visible)v++;if(o.isMesh)mesh++});const i=g.renderer.info.memory;return {objs:n,meshes:mesh,heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1e5)/10:0,later:g.laterLen?g.laterLen():-1,geo:i.geometries,tex:i.textures,money:Math.round(g.S.money)}};
 window.__chunk=(sec)=>{const g=__game;for(let i=0;i<sec*10;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>0.15){dx/=L;dz/=L}else{dx=dz=0}}g.bot(dx||1e-6,dz||1e-6);g.sim(0.1)}}});
const rows=[];
for(let m=0;m<=MIN;m+=5){const c=await page.evaluate(()=>window.__cnt());rows.push(c);console.log(m,JSON.stringify(c));
 if(m<MIN)for(let k=0;k<5;k++)await page.evaluate(()=>window.__chunk(60));}
const f=rows[2],l=rows[rows.length-1];const bad=[];if(l.geo>f.geo+150)bad.push('geometries '+f.geo+'->'+l.geo);if(l.tex>f.tex+20)bad.push('textures '+f.tex+'->'+l.tex);if(l.later>200)bad.push('later '+l.later);
if(l.objs>f.objs*1.15+50)bad.push('objs '+f.objs+'->'+l.objs);if(l.meshes>f.meshes*1.15+50)bad.push('meshes '+f.meshes+'->'+l.meshes);if(f.heap&&l.heap>f.heap*1.6+20)bad.push('heap '+f.heap+'->'+l.heap);
console.log(errs.slice(0,5));if(errs.length)bad.push('errors');console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
