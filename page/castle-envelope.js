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
  var STEP = 0.25, CELL = 0.125, LIFT = 1.5;
  function area(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  function inside(p, x, y) { var c = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { var a = p[i], b = p[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function box(p) { var b = [1e9, 1e9, -1e9, -1e9]; p.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); return b; }
  function overlaps(a0, a1, b0, b1) { return Math.min(a1, b1) - Math.max(a0, b0) > 0.01; }
  function declare(places) {
    var P = places.map(function (q) { var poly = area(q.poly) < 0 ? q.poly.slice().reverse() : q.poly; return { id: q.id, poly: poly, floor: q.floor, ceiling: q.ceiling, wall: q.wall || 0.8, bb: box(poly) }; });
    function at(x, y, z0, z1, not) { for (var k = 0; k < P.length; k++) { var q = P[k]; if (q === not || !overlaps(z0, z1, q.floor, q.ceiling)) continue;
      if (x < q.bb[0] || x > q.bb[2] || y < q.bb[1] || y > q.bb[3]) continue; if (inside(q.poly, x, y)) return q; } return null; }
    var pieces = [], roofs = [], soffits = [], T = { air: 0, shared: 0, sharedOwned: 0, roof: 0, soffit: 0 };
    P.forEach(function (q) {
      var n = q.poly.length;
      for (var i = 0; i < n; i++) {
        var a = q.poly[i], b = q.poly[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L < 1e-6) continue;
        var nx = dy / L, ny = -dx / L, m = Math.max(1, Math.ceil(L / STEP - 1e-9));
        for (var j = 0; j < m; j++) {
          var t0 = j / m, t1 = (j + 1) / m, mx = a[0] + dx * (t0 + t1) / 2, my = a[1] + dy * (t0 + t1) / 2, other = null;
          for (var d = 0.05; d <= q.wall + 0.5 + 1e-9 && !other; d += 0.05) other = at(mx + nx * d, my + ny * d, q.floor, q.ceiling, q);
          var pc = { place: q.id, a: [a[0] + dx * t0, a[1] + dy * t0], b: [a[0] + dx * t1, a[1] + dy * t1], n: [nx, ny], z0: q.floor, z1: q.ceiling, len: L / m,
            kind: other ? 'shared' : 'air', other: other ? other.id : null, owner: other ? (q.id < other.id ? q.id : other.id) : q.id };
          pieces.push(pc); if (other) { T.shared += pc.len; if (pc.owner === q.id) T.sharedOwned += pc.len; } else T.air += pc.len;
        }
      }
      /* roof and soffit: the plan's area less the sampled part a place above or below covers */
      var full = Math.abs(area(q.poly)), up = 0, dn = 0, bb = q.bb, c2 = CELL * CELL;
      for (var x = bb[0] + CELL / 2; x < bb[2]; x += CELL) for (var y = bb[1] + CELL / 2; y < bb[3]; y += CELL) {
        if (!inside(q.poly, x, y)) continue;
        if (at(x, y, q.ceiling + 0.01, q.ceiling + LIFT, q)) up += c2;
        if (at(x, y, q.floor - LIFT, q.floor - 0.01, q)) dn += c2;
      }
      var roof = Math.max(0, full - up), sof = q.floor > 0.01 || dn > 0 || q.soffit ? Math.max(0, full - dn) : 0;
      if (q.floor <= 0.01) sof = 0;   /* a place on the ground has no soffit */
      roofs.push({ place: q.id, z: q.ceiling, area: roof }); soffits.push({ place: q.id, z: q.floor, area: sof }); T.roof += roof; T.soffit += sof;
    });
    return { pieces: pieces, roofs: roofs, soffits: soffits, totals: T };
  }
  W.CastleEnvelope = { declare: declare, STEP: STEP, CELL: CELL, LIFT: LIFT };
})(typeof window !== 'undefined' ? window : this);
