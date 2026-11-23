// Tüm oyunu bot ile baştan sona oynar; her yeni açılan bölgenin ekran görüntüsünü docs/qa/ciftlik_NN_ad.png olarak kaydeder.
// Ayrıca her saniye karakter/at/hayvan konumlarını çarpışma kutularıyla karşılaştırıp "duvardan geçen" örnekleri raporlar.
// ASSIST=1 (varsayılan): 4 dk boyunca satın alma yoksa hedef pad parası eklenir (çok uzun ekonomi beklemesini atlar; kayıt/konum mantığı değişmez).
// MIN=240 node tests/ciftlik/playall.js
const h=require('./h.js'),fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'..','..','docs','qa');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const MIN=+process.env.MIN||240,ASSIST=process.env.ASSIST!=='0';
const FX=process.env.FX?path.resolve(process.env.FX):undefined;
const {b,page,errs}=await h.open({q:'low',w:390,h:844,wait:1200,fixture:FX,patch:FX?sv=>{sv.ts=Date.now()+1e6;sv.op=0;if(process.env.MONEY)sv.money=+process.env.MONEY}:undefined});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();window.__seen={};window.__T=0;window.__lastBuy=0;window.__walls={};window.__assists=0;window.__nWall=0;
 window.__chunk=(sec)=>{const g=__game,ev=[];const n=Math.round(sec/0.1);
  for(let i=0;i<n;i++){g.bot(0,0);const o=g.objective();const p=g.P().group.position;let dx=0,dz=0;
   if(o&&o.ok){const pa=g.path(o.x,o.z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>0.15){dx/=L;dz/=L}else{dx=dz=0}}
   g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);window.__T+=0.1;
   if(i%10===0){
    for(const k in g.upPads){const u=g.upPads[k];const key=k+':'+g.S.lv[k];if(g.S.lv[k]>0&&!window.__seen[key]){window.__seen[key]=1;window.__lastBuy=window.__T;ev.push([k,g.S.lv[k]])}}
    for(const id in g.EXTZ){if(!g.EXTZ[id].locked&&!window.__seen['z'+id]){window.__seen['z'+id]=1;ev.push(['ZONE',id])}}
    if(g.zone2&&!g.zone2.locked&&!window.__seen.z2){window.__seen.z2=1;ev.push(['ZONE','sera'])}
    if(g.zone3&&!g.zone3.locked&&!window.__seen.z3){window.__seen.z3=1;ev.push(['ZONE','van'])}
    // duvardan geçme: canlılar aktif collider içinde mi?
    const who=[];for(const c of g.customers)who.push(['cust',c.group]);for(const r of g.RH)if(r.group)who.push(['horse',r.group]);
    for(const w of [g.helper&&g.helper(),g.cashier,g.carrier])if(w&&w.group)who.push(['worker',w.group]);
    for(const w of g.FWU.concat(g.GARD,g.CARX))if(w&&w.group)who.push(['w2',w.group]);
    for(const [kind,gr] of who){if(!gr.visible)continue;const x=gr.position.x,z=gr.position.z;
     for(const c of g.colliders){if(c.active&&!c.active())continue;if(x>c.x0+0.25&&x<c.x1-0.25&&z>c.z0+0.25&&z<c.z1-0.25){const key=kind+'@'+Math.round(x)+','+Math.round(z)+' in['+c.x0.toFixed(1)+','+c.x1.toFixed(1)+','+c.z0.toFixed(1)+','+c.z1.toFixed(1)+']';window.__walls[key]=(window.__walls[key]||0)+1;break}}}
   }}
  return {T:window.__T,ev,m:Math.round(g.S.money),cg:g.goal&&g.goal.key}}});
let n=0;const shot=async(tag,wide)=>{
 const info=await page.evaluate(([tag,wide])=>{const g=__game,p=g.P().group.position,sv={x:p.x,z:p.z,m:g.S.money};g.S.money=0;
  let tx=sv.x,tz=sv.z;const z=g.EXTZ[tag];if(z){tx=z.cx;tz=z.cz}else if(tag==='sera'){tx=40;tz=0}else if(tag==='van'){tx=19;tz=22}
  window.__sv=sv;g.tp(tx,tz);g.zoom(wide);g.sim(4);g.render();return {tx,tz}},[tag,wide]);
 await page.waitForTimeout(250);await page.screenshot({path:path.join(OUT,'ciftlik_'+String(++n).padStart(2,'0')+'_'+tag+'.png')});
 await page.evaluate(()=>{const g=__game,sv=window.__sv;g.zoom(1);g.tp(sv.x,sv.z);g.S.money=sv.m;g.sim(0.2)});};
let tot=0,last=0;
for(let T=0;T<MIN*60;T+=10){const r=await Promise.race([page.evaluate(()=>window.__chunk(10)),new Promise((_,rej)=>setTimeout(()=>rej(new Error('chunk hang at T='+T)),120000))]).catch(async e=>{console.log(e.message);const t=await page.evaluate(()=>({T:window.__T})).catch(()=>null);console.log('state',t);await b.close();process.exit(2)});
 if(T%300===0)console.log('..T',T);
 for(const e of r.ev){const mm=Math.floor(r.T/60),ss=Math.round(r.T%60);console.log((mm+':'+String(ss).padStart(2,'0')).padStart(7),e.join(' '),'$'+r.m);
  if(e[0]==='ZONE')await shot(e[1],1.5);}
 if(ASSIST&&r.cg&&r.T-await page.evaluate(()=>window.__lastBuy)>240){await page.evaluate(()=>{const g=__game,u=g.upPads[g.goal.key];if(u&&!u.done){g.S.money=Math.max(g.S.money,u.cost()+10);window.__assists++;window.__lastBuy=window.__T}})}
 const fin=await page.evaluate(()=>!__game.goal&&window.__T>60);if(fin&&++tot>=18)break;}
const res=await page.evaluate(()=>({T:Math.round(window.__T),money:Math.round(__game.S.money),assists:window.__assists,walls:window.__walls,lv:Object.keys(__game.S.lv).filter(k=>__game.S.lv[k]>0).length,goal:__game.goal&&__game.goal.key}));
console.log(JSON.stringify(res));console.log('errs',errs.slice(0,5));
await page.evaluate(()=>{dispatchEvent(new Event('pagehide'))});
await b.close()})();
