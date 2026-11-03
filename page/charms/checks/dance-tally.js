/* The pineapple's tap dance judging, tallied in node: node page/charms/checks/dance-tally.js
   Loads page/charms/spells.js and taps out dances on the test page's desks, at a phone and an iPad scale and every
   ease, each marked with what it is meant to be at kind, fair and strict. Like the page, it calls judgePineapple after
   every tap and stops at the first verdict; a case with a pause asks once more, the gap later. First the sum: the
   desk split into n equal steps reads each step a 1/n share. Prints each miss of meaning and the count.
   Flitwick's beat (twenty-second session): cases with beat (ms) tap on Flitwick's ticks from t0 = 0, off (each tap's
   distance from its tick, a share of the beat) and wait (how far past the next tick, a share of the beat, the page
   asks again); then the pace: n steps on a beat of T/n cross in T, the speed 1/T desks a second whatever n.
   At the end, Q9's fix 6: judgeSteps, every step judged more kindly, the old cases and new ones. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the desks as the page lays them out (dance-test.html, deskOf()): the desktop at 0.62 of the height, from 0.14 to
   0.86 of the width (the exam's longer desk 0.08 to 0.92), the band a twentieth of the short side, 16 px at least;
   want: Flitwick's lesson asks for four, your own count any, the exam its number */
function deskOf(k, W, H) {
  var m = k === 2 ? 0.08 : 0.14;
  return { a: W * m, b: W * (1 - m), y: H * 0.62, band: Math.max(16, Math.min(W, H) * 0.05) };
}
function flip(d) { return { a: d.b, b: d.a, y: d.y, band: d.band }; }
function even(n) { var o = []; for (var i = 1; i <= n; i++) o.push(i / n); return o; }
function sums(steps) { var o = [], s = 0; steps.forEach(function (x) { s += x; o.push(s); }); return o; }

/* a case: at (each landing as a share of the desk), dy (each tap above or below the desktop, in bands), ms (the
   times), pause (ms after the last tap the page asks again), round (0 lesson, 1 own, 2 exam), want, back (right to
   left), meant [kind, fair, strict] */
var CASES = [
  { name: 'four equal, the lesson', at: even(4), round: 0, want: 4, meant: ['danced', 'danced', 'danced'] },
  { name: 'three equal, own count', at: even(3), round: 1, meant: ['danced', 'danced', 'danced'] },
  { name: 'five equal, own count', at: even(5), round: 1, meant: ['danced', 'danced', 'danced'] },
  { name: 'six equal, own count', at: even(6), round: 1, meant: ['danced', 'danced', 'danced'] },
  { name: 'eight equal, own count', at: even(8), round: 1, meant: ['danced', 'danced', 'danced'] },
  { name: 'three in the lesson that asks four', at: even(3), round: 0, want: 4, meant: ['count', 'count', 'count'] },
  { name: 'a hand a little shaky', at: sums([0.24, 0.27, 0.23, 0.26]), round: 0, want: 4, meant: ['danced', 'danced', 'danced'] },
  { name: 'a fifth of a step out', at: sums([0.20, 0.30, 0.25, 0.25]), round: 1, meant: ['danced', 'danced', 'uneven'] },
  { name: 'one step long', at: sums([0.15, 0.35, 0.25, 0.25]), round: 1, meant: ['uneven', 'uneven', 'uneven'] },
  { name: 'one step short at the end', at: sums([0.30, 0.30, 0.30, 0.10]), round: 1, meant: ['uneven', 'uneven', 'uneven'] },
  { name: 'arrives a little short', at: [0.24, 0.48, 0.72, 0.96], round: 1, pause: 3000, meant: ['danced', 'danced', 'short'] },
  { name: 'just past the end', at: [0.265, 0.53, 0.795, 1.06], round: 1, meant: ['danced', 'past', 'past'] },
  { name: 'off the end of the desk', at: [0.3, 0.6, 0.9, 1.15], round: 1, meant: ['past', 'past', 'past'] },
  { name: 'a tap above the desk', at: even(4), dy: [0, 1.6, 0, 0], round: 1, meant: ['off', 'off', 'off'] },
  { name: 'a tap a little high, still on it', at: even(4), dy: [0, 0.7, -0.6, 0], round: 1, meant: ['danced', 'danced', 'danced'] },
  { name: 'a step back', at: [0.3, 0.2, 0.6, 1], round: 1, meant: ['back', 'back', 'back'] },
  { name: 'twice on the spot', at: [0.25, 0.26, 0.5], round: 1, meant: ['back', 'back', 'back'] },
  { name: 'one leap across', at: [1], round: 1, meant: ['leap', 'leap', 'leap'] },
  { name: 'two leaps', at: [0.5, 1], round: 1, meant: ['leap', 'leap', 'leap'] },
  { name: 'ten little shuffles', at: even(10), round: 1, meant: ['shuffle', 'shuffle', 'shuffle'] },
  { name: 'stops half way', at: [0.25, 0.5], round: 1, pause: 3000, meant: ['short', 'short', 'short'] },
  { name: 'still thinking half way', at: [0.25, 0.5], round: 1, pause: 1200, meant: ['waiting', 'waiting', 'waiting'] },
  { name: 'right to left, four equal', at: even(4), round: 1, back: true, meant: ['danced', 'danced', 'danced'] },
  { name: 'right to left, one long', at: sums([0.15, 0.35, 0.25, 0.25]), round: 1, back: true, meant: ['uneven', 'uneven', 'uneven'] },
  { name: 'a wobbly beat, even steps', at: even(4), ms: [0, 300, 1300, 1500], round: 1, meant: ['danced', 'danced', 'danced'] },
  { name: 'the exam, five', at: even(5), round: 2, want: 5, meant: ['danced', 'danced', 'danced'] },
  { name: 'the exam, four for five', at: even(4), round: 2, want: 5, meant: ['count', 'count', 'count'] },
  { name: 'the exam, six for three', at: even(6), round: 2, want: 3, meant: ['count', 'count', 'count'] },
  { name: 'beat: slow, three on the ticks', at: even(3), round: 3, want: 3, beat: 1000, meant: ['danced', 'danced', 'danced'] },
  { name: 'beat: quick, six on the ticks', at: even(6), round: 3, want: 6, beat: 500, meant: ['danced', 'danced', 'danced'] },
  { name: 'beat: quick, three big steps', at: even(3), round: 3, want: 3, beat: 500, meant: ['danced', 'danced', 'danced'] },
  { name: 'beat: a tenth ahead of each tick', at: even(3), round: 3, want: 3, beat: 1000, off: [-0.1, -0.1, -0.1], meant: ['danced', 'danced', 'danced'] },
  { name: 'beat: one a fifth late', at: even(3), round: 3, want: 3, beat: 1000, off: [0, 0.2, 0], meant: ['danced', 'danced', 'beat'] },
  { name: 'beat: one three tenths early', at: even(6), round: 3, want: 6, beat: 500, off: [0, 0, -0.3, 0, 0, 0], meant: ['danced', 'beat', 'beat'] },
  { name: 'beat: one half a beat late', at: even(6), round: 3, want: 6, beat: 500, off: [0, 0.5, 0, 0, 0, 0], meant: ['beat', 'beat', 'beat'] },
  { name: 'beat: jumps the count', at: even(3), round: 3, want: 3, beat: 1000, off: [-0.6, 0, 0], meant: ['beat', 'beat', 'beat'] },
  { name: 'beat: a tick skipped', at: even(3), round: 3, want: 3, beat: 500, off: [0, 1, 1], meant: ['beat', 'beat', 'beat'] },
  { name: 'beat: the first tick passes, no tap', at: [], round: 3, want: 3, beat: 1000, wait: 0.5, meant: ['beat', 'beat', 'beat'] },
  { name: 'beat: just after the first tick, not yet tapped', at: [], round: 3, want: 3, beat: 1000, wait: 0.1, meant: ['waiting', 'waiting', 'waiting'] },
  { name: 'beat: a tick passes, no tap', at: [1 / 6, 2 / 6], round: 3, want: 6, beat: 500, wait: 0.5, meant: ['beat', 'beat', 'beat'] },
  { name: 'beat: just after the tick, still waiting', at: [1 / 6, 2 / 6], round: 3, want: 6, beat: 500, wait: 0.1, meant: ['waiting', 'waiting', 'waiting'] },
  { name: 'beat: on the ticks, one step long', at: sums([0.15, 0.35, 0.25, 0.25]), round: 3, want: 4, beat: 750, meant: ['uneven', 'uneven', 'uneven'] },
  { name: 'beat: on the ticks, four for six', at: even(4), round: 3, want: 6, beat: 500, meant: ['count', 'count', 'count'] },
  { name: 'beat: on the ticks, off the end', at: [0.3, 0.6, 0.9, 1.15], round: 3, want: 4, beat: 750, meant: ['past', 'past', 'past'] },
  { name: 'beat: right to left, six on the ticks', at: even(6), round: 3, want: 6, beat: 500, back: true, meant: ['danced', 'danced', 'danced'] }
];
var SIZES = [[390, 844], [1180, 820]], EASES = ['kind', 'fair', 'strict'];
var ok = 0, all = 0;

function run(c, W, H, ease) {
  var d = deskOf(c.round, W, H); if (c.back) d = flip(d);
  var L = d.b - d.a, taps = [], v = null;
  for (var i = 0; i < c.at.length; i++) {
    var t = c.ms ? c.ms[i] : c.beat ? Math.round((i + 1 + (c.off ? c.off[i] : 0)) * c.beat) : i * 450;
    taps.push({ x: d.a + L * c.at[i], y: d.y + (c.dy ? c.dy[i] : 0) * d.band, t: t });
    v = S.judgePineapple(taps, d, ease, c.want || 0, undefined, c.beat ? { ms: c.beat, t0: 0 } : undefined);
    if (v.verdict !== 'waiting') return v;
  }
  if (c.pause) v = S.judgePineapple(taps, d, ease, c.want || 0, taps[taps.length - 1].t + c.pause);
  if (c.wait != null) v = S.judgePineapple(taps, d, ease, c.want || 0, Math.round((taps.length + 1 + c.wait) * c.beat), { ms: c.beat, t0: 0 });
  return v;
}

/* the sum first: n equal steps each read a 1/n share, every n from 3 to 8, both ways, both sizes */
var sumOk = 0, sumAll = 0;
SIZES.forEach(function (s) { [false, true].forEach(function (back) { for (var n = 3; n <= 8; n++) {
  var v = run({ at: even(n), round: 1, back: back }, s[0], s[1], 'strict');
  sumAll++; if (v.verdict === 'danced' && Math.abs(v.share - 1 / n) < 0.002 && v.n === n) sumOk++;
  else console.log('sum: ' + n + ' steps ' + (back ? 'right to left' : 'left to right') + ' at ' + s.join('x') + ' read ' + v.reason + ', share ' + v.share);
} }); });
console.log('sum: ' + sumOk + ' of ' + sumAll + ' (n equal steps, each a 1/n share)');

CASES.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var v = run(c, s[0], s[1], e), want = c.meant[k];
  all++;
  if (v.reason === want) ok++;
  else console.log(c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; steps ' + v.steps.join(', ') + ', spread ' + v.spread + ', at ' + v.at + ')');
}); }); });
console.log(ok + ' of ' + all + ' as meant');

/* the pace: n equal steps on a beat of T/n, every tap on its tick, cross the desk in T whatever n, so the speed is
   1/T desks a second; half the time, twice the speed. n 3 to 8, T 3 s and 1.5 s, both ways, both sizes, strict */
var paceOk = 0, paceAll = 0;
SIZES.forEach(function (s) { [false, true].forEach(function (back) { [3000, 1500].forEach(function (T) { for (var n = 3; n <= 8; n++) {
  var v = run({ at: even(n), round: 3, want: n, beat: T / n, back: back }, s[0], s[1], 'strict');
  paceAll++; if (v.verdict === 'danced' && Math.abs(v.time - T) <= 1 && Math.abs(v.speed - 1000 / T) < 0.002) paceOk++;
  else console.log('pace: ' + n + ' steps in ' + T + ' ms ' + (back ? 'right to left' : 'left to right') + ' at ' + s.join('x') + ' read ' + v.reason + ', time ' + v.time + ', speed ' + v.speed);
} }); }); });
console.log('pace: ' + paceOk + ' of ' + paceAll + ' (n steps on a beat of T/n cross in T, the same speed whatever n; half the time, twice the speed)');
/* Q9's fix 6 (thirty-ninth session, 13 October 2026; Q11, option 2, Godric, 7.40 pm): judgeSteps, every step judged more
   kindly (even loosened to 0.45, 0.35, 0.25 of the mean). The old cases run through it, each meaning given again; where
   it differs from the old judge's it is printed as CHANGED (on purpose: only 'uneven' turns to 'danced', where a step
   strays from the mean by less than the looser share). Then new strays at every ease, and the step furthest out: on a
   dance the judge still names it (worst) and whether it was long, so the page can ring it. */
var STEPS = CASES.map(function (c) { return c.meant.slice(); });
STEPS[7][2] = 'danced';    /* a fifth of a step out: 0.2 of the mean, inside strict's 0.25 */
STEPS[8][0] = 'danced';    /* one step long: 0.4 of the mean, inside kind's 0.45 */
STEPS[23][0] = 'danced';   /* right to left, one long: the same */
STEPS[41][0] = 'danced';   /* on the ticks, one step long: the same */
var NEW = [
  { name: 'one long by a third', steps: [0.33, 0.25, 0.21, 0.21], round: 1, meant: ['danced', 'danced', 'uneven'], worst: 0, long: true },
  { name: 'one long by 0.44', steps: [0.36, 0.22, 0.21, 0.21], round: 1, meant: ['danced', 'uneven', 'uneven'], worst: 0, long: true },
  { name: 'one long by 0.48', steps: [0.37, 0.21, 0.21, 0.21], round: 1, meant: ['uneven', 'uneven', 'uneven'] },
  { name: 'a little out', steps: [0.29, 0.25, 0.23, 0.23], round: 1, meant: ['danced', 'danced', 'danced'], worst: 0, long: true },
  { name: 'three, the first long', steps: [0.42, 0.29, 0.29], round: 1, meant: ['danced', 'danced', 'uneven'], worst: 0, long: true },
  { name: 'six, the first short', steps: [0.1, 0.18, 0.18, 0.18, 0.18, 0.18], round: 1, meant: ['danced', 'uneven', 'uneven'], worst: 0, long: false },
  { name: 'the lesson, the second short', steps: [0.25, 0.15, 0.3, 0.3], round: 0, want: 4, meant: ['danced', 'uneven', 'uneven'], worst: 1, long: false },
  { name: 'right to left, the last long', steps: [0.21, 0.21, 0.21, 0.35], round: 1, back: true, meant: ['danced', 'uneven', 'uneven'], worst: 3, long: true }
];
function steps(c, W, H, ease) {   /* run(), judged by judgeSteps */
  var d = deskOf(c.round, W, H); if (c.back) d = flip(d);
  var L = d.b - d.a, taps = [], v = null, B = c.beat ? { ms: c.beat, t0: 0 } : undefined;
  for (var i = 0; i < c.at.length; i++) {
    var t = c.ms ? c.ms[i] : c.beat ? Math.round((i + 1 + (c.off ? c.off[i] : 0)) * c.beat) : i * 450;
    taps.push({ x: d.a + L * c.at[i], y: d.y + (c.dy ? c.dy[i] : 0) * d.band, t: t });
    v = S.judgeSteps(taps, d, ease, c.want || 0, undefined, B);
    if (v.verdict !== 'waiting') return v;
  }
  if (c.pause) v = S.judgeSteps(taps, d, ease, c.want || 0, taps[taps.length - 1].t + c.pause);
  if (c.wait != null) v = S.judgeSteps(taps, d, ease, c.want || 0, Math.round((taps.length + 1 + c.wait) * c.beat), B);
  return v;
}
var sOk = 0, sAll = 0, changed = 0, nOk = 0, nAll = 0;
CASES.forEach(function (c, n) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var v = steps(c, s[0], s[1], e), meant = STEPS[n][k];
  sAll++; if (v.reason === meant) sOk++;
  else console.log('STEPS MISS ' + c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + meant + '; spread ' + v.spread + ')');
  if (s[0] === 390 && meant !== c.meant[k]) { changed++; console.log('CHANGED ' + e + ': ' + c.name + ', ' + c.meant[k] + ' now ' + meant); }
}); }); });
NEW.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var v = steps({ at: sums(c.steps), round: c.round, want: c.want, back: c.back }, s[0], s[1], e), ok = v.reason === c.meant[k];
  if (ok && v.reason === 'danced' && c.worst != null && (v.worst !== c.worst || v.long !== c.long)) ok = false;
  nAll++; if (ok) nOk++;
  else console.log('STEPS MISS ' + c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + c.meant[k] + '; spread ' + v.spread + ', worst ' + v.worst + ', long ' + v.long + ')');
}); }); });
console.log('steps, the old cases: ' + sOk + ' of ' + sAll + ' as meant, ' + changed + ' meanings changed on purpose');
console.log('steps, kinder strays: ' + nOk + ' of ' + nAll + ' as meant, the furthest out named');
