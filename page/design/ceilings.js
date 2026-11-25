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
         barrel  along the room's long side (or vault.along 'x' | 'z', req 5216, for a passage between doorways); the crown at the ceiling, a half round over the short span where the
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
       same rule; faces.base(path) sets where the atlases load from (default ../assets/layers/); faces.list(id) the
       place's face meshes in k order
   CastleCeilings.yawn  { levels(xs, boy, t, o), set(id, k, level), rule }: the sleeping faces' yawn by night (req 1313),
       its timing and its frame (see the yawn, below)
   CastleCeilings.surround(THREE, op, mats)  an opening's surround in its reveal: op { w, h, d, kind } (width, the head
       of the shell's cut over the sill, the wall's depth; kind 'round'); a group whose origin is the opening's foot at
       the wall's middle, x along the wall, z through it; the stone that turns the cut's square head round. */
(function () {
  'use strict';

  var SPRING_MIN = 2.0, RISE_MAX = 0.45, AISLE_MAX = 6.0, BEAM_STEP = 2.4, PIER_R = 0.45, SEG = 16, BURY = 0.03;

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
    var G = new THREE.Group(), V = Q.rec && Q.rec.vault, alongX = B.x1 - B.x0 >= B.z1 - B.z0;
    /* req 5216: vault.along 'x' or 'z' (site axes; local x is east, z south) runs the barrel between a passage's doorways
       instead of along its long side; the springing and crown still come from the model's vault block */
    if (V && (V.along === 'x' || V.along === 'z')) alongX = V.along === 'x';
    var a = (alongX ? B.z1 - B.z0 : B.x1 - B.x0) / 2, H = heights(Q, a), mid = alongX ? (B.z0 + B.z1) / 2 : (B.x0 + B.x1) / 2;
    var m = field(THREE, B.x0, B.x1, B.z0, B.z1, B.y + H.springs, function (x, z) {
      return arch(a, H.crown - H.springs, alongX ? z - mid : x - mid); }, mats.vault, 24);
    /* req 3186: a half round meets the wall at a tangent, flush with its face, so the two fight in small teeth along
       the springing; the edge row goes BURY into the wall, so the first facet crosses the face at an angle and the
       foot hides behind it (the crown and every other point stay) */
    var p = m.geometry.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var s = alongX ? p.getZ(i) - mid : p.getX(i) - mid;
      if (Math.abs(Math.abs(s) - a) < 1e-4) { if (alongX) p.setZ(i, p.getZ(i) + Math.sign(s) * BURY); else p.setX(i, p.getX(i) + Math.sign(s) * BURY); }
    }
    p.needsUpdate = true; m.geometry.computeVertexNormals();
    /* req 5221: a passage's barrel (vault.along) reads curved: its stone takes a shade by the slope of each point, the crown lit
       and the haunches falling away, and its voussoir courses, a joint every half metre along the walk and a stagger across, so the eye
       follows the curve. The room's own material is cloned, so no other vault changes. */
    if (V && (V.along === 'x' || V.along === 'z') && mats.vault && typeof document !== 'undefined') {
      var nm = m.geometry.attributes.normal, col = new Float32Array(p.count * 3), uv = m.geometry.attributes.uv, span = alongX ? B.x1 - B.x0 : B.z1 - B.z0;
      for (var k = 0; k < p.count; k++) {
        var ny = Math.max(0, -nm.getY(k)), sh = 0.62 + 0.46 * Math.pow(ny, 1.6);
        col[k * 3] = col[k * 3 + 1] = col[k * 3 + 2] = Math.min(1.1, sh);
        var arc = alongX ? p.getZ(k) - mid : p.getX(k) - mid, along = alongX ? p.getX(k) - B.x0 : p.getZ(k) - B.z0;
        uv.setXY(k, along / 0.5, (arc + a) / 0.45);
      }
      m.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3)); uv.needsUpdate = true;
      var cv = document.createElement('canvas'); cv.width = cv.height = 64; var cx = cv.getContext('2d');
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, 64, 64); cx.fillStyle = 'rgba(40,36,30,0.55)'; cx.fillRect(0, 0, 64, 3); cx.fillRect(0, 0, 3, 32); cx.fillRect(32, 32, 3, 32);
      var tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
      var vm = mats.vault.clone(); vm.vertexColors = true; vm.map = tx; vm.needsUpdate = true; m.material = vm;
    }
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
  /* Masonry (17 November 2026, gate 6, row 5869; Godric, 9.12 pm: "make the columns look like columns"): a column turned
     as a mason dresses it, from one profile: a moulded base (a roll, a hollow, a smaller roll, after the English attic
     base) standing on its plinth at yb, the round shaft, and a capital (a necking ring and a bell spreading to the
     abacus) whose top is yt. The parts overlap a few mm where they meet and have no flat faces of their own, so no two
     faces lie in one plane. octagon: an eight-sided slab, the plinth and the abacus of English work, never a box */
  var BASE_H = 0.2, CAP_H = 0.36;
  function turned(THREE, pts, seg) { return new THREE.LatheGeometry(pts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), seg || 24); }
  function column(THREE, P, mat, x, z, yb, yt, r) {
    var add = function (g, py) { var m = new THREE.Mesh(g, mat); m.position.set(x, py, z); P.add(m); return m; };
    add(turned(THREE, [[r * 1.32, 0], [r * 1.36, 0.035], [r * 1.3, 0.075], [r * 1.12, 0.09], [r * 1.08, 0.115], [r * 1.18, 0.14], [r * 1.14, 0.17], [r * 1.0, 0.19], [r * 0.98, BASE_H + 0.01]]), yb - 0.005);
    add(new THREE.CylinderGeometry(r, r, yt - yb - BASE_H - CAP_H + 0.02, 24, 1, true), (yb + BASE_H + yt - CAP_H) / 2);
    add(turned(THREE, [[r * 0.98, -0.01], [r * 1.1, 0.0], [r * 1.12, 0.035], [r * 1.0, 0.06], [r * 1.02, 0.1], [r * 1.18, 0.2], [r * 1.42, 0.3], [r * 1.5, CAP_H + 0.005]]), yt - CAP_H);
  }
  function octagon(THREE, R, h) { var g = new THREE.CylinderGeometry(R, R, h, 8); g.rotateY(Math.PI / 8); return g; }

  function pier(THREE, x, z, y0, top, mat, name) {
    var P = new THREE.Group(), r = PIER_R, ab = 0.14, ba = 0.24;
    var pl = new THREE.Mesh(octagon(THREE, 1.5 * r, ba), mat); pl.position.set(x, y0 + ba / 2, z); P.add(pl);
    column(THREE, P, mat, x, z, y0 + ba, top + y0 - ab, r);
    var a = new THREE.Mesh(octagon(THREE, 1.62 * r, ab), mat); a.position.set(x, top + y0 - ab / 2, z); P.add(a);
    P.name = name;
    return P;
  }

  /* the corbels' faces (req 756, the Architect's 716; Godric's picks, ccca86c1): one atlas a state, six faces in a row,
     a cell the image's width over six, 1963 px a metre; a face's cell is chosen by its plane's UVs, so a state is one
     material and a swap is one assignment. In an awake place one or two of its faces (fixed by the place) doze */
  var FACES = { awake: 'corbels-faces.png', dozing: 'corbels-faces-dozing.png', sleeping: 'corbels-faces-sleeping.png',
    yawning: 'corbels-faces-yawning.png' };   /* the yawn (req 1313): Godric's candidate 1 on req 1336, 28 October 2026, 12.15 am */
  var FACE_TILT = 0.08, FACE_ASPECT = 0.351 / 0.393, facesBase = '../assets/layers/', faceMats = {}, faceSets = {}, faceTint = {}, T3 = null;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /* v? (Architect, 1 November 2026, Godric on the hospital wing: "the corbel faces are still the wrong colour"): the atlases are drawn
     in copper pink (mean 173, 133, 123), the walls are stone; once loaded each atlas is turned to its light-and-shade alone, lifted a
     little, and the material's colour gives it a warm stone. The vault faces in castle-shell.js use faces.stone(THREE, tex) too. */
  function stoneTexture(tex) {
    var im = tex.image;
    if (!im || !im.width || typeof document === 'undefined') return tex;
    var c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    var x = c.getContext('2d'); x.drawImage(im, 0, 0);
    var d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (var i = 0; i < p.length; i += 4) { var l = Math.min(255, (0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2]) * 1.4); p[i] = p[i + 1] = p[i + 2] = l; }
    /* v? (req 3205 E, 7 November 2026): the art is inked round its cut edge, a dark band 5 to 8 px wide inside the alpha, its faint trace to 13
       (lum 31 against the stone's 170), which read as a dotted outline round every face. Each texel's distance to the
       cut (two chamfer passes); within EDGE px it is cut too, and every cut texel takes the stone's mean tone from just
       inside the new edge, so the mipmaps blend stone into the rim, never the black of the empty texels */
    var W = c.width, H = c.height, n = W * H, D = new Float32Array(n), EDGE = 14, big = 1e6, j, s = 0, sn = 0;
    for (j = 0; j < n; j++) D[j] = p[j * 4 + 3] < 128 ? 0 : big;
    for (var y = 0; y < H; y++) for (var xx = 0; xx < W; xx++) { j = y * W + xx; if (!D[j]) continue;
      if (xx) D[j] = Math.min(D[j], D[j - 1] + 1); if (y) D[j] = Math.min(D[j], D[j - W] + 1);
      if (xx && y) D[j] = Math.min(D[j], D[j - W - 1] + 1.414); if (xx < W - 1 && y) D[j] = Math.min(D[j], D[j - W + 1] + 1.414); }
    for (y = H - 1; y >= 0; y--) for (xx = W - 1; xx >= 0; xx--) { j = y * W + xx; if (!D[j]) continue;
      if (xx < W - 1) D[j] = Math.min(D[j], D[j + 1] + 1); if (y < H - 1) D[j] = Math.min(D[j], D[j + W] + 1);
      if (xx < W - 1 && y < H - 1) D[j] = Math.min(D[j], D[j + W + 1] + 1.414); if (xx && y < H - 1) D[j] = Math.min(D[j], D[j + W - 1] + 1.414); }
    for (j = 0; j < n; j++) if (D[j] > EDGE && D[j] <= EDGE + 6) { s += p[j * 4]; sn++; }
    var fill = sn ? s / sn : 200;
    for (j = 0; j < n; j++) if (D[j] <= EDGE) { var q = j * 4; p[q] = p[q + 1] = p[q + 2] = fill; }
    for (j = 3; j < p.length; j += 4) p[j] = 255;   /* then opaque throughout: the face is a whole stone panel, its cut filled with the stone's tone, so no alpha-test edge steps into a dashed line (Fawkes's blind look, 8.50 pm) */
    x.putImageData(d, 0, 0); tex.image = c; tex.needsUpdate = true; return tex;
  }
  var STONE_FACE = 0xe3d8c4;
  function faceMat(THREE, state, tint) {
    T3 = THREE;
    var key = state + (tint != null ? ':' + tint : '');
    if (!faceMats[key]) {
      var t = new THREE.TextureLoader().load(facesBase + FACES[state], stoneTexture);
      if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      faceMats[key] = new THREE.MeshLambertMaterial({ map: t, color: tint != null ? tint : STONE_FACE, alphaTest: 0.5 });
    }
    return faceMats[key];
  }
  function face(THREE, id, k, h, w) {
    var g = new THREE.PlaneGeometry(w || h * FACE_ASPECT, h), uv = g.attributes.uv, cell = (hash(id) + k) % 6;
    for (var i = 0; i < uv.count; i++) uv.setX(i, (cell + uv.getX(i)) / 6);
    var m = new THREE.Mesh(g, faceMat(THREE, 'awake', faceTint[id])); m.name = id + '-corbel-face-' + k;
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
    F.forEach(function (m, k) { m.material = faceMat(T3, state === 'awake' && doze.indexOf(k) >= 0 ? 'dozing' : state, faceTint[id]); });
    return n;
  }

  /* the yawn (req 1313 (a), Corridor's; Godric's 1 on req 1307, 27 October 2026, 11.47 pm: the corridor that yawns). By
     night the sleeping faces yawn in their sleep, lids still down, one face to a breath, in time with the slow breathing
     Events' cue (req 1312) gives, as the boy walks toward the locked door; nearer the door, a wider and longer yawn.
     yawn.levels(xs, boy, t, o) is the timing alone: xs the faces' places along the walk (metres, rising toward the door),
     boy his, t seconds; o { breath (s, the cue's period, else BREATH), start, door (the walk's ends, else xs's) }.
     Returns a level 0 to 1 a face: at most one face a breath, the next ahead of him within RANGE, taken in turn so a
     boy standing still sees them ripple on toward the door; the jaw rides the in-breath and is shut by the out-breath.
     yawn.set(id, k, level) shows it on a face, the yawning frame above OPEN, else sleeping (the yawning atlas the
     sleeping one's six faces, eyes still shut, jaws wide: Godric's candidate 1 on req 1336); false where k has no face */
  var YAWN = { BREATH: 7.0, RANGE: 6.0, OPEN: 0.4, IN: 0.6 };
  function yawnLevels(xs, boy, t, o) {
    o = o || {};
    var P = o.breath || YAWN.BREATH, n = Math.floor(t / P), u = t / P - n, out = xs.map(function () { return 0; });
    var a = o.start != null ? o.start : Math.min.apply(null, xs), b = o.door != null ? o.door : Math.max.apply(null, xs);
    var ahead = xs.map(function (x, k) { return k; }).filter(function (k) { return xs[k] >= boy && xs[k] - boy <= YAWN.RANGE; })
      .sort(function (i, j) { return xs[i] - xs[j]; });
    if (!ahead.length) return out;
    var k = ahead[n % ahead.length], near = b > a ? Math.min(1, Math.max(0, (xs[k] - a) / (b - a))) : 1;
    var len = YAWN.IN * (0.75 + 0.25 * near);                   /* the in-breath's share the yawn takes, longer by the door */
    if (u < len) out[k] = +((0.55 + 0.45 * near) * Math.pow(Math.sin(Math.PI * u / len), 2)).toFixed(3);
    return out;
  }
  function yawnSet(id, k, level) {
    var m = (faceSets[id] || [])[k];
    if (!m || !FACES.yawning) return false;
    m.material = faceMat(T3, level > YAWN.OPEN ? 'yawning' : 'sleeping');
    return true;
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
    /* req 3205: the face wears the corbel block's own stone, not the cream 0xe3d8c4 (Godric, 6.05 pm, 7 November 2026) */
    if (mats.stone && mats.stone.color) { var hsl = { h: 0, s: 0, l: 0 }; mats.stone.color.getHSL(hsl); faceTint[Q.id] = new THREE.Color().setHSL(hsl.h, hsl.s, 0.70).getHex(); }   /* the block's hue, lightened: its own colour is the dark half of the dressed stone */
    /* the stone behind the face takes the face's own tint, so a clear edge of the carving shows lit stone, never the block's shadowed front */
    var backing = faceTint[Q.id] != null ? new THREE.MeshLambertMaterial({ color: new THREE.Color(faceTint[Q.id]).multiplyScalar(0.9) }) : mats.stone;
    for (var i = 0; i < n; i++) {
      var t = Q.beamsAt ? Q.beamsAt[i] : (alongX ? B.x0 : B.z0) + (i + 0.5) * L / n, mid = alongX ? (B.z0 + B.z1) / 2 : (B.x0 + B.x1) / 2;
      var b = new THREE.Mesh(alongX ? new THREE.BoxGeometry(bw, bd, span) : new THREE.BoxGeometry(span, bd, bw), mats.beam);
      b.position.set(alongX ? t : mid, top - bd / 2, alongX ? mid : t); b.name = Q.id + '-beam-' + i; b.userData.beam = i; b.userData.axis = alongX ? 'x' : 'z'; G.add(b);
      [-1, 1].forEach(function (s) {   /* a corbel each end, out from the wall under the beam */
        var c = new THREE.Mesh(alongX ? new THREE.BoxGeometry(bw + 0.08, ch, cl) : new THREE.BoxGeometry(cl, ch, bw + 0.08), mats.corbel || mats.stone);   /* req 3175: the shell's self-lit variant, so the underside is not black */
        var e = mid + s * (span / 2 - cl / 2);
        c.position.set(alongX ? t : e, top - bd - ch / 2, alongX ? e : t); c.name = Q.id + '-corbel-' + i + (s < 0 ? 'a' : 'b'); c.userData.beam = i; c.userData.end = s; c.userData.corbel = true; G.add(c);
        /* the head bows to the floor below, FACE_TILT, its chin 1 cm proud of its corbel's face to the room (Design's look at the
           Architect's corridor shot, 20 October 2026: square to the room, a face under the beams read edge-on from below) */
        var fh = ch, fw = bw + 0.08, f = face(THREE, Q.id, 2 * i + (s < 0 ? 0 : 1), fh, fw), o = e - s * (cl / 2 + 0.01 + fh / 2 * Math.sin(FACE_TILT));
        f.position.set(alongX ? t : o, top - bd - ch / 2, alongX ? o : t); f.rotation.order = 'YXZ'; f.rotation.x = FACE_TILT;
        f.rotation.y = alongX ? (s < 0 ? 0 : Math.PI) : -s * Math.PI / 2; f.userData.beam = i; f.userData.end = s; G.add(f);
        /* req 3205: the wedge 0.7 mm proud of the block each side (1.004 of its width); at 0.99 a 1.8 mm strip of the block's shadowed front showed past it as a dark hairline on the oblique */
        var w = wedge(THREE, fw / 0.96 * 1.004, fh, FACE_TILT, [mats.stone, backing]); w.position.copy(f.position); w.rotation.copy(f.rotation); w.userData.beam = i; w.userData.end = s; G.add(w);
        /* req 3205: a stone sill under the chin closes the 1 cm gap between the face and the block, which from below showed the
           wedge's lit front as a one-pixel strip, a sawtooth along the block's bottom front edge. Its underside falls from the chin
           back to 0.8 mm under the block's underside (tilted the other way from the face), so no sliver of the block's shadowed front shows under it */
        var sg = new THREE.BoxGeometry(fw * 1.004, 0.004, 0.0105); sg.translate(0, 0.002, -0.00525);
        var sill = new THREE.Mesh(sg, mats.stone); sill.rotation.order = 'YXZ'; sill.rotation.y = f.rotation.y; sill.rotation.x = -2 * FACE_TILT;
        sill.position.set(0, -fh / 2, 0).applyQuaternion(f.quaternion).add(f.position);   /* the chin's edge */
        sill.userData.beam = i; sill.userData.end = s; G.add(sill);
      });
    }
    corbels(Q.id, 'awake');
    return { group: G, flat: true, beams: n };
  }

  /* a pointed arch's height at s from its middle: two arcs from centres on the springing line meeting at the crown,
     rise r over half-span a (sharper than a half round where r > a, a drop arch where r < a) */
  /* gate 16 (Godric's 1 on the arch card, 22 November 2026): a four-centred rib where the rise r is less than the half span a, where pointed()'s
     two centres cross the middle and the path humps and dips at the crown. Each half: a lower arc of radius rho centred on
     the impost at a - rho, an upper arc on their common tangent at angle phi, its centre past the lower centre on that line,
     through the crown (0, r); phi chosen so each half meets the crown at NAVE4 degrees from level (10, his pick; another ?nave4= is a look only:
     the springers in design/kit were cut from the 10 degree rings and will not fit another) */
  var NAVE4 = +((/[?&]nave4=([\d.]+)/.exec(location.search) || [])[1] || 10), P4C = {};
  function four(a, r) {
    var key = a.toFixed(4) + '|' + r.toFixed(4); if (P4C[key]) return P4C[key];
    var rho = a * 4 / 6, best = null;
    for (var i = 1; i < 9000; i++) {
      var ph = i / 100 * Math.PI / 180, ux = Math.cos(ph), uy = Math.sin(ph), clx = a - rho, wx = -clx, wy = r;
      var den = 2 * (wx * ux + wy * uy - rho); if (Math.abs(den) < 1e-9) continue;
      var k = (rho * rho - (wx * wx + wy * wy)) / den; if (k <= 0) continue;
      var cux = clx - k * ux, cuy = -k * uy; if (cux >= 0) continue;
      var deg = Math.atan2(-cux, r - cuy) * 180 / Math.PI;
      if (!best || Math.abs(deg - NAVE4) < Math.abs(best.deg - NAVE4)) best = { rho: rho, clx: clx, Ru: rho + k, cux: cux, cuy: cuy, Ts: clx + rho * ux, deg: deg };
    }
    return (P4C[key] = best);
  }
  function pointed4(a, r, s) {
    if (r >= a || r <= 0) return pointed(a, r, s);
    s = Math.abs(s); if (s >= a) return 0;
    var F = four(a, r); if (!F) return pointed(a, r, s);
    if (s >= F.Ts) { var v = F.rho * F.rho - (s - F.clx) * (s - F.clx); return v > 0 ? Math.sqrt(v) : 0; }
    var w = F.Ru * F.Ru - (s - F.cux) * (s - F.cux); return F.cuy + Math.sqrt(Math.max(0, w));
  }
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
  /* Masonry, 21 November 2026, gate 11 (Godric on req 5975, 7.54 pm: "The ribs are far too thin looking where they meet columns:";
     14 November: "They come down like skinny pipes onto the columns in the entrance hall"): ?ribfoot= in ribGrid only, off by default.
       bundle  (1) the tas-de-charge (Feher 2021; Ungewitter 1901 pp. 99 to 101: the late free pier's springer a vertical octagonal
               core the ribs grow out of): each rib leaves its pier at the abacus's edge, 0.62 out, and rises straight up until its own
               curve reaches that offset (at Notre-Dame the transverse rib rises "little less than 2 metres" over the abaci, Wendland and
               Gielen 2022), a vertical octagonal core between the eight stems to the lowest turn; the ribs keeled, 1.4 deep to their
               width, 1.45 times wider at the foot. v27's first form, a sloped core 1.2 m tall, read as a blank dark pyramid with the
               ribs as thin as today's (blind look, 8.27 pm): FAIL A, this is its one edit
       keel    (2) the same keeled section (Ungewitter pp. 70 to 72: height to width ideally 1.4; Bond 1905: "depth is more valuable than
               breadth"), each rib swelling to twice its width over its first metre, so the eight gather on the abacus, no core
       thick   (3) today's round ribs at 1.5 times
     ribDeep builds its own section frame: across the rib (sx, level) and in its vertical plane (ux, down to the soffit), so the depth
     hangs below the web and the keel is on the soffit; rib() is untouched. CastleCeilings.ribFoot logs, in every mode, each rib's
     half-width and plan offset from its foot at heights over the springing, for tools/masonry-rib-foot.js */
  var RIBFOOT = (/[?&]ribfoot=(\w+)/.exec(location.search) || [])[1] || null;
  var RIBFOOT_OPT = { bundle: { w: 1.0, d: 1.4, keel: 0.35, swell: 1.45, swellLen: 2.5, stem: 0.62, core: true },
    keel: { w: 1.0, d: 1.4, keel: 0.35, swell: 2.0, swellLen: 1.0 }, thick: { round: 1.5 } }[RIBFOOT] || null;
  function ribFootLog(id) {
    var C = (window.CastleCeilings = window.CastleCeilings || {}), L = C.ribFoot = C.ribFoot || {};
    return (L[id] = L[id] || { mode: RIBFOOT || 'today', ribs: [], cores: [], turns: [] });
  }
  function ribSwell(o, along) { if (!o || !o.swell) return 1; var t = Math.max(0, Math.min(1, along / o.swellLen)); return 1 + (o.swell - 1) * (1 - t * t * (3 - 2 * t)); }
  /* the log: from each end of a rib, at heights hs over that end, the plan offset from the end and the half-width across */
  function ribSample(THREE, log, pts, y0, y1, r0, r1, name, o, org) {   /* org: the rib's own ends before any stem moved them, so offsets are from the pier */
    var curve = new THREE.CatmullRomCurve3(pts), arc = curve.getLength(), N = 200, hs = [0.25, 0.5, 0.75, 1.0, 1.2, 1.5];
    [0, 1].forEach(function (end) {
      var e = org ? org[end] : curve.getPointAt(end), out = [];
      hs.forEach(function (h) {
        for (var i = 0; i <= N; i++) {
          var u = end ? 1 - i / N : i / N, c = curve.getPointAt(u);
          if (c.y - e.y < h) continue;
          var f = Math.max(0, Math.min(1, (c.y - y0) / Math.max(0.01, y1 - y0))), r = r0 + (r1 - r0) * f;
          var hw = o && o.round ? r * o.round : o ? r * o.w * ribSwell(o, Math.min(u, 1 - u) * arc) : r;
          out.push([h, +(c.x - e.x).toFixed(3), +(c.z - e.z).toFixed(3), +hw.toFixed(3)]);
          break;
        }
      });
      log.ribs.push({ nm: name, end: end, at: [+e.x.toFixed(3), +e.y.toFixed(3), +e.z.toFixed(3)], depthOverWidth: o && o.d ? o.d / o.w : 1, s: out });
    });
  }
  function ribDeep(THREE, pts, y0, y1, r0, r1, mat, name, o) {
    var curve = new THREE.CatmullRomCurve3(pts), ts = Math.max(24, pts.length * 3), rs = 12, arc = curve.getLength();
    var pos = new Float32Array((ts + 1) * (rs + 1) * 3), idx = [], t = new THREE.Vector3(), sx = new THREE.Vector3(), ux = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
    for (var i = 0; i <= ts; i++) {
      var u = i / ts, c = curve.getPointAt(u); curve.getTangentAt(u, t);
      sx.crossVectors(t, UP); if (sx.lengthSq() < 1e-8) sx.set(1, 0, 0); sx.normalize();
      ux.crossVectors(sx, t).normalize(); if (ux.y > 0) ux.negate();
      var f = Math.max(0, Math.min(1, (c.y - y0) / Math.max(0.01, y1 - y0))), r = (r0 + (r1 - r0) * f) * ribSwell(o, Math.min(u, 1 - u) * arc);
      for (var j = 0; j <= rs; j++) {
        var a = j / rs * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a);
        var dn = sn > 0 ? r * o.d * sn * (1 + o.keel * Math.pow(sn, 8)) : r * o.w * sn;   /* below: deep, keeled; above: round, in the web */
        var k = (i * (rs + 1) + j) * 3;
        pos[k] = c.x + sx.x * r * o.w * cs + ux.x * dn; pos[k + 1] = c.y + sx.y * r * o.w * cs + ux.y * dn; pos[k + 2] = c.z + sx.z * r * o.w * cs + ux.z * dn;
      }
    }
    for (i = 0; i < ts; i++) for (var jj = 0; jj < rs; jj++) {
      var p0 = i * (rs + 1) + jj, p1 = p0 + rs + 1;
      idx.push(p0, p1, p0 + 1, p1, p1 + 1, p0 + 1);
    }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    /* outward faces: the normal at a ring's soffit vertex must point away from the curve */
    var mid = Math.floor(ts / 2), cc = curve.getPointAt(mid / ts), q = (mid * (rs + 1) + Math.round(rs / 4)) * 3, nr = g.attributes.normal;
    if ((pos[q] - cc.x) * nr.getX(q / 3) + (pos[q + 1] - cc.y) * nr.getY(q / 3) + (pos[q + 2] - cc.z) * nr.getZ(q / 3) < 0) {
      for (i = 0; i < idx.length; i += 3) { var tmp = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = tmp; }
      g.setIndex(idx); g.computeVertexNormals();
    }
    var m = new THREE.Mesh(g, mat); m.name = name;
    return m;
  }
  /* the springer core: an octagon on the abacus, faces square to the eight ribs, from rBot at the abacus to rTop at its top, rTop
     the farthest rib's plan offset at that height over cos 22.5, so every rib leaves through its top edge, never outside it */
  function springerCore(THREE, x, z, yb, H, rBot, rTop, mat, name) {
    var g = new THREE.CylinderGeometry(rTop, rBot, H, 8); g.rotateY(Math.PI / 8);
    var m = new THREE.Mesh(g, mat); m.position.set(x, yb + H / 2, z); m.name = name;
    return m;
  }
  /* one rib of a rib grid, as the flag says; the log in every mode */
  var GRID_PIERS = null;   /* set by ribGrid for its own ribs: the free piers' plan points */
  function stemAtPiers(THREE, pts, D) {   /* option 1: an end at a free pier moves out to D in plan and rises straight to its curve */
    var atPier = function (q) { return (GRID_PIERS || []).some(function (p) { return Math.abs(p[0] - q.x) < 0.05 && Math.abs(p[1] - q.z) < 0.05; }); };
    var turn = null;
    var fix = function (a) {
      var F = a[0], dx = 0, dz = 0, k;
      for (k = 1; k < a.length; k++) { dx = a[k].x - F.x; dz = a[k].z - F.z; if (Math.hypot(dx, dz) > 1e-3) break; }
      var L = Math.hypot(dx, dz); if (!L) return a; dx /= L; dz /= L;
      var fine = new THREE.CatmullRomCurve3(a).getPoints(400), hD = null, rest = [];
      for (k = 0; k < fine.length; k++) { var o = Math.hypot(fine[k].x - F.x, fine[k].z - F.z); if (o >= D) { hD = fine[k].y; rest = fine.slice(k); break; } }
      if (hD === null) return a;
      var out = [], n = 6;
      for (k = 0; k < n; k++) out.push(new THREE.Vector3(F.x + dx * D, F.y + (hD - F.y) * k / n, F.z + dz * D));
      turn = turn === null ? hD - F.y : Math.min(turn, hD - F.y);
      var step = Math.max(1, Math.floor(rest.length / 24));
      for (k = 0; k < rest.length; k += step) out.push(rest[k]);
      if (out[out.length - 1] !== rest[rest.length - 1]) out.push(rest[rest.length - 1]);
      return out;
    };
    var a = pts.slice();
    if (atPier(a[0])) a = fix(a);
    if (atPier(a[a.length - 1])) a = fix(a.reverse()).reverse();
    return { pts: a, turn: turn };
  }
  var KIT_CUR = null;   /* set by ribGrid while it builds the kit room (gate 12) */
  function gridRib(THREE, G, log, pts, y0, y1, r0, r1, mat, name) {
    if (KIT_CUR) { ribSample(THREE, log, pts, y0, y1, r0, r1, name, null, null); gridKitRib(THREE, G, KIT_CUR, pts, /diagonal/.test(name) ? KIT_CUR.wd : KIT_CUR.wb, mat, name); return; }
    var o = RIBFOOT_OPT, org = [pts[0].clone(), pts[pts.length - 1].clone()];
    if (o && o.stem) { var st = stemAtPiers(THREE, pts, o.stem); pts = st.pts; if (st.turn !== null) log.turns.push(st.turn); }
    ribSample(THREE, log, pts, y0, y1, r0, r1, name, o, org);
    if (o && o.round) G.add(rib(THREE, pts, y0, y1, r0 * o.round, r1 * o.round, mat, name));
    else if (o) G.add(ribDeep(THREE, pts, y0, y1, r0, r1, mat, name, o));
    else G.add(rib(THREE, pts, y0, y1, r0, r1, mat, name));
  }
  /* Masonry, 21 November 2026, gate 12 (req 5982; Fawkes 20:39's yes at 10.06 pm, docs/handoff/masonry.md "Gate 12"): ?ribkit=1,
     the Entrance Hall only, off by default. Every rib of the room takes Willis's moulded section (On the Construction of the
     Vaults of the Middle Ages, 1842, fig. 4: the St Saviour's, Southwark aisle rib, 1.19 deep to its width; the outline is
     docs/masonry/rib-kit-willis.json, written by tools/masonry-rib-kit-profile.py, copied here as KIT_SECTION), 0.36 m across
     at the diagonals and 0.40 at the bay ribs (Ungewitter's rule for a 13.7 m diagonal). The frame is the rib's own plane:
     every ribGrid rib runs over one straight plan line, so its sideways axis is that line's level normal, fixed for the whole
     rib, and its depth runs in the plane square to the path, hung on the soffit side; nothing in it can twist where the path
     stands upright. Both ends capped. At a free pier the rib starts at the springer's top (Viollet-le-Duc's rule: where every
     pair of neighbouring ribs' backs have parted, 2.38 m by tools/masonry-rib-kit-foot.py), 5 mm clear of it, an honest
     joint; below that the springer is one Blender piece a pier (tools/masonry-rib-kit-springer.py, from the rings this code
     logs, so its top bed is this rib's first ring), loaded into the vault's group when it arrives. Bosses, corbels and the
     stilted bays' shafts grow to carry the deeper ribs. CastleCeilings.ribKit logs every rib's rings at the piers, its checks
     (twist, open edges, folds) and the springers' arrival. */
  var RIBKIT = /[?&]ribkit=1/.test(location.search);
  var KIT_ROOMS = { 'entrance-hall': { wd: 0.36, wb: 0.40, top: 2.38, glb: 'design/kit/eh-springers.glb?v=2' } };
  var KIT_SECTION = [[0.0,0.0],[0.275,0.0],[0.5,0.22],[0.5,0.44],[0.5,0.5],[0.44,0.505],[0.3961,0.5137],[0.4765,0.5897],[0.4991,0.6981],[0.4559,0.7999],[0.3623,0.8589],[0.2517,0.8538],[0.2,0.835],[0.12,0.83],[0.085,0.845],[0.0848,0.8943],[0.1494,0.9727],[0.1538,1.0741],[0.0963,1.1578],[0.0,1.19],[-0.0963,1.1578],[-0.1538,1.0741],[-0.1494,0.9727],[-0.0848,0.8943],[-0.085,0.845],[-0.12,0.83],[-0.2,0.835],[-0.2517,0.8538],[-0.3623,0.8589],[-0.4559,0.7999],[-0.4991,0.6981],[-0.4765,0.5897],[-0.3961,0.5137],[-0.44,0.505],[-0.5,0.5],[-0.5,0.44],[-0.5,0.22],[-0.275,0.0]];
  var KIT_DR = 1.19, KIT_GAP = 0.005;
  function kitOn(id) { return RIBKIT && KIT_ROOMS[id] ? KIT_ROOMS[id] : null; }
  function kitLog() {
    var C = (window.CastleCeilings = window.CastleCeilings || {});
    return (C.ribKit = C.ribKit || { ribs: [], rings: {}, springers: { asked: 0, loaded: 0, meshes: 0, err: null } });
  }
  /* the section's loop with each sharp corner split in two, so the arrises stay sharp and the rolls round */
  var KIT_LOOP = (function () {
    var P = KIT_SECTION, n = P.length, out = [];
    for (var i = 0; i < n; i++) {
      var a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n];
      var t1 = Math.atan2(b[1] - a[1], b[0] - a[0]), t2 = Math.atan2(c[1] - b[1], c[0] - b[0]), turn = Math.abs(Math.atan2(Math.sin(t2 - t1), Math.cos(t2 - t1)));
      out.push(i); if (turn > 0.6) out.push(i);
    }
    return out;
  })();
  /* the frame at curve parameter u: c the point, t the tangent, n the plan line's level normal, ux the depth axis (soffit side) */
  function kitFrame(THREE, curve, u, n, sgn) {
    var c = curve.getPointAt(Math.max(0, Math.min(1, u))), t = curve.getTangentAt(Math.max(0, Math.min(1, u)));
    var ux = new THREE.Vector3().crossVectors(t, n).normalize().multiplyScalar(sgn);
    return { c: c, t: t, ux: ux };
  }
  /* one kit rib over pts, swept from curve parameter u0 to u1; joint (a bay rib's half, the apex joint) adds one ring on the
     joint's plane, carried straight along the tangent of the ring next to it, at the end the half meets the other */
  function kitRib(THREE, pts, W, mat, name, u0, u1, ringsOut, joint) {
    var curve = new THREE.CatmullRomCurve3(pts), L = curve.getLength(), A = pts[0], B = pts[pts.length - 1];
    var n = new THREE.Vector3(-(B.z - A.z), 0, B.x - A.x).normalize();
    var mid = new THREE.Vector3().crossVectors(curve.getTangentAt(0.5), n), sgn = mid.y > 0 ? -1 : 1;   /* the soffit faces down at the crown */
    var S = KIT_SECTION, LP = KIT_LOOP, D = KIT_DR * W, R = LP.length, KP = kitParams(curve, u0, u1), i;
    var params = KP.us.map(function (u) { return { u: u }; });
    if (joint) { if (joint.at === 'end') params.push({ u: u1, onPlane: true }); else params.unshift({ u: u0, onPlane: true }); }
    var pos = [], uv = [], idx = [], rings = [], per = [0];
    for (var k = 1; k < R; k++) { var p0 = S[LP[k - 1]], p1 = S[LP[k]]; per.push(per[k - 1] + Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * W); }
    params.forEach(function (pr) {
      var F = kitFrame(THREE, curve, pr.u, n, sgn), ring = [];
      LP.forEach(function (pi, k) {
        var q = S[pi], v = F.c.clone().addScaledVector(n, q[0] * W).addScaledVector(F.ux, q[1] * W);
        if (pr.onPlane) kitToPlane(v, F.t, joint);
        pos.push(v.x, v.y, v.z); uv.push(pr.u * L + (pr.onPlane ? 0.01 : 0), per[k]); ring.push(v);
      });
      rings.push(ring);
    });
    var NR = rings.length;
    for (i = 0; i < NR - 1; i++) for (var k2 = 0; k2 < R; k2++) {
      var k3 = (k2 + 1) % R; if (LP[k2] === LP[k3]) continue;   /* the two halves of a split corner */
      var a = i * R + k2, b = i * R + k3, c = a + R, d = b + R;
      idx.push(a, c, b, b, c, d);
    }
    /* the caps: the section's own triangulation, flat, on the end rings' own points */
    var tri = THREE.ShapeUtils.triangulateShape(S.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), []);
    [0, NR - 1].forEach(function (ri, e) {
      var base = pos.length / 3;
      S.forEach(function (q, si) { var v = rings[ri][LP.indexOf(si)]; pos.push(v.x, v.y, v.z); uv.push(q[0] * W, q[1] * W); });
      tri.forEach(function (t3) { if (e) idx.push(base + t3[0], base + t3[1], base + t3[2]); else idx.push(base + t3[0], base + t3[2], base + t3[1]); });
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    /* outward: a soffit vertex's normal at the middle ring points away from the path; else every face turned */
    var mr = Math.floor(NR / 2), sk = LP.indexOf(S.reduce(function (m, q, j) { return q[1] > S[m][1] ? j : m; }, 0)), vi = mr * R + sk, cc = kitFrame(THREE, curve, params[mr].u, n, sgn).c;
    var nr = g.attributes.normal, P = g.attributes.position;
    if ((P.getX(vi) - cc.x) * nr.getX(vi) + (P.getY(vi) - cc.y) * nr.getY(vi) + (P.getZ(vi) - cc.z) * nr.getZ(vi) < 0) {
      for (i = 0; i < idx.length; i += 3) { var tmp = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = tmp; }
      g.setIndex(idx); g.computeVertexNormals();
    }
    if (ringsOut) ringsOut.push({ nm: name, W: W, n: [n.x, n.y, n.z], rings: rings.map(function (r) { return r.map(function (v) { return [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)]; }); }) });
    var m = new THREE.Mesh(g, mat); m.name = name; m.userData.kit = { W: W, D: D, u0: u0, u1: u1, n: [n.x, n.z], sgn: sgn, len: L, R: R, rings: NR, iR: LP.indexOf(2), iL: LP.indexOf(S.length - 2), sag: KP.sag, tris: idx.length / 3 };
    var KLs = kitLog(); KLs.sag = Math.max(KLs.sag || 0, KP.sag); KLs.tris = (KLs.tris || 0) + idx.length / 3;
    return m;
  }
  /* the apex joint (gate 12, FAIL A of the fold check, 10.35 pm: a bay rib's deep section folded over itself at its pointed
     crown, where the spline rounds the apex over one segment, a bend tighter than the rib is deep): a bay rib is two halves
     meeting on the plane through its highest point square to its plan line; each half is swept up to one segment short of the
     apex and carried straight on along its own tangent to that plane, as a mason cuts the apex joint */
  function kitToPlane(v, t, joint) {
    var e = (v.x - joint.o.x) * joint.d.x + (v.y - joint.o.y) * joint.d.y + (v.z - joint.o.z) * joint.d.z, td = t.x * joint.d.x + t.y * joint.d.y + t.z * joint.d.z;   /* the plane may lean (gate 15's mitre) */
    if (Math.abs(td) > 1e-4) v.addScaledVector(t, -e / td);
    return v;
  }
  /* gate 12, the fps cure (Fawkes 20:39, 11.11 pm; FAIL A of the fps mark: 476k triangles from rings every 12 cm): the rings of
     a sweep from u0 to u1 placed by the path's own sag: the next ring is the farthest along whose straight run from the last
     stays within KIT_SAG of the path (the silhouette's budget, 10 mm, about a pixel at the nearest pier from view A), both ends
     always; the largest sag is logged (the silhouette check) */
  var KIT_SAG = 0.010;
  function kitParams(curve, u0, u1) {
    var L = curve.getLength(), N = Math.max(40, Math.ceil(Math.abs(u1 - u0) * L / 0.02)), us = [], i;
    for (i = 0; i <= N; i++) us.push(Math.min(1, Math.max(0, u0 + (u1 - u0) * i / N)));   /* gate 15: a hair over 1 throws in getPointAt */
    var P = us.map(function (u) { return curve.getPointAt(u); }), out = [u0], last = 0, sag = 0;
    var sagOf = function (i0, i1) {
      var m = 0;
      for (var j = i0 + 1; j < i1; j++) m = Math.max(m, P[j].distanceTo(P[i0].clone().lerp(P[i1], (j - i0) / (i1 - i0))));
      return m;
    };
    while (last < N) {
      var nx = last + 1;
      while (nx + 1 <= N && sagOf(last, nx + 1) <= KIT_SAG) nx++;
      sag = Math.max(sag, sagOf(last, nx)); out.push(us[nx]); last = nx;
    }
    return { us: out, sag: sag };
  }
  /* the curve parameter where the path, from its end at a free pier, first stands h over that end */
  function kitCut(THREE, curve, fromEnd, h) {
    var y0 = curve.getPointAt(fromEnd).y;
    for (var i = 0; i <= 2000; i++) { var u = fromEnd ? 1 - i / 2000 : i / 2000; if (curve.getPointAt(u).y - y0 >= h) return u; }
    return fromEnd ? 0 : 1;
  }
  /* a rib of the kit room: cut at the springer's top where an end stands on a free pier; the springer's own part logged as
     rings from 0.25 m below the abacus (carried on along the tangent, so the bed cut is clean) up to the cut, for Blender */
  function gridKitRib(THREE, G, K, pts, W, mat, name) {
    var curve = new THREE.CatmullRomCurve3(pts), L = curve.getLength(), KL = kitLog(), u0 = 0, u1 = 1;
    var atPier = function (q) { return (GRID_PIERS || []).some(function (p) { return Math.abs(p[0] - q.x) < 0.05 && Math.abs(p[1] - q.z) < 0.05; }); };
    var ends = [atPier(pts[0]), atPier(pts[pts.length - 1])];
    if (ends[0]) { u0 = kitCut(THREE, curve, 0, K.top); KL.rings[name + ':0'] = kitSpringerPart(THREE, pts, W, 0, u0); u0 += KIT_GAP / L; }
    if (ends[1]) { u1 = kitCut(THREE, curve, 1, K.top); KL.rings[name + ':1'] = kitSpringerPart(THREE, pts, W, 1, u1); u1 -= KIT_GAP / L; }
    var m;
    if (/wall-rib/.test(name)) {   /* a bay rib: the apex joint */
      var ua = u0, ya = -1e9;
      for (var i = 0; i <= 600; i++) { var u = u0 + (u1 - u0) * i / 600, y = curve.getPointAt(u).y; if (y > ya) { ya = y; ua = u; } }
      var o = curve.getPointAt(ua), A = pts[0], B = pts[pts.length - 1], dl = Math.hypot(B.x - A.x, B.z - A.z), dir = new THREE.Vector3((B.x - A.x) / dl, 0, (B.z - A.z) / dl);
      /* gate 15 (Masonry, 22 November 2026; Godric's 1 on the rib card: "The ribs appear broken near the apex"): each half is
         its own curve, from its springing to the crown's control point, so neither rounds over the crown (the one curve
         through the crown rounded it, and the halves cut short of that rounding and run on along their tangents met the old
         upright joint 7 to 104 mm apart); each half is swept to dl short of the crown, dl the rib's depth times the tangent of
         half the angle the halves turn through there (so its last ring stands wholly behind the joint), then carried straight
         to the plane where the two straight runs cross, square to neither (it bisects them: a mitre), so the two end rings
         are one. A pier end starts on the whole curve's own cut, where the springer's part ends */
      var kc = 0; for (var q = 1; q < pts.length - 1; q++) if (pts[q].y > pts[kc].y) kc = q;
      var pa = pts.slice(0, kc + 1), pb = pts.slice(kc), cA = new THREE.CatmullRomCurve3(pa), cB = new THREE.CatmullRomCurve3(pb), La = cA.getLength(), Lb = cB.getLength();
      var onHalf = function (c, yc, lo, hi) {   /* the parameter on a half where it stands at height yc, lo its low end, hi its crown end (one rising side) */
        for (var it = 0; it < 50; it++) { var mid = (lo + hi) / 2; if (c.getPointAt(mid).y < yc) lo = mid; else hi = mid; }
        return (lo + hi) / 2;
      };
      var a0 = 0, b1 = 1, J = { nm: name };
      if (ends[0]) { var Pc0 = curve.getPointAt(u0 - KIT_GAP / L); a0 = onHalf(cA, Pc0.y, 0, 1) + KIT_GAP / La; J.bed0 = cA.getPointAt(a0 - KIT_GAP / La).distanceTo(Pc0); }
      if (ends[1]) { var Pc1 = curve.getPointAt(u1 + KIT_GAP / L); b1 = onHalf(cB, Pc1.y, 1, 0) - KIT_GAP / Lb; J.bed1 = cB.getPointAt(b1 + KIT_GAP / Lb).distanceTo(Pc1); }
      var ea = cA.getTangentAt(1), eb = cB.getTangentAt(0), th = Math.acos(Math.max(-1, Math.min(1, ea.dot(eb)))) / 2, dl = KIT_DR * W * Math.tan(th) + 0.02;
      var ca = 1 - dl / La, cb = dl / Lb;
      var Pa = cA.getPointAt(ca), ta = cA.getTangentAt(ca), Pb = cB.getPointAt(cb), tb = cB.getTangentAt(cb);
      var sa = Pa.x * dir.x + Pa.z * dir.z, sb = Pb.x * dir.x + Pb.z * dir.z, ka = ta.x * dir.x + ta.z * dir.z, kb = tb.x * dir.x + tb.z * dir.z;
      var det = ka * (-tb.y) + kb * ta.y, lam = ((sb - sa) * (-tb.y) + kb * (Pb.y - Pa.y)) / det;
      var X = Pa.clone().addScaledVector(ta, lam), N = ta.clone().add(tb).normalize();
      J.X = [X.x, X.y, X.z]; J.crown = [pts[kc].x, pts[kc].y, pts[kc].z]; J.dl = dl; J.th = th;
      (KL.joints = KL.joints || []).push(J);
      var m1 = kitRib(THREE, pa, W, mat, name + '-a', a0, ca, null, { o: X, d: N, at: 'end' }), m2 = kitRib(THREE, pb, W, mat, name + '-b', cb, b1, null, { o: X, d: N.clone().negate(), at: 'start' });
      G.add(m1); G.add(m2); m = m1;
      KL.ribs.push({ nm: name, W: W, u0: u0, u1: u1, apex: ua, piers: ends });
    } else {
      m = kitRib(THREE, pts, W, mat, name, u0, u1, null); G.add(m);
      KL.ribs.push({ nm: name, W: W, u0: u0, u1: u1, piers: ends });
    }
    return m;
  }
  /* the springer's share of one rib: rings of the section from 0.25 m past the pier end to the cut, in the vault group's frame */
  function kitSpringerPart(THREE, pts, W, end, uc) {
    var curve = new THREE.CatmullRomCurve3(pts), A = pts[0], B = pts[pts.length - 1], S = KIT_SECTION;
    var n = new THREE.Vector3(-(B.z - A.z), 0, B.x - A.x).normalize(), mid = new THREE.Vector3().crossVectors(curve.getTangentAt(0.5), n), sgn = mid.y > 0 ? -1 : 1;
    var KP = end ? kitParams(curve, 1, uc) : kitParams(curve, 0, uc), us = KP.us, rings = [];
    var F0 = kitFrame(THREE, curve, end ? 1 : 0, n, sgn), back = F0.t.clone().multiplyScalar(end ? 0.25 : -0.25);
    rings.push(S.map(function (q) { var v = F0.c.clone().add(back).addScaledVector(n, q[0] * W).addScaledVector(F0.ux, q[1] * W); return [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)]; }));
    us.forEach(function (u) {
      var F = kitFrame(THREE, curve, u, n, sgn);
      rings.push(S.map(function (q) { var v = F.c.clone().addScaledVector(n, q[0] * W).addScaledVector(F.ux, q[1] * W); return [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)]; }));
    });
    return { W: W, end: end, uc: uc, bedY: curve.getPointAt(end ? 1 : 0).y, sag: KP.sag, rings: rings };
  }
  /* a boss deep enough to show below the kit's soffits where the ribs cross: a drum from the web down past the deepest rib */
  function kitBoss(THREE, beast, x, y, z, r, H, mat, name) {
    var G = boss(THREE, beast, x, y, z, r, mat, name), body = G.children[0], face = G.children[1];
    body.geometry.dispose(); body.geometry = new THREE.CylinderGeometry(r * 0.85, r, H, 24); body.position.set(x, y - H / 2 + 0.02, z);
    face.position.set(x, y - H + 0.02 - 0.005, z);
    return G;
  }
  /* the springers, one Blender piece a pier, put into the vault's group when they arrive, in the room's stone */
  /* gate 17 (Godric's 1 on the rib card, 21 November 2026: a carved capital carrying all three rib ends): every stilt
     shaft under ?ribkit=1 ends in one turned capital, the section of F. A. Paley, A Manual of Gothic Moldings (1891),
     pl. X, fig. 5, Walesby: neck 0.24 D high projecting 0.17 D, bell 1.19 D flaring to 0.54 D, abacus 0.44 D high
     projecting 0.69 D, round in plan (Paley p. 74, the English rule), D the shaft's diameter. Its abacus is never smaller
     than the farthest point of the kit rib ends it carries plus 30 mm (Willis 1842 fig. 6: the abacus is every rib's bed).
     Closed (the profile starts and ends on the axis); its top 12 mm over the shaft's own, so no two faces share a plane.
     Its back is flattened 20 mm inside each wall its shaft stands against, so it never shows past a thin wall or in an opening.
     ?capk= scales its radii about the axis, for the gate's known cases only. */
  var CAPK = +((/[?&]capk=([\d.]+)/.exec(location.search) || [])[1] || 1);
  function kitCapitals(THREE, G, shafts, mat, id) {
    G.updateMatrixWorld(true);
    var inv = new THREE.Matrix4().copy(G.matrixWorld).invert(), ends = [], out = [];
    G.traverse(function (o) {
      if (!o.isMesh || !o.userData.kit) return;
      var K = o.userData.kit, P = o.geometry.attributes.position, R = K.R, M = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      [0, K.rings - 1].forEach(function (ri) { for (var k = 0; k < R; k++) ends.push(new THREE.Vector3(P.getX(ri * R + k), P.getY(ri * R + k), P.getZ(ri * R + k)).applyMatrix4(M)); });
    });
    shafts.forEach(function (sh, n) {
      var rs = sh.r, D = 2 * rs, hN = 0.24 * D, hB = 1.19 * D, hA = 0.44 * D, H = hN + hB + hA, top = sh.top + 0.012, need = 0;
      ends.forEach(function (v) { if (Math.abs(v.y - sh.top) < 1.0) { var d = Math.hypot(v.x - sh.x, v.z - sh.z); if (d < 0.8) need = Math.max(need, d); } });
      var rA = Math.max(rs + 0.69 * D, need + 0.03), pts = [[0, 0], [rs * 0.98, 0], [rs + 0.1 * D, 0.04 * D], [rs + 0.17 * D, 0.12 * D], [rs + 0.1 * D, 0.2 * D], [rs, hN]];
      for (var t = 1; t <= 6; t++) pts.push([rs + 0.54 * D * (t / 6) * (t / 6), hN + hB * t / 6]);
      pts.push([rA, hN + hB], [rA, H - 0.06 * D], [rA - 0.03 * D, H], [0, H]);
      var g = turned(THREE, pts.map(function (q) { return [q[0] * CAPK, q[1]]; }), 32), P = g.attributes.position;
      for (var vi = 0; vi < P.count; vi++) {   /* its back flattened 20 mm inside each wall the shaft stands against */
        if (sh.wx !== null) { var lx = sh.wx - sh.x + Math.sign(sh.wx - sh.x) * 0.02; if ((P.getX(vi) - lx) * Math.sign(lx) > 0) P.setX(vi, lx); }
        if (sh.wz !== null) { var lz = sh.wz - sh.z + Math.sign(sh.wz - sh.z) * 0.02; if ((P.getZ(vi) - lz) * Math.sign(lz) > 0) P.setZ(vi, lz); }
      }
      g.computeVertexNormals();
      var m = new THREE.Mesh(g, mat);
      m.position.set(sh.x, top - H, sh.z); m.name = id + '-shaft-capital-' + n; G.add(m);
      out.push({ n: n, at: [+sh.x.toFixed(3), +top.toFixed(3), +sh.z.toFixed(3)], rA: +(rA * CAPK).toFixed(3), need: +need.toFixed(3), H: +H.toFixed(3) });
    });
    kitLog().capitals = out;
  }
  function kitSpringers(THREE, G, K, mat) {
    var KL = kitLog(); KL.springers.asked++;
    var go = function () {
      new THREE.GLTFLoader().load(K.glb, function (g) {
        g.scene.updateMatrixWorld(true);
        var list = []; g.scene.traverse(function (o) { if (o.isMesh) list.push(o); });
        list.forEach(function (o) {
          var m = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), mat); m.name = 'kit-' + o.name;
          if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
          G.add(m); KL.springers.meshes++;
        });
        KL.springers.loaded++;
      }, undefined, function (e) { KL.springers.err = String(e && e.message || e); console.error('ribkit: ' + K.glb + ' did not load'); });
    };
    if (THREE.GLTFLoader) return go();
    var s = document.createElement('script'); s.src = 'people/GLTFLoader.js'; s.onload = go;
    s.onerror = function () { KL.springers.err = 'GLTFLoader.js'; console.error('ribkit: GLTFLoader.js did not load'); };
    document.head.appendChild(s);
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

  /* a clustered pier (req 3284, the Entrance Hall's, model v308): a 1.0 square core with a round shaft of 0.7 on each
     face (a quatrefoil 1.4 across), a base block, a capital ring where the ribs spring, and a springing block */
  function clusterPier(THREE, x, z, y0, top, mat, name) {
    /* gate 6: one octagonal plinth and one octagonal abacus over a core, four shafts each turned with its own base and
       capital (column), as a clustered pier of the thirteenth century */
    var P = new THREE.Group(), ba = 0.28, ab = 0.14, yb = y0 + ba, yt = y0 + top - ab;
    var add = function (g, px, py, pz) { var m = new THREE.Mesh(g, mat); m.position.set(px, py, pz); P.add(m); };
    add(octagon(THREE, 1.02, ba), x, y0 + ba / 2, z);
    add(new THREE.CylinderGeometry(0.5, 0.5, yt - yb + 0.02, 16, 1, true), x, (yb + yt) / 2, z);
    [[0.42, 0], [-0.42, 0], [0, 0.42], [0, -0.42]].forEach(function (o) { column(THREE, P, mat, x + o[0], z + o[1], yb, yt, 0.3); });
    add(octagon(THREE, 1.08, ab), x, yt + ab / 2, z);
    P.name = name;
    return P;
  }

  /* a rib vault on a grid of piers (req 3284): the model's piers give the bay lines, every cell between them is one
     rib-vaulted bay (a pointed groin web, two diagonals, a rib on every bay line, a beast boss); every bay rises alike
     from the springing to the crown over its own span, so neighbours meet along their lines. vault.bays[] names a bay
     stilted (rect, springs, profile): provisional, its web is lifted toward the wall corner it stands on, from 0 at
     its pier and wall-pier sides to the full stilt there, so it still meets its neighbours along its open sides, and a
     shaft carries the springing at that corner */
  function ribGrid(THREE, Q, B, mats, toLocal) {
    var G = new THREE.Group(), V = Q.rec.vault, K = bays(Q, B, toLocal), H = heights(Q, 0), rise = H.crown - H.springs;
    var y = B.y + H.springs, top = B.y + H.crown, beasts = (window.LumosCarving || {}).BEASTS || ['lion', 'eagle', 'badger', 'snake'];
    GRID_PIERS = K.piers;
    var KR = kitOn(Q.id); KIT_CUR = KR; if (KR) { kitLog().piers = K.piers.slice(); kitLog().springs = y; kitLog().room = Q.id; }
    var rr = 0.11, k = 0, shaftN = 0, stilts = [], shafts = [], RF = ribFootLog(Q.id), smooth = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
    (V.bays || []).forEach(function (b) {
      if (!b.rect) return;
      var a = toLocal(b.rect[0], b.rect[1], Q.floor), c = toLocal(b.rect[2], b.rect[3], Q.floor);
      stilts.push({ x0: Math.min(a.x, c.x), x1: Math.max(a.x, c.x), z0: Math.min(a.z, c.z), z1: Math.max(a.z, c.z), lift: (b.springs || H.springs) - H.springs });
    });
    for (var i = 1; i < K.xs.length; i++) for (var j = 1; j < K.zs.length; j++) (function (x0, x1, z0, z1) {
      var mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ax = (x1 - x0) / 2, az = (z1 - z0) / 2, mid = (x0 + x1 + z0 + z1) / 4;
      var st = stilts.filter(function (s) { return s.x0 - 0.1 <= x0 && s.x1 + 0.1 >= x1 && s.z0 - 0.1 <= z0 && s.z1 + 0.1 >= z1; })[0];
      var PT = KR ? pointed4 : pointed, base = function (x, z) { return Math.max(PT(az, rise, z - mz), PT(ax, rise, x - mx)); };
      var h = base;
      if (st) {
        /* req 3305: a stilt rect may hold several bays (an aisle whole). Its web is lifted toward the outer wall(s) of the
           rect (the sides with no pier line beyond them), measured across the rect, so every bay of it lifts alike along
           the wall and neighbours still meet along the open pier side, where the lift is 0; the end walls lift the web
           fully too. Shafts carry the springing from the nave's 5.0 to the aisle's own at each bay corner on the wall. */
        var ex = st.x1 >= B.x1 - 0.1 ? 1 : st.x0 <= B.x0 + 0.1 ? -1 : 0, ez = st.z1 >= B.z1 - 0.1 ? 1 : st.z0 <= B.z0 + 0.1 ? -1 : 0;
        if (ex) ez = 0;
        h = function (x, z) {
          var tx = ex > 0 ? (x - st.x0) / (st.x1 - st.x0) : ex < 0 ? (st.x1 - x) / (st.x1 - st.x0) : 0;
          var tz = ez > 0 ? (z - st.z0) / (st.z1 - st.z0) : ez < 0 ? (st.z1 - z) / (st.z1 - st.z0) : 0;
          var b = base(x, z), w = smooth(Math.max(tx, tz));
          return b + st.lift * (1 - b / rise) * w;
        };
        var sx = ex > 0 ? st.x1 - 0.2 : ex < 0 ? st.x0 + 0.2 : null, sz = ez > 0 ? st.z1 - 0.2 : ez < 0 ? st.z0 + 0.2 : null;
        var zsft = ex ? (Math.abs(z1 - st.z1) < 0.1 ? [z0, z1] : [z0]) : [sz], xsft = ex ? [sx] : [x0, x1];
        zsft.forEach(function (zz) { xsft.forEach(function (xx) {
          var cz = ex ? (Math.abs(zz - st.z0) < 0.1 ? zz + 0.2 : Math.abs(zz - st.z1) < 0.1 ? zz - 0.2 : zz) : zz;
          var cx = ex ? xx : (Math.abs(xx - st.x0) < 0.1 ? xx + 0.2 : Math.abs(xx - st.x1) < 0.1 ? xx - 0.2 : xx);
          var sh = new THREE.Mesh(new THREE.CylinderGeometry(KR ? 0.22 : 0.13, KR ? 0.24 : 0.15, st.lift + 0.1, 12), mats.stone);
          sh.position.set(cx, y + st.lift / 2 - 0.05, cz); sh.name = Q.id + '-stilt-shaft-' + i + '-' + j + '-' + shaftN++; G.add(sh);
          if (KR) shafts.push({ x: cx, z: cz, top: y + st.lift, r: 0.22, wx: ex ? (ex > 0 ? st.x1 : st.x0) : (cx !== xx ? xx : null), wz: ez ? (ez > 0 ? st.z1 : st.z0) : (cz !== zz ? zz : null) });
        }); });
      }
      var w = field(THREE, x0, x1, z0, z1, y, h, mats.vault, SEG); w.name = Q.id + '-web-' + i + '-' + j; G.add(w);
      gridRib(THREE, G, RF, line(THREE, [x0, z0], [x1, z1], y, h), y, top, rr * 1.3, rr, mats.stone, Q.id + '-diagonal-' + i + '-' + j + 'a');
      gridRib(THREE, G, RF, line(THREE, [x1, z0], [x0, z1], y, h), y, top, rr * 1.3, rr, mats.stone, Q.id + '-diagonal-' + i + '-' + j + 'b');
      /* the bay lines: one rib on each interior line, drawn by the bay on its low side (x0 / z0 side owns it) */
      if (i > 1) gridRib(THREE, G, RF, line(THREE, [x0, z0], [x0, z1], y, h), y, top, rr * 1.4, rr * 1.1, mats.stone, Q.id + '-wall-rib-x' + i + '-' + j);
      if (j > 1) gridRib(THREE, G, RF, line(THREE, [x0, z0], [x1, z0], y, h), y, top, rr * 1.4, rr * 1.1, mats.stone, Q.id + '-wall-rib-z' + i + '-' + j);
      if (KR) G.add(kitBoss(THREE, beasts[k++ % 4], mx, y + h(mx, mz), mz, 0.34, KIT_DR * KR.wb + 0.1, mats.stone, Q.id + '-boss-' + i + '-' + j));
      else G.add(boss(THREE, beasts[k++ % 4], mx, y + h(mx, mz), mz, Math.max(0.16, Math.min(0.3, Math.min(ax, az) * 0.09)), mats.stone, Q.id + '-boss-' + i + '-' + j));
    })(K.xs[i - 1], K.xs[i], K.zs[j - 1], K.zs[j]);
    K.piers.forEach(function (p, n) { G.add(clusterPier(THREE, p[0], p[1], B.y, H.springs, mats.stone, Q.id + '-pier-' + n)); });
    if (RIBFOOT_OPT && RIBFOOT_OPT.core) K.piers.forEach(function (p, n) {   /* gate 11, option 1: the core between the stems, upright, to the lowest turn */
      var CH = Math.max(0.6, Math.min.apply(null, RF.turns.length ? RF.turns : [1.2]) - 0.1), R = RIBFOOT_OPT.stem / Math.cos(Math.PI / 8);
      G.add(springerCore(THREE, p[0], p[1], y - 0.02, CH, R, R, mats.stone, Q.id + '-springer-core-' + n));
      RF.cores.push({ n: n, at: [p[0], y - 0.02, p[1]], h: +CH.toFixed(3), rBot: +R.toFixed(3), rTop: +R.toFixed(3) });
    });
    if (KR) { kitSpringers(THREE, G, KR, mats.stone); kitCapitals(THREE, G, shafts, mats.stone, Q.id); }
    GRID_PIERS = null; KIT_CUR = null;
    /* gate 6: every bay line's springing on a wall carried by a moulded corbel at the nave's springing, deep enough to
       stand a stilted bay's shaft (0.2 off the wall) on it; on the diagonal at the corners */
    var log = carryLogFor(Q.id), CD = KR ? 0.54 : 0.38, CWg = KR ? 0.9 : 0.5, near = function (a, b) { return Math.abs(a - b) < 0.05; };
    K.xs.forEach(function (x, i) {
      var end = near(x, B.x0) ? 1 : near(x, B.x1) ? -1 : 0;
      [[B.z0, 1], [B.z1, -1]].forEach(function (w, s) {
        corbelAt(THREE, G, mats.dress || mats.stone, x, w[0], end, w[1], y + 0.02, end ? CD * 1.2 : CD, 0.5, end ? cornerW(CD * 1.2, CWg) : CWg, Q.id + '-springer-corbel-x' + i + (s ? 'b' : 'a'), log, !!end);
      });
    });
    K.zs.forEach(function (z, j) {
      if (near(z, B.z0) || near(z, B.z1)) return;   /* the corners, set above */
      [[B.x0, 1], [B.x1, -1]].forEach(function (w, s) {
        corbelAt(THREE, G, mats.dress || mats.stone, w[0], z, w[1], 0, y + 0.02, CD, 0.5, CWg, Q.id + '-springer-corbel-z' + j + (s ? 'b' : 'a'), log);
      });
    });
    return { group: G, flat: false, springs: H.springs, crown: H.crown, bays: (K.xs.length - 1) * (K.zs.length - 1), piers: K.piers.length, stilted: stilts.length };
  }

  /* a rib vault: bays along the long side, about square, the webs a pointed groin, a transverse rib between bays,
     the two diagonals across each, and the beast's boss where they cross, lion, eagle, badger and snake in turn */
  /* Masonry (17 November 2026, gate 6, row 5869): the carrier at a rib's springing, shared by every ribbed kind.
     ogeeGeo is starVault's corbel profile lifted out of its closure (an ogee from depth D at its top to 4 cm at its foot,
     swept W along the wall, its back 2 cm inside the wall); corbelAt sets one at a wall point (x, z) in the vault's frame,
     facing the room along (ox, oz), its top yTop 2 cm up into the rib above it. ?carry=none leaves the springings bare
     (the before). Every springing and every carrier is counted in CastleCeilings.carryLogs[room] */
  function ogeeGeo(THREE, D, Hc, W, steps) {
    var sh = new THREE.Shape(), n = steps || 14, t, d;
    sh.moveTo(-0.02, 0.02); sh.lineTo(D, 0.02); sh.lineTo(D, -0.08); sh.lineTo(D - 0.03, -0.1);
    for (var i = 1; i <= n; i++) { t = i / n; d = 0.04 + (D - 0.07) * (1 - t * t * (3 - 2 * t)); sh.lineTo(d, -0.1 - (Hc - 0.18) * t); }
    sh.lineTo(0.04, -Hc + 0.04); sh.quadraticCurveTo(0.06, -Hc, 0.0, -Hc); sh.lineTo(-0.02, -Hc); sh.closePath();
    var g = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -W / 2); return g;
  }
  function carryMode() { return (/[?&]carry=(\w+)/.exec(location.search) || [])[1] || 'shaft'; }
  function carryLogFor(id) {
    var C = (window.CastleCeilings = window.CastleCeilings || {}), L = C.carryLogs = C.carryLogs || {};
    return (L[id] = L[id] || { springings: 0, carried: 0 });
  }
  /* v19 (row 5869, the blind look of 17 November, 11.20 pm): a corner corbel is set on the diagonal, so a block narrower
     than twice its depth left its front corners clear of both walls, a gap seen from the floor. v20 (the advisor, 11.35 pm:
     v19's wide block buried up to 0.33 m into each wall, through a thin partition): a corner corbel is drawn at least
     2 D + 4 cm wide and its sides then clamped onto the two wall planes (corbelAt's corner), a true corner corbel. */
  function cornerW(D, W) { return Math.max(W, 2 * D + 0.04); }
  function corbelAt(THREE, G, mat, x, z, ox, oz, yTop, D, Hc, W, name, log, corner) {
    log.springings++;
    if (carryMode() === 'none') return null;
    var out = new THREE.Vector3(ox, 0, oz).normalize(), up = new THREE.Vector3(0, 1, 0), along = new THREE.Vector3().crossVectors(out, up);
    var g = ogeeGeo(THREE, D, Hc, W);
    if (corner) {   /* v20: its sides laid on the two wall planes (|along| = out + 2 cm), so it fills the corner and buries 1.4 cm */
      var P = g.attributes.position;
      for (var i = 0; i < P.count; i++) { var a = P.getZ(i), lim = Math.max(P.getX(i), 0) + 0.02; if (Math.abs(a) > lim) P.setZ(i, a < 0 ? -lim : lim); }
      g.computeVertexNormals();
    }
    g.applyMatrix4(new THREE.Matrix4().makeBasis(out, up, along).setPosition(x, yTop - 0.02, z));
    var m = new THREE.Mesh(g, mat); m.name = name; m.userData.carrier = true; G.add(m); log.carried++;
    /* v22: where it stands and which way it faces (the ceiling group's frame, the shell's), kept in the room's carry log, since
       the scene merges meshes and drops their userData; tools/masonry-bearing.js casts back into the wall it claims */
    (log.list = log.list || []).push({ name: name, at: [x, yTop, z], out: [out.x, out.z], corner: !!corner });
    return m;
  }

  /* v25 (req 5869, gate 8, Masonry, 21 November 2026): the openings on a room's walls arrive from the shell as opts.openings
     (the Architect's req 5945: per wall edge, a and b the span's ends in this frame, sill and head as heights). A corbel's
     footprint (u +/- half along the wall, from yTop - Hc to yTop) stands over a void where one of them overlaps it; ribVault moves
     each inner bay line to the nearest place 0.3 clear of the cuts (a window's trim stands proud of its edge: the blind look of 21 Nov saw a corbel against it at 0.05) so no corbel hangs over a window or door (?openfit=none leaves them, the before) */
  function flatOps(ops) { return [].concat.apply([], ops || []).filter(function (op) { return op && op.a && op.b; }); }
  function overVoid(ops, alongX, wallC, u, half, yTop, Hc) {
    return ops.some(function (op) {
      if (Math.abs(alongX ? op.a[1] - wallC : op.a[0] - wallC) > 0.4) return false;
      var lo = alongX ? Math.min(op.a[0], op.b[0]) : Math.min(op.a[1], op.b[1]), hi = alongX ? Math.max(op.a[0], op.b[0]) : Math.max(op.a[1], op.b[1]);
      return u + half > lo && u - half < hi && op.sill < yTop && op.head > yTop - Hc;
    });
  }
  function ribVault(THREE, Q, B, mats, toLocal, opts) {
    var VV = Q.rec && Q.rec.vault;
    if (toLocal && VV && VV.piers && VV.piers.length && Array.isArray(VV.piers[0])) return ribGrid(THREE, Q, B, mats, toLocal);
    var G = new THREE.Group(), alongX = B.x1 - B.x0 >= B.z1 - B.z0, L = alongX ? B.x1 - B.x0 : B.z1 - B.z0;
    var wide = alongX ? B.z1 - B.z0 : B.x1 - B.x0, n = Math.max(1, Math.round(L / wide)), H = heights(Q, wide / 2), rise = H.crown - H.springs;
    var y = B.y + H.springs, top = B.y + H.crown, beasts = (window.LumosCarving || {}).BEASTS || ['lion', 'eagle', 'badger', 'snake'];
    var rr = Math.max(0.07, Math.min(0.14, wide * 0.025));
    var cuts = [], fitLog = carryLogFor(Q.id), ops = /[?&]openfit=none/.test(location.search) ? [] : flatOps(opts && opts.openings);
    var cHalf = (rr * 3.2 + 0.1) / 2, w0 = alongX ? B.z0 : B.x0, w1 = alongX ? B.z1 : B.x1, yT = y + 0.02;
    function wallsClear(u, m) { return !overVoid(ops, alongX, w0, u, cHalf + m, yT, 0.45) && !overVoid(ops, alongX, w1, u, cHalf + m, yT, 0.45); }
    for (var cj = 0; cj <= n; cj++) {
      var cu = (alongX ? B.x0 : B.z0) + cj * L / n;
      if (ops.length && cj > 0 && cj < n && !wallsClear(cu, 0.3)) {
        var moved = false;
        /* first 0.3 clear of every cut, else 0.05 (a window's trim stands proud of its edge) */
        [0.3, 0.05].forEach(function (mg) {
          if (mg < 0.1 && wallsClear(cu, 0.05)) return;   /* already clear of the cuts themselves: keep the bay line */
          for (var dd = 0.05; dd <= 0.4 * L / n && !moved; dd += 0.05) [dd, -dd].forEach(function (d2) { if (!moved && wallsClear(cu + d2, mg)) { cu += d2; moved = true; } });
        });
        if (moved) fitLog.shifted = (fitLog.shifted || 0) + 1; else if (!wallsClear(cu, 0.05)) fitLog.stillOver = (fitLog.stillOver || 0) + 1;
      }
      cuts.push(cu);
    }
    for (var i = 0; i < n; i++) {
      var a0 = cuts[i], a1 = cuts[i + 1];
      var x0 = alongX ? a0 : B.x0, x1 = alongX ? a1 : B.x1, z0 = alongX ? B.z0 : a0, z1 = alongX ? B.z1 : a1;
      var mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ax = (x1 - x0) / 2, az = (z1 - z0) / 2;
      var h = (function (mx, mz, ax, az) { return function (x, z) { return Math.max(pointed(az, rise, z - mz), pointed(ax, rise, x - mx)); }; })(mx, mz, ax, az);
      var w = field(THREE, x0, x1, z0, z1, y, h, mats.vault, SEG); w.name = Q.id + '-web-' + i; G.add(w);
      G.add(rib(THREE, line(THREE, [x0, z0], [x1, z1], y, h), y, top, rr * 1.3, rr, mats.stone, Q.id + '-diagonal-' + i + 'a'));
      G.add(rib(THREE, line(THREE, [x1, z0], [x0, z1], y, h), y, top, rr * 1.3, rr, mats.stone, Q.id + '-diagonal-' + i + 'b'));
      if (i) G.add(rib(THREE, alongX ? line(THREE, [x0, z0], [x0, z1], y, h) : line(THREE, [x0, z0], [x1, z0], y, h), y, top, rr * 1.4, rr * 1.1, mats.stone, Q.id + '-transverse-' + i));
      G.add(boss(THREE, beasts[i % 4], mx, top, mz, Math.max(0.16, Math.min(0.32, wide * 0.06)), mats.stone, Q.id + '-boss-' + i));
    }
    /* gate 6: every springing carried, a moulded corbel under each bay line's ribs on both long walls, set on the
       diagonal at the room's corners (a corner's diagonal rib lands there alone) */
    var log = carryLogFor(Q.id), D = Math.max(0.18, rr * 2.4), CW = rr * 3.2 + 0.1;
    for (var j = 0; j <= n; j++) {
      var u = cuts[j], end = j === 0 ? 1 : j === n ? -1 : 0;
      [[alongX ? B.z0 : B.x0, 1], [alongX ? B.z1 : B.x1, -1]].forEach(function (w, s) {
        var x = alongX ? u : w[0], z = alongX ? w[0] : u, ox = alongX ? end : w[1], oz = alongX ? w[1] : end;
        corbelAt(THREE, G, mats.dress || mats.stone, x, z, ox, oz, y + 0.02, end ? D * 1.2 : D, 0.45, end ? cornerW(D * 1.2, CW) : CW, Q.id + '-springer-corbel-' + j + (s ? 'b' : 'a'), log, !!end);
      });
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
      var g = new THREE.BoxGeometry(alongX ? SPRING_W : d, SPRING_H, alongX ? d : SPRING_W), m = new THREE.Mesh(g, mats.dress || mats.stone);
      var p = P(Math.min(Math.max(u, lines[0] + SPRING_W / 2 - 0.02), lines[lines.length - 1] - SPRING_W / 2 + 0.02), v0 + dir * d / 2);
      m.position.set(p[0], y + SPRING_H / 2 - 0.1, p[1]); m.name = Q.id + '-springer-' + nm; G.add(m);
      carry(p, dir, y - 0.1, nm);
    };
    /* Masonry (17 November 2026, gate 4; Godric's walk: the springers hung as boxes): every springer is carried. 'corbel'
       (?carry=corbel): a moulded corbel under it, an ogee from the springer's face back into the wall over CORB_H; 'shaft' (the
       bold, the default provisionally till Godric's eye, Masonry's 1 on the card): a vaulting shaft with its capital under the springer, standing on a smaller corbel at SHAFT_FROM
       over the floor (the hall's fireplaces stand under two piers, so no shaft runs to the floor); 'none' (?carry=none):
       today's bare box, for the before. Each piece bears 2 cm into its wall and 2 cm up into the stone above, so no face
       lies in another's plane; named '-springer-' so the vault's fade leaves them solid */
    var CARRY = (/[?&]carry=(\w+)/.exec(location.search) || [])[1] || 'shaft';
    var CORB_H = 0.95, SHAFT_FROM = Math.min(6.0, H.springs - 2.5), SHAFT_R = 0.15;
    function placeIn(g, p, dir, yb) {   /* a piece drawn with x out of the wall, y up, z along it, set at the wall point p */
      var out = alongX ? new THREE.Vector3(0, 0, dir) : new THREE.Vector3(dir, 0, 0), up = new THREE.Vector3(0, 1, 0);
      var along = new THREE.Vector3().crossVectors(out, up);   /* right-handed, so the faces keep their winding */
      g.applyMatrix4(new THREE.Matrix4().makeBasis(out, up, along).setPosition(p[0], yb, p[1]));
      return g;
    }
    function ogee(D, Hc, W, steps) { return ogeeGeo(THREE, D, Hc, W, steps); }   /* gate 6: one profile, shared with every ribbed kind */
    function piece(g, p, dir, yb, nm) {
      var m = new THREE.Mesh(placeIn(g, p, dir, yb), mats.dress || mats.stone); m.name = Q.id + '-springer-carry-' + nm; G.add(m);
      g.computeBoundingBox(); var bb = g.boundingBox;
      CLOG.pieces.push({ nm: nm, top: +bb.max.y.toFixed(3), box: [bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z] });   /* box: in the vault's frame, read by tools/masonry-hall-bearing.js */
      return m;
    }
    /* the check's log (gate 4): each springer's underside and every carrier piece's top (the backs sit 4 cm inside the wall by construction) */
    var CLOG = { room: Q.id, carry: CARRY, springers: [], pieces: [] };
    (window.CastleCeilings = window.CastleCeilings || {}).carryLog = CLOG;
    function carry(p, dir, yb, nm) {   /* yb: the springer's underside; p: its middle, 2 cm into the wall */
      CLOG.springers.push({ nm: nm, under: +yb.toFixed(3), box: [p[0] - (alongX ? SPRING_W : SPRING_D + 0.02) / 2, yb, p[1] - (alongX ? SPRING_D + 0.02 : SPRING_W) / 2, p[0] + (alongX ? SPRING_W : SPRING_D + 0.02) / 2, yb + SPRING_H, p[1] + (alongX ? SPRING_D + 0.02 : SPRING_W) / 2] });
      var w0 = alongX ? p[1] - dir * (SPRING_D / 2 + 0.01) : p[0] - dir * (SPRING_D / 2 + 0.01);   /* the wall point, 2 cm in */
      var at = alongX ? [p[0], w0] : [w0, p[1]];
      if (CARRY === 'none') return;
      if (CARRY !== 'shaft') { piece(ogee(SPRING_D - 0.03, CORB_H, SPRING_W - 0.1), at, dir, yb, nm); return; }
      var cap = 0.42, y0 = B.y + SHAFT_FROM, y1 = yb - cap, r = SHAFT_R, off = r * 0.55;
      /* the capital: a bell from the shaft up to a square abacus under the springer */
      var bell = new THREE.LatheGeometry([[r, 0], [r + 0.02, 0.04], [r + 0.01, 0.07], [r * 1.25, 0.2], [r * 1.9, 0.3], [r * 1.9, 0.32]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 20);
      bell.translate(off, 0, 0); piece(bell, at, dir, y1, nm + '-bell');
      var ab = new THREE.BoxGeometry(r * 4.2 + 0.02, 0.12, r * 4.2); ab.translate(r * 2.1 - 0.02, 0.38, 0); piece(ab, at, dir, y1, nm + '-abacus');
      /* the shaft, its back inside the wall */
      var sf = new THREE.CylinderGeometry(r, r, y1 - y0 + 0.04, 20); sf.translate(off, (y1 - y0) / 2, 0); piece(sf, at, dir, y0, nm + '-shaft');
      /* its foot: a ring and the corbel it stands on */
      var ring = new THREE.LatheGeometry([[r * 1.35, 0], [r * 1.35, 0.06], [r * 1.15, 0.1], [r, 0.12]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 20);
      ring.translate(off, -0.02, 0); piece(ring, at, dir, y0, nm + '-ring');
      piece(ogee(off + r * 1.35 + 0.04, 0.6, r * 2.9), at, dir, y0 - 0.02, nm + '-foot');
    }
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
    fadeToSky(THREE, G, y, top);
    /* Masonry, 18 November 2026, row 5962: a pendant boss hung from each cross arch where it stands 80 per cent up, carved with the
       house beasts in turn, in the manner of the pendants at Oxford's Divinity School (1480s) and Henry VII's chapel, Westminster
       (1503 to 1509); ?ribdeco=boss, the same beast set flat into the arch with no drop. Added after the fade, so they stay solid:
       they hang below the line where the ribs go. v26, 21 November 2026: the pendants are the hall's default by Godric's 1 on
       req 5966 (7.54 pm); ?ribdeco=none takes them off for the before */
    var DECO = (/[?&]ribdeco=(\w+)/.exec(location.search) || [])[1] || 'pendant';
    if (DECO === 'pendant' || DECO === 'boss') {
      var archAt = function (u, sgn, f) {   /* the point on cross arch u, on the c0 side (sgn 1) or the c1 side (-1), where it stands f of the rise up */
        var lo = 0, hi = half - 0.01;
        for (var it = 0; it < 40; it++) { var m = (lo + hi) / 2, vv = sgn > 0 ? c0 + m : c1 - m; if (pointed(half, rise, vv - mid) < f * rise) lo = m; else hi = m; }
        var s = (lo + hi) / 2, v2 = sgn > 0 ? c0 + s : c1 - s, p = P(u, v2); return [p[0], y + pointed(half, rise, v2 - mid), p[1]];
      };
      var dm = mats.dress || mats.stone, bi = 0, DROP = DECO === 'pendant' ? 1.25 : 0, PR = 0.3;
      /* each pendant's and boss's box in the vault's frame (taken before it joins G), for tools/masonry-hall-pendant-clear.js:
         the shell merges the vault by material, so the scene keeps no pendant by name */
      CLOG.pendants = [];
      var logBox = function (o, nm) { var bb = new THREE.Box3().setFromObject(o); CLOG.pendants.push({ nm: nm, box: [bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z] }); };
      lines.forEach(function (u, i) {
        if (!i || i >= lines.length - 1) return;
        [1, -1].forEach(function (sgn) {
          var A = archAt(u, sgn, 0.80), beast = beasts[bi++ % beasts.length], yb = A[1] - DROP;
          if (DROP) {   /* the drop: a collar on the arch, a lantern-shaped body swelling then tapering to the boss's disc */
            var prof = [[0.001, 0], [0.13, -0.02], [0.17, -0.12], [0.12, -0.2], [0.2, -0.45], [0.27, -0.75], [0.3, -DROP + 0.2], [0.26, -DROP + 0.08], [0.001, -DROP + 0.06]].map(function (q) { return [q[0], q[1]]; });
            var pm = new THREE.Mesh(turned(THREE, prof, 20), dm); pm.position.set(A[0], A[1], A[2]); pm.name = Q.id + '-pendant-' + bi;
            logBox(pm, 'pendant-' + bi); G.add(pm);
          }
          var bs = boss(THREE, beast, A[0], yb + (DROP ? 0.06 : 0.0), A[2], PR, dm, Q.id + '-pendant-boss-' + bi);
          logBox(bs, 'pendant-boss-' + bi); G.add(bs);
        });
      });
    }
    return { group: G, flat: true, springs: H.springs, crown: H.crown, bays: lines.length - 1 };
  }

  /* req 2580 (Godric, 1 November 2026, 1.31 pm: the vault is to have a transparency gradient, opaque at its springing and
     fully transparent at the apex, never a cut-off): each vertex of every rib and boss gets aFade, 1 at the springing
     height y0 easing to 0 at the crown y1 (a smoothstep, so no kink), and a clone of its material multiplies its alpha by
     it. The springer stones stay solid (the ribs begin inside them). Done once at build, in the vault's own frame */
  /* Masonry, 18 November 2026 (Godric, 8.43 pm: "the ribs only disappear entirely much closer to the apex"): the ribs are solid
     stone up to 86 per cent of the rise and gone at 98 per cent, so the sky shows only in the very crown (the old curve, a
     smoothstep over the whole rise, was 6 per cent opaque at 85; ?ribfade=old brings it back for the before) */
  var FADE_OLD = /[?&]ribfade=old\b/.test(location.search), FADE_OPAQUE_TO = 0.86, FADE_GONE_AT = 0.98;
  var fadeMats = [];
  function fadeMat(THREE, m) {
    for (var i = 0; i < fadeMats.length; i++) if (fadeMats[i][0] === m) return fadeMats[i][1];
    var c = m.clone(); c.transparent = true;
    c.onBeforeCompile = function (sh) {
      sh.vertexShader = 'attribute float aFade;\nvarying float vFade;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vFade = aFade;');
      /* aFade is the plain height fraction (0 at the springing, 1 at the crown); the curve lives here, per pixel, so a rib's
         segments cannot soften it below the line it is opaque to */
      sh.fragmentShader = 'varying float vFade;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n  gl_FragColor.a *= ' +
        (FADE_OLD ? '1.0 - vFade * vFade * (3.0 - 2.0 * vFade);' : '1.0 - smoothstep(' + FADE_OPAQUE_TO.toFixed(3) + ', ' + FADE_GONE_AT.toFixed(3) + ', vFade);'));
    };
    c.customProgramCacheKey = function () { return FADE_OLD ? 'vaultfade' : 'vaultfade-late'; };
    fadeMats.push([m, c]); return c;
  }
  function fadeToSky(THREE, G, y0, y1) {
    var v = new THREE.Vector3();
    /* the check's log (the mark: solid to 85 per cent of the rise, gone at the apex): the alpha the shader gives each rib vertex,
       by the same formula in JS, read as CastleCeilings.fadeLog */
    var FL = { mode: FADE_OLD ? 'old' : 'late', verts: 0, minAlphaTo85: 1, maxAlphaAtApex: 0, apexVerts: 0, alphaAt85: FADE_OLD ? 1 - 0.85 * 0.85 * (3 - 1.7) : 1 };
    var alphaOf = function (t) {
      if (FADE_OLD) return 1 - t * t * (3 - 2 * t);
      var s = Math.max(0, Math.min(1, (t - FADE_OPAQUE_TO) / (FADE_GONE_AT - FADE_OPAQUE_TO))); return 1 - s * s * (3 - 2 * s);
    };
    (window.CastleCeilings = window.CastleCeilings || {}).fadeLog = FL;
    G.updateMatrixWorld(true);
    G.traverse(function (o) {
      if (!o.isMesh || /springer/.test(o.name || '') || !o.geometry || !o.geometry.attributes.position) return;
      var p = o.geometry.attributes.position, a = new Float32Array(p.count);
      /* a boss is a carving, not a rib: it is wholly there or wholly gone by where it hangs, never a dark half-faded disc under the crown */
      var bossAt = o.parent && /-boss-/.test(o.parent.name || '') ? (new THREE.Box3().setFromObject(o.parent).max.y - y0) / Math.max(0.01, y1 - y0) : null;
      for (var i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
        a[i] = bossAt !== null ? (bossAt >= FADE_OPAQUE_TO ? 1 : 0) : Math.max(0, Math.min(1, (v.y - y0) / Math.max(0.01, y1 - y0)));
        FL.verts++;
        if (a[i] <= 0.85) FL.minAlphaTo85 = Math.min(FL.minAlphaTo85, alphaOf(a[i]));
        if (a[i] >= 0.995) { FL.apexVerts++; FL.maxAlphaAtApex = Math.max(FL.maxAlphaAtApex, alphaOf(a[i])); }
      }
      o.geometry.setAttribute('aFade', new THREE.BufferAttribute(a, 1));
      o.material = Array.isArray(o.material) ? o.material.map(function (m) { return fadeMat(THREE, m); }) : fadeMat(THREE, o.material);
    });
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
      /* gate 6: the rib's foot at the wall carried by a moulded corbel facing the room's middle */
      corbelAt(THREE, G, mats.dress || mats.stone, cx + s * R, cz + c * R, -s, -c, y + 0.02, 0.3, 0.42, 0.36, Q.id + '-springer-corbel-' + k, carryLogFor(Q.id));
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
    else if (kind === 'rib') r = ribVault(THREE, Q, B, o.mats, o.toLocal, o);
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

  window.CastleCeilings = { forPlace: forPlace, surround: surround, corbels: corbels, yawn: { levels: yawnLevels, set: yawnSet, rule: YAWN }, faces: { files: FACES, stone: stoneTexture, color: STONE_FACE, list: function (id) { return (faceSets[id] || []).slice(); }, cell: function (id, k) { return (hash(id) + k) % 6; }, base: function (b) { if (b) facesBase = b; return facesBase; } }, arch: arch,
    /* v21 (row 5869): the mason's kit for other builders (the shell's groin wall corbels, the greenhouse's columns): one turned
       column (base, shaft, capital) and one moulded corbel (ogee, 2 cm into wall and load; corner true lays its sides on two
       walls), each added to the group given, so every carrier in the castle is the same stone */
    kit: { column: function (THREE, G, mat, x, z, yb, yt, r) { column(THREE, G, mat, x, z, yb, yt, r); return G; },
      corbel: function (THREE, G, mat, x, z, ox, oz, yTop, D, Hc, W, name, corner) { return corbelAt(THREE, G, mat, x, z, ox, oz, yTop, D, Hc, corner ? cornerW(D, W) : W, name, carryLogFor(name.split('-springer')[0]), corner); } },
    rule: { SPRING_MIN: SPRING_MIN, RISE_MAX: RISE_MAX, AISLE_MAX: AISLE_MAX, BEAM_STEP: BEAM_STEP, PIER_R: PIER_R } };
})();
