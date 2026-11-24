// Araba/traktör (h.tr) yatakların (çiçek sınırları +0.3 m) içinden geçmemeli. FX=auto.json SEC=300 node tests/ciftlik/vehbed.js
const h=require('./h.js'),path=require('path');
(async()=>{const FX=path.resolve(__dirname,process.env.FX||'auto.json'),SEC=+process.env.SEC||300;
const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:FX,patch:s=>{s.ts=Date.now()+1e6;s.op=0;s.money=2000}});
const res=await page.evaluate((SEC)=>{window.__resetting=false;const g=__game;g.hideIntro();g.tp(7,-8);
 const rects=g.beds.filter(b=>!b.nohelp&&b.flowers.length).map(b=>{let a=1e9,c=-1e9,d=1e9,e=-1e9;for(const f of b.flowers){a=Math.min(a,f.x);c=Math.max(c,f.x);d=Math.min(d,f.z);e=Math.max(e,f.z)}return [a-0.3,c+0.3,d-0.3,e+0.3]});
 let veh=0,n=0;const seen={};
 for(let i=0;i<SEC*5;i++){g.sim(0.2);const p=g.P().group.position;p.x=7;p.z=-8;
  for(const w of [g.helper&&g.helper()].concat(g.GARD)){if(!w||!w.tr||!w.group.visible)continue;veh++;const x=w.group.position.x,z=w.group.position.z;
   for(const r of rects)if(x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]){const k=Math.round(x)+','+Math.round(z);seen[k]=(seen[k]||0)+1;n++}}}
 return {veh,n,seen}},SEC);
console.log('araba örnekleri',res.veh,'yatak içi ihlal',res.n,JSON.stringify(res.seen).slice(0,300),errs.slice(0,3));await b.close();process.exit(res.n||errs.length||!res.veh?1:0)})();
