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
          var weight = wa === undefined ? 1 : wa + (wb - wa) * f;
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

  var names = { helpEl: helpEl, canvas: canvas, statsEl: statsEl, backBtn: backBtn, btns: btns,
    clamp: clamp, lerp: lerp, easeInOut: easeInOut, col: col,
    renderer: renderer, scene: scene, camera: camera,
    makeCanvas: makeCanvas, tex: tex, rr: rr, arch: arch, label: label, cutoutTexture: cutoutTexture, flameTexture: flameTexture,
    layered: layered, TINTS: TINTS, register: register, solid: solid, box: box, cutoutMesh: cutoutMesh,
    sheetTexture: sheetTexture, applyLayer: applyLayer, placeCard: placeCard, applySurface: applySurface, applyPlan: applyPlan,
    quietCanvas: quietCanvas, unstainCanvas: unstainCanvas, sillCanvas: sillCanvas, wornCanvas: wornCanvas,
    setTint: setTint, resize: resize, stats: stats };
  for (var k in names) F[k] = names[k];
  return F;
};
})();
