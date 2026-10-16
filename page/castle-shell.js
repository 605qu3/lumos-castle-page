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
   crenels barred) are places too. v12: a room by its plan's corners ({ poly }) too.
   v13 (model v39): a way into a stair joining two rooms (the dovecote's, in the drum's wall) leads on to the room at its far end.
   v14 (model v42, the Found starts): the start looks the way this place's floor runs longest, a step inside a short room
   first; a ladder or trapdoor through a floor (a stair with `rooms` and `rect`) is a way down or up, a dark square.
   v15 (model v43): a short room entered from its side is stood in at its middle; an opening wider than a short side of a
   curved face is cut on into the next side (the casemate's powder-door).
   v18 (model v45): the start turns all the way round where its way out would lie past the head's turn; up a stair in a
   wall he starts a step inside the room.
   v19 (model v46): a rail round a hatch or a stair's opening is drawn; a way off the next place's far side leads on.
   v23 (model v53): a room's `heads` raise its ceiling in strips across it; an arch's `soffit` gives its head at each
   face, raked through the wall where they differ; a way's `sills` its sill at a face whose floor lies lower.
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
  /* v12: a room drawn by its plan's corners ({ poly }, counter-clockwise: the gunners' casemate between two drums' faces,
     ledger line 94), floor and ceiling as a rect room's */
  if (r && r.shape && r.shape.poly) {
    var pb = levelZ(M, r.level), pp = r.shape.poly.map(function (p) { return toSite(M, r.group, p); });
    return { id: r.id, name: r.name, kind: 'room', poly: pp, floor: pb + (r.floor || 0), ceiling: pb + (r.ceiling != null ? r.ceiling : (M.site.storey || 5.2) - 0.7),
      wall: r.wall || WALL_T, walls: null, rec: r };
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
  /* v17 (model v44): a newel stair made a place (`place: "shaft"`, the south-west turret's): its round well from `from`
     to `to` and a turn's head room over, its wall the turret's 0.5, its sides long enough for its widest door (twelve at
     r 1.7), one side's middle on its first door; its doors cut at their own heights (z) */
  var st = (M.stairs || []).filter(function (x) { return slug(x.id) === id && x.place === 'shaft' && x.rect; })[0];
  if (st) {
    var sr = st.rect, scc = [(sr[0] + sr[2]) / 2, (sr[1] + sr[3]) / 2], srr = (sr[2] - sr[0]) / 2;
    var sops = (M.openings || []).filter(function (op) { return op.at && (op.between || []).indexOf(st.id) >= 0; });
    var wide = Math.max.apply(null, sops.map(function (op) { return op.w || 1; }).concat([0.8]));
    var sn = Math.max(8, Math.min(SIDES, Math.floor(Math.PI / Math.atan((wide + 0.1) / (2 * srr)))));
    var soff = sops[0] ? angle(scc, toSite(M, sops[0].group || null, sops[0].at)) : 0, sh = 180 / sn;
    var scp = arcPts(scc, srr / Math.cos(sh * Math.PI / 180), soff + sh, soff + 360 + sh, sn).slice(0, sn);
    return { id: slug(st.id), name: st.name || st.id.replace(/-/g, ' '), kind: 'room', poly: scp, area: { outer: scp, holes: [] },
      round: { c: scc, r: srr }, floor: st.from, ceiling: st.to + 2.4, wall: 0.5, walls: null, rec: st, shaft: true };
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
      floor: lf.z, ceiling: null, wall: WALL_T, walls: null, rec: lf,
      sky: { breast: lf.parapet.breast || 1.1, merlons: lf.parapet.merlons || 0, sides: lf.parapet } };
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
/* v13 (model v39, the dovecote's stair): a way into a stair joining two rooms leads on to the room at its other end */
function viaStair(M, to, id) {
  var s = (M.stairs || []).filter(function (x) { return slug(x.id) === to; })[0];
  if (!s || !s.rooms || s.rooms.length < 2 || s.place === 'shaft') return null;   /* v17: a stair that is a place is gone into */
  var r = s.rooms.filter(function (x) { return slug(x) !== id; })[0];
  return r ? slug(r) : null;
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
  /* v21 (the Found list): a curving stair in a round wall (a stair's `arc`) is built a short way in past each of its
     arches, so the arch shows its steps turning away round the wall, not a dark recess: a landing in the arch's near
     half, ten treads on from its middle (up from the foot, down from the head), the wall's outer face and the ceiling stepping with them,
     closed past sight by the curve. The way still takes him to the room at its other end (v13) */
  function arcStub(s, Q, w, id) {
    var A = s.arc, c = A.c, ri = A.r_in, ro = A.r_out, b0 = A.bearings[0], b1 = A.bearings[1];
    var sweep = ((b1 - b0) % 360 + 360) % 360, n = s.treads || 20, db = sweep / n, rise = s.rise || (s.to - s.from) / n;
    var foot = Math.abs(Q.floor - s.from) <= Math.abs(Q.floor - s.to), dir = foot ? 1 : -1, bA = foot ? b0 : b1;
    var half = (w / 2 + 0.1) / ri * 180 / Math.PI, HEAD = 2.0, N = Math.min(10, n);
    function seg(bS, bE, zLo, zHi, rIn, rOut, mat, layer, nm) {
      var bm = (bS + bE) / 2, a = bm * Math.PI / 180, rm = (rIn + rOut) / 2;
      var p = toLocal(c[0] + rm * Math.sin(a), c[1] + rm * Math.cos(a), zLo);
      var m = slab(rOut - rIn, zHi - zLo, Math.abs(bE - bS) * Math.PI / 180 * rm + 0.02, mat, layer);
      m.position.set(p.x, p.y + (zHi - zLo) / 2, p.z); m.rotation.y = (90 - bm) * Math.PI / 180;
      m.name = Q.id + '-stub-' + id + '-' + nm; group.add(m);
    }
    var fz = Q.floor, lo = foot ? fz : fz - N * rise;
    seg(bA - dir * half, bA, fz - 0.3, fz, ri - 0.02, ro, mats.floor, 'floor', 'landing');
    seg(bA - dir * half, bA, fz + HEAD, fz + HEAD + 0.2, ri - 0.02, ro, mats.ceil, 'ceiling', 'landing-ceil');
    seg(bA - dir * half, bA, lo - 0.6, fz + HEAD + 0.2, ro, ro + 0.1, mats.wall, 'wall', 'landing-wall');
    for (var k = 1; k <= N; k++) {
      var bS = bA + dir * (k - 1) * db, bE = bS + dir * db, top = fz + dir * k * rise;
      seg(bS, bE, foot ? fz - 0.3 : top - 0.4, top, ri - 0.02, ro, mats.stair, 'stair', 'tread-' + k);
      seg(bS, bE, Math.max(top, fz) + HEAD, Math.max(top, fz) + HEAD + 0.2, ri - 0.02, ro, mats.ceil, 'ceiling', 'ceil-' + k);
      seg(bS, bE, lo - 0.6, Math.max(top, fz) + HEAD + 0.2, ro, ro + 0.1, mats.wall, 'wall', 'wall-' + k);
    }
    var bZ = bA + dir * N * db;
    seg(bZ, bZ + dir * 1.5, lo - 0.6, fz + N * rise + HEAD + 0.2, ri - 0.02, ro + 0.1, mats.wall, 'wall', 'end');
  }
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
    var HD = (Q.rec && !Q.rec.group && !Q.area && Q.rec.heads || []).map(function (k) { return { a: k.rect[0], b: k.rect[2], h: k.z - Q.floor }; });
    function headAt(x) { var z = H; HD.forEach(function (k) { if (x > k.a - 0.01 && x < k.b + 0.01) z = Math.max(z, k.h); }); return z; }
    var c = toLocal((x0 + x1) / 2, (y0 + y1) / 2, Q.floor);
    if (Q.area) { var fa = areaMesh(Q, Q.floor, mats.floorD, 'floor'); fa.name = Q.id + '-floor'; group.add(fa); }
    else {
      var floor = quad(x1 - x0, y1 - y0, mats.floor, 'floor');
      floor.rotation.x = -Math.PI / 2; floor.position.copy(c); floor.name = Q.id + '-floor'; group.add(floor);
    }
    if (Q.roof) buildRoof(Q);
    else if (Q.ceiling != null && Q.area) { var ca = areaMesh(Q, Q.ceiling, mats.ceilD, 'ceiling'); ca.name = Q.id + '-ceiling'; group.add(ca); }
    else if (Q.ceiling != null) {
      /* v23 (the Found list): a room's `heads`, strips right across it where its ceiling stands higher (the listeners'
         gallery over its two flights, model v53), the ceiling drawn strip by strip at its height, a riser between */
      var cuts = [x0, x1];
      HD.forEach(function (k) { cuts.push(Math.max(x0, Math.min(x1, k.a)), Math.max(x0, Math.min(x1, k.b))); });
      cuts.sort(function (p, q) { return p - q; });
      for (var ci = 0, prev = null; ci < cuts.length - 1; ci++) {
        var xa = cuts[ci], xb = cuts[ci + 1];
        if (xb - xa < 0.01) continue;
        var hz = headAt((xa + xb) / 2), cp = toLocal((xa + xb) / 2, (y0 + y1) / 2, Q.floor);
        var ceil = quad(xb - xa, y1 - y0, mats.ceil, 'ceiling');
        ceil.rotation.x = Math.PI / 2; ceil.position.set(cp.x, cp.y + hz, cp.z); ceil.name = Q.id + '-ceiling' + (ci ? '-' + ci : ''); group.add(ceil);
        if (prev != null && Math.abs(prev - hz) > 0.01) {
          var rs = slab(0.02, Math.abs(prev - hz), y1 - y0, mats.ceil, 'ceiling'), rp = toLocal(xa, (y0 + y1) / 2, Q.floor);
          rs.position.set(rp.x, rp.y + (prev + hz) / 2, rp.z); rs.name = Q.id + '-head-riser-' + ci; group.add(rs);
        }
        prev = hz;
      }
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
      /* v15: on a curved face drawn in short sides (the casemate's round the drum), an opening wider than its side is cut
         on into the next side too, where that side turns less than 30 degrees; no second leaf (powder-door, Events 1.44 am) */
      var spill = [];
      if (!Q.area && !hid) {
        var dirOf = function (k) { var ed = E[k]; return [ed.b[0] - ed.a[0], ed.b[1] - ed.a[1]]; };
        var gentle = function (k) { var u = dirOf(e.i), v = dirOf(k), lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
          return lu > 1e-6 && lv > 1e-6 && (u[0] * v[0] + u[1] * v[1]) / (lu * lv) > Math.cos(Math.PI / 6); };
        var len = function (k) { var d = dirOf(k); return Math.hypot(d[0], d[1]); };
        var nk = (e.i + 1) % E.length, pk = (e.i - 1 + E.length) % E.length;
        for (var sk = 0; sk < 3 && len(nk) < 1e-3; sk++) nk = (nk + 1) % E.length;          /* past a repeated corner */
        for (sk = 0; sk < 3 && len(pk) < 1e-3; sk++) pk = (pk - 1 + E.length) % E.length;
        if (s1 > e.L + 0.02 && gentle(nk)) spill.push({ k: nk, s0: 0, s1: s1 - e.L });
        if (s0 < -0.02 && gentle(pk)) { var PL = Math.hypot(dirOf(pk)[0], dirOf(pk)[1]); spill.push({ k: pk, s0: Math.max(0, PL + s0), s1: PL }); }
      }
      s0 = Math.max(0, s0); s1 = Math.min(e.L, s1);
      var sill = (back && op.inside_sill != null ? op.inside_sill : op.sill) || 0;
      if (op.sills && op.sills[Q.id] != null) sill = op.sills[Q.id];      /* v23: a way's sill at a face whose floor lies lower */
      if (Q.shaft && op.z != null) sill += op.z - Q.floor;                /* v17: in a stair's well, at its own height */
      var h = Q.sky ? (op.h || 2.2) + sill : Math.min(E[e.i].H != null ? E[e.i].H : H, (op.h || 2.2) + sill);
      /* v23: an arch's `soffit` gives its head at each room's face (absolute), under a room's raised head */
      var sof = op.soffit && !hid ? op.soffit : null, near = sof && sof[Q.id], far = sof && sof[other(op, Q.id)];
      if (near != null) h = near - Q.floor;
      gaps[e.i].push({ s0: s0, s1: s1, sill: sill, h: h, op: op, far: op.depth && e.d > 0.5 ? e.d : 0, back: back, hidden: hid,
        soffit: near != null ? [h, far != null ? far - Q.floor : h] : null });
      spill.forEach(function (sp) { gaps[sp.k].push({ s0: sp.s0, s1: sp.s1, sill: sill, h: h, op: op, back: back, hidden: false, spill: true }); });
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
      /* v11 (model v37, ledger 82 f): a side of the leads with its own parapet (the old keep's line on the north, plain) */
      var own = Q.sky && Q.sky.sides && Q.sky.sides[['south', 'east', 'north', 'west'][i]], MER = Q.sky ? Q.sky.merlons : 0;
      if (own && typeof own === 'object') { if (own.breast != null) HE = own.breast; if (own.merlons != null) MER = own.merlons; }
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
        if (g.spill) return;                                            /* v15: the rest of an opening cut over a corner */
        var sm = (g.s0 + g.s1) / 2, w = g.s1 - g.s0, hh = g.h - g.sill;
        var mid = toLocal(a[0] + ux * sm, a[1] + uy * sm, Q.floor);
        var inward = new THREE.Vector3(-nx, 0, ny);                     /* site (-nx, -ny) into the local frame */
        /* v23 (the Found list): an arch's soffit through the wall from its head at this face to its head at the far
           face, raked where they differ (the flanker's arch over the listeners' gallery's west flight, 1.8 over every
           nosing), its jambs carried up to it */
        if (g.soffit) {
          var hA = g.soffit[0], hB = g.soffit[1], top = Math.max(hA, hB) + 0.1, run = Math.hypot(t, hB - hA);
          piece(Math.max(0, g.s0 - 0.3), g.s0, HE, top, Q.id + '-jamb-a-' + g.op.id);
          piece(g.s1, Math.min(L, g.s1 + 0.3), HE, top, Q.id + '-jamb-b-' + g.op.id);
          var so = slab(w, 0.1, run, mats.wall, 'wall'), sp2 = toLocal(a[0] + ux * sm + nx * t / 2, a[1] + uy * sm + ny * t / 2, Q.floor);
          so.rotation.order = 'YXZ'; so.rotation.y = ang; so.rotation.x = -Math.atan2(hB - hA, t);
          so.position.set(sp2.x, sp2.y + (hA + hB) / 2 + 0.05, sp2.z); so.name = Q.id + '-soffit-' + g.op.id; group.add(so);
        }
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
        var to = other(g.op, Q.id), via = isWay(g.op.kind) ? viaStair(M, to, Q.id) : null;
        if (via) {
          var sv = (M.stairs || []).filter(function (x) { return slug(x.id) === to; })[0];
          if (sv && sv.arc) arcStub(sv, Q, w, g.op.id);
          to = via;
        }
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
          /* v16: both sides take the tap; one-sided, its face turned out, a tap from its own room passed through to the
             dark or the room beyond (Events' orrery-stair-arch, 1.56 am, 16 October; every open way alike) */
          fill.material.side = THREE.DoubleSide;
          fill.position.set(mid.x, mid.y + g.sill + hh / 2, mid.z); fill.rotation.y = ang; fill.name = 'way-' + g.op.id; fill.userData.way = g.op.id;
          group.add(fill);
          out.ways.push({ id: g.op.id, to: to, mesh: fill, w: w, h: hh, mid: mid, inward: inward, place: Q.id, at: [a[0] + ux * sm, a[1] + uy * sm],
            sill: g.sill, lift: lift, level: level, back: g.back, via: !!via, depth: g.op.depth || 0 });
        }
      });
      piece(at, L, 0, HE, Q.id + '-wall-' + i + '-end');
      /* v23: under a raised head the wall goes up to it, over an opening from its own head */
      HD.forEach(function (k, ki) {
        if (k.h <= HE + 0.01) return;
        var sa, sb;
        if (Math.abs(ux) < 1e-6) { if (a[0] < k.a - 0.01 || a[0] > k.b + 0.01) return; sa = 0; sb = L; }
        else { var p1 = (k.a - a[0]) / ux, p2 = (k.b - a[0]) / ux; sa = Math.max(0, Math.min(p1, p2)); sb = Math.min(L, Math.max(p1, p2)); }
        if (sb - sa < 0.01) return;
        var cuts2 = [sa, sb];
        gs.forEach(function (g) { if (g.s1 > sa && g.s0 < sb) cuts2.push(Math.max(sa, g.s0), Math.min(sb, g.s1)); });
        cuts2.sort(function (p, q) { return p - q; });
        for (var j2 = 0; j2 < cuts2.length - 1; j2++) {
          var m2 = (cuts2[j2] + cuts2[j2 + 1]) / 2, gg = gs.filter(function (g) { return g.s0 < m2 && g.s1 > m2; })[0];
          piece(cuts2[j2], cuts2[j2 + 1], gg ? Math.max(HE, gg.h) : HE, k.h, Q.id + '-raised-' + i + '-' + ki + '-' + j2);
        }
      });
      /* v10: the leads' merlons on the breast, 1.5 long every 3.0, clear of its doors; each crenel between barred */
      if (Q.sky && MER > HE) {
        var clear = function (s0, s1) { return !gs.some(function (g) { return s1 > g.s0 - 0.6 && s0 < g.s1 + 0.6; }); };
        for (var m0 = 0.3; m0 < L - 0.3; m0 += 3.0) {
          var m1 = Math.min(L, m0 + 1.5);
          if (clear(m0, m1)) piece(m0, m1, HE, MER, Q.id + '-merlon-' + i + '-' + Math.round(m0 * 10));
          for (var cb = m1 + 0.3; cb < Math.min(L, m0 + 3.0) - 0.1; cb += 0.3)
            if (clear(cb, cb)) bar(cb, HE, MER, t / 2, Q.id + '-bar-' + i + '-' + Math.round(cb * 10));
        }
      }
    });
    if (Q.shaft) buildShaft(Q, gaps);
  }
  /* v17: a newel stair made a place: its newel; a landing at each door's sill, doors a few risers apart sharing the
     lowest (the old wall-walk's two at +30 and the wind-dial room's, six risers above them up straight steps in its own
     width, as the model has it); between the foot and each landing a flight of treads winding up clockwise, one riser
     apart and about 30 degrees, phased to meet its ends, so a turn's head room is 2.4 and each turn closes the view above
     and below (enclosed, no open drop: Fawkes, 2.27 am); a tread across a door's opening left out. Each flight is walked
     along its own treads */
  var shaftFlights = [], shaftStepped = {};
  function buildShaft(Q, gaps) {
    var S = Q.rec, c = Q.round.c, R = Q.round.r, NR = 0.15, rise = S.rise || 0.2, PR = 0.95, GO = 0.25, doors = [];
    gaps.forEach(function (gs) { gs.forEach(function (g) {
      if (g.spill || g.niche || !g.op.at) return;
      doors.push({ id: g.op.id, a: angle(c, toSite(M, g.op.group || null, g.op.at)), z: Q.floor + g.sill, top: Q.floor + g.h,
        w: g.s1 - g.s0, half: Math.atan2(g.s1 - g.s0, 2 * R) * 180 / Math.PI });
    }); });
    var newel = F.register(new THREE.Mesh(new THREE.CylinderGeometry(NR, NR, Q.ceiling - Q.floor, 12), mats.wall), LAYER.wall);
    newel.position.copy(toLocal(c[0], c[1], (Q.floor + Q.ceiling) / 2)); newel.name = Q.id + '-newel'; group.add(newel);
    function wedge(a0, a1, top, thick, mat, name) {
      var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180, s = new THREE.Shape();
      s.moveTo(NR * Math.cos(r0), NR * Math.sin(r0)); s.lineTo(R * Math.cos(r0), R * Math.sin(r0));
      s.absarc(0, 0, R, r0, r1, false); s.lineTo(NR * Math.cos(r1), NR * Math.sin(r1));
      var m = F.register(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 4 }), mat), LAYER.wall);
      m.rotation.x = -Math.PI / 2; m.position.copy(toLocal(c[0], c[1], top - thick)); m.name = name; group.add(m);
      return m;
    }
    var norm = function (x) { return ((x % 360) + 360) % 360; };
    var off = function (a, b) { return Math.abs(norm(a - b + 180) - 180); };
    var at = function (a, r) { return [c[0] + r * Math.cos(a * Math.PI / 180), c[1] + r * Math.sin(a * Math.PI / 180)]; };
    var end = function (a, r, z, la, lr, up) { var p = at(a, r), l = at(la, lr); return { x: p[0], y: p[1], z: z, lx: l[0], ly: l[1], up: up || 0 }; };
    /* the landings, each spanning its doors the short way round */
    var foot = doors.filter(function (d) { return d.z <= Q.floor + 0.05; })[0], lands = [];
    doors.filter(function (d) { return d.z > Q.floor + 0.05; }).sort(function (p, q) { return p.z - q.z; }).forEach(function (d) {
      var L = lands[lands.length - 1];
      if (L && d.z - L.z < 1.6) L.doors.push(d); else lands.push({ z: d.z, doors: [d] });
    });
    lands.forEach(function (L) {
      var ref = L.doors[0].a, lo = Infinity, hi = -Infinity;
      L.doors.forEach(function (d) { var x = ref + norm(d.a - ref + 180) - 180; lo = Math.min(lo, x - d.half - 8); hi = Math.max(hi, x + d.half + 8); });
      L.lo = lo; L.hi = hi; L.mid = (lo + hi) / 2;
      wedge(lo, hi, L.z, rise, mats.floor, Q.id + '-landing-' + Math.round(L.z * 10));
      shaftFloors.push({ c: c, r: R, z: L.z });
      /* a door a few risers over its landing: straight steps up in its own width, the newel's side to its sill */
      L.doors.filter(function (d) { return d.z > L.z + 0.05; }).forEach(function (d) {
        var n = Math.round((d.z - L.z) / rise), id = Q.id + '-steps-' + d.id, u = at(d.a, 1), ux = u[0] - c[0], uy = u[1] - c[1];
        for (var i = 1; i <= n; i++) {
          var r0 = R - (n - i + 1) * GO, hgt = i * rise, p = at(d.a, r0 + GO / 2);
          var st = slab(d.w, hgt, GO, mats.floor, 'floor'); st.position.copy(toLocal(p[0], p[1], L.z + hgt / 2));
          st.rotation.y = Math.atan2(ux, -uy); st.name = id + '-' + i; st.userData.stair = id; group.add(st);
        }
        shaftStepped[d.id] = true; shaftFloors.push({ c: c, r: R, z: d.z });
        shaftFlights.push({ id: id, foot: end(d.a, R - n * GO - 0.35, L.z, d.a, R), head: end(d.a, R - 0.35, d.z, d.a, R + 1),
          path: [[at(d.a, R - n * GO - 0.35), L.z], [at(d.a, R - 0.35), d.z]].map(function (q) { return [q[0][0], q[0][1], q[1]]; }) });
      });
    });
    /* the flights: from the foot to the first landing, and from each landing's clockwise end to the next one's other end */
    var stops = [{ z: Q.floor, out: foot ? foot.a - foot.half - 4 : 0 }].concat(lands.map(function (L) { return { z: L.z, in: L.hi, out: L.lo, mid: L.mid }; }));
    for (var j = 0; j + 1 < stops.length; j++) {
      var A = stops[j], B = stops[j + 1], n = Math.round((B.z - A.z) / rise), D = norm(A.out - B.in), best = D;
      for (var m = 0; m < 12; m++) { var Dm = D + 360 * m; if (Dm / n >= 12 && (Math.abs(Dm / n - 30) < Math.abs(best / n - 30) || best / n < 12)) best = Dm; }
      var t = best / n, fid = Q.id + '-flight-' + j, path = [];
      for (var k = 1; k <= n; k++) {
        var a1 = A.out - (k - 1) * t, a2 = A.out - k * t, mid = (a1 + a2) / 2, top = A.z + k * rise;   /* clockwise: the site's angle falling */
        if (k % 3 === 1 || k === n) { var pp = at(mid, PR); path.push([pp[0], pp[1], top]); }
        if (doors.some(function (d) { return top > d.z + 0.05 && top < d.top + 0.2 && off(mid, d.a) < d.half + 2 + t / 2; })) continue;
        wedge(a2 - 0.5, a1, top, rise, mats.floor, fid + '-' + k).userData.stair = fid;
      }
      shaftFlights.push({ id: fid, foot: end(A.out + 6, PR, A.z, A.out - 3 * t, PR, 0.9), head: end(B.in - 6, PR, B.z, B.mid != null ? B.mid : B.in, R),
        path: path, lamp: [c[0], c[1], B.z + 2.0] });
    }
  }
  var shaftFloors = [];
  buildPlace(P);
  /* one step on: the ways joined to this one by an open mouth, built in the same frame */
  /* (only a place whose wall the mouth is in; a way to a place not yet in the model, or not beside it, shows a dark
     recess beyond the mouth for now) */
  var firstWays = out.ways.slice();
  firstWays.forEach(function (w) {
    if (out.places.some(function (q) { return q.id === w.to; })) return;
    /* a way out of a hidden place (v8): its far side is its own shell, a tap away, never built here, since the two
       share a wall line the model draws without its thickness */
    /* v10: only where that side is a place the shells build (the West Tower's spiral is none yet: its rooms' ways out
       answer as a shut door, so the events hear the tap) */
    if (w.back) { w.built = !!findPlace(M, w.to); return; }
    var Q = findPlace(M, w.to);
    /* v13: a way on through a stair in the wall shows the stair's dark beyond its mouth, the room at its far end a tap away */
    if (w.via) { w.built = !!Q; Q = null; }
    /* a built room (one with its own page) is never shelled: the way takes him to its page (line 5's rule) */
    if (Q && Q.rec && Q.rec.page) { w.built = true; w.page = Q.rec.page; }
    /* v13: a deep way (the flanker's arch through the spur's 1.2) finds its far room at its far face, as its gap does */
    else if (Q && onEdge(Q.poly, w.at, w.depth > 1.0 || Q.shaft ? w.depth + 0.2 : null)) { out.places.push(Q); buildPlace(Q); w.built = true; return; }    var depth = 3.0, rec = slab(w.w + 0.4, w.h + 0.2, depth, F.solid(0x141210), 'way');
    rec.position.set(w.mid.x - w.inward.x * (depth / 2 + 0.9), w.mid.y + w.sill + w.h / 2, w.mid.z - w.inward.z * (depth / 2 + 0.9));
    rec.rotation.y = Math.atan2(w.inward.x, w.inward.z); rec.material.side = THREE.BackSide; rec.name = 'beyond-' + w.id;
    group.add(rec);
  });
  /* v19 (the Found list): a way off the far side of the next place, added as that place was built (lake-passage-b-north
     seen from the lake-face corridor), leads on to the place there, a tap away past the dark, as a way up a stair in a
     wall does (v13); to a built room, its page */
  out.ways.forEach(function (w) {
    if (firstWays.indexOf(w) >= 0 || w.back || w.place === P.id) return;
    var Q = findPlace(M, w.to);
    if (!Q || Q.id === P.id) return;
    w.built = true; if (Q.rec && Q.rec.page) w.page = Q.rec.page;
  });

  /* v14: a ladder or trapdoor through a floor (a stair with `rooms` and a `rect`, no span or arc: the gate loft's, the
     feast loft's) is a way: a dark square in this place's floor where it goes down, in its ceiling where it goes up,
     the room at its other end a tap away; its stand beside it, looking at it */
  (M.stairs || []).forEach(function (s) {
    if (!s.rect || s.span || s.arc || !s.rooms || s.rooms.length < 2 || !/ladder|trapdoor|hatch/.test(s.kind || '')) return;
    if (!s.rooms.some(function (r) { return slug(r) === P.id; })) return;
    var down = Math.abs(s.to - P.floor) < 0.05, up = Math.abs(s.from - P.floor) < 0.05;
    if (!down && !up) return;
    var to = slug(s.rooms.filter(function (r) { return slug(r) !== P.id; })[0]);
    var R = s.rect, mx = (R[0] + R[2]) / 2, my = (R[1] + R[3]) / 2, wx = R[2] - R[0], wy = R[3] - R[1];
    var y = down ? 0.012 : Math.min(s.to - 0.7, P.ceiling) - P.floor - 0.012;
    var sq = new THREE.Mesh(new THREE.PlaneGeometry(wx, wy), F.solid(0x141210));
    sq.rotation.x = down ? -Math.PI / 2 : Math.PI / 2; sq.position.copy(toLocal(mx, my, P.floor)); sq.position.y = y;
    sq.name = 'way-' + s.id; sq.userData.way = s.id; sq.userData.hatch = down ? 'down' : 'up'; group.add(sq);
    var xs = P.poly.map(function (p) { return p[0]; }), ys = P.poly.map(function (p) { return p[1]; });
    var pcx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, pcy = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    var ix = pcx - mx, iy = pcy - my, il = Math.hypot(ix, iy);
    if (il < 0.3) { ix = 0; iy = -1; il = 1; }
    var mid = toLocal(mx, my, P.floor); mid.y = y;
    out.ways.push({ id: s.id, to: to, mesh: sq, w: Math.min(wx, wy), h: 0.8, mid: mid, foot: toLocal(mx, my, P.floor), inward: new THREE.Vector3(ix / il, 0, -iy / il),
      place: P.id, at: [mx, my], half: Math.max(wx, wy) / 2, sill: 0, lift: 0, level: P.floor, back: false, via: false, depth: 0,
      hatch: down ? 'down' : 'up', built: !!findPlace(M, to) });
  });
  /* v19 (the Found list): a rail round a hatch or a stair's opening in the boards (a feature with `rect`, `z`, `h` and
     `sides`, a side's span by its own name where it stops short: the feast loft's, ledger line 89 a; the drying
     loft's, line 82): a top rail and posts about a metre apart, stair grey; nothing to tap */
  (M.features || []).forEach(function (ft) {
    if (!ft.rect || !ft.sides || !ft.h || ft.z == null || slug(ft.room || '') !== P.id) return;
    var R = ft.rect, T = 0.06;
    ft.sides.forEach(function (sd) {
      var ns = sd === 'north' || sd === 'south', sp = ft[sd] || (ns ? [R[0], R[2]] : [R[1], R[3]]);
      var fix = sd === 'west' ? R[0] : sd === 'east' ? R[2] : sd === 'south' ? R[1] : R[3], L = sp[1] - sp[0];
      if (L <= 0) return;
      var at = function (u) { return ns ? toLocal(u, fix, ft.z) : toLocal(fix, u, ft.z); }, c = at((sp[0] + sp[1]) / 2);
      var bar = slab(ns ? L + T : T, T, ns ? T : L + T, mats.stair, 'stair');
      bar.position.set(c.x, c.y + ft.h - T / 2, c.z); bar.name = P.id + '-rail-' + ft.id + '-' + sd; group.add(bar);
      for (var n = Math.max(1, Math.round(L)), i = 0; i <= n; i++) {
        var p = at(sp[0] + L * i / n), post = slab(T, ft.h, T, mats.stair, 'stair');
        post.position.set(p.x, p.y + ft.h / 2, p.z); post.name = P.id + '-rail-post-' + ft.id + '-' + sd + '-' + i; group.add(post);
      }
    });
  });

  /* v22 (the Found list): masonry of another work standing in a place (a feature with `circle`, `r`, `z` and `top`, no
     arc or ring: the south-west drum in the drying loft's corner, drying-loft-drum): a stone drum from z to top, wall
     grey, its curved face toward the room; what stands outside the room hides behind its walls; nothing to tap */
  (M.features || []).forEach(function (ft) {
    if (!ft.circle || !ft.r || ft.top == null || ft.z == null || ft.arc || ft.ring || slug(ft.room || '') !== P.id) return;
    var cyl = slab(1, 1, 1, mats.wall, 'wall');
    cyl.geometry.dispose(); cyl.geometry = new THREE.CylinderGeometry(ft.r, ft.r, ft.top - ft.z, 48);
    var p = toLocal(ft.circle[0], ft.circle[1], ft.z);
    cyl.position.set(p.x, p.y + (ft.top - ft.z) / 2, p.z); cyl.name = P.id + '-masonry-' + ft.id; group.add(cyl);
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
    if (shaftFloors.some(function (f) { return Math.abs(f.z - z) < 0.02 && Math.hypot(x - f.c[0], y - f.c[1]) <= f.r; })) return true;
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
    if (d.hatch) return hatchStand(d, name, false);
    var off = d.back ? 0.5 : P.shaft && d.place === P.id ? (shaftStepped[d.id] ? 0.35 : 1.0) : d.lift ? STAND_OFF : Math.min(10, Math.max(STAND_OFF, d.w * 1.1, d.h * 1.6));   /* far enough back to see it whole; a hidden place's way out a step in, its landings narrow */
    var pos = d.mid.clone().add(d.inward.clone().multiplyScalar(off)); pos.y = d.mid.y + d.lift + EYE;
    /* v8: never off the floor (a small room, the commentator's box): nearer the door until he stands on it */
    while (off > 0.6 && !onLevel(pos.x + cx, cy - pos.z, d.level)) { off -= 0.2; pos = d.mid.clone().add(d.inward.clone().multiplyScalar(off)); pos.y = d.mid.y + d.lift + EYE; }
    if (P.ring && d.place === P.id) pos = midRing(pos);
    var look = d.mid.clone(); look.y = d.mid.y + d.lift + (d.lift ? EYE : Math.max(EYE, d.h * 0.45));
    return { name: name, pos: pos, look: look, thing: d.mesh, level: d.level };
  }
  /* v14: beside a ladder's square in the floor or ceiling, on the room's side of it; at the start, looking into the room
     the way he came up or down, else at the square */
  function hatchStand(d, name, start) {
    var off = d.half + 0.9, p = d.foot.clone().add(d.inward.clone().multiplyScalar(off));
    while (off > 0.5 && !onLevel(p.x + cx, cy - p.z, d.level)) { off -= 0.2; p = d.foot.clone().add(d.inward.clone().multiplyScalar(off)); }
    p.y = d.foot.y + EYE;
    var look = start ? openLook(p, d.inward, d.level, p.y) : d.mid.clone();
    return { name: name, pos: p, look: look, thing: start ? null : d.mesh, level: d.level };
  }
  /* v14: the start looks the way the floor runs longest within a right angle either side of straight in, so a room
     entered across its short side (the guard room, the library's gallery, the flanker) opens along its length; a run
     of 6 m or more straight in is kept */
  function openLook(pos, inw, level, ly) {
    var run = function (a) {
      var c = Math.cos(a), s = Math.sin(a), dx = inw.x * c + inw.z * s, dz = -inw.x * s + inw.z * c, t = 0.3;
      var on = function (u) { return inArea(P, pos.x + dx * u + cx, cy - (pos.z + dz * u)); };   /* this place's own floor */
      while (t < 2.6 && !on(t)) t += 0.25;              /* from a mouth or a step outside it, in onto the floor first */
      var t0 = t;
      while (t < 20 && on(t)) t += 0.25;
      t -= t0;
      return { t: t, dx: dx, dz: dz };
    };
    var best = run(0), score = best.t;
    if (best.t < 6) for (var k = -8; k <= 8; k++) {
      if (!k) continue;
      var r = run(k * 10 * Math.PI / 180), sc = r.t - Math.abs(k) * 0.05;
      if (sc > score + 0.5) { best = r; score = sc; }
    }
    return new THREE.Vector3(pos.x + best.dx * 20, ly, pos.z + best.dz * 20);
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
    if (d.hatch) return hatchStand(d, name, true);
    /* v18: up a stair in a wall (d.via) a step inside the room, clear of the arch's own wall ends; in a round room four
       fifths of the way to its middle, where the orrery room's door, deep in the drum's wall at a slant, comes into
       sight (Events' ninety-first, 3.19 am, 16 October: from the arch's mouth the reveal hid it at the head's full turn) */
    var viaIn = P.round ? P.round.r * 0.8 : 1.0;
    var back = d.back ? 0.5 : d.mesh.userData.way ? (d.via ? viaIn : d.page || !d.built ? -0.3 : -1.0) : P.shaft ? (shaftStepped[d.id] ? 0.35 : 1.0) : STAND_OFF;
    var pos = d.mid.clone().add(d.inward.clone().multiplyScalar(back)); pos.y = d.mid.y + d.lift + EYE;
    /* v10: never off the floor (a ring 0.9 wide): nearer the door until he stands on it */
    while (back > 0.6 && !onLevel(pos.x + cx, cy - pos.z, d.level)) { back -= 0.2; pos = d.mid.clone().add(d.inward.clone().multiplyScalar(back)); pos.y = d.mid.y + d.lift + EYE; }
    var look = d.mid.clone().add(d.inward.clone().multiplyScalar(STAND_OFF + 20)); look.y = d.mid.y + d.lift + EYE + 0.3;
    if (!P.ring && !P.shaft) {
      /* v14: arriving from outside a short room (under 6 m straight in: the flanker through its deep arch, the vault from
         its ledge), a step inside it first, so the look round is not cut by the mouth's sides */
      var inP = function (v) { var s_ = siteOf(v); return inArea(P, s_[0], s_[1]); };
      if (!inP(pos)) {
        var u = 0, q = pos.clone();
        while (u < 3 && !inP(q)) { u += 0.1; q = pos.clone().add(d.inward.clone().multiplyScalar(u)); }
        if (inP(q) && !inP(q.clone().add(d.inward.clone().multiplyScalar(6)))) {
          var dep = 0; while (dep < 6 && inP(q.clone().add(d.inward.clone().multiplyScalar(dep + 0.1)))) dep += 0.1;
          pos = q.add(d.inward.clone().multiplyScalar(Math.min(1.5, dep / 2)));    /* to its middle, a corridor entered from its side */
        }
      }
      look = openLook(pos, d.inward, d.level, look.y);
    }
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
  var entry = mine.filter(function (d) { return o.from && d.to === o.from; })[0] ||
    (P.shaft ? out.hidden.filter(function (d) { return d.place === P.id && o.from && d.to === o.from; })[0] : null) ||   /* v17: in by a hidden door, beside it */ mine.filter(function (d) { return o.start && d.id === o.start; })[0] ||
    (P.shaft ? mine.filter(function (d) { return d.level <= P.floor + 0.05; })[0] : null) || mine[0];   /* v17: a stair's well, at its foot */
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
  /* v17: a stair's well, its flights: a stand at each end, walked along its treads */
  shaftFlights.forEach(function (f) {
    var mk = function (e, name) { return { name: name, pos: toLocal(e.x, e.y, e.z + EYE), look: toLocal(e.lx, e.ly, e.z + EYE + e.up), thing: null, level: e.z }; };
    var fs = mk(f.foot, f.id + ' foot'), hs = mk(f.head, f.id + ' head');
    out.flights.push({ id: f.id, foot: fs, head: hs, footPt: fs.pos.clone(), headPt: hs.pos.clone(), lamp: f.lamp || null,
      path: f.path.map(function (p) { return toLocal(p[0], p[1], p[2] + EYE); }).concat([hs.pos.clone()]) });
    out.stands.push(fs, hs);
  });

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
  /* v18 (Events' ninety-first, 3.19 am, 16 October; the world rules: a way out always open): the start takes the whole
     turn round when a way of this place, the one he came by included, cannot be reached by any chain of taps from it
     (the dovecote, its one arch behind him; the orrery room's arch, 108 degrees left of the door's start), unless the
     model names the start's own turn. A thing is in reach of a stand within its turn and 10 degrees of the narrowest
     frame; a tap on it walks him to its stand, and from there on. v20 (Events' ninety-second, 4.01 am): its doors
     count as its ways do (the stair feet and the lake-face corridors on 1 and 6, their one door 100 degrees off the
     start's look, nothing else to tap). */
  var st0 = out.stands[0];
  if (st0 && st0.name === 'start' && st0.lim.turn < 180 && !(named.start && named.start.turn != null)) {
    var here_ = all.filter(function (d) { return d.place === P.id && d.mid; });
    var inReach = function (s, d) {
      if (!s.lim || s.lim.turn >= 180) return true;
      var dl = s.look.clone().sub(s.pos), v = d.mid.clone().sub(s.pos);
      if (Math.hypot(v.x, v.z) < 0.3) return true;
      var a = Math.atan2(v.x, v.z) - Math.atan2(dl.x, dl.z);
      return Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) * 180 / Math.PI <= s.lim.turn + 10;
    };
    var seen = [], q = [st0];
    while (q.length) {
      var s_ = q.shift();
      here_.forEach(function (d) { if (seen.indexOf(d) < 0 && inReach(s_, d)) { seen.push(d); if (d.stand) q.push(d.stand); } });
    }
    var lost = here_.filter(function (d) { return seen.indexOf(d) < 0; });
    if (lost.length) { st0.lim.turn = 180; st0.wide = lost.map(function (d) { return d.id; }).join(' '); }
  }
  out.look = LK;
  return out;
} };
})();
