// The Marauder's Map, its ink and hand (req 243, asked by Magic, 13 October 2026; Magic's *The Marauder's Map,
// earned*, B10 to B15): drawn by code from the Architect's castle model (page/castle-model.js, window.CASTLE_MODEL),
// every place addressed by its id, so the places req 244 adds draw themselves. Plain SVG out, no bitmap.
//
// Canon (the canon tool, PoA 10 and 14): "a large, square, very worn piece of parchment" (B3 L17132); "thin ink
// lines began to spread like a spider's web from the point that George's wand had touched" (L17178); "great, curly
// green words" (L17178), the title word for word (L17180 to 17184); "every detail of the Hogwarts castle and
// grounds ... tiny ink dots ... each labelled with a name in minuscule writing" (L17186); "As though an invisible
// hand was writing upon it" (L19080). The three hands differing is ours (Magic's B13, B14), Wormtail only in the
// title (B13 t2). The den in Clementine's older brown ink and her letters' hand (B15, with its t1).
//
// LumosMap.svg(model, opts) returns one <svg> string. opts:
//   look     'raised', the default (Godric's Q24, 13 October 2026, answered 24.1): the Marauders' quill plan, its
//            towers stood up as little drums and cones on the whole parchment and flat at a phone's zoom (k 2 and
//            more), where he reads the names; 'pen' the plan flat throughout; 'engraved' a ruled, printed estate plan
//   view     { x0, y0, k, w, h }: the left and top edge in the model's metres, k pixels a metre, the size in pixels;
//            LumosMap.PARCHMENT is the whole square sheet, LumosMap.phone(cx, cy, k) a phone's window into it
//   dots     [{ name, at }]: at a model id (a room, opening, feature, ground or tower) or [x, y] in the site frame,
//            or { group, p: [x, y] } in a group's frame; the first dot marked me: true is his own
//   spread   0..1, the web of ink from his own dot (1 the whole Map); title 0..1, the green words blossoming
//   den      0..1, her brown lines spreading from the little door (0 not yet on the Map); denNote shows the three's line
//   notes    [{ hand: 'moony' | 'padfoot' | 'prongs', text, x, y }] in pixels, the invisible hands' lines
//   seed     the parchment's and the pen's wobble (fixed, so a shot is the same every time)
(function () {
  const HANDS = {
    moony: '"Caveat", cursive',                     // careful, slanted, readable: he labels the Map
    padfoot: '"Homemade Apple", cursive',           // big loops and a swagger
    prongs: '"Covered By Your Grace", cursive',     // quick and scruffy, never stopping to tidy
    title: '"Berkshire Swash", cursive',            // the great, curly green words
    clementine: '"Fondamento", cursive',            // her letters' hand (the Common room's HANDS.clementine)
    print: '"IM Fell English", Georgia, serif'      // the engraved look's lettering
  };
  const FONTS = 'https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Caveat:wght@400;600' +
    '&family=Homemade+Apple&family=Covered+By+Your+Grace&family=Fondamento&family=IM+Fell+English:ital@0;1&display=swap';
  const LOOKS = {
    pen: { ink: '#3b2516', wash: '#3b2516', wobble: 0.55, wall: 1.0, hatch: 'wall', towers: 'plan', hand: 'moony', w: 1 },
    raised: { ink: '#3b2516', wash: '#3b2516', wobble: 0.55, wall: 1.0, hatch: 'wall', towers: 'raised', hand: 'moony', w: 1 },
    engraved: { ink: '#1e1712', wash: '#1e1712', wobble: 0, wall: 1.0, hatch: 'ruled', towers: 'plan', hand: 'print', w: 0.8 }
  };
  const GREEN = '#2f6b3a', HER_INK = '#86562c';
  const UNMAPPED = ['den', 'room-of-requirement'];       // the den is her own ink's (den), the Room never on it
  const TITLE = ['Messrs Moony, Wormtail, Padfoot and Prongs', 'Purveyors of Aids to Magical Mischief-Makers',
    'are proud to present', 'THE MARAUDER’S MAP'];
  const PARCHMENT = { x0: -330, y0: 610, k: 0.6, w: 648, h: 648 };   // 1080 m square, the castle in its upper middle
  const phone = (cx, cy, k, w = 390, h = 844) => ({ x0: cx - w / 2 / k, y0: cy + h / 2 / k, k, w, h });

  let drawn = 0;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const f = n => (Math.round(n * 100) / 100).toString();
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // the model's frames: a group's point turned by place.turn (counter-clockwise) and moved to place.x, place.y
  function frames(model) {
    const G = {};
    for (const g of model.groups || []) G[g.id] = g.place;
    const toSite = (p, gid) => {
      const pl = gid && G[gid]; if (!pl) return p;
      const t = pl.turn * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
      return [pl.x + p[0] * c - p[1] * s, pl.y + p[0] * s + p[1] * c];
    };
    return toSite;
  }
  const circlePts = (c, r, n = 40, keep) => { const out = [];
    for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI, p = [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
      if (!keep || keep(p)) out.push(p); } return out; };
  const rectPts = r => [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]];

  // an opening given by its bearing on a round room's wall, in the group's frame (from the group's y toward its x)
  function onWall(model, op) {
    const room = (model.rooms || []).find(r => r.id === op.between[0] && r.shape.circle) || {};
    const c = room.shape ? room.shape.circle : [0, 0], r = room.shape ? room.shape.r : 0, b = op.bearing * Math.PI / 180;
    return [c[0] + r * Math.sin(b), c[1] + r * Math.cos(b)];
  }
  // where a model id stands, in the site frame
  function locate(model, at) {
    const toSite = frames(model);
    if (Array.isArray(at)) return at;
    if (at && at.p) return toSite(at.p, at.group);
    const all = [].concat(model.rooms || [], model.openings || [], model.features || [], model.grounds || [],
      model.towers || [], model.masses || [], model.courts || []);
    const o = all.find(o => o.id === at); if (!o) return null;
    const room = o.room && (model.rooms || []).find(r => r.id === o.room);
    const gid = o.group || (room && room.group) || (o.between && ((model.rooms || []).find(r => r.id === o.between[0]) || {}).group);
    if (o.c) return o.c;
    if (o.at) return toSite(o.at, gid);
    if (o.bearing != null && o.between) return toSite(onWall(model, o), gid);
    if (o.rect) return [(o.rect[0] + o.rect[2]) / 2, (o.rect[1] + o.rect[3]) / 2];
    const sh = o.shape || {};
    if (sh.point) return sh.point;
    if (sh.circle) return toSite(sh.circle, gid);
    if (sh.rect) return toSite([(sh.rect[0] + sh.rect[2]) / 2, (sh.rect[1] + sh.rect[3]) / 2], gid);
    if (sh.ellipse) return [sh.ellipse[0], sh.ellipse[1]];
    if (sh.rects) return [(sh.rects[0][0] + sh.rects[0][2]) / 2, (sh.rects[0][1] + sh.rects[sh.rects.length - 1][3]) / 2];
    return null;
  }

  function svg(model, o = {}) {
    const L = LOOKS[o.look || 'raised'], V = o.view || PARCHMENT, k = V.k, R = rng(o.seed || 7);
    const toSite = frames(model);
    const P = p => [(p[0] - V.x0) * k, (V.y0 - p[1]) * k];
    const id = 'm' + (++drawn);                        // each drawing's own ids, so two on one page never share a mask
    const inView = (p, pad = 40) => { const q = P(p); return q[0] > -pad && q[0] < V.w + pad && q[1] > -pad && q[1] < V.h + pad; };
    // a pen line through site points, a little wobble so no two strokes are alike
    const line = (pts, close, w = 1, extra = '') => {
      let d = '', a = L.wobble;
      const px = pts.map(P);
      const seq = close ? px.concat([px[0]]) : px;
      for (let i = 0; i < seq.length; i++) {
        const q = seq[i];
        if (i === 0) { d += `M${f(q[0])},${f(q[1])}`; continue; }
        const p0 = seq[i - 1], dx = q[0] - p0[0], dy = q[1] - p0[1], len = Math.hypot(dx, dy),
          off = (p0[0] < -20 && q[0] < -20) || (p0[0] > V.w + 20 && q[0] > V.w + 20) || (p0[1] < -20 && q[1] < -20) || (p0[1] > V.h + 20 && q[1] > V.h + 20),
          n = a && !off ? Math.max(1, Math.round(len / 5)) : 1;
        for (let j = 1; j <= n; j++) {
          const t = j / n, off = j < n && a ? (R() - 0.5) * 2 * a : 0;
          d += `L${f(p0[0] + dx * t - dy / len * off)},${f(p0[1] + dy * t + dx / len * off)}`;
        }
      }
      return `<path d="${d}${close ? 'Z' : ''}" fill="none" stroke="${L.ink}" stroke-width="${f(w * L.w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
    };
    const boxes = [];                                      // the room each word has taken, in pixels
    const take = (x, y, w, h) => { if (boxes.some(b => x < b[0] + b[2] && b[0] < x + w && y < b[1] + b[3] && b[1] < y + h)) return false;
      boxes.push([x, y, w, h]); return true; };
    const lab = (p, text, px, o2 = {}) => {
      const q = P(p), fam = HANDS[o2.hand || L.hand];
      if (!o2.rot) { const w = text.length * px * 0.44, x = q[0] + (o2.dx || 0), y = q[1] + (o2.dy || 0);
        if (x + w / 2 < 0 || x - w / 2 > V.w || y < 0 || y - px > V.h) return '';
        if (!take(o2.anchor === 'start' ? x : x - w / 2, y - px * 0.8, w, px)) return ''; }
      return `<text x="${f(q[0] + (o2.dx || 0))}" y="${f(q[1] + (o2.dy || 0))}" font-family='${fam}' font-size="${f(px)}" fill="${o2.color || L.ink}" text-anchor="${o2.anchor || 'middle'}" ${o2.italic ? 'font-style="italic"' : ''} ${o2.rot ? `transform="rotate(${o2.rot} ${f(q[0])} ${f(q[1])})"` : ''} paint-order="stroke" stroke="#e9d9ad" stroke-width="${f(px * 0.22)}" stroke-linejoin="round">${esc(text)}</text>`;
    };
    const lp = Math.max(9, Math.min(15, 3.2 * k + 4));     // a place's label in pixels, the Map's own small hand
    // the dots, each a tiny blot of ink with its name in minuscule writing beside it
    let dots = '', me = null;
    const np = Math.max(11, Math.min(14, 2.4 * k + 3));     // a name's pixels: the smallest that a phone still reads
    for (const d of o.dots || []) {
      const p = locate(model, d.at); if (!p) continue;
      const q = P(p); if (d.me && !me) me = q;
      const r = Math.max(2.2, 0.5 * k);
      const blot = `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(r + 0.9)}" fill="${L.ink}" opacity="0.18"/><circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(r)}" fill="${L.ink}"/>`;
      dots += blot;
      // the name beside its dot on its side, else the other side, else a line above or below
      const tw = d.name.length * np * 0.44;
      take(q[0] - r - 1, q[1] - r - 1, 2 * r + 2, 2 * r + 2);
      let side = 0, ny = 0;
      for (const [sd, dy] of [[d.side || 1, 0], [-(d.side || 1), 0], [d.side || 1, -np * 0.7], [d.side || 1, np * 0.7]]) {
        const bx = sd > 0 ? q[0] + r + 3 : q[0] - r - 3 - tw;
        if (take(bx, q[1] + dy - np * 0.6, tw, np * 1.05)) { side = sd; ny = dy; break; }
      }
      if (!side) continue;
      dots += `<text x="${f(q[0] + side * (r + 3))}" y="${f(q[1] + ny + np * 0.32)}" text-anchor="${side > 0 ? 'start' : 'end'}" font-family='${HANDS[L.hand === 'print' ? 'print' : 'moony']}' font-size="${f(np)}" ${L.hand === 'print' ? 'font-style="italic"' : 'font-weight="600"'} fill="${L.ink}" paint-order="stroke" stroke="#e9d9ad" stroke-width="${f(np * 0.26)}" stroke-linejoin="round">${esc(d.name)}</text>`;
    }
    if (!me) me = [V.w / 2, V.h / 2];
    let ground = '', castle = '', raised = '', labels = '';
    // the den, in her older brown ink and her hand, spreading on its own from the little door a beat later (B15 t1)
    let den = '';
    if (o.den) {
      const dr = (model.rooms || []).find(r => r.id === 'den'), door = (model.openings || []).find(x => x.id === 'little-door');
      const c = toSite(dr.shape.circle, dr.group), dq = door ? P(toSite(door.at || onWall(model, door), 'gryffindor-suite')) : P(c);
      const herLine = (pts, w) => line(pts, true, w).replace(`stroke="${L.ink}"`, `stroke="${HER_INK}"`);
      let body = `<path d="M${circlePts(c, dr.shape.r, 40).map(P).map(q => f(q[0]) + ',' + f(q[1])).join('L')}Z" fill="#e2c592"/>` +
        herLine(circlePts(c, dr.shape.r, 40), 1.7) + herLine(circlePts(c, dr.shape.r - 0.45, 40), 0.7);
      const cq = P(c);
      body += `<text x="${f(cq[0])}" y="${f(cq[1] + 4)}" text-anchor="middle" font-family='${HANDS.clementine}' font-size="${f(Math.max(11, 1.6 * k))}" font-weight="bold" fill="${HER_INK}">C.A.’s</text>`;
      const reach = Math.hypot(cq[0] - dq[0], cq[1] - dq[1]) + dr.shape.r * k + 8;
      den = `<defs><radialGradient id="dg${id}" gradientUnits="userSpaceOnUse" cx="${f(dq[0])}" cy="${f(dq[1])}" r="${f(reach)}"><stop offset="${f(Math.max(0, o.den - 0.05))}" stop-color="#fff"/><stop offset="${f(Math.min(1, o.den + 0.05))}" stop-color="#000"/></radialGradient><mask id="dm${id}"><rect width="${V.w}" height="${V.h}" fill="url(#dg${id})"/></mask></defs><g mask="url(#dm${id})">${body}</g>`;
      const rk = dr.shape.r * k; take(cq[0] - rk, cq[1] - rk, 2 * rk, 2 * rk);
      if (o.denNote && (o.den >= 1 || o.live)) {                      // the three's line, once, in Moony's hand
        const nx = Math.max(8, cq[0] - rk), ny = cq[1] + rk + np * 1.5;
        take(nx, ny - np, np * 0.44 * 34, np * 2.4);
        den += ['Messrs Moony, Padfoot', 'and Prongs did not', 'draw this.'].map((t, i) => `<text x="${f(nx)}" y="${f(ny + i * np * 1.15)}" font-family='${HANDS.moony}' font-size="${f(np + 1)}" fill="${L.ink}">${t}</text>`).join('');
        if (o.live) den = den.replace(/(<text[^>]*?)>(Messrs|and Prongs|draw this)/g, '$1 class="dn" opacity="0">$2');
      }
    }


    // the grounds: the lake's shore with its ripples, the forest's trees, the pitch, the cabin, the road
    for (const g of model.grounds || []) {
      const s = g.shape;
      if (s.poly && g.id === 'lake') {
        ground += line(s.poly, true, 1.1);
        for (let r = 1; r <= 3; r++) {                       // three ripple lines inside the shore, shorter each time
          const c = s.poly.reduce((a, p) => [a[0] + p[0] / s.poly.length, a[1] + p[1] / s.poly.length], [0, 0]);
          const sh = s.poly.map(p => [p[0] + (c[0] - p[0]) * r * 0.035, p[1] + (c[1] - p[1]) * r * 0.035]);
          ground += line(sh, true, 0.5, `stroke-dasharray="${f(6 + r * 4)} ${f(5 + r * 3)}" opacity="${f(0.75 - r * 0.15)}"`);
        }
        labels += lab([120, -300], 'the lake', lp * 1.6, { italic: true });
      } else if (s.poly) {                                   // the forest: little round trees inside its edge
        ground += line(s.poly, true, 0.6, 'stroke-dasharray="2 4"');
        const xs = s.poly.map(p => p[0]), ys = s.poly.map(p => p[1]);
        const inside = (x, y) => { let c = false; for (let i = 0, j = s.poly.length - 1; i < s.poly.length; j = i++) {
          const a = s.poly[i], b = s.poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
        const step = Math.max(19, 12 / k);
        for (let y = Math.max(...ys); y > Math.min(...ys); y -= step) for (let x = Math.min(...xs); x < Math.max(...xs); x += step) {
          const jx = x + (R() - 0.5) * step * 0.8, jy = y + (R() - 0.5) * step * 0.8;
          if (!inside(jx, jy) || !inView([jx, jy])) continue;
          const q = P([jx, jy]), r = Math.max(1.6, step * k * 0.36) * (0.8 + R() * 0.4);
          ground += `<path d="M${f(q[0] - r)},${f(q[1])} a${f(r)},${f(r * 0.9)} 0 1 1 ${f(2 * r)},0 a${f(r * 0.5)},${f(r * 0.4)} 0 0 1 ${f(-2 * r)},0 M${f(q[0])},${f(q[1] + r * 0.2)} v${f(r * 0.6)}" fill="none" stroke="${L.ink}" stroke-width="${f(0.6 * L.w)}"/>`;
        }
        labels += lab([520, 150], 'the Forbidden Forest', lp * 1.5, { italic: true, rot: 70 });
      } else if (s.ellipse) {                                // the pitch and its three hoops each end
        const e = s.ellipse; ground += line(circlePts([0, 0], 1, 48).map(p => [e[0] + p[0] * e[2], e[1] + p[1] * e[3]]), true, 0.8);
        for (const end of [-1, 1]) for (const dx of [-6, 0, 6]) { const q = P([e[0] + dx, e[1] + end * (e[3] - 6)]);
          ground += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(Math.max(1, 1.6 * k))}" fill="none" stroke="${L.ink}" stroke-width="${f(0.6 * L.w)}"/>`; }
        labels += lab([e[0], e[1] - 4], 'Quidditch pitch', lp);
      } else if (s.rects) { for (const r of s.rects) ground += line(rectPts(r), true, 0.6); labels += lab([218, 18], 'the greenhouses', lp); }
      else if (s.rect) { ground += line(rectPts(s.rect), true, 0.5, 'stroke-dasharray="3 3"'); }
      else if (s.line) { const off = 2.5;                    // a road: two lines, the drive and the way to the village
        ground += line(s.line.map(p => [p[0] - off, p[1]]), false, 0.6) + line(s.line.map(p => [p[0] + off, p[1]]), false, 0.6);
        if (g.id === 'road-to-hogsmeade') labels += lab([-230, 405], 'to Hogsmeade', lp, { italic: true, rot: -8 }); }
      else if (s.point) {
        const q = P(s.point), r = Math.max(2.4, 4 * k);
        if (g.id === 'hagrids-cabin') { ground += `<path d="M${f(q[0] - r)},${f(q[1] + r * 0.6)} h${f(2 * r)} v${f(-r)} l${f(-r)},${f(-r * 0.8)} l${f(-r)},${f(r * 0.8)} Z" fill="none" stroke="${L.ink}" stroke-width="${f(0.8 * L.w)}"/>`;
          labels += lab(s.point, 'Hagrid’s hut', lp, { dy: r * 2.4 }); }
        else if (g.id === 'whomping-willow' || g.id === 'beech') { for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42;
            ground += `<path d="M${f(q[0])},${f(q[1] + r)} Q${f(q[0] + Math.cos(a) * r * 0.7)},${f(q[1] - r * 0.4)} ${f(q[0] + Math.cos(a) * r * 1.4)},${f(q[1] + Math.sin(a) * r * 1.2 + r)}" fill="none" stroke="${L.ink}" stroke-width="${f(0.6 * L.w)}"/>`; }
          if (g.id === 'whomping-willow') labels += lab(s.point, 'the Whomping Willow', lp, { dy: r * 3 }); }
        else if (g.id === 'gates') { for (const dx of [-5, 5]) { const p = P([s.point[0] + dx, s.point[1]]);
          ground += `<rect x="${f(p[0] - 1.5)}" y="${f(p[1] - 1.5)}" width="3" height="3" fill="${L.ink}"/>`; } }
      }
    }

    // the castle on the floor his dot stands on: each range's walls drawn thick, its courts stippled
    const wallT = 1.4;
    for (const m of model.masses || []) {
      if (m.floors === 'B') continue;
      const r = m.rect;
      castle += line(rectPts(r), true, 1.3 * L.wall);
      castle += line(rectPts([r[0] + wallT, r[1] + wallT, r[2] - wallT, r[3] - wallT]), true, 0.6);
    }
    for (const c of model.courts || []) {
      const r = c.rect;
      for (let i = 0; i < (r[2] - r[0]) * (r[3] - r[1]) / 10; i++) {
        const q = P([r[0] + 2 + R() * (r[2] - r[0] - 4), r[1] + 2 + R() * (r[3] - r[1] - 4)]);
        castle += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(Math.max(0.35, 0.18 * k))}" fill="${L.ink}" opacity="0.55"/>`;
      }
      labels += lab([(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], c.id.replace(/^./, ch => ch.toUpperCase()), lp, { italic: true });
    }
    // the stair hall's well and the staircases the model places
    const sc = model.staircases && model.staircases.places || [];
    for (const s of sc) {
      if (!inView(s.at)) continue;
      if (k < 3) continue;
      const q = P(s.at), n = Math.min(8, (s.count || 1) + 3), w = 2.4 * k, h = 0.55 * k;
      if (s.kind === 'spiral') { let d = ''; for (let i = 0; i < 18; i++) { const a = i * 0.6, rr = w * 0.55 * (i / 18);
          d += (i ? 'L' : 'M') + f(q[0] + Math.cos(a) * rr) + ',' + f(q[1] + Math.sin(a) * rr); }
        castle += `<path d="${d}" fill="none" stroke="${L.ink}" stroke-width="${f(0.5 * L.w)}"/>`; }
      else for (let i = 0; i < n; i++) castle += `<path d="M${f(q[0] - w / 2)},${f(q[1] - n * h / 2 + i * h)} h${f(w)}" stroke="${L.ink}" stroke-width="${f(0.5 * L.w)}"/>`;
    }
    // the towers: in plan two rings (raised: stood up as a small elevation, a cone on its drum)
    for (const t of model.towers || []) {
      const pts = circlePts(t.c, t.r, 36);
      castle += `<path d="M${pts.map(P).map(q => f(q[0]) + ',' + f(q[1])).join('L')}Z" fill="#e9d9ad" stroke="none"/>`;
      castle += line(pts, true, 1.3 * L.wall) + line(circlePts(t.c, t.r - 1.1, 36), true, 0.6);
      if (L.towers === 'raised' && k < 2) {
        const q = P(t.c), rw = Math.max(3.2, t.r * k * 1.8), hh = (t.high ? 2.6 : 1.8) * rw, top = q[1] - hh;
        raised += `<g><path d="M${f(q[0] - rw)},${f(q[1])} V${f(top)} A${f(rw)},${f(rw * 0.3)} 0 0 0 ${f(q[0] + rw)},${f(top)} V${f(q[1])} A${f(rw)},${f(rw * 0.3)} 0 0 1 ${f(q[0] - rw)},${f(q[1])} Z" fill="#e6d3a3" stroke="${L.ink}" stroke-width="${f(0.9 * L.w)}"/>`;
        for (let i = 1; i < 6; i++) { const x = q[0] - rw + rw * 2 * i / 6 + rw * 0.25; if (x < q[0] + rw) raised += `<path d="M${f(x)},${f(top + rw * 0.3)} V${f(q[1])}" stroke="${L.ink}" stroke-width="0.4" opacity="${f(0.15 + i * 0.09)}"/>`; }
        raised += `<path d="M${f(q[0] - rw * 1.1)},${f(top)} L${f(q[0])},${f(top - rw * 2.2)} L${f(q[0] + rw * 1.1)},${f(top)} Z" fill="#dcc592" stroke="${L.ink}" stroke-width="${f(0.9 * L.w)}"/>`;
        raised += `<path d="M${f(q[0])},${f(top - rw * 2.2)} v${f(-rw * 0.5)} l${f(rw * 0.5)},${f(rw * 0.15)} l${f(-rw * 0.5)},${f(rw * 0.15)}" fill="none" stroke="${L.ink}" stroke-width="0.6"/>`;
        for (let i = 0; i < 2; i++) raised += `<rect x="${f(q[0] - rw * 0.12 + (i - 0.5) * rw * 0.7)}" y="${f(top + hh * 0.35)}" width="${f(rw * 0.24)}" height="${f(rw * 0.45)}" rx="${f(rw * 0.12)}" fill="${L.ink}" opacity="0.7"/>`;
        raised += '</g>';
        labels += lab(t.c, t.id, lp, { dy: rw * 0.3 + lp * 1.1 });
      } else labels += lab(t.c, t.id, lp, { dy: t.r * k + lp * 1.05 });
    }
    // the rooms the model holds on this floor, in their group's frame where they have one
    // (never the Room of Requirement: "I've never seen the Room of Requirement on there!", HBP 21, B6 L62564)
    const floorRooms = (model.rooms || []).filter(r => r.level === (o.floor || '7') && !UNMAPPED.includes(r.id));
    for (const r of floorRooms) {
      const s = r.shape, g = r.group;
      if (s.circle) {
        const keep = s.clip ? p => p[0] <= s.clip.x_max : null;
        const pts = circlePts(s.circle, s.r, 40, keep).map(p => toSite(p, g));
        castle += `<path d="M${pts.map(P).map(q => f(q[0]) + ',' + f(q[1])).join('L')}Z" fill="#e9d9ad"/>` + line(pts, true, 0.9);
      } else if (s.rect) castle += line(rectPts(s.rect).map(p => toSite(p, g)), true, 0.9);
      // at a phone's zoom a room outside the suite carries its name, the model's up to its first comma (req 244)
      if (k >= 2 && !g && r.id !== 'room-corridor') labels += lab(locate(model, r.id), r.name.split(',')[0], lp * 0.9, { italic: true });
    }
    for (const op of model.openings || []) {                 // the round hole and the doors, a gap marked by a tick
      if (!['portrait-hole', 'polite-door', 'little-door', 'bookcase'].includes(op.id)) continue;
      const room = (model.rooms || []).find(r => r.id === (op.between || [])[0]) || {};
      const q = P(toSite(op.at || onWall(model, op), room.group || 'gryffindor-suite'));
      castle += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(Math.max(1, 0.6 * k))}" fill="#e9d9ad" stroke="${L.ink}" stroke-width="${f(0.6 * L.w)}"/>`;
    }
    if (k >= 2 && (o.floor || '7') === '7') {               // at a phone's zoom the seventh floor's own names
      labels += lab(toSite([0, 0], 'gryffindor-suite'), 'common room', lp * 0.9, { dy: -2.6 * k, italic: true });
      labels += lab(toSite([0, 16], 'gryffindor-suite'), 'the Fat Lady’s corridor', lp * 0.9, { dy: -2.4 * k, italic: true });
      labels += lab([42, 50.6 + 1.5], 'the seventh floor corridor', lp * 0.9, { dy: lp * 0.35, italic: true });
    }
    if (k >= 2) labels += lab([80, 25], 'the Grand Staircase', lp, { rot: -90, italic: true, dx: -6 * k });   // every floor's


    // the title, across the top of the parchment: great, curly green words
    let title = '';
    if (o.title !== 0 || o.live) {
      const tq = P([150, 600]), tk = Math.max(0.6, k);
      const sizes = [13, 12, 11, 27].map(s => s * (o.titleScale || 1) * k / PARCHMENT.k);
      let y = tq[1];
      TITLE.forEach((t, i) => { y += sizes[i] * (i === 3 ? 1.15 : 1.35);
        title += `<text x="${f(tq[0])}" y="${f(y)}" text-anchor="middle" font-family='${HANDS.title}' font-size="${f(sizes[i])}" fill="${GREEN}">${esc(t)}</text>`; });
      const tv = o.title == null ? 1 : o.title;
      title = `<g id="tt${id}" opacity="${f(Math.min(1, tv * 1.3))}" ${tv < 1 || o.live ? `filter="url(#bl${id})"` : ''}>${title}</g>`;
    }

    // the invisible hands' lines
    let notes = '';
    for (const n of o.notes || []) notes += `<text x="${n.x}" y="${n.y}" font-family='${HANDS[n.hand]}' font-size="${n.px || 16}" fill="${L.ink}">${esc(n.text)}</text>`;

    // the web: the ink runs from his own dot in threads and rings, and the Map stands inside it
    const sp = o.spread == null ? 1 : o.spread, far = Math.hypot(V.w, V.h);
    let web = '', mask = '';
    if (sp < 1 || o.live) {
      const rr = sp * far, Rw = rng(11), wr = o.live ? far : rr;
      const spokes = 22, angs = Array.from({ length: spokes }, (_, i) => (i + Rw() * 0.6) / spokes * 2 * Math.PI);
      for (const a of angs) web += `<path d="M${f(me[0])},${f(me[1])} L${f(me[0] + Math.cos(a) * wr * 1.35)},${f(me[1] + Math.sin(a) * wr * 1.35)}" stroke="${L.ink}" stroke-width="0.9" opacity="0.9"/>`;
      for (let ring = 1; ring <= 9; ring++) { const rad = wr * 1.35 * ring / 9;
        web += `<path d="M${angs.map(a => f(me[0] + Math.cos(a) * rad * (0.92 + Rw() * 0.12)) + ',' + f(me[1] + Math.sin(a) * rad * (0.92 + Rw() * 0.12))).join('L')}Z" fill="none" stroke="${L.ink}" stroke-width="0.7" opacity="${f(0.95 - ring * 0.05)}"/>`; }
      web = `<g mask="url(#wm${id})">${web}</g>`;
      mask = `<radialGradient id="wg${id}" gradientUnits="userSpaceOnUse" cx="${f(me[0])}" cy="${f(me[1])}" r="${f(Math.max(1, rr))}"><stop offset="0.82" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
        <mask id="sm${id}"><rect width="${V.w}" height="${V.h}" fill="url(#wg${id})"/></mask>
        <radialGradient id="wr${id}" gradientUnits="userSpaceOnUse" cx="${f(me[0])}" cy="${f(me[1])}" r="${f(Math.max(1, rr * 1.4))}"><stop offset="0.45" stop-color="#000"/><stop offset="0.58" stop-color="#fff"/><stop offset="0.85" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
        <mask id="wm${id}"><rect width="${V.w}" height="${V.h}" fill="url(#wr${id})"/></mask>`;
    }

    const parch = parchment(V, id, o.seed || 7, o.folds !== false);
    if (o.blank) { ground = castle = raised = labels = den = ''; dots = ''; title = ''; }
    const masked = sp < 1 || o.live;
    const map = `<g ${masked ? `mask="url(#sm${id})"` : ''}>${ground}${castle}${raised}${labels}${den}</g>`;
    const showDots = o.live ? `<g mask="url(#sm${id})">${dots}</g>` : sp >= 1 ? dots : (sp > 0 ? `<g mask="url(#sm${id})">${dots}</g>` : '');
    return `<svg xmlns="http://www.w3.org/2000/svg" data-map="${id}" viewBox="0 0 ${V.w} ${V.h}" width="${V.w}" height="${V.h}">
<defs>${parch.defs}${mask}<filter id="bl${id}"><feGaussianBlur stdDeviation="${f((1 - Math.min(1, o.title == null ? 1 : o.title)) * 4)}"/></filter>
<filter id="ink${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="${o.seed || 7}"/><feDisplacementMap in="SourceGraphic" scale="${L.wobble ? 0.9 : 0}"/></filter></defs>
${parch.body}<g filter="url(#ink${id})" opacity="0.92">${map}${web}${sp >= 1 || o.title || o.live ? title : ''}</g>${showDots}${notes}${parch.over}</svg>`;
  }

  // the parchment: warm and mottled, darker at its worn edges, folded in quarters
  function parchment(V, id, seed, folds) {
    const defs = `<filter id="pn${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="${seed}"/>
      <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.27  0 0 0 0 0.10  0 0 0 0.55 -0.12"/></filter>
      <filter id="pf${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="${seed + 3}"/>
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.18 0"/></filter>
      <radialGradient id="pv${id}" cx="50%" cy="50%" r="72%"><stop offset="0.6" stop-color="#7a4f22" stop-opacity="0"/><stop offset="1" stop-color="#6b4219" stop-opacity="0.45"/></radialGradient>`;
    const body = `<rect width="${V.w}" height="${V.h}" fill="#e9d9ad"/><rect width="${V.w}" height="${V.h}" filter="url(#pn${id})"/><rect width="${V.w}" height="${V.h}" filter="url(#pf${id})"/>`;
    let over = `<rect width="${V.w}" height="${V.h}" fill="url(#pv${id})"/>`;
    if (folds) for (const t of [1 / 3, 2 / 3]) {
      over += `<path d="M${f(V.w * t)},0 V${V.h}" stroke="#6b4219" stroke-opacity="0.16" stroke-width="2"/><path d="M${f(V.w * t + 1.5)},0 V${V.h}" stroke="#fff6dc" stroke-opacity="0.35" stroke-width="1"/>`;
      over += `<path d="M0,${f(V.h * t)} H${V.w}" stroke="#6b4219" stroke-opacity="0.12" stroke-width="2"/><path d="M0,${f(V.h * t + 1.5)} H${V.w}" stroke="#fff6dc" stroke-opacity="0.3" stroke-width="1"/>`;
    }
    return { defs, body, over };
  }

  // A live Map in el (req 242's play is Events'; this only moves the ink): open() spreads the web from his own dot,
  // the green words blossoming at its end, and, when opts.denNew, her brown lines a beat later and slower (B15 t1);
  // wipe() lets the ink sink away; note(hand, text) writes one line on the blank parchment, left to right.
  function mount(el, model, opts = {}) {
    el.innerHTML = svg(model, Object.assign({}, opts, { live: true, spread: 0, title: 0, den: opts.den || opts.denNew ? 0.0001 : 0 }));
    const root = el.querySelector('svg'), id = root.getAttribute('data-map'), $ = s => root.querySelector(s);
    const far = Math.hypot(+root.getAttribute('width'), +root.getAttribute('height'));
    const tween = (ms, fn) => new Promise(done => { const t0 = performance.now();
      const step = now => { const t = Math.min(1, Math.max(0, (now - t0) / ms)); fn(t); t < 1 ? requestAnimationFrame(step) : done(); };
      requestAnimationFrame(step); });
    const ease = t => t * t * (3 - 2 * t);
    const spread = v => { $('#wg' + id).setAttribute('r', Math.max(0.01, v * far)); $('#wr' + id).setAttribute('r', Math.max(0.01, v * far * 1.4)); };
    const title = v => { const g = $('#tt' + id); if (g) g.setAttribute('opacity', Math.min(1, v * 1.3));
      const b = $('#bl' + id + ' feGaussianBlur'); if (b) b.setAttribute('stdDeviation', (1 - v) * 4); };
    const den = v => { const st = root.querySelectorAll('#dg' + id + ' stop'); if (st.length) {
      st[0].setAttribute('offset', Math.max(0, v - 0.05)); st[1].setAttribute('offset', Math.min(1, v + 0.05)); } };
    const ink = $('g[filter]');
    return {
      async open(ms = 2600) {
        ink.setAttribute('opacity', 0.92);
        await tween(ms, t => { spread(ease(t) * 1.15); title(Math.max(0, (t - 0.6) / 0.4)); });
        if (opts.denNew) { await new Promise(r => setTimeout(r, 600)); await tween(ms * 0.9, t => den(ease(t)));
          root.querySelectorAll('.dn').forEach(n => n.setAttribute('opacity', 1)); }
        else if (opts.den) den(1);
      },
      async wipe(ms = 1200) { await tween(ms, t => ink.setAttribute('opacity', 0.92 * (1 - t))); spread(0); title(0); },
      async note(hand, text, x = 16, y = 40, px = 18, ms = 1800) {
        const ns = 'http://www.w3.org/2000/svg', clip = document.createElementNS(ns, 'clipPath'), r = document.createElementNS(ns, 'rect');
        clip.id = 'nc' + id + '-' + Math.floor(y); r.setAttribute('x', x); r.setAttribute('y', y - px * 1.4); r.setAttribute('height', px * 2); r.setAttribute('width', 0);
        clip.appendChild(r); root.querySelector('defs').appendChild(clip);
        const tx = document.createElementNS(ns, 'text'); tx.setAttribute('x', x); tx.setAttribute('y', y); tx.setAttribute('font-size', px);
        tx.setAttribute('font-family', HANDS[hand].replace(/"/g, '')); tx.setAttribute('fill', LOOKS[opts.look || 'raised'].ink);
        tx.setAttribute('clip-path', `url(#${clip.id})`); tx.textContent = text; root.appendChild(tx);
        const w = tx.getComputedTextLength() + 8; await tween(ms, t => r.setAttribute('width', t * w)); return tx;
      }
    };
  }

  const api = { svg, mount, locate, phone, PARCHMENT, HANDS, FONTS, LOOKS, TITLE, GREEN, HER_INK };
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof window !== 'undefined') window.LumosMap = api;
})();
