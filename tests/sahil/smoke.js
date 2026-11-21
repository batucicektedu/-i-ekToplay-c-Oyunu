// Hızlı duman testi: taze yükle, bot ile oyna, kaydet/yeniden yükle, önceki bölüm kapısı kartı
const h=require('./h.js');
(async()=>{const bad=[];const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1000});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro()});
await page.evaluate(()=>{window.__chunk=(sec)=>{const g=__game;for(let i=0;i<sec*10;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>(o.kind==='harvest'?0.7:0.15)){dx/=L;dz/=L}else dx=dz=0}g.bot(dx||1e-6,dz||1e-6);g.sim(0.1)}g.bot(0,0);return Math.round(g.S.money)}});
for(let i=0;i<18;i++)await page.evaluate(()=>window.__chunk(10));
const st=await page.evaluate(()=>{dispatchEvent(new Event('pagehide'));const lv=__game.S.lv;return {money:__game.S.money,up:Object.keys(lv).filter(k=>lv[k]>0),stats:__game.stats,raw:!!localStorage.getItem('bolum2_sahil'),old:!!localStorage.getItem('cicek_bahcesi_v1')}});
console.log(JSON.stringify(st));if(!st.raw)bad.push('save missing');if(st.old)bad.push('ch1 key used');if(!st.up.length)bad.push('no upgrades in 3 min');if(!st.stats.sold)bad.push('nothing sold');
// gate
await page.evaluate(()=>{__game.tp(-6,14.4);__game.sim(1)});const card=await page.evaluate(()=>document.getElementById('chapCard').style.display+'|'+document.querySelector('#chapCard .ct').textContent);console.log('gate card',card);if(!card.includes('flex')||!card.includes('Çiçek'))bad.push('gate card');
// reload with save
await page.reload();await page.waitForTimeout(1500);const m2=await page.evaluate(()=>({m:__game.S.money,lv:Object.keys(__game.S.lv).filter(k=>__game.S.lv[k]>0).length}));console.log('reload',JSON.stringify(m2));if(m2.m<st.money*0.9||m2.lv<st.up.length)bad.push('reload lost progress');
console.log(errs.slice(0,5));if(errs.length)bad.push('errors');console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
