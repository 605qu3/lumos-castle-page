/* castle.js: the frame every room's page shares (8 October 2026). Each page loads three.js, then this file, then
   calls castleFrame(opts) once at the top of its own script and unpacks what it uses into local names, so its own
   code reads as it did when each page carried a copy. A page keeps its own manifest (LAYERS), sources and decisions
   log, its scene, its camera's moves and its per-frame loop; what is here is what every room does the same way.

   opts:
     shadows     true for soft shadow maps; boxes and cutouts then cast and receive (the common room); default off
     background  the clear colour and the fog's, as an sRGB hex; fog is the FogExp2 density
     tintFor     function (mesh) giving a mesh's colour under the Layers button; default TINTS[its layer]
     onAct       function (act) for the page's own buttons; Layers, Res, Exp and ? are handled here
   set on the returned frame before any drawing loads:
     F.eye        the camera's resting position, about which placeCard scales a drawing made in perspective
     F.bentPlane  function (w, h) for a layer with bend: true (the round wall's radius is the page's)
     F.onSurface  function (id, texture, color), called after a surface's drawing is applied */
(function () {
'use strict';

window.castleFrame = function (opts) {
  opts = opts || {};
  var F = {};

  var helpEl = document.getElementById('help');
  if (typeof THREE === 'undefined') {
    helpEl.textContent = 'three.js did not load. Check the connection and reload.';
    return null;
  }
  var canvas = document.getElementById('c');
  var statsEl = document.getElementById('stats');
  var backBtn = document.getElementById('back');
  var btns = {};
  Array.prototype.forEach.call(document.querySelectorAll('#btns button'), function (b) { btns[b.getAttribute('data-act')] = b; });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ---------- renderer, scene, camera ---------- */

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  if (opts.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  var EXPOSURES = [0.6, 0.8, 1.0, 1.3];
  var expIndex = 2;
  renderer.toneMappingExposure = EXPOSURES[expIndex];
  var MAX_PR = Math.min(window.devicePixelRatio || 1, 2);
  var pixelRatio = MAX_PR;

  var scene = new THREE.Scene();
  scene.background = col(opts.background);
  scene.fog = new THREE.FogExp2(col(opts.background).getHex(), opts.fog);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);

  /* ---------- canvas texture helpers ---------- */

  function makeCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c) {
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  /* flat colours in this file are written as the colours they should look; the renderer wants them linear */
  function col(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.fill();
  }
  function arch(g, x, y, w, h) {
    var r = w / 2;
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x, y + r);
    g.arc(x + r, y + r, r, Math.PI, 0);
    g.lineTo(x + w, y + h);
    g.closePath();
    g.fill();
  }
  function label(g, text, w, y, size, color) {
    g.fillStyle = color || '#45423d';
    g.font = '600 ' + size + 'px -apple-system, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, y);
  }
  function cutoutTexture(w, h, fill, draw, text) {
    var c = makeCanvas(w, h), g = c.getContext('2d');
    g.fillStyle = fill;
    draw(g, w, h);
    if (text) label(g, text, w, h * 0.5, Math.round(Math.min(w, h) * 0.085));
    return tex(c);
  }
  function flameTexture() {
    var c = makeCanvas(128, 128), g = c.getContext('2d'), k = 58 / 40;
    g.setTransform(1, 0, 0, k, 0, 72 - 72 * k);
    var grd = g.createRadialGradient(64, 72 + 16 / k, 3, 64, 72, 40);
    grd.addColorStop(0, 'rgba(255,255,230,1)');
    grd.addColorStop(0.25, 'rgba(255,200,110,0.9)');
    grd.addColorStop(0.55, 'rgba(255,110,30,0.45)');
    grd.addColorStop(1, 'rgba(255,60,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128 / k + 72);
    return tex(c);
  }

  /* ---------- mesh helpers ---------- */

  var layered = [];
  var TINTS = [0x6f8dff, 0x4fd1c5, 0x8bd45a, 0xf0d35a, 0xf08a4b];
  function register(mesh, layer) {
    mesh.userData.layer = layer;
    mesh.userData.base = mesh.material.color.clone();
    layered.push(mesh);
    return mesh;
  }
  function solid(color, o) {
    var p = { color: col(color), roughness: 0.92, metalness: 0 };
    if (o) for (var k in o) p[k] = o[k];
    return new THREE.MeshStandardMaterial(p);
  }
  function box(parent, w, h, d, x, y, z, material, layer) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    if (opts.shadows) { m.castShadow = true; m.receiveShadow = true; }
    parent.add(m);
    return register(m, layer);
  }
  function cutoutMesh(t, w, h) {
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: t, color: 0xffffff, roughness: 0.95, metalness: 0, alphaTest: 0.5, side: THREE.DoubleSide })
    );
    if (opts.shadows) {
      m.castShadow = true; m.receiveShadow = true;
      m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
      m.customDistanceMaterial = new THREE.MeshDistanceMaterial({ map: t, alphaTest: 0.5 });
    }
    return m;
  }

  /* ---------- drawn layers: a drawing replaces its grey placeholder ---------- */

  function sheetTexture(im, entry) {
    var t = tex(im);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.repeat.set(1 / entry.cols, 1);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  }
  function applyLayer(id, entry) {
    var mesh = scene.getObjectByName(id);
    if (!mesh || !entry.url) return;
    var im = new Image();
    im.onload = function () {
      var t = tex(entry.sill ? sillCanvas(im, entry.sill, entry.w, entry.tint) : im);
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      /* a chair drawn from behind faces whichever way it was drawn; mirror turns it
         to face the fire. The shadow materials share the map, so the shadow turns too */
      if (entry.mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
      var h = entry.w * im.height / im.width;
      mesh.geometry.dispose();
      mesh.geometry = entry.flutter ? new THREE.PlaneGeometry(entry.w, h, 12, 24) : entry.bend ? F.bentPlane(entry.w, h) : new THREE.PlaneGeometry(entry.w, h);
      if (entry.flutter) mesh.geometry.userData.base = Float32Array.from(mesh.geometry.attributes.position.array);
      /* A floor piece drawn from a little above has its back feet higher in the
         image than its front ones, so standing it on its lowest pixel leaves the
         back pair in mid-air. sink drops it until the average of its feet is on
         the floor: the back feet come down, the front feet go a little under, and
         the floor hides what goes under. Measured per piece off the drawing. */
      if (entry.card) placeCard(mesh, entry, h);
      else if (entry.pivot !== 'centre') mesh.position.y = h / 2 - (entry.sink || 0) * h;
      /* the window placeholders are unlit, because they carry their own painted
         sky; the drawn window is not, so it gets a lit material of its own */
      if (entry.window) {
        mesh.material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0, alphaTest: 0.5 });
        mesh.receiveShadow = true;
        mesh.userData.base = mesh.material.color.clone();
        /* the sky shrinks to sit inside the stone reveal, or it shows round the
           drawn window as a halo: four-fifths of its width and seven-eighths of
           its height keeps the sky's arch inside the window's outer arch and its
           foot behind the sill */
        var sky = scene.getObjectByName(id + '-sky');
        if (sky) { sky.geometry.dispose(); sky.geometry = new THREE.PlaneGeometry(entry.w * 0.8, h * 0.88); }
      }
      mesh.material.map = t; mesh.material.needsUpdate = true;
      /* a drawing's value set in code, as a surface's is: the model ignores a colour asked for */
      if (entry.tint && !entry.sill) { mesh.material.color.set(entry.tint); mesh.userData.base = mesh.material.color.clone(); }
      mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
      mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({ map: t, alphaTest: 0.5 });
    };
    im.src = entry.url;
  }

  /* A piece drawn in perspective from the camera, the spiral stair: its drawing is what the eye sees of
     the real thing, so the card faces the camera, and it stands card.front metres in front of the
     newel, scaled about the eye to match, so nothing near in the drawing falls below the floor and is
     cut off by it. w is the drawing's width at the newel; floor is how far up the image the floor
     at the newel lies, as a fraction of its height. */
  function placeCard(mesh, entry, h) {
    var c = entry.card, dx = F.eye.x - c.x, dz = F.eye.z - c.z, dist = Math.hypot(dx, dz);
    var k = (dist - c.front) / dist;
    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(entry.w * k, h * k);
    var bottom = F.eye.y + (-entry.floor * h - F.eye.y) * k;
    mesh.position.set(c.x + dx / dist * c.front, bottom + h * k / 2, c.z + dz / dist * c.front);
    mesh.rotation.set(0, Math.atan2(dx, dz), 0);
  }

  /* A surface keeps its mesh and its place; only its material changes, from a flat
     grey to the drawing, at full anisotropy because the floor is seen nearly edge on. */
  function applySurface(id, entry) {
    var mesh = scene.getObjectByName(id);
    if (!mesh) return;
    var im = new Image();
    im.onload = function () {
      var src = entry.unstain ? unstainCanvas(im, entry.unstain) : im;
      src = entry.quiet ? quietCanvas(src, entry.quiet) : src;
      var t = tex(entry.wear ? wornCanvas(src, entry.wear, mesh) : src);
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (entry.mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
      mesh.material.map = t;
      /* tint darkens the drawing in place: the model ignores a hex asked for, so the floor's value is set here */
      mesh.material.color.copy(col(entry.tint || 0xffffff));
      mesh.userData.base = mesh.material.color.clone();
      mesh.material.needsUpdate = true;
      if (F.onSurface) F.onSurface(id, t, mesh.material.color);
    };
    im.src = entry.url;
  }

  /* A plan cutout keeps its placeholder's place and lies flat; its own outline
     replaces the grey shape, cut at the page's usual 50 percent alpha line. */
  function applyPlan(id, entry) {
    var mesh = scene.getObjectByName(id);
    if (!mesh) return;
    var im = new Image();
    im.onload = function () {
      var t = tex(im);
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(entry.w, entry.w * im.height / im.width);
      mesh.scale.set(1, 1, 1);
      mesh.material = new THREE.MeshStandardMaterial({ map: t, color: col(entry.tint || 0xffffff), roughness: 1, metalness: 0, alphaTest: 0.5 });
      mesh.userData.base = mesh.material.color.clone();
    };
    im.src = entry.url;
  }

  /* Wear is polish, so it lightens: soft discs laid along each path on a canvas of
     their own, then screened over the drawing once, so overlaps cannot build up.
     Discs rather than a blurred stroke, because a canvas blur filter is missing in
     older iPad Safari. The floor circle maps world x, z to the image with its top
     edge at the hearth (z = -R). */
  /* Quiet is lower contrast, not darker: the drawing is blended toward its own
     average colour, by `amount` below `below` and by `all` over the rest, the
     change faded over 40 cm so there is no line where it starts. A blurred copy
     was tried and left dark smudges where joints cluster. */
  function quietCanvas(im, q) {
    var W = im.width, H = im.height;
    var c = makeCanvas(W, H), g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    var one = makeCanvas(1, 1), og = one.getContext('2d');
    og.drawImage(im, 0, 0, 1, 1);
    var m = og.getImageData(0, 0, 1, 1).data;
    var y = function (h) { return (1 - h / q.height) * H; };
    var grd = g.createLinearGradient(0, y(q.below + 0.2), 0, y(q.below - 0.2));
    var rgba = function (a) { return 'rgba(' + m[0] + ',' + m[1] + ',' + m[2] + ',' + a + ')'; };
    grd.addColorStop(0, rgba(q.all || 0));
    grd.addColorStop(1, rgba(q.amount));
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    return c;
  }

  /* Unstain lifts the wash's water stains without flattening the drawing. The stone's brightness is averaged over
     cells of `cell` px, the black pen joints left out (anything under 90 of 255), and read back between cell centres
     so no cell edge shows. Wherever that average is darker than the whole wall's, the pixel is lifted by the ratio to
     the power `strength`, at most 1.8 times; nothing is ever darkened. The cells are small enough that a stain's
     tide-mark edge stays a crisp edge, only paler. Averaged by hand rather than by scaling a canvas down, since how
     far a browser averages when it shrinks an image is its own affair. */
  function unstainCanvas(im, u) {
    var W = im.width, H = im.height, n = u.cell;
    var c = makeCanvas(W, H), g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    var img = g.getImageData(0, 0, W, H), d = img.data;
    var cw = Math.ceil(W / n), ch = Math.ceil(H / n);
    var sum = new Float32Array(cw * ch), cnt = new Uint32Array(cw * ch), all = 0, allN = 0;
    for (var y = 0; y < H; y++) {
      var row = ((y / n) | 0) * cw;
      for (var x = 0; x < W; x++) {
        var i = (y * W + x) * 4, l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (l < 90) continue;
        var k = row + ((x / n) | 0);
        sum[k] += l; cnt[k]++; all += l; allN++;
      }
    }
    var mean = all / allN;
    for (var k = 0; k < sum.length; k++) sum[k] = cnt[k] ? sum[k] / cnt[k] : mean;
    for (var y = 0; y < H; y++) {
      var fy = Math.min(Math.max(y / n - 0.5, 0), ch - 1), y0 = fy | 0, y1 = Math.min(y0 + 1, ch - 1), ty = fy - y0;
      for (var x = 0; x < W; x++) {
        var fx = Math.min(Math.max(x / n - 0.5, 0), cw - 1), x0 = fx | 0, x1 = Math.min(x0 + 1, cw - 1), tx = fx - x0;
        var a = sum[y0 * cw + x0] + (sum[y0 * cw + x1] - sum[y0 * cw + x0]) * tx;
        var b = sum[y1 * cw + x0] + (sum[y1 * cw + x1] - sum[y1 * cw + x0]) * tx;
        var low = a + (b - a) * ty;
        if (low >= mean) continue;
        var gain = Math.pow(Math.min(mean / low, 1.8), u.strength), i = (y * W + x) * 4;
        d[i] = Math.min(255, d[i] * gain); d[i + 1] = Math.min(255, d[i + 1] * gain); d[i + 2] = Math.min(255, d[i + 2] * gain);
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /* The portrait hole's sill, worn by centuries of boys sliding over it on their backsides: the bottom of the ring is
     rubbed smooth and pale, heaviest at the bottom centre on the inner lip, fading up the sides over `spread` degrees and
     toward the outer edge. Smooth is a blend toward a softened copy (scaled down and back up, which every browser does,
     where the canvas filter is not safe on older iPads), so the hatching and the wash's mottle are rubbed away; then
     drawn toward a paler, greyer stone by `strength`, since the plate shows wear as worn colour and never as gloss.
     The layer's tint is applied here rather than on the material, which would cap the worn stone at the tint's value. */
  function sillCanvas(im, sill, w, tint) {
    if (tint === undefined) tint = 0xffffff;                   /* no tint: the drawing as it is, not black */
    /* the material's tint multiplies in linear light and the drawing is sRGB, so in the canvas it is its 1/2.2 power */
    var tr = Math.pow((tint >> 16 & 255) / 255, 1 / 2.2), tg = Math.pow((tint >> 8 & 255) / 255, 1 / 2.2),
      tb = Math.pow((tint & 255) / 255, 1 / 2.2), tc = [tr, tg, tb];
    var pale = [255 * tr * sill.pale, 255 * tg * sill.pale, 255 * tb * sill.pale];
    var W = im.width, H = im.height, c = makeCanvas(W, H), g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    var sm = makeCanvas(W, H), sg = sm.getContext('2d'), k = 10;
    var tiny = makeCanvas(Math.ceil(W / k), Math.ceil(H / k));
    tiny.getContext('2d').drawImage(im, 0, 0, tiny.width, tiny.height);
    sg.imageSmoothingEnabled = true; sg.drawImage(tiny, 0, 0, W, H);
    var a = g.getImageData(0, 0, W, H), b = sg.getImageData(0, 0, W, H), A = a.data, B = b.data, m = w / W;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = (y * W + x) * 4;
      if (A[i + 3] === 0) continue;
      for (var q = 0; q < 3; q++) { A[i + q] *= tc[q]; B[i + q] *= tc[q]; }
      var dx = (x - W / 2) * m, dy = (y - H / 2) * m, r = Math.hypot(dx, dy);
      var d = Math.abs(Math.atan2(dx, dy)) * 180 / Math.PI / sill.spread;       /* 0 at the bottom centre */
      if (d >= 1) continue;
      var ang = (1 - d * d) * (1 - d * d), t = Math.min(1, Math.max(0, (r - sill.inner) / (sill.outer - sill.inner)));
      var wgt = ang * (1 - 0.7 * t * t);
      for (var ch = 0; ch < 3; ch++) {
        var v = A[i + ch] + (B[i + ch] - A[i + ch]) * wgt * sill.smooth;
        A[i + ch] = v + (Math.min(255, pale[ch]) - v) * wgt * sill.strength;
      }
      var lum = 0.3 * A[i] + 0.59 * A[i + 1] + 0.11 * A[i + 2];
      for (ch = 0; ch < 3; ch++) A[i + ch] += (lum - A[i + ch]) * wgt * 0.3;
    }
    g.putImageData(a, 0, 0);
    return c;
  }
  function wornCanvas(im, wear, mesh) {
    var W = im.width, H = im.height, R = mesh.geometry.parameters.radius;
    var c = makeCanvas(W, H), g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    var m = makeCanvas(W, H), mg = m.getContext('2d');
    function px(p) { return [(p[0] / R + 1) / 2 * W, (p[1] / R + 1) / 2 * H]; }
    wear.forEach(function (w) {
      var r = w.width / 2 / (2 * R) * W;
      for (var i = 0; i < w.path.length - 1; i++) {
        var a = px(w.path[i]), b = px(w.path[i + 1]);
        var n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (r * 0.25));
        for (var k = 0; k <= n; k++) {
          var f = k / n, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
          var wa = w.path[i][2], wb = w.path[i + 1][2];
          if (wa === undefined) wa = wb === undefined ? 1 : wb;   /* a point with no weight takes its neighbour's */
          if (wb === undefined) wb = wa;
          var weight = wa + (wb - wa) * f;
          var grd = mg.createRadialGradient(x, y, 0, x, y, r);
          grd.addColorStop(0, 'rgba(255,255,255,' + weight.toFixed(3) + ')');
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          mg.globalCompositeOperation = 'lighten';
          mg.fillStyle = grd;
          mg.fillRect(x - r, y - r, 2 * r, 2 * r);
        }
      }
      g.globalCompositeOperation = 'screen';
      g.globalAlpha = w.strength;
      g.drawImage(m, 0, 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      mg.clearRect(0, 0, W, H);
    });
    return c;
  }

  /* ---------- the HUD ---------- */

  var tintOn = false;
  function setTint(on) {
    tintOn = on;
    for (var i = 0; i < layered.length; i++) {
      var m = layered[i];
      var c = on ? (opts.tintFor ? opts.tintFor(m) : TINTS[m.userData.layer]) : m.userData.base;
      m.material.color.copy(on ? col(c) : c);
    }
    btns.layers.classList.toggle('on', on);
  }
  function updateResLabel() { btns.res.textContent = 'Res ' + (Math.round(pixelRatio * 10) / 10) + 'x'; }
  function updateExpLabel() { btns.exp.textContent = 'Exp ' + EXPOSURES[expIndex].toFixed(1); }
  document.getElementById('btns').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'layers') setTint(!tintOn);
    else if (act === 'res') { pixelRatio = pixelRatio > 1 ? 1 : MAX_PR; updateResLabel(); resize(); }
    else if (act === 'exp') { expIndex = (expIndex + 1) % EXPOSURES.length; renderer.toneMappingExposure = EXPOSURES[expIndex]; updateExpLabel(); }
    else if (act === 'help') helpEl.hidden = !helpEl.hidden;
    else if (opts.onAct) opts.onAct(act);
  });
  updateResLabel(); updateExpLabel();
  setTimeout(function () { helpEl.hidden = true; }, 9000);

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 58 : 42;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
  resize();

  /* the fps line: call once a frame, after rendering, with the frame's dt */
  var fpsN = 0, fpsT = 0;
  function stats(dt) {
    fpsN++; fpsT += dt;
    if (fpsT >= 0.5) {
      var ri = renderer.info.render;
      statsEl.textContent = Math.round(fpsN / fpsT) + ' fps\n' + ri.calls + ' draw calls\n' + (ri.triangles / 1000).toFixed(1) + 'k triangles';
      fpsN = 0; fpsT = 0;
    }
  }

  /* ---------- between rooms: the darkening, arriving, and the saved place ----------
     A trip through the hole is a page load under a fade (8 October 2026): travel(url) darkens the screen and then loads
     the other room's page, whose address carries ?from=<the room he left>; that page starts black and comes up when it
     calls reveal(), once it has set him where he arrives (or by itself after REVEAL_SAFE seconds, so a page that never
     calls it is never left black). The place is saved on the device on every trip: { room, stop }. */
  var PLACE_KEY = 'lumos.castle.place', DARKEN_S = 0.45, REVEAL_S = 0.7, REVEAL_SAFE = 2.5;
  var veil = document.createElement('div');
  veil.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;background:#000;opacity:0;pointer-events:none;z-index:50';
  document.body.appendChild(veil);
  var from = null;
  try { from = new URLSearchParams(location.search).get('from'); } catch (err) {}
  if (from) { veil.style.opacity = '1'; veil.style.pointerEvents = 'auto'; }
  var revealedYet = !from;
  function reveal() {
    if (revealedYet) return;
    revealedYet = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      veil.style.transition = 'opacity ' + REVEAL_S + 's ease-out';
      veil.style.opacity = '0';
      veil.style.pointerEvents = 'none';
    }); });
  }
  if (from) setTimeout(reveal, REVEAL_SAFE * 1000);
  function savePlace(place) { try { localStorage.setItem(PLACE_KEY, JSON.stringify(place)); } catch (err) {} }
  function readPlace() { try { return JSON.parse(localStorage.getItem(PLACE_KEY)); } catch (err) { return null; } }
  /* o.place is saved before leaving; o.dry darkens and comes back up without loading, for shooting a departure */
  function travel(url, o) {
    o = o || {};
    if (o.place) savePlace(o.place);
    veil.style.transition = 'opacity ' + DARKEN_S + 's ease-in';
    veil.style.pointerEvents = 'auto';
    veil.style.opacity = '1';
    setTimeout(function () {
      if (!o.dry) { location.href = url; return; }
      veil.style.transition = 'opacity ' + REVEAL_S + 's ease-out';
      veil.style.opacity = '0';
      veil.style.pointerEvents = 'none';
      if (o.done) o.done();
    }, (DARKEN_S + (o.dry ? 0.6 : 0.05)) * 1000);
  }

  /* ---------- the seventh-floor corridor, one model for every page that shows it ---------- */
  /* Godric, 10 October 2026, 5.35 pm (the Corridor's Q21, option 1): the Fat Lady hangs at the very end of the corridor
     (PS 7) and the polite door where she hung, built once here so the corridor page and the common room's view out
     through the open hole draw the same corridor. The corridor's frame: x along it, toward her end; y up; z across,
     from the outer wall (FAR_Z) to the long wall the door is in (HER_Z). The architecture only: floor, ceiling, the
     three walls with real openings (the round hole in the end wall, the door and the inglenook's mouth in the long
     wall, the two windows in the outer wall), the windows' frames, glass and sills, the flight going down from the
     stair head and its landing. A page draws its own door leaf, torches, paintings and lights at CORRIDOR.places.
     The numbers are the corridor page's, moved here, and live only here. */
  var CORRIDOR = (function () {
    var C = { HER_Z: -0.81, FAR_Z: -3.81, END_X: 2.3, STAIR_X: -11.4, CEIL: 4.5, BELOW: 4.6, T: 0.3,
      STEP_RISE: 0.18, STEP_RUN: 0.3, STEPS: 11, LANDING_D: 2.4,
      NOOK_X0: -6.4, NOOK_X1: -10.8, NOOK_H: 2.4,
      /* the outer wall 0.45 m thick (the Placement check, 5.08 pm); each window's reveal splayed toward the corridor so
         the glass shows from the stair head (Godric, Q22, 5.53 pm), splay[0] on the stair side, splay[1] on her side;
         the window nearer the stairs, the grounds' (Q20), splayed deepest on its stair side */
      WINDOW: { w: 1.2, h: 2.4, sill: 0.9, deep: 0.45, xs: [-2.5, -4.6], splays: [[0.25, 0.25], [1.0, 0.25]] },
      DOOR: { w: 1.0, h: 2.2, x: 0 },
      HOLE: { r: 0.6, y: 1.2, depth: 0.81 },
      PORTRAIT: { w: 1.4, h: 1.7 } };
    C.FOOT_X = C.STAIR_X - C.STEPS * C.STEP_RUN; C.FOOT_Y = -C.STEPS * C.STEP_RISE; C.FAR_END_X = C.FOOT_X - C.LANDING_D;
    C.MID_Z = (C.HER_Z + C.FAR_Z) / 2; C.LEN = C.END_X - C.FAR_END_X; C.WIDTH = C.HER_Z - C.FAR_Z;
    C.WALL_H = C.CEIL + C.BELOW; C.WALL_Y = (C.CEIL - C.BELOW) / 2;
    C.GLASS_Z = C.FAR_Z - C.WINDOW.deep;
    /* where each page hangs its own things, in the corridor's frame */
    C.places = {
      hole: { x: C.END_X, y: C.HOLE.y, z: C.MID_Z },          /* the round hole's centre on the end wall's face, its axis +x */
      door: { x: C.DOOR.x, z: C.HER_Z, w: C.DOOR.w, h: C.DOOR.h },
      paintingOpposite: { x: 1.5, y: 1.25, z: C.FAR_Z, w: 0.5, h: 0.55 },   /* where it hung; re-homed with Magic, provisional */
      torches: [{ x: 0.9, y: 1.3, z: C.FAR_Z }, { x: 2.1, y: 1.3, z: C.FAR_Z }],
      windows: C.WINDOW.xs.map(function (x) { return { x: x, y: C.WINDOW.sill + C.WINDOW.h / 2, z: C.GLASS_Z }; })
    };
    /* The hole's own frame (the room's: x along its wall, y up, z into the room, its origin on the room's face of the
       hole, the corridor's face at z HER_Z) turned onto the end wall: corridor = (END_X - HER_Z + z, y, MID_Z - x).
       holeMount puts a group in that frame inside the corridor; holeView puts the corridor inside the room's hole frame. */
    C.holeMount = { ry: Math.PI / 2, x: C.END_X - C.HER_Z, z: C.MID_Z };
    C.holeView = { ry: -Math.PI / 2, x: C.MID_Z, z: -(C.END_X - C.HER_Z) };
    C.holeToCorridor = function (x, y, z) { return new THREE.Vector3(C.END_X - C.HER_Z + z, y, C.MID_Z - x); };
    return C;
  })();
  function mountInHole(group) { group.rotation.set(0, CORRIDOR.holeMount.ry, 0); group.position.set(CORRIDOR.holeMount.x, 0, CORRIDOR.holeMount.z); return group; }
  function corridorInHole(group) { group.rotation.set(0, CORRIDOR.holeView.ry, 0); group.position.set(CORRIDOR.holeView.x, 0, CORRIDOR.holeView.z); return group; }

  /* one window's outline, from the bottom of one jamb round the head to the bottom of the other: a round head of half
     width r centred on x, springing at ys, the jambs down to yb; n points on the head */
  function windowOutline(x, r, ys, yb, n) {
    var pts = [new THREE.Vector2(x - r, yb)];
    for (var i = 0; i <= n; i++) { var a = Math.PI - Math.PI * i / n; pts.push(new THREE.Vector2(x + r * Math.cos(a), ys + r * Math.sin(a))); }
    pts.push(new THREE.Vector2(x + r, yb));
    return pts;
  }
  function buildCorridor(parent, o) {
    o = o || {};
    var C = CORRIDOR, W = C.WINDOW, layer = o.layer || 0;
    var wallMat = o.wall || solid(0x75726e), floorMat = o.floor || solid(0x6a6764), ceilMat = o.ceil || solid(0x3d3b38);
    var stairMat = o.stair || solid(0x6f6b66), sillMat = o.sill || solid(0x86827c);
    var group = new THREE.Group(); group.name = 'corridor'; parent.add(group);
    var out = { group: group, windows: [] };
    function add(m, name, lay) {
      m.name = name;
      if (opts.shadows) { m.castShadow = true; m.receiveShadow = true; }
      group.add(m); register(m, lay === undefined ? layer : lay);
      return m;
    }
    function rect(x0, y0, x1, y1) { var s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.lineTo(x0, y0); return s; }
    function holeOf(pts) { var p = new THREE.Path(); p.moveTo(pts[0].x, pts[0].y); for (var i = 1; i < pts.length; i++) p.lineTo(pts[i].x, pts[i].y); p.lineTo(pts[0].x, pts[0].y); return p; }
    var y0 = C.WALL_Y - C.WALL_H / 2, y1 = C.WALL_Y + C.WALL_H / 2;

    /* the outer wall, cut with the two windows' openings at their inner (splayed) outline */
    var r = W.w / 2, yb = W.sill - 0.03, ys = W.sill + W.h - r, N = 24;
    var outlines = W.xs.map(function (wx, i) {
      var s = W.splays[i], ri = r + (s[0] + s[1]) / 2, xi = wx + (s[1] - s[0]) / 2;
      return { x: wx, inner: windowOutline(xi, ri, ys, yb, N), outer: windowOutline(wx, r, ys, yb, N), splay: s };
    });
    var farShape = rect(C.FAR_END_X, y0, C.END_X, y1);
    outlines.forEach(function (ol) { farShape.holes.push(holeOf(ol.inner)); });
    var farG = new THREE.ExtrudeGeometry(farShape, { depth: W.deep, bevelEnabled: false, curveSegments: 1 });
    farG.translate(0, 0, C.FAR_Z - W.deep);
    out.farWall = add(new THREE.Mesh(farG, wallMat), 'far-wall');
    /* each reveal: a surface from the inner outline on the wall's face to the glass's outline at its back */
    outlines.forEach(function (ol, i) {
      var pos = [], idx = [], n = ol.inner.length;
      for (var k = 0; k < n; k++) {
        pos.push(ol.inner[k].x, ol.inner[k].y, C.FAR_Z, ol.outer[k].x, ol.outer[k].y, C.GLASS_Z);
        if (k < n - 1) { var a = 2 * k; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      var rev = add(new THREE.Mesh(g, o.reveal || new THREE.MeshStandardMaterial({ color: wallMat.color, roughness: 0.92, metalness: 0, side: THREE.DoubleSide })), (i ? 'window' : 'window-2') + '-reveal');
      ol.reveal = rev;
    });
    /* the windows themselves, at the back of each reveal: the sky behind the glass and the frame in it (a narrow band
       round the head and jambs, a bottom rail and a mullion), and the deep sill filling the reveal's floor, 5 cm proud */
    outlines.forEach(function (ol, i) {
      var name = i ? 'window' : 'window-2', wx = ol.x;
      var sky = cutoutMesh(cutoutTexture(120, 240, '#c9d6e2', function (g, w, h) { arch(g, 0, 0, w, h); }), W.w, W.h);
      sky.material = new THREE.MeshBasicMaterial({ map: sky.material.map, alphaTest: 0.5, color: col(0xdfe8f0) });
      sky.position.set(wx, W.sill + W.h / 2, C.GLASS_Z + 0.005);
      add(sky, name + '-sky', 3);
      var frame = cutoutMesh(cutoutTexture(240, 480, '#8e8a84', function (g, w, h) {
        arch(g, 0, 0, w, h);
        g.globalCompositeOperation = 'destination-out'; arch(g, w * 0.06, w * 0.06, w * 0.88, h * 0.97 - w * 0.06); g.globalCompositeOperation = 'source-over';
        g.fillRect(w * 0.47, w * 0.04, w * 0.06, h * 0.94);
      }, name), W.w, W.h);
      frame.position.set(wx, W.sill + W.h / 2, C.GLASS_Z + 0.01);
      add(frame, name, 1);
      var s = ol.splay, sh = new THREE.Shape();      /* the sill's plan, v = -z: back at the glass, front 5 cm proud */
      sh.moveTo(wx - r, -C.GLASS_Z); sh.lineTo(wx + r, -C.GLASS_Z);
      sh.lineTo(wx + r + s[1] * (W.deep + 0.05) / W.deep, -(C.FAR_Z + 0.05)); sh.lineTo(wx - r - s[0] * (W.deep + 0.05) / W.deep, -(C.FAR_Z + 0.05));
      sh.lineTo(wx - r, -C.GLASS_Z);
      var sg = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
      var sill = new THREE.Mesh(sg, sillMat);
      sill.rotation.x = -Math.PI / 2; sill.position.y = W.sill - 0.03;
      add(sill, name + '-sill', 1);
      sill.userData.front = C.FAR_Z + 0.05;
      out.windows.push({ x: wx, name: name, frame: frame, sky: sky, sill: sill, reveal: ol.reveal });
    });

    /* the long wall, the door's opening at x 0 and the inglenook's mouth under its lintel */
    var herShape = rect(C.FAR_END_X, y0, C.END_X, y1);
    herShape.holes.push(holeOf([new THREE.Vector2(C.DOOR.x - C.DOOR.w / 2, 0), new THREE.Vector2(C.DOOR.x + C.DOOR.w / 2, 0), new THREE.Vector2(C.DOOR.x + C.DOOR.w / 2, C.DOOR.h), new THREE.Vector2(C.DOOR.x - C.DOOR.w / 2, C.DOOR.h)]));
    herShape.holes.push(holeOf([new THREE.Vector2(C.NOOK_X1, 0), new THREE.Vector2(C.NOOK_X0, 0), new THREE.Vector2(C.NOOK_X0, C.NOOK_H), new THREE.Vector2(C.NOOK_X1, C.NOOK_H)]));
    var herG = new THREE.ExtrudeGeometry(herShape, { depth: C.T, bevelEnabled: false });
    herG.translate(0, 0, C.HER_Z);
    out.herWall = add(new THREE.Mesh(herG, wallMat), 'her-wall');

    /* the end wall, between the side walls, with her round hole; its shape drawn with u = -z, turned to face down the corridor */
    var endShape = rect(-C.HER_Z, y0, -C.FAR_Z, y1);
    var hole = new THREE.Path(); hole.absarc(-C.MID_Z, C.HOLE.y, C.HOLE.r, 0, Math.PI * 2, false);
    endShape.holes.push(hole);
    var endG = new THREE.ExtrudeGeometry(endShape, { depth: C.T, bevelEnabled: false, curveSegments: 32 });
    var endWall = new THREE.Mesh(endG, wallMat);
    endWall.rotation.y = Math.PI / 2; endWall.position.x = C.END_X;
    out.endWall = add(endWall, 'end-wall');
    /* the hole's tunnel, through to the room's wall (the room lines its own) */
    if (o.tunnel !== false) {
      var tunnel = new THREE.Mesh(new THREE.CylinderGeometry(C.HOLE.r, C.HOLE.r, C.HOLE.depth, 32, 1, true), o.tunnelMat || solid(0x5f5b56, { side: THREE.BackSide }));
      tunnel.rotation.z = Math.PI / 2; tunnel.position.set(C.END_X + C.HOLE.depth / 2, C.HOLE.y, C.MID_Z);
      out.tunnel = add(tunnel, 'hole-tunnel');
    }
    /* the wall the flight runs down toward */
    out.stairEndWall = box(group, C.T, C.WALL_H, C.WIDTH, C.FAR_END_X - C.T / 2, C.WALL_Y, C.MID_Z, wallMat, layer);
    out.stairEndWall.name = 'stair-end-wall';

    /* the floor to the stair head, the flight down, full width, and the landing at its foot */
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(C.END_X - C.STAIR_X, C.WIDTH), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set((C.END_X + C.STAIR_X) / 2, 0, C.MID_Z);
    out.floor = add(floor, 'floor');
    out.treads = [];
    for (var si = 1; si <= C.STEPS; si++) {
      var tr = box(group, C.STEP_RUN, 0.4, C.WIDTH, C.STAIR_X - (si - 0.5) * C.STEP_RUN, -si * C.STEP_RISE - 0.2, C.MID_Z, stairMat, layer);
      tr.name = 'stair-' + si; out.treads.push(tr);
    }
    var landing = new THREE.Mesh(new THREE.PlaneGeometry(C.LANDING_D, C.WIDTH), floorMat);
    landing.rotation.x = -Math.PI / 2; landing.position.set((C.FOOT_X + C.FAR_END_X) / 2, C.FOOT_Y, C.MID_Z);
    out.landing = add(landing, 'landing');
    var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(C.LEN, C.WIDTH), ceilMat);
    ceiling.rotation.x = Math.PI / 2; ceiling.position.set((C.END_X + C.FAR_END_X) / 2, C.CEIL, C.MID_Z);
    out.ceiling = add(ceiling, 'ceiling');
    return out;
  }

  var names = { helpEl: helpEl, canvas: canvas, statsEl: statsEl, backBtn: backBtn, btns: btns,
    clamp: clamp, lerp: lerp, easeInOut: easeInOut, col: col,
    renderer: renderer, scene: scene, camera: camera,
    makeCanvas: makeCanvas, tex: tex, rr: rr, arch: arch, label: label, cutoutTexture: cutoutTexture, flameTexture: flameTexture,
    layered: layered, TINTS: TINTS, register: register, solid: solid, box: box, cutoutMesh: cutoutMesh,
    sheetTexture: sheetTexture, applyLayer: applyLayer, placeCard: placeCard, applySurface: applySurface, applyPlan: applyPlan,
    quietCanvas: quietCanvas, unstainCanvas: unstainCanvas, sillCanvas: sillCanvas, wornCanvas: wornCanvas,
    setTint: setTint, resize: resize, stats: stats,
    from: from, reveal: reveal, travel: travel, savePlace: savePlace, readPlace: readPlace,
    CORRIDOR: CORRIDOR, buildCorridor: buildCorridor, mountInHole: mountInHole, corridorInHole: corridorInHole };
  for (var k in names) F[k] = names[k];
  return F;
};
})();
