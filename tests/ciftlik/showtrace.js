// Gösteri izi: at konum/hız/zıplama örnekleri (kayma, durma, çit geçme kontrolü)
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:__dirname+'/saves/c3-v10-auto.json',patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;sv.seen=sv.seen||{};sv.seen.fin=1}});
const r=await page.evaluate(()=>{window.__resetting=false;const g=__game;g.hideIntro();g.RH.forEach(h=>h.love=95);g.sim(2);g.SHOW.state='ready';g.SHOW.cd=0;const z=g.RANCH.showZ;g.tp(z[0],z[1]);
 const boxes=g.PROPALL.filter(b=>b[4]<0.7&&b[5]>0.35&&!(b[1]-b[0]>4&&b[3]-b[2]>4&&b[5]>3));const hit={};const out=[];let prev=null;for(let i=0;i<30*40;i++){g.sim(1/30);g.P().group.position.x=z[0];g.P().group.position.z=z[1];
  for(const hh of g.RH){if(hh.state==='idle'||(hh.jump||0)>0.35)continue;for(const b of boxes){const tw=b[1]-b[0],td=b[3]-b[2],m=(tw<0.7||td<0.7)?0:-0.3;if(hh.x>b[0]-m&&hh.x<b[1]+m&&hh.z>b[2]-m&&hh.z<b[3]+m){const k=hh.state+' '+hh.x.toFixed(1)+','+hh.z.toFixed(1)+' box '+b.slice(0,4).map(v=>v.toFixed(1));hit[k]=1;break}}}
  const e=g.SHOW.run.find(e=>!e.done);if(e&&g.SHOW.state==='run'){const hh=e.h;const sp=prev?Math.hypot(hh.x-prev[0],hh.z-prev[1])*30:0;prev=[hh.x,hh.z];out.push([+(i/30).toFixed(2),+hh.x.toFixed(2),+hh.z.toFixed(2),+sp.toFixed(2),+(hh.jump||0).toFixed(2),e.i+(e.started?'s':'w'),hh.rider?+hh.rider.group.position.y.toFixed(2):null])}}
 return {out,hit}});
console.log('KUTU İHLALİ',Object.keys(r.hit).length);Object.keys(r.hit).slice(0,15).forEach(k=>console.log(' ',k));
console.log(errs);await b.close()})();
