// Tabela/bilgi panosu (sprite) taşma testi: oyuncu ilgili bölgede dururken büyük sprite'lar ekrandan taşıyor mu? (390x844 ve 360x640)
// Kullanım: GAME=http://localhost:8123/index.html node tests/signcut.js
const h=require('./h.js');
(async()=>{let total=0;
for(const [w,hh] of [[390,844],[360,640]]){
 const {b,page,errs}=await h.open({q:'low',w,h:hh,fixture:__dirname+'/max.json',wait:1500,patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0}});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
 const r=await page.evaluate(()=>{const g=__game,cam=g.camera,sc=g.scene,out=[],V=new THREE.Vector3(),ps=new Set(g.allPads());
  const sprites=[];sc.traverse(o=>{if(o.isSprite&&o.scale.x>=3){let v=true,q=o;while(q){if(!q.visible)v=false;q=q.parent}if(v||true){const p=o.getWorldPosition(new THREE.Vector3());let dyn=false;q=o;while(q){if(q.userData&&q.userData.dyn&&q.type==='Group'&&q.parent&&q.parent.type==='Scene'){}q=q.parent}sprites.push({o,p})}}});
  const zs=g.zones.filter(z=>!ps.has(z)&&!g.c2.CPADS.includes(z)&&z.w>=1);
  for(const s of sprites){ // en yakın etkileşim bölgesi (yatay 11 birim içinde); oyuncu orada dururken
   let best=null,bd=1e9;for(const z of zs){const d=Math.hypot(z.x-s.p.x,z.z-s.p.z);if(d<bd){bd=d;best=z}}if(!best||bd>11||s.p.y<2)continue; // araç/müşteri balonları (alçak) hariç
   g.camAt(best.x,best.z);cam.updateMatrixWorld(true);cam.updateProjectionMatrix();const view=s.p.clone().applyMatrix4(cam.matrixWorldInverse);const hw=s.o.scale.x/2,hh2=s.o.scale.y/2;let xl=1e9,xr=-1e9,yt=-1e9,yb=1e9;
   for(const [a,c] of [[-1,-1],[1,-1],[-1,1],[1,1]]){V.set(view.x+a*hw,view.y+c*hh2,view.z).applyMatrix4(cam.projectionMatrix);xl=Math.min(xl,V.x);xr=Math.max(xr,V.x);yt=Math.max(yt,V.y);yb=Math.min(yb,V.y)}
   const cut=Math.max(0,-1-xl,xr-1);// NDC taşma (iki yan toplam 2 birim = ekran genişliği)
   const vis=Math.max(0,Math.min(1,xr)-Math.max(-1,xl))/(xr-xl);
   if(vis<0.97||yt>1.02)out.push(['sprite@'+s.p.x.toFixed(1)+','+s.p.y.toFixed(1)+','+s.p.z.toFixed(1)+' '+s.o.scale.x.toFixed(1)+'x'+s.o.scale.y.toFixed(1),'zone '+best.x.toFixed(1)+','+best.z.toFixed(1),'visibleX '+(vis*100).toFixed(0)+'%',yt>1.02?'topcut':''])}
  return out});
 total+=r.length;console.log(w+'x'+hh,r.length?JSON.stringify(r,null,0):'ok');r.forEach(x=>console.log('  ',JSON.stringify(x)));
 if(errs.length){console.log(errs);total+=errs.length}await b.close()}
console.log(total?'FAIL '+total:'PASS');process.exit(total?1:0)})();
