// At bölümü yakın çekim ekran görüntüleri: docs/release/ciftlik_horse_*.png  (W,H,ZOOM env). Kayıt: saves/c3-v10-auto.json
const h=require('./h.js'),path=require('path');
(async()=>{const W=+process.env.W||390,H=+process.env.H||844,OUT=path.resolve(__dirname,'../../docs/release/ciftlik_horse_');
const {b,page,errs}=await h.open({q:'high',w:W,h:H,wait:1500,fixture:__dirname+'/saves/c3-v10-auto.json',patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;sv.seen=sv.seen||{};sv.seen.fin=1}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.RH.forEach(h=>h.love=90);});
let n=0;const shot=async(tag)=>{n++;await h.shot(page,OUT+String(n).padStart(2,'0')+'_'+tag)};
const cam=(x,z,zm)=>page.evaluate(([x,z,zm])=>{__game.tp(x,z);__game.zoom(zm||0.5)},[x,z,zm]);
const simAt=(x,z,sec)=>page.evaluate(([x,z,sec])=>{for(let i=0;i<sec*30;i++){__game.sim(1/30);__game.P().group.position.x=x;__game.P().group.position.z=z}},[x,z,sec]);
// genel görünüm
await cam(10,-46,1);await simAt(10,-46,3);await shot('overview');
await cam(8,-50,0.5);await simAt(8,-50,2);await shot('mount_close');
// binişi bekle; kamera ata kilitli (oyuncu gizli)
const follow=(sel,sec,every,tag,max)=>page.evaluate(async([sel,sec])=>{},[sel,sec]);
let got=0;
for(let k=0;k<60&&got<8;k++){
 const ri=await page.evaluate(()=>__game.RH.findIndex(h=>h.state==='ride'));
 if(ri<0){await simAt(10,-46,1);continue}
 // 3 sn boyunca takip, her 0.4 sn bir kare
 for(let f=0;f<5&&got<8;f++){
  await page.evaluate((i)=>{const g=__game,h=g.RH[i];g.P().group.visible=false;for(let j=0;j<12;j++){g.P().group.position.x=h.x;g.P().group.position.z=h.z;g.sim(1/30)}g.camAt(h.x,h.z);g.P().group.visible=false},ri);
  got++;await shot('ride_'+got);
 }
 await page.evaluate(()=>{__game.P().group.visible=true});
 await simAt(10,-46,6);
}
// tay
await page.evaluate(()=>{__game.P().group.visible=true});
const fp=await page.evaluate(()=>{const f=__game.foal;return f?[f.x,f.z]:null});console.log('foal',fp);
if(fp){await cam(fp[0],fp[1],0.42);await simAt(fp[0],fp[1],1);await shot('foal');}
// gösteri
const sp=await page.evaluate(()=>{const g=__game;g.SHOW.state='ready';g.SHOW.cd=0;return g.RANCH.showZ});
await cam(sp[0],sp[1],1);await simAt(sp[0],sp[1],0.5);
await page.evaluate(([x,z])=>{__game.RH.forEach(h=>{if(h.state==='idle'){h.rest=0;h.love=90}});__game.P().group.position.x=x+0.0;},[sp[0],sp[1]]);
let sh=0;for(let k=0;k<60&&sh<6;k++){const info=await page.evaluate(()=>{const g=__game;const e=g.SHOW.run.find(e=>e.started&&!e.done&&e.jt);return {st:g.SHOW.state,e:e?[e.h.x,e.h.z]:null}});
 if(info.e){await cam(info.e[0],info.e[1],0.5);await page.evaluate(()=>{__game.sim(0.05)});sh++;await shot('show_'+sh);await page.evaluate(()=>{__game.sim(0.12)})}
 else await page.evaluate(([x,z])=>{for(let i=0;i<10;i++){__game.sim(0.1);__game.P().group.position.x=x;__game.P().group.position.z=z}},[sp[0],sp[1]]);}
// ata bin: bölgeye girince otomatik biner; sonra yürü
const ap=await page.evaluate(()=>__game.RANCH.ata);
await page.evaluate(([x,z])=>{__game.tp(x-4,z);__game.sim(0.3);__game.bot(1,0.0)},ap);
for(let i=0;i<6;i++){await page.evaluate(()=>{const g=__game;g.bot(1,0.35);g.sim(0.6);const p=g.P().group.position;g.camAt(p.x,p.z);g.bot(1,0.35)});await shot('ata_'+i)}
console.log('riding',await page.evaluate(()=>window.__riding));
console.log(errs,await page.evaluate(()=>__game.RH.map(h=>h.state)));await b.close()})();
