// Uzun oyun kararliligi: sahil-end-v8 uzerinde MIN sim dakikasi (varsayilan 60). Her 10 dk: sahne nesne sayisi, geometri/doku, JS heap, sim kare suresi.
const h=require('./h.js');
(async()=>{const MIN=+process.env.MIN||60;const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/saves/sahil-end-v8.json',wait:1500,patch:sv=>{Object.assign(sv.lv,{helper:1,helperN:2,helpCap:4,cashier:1,carrier:1,carN:2,cashN:2,carSpd:3,carCap:3});sv.money=1000;sv.ts=Date.now()+1e6}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2)});
const sample=()=>page.evaluate(()=>{const g=__game;let n=0,meshes=0;g.scene.traverse(o=>{n++;if(o.isMesh)meshes++});const t0=performance.now();g.sim(5);const ft=(performance.now()-t0)/150;
 let heap=0;try{heap=performance.memory.usedJSHeapSize/1048576}catch(e){}
 return {objs:n,meshes,heapMB:+heap.toFixed(1),frameMs:+ft.toFixed(2),geo:g.info.geo,tex:g.info.tex,prog:g.info.prog,money:Math.round(g.S.money),st:Object.keys(g.stats).length}});
const rows=[await sample()];console.log(0,JSON.stringify(rows[0]));
for(let m=10;m<=MIN;m+=10){await page.evaluate(()=>{for(let i=0;i<600;i++)__game.sim(1)});const r=await sample();rows.push(r);console.log(m,JSON.stringify(r));}
const f=rows[1]||rows[0],l=rows[rows.length-1],bad=[];
if(l.objs>f.objs*1.1+50)bad.push('objs grow '+f.objs+'->'+l.objs);if(l.geo>f.geo+30)bad.push('geo grow '+f.geo+'->'+l.geo);if(l.tex>f.tex+10)bad.push('tex grow');if(l.heapMB>f.heapMB*1.6+30)bad.push('heap grow '+f.heapMB+'->'+l.heapMB);
if(l.frameMs>f.frameMs*1.8+1)bad.push('frame time grows '+f.frameMs+'->'+l.frameMs);
const ee=errs.filter(e=>!/vibrate/.test(e));console.log(ee.slice(0,5));if(ee.length)bad.push('errors');
console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
