/* The Mobiliarbus judging, tallied in node: node page/charms/checks/mobiliarbus-tally.js
   Loads page/charms/spells.js and runs drawn slides through judgeSlide at a phone and an iPad size and every ease, with
   the square the test page draws at each (61 px at 390 x 844, 86 px at 1180 x 820), each shape marked with what it is
   meant to be at kind, fair and strict: a slide and its move in whole squares, or the miss's reason. Prints each miss
   of meaning and the count.
   Then two moves add up (addMoves): sums on the squares, either order, a wrong slide never wasted. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* a stroke from the tree's centre (offset by off, in squares), dx and dy squares long; bow bends it into a curve
   (the bulge at its middle, as a share of its length), wob trembles it sideways (a share of a square, three half
   waves), back runs it on past the end and back again (squares) */
function stroke(at, cell, dx, dy, o) {
  o = o || {};
  var off = o.off || [0, 0], a = { x: at.x + off[0] * cell, y: at.y + off[1] * cell }, n = 30, out = [], L = Math.hypot(dx, dy) || 1;
  var nx = -dy / L, ny = dx / L, i, k, w;
  for (i = 0; i <= n; i++) {
    k = i / n; w = (o.bow || 0) * L * 4 * k * (1 - k) + (o.wob || 0) * Math.sin(k * Math.PI * 3);
    out.push({ x: a.x + (dx * k + nx * w) * cell, y: a.y + (dy * k + ny * w) * cell, t: i * 20 });
  }
  if (o.back) {   /* on past the end and back */
    var e = out[out.length - 1], ux = dx / L, uy = dy / L;
    for (i = 1; i <= 10; i++) out.push({ x: e.x + ux * o.back * cell * Math.sin(i / 10 * Math.PI), y: e.y + uy * o.back * cell * Math.sin(i / 10 * Math.PI), t: 600 + i * 20 });
  }
  return out;
}
/* an L along the squares: dx across, then dy down */
function ell(at, cell, dx, dy) {
  var out = [], i;
  for (i = 0; i <= 15; i++) out.push({ x: at.x + dx * cell * i / 15, y: at.y, t: i * 20 });
  for (i = 1; i <= 15; i++) out.push({ x: at.x + dx * cell, y: at.y + dy * cell * i / 15, t: 300 + i * 20 });
  return out;
}
var ALL = 'slide';
/* [name, points(at, cell), meant at kind, fair, strict ('slide' or a miss's reason), the move for a slide] */
var CASES = [
  ['3 right', function (a, c) { return stroke(a, c, 3, 0); }, [ALL, ALL, ALL], [3, 0]],
  ['2 left', function (a, c) { return stroke(a, c, -2, 0); }, [ALL, ALL, ALL], [-2, 0]],
  ['4 down', function (a, c) { return stroke(a, c, 0, 4); }, [ALL, ALL, ALL], [0, 4]],
  ['1 up', function (a, c) { return stroke(a, c, 0, -1); }, [ALL, ALL, ALL], [0, -1]],
  ['1 right, the smallest move', function (a, c) { return stroke(a, c, 1, 0); }, [ALL, ALL, ALL], [1, 0]],
  ['5 right, a long one', function (a, c) { return stroke(a, c, 5, 0); }, [ALL, ALL, ALL], [5, 0]],
  ['a slant, 1 left and 3 up (round 2, tall)', function (a, c) { return stroke(a, c, -1, -3); }, [ALL, ALL, ALL], [-1, -3]],
  ['a slant, 3 right and 2 down (the hiding, tall)', function (a, c) { return stroke(a, c, 3, 2); }, [ALL, ALL, ALL], [3, 2]],
  ['a slant, 2 right and 2 up', function (a, c) { return stroke(a, c, 2, -2); }, [ALL, ALL, ALL], [2, -2]],
  ['a slant, 4 left and 1 down', function (a, c) { return stroke(a, c, -4, 1); }, [ALL, ALL, ALL], [-4, 1]],
  ['a slant a little long, 2.15 right and 1.2 down', function (a, c) { return stroke(a, c, 2.15, 1.2); }, [ALL, ALL, ALL], [2, 1]],
  ['started a third of a square off the middle', function (a, c) { return stroke(a, c, 3, 0, { off: [0.3, -0.2] }); }, [ALL, ALL, ALL], [3, 0]],
  ['started at the tree\'s edge, 0.7 off', function (a, c) { return stroke(a, c, 3, 0, { off: [-0.7, 0] }); }, [ALL, ALL, 'off'], [3, 0]],
  ['started at its corner, 0.85 off', function (a, c) { return stroke(a, c, 3, 0, { off: [-0.6, -0.6] }); }, [ALL, 'off', 'off'], [3, 0]],
  ['started a square away', function (a, c) { return stroke(a, c, 3, 0, { off: [-1.1, 0] }); }, ['off', 'off', 'off']],
  ['started two squares away', function (a, c) { return stroke(a, c, 2, 1, { off: [0, 2] }); }, ['off', 'off', 'off']],
  ['a trembling line, a twentieth of a square', function (a, c) { return stroke(a, c, 3, 0, { wob: 0.05 }); }, [ALL, ALL, ALL], [3, 0]],
  ['a slightly bowed line (a tenth)', function (a, c) { return stroke(a, c, 3, 0, { bow: 0.1 }); }, [ALL, ALL, ALL], [3, 0]],
  ['a bowed line (a fifth)', function (a, c) { return stroke(a, c, 3, 0, { bow: 0.2 }); }, [ALL, ALL, 'wiggly'], [3, 0]],
  ['a curved line (a quarter and more)', function (a, c) { return stroke(a, c, 3, 1, { bow: 0.27 }); }, [ALL, 'wiggly', 'wiggly'], [3, 1]],
  ['an arc (two fifths)', function (a, c) { return stroke(a, c, 3, 0, { bow: 0.4 }); }, ['wiggly', 'wiggly', 'wiggly']],
  ['a wobbly line, a fifth of a square', function (a, c) { return stroke(a, c, 2, 0, { wob: 0.2 }); }, [ALL, 'wiggly', 'wiggly'], [2, 0]],
  ['a scribble, half a square each way', function (a, c) { return stroke(a, c, 2, 0, { wob: 0.5 }); }, ['wiggly', 'wiggly', 'wiggly']],
  ['along the squares, 3 across then 2 down (an L; a slide since Q6, 6.3)', function (a, c) { return ell(a, c, 3, 2); }, [ALL, ALL, ALL], [3, 2]],
  ['on past the end and back a square', function (a, c) { return stroke(a, c, 2, 0, { back: 1 }); }, ['wiggly', 'wiggly', 'wiggly']],
  ['a nudge, a third of a square', function (a, c) { return stroke(a, c, 0.33, 0); }, ['short', 'short', 'short']],
  ['not quite half a square', function (a, c) { return stroke(a, c, 0.45, 0.1); }, ['short', 'short', 'short']],
  ['between squares, 2.45 right', function (a, c) { return stroke(a, c, 2.45, 0); }, [ALL, 'between', 'between'], [2, 0]],
  ['nearly between, 2.35 right', function (a, c) { return stroke(a, c, 2.35, 0); }, [ALL, ALL, 'between'], [2, 0]],
  ['a little short, 2.8 down', function (a, c) { return stroke(a, c, 0, 2.8); }, [ALL, ALL, ALL], [0, 3]],
  ['a slant between, 1.45 right and 1.6 up', function (a, c) { return stroke(a, c, 1.45, -1.6); }, [ALL, 'between', 'between'], [1, -2]],
  ['a tap on the tree', function (a, c) { return [{ x: a.x, y: a.y, t: 0 }, { x: a.x + 2, y: a.y + 1, t: 80 }]; }, ['tap', 'tap', 'tap']],
  ['one point only', function (a, c) { return [{ x: a.x, y: a.y, t: 0 }]; }, ['tap', 'tap', 'tap']]
];
var sizes = [[390, 844, 61], [1180, 820, 86]], eases = ['kind', 'fair', 'strict'], ok = 0, all = 0;
sizes.forEach(function (sz) {
  var cell = sz[2], at = { x: sz[0] * 0.3, y: sz[1] * 0.4 };
  CASES.forEach(function (k) {
    var pts = k[1](at, cell);
    eases.forEach(function (e, ei) {
      var j = S.judgeSlide(pts, at, cell, e), meant = k[2][ei];
      var good = meant === ALL ? j.verdict === 'slide' && j.dx === k[3][0] && j.dy === k[3][1] : j.verdict === 'miss' && j.reason === meant;
      all++; if (good) ok++;
      else console.log('MISS ' + sz[0] + 'x' + sz[1] + ' ' + e + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason + ', ' + j.dx + ',' + j.dy +
        ', straight ' + j.straight.toFixed(3) + ', ' + j.fx.toFixed(2) + ',' + j.fy.toFixed(2) + '), meant ' + meant + (k[3] ? ' ' + k[3] : ''));
    });
  });
});
console.log(ok + ' of ' + all + ' as meant');

/* The L along the squares (Q6, 6.3, Godric, 13 October 2026, 7.11 am; twenty-fourth session): legs is a list of
   [dx, dy] legs in squares, drawn in turn from the tree; tilt turns both legs of an L that many degrees off the squares
   with its end kept (the corner drawn in toward the slant, as a hand lazily cuts it), wob trembles each leg sideways (a share of a square), round rounds each corner
   (a share of a square cut from either side of it), off starts it off the middle (squares). Meant: a slide, its move
   and the shape ('L' or 'line') and, for an L, its legs in his order; or the miss's reason. */
function legs(at, cell, list, o) {
  o = o || {};
  var off = o.off || [0, 0], x = at.x + off[0] * cell, y = at.y + off[1] * cell, out = [{ x: x, y: y, t: 0 }], t = 0, corners = [];
  if (o.tilt && list.length === 2) {   /* both legs tilt t: the corner c along the first axis A' = (A - B t) / (1 - t^2), across it A' t */
    var A = Math.hypot(list[0][0], list[0][1]), B = Math.hypot(list[1][0], list[1][1]), tt = Math.tan(o.tilt * Math.PI / 180);
    var u = [list[0][0] / A, list[0][1] / A], v = [list[1][0] / B, list[1][1] / B], ca = (A - B * tt) / (1 - tt * tt), cb = ca * tt;
    var c = [u[0] * ca + v[0] * cb, u[1] * ca + v[1] * cb], end = [list[0][0] + list[1][0], list[0][1] + list[1][1]];
    list = [c, [end[0] - c[0], end[1] - c[1]]];
  }
  list.forEach(function (L, li) {
    var len = Math.hypot(L[0], L[1]), ang = Math.atan2(L[1], L[0]);
    var ux = Math.cos(ang), uy = Math.sin(ang), n = 20, i, k, w;
    for (i = 1; i <= n; i++) {
      k = i / n; w = (o.wob || 0) * Math.sin(k * Math.PI * 3);
      out.push({ x: x + (ux * len * k - uy * w) * cell, y: y + (uy * len * k + ux * w) * cell, t: (t += 20) });
    }
    x += ux * len * cell; y += uy * len * cell; corners.push(out.length - 1);
  });
  if (o.round) {   /* cut each inner corner: the points within round squares of it move onto the chord across it */
    corners.slice(0, -1).forEach(function (ci) {
      var c = out[ci], r = o.round * cell, i0 = ci, i1 = ci;
      while (i0 > 0 && Math.hypot(out[i0 - 1].x - c.x, out[i0 - 1].y - c.y) <= r) i0--;
      while (i1 < out.length - 1 && Math.hypot(out[i1 + 1].x - c.x, out[i1 + 1].y - c.y) <= r) i1++;
      var p = out[i0], q = out[i1], m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      for (var j = i0 + 1; j < i1; j++) { var k2 = (j - i0) / (i1 - i0), b = 4 * k2 * (1 - k2) * 0.4;   /* a soft curve, bulging a little toward the corner */
        out[j] = { x: p.x + (q.x - p.x) * k2 + (c.x - m.x) * b, y: p.y + (q.y - p.y) * k2 + (c.y - m.y) * b, t: out[j].t }; }
    });
  }
  return out;
}
var Lw = 'L', Ln = 'line';
/* [name, legs, options, meant at kind, fair, strict (the shape for a slide, or a miss's reason), the move, his legs (for an L)] */
var ELLS = [
  ['3 right then 2 down', [[3, 0], [0, 2]], {}, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['2 down then 3 right', [[0, 2], [3, 0]], {}, [Lw, Lw, Lw], [3, 2], [[0, 2], [3, 0]]],
  ['1 left then 3 up (round 2, tall)', [[-1, 0], [0, -3]], {}, [Lw, Lw, Lw], [-1, -3], [[-1, 0], [0, -3]]],
  ['3 up then 1 left', [[0, -3], [-1, 0]], {}, [Lw, Lw, Lw], [-1, -3], [[0, -3], [-1, 0]]],
  ['1 left then 2 up (round 2, wide)', [[-1, 0], [0, -2]], {}, [Lw, Lw, Lw], [-1, -2], [[-1, 0], [0, -2]]],
  ['4 right then 1 up', [[4, 0], [0, -1]], {}, [Lw, Lw, Lw], [4, -1], [[4, 0], [0, -1]]],
  ['1 right then 1 down, the smallest L', [[1, 0], [0, 1]], {}, [Lw, Lw, Lw], [1, 1], [[1, 0], [0, 1]]],
  ['5 right then 4 down, a long one', [[5, 0], [0, 4]], {}, [Lw, Lw, Lw], [5, 4], [[5, 0], [0, 4]]],
  ['an L started a third off the middle', [[3, 0], [0, 2]], { off: [0.3, -0.2] }, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['an L started a square away', [[3, 0], [0, 2]], { off: [-1.1, 0] }, ['off', 'off', 'off']],
  ['trembling legs, a twentieth of a square', [[3, 0], [0, 2]], { wob: 0.05 }, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['legs 8 degrees off the squares', [[3, 0], [0, 2]], { tilt: 8 }, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['legs 13 degrees off', [[3, 0], [0, 2]], { tilt: 13 }, [Lw, Lw, 'wiggly'], [3, 2], [[3, 0], [0, 2]]],
  ['legs 18 degrees off: an L at kind, at fair a bent line straight enough', [[3, 0], [0, 2]], { tilt: 18 }, [Lw, Ln, 'wiggly'], [3, 2], [[3, 0], [0, 2]]],
  ['legs 25 degrees off: no longer an L, a slant bent a little', [[3, 0], [0, 2]], { tilt: 25 }, [Ln, Ln, Ln], [3, 2]],
  ['a rounded corner, a fifth of a square', [[3, 0], [0, 2]], { round: 0.2 }, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['a rounded corner, half a square', [[3, 0], [0, 2]], { round: 0.5 }, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['a wobbly L, a fifth of a square (as a wobbly line: kind only)', [[3, 0], [0, 2]], { wob: 0.2 }, [Lw, 'wiggly', 'wiggly'], [3, 2], [[3, 0], [0, 2]]],
  ['a hook: a third across, then 3 down', [[0.33, 0], [0, 3]], {}, [Ln, Ln, 'wiggly'], [0, 3]],
  ['a short second leg: 3 right, then 0.6 down', [[3, 0], [0, 0.6]], {}, [Lw, Lw, 'between'], [3, 1], [[3, 0], [0, 1]]],
  ['an L ending between squares, 2.45 right then 2 down', [[2.45, 0], [0, 2]], {}, [Lw, 'between', 'between'], [2, 2], [[2, 0], [0, 2]]],
  ['an L a little short, 2.8 right then 1.85 down', [[2.8, 0], [0, 1.85]], {}, [Lw, Lw, Lw], [3, 2], [[3, 0], [0, 2]]],
  ['three legs, a step: 1 right, 2 down, 1 right', [[1, 0], [0, 2], [1, 0]], {}, ['wiggly', 'wiggly', 'wiggly']],
  ['a staircase: right, down, right, down', [[1, 0], [0, 1], [1, 0], [0, 1]], {}, ['wiggly', 'wiggly', 'wiggly']],
  ['back on itself: 3 right then 2 left', [[3, 0], [-2, 0]], {}, ['wiggly', 'wiggly', 'wiggly']],
  ['a U: 2 down, 2 right, 2 up', [[0, 2], [2, 0], [0, -2]], {}, ['wiggly', 'wiggly', 'wiggly']]
];
var lOk = 0, lAll = 0;
sizes.forEach(function (sz) {
  var cell = sz[2], at = { x: sz[0] * 0.3, y: sz[1] * 0.4 };
  ELLS.forEach(function (k) {
    var pts = legs(at, cell, k[1], k[2]);
    eases.forEach(function (e, ei) {
      var j = S.judgeSlide(pts, at, cell, e), meant = k[3][ei], good;
      if (meant === Lw || meant === Ln) good = j.verdict === 'slide' && j.shape === meant && j.dx === k[4][0] && j.dy === k[4][1] &&
        (meant === Ln || JSON.stringify(j.legs) === JSON.stringify(k[5]));
      else good = j.verdict === 'miss' && j.reason === meant;
      lAll++; if (good) lOk++;
      else console.log('L MISS ' + sz[0] + 'x' + sz[1] + ' ' + e + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason + ', ' + j.shape + ', ' + j.dx + ',' + j.dy +
        ', legs ' + JSON.stringify(j.legs || null) + ', legOff ' + JSON.stringify(j.legOff || null) + ', straight ' + j.straight.toFixed(3) + '), meant ' + meant);
    });
  });
});
console.log('L: ' + lOk + ' of ' + lAll + ' as meant');

/* Req 256 (the Common room, 13 October 2026): a start on the piece is its own square. A room drawn in perspective,
   as the common room's: the eye 1.25 m up looking level, the chair's square 3.6 m off, squares 1.05 m (the room's
   ARMCHAIR_MOVE.sq), the chair 0.9 m wide and its back 0.9 m high. Each stroke begins on the chair at a height (its
   foot, a cushion, the seat, the back) and ends on the floor at the square meant, through slideFromPiece with the
   room's own hit for the piece: a line, an L whose first leg runs at the chair's height (across, then down to the
   floor), an L down to the floor first (then along it), each a little trembled; and the misses: wiggly, between,
   a little drag that never leaves the chair (short, never read as the floor behind it), and a start beside the chair
   (off). Marked at kind, fair and strict. */
var seatOk = 0, seatAll = 0;
[[390, 844], [1180, 820]].forEach(function (sz) {
  var W = sz[0], H = sz[1], f = H / (2 * Math.tan(Math.PI / 6)), y0 = H * 0.3, eye = 1.25, Z0 = 3.6, X0 = 0, SQ = 1.05;
  function scr(X, Y, Z) { return { x: W / 2 + f * X / Z, y: y0 + f * (eye - Y) / Z }; }
  function toSq(p) { var Z = p.y > y0 + 1 ? f * eye / (p.y - y0) : 60; Z = Math.min(60, Z); return { x: (p.x - W / 2) * Z / f / SQ, y: (Z0 - Z) / SQ }; }
  function floorAt(dx, dy) { return scr(X0 + dx * SQ, 0, Z0 - dy * SQ); }
  var foot = floorAt(0, 0), lo = scr(X0 - 0.45, 0, Z0), hi = scr(X0 + 0.45, 0.9, Z0);
  function onChair(p) { return p.x >= lo.x && p.x <= hi.x && p.y >= hi.y && p.y <= lo.y; }   /* the room's own hit */
  function run(ps, n, wob) {   /* straight runs through the points, trembled sideways by wob px, 12 ms a sample */
    var out = [], t = 0;
    for (var k = 0; k < ps.length - 1; k++) {
      var a = ps[k], b = ps[k + 1], L = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
      for (var i = k ? 1 : 0; i <= n; i++) {
        var u = i / n, w = (wob || 0) * Math.sin(u * Math.PI * 3);
        out.push({ x: a.x + (b.x - a.x) * u + nx * w, y: a.y + (b.y - a.y) * u + ny * w, t: (t += 12) });
      }
    }
    return out;
  }
  var HEIGHTS = [['its foot', 0.02], ['a cushion', 0.25], ['the seat', 0.45], ['the back', 0.8]];
  var MOVES = [[3, 0], [-2, 0], [0, 2], [2, 1], [-1, 2], [1, -1], [-2, 1]];
  var cases = [];
  HEIGHTS.forEach(function (h) {
    var s = scr(X0 + 0.1, h[1], Z0);
    MOVES.forEach(function (m) {
      cases.push(['a line from ' + h[0] + ' to ' + m, run([s, floorAt(m[0], m[1])], 30, 1.5), [m, m, m], 'line']);
      if (m[0] && m[1]) {
        cases.push(['an L from ' + h[0] + ', across at its height, then to ' + m, run([s, scr(X0 + m[0] * SQ + 0.1, h[1], Z0), floorAt(m[0], m[1])], 25, 1.2), [m, m, m], 'L']);
        cases.push(['an L from ' + h[0] + ', down to the floor first, then to ' + m, run([s, floorAt(0, m[1]), floorAt(m[0], m[1])], 25, 1.2), [m, m, m], m[1] < 0 ? null : 'L']);   /* to a square behind, the first leg runs up into the chair's own picture, a few px: the move, either shape */
      }
    });
  });
  var seat = scr(X0 + 0.1, 0.45, Z0);
  cases.push(['a bowed stroke from the seat to [3,0]', (function () { var e = floorAt(3, 0), out = [], i; for (i = 0; i <= 40; i++) { var u = i / 40, b = Math.sin(u * Math.PI) * 0.35 * Math.hypot(e.x - seat.x, e.y - seat.y); out.push({ x: seat.x + (e.x - seat.x) * u, y: seat.y + (e.y - seat.y) * u - b, t: i * 12 }); } return out; })(), ['wiggly', 'wiggly', 'wiggly']]);
  cases.push(['a line from the seat ending 2.4 squares right', run([seat, floorAt(2.4, 0)], 30), [[2, 0], [2, 0], 'between']]);
  cases.push(['a little drag on the seat, never leaving the chair', run([seat, { x: seat.x + (hi.x - lo.x) * 0.3, y: seat.y }], 12), ['short', 'short', 'short']]);
  cases.push(['a line begun beside the chair, 1.5 squares left of it, to [-2,0]', run([floorAt(-1.5, 0), floorAt(-3.5, 0)], 30), ['off', 'off', 'off']]);
  cases.forEach(function (k) {
    ['kind', 'fair', 'strict'].forEach(function (e, ei) {
      var j = S.slideFromPiece(k[1], foot, toSq, e, onChair), meant = k[2][ei], good;
      if (Array.isArray(meant)) good = j.verdict === 'slide' && j.dx === meant[0] && j.dy === meant[1] && (!k[3] || j.shape === k[3]);
      else good = j.verdict === 'miss' && j.reason === meant;
      seatAll++; if (good) seatOk++;
      else console.log('SEAT MISS ' + W + 'x' + H + ' ' + e + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason + ', ' + j.shape + ', ' + j.dx + ',' + j.dy +
        ', pinned ' + j.pinned + ', legOff ' + JSON.stringify(j.legOff || null) + ', straight ' + j.straight.toFixed(3) + '), meant ' + JSON.stringify(meant) + (k[3] ? ' ' + k[3] : ''));
    });
  });
});
console.log('seat: ' + seatOk + ' of ' + seatAll + ' as meant');

/* Two moves add up (8.1, thirty-first session, 13 October 2026): moves drawn one after another, each judged by
   judgeSlide from the square the last one landed on, at both sizes and every ease, drawn as a line, a trembling line,
   a slightly bowed one, one started off the middle, or an L along the squares; their sum by addMoves is the move told
   and the one stroke drawn straight to it is judged the same move; the other order lands on the same square; a wrong
   first slide and the "From here" rest add up to the move he wanted; three moves in any order land the same. */
var sumOk = 0, sumAll = 0, sumBad = [];
function sumCheck(name, ok, detail) { sumAll++; if (ok) sumOk++; else sumBad.push('SUM MISS ' + name + (detail ? ': ' + detail : '')); }
var DRAWN = [
  ['a line', function (a, c, m) { return stroke(a, c, m[0], m[1]); }],
  ['a trembling line', function (a, c, m) { return stroke(a, c, m[0], m[1], { wob: 0.05 }); }],
  ['a slightly bowed line', function (a, c, m) { return stroke(a, c, m[0], m[1], { bow: 0.1 }); }],
  ['a line started off the middle', function (a, c, m) { return stroke(a, c, m[0], m[1], { off: [0.25, -0.2] }); }],
  ['an L along the squares', function (a, c, m) { return m[0] && m[1] ? ell(a, c, m[0], m[1]) : stroke(a, c, m[0], m[1]); }]
];
/* [first, second]: the round's own (2 right and 1 down, then 3 left and 1 down), a right undone by a left, an L made of
   two moves, a slant then across, back where it began, the same move twice, a long one, down then a slant up */
var PAIRS = [[[2, 1], [-3, 1]], [[1, 0], [-2, 2]], [[3, 0], [0, 2]], [[-1, -3], [2, 0]], [[2, -2], [-2, 2]], [[1, 2], [1, 2]], [[-4, 1], [1, -1]], [[0, 3], [2, -1]]];
/* [told, the wrong first slide]: short of it, the wrong way across, only its across leg, past it */
var WRONG = [[[3, 0], [2, 0]], [[-1, 2], [1, 2]], [[3, 2], [3, 0]], [[0, -2], [0, -3]]];
var THREES = [[[1, 0], [1, 1], [1, -1]], [[-2, 1], [3, 0], [0, -2]]];
function same(p, q) { return p[0] === q[0] && p[1] === q[1]; }
sizes.forEach(function (sz) {
  var cell = sz[2], at0 = { x: sz[0] * 0.3, y: sz[1] * 0.4 };
  /* judge a run of moves from at0, drawn in turn by the styles given; returns the judged moves, or the first miss */
  function run(list, styles, ease) {
    var at = { x: at0.x, y: at0.y }, got = [], k, j;
    for (k = 0; k < list.length; k++) {
      j = S.judgeSlide(DRAWN[styles[k] % DRAWN.length][1](at, cell, list[k]), at, cell, ease);
      if (j.verdict !== 'slide') return { miss: j.reason + ' on move ' + (k + 1) };
      got.push([j.dx, j.dy]); at = { x: at.x + j.dx * cell, y: at.y + j.dy * cell };
    }
    return { moves: got };
  }
  eases.forEach(function (e) {
    var tag = sz[0] + 'x' + sz[1] + ' ' + e + ' ';
    PAIRS.forEach(function (p) {
      var told = [p[0][0] + p[1][0], p[0][1] + p[1][1]];
      DRAWN.forEach(function (d, i) {
        var name = tag + JSON.stringify(p) + ' drawn ' + d[0] + ' then ' + DRAWN[(i + 1) % DRAWN.length][0];
        var r = run(p, [i, i + 1], e);
        if (r.miss) return sumCheck(name, false, r.miss);
        var A = S.addMoves(r.moves), end = A.path[A.path.length - 1];
        sumCheck(name + ', each judged as told', same(r.moves[0], p[0]) && same(r.moves[1], p[1]), JSON.stringify(r.moves));
        sumCheck(name + ', the sum is the two added, end to end', same(A.sum, told) && same(end, told) && A.across[0] + A.across[1] === told[0] && A.down[0] + A.down[1] === told[1], JSON.stringify(A));
        var o = run([p[1], p[0]], [i + 1, i], e);
        if (o.miss) return sumCheck(name + ', the other order', false, o.miss);
        var B = S.addMoves(o.moves);
        sumCheck(name + ', the other order lands on the same square', same(B.sum, A.sum) && A.swapped && same(A.swapped, p[1]) && same(B.path[1], A.swapped), JSON.stringify(B));
      });
      /* the one stroke straight to the sum, judged the same move (back where it began: no move at all) */
      var line = S.judgeSlide(stroke(at0, cell, told[0], told[1]), at0, cell, e);
      sumCheck(tag + JSON.stringify(p) + ', one line straight to the sum', told[0] || told[1] ? line.verdict === 'slide' && line.dx === told[0] && line.dy === told[1] : line.verdict === 'miss',
        line.verdict + ' ' + line.reason + ' ' + line.dx + ',' + line.dy);
    });
    WRONG.forEach(function (w) {
      var rest = [w[0][0] - w[1][0], w[0][1] - w[1][1]], r = run([w[1], rest], [0, 4], e), name = tag + 'told ' + w[0] + ', first ' + w[1] + ', from there ' + rest;
      if (r.miss) return sumCheck(name, false, r.miss);
      sumCheck(name + ': a wrong slide is never wasted, the two add up to the told', same(S.addMoves(r.moves).sum, w[0]), JSON.stringify(r.moves));
    });
    THREES.forEach(function (t) {
      var orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]], want = S.addMoves(t).sum;
      orders.forEach(function (ord, oi) {
        var r = run(ord.map(function (n) { return t[n]; }), [oi, oi + 1, oi + 2], e), name = tag + 'three moves ' + JSON.stringify(t) + ' in the order ' + ord;
        if (r.miss) return sumCheck(name, false, r.miss);
        var A = S.addMoves(r.moves);
        sumCheck(name + ' land on the same square', same(A.sum, want) && same(A.path[3], want) && A.swapped === null, JSON.stringify(A.sum));
      });
    });
  });
});
sumBad.forEach(function (x) { console.log(x); });
console.log('sum: ' + sumOk + ' of ' + sumAll + ' (moves end to end add up, either order the same square, a wrong slide never wasted)');
