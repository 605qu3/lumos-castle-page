/* figure.js: the castle's people in simple 3D, the Pickett pilot (req 1139; Godric's 1 on Dumbledore's 3D report, 27
   October 2026, docs/ministry/reviews/2026-10-27-dumbledore-3d-figures.md, part 4). Built in code, no drawing. Round 2
   (Godric, 10.39 am: "they do not look anything like the drawn figures ... take on the aesthetic of the drawn figures"):
   drawn in the painted cells' manner (assets/layers/electives-teachers.png, class-at-desks.png, the 11-to-12 stock) as
   far as code goes: a body's proportions, the robe open over the clothes beneath and hung in folds, its lining showing
   along the fronts and in the sleeves, the castle's ink round the outline (page/corridor/suit.js, Design's req 1140) and
   hatched in pen into the shade, muted colours, and a face drawn on the head (eyes, lids, brows, nose, lips). Three
   r128, the global the pages load. A trial: the rooms stay 2.5D and no built figure is touched.

   CastleFigure.make(THREE, opts)  one standing figure, skinned, two draw calls (the body and its ink).
       opts { look: 'pickett' (default) or 'pupil', height (m), and any colour of LOOKS below }. Returns { group, mesh,
       ink, bones, act(steps), update(dt), busy(), light(k) }: the group's origin is on the floor between the feet,
       facing +z. act([...]) queues steps, each one of { to: [x, z] } (walk there in the parent's x and z), { face:
       radians } (turn on the spot; rotation.y, 0 facing +z), { flick: 1 } (the wand flicked, no glow, no trail),
       { wait: s }. update(dt) runs them and the idle between; busy() is true while any step is left. light(k): k 0 to 1
       as the room's own candles burn (not by the hour: an unlit room at night is light(0); Design, req 1140), a little
       of tones.js's candle on the cloth.
   CastleFigure.crowd(THREE, list, model)  seated pupils (model: models/pupil.json, the shapes made in Blender, or none), instanced: the whole class is two draw calls. list of { at: [x, y,
       z] (the chair's middle on the floor), rot (radians, 0 facing +z, toward the desk), scale, trim (house), skin,
       hair (hex), long (long hair), curly, face (0 to 7, the drawn faces), girl (a skirt, not trousers) }. Returns
       { group, mesh, ink, update(t), light(k) }; update(t) gives each a slow breath and a small look about.
   CastleFigure.HOUSES  the house colours, tools/people-house-keys.py's: the robe's lining, the jumper's stripe, the tie. */
(function () {
  'use strict';
  var THREE, grad = null;
  var HOUSES = { gryffindor: 0x9b2318, hufflepuff: 0xd4a62a, ravenclaw: 0x2a4a7a, slytherin: 0x2e5a3a };
  var INK = 0x16120e;      /* the suit's, the castle's one ink (Design, req 1140) */
  var CANDLE = 0xffb466;   /* tones.js's candle (Design, req 1140) */
  var TAU = Math.PI * 2;
  function lin(h) { return new THREE.Color(h).convertSRGBToLinear(); }
  function tones() {   /* four steps of light, softer than a cartoon's three: the hatching does the rest */
    if (grad) return grad;
    var d = new Uint8Array([92, 92, 92, 255, 150, 150, 150, 255, 210, 210, 210, 255, 255, 255, 255, 255]);
    grad = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat);
    grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
    return grad;
  }
  function V(x, y, z) { return new THREE.Vector3(x, y, z); }
  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    var m = new THREE.Matrix4();
    m.compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)),
              V(sx || 1, sy || sx || 1, sz || sx || 1));
    return m;
  }

  /* ---- the kit: every part baked into one geometry ----
     Each part: its colour per triangle (a hex, or { slot } for the crowd's own colours, from colour(middle, u)), its
     bone (a number, or bone(y) giving [a, b, weight of a]), its pen (0 none, 1 cloth, 2 skin, 3 hair: how hard the
     shade is hatched) and, for a head, its uv into the face drawing; every other part reads the drawing's plain corner */
  var CORNER = [0.995, 0.995];
  function Kit() { this.p = []; this.n = []; this.c = []; this.s = []; this.u = []; this.pen = []; this.si = []; this.sw = []; }
  Kit.prototype.add = function (geo, m, colour, bone, o) {
    o = o || {};
    if (o.inner) {   /* a lining: kept at the end, past the ink's range, since no outline is seen from within */
      (this.inner = this.inner || new Kit()).add(geo, m, colour, bone, Object.assign({}, o, { inner: false })); return;
    }
    var g = geo;
    if (o.deform) {   /* bend the part's points, then its normals smooth again */
      var P0 = g.attributes.position, w = V(0, 0, 0);
      for (var i = 0; i < P0.count; i++) { w.fromBufferAttribute(P0, i); o.deform(w); P0.setXYZ(i, w.x, w.y, w.z); }
      g.computeVertexNormals();
    }
    g = g.index ? g.toNonIndexed() : g.clone();
    if (!g.attributes.normal) g.computeVertexNormals();
    if (m) g.applyMatrix4(m);
    var P = g.attributes.position.array, N = g.attributes.normal.array, UV = g.attributes.uv ? g.attributes.uv.array : null, v = V(0, 0, 0);
    for (var t = 0; t < P.length; t += 9) {
      v.set((P[t] + P[t + 3] + P[t + 6]) / 3, (P[t + 1] + P[t + 4] + P[t + 7]) / 3, (P[t + 2] + P[t + 5] + P[t + 8]) / 3);
      var tu = UV ? (UV[t / 3 * 2] + UV[t / 3 * 2 + 2] + UV[t / 3 * 2 + 4]) / 3 : 0;
      var k = typeof colour === 'function' ? colour(v, tu) : colour, slot = 0, cc;
      if (k !== null && typeof k === 'object') { slot = k.slot; cc = lin(k.base !== undefined ? k.base : 0xffffff); } else cc = lin(k);
      for (var j = 0; j < 3; j++) {
        var q = t + j * 3, py = P[q + 1];
        this.p.push(P[q], py, P[q + 2]); this.n.push(N[q], N[q + 1], N[q + 2]); this.c.push(cc.r, cc.g, cc.b); this.s.push(slot);
        if (o.face && UV) this.u.push(UV[(t / 3 + j) * 2], UV[(t / 3 + j) * 2 + 1]); else this.u.push(CORNER[0], CORNER[1]);
        this.pen.push(o.pen !== undefined ? o.pen : 1);
        var b = typeof bone === 'function' ? bone(py, P[q], P[q + 2]) : [bone, 0, 1];
        this.si.push(b[0], b[1], 0, 0); this.sw.push(b[2], 1 - b[2], 0, 0);
      }
    }
  };
  Kit.prototype.geometry = function (skinned) {
    var g = new THREE.BufferGeometry(), self = this;
    this.outer = this.p.length / 3;
    if (this.inner) ['p', 'n', 'c', 's', 'u', 'pen', 'si', 'sw'].forEach(function (k) { self[k] = self[k].concat(self.inner[k]); });
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('aSlot', new THREE.Float32BufferAttribute(this.s, 1));
    g.setAttribute('aPen', new THREE.Float32BufferAttribute(this.pen, 1));
    if (skinned) {
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4));
      g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    }
    g.computeBoundingSphere();
    return g;
  };
  /* a tapered limb or sleeve from a to b, radius ra at a and rb at b; open, it is a bell with no ends */
  function between(a, b, ra, rb, seg, open) {
    var d = new THREE.Vector3().subVectors(b, a), len = d.length();
    var g = new THREE.CylinderGeometry(rb, ra, len, seg || 10, 1, !!open);
    var q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(d.multiplyScalar(0.5)), q, V(1, 1, 1)));
    return g;
  }
  /* a part of a figure made in Blender (tools/people-figure-blender.py): its points, normals, uv and triangles; inward, it
     comes back turned inside out and drawn in a little, a lining */
  function modelPart(Mo, name, inward) {
    var d = Mo.parts[name], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(d.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2));
    g.setIndex(d.i);
    if (!inward) return g;
    g = g.toNonIndexed();
    var P = g.attributes.position.array, N = g.attributes.normal.array;
    for (var i = 0; i < P.length; i++) P[i] -= N[i] * inward;
    return flip(g);
  }
  function flip(g) {   /* turned inside out: a lining, seen from within */
    g = g.index ? g.toNonIndexed() : g;
    var P = g.attributes.position.array, N = g.attributes.normal.array, U = g.attributes.uv ? g.attributes.uv.array : null;
    for (var t = 0; t < P.length; t += 9) for (var k = 0; k < 3; k++) {
      var a = t + 3 + k, b = t + 6 + k, x = P[a]; P[a] = P[b]; P[b] = x; x = N[a]; N[a] = N[b]; N[b] = x;
    }
    if (U) for (var s = 0; s < U.length; s += 6) for (var h = 0; h < 2; h++) { var x2 = U[s + 2 + h]; U[s + 2 + h] = U[s + 4 + h]; U[s + 4 + h] = x2; }
    for (var i = 0; i < N.length; i++) N[i] = -N[i];
    return g;
  }
  /* the robe: an open shell round the body, rows [y, radius, half gap at the front] from the hem up; folds hung into it,
     deepest at the hem; its two front edges turned back to show the lining (facing); the lining inside */
  function robeShell(rows, n, depth, folds, inner) {
    var P = [], U = [], I = [], nr = rows.length;
    rows.forEach(function (row, i) {
      for (var j = 0; j <= n; j++) {
        var t = j / n, th = row[2] + t * (TAU - 2 * row[2]), y = row[0];
        var f = folds * Math.max(0, Math.min(1, (row[3] !== undefined ? row[3] : 1)));
        var R = row[1] * (1 + f * (0.07 * Math.sin(th * 7 + 0.4) + 0.035 * Math.sin(th * 13 + 1.1))) * (inner ? 0.965 : 1);
        P.push(R * Math.sin(th), y + (i === 0 ? 0.012 * Math.sin(th * 7 + 0.4) : 0), R * Math.cos(th) * depth);
        U.push(t, i / (nr - 1));
      }
    });
    for (var i = 0; i < nr - 1; i++) for (var j = 0; j < n; j++) {
      var a = i * (n + 1) + j, b = a + 1, c = a + n + 1, d = c + 1;
      if (inner) I.push(a, c, b, b, c, d); else I.push(a, b, c, b, d, c);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.setIndex(I); g.computeVertexNormals();
    return g;
  }

  /* ---- the pen: the castle's ink hatched into the shade, as the drawn figures are shaded ----
     Only where the room's first light (a window's sun, else a candle) turns away from the cloth: one set of strokes past
     the edge of the light, crossed deeper in; never on the skin. The strokes run on the figure's own body (its rest
     pose), so they stay on the cloth as he moves; each thins to nothing, not to a pixel's grey, and they fade out where
     they would be finer than a pixel */
  function pen(mat, density, hc) {
    mat.extensions = { derivatives: true };
    var prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function (sh) {
      if (prev) prev(sh);
      sh.vertexShader = 'attribute float aPen;\nvarying vec3 vObj;\nvarying float vPen;\n' +
        sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position; vPen = aPen;');
      sh.fragmentShader = 'varying vec3 vObj;\nvarying float vPen;\n' +
        'float strokes(float c, float t) { float d = abs(fract(c + 0.5) - 0.5), w = fwidth(c);\n' +
        '  return (1.0 - smoothstep(max(t - w, 0.0), t + w, d)) * smoothstep(0.0, w, t) * (1.0 - smoothstep(0.22, 0.45, w)); }\n' +
        sh.fragmentShader.replace('#include <dithering_fragment>', [
          '#include <dithering_fragment>',
          'vec3 toL = normalize(vec3(-0.5, 0.6, 0.6));',
          '#if NUM_DIR_LIGHTS > 0',
          'toL = directionalLights[0].direction;',
          '#elif NUM_POINT_LIGHTS > 0',
          'toL = normalize(pointLights[0].position + vViewPosition);',
          '#endif',
          'float nl = dot(normalize(normal), toL);',
          'float hard = vPen < 0.5 ? 0.0 : vPen < 1.5 ? 1.0 : 0.0;',
          'float t1 = clamp((0.0 - nl) * 0.45, 0.0, 0.16) * hard, t2 = clamp((-0.45 - nl) * 0.5, 0.0, 0.14) * hard;',
          'float c1 = (vObj.x * 0.62 + vObj.y + vObj.z * 0.48) * ' + density.toFixed(1) + ';',
          'float c2 = (-vObj.x * 0.7 + vObj.y * 0.55 - vObj.z * 0.6) * ' + (density * 0.9).toFixed(1) + ';',
          'float h = max(strokes(c1, t1), strokes(c2, t2));',
          'gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.075, 0.058, 0.045), h * 0.82);',
          /* the hair: strands from the crown, fine in the light and fuller in the shade, in the hair's own darker tone */
          'if (vPen > 2.5) { vec3 dh = vObj - vec3(' + hc.x.toFixed(3) + ', ' + hc.y.toFixed(3) + ', ' + hc.z.toFixed(3) + ');',
          '  float ca = (atan(dh.x, dh.z) + 0.05 * sin(dh.y * 40.0) + 0.03 * sin(dh.y * 97.0)) * 7.0;',
          '  float hs = strokes(ca, mix(0.05, 0.16, clamp(0.5 - nl, 0.0, 1.0)));',
          '  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.55, hs); }'
        ].join('\n'));
    };
  }
  /* ---- the candle's tone: the room's orange light keeps its strength and its steps but gives the colours a softer
     warmth, as the painted cards are toned by night (figure-test.html's card colour), the skin most, so faces and white
     shirts keep their own colour and do not go one orange. Its k is light(k)'s ---- */
  function nightTone(mat) {
    var u = { value: 0 }, w = lin(0xffe4c8), lw = 0.2126 * w.r + 0.7152 * w.g + 0.0722 * w.b;
    var tint = 'vec3(' + [w.r, w.g, w.b].map(function (c) { return (c / lw).toFixed(3); }).join(', ') + ')';
    var prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function (sh) {
      if (prev) prev(sh);
      sh.uniforms.uNight = u;
      sh.fragmentShader = 'uniform float uNight;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', [
        'if (uNight > 0.0) { vec3 lw = vec3(0.2126, 0.7152, 0.0722);',
        '  float lv = dot(outgoingLight, lw) / max(dot(diffuseColor.rgb, lw), 0.002);',
        '  vec3 nc = diffuseColor.rgb * lv * ' + tint + ';',
        '  gl_FragColor.rgb = mix(gl_FragColor.rgb, linearToOutputTexel(vec4(nc, 1.0)).rgb, uNight * (vPen > 1.5 && vPen < 2.5 ? 0.9 : 0.7)); }',
        '#include <dithering_fragment>'].join('\n'));
    };
    return u;
  }
  /* the drawing's own colours: where it is opaque it is ink and shading over the part's colour (the skin's tone); where
     it is faint it is a colour of its own (the whites of the eyes, the iris), not tinted by the skin */
  function ownColour(sh) {
    sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>',
      '#ifdef USE_MAP\n  diffuseColor.rgb *= mix(vec3(1.0), vColor, step(0.5, texelColor.a));\n#else\n#include <color_fragment>\n#endif');
  }

  /* ---- the faces, drawn on a canvas round the head ----
     The head's uv: u round it, the front at u 0.25; v down it, the eyes about the middle. A cell w by h holds one face;
     its points by angle from the front (radians across, radians down) */
  function drawFace(x, X, Y, W, H, f) {
    var kx = W / TAU, ky = H / Math.PI, cx = X + W * 0.25, cy = Y + H * 0.5;
    function P(a, b) { return [cx + a * kx, cy + b * ky]; }
    /* a colour of its own: the region cleared and filled faint, so its alpha stays under the half that marks skin */
    function own(paths, rgb) {
      x.save(); paths.forEach(function (p) { p(); x.clip(); });
      x.clearRect(X, Y, W, H); x.fillStyle = 'rgba(' + rgb + ',0.3)'; x.fillRect(X, Y, W, H); x.restore();
    }
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    x.fillStyle = '#ffffff'; x.fillRect(X, Y, W, H);
    x.lineCap = 'round'; x.lineJoin = 'round';
    var px = W / 512, lw = px * (f.bold || 1.7), ink = 'rgba(52,30,22,1)', soft = 'rgba(128,80,64,1)';   /* lines bold enough to read at a boy's desk */
    /* the cheeks' warmth and the shade under the brow and beside the nose: over the skin */
    [-1, 1].forEach(function (s) {
      var p = P(s * 0.5, 0.3), g = x.createRadialGradient(p[0], p[1], 1, p[0], p[1], 22 * px);
      g.addColorStop(0, 'rgba(232,168,150,' + (f.blush || 0.5) + ')'); g.addColorStop(1, 'rgba(232,168,150,0)');
      x.fillStyle = g; x.fillRect(p[0] - 30 * px, p[1] - 30 * px, 60 * px, 60 * px);
      var e = P(s * 0.38, -0.08), g2 = x.createRadialGradient(e[0], e[1], 2, e[0], e[1], 16 * px);
      g2.addColorStop(0, 'rgba(205,160,140,0.55)'); g2.addColorStop(1, 'rgba(205,160,140,0)');
      x.fillStyle = g2; x.fillRect(e[0] - 20 * px, e[1] - 20 * px, 40 * px, 40 * px);
    });
    /* the eyes: the white and the iris their own colours; the upper lid in ink, heavier, the lower a fine line */
    [-1, 1].forEach(function (s) {
      var e = P(s * 0.36, -0.01), ew = 0.17 * kx * (f.eye || 1), eh = 0.075 * ky * (f.eye || 1);
      var ix = e[0] + s * (f.look || 0) * ew * 0.3, iy = e[1] + eh * (0.12 + 0.3 * (f.down || 0));   /* down: at the work on the desk */
      function eye() { x.beginPath(); x.ellipse(e[0], e[1], ew, eh, 0, 0, TAU); }
      own([eye], '236,230,218');
      own([eye, function () { x.beginPath(); x.arc(ix, iy, eh * 0.95, 0, TAU); }], f.iris || '88,60,38');
      own([eye, function () { x.beginPath(); x.arc(ix, iy, eh * 0.5, 0, TAU); }], '18,12,10');
      own([function () { x.beginPath(); x.arc(ix - eh * 0.3, iy - eh * 0.32, eh * 0.2, 0, TAU); }], '250,246,236');   /* the catch-light */
      x.strokeStyle = ink; x.lineWidth = 2.6 * lw;
      x.beginPath(); x.moveTo(e[0] - s * ew * 1.05, e[1] + eh * 0.25);
      x.quadraticCurveTo(e[0], e[1] - eh * (1.55 - (f.lids || 0) * 0.6), e[0] + s * ew * 1.12, e[1] + eh * 0.05); x.stroke();
      if (f.lashes) { x.lineWidth = 1.6 * lw; x.beginPath(); x.moveTo(e[0] + s * ew * 1.05, e[1]); x.lineTo(e[0] + s * ew * 1.35, e[1] - eh * 0.6); x.stroke(); }
      x.strokeStyle = soft; x.lineWidth = 1.2 * lw;
      x.beginPath(); x.moveTo(e[0] - s * ew * 0.8, e[1] + eh * 0.85); x.quadraticCurveTo(e[0], e[1] + eh * 1.3, e[0] + s * ew * 0.9, e[1] + eh * 0.7); x.stroke();
      if (f.age) {   /* the lines of a grown face: under the eye, at its corner */
        x.lineWidth = 1 * lw; x.beginPath(); x.moveTo(e[0] - s * ew * 0.5, e[1] + eh * 1.9); x.quadraticCurveTo(e[0] + s * ew * 0.2, e[1] + eh * 2.3, e[0] + s * ew * 0.8, e[1] + eh * 1.7); x.stroke();
        x.beginPath(); x.moveTo(e[0] + s * ew * 1.35, e[1] + eh * 0.2); x.lineTo(e[0] + s * ew * 1.7, e[1] + eh * 0.6); x.stroke();
      }
      /* the brow */
      var b = P(s * 0.37, -0.2 - (f.arch || 0) * 0.04);
      x.strokeStyle = f.brow || 'rgba(60,38,26,1)'; x.lineWidth = (f.browW || 3.2) * lw;
      x.beginPath(); x.moveTo(b[0] - s * ew * 1.0, b[1] + eh * 0.5); x.quadraticCurveTo(b[0], b[1] - eh * (0.8 + (f.arch || 0)), b[0] + s * ew * 1.15, b[1] + eh * 0.4); x.stroke();
    });
    /* the nose: its shadowed side, the nostrils */
    var n0 = P(0.06, -0.06), n1 = P(0.1, 0.17);
    if (f.child) {
      var t0 = P(0.05, 0.12), t1 = P(0.0, 0.2), t2 = P(-0.05, 0.17);
      x.strokeStyle = soft; x.lineWidth = 1.1 * lw;
      x.beginPath(); x.moveTo(t0[0], t0[1]); x.quadraticCurveTo(t0[0] + 2 * lw, t1[1], t1[0], t1[1]); x.quadraticCurveTo(t2[0], t1[1], t2[0], t2[1]); x.stroke();
    } else {
    x.strokeStyle = soft; x.lineWidth = 1.5 * lw;
    x.beginPath(); x.moveTo(n0[0], n0[1]); x.quadraticCurveTo(n1[0] + 3 * lw, n1[1] - 8 * lw, n1[0], n1[1]); x.stroke();
    x.strokeStyle = ink; x.lineWidth = 1.6 * lw;
    [-1, 1].forEach(function (s) { var q = P(s * 0.07, 0.2); x.beginPath(); x.arc(q[0], q[1], 3.2 * lw, s > 0 ? Math.PI * 0.9 : Math.PI * 0.1, s > 0 ? Math.PI * 1.9 : -Math.PI * 0.9, s < 0); x.stroke(); });
    }
    /* the mouth: the parting line in ink, the lower lip a soft colour over the skin */
    var m = P(0, 0.47), mw = 0.2 * kx * (f.mouthW || 1), sm = (f.smile !== undefined ? f.smile : 0.5);
    x.fillStyle = f.child ? 'rgba(214,140,128,0.55)' : 'rgba(214,140,128,1)';
    x.beginPath(); x.ellipse(m[0], m[1] + (f.child ? 2.2 : 3.5) * lw, mw * (f.child ? 0.45 : 0.62), (f.child ? 1.8 : 3.6) * lw, 0, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(110,52,44,1)'; x.lineWidth = 2.1 * lw;
    x.beginPath(); x.moveTo(m[0] - mw, m[1] - sm * 4 * lw); x.quadraticCurveTo(m[0], m[1] + sm * 6 * lw, m[0] + mw, m[1] - sm * 4 * lw); x.stroke();
    if (f.age) {   /* the lines from nose to mouth */
      x.strokeStyle = soft; x.lineWidth = 1.2 * lw;
      [-1, 1].forEach(function (s) { var a = P(s * 0.17, 0.2), b = P(s * 0.25, 0.48); x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(a[0] + s * 8 * lw, (a[1] + b[1]) / 2, b[0], b[1]); x.stroke(); });
    }
    if (f.freckles) {
      x.fillStyle = 'rgba(170,100,70,1)';
      var r = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(f.freckles);
      for (var i = 0; i < 40; i++) { var a2 = (r() - 0.5) * 0.9, b2 = 0.08 + r() * 0.3; if (Math.abs(a2) < 0.05) continue; var q2 = P(a2, b2); x.beginPath(); x.arc(q2[0], q2[1], (0.8 + r()) * lw, 0, TAU); x.fill(); }
    }
    /* the chin and jaw, a fine shade line */
    var c0 = P(-0.16, 0.74), c1 = P(0.16, 0.74), c2 = P(0, 0.8);
    x.strokeStyle = 'rgba(190,140,120,1)'; x.lineWidth = 1.3 * lw;
    x.beginPath(); x.moveTo(c0[0], c0[1]); x.quadraticCurveTo(c2[0], c2[1], c1[0], c1[1]); x.stroke();
    x.restore();
  }
  function canvasTex(c) {
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;   /* no mip levels: they blurred the eyes' own colours into the skin's */
    return t;
  }

  /* hair in locks: a sphere's points pushed out in ridges round it (n of them, depth d of its radius R), and below the
     height lo (of R) its edge hung in points, one to each lock, so its rim reads as hair and not as a shell */
  function locks(R, n, d, lo) {
    return function (w) {
      var a = Math.atan2(w.x, w.z), k = 1 + d * Math.sin(a * n) * Math.min(1, (R - w.y) / R);
      w.x *= k; w.z *= k;
      if (w.y < lo * R) w.y -= R * 0.1 * (0.5 + 0.5 * Math.cos(a * n)) * Math.min(1, (lo * R - w.y) / (R * 0.15));
    };
  }
  /* The head: c its middle, r its radius; the face drawn on the skin (the head's uv), the nose and ears modelled. o {
     skin, hair, hairCap (the cap's own colour or slot), long, curly, moustache, goatee, hat, hatCol, band, slick } */
  function head(kit, c, r, o, bone) {
    var skin = o.skin, hair = o.hair, cap = o.hairCap || hair;
    if (o.model) kit.add(modelPart(o.model, 'head'), null, skin, bone, { face: true, pen: 2 });   /* shaped in Blender: brow, sockets, nose, chin */
    else {
      kit.add(new THREE.SphereGeometry(r, 18, 12), M(c.x, c.y, c.z, 0, 0, 0, 0.84, 1.13, 0.96), skin, bone, { face: true, pen: 2 });
      kit.add(new THREE.SphereGeometry(r * 0.52, 10, 6), M(c.x, c.y - r * 0.52, c.z + r * 0.16, 0, 0, 0, 1.12, 0.82, 1.1), skin, bone, { pen: 2 });   /* the jaw */
      kit.add(new THREE.SphereGeometry(r * 0.13, 8, 6), M(c.x, c.y - r * 0.12, c.z + r * 0.9, 0.35, 0, 0, 0.8, 1.6, 1.0), skin, bone, { pen: 2 });   /* the nose */
    }
    [-1, 1].forEach(function (s) {
      kit.add(new THREE.SphereGeometry(r * 0.21, 6, 4), M(c.x + s * r * 0.87, c.y - r * 0.06, c.z - r * 0.02, 0, s * 0.3, 0, 0.42, 1, 0.72), skin, bone, { pen: 2 });
    });
    /* the hair: a cap tipped back so the brow is clear and the nape covered; slicked, curly or with a fall behind */
    var capG = new THREE.SphereGeometry(r * 1.07, 30, 10, 0, TAU, 0, Math.PI * 0.56), capM = M(c.x, c.y + r * 0.05, c.z - r * 0.04, -0.42, 0, 0, 0.93, o.slick ? 0.98 : 1.06, 1.0);
    kit.add(capG, capM, cap, bone, { pen: 3, deform: o.slick ? null : locks(r * 1.07, 13, 0.035, -0.12) });
    if (o.curly) {
      var cg = new THREE.SphereGeometry(r * 1.13, 20, 10, 0, TAU, 0, Math.PI * 0.62);
      kit.add(cg, M(c.x, c.y + r * 0.08, c.z - r * 0.06, -0.38, 0, 0, 0.98, 1.08, 1.04), o.curly, bone, { pen: 3, deform: function (w) {
        var k = 1 + 0.07 * Math.sin(w.x * 90) * Math.sin(w.y * 85) * Math.sin(w.z * 95 + 1.3); w.multiplyScalar(k);
      } });
    }
    if (o.long) {
      kit.add(new THREE.SphereGeometry(r, 22, 10), M(c.x, c.y - r * 0.5, c.z - r * 0.48, 0.12, 0, 0, 1.0, 1.35, 0.6), o.long, bone, { pen: 3, deform: locks(r, 9, 0.06, -0.55) });
      [-1, 1].forEach(function (s) { kit.add(new THREE.SphereGeometry(r * 0.32, 10, 8), M(c.x + s * r * 0.84, c.y - r * 0.45, c.z - r * 0.12, 0, 0, s * 0.1, 0.6, 2.0, 0.9), o.long, bone, { pen: 3 }); });
      for (var k = 0; k < 5; k++) {   /* a plait down the back, as the drawn girl's */
        kit.add(new THREE.SphereGeometry(r * 0.2, 8, 6), M(c.x + r * 0.08, c.y - r * (1.25 + k * 0.32), c.z - r * (0.62 - k * 0.04), 0.3, 0, (k % 2 ? 0.4 : -0.4), 0.85, 1.2, 0.8), o.long, bone, { pen: 3 });
      }
    }
    if (o.moustache) {   /* waxed, the ends curled up: a showman's */
      [-1, 1].forEach(function (s) {
        var cv = new THREE.CatmullRomCurve3([V(c.x, c.y - r * 0.33, c.z + r * 0.97), V(c.x + s * r * 0.3, c.y - r * 0.4, c.z + r * 0.9),
          V(c.x + s * r * 0.46, c.y - r * 0.34, c.z + r * 0.8), V(c.x + s * r * 0.54, c.y - r * 0.18, c.z + r * 0.74)]);
        kit.add(new THREE.TubeGeometry(cv, 8, r * 0.055, 5, false), null, hair, bone, { pen: 3 });
      });
    }
    if (o.goatee) kit.add(new THREE.ConeGeometry(r * 0.16, r * 0.5, 10), M(c.x, c.y - r * 0.98, c.z + r * 0.6, Math.PI - 0.38, 0, 0), hair, bone, { pen: 3 });
    if (o.hat) {   /* the pointed hat, its crown a little crumpled, its tip bent back, a band round it */
      var hb = c.y + r * 0.6, hc = o.hatCol;
      kit.add(new THREE.CylinderGeometry(r * 1.85, r * 1.9, r * 0.06, 20), M(c.x, hb, c.z - r * 0.05, -0.1, 0, 0), hc, bone, { deform: function (w) { w.y += 0.012 * Math.sin(Math.atan2(w.x, w.z) * 3); } });
      kit.add(new THREE.CylinderGeometry(r * 0.34, r * 1.04, r * 2.1, 14, 3, true), M(c.x, hb + r * 1.05, c.z - r * 0.12, -0.12, 0, 0), hc, bone,
              { deform: function (w) { var a = Math.atan2(w.x, w.z); w.x *= 1 + 0.05 * Math.sin(a * 5 + w.y * 30); w.z *= 1 + 0.05 * Math.sin(a * 5 + w.y * 30); } });
      kit.add(new THREE.CylinderGeometry(0, r * 0.35, r * 1.35, 12, 2, true), M(c.x, hb + r * 2.48, c.z - r * 0.58, -0.66, 0, 0.08), hc, bone);
      if (o.band !== undefined) kit.add(new THREE.CylinderGeometry(r * 0.99, r * 1.05, r * 0.24, 18, 1, true), M(c.x, hb + r * 0.16, c.z - r * 0.06, -0.12, 0, 0), o.band, bone);
    }
  }
  /* the hood, down on the back of the shoulders: a soft fold of the robe, its lining along the rim */
  function hood(kit, y, w, robe, lining, bone, rimless) {
    kit.add(new THREE.SphereGeometry(1, 12, 6, 0, TAU, Math.PI * 0.35, Math.PI * 0.65), M(0, y - w * 0.32, -w * 0.64, 0.25, 0, 0, w * 0.8, w * 0.95, w * 0.42), robe, bone,
            { deform: function (p) { p.x *= 1 + 0.06 * Math.sin(p.y * 9); } });
    if (!rimless) kit.add(new THREE.TorusGeometry(1, 0.1, 5, 14, Math.PI), M(0, y + w * 0.06, -w * 0.52, Math.PI * 0.5 + 0.35, 0, Math.PI, w * 0.78, w * 0.62, w * 0.62), lining, bone);
  }

  /* ---- the standing figure ---- */
  var LOOKS = {
    /* Pickett (settled 71 writes no look; ours, provisional): a showman kept to the drawn figures' muted palette, as
       Design asked of the plum (req 1140): a near-black robe lined in claret, over a dusty mulberry frock coat and an
       old-gold waistcoat, a white collar and claret cravat, charcoal trousers; the waxed moustache and pointed beard */
    pickett: { height: 1.86, robe: 0x2a2421, lining: 0x6e2a2e, coat: 0x5a3a48, waist: 0x8e7440, trousers: 0x37332f, skin: 0xd8ab90,
               hair: 0x2e2018, hat: true, hatCol: 0x2a2421, band: 0x6e2a2e, wand: true, moustache: true, goatee: true, slick: true,
               collar: 0xe6e0d2, cravat: 0x6e2a2e, shoe: 0x17120f,
               face: { iris: '82,62,40', arch: 0.6, browW: 3.4, smile: 0.7, age: 1, lids: 0.25, blush: 0.35, mouthW: 0.9 } },
    pupil: { height: 1.45, robe: 0x23201f, lining: HOUSES.gryffindor, coat: 0x8a8884, waist: 0x8a8884, trousers: 0x6e6c68, skin: 0xe8bfa0,
             hair: 0x5a3a22, hat: false, wand: true, collar: 0xeeeae0, cravat: HOUSES.gryffindor, shoe: 0x17120f,
             face: { smile: 0.6, blush: 0.5 } }
  };
  /* the bones, in the bind pose (metres, at the built height of 1.80; the group scales to opts.height) */
  var B = { root: 0, hips: 1, hem: 2, spine: 3, head: 4, shL: 5, elL: 6, shR: 7, elR: 8, footL: 9, footR: 10 };

  function make(T, opts) {
    THREE = T; opts = opts || {};
    var L = Object.assign({}, LOOKS[opts.look || 'pickett'], opts), child = (opts.look === 'pupil');
    var kit = new Kit();
    var hr = child ? 0.118 : 0.108, neckY = 1.52, hc = V(0, neckY + hr * 1.0, 0.012);
    var robe = L.robe, lining = L.lining, Mo = opts.model || null;   /* Mo: the shapes made in Blender, when given */
    var bodyW = function (y) {
      if (y < 0.5) return [B.hem, 0, 1];
      if (y < 0.85) return [B.hem, B.hips, 1 - (y - 0.5) / 0.35];
      if (y < 1.0) return [B.hips, B.spine, 1 - (y - 0.85) / 0.15];
      return [B.spine, 0, 1];
    };
    /* the legs in their trousers, each carried by its foot below and the hips above, so the walk shows under the robe */
    if (Mo) {   /* the body in one piece: each leg carried by its foot and the hips, the torso as the robe; the coat's skirt */
      kit.add(modelPart(Mo, 'body'), null, function (v) {
        if (v.y < 0.88) return L.trousers;
        if (v.y > 1.47) return L.skin;
        return (Math.abs(Math.atan2(v.x, v.z / 0.7)) < 0.42 && v.y > 0.9 && v.y < 1.45) ? L.waist : L.coat;
      }, function (y, x) {
        var f = x < 0 ? B.footL : B.footR;
        return y < 0.12 ? [f, 0, 1] : y < 0.85 ? [f, B.hips, 1 - (y - 0.12) / 0.73] : bodyW(y); });
      kit.add(modelPart(Mo, 'skirt'), null, L.coat, bodyW);
    }
    [[-1, B.footL], [1, B.footR]].forEach(function (f) {
      if (!Mo) kit.add(between(V(f[0] * 0.085, 0.07, 0.02), V(f[0] * 0.09, 0.92, 0), 0.052, 0.075, 10), null, L.trousers, function (y) {
        return y < 0.12 ? [f[1], 0, 1] : y < 0.85 ? [f[1], B.hips, 1 - (y - 0.12) / 0.73] : [B.hips, 0, 1]; });
      kit.add(new THREE.SphereGeometry(0.05, 8, 5), M(f[0] * 0.085, 0.036, 0.1, 0, 0, 0, 1, 0.72, 2.4), L.shoe, f[1], { deform: function (p) { if (p.y < -0.02) p.y = -0.02; } });
    });
    /* the frock coat beneath (to the knee), the waistcoat at its front with a row of buttons, the collar and cravat */
    var coatProf = [[0.001, 0.5], [0.19, 0.49], [0.18, 0.7], [0.16, 0.9], [0.15, 1.02], [0.165, 1.18], [0.18, 1.3], [0.178, 1.4],
                    [0.15, 1.46], [0.09, 1.5], [0.06, 1.53]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    if (!Mo) kit.add(new THREE.LatheGeometry(coatProf, 20), M(0, 0, 0, 0, 0, 0, 1, 1, 0.7), function (v) {
      var a = Math.abs(Math.atan2(v.x, v.z / 0.7));
      if (a < 0.42 && v.y > 0.9 && v.y < 1.45) return L.waist;
      return L.coat;
    }, bodyW);
    for (var bi = 0; bi < 5; bi++) kit.add(new THREE.SphereGeometry(0.009, 4, 3), M(0, 1.0 + bi * 0.085, 0.112 - Math.abs(bi - 2) * 0.004), 0xb8a070, B.spine);
    if (!Mo) kit.add(new THREE.CylinderGeometry(0.052, 0.058, 0.13, 12), M(0, neckY + 0.03, 0.0), L.skin, B.head, { pen: 2 });
    kit.add(new THREE.CylinderGeometry(hr * 0.52, hr * 0.58, 0.06, 16, 1, true), M(0, neckY, 0.006), L.collar, B.spine);
    [-1, 1].forEach(function (s) { kit.add(new THREE.BoxGeometry(0.035, 0.03, 0.01), M(s * 0.024, neckY - 0.03, 0.06, 0.3, 0, s * 0.5), L.collar, B.spine); });
    if (L.cravat) kit.add(new THREE.SphereGeometry(0.04, 8, 5), M(0, neckY - 0.065, 0.075, 0, 0, 0, 1.15, 1.3, 0.5), L.cravat, B.spine);
    head(kit, hc, hr, { skin: L.skin, hair: L.hair, moustache: L.moustache, goatee: L.goatee, long: L.long, slick: L.slick,
                         hat: L.hat, hatCol: L.hatCol || robe, band: L.band, model: Mo }, B.head);
    /* the robe, open down the front, hung in folds; the fronts turned back on the lining; the lining within */
    var rows = [[0.07, 0.272, 0.36, 1], [0.3, 0.256, 0.34, 0.9], [0.6, 0.228, 0.3, 0.65], [0.9, 0.2, 0.27, 0.35], [1.05, 0.194, 0.26, 0.2],
                [1.2, 0.203, 0.25, 0.08], [1.32, 0.214, 0.26, 0], [1.4, 0.21, 0.3, 0], [1.46, 0.182, 0.42, 0], [1.5, 0.125, 0.6, 0], [1.53, 0.08, 0.8, 0]];
    if (Mo) {   /* draped by Blender's cloth over the body */
      kit.add(modelPart(Mo, 'robe'), null, function (v, u) { return (u < 0.02 || u > 0.98) ? lining : robe; }, bodyW);
      kit.add(modelPart(Mo, 'robe', 0.004), null, lining, bodyW, { pen: 1, inner: true });
    } else {
      kit.add(robeShell(rows, 34, 0.68, 1, false), null, function (v, u) { return (u < 0.035 || u > 0.965) ? lining : robe; }, bodyW);
      kit.add(robeShell(rows, 34, 0.68, 1, true), null, lining, bodyW, { pen: 1, inner: true });
    }
    hood(kit, 1.39, 0.2, robe, lining, B.spine, !!Mo);   /* on the draped robe its lined rim read as a rope */
    /* the arms: the robe's sleeve to the elbow and its bell to the wrist, lined; within, the coat's sleeve, the shirt's
       cuff and the hand; the wand in the right, pointing ahead */
    [[-1, B.shL, B.elL], [1, B.shR, B.elR]].forEach(function (a) {
      var s = a[0], sh = V(s * 0.19, 1.41, 0), el = V(s * 0.215, 1.13, 0.0), wr = V(s * 0.215, 0.87, 0.03), bell = V(s * 0.218, 0.9, 0.028);
      if (Mo) {   /* the coat's sleeve and the robe's, draped, each carried by the shoulder above the elbow and the elbow below */
        var arm = function (y) { return y > 1.18 ? [a[1], 0, 1] : y > 1.08 ? [a[2], a[1], 1 - (y - 1.08) / 0.1] : [a[2], 0, 1]; };
        var side = s < 0 ? 'L' : 'R';
        kit.add(modelPart(Mo, 'arm' + side), null, function (v) { return v.y > 1.33 ? robe : L.coat; }, arm);   /* above the sleeve's cap, the robe's shoulder */
        kit.add(modelPart(Mo, 'sleeve' + side), null, robe, arm);
        kit.add(modelPart(Mo, 'sleeve' + side, 0.004), null, lining, arm, { inner: true });
      } else {
      kit.add(between(sh, el, 0.062, 0.068, 12), null, robe, a[1]);
      kit.add(new THREE.SphereGeometry(0.068, 10, 6), M(el.x, el.y, el.z), robe, a[1]);
      var bg = between(el, bell, 0.068, 0.118, 12, true);
      kit.add(bg, null, robe, a[2], { deform: function (p) { var d = Math.max(0, (1.1 - p.y) / 0.2); p.x += s * 0.01 * d * Math.sin(p.z * 60); } });
      kit.add(flip(between(el, bell, 0.064, 0.112, 12, true)), null, lining, a[2], { inner: true });
      kit.add(between(V(el.x, el.y - 0.05, el.z), V(wr.x, wr.y + 0.01, wr.z), 0.045, 0.04, 10), null, L.coat, a[2]);
      }
      kit.add(new THREE.CylinderGeometry(0.042, 0.042, 0.022, 12, 1, true), M(wr.x, wr.y + 0.005, wr.z), L.collar, a[2]);
      /* the hand: the palm and the fingers together, the thumb forward */
      kit.add(new THREE.SphereGeometry(0.044, 8, 5), M(wr.x, wr.y - 0.055, wr.z + 0.008, 0, 0, s * 0.1, 0.62, 1.25, 0.95), L.skin, a[2], { pen: 2 });
      kit.add(new THREE.SphereGeometry(0.016, 6, 4), M(wr.x - s * 0.006, wr.y - 0.04, wr.z + 0.035, 0.5, 0, 0, 0.8, 1.7, 0.9), L.skin, a[2], { pen: 2 });
      if (s > 0 && L.wand) {
        var w0 = V(wr.x, wr.y - 0.07, wr.z - 0.02), w1 = V(wr.x, wr.y - 0.12, wr.z + 0.33);
        kit.add(between(w0, w1, 0.009, 0.0045, 6), null, function (v) { return v.z < wr.z + 0.06 ? 0x3a2418 : 0x7a5e44; }, a[2], { pen: 0 });
      }
    });

    var geo = kit.geometry(true);
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    drawFace(c.getContext('2d'), 0, 0, 1024, 512, L.face || {});
    var mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: tones(), skinning: true, map: canvasTex(c) });
    mat.onBeforeCompile = ownColour;
    var nightU = nightTone(mat);
    pen(mat, 55, hc);
    mat.customProgramCacheKey = function () { return 'castle-figure'; };
    var inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, skinning: true });
    inkMat.onBeforeCompile = function (sh) { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.0085;'); };

    /* the skeleton */
    var bones = [], pos = [[0, 0, 0], [0, 0.95, 0], [0, -0.35, 0], [0, 0.05, 0], [0, 0.57, 0.01], [-0.19, 0.41, 0], [-0.025, -0.28, 0],
                            [0.19, 0.41, 0], [0.025, -0.28, 0], [-0.085, 0, 0], [0.085, 0, 0]];
    var parent = [-1, 0, 1, 1, 3, 3, 5, 3, 7, 0, 0];
    pos.forEach(function (p, i) { var b = new THREE.Bone(); b.position.fromArray(p); bones.push(b); if (parent[i] >= 0) bones[parent[i]].add(b); });
    var base = bones.map(function (b) { return b.position.clone(); });
    var inkGeo = new THREE.BufferGeometry();   /* the same points, drawn only as far as the linings */
    Object.keys(geo.attributes).forEach(function (k) { inkGeo.setAttribute(k, geo.attributes[k]); });
    inkGeo.setDrawRange(0, kit.outer); inkGeo.boundingSphere = geo.boundingSphere;
    var mesh = new THREE.SkinnedMesh(geo, mat), ink = new THREE.SkinnedMesh(inkGeo, inkMat);
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
    function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; }
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
      var s = Math.sin(TAU * phase), c = Math.cos(TAU * phase), w = walkW;
      /* the idle: a breath, the chin a little high (he knows he is watched), a slow look about */
      bones[B.spine].rotation.x = 0.012 * Math.sin(clock * 1.7);
      bones[B.head].rotation.x = child ? 0.02 : -0.07;
      bones[B.head].rotation.y = 0.16 * Math.sin(clock * 0.37) * (1 - w);
      bones[B.elL].rotation.x = -0.18; bones[B.elR].rotation.x = -0.35;
      /* the walk */
      bones[B.footL].position.z += 0.17 * s * w; bones[B.footL].position.y += 0.035 * Math.max(0, c) * w;
      bones[B.footR].position.z -= 0.17 * s * w; bones[B.footR].position.y += 0.035 * Math.max(0, -c) * w;
      bones[B.hips].position.y += (0.012 * Math.cos(2 * TAU * phase) - 0.008) * w;
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
      light: function (k) { mat.color.copy(day).lerp(lin(CANDLE), 0.15 * k); nightU.value = k; }
    };
  }

  /* ---- the seated class: one geometry, instanced, each pupil's own colours, hair and face per instance ----
     dressed as the drawn stock (student-stock-11-12-seated.png): the robe open over a grey jumper with the house's
     stripe at its V, a white collar and the house tie, grey trousers or skirt, grey socks, black shoes; the robe lined in
     the house's colour. slots: 1 the house, 2 skin, 3 hair, 4 long hair (gone when short), 6 curly hair (gone when not),
     7 the plain cap (gone when curly), 8 trousers (gone for a skirt), 9 skirt and socks (gone for trousers) */
  var CHILD = { eye: 1.22, bold: 2.1, child: 1, mouthW: 0.8 };   /* a child's face: larger eyes, lines bold enough to read across the room */
  var FACES = [
    { smile: 0.6, blush: 0.5 },
    { smile: 0.3, lashes: 1, freckles: 7, blush: 0.6, iris: '70,90,60', down: 1, lids: 0.5 },
    { smile: 0.8, arch: 0.4, iris: '60,40,28' },
    { smile: 0.2, lids: 0.7, lashes: 1, iris: '70,80,110', blush: 0.4, down: 1 },
    { smile: 0.5, browW: 3.8, freckles: 3, iris: '90,64,40' },
    { smile: 0.9, lashes: 1, arch: 0.5, iris: '50,34,22', blush: 0.55 },
    { smile: 0.4, lids: 0.6, iris: '80,96,120', down: 1 },
    { smile: 0.7, lashes: 1, freckles: 11, iris: '96,70,44', blush: 0.6 }
  ].map(function (f) { return Object.assign({}, CHILD, f); });
  function crowd(T, list, Mo) {   /* Mo: the seated pupil's shapes made in Blender (models/pupil.json), when given */
    THREE = T;
    var kit = new Kit(), hr = 0.1, robe = 0x23201f, shoe = 0x17120f, grey = 0x8a8884, dgrey = 0x6c6a66, shirt = 0xeeeae0;
    var TR = { slot: 1 }, SK = { slot: 2 }, HA = { slot: 3 }, LO = { slot: 4 }, CU = { slot: 6 }, CAP = { slot: 7 };
    var TROU = { slot: 8, base: dgrey }, SKIRT = { slot: 9, base: dgrey }, SOCK = { slot: 9, base: 0x9a9894 }, SHIN = { slot: 8, base: dgrey };
    /* the jumper: its V at the front, the house's stripe round the V and at the waist; the shirt and tie in the V */
    var prof = [[0.001, 0.44], [0.16, 0.44], [0.158, 0.54], [0.15, 0.66], [0.155, 0.78], [0.152, 0.86], [0.12, 0.905], [0.06, 0.935]]
      .map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    var jumper = function (v) {
      var a = Math.abs(Math.atan2(v.x, (v.z + 0.02) / 0.7)), vy = 0.93 - a * 0.42;
      if (v.y > vy + 0.02) return shirt;
      if (v.y > vy - 0.012) return TR;
      if (v.y > 0.48 && v.y < 0.5) return TR;
      return grey;
    };
    kit.add(Mo ? modelPart(Mo, 'body') : new THREE.LatheGeometry(prof, 20), Mo ? null : M(0, 0, -0.02, 0, 0, 0, 1, 1, 0.7), jumper, 0);
    kit.add(new THREE.BoxGeometry(0.04, 0.17, 0.012), M(0, 0.8, 0.088, -0.12, 0, 0), TR, 0);   /* the tie */
    kit.add(new THREE.BoxGeometry(0.03, 0.025, 0.02), M(0, 0.895, 0.082, -0.2, 0, 0), TR, 0);
    [-1, 1].forEach(function (s) { kit.add(new THREE.BoxGeometry(0.04, 0.03, 0.008), M(s * 0.03, 0.905, 0.07, 0.35, 0, s * 0.55), shirt, 0); });
    kit.add(Mo ? modelPart(Mo, 'neck') : new THREE.CylinderGeometry(0.045, 0.05, 0.1, 12), Mo ? null : M(0, 0.96, -0.012), SK, 0, { pen: 2 });
    /* the robe, open down the front, hung from the shoulders over the chair's seat, lined in the house's colour */
    if (Mo) {   /* draped by Blender's cloth over the body, the thighs and the seat */
      kit.add(modelPart(Mo, 'robe'), null, function (v, u) { return (u < 0.02 || u > 0.98) ? TR : robe; }, 0);
      kit.add(modelPart(Mo, 'robe', 0.004), null, TR, 0, { pen: 1, inner: true });
    } else {
      var rows = [[0.3, 0.215, 0.95, 1], [0.44, 0.2, 0.9, 0.8], [0.56, 0.172, 0.6, 0.4], [0.7, 0.163, 0.42, 0.15], [0.8, 0.168, 0.36, 0],
                  [0.86, 0.165, 0.38, 0], [0.9, 0.14, 0.46, 0], [0.925, 0.09, 0.7, 0], [0.945, 0.06, 0.9, 0]];
      kit.add(robeShell(rows, 28, 0.7, 1, false), M(0, 0, -0.02), function (v, u) { return (u < 0.04 || u > 0.96) ? TR : robe; }, 0);
      kit.add(robeShell(rows, 28, 0.7, 1, true), M(0, 0, -0.02), TR, 0);
    }
    hood(kit, 0.86, 0.16, robe, TR, 0, !!Mo);
    /* the legs: trousers to the shoe, or the skirt over the knee and grey socks below */
    [-1, 1].forEach(function (s) {
      var hip = V(s * 0.085, 0.49, 0.0), knee = V(s * 0.09, 0.5, 0.36), ankle = V(s * 0.09, 0.08, 0.38);
      kit.add(between(hip, knee, 0.082, 0.066), null, TROU, 0);
      kit.add(between(knee, ankle, 0.056, 0.045), null, SHIN, 0);
      kit.add(between(V(knee.x, knee.y - 0.08, knee.z), ankle, 0.05, 0.043), null, SOCK, 0);
      kit.add(new THREE.SphereGeometry(0.045, 10, 6), M(ankle.x, 0.035, ankle.z + 0.05, 0, 0, 0, 1, 0.72, 2.2), shoe, 0);
      /* the arms on the desk: the robe's sleeve, its lined bell, the jumper's cuff and the hand */
      var sh = V(s * 0.16, 0.86, -0.01), el = V(s * 0.185, 0.69, 0.1), wr = V(s * 0.1, 0.76, 0.36), bell = V(s * 0.115, 0.755, 0.32);
      if (Mo) {   /* the jumper's arm, and the robe's sleeve draped over it, its bell fallen onto the desk */
        var side = s < 0 ? 'L' : 'R';
        kit.add(modelPart(Mo, 'arm' + side), null, function (v) { return v.y > 0.8 ? robe : grey; }, 0);   /* above the sleeve's cap, the robe's shoulder */
        kit.add(modelPart(Mo, 'sleeve' + side), null, robe, 0);
        kit.add(modelPart(Mo, 'sleeve' + side, 0.004), null, 0x141210, 0, { inner: true });
      } else {
      kit.add(between(sh, el, 0.052, 0.058), null, robe, 0);
      kit.add(new THREE.SphereGeometry(0.058, 10, 6), M(el.x, el.y, el.z), robe, 0);
      /* the bell lined dark: a lining in the house's colour, seen end on across the desk, read as a disc (and a rim of it
         as a ring) */
      kit.add(between(el, bell, 0.058, 0.074, 12, true), null, robe, 0);
      kit.add(flip(between(el, bell, 0.055, 0.071, 12, true)), null, 0x141210, 0);
      kit.add(between(el, wr, 0.04, 0.036, 8), null, grey, 0);
      }
      kit.add(new THREE.SphereGeometry(0.038, 10, 6), M(wr.x - s * 0.02, wr.y - 0.004, wr.z + 0.045, 0, s * 0.3, 0, 0.95, 0.5, 1.3), SK, 0, { pen: 2 });
    });
    kit.add(robeShell([[0.36, 0.2, 0.0, 0], [0.47, 0.19, 0.0, 0]], 24, 1.0, 0, false), M(0, 0, 0.12, 0, 0, 0, 1, 1, 1.05), SKIRT, 0, {
      deform: function (p) { p.z = Math.max(p.z, -0.05); } });   /* the skirt, its pleats left to the pen */
    head(kit, V(0, 1.06, 0.02), hr, { skin: SK, hair: HA, hairCap: CAP, long: LO, curly: CU, model: Mo }, 0);
    var geo = kit.geometry(false), n = list.length;
    var aT = new Float32Array(n * 3), aS = new Float32Array(n * 3), aH = new Float32Array(n * 3), aF = new Float32Array(n * 4);
    list.forEach(function (p, i) {
      lin(p.trim !== undefined ? p.trim : HOUSES.gryffindor).toArray(aT, i * 3);
      lin(p.skin !== undefined ? p.skin : 0xe8bfa0).toArray(aS, i * 3);
      lin(p.hair !== undefined ? p.hair : 0x5a3a22).toArray(aH, i * 3);
      aF[i * 4] = p.long ? 1 : 0; aF[i * 4 + 1] = p.curly ? 1 : 0; aF[i * 4 + 2] = p.girl ? 1 : 0; aF[i * 4 + 3] = (p.face || 0) % 8;
    });
    geo.setAttribute('iTrim', new THREE.InstancedBufferAttribute(aT, 3));
    geo.setAttribute('iSkin', new THREE.InstancedBufferAttribute(aS, 3));
    geo.setAttribute('iHair', new THREE.InstancedBufferAttribute(aH, 3));
    geo.setAttribute('iFlags', new THREE.InstancedBufferAttribute(aF, 4));
    var DECL = 'attribute float aSlot;\nattribute vec3 iTrim;\nattribute vec3 iSkin;\nattribute vec3 iHair;\nattribute vec4 iFlags;\n';
    /* a part a pupil lacks folds to one point inside the head, so it draws nothing */
    var GONE = 'if ((aSlot > 3.5 && aSlot < 4.5 && iFlags.x < 0.5) || (aSlot > 5.5 && aSlot < 6.5 && iFlags.y < 0.5) || (aSlot > 6.5 && aSlot < 7.5 && iFlags.y > 0.5)' +
               ' || (aSlot > 7.5 && aSlot < 8.5 && iFlags.z > 0.5) || (aSlot > 8.5 && iFlags.z < 0.5)) transformed = vec3(0.0, 1.06, 0.0);\n';
    var atlas = document.createElement('canvas'); atlas.width = 2048; atlas.height = 512;
    var ax = atlas.getContext('2d');
    FACES.forEach(function (f, i) { drawFace(ax, (i % 4) * 512, Math.floor(i / 4) * 256, 512, 256, f); });
    var mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: tones(), map: canvasTex(atlas) });
    mat.onBeforeCompile = function (sh) {
      sh.vertexShader = DECL + sh.vertexShader
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + GONE)
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvUv = vec2((vUv.x + mod(iFlags.w, 4.0)) / 4.0, (vUv.y + 1.0 - floor(iFlags.w / 4.0)) / 2.0);')
        .replace('#include <color_vertex>', '#include <color_vertex>\nvColor.xyz *= aSlot < 0.5 ? vec3(1.0) : aSlot < 1.5 ? iTrim : aSlot < 2.5 ? iSkin : (aSlot < 4.5 || (aSlot > 5.5 && aSlot < 7.5)) ? iHair : vec3(1.0);');
      ownColour(sh);
    };
    var nightU = nightTone(mat);
    pen(mat, 70, V(0, 1.06, 0.02));
    mat.customProgramCacheKey = function () { return 'castle-crowd'; };
    var inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
    inkMat.onBeforeCompile = function (sh) {
      sh.vertexShader = DECL + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.0068;\n' + GONE);
    };
    inkMat.customProgramCacheKey = function () { return 'castle-crowd-ink'; };
    var inkGeo = new THREE.BufferGeometry();   /* the same points and instance colours, drawn only as far as the linings */
    Object.keys(geo.attributes).forEach(function (k) { inkGeo.setAttribute(k, geo.attributes[k]); });
    inkGeo.setDrawRange(0, kit.outer); inkGeo.boundingSphere = geo.boundingSphere;
    var mesh = new THREE.InstancedMesh(geo, mat, n), ink = new THREE.InstancedMesh(inkGeo, inkMat, n);
    ink.instanceMatrix = mesh.instanceMatrix;
    mesh.frustumCulled = ink.frustumCulled = false;
    var group = new THREE.Group(); group.add(mesh); group.add(ink); group.name = 'figure-crowd';
    var m = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), sc = V(1, 1, 1), at = V(0, 0, 0);
    function place(t) {
      list.forEach(function (p, i) {
        var k = i * 1.731, s = p.scale || 1;
        e.set(0.015 * Math.sin(t * 0.9 + k) + 0.03, (p.rot || 0) + 0.06 * Math.sin(t * 0.21 + k * 2.3), 0.01 * Math.sin(t * 0.5 + k));
        qq.setFromEuler(e); sc.set(s, s * (1 + 0.006 * Math.sin(t * 1.6 + k)), s); at.fromArray(p.at);
        m.compose(at, qq, sc); mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    place(0);
    var day = mat.color.clone();
    return { group: group, mesh: mesh, ink: ink, update: place,
             light: function (k) { mat.color.copy(day).lerp(lin(CANDLE), 0.15 * k); nightU.value = k; } };
  }

  window.CastleFigure = { make: make, crowd: crowd, HOUSES: HOUSES };
})();
