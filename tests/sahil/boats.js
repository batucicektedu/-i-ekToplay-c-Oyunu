// Tekneler sadece suda, hamallar sadece karada/iskelede; rıhtımdan tezgâha balık taşınır
const h=require('./h.js');
const inBay=(x,z)=>x<-10.2&&z>-12.7&&z<13.3;
const water=(x,z)=>x<-28.5||x>48.2||z>44.2||(inBay(x,z)&&!(Math.abs(z)<1.7&&x>-28.5));
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;Object.assign(sv.lv,{boat:1,boatN:2,hamal:1,hamalN:1,boatCap:1})}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.P().stack.items.length=0});
const bad=[];let seen=0,porterN=0;
const r=await page.evaluate(()=>{const g=__game;const out={b:[],p:[]};for(let i=0;i<1800;i++){g.sim(0.1);if(i%2===0){for(const x of g.BOATS)if(x.on)out.b.push([x.g.position.x,x.g.position.z,x.state]);for(const p of g.HAMALS())out.p.push([p.group.position.x,p.group.position.z,p.state])}}out.carted=g.stats.carted||0;out.dock=g.DOCK.stack.length;out.nb=g.BOATS.filter(x=>x.on).length;out.np=g.HAMALS().length;out.stalls=g.stats.stalls||0;return out});
for(const [x,z,s] of r.b){if(!water(x,z)||(Math.abs(z)<1.7&&x>-28.5&&x<-10.2)){bad.push('boat on land '+[x.toFixed(1),z.toFixed(1),s]);break}}
for(const [x,z,s] of r.p){if(water(x,z)){bad.push('porter in water '+[x.toFixed(1),z.toFixed(1),s]);break}}
console.log('boats',r.nb,'porters',r.np,'carted',r.carted,'dock',r.dock,'stalls',r.stalls);
if(r.nb!==3)bad.push('boat count');if(r.np!==2)bad.push('porter count');if(r.carted<10)bad.push('porters delivered '+r.carted);if(r.stalls)bad.push('stalls');
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+JSON.stringify(bad):'PASS');await b.close();process.exit(bad.length?1:0)})();
