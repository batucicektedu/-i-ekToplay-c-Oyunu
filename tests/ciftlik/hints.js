// Rehber ipucu koşulları (objective): doğru hedef türü seçiliyor mu?
const h=require('./h.js');
(async()=>{const bad=[];
{const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:900});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
 const k=async(n,f,exp)=>{const r=await page.evaluate(f);const ok=exp.includes(r.kind);console.log(n,r.kind,ok?'ok':'BEKLENEN '+exp);if(!ok)bad.push(n)};
 await k('taze: yumurta topla',()=>{__game.S.money=0;return __game.objective()},['harvest']);
 await k('çanta dolu: kolile',()=>{__game.carry(__game.P().capFn());return __game.objective()},['pack']);
 await k('çanta 10 yumurta: kolile/topla',()=>{__game.carry(10);return __game.objective()},['pack','harvest']);
 if(errs.length)bad.push('errors '+errs[0]);await b.close()}
{const {b,page,errs}=await h.open({q:'low',w:300,h:500,wait:1200,fixture:__dirname+'/farm.json',patch:s=>{s.ts=Date.now()+1e6;s.lv.groom=0;s.lv.shep=0;s.lv.seller=0;s.lv.instr=0}});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(7,-40);__game.sim(20);__game.SHOW.state='cd';__game.SHOW.cd=999;__game.P().stack.items.length=0;__game.RH.forEach(h=>h.love=20)});
 const k=async(n,f,exp)=>{const r=await page.evaluate(f);const ok=exp.includes(r.kind);console.log(n,r.kind,ok?'ok':'BEKLENEN '+exp);if(!ok)bad.push(n)};
 await k('atlar aç: havuç/saman',()=>__game.objective(),['carrot','hay','apple']);
 await k('havuçla: besle',()=>{__game.give('carrot',3);return __game.objective()},['feed']);
 await k('yünle: atölyeye bırak',()=>{__game.P().stack.items.length=0;__game.RH.forEach(h=>h.love=95);__game.give('wool',3);return __game.objective()},['drop']);
 await k('kazakla: pazar',()=>{__game.P().stack.items.length=0;__game.give('sweater',2);return __game.objective()},['sell']);
 if(errs.length)bad.push('errors '+errs[0]);await b.close()}
console.log(bad.length?'FAIL '+bad:'PASS');process.exit(bad.length?1:0)})();
