// NOT: ekran görüntüleri docs/qa/ içinde JPEG olarak saklanır (betik PNG yazar; PNG -> JPG q80 dönüştürülüp silinir).
// Bot ile baştan sona oyun: yeni kayıtla başlar, para enjekte edip sırayla tüm bölgeleri/yükseltmeleri açar.
// Her yeni açılan bölge için docs/qa/ch1_<ad>.png çekilir; ayrıca işçi/müşteri-duvar çakışması ve taşan arayüz denetlenir.
// Kullanım: GAME=http://localhost:8123/index.html node tests/playthrough.js   (MIN=dakika sınırı, OUT=çıktı klasörü)
const h=require('./h.js'),path=require('path'),fs=require('fs');
const OUT=process.env.OUT||path.resolve(__dirname,'..','docs','qa');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const {b,page,errs}=await h.open({q:process.env.Q||'high',wait:1500,noRaf:true});
await page.evaluate(()=>{const sc=document.getElementById('storyGo');if(sc)sc.click();window.__resetting=false;__game.hideIntro();window.__shots=[];window.__walls=[];window.__tl=[];window.__t=0;window.__seen=new Set()});
const MIN=+process.env.MIN||60;let shots=0;
for(let step=0;step<MIN*4;step++){ // 15 sim sn'lik adımlar
 const r=await page.evaluate(()=>{const g=__game,P=g.P(),S=g.S,out={ev:[],stuck:0};
  const zoneOpen=()=>{const l=[];for(const id in g.EXTZ)if(!g.EXTZ[id].locked)l.push(id);if(g.zone2&&!g.zone2.locked)l.push('zone2');if(g.zone3&&!g.zone3.locked)l.push('zone3');for(const k of ['bed','sera','van','helper','cashier','carrier','gate','coll','bus'])if(S.lv[k]>0)l.push('lv_'+k);return l};
  const pickPad=()=>{let best=null;for(const k in g.upPads){const u=g.upPads[k];if(u.done||!u.group.visible||u.locked)continue;const opener=!!g.EXTZ[k]||['bed','sera','van','gate','coll','bus','helper','cashier','carrier'].includes(k);const c=u.cost();const sc=(opener?0:1e9)+c;if(!best||sc<best.sc)best={u,sc}}return best&&best.u};
  let target=null,tpad=null;
  for(let i=0;i<450;i++){
   if(i%8===0){const gp=P.group.position,o=g.objective();tpad=(o.ok&&o.kind==='pad')?g.upPads[g.goal&&g.goal.key]||pickPad():pickPad();
     if(tpad&&!(o.ok&&o.kind==='pad'&&false)){ // para enjekte: bir sonraki açılış bedeli
       if(S.money<tpad.cost()*1.5+50)S.money=tpad.cost()*1.5+50}
     let tx=(tpad&&(!o.ok||o.kind==='pad'||S.money>=tpad.cost()))?[tpad.x,tpad.z]:(o.ok?[o.x,o.z]:null);if(tpad&&tpad.locked&&tpad.inside)tx=[tpad.x+3.2,tpad.z+3.2];
     if(!tx)g.bot(0,0);else{const d=Math.hypot(tx[0]-gp.x,tx[1]-gp.z);const inz=tpad&&tpad.inside&&!tpad.locked&&tx[0]===tpad.x;if(d<0.3||inz)g.bot(0,0);else{const pth=g.path(tx[0],tx[1]);let w=pth[pth.length-1];for(let q=1;q<pth.length;q++){if(Math.hypot(pth[q][0]-gp.x,pth[q][1]-gp.z)>0.6){w=pth[q];break}}const ex=w[0]-gp.x,ez=w[1]-gp.z,ed=Math.hypot(ex,ez)||1;g.bot(ex/ed,ez/ed)}}}
   if(i%90===0){const gp=P.group.position,m=window.__lp?Math.hypot(gp.x-window.__lp[0],gp.z-window.__lp[1]):9;window.__lp=[gp.x,gp.z];if(m<0.3&&window.__mv){window.__un=25;window.__ua=Math.random()*6.28}}
   if(window.__un>0){window.__un--;g.bot(Math.cos(window.__ua),Math.sin(window.__ua))}
   g.sim(1/30);window.__t+=1/30;
   // işçi/müşteri duvar içinde mi?
   if(i%10===0){const who=[];const add=(n,o)=>{if(o&&o.group&&o.group.visible)who.push([n,o.group.position])};add('cashier',g.cashier);add('carrier',g.carrier);add('helper',g.helper());g.customers.forEach(c=>add('cust',c));(g.GARD||[]).forEach(c=>add('gard-'+c.kind,c));
    for(const [n,p] of who)for(const c of g.colliders){if(c.active&&!c.active())continue;if(p.x>c.x0+0.25&&p.x<c.x1-0.25&&p.z>c.z0+0.25&&p.z<c.z1-0.25){window.__walls.push([n,+p.x.toFixed(1),+p.z.toFixed(1),'in['+[c.x0,c.x1,c.z0,c.z1].map(v=>+v.toFixed(1))+']']);break}}}
  }
  const open=zoneOpen(),nw=open.filter(x=>!window.__seen.has(x));nw.forEach(x=>window.__seen.add(x));
  return {nw,t:Math.round(window.__t),money:Math.round(S.money),open:open.length,pos:[P.group.position.x,P.group.position.z],lv:JSON.stringify(S.lv).length}});
 if(r.nw.length){for(const id of r.nw){ // yeni açılan bölge: yerleşsin, ekran görüntüsü al
   const info=await page.evaluate(id=>{const g=__game,z=g.EXTZ[id.replace(/^lv_/,'')];const R=z&&z.R;const P=g.P().group.position;const p={x:P.x,z:P.z};
     g.sim(12);let cx=R?(R.x0+R.x1)/2:p.x,cz=R?(R.z0+R.z1)/2:p.z;if(id==='zone2'){cx=39;cz=2}if(id==='zone3'){cx=18;cz=24}if(id.startsWith('lv_')){const u=g.upPads[id.slice(3)];if(u){cx=u.x;cz=u.z}}
     return {cx,cz,p}},id);
   for(const zm of [1,1.8]){await page.evaluate(([x,z,zm])=>{__game.zoom(zm);__game.camAt(x,z);__game.render()},[info.cx,info.cz+(zm>1?0:2),zm]);await h.shot(page,path.join(OUT,'ch1_'+id.replace(/^lv_/,'p_')+(zm>1?'_wide':'')));shots++}
   await page.evaluate(([x,z])=>{__game.zoom(1);__game.tp(x,z)},[info.p.x,info.p.z]);console.log('t='+r.t+'s zone:',id,'money',r.money)}}
 {const ov=await page.evaluate(()=>{const W=innerWidth,H=innerHeight,out=[];document.querySelectorAll('body *').forEach(e=>{if(e.tagName==='CANVAS'||e.tagName==='SCRIPT'||e.tagName==='STYLE')return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;let p=e,hid=false;while(p&&p!==document.body){const c=getComputedStyle(p);if(c.display==='none'){hid=true;break}p=p.parentElement}if(hid)return;
   const id=(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')||e.tagName;
   if((r.left<-2||r.right>W+2||r.top<-2||r.bottom>H+2)&&cs.position!=='fixed'||(cs.position==='fixed'&&(r.right>W+2||r.left<-2)&&!/^(#adm|#ward)/.test(id)))out.push(['out',id,Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]);
   if(e.scrollWidth>e.clientWidth+2&&cs.overflowX==='visible'&&e.clientWidth>0&&e.children.length===0&&(e.textContent||'').trim())out.push(['text',id,e.scrollWidth,e.clientWidth,(e.textContent||'').trim().slice(0,30)])});return out});
  (globalThis.__OV=globalThis.__OV||new Set());ov.forEach(o=>globalThis.__OV.add(o.join('|')))}
 if(step%20===19||process.env.DBG)console.log('..t='+r.t+'s open='+r.open,process.env.DBG?JSON.stringify(await page.evaluate(()=>{const g=__game,P=g.P().group.position;return {pos:[+P.x.toFixed(1),+P.z.toFixed(1)],money:Math.round(g.S.money),goal:g.goal&&g.goal.key+g.goal.lv,vis:Object.keys(g.upPads).filter(k=>{const u=g.upPads[k];return !u.done&&u.group.visible}).map(k=>k+':'+Math.round(g.upPads[k].cost())+(g.upPads[k].locked?'L':'')),obj:g.objective().kind}})):'');
 if(process.env.STOPAT&&r.nw.includes(process.env.STOPAT)){const dg=await page.evaluate(keys=>{const g=__game,P=g.P().group.position,out={};for(const k of keys.split(',')){const u=g.upPads[k];if(!u)continue;const o={x:+u.x.toFixed(1),z:+u.z.toFixed(1),vis:u.group.visible,ok:g.pathOK(u.x,u.z),blk:g.blockedAt(u.x,u.z),map:[]};for(let dz=-5;dz<=5;dz++){let row='';for(let dx=-9;dx<=9;dx++)row+=g.blockedAt(u.x+dx*0.75,u.z+dz*0.75)?'#':'.';o.map.push(row)}out[k]=o}return out},process.env.KEYS||'musTkt,gate');console.log(JSON.stringify(dg,null,0));break}
 if(page.isClosed())break;
}
const fin=await page.evaluate(()=>{const g=__game;return {walls:[...new Set(window.__walls.map(w=>w.join(',')))].slice(0,40),lv:g.S.lv,t:window.__t}});
console.log('walls',fin.walls.length,fin.walls.slice(0,15));console.log('overflow',[...(globalThis.__OV||[])].slice(0,30));console.log('shots',shots,'errs',errs.length?errs:'none');
await b.close()})();
