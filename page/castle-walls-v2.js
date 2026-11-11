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
      /* the gap is the nearer of the two faces' distances at the ends of their overlap, not at B's first corner: the faces
         may lean up to 5.7 degrees (PAR), and postern-lobby-g's long slanted face, measured from winter-store's 24-gon side
         at its own far corner (155.3, 67) outside the 1.58 m they share, gave a 0.68 m solid where the gap is 0.50 to 0.62,
         and its corner stood 0.18 m inside the store (req 3166). A leaning pair's solid now falls short of the far face by
         up to its lean (a few cm of recess in that room's wall, solid behind), never into it */
      var gl = across(B, at(A, lo)), gh = across(B, at(A, hi));
      if (hi - lo > MINOV) out.push({ A: i, B: j, gap: Math.max(0, Math.min(gl, gh)), s: [lo, hi], z: z });
    }
    return out;
  }

  /* along one face, its pairs' stretches, each split where a nearer pair takes over: [{ s0, s1, z0, z1, pair }]. Req 3166
     (the cross-floor rows): the nearest is found per height, not once a stretch. A tall room's face (stair-hall, G to 7)
     sees a G room's face and a fifth-floor room's on one plan line; the G pair took the whole stretch and was built from
     the G floor to the hall's top, 29 to 32 m into the rooms above, while theirs fell to an exterior of no depth. Each
     pair now claims only its own height, nearest first, and what no pair claims (the slab between two floors, the hall
     above the last) is the face's own exterior band at that height */
  var INF = 1e9;
  function zn(z) { return [z[0] == null ? -INF : z[0], z[1] == null ? INF : z[1]]; }
  function nearest(fi, F, P) {
    var f = F[fi], mine = P.filter(function (p) { return p.A === fi || p.B === fi; }).map(function (p) {
      if (p.A === fi) return { s0: p.s[0], s1: p.s[1], p: p };
      var a = along(f, at(F[p.A], p.s[0])), b = along(f, at(F[p.A], p.s[1]));
      return { s0: Math.max(0, Math.min(a, b)), s1: Math.min(f.L, Math.max(a, b)), p: p };
    });
    var cuts = [0, f.L];
    mine.forEach(function (m) { cuts.push(m.s0, m.s1); });
    cuts = cuts.sort(function (x, y) { return x - y; }).filter(function (c, k, a) { return k === 0 || c - a[k - 1] > 1e-4; });
    var run = [], open = [], fz = zn([f.z0, f.z1]);
    for (var k = 0; k + 1 < cuts.length; k++) {
      var c0 = cuts[k], c1 = cuts[k + 1], mid = (c0 + c1) / 2, free = [fz.slice()], here = [];
      mine.filter(function (m) { return m.s0 <= mid && mid <= m.s1; }).sort(function (x, y) { return x.p.gap - y.p.gap; }).forEach(function (m) {
        var pz = zn(m.p.z), next = [];
        free.forEach(function (q) {
          var lo = Math.max(q[0], pz[0]), hi = Math.min(q[1], pz[1]);
          if (hi - lo <= 1e-3) { next.push(q); return; }
          here.push({ z0: lo, z1: hi, pair: m.p });
          if (lo - q[0] > 1e-3) next.push([q[0], lo]);
          if (q[1] - hi > 1e-3) next.push([hi, q[1]]);
        });
        free = next;
      });
      free.forEach(function (q) { here.push({ z0: q[0], z1: q[1], pair: null }); });
      var still = [];
      here.forEach(function (h) {
        var o = open.filter(function (r) { return r.pair === h.pair && Math.abs(r.z0 - h.z0) < 1e-4 && Math.abs(r.z1 - h.z1) < 1e-4; })[0];
        if (o) o.s1 = c1; else { o = { s0: c0, s1: c1, z0: h.z0, z1: h.z1, pair: h.pair }; run.push(o); }
        still.push(o);
      });
      open = still;
    }
    return run;
  }
  /* what is left of a rectangle in (s, z) once others are taken out */
  function minus(rs, m) {
    return rs.reduce(function (acc, q) {
      if (m[1] <= q[0] + 1e-3 || m[0] >= q[1] - 1e-3 || m[3] <= q[2] + 1e-3 || m[2] >= q[3] - 1e-3) { acc.push(q); return acc; }
      if (m[0] - q[0] > 1e-3) acc.push([q[0], m[0], q[2], q[3]]);
      if (q[1] - m[1] > 1e-3) acc.push([m[1], q[1], q[2], q[3]]);
      var a = Math.max(q[0], m[0]), b = Math.min(q[1], m[1]);
      if (m[2] - q[2] > 1e-3) acc.push([a, b, q[2], m[2]]);
      if (q[3] - m[3] > 1e-3) acc.push([a, b, m[3], q[3]]);
      return acc;
    }, []);
  }

  function kindOf(g) { g = Math.round(g * 1000) / 1000; return g <= FLUSH ? 'flush' : g <= THIN ? 'thin' : 'wall'; }

  function graph(places, opts) {
    opts = opts || {};
    var F = faces(places), P = pairsOf(F, opts.maxGap || 1.2), runs = F.map(function (f, i) { return nearest(i, F, P); });
    var segs = [], plan = [], done = {};
    F.forEach(function (f, fi) {
      var zb = function (z0, z1) { return [z0 <= -INF / 2 ? f.z0 : z0, z1 >= INF / 2 ? f.z1 : z1]; };
      runs[fi].forEach(function (r) {
        if (r.s1 - r.s0 <= 1e-3) return;
        var p = r.pair;
        if (p) {
          /* mutual only: the stretch of the other face that is nearest to this one too, at the same height */
          var oi = p.A === fi ? p.B : p.A, o = F[oi], s0 = r.s0, s1 = r.s1;
          var parts = [];
          runs[oi].forEach(function (q) {
            if (q.pair !== p) return;
            var a = along(f, at(o, q.s0)), b = along(f, at(o, q.s1));
            var lo = Math.max(s0, Math.min(a, b)), hi = Math.min(s1, Math.max(a, b)), z0 = Math.max(r.z0, q.z0), z1 = Math.min(r.z1, q.z1);
            if (hi - lo > 1e-3 && z1 - z0 > 1e-3) parts.push([lo, hi, z0, z1]);
          });
          /* what is not mutual stays this face's own, an exterior capped at half the gap */
          var rest = [[s0, s1, r.z0, r.z1]];
          parts.forEach(function (m) { rest = minus(rest, m); });
          rest.forEach(function (q) { segs.push(exterior(f, q[0], q[1], p.gap / 2, zb(q[2], q[3]))); });
          parts.forEach(function (m) {
            var key = Math.min(fi, oi) + ':' + Math.max(fi, oi) + ':' + m[0].toFixed(3) + ':' + m[2].toFixed(3);
            var ra = f.room, rb = o.room, owner = opts.stand === ra || opts.stand === rb ? opts.stand : (ra < rb ? ra : rb);
            if (owner !== f.room) return;   /* drawn once, from the owner's face */
            if (done[key]) return; done[key] = 1;
            var g = p.gap, k = kindOf(g), oa = along(o, at(f, m[0])), ob = along(o, at(f, m[1]));
            var seg = { kind: k, owner: owner, rooms: [ra, rb], a: at(f, m[0]), b: at(f, m[1]), n: f.n, gap: g, z: zb(m[2], m[3]),
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
        } else segs.push(exterior(f, r.s0, r.s1, null, zb(r.z0, r.z1)));
      });
    });
    /* req 5268 (Godric's circled strip beside the Great Hall porch, 11 November 2026): a partition centred on a shared line
       stands PART/2 proud of the owner's face, so where it meets the owner's own thicker band (the Entrance Hall's outer
       wall, whose face is the line) its cut end showed as an upright strip. A flush partition whose end touches a
       collinear exterior band of the same owner is seated with the owner's face on the line, as the band's is */
    /* req 5281 (Fawkes for Godric, 9.55 am: seat only the end): seating the whole partition moved every long wall 0.15 m
       toward its neighbour, so what stood in the owner's half (registers-archive's shelving, the Great Hall's west wall)
       stood in front of the face. Seated now only an end that meets the band and reaches an opening within a pier
       (PIER) of it, through to that opening's far jamb, so the 0.15 m step stands in a reveal, never on plain wall
       (the design gate, docs/handoff/architect.md "Design gate, req 5281"). Where the seated ends cover the line it is
       seated whole; a line they cover only in part stays centred and is listed in plan (no split piece is drawn); with no
       cuts known (opts.cutsOn absent) nothing is seated */
    var PIER = 1.2;
    segs.forEach(function (sg) {
      if (sg.kind !== 'flush' || !sg.off || sg.off[0] === 0 || !opts.cutsOn) return;
      var L = Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]); if (L < 1e-6) return;
      var u = [(sg.b[0] - sg.a[0]) / L, (sg.b[1] - sg.a[1]) / L], ends = {};
      segs.forEach(function (ex) {
        if (ex.kind !== 'exterior' || ex.owner !== sg.owner || ex.n[0] * sg.n[0] + ex.n[1] * sg.n[1] < 0.999) return;
        if (ex.z[1] <= sg.z[0] + 0.05 || ex.z[0] >= sg.z[1] - 0.05) return;
        if (Math.abs((ex.a[0] - sg.a[0]) * sg.n[0] + (ex.a[1] - sg.a[1]) * sg.n[1]) > 0.01) return;
        [ex.a, ex.b].forEach(function (e) {
          if (Math.hypot(e[0] - sg.a[0], e[1] - sg.a[1]) < 0.05) ends.a = 1;
          if (Math.hypot(e[0] - sg.b[0], e[1] - sg.b[1]) < 0.05) ends.b = 1;
        });
      });
      if (!ends.a && !ends.b) return;
      var al = function (p) { return (p[0] - sg.a[0]) * u[0] + (p[1] - sg.a[1]) * u[1]; };
      var ac = function (p) { return (p[0] - sg.a[0]) * sg.n[0] + (p[1] - sg.a[1]) * sg.n[1]; };
      var iv = [];
      (opts.cutsOn(sg.rooms[0], sg.rooms[1]) || []).forEach(function (c) {
        if (Math.abs(ac(c[0])) > 0.3 || Math.abs(ac(c[1])) > 0.3) return;
        var s0 = Math.max(0, Math.min(al(c[0]), al(c[1]))), s1 = Math.min(L, Math.max(al(c[0]), al(c[1])));
        if (s1 - s0 > 0.05) iv.push([s0, s1]);
      });
      iv.sort(function (p, q) { return p[0] - q[0]; });
      var mg = [];
      iv.forEach(function (v) { var l = mg[mg.length - 1]; if (l && v[0] <= l[1] + 0.02) l[1] = Math.max(l[1], v[1]); else mg.push(v.slice()); });
      if (!mg.length) return;
      var fromA = ends.a && mg[0][0] <= PIER ? mg[0][1] : -1, fromB = ends.b && L - mg[mg.length - 1][1] <= PIER ? mg[mg.length - 1][0] : L + 1;
      if (fromA < 0 && fromB > L) return;
      /* whole where no plain stretch along it (between openings, or from its last jamb to its far corner, where another
         wall meets it and the step hides in that corner) is longer than a pier */
      var plainMax = Math.max(mg[0][0], L - mg[mg.length - 1][1]);
      for (var k = 1; k < mg.length; k++) plainMax = Math.max(plainMax, mg[k][0] - mg[k - 1][1]);
      var whole = plainMax <= PIER;
      if (whole) { sg.off = [0, PART]; sg.seated = true; }
      else plan.push({ rooms: sg.rooms, at: sg.a, to: sg.b, gap: sg.gap, note: 'seat-partial: an end meets the band at a jamb but plain wall runs on; left centred (req 5281)' });
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
          if (t > 1e-4 && v >= -1e-6 && v <= 1 + 1e-6 && t - 0.02 < best) best = Math.max(Math.min(0.05, t / 2), t - 0.02);
        });
      }
      /* and a corner of another room standing inside the band between two samples */
      F.forEach(function (g) {
        if (g.room === sg.owner || g.z1 <= sg.z[0] + 0.05 || g.z0 >= sg.z[1] - 0.05) return;
        var qx = g.a[0] - sg.a[0], qy = g.a[1] - sg.a[1], s = qx * ux + qy * uy, d = qx * sg.n[0] + qy * sg.n[1];
        if (s > 0 && s < L && d > 1e-4 && d - 0.02 < best) best = Math.max(Math.min(0.05, d / 2), d - 0.02);
      });
      /* req 3166 (the stray holes): a band across the mouth of the gap between two other rooms ran on into the wall those
         two share (first-floor-corridor's south band 0.2 m past the end of pomfrey-bedroom and -office's wall, four more
         like it), and the sweep of a door in that wall cut a door-shaped hole through it from the third room. Where that
         wall's solid stands across the band's whole length (every sample's ray meets it) the band stops at it, and the
         wall's end closes the face; a band it only partly crosses keeps its depth (a long outer face is not thinned), and
         a way between the two still cuts a band that really stands in its passage (the drum's, west-tower-arch-5) */
      segs.forEach(function (o) {
        if (o.kind === 'exterior' || o.kind === 'open' || !o.off || o.off[1] - o.off[0] < 1e-3 || o.rooms.indexOf(sg.owner) >= 0) return;
        if (o.z[1] <= sg.z[0] + 0.05 || o.z[0] >= sg.z[1] - 0.05) return;
        var R = [[o.a[0] + o.n[0] * o.off[0], o.a[1] + o.n[1] * o.off[0]], [o.b[0] + o.n[0] * o.off[0], o.b[1] + o.n[1] * o.off[0]],
          [o.b[0] + o.n[0] * o.off[1], o.b[1] + o.n[1] * o.off[1]], [o.a[0] + o.n[0] * o.off[1], o.a[1] + o.n[1] * o.off[1]]];
        var near = Infinity;
        for (var k = 0; k < nS; k++) {
          var s = Math.min(L - 0.02, Math.max(0.02, L * k / (nS - 1))), px = sg.a[0] + ux * s, py = sg.a[1] + uy * s, hit = Infinity;
          for (var j = 0; j < 4; j++) {
            var A = R[j], B = R[(j + 1) % 4], ex = B[0] - A[0], ey = B[1] - A[1], den = sg.n[0] * ey - sg.n[1] * ex; if (Math.abs(den) < 1e-9) continue;
            var t = ((A[0] - px) * ey - (A[1] - py) * ex) / den, v = ((A[0] - px) * sg.n[1] - (A[1] - py) * sg.n[0]) / den;
            if (t > 1e-3 && v >= -1e-6 && v <= 1 + 1e-6 && t < hit) hit = t;
          }
          if (!(hit < sg.t)) return;                                       /* a sample that misses it: not across the band */
          near = Math.min(near, hit);
        }
        if (near < best) best = near;
      });
      /* a band never thinner than 5 cm ran 2.5 cm into a room that near (shell-hoist-shaft-b into the powder room's circle):
         under 7 cm it stops at half the gap (req 3166, (c) row) */
      if (best < sg.t - 1e-3) { sg.t = best; sg.off = [0, best]; sg.clipped = true; }
    });
    return { segments: segs, plan: plan, pairs: P.map(function (p) { return { rooms: [F[p.A].room, F[p.B].room], gap: p.gap, over: p.s[1] - p.s[0], kind: kindOf(p.gap) }; }) };
  }

  function exterior(f, s0, s1, cap, z) {
    var t = cap != null ? Math.min(f.T, cap) : f.T, seg = { kind: 'exterior', owner: f.room, rooms: [f.room], a: at(f, s0), b: at(f, s1), n: f.n,
      t: t, off: [0, t], gap: null, z: z || [f.z0, f.z1], zr: {}, edge: {} };
    seg.zr[f.room] = [f.z0, f.z1]; seg.edge[f.room] = [f.loop, f.i, s0, s1];
    return seg;
  }

  var api = { graph: graph, faces: faces, kinds: { FLUSH: FLUSH, THIN: THIN, PART: PART } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CastleWalls = api;
})(typeof window !== 'undefined' ? window : this);
