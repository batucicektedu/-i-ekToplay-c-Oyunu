// Arayüz taşma/örtüşme denetimi: farklı ekran boyutlarında HUD + menü/panel durumları; taşan/kesilen öğeleri listeler, ekran görüntüsü kaydeder.
// Kullanım: GAME=http://localhost:8123/index.html node tests/uicheck.js   (OUT=docs/qa)
const h=require('./h.js'),path=require('path'),fs=require('fs');
const OUT=process.env.OUT||path.resolve(__dirname,'..','docs','qa');fs.mkdirSync(OUT,{recursive:true});
const VP=[[320,568],[360,640],[390,844],[412,915],[768,1024],[844,390]];
const STATES=[['hud',null],['menu','reset'],['ward','wardBtn'],['book','bBook'],['quest','bQuest'],['beauty','beautyB']];
(async()=>{let total=0;
for(const [w,hh] of VP){
 const {b,page,errs}=await h.open({q:'low',w,h:hh,fixture:__dirname+'/max.json',wait:1500,patch:sv=>{sv.ts=Date.now()+1e6;sv.op=0}});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.camAt(8,2)});
 for(const [name,btn] of STATES){
  const r=await page.evaluate(async([btn])=>{
   const hideAll=()=>{for(const id of ['menu','ward','bBook','bQuest','beauty','gateCard']){const e=document.getElementById(id);if(e)e.style.display='none'}};
   hideAll();if(btn){const e=document.getElementById(btn);if(e)e.click()}
   await new Promise(r=>setTimeout(r,250));
   const W=innerWidth,H=innerHeight,out=[];
   document.querySelectorAll('body *').forEach(e=>{if(['CANVAS','SCRIPT','STYLE','BR'].includes(e.tagName))return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return;let p=e;while(p&&p!==document.body){if(getComputedStyle(p).display==='none')return;p=p.parentElement}
    const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;const id=(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:'')||e.tagName;
    // üst öğeye göre taşma (kesik metin / kutudan dışarı)
    let q=e.parentElement,clip=null;while(q&&q!==document.body){const c=getComputedStyle(q);if(c.overflow!=='visible'||c.overflowX!=='visible'){clip=q;break}q=q.parentElement}
    if(r.right>W+2||r.left<-2)out.push(['viewport-x',id,Math.round(r.left),Math.round(r.right),W]);
    else if(r.bottom>H+2&&cs.position==='fixed')out.push(['viewport-y',id,Math.round(r.top),Math.round(r.bottom),H]);
    if(e.children.length===0&&(e.textContent||'').trim()&&e.scrollWidth>e.clientWidth+2&&e.clientWidth>0&&cs.overflowX!=='auto'&&cs.overflowX!=='scroll'&&!cs.whiteSpace.startsWith('nowrap'))out.push(['text-overflow',id,e.scrollWidth,e.clientWidth,(e.textContent||'').trim().slice(0,24)]);
    if(e.children.length===0&&(e.textContent||'').trim()&&cs.textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+2)out.push(['ellipsis',id,e.scrollWidth,e.clientWidth,(e.textContent||'').trim().slice(0,24)])});
   hideAll();return out},[btn]);
  if(btn){await page.evaluate(([btn])=>{const e=document.getElementById(btn);if(e)e.click()},[btn]);await page.waitForTimeout(300);}
  await h.shot(page,path.join(OUT,`ui_${w}x${hh}_${name}`));
  await page.evaluate(()=>{for(const id of ['menu','ward','bBook','bQuest','beauty']){const e=document.getElementById(id);if(e)e.style.display='none'}});
  total+=r.length;console.log(`${w}x${hh} ${name}: ${r.length?JSON.stringify(r.slice(0,8)):'ok'}`);}
 if(errs.length){console.log('ERRS',errs);total+=errs.length}
 await b.close();}
console.log(total?'FAIL '+total:'PASS');process.exit(total?1:0)})();
