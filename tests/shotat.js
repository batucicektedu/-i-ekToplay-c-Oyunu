// node tests/_shot.js out.png x z zoom [fixture]  (hata ayıklama: oyuncuyu x,z'ye koyup ekran görüntüsü)
const h=require('./h.js');
(async()=>{const [out,x,z,zm,fx]=process.argv.slice(2);
const {b,page,errs}=await h.open({q:process.env.Q||'high',fixture:fx?(fx==='max'?__dirname+'/max.json':fx):__dirname+'/max.json',wait:1500,patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
await page.evaluate(([x,z,zm])=>{__game.zoom(+zm);__game.camAt(+x,+z);__game.render()},[x,z,zm]);
await h.shot(page,out.replace(/\.png$/,''));console.log(errs);await b.close()})();
