// node rshot.js <out> <x> <z> <zoom> <simSec> [w h] ; env INSTR=1 SHOWNOW=1 RIDE=1 FX
const h=require('./h.js'),path=require('path');
(async()=>{const a=process.argv.slice(2);const [name,x,z,zm,sec,w,hh]=[a[0],+a[1],+a[2],+a[3]||1,+a[4]||30,+a[5]||390,+a[6]||700];
const {b,page,errs}=await h.open({q:'high',w,h:hh,wait:1500,fixture:__dirname+'/'+(process.env.FX||'ranch2.json'),patch:sv=>{if(process.env.INSTR)sv.lv.instr=1;sv.ts=Date.now()+1e6;sv.op=0}});
await page.evaluate(([x,z,zm,sec])=>{window.__resetting=false;__game.hideIntro();__game.tp(x,z);__game.zoom(zm);__game.RH.forEach(h=>h.love=80);__game.S.money=0;
 if(window.__riding==undefined&&0)__game.toggleRide();
 for(let i=0;i<sec*30;i++){__game.sim(1/30);if(i%30==0){__game.P().group.position.x=x;__game.P().group.position.z=z}}},[x,z,zm,sec]);
if(process.env.EVAL)await page.evaluate(process.env.EVAL);
await h.shot(page,name.startsWith('/')?name:path.resolve(__dirname,'../../docs/ciftlik/'+name));console.log(errs,await page.evaluate(()=>__game.RH.map(h=>h.state)));await b.close()})();
