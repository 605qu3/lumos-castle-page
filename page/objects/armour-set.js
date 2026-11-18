/* armour-set.js: the castle's set of real 3D suits of armour (row 5868; Godric's 1 on the armour card, 17 November 2026,
   10.21 pm: four suits, "dark field armour, worn bright steel with red cloth, the blackened suit with an open sallet, and
   the fluted Blois suit"), standing where CastleSuit's one image-patched suit stood. Each suit is a free model (CC BY,
   credits in objects/armour/CREDITS.txt), stood 1.70 m to the helmet's top (the ruling of 23 October 2026), facing +z.

   CastleArmour.make(THREE, renderer, opts)  one suit, the same shape as CastleSuit.make's: opts { kind (CastleSuit's
       KINDS; default 'default'), index (the copy's place in its row, for variety; default the order made), base (where
       the glbs are, relative to the page; default 'objects/armour/'), shadow (a material, or false) }. Returns { group,
       kind, variant, mats, body, ready, back, onReady(fn), light(k, bounce) }; the group's origin on the floor under the
       suit's middle, facing +z, its back `back` metres behind it. headless and bareheaded have no real suit yet and are
       CastleSuit's (passed through, opts.src kept).
   Each suit's geometry and textures load once and are shared by every copy; each copy is a THREE.LOD of three copies of
   its suit (near, and two lower-detail ones past NEAR and FAR metres, laid with the near's material). A copy's variant
   is a suit, a finish (a tint and roughness on its own shared material) and a mirror: VARIANTS names each kind's, and the
   default kind cycles so no two copies made in a row are alike. CastleArmour.alike(a, b) says when two variants match
   (one suit, one finish); CastleArmour.variant(kind, index) gives a kind's variant, for a check. */
(function () {
  'use strict';
  var THREE, renderer, cache = {}, made = 0;
  var NEAR = 10, FAR = 24;   /* metres: the switch to lod1 and lod2, set by a blind look (docs/objects/armour-5868/lod-method.md; 7 and 16 failed) */
  var SUITS = {
    field: { file: 'armour-field-1', back: 0.18, what: 'dark field armour, close helmet',
             fist: [-0.2822, 0.8734, 0.1032] },   /* the closed right fist's centre, measured (tools/objects-armour-grip.py, row 5906) */
    redcloth: { file: 'armour-redcloth-2', back: 0.18, what: 'worn bright steel with red cloth',
             fist: [-0.2997, 0.9128, 0.1036] },   /* measured, as field's */
    sallet: { file: 'armour-sallet-3', back: 0.19, what: 'blackened suit, open sallet',
             fist: [-0.3626, 0.9177, 0.1067] },   /* measured, as field's */
    blois: { file: 'armour-blois-5', back: 0.31, what: 'fluted Blois suit, a sword point down' }
  };
  /* finishes: a multiplier on the suit's own colour, and how much of its mirror is lost to wear (dull: the env map's
     share cut). The suits' own roughness factors are mostly 1 already under their maps, so a finish works by colour and
     reflection, not roughness (none: the model's own) */
  var FINISH = {
    own: null,
    grey: { tint: [0.78, 0.8, 0.83], dull: 0.15 },
    russet: { tint: [0.86, 0.66, 0.5], dull: 0.3 },
    black: { tint: [0.42, 0.42, 0.45], dull: 0.1 },
    dull: { tint: [0.7, 0.68, 0.64], dull: 0.45 }
  };
  /* the suits are metal (metalness 1), and metal shows only what it reflects: the shell sets no scene environment, so
     each suit's material takes a small hall panorama, made once a renderer (the idea is CastleSuit's hallEnv in
     page/corridor/suit.js: a dark vault, warm stone, two cool windows and a torch's glow, the flags below) */
  var envs = [];
  function hallEnv(noWin) {   /* noWin: the same panorama without the two cool windows (a check's control only) */
    for (var i = 0; i < envs.length; i++) if (envs[i][0] === renderer && envs[i][2] === String(noWin || '')) return envs[i][1];
    var c = document.createElement('canvas'); c.width = 512; c.height = 256;
    var x = c.getContext('2d'), gd = x.createLinearGradient(0, 0, 0, 256);
    if (noWin === 'flat') { gd.addColorStop(0, '#7a7068'); gd.addColorStop(1, '#7a7068'); }
    else { gd.addColorStop(0, '#2a2624'); gd.addColorStop(0.36, '#665c54'); gd.addColorStop(0.5, '#8a8076'); gd.addColorStop(0.56, '#584b40'); gd.addColorStop(1, '#2c241e'); }
    x.fillStyle = gd; x.fillRect(0, 0, 512, 256);
    if (!noWin) [[88, '#e6ecf2'], [232, '#dde5ec']].forEach(function (w) { x.fillStyle = w[1]; x.fillRect(w[0], 72, 40, 58); });
    var tg = x.createRadialGradient(404, 98, 2, 404, 98, 40); tg.addColorStop(0, 'rgba(255,198,128,0.9)'); tg.addColorStop(1, 'rgba(255,198,128,0)');
    x.fillStyle = tg; x.fillRect(364, 58, 80, 80);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer), e = pm.fromEquirectangular(t).texture; pm.dispose(); t.dispose();
    envs.push([renderer, e, String(noWin || '')]);
    return e;
  }
  /* each kind's variant [suit, finish, mirror, scale]. The gallery's walk back in time (shell.html GALLERY ROWS) is set so
     no two neighbours along a wall or across the aisle are the same suit, whatever their finish (checked by
     tools/objects-armour-variety.mjs); the 17th century's kinds stand in on the set's darker suits until later suits are
     found; the Gothic pair at the knight's end are the fluted suit and the open sallet, the Gothic helmet. */
  var VARIANTS = {
    tall: ['field', 'own', false, 1.1],
    boy: ['redcloth', 'own', true, 1.45 / 1.70],
    tudor: ['redcloth', 'grey', false],
    'black-and-white': ['sallet', 'own', false],
    munition: ['redcloth', 'dull', false],
    gothic: ['blois', 'grey', true],
    'gothic-visor': ['sallet', 'grey', false],
    jousting: ['field', 'black', true],
    maximilian: ['redcloth', 'russet', false],
    cuirassier: ['sallet', 'black', false],
    tilt: ['field', 'own', true],
    sword: ['blois', 'dull', true],
    shield: ['field', 'black', false],
    mace: ['sallet', 'russet', true],
    'three-quarter': ['field', 'grey', false]
  };
  var CYCLE = [['field', 'own'], ['redcloth', 'own'], ['sallet', 'own'], ['blois', 'own'], ['field', 'grey'], ['redcloth', 'dull'],
    ['sallet', 'russet'], ['blois', 'grey']];
  var PASS = { headless: true, bareheaded: true };
  /* what each copy holds (the arms, ARMS below): a halberd in the right gauntlet unless its kind says otherwise; the
     Blois suit keeps its own sword, its hands together on the pommel, so it holds nothing more */
  var ARM_OF = { mace: 'mace' };
  function armFor(kind, suit) { return suit === 'blois' ? null : ARM_OF[kind] || 'halberd'; }
  /* what hangs on the wall beside a copy (18 November 2026): the shield kind's shield. Its left arm hangs straight (18
     degrees off upright, measured), so a shield on its forearm would face sideways, never the aisle; on the wall at its
     left, flat, face out, as halls hung arms by their suits. Its closed right fist then holds a halberd like the other
     field copies (provisional, on Godric's sheet); both only under ?arms */
  var WALL_OF = { shield: 'shield' };
  function variant(kind, index) {
    var v = VARIANTS[kind];
    if (v) return { suit: v[0], finish: v[1], mirror: !!v[2], scale: v[3] || 1, arm: armFor(kind, v[0]), wall: WALL_OF[kind] || null };
    var c = CYCLE[((index || 0) % CYCLE.length + CYCLE.length) % CYCLE.length];
    return { suit: c[0], finish: c[1], mirror: (index || 0) % 3 === 1, scale: 1, arm: armFor(kind, c[0]) };
  }
  function alike(a, b) { return !!a && !!b && a.suit === b.suit && a.finish === b.finish; }
  function col(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function loader(done) {
    if (THREE.GLTFLoader) return done();
    var w = loader.wait || (loader.wait = []); w.push(done);
    if (w.length > 1) return;
    var s = document.createElement('script'); s.src = 'people/GLTFLoader.js';
    s.onload = function () { w.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { console.error('armour-set: GLTFLoader.js did not load'); };
    document.head.appendChild(s);
  }
  function parts(scene) {   /* every mesh of a file, its node's transform baked in once: [{ geo, mat }] (blois has its sword apart) */
    var out = []; scene.updateMatrixWorld(true);
    scene.traverse(function (o) {
      if (!o.isMesh) return;
      var geo = o.matrixWorld.equals(new THREE.Matrix4()) ? o.geometry : o.geometry.clone().applyMatrix4(o.matrixWorld);
      out.push({ geo: geo, mat: o.material });
    });
    return out;
  }
  function load(base, key) {   /* a suit's three copies, once: { ready, waiters, near: [{geo, mat}], lods: [[geo], [geo]] } */
    var id = base + key;
    if (cache[id]) return cache[id];
    var S = cache[id] = { ready: false, waiters: [], mats: {} }, f = SUITS[key].file, got = {};
    loader(function () {
      var L = new THREE.GLTFLoader(), left = 3;
      [['near', ''], ['lod1', '-lod1'], ['lod2', '-lod2']].forEach(function (p) {
        L.load(base + f + p[1] + '.glb', function (g) {
          got[p[0]] = parts(g.scene);
          if (--left) return;
          S.near = got.near; S.fist = !!SUITS[key].fist; S.grip = S.fist ? Object.assign(new THREE.Vector3().fromArray(SUITS[key].fist), { fist: true }) : gripOf(got.near[0].geo);
          S.lods = [got.lod1.map(function (q) { return q.geo; }), got.lod2.map(function (q) { return q.geo; })];
          S.ready = true; S.waiters.splice(0).forEach(function (fn) { fn(); });
        }, undefined, function (e) { console.error('armour-set: ' + f + p[1] + '.glb', e); });
      });
    });
    return S;
  }
  function finishMat(S, name, i) {   /* one material a suit, part and finish, shared by every copy wearing it */
    var id = name + ':' + i;
    if (S.mats[id]) return S.mats[id];
    var m = S.near[i].mat.clone(), F = FINISH[name];
    if (!m.envMap && renderer) m.envMap = hallEnv();
    if (F) m.color.multiply(new THREE.Color(F.tint[0], F.tint[1], F.tint[2]));
    m.emissive = m.emissive || new THREE.Color(0, 0, 0);
    m.userData.env = (m.envMapIntensity === undefined ? 1 : m.envMapIntensity) * (1 - (F ? F.dull : 0));
    m.envMapIntensity = m.userData.env;
    return (S.mats[id] = m);
  }
  /* the grip: where the right gauntlet hangs. Read once a suit from its own body: of the 5 cm bands of height between
     0.7 and 1.05 m, the widest on the suit's right (-x, the suit facing +z) is the hanging gauntlet; the fist's middle is
     4 cm in from its outer face, at that band's middle and the outer point's depth (docs/handoff/objects.md, Gate, the
     arms of the new suits) */
  function gripOf(geo) {
    var p = geo.attributes.position, best = { x: 0, y: 0.85, z: 0 }, bands = {};
    for (var i = 0; i < p.count; i++) {
      var y = p.getY(i); if (y < 0.7 || y >= 1.05) continue;
      var b = Math.floor(y / 0.05), x = p.getX(i);
      if (!bands[b] || x < bands[b].x) bands[b] = { x: x, z: p.getZ(i), y: (b + 0.5) * 0.05 };
    }
    Object.keys(bands).forEach(function (b) { if (bands[b].x < best.x) best = bands[b]; });
    return new THREE.Vector3(best.x + 0.04, best.y, best.z);
  }
  /* the arms, built in code once a page and shared by every copy (sizes from dated museum records:
     docs/objects/records-1117/armour-arms.md). Each is a list of [geometry, material] laid along +y, its grip at the
     origin; the halberd and the mace stand on the floor through the fist, the shield leans on the left leg */
  var ARMS = {
    /* The Met 32.75.194, halberd, German, early 16th century: 215.5 cm, head 44.1 cm, W. 26.6 cm (the whole head, blade
       to fluke; the blade's own width read from the photo), steel, oak shaft */
    halberd: { length: 2.155, head: 0.441, blade: 0.16, shaft: 0.017 },
    /* The Met 42.50.44, flanged mace, Italian, ca. 1550 to 1600, all steel: 64 cm, head 16.5 cm, W. 12.2 cm across the
       flanges; eight flanges read from the photo */
    mace: { length: 0.64, head: 0.165, flanges: 8, across: 0.122 },
    /* no dated plain-faced shield of the period found (docs/objects/records-1117/armour-arms.md): sizes provisional */
    shield: { height: 0.62, width: 0.48, thick: 0.02 }
  };
  var armCache = {};
  var MACE_FLAT = false;   /* the failed head (flat 5 mm flanges, not turned), only as the 16-view mark's control (?maceflat on the test page) */
  var ARMS_ON = false;   /* the mace and shield, off until their hold passes its look (CastleArmour.showArms(true) for a check); the halberd is on in a closed fist (row 5906) */
  /* the arms from free models (Fawkes, 18 November 2026, 12.55 am: a true 3D model first, CC0 or CC BY, code only where
     none fits; prepared by tools/objects-arms-prep.py, credits in objects/arms/CREDITS.txt). Each glb's origin is its grip
     (the mace's: the middle of its spiral grip, hung head down), so it hangs from the fist's measured centre as the code
     arm did. ARM_CODE keeps the code-built arm, only as a check's control (?armcode or ?maceflat on the test page) */
  var ARM_GLB = { mace: 'mace-ornate-1.glb', shield: 'shield-14c-1.glb' }, ARM_CODE = false, armGlb = {};
  var SHIELD = { width: 0.576, height: 0.66, centre: 1.25, gap: 0.05 };   /* the free heater as prepared (docs/objects/armour-5868/arms/shield-14c-1.json); its middle at shoulder height, 5 cm clear of the suit's widest point */
  function loadArm(base, name, done) {   /* one glb an arm a page, shared by every copy: done(parts), or done(null) on a failure */
    var A = armGlb[name] || (armGlb[name] = { waiters: [] });
    if (A.parts) return done(A.parts);
    A.waiters.push(done); if (A.waiters.length > 1) return;
    loader(function () {
      new THREE.GLTFLoader().load(base + ARM_GLB[name], function (g) {
        A.parts = parts(g.scene);
        A.parts.forEach(function (q) { if (!q.mat.envMap && renderer) q.mat.envMap = hallEnv(); q.mat.userData.env = 1; });
        if (name === 'mace' && DIAG.length) A.parts = A.parts.map(diagPart);   /* a check's isolation pass only (?macediag on the test page) */
        A.waiters.splice(0).forEach(function (f) { f(A.parts); });
      }, undefined, function (e) { console.error('armour-set: ' + base + ARM_GLB[name], e); A.waiters.splice(0).forEach(function (f) { f(null); }); });
    });
  }
  /* the mace's render branch (row 5868, 18 November 2026): one shading factor off at a time, so the factor that paints the
     side view's pale line is measured, not guessed; only on the test page (?macediag=a,b), never in a room */
  var DIAG = [];
  function diagPart(q) {
    var m = q.mat.clone(), g = q.geo;
    if (DIAG.indexOf('nmap') >= 0) m.normalMap = null;
    if (DIAG.indexOf('mr') >= 0) { m.metalnessMap = null; m.roughnessMap = null; m.metalness = 1; m.roughness = 0.45; }
    if (DIAG.indexOf('base') >= 0) { m.map = null; m.color = col(0x8c8f93); }
    if (DIAG.indexOf('env') >= 0 && renderer) m.envMap = hallEnv(true);
    if (DIAG.indexOf('envflat') >= 0 && renderer) m.envMap = hallEnv('flat');   /* an even grey hall, the vault and floor as light as the walls */
    if (DIAG.indexOf('front') >= 0) m.side = THREE.FrontSide;
    if (DIAG.indexOf('rough') >= 0) m.roughness = 1.6;   /* the map's roughness (about 0.35) lifted to about 0.56 */
    if (DIAG.indexOf('envi') >= 0) { m.envMapIntensity = 2; m.userData.env = 2; }   /* userData too: suit.light resets the intensity from it */
    if (DIAG.indexOf('pbr') >= 0) m.color.setScalar(3.3);   /* the map's steel (about 110 sRGB, 0.155 linear) up to about 190 sRGB (0.51), a bare metal's range */
    if (DIAG.indexOf('metal') >= 0) m.metalness = 0.8;   /* the map's metalness (about 0.87) down to about 0.70 */
    if (DIAG.indexOf('flat') >= 0) { g = (g.index ? g.toNonIndexed() : g.clone()); g.computeVertexNormals(); }
    m.needsUpdate = true;
    return { geo: g, mat: m };
  }
  function merge(geos) {   /* non-indexed geometries into one (position, normal) */
    var pos = [], nor = [];
    geos.forEach(function (g) { g = g.index ? g.toNonIndexed() : g; pos.push(g.attributes.position.array); nor.push(g.attributes.normal.array); });
    function cat(list) { var n = 0; list.forEach(function (a) { n += a.length; }); var out = new Float32Array(n), o = 0; list.forEach(function (a) { out.set(a, o); o += a.length; }); return out; }
    var m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(cat(pos), 3)); m.setAttribute('normal', new THREE.BufferAttribute(cat(nor), 3));
    return m;
  }
  function slab(points, thick) {   /* a flat steel shape in the x-y plane, thick along z, centred on z 0 */
    var sh = new THREE.Shape(); points.forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
    var g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: false }); g.translate(0, 0, -thick / 2); g.computeVertexNormals(); return g;
  }
  function armMats() {
    if (armCache.mats) return armCache.mats;
    var steel = new THREE.MeshStandardMaterial({ color: col(0x8c8f93), metalness: 1, roughness: 0.42 });
    if (renderer) steel.envMap = hallEnv();
    steel.userData.env = 1;
    /* the mace's core between its flanges, in their shadow: darker and rougher (the bare shiny core caught one bright
       streak down the head's middle, read as a pale line; tools/objects-mace-pin.py, 18 November 2026) */
    var deep = new THREE.MeshStandardMaterial({ color: col(0x3c3e41), metalness: 1, roughness: 0.78 });
    if (renderer) deep.envMap = steel.envMap;
    deep.userData.env = 1;
    return (armCache.mats = { steel: steel, deep: deep, wood: new THREE.MeshStandardMaterial({ color: col(0x5a4330), roughness: 0.8 }),
      paint: new THREE.MeshStandardMaterial({ color: col(0x6e5a44), roughness: 0.85 }) });
  }
  function buildArm(name) {   /* [[geo, mat], ...] in the arm's own frame: y up from the floor (halberd, mace) or its foot (shield) */
    if (armCache[name]) return armCache[name];
    var M = armMats(), A = ARMS[name], out = [];
    if (name === 'halberd') {
      var L = A.length, H = A.head, sr = A.shaft, top = L - H;
      var shaft = new THREE.CylinderGeometry(sr, sr * 1.1, top + 0.02, 8); shaft.translate(0, (top + 0.02) / 2, 0);   /* octagonal ash haft */
      var spike = new THREE.CylinderGeometry(0, 0.018, H * 0.62, 4); spike.translate(0, top + H * 0.38 + H * 0.31, 0);   /* the top spike, square */
      var socket = new THREE.CylinderGeometry(sr * 1.25, sr * 1.25, H * 0.42, 8); socket.translate(0, top + H * 0.21, 0);
      var lang = new THREE.BoxGeometry(0.012, 0.32, sr * 2.3); lang.translate(0, top - 0.14, 0);   /* the langets down the haft */
      var b = A.blade, y0 = top + 0.03, y1 = top + 0.03 + H * 0.38;
      var blade = slab([[sr, y0], [sr + b * 0.55, y0 - 0.03], [sr + b, y0 + 0.01], [sr + b * 0.96, (y0 + y1) / 2], [sr + b, y1 - 0.01], [sr + b * 0.6, y1 + 0.05], [sr, y1]], 0.006);
      var fluke = slab([[-sr, y0 + 0.04], [-sr - 0.12, y0 + 0.02], [-sr, y0 + 0.11]], 0.007);   /* the back spike */
      out.push([shaft, M.wood], [merge([spike, socket, lang, blade, fluke]), M.steel]);
    } else if (name === 'mace') {   /* hanging head down from the fist: y 0 the fist, the head below */
      var hl = A.length, hh = A.head, fl = [];
      var haft = new THREE.CylinderGeometry(0.014, 0.014, hl - hh, 8); haft.translate(0, -(hl - hh) / 2 + 0.08, 0);
      for (var k = 0; k < A.flanges; k++) {
        var f = slab([[0.012, 0], [A.across / 2 - 0.006, 0], [A.across / 2, hh * 0.1], [A.across / 2, hh * 0.55], [0.012, hh]], 1);   /* full width at the tip (y 0, the bottom), tapering toward the haft: a point at the tip read as a pin (18 November 2026) */
        /* a wedge section, as forged flanges are: 11 mm at the root (inside the core), an edge of 1.5 mm at the rim. A flat
           5 mm plate seen edge-on read as a pin below the head and a pale line down it (two blind reads, 18 November 2026;
           Fawkes's ruling on req 5919) */
        var fp = f.attributes.position;
        for (var v = 0; v < fp.count; v++) { var fx = fp.getX(v), ft = MACE_FLAT ? 0.005 : 0.011 - 0.0095 * Math.max(0, Math.min(1, (fx - 0.012) / (A.across / 2 - 0.012))); fp.setZ(v, fp.getZ(v) * ft); }
        f.computeVertexNormals();
        f.rotateY((k + (MACE_FLAT ? 0 : 0.5)) * Math.PI * 2 / A.flanges);   /* half a step round: no flange edge-on to the aisle (the gallery's main view) */ f.translate(0, -(hl - hh) + 0.08 - hh, 0); fl.push(f);
      }
      /* the head's solid core and the button at its tip (18 November 2026: a read saw a slit down the head's middle and a
         rod below it, the flanges meeting round nothing and tapering to a point), and a knob closing the haft's top */
      var hb = -(hl - hh) + 0.08 - hh;
      var core = new THREE.CylinderGeometry(0.026, 0.026, hh, 8);   /* 5 cm across: a 4 cm core caught one bright line and read as a slit */ core.translate(0, hb + hh / 2, 0);
      var button = new THREE.SphereGeometry(0.026, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); button.translate(0, hb, 0);   /* a domed end under the core */
      var knob = new THREE.SphereGeometry(0.02, 8, 6); knob.translate(0, 0.08, 0);
      fl.push(knob);
      out.push([merge([haft].concat(fl)), M.steel], [merge([core, button]), M.deep]);
      var grip = new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8);   /* a leather-bound grip where the fist closes, the halberd haft's size (inferred) */
      out.push([grip, M.wood]);
    } else if (name === 'shield') {   /* a heater shield, flat-topped, its point down, its face to +z */
      var w = A.width / 2, h = A.height;
      var face = slab([[-w, h], [w, h], [w, h * 0.55], [w * 0.55, h * 0.18], [0, 0], [-w * 0.55, h * 0.18], [-w, h * 0.55]], A.thick);
      out.push([face, M.paint]);
    }
    return (armCache[name] = out);
  }
  /* how a copy carries its arm. The four models' right gauntlets hang open (a blind look, 17 November 2026, 11.12 pm: a
     pole set through the fist reads as beside it, never gripped), so no arm is set in a fist: the halberd stands on its
     butt 8 cm outside the gauntlet, touches the gauntlet's outer face and leans in to rest on the shoulder; the mace hangs
     at the left hip from the belt; the shield stands on its point before the left leg, leaning back on the thigh */
  function placeArm(name, grip, inner, armBase, done) {   /* the arm in the suit's own frame (inner: mirrored and scaled with the suit); done(g) once its meshes are in */
    var g = new THREE.Group(), glb = ARM_GLB[name] && !ARM_CODE; g.name = 'armour-arm-' + name;
    function add(list) { list.forEach(function (q) { var m = new THREE.Mesh(q[0], q[1]); m.raycast = function () {}; g.add(m); }); }
    if (glb) loadArm(armBase, name, function (ps) {
      if (ps) add(ps.map(function (q) { return [q.geo, q.mat]; }));
      if (name === 'halberd') g.children.forEach(function (m) { m.rotation.y = Math.PI; });   /* the free halberd's blade (+x) outward, as the code one's */
      if (done) done(g);
    });
    else add(buildArm(name));
    if (name === 'halberd' && grip.fist) {   /* a closed fist (row 5906): the haft upright through its measured centre, the blade outward */
      g.position.set(grip.x, 0, grip.z);
      g.children.forEach(function (m) { m.rotation.y = Math.PI; });
    } else if (name === 'halberd') {
      var r = ARMS.halberd.shaft, touch = grip.x - 0.04 - r, out = 0.08;   /* the shaft's line: butt at touch - out, at the gauntlet's height it touches */
      g.position.set(touch - out, 0, grip.z);
      g.rotation.z = -Math.atan2(out, grip.y);   /* the top leans in, toward the suit's middle (+x) */
      g.rotation.y = 0;   /* the blade (built on +x) then points in over the shoulder: turn it outward */
      g.children.forEach(function (m) { m.rotation.y = Math.PI; });
    } else if (name === 'mace' && grip.fist) {   /* hanging head down from the closed fist (row 5906) */
      g.position.set(grip.x, grip.y, grip.z);
      /* the free mace's six flanges lie at 22.5 + 60k degrees round its haft in the mirrored suit's frame, one 7.5 degrees
         off edge-on to the aisle (+z): a blind read saw that flange's lit rim as a seam splitting the head (18 November
         2026, 1.22 am). A +22.5 degree turn ran backwards under the suit's mirror (15 off, measured 1.40 am); this -22.5
         (Fawkes on row 5921) puts the nearest 30 off from the front but one edge-on from the suit's side, read there as a
         seam (1.48 am): front and side are 90 degrees apart and the flanges' planes repeat every 60, so no turn clears
         every view a walker gets (tools/objects-mace-turn.py prints them all). The turn is not the cure; under ?arms only */
      if (glb) g.rotation.y = -Math.PI / 8;
    }
    else if (name === 'mace') { g.position.set(0.21, 1.02, 0.07); g.rotation.z = 0.08; }   /* from the belt at the left hip, head down */
    else { g.position.set(0.11, 0.01, 0.27); g.rotation.x = 0.26; }   /* point on the floor, the top back against the thigh */
    inner.add(g);
    if (!glb && done) done(g);
    return g;
  }
  function shadowMat() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 6, 32, 32, 32);
    g.addColorStop(0, 'rgba(20,14,10,0.5)'); g.addColorStop(1, 'rgba(20,14,10,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
  }
  function make(T, r, opts) {
    opts = opts || {};
    THREE = T; renderer = r || renderer;
    var kind = opts.kind || 'default';
    if (PASS[kind] && window.CastleSuit) return window.CastleSuit.make(T, r, opts);
    var index = opts.index === undefined ? made : opts.index; made++;
    var v = variant(kind, index), base = opts.base || 'objects/armour/', armBase = opts.armBase || base.replace(/armour\/?$/, 'arms/'), S = load(base, v.suit), g = new THREE.Group(), waiting = [];
    var inner = new THREE.Group(); inner.scale.set(v.mirror ? -v.scale : v.scale, v.scale, v.scale); g.add(inner);
    var suit = { group: g, kind: kind, variant: v, mats: [], body: null, ready: false, back: SUITS[v.suit].back * v.scale,
      onReady: function (f) { if (suit.ready) f(suit); else waiting.push(f); },
      light: function (k, bounce) {   /* as CastleSuit's: the torches' warmth on the steel by night, its mirror dimmed */
        var b = bounce === undefined ? 0.35 : bounce;
        suit.mats.forEach(function (m) { m.emissive.copy(col(0xffb070)).multiplyScalar(b * 0.12 * k); m.envMapIntensity = m.userData.env * (1 - 0.65 * k); });
      } };
    function fill() {   /* the near level every part with its own material; the lower ones (one mesh each) the body's */
      var mats = S.near.map(function (q, i) { return finishMat(S, v.finish, i); }), lod = new THREE.LOD();
      function level(geos, own) {
        var lg = new THREE.Group();
        geos.forEach(function (geo, i) { var m = new THREE.Mesh(geo, own ? mats[i] : mats[0]); m.name = 'armour-' + v.suit + (i ? '-' + i : ''); lg.add(m); });
        return lg;
      }
      var near = level(S.near.map(function (q) { return q.geo; }), true);
      lod.addLevel(near, 0); lod.addLevel(level(S.lods[0]), NEAR); lod.addLevel(level(S.lods[1]), FAR);
      lod.name = 'armour-set-lod'; inner.add(lod);
      suit.body = near.children[0]; suit.mats = mats.slice();
      function finish() { suit.ready = true; waiting.splice(0).forEach(function (f) { f(suit); }); }
      if (v.arm && (ARMS_ON || (v.arm === 'halberd' && S.fist && !v.wall))) {   /* the halberd wherever the suit's fist is closed (row 5906, its look passed 18 November 2026); the mace and shield only under ?arms */
        suit.arm = placeArm(v.arm, S.grip, inner, armBase, function (ag) {   /* the suit is ready once its arm's meshes are in (a glb arm loads once a page) */
          ag.traverse(function (o) { if (o.material && suit.mats.indexOf(o.material) < 0) { o.material.emissive = o.material.emissive || new THREE.Color(0, 0, 0); if (o.material.userData.env === undefined) o.material.userData.env = 1; suit.mats.push(o.material); } });
          finish();
        });
      } else finish();
    }
    if (S.ready) fill(); else S.waiters.push(fill);
    /* suit.wall(d): the caller, who knows the room, says how far behind the copy's origin its wall stands (metres, along
       -z); the copy's wall piece (WALL_OF) then hangs there, flat, beside its left arm. No wall said, nothing hung */
    suit.wall = function (d) {
      if (!v.wall || !ARMS_ON || !(d > 0)) return;
      suit.onReady(function () {
        var half = 0;
        S.near.forEach(function (q) { var p = q.geo.attributes.position; for (var i = 0; i < p.count; i++) { var y = p.getY(i); if (y > 0.9 && y < 1.6) half = Math.max(half, Math.abs(p.getX(i))); } });
        var w = new THREE.Group(); w.name = 'armour-wall-' + v.wall;
        w.position.set(half * v.scale + SHIELD.gap + SHIELD.width / 2, SHIELD.centre * v.scale, -d + 0.01);
        g.add(w); suit.wallArm = w; suit.wallReady = false;
        loadArm(armBase, v.wall, function (ps) {
          if (ps) ps.forEach(function (q) { var m = new THREE.Mesh(q.geo, q.mat); m.raycast = function () {}; w.add(m); if (suit.mats.indexOf(q.mat) < 0) { q.mat.emissive = q.mat.emissive || new THREE.Color(0, 0, 0); suit.mats.push(q.mat); } });
          suit.wallReady = true;
        });
      });
    };
    if (opts.shadow !== false) {
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.4), opts.shadow || cache.shadow || (cache.shadow = shadowMat()));
      sh.rotation.x = -Math.PI / 2; sh.position.set(0, 0.008, 0); sh.scale.setScalar(v.scale); g.add(sh);
    }
    g.name = 'armour-set';
    return suit;
  }
  window.CastleArmour = { make: make, variant: variant, alike: alike, VARIANTS: VARIANTS, SUITS: SUITS, ARMS: ARMS, NEAR: NEAR, FAR: FAR, showArms: function (b) { ARMS_ON = !!b; }, buildArm: buildArm, maceFlat: function (b) { MACE_FLAT = !!b; if (b) ARM_CODE = true; delete armCache.mace; }, armCode: function (b) { ARM_CODE = !!b; }, halberdGlb: function (b) { if (b) ARM_GLB.halberd = 'halberd-romarov-1.glb'; else delete ARM_GLB.halberd; delete armGlb.halberd; },   /* the free halberd, a check's only (?halberdglb on the test page) until card 5917 is answered */
    maceDiag: function (list) { DIAG = list || []; delete armGlb.mace; delete armCache.mace; } };
})();
