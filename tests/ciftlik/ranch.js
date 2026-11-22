// Çiftlik at çiftliği testi: fixture ile açık ranch, bot 150sn (karakter ranch'e ışınlanır), sürüş/bakım/gösteri istatistikleri
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:__dirname+'/'+(process.env.FX||'ranch.json'),patch:sv=>{if(process.env.INSTR)sv.lv.instr=1;sv.ts=Date.now()+1e6;sv.op=0}});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();__game.tp(7,-40)});
await page.evaluate(()=>{window.__chunk=(sec)=>{const g=__game;for(let i=0;i<sec*10;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>0.15){dx/=L;dz/=L}else dx=dz=0}g.bot(dx||1e-6,dz||1e-6);g.sim(0.1)}g.bot(0,0);return Math.round(g.S.money)}});
const m0=await page.evaluate(()=>__game.S.money);
for(let i=0;i<(+process.env.SEC||150)/10;i++)await page.evaluate(()=>window.__chunk(10));
const r=await page.evaluate(()=>({money:Math.round(__game.S.money),st:__game.stats,rh:__game.RH.map(x=>x.state+':'+Math.round(x.love)),rc:__game.RC.map(x=>x.st).join(','),show:__game.SHOW.state,pile:__game.ranchPile().length,carry:__game.P().stack.length}));
console.log(JSON.stringify(r));console.log(errs.slice(0,5));
const bad=[];if(!r.st.rides)bad.push('no rides');if(errs.length)bad.push('errors');
console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
