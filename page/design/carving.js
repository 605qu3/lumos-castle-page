/* carving.js: carving drawn in code, req 688 (Magic > Design; docs/handoff/magic.md 1.8, Under the vaults, and 2.1,
   Under a vault): the star vault's bosses, the school's four beasts in turn down the bays ("a lion, an eagle, a badger,
   and a snake", PS 3 L527), from the crest's own traced beasts (LumosBeasts, drawn.js); and the masons' marks, small
   cut signs on dressed stone. Plain carving: nothing glows, nothing moves. Stone tones from CASTLE_TONES (req 643).

   LumosCarving.boss(ctx, beast, x, y, r, { stone, light, form, fade })  a boss of radius r at x, y; form 'bare' (Godric's 3 on
       design-bosses-1020, 20 October 2026, 8.20 am: the beast alone where the ribs meet, the default), 'leaf' (a ring
       of stiff leaves round a round boss), 'round' (a plain round boss);
       light, the side the light comes from in radians (a ceiling boss is lit from below: Math.PI / 2 on a sheet);
       fade 0..1, how far it has gone to the crown's ghost (2.1: thinning with its ribs, a little more body than they)
   LumosCarving.mark(ctx, id, x, y, size, { stone, light })  one mason's mark cut in a dressed face; ids in MARKS */
(function () {
  const rgb = h => { const n = typeof h === 'number' ? h : parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const css = (c, k = 1, a = 1) => `rgba(${c.map(v => Math.max(0, Math.min(255, Math.round(v * k)))).join(',')},${a})`;
  const stoneOf = o => rgb(o.stone || (window.CASTLE_TONES ? window.CASTLE_TONES.resolved['high-grey/ashlar'] : '#abb2b6'));

  // a relief: the shape in the stone, its edge toward the light catching it, its edge away in shadow
  function relief(ctx, path, c, light, depth, alpha) {
    const dx = Math.cos(light) * depth, dy = Math.sin(light) * depth;
    ctx.save();
    ctx.translate(-dx, -dy); ctx.fillStyle = css(c, 0.55, alpha); ctx.fill(path, 'evenodd');
    ctx.translate(2 * dx, 2 * dy); ctx.fillStyle = css(c, 1.22, alpha); ctx.fill(path, 'evenodd');
    ctx.translate(-dx, -dy); ctx.fillStyle = css(c, 1.0, alpha); ctx.fill(path, 'evenodd');
    ctx.restore();
  }
  const disc = (r) => { const p = new Path2D(); p.arc(0, 0, r, 0, Math.PI * 2); return p; };

  function boss(ctx, name, x, y, r, o = {}) {
    const B = window.LumosBeasts[name], c = stoneOf(o), light = o.light ?? Math.PI / 2, form = o.form || 'bare';
    const alpha = 1 - 0.75 * (o.fade || 0), d = r * 0.035;
    ctx.save(); ctx.translate(x, y);
    if (form === 'leaf') {  // twelve stiff leaves, each a pointed lobe
      const lp = new Path2D();
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, a1 = a - 0.22, a2 = a + 0.22;
        lp.moveTo(Math.cos(a1) * r * 0.78, Math.sin(a1) * r * 0.78);
        lp.quadraticCurveTo(Math.cos(a - 0.1) * r * 1.02, Math.sin(a - 0.1) * r * 1.02, Math.cos(a) * r, Math.sin(a) * r);
        lp.quadraticCurveTo(Math.cos(a + 0.1) * r * 1.02, Math.sin(a + 0.1) * r * 1.02, Math.cos(a2) * r * 0.78, Math.sin(a2) * r * 0.78);
        lp.closePath();
      }
      relief(ctx, lp, c, light, d * 1.4, alpha);
    }
    const inner = form === 'leaf' ? r * 0.8 : r;
    if (form !== 'bare') relief(ctx, disc(inner), c, light, d * 1.6, alpha);
    // the beast, fitted inside the boss with a margin, raised from it
    const s = (form === 'bare' ? r * 2 : inner * 1.5) / Math.max(B.w, B.h);
    ctx.save(); ctx.scale(s, s); ctx.translate(-B.w / 2, -B.h / 2);
    const bp = new Path2D(B.body); if (B.part) bp.addPath(new Path2D(B.part));
    relief(ctx, bp, c, light, d * 1.2 / s, alpha);
    ctx.restore();
    ctx.restore();
  }

  // the masons' marks: each a mason's own sign of a few strokes, cut as a V so one side of each groove catches the light
  const MARKS = {
    arrow: [[[0, 1], [0, -1]], [[-0.45, -0.5], [0, -1], [0.45, -0.5]]],
    cross: [[[0, 1], [0, -1]], [[-0.7, -0.2], [0.7, -0.2]]],
    star: [[[0, -1], [0, 1]], [[-0.87, -0.5], [0.87, 0.5]], [[-0.87, 0.5], [0.87, -0.5]]],  // six arms, never a pentagram
    hourglass: [[[-0.6, -0.9], [0.6, -0.9], [-0.6, 0.9], [0.6, 0.9], [-0.6, -0.9]]],
    trident: [[[0, 1], [0, -0.9]], [[-0.55, -0.9], [-0.55, -0.3], [0.55, -0.3], [0.55, -0.9]]],
    key: [[[0, 1], [0, -0.4]], [[0, 0.7], [0.4, 0.7]], [[0, 0.4], [0.3, 0.4]], [[-0.35, -0.75], [0, -1], [0.35, -0.75], [0, -0.4], [-0.35, -0.75]]],
    bow: [[[-0.8, 0.8], [0.8, -0.8]], [[-0.8, 0.8], [-0.2, 0.8]], [[-0.8, 0.8], [-0.8, 0.2]], [[0.2, -0.95], [0.95, -0.2]]],
    fish: [[[-0.9, 0], [-0.3, -0.45], [0.5, 0], [-0.3, 0.45], [-0.9, 0]], [[0.5, 0], [0.95, -0.4], [0.95, 0.4], [0.5, 0]]],
  };
  function mark(ctx, id, x, y, size, o = {}) {
    const c = stoneOf(o), light = o.light ?? -Math.PI * 0.75, w = Math.max(1.2, size * 0.09);
    const dx = Math.cos(light) * w * 0.35, dy = Math.sin(light) * w * 0.35;
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const stroke = (k, ox, oy, lw) => {
      ctx.strokeStyle = css(c, k); ctx.lineWidth = lw;
      for (const line of MARKS[id]) { ctx.beginPath(); line.forEach(([px, py], i) => ctx[i ? 'lineTo' : 'moveTo'](px * size / 2 + ox, py * size / 2 + oy)); ctx.stroke(); }
    };
    stroke(1.12, dx, dy, w);        // the groove's far wall, facing the light
    stroke(0.5, -dx * 0.4, -dy * 0.4, w * 0.75);  // its near wall in shadow
    stroke(0.68, 0, 0, w * 0.3);    // the cut's root
    ctx.restore();
  }

  const C = { boss, mark, MARKS: Object.keys(MARKS), BEASTS: ['lion', 'eagle', 'badger', 'snake'] };
  if (typeof window !== 'undefined') window.LumosCarving = C;
})();
