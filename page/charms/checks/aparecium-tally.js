/* The Aparecium judging, tallied in node: node page/charms/checks/aparecium-tally.js
   Loads page/charms/spells.js and runs three-tap patterns through judgeTaps at a phone and an iPad size and every ease,
   each marked with what it is meant to be, and the same with place: false (the page's "Beat alone"). Prints each miss
   of meaning and the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* three taps: positions as shares of the short side from the centre, and the two intervals in ms */
function taps(w, h, p, i1, i2) {
  var s = Math.min(w, h), c = { x: w / 2, y: h / 2 }, t = [0, i1, i1 + i2];
  return p.map(function (q, k) { return { x: c.x + q[0] * s, y: c.y + q[1] * s, t: t[k] }; });
}
var L = [[-0.3, 0], [0, 0], [0.3, 0]];
var cases = [
  /* [name, positions, i1, i2, meant with the place asked, meant with the beat alone] */
  ['three in a line, halved, an even beat', L, 400, 400, 'open', 'open'],
  ['three in a line, slanting, halved', [[-0.25, -0.15], [0, 0], [0.25, 0.15]], 450, 420, 'open', 'open'],
  ['three in a line, slow but steady (1.2 s each)', L, 1200, 1200, 'open', 'open'],
  ['the middle a little off half (4.4 and 5.6 tenths)', [[-0.3, 0], [-0.036, 0], [0.3, 0]], 400, 400, 'open', 'open'],
  ['the middle off half (3.5 and 6.5 tenths)', [[-0.3, 0], [-0.09, 0], [0.3, 0]], 400, 400, 'kind lets', 'open'],
  ['the middle well off half (2.5 and 7.5 tenths)', [[-0.3, 0], [-0.15, 0], [0.3, 0]], 400, 400, 'miss', 'open'],
  ['a shallow bend (the middle a tenth of the span off)', [[-0.3, 0], [0, 0.06], [0.3, 0]], 400, 400, 'open, not strict', 'open'],
  ['a triangle', [[-0.2, 0.1], [0, -0.2], [0.2, 0.1]], 400, 400, 'miss', 'open'],
  ['three on one spot (the book\'s own)', [[0, 0], [0.01, 0.005], [-0.005, 0.01]], 400, 400, 'miss', 'open'],
  ['a beat a bit uneven (400 then 560)', L, 400, 560, 'open, not strict', 'open, not strict'],
  ['a beat uneven (300 then 800)', L, 300, 800, 'miss', 'miss'],
  ['tap, tap ... tap (300 then 1300)', L, 300, 1300, 'miss', 'miss'],
  ['two, then a long pause (2 s), then one', L, 400, 2000, 'waiting', 'waiting'],
  ['out and back (the third tap on the first)', [[-0.3, 0], [0.3, 0], [-0.3, 0]], 400, 400, 'miss', 'open']
];
var sizes = [[390, 844], [1180, 820]], eases = ['kind', 'fair', 'strict'], ok = 0, all = 0;
function good(meant, e, v) {
  if (meant === 'kind lets') return e === 'kind' ? v === 'open' : true;
  if (meant === 'open, not strict') return e === 'strict' ? v === 'miss' : v === 'open';
  return v === meant;
}
sizes.forEach(function (sz) {
  cases.forEach(function (k) {
    eases.forEach(function (e) {
      [false, true].forEach(function (alone) {
        var ease = Object.assign({}, S.TAP_EASES[e]); if (alone) ease.place = false;
        var j = S.judgeTaps(taps(sz[0], sz[1], k[1], k[2], k[3]), sz[0], sz[1], ease), meant = alone ? k[5] : k[4];
        all++; if (good(meant, e, j.verdict)) ok++;
        else console.log('MISS ' + sz.join('x') + ' ' + e + (alone ? ' beat alone' : '') + ': ' + k[0] + ' -> ' + j.verdict + ' (' + j.reason +
          ', beat ' + j.beat.toFixed(2) + ', even ' + j.even.toFixed(2) + ', off ' + j.off.toFixed(2) + '), meant ' + meant);
      });
    });
  });
});
/* the count: one tap waits, two wait, a long gap starts again, a fourth tap is not judged with the first three */
function one(list, want) { all++; var j = S.judgeTaps(list, 390, 844, 'kind'); if (j.verdict === want[0] && j.count === want[1]) ok++; else console.log('MISS count: ' + JSON.stringify(list.map(function (q) { return q.t; })) + ' -> ' + j.verdict + ' ' + j.count + ', meant ' + want.join(' ')); }
var A = { x: 100, y: 400 }, B = { x: 195, y: 400 }, C = { x: 290, y: 400 };
one([], ['waiting', 0]);
one([{ x: A.x, y: A.y, t: 0 }], ['waiting', 1]);
one([{ x: A.x, y: A.y, t: 0 }, { x: B.x, y: B.y, t: 400 }], ['waiting', 2]);
one([{ x: A.x, y: A.y, t: 0 }, { x: B.x, y: B.y, t: 3000 }, { x: C.x, y: C.y, t: 3400 }], ['waiting', 2]);
one([{ x: A.x, y: A.y, t: 0 }, { x: B.x, y: B.y, t: 400 }, { x: C.x, y: C.y, t: 800 }, { x: 10, y: 10, t: 1200 }], ['open', 3]);
console.log(ok + ' of ' + all + ' as meant');
