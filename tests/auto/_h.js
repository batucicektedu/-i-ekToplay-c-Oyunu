// Ortak harness: 3 bolum icin http sunucusu + playwright + fixture. Kullanim: const h=require('./_h.js'); h.open('ch1'|'sahil'|'ciftlik', {fixture, patch})
const fs=require('fs'),path=require('path'),http=require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const SP=process.env.THREE_ROOT||'/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad';
const ROOT=path.resolve(__dirname,'..','..'),MIME={'.html':'text/html','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
const CH={ch1:{page:'index.html',key:'cicek_bahcesi_v1'},sahil:{page:'sahil/index.html',key:'bolum2_sahil'},ciftlik:{page:'ciftlik/index.html',key:'bolum3_ciftlik'}};
let srv=null;
async function server(){ if(srv) return srv.address().port;
  srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
  await new Promise(ok=>srv.listen(0,'127.0.0.1',ok)); srv.unref(); return srv.address().port; }
exports.open=async function(ch,opts={}){
  const c=CH[ch], port=await server();
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist']});
  const page=await (await b.newContext({viewport:{width:opts.w||390,height:opts.h||844}})).newPage(); const errs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); page.on('pageerror',e=>errs.push(e.message));
  await page.addInitScript((q)=>{window.__noAuto=true;try{localStorage.setItem('cicek_grafik',q)}catch(e){}},opts.q||'low');
  await page.route('**/three.min.js',r=>r.fulfill({path:SP+'/node_modules/three/build/three.min.js',contentType:'application/javascript'}));
  await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**',r=>{const u=r.request().url().split('examples/js/')[1];r.fulfill({path:SP+'/node_modules/three/examples/js/'+u,contentType:'application/javascript'})});
  if(opts.routeHtml){ await page.route('**/'+c.page.replace('/','/')+'*',r=>r.fulfill({body:opts.routeHtml,contentType:'text/html'})); }
  if(opts.fixture){ const sv=JSON.parse(fs.readFileSync(opts.fixture,'utf8')).value; if(opts.patch) opts.patch(sv);
    await page.addInitScript(([k,v])=>{ if(!sessionStorage.getItem('__seed')){ sessionStorage.setItem('__seed','1'); localStorage.setItem(k,v); window.__resetting=true; } },[c.key,JSON.stringify(sv)]); }
  await page.goto('http://127.0.0.1:'+port+'/'+c.page+'?q='+(opts.q||'low')); await page.waitForTimeout(opts.wait||1500);
  return {b,page,errs};
};

// ---- ortak: tum pad'leri (gate haric) maksimum seviyeye al = "fully bought + tum isci/otomasyon pad'leri satin alinmis" ----
// 1. gecis: sayfayi ac, upPads[k].max() oku. 2. gecis: kayitta lv[k]=max ile yeniden ac. Kayit formatina dokunmaz (yalniz mevcut lv anahtarlari).
exports.openAll=async function(ch,opts={}){ // opts.routeHtml: salt-okunur deney icin sayfa kaynagini bellekte degistirir (repo dosyasi degismez)
  const skip=new Set(opts.skip||['gate']);
  const p1=await exports.open(ch,{fixture:opts.fixture,patch:sv=>{sv.ts=Date.now()+1e6},wait:1000});
  const mx=await p1.page.evaluate(()=>{const o={};for(const k in __game.upPads){const u=__game.upPads[k];o[k]=u.max()}return o});
  await p1.b.close();
  const r=await exports.open(ch,{fixture:opts.fixture,wait:opts.wait||1500,q:opts.q,routeHtml:opts.routeHtml,patch:sv=>{sv.ts=Date.now()+1e6;sv.money=Math.max(+sv.money||0,1000);for(const k in mx)if(!skip.has(k))sv.lv[k]=mx[k];if(opts.patch)opts.patch(sv)}});
  r.max=mx; return r;
};
// seri ozeti: min/max/avg/son + "bos"/"dolu" orani
exports.sum=function(v,cap){const n=v.length;const mn=Math.min(...v),mxv=Math.max(...v),avg=v.reduce((a,b)=>a+b,0)/n;const zero=v.filter(x=>x<=0).length/n,full=cap?v.filter(x=>x>=cap).length/n:0;return {min:mn,max:mxv,avg:+avg.toFixed(1),last:v[n-1],zero:+zero.toFixed(2),full:+full.toFixed(2)}};
