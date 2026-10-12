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

root.LumosSpells = { FLICK_EASES: FLICK_EASES, judgeFlick: judgeFlick, judgeSwishDown: judgeSwishDown,
  learned: learned, learn: learn, castOver: castOver };
})(typeof window !== 'undefined' ? window : globalThis);
