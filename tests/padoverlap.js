// Pad çakışma denetimi: prop/collider/yol/çiçek yatağı/pad + TÜM etkileşim bölgeleri (bırakma/alma/para/müşteri/kuyruk...). Hedef: 0 çakışma, pad-bölge kenar boşluğu >= 0.8.
// Kullanım: node padoverlap.js  (tüm örnek kayıtlar + max.json)   |  FIX=dosya.json node padoverlap.js
const h=require('./h.js'),fs=require('fs');
const dir=__dirname+'/saves/';
const fixtures=process.env.FIX?[process.env.FIX]:[__dirname+'/max.json',...fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>dir+f)];
(async()=>{let all=true;
for(const fx of fixtures){
 const {b,page,errs}=await h.open({q:'low',fixture:fx,wait:1500});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
 const r=await page.evaluate(()=>{const g=__game,pads=g.allPads(),ps=new Set(pads),zs=g.c2.zonesAll.filter(z=>!ps.has(z)&&!g.c2.CPADS.includes(z)),GAP=0.8-1e-6,zh=[];
  const rects=zs.map(z=>[z.x-z.w/2,z.x+z.w/2,z.z-z.d/2,z.z+z.d/2,'zone@'+z.x.toFixed(1)+','+z.z.toFixed(1)]);rects.push([9,11,-2.3,7.7,'queue']);
  for(const p of pads){const hw=p.w/2+GAP,hd=p.d/2+GAP;for(const r of rects)if(r[0]<p.x+hw&&r[1]>p.x-hw&&r[2]<p.z+hd&&r[3]>p.z-hd)zh.push([p.key||(p.o&&p.o.id)||'?',+p.x.toFixed(1),+p.z.toFixed(1),r[4]]);}
  return {fixBad:window.__padFix&&window.__padFix.bad,moved:window.__padFix&&window.__padFix.moved.length,hits:g.padCheck(),zoneHits:zh,n:pads.length,nz:rects.length}});
 const ok=!r.hits.length&&!r.zoneHits.length&&!r.fixBad&&!errs.length;all=all&&ok;
 console.log(fx.split('/').pop(),JSON.stringify(r),errs.length?errs:'',ok?'PASS':'FAIL');await b.close();}
console.log(all?'PASS 0 overlaps':'FAIL');process.exit(all?0:1)})();
