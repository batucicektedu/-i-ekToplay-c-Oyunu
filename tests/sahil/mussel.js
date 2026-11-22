// Midye: alçak gelgitte oyuncu kayalıkta durup/yürüyerek midye toplar (işçi talebini çalar)
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-mid-v7.json',wait:1500,patch:sv=>{sv.ts=Date.now()+1e6}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>{const g=__game;g.P().stack.items.length=0;for(let i=0;i<40*30&&!g.tide().low;i++)g.sim(1/30);
 g.tp(26,-0.8);g.bot(0.0001,0.0001);g.sim(6);const a=g.P().stack.count('orchid');
 // yürüyerek: iskele başından kayalığa
 g.P().stack.items.length=0;g.tp(10,4);let t=0;while(t<20&&g.tide().low){const p=g.P().group.position;const tx=28,tz=-3;const dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz);if(l>0.5)g.bot(dx/l,dz/l);else g.bot(0.0001,0.0001);g.sim(0.1);t+=0.1}
 g.bot(0,0);return {standing:a,walking:g.P().stack.count('orchid'),low:g.tide().low}});
console.log(JSON.stringify(r));const bad=[];if(r.standing<1)bad.push('standing');if(r.walking<1)bad.push('walking');
const e=errs.filter(e=>!/vibrate/.test(e));console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
