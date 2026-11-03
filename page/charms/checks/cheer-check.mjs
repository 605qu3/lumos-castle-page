// The Cheering Charm page check: node page/charms/checks/cheer-check.mjs [WxH], port 8777.
// Drives page/charms/cheer-test.html with real touches through every round: a tap, the frown again, a smirk, a flat
// line, the frown flipped (cheered, the reflection named); too narrow, far too deep (in fits, the quiet room), right to
// left (a flatter curve from a bigger circle); an S, one on the chin, and the exam passed; five shots to
// %TEMP%/lumos-shots/cheer-<WxH>-<n>.png.
// Q9's fix 5 (38th session): corner to corner, judged by judgeSmile: one end high, too narrow and on the chin miss the
// chalk dots at the corners; a smile 0.7 as deep from the corners is cheered, his line shot sliding into the true smile, and the
// lesson says the mirror makes it exactly as deep. Six shots; LUMOS_PORT and LUMOS_ROOT drive a copy on a spare port.
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
if (!(await up(root + 'cheer-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: process.env.LUMOS_ROOT || 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'cheer-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/cheer-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'cheer-test.html' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.cheering'); localStorage.removeItem('lumos.charms.cheerGuidedHits'); true");
await send('Page.reload'); await sleep(2500);
const st = async () => JSON.parse(await ev('JSON.stringify(lumosCheer.state())'));
const mOf = async () => JSON.parse(await ev('JSON.stringify(lumosCheer.mouth())'));
// a smile in the mouth's own frame, in half widths (x across, y down): a bow from (-w0, 0) to (w0, 0), its middle sag
// down (up if -); o.dy moves it down, o.slope tilts it, o.s makes an S, o.back draws it right to left
let M = await mOf(), D = M.depth / M.w;
const arc = (w0, sag, o = {}) => { const out = [];
  for (let i = 0; i <= 20; i++) { const x = -w0 + 2 * w0 * i / 20, f = x / w0;
    const y = (o.s ? sag * Math.sin(Math.PI * (f + 1)) : sag * (1 - f * f)) + (o.dy || 0) + x * (o.slope || 0);
    out.push({ x: Math.round(M.x + x * M.w), y: Math.round(M.y + y * M.w) }); }
  return o.back ? out.reverse() : out; };
const draw = async (pts, wait = 200) => { await drag(pts); await sleep(wait); return st(); };

let s = await st();
verdict('opens on the lesson, with the guide', s.round === 1 && /Cheering Charms today/.test(s.line) && s.guide === 1, s.line);
s = await draw([{ x: Math.round(M.x), y: Math.round(M.y) }]);
verdict('a tap asks for a smile', s.last.reason === 'tap' && /Draw a smile/.test(s.line), s.line);
s = await draw(arc(1, -D));
verdict('the frown again: flip it', s.last.reason === 'glum' && /Flip it/.test(s.line) && !s.cheered, s.line);
await sleep(400); await snap();   // 1: the frown, flipped, shown dashed on the line it flips over
s = await draw(arc(1, D, { slope: 0.4 }));
verdict('one end high: off the corners', s.last.reason === 'corners' && /chalk dot at a corner/.test(s.line), s.line);
s = await draw(arc(1, 0.2 * D));
verdict('hardly a curve: as deep as the frown', s.last.reason === 'flat' && /no happier/.test(s.line), s.line);
s = await draw(arc(1, 0.7 * D));
verdict('corner to corner, 0.7 as deep: cheered', s.cheered && s.last.reason === 'cheered' && s.learned && /great contentment/.test(s.line), s.line);
verdict('his was 0.7 of the frown', Math.abs(s.last.ratio - 0.7) < 0.1, String(s.last.ratio));
await sleep(400); await snap();    // 2: his line sliding into the true smile
await sleep(1400); await snap();   // 3: grinning, the line it flips over, the frown's ghost, the two depths equal
await sleep(2600); s = await st();
verdict('the lesson named: a reflection, the mirror exactly as deep', /a reflection/.test(s.line) && /exactly as deep/.test(s.line) && /yours was 0.7 of it/.test(s.line), s.line);
await sleep(6800); s = await st(); M = await mOf(); D = M.depth / M.w;
verdict('on to the wide frown, no guide', s.round === 2 && s.guide === null && /wide, sad mouth/.test(s.line), s.line);
s = await draw(arc(0.5, D));
verdict('too narrow: the corners', s.last.reason === 'corners' && /chalk dot at a corner/.test(s.line), s.line);
s = await draw(arc(1, 1));
verdict('far too deep: giggles helplessly', s.fits && s.last.reason === 'fits' && /Too much!/.test(s.line) && /giggles helplessly/.test(s.line), s.line);
await sleep(900); await snap();   // 3: in fits
await sleep(2700); s = await st();
verdict('after the fits: he settles, and how deep', !s.fits && /settles/.test(s.line) && /just as deep/.test(s.line), s.line);
s = await draw(arc(1, D, { back: true }));
verdict('right to left, flipped: cheered, a flatter curve', s.cheered && /flatter curve/.test(s.line) && /bigger circle/.test(s.line), s.line);
await sleep(2000); await snap();   // 4: the wide smile and the whole circle it is part of
await sleep(6200); s = await st(); M = await mOf(); D = M.depth / M.w;
verdict('on to not too much', s.round === 3 && /two hundred years/.test(s.line), s.line);
s = await draw(arc(1, D, { s: true }));
verdict('an S: one curve', s.last.reason === 'wiggly' && /Smoother/.test(s.line), s.line);
s = await draw(arc(1, D, { dy: 0.7 }));
verdict('down on the chin: the corners', s.last.reason === 'corners' && /chalk dot at a corner/.test(s.line), s.line);
s = await draw(arc(1, D));
verdict('just enough, the end', s.done && s.cheered && !/Full marks/.test(s.line) && /just enough/.test(s.line), s.line);
await sleep(2000); await snap();   // 5: the exam, cheered

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
