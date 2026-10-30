/* castle.js: the frame every room's page shares (8 October 2026). Each page loads three.js, then this file, then
   calls castleFrame(opts) once at the top of its own script and unpacks what it uses into local names, so its own
   code reads as it did when each page carried a copy. A page keeps its own manifest (LAYERS), sources and decisions
   log, its scene, its camera's moves and its per-frame loop; what is here is what every room does the same way.

   opts:
     shadows     true for soft shadow maps; boxes and cutouts then cast and receive (the common room); default off
     background  the clear colour and the fog's, as an sRGB hex; fog is the FogExp2 density
     tintFor     function (mesh) giving a mesh's colour under the Layers button; default TINTS[its layer]
     onAct       function (act) for the page's own buttons; Layers, Res, Exp and ? are handled here
     zoom        { max } for the pinch, double tap and wheel zoom (default 3), or false for none; F.zoom at run time
   set on the returned frame before any drawing loads:
     F.eye        the camera's resting position, about which placeCard scales a drawing made in perspective
     F.bentPlane  function (w, h) for a layer with bend: true (the round wall's radius is the page's)
     F.onSurface  function (id, texture, color), called after a surface's drawing is applied
   and called by the page from inside each of its taps:
     F.tapped     (acted) whether the tap did anything; one that did nothing gets the frame's mote (req 149)
   and, for the Omnioculars once his pair is held (req 147): F.zoom.held(fn), F.zoom.hidden(fn), F.zoom.shown(map),
   and F.zoom.slow(), the dial's factor for the dt of what moves by itself */
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
  function flameTexture(blue) {   /* blue: a ghost's flame, for the torches' cues (req 131) */
    var c = makeCanvas(128, 128), g = c.getContext('2d'), k = 58 / 40;
    g.setTransform(1, 0, 0, k, 0, 72 - 72 * k);
    var grd = g.createRadialGradient(64, 72 + 16 / k, 3, 64, 72, 40);
    grd.addColorStop(0, blue ? 'rgba(235,245,255,1)' : 'rgba(255,255,230,1)');
    grd.addColorStop(0.25, blue ? 'rgba(130,180,255,0.9)' : 'rgba(255,200,110,0.9)');
    grd.addColorStop(0.55, blue ? 'rgba(50,100,255,0.45)' : 'rgba(255,110,30,0.45)');
    grd.addColorStop(1, blue ? 'rgba(20,40,255,0)' : 'rgba(255,60,0,0)');
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
    else if (act === 'help') { clearTimeout(helpFade); helpEl.style.opacity = ''; helpEl.hidden = !helpEl.hidden; }
    else if (opts.onAct) opts.onAct(act);
  });
  updateResLabel(); updateExpLabel();
  /* the help line (req 203; Godric, Q2, 12 October 2026, 2.47 pm, with his t1): it stays until his first look-drag, then
     fades by itself in about a second and never comes back in any room, as the Marauder's Map goes blank at "Mischief
     managed!" (PoA 10); one stored flag; the knobs' ? still shows it on request, and a drag fades it again */
  var DRAGGED = 'lumos.dragged', helpFade = null, helpDown = null;
  function stored(set) {
    try { if (set) localStorage.setItem(DRAGGED, '1'); return localStorage.getItem(DRAGGED) === '1'; } catch (err) { return !!set; }
  }
  function fadeHelp() {
    stored(true);
    if (helpEl.hidden || helpFade) return;
    helpEl.style.transition = 'opacity 1s'; helpEl.style.opacity = '0';
    helpFade = setTimeout(function () { helpFade = null; helpEl.hidden = true; helpEl.style.opacity = ''; }, 1000);
  }
  if (stored()) helpEl.hidden = true;
  canvas.addEventListener('pointerdown', function (e) { helpDown = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointermove', function (e) {
    if (helpDown && helpDown.id === e.pointerId && Math.abs(e.clientX - helpDown.x) + Math.abs(e.clientY - helpDown.y) > 12) { helpDown = null; fadeHelp(); }
  });
  canvas.addEventListener('pointerup', function () { helpDown = null; });
  canvas.addEventListener('pointercancel', function () { helpDown = null; });

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

  /* ---------- zoom, to look closer (req 122; Godric's yes, 11 October 2026, 8.34 pm) ----------
     A pinch, a double tap or the PC's wheel brings the view closer, the page's own camera untouched: the zoom is the
     camera's view offset, a window cut from the whole frame, so a page's fov, its moves and its taps (raycasts read
     the same projection) stay as they were. Zoomed in, a one-finger drag looks about inside the frame instead of
     turning the room, and a tap still taps. On for every page up to ZOOM_MAX; a page passes opts.zoom = { max } or
     false, and sets limits at a stop with F.zoom.setLimits(min, max). The zoom is plain (Godric's Q32, 8.53 pm: no
     rim); the first time on the device the saleswizard's line from GoF 7 shows, a hint of the Omnioculars, an item
     the boys will get later (Magic's).
     Look switch: ?zoom=2 (or ?zoom=2,fx,fy, the point to look at as fractions of the frame from its top left).
     Looking close (req 126 and 133, the Omnioculars earned by looking): held at LOOK_Z or closer for LOOK_HOLD_S with the
     view still, the thing at the middle of the view is looked at; a page names its things with F.zoom.look(mesh, name)
     (a name, or a function of the ray's hit for a drawing with several things in it) and hears each look with
     F.zoom.onLook(fn), passing it to the events runtime's lookClose. Only the nearest thing counts, so a wall hides
     what is behind it. Nothing seen changes: a look is not a tap and does nothing a tap does (the Interaction lane's
     docs/interaction-vocabulary.md). No names, no listener: nothing happens. */
  var ZOOM_MAX = 3, ZOOM_DOUBLE = 2.5, ZOOM_KEY = 'lumos.castle.omnioculars', LOOK_Z = 2, LOOK_HOLD_S = 1;
  var zOpt = opts.zoom === undefined ? {} : opts.zoom;
  var seen = null;   /* seen(point): nothing opaque between the eye and a point in the world, set in the zoom's closure */
  var markTap = null;   /* the page's word on its last tap, for the double tap (req 149) */
  var pairFrame = null;   /* the Omnioculars' replay, kept after each render (req 147) */
  var zoom = (function () {
    var on = zOpt !== false, zMin = 1, zMax = (zOpt && zOpt.max) || ZOOM_MAX;
    var z = 1, ox = 0, oy = 0, anim = null, listeners = [];
    var line = document.createElement('div');
    line.textContent = '“Omnioculars,” said the saleswizard eagerly. “You can replay action…slow everything down…”';
    line.style.cssText = 'position:fixed;left:50%;bottom:12%;transform:translateX(-50%);max-width:80%;text-align:center;' +
      'font:italic 17px Georgia,serif;color:#f1dfb0;text-shadow:0 1px 3px #000;pointer-events:none;opacity:0;transition:opacity 0.8s';
    canvas.insertAdjacentElement('afterend', line);
    var lineShown = false;
    try { lineShown = !!localStorage.getItem(ZOOM_KEY); } catch (err) {}

    /* the saleswizard's line (GoF 7) is set aside on every page (req 424; docs/ministry/set-aside.md): the Omnioculars
       do not exist in the boys' years; ?setaside shows it as it was (15 October 2026) */
    function hint() {
      if (!lineShown && z > 1.3 && /[?&]setaside(=|&|$)/.test(location.search)) {
        lineShown = true;
        try { localStorage.setItem(ZOOM_KEY, '1'); } catch (err) {}
        line.style.opacity = '1';
        setTimeout(function () { line.style.opacity = '0'; }, 5500);
      }
    }
    function apply() {
      ox = clamp(ox, 0, z - 1); oy = clamp(oy, 0, z - 1);
      if (z <= 1.0001) { z = 1; ox = oy = 0; camera.clearViewOffset(); }
      else { var a = camera.aspect; camera.setViewOffset(z * a, z, ox * a, oy, a, 1); }   /* setViewOffset sets the aspect from these, so they carry it */
      hint();
      for (var i = 0; i < listeners.length; i++) listeners[i](z);
      clearTimeout(lookTimer);
      if (z >= LOOK_Z - 0.001 && lookers.length) lookTimer = setTimeout(lookNow, LOOK_HOLD_S * 1000);
      if (pair) pair.moved();
    }
    /* the thing at the middle of the view, once the view has held still a second (every apply restarts the wait) */
    var lookers = [], lookTimer = null, lookRay = new THREE.Raycaster(), lookMid = new THREE.Vector2(0, 0);
    /* is a cut-out card clear where the ray met it? read from a small copy of its picture, made once per picture */
    var alphas = {};
    function clearAt(m, uv) {
      var t = m && m.alphaTest > 0 && m.map, im = t && t.image;
      if (!uv || !im || !im.width) return false;
      if (!alphas[t.uuid] || alphas[t.uuid].v !== t.version) {   /* again when the picture is redrawn */
        var s = Math.min(1, 256 / Math.max(im.width, im.height)), c = makeCanvas(Math.max(1, Math.round(im.width * s)), Math.max(1, Math.round(im.height * s)));
        var g = c.getContext('2d');
        try { g.drawImage(im, 0, 0, c.width, c.height); alphas[t.uuid] = { v: t.version, w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; }
        catch (err) { return false; }
      }
      var a = alphas[t.uuid], u = uv.clone();
      t.transformUv(u);   /* a sheet's cell: its repeat and offset */
      var x = clamp(Math.floor(u.x * a.w), 0, a.w - 1), y = clamp(Math.floor(u.y * a.h), 0, a.h - 1);   /* transformUv has flipped it to the picture's rows */
      return a.d[(y * a.w + x) * 4 + 3] / 255 < m.alphaTest;
    }
    /* the same test for a point: a page's torch in his view, say (req 131); the point's own card and sprites never hide it */
    seen = function (point) {
      camera.updateMatrixWorld();
      var eye = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld), dir = point.clone().sub(eye), far = dir.length() - 0.15;
      if (far <= 0) return true;
      lookRay.set(eye, dir.normalize()); lookRay.camera = camera; lookRay.far = far;   /* sprites need the camera */
      var hits = lookRay.intersectObjects(scene.children, true);
      lookRay.far = Infinity;
      for (var i = 0; i < hits.length; i++) {
        var o = hits[i].object, m = o.material, shown = true;
        for (var p = o; p; p = p.parent) if (!p.visible) shown = false;
        if (!o.isMesh || !shown || (m && (m.opacity === 0 || m.colorWrite === false || m.depthWrite === false))) continue;
        if (clearAt(m, hits[i].uv)) continue;
        return false;
      }
      return true;
    };
    /* the name of the thing at the middle of the view, or null: the nearest thing seen decides, named or not */
    function thingAtMiddle() {
      camera.updateMatrixWorld();
      lookRay.setFromCamera(lookMid, camera);   /* the view offset is in the projection, so the middle is the zoomed middle */
      var hits = lookRay.intersectObjects(scene.children, true);
      for (var i = 0; i < hits.length; i++) {
        var o = hits[i].object, shown = true;
        for (var p = o; p; p = p.parent) if (!p.visible) shown = false;
        var m = o.material;
        if (!o.isMesh || !shown || (m && (m.opacity === 0 || m.colorWrite === false || m.depthWrite === false))) continue;   /* hidden things, hit areas, glows and steam */
        if (clearAt(m, hits[i].uv)) continue;   /* a card's clear pixels, a window's glass in its frame */
        var name = null;
        for (p = o; p && name == null; p = p.parent) if (p.userData.look != null) name = typeof p.userData.look === 'function' ? p.userData.look(hits[i]) : p.userData.look;
        return name || null;
      }
      return null;
    }
    function lookNow() {
      if (z < LOOK_Z - 0.001 || n > 1) return;   /* not mid-pinch */
      var name = thingAtMiddle();
      if (name) { window.castleLooked = name; for (var k = 0; k < lookers.length; k++) lookers[k](name); }
    }
    /* zoom to nz keeping the point under the screen point (sx, sy), as fractions of the screen, where it is */
    function about(nz, sx, sy) {
      nz = clamp(nz, zMin, zMax);
      var fx = (ox + sx) / z, fy = (oy + sy) / z;
      z = nz; ox = fx * z - sx; oy = fy * z - sy;
      apply();
    }
    function animate(nz, sx, sy, dur) {
      var z0 = z, t0 = performance.now(), my = {};
      anim = my;
      (function step() {
        if (anim !== my) return;
        var t = clamp((performance.now() - t0) / (dur * 1000), 0, 1);
        about(lerp(z0, nz, easeInOut(t)), sx, sy);
        if (t < 1) requestAnimationFrame(step); else anim = null;
      })();
    }
    function frac(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    }

    /* the gestures, caught on the window before the page's own handlers on the canvas */
    var pts = {}, n = 0, pinch = null, pan = null, lastTap = null, synth = false;
    function cancelPage(id) {
      synth = true;
      try { canvas.dispatchEvent(new PointerEvent('pointercancel', { pointerId: id, bubbles: true })); } catch (err) {}
      synth = false;
    }
    function startPinch() {
      var ids = Object.keys(pts), a = pts[ids[0]], b = pts[ids[1]];
      var m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: z, fx: (ox + m.x) / z, fy: (oy + m.y) / z };
    }
    window.addEventListener('pointerdown', function (e) {
      if (!on || synth || e.target !== canvas) return;
      pts[e.pointerId] = frac(e); n++;
      if (n === 2 && !pinch) {
        anim = null;
        for (var id in pts) if (+id !== e.pointerId) cancelPage(+id);
        startPinch(); pan = null;
      }
      if (pinch) { e.stopPropagation(); e.preventDefault(); return; }
      pan = z > 1.01 ? { x: pts[e.pointerId].x, y: pts[e.pointerId].y, moved: false, id: e.pointerId } : null;
    }, true);
    window.addEventListener('pointermove', function (e) {
      if (!on || synth || !(e.pointerId in pts)) return;
      var p = frac(e), q = pts[e.pointerId];
      pts[e.pointerId] = p;
      if (pinch) {
        var ids = Object.keys(pts);
        if (ids.length === 2) {
          var a = pts[ids[0]], b = pts[ids[1]], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          z = clamp(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, zMin, zMax);
          ox = pinch.fx * z - m.x; oy = pinch.fy * z - m.y;
          apply();
        }
        e.stopPropagation(); return;
      }
      if (pan && pan.id === e.pointerId) {
        ox -= p.x - q.x; oy -= p.y - q.y; apply();
        if (Math.abs(p.x - pan.x) * canvas.clientWidth + Math.abs(p.y - pan.y) * canvas.clientHeight > 8) pan.moved = true;
        e.stopPropagation();
      }
    }, true);
    function lift(e) {
      if (!on || synth || !(e.pointerId in pts)) return;
      var p = pts[e.pointerId];
      delete pts[e.pointerId]; n = Math.max(0, n - 1);
      if (pinch) {
        e.stopPropagation();
        if (n === 0) { pinch = null; if (z < 1.12) animate(1, 0.5, 0.5, 0.25); }
        return;
      }
      if (pan && pan.id === e.pointerId) {
        var moved = pan.moved; pan = null;
        if (moved) { e.stopPropagation(); cancelPage(e.pointerId); lastTap = null; return; }
      }
      if (e.type !== 'pointerup') return;
      var now = performance.now();
      /* a double tap zooms only where its first tap did nothing (the vocabulary's §7, req 149): a first tap the page
         reported as acting (F.tapped(true)) went to a thing, so the second is an ordinary tap; unreported, as before */
      if (lastTap && !lastTap.acted && now - lastTap.t < 330 && Math.abs(p.x - lastTap.x) * canvas.clientWidth + Math.abs(p.y - lastTap.y) * canvas.clientHeight < 40) {
        lastTap = null;
        e.stopPropagation(); cancelPage(e.pointerId);
        if (z > 1.05) animate(zMin, p.x, p.y, 0.45);
        else animate(Math.min(ZOOM_DOUBLE, zMax), p.x, p.y, 0.45);
        return;
      }
      lastTap = { t: now, x: p.x, y: p.y, acted: false };
    }
    markTap = function (acted) { if (lastTap) lastTap.acted = !!acted; };
    window.addEventListener('pointerup', lift, true);
    window.addEventListener('pointercancel', lift, true);
    canvas.addEventListener('wheel', function (e) {
      if (!on) return;
      e.preventDefault();
      anim = null;
      var p = frac(e);
      about(z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p.x, p.y);
    }, { passive: false });

    /* ---------- the Omnioculars, once his pair is held (req 147; Magic's *The Omnioculars*, questions 3 and 4, Godric's
       option 1 each, 12 October 2026, 8.13 to 8.15 am) ----------
       Canon gives them three gifts, "replay action ... slow everything down ... a play-by-play breakdown" (GoF 7), all on
       the side of time and labels; what magic hides stays the spell's. Only once the page says the pair is his
       (F.zoom.held(fn), the runtime's `omni = held`), and only while he looks through it (zoomed in), so at rest the
       painting holds nothing but Back (the vocabulary's §5): two brass knobs bottom left, the dial and the replay.
       The breakdown: held still a moment on a thing, a small gold line names it, the page's word for it
       (F.zoom.shown({ name: word }); else the name itself); a thing the page says is hidden (F.zoom.hidden(fn), the
       runtime's marks, req 145) gives only a faint shimmer at the middle and "something here", which the spell opens.
       The dial: each tap turns its needle a notch, full, slow, slower, and back; the page multiplies the dt of what
       moves by itself by F.zoom.slow(), never its camera or the runtime's clock, so an owl or a sitter slows till he
       can see what he missed (GoF 8). Lowering the pair (back to no zoom) sets it to full again.
       The replay: while the pair is held the frame keeps the last REPLAY_S seconds of the screen, small, and the
       replay knob plays them over the room at the dial's speed, then fades; a tap ends it sooner. Only what this visit
       showed: the keeping starts again whenever the page is left or put away, so the changes between visits are only
       ever found, never replayed.
       Look switch: ?omni=1 holds the pair, for a shot. */
    var BREAK_Z = 1.3, BREAK_HOLD_S = 0.6, BREAK_SHOW_S = 2.6, DIAL = [1, 0.35, 0.12], DIAL_DEG = [55, 0, -55];
    var REPLAY_S = 4, REPLAY_FPS = 8, REPLAY_W = 480;
    var pair = (function () {
      var heldFn = null, hiddenFn = null, words = {}, forced = false;
      try { forced = new URLSearchParams(location.search).get('omni') === '1'; } catch (err) {}
      function held() { try { return forced || !!(heldFn && heldFn()); } catch (err) { return false; } }
      function looking() { return on && z > 1.05 && held(); }

      var css = document.createElement('style');
      css.textContent =
        '.omni-knob{position:fixed;bottom:18px;width:96px;height:96px;border-radius:50%;z-index:20;padding:0;cursor:pointer;' +
        'border:3px solid #5e4214;background:radial-gradient(circle at 38% 32%,#f6dc96 0,#c99a45 45%,#8a6424 100%);' +
        'box-shadow:0 3px 8px rgba(0,0,0,0.55),inset 0 0 0 6px rgba(94,66,20,0.35);touch-action:manipulation}' +
        '.omni-knob[hidden]{display:none}' +
        '.omni-needle{position:absolute;left:50%;bottom:50%;width:6px;margin-left:-3px;height:34px;border-radius:3px;' +
        'background:#3a2608;transform-origin:50% 100%;transition:transform 0.35s cubic-bezier(.3,1.6,.5,1)}' +
        '.omni-hub{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#3a2608}' +
        '.omni-tick{position:absolute;left:50%;top:9px;width:4px;height:10px;margin-left:-2px;background:#5e4214;transform-origin:50% 39px}' +
        '@keyframes omni-shimmer{0%{opacity:0;transform:scale(0.7)}30%{opacity:0.55}60%{opacity:0.3;transform:scale(1.15)}100%{opacity:0;transform:scale(1.4)}}' +
        '.omni-shimmer{position:fixed;left:50%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;pointer-events:none;' +
        'z-index:6;mix-blend-mode:screen;background:radial-gradient(circle,rgba(255,240,190,0.7) 0,rgba(255,215,120,0.25) 35%,rgba(255,200,90,0) 70%);' +
        'animation:omni-shimmer 1.4s ease-in-out 2}';
      document.head.appendChild(css);

      /* the breakdown's line, gold, near the top */
      var line = document.createElement('div');
      line.style.cssText = 'position:fixed;left:50%;top:12%;transform:translateX(-50%);max-width:80%;text-align:center;z-index:8;' +
        'font:600 24px Georgia,serif;letter-spacing:0.04em;color:#f3cf6e;text-shadow:0 1px 2px #000,0 0 10px rgba(0,0,0,0.6);' +
        'pointer-events:none;opacity:0;transition:opacity 0.5s';
      canvas.insertAdjacentElement('afterend', line);
      var breakTimer = null, lineTimer = null, last = { name: null, t: 0 };
      function say(text, faint) {
        line.textContent = text;
        line.style.fontStyle = faint ? 'italic' : 'normal';
        line.style.fontWeight = faint ? '400' : '600';
        line.style.opacity = faint ? '0.6' : '1';
        clearTimeout(lineTimer);
        lineTimer = setTimeout(function () { line.style.opacity = '0'; }, BREAK_SHOW_S * 1000);
      }
      function shimmer() {
        var d = document.createElement('div');
        d.className = 'omni-shimmer';
        canvas.insertAdjacentElement('afterend', d);
        setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 3000);
      }
      function wordFor(name) {
        if (words[name]) return words[name];
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
      function breakNow() {
        if (!looking() || z < BREAK_Z || n > 1 || playing) return;
        var name = thingAtMiddle(), now = performance.now();
        if (!name) return;
        if (name === last.name && now - last.t < 5000) return;   /* the same thing again, still fresh */
        last = { name: name, t: now };
        var hid = false;
        try { hid = !!(hiddenFn && hiddenFn(name)); } catch (err) {}
        window.castleBreakdown = hid ? 'something here' : wordFor(name);
        if (hid) { say('something here', true); shimmer(); }
        else say(wordFor(name));
      }

      /* the two knobs */
      var dial = document.createElement('button'), dialI = 0, needle = document.createElement('div');
      dial.className = 'omni-knob'; dial.setAttribute('aria-label', 'Slow'); dial.style.left = '18px'; dial.hidden = true;
      DIAL_DEG.forEach(function (deg) { var t = document.createElement('div'); t.className = 'omni-tick'; t.style.transform = 'rotate(' + deg + 'deg)'; dial.appendChild(t); });
      needle.className = 'omni-needle'; dial.appendChild(needle);
      var hub = document.createElement('div'); hub.className = 'omni-hub'; dial.appendChild(hub);
      function setDial(i) { dialI = i; needle.style.transform = 'rotate(' + DIAL_DEG[i] + 'deg)'; window.castleDial = DIAL[i]; }
      setDial(0);
      dial.addEventListener('click', function (e) { e.stopPropagation(); setDial((dialI + 1) % DIAL.length); });

      var rep = document.createElement('button');
      rep.className = 'omni-knob'; rep.setAttribute('aria-label', 'Replay'); rep.style.left = '128px'; rep.hidden = true;
      rep.innerHTML = '<svg viewBox="0 0 48 48" width="56" height="56" style="display:block;margin:auto"><path d="M33 14a14 14 0 1 1-17 2" ' +
        'fill="none" stroke="#3a2608" stroke-width="5" stroke-linecap="round"/><path d="M9 9l8 2-2 9z" fill="#3a2608"/></svg>';
      rep.addEventListener('click', function (e) { e.stopPropagation(); replay(); });
      document.body.appendChild(dial); document.body.appendChild(rep);

      function moved() {
        var show = looking() && n < 2;
        dial.hidden = rep.hidden = !show;
        if (show) helpEl.hidden = true;   /* the first help sits where the knobs do */
        if (!(on && z > 1.05)) { if (dialI) setDial(0); last.name = null; }
        clearTimeout(breakTimer);
        if (show && z >= BREAK_Z) breakTimer = setTimeout(breakNow, BREAK_HOLD_S * 1000);
      }

      /* the replay: the last seconds kept small, after each render, while the pair is held */
      var N = REPLAY_S * REPLAY_FPS, ring = [], at = 0, kept = 0, since = 0, playing = null;
      var screen = document.createElement('canvas');
      screen.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:7;opacity:0;pointer-events:none;' +
        'filter:sepia(0.35) saturate(0.9);transition:opacity 0.35s';
      canvas.insertAdjacentElement('afterend', screen);
      function forget() { kept = 0; at = 0; since = 0; }
      document.addEventListener('visibilitychange', function () { if (document.hidden) forget(); });
      window.addEventListener('pagehide', forget);
      function frame(dt) {
        if (playing || !held()) { if (!playing) kept = 0; return; }
        since += dt;
        if (since < 1 / REPLAY_FPS) return;
        since = 0;
        var cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (!cw || !ch) return;
        var w = Math.min(REPLAY_W, cw), h = Math.max(1, Math.round(w * ch / cw)), slot = ring[at];
        if (!slot || slot.width !== w || slot.height !== h) slot = ring[at] = makeCanvas(w, h);
        try { slot.getContext('2d').drawImage(canvas, 0, 0, w, h); } catch (err) { return; }
        at = (at + 1) % N; kept = Math.min(N, kept + 1);
      }
      function replay() {
        if (playing || kept < 2) return;
        var frames = [];
        for (var k = 0; k < kept; k++) frames.push(ring[(at - kept + k + N) % N]);
        screen.width = frames[0].width; screen.height = frames[0].height;
        var g = screen.getContext('2d'), my = { t: 0, i: -1, frames: frames }, t0 = performance.now();
        playing = my; window.castleReplaying = true;
        say('Replay', true);   /* "replay action" (GoF 7) */
        screen.style.opacity = '1'; screen.style.pointerEvents = 'auto';
        (function step() {
          if (playing !== my) return;
          var now = performance.now();
          my.t += (now - t0) / 1000 * DIAL[dialI]; t0 = now;
          var i = Math.floor(my.t * REPLAY_FPS);
          if (i >= frames.length) { stop(); return; }
          if (i !== my.i) { my.i = i; g.drawImage(frames[i], 0, 0); }
          requestAnimationFrame(step);
        })();
      }
      function stop() {
        playing = null; window.castleReplaying = false;
        screen.style.opacity = '0'; screen.style.pointerEvents = 'none';
        forget();   /* what follows is kept afresh */
      }
      screen.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); stop(); });

      return {
        held: function (fn) { heldFn = fn; moved(); },
        hidden: function (fn) { hiddenFn = fn; },
        shown: function (map) { for (var k in map) words[k] = map[k]; },
        slow: function () { return looking() ? DIAL[dialI] : 1; },
        moved: moved, frame: frame, replay: replay,
        isHeld: held, kept: function () { return kept; }
      };
    })();
    pairFrame = pair.frame;

    var api = {
      level: function () { return z; },
      set: function (nz, fx, fy, dur) {
        /* look at the frame's point (fx, fy) at nz; dur in seconds, 0 or none at once */
        nz = clamp(nz, zMin, zMax);
        if (fx == null) { fx = (ox + 0.5) / z; fy = (oy + 0.5) / z; }
        var tx = fx * nz - 0.5, ty = fy * nz - 0.5;
        anim = null;
        if (!dur) { z = nz; ox = tx; oy = ty; apply(); return; }
        /* the point slides to the middle as it closes in */
        var z0 = z, ox0 = ox, oy0 = oy, t0 = performance.now(), my = {};
        anim = my;
        (function step() {
          if (anim !== my) return;
          var t = easeInOut(clamp((performance.now() - t0) / (dur * 1000), 0, 1));
          z = lerp(z0, nz, t); ox = lerp(ox0, tx, t); oy = lerp(oy0, ty, t); apply();
          if (t < 1) requestAnimationFrame(step); else anim = null;
        })();
      },
      reset: function (dur) { if (dur) animate(1, 0.5, 0.5, dur); else { anim = null; z = 1; apply(); } },
      setLimits: function (min, max) { zMin = Math.max(1, min || 1); zMax = Math.max(zMin, max || ZOOM_MAX); about(z, 0.5, 0.5); },
      enable: function (yes) { on = !!yes; if (!on) api.reset(); },
      onChange: function (fn) { listeners.push(fn); },
      /* name a thing for looking close (a lower-case name, one per thing across every page, or a function of the hit) */
      look: function (mesh, name) { mesh.userData.look = name; return mesh; },
      onLook: function (fn) { lookers.push(fn); },
      /* the Omnioculars (req 147): whether the pair is his, which names are hidden, the words the breakdown shows,
         and the dial's factor for the dt of what moves by itself */
      held: pair.held, hidden: pair.hidden, shown: pair.shown, slow: pair.slow, replay: pair.replay
    };
    try {
      var zs = new URLSearchParams(location.search).get('zoom');
      if (zs && on) { var zp = zs.split(',').map(Number); api.set(zp[0] || 1, zp.length > 2 ? zp[1] : 0.5, zp.length > 2 ? zp[2] : 0.5); }
    } catch (err) {}
    window.castleZoom = api;
    return api;
  })();

  /* ---------- every tap answers, and one Back (req 149) ----------
     The Interaction lane's vocabulary (docs/interaction-vocabulary.md, adopted by Godric, 12 October 2026, Q1 and Q1b).
     §3: a page tells the frame what each of its taps did, F.tapped(acted), from inside its own tap handler (the lift
     that made it is the point, or pass x, y); a tap that found nothing gets a mote of warm wand-light where the finger
     lifted, gone in half a second, a tiny Lumos (his touch t1), the same in every room. At a stop a tap on nothing goes
     back, so the page reports it as acting. A page that reports nothing gets no mote, and its double tap is as it was.
     §7: a double tap zooms only where its first tap did nothing (the zoom's lift reads the same word).
     §5: one Back token, kit.backBtn, bottom right, the word the page gives it: at least 2 cm square to the finger on the
     iPad and the phone. 2 cm is 104 CSS px on an 11-inch iPad (1180 x 820 points at 264 ppi, 2x: 132 per inch) and
     121 on a 390 x 844 iPhone (460 ppi, 3x: 153 per inch), so the token is 124 px wide and 60 tall, and a clear
     reach above it makes its target 124 square. Rule 4 builds nothing here: no glint, no quiet clock (Q1b).
     Look switch: ?mote=3 holds each mote three seconds, for a shot. */
  var MOTE_S = 0.5, lift = null, motes = 0;
  try { var ms = parseFloat(new URLSearchParams(location.search).get('mote')); if (ms > 0) MOTE_S = ms; } catch (err) {}
  window.addEventListener('pointerup', function (e) { if (e.target === canvas) lift = { x: e.clientX, y: e.clientY }; }, true);
  var WAND_LIGHT = 'radial-gradient(circle,rgba(255,252,236,1) 0,rgba(255,226,150,0.9) 16%,rgba(255,184,84,0.45) 38%,rgba(255,160,60,0) 70%)';
  function mote(x, y, look, z) {
    var d = document.createElement('div'), s = 36;
    d.className = 'castle-mote';
    d.style.cssText = 'position:fixed;left:' + (x - s / 2) + 'px;top:' + (y - s / 2) + 'px;width:' + s + 'px;height:' + s + 'px;' +
      'border-radius:50%;pointer-events:none;mix-blend-mode:screen;z-index:' + (z || 5) + ';background:' + (look || WAND_LIGHT);
    canvas.insertAdjacentElement('afterend', d);
    if (!z) motes++;   /* a spark (z above the offer) is counted by castleSparks, not here */
    var gone = function () { if (d.parentNode) d.parentNode.removeChild(d); };
    if (d.animate) {
      d.animate([
        { opacity: 0, transform: 'scale(0.35)' },
        { opacity: 1, transform: 'scale(1)', offset: 0.15 },
        { opacity: 0.85, transform: 'scale(1.1)', offset: 0.5 },
        { opacity: 0, transform: 'scale(1.3)' }
      ], { duration: MOTE_S * 1000, easing: 'ease-out', fill: 'forwards' }).onfinish = gone;
    } else setTimeout(gone, MOTE_S * 1000);
  }
  /* a stray tap while a spell's offer waits (req 229; the vocabulary's §9, A stray tap while an offer waits; Godric, Q4,
     13 October 2026, 7.13 am, option 4.1 with his touch t1): one spark where his finger lifted, the mote's size and half
     second, in his house's colour, one tiny spark of the "red and gold sparks" of Ollivander's (PS 5), the bright one at
     its heart; with no house, the mote's warm wand-light. Above the offer's own layer, so it shows over it. It reports
     nothing to markTap and changes nothing else; the house is the runtime's castle.house(), passed in by the room */
  var HOUSE_SPARK = {
    lion: ['255,236,200', '214,40,40', '242,184,48'],      /* scarlet and gold */
    snake: ['236,255,240', '40,150,90', '200,208,216'],    /* green and silver */
    badger: ['255,250,220', '250,214,60', '236,176,30'],   /* yellow */
    eagle: ['236,244,255', '60,110,220', '196,132,70']     /* blue and bronze */
  };
  var sparks = 0;
  function spark(x, y, house) {
    var c = HOUSE_SPARK[house];
    sparks++;
    mote(x, y, c ? 'radial-gradient(circle,rgba(' + c[0] + ',1) 0,rgba(' + c[1] + ',0.95) 18%,rgba(' + c[2] + ',0.55) 40%,rgba(' + c[2] + ',0) 70%)' : null, 2147483001);
  }
  window.castleSparks = function () { return sparks; };
  function tapped(acted, x, y) {
    if (markTap) markTap(acted);
    if (acted) return;
    if (x == null) { if (!lift) return; x = lift.x; y = lift.y; }
    mote(x, y);
  }
  window.castleMotes = function () { return motes; };
  if (backBtn) {
    backBtn.style.minWidth = '124px'; backBtn.style.minHeight = '60px'; backBtn.style.fontSize = '18px';
    backBtn.classList.add('castle-back');
    var reach = document.createElement('style');
    reach.textContent = '#back.castle-back::after{content:"";position:absolute;left:0;right:0;bottom:0;top:-64px}';
    document.head.appendChild(reach);
  }

  /* the fps line: call once a frame, after rendering, with the frame's dt */
  var fpsN = 0, fpsT = 0;
  function stats(dt) {
    if (pairFrame) pairFrame(dt);   /* right after the render, while the frame is still drawn */
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
      /* the outer wall 0.45 m thick (the Placement check, 5.08 pm); splay[0] on the stair side, splay[1] on her side.
         Each window an arched embrasure centred on its light, the common room's 13 degree splay the same each side, the
         head round and concentric with the glass's (Godric's Try 1 on architect-windows-1015, 15 October 2026, 5.46 pm;
         the Architect's model v29, corridor-window-1 and -2; req 469): Q22's glimpse from the stair head given up */
      /* v16 (req 1807, the Architect's model v254, Godric's 1 on req 1812, 30 October 2026): each window a pair of P3 lancets,
         the lake wall 0.8 thick with the glass 0.15 in from its outer face, so the embrasure is 0.65 deep and 1.5 wide all
         the way back, its cheeks square (v255, Godric's 5.09 pm note; `splays` is now the 0.15 the screen's face returns each side); the two lights 0.45 wide either side of a 0.30 pier (`lights`, x about the window's centre),
         sill 0.9, springing 2.45, apex 2.92 (h 2.02); an equilateral pointed rere-arch springing 2.6 over the embrasure's
         1.5 at the room's face; a stone seat across the embrasure at 0.45, the glass's sill a step up at 0.9 */
      WINDOW: { w: 1.2, h: 2.02, sill: 0.9, deep: 0.65, seat: 0.45, spring: 2.45, rere: 2.6, lights: [[-0.6, -0.15], [0.15, 0.6]],
        xs: [-2.5, -4.6], splays: [[0.15, 0.15], [0.15, 0.15]] },
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
      /* the pair either side of the painting opposite, and a third on the strip of outer wall the open hole sees, the one
         Nick's passing dips blue (Godric, the Corridor's Q25, option 1, 10 October 2026, 11.19 pm; req 111, req 85) */
      torches: [{ x: 0.9, y: 1.3, z: C.FAR_Z }, { x: 2.1, y: 1.3, z: C.FAR_Z }, { x: -0.5, y: 1.3, z: C.FAR_Z }],
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

  /* the corridor's torches answering a ghost (req 131; Magic for the boys, *The leaning torch*, Godric, 11 October 2026,
     9.57 pm): two cues, Events' words (req 132) in each page's own cue map, answered the same by every page that shows a
     corridor torch, the corridor and the common room's open hole. The lean: one flame leans over and dips blue for a moment, as the torch
     beside the hole does for Nick, then burns gold again. His deathday: every corridor torch burns bright blue for a
     minute (31 October; CoS 8, the tapers "all burning bright blue"). A page makes one with F.torchCues(), calls lean(i)
     or deathday() on the cue (last() is the torch that leaned last, so a page never picks it twice running), and each
     frame, after its own flicker, dress(i, flame, light) on each torch. When they come is the record's, never by night. */
  function torchCues() {
    var LEAN_S = 2.6, MINUTE_S = 60, RAMP_S = 2.5;
    var gold = col(0xffb060), white = col(0xffffff), blueTex = null;   /* the gold is the flames' own */
    var lightGold = col(0xffc080), lightBlue = col(0x7aa8ff);
    var leans = {}, last = -1, day0 = -1;
    function now() { return performance.now() / 1000; }
    return {
      lean: function (i, side) { leans[i] = { t0: now(), side: side || 1 }; last = i; },
      last: function () { return last; },
      deathday: function () { day0 = now(); },
      busy: function () { return day0 >= 0 || Object.keys(leans).length > 0; },
      dress: function (i, flame, light) {
        var t = now(), l = leans[i], lean = 0, deepK = 0;
        if (l) {
          var k = (t - l.t0) / LEAN_S;
          if (k >= 1) { delete leans[i]; flame.material.rotation = 0; }
          else lean = Math.sin(Math.PI * k);   /* over and back upright */
        }
        if (day0 >= 0) {
          var b = t - day0;
          if (b >= MINUTE_S) day0 = -1;
          else deepK = Math.max(0, Math.min(1, b / RAMP_S, (MINUTE_S - b) / RAMP_S));
        }
        var blue = Math.min(1, 1.5 * lean), bk = Math.max(blue, deepK), fm = flame.material;
        /* the gold flame sinks and a blue one rises in its place: it dips, then burns blue */
        if (!fm.userData.goldMap) fm.userData.goldMap = fm.map;
        if (bk > 0.5) { blueTex = blueTex || flameTexture(true); fm.map = blueTex; fm.color.copy(white).multiplyScalar(2 * bk - 1); }
        else { fm.map = fm.userData.goldMap; fm.color.copy(gold).multiplyScalar(1 - 2 * bk); }
        if (lean > 0) {
          flame.material.rotation = l.side * 0.85 * lean;
          flame.scale.x *= 1 + 0.25 * lean; flame.scale.y *= 1 - 0.3 * lean;
        }
        if (deepK > 0) { flame.scale.x *= 1 + 0.15 * deepK; flame.scale.y *= 1 + 0.3 * deepK; }
        if (light) {
          light.color.copy(lightGold).lerp(lightBlue, Math.max(0.6 * blue, deepK));
          light.intensity *= (1 - 0.35 * blue) * (1 + 0.25 * deepK);
        }
      }
    };
  }

  /* one window's outline, from the bottom of one jamb round the head to the bottom of the other: a round head of half
     width r centred on x, springing at ys, the jambs down to yb; n points on the head */
  function windowOutline(x, r, ys, yb, n) {
    var pts = [new THREE.Vector2(x - r, yb)];
    for (var i = 0; i <= n; i++) { var a = Math.PI - Math.PI * i / n; pts.push(new THREE.Vector2(x + r * Math.cos(a), ys + r * Math.sin(a))); }
    pts.push(new THREE.Vector2(x + r, yb));
    return pts;
  }
  /* v16: the same from the bottom of one jamb to the bottom of the other, but the head an equilateral point: each arc
     struck from the opposite springing, radius the whole span, hw the half span; n points on each arc */
  function pointedOutline(x, hw, ys, yb, n) {
    var R = 2 * hw, pts = [new THREE.Vector2(x - hw, yb)];
    for (var i = 0; i <= n; i++) { var a = Math.PI - (Math.PI / 3) * i / n; pts.push(new THREE.Vector2(x + hw + R * Math.cos(a), ys + R * Math.sin(a))); }
    for (var j = 0; j <= n; j++) { var b = Math.PI / 3 - (Math.PI / 3) * j / n; pts.push(new THREE.Vector2(x - hw + R * Math.cos(b), ys + R * Math.sin(b))); }
    pts.push(new THREE.Vector2(x + hw, yb));
    return pts;
  }
  /* v16: one lancet light's outline in window coordinates (x across, y up from the floor): the jambs from the sill to the
     springing, the head two arcs struck on the springing line to the apex (the shell's `lights`, the same curve) */
  function lancetPts(l0, l1, sill, spring, apex, n) {
    var wl = l1 - l0, RI = apex - spring, R = (wl * wl / 4 + RI * RI) / wl, th = Math.atan2(RI, R - wl / 2), pts = [[l0, sill], [l1, sill], [l1, spring]];
    for (var i = 1; i <= n; i++) { var a = th * i / n; pts.push([l1 - R + R * Math.cos(a), spring + R * Math.sin(a)]); }
    for (var j = 0; j <= n; j++) { var b = Math.PI - th + th * j / n; pts.push([l0 + R + R * Math.cos(b), spring + R * Math.sin(b)]); }
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
    var r = W.w / 2, N = 24, apex = W.sill + W.h;
    var outlines = W.xs.map(function (wx, i) {
      var s = W.splays[i], ri = r + (s[0] + s[1]) / 2, xi = wx + (s[1] - s[0]) / 2;
      /* the cut at the room's face: the seat to the rere-arch; the cheeks run square straight back to the screen at the glass (the Architect's model v255, Godric's 5.09 pm note: 1.5 wide all the way), the sill's step to the same springing */
      return { x: wx, inner: pointedOutline(xi, ri, W.rere, W.seat, N), outer: pointedOutline(wx, ri, W.rere, W.sill, N), splay: s };
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
    /* the windows themselves, at the back of each reveal: the sky behind the glass, the leaded lights in it (a lattice of
       diamond quarries, no wooden frame), a screen of stone at the glass with the two lancets cut through it and the pier
       between, and the seat across the embrasure with the glass's sill a step up (req 1807, model v254) */
    function lancetsOn(g, w, h, wl) {   /* the pair's lights traced on a canvas whose x spans the window's width and y its h, from the sill */
      W.lights.forEach(function (lt) {
        var pts = lancetPts(lt[0], lt[1], W.sill, W.spring, apex, 14);
        g.beginPath();
        pts.forEach(function (q, k) { var cx = (q[0] + W.w / 2) / W.w * w, cy = (apex - q[1]) / W.h * h; if (k) g.lineTo(cx, cy); else g.moveTo(cx, cy); });
        g.closePath(); wl(g);
      });
    }
    function frameTexture(name) {
      return cutoutTexture(240, 480, '#8e8a84', function (g, w, h) {
        g.clearRect(0, 0, w, h);
        g.strokeStyle = '#8e8a84'; g.fillStyle = 'rgba(0,0,0,0)';
        lancetsOn(g, w, h, function (g2) {
          g2.save(); g2.clip();
          g2.lineWidth = 2; g2.globalAlpha = 0.55;       /* the leading: diamond quarries, 6 cm across */
          for (var k = -40; k < 80; k++) {
            g2.beginPath(); g2.moveTo(k * 12, 0); g2.lineTo(k * 12 + h * 0.45, h); g2.moveTo(k * 12 + h * 0.45, 0); g2.lineTo(k * 12, h); g2.stroke();
          }
          g2.restore(); g2.globalAlpha = 1; g2.lineWidth = 5; g2.stroke();   /* the lead round each light */
        });
      }, /[?&]labels(=|&|$)/.test(location.search) ? name : null);
    }
    out.frameTexture = frameTexture;
    outlines.forEach(function (ol, i) {
      var name = i ? 'window' : 'window-2', wx = ol.x;
      var sky = cutoutMesh(cutoutTexture(120, 240, '#c9d6e2', function (g, w, h) { g.fillRect(0, 0, w, h); }), W.w, W.h);
      sky.material = new THREE.MeshBasicMaterial({ map: sky.material.map, alphaTest: 0.5, color: col(0xdfe8f0) });
      sky.position.set(wx, W.sill + W.h / 2, C.GLASS_Z + 0.005);
      add(sky, name + '-sky', 3);
      var frame = cutoutMesh(frameTexture(name), W.w, W.h);   /* its name only for a test (?labels), never for the boy */
      frame.position.set(wx, W.sill + W.h / 2, C.GLASS_Z + 0.01);
      add(frame, name, 1);
      /* the screen: stone across the glass's plane from the lights' outer jambs up to the rere-arch's head, the two lancets
         cut through it, 2 cm deep so the sky, the view and the weather's panes (all within 1 cm of the glass) stand behind it */
      var sc = new THREE.Shape(), ri = r + (ol.splay[0] + ol.splay[1]) / 2, ow = ri + 0.05, pts = pointedOutline(0, ri, W.rere, W.sill - 0.05, 24);
      sc.moveTo(-ow, W.sill - 0.05); sc.lineTo(-ow, W.rere);
      pts.slice(1, -1).forEach(function (q) { sc.lineTo(q.x, q.y); });
      sc.lineTo(ow, W.rere); sc.lineTo(ow, W.sill - 0.05); sc.lineTo(-ow, W.sill - 0.05);
      W.lights.forEach(function (lt) {
        var lp = lancetPts(lt[0], lt[1], W.sill, W.spring, apex, 14), ho = new THREE.Path();
        lp.forEach(function (q, k) { if (k) ho.lineTo(q[0], q[1]); else ho.moveTo(q[0], q[1]); });
        sc.holes.push(ho);
      });
      var scr = new THREE.Mesh(new THREE.ExtrudeGeometry(sc, { depth: 0.02, bevelEnabled: false, curveSegments: 1 }), wallMat);
      scr.position.set(wx, 0, C.GLASS_Z); add(scr, name + '-screen', 1);
      var s = ol.splay, sh = new THREE.Shape();      /* the seat's plan, v = -z: back at the glass, front 5 cm proud */
      sh.moveTo(wx - ri, -C.GLASS_Z); sh.lineTo(wx + ri, -C.GLASS_Z);
      sh.lineTo(wx + ri, -(C.FAR_Z + 0.05)); sh.lineTo(wx - ri, -(C.FAR_Z + 0.05));
      sh.lineTo(wx - ri, -C.GLASS_Z);
      var sg = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
      var sill = new THREE.Mesh(sg, sillMat);
      sill.rotation.x = -Math.PI / 2; sill.position.y = W.seat - 0.03;
      add(sill, name + '-sill', 1);
      sill.userData.front = C.FAR_Z + 0.05;
      /* the step up to the glass's sill at 0.9, 0.2 deep, as wide as the lights */
      var step = new THREE.Mesh(new THREE.BoxGeometry(ri * 2, W.sill - W.seat + 0.03, 0.2), sillMat);
      step.position.set(wx, (W.sill + W.seat - 0.03) / 2, C.GLASS_Z + 0.1); add(step, name + '-step', 1);
      out.windows.push({ x: wx, name: name, frame: frame, sky: sky, sill: sill, step: step, screen: scr, reveal: ol.reveal });
    });

    /* the long wall, the door's opening at x 0 and the inglenook's mouth under its lintel */
    var herShape = rect(C.FAR_END_X, y0, C.END_X, y1);
    herShape.holes.push(holeOf([new THREE.Vector2(C.DOOR.x - C.DOOR.w / 2, 0), new THREE.Vector2(C.DOOR.x + C.DOOR.w / 2, 0), new THREE.Vector2(C.DOOR.x + C.DOOR.w / 2, C.DOOR.h), new THREE.Vector2(C.DOOR.x - C.DOOR.w / 2, C.DOOR.h)]));
    /* the mouth cut from a little below the floor, so the wall's own sill face lies under the nook's flags instead of in
       their plane, where the two flickered on the phone (Godric's shot, 20 October 2026, 7.23 am) */
    herShape.holes.push(holeOf([new THREE.Vector2(C.NOOK_X1, -0.05), new THREE.Vector2(C.NOOK_X0, -0.05), new THREE.Vector2(C.NOOK_X0, C.NOOK_H), new THREE.Vector2(C.NOOK_X1, C.NOOK_H)]));
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
    setTint: setTint, resize: resize, stats: stats, zoom: zoom, seen: function (p) { return seen(p); }, torchCues: torchCues, tapped: tapped, spark: spark,
    from: from, reveal: reveal, travel: travel, savePlace: savePlace, readPlace: readPlace,
    CORRIDOR: CORRIDOR, buildCorridor: buildCorridor, mountInHole: mountInHole, corridorInHole: corridorInHole };
  for (var k in names) F[k] = names[k];
  return F;
};
})();
