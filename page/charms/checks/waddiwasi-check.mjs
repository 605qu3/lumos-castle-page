// The Waddiwasi page check: node page/charms/checks/waddiwasi-check.mjs [WxH], port 8777.
// Drives page/charms/waddiwasi-test.html with real touches through every round and every miss: a tap, a start off the
// gum, a wiggly line, a short one, one drawn away, a wide one near, the same small slip far, the hits, and a hit on
// Peeves drifting; four shots to %TEMP%/lumos-shots/wad-<WxH>-<n>.png.
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
if (!(await up(root + 'waddiwasi-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'waddiwasi-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/wad-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'waddiwasi-test.html?guide=off' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.waddiwasi'); true");
const st = async () => JSON.parse(await ev('JSON.stringify(lumosWaddiwasi.state())'));
const pos = async () => JSON.parse(await ev('JSON.stringify({ g: lumosWaddiwasi.gum(), n: lumosWaddiwasi.nose() })'));

// a stroke from the gum (or from off it, in its reaches), at err degrees off the true line (+ clockwise), len px; wob trembles it
async function aim(err, o = {}) {
  const { g, n } = await pos();
  const a = { x: g.x + (o.off || 0) * g.r, y: g.y };
  const t = Math.atan2(n.y - a.y, n.x - a.x) + err * Math.PI / 180 + (o.away ? Math.PI : 0), len = o.len || Math.hypot(n.x - a.x, n.y - a.y) * 0.7;
  const pts = [];
  for (let i = 0; i <= 12; i++) { const k = i / 12, w = (o.wob || 0) * len * Math.sin(k * Math.PI * 3);
    pts.push({ x: Math.round(a.x + Math.cos(t) * len * k - Math.sin(t) * w), y: Math.round(a.y + Math.sin(t) * len * k + Math.cos(t) * w) }); }
  await drag(o.tap ? [pts[0]] : pts, o.step || 12);
  await sleep(150);
  return st();
}
const S = Math.min(W, H);

// round 1, near: each miss of form, then a wide one, then the hit
let s = await st();
verdict('starts in the near round', s.round === 1 && s.stage === 'aim' && !s.learned, JSON.stringify({ round: s.round, stage: s.stage }));
for (const [name, o, why] of [['a tap', { tap: true }, 'tap'], ['a start off the gum', { off: 3 }, 'off'], ['a wiggly line', { wob: 0.25 }, 'wiggly'],
  ['a short line', { len: S * 0.06 }, 'short'], ['a line drawn away', { away: true }, 'away']]) {
  s = await aim(0, o);
  verdict('near: ' + name, s.last && s.last.reason === why && s.stage === 'aim' && !s.waiting, JSON.stringify({ reason: s.last && s.last.reason, line: s.line }));
}
s = await aim(14); await sleep(1300);
verdict('near: 14 degrees off misses wide, the gap said', s.last && s.last.reason === 'wide' && /Splat!.*inch.*off; from here he allows only/.test((await st()).line), JSON.stringify({ last: s.last, line: (await st()).line }));
await snap();   // 1: the near miss's sum
await sleep(4300);
s = await st(); verdict('near: the wad back in the keyhole after the miss', s.stage === 'aim' && /fresh wad/.test(s.line), s.line);
s = await aim(-5); verdict('near: 5 degrees off still hits', s.last && s.last.verdict === 'hit', JSON.stringify(s.last));
await sleep(1500); s = await st();
verdict('near: the hit, Peeves whirls and zooms off, learned', s.stage === 'hit' && s.learned && /left nostril/.test(s.line), s.line);
await snap();   // 2: the near hit
s = await aim(0); verdict('a stroke between rounds is refused', s.stage === 'hit' && s.waiting, JSON.stringify({ stage: s.stage, waiting: s.waiting }));
await sleep(5200);

// round 2, far: the same small slip misses
s = await st(); verdict('on to the far round', s.round === 2 && s.stage === 'aim' && s.guide === null, JSON.stringify({ round: s.round, guide: s.guide }));
s = await aim(-5); await sleep(1300);
verdict('far: the same 5 degrees off misses', s.last && s.last.reason === 'wide' && s.last.allow < 5, JSON.stringify(s.last));
await snap();   // 3: the far miss's sum
await sleep(4300);
s = await aim(1); verdict('far: 1 degree off hits', s.last && s.last.verdict === 'hit', JSON.stringify(s.last));
await sleep(7600);

// round 3, drifting: a miss, then a hit at where he is
s = await st(); verdict('on to the drifting round', s.round === 3 && s.stage === 'aim', JSON.stringify({ round: s.round }));
const n1 = (await pos()).n; await sleep(1500); const n2 = (await pos()).n;
verdict('drifting: he moves along the corridor', Math.hypot(n2.x - n1.x, n2.y - n1.y) > 5, JSON.stringify({ n1, n2 }));
s = await aim(20); await sleep(5200);
verdict('drifting: a wide one misses', s.last && s.last.reason === 'wide', JSON.stringify(s.last));
s = await aim(0, { step: 6 }); await sleep(1500);
verdict('drifting: aimed at where he is, a hit', s.last && s.last.verdict === 'hit', JSON.stringify(s.last));
await snap();   // 4: the drifting hit
await sleep(4500); s = await st();
verdict('all three: the end', s.done && /All three/.test(s.line), s.line);

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
