/* castle-shell.js: the castle's ways as grey shells, built at load from page/castle-model.js (the Architect's;
   Godric's Q10, answered 10.1, 13 October 2026, 12.22 pm: the ways walk as shells, every room off them a shut door;
   docs/handoff/architect.md, "The shells plan, Q10"). Geometry and light only, at true size: the model's walls, floors,
   ceilings, doorways and stairs, nothing drawn, nothing generated (his "drawing no", 12 October 2026, 8.01 pm). A
   model change re-shapes every shell; a built room takes its shell's place.

   CastleShell.build(F, M, placeId) builds the place and, one step on, every way joined to it by an open mouth, into
   one THREE.Group in the place's own frame: x east, y up, z south (so -z is north), the origin at the place's plan
   centre on its floor. It returns { group, place, places, doors, ways, stairs, stands, toLocal }:
     doors   a shut door each: { id, to, mesh, stand } (the mesh is the leaf, userData.door its id)
     ways    an open mouth each to another way: { id, to, mesh, stand } (the mesh fills the opening, unseen, for taps)
     stands  where he can stand: { name, pos, look, thing } in the group's frame; the first is the start. These are
             the defaults (a stand square to each door and mouth, the start inside the way he arrives by); the stands
             and the look round at each are Interaction's to set (docs/interaction-vocabulary.md §2, req 208), by
             passing their own list to the page.
   Reads only the model and castle.js's helpers (F.solid, F.register); edits nothing of the shared frame. */
(function () {
'use strict';

var GREY = { wall: 0x75726e, floor: 0x6a6764, ceil: 0x5e5b58, door: 0x4a4540, stair: 0x807c77, frame: 0x625e59 };
var WALL_T = 0.8, EYE = 1.35, STAND_OFF = 2.4;
var LAYER = { wall: 0, floor: 1, ceiling: 1, door: 2, stair: 3, way: 4 };   /* castle.js's five tints, under Layers */

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function levelZ(M, id) {
  for (var i = 0; i < M.levels.length; i++) if (M.levels[i].id === id) return M.levels[i].z;
  return 0;
}
/* a group's point into the castle's frame (the model's rule, as tools/castle-model.py's to_site) */
function toSite(M, gid, p) {
  if (!gid) return [p[0], p[1]];
  var g = M.groups.filter(function (x) { return x.id === gid; })[0].place, t = g.turn * Math.PI / 180;
  return [g.x + p[0] * Math.cos(t) - p[1] * Math.sin(t), g.y + p[0] * Math.sin(t) + p[1] * Math.cos(t)];
}

/* a place by id: a room, or a mass or court by its id made a slug ("stair hall" is stair-hall); its plan as a site
   polygon (counter-clockwise), its floor and ceiling as heights in the castle's frame */
function findPlace(M, id) {
  var r = (M.rooms || []).filter(function (x) { return x.id === id; })[0];
  if (r && r.shape && r.shape.rect) {
    var a = r.shape.rect, base = levelZ(M, r.level) + (r.group ? M.groups.filter(function (g) { return g.id === r.group; })[0].place.z - levelZ(M, r.level) : 0);
    var pts = [[a[0], a[1]], [a[2], a[1]], [a[2], a[3]], [a[0], a[3]]].map(function (p) { return toSite(M, r.group, p); });
    var floor = base + (r.floor || 0);
    return { id: r.id, name: r.name, kind: 'room', poly: pts, floor: floor, ceiling: base + (r.ceiling != null ? r.ceiling : (M.site.storey || 5.2) - 0.7),
      wall: r.wall || WALL_T, walls: r.walls || null, rec: r };
  }
  var all = (M.masses || []).concat(M.courts || []);
  var m = all.filter(function (x) { return slug(x.id) === id; })[0];
  if (m && m.rect) {
    var fl = String(m.floors || 'G').split('-'), lo = levelZ(M, fl[0]), hi = levelZ(M, fl[fl.length - 1]) + (M.site.storey || 5.2);
    var b = m.rect;
    return { id: slug(m.id), name: m.id, kind: 'mass', poly: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], floor: lo,
      ceiling: m.court ? null : hi, wall: WALL_T, walls: null, rec: m };
  }
  return null;
}
function matches(M, op, id) {
  var ids = (op.between || []).concat(op.room ? [op.room] : []);
  for (var i = 0; i < ids.length; i++) if (ids[i] === id || slug(ids[i]) === id) return true;
  return false;
}
function other(op, id) {
  var b = op.between || [];
  return slug(b[0]) === id ? slug(b[1]) : slug(b[0]);
}
function isWay(kind) { return /open mouth|archway|arch\b/.test(kind || ''); }
function isDoor(kind) { return /door/.test(kind || '') && !isWay(kind); }

/* the edge of a polygon a site point lies on (within a wall's thickness), and how far along it */
function onEdge(poly, p) {
  var best = null;
  for (var i = 0; i < poly.length; i++) {
    var a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    var s = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L, d = Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L;
    if (s < -0.01 || s > L + 0.01) continue;
    if (!best || d < best.d) best = { i: i, s: s, d: d, L: L };
  }
  return best && best.d < 1.2 ? best : null;
}

window.CastleShell = { build: function (F, M, placeId, o) {
  o = o || {};
  var P = findPlace(M, placeId);
  if (!P) return null;
  var cx = 0, cy = 0;
  P.poly.forEach(function (p) { cx += p[0] / P.poly.length; cy += p[1] / P.poly.length; });
  var z0 = P.floor;
  function toLocal(sx, sy, sz) { return new THREE.Vector3(sx - cx, (sz == null ? z0 : sz) - z0, -(sy - cy)); }

  var group = new THREE.Group();
  var mats = {};
  for (var k in GREY) mats[k] = F.solid(GREY[k]);
  mats.wall.side = THREE.DoubleSide;
  var out = { group: group, place: P, places: [P], doors: [], ways: [], stairs: [], stands: [], toLocal: toLocal };

  function quad(w, h, mat, layer) { return F.register(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat), LAYER[layer]); }
  function slab(w, h, d, mat, layer) { return F.register(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), LAYER[layer]); }

  /* one place: floor, ceiling and its walls with their openings */
  function buildPlace(Q) {
    var xs = Q.poly.map(function (p) { return p[0]; }), ys = Q.poly.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var H = (Q.ceiling != null ? Q.ceiling : Q.floor + 12) - Q.floor;
    var c = toLocal((x0 + x1) / 2, (y0 + y1) / 2, Q.floor);
    var floor = quad(x1 - x0, y1 - y0, mats.floor, 'floor');
    floor.rotation.x = -Math.PI / 2; floor.position.copy(c); floor.name = Q.id + '-floor'; group.add(floor);
    if (Q.ceiling != null) {
      var ceil = quad(x1 - x0, y1 - y0, mats.ceil, 'ceiling');
      ceil.rotation.x = Math.PI / 2; ceil.position.set(c.x, c.y + H, c.z); ceil.name = Q.id + '-ceiling'; group.add(ceil);
    }
    /* the openings on each edge: a gap [s0, s1] up to its head h */
    var gaps = Q.poly.map(function () { return []; });
    (M.openings || []).forEach(function (op) {
      if (!matches(M, op, Q.id)) return;
      var gid = op.group || null;
      var pts = op.span ? op.span.map(function (p) { return toSite(M, gid, p); }) : op.at ? [toSite(M, gid, op.at)] : null;
      if (!pts) return;
      var e = onEdge(Q.poly, pts[0]);
      if (!e) return;
      var s0, s1;
      if (pts.length > 1) { var e2 = onEdge(Q.poly, pts[1]); s0 = Math.min(e.s, e2 ? e2.s : e.s); s1 = Math.max(e.s, e2 ? e2.s : e.s); }
      else { s0 = e.s - (op.w || 1) / 2; s1 = e.s + (op.w || 1) / 2; }
      var sill = op.sill || 0, h = Math.min(H, (op.h || 2.2) + sill);
      gaps[e.i].push({ s0: s0, s1: s1, sill: sill, h: h, op: op });
    });
    Q.poly.forEach(function (a, i) {
      var b = Q.poly[(i + 1) % Q.poly.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      /* a wall already built from the other side (the place one step on shares it) is not built twice */
      var midE = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (Q !== P && out.places.some(function (R) { var e = R !== Q && onEdge(R.poly, midE); return e && e.d < 0.05; })) return;
      var ux = dx / L, uy = dy / L, nx = uy, ny = -ux;                 /* outward, the polygon counter-clockwise */
      var t = Q.walls ? (Q.walls[['south', 'east', 'north', 'west'][i]] || Q.wall) : Q.wall;
      var ang = Math.atan2(uy, ux);                                      /* the wall's turn about y, in the local frame */
      function piece(s0, s1, ya, yb, name) {
        if (s1 - s0 < 0.02 || yb - ya < 0.02) return;
        var sm = (s0 + s1) / 2, p = toLocal(a[0] + ux * sm + nx * t / 2, a[1] + uy * sm + ny * t / 2, Q.floor);
        var m = slab(s1 - s0 + (s0 <= 0.01 ? t : 0) + (s1 >= L - 0.01 ? t : 0), yb - ya, t, mats.wall, 'wall');
        var shift = ((s1 >= L - 0.01 ? t : 0) - (s0 <= 0.01 ? t : 0)) / 2;
        m.position.set(p.x + ux * shift, p.y + (ya + yb) / 2, p.z - uy * shift);
        m.rotation.y = ang; m.name = name; group.add(m);
      }
      var gs = gaps[i].sort(function (g, h) { return g.s0 - h.s0; }), at = 0;
      gs.forEach(function (g, j) {
        piece(at, g.s0, 0, H, Q.id + '-wall-' + i + '-' + j);
        piece(g.s0, g.s1, g.h, H, Q.id + '-head-' + g.op.id);
        piece(g.s0, g.s1, 0, g.sill, Q.id + '-sill-' + g.op.id);
        at = g.s1;
        var sm = (g.s0 + g.s1) / 2, w = g.s1 - g.s0, hh = g.h - g.sill;
        var mid = toLocal(a[0] + ux * sm, a[1] + uy * sm, Q.floor);
        var inward = new THREE.Vector3(-nx, 0, ny);                     /* site (-nx, -ny) into the local frame */
        var to = other(g.op, Q.id);
        if (isDoor(g.op.kind) && !out.doors.some(function (d) { return d.id === g.op.id; })) {
          var leaf = slab(w - 0.08, hh - 0.02, 0.12, mats.door, 'door');
          leaf.position.set(mid.x + nx * t * 0.5, g.sill + (hh - 0.02) / 2, mid.z - ny * t * 0.5);
          leaf.rotation.y = ang; leaf.name = 'door-' + g.op.id; leaf.userData.door = g.op.id; group.add(leaf);
          out.doors.push({ id: g.op.id, to: to, mesh: leaf, w: w, h: hh, mid: mid, inward: inward, place: Q.id });
        } else if (isWay(g.op.kind) && !out.ways.some(function (d) { return d.id === g.op.id; })) {
          var fill = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ visible: false }));
          fill.position.set(mid.x, g.sill + hh / 2, mid.z); fill.rotation.y = ang; fill.name = 'way-' + g.op.id; fill.userData.way = g.op.id;
          group.add(fill);
          out.ways.push({ id: g.op.id, to: to, mesh: fill, w: w, h: hh, mid: mid, inward: inward, place: Q.id, at: [a[0] + ux * sm, a[1] + uy * sm] });
        }
      });
      piece(at, L, 0, H, Q.id + '-wall-' + i + '-end');
    });
  }
  buildPlace(P);
  /* one step on: the ways joined to this one by an open mouth, built in the same frame */
  /* (only a place whose wall the mouth is in; a way to a place not yet in the model, or not beside it, shows a dark
     recess beyond the mouth for now) */
  out.ways.slice().forEach(function (w) {
    if (out.places.some(function (q) { return q.id === w.to; })) return;
    var Q = findPlace(M, w.to);
    if (Q && onEdge(Q.poly, w.at)) { out.places.push(Q); buildPlace(Q); w.built = true; return; }
    var depth = 3.0, rec = slab(w.w + 0.4, w.h + 0.2, depth, F.solid(0x141210), 'way');
    rec.position.set(w.mid.x - w.inward.x * (depth / 2 + 0.9), w.h / 2, w.mid.z - w.inward.z * (depth / 2 + 0.9));
    rec.rotation.y = Math.atan2(w.inward.x, w.inward.z); rec.material.side = THREE.BackSide; rec.name = 'beyond-' + w.id;
    group.add(rec);
  });

  /* the stairs in the places built: a straight flight's treads along its rise, from its span's foot to its head */
  (M.stairs || []).forEach(function (s) {
    if (!s.up || !s.span) return;
    var inIt = out.places.filter(function (q) { return (s.rooms || [s.room]).some(function (r) { return r === q.id || slug(r) === q.id; }); })[0];
    if (!inIt) return;
    var a = toSite(M, s.group, s.span[0]), b = toSite(M, s.group, s.span[1]);
    var bx0 = Math.min(a[0], b[0]), bx1 = Math.max(a[0], b[0]), by0 = Math.min(a[1], b[1]), by1 = Math.max(a[1], b[1]);
    var alongY = s.up[1] !== 0, run = alongY ? by1 - by0 : bx1 - bx0, across = alongY ? bx1 - bx0 : by1 - by0;
    var n = s.treads, go = run / n, rise = (s.to - s.from) / n;
    for (var i = 0; i < n; i++) {
      var f = (i + 0.5) / n, top = inIt.floor + s.from + rise * (i + 1);
      var sx = alongY ? (bx0 + bx1) / 2 : (s.up[0] > 0 ? bx0 + f * run : bx1 - f * run);
      var sy = alongY ? (s.up[1] > 0 ? by0 + f * run : by1 - f * run) : (by0 + by1) / 2;
      var hgt = top - inIt.floor, p = toLocal(sx, sy, inIt.floor);
      var tr = slab(alongY ? across : go, Math.max(0.05, hgt), alongY ? go : across, mats.stair, 'stair');
      tr.position.set(p.x, p.y + hgt / 2, p.z); tr.name = s.id + '-' + (i + 1); tr.userData.stair = s.id; group.add(tr);
    }
    if (s.landing) {
      var L = s.landing, la = toSite(M, s.group, [L[0], L[1]]), lb = toSite(M, s.group, [L[2], L[3]]);
      var lw = Math.abs(lb[0] - la[0]), ld = Math.abs(lb[1] - la[1]), lt = s.to;
      var lp = toLocal((la[0] + lb[0]) / 2, (la[1] + lb[1]) / 2, inIt.floor);
      var land = slab(lw, lt, ld, mats.stair, 'stair');
      land.position.set(lp.x, lp.y + lt / 2, lp.z); land.name = s.id + '-landing'; land.userData.stair = s.id; group.add(land);
    }
    out.stairs.push({ id: s.id, place: inIt.id });
  });

  /* the default stands: square to each door and each mouth, STAND_OFF inside it, the eye at EYE (§11); the start is
     inside the way he arrives by (o.from), or else inside the first door of this place that leads out of the castle's
     ways, facing in */
  function standAt(d, name) {
    var off = Math.min(10, Math.max(STAND_OFF, d.w * 1.1, d.h * 1.6));   /* far enough back to see it whole */
    var pos = d.mid.clone().add(d.inward.clone().multiplyScalar(off)); pos.y = (pos.y || 0) + EYE;
    var look = d.mid.clone(); look.y = Math.max(EYE, d.h * 0.45);
    return { name: name, pos: pos, look: look, thing: d.mesh };
  }
  /* he arrives through a mouth standing in it, a step back on the side he came from, looking in; through a door, a
     step inside it */
  function facingIn(d, name) {
    var pos = d.mid.clone().add(d.inward.clone().multiplyScalar(d.mesh.userData.way ? -1.0 : STAND_OFF)); pos.y = EYE;
    var look = d.mid.clone().add(d.inward.clone().multiplyScalar(STAND_OFF + 20)); look.y = EYE + 0.3;
    return { name: name, pos: pos, look: look, thing: null };
  }
  var mine = out.doors.concat(out.ways).filter(function (d) { return d.place === P.id; });
  var entry = mine.filter(function (d) { return o.from && d.to === o.from; })[0] || mine.filter(function (d) { return o.start && d.id === o.start; })[0] || mine[0];
  if (entry) out.stands.push(facingIn(entry, 'start'));
  mine.forEach(function (d) { var s = standAt(d, d.id); d.stand = s; out.stands.push(s); });
  return out;
} };
})();
