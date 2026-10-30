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
     outer face; a door's label and cornice on both faces, as a hall's doors had them
     v9 (the old cells' gates, Godric's 1 on req 1265, 27 October 2026, 10.31 pm: "under round stone arches"): an
     opening whose model record says `head: "round"` (s.head) has its cut round over a springing w/2 under h, the
     shell filling the spandrels; its dressing turns over it as a ring of eleven voussoirs, the jambs, imposts and
     shafts stopping at the springing, a roll or bead turning with the ring; no label or architrave head over it. The
     cells' own faces are P3, round by his word, not by P3's square rule (req 1268's schedule must keep it) */
  /* v10 (req 1749, the trim sheet's cells, docs/architect/trim-sheet-1030.html, Godric's 1 on req 1735 and his Gothick
     on req 1750; materials.md section 2 after req 1583's rulings): only the cells those rulings moved change.
       P1      the door: no nook shaft; a raised fillet 15 by 5 cm round jambs and head, imposts at the springing
       P2      the door and window: plain dressed jambs under imposts, no roll; a door's nook shafts only where its record
               says `grand` (the hall, the chapel)
       P6      to about 1700, the Jacobean: an architrave, no lugs, no keystone; a door under a frieze and cornice, a
               window under a small pediment, its sill on corbels. From about 1700 (a room whose record says `late`: by
               Godric's 1 on req 1767, the oriel's two storeys, the painted-door room, the bartizan, the long gallery): the door in a lugged architrave with a keystone; the window the Gothick, a
               chamfered surround under a plain hood, pointed where its record's head is
       P7      the door Gothic Revival: a roll on the arris, a label on carved stops, no lugs, no key; the window the
               same dressing (Godric's 1 on req 1755: intersecting tracery)
     The head is the record's (s.head, its first word): round or pointed (equilateral, the sheet's apex 0.866 w) turn
     the dressing over it; an opening whose record names none stays square, as the shell cuts it */
  function mould(age, cls, o) {
    var n = +String(age || 'P3').replace(/\D/g, '') || 3, win = cls === 'window';
    o = o || {};
    if (n === 1) return { n: n, bw: win ? 0.12 : 0.15, proj: win ? 0.04 : 0.05, chamfer: false, impost: true };
    if (n === 2) return { n: n, bw: win ? 0.12 : 0.16, proj: 0.04, chamfer: false, impost: true, shaft: !win && !!o.grand };
    if (n === 3) return { n: n, bw: win ? 0.12 : 0.14, proj: 0.05, chamfer: true, stop: true, hood: 0.18 };
    if (n <= 5) return { n: n, bw: win ? 0.14 : 0.16, proj: 0.06, chamfer: true, stop: true, bead: true, hood: n === 4 ? 0.26 : 0.34 };
    if (n === 6 && o.late) return win ? { n: n, bw: 0.14, proj: 0.05, chamfer: true, hood: 0.22 }
      : { n: n, bw: 0.18, proj: 0.06, chamfer: false, steps: true, lugs: true, key: true };
    if (n === 7) return { n: n, bw: win ? 0.15 : 0.16, proj: 0.06, chamfer: true, bead: true, hood: 0.26 };   /* req 1755: the window too, intersecting tracery's dressing (the tracery is the glazing's) */
    return { n: n, bw: win ? 0.15 : 0.18, proj: 0.06, chamfer: false, steps: true, cornice: !win, pediment: win, brackets: win };
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

  /* v9: a round head's ring, n voussoirs from r0 to r1 about (0, cy), each standing P out, 6 mm joints between them
     (the wall shows in each, as a mortar line); left out whole where the ceiling or the wall's ends cut it */
  function ring(THREE, cy, r0, r1, P, n) {
    if (CLIP && (cy + r1 > CLIP.ymax || -r1 < CLIP.x0 || r1 > CLIP.x1)) return [];
    var out = [], jg = 0.006 / r1, step = (Math.PI - jg * (n - 1)) / n;
    for (var k = 0; k < n; k++) {
      var a0 = k * (step + jg), a1 = a0 + step, sh = new THREE.Shape();
      sh.moveTo(r0 * Math.cos(a0), cy + r0 * Math.sin(a0)); sh.lineTo(r1 * Math.cos(a0), cy + r1 * Math.sin(a0));
      sh.absarc(0, cy, r1, a0, a1, false); sh.lineTo(r0 * Math.cos(a1), cy + r0 * Math.sin(a1));
      sh.absarc(0, cy, r0, a1, a0, true);
      var g = new THREE.ExtrudeGeometry(sh, { depth: P, bevelEnabled: false, steps: 1, curveSegments: 3 });
      g.translate(0, 0, -EMBED); out.push(g);
    }
    return out;
  }
  /* v9: a roll turned over a round head, its middle on radius rr about (0, cy), at z v */
  function arcRod(THREE, cy, rr, v, r) {
    if (CLIP && (cy + rr + r > CLIP.ymax || -rr - r < CLIP.x0 || rr + r > CLIP.x1)) return null;
    var g = new THREE.TorusGeometry(rr, r, 8, 24, Math.PI).toNonIndexed();
    g.translate(0, cy, v);
    return g;
  }

  /* v10: a head's line d out from the cut (a the cut's half width), t from the left springing (0) to the right (1),
     about the springing's middle: round about one centre; pointed, equilateral, each half struck from the far springing */
  function prof(kind, a, d, t) {
    if (kind === 'round') { var q = Math.PI * (1 - t); return [(a + d) * Math.cos(q), (a + d) * Math.sin(q)]; }
    if (t > 0.5) { var m = prof(kind, a, d, 1 - t); return [-m[0], m[1]]; }
    var R = 2 * a + d, e = Math.acos(-a / R), th = Math.PI - (Math.PI - e) * t / 0.5;
    return [a + R * Math.cos(th), R * Math.sin(th)];
  }
  function rise(kind, a, d) { return prof(kind, a, d || 0, 0.5)[1]; }
  /* v10: a pointed head's ring, n stones each half (a joint at the apex, as a two-centred arch has), from d0 to d1 out of
     the cut, standing P out; 6 mm joints; left out whole where the ceiling or the wall's ends cut it */
  function pring(THREE, kind, a, cy, d0, d1, P, n) {
    if (CLIP && (cy + rise(kind, a, d1) > CLIP.ymax || -a - d1 < CLIP.x0 || a + d1 > CLIP.x1)) return [];
    var out = [], L = (Math.PI - Math.acos(-a / (2 * a))) * 2 * a * 2, g = 0.003 / L, S = 4;
    for (var k = 0; k < 2 * n; k++) {
      var t0 = k / (2 * n) + g, t1 = (k + 1) / (2 * n) - g, sh = new THREE.Shape(), i, p;
      for (i = 0; i <= S; i++) { p = prof(kind, a, d0, t0 + (t1 - t0) * i / S); i ? sh.lineTo(p[0], cy + p[1]) : sh.moveTo(p[0], cy + p[1]); }
      for (i = S; i >= 0; i--) { p = prof(kind, a, d1, t0 + (t1 - t0) * i / S); sh.lineTo(p[0], cy + p[1]); }
      var gg = new THREE.ExtrudeGeometry(sh, { depth: P, bevelEnabled: false, steps: 1 });
      gg.translate(0, 0, -EMBED); out.push(gg);
    }
    return out;
  }
  /* v10: a roll turned over a pointed head, its middle d out from the cut, at z v */
  function pRod(THREE, kind, a, cy, d, v, r) {
    if (CLIP && (cy + rise(kind, a, d) + r > CLIP.ymax || -a - d - r < CLIP.x0 || a + d + r > CLIP.x1)) return null;
    var pts = [];
    for (var i = 0; i <= 24; i++) { var p = prof(kind, a, d, i / 24); pts.push(new THREE.Vector3(p[0], cy + p[1], v)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 8, false).toNonIndexed();
  }
  /* v10: a small pediment over a window's head, x0 to x1 at y, its apex `up` higher, a triangle standing P out */
  function pediment(THREE, x0, x1, y, up, P) {
    if (CLIP && (x0 < CLIP.x0 || x1 > CLIP.x1 || y + up > CLIP.ymax)) return null;
    var sh = new THREE.Shape(); sh.moveTo(x0, y); sh.lineTo(x1, y); sh.lineTo((x0 + x1) / 2, y + up); sh.lineTo(x0, y);
    var g = new THREE.ExtrudeGeometry(sh, { depth: P, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, -EMBED); return g;
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
    var M = s.cls === 'loop' ? loopMould(s.face) : mould(s.age, s.cls, s), w = s.w, y0 = s.sill, y1 = s.sill + s.h, bw = M.bw, P = M.proj, ch = M.chamfer;
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
    var HK = s.cls === 'loop' ? '' : String(s.head || '').split(',')[0].trim();   /* v10: the record's head, its first word */
    if (HK === 'pointed' && !(w > 0.1)) HK = '';
    var RH = HK === 'round' ? w / 2 : HK === 'pointed' ? rise('pointed', w / 2, 0) : 0, yr = y1 - RH;   /* v9: yr the springing, y1 the crown */
    var imp = M.impost && tall > 0.6, jb = ys, jt = yr - J;
    if (M.shaft && tall > 1.2) jb = ys + 0.22;
    if (M.stop && tall > 0.9) jb = ys + 0.32;
    if (imp) jt = yr - J - 0.18;
    if (RH && HK === 'pointed') {
      /* v10: a pointed head: the jambs to the springing, the ring over the cut (a joint at the apex), a roll or bead
         turned with it, and the hood following the head where the age has one (a door's on both faces, a window's
         outside), its ends stopped on blocks at the springing */
      var a = w / 2, PP = M.steps ? 0.06 : P;
      pair(xi, X, jb, jt, PP, ch);
      parts.push.apply(parts, pring(THREE, 'pointed', a, yr, -J, bw, PP, w > 1.6 ? 6 : 4));
      if (imp) pair(xi, X + 0.05, jt, yr - J, P + 0.04, true);
      if (M.roll || M.bead) parts.push(pRod(THREE, 'pointed', a, yr, 0.03, PP - E, 0.03));
      if (M.bead) [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, yr, sd * (xi + 0.03), PP - E, 0.03)); });
      if (M.stop && jb > ys) pair(xi, X + 0.008, ys, jb, PP + 0.016, false);
      if (M.hood && (!win || out)) {
        parts.push.apply(parts, pring(THREE, 'pointed', a, yr, bw, bw + 0.08, PP + 0.05, w > 1.6 ? 6 : 4));
        pair(X + 0.008, X + 0.1, yr - 0.14, yr - J, PP + 0.07, true);
      }
      if (win && s.sill > 0.05) {
        if (out) parts.push(prism(THREE, -X - 0.05, X + 0.05, [[-E, y0 - 0.09], [PP + 0.07, y0 - 0.09], [PP + 0.07, y0 - 0.04], [PP + 0.015, ys], [-E, ys]]));
        else parts.push(rect(THREE, -X - 0.05, X + 0.05, y0 - 0.09, ys, PP + 0.05, ch));
      }
      CLIP = null;
      var gp = merge(THREE, parts);
      if (s.face === 'in') gp.rotateY(Math.PI);
      return gp;
    }
    if (RH) {
      /* v9: the jambs to the springing, the ring over the cut; the ring's springers stand on the jambs' tops (6 mm up,
         never in their plane) and on the imposts where the age has them */
      pair(xi, X, jb, jt, P, ch);
      parts.push.apply(parts, ring(THREE, yr, xi, X, M.steps ? 0.06 : P, 11));
      if (imp) pair(xi, X + 0.05, jt, yr - J, M.shaft && jb > ys ? P + 0.07 : P + 0.04, true);
      if (M.shaft && jb > ys) {
        pair(xi, xi + 0.15, ys, jb, P + 0.07, true);
        [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, jt, sd * (xi + 0.065), P - E, 0.055)); });
      }
      if (M.roll || M.bead) parts.push(arcRod(THREE, yr, xi + 0.035, P - E, 0.035));
      if (M.bead) [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, yr, sd * (xi + 0.03), P - E, 0.03)); });
      if (M.stop && jb > ys) pair(xi, X + 0.008, ys, jb, P + 0.016, false);
      CLIP = null;
      var gr = merge(THREE, parts);
      if (s.face === 'in') gr.rotateY(Math.PI);
      return gr;
    }
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
    if (M.pediment && out) {                                                    /* v10: P6 to 1700, the Jacobean window's small pediment on a shelf of cornice */
      parts.push(prism(THREE, -X - 0.06, X + 0.06, [[-E, yh - 0.008], [0.1, yh - 0.008], [0.1, yh + 0.06], [-E, yh + 0.06]]));
      parts.push(pediment(THREE, -X - 0.02, X + 0.02, yh + 0.06 + J, Math.min(0.32, (X + 0.02) * 0.45), 0.07));
    }
    CLIP = null;
    var g = merge(THREE, parts);
    if (s.face === 'in') g.rotateY(Math.PI);      /* stands out of the near face into the room, its front turned to it */
    return g;
  }

  window.CastleTrim = { version: 10, geometry: geometry, merge: merge, mould: mould, prof: prof, rise: rise };
})();
