/* The aisle (Godric's note of 10.07 pm, 23 October 2026, on 1044.1): on desks-test.html?stand=floor-3&face=north, desks
   into the aisle and the refusals there. Each cast as desks-drive.js's: the spell started, the word, a stroke on the
   spell's layer; returns what happened, each desk's square, side (x') and turn */
(async function () {
  var H = lumosDesks.H, out = [], sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function yOf(r) { return 3.0 + r * 1.2; }
  async function cast(n, c, r) {
    var a = H.start(n); if (!a) return n + ': no cast';
    await sleep(200); a.say(); await sleep(350);
    var s = H.state().desks[n - 1], from = H.screenOf(CharmsDesks.XC[s.c], yOf(s.r), 0), to = H.screenOf(CharmsDesks.XC[c], yOf(r), 0);
    var cvs = Array.prototype.slice.call(document.querySelectorAll('canvas')), lc = cvs[cvs.length - 1], pts = [], i;
    for (i = 0; i <= 14; i++) pts.push({ x: from.x + (to.x - from.x) * i / 14, y: from.y + (to.y - from.y) * i / 14 });
    function ev(t, p) { lc.dispatchEvent(new PointerEvent(t, { clientX: p.x, clientY: p.y, pointerId: 1, bubbles: true })); }
    ev('pointerdown', pts[0]);
    for (i = 1; i < pts.length; i++) { await sleep(16); ev('pointermove', pts[i]); }
    ev('pointerup', pts[pts.length - 1]);
    await sleep(2600);
    var st = H.state(), d = st.desks[n - 1], on = function (p) { return p.x >= 0 && p.x <= innerWidth && p.y >= 0 && p.y <= innerHeight; };
    return (on(from) && on(to) ? '' : '[OFF SCREEN] ') + n + '->' + c + ',' + r + ': ' + (st.last && st.last.verdict) +
      (st.last && st.last.what ? ' (' + st.last.what + ')' : '') + ' at c' + d.c + ' r' + d.r + ' x ' + d.x + ' turn ' + d.turn;
  }
  out.push(await cast(15, 4, 10));   /* from the west, row 10: the aisle's west side, x' 4.6 */
  out.push(await cast(16, 4, 10));   /* a second there: refused, the desk there */
  out.push(await cast(28, 4, 12));   /* from the east, row 12: the east side, x' 5.4 */
  out.push(await cast(22, 4, 11));   /* row 11 is floor-2's place: refused */
  out.push(await cast(45, 4, 15));   /* the last row, inside the door: allowed, the way down the middle clear */
  out.push('blocked past the last row: ' + H.blockedAt(45, 4, 16));
  return out.join(' | ');
})()
