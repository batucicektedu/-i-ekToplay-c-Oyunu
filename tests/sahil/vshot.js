// Ekran goruntusu: node vshot.js <outprefix> <fixture|fresh> name:x:z ...   (W,H,Q env)
const h=require('./h.js'),path=require('path');
(async()=>{const [,, pre, fx, ...pts]=process.argv;
const o={q:process.env.Q||'high',w:+process.env.W||390,h:+process.env.H||844,wait:1500};
if(fx!=='fresh'){o.fixture=path.resolve(__dirname,'saves',fx+'.json');o.patch=sv=>{sv.ts=Date.now()+1e6}}
const {b,page,errs}=await h.open(o);await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
for(const p of pts){const [n,x,z]=p.split(':');await page.evaluate(([x,z])=>{__game.tp(+x,+z);__game.sim(1.5)},[x,z]);await h.shot(page,path.resolve(pre+'_'+n));}
console.log(errs.slice(0,3));await b.close()})();
