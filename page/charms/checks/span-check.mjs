// The req 218 check (Interaction's review of the spells, req 214): node page/charms/checks/span-check.mjs [WxH], port 8777.
// measureSpan's lone touch (a drag's lift and a stray tap are no ends), a why on castOver, openLock and revealInk, openHump's wait.
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
if (!(await up(root + 'room-spells-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'room-spells-test.html')); i++) await sleep(250);
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
const drag = async (pts, step = 16) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const p of pts.slice(1)) { await sleep(step); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  await sleep(step); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const line = (a, b, n = 10) => Array.from({ length: n + 1 }, (_, i) => ({ x: Math.round(a.x + (b.x - a.x) * i / n), y: Math.round(a.y + (b.y - a.y) * i / n) }));
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'room-spells-test.html' }); await sleep(3000);
const start = expr => ev(`(function(){ window.__a = null; window.__h = ${expr}; window.__h.done.then(function(r){ window.__a = r; }); return true; })()`);
const answer = () => ev('JSON.stringify(window.__a)');
const S = Math.min(W, H), cx = Math.round(W / 2), cy = Math.round(H / 2);

// 1. measureSpan with ends: a stray tap far from both ends and a look-drag's lift are no ends; then the two ends read
const e0 = { x: cx - Math.round(S * 0.3), y: cy }, e1 = { x: cx + Math.round(S * 0.3), y: cy };
await start(`LumosSpells.measureSpan({ ends: [${JSON.stringify(e0)}, ${JSON.stringify(e1)}], guide: 'off' })`);
await drag([{ x: 20, y: 40 }]); await sleep(300);
await drag(line({ x: cx, y: cy + Math.round(S * 0.3) }, { x: cx + 120, y: cy + Math.round(S * 0.3) })); await sleep(1200);
let a = await answer();
verdict('span, ends: a stray tap and a drag read nothing', a === 'null', a);
await drag([e0]); await sleep(200); await drag([e1]); await sleep(1800);
a = JSON.parse(await answer() || 'null');
verdict('span, ends: a tap on each end reads', a && a.verdict === 'measured' && a.inches > 0, JSON.stringify(a && { v: a.verdict, in: a.inches }));

// 2. measureSpan with no ends: a drag's lift is no end; two still taps read
await start(`LumosSpells.measureSpan({ at: { x: ${cx}, y: ${cy} }, guide: 'off' })`);
await drag(line({ x: cx - 100, y: cy - 60 }, { x: cx + 60, y: cy - 60 })); await sleep(200); await drag([{ x: cx + 80, y: cy + 40 }]); await sleep(1200);
a = await answer();
verdict('span: a drag then a tap read nothing', a === 'null', a);
await drag([{ x: cx - 70, y: cy }]); await sleep(1800);
a = JSON.parse(await answer() || 'null');
verdict('span: the tap and a second still tap read', a && a.verdict === 'measured', JSON.stringify(a && { v: a.verdict, in: a.inches }));
await drag([{ x: cx - 100, y: cy + 100 }], 20); await ev('window.__h.cancel && window.__h.cancel()');

// 3. why on castOver, openLock and revealInk: each miss answers in its page's words
await start(`LumosSpells.castOver({ at: { x: ${cx}, y: ${cy} }, guide: 'off' })`);
let j = await ev(`JSON.stringify(window.__h.judge(${JSON.stringify(line({ x: cx - 140, y: cy + 80 }, { x: cx + 140, y: cy + 80 }, 6).map((p, i) => ({ ...p, t: i * 20 })))}))`);
j = JSON.parse(j);
verdict('castOver: a sideways stroke misses with the Lumos page\'s words', j.verdict === 'missed' && j.why && j.why[0] === 'Sparks, sideways', JSON.stringify(j.why));
await sleep(500);
await start(`LumosSpells.openLock({ at: { x: ${cx}, y: ${cy} }, turn: 0.5, dir: -1, guide: 'off' })`);
const R = Math.round(S * 0.12), arc = (from, to) => Array.from({ length: 13 }, (_, i) => { const t = (from + (to - from) * i / 12) * Math.PI / 180; return { x: Math.round(cx + R * Math.sin(t)), y: Math.round(cy - R * Math.cos(t)), t: i * 40 }; });
await ev('window.__h.tap()');
j = JSON.parse(await ev(`JSON.stringify(window.__h.judge(${JSON.stringify(arc(0, 90))}))`));
verdict('openLock: the wrong way tightens, with its words', j.verdict === 'tight' && j.why && /A half turn, anticlockwise/.test(j.why[1]), JSON.stringify(j.why));
await ev('window.__h.cancel()'); await sleep(300);
await start(`LumosSpells.openLock({ at: { x: ${cx}, y: ${cy} }, turn: 0.5, dir: -1, guide: 'off' })`);
await ev('window.__h.tap()');
j = JSON.parse(await ev(`JSON.stringify(window.__h.judge(${JSON.stringify(arc(0, -90))}))`));
verdict('openLock: not far enough, with its degrees', j.verdict === 'missed' && j.why && /180 degrees/.test(j.why[1]), JSON.stringify(j.why));
await ev('window.__h.cancel()'); await sleep(300);
await start(`LumosSpells.openLock({ at: { x: ${cx}, y: ${cy} }, stuck: true, guide: 'off' })`);
await ev('window.__h.tap()');
j = JSON.parse(await ev(`JSON.stringify(window.__h.judge(${JSON.stringify(arc(0, 90))}))`));
verdict('openLock: a stuck lock says nothing happened', j.verdict === 'nothing' && j.why && j.why[0] === 'Nothing happened', JSON.stringify(j.why && j.why[0]));
await ev('window.__h.cancel()'); await sleep(300);
const sh = { x: cx - Math.round(S * 0.3), y: cy - Math.round(S * 0.2), w: Math.round(S * 0.6), h: Math.round(S * 0.4) };
await start(`LumosSpells.revealInk({ sheet: ${JSON.stringify(sh)}, guide: 'off' })`);
const y0 = cy, x0 = sh.x + 20, x2 = sh.x + sh.w - 20;
j = JSON.parse(await ev(`JSON.stringify(window.__h.taps([{x:${x0},y:${y0},t:0},{x:${x0 + 30},y:${y0},t:500},{x:${x2},y:${y0},t:1000}]))`));
verdict('revealInk: uneven spacing, its tenths in the words', j && j.verdict === 'missed' && j.why && /tenths of the line/.test(j.why[1]), JSON.stringify(j && j.why));
await ev('window.__h.cancel && window.__h.cancel()'); await sleep(300);

// 4. openHump with a wait shorter than its swing: the swing runs to its stop and opens
await start(`LumosSpells.openHump({ hump: { x: ${cx}, y: ${cy} }, wait: 1, hold: 0.5 })`);
await ev('window.__h.tap(); window.__h.say(); window.__h.tap(); true');
await sleep(1600);
const mid = await ev('window.__h.state().stage');
await sleep(3000);
a = JSON.parse(await answer() || 'null');
verdict('openHump: wait 1 s never ends the swing', mid === 'swing' || mid === 'stopped' ? a && a.verdict === 'opened' : false, JSON.stringify({ mid, v: a && a.verdict }));

const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/req218-${W}x${H}.png`, Buffer.from(s.result.data, 'base64'));
ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
