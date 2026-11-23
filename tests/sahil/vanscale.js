// Teslimat aracı bütün sefer boyunca aynı boyutta kalmalı (varışta küçülme hatası)
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>{const g=__game,V=g.VAN,T=THREE_(),S=[];function THREE_(){return window.THREE}
 const v=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3(),a=new T.Vector3(),c=new T.Vector3();
 let trips=0,prev='',steps=0;
 while(trips<3&&steps<4000){steps++;
  if(V.state==='parked'&&V.req&&g.vanLoad.length<V.req.cap&&g.vanLoad.pend===0){g.fill('vanLoad',V.req.cap)}
  g.sim(0.2);
  if(V.state==='parked'&&prev==='return')trips++;prev=V.state;
  if(!V.group.visible)continue;V.group.updateMatrixWorld(true);V.group.matrixWorld.decompose(v,q,sc);
  const w=V.wheels.map(x=>x.getWorldPosition(new T.Vector3()));
  S.push({st:V.state,s:sc.x,sy:sc.y,span:w[1].distanceTo(w[2]),len:w[0].distanceTo(w[1])});}
 return {S,trips,steps}});
const bad=[];const s0=r.S[r.S.length-1].s;
for(const k of['s','sy','span','len']){const vals=r.S.map(x=>x[k]);const mn=Math.min(...vals),mx=Math.max(...vals);console.log(k,mn.toFixed(3),mx.toFixed(3));if(mx/mn>1.02)bad.push(k+' changes '+mn+'..'+mx)}
console.log('samples',r.S.length,'trips',r.trips,'states',[...new Set(r.S.map(x=>x.st))].join(','));
if(r.trips<3)bad.push('trips<3');
const e=errs.filter(e=>!/vibrate/.test(e));if(e.length){console.log(e);bad.push('errors')}
console.log(bad.length?'FAIL '+JSON.stringify(bad):'PASS');await b.close();process.exit(bad.length?1:0)})();
