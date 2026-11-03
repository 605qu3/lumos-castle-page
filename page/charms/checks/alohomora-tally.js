/* The Alohomora judging, tallied in node: node page/charms/checks/alohomora-tally.js
   Loads page/charms/spells.js and runs drawn turns through judgeTurn at a phone and an iPad size and every ease, each
   shape marked with what it is meant to be for the lock it is tried on. Prints each miss of meaning and the count. */
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
function cases(w, h) {
  var c = { x: w / 2, y: h / 2 }, r = Math.min(w, h) * 0.18, Q = { turn: 0.25, dir: 1 }, H2 = { turn: 0.5, dir: -1 }, T = { turn: 0.75, dir: 1 };
  var top = { x: c.x, y: c.y - r }, right = { x: c.x + r, y: c.y }, bottom = { x: c.x, y: c.y + r };
  return [
    ['a quarter clockwise', arc(c, r, 0, 90, 24, 500), Q, 'open'],
    ['a quarter clockwise, slow (3 s)', arc(c, r, 0, 90, 60, 3000), Q, 'open'],
    ['a quarter clockwise, from three o\'clock', arc(c, r, 90, 180, 24, 500), Q, 'open'],
    ['a quarter anticlockwise', arc(c, r, 0, -90, 24, 500), Q, 'tight'],
    ['a half clockwise on a quarter lock', arc(c, r, 0, 180, 40, 800), Q, 'miss'],
    ['an eighth on a quarter lock', arc(c, r, 0, 40, 12, 300), Q, 'miss'],
    ['a quarter, a third too wide', arc(c, r * 1.33, 0, 90, 24, 500), Q, 'open, not strict'],
    ['a quarter, twice too wide', arc(c, r * 2, 0, 90, 24, 500), Q, 'miss'],
    ['a quarter, wobbling a fifth', arc(c, r, 0, 90, 30, 500, 0.2), Q, 'open'],
    ['a chord, twelve to three', line(top, right, 20, 400), Q, 'kind lets'],
    ['a half anticlockwise', arc(c, r, 0, -180, 40, 800), H2, 'open'],
    ['a half clockwise on an anticlockwise lock', arc(c, r, 0, 180, 40, 800), H2, 'tight'],
    ['straight through the keyhole, twelve to six', line(top, bottom, 30, 500), H2, 'miss'],
    ['three quarters clockwise', arc(c, r, 0, 270, 60, 1200), T, 'open'],
    ['a whole turn on a three-quarter lock', arc(c, r, 0, 360, 80, 1500), T, 'miss'],
    ['a tap on the keyhole', [{ x: c.x, y: c.y, t: 0 }, { x: c.x + 2, y: c.y, t: 60 }], Q, 'miss']
  ];
}
var sizes = [[390, 844], [1180, 820]], eases = ['kind', 'fair', 'strict'], ok = 0, all = 0;
sizes.forEach(function (sz) {
  cases(sz[0], sz[1]).forEach(function (k) {
    eases.forEach(function (e) {
      var c = { x: sz[0] / 2, y: sz[1] / 2 }, r = Math.min(sz[0], sz[1]) * 0.18;
      var j = S.judgeTurn(k[1], c, r, k[2], sz[0], sz[1], e), meant = k[3];
      var good = meant === 'kind lets' ? (e !== 'kind' || j.verdict === 'open') : meant === 'open, not strict' ? (e === 'strict' ? j.verdict === 'miss' : j.verdict === 'open') : j.verdict === meant;
      all++; if (good) ok++;
      else console.log('MISS ' + sz.join('x') + ' ' + e + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason + ', ' + Math.round(j.degrees) + ' deg, band ' + j.band.toFixed(2) + '), meant ' + meant);
    });
  });
});
console.log(ok + ' of ' + all + ' as meant');
