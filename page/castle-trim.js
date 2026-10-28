/* castle-trim.js: trim on both faces of an opening (the Architect's 182nd, Godric's word of 27 October 2026, 8.06 pm:
   "every window and door and opening to have interior and exterior trim of the appropriate stone and design", arrow
   slits excepted by British precedent; docs/architect/materials.md section 2, The precedent for loops).
   Pure geometry, no scene and no model: CastleTrim.geometry(THREE, s) gives one merged BufferGeometry for one face of
   one opening, in the wall's frame, x along the wall from the opening's middle, y up from the place's floor, z out of
   the wall's face at the origin, so the caller turns it about y by the wall's angle and sets it where the face is.
   s: { cls: 'door' | 'window' | 'loop', age: 'P1'..'P7', w, h (the cut, h over the sill), sill, face: 'in' | 'out',
   lim: { x0, x1, ymax } (the wall segment's ends from the opening's middle, along the wall, and 8 mm under the ceiling;
   every piece is cut to it, a piece gone to a sliver dropped) }.
   'in' is the face the room sees (the trim stands out into the room), 'out' the far face (out into the next room or
   the open). Off unless the page asks (shell.html?trim=1); castle-shell.js v91 calls it. */
(function () {
  'use strict';
  var EMBED = 0.005;   /* the back of every piece lies 5 mm into the wall, never in its face's plane */

  /* the moulding of each age (materials.md section 2's table, hugging the leaf as the surround rule says: a square
     head for a square cut): bw the width of the dressing round the cut, proj how far it stands out, chamfer the arrises,
     hood a mould over the head, lugs and key the P6 and P7 architrave's ears and keystone */
  function mould(age, cls) {
    var n = +String(age || 'P3').replace(/\D/g, '') || 3, win = cls === 'window';
    if (n <= 2) return { bw: win ? 0.1 : 0.12, proj: 0.03, chamfer: false };
    if (n === 3) return { bw: win ? 0.12 : 0.14, proj: 0.05, chamfer: true, hood: true };
    if (n <= 5) return { bw: win ? 0.14 : 0.16, proj: 0.06, chamfer: true, hood: true };
    return { bw: win ? 0.15 : 0.18, proj: 0.06, chamfer: true, lugs: true, key: true };
  }

  /* a loop's trim is the precedent's: outside, dressed jambs flush with the wall (a 1 cm lip, no mould, no hood);
     inside, the embrasure's frame under a plain lintel, a little proud */
  function loopMould(face) { return face === 'out' ? { bw: 0.07, proj: 0.012, chamfer: false } : { bw: 0.1, proj: 0.03, chamfer: false }; }

  var CLIP = null;   /* the wall segment and the ceiling, set by geometry() for its pieces (v2, the clamp: unclamped, 48 of 142 places went over baseline) */

  function rect(THREE, x0, x1, y0, y1, P, chamfer) {   /* a block standing P out of the face, its arrises chamfered 1.2 cm if asked */
    if (CLIP) { x0 = Math.max(x0, CLIP.x0); x1 = Math.min(x1, CLIP.x1); y1 = Math.min(y1, CLIP.ymax); }
    if (x1 - x0 < 0.01 || y1 - y0 < 0.01) return null;
    if (chamfer && (x1 - x0 < 0.05 || y1 - y0 < 0.05)) chamfer = false;
    var sh = new THREE.Shape();
    sh.moveTo(x0, y0); sh.lineTo(x1, y0); sh.lineTo(x1, y1); sh.lineTo(x0, y1); sh.lineTo(x0, y0);
    var b = chamfer ? Math.min(0.012, P / 3) : 0, g = new THREE.ExtrudeGeometry(sh, b
      ? { depth: P - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 1, steps: 1 }
      : { depth: P, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, (b ? b : 0) - EMBED);   /* the back at -5 mm, the front at P - 5 mm */
    return g;
  }

  function merge(THREE, list) {
    list = list.filter(Boolean);
    var n = 0; list.forEach(function (g) { n += g.attributes.position.count; });
    var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), o = 0;
    list.forEach(function (g) {
      var c = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
      o += c; g.dispose();
    });
    var m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    m.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return m;
  }

  function geometry(THREE, s) {
    var M = s.cls === 'loop' ? loopMould(s.face) : mould(s.age, s.cls), w = s.w, y0 = s.sill, y1 = s.sill + s.h, bw = M.bw, P = M.proj, ch = M.chamfer;
    /* v3: every edge that meets the cut, the jambs' feet and tops and the head's top, stand 6 mm into it or clear, so no face of the trim lies in the plane of the wall's own jamb, head
       or sill (the back's 5 mm embed overlapped them: 41 places fought, the all-places run with ?trim=1) */
    var J = 0.006, wi = w - 2 * J, X = w / 2 + bw, parts = [], lim = s.lim;
    /* the face 'in' is turned half about y after it is built, so its x runs the other way: clip it by the mirror */
    CLIP = lim ? { x0: s.face === 'in' ? -lim.x1 : lim.x0, x1: s.face === 'in' ? -lim.x0 : lim.x1, ymax: lim.ymax } : null;
    parts.push(rect(THREE, -X, -wi / 2, y0 + J, y1 - J, P, ch));                     /* the jambs */
    parts.push(rect(THREE, wi / 2, X, y0 + J, y1 - J, P, ch));
    parts.push(rect(THREE, -X, X, y1 - J, y1 + bw - J, P, ch));                  /* the head, over the jambs' ends */
    if (s.cls === 'window' && s.sill > 0.05)                                  /* a window's sill stone, proud of the jambs and a little wider */
      parts.push(rect(THREE, -X - 0.04, X + 0.04, y0 - 0.07, y0 + J, P + 0.04, ch));
    if (M.hood) parts.push(rect(THREE, -X - 0.06, X + 0.06, y1 + bw - J, y1 + bw + 0.06 - J, P + 0.03, false));   /* the hood mould over the head */
    if (M.lugs) {                                                             /* the lugs: the architrave's ears at the head's two corners */
      parts.push(rect(THREE, -X - 0.05, -X, y1 - 0.25, y1 + bw - J, P + 0.015, false));
      parts.push(rect(THREE, X, X + 0.05, y1 - 0.25, y1 + bw - J, P + 0.015, false));
    }
    if (M.key) parts.push(rect(THREE, -0.11, 0.11, y1 - J, y1 + bw + 0.08, P + 0.025, false));   /* the keystone, rising above the head */
    CLIP = null;
    var g = merge(THREE, parts);
    if (s.face === 'in') g.rotateY(Math.PI);      /* stands out of the near face into the room, its front turned to it */
    return g;
  }

  window.CastleTrim = { version: 7, geometry: geometry, merge: merge, mould: mould };
})();
