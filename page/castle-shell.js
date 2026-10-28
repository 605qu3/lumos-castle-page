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
             level, hidden } (the tap is its id to the events, as a door's: Events' `tap keep-east-stair-panel-3`);
             none for a `oneway` opening, which opens from its inside only (v58); on a hung room's box too (v59)
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
   v24 (model v54): an open side over another place's air (an opening's `over`) builds that place too; a rail is drawn
   wherever its room is built or in the place whose air it stands in; openings that overlap along one wall are cut
   together, the wall drawn round both; a wall two places share in plan is left to the other only at one height.
   v25 (model v57): a stair walked as a place takes `from` and `to` from its `floors` where not given; a door into it
   with no `z` stands at its other room's floor; the walk's radius and the step in from a door scale with the well's.
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
  /* v74 (model v176): a room with its own `z` (the level-T rooms: the head's office, Divination and its landing, the
     owlery, secret-s1; there is no level T) stands at that height, its ceiling then in the castle's frame as the model
     says; before, they stood from 0 */
  var zb = r && r.z != null && !r.group ? r.z : null;
  function ceilOf(b) { return zb != null ? (r.ceiling != null ? r.ceiling : zb + (M.site.storey || 5.2) - 0.7) : b + (r.ceiling != null ? r.ceiling : (M.site.storey || 5.2) - 0.7); }
  if (r && r.shape && r.shape.rect) {
    var a = r.shape.rect, base = zb != null ? zb : levelZ(M, r.level) + (r.group ? M.groups.filter(function (g) { return g.id === r.group; })[0].place.z - levelZ(M, r.level) : 0);
    var pts = [[a[0], a[1]], [a[2], a[1]], [a[2], a[3]], [a[0], a[3]]].map(function (p) { return toSite(M, r.group, p); });
    var floor = base + (r.floor || 0);
    return { id: r.id, name: r.name, kind: 'room', poly: pts, floor: floor, ceiling: ceilOf(base),
      wall: r.wall || WALL_T, walls: r.walls || null, rec: r };
  }
  /* v12: a room drawn by its plan's corners ({ poly }, counter-clockwise: the gunners' casemate between two drums' faces,
     ledger line 94), floor and ceiling as a rect room's */
  if (r && r.shape && r.shape.poly) {
    var pb = zb != null ? zb : levelZ(M, r.level), pp = r.shape.poly.map(function (p) { return toSite(M, r.group, p); });
    return { id: r.id, name: r.name, kind: 'room', poly: pp, floor: pb + (r.floor || 0), ceiling: ceilOf(pb),
      wall: r.wall || WALL_T, walls: null, rec: r };
  }
  /* v90 (model v218, the Astronomy Tower's top, req 663): a round room open to the sky (`open_sky`): the drum's roof inside
     its parapet, and a turret standing up through the edge (a notch in the plan, its walls as tall as the turret, its door
     cut there); no ceiling, the sky over it. One loop, each side its own height. v92 (model v219): the parapet and the turret
     read from the room's `tower` (the model's towers: `platform.parapet.crenellated`, twenty merlons round the ring, and
     `turret`), the merlons' sides 2.2 high and the gaps at the breast; with no tower, a plain breast and a `notch` of its own. */
  if (r && r.shape && r.shape.circle && r.open_sky) {
    var ob = zb != null ? zb : levelZ(M, r.level), oc = toSite(M, r.group, r.shape.circle), orr = r.shape.r, osk = r.open_sky;
    var otw = osk.tower ? (M.towers || []).filter(function (x) { return x.id === osk.tower; })[0] : null, opf = otw && otw.platform, ocr = opf && opf.parapet.crenellated;
    var ostep = null, oBreast = ocr ? ocr.sill : osk.breast, oloop = [], oh = [], on = osk.notch || (otw && otw.turret ? { c: otw.turret.c, r: otw.turret.r, h: otw.turret.cap - ob } : null);
    if (on) {
      var dx = on.c[0] - oc[0], dy = on.c[1] - oc[1], dd = Math.hypot(dx, dy), th = Math.atan2(dy, dx) * 180 / Math.PI;
      var aa = (orr * orr - on.r * on.r + dd * dd) / (2 * dd), al = Math.acos(Math.max(-1, Math.min(1, aa / orr))) * 180 / Math.PI;
      var a0 = th + al, a1 = th - al + 360, cuts = [a0, a1], mer = [];
      if (ocr) {   /* merlon k centred on bearing first_merlon + k * 360 / bays, its width taken at the parapet's middle line */
        var half = ocr.merlon_w / 2 / ((opf.parapet.inner_r + opf.parapet.outer_r) / 2) * 180 / Math.PI;
        for (var mk = 0; mk < ocr.bays; mk++) for (var sh = -360; sh <= 360; sh += 360) {
          var mc = 90 - (ocr.first_merlon + mk * 360 / ocr.bays) + sh;
          if (mc + half > a0 && mc - half < a1) { mer.push([mc - half, mc + half]); [mc - half, mc + half].forEach(function (c) { if (c > a0 + 0.02 && c < a1 - 0.02) cuts.push(c); }); }
        }
      } else { for (var ck = 1; ck < Math.ceil((a1 - a0) / 12); ck++) cuts.push(a0 + (a1 - a0) * ck / Math.ceil((a1 - a0) / 12)); }
      cuts.sort(function (p, q) { return p - q; });
      for (var ci = 0; ci < cuts.length - 1; ci++) {
        var mid = (cuts[ci] + cuts[ci + 1]) / 2;
        oloop.push(arcPts(oc, orr, cuts[ci], cuts[ci], 1)[0]);
        oh.push(mer.some(function (m) { return mid > m[0] && mid < m[1]; }) ? ocr.merlon_top : oBreast);
      }
      oloop.push(arcPts(oc, orr, a1, a1, 1)[0]);
      var pb = oloop[oloop.length - 1], pa = oloop[0], ph0 = Math.atan2(oc[1] - on.c[1], oc[0] - on.c[0]);
      var wrap = function (v) { while (v > Math.PI) v -= 2 * Math.PI; while (v < -Math.PI) v += 2 * Math.PI; return v; };
      var db = wrap(Math.atan2(pb[1] - on.c[1], pb[0] - on.c[0]) - ph0), da = wrap(Math.atan2(pa[1] - on.c[1], pa[0] - on.c[0]) - ph0);
      var nIn = Math.max(8, Math.ceil(Math.abs(da - db) * on.r / 0.7));       /* the turret's face in sides about 0.7 long */
      for (var ik = 1; ik <= nIn; ik++) { var ia = ph0 + db + (da - db) * ik / nIn; oloop.push([on.c[0] + on.r * Math.cos(ia), on.c[1] + on.r * Math.sin(ia)]); oh.push(on.h); }
      oloop.pop();   /* the last point is the first again; oh[i] is the side from oloop[i] to the next: the parapet's first, the turret's after */
      if (opf && opf.step) {   /* v92: the step round the parapet's foot (`platform.step`: inner r, h), cut by the turret's face as the floor is */
        var sr = opf.step.inner_r, sal = Math.acos(Math.max(-1, Math.min(1, (sr * sr + dd * dd - on.r * on.r) / (2 * sr * dd)))) * 180 / Math.PI, sn = Math.ceil((360 - 2 * sal) / 7.5);
        var sin_ = arcPts(oc, sr, th + sal, th - sal + 360, sn), sout = arcPts(oc, orr, th - al + 360, th + al, Math.ceil((360 - 2 * al) / 7.5));
        ostep = { inner: sin_, ring: sin_.concat(sout), h: opf.step.h };
      }
    } else {
      oloop = arcPts(oc, orr, 0, 360, 30).slice(0, 30); oh = oloop.map(function () { return oBreast; });
    }
    return { id: r.id, name: r.name, kind: 'room', poly: oloop, loops: [oloop], loopH: [oh], area: { outer: oloop, holes: [] },
      floor: ob + (r.floor || 0), ceiling: null, wall: r.wall || (opf ? opf.parapet.outer_r - opf.parapet.inner_r : 0.5), walls: null, rec: r, sky: { breast: oBreast, merlons: 0 }, step: ostep };
  }
  /* v10: a round room, SIDES sides about the circle, one side's middle on its first door, its wall as deep as its
     deepest loop (the West Tower's drum, 3.2) */
  if (r && r.shape && r.shape.circle) {
    var cb = zb != null ? zb : levelZ(M, r.level) + (r.group ? M.groups.filter(function (g) { return g.id === r.group; })[0].place.z - levelZ(M, r.level) : 0);
    var cc = toSite(M, r.group, r.shape.circle), rr = r.shape.r, deep = 0;
    var first = (M.openings || []).filter(function (op) { return op.at && (op.between || []).indexOf(r.id) >= 0; })[0];
    var off = first ? angle(cc, toSite(M, first.group || null, first.at)) : 0, half = 180 / SIDES;
    var cp = arcPts(cc, rr / Math.cos(half * Math.PI / 180), off + half, off + 360 + half, SIDES).slice(0, SIDES);
    (M.openings || []).forEach(function (op) { if (op.room === r.id && op.depth) deep = Math.max(deep, op.depth); });
    return { id: r.id, name: r.name, kind: 'room', poly: cp, area: { outer: cp, holes: [] }, round: { c: cc, r: rr }, floor: cb + (r.floor || 0),
      ceiling: ceilOf(cb), wall: r.wall || deep || WALL_T, walls: null, rec: r };
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
    /* v25 (model v57, the West Tower's): `from` and `to`, where not given, its first and last `floors` */
    var sfrom = st.from != null ? st.from : levelZ(M, st.floors[0]), sto = st.to != null ? st.to : levelZ(M, st.floors[st.floors.length - 1]);
    return { id: slug(st.id), name: st.name || st.id.replace(/-/g, ' '), kind: 'room', poly: scp, area: { outer: scp, holes: [] },
      round: { c: scc, r: srr }, floor: sfrom, ceiling: sto + (st.double ? 5.2 : 2.4), wall: 0.5,   /* v80: a double stair's top room a storey */ walls: null, rec: st, shaft: true,
      openTop: !!st.open_top };   /* v84 (the Architect's 165th, H82's cleft): `open_top`, its top open to the sky, no ceiling */
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
    /* req 899 (v61): only a roof with its lead flat is built as the stair hall's is; a range's roof without one (or a bare number) leaves the mass its top storey */
    return { id: slug(m.id), name: m.id, kind: 'mass', poly: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], floor: lo,
      ceiling: m.court ? null : (m.roof && m.roof.flat) ? m.roof.flat.z : hi, wall: WALL_T, walls: null, rec: m, roof: (m.roof && m.roof.flat) ? m.roof : null };
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
/* v80 (H80's climbing way): a hidden door onto a stair marked `via` leads on to the stair's other room, as a way does */
function hiddenTo(M, op, id) {
  var to = other(op, id), s = (M.stairs || []).filter(function (x) { return slug(x.id) === to; })[0];
  return s && s.via ? viaStair(M, to, id) || to : to;
}
/* v38: a door rusted fixed open (the old cells' eight, H16) is a way, its leaf not drawn, till a detail pass draws its bars */
function isWay(kind) { return /open mouth|archway|arch\b|fixed open/.test(kind || ''); }
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
  loops.forEach(function (pts, j) { pts.forEach(function (a, i) { E.push({ a: a, b: pts[(i + 1) % pts.length], H: hs ? (Array.isArray(hs[j]) ? hs[j][i] : hs[j]) : null, T: ts ? ts[j] : null }); }); });
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

/* each panelled room's grade on Design's ladder (CastlePanelling.GRADES, 0 plain to 3 rich), one line a room when Godric
   grades them (design-panelling-grades-1021); a room not named takes grade 2, his 1 on design-panelling-staff-1021.
   Graded by rank, his 1 on design-panelling-grades-1021 (21 October 2026, 7.10 am; Design's req 844): the teachers'
   offices 1, the staff room 2, the library and the Headmaster's study 3; the study 1 provisional, Godric to confirm */
var PANEL_GRADE = {
  'snape-office': 1, 'mcgonagalls-office': 1, 'pomfrey-office': 1, 'defence-office': 1,
  'muggle-studies-study': 1, 'pince-office': 1, 'study': 1,
  'staff-room': 2,
  'library': 3, 'library-reading-room': 3, 'library-map-room': 3, 'dumbledores-office': 3
};

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
  var out = { group: group, place: P, places: [P], doors: [], ways: [], hidden: [], stairs: [], flights: [], stands: [], panes: [], toLocal: toLocal };

  /* v34 (req 716, Events' corbels.json on Design's 756): out.corbels(state) sets every built place's carved faces to
     'awake', 'dozing' or 'sleeping', the beams' through CastleCeilings.corbels and the vaults' here; in an awake place
     one vault face (fixed by the place) dozes, Events' "one or two dozing". Returns how many faces it set */
  var vaultFaces = {}, faceMats = {};
  function vaultFaceMat(state) {
    if (!faceMats[state]) {
      var FC = window.CastleCeilings.faces, t = new THREE.TextureLoader().load(FC.base() + FC.files[state]);
      if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
      faceMats[state] = new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5 });
    }
    return faceMats[state];
  }
  out.corbels = function (state) {
    var n = 0;
    out.places.forEach(function (Q) {
      if (window.CastleCeilings && CastleCeilings.corbels) n += CastleCeilings.corbels(Q.id, state);
      var V = vaultFaces[Q.id] || [], doze = V.length ? CastleCeilings.faces.cell(Q.id, 0) % V.length : -1;
      if (!window.CastleCeilings.faces.files[state]) return;
      V.forEach(function (m, k) { m.material = vaultFaceMat(state === 'awake' && k === doze ? 'dozing' : state); n++; });
    });
    return n;
  };

  /* v28 (fawkes-materials-rollout-1020, 1, Godric's 7.37 am direction, 20 October 2026): the places named in o.paint
     take plain tones, each surface its row's: page/castle-paint.js (generated by tools/architect-materials.py, the
     rows of docs/architect/materials-by-room.md) gives the stone, dressing, floor and ceiling, a mass's runs of stone
     along it and a hall's older band below; page/design/tones.js (Design's, req 643) the colours, the model's
     materials.stones the fallback. Provisional until Design's tones are settled; nothing drawn, nothing generated. */
  var PAINT = window.CASTLE_PAINT || null, TONES = window.CASTLE_TONES || null, painted = o.paint || [], TRIM = !!o.trim && !!window.CastleTrim;   /* v91 */
  var paintMats = {}, damp = false;   /* v45: a place below ground reads Design's damp keys first (req 824) */
  function hexOf(v) { return typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : v; }
  function shade(h, k) { return (Math.min(255, Math.round((h >> 16 & 255) * k)) << 16) | (Math.min(255, Math.round((h >> 8 & 255) * k)) << 8) | Math.min(255, Math.round((h & 255) * k)); }
  function stoneHex(stone) {
    var s = ((M.materials || {}).stones || []).filter(function (q) { return q.id === stone; })[0];
    return s ? (s.colour[0] << 16) | (s.colour[1] << 8) | s.colour[2] : (TONES && TONES.surfaces[stone] ? hexOf(TONES.surfaces[stone].hex) : GREY.wall);
  }
  function tone(key, stone, step) {   /* key: "<stone>/<dress>", "flags-<stone>", "vault-<stone>", or a surface's name */
    var R = TONES && TONES.resolved, S = TONES && TONES.surfaces;
    if (damp && R && R[key + '/below']) return hexOf(R[key + '/below']);
    if (R && R[key]) return hexOf(R[key]);
    if (S && S[key]) return hexOf(S[key].hex);
    var FALL = { marble: 0xe2ded6, oak: 0x6e4c30, 'oak-boards': 0x7d5937, 'oak-beams': 0x5a3d26, earth: 0x4f4130, iron: 0x34312e, plaster: 0xe8e2d4, 'sky-day': 0xb8cde6, 'sky-night': 0x10141f };
    return stone ? shade(stoneHex(stone), step || 1) : FALL[key] != null ? FALL[key] : GREY.wall;
  }
  function paintMat(hex, two) {
    var k = hex + (two ? 'd' : '');
    if (!paintMats[k]) { paintMats[k] = F.solid(hex); if (two) paintMats[k].side = THREE.DoubleSide; }
    return paintMats[k];
  }
  function rowOf(Q) {   /* a room's row, or a mass's (the stair hall) with its runs at Q's floor */
    if (!PAINT || painted.indexOf(Q.id) < 0) return null;
    if (PAINT.rooms[Q.id]) return PAINT.rooms[Q.id];
    var lv = (M.levels || []).filter(function (l) { return Math.abs(l.z - Q.floor) < 0.05; })[0];
    var ms = PAINT.masses.filter(function (m) { return slug(m.id) === Q.id; });
    var m = ms.filter(function (q) { return lv && q.level === lv.id; })[0] || ms[0];
    if (m) return { stone: m.runs[0][2], dress: m.dress, floor: 'flags', ceiling: 'rib', light: 'torches', mass: m };
    /* v88: a stair that is a place on its own (H82's fern well) takes its stair's stone, rubble-dressed, as a well cut in rock */
    var sp = PAINT.stairs && PAINT.stairs[Q.id];
    return sp && sp.stone !== 'marble' ? { stone: sp.stone, dress: 'rubble', floor: 'flags', ceiling: 'barrel', light: 'torches' } : null;
  }
  function stoneAt(row, sx, sy, z) {
    if (row.band && z != null && z < row.band.top) return row.band.stone;
    if (!row.mass) return row.stone;
    var v = row.mass.axis === 'y' ? sy : sx, r = row.mass.runs.filter(function (q) { return v >= q[0] && v <= q[1]; })[0];
    return r ? r[2] : row.stone;
  }
  function wallMat(row, sx, sy, z) {
    var st = stoneAt(row, sx, sy, z), R = TONES && TONES.resolved;
    /* a panelled room's walls Design's oak, a limewashed room's its plaster, till tones.js gives "<stone>/panelled" its own */
    if (!(R && R[st + '/' + row.dress]) && (row.dress === 'panelled' || row.dress === 'limewash'))
      return paintMat(tone(row.dress === 'panelled' ? 'oak' : 'plaster'), true);
    return faced(st, window.CastleStoneFace && CastleStoneFace.kind(row.dress), tone(st + '/' + row.dress, st), true);
  }
  /* v91 (the Architect's 182nd, Godric's word of 27 October 2026, 8.06 pm: trim on both faces of every opening; a pilot,
     o.trim, shell.html?trim=1): an opening's dressing is its wall's stone cut and laid smooth, a shade lighter */
  function trimMat(row, sx, sy, z) {
    if (!row) return paintMat(shade(GREY.wall, 1.12), true);
    var st = stoneAt(row, sx, sy, z);
    return faced(st, window.CastleStoneFace && CastleStoneFace.kind('ashlar'), tone(st + '/ashlar', st, 1.08), true);
  }
  function floorMat(row, sx, sy, two) {
    var st = stoneAt(row, sx, sy);
    if (row.floor === 'boards' || row.floor === 'marble') return paintMat(tone(row.floor === 'boards' ? 'oak-boards' : 'marble'), two);
    if (row.floor === 'earth') return paintMat(tone('earth'), two);   /* v72: the cellar under the Gryffindor storeroom, a cave's earthen floor (ledger 228) */
    return faced(st, 'flags', tone('flags-' + st, st, 0.86), two);
  }
  /* v53 (req 858, Design's stone-face.js on Godric's 1 on design-bright-rooms-1021): a stone the kit faces (late-pale
     first) is laid with its courses, rubble, limewash or flags, mapped in world space; its own material, cached apart
     from the flat paint so a tone shared by hex with an unfaced stone stays flat */
  function faced(st, kind, hex, two) {
    var CSF = window.CastleStoneFace;
    if (!CSF || !kind || !CSF.FACED[st]) return paintMat(hex, two);
    var k = hex + (two ? 'd' : '') + 'f' + kind;
    if (!paintMats[k]) { paintMats[k] = F.solid(hex); if (two) paintMats[k].side = THREE.DoubleSide; CSF.dress(THREE, paintMats[k], kind); }
    return paintMats[k];
  }
  function ceilMat(row, sx, sy) {
    var c = row.ceiling, st = stoneAt(row, sx, sy);
    if (row.ctone === 'black') return paintMat(0x0b0a09, true);   /* v43: a ceiling painted dead black (the camera obscura's hip, W5B-36) */
    if (c === 'sky') return paintMat(tone('sky-day'), true);
    if (c === 'beams' || c === 'open-roof') return paintMat(tone('oak-beams'), true);
    if (c === 'plaster') return paintMat(tone('plaster'), true);
    if (c === 'boards') return paintMat(tone('oak-boards'), true);    /* v55: the late rooms' oak boards (design-ceilings-1021, Try 1) */
    return paintMat(tone('vault-' + st, st, 0.92), true);
  }
  function stairMat(id) {
    var s = PAINT && PAINT.stairs[id];
    if (!s) return null;
    return paintMat(s.stone === 'marble' ? tone('marble') : tone('flags-' + s.stone, s.stone, 0.86));
  }
  out.paint = { painted: painted, row: function (id) { return rowOf({ id: id, floor: 0 }); } };

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
  /* v86 (the Architect's 167th, the scroll hall, ledger 292): a room whose model row names a gable roof part (`gable`,
     its id in a mass's roof.parts) takes that roof's two slopes as its ceiling, cut to the room's rect, its walls to the
     ridge behind them; oak principals at an even pitch near 3.2 m (the windows' bays) and a ridge beam, each bearing
     2 cm up into the boards (the seams rule) */
  function gableOf(Q) {
    var g = Q.rec && !Q.rec.group && Q.rec.gable, p = null;
    if (!g) return null;
    (M.masses || []).forEach(function (m) { ((m.roof && m.roof.parts) || []).forEach(function (q) { if (q.id === g) p = q; }); });
    return p && p.kind === 'gable' && p.rect ? p : null;
  }
  function buildGable(Q, P, x0, y0, x1, y1) {
    var r = P.rect, alongX = (r[2] - r[0]) >= (r[3] - r[1]), mid = alongX ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
    var half = alongX ? (r[3] - r[1]) / 2 : (r[2] - r[0]) / 2, pitch = (P.ridge - P.eaves) / half;
    function h(X, Y) { return P.ridge - pitch * Math.abs((alongX ? Y : X) - mid); }
    var lo = alongX ? y0 : x0, hi = alongX ? y1 : x1, cuts = [lo];
    if (mid > lo + 0.01 && mid < hi - 0.01) cuts.push(mid);
    cuts.push(hi);
    var cm = mats.ceil && mats.ceil.side === THREE.DoubleSide ? mats.ceil : mats.roof;
    for (var i = 0; i < cuts.length - 1; i++) {
      var a = cuts[i], b = cuts[i + 1], pts = alongX ? [[x0, a], [x1, a], [x1, b], [x0, b]] : [[a, y0], [b, y0], [b, y1], [a, y1]];
      var sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]);
      for (var k = 1; k < 4; k++) sh.lineTo(pts[k][0], pts[k][1]);
      var geo = new THREE.ShapeGeometry(sh), pos = geo.attributes.position;
      for (var k2 = 0; k2 < pos.count; k2++) { var X = pos.getX(k2), Y = pos.getY(k2), v = toLocal(X, Y, h(X, Y)); pos.setXYZ(k2, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      var m = F.register(new THREE.Mesh(geo, cm), LAYER.ceiling); m.name = Q.id + '-ceiling-gable-' + i; m.userData.owner = Q.id; group.add(m);
    }
    var om = paintMat(tone('oak-beams'), true), run = alongX ? x1 - x0 : y1 - y0, n = Math.max(1, Math.round(run / 3.2)), DROP = 0.13;
    function beam(A, B, w, d, name) {   /* a timber from A to B (castle x, y, h), w wide, d deep */
      var a = toLocal(A[0], A[1], A[2]), b = toLocal(B[0], B[1], B[2]), L = a.distanceTo(b);
      var bm = slab(w, d, L, om, 'ceiling'); bm.position.copy(a).add(b).multiplyScalar(0.5); bm.lookAt(b);
      bm.name = Q.id + '-' + name; bm.userData.owner = Q.id; group.add(bm);
    }
    for (var j = 1; j < n; j++) {
      var t = (alongX ? x0 : y0) + run * j / n;
      for (var c = 0; c < cuts.length - 1; c++) {
        var wa = cuts[c] === lo ? lo - 0.02 : cuts[c], wb = cuts[c + 1] === hi ? hi + 0.02 : cuts[c + 1];
        var A = alongX ? [t, wa, h(t, wa) - DROP] : [wa, t, h(wa, t) - DROP], B = alongX ? [t, wb, h(t, wb) - DROP] : [wb, t, h(wb, t) - DROP];
        beam(A, B, 0.2, 0.3, 'principal-' + j + '-' + c);
      }
    }
    if (cuts.length === 3) {
      var rz = P.ridge - 0.13;
      beam(alongX ? [x0 - 0.02, mid, rz] : [mid, y0 - 0.02, rz], alongX ? [x1 + 0.02, mid, rz] : [mid, y1 + 0.02, rz], 0.25, 0.3, 'ridge-beam');
    }
  }
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
    var n0 = group.children.length;                                     /* v30: what this place builds is its own */
    var xs = Q.poly.map(function (p) { return p[0]; }), ys = Q.poly.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var H = (Q.ceiling != null ? Q.ceiling : Q.floor + 12) - Q.floor;
    if (Q.sky) H = Q.sky.breast;                                         /* v10: the leads' walls are their breast */
    var HD = (Q.rec && !Q.rec.group && !Q.area && Q.rec.heads || []).map(function (k) { return { a: k.rect[0], b: k.rect[2], h: k.z - Q.floor }; });
    var GBL = gableOf(Q);   /* v86 */
    function headAt(x) { var z = H; HD.forEach(function (k) { if (x > k.a - 0.01 && x < k.b + 0.01) z = Math.max(z, k.h); }); return z; }
    var c = toLocal((x0 + x1) / 2, (y0 + y1) / 2, Q.floor);
    var row = rowOf(Q), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;      /* v28: a painted place's own tones, kept to this place */
    damp = Q.floor < -0.5;
    var keep = { floor: mats.floor, floorD: mats.floorD, ceil: mats.ceil, ceilD: mats.ceilD, door: mats.door };
    if (row) { mats.door = paintMat(tone('oak')); mats.floor = floorMat(row, mx, my); mats.floorD = floorMat(row, mx, my, true); mats.ceil = mats.ceilD = ceilMat(row, mx, my); }
    if (Q.area) { var fa = areaMesh(Q, Q.floor, mats.floorD, 'floor'); fa.name = Q.id + '-floor'; group.add(fa); }
    else {
      var floor = quad(x1 - x0, y1 - y0, mats.floor, 'floor');
      floor.rotation.x = -Math.PI / 2; floor.position.copy(c); floor.name = Q.id + '-floor'; group.add(floor);
    }
    if (Q.step) {   /* v92 (model v219, ledger line 42): the step round the parapet's foot, its top a floor's stone h up, its riser inward */
      var stm = areaMesh({ area: { outer: Q.step.ring, holes: [] } }, Q.floor + Q.step.h, mats.floorD, 'floor'); stm.name = Q.id + '-step'; group.add(stm);
      var spos = [], si = Q.step.inner;
      for (var sk = 0; sk < si.length - 1; sk++) {
        var s0 = toLocal(si[sk][0], si[sk][1], Q.floor), s1 = toLocal(si[sk + 1][0], si[sk + 1][1], Q.floor), t0 = toLocal(si[sk][0], si[sk][1], Q.floor + Q.step.h), t1 = toLocal(si[sk + 1][0], si[sk + 1][1], Q.floor + Q.step.h);
        [s0, s1, t1, s0, t1, t0].forEach(function (v) { spos.push(v.x, v.y, v.z); });
      }
      var sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.Float32BufferAttribute(spos, 3)); sgeo.computeVertexNormals();
      var srm = F.register(new THREE.Mesh(sgeo, mats.floorD), LAYER.floor); srm.name = Q.id + '-step-riser'; group.add(srm);
    }
    /* v31 (req 643's second half, Design's ceilings.js; the build sequence's wave 1): a painted room's vault, barrel,
       groin, beams, ribs or star as its row names it (the model's vault block wins), its pieces the room's own; where
       it replaces the flat ceiling (flat false) the quad is not drawn. A room with heads, an area or a plan not four
       square keeps its flat ceiling till ceilings.js draws it */
    var CV = null;
    /* v33 (req 714, Design's 2c3ebaab): the star drawn too, its crossings each one owner (a springer at each springing) */
    if (row && !Q.roof && !GBL && !Q.area && !HD.length && Q.ceiling != null && window.CastleCeilings && (Q.poly.length === 4 || (Q.rec && Q.rec.vault))) {
      var vst = stoneAt(row, mx, my), VB = Q.rec && Q.rec.vault, QC = Q, stoneM = paintMat(tone(vst + '/ashlar', vst), true);
      /* v32 (model v71, ledger line 116): a groin with no free pier springs from corbels on its walls; the bays are laid
         out as if the corbels were piers, then each pier gives way to a corbel bearing 2 cm into its wall */
      if (VB && VB.corbels && !(VB.piers || []).length)
        QC = Object.assign({}, Q, { rec: Object.assign({}, Q.rec, { vault: Object.assign({}, VB, { piers: VB.corbels }) }) });
      /* v79 (the Architect's 159th, for Godric's card on the classrooms' beams; o.bays 'piers', the page's ?bays=piers):
         a beamed room whose long walls carry windows at one even pitch takes its beams on the piers between them, at
         that pitch on out toward the end walls while 0.6 clear of them, so each window stands in the middle of its bay */
      if (o.bays === 'piers' && row.ceiling === 'beams' && Q.poly.length === 4 && !(VB && VB.kind && VB.kind !== 'beams')) {
        var bAx = (x1 - x0) >= (y1 - y0), wins = [];
        (M.openings || []).forEach(function (op) {
          if (!op.at || !/window/.test(op.kind || '') || !((op.between || []).indexOf(Q.id) >= 0 || op.room === Q.id)) return;
          var onLong = bAx ? Math.min(Math.abs(op.at[1] - y0), Math.abs(op.at[1] - y1)) < 1.2 : Math.min(Math.abs(op.at[0] - x0), Math.abs(op.at[0] - x1)) < 1.2;
          if (!onLong) return;
          var lp = toLocal(op.at[0], op.at[1], Q.floor), v = bAx ? lp.x : lp.z;
          if (!wins.some(function (w) { return Math.abs(w - v) < 0.05; })) wins.push(v);
        });
        wins.sort(function (a, b) { return a - b; });
        var pit = wins.length > 1 ? wins[1] - wins[0] : 0, even = pit > 1.5 && wins.every(function (w, k) { return !k || Math.abs(w - wins[k - 1] - pit) < 0.05; });
        if (even) {
          var c0 = toLocal(x0, y1, Q.floor), c1 = toLocal(x1, y0, Q.floor), lo = Math.min(bAx ? c0.x : c0.z, bAx ? c1.x : c1.z), hi = Math.max(bAx ? c0.x : c0.z, bAx ? c1.x : c1.z);
          var at = [], p0 = wins[0] + pit / 2;
          while (p0 - pit >= lo + 0.6) p0 -= pit;
          for (var pb = p0; pb <= hi - 0.6; pb += pit) at.push(pb);
          if (at.length) QC = Object.assign({}, QC, { beamsAt: at });
        }
      }
      CV = window.CastleCeilings.forPlace(THREE, QC, { toLocal: toLocal, kind: row.ceiling,
        mats: { vault: mats.ceil, stone: stoneM, beam: paintMat(tone('oak-beams'), true) } });
      if (CV && QC !== Q && VB && VB.corbels) {
        CV.group.children.filter(function (o) { return o.name.indexOf(Q.id + '-pier-') === 0; }).forEach(function (o) { CV.group.remove(o); });
        VB.corbels.forEach(function (p, k) {
          var onX = Math.abs(p[0] - x0) < 0.05 || Math.abs(p[0] - x1) < 0.05, n = onX ? Math.sign(mx - p[0]) : Math.sign(my - p[1]);
          var cxs = onX ? p[0] + n * 0.165 : Math.max(x0 + 0.18, Math.min(x1 - 0.18, p[0])), cys = onX ? Math.max(y0 + 0.18, Math.min(y1 - 0.18, p[1])) : p[1] + n * 0.165;
          /* v37 (Godric's 1 on design-corbels-bow-1020): as Design's beam corbels in ceilings.js, the face filling it and bowed;
             0.28 high, not their 0.42, since the Potions shelves' tops stand 0.30 under the springing */
          var CH = 0.28, a = toLocal(cxs, cys, Q.floor + VB.springs - CH / 2), b = toLocal(cxs + (onX ? 1 : 0), cys + (onX ? 0 : 1), Q.floor);
          var cb = slab(0.37, CH, 0.4, stoneM, 'wall');
          cb.position.copy(a); cb.rotation.y = Math.atan2(b.z - toLocal(cxs, cys, Q.floor).z, b.x - toLocal(cxs, cys, Q.floor).x) * -1;
          cb.name = Q.id + '-corbel-' + k; CV.group.add(cb);
          /* v34 (req 716, Design's 756): its carved face, the atlas cell CastleCeilings.faces.cell(id, k), on a plane
             1 cm proud of its face to the room, the face's 0.25 m high; out.corbels(state) swaps the atlas */
          var FC = window.CastleCeilings.faces;
          if (FC && FC.cell && row.faces !== false) {
            /* v37: the head bows to the floor, tipped TILT (Design's FACE_TILT), its chin 1 cm proud; a stone wedge behind it
               back to the corbel's face, bearing 4 mm into it (the seams rule) */
            var TILT = FC.tilt || 0.35, fh = CH - 0.02, fw = fh * 0.351 / 0.393, st = Math.sin(TILT), ct = Math.cos(TILT);
            var fg = new THREE.PlaneGeometry(fw, fh), fuv = fg.attributes.uv, cell = FC.cell(Q.id, k);
            for (var u = 0; u < fuv.count; u++) fuv.setX(u, (cell + fuv.getX(u)) / 6);
            var fm = new THREE.Mesh(fg, vaultFaceMat('awake')); fm.name = Q.id + '-corbel-face-' + k;
            fm.position.set(n * (0.185 + 0.01 + fh / 2 * st), 0, 0); fm.rotation.order = 'YXZ'; fm.rotation.y = n * Math.PI / 2; fm.rotation.x = TILT; cb.add(fm);
            /* v87 (req 1114, Design's ceilings.js v7): the wedge's front parallel to the face and 10 mm behind it, never the
               2 to 6 mm it leaned through (the 8 mm rule); its back where it was, 4 mm into the corbel */
            var ws = new THREE.Shape(), d0 = 0.01 / ct - 0.004, d1 = (0.01 + fh * st) / ct - 0.004;
            ws.moveTo(0, -fh / 2); ws.lineTo(0, fh / 2); ws.lineTo(d1, fh / 2); ws.lineTo(d0, -fh / 2); ws.lineTo(0, -fh / 2);
            var wg = new THREE.ExtrudeGeometry(ws, { depth: fw * 0.96, bevelEnabled: false });
            wg.translate(0, 0, -fw * 0.48); wg.rotateY(Math.PI / 2); wg.translate(0, 0, -0.01);
            var wm = new THREE.Mesh(wg, stoneM); wm.name = Q.id + '-corbel-wedge-' + k; wm.position.copy(fm.position); wm.rotation.copy(fm.rotation); cb.add(wm);
            (vaultFaces[Q.id] = vaultFaces[Q.id] || []).push(fm);
          }
        });
      }
      if (CV && row.faces === false) {
        /* v73 (model v171, ledger 236; Godric's note of 23 October 2026, 1.46 pm): a room whose paint row says faces false
           keeps its corbels plain: each beam corbel's carved face goes, and the stone wedge ceilings.js stands behind it
           (laid at the face's own position), so the corbel's upright face is the stone's again */
        var FX = CV.group.children.filter(function (o) { return o.name.indexOf(Q.id + '-corbel-face-') === 0; });
        CV.group.children.filter(function (o) {
          return !o.name && FX.some(function (f) { return f.position.distanceTo(o.position) < 1e-6; });
        }).concat(FX).forEach(function (o) { CV.group.remove(o); });
      }
      if (CV) {
        /* v40 (wave 5, floor B's places): ceilings.js lays a groin's piers over the plan's bounding box; in a plan not four
           square (the gun casemate's ring) a pier stands only where its abacus is wholly inside the room, so none stands
           in the drum's wall or the powder room beyond it */
        if (Q.poly.length !== 4) {
          var po = toLocal(0, 0, Q.floor);
          CV.group.children.filter(function (o) { return o.name.indexOf(Q.id + '-pier-') === 0; }).forEach(function (o) {
            var b = new THREE.Box3().setFromObject(o), px = (b.min.x + b.max.x) / 2 - po.x, py = po.z - (b.min.z + b.max.z) / 2, R = 0.6;
            var ok = [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R], [R, R], [R, -R], [-R, R], [-R, -R]].every(function (d) { return inPoly(Q.poly, px + d[0], py + d[1]); });
            if (!ok) CV.group.remove(o);
          });
        }
        if (CV.flat) CV.group.position.y += 0.02;   /* beams under a flat ceiling bear 2 cm into it, never flush (the seams rule) */
        CV.group.traverse(function (o) { o.userData.owner = Q.id; }); group.add(CV.group);
      }
    }
    if (Q.openTop) {   /* v84: open to the sky (H82's cleft): no ceiling, a pane of sky 1 cm over its rim as a window's,
         out past the wall's outer face so a look up and out over a cleft meets it */
      if (!mats.pane) mats.pane = new THREE.MeshBasicMaterial({ color: new THREE.Color(tone('sky-day')).convertSRGBToLinear(), side: THREE.DoubleSide });
      var disc = Q.round ? { area: { outer: arcPts(Q.round.c, Q.round.r / Math.cos(Math.PI / 16) + (Q.wall || 0.5) + 0.1, 0, 360, 48).slice(0, 48), holes: [] } } : Q;
      var sk = areaMesh(disc, Q.ceiling + 0.01, mats.pane, 'ceiling'); sk.name = Q.id + '-pane-sky'; sk.raycast = function () {}; sk.userData.owner = Q.id; group.add(sk); out.panes.push(sk);
    }
    else if (GBL) buildGable(Q, GBL, x0, y0, x1, y1);
    else if (Q.roof) buildRoof(Q);
    else if (CV && !CV.flat) { /* the vault is the ceiling */ }
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
          /* v39: the riser stands under the higher strip, 2 cm up into it, its foot on the lower strip's edge, no face flush */
          var hi = Math.max(prev, hz), lo = Math.min(prev, hz), sd = hz > prev ? 0.01 : -0.01;
          var rs = slab(0.02, hi - lo + 0.02, y1 - y0, mats.ceil, 'ceiling'), rp = toLocal(xa + sd, (y0 + y1) / 2, Q.floor);
          rs.position.set(rp.x, rp.y + (lo + hi + 0.02) / 2, rp.z); rs.name = Q.id + '-head-riser-' + ci; group.add(rs);
        }
        prev = hz;
      }
    }
    /* v55 (Godric's Try 1 on design-ceilings-1021, 11.57 am, 21 October 2026): the late rooms' oak boards on joists, the
       floor above's; light joists across the short span, no corbels, so a corridor reads boarded, not stacked with beams;
       a round room (the oriel) close moulded joists, a bead under each, cut to its circle. Each bears 2 cm up into the
       boards and 2 cm into its walls (the seams rule); their own fill, an eighth of their colour, so a face turned from the
       torches reads dark oak, never black (Fawkes's look at the corridor on 5, 12.17 pm) */
    if (row && row.ceiling === 'boards' && Q.ceiling != null && !Q.roof && !HD.length && (Q.round || Q.poly.length === 4)) {
      var jh = tone('oak-beams'), jm = paintMats[jh + 'j'] || (paintMats[jh + 'j'] = F.solid(jh, { side: THREE.DoubleSide, emissive: new THREE.Color(jh).multiplyScalar(0.12) })), JR = !!Q.round, JW = JR ? 0.12 : 0.16, JD = JR ? 0.16 : 0.2, JS = JR ? 0.6 : 1.8;
      var jx = JR ? Q.round.c[0] : mx, jy = JR ? Q.round.c[1] : my, along = JR || (y1 - y0) <= (x1 - x0);
      var jlen = JR ? 2 * Q.round.r : along ? y1 - y0 : x1 - x0, jrun = JR ? 2 * Q.round.r : along ? x1 - x0 : y1 - y0;
      var jn = Math.max(1, Math.round(jrun / JS));
      for (var jk = 0; jk < jn; jk++) {
        var jo = -jrun / 2 + (jk + 0.5) * jrun / jn, jl = JR ? 2 * Math.sqrt(Math.max(Q.round.r * Q.round.r - jo * jo, 0)) : jlen;
        if (jl < 0.3) continue;
        jl += 0.04;
        var jpx = along ? jx + jo : jx, jpy = along ? jy : jy + jo, jp = toLocal(jpx, jpy, Q.ceiling + 0.02 - JD / 2);
        var jb = along ? slab(JW, JD, jl, jm, 'ceiling') : slab(jl, JD, JW, jm, 'ceiling');
        jb.position.copy(jp); jb.name = Q.id + '-joist-' + jk; jb.userData.owner = Q.id; group.add(jb);
        if (JR) {
          var bd_ = along ? slab(0.06, 0.04, jl - 0.08, jm, 'ceiling') : slab(jl - 0.08, 0.04, 0.06, jm, 'ceiling');
          bd_.position.copy(toLocal(jpx, jpy, Q.ceiling + 0.02 - JD - 0.01)); bd_.name = Q.id + '-joist-bead-' + jk; bd_.userData.owner = Q.id; group.add(bd_);
        }
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
    var E = edgesOf(Q.loops || [Q.poly], Q.loopH, Q.loopT), trimB = {};   /* v91: the trim's geometries, by material */
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
      /* v68 (the shell grotto's cleft, found by the ninety-seventh, req 908's note): on a round room an opening set on the
         drum's outer face far out (the cleft 3.0 out of the grotto's wall) lands square on no side from there, so,
         found on none, it is carried in along its bearing onto the circle and cut where it meets the wall; a cleft takes a
         pane as a window does, its slit of lake light */
      if (!e && Q.round && pts.length === 1) {
        var rdx = pts[0][0] - Q.round.c[0], rdy = pts[0][1] - Q.round.c[1], rD = Math.hypot(rdx, rdy);
        if (rD > Q.round.r && (!op.depth || rD - Q.round.r <= op.depth + 0.2)) e = onEdgeE(E, [Q.round.c[0] + rdx / rD * Q.round.r, Q.round.c[1] + rdy / rD * Q.round.r]);
      }
      if (!e) return;
      var s0, s1;
      /* v75 (ledger 258, the lake rooms' seats): a window in a recess deeper than its wall (`recess`: its own cut, w, h
         and sill, from the floor; `back` the stone the glass stands in at its far end) is cut at the recess's size */
      var RC = op.recess && !back ? op.recess : null;
      /* v7: the far end measured along the same edge, so an end on a corner (the first floor's mouth at x 92) is not
         found on the next wall, its sill and head then running the length of this one */
      if (pts.length > 1) { var s2 = alongEdge(E, e.i, pts[1]); s0 = Math.min(e.s, s2); s1 = Math.max(e.s, s2); }
      else { var cw = RC ? RC.w : (op.splay > (op.w || 1) ? op.splay : op.w) || 1; s0 = e.s - cw / 2; s1 = e.s + cw / 2; }   /* v89: a splayed loop cut at its inside width */
      /* v10: held to its side; on a round wall an opening narrower than the side is moved along to fit it whole */
      if (Q.area && s1 - s0 <= e.L) { if (s0 < 0) { s1 -= s0; s0 = 0; } if (s1 > e.L) { s0 -= s1 - e.L; s1 = e.L; } }
      /* v15: on a curved face drawn in short sides (the casemate's round the drum), an opening wider than its side is cut
         on into the next side too, where that side turns less than 30 degrees; no second leaf (powder-door, Events 1.44 am) */
      var spill = [];
      /* v84: a shaft's round wall too, for a cleft or window (its sides 1.0; H82's cleft 1.8 across the corner due south was cut on one side only; its doors as before) */
      if ((!Q.area || (Q.shaft && /cleft|window|slit|loop/.test(op.kind || ''))) && !hid) {
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
      else if (Q.shaft) { var oQ = findPlace(M, other(op, Q.id)); if (oQ) sill += oQ.floor - Q.floor; }   /* v25: with no z, at its other room's floor */
      if (RC) sill = RC.sill || 0;
      var oh = RC ? RC.h : op.h || 2.2;
      var h = Q.sky ? oh + sill : Math.min(E[e.i].H != null ? E[e.i].H : H, oh + sill);
      /* v23: an arch's `soffit` gives its head at each room's face (absolute), under a room's raised head */
      var sof = op.soffit && !hid ? op.soffit : null, near = sof && sof[Q.id], far = sof && sof[other(op, Q.id)];
      if (near != null) h = near - Q.floor;
      gaps[e.i].push({ s0: s0, s1: s1, sill: sill, h: h, op: op, far: op.depth && e.d > 0.5 ? e.d : 0, back: back, hidden: hid,
        soffit: near != null ? [h, far != null ? far - Q.floor : h] : null, recess: RC });
      spill.forEach(function (sp) { gaps[sp.k].push({ s0: sp.s0, s1: sp.s1, sill: sill, h: h, op: op, back: back, hidden: false, spill: true }); });
      /* v84: a shaft's opening over a corner (H82's cleft): a round wall's sides meet at their inner faces, leaving a V
         outside each corner that the wall's height hides; a sill across the corner shows its top, so a cap over it */
      if (Q.shaft && sill > 0) spill.forEach(function (sp) {
        var c = sp.k === (e.i + 1) % E.length ? E[e.i].b : E[e.i].a, t = Q.wall || 0.5, z = Q.floor + sill;
        var nrm = function (k) { var ed = E[k], l = Math.hypot(ed.b[0] - ed.a[0], ed.b[1] - ed.a[1]); return [(ed.b[1] - ed.a[1]) / l, -(ed.b[0] - ed.a[0]) / l]; };
        var n0 = nrm(e.i), n1 = nrm(sp.k), cg = new THREE.BufferGeometry().setFromPoints([toLocal(c[0], c[1], z),
          toLocal(c[0] + n0[0] * t, c[1] + n0[1] * t, z), toLocal(c[0] + n1[0] * t, c[1] + n1[1] * t, z)]);
        cg.computeVertexNormals();
        var cm = F.register(new THREE.Mesh(cg, mats.wall), LAYER.wall); cm.name = Q.id + '-cap-' + op.id; cm.userData.owner = Q.id; group.add(cm);
      });
    });
    /* a niche in the wall (a feature with a depth: the hourglasses', Godric's 13.1): cut, its back the wall's outer
       part, its head round */
    (M.features || []).forEach(function (ft) {
      if (!ft.depth || !ft.at || !ft.room || (ft.room !== Q.id && slug(ft.room) !== Q.id)) return;
      var e = onEdgeE(E, toSite(M, ft.group || null, ft.at));
      if (!e) return;
      gaps[e.i].push({ s0: e.s - ft.w / 2, s1: e.s + ft.w / 2, sill: ft.sill || 0, h: Math.min(H, (ft.h || 2.2) + (ft.sill || 0)), op: ft, niche: true });
    });
    /* v78 (the Architect's 159th; Godric's 11.15 pm, 23 October 2026, Filch's office: "the corbel is in front of the
       door"): a beam's corbels hang from 0.78 under the ceiling, so in a low room one landing over an opening stood
       across its head. Each beam whose corbel meets an opening (its reveal 0.1 wider each side, up to 5 cm over its
       head) slides along the room, at most 0.45 of the beams' spacing, till both its corbels clear; where none clears,
       that corbel, its face and wedge go, the beam bearing straight into the wall over the head. out.corbelsCleared
       lists them (and group.userData.corbelsCleared; corbelOps the openings it read, for checks) */
    if (CV && CV.beams && CV.group) {
      var base = toLocal(mx, my, Q.floor).y, OPS = [];
      gaps.forEach(function (gs, i) { gs.forEach(function (g) {
        if (g.spill) return;
        var a = E[i].a, b = E[i].b, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
        var p0 = toLocal(a[0] + ux * (g.s0 - 0.1), a[1] + uy * (g.s0 - 0.1), Q.floor), p1 = toLocal(a[0] + ux * (g.s1 + 0.1), a[1] + uy * (g.s1 + 0.1), Q.floor);
        OPS.push({ p0: p0, p1: p1, head: g.h + 0.05, sill: g.sill, id: g.op && g.op.id });
      }); });
      var kids = CV.group.children, beamsN = kids.filter(function (o) { return o.userData.beam != null && !o.userData.corbel && o.userData.end == null; });
      var step = beamsN.length > 1 ? Math.abs((beamsN[1].position[beamsN[0].userData.axis] - beamsN[0].position[beamsN[0].userData.axis])) : 1.2;
      var hits = function (c, ax, d) {   /* the openings a corbel shifted d along ax meets */
        var bx = new THREE.Box3().setFromObject(c); bx.min[ax] += d; bx.max[ax] += d;
        return OPS.filter(function (o) {
          if (bx.min.y - base > o.head || bx.max.y - base < o.sill) return false;
          for (var t = 0; t <= 1.0001; t += 0.05) {
            var x = o.p0.x + (o.p1.x - o.p0.x) * t, z = o.p0.z + (o.p1.z - o.p0.z) * t;
            if (x > bx.min.x - 0.02 && x < bx.max.x + 0.02 && z > bx.min.z - 0.02 && z < bx.max.z + 0.02) return true;
          }
          return false;
        });
      };
      var cleared = { moved: 0, dropped: 0, ids: [] };
      beamsN.forEach(function (bm) {
        var i = bm.userData.beam, ax = bm.userData.axis, parts = kids.filter(function (o) { return o.userData.beam === i; });
        var cs = parts.filter(function (o) { return o.userData.corbel; });
        var bad = cs.filter(function (c) { return hits(c, ax, 0).length; });
        if (!bad.length) return;
        var ids = bad.map(function (c) { return hits(c, ax, 0).map(function (o) { return o.id; }).join('+'); }).join(',');
        var best = null;
        for (var k = 1; k * 0.05 <= step * 0.45 + 1e-6 && best == null; k++) {
          [k * 0.05, -k * 0.05].forEach(function (d) { if (best == null && cs.every(function (c) { return !hits(c, ax, d).length; })) best = d; });
        }
        if (best != null) { parts.forEach(function (o) { o.position[ax] += best; }); cleared.moved++; cleared.ids.push(Q.id + ' beam ' + i + ' ' + (best > 0 ? '+' : '') + best.toFixed(2) + ' (' + ids + ')'); }
        else bad.forEach(function (c) {
          parts.filter(function (o) { return o.userData.end === c.userData.end; }).forEach(function (o) { CV.group.remove(o); });
          cleared.dropped++; cleared.ids.push(Q.id + ' corbel ' + c.name + ' dropped (' + ids + ')');
        });
      });
      group.userData.corbelOps = OPS.map(function (o) { return [o.id, o.p0.x.toFixed(2), o.p0.z.toFixed(2), o.p1.x.toFixed(2), o.p1.z.toFixed(2), o.sill, o.head.toFixed(2)].join(" "); });
      out.corbelsCleared = group.userData.corbelsCleared = (out.corbelsCleared || []).concat(cleared.ids);
    }
    /* v47 (Godric's 1 on design-panelling-staff-1021, 20 October 2026, 10.07 pm, "carved, to the cornice"): a panelled
       room's oak panelling, Design's kit (page/design/panelling.js) at grade 2, tudor or, in a late-pale room, fielded;
       it stops under the vault's springing, else at the ceiling. It stops at every opening this wall cut (doors, windows,
       niches, the hidden ways too, so a jib's tap is not covered) and round each fireplace (w + 0.4, from the floor to
       0.15 over its head: the surround stands on the wall face); every piece the room's own. v87 (req 1126, Design's
       round rooms): a round room too (the study, dumbledores-office), its plan the SIDES flat sides its wall is built
       of (0.58 m in the study, 1.18 in the office), so each panel stands flat on a flat side and the mitres take the
       15 degrees between them; a shaft or ring still bare */
    if (row && row.dress === 'panelled' && (!Q.area || (Q.round && !Q.shaft)) && !Q.loops && Q.ceiling != null && window.CastlePanelling) {
      var pops = [];
      gaps.forEach(function (gs, i) { gs.forEach(function (g) {
        if (g.spill) return;
        /* 1 cm into the reveal each side and under the head, so its ends bear on the jambs, never flush with them */
        pops.push({ wall: i, at: (g.s0 + g.s1) / 2, w: Math.max(0.1, g.s1 - g.s0 - 0.02), sill: g.sill > 0.05 ? g.sill + 0.01 : g.sill,
          h: g.h - g.sill - (g.sill > 0.05 ? 0.02 : 0.01), door: g.sill < 0.05 && !g.niche });
      }); });
      (M.features || []).forEach(function (ft) {
        if (!ft.at || !ft.w || !/fireplace/.test(ft.kind || '') || !ft.room || (ft.room !== Q.id && slug(ft.room) !== Q.id)) return;
        var e = onEdgeE(E, toSite(M, ft.group || null, ft.at));
        if (!e) return;
        var fh = ft.h || (ft.opening ? ft.opening[1] : 1.2);
        /* v65 (req 908): a fireplace with its own surround's width stops the panelling 1 cm onto that surround */
        pops.push({ wall: e.i, at: e.s, w: ft.surround ? ft.surround - 0.02 : ft.w + 0.4, sill: 0, h: Math.max(fh, ft.mantel || 0) + 0.15, door: false });
      });
      /* v48 (req 843, Design's panelling.js v2): forPlace stands each wall upright on either winding, so the plan goes in
         as it is; the grade is the room's own (PANEL_GRADE, grade 2 till Godric grades them) */
      var QP = Q, pn = Q.poly.length;
      var oak = tone('oak');
      var PG = window.CastlePanelling.forPlace(THREE, QP, { toLocal: toLocal, style: row.stone === 'late-pale' ? 'fielded' : 'tudor',
        grade: PANEL_GRADE[Q.id] || 2, to: CV && !CV.flat ? CV.springs : undefined, openings: pops,
        mats: { oak: paintMat(oak), deep: paintMat(shade(oak, 0.78)), carve: oak } });
      if (PG) {
        PG.traverse(function (o) { o.userData.owner = Q.id; }); group.add(PG);
        /* for the rooms' things (shell.html): each wall's face in the group's frame and its normal into the room, and how
           far the panelling stands off it, so a thing hung on the wall is brought out onto the panelling, not buried */
        var SP = window.CastlePanelling.SPEC[row.stone === 'late-pale' ? 'fielded' : 'tudor'], m0 = toLocal(mx, my, Q.floor);
        PG.userData.proud = SP.proud;
        PG.userData.walls = QP.poly.map(function (a, i) {
          var b = QP.poly[(i + 1) % pn], A = toLocal(a[0], a[1], Q.floor), B = toLocal(b[0], b[1], Q.floor);
          var ux = B.x - A.x, uz = B.z - A.z, L = Math.hypot(ux, uz) || 1, nx = -uz / L, nz = ux / L;
          if ((m0.x - A.x) * nx + (m0.z - A.z) * nz < 0) { nx = -nx; nz = -nz; }
          var gp = pops.filter(function (op) { return op.wall === i; }).map(function (op) { return [op.at - op.w / 2, op.at + op.w / 2, op.sill, op.sill + op.h]; });
          return { ax: A.x, az: A.z, y0: A.y, ux: ux / L, uz: uz / L, len: L, nx: nx, nz: nz, gaps: gp };
        });
      }
    }
    /* a wall already built from the other side (the place one step on shares it) is not built twice; v24: only where
       the two stand at one height (the Charms corridor over the first floor's, the same plan two storeys up, kept its walls) */
    function sharedE(ed) {
      var midE = [(ed.a[0] + ed.b[0]) / 2, (ed.a[1] + ed.b[1]) / 2];
      return Q !== P && Math.hypot(ed.b[0] - ed.a[0], ed.b[1] - ed.a[1]) >= 1e-6 && out.places.some(function (R) { var e = R !== Q && onEdge(R.poly, midE);
        return e && e.d < 0.05 && R.floor < (Q.ceiling == null ? Infinity : Q.ceiling) - 0.05 && (R.ceiling == null ? Infinity : R.ceiling) > Q.floor + 0.05; });
    }
    E.forEach(function (ed, i) {
      var a = ed.a, b = ed.b, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), HE = ed.H != null ? ed.H : H;
      /* v11 (model v37, ledger 82 f): a side of the leads with its own parapet (the old keep's line on the north, plain) */
      var own = Q.sky && Q.sky.sides && Q.sky.sides[['south', 'east', 'north', 'west'][i]], MER = Q.sky ? Q.sky.merlons : 0;
      if (own && typeof own === 'object') { if (own.breast != null) HE = own.breast; if (own.merlons != null) MER = own.merlons; }
      if (L < 1e-6) return;
      if (sharedE(ed)) return;
      var ux = dx / L, uy = dy / L, nx = uy, ny = -ux;                 /* outward, the polygon counter-clockwise */
      var t = ed.T || (Q.walls ? (Q.walls[['south', 'east', 'north', 'west'][i]] || Q.wall) : Q.wall);
      var ext = Q.area ? 0 : t;                                          /* a round wall's sides meet at their faces */
      /* v35: no wrap round a corner whose next side is the other place's wall (the North Tower passage's sides ran
         0.8 into the seventh floor's east run past their mouth's end, and a tap there met them) */
      var ext0 = sharedE(E[(i + E.length - 1) % E.length]) ? 0 : ext, ext1 = sharedE(E[(i + 1) % E.length]) ? 0 : ext;
      /* v42: each corner block is drawn once, by the wall before it (its far end); this wall takes its near corner too
         only where the wall before it is lower or not drawn (the West Tower's ways showed two 5.44 m2 corner faces
         fighting, seen from outside, from the spiral built with them) */
      var pe = E[(i + E.length - 1) % E.length], pL = Math.hypot(pe.b[0] - pe.a[0], pe.b[1] - pe.a[1]);
      var pi = (i + E.length - 1) % E.length, pEnd = !(gaps[pi] || []).some(function (g) { return g.s1 >= pL - 0.01; });
      if (ext0 && pL >= 1e-6 && pEnd && (pe.H != null ? pe.H : H) >= HE && !(Q.sky && Q.sky.sides)) ext0 = 0;
      /* v44 (the sixtieth, the near-faces sweep): where an opening runs to this wall's far end, the next wall keeps its near
         corner (above), so this wall's head and sill there stop at the corner, not drawing it twice (the fifth-floor
         corridor's head over the bend's east mouth lay on the wall's end, 2.08 m2, seen from the stair over it) */
      var ne = E[(i + 1) % E.length], nHE = ne.H != null ? ne.H : H;
      if (ext1 && (gaps[i] || []).some(function (g) { return g.s1 >= L - 0.01; }) && nHE >= HE && !(Q.sky && Q.sky.sides)) ext1 = 0;
      /* v49 (model v102, the four rooms round the Gryffindor drum on 5 and 6 turned counter-clockwise): at a corner that
         turns into the room (a drum's face bulging in), the walls meet behind their faces, so neither runs on past it
         (run on, they stood in the room and in each other, 4 m2) */
      var turn = function (e0, e1) { return (e0.b[0] - e0.a[0]) * (e1.b[1] - e1.a[1]) - (e0.b[1] - e0.a[1]) * (e1.b[0] - e1.a[0]); };
      if (ext0 && pL >= 1e-6 && turn(pe, ed) < -1e-9) ext0 = 0;
      if (ext1 && turn(ed, ne) < -1e-9) ext1 = 0;
      /* v60 (model v143, req 895: the casemate's west embrasure stood uncut, Interiors' shots of 7.27 and 7.29 pm): on a
         gentle turn (a curved face drawn in short sides) this wall's corner block runs on along the next side's line and
         stood in an opening near its start; held short of that opening, still past the t sin(turn) that closes the corner */
      var nL = Math.hypot(ne.b[0] - ne.a[0], ne.b[1] - ne.a[1]), s0n = (gaps[(i + 1) % E.length] || []).reduce(function (m, g) { return g.hidden ? m : Math.min(m, g.s0); }, Infinity);
      if (ext1 && nL >= 1e-6 && s0n < Infinity) {
        var cT = (ux * (ne.b[0] - ne.a[0]) + uy * (ne.b[1] - ne.a[1])) / nL, sT = turn(ed, ne) / (L * nL);
        if (cT > 1e-6 && ext1 * cT - t * sT > s0n - 0.02) ext1 = Math.max(0, (s0n - 0.02 + t * sT) / cT);
      }
      var ang = Math.atan2(uy, ux);                                      /* the wall's turn about y, in the local frame */
      function piece(s0, s1, ya, yb, name) {
        if (s1 - s0 < 0.02 || yb - ya < 0.02) return;
        if (row) {   /* v28: cut where the stone changes, along a mass's runs or at a hall's older band */
          var cutS = null, cutY = null;
          if (row.mass) row.mass.runs.forEach(function (q) {
            var d = row.mass.axis === 'y' ? uy : ux, o = row.mass.axis === 'y' ? a[1] : a[0], s = Math.abs(d) > 1e-6 ? (q[0] - o) / d : -1;
            if (cutS == null && s > s0 + 0.02 && s < s1 - 0.02) cutS = s;
          });
          if (row.band && ya < row.band.top - 0.02 && yb > row.band.top + 0.02) cutY = row.band.top;
          if (cutS != null) { piece(s0, cutS, ya, yb, name + '-a'); piece(cutS, s1, ya, yb, name + '-b'); return; }
          if (cutY != null) { piece(s0, s1, ya, cutY, name + '-low'); piece(s0, s1, cutY, yb, name); return; }
        }
        var sm = (s0 + s1) / 2, p = toLocal(a[0] + ux * sm + nx * t / 2, a[1] + uy * sm + ny * t / 2, Q.floor);
        var wm = row ? wallMat(row, a[0] + ux * sm, a[1] + uy * sm, (ya + yb) / 2) : mats.wall;   /* the band's top is over the floor */
        var m = slab(s1 - s0 + (s0 <= 0.01 ? ext0 : 0) + (s1 >= L - 0.01 ? ext1 : 0), yb - ya, t, wm, 'wall');
        var shift = ((s1 >= L - 0.01 ? ext1 : 0) - (s0 <= 0.01 ? ext0 : 0)) / 2;
        m.position.set(p.x + ux * shift, p.y + (ya + yb) / 2, p.z - uy * shift);
        m.rotation.y = ang; m.name = name; group.add(m);
      }
      /* v54: a window's pane of sky 3 cm inside the wall's outer face (below, where the gaps are drawn) */
      function pane(g, suf) {
        if (!mats.pane) mats.pane = new THREE.MeshBasicMaterial({ color: new THREE.Color(tone('sky-day')).convertSRGBToLinear(), side: THREE.DoubleSide });
        /* v67: an end on the side's corner runs on past it (tan 15 degrees of the depth, the most a cut turns), so the panes
           of a window cut over a corner meet behind it, set back as they are on two lines */
        var pd = Math.max(0.02, t - 0.03), run = 0.27 * pd + 0.02, e0 = g.s0 <= 0.01 ? run : 0, e1 = g.s1 >= L - 0.01 ? run : 0;
        var sm = (g.s0 - e0 + g.s1 + e1) / 2, w = g.s1 + e1 - g.s0 + e0, hh = g.h - g.sill;
        var pn_ = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), mats.pane);
        var pp = toLocal(a[0] + ux * sm + nx * pd, a[1] + uy * sm + ny * pd, Q.floor);
        pn_.position.set(pp.x, pp.y + g.sill + hh / 2, pp.z); pn_.rotation.y = ang; pn_.raycast = function () {};
        pn_.name = Q.id + '-pane-' + g.op.id + suf; pn_.userData.owner = Q.id; group.add(pn_);
        out.panes.push(pn_);
      }
      /* v10: an iron bar standing in the wall's line, `off` out from its face (a grille's, a crenel's) */
      function bar(s, ya, yb, off, name) {
        var p = toLocal(a[0] + ux * s + nx * off, a[1] + uy * s + ny * off, Q.floor), m = slab(0.04, yb - ya, 0.04, mats.grille, 'wall');
        m.position.set(p.x, p.y + (ya + yb) / 2, p.z); m.rotation.y = ang; m.name = name; group.add(m);
      }
      /* v91: the dressing round an opening on this face and, where nothing of a room's own stands beyond it (a window, a
         loop, a door to the open), on the far face; a door between two rooms is trimmed by each on its own face; a hidden
         way takes none (a trim would say tap me). One merged mesh a stone, page/castle-trim.js; a loop's is the British
         precedent's (materials.md section 2): flush outside, a frame under a lintel inside */
      function trimGap(g, sm, w) {
        var k = g.op.kind || '', cls = /hidden|window, round/.test(k) ? null : /loop|slit|squint|grating|cleft/.test(k) ? 'loop'   /* a round window is the room's own drawing (the gallery's rose) */
          : /window|lancet|oriel|dormer/.test(k) ? 'window' : isDoor(k) || (isWay(k) && w <= 3.5) ? 'door' : null;
        if (!cls) return;
        var rm = (M.rooms || []).filter(function (r) { return slug(r.id) === Q.id; })[0], age = rm && rm.age || 'P3';
        var beyond = (cls === 'door') && g.op.between && findPlace(M, other(g.op, Q.id));
        var slot = cls === 'loop' && g.op.splay > (g.op.w || 1) ? g.op.w : w;   /* the slot's width at the outer face */
        ['in', 'out'].forEach(function (face) {
          if (face === 'out' && (beyond || g.op.depth > t + 0.05)) return;
          var geo = CastleTrim.geometry(THREE, { cls: cls, age: age, w: face === 'out' ? slot : w, h: g.h - g.sill, sill: g.sill, face: face });
          var off = face === 'out' ? t : 0, p = toLocal(a[0] + ux * sm + nx * off, a[1] + uy * sm + ny * off, Q.floor);
          geo.applyMatrix4(new THREE.Matrix4().makeRotationY(ang).setPosition(p.x, p.y, p.z));
          var mt = trimMat(row, a[0] + ux * sm, a[1] + uy * sm, g.sill);
          (trimB[mt.uuid] = trimB[mt.uuid] || { mat: mt, geos: [] }).geos.push(geo);
        });
      }
      /* v10: a hidden opening seen from its outer side stays wall, with an unseen tap over its face; v58 (model v134,
         H62's head door): a `oneway` opening opens from its inside only, so from its outer side it is wall, no tap */
      gaps[i].filter(function (g) { return g.hidden && !g.op.oneway; }).forEach(function (g) {
        if (out.hidden.some(function (d) { return d.id === g.op.id; })) return;
        var sm = (g.s0 + g.s1) / 2, w = g.s1 - g.s0, hh = g.h - g.sill, mid = toLocal(a[0] + ux * sm, a[1] + uy * sm, Q.floor);
        var inward = new THREE.Vector3(-nx, 0, ny), lift = g.sill > RAISED ? g.sill : 0;
        var hit = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
        hit.position.set(mid.x - nx * 0.02, mid.y + g.sill + hh / 2, mid.z + ny * 0.02); hit.rotation.y = ang;
        hit.name = 'hidden-' + g.op.id; hit.userData.hidden = g.op.id; group.add(hit);
        out.hidden.push({ id: g.op.id, to: hiddenTo(M, g.op, Q.id), mesh: hit, w: w, h: hh, mid: mid, inward: inward, place: Q.id, sill: g.sill,
          lift: lift, level: Q.floor + lift, hidden: true });
      });
      var gs = gaps[i].filter(function (g) { return !g.hidden; }).sort(function (g, h) { return g.s0 - h.s0; }), at = 0;
      /* v24 (model v54): openings that overlap along the wall (the dungeon stair's arch under the first floor's mouth
         over the landing, the Entrance Hall's south wall) are cut together: the wall drawn in columns between their
         ends, each column solid where no opening crosses it */
      var reach = -1, col = gs.some(function (g) { var o = g.s0 < reach - 0.02; reach = Math.max(reach, g.s1); return o; });
      if (col) {
        var bp = [0, L];
        gs.forEach(function (g) { bp.push(Math.max(0, Math.min(L, g.s0)), Math.max(0, Math.min(L, g.s1))); });
        bp.sort(function (p, q) { return p - q; });
        for (var c = 0; c + 1 < bp.length; c++) {
          var c0 = bp[c], c1 = bp[c + 1], cm = (c0 + c1) / 2, y = 0;
          if (c1 - c0 < 0.02) continue;
          gs.filter(function (g) { return g.s0 < cm && g.s1 > cm; }).sort(function (g, h) { return g.sill - h.sill; }).forEach(function (g, k) {
            piece(c0, c1, y, g.sill, Q.id + '-wall-' + i + '-c' + c + '-' + k); y = Math.max(y, g.h);
          });
          piece(c0, c1, y, HE, Q.id + '-wall-' + i + '-c' + c + '-top');
        }
      }
      gs.forEach(function (g, j) {
        if (!col) {
          piece(at, g.s0, 0, HE, Q.id + '-wall-' + i + '-' + j);
          piece(g.s0, g.s1, g.soffit ? g.h + 0.05 : g.h, HE, Q.id + '-head-' + g.op.id);   /* v39: over a soffit it bears 5 cm into it, never flush */
          /* v44: under a door's threshold the sill stops 5 mm short of it, hidden, so a floor or platform bearing into the
             wall at the sill's height (the Great Hall's dais at the hall chamber's door, req 833) shares no plane with it */
          piece(g.s0, g.s1, 0, g.sill > 0.02 && isDoor(g.op.kind) && !g.back ? g.sill - 0.005 : g.sill, Q.id + '-sill-' + g.op.id);
        }
        at = g.s1;
        /* v15: the rest of an opening cut over a corner; v67 (Fawkes's look at architect-window-views-1022b: McGonagall's
           and Dumbledore's windows black either side of the glass): a window's rest takes its own pane on its own side,
           else that part of the cut stood open on the dark */
        if (g.spill) { if (!g.back && /window|loop|lancet|oriel|dormer|cleft/.test(g.op.kind || '')) pane(g, '-' + i); return; }
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
          /* v30 (one owner per face): the head bears 2 cm into the wall over it and either side, its face 2 mm back of the
             wall's, so no face of it lies in a plane of the pieces round it (the hourglass niches' crowns and springings) */
          /* v51 (req 850, the linen room's lamp niche): its face 5 mm back, past the seams test's 4 mm plane, and 2 cm into the niche's back, so neither face lies in a plane of the wall's (4 fights in a niche with a sill) */
          var r = w / 2, sh = new THREE.Shape(), BR = 0.02;
          sh.moveTo(-r, 0); sh.lineTo(-r - BR, 0); sh.lineTo(-r - BR, r + BR); sh.lineTo(r + BR, r + BR); sh.lineTo(r + BR, 0); sh.lineTo(r, 0);
          sh.absarc(0, 0, r, 0, Math.PI, false);
          /* v76 (the hundred-fifty-third, H74's cubby): a niche whose head is "flat" is cut square, no round head */
          if (g.op.head !== 'flat') {
          var head = F.register(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: dp + 0.015, bevelEnabled: false, curveSegments: 16 }), mats.wall), LAYER.wall);
          head.position.set(mid.x + Math.sin(ang) * 0.005, mid.y + g.h - r, mid.z + Math.cos(ang) * 0.005); head.rotation.y = ang; head.name = Q.id + '-niche-head-' + g.op.id; group.add(head);
          }
          var fl = slab(w, 0.02, dp, mats.floor, 'floor'), fp = toLocal(a[0] + ux * sm + nx * dp / 2, a[1] + uy * sm + ny * dp / 2, Q.floor);
          fl.position.set(fp.x, fp.y + g.sill + 0.01, fp.z); fl.rotation.y = ang; fl.name = Q.id + '-niche-floor-' + g.op.id; group.add(fl);
          return;
        }
        /* v75 (ledger 258): a recess deeper than this wall is drawn on beyond its outer face, from the niche's way: two
           sides 5 mm outside the cut's jambs, bearing 2 cm into the wall; a soffit 5 mm over its head; a floor from the
           inner face, its top 2 cm up; at its far end the stone the glass stands in (`back`), its face 5 mm short of the
           sides' ends, sill and head bearing 1 cm into its jambs; the pane 3 cm inside that stone's outer face */
        if (g.recess && (g.op.depth || 0) > t) {
          var RD = g.op.depth, RB = g.recess.back || 0.6, RT = 0.3, rl = RD - t + 0.02, RM = row ? wallMat(row, a[0] + ux * sm, a[1] + uy * sm, g.h / 2) : mats.wall, RY0 = g.sill - 0.1, RY1 = g.h + 0.305;
          var rpos = function (m, s, n, y, nm) { var p = toLocal(a[0] + ux * s + nx * n, a[1] + uy * s + ny * n, Q.floor);
            m.position.set(p.x, p.y + y, p.z); m.rotation.y = ang; m.name = Q.id + '-recess-' + nm + '-' + g.op.id; group.add(m); };
          rpos(slab(RT, RY1 - RY0, rl, RM, 'wall'), g.s0 - 0.005 - RT / 2, t - 0.02 + rl / 2, (RY0 + RY1) / 2, 'side-a');
          rpos(slab(RT, RY1 - RY0, rl, RM, 'wall'), g.s1 + 0.005 + RT / 2, t - 0.02 + rl / 2, (RY0 + RY1) / 2, 'side-b');
          rpos(slab(w + 0.01 + 2 * RT, 0.3, rl, RM, 'wall'), sm, t - 0.02 + rl / 2, g.h + 0.155, 'soffit');
          rpos(slab(w + 0.004, 0.02, RD, mats.floor, 'floor'), sm, RD / 2, g.sill + 0.01, 'floor');
          var gw = g.op.w || 1, gsl = g.op.sill || 0, gh = g.op.h || 1, BW = w + 0.01 + 2 * RT, bn = RD - 0.005 + (RB + 0.005) / 2, bd = RB + 0.005;
          var ja = (BW - gw) / 2;
          rpos(slab(ja, RY1 - RY0, bd, RM, 'wall'), sm - gw / 2 - ja / 2, bn, (RY0 + RY1) / 2, 'jamb-a');
          rpos(slab(ja, RY1 - RY0, bd, RM, 'wall'), sm + gw / 2 + ja / 2, bn, (RY0 + RY1) / 2, 'jamb-b');
          rpos(slab(gw + 0.02, gsl - RY0, bd, RM, 'wall'), sm, bn, (RY0 + gsl) / 2, 'sill');
          rpos(slab(gw + 0.02, RY1 - gsl - gh, bd, RM, 'wall'), sm, bn, (gsl + gh + RY1) / 2, 'head');
          if (!mats.pane) mats.pane = new THREE.MeshBasicMaterial({ color: new THREE.Color(tone('sky-day')).convertSRGBToLinear(), side: THREE.DoubleSide });
          var rp = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), mats.pane), pp = toLocal(a[0] + ux * sm + nx * (RD + RB - 0.03), a[1] + uy * sm + ny * (RD + RB - 0.03), Q.floor);
          rp.position.set(pp.x, pp.y + gsl + gh / 2, pp.z); rp.rotation.y = ang; rp.raycast = function () {};
          rp.name = Q.id + '-pane-' + g.op.id; rp.userData.owner = Q.id; group.add(rp); out.panes.push(rp);
          return;
        }
        if (TRIM && !g.back) trimGap(g, sm, w);   /* v91 */
        var to = other(g.op, Q.id), via = isWay(g.op.kind) ? viaStair(M, to, Q.id) : null;
        if (via) {
          var sv = (M.stairs || []).filter(function (x) { return slug(x.id) === to; })[0];
          if (sv && sv.arc) arcStub(sv, Q, w, g.op.id);
          to = via;
        }
        /* a way above RAISED (the landing bay's mouth at +34.42) is reached on its own floor, its sill */
        var lift = g.sill > RAISED ? g.sill : 0, level = Q.floor + lift;
        /* v70 (the hundred-twelfth: a black strip on the floor and head at the far end of the keys' door's 2 m passage and
           the troll room's way): each room draws its own wall t deep, so through rock deeper than that the middle stood
           open on the void; the passage is lined once, by whichever room builds it first, from 1 cm inside this face to
           1 cm inside the far one, its floor 5 mm under a threshold's top, its head 5 mm over the opening's, its sides 5 mm
           back of the jambs, so every face it shares a plane with lies inside a wall */
        out.lined = out.lined || {};
        if (g.op.depth > t + 0.05 && !g.soffit && !g.back && !out.lined[g.op.id] && !/window|loop|lancet|oriel|dormer|cleft/.test(g.op.kind || '')) {
          out.lined[g.op.id] = Q.id;
          /* v83 (the 166th: sw-turret-stair's wind-dial door, where the turret's round face leaves the passage's mouth open):
             the floor and head run under and over the sides, so their ends shared the sides' end planes in a 5 mm strip;
             they stop 8 mm short of the sides' ends now */
          var D = g.op.depth, dm = D / 2, ln = D - 0.02, lp = function (s, y, wd, hg, mat, kind, nm, dp) {
            var m = slab(wd, hg, dp || ln, mat, kind), q = toLocal(a[0] + ux * s + nx * dm, a[1] + uy * s + ny * dm, Q.floor);
            m.position.set(q.x, q.y + y, q.z); m.rotation.y = ang; m.name = Q.id + '-lining-' + nm + '-' + g.op.id; m.userData.owner = Q.id; group.add(m);
          };
          lp(sm, g.sill + 0.015 - 0.05, w + 0.02, 0.1, mats.floor, 'floor', 'floor', ln - 0.016);
          lp(sm, g.h + 0.005 + 0.15, w + 0.02, 0.3, mats.wall, 'wall', 'head', ln - 0.016);
          lp(g.s0 - 0.155, g.sill + hh / 2, 0.3, hh + 0.2, mats.wall, 'wall', 'a');
          lp(g.s1 + 0.155, g.sill + hh / 2, 0.3, hh + 0.2, mats.wall, 'wall', 'b');
        }
        if (isDoor(g.op.kind) && !g.back && !out.doors.some(function (d) { return d.id === g.op.id; })) {
          var leaf = slab(w - 0.08, hh - 0.04, 0.12, mats.door, 'door');   /* v44: on its threshold (0.02), its foot not the threshold's */
          var lo = g.far ? g.far - 0.1 : t * 0.5;                        /* a passage's leaves hang at its far face */
          leaf.position.set(mid.x + nx * lo, mid.y + g.sill + 0.02 + (hh - 0.04) / 2, mid.z - ny * lo);
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
          if (/fixed open/.test(g.op.kind || '') && !group.getObjectByName(Q.id + '-threshold-' + g.op.id)) {   /* v38: its threshold, as a door's */
            var tl = slab(w, 0.02, t, mats.floor, 'floor'), tp = toLocal(a[0] + ux * sm + nx * t / 2, a[1] + uy * sm + ny * t / 2, Q.floor);
            tl.position.set(tp.x, tp.y + g.sill + 0.01, tp.z); tl.rotation.y = ang; tl.name = Q.id + '-threshold-' + g.op.id; group.add(tl);
          }
          fill.position.set(mid.x, mid.y + g.sill + hh / 2, mid.z); fill.rotation.y = ang; fill.name = 'way-' + g.op.id; fill.userData.way = g.op.id;
          group.add(fill);
          out.ways.push({ id: g.op.id, to: to, mesh: fill, w: w, h: hh, mid: mid, inward: inward, place: Q.id, at: [a[0] + ux * sm, a[1] + uy * sm],
            sill: g.sill, lift: lift, level: level, back: g.back, via: !!via, depth: g.op.depth || 0 });
        } else if (!g.back && /window|loop|lancet|oriel|dormer|cleft/.test(g.op.kind || '')) {
          /* v54 (Design's find, 21 October 2026, 11.23 am: the oriel's lights black at noon): nothing is drawn beyond a
             shell's window, so each takes a pane of sky 3 cm inside its outer face, the day's colour (shell.html turns it
             to the night's), unlit and untappable: daylight in the opening, not a lamp */
          /* v89 (Godric's 1 on architect-h82-slits-1026, 8.33 am, 27 October 2026): a loop with a `splay` is cut at that
             width on the inner face and narrows through the wall to its `w` at the outer face, as real arrow loops do: a
             cheek of the wall's stone each side from the cut's inner corner to the slot's edge, the pane the slot's width
             there and 1 cm behind each cheek */
          var w0 = g.op.w || 1;
          if (g.op.splay > w0 && w > w0 + 0.02) {
            var pd = Math.max(0.02, t - 0.03), wp = w0 + (w - w0) * (1 - pd / t) + 0.02;
            pane({ s0: sm - wp / 2, s1: sm + wp / 2, sill: g.sill, h: g.h, op: g.op }, '');
            [-1, 1].forEach(function (k) {
              var si = (k < 0 ? g.s0 : g.s1) + k * 0.04, so_ = sm + k * w0 / 2;   /* 4 cm into the piece beside it: the columns' ends lie a cm or two off the cut's, and a crack showed */
              var A = [a[0] + ux * si, a[1] + uy * si], B = [a[0] + ux * so_ + nx * t, a[1] + uy * so_ + ny * t];
              var pA = toLocal(A[0], A[1], Q.floor), pB = toLocal(B[0], B[1], Q.floor), y0 = g.sill, y1 = g.h;
              var vs = [pA.x, pA.y + y0, pA.z, pB.x, pB.y + y0, pB.z, pB.x, pB.y + y1, pB.z, pA.x, pA.y + y1, pA.z];
              var cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(vs, 3));
              cg.setIndex([0, 1, 2, 0, 2, 3]); cg.computeVertexNormals();
              var nrmv = new THREE.Vector3().fromBufferAttribute(cg.attributes.normal, 0), toMid = new THREE.Vector3(mid.x - pA.x, 0, mid.z - pA.z);
              if (nrmv.dot(toMid) < 0) { cg.setIndex([0, 2, 1, 0, 3, 2]); cg.computeVertexNormals(); }
              var cmat = row ? wallMat(row, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (y0 + y1) / 2) : mats.wall;
              var cm = F.register(new THREE.Mesh(cg, cmat), LAYER.wall);
              cm.name = Q.id + '-cheek-' + (k < 0 ? 'a' : 'b') + '-' + g.op.id; cm.userData.owner = Q.id; group.add(cm);
            });
          } else pane(g, '');
        }
      });
      if (!col) piece(at, L, 0, HE, Q.id + '-wall-' + i + '-end');
      /* v23: under a raised head the wall goes up to it, over an opening from its own head */
      HD.forEach(function (k, ki) {
        if (k.h <= HE + 0.01) return;
        var sa, sb;
        if (Math.abs(ux) < 1e-6) { if (a[0] < k.a - 0.01 || a[0] > k.b + 0.01) return; sa = 0; sb = L; }
        else { var p1 = (k.a - a[0]) / ux, p2 = (k.b - a[0]) / ux; sa = Math.max(0, Math.min(p1, p2)); sb = Math.min(L, Math.max(p1, p2)); }
        if (sb - sa < 0.01) return;
        var cuts2 = [sa, sb];
        gs.forEach(function (g) { if (g.s1 > sa && g.s0 < sb) cuts2.push(Math.max(sa, g.s0), Math.min(sb, g.s1)); });
        /* v39: a soffit's jambs (v23) already stand to its top; the raised wall starts above them there (the listeners'
           gallery's two arches, their jambs face to face with it) */
        var jb = [];
        gs.forEach(function (g) {
          if (!g.soffit || g.spill) return;
          var tp = Math.max(g.soffit[0], g.soffit[1]) + 0.1;
          jb.push([Math.max(0, g.s0 - 0.3), g.s0, tp], [g.s1, Math.min(L, g.s1 + 0.3), tp]);
        });
        jb.forEach(function (j) { if (j[1] > sa && j[0] < sb) cuts2.push(Math.max(sa, j[0]), Math.min(sb, j[1])); });
        cuts2.sort(function (p, q) { return p - q; });
        for (var j2 = 0; j2 < cuts2.length - 1; j2++) {
          var m2 = (cuts2[j2] + cuts2[j2 + 1]) / 2, gg = gs.filter(function (g) { return g.s0 < m2 && g.s1 > m2; })[0];
          var jj = jb.filter(function (j) { return j[0] < m2 && j[1] > m2; })[0];
          var lo2 = gg ? Math.max(HE, gg.h) : HE;
          if (jj) lo2 = Math.max(lo2, jj[2]);
          if (k.h - lo2 < 0.01 || cuts2[j2 + 1] - cuts2[j2] < 0.001) continue;
          piece(cuts2[j2], cuts2[j2 + 1], lo2, k.h, Q.id + '-raised-' + i + '-' + ki + '-' + j2);
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
    /* v91: the trim, one mesh a stone, untappable */
    Object.keys(trimB).forEach(function (key) {
      var b = trimB[key], tm = F.register(new THREE.Mesh(CastleTrim.merge(THREE, b.geos), b.mat), LAYER.wall);
      tm.name = Q.id + '-trim'; tm.userData.owner = Q.id; tm.raycast = function () {}; group.add(tm);
    });
    /* v59 (model v138, H65): a room hung in this place's air (its `hung` names this place: the hollow under the vanishing
       step, in the stair hall's well under well-M4) is a stone box from here, its walls `wall` thick round its plan, a
       slab under its floor and a roof 0.1 over its ceiling, kept under the flight's waist; its hidden door, which stands
       in no wall of this place, a tap on the box's face as a wall's (v10), never a `oneway` one */
    (M.rooms || []).forEach(function (R) {
      if (!R.hung || slug(R.hung) !== Q.id || !R.shape || !R.shape.rect) return;
      var t = R.wall != null ? R.wall : 0.2, r = R.shape.rect, bx0 = r[0] - t, by0 = r[1] - t, bx1 = r[2] + t, by1 = r[3] + t;
      var z0 = levelZ(M, R.level) + (R.floor || 0), z1 = z0 + (R.ceiling != null ? R.ceiling : 2.2) + 0.1;
      function block(ax, ay, bx, by, za, zb, name) {
        var m = slab(bx - ax, zb - za, by - ay, mats.wall, 'wall'), p = toLocal((ax + bx) / 2, (ay + by) / 2, za);
        m.position.set(p.x, p.y + (zb - za) / 2, p.z); m.name = Q.id + '-hung-' + R.id + '-' + name; group.add(m);
      }
      block(bx0, by0, bx1, by1, z0 - 0.2, z0, 'under');
      block(bx0, by0, bx1, by1, z1 - 0.1, z1, 'roof');
      block(bx0, by0, r[0], by1, z0, z1 - 0.1, 'west');
      block(r[2], by0, bx1, by1, z0, z1 - 0.1, 'east');
      block(r[0], by0, r[2], r[1], z0, z1 - 0.1, 'south');
      block(r[0], r[3], r[2], by1, z0, z1 - 0.1, 'north');
      (M.openings || []).forEach(function (op) {
        if (!op.at || op.oneway || !/hidden/.test(op.kind || '') || (op.between || []).indexOf(R.id) < 0) return;
        if (out.hidden.some(function (d) { return d.id === op.id; })) return;
        var dW = Math.abs(op.at[0] - r[0]), dE = Math.abs(op.at[0] - r[2]), dS = Math.abs(op.at[1] - r[1]), dN = Math.abs(op.at[1] - r[3]);
        var dm = Math.min(dW, dE, dS, dN), sx = dm === dW ? -1 : dm === dE ? 1 : 0, sy = sx ? 0 : dm === dS ? -1 : 1;
        var fx = sx < 0 ? bx0 : sx > 0 ? bx1 : op.at[0], fy = sy < 0 ? by0 : sy > 0 ? by1 : op.at[1];
        var w = op.w || 0.9, hh = op.h || 2.0, sill = z0 - Q.floor, lift = sill > RAISED ? sill : 0;
        var mid = toLocal(fx, fy, Q.floor), inward = new THREE.Vector3(sx, 0, -sy);
        var hit = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
        hit.position.set(mid.x + sx * 0.02, mid.y + sill + hh / 2, mid.z - sy * 0.02); hit.rotation.y = sx ? Math.PI / 2 : 0;
        hit.name = 'hidden-' + op.id; hit.userData.hidden = op.id; group.add(hit);
        out.hidden.push({ id: op.id, to: R.id, mesh: hit, w: w, h: hh, mid: mid, inward: inward, place: Q.id, sill: sill,
          lift: lift, level: Q.floor + lift, hidden: true });
      });
    });
    if (Q.shaft) buildShaft(Q, gaps);
    for (var kk in keep) mats[kk] = keep[kk];
    for (var kn = n0; kn < group.children.length; kn++) group.children[kn].userData.owner = Q.id;
  }
  /* v17: a newel stair made a place: its newel; a landing at each door's sill, doors a few risers apart sharing the
     lowest (the old wall-walk's two at +30 and the wind-dial room's, six risers above them up straight steps in its own
     width, as the model has it); between the foot and each landing a flight of treads winding up clockwise, one riser
     apart and about 30 degrees, phased to meet its ends, so a turn's head room is 2.4 and each turn closes the view above
     and below (enclosed, no open drop: Fawkes, 2.27 am); a tread across a door's opening left out. Each flight is walked
     along its own treads */
  var shaftFlights = [], shaftStepped = {};
  function buildShaft(Q, gaps) {
    var S = Q.rec, c = Q.round.c, R = Q.round.r, NR = 0.15, rise = S.rise || 0.2, PR = 0.95 * R / 1.7, GO = 0.25, doors = [];   /* v25: the walk's radius scaled to the well's (0.95 at r 1.7) */
    gaps.forEach(function (gs) { gs.forEach(function (g) {
      if (g.spill || g.niche || !g.op.at) return;
      /* v82 (the Architect's 164th, H82's slits): a window in a double stair's wall is no door: it takes no landing and
         cuts no tread under it */
      if (S.double && /window|loop|lancet|oriel|dormer|cleft|slit/.test(g.op.kind || '')) return;
      doors.push({ id: g.op.id, a: angle(c, toSite(M, g.op.group || null, g.op.at)), z: Q.floor + g.sill, top: Q.floor + g.h,
        w: g.s1 - g.s0, half: Math.atan2(g.s1 - g.s0, 2 * R) * 180 / Math.PI, flight: g.op.flight || null });
    }); });
    if (S.double) NR = 0.3;   /* v80: a double stair's open core, no newel */
    else {
      var newel = F.register(new THREE.Mesh(new THREE.CylinderGeometry(NR, NR, Q.ceiling - Q.floor, 12), mats.wall), LAYER.wall);
      newel.position.copy(toLocal(c[0], c[1], (Q.floor + Q.ceiling) / 2)); newel.name = Q.id + '-newel'; group.add(newel);
    }
    function wedge(a0, a1, top, thick, mat, name, ri, ro) {   /* v85: ri, ro an inner and outer radius (the core and the wall) */
      var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180, s = new THREE.Shape(), wi = ri != null ? ri : NR, wo = ro != null ? ro : R;
      s.moveTo(wi * Math.cos(r0), wi * Math.sin(r0)); s.lineTo(wo * Math.cos(r0), wo * Math.sin(r0));
      s.absarc(0, 0, wo, r0, r1, false); s.lineTo(wi * Math.cos(r1), wi * Math.sin(r1));
      var m = F.register(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 4 }), mat), LAYER.wall);
      m.rotation.x = -Math.PI / 2; m.position.copy(toLocal(c[0], c[1], top - thick)); m.name = name; group.add(m);
      return m;
    }
    var norm = function (x) { return ((x % 360) + 360) % 360; };
    var off = function (a, b) { return Math.abs(norm(a - b + 180) - 180); };
    var at = function (a, r) { return [c[0] + r * Math.cos(a * Math.PI / 180), c[1] + r * Math.sin(a * Math.PI / 180)]; };
    var end = function (a, r, z, la, lr, up) { var p = at(a, r), l = at(la, lr); return { x: p[0], y: p[1], z: z, lx: l[0], ly: l[1], up: up || 0 }; };
    if (S.double) { doubleStair(); return; }
    /* v80 (the Architect's 161st, H80, ledger 287): a double stair (`double`, Chambord's way): two flights round the open
       core, 30 steps a turn, clockwise as the newel stairs. Flight A from the well's floor, B from a landing spanning the
       door above it, B kept 2.49 over A at every angle (A 2.71 over B), so each passes under the other with 2.1 to 2.3
       clear; A stands where it is 0.11 under B's foot. Both run to `to`; the top floor there is drawn only where
       neither flight needs its head room (2.2 over its last treads), each head's landing on it */
    function doubleStair() {
      var TURN = 5.2, rs = TURN / 30, t = 12, GAP = 2.49, HEAD = 2.2, top = S.to != null ? S.to : Q.ceiling - TURN;
      /* v85 (the Architect's 165th, landed by the 167th, H80's top floor, option 1 on architect-s2-top-floor-1024): `gallery`, the outer radius
         of an inner gallery all round the core at the top; the flights' last half turn on the ring outside it, so either
         head reaches the other along it, never blocked */
      var GAL = S.gallery && S.gallery > NR + 0.3 && S.gallery < R - 0.5 ? S.gallery : 0;
      /* v82 (the Architect's 164th, req 1103's grotto): a door naming its flight (`flight: "a"` or `"b"`) opens off that
         flight's treads where they pass it, so it never starts B; only an unnamed door between the floor and the top does */
      var up = doors.filter(function (d) { return !d.flight && d.z > Q.floor + 0.05 && d.z < top - 0.05; }).sort(function (p, q) { return p.z - q.z; })[0];
      /* v81 (the Architect's 162nd, H82, the fern well): with no door between the floor and the top, both flights rise
         from the floor half a turn apart (each 2.6 over the other), B's foot 6 degrees short of the foot door, in the
         only gap the two leave under 2.4 */
      var foot0 = doors.filter(function (d) { return d.z <= Q.floor + 0.05; })[0], aB, aA, z0B;
      if (!up && !foot0) return;
      if (up) {
        var span = up.half + 4; aB = up.a - span; z0B = up.z;
        wedge(aB, up.a + span, up.z, rs, mats.floor, Q.id + '-landing-' + Math.round(up.z * 10));
        shaftFloors.push({ c: c, r: R, z: up.z });
        var hA = up.z - GAP - Q.floor; if (hA < 0) hA += TURN;
        aA = aB + hA / rs * t;
      } else { aB = foot0.a - 6; z0B = Q.floor; aA = aB + 180; }
      var sweep = HEAD / rs * t;
      var runs = [{ id: Q.id + '-flight-a', a0: aA, z0: Q.floor }, { id: Q.id + '-flight-b', a0: aB, z0: z0B }];
      runs.forEach(function (F0) {
        var n = Math.round((top - F0.z0) / rs), path = [];
        F0.end = F0.a0 - n * t;
        for (var k = 1; k <= n; k++) {
          var a1 = F0.a0 - (k - 1) * t, a2 = F0.a0 - k * t, mid = (a1 + a2) / 2, tz = F0.z0 + k * rs;
          var under = GAL && tz > top - HEAD - 0.3;   /* v85: under the gallery's head room, on the outer ring only */
          if (k % 3 === 1 || k === n) { var pp = at(mid, under ? (GAL + R) / 2 : PR); path.push([pp[0], pp[1], tz]); }
          if (doors.some(function (d) { return tz > d.z + 0.05 && tz < d.top + rs && off(mid, d.a) < d.half + t / 2; })) continue;
          wedge(k === n ? a2 : a2 - 0.5, a1, tz, rs, mats.floor, F0.id + '-' + k, under ? GAL : null).userData.stair = F0.id;
        }
        F0.path = path;
      });
      /* the top floor: from each flight's head room on round to the other's last treads */
      var A = runs[0], B = runs[1], dA = norm(A.end - (B.end + sweep)), dB = norm(B.end - (A.end + sweep));
      [[A, dA], [B, dB]].forEach(function (p) {
        if (p[1] < 1) return;
        wedge(p[0].end - p[1], p[0].end, top, 0.3, mats.floor, Q.id + '-top-' + (p[0] === A ? 'a' : 'b'), GAL || null);
        p[0].ha = p[0].end - Math.min(10, p[1] / 2);
      });
      if (GAL) {   /* the gallery: a ring from the core to GAL, its edge open on the core */
        var gs = new THREE.Shape(), gh = new THREE.Path(); gs.absarc(0, 0, GAL, 0, Math.PI * 2, false); gh.absarc(0, 0, NR, 0, Math.PI * 2, true); gs.holes.push(gh);
        var gm = F.register(new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 0.3, bevelEnabled: false, curveSegments: 24 }), mats.floor), LAYER.wall);
        gm.rotation.x = -Math.PI / 2; gm.position.copy(toLocal(c[0], c[1], top - 0.3)); gm.name = Q.id + '-gallery'; group.add(gm);
      }
      shaftFloors.push({ c: c, r: R, z: top });
      runs.forEach(function (F0) {
        var ha = F0.ha != null ? F0.ha : F0.end;
        shaftFlights.push({ id: F0.id, foot: end(F0.a0 + 6, PR, F0.z0, F0.a0 - 3 * t, PR, 0.9), head: end(ha, PR, top, ha - 20, R),
          path: F0.path, lamp: [c[0], c[1], F0.z0 + 2.0] });
      });
    }
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
        /* v57 (req 861 (3)): steps that run in past the newel leave their foot beside them on the landing, the side
           nearer its middle, never across the well on the next flight's treads */
        var fa = d.a, fr = R - n * GO - 0.35;
        if (fr < NR + 0.3) {
          var side = Math.atan2(d.w / 2, PR) * 180 / Math.PI + 10;
          fa = off(d.a + side, L.mid) <= off(d.a - side, L.mid) ? d.a + side : d.a - side; fr = PR;
        }
        shaftFlights.push({ id: id, foot: end(fa, fr, L.z, d.a, R), head: end(d.a, R - 0.35, d.z, d.a, R + 1),
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
        wedge(k === n ? a2 : a2 - 0.5, a1, top, rise, mats.floor, fid + '-' + k).userData.stair = fid;   /* v39: the top tread meets its landing edge to edge, not lapped flush on it */
      }
      /* v57 (req 861 (1)): a head under the next landing (less than 2.45 above, so under 0.9 over his eye) stands at
         its landing's middle instead (the West Tower's +5.2 under the wall passage's +7.2) */
      var ha = B.in - 6;
      if (lands.some(function (U) { return U.z > B.z && U.z - B.z < 2.45 && off(ha, U.mid) < (U.hi - U.lo) / 2 + 4; })) ha = B.mid;
      shaftFlights.push({ id: fid, foot: end(A.out + 6, PR, A.z, A.out - 3 * t, PR, 0.9), head: end(ha, PR, B.z, B.mid != null ? B.mid : B.in, R),
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
  /* v24 (model v54): an open side of this place over another's air (an opening with `over`: the first-floor corridor's
     landing over the Entrance Hall) builds that place in the same frame, as a mouth does; nothing to walk through */
  (M.openings || []).forEach(function (op) {
    if (!op.over || !matches(M, op, P.id)) return;
    var to = slug(op.over), Q = findPlace(M, to);
    if (!Q || (Q.rec && Q.rec.page) || out.places.some(function (q) { return q.id === to; })) return;
    out.places.push(Q); buildPlace(Q);
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
    if (!s.rect || s.span || s.arc || !s.rooms || s.rooms.length < 2 || !/ladder|trapdoor|hatch|steep flight/.test(s.kind || '')) return;
    if (!s.rooms.some(function (r) { return slug(r) === P.id; })) return;
    var down = Math.abs(s.to - P.floor) < 0.05, up = Math.abs(s.from - P.floor) < 0.05;
    if (!down && !up) return;
    var to = slug(s.rooms.filter(function (r) { return slug(r) !== P.id; })[0]);
    var R = s.rect, mx = (R[0] + R[2]) / 2, my = (R[1] + R[3]) / 2, wx = R[2] - R[0], wy = R[3] - R[1];
    /* v41 (W5B's find, the drying loft's stair, H28): a steep flight in a room, behind a door of its own, is a closed box
       over its rect from the room's floor to its ceiling (2 cm into it) with the door at its foot, the door leading up to
       the stair's other room; from above it is a hatch in the boards, as a ladder's */
    var sdoor = up && /steep flight/.test(s.kind || '') ? (M.openings || []).filter(function (o) {
      return o.at && o.between && o.between.indexOf(s.id) >= 0 && o.between.some(function (b) { return slug(b) === P.id; }); })[0] : null;
    if (sdoor) {
      var BH = (P.ceiling == null ? P.floor + 4.5 : P.ceiling) - P.floor + 0.02, bx = slab(wx, BH, wy, mats.wall, 'wall'), bc = toLocal(mx, my, P.floor);
      bx.position.set(bc.x, bc.y + BH / 2, bc.z); bx.name = P.id + '-box-' + s.id; bx.userData.owner = P.id; group.add(bx);
      var alongX = wx >= wy, ix = alongX ? Math.sign(sdoor.at[0] - mx) || -1 : 0, iy = alongX ? 0 : Math.sign(sdoor.at[1] - my) || -1;
      var dw = sdoor.w || 0.8, dh = sdoor.h || 1.9, fx = sdoor.at[0] + ix * 0.07, fy = sdoor.at[1] + iy * 0.07, fp = toLocal(fx, fy, P.floor);
      var dl = slab(dw - 0.08, dh - 0.02, 0.12, mats.door, 'door');
      dl.position.set(fp.x, fp.y + (dh - 0.02) / 2, fp.z); dl.rotation.y = alongX ? Math.PI / 2 : 0;
      dl.name = 'door-' + sdoor.id; dl.userData.door = sdoor.id; dl.userData.owner = P.id; group.add(dl);
      out.doors.push({ id: sdoor.id, to: to, mesh: dl, w: dw, h: dh, mid: toLocal(sdoor.at[0], sdoor.at[1], P.floor), inward: new THREE.Vector3(ix, 0, -iy),
        place: P.id, sill: 0, lift: 0, level: P.floor });
      return;
    }
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
  /* v46 (model v100, the cores): a core stair (a stair with `core`, a `rect` and `rooms` on several floors: two flights a
     storey about a half-landing) in each of its rooms: the flight up from this floor along `up` on its `first` half to the
     half-landing at the far end, the return flight over the other half cut under the ceiling, that half open in the floor
     where the flight from below comes up; a way up to its room on the next floor above, a way down to the next below,
     each stood at beside its foot. A piece on the room's edge bears 2 cm into the wall (the seams rule) */
  (M.stairs || []).forEach(function (s) {
    if (!s.core || !s.rect || !s.up || !s.rooms || !s.rooms.some(function (r) { return slug(r) === P.id; })) return;
    var zOf = function (rid) {
      var rr = (M.rooms || []).filter(function (x) { return x.id === rid; })[0], lv = rr && (M.levels || []).filter(function (l) { return l.id === rr.level; })[0];
      return lv ? lv.z + (rr.floor || 0) : null;
    };
    var above = null, below = null;
    s.rooms.forEach(function (rid) {
      var z = zOf(rid);
      if (z == null || slug(rid) === P.id) return;
      if (z > P.floor + 0.05 && (!above || z < above.z)) above = { id: slug(rid), z: z };
      if (z < P.floor - 0.05 && (!below || z > below.z)) below = { id: slug(rid), z: z };
    });
    var R = s.rect, alongX = s.up[0] !== 0, dir = alongX ? Math.sign(s.up[0]) : Math.sign(s.up[1]);
    var lo = alongX ? R[0] : R[1], hi = alongX ? R[2] : R[3], c0 = alongX ? R[1] : R[0], c1 = alongX ? R[3] : R[2], cm = (c0 + c1) / 2;
    var firstLow = s.first === 'south' || s.first === 'west', A = firstLow ? [c0, cm] : [cm, c1], B = firstLow ? [cm, c1] : [c0, cm];
    var n = Math.round((s.treads || 26) / 2), go = s.going || 0.25, rise = s.rise || 0.2, run = n * go, u0 = dir > 0 ? lo : hi;
    var pxs = P.poly.map(function (p) { return p[0]; }), pys = P.poly.map(function (p) { return p[1]; });
    var bx0 = Math.min.apply(null, pxs), bx1 = Math.max.apply(null, pxs), by0 = Math.min.apply(null, pys), by1 = Math.max.apply(null, pys);
    var tmat = (rowOf(P) && stairMat(s.id)) || mats.stair, ceil = P.ceiling == null ? P.floor + 4.5 : P.ceiling;
    function piece(ua, ub, ca, cb, zb, zt, name) {   /* a box from along ua to ub, across ca to cb, z zb to zt (site) */
      var x0 = alongX ? Math.min(ua, ub) : ca, x1 = alongX ? Math.max(ua, ub) : cb, y0 = alongX ? ca : Math.min(ua, ub), y1 = alongX ? cb : Math.max(ua, ub);
      if (Math.abs(x0 - bx0) < 0.005) x0 -= 0.02; if (Math.abs(x1 - bx1) < 0.005) x1 += 0.02;
      if (Math.abs(y0 - by0) < 0.005) y0 -= 0.02; if (Math.abs(y1 - by1) < 0.005) y1 += 0.02;
      var b = slab(x1 - x0, zt - zb, y1 - y0, tmat, 'stair'), p = toLocal((x0 + x1) / 2, (y0 + y1) / 2, zb);
      b.position.set(p.x, p.y + (zt - zb) / 2, p.z); b.name = name; b.userData.stair = s.id; b.userData.owner = P.id; group.add(b);
      return b;
    }
    function site(u, c) { return alongX ? [u, c] : [c, u]; }
    var inw = alongX ? new THREE.Vector3(-dir, 0, 0) : new THREE.Vector3(0, 0, dir);   /* out of the stair at its foot end */
    if (above) {
      for (var i = 0; i < n; i++) piece(u0 + dir * i * go, u0 + dir * (i + 1) * go, A[0], A[1], P.floor, P.floor + rise * (i + 1), s.id + '-up-' + (i + 1));
      piece(u0 + dir * run, dir > 0 ? hi : lo, c0, c1, P.floor, P.floor + rise * n, s.id + '-half-landing');
      for (var k = 0; k < n; k++) {
        var top = P.floor + rise * (n + k + 1);
        if (top > ceil - 0.05) break;
        piece(u0 + dir * (run - k * go), u0 + dir * (run - (k + 1) * go), B[0], B[1], top - rise - WAIST, top, s.id + '-return-' + (k + 1));
      }
      /* the way up: a plane 2 cm over the first flight's nosings, unseen, so a tap anywhere on the flight takes it */
      var f0 = site(u0, A[0]), f1 = site(u0, A[1]), g0 = site(u0 + dir * run, A[0]), g1 = site(u0 + dir * run, A[1]), zt0 = P.floor + rise + 0.02, zt1 = P.floor + rise * n + 0.02;
      var pg = new THREE.BufferGeometry().setFromPoints([toLocal(f0[0], f0[1], zt0), toLocal(f1[0], f1[1], zt0), toLocal(g1[0], g1[1], zt1),
        toLocal(f0[0], f0[1], zt0), toLocal(g1[0], g1[1], zt1), toLocal(g0[0], g0[1], zt1)]);
      var upm = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
      upm.visible = false; upm.name = 'way-' + s.id + '-up'; upm.userData.way = s.id + '-up'; upm.userData.owner = P.id; group.add(upm);
      var fu = site(u0, (A[0] + A[1]) / 2), fm = toLocal(fu[0], fu[1], P.floor), mu = site(u0 + dir * run / 2, (A[0] + A[1]) / 2), mm = toLocal(mu[0], mu[1], P.floor + rise * n / 2);
      out.ways.push({ id: s.id + '-up', to: above.id, mesh: upm, w: A[1] - A[0], h: 2.0, mid: mm, foot: fm, inward: inw.clone(), place: P.id, at: fu,
        half: 0, sill: 0, lift: 0, level: P.floor, back: false, via: false, depth: 0, hatch: 'up', built: !!findPlace(M, above.id) });
    }
    if (below) {
      var w0 = site(u0, B[0]), w1 = site(u0 + dir * run, B[1]), wc = toLocal((w0[0] + w1[0]) / 2, (w0[1] + w1[1]) / 2, P.floor);
      var wq = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(w1[0] - w0[0]), Math.abs(w1[1] - w0[1])), F.solid(0x141210));
      wq.rotation.x = -Math.PI / 2; wq.position.copy(wc); wq.position.y = 0.012;
      wq.name = 'way-' + s.id + '-down'; wq.userData.way = s.id + '-down'; wq.userData.hatch = 'down'; wq.userData.owner = P.id; group.add(wq);
      var fd = site(u0, (B[0] + B[1]) / 2), fdm = toLocal(fd[0], fd[1], P.floor), wm = wc.clone(); wm.y = 0.012;
      out.ways.push({ id: s.id + '-down', to: below.id, mesh: wq, w: B[1] - B[0], h: 0.8, mid: wm, foot: fdm, inward: inw.clone(), place: P.id, at: fd,
        half: 0, sill: 0, lift: 0, level: P.floor, back: false, via: false, depth: 0, hatch: 'down', built: !!findPlace(M, below.id) });
    }
  });
  /* v19 (the Found list): a rail round a hatch or a stair's opening in the boards (a feature with `rect`, `z`, `h` and
     `sides`, a side's span by its own name where it stops short: the feast loft's, ledger line 89 a; the drying
     loft's, line 82): a top rail and posts about a metre apart, stair grey; nothing to tap. v24: drawn wherever its room
     is built, or in this place where it stands in its air (the first-floor landing's over the Entrance Hall) */
  (M.features || []).forEach(function (ft) {
    if (!ft.rect || !ft.sides || !ft.h || ft.z == null) return;
    var px = P.poly.map(function (p) { return p[0]; }), py = P.poly.map(function (p) { return p[1]; });
    var inAir = ft.z > P.floor + 0.05 && (P.ceiling == null || ft.z < P.ceiling) && inPoly(P.poly, (ft.rect[0] + ft.rect[2]) / 2, (ft.rect[1] + ft.rect[3]) / 2) &&
      ft.rect[0] >= Math.min.apply(null, px) - 0.01 && ft.rect[2] <= Math.max.apply(null, px) + 0.01 &&
      ft.rect[1] >= Math.min.apply(null, py) - 0.01 && ft.rect[3] <= Math.max.apply(null, py) + 0.01;
    if (!inAir && !out.places.some(function (q) { return q.id === slug(ft.room || ''); })) return;
    var R = ft.rect, T = 0.06, railPosts = {};
    var rrow = rowOf(P.id === slug(ft.room || '') ? P : out.places.filter(function (q) { return q.id === slug(ft.room || ''); })[0] || P);
    var rmat = rrow ? paintMat(/marble/.test(ft.id) ? tone('marble') : tone('iron')) : mats.stair;   /* v28: banisters marble, rails iron */
    ft.sides.forEach(function (sd) {
      var ns = sd === 'north' || sd === 'south', sp = ft[sd] || (ns ? [R[0], R[2]] : [R[1], R[3]]);
      var fix = sd === 'west' ? R[0] : sd === 'east' ? R[2] : sd === 'south' ? R[1] : R[3], L = sp[1] - sp[0];
      if (L <= 0) return;
      var at = function (u) { return ns ? toLocal(u, fix, ft.z) : toLocal(fix, u, ft.z); }, c = at((sp[0] + sp[1]) / 2);
      /* v35 (the seams rule): an east or west bar 12 mm thinner, so at a corner its end bears inside the north or south
         bar's, no face within the seams tool's 4 mm; the posts 26 mm thinner, inside both */
      var tw = ns ? T : T - 0.012;
      var bar = slab(ns ? L + T : tw, tw, ns ? T : L + T - 0.024, rmat, 'stair');   /* v35: a north or south bar's ends 6 mm past an east or west bar's face, an east or west bar's 12 mm inside theirs */
      bar.position.set(c.x, c.y + ft.h - T / 2, c.z); bar.name = P.id + '-rail-' + ft.id + '-' + sd; group.add(bar);
      for (var n = Math.max(1, Math.round(L)), i = 0; i <= n; i++) {
        /* v30: one post where two sides meet, its top in the rail's depth, not flush with it */
        var p = at(sp[0] + L * i / n), pk = ft.id + ':' + p.x.toFixed(2) + ',' + p.z.toFixed(2);
        if (railPosts[pk]) continue;
        railPosts[pk] = 1;
        var post = slab(T - 0.026, ft.h - T / 2, T - 0.026, rmat, 'stair');
        post.position.set(p.x, p.y + (ft.h - T / 2) / 2, p.z); post.name = P.id + '-rail-post-' + ft.id + '-' + sd + '-' + i; group.add(post);
      }
    });
  });

  /* v22 (the Found list): masonry of another work standing in a place (a feature with `circle`, `r`, `z` and `top`, no
     arc or ring: the south-west drum in the drying loft's corner, drying-loft-drum): a stone drum from z to top, wall
     grey, its curved face toward the room; what stands outside the room hides behind its walls; nothing to tap */
  (M.features || []).forEach(function (ft) {
    if (!ft.circle || !ft.r || ft.top == null || ft.z == null || ft.arc || ft.ring || slug(ft.room || '') !== P.id) return;
    var cyl = slab(1, 1, 1, mats.wall, 'wall');
    /* v77: its foot 1 cm under the boards, so its base (the wall's double-sided stone) is not one plane with the floor
       (30 m2 fighting in the drying loft, the 154th's sweep) */
    cyl.geometry.dispose(); cyl.geometry = new THREE.CylinderGeometry(ft.r, ft.r, ft.top - ft.z + 0.01, 48);
    var p = toLocal(ft.circle[0], ft.circle[1], ft.z - 0.01);
    cyl.position.set(p.x, p.y + (ft.top - ft.z + 0.01) / 2, p.z); cyl.name = P.id + '-masonry-' + ft.id; group.add(cyl);
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
      var srow = rowOf(inIt);
      var sl = slab(R[2] - R[0], SLAB, R[3] - R[1], srow ? floorMat(srow, (R[0] + R[2]) / 2, (R[1] + R[3]) / 2) : mats.floor, 'floor');
      sl.position.copy(c); sl.name = s.id; sl.userData.landing = s.id; sl.userData.owner = inIt.id; group.add(sl);
      slabs.push({ id: s.id, rect: R, z: top, kind: s.kind || '' });
      return;
    }
    if (!s.up || !s.span) return;
    var a = toSite(M, s.group, s.span[0]), b = toSite(M, s.group, s.span[1]);
    var bx0 = Math.min(a[0], b[0]), bx1 = Math.max(a[0], b[0]), by0 = Math.min(a[1], b[1]), by1 = Math.max(a[1], b[1]);
    var alongY = s.up[1] !== 0, run = alongY ? by1 - by0 : bx1 - bx0, across = alongY ? bx1 - bx0 : by1 - by0;
    var n = s.treads, go = run / n, rise = (s.to - s.from) / n;
    var tmat = (rowOf(inIt) && stairMat(s.id)) || mats.stair;    /* v28: marble on the marble staircase, else its wall's stone */
    for (var i = 0; i < n; i++) {
      var f = (i + 0.5) / n, top = inIt.floor + s.from + rise * (i + 1);
      var sx = alongY ? (bx0 + bx1) / 2 : (s.up[0] > 0 ? bx0 + f * run : bx1 - f * run);
      var sy = alongY ? (s.up[1] > 0 ? by0 + f * run : by1 - f * run) : (by0 + by1) / 2;
      /* a flight from the floor stands on it; one higher up is a waist under its nosings */
      var base = s.from > 0.01 ? top - rise - WAIST : inIt.floor;
      var hgt = top - base, p = toLocal(sx, sy, base);
      var tr = slab(alongY ? across : go, Math.max(0.05, hgt), alongY ? go : across, tmat, 'stair');
      tr.position.set(p.x, p.y + hgt / 2, p.z); tr.name = s.id + '-' + (i + 1); tr.userData.stair = s.id; tr.userData.owner = inIt.id; group.add(tr);
    }
    if (s.landing) {
      var L = siteRect(s.group, s.landing), lt = s.to;
      var lp = toLocal((L[0] + L[2]) / 2, (L[1] + L[3]) / 2, inIt.floor);
      var land = slab(L[2] - L[0], lt, L[3] - L[1], tmat, 'stair');
      land.position.set(lp.x, lp.y + lt / 2, lp.z); land.name = s.id + '-landing'; land.userData.stair = s.id; land.userData.owner = inIt.id; group.add(land);
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
    var off = d.back ? 0.5 : P.shaft && d.place === P.id ? (shaftStepped[d.id] ? 0.35 : Math.min(1.0, 0.6 * P.round.r)) : d.lift ? STAND_OFF : Math.min(10, Math.max(STAND_OFF, d.w * 1.1, d.h * 1.6));   /* far enough back to see it whole; a hidden place's way out a step in, its landings narrow */
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
    var back = d.back ? 0.5 : d.mesh.userData.way ? (d.via ? viaIn : d.page || !d.built ? -0.3 : -1.0) : P.shaft ? (shaftStepped[d.id] ? 0.35 : Math.min(1.0, 0.6 * P.round.r)) : STAND_OFF;   /* v25: a narrower well, a shorter step in, clear of its newel */
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
    (P.shaft ? mine.filter(function (d) { return d.level <= P.floor + 0.05; })[0] : null) || mine[0] ||   /* v17: a stair's well, at its foot */
    /* v38: a place whose ways in are all hidden (the kitchens' jibs, a corridor's pretending wall) starts beside one, facing
       in, not at its middle (the kitchens' middle is a pier) */
    out.hidden.filter(function (d) { return d.place === P.id && o.from && d.to === o.from; })[0] || out.hidden.filter(function (d) { return d.place === P.id; })[0];
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
    fs.flight = hs.flight = true;   /* req 856 */
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
    fs.flight = hs.flight = true;   /* req 856: a flight's end, for the look below */
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
    /* req 856 (Interaction; Godric's stair faults, 21 October 2026, 11.10 am; the charter's walking freely, section 2):
       in a look.free room a flight's end the model does not name is a place like any drawn one, all round and its
       rest about the level, not the default 60 and a look up the flight's slope */
    var fl = LK.free && st.flight && !named[st.name];
    st.lim = { rest: pick(L, 'rest', null), down: pick(L, 'down', -14), up: pick(L, 'up', 14), turn: pick(L, 'turn', fl ? 180 : 60) };
    if (st.lim.rest != null && (st.name === 'start' || named[st.name] || fl)) {
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
  /* v30 (Godric, 20 October 2026, 8.56 am: the glitches at thresholds and corners): one owner per face. The places
     built in one frame meet on shared lines (a wall's body lies in its neighbour's plan, a landing ends on a wall's
     face, two rooms' floors at one storey), drawn to the exact plane of what they meet, so the depth test tied pixel
     by pixel: the combed stripes. Each place's pieces, its stairs and landings with them, are drawn at its own depth
     rank, this place first (rank 0) and each next place one further back, so where two places' faces share a plane
     the nearer-ranked one shows whole. tools/architect-seams.mjs counts the faces still tied */
  var RANK = {};
  out.places.forEach(function (q, i) { RANK[q.id] = i ? 1 + (i - 1) % 6 : 0; });
  function rankOn(r, s, c, g, mt) { if (!mt || !mt.isMaterial) return; mt.__po = [mt.polygonOffset, mt.polygonOffsetFactor, mt.polygonOffsetUnits];
    mt.polygonOffset = true; mt.polygonOffsetFactor = this.userData.rank; mt.polygonOffsetUnits = this.userData.rank; }
  function rankOff(r, s, c, g, mt) { if (!mt || !mt.__po) return; mt.polygonOffset = mt.__po[0]; mt.polygonOffsetFactor = mt.__po[1]; mt.polygonOffsetUnits = mt.__po[2]; mt.__po = null; }
  group.traverse(function (o) {
    var rk = o.isMesh ? RANK[o.userData.owner] : 0;
    if (!rk) return;
    o.userData.rank = rk; o.onBeforeRender = rankOn; o.onAfterRender = rankOff;
  });
  if (out.panes.length && F.renderer && o.far) out.far = farView(F, M, toLocal, out.panes, mats.pane, P.shaft);
  return out;
} };

/* v62 (Godric's 1 on the window views, 22 October 2026; docs/architect/window-views.md): what a window looks out on,
   drawn from the model in plain tones. The grounds (the lake under its crag, the lawns, the forest, the pitch, the
   greenhouses, the cabin), the castle's masses with their roofs and its towers, and far hills, are built once into a
   scene of their own in the place's frame, unfogged, and rendered into a cube from the place's middle at the eye
   (+1.35); every pane samples that cube along the line of sight (refraction at ratio 1), so the glass shows what lies
   that way. One cube for the place: no parallax as he walks (the pitch at 300 m holds; a court's far side at 30 m does
   not slide), a cube per window the step up. far.night(true) redraws it by night. The tones are Design's when its
   tones.js names them (far-lawn, far-water-day, far-water-night, far-forest, far-hills, far-stone, far-rock,
   far-roof), else these, provisional. v66 (req 906, Design's thirteen far tones, f0bdf4ab): by night the castle's own
   windows on the far walls take far-window-night, lit from within (PS 6, "windows sparkling"), their own light. */
function farView(F, M, toLocal, panes, paneMat, shaft) {
  var LAWN = -1.2, LAKE = -46.0, BASE = -20.0;      /* tools/architect-sections-pdf.py's lawn and lake; the castle's foot */
  var FALL = { 'far-lawn': 0x7d8a5c, 'far-pitch': 0x8d9a64, 'far-water-day': 0x6f8797, 'far-water-night': 0x141b24,
    'far-forest': 0x3a4630, 'far-hills': 0x7c8794, 'far-stone': 0xa9a194, 'far-rock': 0x8b8478, 'far-roof': 0x5f6670,
    'far-glass': 0xc9d2d8, 'far-timber': 0x6e4c30, 'far-window': 0x2b2f36, 'far-window-night': 0xd9a65a, 'sky-day': 0xb8cde6, 'sky-night': 0x10141f };
  var S = window.CASTLE_TONES && CASTLE_TONES.surfaces;
  function hex(k) { return S && S[k] && S[k].hex ? new THREE.Color(S[k].hex) : new THREE.Color(FALL[k]); }
  var scene = new THREE.Scene(), mats = {};
  function mat(k) { if (!mats[k]) mats[k] = new THREE.MeshLambertMaterial({ color: hex(k).convertSRGBToLinear() }); return mats[k]; }
  function V(x, y, z) { return toLocal(x, y, z); }
  function add(geo, k) { var m = new THREE.Mesh(geo, mat(k)); scene.add(m); return m; }
  function shape(pts) { return new THREE.Shape(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); })); }
  /* a flat shape at z, in the castle's plan (x east, y north), laid into the place's frame */
  function flat(sh, z, k) {
    var g = new THREE.ShapeGeometry(sh, 24), a = g.attributes.position;
    for (var i = 0; i < a.count; i++) { var v = V(a.getX(i), a.getY(i), z); a.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); var m = add(g, k); m.material.side = THREE.DoubleSide; return m;
  }
  /* a solid from a plan outline, z0 to z1 */
  function prism(pts, z0, z1, k) {
    var pos = [], n = pts.length;
    if (holds(pts, z0, z1)) return null;                  /* the place's own mass: from inside it hides every view */
    for (var i = 0; i < n; i++) {
      var p = pts[i], q = pts[(i + 1) % n], a = V(p[0], p[1], z0), b = V(q[0], q[1], z0), c = V(q[0], q[1], z1), d = V(p[0], p[1], z1);
      pos.push(a, b, c, a, c, d);
    }
    var g = new THREE.BufferGeometry().setFromPoints(pos); g.computeVertexNormals();
    var m = add(g, k); m.material.side = THREE.DoubleSide; flat(shape(pts), z1, k); return m;
  }
  /* whether the eye (the place's middle at +1.35, the frame's 0, 1.35, 0) stands inside a solid's outline and height */
  function holds(pts, z0, z1) {
    var y0 = V(0, 0, z0).y, y1 = V(0, 0, z1).y, inside = false;
    if (!(EYE > y0 && EYE < y1)) return false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = V(pts[i][0], pts[i][1], z0), b = V(pts[j][0], pts[j][1], z0);
      if ((a.z > 0) !== (b.z > 0) && 0 < (b.x - a.x) * (0 - a.z) / (b.z - a.z) + a.x) inside = !inside;
    }
    return inside;
  }
  function rect(r) { return [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]; }
  function circ(c, r, n) { var o = []; for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; o.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); } return o; }
  /* a pitched roof over a rect: hip (ridge short of the ends by half the span), gable or crow (to the ends) */
  function roof(r, e, h, kind) {
    if (!(h > e + 0.05) || kind === 'flat') return;
    var x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3], alongX = (x1 - x0) >= (y1 - y0), half = (alongX ? y1 - y0 : x1 - x0) / 2;
    var inset = kind === 'hip' ? Math.min(half, (alongX ? x1 - x0 : y1 - y0) / 2 - 0.01) : 0, pos = [];
    var A = V(x0, y0, e), B = V(x1, y0, e), C = V(x1, y1, e), D = V(x0, y1, e), R0, R1;
    if (alongX) { R0 = V(x0 + inset, (y0 + y1) / 2, h); R1 = V(x1 - inset, (y0 + y1) / 2, h); pos.push(A, B, R1, A, R1, R0, C, D, R0, C, R0, R1, D, A, R0, B, C, R1); }
    else { R0 = V((x0 + x1) / 2, y0 + inset, h); R1 = V((x0 + x1) / 2, y1 - inset, h); pos.push(B, C, R1, B, R1, R0, D, A, R0, D, R0, R1, A, B, R0, C, D, R1); }
    var g = new THREE.BufferGeometry().setFromPoints(pos); g.computeVertexNormals();
    var m = add(g, 'far-roof'); m.material.side = THREE.DoubleSide;
  }
  function cone(c, r, z0, z1) {
    var g = new THREE.ConeGeometry(r * 1.08, z1 - z0, 24, 1, true), m = add(g, 'far-roof'), p = V(c[0], c[1], (z0 + z1) / 2);
    m.position.copy(p); m.material.side = THREE.DoubleSide;
  }

  /* the ground: the lawns at their level round the lake's hole; the lake's water, its banks sloping up to the lawns
     (steep where the model's shore is cliff or rock, long where it is grass, glen, shrub, forest, pebble or bay) */
  var lake = (M.grounds || []).filter(function (g) { return g.id === 'lake'; })[0], ring = null;
  if (lake && lake.shape && lake.shape.poly) {
    var lp = lake.shape.poly, sh = lake.shores || [], lc = [0, 0];
    lp.forEach(function (p) { lc[0] += p[0] / lp.length; lc[1] += p[1] / lp.length; });
    function kindAt(i) { var k = 'grass'; sh.forEach(function (s) { if (i >= s[1]) k = s[0]; }); return k; }
    ring = lp.map(function (p, i) {
      var dx = p[0] - lc[0], dy = p[1] - lc[1], d = Math.hypot(dx, dy) || 1, k = kindAt(i), w = /cliff|rock/.test(k) ? 6 : 40;
      return [p[0] + dx / d * w, p[1] + dy / d * w];
    });
    var ground = shape([[-4000, -4000], [4000, -4000], [4000, 4000], [-4000, 4000]]);
    ground.holes.push(new THREE.Path(ring.map(function (p) { return new THREE.Vector2(p[0], p[1]); })));
    /* v69 (the shell grotto's cleft, its top black): an eye below the lawn (the grotto's, 8 m down in the crag) saw the
       lawn's and the banks' undersides through its slit; the ground is drawn from above only, so an eye in the rock
       looks through the rock it stands in, onto the lake and the sky as the cleft's own words have it */
    flat(ground, LAWN, 'far-lawn').material.side = THREE.FrontSide;
    var water = flat(shape(lp), LAKE + 0.5, 'far-water-day'); water.name = 'far-water';
    var pos = [], n = lp.length;
    for (var i = 0; i < n; i++) {
      var j = (i + 1) % n, a = V(lp[i][0], lp[i][1], LAKE), b = V(lp[j][0], lp[j][1], LAKE), c = V(ring[j][0], ring[j][1], LAWN), d = V(ring[i][0], ring[i][1], LAWN);
      /* each face wound to face up, the bank's open side */
      if (new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).y >= 0) pos.push(a, b, c, a, c, d);
      else pos.push(a, c, b, a, d, c);
    }
    var bank = new THREE.BufferGeometry().setFromPoints(pos); bank.computeVertexNormals();
    add(bank, 'far-rock');
  } else flat(shape([[-4000, -4000], [4000, -4000], [4000, 4000], [-4000, 4000]]), LAWN, 'far-lawn');

  /* the grounds' things, by their shapes */
  (M.grounds || []).forEach(function (g) {
    var s = g.shape || {};
    if (g.state === 'set aside' || g.last) return;                   /* the tomb, and the Triwizard visitors */
    if (g.id === 'forbidden-forest' && s.poly) prism(s.poly, LAWN, LAWN + 16, 'far-forest');
    else if (g.id === 'quidditch-pitch' && s.ellipse) {
      var e = s.ellipse, oval = [];
      for (var i = 0; i < 48; i++) { var t = i / 48 * Math.PI * 2; oval.push([e[0] + e[2] * Math.cos(t), e[1] + e[3] * Math.sin(t)]); }
      flat(shape(oval), LAWN + 0.05, 'far-pitch');
      var outer = oval.map(function (p) { return [e[0] + (p[0] - e[0]) * (e[2] + 11) / e[2], e[1] + (p[1] - e[1]) * (e[3] + 11) / e[3]]; });
      var st = prism(outer, LAWN, LAWN + 7, 'far-timber'); if (st) st.name = 'far-stands';
      [-1, 1].forEach(function (end) {
        [-6, 0, 6].forEach(function (dx, h) {
          var top = LAWN + (h === 1 ? 16 : 12), ft = [e[0] + dx, e[1] + end * (e[3] - 4)];
          prism(circ(ft, 0.25, 6), LAWN, top, 'far-stone');
          var hoop = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 6, 16), mat('far-stone')), hp = V(ft[0], ft[1], top + 1.2);
          hoop.position.copy(hp); scene.add(hoop);
        });
      });
    }
    else if (g.id === 'greenhouses' && s.rects) s.rects.forEach(function (r, i) {
      /* v214, req 1180's 1: a house with its own nave (house one, the Crystal Palace manner) stands as aisles to its eaves
         under a low ridge-and-furrow, the nave and the transept to their springing, each under its barrel (a gable far off) */
      var h = (g.houses || [])[i];
      if (h && h.nave) {
        prism(rect(r), LAWN, LAWN + h.eaves, 'far-glass'); roof(r, LAWN + h.eaves, LAWN + h.ridge_and_furrow, 'gable');
        [h.nave, h.transept].forEach(function (v) { if (!v) return; prism(rect(v.rect), LAWN + h.eaves, LAWN + v.springing, 'far-glass'); roof(v.rect, LAWN + v.springing, LAWN + v.crown, 'gable'); });
        return;
      }
      prism(rect(r), LAWN, LAWN + 3.2, 'far-glass'); roof(r, LAWN + 3.2, LAWN + 5.0, 'gable');
    });
    else if (g.id === 'apiary' && g.wall) {
      /* v215, req 1121: the bee-bole wall (its gate a gap) and the painted bee house; the hives and skeps are things, too
         small to tell from a window and two dozen draws more in every room if drawn here */
      var wr = g.wall.rect, gx = g.wall.gate ? g.wall.gate.x : null;
      (gx ? [[wr[0], wr[1], gx[0], wr[3]], [gx[1], wr[1], wr[2], wr[3]]] : [wr]).forEach(function (r) { prism(rect(r), LAWN, LAWN + g.wall.h, 'far-stone'); });
      if (g.bee_house) { var bh = g.bee_house; prism(rect(bh.rect), LAWN, LAWN + bh.eaves, 'far-timber'); roof(bh.rect, LAWN + bh.eaves, LAWN + bh.ridge, 'gable'); }
    }
    else if (g.id === 'hagrids-cabin' && s.point) { prism(circ(s.point, 3.5, 12), LAWN, LAWN + 3.5, 'far-timber'); cone(s.point, 3.6, LAWN + 3.5, LAWN + 7); }
    else if (g.id === 'vegetable-patch' && s.rect) flat(shape(rect(s.rect)), LAWN + 0.04, 'far-forest');
  });

  /* the castle: each mass by its roof's parts (a box to the eaves, the roof over it), the towers as drums and cones */
  (M.masses || []).forEach(function (m) {
    var r = m.roof;
    if (r == null) return;                                          /* the cellars */
    if (typeof r === 'number') { prism(rect(m.rect), BASE, r, 'far-stone'); return; }
    var parts = r.parts && r.parts.length ? r.parts : [r];
    if (!r.parts) prism(rect(m.rect), BASE, r.eaves, 'far-stone');
    parts.forEach(function (p) { prism(rect(p.rect), BASE, p.eaves, 'far-stone'); roof(p.rect, p.eaves, p.ridge, p.kind); });
    if (r.flat) prism(rect(r.flat.rect), BASE, r.flat.lead || r.flat.z, 'far-stone');
  });
  (M.towers || []).forEach(function (t) {
    if (!t.c || !t.r) return;
    var top = t.top || t.eaves || 40, low = /^7/.test(t.floors || '') ? 36.4 : BASE;
    prism(circ(t.c, t.r, 24), low, top, 'far-stone');
    if (t.ridge) cone(t.c, t.r, t.eaves, t.ridge);
    if (t.lantern) { prism(circ(t.lantern.c, t.lantern.r, 16), t.lantern.z, t.lantern.top, 'far-stone'); cone(t.lantern.c, t.lantern.r, t.lantern.top, t.lantern.ridge); }
    if (t.cap_house) { prism(rect(t.cap_house.rect), top, t.cap_house.eaves, 'far-stone'); roof(t.cap_house.rect, t.cap_house.eaves, t.cap_house.ridge, t.cap_house.kind); }
    if (t.turret) { prism(circ(t.turret.c, t.turret.r, 12), BASE, t.turret.cap || top, 'far-stone'); }
  });

  /* the castle's own windows, dark marks on its faces, so a court's far side reads as a wall of rooms, not a blank:
     each opening with a room and a sill on the nearest mass or tower face within 2.5 m, none on the place's own mass */
  var faces = [];
  (M.masses || []).forEach(function (m) {
    var r = m.roof; if (r == null) return;
    var top = typeof r === 'number' ? r : r.eaves || 40;
    [m.rect].concat(r.parts ? r.parts.map(function (p) { return p.rect; }) : []).forEach(function (q) {
      if (holds(rect(q), BASE, top)) return;
      [[q[0], q[1], q[2], q[1], 0, -1], [q[2], q[1], q[2], q[3], 1, 0], [q[2], q[3], q[0], q[3], 0, 1], [q[0], q[3], q[0], q[1], -1, 0]]
        .forEach(function (e) { faces.push({ a: [e[0], e[1]], b: [e[2], e[3]], n: [e[4], e[5]] }); });
    });
  });
  var drums = (M.towers || []).filter(function (t) { return t.c && t.r && !holds(circ(t.c, t.r, 24), BASE, t.top || t.eaves || 40); });
  (M.openings || []).forEach(function (o) {
    if (!o.room || o.sill == null || !o.at || !o.w || !o.h) return;
    var R0 = (M.rooms || []).filter(function (x) { return x.id === o.room; })[0], P;
    try { P = findPlace(M, o.room); } catch (e) { P = null; }
    if (!R0 || !P) return;
    var s = toSite(M, R0.group, o.at), best = null;
    faces.forEach(function (f) {
      var dx = f.b[0] - f.a[0], dy = f.b[1] - f.a[1], L = Math.hypot(dx, dy), t = ((s[0] - f.a[0]) * dx + (s[1] - f.a[1]) * dy) / (L * L);
      if (t < 0 || t > 1) return;
      var px = f.a[0] + dx * t, py = f.a[1] + dy * t, d = Math.hypot(s[0] - px, s[1] - py);
      if (d < 2.5 && (!best || d < best.d)) best = { d: d, p: [px, py], n: f.n };
    });
    drums.forEach(function (t) {
      var dx = s[0] - t.c[0], dy = s[1] - t.c[1], L = Math.hypot(dx, dy) || 1, d = Math.abs(L - t.r);
      if (d < 2.5 && (!best || d < best.d)) best = { d: d, p: [t.c[0] + dx / L * t.r, t.c[1] + dy / L * t.r], n: [dx / L, dy / L] };
    });
    if (!best) return;
    var cx0 = best.p[0] + best.n[0] * 0.06, cy0 = best.p[1] + best.n[1] * 0.06, ux = -best.n[1] * o.w / 2, uy = best.n[0] * o.w / 2;
    var z0 = P.floor + o.sill, z1 = z0 + o.h, a = V(cx0 - ux, cy0 - uy, z0), b = V(cx0 + ux, cy0 + uy, z0), c = V(cx0 + ux, cy0 + uy, z1), d = V(cx0 - ux, cy0 - uy, z1);
    var g = new THREE.BufferGeometry().setFromPoints([a, b, c, a, c, d]); g.computeVertexNormals();
    add(g, 'far-window').material.side = THREE.DoubleSide;
  });

  /* far hills, a ring of rounded silhouettes past the grounds, fixed by a sine (no random) */
  var hills = [], HN = 96;
  for (var i = 0; i <= HN; i++) {
    var t = i / HN * Math.PI * 2, h = 60 + 45 * Math.sin(t * 3 + 1) + 30 * Math.sin(t * 7 + 2) + 15 * Math.sin(t * 13);
    var a = V(60 + 1800 * Math.cos(t), 36 + 1800 * Math.sin(t), LAWN - 10), b = V(60 + 1800 * Math.cos(t), 36 + 1800 * Math.sin(t), LAWN + h);
    hills.push(a, b);
  }
  var hp = [];
  for (var i = 0; i < HN; i++) hp.push(hills[2 * i], hills[2 * i + 2], hills[2 * i + 3], hills[2 * i], hills[2 * i + 3], hills[2 * i + 1]);
  var hg = new THREE.BufferGeometry().setFromPoints(hp); hg.computeVertexNormals();
  add(hg, 'far-hills').material.side = THREE.DoubleSide;

  /* light: the day's sun from the south-west and its sky; the night's moon, low */
  var hemi = new THREE.HemisphereLight(0xffffff, 0x666655, 0.85), sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.copy(V(-400, -500, 600)); scene.add(hemi); scene.add(sun);
  var rt = new THREE.WebGLCubeRenderTarget(512, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  rt.texture.mapping = THREE.CubeRefractionMapping;
  var cam = new THREE.CubeCamera(0.5, 5000, rt);
  cam.position.set(0, EYE, 0); scene.add(cam);
  /* v84: in a shaft the cube at its lowest pane, 0.45 over its foot (H82's cleft is 54 m over the well's foot, which
     lies under the lake: from there the cleft showed the lake from below) */
  if (shaft) {
    var lo = Math.min.apply(null, panes.map(function (p) { p.geometry.computeBoundingBox(); return p.position.y + p.geometry.boundingBox.min.y; }));
    if (lo > EYE + 2) cam.position.y = lo + 0.45;
  }
  /* v71 (req 975 (c)): Phong, not Basic, so the line of sight is taken at each pixel; Basic takes it at the pane's four
     corners and blends between them, which stretched and shifted the view from close to the glass (the turbaned
     professor read as a tall sliver well off his place). Black, no shine, mixed wholly to the cube: lights do not touch it */
  var glass = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x000000, shininess: 0, envMap: rt.texture, refractionRatio: 1.0,
    combine: THREE.MixOperation, reflectivity: 1.0, side: THREE.DoubleSide });
  /* refract() at ratio 1 passes the line of sight straight on only when the normal faces him. Phong, two-sided, turns
     the normal to face him on a back face itself (v71), so the panes keep their own normals: turned in by hand as for
     Basic, a pane seen from its back was turned out again and mirrored the castle behind him */
  panes.forEach(function (p) { p.material = glass; });
  var mode = false;
  function draw(night) {
    mode = !!night;
    scene.background = hex(night ? 'sky-night' : 'sky-day').convertSRGBToLinear();
    hemi.intensity = night ? 0.12 : 0.85; sun.intensity = night ? 0.08 : 0.75;
    var w = scene.getObjectByName('far-water'); if (w) {   /* by night at Design's tone as it is seen, not dimmed to black by the night's light */
      w.material.color.copy(hex(night ? 'far-water-night' : 'far-water-day').convertSRGBToLinear());
      w.material.emissive.copy(night ? hex('far-water-night').convertSRGBToLinear() : new THREE.Color(0));
    }
    if (mats['far-window']) {   /* by night lit from within: the gold as its own light, so the dark around it cannot dim it */
      mats['far-window'].color.copy(hex(night ? 'far-window-night' : 'far-window').convertSRGBToLinear());
      mats['far-window'].emissive.copy(night ? hex('far-window-night').convertSRGBToLinear() : new THREE.Color(0));
    }
    var tm = F.renderer.toneMapping; F.renderer.toneMapping = THREE.NoToneMapping;
    cam.update(F.renderer, scene);
    F.renderer.toneMapping = tm;
  }
  /* drawn at build the cube leaves parts of some faces unwritten (the sky above the hills read black); drawn again on
     the first frame, by day or by night as the page has asked by then, it comes whole */
  draw(false);
  requestAnimationFrame(function () { draw(mode); });
  return { scene: scene, cube: rt, glass: glass, night: draw };
}
})();
