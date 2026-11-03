// The Ferula page check: node page/charms/checks/ferula-check.mjs [WxH], port 8777.
// Drives page/charms/ferula-test.html with real touches through every round: a coil before the tap, the tap, each miss
// of form (begun half way, straight, short, off), gaps and the sum, a binding, the narrow bandage's pair (the same turns
// leave gaps), Ron's wand, the end; Q9's fix (13 October 2026): 4, 6 and 5 turns, only the widest gap ringed, and a
// binding with fewer turns than the sum said to pull tight; four shots to %TEMP%/lumos-shots/fer-<WxH>-<n>.png.
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
if (!(await up(root + 'ferula-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'ferula-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/fer-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'ferula-test.html?guide=off' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.ferula'); true");
const st = async () => JSON.parse(await ev('JSON.stringify(lumosFerula.state())'));
const legOf = async () => JSON.parse(await ev('JSON.stringify(lumosFerula.leg())'));
const tap = async () => { const l = await legOf(); await drag([{ x: Math.round(l.a.x), y: Math.round((l.a.y + l.b.y) / 2) }]); await sleep(200); };
// a zigzag up the leg: turns, from s0 to s1 (shares), amp half widths
async function coil(turns, o = {}) {
  const l = await legOf(), s0 = o.s0 ?? 0.03, s1 = o.s1 ?? 0.97, amp = o.amp ?? 1, n = Math.max(24, turns * 10), pts = [];
  for (let i = 0; i <= n; i++) { const k = i / n, s = s0 + (s1 - s0) * k;
    pts.push({ x: Math.round(l.a.x + l.r * amp * Math.sin(k * turns * 2 * Math.PI)), y: Math.round(l.a.y - l.L * s) }); }
  await drag(pts, 10); await sleep(200);
  return st();
}
let s = await st();
verdict('starts in the teddy round, tap first', s.round === 1 && s.stage === 'tap' && !s.learned, JSON.stringify({ round: s.round, stage: s.stage }));
s = await coil(7); verdict('a coil before the tap is told to tap first', s.stage === 'tap' && /Tap it first/.test(s.line), s.line);
await tap(); s = await st(); verdict('the tap on the leg', s.stage === 'coil', s.line);
for (const [name, t, o, why] of [['begun half way up', 5, { s0: 0.55 }, 'start'], ['a straight line up', 0, {}, 'straight'],
  ['stopped half way', 4, { s1: 0.5 }, 'short'], ['swinging far off', 7, { amp: 3.5 }, 'off']]) {
  s = await coil(t, o);
  verdict('teddy: ' + name, s.last && s.last.reason === why && s.stage === 'coil', JSON.stringify({ reason: s.last && s.last.reason, line: s.line }));
}
s = await coil(2); await sleep(1900); s = await st();
verdict('teddy: two turns leave gaps, one ring, the sum drawn, never said (Rework 4)', s.last && s.last.reason === 'gaps' && s.last.need === 4 && s.last.turns === 2 && s.ringed && /shows through, widest where it is ringed/.test(s.line) && !/÷|You made/.test(s.line), s.line);
await snap();   // 1: gaps on the wide bandage, the widest ringed
await sleep(3600); s = await st(); verdict('teddy: unwound after the gaps', s.stage === 'coil' && /try again/.test(s.line), s.line);
s = await coil(5); await sleep(1900); s = await st();
verdict('teddy: five turns bind, learned', s.last && s.last.verdict === 'bound' && s.learned && /Ferula!/.test(s.line) && !/You made/.test(s.line), s.line);
await snap();   // 2: bound
s = await coil(5); verdict('a stroke between rounds is refused', s.waiting && s.stage === 'spun', JSON.stringify({ stage: s.stage, waiting: s.waiting }));
await sleep(5200);
s = await st(); verdict('on to the narrow bandage, no guide', s.round === 2 && s.stage === 'tap' && s.guide === null, JSON.stringify({ round: s.round, guide: s.guide }));
await tap(); s = await coil(4); await sleep(1900); s = await st();
verdict('narrow: the same four turns leave gaps, needs 6, one ring', s.last && s.last.reason === 'gaps' && s.last.need === 6 && s.ringed && s.ringed.px >= 0, JSON.stringify({ last: s.last, ringed: s.ringed }));
await snap();   // 3: the pair, gaps on the narrow
await sleep(3600);
s = await coil(7); verdict('narrow: seven turns bind', s.last && s.last.verdict === 'bound', JSON.stringify(s.last));
await sleep(7200);
s = await st(); verdict('on to Ron\'s wand', s.round === 3 && s.stage === 'tap', JSON.stringify({ round: s.round }));
await tap(); s = await coil(4); await sleep(1900); s = await st();
const tight = s.last && s.last.verdict === 'bound';
verdict('broom: four turns of five, the line agrees either way', tight ? /only just covers\./.test(s.line) : (s.last && s.last.reason === 'gaps' && s.last.turns === 4), (tight ? 'bound: ' : 'gaps: ') + s.line);
if (!tight) { await sleep(3600); s = await coil(6); await sleep(1900); s = await st(); }
verdict('broom: bound, the handle 15 in, needs 5', s.last && s.last.verdict === 'bound' && s.last.need === 5 && /Ferula!/.test(s.line), s.line);
await snap();   // 4: the wand bound
await sleep(5600); s = await st(); verdict('all three: the end', s.done && /All three strapped/.test(s.line), s.line);

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
