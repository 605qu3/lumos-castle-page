/* knight.js: the armour gallery's mounted Gothic knight (req 1096; Godric's 1 on corridor-knight-1026, 26 October 2026,
   6.50 pm, with his note "it needs to not be floating"), the drawing assets/layers/mounted-gothic-knight.png (round 1
   candidate 1, 1.29 by 2.79 m) stood as one card, square to the aisle, as the boys meet him head on.

   Not floating: the drawing is the horse seen from the front, so its hind hooves sit 0.14 m above its front hooves in
   the picture (they are 1.9 m further back). The card's foot is the front hooves' line, on the plinth; under the hind
   hooves a shadow lies on the plinth top where the eye at a boy's height reads them standing (0.2 m behind the card from
   1.4 m away, 0.6 m from 4 m: drawn from 0.2 to 0.9), and a soft shadow lies under the whole body, 2.3 m long, so the
   horse has weight on the stone from any way down the aisle. Every shadow 8 mm over the stone (board rule 6).

   CastleKnight.make(THREE, renderer, opts)  opts { src (default '../assets/layers/mounted-gothic-knight.png') }.
       Returns { group, mat, light(k) }: the group's origin is on the plinth top under the middle of the front hooves,
       facing +z (the way he looks); the card stands at z 0 and the body's shadow runs back to z -2.3, so on the
       gallery's plinth (y 66.6 to 69.4) the origin goes at about y 66.95, facing south. light(k): k 0 by day to 1 at
       full night, the drawing dimmed and warmed toward the torches, as the suits are. The page adds and places it. */
(function () {
  'use strict';
  var W = 1.29, H = 2.79, PXM = 1072 / W;              /* the staged drawing, 1072 by 2321 px */
  var HORSE_X = 615;                                     /* the front hooves' middle, px from the drawing's left */
  /* the hooves on the drawing, px: [x middle, bottom]; front at the foot, hind 120 px (0.14 m) up */
  var FRONT = [[475, 2310], [755, 2310]], HIND = [[412, 2190], [665, 2190]];
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function shade(THREE, renderer, a) {
    var c = canvas(64, 64), g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 4, 32, 32, 32);
    grd.addColorStop(0, 'rgba(20,14,10,' + a + ')'); grd.addColorStop(1, 'rgba(20,14,10,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
  }
  function make(THREE, renderer, opts) {
    opts = opts || {};
    var g = new THREE.Group(), src = opts.src || '../assets/layers/mounted-gothic-knight.png';
    var t = new THREE.TextureLoader().load(src);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    var mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    var card = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
    var bottom = 2321 - FRONT[0][1];                     /* px of drawing under the front hooves' soles */
    card.position.set((1072 / 2 - HORSE_X) / PXM, H / 2 - bottom / PXM, 0);
    card.name = 'gallery-knight';
    g.add(card);
    function lay(m, x, z, w, d) {
      var s = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
      s.rotation.x = -Math.PI / 2; s.position.set(x, 0.008, z); s.scale.set(w, d, 1); s.raycast = function () {};
      g.add(s);
    }
    var body = shade(THREE, renderer, 0.42), hoof = shade(THREE, renderer, 0.75), hind = shade(THREE, renderer, 0.6);
    lay(body, 0, -1.1, 1.0, 2.6);
    FRONT.forEach(function (f) { lay(hoof, (f[0] - HORSE_X) / PXM, 0.02, 0.26, 0.2); });
    HIND.forEach(function (f) { lay(hind, (f[0] - HORSE_X) / PXM, -0.56, 0.24, 0.7); });
    var day = new THREE.Color(1, 1, 1), night = new THREE.Color(0.62, 0.5, 0.4);
    function light(k) { mat.color.copy(day).lerp(night, Math.max(0, Math.min(1, k))); }
    return { group: g, mat: mat, light: light };
  }
  window.CastleKnight = { make: make };
})();
