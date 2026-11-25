// Pad gorunurluk testi: pad (satin alinmadan) sebepsiz gorunur<->gizli gecis yapmamali; alan icinde
// karsilanabilir pad kalici gorunmeli. Gezinti: bot ile plaza, iskele, kafesler, hal, rihtim.
const h=require('./h.js');
const FIX=['mid-v8','late-v8','end-v8'];
const ROUTE=[[-2,3],[-18,0],[-14,22],[-14,29],[-8,36],[-1.5,30],[10,22],[20,38],[40,20],[0,10],[-2,3]];
const VERBOSE=process.env.V;
(async()=>{const bad=[];
for(const fx of FIX){
 const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/saves/sahil-'+fx+'.json',wait:1200,patch:sv=>{sv.ts=Date.now()+1e6}});
 await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});await page.evaluate(h.WALK);
 const r=await page.evaluate(async(ROUTE)=>{const g=__game;const rec={};const ev=[];let frame=0;
  const eff=u=>{let p=u.group;while(p){if(!p.visible)return false;p=p.parent}return true};
  const miss={};const snap=()=>{frame++;for(const k in g.upPads){const u=g.upPads[k];const v=eff(u);const o=rec[k]||(rec[k]={vis:v,tog:0,done:u.done,first:frame,lastOn:v?frame:-1,x:u.x,z:u.z,minD:1e9});
   const pg=g.P().group.position,d=Math.hypot(pg.x-u.x,pg.z-u.z);if(d<o.minD)o.minD=d;
   if(u.done){o.done=true;o.vis=v;continue}
   { let pv=false;try{pv=!!u.vis?!!u.vis():true}catch(e){} const shown=pv&&(u.shown||u.autoShow); const ov=Object.values(g.upPads).some(q=>q!==u&&!q.done&&eff(q)&&Math.abs(q.x-u.x)<(q.w+u.w)/2-0.3&&Math.abs(q.z-u.z)<(q.d+u.d)/2-0.3);
     if(shown&&!v&&!ov&&g.S.money>=u.cost()*0.4&&d<9&&frame>25){miss[k]=(miss[k]||0)+1}else if(v||d>=9)miss[k]=0; if((miss[k]||0)===30)ev.push({k,f:frame,missing:true,money:Math.round(g.S.money),d:+d.toFixed(1)}) }
   if(v!==o.vis){o.tog++;ev.push({k,f:frame,v,money:Math.round(g.S.money),paid:Math.round(u.paid),d:+d.toFixed(1),pv:(()=>{try{return !!u.vis&&u.vis()}catch(e){return 'x'}})(),inP:g.padOK().has(u)});o.vis=v}}};
  for(const [x,z] of ROUTE){window.__walkR=1.0;window.__walk(x,z,60,snap);for(let i=0;i<10;i++){g.sim(0.1);snap()}}
  return {rec,ev,money:Math.round(g.S.money)}},ROUTE);
 const tg=Object.entries(r.rec).filter(([k,o])=>o.tog>0);
 console.log(fx,'pads',Object.keys(r.rec).length,'toggling',tg.length,'events',r.ev.length);
 for(const e of r.ev.slice(0,VERBOSE?200:12))console.log('  ',JSON.stringify(e));
 for(const e of r.ev){ // sebepsiz: gizlenme olayi, pad hala gecerli
  if(e.missing)bad.push(fx+' affordable pad missing near player '+e.k+' d='+e.d);else if(!e.v&&e.pv===true)bad.push(fx+' hid '+e.k+' d='+e.d+' money='+e.money)}
 const ee=errs.filter(e=>!/vibrate/.test(e));if(ee.length)bad.push(fx+' errors '+ee[0]);
 await b.close();
}
console.log(bad.length?'FAIL\n'+bad.slice(0,30).join('\n'):'PASS');process.exit(bad.length?1:0)})();
