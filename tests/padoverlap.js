const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/max.json',wait:1500});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>({fix:window.__padFix,hits:__game.padCheck(),n:__game.allPads().length,pb:__game.PROPBOX.length}));
console.log(JSON.stringify(r));console.log(errs);await b.close()})();
