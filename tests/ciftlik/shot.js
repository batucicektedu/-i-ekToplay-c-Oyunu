// node tests/ciftlik/shot.js <fixture|none> <name> <x> <z> [zoom] [w] [h]  -> docs/ciftlik/<name>.png
const h=require('./h.js'),path=require('path');
(async()=>{const [fx,name,x,z,zm,w,hh]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5],+process.argv[6]||1,+process.argv[7]||390,+process.argv[8]||844];
const {b,page,errs}=await h.open({q:process.env.Q||'high',w,h:hh,fixture:fx==='none'?undefined:fx,wait:1500,patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;if(process.env.MONEY)sv.money=+process.env.MONEY;if(process.env.LV)Object.assign(sv.lv,JSON.parse(process.env.LV))}});
await page.evaluate(([x,z,zm])=>{window.__resetting=false;__game.hideIntro();__game.tp(x,z);__game.zoom(zm);__game.sim(6);if(window.__after)window.__after()},[x,z,zm]);
if(process.env.EVAL)await page.evaluate(process.env.EVAL);
await h.shot(page,path.resolve(__dirname,'../../docs/ciftlik/'+name));console.log(errs);await b.close()})();
