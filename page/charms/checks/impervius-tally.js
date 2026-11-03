/* The Impervius judging, tallied in node: node page/charms/checks/impervius-tally.js
   Loads page/charms/spells.js and runs drawn rings through judgeRing round the test page's three things (Harry's
   glasses, a sheet of parchment, a Gryffindor pennant) at a phone and an iPad scale and every ease, each ring marked
   with what it is meant to be at kind, fair and strict. Then smallestCircle on shapes whose smallest circle is known.
   Prints each miss of meaning and the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the three things, as the page draws them, in units of u (its size on the screen), round 0, 0 */
function glasses(u) {
  var out = [], r = 0.42 * u, i;
  [-1, 1].forEach(function (s) { for (i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2; out.push({ x: s * 0.55 * u + r * Math.cos(a), y: r * Math.sin(a) }); } });
  out.push({ x: 0, y: -0.12 * u });   /* the bridge */
  [-1, 1].forEach(function (s) { out.push({ x: s * 1.1 * u, y: -0.08 * u }); });   /* the hinges */
  return out;
}
function rect(w, h, u) {
  var out = [], i, n = 6;
  for (i = 0; i < n; i++) {
    var k = i / n;
    out.push({ x: (-w / 2 + w * k) * u, y: -h / 2 * u }, { x: w / 2 * u, y: (-h / 2 + h * k) * u }, { x: (w / 2 - w * k) * u, y: h / 2 * u }, { x: -w / 2 * u, y: (h / 2 - h * k) * u });
  }
  return out;
}
function pennant(u) {   /* its pole edge on the left, its point to the right */
  var A = { x: -0.9 * u, y: -0.4 * u }, B = { x: -0.9 * u, y: 0.4 * u }, C = { x: 1.0 * u, y: 0.05 * u }, out = [], i, n = 8;
  [[A, B], [B, C], [C, A]].forEach(function (e) { for (i = 0; i < n; i++) out.push({ x: e[0].x + (e[1].x - e[0].x) * i / n, y: e[0].y + (e[1].y - e[0].y) * i / n }); });
  return out;
}
/* a ring: centre (as a share of R from the smallest circle's centre), radius (shares of R), turns, from a0 degrees,
   dir 1 clockwise, wob a wobble of its radius, sx, sy squash it into an oval */
function ring(c, R, o) {
  var out = [], turns = o.turns || 1.05, n = Math.round(48 * turns), i;
  for (i = 0; i <= n; i++) {
    var a = ((o.a0 || 200) + (o.dir || 1) * 360 * turns * i / n) * Math.PI / 180, rr = (o.r || 1.2) * R * (1 + (o.wob || 0) * Math.sin(i / n * Math.PI * 2 * 7 * turns));
    out.push({ x: c.x + (o.dx || 0) * R + rr * Math.cos(a) * (o.sx || 1), y: c.y + (o.dy || 0) * R + rr * Math.sin(a) * (o.sy || 1), t: i * 15 });
  }
  return out;
}
var DRY = 'dry';
/* [name, ring options or a function(c, R), meant at kind, fair, strict] */
var CASES = [
  ['a ring 1.15 times the smallest', { r: 1.15 }, [DRY, DRY, DRY]],
  ['a roomy ring, 1.5', { r: 1.5 }, [DRY, DRY, DRY]],
  ['a huge ring, 3', { r: 3 }, [DRY, DRY, DRY]],
  ['anticlockwise', { r: 1.2, dir: -1 }, [DRY, DRY, DRY]],
  ['from the top', { r: 1.2, a0: 270 }, [DRY, DRY, DRY]],
  ['twice round', { r: 1.25, turns: 2 }, [DRY, DRY, DRY]],
  ['a wobbly ring', { r: 1.3, wob: 0.06 }, [DRY, DRY, DRY]],
  ['through the corners, a hair inside (0.95)', { r: 0.95, turns: 1.02 }, [DRY, DRY, 'small']],
  ['a touch small (0.9)', { r: 0.9, turns: 1.02 }, [DRY, 'small', 'small']],
  ['too small (0.75)', { r: 0.75 }, ['small', 'small', 'small']],
  ['off to one side, a corner out', { r: 1.2, dx: 0.5 }, ['small', 'small', 'small']],
  ['round half of it', { r: 0.6, dx: -0.45 }, ['small', 'small', 'small']],
  ['a gap, 0.85 of the way round', { r: 1.35, turns: 0.85, a0: 120 }, [DRY, 'open', 'open']],
  ['nearly round, 0.93', { r: 1.35, turns: 0.93, a0: 120 }, [DRY, DRY, 'open']],
  ['three quarters round', { r: 1.35, turns: 0.72 }, ['open', 'open', 'open']],
  ['an arc, two fifths round', { r: 1.35, turns: 0.4 }, ['open', 'open', 'open']],
  ['three times round', { r: 1.3, turns: 3 }, ['scribble', 'scribble', 'scribble']],
  ['a ring round nothing, far off', { r: 0.8, dx: 4 }, ['off', 'off', 'off']],
  ['a line across, below the middle', function (c, R) { var out = []; for (var i = 0; i <= 20; i++) out.push({ x: c.x - 1.5 * R + 3 * R * i / 20, y: c.y + 0.3 * R, t: i * 20 }); return out; }, ['open', 'open', 'open']],
  ['a tap', function (c, R) { return [{ x: c.x, y: c.y, t: 0 }, { x: c.x + 1, y: c.y, t: 50 }, { x: c.x + 2, y: c.y, t: 90 }]; }, ['tap', 'tap', 'tap']]
];
/* an oval round the things wider than tall: through the corners at 1.1 of the oval that just meets them */
var OVAL = ['an oval, wider than tall', function (c, R, th) { return ring(c, R, th.oval); }, [DRY, DRY, DRY]];
var THINGS = [
  ['the glasses', glasses, { r: 1, sx: 1.1, sy: 0.55 }],
  ['the parchment', function (u) { return rect(1.6, 1.1, u); }, { r: 1.1 * Math.SQRT2 / Math.hypot(1.6, 1.1) * 2 / 2, sx: 0.8 * 1.1 * Math.SQRT2 / (Math.hypot(1.6, 1.1) / 2) / (1.1 * Math.SQRT2 / Math.hypot(1.6, 1.1)) / 1, sy: 1 }],
  ['the pennant', pennant, { r: 1, sx: 1.1, sy: 0.72 }]
];
/* the parchment's oval: semi-axes a sqrt2 and b sqrt2 just meet its corners; 1.1 of that, as shares of R */
(function () { var a = 0.8, b = 0.55, R = Math.hypot(a, b); THINGS[1][2] = { r: 1, sx: 1.1 * a * Math.SQRT2 / R, sy: 1.1 * b * Math.SQRT2 / R }; })();

var scales = [['390x844', 80], ['1180x820', 150]], eases = ['kind', 'fair', 'strict'], ok = 0, all = 0;
scales.forEach(function (sc) {
  var u = sc[1], at = { x: 400, y: 300 };
  THINGS.forEach(function (th) {
    var shape = th[1](u).map(function (p) { return { x: p.x + at.x, y: p.y + at.y }; }), c = S.smallestCircle(shape), R = c.r;
    CASES.concat([OVAL]).forEach(function (k) {
      var pts = typeof k[1] === 'function' ? k[1](c, R, { oval: th[2] }) : ring(c, R, k[1]);
      eases.forEach(function (e, ei) {
        var j = S.judgeRing(pts, shape, e), meant = k[2][ei];
        var good = meant === DRY ? j.verdict === 'dry' : j.verdict === 'miss' && j.reason === meant;
        all++; if (good) ok++;
        else console.log('MISS ' + sc[0] + ' ' + e + ', ' + th[0] + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason + ', turns ' + j.turns.toFixed(2) +
          ', wet ' + j.wet.length + ', snug ' + j.snug.toFixed(2) + '), meant ' + meant);
      });
    });
  });
});
/* smallestCircle: a rectangle's diameter is its diagonal; an acute triangle's runs through its corners; an obtuse
   triangle's has its longest side for a diameter */
[[rect(4, 3, 1), 2.5], [[{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 4 }], 25 / 8], [[{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 4, y: 1 }], 5]].forEach(function (k, i) {
  var c = S.smallestCircle(k[0]), good = Math.abs(c.r - k[1]) < 1e-9;
  all++; if (good) ok++; else console.log('MISS smallestCircle ' + i + ' -> ' + c.r + ', meant ' + k[1]);
});
console.log(ok + ' of ' + all + ' as meant');
