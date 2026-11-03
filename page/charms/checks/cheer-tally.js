/* The Cheering Charm judging, tallied in node: node page/charms/checks/cheer-tally.js
   Loads page/charms/spells.js and runs drawn smiles through judgeCheer on the test page's three glum portraits, at a
   phone and an iPad scale and every ease, each marked with what it is meant to be at kind, fair and strict. First the
   sign: the frown's own arc, drawn as it stands, must read bowed up ('glum') and its mirror bowed down. Prints each
   miss of meaning and the count. At the end, Q9's fix 5: judgeSmile, corner to corner, the old cases and new ones. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the mouths as the page lays them out (cheer-test.html, mouthOf()): the portrait's height the smaller of 0.5 of the
   screen's height and 0.9 of the short side; the mouth at W/2, 0.44 H + 0.18 of that height; its half width and the
   frown's depth shares of that height, per round */
var WIDE = [0.14, 0.20, 0.15], DEEP = [0.05, 0.05, 0.06];
function mouthOf(k, W, H) {
  var s = Math.min(W, H), ph = Math.min(H * 0.5, s * 0.9);
  return { x: W / 2, y: H * 0.44 + ph * 0.18, w: ph * WIDE[k], depth: ph * DEEP[k] };
}
/* a stroke in the mouth's own frame, in half widths (x right, y down), as a list of [x, y]; D stands for the frown's
   depth in half widths, so a case reads the same on every round */
function arc(w0, depth, o) {   /* a true arc from (-w0, 0) to (w0, 0), its middle `depth` down (up if -) */
  o = o || {}; var out = [], n = 64, i, s = Math.abs(depth);
  for (i = 0; i <= n; i++) {
    var f = i / n, x, y;
    if (s < 1e-6) { x = -w0 + 2 * w0 * f; y = 0; }
    else {
      var r = w0 * w0 / (2 * s) + s / 2, th = Math.asin(Math.min(1, w0 / r));
      if (s > w0) th = Math.PI - th;
      var a = -th + 2 * th * f; x = r * Math.sin(a); y = (r * Math.cos(a) - (r - s)) * (depth < 0 ? -1 : 1);
    }
    y += (o.trem || 0) * Math.sin(f * 2 * w0 / 0.1 * Math.PI);
    out.push([x + (o.dx || 0), y + (o.dy || 0)]);
  }
  if (o.tilt) { var t = o.tilt * Math.PI / 180; out = out.map(function (p) { return [p[0] * Math.cos(t) - p[1] * Math.sin(t), p[0] * Math.sin(t) + p[1] * Math.cos(t)]; }); }
  return o.back ? out.reverse() : out;
}
function curve(fn) { var out = []; for (var i = 0; i <= 64; i++) out.push(fn(i / 64)); return out; }
function skew(depth, p) { return curve(function (f) { return [-1 + 2 * f, depth * Math.sin(Math.PI * Math.pow(f, p))]; }); }
function vee(depth) { return curve(function (f) { return [-1 + 2 * f, depth * (1 - Math.abs(2 * f - 1))]; }); }
function sCurve(depth) { return curve(function (f) { return [-1 + 2 * f, depth * Math.sin(2 * Math.PI * f)]; }); }
function scribble() { return curve(function (f) { return [-0.8 + 1.6 * f + 0.35 * Math.sin(f * 37), 0.3 * Math.sin(f * 23)]; }); }
function tap() { return [[0, 0.1], [0.01, 0.105], [0.015, 0.1]]; }

/* [name, stroke (a function of D), meaning at kind, fair, strict] */
var CASES = [
  ['the same arc flipped',           function (D) { return arc(1, D); },                    ['cheered', 'cheered', 'cheered']],
  ['flipped, drawn right to left',   function (D) { return arc(1, D, { back: 1 }); },       ['cheered', 'cheered', 'cheered']],
  ['a little deeper, 1.4',           function (D) { return arc(1, 1.4 * D); },              ['cheered', 'cheered', 'cheered']],
  ['deeper, 1.8',                    function (D) { return arc(1, 1.8 * D); },              ['cheered', 'cheered', 'fits']],
  ['twice as deep',                  function (D) { return arc(1, 2.2 * D); },              ['cheered', 'fits', 'fits']],
  ['overdone, 3.5',                  function (D) { return arc(1, 3.5 * D); },              ['fits', 'fits', 'fits']],
  ['a half circle',                  function (D) { return arc(1, 1); },                    ['fits', 'fits', 'fits']],
  ['a little shallow, 0.6',          function (D) { return arc(1, 0.6 * D); },              ['cheered', 'cheered', 'flat']],
  ['shallow, 0.48',                  function (D) { return arc(1, 0.48 * D); },             ['cheered', 'flat', 'flat']],
  ['a straight line',                function (D) { return arc(1, 0); },                    ['flat', 'flat', 'flat']],
  ['the frown again',                function (D) { return arc(1, -D); },                   ['glum', 'glum', 'glum']],
  ['the frown, right to left',       function (D) { return arc(1, -D, { back: 1 }); },      ['glum', 'glum', 'glum']],
  ['a little wide, 1.25',            function (D) { return arc(1.25, 1.25 * D); },          ['cheered', 'cheered', 'wide']],
  ['far too wide, 1.5',              function (D) { return arc(1.5, 1.5 * D); },            ['wide', 'wide', 'wide']],
  ['a little narrow, 0.75',          function (D) { return arc(0.75, 0.9 * D); },           ['cheered', 'cheered', 'narrow']],
  ['far too narrow, 0.5',            function (D) { return arc(0.5, D); },                  ['narrow', 'narrow', 'narrow']],
  ['off to the right, 0.3',          function (D) { return arc(1, D, { dx: 0.3 }); },       ['cheered', 'cheered', 'off']],
  ['down on the chin, 0.6',          function (D) { return arc(1, D, { dy: 0.6 }); },       ['off', 'off', 'off']],
  ['tilted 10 degrees',              function (D) { return arc(1, D, { tilt: 10 }); },      ['cheered', 'cheered', 'tilted']],
  ['tilted 20 degrees',              function (D) { return arc(1, D, { tilt: 20 }); },      ['tilted', 'tilted', 'tilted']],
  ['deepest at 0.66',                function (D) { return skew(D, Math.log(0.5) / Math.log(0.66)); }, ['cheered', 'cheered', 'lopsided']],
  ['a smirk, deepest at 0.85',       function (D) { return skew(D, Math.log(0.5) / Math.log(0.85)); }, ['lopsided', 'lopsided', 'lopsided']],
  ['a V, as deep',                   function (D) { return vee(D); },                       ['cheered', 'cheered', 'cheered']],
  ['a small tremble',                function (D) { return arc(1, D, { trem: 0.02 }); },    ['cheered', 'cheered', 'cheered']],
  ['a big tremble',                  function (D) { return arc(1, D, { trem: 0.12 }); },    ['wiggly', 'wiggly', 'wiggly']],
  ['an S',                           function (D) { return sCurve(D); },                    ['wiggly', 'wiggly', 'wiggly']],
  ['a scribble',                     function (D) { return scribble(); },                   ['wiggly', 'wiggly', 'wiggly']],
  ['a tap',                          function (D) { return tap(); },                        ['tap', 'tap', 'tap']]
];
var EASES = ['kind', 'fair', 'strict'], SIZES = [[390, 844], [1180, 820]], ok = 0, all = 0, signOk = 0, signAll = 0;
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1];
  [0, 1, 2].forEach(function (k) {
    var m = mouthOf(k, W, H), D = m.depth / m.w;
    function px(l) { var t = 0; return l.map(function (p) { t += 16; return { x: m.x + p[0] * m.w, y: m.y + p[1] * m.w, t: t }; }); }
    /* the sign, first: the frown as it stands bows up the screen (sagitta -), its mirror down (+), as deep */
    var up = S.judgeCheer(px(arc(1, -D)), m, 'kind'), down = S.judgeCheer(px(arc(1, D)), m, 'kind');
    signAll++;
    if (up.sagitta < 0 && down.sagitta > 0 && Math.abs(up.sagitta + down.sagitta) <= 1 && Math.abs(down.ratio - 1) < 0.05) signOk++;
    else console.log('SIGN ' + W + 'x' + H + ' round ' + (k + 1) + ': frown ' + up.sagitta + ', smile ' + down.sagitta + ', ratio ' + down.ratio);
    CASES.forEach(function (c) {
      var pts = px(c[1](D));
      EASES.forEach(function (e, i) {
        var j = S.judgeCheer(pts, m, e); all++;
        if (j.reason === c[2][i]) ok++;
        else console.log('MISS ' + W + 'x' + H + ' round ' + (k + 1) + ' ' + e + ': ' + c[0] + ' meant ' + c[2][i] + ', judged ' +
          j.reason + ' (chord ' + j.chord + ' of ' + Math.round(2 * m.w) + ', sagitta ' + j.sagitta + ', ratio ' + j.ratio +
          ', tilt ' + j.tilt + ', at ' + j.at + ')');
      });
    });
  });
});
console.log('sign: ' + signOk + ' of ' + signAll + ' (the frown bows up, its mirror down, as deep)');
console.log(ok + ' of ' + all + ' as meant');

/* Q9's fix 5 (thirty-eighth session, 13 October 2026): judgeSmile, corner to corner, the mirror does the depth. The old
   cases run through it, each meaning given again; where it differs from the old judge's it is printed as CHANGED (on
   purpose: begun at the corners, 'off', 'narrow', 'wide' and 'tilted' fall away; away from them, 'corners'; the least
   bow 0.33, 0.4, 0.5 of the frown's depth; 'fits' at kind's 2.4 at every ease; 'lopsided' only past the middle half).
   Then new strokes at the corners of every depth. */
var SMILE = [   /* the old cases' meanings through judgeSmile, in CASES's order */
  ['cheered', 'cheered', 'cheered'], ['cheered', 'cheered', 'cheered'], ['cheered', 'cheered', 'cheered'],
  ['cheered', 'cheered', 'cheered'], ['cheered', 'cheered', 'cheered'], ['fits', 'fits', 'fits'], ['fits', 'fits', 'fits'],
  ['cheered', 'cheered', 'cheered'], ['cheered', 'cheered', 'flat'], ['flat', 'flat', 'flat'],
  ['glum', 'glum', 'glum'], ['glum', 'glum', 'glum'],
  ['cheered', 'cheered', 'corners'], ['corners', 'corners', 'corners'],
  ['cheered', 'cheered', 'corners'], ['corners', 'corners', 'corners'],
  ['cheered', 'corners', 'corners'], ['corners', 'corners', 'corners'],
  ['cheered', 'cheered', 'cheered'], ['cheered', 'corners', 'corners'],   /* 20 degrees: its ends 0.347 off, just in kind's reach */
  ['cheered', 'cheered', 'cheered'], ['lopsided', 'lopsided', 'lopsided'],
  ['cheered', 'cheered', 'cheered'], ['cheered', 'cheered', 'cheered'],
  ['wiggly', 'wiggly', 'wiggly'], ['wiggly', 'wiggly', 'wiggly'], ['wiggly', 'wiggly', 'wiggly'], ['tap', 'tap', 'tap']
];
var NEW = [
  ['at the corners, 0.2 deep',          function (D) { return arc(1, 0.2 * D); },              ['flat', 'flat', 'flat']],
  ['at the corners, 0.36 deep',         function (D) { return arc(1, 0.36 * D); },             ['cheered', 'flat', 'flat']],
  ['at the corners, 0.45 deep',         function (D) { return arc(1, 0.45 * D); },             ['cheered', 'cheered', 'flat']],
  ['at the corners, 0.55 deep',         function (D) { return arc(1, 0.55 * D); },             ['cheered', 'cheered', 'cheered']],
  ['at the corners, 2.3 deep',          function (D) { return arc(1, 2.3 * D); },              ['cheered', 'cheered', 'cheered']],
  ['at the corners, 2.6 deep',          function (D) { return arc(1, 2.6 * D); },              ['fits', 'fits', 'fits']],
  ['a little inside the corners, 0.85', function (D) { return arc(0.85, D); },                 ['cheered', 'cheered', 'cheered']],
  ['tilted 15 at the corners',          function (D) { return arc(1, D, { tilt: 15 }); },      ['cheered', 'cheered', 'corners']],
  ['a V at the corners, twice as deep', function (D) { return vee(2 * D); },                   ['cheered', 'cheered', 'cheered']],
  ['crooked, deepest at 0.72',          function (D) { return skew(D, Math.log(0.5) / Math.log(0.72)); }, ['cheered', 'cheered', 'cheered']],
  ['crooked, deepest at 0.8',           function (D) { return skew(D, Math.log(0.5) / Math.log(0.8)); },  ['lopsided', 'lopsided', 'lopsided']],
  ['the frown, deeper, at the corners', function (D) { return arc(1, -2 * D); },               ['glum', 'glum', 'glum']],
  ['one corner, ended in the middle',   function (D) { return arc(1, D).slice(0, 33); },       ['corners', 'corners', 'corners']],
  ['below the corners, 0.3',            function (D) { return arc(1, D, { dy: 0.3 }); },       ['cheered', 'corners', 'corners']],
  ['corner to corner, right to left, 0.7', function (D) { return arc(1, 0.7 * D, { back: 1 }); }, ['cheered', 'cheered', 'cheered']]
];
var sOk = 0, sAll = 0, changed = 0, nOk = 0, nAll = 0, sgOk = 0, sgAll = 0;
SIZES.forEach(function (sz) {
  var W = sz[0], H = sz[1];
  [0, 1, 2].forEach(function (k) {
    var m = mouthOf(k, W, H), D = m.depth / m.w;
    function px(l) { var t = 0; return l.map(function (p) { t += 16; return { x: m.x + p[0] * m.w, y: m.y + p[1] * m.w, t: t }; }); }
    var up = S.judgeSmile(px(arc(1, -D)), m, 'kind'), down = S.judgeSmile(px(arc(1, D)), m, 'kind');
    sgAll++;
    if (up.reason === 'glum' && down.reason === 'cheered' && Math.abs(down.ratio - 1) < 0.05 && down.ends[0] < 0.01 && down.ends[1] < 0.01) sgOk++;
    else console.log('SMILE SIGN ' + W + 'x' + H + ' round ' + (k + 1) + ': frown ' + up.reason + ', smile ' + down.reason + ', ratio ' + down.ratio + ', ends ' + down.ends);
    function run(name, pts, meant, old, tag) {
      EASES.forEach(function (e, i) {
        var j = S.judgeSmile(pts, m, e), ok = j.reason === meant[i];
        if (tag === 'old') { sAll++; if (ok) sOk++; if (k === 0 && W === 390 && meant[i] !== old[i]) { changed++; console.log('CHANGED ' + e + ': ' + name + ', ' + old[i] + ' now ' + meant[i]); } }
        else { nAll++; if (ok) nOk++; }
        if (!ok) console.log('SMILE MISS ' + W + 'x' + H + ' round ' + (k + 1) + ' ' + e + ': ' + name + ' meant ' + meant[i] + ', judged ' +
          j.reason + ' (ends ' + j.ends + ', sagitta ' + j.sagitta + ', ratio ' + j.ratio + ', at ' + j.at + ')');
      });
    }
    CASES.forEach(function (c, n) { run(c[0], px(c[1](D)), SMILE[n], c[2], 'old'); });
    NEW.forEach(function (c) { run(c[0], px(c[1](D)), c[2], null, 'new'); });
  });
});
console.log('smile sign: ' + sgOk + ' of ' + sgAll + ' (the frown glum, its mirror cheered from the corners, as deep)');
console.log('smile, the old cases: ' + sOk + ' of ' + sAll + ' as meant, ' + changed + ' meanings changed on purpose');
console.log('smile, at the corners: ' + nOk + ' of ' + nAll + ' as meant');
