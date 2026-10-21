/* stone-face.js: the castle's stone drawn in code (Design; Godric's 1 on design-bright-rooms-1021, 11.30 am,
   21 October 2026). The walls were flat colour, so a pale stone lit at noon read as paint at any value; the kit lays
   each wall's dressing on its own colour: courses and joints, rubble in lime, laid flags, a brushed limewash. Nothing
   generated; the tone stays tones.js's (the face's grey averages about 0.93, so the colour picked is kept).

   The interface, for the shell (window.CastleStoneFace):
     CastleStoneFace.FACED            the stones the kit draws: late-pale first (the bright rooms); others as Godric adds
     CastleStoneFace.kind(dress)      a dressing or surface to its face: 'coursed', 'ashlar', 'rubble', 'limewash',
                                      'flags' (a stone floor), else null (panelled, boards, marble: left as they are)
     CastleStoneFace.dress(THREE, m, kind)
                                      lays the face on a MeshStandardMaterial once (m.userData.faced), and returns it.
                                      The face is mapped in world space, 4 m to a repeat, from each surface's facing
                                      (a wall's courses level whatever its geometry's UVs), so a cached material can be
                                      shared by every wall of that tone.
   In the shell: after paintMat in wallMat, `if (CastleStoneFace.FACED[st]) CastleStoneFace.dress(THREE, mat,
   CastleStoneFace.kind(row.dress))`, and in floorMat for flags the same with 'flags'. The probe:
   page/design/stone-face-live.html. */
(function () {
  'use strict';
  var FACED = { 'late-pale': true };
  var KINDS = { coursed: 'coursed', ashlar: 'ashlar', rubble: 'rubble', limewash: 'limewash', flags: 'flags' };
  var maps = {};

  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  /* each canvas is 4 m by 4 m of wall or floor at 1024 px (256 px a metre); the joints recessed, so a shade, never a
     pale line between tiles */
  function face(THREE, kind) {
    var N = 1024, px = N / 4, cv = document.createElement('canvas'); cv.width = cv.height = N;
    var g = cv.getContext('2d'), r = rnd(kind.length * 7919 + 11);
    function grey(v) { v = Math.round(Math.max(0, Math.min(255, v))); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
    function blots(n, r0, r1, lo, hi, a) {   /* soft weathering, larger than a stone, so the repeat does not show */
      for (var i = 0; i < n; i++) {
        var x = r() * N, y = r() * N, rad = r0 + r() * (r1 - r0), v = Math.round(lo + r() * (hi - lo));
        var gr = g.createRadialGradient(x, y, 0, x, y, rad), c = v + ',' + v + ',' + v;
        gr.addColorStop(0, 'rgba(' + c + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + c + ',0)');
        g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
      }
    }
    function speckle(a) {
      var d = g.getImageData(0, 0, N, N), p = d.data;
      for (var i = 0; i < p.length; i += 4) { var e = (r() - 0.5) * a; p[i] += e; p[i + 1] += e; p[i + 2] += e; }
      g.putImageData(d, 0, 0);
    }
    function stone(x0, y0, w, h, round, v) {   /* one stone, its corners eased by `round`, lit from above */
      var k = Math.min(w, h) * round;
      g.beginPath(); g.moveTo(x0 + k, y0); g.lineTo(x0 + w - k, y0); g.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + k);
      g.lineTo(x0 + w, y0 + h - k); g.quadraticCurveTo(x0 + w, y0 + h, x0 + w - k, y0 + h); g.lineTo(x0 + k, y0 + h);
      g.quadraticCurveTo(x0, y0 + h, x0, y0 + h - k); g.lineTo(x0, y0 + k); g.quadraticCurveTo(x0, y0, x0 + k, y0); g.closePath();
      var gr = g.createLinearGradient(0, y0, 0, y0 + h);
      gr.addColorStop(0, grey(v + 8)); gr.addColorStop(0.5, grey(v)); gr.addColorStop(1, grey(v - 10));
      g.fillStyle = gr; g.fill();
    }
    if (kind === 'limewash') {
      g.fillStyle = grey(240); g.fillRect(0, 0, N, N);
      blots(500, 30, 140, 222, 252, 0.3);
      g.strokeStyle = 'rgba(150,150,150,0.10)'; g.lineWidth = 3;   /* the courses under the wash, just showing */
      for (var c = 0; c * 0.3 < 4; c++) { g.beginPath(); g.moveTo(0, c * 0.3 * px); g.lineTo(N, c * 0.3 * px); g.stroke(); }
      speckle(5);
    } else {
      var rubble = kind === 'rubble', flags = kind === 'flags';
      var joint = rubble ? 0.025 : flags ? 0.012 : kind === 'ashlar' ? 0.006 : 0.012;
      g.fillStyle = grey(rubble ? 168 : 180); g.fillRect(0, 0, N, N);   /* the joint, in shade */
      var y = 0;
      while (y < 4) {
        var h = rubble ? 0.16 + r() * 0.2 : flags ? 0.6 : kind === 'ashlar' ? 0.4 : 0.3, x = -(r() * 0.6);
        while (x < 4) {
          var w = rubble ? 0.25 + r() * 0.45 : flags ? 0.6 + Math.floor(r() * 3) * 0.15 : kind === 'ashlar' ? 0.8 : 0.45 + r() * 0.2;
          var v = rubble ? 222 + r() * 30 : 232 + r() * 20, j = joint * px / 2;
          if (rubble) {   /* a rubble stone sits a little up or down in its course, never quite square */
            var dy = (r() - 0.5) * 0.04 * px, sh = h * px - 2 * j - r() * 0.05 * px;
            stone(x * px + j, y * px + j + dy, w * px - 2 * j, sh, 0.25 + r() * 0.25, v);
          } else stone(x * px + j, y * px + j, w * px - 2 * j, h * px - 2 * j, flags ? 0.03 : 0.04, v);
          x += w;
        }
        y += h;
      }
      blots(160, 60, 220, 200, 255, 0.18);
      speckle(rubble ? 20 : 12);
    }
    var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  }

  function dress(THREE, m, kind) {
    if (!m || !kind || !KINDS[kind] || (m.userData && m.userData.faced)) return m;
    var tex = maps[kind] || (maps[kind] = face(THREE, kind));
    m.userData.faced = kind;
    m.onBeforeCompile = function (sh) {
      sh.uniforms.faceMap = { value: tex };
      sh.vertexShader = 'varying vec3 vFaceP;\nvarying vec3 vFaceN;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nvFaceP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvFaceN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = 'uniform sampler2D faceMap;\nvarying vec3 vFaceP;\nvarying vec3 vFaceN;\n' + sh.fragmentShader.replace('#include <color_fragment>',
        '#include <color_fragment>\nvec3 fn = abs(normalize(vFaceN));\nvec2 fuv = fn.x > fn.z ? vFaceP.zy : vFaceP.xy;\nif (fn.y > max(fn.x, fn.z)) fuv = vFaceP.xz;\n' +
        'diffuseColor.rgb *= pow(texture2D(faceMap, fuv * 0.25).rgb, vec3(2.2));');
    };
    m.needsUpdate = true;
    return m;
  }

  window.CastleStoneFace = { version: 1, FACED: FACED, kind: function (d) { return KINDS[d] || null; }, dress: dress, maps: maps };
})();
