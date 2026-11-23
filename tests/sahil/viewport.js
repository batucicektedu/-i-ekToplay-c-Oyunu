// iPhone emulasyonu: canvas ve #app tam yüksekliği kaplamalı, altta boş şerit olmamalı
const {devices}=require('/opt/node22/lib/node_modules/playwright');const h=require('./h.js'),path=require('path');
(async()=>{const {b,page,errs}=await h.open({q:'low',device:devices['iPhone 13'],wait:1800});
const r=await page.evaluate(()=>{const c=document.getElementById('c').getBoundingClientRect(),a=document.getElementById('app').getBoundingClientRect();return{ih:innerHeight,cb:c.bottom,ab:a.bottom}});
console.log(JSON.stringify(r));await page.screenshot({path:path.resolve(__dirname,'../../docs/sahil/iphone_after.png')});
const bad=[];if(r.cb<r.ih-0.5||r.ab<r.ih-0.5)bad.push('canvas/app shorter than window');
const e=errs.filter(e=>!/vibrate/.test(e));if(e.length)bad.push('errors');
console.log(bad.length?'FAIL '+bad:'PASS');await b.close();process.exit(bad.length?1:0)})();
