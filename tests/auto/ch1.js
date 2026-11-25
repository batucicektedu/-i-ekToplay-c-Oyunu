// Bolum 1 (Cicek Bahcesi) otomasyon denetimi: max.json + tum isci/otomasyon pad'leri maksimum, oyuncu kosede 20 sim dakika HIC bir sey yapmaz.
// Calistir: NODE_PATH=... node tests/auto/ch1.js  [SEC=1200]   Cikti: JSON ozet (docs/review/automation.md bu cikti ile yazildi).
const h=require('./_h.js');
const SEC=+process.env.SEC||1200, STEP=30;
(async()=>{
const {b,page,errs,max}=await h.openAll('ch1',{fixture:__dirname+'/../max.json'});
await page.evaluate(()=>{window.__resetting=true;__game.hideIntro();const g=__game;g.tp(17,15);window.__s0=Object.assign({},g.stats);window.__made0={};for(const k in g.STN)__made0[k]=g.STN[k].made;window.__m0=g.S.money;window.__ser=[];window.__src={};{const S=g.S;let m=S.money;Object.defineProperty(S,'money',{get(){return m},set(v){const d=v-m;m=v;if(d>0){const st=(new Error().stack||'').split('\n').slice(2,9).map(x=>(x.match(/at (\S+)/)||[])[1]).filter(Boolean).join('<');const k=st||'?';(__src[k]=__src[k]||[0,0]);__src[k][0]+=d;__src[k][1]++}},configurable:true})}window.__snap=()=>{
  const g=__game,S=g.S,o={};const L=s=>s?s.length:-1,N=(k,v)=>{o[k]=v};
  N('money',S.money);
  for(const k of ['inputPile','outputPile','potInput','potOutput','shelf','shelfP','vanLoad','vanPile','moneyPile'])N(k,L(g[k]));
  N('moneyPile.extra',g.moneyPile.extra||0);N('vanPile.extra',g.vanPile.extra||0);
  N('queue',g.queue.length);N('customers',g.customers.length);N('machine.working',g.machine.working?1:0);
  for(const k in g.STN){const s=g.STN[k];N('stn.'+k+'.made',s.made);N('stn.'+k+'.out',L(s.out));N('stn.'+k+'.working',s.working?1:0);s.ins.forEach((q,i)=>N('stn.'+k+'.in'+i+':'+q.type,L(q.stack)))}
  const c=g.city();if(c){N('city.stock',L(c.stock));N('city.queue',c.queue.length)}
  const cf=g.cafe();if(cf){N('cafe.guests',cf.guests.length)}
  const C=g.c3.C3;N('hives.petek',C.hives.reduce((a,q)=>a+L(q.stack),0));
  const x=g.c3x();N('port.pile',L(x.PORT.pile));N('S.pt.n',S.pt.n);N('S.pt.pile',S.pt.pile||0);N('S.fe.n',S.fe.n);N('S.mv',S.mv);N('S.cb.sum',Object.values(S.cb).reduce((a,b)=>a+b,0));
  N('rare.on.field',x.list.length);N('carry',g.P().stack.length);N('P.x',g.P().group.position.x);N('P.z',g.P().group.position.z);
  N('tractors',g.GARD.filter(w=>w.tr).length);N('gard.n',g.GARD.length);
  N('buses',g.BUSES.length);
  return o}});
const ser=[];
for(let t=0;t<SEC;t+=STEP){ser.push(await page.evaluate((st)=>{const g=__game;for(let i=0;i<st;i++){g.sim(1);const p=g.P().group.position;p.x=17;p.z=15}return __snap()},STEP))}
const res=await page.evaluate(()=>{const g=__game,st=g.stats,d={};for(const k in st)d[k]=Math.round((st[k]-(__s0[k]||0))*100)/100;const made={};for(const k in g.STN)made[k]=g.STN[k].made-__made0[k];let dup='';try{document.getElementById('bBook').click();dup=document.getElementById('bSell').textContent}catch(e){}
return {made,dup,src:window.__src,delta:d,money:Math.round(g.S.money-__m0),wd:(window.__wdLog||[]).reduce((a,x)=>{const k=x[1]+'|'+x[2];a[k]=(a[k]||0)+1;return a},{}),gard:g.GARD.map(w=>(w.role&&w.role.id||w.kind||'?')+(w.tr?'T':'')),carry:g.P().stack.length}});
const keys=Object.keys(ser[0]),sm={};for(const k of keys){sm[k]=h.sum(ser.map(s=>s[k]))}
console.log(JSON.stringify({max,res,sm}));
console.log(errs.filter(e=>!/vibrate/.test(e)));
const D=res.delta,M=res.made,sold=(...k)=>k.reduce((a,x)=>a+(D[x]||0),0);
const CH=[ // [zincir, otomasyon rolu, uretilen, satilan/tuketilen]
 ['Buket (bahce>paket>raf>kasa)','Yardimci+Tasiyici+Kasiyer',D.packed,sold('s_bouquet','c_bouquet')],
 ['Saksi (sera>saksi>raf)','Yardimci(orkide)+Tasiyici',D.potted,sold('s_pot','c_pot')],
 ['Minibus teslimat','Tasiyici/Otobus yukler',D.vanRuns,D.vanRuns],
 ['Lavanta kesesi','Lavanta Bahcivani+Tasiyici/Otobus',M.kese,sold('s_sachet','c_sachet')],
 ['Parfum','Gul+Lavanta Bahcivani+Tasiyici/Otobus',M.parf,sold('s_perfume','c_perfume')],
 ['Cay (kafe)','Cay Bahcivani+Garson',M.tea,D.cafeServed],
 ['Dugun','Dugun Gorevlisi',D.wedItems,D.weddings],
 ['Aycicegi buketi','Traktor+Tasiyici/Otobus',M.sbq,sold('s_sbq','c_sbq')],
 ['Sehir subesi','Sube Kasiyeri (+Tasiyici/Otobus besler)',D.citySold,D.citySold],
 ['Bal','Arici+Tasiyici/Otobus',M.hon,sold('s_honey','c_honey')],
 ['Bonsai','Bonsai Ustasi+Tasiyici/Otobus',M.bon,sold('s_bonsai','c_bonsai')],
 ['Nadir cicek toplama','Bahcivanlar toplar',D.rares,D.rares],
 ['Koleksiyon kopya satisi','YOK (menu dugmesi)',D.rares,D.rareSold||0],
 ['Ihracat','Liman Hamali',D.exports,D.exportsDone],
 ['Festival','otomatik etkinlik',D.fests,D.fests],
 ['Muze','sanal ziyaretci',D.visitors,D.visitors],
 ['Gorevler','otomatik odul',D.quests,D.quests],
 ['Teslimat otobusu','Otobus',D.busTrips,D.busItems]];
console.log('\nZINCIR | ROL | URETIM | SATIS | DURUM');
let bad=0;for(const [n,r,p,s] of CH){const st=(p>0&&s>0)?'OK':'MANUAL/STALLED';if(st!=='OK')bad++;console.log([n,r,Math.round(p||0),Math.round(s||0),st].join(' | '))}
console.log('kopya satis dugmesi:',res.dup,'| para (20dk):',res.money,'| stalls(watchdog):',D.stalls||0,'| oyuncu tasiyor:',res.carry);
const dump=process.env.DUMP; if(dump) require('fs').writeFileSync(dump,JSON.stringify({res,sm},null,1));
await b.close();process.exit(bad||(D.stalls||0)?1:0);})();
