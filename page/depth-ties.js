/* The ties (the Architect's 154th, 23 October 2026; Godric's 7.22 pm glitch, the same cause every time): two faces of
   different looks laid in one plane, or a few millimetres apart facing the same way (a stripe on a runner, a line on a
   cabinet, a scroll behind a bar, paint on a floor), and the depth test cannot choose between them: the striped,
   combing patches. Lifted from page/shell-w5b.js's tie pass so every page's things go through one pass once built:

     CastleTies.settle(THREE, group, opts) -> { ms, meshes, anchors, ties, orders, stepped, stuck }

   Every face of every mesh under `group` is keyed by its plane in world space. Two meshes of different looks (colour,
   map, emissive) with faces overlapping in one plane, or within GAP (5 mm) facing the same way, are a pair: the face
   nearer along its normal takes the nearer depth step (an order), and faces truly in one plane (within 0.3 mm) take
   different steps (a tie). A step is drawn nearer by polygonOffset (factor -s, units -2s); the mesh's material is
   cloned before it is stepped, so a material shared by other meshes stays as it was. userData.rank carries minus the
   step for tools/architect-seams.mjs, which counts a ranked pair as no fight.

   Anchors: walls, floors, ceilings and stone (`opts.anchor`, by the mesh's or a parent's name), meshes another pass has
   already stepped, and transparent or alpha-tested ones take part but are never moved, so paint on a floor or a frame
   on a wall steps forward and the room stays as built. A pair of two anchors is left alone (a fight there wants the
   geometry moved: the shell's wall is double-sided). Instanced and skinned meshes are left out. Once, at load.

   A step settles a tie; the build figure stays the rule: two layered faces of one thing stand 8 mm or more apart, or
   lie in one plane on purpose (docs/architect/conventions.md, the layered faces). */
(function () {
  var GAP = 0.005, SAME = 0.0003, CELL = 0.5, MAXSTEP = 4;
  var ANCHOR = /(^|-)(wall|walls|floor|ceiling|ceilings|vault|masonry|threshold|roof|leads|lining)(-|$)|^way-|-wall-/;

  function look(mt) {
    return (mt.map ? mt.map.uuid : (mt.color ? mt.color.getHexString() : '')) + '|' + (mt.emissive ? mt.emissive.getHexString() : '') + '|' + mt.type;
  }

  function settle(THREE, group, opts) {
    opts = opts || {};
    var t0 = performance.now(), anchor = opts.anchor || ANCHOR, list = [], cells = {}, wide = {}, pairs = {};
    group.updateMatrixWorld(true);
    group.traverse(function (o) {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || !o.geometry || !o.geometry.attributes.position) return;
      var mt = o.material, fixed = !!(mt.transparent || mt.alphaTest > 0 || mt.polygonOffset || o.userData.rank);
      for (var p = o; !fixed && p && p !== group.parent; p = p.parent) if (p.name && anchor.test(p.name)) fixed = true;
      list.push({ o: o, look: look(mt), i: list.length, fixed: fixed, base: o.userData.rank ? -o.userData.rank : 0 });
    });
    var v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3();
    function meet(M, T, o) {   /* two faces near one plane: a pair once their overlap is more than 3 mm each way */
      if (o.m === M.i || list[o.m].look === M.look || Math.abs(o.d - T.d) > GAP || (M.fixed && list[o.m].fixed)) return;
      var a = Math.min(o.m, M.i), b = Math.max(o.m, M.i), key = a + ':' + b;
      if (pairs[key]) return;
      var ov = [0, 1, 2].map(function (k) { return Math.min(T.hi[k], o.hi[k]) - Math.max(T.lo[k], o.lo[k]); }).sort(function (x, y) { return y - x; });
      if (!(ov[0] > 0.003 && ov[1] > 0.003)) return;
      /* the nearer along the shared normal is in front; within SAME, one plane: a tie */
      var dd = T.d - o.d, P = pairs[key] = { a: a, b: b };
      if (Math.abs(dd) <= SAME) P.tie = true; else P.front = dd > 0 ? M.i : o.m;
    }
    function faces(M, each) {
      var g = M.o.geometry, pos = g.attributes.position, idx = g.index, cnt = idx ? idx.count : pos.count, W = M.o.matrixWorld;
      for (var t = 0; t + 2 < cnt; t += 3) {
        for (var k = 0; k < 3; k++) v[k].fromBufferAttribute(pos, idx ? idx.getX(t + k) : t + k).applyMatrix4(W);
        n.crossVectors(e1.subVectors(v[1], v[0]), e2.subVectors(v[2], v[0]));
        var nl = n.length(); if (nl < 4e-6) continue;   /* a face under 2 mm2 */
        n.divideScalar(nl);
        var d = n.dot(v[0]);
        each({ m: M.i, d: d, nk: Math.round(n.x * 100) + ',' + Math.round(n.y * 100) + ',' + Math.round(n.z * 100), dk: Math.round(d / GAP),
          lo: [Math.min(v[0].x, v[1].x, v[2].x), Math.min(v[0].y, v[1].y, v[2].y), Math.min(v[0].z, v[1].z, v[2].z)],
          hi: [Math.max(v[0].x, v[1].x, v[2].x), Math.max(v[0].y, v[1].y, v[2].y), Math.max(v[0].z, v[1].z, v[2].z)] });
      }
    }
    /* the anchors' faces first, by plane alone (a floor's two triangles span the room); then the things', by plane and
       half-metre cell, each met against the anchors on its plane and the things before it in its cells */
    list.forEach(function (M) { if (M.fixed) faces(M, function (T) { var K = T.nk + '|' + T.dk; (wide[K] = wide[K] || []).push(T); }); });
    list.forEach(function (M) {
      if (M.fixed) return;
      faces(M, function (T) {
        for (var q = T.dk - 1; q <= T.dk + 1; q++) { var W0 = wide[T.nk + '|' + q]; if (W0) for (var j = 0; j < W0.length; j++) meet(M, T, W0[j]); }
        var cx0 = Math.floor(T.lo[0] / CELL), cx1 = Math.floor(T.hi[0] / CELL), cy0 = Math.floor(T.lo[1] / CELL), cy1 = Math.floor(T.hi[1] / CELL),
            cz0 = Math.floor(T.lo[2] / CELL), cz1 = Math.floor(T.hi[2] / CELL);
        if ((cx1 - cx0 + 1) * (cy1 - cy0 + 1) * (cz1 - cz0 + 1) > 400) return;   /* a face over 100 m2 of cells: no thing's */
        for (var cx = cx0; cx <= cx1; cx++) for (var cy = cy0; cy <= cy1; cy++) for (var cz = cz0; cz <= cz1; cz++) {
          var ck = cx + ',' + cy + ',' + cz;
          for (q = T.dk - 1; q <= T.dk + 1; q++) { var L0 = cells[T.nk + '|' + q + '|' + ck]; if (L0) for (j = 0; j < L0.length; j++) meet(M, T, L0[j]); }
          var K = T.nk + '|' + T.dk + '|' + ck; (cells[K] = cells[K] || []).push(T);
        }
      });
    });
    /* the steps: each front one above its back one, tied ones apart, only the unfixed moved, the fewest steps that
       hold (capped at MAXSTEP); a pair no step can settle (an anchor in front of a thing) is counted as stuck */
    var step = {}, ps = Object.keys(pairs).map(function (k) { return pairs[k]; }), ties = 0, orders = 0, stuck = 0;
    ps.forEach(function (P) { if (P.tie) ties++; else orders++; step[P.a] = list[P.a].base; step[P.b] = list[P.b].base; });
    function lift(i, to) { if (list[i].fixed || to > MAXSTEP || step[i] >= to) return false; step[i] = to; return true; }
    for (var it = 0, moved = true; moved && it < 12; it++) {
      moved = false;
      ps.forEach(function (P) {
        if (P.tie) { if (step[P.a] === step[P.b]) moved = lift(P.b, step[P.a] + 1) || lift(P.a, step[P.b] + 1) || moved; return; }
        var f = P.front, bk = f === P.a ? P.b : P.a;
        if (step[f] <= step[bk]) moved = lift(f, step[bk] + 1) || moved;
      });
    }
    ps.forEach(function (P) {
      if (P.tie ? step[P.a] === step[P.b] : step[P.front] <= step[P.front === P.a ? P.b : P.a]) stuck++;
    });
    var stepped = 0, clones = {};
    Object.keys(step).forEach(function (i) {
      var s = step[i], M = list[i]; if (!s || M.fixed) return;
      var o = M.o, ck = o.material.uuid + '|' + s;
      var mt = clones[ck] || (clones[ck] = o.material.clone());
      mt.polygonOffset = true; mt.polygonOffsetFactor = -s; mt.polygonOffsetUnits = -2 * s;
      o.material = mt; o.userData.rank = -s; stepped++;
    });
    var out = { ms: Math.round(performance.now() - t0), meshes: list.length, anchors: list.filter(function (M) { return M.fixed; }).length,
      ties: ties, orders: orders, stepped: stepped, stuck: stuck };
    window.__castleTies = out;
    return out;
  }

  window.CastleTies = { settle: settle, GAP: GAP };
})();
