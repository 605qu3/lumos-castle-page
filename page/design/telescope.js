/* telescope.js: the view through a pupil's brass draw telescope on the Astronomy top, req 623 (Curator > Design;
   docs/curator/astronomy-tower-top.md, items 1 and 7, Where it stands: Godric, 16 October 2026, 12.48 pm, "boys should
   be able to use the telescopes to examine the real night sky on that date"). The sky is Events' (page/castle-sky.js,
   req 622): the real stars, planets and moon for the date, hour and the boy's own home. This file only draws it: the
   round field of the glass, the stars as points by their real brightness and colour, the moon in its real phase and
   the planets at their real size in the glass, nothing glowing beyond each body's own light. The view is upright, as a
   draw telescope's erecting glasses give it.

   LumosTelescope.draw(ctx, o)  o: { sky (CastleSky.at's), catalogue (page/sky/stars.json), aim { alt, az } in degrees,
       field (the true field in degrees: 5 with the tube pushed in, about 1.2 drawn out full), x, y, r (the field's
       centre and radius in px) }. Returns what lies in the field, brightest first: [{ name, kind, x, y, mag }].
   LumosTelescope.aimAt(sky, name, catalogue)  { alt, az } of 'moon', a planet's name, or a named star, or null.
   LumosTelescope.FIELD  { wide: 5, close: 1.2 }. */
(function () {
  'use strict';
  var RAD = Math.PI / 180, FIELD = { wide: 5, close: 1.2 };
  var SATURN_POLE = [40.589, 83.537];   /* the rings' pole, ra and dec in degrees (the IAU's) */

  function vec(alt, az) { return [Math.cos(alt * RAD) * Math.sin(az * RAD), Math.cos(alt * RAD) * Math.cos(az * RAD), Math.sin(alt * RAD)]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  /* the gnomonic projection about the aim: a body's alt and az to px in the field, or null behind the glass */
  function projector(aim, field, cx, cy, r) {
    var P = vec(aim.alt, aim.az), s = Math.sin(aim.alt * RAD);
    var R = [Math.cos(aim.az * RAD), -Math.sin(aim.az * RAD), 0];
    var U = [-s * Math.sin(aim.az * RAD), -s * Math.cos(aim.az * RAD), Math.cos(aim.alt * RAD)];
    var k = r / Math.tan(field / 2 * RAD);
    return function (alt, az) {
      var v = vec(alt, az), d = dot(v, P);
      if (d <= 0) return null;
      return [cx + dot(v, R) / d * k, cy - dot(v, U) / d * k];
    };
  }

  /* north and east on the glass at a body, as unit px vectors, from the sky's own turning (a small step in dec and ra) */
  function axes(sky, ra, dec, proj) {
    var a = sky.star(ra, dec), n = sky.star(ra, dec + 0.05), e = sky.star(ra + 0.05 / Math.max(0.05, Math.cos(dec * RAD)), dec);
    var p = proj(a.alt, a.az), pn = proj(n.alt, n.az), pe = proj(e.alt, e.az);
    if (!p || !pn || !pe) return null;
    var N = [pn[0] - p[0], pn[1] - p[1]], E = [pe[0] - p[0], pe[1] - p[1]], ln = Math.hypot(N[0], N[1]), le = Math.hypot(E[0], E[1]);
    return { N: [N[0] / ln, N[1] / ln], E: [E[0] / le, E[1] / le] };
  }
  /* a position angle (degrees from north through east) as a px direction */
  function toward(ax, pa) { var c = Math.cos(pa * RAD), s = Math.sin(pa * RAD); return [ax.N[0] * c + ax.E[0] * s, ax.N[1] * c + ax.E[1] * s]; }

  /* a star's colour from its B-V index, as the eye takes it: blue-white to orange, never saturated */
  function starColour(bv) {
    var t = Math.max(-0.3, Math.min(1.8, bv == null ? 0.6 : bv));
    var f = (t + 0.3) / 2.1;
    return [Math.round(206 + 49 * f), Math.round(222 + 10 * f - 40 * f * f), Math.round(255 - 120 * f)];
  }

  function star(ctx, x, y, mag, bv, px) {
    var c = starColour(bv), size = Math.max(0.8, (3.4 - 0.45 * mag)) * px, a = Math.max(0.35, Math.min(1, 1.3 - mag * 0.12));
    var g = ctx.createRadialGradient(x, y, 0, x, y, size * 1.8);
    g.addColorStop(0, 'rgba(' + c.join(',') + ',' + a + ')');
    g.addColorStop(0.45, 'rgba(' + c.join(',') + ',' + (a * 0.55) + ')');
    g.addColorStop(1, 'rgba(' + c.join(',') + ',0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, size * 1.8, 0, Math.PI * 2); ctx.fill();
  }

  /* the moon: its disc by its real size (about half a degree), the lit part toward the sun (the sky's angle), the
     terminator an ellipse, the seas where they lie with the moon's north toward the sky's north; the dark part faint
     with earthshine */
  var SEAS = [[-0.28, 0.42, 0.24], [0.2, 0.32, 0.13], [0.36, 0.08, 0.17], [0.66, 0.24, 0.1], [-0.55, 0.05, 0.3], [-0.12, -0.3, 0.16], [0.48, -0.2, 0.12], [-0.3, -0.05, 0.14]];
  function moon(ctx, M, p, ax, rad, px) {
    var dir = toward(ax, M.angle), ang = Math.atan2(dir[1], dir[0]), k = M.lit, nrt = Math.atan2(ax.N[1], ax.N[0]) + Math.PI / 2;
    ctx.save(); ctx.translate(p[0], p[1]);
    ctx.fillStyle = 'rgba(70,74,84,0.55)'; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.rotate(ang);   /* +x toward the sun */
    var lit = new Path2D(), w = Math.abs(1 - 2 * k) * rad;
    lit.arc(0, 0, rad, -Math.PI / 2, Math.PI / 2, false);
    lit.ellipse(0, 0, Math.max(0.01, w), rad, 0, Math.PI / 2, -Math.PI / 2, k < 0.5);
    ctx.clip(lit);
    ctx.rotate(-ang);
    var g = ctx.createRadialGradient(-rad * 0.2, -rad * 0.2, rad * 0.1, 0, 0, rad);
    g.addColorStop(0, '#f4f0e4'); g.addColorStop(1, '#d9d3c4');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(nrt);   /* the seas in the moon's own frame, north up */
    SEAS.forEach(function (s) {
      var sg = ctx.createRadialGradient(s[0] * rad, -s[1] * rad, 0, s[0] * rad, -s[1] * rad, s[2] * rad * 1.3);
      sg.addColorStop(0, 'rgba(128,124,116,0.5)'); sg.addColorStop(0.6, 'rgba(128,124,116,0.32)'); sg.addColorStop(1, 'rgba(128,124,116,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(s[0] * rad, -s[1] * rad, s[2] * rad * 1.3, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    ctx.restore();
  }

  /* a planet: a small disc by its real size in the glass, never under a few px so its shape shows; Saturn's rings
     tilted as they really lie (their opening from the pole), Venus and Mercury in their phase toward the sun */
  var SIZE = { Mercury: 7, Venus: 25, Mars: 9, Jupiter: 44, Saturn: 18 };   /* rough angular diameters in arcseconds */
  var TINT = { Mercury: '#d8cfc0', Venus: '#f6f0dc', Mars: '#e3a27a', Jupiter: '#efe2c8', Saturn: '#e8d7a8' };
  function planet(ctx, P, p, ax, pxPerDeg, px, sky) {
    var rad = Math.max((P.name === 'Saturn' ? 3.5 : 2.2) * px, SIZE[P.name] / 3600 / 2 * pxPerDeg);   /* Saturn a touch over its size, so its rings read */
    ctx.save(); ctx.translate(p[0], p[1]);
    if (P.name === 'Saturn' && ax) {
      var dp = SATURN_POLE[1] * RAD, d = P.dec * RAD, da = (SATURN_POLE[0] - P.ra) * RAD;
      var B = Math.asin(Math.sin(dp) * Math.sin(d) + Math.cos(dp) * Math.cos(d) * Math.cos(da));
      var pa = Math.atan2(Math.cos(dp) * Math.sin(da), Math.sin(dp) * Math.cos(d) - Math.cos(dp) * Math.sin(d) * Math.cos(da)) / RAD;
      var up = toward(ax, pa), rot = Math.atan2(up[1], up[0]) + Math.PI / 2;
      ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(226,210,166,0.85)'; ctx.lineWidth = Math.max(1, rad * 0.35);
      ctx.beginPath(); ctx.ellipse(0, 0, rad * 2.25, Math.max(0.4, rad * 2.25 * Math.abs(Math.sin(B))), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(-rot);
    }
    ctx.fillStyle = TINT[P.name]; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  var cache = { sky: null, cat: null, list: null };
  function starsUp(sky, cat) {
    if (cache.sky === sky && cache.cat === cat) return cache.list;
    var list = [];
    for (var i = 0; i < cat.stars.length; i++) {
      var s = cat.stars[i], h = sky.star(s[0], s[1]);
      if (h.alt > -1) list.push({ alt: h.alt, az: h.az, mag: s[2], bv: s[3], name: (cat.names && cat.names[i]) || '' });
    }
    cache = { sky: sky, cat: cat, list: list };
    return list;
  }

  function draw(ctx, o) {
    var sky = o.sky, field = o.field || FIELD.wide, cx = o.x, cy = o.y, r = o.r, px = Math.max(1, r / 220);
    var proj = projector(o.aim, field, cx, cy, r), pxPerDeg = r / Math.tan(field / 2 * RAD) * RAD, seen = [];
    var moonUp = sky.moon.alt > 0 ? sky.moon.lit : 0;
    /* the tube round the field, dark, its brass lip catching a little of the night */
    ctx.save();
    ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.arc(cx, cy, r * 1.16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,118,70,0.55)'; ctx.lineWidth = r * 0.035; ctx.beginPath(); ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2); ctx.stroke();
    /* the field: the night sky's own dark, a shade lighter toward the horizon and under a bright moon */
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    var lift = Math.max(0, Math.min(1, (25 - o.aim.alt) / 25)) * 0.5 + moonUp * 0.5;
    var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bg.addColorStop(0, 'rgb(' + Math.round(9 + 10 * lift) + ',' + Math.round(12 + 14 * lift) + ',' + Math.round(24 + 22 * lift) + ')');
    bg.addColorStop(1, 'rgb(' + Math.round(5 + 6 * lift) + ',' + Math.round(7 + 8 * lift) + ',' + Math.round(14 + 12 * lift) + ')');
    ctx.fillStyle = bg; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    var lim = 6 - moonUp * 0.8;   /* a bright moon drowns the faintest */
    starsUp(sky, o.catalogue).forEach(function (s) {
      if (s.mag > lim) return;
      var p = proj(s.alt, s.az);
      if (!p || Math.hypot(p[0] - cx, p[1] - cy) > r + 4) return;
      star(ctx, p[0], p[1], s.mag, s.bv, px);
      seen.push({ name: s.name, kind: 'star', x: p[0], y: p[1], mag: s.mag });
    });
    sky.planets.forEach(function (P) {
      var p = proj(P.alt, P.az);
      if (!p || Math.hypot(p[0] - cx, p[1] - cy) > r + 20) return;
      planet(ctx, P, p, axes(sky, P.ra, P.dec, proj), pxPerDeg, px, sky);
      seen.push({ name: P.name, kind: 'planet', x: p[0], y: p[1], mag: P.mag });
    });
    var mp = proj(sky.moon.alt, sky.moon.az), mr = 0.259 * pxPerDeg;
    if (mp && Math.hypot(mp[0] - cx, mp[1] - cy) < r + mr) {
      var ax = axes(sky, sky.moon.ra, sky.moon.dec, proj);
      if (ax) { moon(ctx, sky.moon, mp, ax, mr, px); seen.push({ name: 'the Moon', kind: 'moon', x: mp[0], y: mp[1], mag: -12 }); }
    }
    /* below the horizon the glass sees the ground: the tower's own dark */
    if (o.aim.alt - field / 2 < 0) {
      var hz = [];
      for (var a = -field; a <= field; a += field / 20) { var q = proj(0, o.aim.az + a / Math.max(0.2, Math.cos(o.aim.alt * RAD))); if (q) hz.push(q); }
      if (hz.length > 1) {
        ctx.fillStyle = '#07080a'; ctx.beginPath(); ctx.moveTo(hz[0][0], hz[0][1]);
        hz.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
        ctx.lineTo(cx + r, cy + r * 2); ctx.lineTo(cx - r, cy + r * 2); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    /* the field stop's soft edge */
    var v = ctx.createRadialGradient(cx, cy, r * 0.86, cx, cy, r);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    return seen.sort(function (p, q) { return p.mag - q.mag; });
  }

  function aimAt(sky, name, cat) {
    var n = String(name).toLowerCase();
    if (n === 'moon' || n === 'the moon') return { alt: sky.moon.alt, az: sky.moon.az };
    var P = sky.planets.filter(function (p) { return p.name.toLowerCase() === n; })[0];
    if (P) return { alt: P.alt, az: P.az };
    if (cat && cat.names) for (var k in cat.names) if (cat.names[k].toLowerCase() === n) { var s = cat.stars[+k]; return sky.star(s[0], s[1]); }
    return null;
  }

  window.LumosTelescope = { draw: draw, aimAt: aimAt, FIELD: FIELD };
})();
