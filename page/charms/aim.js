/* The wand's aim in a 3D space (req 5154; the Charms lane, the owner is Godric). Pure functions, so a script can sort
   known hits from known misses away from any page. One cast function every spell uses: castAt(spell, origin, dir,
   things, reach). The ray is the screen's centre ray from the walker's eye; the first thing it meets within the reach
   is the target, whatever it is (a wall hides what is behind it). A thing declares its kind and the spells it answers,
   so a spell cannot land on what did not ask for it.
   things: [{ id, kind, answers: [spell names], min: [x,y,z], max: [x,y,z] }] (boxes). origin, dir: [x,y,z], dir need not be unit.
   Returns { landed, why: 'landed' | 'ignores' | 'nothing', target (the first thing met, or null), dist, point }. */
(function (root) {
'use strict';
function hitBox(o, d, b) {
  var t0 = 0, t1 = Infinity;
  for (var i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) { if (o[i] < b.min[i] || o[i] > b.max[i]) return -1; continue; }
    var a = (b.min[i] - o[i]) / d[i], c = (b.max[i] - o[i]) / d[i];
    if (a > c) { var s = a; a = c; c = s; }
    if (a > t0) t0 = a; if (c < t1) t1 = c;
    if (t0 > t1) return -1;
  }
  return t0;
}
/* resolve: the one rule that decides a cast, whoever found the first thing met (boxes here, or a mesh ray in the room
   page, which passes that thing, its distance and its point). A thing answers only the spells it names. */
function resolve(spell, best, bt, pt, reach) {
  if (!best || bt > reach) return { landed: false, why: 'nothing', target: null, dist: null, point: null };
  var ok = best.answers && best.answers.indexOf(spell) >= 0;
  return { landed: !!ok, why: ok ? 'landed' : 'ignores', target: best, dist: bt, point: pt };
}
function castAt(spell, origin, dir, things, reach) {
  var n = Math.hypot(dir[0], dir[1], dir[2]) || 1, d = [dir[0] / n, dir[1] / n, dir[2] / n], best = null, bt = Infinity;
  (things || []).forEach(function (th) { var t = hitBox(origin, d, th); if (t >= 0 && t < bt) { bt = t; best = th; } });
  return resolve(spell, best, bt, best && [origin[0] + d[0] * bt, origin[1] + d[1] * bt, origin[2] + d[2] * bt], reach);
}
/* a ray from a yaw and pitch (radians; yaw 0 looks down -z, + turns left, as a camera) */
function rayFrom(yaw, pitch) { return [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)]; }
root.CharmsAim = { castAt: castAt, resolve: resolve, rayFrom: rayFrom, hitBox: hitBox };
if (typeof module !== 'undefined') module.exports = root.CharmsAim;
})(typeof window !== 'undefined' ? window : globalThis);
