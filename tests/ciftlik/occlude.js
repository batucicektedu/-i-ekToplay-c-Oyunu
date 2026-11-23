// Görünürlük (occlusion) denetimi: pad/bölge/kapı/rehber-ok hedefi kameradan bir bina/prop/ağaç tarafından örtülüyor mu?
//  1) kameradan hedef merkezine (ve ok ucuna) ışın: önce statik bir mesh'e çarparsa rapor
//  2) pad ayak izi, statik mesh dünya kutularıyla (ahır, silo, değirmen, çit, ağaç tacı...) kesişiyor mu (PROPALL)
//  3) hint hedefi A* ile ulaşılabilir ve ekranda mı
// Her fixture için: görünür pad'ler + (hepsi açık varsayımıyla) tüm pad'ler denetlenir. Hedef: 0 sorun.
const fs=require('fs'),path=require('path'),h=require('./h.js');
const dirs=[path.join(__dirname,'saves'),__dirname];
let files=[];for(const d of dirs)for(const f of fs.readdirSync(d))if(f.endsWith('.json'))files.push(path.join(d,f));
if(process.env.FIX)files=[process.env.FIX];
files.push(null); // taze oyun
let total=0;
(async()=>{
for(const f of files){
 const name=f?path.relative(__dirname,f):'(taze)';
 const {b,page,errs}=await h.open({q:'low',w:390,h:844,wait:1200,fixture:f||undefined,patch:f?s=>{s.ts=Date.now()+1e6}:undefined});
 const res=await page.evaluate(()=>{
  window.__resetting=false;__game.hideIntro();const G=__game,T=THREE,scene=G.scene,cam=G.camera,out=[];
  const rc=new T.Raycaster();rc.camera=cam;
  const visChain=o=>{for(let p=o;p;p=p.parent)if(p.visible===false)return false;return true};
  const label=m=>{const bb=new T.Box3().setFromObject(m),s=bb.getSize(new T.Vector3()),c=bb.getCenter(new T.Vector3());return 'mesh@'+c.x.toFixed(1)+','+c.y.toFixed(1)+','+c.z.toFixed(1)+' size '+s.x.toFixed(1)+'x'+s.y.toFixed(1)+'x'+s.z.toFixed(1)};
  const tri=hit=>{if(!hit.object.userData.merged){const o=hit.object,t=topOf(o);return 'DYN '+o.geometry.type+' mat='+(o.material.type)+' col='+(o.material.color&&o.material.color.getHexString())+' kids='+JSON.stringify(t.children.map(k=>[k.type,k.children.length,k.userData,k.position.y,k.scale.x]))+' top='+t.type+'@'+t.position.x.toFixed(1)+','+t.position.y.toFixed(1)+','+t.position.z.toFixed(1)+' chain='+(()=>{let r=[];for(let q=o;q;q=q.parent)r.push(q.type+'['+q.children.length+']@'+q.position.x.toFixed(1)+','+q.position.y.toFixed(1)+','+q.position.z.toFixed(1)+(q.userData.dyn?'*':''));return r.join('<')})()+' hit@'+hit.point.x.toFixed(1)+','+hit.point.y.toFixed(1)+','+hit.point.z.toFixed(1)}const f=hit.face,pa=hit.object.geometry.attributes.position,bb=new T.Box3(),v=new T.Vector3();
   // çarpılan parçanın (üçgenin komşuları dahil) gerçek kutusu için yakın üçgenleri tara: aynı mesh'te hit noktasına 3 birim içindeki köşeler
   for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);if(Math.abs(v.x-hit.point.x)<1.5&&Math.abs(v.z-hit.point.z)<1.5&&v.y>-0.2)bb.expandByPoint(v)}
   return 'hit@'+hit.point.x.toFixed(1)+','+hit.point.y.toFixed(1)+','+hit.point.z.toFixed(1)+' near-box x['+bb.min.x.toFixed(1)+','+bb.max.x.toFixed(1)+'] y['+bb.min.y.toFixed(1)+','+bb.max.y.toFixed(1)+'] z['+bb.min.z.toFixed(1)+','+bb.max.z.toFixed(1)+']'};
  const settle=(x,z)=>{G.tp(x,z);G.sim(0.6);G.render();cam.updateMatrixWorld(true)};
  // statik = (a) dünya koordinatına pişmiş birleştirilmiş mesh (birim matris) ya da (b) hareketsiz, dyn işaretli bina grubu (tezgâh, makine, tabela...).
  // karakter (oyuncu, işçi, müşteri, at, hayvan), yığınlar ve zone grafikleri sayılmaz.
  const topOf=o=>{while(o.parent&&o.parent!==scene)o=o.parent;return o};
  const skip=new Set([G.P().group,...G.zones.map(z=>z.group),...G.customers.map(c=>c.group),...(G.RH||[]).map(h=>h.group)]);
  [G.helper&&G.helper(),G.cashier,G.carrier].forEach(w=>{if(w&&w.group)skip.add(w.group)});
  const pos0=new Map();scene.children.forEach(c=>{c.updateWorldMatrix(true,false);pos0.set(c,c.position.clone())});G.sim(1.5);
  const moving=new Set();scene.children.forEach(c=>{const p=pos0.get(c);if(!p||p.distanceTo(c.position)>0.02||c.visible===false)moving.add(c)});
  const isStatic=o=>{const top=topOf(o);if(skip.has(top)||moving.has(top)||top.userData.isChar||top.children.some(k=>k.userData&&k.userData.ns))return false; // ns = blob gölgesi olan canlı (karakter, hayvan)
   if(o.userData.merged){o.updateWorldMatrix(true,false);const e=o.matrixWorld.elements;for(let i=0;i<16;i++)if(Math.abs(e[i]-((i%5)?0:1))>1e-6)return false;return true}
   // pişmemiş mesh: yalnız ziyaretçi gövdesi değil, yeterince büyük (>0.9 yüksek) sahne nesneleri
   if(!top.userData||top.userData.dyn!==true)return false;const bb=new T.Box3().setFromObject(top),sz=bb.getSize(new T.Vector3());return Math.max(sz.x,sz.z)>2.4&&sz.y>0.9}; // karakter (dar) değil bina/tezgâh (geniş)
  // statik kapayıcı: görünür, gerçek (opak) mesh, yerden yüksek; karakter/zone/ok değil
  const occl=(tx,ty,tz)=>{
   const from=cam.position,to=new T.Vector3(tx,ty,tz),dir=to.clone().sub(from),dist=dir.length();dir.normalize();rc.set(from,dir);rc.far=dist-0.15;
   for(const hit of rc.intersectObjects(scene.children,true)){
    const o=hit.object;if(!o.isMesh||o.isInstancedMesh||!visChain(o))continue;
    const m=o.material;if(!m||Array.isArray(m)||m.transparent||m.depthWrite===false||m.opacity<1||m.depthTest===false)continue;
    if(hit.point.y<0.5)continue; // zemin/yol/çim
    if(!isStatic(o))continue;
    return tri(hit);
   }return null;
  };
  // çok noktalı örnekleme: ince direk gibi küçük engeller değil, bina/ağaç gibi gerçekten örten şeyler raporlanır
  const occN=(x,y,z,hw,hd)=>{const pts=[[0,0],[-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd]];let n=0,first=null,c0=false;for(const [dx,dz] of pts){const r=occl(x+dx,y,z+dz);if(r){n++;if(!first)first=r;if(!dx&&!dz)c0=true}}return c0&&n>=2?n+'/5 '+first:null};
  const items=[];
  const addZones=(tag)=>{for(const z of G.zones){if(!visChain(z.group))continue;if(z.w<0.5)continue;items.push({k:(z.key||z.constructor.name)+'#'+Math.round(z.x)+','+Math.round(z.z),x:z.x,z:z.z,y:0.4,w:z.w,d:z.d,tag})}};
  addZones('visible');
  const o=G.objective();if(o.ok)items.push({k:'HINT:'+o.kind,x:o.x,z:o.z,y:o.y+1.9,hint:true,w:1,d:1,tag:'hint'});
  for(const it of items){
   settle(it.x,it.z);
   const oc=occN(it.x,it.y,it.z,it.hint?0.6:it.w*0.3,it.hint?0.01:it.d*0.3);if(oc)out.push([it.tag,it.k,'ışın örtülü',oc]);
   if(it.hint){const v=new T.Vector3(it.x,it.y,it.z).project(cam);if(Math.abs(v.x)>1||Math.abs(v.y)>1)out.push([it.tag,it.k,'ekran dışı',v.x.toFixed(2)+','+v.y.toFixed(2)]);
    const pth=G.path(it.x,it.z);const end=pth[pth.length-1];if(!pth||pth.length<2)out.push([it.tag,it.k,'yol yok','']);
    // A* gerçekten bir yol buldu mu (düz çizgi + engelli değil)? colliders ile kontrol
    const blocked=G.colliders.some(c=>(!c.active||c.active())&&it.x>c.x0-0.3&&it.x<c.x1+0.3&&it.z>c.z0-0.3&&it.z<c.z1+0.3);if(blocked)out.push([it.tag,it.k,'hedef collider içinde','']);}
  }
  // yaklaşma denetimi: rehber yolu üzerinde hedefin 12/8/4 birim gerisinde kamera hedefi görüyor mu (oyuncu pad'e varmadan önce ok/pad görünmeli)
  const approach=(k,x,z,y,w,d)=>{G.tp(G.CFG.start.x,G.CFG.start.z);G.sim(0.3);const pth=G.path(x,z);if(!pth||pth.length<2)return;
   // yol boyunca hedeften geriye doğru d mesafedeki nokta
   const at=back=>{let rem=back;for(let i=pth.length-1;i>0;i--){const a=pth[i],b=pth[i-1],l=Math.hypot(a[0]-b[0],a[1]-b[1]);if(rem<=l){const f=rem/l;return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}rem-=l}return null};
   for(const bk of [12,8,4]){const q=at(bk);if(!q)continue;settle(q[0],q[1]);const oc=occN(x,y,z,w*0.3,d*0.3);if(oc)out.push(['approach',k+'@-'+bk,'yaklaşırken örtülü',oc+' from '+q[0].toFixed(1)+','+q[1].toFixed(1)])}};
  for(const p of G.allPads()){if(p.done||!p.group.visible)continue;approach(p.key,p.x,p.z,0.4,p.w,p.d)}
  {const o2=G.objective();if(o2.ok)approach('HINT:'+o2.kind,o2.x,o2.z,o2.y,1,1)}
  // tüm pad'ler (hepsi açık varsayımıyla): kapalı olanları geçici aç
  const savedAct=G.colliders.map(c=>c.active);G.colliders.forEach(c=>{c.active=()=>false}); // kilitli bölgedeki pad'e de kamera gidebilsin
  const pads=G.allPads(),was=pads.map(p=>[p.group.visible,p.done]);
  for(const p of pads){if(p.done||(p.vis&&!p.vis()))continue;p.group.visible=true;settle(p.x,p.z);
   const oc=occN(p.x,0.4,p.z,p.w*0.3,p.d*0.3);if(oc)out.push(['all',p.key,'ışın örtülü',oc]);
   const oc2=occN(p.x,2.3,p.z,0.6,0.01);if(oc2)out.push(['all',p.key,'ok ucu örtülü',oc2]);
   const fp=G.padMeshHit(p,p.x,p.z);if(fp)out.push(['all',p.key,'ayak izi mesh kutusunda',fp]);}
  pads.forEach((p,i)=>{p.group.visible=was[i][0]});G.colliders.forEach((c,i)=>{c.active=savedAct[i]});
  // diğer bölgeler/kapılar için de ayak izi
  for(const z of G.zones){if(z.key||!visChain(z.group)||z.w<1.5||z.label.scale.x<0.1)continue;const fp=G.padMeshHit(z,z.x,z.z,-0.2);if(fp)out.push(['zone',z.constructor.name+'#'+Math.round(z.x)+','+Math.round(z.z),'ayak izi mesh kutusunda',fp])}
  return out;
 });
 console.log(name,res.length?'':'ok');for(const r of res)console.log('  ',r.join(' | '));
 if(errs.length){console.log('  errs',errs.slice(0,2));total++}
 total+=res.length;await b.close();
}
console.log(total?'FAIL '+total+' sorun':'PASS 0 sorun');process.exit(total?1:0)})();
