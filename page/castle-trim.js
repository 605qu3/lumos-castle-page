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
  /* v8 (Godric, 27 October 2026, 10.14 pm: "don't be afraid to give some period-accurate detail to the interior and
     exteriors of the trim design"): each age its own detail, the head still square (the surround follows the leaf), so
     the age lives in the jambs, the springing, the label and the sill:
       P1, P2  Norman: square dressed jambs under an impost block at the springing; a door's jambs carry a nook shaft
               on a square base; P2 adds a roll on the arrises (a window's jambs and head, a door's head)
       P3      Early English: chamfered jambs whose chamfer dies into a square stop at the foot; a drip mould over the
               head, its top weathered, its ends returned down to label stops
       P4, P5  Perpendicular and Tudor: the same chamfer and stops, a roll bead in the arris all round, a square label
               with longer returns (the Tudor's longest)
       P6, P7  Georgian: an architrave in three steps (two fasciae and an edge moulding), lugged, keyed; a door under
               a plain frieze and a cornice; a window's sill on two brackets
     The weather's pieces (a drip mould over a window, a sill sloped to shed rain, a sill's brackets) only on a window's
     outer face; a door's label and cornice on both faces, as a hall's doors had them */
  function mould(age, cls) {
    var n = +String(age || 'P3').replace(/\D/g, '') || 3, win = cls === 'window';
    if (n <= 2) return { n: n, bw: win ? 0.12 : 0.16, proj: 0.04, chamfer: false, impost: true, shaft: !win, roll: n === 2 };
    if (n === 3) return { n: n, bw: win ? 0.12 : 0.14, proj: 0.05, chamfer: true, stop: true, hood: 0.18 };
    if (n <= 5) return { n: n, bw: win ? 0.14 : 0.16, proj: 0.06, chamfer: true, stop: true, bead: true, hood: n === 4 ? 0.26 : 0.34 };
    return { n: n, bw: win ? 0.15 : 0.18, proj: 0.06, chamfer: false, steps: true, lugs: true, key: true, cornice: !win, brackets: win };
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

  /* v8: a round shaft or roll of radius r, eight sides, made unindexed for merge(): upright ('y', its middle at x u,
     z v, from c0 to c1 up) or lying along the wall ('x', at height u, z v, from c0 to c1 along); cut to the clip */
  function rod(THREE, axis, c0, c1, u, v, r) {
    if (CLIP && axis === 'y') { c1 = Math.min(c1, CLIP.ymax); if (u - r < CLIP.x0 || u + r > CLIP.x1) return null; }
    if (CLIP && axis === 'x') { c0 = Math.max(c0, CLIP.x0); c1 = Math.min(c1, CLIP.x1); if (u + r > CLIP.ymax) return null; }
    if (c1 - c0 < 0.02) return null;
    var g = new THREE.CylinderGeometry(r, r, c1 - c0, 8, 1).toNonIndexed();
    if (axis === 'x') { g.rotateZ(Math.PI / 2); g.translate((c0 + c1) / 2, u, v); } else g.translate(u, (c0 + c1) / 2, v);
    return g;
  }
  /* v8: a prism along the wall from x0 to x1 whose section is pts, [z, y] round its outline (a drip mould, a weathered
     sill, a cornice); left out whole where the ceiling cuts it */
  function prism(THREE, x0, x1, pts) {
    if (CLIP) { x0 = Math.max(x0, CLIP.x0); x1 = Math.min(x1, CLIP.x1); if (pts.some(function (p) { return p[1] > CLIP.ymax; })) return null; }
    if (x1 - x0 < 0.02) return null;
    var sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    sh.lineTo(pts[0][0], pts[0][1]);
    var g = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false, steps: 1 });
    g.rotateY(-Math.PI / 2); g.translate(x1, 0, 0);   /* the section's x becomes z, the extrusion runs along x */
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
    /* v8: 8 mm short of the wall's ends, so a piece cut there never lies in the end's plane (pomfrey-bedroom's widened sill) */
    CLIP = lim ? { x0: (s.face === 'in' ? -lim.x1 : lim.x0) + 0.008, x1: (s.face === 'in' ? -lim.x0 : lim.x1) - 0.008, ymax: lim.ymax } : null;
    /* v8: every piece that shares a plane with another either abuts it (the two faces sandwiched, never seen) or stands
       8 mm off it; a step's outer side and top lie 8 mm inside the step above (conventions.md) */
    var win = s.cls === 'window', out = s.face === 'out', xi = wi / 2, ys = y0 + J, yh = y1 + bw - J, E = EMBED, tall = y1 - y0;
    function pair(a, b, ya, yb, p, c) { parts.push(rect(THREE, -b, -a, ya, yb, p, c), rect(THREE, a, b, ya, yb, p, c)); }   /* a to b out from the middle, both sides */
    var imp = M.impost && tall > 0.6, jb = ys, jt = y1 - J;
    if (M.shaft && tall > 1.2) jb = ys + 0.22;
    if (M.stop && tall > 0.9) jb = ys + 0.32;
    if (imp) jt = y1 - J - 0.18;
    if (M.steps) {
      /* P6, P7: the architrave in three steps, the lowest the whole width, a broader fascia, an edge moulding */
      [[bw, 0.04], [bw * 0.6, 0.06], [0.04, 0.08]].forEach(function (st, k) {
        var e = 0.008 * (2 - k), b = st[0], hb = k ? yh - e - b : y1 - J;
        pair(k ? X - b : xi, X - e, jb - e, hb, st[1], false);
        parts.push(rect(THREE, -(X - e), X - e, hb, yh - e, st[1], false));
      });
    } else {
      pair(xi, X, jb, jt, P, ch);                                               /* the jambs */
      parts.push(rect(THREE, -X, X, y1 - J, yh, P, ch));                       /* the head, over the jambs' ends */
    }
    if (imp) pair(xi, X + 0.05, jt, y1 - J, M.shaft && jb > ys ? P + 0.07 : P + 0.04, true);   /* the impost blocks at the springing */
    if (M.shaft && jb > ys) {                                                   /* a Norman door's nook shafts, each on its square base */
      pair(xi, xi + 0.15, ys, jb, P + 0.07, true);
      [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, jt, sd * (xi + 0.065), P - E, 0.055)); });
    }
    if (M.roll) {                                                               /* P2's roll: on a window's jambs and head, on a door's head */
      if (win) [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, jt, sd * (xi + 0.035), P - E, 0.035)); });
      parts.push(rod(THREE, 'x', -xi - 0.035, xi + 0.035, y1 - J + 0.035, P - E, 0.035));
    }
    if (M.stop && jb > ys) pair(xi, X + 0.008, ys, jb, P + 0.016, false);     /* the chamfer's stops at the jambs' feet */
    if (M.bead) {                                                               /* P4, P5: a roll bead in the arris, all round */
      [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, y1 - J + 0.03, sd * (xi + 0.03), P - E, 0.03)); });
      parts.push(rod(THREE, 'x', -xi - 0.03, xi + 0.03, y1 - J + 0.03, P - E, 0.03));
    }
    if (win && s.sill > 0.05) {                                                 /* a window's sill stone, proud of the jambs and a little wider */
      if (out && M.n >= 3 && !M.steps)                                          /* outside, weathered: its top falls to shed the rain */
        parts.push(prism(THREE, -X - 0.05, X + 0.05, [[-E, y0 - 0.09], [P + 0.07, y0 - 0.09], [P + 0.07, y0 - 0.04], [P + 0.015, ys], [-E, ys]]));
      else parts.push(rect(THREE, -X - 0.05, X + 0.05, y0 - 0.09, ys, P + 0.05, ch));
      if (out && M.brackets && y0 > 0.4) pair(X - 0.09, X - 0.01, y0 - 0.27, y0 - 0.082, P + 0.03, false);   /* P6, P7: the sill on two brackets */
    }
    if (M.hood && (!win || out)) {                                              /* the drip mould or label: weathered on top, returned down to its stops */
      var hx = X + 0.09, hd = Math.min(M.hood, tall * 0.4);
      parts.push(prism(THREE, -hx, hx, [[-E, yh], [P + 0.09, yh], [P + 0.09, yh + 0.045], [P + 0.04, yh + 0.1], [-E, yh + 0.1]]));
      pair(X + 0.004, hx - 0.008, yh - hd, yh, P + 0.06, false);
      pair(X + 0.008, hx + 0.01, yh - hd - 0.12, yh - hd, P + 0.1, true);
    }
    if (M.lugs) pair(X - 0.008, X + 0.07, y1 - 0.3, yh - 0.004, 0.095, false);   /* the lugs: the architrave's ears at the head's two corners */
    if (M.key) parts.push(rect(THREE, -0.13, 0.13, y1 - J - 0.012, yh + 0.12, 0.11, false));   /* the keystone, dropped a little below the head, rising above it */
    if (M.cornice) {                                                            /* P6, P7 doors: a plain frieze and a cornice over it */
      var yf = yh + 0.24;
      parts.push(rect(THREE, -(X - 0.012), X - 0.012, yh - 0.008, yf, 0.035, false));
      parts.push(prism(THREE, -X - 0.1, X + 0.1, [[-E, yf - 0.008], [0.06, yf - 0.008], [0.14, yf + 0.07], [0.14, yf + 0.13], [-E, yf + 0.13]]));
    }
    CLIP = null;
    var g = merge(THREE, parts);
    if (s.face === 'in') g.rotateY(Math.PI);      /* stands out of the near face into the room, its front turned to it */
    return g;
  }

  window.CastleTrim = { version: 8, geometry: geometry, merge: merge, mould: mould };
})();
