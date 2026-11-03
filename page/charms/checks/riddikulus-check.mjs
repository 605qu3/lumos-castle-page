// The Riddikulus page check: node page/charms/checks/riddikulus-check.mjs [WxH], port 8777.
// Drives page/charms/riddikulus-test.html with real touches through both rounds: a stroke before the word (refused),
// the word's card, each miss of form (across, leaning, beside, short, wiggly; down for the spider), the flip off the
// middle and through it, each mark checked against a reflection (square to the line, equal either side), the laugh,
// the smoke and the chain to the second round, then the third (Parvati's mummy, a slanted mirror: misses, the flip
// turned twice the lean, the marks over the slanted line, the fall and the head), then the fourth (Seamus's banshee, two
// mirrors side by side: the first line's misses, the second's, the slide twice the gap, each mark over both mirrors,
// her voice gone); shots to %TEMP%/lumos-shots/rid-<WxH>-<n>.png.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [W, H] = (process.argv[2] || '1180x820').split('x').map(Number);
const OUT = process.env.TEMP + '/lumos-shots';
mkdirSync(OUT, { recursive: true });
const PORT = 8777, root = `http://localhost:${PORT}/page/charms/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const up = async u => { try { const r = await fetch(u, { signal: AbortSignal.timeout(1500) }); await r.arrayBuffer(); return r.ok; } catch { return false; } };
if (!(await up(root + 'riddikulus-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'riddikulus-test.html')); i++) await sleep(250);
}
const profile = mkdtempSync(join(tmpdir(), 'lumos-chrome-' + PORT + '-'));
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, `--window-size=${W},${H}`, '--hide-scrollbars', '--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist',
  '--use-angle=d3d11', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
let wsUrl = null;
chrome.stderr.on('data', d => { const m = String(d).match(/DevTools listening on (ws:\/\/\S+)/); if (m) wsUrl = m[1]; });
for (let i = 0; i < 80 && !wsUrl; i++) await sleep(100);
const httpBase = wsUrl.replace(/^ws:/, 'http:').replace(/\/devtools\/.*$/, '');
const t = (await (await fetch(httpBase + '/json/list')).json()).find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise(r => { ws.onopen = r; });
let id = 0; const pending = new Map(), problems = [];
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') problems.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
  else if (m.method === 'Runtime.consoleAPICalled' && /error|warn/.test(m.params.type)) problems.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) problems.push('log: ' + m.params.entry.text);
};
const send = (method, params = {}) => new Promise(r => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) return 'ERR ' + JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result?.result?.value; };
const results = [];
const verdict = (name, ok, detail) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + ' ' + detail); };
const drag = async (pts, step = 12) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const p of pts.slice(1)) { await sleep(step); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  await sleep(step); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const tap = async (x, y) => drag([{ x: Math.round(x), y: Math.round(y) }]);
let shot = 0;
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/rid-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'riddikulus-test.html?guide=off' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.riddikulus'); true");
const st = async () => JSON.parse(await ev('JSON.stringify(lumosRiddikulus.state())'));
const B = async () => JSON.parse(await ev('JSON.stringify(lumosRiddikulus.box())'));
const until = async (want, ms) => { for (let i = 0; i < ms / 100; i++) { const s = await st(); if (s.stage === want) return s; await sleep(100); } return st(); };

// a line through the box: axis 'down' or 'across', tilt degrees, share off the middle, cover of the box, bow bends it
async function line(axis, o = {}) {
  const b = await B(), t = (o.tilt || 0) * Math.PI / 180, cover = o.cover || 1.25, sh = o.share || 0, pts = [];
  const c = axis === 'down' ? { x: b.x + b.w / 2 + sh * b.w / 2, y: b.y + b.h / 2 } : { x: b.x + b.w / 2, y: b.y + b.h / 2 + sh * b.h / 2 };
  const u = axis === 'down' ? { x: -Math.sin(t), y: Math.cos(t) } : { x: Math.cos(t), y: Math.sin(t) };
  const len = cover * (axis === 'down' ? b.h : b.w) / Math.cos(t);
  for (let i = 0; i <= 16; i++) { const k = i / 16 - 0.5, w = (o.bow || 0) * len * 4 * (0.5 + k) * (0.5 - k);
    pts.push({ x: Math.round(c.x + u.x * len * k - u.y * w), y: Math.round(c.y + u.y * len * k + u.x * w) }); }
  await drag(pts, 14); await sleep(200);
  return st();
}
// each mark a reflection: the image straight across the line, as far the other side
function reflected(s) {
  const m = s.flip.m, ax = s.flip.axis;
  return s.marks.length === 3 && s.marks.every(({ p, q }) => ax === 'down'
    ? Math.abs((p.x + q.x) / 2 - m) < 1 && Math.abs(p.y - q.y) < 0.5 && Math.abs(p.x - m) > 2
    : Math.abs((p.y + q.y) / 2 - m) < 1 && Math.abs(p.x - q.x) < 0.5 && Math.abs(p.y - m) > 2);
}

// round 1, Snape
let s = await st();
verdict('starts with the word', s.round === 1 && s.stage === 'word' && !s.learned, JSON.stringify({ round: s.round, stage: s.stage }));
s = await line('down');
verdict('a line before the word is refused', s.stage === 'word' && s.last && s.last.reason === 'word' && /Say it first/.test(s.line), s.line);
let c = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.card())'));
await tap(c.x + c.w / 2, c.y + c.h / 2); await sleep(300);
s = await st(); verdict('the card is said', s.stage === 'saying', s.stage);
s = await until('cast', 2000); verdict('then the wand comes up', s.stage === 'cast' && /down through it/.test(s.line), s.line);
await sleep(500); await snap();
for (const [name, axis, o, why] of [['across him', 'across', {}, 'across'], ['leaning 30', 'down', { tilt: 30 }, 'slant'], ['past him', 'down', { share: 1.4 }, 'beside'],
  ['over half of him', 'down', { cover: 0.5 }, 'short'], ['a banana', 'down', { bow: 0.35 }, 'wiggly']]) {
  s = await line(axis, o);
  verdict('miss: ' + name, s.stage === 'cast' && s.last.verdict === 'miss' && s.last.reason === why && s.line.length > 10 && !s.learned, JSON.stringify({ last: s.last, line: s.line }));
}
const b1 = await B();
s = await line('down', { share: 0.4, tilt: 5 });
const m1 = b1.x + b1.w / 2 + 0.4 * b1.w / 2;
verdict('a line down, a little to one side, flips him', s.stage === 'flip' && s.last.verdict === 'flip' && s.learned && Math.abs(s.flip.m - m1) < 3, JSON.stringify({ last: s.last, flip: s.flip }));
verdict('each mark a reflection over his line', reflected(s), JSON.stringify(s.marks));
const a1 = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.after())'));
verdict('he lands as far the other side', Math.abs((a1.x + a1.w / 2) - (2 * s.flip.m - (b1.x + b1.w / 2))) < 1, JSON.stringify({ before: b1.x + b1.w / 2, m: s.flip.m, after: a1.x + a1.w / 2 }));
await sleep(1300); await snap();
s = await until('laugh', 3000);
verdict('then the laugh is asked, the side named', s.stage === 'laugh' && /other side/.test(s.line) && /laugh/.test(s.line), s.line);
await tap(a1.x + a1.w / 2, a1.y + a1.h * 0.5); await sleep(200);
s = await st(); verdict('the laugh: wisps of smoke', s.stage === 'smoke' && /wisps of smoke/.test(s.line), s.line);
s = await until('word', 3500);
verdict('chained to the spider', s.round === 2 && s.stage === 'word', JSON.stringify({ round: s.round, stage: s.stage }));

// round 2, the spider
c = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.card())'));
await tap(c.x + c.w / 2, c.y + c.h / 2);
s = await until('cast', 2500); verdict('the spider, after the word', s.stage === 'cast' && /across it/.test(s.line), s.line);
s = await line('down');
verdict('miss: down the spider', s.stage === 'cast' && s.last.reason === 'down' && /across/.test(s.line), JSON.stringify({ last: s.last, line: s.line }));
s = await line('across', { tilt: -6 });
verdict('a line across flips it upside down', s.stage === 'flip' && s.flip.axis === 'across' && s.last.verdict === 'flip', JSON.stringify({ last: s.last, flip: s.flip }));
verdict('each mark a reflection over the line across', reflected(s), JSON.stringify(s.marks));
await sleep(1300); await snap();
s = await until('laugh', 5000);
verdict('rolled over, to a halt, the laugh asked', s.stage === 'laugh' && /came to a halt/.test(s.line), s.line);
await snap();
const a2 = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.after())'));
await tap(a2.x + a2.w / 2, a2.y + a2.h / 2); await sleep(200);
s = await st(); verdict('the spider laughed away', s.stage === 'smoke', s.stage);
s = await until('word', 3500);
verdict('chained to the mummy', s.round === 3 && s.stage === 'word', JSON.stringify({ round: s.round, stage: s.stage }));
// round 3, Parvati's mummy and the slanted mirror (want 45 either way)
async function slant(lean, o = {}) {
  const b = await B(), t = lean * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t), nx = -uy, ny = ux, sh = o.share || 0, cover = o.cover || 1.25;
  const hn = Math.abs(nx) * b.w / 2 + Math.abs(ny) * b.h / 2, c = { x: b.x + b.w / 2 + nx * sh * hn, y: b.y + b.h / 2 + ny * sh * hn };
  let s0 = -1e9, s1 = 1e9;
  for (const [p, d, lo0, hi0] of [[c.x, ux, b.x, b.x + b.w], [c.y, uy, b.y, b.y + b.h]]) { if (Math.abs(d) < 1e-9) continue; let lo = (lo0 - p) / d, hi = (hi0 - p) / d; if (lo > hi) [lo, hi] = [hi, lo]; s0 = Math.max(s0, lo); s1 = Math.min(s1, hi); }
  if (s1 <= s0) { s0 = -b.h / 2; s1 = b.h / 2; }
  const len = cover * (s1 - s0), mid = (s0 + s1) / 2, m = { x: c.x + ux * mid, y: c.y + uy * mid }, pts = [];
  for (let i = 0; i <= 16; i++) { const k = 0.5 - i / 16; pts.push({ x: Math.round(m.x + ux * len * k), y: Math.round(m.y + uy * len * k) }); }
  await drag(pts, 14); await sleep(200);
  return st();
}
c = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.card())'));
await tap(c.x + c.w / 2, c.y + c.h / 2);
s = await until('cast', 2500); verdict('the mummy, after the word', s.stage === 'cast' && /leaning halfway/.test(s.line), s.line);
for (const [name, lean, o, why, words] of [['upright', 0, {}, 'slant', /further/], ['leaning 72', 72, {}, 'slant', /Not so far/], ['past it', -45, { share: 1.4, cover: 0.6 }, 'beside', /Through the mummy/],
  ['half through it', 45, { cover: 0.5 }, 'short', /Right through it/]]) {
  s = await slant(lean, o);
  verdict('miss: ' + name, s.stage === 'cast' && s.last.verdict === 'miss' && s.last.reason === why && words.test(s.line), JSON.stringify({ last: s.last, line: s.line }));
}
s = await slant(-40, { share: 0.15 });
verdict('a line leaning 40 the other way flips it, turned twice the lean', s.stage === 'flip' && s.flip.axis === 'slant' && Math.abs(s.flip.lean + 40) < 1.5 && Math.abs(s.flip.turn - 2 * s.flip.lean) < 0.2, JSON.stringify({ last: s.last, flip: s.flip }));
{ const A = s.flip.A, Bq = s.flip.B, L = Math.hypot(Bq.x - A.x, Bq.y - A.y);
  const ok = s.marks.length === 3 && s.marks.every(({ p, q }) => { const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    return Math.abs((mx - A.x) * (Bq.y - A.y) - (my - A.y) * (Bq.x - A.x)) / L < 1 && Math.abs((q.x - p.x) * (Bq.x - A.x) + (q.y - p.y) * (Bq.y - A.y)) / L < 1 && Math.hypot(q.x - p.x, q.y - p.y) > 4; });
  verdict('each mark a reflection over the slanted line', ok, JSON.stringify(s.marks)); }
await sleep(1200); await snap();
s = await st(); verdict('its lean and its tip named, twice', /twice as far/.test(s.line) && s.line.includes(String(Math.abs(Math.round(s.flip.turn)))), s.line);
s = await until('laugh', 7000);
verdict('it fell flat, its top rolled off, the laugh asked', s.stage === 'laugh' && /top rolled off/.test(s.line) && s.flip.head && /twice/.test(s.line), s.line);
await snap();
const a3 = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.after())'));
verdict('lying flat on the floor', a3.w > a3.h, JSON.stringify(a3));
await tap(a3.x + a3.w / 2, a3.y + a3.h / 2); await sleep(200);
s = await st(); verdict('the mummy laughed away', s.stage === 'smoke', s.stage);
s = await until('word', 3500);
verdict('chained to the banshee', s.round === 4 && s.stage === 'word', JSON.stringify({ round: s.round, stage: s.stage }));
// round 4, Seamus's banshee and two mirrors side by side
async function upright(dx, o = {}) {   /* a line down through her box at dx px right of her middle, top to bottom */
  const b = await B(), t = (o.tilt || 0) * Math.PI / 180, len = (o.cover || 1.25) * b.h, c = { x: b.x + b.w / 2 + dx, y: b.y + b.h / 2 }, pts = [];
  for (let i = 0; i <= 16; i++) { const k = i / 16 - 0.5; pts.push({ x: Math.round(c.x - Math.sin(t) * len * k), y: Math.round(c.y + Math.cos(t) * len * k) }); }
  await drag(pts, 14); await sleep(250);
  return st();
}
c = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.card())'));
await tap(c.x + c.w / 2, c.y + c.h / 2);
s = await until('cast', 2500); verdict('the banshee, after the word', s.stage === 'cast' && /Two mirrors/.test(s.line), s.line);
await sleep(400); await snap();
const b4 = await B();
for (const [name, dx, o, why, words] of [['beside her', b4.w * 0.9, {}, 'beside', /not beside her/], ['leaning 30', 0, { tilt: 30 }, 'slant', /Straighter up and down/]]) {
  s = await upright(dx, o);
  verdict('first line, miss: ' + name, s.stage === 'cast' && !s.mirror1 && s.last.verdict === 'miss' && s.last.reason === why && words.test(s.line), JSON.stringify({ last: s.last, line: s.line }));
}
s = await upright(b4.w * 0.05);
verdict('the first mirror kept, the second asked', s.stage === 'cast' && s.mirror1 && /first mirror/.test(s.line), s.line);
await snap();
const room = (await ev('innerWidth')) - 6 - (b4.x + b4.w);
for (const [name, dx, o, why, words] of [['crossing it', b4.w * 0.75, { tilt: 20 }, 'cross', /would cross/], ['too close', b4.w * 0.12, {}, 'close', /further apart/],
  ['so far she slides off', b4.w * 0.05 + room / 2 + 20, {}, 'far', /off the edge/]]) {
  s = await upright(dx, o);
  verdict('second line, miss: ' + name, s.stage === 'cast' && s.mirror1 && s.last.verdict === 'miss' && s.last.reason === why && words.test(s.line), JSON.stringify({ last: s.last, line: s.line }));
}
s = await upright(b4.w * 0.75);
{ const f = s.flip, gap = f ? f.gap : 0;
  verdict('two mirrors side by side: she slides twice the gap, square to them', s.stage === 'flip' && f.axis === 'two' && Math.abs(gap - b4.w * 0.7) < 3 && Math.abs(f.slide.x - 2 * gap) < 0.5 && Math.abs(f.slide.y) < 0.5, JSON.stringify({ last: s.last, slide: f && f.slide, gap }));
  const A = f.A1, Bq = f.B1, L = Math.hypot(Bq.x - A.x, Bq.y - A.y);
  const ok = s.marks.length === 3 && s.marks.every(({ p, q1, q }) => { const mx = (p.x + q1.x) / 2, my = (p.y + q1.y) / 2;
    return Math.abs((mx - A.x) * (Bq.y - A.y) - (my - A.y) * (Bq.x - A.x)) / L < 1 && Math.abs(q.x - p.x - f.slide.x) < 1 && Math.abs(q.y - p.y - f.slide.y) < 1; });
  verdict('each mark over the first mirror, then on over the second: slid, the right way round', ok, JSON.stringify(s.marks)); }
await sleep(350); await snap();
await sleep(1500); await snap();
s = await st(); verdict('the slide named: twice the gap', /twice the gap/.test(s.line) && /right way round/.test(s.line), s.line);
s = await until('laugh', 6000);
verdict('its moan gone, the laugh asked', s.stage === 'laugh' && s.flip.hushed && /slid along twice the gap/.test(s.line) && /moan is gone/.test(s.line), s.line);
await snap();
const a4 = JSON.parse(await ev('JSON.stringify(lumosRiddikulus.after())'));
verdict('she stands where she slid to', Math.abs(a4.x - b4.x - s.flip.slide.x) < 1 && a4.w === b4.w, JSON.stringify(a4));
await tap(a4.x + a4.w / 2, a4.y + a4.h / 2); await sleep(200);
s = await st(); verdict('the banshee laughed away', s.stage === 'smoke', s.stage);
s = await until('gone', 3500);
verdict('all four gone, nothing graded', s.stage === 'gone' && /All four Boggarts gone/.test(s.line) && s.learned, s.line);

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
