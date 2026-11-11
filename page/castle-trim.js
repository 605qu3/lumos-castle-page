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
  /* req 1996 preview: a four-centred (Tudor) head, each half two arcs: a small one of radius r1 = a/4 on the springing line,
     then a larger one that meets its end tangent and reaches the apex over the middle (rise 0.65 a); d offsets both radii */
  function tudor(a) {
    var r1 = a / 4, ph = Math.PI / 3, ux = -Math.cos(ph), uy = Math.sin(ph), c1x = -a + r1, h = 0.65 * a;
    /* C2 = C1 + (r1 - r2) u, |(0,h) - C2| = r2: a quadratic in r2 */
    var qx = 0 - c1x - r1 * ux, qy = h - r1 * uy;   /* P - C1 - r1 u = P - J'; (qx + r2 ux)^2 + (qy + r2 uy)^2 = r2^2 */
    var A = ux * ux + uy * uy - 1, B = 2 * (qx * ux + qy * uy), C = qx * qx + qy * qy, r2;
    r2 = Math.abs(A) < 1e-9 ? -C / B : (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    if (!(r2 > 0)) r2 = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    return { r1: r1, ph: ph, c1x: c1x, c2x: c1x + (r1 - r2) * ux, c2y: (r1 - r2) * uy, r2: r2 };
  }
  function prof(kind, a, d, t) {
    if (kind === 'tudor') {
      if (t > 0.5) { var mm = prof(kind, a, d, 1 - t); return [-mm[0], mm[1]]; }
      var T = tudor(a), f = 0.2, R2 = T.r2 + d, thA = Math.acos(Math.max(-1, Math.min(1, -T.c2x / R2)));
      if (t / 0.5 <= f) { var th1 = Math.PI - T.ph * (t / 0.5) / f; return [T.c1x + (T.r1 + d) * Math.cos(th1), (T.r1 + d) * Math.sin(th1)]; }
      var u = ((t / 0.5) - f) / (1 - f), thJ = Math.PI - T.ph, th2 = thJ + (thA - thJ) * u;
      return [T.c2x + R2 * Math.cos(th2), T.c2y + R2 * Math.sin(th2)];
    }
    if (kind === 'round') { var q = Math.PI * (1 - t); return [(a + d) * Math.cos(q), (a + d) * Math.sin(q)]; }
    if (t > 0.5) { var m = prof(kind, a, d, 1 - t); return [-m[0], m[1]]; }
    var R = 2 * a + d, e = Math.acos(-a / R), th = Math.PI - (Math.PI - e) * t / 0.5;
    return [a + R * Math.cos(th), R * Math.sin(th)];
  }
  function rise(kind, a, d) { return prof(kind, a, d || 0, 0.5)[1]; }
  /* v10: a pointed head's ring, n stones each half (a joint at the apex, as a two-centred arch has), from d0 to d1 out of
     the cut, standing P out; 6 mm joints; left out whole where the ceiling or the wall's ends cut it */
  function pring(THREE, kind, a, cy, d0, d1, P, n) {
    if (CLIP && cy + rise(kind, a, d1) > CLIP.ymax) return [];
    if (CLIP && (-a - d1 < CLIP.x0 || a + d1 > CLIP.x1)) {
      /* a wall too short for the full ring (a facet of a round shaft): the ring is cut to the room the wall leaves, as the jambs are by rect(), so both read one width */
      d1 = Math.min(-CLIP.x0 - a, CLIP.x1 - a);
      if (d1 < d0 + 0.03 || d1 < 0.03) return [];
    }
    var out = [], L = (Math.PI - Math.acos(-a / (2 * a))) * 2 * a * 2, g = 0.003 / L, S = 4;
    /* the wall's cut (castle-strip outline) is a polyline, not the true arc (a few mm off at castle-strip's SEG, the one
       source for its points, CastleStrip.fracs): a ring whose inner edge lay 6 mm in from the arc could leave the wall's
       face showing between ring and lining (the haunch slivers). A casing ring (d0 < 0) takes its inner edge 6 mm
       inside that polyline, along the same radial as its joints */
    var cutPts = null, CS = (typeof window !== 'undefined' && window.CastleStrip) || (typeof globalThis !== 'undefined' && globalThis.CastleStrip) || null;
    if (kind === 'pointed' && d0 < 0 && CS && CS.fracs) {
      var FQ = [0].concat(CS.fracs('pointed'), [1]);
      cutPts = FQ.map(function (f) {
        var xq = -a + 2 * a * f, cxq = f <= 0.5 ? a : -a;
        return [xq, Math.sqrt(Math.max(0, 4 * a * a - (xq - cxq) * (xq - cxq)))];
      });
    }
    function inner(t) {
      var P = prof(kind, a, 0, t);
      if (!cutPts) return prof(kind, a, d0, t);
      var c = t <= 0.5 ? a : -a, nx = P[0] - c, ny = P[1], nl = Math.hypot(nx, ny) || 1, best = Infinity, j;
      nx /= nl; ny /= nl;
      for (j = 0; j + 1 < cutPts.length; j++) {   /* where the inward ray P - r n meets chord j: r = -cross(w, e) / cross(n, e) */
        var ex = cutPts[j + 1][0] - cutPts[j][0], ey = cutPts[j + 1][1] - cutPts[j][1], den = nx * ey - ny * ex;
        if (Math.abs(den) < 1e-9) continue;
        var wx = cutPts[j][0] - P[0], wy = cutPts[j][1] - P[1], r = -(wx * ey - wy * ex) / den, u = (wx * ny - wy * nx) / den;
        if (u >= -1e-6 && u <= 1 + 1e-6 && r >= -1e-6 && r < best) best = r;
      }
      if (!(best < Infinity)) best = 0;
      return [P[0] - nx * (best - d0), P[1] - ny * (best - d0)];
    }
    for (var k = 0; k < 2 * n; k++) {
      var t0 = k / (2 * n) + g, t1 = (k + 1) / (2 * n) - g, sh = new THREE.Shape(), i, p;
      for (i = 0; i <= S; i++) { p = inner(t0 + (t1 - t0) * i / S); i ? sh.lineTo(p[0], cy + p[1]) : sh.moveTo(p[0], cy + p[1]); }
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
    if (s.mv) for (var mk in s.mv) M[mk] = s.mv[mk];   /* req 1996 preview: a moulding set by hand */
    var J = 0.006, wi = w - 2 * J, X = w / 2 + bw, parts = [], lim = s.lim;
    /* the face 'in' is turned half about y after it is built, so its x runs the other way: clip it by the mirror */
    /* v8: 8 mm short of the wall's ends, so a piece cut there never lies in the end's plane (pomfrey-bedroom's widened sill) */
    CLIP = lim ? { x0: (s.face === 'in' ? -lim.x1 : lim.x0) + 0.008, x1: (s.face === 'in' ? -lim.x0 : lim.x1) - 0.008, ymax: lim.ymax } : null;
    /* v8: every piece that shares a plane with another either abuts it (the two faces sandwiched, never seen) or stands
       8 mm off it; a step's outer side and top lie 8 mm inside the step above (conventions.md) */
    var win = s.cls === 'window', out = s.face === 'out', xi = wi / 2, ys = y0 + J, yh = y1 + bw - J, E = EMBED, tall = y1 - y0;
    function pair(a, b, ya, yb, p, c) { parts.push(rect(THREE, -b, -a, ya, yb, p, c), rect(THREE, a, b, ya, yb, p, c)); }   /* a to b out from the middle, both sides */
    var HK = s.cls === 'loop' ? '' : String(s.head || '').split(',')[0].trim();   /* v10: the record's head, its first word */
    if ((HK === 'pointed' || HK === 'tudor') && !(w > 0.1)) HK = '';
    var RH = HK === 'round' ? w / 2 : HK === 'pointed' || HK === 'tudor' ? rise(HK, w / 2, 0) : 0, yr = y1 - RH;   /* v9: yr the springing, y1 the crown */
    var imp = M.impost && tall > 0.6, jb = ys, jt = yr - J;
    if (M.shaft && tall > 1.2) jb = ys + 0.22;
    if (M.stop && tall > 0.9) jb = ys + 0.32;
    if (imp) jt = yr - J - 0.18;
    if (RH && (HK === 'pointed' || HK === 'tudor')) {
      /* v10: a pointed head: the jambs to the springing, the ring over the cut (a joint at the apex), a roll or bead
         turned with it, and the hood following the head where the age has one (a door's on both faces, a window's
         outside), its ends stopped on blocks at the springing */
      var a = w / 2, PP = M.steps ? 0.06 : P;
      /* v13: a door in a short wall (near a wall's end, or a facet of a round shaft) is cased the same both sides: mg is the room
         the nearer end leaves beside the cut, every pair's outer edge is held to it (cap), so the two jambs and the ring read one
         width; under 3 cm of room there is no casing on either side, never one jamb */
      var mg = CLIP ? Math.min(-CLIP.x0 - a, CLIP.x1 - a) : Infinity, bwe = Math.min(bw, mg), thin = bwe < 0.03;
      function cap(x) { return Math.min(x, a + mg); }
      /* v11 (req 5176, the bold cased opening, ?cased=2; Barclay Church, Edinburgh, HES LB26720: "polychrome voussoirs",
         a hood "with carved label stops"): M.poly lays the ring's voussoirs and the jambs' courses in two stones turn
         about, the second (alt) returned beside the merged geometry as g.userData.alt for the caller's second material.
         Mirrored stones match (a stone and its fellow across the apex the same), the springers in the first stone, the
         jamb's top course the second so the turn runs on down; courses about 0.32 m with 6 mm joints */
      var alt = [], HO = bw, HP = PP + 0.05, NORD = 0;   /* v14: the hood's inner offset and its projection, moved out over any orders */
      if (!thin) {
        var nR = w > 1.6 ? 6 : 4;
        if (M.poly && jt - jb > 0.2) {
          var nc = Math.max(1, Math.round((jt - jb) / 0.32)), hc = (jt - jb) / nc;
          for (var c = 0; c < nc; c++) {
            var cy1 = jt - c * hc, cy0 = cy1 - hc + (c < nc - 1 ? 0.006 : 0), dst = c % 2 === 0 ? alt : parts, keep = parts;
            parts = dst; pair(xi, a + bwe, cy0, cy1, PP, ch); parts = keep;
          }
        } else pair(xi, a + bwe, jb, jt, PP, ch);
        var rst = pring(THREE, HK, a, yr, -J, bwe, PP, nR);
        if (M.poly && rst.length === 2 * nR) rst.forEach(function (gq, k) { var ix = k < nR ? k : 2 * nR - 1 - k; (ix % 2 ? alt : parts).push(gq); });
        else parts.push.apply(parts, rst);
        if (imp) pair(xi, cap(X + 0.05), jt, yr - J, P + 0.04, true);
        /* v14 (req 5203, the bolder casing, ?cased=3): the door set in receding orders, as a great church's west door is:
           M.orders more rings round the casing, each 0.16 wide and 0.07 prouder than the one inside it, their jambs the
           same; the orders turn about in the two stones (the first order the second stone); a slim shaft (r 0.03) stands
           in each step of the jambs under a block capital at the springing. An order the ceiling or the wall's end leaves
           no room for is left out whole with every order outside it (pring's clip), never cut */
        if (M.orders && bwe >= bw - 0.001) {
          var OW = 0.16, OS = 0.07, pPrev = PP;
          for (var k = 1; k <= M.orders; k++) {
            var d0 = bw + (k - 1) * OW + J, d1 = bw + k * OW, pk = PP + OS * k;
            if (d1 > mg) break;
            var ro = pring(THREE, HK, a, yr, d0, d1, pk, nR);
            if (!ro.length) break;
            var tgt = k % 2 ? alt : parts, kp = parts;
            tgt.push.apply(tgt, ro);
            parts = tgt; pair(a + d0, a + d1, jb, jt, pk, ch); parts = kp;
            var sx = a + d0 - 0.035, sz = pPrev + 0.025;
            [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, yr - 0.13, sd * sx, sz, 0.03)); });
            pair(a + d0 - 0.075, a + d0, yr - 0.13, yr - J, pPrev + 0.07, true);
            HO = d1; HP = pk + 0.05; pPrev = pk; NORD = k;
          }
        }
      }
      if (M.roll || M.bead) parts.push(pRod(THREE, HK, a, yr, 0.03, PP - E, 0.03));
      /* a bead's two rods stand or fall together (rod() drops a rod whose own side has no room) */
      if (M.bead && !thin && xi + 0.06 <= a + mg) [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', jb, yr, sd * (xi + 0.03), PP - E, 0.03)); });
      if (!thin && M.stop && jb > ys) pair(xi, cap(X + 0.008), ys, jb, PP + 0.016, false);
      if (!thin && M.hood && (!win || out)) {
        var XH = a + HO;   /* v14: X itself where there are no orders */
        parts.push.apply(parts, pring(THREE, HK, a, yr, HO, HO + 0.08, HP, w > 1.6 ? 6 : 4));
        if ((M.poly || M.orders) && cap(XH + 0.1) - cap(XH + 0.008) > 0.05) {
          /* v11: the carved label stop: a block under the hood's end, its underside cut back in a slope to the wall, a
             boss on its face (a stylised carving at greybox scale; Barclay's are angels) */
          var s0 = cap(XH + 0.008), s1 = cap(XH + 0.1), sxm = (s0 + s1) / 2;
          [-1, 1].forEach(function (sd) {
            var lo = sd > 0 ? s0 : -s1, hi = sd > 0 ? s1 : -s0;
            parts.push(prism(THREE, lo, hi, [[-E, yr - 0.27], [HP - 0.03, yr - 0.27], [HP + 0.02, yr - 0.12], [HP + 0.02, yr - J], [-E, yr - J]]));
            var bo = new THREE.IcosahedronGeometry(0.032, 1); bo.translate(sd * sxm, yr - 0.07, HP + 0.025); parts.push(bo);
          });
        } else pair(cap(XH + 0.008), cap(XH + 0.1), yr - 0.14, yr - J, HP + 0.02, true);
      }
      if (win && s.sill > 0.05) {
        if (out) parts.push(prism(THREE, -X - 0.05, X + 0.05, [[-E, y0 - 0.09], [PP + 0.07, y0 - 0.09], [PP + 0.07, y0 - 0.04], [PP + 0.015, ys], [-E, ys]]));
        else parts.push(rect(THREE, -X - 0.05, X + 0.05, y0 - 0.09, ys, PP + 0.05, ch));
      }
      CLIP = null;
      var gp = merge(THREE, parts);
      if (s.face === 'in') gp.rotateY(Math.PI);
      if (M.orders) gp.userData.ord = NORD;   /* v14: how many orders stood (the preview's count, read by castle-shell) */
      if (alt.filter(Boolean).length) { var ga = merge(THREE, alt); if (s.face === 'in') ga.rotateY(Math.PI); gp.userData.alt = ga; }
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

  /* v15 (req 5219, the reveal door, castle-shell v226 ?cased=4; Godric's shot of 10 November 2026, 11.04 pm: v14's orders
     stood proud of the face, the reverse of a real doorway): the orders step IN through the wall, as a 13th-century
     doorway's do (Barnwell St Andrew's south door, two moulded orders with jamb shafts; britishlistedbuildings
     101040245). The shell cuts the face s.n x OW wider all round the base hole, on the true offset of its head
     (CastleStrip.offTop, prof's curve), s.n x DT deep; this kit fills it in dressed stone: the casing (bw) and the hood
     on the face round the recess, the outer order's soffit faced, each further order a solid block stepping in with
     its own arch, a shaft in each step's angle under a capital at the springing, and the innermost order's face round
     the base hole where the leaf shuts against it. Voussoirs nR a side with 6 mm joints, jambs in courses of about
     0.32 m. Frame: x across from the opening's middle, y as the caller's (s.sill, s.sp the springing), z out of the
     ordered face at 0, into the wall negative. s: { a (the base hole's half width), sill, sp, kind 'pointed' | 'round',
     n (1 or 2), OW, DT, bw, proj, nR } */
  function reveal(THREE, s) {
    CLIP = null;
    var a = s.a, n = s.n, OW = s.OW, DT = s.DT, bw = s.bw, P = s.proj, kind = s.kind, sp = s.sp, y0 = s.sill, J = 0.006, E = EMBED;
    var F = n * OW, nR = s.nR || (a > 0.8 ? 6 : 4), parts = [];
    function piece(x0, x1, ya, yb, z0, z1) {   /* a block both sides of the middle, x0 to x1 out from it, z0 to z1 in the out frame */
      [-1, 1].forEach(function (sd) {
        var g = rect(THREE, sd > 0 ? x0 : -x1, sd > 0 ? x1 : -x0, ya, yb, z1 - z0, false);
        if (g) { g.translate(0, 0, z0 + E); parts.push(g); }
      });
    }
    function courses(x0, x1, ya, yb, z0, z1) {
      var nc = Math.max(1, Math.round((yb - ya) / 0.32)), hc = (yb - ya) / nc;
      for (var c = 0; c < nc; c++) piece(x0, x1, ya + c * hc, ya + (c + 1) * hc - (c < nc - 1 ? J : 0), z0, z1);
    }
    function arch(d0, d1, z0, z1, k) {
      pring(THREE, kind, a, sp, d0, d1, z1 - z0, k || nR).forEach(function (g) { g.translate(0, 0, z0 + E); parts.push(g); });
    }
    var yj = y0 + J, yt = sp - J, D = n * DT;
    /* the casing on the face, round the recess, and the hood over it with its stops */
    courses(a + F - J, a + F + bw, yj, yt, -E, P - E); arch(F - J, F + bw, -E, P - E);
    var HO = F + bw;
    arch(HO, HO + 0.08, -E, P + 0.05 - E);
    piece(a + HO + 0.008, a + HO + 0.1, sp - 0.16, yt, -E, P + 0.07 - E);
    /* the outer order's soffit, faced 1.5 cm, from the face to the first step */
    courses(a + F - 0.015, a + F + 0.01, yj, yt, -DT, 0.001); arch(F - 0.015, F + 0.01, -DT, 0.001);
    /* each further order: a block stepping in, its face at s x DT, its soffit (n - s) x OW out from the base hole */
    for (var st = 1; st < n; st++) {
      var dIn = (n - st) * OW, dOut = (n - st + 1) * OW + 0.01;
      courses(a + dIn, a + dOut, yj, yt, -D, -st * DT); arch(dIn, dOut, -D, -st * DT);
    }
    /* the innermost order's face round the base hole, where the leaf shuts: 1.5 cm proud of the back of the recess */
    courses(a, a + OW + 0.003, yj, yt, -D - E, -D + 0.015); arch(-J, OW + 0.003, -D - E, -D + 0.015);
    /* a shaft in each step's angle, on a base, under a capital at the springing */
    for (var k = 1; k <= n; k++) {
      var xc = a + (n - k + 1) * OW, zc = -k * DT;
      [-1, 1].forEach(function (sd) { parts.push(rod(THREE, 'y', y0 + 0.2, sp - 0.13, sd * (xc - 0.04), zc + 0.04, 0.035)); });
      piece(xc - 0.1, xc, y0 + J, y0 + 0.2, zc, zc + 0.1);
      piece(xc - 0.1, xc, sp - 0.13, yt, zc, zc + 0.1);
    }
    return merge(THREE, parts);
  }

  /* v16 (req 5250, the Great Hall doors' card, castle-shell v228 ?ghp=1|2): where the wall is too thin for v15's recess
     (0.30 at the Great Hall doors), the depth is built in front of it: a mass standing D = n x DT proud of the face, its
     opening n x OW wider than the door all round, and v15's reveal set in its front so the orders step IN to the door's
     own width at the wall. s.out null: a portal, the mass following the casing's outline (jambs and arch to F + bw);
     s.out { hw, top }: the wall thickened, the mass a rectangle hw either side and up to top. Returns { mass, dress }:
     the mass in the wall's stone (or the dressing's for a portal), the dress v15's casing, hood, orders and shafts.
     Frame as reveal's, but the face of the wall at z 0 and the front of the mass at z D */
  function portal(THREE, s) {
    CLIP = null;
    var a = s.a, n = s.n, D = n * s.DT, F = n * s.OW, kind = s.kind, sp = s.sp, y0 = s.sill, N = 24, parts = [];
    var arc = function (d, t0, t1) { var p = []; for (var i = 0; i <= N; i++) { var q = prof(kind, a, d, t0 + (t1 - t0) * i / N); p.push([q[0], sp + q[1]]); } return p; };
    var X = s.out ? s.out.hw : a + F + s.bw, inner = arc(F, 0, 1);
    /* the jambs, floor to springing, either side of the opening */
    [-1, 1].forEach(function (sd) {
      var g = rect(THREE, sd > 0 ? a + F : -X, sd > 0 ? X : -(a + F), y0, sp, D + EMBED, false); if (g) parts.push(g);
    });
    /* over the springing: the outer line (the arch at F + bw, or the rectangle's top) back over the opening's arch */
    var pts = s.out ? [[X, sp], [X, s.out.top], [-X, s.out.top], [-X, sp]] : arc(F + s.bw, 1, 0);
    pts = pts.concat(inner);
    var sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
    var top = new THREE.ExtrudeGeometry(sh, { depth: D + EMBED, bevelEnabled: false, steps: 1 }); top.translate(0, 0, -EMBED); parts.push(top);
    var mass = merge(THREE, parts);
    var dress = reveal(THREE, { a: a, sill: y0, sp: sp, kind: kind, n: n, OW: s.OW, DT: s.DT, bw: s.bw, proj: s.proj, nR: s.nR });
    dress.translate(0, 0, D);
    return { mass: mass, dress: dress, D: D, F: F, crown: sp + rise(kind, a, F + s.bw + 0.08) };
  }

  window.CastleTrim = { version: 16, tudor: tudor, geometry: geometry, reveal: reveal, portal: portal, merge: merge, mould: mould, prof: prof, rise: rise };
})();
