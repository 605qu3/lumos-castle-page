/* The wall graph (req 3166, the wall rebuild, slice 1; the Architect, 7 November 2026; the plan:
   docs/architect/wall-rebuild-1107.md section 3). Pure data, no geometry: the v2 wall builder reads it, v1 never does.

   Per level, before any room is built, every face of every place is paired with every other place's face that looks
   back at it (parallel, outward normals opposite, within 1.2 m, overlapping along the line by more than 0.1 m and in
   height by more than 0.1 m). Where a face sees more than one, the nearest wins along that stretch. A stretch where the
   two faces are each other's nearest is one SEGMENT with one owner and one thickness, by the gap g between the faces:
     wall   0.3 < g <= 1.2   one solid filling the gap
     thin   0.02 < g <= 0.3  the same (a partition the model drew)
     flush  g <= 0.02        no wall drawn: open where an opening between the two spans the line (opts.openWhole),
                             else a 0.3 m partition centred on the line, listed as a plan row (move a face 0.3 m)
   Every other stretch of a face is EXTERIOR: its own T outward, capped at half the gap to anything it sees beyond.
   Owner: the stand place when it is one of the two (so shell.html's PLACE + '-wall-' hooks still find it), else the
   lower id.

     CastleWalls.graph(places, opts) -> { segments: [...], plan: [...], pairs: [...] }
       places: [{ id, loops: [[[x, y], ...], ...] (counter-clockwise outer ring first, as castle-shell.js edgesOf),
                  T: wall thickness or [per loop], z0, z1 (floor and ceiling, optional: no height test without them) }]
       opts:   { stand: place id, openWhole: function (idA, idB, s0, s1, seg) -> bool, maxGap: 1.2 }
     a segment: { kind: wall|thin|flush|open|exterior, owner, rooms: [a, b] (one for exterior), a: [x, y], b: [x, y]
                  (the line on the owner's side face, counter-clockwise for the owner), n: owner's outward normal,
                  edge: { [room]: [loop, index, s0, s1] }, t: thickness, off: [inner, outer] offsets from the owner's
                  face (the solid runs from off[0] to off[1] along n), gap, z: [z0, z1] shared height,
                  zr: { [room]: [z0, z1] } each room's own }
   Node: require('./castle-walls-v2.js'). Nothing spends. */
(function (root) {
  var FLUSH = 0.02, THIN = 0.3, PART = 0.3, MINOV = 0.1, PAR = -0.995;

  function faces(places) {
    var F = [];
    places.forEach(function (P) {
      (P.loops || []).forEach(function (pts, j) {
        var area = 0;
        for (var k = 0; k < pts.length; k++) { var p = pts[k], q = pts[(k + 1) % pts.length]; area += p[0] * q[1] - q[0] * p[1]; }
        /* the outer ring counter-clockwise, an inner ring (a courtyard's) clockwise, so the outward normal (uy, -ux)
           always points out of the room's floor */
        var ccw = area > 0, want = j === 0, ring = ccw === want ? pts : pts.slice().reverse();
        ring.forEach(function (a, i) {
          var b = ring[(i + 1) % ring.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
          if (L <= 0.05) return;
          var u = [dx / L, dy / L], T = Array.isArray(P.T) ? P.T[j] : P.T;
          /* the loop index as the shell numbers it: a reversed ring maps back */
          var idx = ring === pts ? i : (pts.length - 2 - i + pts.length) % pts.length;
          F.push({ room: P.id, loop: j, i: idx, a: a, b: b, u: u, n: [u[1], -u[0]], L: L, T: T || 0.8, z0: P.z0, z1: P.z1 });
        });
      });
    });
    return F;
  }

  function along(f, p) { return (p[0] - f.a[0]) * f.u[0] + (p[1] - f.a[1]) * f.u[1]; }
  function across(f, p) { return (p[0] - f.a[0]) * f.n[0] + (p[1] - f.a[1]) * f.n[1]; }
  function at(f, s) { return [f.a[0] + f.u[0] * s, f.a[1] + f.u[1] * s]; }
  function zov(A, B) {
    if (A.z0 == null || B.z0 == null) return [A.z0, A.z1];
    return [Math.max(A.z0, B.z0), Math.min(A.z1, B.z1)];
  }

  /* every pair of faces that look back at each other: the same test as tools/architect-wall-lines.py, plus height */
  function pairsOf(F, maxGap) {
    var out = [];
    for (var i = 0; i < F.length; i++) for (var j = i + 1; j < F.length; j++) {
      var A = F[i], B = F[j];
      if (A.room === B.room || A.n[0] * B.n[0] + A.n[1] * B.n[1] > PAR) continue;
      var d = across(A, B.a);
      if (d < -FLUSH || d > maxGap) continue;
      var z = zov(A, B);
      if (z[0] != null && z[1] - z[0] <= MINOV) continue;
      var s0 = along(A, B.a), s1 = along(A, B.b), lo = Math.max(0, Math.min(s0, s1)), hi = Math.min(A.L, Math.max(s0, s1));
      if (hi - lo > MINOV) out.push({ A: i, B: j, gap: Math.max(0, d), s: [lo, hi], z: z });
    }
    return out;
  }

  /* along one face, its pairs' stretches, each split where a nearer pair takes over: [{ s0, s1, pair }] */
  function nearest(fi, F, P) {
    var mine = P.filter(function (p) { return p.A === fi || p.B === fi; }).map(function (p) {
      if (p.A === fi) return { s0: p.s[0], s1: p.s[1], p: p };
      var f = F[fi], a = along(f, at(F[p.A], p.s[0])), b = along(f, at(F[p.A], p.s[1]));
      return { s0: Math.max(0, Math.min(a, b)), s1: Math.min(f.L, Math.max(a, b)), p: p };
    });
    var cuts = [0, F[fi].L];
    mine.forEach(function (m) { cuts.push(m.s0, m.s1); });
    cuts = cuts.sort(function (x, y) { return x - y; }).filter(function (c, k, a) { return k === 0 || c - a[k - 1] > 1e-4; });
    var run = [];
    for (var k = 0; k + 1 < cuts.length; k++) {
      var c0 = cuts[k], c1 = cuts[k + 1], mid = (c0 + c1) / 2, best = null;
      mine.forEach(function (m) { if (m.s0 <= mid && mid <= m.s1 && (!best || m.p.gap < best.gap)) best = m.p; });
      var last = run[run.length - 1];
      if (last && last.pair === best) last.s1 = c1; else run.push({ s0: c0, s1: c1, pair: best });
    }
    return run;
  }

  function kindOf(g) { g = Math.round(g * 1000) / 1000; return g <= FLUSH ? 'flush' : g <= THIN ? 'thin' : 'wall'; }

  function graph(places, opts) {
    opts = opts || {};
    var F = faces(places), P = pairsOf(F, opts.maxGap || 1.2), runs = F.map(function (f, i) { return nearest(i, F, P); });
    var segs = [], plan = [], done = {};
    F.forEach(function (f, fi) {
      runs[fi].forEach(function (r) {
        if (r.s1 - r.s0 <= 1e-3) return;
        var p = r.pair, z = p ? p.z : [f.z0, f.z1];
        if (p) {
          /* mutual only: the stretch of the other face that is nearest to this one too */
          var oi = p.A === fi ? p.B : p.A, o = F[oi], s0 = r.s0, s1 = r.s1;
          var mutual = runs[oi].filter(function (q) { return q.pair === p; }).map(function (q) {
            var a = along(f, at(o, q.s0)), b = along(f, at(o, q.s1)); return [Math.min(a, b), Math.max(a, b)];
          });
          var parts = [];
          mutual.forEach(function (m) { var lo = Math.max(s0, m[0]), hi = Math.min(s1, m[1]); if (hi - lo > 1e-3) parts.push([lo, hi]); });
          /* what is not mutual stays this face's own, an exterior capped at half the gap */
          var rest = [[s0, s1]];
          parts.forEach(function (m) {
            rest = rest.reduce(function (acc, q) {
              if (m[1] <= q[0] || m[0] >= q[1]) acc.push(q);
              else { if (m[0] - q[0] > 1e-3) acc.push([q[0], m[0]]); if (q[1] - m[1] > 1e-3) acc.push([m[1], q[1]]); }
              return acc;
            }, []);
          });
          rest.forEach(function (q) { segs.push(exterior(f, q[0], q[1], p.gap / 2)); });
          parts.forEach(function (m) {
            var key = Math.min(fi, oi) + ':' + Math.max(fi, oi) + ':' + m[0].toFixed(3);
            var ra = f.room, rb = o.room, owner = opts.stand === ra || opts.stand === rb ? opts.stand : (ra < rb ? ra : rb);
            if (owner !== f.room) return;   /* drawn once, from the owner's face */
            if (done[key]) return; done[key] = 1;
            var g = p.gap, k = kindOf(g), oa = along(o, at(f, m[0])), ob = along(o, at(f, m[1]));
            var seg = { kind: k, owner: owner, rooms: [ra, rb], a: at(f, m[0]), b: at(f, m[1]), n: f.n, gap: g, z: z,
              zr: {}, edge: {} };
            seg.zr[ra] = [f.z0, f.z1]; seg.zr[rb] = [o.z0, o.z1];
            seg.edge[ra] = [f.loop, f.i, m[0], m[1]]; seg.edge[rb] = [o.loop, o.i, Math.min(oa, ob), Math.max(oa, ob)];
            if (k === 'flush') {
              if (opts.openWhole && opts.openWhole(ra, rb, m[0], m[1], seg)) { seg.kind = 'open'; seg.t = 0; seg.off = [0, 0]; }
              else { seg.t = PART; seg.off = [g / 2 - PART / 2, g / 2 + PART / 2];
                plan.push({ rooms: [ra, rb], at: seg.a, to: seg.b, gap: g, note: 'flush: no wall drawn; v2 builds a 0.3 m partition centred on the line; move one face 0.3 m' }); }
            } else { seg.t = g; seg.off = [0, g]; }
            segs.push(seg);
          });
        } else segs.push(exterior(f, r.s0, r.s1, null));
      });
    });
    /* an exterior band stops short of any other room it would run into at its height: rooms cut into a thick wall
       (the West Tower's newel stair and its passage inside the falconers' room's 3.2 m drum) are voids in it, and
       their own faces build their own walls there (req 3166, west-tower-arch-5) */
    segs.forEach(function (sg) {
      if (sg.kind !== 'exterior') return;
      var dx = sg.b[0] - sg.a[0], dy = sg.b[1] - sg.a[1], L = Math.hypot(dx, dy); if (L < 1e-6) return;
      var ux = dx / L, uy = dy / L, best = sg.t, nS = Math.max(2, Math.ceil(L / 0.25) + 1);
      for (var k = 0; k < nS; k++) {
        var s = Math.min(L - 0.02, Math.max(0.02, L * k / (nS - 1))), px = sg.a[0] + ux * s, py = sg.a[1] + uy * s;
        F.forEach(function (g) {
          if (g.room === sg.owner || g.z1 <= sg.z[0] + 0.05 || g.z0 >= sg.z[1] - 0.05) return;
          var ex = g.b[0] - g.a[0], ey = g.b[1] - g.a[1], den = sg.n[0] * ey - sg.n[1] * ex; if (Math.abs(den) < 1e-9) return;
          var t = ((g.a[0] - px) * ey - (g.a[1] - py) * ex) / den, v = ((g.a[0] - px) * sg.n[1] - (g.a[1] - py) * sg.n[0]) / den;
          if (t > 1e-4 && v >= -1e-6 && v <= 1 + 1e-6 && t - 0.02 < best) best = Math.max(0.05, t - 0.02);
        });
      }
      /* and a corner of another room standing inside the band between two samples */
      F.forEach(function (g) {
        if (g.room === sg.owner || g.z1 <= sg.z[0] + 0.05 || g.z0 >= sg.z[1] - 0.05) return;
        var qx = g.a[0] - sg.a[0], qy = g.a[1] - sg.a[1], s = qx * ux + qy * uy, d = qx * sg.n[0] + qy * sg.n[1];
        if (s > 0 && s < L && d > 1e-4 && d - 0.02 < best) best = Math.max(0.05, d - 0.02);
      });
      if (best < sg.t - 1e-3) { sg.t = best; sg.off = [0, best]; sg.clipped = true; }
    });
    return { segments: segs, plan: plan, pairs: P.map(function (p) { return { rooms: [F[p.A].room, F[p.B].room], gap: p.gap, over: p.s[1] - p.s[0], kind: kindOf(p.gap) }; }) };
  }

  function exterior(f, s0, s1, cap) {
    var t = cap != null ? Math.min(f.T, cap) : f.T, seg = { kind: 'exterior', owner: f.room, rooms: [f.room], a: at(f, s0), b: at(f, s1), n: f.n,
      t: t, off: [0, t], gap: null, z: [f.z0, f.z1], zr: {}, edge: {} };
    seg.zr[f.room] = [f.z0, f.z1]; seg.edge[f.room] = [f.loop, f.i, s0, s1];
    return seg;
  }

  var api = { graph: graph, faces: faces, kinds: { FLUSH: FLUSH, THIN: THIN, PART: PART } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CastleWalls = api;
})(typeof window !== 'undefined' ? window : this);
