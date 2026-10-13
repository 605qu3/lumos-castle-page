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
   Returns { done: a promise of { verdict: 'cast' | 'missed' | 'cancelled', judge, traced }, cancel() }. */
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
    return { verdict: ok ? 'cast' : 'missed', judge: j, traced: traced, first: ok && firstCast('lumos') };
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
   Returns { done: a promise of { verdict, judge, traced }, cancel(), tap(), judge(points) }. */
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
    return { verdict: verdict, judge: j, traced: traced, first: verdict === 'opened' && firstCast('alohomora') };
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
   Returns { done: a promise of { verdict, judge, traced }, cancel(), taps(list of {x, y, t}) }. */
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
    return { verdict: ok ? 'revealed' : 'missed', judge: j, traced: traced, first: ok && firstCast('aparecium') };
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
   seconds ('one') or two less than half an inch apart ('close'); each answers kindly with `why`.
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
var SPAN_WHY = {
  one: ['The tape waits for the other end', 'Two fingers, one at each end; or tap one end, then the other.'],
  close: ['The tape curls up', 'Spread them further apart: one finger at each end.']
};
function measureSpan(opts) {
  opts = opts || {};
  var G = root.LumosGuide, mode = opts.guide || 'auto', within = opts.within == null ? 0.5 : opts.within, L;
  var touches = {}, taps = [], tape = null, over = false, oneAt = 0, guide = null, built = null;
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
      var p = L.pt(ev); touches[ev.pointerId] = p; if (guide) guide.cover(p);
      try { L.cv.setPointerCapture(ev.pointerId); } catch (e) {}
      var n = Object.keys(touches).length;
      if (n === 1) oneAt = root.performance.now(); else oneAt = 0;
    },
    move: function (ev) { if (ev.pointerId in touches && !over) { ev.preventDefault(); touches[ev.pointerId] = L.pt(ev); } },
    up: function (ev) {
      if (!(ev.pointerId in touches) || over) return;
      var ids = Object.keys(touches), p = touches[ev.pointerId], out = null;
      if (ids.length >= 2) {
        var other = touches[ids[0] == ev.pointerId ? ids[1] : ids[0]];
        out = take(other, L.pt(ev));
      } else {
        delete touches[ev.pointerId]; oneAt = 0;
        taps.push({ x: p.x, y: p.y, at: root.performance.now() });
        if (taps.length >= 2) { out = take(taps[0], taps[1]); taps = []; }
        if (!out) return;
      }
      touches = {};
      if (out) finishWith(out);
    },
    cancel: function (ev) { delete touches[ev.pointerId]; }
  }, opts);
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
  SWISH_WHY: SWISH_WHY, levitate: levitate, ppi: ppi, SPAN_WHY: SPAN_WHY, measureSpan: measureSpan,
  HINGE_EASES: HINGE_EASES, judgeHinge: judgeHinge, humpNeed: humpNeed, openHump: openHump };
})(typeof window !== 'undefined' ? window : globalThis);
