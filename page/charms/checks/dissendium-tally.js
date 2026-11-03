/* The Dissendium judging, tallied in node: node page/charms/checks/dissendium-tally.js
   Loads page/charms/spells.js and runs drawn lifts through judgeHinge at a phone and an iPad size and every ease, on
   the test page's witch (the lid's edge up and to the left of its hinge, opening clockwise; 45 degrees to fit, the lid
   stopping at 110, unlatched at 6), each shape marked with what it is meant to be. Prints each miss of meaning and the
   count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* an arc round c, from a0 to a1 degrees (0 = twelve o'clock, + clockwise), its radius wobbling by wob of r */
function arc(c, r, a0, a1, n, ms, wob) {
  var out = [];
  for (var i = 0; i <= n; i++) {
    var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180, rr = r * (1 + (wob || 0) * Math.sin(i / n * Math.PI * 5));
    out.push({ x: c.x + rr * Math.sin(a), y: c.y - rr * Math.cos(a), t: ms * i / n });
  }
  return out;
}
function line(a, b, n, ms) {
  var out = []; for (var i = 0; i <= n; i++) out.push({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n, t: ms * i / n }); return out;
}
function geo(w, h) {   /* as dissendium-test.html places her */
  var s = Math.min(w * 1.15, h * 0.8), y0 = h * 0.8 - s * 0.08, x = w / 2;
  var c = { x: x + s * 0.2, y: y0 - s * 0.36 }, e = { x: x - s * 0.08, y: y0 - s * 0.47 };
  return { c: c, e: e, L: Math.hypot(e.x - c.x, e.y - c.y), a0: Math.atan2(e.x - c.x, -(e.y - c.y)) * 180 / Math.PI };
}
var WANT = { need: 45, max: 110, from: 6, dir: 1 };
function cases(w, h) {
  var g = geo(w, h), c = g.c, L = g.L, a = g.a0;
  return [
    ['a lift of 44, to 50', arc(c, L * 0.95, a, a + 44, 24, 600), 'open'],
    ['a lift of 40, to 46', arc(c, L * 0.95, a, a + 40, 24, 600), 'open'],
    ['a lift of 36, to 42', arc(c, L * 0.95, a, a + 36, 24, 600), 'not strict'],
    ['a lift of 30, to 36', arc(c, L * 0.95, a, a + 30, 20, 500), 'narrow'],
    ['a lift of 20, to 26', arc(c, L * 0.95, a, a + 20, 16, 400), 'narrow'],
    ['a lift of 120, stopped at 110', arc(c, L * 0.95, a, a + 120, 50, 1200), 'open'],
    ['a lift of 60, slow (3 s)', arc(c, L * 0.95, a, a + 60, 80, 3000), 'open'],
    ['a lift of 50, halfway down the lid', arc(c, L * 0.5, a, a + 50, 24, 600), 'open'],
    ['a lift of 50, wobbling a fifth', arc(c, L * 0.95, a, a + 50, 30, 600, 0.2), 'open'],
    ['a straight drag up from the edge', line(g.e, { x: g.e.x, y: g.e.y - L * 1.5 }, 30, 600), 'open'],
    ['pushed down, 30 the wrong way', arc(c, L * 0.95, a, a - 30, 16, 400), 'miss'],
    ['a nudge of 3', arc(c, L * 0.95, a, a + 3, 6, 200), 'miss'],
    ['across the hinge', line(g.e, { x: c.x + (c.x - g.e.x), y: c.y + (c.y - g.e.y) }, 30, 500), 'miss'],
    ['a tap on the lid', [{ x: g.e.x, y: g.e.y, t: 0 }, { x: g.e.x + 2, y: g.e.y, t: 60 }], 'miss']
  ];
}
var sizes = [[390, 844], [1180, 820]], eases = ['kind', 'fair', 'strict'], ok = 0, all = 0;
sizes.forEach(function (sz) {
  var g = geo(sz[0], sz[1]);
  cases(sz[0], sz[1]).forEach(function (k) {
    eases.forEach(function (e) {
      var j = S.judgeHinge(k[1], g.c, g.L, WANT, sz[0], sz[1], e), meant = k[2];
      var good = meant === 'not strict' ? (e === 'strict' ? j.verdict === 'narrow' : j.verdict === 'open') : j.verdict === meant;
      all++; if (good) ok++;
      else console.log('MISS ' + sz.join('x') + ' ' + e + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason + ', ' + Math.round(j.degrees) + ' deg, opened ' + Math.round(j.opened) + '), meant ' + meant);
    });
  });
});
/* openHump's stop (req 163): the angle where the gap at the lid's edge, 2 x lid x sin(half the angle), is his width */
[[45, 34, 44], [45, 24, 31], [45, 44, 59], [45, 90, 180], [60, 34, 33]].forEach(function (k) {
  var d = S.humpNeed(k[0], k[1]), gap = 2 * k[0] * Math.sin(d * Math.PI / 360), good = Math.round(d) === k[2] && Math.abs(gap - k[1]) < 1e-9;
  all++; if (good) ok++; else console.log('MISS humpNeed(' + k[0] + ', ' + k[1] + ') -> ' + d.toFixed(2) + ' deg, gap ' + gap.toFixed(2) + ', meant ' + k[2]);
});
console.log(ok + ' of ' + all + ' as meant');
