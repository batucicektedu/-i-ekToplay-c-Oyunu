// Fener Adası: köprü/ada yürünebilir, denize girilmez; kafe geliri; kapı: pad -> open'da 3 -> onay kartı -> chapGo(../ciftlik/)
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-late-v7.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6;sv.money=900000;Object.assign(sv.lv,{boat:1,gboat:1,cage:1,hall:1,bridge:1,fener:1})}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();window.__f=null;window.fetch=u=>{window.__f=String(u);return Promise.resolve({ok:true})}});
const bad=[];let navUrl=null;page.on('framenavigated',f=>{if(f===page.mainFrame())navUrl=f.url()});
const walk=async(x,z,dx,dz,sec)=>page.evaluate(([x,z,dx,dz,sec])=>{const g=__game;g.tp(x,z);g.sim(0.3);g.bot(dx,dz);g.sim(sec);g.bot(0,0);const p=g.P().group.position;return {x:p.x,z:p.z,y:p.y,ok:g.westWalk(p.x,p.z)||p.x>-28.0}},[x,z,dx,dz,sec]);
// pier -> köprü -> ada
let r=await walk(-20,0,-1,0,14);console.log('bridge walk',JSON.stringify(r));if(r.x>-52)bad.push('did not reach island '+r.x);if(!r.ok)bad.push('off walkable');
for(const [x,z,dx,dz] of [[-40,0,0,-1],[-40,0,0,1],[-58,0,0,1],[-58,0,0,-1],[-58,0,-1,0],[-52,6,1,1],[-66,-6,-1,-1]]){r=await walk(x,z,dx,dz,6);if(!r.ok){bad.push('in water '+[x,z,dx,dz]+' -> '+r.x.toFixed(1)+','+r.z.toFixed(1))}}
// kafe geliri
const inc=await page.evaluate(()=>{const g=__game;g.tp(-53.5,6.1);const m0=g.S.money;g.sim(40);return {gain:g.S.money-m0,pile:g.FIN.pile.length}});console.log('cafe',JSON.stringify(inc));if(inc.gain<=0)bad.push('no cafe income');
// kapı
const gate=await page.evaluate(()=>{const g=__game;const u=g.allPads().find(p=>p.key==='gate');g.tp(u.x,u.z);g.sim(6);const lv=g.S.lv.gate;g.tp(-60,-5.6);g.sim(1);return {pad:[u.x,u.z],lv,card:document.getElementById('chapCard').style.display,txt:(document.querySelector('#chapCard .ct')||{}).textContent||'',inside:g.GATES.map(q=>q.zone.inside+'|'+q.zone.group.visible+'|'+q.g.visible),open:JSON.parse(localStorage.getItem('cicek_bolumler')||'{}').open}});
console.log('gate',JSON.stringify(gate));if(gate.lv!==1)bad.push('gate pad not paid');if(gate.card!=='flex'||!/Hayvan/.test(gate.txt))bad.push('card');if(!(gate.open||[]).includes(3))bad.push('open lacks 3');
const preErr=errs.filter(e=>!/vibrate/.test(e));await page.evaluate(()=>{[...document.querySelectorAll('#chapCard button')].find(b=>/Geç/.test(b.textContent)).click()});await page.waitForTimeout(500);console.log('navigated',navUrl);if(!/ciftlik/.test(navUrl||''))bad.push('chapGo url '+navUrl);
const e=preErr;console.log(e);if(e.length)bad.push('errors');console.log(bad.length?'FAIL '+JSON.stringify(bad):'PASS');await b.close();process.exit(bad.length?1:0)})();
