/* The traced guide, shared by every spell (Charms lane; the owner is Godric).
   Godric, 11 October 2026, 9.13 pm, on the Leviosa test: "the motions may need to be drawn on screen to be traced for
   the first few times and at a larger scale"; 9.30 pm: "The guide that charms came up with should go to all spells
   cast." So it is built once, here, and each spell gives only its path.

   A large path in gold dots with a glowing start and an arrow at the end; a spark runs along it at the spell's own
   timing, then rests, so it shows the timing as well as the shape; the dots light where his finger passes. Full for
   the first three good casts, faint for the next two, then gone; back faint after two misses in a row; reset()
   (the Guide button) brings it back full. A cast that follows it closely counts, even where the judging alone would
   not, and while it shows his speed is not held against him (the spell's page decides that from score().traced).
   ?guide=always or ?guide=off for trying, ?guidehits=N to start at a stage, ?hand=left mirrors every path.

   spec: { key: the device's store for this spell's good casts,
           parts: [{ pts: [[u, v], ...] in a unit box (v down), secs: the spark's time along it, label, at: the share
                   of the part where the label sits, dx, dy: its offset in letter heights (dx mirrored for the left) }],
           box(W, H): optional, { G: the box's side in pixels, ox, oy: its top left }; the Leviosa box by default,
           rest: the spark's pause in seconds (1.05),
           mirror: optional, true or a function, for a page that knows his wand arm (?hand=left otherwise) } */
(function (root) {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var mirror = qs.get('hand') === 'left';

  function defaultBox(W, H) {
    var G = Math.min(W * 0.78, H * 0.62);
    return { G: G, ox: W / 2 - G * 0.47, oy: Math.max(H * 0.42 - G * 0.32, 96) };
  }

  function create(spec) {
    function mir() { return spec.mirror == null ? mirror : (typeof spec.mirror === 'function' ? !!spec.mirror() : !!spec.mirror); }
    var hits = 0, missRun = 0, pts = [], covered = [], ranges = [], S = 1, W = 0;
    try { hits = Number(localStorage.getItem(spec.key)) || 0; } catch (e) {}
    if (qs.has('guidehits')) hits = Number(qs.get('guidehits')) || 0;

    function level() {
      if (qs.get('guide') === 'always') return 1;
      if (qs.get('guide') === 'off') return 0;
      if (hits < 3) return 1;
      if (hits < 5 || missRun >= 2) return 0.45;
      return 0;
    }
    function build(w, h) {
      W = w; S = Math.min(w, h);
      var b = (spec.box || defaultBox)(w, h);
      var m = mir();
      function at(q) { var x = b.ox + q[0] * b.G; return { x: m ? w - x : x, y: b.oy + q[1] * b.G }; }
      pts = []; ranges = [];
      spec.parts.forEach(function (part, n) {
        var from = Math.max(0, pts.length - 1);
        part.pts.forEach(function (q, i) { if (n === 0 || i > 0) pts.push(at(q)); });
        ranges.push({ from: from, to: pts.length - 1, secs: part.secs, part: part });
      });
      covered = pts.map(function () { return false; });
    }
    function cover(p) {
      var tol = S * 0.07;
      for (var i = 0; i < pts.length; i++) if (Math.hypot(pts[i].x - p.x, pts[i].y - p.y) < tol) covered[i] = true;
    }
    function clear() { covered = covered.map(function () { return false; }); }
    /* how closely a stroke followed the path: the share of it covered, the stroke's mean distance from it, and how
       near it began at the dot and ended at the arrow, all as shares of the screen's short side */
    function score(stroke) {
      if (!level() || !pts.length || stroke.length < 3) return null;
      var cov = covered.filter(Boolean).length / covered.length, last = pts.length - 1, sum = 0;
      stroke.forEach(function (p) {
        var best = 1e9; pts.forEach(function (g) { best = Math.min(best, Math.hypot(g.x - p.x, g.y - p.y)); }); sum += best;
      });
      var r = { cov: cov, dist: sum / stroke.length / S,
        start: Math.hypot(stroke[0].x - pts[0].x, stroke[0].y - pts[0].y) / S,
        end: Math.hypot(stroke[stroke.length - 1].x - pts[last].x, stroke[stroke.length - 1].y - pts[last].y) / S,
        level: level() };
      /* his traces on an iPhone (Godric, 9.42 pm) kept 0.057 to 0.063 of the screen from the path: 0.08 lets them count */
      r.traced = r.cov >= 0.7 && r.dist < 0.08 && r.start < 0.1 && r.end < 0.12;
      return r;
    }
    function hit(guided) {
      if (guided) { hits++; try { localStorage.setItem(spec.key, hits); } catch (e) {} }
      missRun = 0; clear();
    }
    function miss() { missRun++; clear(); }
    function reset() { hits = 0; missRun = 0; clear(); try { localStorage.setItem(spec.key, 0); } catch (e) {} }

    function draw(cx, now, stroking) {
      var lv = level();
      if (!lv || !pts.length) return;
      cx.save(); cx.lineCap = 'round';
      var i, g;
      for (i = 0; i < pts.length; i += 2) {
        g = pts[i];
        cx.fillStyle = covered[i] ? 'rgba(255,233,168,' + (0.95 * lv) + ')' : 'rgba(232,190,90,' + (0.55 * lv) + ')';
        cx.beginPath(); cx.arc(g.x, g.y, covered[i] ? 4.5 : 3.2, 0, 7); cx.fill();
      }
      var e = pts[pts.length - 1], p = pts[Math.max(0, pts.length - 4)], ang = Math.atan2(e.y - p.y, e.x - p.x);
      cx.fillStyle = 'rgba(232,190,90,' + (0.8 * lv) + ')';
      cx.beginPath(); cx.moveTo(e.x + Math.cos(ang) * 14, e.y + Math.sin(ang) * 14);
      cx.lineTo(e.x + Math.cos(ang + 2.5) * 12, e.y + Math.sin(ang + 2.5) * 12);
      cx.lineTo(e.x + Math.cos(ang - 2.5) * 12, e.y + Math.sin(ang - 2.5) * 12); cx.closePath(); cx.fill();
      var s0 = pts[0], pulse = 1 + 0.25 * Math.sin(now / 250);
      var sg = cx.createRadialGradient(s0.x, s0.y, 0, s0.x, s0.y, 18 * pulse);
      sg.addColorStop(0, 'rgba(255,245,210,' + lv + ')'); sg.addColorStop(1, 'rgba(255,220,140,0)');
      cx.fillStyle = sg; cx.beginPath(); cx.arc(s0.x, s0.y, 18 * pulse, 0, 7); cx.fill();
      var fs = Math.round(Math.max(16, S * 0.04));
      cx.font = 'italic 600 ' + fs + 'px Georgia, serif'; cx.textAlign = 'center';
      cx.shadowColor = 'rgba(0,0,0,0.9)'; cx.shadowBlur = 6;
      cx.fillStyle = 'rgba(233,220,192,' + lv + ')';
      ranges.forEach(function (r) {
        var part = r.part; if (!part.label) return;
        var q = pts[Math.round(r.from + (r.to - r.from) * (part.at == null ? 0.5 : part.at))];
        cx.fillText(part.label, q.x + (mir() ? -1 : 1) * (part.dx || 0) * fs, q.y + (part.dy || 0) * fs);
      });
      if (lv === 1 && !stroking) {
        var total = 0; ranges.forEach(function (r) { total += r.secs; });
        var cyc = (now % ((total + (spec.rest == null ? 1.05 : spec.rest)) * 1000)) / 1000, k = -1, acc = 0;
        for (i = 0; i < ranges.length; i++) {
          if (cyc < acc + ranges[i].secs) { k = ranges[i].from + (ranges[i].to - ranges[i].from) * ((cyc - acc) / ranges[i].secs); break; }
          acc += ranges[i].secs;
        }
        if (k >= 0) {
          var a = pts[Math.floor(k)], b = pts[Math.min(pts.length - 1, Math.floor(k) + 1)], f = k - Math.floor(k);
          var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
          var spk = cx.createRadialGradient(x, y, 0, x, y, 14);
          spk.addColorStop(0, 'rgba(255,255,255,1)'); spk.addColorStop(0.4, 'rgba(255,230,160,0.8)'); spk.addColorStop(1, 'rgba(255,200,100,0)');
          cx.shadowBlur = 0; cx.fillStyle = spk; cx.beginPath(); cx.arc(x, y, 14, 0, 7); cx.fill();
        }
      }
      cx.restore();
    }

    return { build: build, level: level, cover: cover, clear: clear, score: score, hit: hit, miss: miss, reset: reset,
      draw: draw, state: function () {
        return { level: level(), hits: hits, missRun: missRun, pts: pts.map(function (g) { return [Math.round(g.x), Math.round(g.y)]; }) };
      } };
  }

  /* a few paths to build from: a straight line, and a quadratic curve, each as points in the unit box */
  function line(a, b, n) {
    var out = []; for (var i = 0; i <= n; i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return out;
  }
  function quad(a, c, b, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var u = i / n;
      out.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]);
    }
    return out;
  }

  root.LumosGuide = { create: create, line: line, quad: quad, mirrored: mirror };
})(window);
