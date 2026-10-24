/* Mobiliarbus on the old examination hall's desks (req 1044, Interiors' docs/interiors/old-exam-hall.md, Godric's 1 at
   4.13 pm, 23 October 2026: "the desks can be mobilarus-ed out of the way?", Fawkes's yes; PoA 10 L17340, the tree
   "rose a few inches off the ground, drifted sideways and landed with a soft thump"). The Charms lane, forty-fourth
   session; the owner is Godric. Every desk and its bench is a target on its own, cast with Charms' moveThing
   (spells.js), once he has learned the spell in Charms.
   The squares (1044.1, option 1, Godric's at 10.07 pm, 23 October 2026, with the aisle: "We should allow the boys to
   move them into the aisle, or it will feel too prescribed"): one square per desk place.
   Across the hall nine columns: a strip against the west wall (x' 0 to 0.8, its middle 0.4), the six desk columns
   (x' 1.1, 2.4, 3.7, 6.3, 7.6, 8.9), the aisle (5.0) between them, and a strip against the east wall (9.6); down the
   hall sixteen rows of 1.2 m on the desk rows (y' 3.0 to 21.0). A desk slid into a wall square turns a quarter as it
   drifts, its seat to the wall, two to a square (y' its row's middle and 0.3 either side), so all 48 can stand
   aside, 32 a side; slid out again it turns back to face the dais. A desk square holds one desk. An aisle square
   (x' 4.3 to 5.7) holds one desk too, facing the dais, set down against the aisle's side it came from (its middle at
   x' 4.6 from the west, 5.4 from the east), so the way down the aisle's middle, where the places stand, stays 1.1 m
   clear to the door. What is in the way is judged at the square he names: another desk, the dais, the walls, the way
   to the door past the last row, or a spot where he stands (the places in the aisle among them). The words right and left, up and down are the
   way he faces when he taps: looking south to the dais, right is west and down is toward him (north). The desks stay
   where he puts them for the visit; a reload brings the rows back (the armchair's precedent, req 252).
   Nothing glows or says tap me: the squares show in faint chalk only while a desk is in the air or waiting for his
   stroke.
   CharmsDesks.forHall(THREE, opts) with opts {
     desks: the 48 groups in the shell's order (exam-desk-1 to -48, rows north from y' 12.6, columns as XS below),
     P: function (x', y', z) the hall's frame to the shell's local Vector3, the floor at z 0,
     camera, canvas: the renderer's canvas (its box is the screen),
     stands: optional [[x', y'], ...] where he can stand (Interaction's places, req 1047),
     known: optional function () true once he has learned Mobiliarbus (LumosSpells.learned('mobiliarbus') by default),
     onCast(result): optional, the spell's answer after the thump or the miss, for the room's line,
     onLook({ n, x, y }): optional, called as the spell starts with the point (x', y') midway between the desk and the
       wall square beside it in its row (an aisle desk: its own side's wall): the room turns his head there (no sideways turn past 90 degrees), since from
       the aisle a wall square is off the screen,
     wait, stray, exits: as moveThing's }
   Returns { tap(raycaster, nearest): true when the ray meets a desk before `nearest` and the spell starts,
             frame(): call each frame (the chalk's fade), state(), casting() }. */
(function (root) {
var XC = [0.4, 1.1, 2.4, 3.7, 5.0, 6.3, 7.6, 8.9, 9.6];   /* the columns' middles, x' west to east */
var DESK_X = [1.1, 2.4, 3.7, 6.3, 7.6, 8.9], ROW0 = 3.0, ROW = 1.2, ROWS = 16, AISLE = 4, STRIPS = [0, 8];
var HOME_ROW0 = 8;                                        /* y' 12.6 is row 8 */
var DAIS = [2.5, 7.5, 2.0], LIFT = 0.1, CHALK = 0.22;
function colOf(x) {   /* x' to a fractional column, linear between middles and past the ends */
  if (x <= XC[0]) return (x - XC[0]) / (XC[1] - XC[0]);
  for (var i = 1; i < XC.length; i++) if (x <= XC[i]) return i - 1 + (x - XC[i - 1]) / (XC[i] - XC[i - 1]);
  var n = XC.length - 1; return n + (x - XC[n]) / (XC[n] - XC[n - 1]);
}
function xOf(c) {
  if (c <= 0) return XC[0] + c * (XC[1] - XC[0]);
  var n = XC.length - 1;
  if (c >= n) return XC[n] + (c - n) * (XC[n] - XC[n - 1]);
  var i = Math.floor(c); return XC[i] + (c - i) * (XC[i + 1] - XC[i]);
}
function rowOf(y) { return (y - ROW0) / ROW; }
function yOf(r) { return ROW0 + r * ROW; }
function strip(c) { return c === STRIPS[0] ? -1 : (c === STRIPS[1] ? 1 : 0); }
var AISLE_X = [4.6, 5.4];                                 /* an aisle desk's middle, against the aisle's west or east side */
function forHall(THREE, opts) {
  var S = root.LumosSpells, P = opts.P, cam = opts.camera, cv = opts.canvas;
  var par = opts.desks[0].parent; par.updateMatrixWorld(true);
  function W(v) { return par.localToWorld(v); }   /* P is the desks' parent's frame; the screen and the floor's ray are the world's */
  var o = W(P(0, 0, 0)), ex = W(P(1, 0, 0)).sub(o), ey = W(P(0, 1, 0)).sub(o);
  var stands = opts.stands || [], known = opts.known || function () { return !!(S && S.learned('mobiliarbus')); };
  var D = opts.desks.map(function (g, i) {
    return { g: g, i: i, c: DESK_X.indexOf(DESK_X[i % 6]) + (i % 6 < 3 ? 1 : 2), r: HOME_ROW0 + Math.floor(i / 6), slot: 0,
      home: { x: DESK_X[i % 6], y: 12.6 + Math.floor(i / 6) * 1.2 }, at: null, turn: 0, up: 0 };
  });
  D.forEach(function (d) { d.at = { x: d.home.x, y: d.home.y }; d.g.matrixAutoUpdate = false; });
  var cast = null, chalk = 0, chalkTo = 0, chalkMesh = null, last = null;
  function hall(v) { var q = v.clone().sub(o); return { x: q.dot(ex) / ex.lengthSq(), y: q.dot(ey) / ey.lengthSq() }; }
  function screenOf(x, y, z) {
    var v = W(P(x, y, z || 0)).project(cam), b = cv.getBoundingClientRect();
    return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height };
  }
  function floorAt(p) {   /* a screen point to the floor, in the hall's frame */
    var b = cv.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((p.x - b.left) / b.width * 2 - 1, -((p.y - b.top) / b.height * 2 - 1)), cam);
    var n = new THREE.Vector3(0, 1, 0), d = ray.ray.direction.dot(n), t = d ? o.clone().sub(ray.ray.origin).dot(n) / d : -1;
    if (!(t > 0)) t = 200;   /* above the horizon: far along the floor's way */
    return hall(ray.ray.origin.clone().add(ray.ray.direction.clone().multiplyScalar(t)));
  }
  function place(d) {   /* the desk's group drawn where it stands: turned about its own middle, lifted */
    var h = d.home, m = new THREE.Matrix4(), c = P(h.x, h.y, 0), a = P(d.at.x, d.at.y, d.up);
    m.makeTranslation(a.x, a.y, a.z).multiply(new THREE.Matrix4().makeRotationY(d.turn)).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
    d.g.matrix.copy(m); d.g.matrixWorldNeedsUpdate = true;
  }
  function turnFor(c) { return -strip(c) * Math.PI / 2; }   /* west strip: seat to the west wall, facing east; east: facing west */
  function spotFor(c, r, slot) {
    if (c === AISLE) return { x: AISLE_X[slot ? 1 : 0], y: yOf(r) };
    var s = strip(c); return { x: XC[c], y: yOf(r) + (s ? (slot ? 0.3 : -0.3) : 0) };
  }
  function slotFor(c, r, d, fromC) {   /* a wall square's second place; an aisle square's side, the side it came from */
    if (c === AISLE) return fromC < AISLE ? 0 : (fromC > AISLE ? 1 : d.slot);
    var h = holders(c, r, d); return h.length ? 1 - h[0].slot : 0;
  }
  function holders(c, r, not) { return D.filter(function (d) { return d !== not && d.c === c && d.r === r; }); }
  function blockedAt(d, c, r) {
    if (c < 0 || c > 8) return 'the wall';
    if (r > ROWS - 1) return 'the way to the door';
    if (r < 0) { var x = XC[c]; return x > DAIS[0] - 0.3 && x < DAIS[1] + 0.3 ? 'the dais' : 'the wall'; }
    var held = holders(c, r, d);
    if (held.length >= (strip(c) ? 2 : 1)) return held.length > 1 ? 'two desks there already' : 'the desk there';
    var s = spotFor(c, r, 0), hw = strip(c) ? 0.4 : 0.3, hd = strip(c) ? 0.6 : 0.4;
    for (var i = 0; i < stands.length; i++) if (Math.abs(stands[i][0] - s.x) < hw + 0.45 && Math.abs(stands[i][1] - s.y) < hd + 0.45) return 'the spot where you stand';
    return null;
  }
  function chalkLines() {   /* the squares in faint chalk, built once */
    var pts = [], z = 0.012, y0 = yOf(0) - ROW / 2, y1 = yOf(ROWS - 1) + ROW / 2, k;
    var edges = [0]; for (k = 0; k < XC.length - 1; k++) edges.push((XC[k] + XC[k + 1]) / 2); edges.push(10);
    edges.forEach(function (x) { pts.push(P(x, y0, z), P(x, y1, z)); });
    for (k = 0; k <= ROWS; k++) { var y = y0 + k * ROW; pts.push(P(0, y, z), P(10, y, z)); }
    var g = new THREE.BufferGeometry().setFromPoints(pts);
    var m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xe8e2d0, transparent: true, opacity: 0, depthWrite: false }));
    m.name = 'exam-desk-chalk'; m.userData.owner = 'old-exam-hall'; m.raycast = function () {}; m.visible = false;
    par.add(m); return m;
  }
  function deskBox(d) { d.g.updateMatrixWorld(true); return new THREE.Box3().setFromObject(d.g); }
  function onDeskScreen(d) {   /* the desk's box on the screen, for a stroke begun anywhere on it (req 256) */
    var b = deskBox(d), xs = [], ys = [];
    [b.min.x, b.max.x].forEach(function (x) { [b.min.y, b.max.y].forEach(function (y) { [b.min.z, b.max.z].forEach(function (z) {
      var v = new THREE.Vector3(x, y, z).project(cam), r = cv.getBoundingClientRect();
      xs.push(r.left + (v.x + 1) / 2 * r.width); ys.push(r.top + (1 - v.y) / 2 * r.height);
    }); }); });
    return { x0: Math.min.apply(0, xs), x1: Math.max.apply(0, xs), y0: Math.min.apply(0, ys), y1: Math.max.apply(0, ys) };
  }
  function start(d) {
    if (!chalkMesh) chalkMesh = chalkLines();
    if (opts.onLook) {   /* the room turns his head to bring the desk and the wall square beside it into view */
      var w = d.c < AISLE || (d.c === AISLE && !d.slot) ? 0 : 8, s0 = spotFor(d.c, d.r, d.slot);
      opts.onLook({ n: d.i + 1, x: strip(d.c) ? s0.x : (s0.x + XC[w]) / 2, y: s0.y });
    }
    var look = new THREE.Vector3(); cam.getWorldDirection(look);
    var south = hall(o.clone().add(look)), fs = south.y < 0 ? 1 : -1;   /* looking south, right is west (fs 1) */
    var floor = {   /* his squares: x along his right, y toward him */
      toSquares: function (p) { var h = floorAt(p); return { x: -fs * colOf(h.x), y: fs * rowOf(h.y) }; },
      toScreen: function (q) { return screenOf(xOf(-fs * q.x), yOf(fs * q.y), 0); }
    };
    var from = { c: d.c, r: d.r, at: { x: d.at.x, y: d.at.y }, turn: d.turn }, to = null;
    chalkTo = 1;
    var a = cast = S.moveThing({
      at: function () { return screenOf(XC[d.c], yOf(d.r), 0); },
      floor: floor, word: true, wait: opts.wait, stray: opts.stray, exits: opts.exits,
      onPiece: function (p) { var b = onDeskScreen(d); return p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1; },
      blocked: function (dx, dy) { return blockedAt(d, from.c - fs * dx, from.r + fs * dy); },
      onDrift: function (p) {
        if (!to) { var c = from.c - fs * p.dx, r = from.r + fs * p.dy; to = { c: c, r: r, slot: slotFor(c, r, d, from.c) }; }
        var h = floorAt(p), end = spotFor(to.c, to.r, to.slot), mid = { x: xOf(to.c), y: yOf(to.r) };
        d.at.x = h.x + (end.x - mid.x) * p.k + (from.at.x - xOf(from.c)) * (1 - p.k);
        d.at.y = h.y + (end.y - mid.y) * p.k + (from.at.y - yOf(from.r)) * (1 - p.k);
        d.turn = from.turn + (turnFor(to.c) - from.turn) * p.k; d.up = LIFT * p.lift; place(d);
      },
      onThump: function () {
        d.c = to.c; d.r = to.r; d.slot = to.slot; d.at = spotFor(to.c, to.r, to.slot); d.turn = turnFor(to.c); d.up = 0; place(d);
      }
    });
    a.tap();
    a.done.then(function (r) {
      if (!r || r.verdict !== 'moved') { d.c = from.c; d.r = from.r; d.at = from.at; d.turn = from.turn; d.up = 0; place(d); }
      cast = null; chalkTo = 0; last = r ? { desk: d.i + 1, verdict: r.verdict, what: r.what || null, dx: r.dx, dy: r.dy } : null;
      if (opts.onCast) opts.onCast(r, d.i + 1);
    });
    return a;
  }
  return {
    tap: function (raycaster, nearest) {
      if (cast || !known()) return false;
      var best = null, bd = nearest == null ? Infinity : nearest + 0.05, hit = new THREE.Vector3();
      D.forEach(function (d) { if (raycaster.ray.intersectBox(deskBox(d), hit)) { var t = hit.distanceTo(raycaster.ray.origin); if (t < bd) { bd = t; best = d; } } });
      if (!best) return false;
      start(best); return true;
    },
    frame: function (dt) {
      chalk = chalkTo ? Math.min(1, chalk + (dt || 0.016) / 0.35) : Math.max(0, chalk - (dt || 0.016) / 0.6);
      if (chalkMesh) { chalkMesh.visible = chalk > 0; chalkMesh.material.opacity = CHALK * chalk; }
    },
    casting: function () { return cast; },
    start: function (n) { return cast ? null : start(D[n - 1]); },   /* for checks: the spell on desk n, as if tapped */
    screenOf: screenOf, floorAt: floorAt, blockedAt: function (n, c, r) { return blockedAt(D[n - 1], c, r); },
    state: function () {
      return { casting: !!cast, last: last, desks: D.map(function (d) { return { n: d.i + 1, c: d.c, r: d.r, slot: d.slot, x: +d.at.x.toFixed(2), y: +d.at.y.toFixed(2), turn: +d.turn.toFixed(2) }; }),
        aside: D.filter(function (d) { return strip(d.c); }).length };
    }
  };
}
root.CharmsDesks = { forHall: forHall, colOf: colOf, xOf: xOf, XC: XC, ROWS: ROWS };
})(typeof window !== 'undefined' ? window : this);
