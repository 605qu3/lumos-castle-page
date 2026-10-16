// The Lumos icon, finished: four wands raised together from below, joined by one glowing orb, in the castle's
// ink and wash drawn in code (Godric, Q4 7.01 pm, Q5 7.14 pm, Q6 7.26 pm, 11 October 2026). One drawing makes
// every state: lit (Lumos), out (Nox, smoke rising where the orb was) and each frame of the opening, so no part
// can move or change between them. The woods are placeholders until each of the four builds their own wand at
// Ollivander's (Charms's ground); replace WOODS and nothing else.
//
// LumosIcon.svg({ rise, k, nox, watermark, square })
//   rise       four numbers 0..1, each wand's rise (1 in place); default all 1
//   k          the light 0..1 (0 unlit, 1 Lumos); default 1
//   nox        true: out, with the smoke where the orb was (k is then 0)
//   watermark  true (or a strength, 0..1): the Hogwarts crest faint in the paper grain, shown by the light (the start screen at 300 px;
//              Godric's touch on Q6); default false
//   square     true: full bleed, no rounded corners (an app-icon PNG, which the phone masks itself)
//   flare      0..1: the wider glow of the hold (below); 0 at rest
//   lion       'drawn' (the default since Q18's answer, 12 October 2026): the four passed drawings (Q15, Q16), each
//              quarter in its house's colours as the tint comes; the earlier crests kept for their sheets: 'curl'
//              (Godric, Q9: a curled mane, a tufted tail), 'flame' (as first sent), 'lean', 'lean-bare', 'lean-wire' (Q13)
//   stir       0..1: the beasts' stir at the hold's peak; 0 at rest
//   tint       0..1: the house colours (the 'drawn' crest only), at the hold's peak; 0 at rest
// LumosIcon.FRAMES the opening's eight frames as [rise, k, label]; frame 8 is Lumos exactly.
// LumosIcon.armHold(svgElement) the start screen's hold on the orb; holdAt(t) any moment of it.
// LumosIcon.open(box, options, done) plays the opening into box; openAt(t) any moment of it.
(function () {
  const OX = 32, OY = 17;
  const HS = [[7, 55], [21, 59], [43, 58], [57, 54]], TDX = [-4.6, -1.6, 1.6, 4.6], TDY = [6.2, 5.4, 5.6, 6.6];
  const WS = [3.7, 3.3, 3.5, 3.2];
  const WOODS = [
    { wood: '#5b3a20', band: '#d9b779', handle: 'bands' },
    { wood: '#c9b08a', band: '#7a5a3a', handle: 'flare' },
    { wood: '#8a4a32', band: '#e2c48f', handle: 'spiral' },
    { wood: '#a7783f', band: '#3b2717', handle: 'rings' },
  ];
  const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const out = a => '#' + a.map(c => Math.min(255, Math.round(c)).toString(16).padStart(2, '0')).join('');
  const shade = (c, f) => out(hex(c).map(x => x * f));
  // the wash mutes each wood toward a grey-brown, as the castle's wash does
  const mute = c => { const a = hex(c), m = (a[0] + a[1] + a[2]) / 3; return out(a.map(x => x * 0.62 + m * 0.38)); };

  function defs(id) {
    return `<defs><clipPath id="clip${id}"><rect width="64" height="64" rx="14"/></clipPath>
    <radialGradient id="glow${id}"><stop offset="0" stop-color="#fffbea"/><stop offset="0.18" stop-color="#ffeab0" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="#e9b86a" stop-opacity="0.36"/><stop offset="1" stop-color="#e9b86a" stop-opacity="0"/></radialGradient>
    <radialGradient id="orb${id}" cx="0.4" cy="0.36" r="0.66"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#fff5d2"/><stop offset="1" stop-color="#f2c76f"/></radialGradient>
    <radialGradient id="spill${id}" gradientUnits="userSpaceOnUse" cx="32" cy="17" r="30"><stop offset="0" stop-color="#ffe7a6" stop-opacity="0.75"/>
      <stop offset="0.45" stop-color="#ffd27a" stop-opacity="0.25"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <radialGradient id="wash${id}" cx="0.5" cy="0.25" r="0.8"><stop offset="0" stop-color="#6a5130"/><stop offset="0.6" stop-color="#2e241a" stop-opacity="0.4"/><stop offset="1" stop-color="#15100b" stop-opacity="0"/></radialGradient>
    <radialGradient id="reveal${id}" gradientUnits="userSpaceOnUse" cx="32" cy="17" r="44"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0.45"/></radialGradient>
    <mask id="mreveal${id}"><rect width="64" height="64" fill="url(#reveal${id})"/></mask>
    <linearGradient id="smoke${id}" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="2"><stop offset="0" stop-color="#c9c0b0" stop-opacity="0.7"/><stop offset="1" stop-color="#c9c0b0" stop-opacity="0"/></linearGradient>
    <linearGradient id="night${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e241a"/><stop offset="1" stop-color="#15100b"/></linearGradient>
    <linearGradient id="dark${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1712"/><stop offset="1" stop-color="#0c0a08"/></linearGradient>
    <filter id="wob${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="1" seed="4" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="0.45" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="wc${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0.55 0 0 0 0.62  0.55 0 0 0 0.62  0.55 0 0 0 0.62  0 0 0 0 1" result="g"/>
      <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/></filter>
    <filter id="paper${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="2" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0.25 0 0 0 0.86  0.25 0 0 0 0.86  0.25 0 0 0 0.86  0 0 0 0 1" result="g"/>
      <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/></filter>
  </defs>`;
  }

  // How each wood the bench offers looks in the icon (Q23 answered 1, Godric, 13 October 2026, 7.31 am: wood and
  // length, each of the four keeping their own handle, so fromBuilds's style 1 is the icon's): the seven woods of
  // Charms's bench (page/charms/ollivander-test.html, its WOODS; the canon is Charms's, docs/archive/charms-to-2026-10-12.md).
  // wood the colour, grainC (and rayC) the figure's, grain its kind, sheen 0..1 the polish on the lit side, band the
  // trim that suits it, handle the wood's own handle (Q23's option 2 only). Inert until a build is passed to svg().
  const LOOK = {
    holly:    { wood: '#dccdab', grainC: '#ae9a70', grain: 'plain',    sheen: 0.35, band: '#5a3d22', handle: 'plain' },
    willow:   { wood: '#cfb88f', grainC: '#8f7550', grain: 'straight', sheen: 0.2,  band: '#4e3620', handle: 'flare' },
    beech:    { wood: '#c99d7c', grainC: '#8a5a40', grain: 'fleck',    sheen: 0.25, band: '#4a2e1c', handle: 'rings' },
    maple:    { wood: '#ddc597', grainC: '#f6e6c2', grain: 'curl',     sheen: 0.3,  band: '#5c4026', handle: 'spiral' },
    oak:      { wood: '#a57c4d', grainC: '#5a3f22', rayC: '#e2c793', grain: 'open', sheen: 0.15, band: '#e0c48c', handle: 'bands' },
    mahogany: { wood: '#7c3726', grainC: '#b0634a', grain: 'ribbon',   sheen: 0.4,  band: '#e2c48f', handle: 'cap' },
    ebony:    { wood: '#3a2b22', grainC: '#5e4b3e', grain: 'polished', sheen: 1, band: '#d9b779', handle: 'knob' },
  };
  // builds: the four's chosen wands as the bench keeps them ({ wood, len, ... }), in the icon's order; style 1 the
  // wood's colour, grain and sheen and the build's length, each keeping their own handle; 2 the same with the wood's
  // own handle; 3 the colour alone, every wand today's length. Gives svg()'s woods.
  function fromBuilds(builds, style = 1) {
    return builds.map(b => {
      const L = b && LOOK[b.wood];
      if (!L) return {};
      const e = { wood: L.wood, band: L.band };
      if (style !== 3) Object.assign(e, { grain: L.grain, grainC: L.grainC, rayC: L.rayC, sheen: L.sheen, len: b.len });
      if (style === 2) e.handle = L.handle;
      return e;
    });
  }
  // the bench's store (Charms's, page/charms/ollivander-test.html, its KEY; read here, never written): one record per
  // wizard, '1' to '4', each with the wand that chose them as `chosen` ({ wood, len, flex, core }). Wizard n holds the
  // icon's wand n, left to right. Gives fromBuilds's builds, null where a wizard has no wand yet (their placeholder
  // stays), or null for all if no one has built one.
  const BENCH_KEY = 'lumos.charms.ollivander';
  function fromStore(store) {
    if (store === undefined) { try { store = JSON.parse(localStorage.getItem(BENCH_KEY) || '{}'); } catch (e) { store = {}; } }
    const builds = ['1', '2', '3', '4'].map(k => (store && store[k] && store[k].chosen && LOOK[store[k].chosen.wood]) ? store[k].chosen : null);
    return builds.some(Boolean) ? builds : null;
  }
  // a wood's figure along the wand, inside its outline: P and w as in wand(), H the handle's end, f the light's shade
  function grain(wd, P, w, H, f, k, i) {
    const hw = t => t < H ? w * (0.72 - 0.12 * t / H) : w * (0.6 - 0.43 * (t - H) / (1 - H));
    let r = 7 + i * 13;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    const at = (t, q) => P(t, q * hw(t));
    const streak = (q, t0, t1, col, sw, op) => {
      const ts = [t0, ...(t0 < H && H < t1 ? [H] : []), t1];
      return `<path d="M${ts.map(t => at(t, q)).join(' L')}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-opacity="${op}" stroke-linecap="round"/>`;
    };
    const dash = (t, q, dt, col, sw, op) => `<path d="M${at(t, q)} L${at(t + dt, q)}" stroke="${col}" stroke-width="${sw}" stroke-opacity="${op}" stroke-linecap="round"/>`;
    const c = shade(mute(wd.grainC), f);
    let s = '';
    if (wd.grain === 'plain') s += streak(0.15, 0.06, 0.9, c, 0.08, 0.35);
    if (wd.grain === 'straight') for (const q of [-0.5, -0.15, 0.2, 0.55]) s += streak(q, 0.03, 0.95, c, 0.09, 0.6);
    if (wd.grain === 'fleck') { s += streak(-0.1, 0.05, 0.9, c, 0.07, 0.3); for (let j = 0; j < 18; j++) s += dash(0.05 + rnd() * 0.85, rnd() * 1.4 - 0.7, 0.03, c, 0.12, 0.55); }
    if (wd.grain === 'curl') for (let t = 0.05; t < 0.92; t += 0.045) s += `<path d="M${at(t, -0.8)} L${at(t + 0.012, 0.8)}" stroke="${c}" stroke-width="0.11" stroke-opacity="0.45"/>`;
    if (wd.grain === 'open') {
      for (const q of [-0.45, 0.05, 0.5]) s += streak(q, 0.03, 0.94, c, 0.12, 0.65);
      const ray = shade(mute(wd.rayC), f);
      for (let j = 0; j < 8; j++) s += dash(0.06 + rnd() * 0.8, rnd() * 1.2 - 0.6, 0.025, ray, 0.16, 0.6);
    }
    if (wd.grain === 'ribbon') for (const q of [-0.3, 0.35]) s += streak(q, 0.04, 0.93, c, w * 0.2, 0.35);
    if (wd.grain === 'polished') s += streak(-0.2, 0.06, 0.9, c, 0.06, 0.3);
    if (wd.sheen) s += streak(0.42, 0.08, 0.95, '#fff3d6', (0.12 + 0.14 * wd.sheen).toFixed(3), (wd.sheen * (0.35 + 0.65 * k)).toFixed(3));
    return s;
  }

  // one wand, in place; the caller moves it for the opening. k is the light on it. A wood with a length (7 to 16
  // inches, the bench's) reaches that far into the tile, its tip always at the orb: 7 is three quarters of today's.
  function wand(id, i, k, W = WOODS) {
    const x2 = OX + TDX[i], y2 = OY + TDY[i], w = WS[i], src = { ...WOODS[i], ...W[i] };
    const sl = src.len ? 0.75 + 0.25 * Math.min(1, Math.max(0, (src.len - 7) / 9)) : 1;
    const x1 = src.len ? x2 + (HS[i][0] - x2) * sl : HS[i][0], y1 = src.len ? y2 + (HS[i][1] - y2) * sl : HS[i][1];
    const wd = { ...src, wood: mute(src.wood), band: mute(src.band) };
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const P = (t, q) => `${(x1 + dx * t + nx * q).toFixed(2)},${(y1 + dy * t + ny * q).toFixed(2)}`;
    const f = 0.7 + 0.3 * k, H = 0.3;
    const body = `M${P(0, w * 0.72)} L${P(H, w * 0.6)} L${P(1, w * 0.17)} L${P(1, -w * 0.17)} L${P(H, -w * 0.6)} L${P(0, -w * 0.72)} Z`;
    const band = shade(wd.band, f);
    const line = (t, q1, q2, col, sw) => `<path d="M${P(t, q1)} L${P(t, q2)}" stroke="${col}" stroke-width="${sw}"/>`;
    let s = `<path d="${body}" fill="${shade(wd.wood, f)}" stroke="#1e130a" stroke-width="${w * 0.14}" stroke-linejoin="round"/>`;
    if (wd.grain) s += grain(wd, P, w, H, f, k, i);
    if (wd.handle === 'plain') s += line(H, w * 0.6, -w * 0.6, '#1e130a', w * 0.08);
    if (wd.handle === 'cap') s += `<path d="M${P(0, w * 0.72)} L${P(0.07, w * 0.7)} L${P(0.07, -w * 0.7)} L${P(0, -w * 0.72)} Z" fill="${band}"/>` + line(H, w * 0.62, -w * 0.62, band, w * 0.12);
    if (wd.handle === 'knob') s += `<circle cx="${P(0, 0).split(',')[0]}" cy="${P(0, 0).split(',')[1]}" r="${(w * 0.85).toFixed(2)}" fill="${band}" stroke="#1e130a" stroke-width="${w * 0.12}"/>` + line(H, w * 0.62, -w * 0.62, band, w * 0.14);
    if (wd.handle === 'bands') s += line(H, w * 0.66, -w * 0.66, band, w * 0.26) + line(H * 0.55, w * 0.7, -w * 0.7, band, w * 0.2);
    if (wd.handle === 'flare') s += `<path d="M${P(0, w * 0.95)} L${P(0.1, w * 0.66)} L${P(0.1, -w * 0.66)} L${P(0, -w * 0.95)} Z" fill="${shade(wd.wood, f * 0.8)}" stroke="#1e130a" stroke-width="${w * 0.12}"/>` + line(H, w * 0.64, -w * 0.64, band, w * 0.22);
    if (wd.handle === 'spiral') for (let t = 0.02; t < H - 0.05; t += 0.055) s += `<path d="M${P(t, w * 0.68)} L${P(t + 0.075, -w * 0.68)}" stroke="${band}" stroke-width="${w * 0.16}"/>`;
    if (wd.handle === 'rings') { for (const t of [0.08, 0.16, 0.24]) s += line(t, w * 0.7, -w * 0.7, band, w * 0.14); s += line(H, w * 0.64, -w * 0.64, band, w * 0.24); }
    if (k > 0) s += `<path d="${body}" fill="url(#spill${id})" opacity="${k}"/>`;
    // the ink: a fine outline with a little wobble, and hatching on the shaded side
    let hatch = '';
    for (let t = 0.36; t < 0.92; t += 0.07) { const q = w * (0.6 - 0.43 * (t - 0.3) / 0.7); hatch += `M${P(t, -q * 0.8)} L${P(t + 0.025, -q * 0.25)} `; }
    const ink = `<path d="${body}" fill="none" stroke="#120d08" stroke-width="0.36" stroke-linejoin="round"/>
      <path d="${hatch}" stroke="#120d08" stroke-width="0.18" stroke-opacity="0.6"/>`;
    // the wash and the wobble are filtered inside the wand's own group, so they travel with it as it rises
    return `<g filter="url(#wc${id})">${s}</g><g filter="url(#wob${id})">${ink}</g>`;
  }
  function moved(i, rise) {
    const tx = OX + TDX[i], ty = OY + TDY[i], dx = HS[i][0] - tx, dy = HS[i][1] - ty, L = Math.hypot(dx, dy), d = (1 - rise) * 46;
    return [(dx / L * d).toFixed(2), (dy / L * d).toFixed(2)];
  }
  function orb(id, k) {
    if (k <= 0) return '';
    const g = Math.min(1, k * 1.3);
    return `<circle cx="${OX}" cy="${OY}" r="${21 * (0.35 + 0.65 * k)}" fill="url(#glow${id})" opacity="${0.85 * g}"/>
    <circle cx="${OX}" cy="${OY}" r="${9 * (0.4 + 0.6 * k)}" fill="url(#glow${id})"/>
    <circle cx="${OX}" cy="${OY}" r="${5 * Math.max(0.3, k)}" fill="url(#orb${id})"/>
    ${k >= 0.6 ? `<circle cx="${OX - 1.5}" cy="${OY - 1.6}" r="1.4" fill="#ffffff" opacity="0.9"/>` : ''}`;
  }
  function smoke(id) {
    const x = OX, y = OY;
    return `<path d="M${x},${y + 3} C${x - 2.4},${y} ${x + 2.6},${y - 3} ${x + 0.3},${y - 6.5} C${x - 2},${y - 9.5} ${x + 2.2},${y - 11.5} ${x + 0.4},${y - 15}"
        stroke="url(#smoke${id})" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M${x + 0.5},${y + 2} C${x + 2.6},${y - 1} ${x + 0.2},${y - 4} ${x + 2},${y - 8}" stroke="url(#smoke${id})" stroke-width="0.7" fill="none" stroke-linecap="round"/>`;
  }

  // The Hogwarts crest as a watermark: "a lion, an eagle, a badger, and a snake surrounding a large letter H"
  // (the books, B1 ch3; a letter "bearing the Hogwarts crest", B3 ch1). The books place the four around the H and
  // are silent on the rest; the shield's outline and which beast sits where follow the films' look (the lion top
  // left, the snake top right, the badger bottom left, the eagle bottom right). Each sits in open paper between the
  // wands, so the four can be found. Drawn as a paper watermark is made, thinner paper that shows lighter, and shown
  // by the orb's light: brightest near it, gone when the light is out (Godric's touch on Q6: a secret at 300 px).
  // Two layouts of the same drawings: 'icon', the beasts in the open paper between the wands and the H low; 'seal', the
  // letter's seal, the four round a large H at the centre ("surrounding a large letter H", B1 ch3). Each entry is
  // [x, y, scale] in the 64-unit tile.
  const LAYOUT = {
    icon: { lion: [15, 17.5, 1.1], snake: [49, 17, 1], badger: [12.5, 36.5, 1], eagle: [52.5, 37, 0.85], H: [32, 42.5, 1] },
    seal: { lion: [17, 20, 1.65], snake: [45.5, 19.5, 1.45], badger: [19, 45.5, 1.5], eagle: [45, 46.5, 1.35], H: [32, 33, 1.9] },
    // the seal without the shield, the four round the H in a ring (an option for the seal, not yet chosen)
    round: { lion: [18, 19.5, 1.6], snake: [47, 19.5, 1.45], badger: [18.5, 47.5, 1.5], eagle: [46.5, 48.5, 1.35], H: [32, 34, 1.9], noShield: true },
  };
  // The beasts redrawn (Godric, Q11 9.22 pm: "The lion is unacceptable- honestly all of the beasts could use a makeover.
  // Don't copy, but do take a look at what Hogwarts Legacy did"; the study is in the handoff). Each beast one silhouette
  // you could cut from paper, lean and true to the animal, every end tapering to a point, turned toward the H; a few
  // grooves inside where the paper is left thick. Drawn in a 100-unit box (each beast's own units, the stir's pivots
  // among them) and set into the crest at 0.16, the old beasts' size. Three treatments of the same drawing:
  // 'lean' the silhouette with its grooves, 'lean-bare' the silhouette alone, 'lean-wire' the outline only, as the
  // wire sewn on a papermaker's mould draws a real watermark.
  // ribbon: a filled shape along a smooth line through pts, its width at each point from w (0 makes a point)
  function ribbon(pts, w) {
    const P = [], W = [], N = 10;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      for (let s = 0; s < N; s++) {
        const t = s / N, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        P.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
        W.push(w[i] + (w[i + 1] - w[i]) * (t2 * (3 - 2 * t)));
      }
    }
    P.push(pts[pts.length - 1]); W.push(w[w.length - 1]);
    const L = [], R = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const h = W[i] / 2;
      L.push(`${(P[i][0] - dy * h).toFixed(2)},${(P[i][1] + dx * h).toFixed(2)}`);
      R.push(`${(P[i][0] + dy * h).toFixed(2)},${(P[i][1] - dx * h).toFixed(2)}`);
    }
    return `<path d="M${L.join(' L')} L${R.reverse().join(' L')} Z"/>`;
  }
  const poly = pts => `<path d="M${pts.map(p => p.join(',')).join(' L')} Z"/>`;
  // a claw: a short hooked point
  const claw = (x, y, a, l) => ribbon([[x, y], [x + Math.cos(a) * l * 0.6, y + Math.sin(a) * l * 0.6], [x + Math.cos(a + 0.5) * l, y + Math.sin(a + 0.5) * l]], [1.8, 1.2, 0]);
  const claws = (x, y, a, l, n = 3) => Array.from({ length: n }, (_, i) => claw(x, y, a + (i - (n - 1) / 2) * 0.45, l)).join('');
  const LEAN = {
    // the lion rampant, facing right toward the H: a lean big cat, a small head with open jaws, the mane in swept
    // pointed locks down the neck, forepaws raised and clawed, one hind leg planted, the tail an S ending in a tuft
    lion: {
      body: [
        ribbon([[36, 70], [41, 57], [49, 45], [58, 35]], [19, 14, 18, 24]),
        ribbon([[57, 37], [62, 27], [65, 21]], [16, 12, 10]),
        poly([[68, 8], [60, 9], [55, 17], [54, 28], [57, 38], [64, 43], [70, 32], [70, 15]]),
        ribbon([[67, 10], [61, 4], [55, 2], [51, 4]], [7, 6, 4, 0]), ribbon([[62, 13], [54, 10], [47, 11], [43, 14]], [8, 7, 5, 0]),
        ribbon([[60, 19], [51, 18], [44, 21], [41, 26]], [9, 8, 5, 0]), ribbon([[60, 25], [51, 27], [46, 32], [45, 38]], [9, 8, 5, 0]),
        ribbon([[61, 31], [54, 36], [51, 42], [52, 48]], [9, 8, 5, 0]), ribbon([[63, 36], [59, 43], [58, 49], [61, 54]], [8, 7, 4, 0]),
        ribbon([[67, 38], [66, 45], [67, 51]], [7, 5, 0]),
        ribbon([[72, 30], [70, 38], [71, 45]], [9, 6, 0]), ribbon([[77, 30], [77, 37], [80, 42]], [7, 5, 0]),
        poly([[63, 10], [71, 6], [77, 7.5], [83, 10.5], [87, 12], [88, 16.5], [87, 20.5], [74, 22.5], [84, 26], [83.5, 30], [77, 32.5], [68, 33], [62, 22]]),
        ribbon([[61, 35], [71, 31], [83, 22]], [13, 8, 5]), claws(83, 22, -0.9, 6),
        ribbon([[59, 44], [69, 48], [81, 43]], [13, 8, 5]), claws(81, 43, -0.5, 6),
        ribbon([[40, 63], [47, 77], [40, 86], [47, 94]], [17, 10, 6, 5]), ribbon([[45, 93], [55, 95]], [6, 3]), claws(55, 95, 0.1, 5),
        ribbon([[45, 69], [58, 75], [60, 85], [70, 83]], [13, 8, 6, 4]), claws(70, 83, -0.4, 5),
      ],
      cuts: [
        ribbon([[55, 35], [56, 44], [52, 52]], [0, 1.8, 0]), ribbon([[36, 58], [44, 62], [46, 72]], [0, 1.8, 0]),
        ribbon([[70, 12.4], [73.5, 11.6], [76.5, 12.8]], [0, 1.8, 0]), ribbon([[87.5, 16.5], [82, 18], [77.5, 20.5]], [0, 1.3, 0]),
        ribbon([[62, 16], [55, 16], [49, 19]], [0, 1.5, 0]), ribbon([[62, 23], [55, 25], [50, 30]], [0, 1.5, 0]), ribbon([[63, 30], [57, 35], [54, 41]], [0, 1.5, 0]),
      ],
      tail: { pivot: [36, 69], body: [ribbon([[37, 70], [25, 73], [16, 61], [20, 45], [14, 32], [17, 22]], [6, 4.5, 4, 3.5, 3, 2.5]),
        ribbon([[17, 23], [12, 15], [8, 9]], [6, 4, 0]), ribbon([[17, 23], [18, 14], [22, 6]], [6, 4, 0]), ribbon([[16, 24], [10, 22], [5, 21]], [4, 3, 0])] },
    },
    // the snake, a broad ribbon rising in an S and turning once on itself, its wedge head facing left, tongue out
    snake: {
      curl: { pivot: [70, 92], body: [
        ribbon([[72, 95], [52, 92], [32, 82], [28, 68], [42, 58], [62, 53], [72, 41], [64, 29], [51, 24]], [0, 6, 9, 11, 4, 11, 11, 9, 7]),
        poly([[52, 20.5], [46, 14.5], [38, 12.5], [29, 14.5], [23, 18.5], [28, 21.5], [38, 23.5], [46, 27.5], [53, 28.5]]),
        ribbon([[24, 20], [17, 21]], [1.4, 1]), ribbon([[17.5, 21], [12, 17]], [1, 0]), ribbon([[17.5, 21], [12, 24]], [1, 0]),
      ] },
      cuts: [ribbon([[46, 60], [62, 55], [69, 43]], [0, 1.6, 0]), ribbon([[35.5, 16.6], [39, 16.4], [41.5, 17.6]], [0, 1.8, 0]), ribbon([[27, 20], [36, 21], [44, 24.5]], [0, 1, 0])],
    },
    // the badger passant, as heralds say: walking, facing right toward the H, one forepaw raised with its long digging
    // claws; low and broad in the back, the long wedge head lifted, the dark stripe through the eye back to the ear,
    // white above it and below; a short pointed tail. On all fours where Legacy's rears: a badger's truest stance.
    badger: {
      body: [
        ribbon([[13, 60], [30, 51], [50, 47.5], [66, 50]], [15, 27, 29, 21]),
        ribbon([[22, 61], [18, 70], [14, 79]], [13, 9, 6]), claws(14, 79, 1.3, 4),
        ribbon([[32, 61], [35, 71], [39, 79]], [13, 9, 6]), claws(39, 79, 0.5, 4),
        ribbon([[58, 58], [59, 69], [62, 79]], [13, 9, 6]), claws(62, 79, 0.4, 4),
        ribbon([[65, 57], [73, 64], [80, 63]], [10, 7, 5]), claws(80, 63, 0.9, 7, 4),
        ribbon([[14, 58], [6, 60], [1, 64]], [7, 5, 0]),
      ],
      cuts: [ribbon([[22, 52], [40, 47], [58, 49]], [0, 1.8, 0])],
      head: { pivot: [65, 50], body: [
        poly([[61, 40], [68, 33.5], [77, 34], [85, 38.5], [90, 44.5], [91.5, 48], [90, 50.5], [85, 52.5], [78, 55.5], [70, 60], [62, 59]]),
        poly([[65, 37], [65.5, 32.5], [70.5, 35.2]]),
      ], cuts: [ribbon([[90, 47.5], [83, 44.5], [75, 42], [67, 39.5]], [1.2, 4.2, 4.8, 0])] },
    },
    // the eagle displayed, its head turned left toward the H with a hooked beak; each wing raised, the long primaries
    // spread as separate pointed feathers; the tail fanned in three, talons spread
    eagle: {
      body: [
        ribbon([[50, 18], [50, 30], [50, 45], [50, 60]], [11, 16, 20, 11]),
        poly([[56, 15], [51, 6], [44, 3.5], [39, 4.5], [35, 6.5], [30.5, 8.5], [29, 12], [30, 16], [32, 13.5], [36, 13], [41, 14], [46, 16], [53, 22]]),
        ribbon([[49, 60], [44, 72], [41, 82]], [6, 5, 0]), ribbon([[50, 60], [50, 74], [50, 86]], [7, 6, 0]), ribbon([[51, 60], [56, 72], [59, 82]], [6, 5, 0]),
        ribbon([[45, 53], [41, 63]], [9, 4]), claws(41, 63, 1.9, 6), ribbon([[55, 53], [59, 63]], [9, 4]), claws(59, 63, 1.2, 6),
      ],
      cuts: [ribbon([[40, 7], [43, 6.8], [45.5, 8]], [0, 1.8, 0])],
      wingL: { pivot: [46, 34], body: [
        ribbon([[48, 36], [36, 25], [24, 14]], [11, 8, 5]),
        poly([[48, 33], [26, 13], [19, 20], [17, 34], [24, 45], [38, 50], [48, 46]]),
        ribbon([[25, 15], [18, 8], [11, 3]], [7, 6, 0]), ribbon([[22, 16], [12, 11], [3, 9]], [7, 6, 0]),
        ribbon([[20, 22], [10, 20], [1, 21]], [7, 6, 0]), ribbon([[19, 29], [10, 30], [2, 33]], [7, 6, 0]),
        ribbon([[22, 37], [14, 42], [7, 47]], [7, 5, 0]), ribbon([[28, 42], [21, 49], [16, 56]], [7, 5, 0]), ribbon([[36, 46], [31, 53], [28, 60]], [7, 5, 0]),
      ], cuts: [ribbon([[44, 45], [30, 40], [21, 33]], [0, 1.5, 0])] },
    },
  };
  // the right wing is the left one mirrored about the body's line
  LEAN.eagle.wingR = { pivot: [54, 34], mirror: true, body: LEAN.eagle.wingL.body, cuts: LEAN.eagle.wingL.cuts };

  // the redrawn beasts' places, as LAYOUT's: on the icon where the wands leave room (the badger, now walking, wide and
  // low, above the first wand; the eagle above the fourth); on the seal and the ring each in its quarter, clear of the H
  const LEAN_LAYOUT = {
    icon: { lion: [15.5, 17, 1.2], snake: [48.5, 17, 1.1], badger: [14.5, 32.5, 1.0], eagle: [50, 34.5, 0.82], H: [32, 42.5, 1] },
    seal: { lion: [17, 18.5, 1.1], snake: [46.5, 18.5, 1.0], badger: [20, 46, 1.0], eagle: [45.5, 46, 0.9], H: [32, 33, 1.9] },
    round: { lion: [17, 19, 1.2], snake: [47, 19, 1.1], badger: [19.5, 47, 1.1], eagle: [45, 47, 1.0], H: [32, 34, 1.9], noShield: true },
  };
  const LEAN_ICON = LEAN_LAYOUT.icon;
  function leanCrest(id, style, v, P, c) {
    const mode = style === 'lean-bare' ? 'bare' : style === 'lean-wire' ? 'wire' : 'cut';
    let k = 0;
    // a part: its shapes in the beast's colour, its grooves cut from them (in the part's own space, so they move with it)
    const part = (body, cuts) => {
      const fill = body.join('');
      if (mode === 'bare' || !cuts || !cuts.length) return `<g>${fill}</g>`;
      const m = `lm${id}_${k++}`;
      return `<mask id="${m}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140"><rect x="-20" y="-20" width="140" height="140" fill="#fff"/><g fill="#000">${cuts.join('')}</g></mask><g mask="url(#${m})">${fill}</g>`;
    };
    const moving = (kind, p) => {
      const inner = p.mirror ? `<g transform="translate(100 0) scale(-1 1)">${part(p.body, p.cuts)}</g>` : part(p.body, p.cuts);
      return `<g class="lumos-stir" data-kind="${kind}" transform="${STIR[kind](v)}">${inner}</g>`;
    };
    const B = LEAN;
    const beasts = {
      lion: part(B.lion.body, B.lion.cuts) + moving('leanTail', B.lion.tail),
      snake: moving('curl', { body: B.snake.curl.body, cuts: B.snake.cuts }),
      badger: part(B.badger.body, B.badger.cuts) + moving('head', B.badger.head),
      eagle: moving('leanWingL', B.eagle.wingL) + moving('leanWingR', B.eagle.wingR) + part(B.eagle.body, B.eagle.cuts),
    };
    const wire = mode === 'wire' ? `<filter id="lw${id}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="d"/><feComposite in="d" in2="SourceAlpha" operator="out" result="r"/><feFlood flood-color="${c}"/><feComposite in2="r" operator="in"/></filter>` : '';
    const at = (x, y, s, body) => `<g transform="translate(${x},${y}) scale(${(s * 0.16).toFixed(4)}) translate(-50,-50)"><g fill="${c}"${wire ? ` filter="url(#lw${id})"` : ''}>${body}</g></g>`;
    const H = `<path d="M-2.5,-4 V4 M2.5,-4 V4 M-2.5,0 H2.5" stroke="${c}" stroke-width="1.3"/>
      <path d="M-3.6,-4 H-1.4 M1.4,-4 H3.6 M-3.6,4 H-1.4 M1.4,4 H3.6" stroke="${c}" stroke-width="0.6"/>`;
    return `${wire}${P.noShield ? '' : `<path d="M6,6 H58 V30 C58,47 46,56 32,62 C18,56 6,47 6,30 Z" fill="none" stroke="${c}" stroke-width="0.8"/>`}
      ${at(...P.lion, beasts.lion)}${at(...P.snake, beasts.snake)}${at(...P.badger, beasts.badger)}${at(...P.eagle, beasts.eagle)}<g transform="translate(${P.H[0]},${P.H[1]}) scale(${P.H[2]})">${H}</g>`;
  }
  // The beasts drawn (Q14 to Q16, 12 October 2026): the castle's own hand, traced, one passed drawing of each, all four
  // facing the H. The paths are generated into ../logo/beasts/drawn.js (build-drawn.py), each beast 100 units tall
  // with its moving part cut at a joint. Each quarter takes its house's banner: "red with a gold lion for Gryffindor,
  // blue with a bronze eagle for Ravenclaw, yellow with a black badger for Hufflepuff, and green with a silver serpent
  // for Slytherin", the coat of arms "lion, eagle, badger, and snake united around a large letter H" (B4 ch15, the
  // canon tool; Godric's t1 on Q16). At rest the crest is one tint, as a watermark is; the hold's colours (tint 0..1) are
  // off since the touch review (HOLD.lights), so on the icon and the purple seal nothing changes but the beasts.
  // Places as LAYOUT's, each [x, y, height] in the 64-unit tile; X, Y the cross between the quarters. The shield is
  // the rounder one of Q18's answer (Godric, 5.29 pm, 12 October 2026: 3), its sides straight down to 40 before the
  // point, so the badger and eagle clear its line and the H; on the crest the H a touch smaller and the cross raised
  // to it, all four one size (beasts/clearance.js: each 2 inside the shield, 1.5 from the H, 1 inside its quarter);
  // the icon's eagle a quarter unit in, so its wings stay clear as they open.
  const SHIELD_ROUND = 'M6,6 H58 V40 C58,51.7 46,57.9 32,62 C18,57.9 6,51.7 6,40 Z';
  // the seriffed H as one outline, the same ground as its stems (1.3), bar and serifs (0.6) drawn as strokes
  // P.Hgold [gold, width, ink, width, fill]: the H as one shape, a gold outline and a fine ink edge outside it, so it reads on
  // every quarter, the yellow too (Godric on Q19, 7.41 pm: "The H needs a gold outline or it is virtually invisible,
  // even when lit"); each stroke drawn under the fill, so only its outer half shows. P.Hapart: the H is drawn by svg()
  // above the crest at its own strength (H_STRENGTH), not dimmed with the watermark.
  const hMark = (P, c) => `${P.Hgold[2] ? `<path d="${H_SHAPE}" fill="none" stroke="${P.Hgold[2]}" stroke-width="${P.Hgold[3]}" stroke-linejoin="miter"/>` : ''}<path d="${H_SHAPE}" fill="${P.Hgold[4] || c}" stroke="${P.Hgold[0]}" stroke-width="${P.Hgold[1]}" stroke-linejoin="miter" paint-order="stroke"/>`;
  // P.Hglint (Fawkes's touch on Q20, 8.16 pm, built ready and off until Godric takes it): as the hold's light reaches
  // the H, one short bright run travels once round its gold outline (HOLD.glint: start and length in ms)
  const H_RUN = 51.6;   // the length of H_SHAPE's outline
  const H_SHAPE = 'M-3.6,-4.3 H-1.4 V-3.7 H-1.85 V-0.65 H1.85 V-3.7 H1.4 V-4.3 H3.6 V-3.7 H3.15 V3.7 H3.6 V4.3 H1.4 V3.7 H1.85 V0.65 H-1.85 V3.7 H-1.4 V4.3 H-3.6 V3.7 H-3.15 V-3.7 H-3.6 Z';
  const DRAWN_LAYOUT = {
    icon: { lion: [15.5, 17.5, 17], snake: [48.5, 17.5, 15.5], badger: [14.5, 36.25, 15], eagle: [49.75, 37, 14], H: [32, 42.5, 1], X: 32, Y: 27.5, shield: SHIELD_ROUND, Hgold: ['#d6a537', 1, '#1e130a', 1.5], Hapart: true },
    seal: { lion: [18.5, 18.75, 20], snake: [45.5, 18.5, 20], badger: [18.25, 41, 19.75], eagle: [46.25, 42.25, 20], H: [32, 30, 1.3], X: 32, Y: 30, shield: SHIELD_ROUND },
    // the seal's own (Q12 answered 1 with t1, Godric, 6.51 pm): "a large letter H" (PS 3), so in the wax the H a quarter
    // bigger than on the crest, the first thing the boys read; the four moved out round it, the badger and eagle a touch smaller
    wax: { lion: [18, 18.75, 20], snake: [46.25, 18.5, 20], badger: [17.5, 41, 18.75], eagle: [47.25, 41.25, 19.75], H: [32, 30, 1.6], X: 32, Y: 30, shield: SHIELD_ROUND },
    round: { lion: [15.5, 16, 20], snake: [48.5, 16, 18], badger: [15.5, 48, 18.5], eagle: [48.5, 48, 17.5], H: [32, 32, 1.45], X: 32, Y: 32, noShield: true },
  };
  const HOUSE = {  // field, metal
    lion: ['#9e1b1b', '#d6a537'], eagle: ['#1f3f86', '#b5763d'], badger: ['#e2b43b', '#1b1712'], snake: ['#1f5c35', '#c9cdd2'],
  };
  const QUARTER = { lion: [0, 0], snake: [1, 0], badger: [0, 1], eagle: [1, 1] };
  const drawnSet = () => (typeof window !== 'undefined' && window.LumosBeasts) || require('./drawn.js');
  // the stir of each drawn beast, in its own units: the lion's tail flicks up toward its back, the badger's raised paw
  // strikes, the snake's loose tail flicks in toward the H, the eagle (no narrow joint) rises and spreads its wings
  const DRAWN_TURN = { lion: 6, badger: 9, snake: -8 };
  const drawnStir = name => v => {
    const b = drawnSet()[name];
    if (name === 'eagle') return `translate(${(b.w / 2).toFixed(2)} 100) scale(${(1 + 0.05 * v).toFixed(4)} ${(1 + 0.02 * v).toFixed(4)}) translate(${(-b.w / 2).toFixed(2)} ${(-100 - 2 * v).toFixed(2)})`;
    return `rotate(${(DRAWN_TURN[name] * v).toFixed(2)} ${b.pivot[0]} ${b.pivot[1]})`;
  };
  // each beast in its own manner, all four at once (Fawkes's touch on Q18, relayed 12 October 2026, 6.34 pm): the
  // lion's mane lifts about its nape, the snake's coil draws tight, the badger's raised paw digs, the eagle half opens
  // its wings, each about its shoulder. The manner of a layout is P.manner: 'own' (the default) or 'joint', the first
  // stir (the tail, the paw, the tail, the whole bird), which the sheets of Q17 and Q18 keep. Degrees per moving part.
  const OWN = { lion: [-5], eagle: [-8, 8] };
  const ownMove = (name, i) => v => {
    const p = drawnSet()[name].moves[i].pivot;
    return `rotate(${(OWN[name][i] * v).toFixed(2)} ${p[0]} ${p[1]})`;
  };
  const coil = v => {
    const b = drawnSet().snake;
    return `translate(${(b.w / 2).toFixed(2)} 100) scale(${(1 - 0.06 * v).toFixed(4)} ${(1 - 0.03 * v).toFixed(4)}) translate(${(-b.w / 2).toFixed(2)} -100)`;
  };
  const dig = v => { const p = drawnSet().badger.pivot; return `rotate(${(14 * v).toFixed(2)} ${p[0]} ${p[1]})`; };
  const mix = (a, b, t) => out(hex(a).map((x, i) => x + (hex(b)[i] - x) * t));
  function drawnCrest(id, v, P, c, tint) {
    // tint: one strength for all four, or { lion, snake, badger, eagle } each its own (t1, the Sorting Hat's order)
    const B = drawnSet(), tv = name => (typeof tint === 'object' && tint ? tint[name] : tint) || 0;
    const shield = P.shield || 'M6,6 H58 V30 C58,47 46,56 32,62 C18,56 6,47 6,30 Z';
    const beast = name => {
      const b = B[name], [x, y, h] = P[name], s = h / 100, kind = 'd' + name, vv = typeof v === 'object' ? v[name] || 0 : v;
      const fill = `class="lumos-tint" data-house="${name}" data-a="${c}" data-b="${HOUSE[name][1]}" fill="${mix(c, HOUSE[name][1], tv(name))}" fill-rule="evenodd"`;
      const moving = (k, body) => `<g class="lumos-stir" data-kind="${k}" transform="${STIR[k](vv)}">${body}</g>`;
      const inner = (P.manner || 'own') === 'joint'
        ? (name === 'eagle' ? moving(kind, `<path ${fill} d="${b.body}"/>`) : `<path ${fill} d="${b.body}"/>${moving(kind, `<path ${fill} d="${b.part}"/>`)}`)
        : b.moves ? `<path ${fill} d="${b.still}"/>${b.moves.map((m, i) => moving(`${kind}-m${i}`, `<path ${fill} d="${m.d}"/>`)).join('')}`
        : name === 'snake' ? moving('dsnake-coil', `<path ${fill} d="${b.body}"/><path ${fill} d="${b.part}"/>`)
        : `<path ${fill} d="${b.body}"/>${moving('dbadger-dig', `<path ${fill} d="${b.part}"/>`)}`;
      return `<g transform="translate(${x},${y}) scale(${s.toFixed(4)}) translate(${(-b.w / 2).toFixed(2)},-50)">${inner}</g>`;
    };
    // the four fields, each the shield's quarter (or, with no shield, a soft disc behind its beast)
    const fields = Object.keys(QUARTER).map(name => {
      const [qx, qy] = QUARTER[name];
      const each = `class="lumos-field" data-house="${name}" opacity="${tv(name).toFixed(3)}" fill="${HOUSE[name][0]}"`;
      const r = `<rect x="${qx ? P.X : 0}" y="${qy ? P.Y : 0}" width="${qx ? 64 - P.X : P.X}" height="${qy ? 64 - P.Y : P.Y}" ${each}/>`;
      return P.noShield ? `<circle cx="${P[name][0]}" cy="${P[name][1]}" r="${(P[name][2] * 0.6).toFixed(2)}" ${each}/>` : r;
    }).join('');
    const clip = P.noShield ? '' : `<clipPath id="dq${id}"><path d="${shield}"/></clipPath>`;
    const H = P.Hgold ? hMark(P, c) : `<path d="M-2.5,-4 V4 M2.5,-4 V4 M-2.5,0 H2.5" stroke="${c}" stroke-width="1.3"/>
      <path d="M-3.6,-4 H-1.4 M1.4,-4 H3.6 M-3.6,4 H-1.4 M1.4,4 H3.6" stroke="${c}" stroke-width="0.6"/>`;
    return `${clip}<g${clip ? ` clip-path="url(#dq${id})"` : ''}>${fields}</g>
      ${P.noShield ? '' : `<path d="${shield}" fill="none" stroke="${c}" stroke-width="0.8"/>`}
      ${beast('lion')}${beast('snake')}${beast('badger')}${beast('eagle')}${P.Hapart ? '' : `<g transform="translate(${P.H[0]},${P.H[1]}) scale(${P.H[2]})">${H}</g>`}`;
  }
  function crest(id, style, stir, layout, colour, tint) {
    if (style === 'drawn') return drawnCrest(id, stir || 0, DRAWN_LAYOUT[layout || 'icon'], colour || '#f3e6c4', tint);
    if (style && style.startsWith('lean')) return leanCrest(id, style, stir || 0, LEAN_LAYOUT[layout || 'icon'], colour || '#f3e6c4');
    const v = stir || 0, mv = (kind, body) => `<g class="lumos-stir" data-kind="${kind}" transform="${STIR[kind](v)}">${body}</g>`;
    const c = colour || '#f3e6c4', P = LAYOUT[layout || 'icon'];
    const at = (x, y, s, body) => `<g transform="translate(${x},${y}) scale(${s})">${body}</g>`;
    // the lion rampant, as heralds draw it (Godric, Q7 8.34 pm: the face was too goofy): reared on one hind leg, facing
    // left, forepaws raised and clawed, jaws open, mane in flames down the neck, tail raised and tufted
    const limb = (d, w) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const claws = (x, y, r) => `<path d="M${x},${y} l${(Math.cos(r) * 0.9).toFixed(2)},${(Math.sin(r) * 0.9).toFixed(2)} M${x},${y} l${(Math.cos(r + 0.7) * 0.8).toFixed(2)},${(Math.sin(r + 0.7) * 0.8).toFixed(2)} M${x},${y} l${(Math.cos(r - 0.7) * 0.8).toFixed(2)},${(Math.sin(r - 0.7) * 0.8).toFixed(2)}" stroke="${c}" stroke-width="0.3" stroke-linecap="round"/>`;
    // two manes: 'curl', the heraldic curled mane and tufted tail (Godric, Q9 8.49 pm); 'flame', as first sent
    const CURLS = [[-1.7, -7.1], [-0.5, -6.8], [0.5, -6], [1, -4.9], [1, -3.7], [0.5, -2.6], [-0.4, -1.8]];
    const mane = style === 'curl'
      ? `<path d="M-2.6,-6.4 C-1.4,-7.4 0.4,-6.8 0.8,-5.2 C1.1,-3.6 0.3,-2.4 -0.8,-1.5 L-2.6,-1.8 L-3.4,-2.6 L-3.6,-3.4 Z"/>${CURLS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.62"/>`).join('')}`
      : '<path d="M-2.6,-6.4 L-1.8,-7.7 L-1.2,-6.6 L0.2,-7.5 L-0.2,-6 L1.3,-6 L0.2,-5 L1.6,-4.4 L0.2,-3.9 L1.3,-2.9 L-0.4,-2.8 L0,-1.7 L-1.4,-2 L-1.6,-0.9 L-2.6,-1.8 L-3.4,-2.6 L-3.6,-3.4 Z"/>';
    // each curl turned in on itself, a fine dark spiral cut from the lock
    const curlCuts = style === 'curl' ? `<g stroke="#000" stroke-width="0.16" fill="none">${CURLS.map(([x, y]) => `<path d="M${x + 0.3},${y} A0.3,0.3 0 1 0 ${x},${y + 0.3}"/>`).join('')}</g>` : '';
    const tuft = style === 'curl'
      ? `<path d="M4.4,-4 C4.3,-5.2 5,-6.5 6,-6.9 C5.7,-6.3 5.8,-5.8 6.3,-5.6 C6.8,-5.4 7.1,-5 7,-4.5 C6.6,-4.8 6.1,-4.6 6,-4.2 C5.6,-3.6 5,-3.6 4.4,-4 Z" fill="${c}"/>
        <path d="M6,-6.9 a0.45,0.45 0 1 1 0.3,0.6 M7,-4.5 a0.4,0.4 0 1 0 -0.1,-0.7" stroke="${c}" stroke-width="0.3" fill="none" stroke-linecap="round"/>`
      : `<path d="M4.6,-4.2 L5.9,-5.5 L5.5,-4.3 L6.5,-4.1 L5.1,-3.6 Z" fill="${c}"/>`;
    const lion = `<mask id="lc${id}" maskUnits="userSpaceOnUse" x="-8" y="-9" width="16" height="18"><rect x="-8" y="-9" width="16" height="18" fill="#fff"/>${curlCuts}</mask>
      <g fill="${c}" mask="url(#lc${id})">
        ${mane}
        <path d="M-2.6,-6.4 C-3.4,-6.6 -4.4,-6.2 -4.8,-5.6 L-5.7,-5.2 L-5.6,-4.5 L-4.2,-4.4 L-5.3,-3.8 L-4.6,-3.3 C-4,-3.2 -3.6,-3.3 -3.4,-3.6 Z"/>
        <path d="M-3.4,-2.8 C-2,-3.2 -0.4,-2 0.6,-0.2 C1.4,1.2 3.2,1.6 3.2,3.2 C3.2,4.6 1.6,5 0.6,4.4 C-0.4,3.6 -1,2.4 -1.8,1.2 C-2.6,0 -3.6,-1.4 -3.4,-2.8 Z"/>
        <circle cx="1.8" cy="3.2" r="1.6"/>
        </g>
      <path d="M-5.2,-4.15 q-0.7,0.1 -0.9,0.55" stroke="${c}" stroke-width="0.35" fill="none" stroke-linecap="round"/>
      ${limb('M-3,-2.2 L-4.5,-1.9 L-5.9,-3.2', 1.15)}${claws(-5.9, -3.2, -2.3)}
      ${limb('M-2.4,-0.6 L-3.9,0.2 L-5.4,-0.4', 1.15)}${claws(-5.4, -0.4, -2.6)}
      ${limb('M2.2,4 L2.6,5.6 L1.2,7 L-0.6,7.1', 1.4)}${claws(-0.6, 7.1, 3.0)}
      ${limb('M0.4,4 L-1,5.2 L-2.8,4.6', 1.25)}${claws(-2.8, 4.6, -2.8)}
      ${mv('tail', limb('M3.1,3.4 C5.8,3 5.2,-0.6 3.6,-1.4 C2.4,-2 3.4,-3.6 4.6,-4.2', 0.55) + tuft)}`;
    // the snake, an S rising, its head up and tongue out
    const snake = `<path d="M-2,6.5 C-4,5 -2.5,2.5 0.5,2 C4,1.5 5,-1 3,-2.8 C1.5,-4.2 -0.5,-3.4 -0.6,-5.4" stroke="${c}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <ellipse cx="-0.2" cy="-6.4" rx="1.7" ry="1.2" fill="${c}"/><path d="M1.4,-6.7 l1.4,-0.5 M1.4,-6.5 l1.4,0.4" stroke="${c}" stroke-width="0.35"/>`;
    // the badger, face on: a head narrowing to its snout, round ears, the two dark stripes down its face
    const badger = `<mask id="bs${id}" maskUnits="userSpaceOnUse" x="-7" y="-7" width="14" height="14"><rect x="-7" y="-7" width="14" height="14" fill="#fff"/>
        <path d="M-2.5,-4.3 C-2.2,-1.2 -1.5,1.4 -0.75,3.4 M2.5,-4.3 C2.2,-1.2 1.5,1.4 0.75,3.4" stroke="#000" stroke-width="1.25" fill="none"/></mask>
      <g fill="${c}" mask="url(#bs${id})"><path d="M-4.3,-2.4 C-4.3,-4.7 4.3,-4.7 4.3,-2.4 C4.3,0.6 1.6,3.6 0,4.8 C-1.6,3.6 -4.3,0.6 -4.3,-2.4 Z"/>
        <circle cx="-3.5" cy="-3.7" r="1.15"/><circle cx="3.5" cy="-3.7" r="1.15"/></g>`;
    // the eagle, wings spread; each wing is the whole bird clipped to its side (overlapping at the middle, so no seam:
    // the crest is one layer, an overlap cannot show), so the wings can lift; the body and head drawn over them
    const eagleBody = `<path fill="${c}" d="M0,-0.5 C-2.4,-2.8 -4.8,-3.8 -6.4,-3.6 L-4.8,-2.3 L-6,-2 L-4.1,-1 L-5.2,-0.5 L-2.6,0.5 C-1.7,1 -1,1.3 -0.4,1.6 L-1.2,5 L0,4.2 L1.2,5 L0.4,1.6 C1,1.3 1.7,1 2.6,0.5 L5.2,-0.5 L4.1,-1 L6,-2 L4.8,-2.3 L6.4,-3.6 C4.8,-3.8 2.4,-2.8 0,-0.5 Z"/>
`;
    const eagleHead = `<circle cx="0" cy="-1.8" r="1.25" fill="${c}"/><path d="M0.9,-1.8 l0.9,0.3 l-0.9,0.3" fill="${c}"/>
      <path d="M-1.3,-1.2 C-1.3,0 -0.8,1 -0.4,1.6 L-1.2,5 L0,4.2 L1.2,5 L0.4,1.6 C0.8,1 1.3,0 1.3,-1.2 Z" fill="${c}"/>`;
    const eagle = `<clipPath id="ewl${id}"><rect x="-8" y="-8" width="8.4" height="16"/></clipPath><clipPath id="ewr${id}"><rect x="-0.4" y="-8" width="8.4" height="16"/></clipPath>
      ${mv('wingL', `<g clip-path="url(#ewl${id})">${eagleBody}</g>`)}${mv('wingR', `<g clip-path="url(#ewr${id})">${eagleBody}</g>`)}${eagleHead}`;
    // the large H at the centre, seriffed
    const H = `<path d="M-2.5,-4 V4 M2.5,-4 V4 M-2.5,0 H2.5" stroke="${c}" stroke-width="1.3"/>
      <path d="M-3.6,-4 H-1.4 M1.4,-4 H3.6 M-3.6,4 H-1.4 M1.4,4 H3.6" stroke="${c}" stroke-width="0.6"/>`;
    return `${P.noShield ? '' : `<path d="M6,6 H58 V30 C58,47 46,56 32,62 C18,56 6,47 6,30 Z" fill="none" stroke="${c}" stroke-width="0.8"/>`}
      ${at(...P.lion, lion)}${at(...P.snake, mv('snake', snake))}${at(...P.badger, mv('badger', badger))}${at(...P.eagle, eagle)}${at(...P.H, H)}`;
  }

  // The stir (Godric, Q9 8.49 pm: "At full brightness the beasts move a bit for a beat"): at the hold's peak the lion's
  // tail flicks, the eagle's wings lift, the snake draws its curl tighter and the badger turns its head, then all are
  // still as the light fades. v 0..1, each beast in its own drawing's units, about its own pivot.
  const STIR = {
    tail: v => `rotate(${(-16 * v).toFixed(2)} 3.1 3.4)`,
    wingL: v => `rotate(${(13 * v).toFixed(2)} -0.5 -0.4)`,
    wingR: v => `rotate(${(-13 * v).toFixed(2)} 0.5 -0.4)`,
    snake: v => `rotate(${(-9 * v).toFixed(2)} -2 6.5)`,
    badger: v => `rotate(${(-9 * v).toFixed(2)} 0 4) translate(${(-0.4 * v).toFixed(2)} 0) scale(${(1 - 0.1 * v).toFixed(3)} 1)`,
    // the redrawn beasts' parts, in their 100-unit box: the snake's curl drawn tighter, the badger's head lifted
    leanTail: v => `rotate(${(14 * v).toFixed(2)} 36 69)`,
    leanWingL: v => `rotate(${(13 * v).toFixed(2)} 46 34)`,
    leanWingR: v => `rotate(${(-13 * v).toFixed(2)} 54 34)`,
    curl: v => `rotate(${(-8 * v).toFixed(2)} 70 92)`,
    head: v => `rotate(${(-14 * v).toFixed(2)} 65 50)`,
    dlion: drawnStir('lion'), dbadger: drawnStir('badger'), dsnake: drawnStir('snake'), deagle: drawnStir('eagle'),
    'dlion-m0': ownMove('lion', 0), 'deagle-m0': ownMove('eagle', 0), 'deagle-m1': ownMove('eagle', 1), 'dsnake-coil': coil, 'dbadger-dig': dig,
  };
  // the crest's resting strength (Godric, Q7 8.34 pm: a little fainter than the 0.085 first sent)
  const CREST = 0.06;
  // the H's own strength for a crest strength c: faint at rest (H_REST), clear at the hold's peak (H_PEAK), in step between
  const H_REST = 0.12, H_PEAK = 0.9;
  const H_STRENGTH = c => Math.max(0, H_REST + (H_PEAK - H_REST) * (c - CREST) / (HOLD.peak - CREST));
  let n = 0;
  function svg(o = {}) {
    const id = 'L' + (n++);
    const nox = !!o.nox, k = nox ? 0 : (o.k ?? 1), rise = o.rise || [1, 1, 1, 1];
    // the tile: dark when out, the castle's night and wash as the light comes
    let tile = `<rect width="64" height="64" fill="url(#dark${id})"/>`;
    if (k > 0) tile += `<rect width="64" height="64" fill="url(#night${id})" opacity="${Math.min(1, k)}"/><rect width="64" height="64" fill="url(#wash${id})" opacity="${k}"/>`;
    const wm = o.watermark === true ? CREST : +o.watermark || 0;
    if (wm && k > 0) tile += `<g class="lumos-crest" mask="url(#mreveal${id})" opacity="${(wm * k).toFixed(3)}">${crest(id, o.lion || 'drawn', o.stir, 'icon', null, o.tint)}</g>`;
    const HP = DRAWN_LAYOUT.icon;
    if (wm && k > 0 && (o.lion || 'drawn') === 'drawn' && HP.Hapart) tile += `<g class="lumos-h" mask="url(#mreveal${id})" opacity="${(H_STRENGTH(wm) * k).toFixed(3)}"><g transform="translate(${HP.H[0]},${HP.H[1]}) scale(${HP.H[2]})">${hMark(HP, '#f3e6c4')}${HP.Hglint ? glintMark(o.glint ?? -1) : ''}</g></g>`;
    let wands = '';
    for (let i = 0; i < 4; i++) {
      if (rise[i] <= 0) continue;
      const [sx, sy] = moved(i, rise[i]);
      wands += `<g transform="translate(${sx},${sy})">${wand(id, i, k, o.woods)}</g>`;
    }
    const clip = o.square ? '' : ` clip-path="url(#clip${id})"`;
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"${o.cls ? ` class="${o.cls}"` : ''}>${defs(id)}
    <g${clip}><g filter="url(#paper${id})">${tile}</g>${wands}${k > 0 ? orb(id, k) : ''}${o.watermark && k > 0 ? `<circle class="lumos-flare" cx="${OX}" cy="${OY}" r="30" fill="url(#glow${id})" opacity="${o.flare || 0}"/>` : ''}${nox ? smoke(id) : ''}</g></svg>`;
  }
  const FRAMES = [
    [[0, 0, 0, 0], 0, '1. dark'],
    [[0.5, 0, 0, 0], 0, '2. the first rises'],
    [[1, 0.5, 0, 0], 0, '3. the second'],
    [[1, 1, 0.5, 0], 0, '4. the third'],
    [[1, 1, 1, 0.5], 0, '5. the fourth'],
    [[1, 1, 1, 1], 0, '6. all four, unlit'],
    [[1, 1, 1, 1], 0.3, '7. the orb kindles'],
    [[1, 1, 1, 1], 1, '8. Lumos'],
  ];
  // The hold (Godric's touch on Q7, 8.34 pm): a finger held on the orb of the start screen's icon brightens it for a
  // breath, the crest shows clearly, then all fades back to rest. Never explained. The timeline is HOLD; at(t) gives
  // the crest's strength and the flare at t ms, so a sheet can draw any moment of it.
  // stirGain: the stir's size at its peak (1 as first built; Q11's 3 would make it 1.5)
  // order, tintStep: the quarters' colours one after another, tintStep ms apart, in the order the Sorting Hat sings the
  // houses, Gryffindor, Hufflepuff, Ravenclaw, Slytherin (PS 7; Fawkes's t1 on Q17, taken by Godric 2.51 pm).
  // lights: false since the touch review (docs/ministry/touch-review.md, Godric's yes of 15 October 2026: q15 and q17
  // ADJUST, a colour flash reads as a glow cue, so the beasts move and nothing lights): the hold's colours are kept in
  // code, off; true brings back Godric's Q17 flash and the first hold's quarters lighting.
  const HOLD = { lights: false, press: 400, up: 350, breath: 1200, down: 1500, peak: 0.32, flare: 0.5, stirAt: 150, stirMs: 800, stirGain: 1, tintMs: 1100,
    order: ['lion', 'badger', 'eagle', 'snake'], tintStep: 150,
    first: { gap: 750, soloMs: 800, light: 350, together: 3300, breath: 4550 }, glint: { at: 250, ms: 700 } };
  // The first hold ever (Godric's touch on Q19, woven, 12 October 2026, 7.41 pm): the beasts stir one after another in
  // the Sorting Hat's order, Gryffindor, Hufflepuff, Ravenclaw, Slytherin (each quarter lighting with its beast only
  // while HOLD.lights, off since the touch review), so the boys learn each one; then all four stir together, and all fades as on every hold. HOLD.first:
  // gap ms between the solo stirs, each soloMs long; light ms for a quarter to come up; together ms after the first
  // stir, all four; breath, the longer breath this hold needs. holdAt(t, true) gives stirs, each beast its own.
  const glintMark = p => `<g class="lumos-glint" ${glintAttrs(p)}><path d="${H_SHAPE}" fill="none" stroke="#ffe9a8" stroke-width="1.5" stroke-opacity="0.3" stroke-linecap="round" stroke-dasharray="7 ${(H_RUN - 7).toFixed(1)}" stroke-dashoffset="${glintOff(p)}"/><path d="${H_SHAPE}" fill="none" stroke="#fff4cc" stroke-width="0.7" stroke-linecap="round" stroke-dasharray="5 ${(H_RUN - 5).toFixed(1)}" stroke-dashoffset="${glintOff(p) - 1}"/></g>`;
  const glintOff = p => +(-Math.max(0, p) * H_RUN).toFixed(2);
  const glintAttrs = p => `opacity="${(p > 0 && p < 1 ? Math.min(1, 1.6 * Math.sin(Math.PI * p)) : 0).toFixed(3)}"`;
  function holdAt(t, first) {
    const H = HOLD, F = H.first, ease = x => x * x * (3 - 2 * x), c = x => Math.max(0, Math.min(1, x));
    const breath = first ? F.breath : H.breath;
    const u = t < H.up ? ease(t / H.up) : t < H.up + breath ? 1 : Math.max(0, 1 - ease((t - H.up - breath) / H.down));
    const bump = x => x > 0 && x < 1 ? H.stirGain * Math.sin(Math.PI * x) : 0;
    if (first) {
      const t0 = t - H.up - H.stirAt, all = bump((t0 - F.together) / H.stirMs);
      const stirs = Object.fromEntries(H.order.map((name, i) => [name, Math.max(bump((t0 - i * F.gap) / F.soloMs), all)]));
      const tints = Object.fromEntries(H.order.map((name, i) => [name, H.lights ? ease(c((t0 - i * F.gap) / F.light)) * (t < H.up + breath ? 1 : u) : 0]));
      return { crest: CREST + (H.peak - CREST) * u, flare: H.flare * u, stir: stirs, stirs, tint: tints, tints, first: true, glint: (t - H.glint.at) / H.glint.ms };
    }
    const st = (t - H.up - H.stirAt) / H.stirMs;
    // the house colours flash once, a little longer than the stir, each quarter tintStep ms after the one before
    const flash = i => { const tt = (t - H.up - H.stirAt - i * H.tintStep) / H.tintMs; return tt > 0 && tt < 1 ? Math.sin(Math.PI * tt) : 0; };
    const tints = Object.fromEntries(H.order.map((name, i) => [name, H.lights ? flash(i) : 0]));
    return { crest: CREST + (H.peak - CREST) * u, flare: H.flare * u, stir: st > 0 && st < 1 ? H.stirGain * Math.sin(Math.PI * st) : 0, tint: tints, tints, glint: (t - H.glint.at) / H.glint.ms };
  }
  // the first hold ever is remembered on the device (FIRST_KEY); hold(el, true) plays it again, for a sheet or a try
  const FIRST_KEY = 'lumos.crest.firstHold';
  function hold(el, again) {
    const g = el.querySelector('.lumos-crest'), f = el.querySelector('.lumos-flare'), h = el.querySelector('.lumos-h');
    if (!g || el.dataset.holding) return;
    el.dataset.holding = '1';
    let first = !!again;
    try { if (!localStorage.getItem(FIRST_KEY)) { first = true; localStorage.setItem(FIRST_KEY, '1'); } } catch (e) {}
    const kindOf = k => (/^d(lion|snake|badger|eagle)/.exec(k) || [])[1];
    const t0 = performance.now(), end = HOLD.up + (first ? HOLD.first.breath : HOLD.breath) + HOLD.down;
    (function step(now) {
      const t = Math.min(end, now - t0), v = holdAt(t, first);
      g.setAttribute('opacity', v.crest.toFixed(3)); f.setAttribute('opacity', v.flare.toFixed(3));
      if (h) h.setAttribute('opacity', H_STRENGTH(v.crest).toFixed(3));
      const gl = el.querySelector('.lumos-glint');
      if (gl) { gl.setAttribute('opacity', glintAttrs(v.glint).slice(9, -1)); gl.querySelectorAll('path').forEach((q, i) => q.setAttribute('stroke-dashoffset', glintOff(v.glint) - i)); }
      el.querySelectorAll('.lumos-stir').forEach(b => { const k = b.dataset.kind, s = typeof v.stir === 'object' ? v.stir[kindOf(k)] || 0 : v.stir; b.setAttribute('transform', STIR[k](s)); });
      el.querySelectorAll('.lumos-tint').forEach(b => b.setAttribute('fill', mix(b.dataset.a, b.dataset.b, v.tints[b.dataset.house])));
      el.querySelectorAll('.lumos-field').forEach(b => b.setAttribute('opacity', v.tints[b.dataset.house].toFixed(3)));
      if (t < end) requestAnimationFrame(step); else delete el.dataset.holding;
    })(t0);
  }
  // arm an icon drawn with { watermark: true }: a press on the orb held HOLD.press ms plays the hold once
  function armHold(el) {
    let timer = 0;
    el.addEventListener('pointerdown', e => {
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(el.getScreenCTM().inverse());
      if (Math.hypot(pt.x - OX, pt.y - OY) > 9) return;
      timer = setTimeout(() => hold(el), HOLD.press);
    });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, () => clearTimeout(timer));
  }
  // The opening played (the day's first opening): the eight FRAMES as one movement, each wand rising in turn over
  // OPEN.rise ms, OPEN.gap ms apart (so frame 3's first wand is in place as the second is halfway), then the orb
  // kindling over OPEN.kindle ms; openAt(t) gives { rise, k } at t ms, open(box, done) plays it into box.
  const OPEN = { start: 100, gap: 225, rise: 450, kindle: 380 };
  OPEN.lit = OPEN.start + 3 * OPEN.gap + OPEN.rise;
  OPEN.end = OPEN.lit + OPEN.kindle;
  function openAt(t) {
    const O = OPEN, ease = x => x * x * (3 - 2 * x), c = x => Math.max(0, Math.min(1, x));
    return { rise: [0, 1, 2, 3].map(i => +c((t - O.start - i * O.gap) / O.rise).toFixed(3)), k: +ease(c((t - O.lit) / O.kindle)).toFixed(3) };
  }
  function open(box, o = {}, done) {
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min(OPEN.end, now - t0), v = openAt(t);
      box.innerHTML = svg({ ...o, rise: v.rise, k: v.k });
      if (t < OPEN.end) requestAnimationFrame(step); else if (done) done(box.querySelector('svg'));
    })(t0);
  }
  // Godric's touch on Q23 (t2): the first time the icon shows a wand of their own, a brief shower of red and gold
  // sparks at its tip, "throwing dancing spots of light" on the tile (PS 5), once only for that wand (SPARK_KEY keeps
  // which wands have sparked, by wizard and build, so a wand built again sparks again, as a new wand chooses).
  // sparksAt(wands, t) the shower at t ms of SPARK_MS for those wand indices; sparkle(el, wands, done) plays it
  // into an icon drawn by svg(), on a layer of its own, so the hold stays armed.
  const SPARK_MS = 1500, SPARK_KEY = 'lumos.icon.sparked';
  function sparksAt(ws, t) {
    const u = t / SPARK_MS; if (u <= 0 || u >= 1) return '';
    let s = '';
    for (const i of ws) {
      const tx = OX + TDX[i], ty = OY + TDY[i], hx = HS[i][0], hy = HS[i][1], L = Math.hypot(tx - hx, ty - hy);
      const ax = (tx - hx) / L, ay = (ty - hy) / L;   // out along the wand, past its tip
      let r = 31 + i * 17; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
      for (let j = 0; j < 10; j++) {
        const go = rnd() * 0.3, p = (u - go) / 0.7; if (p <= 0 || p >= 1) { rnd(); rnd(); rnd(); continue; }
        // thrown out in a fan past the orb's rim, then falling
        const sp = 10 + rnd() * 9, th = (rnd() - 0.5) * 2.6, col = rnd() < 0.5 ? '#ff5a3c' : '#ffd25a';
        const dx = ax * Math.cos(th) - ay * Math.sin(th), dy = ax * Math.sin(th) + ay * Math.cos(th);
        const e = 1 - Math.pow(1 - p, 2), pos = q => [tx + dx * sp * q, ty + dy * sp * q + 7 * q * q];
        const [x, y] = pos(e), [x0, y0] = pos(Math.max(0, e - 0.12)), a = 1 - p * p;
        s += `<path d="M${x0.toFixed(2)},${y0.toFixed(2)} L${x.toFixed(2)},${y.toFixed(2)}" stroke="${col}" stroke-width="0.35" stroke-linecap="round" opacity="${(a * 0.6).toFixed(3)}"/>`;
        s += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.7 * (1 - p * 0.4)).toFixed(2)}" fill="${col}" opacity="${a.toFixed(3)}"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.28" fill="#fff6d8" opacity="${a.toFixed(3)}"/>`;
        // the spot of light it throws on the tile, dancing a little below it
        s += `<circle cx="${(x + Math.sin(p * 9 + j) * 1.5).toFixed(2)}" cy="${(y + 4 + 3 * p).toFixed(2)}" r="1.1" fill="${col}" opacity="${(a * 0.16).toFixed(3)}"/>`;
      }
    }
    return s;
  }
  function sparkle(el, ws, done) {
    const host = el.querySelector(':scope > g'); if (!host || !ws.length) { if (done) done(); return; }
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'lumos-sparks'); host.appendChild(g);
    const t0 = performance.now();
    (function step(now) {
      const t = now - t0; g.innerHTML = sparksAt(ws, t);
      if (t < SPARK_MS) requestAnimationFrame(step); else { g.remove(); if (done) done(); }
    })(t0);
  }
  // which of these builds' wands have not sparked yet; marks them sparked
  function firstShown(builds) {
    let seen = {}; try { seen = JSON.parse(localStorage.getItem(SPARK_KEY) || '{}') || {}; } catch (e) {}
    const ws = [];
    (builds || []).forEach((b, i) => { if (!b) return; const sig = b.wood + ' ' + b.len; if (seen[i + 1] !== sig) { ws.push(i); seen[i + 1] = sig; } });
    try { localStorage.setItem(SPARK_KEY, JSON.stringify(seen)); } catch (e) {}
    return ws;
  }
  const api = { svg, FRAMES, WOODS, LOOK, fromBuilds, fromStore, BENCH_KEY, sparksAt, sparkle, firstShown, SPARK_MS, CREST, ORB: [OX, OY], HOLD, holdAt, hold, armHold, STIR, OPEN, openAt, open, crest, LAYOUT, LEAN_ICON, LEAN_LAYOUT, DRAWN_LAYOUT, HOUSE };
  if (typeof window !== 'undefined') window.LumosIcon = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
