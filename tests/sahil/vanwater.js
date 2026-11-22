// Teslimat aracı sadece karada; ana yardımcılar/gardiyanlar suda durmaz
const h=require('./h.js');
const water=(x,z)=>x<-28.5||x>48.2||z>44.2||(x<-10.45&&z>-12.7&&z<13.3&&!(Math.abs(z)<1.7&&x>-28.5));
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;sv.lv.helperN=2}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>{const g=__game,V=g.VAN;const out={v:[],w:[]};
 V.req=null;V.state='depart';V.trip=0;V.path=[[10,24],[10,33]];V.seg=0;V.speed=0;V.x=16.2;V.z=24;V.group.visible=true;
 for(let i=0;i<70;i++){g.sim(1);if(V.state!=='away')out.v.push([V.x,V.z,V.state]);const ws=[g.helper(),...Object.values(g.GROLES).flatMap(r=>r.units)].filter(Boolean);for(const w of ws)out.w.push([w.group.position.x,w.group.position.z])}
 out.state=V.state;return out});
const bad=[];for(const [x,z,s] of r.v)if(water(x,z)){bad.push('van in water '+[x.toFixed(1),z.toFixed(1),s]);break}
for(const [x,z] of r.w)if(water(x,z)){bad.push('worker in water '+[x.toFixed(1),z.toFixed(1)]);break}
console.log('van samples',r.v.length,'workers samples',r.w.length,r.state);
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+JSON.stringify(bad):'PASS');await b.close();process.exit(bad.length?1:0)})();
