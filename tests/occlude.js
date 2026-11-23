// Örtülme testi: pad/bölge/ok hedefi bir binanın/prop'un altında ya da arkasında mı? (kamera -> hedef ışını + pad ayak izi / statik üçgen kesişimi)
// Kullanım: GAME=http://localhost:8123/index.html node tests/occlude.js   |  FIX=dosya.json ...   |  V=1 ayrıntı
const h=require('./h.js'),fs=require('fs');
const dir=__dirname+'/saves/';
const fixtures=process.env.FIX?process.env.FIX.split(','):[__dirname+'/max.json',...fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>dir+f)];
(async()=>{let total=0;
for(const fx of fixtures){
 const {b,page,errs}=await h.open({q:'low',fixture:fx,wait:1500});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
 await page.evaluate((m)=>{window.__maxfx=m},fx.endsWith('max.json'));
 await page.evaluate(m=>{window.__isMax=m},fx.endsWith('max.json'));
 const r=await page.evaluate(()=>{
  const g=__game,sc=g.scene,cam=g.camera,P=g.P(),probs=[],info={pads:0,zones:0,hints:0};
  // --- statik mesh listesi: birleştirilmiş dünya/bölge mesh'leri (karakter parçaları hariç). Kilitli bölge yer tutucuları ayrı listelenir.
  sc.updateMatrixWorld(true);
  const lg=new Set([g.zone2&&g.zone2.lockedGroup,g.zone3&&g.zone3.lockedGroup,...Object.values(g.EXTZ||{}).map(z=>z&&z.lockedGroup)].filter(Boolean));
  const meshes=[];sc.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.userData.merged||o.userData.chr)return;let v=true,locked=false,q=o;while(q){if(!q.visible)v=false;if(lg.has(q))locked=true;q=q.parent}meshes.push({o,v,locked})});
  const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
  const mkTris=(pred)=>{const tris=[];for(const m of meshes){if(!pred(m))continue;const pa=m.o.geometry.attributes.position,mw=m.o.matrixWorld;for(let i=0;i+2<pa.count;i+=3){A.fromBufferAttribute(pa,i).applyMatrix4(mw);B.fromBufferAttribute(pa,i+1).applyMatrix4(mw);C.fromBufferAttribute(pa,i+2).applyMatrix4(mw);
    const y1=Math.max(A.y,B.y,C.y);if(y1<0.12)continue;tris.push(A.x,A.z,B.x,B.z,C.x,C.z,Math.min(A.y,B.y,C.y),y1)}}return tris};
  // görünür (yer tutucular dahil) ve yer tutucusuz (kilitli bölgeler açılmış gibi) iki set
  const SETS={vis:{tris:mkTris(m=>m.v),tg:meshes.filter(m=>m.v).map(m=>m.o)},all:{tris:mkTris(m=>!m.locked),tg:meshes.filter(m=>!m.locked).map(m=>m.o)}};let tris=SETS.vis.tris,tg=SETS.vis.tg;
  const useSet=n=>{tris=SETS[n].tris;tg=SETS[n].tg};
  // üçgen / dikdörtgen (XZ) ayırıcı eksen testi
  const triRect=(i,x0,x1,z0,z1)=>{const ax=tris[i],az=tris[i+1],bx=tris[i+2],bz=tris[i+3],cx=tris[i+4],cz=tris[i+5];
   if(Math.max(ax,bx,cx)<=x0||Math.min(ax,bx,cx)>=x1||Math.max(az,bz,cz)<=z0||Math.min(az,bz,cz)>=z1)return false;
   const V=[[ax,az],[bx,bz],[cx,cz]],R=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
   for(let k=0;k<3;k++){const p=V[k],q=V[(k+1)%3],nx=-(q[1]-p[1]),nz=q[0]-p[0];let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const v of V){const d=v[0]*nx+v[1]*nz;a0=Math.min(a0,d);a1=Math.max(a1,d)}for(const v of R){const d=v[0]*nx+v[1]*nz;b0=Math.min(b0,d);b1=Math.max(b1,d)}if(a1<=b0+1e-6||b1<=a0+1e-6)return false}
   return true};
  const rc=new THREE.Raycaster();
  const camAt=(x,z)=>{g.camAt(x,z);cam.updateProjectionMatrix()};
  const occl=(x,y,z,minY)=>{const o=cam.position,d=new THREE.Vector3(x,y,z).sub(o),L=d.length();d.normalize();rc.set(o,d);rc.near=0;rc.far=L-0.05;const hs=rc.intersectObjects(tg,false).filter(q=>q.point.y>(minY||0.12));return hs.length?hs[0]:null};
  const fp=(x,z,hw,hd)=>{let top=0,lo=1e9,bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;for(let i=0;i<tris.length;i+=8){if(tris[i+7]>0.7&&tris[i+6]<2.2&&triRect(i,x-hw,x+hw,z-hd,z+hd)){top=Math.max(top,tris[i+7]);lo=Math.min(lo,tris[i+6]);for(const k of [0,2,4]){bx0=Math.min(bx0,tris[i+k]);bx1=Math.max(bx1,tris[i+k]);bz0=Math.min(bz0,tris[i+k+1]);bz1=Math.max(bz1,tris[i+k+1])}}}return top?[top,lo,bx0,bx1,bz0,bz1]:null};
  const test=(tag,x,z,w,d,vis,gy)=>{gy=gy||0.04; if(!vis){w*=0.7;d*=0.7}
  
   // ayak izi
   const t=vis?fp(x,z,w/2-(vis?0.3:-0.0)*1,d/2-(vis?0.3:0)):null;if(t)probs.push([tag,'footprint',+x.toFixed(1),+z.toFixed(1),'y='+t[1].toFixed(1)+'..'+t[0].toFixed(1),'box x'+t[2].toFixed(1)+'..'+t[3].toFixed(1)+' z'+t[4].toFixed(1)+'..'+t[5].toFixed(1)]);
   // ışınlar: oyuncu pad üstünde / 5 birim güneyde / 5 birim kuzeyde
   for(const oz of [0,5,-5]){camAt(x,z+oz);if(Math.hypot(P.group.position.x-x,P.group.position.z-(z+oz))>1.5)continue;const pts=[[0,0],[1,1],[-1,1],[1,-1],[-1,-1]].map(([a,c])=>[x+a*w*0.35,z+c*d*0.35]);const hit=pts.map(([px,pz])=>occl(px,gy+0.06,pz,gy+0.1));
    const c0=hit[0],nh=hit.slice(1).filter(Boolean).length;if(vis?(c0||nh>=3):(c0&&c0.point.y>=1.2&&nh>=3)){probs.push([tag,'occluded',+x.toFixed(1),+z.toFixed(1),'view z+'+oz,c0?'center':'corners='+nh,'by y='+(c0||hit.find(Boolean)).point.y.toFixed(1)+' @'+(c0||hit.find(Boolean)).point.x.toFixed(1)+','+(c0||hit.find(Boolean)).point.z.toFixed(1)]);break}}
  };
  const pads=g.allPads(),ps=new Set(pads);
  for(const p of pads){useSet(p.group.visible?'vis':'all');info.pads++;test('pad:'+(p.key||(p.o&&p.o.id)||'cpad'),p.x,p.z,p.w,p.d,true,p.group.position.y)}
  if(window.__isMax)for(const p of pads){g.tp(8,2);if(!g.pathOK(p.x,p.z)||[[0,0],[1,0],[-1,0],[0,1],[0,-1]].every(([a,c])=>g.blockedAt(p.x+a*1.2,p.z+c*1.2)))probs.push(['pad:'+(p.key||'cpad'),'unreachable',+p.x.toFixed(1),+p.z.toFixed(1),'pad cannot be reached from the plaza'])} // tüm bölgeler açıkken her pad'e yürünebilmeli
  useSet('vis');for(const z of g.zones){if(ps.has(z)||g.c2.CPADS.includes(z)||!z.group.visible||z.w<0.5)continue;info.zones++;test('zone',z.x,z.z,z.w,z.d,false,z.group.position.y)}
  // --- ok/ipucu hedefleri
  const seen=new Set(),CARRY=['none','bouquet','pot','sachet','perfume','sbq','tea','orchid','lav','sun','rosep','flower'],spots=[[-5.5,2.6],[20,-60],[-10,-130]],S=g.S;
  const mon=S.money;
  for(const money of [0,1e9])for(const tag of CARRY)for(const sp of spots){while(P.stack.length)P.stack.items.pop();if(tag!=='none')g.give(tag,4);g.tp(sp[0],sp[1]);S.money=money;g.sim(0.05);S.money=money;const o=g.objective();if(!o.ok)continue;const k=o.kind+'@'+o.x.toFixed(1)+','+o.z.toFixed(1);if(seen.has(k))continue;seen.add(k);info.hints++;
    g.tp(8,2);const pathOK=g.pathOK(o.x,o.z); // başlangıç plazasından erişilebilirlik
    let bad=null;camAt(o.x,o.z+3);if(Math.hypot(P.group.position.x-o.x,P.group.position.z-(o.z+3))>1.5){camAt(o.x,o.z)}const hit=occl(o.x,o.y,o.z);const tipHit=occl(o.x,o.y+1.9,o.z);
    const nc=[[1,1],[-1,1],[1,-1],[-1,-1]].filter(([a,c])=>occl(o.x+a*0.85,0.1,o.z+c*0.85,0.22)).length;
    if(o.kind==='harvest'){}else if(hit&&hit.point.y>=1.2&&nc>=3)bad='target occluded by y='+hit.point.y.toFixed(1)+' @'+hit.point.x.toFixed(1)+','+hit.point.z.toFixed(1);
    if(tipHit&&occl(o.x,o.y+3.2,o.z,0.12)&&!bad&&o.kind!=='harvest')bad='arrow (tip and tail) occluded';
    if(!pathOK&&o.kind!=='harvest')bad=(bad?bad+'; ':'')+'unreachable (no A* path)';
    if(o.kind!=='harvest'&&[[0,0],[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]].every(([a,c])=>g.blockedAt(o.x+a*1.1,o.z+c*1.1)))bad=(bad?bad+'; ':'')+'target cell blocked';
    if(bad)probs.push(['hint:'+o.kind,'hint',+o.x.toFixed(1),+o.z.toFixed(1),bad])}
  S.money=mon;
  return {probs,info,tris:SETS.all.tris.length/8,meshes:meshes.length,fix:window.__padFix&&window.__padFix.moved.length}});
 const bad=r.probs.length+errs.length;total+=bad;
 console.log(fx.split('/').pop(),JSON.stringify(r.info),'tris',r.tris,'meshes',r.meshes,'moved',r.fix,'problems',r.probs.length);
 const lim=process.env.V?999:12;r.probs.slice(0,lim).forEach(p=>console.log('  ',JSON.stringify(p)));if(r.probs.length>lim)console.log('  ...');
 if(errs.length)console.log('  ERRS',errs);
 await b.close();}
console.log(total?'FAIL '+total+' problems':'PASS 0 problems');process.exit(total?1:0)})();
