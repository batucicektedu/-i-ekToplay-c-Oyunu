// Merkez (yumurta yatakları, tezgâh, dükkân) ekran görüntüleri. node hubshot.js out x z [zoom] [W H] ; FX=saves/...
const h=require('./h.js'),path=require('path');
(async()=>{const a=process.argv.slice(2);const [name,x,z,zm,w,hh]=[a[0],+a[1],+a[2],+a[3]||1,+a[4]||390,+a[5]||844];
const {b,page,errs}=await h.open({q:'high',w,h:hh,wait:1500,fixture:__dirname+'/'+(process.env.FX||'saves/c3-v10-auto.json'),patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0;sv.seen=sv.seen||{};sv.seen.fin=1;if(process.env.MONEY!==undefined)sv.money=+process.env.MONEY}});
await page.evaluate(([x,z,zm])=>{window.__resetting=false;__game.hideIntro();__game.zoom(zm);__game.sim(+(window.__SIM||8));__game.camAt(x,z);for(let i=0;i<20;i++){__game.sim(1/30);__game.P().group.position.x=x;__game.P().group.position.z=z}},[x,z,zm]);
await h.shot(page,name.startsWith('/')?name:path.resolve(__dirname,'../../docs/release/'+name));console.log(errs);await b.close()})();
