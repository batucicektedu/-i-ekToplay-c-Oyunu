// Bolum 2 ekonomi olcumu: sifirdan bot oynar; her satin alimin zamanini ve "alacak sey yok" bosluklarini yazar.
// SEC=9000 node tests/sahil/econ.js   (h.js yerel http sunucusu acar; THREE_ROOT/NODE_PATH ayarla)
const h=require('./h.js');
(async()=>{const OV=process.env.OV||''; // deneme: OV='bridge=20000,fener=50000' tek fiyatli pad'leri gecici degistirir; MUL='hallMult=..' icin kaynak yamasi gerekirse REPL="eski=>yeni;;..."
const {b,page,errs}=await h.open({q:process.env.Q||'high',w:+process.env.W||390,h:+process.env.H||844,wait:1200,pre:async pg=>{const fs=require('fs');if(!OV&&!process.env.REPL)return;await pg.route(/sahil\/index\.html/,r=>{let t=fs.readFileSync(__dirname+'/../../sahil/index.html','utf8');
 for(const kv of OV.split(',').filter(Boolean)){const[k,v]=kv.split('=');const re=new RegExp("(extPad\\('"+k+"', '[^']*', )\\[\\d+\\]");if(!re.test(t))throw new Error('OV '+k);t=t.replace(re,'$1['+v+']')}
 for(const rp of (process.env.REPL||'').split(';;').filter(Boolean)){const[a,c]=rp.split('=>');if(!t.includes(a))throw new Error('REPL '+a);t=t.split(a).join(c)}
 r.fulfill({body:t,contentType:'text/html'})})}});
await page.evaluate(()=>{window.__resetting=false;window.__freeze=true;__game.hideIntro();window.__log=[];window.__prev=JSON.stringify(__game.S.lv);window.__t=0;window.__o=null;
window.__chunk=(sec)=>{const g=__game;for(let i=0;i<sec*10;i++){g.bot(0,0);const p=g.P().group.position;let dx=0,dz=0;
  if(i%5===0||!window.__o){window.__o=g.objective();window.__pa=null}const o=window.__o;
  if(o&&o.ok){if(!window.__pa||i%10===0)window.__pa=g.path(o.x,o.z);const pa=window.__pa;let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[o.x,o.z];dx=w[0]-p.x;dz=w[1]-p.z;const L=Math.hypot(dx,dz);if(L>(o.kind==='harvest'?0.7:0.15)){dx/=L;dz/=L}else{dx=dz=0}}
  g.bot(dx||1e-6,dz||1e-6);g.sim(0.1);window.__t+=0.1;
  if(i%10===0){const lv=g.S.lv,pv=JSON.parse(window.__prev);let ch=false;for(const k in lv)if(lv[k]>(pv[k]||0)){window.__log.push([Math.round(window.__t),k+lv[k],Math.round(g.S.money)]);ch=true}if(ch)window.__prev=JSON.stringify(lv)}}
 g.bot(0,0)}});
const SEC=+process.env.SEC||9000;let done=false;
for(let i=0;i<SEC/10&&!done;i++){if(i%60==0){const q=await page.evaluate(()=>({t:Math.round(window.__t),m:Math.round(__game.S.money),l:window.__log.slice(-2)}));console.error(JSON.stringify(q))}
 done=await page.evaluate(()=>{window.__chunk(10);return __game.S.lv.gate>0});}
const r=await page.evaluate(()=>({t:Math.round(window.__t),log:window.__log}));
const KEYS=['sera','boat','gboat','cage','hall','bridge','fener','gate'];
require('fs').writeFileSync(process.env.OUT||'/tmp/econ_last.json',JSON.stringify(r.log));console.log('KEY purchases (min):',r.log.filter(e=>KEYS.includes(e[1].replace(/\d+$/,''))).map(e=>(e[0]/60).toFixed(1)+'m '+e[1]).join(' | '));
let gap=0,gk='',prev=0;for(const e of r.log){if(e[0]-prev>gap){gap=e[0]-prev;gk=e[1]}prev=e[0]}
console.log('ALL gaps >4min:');prev=0;for(const e of r.log){if(e[0]-prev>240)console.log('  '+(prev/60).toFixed(1)+'m -> '+(e[0]/60).toFixed(1)+'m ('+((e[0]-prev)/60).toFixed(1)+' min) next '+e[1]);prev=e[0]}
console.log('total',(r.t/60).toFixed(1),'min; max gap',(gap/60).toFixed(1),'min before',gk,'; purchases',r.log.length,'; errs',errs.filter(e=>!/vibrate/.test(e)).length);await b.close()})();
