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
/* judge:end */

/* What a boy has learned, kept on the device: learn('lumos') once he has cast it, learned('lumos') for a room to ask
   (req 125). The key is 'lumos.spells.learned.' and the spell's name. */
function learned(name) { try { return localStorage.getItem('lumos.spells.learned.' + name) === '1'; } catch (e) { return false; } }
function learn(name) { try { localStorage.setItem('lumos.spells.learned.' + name, '1'); } catch (e) {} }

/* Lumos over a spot, for a room (req 125, the Common room's candle stub, Godric's Q37 t2; tried on
   page/charms/cast-over-test.html). One stroke: the traced guide (guide.js, if the room loads it) is a flick up
   ending just under the spot; the answer is 'cast' or 'missed', and the room draws what follows (the flame, or not).
   A tap is ignored, so a stray touch costs nothing; cancel() answers 'cancelled'. Nothing else on the page is
   touched while it waits: a clear layer over the page takes the one stroke and is gone.
   opts: { at: {x, y} in CSS pixels, or a function returning one each frame (a 3D room projects its candle),
           ease: 'kind' (default), 'fair' or 'strict' (FLICK_EASES),
           guide: 'auto' (default: the stage of his Lumos guide in Charms, the same store, full for his first three
                  guided casts, then faint, then gone), 'always' or 'off',
           reach: the guide's length as a share of the screen's short side (0.32) }
   Returns { done: a promise of { verdict: 'cast' | 'missed' | 'cancelled', judge, traced }, cancel() }. */
function castOver(opts) {
  opts = opts || {};
  var doc = root.document, G = root.LumosGuide, ease = opts.ease || 'kind', mode = opts.guide || 'auto';
  var cv = doc.createElement('canvas'), cx = cv.getContext('2d'), W = 0, H = 0, DPR = 1;
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;touch-action:none;background:transparent';
  var guide = null, spot = null, built = null, stroke = null, active = null, trail = null, raf = 0, finished = false, resolve;
  var done = new Promise(function (r) { resolve = r; });
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
  cv.addEventListener('pointerdown', function (ev) {
    ev.preventDefault(); if (active !== null) return;
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
    trail = { pts: pts, at: root.performance.now() };
    root.setTimeout(function () { finish(out); }, 350);
  });
  cv.addEventListener('pointercancel', function (ev) { if (ev.pointerId === active) { active = null; stroke = null; if (guide) guide.clear(); } });
  function judge(pts) {   /* also the way in for checks: cast.judge(points) */
    var j = judgeFlick(pts, W, H, ease), lv = guide ? guide.level() : 0, tr = guide ? guide.score(pts) : null;
    if (j.reason === 'tap') { if (guide) guide.clear(); return null; }
    var traced = !!(tr && tr.traced), ok = j.verdict === 'lumos' || traced;
    if (guide) { if (ok) guide.hit(lv > 0 && mode !== 'always'); else guide.miss(); }
    return { verdict: ok ? 'cast' : 'missed', judge: j, traced: traced };
  }
  size(); root.addEventListener('resize', size); doc.body.appendChild(cv); raf = root.requestAnimationFrame(frame);
  return { done: done, cancel: function () { finish({ verdict: 'cancelled', judge: null, traced: false }); },
    judge: function (pts) { var out = judge(pts); if (out) finish(out); return out; } };
}

/* The clear layer a room's spell waits on (req 146): over the whole page, taking touches until it is done, then gone. */
function layer(hooks) {
  var doc = root.document, cv = doc.createElement('canvas'), cx = cv.getContext('2d'), raf = 0, finished = false, resolve;
  var L = { cv: cv, cx: cx, W: 0, H: 0, done: new Promise(function (r) { resolve = r; }) };
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;touch-action:none;background:transparent';
  function size() {
    var DPR = Math.min(root.devicePixelRatio || 1, 2.5); L.W = root.innerWidth; L.H = root.innerHeight;
    cv.width = Math.round(L.W * DPR); cv.height = Math.round(L.H * DPR); cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (hooks.size) hooks.size();
  }
  function frame(now) { if (finished) return; cx.clearRect(0, 0, L.W, L.H); hooks.frame(now); raf = root.requestAnimationFrame(frame); }
  L.pt = function (ev) { return { x: ev.clientX, y: ev.clientY, t: Math.round(root.performance.now()) }; };
  L.finish = function (out) {
    if (finished) return; finished = true; root.cancelAnimationFrame(raf);
    root.removeEventListener('resize', size); if (cv.parentNode) cv.parentNode.removeChild(cv); resolve(out);
  };
  L.later = function (out, ms) { root.setTimeout(function () { L.finish(out); }, ms); };
  cv.addEventListener('pointerdown', function (ev) { ev.preventDefault(); hooks.down(ev); });
  cv.addEventListener('pointermove', function (ev) { if (hooks.move) hooks.move(ev); });
  cv.addEventListener('pointerup', function (ev) { if (hooks.up) hooks.up(ev); });
  cv.addEventListener('pointercancel', function (ev) { if (hooks.cancel) hooks.cancel(ev); });
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
    return { verdict: verdict, judge: j, traced: traced };
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
  });
  place();
  return { done: L.done, cancel: function () { L.finish({ verdict: 'cancelled', judge: null, traced: false }); },
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
    return { verdict: ok ? 'revealed' : 'missed', judge: j, traced: traced };
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
  });
  place();
  return { done: L.done, cancel: function () { L.finish({ verdict: 'cancelled', judge: null, traced: false }); },
    taps: function (list) { var out = null; for (var i = 0; i < list.length && !out; i++) out = tapAt(list[i]); if (out) L.finish(out); return out; } };
}

root.LumosSpells = { FLICK_EASES: FLICK_EASES, judgeFlick: judgeFlick, judgeSwishDown: judgeSwishDown, TURN_EASES: TURN_EASES, judgeTurn: judgeTurn,
  TAP_EASES: TAP_EASES, judgeTaps: judgeTaps, SWISH_EASES: SWISH_EASES, judgeSwishFlick: judgeSwishFlick, learned: learned, learn: learn, castOver: castOver, openLock: openLock, revealInk: revealInk };
})(typeof window !== 'undefined' ? window : globalThis);
