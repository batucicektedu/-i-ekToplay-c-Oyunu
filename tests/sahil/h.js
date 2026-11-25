const fs=require('fs'),path=require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const SP=process.env.THREE_ROOT||'/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad';
// file:// localStorage headless Chromium'da yeniden yuklemede kalici degil (test artefakti); varsayilan: yerel http sunucusu.
const ROOT=path.resolve(__dirname,'..','..'),MIME={'.html':'text/html','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
let GAME=process.env.GAME||null;
async function ensureGame(){ if(GAME) return; const http=require('http');
  const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
  await new Promise(ok=>srv.listen(0,'127.0.0.1',ok)); srv.unref(); GAME='http://127.0.0.1:'+srv.address().port+'/sahil/index.html'; }
const KEY='bolum2_sahil';
exports.open=async function(opts={}){
  await ensureGame();
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist']});
  const page=await (await b.newContext(opts.device||{viewport:{width:opts.w||390,height:opts.h||844}})).newPage(); const errs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); page.on('pageerror',e=>errs.push(e.message));
  await page.addInitScript((q)=>{window.__noAuto=true;try{localStorage.setItem('cicek_grafik',q)}catch(e){}},opts.q||'high');
  await page.route('**/three.min.js',r=>r.fulfill({path:SP+'/node_modules/three/build/three.min.js',contentType:'application/javascript'}));
  await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**',r=>{const u=r.request().url().split('examples/js/')[1];r.fulfill({path:SP+'/node_modules/three/examples/js/'+u,contentType:'application/javascript'})});
  if(opts.pre) await opts.pre(page);
  const url=GAME+(opts.q?'?q='+opts.q:'');
  if(opts.fixture){ const sv=JSON.parse(fs.readFileSync(opts.fixture,'utf8')).value; if(opts.patch) opts.patch(sv);
    await page.addInitScript(([k,v])=>{ if(!sessionStorage.getItem('__seed')){ sessionStorage.setItem('__seed','1'); localStorage.setItem(k,v); window.__resetting=true; } },[KEY,JSON.stringify(sv)]); }
  await page.goto(url); await page.waitForTimeout(opts.wait||900);
  return {b,page,errs};
};
exports.shot=async(page,name)=>{await page.evaluate(()=>__game.render());await page.waitForTimeout(150);await page.screenshot({path:name.startsWith('/')?name+'.png':path.join(__dirname,name+'.png')});};
// Sayfada oyuncuyu A* yoluyla (gercek giris vektoruyla) yuruten yardimci: window.__walk(x,z,maxSec,onStep)
exports.WALK=`window.__walk=(x,z,maxSec,onStep,stop)=>{const g=__game;let pa=null,res=false;const n=Math.round((maxSec||60)/0.1);
 for(let i=0;i<n;i++){const p=g.P().group.position;if(Math.hypot(x-p.x,z-p.z)<(window.__walkR||0.5)){res=true;break}
  if(!pa||i%8===0)pa=g.path(x,z);let k=1;while(k<pa.length-1&&Math.hypot(pa[k][0]-p.x,pa[k][1]-p.z)<0.5)k++;const w=pa[Math.min(k,pa.length-1)]||[x,z];let dx=w[0]-p.x,dz=w[1]-p.z;const L=Math.hypot(dx,dz)||1;
  g.bot(dx/L||1e-6,dz/L||1e-6);g.sim(0.1);if(onStep)onStep();if(stop&&stop())break}
 g.bot(0,0);return res};`;
