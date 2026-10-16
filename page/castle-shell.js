/* castle-shell.js: the castle's ways as grey shells, built at load from page/castle-model.js (the Architect's;
   Godric's Q10, answered 10.1, 13 October 2026, 12.22 pm: the ways walk as shells, every room off them a shut door;
   docs/handoff/architect.md, "The shells plan, Q10"). Geometry and light only, at true size: the model's walls, floors,
   ceilings, doorways and stairs, nothing drawn, nothing generated (his "drawing no", 12 October 2026, 8.01 pm). A
   model change re-shapes every shell; a built room takes its shell's place.

   CastleShell.build(F, M, placeId) builds the place and, one step on, every way joined to it by an open mouth, into
   one THREE.Group in the place's own frame: x east, y up, z south (so -z is north), the origin at the place's plan
   centre on its floor. It returns { group, place, places, doors, ways, stairs, flights, stands, toLocal, route }:
     doors   a shut door each: { id, to, mesh, stand, level } (the mesh is the leaf, userData.door its id; under it
             a threshold through the wall, v4)
     ways    an open mouth each to another way: { id, to, mesh, stand, level, page } (the mesh fills the opening,
             unseen, for taps; page when the way leads into a built room, which is never shelled)
     flights a straight flight each: { id, foot, head, footPt, headPt } (foot and head are stands on the floors it
             joins; the treads carry userData.stair its id). Godric's 12.1 (13 October 2026, 4.57 pm): the stair
             hall's well, its landings and galleries drawn from the model's slabs ({ shape: { rect }, z }).
     stands  where he can stand: { name, pos, look, thing, level } in the group's frame (level: the floor under him,
             in the castle's frame); the first is the start. These are the defaults (a stand square to each door and
             mouth, one at each end of a flight, the start inside the way he arrives by); the stands and the look
             round at each are Interaction's to set (docs/interaction-vocabulary.md §2, req 208), by passing their
             own list to the page.
     route   route(a, b, level): the turns between two stands on one floor that keep him on the floor (null if none).
     hidden  v10: a hidden opening seen from its outer side, a wall, and over it an unseen tap: { id, to, mesh, stand,
             level, hidden } (the tap is its id to the events, as a door's: Events' `tap keep-east-stair-panel-3`)
   v10 (Events' req 534): a round room ({ circle, r }, 24 sides, a side square to its first door, its walls as deep as
   its deepest loop), a ring (a feature's `ring`: whole, or an arc where two of its openings stand across it, the long
   way round) and the leads (a feature with `rect`, `z` and `parapet`: a court in the sky, its breast and merlons, the
   crenels barred) are places too.
   Reads only the model and castle.js's helpers (F.solid, F.register); edits nothing of the shared frame. */
(function () {
'use strict';

var GREY = { wall: 0x75726e, floor: 0x6a6764, ceil: 0x5e5b58, door: 0x4a4540, stair: 0x807c77, frame: 0x625e59 };
var WALL_T = 0.8, EYE = 1.35, STAND_OFF = 2.4;
var SLAB = 0.7, WAIST = 0.6, STEP_OFF = 1.2, RAISED = 1.0;   /* a floor's vault, a flight's depth under its nosings (the
   well sheet's), a step off a flight's end, and the sill above which a way is reached from its own floor, not this one */
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
  /* v10: a round room, SIDES sides about the circle, one side's middle on its first door, its wall as deep as its
     deepest loop (the West Tower's drum, 3.2) */
  if (r && r.shape && r.shape.circle) {
    var cb = levelZ(M, r.level) + (r.group ? M.groups.filter(function (g) { return g.id === r.group; })[0].place.z - levelZ(M, r.level) : 0);
    var cc = toSite(M, r.group, r.shape.circle), rr = r.shape.r, deep = 0;
    var first = (M.openings || []).filter(function (op) { return op.at && (op.between || []).indexOf(r.id) >= 0; })[0];
    var off = first ? angle(cc, toSite(M, first.group || null, first.at)) : 0, half = 180 / SIDES;
    var cp = arcPts(cc, rr / Math.cos(half * Math.PI / 180), off + half, off + 360 + half, SIDES).slice(0, SIDES);
    (M.openings || []).forEach(function (op) { if (op.room === r.id && op.depth) deep = Math.max(deep, op.depth); });
    return { id: r.id, name: r.name, kind: 'room', poly: cp, area: { outer: cp, holes: [] }, round: { c: cc, r: rr }, floor: cb + (r.floor || 0),
      ceiling: cb + (r.ceiling != null ? r.ceiling : (M.site.storey || 5.2) - 0.7), wall: r.wall || deep || WALL_T, walls: null, rec: r };
  }
  /* v10: a ring (the lamplighters' gallery, the old wall-walk): whole, or where two of its openings stand across it (the
     turret's landing on the wall-walk) an arc the long way round between them; its shutters and loops by bearing */
  var ft = (M.features || []).filter(function (x) { return x.id === id && x.ring; })[0];
  if (ft) {
    var R = ft.ring, c = R.c, ri = R.inner_r, ro = R.outer_r, hh = ft.h || 2.2, loops, loopH = null, loopT = null, ops = [];
    var its = (M.openings || []).filter(function (op) { return op.at && matches(M, op, id); });
    var ends = its.filter(function (op) { var d = Math.hypot(op.at[0] - c[0], op.at[1] - c[1]); return d > ri + 0.05 && d < ro - 0.05; })
                  .map(function (op) { return angle(c, op.at); });
    var lan = (M.features || []).filter(function (x) { return x.centre && x.ridge && Math.hypot(x.centre[0] - c[0], x.centre[1] - c[1]) < 0.1; })[0] || null;
    if (ends.length >= 2) {
      var p = ends[0], q = ends[1], d = ((q - p) % 360 + 360) % 360, a0 = d < 180 ? q : p, a1 = d < 180 ? p : q;
      while (a1 <= a0) a1 += 360;
      var n = Math.max(8, Math.ceil((a1 - a0) / 7.5));
      loops = [arcPts(c, ro, a0, a1, n).concat(arcPts(c, ri, a1, a0, n))];
    } else {
      /* each side's middle on the first door (outside) and on bearings 15 degrees apart (inside), so a shutter is never
         split by a corner; the inner sides long enough for one (0.6 at 2.3) */
      var f0 = its[0] ? angle(c, its[0].at) : 0, n2 = 48, h2 = 180 / n2, n3 = SIDES, h3 = 180 / n3, b0 = 90 - Math.round((90 - f0) / 15) * 15;
      loops = [arcPts(c, ro / Math.cos(h2 * Math.PI / 180), f0 + h2, f0 + 360 + h2, n2).slice(0, n2),
               arcPts(c, ri / Math.cos(h3 * Math.PI / 180), b0 + 360 + h3, b0 + h3, n3).slice(0, n3)];
      /* the breast toward the void stands a little over its shutters (their heads at 1.7), boarded, 0.3; the drum's own
         wall to its glass */
      var sh = ft.shutters;
      loopH = [lan ? lan.z - ft.z : hh, sh ? sh.sill + sh.h + 0.2 : hh];
      if (sh) loopT = [null, 0.3];
    }
    if (ft.shutters) ft.shutters.bearings.forEach(function (b) {
      ops.push({ id: id + '-shutter-' + b, kind: 'shutter behind a fixed grille', room: id, at: atBearing(c, ri, b), w: ft.shutters.w, h: ft.shutters.h, sill: ft.shutters.sill, grille: true });
    });
    if (ft.loops) ft.loops.bearings.forEach(function (b) {
      ops.push({ id: id + '-loop-' + b, kind: 'loop', room: id, at: atBearing(c, ro, b), w: ft.loops.w_in || 0.3, h: ft.loops.h, sill: ft.loops.sill });
    });
    return { id: id, name: ft.name || id.replace(/-/g, ' '), kind: 'ring', poly: loops[0], loops: loops, loopH: loopH, loopT: loopT,
      area: { outer: loops[0], holes: loops.slice(1) }, ring: { c: c, ri: ri, ro: ro }, floor: ft.z, ceiling: lan ? null : ft.z + hh,
      wall: WALL_T, walls: null, rec: ft, ops: ops, lantern: lan };
  }
  /* v10: the leads (the keep's), a court in the sky: its floor at z, its parapet's breast and merlons, no ceiling */
  var lf = (M.features || []).filter(function (x) { return x.id === id && x.rect && x.z != null && x.parapet; })[0];
  if (lf) {
    var lb = lf.rect;
    return { id: id, name: lf.name || id.replace(/-/g, ' '), kind: 'leads', poly: [[lb[0], lb[1]], [lb[2], lb[1]], [lb[2], lb[3]], [lb[0], lb[3]]],
      floor: lf.z, ceiling: null, wall: WALL_T, walls: null, rec: lf, sky: { breast: lf.parapet.breast || 1.1, merlons: lf.parapet.merlons || 0 } };
  }
  /* v8 (Events' req 526): a place nested in a ground (the commentator's box in the Quidditch pitch's teachers' stand),
     its floor and eaves from its own numbers, its door and its open front over its ledge made its openings */
  var nest = null;
  (M.grounds || []).forEach(function (g) { Object.keys(g).forEach(function (k) { var v = g[k]; if (v && typeof v === 'object' && v.id === id && v.rect) nest = v; }); });
  if (nest) {
    var nb = nest.rect, nf = nest.floor || 0, ops = [];
    if (nest.door) ops.push({ id: id + '-door', kind: nest.door.kind || 'door', between: [id, id + '-outside'], at: nest.door.at, w: nest.door.w, h: nest.door.h, sill: 0 });
    if (nest.ledge != null) ops.push({ id: id + '-front', kind: 'open front over the ledge', room: id, span: [[nb[0], nb[1] + 0.1], [nb[0], nb[3] - 0.1]], sill: nest.ledge, h: (nest.eaves || 2.6) - nest.ledge });
    return { id: id, name: nest.name || id.replace(/-/g, ' '), kind: 'room', poly: [[nb[0], nb[1]], [nb[2], nb[1]], [nb[2], nb[3]], [nb[0], nb[3]]],
      floor: nf, ceiling: nf + (nest.eaves || 2.6), wall: nest.wall || WALL_T, walls: null, rec: nest, ops: ops };
  }
  var all = (M.masses || []).concat(M.courts || []);
  var m = all.filter(function (x) { return slug(x.id) === id; })[0];
  if (m && m.rect) {
    var fl = String(m.floors || 'G').split('-'), lo = levelZ(M, fl[0]), hi = levelZ(M, fl[fl.length - 1]) + (M.site.storey || 5.2);
    var b = m.rect;
    /* a mass with its roof in the model (v20, the stair hall's: ledger line 15) rises to it, its flat part the ceiling */
    return { id: slug(m.id), name: m.id, kind: 'mass', poly: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], floor: lo,
      ceiling: m.court ? null : m.roof ? m.roof.flat.z : hi, wall: WALL_T, walls: null, rec: m, roof: m.roof || null };
  }
  return null;
}
function matches(M, op, id) {
  var ids = (op.between || []).concat(op.room ? [op.room] : [], op.inside ? [op.inside] : []);
  for (var i = 0; i < ids.length; i++) if (ids[i] === id || slug(ids[i]) === id) return true;
  return false;
}
function other(op, id) {
  var b = op.between || [];
  return slug(b[0]) === id ? slug(b[1]) : slug(b[0]);
}
function isWay(kind) { return /open mouth|archway|arch\b/.test(kind || ''); }
function isDoor(kind) { return /door/.test(kind || '') && !isWay(kind); }

/* v10: circles. A site angle in degrees counter-clockwise from x; the model's bearing clockwise from y */
var SIDES = 24;
function angle(c, p) { return Math.atan2(p[1] - c[1], p[0] - c[0]) * 180 / Math.PI; }
function arcPts(c, r, a0, a1, n) {
  var p = [];
  for (var k = 0; k <= n; k++) { var a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; p.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  return p;
}
function atBearing(c, r, b) { return arcPts(c, r, 90 - b, 90 - b, 1)[0]; }
function inPoly(pts, x, y) {
  var inside = false;
  for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    var a = pts[i], b = pts[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
/* a place's walls as edges, loop by loop (a ring has two), each with its own height where the place gives one */
function edgesOf(loops, hs, ts) {
  var E = [];
  loops.forEach(function (pts, j) { pts.forEach(function (a, i) { E.push({ a: a, b: pts[(i + 1) % pts.length], H: hs ? hs[j] : null, T: ts ? ts[j] : null }); }); });
  return E;
}

/* the edge of a polygon (or of a list of edges, v10) a site point lies on (within a wall's thickness), and how far
   along it */
function onEdge(poly, p, tol) { return onEdgeE(edgesOf([poly]), p, tol); }
function onEdgeE(E, p, tol) {
  var best = null;
  for (var i = 0; i < E.length; i++) {
    var a = E[i].a, b = E[i].b, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (L < 1e-6) continue;
    var s = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L, d = Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L;
    if (s < -0.01 || s > L + 0.01) continue;
    if (!best || d < best.d) best = { i: i, s: s, d: d, L: L };
  }
  return best && best.d < (tol || 1.2) ? best : null;
}

/* how far along edge i a point lies, held to the edge */
function alongEdge(E, i, p) {
  var a = E[i].a, b = E[i].b, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  return Math.max(0, Math.min(L, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L));
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
  mats.roof = F.solid(GREY.ceil); mats.roof.side = THREE.DoubleSide;
  mats.glass = F.solid(0xc9d2d8); mats.glass.side = THREE.DoubleSide;     /* the lantern's lights, the palest grey */
  mats.floorD = F.solid(GREY.floor); mats.floorD.side = THREE.DoubleSide;
  mats.ceilD = F.solid(GREY.ceil); mats.ceilD.side = THREE.DoubleSide;
  mats.grille = F.solid(0x3b3632);
  var out = { group: group, place: P, places: [P], doors: [], ways: [], hidden: [], stairs: [], flights: [], stands: [], toLocal: toLocal };

  function quad(w, h, mat, layer) { return F.register(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat), LAYER[layer]); }
  function slab(w, h, d, mat, layer) { return F.register(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), LAYER[layer]); }
  /* v10: a floor or ceiling the shape of a place's area (a round room's, a ring's with its hole), at height z */
  function areaMesh(Q, z, mat, layer) {
    function trace(path, pts) { path.moveTo(pts[0][0], pts[0][1]); for (var k = 1; k < pts.length; k++) path.lineTo(pts[k][0], pts[k][1]); }
    var sh = new THREE.Shape(); trace(sh, Q.area.outer);
    Q.area.holes.forEach(function (hp) { var p = new THREE.Path(); trace(p, hp); sh.holes.push(p); });
    var geo = new THREE.ShapeGeometry(sh), pos = geo.attributes.position;
    for (var k = 0; k < pos.count; k++) { var v = toLocal(pos.getX(k), pos.getY(k), z); pos.setXYZ(k, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    return F.register(new THREE.Mesh(geo, mat), LAYER[layer]);
  }
  function inArea(q, x, y) {
    if (q.area) return inPoly(q.area.outer, x, y) && !q.area.holes.some(function (h) { return inPoly(h, x, y); });
    var xs = q.poly.map(function (p) { return p[0]; }), ys = q.poly.map(function (p) { return p[1]; });
    return x >= Math.min.apply(null, xs) - 0.01 && x <= Math.max.apply(null, xs) + 0.01 && y >= Math.min.apply(null, ys) - 0.01 && y <= Math.max.apply(null, ys) + 0.01;
  }

  /* a roof seen from below (v6, ledger line 15): its flat part a ceiling; its hip over roof.rect open beneath, the
     planes cut round each lantern on the ridge (a feature in this place with a centre, r and ridge: well-lantern), whose
     drum rises from the curb where the slopes meet it, glazed from its z to its top, under its cap */
  function buildRoof(Q) {
    var R = Q.roof, f = R.flat.rect, r = R.rect, x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3];
    var fl = quad(f[2] - f[0], f[3] - f[1], mats.ceil, 'ceiling');
    fl.rotation.x = Math.PI / 2; fl.position.copy(toLocal((f[0] + f[2]) / 2, (f[1] + f[3]) / 2, R.flat.z)); fl.name = Q.id + '-ceiling'; group.add(fl);
    if (Math.abs(R.flat.z - R.eaves) > 0.02) {                          /* the step where the flat meets the hip's eaves */
      var st = quad(x1 - x0, Math.abs(R.flat.z - R.eaves), mats.wall, 'wall');
      st.position.copy(toLocal((x0 + x1) / 2, f[3], (R.flat.z + R.eaves) / 2)); st.name = Q.id + '-roof-step'; group.add(st);
    }
    var half = Math.min(x1 - x0, y1 - y0) / 2, pitch = (R.ridge - R.eaves) / half, alongY = y1 - y0 >= x1 - x0;
    function h(X, Y) { return Math.min(R.ridge, R.eaves + pitch * Math.min(X - x0, x1 - X, Y - y0, y1 - Y)); }
    var rx = (x0 + x1) / 2, ry = (y0 + y1) / 2, ra = alongY ? [[rx, y0 + half], [rx, y1 - half]] : [[x0 + half, ry], [x1 - half, ry]];
    var lan = (M.features || []).filter(function (ft) { return ft.centre && ft.r && ft.ridge && (ft.room === Q.id || slug(ft.room) === Q.id); });
    function arc(cx_, cy_, rr, a0, a1) { var p = []; for (var k = 0; k <= 24; k++) { var a = (a0 + (a1 - a0) * k / 24) * Math.PI / 180; p.push([cx_ + rr * Math.cos(a), cy_ + rr * Math.sin(a)]); } return p; }
    var L0 = lan[0], pieces;
    if (alongY) {
      var cutW = L0 ? arc(L0.centre[0], L0.centre[1], L0.r, -90, -270) : [];
      var cutE = L0 ? arc(L0.centre[0], L0.centre[1], L0.r, 90, -90) : [];
      pieces = [[[x0, y0], ra[0]].concat(cutW, [ra[1], [x0, y1]]),
                [[x1, y0], [x1, y1], ra[1]].concat(cutE, [ra[0]]),
                [[x0, y0], [x1, y0], ra[0]], [[x1, y1], [x0, y1], ra[1]]];
    } else {
      pieces = [[[x0, y0], [x1, y0], ra[1], ra[0]], [[x1, y1], [x0, y1], ra[0], ra[1]], [[x0, y0], ra[0], [x0, y1]], [[x1, y0], [x1, y1], ra[1]]];
    }
    pieces.forEach(function (pts, i) {
      var sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]);
      for (var k = 1; k < pts.length; k++) sh.lineTo(pts[k][0], pts[k][1]);
      var geo = new THREE.ShapeGeometry(sh), pos = geo.attributes.position;
      for (var k2 = 0; k2 < pos.count; k2++) { var X = pos.getX(k2), Y = pos.getY(k2), v = toLocal(X, Y, h(X, Y)); pos.setXYZ(k2, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      var m = F.register(new THREE.Mesh(geo, mats.roof), LAYER.ceiling); m.name = Q.id + '-roof-' + i; group.add(m);
    });
    lan.forEach(function (L) {
      var curb = R.ridge - L.r * pitch, c = L.centre;
      function ring(z0_, z1_, mat, nm) {
        var g = F.register(new THREE.Mesh(new THREE.CylinderGeometry(L.r, L.r, z1_ - z0_, 40, 1, true), mat), LAYER.wall);
        g.position.copy(toLocal(c[0], c[1], (z0_ + z1_) / 2)); g.name = L.id + '-' + nm; group.add(g);
      }
      ring(curb, L.z, mats.wall, 'drum');
      ring(L.z, L.top, mats.glass, 'glass');
      var cap = F.register(new THREE.Mesh(new THREE.ConeGeometry(L.r + 0.2, L.ridge - L.top, 40), mats.roof), LAYER.ceiling);
      cap.position.copy(toLocal(c[0], c[1], (L.top + L.ridge) / 2)); cap.name = L.id + '-cap'; group.add(cap);
    });
  }

  /* one place: floor, ceiling and its walls with their openings */
  function buildPlace(Q) {
    var xs = Q.poly.map(function (p) { return p[0]; }), ys = Q.poly.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var H = (Q.ceiling != null ? Q.ceiling : Q.floor + 12) - Q.floor;
    if (Q.sky) H = Q.sky.breast;                                         /* v10: the leads' walls are their breast */
    var c = toLocal((x0 + x1) / 2, (y0 + y1) / 2, Q.floor);
    if (Q.area) { var fa = areaMesh(Q, Q.floor, mats.floorD, 'floor'); fa.name = Q.id + '-floor'; group.add(fa); }
    else {
      var floor = quad(x1 - x0, y1 - y0, mats.floor, 'floor');
      floor.rotation.x = -Math.PI / 2; floor.position.copy(c); floor.name = Q.id + '-floor'; group.add(floor);
    }
    if (Q.roof) buildRoof(Q);
    else if (Q.ceiling != null && Q.area) { var ca = areaMesh(Q, Q.ceiling, mats.ceilD, 'ceiling'); ca.name = Q.id + '-ceiling'; group.add(ca); }
    else if (Q.ceiling != null) {
      var ceil = quad(x1 - x0, y1 - y0, mats.ceil, 'ceiling');
      ceil.rotation.x = Math.PI / 2; ceil.position.set(c.x, c.y + H, c.z); ceil.name = Q.id + '-ceiling'; group.add(ceil);
    }
    /* v10: the lamplighters' gallery has no ceiling: over its drum the lantern's glass and its cap */
    if (Q.lantern) {
      var Ln = Q.lantern;
      var gl = F.register(new THREE.Mesh(new THREE.CylinderGeometry(Ln.r, Ln.r, Ln.top - Ln.z, 40, 1, true), mats.glass), LAYER.wall);
      gl.position.copy(toLocal(Ln.centre[0], Ln.centre[1], (Ln.z + Ln.top) / 2)); gl.name = Ln.id + '-glass'; group.add(gl);
      var cap = F.register(new THREE.Mesh(new THREE.ConeGeometry(Ln.r + 0.2, Ln.ridge - Ln.top, 40, 1, true), mats.roof), LAYER.ceiling);
      cap.position.copy(toLocal(Ln.centre[0], Ln.centre[1], (Ln.top + Ln.ridge) / 2)); cap.name = Ln.id + '-cap'; group.add(cap);
    }
    var E = edgesOf(Q.loops || [Q.poly], Q.loopH, Q.loopT);
    /* the openings on each edge: a gap [s0, s1] up to its head h */
    var gaps = E.map(function () { return []; });
    (M.openings || []).concat(Q.ops || []).forEach(function (op) {
      if (!matches(M, op, Q.id)) return;
      /* a doorway behind a panel or a tapestry reads as wall; v8 (req 520): from the hidden place it opens off (its
         `inside`, the tapestry stair's well), a way out, its sill there `inside_sill`; v10: from its outer side the
         wall takes a tap there, unseen (the events' `tap <id>`) */
      var back = !!op.inside && (op.inside === Q.id || slug(op.inside) === Q.id);
      var hid = /hidden/.test(op.kind || '') && !back;
      var gid = op.group || null;
      var pts = op.span ? op.span.map(function (p) { return toSite(M, gid, p); }) : op.at ? [toSite(M, gid, op.at)] : null;
      if (!pts) return;
      /* a doorway with a depth (v6: the Great Hall's doors, a 3 m passage, Godric's Q16) is found from the far face too */
      var e = onEdgeE(E, pts[0], op.depth ? op.depth + 0.2 : null);
      if (!e) return;
      var s0, s1;
      /* v7: the far end measured along the same edge, so an end on a corner (the first floor's mouth at x 92) is not
         found on the next wall, its sill and head then running the length of this one */
      if (pts.length > 1) { var s2 = alongEdge(E, e.i, pts[1]); s0 = Math.min(e.s, s2); s1 = Math.max(e.s, s2); }
      else { s0 = e.s - (op.w || 1) / 2; s1 = e.s + (op.w || 1) / 2; }
      /* v10: held to its side; on a round wall an opening narrower than the side is moved along to fit it whole */
      if (Q.area && s1 - s0 <= e.L) { if (s0 < 0) { s1 -= s0; s0 = 0; } if (s1 > e.L) { s0 -= s1 - e.L; s1 = e.L; } }
      s0 = Math.max(0, s0); s1 = Math.min(e.L, s1);
      var sill = (back && op.inside_sill != null ? op.inside_sill : op.sill) || 0;
      var h = Q.sky ? (op.h || 2.2) + sill : Math.min(E[e.i].H != null ? E[e.i].H : H, (op.h || 2.2) + sill);
      gaps[e.i].push({ s0: s0, s1: s1, sill: sill, h: h, op: op, far: op.depth && e.d > 0.5 ? e.d : 0, back: back, hidden: hid });
    });
    /* a niche in the wall (a feature with a depth: the hourglasses', Godric's 13.1): cut, its back the wall's outer
       part, its head round */
    (M.features || []).forEach(function (ft) {
      if (!ft.depth || !ft.at || !ft.room || (ft.room !== Q.id && slug(ft.room) !== Q.id)) return;
      var e = onEdgeE(E, toSite(M, ft.group || null, ft.at));
      if (!e) return;
      gaps[e.i].push({ s0: e.s - ft.w / 2, s1: e.s + ft.w / 2, sill: ft.sill || 0, h: Math.min(H, (ft.h || 2.2) + (ft.sill || 0)), op: ft, niche: true });
    });
    E.forEach(function (ed, i) {
      var a = ed.a, b = ed.b, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), HE = ed.H != null ? ed.H : H;
      if (L < 1e-6) return;
      /* a wall already built from the other side (the place one step on shares it) is not built twice */
      var midE = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (Q !== P && out.places.some(function (R) { var e = R !== Q && onEdge(R.poly, midE); return e && e.d < 0.05; })) return;
      var ux = dx / L, uy = dy / L, nx = uy, ny = -ux;                 /* outward, the polygon counter-clockwise */
      var t = ed.T || (Q.walls ? (Q.walls[['south', 'east', 'north', 'west'][i]] || Q.wall) : Q.wall);
      var ext = Q.area ? 0 : t;                                          /* a round wall's sides meet at their faces */
      var ang = Math.atan2(uy, ux);                                      /* the wall's turn about y, in the local frame */
      function piece(s0, s1, ya, yb, name) {
        if (s1 - s0 < 0.02 || yb - ya < 0.02) return;
        var sm = (s0 + s1) / 2, p = toLocal(a[0] + ux * sm + nx * t / 2, a[1] + uy * sm + ny * t / 2, Q.floor);
        var m = slab(s1 - s0 + (s0 <= 0.01 ? ext : 0) + (s1 >= L - 0.01 ? ext : 0), yb - ya, t, mats.wall, 'wall');
        var shift = ((s1 >= L - 0.01 ? ext : 0) - (s0 <= 0.01 ? ext : 0)) / 2;
        m.position.set(p.x + ux * shift, p.y + (ya + yb) / 2, p.z - uy * shift);
        m.rotation.y = ang; m.name = name; group.add(m);
      }
      /* v10: an iron bar standing in the wall's line, `off` out from its face (a grille's, a crenel's) */
      function bar(s, ya, yb, off, name) {
        var p = toLocal(a[0] + ux * s + nx * off, a[1] + uy * s + ny * off, Q.floor), m = slab(0.04, yb - ya, 0.04, mats.grille, 'wall');
        m.position.set(p.x, p.y + (ya + yb) / 2, p.z); m.rotation.y = ang; m.name = name; group.add(m);
      }
      /* v10: a hidden opening seen from its outer side stays wall, with an unseen tap over its face */
      gaps[i].filter(function (g) { return g.hidden; }).forEach(function (g) {
        if (out.hidden.some(function (d) { return d.id === g.op.id; })) return;
        var sm = (g.s0 + g.s1) / 2, w = g.s1 - g.s0, hh = g.h - g.sill, mid = toLocal(a[0] + ux * sm, a[1] + uy * sm, Q.floor);
        var inward = new THREE.Vector3(-nx, 0, ny), lift = g.sill > RAISED ? g.sill : 0;
        var hit = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
        hit.position.set(mid.x - nx * 0.02, mid.y + g.sill + hh / 2, mid.z + ny * 0.02); hit.rotation.y = ang;
        hit.name = 'hidden-' + g.op.id; hit.userData.hidden = g.op.id; group.add(hit);
        out.hidden.push({ id: g.op.id, to: other(g.op, Q.id), mesh: hit, w: w, h: hh, mid: mid, inward: inward, place: Q.id, sill: g.sill,
          lift: lift, level: Q.floor + lift, hidden: true });
      });
      var gs = gaps[i].filter(function (g) { return !g.hidden; }).sort(function (g, h) { return g.s0 - h.s0; }), at = 0;
      gs.forEach(function (g, j) {
        piece(at, g.s0, 0, HE, Q.id + '-wall-' + i + '-' + j);
        piece(g.s0, g.s1, g.h, HE, Q.id + '-head-' + g.op.id);
        piece(g.s0, g.s1, 0, g.sill, Q.id + '-sill-' + g.op.id);
        at = g.s1;
        var sm = (g.s0 + g.s1) / 2, w = g.s1 - g.s0, hh = g.h - g.sill;
        var mid = toLocal(a[0] + ux * sm, a[1] + uy * sm, Q.floor);
        var inward = new THREE.Vector3(-nx, 0, ny);                     /* site (-nx, -ny) into the local frame */
        /* v10: a door taller than the leads' breast stands in its own wall, the cap house's, half a metre each side */
        if (Q.sky && g.h > HE) {
          piece(Math.max(0, g.s0 - 0.5), g.s0, HE, g.h + 0.4, Q.id + '-jamb-a-' + g.op.id);
          piece(g.s1, Math.min(L, g.s1 + 0.5), HE, g.h + 0.4, Q.id + '-jamb-b-' + g.op.id);
          piece(g.s0, g.s1, g.h, g.h + 0.4, Q.id + '-over-' + g.op.id);
        }
        if (g.op.grille) for (var gb = 1; gb <= 3; gb++) bar(g.s0 + w * gb / 4, g.sill, g.h, 0.1, Q.id + '-grille-' + g.op.id + '-' + gb);
        if (g.niche) {
          var dp = Math.min(g.op.depth, t - 0.05), back = slab(w, hh, t - dp, mats.wall, 'wall');
          var bp = toLocal(a[0] + ux * sm + nx * (dp + (t - dp) / 2), a[1] + uy * sm + ny * (dp + (t - dp) / 2), Q.floor);
          back.position.set(bp.x, bp.y + g.sill + hh / 2, bp.z); back.rotation.y = ang; back.name = Q.id + '-niche-' + g.op.id; group.add(back);
          var r = w / 2, sh = new THREE.Shape();
          sh.moveTo(-r, 0); sh.lineTo(-r, r); sh.lineTo(r, r); sh.lineTo(r, 0); sh.absarc(0, 0, r, 0, Math.PI, false);
          var head = F.register(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: dp, bevelEnabled: false, curveSegments: 16 }), mats.wall), LAYER.wall);
          head.position.set(mid.x, mid.y + g.h - r, mid.z); head.rotation.y = ang; head.name = Q.id + '-niche-head-' + g.op.id; group.add(head);
          var fl = slab(w, 0.02, dp, mats.floor, 'floor'), fp = toLocal(a[0] + ux * sm + nx * dp / 2, a[1] + uy * sm + ny * dp / 2, Q.floor);
          fl.position.set(fp.x, fp.y + g.sill + 0.01, fp.z); fl.rotation.y = ang; fl.name = Q.id + '-niche-floor-' + g.op.id; group.add(fl);
          return;
        }
        var to = other(g.op, Q.id);
        /* a way above RAISED (the landing bay's mouth at +34.42) is reached on its own floor, its sill */
        var lift = g.sill > RAISED ? g.sill : 0, level = Q.floor + lift;
        if (isDoor(g.op.kind) && !g.back && !out.doors.some(function (d) { return d.id === g.op.id; })) {
          var leaf = slab(w - 0.08, hh - 0.02, 0.12, mats.door, 'door');
          var lo = g.far ? g.far - 0.1 : t * 0.5;                        /* a passage's leaves hang at its far face */
          leaf.position.set(mid.x + nx * lo, mid.y + g.sill + (hh - 0.02) / 2, mid.z - ny * lo);
          leaf.rotation.y = ang; leaf.name = 'door-' + g.op.id; leaf.userData.door = g.op.id; group.add(leaf);
          /* its threshold through the wall (v4, req 284): the floor under a leaf that swings, else the void shows */
          var sl = slab(w, 0.02, t, mats.floor, 'floor'), sp = toLocal(a[0] + ux * sm + nx * t / 2, a[1] + uy * sm + ny * t / 2, Q.floor);
          sl.position.set(sp.x, sp.y + g.sill + 0.01, sp.z); sl.rotation.y = ang; sl.name = Q.id + '-threshold-' + g.op.id; group.add(sl);
          out.doors.push({ id: g.op.id, to: to, mesh: leaf, w: w, h: hh, mid: mid, inward: inward, place: Q.id, sill: g.sill, lift: lift, level: level });
        } else if ((g.back || isWay(g.op.kind)) && !out.ways.some(function (d) { return d.id === g.op.id; })) {
          /* a way out from a hidden place hangs its tapestry's back in the mouth, a dark grey hanging, not a void */
          var fill = g.back ? F.register(new THREE.Mesh(new THREE.PlaneGeometry(w, hh), F.solid(0x3b3632)), LAYER.way)
                            : new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ visible: false }));
          if (g.back) fill.material.side = THREE.DoubleSide;
          fill.position.set(mid.x, mid.y + g.sill + hh / 2, mid.z); fill.rotation.y = ang; fill.name = 'way-' + g.op.id; fill.userData.way = g.op.id;
          group.add(fill);
          out.ways.push({ id: g.op.id, to: to, mesh: fill, w: w, h: hh, mid: mid, inward: inward, place: Q.id, at: [a[0] + ux * sm, a[1] + uy * sm],
            sill: g.sill, lift: lift, level: level, back: g.back });
        }
      });
      piece(at, L, 0, HE, Q.id + '-wall-' + i + '-end');
      /* v10: the leads' merlons on the breast, 1.5 long every 3.0, clear of its doors; each crenel between barred */
      if (Q.sky && Q.sky.merlons > HE) {
        var clear = function (s0, s1) { return !gs.some(function (g) { return s1 > g.s0 - 0.6 && s0 < g.s1 + 0.6; }); };
        for (var m0 = 0.3; m0 < L - 0.3; m0 += 3.0) {
          var m1 = Math.min(L, m0 + 1.5);
          if (clear(m0, m1)) piece(m0, m1, HE, Q.sky.merlons, Q.id + '-merlon-' + i + '-' + Math.round(m0 * 10));
          for (var cb = m1 + 0.3; cb < Math.min(L, m0 + 3.0) - 0.1; cb += 0.3)
            if (clear(cb, cb)) bar(cb, HE, Q.sky.merlons, t / 2, Q.id + '-bar-' + i + '-' + Math.round(cb * 10));
        }
      }
    });
  }
  buildPlace(P);
  /* one step on: the ways joined to this one by an open mouth, built in the same frame */
  /* (only a place whose wall the mouth is in; a way to a place not yet in the model, or not beside it, shows a dark
     recess beyond the mouth for now) */
  out.ways.slice().forEach(function (w) {
    if (out.places.some(function (q) { return q.id === w.to; })) return;
    /* a way out of a hidden place (v8): its far side is its own shell, a tap away, never built here, since the two
       share a wall line the model draws without its thickness */
    /* v10: only where that side is a place the shells build (the West Tower's spiral is none yet: its rooms' ways out
       answer as a shut door, so the events hear the tap) */
    if (w.back) { w.built = !!findPlace(M, w.to); return; }
    var Q = findPlace(M, w.to);
    /* a built room (one with its own page) is never shelled: the way takes him to its page (line 5's rule) */
    if (Q && Q.rec && Q.rec.page) { w.built = true; w.page = Q.rec.page; }
    else if (Q && onEdge(Q.poly, w.at)) { out.places.push(Q); buildPlace(Q); w.built = true; return; }
    var depth = 3.0, rec = slab(w.w + 0.4, w.h + 0.2, depth, F.solid(0x141210), 'way');
    rec.position.set(w.mid.x - w.inward.x * (depth / 2 + 0.9), w.mid.y + w.sill + w.h / 2, w.mid.z - w.inward.z * (depth / 2 + 0.9));
    rec.rotation.y = Math.atan2(w.inward.x, w.inward.z); rec.material.side = THREE.BackSide; rec.name = 'beyond-' + w.id;
    group.add(rec);
  });

  /* the stairs in the places built: a straight flight's treads along its rise, from its span's foot to its head; a
     landing, gallery or bay ({ shape: { rect }, z }) as a floor's vault, SLAB deep under its top (Godric's 12.1) */
  var slabs = [], raw = [];
  function siteRect(gid, r) {
    var a = toSite(M, gid, [r[0], r[1]]), b = toSite(M, gid, [r[2], r[3]]);
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  }
  (M.stairs || []).forEach(function (s) {
    var inIt = out.places.filter(function (q) { return (s.rooms || [s.room]).some(function (r) { return r === q.id || slug(r) === q.id; }); })[0];
    if (!inIt) return;
    if (!s.span && s.shape && s.shape.rect && s.z != null) {
      var R = siteRect(s.group, s.shape.rect), top = inIt.floor + s.z, c = toLocal((R[0] + R[2]) / 2, (R[1] + R[3]) / 2, top - SLAB / 2);
      var sl = slab(R[2] - R[0], SLAB, R[3] - R[1], mats.floor, 'floor');
      sl.position.copy(c); sl.name = s.id; sl.userData.landing = s.id; group.add(sl);
      slabs.push({ id: s.id, rect: R, z: top, kind: s.kind || '' });
      return;
    }
    if (!s.up || !s.span) return;
    var a = toSite(M, s.group, s.span[0]), b = toSite(M, s.group, s.span[1]);
    var bx0 = Math.min(a[0], b[0]), bx1 = Math.max(a[0], b[0]), by0 = Math.min(a[1], b[1]), by1 = Math.max(a[1], b[1]);
    var alongY = s.up[1] !== 0, run = alongY ? by1 - by0 : bx1 - bx0, across = alongY ? bx1 - bx0 : by1 - by0;
    var n = s.treads, go = run / n, rise = (s.to - s.from) / n;
    for (var i = 0; i < n; i++) {
      var f = (i + 0.5) / n, top = inIt.floor + s.from + rise * (i + 1);
      var sx = alongY ? (bx0 + bx1) / 2 : (s.up[0] > 0 ? bx0 + f * run : bx1 - f * run);
      var sy = alongY ? (s.up[1] > 0 ? by0 + f * run : by1 - f * run) : (by0 + by1) / 2;
      /* a flight from the floor stands on it; one higher up is a waist under its nosings */
      var base = s.from > 0.01 ? top - rise - WAIST : inIt.floor;
      var hgt = top - base, p = toLocal(sx, sy, base);
      var tr = slab(alongY ? across : go, Math.max(0.05, hgt), alongY ? go : across, mats.stair, 'stair');
      tr.position.set(p.x, p.y + hgt / 2, p.z); tr.name = s.id + '-' + (i + 1); tr.userData.stair = s.id; group.add(tr);
    }
    if (s.landing) {
      var L = siteRect(s.group, s.landing), lt = s.to;
      var lp = toLocal((L[0] + L[2]) / 2, (L[1] + L[3]) / 2, inIt.floor);
      var land = slab(L[2] - L[0], lt, L[3] - L[1], mats.stair, 'stair');
      land.position.set(lp.x, lp.y + lt / 2, lp.z); land.name = s.id + '-landing'; land.userData.stair = s.id; group.add(land);
      slabs.push({ id: s.id + '-landing', rect: L, z: inIt.floor + lt, kind: 'landing' });
    }
    var ux = alongY ? 0 : s.up[0], uy = alongY ? s.up[1] : 0, mx = (bx0 + bx1) / 2, my = (by0 + by1) / 2;
    var foot = alongY ? [mx, uy > 0 ? by0 : by1] : [ux > 0 ? bx0 : bx1, my];
    var head = alongY ? [mx, uy > 0 ? by1 : by0] : [ux > 0 ? bx1 : bx0, my];
    raw.push({ s: s, foot: foot, head: head, u: [ux, uy], side: [uy !== 0 ? 1 : 0, ux !== 0 ? 1 : 0], half: across / 2,
      zf: inIt.floor + s.from, zh: inIt.floor + s.to });
    out.stairs.push({ id: s.id, place: inIt.id });
  });

  /* standing on a floor: a site point is on the floor at height z if a slab's top is there, or the floor of a place
     built is */
  function onLevel(x, y, z) {
    for (var i = 0; i < slabs.length; i++) {
      var r = slabs[i].rect;
      if (Math.abs(slabs[i].z - z) < 0.02 && x >= r[0] - 0.01 && x <= r[2] + 0.01 && y >= r[1] - 0.01 && y <= r[3] + 0.01) return true;
    }
    return out.places.some(function (q) { return Math.abs(q.floor - z) <= 0.02 && inArea(q, x, y); });
  }
  function siteOf(v) { return [v.x + cx, cy - v.z]; }
  function clearRun(a, b, z) {
    var n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.25));
    for (var k = 0; k <= n; k++) if (!onLevel(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, z)) return false;
    return true;
  }
  /* the turns between two stands on one floor: straight, one turn, or along a landing of that floor */
  out.route = function (from, to, z) {
    var a = siteOf(from), b = siteOf(to), tries = [[], [[a[0], b[1]]], [[b[0], a[1]]]];
    /* v10: round a ring by its middle, either way */
    if (P.ring) {
      var rc = P.ring.c, rm = (P.ring.ri + P.ring.ro) / 2, aa = angle(rc, a), ab = angle(rc, b);
      [1, -1].forEach(function (dir) {
        var d = (((ab - aa) * dir) % 360 + 360) % 360, n = Math.max(1, Math.ceil(d / 10));
        tries.push(arcPts(rc, rm, aa, aa + dir * d, n));
      });
    }
    slabs.forEach(function (sl) {
      if (Math.abs(sl.z - z) > 0.02 || !/landing/.test(sl.kind)) return;
      var ly = (sl.rect[1] + sl.rect[3]) / 2, lx = (sl.rect[0] + sl.rect[2]) / 2;
      tries.push([[a[0], ly], [b[0], ly]], [[lx, a[1]], [lx, b[1]]]);
    });
    for (var t = 0; t < tries.length; t++) {
      var pts = [a].concat(tries[t], [b]), ok = true;
      for (var j = 0; j + 1 < pts.length && ok; j++) ok = clearRun(pts[j], pts[j + 1], z);
      if (ok) return tries[t].map(function (p) { return toLocal(p[0], p[1], z + EYE); });
    }
    return null;
  };

  /* the default stands: square to each door and each mouth, STAND_OFF inside it, the eye at EYE (§11); the start is
     inside the way he arrives by (o.from), or else inside the first door of this place that leads out of the castle's
     ways, facing in. A raised way (the bay's mouth) is stood at on its own floor, a step inside it */
  function standAt(d, name) {
    var off = d.back ? 0.5 : d.lift ? STAND_OFF : Math.min(10, Math.max(STAND_OFF, d.w * 1.1, d.h * 1.6));   /* far enough back to see it whole; a hidden place's way out a step in, its landings narrow */
    var pos = d.mid.clone().add(d.inward.clone().multiplyScalar(off)); pos.y = d.mid.y + d.lift + EYE;
    /* v8: never off the floor (a small room, the commentator's box): nearer the door until he stands on it */
    while (off > 0.6 && !onLevel(pos.x + cx, cy - pos.z, d.level)) { off -= 0.2; pos = d.mid.clone().add(d.inward.clone().multiplyScalar(off)); pos.y = d.mid.y + d.lift + EYE; }
    if (P.ring && d.place === P.id) pos = midRing(pos);
    var look = d.mid.clone(); look.y = d.mid.y + d.lift + (d.lift ? EYE : Math.max(EYE, d.h * 0.45));
    return { name: name, pos: pos, look: look, thing: d.mesh, level: d.level };
  }
  /* v10: a point in a ring moved out or in to the ring's middle, at the same height */
  function midRing(v) {
    var sp = siteOf(v), c = P.ring.c, rx = sp[0] - c[0], ry = sp[1] - c[1], rl = Math.hypot(rx, ry) || 1, rm = (P.ring.ri + P.ring.ro) / 2;
    var w = toLocal(c[0] + rx / rl * rm, c[1] + ry / rl * rm, null); w.y = v.y;
    return w;
  }
  /* he arrives through a mouth standing in it, a step back on the side he came from, looking in (only into the wall's
     depth where the far side is a room's page, short of the dark beyond); through a door, a step inside it */
  function facingIn(d, name) {
    var back = d.back ? 0.5 : d.mesh.userData.way ? (d.page || !d.built ? -0.3 : -1.0) : STAND_OFF;
    var pos = d.mid.clone().add(d.inward.clone().multiplyScalar(back)); pos.y = d.mid.y + d.lift + EYE;
    /* v10: never off the floor (a ring 0.9 wide): nearer the door until he stands on it */
    while (back > 0.6 && !onLevel(pos.x + cx, cy - pos.z, d.level)) { back -= 0.2; pos = d.mid.clone().add(d.inward.clone().multiplyScalar(back)); pos.y = d.mid.y + d.lift + EYE; }
    var look = d.mid.clone().add(d.inward.clone().multiplyScalar(STAND_OFF + 20)); look.y = d.mid.y + d.lift + EYE + 0.3;
    /* v10: in a ring he stands in its middle and looks along it, not across its void */
    if (P.ring) {
      pos = midRing(pos);
      var sp = siteOf(pos), rx = sp[0] - P.ring.c[0], ry = sp[1] - P.ring.c[1], rl = Math.hypot(rx, ry) || 1, k = P.loopH ? 1 : -1;
      var tx = -ry / rl * k, ty = rx / rl * k, q2 = [sp[0] + tx * 1.5, sp[1] + ty * 1.5];
      if (!onLevel(q2[0], q2[1], d.level)) { tx = -tx; ty = -ty; }
      look = toLocal(sp[0] + tx * 6, sp[1] + ty * 6, d.level + EYE);
    }
    return { name: name, pos: pos, look: look, thing: null, level: d.level };
  }
  var all = out.doors.concat(out.ways), mine = all.filter(function (d) { return d.place === P.id; });
  var entry = mine.filter(function (d) { return o.from && d.to === o.from; })[0] || mine.filter(function (d) { return o.start && d.id === o.start; })[0] || mine[0];
  all = all.concat(out.hidden);
  if (entry) out.stands.push(facingIn(entry, 'start'));
  else {
    /* a place with no door or way of its own in this year (the Room's corridor, a room past a shut door): he starts
       at its middle, looking along its long side */
    var xs = P.poly.map(function (p) { return p[0]; }), ys = P.poly.map(function (p) { return p[1]; });
    var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    var wide = Math.max.apply(null, xs) - Math.min.apply(null, xs) >= Math.max.apply(null, ys) - Math.min.apply(null, ys);
    out.stands.push({ name: 'start', pos: toLocal(mx, my, P.floor + EYE), thing: null, level: P.floor,
                      look: toLocal(mx + (wide ? 20 : 0), my + (wide ? 0 : 20), P.floor + EYE) });
  }
  all.forEach(function (d) { var s = standAt(d, d.id); d.stand = s; out.stands.push(s); });

  /* a flight's two stands: a step off each end onto the floor it joins (straight on, or to the side onto a gallery),
     the foot's looking up the flight, the head's on along it */
  function endStand(F0, z, back, name, lookAt) {
    var so = F0.s.step || STEP_OFF;                                     /* v8: a flight's own step off (the tapestry stair's 0.5) */
    var e = F0.u, sd = F0.side, P0 = back ? F0.foot : F0.head, sg = back ? -1 : 1, off = F0.half + so;
    var tries = [[P0[0] + sg * e[0] * so, P0[1] + sg * e[1] * so]];
    [-1, 1].forEach(function (k) { tries.push([P0[0] - sg * e[0] * 1.5 + k * sd[0] * off, P0[1] - sg * e[1] * 1.5 + k * sd[1] * off]); });
    var at = tries.filter(function (p) { return onLevel(p[0], p[1], z); })[0] || tries[0];
    var pos = toLocal(at[0], at[1], z + EYE);
    var look = lookAt || toLocal(at[0] + e[0] * 20, at[1] + e[1] * 20, z + EYE);
    return { name: name, pos: pos, look: look, thing: null, level: z };
  }
  /* at a flight's head he faces where he goes on (req 318): the nearest flight up from that floor, else the way out on
     it, else on along the flight */
  function onward(F0) {
    var best = null, bd = 1e9;
    raw.forEach(function (G) {
      if (G === F0 || Math.abs(G.zf - F0.zh) > 0.02) return;
      var d = Math.hypot(G.foot[0] - F0.head[0], G.foot[1] - F0.head[1]);
      if (d < bd) { bd = d; best = G; }
    });
    if (best) return toLocal(best.foot[0], best.foot[1], F0.zh + EYE);
    var w = out.ways.filter(function (x) { return Math.abs(x.level - F0.zh) < 0.3; })[0];
    if (w) { var v = w.mid.clone(); v.y = F0.zh - z0 + EYE; return v; }
    return null;
  }
  raw.forEach(function (F0) {
    var headPt = toLocal(F0.head[0], F0.head[1], F0.zh + EYE), footPt = toLocal(F0.foot[0], F0.foot[1], F0.zf + EYE);
    var fs = endStand(F0, F0.zf, true, F0.s.id + ' foot', headPt.clone());
    var hs = endStand(F0, F0.zh, false, F0.s.id + ' head', onward(F0));
    out.flights.push({ id: F0.s.id, foot: fs, head: hs, footPt: footPt, headPt: headPt });
    out.stands.push(fs, hs);
  });

  /* the look up and down (the model's look a place, version 19, from docs/architect/vertical-views.md): each stand's
     limits in degrees about the eye, its own by name or else the place's (14 each way where the model gives none),
     and how far the head turns (60 each way, 180 all the way round); a stand the model names with a spot is added
     here, and it and the start take the rest as their pitch */
  var LK = (P.rec && P.rec.look) || {}, named = LK.stands || {};
  Object.keys(named).forEach(function (n) {
    var L = named[n]; if (!L.at) return;
    var z = P.floor + (L.z || 0), f = L.face || [0, 1], ex = out.stands.filter(function (s) { return s.name === n; })[0];
    var pos = toLocal(L.at[0], L.at[1], z + EYE), look = toLocal(L.at[0] + f[0] * 20, L.at[1] + f[1] * 20, z + EYE);
    if (ex) { ex.pos = pos; ex.look = look; ex.level = z; }          /* a default stand the model moves (the awe stand) */
    else out.stands.push({ name: n, pos: pos, look: look, thing: null, level: z });
  });
  function pick(L, k, d) { return L[k] != null ? L[k] : LK[k] != null ? LK[k] : d; }
  out.stands.forEach(function (st) {
    var L = named[st.name] || {};
    st.lim = { rest: pick(L, 'rest', null), down: pick(L, 'down', -14), up: pick(L, 'up', 14), turn: pick(L, 'turn', 60) };
    if (st.lim.rest != null && (st.name === 'start' || named[st.name])) {
      var d = st.look.clone().sub(st.pos), hz = Math.hypot(d.x, d.z) || 1, k = 10 / hz;
      st.look = st.pos.clone().add(new THREE.Vector3(d.x * k, Math.tan(st.lim.rest * Math.PI / 180) * 10, d.z * k));
    }
  });
  out.look = LK;
  return out;
} };
})();
