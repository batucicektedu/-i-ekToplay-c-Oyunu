// Salınım denetimi: tüm çalışanlar tam kadro + tekneler; 10 sn pencerede yön değiştirme > 6 ve net ilerleme yok ise FAIL.
const h=require('./h.js');
(async()=>{const SEC=+process.env.SEC||120;
const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/../max.json',wait:1500,patch:sv=>{Object.assign(sv.lv,{wedW:1,portSpd:1,portCap:1,beeW:1,bonW:1,portW:1,cityW:1,cafeW:1,sunW:1,parfW:1,lavW:1,cafeG:1,
 helpCap:4,helperN:2,lavCap:4,lavN:2,parfCap:4,parfN:2,cafeGCap:4,cafeGN:2,sunCap:4,sunN:2,bonCap:4,bonN:2,carN:2,cashN:2,bus:1,busN:2,wedN:2,waitN:2,cityN:2,portN:2,beeN:2,helperT:1,lavT:1,parfT:1,cafeGT:1,bonT:1});sv.money=1000;}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2)});
const r=await page.evaluate((SEC)=>{const g=__game,W=10,tr={};const bad=[];
 const all=()=>[...g.GARD,...(g.BUSES||[])];
 for(let s=0;s<SEC*4;s++){g.sim(0.25);const t=s*0.25;
  for(const u of g.GARD){const k=u.kind+':'+g.GARD.indexOf(u),p=u.group.position,q=tr[k]||(tr[k]={pts:[]});q.pts.push([t,p.x,p.z]);}
 }
 for(const k in tr){const P=tr[k].pts;for(let i=0;i+W*4<P.length;i+=4){const seg=P.slice(i,i+W*4+1);let flips=0,path=0,px=0,pz=0;
  for(let j=1;j<seg.length;j++){const dx=seg[j][1]-seg[j-1][1],dz=seg[j][2]-seg[j-1][2],L=Math.hypot(dx,dz);path+=L;if(L>0.02){if(px||pz){const c=(dx*px+dz*pz)/(L*Math.hypot(px,pz));if(c<-0.5)flips++}px=dx;pz=dz}}
  const net=Math.hypot(seg[seg.length-1][1]-seg[0][1],seg[seg.length-1][2]-seg[0][2]);
  if(flips>6&&net<path*0.35){bad.push([k,seg[0][0],flips,+path.toFixed(1),+net.toFixed(1)]);break}}}
 return {workers:Object.keys(tr).length,bad}},SEC);
console.log(JSON.stringify(r));console.log(errs);console.log(r.bad.length||errs.length?'OSC FAIL':'OSC PASS');await b.close();process.exit(r.bad.length||errs.length?1:0)})();
