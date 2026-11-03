/* The Riddikulus judging, tallied in node: node page/charms/checks/riddikulus-tally.js
   Loads page/charms/spells.js and runs drawn mirror lines through judgeMirror at a phone and an iPad size and every
   ease, over the two boggarts' boxes (Snape standing, 0.32 by 0.6 of the screen's short side; the spider, 0.5 by 0.3).
   Each line is marked with what it is meant to be at kind, fair and strict: a flip, or the miss's reason. Then the
   reflection itself (reflectOver): each image on the perpendicular, as far on the other side, and twice is home.
   Prints each miss of meaning and the counts. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* a line through the box: axis 'down' or 'across', leaning tilt degrees (+ clockwise on the screen), crossing at share
   of the half width (down) or half height (across) from the middle, spanning cover of the box's height (down) or width;
   rev draws it the other way; bow bends it (the bulge as a share of its length) */
function line(box, axis, tilt, share, cover, o) {
  o = o || {};
  var t = tilt * Math.PI / 180, cx = box.x + box.w / 2, cy = box.y + box.h / 2, c, u, len;
  if (axis === 'down') { c = { x: cx + share * box.w / 2, y: cy }; u = { x: -Math.sin(t), y: Math.cos(t) }; len = cover * box.h / Math.cos(t); }
  else { c = { x: cx, y: cy + share * box.h / 2 }; u = { x: Math.cos(t), y: Math.sin(t) }; len = cover * box.w / Math.cos(t); }
  if (o.rev) u = { x: -u.x, y: -u.y };
  var n = 30, out = [], i, k, w;
  for (i = 0; i <= n; i++) {
    k = i / n - 0.5; w = (o.bow || 0) * len * 4 * (0.5 + k) * (0.5 - k);
    out.push({ x: c.x + u.x * len * k - u.y * w, y: c.y + u.y * len * k + u.x * w, t: i * 15 });
  }
  return out;
}

var EASES = ['kind', 'fair', 'strict'], SIZES = [[390, 844], [1180, 820]], bad = [], n = 0, m = 0, mbad = 0;
var F = 'flip';
/* [name, box ('snape' or 'spider'), want, axis, tilt, share, cover, opts, meant at kind, fair, strict] */
var LINES = [
  ['down the middle', 'snape', 'down', 'down', 0, 0, 1.2, {}, [F, F, F]],
  ['down the middle, drawn upward', 'snape', 'down', 'down', 0, 0, 1.2, { rev: true }, [F, F, F]],
  ['down, leaning 6', 'snape', 'down', 'down', 6, 0, 1.2, {}, [F, F, F]],
  ['down, leaning 12', 'snape', 'down', 'down', 12, 0, 1.2, {}, [F, F, 'slant']],
  ['down, leaning -12, drawn upward', 'snape', 'down', 'down', -12, 0, 1.2, { rev: true }, [F, F, 'slant']],
  ['down, leaning 18', 'snape', 'down', 'down', 18, 0, 1.2, {}, [F, 'slant', 'slant']],
  ['down, leaning 30', 'snape', 'down', 'down', 30, 0, 1.2, {}, ['slant', 'slant', 'slant']],
  ['corner to corner, 45', 'snape', 'down', 'down', 45, 0, 1.2, {}, ['slant', 'slant', 'slant']],
  ['across him when down is wanted', 'snape', 'down', 'across', 0, 0, 1.2, {}, ['across', 'across', 'across']],
  ['down, a fifth off the middle', 'snape', 'down', 'down', 0, 0.2, 1.2, {}, [F, F, F]],
  ['down, two fifths off', 'snape', 'down', 'down', 0, -0.4, 1.2, {}, [F, F, 'beside']],
  ['down, nearly at his edge', 'snape', 'down', 'down', 0, 0.65, 1.2, {}, [F, 'beside', 'beside']],
  ['down, past him', 'snape', 'down', 'down', 0, 1.2, 1.2, {}, ['beside', 'beside', 'beside']],
  ['down, over half of him', 'snape', 'down', 'down', 0, 0, 0.6, {}, ['short', 'short', 'short']],
  ['down, over four fifths', 'snape', 'down', 'down', 0, 0, 0.8, {}, [F, 'short', 'short']],
  ['down, over nine tenths', 'snape', 'down', 'down', 0, 0, 0.9, {}, [F, F, 'short']],
  ['down, just bent', 'snape', 'down', 'down', 0, 0, 1.2, { bow: 0.08 }, [F, F, F]],
  ['down, a banana', 'snape', 'down', 'down', 0, 0, 1.2, { bow: 0.35 }, ['wiggly', 'wiggly', 'wiggly']],
  ['across the middle', 'spider', 'across', 'across', 0, 0, 1.2, {}, [F, F, F]],
  ['across, right to left', 'spider', 'across', 'across', 0, 0, 1.2, { rev: true }, [F, F, F]],
  ['across, dipping 12', 'spider', 'across', 'across', 12, 0, 1.2, {}, [F, F, 'slant']],
  ['across, rising 18', 'spider', 'across', 'across', -18, 0, 1.2, {}, [F, 'slant', 'slant']],
  ['across, two fifths low', 'spider', 'across', 'across', 0, 0.4, 1.2, {}, [F, F, 'beside']],
  ['across, under it', 'spider', 'across', 'across', 0, -1.3, 1.2, {}, ['beside', 'beside', 'beside']],
  ['across, over half', 'spider', 'across', 'across', 0, 0, 0.6, {}, ['short', 'short', 'short']],
  ['down the spider when across is wanted', 'spider', 'across', 'down', 0, 0, 1.2, {}, ['down', 'down', 'down']],
  ['either way: down', 'snape', null, 'down', 0, 0, 1.2, {}, [F, F, F]],
  ['either way: across', 'spider', null, 'across', 0, 0, 1.2, {}, [F, F, F]]
];
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1], s = Math.min(W, H);
  var boxes = { snape: { w: 0.32 * s, h: 0.6 * s }, spider: { w: 0.5 * s, h: 0.3 * s } };
  Object.keys(boxes).forEach(function (k) { var b = boxes[k]; b.x = W / 2 - b.w / 2; b.y = H * 0.45 - b.h / 2; });
  LINES.forEach(function (L) {
    var box = boxes[L[1]], pts = line(box, L[3], L[4], L[5], L[6], L[7]);
    EASES.forEach(function (ease, i) {
      var j = S.judgeMirror(pts, box, L[2], ease), got = j.verdict === 'flip' ? F : j.reason; n++;
      if (got !== L[8][i]) bad.push(W + 'x' + H + ' ' + ease + ' "' + L[0] + '": ' + got + ', meant ' + L[8][i] + ' (tilt ' + j.tilt + ', share ' + j.share + ', cover ' + j.cover + ', straight ' + j.straight.toFixed(3) + ')');
    });
    /* where the mirror stands: at the share asked, to a pixel, and the lean's sign as drawn */
    var j = S.judgeMirror(pts, box, null, 'kind'), want = L[3] === 'down' ? box.x + box.w / 2 + L[5] * box.w / 2 : box.y + box.h / 2 + L[5] * box.h / 2; n++;
    if (j.axis === L[3] && (Math.abs(j.at - want) > 1 || (L[4] && Math.sign(j.tilt) !== Math.sign(L[4])))) bad.push(W + 'x' + H + ' "' + L[0] + '": at ' + j.at + ', meant ' + Math.round(want) + '; tilt ' + j.tilt + ', meant ' + L[4]);
  });
  /* a tap and a dot are taps */
  var b = boxes.snape, c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  [[c], [c, { x: c.x + 3, y: c.y + 2, t: 60 }]].forEach(function (pts) {
    EASES.forEach(function (ease) { n++; var j = S.judgeMirror(pts, b, 'down', ease); if (j.reason !== 'tap') bad.push(W + 'x' + H + ' ' + ease + ' tap: ' + j.reason); });
  });
});

/* the reflection: 400 points over 400 lines, a seeded walk so the count is the same every run */
var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
for (var r = 0; r < 400; r++) {
  var a = { x: rnd() * 1000, y: rnd() * 800 }, bb = { x: rnd() * 1000, y: rnd() * 800 }, p = { x: rnd() * 1000, y: rnd() * 800 };
  if (Math.hypot(bb.x - a.x, bb.y - a.y) < 20) continue;
  var q = S.reflectOver(p, a, bb), back = S.reflectOver(q, a, bb), dx = bb.x - a.x, dy = bb.y - a.y, L = Math.hypot(dx, dy);
  var mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }, onLine = Math.abs((mid.x - a.x) * dy - (mid.y - a.y) * dx) / L;
  var square = Math.abs((q.x - p.x) * dx + (q.y - p.y) * dy) / L, dp = ((p.x - a.x) * dy - (p.y - a.y) * dx) / L, dq = ((q.x - a.x) * dy - (q.y - a.y) * dx) / L;
  var home = Math.hypot(back.x - p.x, back.y - p.y); m++;
  if (onLine > 1e-6 || square > 1e-6 || Math.abs(dp + dq) > 1e-6 || home > 1e-6) { mbad++; if (mbad < 5) console.log('reflect: ' + JSON.stringify({ a: a, b: bb, p: p, q: q })); }
}

/* the slanted mirror (want a number): Parvati's mummy, 0.32 by 0.6 like Snape, the mirror wanted at 45 either way.
   slantLine: leaning lean degrees (+ clockwise), passing share of the half extent square to it from the middle,
   spanning cover of its own run across the box, centred on that run; rev and bow as line's */
function slantLine(box, lean, share, cover, o) {
  o = o || {};
  var t = lean * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t), nx = -uy, ny = ux, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  var hn = Math.abs(nx) * box.w / 2 + Math.abs(ny) * box.h / 2, c = { x: cx + nx * share * hn, y: cy + ny * share * hn };
  var s0 = -1e9, s1 = 1e9;
  [[c.x, ux, box.x, box.x + box.w], [c.y, uy, box.y, box.y + box.h]].forEach(function (d) {
    if (Math.abs(d[1]) < 1e-9) return; var lo = (d[2] - d[0]) / d[1], hi = (d[3] - d[0]) / d[1]; if (lo > hi) { var q = lo; lo = hi; hi = q; }
    s0 = Math.max(s0, lo); s1 = Math.min(s1, hi);
  });
  if (s1 <= s0) { s0 = -box.h / 2; s1 = box.h / 2; }   /* past the box: a line as long as it is tall */
  var len = cover * (s1 - s0), mid = (s0 + s1) / 2, m = { x: c.x + ux * mid, y: c.y + uy * mid };
  if (o.rev) { ux = -ux; uy = -uy; }
  var N = 30, out = [], i, k, w;
  for (i = 0; i <= N; i++) { k = i / N - 0.5; w = (o.bow || 0) * len * 4 * (0.5 + k) * (0.5 - k); out.push({ x: m.x + ux * len * k - uy * w, y: m.y + uy * len * k + ux * w, t: i * 15 }); }
  return out;
}
/* [name, lean, share, cover, opts, meant at kind, fair, strict] */
var SLANTS = [
  ['45, through the middle', 45, 0, 1.2, {}, [F, F, F]],
  ['45 the other way', -45, 0, 1.2, {}, [F, F, F]],
  ['45, drawn downward', 45, 0, 1.2, { rev: true }, [F, F, F]],
  ['50', 50, 0, 1.2, {}, [F, F, F]],
  ['-39', -39, 0, 1.2, {}, [F, F, F]],
  ['57', 57, 0, 1.2, {}, [F, F, 'slant']],
  ['33', 33, 0, 1.2, {}, [F, F, 'slant']],
  ['-63', -63, 0, 1.2, {}, [F, 'slant', 'slant']],
  ['27', 27, 0, 1.2, {}, [F, 'slant', 'slant']],
  ['75', 75, 0, 1.2, {}, ['slant', 'slant', 'slant']],
  ['15', 15, 0, 1.2, {}, ['slant', 'slant', 'slant']],
  ['upright', 0, 0, 1.2, {}, ['slant', 'slant', 'slant']],
  ['level, across', 90, 0, 1.2, {}, ['slant', 'slant', 'slant']],
  ['45, 0.2 off the middle', 45, 0.2, 1.2, {}, [F, F, F]],
  ['45, 0.4 off', 45, -0.4, 1.2, {}, [F, F, 'beside']],
  ['45, 0.6 off', 45, 0.6, 1.2, {}, [F, 'beside', 'beside']],
  ['45, past it', -45, 1.3, 1.2, {}, ['beside', 'beside', 'beside']],
  ['45, 0.9 of the way', 45, 0, 0.9, {}, [F, F, 'short']],
  ['45, three quarters', 45, 0, 0.75, {}, [F, 'short', 'short']],
  ['45, half way', 45, 0, 0.5, {}, ['short', 'short', 'short']],
  ['45, bowed a little', 45, 0, 1.2, { bow: 0.05 }, [F, F, F]],
  ['45, bowed', 45, 0, 1.2, { bow: 0.15 }, [F, F, 'wiggly']],
  ['45, a curve', 45, 0, 1.2, { bow: 0.3 }, ['wiggly', 'wiggly', 'wiggly']]
];
var sn = 0, sbad = [], tn = 0, tbad = [];
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1], Sx = Math.min(W, H), box = { x: W / 2 - Sx * 0.16, y: H * 0.7 - Sx * 0.6, w: Sx * 0.32, h: Sx * 0.6 };
  SLANTS.forEach(function (L) {
    var pts = slantLine(box, L[1], L[2], L[3], L[4]);
    EASES.forEach(function (ease, i) {
      var j = S.judgeMirror(pts, box, 45, ease), got = j.verdict === 'flip' ? F : j.reason; sn++;
      if (got !== L[5][i]) sbad.push(W + 'x' + H + ' ' + ease + ' slant "' + L[0] + '": ' + got + ', meant ' + L[5][i] + ' (lean ' + j.lean + ', tilt ' + j.tilt + ', share ' + j.share + ', cover ' + j.cover + ', straight ' + j.straight.toFixed(3) + ')');
    });
    /* read back: the lean as drawn, the turn twice it, the share where it passed, to a hundredth */
    if (!L[4].bow && L[1] !== 90) {
      var j = S.judgeMirror(pts, box, 45, 'kind'); sn++;
      if (Math.abs(j.lean - L[1]) > 0.1 || Math.abs(j.turn - 2 * j.lean) > 0.11 || Math.abs(j.share - L[2]) > 0.011) sbad.push(W + 'x' + H + ' slant "' + L[0] + '" read back: lean ' + j.lean + ', turn ' + j.turn + ', share ' + j.share);
    }
  });
  var c = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  [[c], [c, { x: c.x + 3, y: c.y + 2, t: 60 }]].forEach(function (pts) {
    EASES.forEach(function (ease) { sn++; var j = S.judgeMirror(pts, box, 45, ease); if (j.reason !== 'tap') sbad.push(W + 'x' + H + ' ' + ease + ' slant tap: ' + j.reason); });
  });
  /* twice: an upright thing (the box's top and foot) reflected over his line comes out leaning twice the line's lean,
     the middle as far beyond the line as it was before it, square to it */
  [10, 25, 45, 60, -30, -45, -80].forEach(function (lean) {
    var j = S.judgeMirror(slantLine(box, lean, 0.1, 1.2), box, 45, 'kind'), A = j.a, B = j.b; tn++;
    var top = S.reflectOver({ x: c.x, y: box.y }, A, B), foot = S.reflectOver({ x: c.x, y: box.y + box.h }, A, B);
    var came = Math.atan2(top.x - foot.x, foot.y - top.y) * 180 / Math.PI, exact = Math.atan2(B.x - A.x, A.y - B.y) * 180 / Math.PI;
    if (exact > 90) exact -= 180; if (exact <= -90) exact += 180;
    var d = ((came - 2 * exact) % 360 + 540) % 360 - 180;
    if (Math.abs(d) > 1e-6 || Math.abs(j.turn - 2 * exact) > 0.11) tbad.push(W + 'x' + H + ' twice at ' + lean + ': came out at ' + came.toFixed(3) + ', the line at ' + exact.toFixed(3) + ', turn ' + j.turn);
  });
});

bad.forEach(function (x) { console.log(x); });
console.log((n - bad.length) + ' of ' + n + ' as meant');
sbad.forEach(function (x) { console.log(x); });
console.log('slant: ' + (sn - sbad.length) + ' of ' + sn + ' as meant (a mirror leaning 45, either way)');
tbad.forEach(function (x) { console.log(x); });
console.log('twice: ' + (tn - tbad.length) + ' of ' + tn + ' (an upright thing over a line leaning a comes out leaning 2a)');
console.log('reflect: ' + (m - mbad) + ' of ' + m + ' (the image on the perpendicular, as far the other side, twice is home)');

/* Two mirrors side by side (13 October 2026, twenty-ninth session; Seamus's banshee, PoA 7): judgeTwoMirrors at both
   sizes and every ease, over a box as the page's banshee (0.28 by 0.6 of the short side), the mirrors upright and
   leaning 20, -35 and 45 (want the same lean): the second beside the first at gaps given as a share of the box's
   extent square to the lines, either side and drawn either way; not parallel by 4, 7, 10 and 20 degrees; too close;
   bowed; short; the first beside her or leaning wrong; a tap for the second; off the stage. Each slide read back:
   every point flipped over the first and then the second lands slid by exactly the slide, the slide square to the
   lines and twice the gap, and the right way round (the turn of a corner kept). */
var wn = 0, wbad = [], xn = 0, xbad = [];
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1], Sx = Math.min(W, H), box = { x: W / 2 - Sx * 0.14, y: H * 0.5 - Sx * 0.3, w: Sx * 0.28, h: Sx * 0.6 };
  function nOf(lean) { var t = lean * Math.PI / 180; return { x: Math.cos(t), y: Math.sin(t) }; }   /* square to a line leaning lean, right or down */
  function across(lean) { var n = nOf(lean); return Math.abs(n.x) * box.w + Math.abs(n.y) * box.h; }
  function beside(lean, gapShare, lean2, cover, o) {   /* the second line: as the first, slid gapShare of the across extent along n */
    var n = nOf(lean), g = gapShare * across(lean), b2 = { x: box.x + n.x * g, y: box.y + n.y * g, w: box.w, h: box.h };
    return slantLine(b2, lean2 === undefined ? lean : lean2, 0.1, cover || 1.2, o);
  }
  [0, 20, -35, 45].forEach(function (lean) {
    var first = slantLine(box, lean, 0.1, 1.2, {});
    var CASES = [   /* [name, first, second, meant at kind, fair, strict, stage] */
      ['side by side, half her width apart', first, beside(lean, 0.5), ['slide', 'slide', 'slide']],
      ['side by side, 0.8 apart, the second drawn the other way', first, beside(lean, 0.8, lean, 1.2, { rev: true }), ['slide', 'slide', 'slide']],
      ['on her other side, 0.6 apart', first, beside(lean, -0.6), ['slide', 'slide', 'slide']],
      ['1.2 apart, the second 4 degrees off', first, beside(lean, 1.2, lean + 4), ['slide', 'slide', 'slide']],
      ['the second 7 degrees off', first, beside(lean, 0.8, lean - 7), ['slide', 'slide', 'cross']],
      ['the second 10 degrees off', first, beside(lean, 0.8, lean + 10), ['slide', 'cross', 'cross']],
      ['the second 20 degrees off, they would cross', first, beside(lean, 0.8, lean + 20), ['cross', 'cross', 'cross']],
      ['0.28 apart', first, beside(lean, 0.28), ['slide', 'close', 'close']],
      ['0.32 apart', first, beside(lean, 0.32), ['slide', 'slide', 'close']],
      ['0.1 apart, nearly on the first', first, beside(lean, 0.1), ['close', 'close', 'close']],
      ['the second bowed a little', first, beside(lean, 0.6, lean, 1.2, { bow: 0.15 }), ['slide', 'slide', 'wiggly2']],
      ['the second bowed a lot', first, beside(lean, 0.6, lean, 1.2, { bow: 0.3 }), ['wiggly2', 'wiggly2', 'wiggly2']],
      ['the second short, 0.6 of her', first, beside(lean, 0.6, lean, 0.6), ['short2', 'short2', 'short2']],
      ['the second 0.8 of her', first, beside(lean, 0.6, lean, 0.8), ['slide', 'short2', 'short2']],
      ['the first beside her', slantLine(box, lean, 1.3, 1.2, {}), beside(lean, 1.8), ['beside', 'beside', 'beside']],
      ['the first leaning 30 more', slantLine(box, lean + 30, 0, 1.2, {}), beside(lean, 0.6), ['slant', 'slant', 'slant']],
      ['a tap for the second', first, [{ x: box.x + box.w * 1.4, y: box.y + box.h / 2, t: 0 }, { x: box.x + box.w * 1.4 + 2, y: box.y + box.h / 2 + 1, t: 30 }], ['tap2', 'tap2', 'tap2']],
      ['slid off the stage', first, beside(lean, 0.6), ['far', 'far', 'far'], { x: box.x - 4, y: box.y - 4, w: box.w * 1.5, h: box.h * 1.5 }]
    ];
    CASES.forEach(function (k) {
      EASES.forEach(function (ease, i) {
        var j = S.judgeTwoMirrors(k[1], k[2], box, Math.abs(lean), ease, k[4]), got = j.verdict === 'slide' ? 'slide' : j.reason; wn++;
        if (got !== k[3][i]) wbad.push(W + 'x' + H + ' ' + ease + ' two at ' + lean + ' "' + k[0] + '": ' + got + ', meant ' + k[3][i] + ' (par ' + j.par + ', gap ' + j.gap + ', cover2 ' + j.cover2 + ', straight2 ' + j.straight2.toFixed(3) + ')');
        if (j.verdict !== 'slide') return;
        /* read back: the two flips are the slide, square to the lines, twice the gap, the right way round */
        var u = { x: j.b1.x - j.a1.x, y: j.b1.y - j.a1.y }, ul = Math.hypot(u.x, u.y), sl = Math.hypot(j.slide.x, j.slide.y), worst = 0, turned = false, q;
        for (q = 0; q < 6; q++) {
          var p = { x: box.x + rnd() * box.w * 2 - box.w / 2, y: box.y + rnd() * box.h }, p2 = { x: p.x + 9, y: p.y }, p3 = { x: p.x, y: p.y + 7 };
          var f = function (z) { return S.reflectOver(S.reflectOver(z, j.a1, j.b1), j.a2, j.b2); }, z1 = f(p), z2 = f(p2), z3 = f(p3);
          worst = Math.max(worst, Math.hypot(z1.x - p.x - j.slide.x, z1.y - p.y - j.slide.y));
          if ((z2.x - z1.x) * (z3.y - z1.y) - (z2.y - z1.y) * (z3.x - z1.x) <= 0) turned = true;   /* 9 right then 7 down turns clockwise: kept */
        }
        var square = Math.abs((j.slide.x * u.x + j.slide.y * u.y) / ul), twice = Math.abs(sl - 2 * Math.abs(j.gap));
        xn++;
        if (worst > 1e-6 || square > 1e-6 || twice > 0.21 || turned) xbad.push(W + 'x' + H + ' ' + ease + ' two at ' + lean + ' "' + k[0] + '" read back: off ' + worst + ', square ' + square + ', twice ' + twice + ', turned ' + turned);
      });
    });
  });
});
wbad.forEach(function (x) { console.log(x); });
console.log('two: ' + (wn - wbad.length) + ' of ' + wn + ' as meant (two mirrors side by side, upright and leaning 20, -35 and 45)');
xbad.forEach(function (x) { console.log(x); });
console.log('slide: ' + (xn - xbad.length) + ' of ' + xn + ' (flipped over the first, then the second: slid square to the lines, twice the gap, the right way round)');
