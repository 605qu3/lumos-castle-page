/* The castle's one hatching (req 3407, Godric, 9 November 2026). Every 3D figure or object takes it through
   CastleHatch.apply(material); nothing is hand-tuned per figure. Off unless the link carries ?hatch=1.
   What it does: on a MeshToonMaterial (three r128, onBeforeCompile) it draws short, sparse ink strokes, only where the
   toon ramp has fallen to its darkest step, like the pen-and-wash cards. The strokes are fixed to the surface (the
   model's own rest-pose position, before skinning), so they ride the cloth when the figure moves and do not crawl when
   the camera turns. Not screen-space, no noise texture, nothing sampled.
   Knobs, for tests only: &hatchf=strokes per metre (default 30), &hatcht=the fold measure (0..1) above which strokes
   appear (default 0.38), &hatchl=floor of cloth lightness, linear (default 0.10, a charcoal wash, never black), &hatchc=curvature per metre that counts as a full fold (default 60), &hatchv=1 shows the measure as grey for tests, &hatchd=stroke density 0..1 (default 0.5), &hatcha=angle in degrees (default 40). */
(function () {
  var Q = new URLSearchParams(location.search);
  var ON = Q.get('hatch') === '1';
  var F = +(Q.get('hatchf') || 30), T = +(Q.get('hatcht') || 0.38), D = +(Q.get('hatchd') || 0.5),
      A = +(Q.get('hatcha') || 40) * Math.PI / 180,
      L = +(Q.get('hatchl') || 0.10), C = +(Q.get('hatchc') || 60), V = +(Q.get('hatchv') || 0);
  /* &hatchm=tam (req 3407, route 1, the tonal-art-map way; Praun et al. 2001): long lines running down the cloth, laid
     on the surface (rest pose; across = the angle round the figure's upright axis times hatchr metres, along = height,
     the field a hanging cloth gives; a baked direction attribute replaces it per figure later). Lines are nested by
     tone: each line has its own level and appears once the light falls below it, so darker means more lines, and its
     weight swells with the dark, so a line fades out across the ramp's step edge instead of stopping at it. Lines
     break into tapered runs. Width is held in screen pixels; where lines would crowd under hatchp pixels apart (at
     the hearth) every other one drops, nested again, so the far view keeps a few marks, never a grey mesh.
     Knobs: &hatchs=line spacing in metres (default 0.012), &hatchr=radius for the across measure (0.36),
     &hatchw=peak width px (1.6), &hatchp=minimum on-screen spacing px (5), &hatchk=half-lambert value where lines
     begin (0.45). */
  var M = Q.get('hatchm') || '', SP = +(Q.get('hatchs') || 0.012), RR = +(Q.get('hatchr') || 0.36),
      WP = +(Q.get('hatchw') || 1.6), PX = +(Q.get('hatchp') || 5), K0 = +(Q.get('hatchk') || 0.45);
  var TAM = '{ float hl = dot(normalize(normal), directionalLights[0].direction) * 0.5 + 0.5;\n' +
    '  float dk = clamp((hK0 - hl) / 0.30, 0.0, 1.0);\n' +
    '  float acr = atan(vHP.x, vHP.z) * hRR, alg = vHP.y;\n' +
    '  float fa = max(fwidth(acr), 1e-6), fl = max(fwidth(alg), 1e-6);\n' +
    '  float x = acr / hSP, i = floor(x), fx = fract(x);\n' +
    '  float spx = hSP / fa;\n' +
    '  float keep = step(hHash(i * 3.17 + 1.0), clamp(spx / hPX, 0.15, 1.0));\n' +
    '  float lev = hHash(i + 11.0);\n' +
    '  float pres = smoothstep(lev * 0.85, lev * 0.85 + 0.15, dk);\n' +
    '  float segL = 0.10 + 0.20 * hHash(i + 23.0), ph = hHash(i + 37.0) * segL;\n' +
    '  float st = (alg + ph) / segL, sid = floor(st), sf = fract(st);\n' +
    '  float gap = 0.06 + 0.10 * hHash(i * 7.0 + sid);\n' +
    '  float seg = step(gap, sf);\n' +
    '  float tt = clamp((sf - gap) / (1.0 - gap), 0.0, 1.0);\n' +
    '  float taper = tt < 0.33 ? tt / 0.33 : (1.0 - tt) / 0.67;\n' +
    '  float w = hWP * taper * (0.55 + 0.45 * dk) * pres;\n' +
    '  float dpx = abs(fx - 0.5) * hSP / fa;\n' +
    '  float ink = (1.0 - smoothstep(w * 0.5 - 0.5, w * 0.5 + 0.5, dpx)) * step(0.05, w) * seg * keep;\n' +
    '  gl_FragColor.rgb = mix(gl_FragColor.rgb, hInk, 0.85 * ink);\n' +
    '  if (hV > 0.5) gl_FragColor.rgb = vec3(dk); }\n';
  function apply(mat, ink) {
    if (!ON || !mat || mat.userData.hatched) return mat;
    mat.userData.hatched = true;
    var prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function (sh, r) {
      if (prev) prev.call(mat, sh, r);
      sh.uniforms.hF = { value: F }; sh.uniforms.hT = { value: T }; sh.uniforms.hD = { value: D };
      sh.uniforms.hDir = { value: [Math.cos(A), Math.sin(A)] };
      sh.uniforms.hInk = { value: ink || [0.10, 0.08, 0.07] };
      sh.uniforms.hF = { value: F }; sh.uniforms.hT = { value: T }; sh.uniforms.hD = { value: D };
      sh.uniforms.hDir = { value: [Math.cos(A), Math.sin(A)] };
      sh.uniforms.hInk = { value: ink || [0.10, 0.08, 0.07] };
      sh.uniforms.hL = { value: L }; sh.uniforms.hC = { value: C }; sh.uniforms.hV = { value: V };
      sh.uniforms.hSP = { value: SP }; sh.uniforms.hRR = { value: RR }; sh.uniforms.hWP = { value: WP };
      sh.uniforms.hPX = { value: PX }; sh.uniforms.hK0 = { value: K0 };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vHP; varying vec3 vHN;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvHP = position; vHN = normal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>',
        '#include <common>\nvarying vec3 vHP; varying vec3 vHN; uniform float hF, hT, hD, hL, hC, hV, hSP, hRR, hWP, hPX, hK0; uniform vec2 hDir; uniform vec3 hInk;\n' +
        'float hHash(float n) { return fract(sin(n * 127.1) * 43758.5453); }')
        .replace('#include <map_fragment>', '#include <map_fragment>\n' +
          'float hAl = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));\n' +
          'diffuseColor.rgb += max(hL - hAl, 0.0) * vec3(0.88, 0.95, 1.10);')
        .replace('#include <dithering_fragment>', (M === 'tam' ? TAM :
          '{ vec3 dn = fwidth(vHN), dp = fwidth(vHP);\n' +
          '  float curv = clamp(length(dn) / max(length(dp), 0.00001) / hC, 0.0, 1.0);\n' +
          '  float under = clamp(0.35 - vHN.y, 0.0, 1.0);\n' +
          '  float form = clamp(curv * 0.45 + under * 1.1, 0.0, 1.0);\n' +
          '  float dark = smoothstep(hT, hT + 0.12, form) * (1.0 - 0.9 * smoothstep(0.12, 0.35, hAl));\n' +
          '  float u = (vHP.x * hDir.x + vHP.y * hDir.y) * hF, v = (vHP.y * hDir.x - vHP.x * hDir.y) * hF * 0.35 + vHP.z * hF * 0.5;\n' +
          '  float id = floor(u), fu = fract(u);\n' +
          '  float on = step(1.0 - hD * (0.6 + form), hHash(id + 7.0 * floor(v * 0.5 + hHash(id) * 3.0)));\n' +
          '  float line = smoothstep(0.0, 0.18, fu) * (1.0 - smoothstep(0.30, 0.50, fu));\n' +
          '  float dash = smoothstep(0.0, 0.15, fract(v * 0.5 + hHash(id) * 3.0)) * (1.0 - smoothstep(0.55, 0.75, fract(v * 0.5 + hHash(id) * 3.0)));\n' +
          '  gl_FragColor.rgb = mix(gl_FragColor.rgb, hInk, 0.8 * dark * on * line * dash);\n' +
          '  if (hV > 0.5) gl_FragColor.rgb = vec3(form); }\n') +
          '#include <dithering_fragment>');
    };
    mat.customProgramCacheKey = function () { return 'hatch' + M + F + T + D + A + L + C + V + SP + RR + WP + PX + K0; };
    mat.needsUpdate = true;
    return mat;
  }
  window.CastleHatch = { on: ON, apply: apply };
})();
