/* The Waddiwasi judging, tallied in node: node page/charms/checks/waddiwasi-tally.js
   Loads page/charms/spells.js and runs drawn aims through judgeAim at a phone and an iPad size and every ease, the
   gum's reach 0.06 and the nose's size 0.035 of the screen's short side, Peeves near (0.35 of it away) or far (0.8),
   to the right, up and to the right, or straight up. Each shape is marked with what it is meant to be at kind, fair
   and strict: a hit, or the miss's reason. The pairs that carry the lesson: the same angle off hits near and misses
   far. Prints each miss of meaning and the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* a stroke from the gum (moved by off: [along, across] in the gum's reaches, across + to the right of the line),
   at dir + err degrees (0 to the right, 90 up the screen), len pixels long; bow bends it (the bulge at its middle as a
   share of its length), wob trembles it (a share of its length, three half waves), back runs on past the end and back (a share) */
function stroke(g, dir, err, len, o) {
  o = o || {};
  var t = (dir + err) * Math.PI / 180, ux = Math.cos(t), uy = -Math.sin(t), nx = -uy, ny = ux;
  var d0 = dir * Math.PI / 180, tx = Math.cos(d0), ty = -Math.sin(d0), off = o.off || [0, 0];
  var a = { x: g.x + (tx * off[0] - ty * off[1]) * g.r, y: g.y + (ty * off[0] + tx * off[1]) * g.r };
  if (o.aimFromStart) { var to = o.aimFromStart, dd = Math.hypot(to.x - a.x, to.y - a.y); ux = (to.x - a.x) / dd; uy = (to.y - a.y) / dd; nx = -uy; ny = ux; }
  var n = 30, out = [], i, k, w;
  for (i = 0; i <= n; i++) {
    k = i / n; w = (o.bow || 0) * len * 4 * k * (1 - k) + (o.wob || 0) * len * Math.sin(k * Math.PI * 3);
    out.push({ x: a.x + ux * len * k + nx * w, y: a.y + uy * len * k + ny * w, t: i * 15 });
  }
  if (o.back) {
    var e = out[out.length - 1];
    for (i = 1; i <= 10; i++) { var s = o.back * len * Math.sin(i / 10 * Math.PI); out.push({ x: e.x + ux * s, y: e.y + uy * s, t: 450 + i * 15 }); }
  }
  return out;
}

var EASES = ['kind', 'fair', 'strict'], bad = [], n = 0, seen = 0;
[[390, 844], [1180, 820]].forEach(function (size) {
  var W = size[0], H = size[1], M = Math.min(W, H);
  var g = { x: W * 0.25, y: H * 0.7, r: M * 0.06 };
  function target(dir, far) { var d = M * (far ? 0.8 : 0.35), t = dir * Math.PI / 180; return { x: g.x + Math.cos(t) * d, y: g.y - Math.sin(t) * d, r: M * 0.035 }; }
  var near = M * 0.35, far = M * 0.8;
  /* [name, dir, far, err, len, opts, [kind, fair, strict], side] */
  var shapes = [
    ['dead on, to the nose', 0, false, 0, near, {}, ['hit', 'hit', 'hit']],
    ['dead on, far', 0, true, 0, far, {}, ['hit', 'hit', 'hit']],
    ['dead on, up and right', 45, false, 0, near, {}, ['hit', 'hit', 'hit']],
    ['dead on, straight up, far', 90, true, 0, far, {}, ['hit', 'hit', 'hit']],
    ['to the nose and on past', 0, false, 0, near * 1.4, {}, ['hit', 'hit', 'hit']],
    ['a pointer, half the way', 0, false, 0, near * 0.5, {}, ['hit', 'hit', 'hit']],
    ['a pointer, a third of the way, far', 45, true, 0, far / 3, {}, ['hit', 'hit', 'hit']],
    ['5 degrees off, near: the pair', 0, false, 5, near, {}, ['hit', 'hit', 'hit']],
    ['5 degrees off, far: the pair', 0, true, 5, far, {}, ['wide', 'wide', 'wide'], 'high'],
    ['5 degrees off, up, near: the pair', 90, false, -5, near, {}, ['hit', 'hit', 'hit']],
    ['5 degrees off, up, far: the pair', 90, true, -5, far, {}, ['wide', 'wide', 'wide'], 'right'],
    ['6.3 degrees off, near', 0, false, 6.3, near, {}, ['hit', 'hit', 'wide']],
    ['7.8 degrees off, near', 0, false, -7.8, near, {}, ['hit', 'wide', 'wide'], 'low'],
    ['2.7 degrees off, far', 45, true, 2.7, far, {}, ['hit', 'hit', 'wide']],
    ['3.4 degrees off, far', 45, true, -3.4, far, {}, ['hit', 'wide', 'wide']],
    ['20 degrees high', 0, false, 20, near, {}, ['wide', 'wide', 'wide'], 'high'],
    ['20 degrees low', 0, false, -20, near, {}, ['wide', 'wide', 'wide'], 'low'],
    ['20 degrees left, aiming up', 90, false, 20, near, {}, ['wide', 'wide', 'wide'], 'left'],
    ['20 degrees right, aiming up', 90, false, -20, near, {}, ['wide', 'wide', 'wide'], 'right'],
    ['backwards', 0, false, 180, near, {}, ['away', 'away', 'away']],
    ['nearly at right angles', 0, false, 80, near, {}, ['wide', 'wide', 'wide']],
    ['begun 0.8 off the gum, aimed at the nose', 0, false, 0, near, { off: [0, 0.8], aim: true }, ['hit', 'hit', 'hit']],
    ['begun 1.15 off, aimed at the nose', 0, false, 0, near, { off: [0, -1.15], aim: true }, ['hit', 'hit', 'off']],
    ['begun 1.45 off, aimed at the nose', 0, false, 0, near, { off: [-1.45, 0], aim: true }, ['hit', 'off', 'off']],
    ['begun 2 off', 0, false, 0, near, { off: [0, 2], aim: true }, ['off', 'off', 'off']],
    ['begun at the nose, drawn back to the gum', 180, false, 0, near, { off: [0, 0], fromNose: true }, ['off', 'off', 'off']],
    ['a parallel line, 0.8 off the middle', 0, false, 0, near, { off: [0, 0.8] }, ['hit', 'wide', 'wide']],
    ['a slight bow', 0, false, 0, near, { bow: 0.08 }, ['hit', 'hit', 'hit']],
    ['a bow', 0, false, 0, near, { bow: 0.19 }, ['hit', 'hit', 'wiggly']],
    ['a deeper bow', 0, false, 0, near, { bow: 0.27 }, ['hit', 'wiggly', 'wiggly']],
    ['an arc', 0, false, 0, near, { bow: 0.45 }, ['wiggly', 'wiggly', 'wiggly']],
    ['a tremble', 0, false, 0, near, { wob: 0.01 }, ['hit', 'hit', 'hit']],
    ['a scribble', 0, false, 0, near, { wob: 0.2 }, ['wiggly', 'wiggly', 'wiggly']],
    ['on past the nose and back', 0, false, 0, near, { back: 0.3 }, ['wiggly', 'wiggly', 'wiggly']],
    ['a nudge, 1.2 reaches', 0, false, 0, 'r1.2', {}, ['short', 'short', 'short']],
    ['a little line, 1.8 reaches', 0, false, 0, 'r1.8', {}, ['hit', 'short', 'short']],
    ['a little line, 2.2 reaches', 0, false, 0, 'r2.2', {}, ['hit', 'hit', 'short']],
    ['a short line, 3 reaches', 0, false, 0, 'r3', {}, ['hit', 'hit', 'hit']],
    ['a tap', 0, false, 0, 'tap', {}, ['tap', 'tap', 'tap']],
    ['one point', 0, false, 0, 'one', {}, ['tap', 'tap', 'tap']]
  ];
  shapes.forEach(function (sh) {
    var name = sh[0], dir = sh[1], to = target(dir, sh[2]), err = sh[3], len = sh[4], o = Object.assign({}, sh[5]), want = sh[6], side = sh[7], pts;
    if (o.aim) o.aimFromStart = to;
    if (o.fromNose) { var h = { x: to.x, y: to.y, r: g.r }; pts = stroke(h, dir, 0, len, {}); }
    else if (len === 'tap') pts = [{ x: g.x, y: g.y, t: 0 }, { x: g.x + 2, y: g.y + 1, t: 60 }];
    else if (len === 'one') pts = [{ x: g.x, y: g.y, t: 0 }];
    else pts = stroke(g, dir, err, typeof len === 'string' ? Number(len.slice(1)) * g.r : len, o);
    EASES.forEach(function (ease, i) {
      var j = S.judgeAim(pts, g, to, ease), got = j.verdict === 'hit' ? 'hit' : j.reason; n++;
      if (got !== want[i]) bad.push(W + 'x' + H + ' ' + ease + ' "' + name + '": ' + got + ', meant ' + want[i] + ' (off ' + j.off + ', allow ' + j.allow + ', by ' + j.by + ', straight ' + j.straight.toFixed(3) + ')');
      if (side && got === 'wide') { seen++; n++; if (j.side !== side) bad.push(W + 'x' + H + ' ' + ease + ' "' + name + '": side ' + j.side + ', meant ' + side); }
    });
  });
});
bad.forEach(function (b) { console.log(b); });
console.log((n - bad.length) + ' of ' + n + ' as meant (' + seen + ' sides named)');
