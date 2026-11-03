(async function () {
  var H = lumosDesks.H, out = [], sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function yOf(r) { return 3.0 + r * 1.2; }
  async function cast(n, c, r, corner) {
    var a = H.start(n); if (!a) return 'no cast';
    await sleep(200); a.say(); await sleep(100);
    await sleep(200);
    await sleep(50); var s = H.state().desks[n - 1], from = H.screenOf(CharmsDesks.XC[s.c], yOf(s.r), 0), to = H.screenOf(CharmsDesks.XC[c], yOf(r), 0);
    var cvs = Array.prototype.slice.call(document.querySelectorAll('canvas')), lc = cvs[cvs.length - 1];
    var pts = [], i;
    if (corner) { var m = H.screenOf(CharmsDesks.XC[c], yOf(s.r), 0); for (i = 0; i <= 10; i++) pts.push({ x: from.x + (m.x - from.x) * i / 10, y: from.y + (m.y - from.y) * i / 10 }); for (i = 1; i <= 10; i++) pts.push({ x: m.x + (to.x - m.x) * i / 10, y: m.y + (to.y - m.y) * i / 10 }); }
    else for (i = 0; i <= 14; i++) pts.push({ x: from.x + (to.x - from.x) * i / 14, y: from.y + (to.y - from.y) * i / 14 });
    function ev(t, p) { lc.dispatchEvent(new PointerEvent(t, { clientX: p.x, clientY: p.y, pointerId: 1, bubbles: true })); }
    ev('pointerdown', pts[0]);
    for (i = 1; i < pts.length; i++) { await sleep(16); ev('pointermove', pts[i]); }
    ev('pointerup', pts[pts.length - 1]);
    await sleep(2600);
    var st = H.state(), on = function (p) { return p.x >= 0 && p.x <= innerWidth && p.y >= 0 && p.y <= innerHeight; };
    return (on(from) && on(to) ? '' : '[OFF SCREEN] ') + n + '->' + c + ',' + r + ': ' + (st.last && st.last.verdict) + (st.last && st.last.what ? ' (' + st.last.what + ')' : '') + ' at c' + st.desks[n - 1].c + ' r' + st.desks[n - 1].r + ' turn ' + st.desks[n - 1].turn;
  }
  out.push(await cast(1, 0, 8));
  out.push(await cast(3, 4, 8));
  out.push(await cast(2, 0, 8));
  out.push(await cast(7, 0, 8, true));
  out.push(await cast(6, 8, 8)); lumosDesks.H.start(13).say(); await sleep(400);
  out.push('aside ' + H.state().aside);
  return out.join(' | ');
})()
