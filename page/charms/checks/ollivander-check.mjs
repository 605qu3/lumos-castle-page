// The Ollivander bench check: node page/charms/checks/ollivander-check.mjs [WxH], port 8777 (27th session).
// Drives page/charms/ollivander-test.html's bench for wizard 1: the icon's script loaded (Design's req 246, each wood
// as LumosIcon.LOOK draws it), each of the seven woods at fifteen inches, shot; then oak at the full sixteen inches
// and Ollivander's nod (req 247, PS 5), willow at sixteen with none, and the nod again on a fresh visit to the bench.
// Rework 20's sequence-free tries and choice (req 405). Eleven shots (the ninth the oak wand in his hand) to %TEMP%/lumos-shots/ollivander-<WxH>-<n>.png.
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
if (!(await up(root + 'ollivander-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'ollivander-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/ollivander-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'ollivander-test.html?reset=1&who=1&forearm=12&scene=bench' }); await sleep(2500);
const st = async () => JSON.parse(await ev(`JSON.stringify({ line: document.getElementById('line').textContent, note: document.getElementById('note').textContent, scene: lumosOllivander.state().scene, build: lumosOllivander.build })`));
const chip = async k => ev(`(function () { var b = [].slice.call(document.querySelectorAll('#panel button')).filter(function (x) { return x.textContent === ${JSON.stringify(k)}; })[0]; if (!b) return false; b.click(); return true; })()`);
const len = async q => ev(`(function () { var s = document.querySelector('#panel input[type=range]'); s.value = ${q}; s.dispatchEvent(new Event('input')); return s.value; })()`);
let s = await st();
verdict('the bench, the icon\'s script loaded', s.scene === 'bench' && (await ev('!!(window.LumosIcon && LumosIcon.LOOK && LumosIcon.LOOK.oak)')) === true, s.line);
const woods = ['holly', 'willow', 'beech', 'maple', 'oak', 'mahogany', 'ebony'];
await len(60);
for (const k of woods) { await chip(k); await sleep(250); await snap(); }   // 1 to 7: each wood at fifteen inches, as the icon draws it
s = await st();
verdict('every wood at fifteen inches: no nod', !/rather bendy/.test(s.line), s.line);
await chip('oak'); await len(64); await sleep(300); s = await st();
verdict('oak at the full sixteen inches: his nod', /rather bendy/.test(s.line) && /Good wand, that one/.test(s.line) && /Hagrid/.test(s.note), s.line + ' | ' + s.note);
await snap();   // 8: the nod
await chip('willow'); await ev("lumosOllivander.go('bench')"); await sleep(300); s = await st();
verdict('willow at sixteen: no nod', !/rather bendy/.test(s.line), s.line);
await chip('oak'); await sleep(200); s = await st();
verdict('the bench again, oak at sixteen: the nod', /rather bendy/.test(s.line), s.line);
await ev("lumosOllivander.go('tryit')"); await sleep(900); s = await st();
verdict('give it a wave: the oak wand in his hand, its grain as the icon draws it', s.scene === 'tryit', s.scene);
await snap();   // 9: the oak wand at sixteen inches, close

// Rework 20 (req 405, 16 October 2026): Harry's PS 5 sequence off the page. A wand too short for him goes back on the
// bench with no "Curious... curious" and nothing snatched; the one that suits him answers with sparks in its own
// wood's colour, no handle glow, no warmth, no red and gold, no "Oh, bravo!".
await ev("lumosOllivander.go('bench')"); await sleep(300); await len(32); await ev("lumosOllivander.go('tryit')"); await sleep(400);
for (let i = 0; i < 5; i++) {
  await ev(`(function () { var W = innerWidth, H = innerHeight, t = performance.now(), p = []; for (var k = 0; k <= 12; k++) p.push({ x: W / 2, y: H * (0.62 - k * 0.022), t: Math.round(t + k * 16) }); return lumosOllivander.castTry(p).verdict; })()`);
  await sleep(150);
}
await sleep(1300); s = await st();
verdict('not this one: back on the bench, no "Curious", nothing snatched', /^Not this one/.test(s.line) && !/Curious|Tricky|Snatched/.test(s.line + s.note) && /Next try/.test(s.note), s.line + ' | ' + s.note);
await snap();   // 10: not this one
await ev("lumosOllivander.go('bench')"); await sleep(200); await chip('oak'); await len(60);
await ev("lumosOllivander.go('choose')"); await sleep(600); s = await st();
verdict('the one that suits him: no warmth in the fingers', s.scene === 'choose' && !/warmth/i.test(s.line), s.line);
const cols = await ev('JSON.stringify(lumosOllivander.sparkColours())'), wc = await ev('lumosOllivander.woodColour()');
verdict('its sparks in the wood\'s own colour, not red and gold', !/ff4a2a|ffcf4a/i.test(cols) && JSON.parse(cols).length === 2, wc + ' -> ' + cols);
await ev("lumosOllivander.go('chosen')"); await sleep(1900); s = await st();
verdict('chosen: no "Oh, bravo!", the sum in silver stays', !/bravo/i.test(s.line) && /yours/.test(s.line), s.line);
await snap();   // 11: chosen, the sum

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
