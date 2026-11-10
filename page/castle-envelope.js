/* The castle's envelope (req 3344/3397, the Architect, 9 November 2026; docs/architect/envelope-3344.md, step 1).
   One owner for every boundary: each place's plan edge is cut into pieces of at most STEP and each piece is classed by a
   point-in-polygon probe straight out from it (0.05 m to the wall's thickness + 0.5): no place there over the same
   heights is AIR (the outer envelope, drawn by that place), another place there is SHARED (drawn once, by its owner: the
   lower id for now; the keeping room once the builder reads it). Roofs and soffits: a place's plan less what a place
   above (within LIFT over its ceiling) or below (within LIFT under its floor) covers, sampled on a CELL grid. Pure
   data, no THREE: node runs it (tools/envelope-fixtures.mjs), and the page feeds it findPlace's places.
   CastleEnvelope.declare(places) -> { pieces, roofs, soffits, totals: { air, shared, sharedOwned, roof, soffit } }
   places: [{ id, poly: [[x, y], ...] (either winding), floor, ceiling, wall }] */
(function (W) {
  var STEP = 0.25, CELL = 0.1, LIFT0 = 1.5, GRID = 4;
  function area(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  function inside(p, x, y) { var c = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { var a = p[i], b = p[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function box(p) { var b = [1e9, 1e9, -1e9, -1e9]; p.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); return b; }
  function overlaps(a0, a1, b0, b1) { return Math.min(a1, b1) - Math.max(a0, b0) > 0.01; }
  function declare(places, opts) {
    var LIFT = (opts && opts.lift) || LIFT0;
    var P = places.map(function (q) { var poly = area(q.poly) < 0 ? q.poly.slice().reverse() : q.poly; return { id: q.id, poly: poly, floor: q.floor, ceiling: q.ceiling, wall: q.wall || 0.8, bb: box(poly) }; });
    /* a bucket grid (GRID m) over the places' boxes, so the probe asks only the places near it (834 rooms in the castle) */
    var G = {}; P.forEach(function (q) { var w = q.wall; for (var gx = Math.floor((q.bb[0] - w) / GRID); gx <= Math.floor((q.bb[2] + w) / GRID); gx++) for (var gy = Math.floor((q.bb[1] - w) / GRID); gy <= Math.floor((q.bb[3] + w) / GRID); gy++) (G[gx + ',' + gy] = G[gx + ',' + gy] || []).push(q); });
    /* the vertical test's cover: a place's plan dilated by its wall (walls stand outside the plan at t, castle-shell.js
       'outward'), as the edge probe already reaches wall + 0.5 out (revised 9.35 pm, the fixtures' expectations first) */
    function near(q, x, y) { if (x < q.bb[0] - q.wall || x > q.bb[2] + q.wall || y < q.bb[1] - q.wall || y > q.bb[3] + q.wall) return false;
      if (inside(q.poly, x, y)) return true; var p = q.poly, t = q.wall;   /* each side's wall band, out t, on t past each end (the builder's corner blocks, castle-shell.js ext) */
      for (var i = 0, j = p.length - 1; i < p.length; j = i++) { var ax = p[j][0], ay = p[j][1], ex = p[i][0] - ax, ey = p[i][1] - ay, l = Math.hypot(ex, ey); if (l < 1e-9) continue;
        var u = ((x - ax) * ex + (y - ay) * ey) / l, v = ((x - ax) * ey - (y - ay) * ex) / l; if (u >= -t && u <= l + t && v >= 0 && v <= t) return true; }
      return false; }
    function cover(x, y, z0, z1, not) { var C = G[Math.floor(x / GRID) + ',' + Math.floor(y / GRID)] || []; for (var k = 0; k < C.length; k++) { var q = C[k];
      if (q !== not && overlaps(z0, z1, q.floor, q.ceiling) && near(q, x, y)) return q; } return null; }
    var SOL = (opts && opts.solids) || [];   /* the model's masses and towers: [{ poly, z0, z1 }], inside the building with no room */
    function solid(x, y, z0, z1) { for (var k = 0; k < SOL.length; k++) { var o = SOL[k]; if (overlaps(z0, z1, o.z0, o.z1) && inside(o.poly, x, y)) return true; } return false; }
    function at(x, y, z0, z1, not) { var C = G[Math.floor(x / GRID) + ',' + Math.floor(y / GRID)] || []; for (var k = 0; k < C.length; k++) { var q = C[k]; if (q === not || !overlaps(z0, z1, q.floor, q.ceiling)) continue;
      if (x < q.bb[0] || x > q.bb[2] || y < q.bb[1] || y > q.bb[3]) continue; if (inside(q.poly, x, y)) return q; } return null; }
    function atAll(x, y, z0, z1, not) { var C = G[Math.floor(x / GRID) + ',' + Math.floor(y / GRID)] || [], R = []; for (var k = 0; k < C.length; k++) { var q = C[k]; if (q === not || !overlaps(z0, z1, q.floor, q.ceiling)) continue;
      if (x < q.bb[0] || x > q.bb[2] || y < q.bb[1] || y > q.bb[3]) continue; if (inside(q.poly, x, y)) R.push(q); } return R; }
    var pieces = [], roofs = [], soffits = [], T = { air: 0, shared: 0, sharedOwned: 0, roof: 0, soffit: 0, roofDeep: 0, soffitDeep: 0, roofSolid: 0, soffitSolid: 0 };
    var ONLY = opts && opts.only ? new Set(opts.only) : null;   /* step 3: pieces, roofs and soffits for these ids only; every place still probes */
    P.forEach(function (q) {
      if (ONLY && !ONLY.has(q.id)) return;
      var n = q.poly.length;
      for (var i = 0; i < n; i++) {
        var a = q.poly[i], b = q.poly[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L < 1e-6) continue;
        var nx = dy / L, ny = -dx / L, m = Math.max(1, Math.ceil(L / STEP - 1e-9));
        for (var j = 0; j < m; j++) {
          var t0 = j / m, t1 = (j + 1) / m, mx = a[0] + dx * (t0 + t1) / 2, my = a[1] + dy * (t0 + t1) / 2, near1 = {}, H = q.ceiling - q.floor;
          /* split by height (req 3344 step 3, 9 November 2026, 9.30 pm): every place out to the wall + 0.5 over this place's
             heights, each at its nearest distance; the place's height cut at their floors and ceilings, each band given the
             nearest place standing over it, a short band (under LIFT) between two such bands given the lower one (the floor
             between two storeys is wall, not air), else open air */
          for (var d = 0.05; d <= q.wall + 0.5 + 1e-9; d += 0.05) atAll(mx + nx * d, my + ny * d, q.floor, q.ceiling, q).forEach(function (o) { if (!near1[o.id]) near1[o.id] = { q: o, d: d }; });
          var O = Object.keys(near1).map(function (k) { return near1[k]; }), cut = [q.floor, q.ceiling];
          O.forEach(function (o) { [o.q.floor, o.q.ceiling].forEach(function (z) { if (z > q.floor + 0.01 && z < q.ceiling - 0.01) cut.push(z); }); });
          cut.sort(function (u, v) { return u - v; });
          var bands = [];
          for (var k = 0; k + 1 < cut.length; k++) { var z0 = cut[k], z1 = cut[k + 1]; if (z1 - z0 < 0.005) continue; var best = null;
            O.forEach(function (o) { if (overlaps(z0, z1, o.q.floor, o.q.ceiling) && (!best || o.d < best.d)) best = o; }); bands.push({ z0: z0, z1: z1, o: best }); }
          bands.forEach(function (b, k) { if (b.o || b.z1 - b.z0 >= LIFT) return; var lo = bands[k - 1], hi = bands[k + 1]; if (lo && lo.o && hi && hi.o) b.o = lo.o; });
          var merged = []; bands.forEach(function (b) { var l = merged[merged.length - 1]; if (l && l.o === b.o) l.z1 = b.z1; else merged.push({ z0: b.z0, z1: b.z1, o: b.o }); });
          merged.forEach(function (b) { var other = b.o ? b.o.q : null, len = L / m, fr = H > 0 ? (b.z1 - b.z0) / H : 1;
            var pc = { place: q.id, a: [a[0] + dx * t0, a[1] + dy * t0], b: [a[0] + dx * t1, a[1] + dy * t1], n: [nx, ny], z0: b.z0, z1: b.z1, len: len, frac: fr, edge: i, col: j,
              kind: other ? 'shared' : 'air', other: other ? other.id : null, gap: b.o ? b.o.d : null, owner: other ? (q.id < other.id ? q.id : other.id) : q.id };
            pieces.push(pc); if (other) { T.shared += len * fr; if (pc.owner === q.id) T.sharedOwned += len * fr; } else T.air += len * fr; });
        }
      }
      /* roof and soffit, by cell: covered (a place within LIFT, plan and wall), deep (a place further off, the void between
         is the model's to explain), solid (inside a mass or tower with no room), else open air: only open air is roof or soffit */
      var r = { air: 0, deep: 0, solid: 0 }, f = { air: 0, deep: 0, solid: 0 }, bb = q.bb, c2 = CELL * CELL, ground = q.floor <= 0.01;
      /* nothing within reach of the plan (no other place's plan and wall over its box, no solid): its area exactly, not sampled */
      var lone = !SOL.length && !P.some(function (o) { return o !== q && o.bb[0] - o.wall < bb[2] && o.bb[2] + o.wall > bb[0] && o.bb[1] - o.wall < bb[3] && o.bb[3] + o.wall > bb[1]; });
      if (lone) { r.air = Math.abs(area(q.poly)); if (!ground) f.air = r.air; }
      else for (var x = bb[0] + CELL / 2; x < bb[2]; x += CELL) for (var y = bb[1] + CELL / 2; y < bb[3]; y += CELL) {
        if (!inside(q.poly, x, y)) continue;
        if (!cover(x, y, q.ceiling + 0.01, q.ceiling + LIFT, q)) r[cover(x, y, q.ceiling + LIFT, 1e9, q) ? 'deep' : solid(x, y, q.ceiling + 0.01, q.ceiling + LIFT) ? 'solid' : 'air'] += c2;
        if (!ground && !cover(x, y, q.floor - LIFT, q.floor - 0.01, q)) f[cover(x, y, -1e9, q.floor - LIFT, q) ? 'deep' : solid(x, y, q.floor - LIFT, q.floor - 0.01) ? 'solid' : 'air'] += c2;
      }
      roofs.push({ place: q.id, z: q.ceiling, area: r.air, deep: r.deep, solid: r.solid }); soffits.push({ place: q.id, z: q.floor, area: f.air, deep: f.deep, solid: f.solid });
      T.roof += r.air; T.soffit += f.air; T.roofDeep += r.deep; T.soffitDeep += f.deep; T.roofSolid += r.solid; T.soffitSolid += f.solid;
    });
    return { pieces: pieces, roofs: roofs, soffits: soffits, totals: T };
  }
  W.CastleEnvelope = { declare: declare, STEP: STEP, CELL: CELL, LIFT: LIFT0 };
})(typeof window !== 'undefined' ? window : this);
