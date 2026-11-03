/* Hermione's bluebell flames judging, tallied in node: node page/charms/checks/flames-tally.js
   Loads page/charms/spells.js and runs rings through judgeFlames on friends placed as the test page places them, at
   a phone and an iPad scale and every ease, each marked with what it is meant to be at kind, fair and strict. First
   the one circle: three friends not in a row have exactly one circle through them (found, its radius the page's),
   three in a row have none. Prints each miss of meaning and the count. At the end, Q9's fix: judgeLoop, any closed
   loop through all three, the old cases and new lumpy ones. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* as flames-test.html sizes them: each friend r an eighteenth of the short side; they stand round the courtyard's
   middle (W/2, 0.52 H) at R, a share of the short side, at the angles given (degrees, 0 to the right, clockwise) */
function size(W, H) { return Math.min(W, H) / 18; }
var SNAPS = {
  lesson:   { R: 0.30, at: [-90, 30, 150] },
  lopsided: { R: 0.30, at: [-60, 20, 200] },
  wide:     { R: 0.36, at: [-120, -10, 100] },
  turned:   { R: 0.30, at: [90, 210, 330] }
};
function mid(W, H) { return { x: W / 2, y: H * 0.52 }; }
function yard(W, H) { var m = size(W, H); return { x0: m, y0: m, x1: W - m, y1: H - m }; }   /* the courtyard: the screen, a size in from its edges */

function friends(name, W, H) {
  var m = mid(W, H), r = size(W, H), k = Math.min(W, H);
  if (name === 'row') return [-0.3, 0, 0.3].map(function (u) { return { x: m.x + u * k, y: m.y, r: r }; });
  if (name === 'stepped' || name === 'nudged') { var row = friends('row', W, H); return S.stepOut(row, 1, name === 'stepped' ? -0.3 * k : -1.5 * r, yard(W, H)).friends; }
  var s = SNAPS[name];
  return s.at.map(function (a) { a *= Math.PI / 180; return { x: m.x + s.R * k * Math.cos(a), y: m.y + s.R * k * Math.sin(a), r: r }; });
}

/* a ring drawn about the friends' own circle; o: grow (sizes added to the radius), shift (sizes to the right), turns
   (how far round, 1.05 by default), start (degrees), back (the other way round), squash (the up-down radius over the
   across), wob and freq (a wobble, its height a share of the radius, so many times round), via (a circle through
   friends 0 and 1 only, its middle moved that many sizes along the line between them, square to it), tap */
function ring(fr, W, H, o) {
  o = o || {}; var r = fr[0].r, i, n = 90, out = [];
  if (o.tap) return [{ x: fr[0].x, y: fr[0].y, t: 0 }, { x: fr[0].x + 1, y: fr[0].y, t: 60 }];
  var c = fr.length > 2 && !o.row ? S.circleThrough(fr[0], fr[1], fr[2]) : { x: mid(W, H).x, y: mid(W, H).y, r: 0.3 * Math.min(W, H) };
  if (o.thru) c = S.circleThrough(fr[o.thru[0]], fr[o.thru[1]], fr[o.thru[2]]);   /* Four friends: a ring through these three instead */
  if (o.via) {
    var a = fr[0], b = fr[1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, d = Math.hypot(b.x - a.x, b.y - a.y), nx = -(b.y - a.y) / d, ny = (b.x - a.x) / d;
    var side = (c.x - mx) * nx + (c.y - my) * ny + o.via * r;
    c = { x: mx + nx * side, y: my + ny * side }; c.r = Math.hypot(a.x - c.x, a.y - c.y);
  }
  if (o.largest) {   /* the biggest circle through the outer two whose whole ring stays in the yard, its middle on either side */
    var a0 = fr[0], b0 = fr[2], hh = Math.hypot(b0.x - a0.x, b0.y - a0.y) / 2, mx0 = (a0.x + b0.x) / 2, my0 = (a0.y + b0.y) / 2, best = null, Y = yard(W, H);
    for (var RR = hh; RR < 4 * Math.max(W, H); RR += 1) [-1, 1].forEach(function (sg) {
      var cy0 = my0 + sg * Math.sqrt(RR * RR - hh * hh);
      if (mx0 - RR >= 0 && mx0 + RR <= W && cy0 - RR >= 0 && cy0 + RR <= H) best = { x: mx0, y: cy0, r: RR };
    });
    c = best; LARGEST.push(W + 'x' + H + ' r ' + Math.round(c.r) + ', the middle one ' + (Math.abs(Math.hypot(fr[1].x - c.x, fr[1].y - c.y) - c.r) / r).toFixed(2) + ' sizes off it');
  }
  var R = c.r + (o.grow || 0) * r, cx = c.x + (o.shift || 0) * r, cy = c.y, turns = o.turns || 1.05, st = (o.start || 0) * Math.PI / 180;
  for (i = 0; i <= n; i++) {
    var th = st + (o.back ? -1 : 1) * turns * 2 * Math.PI * i / n, rr = R * (1 + (o.wob || 0) * Math.sin(th * (o.freq || 6)));
    out.push({ x: cx + rr * Math.cos(th), y: cy + rr * (o.squash || 1) * Math.sin(th), t: i * 14 });
  }
  return out;
}

var CASES = [
  { name: 'the ring through all three', snap: 'lesson', meant: ['warm', 'warm', 'warm'] },
  { name: 'drawn the other way round', snap: 'lesson', o: { back: true }, meant: ['warm', 'warm', 'warm'] },
  { name: 'begun elsewhere round', snap: 'lesson', o: { start: 115 }, meant: ['warm', 'warm', 'warm'] },
  { name: 'lopsided friends, through all three', snap: 'lopsided', meant: ['warm', 'warm', 'warm'] },
  { name: 'a wider ring, through all three', snap: 'wide', meant: ['warm', 'warm', 'warm'] },
  { name: 'turned about, through all three', snap: 'turned', meant: ['warm', 'warm', 'warm'] },
  { name: 'a little too big', snap: 'lesson', o: { grow: 0.85 }, meant: ['warm', 'warm', 'out'] },
  { name: 'much too big, all of them inside', snap: 'lesson', o: { grow: 2.2 }, meant: ['out', 'out', 'out'] },
  { name: 'round them all, as Finite would', snap: 'lesson', o: { grow: 3.5 }, meant: ['out', 'out', 'out'] },
  { name: 'much too small, all of them outside', snap: 'lesson', o: { grow: -2.2 }, meant: ['out', 'out', 'out'] },
  { name: 'moved a little to one side', snap: 'lesson', o: { shift: 0.9 }, meant: ['warm', 'warm', 'out'] },
  { name: 'moved well to one side', snap: 'lesson', o: { shift: 2.4 }, meant: ['out', 'out', 'out'] },
  { name: 'through two only', snap: 'lesson', o: { via: 3 }, meant: ['out', 'out', 'out'] },
  { name: 'a slight egg', snap: 'lesson', o: { squash: 0.9 }, meant: ['warm', 'warm', 'warm'] },
  { name: 'a long oval', snap: 'lesson', o: { squash: 0.55 }, meant: ['lumpy', 'lumpy', 'lumpy'] },
  { name: 'a trembling hand', snap: 'lesson', o: { wob: 0.03, freq: 15 }, meant: ['warm', 'warm', 'warm'] },
  { name: 'a gentle wobble', snap: 'lesson', o: { wob: 0.06, freq: 6 }, meant: ['warm', 'warm', 'warm'] },
  { name: 'a scribbly wobble', snap: 'lesson', o: { wob: 0.25, freq: 7 }, meant: ['lumpy', 'lumpy', 'lumpy'] },
  { name: 'three quarters round', snap: 'lesson', o: { turns: 0.75 }, meant: ['open', 'open', 'open'] },
  { name: 'nearly closed', snap: 'lesson', o: { turns: 0.85 }, meant: ['warm', 'open', 'open'] },
  { name: 'round and a half', snap: 'lesson', o: { turns: 1.5 }, meant: ['warm', 'warm', 'scribble'] },
  { name: 'twice round', snap: 'lesson', o: { turns: 2.0 }, meant: ['scribble', 'scribble', 'scribble'] },
  { name: 'a tap', snap: 'lesson', o: { tap: true }, meant: ['tap', 'tap', 'tap'] },
  { name: 'three in a row, a ring near them', snap: 'row', o: { row: true }, meant: ['row', 'row', 'row'] },
  { name: 'three in a row, the largest ring the courtyard holds through the outer two', snap: 'row', o: { largest: true }, meant: ['row', 'row', 'row'] },
  { name: 'the middle one stepped out half the row, its ring', snap: 'stepped', meant: ['warm', 'warm', 'warm'] },
  { name: 'stepped out only a size and a half, a ring near them', snap: 'nudged', o: { row: true }, meant: ['out', 'out', 'out'] }
];
var SIZES = [[390, 844], [1180, 820]], EASES = ['kind', 'fair', 'strict'], LARGEST = [];

var oneOk = 0, oneAll = 0;
SIZES.forEach(function (s) {
  ['lesson', 'lopsided', 'wide', 'turned'].forEach(function (snap) {
    var fr = friends(snap, s[0], s[1]), v = S.judgeFlames(ring(fr, s[0], s[1]), fr, 'kind'), R = SNAPS[snap].R * Math.min(s[0], s[1]);
    oneAll++; if (!v.row && v.through && Math.abs(v.through.r - R) < 0.5) oneOk++; else console.log('one circle: ' + snap + ' at ' + s.join('x') + ' read ' + JSON.stringify(v.through) + ', row ' + v.row);
  });
  var fr = friends('row', s[0], s[1]), v = S.judgeFlames(ring(fr, s[0], s[1], { row: true }), fr, 'kind');
  oneAll++; if (v.row && !v.through) oneOk++; else console.log('one circle: the row at ' + s.join('x') + ' read row ' + v.row);
});
console.log('one circle: ' + oneOk + ' of ' + oneAll + ' (three not in a row, exactly one; in a row, none)');

var ok = 0, all = 0;
CASES.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var fr = friends(c.snap, s[0], s[1]), v = S.judgeFlames(ring(fr, s[0], s[1], c.o), fr, e), want = c.meant[k];
  all++;
  if (v.reason === want) ok++;
  else console.log(c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; off ' + v.off.join(', ') + ', turns ' + v.turns + ', round ' + v.round + ')');
}); }); });
console.log(ok + ' of ' + all + ' as meant');
console.log('the largest rings through a row: ' + LARGEST.filter(function (x, i) { return LARGEST.indexOf(x) === i; }).join('; ') + ' (kind lets a friend stand ' + S.FLAMES_EASES.kind.near + ' off)');

/* stepping out of the row: in a row no circle; a size and a half out, one circle too big for the yard; out half the
   row, the smallest ring through the outer two (they face each other across the fire), on either side; the radius as
   the step changes is (d squared + h squared) / 2d, h half the row, smallest at d = h */
var stOk = 0, stAll = 0;
function st(name, good) { stAll++; if (good) stOk++; else console.log('step: ' + name); }
SIZES.forEach(function (s) {
  var W = s[0], H = s[1], row = friends('row', W, H), r = size(W, H), h = Math.hypot(row[2].x - row[0].x, row[2].y - row[0].y) / 2, Y = yard(W, H), at = W + 'x' + H + ' ';
  var z = S.stepOut(row, 1, 0, Y); st(at + 'not stepped: a row, no circle', z.row && !z.through && !z.fits);
  z = S.stepOut(row, 1, 0.5 * r, Y); st(at + 'half a size: still a row', z.row && !z.through);
  z = S.stepOut(row, 1, -1.5 * r, Y); st(at + 'a size and a half: one circle, too big for the yard', !z.row && z.through && !z.fits && !z.smallest);
  [-1, 1].forEach(function (sg) { z = S.stepOut(row, 1, sg * h, Y); st(at + (sg < 0 ? 'forward' : 'back') + ' half the row: fits, the smallest', z.fits && z.smallest && Math.abs(z.through.r - h) < 0.5); });
  z = S.stepOut(row, 1, -2 * h, Y); st(at + 'the whole row: a bigger ring again, not the smallest', z.through && !z.smallest && Math.abs(z.through.r - 1.25 * h) < 0.5);
  var least = Infinity, leastD = 0;
  for (var d = 0.3 * h; d <= 3 * h; d += h / 50) { z = S.stepOut(row, 1, -d, Y);
    if (Math.abs(z.through.r - (d * d + h * h) / (2 * d)) > 0.5) { st(at + 'radius at d ' + d.toFixed(1), false); break; }
    if (z.through.r < least) { least = z.through.r; leastD = d; } }
  st(at + 'radius (d² + h²) / 2d, least at d = h', Math.abs(leastD - h) < h / 40);
  z = S.stepOut(row, 0, -h, Y); st(at + 'an end one steps out instead: still one circle', !z.row && !!z.through);
});
console.log('step: ' + stOk + ' of ' + stAll + ' (a row has no ring; out of line, exactly one; the smallest when the outer two face across it)');

/* Four friends (27th session): Harry, Ron and Hermione stand as flames-test.html's fifth round places them (0.30 of
   the short side round the middle at -80, 60 and 180 degrees) and fix one ring; Neville stands on the line out from its
   middle at -30 degrees, off it by so many sizes (plus outside, minus inside), as he walks from 2.5 out to 2.5 in.
   First fix: each friend's distance from the ring the three fix, read back as placed, and how many stand on it. Then
   four: rings drawn through the three (or elsewhere) with Neville where he is, at every ease, each with its meaning:
   on it, warm; off it beyond the ease's near, 'apart'; a ring through him and two of the three, 'out'. */
function four(W, H, off) {
  var fr = [], m = mid(W, H), k = Math.min(W, H), r = size(W, H);
  [-80, 60, 180].forEach(function (a) { a *= Math.PI / 180; fr.push({ x: m.x + 0.3 * k * Math.cos(a), y: m.y + 0.3 * k * Math.sin(a), r: r }); });
  var a = -30 * Math.PI / 180, d = 0.3 * k + off * r;
  fr.push({ x: m.x + d * Math.cos(a), y: m.y + d * Math.sin(a), r: r });
  return fr;
}
var fxOk = 0, fxAll = 0;
SIZES.forEach(function (s2) {
  [-2.5, -1, 0, 1, 2.5].forEach(function (off) {
    var fr = four(s2[0], s2[1], off), v = S.judgeFlames([], fr, 'kind', [0, 1, 2]), R0 = 0.3 * Math.min(s2[0], s2[1]);
    var good = v.fixC && Math.abs(v.fixC.r - R0) < 1 && v.fixOff[0] === 0 && v.fixOff[1] === 0 && v.fixOff[2] === 0 && Math.abs(v.fixOff[3] - off) < 0.02 && v.onFix === 3 + (Math.abs(off) <= S.FLAMES_EASES.kind.near ? 1 : 0) && v.reason === 'tap';
    fxAll++; if (good) fxOk++; else console.log('fix: Neville ' + off + ' off at ' + s2.join('x') + ' read ' + JSON.stringify({ fixC: v.fixC, fixOff: v.fixOff, onFix: v.onFix, reason: v.reason }));
  });
});
console.log('fix: ' + fxOk + ' of ' + fxAll + ' (three fix the ring; the fourth read off it in sizes, along the line from its middle)');

var FOUR = [
  { name: 'Neville on the ring', off: 0, meant: ['warm', 'warm', 'warm'] },
  { name: 'half a size outside', off: 0.5, meant: ['warm', 'warm', 'warm'] },
  { name: '0.9 outside', off: 0.9, meant: ['warm', 'warm', 'apart'] },
  { name: '1.2 outside', off: 1.2, meant: ['warm', 'apart', 'apart'] },
  { name: '1.2 inside', off: -1.2, meant: ['warm', 'apart', 'apart'] },
  { name: 'at the far end, 2.5 outside', off: 2.5, meant: ['apart', 'apart', 'apart'] },
  { name: 'at the near end, 2.5 inside', off: -2.5, meant: ['apart', 'apart', 'apart'] },
  { name: 'drawn the other way round, 2.5 outside', off: 2.5, o: { back: true, start: 90 }, meant: ['apart', 'apart', 'apart'] },
  { name: 'a ring through Harry, Ron and Neville instead', off: 2.5, o: { thru: [0, 1, 3] }, meant: ['out', 'out', 'out'] },
  { name: 'a ring round everyone, too big', off: 2.5, o: { grow: 3 }, meant: ['out', 'out', 'out'] },
  { name: 'a tap', off: 0, o: { tap: true }, meant: ['tap', 'tap', 'tap'] },
  { name: 'without fix, 2.5 outside: out, as before', off: 2.5, nofix: true, meant: ['out', 'out', 'out'] }
];
var frOk = 0, frAll = 0;
FOUR.forEach(function (c) { SIZES.forEach(function (s2) { EASES.forEach(function (e, k) {
  var fr = four(s2[0], s2[1], c.off), v = S.judgeFlames(ring(fr, s2[0], s2[1], c.o), fr, e, c.nofix ? undefined : [0, 1, 2]), want = c.meant[k];
  var good = v.reason === want && (want !== 'apart' || v.apart === 3);
  frAll++; if (good) frOk++;
  else console.log('four: ' + c.name + ' at ' + s2.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; off ' + v.off.join(', ') + ', fixOff ' + (v.fixOff || []).join(', ') + ', apart ' + v.apart + ')');
}); }); });
console.log('four: ' + frOk + ' of ' + frAll + ' (on the ring the three fix, warm; off it beyond the ease, apart)');

/* Q9's fix 4 (thirty-seventh session): any closed loop through all three, judged by judgeLoop, the true circle drawn
   from them. First the old cases through judgeLoop: their meant verdicts kept but for two, changed on purpose and
   named (loopMeant): the long oval stays out of Harry's way by 2.4 sizes, so 'out' where it was 'lumpy'; the
   scribbly wobble comes within 1.06 sizes of Harry, so warm at kind (near 1.4) and 'out' at fair and strict. Then new
   loops, lumpy on purpose, each with what the old judge said at each ease (was: lumpy at strict, or out where kind's
   roundness let it by and its fitted circle missed one) and what the new one means: through all three,
   warm, and then c is the one circle through them, each friend the same distance from its middle; missing one, 'out';
   left open, 'open'; twice round, 'scribble'. Then Four friends through judgeLoop, every meant verdict kept, and loops
   bent out to Neville: a loop can reach him, the ring cannot, so off the ring the three fix he is 'apart'. */
function loopThrough(fr, o) {   /* a loop about the circle through the first three, its radius R (1 + w g), g 0 at each of at */
  var c = S.circleThrough(fr[0], fr[1], fr[2]), n = 180, out = [], r = fr[0].r, i;
  var at = (o.at || [0, 1, 2]).map(function (k) { return Math.atan2(fr[k].y - c.y, fr[k].x - c.x) + (o.rot || 0) * Math.PI / 180; });
  function g(th) { return at.reduce(function (m, a) { var s = Math.sin((th - a) / 2); return m * s * s; }, 1); }
  var gmax = 0; for (i = 0; i < 360; i++) gmax = Math.max(gmax, g(i * Math.PI / 180));
  if (o.tri) {   /* straight from corner to corner and back to the first, a little past it */
    var cs = [0, 1, 2, 0].map(function (k) { return fr[k]; });
    if (o.pull) cs[2] = { x: cs[2].x + (c.x - cs[2].x) * o.pull * r / c.r, y: cs[2].y + (c.y - cs[2].y) * o.pull * r / c.r };
    for (i = 0; i < 3; i++) for (var t = 0; t < 30; t++) out.push({ x: cs[i].x + (cs[i + 1].x - cs[i].x) * t / 30, y: cs[i].y + (cs[i + 1].y - cs[i].y) * t / 30, t: out.length * 14 });
    out.push({ x: cs[3].x + (cs[1].x - cs[3].x) * 0.05, y: cs[3].y + (cs[1].y - cs[3].y) * 0.05, t: out.length * 14 });
    return out;
  }
  var a0 = at[0] - (o.rot || 0) * Math.PI / 180 - 0.3, turns = o.turns || 1.05;
  for (i = 0; i <= n; i++) {
    var th = a0 + turns * 2 * Math.PI * i / n, rr = c.r * (1 + (o.w || 0) * g(th) / gmax);
    if (o.reach) { var dd = Math.atan2(Math.sin(th - o.reach.at), Math.cos(th - o.reach.at)); rr += o.reach.h * r * Math.exp(-Math.pow(dd / (o.reach.s * Math.PI / 180), 2)); }
    out.push({ x: c.x + rr * Math.cos(th), y: c.y + rr * Math.sin(th), t: i * 14 });
  }
  return out;
}
var loopMeant = { 'a long oval': ['out', 'out', 'out'], 'a scribbly wobble': ['warm', 'out', 'out'] };
var lpOk = 0, lpAll = 0, sameC = 0, sameAll = 0;
function warmC(v, fr, f) {   /* warm: c is the one circle through them, each the same distance from its middle */
  if (v.reason !== 'warm') return true;
  var t = S.circleThrough(fr[f[0]], fr[f[1]], fr[f[2]]), ok = !!v.c && !!t && Math.hypot(v.c.x - t.x, v.c.y - t.y) < 0.5 && Math.abs(v.c.r - t.r) < 0.5;
  f.forEach(function (k) { if (!v.c || Math.abs(Math.hypot(fr[k].x - v.c.x, fr[k].y - v.c.y) - v.c.r) > 0.01 * v.c.r) ok = false; });
  sameAll++; if (ok) sameC++; return ok;
}
CASES.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var fr = friends(c.snap, s[0], s[1]), v = S.judgeLoop(ring(fr, s[0], s[1], c.o), fr, e), want = (loopMeant[c.name] || c.meant)[k];
  lpAll++;
  if (v.reason === want && warmC(v, fr, [0, 1, 2])) lpOk++;
  else console.log('loop, old case: ' + c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; off ' + v.off.join(', ') + ')');
}); }); });
var LOOPS = [
  { name: 'lumpy, bulging out between them, through all three', snap: 'lesson', o: { w: 0.5 }, was: ['out', 'lumpy', 'lumpy'], meant: ['warm', 'warm', 'warm'] },
  { name: 'lumpy, lopsided friends, through all three', snap: 'lopsided', o: { w: 0.8 }, was: ['warm', 'out', 'lumpy'], meant: ['warm', 'warm', 'warm'] },
  { name: 'dented in between them, through all three', snap: 'wide', o: { w: -0.5 }, was: ['warm', 'lumpy', 'lumpy'], meant: ['warm', 'warm', 'warm'] },
  { name: 'turned about, bulging, through all three', snap: 'turned', o: { w: 0.6 }, was: ['out', 'lumpy', 'lumpy'], meant: ['warm', 'warm', 'warm'] },
  { name: 'a triangle, corner to corner', snap: 'lesson', o: { tri: true }, was: 'lumpy', meant: ['warm', 'warm', 'warm'] },
  { name: 'a triangle, lopsided friends', snap: 'lopsided', o: { tri: true }, was: 'lumpy', meant: ['warm', 'warm', 'warm'] },
  { name: 'a triangle, its third corner pulled 3 sizes in', snap: 'lesson', o: { tri: true, pull: 3 }, was: 'lumpy', meant: ['out', 'out', 'out'] },
  { name: 'lumpy, its bulges turned onto them', snap: 'lesson', o: { w: 0.5, rot: 60 }, was: ['out', 'lumpy', 'lumpy'], meant: ['out', 'out', 'out'] },
  { name: 'lumpy, three quarters round', snap: 'lesson', o: { w: 0.5, turns: 0.75 }, was: 'open', meant: ['open', 'open', 'open'] },
  { name: 'lumpy, twice round', snap: 'lesson', o: { w: 0.5, turns: 2.0 }, was: 'scribble', meant: ['scribble', 'scribble', 'scribble'] }
];
var wasOk = 0;
LOOPS.forEach(function (c) { SIZES.forEach(function (s) { EASES.forEach(function (e, k) {
  var fr = friends(c.snap, s[0], s[1]), P = loopThrough(fr, c.o), v = S.judgeLoop(P, fr, e), want = c.meant[k], old = S.judgeFlames(P, fr, e).reason;
  lpAll++; if (old === [].concat(c.was)[[].concat(c.was).length > 1 ? k : 0]) wasOk++;
  if (v.reason === want && warmC(v, fr, [0, 1, 2])) lpOk++;
  else console.log('loop: ' + c.name + ' at ' + s.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + '; off ' + v.off.join(', ') + ', turns ' + v.turns + ')');
  if (old !== [].concat(c.was)[[].concat(c.was).length > 1 ? k : 0]) console.log('loop, the old judge: ' + c.name + ' at ' + s.join('x') + ', ' + e + ': ' + old + ' (was ' + c.was + ')');
}); }); });
var FOURLOOPS = [
  { name: 'lumpy through all four, Neville on the ring', off: 0, o: { w: 0.4, at: [0, 1, 2, 3] }, meant: ['warm', 'warm', 'warm'] },
  { name: 'through the three, bent out to Neville 2.5 outside', off: 2.5, o: { reach: { at: -Math.PI / 6, h: 2.5, s: 12 } }, meant: ['apart', 'apart', 'apart'] },
  { name: 'through the three, bent in to Neville 2.5 inside', off: -2.5, o: { reach: { at: -Math.PI / 6, h: -2.5, s: 12 } }, meant: ['apart', 'apart', 'apart'] },
  { name: 'through the three, bent out to Neville 1.2 outside', off: 1.2, o: { reach: { at: -Math.PI / 6, h: 1.2, s: 12 } }, meant: ['warm', 'apart', 'apart'] },
  { name: 'lumpy through the three, Neville on the ring but missed', off: 0, o: { w: 0.5 }, meant: ['out', 'out', 'out'] }
];
FOUR.forEach(function (c) { SIZES.forEach(function (s2) { EASES.forEach(function (e, k) {
  var fr = four(s2[0], s2[1], c.off), v = S.judgeLoop(ring(fr, s2[0], s2[1], c.o), fr, e, c.nofix ? undefined : [0, 1, 2]), want = c.meant[k];
  lpAll++; if (v.reason === want && (want !== 'apart' || v.apart === 3) && warmC(v, fr, [0, 1, 2])) lpOk++;
  else console.log('loop, four: ' + c.name + ' at ' + s2.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + ', apart ' + v.apart + ')');
}); }); });
FOURLOOPS.forEach(function (c) { SIZES.forEach(function (s2) { EASES.forEach(function (e, k) {
  var fr = four(s2[0], s2[1], c.off), v = S.judgeLoop(loopThrough(fr, c.o), fr, e, [0, 1, 2]), want = c.meant[k];
  lpAll++; if (v.reason === want && (want !== 'apart' || v.apart === 3) && warmC(v, fr, [0, 1, 2])) lpOk++;
  else console.log('loop, four: ' + c.name + ' at ' + s2.join('x') + ', ' + e + ': ' + v.reason + ' (meant ' + want + ', apart ' + v.apart + '; off ' + v.off.join(', ') + ')');
}); }); });
console.log('loop: ' + lpOk + ' of ' + lpAll + ' as meant (any closed loop through all three; the old judge said ' + wasOk + ' of ' + LOOPS.length * 6 + ' as listed; warm, the one circle through them, ' + sameC + ' of ' + sameAll + ')');
