/* suit.js: the castle's one suit of armour, the corridor's round 3 hybrid (Godric's 1 on corridor-armour-hybrid-r3-1023,
   23 October 2026, 11.46 am), lifted out of page/corridor.html so the shell can stand it wherever armour stands (req
   1059, the Architect's; Godric on the armour card, 7.14 pm: "the suit we designed as the standard default"). Three
   r128, the global the pages load. The build is the corridor's, line for line; what was the corridor's own (its place,
   its marks, its visor's things) stays there.

   CastleSuit.make(THREE, renderer, opts)  one suit. opts { src (the drawing, relative to the page; default
       '../assets/layers/corridor-armour.png'), shadow (a material for the soft shadow under it; default its own; false
       for none) }. Returns { group, mats, body, ready, onReady(fn), light(k, bounce) }: the group's origin is on the
       floor under the suit's middle, facing +z; its back is 0.15 m behind the origin and its toes 0.19 m in front, so
       0.34 m deep; stood with its origin 0.20 m off a wall's face, its back is 5 cm off it (Godric, 4.18 pm: "right up to
       but not quite touching"). The drawing loads once per src and every suit of it shares its geometry and materials,
       so a gallery of fifteen costs one build; body (the trunk's mesh, for a ray) is set once ready. light(k, bounce):
       k 0 by day to 1 at full night, the torches' warmth on the steel and its mirror dimmed (bounce 0.35, the
       corridor's). The page adds the group to its scene and places it. */
(function () {
  'use strict';
  var THREE, renderer, cache = {};
  function makeCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c) {   /* as castle.js's */
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  function col(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  /* Godric's 2 on corridor-armour-3d-1022 (8.03 pm): worked further, in code. The steel's own surface drawn once on a
     canvas, its u round each turned piece (u 0 the front) and its v down it: a brushed grain, scratches, a little
     pitting and grime, and an incised line just inside each plate's edges; on the breastplate, tassets and cuisses
     the etched bands too, blackened strips down the front and either side with a running scroll in them, as the
     drawing's. The same canvas is the bump, so the lines catch the light. Rivets along the edges (one instanced
     mesh), lames at the elbows, knees and feet, cuffs at the wrists, straps on the tassets */
  function steelCanvas(etched) {
    var c = makeCanvas(512, 512), x = c.getContext('2d'), i, rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(etched ? 71 : 37);
    x.fillStyle = '#c3c7cc'; x.fillRect(0, 0, 512, 512);
    for (i = 0; i < 1600; i++) {   /* the brushed grain, round the piece */
      var y = rnd() * 512, x0 = rnd() * 512, l = 20 + rnd() * 120, k = rnd() < 0.5;
      x.strokeStyle = k ? 'rgba(255,255,255,' + (0.02 + rnd() * 0.03) + ')' : 'rgba(40,44,50,' + (0.015 + rnd() * 0.025) + ')';   /* faint: polished plate, not a tin */
      x.lineWidth = 1; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + l, y + (rnd() - 0.5) * 2); x.stroke();
    }
    for (i = 0; i < 26; i++) {   /* grime, darker toward the lower edges */
      var gx = rnd() * 512, gy = 200 + rnd() * 312, gr = 20 + rnd() * 60, gd = x.createRadialGradient(gx, gy, 0, gx, gy, gr);
      gd.addColorStop(0, 'rgba(60,50,40,0.16)'); gd.addColorStop(1, 'rgba(60,50,40,0)'); x.fillStyle = gd; x.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
    }
    for (i = 0; i < 320; i++) { x.fillStyle = 'rgba(50,45,40,' + (0.2 + rnd() * 0.3) + ')'; x.beginPath(); x.arc(rnd() * 512, rnd() * 512, 0.5 + rnd(), 0, 7); x.fill(); }   /* pitting */
    for (i = 0; i < 45; i++) {   /* scratches */
      var sx = rnd() * 512, sy = rnd() * 512, a = rnd() * Math.PI, sl = 8 + rnd() * 40;
      x.strokeStyle = 'rgba(245,247,250,0.35)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * sl, sy + Math.sin(a) * sl); x.stroke();
    }
    x.strokeStyle = 'rgba(30,32,36,0.75)'; x.lineWidth = 2.5;   /* the incised line inside each edge */
    [12, 500].forEach(function (yy) { x.beginPath(); x.moveTo(0, yy); x.lineTo(512, yy); x.stroke(); });
    if (etched) {
      function band(cx, w) {   /* a blackened strip, its two borders and a running scroll */
        [cx - 512, cx, cx + 512].forEach(function (c0) {
          x.fillStyle = 'rgba(55,55,58,0.28)'; x.fillRect(c0 - w / 2, 0, w, 512);
          x.strokeStyle = 'rgba(20,20,24,0.9)'; x.lineWidth = 2;
          [c0 - w / 2, c0 + w / 2].forEach(function (bx) { x.beginPath(); x.moveTo(bx, 0); x.lineTo(bx, 512); x.stroke(); });
          x.strokeStyle = 'rgba(205,208,212,0.8)'; x.lineWidth = 1.6;
          for (var yy = 0; yy < 512; yy += 28) {
            x.beginPath(); x.moveTo(c0, yy); x.bezierCurveTo(c0 + w * 0.4, yy + 7, c0 + w * 0.4, yy + 21, c0, yy + 28); x.stroke();
            x.beginPath(); x.arc(c0 + (yy % 56 ? -1 : 1) * w * 0.22, yy + 14, w * 0.13, 0, Math.PI * 1.5); x.stroke();
          }
        });
      }
      band(0, 34); band(110, 22); band(512 - 110, 22);
    }
    return c;
  }
  /* the second look (the seventy-first session): plain grey steel with nothing to mirror reads as plastic, so the steel
     mirrors a drawn corridor, its own small panorama: a dark vault above, warm stone walls with two cool window lights
     and a torch's glow, the flags below. Only this suit's materials take it; by night it dims to the torches' warmth */
  function hallEnv() {
    var c = makeCanvas(512, 256), x = c.getContext('2d'), gd = x.createLinearGradient(0, 0, 0, 256);
    gd.addColorStop(0, '#2c2826'); gd.addColorStop(0.38, '#6a6058'); gd.addColorStop(0.5, '#8c8278'); gd.addColorStop(0.56, '#5a4d42'); gd.addColorStop(1, '#2e2620');
    x.fillStyle = gd; x.fillRect(0, 0, 512, 256);
    [[96, '#e8eef4'], [224, '#dfe7ee']].forEach(function (w) { x.fillStyle = w[1]; x.fillRect(w[0], 70, 44, 62); x.fillStyle = '#9aa6b0'; x.fillRect(w[0] + 20, 70, 4, 62); });
    var tg = x.createRadialGradient(400, 96, 2, 400, 96, 40); tg.addColorStop(0, 'rgba(255,200,130,0.9)'); tg.addColorStop(1, 'rgba(255,200,130,0)');
    x.fillStyle = tg; x.fillRect(360, 56, 80, 80);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer), e = pm.fromEquirectangular(t).texture; pm.dispose(); t.dispose();
    return e;
  }
  /* the hybrid (Godric's word after walking past ?relief, 22 October 2026, 10.45 pm: "it comes SO close to working", whole
     from the front, a thin slab side on; so the drawing on true shapes, the halberd apart, as his blueprint has it). Every
     8 px down the drawing its outline is cut into runs (the helmet, the trunk, each limb) and each run turned into a ring
     as wide as the drawing and as deep as a suit on the Met's 1.70 m, never deeper than wide (half depths: sabatons 0.09 m,
     shins 0.065, thighs 0.085, hips 0.13, breast 0.15, helmet 0.125); a ring meeting one ring in the next row is joined to
     it, the rest capped. The drawing lies on what faces the corridor, from the front, so it reads as the card does; where
     the shape turns away (its flanks, its back) the built suit's steel and mirror take over, so side on it is a suit and
     not the drawing smeared. The halberd is cut from the outline and built apart: its shaft a round pole in the drawing's
     wood, its head the drawing on a flat blade, edge on from the side as a blade is. An ink line round it as the built
     suit's. Still, never turning to the eye; by night the torches' warmth.
     Godric chose round 3 (corridor-armour-hybrid-r3-1023, 23 October 2026, 11.46 am) and made it the castle's suit (4.18 pm) */
  function shared(src, D) {   /* the drawing's geometry and materials, built once; D the drawn kind's own (DRAWN) */
    var PX = 1369, ROW = 8, SEG = 28, FOOT = 2468, X0, HALB = !D || D.halberd !== false, SHIELD = D && D.shield;
    function pole(py) { return 208 + 0.0317 * (py - 1100); }   /* the shaft's middle in the drawing, leaning out a little */
    var POLE_R = 26, HEAD = { x: 400, y: 560 };                 /* the band cut for the shaft; the box round its head */
    var FIST = [904, 1056];                                      /* the gauntlet's rows across the shaft */
    var CAPS = [[0, 0.09], [0.08, 0.065], [0.5, 0.065], [0.58, 0.085], [0.85, 0.085], [0.95, 0.13], [1.05, 0.13], [1.15, 0.15], [1.3, 0.15], [1.42, 0.125], [1.48, 0.115], [9, 0.125]];
    function depth(ym) { for (var i = 1; i < CAPS.length; i++) if (ym <= CAPS[i][0]) { var a = CAPS[i - 1], b = CAPS[i]; return a[1] + (b[1] - a[1]) * (ym - a[0]) / (b[0] - a[0]); } return 0.125; }
    var env = hallEnv(), steelMap = tex(steelCanvas(false)); steelMap.wrapS = steelMap.wrapT = THREE.RepeatWrapping;
    /* a look (LOOKS) changes the steel's colour and shine and nothing else; the default's shader is left as it was */
    function blendMat(look) {   /* the drawing where wd is 1, the steel where it is 0 */
      var m = new THREE.MeshStandardMaterial({ color: 0xffffff, envMap: env }), L = look && LOOKS[look];
      function f(v) { return (+v).toFixed(3); }
      m.userData.env = L ? L.env : 1;
      if (L) m.customProgramCacheKey = function () { return 'castle-suit-' + look; };   /* three caches a program by its onBeforeCompile's text, the same for every look */
      m.onBeforeCompile = function (sh) {
        sh.uniforms.steelMap = { value: steelMap };
        sh.vertexShader = 'attribute float wd;\nattribute vec2 uvS;\nvarying float vWd;\nvarying vec2 vUvS;\n' + (L ? 'varying vec3 vPo;\n' : '') + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvWd = wd; vUvS = uvS;' + (L ? ' vPo = position;' : ''));
        var look = !L ? '' : '\nfloat lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb = mix(vec3(lum), diffuseColor.rgb, ' + f(L.sat) + ') * vec3(' + L.tint.map(f).join(', ') + ');' +
          (L.bands ? '\nfloat band = smoothstep(0.52, 0.62, abs(fract(vPo.x / 0.09 + 0.5) - 0.5) * 2.0); diffuseColor.rgb *= 1.0 - 0.72 * band;' : '');
        sh.fragmentShader = 'uniform sampler2D steelMap;\nvarying float vWd;\nvarying vec2 vUvS;\n' + (L ? 'varying vec3 vPo;\n' : '') + sh.fragmentShader
          .replace('#include <map_fragment>', 'vec4 tD = mapTexelToLinear(texture2D(map, vUv)); vec4 tS = mapTexelToLinear(texture2D(steelMap, vUvS));\ndiffuseColor.rgb *= mix(tS.rgb * vec3(0.84, 0.86, 0.9), tD.rgb, 0.6 + 0.4 * vWd);' + look)
          .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = mix(0.6, 0.15, vWd)' + (L ? ' * ' + f(L.metal) : '') + ';')
          .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(0.36, 0.5, vWd)' + (L ? ' + ' + f(L.rough) + (L.bands ? ' + 0.25 * band' : '') : '') + ';');
      };
      return m;
    }
    var mat = blendMat(), mats = [mat], out = { mats: mats, ready: false, waiters: [] };
    var ink = new THREE.MeshBasicMaterial({ color: 0x16120e, side: THREE.BackSide });
    ink.onBeforeCompile = function (sh) { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.0068;'); };
    var im = new Image();
    im.onload = function () {
      var W = im.width, H = im.height, c = makeCanvas(W, H), x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var A = x.getImageData(0, 0, W, H).data;
      /* a drawn kind's soles where its drawing ends (the Gothic's pointed sabatons reach 32 px lower), and its middle
         where the default's is (its helmet 61 px right of the drawing's middle), so every kind stands on the same spot */
      for (FOOT = H - 1; FOOT > 0; FOOT--) { for (var fx = 0; fx < W && A[(FOOT * W + fx) * 4 + 3] <= 127; fx++); if (fx < W) break; }
      X0 = D && D.x0 !== undefined ? D.x0 : W / 2;
      var SR = SHIELD && new Int16Array(H).fill(-1);   /* the shield's right edge in each row: its last red, and its rim */
      if (SHIELD) for (var sy = SHIELD[1]; sy <= SHIELD[3]; sy++) for (var sx = SHIELD[2]; sx >= SHIELD[0]; sx--) {
        var si = (sy * W + sx) * 4; if (A[si] > A[si + 1] + 40 && A[si] > A[si + 2] + 40) { SR[sy] = sx + 10; break; }
      }
      if (SHIELD) {   /* behind the shield the drawing has no arm: the other arm mirrored about the helmet's middle (D.mirror) holds it */
        var img = x.getImageData(0, 0, W, H), B = img.data;
        for (sy = SHIELD[1]; sy <= SHIELD[3]; sy++) {
          var se = Math.max(SR[Math.max(SHIELD[1], sy - 6)], SR[sy], SR[Math.min(SHIELD[3], sy + 6)]);
          for (sx = SHIELD[0]; sx <= se; sx++) {
            var mx = 2 * D.mirror - sx, o = (sy * W + sx) * 4, q = (sy * W + mx) * 4;
            for (var ch = 0; ch < 4; ch++) B[o + ch] = mx >= 0 && mx < W ? A[q + ch] : 0;
          }
        }
        x.putImageData(img, 0, 0); A = B;
      }
      function body(px, py) {
        if (A[(py * W + px) * 4 + 3] <= 127) return false;
        return !HALB || !(py < HEAD.y && px < HEAD.x) && Math.abs(px - pole(py)) > POLE_R;
      }
      var TOP = new Int16Array(W * (FOOT + 1));   /* how far below the top of its column of the drawing each pixel lies, 0 off it */
      for (var tx = 0; tx < W; tx++) for (var ty = 0, t0 = -1; ty <= FOOT; ty++) { if (body(tx, ty)) { if (t0 < 0) t0 = ty; TOP[ty * W + tx] = ty - t0; } else t0 = -1; }
      function build(rows, flat) {   /* rows: [py, [[x0, x1, D], ...]] top down; flat: the drawing all round (the shaft) */
        var pos = [], uv = [], uvS = [], ind = [], cnt = 0;
        /* Godric's 2 on corridor-armour-hybrid-1023 (23 October 2026, 11.06 am: "this is REALLY close now. let's make your
           changes and fix the feet"). The wide rings (the trunk, the pauldrons) squarer than an ellipse, so the shoulders
           keep their body side on; the depth eased off near the top of each column of the drawing, so a shoulder is a
           dome and not a box's lid; and the drawing folded round onto the flanks and back (front on to four fifths of
           the width, then back in to the middle behind), so the plates, rivets and lames carry on round the suit where
           the steel alone read as a smooth grey slab */
        function lift(px, py) { px = Math.round(px); return px < 0 || px >= W || py < 0 || py > FOOT ? 0 : TOP[py * W + px]; }
        function ring(r, py, centre) {
          var ym = (H - py) / PX, cx = (r[0] + r[1]) / 2, hw = (r[1] - r[0] + 1) / 2, at = cnt, zc = r[3] || 0;
          /* Godric's 2 on corridor-armour-hybrid-r2-1023 (11.23 am: "the shoulders and upper chest are beginning to look a
             bit too boxy"): the squarer ring kept only below the breastplate (the fauld, the hips), eased back to round 1's
             ellipse between 1.0 and 1.2 m up, so the chest and pauldrons are round again; with it the chest's depth eased from
             0.15 m at 1.3 m to 0.115 at the gorget (CAPS), and each shoulder's dome taken over 0.18 m of its top, not 0.1 */
          var up = Math.min(1, Math.max(0, ((FOOT - py) / PX - 1.0) / 0.2));
          var ex = flat ? 1 : r[3] !== undefined ? 0.6 : 2 / (2 + (1 - up) * Math.min(1, Math.max(0, (hw / PX - 0.1) / 0.1))), tf = Math.asin(Math.pow(0.8, 1 / ex));
          if (centre) { pos.push((cx - X0) / PX, ym, zc); uv.push(cx / W, 1 - py / H); uvS.push(0, ym * 2); cnt++; }
          for (var i = 0; i <= SEG; i++) {
            var th = (i / SEG - 0.5) * Math.PI * 2, s = Math.sin(th), c = Math.cos(th), a = Math.abs(th);   /* from the back round by the front, the seam behind */
            var xs = Math.sign(s) * Math.pow(Math.abs(s), ex), zs = Math.sign(c) * Math.pow(Math.abs(c), ex);
            var un = flat ? s * 0.8 : a <= tf ? xs : Math.sign(s) * 0.8 * (Math.PI - a) / (Math.PI - tf);
            var t = flat ? 1 : Math.min(1, lift(cx + hw * xs, py) / PX / 0.18), dome = Math.max(0.2, Math.sqrt(1 - (1 - t) * (1 - t)));
            pos.push((cx + hw * xs - X0) / PX, ym, zc + r[2] * zs * dome); uv.push((cx + hw * un) / W, 1 - py / H); uvS.push(i / SEG * 2, ym * 2); cnt++;
          }
          return at;
        }
        function capOf(r, py, up) {
          var o = ring(r, py, true);
          for (var i = 0; i < SEG; i++) { if (up) ind.push(o, o + 1 + i, o + 2 + i); else ind.push(o, o + 2 + i, o + 1 + i); }
        }
        /* each run linked to the one it carries on as in the next row: one to one, or, where a limb leaves the trunk, the
           trunk on into the widest (if it keeps half the width); the limb then starts three rows up inside the trunk,
           capped there, so no ledge shows. The runs smoothed along their links, so the trunk narrows over a few
           centimetres rather than in one row */
        function wide(o) { return o.r[1] - o.r[0]; }
        function widest(l) { return l.reduce(function (m, o) { return !m || wide(o) > wide(m) ? o : m; }, null); }
        var R = rows.map(function (row) { return row[1].map(function (r) { return { r: r.slice(), py: row[0], up: [], down: [], prev: null, next: null }; }); });
        R.forEach(function (cur, j) {
          if (!j) return;
          cur.forEach(function (b) { R[j - 1].forEach(function (a) { if (a.r[0] <= b.r[1] && b.r[0] <= a.r[1]) { a.down.push(b); b.up.push(a); } }); });
        });
        R.forEach(function (cur) {
          cur.forEach(function (a) {
            var b = a.down.length === 1 ? a.down[0] : widest(a.down.filter(function (o) { return o.up.length === 1; }));
            if (!b || b.prev || wide(b) < 0.5 * wide(a)) return;
            if (b.up.length > 1 && (widest(b.up) !== a || wide(a) < 0.5 * wide(b))) return;
            a.next = b; b.prev = a;
          });
        });
        var all = [].concat.apply([], R);
        all.forEach(function (o) {
          var s0 = o.r[0], s1 = o.r[1], m = 1, p = o, q = o;
          for (var k = 0; k < 3; k++) { p = p && p.prev; q = q && q.next; if (p) { s0 += p.r[0]; s1 += p.r[1]; m++; } if (q) { s0 += q.r[0]; s1 += q.r[1]; m++; } }
          o.s = [s0 / m, s1 / m, o.r[2]];
          if (!flat) o.s[2] = Math.min((o.s[1] - o.s[0] + 1) / 2 / PX, depth((FOOT - o.py) / PX));
          /* the feet: sabatons, the heel a little behind the shin and the toe out toward the corridor, the instep
             sloping down to it (a quarter of a metre from heel to toe at the sole, the toe blunt), so side on they are feet and not stumps */
          var yf = (FOOT - o.py) / PX;
          if (!flat && yf < 0.13) { var front = 0.065 + 0.125 * Math.pow(1 - yf / 0.13, 1.6), back = -0.065; o.s[2] = (front - back) / 2; o.s[3] = (front + back) / 2; }
        });
        all.forEach(function (o) { o.at = ring(o.s, o.py); });
        function stitch(a, b) { for (var i = 0; i < SEG; i++) ind.push(a + i, b + i, b + i + 1, a + i, b + i + 1, a + i + 1); }
        all.forEach(function (o) {
          if (o.next) stitch(o.at, o.next.at);
          if (!o.prev) {
            if (o.up.length) { var e = o.py - 3 * ROW; capOf(o.s, e, true); stitch(ring(o.s, e), o.at); }
            else capOf(o.s, o.py, true);
          }
          if (!o.next) {
            if (o.down.length) { var f = o.py + 3 * ROW; stitch(o.at, ring(o.s, f)); capOf(o.s, f, false); }
            else capOf(o.s, o.py, false);
          }
        });
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setAttribute('uvS', new THREE.Float32BufferAttribute(uvS, 2)); geo.setIndex(ind); geo.computeVertexNormals();
        /* the steel only where the shape faces sideways or away; a ledge where a limb leaves the trunk (facing up or down)
           keeps the drawing, so no pale line crosses the front */
        var n = geo.attributes.normal.array, wd = new Float32Array(cnt);
        function ease(a, b, v) { var t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); }
        for (var k = 0; k < cnt; k++) {
          var nx = n[k * 3], nz = n[k * 3 + 2], h = Math.sqrt(nx * nx + nz * nz);
          wd[k] = flat ? 1 : 1 - ease(0.25, 0.5, h) * (1 - ease(0.35, 0.65, nz / Math.max(h, 1e-4)));
          if (!flat && h < 0.5) {   /* and is lit as the front is, or the vault's light picks it out as a pale band */
            var f = 1 - ease(0.25, 0.5, h), v = new THREE.Vector3(nx * (1 - f), n[k * 3 + 1] * (1 - f), nz * (1 - f) + f).normalize();
            n[k * 3] = v.x; n[k * 3 + 1] = v.y; n[k * 3 + 2] = v.z;
          }
        }
        geo.setAttribute('wd', new THREE.BufferAttribute(wd, 1));
        return geo;
      }
      var rows = [], py, px;
      for (py = 0; py <= FOOT; py += ROW) {
        var runs = [], s = -1, ym = (FOOT - py) / PX;
        for (px = 0; px <= W; px++) {
          var on = px < W && body(px, py);
          if (on && s < 0) s = px;
          if (!on && s >= 0) { if (px - s >= 12) { var hw = (px - s) / 2 / PX; runs.push([s, px - 1, Math.min(hw, depth(ym))]); } s = -1; }
        }
        if (runs.length) rows.push([py, runs]);
      }
      var shaft = [];
      for (py = 150; py <= 2440; py += ROW) shaft.push([py, [[pole(py) - 22, pole(py) + 22, 22 / PX]]]);
      mat.map = tex(SHIELD ? c : im); mat.needsUpdate = true;
      var poleMat = blendMat(); poleMat.map = mat.map; mats.push(poleMat);
      var hc = makeCanvas(HEAD.x, HEAD.y); hc.getContext('2d').drawImage(im, 0, 0, HEAD.x, HEAD.y, 0, 0, HEAD.x, HEAD.y);
      var bladeMat = new THREE.MeshStandardMaterial({ map: tex(hc), alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.3, roughness: 0.45, envMap: env });
      mats.push(bladeMat);
      /* each kind's pieces (KINDS), every geometry and look built once, at its first asking. The trunk cut where the kind
         says (rows between two heights of the drawing, py), capped at the cut as a limb's end is; the shaft whole (the
         halberd's), from below its head (the pike's), or only through the fist (no weapon: the fingers are drawn on that
         piece of the shaft, so the hand stays a closed fist) */
      var geos = {}, looks = {};
      function once(k, f) { return geos[k] || (geos[k] = f()); }
      function lookMats(name) {
        if (!name) return [mat, poleMat];
        return looks[name] || (looks[name] = (function () { var a = blendMat(name); a.map = mat.map; return [a]; })());   /* the shaft keeps the default's, so its wood stays wood */
      }
      out.parts = function (K) {
        var ms = lookMats(K.look), cut = K.cut || [0, FOOT], p = [];
        var trunk = once('trunk:' + cut, function () { return build(rows.filter(function (r) { return r[0] >= cut[0] && r[0] <= cut[1]; }), false); });
        if (!HALB) {   /* a drawn kind with no halberd (the sword, the shield, the mace): its weapon is in the trunk's drawing */
          p.push({ geo: trunk, mat: ms[0], name: 'armour-hybrid' }, { geo: trunk, mat: ink, name: 'armour-hybrid-ink' });
          if (SHIELD) {   /* the shield flat on the forearm, its drawing on a board, in front of the hip it hides */
            var sw = SHIELD[2] - SHIELD[0] + 1, shh = SHIELD[3] - SHIELD[1] + 1, scv = makeCanvas(sw, shh);
            var sx2 = scv.getContext('2d'); sx2.drawImage(im, SHIELD[0], SHIELD[1], sw, shh, 0, 0, sw, shh);
            for (var ry = 0; ry < shh; ry++) sx2.clearRect(Math.max(0, SR[SHIELD[1] + ry] - SHIELD[0] + 1), ry, sw, 1);   /* the breastplate's edge beside it stays the trunk's */
            var shMat = once('shield-mat', function () { var m = new THREE.MeshStandardMaterial({ map: tex(scv), alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.05, roughness: 0.7, envMap: env }); mats.push(m); return m; });
            p.push({ geo: once('shield', function () { return new THREE.PlaneGeometry(sw / PX, shh / PX); }), mat: shMat, name: 'armour-shield',
                     at: [(SHIELD[0] + sw / 2 - X0) / PX, (H - SHIELD[1] - shh / 2) / PX, 0.12] });
          }
          return p;
        }
        var sh = K.weapon === 'pike' ? [HEAD.y, 2440] : K.weapon && K.weapon !== 'halberd' ? FIST : [150, 2440];
        var pole = once('shaft:' + sh, function () { return build(shaft.filter(function (r) { return r[0] >= sh[0] && r[0] <= sh[1]; }), true); });
        p.push({ geo: trunk, mat: ms[0], name: 'armour-hybrid' }, { geo: trunk, mat: ink, name: 'armour-hybrid-ink' },
               { geo: pole, mat: poleMat, name: 'armour-hybrid-shaft' }, { geo: pole, mat: ink, name: 'armour-hybrid-ink' });
        if (!K.weapon || K.weapon === 'halberd')
          p.push({ geo: once('blade', function () { return new THREE.PlaneGeometry(HEAD.x / PX, HEAD.y / PX); }), mat: bladeMat, name: 'armour-hybrid-blade', at: [(HEAD.x / 2 - X0) / PX, (H - HEAD.y / 2) / PX, 0] });
        return p;
      };
      out.at = function (py) { return [(pole(py) - X0) / PX, (H - py) / PX]; };   /* the shaft's middle at a row, metres */
      out.ink = ink; out.env = env;
      out.ready = true; out.waiters.splice(0).forEach(function (f) { f(); });
    };
    im.src = src;
    return out;
  }
  /* the steel's looks: sat (1 the drawing's colour, 0 grey), tint, metal (times the default's), rough (added), env (the
     mirror's share) and bands (black-and-white's blackened strips, about 4 cm in each 9, down the suit) */
  var LOOKS = {
    grey: { sat: 0, tint: [0.7, 0.72, 0.75], metal: 0.7, rough: 0.2, env: 0.4 },
    munition: { sat: 0.5, tint: [0.64, 0.6, 0.55], metal: 0.5, rough: 0.32, env: 0.25 },
    bands: { sat: 1, tint: [1, 1, 1], metal: 1, rough: 0, env: 1, bands: true }
  };
  /* the kinds made from the one drawing by code (docs/notes/2026-10-23-armour-varieties.md; Godric's answer of 7.14 pm
     on corridor-armour-gallery-1023, "the suit we designed as the standard default, but where we know that there are
     varieties we need to create that variety"; built on Fawkes's word of 7.51 pm, nothing spent). scale is the whole
     suit's (feet, depth and all); cut the drawing's rows kept (py, 0 its top to 2468 its soles); weapon halberd, pike,
     none; stand (the armoury's); look (LOOKS); drawn, a kind with its own drawing (DRAWN) */
  var KINDS = {
    default: { what: 'plain steel, a halberd: every corridor, the stair hall, the gallery\'s y 62' },
    boy: { what: 'a boy\'s suit, for a page of about twelve, 1.45 tall (the gallery, west y 56)', scale: 1.45 / 1.70 },
    tall: { what: '"a tall suit of armor" (PS 12 L4250; the library corridor\'s mirror-armour)', scale: 1.1 },
    tudor: { what: 'Tudor field armour, plain steel gone grey (the gallery, east y 47)', look: 'grey' },
    'black-and-white': { what: 'black-and-white, the bands left dark (the gallery, east y 53)', look: 'bands' },
    munition: { what: 'a plain munition suit, the cheapest in the row (the gallery, east y 65)', look: 'munition' },
    headless: { what: 'a suit with no head, on a wooden stand, waiting for one (the West armoury)', cut: [496, 2468], weapon: 'none', stand: true },
    bareheaded: { what: 'a suit without its helmet, both gauntlets cupped where the head should be (night hunt touch 20, req 1252)', drawn: 'bareheaded' },
    /* the drawn kinds, each its own drawing in the default's hand (Godric's picks on corridor-armour-all-1023, 10.04 pm,
       23 October 2026: every boxed pick but Q6, which takes its 1; the places are docs/notes/2026-10-23-armour-varieties.md) */
    gothic: { what: 'Gothic, fluted, long pointed sabatons (Q1, 1)', drawn: 'gothic' },
    'gothic-visor': { what: 'Gothic, its visor raised a little (Q2, 1)', drawn: 'gothic-visor' },
    jousting: { what: 'jousting armour, a great helm bolted on, a lance rest (Q3, 4)', drawn: 'jousting' },
    maximilian: { what: 'fluted Maximilian, the mended gauntlet (Q4, 1)', drawn: 'maximilian' },
    cuirassier: { what: 'a cuirassier\'s, the helm with a barred face (Q5, 2)', drawn: 'cuirassier' },
    tilt: { what: 'tilt armour, heavy on the left (Q6, 1)', drawn: 'tilt' },
    sword: { what: 'a sword point down before it, both hands on the pommel (Q7, 1)', drawn: 'sword' },
    shield: { what: 'a shield of no arms, painted plain (Q8, 1)', drawn: 'shield' },
    mace: { what: 'a mace at its belt (Q9, 1, the halberd\'s ghost cleared)', drawn: 'mace' },
    'three-quarter': { what: 'three-quarter armour, boots below the knee, a halberd (Q10, 1)', drawn: 'three-quarter' }
  };
  /* each drawing's own: x0 the column under the default's middle (each helmet's middle less 61 px), where it is not the
     drawing's middle; halberd false where it carries none (no shaft cut, no blade); shield the box round the shield,
     built flat (px, its red at x 30 to 416, y 661 to 1388, and its rim). The halberds all lean as the default's, measured */
  var DRAWN = {
    gothic: {}, 'gothic-visor': {}, jousting: {}, maximilian: {}, cuirassier: {}, tilt: {}, 'three-quarter': {},
    sword: { x0: 389, halberd: false },
    shield: { x0: 504, halberd: false, shield: [20, 650, 430, 1410], mirror: 565 },
    mace: { halberd: false },
    bareheaded: { x0: 606, halberd: false }
  };
  var STAND = 0.06;   /* the armoury stand's board */
  function extras(K, S, g, add) {   /* the pieces built in code (the code-made pike, mace, shield and post gave way to the drawn kinds) */
    var wood = new THREE.MeshStandardMaterial({ color: col(0x4a3c31), roughness: 0.75 });
    if (K.stand) {   /* the armoury's stand: a board 0.6 square it stands on, and the post that would carry its head */
      var bd = new THREE.Mesh(new THREE.BoxGeometry(0.6, STAND, 0.6), wood); bd.position.set(0, STAND / 2, 0); add(bd, 'armour-stand', true);
      var nk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.3, 10), wood); nk.position.set(0, 1.3 + 0.15, 0); add(nk, 'armour-stand-neck');
    }
  }
  function shadowMat() {
    var sc = makeCanvas(64, 64), sg = sc.getContext('2d'), grd = sg.createRadialGradient(32, 32, 6, 32, 32, 32);
    grd.addColorStop(0, 'rgba(20,14,10,0.5)'); grd.addColorStop(1, 'rgba(20,14,10,0)');
    sg.fillStyle = grd; sg.fillRect(0, 0, 64, 64);
    return new THREE.MeshBasicMaterial({ map: tex(sc), transparent: true, depthWrite: false });
  }
  function make(T, r, opts) {
    opts = opts || {};
    THREE = T; renderer = r || renderer;
    var src = opts.src || '../assets/layers/corridor-armour.png', kind = opts.kind || 'default', K = KINDS[kind];
    if (!K) throw new Error('CastleSuit: no kind ' + kind + ' (' + Object.keys(KINDS).join(', ') + ')');
    if (K.drawn) src = src.replace(/corridor-armour\.png/, 'corridor-armour-' + K.drawn + '.png');   /* beside the default's, wherever the page keeps it */
    var S = cache[src] || (cache[src] = shared(src, DRAWN[K.drawn])), g = new THREE.Group(), waiting = [];
    var sc = K.scale || 1, inner = new THREE.Group(); inner.scale.setScalar(sc); if (K.stand) inner.position.y = STAND; g.add(inner);
    var suit = { group: g, kind: kind, mats: [], body: null, ready: false,
      back: K.stand ? 0.3 : 0.15 * sc,   /* metres behind the origin to its back: stand that far, and 5 cm, off its wall */
      onReady: function (f) { if (suit.ready) f(suit); else waiting.push(f); },
      light: function (k, bounce) {
        var b = bounce === undefined ? 0.35 : bounce;
        suit.mats.forEach(function (m) { m.emissive.copy(col(0xffb070)).multiplyScalar(b * 0.12 * k); m.envMapIntensity = (m.userData.env === undefined ? 1 : m.userData.env) * (1 - 0.65 * k); });
      } };
    function fill() {
      function add(m, name, outside) { m.name = name; (outside ? g : inner).add(m); }
      S.parts(K).forEach(function (p) {
        var m = new THREE.Mesh(p.geo, p.mat); if (p.at) m.position.set(p.at[0], p.at[1], p.at[2]);
        add(m, p.name); if (!suit.body && p.name === 'armour-hybrid') suit.body = m;
      });
      extras(K, S, g, add);
      g.traverse(function (o) { if (o.material && o.material.isMeshStandardMaterial && suit.mats.indexOf(o.material) < 0) suit.mats.push(o.material); });
      suit.ready = true; waiting.splice(0).forEach(function (f) { f(suit); });
    }
    if (S.ready) fill(); else S.waiters.push(fill);
    if (opts.shadow !== false) {
      var shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34), opts.shadow || S.shadow || (S.shadow = shadowMat()));
      shadow.rotation.x = -Math.PI / 2; shadow.position.set(0.08 * sc, 0.008, 0.02);   /* 8 mm over the floor (board rule 6) */ shadow.scale.set(sc * (K.stand ? 1.4 : 1), sc * (K.stand ? 1.8 : 1), 1); g.add(shadow);
    }
    g.name = 'armour-hybrid';
    return suit;
  }
  window.CastleSuit = { make: make, KINDS: KINDS };
})();
