/* panelling.js: the castle's oak panelling in code (Godric's 1 on fawkes-panelling-1020, 20 October 2026, 9.34 pm,
   "Lived-in rooms, carved": the staff room, "a large, paneled room" CoS 16, "a long, panelled room" PoA 7, widened to
   the teachers' offices and studies, the library, the Headmaster's study and Pomfrey's office; halls, corridors and
   classrooms stay stone). The schedule is the Architect's (docs/architect/materials.md: P4 and P5 linenfold, P6 and P7
   fielded, dark oak to a cornice); the precedents the Curator's (docs/curator/panelling.md, req 835). Rough first:
   volume and plain tones, the carving as cut relief on canvas, nothing glows. Three r128, the global the shell loads;
   colours only through the caller's materials. The frame is the shell's (page/castle-shell.js): x east, y up, z south.

   CastlePanelling.wall(THREE, o, mats)  one wall's panelling, a group in the wall's own frame: x along the wall from
       0 to o.len, y up from the floor, z out of the wall into the room (the face at z 0). o: { len, h (to the ceiling), to
       (where the panelling stops, its frieze and cornice under it; the ceiling when not given),
       style 'tudor' (P4, P5) or 'fielded' (P6, P7), grade 0 to 3, gaps: [{ x0, x1, y0, y1, door }] where it stops (a
       door, a window, a fire; a door's gap takes the overdoor at grade 3) }. mats: { oak, deep (the panels, a step
       darker), carve (optional, a lit relief's base colour as hex) }.
   CastlePanelling.forPlace(THREE, Q, o)  every wall of a shell place Q ({ id, poly, floor, ceiling }): o { toLocal(x,
       y, z), style, grade, to, mats, openings: [{ at: [x, y], w, sill, h, door }] in site metres (a fire is an opening
       with its sill 0 and h its mantel) }; returns the group, named <id>-panelling, or null. Each wall stands on the
       shell's own face, its back bearing 1 cm into the wall, the plinth into the floor and the cornice into the
       ceiling; every mesh carries userData.owner, <id>-panelling. The plan may wind either way, and the cornices
       mitre at the corners (req 843). An opening is either in site metres, { at: [x, y],
       w, sill, h, door }, or in the room's own frame, { wall (the poly's edge i, from poly[i] to poly[i + 1]), at
       (metres along it), w, sill, h, door }.
   CastlePanelling.GRADES  the ladder, plain to rich, each rung named:
       0 plain    framed panels, flat, a plain frieze row and a plain cornice
       1 moulded  tudor: linenfold in the lowest rank, plain above; fielded: bolection mouldings round the fields
       2 carved   a carved frieze under the cornice (tudor: a round-arched arcade; fielded: a run of leaves)
       3 rich     2, and a carved beast over each door: the school's four in a row (LumosCarving.boss, drawn.js) */
(function () {
  'use strict';

  var GRADES = ['plain', 'moulded', 'carved', 'rich'];
  var BEAR = 0.01;   /* every piece bears 1 cm into what it meets, the wall, the floor, the ceiling, never flush (the seams rule; the Architect, 9.55 pm) */
  var LIFT = 0.006;  /* a relief canvas stands this far off its board's face, past the seams rule's 4 mm (req 843) */
  /* the heights, metres from the floor (precedents to confirm: docs/curator/panelling.md, req 835's open slots).
     The chair rail at 0.9, where the staff room's chair backs (0.85 to 1.1) rest on it (Interiors, 9.55 pm). */
  var SPEC = {
    tudor:   { plinth: 0.12, rail: 0.9, railH: 0.09, rank: 0.56, module: 0.42, stile: 0.075, frieze: 0.40, cornice: 0.16, proud: 0.045, inset: 0.022 },
    fielded: { plinth: 0.20, rail: 0.86, railH: 0.08, rank: 9.00, module: 0.78, stile: 0.11, frieze: 0.22, cornice: 0.26, proud: 0.05, inset: 0.012 }
  };

  /* one unit panel, 1 x 1, its face at z 0 (scaled to each panel's size by the instance's matrix) */
  function panelGeom(THREE, style, grade) {
    if (style === 'tudor' && grade >= 1) {   // linenfold: the folds as a profile run up the panel, the ends cut square
      var s = new THREE.Shape(), n = 5, i, k;
      s.moveTo(-0.5, -0.004);
      for (i = 0; i <= n * 8; i++) {
        var t = i / (n * 8), x = -0.42 + 0.84 * t, f = Math.abs(Math.sin(t * n * Math.PI));
        s.lineTo(x, 0.004 + 0.03 * Math.pow(f, 0.6));
      }
      s.lineTo(0.5, -0.004); s.lineTo(-0.5, -0.004);
      var g = new THREE.ExtrudeGeometry(s, { depth: 0.86, bevelEnabled: false, curveSegments: 4 });
      g.rotateX(Math.PI / 2); g.translate(0, 0.43, 0);   // the folds stand up the panel, 0.86 of its height, proud of its back
      var back = new THREE.PlaneGeometry(1, 1);
      return { folds: g, back: back };
    }
    if (style === 'fielded') {   // a raised field: a flat middle and its four bevels falling to the margin
      var b = 0.16, r = 0.012, p = [
        [-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0],
        [-0.5 + b, -0.5 + b, r], [0.5 - b, -0.5 + b, r], [0.5 - b, 0.5 - b, r], [-0.5 + b, 0.5 - b, r]];
      var idx = [4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
      var fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.Float32BufferAttribute([].concat.apply([], p), 3));
      fg.setIndex(idx); fg.computeVertexNormals();
      return { back: fg };
    }
    return { back: new THREE.PlaneGeometry(1, 1) };
  }

  /* instances of a unit geometry, each [x, y, z, sx, sy, sz] */
  function instanced(THREE, geom, mat, list, name) {
    if (!list.length) return null;
    var m = new THREE.InstancedMesh(geom, mat, list.length), M = new THREE.Matrix4(), q = new THREE.Quaternion();
    list.forEach(function (a, i) { M.compose(new THREE.Vector3(a[0], a[1], a[2]), q, new THREE.Vector3(a[3], a[4], a[5])); m.setMatrixAt(i, M); });
    m.name = name; return m;
  }

  /* the clear runs of [0, len] in the band y0..y1, the gaps that reach into it cut out */
  function runs(len, gaps, y0, y1) {
    var cut = gaps.filter(function (g) { return g.y0 < y1 - 1e-3 && g.y1 > y0 + 1e-3; })
                  .map(function (g) { return [Math.max(0, g.x0), Math.min(len, g.x1)]; })
                  .sort(function (a, b) { return a[0] - b[0]; });
    var out = [], x = 0;
    cut.forEach(function (c) { if (c[0] - x > 0.12) out.push([x, c[0]]); x = Math.max(x, c[1]); });
    if (len - x > 0.12) out.push([x, len]);
    return out;
  }

  /* a canvas drawn in sRGB, read so (as ceilings.js's faces), else it washes out pale on the oak (the Architect, req 843) */
  function srgb(THREE, t) {
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    return t;
  }

  /* a canvas relief run along the frieze: tudor a round-arched arcade, fielded a run of stiff leaves */
  function friezeTexture(THREE, style, base, hpx) {
    var c = document.createElement('canvas'), w = hpx * 2; c.width = w; c.height = hpx;
    var x = c.getContext('2d'), col = [base >> 16 & 255, base >> 8 & 255, base & 255];
    var css = function (k) { return 'rgb(' + col.map(function (v) { return Math.min(255, Math.round(v * k)); }).join(',') + ')'; };
    x.fillStyle = css(1); x.fillRect(0, 0, w, hpx);
    function cut(path) {   // lit from above: the lower lip catches, the upper in shadow
      x.save(); x.translate(0, -2); x.fillStyle = css(0.55); x.fill(path); x.translate(0, 4); x.fillStyle = css(1.25); x.fill(path);
      x.translate(0, -2); x.fillStyle = css(0.78); x.fill(path); x.restore();
    }
    var p = new Path2D(), k;
    if (style === 'tudor') {   // two round arches a repeat on short columns, a sunk field in each
      for (k = 0; k < 2; k++) {
        var cx = w / 4 + k * w / 2, a = w / 4 - hpx * 0.16, top = hpx * 0.22, bot = hpx * 0.82;
        p.moveTo(cx - a, bot); p.lineTo(cx - a, top + a); p.arc(cx, top + a, a, Math.PI, 0); p.lineTo(cx + a, bot); p.closePath();
      }
    } else {   // a run of stiff leaves, each a pointed lobe from a stem
      for (k = 0; k < 4; k++) {
        var lx = w / 8 + k * w / 4, lw = w / 10;
        p.moveTo(lx, hpx * 0.85); p.quadraticCurveTo(lx - lw, hpx * 0.5, lx, hpx * 0.15); p.quadraticCurveTo(lx + lw, hpx * 0.5, lx, hpx * 0.85);
      }
    }
    cut(p);
    var t = srgb(THREE, new THREE.CanvasTexture(c)); t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
    return t;
  }

  /* the overdoor: the school's four beasts in a row, cut in an oak board (carving.js), lit from above */
  function overdoorTexture(THREE, base, wpx) {
    var c = document.createElement('canvas'), hpx = Math.round(wpx / 4); c.width = wpx; c.height = hpx;
    var x = c.getContext('2d'), hex = '#' + ('00000' + base.toString(16)).slice(-6);
    x.fillStyle = hex; x.fillRect(0, 0, wpx, hpx);
    if (window.LumosCarving && window.LumosBeasts) {
      ['lion', 'eagle', 'badger', 'snake'].forEach(function (b, i) {
        window.LumosCarving.boss(x, b, wpx / 8 + i * wpx / 4, hpx / 2, hpx * 0.42, { stone: hex, light: -Math.PI / 2, form: 'bare' });
      });
    }
    return srgb(THREE, new THREE.CanvasTexture(c));
  }

  function wall(THREE, o, mats) {
    var S = SPEC[o.style] || SPEC.tudor, grade = Math.max(0, Math.min(3, o.grade | 0)), G = new THREE.Group();
    var len = o.len, h = Math.min(o.h, o.to || o.h), gaps = o.gaps || [];   // o.to: the panelling stops there, the wall above the shell's
    var top = h - S.cornice - S.frieze, frames = [], panels = [], P = panelGeom(THREE, o.style, grade);
    /* req 3183, the check (mcgonagalls-office's 33-degree corner by the turret): at an acute inside corner the next wall's
       face leans over this one, x = z cot(angle) out from the corner, so a square-ended piece d deep runs its front edge
       into that stone; each piece touching such a corner stops where its front meets the face (cot from the mitre's cot
       of the half angle: (m*m - 1) / 2m, 0 at a square corner, nothing done at an obtuse or outside one) */
    var ac = (o.mitre || [0, 0]).map(function (m) { return m > 1 ? (m * m - 1) / (2 * m) : 0; });
    var trimEnds = function (x0, x1, d) { return [x0 < 1e-3 ? Math.max(x0, (d + 0.005) * ac[0]) : x0, x1 > len - 1e-3 ? Math.min(x1, len - (d + 0.005) * ac[1]) : x1]; };
    var unit = new THREE.BoxGeometry(1, 1, 1), box = function (x0, x1, y0, y1, d) {
      var te = trimEnds(x0, x1, d); x0 = te[0]; x1 = te[1]; if (x1 - x0 < 0.01) return;
      frames.push([(x0 + x1) / 2, (y0 + y1) / 2, (d - BEAR) / 2, x1 - x0, y1 - y0, d + BEAR]);   // its back 1 cm into the wall
    };
    /* the bands, bottom to top: the plinth, the lowest rank to the chair rail, the ranks above to the frieze */
    var bands = [], y = S.plinth;
    bands.push({ y0: y, y1: S.rail, low: true });
    y = S.rail + S.railH;
    var nUp = Math.max(1, Math.round((top - y) / S.rank)), step = (top - y) / nUp;
    for (var r = 0; r < nUp; r++) bands.push({ y0: y + r * step, y1: y + (r + 1) * step });
    /* the plinth and the chair rail run through every clear stretch at their height */
    runs(len, gaps, 0, S.plinth).forEach(function (u) { box(u[0], u[1], -BEAR, S.plinth, S.proud + 0.01); });
    runs(len, gaps, S.rail, S.rail + S.railH).forEach(function (u) { box(u[0], u[1], S.rail, S.rail + S.railH, S.proud + 0.025); });
    bands.forEach(function (b) {
      var sh = S.stile;
      runs(len, gaps, b.y0, b.y1).forEach(function (u) {
        var n = Math.max(1, Math.round((u[1] - u[0]) / (b.low && o.style === 'fielded' ? S.module * 1.6 : S.module))), cw = (u[1] - u[0]) / n;
        if (!b.low) box(u[0], u[1], b.y1 - sh / 2, b.y1, S.proud);   // the rail at the band's head (the low band's is the chair rail)
        box(u[0], u[1], b.y0, b.y0 + sh / 2, S.proud);
        for (var i = 0; i <= n; i++) {
          var sx = u[0] + i * cw, w2 = (i === 0 || i === n) ? sh : sh / 2;
          box(Math.max(u[0], sx - (i === 0 ? 0 : w2)), Math.min(u[1], sx + (i === n ? 0 : w2)), b.y0, b.y1, S.proud);
          if (i < n) {
            var px0 = sx + (i === 0 ? sh : sh / 2), px1 = sx + cw - (i === n - 1 ? sh : sh / 2), py0 = b.y0 + sh / 2, py1 = b.y1 - (b.low ? 0 : sh / 2);
            panels.push([(px0 + px1) / 2, (py0 + py1) / 2, S.proud - S.inset, px1 - px0, py1 - py0, 1, b.low]);
          }
        }
      });
    });
    /* the frieze and the cornice over every clear stretch at their height (a window that reaches them breaks them) */
    var tops = runs(len, gaps, top, h);
    tops.forEach(function (u, k) {
      u = trimEnds(u[0], u[1], S.proud);   /* req 3183: the frieze clear of an acute corner (the cornice below keeps its mitre) */
      /* req 3211 (the Architect's seams v1, item 5): the frieze bears 2 mm, 8 mm short of BEAR, so its back never lies in one plane with
         an opening's lining, which ends 1 cm into the wall (clementine.html's lined bookcase) */
      var FB = BEAR - 0.008, ul = u[1] - u[0], fr = new THREE.Mesh(new THREE.BoxGeometry(ul, S.frieze, S.proud + FB), mats.oak);
      fr.position.set((u[0] + u[1]) / 2, top + S.frieze / 2, (S.proud - FB) / 2); fr.name = 'panelling-frieze-' + k; G.add(fr);
      if (grade >= 2) {
        var tex = friezeTexture(THREE, o.style, mats.carve != null ? mats.carve : 0x684e38, 128);
        tex.repeat.set(ul / (S.frieze * 2), 1);
        var fm = new THREE.Mesh(new THREE.PlaneGeometry(ul, S.frieze * 0.9), new THREE.MeshLambertMaterial({ map: tex }));
        fm.position.set((u[0] + u[1]) / 2, top + S.frieze / 2, S.proud + LIFT); fm.name = 'panelling-frieze-carved-' + k; G.add(fm);
      }
    });
    var cs = new THREE.Shape(), C = S.cornice;   // the cornice in section: a fillet, a cove and a projecting top
    var cTop = C + (h >= o.h - 1e-3 ? BEAR : 0);   // to the ceiling: 1 cm into it
    var CB = BEAR - 0.008;   // req 3211: the cornice's back, like the frieze's, 8 mm short of a lining's end 1 cm in
    cs.moveTo(-CB, 0); cs.lineTo(S.proud + 0.01, 0); cs.lineTo(S.proud + 0.01, C * 0.18);
    cs.quadraticCurveTo(S.proud + 0.02, C * 0.75, S.proud + C * 0.7, C * 0.8); cs.lineTo(S.proud + C * 0.7, C); cs.lineTo(S.proud + C * 0.7, cTop); cs.lineTo(-CB, cTop); cs.closePath();
    tops.forEach(function (u, k) {
      /* req 3183, the check: a run too short to take its mitre (below) at an acute corner stops square where its
         projecting top meets the next wall's face (mcgonagalls-office's 0.57 m side, 8.5 cm into the stone) */
      var mm = Math.max(1, Math.abs(u[0] < 1e-3 && o.mitre ? o.mitre[0] : 0), Math.abs(u[1] > len - 1e-3 && o.mitre ? o.mitre[1] : 0));
      if (!(u[1] - u[0] > 2.2 * (S.proud + C * 0.7) * mm)) u = trimEnds(u[0], u[1], S.proud + C * 0.7);
      var L = u[1] - u[0], cg = new THREE.ExtrudeGeometry(cs, { depth: L, bevelEnabled: false, curveSegments: 6 });
      /* mitred where the run meets the next wall's cornice at a corner (o.mitre: [start, end], the cot of half the
         corner's angle; 1 a square inside corner, below 0 an outside one), so the two never lie in one plane. Before the
         turn below, a vertex's x is its depth into the room and its z runs back from the run's end (0 at u[1], L at u[0]) */
      var m0 = u[0] < 1e-3 && o.mitre ? o.mitre[0] : 0, m1 = u[1] > len - 1e-3 && o.mitre ? o.mitre[1] : 0;
      if ((m0 || m1) && L > 2.2 * (S.proud + C * 0.7) * Math.max(1, Math.abs(m0), Math.abs(m1))) {
        var pa = cg.attributes.position;
        for (var v = 0; v < pa.count; v++) {
          var vz = pa.getZ(v), vd = pa.getX(v);
          if (m0 && vz > L - 1e-4) pa.setZ(v, L - vd * m0); else if (m1 && vz < 1e-4) pa.setZ(v, vd * m1);
        }
        pa.needsUpdate = true; cg.computeVertexNormals();
      }
      var cm = new THREE.Mesh(cg, mats.oak); cm.rotation.y = -Math.PI / 2; cm.position.set(u[1], top + S.frieze, 0);   // the profile out into the room, run back along the wall
      cm.name = 'panelling-cornice-' + k; G.add(cm);
    });
    /* the overdoor at grade 3: the four beasts in a board over each door's head, in the first rank above it */
    if (grade >= 3) gaps.filter(function (g) { return g.door; }).forEach(function (g, k) {
      /* req 3183, the check: the board and its frame stay on their own wall, 6 cm short of each end (dumbledores-office's
         1.18 m flat sides took a 1.92 m board 0.37 m past both ends into the next side's stone); under 0.6 m, none */
      var ow = Math.min(2.4, Math.max(1.2, (g.x1 - g.x0) + 0.6), len - 0.2), oh = ow / 4;
      if (ow < 0.6) return;
      var oc = Math.max(0.1 + ow / 2, Math.min(len - 0.1 - ow / 2, (g.x0 + g.x1) / 2));
      var ot = overdoorTexture(THREE, mats.carve != null ? mats.carve : 0x684e38, 512);
      var om = new THREE.Mesh(new THREE.PlaneGeometry(ow, oh), new THREE.MeshLambertMaterial({ map: ot }));
      om.position.set(oc, Math.min(top - oh / 2 - 0.05, g.y1 + 0.12 + oh / 2), S.proud + 0.008 + LIFT);
      om.name = 'panelling-overdoor-' + k; G.add(om);
      box(oc - ow / 2 - 0.04, oc + ow / 2 + 0.04, om.position.y - oh / 2 - 0.04, om.position.y + oh / 2 + 0.04, S.proud + 0.008);
    });
    var fm2 = instanced(THREE, unit, mats.oak, frames, 'panelling-frames'); if (fm2) G.add(fm2);
    var flat = panels.filter(function (a) { return !(P.folds && a[6]); });
    var fold = panels.filter(function (a) { return P.folds && a[6]; });
    var pm = instanced(THREE, P.back, mats.deep, flat.map(function (a) { return a.slice(0, 6); }), 'panelling-panels'); if (pm) G.add(pm);
    if (fold.length) {
      G.add(instanced(THREE, P.back, mats.deep, fold.map(function (a) { return a.slice(0, 6); }), 'panelling-linen-back'));
      G.add(instanced(THREE, P.folds, mats.oak, fold.map(function (a) { return [a[0], a[1], a[2], a[3], a[4], 1]; }), 'panelling-linenfold'));
    }
    if (o.style === 'fielded' && grade >= 1) {   // the bolection: a raised moulding round each field, proud of the frame
      var bol = [];
      flat.forEach(function (a) {
        var t = 0.03, d = S.proud + 0.012;
        bol.push([a[0], a[1] - a[4] / 2 + t / 2, d / 2, a[3], t, d], [a[0], a[1] + a[4] / 2 - t / 2, d / 2, a[3], t, d],
                 [a[0] - a[3] / 2 + t / 2, a[1], d / 2, t, a[4], d], [a[0] + a[3] / 2 - t / 2, a[1], d / 2, t, a[4], d]);
      });
      var bm = instanced(THREE, unit, mats.oak, bol, 'panelling-bolection'); if (bm) G.add(bm);
    }
    G.traverse(function (m) { if (m.isMesh) m.userData.owner = o.owner || 'panelling'; });
    G.userData = { owner: o.owner || 'panelling', top: top, rail: S.rail, plinth: S.plinth, frieze: S.frieze, cornice: S.cornice, bands: bands.length };
    return G;
  }

  /* every wall of a place: the poly's edges, each wall's frame turned to face into the room and stand upright whichever
     way the plan winds (req 843: the first build stood upright only on a clockwise plan, the shell's run counter-clockwise) */
  function forPlace(THREE, Q, o) {
    if (!Q || !Q.poly || Q.ceiling == null) return null;
    var G = new THREE.Group(), h = Q.ceiling - Q.floor, P = Q.poly, n = P.length, ar = 0, i;
    for (i = 0; i < n; i++) ar += P[i][0] * P[(i + 1) % n][1] - P[(i + 1) % n][0] * P[i][1];
    var side = ar > 0 ? 1 : -1;   // the room lies left of each edge on a counter-clockwise plan, right on a clockwise one
    var edge = function (j) { var a = P[j], b = P[(j + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L, L]; };
    /* each corner's mitre, the cot of half the room's angle there (1 square, below 0 an outside corner), 0 by a skipped edge */
    var mit = P.map(function (p, j) {
      var ei = edge((j - 1 + n) % n), eo = edge(j);
      if (ei[2] < 0.3 || eo[2] < 0.3) return 0;
      var t = Math.tan((Math.PI - Math.atan2(side * (ei[0] * eo[1] - ei[1] * eo[0]), ei[0] * eo[0] + ei[1] * eo[1])) / 2);
      return Math.abs(t) < 0.05 ? 0 : 1 / t;
    });
    var up = new THREE.Vector3().subVectors(o.toLocal(P[0][0], P[0][1], Q.floor + 1), o.toLocal(P[0][0], P[0][1], Q.floor));
    var WS = [];   // each wall's run, built once every wall's gaps are known (a corner's return needs its neighbour's)
    for (i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.3) continue;
      var nx = -side * (b[1] - a[1]) / len, ny = side * (b[0] - a[0]) / len;   // the normal into the room
      /* the frame (x along, z into the room, y = z cross x) is upright when x runs one way: run the wall from b when not */
      var A = o.toLocal(a[0], a[1], Q.floor), B = o.toLocal(b[0], b[1], Q.floor), N = o.toLocal(a[0] + nx, a[1] + ny, Q.floor);
      var ex = new THREE.Vector3().subVectors(B, A).normalize(), ez = new THREE.Vector3().subVectors(N, A).normalize();
      var rev = new THREE.Vector3().crossVectors(ez, ex).dot(up) < 0;
      var s0 = rev ? b : a, ux = ((rev ? a : b)[0] - s0[0]) / len, uy = ((rev ? a : b)[1] - s0[1]) / len;
      var local = (o.openings || []).filter(function (op) { return op.wall === i && typeof op.at === 'number'; })
        .reduce(function (l, op) { return l.concat(gapOf(op, rev ? len - op.at : op.at)); }, []);
      var gaps = (o.openings || []).filter(function (op) {
        if (typeof op.at === 'number') return false;
        var t = (op.at[0] - s0[0]) * ux + (op.at[1] - s0[1]) * uy, dn = (op.at[0] - s0[0]) * nx + (op.at[1] - s0[1]) * ny;
        return t > -0.1 && t < len + 0.1 && Math.abs(dn) < 0.6;
      }).reduce(function (l, op) {
        return l.concat(gapOf(op, (op.at[0] - s0[0]) * ux + (op.at[1] - s0[1]) * uy));
      }, []).concat(local);
      var mi = rev ? [mit[(i + 1) % n], mit[i]] : [mit[i], mit[(i + 1) % n]];
      if (rev) { var T = A; A = B; B = T; ex.negate(); }
      WS[i] = { len: len, gaps: gaps, mi: mi, A: A, ex: ex, ez: ez, v0: rev ? (i + 1) % n : i, v1: rev ? i : (i + 1) % n };
    }
    /* req 3183, the check (pomfrey-office): a dressed opening whose dressing runs into an inside corner stands its
       architrave 6 cm proud there, across the next wall's end stile; that wall stops 10 cm short of the corner over the
       opening's height (its gap's own y), so the panelling returns clear of the moulding */
    WS.forEach(function (w, j) {
      w.gaps.forEach(function (g) {
        if (!g.trim) return;
        [[g.x0 < 0.02, w.v0], [g.x1 > w.len - 0.02, w.v1]].forEach(function (c) {
          if (!c[0] || !(mit[c[1]] > 0)) return;
          WS.forEach(function (u, k) {
            if (k === j) return;
            if (u.v0 === c[1]) u.gaps.push({ x0: -0.01, x1: 0.1, y0: g.y0, y1: g.y1, door: false, trim: 0 });
            else if (u.v1 === c[1]) u.gaps.push({ x0: u.len - 0.1, x1: u.len + 0.01, y0: g.y0, y1: g.y1, door: false, trim: 0 });
          });
        });
      });
    });
    WS.forEach(function (w, i) {
      var W = wall(THREE, { len: w.len, h: h, to: o.to, style: o.style, grade: o.grade, gaps: w.gaps, owner: Q.id + '-panelling', mitre: w.mi }, o.mats);
      var ey = new THREE.Vector3().crossVectors(w.ez, w.ex);
      W.matrixAutoUpdate = false;
      W.matrix.makeBasis(w.ex, ey, w.ez).setPosition(w.A);
      W.name = Q.id + '-panelling-' + i; G.add(W);
    });
    G.name = Q.id + '-panelling';
    return G;
  }

  /* req 3183 (the Furnisher's clash cause 7): an opening the shell dresses stops the panelling at its dressing's outer
     edge, not at the cut, or the last panel sinks into the jamb's base. The opening carries its dressing as trim (metres
     from the cut to the dressing's outer edge along the wall) or as cls and age (with grand, late, hood), read from
     CastleTrim.mould (page/castle-trim.js, the Architect's: bw, and a hood's ring 0.08 past it over the head). The
     shell's w is the cut less 2 cm (its ends 1 cm into the reveal); a dressed opening gives that centimetre back. An
     opening with neither stops at the cut as before (a hidden way, a fire, a bookcase recess). */
  function trimOf(op) {
    if (typeof op.trim === 'number') return op.trim;
    if (op.cls && window.CastleTrim && CastleTrim.mould) { var m = CastleTrim.mould(op.age, op.cls, op); return m && m.bw || 0; }
    return 0;
  }
  /* req 3183, the check (10.45 pm): the dressing's pieces that stand past bw, as castle-trim.js draws them (its lines
     ~231-298), each a gap of its own, so the panelling stops at them only in the ranks they reach: a window's sill stone
     0.05 past bw each side and 0.09 under the cut (pomfrey-office, dumbledores-office); a hood's ends and label stops
     0.10 past bw, from the stops' feet (at most 0.34 + 0.12 under the head's top, the P5 hood) or a pointed head's
     springing up to the head. A list: the opening's own gap first, then these (never doors, so no overdoor rides them) */
  function gapOf(op, t) {
    var sill = op.sill || 0, d = trimOf(op), e = d ? d + 0.01 : 0, hood = d && op.hood ? 0.08 : 0, top = sill + op.h;
    var G = [{ x0: t - op.w / 2 - e, x1: t + op.w / 2 + e, y0: d && sill > 0.05 ? Math.max(0, sill - e) : sill, y1: top + (d ? e + 0.01 + hood : 0), door: !!op.door, trim: d }];
    if (d && sill > 0.05) G.push({ x0: t - op.w / 2 - e - 0.05, x1: t + op.w / 2 + e + 0.05, y0: Math.max(0, sill - 0.11), y1: sill + 0.01, door: false, trim: d });
    if (d && op.hood) G.push({ x0: t - op.w / 2 - e - 0.11, x1: t + op.w / 2 + e + 0.11, y0: Math.max(sill, Math.min(top + d - 0.47, sill + op.h * 0.55)), y1: top + e + 0.01 + hood, door: false, trim: d });
    /* the architrave's lugs, 0.07 past bw from 0.30 under the head (castle-trim ~297), where the opening says so: castle-trim gives them only to a late P6 door (castle-trim.js:57-58; req 3220) */
    if (d && op.lugs) G.push({ x0: t - op.w / 2 - e - 0.08, x1: t + op.w / 2 + e + 0.08, y0: Math.max(sill, top - 0.31), y1: top + e, door: false, trim: d });
    return G;
  }

  window.CastlePanelling = { wall: wall, forPlace: forPlace, GRADES: GRADES, SPEC: SPEC };
})();
