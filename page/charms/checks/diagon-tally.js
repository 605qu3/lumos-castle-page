/* The Diagon Alley wall judging, tallied in node: node page/charms/checks/diagon-tally.js
   Loads page/charms/spells.js and runs taps through judgeBrick on the test page's wall (diagon-test.html, wallOf()),
   at a phone, an iPad and a phone on its side, straight and in running bond, at every ease. Each case is marked with
   what it is meant to be, worked out from the wall's own layout here, not from the judge: every brick's middle against
   five wanted bricks (Hagrid's (2, 3) and four more, one on a shifted course); taps just outside the wanted brick by a
   tenth and a fifth of a course; the bin; off the wall; and the two names of one brick, Hagrid's "two across" and
   Harry's "third brick from the left" (PS 5, PoA 4), walked along every course from the left end, the bat counted.
   Prints each miss of meaning and the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the wall as the page lays it out: below the line card, above the buttons; six courses above the bin's lid and two
   beside it; five bricks across on a narrow screen, six on a wide one; a course at most 56 px, the brick no flatter
   than 1.6 to 1 and no longer than 2.6 to 1 */
function wallOf(W, H, running) {
  var top = Math.max(110, H * 0.16), bot = H - 70, cols = W >= 700 ? 6 : 5, rows = 6, below = 2;
  var bh = Math.min(56, (bot - top) / (rows + below + 0.6)), bw = Math.min(W * 0.92 / cols, bh * 2.6);
  if (bw < bh * 1.6) bh = bw / 1.6;
  var x = W / 2 - cols * bw / 2, y = bot - below * bh;
  return { x: x, y: y, bw: bw, bh: bh, cols: cols, rows: rows, below: below, running: !!running,
    bin: { x: x + bw * 0.08, y: y + 2, w: bw * 0.84, h: below * bh - 2 } };
}
/* the bricks of a course, left to right, each [a, x0, x1], from the layout alone */
function course(w, u) {
  var out = [], shifted = w.running && u % 2 === 0, x = w.x, end = w.x + w.cols * w.bw, a = 0;
  if (shifted) { out.push([0, x, x + w.bw / 2]); x += w.bw / 2; a = 1; }
  for (; x < end - 1e-6; a++) { var x1 = Math.min(end, x + w.bw); out.push([a, x, x1]); x = x1; }
  return out;
}
function meant(b, want) {
  if (b.a === want.a && b.u === want.u) return 'right';
  if (b.u < 1) return 'below';
  if (want.a !== want.u && b.a === want.u && b.u === want.a) return 'swapped';
  if (b.a === want.a) return 'column';
  if (b.u === want.u) return 'row';
  return 'off';
}

var SIZES = [[390, 844], [1180, 820], [844, 390]], EASES = ['kind', 'fair', 'strict'];
var WANTS = [{ a: 2, u: 3 }, { a: 3, u: 2 }, { a: 4, u: 1 }, { a: 1, u: 5 }, { a: 2, u: 2 }];
var n = 0, bad = 0;
function check(label, got, want) { n++; if (got !== want) { bad++; console.log('MISS ' + label + ': got ' + got + ', meant ' + want); } }

SIZES.forEach(function (sz) { [false, true].forEach(function (run) { EASES.forEach(function (ease) {
  var w = wallOf(sz[0], sz[1], run), tag = sz.join('x') + (run ? ' running ' : ' straight ') + ease;
  WANTS.forEach(function (want) {
    for (var u = 1 - w.below; u <= w.rows; u++) course(w, u).forEach(function (br) {
      var p = { x: (br[1] + br[2]) / 2, y: w.y - (u - 0.5) * w.bh }, j = S.judgeBrick(p, w, want, ease);
      var inBin = p.x >= w.bin.x && p.x <= w.bin.x + w.bin.w && p.y >= w.bin.y && p.y <= w.bin.y + w.bin.h;
      var m = inBin ? 'bin' : meant({ a: br[0], u: u }, want);
      /* a neighbour's middle lies within the edge's reach of the wanted brick only if the brick is tiny; never here */
      check(tag + ' want ' + want.a + ',' + want.u + ' tap ' + br[0] + ',' + u, j.reason, m);
      if (!inBin && j.brick) check(tag + ' place ' + br[0] + ',' + u, j.place, br[0] + 1);
    });
    /* just outside the wanted brick, above and to the right: a tenth of a course counts at kind and fair, a fifth at kind only */
    var cs = course(w, want.u).filter(function (br) { return br[0] === want.a; })[0];
    [[0.1, { kind: 1, fair: 1, strict: 0 }], [0.2, { kind: 1, fair: 0, strict: 0 }]].forEach(function (d) {
      var off = d[0] * w.bh, above = { x: (cs[1] + cs[2]) / 2, y: w.y - want.u * w.bh - off }, right = { x: cs[2] + off, y: w.y - (want.u - 0.5) * w.bh };
      [['above', above], ['right', right]].forEach(function (q) {
        var j = S.judgeBrick(q[1], w, want, ease);
        if (q[0] === 'right' && cs[2] >= w.x + w.cols * w.bw - 1e-6) return;   /* the wall's right end: off the wall either way */
        check(tag + ' want ' + want.a + ',' + want.u + ' ' + d[0] + ' ' + q[0], j.verdict, d[1][ease] ? 'right' : 'miss');
        if (d[1][ease]) check(tag + ' near flag ' + d[0] + ' ' + q[0], j.near, true);
      });
    });
  });
  check(tag + ' the bin', S.judgeBrick({ x: w.bin.x + w.bin.w / 2, y: w.bin.y + w.bin.h / 2 }, w, WANTS[0], ease).reason, 'bin');
  check(tag + ' left of the wall', S.judgeBrick({ x: w.x - 10, y: w.y - 2.5 * w.bh }, w, WANTS[0], ease).reason, 'away');
  check(tag + ' above the wall', S.judgeBrick({ x: w.x + w.bw, y: w.y - w.rows * w.bh - 10 }, w, WANTS[0], ease).reason, 'away');
  /* the two names: walk each course from the left end and count bricks; the third is Hagrid's two across */
  for (var u = 1; u <= w.rows; u++) {
    var seen = [], last = null;
    for (var x = w.x + 0.5; x < w.x + w.cols * w.bw; x += 1) {
      var b = S.brickAt({ x: x, y: w.y - (u - 0.5) * w.bh }, w), k = b ? b.a + ',' + b.u : null;
      if (k !== last) { seen.push(b); last = k; }
    }
    check(tag + ' course ' + u + ' third from the left', seen[2] ? seen[2].a + ',' + seen[2].u : 'none', '2,' + u);
    check(tag + ' course ' + u + ' third from the left is two across', S.judgeBrick({ x: (course(w, u)[2][1] + course(w, u)[2][2]) / 2, y: w.y - (u - 0.5) * w.bh }, w, { a: 2, u: u }, 'strict').verdict, 'right');
  }
}); }); });
console.log('bricks ' + (n - bad) + ' of ' + n + (bad ? ' (' + bad + ' off)' : ''));
process.exitCode = bad ? 1 : 0;
