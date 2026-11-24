// Arayuz denetimi: dar ekranlarda ayarlar menusu, sifirlama cift onayi, bolum karti, dokunma hedefleri >=44px, yatay tasma yok.
const h=require('./h.js'),path=require('path');
const SZ=[[390,844],[360,740],[768,1024]];
(async()=>{const bad=[];
for(const [w,hh] of SZ){const {b,page,errs}=await h.open({q:'low',w,h:hh,wait:1200});
 const out=path.resolve(__dirname,'../../docs/release/sahil_ui_'+w+'x'+hh+'_');
 await page.click('#chapCard button');await page.waitForTimeout(200);
 await page.evaluate(()=>{__game.tp(-20,0);__game.sim(1)});
 await page.click('#reset');await page.waitForTimeout(200);await h.shot(page,out+'menu');
 const m=await page.evaluate(()=>{const r=[];for(const b of document.querySelectorAll('#menu button')){const q=b.getBoundingClientRect();if(q.width>0)r.push([b.id,Math.round(q.height),Math.round(q.width),Math.round(q.top),Math.round(q.bottom)])}const bx=document.querySelector('#menu .mbox').getBoundingClientRect();return {r,top:bx.top,bottom:bx.bottom,H:innerHeight,sw:document.documentElement.scrollWidth,W:innerWidth}});
 for(const q of m.r)if(q[1]<44||q[2]<44)bad.push(w+' small button '+q.join());if(m.top<0||m.bottom>m.H)bad.push(w+' menu overflows');if(m.sw>m.W)bad.push(w+' h-scroll');
 // ses/titresim
 await page.click('#mSnd');await page.click('#mVib');const pr=await page.evaluate(()=>[document.getElementById('mSnd').textContent,document.getElementById('mVib').textContent,localStorage.getItem('cicek_ayar'),!!localStorage.getItem('bolum2_sahil')||'nosave']);console.log(w,JSON.stringify(pr));
 if(!/Kapalı/.test(pr[0])||!/Kapalı/.test(pr[1]))bad.push('toggle');
 await page.click('#mSnd');await page.click('#mVib');
 // sifirla: 1. onay -> vazgec -> kayit duruyor; 2 onay
 await page.click('#mReset');await page.waitForTimeout(150);await h.shot(page,out+'reset1');
 let t=await page.evaluate(()=>document.querySelector('#chapCard .ct').textContent);if(!/silinsin/.test(t))bad.push('reset1 '+t);
 const btn=txt=>page.evaluate(t=>{const b=[...document.querySelectorAll('#chapCard button')].find(x=>x.textContent===t);if(!b)return false;b.click();return true},txt);
 await btn('Devam');await page.waitForTimeout(150);await h.shot(page,out+'reset2');t=await page.evaluate(()=>document.querySelector('#chapCard .ct').textContent);if(!/Emin/.test(t))bad.push('reset2 '+t);
 await btn('Vazgeç');const still=await page.evaluate(()=>document.getElementById('chapCard').style.display);if(still==='flex')bad.push('card not closed');
 // bolumler
 await page.click('#reset');await page.click('#mChap');await page.waitForTimeout(150);await h.shot(page,out+'chaps');
 const cm=await page.evaluate(()=>{const bx=document.querySelector('#chapCard .cb').getBoundingClientRect();return [bx.top,bx.bottom,innerHeight,[...document.querySelectorAll('#chapCard button')].map(b=>Math.round(b.getBoundingClientRect().height))]});console.log(w,'chap card',JSON.stringify(cm));if(cm[0]<0||cm[1]>cm[2])bad.push(w+' chap card overflow');if(cm[3].some(v=>v<44))bad.push('chap btn small');
 // metin: NaN/undefined
 const txt=await page.evaluate(()=>document.body.innerText);if(/NaN|undefined|Infinity|null/.test(txt))bad.push(w+' bad text '+txt.match(/NaN|undefined|Infinity|null/)[0]);
 const ee=errs.filter(e=>!/vibrate/.test(e));if(ee.length)bad.push(w+' errors '+ee[0]);await b.close();}
console.log(bad.length?'FAIL '+JSON.stringify(bad):'UI PASS');process.exit(bad.length?1:0)})();
