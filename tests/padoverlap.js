const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||'/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad/c3/max.json',wait:1500});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>({fix:window.__padFix,hits:__game.padCheck(),n:__game.allPads().length,pb:__game.PROPBOX.length}));
console.log(JSON.stringify(r));console.log(errs);await b.close()})();
