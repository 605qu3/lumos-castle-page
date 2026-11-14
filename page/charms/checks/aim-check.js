/* Sorts three known hits and three known misses on fixed rays (req 5154/5282). Run: node aim-check.js */
const A = require('../aim.js');
const eye = [0, 1.6, 0];
const things = [
  { id: 'candle', kind: 'candle', answers: ['lumos'], min: [-0.1, 1.0, -4.1], max: [0.1, 1.4, -3.9] },
  { id: 'feather', kind: 'feather', answers: ['leviosa'], min: [2.9, 1.5, -2.1], max: [3.1, 1.7, -1.9] },
  { id: 'door', kind: 'door', answers: ['swish'], min: [-3.1, 0, -5], max: [-2.9, 2.2, -4] },
  { id: 'book', kind: 'book', answers: [], min: [-1, 1.3, -6], max: [-0.6, 1.6, -5.8] },
  { id: 'wall', kind: 'wall', answers: [], min: [-8, 0, -6.1], max: [8, 3, -6] }
];
const aimAt = (p) => [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
const cases = [
  ['hit', 'lumos', aimAt([0, 1.2, -4]), 'candle'],
  ['hit', 'leviosa', aimAt([3, 1.6, -2]), 'feather'],
  ['hit', 'swish', aimAt([-3, 1.1, -4.5]), 'door'],
  ['miss', 'lumos', aimAt([3, 1.6, -2]), 'ignores (feather)'],
  ['miss', 'leviosa', aimAt([0, 2.5, -3]), 'ignores (wall)'],
  ['miss', 'swish', aimAt([-0.8, 1.45, -5.9]), 'ignores (book)']
];
let bad = 0;
cases.forEach(([kind, spell, dir, note]) => {
  const r = A.castAt(spell, eye, dir, things, 7);
  const ok = kind === 'hit' ? r.landed : !r.landed;
  if (!ok) bad++;
  console.log((ok ? 'ok  ' : 'FAIL'), kind, spell, '->', r.why, r.target && r.target.id, note);
});
/* a wall hides what is behind it: the candle behind a wall is not hit */
const hid = A.castAt('lumos', eye, aimAt([0, 1.2, -4]), things.concat([{ id: 'screen', kind: 'wall', answers: [], min: [-1, 0, -2.1], max: [1, 3, -2] }]), 7);
console.log(hid.why === 'ignores' && hid.target.id === 'screen' ? 'ok  ' : 'FAIL', 'wall hides the candle ->', hid.why, hid.target && hid.target.id);
if (hid.why !== 'ignores') bad++;
console.log(bad ? bad + ' failed' : 'all sorted: 3 hits, 3 misses, 1 hidden');
process.exit(bad ? 1 : 0);
