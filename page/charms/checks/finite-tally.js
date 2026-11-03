/* The Finite Incantatem judging, tallied in node: node page/charms/checks/finite-tally.js
   Loads page/charms/spells.js and runs drawn rings through judgeFinite round the test page's three rounds, at a phone
   and an iPad scale and every ease, each ring marked with what it is meant to be at kind, fair and strict: all of it
   (four things going), leave the light (four on an arch over his lit lantern) and the horseshoe (five round the
   lantern, open at the bottom). Then the crossings: odd for every thing held, even for every thing left out, on the
   rings that are simple. Prints each miss of meaning and the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the rounds as the page lays them out: shares of S from the middle (W/2, H/2); r 0.065 a thing, 0.055 the lantern */
var ROUNDS = [
  [[-0.2, -0.14], [0.18, -0.16], [-0.16, 0.14], [0.2, 0.13]],
  [[-0.3, 0.06], [-0.16, -0.16], [0.16, -0.16], [0.3, 0.06], [0, 0.02, 'keep']],
  [[150], [210], [270], [330], [30], [0, 0, 'keep']].map(function (a) {
    return a.length === 1 ? [0.28 * Math.cos(a[0] * Math.PI / 180), 0.28 * Math.sin(a[0] * Math.PI / 180)] : a; })
];
function things(k, W, H) {
  var s = Math.min(W, H);
  return ROUNDS[k].map(function (p) { return { x: W / 2 + p[0] * s, y: H / 2 + p[1] * s, r: (p[2] ? 0.055 : 0.065) * s, keep: !!p[2] }; });
}
/* strokes, in shares of S from the middle; each point gets t */
function ring(cx, cy, R, o) {
  o = o || {}; var out = [], turns = o.turns || 1.05, n = Math.round(48 * turns), i;
  for (i = 0; i <= n; i++) {
    var a = ((o.a0 || 200) + (o.dir || 1) * 360 * turns * i / n) * Math.PI / 180, rr = R * (1 + (o.wob || 0) * Math.sin(i / n * Math.PI * 2 * 7 * turns));
    out.push([cx + rr * Math.cos(a) * (o.sx || 1), cy + rr * Math.sin(a) * (o.sy || 1)]);
  }
  return out;
}
function kidney(cx, cy, R, depth, w, dir) {   /* a ring dented in from below (90 degrees, y down) */
  var out = [], n = 96, i;
  for (i = 0; i <= n; i++) {
    var deg = 200 + (dir || 1) * 360 * i / n, d = ((deg - 90) % 360 + 540) % 360 - 180, rr = R * (1 - depth * Math.exp(-d * d / (2 * w * w)));
    out.push([cx + rr * Math.cos(deg * Math.PI / 180), cy + rr * Math.sin(deg * Math.PI / 180)]);
  }
  return out;
}
function horseshoe(Ro, Ri, from, to) {   /* out round the outside, in, back round the inside, out to the start */
  var out = [], i, n = 64, a;
  for (i = 0; i <= n; i++) { a = (from + (to - from) * i / n) * Math.PI / 180; out.push([Ro * Math.cos(a), Ro * Math.sin(a)]); }
  for (i = 0; i <= n; i++) { a = (to - (to - from) * i / n) * Math.PI / 180; out.push([Ri * Math.cos(a), Ri * Math.sin(a)]); }
  out.push([Ro * Math.cos(from * Math.PI / 180), Ro * Math.sin(from * Math.PI / 180)]);
  return out;
}
function line(x0, y0, x1, y1) { var out = []; for (var i = 0; i <= 12; i++) out.push([x0 + (x1 - x0) * i / 12, y0 + (y1 - y0) * i / 12]); return out; }

/* [name, round, stroke, meaning at kind, fair, strict (a verdict's reason), simple (check the crossings)] */
var CASES = [
  ['all of it, a circle',              0, ring(0, 0, 0.36),                        ['all', 'all', 'all'], 1],
  ['all of it, the other way round',   0, ring(0, 0, 0.36, { dir: -1 }),           ['all', 'all', 'all'], 1],
  ['all of it, an oval',               0, ring(0, 0, 0.36, { sx: 1.15, sy: 0.9 }), ['all', 'all', 'all'], 1],
  ['all of it, wobbly',                0, ring(0, 0, 0.38, { wob: 0.06 }),         ['all', 'all', 'all'], 0],
  ['on past the start',                0, ring(0, 0, 0.36, { turns: 1.25 }),       ['all', 'all', 'all'], 0],
  ['twice round',                      0, ring(0, 0, 0.36, { turns: 2.0 }),        ['all', 'all', 'all'], 0],
  ['three times round, a scribble',    0, ring(0, 0, 0.36, { turns: 3.0 }),        ['scribble', 'scribble', 'scribble'], 0],
  ['stopped a little short',           0, ring(0, 0, 0.36, { turns: 0.92 }),       ['all', 'all', 'open'], 1],
  ['two thirds round',                 0, ring(0, 0, 0.36, { turns: 0.7 }),        ['open', 'open', 'open'], 0],
  ['a ring a little tight',            0, ring(0, 0, 0.30),                        ['all', 'all', 'some'], 1],
  ['round the left two only',          0, ring(-0.18, 0, 0.24),                    ['some', 'some', 'some'], 1],
  ['round nothing',                    0, ring(0, 0.62, 0.1),                      ['off', 'off', 'off'], 1],
  ['a tap',                            0, [[0.01, 0.01], [0.012, 0.011], [0.013, 0.01]], ['tap', 'tap', 'tap'], 0],
  ['a short scratch',                  0, line(0, 0, 0.05, 0),                     ['tap', 'tap', 'tap'], 0],
  ['all of it, the light caught',      1, ring(0, -0.04, 0.44),                    ['caught', 'caught', 'caught'], 1],
  ['bent in under the light',          1, kidney(0, -0.1, 0.44, 0.886, 22),        ['all', 'all', 'all'], 1],
  ['bent in, the other way round',     1, kidney(0, -0.1, 0.44, 0.886, 22, -1),    ['all', 'all', 'all'], 1],
  ['bent in, not far enough',          1, kidney(0, -0.1, 0.44, 0.6, 22),          ['caught', 'caught', 'caught'], 1],
  ['round the left two only',          1, ring(-0.22, -0.05, 0.2),                 ['some', 'some', 'some'], 1],
  ['round the light only',             1, ring(0, 0.02, 0.12),                     ['caught', 'caught', 'caught'], 1],
  ['the horseshoe',                    2, horseshoe(0.41, 0.16, 125, 415),         ['all', 'all', 'all'], 1],
  ['the horseshoe, the other way',     2, horseshoe(0.41, 0.16, 415, 125),         ['all', 'all', 'all'], 1],
  ['a circle round the lot',           2, ring(0, 0, 0.41),                        ['caught', 'caught', 'caught'], 1],
  ['a horseshoe too short',            2, horseshoe(0.41, 0.16, 170, 415),         ['some', 'some', 'some'], 1],
  ['round the five, back round the light', 2, ring(0, 0, 0.41, { turns: 1, a0: 90 }).concat(ring(0, 0, 0.12, { turns: 1, dir: -1, a0: 90 }), [[0, 0.41]]), ['all', 'all', 'all'], 1]
];
var EASES = ['kind', 'fair', 'strict'], SIZES = [[390, 844], [1180, 820]], ok = 0, all = 0, crossOk = 0, crossAll = 0;
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1], s = Math.min(W, H);
  CASES.forEach(function (c) {
    var th = things(c[1], W, H), pts = c[2].map(function (p, i) { return { x: W / 2 + p[0] * s, y: H / 2 + p[1] * s, t: i * 16 }; });
    EASES.forEach(function (e, k) {
      var j = S.judgeFinite(pts, th, e); all++;
      if (j.reason === c[3][k]) ok++;
      else console.log('MISS ' + W + 'x' + H + ' ' + e + ': ' + c[0] + ' meant ' + c[3][k] + ', judged ' + j.reason + ' (held ' + j.held.join(',') + '; going ' + j.going.join(',') + '; caught ' + j.caught.join(',') + '; gap ' + j.gap.toFixed(2) + ')');
      if (c[4] && k === 0 && ['all', 'some', 'caught', 'off'].indexOf(j.reason) >= 0) {
        th.forEach(function (t, i) {
          var inside = j.held.indexOf(i) >= 0 || (t.keep && j.caught.indexOf(i) >= 0), odd = j.cross[i] % 2 === 1; crossAll++;
          if (inside === odd) crossOk++;
          else console.log('CROSS ' + W + 'x' + H + ': ' + c[0] + ', thing ' + i + ' ' + (inside ? 'held' : 'out') + ' but crosses ' + j.cross[i]);
        });
      }
    });
  });
});
console.log('crossings: ' + crossOk + ' of ' + crossAll + ' odd inside, even out');
console.log(ok + ' of ' + all + ' as meant');
