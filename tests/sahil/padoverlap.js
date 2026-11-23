// Pad çakışma denetimi: prop/collider/yol(sokak, patika)/çiçek yatağı/pad. Hedef: 0 çakışma.
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/saves/sahil-end-v8.json',wait:1500});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>({fixBad:window.__padFix&&window.__padFix.bad,moved:window.__padFix&&window.__padFix.moved.length,hits:__game.padCheck(),n:__game.allPads().length,pb:__game.PROPBOX.length}));
console.log(JSON.stringify(r));console.log(errs);const ee=errs.filter(e=>!/vibrate/.test(e));const ok=!r.hits.length&&!r.fixBad&&!ee.length;console.log(ok?'PASS 0 overlaps':'FAIL');await b.close();process.exit(ok?0:1)})();
