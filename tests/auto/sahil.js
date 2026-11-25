// Bolum 2 (Sahil Balikcisi) otomasyon denetimi: sahil-end-v8.json + tum isci/otomasyon pad'leri maksimum, oyuncu kosede 20 sim dk HIC bir sey yapmaz.
// Calistir: NODE_PATH=/opt/node22/lib/node_modules node tests/auto/sahil.js  [SEC=1200] [DUMP=/tmp/x.json]
const h=require('./_h.js');
const SEC=+process.env.SEC||1200, STEP=30, PX=+process.env.PX||24, PZ=+process.env.PZ||4;
(async()=>{
const {b,page,errs,max}=await h.openAll('sahil',{fixture:__dirname+'/../sahil/saves/sahil-end-v8.json'});
await page.evaluate(([px,pz])=>{window.__resetting=true;__game.hideIntro();const g=__game;g.carry(0);g.tp(px,pz);window.__s0=Object.assign({},g.stats);window.__src={};
 {const S=g.S;let m=S.money;Object.defineProperty(S,'money',{get(){return m},set(v){const d=v-m;m=v;if(d>0){const st=(new Error().stack||'').split('\\n').slice(2,9).map(x=>(x.match(/at (\\S+)/)||[])[1]).filter(Boolean).join('<');(__src[st]=__src[st]||[0,0]);__src[st][0]+=d;__src[st][1]++}},configurable:true})}
 window.__snap=()=>{const g=__game,S=g.S,o={};const L=s=>s?s.length+(s.extra?0:0):-1,N=(k,v)=>{o[k]=v};
  N('money',S.money);
  for(const k of ['inputPile','outputPile','potInput','potOutput','shelf','shelfP','vanLoad','vanPile','moneyPile'])N(k,L(g[k]));
  N('moneyPile.extra',g.moneyPile.extra||0);N('queue',g.queue.length);N('customers',g.customers.length);N('machine.working',g.machine.working?1:0);
  N('dock',L(g.DOCK.stack));N('boats.on',g.BOATS.filter(x=>x.on).length);for(const s of ['moored','out','fish','back','in'])N('boats.'+s,g.BOATS.filter(x=>x.on&&x.state===s).length);N('hamals',g.HAMALS().length);N('hamal.carry',g.HAMALS().reduce((a,q)=>a+q.stack.length,0));
  for(const E of g.EATS){N('eat.'+E.id+'.input',L(E.input));N('eat.'+E.id+'.out',L(E.out));N('eat.'+E.id+'.pile',L(E.pile));N('eat.'+E.id+'.pileExtra',E.pile.extra||0);N('eat.'+E.id+'.queue',E.cs.length);N('eat.'+E.id+'.working',E.working?1:0)}
  for(const C of g.CAGES)N('cage.'+C.def.type+'.tray',L(C.tray));
  const H=g.HALL;N('hall.stock',L(H.stock));N('hall.pile',L(H.pile));N('hall.pileExtra',H.pile.extra||0);N('hall.state:'+H.state,1);
  N('fin.pile',L(g.FIN.pile));N('fin.pileExtra',g.FIN.pile.extra||0);
  N('carry',g.P().stack.length);N('player.inZone',g.zones.filter(z=>z.inside&&z.group&&z.group.visible).length);
  N('gard.n',g.GARD.length);N('tractors',g.GARD.filter(w=>w.tr).length);
  return o}},[PX,PZ]);
const ser=[];
for(let t=0;t<SEC;t+=STEP){ser.push(await page.evaluate(([st,px,pz])=>{const g=__game;for(let i=0;i<st;i++){g.sim(1);const p=g.P().group.position;p.x=px;p.z=pz}return __snap()},[STEP,PX,PZ]))}
const res=await page.evaluate(()=>{const g=__game,st=g.stats,d={};for(const k in st)d[k]=Math.round((st[k]-(__s0[k]||0))*100)/100;return {src:window.__src,delta:d,money:Math.round(g.S.money-(__s0.earned||0)),earned:st.earned-(__s0.earned||0),wd:(window.__wdLog||[]).reduce((a,x)=>{const k=x[1]+'|'+x[2];a[k]=(a[k]||0)+1;return a},{}),gard:g.GARD.map(w=>(w.role&&w.role.id||w.kind||'?')+(w.tr?'T':'')),carry:g.P().stack.length}});
const keys=[...new Set(ser.flatMap(s=>Object.keys(s)))],sm={};for(const k of keys){sm[k]=h.sum(ser.map(s=>s[k]===undefined?0:s[k]))}
console.log(JSON.stringify({max,res,sm}));
console.log(errs.filter(e=>!/vibrate/.test(e)));
const D=res.delta,S_=sm;
const pile=(k)=>Math.round((S_[k+'.pileExtra']?S_[k+'.pileExtra'].last:0)+(S_[k+'.pile']?S_[k+'.pile'].last:0)); // 20 dk sonunda toplanmamis para (yigin + tasan kisim; birim: para/banknot)
const CH=[ // [zincir, otomasyon rolu, uretim, satis/tuketim, toplanmamis nakit]
 ['Ana: balik>temizleme>raf>kasa','Yardimci(Balikci)+Tasiyici+Kasiyer',D.packed,D.s_bouquet,0],
 ['Midye kayaligi>saksi>raf','Yardimci+Tasiyici',D.potted,D.s_pot,0],
 ['Teslimat araci','Tasiyici yukler+toplar',D.vanRuns,D.vanRuns,0],
 ['Tekne>Rihtim>Hamal>temizleme','Balikci Teknesi+El Arabali Hamal',D.carted,D.carted,0],
 ['Balik-Ekmek teknesi','YOK (girdi+para elle)',D.grilled?D.grilled:0,0,pile('eat.gboat')],
 ['Karides&Yengec kafes>Deniz Tabagi','YOK (tepsi+girdi+para elle)',0,0,pile('eat.cage')],
 ['Balik Hali / Mezat','YOK (stok+para elle)',D.auctions||0,D.auctions||0,pile('hall')],
 ['Fener Kafe','gelir otomatik, para elle',1,1,Math.round(S_['fin.pileExtra'].last)]];
console.log('\nZINCIR | ROL | URETIM | SATIS | TOPLANMAMIS PARA | DURUM');
let bad=0;for(const [n,r,p,s2,u] of CH){const st=(p>0&&s2>0&&u<1000)?'OK':(u>=1000?'MANUAL (nakit toplanmiyor)':'MANUAL/STALLED');if(st!=='OK')bad++;console.log([n,r,Math.round(p||0),Math.round(s2||0),u,st].join(' | '))}
console.log('stalls(watchdog):',D.stalls||0,'| gelir (20dk, otomatik toplanan):',Math.round(res.earned),'| oyuncu tasiyor:',res.carry);
const dump=process.env.DUMP; if(dump) require('fs').writeFileSync(dump,JSON.stringify({res,sm,CH},null,1));
await b.close();process.exit(bad||(D.stalls||0)?1:0);})();
