const h=require('./h.js'),path=require('path');
(async()=>{const {b,page,errs}=await h.open({q:'high',wait:1500});
await h.shot(page,path.resolve(__dirname,'../../docs/sahil/start_card'));
await page.evaluate(()=>{__game.hideIntro()});await page.waitForTimeout(300);
await h.shot(page,path.resolve(__dirname,'../../docs/sahil/start'));console.log(errs);await b.close()})();
