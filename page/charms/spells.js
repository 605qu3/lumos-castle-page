/* The spells' judging, shared by every page that casts them (Charms lane; the owner is Godric).
   Pure functions, so they can be tallied in node away from any page, and called by a room (req 125, the Common room's
   candle). Lumos: the upward flick, the lane's own, since the books give Lumos no motion; a stroke down is Nox.
   The swish down: Ollivander's, PS 5, "raised the wand above his head, brought it swishing down".
   Moved here from page/charms/lumos-test.html on 11 October 2026 (9.55 pm), unchanged. */
(function (root) {
'use strict';
/* judge:start */
var FLICK_EASES = {
  kind:   { angle: 40, straight: 0.70, minLen: 0.05, maxMs: 900 },
  fair:   { angle: 30, straight: 0.78, minLen: 0.07, maxMs: 650 },
  strict: { angle: 20, straight: 0.86, minLen: 0.09, maxMs: 450 }
};
/* points: [{x, y, t}] in CSS pixels and milliseconds; w, h: the screen; ease: a name in FLICK_EASES, or an ease of its own.
   Returns { verdict: 'lumos' | 'nox' | 'miss', reason, angle (degrees from upright, + to the right),
   len (as a share of the screen's short side), straight (0 to 1), ms }. */
function judgeFlick(points, w, h, ease) {
  var e = typeof ease === 'object' ? ease : (FLICK_EASES[ease] || FLICK_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', angle: 0, len: 0, straight: 0, ms: 0, turns: 0 };
  if (!points || points.length < 2) return out;
  var a = points[0], b = points[points.length - 1];
  var dx = b.x - a.x, dy = b.y - a.y, chord = Math.hypot(dx, dy), path = 0, turn = 0, i, lastAng = null;
  var short = Math.min(w, h), step = short * 0.03, anchor = a;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  /* the turning is measured between points a step apart, since a phone's many tiny touch points jitter
     (Godric's iPhone, 11 October: a straight stroke read 1.4 turns point to point) */
  for (i = 1; i < points.length; i++) {
    var sx = points[i].x - anchor.x, sy = points[i].y - anchor.y;
    if (Math.hypot(sx, sy) < step) continue;
    var ang = Math.atan2(sy, sx);
    if (lastAng !== null) { var d = ang - lastAng; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn += Math.abs(d); }
    lastAng = ang; anchor = points[i];
  }
  out.len = chord / short;
  out.straight = path > 0 ? chord / path : 0;
  out.ms = b.t - a.t;
  out.turns = turn / (2 * Math.PI);
  out.angle = Math.atan2(dx, -dy) * 180 / Math.PI;           /* 0 straight up, 90 right, 180 straight down */
  if (path / short < 0.02) { out.reason = 'tap'; return out; }
  if (out.turns > 1.5 && path / short > 1.2) { out.reason = 'windmill'; return out; }
  if (out.len < e.minLen) { out.reason = 'short'; return out; }
  if (out.straight < e.straight) { out.reason = 'wiggly'; return out; }
  if (out.ms > e.maxMs) { out.reason = 'slow'; return out; }
  var fromDown = 180 - Math.abs(out.angle);
  if (Math.abs(out.angle) <= e.angle) { out.verdict = 'lumos'; out.reason = 'up'; return out; }
  if (fromDown <= e.angle) { out.verdict = 'nox'; out.reason = 'down'; return out; }
  out.reason = 'aside';
  return out;
}

/* The swish down (PS 5): one stroke from high to low, long enough to be a swish, mostly downward, a little curve
   allowed. Returns { verdict: 'swish' | 'miss', reason, angle (degrees from straight down), len, ms }. */
function judgeSwishDown(points, w, h) {
  var out = { verdict: 'miss', reason: 'tap', angle: 0, len: 0, ms: 0 };
  if (!points || points.length < 2) return out;
  var a = points[0], b = points[points.length - 1], short = Math.min(w, h);
  var dx = b.x - a.x, dy = b.y - a.y, path = 0, i;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  out.len = Math.hypot(dx, dy) / short; out.ms = b.t - a.t;
  out.angle = Math.atan2(dx, dy) * 180 / Math.PI;               /* 0 straight down */
  if (path / short < 0.03) return out;
  if (out.len < 0.25) { out.reason = 'short'; return out; }
  if (Math.abs(out.angle) > 50) { out.reason = 'aside'; return out; }
  if (out.ms > 1600) { out.reason = 'slow'; return out; }
  out.verdict = 'swish'; out.reason = 'down';
  return out;
}

/* Alohomora's key turn (11 October 2026, third session; the turn is the lane's own: the books give a tap of the lock
   and a whisper, PS 9). After the tap on the keyhole he turns round it, as a key turns: a quarter, a half or three
   quarters of a turn, clockwise or anticlockwise, as the lock asks. The sweep is the angle his finger goes round the
   keyhole, unwrapped, so a path that wanders in and out still counts its turning about the centre only. A key turns
   the same way in either hand, so nothing here is mirrored for a left hand.
   points: [{x, y, t}]; c: the keyhole {x, y}; r: the ring's radius in pixels; want: { turn: 0.25 | 0.5 | 0.75,
   dir: 1 clockwise or -1 anticlockwise }; ease: a name in TURN_EASES or an ease of its own.
   Returns { verdict: 'open' | 'tight' | 'miss', reason, degrees (signed, + clockwise), fraction (of a whole turn,
   unsigned), quarters (to the nearest quarter), band (the mean distance from the ring, as a share of r) }. */
var TURN_EASES = {
  kind:   { slack: 40, band: 0.5 },
  fair:   { slack: 30, band: 0.38 },
  strict: { slack: 20, band: 0.28 }
};
function judgeTurn(points, c, r, want, w, h, ease) {
  var e = typeof ease === 'object' ? ease : (TURN_EASES[ease] || TURN_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', degrees: 0, fraction: 0, quarters: 0, band: 0 };
  if (!points || points.length < 2) return out;
  var short = Math.min(w, h), path = 0, i, sweep = 0, last = null, off = 0, n = 0;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path / short < 0.02) return out;
  for (i = 0; i < points.length; i++) {
    var dx = points[i].x - c.x, dy = points[i].y - c.y, d = Math.hypot(dx, dy);
    off += Math.abs(d - r) / r; n++;
    if (d < r * 0.3) continue;   /* too near the keyhole for its angle to mean anything */
    var a = Math.atan2(dy, dx);  /* screen y is down, so a growing angle goes clockwise */
    if (last !== null) {
      var da = a - last; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      if (Math.abs(da) > Math.PI * 0.55) { out.reason = 'through the middle'; return out; }   /* across the keyhole, not round it */
      sweep += da;
    }
    last = a;
  }
  out.degrees = sweep * 180 / Math.PI;
  out.fraction = Math.abs(out.degrees) / 360;
  out.quarters = Math.round(out.fraction * 4);
  out.band = n ? off / n : 1;
  if (Math.abs(out.degrees) < 25) { out.reason = 'short'; return out; }
  if ((out.degrees > 0 ? 1 : -1) !== want.dir) { out.verdict = 'tight'; out.reason = 'wrong way'; return out; }
  if (out.band > e.band) { out.reason = 'off the ring'; return out; }
  var need = want.turn * 360, got = Math.abs(out.degrees);
  if (got < need - e.slack) { out.reason = 'not far enough'; return out; }
  if (got > need + e.slack) { out.reason = 'too far'; return out; }
  out.verdict = 'open'; out.reason = 'turned';
  return out;
}

/* Aparecium's three taps (11 October 2026, fourth session; the books: Hermione taps the diary three times and says it,
   and nothing happens, CoS 13). The geometry is the lane's own: three taps in a line, evenly spaced, so the middle tap
   halves the line between the outer two, and at an even beat, so the middle tap halves the time as well. With
   place: false in the ease (the page's "Beat alone") only the beat is asked, three taps anywhere, as in the book.
   Called on every tap: taps [{x, y, t}] in order; a gap longer than the ease's starts the count again, so a page needs
   no timer; the first three after the last such gap are judged, and a page clears its taps after a verdict.
   Returns { verdict: 'waiting' | 'open' | 'miss', reason, count, beat (the longer interval over the shorter), gaps
   [px, px], even (the longer gap over the shorter), off (the middle tap's distance from the line through the outer two,
   as a share of the span), tenths (the first gap in tenths of the span, 5 when halved exactly) }. */
var TAP_EASES = {
  kind:   { gap: 1500, beat: 2.0, spread: 0.12, line: 0.25, even: 1.9 },
  fair:   { gap: 1500, beat: 1.6, spread: 0.15, line: 0.16, even: 1.5 },
  strict: { gap: 1500, beat: 1.3, spread: 0.18, line: 0.08, even: 1.3 }
};
function judgeTaps(taps, w, h, ease) {
  var e = typeof ease === 'object' ? ease : (TAP_EASES[ease] || TAP_EASES.kind);
  var out = { verdict: 'waiting', reason: 'count', count: 0, beat: 0, gaps: [0, 0], even: 0, off: 0, tenths: 0 };
  if (!taps || !taps.length) return out;
  var from = 0, i;
  for (i = 1; i < taps.length; i++) if (taps[i].t - taps[i - 1].t > e.gap) from = i;
  var T = taps.slice(from, from + 3);
  out.count = T.length;
  if (T.length < 3) return out;
  var a = T[0], b = T[1], c = T[2];
  var i1 = Math.max(60, b.t - a.t), i2 = Math.max(60, c.t - b.t);
  out.beat = Math.max(i1, i2) / Math.min(i1, i2);
  var d1 = Math.hypot(b.x - a.x, b.y - a.y), d2 = Math.hypot(c.x - b.x, c.y - b.y), span = Math.hypot(c.x - a.x, c.y - a.y);
  out.gaps = [d1, d2];
  out.even = Math.max(d1, d2) / Math.max(1, Math.min(d1, d2));
  out.off = span ? Math.abs((c.x - a.x) * (a.y - b.y) - (a.x - b.x) * (c.y - a.y)) / span / span : 1;
  out.tenths = d1 + d2 ? 10 * d1 / (d1 + d2) : 0;
  out.verdict = 'miss';
  if (e.place !== false) {
    if (Math.max(span, d1, d2) < e.spread * Math.min(w, h)) { out.reason = 'one spot'; return out; }
    if (span < e.spread * Math.min(w, h) * 0.5 || out.off > e.line) { out.reason = 'not in a line'; return out; }
    if (out.even > e.even) { out.reason = 'uneven spacing'; return out; }
  }
  if (out.beat > e.beat) { out.reason = 'uneven beat'; return out; }
  out.verdict = 'open'; out.reason = 'revealed';
  return out;
}
/* The swish and flick, Wingardium Leviosa's (Flitwick, PS 10). Moved here from page/charms/leviosa-test.html on
   12 October 2026 for req 153 (a room's Leviosa, levitate below), unchanged; its eases are SWISH_EASES here. */
var SWISH = (function () {
var EASES = {
  kind:   { angle: 40, corner: 28, straight: 0.72, minSize: 0.10, maxMs: 2200, flickMax: 2.8 },
  fair:   { angle: 30, corner: 48, straight: 0.80, minSize: 0.13, maxMs: 1600, flickMax: 2.0 },
  strict: { angle: 20, corner: 55, straight: 0.87, minSize: 0.16, maxMs: 1100, flickMax: 1.6 }
};
/* kind loosened on Godric's iPhone log (11 October 2026, 9.42 pm): his waves turned 31 to 37 degrees at the corner,
   under the 40 asked, and his flicks ran past 1.6 swishes, a tick with a long arm; so 28 degrees and 2.8 swishes.
   Tallied in page/charms/checks/leviosa-tally.js. */
function resample(points, n) {
  var path = 0, i, out = [points[0]], d, acc = 0;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  var step = path / (n - 1), prev = points[0];
  if (step <= 0) return [];
  for (i = 1; i < points.length; i++) {
    var p = points[i];
    d = Math.hypot(p.x - prev.x, p.y - prev.y);
    while (acc + d >= step && d > 0) {
      var f = (step - acc) / d, q = { x: prev.x + (p.x - prev.x) * f, y: prev.y + (p.y - prev.y) * f };
      out.push(q); prev = q; d = Math.hypot(p.x - prev.x, p.y - prev.y); acc = 0;
    }
    acc += d; prev = p;
  }
  while (out.length < n) out.push(points[points.length - 1]);
  return out.slice(0, n);
}
function dirOf(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
function wrap(d) { while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
function turning(pts) {
  var t = 0, i;
  for (i = 2; i < pts.length; i++) t += wrap(dirOf(pts[i - 1], pts[i]) - dirOf(pts[i - 2], pts[i - 1]));
  return t;
}
function lengthOf(pts) { var l = 0; for (var i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return l; }
/* Returns { verdict: 'leviosa' | 'miss', reason, corner (index into the 48 resampled points), cornerDeg (the angle
   at the corner, 180 a straight run), swishTurn (degrees the curve turns), flickAngle (degrees from upright),
   size (the stroke's box against the screen's short side), ms, pts (the resampled stroke) }. */
function judgeSwishFlick(points, w, h, ease) {
  var e = EASES[ease] || EASES.kind, N = 48, K = 3, short = Math.min(w, h);
  var out = { verdict: 'miss', reason: 'tap', corner: -1, cornerDeg: 180, swishTurn: 0, flickAngle: 0, size: 0, ms: 0, turns: 0, pts: [] };
  if (!points || points.length < 2) return out;
  out.ms = points[points.length - 1].t - points[0].t;
  var raw = lengthOf(points);
  if (raw / short < 0.03) return out;
  var p = resample(points, N), i;
  out.pts = p;
  var xs = p.map(function (q) { return q.x; }), ys = p.map(function (q) { return q.y; });
  out.size = Math.max(Math.max.apply(null, xs) - Math.min.apply(null, xs), Math.max.apply(null, ys) - Math.min.apply(null, ys)) / short;
  out.turns = Math.abs(turning(p)) / 360 * 180 / Math.PI;
  if (out.turns > 1.4) { out.reason = 'windmill'; return out; }
  if (out.size < e.minSize) { out.reason = 'small'; return out; }
  if (out.ms > e.maxMs) { out.reason = 'slow'; return out; }
  /* the corner: the sharpest turn between two runs of K points */
  var best = -1, bestTurn = 0;
  for (i = K; i <= N - 1 - K; i++) {
    var tt = Math.abs(wrap(dirOf(p[i], p[i + K]) - dirOf(p[i - K], p[i])));
    if (tt > bestTurn) { bestTurn = tt; best = i; }
  }
  out.corner = best;
  out.cornerDeg = 180 - bestTurn * 180 / Math.PI;
  var swish = p.slice(0, best + 1), flick = p.slice(best);
  var fa = flick[0], fb = flick[flick.length - 1];
  out.flickAngle = Math.atan2(fb.x - fa.x, -(fb.y - fa.y)) * 180 / Math.PI;
  out.swishTurn = Math.abs(turning(swish)) * 180 / Math.PI;
  if (bestTurn * 180 / Math.PI < e.corner) {
    /* no corner: a wave, or one straight line */
    out.reason = (Math.hypot(p[N - 1].x - p[0].x, p[N - 1].y - p[0].y) / raw > 0.9) ? 'line' : 'wave';
    return out;
  }
  var swishChord = Math.hypot(swish[swish.length - 1].x - swish[0].x, swish[swish.length - 1].y - swish[0].y);
  var swishLen = lengthOf(swish), flickLen = lengthOf(flick);
  var flickStraight = flickLen > 0 ? Math.hypot(fb.x - fa.x, fb.y - fa.y) / flickLen : 0;
  if (out.swishTurn < 35 || swishChord / swishLen > 0.97) { out.reason = 'noswish'; return out; }
  if (flickStraight < e.straight) { out.reason = 'flickwiggly'; return out; }
  if (Math.abs(out.flickAngle) > e.angle) { out.reason = 'flickaside'; return out; }
  if (flickLen > swishLen * e.flickMax) { out.reason = 'flicklong'; return out; }
  out.verdict = 'leviosa'; out.reason = 'swishflick';
  return out;
}
return { EASES: EASES, judge: judgeSwishFlick };
})();
var SWISH_EASES = SWISH.EASES, judgeSwishFlick = SWISH.judge;

/* Dissendium's lift (12 October 2026, seventh session; the books: Harry taps the stone witch, whispers it, and her hump
   opens wide enough to admit a fairly thin person, PoA 10). The lift is the lane's own, for the geometry: after the
   tap and the word the hump's lid is unlatched, and he lifts it by its edge round its hinge; the angle it opens to is
   said in degrees, and the gap at its edge (the chord, 2 sin(angle / 2) of the lid's length) is set against what he
   needs to fit through. The sweep about the hinge is unwrapped as judgeTurn's is; a hinge is the statue's, so nothing
   is mirrored for a left hand.
   points: [{x, y, t}]; c: the hinge {x, y}; r: the lid's length in pixels; want: { need: the degrees he needs to fit,
   max: where the lid stops, from: the lid's angle when he took hold, dir: 1 if opening goes clockwise on the screen,
   -1 if not }; ease: a name in HINGE_EASES or an ease of its own.
   Returns { verdict: 'open' | 'narrow' | 'miss', reason, degrees (his sweep, + opening), opened (the lid's angle after
   it, from 0 to max), gap (the chord as a share of the lid's length), stopped (he pushed past max), snug (open within
   15 degrees of the need: just wide enough) }. */
var HINGE_EASES = {
  kind:   { slack: 8 },
  fair:   { slack: 4 },
  strict: { slack: 0 }
};
function judgeHinge(points, c, r, want, w, h, ease) {
  var e = typeof ease === 'object' ? ease : (HINGE_EASES[ease] || HINGE_EASES.kind);
  var from = want.from || 0, max = want.max || 110, dir = want.dir === -1 ? -1 : 1;
  var out = { verdict: 'miss', reason: 'tap', degrees: 0, opened: from, gap: 2 * Math.sin(from * Math.PI / 360), stopped: false, snug: false };
  if (!points || points.length < 2) return out;
  var short = Math.min(w, h), path = 0, i, sweep = 0, last = null;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path / short < 0.02) return out;
  for (i = 0; i < points.length; i++) {
    var dx = points[i].x - c.x, dy = points[i].y - c.y;
    if (Math.hypot(dx, dy) < r * 0.2) continue;   /* too near the hinge for its angle to mean anything */
    var a = Math.atan2(dy, dx);
    if (last !== null) {
      var da = a - last; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      if (Math.abs(da) > Math.PI * 0.55) { out.reason = 'through the hinge'; return out; }
      sweep += da;
    }
    last = a;
  }
  out.degrees = dir * sweep * 180 / Math.PI;
  var to = from + out.degrees;
  out.stopped = to > max;
  out.opened = Math.max(0, Math.min(max, to));
  out.gap = 2 * Math.sin(out.opened * Math.PI / 360);
  if (out.degrees < -8) { out.reason = 'wrong way'; return out; }
  if (out.degrees < 6) { out.reason = 'short'; return out; }
  if (out.opened < want.need - e.slack) { out.verdict = 'narrow'; out.reason = 'not wide enough'; return out; }
  out.verdict = 'open'; out.reason = 'lifted'; out.snug = out.opened <= want.need + 15;
  return out;
}
/* Mobiliarbus, the slide (PoA 10: the Christmas tree "rose a few inches off the ground, drifted sideways and landed
   with a soft thump right in front of their table"; the book gives no motion, so the stroke is ours, for the geometry,
   way 1, a translation). One stroke that starts on the thing and runs straight to where it should go; the floor is a
   grid of squares and the move is counted in them, dx right and dy down, rounded to the nearest square. points: the
   stroke, {x, y, t} in CSS pixels; at: the thing's centre; cell: a square's side in pixels; ease: a name in
   SLIDE_EASES or an ease of its own (start: how far from the centre, in squares, the stroke may begin; straight: the
   chord over the path; snap: how far off a square's middle the end may land, in squares, 0.5 taking any).
   Returns { verdict: 'slide' | 'miss', reason ('slid', 'tap', 'off', 'short', 'wiggly', 'between'), dx, dy (whole
   squares), fx, fy (the stroke's own, in squares), straight, squares (how many squares long, along the line) }. */
var SLIDE_EASES = {
  kind:   { start: 0.95, straight: 0.80, snap: 0.5 },
  fair:   { start: 0.75, straight: 0.87, snap: 0.42 },
  strict: { start: 0.55, straight: 0.93, snap: 0.32 }
};
function judgeSlide(points, at, cell, ease) {
  var e = typeof ease === 'object' ? ease : (SLIDE_EASES[ease] || SLIDE_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', dx: 0, dy: 0, fx: 0, fy: 0, straight: 0, squares: 0 };
  if (!points || points.length < 2) return out;
  var a = points[0], b = points[points.length - 1], path = 0, i;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path < cell * 0.15) return out;
  var chord = Math.hypot(b.x - a.x, b.y - a.y);
  out.fx = (b.x - a.x) / cell; out.fy = (b.y - a.y) / cell; out.squares = chord / cell;
  out.straight = path ? chord / path : 0;
  out.dx = Math.round(out.fx); out.dy = Math.round(out.fy);
  if (Math.hypot(a.x - at.x, a.y - at.y) > e.start * cell) { out.reason = 'off'; return out; }
  if (out.straight < e.straight) { out.reason = 'wiggly'; return out; }
  if (!out.dx && !out.dy) { out.reason = 'short'; return out; }
  if (Math.abs(out.fx - out.dx) > e.snap || Math.abs(out.fy - out.dy) > e.snap) { out.reason = 'between'; return out; }
  out.verdict = 'slide'; out.reason = 'slid';
  return out;
}
/* Waddiwasi, the aim (PoA 7: Lupin "raised the wand to shoulder height, said 'Waddiwasi!' and pointed it at Peeves",
   and the wad of gum "shot out of the keyhole and straight down Peeves's left nostril"). The book's is a point at the
   target and a straight flight; the stroke is ours, for the geometry: one straight line drawn from the thing (the gum)
   toward the target, and the thing flies along it. A hit is the line passing within the target's reach, so the same
   angle off misses more the further away the target is (a degree at the gum is a hand's width across the room).
   points: the stroke, {x, y, t} in CSS pixels; from: { x, y, r } the thing and its reach; to: { x, y, r } the target
   (the nose) and its size; ease: a name in AIM_EASES or an ease of its own (start: how far from the thing the stroke
   may begin, in its reaches; straight: the chord over the path; len: the shortest line, in the thing's reaches;
   slack: the target's size widened by this much).
   Returns { verdict: 'hit' | 'miss', reason ('hit', 'tap', 'off', 'short', 'wiggly', 'away', 'wide'), off (degrees
   between his line and the true one, at his start, + clockwise on the screen), allow (the degrees the target allows at
   its distance), by (how far the line passes from the target's middle, px), dist (px, his start to the target),
   side ('high', 'low', 'left' or 'right': where the line passes, for a miss's words), straight }. */
var AIM_EASES = {
  kind:   { start: 1.6, straight: 0.80, len: 1.5, slack: 1.5 },
  fair:   { start: 1.3, straight: 0.87, len: 2.0, slack: 1.2 },
  strict: { start: 1.0, straight: 0.93, len: 2.5, slack: 1.0 }
};
function judgeAim(points, from, to, ease) {
  var e = typeof ease === 'object' ? ease : (AIM_EASES[ease] || AIM_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', off: 0, allow: 0, by: 0, dist: 0, side: '', straight: 0 };
  if (!points || points.length < 2) return out;
  var a = points[0], b = points[points.length - 1], path = 0, i;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path < from.r * 0.5) return out;
  var chord = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / (chord || 1), uy = (b.y - a.y) / (chord || 1);
  var vx = to.x - a.x, vy = to.y - a.y, dist = Math.hypot(vx, vy), along = vx * ux + vy * uy, cross = vx * uy - vy * ux;
  var reach = to.r * e.slack;
  out.straight = path ? chord / path : 0; out.dist = Math.round(dist);
  out.off = Math.round(Math.atan2(cross, along) * 1800 / Math.PI) / 10;
  out.allow = Math.round(Math.asin(Math.min(1, reach / (dist || 1))) * 1800 / Math.PI) / 10;
  out.by = Math.round(along > 0 ? Math.abs(cross) : dist);
  var px = a.x + ux * Math.max(0, along) - to.x, py = a.y + uy * Math.max(0, along) - to.y;   /* the line's nearest pass */
  out.side = Math.abs(vx) >= Math.abs(vy) ? (py < 0 ? 'high' : 'low') : (px < 0 ? 'left' : 'right');
  if (Math.hypot(a.x - from.x, a.y - from.y) > e.start * from.r) { out.reason = 'off'; return out; }
  if (out.straight < e.straight) { out.reason = 'wiggly'; return out; }
  if (chord < e.len * from.r) { out.reason = 'short'; return out; }
  if (along <= 0) { out.reason = 'away'; return out; }
  if (Math.abs(cross) > reach) { out.reason = 'wide'; return out; }
  out.verdict = 'hit'; out.reason = 'hit';
  return out;
}
/* Expelliarmus, the swing and the point (CoS 11, the Duelling Club: Lockhart and Snape "swung their wands above their
   heads and pointed them at their opponent; Snape cried: 'Expelliarmus!' There was a dazzling flash of scarlet light"):
   the book's own stroke. One stroke that starts at the wand hand, swings up above it, then points straight from the
   top of the swing at the thing to disarm. The point is judged as judgeAim judges a line, from the top of the swing.
   points: the stroke, {x, y, t} in CSS pixels; from: { x, y, r } where the stroke starts (the wand hand); to: { x, y, r }
   the opponent's wand hand, all px; ease: a name in DISARM_EASES or an ease of its own (start, straight, len, slack as
   in AIM_EASES; lift: how far above the start the swing must rise, in from.r).
   Returns { verdict: 'disarmed' | 'miss', reason ('disarmed', 'tap', 'off', 'flat', 'up', 'wiggly', 'short', 'away',
   'wide'), lift (px the swing rose above the start), top ({ x, y } the swing's top, where the point begins: the
   highest place the stroke turns 40 degrees or more over half a reach, or 50 over a reach, so a point aimed a little
   high still finds it and a finger's rounded corner counts), and the point's
   off, allow, by, side, straight as judgeAim gives them }. 'flat': no swing above (pointed straight from the hand, or
   pointed first and swung after); 'up': swung up and never pointed. */
var DISARM_EASES = {
  kind:   { start: 1.6, lift: 1.0, straight: 0.80, len: 1.5, slack: 1.5 },
  fair:   { start: 1.3, lift: 1.5, straight: 0.87, len: 2.0, slack: 1.2 },
  strict: { start: 1.0, lift: 2.0, straight: 0.93, len: 2.5, slack: 1.0 }
};
function judgeDisarm(points, from, to, ease) {
  var e = typeof ease === 'object' ? ease : (DISARM_EASES[ease] || DISARM_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', lift: 0, top: null, off: 0, allow: 0, by: 0, side: '', straight: 0 };
  if (!points || points.length < 2) return out;
  var a = points[0], path = 0, i;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path < from.r * 0.5) return out;
  if (Math.hypot(a.x - from.x, a.y - from.y) > e.start * from.r) { out.reason = 'off'; return out; }
  /* the top of the swing is where the stroke turns: walk it in steps of a quarter reach and take the highest place
     where it turns 40 degrees or more over half a reach either side, or 50 or more over a reach either side (a real
     finger rounds the corner: one of a reach and a half turns too gently over half a reach; a rainbow arch over to the
     dummy turns gently over both, and finds no top) */
  var step = from.r * 0.25, q = [{ x: a.x, y: a.y }], left = 0, k = -1, turn, d1, d2;
  for (i = 1; i < points.length; i++) {
    var p0 = points[i - 1], p1 = points[i], seg = Math.hypot(p1.x - p0.x, p1.y - p0.y), u = step - left;
    while (seg > 0 && u <= seg) { q.push({ x: p0.x + (p1.x - p0.x) * u / seg, y: p0.y + (p1.y - p0.y) * u / seg }); u += step; }
    left = seg - (u - step);
  }
  [[2, 40], [4, 50]].forEach(function (wd) {
    var w = wd[0];
    for (i = w; i < q.length - w; i++) {
      d1 = Math.atan2(q[i].y - q[i - w].y, q[i].x - q[i - w].x); d2 = Math.atan2(q[i + w].y - q[i].y, q[i + w].x - q[i].x);
      turn = Math.abs(Math.atan2(Math.sin(d2 - d1), Math.cos(d2 - d1)));
      if (turn >= wd[1] * Math.PI / 180 && (k < 0 || q[i].y < q[k].y)) k = i;
    }
  });
  var z = q[q.length - 1];
  if (k < 0) {   /* no turn: one line, swung up and never pointed, or pointed with no swing */
    out.lift = Math.round(a.y - Math.min(a.y, z.y));
    out.reason = a.y - z.y > Math.abs(z.x - a.x) ? 'up' : 'flat'; return out; }
  out.top = { x: q[k].x, y: q[k].y }; out.lift = Math.round(a.y - q[k].y);
  if (out.lift < e.lift * from.r) { out.reason = 'flat'; return out; }
  var j = judgeAim(q.slice(k), { x: out.top.x, y: out.top.y, r: from.r }, to, e);
  out.off = j.off; out.allow = j.allow; out.by = j.by; out.side = j.side; out.straight = j.straight;
  if (j.verdict !== 'hit') { out.reason = j.reason; return out; }
  out.verdict = 'disarmed'; out.reason = 'disarmed';
  return out;
}
/* Ferula, the coil (PoA 19: Lupin "tapped Ron's leg with his wand and muttered, 'Ferula.' Bandages spun up Ron's leg,
   strapping it tightly to a splint"). The book's is the tap; the stroke after it is ours, for the geometry: a coil drawn
   up the leg from its foot to its top, side to side across it, each crossing there and back one turn of the bandage (a
   helix seen from the side). The bandage climbs his turns; where a turn climbs further than the bandage is wide, the
   leg shows through: so the turns needed are the leg's length over the bandage's width, and a narrower bandage needs
   more of them.
   points: the stroke, {x, y, t} in CSS pixels; leg: { a: {x, y} its foot, b: {x, y} its top, r: its half width, w: the
   bandage's width, all px }; ease: a name in COIL_EASES or an ease of its own (start: how far up the leg the coil may
   begin, a share of its length; reach: how far up it must end; wide: how far off the leg's line it may stray, in half
   widths; side: how far across the line a swing must go to count as crossing it, in half widths; back: how far it may
   run back down, a share; slack: a turn may climb this many bandage widths before it leaves a gap).
   Returns { verdict: 'bound' | 'miss', reason ('bound', 'tap', 'start', 'down', 'off', 'straight', 'short', 'gaps'),
   turns (whole turns counted), climbs ([px] each turn's climb up the leg), gaps ([{ from, to, px }] where the leg shows through,
   shares of it: a turn that climbed more than the bandage allows, or a bare foot or top), need (the fewest turns that cover the leg at this width, without
   gaps), from, to (where the coil began and ended up the leg, shares of its length) }. */
var COIL_EASES = {
  kind:   { start: 0.45, reach: 0.82, wide: 2.6, side: 0.35, back: 0.15, slack: 1.35 },
  fair:   { start: 0.35, reach: 0.88, wide: 2.2, side: 0.50, back: 0.10, slack: 1.15 },
  strict: { start: 0.25, reach: 0.93, wide: 1.8, side: 0.65, back: 0.06, slack: 1.00 }
};
function judgeCoil(points, leg, ease) {
  var e = typeof ease === 'object' ? ease : (COIL_EASES[ease] || COIL_EASES.kind);
  var L = Math.hypot(leg.b.x - leg.a.x, leg.b.y - leg.a.y), ux = (leg.b.x - leg.a.x) / L, uy = (leg.b.y - leg.a.y) / L;
  var out = { verdict: 'miss', reason: 'tap', turns: 0, climbs: [], gaps: [], need: Math.ceil(L / leg.w), from: 0, to: 0 };
  if (!points || points.length < 2) return out;
  var path = 0, i;
  for (i = 1; i < points.length; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path < leg.r * 0.5) return out;
  /* each point as (s, c): s up the leg as a share of its length, c across it in half widths */
  var sc = points.map(function (p) { var vx = p.x - leg.a.x, vy = p.y - leg.a.y; return { s: (vx * ux + vy * uy) / L, c: (vx * -uy + vy * ux) / leg.r }; });
  var hi = -1e9, top = -1e9, drop = 0, far = 0;
  sc.forEach(function (q) { top = Math.max(top, q.s); drop = Math.max(drop, top - q.s); far = Math.max(far, Math.abs(q.c)); hi = Math.max(hi, q.s); });
  out.from = Math.round(sc[0].s * 100) / 100; out.to = Math.round(sc[sc.length - 1].s * 100) / 100;
  if (sc[0].s > e.start || sc[0].s < -0.15 || Math.abs(sc[0].c) > e.wide) { out.reason = 'start'; return out; }
  if (sc[sc.length - 1].s < sc[0].s) { out.reason = 'down'; return out; }
  if (far > e.wide) { out.reason = 'off'; return out; }
  /* the crossings: the side he is on changes only once a swing passes side on the other side (no counting a tremble) */
  var side = 0, marks = [];
  sc.forEach(function (q) {
    var now = q.c > e.side ? 1 : (q.c < -e.side ? -1 : 0);
    if (now && now !== side) { if (side) marks.push(q.s); side = now; }
  });
  /* a turn is there and back: two half swings, each a visit to one side; the leg is split into turns at every second
     crossing, from his start to his highest point, and each turn's climb is its share. The bandage is as wide as
     a turn may climb without a gap, and half of it reaches below his start and above his end: the foot and the top
     are bare only if he leaves more than that. */
  out.turns = Math.floor((marks.length + (side ? 1 : 0)) / 2);
  if (out.turns < 1) { out.reason = 'straight'; return out; }
  if (drop > e.back) { out.reason = 'down'; return out; }
  if (hi < e.reach) { out.reason = 'short'; return out; }
  var s0 = Math.max(0, sc[0].s), end = Math.min(1, hi), m = [s0], lim = leg.w * e.slack;
  for (i = 1; i < marks.length - 1; i += 2) m.push(marks[i]);   /* the leg split into turns: his start, every second crossing, his top */
  m.push(end);
  for (i = 1; i < m.length; i++) if (m[i - 1] < 1) out.climbs.push({ from: m[i - 1], to: Math.min(1, m[i]), px: Math.round(Math.max(0, Math.min(1, m[i]) - m[i - 1]) * L) });   /* past the top, nothing to cover */
  if (s0 * L > lim / 2) out.gaps.push({ from: 0, to: Math.round(s0 * 100) / 100, px: Math.round(s0 * L) });
  out.climbs.forEach(function (c) { if (c.px > lim) out.gaps.push({ from: Math.round(c.from * 100) / 100, to: Math.round(c.to * 100) / 100, px: c.px }); });
  if ((1 - end) * L > lim / 2) out.gaps.push({ from: Math.round(end * 100) / 100, to: 1, px: Math.round((1 - end) * L) });
  out.climbs = out.climbs.map(function (c) { return c.px; });
  if (out.gaps.length) { out.reason = 'gaps'; return out; }
  out.verdict = 'bound'; out.reason = 'bound';
  return out;
}
/* The smallest circle that holds every point (for Impervius, below): tried on every pair as a diameter and every three
   through their circle, the smallest that holds them all kept. A rectangle's has its diagonal for a diameter; an
   acute triangle's runs through its three corners. points: [{x, y}], a few dozen. Returns { x, y, r }. */
function smallestCircle(P) {
  var best = null, i, j, k, c, eps = 1e-6;
  function holds(c) { for (var n = 0; n < P.length; n++) if (Math.hypot(P[n].x - c.x, P[n].y - c.y) > c.r * (1 + eps) + eps) return false; return true; }
  function keep(c) { if (c && (!best || c.r < best.r) && holds(c)) best = c; }
  if (P.length === 1) return { x: P[0].x, y: P[0].y, r: 0 };
  for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
    keep({ x: (P[i].x + P[j].x) / 2, y: (P[i].y + P[j].y) / 2, r: Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y) / 2 });
    for (k = j + 1; k < P.length; k++) {
      var a = P[i], b = P[j], d = P[k], D = 2 * (a.x * (b.y - d.y) + b.x * (d.y - a.y) + d.x * (a.y - b.y));
      if (Math.abs(D) < eps) continue;
      var a2 = a.x * a.x + a.y * a.y, b2 = b.x * b.x + b.y * b.y, d2 = d.x * d.x + d.y * d.y;
      c = { x: (a2 * (b.y - d.y) + b2 * (d.y - a.y) + d2 * (a.y - b.y)) / D, y: (a2 * (d.x - b.x) + b2 * (a.x - d.x) + d2 * (b.x - a.x)) / D };
      c.r = Math.hypot(a.x - c.x, a.y - c.y); keep(c);
    }
  }
  return best;
}
/* Impervius, the ring (PoA 9: Hermione "tapped them with her wand and said, 'Impervius!'", and Harry's glasses "repel
   water"; the book's tap, then the ring is ours, for the geometry: inside and outside a closed curve). One stroke
   right round the thing; the thing is kept dry if every point of its outline is inside the ring, the ring closed by a
   straight line from where the stroke ended back to where it began. points: the stroke, {x, y, t}; shape: the
   thing's outline, [{x, y}], its corners and enough points along its edges; ease: a name in RING_EASES or an ease of
   its own (wind: how far round the thing, in turns, the ring must go; tol: how far outside the ring a point of the
   thing may lie and still count as in, as a share of the smallest circle's radius; turns: the most turns before it is
   a scribble). Returns { verdict: 'dry' | 'miss', reason ('kept', 'tap', 'off', 'open', 'small', 'scribble'), turns,
   wet (the outline's points left outside, by index), inside (their share inside), snug (the ring's own radius, from
   its area, over the smallest circle's), c: the smallest circle { x, y, r } }. Nothing graded: snug is for showing. */
var RING_EASES = {
  kind:   { wind: 0.80, tol: 0.12, turns: 2.6 },
  fair:   { wind: 0.90, tol: 0.07, turns: 2.6 },
  strict: { wind: 0.97, tol: 0.03, turns: 2.6 }
};
function judgeRing(points, shape, ease) {
  var e = typeof ease === 'object' ? ease : (RING_EASES[ease] || RING_EASES.kind);
  var c = smallestCircle(shape), out = { verdict: 'miss', reason: 'tap', turns: 0, wet: [], inside: 0, snug: 0, c: c };
  if (!points || points.length < 3) return out;
  var path = 0, i, n = points.length;
  for (i = 1; i < n; i++) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  if (path < c.r * 0.3) return out;
  /* how far round the thing's middle the stroke goes, in turns */
  var s = 0, la = null;
  for (i = 0; i < n; i++) {
    var a = Math.atan2(points[i].y - c.y, points[i].x - c.x);
    if (la !== null) { var d = a - la; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; s += d; }
    la = a;
  }
  out.turns = Math.abs(s) / (2 * Math.PI);
  /* the ring's own size, from the area it closes (the shoelace), as a radius */
  var area = 0;
  for (i = 0; i < n; i++) { var p = points[i], q = points[(i + 1) % n]; area += p.x * q.y - q.x * p.y; }
  out.snug = Math.sqrt(Math.abs(area) / 2 / Math.PI) / (c.r || 1);
  if (out.turns < 0.5) {
    var mx = 0, my = 0; for (i = 0; i < n; i++) { mx += points[i].x; my += points[i].y; }
    out.reason = Math.hypot(mx / n - c.x, my / n - c.y) > c.r * 2.5 ? 'off' : 'open'; return out;
  }
  if (out.turns > e.turns) { out.reason = 'scribble'; return out; }
  if (out.turns < e.wind) { out.reason = 'open'; return out; }
  /* each point of the outline: inside the closed ring (it winds round the point), or near enough its edge */
  function winds(p) {
    var w = 0, l = null;
    for (var k = 0; k <= n; k++) {
      var q = points[k % n], a = Math.atan2(q.y - p.y, q.x - p.x);
      if (l !== null) { var dd = a - l; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; w += dd; }
      l = a;
    }
    return Math.abs(w) > Math.PI;
  }
  function near(p) {
    var lim = e.tol * c.r;
    for (var k = 0; k < n; k++) {
      var a = points[k], b = points[(k + 1) % n], vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
      var t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2)) : 0;
      if (Math.hypot(a.x + vx * t - p.x, a.y + vy * t - p.y) <= lim) return true;
    }
    return false;
  }
  for (i = 0; i < shape.length; i++) if (!winds(shape[i]) && !near(shape[i])) out.wet.push(i);
  out.inside = 1 - out.wet.length / shape.length;
  if (!out.wet.length) { out.verdict = 'dry'; out.reason = 'kept'; return out; }
  out.reason = out.wet.length === shape.length ? 'off' : 'small';
  return out;
}
/* Finite Incantatem, the ring round all of it (CoS 11: Snape "took charge. 'Finite Incantatem!' he shouted; Harry's
   feet stopped dancing, Malfoy stopped laughing"; the motion is ours, for the geometry: inside and outside, and a ring
   that need not be round). One stroke round every thing still under a spell, closed as Impervius's is, by a straight
   line from where it ended back to where it began. A thing is held when every point of its outline is inside the ring
   (the ring winds round it) or near its edge; a thing to keep (keep: true, his own lit lantern) is caught when its
   middle is inside. Inside is told as the books of geometry tell it too: a straight line from the thing's middle out to
   the right crosses the ring an odd number of times when it is inside, an even number when it is out (cross, below).
   points: the stroke, {x, y, t}; things: [{ x, y, r, keep, shape }] (shape: its outline, [{x, y}]; else a circle of
   radius r); ease: a name in FINITE_EASES or an ease of its own (tol: how far outside the ring a point of the outline
   may lie and still count in, as a share of the thing's r; gap: how far apart the stroke's two ends may be, as a share
   of the ring's size, the diagonal of its box; loops: the most times round any thing before it is a scribble).
   Returns { verdict: 'stopped' | 'miss', reason ('all', 'tap', 'open', 'scribble', 'off', 'some', 'caught'), held
   (the things inside, by index, kept ones too), going (the ones to stop left outside), caught (the kept ones inside),
   cross (for each thing, the crossings to the right of its middle), loops (for each, how many times round), gap }.
   A miss still holds what it holds: a room stops those and leaves the rest going. Nothing graded. */
var FINITE_EASES = {
  kind:   { tol: 0.35, gap: 0.35, loops: 2.6 },
  fair:   { tol: 0.20, gap: 0.22, loops: 2.6 },
  strict: { tol: 0.08, gap: 0.12, loops: 2.6 }
};
function windAround(points, p) {   /* signed turns the closed ring makes round p */
  var w = 0, l = null, n = points.length;
  for (var k = 0; k <= n; k++) {
    var q = points[k % n], a = Math.atan2(q.y - p.y, q.x - p.x);
    if (l !== null) { var d = a - l; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; w += d; }
    l = a;
  }
  return w / (2 * Math.PI);
}
function crossings(points, p) {   /* times the closed ring crosses the line from p out to the right */
  var c = 0, n = points.length;
  for (var k = 0; k < n; k++) {
    var a = points[k], b = points[(k + 1) % n];
    if ((a.y > p.y) !== (b.y > p.y) && a.x + (p.y - a.y) / (b.y - a.y) * (b.x - a.x) > p.x) c++;
  }
  return c;
}
function judgeFinite(points, things, ease) {
  var e = typeof ease === 'object' ? ease : (FINITE_EASES[ease] || FINITE_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', held: [], going: [], caught: [], cross: [], loops: [], gap: 0 };
  var i, k, n = points ? points.length : 0, mr = 0;
  for (i = 0; i < things.length; i++) mr += things[i].r / things.length;
  if (n < 3) return out;
  var path = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (i = 0; i < n; i++) {
    if (i) path += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    x0 = Math.min(x0, points[i].x); x1 = Math.max(x1, points[i].x); y0 = Math.min(y0, points[i].y); y1 = Math.max(y1, points[i].y);
  }
  if (path < mr * 1.5) return out;
  var size = Math.hypot(x1 - x0, y1 - y0) || 1;
  /* the gap: how near the end comes back to the stroke's first half (a ring drawn on past its start is closed) */
  var g = Infinity, h = Math.floor(n / 2);
  for (i = 0; i <= h; i++) g = Math.min(g, Math.hypot(points[n - 1].x - points[i].x, points[n - 1].y - points[i].y));
  for (i = h; i < n; i++) g = Math.min(g, Math.hypot(points[0].x - points[i].x, points[0].y - points[i].y));
  out.gap = g / size;
  for (i = 0; i < things.length; i++) {
    var t = things[i]; out.loops.push(Math.abs(windAround(points, t))); out.cross.push(crossings(points, t));
  }
  if (out.gap > e.gap) { out.reason = 'open'; return out; }
  for (i = 0; i < things.length; i++) if (out.loops[i] > e.loops) { out.reason = 'scribble'; return out; }
  function near(p, lim) {
    for (var j = 0; j < n; j++) {
      var a = points[j], b = points[(j + 1) % n], vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
      var s = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2)) : 0;
      if (Math.hypot(a.x + vx * s - p.x, a.y + vy * s - p.y) <= lim) return true;
    }
    return false;
  }
  var targets = 0;
  for (i = 0; i < things.length; i++) {
    var th = things[i], shape = th.shape, inside = true;
    if (!shape) { shape = []; for (k = 0; k < 12; k++) shape.push({ x: th.x + th.r * Math.cos(k * Math.PI / 6), y: th.y + th.r * Math.sin(k * Math.PI / 6) }); }
    if (th.keep) { if (out.loops[i] > 0.5) { out.held.push(i); out.caught.push(i); } continue; }
    targets++;
    for (k = 0; k < shape.length && inside; k++) if (Math.abs(windAround(points, shape[k])) <= 0.5 && !near(shape[k], e.tol * th.r)) inside = false;
    if (inside) out.held.push(i); else out.going.push(i);
  }
  if (out.caught.length) out.reason = 'caught';
  else if (out.going.length === targets) out.reason = 'off';
  else if (out.going.length) out.reason = 'some';
  else { out.verdict = 'stopped'; out.reason = 'all'; }
  return out;
}
/* Petrificus Totalus, the Body-Bind (PS 16: Hermione "raised her wand. 'Petrificus Totalus!' she cried, pointing it at
   Neville. Neville's arms snapped to his sides. His legs sprang together. His whole body rigid, he swayed where he stood
   and then fell flat on his face, stiff as a board"). The book's is a point; the strokes are ours, for the geometry:
   two straight lines, one down each side of the figure, parallel to each other and to the figure's own line, the way
   the arms snap to the sides. Parallel is judged as the lines' directions, either way drawn; two that are not would
   meet somewhere, and the miss says where.
   strokes: [points, points], each {x, y, t} in CSS pixels, in the order drawn; fig: { x, y the figure's middle, h its
   height, w its half width, lean its tilt in degrees, + its top to the right }, px; ease: a name in BIND_EASES or an
   ease of its own (straight: each line's chord over its path; len: each line's shortest, a share of the height; par:
   the most degrees between the two; along: the most degrees their mean may stray from the figure's line; wide: how
   far out from the figure's line a stroke may run, in half widths).
   Returns { verdict: 'bound' | 'miss', reason ('bound', 'tap', 'one', 'wiggly', 'short', 'same', 'far', 'off', 'meet',
   'slant'), which (the stroke a miss is about, 0 or 1, or -1), angle (degrees between the two lines), off (their mean's
   degrees from the figure's line, + when they run further right toward the feet than it does), gapTop, gapBottom (px
   between the lines across the figure's top and its feet), meet ({ x, y } where the two lines would cross, or null),
   where ('above' or 'below' the figure's middle, for the meet), meetAt (the meet's distance along the figure's line
   from its middle, in heights), straight ([each line's]), sides ([each line's middle across the figure's line, px]) }. */
var BIND_EASES = {
  kind:   { straight: 0.85, len: 0.40, par: 12, along: 20, wide: 3.0 },
  fair:   { straight: 0.90, len: 0.50, par: 8,  along: 14, wide: 2.5 },
  strict: { straight: 0.94, len: 0.60, par: 5,  along: 9,  wide: 2.0 }
};
function judgeBind(strokes, fig, ease) {
  var e = typeof ease === 'object' ? ease : (BIND_EASES[ease] || BIND_EASES.kind);
  var out = { verdict: 'miss', reason: 'tap', which: -1, angle: 0, off: 0, gapTop: 0, gapBottom: 0, meet: null, where: '',
    meetAt: 0, straight: [], sides: [] };
  var L = (fig.lean || 0) * Math.PI / 180, d = { x: -Math.sin(L), y: Math.cos(L) }, n = { x: Math.cos(L), y: Math.sin(L) };
  var lines = [], i;
  function pathOf(s) { var l = 0; for (var k = 1; k < s.length; k++) l += Math.hypot(s[k].x - s[k - 1].x, s[k].y - s[k - 1].y); return l; }
  strokes = (strokes || []).filter(function (s) { return s && s.length >= 2 && pathOf(s) >= fig.h * 0.08; });
  if (!strokes.length) return out;
  for (i = 0; i < Math.min(2, strokes.length); i++) {
    var s = strokes[i], a = s[0], b = s[s.length - 1], vx = b.x - a.x, vy = b.y - a.y, ch = Math.hypot(vx, vy);
    var m = { x: (a.x + b.x) / 2 - fig.x, y: (a.y + b.y) / 2 - fig.y };
    var ang = Math.atan2(vx * n.x + vy * n.y, vx * d.x + vy * d.y) * 180 / Math.PI;   /* from the figure's line, as a line */
    while (ang > 90) ang -= 180; while (ang <= -90) ang += 180;
    lines.push({ ch: ch, straight: ch / pathOf(s), ang: ang, s: m.x * n.x + m.y * n.y, t: m.x * d.x + m.y * d.y,
      ux: vx / (ch || 1), uy: vy / (ch || 1), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 });
  }
  out.straight = lines.map(function (l) { return Math.round(l.straight * 100) / 100; });
  out.sides = lines.map(function (l) { return Math.round(l.s); });
  for (i = 0; i < lines.length; i++) {
    if (lines[i].straight < e.straight) { out.reason = 'wiggly'; out.which = i; return out; }
    if (lines[i].ch < e.len * fig.h) { out.reason = 'short'; out.which = i; return out; }
  }
  if (lines.length < 2) { out.reason = 'one'; out.which = 0; return out; }
  var p = lines[0], q = lines[1];
  out.angle = Math.round(Math.abs(p.ang - q.ang) * 10) / 10;
  out.off = Math.round((p.ang + q.ang) / 2 * 10) / 10;
  /* across the figure's top and its feet: where each line crosses, and the gap between them there */
  function sAt(l, t) { var c = Math.cos(l.ang * Math.PI / 180); return Math.abs(c) < 0.2 ? NaN : l.s + (t - l.t) * Math.tan(l.ang * Math.PI / 180); }
  out.gapTop = Math.round(Math.abs(sAt(p, -fig.h / 2) - sAt(q, -fig.h / 2))) || 0;
  out.gapBottom = Math.round(Math.abs(sAt(p, fig.h / 2) - sAt(q, fig.h / 2))) || 0;
  var den = p.ux * q.uy - p.uy * q.ux;   /* where the two would meet, drawn on and on */
  if (Math.abs(den) > 1e-6) {
    var k = ((q.mx - p.mx) * q.uy - (q.my - p.my) * q.ux) / den;
    out.meet = { x: Math.round(p.mx + p.ux * k), y: Math.round(p.my + p.uy * k) };
    var mt = (out.meet.x - fig.x) * d.x + (out.meet.y - fig.y) * d.y;
    out.where = mt > 0 ? 'below' : 'above'; out.meetAt = Math.round(mt / fig.h * 10) / 10;
  }
  if (p.s * q.s >= 0) { out.reason = 'same'; out.which = 1; return out; }
  for (i = 0; i < 2; i++) {
    if (Math.abs(lines[i].s) > e.wide * fig.w) { out.reason = 'far'; out.which = i; return out; }
    if (Math.abs(lines[i].t) > fig.h * 0.5) { out.reason = 'off'; out.which = i; return out; }
  }
  if (out.angle > e.par) { out.reason = 'meet'; return out; }
  if (Math.abs(out.off) > e.along) { out.reason = 'slant'; return out; }
  out.verdict = 'bound'; out.reason = 'bound';
  return out;
}
/* judge:end */

/* What a boy has learned, kept on the device: learn('lumos') once he has cast it, learned('lumos') for a room to ask
   (req 125). The key is 'lumos.spells.learned.' and the spell's name. */
function learned(name) { try { return localStorage.getItem('lumos.spells.learned.' + name) === '1'; } catch (e) { return false; } }
function learn(name) { try { localStorage.setItem('lumos.spells.learned.' + name, '1'); } catch (e) {} }
/* The first true cast of a spell in a room, ever, on this device (Magic, 12 October 2026, 9.53 pm, for the house
   points, req 213: a spell earns its point on its first true cast, once): every room callable's answer carries
   `first`, true only on that cast. The key is 'lumos.spells.cast.' and the spell's name. */
function firstCast(name) {
  try { if (localStorage.getItem('lumos.spells.cast.' + name) === '1') return false; localStorage.setItem('lumos.spells.cast.' + name, '1'); return true; }
  catch (e) { return false; }
}

/* The ways out a waiting spell never covers (the Interaction lane's vocabulary, §5 and §9; its gap G2, 12 October
   2026): the frame's Back (#back) and anything a page marks data-spell-exit (the test pages' Step back), or what a
   room passes as `exits`. A finger landing on one lets the offer go, answered 'cancelled' (or, if the spell had
   already answered, that answer at once), and the tap goes on to it as a click, so he can always leave the stop.
   `wait` (seconds, off by default): left that long with no finger on the layer, the offer goes the same way. Every
   room callable here (castOver, openLock, revealInk, levitate, measureSpan, openHump) takes `exits` and `wait` in its opts. */
var EXITS = '#back, [data-spell-exit]';
function exitAt(cv, ev, sel) {
  var el = null;
  cv.style.pointerEvents = 'none';
  try { el = root.document.elementFromPoint(ev.clientX, ev.clientY); } finally { cv.style.pointerEvents = ''; }
  el = el && el.closest ? el.closest(sel ? EXITS + ', ' + sel : EXITS) : null;
  return el && !el.disabled ? el : null;
}
/* The tap goes on to the way out as one click, ours: the browser's own click for the same finger, which lands on
   whatever is under it once the layer is gone (Back a second time, or the button drawn in Step back's place), is
   swallowed. */
function leaveBy(el) {
  var doc = root.document, t0 = root.performance.now();
  function eat(e) { if (!e.isTrusted) return; off(); if (root.performance.now() - t0 < 800) { e.stopImmediatePropagation(); e.preventDefault(); } }
  function off() { doc.removeEventListener('click', eat, true); }
  doc.addEventListener('click', eat, true); root.setTimeout(off, 800);
  el.click();
}

/* A miss's kind words, as the Charms pages say them, so a room says the same (Interaction, req 218; its §9: a miss
   answers kindly and visibly). Each is [what he sees, what to try], as SWISH_WHY and SPAN_WHY. FLICK_WHY is the Lumos
   page's (lumos-test.html), for castOver; lockWhy and inkWhy follow the Alohomora and Aparecium pages, for openLock
   and revealInk, and take the turn wanted or the taps' judge, since their words name them. */
var FLICK_WHY = {
  short: ['A puff of sparks', 'Too short: make the flick a little longer.'],
  wiggly: ['Hic! Bubbles', 'Too wiggly: keep the flick straight, like a line.'],
  slow: ['A wisp of smoke', 'Too slow: a flick is quick.'],
  aside: ['Sparks, sideways', 'That went sideways. Point it up.'],
  windmill: ['Whoa, a windmill', 'Round and round! Ron waved his arms like a windmill too. Try one straight flick.'],
  down: ['Nothing to put out', 'A stroke down puts the light out. Light it first: flick up.']
};
function turnWords(want) {
  return (want.turn === 0.25 ? 'a quarter turn' : (want.turn === 0.5 ? 'a half turn' : 'three quarters of a turn')) +
    (want.dir === -1 ? ', anticlockwise' : ', clockwise');
}
function lockWhy(verdict, reason, want) {
  var w = turnWords(want), W = w.charAt(0).toUpperCase() + w.slice(1), deg = Math.round(want.turn * 360);
  if (verdict === 'nothing') return ['Nothing happened', 'It will not budge. Some locks are charmed against Alohomora, or want their own key, like the door in the room of flying keys (Book 1).'];
  if (verdict === 'tight') return ['Click: the lock tightened', 'That way locks it. ' + W + '.'];
  return ({
    'not far enough': ['The key stops short', 'Not far enough. ' + W + ' is ' + deg + ' degrees.'],
    'too far': ['It turns too far', 'Too far: a key stops where the lock says. ' + W + ', ' + deg + ' degrees.'],
    'off the ring': ['The key slips', 'Keep your finger going round the keyhole, near the ring.'],
    'through the middle': ['The key slips', 'Round the keyhole, not across it.']
  })[reason] || ['The key barely moves', 'Turn it further round.'];
}
function inkWhy(j) {
  var a = Math.round(j.tenths), b = 10 - a;
  return ['The page stays blank', ({
    'one spot': 'Spread them out: three taps in a line across the page, the middle one halfway.',
    'not in a line': 'Keep the three taps in a line, like beads on a thread.',
    'uneven spacing': 'Nearly. Your gaps were ' + a + ' and ' + b + ' tenths of the line. Halfway is 5 and 5: put the middle tap there.'
  })[j.reason] || 'Keep an even beat: tap ... tap ... tap, like a clock ticking.'];
}

/* Lumos over a spot, for a room (req 125, the Common room's candle stub, Godric's Q37 t2; tried on
   page/charms/cast-over-test.html). One stroke: the traced guide (guide.js, if the room loads it) is a flick up
   ending just under the spot; the answer is 'cast' or 'missed', and the room draws what follows (the flame, or not).
   A tap is ignored, so a stray touch costs nothing; cancel() answers 'cancelled'. Nothing else on the page is
   touched while it waits: a clear layer over the page takes the one stroke and is gone, but never over a way out:
   a finger on Back answers 'cancelled' and goes on to Back (EXITS).
   opts: { at: {x, y} in CSS pixels, or a function returning one each frame (a 3D room projects its candle),
           ease: 'kind' (default), 'fair' or 'strict' (FLICK_EASES),
           guide: 'auto' (default: the stage of his Lumos guide in Charms, the same store, full for his first three
                  guided casts, then faint, then gone), 'always' or 'off',
           reach: the guide's length as a share of the screen's short side (0.32),
           exits: a selector for more ways out than EXITS, wait: quiet seconds before the offer goes (off) }
   Returns { done: a promise of { verdict: 'cast' | 'missed' | 'cancelled', judge, traced, first, why (a miss's
             FLICK_WHY) }, cancel() }. */
function castOver(opts) {
  opts = opts || {};
  var doc = root.document, G = root.LumosGuide, ease = opts.ease || 'kind', mode = opts.guide || 'auto';
  var cv = doc.createElement('canvas'), cx = cv.getContext('2d'), W = 0, H = 0, DPR = 1;
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;touch-action:none;background:transparent';
  var guide = null, spot = null, built = null, stroke = null, active = null, trail = null, raf = 0, finished = false, resolve;
  var done = new Promise(function (r) { resolve = r; }), touched = root.performance.now(), pending = null;
  function where() { var p = typeof opts.at === 'function' ? opts.at() : opts.at; return p || { x: W / 2, y: H * 0.4 }; }
  function size() {
    DPR = Math.min(root.devicePixelRatio || 1, 2.5); W = root.innerWidth; H = root.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cx.setTransform(DPR, 0, 0, DPR, 0, 0); built = null;
  }
  function box() {   /* the line from below up to just under the spot, kept on the screen */
    var S = Math.min(W, H), gap = S * 0.035, len = Math.max(S * 0.12, Math.min(S * (opts.reach || 0.32), H - 16 - (spot.y + gap)));
    return { G: len, ox: spot.x - len / 2, oy: spot.y + gap };
  }
  if (G && mode !== 'off') {
    var right = (typeof opts.at === 'function' ? opts.at() : opts.at || { x: 0 }).x < root.innerWidth / 2;
    guide = G.create({ key: mode === 'always' ? 'lumos.spells.castOver.always' : 'lumos.charms.lumosGuidedHits',
      box: function () { return box(); }, rest: 1.2, mirror: false,
      parts: [{ pts: G.line([0.5, 1], [0.5, 0], 28), secs: 0.3, label: 'Lumos', at: 0.5, dx: right ? 2.6 : -2.6 }] });
  }
  function frame(now) {
    if (finished) return;
    if (opts.wait && active === null && !pending && now - touched > opts.wait * 1000) { leave(); return; }
    spot = where();
    if (guide && (!built || Math.abs(built.x - spot.x) + Math.abs(built.y - spot.y) > 2)) { guide.build(W, H); built = { x: spot.x, y: spot.y }; }
    cx.clearRect(0, 0, W, H);
    if (guide) guide.draw(cx, now, !!stroke);
    var pts = stroke || (trail && trail.pts), a = stroke ? 1 : (trail ? Math.max(0, 1 - (now - trail.at) / 350) : 0);
    if (pts && pts.length > 1 && a > 0) {
      cx.save(); cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(220,225,255,' + 0.55 * a + ')'; cx.lineWidth = 5;
      cx.beginPath(); pts.forEach(function (p, i) { i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y); }); cx.stroke(); cx.restore();
    }
    raf = root.requestAnimationFrame(frame);
  }
  function pt(ev) { return { x: ev.clientX, y: ev.clientY, t: Math.round(root.performance.now()) }; }
  function finish(out) {
    if (finished) return; finished = true; root.cancelAnimationFrame(raf);
    root.removeEventListener('resize', size); if (cv.parentNode) cv.parentNode.removeChild(cv); resolve(out);
  }
  function leave() { finish(pending || { verdict: 'cancelled', judge: null, traced: false }); }
  cv.addEventListener('pointerdown', function (ev) {
    ev.preventDefault(); touched = root.performance.now();
    var out = active === null && exitAt(cv, ev, opts.exits);
    if (out) { leave(); leaveBy(out); return; }
    if (active !== null) return;
    active = ev.pointerId; stroke = [pt(ev)]; trail = null; if (guide) guide.cover(stroke[0]);
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  cv.addEventListener('pointermove', function (ev) {
    if (ev.pointerId !== active || !stroke) return; ev.preventDefault();
    var list = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev]; if (!list.length) list = [ev];
    list.forEach(function (e2) { var q = pt(e2); stroke.push(q); if (guide) guide.cover(q); });
  });
  cv.addEventListener('pointerup', function (ev) {
    if (ev.pointerId !== active || !stroke) return;
    active = null; stroke.push(pt(ev)); var pts = stroke; stroke = null;
    var out = judge(pts);
    if (!out) return;   /* a tap: wait on */
    trail = { pts: pts, at: root.performance.now() }; pending = out;
    root.setTimeout(function () { finish(out); }, 350);
  });
  cv.addEventListener('pointercancel', function (ev) { if (ev.pointerId === active) { active = null; stroke = null; if (guide) guide.clear(); } });
  function judge(pts) {   /* also the way in for checks: cast.judge(points) */
    var j = judgeFlick(pts, W, H, ease), lv = guide ? guide.level() : 0, tr = guide ? guide.score(pts) : null;
    if (j.reason === 'tap') { if (guide) guide.clear(); return null; }
    var traced = !!(tr && tr.traced), ok = j.verdict === 'lumos' || traced;
    if (guide) { if (ok) guide.hit(lv > 0 && mode !== 'always'); else guide.miss(); }
    return { verdict: ok ? 'cast' : 'missed', judge: j, traced: traced, first: ok && firstCast('lumos'), why: ok ? null : FLICK_WHY[j.reason] || FLICK_WHY.short };
  }
  size(); root.addEventListener('resize', size); doc.body.appendChild(cv); raf = root.requestAnimationFrame(frame);
  return { done: done, cancel: function () { finish({ verdict: 'cancelled', judge: null, traced: false }); },
    judge: function (pts) { var out = judge(pts); if (out) finish(out); return out; } };
}

/* The clear layer a room's spell waits on (req 146): over the whole page, taking touches until it is done, then gone.
   Never over a way out (EXITS, opts.exits): a finger there calls L.leave, the spell's own cancel, unless an answer is
   already on its way (L.later), which then comes at once; then the tap goes on. opts.wait: quiet seconds, while
   hooks.waiting() (or always), before L.leave is called the same way. */
function layer(hooks, opts) {
  opts = opts || {};
  var doc = root.document, cv = doc.createElement('canvas'), cx = cv.getContext('2d'), raf = 0, finished = false, resolve;
  var L = { cv: cv, cx: cx, W: 0, H: 0, done: new Promise(function (r) { resolve = r; }), leave: null, pending: undefined };
  var fingers = 0, touched = root.performance.now();
  function go() { if (L.pending !== undefined) L.finish(L.pending); else if (L.leave) L.leave(); else L.finish(null); }
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;touch-action:none;background:transparent';
  function size() {
    var DPR = Math.min(root.devicePixelRatio || 1, 2.5); L.W = root.innerWidth; L.H = root.innerHeight;
    cv.width = Math.round(L.W * DPR); cv.height = Math.round(L.H * DPR); cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (hooks.size) hooks.size();
  }
  function frame(now) {
    if (finished) return;
    if (opts.wait && !fingers && L.pending === undefined && now - touched > opts.wait * 1000 && (!hooks.waiting || hooks.waiting())) { go(); if (finished) return; }
    cx.clearRect(0, 0, L.W, L.H); hooks.frame(now); raf = root.requestAnimationFrame(frame);
  }
  L.pt = function (ev) { return { x: ev.clientX, y: ev.clientY, t: Math.round(root.performance.now()) }; };
  L.finish = function (out) {
    if (finished) return; finished = true; root.cancelAnimationFrame(raf);
    root.removeEventListener('resize', size); if (cv.parentNode) cv.parentNode.removeChild(cv); resolve(out);
  };
  L.later = function (out, ms) { L.pending = out; root.setTimeout(function () { L.finish(out); }, ms); };
  cv.addEventListener('pointerdown', function (ev) {
    ev.preventDefault(); touched = root.performance.now();
    var out = !fingers && exitAt(cv, ev, opts.exits);
    if (out) { go(); leaveBy(out); return; }
    fingers++; hooks.down(ev);
  });
  cv.addEventListener('pointermove', function (ev) { if (hooks.move) hooks.move(ev); });
  cv.addEventListener('pointerup', function (ev) { fingers = Math.max(0, fingers - 1); touched = root.performance.now(); if (hooks.up) hooks.up(ev); });
  cv.addEventListener('pointercancel', function (ev) { fingers = Math.max(0, fingers - 1); if (hooks.cancel) hooks.cancel(ev); });
  size(); root.addEventListener('resize', size); doc.body.appendChild(cv); raf = root.requestAnimationFrame(frame);
  return L;
}

/* Alohomora on a lock a room names (req 146, Magic for the boys, *Alohomora in the castle*: Percy's drawer, req 143,
   and the brass key's door; tried on page/charms/room-spells-test.html). The book's tap, then the key turn (Q4,
   Godric, 12 October 2026, 8.01 am): a tap on the lock, then one stroke round it, judged by judgeTurn. While it waits,
   the layer draws the lock's face round the spot, marked as a clock (12, 3, 6, 9: a quarter turn is twelve to
   three), the gold wedge he has turned and its degrees, and after the tap the traced guide (guide.js, if the room
   loads it; the same store as the Charms page, so his guided casts carry over). A touch away from the lock costs
   nothing. The answer is 'opened', 'tight' (the wrong way round: the lock tightens), 'missed', or for a stuck lock
   'nothing' whatever the turn (the door that wants its own key, PS 16); cancel() answers 'cancelled'. The room says
   and draws what follows; it asks learned('alohomora') (set on the Charms page) before it offers the spell.
   opts: { at: {x, y} in CSS pixels, or a function returning one each frame,
           r: the face's radius in CSS pixels, or a function (0.12 of the screen's short side by default),
           turn: 0.25 (default), 0.5 or 0.75; dir: 1 clockwise (default) or -1; stuck: false (default) or true,
           ease: 'kind' (default), 'fair' or 'strict' (TURN_EASES), guide: 'auto' (default), 'always' or 'off',
           face: true (default) or false, for a room that draws its own lock face,
           onTap: optional, called once the tap lands, for the room's "now turn it" }
   Returns { done: a promise of { verdict, judge, traced, first, why (lockWhy, for every answer but 'opened') },
             cancel(), tap(), judge(points) }. */
function openLock(opts) {
  opts = opts || {};
  var G = root.LumosGuide, ease = opts.ease || 'kind', mode = opts.guide || 'auto';
  var want = { turn: opts.turn || 0.25, dir: opts.dir === -1 ? -1 : 1 };
  var stage = 'tap', guide = null, built = null, stroke = null, active = null, trail = null, c = null, r = 0, L;
  function place() {
    var S = Math.min(L.W, L.H), p = typeof opts.at === 'function' ? opts.at() : opts.at, q = typeof opts.r === 'function' ? opts.r() : opts.r;
    c = p || { x: L.W / 2, y: L.H * 0.45 }; r = q || S * 0.12;
  }
  if (G && mode !== 'off') {
    var mid = want.dir * want.turn * Math.PI;
    guide = G.create({ key: mode === 'always' ? 'lumos.spells.openLock.always' : 'lumos.charms.alohomoraGuidedHits', rest: 1.0, mirror: false,
      box: function () { var g = r / 0.4; return { G: g, ox: c.x - g / 2, oy: c.y - g / 2 }; },
      parts: [{ pts: G.arc([0.5, 0.5], 0.4, 0, want.dir * want.turn * 360, Math.round(want.turn * 48)), secs: 0.55 * want.turn * 4,
        label: want.turn === 0.25 ? 'a quarter' : (want.turn === 0.5 ? 'a half' : 'three quarters'), at: 0.5,
        dx: Math.sin(mid) * 3.2, dy: -Math.cos(mid) * 1.4 }] });
  }
  function sweepOf(pts) {   /* the same unwrapping as judgeTurn, for the wedge as he turns */
    var s = 0, la = null, a0 = null;
    for (var i = 0; i < pts.length; i++) {
      var dx = pts[i].x - c.x, dy = pts[i].y - c.y; if (Math.hypot(dx, dy) < r * 0.3) continue;
      var a = Math.atan2(dy, dx); if (a0 === null) a0 = a;
      if (la !== null) { var d = a - la; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; s += d; }
      la = a;
    }
    return a0 === null ? null : { a0: a0, s: s };
  }
  function drawFace(cx, now) {
    var i, S = Math.min(L.W, L.H);
    if (opts.face !== false) {
      cx.save(); cx.strokeStyle = 'rgba(217,199,154,0.7)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(c.x, c.y, r * 1.08, 0, 7); cx.stroke();
      for (i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2, q = i % 3 === 0, r0 = r * (q ? 0.86 : 0.95);
        cx.strokeStyle = q ? '#d9c79a' : 'rgba(217,199,154,0.5)'; cx.lineWidth = q ? 3 : 1.5;
        cx.beginPath(); cx.moveTo(c.x + Math.sin(a) * r0, c.y - Math.cos(a) * r0); cx.lineTo(c.x + Math.sin(a) * r * 1.08, c.y - Math.cos(a) * r * 1.08); cx.stroke();
      }
      cx.font = '600 ' + Math.round(Math.max(11, r * 0.16)) + 'px Georgia, serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#d9c79a';
      cx.shadowColor = '#000'; cx.shadowBlur = 4;
      [12, 3, 6, 9].forEach(function (n, k) { var b = k * Math.PI / 2; cx.fillText(String(n), c.x + Math.sin(b) * r * 0.68, c.y - Math.cos(b) * r * 0.68); });
      cx.restore();
    }
    var sw = stroke ? sweepOf(stroke) : (trail ? sweepOf(trail.pts) : null);
    if (sw && Math.abs(sw.s) > 0.05) {
      cx.save(); cx.fillStyle = 'rgba(243,210,122,0.28)'; cx.beginPath(); cx.moveTo(c.x, c.y);
      cx.arc(c.x, c.y, r * 0.82, sw.a0, sw.a0 + sw.s, sw.s < 0); cx.closePath(); cx.fill();
      cx.font = '600 ' + Math.round(Math.max(16, S * 0.045)) + 'px Georgia, serif'; cx.textAlign = 'center';
      cx.fillStyle = '#f3d27a'; cx.shadowColor = '#000'; cx.shadowBlur = 6;
      cx.fillText(Math.round(Math.abs(sw.s) * 180 / Math.PI) + '°', c.x, c.y + r * 1.55); cx.restore();
    }
    if (stage === 'turn') {
      var gl = cx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 0.3);
      gl.addColorStop(0, 'rgba(255,240,200,' + (0.55 + 0.2 * Math.sin(now / 200)) + ')'); gl.addColorStop(1, 'rgba(255,220,150,0)');
      cx.fillStyle = gl; cx.beginPath(); cx.arc(c.x, c.y, r * 0.3, 0, 7); cx.fill();
    }
  }
  function tapped() { stage = 'turn'; if (opts.onTap) opts.onTap(); }
  function judge(pts) {   /* also the way in for checks */
    var j = judgeTurn(pts, c, r, want, L.W, L.H, ease);
    if (j.reason === 'tap') { if (guide) guide.clear(); return null; }
    var lv = guide ? guide.level() : 0, tr = guide ? guide.score(pts) : null, traced = !!(tr && tr.traced);
    var verdict = j.verdict === 'open' || (traced && j.verdict === 'miss') ? 'opened' : (j.verdict === 'tight' ? 'tight' : 'missed');
    if (opts.stuck) verdict = 'nothing';
    else if (guide) { if (verdict === 'opened') guide.hit(lv > 0 && mode !== 'always'); else guide.miss(); }
    return { verdict: verdict, judge: j, traced: traced, first: verdict === 'opened' && firstCast('alohomora'),
      why: verdict === 'opened' ? null : lockWhy(verdict, j.reason, want) };
  }
  L = layer({
    size: function () { built = null; },
    frame: function (now) {
      place();
      if (guide && (!built || Math.abs(built.x - c.x) + Math.abs(built.y - c.y) + Math.abs(built.r - r) > 2)) { guide.build(L.W, L.H); built = { x: c.x, y: c.y, r: r }; }
      drawFace(L.cx, now);
      if (stage === 'turn' && guide) guide.draw(L.cx, now, !!stroke);
      var pts = stroke || (trail && trail.pts), a = stroke ? 1 : (trail ? Math.max(0, 1 - (now - trail.at) / 350) : 0), cx = L.cx;
      if (pts && pts.length > 1 && a > 0) {
        cx.save(); cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(220,225,255,' + 0.55 * a + ')'; cx.lineWidth = 5;
        cx.beginPath(); pts.forEach(function (p, i) { i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y); }); cx.stroke(); cx.restore();
      }
    },
    down: function (ev) {
      var p = L.pt(ev);
      if (stage === 'tap') { if (Math.hypot(p.x - c.x, p.y - c.y) <= r * 1.1) tapped(); return; }
      if (stage !== 'turn' || active !== null) return;
      active = ev.pointerId; stroke = [p]; trail = null; if (guide) guide.cover(p);
      try { L.cv.setPointerCapture(ev.pointerId); } catch (e) {}
    },
    move: function (ev) {
      if (ev.pointerId !== active || !stroke) return; ev.preventDefault();
      var list = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev]; if (!list.length) list = [ev];
      list.forEach(function (e2) { var q = L.pt(e2); stroke.push(q); if (guide) guide.cover(q); });
    },
    up: function (ev) {
      if (ev.pointerId !== active || !stroke) return;
      active = null; stroke.push(L.pt(ev)); var pts = stroke; stroke = null;
      var out = judge(pts); if (!out) return;
      stage = 'done'; trail = { pts: pts, at: root.performance.now() }; L.later(out, 350);
    },
    cancel: function (ev) { if (ev.pointerId === active) { active = null; stroke = null; if (guide) guide.clear(); } }
  }, opts);
  place();
  return { done: L.done, cancel: L.leave = function () { L.finish({ verdict: 'cancelled', judge: null, traced: false }); },
    tap: function () { if (stage === 'tap') tapped(); },
    judge: function (pts) { if (stage === 'tap') tapped(); var out = judge(pts); if (out) { stage = 'done'; L.finish(out); } return out; } };
}

/* Aparecium on a sheet a room names (req 146, Magic for the boys, *Aparecium in the castle*: Wood's blank notice on
   the board, req 144; tried on page/charms/room-spells-test.html). Three taps on the sheet itself, judged by
   judgeTaps as the Charms page judges them: in a line, the middle one halfway, at an even beat (or the beat alone).
   A touch off the sheet costs nothing; a pause longer than the ease's gap starts the count again. The layer marks
   each tap with a small gold ring, and the traced guide shows its three rings across the sheet (the same store as
   the Charms page). The answer is 'revealed' or 'missed'; cancel() answers 'cancelled'. The room brings the ink back,
   or not; it asks learned('aparecium') (set on the Charms page) before it offers the spell.
   opts: { sheet: {x, y, w, h} in CSS pixels, or a function returning one each frame,
           ease: 'kind' (default), 'fair' or 'strict' (TAP_EASES), beatAlone: false (default) or true,
           guide: 'auto' (default), 'always' or 'off' }
   Returns { done: a promise of { verdict, judge, traced, first, why (a miss's inkWhy) }, cancel(), taps(list of
             {x, y, t}) }. */
function revealInk(opts) {
  opts = opts || {};
  var G = root.LumosGuide, mode = opts.guide || 'auto', alone = !!opts.beatAlone;
  var e = Object.assign({}, TAP_EASES[opts.ease] || TAP_EASES.kind); if (alone) e.place = false;
  var taps = [], rings = [], R = null, guide = null, built = null, over = false, L;
  function place() { var s = typeof opts.sheet === 'function' ? opts.sheet() : opts.sheet; R = s || { x: L.W * 0.1, y: L.H * 0.2, w: L.W * 0.8, h: L.H * 0.6 }; }
  if (G && mode !== 'off') {
    guide = G.create({ key: mode === 'always' ? 'lumos.spells.revealInk.always' : 'lumos.charms.apareciumGuidedHits', rest: 1.0, mirror: false, beatSecs: 0.5,
      box: function () { return { G: R.w, ox: R.x, oy: R.y + R.h * 0.56 }; },
      beats: alone ? [[0.5, 0], [0.5, 0], [0.5, 0]] : [[0.2, 0], [0.5, 0], [0.8, 0]],
      beatLabels: alone ? ['tap, tap, tap', '', ''] : ['tap', 'tap', 'tap'] });
  }
  function tapAt(p) {   /* also the way in for checks */
    if (over) return null;
    if (p.x < R.x || p.x > R.x + R.w || p.y < R.y || p.y > R.y + R.h) return null;
    taps.push(p); rings.push({ x: p.x, y: p.y, at: root.performance.now() }); if (guide) guide.cover(p);
    var j = judgeTaps(taps, L.W, L.H, e);
    if (j.count < taps.length && j.verdict === 'waiting') taps = taps.slice(taps.length - j.count);
    if (j.verdict === 'waiting') return null;
    var three = taps.slice(-3), lv = guide ? guide.level() : 0, tr = guide ? guide.scoreTaps(three) : null;
    var traced = !!(tr && tr.traced && j.reason !== 'uneven beat'), ok = j.verdict === 'open' || traced;
    if (guide) { if (ok) guide.hit(lv > 0 && mode !== 'always'); else guide.miss(); }
    over = true; taps = [];
    return { verdict: ok ? 'revealed' : 'missed', judge: j, traced: traced, first: ok && firstCast('aparecium'), why: ok ? null : inkWhy(j) };
  }
  L = layer({
    size: function () { built = null; },
    frame: function (now) {
      place(); var cx = L.cx;
      if (guide && (!built || Math.abs(built.x - R.x) + Math.abs(built.y - R.y) + Math.abs(built.w - R.w) > 2)) { guide.build(L.W, L.H); built = { x: R.x, y: R.y, w: R.w }; }
      if (guide && !over) guide.draw(cx, now, false);
      var S = Math.min(L.W, L.H);
      rings = rings.filter(function (g) { return now - g.at < 900; });
      rings.forEach(function (g) { var k = (now - g.at) / 900;
        cx.save(); cx.strokeStyle = 'rgba(243,210,122,' + (0.9 * (1 - k)) + ')'; cx.lineWidth = 3;
        cx.beginPath(); cx.arc(g.x, g.y, S * (0.025 + 0.05 * k), 0, 7); cx.stroke(); cx.restore(); });
    },
    down: function (ev) { var out = tapAt(L.pt(ev)); if (out) L.later(out, 450); }
  }, opts);
  place();
  return { done: L.done, cancel: L.leave = function () { L.finish({ verdict: 'cancelled', judge: null, traced: false }); },
    taps: function (list) { var out = null; for (var i = 0; i < list.length && !out; i++) out = tapAt(list[i]); if (out) L.finish(out); return out; } };
}

/* The kind answer to each Leviosa miss, the words the Charms page shows (moved from leviosa-test.html, 12 October
   2026, req 153), so a room's feather and the page's say the same: [what the thing does, what to try]. */
var SWISH_WHY = {
  small: ['It twitches', 'A little bigger: a curve, then a flick up.'],
  slow: ['It lifts a finger, and drops', 'Quicker: swish and flick is one quick stroke.'],
  windmill: ['It spins round and round', 'Ron waved his arms like a windmill too. One curve, then one flick.'],
  wave: ['It flops over', 'A curve with no flick. Finish with a sharp flick up.'],
  line: ['It flops over', 'Only a line. Swish first: a curve, then the flick.'],
  noswish: ['It twitches', 'The swish should curve, like part of a circle.'],
  flickwiggly: ['It wobbles', 'Keep the flick straight, like a line.'],
  flickaside: ['It scoots along the table', 'The flick went sideways. Flick it up.'],
  flicklong: ['It drifts up, and sinks', 'The flick is short and sharp; the swish is the long part.'],
  prod: ['You prodded it!', 'Seamus prodded his feather and set fire to it. Swish and flick, from a little way off.']
};

/* Wingardium Leviosa on a thing a room names, and his steer while it floats (req 153, the Interaction lane's §9 and
   row 6; Godric's Q1 and Q1b, 12 October 2026; tried on page/charms/room-spells-test.html). The room offers it when
   he taps the thing; the swish and flick is drawn on a clear layer over the room, so it never fights the look-drag,
   judged by judgeSwishFlick as the Charms page judges it, with the traced guide in the page's own store
   (lumos.charms.leviosaGuidedHits) and its own path, placed so the flick ends beside the thing. A tap elsewhere costs
   nothing; a tap on the thing itself is Seamus's prod (PS 10), a miss.
   On a hit the layer stays up: the thing rises (about 1.6 s) and hovers, and any one-finger drag steers it (it follows
   the finger's movement, not the finger, kept inside `bounds`), still on the layer, so the room's view never turns;
   seven quiet seconds after the last drag it floats down and settles where it was steered. Over the first seconds the
   layer marks his own stroke, the curve blue and the line gold, the corner ringed with its angle (the geometry, way 2).
   The room draws the thing at the point onSteer gives it, every frame from the lift to the landing.
   Answers, by `done`: 'lifted' at the hit (the steer follows), 'missed' with its cause (judge.reason, or 'prod') and
   `why`, the page's kind words for it (SWISH_WHY: the room moves the thing as the page does, twitch, flop, scoot,
   spin, smoke), or 'cancelled'. `settled` answers once the thing is down: { at, cancelled }. cancel() (he left the
   stop, or waited too long) lets the offer go before the cast, or puts the thing down at once while it floats. The
   room asks learned('leviosa') (set on the Charms page) before it offers the spell.
   opts: { at: {x, y} in CSS pixels, or a function returning one each frame (where the thing rests),
           size: the thing's reach for a prod, in CSS pixels (0.06 of the screen's short side by default),
           height: how far above its rest it hovers (0.22 of the short side), hold: quiet seconds before it settles (7),
           bounds: {x, y, w, h} the steer keeps it in, or a function (the screen less a margin by default),
           land: optional function(p) giving where a thing let go at p comes to rest (straight down to its rest height),
           onSteer: function({x, y, phase: 'rise' | 'hover' | 'fall'}), onSettle: function({x, y}),
           ease: 'kind' (default), 'fair' or 'strict' (SWISH_EASES), guide: 'auto' (default), 'always' or 'off',
           mirror: true for a left wand arm (?hand=left otherwise), mark: true (default) or false }
   Returns { done, settled, cancel(), judge(points), steer(dx, dy), state() }. */
function levitate(opts) {
  opts = opts || {};
  var G = root.LumosGuide, ease = opts.ease || 'kind', mode = opts.guide || 'auto', L;
  var stage = 'cast', guide = null, built = null, stroke = null, active = null, trail = null, mark = null, home = null;
  var F = null, drag = null, quietAt = 0, settle, settled = new Promise(function (r) { settle = r; });
  function S() { return Math.min(L.W, L.H); }
  function spot() { var p = typeof opts.at === 'function' ? opts.at() : opts.at; return p || { x: L.W / 2, y: L.H * 0.62 }; }
  function bounds() {
    var b = typeof opts.bounds === 'function' ? opts.bounds() : opts.bounds, m = S() * 0.08;
    return b || { x: m, y: m, w: L.W - 2 * m, h: L.H - 2 * m };
  }
  function mir() { return opts.mirror == null ? !!(G && G.mirrored) : !!opts.mirror; }
  function box() {   /* the swish and flick's box, the flick ending just beside the thing, kept on the screen */
    var s = spot(), x = mir() ? L.W - s.x : s.x, g = Math.min(L.W * 0.7, L.H * 0.5);
    g = Math.max(S() * 0.45, Math.min(g, (x - S() * 0.1) / 0.95));   /* on a narrow screen, smaller, to stay beside the thing */
    var ox = x - g * 0.95 - S() * 0.05, oy = s.y - g * 0.1;
    ox = Math.max(S() * 0.05, Math.min(L.W - 8 - g * 0.95, ox)); oy = Math.max(g * 0.15 + 8, Math.min(L.H - 8 - g * 0.8, oy));
    return { G: g, ox: ox, oy: oy };
  }
  if (G && mode !== 'off') {
    guide = G.create({ key: mode === 'always' ? 'lumos.spells.levitate.always' : 'lumos.charms.leviosaGuidedHits', box: function () { return box(); },
      mirror: function () { return mir(); }, parts: [
        { pts: G.quad([0, 0], [0.08, 0.75], [0.8, 0.55], 40), secs: 0.9, label: 'swish', at: 0.55, dy: -0.9 },
        { pts: G.line([0.8, 0.55], [0.95, -0.15], 16), secs: 0.25, label: 'and flick', at: 0.5, dx: -2.9 }] });
  }
  function clampIn(p) { var b = bounds(); return { x: Math.max(b.x, Math.min(b.x + b.w, p.x)), y: Math.max(b.y, Math.min(b.y + b.h, p.y)) }; }
  function lift(now) {
    stage = 'float'; home = spot();
    var t = clampIn({ x: home.x, y: home.y - (opts.height || S() * 0.22) });
    F = { phase: 'rise', t0: now, x: home.x, y: home.y, tx: t.x, ty: t.y, from: { x: home.x, y: home.y } }; quietAt = now;
  }
  function down(now) {
    var p = opts.land ? opts.land({ x: F.x, y: F.y }) : { x: F.x, y: home.y };
    F.phase = 'fall'; F.t0 = now; F.from = { x: F.x, y: F.y }; F.to = p;
  }
  function stepFloat(now) {
    var t = (now - F.t0) / 1000, k, e;
    if (F.phase === 'rise') {
      k = Math.min(1, t / 1.6); e = 1 - Math.pow(1 - k, 3);
      F.x = F.from.x + (F.tx - F.from.x) * e; F.y = F.from.y + (F.ty - F.from.y) * e;
      if (k >= 1) { F.phase = 'hover'; F.t0 = now; }
    } else if (F.phase === 'hover') {
      F.x += (F.tx - F.x) * 0.1 + Math.sin(now / 900) * 0.3;
      F.y += (F.ty + Math.sin(now / 650) * S() * 0.012 - F.y) * 0.1;
      if (!drag && now - quietAt > (opts.hold || 7) * 1000) down(now);
    } else if (F.phase === 'fall') {
      var d = Math.hypot(F.to.x - F.from.x, F.to.y - F.from.y), secs = Math.max(0.8, d / (S() * 0.25));
      k = Math.min(1, t / secs);
      F.x = F.from.x + (F.to.x - F.from.x) * k + Math.sin(now / 300) * 6 * (1 - k); F.y = F.from.y + (F.to.y - F.from.y) * k;
      if (k >= 1) { F.x = F.to.x; F.y = F.to.y; land(false); return; }
    }
    if (opts.onSteer) opts.onSteer({ x: F.x, y: F.y, phase: F.phase });
  }
  function land(cancelled) {
    if (stage === 'gone') return; stage = 'gone';
    var p = F ? { x: F.x, y: F.y } : null;
    if (p && opts.onSettle) opts.onSettle(p);
    settle({ at: p, cancelled: cancelled }); L.finish(null);
  }
  function drawMark(cx, now) {
    if (!mark || opts.mark === false) return;
    var age = (now - mark.at) / 3500; if (age > 1) { mark = null; return; }
    var a = age < 0.8 ? 1 : (1 - age) / 0.2, p = mark.pts, c = mark.corner, fs = Math.round(Math.max(16, S() * 0.038));
    cx.save(); cx.globalAlpha = a; cx.lineCap = 'round'; cx.lineJoin = 'round';
    cx.strokeStyle = '#9fd0ff'; cx.lineWidth = 4; cx.beginPath(); p.slice(0, c + 1).forEach(function (q, i) { i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y); }); cx.stroke();
    cx.strokeStyle = '#ffe9a8'; cx.beginPath(); p.slice(c).forEach(function (q, i) { i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y); }); cx.stroke();
    cx.strokeStyle = '#e8be5a'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(p[c].x, p[c].y, 9, 0, 7); cx.stroke();
    cx.font = '600 ' + fs + 'px Georgia, serif'; cx.textAlign = 'center'; cx.shadowColor = 'rgba(0,0,0,0.9)'; cx.shadowBlur = 6;
    var m = p[Math.floor(c / 2)], e = p[Math.min(p.length - 1, c + Math.floor((p.length - c) * 0.6))];
    cx.fillStyle = '#9fd0ff'; cx.fillText('a curve', m.x - fs * 2.4, m.y + fs * 0.4);
    cx.fillStyle = '#ffe9a8'; cx.fillText('a line', e.x + fs * 2.2, e.y);
    cx.fillStyle = '#e8be5a'; cx.fillText('corner ' + Math.round(mark.deg) + '°', p[c].x, p[c].y + fs * 1.5);
    cx.restore();
  }
  function judge(pts) {   /* also the way in for checks */
    var j = judgeSwishFlick(pts, L.W, L.H, ease), now = root.performance.now();
    if (j.reason === 'tap') {
      var s = spot(), q = pts[0];
      if (guide) guide.clear();
      if (Math.hypot(q.x - s.x, q.y - s.y) > (opts.size || S() * 0.06)) return null;   /* a tap away from the thing: wait on */
      j.reason = 'prod';
    }
    var lv = guide ? guide.level() : 0, tr = guide && j.reason !== 'prod' ? guide.score(pts) : null, traced = !!(tr && tr.traced);
    var ok = j.verdict === 'leviosa' || traced;
    if (guide && j.reason !== 'prod') { if (ok) guide.hit(lv > 0 && mode !== 'always'); else guide.miss(); }
    if (ok) {
      if (j.verdict === 'leviosa') mark = { at: now, pts: j.pts, corner: j.corner, deg: j.cornerDeg };
      lift(now); return { verdict: 'lifted', judge: j, traced: traced, why: null, first: firstCast('leviosa') };
    }
    return { verdict: 'missed', judge: j, traced: false, cause: j.reason, why: SWISH_WHY[j.reason] || SWISH_WHY.small };
  }
  var answered;
  function answer(out) { if (answered) return; answered = true; resolveDone(out); }
  var resolveDone, done = new Promise(function (r) { resolveDone = r; });
  L = layer({
    size: function () { built = null; },
    frame: function (now) {
      var cx = L.cx, s = spot();
      if (stage === 'cast' && guide && (!built || Math.abs(built.x - s.x) + Math.abs(built.y - s.y) > 2)) { guide.build(L.W, L.H); built = { x: s.x, y: s.y }; }
      if (stage === 'cast' && guide) guide.draw(cx, now, !!stroke);
      if (stage === 'float') stepFloat(now);
      drawMark(cx, now);
      var pts = stroke || (trail && trail.pts), a = stroke ? 1 : (trail ? Math.max(0, 1 - (now - trail.at) / 350) : 0);
      if (pts && pts.length > 1 && a > 0) {
        cx.save(); cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(220,225,255,' + 0.55 * a + ')'; cx.lineWidth = 5;
        cx.beginPath(); pts.forEach(function (p, i) { i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y); }); cx.stroke(); cx.restore();
      }
    },
    down: function (ev) {
      if (active !== null) return;
      var p = L.pt(ev); active = ev.pointerId;
      try { L.cv.setPointerCapture(ev.pointerId); } catch (e) {}
      if (stage === 'float') { drag = { x: p.x, y: p.y }; if (F.phase === 'fall') { F.phase = 'hover'; F.t0 = p.t; } return; }
      if (stage !== 'cast') return;
      stroke = [p]; trail = null; if (guide) guide.cover(p);
    },
    move: function (ev) {
      if (ev.pointerId !== active) return; ev.preventDefault();
      if (drag) { var q = L.pt(ev); steer(q.x - drag.x, q.y - drag.y); drag = { x: q.x, y: q.y }; return; }
      if (!stroke) return;
      var list = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev]; if (!list.length) list = [ev];
      list.forEach(function (e2) { var q = L.pt(e2); stroke.push(q); if (guide) guide.cover(q); });
    },
    up: function (ev) {
      if (ev.pointerId !== active) return; active = null;
      if (drag) { drag = null; quietAt = root.performance.now(); return; }
      if (!stroke) return;
      stroke.push(L.pt(ev)); var pts = stroke; stroke = null;
      var out = judge(pts); if (!out) return;
      trail = { pts: pts, at: root.performance.now() };
      if (out.verdict === 'lifted') answer(out);
      else { stage = 'gone'; settle({ at: null, cancelled: false }); L.later(null, 350); answer(out); }
    },
    waiting: function () { return stage === 'cast'; },
    cancel: function (ev) { if (ev.pointerId === active) { active = null; stroke = null; drag = null; if (guide) guide.clear(); } }
  }, opts);
  function steer(dx, dy) {   /* also the way in for checks */
    if (stage !== 'float') return null;
    var t = clampIn({ x: F.tx + dx, y: F.ty + dy }); F.tx = t.x; F.ty = t.y; quietAt = root.performance.now();
    if (F.phase === 'fall') { F.phase = 'hover'; F.t0 = quietAt; }
    return t;
  }
  return { done: done, settled: settled,
    cancel: L.leave = function () {
      if (stage === 'cast') { stage = 'gone'; answer({ verdict: 'cancelled', judge: null, traced: false }); settle({ at: null, cancelled: true }); L.finish(null); }
      else if (stage === 'float') { var p = opts.land ? opts.land({ x: F.x, y: F.y }) : { x: F.x, y: home.y }; F.x = p.x; F.y = p.y; land(true); }
    },
    judge: function (pts) { if (stage !== 'cast') return null; var out = judge(pts); if (!out) return null;
      if (out.verdict === 'lifted') answer(out); else { stage = 'gone'; settle({ at: null, cancelled: false }); L.finish(null); answer(out); } return out; },
    steer: steer,
    state: function () { return { stage: stage, phase: F ? F.phase : null, x: F ? Math.round(F.x) : null, y: F ? Math.round(F.y) : null }; } };
}

/* CSS pixels to an inch: Safari reports points, not inches, so this is close, not exact, and said as "about". iPads
   show about 132 points to the inch, phones about 160 (moved from ollivander-test.html, 12 October 2026, req 153). */
function ppi() { return Math.min(root.screen.width, root.screen.height) >= 700 ? 132 : 160; }
function q4(x) { return Math.round(x * 4) / 4; }
function frac(x) { x = q4(x); var n = Math.floor(x), r = Math.round((x - n) * 4); return ((n ? n : '') + ['', '¼', '½', '¾'][r]) || '0'; }

/* Ollivander's tape, the two-finger span, on a thing a room names (req 153; the Ollivander page's tape on his hand,
   PS 5's measuring tape; tried on page/charms/room-spells-test.html). The room offers it when he taps the thing; a
   clear layer over the room takes two fingers at once (the tape stretches between them as he spreads, marked every
   quarter inch, longer at each inch, "about 6¾ in" over it) or two taps, as the Ollivander page takes them. The
   room's pinch never sees these touches: they land on the layer, not the room's canvas. Lifting a finger takes the
   reading. A measuring tape has no wrong way, so a miss is only a touch it could not read: one finger alone for four
   seconds ('one') or two less than half an inch apart ('close'); each answers kindly with `why`. A lone touch is
   an end only if it moved less than TAP_SLOP (the frame's 12 px: a look-drag's lift is no end) and, with `ends`,
   only within reach of one (0.12 of the screen's short side); any other costs nothing (Interaction, req 218).
   By default the inches are real ones on the glass (his hand, his finger); a room measuring a painted thing passes
   `scale`, inches to a CSS pixel in the painting. With `want` (inches) the answer says whether the span is 'right'
   (within `within`, half an inch by default), 'short' or 'long', and the layer leaves a gold mark on the tape where
   `want` falls, so the gap shows. The traced guide is two rings where the fingers go (`ends`, the thing's two ends,
   "this end" and "that end"; otherwise a hand's span either side of `at`, "thumb" and "little finger"), in the
   Charms page's store, lumos.charms.spanGuidedHits.
   opts: { at: {x, y} or a function (where the tape lies), ends: [{x, y}, {x, y}] or a function, scale, want, within,
           guide: 'auto' (default), 'always' or 'off', onChange: function(inches) as he spreads }
   Returns { done: a promise of { verdict: 'measured' | 'right' | 'short' | 'long' | 'missed' | 'cancelled', inches,
             px, pts, cause, why, traced }, cancel(), measure(a, b) }. */
var TAP_SLOP = 12;   /* CSS pixels a touch may move and still be a tap, the frame's (Interaction's vocabulary, §3: a look-drag never taps) */
var SPAN_WHY = {
  one: ['The tape waits for the other end', 'Two fingers, one at each end; or tap one end, then the other.'],
  close: ['The tape curls up', 'Spread them further apart: one finger at each end.']
};
function measureSpan(opts) {
  opts = opts || {};
  var G = root.LumosGuide, mode = opts.guide || 'auto', within = opts.within == null ? 0.5 : opts.within, L;
  var touches = {}, starts = {}, taps = [], tape = null, over = false, oneAt = 0, guide = null, built = null;
  function scale() { return opts.scale || 1 / ppi(); }
  function spot() { var p = typeof opts.at === 'function' ? opts.at() : opts.at; return p || { x: L.W / 2, y: L.H / 2 }; }
  function ends() {
    var e = typeof opts.ends === 'function' ? opts.ends() : opts.ends; if (e) return e;
    var s = spot(), half = Math.min(L.W * 0.32, 3.25 / scale());   /* a boy's hand, thumb to little finger, about 6½ in */
    return [{ x: s.x - half, y: s.y }, { x: s.x + half, y: s.y }];
  }
  if (G && mode !== 'off') {
    var gspec = { key: mode === 'always' ? 'lumos.spells.measureSpan.always' : 'lumos.charms.spanGuidedHits', rest: 1.2, mirror: false, beatSecs: 0.4,
      box: function () { return { G: 1, ox: 0, oy: 0 }; },   /* the rings are placed in pixels, at the ends, before each build */
      beats: [[0, 0], [1, 0]], beatLabels: opts.ends ? ['this end', 'that end'] : ['thumb', 'little finger'] };
    guide = G.create(gspec);
  }
  function inches(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) * scale(); }
  function drawTape(cx, a, b, label, wantAt) {
    var d = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / (d || 1), uy = (b.y - a.y) / (d || 1), S = Math.min(L.W, L.H);
    cx.save(); cx.lineCap = 'round';
    cx.strokeStyle = 'rgba(0,0,0,0.4)'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
    cx.strokeStyle = '#d9dbe6'; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
    var step = 0.25 / scale(), n = 0;
    cx.strokeStyle = '#5a5d70'; cx.lineWidth = 1;
    for (var s = 0; s <= d; s += step, n++) {
      var x = a.x + ux * s, y = a.y + uy * s, h = n % 4 === 0 ? 4 : 2;
      cx.beginPath(); cx.moveTo(x - uy * h, y + ux * h); cx.lineTo(x + uy * h, y - ux * h); cx.stroke();
    }
    cx.fillStyle = '#b08a3a'; cx.fillRect(b.x - 5, b.y - 5, 10, 10);   /* its brass end */
    if (wantAt != null) {
      var w = Math.min(wantAt / scale(), Math.max(d, wantAt / scale())), wx = a.x + ux * w, wy = a.y + uy * w;
      cx.strokeStyle = '#e8be5a'; cx.lineWidth = 3; cx.setLineDash([4, 4]);
      if (w > d) { cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(wx, wy); cx.stroke(); }
      cx.setLineDash([]); cx.beginPath(); cx.moveTo(wx - uy * 12, wy + ux * 12); cx.lineTo(wx + uy * 12, wy - ux * 12); cx.stroke();
    }
    if (label) {
      var fs = Math.round(Math.max(17, S * 0.04)), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      cx.font = '600 ' + fs + 'px Georgia, serif'; cx.textAlign = 'center'; cx.shadowColor = 'rgba(0,0,0,0.95)'; cx.shadowBlur = 6;
      cx.fillStyle = '#eef0fa'; cx.fillText(label, mx, my - fs * 0.9);
    }
    cx.restore();
  }
  function take(a, b) {   /* also the way in for checks: the reading between two points */
    if (over) return null;
    var inch = inches(a, b), px = Math.round(Math.hypot(a.x - b.x, a.y - b.y)), out;
    if (inch < 0.5) out = { verdict: 'missed', inches: q4(inch), px: px, pts: [a, b], cause: 'close', why: SPAN_WHY.close, traced: false };
    else {
      var tr = guide ? guide.scoreTaps([a, b]) || guide.scoreTaps([b, a]) : null, lv = guide ? guide.level() : 0;
      var v = opts.want == null ? 'measured' : (Math.abs(inch - opts.want) <= within ? 'right' : (inch < opts.want ? 'short' : 'long'));
      out = { verdict: v, inches: q4(inch), px: px, pts: [a, b], cause: null, why: null, traced: !!(tr && tr.traced) };
      if (guide) { if (v === 'measured' || v === 'right') guide.hit(lv > 0 && mode !== 'always'); else guide.miss(); }
    }
    over = true; tape = { a: a, b: b, label: 'about ' + frac(inch) + ' in', at: root.performance.now(), want: out.verdict === 'short' || out.verdict === 'long' };
    return out;
  }
  L = layer({
    size: function () { built = null; },
    frame: function (now) {
      var cx = L.cx, e = ends();
      if (guide && (!built || Math.abs(built.x - e[0].x) + Math.abs(built.y - e[0].y) + Math.abs(built.w - e[1].x) > 2)) { gspec.beats = [[e[0].x, e[0].y], [e[1].x, e[1].y]]; guide.build(L.W, L.H); built = { x: e[0].x, y: e[0].y, w: e[1].x }; }
      var ids = Object.keys(touches);
      if (!over && guide) guide.draw(cx, now, ids.length > 0);
      if (!over && ids.length === 2) {
        var a = touches[ids[0]], b = touches[ids[1]], inch = inches(a, b);
        drawTape(cx, a, b, 'about ' + frac(inch) + ' in', null);
        if (opts.onChange) opts.onChange(q4(inch));
      }
      if (!over && taps.length === 1) {
        var p = taps[0]; cx.save(); cx.fillStyle = '#b08a3a'; cx.fillRect(p.x - 5, p.y - 5, 10, 10); cx.restore();
        if (now - taps[0].at > 4000) { taps = []; miss('one'); }
      }
      if (!over && ids.length === 1 && oneAt && now - oneAt > 4000) miss('one');
      if (tape) drawTape(cx, tape.a, tape.b, tape.label, tape.want ? opts.want : null);
    },
    down: function (ev) {
      if (over) return;
      var p = L.pt(ev); touches[ev.pointerId] = p; starts[ev.pointerId] = p; if (guide) guide.cover(p);
      try { L.cv.setPointerCapture(ev.pointerId); } catch (e) {}
      var n = Object.keys(touches).length;
      if (n === 1) oneAt = root.performance.now(); else oneAt = 0;
    },
    move: function (ev) {
      if (!(ev.pointerId in touches) || over) return;
      ev.preventDefault(); var p = touches[ev.pointerId] = L.pt(ev), s = starts[ev.pointerId];
      if (Object.keys(touches).length === 1 && s && Math.hypot(p.x - s.x, p.y - s.y) > TAP_SLOP) oneAt = 0;   /* a drag, not a held end */
    },
    up: function (ev) {
      if (!(ev.pointerId in touches) || over) return;
      var ids = Object.keys(touches), p = touches[ev.pointerId], s = starts[ev.pointerId], out = null;
      if (ids.length >= 2) {
        var other = touches[ids[0] == ev.pointerId ? ids[1] : ids[0]];
        out = take(other, L.pt(ev));
      } else {
        delete touches[ev.pointerId]; delete starts[ev.pointerId]; oneAt = 0;
        if (s && Math.hypot(p.x - s.x, p.y - s.y) > TAP_SLOP) return;   /* a look-drag's lift is no end (Interaction, req 218) */
        if (opts.ends && !nearEnd(p)) return;   /* a stray tap away from both ends costs nothing */
        taps.push({ x: p.x, y: p.y, at: root.performance.now() });
        if (taps.length >= 2) { out = take(taps[0], taps[1]); taps = []; }
        if (!out) return;
      }
      touches = {};
      if (out) finishWith(out);
    },
    cancel: function (ev) { delete touches[ev.pointerId]; delete starts[ev.pointerId]; }
  }, opts);
  function nearEnd(p) {   /* within an end's reach: 0.12 of the screen's short side, as the other callables' tap */
    var e = ends(), reach = Math.max(28, Math.min(L.W, L.H) * 0.12);
    return Math.hypot(p.x - e[0].x, p.y - e[0].y) <= reach || Math.hypot(p.x - e[1].x, p.y - e[1].y) <= reach;
  }
  function miss(cause) {
    if (over) return; over = true;
    if (guide) guide.miss();
    finishWith({ verdict: 'missed', inches: null, px: null, pts: [], cause: cause, why: SPAN_WHY[cause], traced: false });
  }
  function finishWith(out) { if (opts.onChange && out.inches != null) opts.onChange(out.inches); L.later(out, out.verdict === 'missed' ? 600 : 1400); }
  return { done: L.done, cancel: L.leave = function () { L.finish({ verdict: 'cancelled', inches: null, px: null, pts: [], cause: null, why: null, traced: false }); },
    measure: function (a, b) { var out = take(a, b); if (out) L.finish(out); return out; } };
}

/* Dissendium on the one-eyed witch's hump, for a room (req 163; Magic for the boys, *Dissendium in the castle*, B8: her
   own third-floor landing, req 178, the Corridor's; Godric's Q5, 12 October 2026, 1.58 pm, option 2 with t1; tried on
   page/charms/room-spells-test.html and used by dissendium-test.html). The book's two taps ("you tap it and say
   Dissendium", PoA 16): a first tap on her hump does nothing (PoA 10), and the word's card comes up beside it in
   syllables, Dis-sen-di-um, for the ear (castle-ear.js) is not yet probed on his iPad or phone, so a tap on the card
   says the word for him (Magic, 12 October 2026, 9.53 pm). Then the next tap on the hump opens it by itself, at once.
   As it swings (2.8 s, easing to its stop) the layer draws the protractor at the hinge, a tick at every ten degrees
   (30, 60 and 90 numbered), the gold wedge and its degrees, and the chord: the gap at the lid's edge as a gold line in
   cm, toward his own mark, "you, 34 cm". It stops where the gap equals his width: a lid 45 cm long and a boy 34 cm
   across the shoulders, 44 degrees (humpNeed). The room draws the lid where onSwing puts it each frame. A touch
   anywhere else costs nothing. The answer is 'opened' (a few seconds after the stop, so the sum can be read; onStop
   comes at the stop itself) or 'cancelled'. Who may be offered it is the room's: Magic's answer has the hump offered
   once he holds the twins' note (req 179), with no learned flag; the first open sets learned('dissendium'). No map
   bubble: the Map is its own design and comes after the hump. On 'opened' the Corridor calls its witchHump() (req 188).
   opts: { hump: {x, y} in CSS pixels, or a function returning one each frame: the round of her back, to tap,
           r: the tap's reach in CSS pixels, or a function (0.12 of the screen's short side by default),
           hinge, edge: {x, y} or functions: the lid's hinge and its closed edge on the screen, for the protractor
                  and the chord (by default a lid laid out from hump, its hinge right and below, its edge left),
           dir: 1 if the lid opens clockwise on the screen (default) or -1,
           lid: the lid's length in cm (45), width: his shoulders in cm (34), max: the protractor's reach (110),
           hold: seconds the sum stays drawn after the stop before the answer (3),
           onTap(n): each tap on the hump that does not open it (n counts them: 1 is the book's "nothing"),
           onWord(): the card tapped, the word said, onSwing(degrees, gapCm): each frame of the swing,
           onStop(out): at the stop, with the answer to come,
           exits, wait: as every room callable (EXITS) }
   Returns { done: a promise of { verdict: 'opened' | 'cancelled', degrees, gap, width, need, first }, cancel(),
             tap() (a tap on the hump), say() (a tap on the card), state() }. */
function humpNeed(lid, width) { return 2 * Math.asin(Math.min(1, width / (2 * lid))) * 180 / Math.PI; }
function openHump(opts) {
  opts = opts || {};
  var LID = opts.lid || 45, WIDTH = opts.width || 34, MAX = opts.max || 110, NEED = humpNeed(LID, WIDTH);
  var DIR = opts.dir === -1 ? -1 : 1, SWING = 2800, HOLD = (opts.hold == null ? 3 : opts.hold) * 1000;
  var stage = 'tap', taps = 0, said = 0, deg = 0, swingAt = 0, out = null, L;
  var h = null, r = 0, hi = null, ed = null, card = null;
  function val(v) { return typeof v === 'function' ? v() : v; }
  function place() {
    var S = Math.min(L.W, L.H);
    h = val(opts.hump) || { x: L.W / 2, y: L.H * 0.45 }; r = val(opts.r) || S * 0.12;
    hi = val(opts.hinge) || { x: h.x + r * 0.9, y: h.y + r * 0.5 };
    ed = val(opts.edge) || { x: h.x - r * 0.9, y: h.y - r * 0.1 };
    var fs = Math.round(Math.max(16, S * 0.045)), w = fs * 7.2, hh = fs * 2.1;   /* the card, above the hump, kept on the screen */
    var cy = h.y - r * 1.25 - hh; if (cy < 70) cy = h.y + r * 1.25;
    card = { x: Math.max(8, Math.min(L.W - w - 8, h.x - w / 2)), y: Math.max(8, Math.min(L.H - hh - 8, cy)), w: w, h: hh, fs: fs };
  }
  function gapAt(d) { return 2 * LID * Math.sin(d * Math.PI / 360); }
  function rot(p, c, d) { var a = DIR * d * Math.PI / 180, dx = p.x - c.x, dy = p.y - c.y;
    return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) }; }
  function onHump(p) { return Math.hypot(p.x - h.x, p.y - h.y) <= r * 1.1; }
  function onCard(p) { return card && p.x >= card.x - 6 && p.x <= card.x + card.w + 6 && p.y >= card.y - 6 && p.y <= card.y + card.h + 6; }
  function tap() {
    if (stage !== 'tap') return;
    if (!said) { taps++; if (opts.onTap) opts.onTap(taps); return; }
    stage = 'swing'; swingAt = root.performance.now();
  }
  function say() { if (stage !== 'tap' || !taps || said) return; said = root.performance.now(); if (opts.onWord) opts.onWord(); }
  function stop() {
    stage = 'stopped'; deg = NEED;
    var first = !learned('dissendium'); learn('dissendium'); firstCast('dissendium');
    out = { verdict: 'opened', degrees: Math.round(NEED), gap: Math.round(gapAt(NEED)), width: WIDTH, need: Math.round(NEED * 10) / 10, first: first };
    if (opts.onStop) opts.onStop(out);
    L.later(out, HOLD);
  }
  function drawCard(cx, now) {
    var c = card, k = said ? Math.min(1, (now - said) / 800) : 0, parts = ['Dis', 'sen', 'di', 'um'];
    cx.save(); cx.fillStyle = said ? 'rgba(58,42,22,0.95)' : 'rgba(30,22,17,0.92)'; cx.strokeStyle = said ? '#f3d27a' : '#8a7050'; cx.lineWidth = 2;
    cx.beginPath(); cx.rect(c.x, c.y, c.w, c.h); cx.fill(); cx.stroke();
    cx.font = 'italic 600 ' + c.fs + 'px Georgia, serif'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
    var text = parts.join('-'), x = c.x + (c.w - cx.measureText(text).width) / 2;
    parts.forEach(function (s, i) {   /* each syllable lights in turn as the word is said */
      var lit = said && k >= (i + 1) / parts.length;
      cx.fillStyle = lit ? '#f3d27a' : '#eadcbf'; cx.fillText(s, x, c.y + c.h / 2);
      x += cx.measureText(s).width;
      if (i < parts.length - 1) { cx.fillStyle = 'rgba(234,220,191,0.5)'; cx.fillText('-', x, c.y + c.h / 2); x += cx.measureText('-').width; }
    });
    cx.restore();
  }
  function drawMeasure(cx) {
    var S = Math.min(L.W, L.H), len = Math.hypot(ed.x - hi.x, ed.y - hi.y), R = len * 0.62, i;
    var a0 = Math.atan2(ed.y - hi.y, ed.x - hi.x), fs = Math.round(Math.max(11, S * 0.03)), sweep = DIR * Math.PI / 180;
    cx.save(); cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.strokeStyle = 'rgba(159,182,201,0.55)'; cx.lineWidth = 1.5;
    cx.beginPath(); cx.arc(hi.x, hi.y, R, a0, a0 + MAX * sweep, DIR < 0); cx.stroke();
    cx.font = fs + 'px Georgia, serif';
    for (i = 0; i <= MAX; i += 10) {
      var a = a0 + i * sweep, long = i % 30 === 0, r0 = R * (long ? 0.86 : 0.93);
      cx.strokeStyle = long ? 'rgba(217,199,154,0.9)' : 'rgba(159,182,201,0.6)'; cx.lineWidth = long ? 2.2 : 1.2;
      cx.beginPath(); cx.moveTo(hi.x + Math.cos(a) * r0, hi.y + Math.sin(a) * r0); cx.lineTo(hi.x + Math.cos(a) * R, hi.y + Math.sin(a) * R); cx.stroke();
      if (long && i > 0) { cx.fillStyle = 'rgba(217,199,154,0.95)'; cx.fillText(String(i), hi.x + Math.cos(a) * R * 1.16, hi.y + Math.sin(a) * R * 1.16); }
    }
    if (deg > 1) {   /* the gold wedge it has opened */
      cx.fillStyle = 'rgba(243,210,122,0.28)'; cx.beginPath(); cx.moveTo(hi.x, hi.y);
      cx.arc(hi.x, hi.y, R * 0.84, a0, a0 + deg * sweep, DIR < 0); cx.closePath(); cx.fill();
    }
    cx.fillStyle = '#9fb6c9'; cx.beginPath(); cx.arc(hi.x, hi.y, Math.max(3, S * 0.008), 0, 7); cx.fill();
    /* the chord: from where the edge was to where it is, his own width marked along it */
    var e1 = rot(ed, hi, deg), gap = Math.hypot(e1.x - ed.x, e1.y - ed.y), need = 2 * len * Math.sin(NEED * Math.PI / 360);
    if (gap > 2) {
      var ux = (e1.x - ed.x) / gap, uy = (e1.y - ed.y) / gap, fits = gap >= need - 0.5, side = DIR;
      cx.lineCap = 'round'; cx.strokeStyle = fits ? '#f3d27a' : 'rgba(243,210,122,0.6)'; cx.lineWidth = 4;
      cx.beginPath(); cx.moveTo(ed.x, ed.y); cx.lineTo(e1.x, e1.y); cx.stroke();
      var m = { x: ed.x + ux * need, y: ed.y + uy * need };
      cx.strokeStyle = '#9fb6c9'; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(m.x - uy * 12, m.y + ux * 12); cx.lineTo(m.x + uy * 12, m.y - ux * 12); cx.stroke();
      cx.fillStyle = '#9fb6c9'; cx.shadowColor = '#000'; cx.shadowBlur = 4;
      cx.fillText('you, ' + WIDTH + ' cm', m.x + side * uy * fs * 1.6 + ux * fs * 1.4, m.y - side * ux * fs * 1.6 + uy * fs * 1.4);   /* outside the lid, past his mark */
      var mid = { x: (ed.x + e1.x) / 2, y: (ed.y + e1.y) / 2 };
      cx.fillStyle = fits ? '#f3d27a' : 'rgba(243,210,122,0.8)'; cx.font = '600 ' + fs + 'px Georgia, serif';
      cx.fillText('gap ' + Math.round(gapAt(deg)) + ' cm', mid.x + side * uy * fs * 2.6, mid.y - side * ux * fs * 2.6);
    }
    var big = Math.round(Math.max(16, S * 0.05));
    cx.font = '600 ' + big + 'px Georgia, serif'; cx.fillStyle = '#f3d27a'; cx.shadowColor = '#000'; cx.shadowBlur = 6;
    cx.fillText(Math.round(deg) + '°', hi.x + DIR * R * 0.3, hi.y + R * 0.55);
    cx.restore();
  }
  L = layer({
    waiting: function () { return stage === 'tap'; },   /* `wait` never ends the swing midway (Interaction, req 218) */
    frame: function (now) {
      place();
      if (stage === 'swing') {
        var u = Math.min(1, (now - swingAt) / SWING); deg = NEED * (1 - Math.pow(1 - u, 3));
        if (opts.onSwing) opts.onSwing(deg, gapAt(deg));
        if (u >= 1) stop();
      }
      if (stage === 'tap' && taps) drawCard(L.cx, now);
      if (stage === 'tap' && said) {   /* the word said: the hump glows for the second tap */
        var gl = L.cx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
        gl.addColorStop(0, 'rgba(255,240,200,' + (0.3 + 0.15 * Math.sin(now / 200)) + ')'); gl.addColorStop(1, 'rgba(255,220,150,0)');
        L.cx.fillStyle = gl; L.cx.beginPath(); L.cx.arc(h.x, h.y, r, 0, 7); L.cx.fill();
      }
      if (stage === 'swing' || stage === 'stopped') drawMeasure(L.cx);
    },
    down: function (ev) {
      var p = L.pt(ev);
      if (stage !== 'tap') return;
      if (taps && onCard(p)) { say(); return; }
      if (onHump(p)) tap();
    }
  }, opts);
  place();
  return { done: L.done, cancel: L.leave = function () { L.finish({ verdict: 'cancelled', degrees: Math.round(deg), gap: Math.round(gapAt(deg)), width: WIDTH, need: Math.round(NEED * 10) / 10, first: false }); },
    tap: tap, say: say,
    state: function () { return { stage: stage, taps: taps, said: !!said, degrees: Math.round(deg * 10) / 10, need: Math.round(NEED * 10) / 10, card: card, hump: h }; } };
}

root.LumosSpells = { FLICK_EASES: FLICK_EASES, judgeFlick: judgeFlick, judgeSwishDown: judgeSwishDown, TURN_EASES: TURN_EASES, judgeTurn: judgeTurn,
  TAP_EASES: TAP_EASES, judgeTaps: judgeTaps, SWISH_EASES: SWISH_EASES, judgeSwishFlick: judgeSwishFlick, learned: learned, learn: learn, castOver: castOver, openLock: openLock, revealInk: revealInk,
  SWISH_WHY: SWISH_WHY, FLICK_WHY: FLICK_WHY, lockWhy: lockWhy, inkWhy: inkWhy, levitate: levitate, ppi: ppi, SPAN_WHY: SPAN_WHY, measureSpan: measureSpan,
  HINGE_EASES: HINGE_EASES, judgeHinge: judgeHinge, humpNeed: humpNeed, openHump: openHump,
  SLIDE_EASES: SLIDE_EASES, judgeSlide: judgeSlide, AIM_EASES: AIM_EASES, judgeAim: judgeAim, DISARM_EASES: DISARM_EASES, judgeDisarm: judgeDisarm, COIL_EASES: COIL_EASES, judgeCoil: judgeCoil, smallestCircle: smallestCircle, RING_EASES: RING_EASES, judgeRing: judgeRing, FINITE_EASES: FINITE_EASES, judgeFinite: judgeFinite, BIND_EASES: BIND_EASES, judgeBind: judgeBind, windAround: windAround, crossings: crossings };
})(typeof window !== 'undefined' ? window : globalThis);
