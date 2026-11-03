/* The Petrificus Totalus judging, tallied in node: node page/charms/checks/bind-tally.js
   Loads page/charms/spells.js and runs pairs of drawn lines through judgeBind beside the test page's suit of armour,
   upright and leaning, at a phone and an iPad scale and every ease, each pair marked with what it is meant to be at
   kind, fair and strict. Then the meet: every pair that misses as 'meet' must cross on the side its lines close
   toward (feet or head). Prints each miss of meaning and the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the armour as the page lays it out (bind-test.html, place()): its middle at W/2, 0.47 H; its height the smaller of
   0.4 of the screen's height and 0.95 of the short side; its half width 0.16 of that; leaning 24 degrees in round 3 */
var LEANS = [0, 0, 24];
function figure(k, W, H) {
  var s = Math.min(W, H), h = Math.min(H * 0.4, s * 0.95);
  return { x: W / 2, y: H * 0.47, h: h, w: h * 0.16, lean: LEANS[k] };
}
/* a line in the figure's own frame, in heights: s across (+ right), t down its line (+ toward the feet); from
   (s0, t0) to (s1, t1); o.trem a tremble across it (heights, a wave every 0.1), o.bow a bow out to the right */
function ln(s0, t0, s1, t1, o) {
  o = o || {}; var out = [], n = 96, i, len = Math.hypot(s1 - s0, t1 - t0);
  for (i = 0; i <= n; i++) {
    var f = i / n, s = s0 + (s1 - s0) * f, t = t0 + (t1 - t0) * f;
    s += (o.trem || 0) * Math.sin(f * len / 0.1 * 2 * Math.PI) + (o.bow || 0) * Math.sin(f * Math.PI);
    out.push([s, t]);
  }
  return out;
}
/* a line through (sm, tm) at ang degrees from the figure's line (+ further right toward the feet), len heights long,
   drawn down (or up) */
function at(sm, ang, len, o) {
  o = o || {}; var k = Math.tan(ang * Math.PI / 180), c = Math.cos(Math.atan(k)), tm = o.tm || 0, half = len / 2 * c;
  var a = [sm - half * k, tm - half], b = [sm + half * k, tm + half];
  return o.up ? ln(b[0], b[1], a[0], a[1], o) : ln(a[0], a[1], b[0], b[1], o);
}
function tap(s, t) { return [[s, t], [s + 0.004, t + 0.003], [s + 0.006, t + 0.002]]; }

/* [name, round, [lines], meaning at kind, fair, strict (a verdict's reason), the meet's side if 'meet'] */
var CASES = [
  ['down both sides',                   0, [at(-0.25, 0, 0.9), at(0.25, 0, 0.9)],                 ['bound', 'bound', 'bound']],
  ['the right side first',              0, [at(0.25, 0, 0.9), at(-0.25, 0, 0.9)],                 ['bound', 'bound', 'bound']],
  ['one down, one up',                  0, [at(-0.25, 0, 0.9), at(0.25, 0, 0.9, { up: 1 })],      ['bound', 'bound', 'bound']],
  ['both up from the feet',             0, [at(-0.25, 0, 0.9, { up: 1 }), at(0.25, 0, 0.9, { up: 1 })], ['bound', 'bound', 'bound']],
  ['close in at its sides',             0, [at(-0.12, 0, 0.9), at(0.12, 0, 0.9)],                 ['bound', 'bound', 'bound']],
  ['wide of it',                        0, [at(-0.42, 0, 0.9), at(0.42, 0, 0.9)],                   ['bound', 'far', 'far']],
  ['one wide out',                      0, [at(-0.25, 0, 0.9), at(0.6, 0, 0.9)],                  ['far', 'far', 'far']],
  ['closing a little, 6 degrees',       0, [at(-0.25, 3, 0.9), at(0.25, -3, 0.9)],                ['bound', 'bound', 'meet'], 'below'],
  ['closing, 10 degrees',               0, [at(-0.25, 5, 0.9), at(0.25, -5, 0.9)],                ['bound', 'meet', 'meet'], 'below'],
  ['a V, 16 degrees',                   0, [at(-0.25, 8, 0.9), at(0.25, -8, 0.9)],                ['meet', 'meet', 'meet'], 'below'],
  ['a wide V, 30 degrees',              0, [at(-0.3, 15, 0.9), at(0.3, -15, 0.9)],                ['meet', 'meet', 'meet'], 'below'],
  ['an upside-down V',                  0, [at(-0.25, -8, 0.9), at(0.25, 8, 0.9)],                ['meet', 'meet', 'meet'], 'above'],
  ['an X',                              0, [at(-0.04, 20, 0.9), at(0.04, -20, 0.9)],              ['meet', 'meet', 'meet'], 'below'],
  ['both slanting 10 degrees',          0, [at(-0.25, 10, 0.9), at(0.25, 10, 0.9)],               ['bound', 'bound', 'slant']],
  ['both slanting 17 degrees',          0, [at(-0.25, 17, 0.9), at(0.25, 17, 0.9)],               ['bound', 'slant', 'slant']],
  ['both slanting 25 degrees',          0, [at(-0.25, 25, 0.9), at(0.25, 25, 0.9)],               ['slant', 'slant', 'slant']],
  ['two lines across it',               0, [ln(-0.4, -0.3, 0.4, -0.3), ln(-0.4, 0.3, 0.4, 0.3)],    ['same', 'same', 'same']],
  ['both on its right',                 0, [at(0.2, 0, 0.9), at(0.4, 0, 0.9)],                    ['same', 'same', 'same']],
  ['one line only',                     0, [at(-0.25, 0, 0.9)],                                   ['one', 'one', 'one']],
  ['two taps',                          0, [tap(-0.25, 0), tap(0.25, 0)],                         ['tap', 'tap', 'tap']],
  ['a line and a tap',                  0, [at(-0.25, 0, 0.9), tap(0.25, 0)],                     ['one', 'one', 'one']],
  ['a little short, 0.45',              0, [at(-0.25, 0, 0.45), at(0.25, 0, 0.45)],               ['bound', 'short', 'short']],
  ['short, 0.3',                        0, [at(-0.25, 0, 0.3), at(0.25, 0, 0.3)],                 ['short', 'short', 'short']],
  ['the second one short',              0, [at(-0.25, 0, 0.9), at(0.25, 0, 0.3)],                 ['short', 'short', 'short']],
  ['above its head',                    0, [at(-0.25, 0, 0.7, { tm: -0.95 }), at(0.25, 0, 0.7, { tm: -0.95 })], ['off', 'off', 'off']],
  ['down its top half',                 0, [at(-0.25, 0, 0.55, { tm: -0.2 }), at(0.25, 0, 0.55, { tm: -0.2 })], ['bound', 'bound', 'short']],
  ['a small tremble',                   0, [at(-0.25, 0, 0.9, { trem: 0.004 }), at(0.25, 0, 0.9, { trem: 0.004 })], ['bound', 'bound', 'bound']],
  ['a tremble',                         0, [at(-0.25, 0, 0.9, { trem: 0.01 }), at(0.25, 0, 0.9, { trem: 0.01 })], ['bound', 'bound', 'wiggly']],
  ['a wobble',                          0, [at(-0.25, 0, 0.9, { trem: 0.02 }), at(0.25, 0, 0.9, { trem: 0.02 })], ['wiggly', 'wiggly', 'wiggly']],
  ['bowed a little',                    0, [at(-0.25, 0, 0.9, { bow: 0.04 }), at(0.25, 0, 0.9, { bow: -0.04 })], ['bound', 'bound', 'bound']],
  ['bowed',                             0, [at(-0.25, 0, 0.9, { bow: 0.15 }), at(0.25, 0, 0.9, { bow: -0.15 })], ['bound', 'bound', 'wiggly']],
  ['bowed round like brackets',         0, [at(-0.25, 0, 0.9, { bow: -0.3 }), at(0.25, 0, 0.9, { bow: 0.3 })], ['wiggly', 'wiggly', 'wiggly']],
  ['leaning with it',                   2, [at(-0.25, 0, 0.9), at(0.25, 0, 0.9)],                 ['bound', 'bound', 'bound']],
  ['leaning with it, drawn up',         2, [at(0.25, 0, 0.9, { up: 1 }), at(-0.25, 0, 0.9, { up: 1 })], ['bound', 'bound', 'bound']],
  ['upright beside the leaning one',    2, [at(-0.25, 24, 0.9), at(0.25, 24, 0.9)],             ['slant', 'slant', 'slant']],
  ['halfway to its lean',               2, [at(-0.25, 12, 0.9), at(0.25, 12, 0.9)],             ['bound', 'bound', 'slant']],
  ['leaning, closing to a V',           2, [at(-0.25, 7, 0.9), at(0.25, -7, 0.9)],                ['meet', 'meet', 'meet'], 'below'],
  ['leaning, a little off',             2, [at(-0.25, 5, 0.9), at(0.25, 7, 0.9)],                 ['bound', 'bound', 'bound']],
  ['leaning the wrong way',             2, [at(-0.25, 48, 0.9), at(0.25, 48, 0.9)],             ['slant', 'slant', 'slant']]
];
var EASES = ['kind', 'fair', 'strict'], SIZES = [[390, 844], [1180, 820]], ok = 0, all = 0, meetOk = 0, meetAll = 0;
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1];
  CASES.forEach(function (c) {
    var f = figure(c[1], W, H), L = f.lean * Math.PI / 180, d = [-Math.sin(L), Math.cos(L)], n = [Math.cos(L), Math.sin(L)], t = 0;
    var strokes = c[2].map(function (l) { return l.map(function (p) {
      t += 16; return { x: f.x + (p[0] * n[0] + p[1] * d[0]) * f.h, y: f.y + (p[0] * n[1] + p[1] * d[1]) * f.h, t: t }; }); });
    EASES.forEach(function (e, k) {
      var j = S.judgeBind(strokes, f, e); all++;
      if (j.reason === c[3][k]) ok++;
      else console.log('MISS ' + W + 'x' + H + ' ' + e + ': ' + c[0] + ' meant ' + c[3][k] + ', judged ' + j.reason +
        ' (angle ' + j.angle + ', off ' + j.off + ', straight ' + j.straight.join('/') + ', sides ' + j.sides.join('/') + ')');
      if (j.reason === 'meet') { meetAll++;
        if (c[4] && j.where === c[4] && j.meet) meetOk++;
        else console.log('MEET ' + W + 'x' + H + ' ' + e + ': ' + c[0] + ' meant ' + c[4] + ', met ' + j.where + ' at ' + j.meetAt); }
    });
  });
});
console.log('meets: ' + meetOk + ' of ' + meetAll + ' on the side they close toward');
console.log(ok + ' of ' + all + ' as meant');
