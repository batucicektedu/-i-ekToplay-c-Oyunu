// Denize yürüme testi: oyuncu birçok noktadan denize doğru yürür; suya girmemeli, iskelede güverte yüksekliğinde olmalı.
const h=require('./h.js');
const water=(x,z)=>x<-28.5||x>48.2||z>44.2||(x<-10.2&&z>-12.7&&z<13.3&&!(Math.abs(z)<1.7&&x>-28.5));
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const tests=[[-26,20,-1,0],[-26,20,-1,-0.3],[-8,5,-1,0],[-8,-5,-1,0],[-12,14.5,0,-1],[-20,14.5,0,-1],[-20,0,0,-1],[-20,0,0,1],[-15,0,-1,0.6],[-20,-12,0,1],[44,0,1,0],[40,20,1,0.5],[10,30,0.3,1],[-5,30,0,1],[-27,0,-1,0]];
const bad=[];
for(const [x,z,dx,dz] of tests){
  const r=await page.evaluate(([x,z,dx,dz])=>{const g=__game;g.tp(x,z);g.sim(0.3);g.bot(dx,dz);let miny=9,maxy=-9;for(let i=0;i<60;i++){g.sim(0.1);const p=g.P().group.position;miny=Math.min(miny,p.y);maxy=Math.max(maxy,p.y)}g.bot(0,0);const p=g.P().group.position;return {x:p.x,z:p.z,y:p.y,maxy}},[x,z,dx,dz]);
  const onPier=Math.abs(r.z)<1.7&&r.x>-28.5&&r.x<-10.2;
  const ok=!water(r.x,r.z)&&(!onPier||r.y>0.03);
  console.log(ok?'ok  ':'FAIL',[x,z,dx,dz].join(','),'->',r.x.toFixed(1),r.z.toFixed(1),'y',r.y.toFixed(2));if(!ok)bad.push([x,z]);
}
// iskelede güverte yüksekliği
const y=await page.evaluate(()=>{const g=__game;g.tp(-20,0);g.sim(1);return g.P().group.position.y});if(!(y>0.05))bad.push('deck y '+y);console.log('deck y',y.toFixed(3));
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');
console.log(bad.length?'FAIL '+JSON.stringify(bad):'PASS');await b.close();process.exit(bad.length?1:0)})();
