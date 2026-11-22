// Çizim çağrısı (draw call) ölçümü: yüksek kalite, tam kadro kayıt, farklı bölgelerde. Hedef: plaza ≈ ch1 (~300).
const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'high',wait:1500,fixture:__dirname+'/saves/sahil-end-v8.json',patch:sv=>{sv.ts=Date.now()+1e6}});
const r=await page.evaluate(()=>{const g=__game;g.hideIntro();const o={};for(const [n,x,z] of [['plaza',-2,3],['pier',-18,0],['quay',-18,16],['east',44,26],['south',20,38],['hall',-14,30],['island',-58,2],['midye',30,0]]){g.tp(x,z);g.sim(1);o[n]=g.measure().calls}return o});
console.log(JSON.stringify(r));console.log(errs.filter(e=>!/vibrate/.test(e)));await b.close()})();
