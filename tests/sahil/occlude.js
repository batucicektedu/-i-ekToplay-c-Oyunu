// Gorunurluk denetimi: her fixture icin, oyuncu pad/bolge/kapi/ipucu hedefinde dururken kameradan hedef merkezine isin at;
// bina/prop/agac/semsiye/tabela once vuruyorsa raporla. Ayrica pad ayak izi statik mesh kutusuyla kesisirse ve ipucu hedefi A* ile erisilemezse FAIL.
// node tests/sahil/occlude.js   (FIX=a.json,b.json ile sec)
const fs = require('fs'), path = require('path'), h = require('./h.js');
const dir = path.join(__dirname, 'saves');
const FIX = process.env.FIX ? process.env.FIX.split(',') : fs.readdirSync(dir).filter(f => /\.json$/.test(f)).map(f => path.join(dir, f));
(async () => {
  let problems = 0;
  for (const f of FIX) {
    const { b, page, errs } = await h.open({ q: 'low', fixture: path.isAbsolute(f) ? f : path.join(__dirname, f), wait: 1200, patch: sv => { sv.ts = Date.now() + 1e6; } });
    await page.evaluate(() => { window.__resetting = false; __game.hideIntro(); });
    const r = await page.evaluate((process_all) => {
      const g = __game, cam = g.camera, out = [], seen = new Set();
      const rc = new THREE.Raycaster();
      const anc = (o, grp) => { for (; o; o = o.parent) if (o === grp) return true; return false; };
      function check(tag, x, z, grp, y, half) {
        g.tp(x, z); g.sim(0.4); const PG_ = g.P().group; PG_.visible = false; g.render(); cam.updateMatrixWorld(true);
        const res = [], cs = []; const hh_ = half || 0; const smp = hh_ ? [[0, 0], [-hh_, -hh_], [hh_, -hh_], [-hh_, hh_], [hh_, hh_]] : [[0, 0]];
        smp.forEach(([ox, oz], si) => { const before = res.length; ray(tag, x, z, grp, y, ox, oz, res, PG_); cs[si] = res.length > before; });
        PG_.visible = true;
        const nc = cs.slice(1).filter(Boolean).length; if (cs[0] || nc >= 2) for (const e of res) { const k = e.tag + '|' + e.hit[0].toFixed(0) + ',' + e.hit[2].toFixed(0); if (!seen.has(k)) { seen.add(k); out.push(e); } }
      }
      function ray(tag, x0, z0, grp, y, ox, oz, res, PG_) {
        const x = x0 + ox, z = z0 + oz;
        const tgt = new THREE.Vector3(x, y == null ? 0.4 : y, z), from = cam.getWorldPosition(new THREE.Vector3()), dir = tgt.clone().sub(from), dist = dir.length(); dir.normalize();
        for (const w of [...g.GARD, ...g.HAMALS(), g.helper()].filter(Boolean)) if (w.group) w.group.visible = false; rc.set(from, dir); rc.far = dist - 0.05;
        const hits = []; g.scene.traverse(o => { if (!o.isMesh || o.isSprite || o.isInstancedMesh || !o.visible) return; try { rc.intersectObject(o, false).forEach(x => hits.push(x)); } catch (e) {} }); hits.sort((a, b) => a.distance - b.distance); PG_.visible = true;
        for (const hh of hits) {
          const o = hh.object; if (!o.visible) continue; let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; } if (!vis) continue;
          if (o.isSprite || o.isPoints || o.isLine) continue; if (grp && anc(o, grp)) continue;
          const m = o.material; if (!m || Array.isArray(m) || m.transparent || m.depthWrite === false || m.visible === false) continue;
          if (o.userData && (o.userData.dyn)) { /* hareketli: kisi/oge/ok/iz; yoksay */ if (o.parent === g.scene && !o.isMesh) continue; }
          if (hh.point.y < 0.35 || dist - hh.distance < 0.25) continue; if (hh.point.y < 2.2 && Math.hypot(hh.point.x - x, hh.point.z - z) < 1.3) continue; // oyuncu/pad kendi parcalari // zemin/su
          if (!hh.face || hh.face.normal.y > 0.9 && hh.point.y < 0.6) continue;
          const pa = o.geometry.attributes.position, A = new THREE.Vector3().fromBufferAttribute(pa, hh.face.a).applyMatrix4(o.matrixWorld), B = new THREE.Vector3().fromBufferAttribute(pa, hh.face.b).applyMatrix4(o.matrixWorld), C = new THREE.Vector3().fromBufferAttribute(pa, hh.face.c).applyMatrix4(o.matrixWorld); const w = Math.min(B.clone().sub(A).cross(C.clone().sub(A)).length() / 2 / Math.max(A.distanceTo(B), B.distanceTo(C), A.distanceTo(C)) * 2, 99); if (hh.point.y > 3.5 && w < 0.25) continue; // ince tel/ip: gercek perde degil
          const bb = o.geometry && (o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox));
          { res.push({ tag, tgt: [+x.toFixed(1), +z.toFixed(1)], hit: [+hh.point.x.toFixed(1), +hh.point.y.toFixed(1), +hh.point.z.toFixed(1)], d: +hh.distance.toFixed(1), w: +w.toFixed(2), tri: [A, B, C].map(v => [v.x, v.y, v.z].map(q => +q.toFixed(1)).join(',')).join(' '), obj: (o.name || o.type) + (o.isInstancedMesh ? ':inst' : '') + ' size ' + (bb ? [bb.max.x - bb.min.x, bb.max.y - bb.min.y].map(v => v.toFixed(1)).join('x') : '?') }); }
          break;
        }
      }
      let n = 0;
      for (const p of g.allPads()) { if (p.done) continue; const vis = p.group.visible; if (!vis && !process_all) continue; p.group.visible = true; n++; check('pad:' + p.key + (vis ? '' : '(hidden)'), p.x, p.z, p.group, 0.4, p.w * 0.4); p.group.visible = vis; }
      for (const z of g.zones) { if (z instanceof Object && g.allPads().includes(z)) continue; if (!z.group || !z.group.visible || z.noPadCheck && 0) continue; let v = true; for (let p = z.group; p; p = p.parent) if (!p.visible) v = false; if (!v) continue; n++; check('zone', z.x, z.z, z.group); }
      for (const gt of (g.GATES || [])) if (gt.g && gt.g.visible) { n++; check('gate', gt.o.x, gt.o.z, gt.g, 1.0); }
      // pad ayak izi / statik mesh kutulari
      const fp = [];
      for (const p of g.allPads()) { if (p.done) continue; const hw = p.w / 2, hd = p.d / 2; for (const bx of g.PROPBOX) if (bx[0] < p.x + hw && bx[1] > p.x - hw && bx[2] < p.z + hd && bx[3] > p.z - hd) { fp.push([p.key, 'propbox', +p.x.toFixed(1), +p.z.toFixed(1)]); break; } }
      // ipucu hedefi: sahnede cesitli konumlardan
      const hint = [], spots = [[-5.5, 2.6], [8, 2], [40, 25], [-14, 30], [30, 38], [0, 20], [-30, 0]];
      for (const sp of spots) {
        g.tp(sp[0], sp[1]); g.sim(0.1); const o = g.objective(); if (!o.ok) continue;
        const key = o.kind + '@' + o.x.toFixed(1) + ',' + o.z.toFixed(1); if (hint.some(q => q.k === key)) continue;
        const pth = g.path(o.x, o.z); const last = pth && pth[pth.length - 1]; const water = o.z > 44 || (o.x < -28.5 && Math.abs(o.z) > 1.8 && !(g.deckY && g.deckY(o.x, o.z) > 0));
        hint.push({ k: key, reach: !!(pth && pth.length) && (!last || Math.hypot(last[0] - o.x, last[1] - o.z) < 3), water });
        check('hint:' + o.kind, o.x, o.z, null, o.y);
      }
      // her pad A* ile erisilebilir ve suda degil
      g.tp(-2, 13); g.sim(0.1);
      for (const p of g.allPads()) { if (p.done) continue; const pth = g.path(p.x, p.z), last = pth && pth[pth.length - 1]; const water = p.z > 44.2; hint.push({ k: 'pad:' + p.key, reach: !!(pth && pth.length) && (!last || Math.hypot(last[0] - p.x, last[1] - p.z) < 3.5), water }); }
      // baslangic yuruyus alaninda olan pad, fixPads sonrasi da o alanda kalmali (bot/oyuncu ulasabilmeli)
      { const B = g.CFG.bounds, inB = (x, z) => x >= B.x0 + 0.5 && x <= B.x1 + 1.0 && z >= B.z0 + 0.5 && z <= B.z1; for (const p of g.allPads()) if (p.o0 && inB(p.o0[0], p.o0[1]) && !inB(p.x, p.z)) hint.push({ k: 'pad:' + p.key + ' moved outside walk bounds', reach: false, water: false }); }
      return { n, occ: out, fp, hint, hbad: hint.filter(q => !q.reach || q.water) };
    }, true);
    const ee = errs.filter(e => !/vibrate/.test(e));
    console.log(path.basename(f), 'targets', r.n, 'occluded', r.occ.length, 'footprint', r.fp.length, 'hints', r.hint.length, 'hintBad', r.hbad.length, 'errs', ee.length);
    for (const o of r.occ) console.log('  OCC', JSON.stringify(o)); for (const o of r.fp) console.log('  FOOT', JSON.stringify(o)); for (const o of r.hbad) console.log('  HINT', JSON.stringify(o));
    problems += r.occ.length + r.fp.length + r.hbad.length + ee.length; await b.close();
  }
  console.log(problems ? 'OCCLUDE FAIL ' + problems : 'OCCLUDE PASS 0 problems'); process.exit(problems ? 1 : 0);
})();
