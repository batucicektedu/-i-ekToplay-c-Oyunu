// Gorsel cila onceki/sonraki ekran goruntuleri. Kullanim: node polish.js <before|after> [alan,alan]
const h=require('./h.js'),path=require('path');const tag=process.argv[2]||'after',only=(process.argv[3]||'').split(',').filter(Boolean);
(async()=>{const {b,page,errs}=await h.open({q:process.env.Q||'high',w:390,h:844,wait:1500,fixture:__dirname+'/saves/sahil-end-v8.json',patch:sv=>{sv.ts=Date.now()+1e6}});
await page.evaluate(()=>__game.hideIntro());
for(const [n,x,z,zm] of [['plaza',3,-1,1.5],['pier',-18,-2,1.4],['dock',-19,16,1.4],['sea',-44,-14,1.8],['island',-60,2,1.5],['beach',4,25,1.4],['hall',-14,30,1.3],['cage',10,38,1.3],['eat',42,32,1.3]]){
 if(only.length&&!only.includes(n))continue;
 await page.evaluate(([x,z,zm])=>{__game.tp(x,z);__game.zoom(zm);__game.sim(2)},[x,z,zm]);
 await h.shot(page,path.resolve(__dirname,'..','..','docs','sahil','polish_'+tag+'_'+n));}
if(errs.length)console.log(errs.slice(0,3));await b.close()})();
