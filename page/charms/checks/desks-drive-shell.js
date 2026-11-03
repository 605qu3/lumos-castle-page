/* req 1052's walk: a full Mobiliarbus cast on H71's desks in page/shell.html?place=old-exam-hall&learned, from a stand,
   by the shell's own tap (a pointer tap on the desk), the word, then the stroke drawn on the canvas. Set
   window.DRIVE = { stand, yaw, desk, c, r } before this file's text in --eval; it returns what happened */
(async function () {
  var G = lumosGreybox, o = window.DRIVE, sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function yOf(r) { return 3.0 + r * 1.2; }
  var out = [];
  if (!G.standNamed(o.stand)) return 'no stand ' + o.stand;
  if (o.yaw != null) G.look(o.yaw, o.pitch == null ? -0.35 : o.pitch);
  await sleep(800);
  var H = G.desks(); if (!H) return 'no spell';
  var lc = null;   /* whatever lies on top at the point: the room's canvas for the tap, the spell's own layer once it is up */
  function ev(t, p) {
    if (t === 'pointerdown') lc = document.elementFromPoint(p.x, p.y); if (!lc) throw new Error('nothing on screen at ' + Math.round(p.x) + ',' + Math.round(p.y)); lc.dispatchEvent(new PointerEvent(t, { clientX: p.x, clientY: p.y, pointerId: 1, bubbles: true, isPrimary: true, button: 0 })); }
  var s = H.state().desks[o.desk - 1], at = H.screenOf(s.x, s.y, 0.6);
  out.push('stand ' + G.stand() + ', desk ' + o.desk + ' on screen ' + Math.round(at.x) + ',' + Math.round(at.y));
  out.push('top at the desk: ' + (document.elementFromPoint(at.x, at.y) || {}).tagName); ev('pointerdown', at); await sleep(60); ev('pointerup', at);
  await sleep(300);
  var a = H.casting();
  if (!a) { out.push('tap did not start it; by start()'); a = H.start(o.desk); }
  if (!a) return out.concat('no cast').join(' | ');
  out.push('cast up by ' + (out.length > 2 && out[2].indexOf('start()') > 0 ? 'start()' : 'the tap'));
  await sleep(1000);   /* the head eases toward the desk */
  a.say(); await sleep(300);
  s = H.state().desks[o.desk - 1];
  var from = H.screenOf(CharmsDesks.XC[s.c], yOf(s.r), 0), to = H.screenOf(CharmsDesks.XC[o.c], yOf(o.r), 0), pts = [], i;
  for (i = 0; i <= 14; i++) pts.push({ x: from.x + (to.x - from.x) * i / 14, y: from.y + (to.y - from.y) * i / 14 });
  var on = function (p) { return p.x >= 0 && p.x <= innerWidth && p.y >= 0 && p.y <= innerHeight; };
  ev('pointerdown', pts[0]);
  for (i = 1; i < pts.length; i++) { await sleep(16); ev('pointermove', pts[i]); }
  ev('pointerup', pts[pts.length - 1]);
  await sleep(2800);
  var st = H.state(), d = st.desks[o.desk - 1];
  out.push((on(from) && on(to) ? '' : '[OFF SCREEN] ') + o.desk + '->' + o.c + ',' + o.r + ': ' + (st.last && st.last.verdict) +
    (st.last && st.last.what ? ' (' + st.last.what + ')' : '') + ' at c' + d.c + ' r' + d.r + ' turn ' + d.turn + ', aside ' + st.aside);
  var m = document.body.innerText.match(/Mobiliarbus![^\n]*|[^\n]*(will not|already|the wall|the aisle|the dais|where you stand)[^\n]*/);
  out.push('line: ' + (m ? m[0].slice(0, 160) : '(none seen)'));
  return out.join(' | ');
})()
