// node multi.js <fixture> <prefix> name:x:z:zoom ...
const h=require('./h.js'),path=require('path');
(async()=>{const [fx,pre,...list]=process.argv.slice(2);
const {b,page,errs}=await h.open({q:process.env.Q||'high',w:+process.env.W||390,h:+process.env.H||844,fixture:fx==='none'?undefined:fx,wait:1500,patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;if(process.env.MONEY)sv.money=+process.env.MONEY}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
for(const it of list){const [n,x,z,zm]=it.split(':');
 await page.evaluate(([x,z,zm])=>{__game.tp(x,z);__game.zoom(zm);__game.sim(4)},[+x,+z,+zm||1]);
 await h.shot(page,path.resolve(__dirname,'../../docs/sahil/'+pre+n));
 const c=await page.evaluate(()=>__game.calls);console.log(n,'calls',c);}
console.log(errs);await b.close()})();
