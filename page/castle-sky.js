// The real night sky, for the Astronomy top's telescopes and the chart at the boys' places (board req 622, the
// Curator's, docs/curator/astronomy-tower-top.md items 6 and 7; Design draws it, req 623). Pure functions of a date
// and a place: the stars, the five planets of the eye, the moon in its real phase and place, the sun for whether it
// is dark. Nothing here keeps a clock, stores a place or draws; the page passes the runtime's date and hour and the
// place Godric's answer names (events-home-sky-1016, waiting), and asks again as the night turns.
//
// CastleSky.at(date, place) date: a Date; place: { lat, lon } in degrees, north and east positive.
// Returns { lst, sun, moon, planets, star } where every body has { ra, dec } (degrees, the J2000 frame) and
// { alt, az } (degrees above the horizon, refraction added; az from north through east):
//   lst      the local sidereal time in degrees, which turns the sky
//   sun      { ra, dec, alt, az, dark } dark once the sun is 12 degrees down (nautical dusk), the stars plain
//   moon     { ra, dec, alt, az, lit, waxing, phase, angle } lit 0..1, angle the bright limb's position angle
//            (degrees from north through east, toward the sun), phase as the runtime's moonAt names it
//   planets  [{ name, ra, dec, alt, az, mag }] Mercury, Venus, Mars, Jupiter, Saturn
//   star(ra, dec) { alt, az } for one catalogue star
// CastleSky.stars(sky, catalogue, maxMag) the catalogue's stars above the horizon to maxMag, brightest first, each
//   { alt, az, mag, bv, name }; the catalogue is page/sky/stars.json (Hipparcos to magnitude 6, its source and
//   licence inside).
//
// Sources: the planets by JPL's Keplerian elements for approximate positions, Table 1, 1800 to 2050 AD
// (ssd.jpl.nasa.gov/planets/approx_pos.html, read 16 October 2026); the moon and sun by the Astronomical Almanac's
// low-precision series (about a third of a degree); the sidereal time by the IAU's GMST in days from J2000. The stars
// are not precessed, so the whole sky sits within half a degree of the truth through the boys' years.
(function () {
  const RAD = Math.PI / 180;
  const sin = x => Math.sin(x * RAD), cos = x => Math.cos(x * RAD);
  const norm = x => ((x % 360) + 360) % 360;
  const OBL = 23.43928;                                 // the ecliptic's tilt at J2000

  // [a, e, I, L, long.peri, long.node] and their rates per century (JPL Table 1)
  const ELEMENTS = {
    Mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
              [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
    Venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
              [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
    Earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
              [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
    Mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
              [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
    Jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
              [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
    Saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
              [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]]
  };
  // the planets' brightness at unit distances and its phase curve in the phase angle i (degrees): c0 + c1 i + c2 i^2
  // + c3 i^3 (the almanac's; Saturn without its rings, which can add half a magnitude)
  const MAG = { Mercury: [-0.42, 0.0380, -0.000273, 0.000002], Venus: [-4.40, 0.0009, 0.000239, -0.00000065],
                Mars: [-1.52, 0.016, 0, 0], Jupiter: [-9.40, 0.005, 0, 0], Saturn: [-8.88, 0.044, 0, 0] };

  const days = d => d.getTime() / 86400000 + 2440587.5 - 2451545.0;   // days from J2000.0 (UT, near enough)

  // heliocentric ecliptic x, y, z (au) of a planet at T centuries from J2000
  function helio(name, T) {
    const [e0, r] = ELEMENTS[name];
    const a = e0[0] + r[0] * T, e = e0[1] + r[1] * T, I = e0[2] + r[2] * T, L = e0[3] + r[3] * T;
    const peri = e0[4] + r[4] * T, node = e0[5] + r[5] * T;
    const w = peri - node, M = norm(L - peri + 180) - 180;
    let E = M + (e / RAD) * sin(M);
    for (let i = 0; i < 8; i++) E -= (E - (e / RAD) * sin(E) - M) / (1 - e * cos(E));
    const xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
    return [
      (cos(w) * cos(node) - sin(w) * sin(node) * cos(I)) * xp + (-sin(w) * cos(node) - cos(w) * sin(node) * cos(I)) * yp,
      (cos(w) * sin(node) + sin(w) * cos(node) * cos(I)) * xp + (-sin(w) * sin(node) + cos(w) * cos(node) * cos(I)) * yp,
      (sin(w) * sin(I)) * xp + (cos(w) * sin(I)) * yp
    ];
  }
  // ecliptic x, y, z to right ascension and declination (degrees)
  function equ(x, y, z) {
    const ye = y * cos(OBL) - z * sin(OBL), ze = y * sin(OBL) + z * cos(OBL);
    return { ra: norm(Math.atan2(ye, x) / RAD), dec: Math.atan2(ze, Math.hypot(x, ye)) / RAD };
  }
  const fromEcl = (lon, lat) => equ(cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat));
  // height and bearing from the hour angle, with the air's lift near the horizon (Bennett)
  function horizon(ra, dec, lst, lat) {
    const H = lst - ra;
    const alt = Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)) / RAD;
    const az = norm(Math.atan2(sin(H), cos(H) * sin(lat) - Math.tan(dec * RAD) * cos(lat)) / RAD + 180);
    const lift = alt > -2 ? 1 / Math.tan((alt + 7.31 / (alt + 4.4)) * RAD) / 60 : 0;
    return { alt: alt + lift, az };
  }
  const sep = (a, b) => Math.acos(Math.max(-1, Math.min(1,
    sin(a.dec) * sin(b.dec) + cos(a.dec) * cos(b.dec) * cos(a.ra - b.ra)))) / RAD;
  const PHASES = [[12, 'new'], [78, 'waxing-crescent'], [102, 'first-quarter'], [168, 'waxing-gibbous'], [192, 'full'],
                  [258, 'waning-gibbous'], [282, 'last-quarter'], [348, 'waning-crescent'], [360, 'new']];

  function at(date, place) {
    const d = days(date), T = d / 36525, lat = place.lat;
    const lst = norm(280.46061837 + 360.98564736629 * d + place.lon);
    // the sun
    const g = 357.529 + 0.98560028 * d, q = 280.459 + 0.98564736 * d;
    const ls = norm(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    const sunEq = fromEcl(ls, 0), sunH = horizon(sunEq.ra, sunEq.dec, lst, lat);
    // the moon
    const lm = norm(218.32 + 481267.881 * T + 6.29 * sin(135.0 + 477198.87 * T) - 1.27 * sin(259.3 - 413335.36 * T)
      + 0.66 * sin(235.7 + 890534.22 * T) + 0.21 * sin(269.9 + 954397.74 * T) - 0.19 * sin(357.5 + 35999.05 * T)
      - 0.11 * sin(186.5 + 966404.03 * T));
    const bm = 5.13 * sin(93.3 + 483202.02 * T) + 0.28 * sin(228.2 + 960400.89 * T) - 0.28 * sin(318.3 + 6003.15 * T)
      - 0.17 * sin(217.6 - 407332.21 * T);
    const par = 0.9508 + 0.0518 * cos(134.9 + 477198.85 * T) + 0.0095 * cos(259.2 - 413335.38 * T)
      + 0.0078 * cos(235.7 + 890534.23 * T) + 0.0028 * cos(269.9 + 954397.70 * T);
    const moonEq = fromEcl(lm, bm), moonH = horizon(moonEq.ra, moonEq.dec, lst, lat);
    moonH.alt -= par * cos(moonH.alt);                  // seen from the ground, not the earth's centre
    const elong = norm(lm - ls), lit = (1 - cos(sep(moonEq, sunEq))) / 2;
    let phase = 'new';
    for (const [lim, nm] of PHASES) if (elong < lim) { phase = nm; break; }
    const angle = norm(Math.atan2(cos(sunEq.dec) * sin(sunEq.ra - moonEq.ra),
      sin(sunEq.dec) * cos(moonEq.dec) - cos(sunEq.dec) * sin(moonEq.dec) * cos(sunEq.ra - moonEq.ra)) / RAD);
    // the planets, seen from the earth
    const E = helio('Earth', T);
    const planets = Object.keys(MAG).map(name => {
      const P = helio(name, T), x = P[0] - E[0], y = P[1] - E[1], z = P[2] - E[2];
      const r = Math.hypot(...P), delta = Math.hypot(x, y, z), R = Math.hypot(...E);
      const i = Math.acos(Math.max(-1, Math.min(1, (r * r + delta * delta - R * R) / (2 * r * delta)))) / RAD;
      const eq = equ(x, y, z), h = horizon(eq.ra, eq.dec, lst, lat);
      const c = MAG[name], mag = c[0] + 5 * Math.log10(r * delta) + c[1] * i + c[2] * i * i + c[3] * i * i * i;
      return { name, ra: eq.ra, dec: eq.dec, alt: h.alt, az: h.az, mag: Math.round(mag * 10) / 10 };
    });
    return {
      lst,
      sun: { ra: sunEq.ra, dec: sunEq.dec, alt: sunH.alt, az: sunH.az, dark: sunH.alt < -12 },
      moon: { ra: moonEq.ra, dec: moonEq.dec, alt: moonH.alt, az: moonH.az, lit: Math.round(lit * 100) / 100,
              waxing: elong < 180, phase, angle },
      planets,
      star: (ra, dec) => horizon(ra, dec, lst, lat)
    };
  }

  function stars(sky, cat, maxMag) {
    const out = [], lim = maxMag == null ? 6 : maxMag;
    for (let i = 0; i < cat.stars.length; i++) {
      const s = cat.stars[i];
      if (s[2] > lim) break;                            // the list runs brightest first
      const h = sky.star(s[0], s[1]);
      if (h.alt > 0) out.push({ alt: h.alt, az: h.az, mag: s[2], bv: s[3], name: (cat.names && cat.names[i]) || '' });
    }
    return out;
  }

  const api = { at, stars, separation: sep };
  if (typeof window !== 'undefined') window.CastleSky = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
