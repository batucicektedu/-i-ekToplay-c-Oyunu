// node tests/qa.js <fixture|max> <outdir> [names,...]  -> her bölge için ekran görüntüsü + çizim çağrısı
const h=require('./h.js'),path=require('path'),fs=require('fs');
const VIEWS={plaza:[8,2,1],street:[6,-60,1],lav:[-11,-24,1],parf:[21,-24,1],cafe:[-11,-50,1],wed:[21,-50,1],sunf:[-11,-76,1],city:[21,-76,1],bee:[-11,-102,1],jap:[21,-102,1],port:[-11,-128,1],fest:[21,-128,1],mus:[-11,-154,1],sera:[38,3,1],van:[10,28,1],bus:[6,-16,1],wide:[8,-100,1.9]};
(async()=>{const [fx,out,names]=[process.argv[2]||'max',process.argv[3]||'docs/c6',(process.argv[4]||Object.keys(VIEWS).join(',')).split(',')];
fs.mkdirSync(out,{recursive:true});
const {b,page,errs}=await h.open({q:process.env.Q||'high',fixture:fx==='none'?undefined:(fx==='max'?__dirname+'/max.json':fx),wait:1500,patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;if(process.env.MONEY)sv.money=+process.env.MONEY;if(process.env.LV)Object.assign(sv.lv,JSON.parse(process.env.LV));}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();});
for(const n of names){const [x,z,zm]=VIEWS[n]||n.split('_').map(Number);
 await page.evaluate(([x,z,zm])=>{__game.tp(x,z);__game.zoom(zm);__game.sim(3)},[x,z,zm]);
 await page.evaluate(()=>{__game.render()});
 const m=await page.evaluate(()=>{__game.render();return __game.calls});
 await h.shot(page,path.resolve(out,n)); console.log(n,'calls',m);}
console.log('errs',errs);await b.close()})();
