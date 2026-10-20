/* chart.js: the night's chart at the boys' places on the Astronomy top, req 623's second half (Curator > Design;
   docs/curator/astronomy-tower-top.md, item 6: "a chart of tonight's sky for where the boy really is, the moon in
   tonight's phase, its north edge to the north the places face, so the chart turned to the sky matches it"). The same
   sky the telescope shows (telescope.js), from Events' CastleSky (page/castle-sky.js, req 622), on paper in the castle's
   engraved look: Flamsteed's chart for the form (star-charts-01, 1729), Jamieson's key for the stars' marks by size
   (star-charts-06, 1822). The whole sky above the horizon in one round, the zenith at its centre, north at the top and
   east to the left, as a chart held up to the sky reads; the moon in its phase, the planets by their old signs, the
   ecliptic, the figures of the bright constellations as fine dotted lines. Ink only: nothing glows.

   LumosChart.draw(ctx, o)  o: { sky (CastleSky.at's), catalogue (page/sky/stars.json), x, y, r (the horizon circle's
       centre and radius in px), maxMag (default 5), title, sub (the cartouche's two lines; omitted, none) }.
       Returns { stars, figures, moon: { x, y } or null, planets: [{ name, x, y }] }.
   LumosChart.place(alt, az, x, y, r)  a height and bearing to px on the chart, or null below the horizon.
   LumosChart.nightOf(day)  a day as 'YYYY-MM-DD' to eleven at night on that day by the iPad's own clock, the hour a
       July night is dark at the boys' latitude; null for a day it cannot read. The chart at a boy's place is a fixed
       chart, the sky of the night he was born (the charter's Rulings log, 20 October 2026, the night skies): the page
       passes CastleSky.at(nightOf(the boy's day), home()), the day from the grown-up's setup, never from a page file;
       the telescope and every live view keep tonight's sky.
   LumosChart.caption(day, lat)  the cartouche's two lines for that night, { title, sub }, naming no one.
   LumosChart.PAPER, LumosChart.INK  the colours, the Map's engraved look's (marauders-map.js). */
(function () {
  'use strict';
  var RAD = Math.PI / 180, OBL = 23.43928;
  var PAPER = '#e9d9ad', INK = '#1e1712', FONT = '"IM Fell English", Georgia, serif';

  /* the figures, by the catalogue's own names: the bright constellations only, as a pupil's chart would show them */
  var FIGURES = [
    ['URSA MAJOR', [['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Dubhe'], ['Megrez', 'Alioth', 'Mizar', 'Alkaid']]],
    ['URSA MINOR', [['Polaris', 'Kochab', 'Pherkad']]],
    ['CASSIOPEIA', [['Caph', 'Shedar', 'Navi', 'Ruchbah', 'Segin']]],
    ['CYGNUS', [['Deneb', 'Sadr', 'Albireo'], ['Aljanah', 'Sadr', 'Fawaris']]],
    ['LYRA', [['Vega', 'Sulafat']]],
    ['AQUILA', [['Tarazed', 'Altair', 'Okab']]],
    ['PEGASUS', [['Markab', 'Scheat', 'Alpheratz', 'Algenib', 'Markab'], ['Markab', 'Homam']]],
    ['ANDROMEDA', [['Alpheratz', 'Mirach', 'Almach']]],
    ['PERSEUS', [['Algol', 'Mirfak']]],
    ['AURIGA', [['Capella', 'Menkalinan', 'Mahasim', 'Elnath', 'Hassaleh', 'Capella']]],
    ['TAURUS', [['Aldebaran', 'Tianguan'], ['Aldebaran', 'Elnath']]],
    ['ORION', [['Betelgeuse', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak', 'Betelgeuse'], ['Mintaka', 'Rigel'], ['Alnitak', 'Saiph'], ['Betelgeuse', 'Meissa', 'Bellatrix']]],
    ['GEMINI', [['Castor', 'Pollux', 'Alhena']]],
    ['CANIS MAJOR', [['Mirzam', 'Sirius', 'Adhara', 'Wezen', 'Aludra']]],
    ['LEO', [['Regulus', 'Algieba', 'Adhafera'], ['Algieba', 'Zosma', 'Denebola', 'Chertan', 'Regulus']]],
    ['BOOTES', [['Arcturus', 'Izar', 'Nekkar', 'Seginus', 'Arcturus'], ['Arcturus', 'Muphrid']]],
    ['DRACO', [['Eltanin', 'Rastaban'], ['Eltanin', 'Altais', 'Aldhibah', 'Edasich']]],
    ['SCORPIUS', [['Acrab', 'Dschubba', 'Antares', 'Shaula', 'Lesath']]],
    ['SAGITTARIUS', [['Kaus Australis', 'Kaus Media', 'Kaus Borealis', 'Nunki', 'Ascella', 'Kaus Australis'], ['Kaus Media', 'Alnasl']]]
  ];
  var SIGNS = { Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄' };

  /* the stereographic projection from the zenith: the horizon at r, north up, east to the left */
  function place(alt, az, x, y, r) {
    if (alt < 0) return null;
    var d = r * Math.tan((90 - alt) / 2 * RAD);
    return [x - d * Math.sin(az * RAD), y - d * Math.cos(az * RAD)];
  }

  /* a star's mark by Jamieson's key: the first magnitude a full eight-rayed star, falling to a dot at the fifth */
  function mark(ctx, px, py, mag, k) {
    var cls = Math.max(0, Math.min(5, Math.round(mag)));
    var size = [5.2, 4.2, 3.3, 2.5, 1.8, 1.2][cls] * k;
    ctx.fillStyle = INK;
    if (cls >= 4) { ctx.beginPath(); ctx.arc(px, py, size * 0.6, 0, Math.PI * 2); ctx.fill(); return; }
    var rays = cls <= 1 ? 8 : 6, inner = size * 0.32;
    ctx.beginPath();
    for (var i = 0; i < rays * 2; i++) {
      var a = i * Math.PI / rays - Math.PI / 2, rr = i % 2 ? inner : size;
      ctx[i ? 'lineTo' : 'moveTo'](px + rr * Math.cos(a), py + rr * Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
  }

  /* lettering on a paper halo, so no line or mark runs through it, as an engraver left the plate clear */
  function letter(ctx, text, px, py, k) {
    ctx.save(); ctx.strokeStyle = PAPER; ctx.lineWidth = 4 * k; ctx.lineJoin = 'round'; ctx.setLineDash([]);
    ctx.strokeText(text, px, py); ctx.restore(); ctx.fillText(text, px, py);
  }

  function eclipticAt(sky, lon) {
    var ra = Math.atan2(Math.sin(lon * RAD) * Math.cos(OBL * RAD), Math.cos(lon * RAD)) / RAD;
    var dec = Math.asin(Math.sin(OBL * RAD) * Math.sin(lon * RAD)) / RAD;
    return sky.star((ra + 360) % 360, dec);
  }

  /* the moon in its phase: the lit part paper, the dark part hatched in ink, the bright limb toward the sun */
  function moon(ctx, sky, px, py, s, x, y, r) {
    var m = sky.moon, p = place(m.alt, m.az, x, y, r);
    var n = sky.star(m.ra, Math.min(89.9, m.dec + 0.5)), e = sky.star(m.ra + 0.5 / Math.max(0.05, Math.cos(m.dec * RAD)), m.dec);
    var pn = place(n.alt, n.az, x, y, r), pe = place(e.alt, e.az, x, y, r), turn = 0;
    if (pn && pe) {
      var N = [pn[0] - p[0], pn[1] - p[1]], E = [pe[0] - p[0], pe[1] - p[1]];
      var ln = Math.hypot(N[0], N[1]), le = Math.hypot(E[0], E[1]), c = Math.cos(m.angle * RAD), sn = Math.sin(m.angle * RAD);
      var d = [N[0] / ln * c + E[0] / le * sn, N[1] / ln * c + E[1] / le * sn];
      turn = Math.atan2(d[1], d[0]);
    }
    ctx.save(); ctx.translate(px, py); ctx.rotate(turn);
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
    /* the dark part: the far half and the terminator's half ellipse (+x is the bright limb) */
    var t = 1 - 2 * m.lit;
    ctx.beginPath(); ctx.arc(0, 0, s, Math.PI / 2, Math.PI * 1.5);
    ctx.ellipse(0, 0, Math.abs(t) * s, s, 0, -Math.PI / 2, Math.PI / 2, t < 0);
    ctx.closePath(); ctx.save(); ctx.clip();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.6, s * 0.06);
    for (var h = -s * 1.5; h < s * 1.5; h += s * 0.16) { ctx.beginPath(); ctx.moveTo(h - s, -s); ctx.lineTo(h + s, s); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.07); ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function draw(ctx, o) {
    var sky = o.sky, cat = o.catalogue, x = o.x, y = o.y, r = o.r, maxMag = o.maxMag || 5, k = r / 300;
    var out = { stars: 0, figures: [], moon: null, planets: [] };
    ctx.save();
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, Math.PI * 2); ctx.fill();

    /* the frame: a double ring, the bearings every ten degrees, the four quarters lettered */
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 0.8 * k; ctx.beginPath(); ctx.arc(x, y, r * 1.06, 0, Math.PI * 2); ctx.stroke();
    for (var b = 0; b < 360; b += 5) {
      var a = b * RAD, l = b % 10 ? 0.025 : 0.06;
      ctx.beginPath(); ctx.moveTo(x - r * Math.sin(a), y - r * Math.cos(a)); ctx.lineTo(x - r * (1 + l) * Math.sin(a), y - r * (1 + l) * Math.cos(a)); ctx.stroke();
    }
    ctx.font = (22 * k) + 'px ' + FONT; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [['NORTH', 0], ['EAST', 90], ['SOUTH', 180], ['WEST', 270]].forEach(function (q) {
      var a = q[1] * RAD, d = r * 1.15;
      ctx.save(); ctx.translate(x - d * Math.sin(a), y - d * Math.cos(a)); ctx.rotate(q[1] === 180 ? 0 : -a); ctx.fillText(q[0], 0, 0); ctx.restore();
    });

    /* the heights of thirty and sixty degrees, dotted, and the zenith's cross */
    ctx.setLineDash([1.5 * k, 4 * k]); ctx.lineWidth = 0.7 * k;
    [30, 60].forEach(function (h) { ctx.beginPath(); ctx.arc(x, y, r * Math.tan((90 - h) / 2 * RAD), 0, Math.PI * 2); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x - 6 * k, y); ctx.lineTo(x + 6 * k, y); ctx.moveTo(x, y - 6 * k); ctx.lineTo(x, y + 6 * k); ctx.stroke();

    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();

    /* the ecliptic, a long dash, the sun's road the planets keep to */
    ctx.setLineDash([8 * k, 5 * k]); ctx.lineWidth = 0.9 * k; ctx.beginPath();
    var pen = false;
    for (var lon = 0; lon <= 360; lon += 2) {
      var h1 = eclipticAt(sky, lon), q1 = place(h1.alt, h1.az, x, y, r);
      if (q1) { ctx[pen ? 'lineTo' : 'moveTo'](q1[0], q1[1]); pen = true; } else pen = false;
    }
    ctx.stroke(); ctx.setLineDash([]);

    /* the stars, and the named ones found for the figures */
    var stars = CastleSky.stars(sky, cat, maxMag), at = {};
    stars.forEach(function (s) {
      var q = place(s.alt, s.az, x, y, r);
      if (s.name) at[s.name] = q;
      mark(ctx, q[0], q[1], s.mag, k);
    });
    out.stars = stars.length;

    /* the figures, fine dotted lines that stop short of each star, their names in spaced capitals */
    ctx.setLineDash([1.2 * k, 3 * k]); ctx.lineWidth = 0.8 * k; ctx.strokeStyle = INK;
    FIGURES.forEach(function (f) {
      var seen = [];
      f[1].forEach(function (line) {
        for (var i = 1; i < line.length; i++) {
          var p0 = at[line[i - 1]], p1 = at[line[i]];
          if (!p0 || !p1) continue;
          var dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy), g = Math.min(len * 0.3, 7 * k);
          if (len < 1) continue;
          ctx.beginPath(); ctx.moveTo(p0[0] + dx / len * g, p0[1] + dy / len * g); ctx.lineTo(p1[0] - dx / len * g, p1[1] - dy / len * g); ctx.stroke();
          seen.push(p0, p1);
        }
      });
      if (seen.length < 4) return;
      var cx = 0, cy = 0; seen.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= seen.length; cy /= seen.length;
      ctx.save(); ctx.setLineDash([]); ctx.font = 'italic ' + (12 * k) + 'px ' + FONT; ctx.fillStyle = INK; ctx.globalAlpha = 0.8;
      letter(ctx, f[0].split('').join(' '), cx, cy + 14 * k, k); ctx.restore();
      out.figures.push(f[0]);
    });
    ctx.setLineDash([]);

    /* the brightest stars named beside their marks */
    ctx.font = 'italic ' + (12.5 * k) + 'px ' + FONT; ctx.textAlign = 'left';
    stars.forEach(function (s) {
      if (!s.name || s.mag > 1.6) return;
      var q = place(s.alt, s.az, x, y, r); letter(ctx, s.name, q[0] + 7 * k, q[1] - 5 * k, k);
    });

    /* the planets by their old signs, named in small italic */
    sky.planets.forEach(function (p) {
      var q = place(p.alt, p.az, x, y, r);
      if (!q) return;
      ctx.beginPath(); ctx.arc(q[0], q[1], 2.2 * k, 0, Math.PI * 2); ctx.fill();
      ctx.font = (17 * k) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillText(SIGNS[p.name], q[0], q[1] - 13 * k);
      ctx.font = 'italic ' + (11 * k) + 'px ' + FONT; letter(ctx, p.name, q[0], q[1] + 12 * k, k);
      out.planets.push({ name: p.name, x: q[0], y: q[1] });
    });

    /* the moon, drawn larger than the sky's half degree so its phase reads on paper */
    var mq = place(sky.moon.alt, sky.moon.az, x, y, r);
    if (mq) {
      moon(ctx, sky, mq[0], mq[1], 11 * k, x, y, r);
      ctx.font = 'italic ' + (11 * k) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = INK;
      letter(ctx, 'the Moon', mq[0], mq[1] + 22 * k, k);
      out.moon = { x: mq[0], y: mq[1] };
    }
    ctx.restore();

    /* the cartouche below the round */
    if (o.title) {
      ctx.textAlign = 'center'; ctx.fillStyle = INK;
      ctx.font = (24 * k) + 'px ' + FONT; ctx.fillText(o.title, x, y + r * 1.27);
      if (o.sub) { ctx.font = 'italic ' + (16 * k) + 'px ' + FONT; ctx.fillText(o.sub, x, y + r * 1.27 + 26 * k); }
    }
    ctx.restore();
    return out;
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh',
    'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth',
    'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh',
    'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
  function readDay(day) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(day || '').trim());
    return m && +m[2] >= 1 && +m[2] <= 12 && +m[3] >= 1 && +m[3] <= 31 ? [+m[1], +m[2], +m[3]] : null;
  }
  function nightOf(day) { var d = readDay(day); return d ? new Date(d[0], d[1] - 1, d[2], 23, 0, 0) : null; }
  function caption(day, lat) {
    var d = readDay(day);
    if (!d) return { title: 'The Heavens', sub: '' };
    return { title: 'The Heavens on the night you were born',
      sub: 'eleven o’clock, the ' + ORD[d[2]] + ' of ' + MONTHS[d[1] - 1] + ', ' + d[0] + '; ' + Math.round(Math.abs(lat)) + '° ' + (lat < 0 ? 'south' : 'north') };
  }

  window.LumosChart = { draw: draw, place: place, nightOf: nightOf, caption: caption, PAPER: PAPER, INK: INK, FIGURES: FIGURES };
})();
