/* The Expelliarmus judging, tallied in node: node page/charms/checks/expelliarmus-tally.js
   Loads page/charms/spells.js and runs drawn swings and points through judgeDisarm at a phone and an iPad size and every
   ease: the wand hand low on the left (its reach 0.06 of the screen's short side), the straw dummy's wand hand across
   the stage at the same height (0.55 of the short side away, its size 0.05), to the right or, mirrored, to the left.
   Each stroke swings up from the hand (lift, in reaches) and then points straight from the top of the swing (err
   degrees off the true line, len a share of the way to the dummy). Each shape is marked with what it is meant to be at
   kind, fair and strict: disarmed, or the miss's reason. Prints each miss of meaning and the count. Then the catch
   called at the very top (judgeTop), its own count; then the swing and the point as two strokes (joinStrokes), its
   own count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* the swing: from the hand (moved by off, in reaches, + right and + down) up a gentle curve, leaning back a third of a
   reach, to its top lift reaches above; then the point from the top at the dummy, err degrees off (+ turns it down the
   screen), len a share of the way; bow bends the point (its bulge at the middle, a share of its length, down the
   screen), wob trembles it (a share, three half waves), back runs on past its end and back (a share). */
function stroke(h, to, lift, err, len, o) {
  o = o || {};
  var out = [], i, k, n = 16, side = to.x > h.x ? 1 : -1, off = o.off || [0, 0];
  var a = { x: h.x + off[0] * h.r, y: h.y + off[1] * h.r };
  if (o.arch) {   /* one rainbow arch from the hand over onto its hand, its top arch reaches high */
    var c = { x: (a.x + to.x) / 2, y: a.y - 2 * o.arch * h.r };
    for (i = 0; i <= 40; i++) { k = i / 40; out.push({ x: (1 - k) * (1 - k) * a.x + 2 * k * (1 - k) * c.x + k * k * to.x, y: (1 - k) * (1 - k) * a.y + 2 * k * (1 - k) * c.y + k * k * to.y, t: i * 15 }); }
    return out;
  }
  if (o.corner) {   /* straight up, a rounded corner of radius corner reaches (a real finger's turn), then the point */
    var tp = { x: a.x, y: a.y - lift * h.r }, ta = Math.atan2(to.y - tp.y, to.x - tp.x), ex = Math.cos(ta), ey = Math.sin(ta), rr = o.corner * h.r;
    var q1 = { x: tp.x, y: tp.y + rr }, q2 = { x: tp.x + ex * rr, y: tp.y + ey * rr }, LL = len * Math.hypot(to.x - tp.x, to.y - tp.y);
    for (i = 0; i <= 12; i++) out.push({ x: a.x, y: a.y + (q1.y - a.y) * i / 12, t: i * 15 });
    for (i = 1; i <= 10; i++) { k = i / 10; out.push({ x: (1 - k) * (1 - k) * q1.x + 2 * k * (1 - k) * tp.x + k * k * q2.x, y: (1 - k) * (1 - k) * q1.y + 2 * k * (1 - k) * tp.y + k * k * q2.y, t: 180 + i * 15 }); }
    for (i = 1; i <= 20; i++) { var sd = rr + (LL - rr) * i / 20; out.push({ x: tp.x + ex * sd, y: tp.y + ey * sd, t: 330 + i * 15 }); }
    return out;
  }
  var top ={ x: a.x - side * h.r / 3, y: a.y - lift * h.r };
  if (o.noPoint || lift > 0) for (i = 0; i <= n; i++) { k = i / n; out.push({ x: a.x + (top.x - a.x) * Math.sin(k * Math.PI / 2), y: a.y + (top.y - a.y) * k, t: i * 15 }); }
  else top = a;
  if (o.noPoint) return out;
  var d = Math.hypot(to.x - top.x, to.y - top.y), t0 = Math.atan2(to.y - top.y, to.x - top.x) + side * err * Math.PI / 180;
  var ux = Math.cos(t0), uy = Math.sin(t0), nx = -uy * side, ny = ux * side, L = len * d, w, t = out.length * 15;
  if (o.away) ux = -ux;   /* back and down, away from it */
  if (ny < 0) { nx = -nx; ny = -ny; }   /* bows bulge down the screen, so the top stays the top */
  for (i = 1; i <= 30; i++) {
    k = i / 30; w = (o.bow || 0) * L * 4 * k * (1 - k) + (o.wob || 0) * L * Math.sin(k * Math.PI * 3);
    out.push({ x: top.x + ux * L * k + nx * w, y: top.y + uy * L * k + ny * w, t: t + i * 15 });
  }
  if (o.back) { var e = out[out.length - 1]; for (i = 1; i <= 10; i++) { var s = o.back * L * Math.sin(i / 10 * Math.PI); out.push({ x: e.x + ux * s, y: e.y + uy * s, t: t + 450 + i * 15 }); } }
  if (o.thenUp) { var z = out[out.length - 1]; for (i = 1; i <= 12; i++) out.push({ x: z.x, y: z.y - o.thenUp * h.r * i / 12, t: t + 450 + i * 15 }); }
  if (lift === 0) out.unshift({ x: a.x, y: a.y, t: 0 });
  return out;
}

var EASES = ['kind', 'fair', 'strict'], bad = [], n = 0;
[[390, 844], [1180, 820]].forEach(function (size) {
  var W = size[0], H = size[1], M = Math.min(W, H);
  [1, -1].forEach(function (side) {
    var h = { x: W / 2 - side * M * 0.3, y: H * 0.72, r: M * 0.06 };
    var to = { x: h.x + side * M * 0.55, y: h.y, r: M * 0.05 };
    /* [name, lift, err, len, opts, [kind, fair, strict]] */
    var shapes = [
      ['swing up, point dead on', 2.5, 0, 0.8, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['swing up, point all the way to it', 2.5, 0, 1.0, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['a big swing, high over the head', 5, 0, 0.8, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['a swing to the top of the screen', 6.5, 0, 0.7, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['a small swing, a reach and a bit', 1.25, 0, 0.8, {}, ['disarmed', 'flat', 'flat']],
      ['a middling swing', 1.75, 0, 0.8, {}, ['disarmed', 'disarmed', 'flat']],
      ['hardly a swing, half a reach', 0.5, 0, 0.8, {}, ['flat', 'flat', 'flat']],
      ['no swing, pointed straight from the hand', 0, 0, 0.8, {}, ['flat', 'flat', 'flat']],
      ['pointed first, then swung up', 0, 0, 0.8, { thenUp: 2.5 }, ['flat', 'flat', 'flat']],
      ['swung up and never pointed', 2.5, 0, 0, { noPoint: true }, ['up', 'up', 'up']],
      ['a finger\'s rounded corner, a reach', 2.5, 0, 0.8, { corner: 1 }, ['disarmed', 'disarmed', 'disarmed']],
      ['a rounder corner, a reach and a half', 2.5, 0, 0.8, { corner: 1.5 }, ['disarmed', 'disarmed', 'disarmed']],
      ['a wide corner, two reaches', 3, 0, 0.8, { corner: 2 }, ['disarmed', 'disarmed', 'disarmed']],
      ['a rainbow arch over to it', 0, 0, 0, { arch: 2.5 }, ['flat', 'flat', 'flat']],
      ['a tall rainbow arch', 0, 0, 0, { arch: 4 }, ['flat', 'flat', 'flat']],
      ['3 degrees off', 2.5, 3, 0.8, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['3 degrees off the other way', 2.5, -3, 0.8, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['5.5 degrees off', 2.5, 5.5, 0.8, {}, ['disarmed', 'disarmed', 'wide']],
      ['5.5 degrees off the other way', 2.5, -5.5, 0.8, {}, ['disarmed', 'disarmed', 'wide']],
      ['6.6 degrees off', 2.5, 6.6, 0.8, {}, ['disarmed', 'wide', 'wide']],
      ['10 degrees off', 2.5, 10, 0.8, {}, ['wide', 'wide', 'wide']],
      ['20 degrees off the other way', 2.5, -20, 0.8, {}, ['wide', 'wide', 'wide']],
      ['pointed back, away from it', 2.5, 0, 0.6, { away: true }, ['away', 'away', 'away']],
      ['a short jab, under two reaches', 2.5, 0, 0.18, {}, ['disarmed', 'short', 'short']],
      ['a flick of the tip, a reach', 2.5, 0, 0.1, {}, ['short', 'short', 'short']],
      ['the point bowed a little', 2.5, 0, 0.8, { bow: 0.05 }, ['disarmed', 'disarmed', 'disarmed']],
      ['the point bowed', 2.5, 0, 0.8, { bow: 0.28 }, ['disarmed', 'wiggly', 'wiggly']],
      ['the point a scribble', 2.5, 0, 0.8, { wob: 0.25 }, ['wiggly', 'wiggly', 'wiggly']],
      ['the point run on and back', 2.5, 0, 0.8, { back: 0.3 }, ['wiggly', 'wiggly', 'wiggly']],
      ['begun a reach and a bit off the hand', 2.5, 0, 0.8, { off: [0, 1.2] }, ['disarmed', 'disarmed', 'off']],
      ['begun a reach and a half off the hand', 2.5, 0, 0.8, { off: [-1.45, 0] }, ['disarmed', 'off', 'off']],
      ['begun two reaches off the hand', 2.5, 0, 0.8, { off: [0, -2] }, ['off', 'off', 'off']],
      ['a tap', 'tap', 0, 0, {}, ['tap', 'tap', 'tap']],
      ['one point', 'one', 0, 0, {}, ['tap', 'tap', 'tap']]
    ];
    shapes.forEach(function (sh) {
      var name = sh[0] + (side < 0 ? ' (mirrored)' : ''), want = sh[5], pts;
      if (sh[1] === 'tap') pts = [{ x: h.x, y: h.y, t: 0 }, { x: h.x + 2, y: h.y + 1, t: 60 }];
      else if (sh[1] === 'one') pts = [{ x: h.x, y: h.y, t: 0 }];
      else pts = stroke(h, to, sh[1], sh[2], sh[3], sh[4]);
      EASES.forEach(function (ease, i) {
        var j = S.judgeDisarm(pts, h, to, ease), got = j.verdict === 'disarmed' ? 'disarmed' : j.reason; n++;
        if (got !== want[i]) bad.push(W + 'x' + H + ' ' + ease + ' "' + name + '": ' + got + ', meant ' + want[i] + ' (lift ' + j.lift + ', off ' + j.off + ', allow ' + j.allow + ', straight ' + j.straight.toFixed(3) + ')');
      });
    });
  });
});
bad.forEach(function (b) { console.log(b); });
console.log((n - bad.length) + ' of ' + n + ' as meant');

/* The catch called at the very top (8.1, thirty-second session): judgeTop at both sizes and every ease, the dummy to
   the right and, mirrored, to the left, three throws (span and rise, shares of the short side, as the page's Top round
   varies them). Each call is the top moved by off (a share of the short side) one of six ways: past it along the throw,
   before it, above, below, past and above (more above), before and below (more before). Meant: within kind's 0.075,
   fair's 0.055 and strict's 0.04 of the short side, caught; else the larger way off. Every call also lands its fall
   where the start turns over in his line, the true fall where it turns over in the top's, and the gap twice his line's
   error. */
var badT = [], nT = 0;
[[390, 844], [1180, 820]].forEach(function (size) {
  var W = size[0], H = size[1], sh = Math.min(W, H);
  [1, -1].forEach(function (side) {
    var start = { x: W / 2 + side * (-0.3 + 0.55) * sh, y: H * 0.72 };
    [[0.42, 0.36], [0.36, 0.30], [0.48, 0.40]].forEach(function (th) {
      var top = { x: start.x - side * th[0] * sh / 2, y: start.y - th[1] * sh }, dir = -side;
      var ways = [['past', 1, 0, 'past'], ['before', -1, 0, 'before'], ['above', 0, 1, 'high'], ['below', 0, -1, 'low'],
                  ['past and above', 0.6, 0.8, 'high'], ['before and below', -0.8, -0.6, 'before']];
      var cases = [['at the top', 0, 0, 0, 'caught']];
      [0.03, 0.05, 0.065, 0.09].forEach(function (off) { ways.forEach(function (w) { cases.push([w[0] + ' by ' + off, off, w[1], w[2], w[3]]); }); });
      cases.forEach(function (c) {
        var tap = { x: top.x + dir * c[2] * c[1] * sh, y: top.y - c[3] * c[1] * sh };
        EASES.forEach(function (ease) {
          var tol = { kind: 0.075, fair: 0.055, strict: 0.04 }[ease], want = c[1] <= tol ? 'caught' : c[4];
          var j = S.judgeTop(tap, start, top, sh, ease), got = j.verdict === 'caught' ? 'caught' : j.reason; nT++;
          var land = 2 * tap.x - start.x, mirror = 2 * top.x - start.x, near = function (a, b) { return Math.abs(a - b) < 1e-6; };
          var geo = near(j.land, land) && near(j.mirror, mirror) && near(j.gap, 2 * (tap.x - top.x)) && near(j.line, tap.x) &&
                    near(Math.abs(j.mirror - top.x), Math.abs(start.x - top.x)) && near(j.along, dir * (tap.x - top.x));
          if (got !== want || !geo) badT.push(W + 'x' + H + ' ' + ease + ' "' + c[0] + (side < 0 ? ' (mirrored)' : '') + '", throw ' + th + ': ' + got + ', meant ' + want +
            (geo ? '' : ' (land ' + j.land.toFixed(1) + ' meant ' + land.toFixed(1) + ', gap ' + j.gap.toFixed(1) + ', mirror ' + j.mirror.toFixed(1) + ')'));
        });
      });
    });
  });
});
badT.slice(0, 12).forEach(function (b) { console.log(b); });
console.log('the top: ' + (nT - badT.length) + ' of ' + nT + ' as meant');

/* The two strokes (Q9, 9.2, joinStrokes): the swing drawn alone (judged 'up', as the page holds it), the finger
   lifted, then the point as a second stroke, begun d reaches above where the swing ended and pause ms after it, ending
   where the one stroke's point would; joined when joinStrokes says so and judged as one stroke, else the point judged
   alone, as the page does. */
var bad2 = [], n2 = 0;
[[390, 844], [1180, 820]].forEach(function (size) {
  var W = size[0], H = size[1], M = Math.min(W, H);
  [1, -1].forEach(function (side) {
    var h = { x: W / 2 - side * M * 0.3, y: H * 0.72, r: M * 0.06 };
    var to = { x: h.x + side * M * 0.55, y: h.y, r: M * 0.05 };
    /* [name, lift, err, len, d, pause, opts, [kind, fair, strict]] */
    var twos = [
      ['lifted at the top, pointed straight on', 2.5, 0, 0.8, 0, 300, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['the point begun half a reach above the top', 2.5, 0, 0.8, 0.5, 300, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['the point begun a reach and a quarter above', 2.5, 0, 0.8, 1.25, 300, {}, ['disarmed', 'disarmed', 'off']],
      ['the point begun a reach and two thirds above', 2.5, 0, 0.8, 1.65, 300, {}, ['disarmed', 'off', 'off']],
      ['the point begun two and a half reaches above', 2.5, 0, 0.8, 2.5, 300, {}, ['off', 'off', 'off']],
      ['a pause of a second at the top', 2.5, 0, 0.8, 0, 1000, {}, ['disarmed', 'disarmed', 'disarmed']],
      ['a pause of two seconds at the top', 2.5, 0, 0.8, 0, 2000, {}, ['disarmed', 'off', 'off']],
      ['a pause of three seconds at the top', 2.5, 0, 0.8, 0, 3000, {}, ['off', 'off', 'off']],
      ['the point 10 degrees off', 2.5, 10, 0.8, 0, 300, {}, ['wide', 'wide', 'wide']],
      ['the point 5.5 degrees off', 2.5, 5.5, 0.8, 0, 300, {}, ['disarmed', 'disarmed', 'wide']],
      ['the point back, away from it', 2.5, 0, 0.6, 0, 300, { away: true }, ['away', 'away', 'away']],
      ['the point a flick of the tip', 2.5, 0, 0.1, 0, 300, {}, ['short', 'short', 'short']],
      ['a small swing lifted, then pointed', 1.25, 0, 0.8, 0, 300, {}, ['disarmed', 'flat', 'flat']],
      ['a fresh whole cast from the hand after a swing', 2.5, 0, 0.8, 'fresh', 500, {}, ['disarmed', 'disarmed', 'disarmed']]
    ];
    twos.forEach(function (sh) {
      var name = sh[0] + (side < 0 ? ' (mirrored)' : ''), want = sh[7];
      var first = stroke(h, to, sh[1], 0, 0, { noPoint: true }), whole = stroke(h, to, sh[1], sh[2], sh[3], sh[6]);
      var end = first[first.length - 1], t1 = end.t + sh[5], second;
      if (sh[4] === 'fresh') second = whole.map(function (p) { return { x: p.x, y: p.y, t: t1 + p.t }; });
      else {
        var pt = whole.slice(first.length), s0 = { x: end.x, y: end.y - sh[4] * h.r }, m = pt.length;
        second = [{ x: s0.x, y: s0.y, t: t1 }].concat(pt.map(function (p, i) {   /* the point's own shape, its start moved up */
          var k = (i + 1) / m; return { x: p.x + (s0.x - end.x) * (1 - k), y: p.y + (s0.y - end.y) * (1 - k), t: t1 + (i + 1) * 15 }; }));
      }
      EASES.forEach(function (ease, i) {
        var j1 = S.judgeDisarm(first, h, to, ease), joined = j1.reason === 'up' ? S.joinStrokes(first, second, h, ease) : null;
        var j = S.judgeDisarm(joined || second, h, to, ease), got = j.verdict === 'disarmed' ? 'disarmed' : j.reason; n2++;
        if (j1.reason !== 'up') { bad2.push(W + 'x' + H + ' ' + ease + ' "' + name + '": the swing alone ' + j1.reason + ', meant up'); return; }
        if (got !== want[i]) bad2.push(W + 'x' + H + ' ' + ease + ' "' + name + '": ' + got + (joined ? ' joined' : ' alone') + ', meant ' + want[i] + ' (lift ' + j.lift + ', off ' + j.off + ')');
      });
    });
  });
});
bad2.forEach(function (b) { console.log(b); });
console.log('the two strokes: ' + (n2 - bad2.length) + ' of ' + n2 + ' as meant');
