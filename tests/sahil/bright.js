// Parlaklik olcumu: sahil (plaza/pier/island/start) ve ch1; ortalama luma. Kullanim: node bright.js <before|after>
const h=require('./h.js'),path=require('path'),fs=require('fs');
const tag=process.argv[2]||'after',out=path.resolve(__dirname,'..','..','docs','sahil');
let LP=null;const luma=async f=>{const b64=fs.readFileSync(f).toString('base64');return LP.evaluate(async b=>{const im=new Image();im.src='data:image/png;base64,'+b;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=4)s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];return s/(d.length/4)},b64)};
(async()=>{const res={};const {chromium}=require('/opt/node22/lib/node_modules/playwright');const lb=await chromium.launch();LP=await lb.newPage();
for(const q of ['high','low']){
 const {b,page,errs}=await h.open({q,w:390,h:844,wait:1500,fixture:__dirname+'/saves/sahil-end-v8.json',patch:sv=>{sv.ts=Date.now()+1e6}});
 await page.evaluate(()=>__game.hideIntro());
 for(const [n,x,z] of [['plaza',-2,3],['pier',-18,0],['island',-58,2],['start',0,0]]){
  await page.evaluate(([x,z])=>{__game.tp(x,z);__game.sim(1.5)},[x,z]);
  const f=`${out}/bright_${tag}_${n}${q==='low'?'_low':''}.png`; await h.shot(page,f.replace(/\.png$/,'')); res[n+'_'+q]=+(await luma(f)).toFixed(1);}
 if(errs.length)console.log(errs.slice(0,3));await b.close();}
await lb.close();console.log(JSON.stringify(res));})();
