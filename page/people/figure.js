/* figure.js: the castle's people in simple 3D, the Pickett pilot (req 1139; Godric's 1 on Dumbledore's 3D report, 27
   October 2026, docs/ministry/reviews/2026-10-27-dumbledore-3d-figures.md, part 4). Built in code, no drawing: a robed
   figure of turned and rounded parts, toon tones (three steps, MeshToonMaterial) and the suit's dark ink line pushed out
   from the surface (page/corridor/suit.js). Three r128, the global the pages load. A trial: the rooms stay 2.5D and no
   built figure is touched.

   CastleFigure.make(THREE, opts)  one standing figure, skinned, two draw calls (the body and its ink).
       opts { look: 'pickett' (default) or 'pupil', height (m), robe, trim, skin, hair (hex), hat (true by default for
       Pickett), wand (true) }. Returns { group, mesh, ink, bones, act(steps), update(dt), busy(), light(k) }: the
       group's origin is on the floor between the feet, facing +z. act([...]) queues steps, each one of { to: [x, z] }
       (walk there in the parent's x and z), { face: radians } (turn on the spot; rotation.y, 0 facing +z), { flick: 1 }
       (the wand flicked, no glow, no trail), { wait: s }. update(dt) runs them and the idle between; busy() is true
       while any step is left. light(k): k 0 by day to 1 at full night, a little of the candles' warmth on the cloth.
   CastleFigure.crowd(THREE, list)  seated pupils, instanced: the whole class is two draw calls. list of { at: [x, y,
       z] (the chair's middle on the floor), rot (radians, 0 facing +z, toward the desk), scale, trim (house), skin,
       hair (hex), long (true for long hair), hat }. Returns { group, mesh, ink, update(t), light(k) }; update(t) gives
       each a slow breath and a small look about, in its own time.
   CastleFigure.HOUSES  the house colours, tools/people-house-keys.py's: first colour for the hood's lining and the
       robe's facings. */
(function () {
  'use strict';
  var THREE, grad = null;
  var HOUSES = { gryffindor: 0x9b2318, hufflepuff: 0xd4a62a, ravenclaw: 0x2a4a7a, slytherin: 0x2e5a3a };
  var INK = 0x16120e;
  function lin(h) { return new THREE.Color(h).convertSRGBToLinear(); }
  function tones() {   /* three steps of light on the cloth: the shade, the half, the lit */
    if (grad) return grad;
    var d = new Uint8Array([105, 105, 105, 255, 178, 178, 178, 255, 255, 255, 255, 255]);
    grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
    grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
    return grad;
  }

  /* The kit: every part baked into one geometry, its colour per triangle (or a slot the crowd fills per pupil) and its
     bone. colour(c) is given the triangle's middle and returns a hex, or { slot: n } for the crowd's own colours */
  function Kit() { this.p = []; this.n = []; this.c = []; this.s = []; this.si = []; this.sw = []; }
  Kit.prototype.add = function (geo, m, colour, bone) {
    var g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (!g.attributes.normal) g.computeVertexNormals();
    if (m) g.applyMatrix4(m);
    var P = g.attributes.position.array, N = g.attributes.normal.array, v = new THREE.Vector3();
    for (var t = 0; t < P.length; t += 9) {
      v.set((P[t] + P[t + 3] + P[t + 6]) / 3, (P[t + 1] + P[t + 4] + P[t + 7]) / 3, (P[t + 2] + P[t + 5] + P[t + 8]) / 3);
      var k = typeof colour === 'function' ? colour(v) : colour, slot = 0, cc;
      if (k !== null && typeof k === 'object') { slot = k.slot; cc = lin(k.base !== undefined ? k.base : 0xffffff); } else cc = lin(k);
      for (var j = 0; j < 9; j += 3) {
        var px = P[t + j], py = P[t + j + 1], pz = P[t + j + 2];
        this.p.push(px, py, pz); this.n.push(N[t + j], N[t + j + 1], N[t + j + 2]); this.c.push(cc.r, cc.g, cc.b); this.s.push(slot);
        var b = typeof bone === 'function' ? bone(py) : [bone, 0, 1];   /* [bone a, bone b, weight of a] */
        this.si.push(b[0], b[1], 0, 0); this.sw.push(b[2], 1 - b[2], 0, 0);
      }
    }
  };
  Kit.prototype.geometry = function (skinned) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('aSlot', new THREE.Float32BufferAttribute(this.s, 1));
    if (skinned) {
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4));
      g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    }
    g.computeBoundingSphere();
    return g;
  };
  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    var m = new THREE.Matrix4();
    m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)),
              new THREE.Vector3(sx || 1, sy || sx || 1, sz || sx || 1));
    return m;
  }
  /* a tapered sleeve or limb from a to b, its radius ra at a and rb at b */
  function between(a, b, ra, rb, seg) {
    var d = new THREE.Vector3().subVectors(b, a), len = d.length();
    var g = new THREE.CylinderGeometry(rb, ra, len, seg || 10, 1, false);
    var q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(d.multiplyScalar(0.5)), q, new THREE.Vector3(1, 1, 1)));
    return g;
  }
  function V(x, y, z) { return new THREE.Vector3(x, y, z); }
  /* the turn round a lathe of n segments of a triangle's middle, taken at its segment's middle, so both triangles of
     a quad fall the same side of a band's edge (no sawtooth) */
  function round(x, z, n) {
    var st = Math.PI * 2 / n, a = Math.atan2(x, z); if (a < 0) a += Math.PI * 2;
    a = (Math.floor(a / st) + 0.5) * st; return Math.abs(a > Math.PI ? a - Math.PI * 2 : a);
  }

  /* The head, shared by the standing figure and the crowd: c its middle, r its radius. o { skin, hair (hex or slot
     objects), long, moustache, goatee, hat, hatCol, band, eyes } */
  function head(kit, c, r, o, bone) {
    var skin = o.skin, hair = o.hair, dark = 0x1a1410;
    kit.add(new THREE.SphereGeometry(r, 18, 12), M(c.x, c.y, c.z, 0, 0, 0, 0.9, 1.07, 0.97), skin, bone);
    kit.add(new THREE.SphereGeometry(r * 0.5, 10, 6), M(c.x, c.y - r * 0.55, c.z + r * 0.18, 0, 0, 0, 1.15, 0.8, 1.1), skin, bone);   /* the jaw */
    [-1, 1].forEach(function (s) {
      kit.add(new THREE.SphereGeometry(r * 0.115, 8, 6), M(c.x + s * r * 0.36, c.y + r * 0.02, c.z + r * 0.86, 0, 0, 0, 1, 1.25, 0.5), dark, bone);
      kit.add(new THREE.BoxGeometry(r * 0.34, r * 0.07, r * 0.08), M(c.x + s * r * 0.37, c.y + r * 0.27, c.z + r * 0.86, 0, 0, s * -0.12), hair, bone);
      kit.add(new THREE.SphereGeometry(r * 0.22, 8, 6), M(c.x + s * r * 0.9, c.y - r * 0.05, c.z, 0, 0, 0, 0.45, 1, 0.7), skin, bone);
    });
    kit.add(new THREE.SphereGeometry(r * 0.14, 8, 6), M(c.x, c.y - r * 0.18, c.z + r * 0.95, 0.2, 0, 0, 0.9, 1.25, 1.1), skin, bone);   /* the nose */
    if (!o.moustache) kit.add(new THREE.BoxGeometry(r * 0.3, r * 0.045, r * 0.05), M(c.x, c.y - r * 0.5, c.z + r * 0.88), 0x5a3028, bone);   /* the mouth */
    /* the hair: a cap tipped back so the brow is clear and the nape covered */
    kit.add(new THREE.SphereGeometry(r * 1.07, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), M(c.x, c.y + r * 0.04, c.z - r * 0.03, -0.42, 0, 0, 0.93, 1.06, 1.0), hair, bone);
    if (o.long) {
      var lh = o.long === true ? hair : o.long;
      kit.add(new THREE.SphereGeometry(r, 14, 10), M(c.x, c.y - r * 0.55, c.z - r * 0.42, 0, 0, 0, 1.0, 1.25, 0.62), lh, bone);
      [-1, 1].forEach(function (s) { kit.add(new THREE.SphereGeometry(r * 0.3, 8, 8), M(c.x + s * r * 0.82, c.y - r * 0.55, c.z - r * 0.05, 0, 0, 0, 0.7, 2.0, 0.9), lh, bone); });
    }
    if (o.moustache) {   /* waxed, the ends curled up: a showman's */
      [-1, 1].forEach(function (s) {
        var cv = new THREE.CatmullRomCurve3([V(c.x, c.y - r * 0.38, c.z + r * 1.0), V(c.x + s * r * 0.34, c.y - r * 0.43, c.z + r * 0.93),
          V(c.x + s * r * 0.62, c.y - r * 0.3, c.z + r * 0.76), V(c.x + s * r * 0.68, c.y - r * 0.1, c.z + r * 0.68)]);
        kit.add(new THREE.TubeGeometry(cv, 10, r * 0.065, 6, false), null, hair, bone);
      });
    }
    if (o.goatee) kit.add(new THREE.ConeGeometry(r * 0.17, r * 0.5, 8), M(c.x, c.y - r * 1.0, c.z + r * 0.62, Math.PI - 0.35, 0, 0), hair, bone);
    if (o.hat) {   /* the pointed hat, its tip bent back, a band round it */
      var hb = c.y + r * 0.62, hc = o.hatCol;
      kit.add(new THREE.CylinderGeometry(r * 1.8, r * 1.8, r * 0.07, 20), M(c.x, hb, c.z - r * 0.05, -0.1, 0, 0), hc, bone);
      kit.add(new THREE.CylinderGeometry(r * 0.32, r * 1.04, r * 2.1, 16, 1, true), M(c.x, hb + r * 1.05, c.z - r * 0.12, -0.12, 0, 0), hc, bone);
      kit.add(new THREE.CylinderGeometry(0, r * 0.33, r * 1.3, 10, 1, true), M(c.x, hb + r * 2.45, c.z - r * 0.55, -0.62, 0, 0), hc, bone);
      if (o.band !== undefined) kit.add(new THREE.CylinderGeometry(r * 0.99, r * 1.05, r * 0.26, 16, 1, true), M(c.x, hb + r * 0.17, c.z - r * 0.06, -0.12, 0, 0), o.band, bone);
    }
  }

  /* the hood, down on the back of the shoulders: a soft fold of the robe's cloth, its lining showing along the rim. y the
     shoulders' height, w their half width */
  function hood(kit, y, w, robe, lining, bone) {
    kit.add(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), M(0, y - w * 0.32, -w * 0.62, 0.25, 0, 0, w * 0.8, w * 0.95, w * 0.42), robe, bone);
    kit.add(new THREE.TorusGeometry(1, 0.09, 6, 20, Math.PI), M(0, y + w * 0.06, -w * 0.5, Math.PI * 0.5 + 0.35, 0, Math.PI, w * 0.78, w * 0.62, w * 0.62), lining, bone);
  }

  /* ---- the standing figure ---- */
  var LOOKS = {
    pickett: { height: 1.86, robe: 0x4a2340, trim: 0xb08a48, skin: 0xd9a888, hair: 0x3a2618, hat: true, wand: true,
               moustache: true, goatee: true, collar: 0xeeeae0, cravat: 0x7a1e2a, under: 0x231a22, shoe: 0x15110f },
    pupil: { height: 1.45, robe: 0x1c1a1e, trim: HOUSES.gryffindor, skin: 0xe8bfa0, hair: 0x5a3a22, hat: false, wand: true,
             collar: 0xeeeae0, under: 0x55524e, shoe: 0x15110f }
  };
  /* the bones, in the bind pose (metres, at the built height of 1.80; the group scales to opts.height) */
  var B = { root: 0, hips: 1, hem: 2, spine: 3, head: 4, shL: 5, elL: 6, shR: 7, elR: 8, footL: 9, footR: 10 };

  function make(T, opts) {
    THREE = T; opts = opts || {};
    var L = Object.assign({}, LOOKS[opts.look || 'pickett'], opts), child = (opts.look === 'pupil');
    var kit = new Kit();
    var hr = child ? 0.122 : 0.113, neckY = 1.52, hc = V(0, neckY + hr * 0.98, 0.012);
    var robe = L.robe, trim = L.trim;
    /* the robe: turned, flattened front to back; the facings and the hem's band in the trim, the hood's lining showing
       across the back of the shoulders, and between the facings above the waist the coat beneath */
    var prof = [[0.001, 0.075], [0.255, 0.06], [0.245, 0.3], [0.215, 0.6], [0.18, 0.88], [0.168, 1.0], [0.18, 1.15],
                [0.196, 1.28], [0.194, 1.37], [0.172, 1.43], [0.125, 1.475], [0.075, 1.51], [0.058, 1.54]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    var robeCol = function (v) {
      var a = round(v.x, v.z / 0.68, 48);
      if (v.y < 0.11 && v.y > 0.06) return trim;
      if (a < 0.14 && v.y < 1.45) return L.under;
      if (a < 0.27 && v.y < 1.46) return trim;
      return robe;
    };
    var robeW = function (y) {
      if (y < 0.5) return [B.hem, 0, 1];
      if (y < 0.85) return [B.hem, B.hips, 1 - (y - 0.5) / 0.35];
      if (y < 1.0) return [B.hips, B.spine, 1 - (y - 0.85) / 0.15];
      return [B.spine, 0, 1];
    };
    kit.add(new THREE.LatheGeometry(prof, 48), M(0, 0, 0, 0, 0, 0, 1, 1, 0.68), robeCol, robeW);
    hood(kit, 1.39, 0.205, robe, trim, B.spine);
    /* the neck, the collar and (Pickett's) the cravat */
    kit.add(new THREE.CylinderGeometry(hr * 0.4, hr * 0.44, 0.12, 12), M(0, neckY + 0.02, 0.0), L.skin, B.head);
    kit.add(new THREE.CylinderGeometry(hr * 0.5, hr * 0.56, 0.07, 14, 1, true), M(0, neckY - 0.01, 0.005), L.collar, B.spine);
    if (L.cravat) kit.add(new THREE.SphereGeometry(0.045, 10, 8), M(0, neckY - 0.06, 0.07, 0, 0, 0, 1.1, 1.3, 0.55), L.cravat, B.spine);
    head(kit, hc, hr, { skin: L.skin, hair: L.hair, moustache: L.moustache, goatee: L.goatee, long: L.long,
                         hat: L.hat, hatCol: robe, band: trim }, B.head);
    /* the arms: a sleeve to the elbow, a wide sleeve to the wrist, the hand; the wand in the right, pointing ahead */
    [[-1, B.shL, B.elL], [1, B.shR, B.elR]].forEach(function (a) {
      var s = a[0], sh = V(s * 0.19, 1.41, 0), el = V(s * 0.215, 1.13, 0.0), wr = V(s * 0.215, 0.87, 0.03);
      kit.add(between(sh, el, 0.06, 0.066), null, robe, a[1]);
      kit.add(new THREE.SphereGeometry(0.066, 10, 8), M(el.x, el.y, el.z), robe, a[1]);
      kit.add(between(el, wr, 0.066, 0.1, 14), null, function (v) { return v.y < 0.92 ? trim : robe; }, a[2]);
      kit.add(new THREE.SphereGeometry(0.043, 10, 8), M(wr.x, wr.y - 0.05, wr.z + 0.01, 0, 0, 0, 0.85, 1.2, 1), L.skin, a[2]);
      if (s > 0 && L.wand) {
        var w0 = V(wr.x, wr.y - 0.06, wr.z + 0.0), w1 = V(wr.x, wr.y - 0.1, wr.z + 0.33);
        kit.add(between(w0, w1, 0.009, 0.0045, 6), null, function (v) { return v.z < wr.z + 0.08 ? 0x3a2418 : 0x8a6a48; }, a[2]);
      }
    });
    [[-1, B.footL], [1, B.footR]].forEach(function (f) {
      kit.add(new THREE.SphereGeometry(0.05, 10, 8), M(f[0] * 0.085, 0.035, 0.1, 0, 0, 0, 1, 0.75, 2.3), L.shoe, f[1]);
    });

    var geo = kit.geometry(true);
    var mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: tones(), skinning: true });
    var inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, skinning: true });
    inkMat.onBeforeCompile = function (sh) { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.0075;'); };

    /* the skeleton */
    var bones = [], pos = [[0, 0, 0], [0, 0.95, 0], [0, -0.35, 0], [0, 0.05, 0], [0, 0.57, 0.01], [-0.19, 0.41, 0], [-0.025, -0.28, 0],
                            [0.19, 0.41, 0], [0.025, -0.28, 0], [-0.085, 0, 0], [0.085, 0, 0]];
    var parent = [-1, 0, 1, 1, 3, 3, 5, 3, 7, 0, 0];
    pos.forEach(function (p, i) { var b = new THREE.Bone(); b.position.fromArray(p); bones.push(b); if (parent[i] >= 0) bones[parent[i]].add(b); });
    var base = bones.map(function (b) { return b.position.clone(); });
    var mesh = new THREE.SkinnedMesh(geo, mat), ink = new THREE.SkinnedMesh(geo, inkMat);
    mesh.add(bones[0]); mesh.updateMatrixWorld(true);
    var skel = new THREE.Skeleton(bones);
    mesh.bind(skel); ink.bind(skel, mesh.bindMatrix);
    mesh.frustumCulled = ink.frustumCulled = false;
    var group = new THREE.Group(), body = new THREE.Group();
    body.scale.setScalar(L.height / 1.8);
    body.add(mesh); body.add(ink); group.add(body);
    group.name = 'figure-' + (opts.look || 'pickett');

    /* ---- moving: a queue of steps, the walk and the idle laid over each other ---- */
    var q = [], cur = null, phase = 0, walkW = 0, flickT = -1, clock = 0, turnT = 0;
    var STRIDE = 1.25 * L.height / 1.8, SPEED = child ? 0.95 : 1.05;
    function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
    function turnToward(h, dt, rate) {
      var d = angDiff(group.rotation.y, h), m = rate * dt;
      group.rotation.y += Math.abs(d) < m ? d : Math.sign(d) * m;
      return Math.abs(d) < 0.02;
    }
    function step(dt) {
      if (!cur && q.length) { cur = q.shift(); cur.t = 0; }
      var moving = false, turning = false;
      if (cur) {
        cur.t += dt;
        if (cur.to) {
          var dx = cur.to[0] - group.position.x, dz = cur.to[1] - group.position.z, d = Math.hypot(dx, dz);
          if (d < 0.02) { cur = null; }
          else {
            var aligned = turnToward(Math.atan2(dx, dz), dt, 3.2), ad = Math.abs(angDiff(group.rotation.y, Math.atan2(dx, dz)));
            var v = SPEED * Math.max(0, 1 - ad / 1.2) * Math.min(1, d / 0.35 + 0.25), mv = Math.min(d, v * dt);
            group.position.x += dx / d * mv; group.position.z += dz / d * mv;
            phase = (phase + mv / STRIDE) % 1; moving = true; turning = !aligned;
          }
        } else if (cur.face !== undefined) {
          if (turnToward(cur.face, dt, 2.6)) cur = null; else turning = true;
        } else if (cur.flick) {
          if (flickT < 0) flickT = 0;
          flickT += dt / 1.15;
          if (flickT >= 1) { flickT = -1; cur = null; }
        } else if (cur.wait !== undefined) {
          if (cur.t >= cur.wait) cur = null;
        } else cur = null;
      }
      walkW += ((moving ? 1 : 0) - walkW) * Math.min(1, dt * 6);
      if (!moving) { var n = Math.round(phase * 2) / 2; phase += (n - phase) * Math.min(1, dt * 5); }
      if (turning && !moving) turnT += dt * 2.2; else turnT *= 0.9;
      clock += dt;
      pose();
    }
    function pose() {
      bones.forEach(function (b, i) { b.position.copy(base[i]); b.rotation.set(0, 0, 0); });
      var s = Math.sin(2 * Math.PI * phase), c = Math.cos(2 * Math.PI * phase), w = walkW;
      /* the idle: a breath, the chin a little high (he knows he is watched), a slow look about */
      bones[B.spine].rotation.x = 0.012 * Math.sin(clock * 1.7);
      bones[B.head].rotation.x = child ? 0.02 : -0.07;
      bones[B.head].rotation.y = 0.16 * Math.sin(clock * 0.37) * (1 - w);
      bones[B.elL].rotation.x = -0.18; bones[B.elR].rotation.x = -0.35;
      /* the walk */
      bones[B.footL].position.z += 0.17 * s * w; bones[B.footL].position.y += 0.035 * Math.max(0, c) * w;
      bones[B.footR].position.z -= 0.17 * s * w; bones[B.footR].position.y += 0.035 * Math.max(0, -c) * w;
      bones[B.hips].position.y += (0.012 * Math.cos(4 * Math.PI * phase) - 0.008) * w;
      bones[B.hips].rotation.y = 0.07 * s * w; bones[B.spine].rotation.y = -0.09 * s * w;
      bones[B.hem].rotation.x = 0.05 * w; bones[B.hem].rotation.z = 0.03 * s * w;
      bones[B.shL].rotation.x = 0.32 * s * w; bones[B.shR].rotation.x = -0.2 * s * w;
      /* the shuffle of a turn on the spot */
      if (turnT > 0.01) { var ts = Math.sin(turnT * Math.PI); bones[B.footL].position.y += 0.025 * Math.max(0, ts); bones[B.footR].position.y += 0.025 * Math.max(0, -ts); }
      /* the flick: the arm up, a snap of the forearm, back down */
      if (flickT >= 0) {
        var t = flickT, up = t < 0.3 ? ease(t / 0.3) : t > 0.75 ? 1 - ease((t - 0.75) / 0.25) : 1;
        var snap = t > 0.42 && t < 0.62 ? Math.sin((t - 0.42) / 0.2 * Math.PI) : 0;
        bones[B.shR].rotation.x = -1.15 * up; bones[B.shR].rotation.z = 0.12 * up;
        bones[B.elR].rotation.x = -0.35 - 0.45 * up - 0.75 * snap;
        bones[B.spine].rotation.y += -0.12 * up; bones[B.head].rotation.x += 0.08 * up;
      }
    }
    function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    pose();
    var day = mat.color.clone();
    return {
      group: group, mesh: mesh, ink: ink, bones: bones,
      act: function (steps) { steps.forEach(function (s) { q.push(Object.assign({}, s)); }); },
      update: function (dt) { step(Math.min(dt, 0.1)); },
      busy: function () { return !!cur || q.length > 0 || flickT >= 0; },
      light: function (k) { mat.color.copy(day).lerp(new THREE.Color(1, 0.9, 0.78), 0.5 * k); }
    };
  }

  /* ---- the seated class: one geometry, instanced, the pupil's own colours per instance ----
     slots: 1 the trim (house), 2 skin, 3 hair, 4 long hair (hair, gone when short), 5 the hat (gone when bare) */
  function crowd(T, list) {
    THREE = T;
    var kit = new Kit(), hr = 0.1, robe = 0x1c1a1e, shoe = 0x15110f;
    var TR = { slot: 1 }, SK = { slot: 2 }, HA = { slot: 3 }, LO = { slot: 4 }, HT = { slot: 5, base: robe };
    var prof = [[0.001, 0.44], [0.165, 0.44], [0.16, 0.58], [0.145, 0.7], [0.158, 0.8], [0.15, 0.87], [0.1, 0.915], [0.05, 0.94]]
      .map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    kit.add(new THREE.LatheGeometry(prof, 28), M(0, 0, -0.02, 0, 0, 0, 1, 1, 0.68), function (v) {
      var a = round(v.x, (v.z + 0.02) / 0.68, 28);
      if (a < 0.12 && v.y > 0.66 && v.y < 0.9) return 0x55524e;
      if (a < 0.35 && v.y < 0.9) return TR;
      return robe;
    }, 0);
    hood(kit, 0.85, 0.165, robe, TR, 0);
    kit.add(new THREE.CylinderGeometry(0.05, 0.056, 0.05, 12, 1, true), M(0, 0.93, -0.015), 0xeeeae0, 0);   /* the collar */
    kit.add(new THREE.CylinderGeometry(0.04, 0.044, 0.1, 10), M(0, 0.96, -0.01), SK, 0);
    [-1, 1].forEach(function (s) {
      var hip = V(s * 0.085, 0.49, 0.0), knee = V(s * 0.09, 0.5, 0.36), ankle = V(s * 0.09, 0.08, 0.38);
      kit.add(between(hip, knee, 0.085, 0.07), null, robe, 0);
      kit.add(between(knee, ankle, 0.06, 0.045), null, 0x2a2826, 0);
      kit.add(new THREE.SphereGeometry(0.045, 8, 6), M(ankle.x, 0.035, ankle.z + 0.05, 0, 0, 0, 1, 0.75, 2.1), shoe, 0);
      var sh = V(s * 0.16, 0.86, -0.01), el = V(s * 0.185, 0.69, 0.1), wr = V(s * 0.1, 0.76, 0.36);
      kit.add(between(sh, el, 0.052, 0.058), null, robe, 0);
      kit.add(new THREE.SphereGeometry(0.058, 8, 6), M(el.x, el.y, el.z), robe, 0);
      kit.add(between(el, wr, 0.058, 0.08, 10), null, robe, 0);
      kit.add(new THREE.SphereGeometry(0.038, 8, 6), M(wr.x - s * 0.03, wr.y - 0.005, wr.z + 0.04, 0, 0, 0, 1.1, 0.6, 1.2), SK, 0);
    });
    head(kit, V(0, 1.06, 0.02), hr, { skin: SK, hair: HA, long: LO, hat: true, hatCol: HT }, 0);
    var geo = kit.geometry(false), n = list.length;
    var aT = new Float32Array(n * 3), aS = new Float32Array(n * 3), aH = new Float32Array(n * 3), aL = new Float32Array(n), aHat = new Float32Array(n);
    list.forEach(function (p, i) {
      lin(p.trim !== undefined ? p.trim : HOUSES.gryffindor).toArray(aT, i * 3);
      lin(p.skin !== undefined ? p.skin : 0xe8bfa0).toArray(aS, i * 3);
      lin(p.hair !== undefined ? p.hair : 0x5a3a22).toArray(aH, i * 3);
      aL[i] = p.long ? 1 : 0; aHat[i] = p.hat ? 1 : 0;
    });
    geo.setAttribute('iTrim', new THREE.InstancedBufferAttribute(aT, 3));
    geo.setAttribute('iSkin', new THREE.InstancedBufferAttribute(aS, 3));
    geo.setAttribute('iHair', new THREE.InstancedBufferAttribute(aH, 3));
    geo.setAttribute('iLong', new THREE.InstancedBufferAttribute(aL, 1));
    geo.setAttribute('iHat', new THREE.InstancedBufferAttribute(aHat, 1));
    var DECL = 'attribute float aSlot;\nattribute vec3 iTrim;\nattribute vec3 iSkin;\nattribute vec3 iHair;\nattribute float iLong;\nattribute float iHat;\n';
    /* a part a pupil lacks folds to one point inside the head, so it draws nothing */
    var GONE = 'if ((aSlot > 3.5 && aSlot < 4.5 && iLong < 0.5) || (aSlot > 4.5 && iHat < 0.5)) transformed = vec3(0.0, 1.06, 0.0);\n';
    var mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: tones() });
    mat.onBeforeCompile = function (sh) {
      sh.vertexShader = DECL + sh.vertexShader
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + GONE)
        .replace('#include <color_vertex>', '#include <color_vertex>\nvColor.xyz *= aSlot < 0.5 ? vec3(1.0) : aSlot < 1.5 ? iTrim : aSlot < 2.5 ? iSkin : aSlot < 4.5 ? iHair : vec3(1.0);');
    };
    mat.customProgramCacheKey = function () { return 'castle-crowd'; };
    var inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
    inkMat.onBeforeCompile = function (sh) {
      sh.vertexShader = DECL + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.0065;\n' + GONE);
    };
    inkMat.customProgramCacheKey = function () { return 'castle-crowd-ink'; };
    var mesh = new THREE.InstancedMesh(geo, mat, n), ink = new THREE.InstancedMesh(geo, inkMat, n);
    ink.instanceMatrix = mesh.instanceMatrix;
    mesh.frustumCulled = ink.frustumCulled = false;
    var group = new THREE.Group(); group.add(mesh); group.add(ink); group.name = 'figure-crowd';
    var m = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), at = new THREE.Vector3();
    function place(t) {
      list.forEach(function (p, i) {
        var k = i * 1.731, s = p.scale || 1;
        e.set(0.015 * Math.sin(t * 0.9 + k) + 0.02, (p.rot || 0) + 0.06 * Math.sin(t * 0.21 + k * 2.3), 0.01 * Math.sin(t * 0.5 + k));
        qq.setFromEuler(e); sc.set(s, s * (1 + 0.006 * Math.sin(t * 1.6 + k)), s); at.fromArray(p.at);
        m.compose(at, qq, sc); mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    place(0);
    var day = mat.color.clone();
    return { group: group, mesh: mesh, ink: ink, update: place,
             light: function (k) { mat.color.copy(day).lerp(new THREE.Color(1, 0.9, 0.78), 0.5 * k); } };
  }

  window.CastleFigure = { make: make, crowd: crowd, HOUSES: HOUSES };
})();
