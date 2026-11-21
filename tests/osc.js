// Salınım (sağa-sola titreme) dedektörü: node tests/osc.js  (TR=1 traktör, SEC=süre, FIX=fixture)
const h=require('./h.js');
(async()=>{const TR=process.env.TR==='1',SEC=+process.env.SEC||300;
const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/max.json',wait:1500,patch:sv=>{Object.assign(sv.lv,{wedW:1,portSpd:1,portCap:1,beeW:1,bonW:1,portW:1,cityW:1,cafeW:1,sunW:1,parfW:1,lavW:1,cafeG:1,helpCap:4,helperN:2,lavCap:4,lavN:2,parfCap:4,parfN:2,cafeGCap:4,cafeGN:2,sunCap:4,sunN:2,bonCap:4,bonN:2,carN:2,cashN:2,wedSpd:5,potSpd:5,bus:1,busSpd:5,busCap:4,busN:2,wedN:2,waitN:2,cityN:2,portN:2,beeN:2});
 if(TR)Object.assign(sv.lv,{helperT:1,lavT:1,parfT:1,cafeGT:1,bonT:1});sv.money=18e6;}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2)});
const r=await page.evaluate((SEC)=>{const g=__game,W=()=>{const l=[];g.GARD.forEach((x,i)=>l.push(['G'+i+x.kind+(x.tr?'T':''),x.group]));g.BUSES.forEach((x,i)=>l.push(['bus'+i,x.group]));return l};
 const tr={},res={};let t=0;const dtS=0.1;
 for(let s=0;s<SEC*10;s++){g.sim(dtS);const w=W();for(const [n,gr] of w){const ow=n.startsWith('G')?g.GARD[+n.slice(1).match(/\d+/)[0]]:null;const T=tr[n]||(tr[n]={px:gr.position.x,pz:gr.position.z,dir:null,flips:[],hist:[]});
  const dx=gr.position.x-T.px,dz=gr.position.z-T.pz,d=Math.hypot(dx,dz);T.px=gr.position.x;T.pz=gr.position.z;
  if(d>0.02){const dir=[dx/d,dz/d];if(T.dir&&T.dir[0]*dir[0]+T.dir[1]*dir[1]<-0.5){T.flips.push(s*dtS);(T.info=T.info||[]).push([+(s*dtS).toFixed(1),+gr.position.x.toFixed(1),+gr.position.z.toFixed(1),ow&&[ow.state,ow.ctype,ow.helping,ow.target?[ow.target.x,ow.target.z].map(v=>+v.toFixed(1)):null,ow.dest&&ow.dest.zone?[ow.dest.zone.x,ow.dest.zone.z].map(v=>+v.toFixed(1)):null,ow.stack.length,ow.incoming].join('|')])}T.dir=dir}
  T.hist.push([s*dtS,T.px,T.pz,ow?ow.stack.length+ow.incoming:0])}}
 for(const n in tr){const T=tr[n];let worst=0,at=0;for(let i=0;i<T.flips.length;i++){let c=0;for(let j=i;j<T.flips.length&&T.flips[j]<T.flips[i]+10;j++)c++;
   // ilerleme: pencere içi net yer değiştirme küçük mü?
   if(c>worst){const t0=T.flips[i];const a=T.hist.find(q=>q[0]>=t0),bq=T.hist.find(q=>q[0]>=t0+10)||T.hist[T.hist.length-1];const disp=Math.hypot(bq[1]-a[1],bq[2]-a[2]);let act=0,pv=a[3];for(const q of T.hist)if(q[0]>=a[0]&&q[0]<=bq[0]){act+=Math.abs(q[3]-pv);pv=q[3]}if(disp<3&&act<=2){worst=c;at=t0}}}
  res[n]={flips:T.flips.length,worst10s:worst,at,info:worst>6?T.info.filter(q=>q[0]>=at&&q[0]<at+10).slice(0,14):undefined}}
 return res},SEC);
let bad=0;for(const n in r){if(r[n].worst10s>6)bad++;}
console.log(JSON.stringify(Object.fromEntries(Object.entries(r).filter(([n,v])=>v.flips>0))));console.log('oscillating workers:',bad,'errs',errs);
await b.close();process.exit(bad||errs.length?1:0)})();
