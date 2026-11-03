/* The Ferula judging, tallied in node: node page/charms/checks/ferula-tally.js
   Loads page/charms/spells.js and runs drawn coils through judgeCoil at a phone and an iPad size and every ease, on a
   leg standing up the screen (0.62 of the short side long, its half width 0.07) and one lying across it (a teddy's leg
   held out), with a wide bandage (a sixth of the leg: six turns cover it) and a narrow one (a tenth: ten). Each shape is
   marked with what it is meant to be at kind, fair and strict: bound, or the miss's reason. The pair that carries the
   lesson: the same seven turns bind the wide bandage and leave gaps in the narrow one. Prints each miss of meaning and
   the count. */
var path = require('path');
require(path.join(__dirname, '..', 'spells.js'));
var S = globalThis.LumosSpells;

/* a coil up the leg: turns zigzags (or loops) from s0 to s1 (shares of the leg), swinging amp half widths each side,
   offset across by shift half widths; loop draws each turn as a loop that runs back down by loop (a share of a turn's
   climb); wob trembles a straight run; down reverses it */
function coil(leg, turns, o) {
  o = o || {};
  var L = Math.hypot(leg.b.x - leg.a.x, leg.b.y - leg.a.y), ux = (leg.b.x - leg.a.x) / L, uy = (leg.b.y - leg.a.y) / L, nx = -uy, ny = ux;
  var s0 = o.s0 == null ? 0.02 : o.s0, s1 = o.s1 == null ? 0.98 : o.s1, amp = o.amp == null ? 1.0 : o.amp, n = Math.max(40, Math.round(turns * 24)), out = [], i;
  for (i = 0; i <= n; i++) {
    var k = i / n, s = s0 + (s1 - s0) * k, ph = k * turns * 2 * Math.PI, c = amp * Math.sin(ph) + (o.shift || 0);
    if (o.loop) s -= o.loop * (s1 - s0) / Math.max(turns, 1) * Math.max(0, Math.sin(ph + Math.PI / 2)) * 0.5;
    if (o.wob) c = o.wob * Math.sin(k * Math.PI * 9) + (o.shift || 0);
    out.push({ x: leg.a.x + ux * s * L + nx * c * leg.r, y: leg.a.y + uy * s * L + ny * c * leg.r, t: i * 12 });
  }
  if (o.down) out.reverse();
  return out;
}

var EASES = ['kind', 'fair', 'strict'], bad = [], n = 0;
[[390, 844], [1180, 820]].forEach(function (size) {
  var W = size[0], H = size[1], M = Math.min(W, H), len = M * 0.62, r = M * 0.07;
  var legs = {
    up: { a: { x: W / 2, y: H * 0.5 + len / 2 }, b: { x: W / 2, y: H * 0.5 - len / 2 }, r: r },
    across: { a: { x: W / 2 - len / 2, y: H * 0.5 }, b: { x: W / 2 + len / 2, y: H * 0.5 }, r: r } };
  var WIDE = len / 6, NARROW = len / 10;
  /* [name, turns, opts, bandage, [kind, fair, strict]] */
  var shapes = [
    ['seven turns, wide bandage', 7, {}, WIDE, ['bound', 'bound', 'bound']],
    ['seven turns, narrow bandage', 7, {}, NARROW, ['gaps', 'gaps', 'gaps']],
    ['eleven turns, narrow bandage', 11, {}, NARROW, ['bound', 'bound', 'bound']],
    ['six turns, wide, just enough', 6, {}, WIDE, ['bound', 'bound', 'gaps']],
    ['four turns, wide bandage', 4, {}, WIDE, ['gaps', 'gaps', 'gaps']],
    ['one turn', 1, {}, WIDE, ['gaps', 'gaps', 'gaps']],
    ['seven loops, wide', 7, { loop: 0.5 }, WIDE, ['bound', 'bound', 'bound']],
    ['seven turns, small swings', 7, { amp: 0.7 }, WIDE, ['bound', 'bound', 'bound']],
    ['seven turns, swings too small to cross', 7, { amp: 0.3 }, WIDE, ['straight', 'straight', 'straight']],
    ['a straight line up', 0, {}, WIDE, ['straight', 'straight', 'straight']],
    ['a tremble up the middle', 0, { wob: 0.25 }, WIDE, ['straight', 'straight', 'straight']],
    ['begun a fifth up, eight turns', 8, { s0: 0.2 }, WIDE, ['gaps', 'gaps', 'gaps']],
    ['begun half way up', 5, { s0: 0.55 }, WIDE, ['start', 'start', 'start']],
    ['drawn down the leg', 7, { down: true }, WIDE, ['start', 'start', 'start']],
    ['drawn down from the foot', 7, { s0: 0.02, s1: -0.6 }, WIDE, ['down', 'down', 'down']],
    ['stopped three quarters up', 6, { s1: 0.75 }, WIDE, ['short', 'short', 'short']],
    ['stopped at 0.85, nine turns', 9, { s1: 0.85 }, WIDE, ['gaps', 'short', 'short']],
    ['swinging far off the leg', 7, { amp: 3.2 }, WIDE, ['off', 'off', 'off']],
    ['swinging a little wide', 7, { amp: 1.9 }, WIDE, ['bound', 'bound', 'off']],
    ['off to one side, still crossing', 7, { shift: 0.4 }, WIDE, ['bound', 'bound', 'straight']],
    ['run on past the top (the turns spread wider)', 7, { s1: 1.15 }, WIDE, ['bound', 'bound', 'gaps']],
    ['eight turns run on past the top', 8, { s1: 1.15 }, WIDE, ['bound', 'bound', 'bound']] ];
  ['up', 'across'].forEach(function (lk) {
    shapes.forEach(function (sh) {
      var leg = Object.assign({ w: sh[3] }, legs[lk]), pts = coil(leg, sh[1], sh[2]);
      EASES.forEach(function (e, k) {
        n++; var j = S.judgeCoil(pts, leg, e), want = sh[4][k], got = j.verdict === 'bound' ? 'bound' : j.reason;
        if (got !== want) bad.push(W + 'x' + H + ' ' + lk + ' ' + e + ': ' + sh[0] + ' -> ' + got + ' (meant ' + want + ') turns ' + j.turns + ' climbs ' + j.climbs.join(',') + ' w ' + Math.round(leg.w));
      });
    });
    /* a tap */
    var leg = Object.assign({ w: WIDE }, legs[lk]);
    EASES.forEach(function (e) { n++; var j = S.judgeCoil([leg.a], leg, e); if (j.reason !== 'tap') bad.push(lk + ' ' + e + ': a tap -> ' + j.reason); });
  });
});
/* Q9's fix (13 October 2026): the page's bigger leg and wider bandages, a quarter of the leg (4 turns) and a sixth (6).
   The pair still carries the lesson: four turns bind the wide and leave gaps in the narrow. At kind a bandage may
   climb 1.35 of its width, but the first turn climbs a little further (it counts from his start), so three turns leave a
   gap even there; just enough turns bind at kind and fair, and strict asks a margin, as before. Should a hand's three
   turns bind, the page says it pulled tight to cover. */
[[390, 844], [1180, 820]].forEach(function (size) {
  var W = size[0], H = size[1], M = Math.min(W, H), len = Math.min(M * 0.78, H * 0.46), r = M * 0.09;
  var leg0 = { a: { x: W / 2, y: H * 0.62 + len / 2 }, b: { x: W / 2, y: H * 0.62 - len / 2 }, r: r };
  var WIDE = len / 4, NARROW = len / 6;
  [['two turns, wide', 2, {}, WIDE, ['gaps', 'gaps', 'gaps']],
   ['three turns, wide', 3, {}, WIDE, ['gaps', 'gaps', 'gaps']],
   ['four turns, wide', 4, {}, WIDE, ['bound', 'bound', 'gaps']],
   ['five turns, wide', 5, {}, WIDE, ['bound', 'bound', 'bound']],
   ['four turns, narrow (the pair)', 4, {}, NARROW, ['gaps', 'gaps', 'gaps']],
   ['five turns, narrow', 5, {}, NARROW, ['bound', 'gaps', 'gaps']],
   ['six turns, narrow', 6, {}, NARROW, ['bound', 'bound', 'gaps']],
   ['seven turns, narrow', 7, {}, NARROW, ['bound', 'bound', 'bound']],
   ['four turns stopped at 0.9, narrow', 4, { s1: 0.9 }, NARROW, ['gaps', 'gaps', 'short']],
   ['four loops, wide', 4, { loop: 0.5 }, WIDE, ['bound', 'bound', 'short']],
   ['four turns, small swings, wide', 4, { amp: 0.7 }, WIDE, ['bound', 'bound', 'gaps']],
   ['begun a fifth up, five turns, wide (the foot bare)', 5, { s0: 0.2 }, WIDE, ['gaps', 'gaps', 'gaps']],
   ['a straight line up', 0, {}, WIDE, ['straight', 'straight', 'straight']]].forEach(function (sh) {
    var leg = Object.assign({ w: sh[3] }, leg0), pts = coil(leg, sh[1], sh[2]);
    EASES.forEach(function (e, k) {
      n++; var j = S.judgeCoil(pts, leg, e), want = sh[4][k], got = j.verdict === 'bound' ? 'bound' : j.reason;
      if (got !== want) bad.push('fix ' + W + 'x' + H + ' ' + e + ': ' + sh[0] + ' -> ' + got + ' (meant ' + want + ') turns ' + j.turns + ' climbs ' + j.climbs.join(',') + ' w ' + Math.round(leg.w));
    });
  });
});
bad.forEach(function (b) { console.log(b); });
console.log((n - bad.length) + ' of ' + n + ' as meant');
