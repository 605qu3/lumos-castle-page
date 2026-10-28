/* lake-views.js: what the lake-face corridors' windows look out on, floor by floor, and the Highland land round the
   horizon (req 1313 (b), Corridor's; Godric's 1 on req 1308, 27 October 2026, 11.47 pm, one corridor, six lakes, and his
   1 on req 1316, 28 October 2026, 12.07 am, height-true: "that lake isn't infinite. we're in the highlands. the land
   would be high out there somewhere and give people something to look at around the horizon"). Plain tones, nothing
   glows but a lamp's own flame, nothing staged from a canon scene. Three r128, the global the shell loads.

   The frame is the far scene's: V(x, y, z) takes the castle's plan (x east, y north, metres) and a height (z up, the
   model's levels, G at 0) into the caller's frame, as castle-shell.js's farView does with toLocal. Every colour is a
   tone key with its fallback here, provisional (req 906's far tones: these keys are new and wait on Godric's look).

   CastleLakeViews.ranges(THREE, V, o)  the Highland ranges as a group, three bands round the castle past the lake's far
       shore (about 680 m south): the braes rising off the far shore (crest about 1.25 km out, 100 to 280 m high), a
       middle range (3.4 km, 300 to 700 m) and the far summits (9 km, 600 to 1150 m, Munro height), each paler than the
       one before (the air between), a glen to the south-west where the near two fall away and the far ones show
       through. o: { lawn (default -1.2), centre [x, y] (default the castle's, [60, 36]), tone(key) a THREE.Color or
       null }. It replaces farView's ring of sines (castle-shell.js, "far hills"), which tops out at 150 m at 1.8 km;
       the caller's camera far plane must reach 10.5 km.
   CastleLakeViews.forLevel(THREE, level, V, o)  { group, tick(t), about } for one floor's corridor ('G' to '6'):
       G  a boat moored to a buoy 190 m out, its lamp lit by night (LAMP's colour; the boat's own flame), 14 degrees
          below his eye: what a boy at the window looks down on, the lapping Events' sound
       1  the giant squid's shadow drifting under the surface 260 m out (under the ice when o.season is 'winter')
       2  reed beds along the nearest grassy shores to the south (from the lake's own shore runs)
       3  six gulls wheeling at the window's own height, 20 to 45 m out
       4  wind: cat's-paws, pale streaks sliding across the water
       5  the cloud's edge: a low cloud's ragged edge and underside just over his eye, 220 m out and on south
       6  nothing added: the lake small below, the whole sky, the ranges round it
       o: { lake (the water's height, default -46.0), ground (the model's lake record, for 2's shores), night (bool),
       season ('winter' for 1's ice), tone(key) }. tick(t) moves what moves (gulls, squid, streaks, the cloud); the far
       view is one cube drawn once, so a moving piece shows only where the caller draws the cube again (about 5 a
       second is enough), else it holds still and reads as a moment.
   CastleLakeViews.ice(THREE, V, ground, o)  the lake frozen over (PS 12, the lake froze solid at Christmas), a pale
       sheet on the water for any floor in winter; o { lake, tone }.
   CastleLakeViews.TONES  the keys and fallbacks. */
(function () {
  'use strict';

  var TONES = {
    'far-braes': 0x5e664c, 'far-hills': 0x7c8794, 'far-summits': 0xa1adbb, 'far-water-day': 0x6f8797,
    'far-timber': 0x6e4c30, 'far-reed': 0x8f8358, 'far-gull': 0xe9e7e1, 'far-gull-tip': 0x3a3836,
    'far-cloud': 0xd6dade, 'far-cloud-under': 0xb3b9c0, 'far-ice': 0xdfe7ea, 'far-squid': 0x0d151c, 'far-pale-water': 0xc9d6de
  };
  var LAMP = 0xf2a860;
  var LEVELZ = { G: 0, '1': 5.2, '2': 10.4, '3': 15.6, '4': 20.8, '5': 26.0, '6': 31.2 }, EYE = 1.35;

  function col(THREE, o, k) { var c = o && o.tone && o.tone(k); return c || new THREE.Color(TONES[k]); }
  function lam(THREE, c, extra) {
    var m = new THREE.MeshLambertMaterial(Object.assign({ color: c.clone().convertSRGBToLinear() }, extra || {}));
    m.side = THREE.DoubleSide; return m;
  }
  /* a flat shape lying at height z in the plan */
  function flat(THREE, V, pts, z, mat) {
    var sh = new THREE.Shape(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }));
    var g = new THREE.ShapeGeometry(sh, 8), a = g.attributes.position;
    for (var i = 0; i < a.count; i++) { var v = V(a.getX(i), a.getY(i), z); a.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return new THREE.Mesh(g, mat);
  }
  function tri(THREE, pts) { var g = new THREE.BufferGeometry().setFromPoints(pts); g.computeVertexNormals(); return g; }

  /* the ranges: each a band, a foot ring on the ground, a crest ring, a back ring falling away behind */
  function ranges(THREE, V, o) {
    o = o || {};
    var G = new THREE.Group(), lawn = o.lawn != null ? o.lawn : -1.2, c = o.centre || [60, 36], N = 180;
    var GLEN = 215 * Math.PI / 180;                     /* the compass bearing of the glen the loch runs out by */
    var bands = [
      { k: 'far-braes', foot: 950, crest: 1250, back: 1550, h: function (t) { return 170 + 70 * Math.sin(3 * t + 0.4) + 40 * Math.sin(8 * t + 1.3) + 20 * Math.sin(17 * t); }, glen: 0.8 },
      { k: 'far-hills', foot: 2600, crest: 3400, back: 4100, h: function (t) { return 480 + 160 * Math.sin(2 * t + 2) + 90 * Math.sin(5 * t + 0.7) + 40 * Math.sin(11 * t + 1); }, glen: 0.6 },
      { k: 'far-summits', foot: 7000, crest: 9000, back: 10200, h: function (t) { return 850 + 220 * Math.sin(2 * t + 4.1) + 120 * Math.sin(6 * t + 2.2) + 60 * Math.sin(13 * t + 0.5); }, glen: 0 }
    ];
    bands.forEach(function (b) {
      var pts = [];
      function at(t, r, z) { return V(c[0] + r * Math.sin(t), c[1] + r * Math.cos(t), z); }   /* t a compass bearing */
      for (var i = 0; i < N; i++) {
        var t0 = i / N * Math.PI * 2, t1 = (i + 1) / N * Math.PI * 2;
        var dip = function (t) { var d = Math.atan2(Math.sin(t - GLEN), Math.cos(t - GLEN)); return 1 - b.glen * Math.exp(-Math.pow(d / 0.16, 2)); };
        var h0 = lawn + b.h(t0) * dip(t0), h1 = lawn + b.h(t1) * dip(t1);
        var f0 = at(t0, b.foot, lawn - 2), f1 = at(t1, b.foot, lawn - 2), c0 = at(t0, b.crest, h0), c1 = at(t1, b.crest, h1);
        var k0 = at(t0, b.back, lawn + 0.3 * (h0 - lawn)), k1 = at(t1, b.back, lawn + 0.3 * (h1 - lawn));
        pts.push(f0, f1, c1, f0, c1, c0, c0, c1, k1, c0, k1, k0);
      }
      var m = new THREE.Mesh(tri(THREE, pts), lam(THREE, col(THREE, o, b.k)));
      m.name = 'lake-views-' + b.k; G.add(m);
    });
    G.name = 'lake-views-ranges';
    return G;
  }

  function ice(THREE, V, ground, o) {
    o = o || {};
    var lake = o.lake != null ? o.lake : -46.0, poly = ground && ground.shape && ground.shape.poly;
    if (!poly) return null;
    var m = flat(THREE, V, poly, lake + 0.06, lam(THREE, col(THREE, o, 'far-ice'), { transparent: true, opacity: 0.72, depthWrite: false }));
    m.name = 'lake-views-ice'; return m;
  }

  /* a small boat, pointed at both ends, moored to a buoy; its lamp on a short post at the stern */
  function boat(THREE, V, o, lake) {
    var G = new THREE.Group(), x = 122, y = -190, L = 4.6, B = 1.4, D = 0.55, timber = lam(THREE, col(THREE, o, 'far-timber'));
    var hull = [];
    for (var i = 0; i <= 12; i++) { var s = i / 12 * 2 - 1; hull.push([s * L / 2, B / 2 * Math.cos(s * Math.PI / 2) ]); }
    for (var j = 12; j >= 0; j--) { var s2 = j / 12 * 2 - 1; hull.push([s2 * L / 2, -B / 2 * Math.cos(s2 * Math.PI / 2)]); }
    var rot = function (p) { var a = 0.5; return [x + p[0] * Math.cos(a) - p[1] * Math.sin(a), y + p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
    var top = flat(THREE, V, hull.map(rot), lake + D, timber); G.add(top);
    var side = [];
    for (var k = 0; k < hull.length - 1; k++) {
      var a0 = rot(hull[k]), a1 = rot(hull[k + 1]);
      side.push(V(a0[0], a0[1], lake), V(a1[0], a1[1], lake), V(a1[0], a1[1], lake + D), V(a0[0], a0[1], lake), V(a1[0], a1[1], lake + D), V(a0[0], a0[1], lake + D));
    }
    G.add(new THREE.Mesh(tri(THREE, side), timber));
    var buoy = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), lam(THREE, new THREE.Color(0x8a3a2a)));
    var bp = V(x + 7 * Math.cos(0.5), y + 7 * Math.sin(0.5), lake + 0.1); buoy.position.copy(bp); G.add(buoy);
    var st = rot([-L / 2 + 0.4, 0]), lp = V(st[0], st[1], lake + D + 0.9);
    var lampM = new THREE.MeshBasicMaterial({ color: o.night ? LAMP : 0x3a3430 });
    /* the lamp drawn 0.5 m, twice its size, so its flame reads as the point of light a lamp is from 190 m (its own
       light, nothing more); by night its reflection a broken warm line on the water below it, toward the castle */
    var lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), lampM); lamp.position.copy(lp); lamp.name = 'lake-views-boat-lamp'; G.add(lamp);
    if (o.night) {
      var pl = new THREE.PointLight(LAMP, 1.0, 14, 2); pl.position.copy(lp); G.add(pl);
      var glint = new THREE.MeshBasicMaterial({ color: LAMP, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide });
      for (var g2 = 0; g2 < 6; g2++) {
        var d0 = 1 + g2 * 3.2, w2 = 0.5 - g2 * 0.05;
        G.add(flat(THREE, V, [[st[0] - w2, st[1] + d0], [st[0] + w2, st[1] + d0], [st[0] + w2 * 0.7, st[1] + d0 + 2], [st[0] - w2 * 0.7, st[1] + d0 + 2]], lake + 0.02, glint));
      }
    }
    G.name = 'lake-views-boat';
    return { group: G, tick: function (t) { var b = Math.sin(t * 0.9) * 0.04; G.position.y = b; } };
  }

  function squid(THREE, V, o, lake) {
    var G = new THREE.Group(), m = lam(THREE, col(THREE, o, 'far-squid'), { transparent: true, opacity: 0.5, depthWrite: false });
    var body = [], arms = [];
    /* the giant squid (PS 12, "the giant squid"; the lake's own, every year): a mantle and eight arms, 26 m in all, so
       it reads from 53 m up as a long dark shape under the water, not a fleck */
    for (var i = 0; i < 20; i++) { var a = i / 20 * Math.PI * 2; body.push([7 * Math.cos(a) * (Math.cos(a) > 0 ? 1.4 : 1), 2.6 * Math.sin(a)]); }
    for (var k = 0; k < 8; k++) {
      var off = (k - 3.5) * 0.55;
      arms.push([[-6.4, off - 0.25], [-16 - (k % 3) * 1.5, off * 2.4 - 0.15], [-16 - (k % 3) * 1.5, off * 2.4 + 0.15], [-6.4, off + 0.25]]);
    }
    var parts = [body].concat(arms);
    var meshes = parts.map(function (p) { var me = flat(THREE, V, p, 0, m); G.add(me); return me; });
    var origin = V(0, 0, 0), cx = 135, cy = -190;
    function place(t) {
      var a = t * 0.02, px = cx + 40 * Math.cos(a), py = cy + 40 * Math.sin(a), p = V(px, py, lake + 0.03);
      G.position.set(p.x - origin.x, p.y - origin.y, p.z - origin.z);   /* V is a move and a turn, so the shape follows; it keeps one heading */
    }
    place(0); G.name = 'lake-views-squid';
    return { group: G, tick: place };
  }

  /* reed beds where the nearest grassy shores lie to the south of the corridor (within 35 degrees of south, in his window) */
  function reeds(THREE, V, o, lake) {
    var G = new THREE.Group(), g = o.ground, poly = g && g.shape && g.shape.poly, runs = (g && g.shores) || [];
    if (!poly) return { group: G, tick: function () {} };
    var kind = function (i) { var k = 'rock'; runs.forEach(function (r) { if (i >= r[1]) k = r[0]; }); return k; };
    var cand = [];
    poly.forEach(function (p, i) {
      var dx = p[0] - 122, dy = p[1] - 0.6, d = Math.hypot(dx, dy), off = Math.atan2(Math.abs(dx), -dy) * 180 / Math.PI;
      if (/grass|bay|glen|shrub/.test(kind(i)) && off < 35 && d > 150 && d < 900) cand.push({ i: i, d: d });
    });
    cand.sort(function (a, b) { return a.d - b.d; });
    var m = lam(THREE, col(THREE, o, 'far-reed')), used = [];
    cand.forEach(function (c) {
      if (used.length >= 4 || used.some(function (u) { return Math.abs(u - c.i) < 30; })) return;
      used.push(c.i);
      var p = poly[c.i], q = poly[(c.i + 1) % poly.length], ux = q[0] - p[0], uy = q[1] - p[1], n = Math.hypot(ux, uy) || 1;
      ux /= n; uy /= n;
      /* a bed seen from above is a tawny patch on the water, 160 m along the shore and 10 to 34 m out (the window sees only the far shores, 500 to 700 m off), its outer edge
         ragged; a fringe of blades 1.2 to 2.1 m along that edge */
      var nx = -uy, ny = ux, mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      if (Math.hypot(mid[0] + nx - 60, mid[1] + ny - 36) > Math.hypot(mid[0] - 60, mid[1] - 36)) { nx = -nx; ny = -ny; }  /* out over the water, toward the lake's middle */
      var patch = [], pts = [];
      for (var s = -80; s <= 80; s += 4) patch.push([p[0] + ux * s, p[1] + uy * s]);
      for (var s2 = 80; s2 >= -80; s2 -= 4) { var dd = 22 + 12 * Math.sin(s2 * 0.13 + c.i) * Math.cos(s2 * Math.PI / 160); patch.push([p[0] + ux * s2 + nx * dd, p[1] + uy * s2 + ny * dd]); }
      G.add(flat(THREE, V, patch, lake + 0.35, m));
      for (var s3 = -80; s3 <= 80; s3 += 1.2) {
        var d3 = 22 + 12 * Math.sin(s3 * 0.13 + c.i) * Math.cos(s3 * Math.PI / 160), h = 1.2 + 0.9 * (0.5 + 0.5 * Math.sin(s3 * 2.3 + c.i));
        var bx = p[0] + ux * s3 + nx * d3, by = p[1] + uy * s3 + ny * d3, w = 0.4;
        pts.push(V(bx - ux * w, by - uy * w, lake), V(bx + ux * w, by + uy * w, lake), V(bx, by, lake + h));
      }
      G.add(new THREE.Mesh(tri(THREE, pts), m));
    });
    G.name = 'lake-views-reeds';
    return { group: G, tick: function () {} };
  }

  function gulls(THREE, V, o, eye) {
    var G = new THREE.Group(), wing = lam(THREE, col(THREE, o, 'far-gull')), tip = lam(THREE, col(THREE, o, 'far-gull-tip'));
    var birds = [];
    for (var i = 0; i < 8; i++) {
      var b = new THREE.Group(), L = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.22), wing), R = L.clone();
      L.position.x = -0.31; R.position.x = 0.31;
      var tL = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.2), tip), tR = tL.clone(); tL.position.x = -0.62; tR.position.x = 0.62;
      var l = new THREE.Group(), r = new THREE.Group(); l.add(L, tL); r.add(R, tR); b.add(l, r);
      b.userData = { l: l, r: r, rad: 8 + 3 * i, sp: 0.18 + 0.03 * (i % 3), ph: i * 1.1, dz: -6 + (i * 7) % 9 };
      birds.push(b); G.add(b);
    }
    var origin = V(0, 0, 0);
    function place(t) {
      birds.forEach(function (b) {
        var u = b.userData, a = u.ph + t * u.sp, p = V(122 + u.rad * Math.cos(a), -8 - u.rad + u.rad * Math.sin(a) * 0.6, eye + u.dz + Math.sin(t * 0.3 + u.ph));
        b.position.set(p.x, p.y, p.z);
        var f = 0.35 * Math.sin(t * 5 + u.ph * 3); u.l.rotation.z = f; u.r.rotation.z = -f;
        var up = V(0, 0, 1).sub(origin).normalize(); b.up.copy(up); b.lookAt(V(122 + u.rad * Math.cos(a + 0.1), -8 - u.rad + u.rad * Math.sin(a + 0.1) * 0.6, p.z));
      });
    }
    place(0); G.name = 'lake-views-gulls';
    return { group: G, tick: place };
  }

  function wind(THREE, V, o, lake) {
    var G = new THREE.Group(), m = lam(THREE, col(THREE, o, 'far-pale-water'), { transparent: true, opacity: 0.34, depthWrite: false });
    var streaks = [];
    for (var i = 0; i < 16; i++) {
      var x = 40 + ((i * 137) % 260), y = -90 - ((i * 211) % 480), L = 30 + (i % 4) * 12, W = 1.6 + (i % 3);
      var s = flat(THREE, V, [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2 + 4, 0], [L / 2, W / 2], [-L / 2, W / 2]], 0, m);
      s.userData = { x: x, y: y, sp: 2.5 + (i % 5) * 0.6 };
      streaks.push(s); G.add(s);
    }
    var origin = V(0, 0, 0);
    function place(t) {
      streaks.forEach(function (s) {
        var u = s.userData, x = 40 + ((u.x - 40 + t * u.sp) % 300), p = V(x, u.y, lake + 0.04);
        s.position.set(p.x - origin.x, p.y - origin.y, p.z - origin.z);
      });
    }
    place(0); G.name = 'lake-views-wind';
    return { group: G, tick: place };
  }

  /* the cloud's edge: a low bank come down to his height over the west of the lake, its face toward him as ragged
     curtains one behind another (each half seen through, so the face reads soft and deep), its foot below his eye,
     its top a ragged line over it; the east of the lake clear beside it */
  function cloud(THREE, V, o, eye) {
    var G = new THREE.Group(), face = lam(THREE, col(THREE, o, 'far-cloud'), { transparent: true, opacity: 0.5, depthWrite: false });
    var under = lam(THREE, col(THREE, o, 'far-cloud-under'), { transparent: true, opacity: 0.45, depthWrite: false });
    [[230, 0], [290, 1], [360, 2], [450, 3]].forEach(function (s) {
      var y = -s[0], pts = [], N = 36, x0 = -420, x1 = 150 - 30 * s[1];
      for (var i = 0; i < N; i++) {
        var xa = x0 + (x1 - x0) * i / N, xb = x0 + (x1 - x0) * (i + 1) / N;
        var fade = function (x) { return Math.min(1, (x1 - x) / 90); };            /* the bank thins to its east end */
        var ta = eye + (22 + 14 * Math.sin(i * 0.7 + s[1]) + 9 * Math.sin(i * 1.9 + 2 * s[1])) * fade(xa);
        var tb = eye + (22 + 14 * Math.sin((i + 1) * 0.7 + s[1]) + 9 * Math.sin((i + 1) * 1.9 + 2 * s[1])) * fade(xb);
        var ba = eye - (10 + 4 * Math.sin(i * 1.3 + s[1])) * fade(xa), bb = eye - (10 + 4 * Math.sin((i + 1) * 1.3 + s[1])) * fade(xb);
        var ya = y + 12 * Math.sin(i * 0.5 + s[1]), yb = y + 12 * Math.sin((i + 1) * 0.5 + s[1]);
        pts.push(V(xa, ya, ba), V(xb, yb, bb), V(xb, yb, tb), V(xa, ya, ba), V(xb, yb, tb), V(xa, ya, ta));
      }
      G.add(new THREE.Mesh(tri(THREE, pts), s[1] === 3 ? under : face));
    });
    G.name = 'lake-views-cloud';
    var origin = V(0, 0, 0);
    return { group: G, tick: function (t) { var p = V(8 * Math.sin(t * 0.01), 6 * Math.sin(t * 0.013), 0); G.position.set(p.x - origin.x, p.y - origin.y, p.z - origin.z); } };
  }

  var ABOUT = {
    G: 'a boat moored to a buoy 190 m out, its lamp lit by night', '1': "the giant squid's shadow under the surface",
    '2': 'reed beds along the nearest grassy shores', '3': "gulls at the window's height", '4': "wind: cat's-paws across the water",
    '5': "the cloud's edge just over his eye", '6': 'the lake small below, the whole sky'
  };
  function forLevel(THREE, level, V, o) {
    o = o || {};
    var lake = o.lake != null ? o.lake : -46.0, eye = (LEVELZ[level] || 0) + EYE, P = null;
    if (level === 'G') P = boat(THREE, V, o, lake);
    else if (level === '1') P = squid(THREE, V, o, lake);
    else if (level === '2') P = reeds(THREE, V, o, lake);
    else if (level === '3') P = gulls(THREE, V, o, eye);
    else if (level === '4') P = wind(THREE, V, o, lake);
    else if (level === '5') P = cloud(THREE, V, o, eye);
    var group = P ? P.group : new THREE.Group();
    if (level === '1' && o.season === 'winter' && o.ground) { var ic = ice(THREE, V, o.ground, o); if (ic) group.add(ic); }
    return { group: group, tick: P ? P.tick : function () {}, about: ABOUT[level] || '' };
  }

  window.CastleLakeViews = { ranges: ranges, forLevel: forLevel, ice: ice, TONES: TONES, LEVELZ: LEVELZ };
})();
