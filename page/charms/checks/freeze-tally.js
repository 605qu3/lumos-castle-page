/* The Freezing Charm judging, tallied in node: node page/charms/checks/freeze-tally.js
   Loads page/charms/spells.js and runs strokes through judgeFreeze on pixies placed as the test page places them at
   the moment of a lift, at a phone and an iPad scale and every ease, each marked with what it is meant to be at kind,
   fair and strict. First the row: three pixies exactly in a line read a bend of 0, and out of it more. Prints each
   miss of meaning and the count. Then Four in a row (twenty-third session): four pixies placed as the page's fourth
   round places them, the two still ones fixing the line (judgeFreeze's fix), the other two flown off it by so many
   sizes; first fix (each one's distance off the fixed line is what it flew, and how many lie on it), then the four's
   strokes at every size and ease. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the pixies as the page sizes them (freeze-test.html, size()): r a twenty-second of the short side; the snapshots
   below are where its paths put them at a lift, as shares of the screen */
function size(W, H) { return Math.min(W, H) / 22; }
var SNAPS = {
  lesson: [[0.32, 0.42], [0.68, 0.50]],
  flat:   [[0.25, 0.55], [0.70, 0.35]],
  steep:  [[0.45, 0.30], [0.55, 0.62]],
  row:    [[0.25, 0.45 - 0.085], [0.50, 0.45], [0.75, 0.45 + 0.085]],
  bent:   [[0.25, 0.42], [0.50, 0.56], [0.75, 0.45]]
};
function pix(name, W, H) { var r = size(W, H); return SNAPS[name].map(function (q) { return { x: q[0] * W, y: q[1] * H, r: r }; }); }

/* a stroke along the line from pixie i to pixie j, ext sizes past each end; o: off (moved sideways, sizes), turn
   (swung about pixie i so pixie j sits that many sizes off it), short (stops that many sizes before pixie j),
   start (begins that many sizes before pixie i: 0 at its middle), sag (bowed, a share of the stroke), wig (a wiggle,
   its height in sizes), back (drawn the other way), tap, perp (at right angles, through pixie i) */
function stroke(px, o) {
  o = o || {}; var i = o.i || 0, j = o.j == null ? px.length - 1 : o.j, A = px[i], B = px[j], r = A.r;
  var d = Math.hypot(B.x - A.x, B.y - A.y), u = { x: (B.x - A.x) / d, y: (B.y - A.y) / d }, n = { x: -u.y, y: u.x };
  if (o.perp) { var t = u; u = n; n = { x: -t.x, y: -t.y }; d = 4 * r; }
  if (o.turn) { var th = Math.asin(Math.min(1, o.turn * r / d)); u = { x: u.x * Math.cos(th) - u.y * Math.sin(th), y: u.x * Math.sin(th) + u.y * Math.cos(th) }; n = { x: -u.y, y: u.x }; }
  if (o.tap) return [{ x: A.x, y: A.y, t: 0 }, { x: A.x + 1, y: A.y, t: 40 }];
  var ext = o.ext == null ? 1.5 : o.ext, s0 = -(o.start == null ? ext : o.start) * r, s1 = o.short ? d - o.short * r : d + ext * r;
  var out = [], N = 60, k;
  for (k = 0; k <= N; k++) {
    var f = k / N, s = s0 + (s1 - s0) * f, side = (o.off || 0) * r;
    if (o.sag) side += 4 * o.sag * (s1 - s0) * f * (1 - f);
    if (o.wig) side += o.wig * r * Math.sin(f * (s1 - s0) / (1.7 * r) * 2 * Math.PI);
    out.push({ x: A.x + u.x * s + n.x * side, y: A.y + u.y * s + n.y * side, t: k * 6 });
  }
  return o.back ? out.reverse() : out;
}

var CASES = [
  { name: 'through both, the lesson', snap: 'lesson', meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'through both, drawn back', snap: 'lesson', o: { back: true }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'middle to middle, no further', snap: 'lesson', o: { ext: 0 }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'through both, a flat pair', snap: 'flat', meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'through both, a steep pair', snap: 'steep', meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'a little to one side', snap: 'lesson', o: { off: 0.8 }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'beside them, a size off', snap: 'lesson', o: { off: 1.1 }, meant: ['frozen', 'frozen', 'none'] },
  { name: 'beside them, wider', snap: 'flat', o: { off: 1.4 }, meant: ['frozen', 'none', 'none'] },
  { name: 'well beside them', snap: 'lesson', o: { off: 2.2 }, meant: ['none', 'none', 'none'] },
  { name: 'swung off the second, two sizes', snap: 'lesson', o: { turn: 2 }, meant: ['missed', 'missed', 'missed'] },
  { name: 'swung off the second, a little', snap: 'steep', o: { turn: 1.4 }, meant: ['frozen', 'missed', 'missed'] },
  { name: 'stops well short of the second', snap: 'lesson', o: { short: 2.5 }, meant: ['missed', 'missed', 'missed'] },
  { name: 'stops a little short', snap: 'flat', o: { short: 1.4 }, meant: ['frozen', 'missed', 'missed'] },
  { name: 'bowed a little', snap: 'lesson', o: { sag: 0.15 }, meant: ['frozen', 'frozen', 'curved'] },
  { name: 'bowed a lot', snap: 'lesson', o: { sag: 0.25 }, meant: ['curved', 'curved', 'curved'] },
  { name: 'a zigzag', snap: 'flat', o: { wig: 0.6 }, meant: ['curved', 'curved', 'curved'] },
  { name: 'a tap', snap: 'lesson', o: { tap: true }, meant: ['tap', 'tap', 'tap'] },
  { name: 'across one only', snap: 'lesson', o: { perp: true }, meant: ['missed', 'missed', 'missed'] },
  { name: 'three in a row, through all', snap: 'row', meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'three in a row, drawn back', snap: 'row', o: { back: true }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'three out of line, the outer two', snap: 'bent', meant: ['missed', 'missed', 'missed'] },
  { name: 'three out of line, the first two', snap: 'bent', o: { j: 1 }, meant: ['missed', 'missed', 'missed'] }
];
var SIZES = [[390, 844], [1180, 820]], EASES = ['kind', 'fair', 'strict'];
var ok = 0, all = 0;

var rowOk = 0, rowAll = 0;
SIZES.forEach(function (s) {
  var row = S.judgeFreeze(stroke(pix('row', s[0], s[1])), pix('row', s[0], s[1]), 'kind'), bent = S.judgeFreeze(stroke(pix('bent', s[0], s[1])), pix('bent', s[0], s[1]), 'kind');
  rowAll += 2; if (row.bend < 0.01) rowOk++; else console.log('row: in a line read bend ' + row.bend + ' at ' + s.join('x'));
  if (bent.bend > 2) rowOk++; else console.log('row: out of line read bend ' + bent.bend + ' at ' + s.join('x'));
});
console.log('row: ' + rowOk + ' of ' + rowAll + ' (in a line 0, out of it more than two sizes)');

CASES.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var px = pix(c.snap, s[0], s[1]), v = S.judgeFreeze(stroke(px, c.o), px, e), want = c.meant[k];
  all++;
  if (v.reason === want) ok++;
  else console.log(c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; off ' + v.off.join(', ') + ', straight ' + v.straight + ')');
}); }); });
console.log(ok + ' of ' + all + ' as meant');

/* ---- Four in a row: as freeze-test.html's posAt for the fourth round puts them, the line from (0.18, 0.58) to
   (0.78, 0.42) of the screen, the four at a third apart along it; 0 and 2 hover still on it and fix it, 1 and 3 fly
   across it (off: how far each is off it, in sizes, along the line's normal) ---- */
var FIX = [0, 2];
function four(W, H, off1, off3) {
  var r = size(W, H), a = { x: 0.18 * W, y: 0.58 * H }, b = { x: 0.78 * W, y: 0.42 * H }, L = Math.hypot(b.x - a.x, b.y - a.y);
  var u = { x: (b.x - a.x) / L, y: (b.y - a.y) / L }, n = { x: -u.y, y: u.x }, offs = [0, off1, 0, off3];
  return [0, 1 / 3, 2 / 3, 1].map(function (f, k) { return { x: a.x + u.x * L * f + n.x * offs[k] * r, y: a.y + u.y * L * f + n.y * offs[k] * r, r: r }; });
}
/* a stroke on the line through pixies i and j, from ext sizes before i to ext sizes past pixie upto (j if not given) as
   it falls on that line; back, turn and tap as stroke() above */
function fstroke(px, o) {
  o = o || {}; var i = o.i || 0, j = o.j == null ? 2 : o.j, A = px[i], B = px[j], r = A.r, ext = o.ext == null ? 1.5 : o.ext;
  if (o.tap) return [{ x: A.x, y: A.y, t: 0 }, { x: A.x + 1, y: A.y, t: 40 }];
  var d = Math.hypot(B.x - A.x, B.y - A.y), u = { x: (B.x - A.x) / d, y: (B.y - A.y) / d };
  if (o.turn) { var th = Math.asin(Math.min(1, o.turn * r / d)); u = { x: u.x * Math.cos(th) - u.y * Math.sin(th), y: u.x * Math.sin(th) + u.y * Math.cos(th) }; }
  var U = px[o.upto == null ? j : o.upto], s1 = (U.x - A.x) * u.x + (U.y - A.y) * u.y + ext * r, s0 = -ext * r, out = [], k;
  for (k = 0; k <= 60; k++) { var s = s0 + (s1 - s0) * k / 60; out.push({ x: A.x + u.x * s, y: A.y + u.y * s, t: k * 6 }); }
  return o.back ? out.reverse() : out;
}
var FOUR = [
  { name: 'four in a row, through the still two and on past the last', off: [0, 0], o: { upto: 3 }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'four in a row, drawn back', off: [0, 0], o: { upto: 3, back: true }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'four in a row, first to last', off: [0, 0], o: { j: 3 }, meant: ['frozen', 'frozen', 'frozen'] },
  { name: 'nearly in a row, a size off', off: [1.1, -1.1], o: { upto: 3 }, meant: ['frozen', 'frozen', 'apart'] },
  { name: 'nearly in a row, a size and a half', off: [1.4, 1.4], o: { upto: 3 }, meant: ['frozen', 'apart', 'apart'] },
  { name: 'three in a row, the fourth off', off: [0, 2.5], o: { upto: 3 }, meant: ['apart', 'apart', 'apart'] },
  { name: 'three in a row, the second off', off: [-2.5, 0], o: { upto: 3 }, meant: ['apart', 'apart', 'apart'] },
  { name: 'both off the line', off: [2, -2.6], o: { upto: 3 }, meant: ['apart', 'apart', 'apart'] },
  { name: 'in a row, stops at the third', off: [0, 0], o: {}, meant: ['missed', 'missed', 'missed'] },
  { name: 'in a row, swung off the still one', off: [0, 0], o: { upto: 3, turn: 2.2 }, meant: ['missed', 'missed', 'missed'] },
  { name: 'one off, the line through it and the first', off: [0, 3], o: { j: 3 }, meant: ['missed', 'missed', 'missed'] },
  { name: 'a tap', off: [0, 0], o: { tap: true }, meant: ['tap', 'tap', 'tap'] }
];
var fixOk = 0, fixAll = 0;
SIZES.forEach(function (s) { [[0, 0, 4], [0, 2.5, 3], [-1.8, 2, 2]].forEach(function (c) {
  var px = four(s[0], s[1], c[0], c[1]), v = S.judgeFreeze(fstroke(px, { upto: 3 }), px, 'kind', FIX);
  var want = [0, Math.abs(c[0]), 0, Math.abs(c[1])], good = v.onFix === c[2] && want.every(function (w, k) { return Math.abs(v.fixOff[k] - w) < 0.02; });
  fixAll++; if (good) fixOk++; else console.log('fix: off ' + c[0] + ', ' + c[1] + ' at ' + s.join('x') + ' read ' + v.fixOff.join(', ') + ', on it ' + v.onFix);
}); });
console.log('fix: ' + fixOk + ' of ' + fixAll + ' (two fix the line; each other one is as far off it as it flew)');
var fOk = 0, fAll = 0;
FOUR.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var px = four(s[0], s[1], c.off[0], c.off[1]), v = S.judgeFreeze(fstroke(px, c.o), px, e, FIX), want = c.meant[k];
  fAll++;
  if (v.reason === want && (want !== 'apart' || v.apart === (Math.abs(c.off[0]) >= Math.abs(c.off[1]) ? 1 : 3))) fOk++;
  else console.log('four: ' + c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; apart ' + v.apart + ', off ' + v.off.join(', ') + ', fixOff ' + (v.fixOff || []).join(', ') + ')');
}); }); });
var px4 = four(390, 844, 0, 2.5), plain = S.judgeFreeze(fstroke(px4, { upto: 3 }), px4, 'kind');
fAll++; if (plain.reason === 'missed' && plain.fixOff === undefined) fOk++; else console.log('four: without fix the miss changed: ' + plain.reason);
console.log('four: ' + fOk + ' of ' + fAll + ' as meant');
