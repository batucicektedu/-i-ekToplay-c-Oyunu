// Su denetimi: (1) sabit yigin gostergeleri + butun bolge/pad merkezleri suda degil, (2) rehber izi (A*) her noktasi karada.
const h=require('./h.js'),path=require('path');
const FIX=(process.env.FIX?process.env.FIX.split(','):['sahil-mid-v8','sahil-late-v8','sahil-end-v8']);
(async()=>{const bad=[];
for(const f of FIX){const {b,page,errs}=await h.open({q:'low',fixture:path.join(__dirname,'saves',f+'.json'),wait:1200,patch:sv=>{sv.ts=Date.now()+1e6}});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
 const r=await page.evaluate(()=>{const g=__game,out={stk:[],zone:[],trail:[],n:0,skipped:0};
  const _v=new g.camera.position.constructor();
  for(const s of g.STACKREG){for(const i of [0,Math.max(0,s.cap-1)]){try{s.slotFn(i,_v);if(g.isWater(_v.x,_v.z)&&!(_v.x<-28.5&&!g.S.lv.bridge)&&!(_v.x>48.1&&_v.x<56))out.stk.push([+_v.x.toFixed(1),+_v.z.toFixed(1),i])}catch(e){}}}
  for(const z of g.zones){if(z.group&&z.group.visible===false)continue;if(g.isWater(z.x,z.z))out.zone.push([z.constructor.name,+z.x.toFixed(1),+z.z.toFixed(1)])}
  // iz: yurunebilir baslangiclar x hedefler
  const starts=[[-12,0],[-20,0],[-27,0],[-5,3],[3,8],[10,20],[-15,16],[0,36],[30,2],[-50,0],[-58,3],[40,28]].filter(p=>!g.isWater(p[0],p[1]));
  const tg=[];for(const p of g.allPads())tg.push([p.x,p.z]);for(const z of g.zones)tg.push([z.x,z.z]);
  const P=g.P().group.position;
  for(const st of starts){P.set(st[0],0,st[1]);for(const t of tg){if(g.isWater(t[0],t[1]))continue;const pa=g.path(t[0],t[1]);out.n++;if(g.pathFail()){out.skipped++;continue}
   for(let k=0;k<pa.length-1;k++){const a=pa[k],bb=pa[k+1],L=Math.hypot(bb[0]-a[0],bb[1]-a[1]),m=Math.ceil(L/0.25);let hit=null;for(let q=0;q<=m;q++){const x=a[0]+(bb[0]-a[0])*q/m,z=a[1]+(bb[1]-a[1])*q/m;if(g.isWater(x,z)){hit=[+x.toFixed(1),+z.toFixed(1)];break}}
    if(hit){out.trail.push([st,t.map(v=>+v.toFixed(1)),hit]);break}}}}
  out.trail=out.trail.slice(0,8);out.stkN=g.STACKREG.length;return out});
 console.log(f,'stacks',r.stkN,'paths',r.n,'unreachable',r.skipped);
 if(r.stk.length)bad.push(f+' stack on water '+JSON.stringify(r.stk.slice(0,6)));if(r.zone.length)bad.push(f+' zone on water '+JSON.stringify(r.zone.slice(0,6)));if(r.trail.length)bad.push(f+' trail on water '+JSON.stringify(r.trail.slice(0,4)));
 const ee=errs.filter(e=>!/vibrate/.test(e));if(ee.length)bad.push(f+' errors '+ee[0]);await b.close();}
console.log(bad.length?'FAIL\n'+bad.join('\n'):'WATER PASS');process.exit(bad.length?1:0)})();
