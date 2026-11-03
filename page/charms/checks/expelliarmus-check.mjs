// The Expelliarmus page check: node page/charms/checks/expelliarmus-check.mjs [WxH], port 8777.
// Drives page/charms/expelliarmus-test.html with real touches through every round: a tap, each miss of form (no swing,
// never pointed, pointed first, the rainbow arch), a wide flash, a rounded finger's corner that disarms, the catch called
// right, short, late and not at all, the halves matched, the stage's throw landing past the mirror; Q9's fix (a swing
// alone held, a point too late judged alone, a cast in two strokes, the wand hanging at its top); the top's round (a
// call past the top, the fall doubled, then one at the top), the end; six shots to %TEMP%/lumos-shots/exp-<WxH>-<n>.png.
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
if (!(await up(root + 'expelliarmus-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'expelliarmus-test.html')); i++) await sleep(250);
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
let shot = 0;
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/exp-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'expelliarmus-test.html?guide=off' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.expelliarmus'); true");
const st = async () => JSON.parse(await ev('JSON.stringify(lumosExpelliarmus.state())'));
const handOf = async () => JSON.parse(await ev('JSON.stringify(lumosExpelliarmus.hand())'));
const dumOf = async () => JSON.parse(await ev('JSON.stringify(lumosExpelliarmus.dummy())'));
const flight = async () => JSON.parse(await ev('JSON.stringify(lumosExpelliarmus.flight())'));
const touch = async (x, y) => { await drag([{ x: Math.round(x), y: Math.round(y) }]); };
const R = p => ({ x: Math.round(p.x), y: Math.round(p.y) });
// the swing: up lift reaches from the hand, leaning back a third of a reach; then the point, err degrees off (+ down the
// screen), len of the way to the dummy's hand
async function shape(lift, err = 0, len = 0.8, o = {}) {
  const h = await handOf(), d = await dumOf(), pts = [], a = { x: h.x, y: h.y };
  let top = a;
  if (o.arch) {   // one rainbow arch from the hand over onto the dummy's hand
    const c = { x: (a.x + d.x) / 2, y: a.y - 2 * o.arch * h.r };
    for (let i = 0; i <= 40; i++) { const k = i / 40; pts.push({ x: (1 - k) * (1 - k) * a.x + 2 * k * (1 - k) * c.x + k * k * d.x, y: (1 - k) * (1 - k) * a.y + 2 * k * (1 - k) * c.y + k * k * d.y }); }
    return pts.map(R);
  }
  if (o.corner) {   // straight up, then a rounded corner of radius corner reaches, then the point: a real finger's turn
    top = { x: a.x, y: a.y - lift * h.r };
    const t0 = Math.atan2(d.y - top.y, d.x - top.x), u = { x: Math.cos(t0), y: Math.sin(t0) }, rr = o.corner * h.r;
    const c1 = { x: top.x, y: top.y + rr }, c2 = { x: top.x + u.x * rr, y: top.y + u.y * rr };
    for (let i = 0; i <= 12; i++) pts.push({ x: a.x, y: a.y + (c1.y - a.y) * i / 12 });
    for (let i = 1; i <= 10; i++) { const k = i / 10; pts.push({ x: (1 - k) * (1 - k) * c1.x + 2 * k * (1 - k) * top.x + k * k * c2.x, y: (1 - k) * (1 - k) * c1.y + 2 * k * (1 - k) * top.y + k * k * c2.y }); }
    const L = len * Math.hypot(d.x - top.x, d.y - top.y);
    for (let i = 1; i <= 20; i++) { const s = rr + (L - rr) * i / 20; pts.push({ x: top.x + u.x * s, y: top.y + u.y * s }); }
    return pts.map(R);
  }
  if (lift > 0) { top = { x: a.x - h.r / 3, y: a.y - lift * h.r }; for (let i = 0; i <= 14; i++) { const k = i / 14; pts.push({ x: a.x + (top.x - a.x) * Math.sin(k * Math.PI / 2), y: a.y + (top.y - a.y) * k }); } }
  else pts.push(a);
  if (!o.noPoint) {
    const t0 = Math.atan2(d.y - top.y, d.x - top.x) + err * Math.PI / 180, L = len * Math.hypot(d.x - top.x, d.y - top.y);
    for (let i = 1; i <= 24; i++) pts.push({ x: top.x + Math.cos(t0) * L * i / 24, y: top.y + Math.sin(t0) * L * i / 24 });
  }
  if (o.thenUp) { const z = pts[pts.length - 1]; for (let i = 1; i <= 12; i++) pts.push({ x: z.x, y: z.y - o.thenUp * h.r * i / 12 }); }
  return pts.map(R);
}
async function pointFrom(lift, err = 0, len = 0.8) {   // the point alone, from where shape's swing ends
  const h = await handOf(), d = await dumOf(), top = { x: h.x - h.r / 3, y: h.y - lift * h.r }, pts = [];
  const t0 = Math.atan2(d.y - top.y, d.x - top.x) + err * Math.PI / 180, L = len * Math.hypot(d.x - top.x, d.y - top.y);
  for (let i = 0; i <= 24; i++) pts.push({ x: top.x + Math.cos(t0) * L * i / 24, y: top.y + Math.sin(t0) * L * i / 24 });
  return pts.map(R);
}
const cast = async (...a) => { await drag(await shape(...a)); await sleep(150); return st(); };
const pure = async pts => JSON.parse(await ev(`JSON.stringify(LumosSpells.judgeDisarm(${JSON.stringify(pts)}, lumosExpelliarmus.hand(), lumosExpelliarmus.dummy(), 'kind'))`));
// call the catch dx from where it will land, once it has risen most of the way (late: after the call is closed)
async function call(dx, late = false) {
  let f = await flight();
  for (let i = 0; i < 80 && f && f.t < (late ? f.lateAt + 0.15 : f.lateAt * 0.7); i++) { await sleep(50); f = await flight(); }
  await touch(f.land + dx * f.tol, f.catchY);
  return f;
}
const toLand = async () => { let f = await flight(); for (let i = 0; i < 120 && f && f.caught === null; i++) { await sleep(50); f = await flight(); } await sleep(300); return f; };
const toFloor = async () => { let s = await st(); for (let i = 0; i < 120 && s.stage !== 'missed'; i++) { await sleep(50); s = await st(); } return s; };

let s = await st();
verdict('round 1 opens, no guide', s.round === 1 && s.stage === 'cast' && /Swing your wand up above your head/.test(s.line), s.line);
const h0 = await handOf(); await touch(h0.x, h0.y); await sleep(150); s = await st();
verdict('a tap asks for the stroke', s.last && s.last.reason === 'tap' && /one stroke, or lift at the top/.test(s.line), s.line);
s = await cast(0); verdict('a point with no swing: flat, swing first', s.last?.reason === 'flat' && /Swing your wand up above your head first/.test(s.line), s.line);
s = await cast(2.5, 0, 0.8, { noPoint: true }); verdict('a swing never pointed: up, now point', s.last?.reason === 'up' && /point/.test(s.line), s.line);
s = await cast(0, 0, 0.8, { thenUp: 2.5 }); verdict('pointed first, swung after: flat, swing first', s.last?.reason === 'flat' && /You pointed, then swung/.test(s.line), s.line);
s = await cast(0, 0, 0.8, { arch: 2.5 }); verdict('the rainbow arch: flat, told to turn at the top', s.last?.reason === 'flat' && /rainbow/i.test(s.line), s.line);
s = await cast(2.5, 0, 0.8, { noPoint: true }); verdict('a swing alone is held for its point', s.last?.reason === 'up' && s.held && /lift it and point from there/.test(s.line), s.line);
await sleep(2800); await drag(await pointFrom(2.5)); await sleep(150); s = await st();
verdict('a point long after the swing is a fresh cast: off', s.last?.reason === 'off' && !s.held && /Start at your wand hand/.test(s.line), s.line);
s = await cast(2.5, 15); await sleep(700); s = await st();
verdict('15° off: the flash goes wide, the gap said', s.last?.reason === 'wide' && /went past its hand/.test(s.line), s.line);
s = await cast(2.5); verdict('a stroke while it waits is refused', s.waiting && s.last?.reason === 'wide', JSON.stringify({ stage: s.stage, waiting: s.waiting }));
await sleep(3800);
const c15 = await pure(await shape(2.5, 0, 0.8, { corner: 1.5 }));
verdict('a rounder corner (1.5 reaches) disarms, by the judge', c15.verdict === 'disarmed', c15.verdict + ' ' + c15.reason);
s = await cast(2.5, 0, 0.8, { corner: 1 }); await sleep(500); s = await st();
verdict('a rounded finger\'s corner (1 reach) disarms; learned', s.last?.verdict === 'disarmed' && s.stage === 'catch' && s.learned && /scarlet/.test(s.line), s.line);
let fh = await flight(); for (let i = 0; i < 80 && fh.t < fh.topAt; i++) { await sleep(40); fh = await flight(); }
await sleep(250); const fh2 = await flight();
verdict('the wand hangs a beat at its top', fh.hang === 0.7 && Math.abs(fh2.t - fh2.topAt) < 0.001, `hang ${fh.hang}, t ${fh2.t.toFixed(3)}, top ${fh2.topAt.toFixed(3)}`);
await snap();   // 1: hanging at its top
await call(0); let f = await toLand(); s = await st();
verdict('short: called where it lands, caught', f.caught === true && s.stage === 'caught' && /Caught it!/.test(s.line), s.line);
const sym = Math.abs((f.start.x - f.top.x) - (f.top.x - f.mirror));
verdict('the halves match (start to top, top to mirror)', sym < 1, sym.toFixed(2) + ' px');
await sleep(700); await snap();   // 2: caught, the sum
s = await cast(2.5); verdict('a stroke between rounds is refused', s.waiting && s.stage === 'caught', JSON.stringify({ stage: s.stage, waiting: s.waiting }));
await sleep(6600);
s = await st(); verdict('on to the long throw', s.round === 2 && s.stage === 'cast' && s.guide === null, s.line);
s = await cast(2.5); await sleep(500); f = await toLand(); s = await toFloor();
verdict('long: not called, it clatters', /didn't call it/.test(s.line), s.line);
await sleep(5400);
await drag(await shape(3, 0, 0.8, { noPoint: true })); await sleep(300); await drag(await pointFrom(3)); await sleep(150); s = await st();
verdict('two strokes, the swing then the point from its top, disarm', s.last?.verdict === 'disarmed' && !s.held, JSON.stringify(s.last));
await sleep(350); await call(3); f = await toLand(); s = await toFloor();
verdict('long: called three catches short, the gap said', f.caught === false && /short of where it came down/.test(s.line), s.line);
await sleep(400); await snap();   // 3: the miss, its gap
await sleep(5000);
s = await cast(3); await sleep(500); await call(0, true); s = await st();
verdict('long: called after it fell too far, too late', /Too late to call it/.test(s.line), s.line);
s = await toFloor(); verdict('the clatter says too late', /called it too late/.test(s.line), s.line);
await sleep(5400);
s = await cast(3); await sleep(500); await call(-0.6); f = await toLand(); s = await st();
verdict('long: called a little past, caught', f.caught === true && /Caught it!/.test(s.line), s.line);
await sleep(7000);
s = await st(); verdict('on to the stage', s.round === 3 && s.stage === 'cast', s.line);
const d3 = await dumOf(), h3 = await handOf();
verdict('the dummy stands above his hand', d3.y < h3.y - 50, `${Math.round(h3.y - d3.y)} px higher`);
s = await cast(3.5); await sleep(500); await call(0.3); f = await toLand(); s = await st();
verdict('stage: lands further than the mirror, caught', f.caught === true && f.land < f.mirror - 5 && /fell on down to your hand/.test(s.line), `${Math.round(f.mirror - f.land)} px further; ${s.line}`);
await sleep(900); await snap();   // 4: the stage's sum
await sleep(6400); s = await st(); verdict('on to the top', s.round === 4 && s.stage === 'cast' && /very top/.test(s.line), s.line);
const rising = async () => { let g = await flight(); for (let i = 0; i < 80 && g && g.t < g.topAt * 0.6; i++) { await sleep(30); g = await flight(); } return g; };
s = await cast(3); await sleep(500); let ft = await rising();
verdict('the top: no hang', ft.hang === 0, 'hang ' + ft.hang);
await touch(ft.top.x + (ft.top.x < ft.start.x ? -1 : 1) * 2 * ft.tol, ft.top.y); s = await toFloor();
verdict('the top: called two catches past, it clatters, the fall doubled', /past its top/.test(s.line) && /a mirror doubles it/.test(s.line), s.line);
await sleep(300); await snap();   // 5: the top's miss: his line, the rise turned over in it, the gap
await sleep(6200);
s = await cast(3); await sleep(500); ft = await rising();
await touch(ft.top.x, ft.top.y); f = await toLand(); s = await st();
verdict('the top: called at the top, caught there', f.caught === true && /Caught at the very top/.test(s.line), s.line);
await sleep(600); await snap();   // 6: caught at the top
await sleep(5000); s = await st(); verdict('all four: the end', s.done && /All four caught/.test(s.line), s.line);

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
