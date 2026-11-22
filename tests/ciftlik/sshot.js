const h=require('./h.js'),path=require('path');
(async()=>{const {b,page,errs}=await h.open({q:'high',w:900,h:700,wait:1500,fixture:__dirname+'/ranch2.json',patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.zoom(1.0);__game.RH.forEach(h=>h.love=85);__game.SHOW.state='ready';__game.tp(24.4,-43);for(let i=0;i<30*4;i++)__game.sim(1/30);__game.tp(33,-37);for(let i=0;i<30*7;i++){__game.sim(1/30);__game.P().group.position.set(33,0,-37)}});
await h.shot(page,path.resolve(__dirname,'../../docs/ciftlik/v2_show'));console.log(errs,await page.evaluate(()=>[__game.SHOW.state,__game.RH.map(h=>h.state)]));await b.close()})();
