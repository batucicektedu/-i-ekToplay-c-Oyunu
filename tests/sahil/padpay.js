const h=require('./h.js');
(async()=>{const {b,page,errs}=await h.open({q:'low',fixture:process.env.FIX||__dirname+'/../max.json',wait:1500});
await page.evaluate(()=>{window.__resetting=false;__game.hideIntro()});
const r=await page.evaluate(()=>{const g=__game,out={fail:[],ok:0,skipped:[]};
for(const k in g.upPads){const u=g.upPads[k];if(u.done)continue;
 g.S.money=1e9;g.padOK().add(u);const before=g.S.lv[k];
 g.tp(u.x,u.z);g.sim(0.5);g.padOK().add(u);const vis0=u.group.visible;
 if(!vis0){out.skipped.push(k);continue;}
 let ok=false;for(let i=0;i<6&&!ok;i++){g.S.money=1e9;g.padOK().add(u);g.tp(u.x,u.z);g.sim(1.2);if(g.S.lv[k]>before||u.done)ok=true;}
 if(ok)out.ok++;else{const pv=(function(){try{return !!u.vis&&!u.vis()}catch(e){return 'err'}})();out.fail.push([k,'vis',vis0,'prereqHidden',pv,'lv',g.S.lv[k]])}}
return out});
console.log(JSON.stringify(r));console.log(errs);await b.close()})();
