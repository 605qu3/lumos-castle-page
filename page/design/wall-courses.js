/* wall-courses.js (Masonry, 17 November 2026, row 5870; a prototype behind a flag, nothing drawn without ?courses=).
   The mason's three horizontal courses where a wall meets its floor and its vault: the base course (a chamfered plinth,
   or a stone bench table), the string course at a band line (the Great Hall's 6.0, where the founders' rubble meets the
   later ashlar), and the cornice or a corbel table at the springing. One profile per course, swept by code along each
   room-side wall line of the place (its plan polygon), mitred at every corner, stopped short of every opening and every
   vault carrier, so no course is placed by hand and none is laid twice.

   No face of a course lies in a plane the shell already draws: a profile runs from 2 cm inside the wall, out into the
   room and back into the wall; its back is never drawn, a base course's foot is buried 3 cm under the floor, and every
   stop is 15 cm clear of an opening's jamb and 35 cm clear of a carrier, so the shell's own faces never meet a course's
   face on one plane.

   A profile is a list of [d, h]: d metres out from the wall's face into the room, h metres over the course's datum.

   Flags (shell.html): courses=<kind,kind,...> from plinth, bench, string, cornice, corbels; the knowns of gate 5 (bad):
   flush (a band whose face lies in the wall's plane), floor (a plinth whose underside lies on the floor), nocut (no stop
   at openings), nomitre (each run stops short of its corner). Page comments name the owner Godric. */
(function () {
  /* 18 November 2026, Godric's yes on card 5897 (option 1): the Great Hall wears the bench, the 6 m moulding and the
     corbel row with no setting. shell.html reads ?courses= when it loads, after this file, so the default is written into
     the address here (courses=none opts out, an explicit courses= is kept). */
  try {
    var sp = new URLSearchParams(location.search), pl = sp.get('place');
    if (pl === 'great-hall' && !sp.has('courses') && !/[?&]arch=whole/.test(location.search)) {
      sp.set('courses', 'bench,string,corbels');
      history.replaceState(null, '', location.pathname + '?' + sp.toString() + location.hash);
    }
  } catch (e) {}
  var PROFILES = {
    plinth: { at: 'floor', pts: [[0.10, -0.03], [0.10, 0.34], [-0.02, 0.48]] },
    bench: { at: 'floor', pts: [[0.40, -0.03], [0.40, 0.36], [0.44, 0.40], [0.44, 0.43], [0.42, 0.45], [-0.02, 0.45]] },
    string: { at: 'band', pts: [[-0.02, -0.17], [0.07, -0.10], [0.12, -0.04], [0.13, 0.02], [0.11, 0.07], [0.06, 0.09], [-0.02, 0.10]] },
    cornice: { at: 'springs', pts: [[-0.02, -0.34], [0.04, -0.25], [0.09, -0.13], [0.16, -0.06], [0.21, -0.03], [0.22, 0.02], [0.22, 0.06], [-0.02, 0.06]] },
    corbels: { at: 'springs', pts: [[-0.02, -0.12], [0.20, -0.12], [0.24, -0.08], [0.24, 0.04], [-0.02, 0.06]], corbels: { every: 0.9, w: 0.2, d: 0.2, h: 0.32 } },
    flush: { at: 'band', pts: [[0, -0.15], [0, 0.15]] },
    floor: { at: 'floor', pts: [[-0.02, 0], [0.10, 0], [0.10, 0.34], [-0.02, 0.48]] }
  };
  var JAMB = 0.15, CARRY = 0.20;   /* a carrier's corbel is 0.44 wide and 0.31 deep (measured, 17 November): a course ends 2 cm inside it, so it dies into the stone */

  function datum(Q, row, at) {
    if (at === 'floor') return Q.floor;
    if (at === 'band') return row && row.band ? Q.floor + row.band.top : null;
    var V = Q.rec && Q.rec.vault;
    if (V && V.springs != null) return Q.floor + V.springs;
    return Q.ceiling != null ? Q.ceiling - 0.07 : null;
  }

  /* what stands in edge i's wall: every opening's cut, and every feature set on that wall line (a fireplace, its
     surround w wide and h high over the floor), as { s0, s1, z0, z1 } along the edge from a */
  function inWall(M, Q, i, a, b) {
    var L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, out = [];
    (window.CastleShell.openingCuts(M, Q.id) || []).forEach(function (c) { if (c.edge === i) out.push({ s0: c.s0, s1: c.s1, z0: c.z0, z1: c.z1 }); });
    (M.features || []).forEach(function (f) {   /* a platform against the wall (the dais): its run along the wall, its steps' going past its edge */
      if (f.room !== Q.id || !f.rect || !f.h) return;
      var r = f.rect.slice(), st = f.steps, go = st ? (st.risers || 0) * (st.going || 0.3) : 0;
      if (st && st.edge === 'east') r[2] += go; if (st && st.edge === 'west') r[0] -= go; if (st && st.edge === 'north') r[3] += go; if (st && st.edge === 'south') r[1] -= go;
      var c = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], ss = [], on = 0;
      c.forEach(function (q) { var dx = q[0] - a[0], dy = q[1] - a[1]; ss.push(dx * ux + dy * uy); if (Math.abs(dx * uy - dy * ux) < 0.15) on++; });
      var lo = Math.max(0, Math.min.apply(null, ss)), hi = Math.min(L, Math.max.apply(null, ss));
      var touch = c.some(function (q) { var dx = q[0] - a[0], dy = q[1] - a[1]; return Math.abs(dx * uy - dy * ux) < 0.15; });
      if (touch && hi > lo + 0.05) out.push({ s0: lo, s1: hi, z0: Q.floor, z1: Q.floor + f.h });
    });
    (M.features || []).forEach(function (f) {
      if (f.room !== Q.id || !f.at || !f.w) return;
      var dx = f.at[0] - a[0], dy = f.at[1] - a[1], s = dx * ux + dy * uy, off = Math.abs(dx * uy - dy * ux);
      if (off > 0.15 || s < 0 || s > L) return;   /* (a feature with a rect, such as the dais, is taken below) */
      out.push({ s0: s - f.w / 2, s1: s + f.w / 2, z0: Q.floor + (f.z || 0), z1: Q.floor + (f.z || 0) + (f.h || 3) });
    });
    return out;
  }

  /* the s ranges along edge i kept clear at heights z0..z1: openings and features (unless nocut) and the vault's carriers */
  function stops(M, Q, i, a, b, z0, z1, flags) {
    var out = [], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (!flags.nocut) inWall(M, Q, i, a, b).forEach(function (c) {
      if (c.z1 <= z0 - 0.02 || c.z0 >= z1 + 0.02) return;
      out.push([c.s0 - JAMB, c.s1 + JAMB]);
    });
    var V = Q.rec && Q.rec.vault;
    if (V && V.springs != null && z1 > Q.floor + V.springs - 3.2) {   /* the carriers stand from about 3 m under the springing */
      var ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
      (V.piers || []).forEach(function (px) {
        if (Math.abs(uy) > 0.01) return;   /* piers stand on the long (x-running) walls */
        var s = (px - a[0]) / ux; if (s > 0 && s < L) out.push([s - CARRY, s + CARRY]);
      });
      out.push([-1, CARRY], [L - CARRY, L + 1]);   /* the corner springers */
    }
    return out;
  }

  function runs(L, cuts) {
    var r = [[0, L]];
    cuts.forEach(function (c) {
      var n = [];
      r.forEach(function (x) {
        if (c[1] <= x[0] || c[0] >= x[1]) { n.push(x); return; }
        if (c[0] > x[0] + 0.05) n.push([x[0], c[0]]);
        if (c[1] < x[1] - 0.05) n.push([c[1], x[1]]);
      });
      r = n;
    });
    return r.filter(function (x) { return x[1] - x[0] > 0.3; });
  }

  function build(THREE, M, Q, row, kind, toLocal, mat, flags) {
    var P = PROFILES[kind]; if (!P) return null;
    var z = datum(Q, row, P.at); if (z == null) return null;
    var poly = Q.poly, n = poly.length, area = 0;
    for (var k = 0; k < n; k++) { var p = poly[k], q = poly[(k + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; }
    var sg = area > 0 ? 1 : -1;
    var edges = poly.map(function (a, i) {
      var b = poly[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
      return { a: a, b: b, L: L, u: u, nm: [-u[1] * sg, u[0] * sg] };
    });
    var hs = P.pts.map(function (t) { return t[1]; }), z0 = z + Math.min.apply(null, hs), z1 = z + Math.max.apply(null, hs);
    var dmax = Math.max.apply(null, P.pts.map(function (t) { return t[0]; }));
    var pos = [], uv = [], idx = [], grp = new THREE.Group(); grp.name = Q.id + '-course-' + kind;
    /* the mitre at the corner between edges e and f: the point d out from the face lies d along (n_e + n_f)/(1 + n_e.n_f) */
    function mitre(e, f, d) { var dot = e.nm[0] * f.nm[0] + e.nm[1] * f.nm[1], k = d / (1 + dot); return [(e.nm[0] + f.nm[0]) * k, (e.nm[1] + f.nm[1]) * k]; }
    function vert(x, y, h) { var v = toLocal(x, y, z + h); pos.push(v.x, v.y, v.z); }
    edges.forEach(function (e, i) {
      var prev = edges[(i + n - 1) % n], next = edges[(i + 1) % n];
      runs(e.L, stops(M, Q, i, e.a, e.b, z0, z1, flags)).forEach(function (r) {
        var atS = r[0] < 0.01 && !flags.nomitre, atE = r[1] > e.L - 0.01 && !flags.nomitre;
        var s0 = flags.nomitre && r[0] < 0.01 ? dmax + 0.08 : r[0], s1 = flags.nomitre && r[1] > e.L - 0.01 ? e.L - dmax - 0.08 : r[1];
        var base = pos.length / 3, run = 0;
        LOG.runs++;
        if (flags.nomitre && (r[0] < 0.01 || r[1] > e.L - 0.01)) LOG.gaps++;
        inWall(M, Q, i, e.a, e.b).forEach(function (c) {   /* the instrument: a run over an opening or a fireplace, no margin */
          if (c.z1 > z0 + 0.02 && c.z0 < z1 - 0.02 && c.s0 < s1 - 0.01 && c.s1 > s0 + 0.01) LOG.crossings++;
        });
        P.pts.forEach(function (t, j) {
          var d = t[0], o0 = atS ? mitre(prev, e, d) : [e.nm[0] * d, e.nm[1] * d], o1 = atE ? mitre(e, next, d) : [e.nm[0] * d, e.nm[1] * d];
          vert(e.a[0] + e.u[0] * s0 + o0[0], e.a[1] + e.u[1] * s0 + o0[1], t[1]);
          vert(e.a[0] + e.u[0] * s1 + o1[0], e.a[1] + e.u[1] * s1 + o1[1], t[1]);
          if (j) run += Math.hypot(t[0] - P.pts[j - 1][0], t[1] - P.pts[j - 1][1]);
          uv.push(s0, run, s1, run);
          if (j) { var A = base + 2 * (j - 1), B = A + 1, C = A + 2, D = A + 3; idx.push(A, C, B, B, C, D); }
        });
        /* a stop's end face, the profile closed against the wall's inside (2 cm in), never at a corner */
        [[!atS, s0, -1], [!atE, s1, 1]].forEach(function (c) {
          if (!c[0]) return;
          var shape = P.pts.map(function (t) { return new THREE.Vector2(t[0], t[1]); });
          var f = P.pts[0], l = P.pts[P.pts.length - 1];
          if (l[0] > -0.01) shape.push(new THREE.Vector2(-0.02, l[1]));
          if (f[0] > -0.01) shape.push(new THREE.Vector2(-0.02, f[1]));
          var tri = THREE.ShapeUtils.triangulateShape(shape, []), b0 = pos.length / 3;
          shape.forEach(function (v) { vert(e.a[0] + e.u[0] * c[1] + e.nm[0] * v.x, e.a[1] + e.u[1] * c[1] + e.nm[1] * v.x, v.y); uv.push(v.x, v.y); });
          tri.forEach(function (t) { idx.push(b0 + t[0], b0 + t[1], b0 + t[2]); });
        });
        if (P.corbels) {   /* small corbels under the table, one every P.corbels.every, their tops 6 cm inside the table */
          var C = P.corbels, m = Math.floor((s1 - s0 - C.w) / C.every);
          for (var c2 = 0; c2 <= m; c2++) {
            var sc = s0 + (s1 - s0 - m * C.every) / 2 + c2 * C.every, cb = new THREE.Mesh(corbelGeo(THREE, C), mat);
            var at = toLocal(e.a[0] + e.u[0] * sc, e.a[1] + e.u[1] * sc, z - 0.06), to = toLocal(e.a[0] + e.u[0] * sc + e.nm[0], e.a[1] + e.u[1] * sc + e.nm[1], z - 0.06);
            cb.position.copy(at); cb.rotation.y = Math.atan2(-(to.z - at.z), to.x - at.x);
            cb.name = grp.name + '-corbel-' + i + '-' + c2; cb.userData = { owner: Q.id, course: kind }; grp.add(cb);
          }
        }
      });
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    var mesh = new THREE.Mesh(g, mat); mesh.name = grp.name + '-run'; mesh.userData = { owner: Q.id, course: kind };
    grp.add(mesh);
    return grp;
  }

  /* a corbel: local +x out from the wall, its back 2 cm inside the wall, its top at 0 (inside the table), a quarter-round
     taper from its full depth at the top to a third of it at the foot */
  function corbelGeo(THREE, C) {
    var sh = new THREE.Shape(), steps = 6;
    sh.moveTo(-0.02, 0); sh.lineTo(C.d, 0);
    for (var i = 1; i <= steps; i++) { var a = i / steps * Math.PI / 2; sh.lineTo(C.d / 3 + (C.d * 2 / 3) * Math.cos(a), -C.h * Math.sin(a)); }
    sh.lineTo(-0.02, -C.h);
    var g = new THREE.ExtrudeGeometry(sh, { depth: C.w, bevelEnabled: false });
    g.translate(0, 0, -C.w / 2);
    return g;
  }

  /* apply(opts): opts.M the model, opts.place, opts.toLocal, opts.scene (or group), opts.kinds, opts.flags, opts.mat */
  function apply(o) {
    var THREE = window.THREE, M = o.M, Q = window.CastleShell.findPlace(M, o.place); if (!Q || !Q.poly) return { drawn: 0 };
    var row = (window.CASTLE_PAINT && CASTLE_PAINT.rooms[Q.id]) || null, mat = o.mat;
    /* flag bare (gate 5's instrument): a plain two-sided stone with no depth offset, so the seams check judges the
       geometry alone; the trim's own material ranks over every wall and would hide a face laid in a wall's plane */
    if (o.flags && o.flags.bare) mat = new THREE.MeshStandardMaterial({ color: 0x9a8f7c, roughness: 0.9, side: THREE.DoubleSide });
    /* the vault's shafts' own dressed stone where the room has them (Godric's 1 on the springers, 10.21 pm), so course and
       column read as one mason's work; else the room's trim */
    if (!mat) o.scene.traverse(function (x) { if (!mat && x.isMesh && x.name.indexOf(Q.id + '-springer') === 0) mat = x.material; });
    if (!mat) o.scene.traverse(function (x) { if (!mat && x.isMesh && x.name === Q.id + '-trim') mat = x.material; });
    if (!mat) mat = new THREE.MeshStandardMaterial({ color: 0xb8ad98, roughness: 0.9 });
    var out = { drawn: 0, kinds: [] };
    (o.kinds || []).forEach(function (k) {
      var g = build(THREE, M, Q, row, k, o.toLocal, mat, o.flags || {});
      if (!g) return;
      (o.group || o.scene).add(g); out.drawn++; out.kinds.push(k);
      /* on the wall layer, as every wall of the page (the Architect, 17 November, 10.08 pm), so taps and the bare view treat it as wall */
      if (o.register) g.traverse(function (x) { if (x.isMesh) o.register(x); });
    });
    return out;
  }

  /* check(scene, M, placeId): gate 5's instrument. coplanar: course faces lying in another mesh's plane (within 4 mm,
     normals within 2 degrees, either facing) whose boxes in that plane overlap by more than 1 cm2, with the area;
     crossings: course runs that cross an opening's cut (no jamb margin) at the course's heights; gaps: corners where a
     run that should meet its neighbour stops short of it. Every course mesh carries userData.course. */
  function check(scene, M, placeId) {
    var THREE = window.THREE, own = [], other = {}, A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
    scene.updateMatrixWorld(true);
    function key(n, d) { return Math.round(n.x * 50) + ',' + Math.round(n.y * 50) + ',' + Math.round(n.z * 50) + ',' + Math.round(d / 0.004); }
    scene.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || o.isInstancedMesh) return;
      for (var p = o; p; p = p.parent) if (!p.visible) return;
      var g = o.geometry, pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, mine = !!o.userData.course;
      for (var k = 0; k < n; k += 3) {
        A.fromBufferAttribute(pos, idx ? idx.getX(k) : k).applyMatrix4(o.matrixWorld);
        B.fromBufferAttribute(pos, idx ? idx.getX(k + 1) : k + 1).applyMatrix4(o.matrixWorld);
        C.fromBufferAttribute(pos, idx ? idx.getX(k + 2) : k + 2).applyMatrix4(o.matrixWorld);
        var nv = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A)); if (nv.length() < 2e-5) continue;
        nv.normalize(); var ax = Math.abs(nv.x) >= Math.abs(nv.y) && Math.abs(nv.x) >= Math.abs(nv.z) ? 'x' : Math.abs(nv.y) >= Math.abs(nv.z) ? 'y' : 'z';
        if (nv[ax] < 0) nv.negate();
        var t = { n: nv, d: nv.dot(A), box: new THREE.Box3().setFromPoints([A.clone(), B.clone(), C.clone()]), name: o.name };
        if (mine) own.push(t); else { var kk = key(nv, t.d); (other[kk] = other[kk] || []).push(t); }
      }
    });
    var hits = {}, area = 0;
    own.forEach(function (t) {
      [-1, 0, 1].forEach(function (dd) {
        var kk = key(t.n, t.d).split(','); kk[3] = +kk[3] + dd;
        (other[kk.join(',')] || []).forEach(function (u) {
          if (Math.abs(u.d - t.d) > 0.004 || u.n.dot(t.n) < 0.9994) return;
          var I = t.box.clone().intersect(u.box); if (I.isEmpty()) return;
          var s = I.getSize(new THREE.Vector3()), dims = [s.x, s.y, s.z].sort(function (a, b) { return b - a; }), ov = dims[0] * dims[1];
          if (ov < 1e-4) return;
          area += ov; hits[t.name.replace(/-run$/, '') + ' x ' + u.name] = 1;
        });
      });
    });
    return { coplanar: Object.keys(hits).length, area: +area.toFixed(3), pairs: Object.keys(hits).slice(0, 8), crossings: LOG.crossings, gaps: LOG.gaps, runs: LOG.runs };
  }
  var LOG = { runs: 0, crossings: 0, gaps: 0 };

  window.WallCourses = { PROFILES: PROFILES, apply: apply, build: build, check: check, log: LOG };
})();
