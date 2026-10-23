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
   CastleIronwork.PATTERNS  what each letter is; only B is built (A and C were the card's other options). */
(function () {
  'use strict';

  var BEAR = 0.01;   /* every piece bears 1 cm into what it meets, never flush (the seams rule) */
  var PATTERNS = { B: 'a whole-bay scroll grille: back-to-back C-scrolls on a square lattice between plain posts' };
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

  window.CastleIronwork = { forWall: forWall, PATTERNS: PATTERNS, SPEC: SPEC };
})();
