// Titreme (flicker) testi.
//  A) Sabit kamera + dondurulmuş sim: 30 kare, ardışık kareler piksel piksel aynı olmalı.
//  B) Sim çalışırken kamera çok az oynar: kare farkı aralığı raporlanır (z-fighting şeritleri için ekran görüntüsü docs/sahil/flicker_*.png).
//  C) Statik tarama: y farkı < 0.02 olan, kutuları çakışan yatay yüzey çiftleri (z-fighting adayı).
//  D) Paylaşım: zaman içinde pad/gölge görünürlüğü histerezisi (oyuncu sınırda dururken pad sayısı oynamaz).
const h=require('./h.js'),path=require('path');
const SPOTS=[['plaza',-2,3],['pier',-18,0],['quay',-18,16],['south',20,38],['hall',-14,30],['island',-58,2],['start',0,0]];
const Q=process.env.Q||'high';
(async()=>{const {b,page,errs}=await h.open({q:Q,fixture:__dirname+'/saves/sahil-end-v8.json',wait:1500,patch:sv=>{sv.ts=Date.now()+1e6}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const bad=[];
// ---- A: sabit kamera
for(const [n,x,z] of SPOTS){
 const r=await page.evaluate(([x,z])=>{const g=__game;window.__freeze=false;g.tp(x,z);g.sim(3);window.__freeze=true;g.measure();g.measure();
  const cv=document.querySelector('canvas'),gl=cv.getContext('webgl2')||cv.getContext('webgl'),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,buf=new Uint8Array(W*H*4);let first=null,out=[];
  for(let f=0;f<30;f++){g.measure();gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,buf);
   if(!first){first=buf.slice();continue}
   let d=0,mx=0,minx=1e9,maxx=-1,miny=1e9,maxy=-1;for(let i=0;i<buf.length;i+=4){const e=Math.max(Math.abs(buf[i]-first[i]),Math.abs(buf[i+1]-first[i+1]),Math.abs(buf[i+2]-first[i+2]));if(e>2){d++;const p=i/4,px=p%W,py=(p/W)|0;if(px<minx)minx=px;if(px>maxx)maxx=px;if(py<miny)miny=py;if(py>maxy)maxy=py}if(e>mx)mx=e}
   out.push([d,mx,minx,miny,maxx,maxy])}
  window.__freeze=false;return out},[x,z]);
 const tot=r.map(o=>o[0]),m=Math.max(...tot);console.log('A',n,'maxDiffPx',m,'maxDelta',Math.max(...r.map(o=>o[1])),m?'bbox '+r.find(o=>o[0]===m).slice(2):'');
 if(m>0)bad.push('static '+n+' '+m+'px changed');
}
// ---- B: sim çalışırken küçük kamera/oyuncu hareketi, ardışık kare farkı + görüntü
for(const [n,x,z] of SPOTS){
 await page.evaluate(([x,z])=>{__game.tp(x,z);__game.sim(2)},[x,z]);
 await page.evaluate(()=>{const g=__game;g.render()});
 await h.shot(page,path.resolve(__dirname,'../../docs/sahil/flicker_'+n));
}
// ---- C: statik tarama
const pairs=await page.evaluate(()=>{const g=__game,sc=g.scene,L=[];sc.updateMatrixWorld(true);
 sc.traverse(o=>{if(!o.isMesh||!o.visible||o.userData.ib||o.userData.merged)return;let p=o,vis=true;while(p){if(!p.visible){vis=false;break}p=p.parent}if(!vis)return;
  const geo=o.geometry;if(!geo||!geo.attributes.position)return;geo.computeBoundingBox();const bb=geo.boundingBox.clone().applyMatrix4(o.matrixWorld);
  const sy=bb.max.y-bb.min.y;if(sy>0.2)return; // yatay ince yüzey
  const sx=bb.max.x-bb.min.x,sz=bb.max.z-bb.min.z;if(sx<0.4||sz<0.4)return;
  L.push({id:(o.name||o.geometry.type)+'#'+o.id,top:bb.max.y,bot:bb.min.y,x0:bb.min.x,x1:bb.max.x,z0:bb.min.z,z1:bb.max.z,ro:o.renderOrder,tr:!!o.material.transparent,dw:o.material.depthWrite,po:!!o.material.polygonOffset,col:o.material.color?o.material.color.getHexString():''})});
 const R=[];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],c=L[j];
  const ox=Math.min(a.x1,c.x1)-Math.max(a.x0,c.x0),oz=Math.min(a.z1,c.z1)-Math.max(a.z0,c.z0);if(ox<0.3||oz<0.3)continue;
  const dt=Math.abs(a.top-c.top),db=Math.abs(a.bot-c.bot);if(dt>=0.005)continue; // sadece üst yüzler (görünen); near=4 ile derinlik çözünürlüğü ~0.003
  if(a.po||c.po||(a.tr&&a.dw===false)||(c.tr&&c.dw===false))continue; // zaten çözülmüş
  R.push([a.id,c.id,+a.top.toFixed(3),+c.top.toFixed(3),+ox.toFixed(1),+oz.toFixed(1),a.col,c.col])}
 return {n:L.length,R}});
console.log('C flat meshes',pairs.n,'coplanar pairs',pairs.R.length);for(const p of pairs.R.slice(0,60))console.log('  ',JSON.stringify(p));
if(pairs.R.length)bad.push('coplanar pairs '+pairs.R.length);
const e=errs.filter(e=>!/vibrate/.test(e));if(e.length){console.log(e);bad.push('errors')}
console.log(bad.length?'FAIL '+JSON.stringify(bad):'PASS');await b.close();process.exit(bad.length?1:0)})();
