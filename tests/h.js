const fs=require('fs'),path=require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const SP=process.env.THREE_ROOT||'/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad';
const GAME=process.env.GAME||'file://'+path.resolve(__dirname,'..','index.html')+'';
const KEY='cicek_bahcesi_v1';
exports.open=async function(opts={}){
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist']});
  const page=await (await b.newContext({viewport:{width:opts.w||390,height:opts.h||844}})).newPage(); const errs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); page.on('pageerror',e=>errs.push(e.message));
  if(opts.noRaf)await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  await page.addInitScript((q)=>{window.__noAuto=true;try{localStorage.setItem('cicek_grafik',q)}catch(e){}},opts.q||'high');
  await page.route('**/three.min.js',r=>r.fulfill({path:SP+'/node_modules/three/build/three.min.js',contentType:'application/javascript'}));
  await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**',r=>{const u=r.request().url().split('examples/js/')[1];r.fulfill({path:SP+'/node_modules/three/examples/js/'+u,contentType:'application/javascript'})});
  const url=GAME+(opts.q?'?q='+opts.q:'');
  if(opts.fixture){ const sv=JSON.parse(fs.readFileSync(opts.fixture,'utf8')).value; if(opts.patch) opts.patch(sv);
    await page.addInitScript(([k,v])=>{ if(!sessionStorage.getItem('__seed')){ sessionStorage.setItem('__seed','1'); localStorage.setItem(k,v); window.__resetting=true; } },[KEY,JSON.stringify(sv)]); }
  await page.goto(url); await page.waitForTimeout(opts.wait||900);
  return {b,page,errs};
};
exports.shot=async(page,name)=>{await page.evaluate(()=>__game.render());await page.waitForTimeout(150);await page.screenshot({path:name.startsWith('/')?name+'.png':path.join(__dirname,name+'.png')});};
