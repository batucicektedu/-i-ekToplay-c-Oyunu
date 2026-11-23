// Ses denetimi: oyuncu hareketsizken hicbir ses ortalama 3 sn'de 1'den fazla calmamali. SEC=60
const h=require('./h.js');
(async()=>{const SEC=+process.env.SEC||60;let fail=false;
for(const fx of ['sahil-mid-v8','sahil-end-v8']){
 const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/'+fx+'.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6}});
 await page.addInitScript(()=>{});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();
  window.__snd=[];const mk=()=>({connect(){return this},start(){},stop(){},setValueAtTime(){},exponentialRampToValueAtTime(){},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},type:''});
  const fake={currentTime:0,state:'running',destination:{},resume(){},createOscillator(){window.__snd.push((new Error().stack||'').split('\n').slice(3,5).map(s=>s.trim().replace(/\(.*\//,'(')).join(' < '));return mk()},createGain:mk};
  window.AudioContext=function(){return fake};window.webkitAudioContext=window.AudioContext;
  document.dispatchEvent(new Event('pointerdown'));window.dispatchEvent(new Event('pointerdown'));
  const c=document.getElementById('c');if(c)c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
  __game.tp(-2,13);__game.sim(1);window.__snd.length=0;});
 const r=await page.evaluate((SEC)=>{__game.sim(SEC);return window.__snd},SEC);
 const by={};for(const s of r){by[s]=(by[s]||0)+1}
 const perN=SEC/3*1.5;const tot=r.length;
 console.log(fx,'osc calls',tot,'in',SEC,'s');for(const k in by)console.log(' ',by[k],k.slice(0,200));
 if(tot>perN)fail=true;
 const ee=errs.filter(e=>!/vibrate/.test(e));if(ee.length){console.log(ee);fail=true}
 await b.close();}
console.log(fail?'SOUND FAIL':'SOUND PASS');process.exit(fail?1:0)})();
