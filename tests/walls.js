// İşçi/müşteri/oyuncu duvar (collider) içinde mi? idle30 ile aynı tam kadro, MIN dakika sim; derinlik > D (varsayılan 0.55) olanları toplar.
// Kullanım: GAME=http://localhost:8123/index.html node tests/walls.js   (MIN=10 D=0.55)
const h=require('./h.js');
(async()=>{const MIN=+process.env.MIN||10,D=+process.env.D||0.55;
const {b,page,errs}=await h.open({q:'low',fixture:__dirname+'/max.json',wait:1500,noRaf:true,patch:sv=>{Object.assign(sv.lv,{wedW:1,portSpd:1,portCap:1,beeW:1,bonW:1,portW:1,cityW:1,cafeW:1,sunW:1,parfW:1,lavW:1,cafeG:1,
 helpCap:4,helperN:2,lavCap:4,lavN:2,parfCap:4,parfN:2,cafeGCap:4,cafeGN:2,sunCap:4,sunN:2,bonCap:4,bonN:2,carN:2,cashN:2,wedSpd:5,potSpd:5,bus:1,busSpd:5,busCap:4,busN:2,wedN:2,waitN:2,cityN:2,portN:2,beeN:2,helperT:1,lavT:1,parfT:1,cafeGT:1,bonT:1});sv.money=1000;}});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro();__game.tp(8,2);window.__W=new Map()});
const r=await page.evaluate(([MIN,D])=>{const g=__game,res={n:0};
 for(let i=0;i<MIN*60*30;i++){g.sim(1/30);if(i%6)continue;
  const who=[];const add=(n,o)=>{if(o&&o.group&&o.group.visible&&o.group.parent)who.push([n,o.group.position])};add('cashier',g.cashier);add('carrier',g.carrier);add('helper',g.helper());g.customers.forEach(c=>add('cust',c));(g.GARD||[]).forEach(c=>add('gard-'+c.kind,c));
  const bus=g.BUSES||[];
  for(const [n,p] of who)for(const c of g.colliders){if(c.active&&!c.active())continue;const d=Math.min(p.x-c.x0,c.x1-p.x,p.z-c.z0,c.z1-p.z);if(d>D){const k=n+'|'+[c.x0,c.x1,c.z0,c.z1].map(v=>v.toFixed(1)).join(',');const o=window.__W.get(k)||{n:0,max:0,x:0,z:0};o.n++;if(d>o.max){o.max=d;o.x=p.x;o.z=p.z}window.__W.set(k,o);break}}}
 return [...window.__W.entries()].map(([k,o])=>[k,o.n,+o.max.toFixed(2),+o.x.toFixed(1),+o.z.toFixed(1)]).sort((a,b)=>b[2]-a[2])},[MIN,D]);
r.forEach(x=>console.log(JSON.stringify(x)));console.log('colliders-hit',r.length,'errs',errs.length?errs:'none');
await b.close();process.exit(r.length?1:0)})();
