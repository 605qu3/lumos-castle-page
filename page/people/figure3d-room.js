/* The 3D figure mockup in the common room (req 3349, after req 3317; Dumbledore's review of 8 November 2026,
   docs/ministry/reviews/2026-11-08-dumbledore-3d-pipeline.md, section 7). Loaded only behind ?figure3d=1.

   What it is: a CC0 rigged stand-in, KayKit's Mage (models/kaykit-adv/Mage.glb, Kay Lousberg, CC0; its README holds
   the licence line), loaded by three r128's GLTFLoader (people/GLTFLoader.js), toon-shaded with figure.js's ramp and
   ink hull (the Pickett pilot's), its colour atlas repainted flat in Clementine's colours. Its own clips: Idle,
   Walking_A, Sit_Chair_Down, Sit_Chair_Idle, Sit_Chair_StandUp. There is no reading clip: reading is the seated idle
   with the head bent and the pack's own open book in the left hand; turning to the eye is the head and chest turned
   by hand. The hat, staff, wand and closed book are hidden. The face is the model's own (modelled eyes and brows in
   the atlas's dark cells), not a drawn face canvas: that is a later step if Godric wants this road.

   The walk: from the fire mark right of the fire (FIGURE_SPOTS 1), out round toward the room and back to the sofa's
   front (never across the hearth), sits, reads, turns to the eye, stands, walks back. On the fire mark's other side
   (spot 0), the drawn card clementine-figure.png, cell 0 (the front view), placed as the room places its pool cards
   (poolCard). The stand-in is chibi (a head near two fifths of its height): the head is scaled by HEADK, the whole
   to 1.40 m, the drawn card's height.

   Test links: &f3act=still&f3angle=45 (standing on the fire mark, turned that many degrees from facing the eye),
   &f3act=toward (walking from the mark toward the eye), &f3t=seconds (run to that moment and hold it), &f3card=0 no
   card, &f3card=beside the card 0.8 m left of the fire mark's left spot (a close look at both in one frame), &f3card=spot0 the
   card on that spot (with &f3fig=0, the same mark and camera as the 3D figure standing there), &f3fig=0 no 3D figure,
   &f3head=0.7 another head scale. window.Figure3D.info() gives the counts. */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var ACT = Q.get('f3act') || 'loop', ANGLE = +(Q.get('f3angle') || 0) * Math.PI / 180;
  var HOLD = Q.has('f3t') ? +Q.get('f3t') : -1, SHOW_CARD = Q.get('f3card') !== '0', SHOW_FIG = Q.get('f3fig') !== '0', HIDE_FIG = Q.get('f3fig') === 'hide';
  var BASE = 'people/models/kaykit-adv/', HEIGHT = 1.60;   /* a seventeen-year-old of middle height (req 3369 follow-up, Fawkes 9 Nov 2026): the card's 1360 px figure at 850 px a metre */
  /* &f3model=pupil (req 3369, Godric, 9 November 2026, 7.28 pm): the same Mage reshaped in Blender to a drawn pupil's
     proportions (tools/figure3d-pupil-blender.py: head 0.36, legs 2.6 times longer, the thigh 2.15 and the shin 3.39 so the knee sits
     at a pupil's height, arms 1.5, shoulders and hips narrower), so its head is already in proportion and HEADK defaults to 1 */
  var PUPIL = Q.get('f3model') === 'pupil';
  var ARMDROP = (function () { var v = (Q.get('f3arm') || 'z,-30').split(','); return v[1] === '0' ? null : [v[0], +v[1] * Math.PI / 180]; })();
  var HEADK = Q.has('f3head') ? +Q.get('f3head') : PUPIL ? 1 : 0.72;
  var INK = 0x16120e;
  var COL = { skin: 0xc9a27c, hair: 0x4a2f22, eyes: 0x241a14, shirt: 0x25232b, linen: 0xece6d6, belt: 0x2a2420,
              stockings: 0x3a3a40, boots: 0x1a1818, robe: 0x25232b, lining: 0x2d4468, book: 0x5a2420, page: 0xe8dfc8 };
  /* the atlas's cells (column, row from the top; 8 by 4, each 128 by 256 px) the Mage uses, and what each becomes */
  var CELL = { '0,0': COL.skin, '1,0': COL.hair, '2,0': COL.eyes, '3,0': COL.linen, '4,0': COL.shirt, '5,0': COL.belt,
               '0,1': COL.robe, '1,1': COL.robe, '2,1': COL.robe, '3,1': COL.page, '5,1': COL.book, '7,1': COL.stockings,
               '0,2': COL.page, '2,2': COL.lining, '3,2': COL.boots, '6,2': COL.belt, '7,2': COL.skin };
  /* the open book turned in her hand so its pages face her, not the room (the pack holds it out to cast from) */
  var BOOKR = (Q.get('f3bk') || '-90,0,0').split(',').map(function (v) { return +v * Math.PI / 180; });
  var HIDE = ['Mage_Hat', '2H_Staff', '1H_Wand', 'Spellbook'];
  var R = null, fig = null, card = null, t = 0, ready = false, info = { state: 'loading' };

  function lin(h) { return new THREE.Color(h).convertSRGBToLinear(); }
  var grad = null;
  function tones() {   /* figure.js's tones(), copied */
    if (grad) return grad;
    var n = 32, d = new Uint8Array(n * 4);
    for (var i = 0; i < n; i++) {
      var u = i / (n - 1), e = u * u * (3 - 2 * u), v = 0.36 + 0.64 * (0.25 * u + 0.75 * e);
      d[i * 4] = Math.round(255 * Math.min(1, v * (0.94 + 0.07 * u)));
      d[i * 4 + 1] = Math.round(255 * Math.min(1, v * (0.95 + 0.04 * u)));
      d[i * 4 + 2] = Math.round(255 * Math.min(1, v * (1.04 - 0.06 * u)));
      d[i * 4 + 3] = 255;
    }
    grad = new THREE.DataTexture(d, n, 1, THREE.RGBAFormat);
    grad.minFilter = grad.magFilter = THREE.LinearFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
    return grad;
  }
  function atlas(orig) {   /* the Mage's atlas, each used cell one flat colour of hers, the rest left as drawn */
    var c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
    var x = c.getContext('2d');
    if (orig && orig.image) x.drawImage(orig.image, 0, 0, 1024, 1024);
    for (var k in CELL) { var p = k.split(','); x.fillStyle = '#' + ('000000' + CELL[k].toString(16)).slice(-6); x.fillRect(+p[0] * 128, +p[1] * 256, 128, 256); }
    var tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.flipY = false;
    tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.generateMipmaps = false;
    return tx;
  }
  function inkMat(k, skin) {   /* figure.js's ink hull: the back faces pushed out along the normal, in the castle's one ink */
    /* lin(INK): given raw, the ink drew as a mid grey (67,58,49) lighter than the wall it outlines (req 3412, 9 Nov 2026) */
    var m = new THREE.MeshBasicMaterial({ color: lin(INK), side: THREE.BackSide, skinning: !!skin });
    m.onBeforeCompile = function (sh) { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * ' + k.toFixed(5) + ';'); };
    m.customProgramCacheKey = function () { return 'f3ink' + (skin ? 's' : 'r') + k.toFixed(5); };
    return m;
  }
  function smooth(a, b, x) { var u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); }
  function load(loader, f) { return new Promise(function (res, rej) { loader.load(BASE + f, res, undefined, rej); }); }
  function addScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.body.appendChild(s); }); }

  /* ---------- the figure ---------- */
  function build(gl) {
    var body = gl.scene, skinned = [], rigid = [], byName = {};
    body.traverse(function (o) {
      if (o.isSkinnedMesh) skinned.push(o); else if (o.isMesh) rigid.push(o);
      if (o.isBone) byName[o.name] = o;
    });
    var bones = skinned[0].skeleton.bones;
    var TURNED = ['head', 'chest'].concat(PUPIL ? ['upperlegl', 'upperlegr', 'lowerlegl', 'lowerlegr'] : []).map(function (n) { return byName[n]; });
    var base = TURNED.map(function (b) { return b.quaternion.clone(); });
    function saveBase() { TURNED.forEach(function (b, i) { base[i].copy(b.quaternion); }); }
    function restoreBase() { TURNED.forEach(function (b, i) { b.quaternion.copy(base[i]); }); }
    var mixer = new THREE.AnimationMixer(body), clips = {}, acts = {};
    gl.animations.forEach(function (c) { clips[c.name] = c; });
    [['Idle_A', 'Idle'], ['Walking_A', 'Walking_A'], ['Sit_Chair_Down', 'Sit_Chair_Down'], ['Sit_Chair_Idle', 'Sit_Chair_Idle'], ['Sit_Chair_StandUp', 'Sit_Chair_StandUp']].forEach(function (p) {
      if (!clips[p[1]]) { console.warn('figure3d: no clip ' + p[1]); return; }
      var a = mixer.clipAction(clips[p[1]]);
      if (/Down|StandUp/.test(p[1])) { a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; }
      acts[p[0]] = a;
    });
    function setLegs() { byName.head.scale.setScalar(HEADK); }
    function pose(name) { for (var n in acts) acts[n].stop(); restoreBase(); acts[name].play(); mixer.update(0); saveBase(); setLegs(); body.updateMatrixWorld(true); }
    /* the skinned points where the pose puts them, in the body's frame (scale 1, at the origin) */
    var _v = new THREE.Vector3();
    function span(filter) {
      var b = new THREE.Box3();
      skinned.forEach(function (m) {
        if (filter && !filter(m)) return;
        var pa = m.geometry.attributes.position;
        for (var i = 0; i < pa.count; i += 2) { _v.fromBufferAttribute(pa, i); m.boneTransform(i, _v); _v.applyMatrix4(m.matrixWorld); b.expandByPoint(_v); }
      });
      return b;
    }
    pose('Idle_A'); var st = span();
    var s = HEIGHT / (st.max.y - st.min.y), raiseU = -st.min.y;
    /* seated: the robe's lowest point under the hips on the seat, 0.42 m (common-room.html, FIGURE_SPOTS 3) */
    pose('Sit_Chair_Idle'); var sb = span(function (m) { return m.name === 'Mage_Body'; });
    var seatU = 0.42 / s - sb.min.y;
    pose('Idle_A');
    /* materials: the toon ramp on the repainted atlas, and the ink hull */
    var orig = null; skinned.concat(rigid).some(function (m) { return m.material && m.material.map && (orig = m.material.map); });
    var cape = null, tx = atlas(orig), k = 0.0055 / s, inkS = inkMat(k, true), inkR = inkMat(k, false), calls = 0, openBook = null;
    function dress(m, sk) {
      m.material = new THREE.MeshToonMaterial({ map: tx, gradientMap: tones(), skinning: sk }); if (window.CastleHatch) CastleHatch.apply(m.material);
      var h = sk ? new THREE.SkinnedMesh(m.geometry, inkS) : new THREE.Mesh(m.geometry, inkR);
      h.frustumCulled = false; m.frustumCulled = false; h.name = m.name + '-ink';
      if (sk) { m.parent.add(h); h.bind(m.skeleton, m.bindMatrix); } else m.add(h);
      calls += 2;
    }
    skinned.forEach(function (m) { dress(m, true); });
    rigid.forEach(function (m) {
      var nm = m.name, top = m; while (top.parent && !top.parent.isBone) top = top.parent;   /* the piece's node, a bone's child */
      var key = top.name || nm;
      if (HIDE.indexOf(key) >= 0) { top.visible = false; return; }
      if (key === 'Spellbook_open') { openBook = top; top.visible = false; top.rotation.x += BOOKR[0]; top.rotation.y += BOOKR[1]; top.rotation.z += BOOKR[2]; }
      dress(m, false);
      /* the reshaped pupil's cape (req 3369): a blind look read it as a pale grey panel behind her, so it is the robe's own
         dark, flat and two-sided (one-sided, its back face drew grey; &f3cape=front shows that, &f3cape=0 hides it); and it is hidden while she sits, since a floor-length cape on the sofa went through seat and floor */
      if (PUPIL && (key === 'Mage_Cape' || nm === 'Mage_Cape')) { m.material = new THREE.MeshToonMaterial({ color: lin(COL.robe), gradientMap: tones(), side: Q.get('f3cape') === 'front' ? THREE.FrontSide : THREE.DoubleSide }); cape = top; if (Q.get('f3cape') === '0') top.visible = false; }
    });
    var book = new THREE.Group(); byName.hips.add(book);   /* the timeline's book marker; the open book in her hand shows with it */
    /* the clip's seated pose holds no hand up to read from, so the open book rests on the lap marker, tilted to her bent head
       (f3bkat=hand keeps it in the pack's hand slot, where it faced the room); f3bk turns it on the marker */
    if (openBook && (Q.get('f3bkat') || 'lap') === 'lap') { openBook.parent.remove(openBook); book.add(openBook); openBook.position.set(0, 0, 0); openBook.rotation.set(BOOKR[0], BOOKR[1], BOOKR[2]); }
    var group = new THREE.Group(); group.add(body); body.scale.setScalar(s); group.name = 'figure3d';
    /* seated (req 3369): the pupil's legs are long enough to reach the floor, but the chair clip holds the thighs level for
       the Mage's stubby ones, so her feet hung; the thighs are tipped down by SLOPE (degrees, &f3slope) about the hip, the
       shins kept as upright as the clip held them, k from 0 standing to 1 seated */
    var SLOPE = (Q.has('f3slope') ? +Q.get('f3slope') : 15) * Math.PI / 180, _w = new THREE.Quaternion(), _p = new THREE.Quaternion(),
        _r = new THREE.Quaternion(), _a = new THREE.Vector3(), _k = new THREE.Vector3(), _h = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
    function sitSlope(k) {
      if (!(k > 0) || !SLOPE) return;
      body.parent ? body.parent.updateMatrixWorld(true) : body.updateMatrixWorld(true);
      ['l', 'r'].forEach(function (sd) {
        var up = byName['upperleg' + sd], lo = byName['lowerleg' + sd]; if (!up || !lo) return;
        _h.setFromMatrixPosition(up.matrixWorld); _k.setFromMatrixPosition(lo.matrixWorld).sub(_h);
        _a.crossVectors(_k, _up).normalize();   /* turning the thigh about this axis by +angle tips the knee down */
        _r.setFromAxisAngle(_a, -SLOPE * k);
        up.parent.getWorldQuaternion(_p); up.getWorldQuaternion(_w);
        var shinW = lo.getWorldQuaternion(new THREE.Quaternion());
        up.quaternion.copy(_p.clone().invert().multiply(_r).multiply(_w));          /* thigh: world turned by _r */
        up.updateMatrixWorld(true);
        up.getWorldQuaternion(_w); lo.quaternion.copy(_w.invert().multiply(shinW));  /* shin: its world turn kept */
        lo.updateMatrixWorld(true);
      });
    }
    function lowFoot() { var y = 1e9; ['footl', 'footr', 'toesl', 'toesr'].forEach(function (n) { if (byName[n]) y = Math.min(y, _v.setFromMatrixPosition(byName[n].matrixWorld).y); }); return y; }
    return { group: group, body: body, mixer: mixer, acts: acts, cur: null, bones: byName, book: book, openBook: openBook, s: s,
             seatDy: seatU * s, raise: raiseU * s, legs: { head: HEADK, standSpanU: +(st.max.y - st.min.y).toFixed(3) },
             cape: cape, setLegs: setLegs, fixFeet: function () {}, sitSlope: PUPIL ? sitSlope : function () {}, saveBase: saveBase, restoreBase: restoreBase,
             lowFoot: lowFoot, clipNames: Object.keys(clips).length, meshes: calls };
  }

  /* ---------- the walk: one timeline, the same at every replay ---------- */
  var plan = [], pathLen = 0;
  function yawTo(a, b) { return Math.atan2(b[0] - a[0], b[1] - a[1]); }
  function makePlan() {
    var S = R.spots, P0 = [S[0].x, S[0].z], P1 = [S[1].x, S[1].z], fire = [0, -4.9];
    var front = R.onSofa(0, 0.7), seat = R.onSofa(0, 0.25), sofaYaw = R.sofaAt.yaw;
    /* the walk keeps off the hearth (after the first sheet's blind look): from the fire mark right of the fire (spot 1),
       out round toward the room, past the wingback's side, and back to the sofa's front, never between the eye and the fire */
    var way = [P1, [1.95, -2.75], [2.75, -2.85], front];
    var T = 0;
    function seg(o) { o.t0 = T; T += o.dur; plan.push(o); }
    if (ACT === 'still') { seg({ clip: 'Idle_A', dur: 1e9, at: P0, yaw: null }); return; }
    if (ACT === 'toward') { seg({ clip: 'Idle_A', dur: 0.6, at: P0, yaw: 0 }); seg({ clip: 'Walking_A', dur: 3.2 / 1.0, from: P0, to: [P0[0], P0[1] + 3.2], yaw: 0 }); seg({ clip: 'Idle_A', dur: 1e9, at: [P0[0], P0[1] + 3.2], yaw: 0 }); return; }
    seg({ clip: 'Idle_A', dur: 2.5, at: P1, yaw: yawTo(P1, fire) });
    for (var i = 0; i < way.length - 1; i++) { var L = Math.hypot(way[i + 1][0] - way[i][0], way[i + 1][1] - way[i][1]); seg({ clip: 'Walking_A', dur: L / 1.0, from: way[i], to: way[i + 1], yaw: yawTo(way[i], way[i + 1]) }); }
    seg({ clip: 'Idle_A', dur: 0.9, at: front, yaw: sofaYaw, turn: true });
    var dDown = R._clipDur.Sit_Chair_Down || 1.5, dUp = R._clipDur.Sit_Chair_StandUp || 1.5;
    seg({ clip: 'Sit_Chair_Down', dur: dDown, from: front, to: seat, yaw: sofaYaw, sit: [0, 1] });
    seg({ clip: 'Sit_Chair_Idle', dur: 6, at: seat, yaw: sofaYaw, sit: [1, 1], read: [0, 1] });
    seg({ clip: 'Sit_Chair_Idle', dur: 5, at: seat, yaw: sofaYaw, sit: [1, 1], read: [1, 0], look: [0, 1] });
    seg({ clip: 'Sit_Chair_StandUp', dur: dUp, from: seat, to: front, yaw: sofaYaw, sit: [1, 0] });
    var back = way.slice().reverse();
    for (i = 0; i < back.length - 1; i++) { L = Math.hypot(back[i + 1][0] - back[i][0], back[i + 1][1] - back[i][1]); seg({ clip: 'Walking_A', dur: L / 1.0, from: back[i], to: back[i + 1], yaw: yawTo(back[i], back[i + 1]) }); }
    pathLen = T;
  }
  var _q = new THREE.Quaternion(), _e = new THREE.Euler(), yawNow = null;
  function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
  function step(dt) {
    t += dt;
    var tt = pathLen ? t % pathLen : t, sgi = plan.length - 1;
    for (var i = 0; i < plan.length; i++) if (tt < plan[i].t0 + plan[i].dur) { sgi = i; break; }
    var sg = plan[sgi], u = Math.min(1, (tt - sg.t0) / sg.dur), F = fig, G = F.group;
    if (F.curSeg !== sg) {
      var a = F.acts[sg.clip];
      if (a !== F.cur) { a.reset(); a.play(); if (F.cur) a.crossFadeFrom(F.cur, /Sit_Chair_(Down|StandUp)/.test(sg.clip) || F.cur === F.acts.Sit_Chair_Idle ? 0.15 : 0.3, false); F.cur = a; }
      F.curSeg = sg;
    }
    var e = sg.sit ? smooth(0, 1, u) : u, p = sg.at || [sg.from[0] + (sg.to[0] - sg.from[0]) * e, sg.from[1] + (sg.to[1] - sg.from[1]) * e];
    var sv = sg.sit ? sg.sit[0] + (sg.sit[1] - sg.sit[0]) * smooth(0, 1, u) : 0;
    G.position.set(p[0], F.raise + (F.seatDy - F.raise) * sv, p[1]);
    var want = sg.yaw;
    if (ACT === 'still') want = Math.atan2(R.camera.position.x - p[0], R.camera.position.z - p[1]) + ANGLE;
    if (yawNow === null) yawNow = want;
    yawNow += angDiff(yawNow, want) * Math.min(1, dt * (sg.turn ? 5 : 7));
    if (ACT === 'still' || sg.sit) yawNow = want;
    G.rotation.y = yawNow;
    F.restoreBase(); F.mixer.update(dt); F.saveBase();
    /* the pupil's longer arms hang nearer her sides than the Mage's clip holds them (req 3369); &f3arm=axis,degrees */
    if (PUPIL && ARMDROP) ['l', 'r'].forEach(function (s) {
      var b = F.bones['upperarm' + s]; if (!b) return;
      var d = ARMDROP[1] * (s === 'l' ? 1 : -1), e = ARMDROP[0];
      b.quaternion.multiply(_q.setFromEuler(_e.set(e === 'x' ? d : 0, e === 'y' ? d : 0, e === 'z' ? d : 0)));
    });
    /* reading and the turn to the eye, by hand on the clip's pose */
    var rd = sg.read ? sg.read[0] + (sg.read[1] - sg.read[0]) * smooth(0, 0.25, u) : 0;
    var lk = sg.look ? sg.look[0] + (sg.look[1] - sg.look[0]) * smooth(0, 0.3, u) : 0;
    if (F.cape) F.cape.visible = !(sv > 0.02 || sg.clip === 'Sit_Chair_Idle');
    F.book.visible = !!(sg.read || sg.look) && sg.clip === 'Sit_Chair_Idle';
    if (F.openBook) F.openBook.visible = F.book.visible;
    if (F.book.visible) { F.book.position.set(0, 0.17 / F.s, 0.2 / F.s); F.book.rotation.set(-0.5 - 0.5 * rd, 0, 0); }
    var head = F.bones.head, chest = F.bones.chest;
    if (rd > 0) head.quaternion.multiply(_q.setFromEuler(_e.set(0.45 * rd, 0, 0)));
    if (lk > 0) {
      var toEye = Math.atan2(R.camera.position.x - G.position.x, R.camera.position.z - G.position.z);
      var d = Math.max(-1.2, Math.min(1.2, angDiff(yawNow, toEye))) * lk;
      chest.quaternion.multiply(_q.setFromEuler(_e.set(0, 0.35 * d, 0)));
      head.quaternion.multiply(_q.setFromEuler(_e.set(-0.05 * lk, 0.65 * d, 0)));
    }
    F.setLegs(); F.sitSlope(sg.sit ? (sg.clip === 'Sit_Chair_Idle' ? 1 : sv) : 0); G.updateMatrixWorld(true); F.fixFeet();
  }

  /* ---------- the drawn card, as the room places a pool card (poolCard) ---------- */
  function makeCard() {
    var w = 690 / 850, h = 1384 / 850, cq = Q.get('f3card') || '', S = R.spots[ACT === 'loop' ? 0 : 1];
    if (cq === 'beside') S = { x: R.spots[0].x - 0.8, z: R.spots[0].z + 0.05 };   /* for a close look: 0.8 m left of the 3D figure's mark */
    if (/^spot\d$/.test(cq)) S = R.spots[+cq.slice(4)];                         /* on a mark of its own, as poolCard stands one */
    var tx = new THREE.TextureLoader().load('../assets/layers/clementine-figure.png'); tx.encoding = THREE.sRGBEncoding;
    var g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (var i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) / 4);   /* cell 0, the front view */
    var m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tx, color: 0xffffff, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 }));
    m.position.set(S.x, h / 2, S.z); m.name = 'figure3d-card';
    R.scene.add(m); R.facers.push(m);
    return m;
  }

  function start(ctx) {
    R = ctx;
    if (SHOW_CARD) card = makeCard();
    if (!SHOW_FIG) { info.state = 'card only'; return api; }
    if (Q.get('f3glb')) { startLib(Q.get('f3glb')); return api; }
    var loader;
    addScript('people/GLTFLoader.js?v=1').then(function () {
      loader = new THREE.GLTFLoader();
      return load(loader, PUPIL ? 'Mage-pupil.glb?v=4' : 'Mage.glb');
    }).then(function (r) {
      fig = build(r);
      R._clipDur = {}; for (var n in fig.acts) R._clipDur[n] = fig.acts[n].getClip().duration;
      makePlan();
      R.scene.add(fig.group);
      if (HOLD >= 0) { var dt = 1 / 60; while (t + dt <= HOLD) step(dt); step(Math.max(0, HOLD - t)); }
      else step(0);
      ready = true;
      info = { state: 'ready', scale: +fig.s.toFixed(4), seatDy: +fig.seatDy.toFixed(3), raise: +fig.raise.toFixed(3), legs: fig.legs, meshes: fig.meshes, clips: fig.clipNames, used: Object.keys(fig.acts), loop: +pathLen.toFixed(2), durations: R._clipDur, segs: plan.map(function (q) { return q.clip + '@' + q.t0.toFixed(2); }) };
    }).catch(function (e) { info = { state: 'failed', error: String(e && e.message || e) }; console.error('figure3d: ' + info.error); });
    return api;
  }

  /* ---------- a library figure (req 3406, 3412): &f3glb=people/models/lib/girl-17.glb ----------
     People's MPFB bodies (game_engine rig, clip Walk). The same toon ramp, ink hull and shared hatching as the stand-in, at
     HEIGHT, on the fire mark's spot 0 (still: turned &f3angle degrees from facing the eye; &f3act=toward walks 3.2 m toward the
     eye; &f3t=seconds holds the clip there). No sitting clip exists on this rig, so no seated shot. */
  var lib = null;
  function primMat(gl, nm) {
    var j = gl.parser && gl.parser.json; if (!j || !j.meshes) return '';
    var mt = /^(.*?)(?:_(\d+))?$/.exec(nm || ''), base = mt[1], i = mt[2] ? +mt[2] : 0;
    for (var k = 0; k < j.meshes.length; k++) {
      if ((j.meshes[k].name || '').replace(/\./g, '') !== base) continue;
      var pr = j.meshes[k].primitives[i]; return pr && j.materials && j.materials[pr.material] ? j.materials[pr.material].name : '';
    }
    return '';
  }
  /* req 5121 (People): a glb's morph targets (the falling sleeve) play on the page: the toon, hull and back materials draw morphs, and the -ink and -back
     copies share the original mesh's weights, so the clip's weights channel moves cloth and hull together. &f3morph=0 is the before */
  function shareMorph(o, m) {
    if (Q.get('f3morph') === '0' || !m.morphTargetInfluences) return;
    o.morphTargetInfluences = m.morphTargetInfluences; o.morphTargetDictionary = m.morphTargetDictionary;
  }
  function startLib(path) {
    addScript('people/GLTFLoader.js?v=1').then(function () {
      return new Promise(function (res, rej) { new THREE.GLTFLoader().load(path, res, undefined, rej); });
    }).then(function (gl) {
      var body = gl.scene, skinned = [];
      body.traverse(function (o) { if (o.isSkinnedMesh) skinned.push(o); });
      var clip = gl.animations.filter(function (a) { return a.name === 'Walk'; })[0] || gl.animations[0];
      var mixer = new THREE.AnimationMixer(body), act = mixer.clipAction(clip); act.play(); mixer.setTime(HOLD >= 0 ? HOLD : 0); body.updateMatrixWorld(true);
      /* 4-pre (req 3412, 9 Nov 2026): the ink hull at 5.5 mm drew under 1 px at the hearth, so 13 mm (about 1.5 px there,
         &f3ink= in metres to try another); an untextured body takes the card's own skin under the room's light, 0x8c6a55 (of three tried, nearest the card in brightness),
         worked back from the card skin's rendered colour over a white body's (docs/common-room/lib-figure-3406/measure.py) */
      var box = new THREE.Box3().setFromObject(body), s = HEIGHT / (box.max.y - box.min.y), k = (Q.has('f3ink') ? +Q.get('f3ink') : 0.013) / s;
      var ink = inkMat(k, true); ink.morphTargets = Q.get('f3morph') !== '0'; var bare = lin(Q.has('f3tone') ? parseInt(Q.get('f3tone'), 16) : 0x8c6a55);
      skinned.forEach(function (m) {
        var old = m.material;
        /* req 5103 (People): a material that carries vertex colours (People's robe glbs: robe, collar, tie, strip, bronze, one COLOR_0 each) keeps them under the toon
           material; the bare tone stays on skin and on any mesh without colours. &f3vc=0 turns it off for a before shot */
        /* the loader shares one material across primitives of equal settings, so every primitive says 'robe3-skin'; the glTF's own
           material name for this primitive is read from its JSON (mesh name, then _<n> for the nth primitive) */
        var mn = primMat(gl, m.name), keepVc = !!(old.vertexColors || (m.geometry && m.geometry.attributes.color)) && !old.map && !/skin/i.test(mn || old.name || '') && Q.get('f3vc') !== '0';
        m.material = new THREE.MeshToonMaterial({ color: (old.map || keepVc) ? 0xffffff : bare, map: old.map || null, vertexColors: keepVc, gradientMap: tones(), skinning: true, morphTargets: Q.get('f3morph') !== '0' });
        if (window.CastleHatch) CastleHatch.apply(m.material);
        /* req 3564 (People, Fawkes's ruling of 12.52 pm): a robe's inside, seen through the lifted back hem in a walk, drew as the ink hull's flat black
           flap; its back faces are now the robe's own dark, flat (as the pupil's cape is), nearer than the hull so they win the depth test;
           &f3robeback=0 turns it off for a before shot */
        if (/robe/i.test(old.name || '') && Q.get('f3robeback') !== '0') {
          var bk = new THREE.SkinnedMesh(m.geometry, new THREE.MeshBasicMaterial({ color: lin(COL.robe), side: THREE.BackSide, skinning: true, morphTargets: Q.get('f3morph') !== '0' })); bk.frustumCulled = false; bk.name = m.name + '-back';
          shareMorph(bk, m); m.parent.add(bk); bk.bind(m.skeleton, m.bindMatrix);
        }
        var h = new THREE.SkinnedMesh(m.geometry, ink); h.frustumCulled = false; m.frustumCulled = false; h.name = m.name + '-ink';
        shareMorph(h, m); m.parent.add(h); h.bind(m.skeleton, m.bindMatrix);
      });
      var group = new THREE.Group(); body.scale.setScalar(s); body.position.y = -box.min.y * s; group.add(body); R.scene.add(group);
      /* &f3fig=hide (req 3412, the shot freeze): loaded and placed but not drawn, colour and depth off and its shadow kept,
         so the background plate for measure.py matches the figure frame in every load and draw but the figure */
      if (HIDE_FIG) body.traverse(function (o) { if (o.material) { o.material.colorWrite = false; o.material.depthWrite = false; } });
      lib = { group: group, mixer: mixer, t: HOLD >= 0 ? HOLD : 0, p0: [R.spots[0].x, R.spots[0].z], yaw: null };
      libStep(0);
      ready = true; info = { state: 'ready (library figure)', scale: +s.toFixed(4), glb: path, clip: clip.name, height: HEIGHT };
    }).catch(function (e) { info = { state: 'failed', error: String(e && e.message || e) }; console.error('figure3d: ' + info.error); });
  }
  function libStep(dt) {
    if (!lib) return;
    if (HOLD < 0) { lib.t += dt; lib.mixer.update(dt); }
    var p = lib.p0.slice();
    if (ACT === 'toward') p[1] += Math.min(3.2, lib.t * 1.0);
    lib.group.position.set(p[0], 0, p[1]);
    lib.group.rotation.y = ACT === 'toward' ? 0 : Math.atan2(R.camera.position.x - p[0], R.camera.position.z - p[1]) + ANGLE;
    lib.group.updateMatrixWorld(true);
  }

  /* the sofa is hers while the mockup runs: a drawn pupil the room's timetable puts on it would sit inside her, so any pool
     card within 1.2 m of her seat is kept hidden (the room's own figures elsewhere are untouched) */
  function clearSofa() {
    if (!R || !R.poolCards || !SHOW_FIG) return;
    var seat = R.onSofa(0, 0.25);
    for (var c in R.poolCards) { var m = R.poolCards[c]; if (m && m.visible && Math.hypot(m.position.x - seat[0], m.position.z - seat[1]) < 1.2) m.visible = false; }
  }
  function update(dt) { if (lib) { libStep(dt); return; } if (ready && HOLD < 0) step(dt); if (ready) clearSofa(); }
  var api = { start: start, update: update, _fig: function () { return fig; }, _ctx: function () { return R; }, info: function () {
    if (fig) fig.group.updateMatrixWorld(true);
    return Object.assign({ t: +t.toFixed(2), at: fig ? fig.group.position.toArray().map(function (x) { return +x.toFixed(3); }) : null,
      footJointY: fig ? +fig.lowFoot().toFixed(3) : null }, info); } };
  window.Figure3D = api;
})();
