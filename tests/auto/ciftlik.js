// Bolum 3 (Hayvan Ciftligi) otomasyon denetimi: tests/ciftlik/auto.json + tum isci/otomasyon pad'leri maksimum, oyuncu kosede 20 sim dk HIC bir sey yapmaz.
// Calistir: NODE_PATH=/opt/node22/lib/node_modules node tests/auto/ciftlik.js  [SEC=1200] [DUMP=/tmp/x.json]
const h=require('./_h.js');
const SEC=+process.env.SEC||1200, STEP=30, PX=+process.env.PX||7, PZ=+process.env.PZ||-8;
(async()=>{
const {b,page,errs,max}=await h.openAll('ciftlik',{fixture:__dirname+'/../ciftlik/auto.json'});
await page.evaluate(([px,pz])=>{window.__resetting=true;__game.hideIntro();const g=__game;g.carry(0);g.tp(px,pz);window.__s0=Object.assign({},g.stats);window.__src={};
 {const S=g.S;let m=S.money;Object.defineProperty(S,'money',{get(){return m},set(v){const d=v-m;m=v;if(d>0){const st=(new Error().stack||'').split('\\n').slice(2,9).map(x=>(x.match(/at (\\S+)/)||[])[1]).filter(Boolean).join('<');(__src[st]=__src[st]||[0,0]);__src[st][0]+=d;__src[st][1]++}},configurable:true})}
 window.__snap=()=>{const g=__game,S=g.S,o={};const L=s=>s?s.length:-1,N=(k,v)=>{o[k]=v};
  N('money',S.money);
  for(const k of ['inputPile','outputPile','potInput','potOutput','shelf','shelfP','vanLoad','vanPile','moneyPile'])N(k,L(g[k]));
  N('moneyPile.extra',g.moneyPile.extra||0);N('queue',g.queue.length);N('customers',g.customers.length);N('machine.working',g.machine.working?1:0);
  const rp=g.ranchPile();N('ranch.pile',L(rp));N('ranch.pileExtra',rp.extra||0);N('ranch.riders',g.RC.length);N('ranch.queue',g.RC.filter(r=>r.st==='queue').length);N('ranch.ridersOnHorse',g.RC.filter(r=>r.st==='ride').length);
  N('show.state:'+g.SHOW.state,1);
  g.RH.forEach((r,i)=>N('horse'+i+'.love',r.love));N('horse.minLove',Math.min(...g.RH.map(r=>r.love)));N('horses',g.RH.length);
  N('fw.groom',g.FWU.filter(w=>w.role==='groom').length);N('fw.shep',g.FWU.filter(w=>w.role==='shep').length);N('fw.seller',g.FWU.filter(w=>w.role==='seller').length);
  for(const k of ['groom','shep','seller']){for(const st of ['idle','fetch','deliver','milkFetch','milkDrop']){const n=g.FWU.filter(w=>w.role===k&&w.state===st).length;if(n)N('fw.'+k+'.'+st,n)}}
  const st=g.stats;for(const k of ['sheared','made','s_sweater','s_cheese','rides','shows','fed','carrots']) N('c.'+k,st[k]||0);
  N('carry',g.P().stack.length);N('player.inZone',g.zones.filter(z=>z.inside&&z.group&&z.group.visible).length);
  N('gard.n',g.GARD.length);N('carx',g.CARX.length);N('cashx',g.CASHX.length);
  return o}},[PX,PZ]);
const ser=[];
for(let t=0;t<SEC;t+=STEP){ser.push(await page.evaluate(([st,px,pz])=>{const g=__game;for(let i=0;i<st;i++){g.sim(1);const p=g.P().group.position;p.x=px;p.z=pz}return __snap()},[STEP,PX,PZ]))}
const res=await page.evaluate(()=>{const g=__game,st=g.stats,d={};for(const k in st)d[k]=Math.round((st[k]-(__s0[k]||0))*100)/100;return {src:window.__src,delta:d,earned:st.earned-(__s0.earned||0),wd:(window.__wdLog||[]).reduce((a,x)=>{const k=x[1]+'|'+x[2];a[k]=(a[k]||0)+1;return a},{}),gard:g.GARD.map(w=>(w.role&&w.role.id||w.kind||'?')+(w.tr?'T':'')),carry:g.P().stack.length,fwReset:st.fwReset||0}});
const keys=[...new Set(ser.flatMap(s=>Object.keys(s)))],sm={};for(const k of keys){sm[k]=h.sum(ser.map(s=>s[k]===undefined?0:s[k]))}
// son 10 dk'da ilerleme var mi (tikanma tespiti): sayaclarin ikinci yarisindaki artisi
const half=Math.floor(ser.length/2),late=k=>ser[ser.length-1][k]-ser[half][k];
console.log(JSON.stringify({max,res,sm,late:{sheared:late('c.sheared'),made:late('c.made'),sweater:late('c.s_sweater'),cheese:late('c.s_cheese'),rides:late('c.rides'),shows:late('c.shows'),fed:late('c.fed')}}));
console.log(errs.filter(e=>!/vibrate/.test(e)));
const D=res.delta,S_=sm,rp=Math.round(S_['ranch.pileExtra'].last+S_['ranch.pile'].last);
const CH=[ // [zincir, otomasyon rolu, uretim, satis/tuketim, toplanmamis nakit]
 ['Yumurta (folluk>paket>raf>kasa)','Ciftci(Yumurta Arabasi)+Tasiyici+Kasiyer',D.packed,D.s_bouquet,0],
 ['Sut (ahir>kova>raf)','Ciftci+Sut Traktoru+Kasiyer',D.potted,D.s_pot,0],
 ['Sut kamyonu','Tasiyici yukler+toplar',D.vanRuns,D.vanRuns,0],
 ['At binisi (ranch)','Binicilik Hocasi (bineri baslatir + parayi toplar)',D.rides,D.rides,rp],
 ['At bakimi (yem>sevgi)','Seyis (+elma bahcesi/havuc)',D.fed,D.fed,0],
 ['Engelli Parkur gosterisi','Binicilik Hocasi (hazir olunca otomatik baslatir)',D.shows||0,D.shows||0,0],
 ['Koyun>yun>orgu>kazak>pazar','Coban+Pazarci',D.sheared,D.s_sweater,0],
 ['Sut>peynir>pazar','Pazarci (sut tasir+satar)',D.made,D.s_cheese,0],
 ['Sevimli Hayvanlar (ziyaretci)','otomatik ziyaretci',1,1,0]];
console.log('\\nZINCIR | ROL | URETIM | SATIS | TOPLANMAMIS PARA | DURUM');
let bad=0;for(const [n,r,p,s2,u] of CH){const st=(p>0&&s2>0&&u<1000)?'OK':(u>=1000?'MANUAL (nakit toplanmiyor)':'MANUAL/STALLED');if(st!=='OK')bad++;console.log([n,r,Math.round(p||0),Math.round(s2||0),u,st].join(' | '))}
console.log('stalls(watchdog):',D.stalls||0,'fwReset:',res.fwReset,'| gelir (20dk):',Math.round(res.earned),'| minLove(min):',S_['horse.minLove'].min,'| oyuncu tasiyor:',res.carry);
const dump=process.env.DUMP; if(dump) require('fs').writeFileSync(dump,JSON.stringify({res,sm,CH},null,1));
await b.close();process.exit(bad||(D.stalls||0)?1:0);})();
