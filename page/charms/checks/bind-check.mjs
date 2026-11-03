// The Petrificus Totalus page check: node page/charms/checks/bind-check.mjs [WxH], port 8777.
// Drives page/charms/bind-test.html with real touches through every round: a tap, one line and its twin asked for,
// both on one side, a V that would meet past its feet (the gaps differ), the bind and the same gap at helmet and feet,
// both slanting, an upside-down V over its helmet, the leaning one drawn upright (the hint) and then with its lean;
// three shots to %TEMP%/lumos-shots/bind-<WxH>-<n>.png.
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
if (!(await up(root + 'bind-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'bind-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/bind-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'bind-test.html' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.petrificus'); localStorage.removeItem('lumos.charms.bindGuidedHits'); localStorage.removeItem('lumos.charms.bindGuidedHits2'); true");
await send('Page.reload'); await sleep(2500);
const st = async () => JSON.parse(await ev('JSON.stringify(lumosBind.state())'));
const figOf = async () => JSON.parse(await ev('JSON.stringify(lumosBind.figure())'));
// the tally's lines, in the figure's own frame, in heights: s across, t down its line
let F = await figOf();
const at = (s, t) => { const L = F.lean * Math.PI / 180; return { x: Math.round(F.x + (s * Math.cos(L) - t * Math.sin(L)) * F.h), y: Math.round(F.y + (s * Math.sin(L) + t * Math.cos(L)) * F.h) }; };
const ln = (sm, ang, len = 0.9, up = false) => { const k = Math.tan(ang * Math.PI / 180), half = len / 2 * Math.cos(Math.atan(k)), out = [];
  for (let i = 0; i <= 16; i++) { const t = -half + 2 * half * i / 16; out.push(at(sm + t * k, t)); } return up ? out.reverse() : out; };
const pair = async (a, b) => { await drag(a); await sleep(150); await drag(b); await sleep(120); };

let s = await st();
verdict('opens on stiff as a board', s.round === 1 && /one line down each side/.test(s.line) && s.guide === 1, s.line);
await drag([at(-0.25, 0)]); s = await st();
verdict('a tap asks for a line', /Draw a line/.test(s.line) && !s.first, s.line);
await drag(ln(-0.25, 0)); s = await st();
verdict('one line: now the other side', s.first && /other side/.test(s.line), s.line);
await drag(ln(-0.4, 0)); await sleep(120); s = await st();
verdict('both on its left: one each side', s.last.reason === 'same' && /each side/.test(s.line) && !s.bound, s.line);
await pair(ln(-0.25, 8), ln(0.25, -8)); s = await st();
verdict('a V: they would meet past its feet', s.last.reason === 'meet' && s.last.where === 'below' && /never meet/.test(s.line) && /past its feet/.test(s.line), s.line);
verdict('a V: the gaps differ, helmet and feet', s.last.gapTop > s.last.gapBottom * 1.5, s.last.gapTop + ' / ' + s.last.gapBottom);
await sleep(1500);
await pair(ln(-0.25, 0), ln(0.25, 0, 0.9, true)); s = await st();
verdict('down both sides: bound', s.bound && s.last.reason === 'bound' && s.learned && /Petrificus Totalus!/.test(s.line) && /Neville/.test(s.line), s.line);
await sleep(3300); await snap();   // 1: fallen, his lines snapped true, the gaps
await sleep(2200); s = await st();
const g = s.line.match(/\d+ ft( \d+ in)?|\d+ in/g) || [];
verdict('the same gap at helmet and feet: parallel', g.length === 2 && g[0] === g[1] && /parallel/.test(s.line), s.line);
await sleep(6700); s = await st(); F = await figOf();
verdict('on to never meet, no guide, the light inside', s.round === 2 && !s.bound && s.guide === null && /light shines/.test(s.line), s.line);
await pair(ln(-0.25, 25), ln(0.25, 25)); s = await st();
verdict('both slanting: draw straight down', s.last.reason === 'slant' && /straight down/.test(s.line), s.line);
await pair(ln(-0.28, -9), ln(0.28, 9)); s = await st();
verdict('an upside-down V: they would meet over its helmet', s.last.reason === 'meet' && s.last.where === 'above' && /over its helmet/.test(s.line), s.line);
await sleep(500); await snap();   // 2: the meet drawn on, dashed
await sleep(1000);
await pair(ln(0.22, 0), ln(-0.22, 0)); s = await st();
verdict('the right side first: bound', s.bound && /Bound, light and all/.test(s.line), s.line);
await sleep(8000); s = await st(); F = await figOf();
verdict('on to the leaning one', s.round === 3 && F.lean === 24 && /leans on a pillar/.test(s.line), s.line);
await pair(ln(-0.25, 24), ln(0.25, 24)); s = await st();
verdict('upright beside it: lean them, the hint', s.last.reason === 'slant' && /Lean both lines/.test(s.line), s.line);
await pair(ln(-0.25, 0), ln(0.25, 0)); s = await st();
verdict('leaning with it: bound, the end', s.done && s.bound && /Bound, leaning and all/.test(s.line) && /never meeting/.test(s.line), s.line);
await sleep(3300); await snap();   // 3: the leaning one, bound

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
