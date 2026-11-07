/* The straight-strip builder (req 3166, the wall rebuild, slice 1; the Architect, 7 November 2026; the plan:
   docs/architect/wall-rebuild-1107.md section 4). One wall segment of the wall graph (castle-walls-v2.js) becomes one
   solid: a strip along the line, its holes cut true through both faces with a reveal round each, so no opening has a
   separate head, fill or jamb, and its depth is the wall's own. Geometry only; castle-shell.js places it (?walls=v2).

     CastleStrip.build(THREE, spec) -> { geos: [BufferGeometry], merged: n }
       spec: { len, hi (height over the strip's foot), depth, e0, e1 (extensions past each end, a corner block),
               holes: [{ s0, s1, z0, z1, head: 'round'|'pointed'|'tudor'|null, up (the head's rise) }] }
     Frame: x along the line from its start, y up from the foot, z across the wall from 0 to depth.
   The strip is cut into columns at every hole's jambs and along each head's curve, the solid in each column being what
   the holes over it leave, so a hole may run to the strip's end or top; holes that overlap are one (their union box,
   the taller head), counted in merged so the checker can list them.
   Slice 2 brings the arcs (a round room's wall on its two true radii). */
(function (root) {
  var EPS = 0.02, SEG = 10;

  function outline(h, lo) {
    /* the hole's edge from its left foot round the head to its right foot, as [x, y] points */
    var p = [], up = h.head ? Math.min(h.up || (h.s1 - h.s0) / 2, h.z1 - h.z0 - 0.01) : 0, sp = h.z1 - up, w = h.s1 - h.s0, m = (h.s0 + h.s1) / 2;
    p.push([h.s0, lo], [h.s0, sp]);
    if (h.head && up > 0.01) {
      for (var k = 1; k < SEG; k++) {
        var f = k / SEG, x = h.s0 + w * f, y;
        if (h.head === 'pointed') {   /* two arcs of radius w, centred on the far jambs, meeting at the apex */
          var R = w, cx = f <= 0.5 ? h.s1 : h.s0, dx = x - cx, top = Math.sqrt(Math.max(0, R * R - dx * dx));
          y = sp + top * (up / (Math.sqrt(3) * w / 2));
        } else { var dx2 = (x - m) / (w / 2); y = sp + up * Math.sqrt(Math.max(0, 1 - dx2 * dx2)); }   /* round, and tudor as its flatter ellipse */
        p.push([x, y]);
      }
    }
    p.push([h.s1, sp], [h.s1, lo]);
    return p;
  }

  function unite(holes) {
    var hs = holes.map(function (h) { return Object.assign({}, h); }).sort(function (a, b) { return a.s0 - b.s0; }), out = [], merged = 0;
    hs.forEach(function (h) {
      var o = out.filter(function (q) { return q.s0 < h.s1 - 1e-3 && h.s0 < q.s1 - 1e-3 && q.z0 < h.z1 - 1e-3 && h.z0 < q.z1 - 1e-3; })[0];
      if (!o) { out.push(h); return; }
      var same = Math.abs(o.s0 - h.s0) < 0.05 && Math.abs(o.s1 - h.s1) < 0.05;   /* one opening seen from its two rooms */
      /* different openings that overlap stay apart: the columns below already take each one's own top, so a door's
         pointed head is not lost to a window's flat one (oriel dot 3); merged counts such overlaps */
      if (!same) { merged++; out.push(h); return; }
      if (h.z1 > o.z1) { o.head = h.head; o.up = h.up; } else if (!o.head && h.head && Math.abs(h.z1 - o.z1) < 0.05) { o.head = h.head; o.up = h.up; }
      o.s0 = Math.min(o.s0, h.s0); o.s1 = Math.max(o.s1, h.s1); o.z0 = Math.min(o.z0, h.z0); o.z1 = Math.max(o.z1, h.z1);
    });
    return { holes: out, merged: merged };
  }

  function topAt(h, x) {
    /* the hole's top over x: flat to the springing, then the head */
    var up = h.head ? Math.min(h.up || (h.s1 - h.s0) / 2, h.z1 - h.z0 - 0.01) : 0, sp = h.z1 - up, w = h.s1 - h.s0, m = (h.s0 + h.s1) / 2;
    if (!h.head || up <= 0.01) return h.z1;
    if (h.head === 'pointed') { var cx = x <= m ? h.s1 : h.s0, dx = x - cx; return sp + Math.sqrt(Math.max(0, w * w - dx * dx)) * (up / (Math.sqrt(3) * w / 2)); }
    var d = (x - m) / (w / 2); return sp + up * Math.sqrt(Math.max(0, 1 - d * d));
  }

  function build(THREE, spec) {
    /* columns: the strip is cut at every hole's jambs and along each head's curve; in each column the solid is what
       the holes over it leave, so a hole may run to the strip's end (a door on a round room's corner) or to its top */
    var x0 = -(spec.e0 || 0), x1 = spec.len + (spec.e1 || 0), hi = spec.hi, U = unite((spec.holes || []).map(function (h) {
      return { s0: Math.max(x0, h.s0), s1: Math.min(x1, h.s1), z0: Math.max(0, h.z0), z1: Math.min(hi, h.z1), head: h.head || null, up: h.up || 0 };
    }).filter(function (h) { return h.s1 - h.s0 > EPS && h.z1 - h.z0 > EPS; }));
    var xs = [x0, x1];
    U.holes.forEach(function (h) { xs.push(h.s0, h.s1); if (h.head) for (var k = 1; k < SEG; k++) xs.push(h.s0 + (h.s1 - h.s0) * k / SEG); });
    xs = xs.filter(function (x) { return x >= x0 - 1e-6 && x <= x1 + 1e-6; }).sort(function (p, q) { return p - q; }).filter(function (x, k, A) { return k === 0 || x - A[k - 1] > 1e-4; });
    var shapes = [];
    for (var k = 0; k + 1 < xs.length; k++) {
      var xa = xs[k], xb = xs[k + 1], xm = (xa + xb) / 2;
      var over = U.holes.filter(function (h) { return h.s0 <= xm && xm <= h.s1; }).sort(function (p, q) { return p.z0 - q.z0; });
      /* the solid runs as bands [bottom at xa, bottom at xb, top at xa, top at xb] */
      var bands = [], ya = 0, yb = 0;
      over.forEach(function (h) {
        var ta = Math.min(hi, topAt(h, xa)), tb = Math.min(hi, topAt(h, xb));
        if (h.z0 > Math.max(ya, yb) + 0.005) bands.push([ya, yb, h.z0, h.z0]);
        ya = Math.max(ya, ta); yb = Math.max(yb, tb);
      });
      if (hi - Math.min(ya, yb) > 0.005) bands.push([ya, yb, hi, hi]);
      bands.forEach(function (B) {
        if (B[2] - B[0] < 0.003 && B[3] - B[1] < 0.003) return;
        var last = shapes[shapes.length - 1];
        /* a plain column joins the plain one before it */
        if (last && !over.length && last.plain && Math.abs(last.x1 - xa) < 1e-6) { last.x1 = xb; return; }
        shapes.push({ x0: xa, x1: xb, b: B, plain: !over.length });
      });
    }
    var sh = shapes.map(function (c) {
      var B = c.b, pts = [[c.x0, B[0]], [c.x1, c.plain ? B[0] : B[1]], [c.x1, c.plain ? B[2] : B[3]], [c.x0, B[2]]];
      return new THREE.Shape(pts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }));
    });
    return { geos: sh.length ? [new THREE.ExtrudeGeometry(sh, { depth: spec.depth, bevelEnabled: false })] : [], merged: U.merged };
  }

  var api = { build: build, unite: unite, outline: outline, topAt: topAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CastleStrip = api;
})(typeof window !== 'undefined' ? window : this);
