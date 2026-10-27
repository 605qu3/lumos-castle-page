/* ceilings.js: the castle's ceilings and surrounds in code, req 643's second half (Architect > Design; wave 1 of the
   build sequence, docs/ministry/reviews/2026-10-20-build-sequence.md, f5cbc12b). Rough first (Godric, 20 October 2026,
   8.24 am): volume, then the plain tones; no carving but the bosses where a rib vault has them, nothing glows.
   Three r128, the global the shell loads; every colour comes from the caller's materials (the shell's tone()), so
   nothing is coloured twice. The frame is the shell's (page/castle-shell.js, its header): x east, y up, z south.

   CastleCeilings.forPlace(THREE, Q, o)  the ceiling of a shell place Q ({ poly, floor, ceiling, rec }), or null where
       the kind is not drawn here (the shell keeps its flat ceiling). o: { toLocal(x, y, z), kind (the row's ceiling:
       'barrel', 'groin', 'beams'; Q.rec.vault.kind wins), mats: { vault, stone, beam } }. Returns { group, flat }: flat
       true where the shell's own flat ceiling stays above (beams), false where this group replaces it.
       The vault reads Q.rec.vault where the model gives one (springs and crown over the room's floor, piers as site
       points [x, y]); where it does not, the rule below, provisional until the Architect places them:
         barrel  along the room's long side; the crown at the ceiling, a half round over the short span where the
                 height allows, else a segment springing no lower than 2.0 m
         groin   bays on squat round piers: aisles no wider than 6 m, bays about as long as an aisle is wide, the
                 piers where four bays meet, the crown at the ceiling, springing as a barrel's
         beams   oak beams across the short span about every 2.4 m, each end on a stone corbel, under the flat ceiling
         rib     bays about square along the long side, pointed webs, diagonal and transverse ribs, a beast's boss
                 where the diagonals cross, lion, eagle, badger and snake in turn (req 688, Godric's 3)
         star    the Great Hall's (its vault block's piers as site positions along the hall): ribs only, flat true
                 so the shell keeps the sky above; tiercerons and liernes, a beast's boss at each bay's middle
         umbrella a round room's ribs from a squat round pillar (where the vault names one, r 0.5) or to a boss
   CastleCeilings.corbels(id, state)  the beam corbels' carved faces in place id to 'awake' (one or two of them dozing,
       fixed by the place), 'dozing' or 'sleeping' (req 756); 0 where the place has none. Each face a plane 1 cm proud
       of its corbel's face to the room, named <id>-corbel-face-<k>; faces.cell(id, k) the vault corbels' cell by the
       same rule; faces.base(path) sets where the atlases load from (default ../assets/layers/)
   CastleCeilings.surround(THREE, op, mats)  an opening's surround in its reveal: op { w, h, d, kind } (width, the head
       of the shell's cut over the sill, the wall's depth; kind 'round'); a group whose origin is the opening's foot at
       the wall's middle, x along the wall, z through it; the stone that turns the cut's square head round. */
(function () {
  'use strict';

  var SPRING_MIN = 2.0, RISE_MAX = 0.45, AISLE_MAX = 6.0, BEAM_STEP = 2.4, PIER_R = 0.45, SEG = 16;

  /* an arch's height over its springing at s metres from its middle: a segment of a circle through the springing
     at +-a and the crown at rise r (a half round where r = a) */
  function arch(a, r, s) {
    if (r <= 0) return 0;
    r = Math.min(r, a);
    var R = (a * a + r * r) / (2 * r), v = R * R - s * s;
    return v > 0 ? Math.sqrt(v) - (R - r) : 0;
  }

  /* a height field over one bay, x0..x1 by z0..z1, its height at each point h(x, z) over y0; drawn from below */
  function field(THREE, x0, x1, z0, z1, y0, h, mat, n) {
    n = n || SEG;
    var g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, n, n), p = g.attributes.position;
    g.rotateX(Math.PI / 2);   /* the plane faces down, to the room */
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i) + (x0 + x1) / 2, z = p.getZ(i) + (z0 + z1) / 2;
      p.setXYZ(i, x, y0 + h(x, z), z);
    }
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }

  function bounds(Q, toLocal) {
    var c = Q.poly.map(function (p) { return toLocal(p[0], p[1], Q.floor); });
    var xs = c.map(function (v) { return v.x; }), zs = c.map(function (v) { return v.z; });
    return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), z0: Math.min.apply(null, zs), z1: Math.max.apply(null, zs), y: c[0].y };
  }

  /* springing and crown over the floor: the model's where it gives them, else the crown at the ceiling and the
     springing as low as a half round over half-span a needs, never under SPRING_MIN, and the vault never more than
     RISE_MAX of the room's height (a tall hall's vault springs high, above the doors, as the Entrance Hall's) */
  function heights(Q, a) {
    var V = Q.rec && Q.rec.vault, crown = V && V.crown != null ? V.crown : Q.ceiling - Q.floor;
    var springs = V && V.springs != null ? V.springs : crown - Math.min(a, crown - SPRING_MIN, RISE_MAX * crown);
    return { springs: Math.min(springs, crown), crown: crown };
  }

  function barrel(THREE, Q, B, mats) {
    var G = new THREE.Group(), alongX = B.x1 - B.x0 >= B.z1 - B.z0;
    var a = (alongX ? B.z1 - B.z0 : B.x1 - B.x0) / 2, H = heights(Q, a), mid = alongX ? (B.z0 + B.z1) / 2 : (B.x0 + B.x1) / 2;
    var m = field(THREE, B.x0, B.x1, B.z0, B.z1, B.y + H.springs, function (x, z) {
      return arch(a, H.crown - H.springs, alongX ? z - mid : x - mid); }, mats.vault, 24);
    m.name = Q.id + '-barrel'; G.add(m);
    return { group: G, flat: false, springs: H.springs, crown: H.crown };
  }

  /* the bays of a groin vault: the model's piers if it gives them (site points), else aisles and bays by the rule */
  function bays(Q, B, toLocal) {
    var V = Q.rec && Q.rec.vault, xs = [B.x0, B.x1], zs = [B.z0, B.z1], piers = [];
    if (V && V.piers && V.piers.length && Array.isArray(V.piers[0])) {
      V.piers.forEach(function (p) { var v = toLocal(p[0], p[1], Q.floor); piers.push([v.x, v.z]); xs.push(v.x); zs.push(v.z); });
    } else {
      var w = B.x1 - B.x0, d = B.z1 - B.z0, wide = Math.min(w, d), long = Math.max(w, d);
      var na = Math.max(1, Math.ceil(wide / AISLE_MAX - 1e-6)), aw = wide / na, nb = Math.max(1, Math.round(long / aw));
      var across = [], along = [];
      for (var i = 1; i < na; i++) across.push(i * wide / na);
      for (var j = 1; j < nb; j++) along.push(j * long / nb);
      var cx = w >= d ? along : across, cz = w >= d ? across : along;
      cx.forEach(function (v) { xs.push(B.x0 + v); });
      cz.forEach(function (v) { zs.push(B.z0 + v); });
      cx.forEach(function (u) { cz.forEach(function (v) { piers.push([B.x0 + u, B.z0 + v]); }); });
    }
    var uniq = function (a) { a.sort(function (p, q) { return p - q; }); return a.filter(function (v, i) { return !i || v - a[i - 1] > 0.05; }); };
    return { xs: uniq(xs), zs: uniq(zs), piers: piers, given: !!(V && V.piers) };
  }

  function groin(THREE, Q, B, mats, toLocal) {
    var G = new THREE.Group(), K = bays(Q, B, toLocal), small = Infinity;
    for (var i = 1; i < K.xs.length; i++) small = Math.min(small, K.xs[i] - K.xs[i - 1]);
    for (var j = 1; j < K.zs.length; j++) small = Math.min(small, K.zs[j] - K.zs[j - 1]);
    var H = heights(Q, small / 2), rise = H.crown - H.springs;
    for (i = 1; i < K.xs.length; i++) for (j = 1; j < K.zs.length; j++) (function (x0, x1, z0, z1) {
      var ax = (x1 - x0) / 2, az = (z1 - z0) / 2, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      /* two barrels crossing: under the vault is under either, so its face is the higher of the two (the groins
         are where they meet, the arrises down the diagonals); both rise alike, each over its own span */
      var m = field(THREE, x0, x1, z0, z1, B.y + H.springs, function (x, z) {
        return Math.max(arch(az, rise, z - mz), arch(ax, rise, x - mx)); }, mats.vault, SEG);
      m.name = Q.id + '-groin-' + i + '-' + j; G.add(m);
    })(K.xs[i - 1], K.xs[i], K.zs[j - 1], K.zs[j]);
    K.piers.forEach(function (p, k) { G.add(pier(THREE, p[0], p[1], B.y, H.springs, mats.stone, Q.id + '-pier-' + k)); });
    return { group: G, flat: false, springs: H.springs, crown: H.crown, piers: K.piers.length, provisional: !K.given };
  }

  /* a squat round pier: a square base, the drum, a cushion and a square abacus the four bays spring from */
  function pier(THREE, x, z, y0, top, mat, name) {
    var P = new THREE.Group(), r = PIER_R, ab = 0.16, cu = 0.22, ba = 0.18, drum = top - ab - cu - ba;
    var base = new THREE.Mesh(new THREE.BoxGeometry(2.3 * r, ba, 2.3 * r), mat); base.position.set(x, y0 + ba / 2, z); P.add(base);
    var d = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, drum, 20), mat); d.position.set(x, y0 + ba + drum / 2, z); P.add(d);
    var c = new THREE.Mesh(new THREE.CylinderGeometry(1.15 * r, r, cu, 20), mat); c.position.set(x, y0 + ba + drum + cu / 2, z); P.add(c);
    var a = new THREE.Mesh(new THREE.BoxGeometry(2.6 * r, ab, 2.6 * r), mat); a.position.set(x, top + y0 - ab / 2, z); P.add(a);
    P.name = name;
    return P;
  }

  /* the corbels' faces (req 756, the Architect's 716; Godric's picks, ccca86c1): one atlas a state, six faces in a row,
     a cell the image's width over six, 1963 px a metre; a face's cell is chosen by its plane's UVs, so a state is one
     material and a swap is one assignment. In an awake place one or two of its faces (fixed by the place) doze */
  var FACES = { awake: 'corbels-faces.png', dozing: 'corbels-faces-dozing.png', sleeping: 'corbels-faces-sleeping.png' };
  var FACE_TILT = 0.35, FACE_ASPECT = 0.351 / 0.393, facesBase = '../assets/layers/', faceMats = {}, faceSets = {}, T3 = null;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function faceMat(THREE, state) {
    T3 = THREE;
    if (!faceMats[state]) {
      var t = new THREE.TextureLoader().load(facesBase + FACES[state]);
      if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      faceMats[state] = new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5 });
    }
    return faceMats[state];
  }
  function face(THREE, id, k, h) {
    var g = new THREE.PlaneGeometry(h * FACE_ASPECT, h), uv = g.attributes.uv, cell = (hash(id) + k) % 6;
    for (var i = 0; i < uv.count; i++) uv.setX(i, (cell + uv.getX(i)) / 6);
    var m = new THREE.Mesh(g, faceMat(THREE, 'awake')); m.name = id + '-corbel-face-' + k;
    (faceSets[id] = faceSets[id] || []).push(m);
    return m;
  }
  /* the stone behind a bowed face, from its plane back to the corbel's upright face: a wedge, thin at the chin. v7 (req
     1114, the Architect's 167th): its front parallel to the face and 10 mm behind it, never the 2 to 6 mm it leaned
     through before (the 8 mm rule, conventions.md, the layered faces); its back edge then bears 0.6 mm into the corbel */
  function wedge(THREE, w, h, tilt, mat) {
    var sh = new THREE.Shape();
    sh.moveTo(0, -h / 2); sh.lineTo(0, h / 2); sh.lineTo(h * Math.tan(tilt), h / 2); sh.lineTo(0, -h / 2);
    var g = new THREE.ExtrudeGeometry(sh, { depth: w * 0.96, bevelEnabled: false });
    g.translate(0, 0, -w * 0.48); g.rotateY(Math.PI / 2); g.translate(0, 0, -0.01);   /* the shape's x to the face's back (-z), its depth across the face */
    return new THREE.Mesh(g, mat);
  }
  /* CastleCeilings.corbels(id, state): a place's faces to 'awake', 'dozing' or 'sleeping'; returns how many it set */
  function corbels(id, state) {
    var F = faceSets[id] || [], n = F.length, h = hash(id), doze = n ? [h % n] : [];
    if (!FACES[state] || !n) return 0;
    if (n > 2 && (h >>> 8) % 2) doze.push((doze[0] + 1 + (h >>> 9) % (n - 1)) % n);
    F.forEach(function (m, k) { m.material = faceMat(T3, state === 'awake' && doze.indexOf(k) >= 0 ? 'dozing' : state); });
    return n;
  }

  /* oak beams across the short span on stone corbels, under the flat ceiling the shell keeps */
  /* the Architect's 159th (Godric's 11.15 pm, 23 October 2026: "the corbel is in front of the door"): each piece tagged
     userData.beam (and .end, -1 or 1, on a corbel, its face and wedge) so the shell can slide a beam clear of a door;
     Q.beamsAt, where the shell gives it, the beams' own places along the room (local), in place of the even step */
  function beams(THREE, Q, B, mats) {
    var G = new THREE.Group(), alongX = B.x1 - B.x0 >= B.z1 - B.z0, L = alongX ? B.x1 - B.x0 : B.z1 - B.z0;
    var span = alongX ? B.z1 - B.z0 : B.x1 - B.x0, top = B.y + Q.ceiling - Q.floor, n = Q.beamsAt ? Q.beamsAt.length : Math.max(1, Math.round(L / BEAM_STEP));
    var bw = 0.28, bd = 0.36, cl = 0.42, ch = 0.42;
    faceSets[Q.id] = [];
    for (var i = 0; i < n; i++) {
      var t = Q.beamsAt ? Q.beamsAt[i] : (alongX ? B.x0 : B.z0) + (i + 0.5) * L / n, mid = alongX ? (B.z0 + B.z1) / 2 : (B.x0 + B.x1) / 2;
      var b = new THREE.Mesh(alongX ? new THREE.BoxGeometry(bw, bd, span) : new THREE.BoxGeometry(span, bd, bw), mats.beam);
      b.position.set(alongX ? t : mid, top - bd / 2, alongX ? mid : t); b.name = Q.id + '-beam-' + i; b.userData.beam = i; b.userData.axis = alongX ? 'x' : 'z'; G.add(b);
      [-1, 1].forEach(function (s) {   /* a corbel each end, out from the wall under the beam */
        var c = new THREE.Mesh(alongX ? new THREE.BoxGeometry(bw + 0.08, ch, cl) : new THREE.BoxGeometry(cl, ch, bw + 0.08), mats.stone);
        var e = mid + s * (span / 2 - cl / 2);
        c.position.set(alongX ? t : e, top - bd - ch / 2, alongX ? e : t); c.name = Q.id + '-corbel-' + i + (s < 0 ? 'a' : 'b'); c.userData.beam = i; c.userData.end = s; c.userData.corbel = true; G.add(c);
        /* the head bows to the floor below, FACE_TILT, its chin 1 cm proud of its corbel's face to the room (Design's look at the
           Architect's corridor shot, 20 October 2026: square to the room, a face under the beams read edge-on from below) */
        var fh = ch - 0.02, f = face(THREE, Q.id, 2 * i + (s < 0 ? 0 : 1), fh), o = e - s * (cl / 2 + 0.01 + fh / 2 * Math.sin(FACE_TILT));
        f.position.set(alongX ? t : o, top - bd - ch / 2, alongX ? o : t); f.rotation.order = 'YXZ'; f.rotation.x = FACE_TILT;
        f.rotation.y = alongX ? (s < 0 ? 0 : Math.PI) : -s * Math.PI / 2; f.userData.beam = i; f.userData.end = s; G.add(f);
        var w = wedge(THREE, fh * FACE_ASPECT, fh, FACE_TILT, mats.stone); w.position.copy(f.position); w.rotation.copy(f.rotation); w.userData.beam = i; w.userData.end = s; G.add(w);
      });
    }
    corbels(Q.id, 'awake');
    return { group: G, flat: true, beams: n };
  }

  /* a pointed arch's height at s from its middle: two arcs from centres on the springing line meeting at the crown,
     rise r over half-span a (sharper than a half round where r > a, a drop arch where r < a) */
  function pointed(a, r, s) {
    s = Math.abs(s);
    if (s >= a || r <= 0) return 0;
    var R = (a * a + r * r) / (2 * a), c = a - R, v = R * R - (s - c) * (s - c);
    return v > 0 ? Math.sqrt(v) : 0;
  }

  /* a rib: a tube along points, as thick as r0 where it springs (y0) and r1 at the crown (y1), so it thins as it rises */
  function rib(THREE, pts, y0, y1, r0, r1, mat, name, spin) {
    var curve = new THREE.CatmullRomCurve3(pts), ts = Math.max(8, pts.length * 2), rs = 6, q = new THREE.Quaternion(), d = new THREE.Vector3();
    var g = new THREE.TubeGeometry(curve, ts, 1, rs, false), p = g.attributes.position;
    for (var i = 0; i <= ts; i++) {
      var c = curve.getPointAt(i / ts), f = Math.max(0, Math.min(1, (c.y - y0) / Math.max(0.01, y1 - y0))), r = r0 + (r1 - r0) * f;
      if (spin) q.setFromAxisAngle(curve.getTangentAt(i / ts), spin);   /* turned about its length (the star's ribs, req 714) */
      for (var j = 0; j <= rs; j++) {
        var k = i * (rs + 1) + j;
        d.set(p.getX(k) - c.x, p.getY(k) - c.y, p.getZ(k) - c.z); if (spin) d.applyQuaternion(q);
        p.setXYZ(k, c.x + d.x * r, c.y + d.y * r, c.z + d.z * r);
      }
    }
    g.computeVertexNormals();
    var m = new THREE.Mesh(g, mat); m.name = name;
    return m;
  }
  /* a rib's points along a plan line a to b ([x, z]), each at the vault's height there */
  function line(THREE, a, b, y, h, n) {
    var pts = [];
    for (var i = 0; i <= (n || 14); i++) {
      var t = i / (n || 14), x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      pts.push(new THREE.Vector3(x, y + h(x, z) - 0.02, z));
    }
    return pts;
  }

  /* a boss where ribs meet: a short drum hanging from the vault, its face toward the floor; a beast cut on it by
     LumosCarving (carving.js, Godric's 3 on design-bosses-1020: the beast alone) where a beast is named and carving.js
     is loaded, else plain */
  var faces = {};
  function boss(THREE, beast, x, y, z, r, mat, name) {
    var G = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, r * 0.45, 20), mat);
    body.position.set(x, y - r * 0.22, z); G.add(body);
    var C = window.LumosCarving, face = mat;
    if (beast && C && window.LumosBeasts && document && document.createElement) {
      var hex = '#' + mat.color.getHexString(), k = beast + hex;
      if (!faces[k]) {
        var cv = document.createElement('canvas'); cv.width = cv.height = 256;
        var ctx = cv.getContext('2d'); ctx.fillStyle = hex; ctx.fillRect(0, 0, 256, 256);
        C.boss(ctx, beast, 128, 128, 118, { stone: hex, light: Math.PI / 2, form: 'bare' });
        var m = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv) }); m.side = THREE.DoubleSide;
        faces[k] = m;
      }
      face = faces[k];
    }
    var f = new THREE.Mesh(new THREE.CircleGeometry(r * 0.8, 24), face);
    f.rotation.x = Math.PI / 2; f.position.set(x, y - r * 0.45 - 0.005, z); G.add(f);
    G.name = name;
    return G;
  }

  /* a rib vault: bays along the long side, about square, the webs a pointed groin, a transverse rib between bays,
     the two diagonals across each, and the beast's boss where they cross, lion, eagle, badger and snake in turn */
  function ribVault(THREE, Q, B, mats) {
    var G = new THREE.Group(), alongX = B.x1 - B.x0 >= B.z1 - B.z0, L = alongX ? B.x1 - B.x0 : B.z1 - B.z0;
    var wide = alongX ? B.z1 - B.z0 : B.x1 - B.x0, n = Math.max(1, Math.round(L / wide)), H = heights(Q, wide / 2), rise = H.crown - H.springs;
    var y = B.y + H.springs, top = B.y + H.crown, beasts = (window.LumosCarving || {}).BEASTS || ['lion', 'eagle', 'badger', 'snake'];
    var rr = Math.max(0.07, Math.min(0.14, wide * 0.025));
    for (var i = 0; i < n; i++) {
      var a0 = (alongX ? B.x0 : B.z0) + i * L / n, a1 = a0 + L / n;
      var x0 = alongX ? a0 : B.x0, x1 = alongX ? a1 : B.x1, z0 = alongX ? B.z0 : a0, z1 = alongX ? B.z1 : a1;
      var mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ax = (x1 - x0) / 2, az = (z1 - z0) / 2;
      var h = (function (mx, mz, ax, az) { return function (x, z) { return Math.max(pointed(az, rise, z - mz), pointed(ax, rise, x - mx)); }; })(mx, mz, ax, az);
      var w = field(THREE, x0, x1, z0, z1, y, h, mats.vault, SEG); w.name = Q.id + '-web-' + i; G.add(w);
      G.add(rib(THREE, line(THREE, [x0, z0], [x1, z1], y, h), y, top, rr * 1.3, rr, mats.stone, Q.id + '-diagonal-' + i + 'a'));
      G.add(rib(THREE, line(THREE, [x1, z0], [x0, z1], y, h), y, top, rr * 1.3, rr, mats.stone, Q.id + '-diagonal-' + i + 'b'));
      if (i) G.add(rib(THREE, alongX ? line(THREE, [x0, z0], [x0, z1], y, h) : line(THREE, [x0, z0], [x1, z0], y, h), y, top, rr * 1.4, rr * 1.1, mats.stone, Q.id + '-transverse-' + i));
      G.add(boss(THREE, beasts[i % 4], mx, top, mz, Math.max(0.16, Math.min(0.32, wide * 0.06)), mats.stone, Q.id + '-boss-' + i));
    }
    return { group: G, flat: false, springs: H.springs, crown: H.crown, bays: n };
  }

  /* the Great Hall's star vault (model v69's vault block, Godric's 3 on architect-greathall-vault-1019): ribs only, no
     web, so the bewitched sky shows through all that is not rib (the sky is Magic's, req 685). A drop arch across the
     hall at each pier rises from the springing to the ridge rib at the crown; in each bay the diagonals, two tiercerons
     from each springer (to the ridge and to the bay's cross ridge) and four liernes in a star round its middle; the ribs
     thick where they spring and thin to lines at the crown; a beast's boss at each bay's middle in turn, a small plain
     boss at every other meeting on the ridges */
  function starVault(THREE, Q, B, mats, toLocal) {
    var G = new THREE.Group(), V = Q.rec.vault, alongX = B.x1 - B.x0 >= B.z1 - B.z0;
    var H = heights(Q, 0), rise = H.crown - H.springs, y = B.y + H.springs, top = B.y + H.crown;
    var c0 = alongX ? B.z0 : B.x0, c1 = alongX ? B.z1 : B.x1, half = (c1 - c0) / 2, mid = (c0 + c1) / 2;
    var cyY = (Q.poly[0][1] + Q.poly[2][1]) / 2, cyX = (Q.poly[0][0] + Q.poly[2][0]) / 2;
    var lines = [alongX ? B.x0 : B.z0].concat((V.piers || []).map(function (p) {
      var v = alongX ? toLocal(p, cyY, Q.floor) : toLocal(cyX, p, Q.floor); return alongX ? v.x : v.z; }), [alongX ? B.x1 : B.z1]);
    /* plan points as [along, across]; to the frame's [x, z] */
    var P = function (u, v) { return alongX ? [u, v] : [v, u]; };
    var h = function (x, z) { return pointed(half, rise, (alongX ? z : x) - mid); };
    var R0 = 0.24, R1 = 0.06, beasts = (window.LumosCarving || {}).BEASTS || ['lion', 'eagle', 'badger', 'snake'], k = 0;
    /* req 714 (the Architect, 10.23 am: the ribs tied where they cross): up to seven ribs leave one springer in one
       bundle, near upright and alike, so their faces lay in one plane. One owner each: the cross arch runs through at
       full thickness (at an end wall the diagonal), and each other rib yields inside it a step thinner, w in YIELD,
       and turned 8 degrees a step about its length, so no two six-sided ribs lay a face in one plane */
    var add = function (a, b, nm, r0, w) {
      w = w || 1; var A = P(a[0], a[1]), Bp = P(b[0], b[1]), t0 = 0;
      /* a rib from a springer begins inside its springer stone (below), never at the bare springing */
      if (Math.abs(a[1] - c0) < 1e-6 || Math.abs(a[1] - c1) < 1e-6) {
        var lo = 0, hi = 0.5;
        for (var it = 0; it < 30; it++) { var m = (lo + hi) / 2; if (h(A[0] + (Bp[0] - A[0]) * m, A[1] + (Bp[1] - A[1]) * m) < SPRING_H - 0.08) lo = m; else hi = m; }
        t0 = lo; A = [A[0] + (Bp[0] - A[0]) * t0, A[1] + (Bp[1] - A[1]) * t0];
      }
      G.add(rib(THREE, line(THREE, A, Bp, y, h, 18), y, top, (r0 || R0) * w, R1 * w, mats.stone, Q.id + '-' + nm, (1 - w) / 0.03 * 8 * Math.PI / 180));
    };
    /* the springer stone (tas-de-charge) at each springing: one block that owns the bundle where the ribs leave the
       wall together, bearing 2 cm into the wall, SPRING_H tall; every rib from it starts inside it */
    var SPRING_H = Math.min(1.2, rise * 0.3), SPRING_W = 0.8, SPRING_D = 0.55;
    var springer = function (u, side, nm) {
      var dir = side ? -1 : 1, v0 = (side ? c1 : c0) - dir * 0.02, d = SPRING_D + 0.02;
      var g = new THREE.BoxGeometry(alongX ? SPRING_W : d, SPRING_H, alongX ? d : SPRING_W), m = new THREE.Mesh(g, mats.stone);
      var p = P(Math.min(Math.max(u, lines[0] + SPRING_W / 2 - 0.02), lines[lines.length - 1] - SPRING_W / 2 + 0.02), v0 + dir * d / 2);
      m.position.set(p[0], y + SPRING_H / 2 - 0.1, p[1]); m.name = Q.id + '-springer-' + nm; G.add(m);
    };
    var YIELD = { diagonal: [0.97, 0.94], a: [0.91, 0.88], b: [0.85, 0.82] };
    var knob = function (u, v, beast, r, nm) { var p = P(u, v); G.add(boss(THREE, beast, p[0], y + h(p[0], p[1]), p[1], r, mats.stone, Q.id + '-boss-' + nm)); };
    add([lines[0], mid], [lines[lines.length - 1], mid], 'ridge', R1 * 1.6);
    lines.forEach(function (u, i) {
      springer(u, 0, i + 'a'); springer(u, 1, i + 'b');
      if (i && i < lines.length - 1) { add([u, c0], [u, mid], 'cross-' + i + 'a'); add([u, c1], [u, mid], 'cross-' + i + 'b'); knob(u, mid, null, 0.2, 'cross-' + i); }
    });
    for (var i = 1; i < lines.length; i++) {
      var ua = lines[i - 1], ub = lines[i], um = (ua + ub) / 2, q = (ub - ua) / 4, t = half / 2;
      var C = [um, mid], R1p = [um - q, mid], R2p = [um + q, mid], T1 = [um, mid - t], T2 = [um, mid + t];
      [[ua, c0, R1p, T1], [ub, c0, R2p, T1], [ua, c1, R1p, T2], [ub, c1, R2p, T2]].forEach(function (s, j) {
        var S = [s[0], s[1]];
        var e = j % 2;   /* the bay's two ends: a pier's springer serves two bays, so each end yields by its own step */
        add(S, C, 'bay-' + i + '-diagonal-' + j, 0, YIELD.diagonal[e]); add(S, s[2], 'bay-' + i + '-tierceron-' + j + 'a', 0, YIELD.a[e]); add(S, s[3], 'bay-' + i + '-tierceron-' + j + 'b', 0, YIELD.b[e]);
      });
      add(T1, T2, 'bay-' + i + '-cross-ridge', R1 * 1.6);
      [[R1p, T1], [T1, R2p], [R2p, T2], [T2, R1p]].forEach(function (l, j) { add(l[0], l[1], 'bay-' + i + '-lierne-' + j, R1 * 1.4); });
      knob(C[0], C[1], beasts[k++ % 4], 0.5, 'bay-' + i);
      [R1p, R2p, T1, T2].forEach(function (p, j) { knob(p[0], p[1], null, 0.18, 'bay-' + i + '-' + j); });
    }
    return { group: G, flat: true, springs: H.springs, crown: H.crown, bays: lines.length - 1 };
  }

  /* an umbrella vault over a round room: ribs from a squat round pillar at the middle (the model's, where the vault
     names one) to the wall, the webs between rising to a crown ring halfway out; with no pillar, the ribs meet at a
     boss over the middle */
  function umbrella(THREE, Q, B, mats, toLocal) {
    var G = new THREE.Group(), V = Q.rec && Q.rec.vault || {}, cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2, R = Math.min(B.x1 - B.x0, B.z1 - B.z0) / 2;
    var pil = V.pillar && Q.pillar ? Q.pillar : V.pillar ? { r: 0.5 } : null, rp = pil ? pil.r : 0;
    var H = heights(Q, pil ? (R - rp) / 2 : R), rise = H.crown - H.springs, y = B.y + H.springs, top = B.y + H.crown;
    var hr = pil ? function (r) { return pointed((R - rp) / 2, rise, r - (R + rp) / 2); } : function (r) { return pointed(R, rise, r); };
    var g = new THREE.RingGeometry(Math.max(0.001, rp), R, 48, 10), p = g.attributes.position;
    g.rotateX(Math.PI / 2);
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), z = p.getZ(i); p.setXYZ(i, cx + x, y + hr(Math.hypot(x, z)), cz + z); }
    g.computeVertexNormals();
    var web = new THREE.Mesh(g, mats.vault); web.name = Q.id + '-umbrella'; G.add(web);
    var h = function (x, z) { return hr(Math.hypot(x - cx, z - cz)); };
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
      G.add(rib(THREE, line(THREE, [cx + s * Math.max(rp, 0.05), cz + c * Math.max(rp, 0.05)], [cx + s * (R - 0.05), cz + c * (R - 0.05)], y, h), y, top, 0.12, 0.09, mats.stone, Q.id + '-rib-' + k));
    }
    if (pil) G.add(pier(THREE, cx, cz, B.y, H.springs, mats.stone, Q.id + '-pillar'));
    else G.add(boss(THREE, null, cx, top, cz, 0.3, mats.stone, Q.id + '-boss'));
    return { group: G, flat: false, springs: H.springs, crown: H.crown };
  }

  function forPlace(THREE, Q, o) {
    if (!Q || !Q.poly || Q.ceiling == null) return null;
    var V = Q.rec && Q.rec.vault, kind = (V && V.kind) || o.kind, B = bounds(Q, o.toLocal), r;
    if (kind === 'barrel') r = barrel(THREE, Q, B, o.mats);
    else if (kind === 'groin') r = groin(THREE, Q, B, o.mats, o.toLocal);
    else if (kind === 'beams') r = beams(THREE, Q, B, o.mats);
    else if (kind === 'rib') r = ribVault(THREE, Q, B, o.mats);
    else if (kind === 'star' && V && V.piers) r = starVault(THREE, Q, B, o.mats, o.toLocal);
    else if (kind === 'umbrella') r = umbrella(THREE, Q, B, o.mats, o.toLocal);
    else return null;
    r.group.name = Q.id + '-ceilings'; r.kind = kind;
    return r;
  }

  /* a round head turned in the reveal of a square cut: the two spandrels between the cut's head and a half round
     springing at h - w / 2, through the wall's depth, and nothing below the springing (the cut's jambs stand) */
  function surround(THREE, op, mats) {
    var G = new THREE.Group(), w = op.w, h = op.h, d = op.d, a = w / 2;
    if ((op.kind || 'round') !== 'round' || h <= a) return G;
    var sp = h - a, s = new THREE.Shape();
    s.moveTo(-a, sp); s.lineTo(-a, h); s.lineTo(a, h); s.lineTo(a, sp);
    for (var k = 0; k <= 24; k++) { var t = k / 24 * Math.PI; s.lineTo(a * Math.cos(t), sp + a * Math.sin(t)); }
    var g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 24 });
    g.translate(0, 0, -d / 2);
    var m = new THREE.Mesh(g, mats.stone); m.name = 'surround-round'; G.add(m);
    return G;
  }

  window.CastleCeilings = { forPlace: forPlace, surround: surround, corbels: corbels, faces: { files: FACES, cell: function (id, k) { return (hash(id) + k) % 6; }, base: function (b) { if (b) facesBase = b; return facesBase; } }, arch: arch, rule: { SPRING_MIN: SPRING_MIN, RISE_MAX: RISE_MAX, AISLE_MAX: AISLE_MAX, BEAM_STEP: BEAM_STEP, PIER_R: PIER_R } };
})();
