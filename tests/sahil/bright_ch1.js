// ch1 referans ekran goruntusu + ortalama luma
const fs=require('fs'),path=require('path');const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const SP=process.env.THREE_ROOT||'/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist']});const res={};
for(const q of ['high','low']){const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
await page.addInitScript(q=>{window.__noAuto=true;try{localStorage.setItem('cicek_grafik',q)}catch(e){}},q);
await page.route('**/three.min.js',r=>r.fulfill({path:SP+'/node_modules/three/build/three.min.js',contentType:'application/javascript'}));
await page.route('**/cdn.jsdelivr.net/npm/three@0.128.0/examples/js/**',r=>{const u=r.request().url().split('examples/js/')[1];r.fulfill({path:SP+'/node_modules/three/examples/js/'+u,contentType:'application/javascript'})});
await page.goto(process.env.CH1||'http://127.0.0.1:8000/index.html?q='+q);await page.waitForTimeout(2500);
try{await page.getByText('Başla',{exact:true}).click({timeout:3000})}catch(e){}await page.waitForTimeout(4000);
await page.evaluate(()=>{__game.sim&&__game.sim(1);__game.render()});await page.waitForTimeout(200);
const f=path.resolve(__dirname,'..','..','docs','sahil','bright_ch1_'+q+'.png');await page.screenshot({path:f});
res[q]=await page.evaluate(async b=>{const im=new Image();im.src='data:image/png;base64,'+b;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=4)s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];return s/(d.length/4)},fs.readFileSync(f).toString('base64'));}
console.log(JSON.stringify(res));await b.close()})();
