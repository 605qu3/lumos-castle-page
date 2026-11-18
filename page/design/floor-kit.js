/* floor-kit.js: req 1911, Design's floor options, procedural and spend-free. A probe, not a page file: shot through
   shoot-room's --eval on page/shell.html, it swaps every mesh named <place>-floor for a world-space textured material
   (the way page/design/stone-face.js dresses a wall), so the sheet shows each floor in a real shell room at the iPad's view.
   FloorKit.apply(kind) dresses the room on screen; FloorKit.kinds lists them. Each texture repeats over `rep` metres. */
(function () {
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function rgb(r, g, b) { return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function grain(g, N, r, n, a) {
    var d = g.getImageData(0, 0, N, N), p = d.data;
    for (var i = 0; i < p.length; i += 4) { var v = (r() - 0.5) * n; p[i] += v; p[i + 1] += v; p[i + 2] += v; }
    g.putImageData(d, 0, 0);
  }
  function blots(g, N, r, n, r0, r1, dark) {
    for (var i = 0; i < n; i++) {
      var x = r() * N, y = r() * N, rad = r0 + r() * (r1 - r0), al = 0.05 + r() * 0.08;
      /* v2 (Masonry, 17 November 2026): drawn again across each edge it crosses, so the repeat shows no straight shade step */
      for (var ox = -N; ox <= N; ox += N) for (var oy = -N; oy <= N; oy += N) {
        if (x + ox + rad < 0 || x + ox - rad > N || y + oy + rad < 0 || y + oy - rad > N) continue;
        var gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
        gr.addColorStop(0, 'rgba(' + (dark ? '0,0,0' : '255,255,255') + ',' + al + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
      }
    }
  }
  function plank(g, x, y, w, h, c, r, alongX) {   /* one board with its grain, lit a touch from above */
    g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x, y, w, h);
    for (var i = 0; i < (alongX ? h : w) / 2.2; i++) {
      var o = r() * (alongX ? h : w), dk = r() < 0.5, a = 0.05 + r() * 0.09;
      g.fillStyle = 'rgba(' + (dk ? '40,22,8' : '255,235,200') + ',' + a + ')';
      if (alongX) g.fillRect(x, y + o, w, 1 + r()); else g.fillRect(x + o, y, 1 + r(), h);
    }
  }
  /* v2 (Masonry): a vein that runs past the canvas edge is drawn again from the far side, so it carries across the repeat. The
     path is built after each shift (a canvas path is fixed in place once built, so shifting before stroke moves nothing) */
  function wrapStroke(g, N, build) { for (var ox = -N; ox <= N; ox += N) for (var oy = -N; oy <= N; oy += N) { g.save(); g.translate(ox, oy); g.beginPath(); build(); g.stroke(); g.restore(); } }
  /* one honed piece (Masonry, 17 November 2026): cloud in the stone and a few long soft veins, each a broad faint wash with a
     narrower one in it, wrapped across the edges; no joint, no hard line */
  function honed(g, N, r, base, vein) {
    g.fillStyle = rgb(base[0], base[1], base[2]); g.fillRect(0, 0, N, N);
    g.globalAlpha = 0.25; blots(g, N, r, 24, 120, 320, true); g.globalAlpha = 0.6; blots(g, N, r, 30, 80, 260, false); g.globalAlpha = 1;
    for (var v = 0; v < 5; v++) {
      var x = r() * N, y = r() * N, a = r() * Math.PI, pts = [[x, y]];
      for (var k = 0; k < 6; k++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 120; y += Math.sin(a) * 120; pts.push([x, y]); }
      [[22 + r() * 16, 0.05], [7 + r() * 5, 0.05]].forEach(function (st) {
        g.strokeStyle = 'rgba(' + vein[0] + ',' + vein[1] + ',' + vein[2] + ',' + st[1] + ')'; g.lineWidth = st[0]; g.lineCap = 'round'; g.lineJoin = 'round';
        wrapStroke(g, N, function () {
          g.moveTo(pts[0][0], pts[0][1]);
          for (var q = 1; q < pts.length - 1; q++) g.quadraticCurveTo(pts[q][0], pts[q][1], (pts[q][0] + pts[q + 1][0]) / 2, (pts[q][1] + pts[q + 1][1]) / 2);
        });
      });
    }
    grain(g, N, r, 5);
  }
  function slab(g, N, r, base, vein, va) {   /* four slabs a side; each its own tint, long veins that wander, a sheen, a pale joint */
    var n = 2, s = N / n;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var t = (r() - 0.5) * 14, c = [base[0] + t, base[1] + t, base[2] + t];
      g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x * s, y * s, s, s);
      var sh = g.createLinearGradient(x * s, y * s, x * s + s, y * s + s); sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.05)');
      g.fillStyle = sh; g.fillRect(x * s, y * s, s, s);
      for (var v = 0; v < 5; v++) {
        g.strokeStyle = 'rgba(' + vein[0] + ',' + vein[1] + ',' + vein[2] + ',' + (va * (0.4 + r() * 0.8)).toFixed(2) + ')'; g.lineWidth = 0.8 + r() * 2.2; g.beginPath();
        var px = x * s + r() * s, py = y * s + r() * s; g.moveTo(px, py);
        for (var k = 0; k < 3; k++) { px += (r() - 0.35) * 220; py += (r() - 0.5) * 220; g.bezierCurveTo(px - 60 + r() * 40, py + r() * 80 - 40, px + r() * 80 - 40, py + r() * 80 - 40, px, py); }
        g.stroke(); }
      for (var f = 0; f < 3; f++) { g.strokeStyle = 'rgba(' + vein[0] + ',' + vein[1] + ',' + vein[2] + ',0.10)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x * s + r() * s, y * s + r() * s); g.lineTo(x * s + r() * s, y * s + r() * s); g.stroke(); } }
    g.fillStyle = 'rgba(150,150,148,0.6)'; for (var q = 0; q <= n; q++) { g.fillRect(q * s - 1, 0, 2, N); g.fillRect(0, q * s - 1, N, 2); }
    grain(g, N, r, 6); }
  var KINDS = {
    /* the flags as the shell lays them now, but worn: big irregular stones, soft edges, a dark joint */
    flags: { rep: 4, draw: function (g, N, r) {
      g.fillStyle = rgb(70, 66, 62); g.fillRect(0, 0, N, N); var px = N / 4, y = 0;
      /* v2 (Masonry): the rows fitted to fill the 4 m exactly and each row closed on itself, a flag across the edge drawn on
         both sides, so the repeat cuts no flag in half and no row out of step */
      var hs = [], hsum = 0; while (hsum < 4) { var h0 = 0.55 + r() * 0.3; hs.push(h0); hsum += h0; }
      if (hs.length > 1 && hsum - 4 > hs[hs.length - 1] / 2) hsum -= hs.pop();
      hs.forEach(function (h0) {
        var h = h0 * 4 / hsum, x0 = -r() * 0.6, x = x0, row = [];
        while (x < x0 + 4 - 1e-9) { var w = 0.6 + r() * 0.5; row.push([x, w]); x += w; }
        var over = x - (x0 + 4), last = row[row.length - 1];
        if (row.length > 1 && over > last[1] / 2) { row.pop(); row[row.length - 1][1] += last[1] - over; } else last[1] -= over;
        row.forEach(function (sw) {
          var v = 118 + r() * 34, j = 0.014 * px, c = mix([v, v - 2, v - 6], [v - 14, v - 16, v - 18], r());
          g.fillStyle = rgb(c[0], c[1], c[2]);
          for (var ox = -N; ox <= N; ox += N) {
            var rx = sw[0] * px + j + ox, ry = y * px + j, rw = sw[1] * px - 2 * j, rh = h * px - 2 * j, k = 0.05 * Math.min(rw, rh);
            if (rx > N || rx + rw < 0) continue;
            g.beginPath(); g.moveTo(rx + k, ry); g.arcTo(rx + rw, ry, rx + rw, ry + rh, k); g.arcTo(rx + rw, ry + rh, rx, ry + rh, k); g.arcTo(rx, ry + rh, rx, ry, k); g.arcTo(rx, ry, rx + rw, ry, k); g.fill();
          }
        });
        y += h;
      });
      blots(g, N, r, 90, 40, 190, true); blots(g, N, r, 50, 30, 120, false); grain(g, N, r, 16); } },
    /* granite setts, small cobbled blocks laid in staggered courses */
    setts: { rep: 1.6, draw: function (g, N, r) {
      g.fillStyle = rgb(58, 55, 52); g.fillRect(0, 0, N, N); var rows = 8, rh = N / rows, y;
      for (y = 0; y < rows; y++) { var cols = 5, cw = N / cols, off = (y % 2) * cw / 2;
        for (var x = -1; x <= cols; x++) { var v = 96 + r() * 44, c = mix([v, v - 3, v - 8], [v - 6, v - 10, v - 18], r()), j = 3;
          g.fillStyle = rgb(c[0], c[1], c[2]); var rx = x * cw + off + j, ry = y * rh + j, rw = cw - 2 * j - r() * 6, rhh = rh - 2 * j - r() * 5, k = 9 + r() * 6;
          g.beginPath(); g.moveTo(rx + k, ry); g.arcTo(rx + rw, ry, rx + rw, ry + rhh, k); g.arcTo(rx + rw, ry + rhh, rx, ry + rhh, k); g.arcTo(rx, ry + rhh, rx, ry, k); g.arcTo(rx, ry, rx + rw, ry, k); g.fill(); } }
      blots(g, N, r, 40, 30, 120, true); grain(g, N, r, 22); } },
    /* quarry tile, square terracotta with a little variation and a pale grout */
    quarry: { rep: 1.2, draw: function (g, N, r) {
      g.fillStyle = rgb(150, 138, 120); g.fillRect(0, 0, N, N); var n = 8, s = N / n;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var t = r(), c = mix([156, 86, 60], [128, 64, 44], t); if (r() < 0.12) c = mix(c, [176, 120, 80], 0.6);
        g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x * s + 3, y * s + 3, s - 6, s - 6);
        var gr = g.createLinearGradient(0, y * s, 0, y * s + s); gr.addColorStop(0, 'rgba(255,230,200,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0.10)'); g.fillStyle = gr; g.fillRect(x * s + 3, y * s + 3, s - 6, s - 6); }
      blots(g, N, r, 50, 30, 140, true); grain(g, N, r, 18); } },
    /* encaustic tile, the Victorian geometric floor: cream, oxblood, black and ochre, a diamond-in-square on each tile */
    encaustic: { rep: 1.5, draw: function (g, N, r) {
      var n = 6, s = N / n, C = [[226, 210, 170], [122, 34, 30], [34, 30, 30], [186, 140, 52]];
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var a = (x + y) % 2, x0 = x * s, y0 = y * s, c = a ? C[0] : C[1], d = a ? C[1] : C[0];
        g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x0, y0, s, s);
        g.fillStyle = rgb(C[2][0], C[2][1], C[2][2]); g.beginPath(); g.moveTo(x0 + s / 2, y0 + s * 0.08); g.lineTo(x0 + s * 0.92, y0 + s / 2); g.lineTo(x0 + s / 2, y0 + s * 0.92); g.lineTo(x0 + s * 0.08, y0 + s / 2); g.fill();
        g.fillStyle = rgb(d[0], d[1], d[2]); g.beginPath(); g.moveTo(x0 + s / 2, y0 + s * 0.22); g.lineTo(x0 + s * 0.78, y0 + s / 2); g.lineTo(x0 + s / 2, y0 + s * 0.78); g.lineTo(x0 + s * 0.22, y0 + s / 2); g.fill();
        g.fillStyle = rgb(C[3][0], C[3][1], C[3][2]); g.fillRect(x0 + s * 0.44, y0 + s * 0.44, s * 0.12, s * 0.12);
        g.strokeStyle = 'rgba(40,34,28,0.7)'; g.lineWidth = 2; g.strokeRect(x0 + 1, y0 + 1, s - 2, s - 2); }
      blots(g, N, r, 30, 30, 120, true); grain(g, N, r, 14); } },
    /* deal boards, scrubbed pale pine, wide and long, nail heads at the joists */
    deal: { rep: 1.8, draw: function (g, N, r) {
      g.fillStyle = rgb(120, 98, 70); g.fillRect(0, 0, N, N); var bw = N / 8, y;
      for (y = 0; y < 8; y++) { var x = -r() * N * 0.5;
        while (x < N) { var len = N * (0.5 + r() * 0.5), v = r(), c = mix([204, 176, 130], [180, 148, 104], v);
          plank(g, x + 2, y * bw + 2, len - 4, bw - 4, c, r, true);
          g.fillStyle = 'rgba(60,40,24,0.6)'; [0.25, 0.75].forEach(function (f) { g.beginPath(); g.arc(x + len * f, y * bw + bw * 0.5, 2, 0, 7); g.fill(); });
          x += len; } }
      blots(g, N, r, 70, 40, 160, true); grain(g, N, r, 14); } },
    /* oak boards, narrower and darker, waxed; the ordinary lived-in floor */
    oak: { rep: 1.8, draw: function (g, N, r) {
      g.fillStyle = rgb(40, 24, 12); g.fillRect(0, 0, N, N); var bw = N / 12, y;
      for (y = 0; y < 12; y++) { var x = -r() * N * 0.6;
        while (x < N) { var len = N * (0.45 + r() * 0.55), c = mix([104, 74, 46], [78, 54, 34], r());
          plank(g, x + 1.5, y * bw + 1.5, len - 3, bw - 3, c, r, true); x += len; } }
      blots(g, N, r, 60, 40, 160, true); blots(g, N, r, 30, 50, 150, false); grain(g, N, r, 12); } },
    /* parquet, blocks of three slats laid across and then along: the Georgian and Victorian gentleman's floor */
    parquet: { rep: 1.2, draw: function (g, N, r) {
      g.fillStyle = rgb(36, 22, 10); g.fillRect(0, 0, N, N); var n = 4, s = N / n, sl = s / 3;
      for (var by = 0; by < n; by++) for (var bx = 0; bx < n; bx++) { var horiz = (bx + by) % 2 === 0;
        for (var k = 0; k < 3; k++) { var c = mix([124, 84, 50], [94, 62, 38], r());
          if (horiz) plank(g, bx * s + 1.5, by * s + k * sl + 1.5, s - 3, sl - 3, c, r, true); else plank(g, bx * s + k * sl + 1.5, by * s + 1.5, sl - 3, s - 3, c, r, false); } }
      blots(g, N, r, 40, 40, 150, true); grain(g, N, r, 12); } },
    /* rush matting, woven straw laid over the boards: warm buff, a basket weave */
    rush: { rep: 0.8, draw: function (g, N, r) {
      g.fillStyle = rgb(92, 72, 44); g.fillRect(0, 0, N, N); var n = 16, s = N / n;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var over = (x + y) % 2 === 0, c = mix([186, 156, 96], [150, 122, 70], r());
        g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
        for (var i = 1; i < 4; i++) { g.fillStyle = 'rgba(70,52,24,0.28)'; if (over) g.fillRect(x * s + 1, y * s + i * s / 4, s - 2, 1); else g.fillRect(x * s + i * s / 4, y * s + 1, 1, s - 2); } }
      blots(g, N, r, 40, 40, 140, true); grain(g, N, r, 20); } },
    /* a pale marble, honed, for the baths and the prefects: veined, large squares laid black and white */
    marble: { rep: 2.4, draw: function (g, N, r) {
      var n = 4, s = N / n;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var wht = (x + y) % 2 === 0, c = wht ? [214, 212, 206] : [52, 54, 58];
        g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
        for (var v = 0; v < 6; v++) { g.strokeStyle = wht ? 'rgba(120,124,132,0.35)' : 'rgba(210,214,220,0.22)'; g.lineWidth = 1 + r() * 1.5; g.beginPath();
          var px = x * s + r() * s, py = y * s + r() * s; g.moveTo(px, py); g.bezierCurveTo(px + r() * 120 - 60, py + r() * 120 - 60, px + r() * 160 - 80, py + r() * 160 - 80, px + r() * 200 - 100, py + r() * 200 - 100); g.stroke(); } }
      g.fillStyle = 'rgba(30,30,30,0.5)'; for (var q = 0; q <= n; q++) { g.fillRect(q * s - 1, 0, 2, N); g.fillRect(0, q * s - 1, N, 2); }
      grain(g, N, r, 10); } },
    /* req 1990: a pale veined marble for the prefects' rooms (honed, a little polished): two-by-two slabs, thin grey veins, a soft sheen */
    'marble-pale': { rep: 2.4, draw: function (g, N, r) { slab(g, N, r, [226, 223, 216], [118, 124, 132], 0.30); } },
    /* v2 (Masonry, 17 November 2026): the same marble as one piece with no joint in it, for a stair's treads and risers: each
       is one cut slab, its own edges its joints, so no slab line runs down the middle of a flight */
    'marble-piece': { rep: 2.4, draw: function (g, N, r) { honed(g, N, r, [226, 223, 216], [118, 124, 132]); } },
    /* the same slabs in a warm cream with brown-gold veins */
    'marble-cream': { rep: 2.4, draw: function (g, N, r) { slab(g, N, r, [224, 214, 192], [150, 116, 70], 0.34); } },
    /* req 1995: the Victorian black and white, nine-inch glazed squares (about 0.23 m) on the chequer, a keyline of grey grout, the white a
       little warm and crazed, the black a soft iron black; the washroom and hall floor of the 1860s to the 1890s (Butterfield's All Saints,
       Margaret Street; the Rothesay Pier toilets of 1899 lay a cream mosaic with the same black bands) */
    'victorian-bw': { rep: 2.3, draw: function (g, N, r) {
      var n = 10, s = N / n;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var wht = (x + y) % 2 === 0, t = (r() - 0.5) * 10, c = wht ? [228 + t, 222 + t, 208 + t] : [38 + t, 38 + t, 42 + t];
        g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
        var sh = g.createLinearGradient(x * s, y * s, x * s + s, y * s + s); sh.addColorStop(0, 'rgba(255,255,255,0.12)'); sh.addColorStop(1, 'rgba(0,0,0,0.07)'); g.fillStyle = sh; g.fillRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
        if (wht) for (var k = 0; k < 4; k++) { g.strokeStyle = 'rgba(120,108,88,0.22)'; g.lineWidth = 0.7; g.beginPath(); var px = x * s + r() * s, py = y * s + r() * s; g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * s * 0.6, py + (r() - 0.5) * s * 0.6); g.stroke(); } }
      g.fillStyle = 'rgba(128,124,116,0.85)'; for (var q = 0; q <= n; q++) { g.fillRect(q * s - 1.5, 0, 3, N); g.fillRect(0, q * s - 1.5, N, 3); }
      blots(g, N, r, 30, 30, 120, true); grain(g, N, r, 8); } }
  };
  var maps = {}, mats = {};
  function tex(kind) {
    if (maps[kind]) return maps[kind];
    var N = 1024, cv = document.createElement('canvas'); cv.width = cv.height = N;
    var g = cv.getContext('2d'); KINDS[kind].draw(g, N, rnd(kind.length * 7919 + 17));
    var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return (maps[kind] = t);
  }
  function dress(old, kind, gain, proj) {
    proj = proj || 'face';
    var key = kind + ':' + proj + ':' + old.uuid; if (mats[key]) return mats[key];
    var m = old.clone(); m.color.set(0xffffff); m.map = null; m.userData = { floorKit: kind }; var t = tex(kind), rep = KINDS[kind].rep;
    m.onBeforeCompile = function (sh) {
      sh.uniforms.kitMap = { value: t };
      /* v2 (Masonry, 17 November 2026, Fawkes's word 9.10 pm): each face takes the texture along its own normal, as
         stone-face.js does: a floor or tread from above, an upright face (a riser, a stringer) from the side. 'down', the
         kit's old projection from above on every face, stays as a flag for the check's known bads (page/design/stone-check.html):
         on an upright face it smears the texture into vertical streaks */
      sh.vertexShader = 'varying vec3 vKitP;\nvarying vec3 vKitN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvKitP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvKitN = normalize(mat3(modelMatrix) * objectNormal);');
      var uv = proj === 'down' ? 'vec2 kuv = vKitP.xz;\n' : 'vec3 kn = abs(normalize(vKitN));\nvec2 kuv = kn.x > kn.z ? vKitP.zy : vKitP.xy;\nif (kn.y > max(kn.x, kn.z)) kuv = vKitP.xz;\n';
      sh.fragmentShader = 'uniform sampler2D kitMap;\nvarying vec3 vKitP;\nvarying vec3 vKitN;\n' + sh.fragmentShader.replace('#include <color_fragment>',
        '#include <color_fragment>\n' + uv + 'diffuseColor.rgb = pow(texture2D(kitMap, kuv / ' + rep.toFixed(3) + ').rgb, vec3(2.2)) * ' + (gain || 0.5).toFixed(3) + ';');
    };
    /* each kind's repeat, gain and projection its own program (three keys a program by this function's source alone, so two
       kinds would otherwise share the first one's repeat) */
    m.customProgramCacheKey = function () { return 'floorkit|' + rep + '|' + (gain || 0.5) + '|' + proj; };
    m.needsUpdate = true; return (mats[key] = m);
  }
  /* FloorKit.apply('oak', 1.0): every mesh named *-floor (not a niche's) in the live scene takes the kind */
  /* the page copy of Design's probe (assets/design/materials/floor-kit.js, req 1911); `mat` added for the shell (req 1928) */
  window.FloorKit = { kinds: Object.keys(KINDS), mat: dress, tex: tex, rep: function (k) { return KINDS[k].rep; }, apply: function (kind, gain) {
    var n = 0, sc = window.lumosGreybox.scene;
    sc.traverse(function (o) { if (o.isMesh && /-floor$/.test(o.name || '') && !/niche/.test(o.name)) {
      var mm = o.material; if (Array.isArray(mm)) return; o.material = dress(mm, kind, gain); n++; } });
    return n;
  } };
})();
