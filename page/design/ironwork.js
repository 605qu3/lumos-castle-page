/* ironwork.js: the castle's pierced ironwork in code (req 1011, the Architect's, on Godric's note of 23 October 2026,
   1.42 pm: "cast iron filigree worked arches and bars going down the wall adjacent to the dungeon corridor"; his 2 on
   architect-ironwork-1023, pattern B, the scroll grille; req 1048). A blind screen standing off a wall, the wall seen
   through it, nothing behind it: black iron in the schedule's material (docs/architect/materials.md 6, wrought, black),
   no emissive, no glint, nothing glows; no chains, no manacles, no story of who was held. Three r128, the global the
   shell loads; colours only through the caller's material. The frame is the shell's (page/castle-shell.js): x east,
   y up, z south.

   The way (docs/handoff/design.md, The ironwork): the posts, rails and lattice as thin boxes merged into one mesh, since
   solids catch the torches along their edges as iron does; the scrolls a pierced plane, one canvas cell repeated by its
   UVs with alphaTest 0.5 as the corbels' faces (ceilings.js), a second plane 20 mm behind so a scroll shows an edge seen
   along the wall. Every bay in the two meshes: two draw calls for the whole run, whatever its length.

   CastleIronwork.forWall(THREE, Q, o, mats)  one run along a wall of a shell place Q ({ id, poly, floor }): o { toLocal(x,
       y, z), from: [x, y], to: [x, y] (site metres, on the wall's face), top (the screen's top over the floor, 2.9),
       bay (the post spacing asked, 2.4; the run is cut into whole bays), proud (the screen's back off the face, 0.15),
       pattern ('B', the only one built), side (+1 or -1, which side of from-to the room lies; read from the poly's
       middle when not given) }. mats: { iron } (the shell's tone of iron; the scroll plane takes its colour).
       Returns { group, bays, bay, len } or null; the group is named <id>-ironwork, both meshes carry userData.owner
       <id>-ironwork. Every post stands 1 cm into the floor, and a stay at its head and foot runs back 1 cm into the
       wall (the seams rule).
   CastleIronwork.PATTERNS  what each letter is; B and G are built (A and C were the card's other options).

   The cells' gates, pattern G (req 1269, the Architect's, on Godric's 1 on req 1265, 27 October 2026, 10.31 pm, and his
   picture of 10.11 pm): an iron gate in a round stone arch, round bars with knops, spear points above the top rail, a
   taller spear at the middle where the two leaves meet, a pair of small C-scrolls between each two bars under the top
   rail and over the foot rail. Each bar rises above the top rail only as far as the arch lets it, its point stopping
   short of the stone, so the points fan up toward the crown on their own. Rusted fixed open: each leaf stands at its
   own angle on its two hinges, whose pins run 1 cm into the jamb (the seams rule); nothing else touches the stone.
   CastleIronwork.gates(THREE, doors, o, mats)  every gate in one call, two meshes for them all (two draw calls):
       doors [{ a: [x, y], b: [x, y] (site metres, the two jambs on the face the leaves hang from), floor, toward: [x, y]
       (a point the leaves open toward, the cell's middle as a rule), open: degrees or [leaf at a, leaf at b] (80) }];
       o { toLocal(x, y, z), spring (the arch's springing over the floor, 1.8), crown (2.2; the arch a half round when
       crown - spring is half the width), leaves (2, or 1 hung at a), owner ('gates') }; mats { iron } (pass
       CastleIronwork.RUSTED through the shell's own material for the rust-dark black; the scrolls take its colour).
       Returns { group, gates, leaves, triangles } or null; the group and both meshes (<owner>-bars, <owner>-scrolls)
       carry userData.owner <owner>. The scrolls already sit a depth step behind the bars.
   CastleIronwork.RUSTED  0x2f2824, wrought iron gone rust-dark black in the damp: no glint, no emissive. */
(function () {
  'use strict';

  var BEAR = 0.01;   /* every piece bears 1 cm into what it meets, never flush (the seams rule) */
  var PATTERNS = { B: 'a whole-bay scroll grille: back-to-back C-scrolls on a square lattice between plain posts',
    G: 'a cell gate under a round arch: round bars with knops, spear points under the arch, C-scroll pairs at the rails' };
  var RUSTED = 0x2f2824;
  /* the sizes, metres (the card's drawing, tools/architect-ironwork-sheet.py: four cells across a 2.4 bay) */
  var SPEC = { post: 0.045, rail: 0.035, bar: 0.016, depth: 0.022, foot: 0.10, across: 4, stay: 0.03 };

  /* the scroll cell, drawn once: two C-scrolls back to back on a stem that runs rail to rail, each open outward with a
     curl at either end, bound to the stem by a collar, light on its upper edges for the iron's
     roundness (the material's colour multiplies it). Transparent elsewhere: the plane is pierced by alphaTest */
  var tile = null;
  function cell(THREE) {
    if (tile) return tile;
    var N = 512, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d'), w = N * 0.034, k = N / 2;
    g.lineCap = 'round'; g.lineJoin = 'round';
    function scroll(face, ink, lw, dy) {   /* face +1 opens east, -1 west; the C's back against the stem */
      var r = N * 0.205, cx = k + face * (r + N * 0.03), cy = k + dy;   /* the back just clear of the stem, so the two stand back to back */
      g.strokeStyle = ink; g.lineWidth = lw;
      var a0 = face > 0 ? Math.PI * 0.32 : -Math.PI * 0.68, a1 = face > 0 ? Math.PI * 1.68 : Math.PI * 0.68;   /* about 250 degrees, round the back */
      g.beginPath(); g.arc(cx, cy, r, a0, a1); g.stroke();
      [a0, a1].forEach(function (a, e) {   /* a curl at each end, turning on into the C's mouth, the way the arc ran */
        var ex = cx + r * Math.cos(a), ey = cy + r * Math.sin(a), rr = r * 0.36, s = e ? 1 : -1;
        var ccx = ex + (cx - ex) * rr / r, ccy = ey + (cy - ey) * rr / r, a00 = Math.atan2(ey - ccy, ex - ccx);
        g.beginPath();
        for (var t = 0; t <= 1.0001; t += 0.02) {
          var ang = a00 + s * t * Math.PI * 1.6, rad = rr * (1 - 0.6 * t);
          var px = ccx + rad * Math.cos(ang), py = ccy + rad * Math.sin(ang);
          if (t === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke();
      });
    }
    function draw(ink, lw, dy) {
      scroll(1, ink, lw, dy); scroll(-1, ink, lw, dy);
      g.strokeStyle = ink; g.lineWidth = lw;
      g.beginPath(); g.moveTo(k, dy - N); g.lineTo(k, N * 2 + dy); g.stroke();   /* the stem, rail to rail through the cell, the C's backs on it */
      g.beginPath(); g.moveTo(k - N * 0.06, k + dy); g.lineTo(k + N * 0.06, k + dy); g.stroke();   /* the collar binding the two backs to the stem */
    }
    draw('#b4b4b4', w * 1.15, 0);       /* the body: a light grey, so the scrolls read as the bars' own iron, a shade under */
    draw('#f2f2f2', w * 0.35, -w * 0.3);   /* its upper edge, where a torch above catches it */
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return (tile = t);
  }

  /* boxes into one geometry: each [x0, x1, y0, y1, z0, z1] in the wall's frame */
  function boxes(THREE, list) {
    var P = [], Nn = [], I = [], v = 0;
    var F = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
    list.forEach(function (b) {
      var X = [b[0], b[1]], Y = [b[2], b[3]], Z = [b[4], b[5]];
      F.forEach(function (n) {
        var ax = n[0] ? 0 : n[1] ? 1 : 2, s = n[0] + n[1] + n[2] > 0 ? 1 : 0, u = (ax + 1) % 3, w = (ax + 2) % 3, R = [X, Y, Z];
        var q = [[0, 0], [1, 0], [1, 1], [0, 1]].map(function (c) { var p = [0, 0, 0]; p[ax] = R[ax][s]; p[u] = R[u][c[0]]; p[w] = R[w][c[1]]; return p; });
        q.forEach(function (p) { P.push(p[0], p[1], p[2]); Nn.push(n[0], n[1], n[2]); });
        if (s) I.push(v, v + 1, v + 2, v, v + 2, v + 3); else I.push(v, v + 2, v + 1, v, v + 3, v + 2);
        v += 4;
      });
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
    g.setIndex(I);
    return g;
  }

  /* the scroll planes: per cell row of a bay one quad, its UVs counting cells, at the two depths */
  function planes(THREE, quads) {
    var P = [], U = [], Nn = [], I = [], v = 0;
    quads.forEach(function (q) {   /* [x0, x1, y0, y1, z, cellsAcross, cellsUp] */
      P.push(q[0], q[2], q[4], q[1], q[2], q[4], q[1], q[3], q[4], q[0], q[3], q[4]);
      U.push(0, 0, q[5], 0, q[5], q[6], 0, q[6]);
      Nn.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      I.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4;
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.setIndex(I);
    return g;
  }

  /* one run in the wall's own frame: x along from 0 to len, y up from the floor, z out of the wall (its face at z 0) */
  function run(THREE, len, o, mats, owner) {
    var S = SPEC, top = o.top != null ? o.top : 2.9, proud = o.proud != null ? o.proud : 0.15;
    var n = Math.max(1, Math.round(len / (o.bay || 2.4))), bay = len / n;
    var z0 = proud, z1 = proud + S.depth, zm = (z0 + z1) / 2, pz0 = zm - S.post / 2, pz1 = zm + S.post / 2;
    var y0 = S.foot, y1 = top - S.rail, rows = Math.max(1, Math.round((y1 - y0) / (bay / S.across))), ch = (y1 - y0) / rows;
    var B = [], Qd = [], i, j;
    /* the rails, the run's whole length in one piece each; the posts, one at each bay's end; a stay back to the wall
       at each post's head and foot */
    B.push([0, len, y0 - S.rail, y0, pz0 + 0.005, pz1 - 0.005], [0, len, top - S.rail, top, pz0 + 0.005, pz1 - 0.005]);
    for (i = 0; i <= n; i++) {
      var px = Math.min(len - S.post / 2, Math.max(S.post / 2, i * bay));
      B.push([px - S.post / 2, px + S.post / 2, -BEAR, top, pz0, pz1]);
      [y0 - S.rail / 2, top - S.rail / 2].forEach(function (sy) {
        B.push([px - S.stay / 2, px + S.stay / 2, sy - S.stay / 2, sy + S.stay / 2, -BEAR, pz0 + 0.002]);
      });
    }
    /* each bay's lattice, flat bars between the posts and rails, and its scroll planes, a quad a bay at two depths */
    for (i = 0; i < n; i++) {
      var bx0 = i * bay + S.post / 2, bx1 = (i + 1) * bay - S.post / 2, cw = (bx1 - bx0) / S.across;
      for (j = 1; j < S.across; j++) { var lx = bx0 + j * cw; B.push([lx - S.bar / 2, lx + S.bar / 2, y0, y1, z0, z1]); }
      for (j = 1; j < rows; j++) { var ly = y0 + j * ch; B.push([bx0, bx1, ly - S.bar / 2, ly + S.bar / 2, z0, z1]); }
      Qd.push([bx0, bx1, y0, y1, z0 + 0.001, S.across, rows], [bx0, bx1, y0, y1, z1 - 0.001, S.across, rows]);
    }
    var G = new THREE.Group();
    var bars = new THREE.Mesh(boxes(THREE, B), mats.iron); bars.name = owner + '-bars';
    var sm = new THREE.MeshLambertMaterial({ color: mats.iron.color ? mats.iron.color.clone() : 0x34312e, map: cell(THREE), alphaTest: 0.5, side: THREE.DoubleSide });
    var scrolls = new THREE.Mesh(planes(THREE, Qd), sm); scrolls.name = owner + '-scrolls';
    G.add(bars, scrolls);
    G.traverse(function (m) { if (m.isMesh) m.userData.owner = owner; });
    G.userData = { owner: owner, bays: n, bay: bay, rows: rows, cell: [cw, ch], top: top, proud: proud, triangles: B.length * 12 + Qd.length * 2 };
    return G;
  }

  function forWall(THREE, Q, o, mats) {
    if (!Q || !o || !o.from || !o.to || !mats || !mats.iron) return null;
    if (o.pattern && o.pattern !== 'B') return null;   /* only Godric's pick is built */
    var a = o.from, b = o.to, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.5) return null;
    var fl = Q.floor || 0, side = o.side;
    if (!side) {   /* the room's side of from-to, from the middle of its plan */
      var P = Q.poly || [], mx = 0, my = 0;
      P.forEach(function (p) { mx += p[0] / P.length; my += p[1] / P.length; });
      side = ((b[0] - a[0]) * (my - a[1]) - (b[1] - a[1]) * (mx - a[0])) >= 0 ? 1 : -1;
    }
    var nx = -side * (b[1] - a[1]) / len, ny = side * (b[0] - a[0]) / len;   /* the normal into the room */
    var A = o.toLocal(a[0], a[1], fl), Bv = o.toLocal(b[0], b[1], fl), N = o.toLocal(a[0] + nx, a[1] + ny, fl);
    var up = new THREE.Vector3().subVectors(o.toLocal(a[0], a[1], fl + 1), A).normalize();
    var ex = new THREE.Vector3().subVectors(Bv, A).normalize(), ez = new THREE.Vector3().subVectors(N, A).normalize();
    /* the frame (x along, z into the room, y = z cross x) is upright when x runs one way: run the wall from its far end when not */
    if (new THREE.Vector3().crossVectors(ez, ex).dot(up) < 0) { var T = A; A = Bv; Bv = T; ex.negate(); }
    var owner = (Q.id || 'place') + '-ironwork', G = run(THREE, len, o, mats, owner);
    G.matrixAutoUpdate = false;
    G.matrix.makeBasis(ex, new THREE.Vector3().crossVectors(ez, ex), ez).setPosition(A);
    G.name = owner;
    return { group: G, bays: G.userData.bays, bay: G.userData.bay, len: len };
  }

  /* pattern G, the cells' gates. The sizes, metres: square stiles and flat rails, round bars, the bars no more than
     0.12 apart, as a cell's gate is */
  var GS = { stile: 0.032, rail: 0.04, railD: 0.02, bar: 0.022, gap: 0.12, foot: 0.05, knop: 0.019, head: 0.065, headR: 0.021,
    tall: 0.11, tallR: 0.03, clear: 0.035, swing: 0.006, sides: 10 };

  /* the C-scroll pair for one gap: two small C's back to back, each open toward its bar, no stem (a cell of its own,
     drawn once, square; the plane sits only in the gap between two bars, a centimetre into each, never across one) */
  var gtile = null;
  function gcell(THREE) {
    if (gtile) return gtile;
    var N = 256, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d'), k = N / 2;
    g.lineCap = 'round'; g.lineJoin = 'round';
    function pair(ink, lw, dy) {
      g.strokeStyle = ink; g.lineWidth = lw;
      [1, -1].forEach(function (face) {
        var r = N * 0.2, cx = k + face * (r + N * 0.02), cy = k + dy;
        var a0 = face > 0 ? Math.PI * 0.3 : -Math.PI * 0.7, a1 = face > 0 ? Math.PI * 1.7 : Math.PI * 0.7;
        g.beginPath(); g.arc(cx, cy, r, a0, a1); g.stroke();
        [a0, a1].forEach(function (a, e) {   /* a curl at each end, turning into the C's mouth */
          var ex = cx + r * Math.cos(a), ey = cy + r * Math.sin(a), rr = r * 0.4, sg = e ? 1 : -1;
          var ccx = ex + (cx - ex) * rr / r, ccy = ey + (cy - ey) * rr / r, a00 = Math.atan2(ey - ccy, ex - ccx);
          g.beginPath();
          for (var t = 0; t <= 1.0001; t += 0.025) {
            var ang = a00 + sg * t * Math.PI * 1.5, rad = rr * (1 - 0.55 * t);
            var px = ccx + rad * Math.cos(ang), py = ccy + rad * Math.sin(ang);
            if (t === 0) g.moveTo(px, py); else g.lineTo(px, py);
          }
          g.stroke();
        });
      });
      g.beginPath(); g.moveTo(k - N * 0.05, k + dy); g.lineTo(k + N * 0.05, k + dy); g.stroke();   /* the collar binding the backs */
      g.beginPath(); g.moveTo(N * 0.0, k + dy); g.lineTo(N * 0.04, k + dy); g.moveTo(N * 0.96, k + dy); g.lineTo(N, k + dy); g.stroke();   /* each C's mouth riveted to its bar */
    }
    pair('#b4b4b4', N * 0.07, 0);
    pair('#f2f2f2', N * 0.022, -N * 0.02);
    var t = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return (gtile = t);
  }

  /* core geometries into one list of triangles: each piece moved by its matrix, kept as position and normal only */
  function gather(P, Nn, geo, m) {
    var g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(m);
    var a = g.attributes.position.array, n = g.attributes.normal.array;
    for (var i = 0; i < a.length; i++) { P.push(a[i]); Nn.push(n[i]); }
    if (g !== geo) g.dispose();
    geo.dispose();
  }
  function made(THREE, P, Nn, U) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
    if (U) g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.computeBoundingSphere();
    return g;
  }

  function gates(THREE, doors, o, mats) {
    if (!doors || !doors.length || !o || !o.toLocal || !mats || !mats.iron) return null;
    var S = GS, M4 = THREE.Matrix4, V3 = THREE.Vector3, owner = o.owner || 'gates';
    var spring = o.spring != null ? o.spring : 1.8, crown = o.crown != null ? o.crown : 2.2, nLeaves = o.leaves === 1 ? 1 : 2;
    var BP = [], BN = [], SP = [], SN = [], SU = [], count = 0, leavesMade = 0;
    var T = function (x, y, z) { return new M4().makeTranslation(x, y, z); };
    var box = function (m, x0, x1, y0, y1, z0, z1) {
      gather(BP, BN, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m.clone().multiply(T((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)));
    };
    var rod = function (m, x, y0, y1, r) {
      gather(BP, BN, new THREE.CylinderGeometry(r, r, y1 - y0, S.sides, 1, true), m.clone().multiply(T(x, (y0 + y1) / 2, 0)));
    };
    var knop = function (m, x, y, r) {
      var k = new THREE.SphereGeometry(r, S.sides, 6); k.scale(1, 0.8, 1); gather(BP, BN, k, m.clone().multiply(T(x, y, 0)));
    };
    var spear = function (m, x, y, len, r) {   /* the head: a collar, then a leaf-shaped point, wide low and fine at the tip */
      gather(BP, BN, new THREE.CylinderGeometry(r * 0.75, r * 0.75, len * 0.12, S.sides), m.clone().multiply(T(x, y + len * 0.06, 0)));
      gather(BP, BN, new THREE.CylinderGeometry(r, S.bar / 2, len * 0.25, S.sides), m.clone().multiply(T(x, y + len * 0.245, 0)));
      gather(BP, BN, new THREE.ConeGeometry(r, len * 0.63, S.sides), m.clone().multiply(T(x, y + len * 0.685, 0)));
    };
    var quad = function (m, x0, x1, y0, y1, z) {   /* one scroll pair, a quad facing z, UVs over the whole cell */
      var c = [[x0, y0, 0, 0], [x1, y0, 1, 0], [x1, y1, 1, 1], [x0, y0, 0, 0], [x1, y1, 1, 1], [x0, y1, 0, 1]];
      var nm = new THREE.Matrix3().getNormalMatrix(m), nv = new V3(0, 0, 1).applyMatrix3(nm).normalize();
      c.forEach(function (q) { var v = new V3(q[0], q[1], z).applyMatrix4(m); SP.push(v.x, v.y, v.z); SN.push(nv.x, nv.y, nv.z); SU.push(q[2], q[3]); });
    };
    doors.forEach(function (d) {
      var a = d.a, b = d.b, w = Math.hypot(b[0] - a[0], b[1] - a[1]), fl = d.floor || 0;
      if (!a || !b || w < 0.3) return;
      var r = Math.min(w / 2, Math.max(0.01, crown - spring));
      var A = o.toLocal(a[0], a[1], fl), B = o.toLocal(b[0], b[1], fl);
      var up = new V3().subVectors(o.toLocal(a[0], a[1], fl + 1), A).normalize();
      var tw = d.toward ? o.toLocal(d.toward[0], d.toward[1], fl) : null;
      var ang = [].concat(d.open != null ? d.open : 80);
      /* the intrados over the door's width u (0 at a): the springing, then the arch's curve, a half round when r is w / 2 */
      var under = function (u) {
        var e = Math.min(u, w - u); if (e >= r) return spring + r;
        return spring + Math.sqrt(Math.max(0, r * r - (r - e) * (r - e))) * (crown - spring) / r;
      };
      for (var li = 0; li < nLeaves; li++) {
        var H = li ? B : A, F = li ? A : B, wl = nLeaves === 1 ? w - 2 * S.swing : w / 2 - S.swing;
        var shut = new V3().subVectors(F, H).normalize();
        var th = (ang[Math.min(li, ang.length - 1)] || 0) * Math.PI / 180;
        /* swing the leaf the way that brings its tip nearer the toward point */
        var pick = function (sg) { return shut.clone().applyAxisAngle(up, sg * th); };
        var ex = pick(1);
        if (tw) { var e2 = pick(-1); if (H.clone().addScaledVector(e2, wl).distanceTo(tw) < H.clone().addScaledVector(ex, wl).distanceTo(tw)) ex = e2; }
        var ez = new V3().crossVectors(ex, up).normalize();
        var m = new M4().makeBasis(ex, up, ez).setPosition(H);
        var ez0 = new V3().crossVectors(shut, up).normalize(), m0 = new M4().makeBasis(shut, up, ez0).setPosition(H);
        var U = function (x) { return li ? w - x : x; };   /* the leaf's x to the door's u */
        var y0 = S.foot, fr0 = 0.08, fr1 = fr0 + S.rail, tr1 = spring - 0.02, tr0 = tr1 - S.rail, sd = S.stile / 2, rd = S.railD / 2;
        /* the hinges: two knuckles on the axis, each pin back 1 cm into the jamb, in the door's frame, unturned */
        [0.25, tr0 - 0.12].forEach(function (hy) {
          rod(m, 0, hy - 0.05, hy + 0.05, 0.016);
          box(m0, -0.03 - 0.01, 0.0, hy - 0.012, hy + 0.012, -0.012, 0.012);
        });
        /* the frame: the hinge stile, the meeting stile, the foot rail and the top rail */
        box(m, 0.0, S.stile, y0, tr1, -sd, sd);
        box(m, wl - S.stile, wl, y0, tr1, -sd, sd);
        box(m, S.stile - 0.002, wl - S.stile + 0.002, fr0, fr1, -rd, rd);
        box(m, S.stile - 0.002, wl - S.stile + 0.002, tr0, tr1, -rd, rd);
        knop(m, sd, tr1 + 0.012, S.knop);   /* the hinge stile ends at the top rail in a knop */
        /* the round bars between, evenly, no gap over GS.gap */
        var span = wl - 2 * S.stile, nb = Math.max(1, Math.ceil(span / S.gap) - 1), step = span / (nb + 1), xs = [], i;
        for (i = 1; i <= nb; i++) xs.push(S.stile + i * step);
        /* the meeting stile carries the tall spear on the leaf at a (one leaf: the bar nearest the middle does) */
        var mid = nLeaves === 2 ? (li === 0 ? wl - sd : null) : xs.reduce(function (p, x) { return Math.abs(U(x) - w / 2) < Math.abs(U(p) - w / 2) ? x : p; }, xs[0]);
        if (nLeaves === 2 && li === 1) knop(m, wl - sd, tr1 + 0.012, S.knop);
        xs.concat(nLeaves === 2 && li === 0 ? [mid] : []).forEach(function (x) {
          var isMid = x === mid, len = isMid ? S.tall : S.head, rr = isMid ? S.tallR : S.headR;
          var tip = under(U(x)) - S.clear, base = tip - len;
          if (base < tr1 + 0.03) { base = tr1 + 0.03; len = tip - base; }
          if (len < 0.03) { if (!(nLeaves === 2 && li === 0 && isMid)) { rod(m, x, y0, tr1, S.bar / 2); knop(m, x, tr1 + 0.012, S.knop); } return; }
          if (!(nLeaves === 2 && li === 0 && isMid)) rod(m, x, y0, base, S.bar / 2);   /* the stile is the meeting bar's own shaft below the rail */
          else rod(m, x, tr1 - 0.01, base, S.bar / 2 + 0.003);
          knop(m, x, base - 0.008, S.knop * 0.85);   /* a knop under every point */
          if (!isMid || nLeaves === 1) knop(m, x, (fr1 + tr0) / 2, S.knop);   /* and one at the bar's middle */
          spear(m, x, base, len, rr);
        });
        /* the scroll pairs, one in each gap, under the top rail and over the foot rail, at two depths */
        var posts = [sd].concat(xs).concat([wl - sd]), cr = S.bar / 2;
        for (i = 0; i < posts.length - 1; i++) {
          var x0 = posts[i] + (i ? cr : sd) - 0.01, x1 = posts[i + 1] - (i < posts.length - 2 ? cr : sd) + 0.01, hh = x1 - x0 - 0.02;
          [[tr0 - hh, tr0 + 0.004], [fr1 - 0.004, fr1 + hh]].forEach(function (yy) {
            quad(m, x0, x1, yy[0], yy[1], 0.006); quad(m, x0, x1, yy[0], yy[1], -0.006);
          });
        }
        leavesMade++;
      }
      count++;
    });
    if (!count) return null;
    var G = new THREE.Group(); G.name = owner;
    var bars = new THREE.Mesh(made(THREE, BP, BN), mats.iron); bars.name = owner + '-bars';
    var sm = new THREE.MeshLambertMaterial({ color: mats.iron.color ? mats.iron.color.clone() : RUSTED, map: gcell(THREE), alphaTest: 0.5,
      side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 });
    var scrolls = new THREE.Mesh(made(THREE, SP, SN, SU), sm); scrolls.name = owner + '-scrolls'; scrolls.userData.rank = 1;
    G.add(bars, scrolls);
    G.traverse(function (x) { if (x.isMesh) x.userData.owner = owner; });
    var tris = (BP.length + SP.length) / 9;
    G.userData = { owner: owner, gates: count, leaves: leavesMade, triangles: tris };
    return { group: G, gates: count, leaves: leavesMade, triangles: tris };
  }

  window.CastleIronwork = { forWall: forWall, gates: gates, PATTERNS: PATTERNS, SPEC: SPEC, GATE: GS, RUSTED: RUSTED };
})();
