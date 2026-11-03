// The pineapple's tap dance page check: node page/charms/checks/dance-check.mjs [WxH], port 8777.
// Drives page/charms/dance-test.html with real taps through every round: a tap off the desk, a step back, one step
// long (uneven, the equal landings shown), off the end (it falls), a leap, then four equal steps (danced, the shares
// drawn); your own count: a pause short of the end, then six; the exam's number (?want=5), the wrong count, then right;
// five shots to %TEMP%/lumos-shots/dance-<WxH>-<n>.png. Then Flitwick's beat (twenty-second session), timed to the
// page's own ticks (lumosDance.clock()): a step on his count (too soon), a tick with no step, a step half a beat early,
// then the three parts danced on the ticks (3 at a tick a second, 6 at two, 3 at two), the chart after each; shots 6 to 9 (8 the metronome counting).
// Q9's fix 6 (thirty-ninth session; Q11, option 2): off the end, a soft thump and Flitwick peering over the edge (shot 1);
// in your own count one step a third out still dances, the equal steps drawn under his, his furthest out ringed (shot 10);
// the exam's line quotes no number of Flitwick's. LUMOS_PORT and LUMOS_ROOT drive a copy on a spare port.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [W, H] = (process.argv[2] || '1180x820').split('x').map(Number);
const OUT = process.env.TEMP + '/lumos-shots';
mkdirSync(OUT, { recursive: true });
const PORT = Number(process.env.LUMOS_PORT) || 8777, root = `http://localhost:${PORT}/page/charms/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const up = async u => { try { const r = await fetch(u, { signal: AbortSignal.timeout(1500) }); await r.arrayBuffer(); return r.ok; } catch { return false; } };
if (!(await up(root + 'dance-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: process.env.LUMOS_ROOT || 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'dance-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/dance-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'dance-test.html?want=5' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.pineapple'); localStorage.removeItem('lumos.charms.danceGuidedHits'); true");
await send('Page.reload'); await sleep(2500);
const st = async () => JSON.parse(await ev('JSON.stringify(lumosDance.state())'));
const dk = async () => JSON.parse(await ev('JSON.stringify(lumosDance.desk())'));
const tapAt = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(40);
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
// a dance: each landing as a share of the desk, dy in bands above (-) or below the desktop, gap ms between taps
const dance = async (at, o = {}) => {
  const d = await dk(), L = d.b - d.a;
  for (let i = 0; i < at.length; i++) { await tapAt(d.a + L * at[i], d.y + (o.dy ? o.dy[i] : 0) * d.band); await sleep(o.gap || 380); }
  await sleep(o.after || 400); return st();
};
const even = n => Array.from({ length: n }, (_, i) => (i + 1) / n);
const sums = a => { let s = 0; return a.map(x => s += x); };
const clear = async () => { for (let i = 0; i < 40; i++) { const s = await st(); if (!s.waiting) return s; await sleep(250); } return st(); };
const until = async (fn, n = 50) => { let s; for (let i = 0; i < n; i++) { s = await st(); if (fn(s)) return s; await sleep(200); } return s; };

let s = await st();
verdict('the lesson opens: four equal steps, the guide up', s.round === 1 && s.want === 4 && s.guide === 1 && /four equal steps/.test(s.line), s.line);
s = await dance([0.25, 0.5], { dy: [0, -1.8] });
verdict('a tap off the desk', s.last.reason === 'off' && /missed the desk/.test(s.line), s.line);
s = await clear();
s = await dance([0.3, 0.2]);
verdict('a step back', s.last.reason === 'back' && /backwards/.test(s.line), s.line);
s = await clear();
s = await dance(sums([0.12, 0.38, 0.25, 0.25]), { after: 700 });
verdict('one step long: uneven, named', s.last.reason === 'uneven' && /Step 2 was too long/.test(s.line), s.line);
s = await clear();
s = await dance([0.3, 0.6, 0.9, 1.16], { after: 300 });
verdict('too far: off the end, a soft thump', s.last.reason === 'past' && s.fell && /soft thump/.test(s.line) && /peers over the edge/.test(s.line), s.line);
s = await until(x => x.peering, 30); await sleep(700);
verdict('Flitwick peers over the edge', s.peering, String(s.peering));
await snap();   // 1: off the end, Flitwick leaning over the edge
s = await clear();
s = await dance([0.5, 1]);
verdict('two leaps: a leap', s.last.reason === 'leap' && /At least three steps/.test(s.line), s.line);
s = await clear();
s = await dance(even(4), { after: 300 });
verdict('four equal: it dances', s.last.reason === 'danced' && s.dancing && /It dances/.test(s.line) && s.learned, s.line);
s = await until(x => x.danced); await sleep(600); s = await st();
verdict('the shares named: a quarter, 1/4', s.danced && /a quarter/.test(s.line) && /1\/4/.test(s.line), s.line);
await snap();   // 2: danced, each step bracketed 1/4
s = await until(x => x.round === 2);
verdict('on to your own count, no guide', s.round === 2 && s.want === 0 && s.guide === null && /No guide/.test(s.line), s.line);
s = await dance([0.2, 0.4], { gap: 300, after: 3200 });
verdict('a pause part way: stopped short', s.last.reason === 'short' && /Keep tapping/.test(s.line), s.line);
s = await clear();
s = await dance(sums([0.33, 0.25, 0.21, 0.21]), { gap: 300 });
s = await until(x => x.danced); await sleep(600); s = await st();
verdict('one step a third out: danced, kinder; the equal steps under, the first ringed', s.danced && s.last.n === 4 && s.last.worst === 0 && s.ringed && /ringed/.test(s.line), s.line);
await snap();   // 3: four steps, the equal ones dashed under his, his first ringed
s = await until(x => x.round === 3);
verdict('Flitwick calls the number, quoting no one', s.round === 3 && s.want === 5 && /five equal steps/.test(s.line) && !/"/.test(s.line), s.line);
s = await dance(even(4), { after: 700 });
verdict('four for five: the wrong count', s.last.reason === 'count' && /asked for five/.test(s.line), s.line);
await snap();   // 4: the count, five equal landings dashed
s = await clear();
s = await dance(even(5));
s = await until(x => /peers over the edge/.test(x.line), 60);
verdict('the practical passed, the end', s.done && s.last.reason === 'danced' && !/Full marks/.test(s.line) && /peers over the edge/.test(s.line), s.line);
await snap();   // 5: the exam passed, 1/5 each
verdict('misses counted', s.misses >= 1, String(s.misses));

// Flitwick's beat: each tap sent at its tick, the page's clock read once a try (node's clock minus the page's)
const beatTaps = async (at, o = {}) => {
  let c = null;
  for (let i = 0; i < 80 && !(c = JSON.parse(await ev('JSON.stringify(lumosDance.clock())'))); i++) await sleep(100);
  const off = performance.now() - c.now, d = await dk(), L = d.b - d.a;
  for (let i = 0; i < at.length; i++) {
    const w = c.t0 + (i + 1 + (o.off ? o.off[i] : 0)) * c.ms + off - performance.now() - 4;
    if (w > 0) await sleep(w);
    await tapAt(d.a + L * at[i], d.y);
  }
  await sleep(o.after || 400); return st();
};
s = await until(x => x.round === 4 && x.counting, 80);
verdict("on to Flitwick's beat: three steps, a tick a second", s.round === 4 && s.part === 1 && s.want === 3 && /one tick a second/.test(s.line), s.line);
s = await beatTaps([1 / 3], { off: [-1], after: 300 });
verdict('a step on his count: too soon', s.last.reason === 'beat' && !s.last.late && /Too soon/.test(s.line), s.line);
s = await clear();
s = await beatTaps([1 / 3], { after: 1700 });
verdict('a tick with no step', s.last.reason === 'beat' && s.last.late && /A tick went by/.test(s.line), s.line);
s = await clear();
s = await beatTaps([1 / 3, 2 / 3], { off: [0, -0.5], after: 300 });
verdict('step 2 half a beat early', s.last.reason === 'beat' && !s.last.late && /Step 2 came before its tick/.test(s.line), s.line);
s = await clear();
s = await beatTaps(even(3), { after: 300 });
verdict('three on the slow ticks: it dances', s.last.reason === 'danced' && Math.abs(s.last.time - 3000) < 120 && /on the beat/.test(s.line), s.line + ' ' + s.last.time);
s = await until(x => x.danced && x.runs === 1, 60); await sleep(600); s = await st();
verdict('across in 3 seconds, a third a second', /3\.0 seconds/.test(s.line) && /A third of the desk every second/.test(s.line), s.line);
await snap();   // 6: the chart, one line
s = await until(x => x.part === 2 && x.counting, 80);
verdict('part two: six on the quick beat', s.want === 6 && /twice as quick/.test(s.line), s.line);
s = await beatTaps(even(6), { after: 300 });
s = await until(x => x.danced && x.runs === 2, 60); await sleep(600); s = await st();
verdict('six on the quick ticks: 3 seconds again, the same speed', s.last.reason === 'danced' && /3\.0 seconds/.test(s.line) && /the same speed/.test(s.line) && Math.abs(s.last.speed - 1 / 3) < 0.02, s.line + ' ' + s.last.speed);
await snap();   // 7: two lines, lying together
s = await until(x => x.part === 3 && x.counting, 80);
verdict('part three: big steps on the quick beat', s.want === 3 && /big steps/.test(s.line), s.line);
await sleep(2300); await snap();   // 8: the metronome counting
s = await beatTaps(even(3), { after: 300 });
s = await until(x => x.danced && x.runs === 3, 60); await sleep(600); s = await st();
verdict('three on the quick ticks: 1.5 seconds, twice as fast', s.last.reason === 'danced' && /1\.5 seconds/.test(s.line) && /twice as fast/.test(s.line) && Math.abs(s.last.speed - 2 / 3) < 0.04, s.line + ' ' + s.last.speed);
await snap();   // 9: three lines, the third twice as steep
s = await until(x => /how far over how long/.test(x.line) && x.round === 4, 60);
verdict('the beat passed: full marks, speed', s.done && /how far over how long/.test(s.line), s.line);

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
