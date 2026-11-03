// The Finite Incantatem page check: node page/charms/checks/finite-check.mjs [WxH], port 8777.
// Drives page/charms/finite-test.html with real touches through every round: a tap, an open ring, a scribble, a ring
// round two only, the ring round all of it, the light caught and relit, the ring bent in under it, the crossings odd
// inside and even out, the horseshoe after a plain circle and its hint, the end; three shots to
// %TEMP%/lumos-shots/fin-<WxH>-<n>.png.
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
if (!(await up(root + 'finite-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'finite-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/fin-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'finite-test.html' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.finite'); true");
const st = async () => JSON.parse(await ev('JSON.stringify(lumosFinite.state())'));
const thingsOf = async () => JSON.parse(await ev('JSON.stringify(lumosFinite.things())'));
const S = Math.min(W, H), C = { x: W / 2, y: H / 2 };
const P = (x, y) => ({ x: Math.round(C.x + x * S), y: Math.round(C.y + y * S) });
// the tally's strokes, in shares of S from the middle
const ring = (cx, cy, R, turns = 1.05, dir = 1, a0 = 200) => { const out = [], n = Math.round(40 * turns); for (let i = 0; i <= n; i++) { const a = (a0 + dir * 360 * turns * i / n) * Math.PI / 180; out.push(P(cx + R * Math.cos(a), cy + R * Math.sin(a))); } return out; };
const kidney = (cx, cy, R, depth, w) => { const out = []; for (let i = 0; i <= 72; i++) { const deg = 200 + 360 * i / 72, d = ((deg - 90) % 360 + 540) % 360 - 180, rr = R * (1 - depth * Math.exp(-d * d / (2 * w * w))); out.push(P(cx + rr * Math.cos(deg * Math.PI / 180), cy + rr * Math.sin(deg * Math.PI / 180))); } return out; };
const horseshoe = (Ro, Ri, from, to) => { const out = [], n = 40; let a;
  for (let i = 0; i <= n; i++) { a = (from + (to - from) * i / n) * Math.PI / 180; out.push(P(Ro * Math.cos(a), Ro * Math.sin(a))); }
  for (let i = 0; i <= n; i++) { a = (to - (to - from) * i / n) * Math.PI / 180; out.push(P(Ri * Math.cos(a), Ri * Math.sin(a))); }
  out.push(P(Ro * Math.cos(from * Math.PI / 180), Ro * Math.sin(from * Math.PI / 180))); return out; };

let s = await st(), th;
verdict('opens on all of it', s.round === 1 && s.going === 4 && /one ring round all of them/.test(s.line), s.line);
await drag([P(0.01, 0.01)]); s = await st();
verdict('a tap asks for a ring', /ring right round them/.test(s.line) && s.going === 4, s.line);
await drag(ring(0, 0, 0.36, 0.7)); s = await st();
verdict('two thirds round: close it', s.last.reason === 'open' && /back to where you began/.test(s.line), s.line);
await drag(ring(0, 0, 0.36, 3.0)); s = await st();
verdict('three times round: a scribble', s.last.reason === 'scribble' && /not a scribble/.test(s.line), s.line);
await drag(ring(-0.18, 0, 0.24)); s = await st();
verdict('round the left two: those stop', s.last.reason === 'some' && s.going === 2 && /2 stopped/.test(s.line), s.line);
th = await thingsOf();
verdict('the left two stopped, the right two going', !th[0].going && !th[2].going && th[1].going && th[3].going, JSON.stringify(th.map(t => t.going)));
await drag(ring(0, 0, 0.36)); s = await st();
verdict('a ring round all: everything stopped', s.going === 0 && s.learned && /Finite Incantatem!/.test(s.line) && /Millicent/.test(s.line), s.line);
await sleep(900); await snap();   // 1: all of it, stopped, the inside glowing
await sleep(7600); s = await st();
verdict('on to keep the light', s.round === 2 && s.going === 4 && s.lit, s.line);
await drag(ring(0, -0.04, 0.44)); s = await st();
verdict('a plain ring catches the light: it goes out', s.last.reason === 'caught' && !s.lit && /lantern went out/.test(s.line), s.line);
await sleep(3900); s = await st();
verdict('lit again, all going again', s.lit && s.going === 4 && /lit again/.test(s.line), s.line);
await drag(kidney(0, -0.1, 0.44, 0.886, 22)); s = await st();
const ci = s.last.cross;
verdict('bent in under it: all stopped, the light kept', s.going === 0 && s.lit && /still burns/.test(s.line), s.line);
verdict('crossings: odd for the four, even for the lantern', ci.slice(0, 4).every(c => c % 2 === 1) && ci[4] % 2 === 0, JSON.stringify(ci));
await sleep(900); await snap();   // 2: the bent ring, the crossings counted
await sleep(8800); s = await st();
verdict('on to the horseshoe', s.round === 3 && s.going === 5 && s.lit, s.line);
await drag(ring(0, 0, 0.41)); s = await st();
verdict('a circle round the lot: caught, and the hint', s.last.reason === 'caught' && /horseshoe/.test(s.line), s.line);
await sleep(3900);
await drag(horseshoe(0.41, 0.16, 125, 415)); s = await st();
verdict('the horseshoe: all five stopped, the light kept, the end', s.done && s.going === 0 && s.lit && /band all round/.test(s.line) && /the one outside, kept/.test(s.line), s.line);
verdict('horseshoe crossings: odd for the five, even for the lantern', s.last.cross.slice(0, 5).every(c => c % 2 === 1) && s.last.cross[5] % 2 === 0, JSON.stringify(s.last.cross));
await sleep(900); await snap();   // 3: the horseshoe

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
