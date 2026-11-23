// Ortak: sahnede yatay düzlem çiftleri (z-fighting adayları) taraması. Sayfada çalıştırılan fonksiyon metni.
module.exports = function scan(opts) {
  const T = opts.THREE_TOL || 0.02, out = [];
  const scene = __game.scene; scene.updateMatrixWorld(true);
  const flats = [];
  const vis = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.isSprite || !o.geometry) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m) return;
    const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    const sy = b.max.y - b.min.y, sx = b.max.x - b.min.x, sz = b.max.z - b.min.z;
    if (sy > 0.12 || sx * sz < 0.04) return; // sadece ince/yatay levhalar
    if (m.depthWrite === false && m.transparent && !m.polygonOffset && m.opacity < 1 && sy < 0.001) { /* decal: yine de listele */ }
    flats.push({ o, b, y: (b.max.y + b.min.y) / 2, top: b.max.y, bot: b.min.y, vis: vis(o), m, ro: o.renderOrder || 0,
      name: (o.name || o.geometry.type) + '#' + (m.color ? m.color.getHexString() : '') + (m.map ? 'T' : '') + (o.parent && o.parent.parent ? '<' + (o.parent.name || o.parent.type) : ''), po: !!m.polygonOffset, pf: m.polygonOffset ? m.polygonOffsetFactor + '/' + m.polygonOffsetUnits : '',  dw: m.depthWrite !== false, tr: !!m.transparent });
  });
  for (let i = 0; i < flats.length; i++) for (let j = i + 1; j < flats.length; j++) {
    const a = flats[i], c = flats[j];
    if (opts.visOnly && !(a.vis && c.vis)) continue;
    const ox = Math.min(a.b.max.x, c.b.max.x) - Math.max(a.b.min.x, c.b.min.x), oz = Math.min(a.b.max.z, c.b.max.z) - Math.max(a.b.min.z, c.b.min.z);
    if (ox < 0.1 || oz < 0.1) continue;
    const dTop = Math.abs(a.top - c.top), dBot = Math.abs(a.bot - c.bot), dTB = Math.min(Math.abs(a.top - c.bot), Math.abs(a.bot - c.top));
    const d = Math.min(dTop, dBot); // üst-üste temas (üst~alt) z-fighting değildir
    if (d >= T) continue;
    // güvenli: biri polygonOffset'li ya da depthWrite=false + farklı renderOrder
    const safe = (a.pf !== c.pf) || (a.tr && c.tr && !a.dw && !c.dw) || ((!a.dw || !c.dw) && a.ro !== c.ro);
    out.push({ d: +d.toFixed(4), area: +(ox * oz).toFixed(2), a: a.name + '@' + a.y.toFixed(3) + (a.vis ? '' : '(h)'), c: c.name + '@' + c.y.toFixed(3) + (c.vis ? '' : '(h)'), at: [+((Math.max(a.b.min.x, c.b.min.x) + Math.min(a.b.max.x, c.b.max.x)) / 2).toFixed(1), +((Math.max(a.b.min.z, c.b.min.z) + Math.min(a.b.max.z, c.b.max.z)) / 2).toFixed(1)], safe });
  }
  return { flats: flats.length, pairs: out };
};
