// Duvardan geçme denetimi: müşteri/işçi/at/binici konumları statik mesh kutularıyla (çit, bina, ahır, ahır kapısı...) kesişiyor mu?
// Oyuncu park edilir; 300 sn benzetim, her 0.2 sn örnek. Beklenen: 0 ihlal.  FX=ranch.json SEC=300 node tests/ciftlik/walkthru.js
const h=require('./h.js'),path=require('path');
(async()=>{const FX=path.resolve(__dirname,process.env.FX||'saves/c3-v8-all.json'),SEC=+process.env.SEC||300;
const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:FX,patch:s=>{s.ts=Date.now()+1e6;s.op=0;s.money=2000}});
const res=await page.evaluate((SEC)=>{window.__resetting=false;const g=__game;g.hideIntro();g.tp(7,-8);
 // kutular: dünya statik mesh kutuları (PROPALL: y aralığı da var); yalnız yürüyüş yüksekliğine değenler (min.y<1.4, max.y>0.3)
 const boxes=g.PROPALL.filter(b=>b[4]<0.7&&b[5]>0.35&&!(b[1]-b[0]>4&&b[3]-b[2]>4&&b[5]>3)); // zemine basan, ağaç/tabela kutuları değil
 const seen={};let n=0;
 const agents=()=>{const a=[];for(const c of g.customers)a.push(['cust',c.group]);for(const r of g.RH)if(r.group)a.push(['horse',r.group]);
  for(const r of (g.RC||[]))if(r.c&&r.c.group&&!r.c.seat)a.push(['rider',r.c.group]);
  for(const w of [g.helper&&g.helper(),g.cashier,g.carrier])if(w&&w.group)a.push(['worker',w.group]);
  for(const w of g.FWU.concat(g.GARD,g.CARX))if(w&&w.group)a.push(['worker2',w.group]);return a};
 for(let i=0;i<SEC*5;i++){g.sim(0.2);const p=g.P().group.position;p.x=7;p.z=-8;
  for(const [k,gr] of agents()){if(!gr.visible)continue;const x=gr.position.x,z=gr.position.z;
   for(const b of boxes){const tw=b[1]-b[0],td=b[3]-b[2];const m=(tw<0.7||td<0.7)?0:-0.3; // ince çit/duvar: merkez kutunun içinde; kalın: içine 30 cm girme
    if(x>b[0]-m&&x<b[1]+m&&z>b[2]-m&&z<b[3]+m){const key=k+' @'+Math.round(x*2)/2+','+Math.round(z*2)/2+' box['+b.slice(0,4).map(v=>v.toFixed(1))+'] y'+b[4].toFixed(1)+'-'+b[5].toFixed(1);seen[key]=(seen[key]||0)+1;n++;break}}}}
 return {n,seen}},SEC);
const keys=Object.keys(res.seen).sort((a,b)=>res.seen[b]-res.seen[a]);
console.log(path.basename(FX),'ihlal örnekleri',res.n,'benzersiz',keys.length);for(const k of keys.slice(0,40))console.log('  ',res.seen[k],k);
console.log(errs.slice(0,3));await b.close();process.exit(keys.length||errs.length?1:0)})();
