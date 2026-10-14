// The house points' hourglass (Q21 answered 2, Godric, 12 October 2026, 9.38 pm, with his t1: both boys' points fill
// the one hourglass of whatever houses they choose, the cup won together, never brother against brother; Magic's B11,
// req 213: points for learning, never lost, once each, each reason dropping as a slip into the base, t1 there).
// Canon, the canon tool: "the giant hourglasses that recorded the house points" (PS 15, B1 L5089), "set in niches
// along the wall" (OotP 28, B5 L49050); "a shower of rubies fell down into the bottom bulb of Gryffindor's
// hour-glass ... a number of sapphires fell into Ravenclaw's glass" (OotP 38, B5 L53906); Slytherin's "spilled its
// emeralds" (DH 32, B7 L77235). The books never name Hufflepuff's stones: the films' yellow ones stand in.
// Form after ledgers-and-instruments-03 (the Curator's shelf row: two 17th-century hourglass frames, the pierced
// brass one with twisted posts and the oak one with plain pillars). Drawn in the castle's ink and wash, in code, so
// the stones can fall live; it needs lumos-icon.js (and beasts/drawn.js) loaded first, for the crest.
//
// Q22 answered 1 (Godric, 13 October 2026, 7.31 am, relayed by Fawkes): pierced brass, twisted posts, the crest on a
// cartouche above, so 'brass' is the default frame. His t1: the brass glass stands in a niche along a wall (OotP 28)
// once the Architect places the entrance hall, the brass frame inside (niche: true; the placing is the Architect's).
// His t2: if a point is ever taken back, its stone flies up into the top bulb ("Even as they watched, stones flew
// upwards", OotP 28, B5 L49050) with a cross little clink (rising, clink()). Magic's against the year (Godric, 8.11 am,
// 1): no rival but their own best year, the top bulb the house's store, magically never lower, so 'store' is the
// default top.
// Q25 answered 25.1 (Godric, 13 October 2026, 1.55 pm): four glasses in four niches along the entrance hall's wall,
// one a house, as the books draw them ("the giant hourglasses", PS 15; "set in niches along the wall", OotP 28): each
// boy's stones fall in his own house's glass, the two filling together, the other two still, their stones all kept
// above. His t1: the morning after a big night his house's glass has jumped ("passing the giant hourglasses ... the
// next day thought there'd been a mistake", PS 15, B1 L5089), and only ever upward (seen, below).
//
// LumosHourglass.svg({ slips, houses, frame, niche, full, falling, rising, top, id })
//   slips    the year's awards in the order earned, as Events' record keeps them ({ kind, thing, points, on, record },
//            castle.points()), each with a house ('lion', 'snake', 'badger', 'eagle'): the house of the boy who earned
//            it. A slip without one takes houses[0], this castle's own. Both boys' stones lie in the one bottom bulb,
//            in bands as they were earned, so the year can be read in the glass. A slip with `back` (taken back)
//            leaves the heap and the base.
//   houses   the boys' houses, one or two (both the same if they choose one); their quarters light on the crest
//   frame    'brass' (default, Godric's 22.1), 'oak' (plain pillars) or 'niche' (the stone niche alone, Q22's 22.3)
//   niche    true: the brass glass stands in a stone niche, its wall round it (his t1); the viewBox grows to
//            -24 -22 168 274 so the glass keeps its own coordinates
//   full     the points that fill the bottom bulb (their own best year is the mark, Magic's 1; 1000 till one is set)
//   falling  { house, n, slow, at } a shower in the air between the neck and the heap (OotP 38): n stones; slow, a
//            brother taught (Magic's t2) or a thing given him (req 298), the stones fewer and spaced, as if
//            drifting; at 0..1, the moment in a live
//            fall (mount() drives it), absent for a still
//   rising   { house, n, at } a stone taken back, flying up from the heap through the neck (his t2)
//   top      the top bulb: 'store' (default, the house's store, never lower), 'clear', or a fraction 0..1
// LumosHourglass.cup({ houses, year, gems, id, metal, cover, age, letter }) the year's cup (req 306): Objects'
//   trophies sheet's rank 1 drawn in code, silver, the crest on its cartouche, the year on its plinth; gems, the
//   year's slips, poured into its mouth at the leaving feast (Magic's against the year, req 233), the cover lifted;
//   age 0..1 fades an old year's cup (req 279). form: 'stand-in' draws Q22's stand-in, for its sheets.
// LumosHourglass.mount(el, { slips, houses, full, niche, audio }) draws the glass into el and gives { set(slips),
//   point(slip), back(slip) }: point is the runtime's opts.point (req 222), its stones falling as it lands, slower
//   for a brother taught (kind 'taught') and for a thing given, which passed between the brothers (kind 'given',
//   Magic's req 298, Events' req 385); back flies its stones up and clinks. audio: an AudioContext, else none.
//   seen: how many slips the glass showed when he last looked (the room keeps it, and passes it at the first look
//   of a new day); the slips after it land at once a beat after the glass is drawn, one heavy shower a house, so the
//   glass has jumped (his t1). A slip taken back meanwhile is simply gone: nothing falls in the morning. Also jump(n).
// LumosHourglass.hall({ slips, houses, full, order, top, falling, id }) the entrance hall's wall: the four houses'
//   glasses, each in its niche (25.1), in `order` (default HALL: the Sorting Hat's, PS 7, as the crest lights).
//   A glass takes the slips of its own house (a slip without one, houses[0]'s) and lights only its own quarter;
//   the boys' houses are the ones that fill. Each niche is PITCH wide in the glass's units; viewBox
//   -24 -22 PITCH*4 274, the wall continuous behind the four.
// LumosHourglass.hallMount(el, { slips, houses, full, order, audio, seen }) the hall live, as mount(): set, point,
//   back and jump, each slip's stones falling in its own house's glass.
// LumosHourglass.clink(audio) the cross little clink, glass on glass, a little sharp.
(function () {
  const STONE = {  // the stone, its lit facet, its dark edge
    lion: ['#a3162c', '#f07a86', '#4a0812'], eagle: ['#1e4c9e', '#8fb2f0', '#0b1d45'],
    snake: ['#1b7a46', '#7fdca5', '#08341c'], badger: ['#e3b52a', '#fff0a8', '#6b4e08'],
  };
  const NAME = { lion: 'Gryffindor', snake: 'Slytherin', badger: 'Hufflepuff', eagle: 'Ravenclaw' };
  const CX = 60, TOP = 36, NECK = 113, BOT = 190;
  // the bulb's half width at u, 0 at the cap and 1 at the neck: a blown bulb, rounded into the cap, widest a third
  // of the way in, closing round to a narrow waist, as the precedent's glasses are
  const g = u => { const m = 0.36, e = u < m ? 1 - Math.pow((m - u) / 0.52, 2) : 1 - Math.pow((u - m) / (1 - m), 2.2); return 2.4 + 31.6 * Math.pow(Math.max(0, e), 0.62); };
  const hwAt = y => y <= NECK ? g((y - TOP) / (NECK - TOP)) : g((BOT - y) / (BOT - NECK));
  const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f = n => n.toFixed(2);
  let n = 0;

  function bulbPath() {
    const L = [], R = [];
    for (let i = 0; i <= 80; i++) { const y = TOP + (BOT - TOP) * i / 80, w = hwAt(y); L.push(`${f(CX - w)},${f(y)}`); R.push(`${f(CX + w)},${f(y)}`); }
    return `M${L.join(' L')} L${R.reverse().join(' L')} Z`;
  }
  function defs(id) {
    return `<defs>
    <filter id="wob${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="1" seed="3" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="0.9" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="wc${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0.5 0 0 0 0.66  0.5 0 0 0 0.66  0.5 0 0 0 0.66  0 0 0 0 1" result="g"/>
      <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/></filter>
    <linearGradient id="brass${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2bf6a"/><stop offset="0.5" stop-color="#b48a3a"/><stop offset="1" stop-color="#7a5a22"/></linearGradient>
    <linearGradient id="post${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e4f1c"/><stop offset="0.4" stop-color="#e8c878"/><stop offset="1" stop-color="#7a5a22"/></linearGradient>
    <linearGradient id="oak${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6238"/><stop offset="1" stop-color="#5a3c1e"/></linearGradient>
    <linearGradient id="pill${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4e3418"/><stop offset="0.45" stop-color="#9a7246"/><stop offset="1" stop-color="#4e3418"/></linearGradient>
    <linearGradient id="glass${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/><stop offset="0.25" stop-color="#ffffff" stop-opacity="0.42"/>
      <stop offset="0.4" stop-color="#ffffff" stop-opacity="0.08"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.2"/></linearGradient>
    <linearGradient id="stone${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d8270"/><stop offset="1" stop-color="#5e5546"/></linearGradient>
    <radialGradient id="niche${id}" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="#3a3126"/><stop offset="1" stop-color="#1a150f"/></radialGradient>
    <clipPath id="bulb${id}"><path d="${bulbPath()}"/></clipPath>
  </defs>`;
  }
  // one stone: a cut gem seen side on, its lit facet up and left
  function stone(x, y, r, house, R) {
    const [c, lit, dark] = STONE[house] || STONE.lion, a = R() * Math.PI, k = 6;
    const pts = []; for (let i = 0; i < k; i++) { const t = a + i * 2 * Math.PI / k, q = r * (0.82 + 0.3 * R()); pts.push(`${f(x + Math.cos(t) * q)},${f(y + Math.sin(t) * q * 0.85)}`); }
    return `<polygon points="${pts.join(' ')}" fill="${c}" stroke="${dark}" stroke-width="0.28"/>
      <path d="M${f(x - r * 0.55)},${f(y - r * 0.05)} L${f(x - r * 0.1)},${f(y - r * 0.6)} L${f(x + r * 0.15)},${f(y - r * 0.15)} Z" fill="${lit}" opacity="0.85"/>`;
  }
  // where the stones lie: packed rows bottom up, filled in order as from one stream onto a cone under the neck
  function places(capR) {
    const P = [], dy = capR * 1.55;
    for (let y = BOT - capR * 1.2, row = 0; y > NECK + 6; y -= dy, row++) {
      const w = hwAt(y) - 1.9 - capR * 0.6;
      for (let x = CX - w + (row % 2) * capR; x <= CX + w; x += capR * 2.05) P.push([x, y, (BOT - y) - 20 * Math.pow(1 - Math.abs(x - CX) / Math.max(w, 1), 1.4)]);
    }
    return P.sort((a, b) => a[2] - b[2]);
  }
  function heap(id, slips, houses, full) {
    const total = slips.reduce((s, x) => s + x.points, 0); if (!total) return { svg: '', topY: BOT };
    const P = places(1.8), count = Math.round(P.length * Math.min(1, total / full)), R = rnd(11);
    const cum = []; let c = 0; for (const s of slips) { cum.push([c, c + s.points, s.house || houses[0]]); c += s.points; }
    let out = '', topY = BOT, j = 0;
    for (let i = 0; i < count; i++) {
      const v = (i + 0.5) / count * total; while (j < cum.length - 1 && v >= cum[j][1]) j++;
      const [x, y] = P[i]; out += stone(x + (R() - 0.5) * 1.3, y + (R() - 0.5) * 1.1, 1.8 * (0.8 + 0.4 * R()), cum[j][2], R); topY = Math.min(topY, y);
    }
    return { svg: out, topY };
  }
  // a shower: still, the stones scattered down the fall; live (at 0..1), each stone leaves the neck in its turn and
  // drops onto the heap, so mount() can play it as the point lands
  function shower(fall, topY) {
    if (!fall || !fall.n) return '';
    const R = rnd(29), n = fall.slow ? Math.max(3, Math.round(fall.n / 3)) : fall.n, live = typeof fall.at === 'number';
    let s = '';
    for (let i = 0; i < n; i++) {
      let t;
      if (!live) t = fall.slow ? (i + 0.5) / n : Math.pow(R(), 0.8);
      else { const go = i / n * 0.55, p = (fall.at - go) / 0.45; R(); if (p <= 0 || p >= 1) { R(); R(); continue; } t = fall.slow ? p : p * p; }
      const y = NECK + 2 + t * (topY - NECK - 5);
      s += stone(CX + (R() - 0.5) * (1 + t * 7), y, 1.35, fall.house, R);
    }
    return s;
  }
  // a stone taken back (Godric's t2): it lifts off the heap and flies up through the neck into the store, a short
  // streak under it; live at 0..1, or still at its mid flight
  function rise(up, topY) {
    if (!up || !up.n) return '';
    const R = rnd(41), at = typeof up.at === 'number' ? up.at : 0.3;
    let s = '';
    for (let i = 0; i < up.n; i++) {
      const p = (at - i * 0.12) / Math.max(0.4, 1 - (up.n - 1) * 0.12); if (p <= 0 || p >= 1) continue;
      const e = 1 - Math.pow(1 - p, 2), y = topY - 2 - e * (topY - NECK + 22), x = CX + (R() - 0.5) * 6 * (1 - e);
      s += `<path d="M${f(x)},${f(y + 2.4)} V${f(y + 7.5)}" stroke="${(STONE[up.house] || STONE.lion)[1]}" stroke-width="0.8" opacity="0.55" stroke-linecap="round"/>` + stone(x, y, 1.8, up.house, R);
    }
    return s;
  }
  function topBulb(top, houses) {
    if (top === undefined || top === 'store') top = 0.86;   // the house's store, never lower (Magic's 1)
    if (typeof top !== 'number' || top <= 0) return '';
    const R = rnd(5); let s = '';
    // packed loosely, row on row offset, each stone a little out of line, so it reads as a heap and not a grid
    for (let y = NECK - 6, row = 0; y > NECK - 6 - top * 62; y -= 2.5, row++) {
      const w = hwAt(y) - 2.4;
      for (let x = CX - w + (row % 2) * 1.6; x <= CX + w; x += 3.3) s += stone(x + (R() - 0.5) * 1.4, y + (R() - 0.5) * 1.1, 1.5 * (0.85 + 0.3 * R()), houses[Math.floor(R() * houses.length)], R);
    }
    return s;
  }
  // rolled slips of parchment, each tied with a thread of its earner's house
  function slipsIn(x0, y0, w, h, slips, houses) {
    // dropped in loosely as they were earned, the first at the bottom, each lying where it falls on the ones below
    const R = rnd(17), cols = Math.floor(w / 2), ht = new Array(cols).fill(0); let s = '';
    slips.forEach(sl => {
      const len = 8 + R() * 2.5, c0 = Math.floor(R() * (cols - len / 2)), c1 = c0 + Math.ceil(len / 2);
      const base = Math.max(...ht.slice(c0, c1)), y = y0 + h - 1.6 - base;
      if (y < y0 + 1.6) return;
      for (let c = c0; c < c1; c++) ht[c] = base + 2.2 + R() * 0.4;
      const x = x0 + c0 * 2, tie = STONE[sl.house || houses[0]][0], tone = ['#e2d0a4', '#d9c596', '#eadbb4', '#cfba88'][Math.floor(R() * 4)];
      s += `<g transform="rotate(${f((R() - 0.5) * 14)} ${f(x + len / 2)} ${f(y)})"><rect x="${f(x)}" y="${f(y - 1.2)}" width="${f(len)}" height="2.4" rx="1.2" fill="${tone}" stroke="#4a3820" stroke-width="0.25"/>
        <ellipse cx="${f(x + len - 0.4)}" cy="${f(y)}" rx="0.45" ry="1.15" fill="#b9a273" stroke="#4a3820" stroke-width="0.2"/>
        <path d="M${f(x + len * 0.45)},${f(y - 1.2)} V${f(y + 1.2)}" stroke="${tie}" stroke-width="0.8"/></g>`;
    });
    return s;
  }
  // the crest as built (Q14 to Q20), the boys' houses' quarters lit in their colours, the other two at rest
  function crestAt(id, x, y, size, houses, colour) {
    const I = window.LumosIcon, tint = { lion: 0, snake: 0, badger: 0, eagle: 0 };
    houses.forEach(h => { tint[h] = 1; });
    return `<g transform="translate(${f(x - size / 2)},${f(y - size / 2)}) scale(${f(size / 64)})">${I.crest('hg' + id, 'drawn', 0, 'seal', colour, tint)}</g>`;
  }
  function posts(id, xs, y1, y2, back) {
    let s = '';
    for (const x of xs) {
      if (back) { s += `<rect x="${x - 1.4}" y="${y1}" width="2.8" height="${y2 - y1}" fill="#6e5428" opacity="0.55"/>`; continue; }
      for (let y = y1, i = 0; y < y2; y += 3.1, i++) s += `<ellipse cx="${f(x + (i % 2 ? 0.55 : -0.55))}" cy="${f(y + 1.5)}" rx="2.5" ry="1.75" fill="url(#post${id})" stroke="#3e2c10" stroke-width="0.3"/>`;
    }
    return s;
  }
  function pierced(x1, x2, y, h, down) {
    // a pierced brass band: a row of holes and a scalloped edge
    let s = `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" fill="url(#brassB)"/>`, sc = '';
    for (let x = x1 + 3; x < x2 - 2; x += 4.4) s += `<circle cx="${f(x)}" cy="${f(y + h / 2)}" r="0.85" fill="#3a2a10"/>`;
    const e = down ? y + h : y;
    for (let x = x1; x < x2 - 0.1; x += 4.4) sc += `M${f(x)},${f(e)} q2.2,${down ? 2.6 : -2.6} 4.4,0 `;
    return s + `<path d="${sc}" fill="url(#brassB)" stroke="#3e2c10" stroke-width="0.35"/>
      <rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" fill="none" stroke="#3e2c10" stroke-width="0.4"/>`;
  }
  function frameBrass(id, inner, slips, houses) {
    const back = posts(id, [27, 93], 30, 194, true), front = posts(id, [16, 104], 30, 194, false);
    const top = pierced(10, 110, 22, 10, true).replace(/brassB/g, 'brass' + id), foot = pierced(10, 110, 192, 9, false).replace(/brassB/g, 'brass' + id);
    const cart = `<path d="M44,2 H76 L80,8 V26 C80,34 70,39 60,41 C50,39 40,34 40,26 V8 Z" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.6"/>`;
    const drawer = `<rect x="14" y="201" width="92" height="31" rx="1.5" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.5"/>
      <rect x="21" y="205" width="78" height="23" fill="#1d160e"/>${slipsIn(21, 205, 78, 23, slips, houses)}<rect x="21" y="205" width="78" height="23" fill="url(#glass${id})" stroke="#3e2c10" stroke-width="0.6"/>`;
    return back + inner + front + top + foot + cart + crestAt(id, 60, 20, 36, houses, '#4a3313') + drawer;
  }
  function frameOak(id, inner, slips, houses) {
    const pillar = x => { let s = `<rect x="${x - 2.6}" y="32" width="5.2" height="160" fill="url(#pill${id})" stroke="#2a1a0a" stroke-width="0.35"/>`; for (const y of [36, 40, 184, 188]) s += `<rect x="${x - 3.3}" y="${y}" width="6.6" height="2" rx="0.8" fill="url(#pill${id})" stroke="#2a1a0a" stroke-width="0.3"/>`; return s; };
    const board = (y, h) => `<rect x="8" y="${y}" width="104" height="${h}" rx="1" fill="url(#oak${id})" stroke="#2a1a0a" stroke-width="0.5"/><path d="M10,${y + 2} H110" stroke="#c49a62" stroke-width="0.4" opacity="0.6"/>`;
    const grain = y => { let s = ''; for (let i = 0; i < 5; i++) s += `<path d="M${12 + i * 3},${y + 3 + i * 1.6} C40,${y + 1 + i * 1.6} 80,${y + 6 + i * 1.6} ${108 - i * 2},${y + 3 + i * 1.6}" stroke="#3e2812" stroke-width="0.3" fill="none" opacity="0.5"/>`; return s; };
    const drawer = `<rect x="12" y="202" width="96" height="30" rx="1" fill="url(#oak${id})" stroke="#2a1a0a" stroke-width="0.5"/>
      <rect x="20" y="206" width="80" height="20" fill="#1d160e"/>${slipsIn(20, 206, 80, 20, slips, houses)}<rect x="20" y="206" width="80" height="20" fill="url(#glass${id})" stroke="#2a1a0a" stroke-width="0.6"/>
      <circle cx="60" cy="229" r="1.6" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.3"/>`;
    return pillar(26) + pillar(94) + inner + pillar(14) + pillar(106) + board(4, 30) + grain(4) + board(190, 12)
      + crestAt(id, 60, 19, 32, houses, '#2a1a0a') + drawer;
  }
  function frameNiche(id, inner, slips, houses) {
    const wall = `<rect x="0" y="0" width="120" height="240" fill="url(#stone${id})"/>`;
    let joints = ''; for (let y = 14; y < 240; y += 14) joints += `<path d="M0,${y} H120" stroke="#3a3328" stroke-width="0.4" opacity="0.6"/>`;
    for (let y = 0, r = 0; y < 240; y += 14, r++) for (let x = (r % 2) * 13; x < 120; x += 26) joints += `<path d="M${x},${y} V${y + 14}" stroke="#3a3328" stroke-width="0.4" opacity="0.6"/>`;
    const arch = 'M14,204 V64 C14,34 36,22 60,22 C84,22 106,34 106,64 V204 Z';
    const caps = `<rect x="22" y="30" width="76" height="7" rx="1.5" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.4"/><rect x="22" y="189" width="76" height="7" rx="1.5" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.4"/>
      <rect x="23" y="36" width="2.4" height="154" fill="url(#post${id})"/><rect x="94.6" y="36" width="2.4" height="154" fill="url(#post${id})"/>`;
    const ledge = `<rect x="8" y="196" width="104" height="9" fill="#9a8f7c" stroke="#3a3328" stroke-width="0.5"/>
      <rect x="18" y="207" width="84" height="26" fill="#1d160e" stroke="#3a3328" stroke-width="0.6"/>${slipsIn(18, 207, 84, 26, slips, houses)}<rect x="18" y="207" width="84" height="26" fill="url(#glass${id})"/>`;
    const key = `<path d="M50,4 H70 L67,24 H53 Z" fill="#9a8f7c" stroke="#3a3328" stroke-width="0.5"/>`;
    return wall + joints + `<path d="${arch}" fill="url(#niche${id})" stroke="#3a3328" stroke-width="0.8"/>` + caps + inner + ledge
      + key + crestAt(id, 60, 13, 20, houses, '#3a3328');
  }

  // Godric's t1: the brass glass in a niche along the wall (OotP 28), the stone round it, the frame standing on the sill
  function nicheRound(id) { return wallOf(id, 168) + archOf(id); }
  // the coursed stone behind the niches, w wide from x -24 (one niche's 168, or the hall's four)
  function wallOf(id, w) {
    let s = `<rect x="-24" y="-22" width="${w}" height="274" fill="url(#stone${id})"/>`;
    for (let y = -8, r = 0; y < 252; y += 14, r++) {
      s += `<path d="M-24,${y} H${w - 24}" stroke="#3a3328" stroke-width="0.4" opacity="0.6"/>`;
      for (let x = -24 + (r % 2) * 13; x < w - 24; x += 26) s += `<path d="M${x},${y} V${y + 14}" stroke="#3a3328" stroke-width="0.4" opacity="0.6"/>`;
    }
    return s;
  }
  function archOf(id) {
    const arch = 'M0,233 V44 C0,6 28,-10 60,-10 C92,-10 120,6 120,44 V233 Z';
    return `<path d="${arch}" fill="url(#niche${id})" stroke="#3a3328" stroke-width="0.9"/>
      <path d="M52,-21 H68 L66,-8 H54 Z" fill="#9a8f7c" stroke="#3a3328" stroke-width="0.5"/>
      <rect x="-8" y="232" width="136" height="10" fill="#9a8f7c" stroke="#3a3328" stroke-width="0.5"/>
      <ellipse cx="60" cy="233" rx="50" ry="2.2" fill="#0d0a06" opacity="0.55"/>`;
  }

  function svg(o = {}) {
    const id = o.id || 'h' + (++n), houses = o.houses && o.houses.length ? o.houses : ['lion'];
    const fr = o.frame === 'oak' ? frameOak : o.frame === 'niche' ? frameNiche : frameBrass;
    const body = glassBody(id, o, houses, (o.slips || []).filter(x => !x.back), fr);
    if (o.niche && fr !== frameNiche)
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -22 168 274">${defs(id)}<g filter="url(#wc${id})">${nicheRound(id)}${body}</g></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 240">${defs(id)}<g filter="url(#wc${id})">${body}</g></svg>`;
  }
  // the glass in its frame, in the glass's own units: the bulbs, their stones and the frame round them
  function glassBody(id, o, houses, slips, fr) {
    const full = o.full || 1000, h = heap(id, slips, houses, full), path = bulbPath();
    const inner = `<path d="${path}" fill="#2a2016" opacity="0.35"/>
      <g clip-path="url(#bulb${id})">${topBulb(o.top, houses)}${h.svg}${shower(o.falling, h.topY)}${rise(o.rising, h.topY)}</g>
      <path d="${path}" fill="url(#glass${id})"/>
      <g filter="url(#wob${id})"><path d="${path}" fill="none" stroke="#120d08" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M${CX - 22},${TOP + 14} C${CX - 26},${TOP + 30} ${CX - 18},${TOP + 52} ${CX - 8},${NECK - 10}" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.45"/>
      <path d="M${CX - 24},${BOT - 50} C${CX - 30},${BOT - 34} ${CX - 26},${BOT - 18} ${CX - 18},${BOT - 8}" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.35"/></g>`;
    return fr(id, inner, slips, houses);
  }

  // Q25 answered 25.1: the entrance hall's four glasses, each in its niche along the one wall, each its own house's
  const HALL = ['lion', 'badger', 'eagle', 'snake'], PITCH = 168;
  const ownOf = (houses) => sl => sl.house || houses[0];
  function hall(o = {}) {
    const id = o.id || 'w' + (++n), houses = o.houses && o.houses.length ? o.houses : ['lion'];
    const order = o.order || HALL, own = ownOf(houses), slips = (o.slips || []).filter(x => !x.back);
    const glasses = order.map((h, i) => {
      const mine = { full: o.full, top: o.top, falling: o.falling && o.falling.house === h ? o.falling : null };
      return `<g transform="translate(${i * PITCH} 0)">${archOf(id)}${glassBody(id, mine, [h], slips.filter(s => own(s) === h), frameBrass)}</g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -22 ${PITCH * order.length} 274">${defs(id)}<g filter="url(#wc${id})">${wallOf(id, PITCH * order.length)}${glasses}</g></svg>`;
  }

  // the house cup's crest on a stand-in cup (the cup itself is Objects', from req 48's trophies sheet): the crest as
  // built, engraved in the gold, the boys' houses' quarters enamelled; the year engraved on the foot, their names under
  // the year's cup (req 306, the Curator's: Objects' trophies sheet, rank 1, `castle/trophy-cup-1.jpg`, a Sheffield
  // two-handled cup and cover of 1859 to 1860): the thistle body, its belly chased in a band of scrolls and flowers and
  // its neck plain where the light pools, the handles lopped branches rising from the belly to the lip, a domed cover,
  // a knopped stem and a spreading foot scrolled and beaded. Named out: the angler finial and the angling scene; the
  // finial is ours, a little silver flame (Lumos), and the front's empty cartouche carries the crest, the boys' houses
  // enamelled. The year in spaced capitals, pale on an ebonised plinth, set on its curve (`castle/engraved-lettering-
  // 1.jpg`, its words out); under the lip a row of the castle's own marks (`castle/hallmark-1.jpg`, as marks only):
  // a tower, the H, the year's letter, a star. Silver, as the precedent and the trophy room's cups (PS 9, "winked
  // silver and gold"); metal 'gold' or 'parcel' (silver, the rims, beads, cartouche and flame gilt) for the question.
  // cover: 'on' (the cup as it stands on the shelf), 'lifted' (at the leaving feast, while the gems pour into its
  // mouth) or 'off'; by default lifted when gems are given, else on. age 0..1: faded means old (req 279, the Curator's
  // advisory; Magic's req 280): the oldest year's cup the dullest, its silver greyed and warm with tarnish.
  function cup(o = {}) {
    if (o.form === 'stand-in') return standIn(o);
    const id = o.id || 'c' + (++n), houses = o.houses && o.houses.length ? o.houses : ['lion'], plain = o.plain;
    const metal = o.metal || 'silver', age = Math.max(0, Math.min(1, o.age || 0));
    const cover = o.cover || (o.gems && o.gems.length ? 'lifted' : 'on');
    const year = o.year || '2026 – 2027', letter = o.letter || 'a';
    const SIL = ['#5d6267', '#c9ced3', '#ffffff', '#aab0b6', '#71767c', '#c4c9ce', '#53575c'];
    const GLD = ['#6e4f1c', '#d8b25c', '#fff1c2', '#c49a48', '#7a5a22', '#d4ad5e', '#5a3f14'];
    const body = metal === 'gold' ? GLD : SIL, trim = metal === 'silver' ? SIL : GLD;
    const ink = metal === 'gold' ? '#3e2c10' : '#2a2e33', deep = metal === 'gold' ? '#4a3510' : '#3a3f45';
    const grad = (k, c) => `<linearGradient id="${k}${id}" x1="0" y1="0" x2="1" y2="0">${[0, 0.16, 0.3, 0.46, 0.7, 0.88, 1].map((t, i) => `<stop offset="${t}" stop-color="${c[i]}"/>`).join('')}</linearGradient>`;
    const sat = (1 - 0.7 * age).toFixed(3), dim = (1 - 0.42 * age).toFixed(3), warm = (0.12 * age).toFixed(3);
    const extra = `<defs>${grad('cb', body)}${grad('ct', trim)}
      <linearGradient id="eb${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26302b"/><stop offset="0.5" stop-color="#121815"/><stop offset="1" stop-color="#070a09"/></linearGradient>
      <filter id="age${id}"><feColorMatrix type="saturate" values="${sat}"/>
        <feComponentTransfer><feFuncR type="linear" slope="${dim}" intercept="${warm}"/><feFuncG type="linear" slope="${dim}" intercept="${(0.75 * warm).toFixed(3)}"/><feFuncB type="linear" slope="${dim}" intercept="${(0.35 * warm).toFixed(3)}"/></feComponentTransfer></filter>
      <path id="yr${id}" d="M31,153.6 Q60,156.4 89,153.6"/></defs>`;
    // the body: a thistle, bulb below and a tall plain neck flaring to the lip
    const bowl = 'M54,120 C40,119 34,112 35,103 C36,95 40,90 40,86 C41,72 39,60 34,50 H86 C81,60 79,72 80,86 C80,90 84,95 85,103 C86,112 80,119 66,120 Z';
    const R = rnd(306);
    // the chased band round the belly: raised scrolls and leaves, bright on their crowns and dark in the ground between
    let chase = `<path d="M30,91 C50,93.6 70,93.6 90,91 V121 H30 Z" fill="${deep}" opacity="0.42"/>`;
    for (const [y0, off] of [[97.5, 0], [104.5, 2.6], [111.5, 0]]) for (let x = 31 + off; x < 90; x += 5.2) {
      const s = (Math.round((x - off) / 5.2) + (off ? 1 : 0)) % 2 ? 1 : -1, y = y0 + (R() - 0.5) * 1.6, k = 0.85 + R() * 0.3;
      chase += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * k)} ${f(k)})"><path d="M-2.6,1.8 C-3,-1.6 0,-3.4 2.2,-2 C3.6,-1 3,1.2 1.4,1.1 C0.2,1 0.2,-0.4 1.2,-0.6" fill="url(#cb${id})" stroke="${ink}" stroke-width="0.32"/>
        <path d="M-2.4,1.6 C-1.6,2.8 0.6,3 1.6,2.2" fill="none" stroke="${ink}" stroke-width="0.3"/><path d="M-1.8,-1 C-1,-2.2 0.6,-2.6 1.6,-1.8" fill="none" stroke="#ffffff" stroke-width="0.4" opacity="0.7"/></g>`;
    }
    const bead = (y, x1, x2, r, step) => { let s = ''; for (let x = x1; x <= x2; x += step) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#ct${id})" stroke="${ink}" stroke-width="0.2"/>`; return s; };
    // a handle: a lopped branch from the belly to the lip, bark streaks along it and the stubs of its twigs
    const branch = s => {
      const X = x => f(60 + s * (x - 60)), d = `M${X(37)},101 C${X(22)},98 ${X(13)},86 ${X(14)},72 C${X(15)},62 ${X(22)},55 ${X(36)},54`;
      const stubs = [[16.6, 88, 13.4, 84.6], [14.6, 66, 12.8, 62.4]].map(([a, b, c, e]) => `<path d="M${X(a)},${b} L${X(c)},${e}" stroke="${ink}" stroke-width="3.4" stroke-linecap="round"/><path d="M${X(a)},${b} L${X(c)},${e}" stroke="url(#cb${id})" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="${X(c)}" cy="${e}" rx="0.9" ry="0.7" fill="${deep}"/>`).join('');
      return `${stubs}<path d="${d}" fill="none" stroke="${ink}" stroke-width="5.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#cb${id})" stroke-width="4" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="${deep}" stroke-width="0.4" stroke-dasharray="3 2.2 1.4 2.6" transform="translate(${f(s * 0.8)} 0.4)"/>`;
    };
    // the cartouche on the front: a scrolled frame, the crest inside it
    const cart = `<path d="M47,58 C47,55 50,56 52,55 C55,53 58,55 60,53 C62,55 65,53 68,55 C70,56 73,55 73,58 C75,64 72,70 73,76 C74,80 70,82 66,82 C63,82 61,84 60,86 C59,84 57,82 54,82 C50,82 46,80 47,76 C48,70 45,64 47,58 Z" fill="none" stroke="url(#ct${id})" stroke-width="1.6"/>
      <path d="M47,58 C47,55 50,56 52,55 C55,53 58,55 60,53 C62,55 65,53 68,55 C70,56 73,55 73,58 C75,64 72,70 73,76 C74,80 70,82 66,82 C63,82 61,84 60,86 C59,84 57,82 54,82 C50,82 46,80 47,76 C48,70 45,64 47,58 Z" fill="none" stroke="${ink}" stroke-width="0.35"/>`;
    const crest = plain ? crestAt(id, 60, 69, 22, [], ink) : crestAt(id, 60, 69, 22, houses, ink);
    // the castle's own marks: a tower, the H, the year's letter, a star; punched under the lip
    const punch = (x, inner) => `<g transform="translate(${x} 61)"><path d="M-1.15,-1.1 H1.15 V0.45 Q0,1.55 -1.15,0.45 Z" fill="${deep}" opacity="0.75"/>${inner}</g>`;
    const marks = punch(74.4, '<path d="M-0.7,0.6 V-0.6 H-0.45 V-0.9 H-0.15 V-0.6 H0.15 V-0.9 H0.45 V-0.6 H0.7 V0.6 Z" fill="#e8ebee"/>')
      + punch(77, '<path d="M-0.6,-0.8 V0.7 M0.6,-0.8 V0.7 M-0.6,0 H0.6" stroke="#e8ebee" stroke-width="0.3"/>')
      + punch(79.6, `<text x="0" y="0.6" text-anchor="middle" font-family="Georgia, serif" font-size="1.9" fill="#e8ebee">${letter}</text>`)
      + punch(82.2, '<path d="M0,-0.9 L0.25,-0.2 L0.9,-0.2 L0.4,0.2 L0.6,0.8 L0,0.4 L-0.6,0.8 L-0.4,0.2 L-0.9,-0.2 L-0.25,-0.2 Z" fill="#e8ebee"/>');
    // the cover: a domed lid on its rim, a second small dome, and the flame
    const lid = `<path d="M33,49.6 C34,39 46,34.6 60,34.6 C74,34.6 86,39 87,49.6 Z" fill="url(#cb${id})" stroke="${ink}" stroke-width="0.6"/>
      <ellipse cx="60" cy="49.6" rx="27" ry="2.6" fill="url(#ct${id})" stroke="${ink}" stroke-width="0.5"/>
      <path d="M38,45 C42,41 48,39 52,40 M82,45 C78,41 72,39 68,40" fill="none" stroke="${deep}" stroke-width="0.6"/>
      <path d="M49,36.2 C50,31 54,29 60,29 C66,29 70,31 71,36.2 Z" fill="url(#cb${id})" stroke="${ink}" stroke-width="0.5"/>
      <ellipse cx="60" cy="28.6" rx="3.4" ry="1.3" fill="url(#ct${id})" stroke="${ink}" stroke-width="0.4"/>
      <path d="M60,16 C61.6,19.6 63.6,21.6 63,24.6 C62.6,26.8 61.2,27.8 60,27.8 C58.8,27.8 57.4,26.8 57,24.6 C56.6,22.4 58.6,21.4 58.4,19 C59.4,20.2 59.8,18.4 60,16 Z" fill="url(#ct${id})" stroke="${ink}" stroke-width="0.4"/>`;
    const lidAt = cover === 'on' ? lid : cover === 'lifted' ? `<g transform="translate(9 -24) rotate(8 60 49)">${lid}</g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">${defs(id)}${extra}
      <g filter="url(#age${id})"><g filter="url(#wc${id})">
      <path d="M26,147 V155.4 A34,4.4 0 0 0 94,155.4 V147 Z" fill="url(#eb${id})" stroke="#050706" stroke-width="0.5"/>
      <ellipse cx="60" cy="147" rx="34" ry="3.6" fill="#1f2924" stroke="#050706" stroke-width="0.5"/>
      <path d="M27,149.8 A33,4 0 0 0 93,149.8" fill="none" stroke="#3a4640" stroke-width="0.4"/>
      <text font-family="'IM Fell English SC', Georgia, serif" font-size="4.6" letter-spacing="1.1" fill="#d6dad4" opacity="0.92"><textPath href="#yr${id}" startOffset="50%" text-anchor="middle">${year}</textPath></text>
      ${branch(-1)}${branch(1)}
      <path d="M35,146 C35,141 42,138.6 50,136.6 C54,135.6 55.4,133.4 55.6,131 H64.4 C64.6,133.4 66,135.6 70,136.6 C78,138.6 85,141 85,146 Z" fill="url(#cb${id})" stroke="${ink}" stroke-width="0.6"/>
      <path d="M40,143 c2,-3 6,-3 7,-0.6 c0.6,1.4 -1.4,2 -2,0.8 M80,143 c-2,-3 -6,-3 -7,-0.6 c-0.6,1.4 1.4,2 2,0.8 M54,140.4 c2,-1.6 4,-1.6 6,0 c2,-1.6 4,-1.6 6,0" fill="none" stroke="${deep}" stroke-width="0.6"/>
      ${bead(145.6, 36, 84, 0.62, 1.6)}
      <rect x="56" y="120" width="8" height="11" fill="url(#cb${id})" stroke="${ink}" stroke-width="0.5"/>
      <ellipse cx="60" cy="125.4" rx="6.4" ry="2.8" fill="url(#ct${id})" stroke="${ink}" stroke-width="0.5"/>
      ${bead(125.4, 54.4, 65.6, 0.5, 1.4)}
      <path d="${bowl}" fill="url(#cb${id})" stroke="${ink}" stroke-width="0.7"/>
      <clipPath id="bw${id}"><path d="${bowl}"/></clipPath>
      <g clip-path="url(#bw${id})">${chase}<path d="M30,90 C50,92.6 70,92.6 90,90" fill="none" stroke="url(#ct${id})" stroke-width="1.3"/>${bead(89.8, 40.6, 79.4, 0.5, 1.5)}</g>
      ${cart}${crest}${marks}
      <ellipse cx="60" cy="50" rx="26" ry="2.8" fill="${cover === 'on' ? deep : '#1c1f22'}" stroke="url(#ct${id})" stroke-width="1.4"/>
      ${cover === 'on' ? '' : pour(o.gems, houses, 50, 22)}${lidAt}</g></g></svg>`;
  }
  // the stand-in of Q22's sheets, kept so those sheets still draw as sent: cup({ form: 'stand-in' })
  function standIn(o) {
    const id = o.id || 'c' + (++n), houses = o.houses && o.houses.length ? o.houses : ['lion'], plain = o.plain;
    const body = 'M30,20 H90 C90,62 78,82 64,88 V104 C64,110 76,112 80,118 H40 C44,112 56,110 56,104 V88 C42,82 30,62 30,20 Z';
    const handles = 'M30,28 C14,28 12,56 34,62 M90,28 C106,28 108,56 86,62';
    const crest = plain ? crestAt(id, 60, 48, 34, [], '#5a3d12') : crestAt(id, 60, 48, 34, houses, '#5a3d12');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">${defs(id)}
      <g filter="url(#wc${id})"><path d="${handles}" fill="none" stroke="url(#post${id})" stroke-width="5" stroke-linecap="round"/>
      <path d="${body}" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.8"/><ellipse cx="60" cy="20" rx="30" ry="4" fill="#7a5a22" stroke="#3e2c10" stroke-width="0.6"/>
      ${crest}${pour(o.gems, houses)}
      <rect x="36" y="118" width="48" height="14" fill="url(#brass${id})" stroke="#3e2c10" stroke-width="0.6"/>
      <text x="60" y="126.5" text-anchor="middle" font-family="Georgia, serif" font-size="5.2" fill="#3e2c10">${o.year || '2026 – 2027'}</text>
      <path d="M44,129.5 H56 M64,129.5 H76" stroke="#3e2c10" stroke-width="0.5" opacity="0.7"/></g></svg>`;
  }

  // the cross little clink (Godric's t2): two small glass notes a semitone apart, short and a little sharp
  function clink(audio) {
    if (!audio || !audio.createOscillator) return;
    const t = audio.currentTime, out = audio.createGain();
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.16, t + 0.004); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    out.connect(audio.destination);
    for (const [hz, d] of [[2637, 0], [2794, 0.045]]) {
      const o = audio.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(hz, t + d);
      o.connect(out); o.start(t + d); o.stop(t + d + 0.2);
    }
  }

  // the glass, live: the still glass drawn once, and the stones in flight on a light layer above it, so a fall
  // redraws only a few stones a frame (the wash filter is drawn once)
  function mount(el, o = {}) {
    let slips = (o.slips || []).slice(), busy = Promise.resolve();
    const houses = o.houses && o.houses.length ? o.houses : ['lion'], full = o.full || 1000, id = 'm' + (++n);
    const box = o.niche ? '-24 -22 168 274' : '0 0 120 240';
    el.style.position = el.style.position || 'relative';
    el.innerHTML = `<div></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none">
      <defs><clipPath id="fly${id}"><path d="${bulbPath()}"/></clipPath></defs><g clip-path="url(#fly${id})"></g></svg>`;
    const still = el.firstChild, fly = el.lastChild.lastChild, own = ownOf(houses);
    const draw = () => { still.innerHTML = svg({ slips, houses, full, niche: o.niche, id }); const v = still.firstChild; v.style.width = '100%'; v.style.height = 'auto'; v.style.display = 'block'; };
    const stones = (pts, most) => Math.max(3, Math.min(most || 24, Math.round(places(1.8).length * pts / full)));
    const play = (ms, frame) => new Promise(done => {
      const t0 = performance.now();
      const step = now => { const at = Math.min(1, Math.max(0, (now - t0) / ms)); fly.innerHTML = frame(at); if (at < 1) requestAnimationFrame(step); else { fly.innerHTML = ''; done(); } };
      requestAnimationFrame(step);
    });
    const topY = () => heap(id, slips.filter(x => !x.back), houses, full).topY;
    // his t1: the slips after the first `seen` land at once, a beat after the glass is drawn, one heavy shower a house
    const jump = seen => {
      let all, by;
      busy = busy.then(() => {
        all = slips; const late = all.slice(seen).filter(x => !x.back);
        by = {}; late.forEach(sl => { const h = own(sl); (by[h] = by[h] || []).push(sl); });
        if (!late.length) return;
        slips = all.slice(0, seen); draw();
        return new Promise(r => setTimeout(r, 450)).then(() => Object.keys(by).reduce((p, h) => p.then(() => {
          const pts = by[h].reduce((s, x) => s + x.points, 0), y = topY();
          return play(1500, at => shower({ house: h, n: stones(pts, 40), at }, y)).then(() => { slips = slips.concat(by[h]); draw(); });
        }), Promise.resolve()));
      }).then(() => { slips = all; draw(); });
      return busy;
    };
    draw();
    if (typeof o.seen === 'number') jump(o.seen);
    return {
      set(next) { slips = next.slice(); draw(); },
      point(sl) {
        const house = own(sl), slow = sl.kind === 'taught' || sl.kind === 'given';
        busy = busy.then(() => play(slow ? 3400 : 1700, at => shower({ house, n: stones(sl.points), slow, at }, topY())))
          .then(() => { slips.push(sl); draw(); });
        return busy;
      },
      back(sl) {
        const house = own(sl), from = topY();
        busy = busy.then(() => {
          const i = slips.findIndex(x => x.kind === sl.kind && x.thing === sl.thing);
          if (i >= 0) slips[i] = Object.assign({}, slips[i], { back: true });
          draw();
          return play(1300, at => rise({ house, n: Math.min(4, stones(sl.points)), at }, from));
        }).then(() => clink(o.audio));
        return busy;
      },
      jump,
    };
  }
  // the hall live (25.1): the wall and its four niches drawn once, and over each niche a glass of its own, mount()
  // as above, so a landing redraws only its own house's glass
  function hallMount(el, o = {}) {
    const houses = o.houses && o.houses.length ? o.houses : ['lion'], order = o.order || HALL, own = ownOf(houses);
    const W = PITCH * order.length, id = 'k' + (++n), pc = v => (v * 100).toFixed(4) + '%';
    el.style.position = el.style.position || 'relative';
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -22 ${W} 274" style="display:block;width:100%;height:auto">${defs(id)}<g filter="url(#wc${id})">${wallOf(id, W)}${order.map((h, i) => `<g transform="translate(${i * PITCH} 0)">${archOf(id)}</g>`).join('')}</g></svg>`
      + order.map((h, i) => `<div style="position:absolute;left:${pc((i * PITCH + 24) / W)};top:${pc(22 / 274)};width:${pc(120 / W)};height:${pc(240 / 274)}"></div>`).join('');
    let all = (o.slips || []).slice();
    const mine = (list, h) => list.filter(s => own(s) === h);
    const seenOf = h => typeof o.seen === 'number' ? mine(all.slice(0, o.seen), h).length : undefined;
    const glass = {};
    order.forEach((h, i) => { glass[h] = mount(el.children[i + 1], { slips: mine(all, h), houses: [h], full: o.full, audio: o.audio, seen: seenOf(h) }); });
    const to = sl => glass[own(sl)] || glass[order[0]];
    return {
      glass,
      set(next) { all = next.slice(); order.forEach(h => glass[h].set(mine(all, h))); },
      point(sl) { all.push(sl); return to(sl).point(Object.assign({ house: own(sl) }, sl)); },
      back(sl) { return to(sl).back(Object.assign({ house: own(sl) }, sl)); },
      jump(seen) { return Promise.all(order.map(h => glass[h].jump(mine(all.slice(0, seen), h).length))); },
    };
  }

  // the year's gems poured into the cup at the leaving feast (Magic's against the year, req 233), heaped in its mouth,
  // each in its earner's house, as many as the year's points give, up to a brimming mound
  function pour(gems, houses, y = 20, hw = 27) {
    if (!gems || !gems.length) return '';
    const total = gems.reduce((t, x) => t + (x.back ? 0 : x.points), 0), k = Math.max(12, Math.min(140, Math.round(total / 6)));
    const cum = []; let c = 0; for (const g of gems) if (!g.back) { cum.push([c + g.points, g.house || houses[0]]); c += g.points; }
    const R = rnd(53); let s = '', j = 0;
    for (let i = 0; i < k; i++) {
      const v = (i + 0.5) / k * total; while (j < cum.length - 1 && v >= cum[j][0]) j++;
      const u = R() * 2 - 1, h = 9 * Math.pow(1 - Math.abs(u), 0.7) * Math.min(1, k / 80);
      s += stone(60 + u * hw, y - R() * h, 1.7 * (0.8 + 0.4 * R()), cum[j][1], R);
    }
    return s;
  }

  const api = { svg, cup, mount, hall, hallMount, clink, STONE, NAME, HALL, PITCH };
  if (typeof window !== 'undefined') window.LumosHourglass = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
