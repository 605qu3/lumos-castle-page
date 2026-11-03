// The Freezing Charm page check: node page/charms/checks/freeze-check.mjs [WxH], port 8777.
// Drives page/charms/freeze-test.html with real touches through every round, each stroke aimed at where the pixies
// will be when it lifts (the page's pixies(ms)): a tap, a curve, beside them both, one missed, then through both
// (frozen, into the cage); two flitting, through both; three out of a row, then waited for and caught in a row; then
// Four in a row (twenty-third session): both off the still two's line (not yet), three on it and one off, in a row
// but stopped short, then all four caught; nine shots to %TEMP%/lumos-shots/freeze-<WxH>-<n>.png.
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
if (!(await up(root + 'freeze-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: process.env.LUMOS_ROOT || 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'freeze-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/freeze-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'freeze-test.html' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.freezing'); localStorage.removeItem('lumos.charms.freezeGuidedHits'); true");
await send('Page.reload'); await sleep(2500);
const st = async () => JSON.parse(await ev('JSON.stringify(lumosFreeze.state())'));
const until = async (fn, n = 60) => { let s; for (let i = 0; i < n; i++) { s = await st(); if (fn(s)) return s; await sleep(200); } return s; };
const AHEAD = 260;   // about how long a 16-point stroke takes from touch to lift, at first
let ahead = AHEAD;   // then as long as the last stroke took, measured (twenty-third session: at 390 x 844 a stroke took longer than 260 ms)
// a stroke on the line from pixie i to pixie j as they will be at the lift; o: off (sideways, sizes), turn (swung so
// pixie j is that many sizes off), sag (bowed, a share of it), tap, upto (on past where pixie upto falls on the line)
const cast = async (o = {}) => {
  const t1 = performance.now(), px = JSON.parse(await ev(`JSON.stringify(lumosFreeze.pixies(${ahead}, true))`));   // Q9's fix: held all the stroke, they crawl
  const i = o.i || 0, j = o.j ?? px.length - 1, A = px[i], B = px[j], r = A.r;
  if (o.tap) { await drag([{ x: A.x, y: A.y }, { x: A.x + 1, y: A.y }]); await sleep(300); return st(); }
  const d = Math.hypot(B.x - A.x, B.y - A.y); let u = { x: (B.x - A.x) / d, y: (B.y - A.y) / d };
  if (o.turn) { const th = Math.asin(Math.min(1, o.turn * r / d)); u = { x: u.x * Math.cos(th) - u.y * Math.sin(th), y: u.x * Math.sin(th) + u.y * Math.cos(th) }; }
  const U = o.upto != null ? px[o.upto] : null, n = { x: -u.y, y: u.x }, s0 = -1.5 * r, pts = [];
  const s1 = (U ? (U.x - A.x) * u.x + (U.y - A.y) * u.y : d) + 1.5 * r;
  for (let k = 0; k <= 15; k++) { const f = k / 15, s = s0 + (s1 - s0) * f, side = (o.off || 0) * r + (o.sag ? 4 * o.sag * (s1 - s0) * f * (1 - f) : 0);
    pts.push({ x: A.x + u.x * s + n.x * side, y: A.y + u.y * s + n.y * side }); }
  await drag(pts); ahead = Math.round(performance.now() - t1); await sleep(350); return st();
};
const held = async () => Number(await ev(`lumosFreeze.heldMs(${ahead})`));   // their ms in a stroke's real ms
const clock = async () => JSON.parse(await ev('JSON.stringify(lumosFreeze.clock())'));
// Q9's fix: a slow stroke aimed where they are at the touch, held a second first, then drawn over about 1.1 s
const slowCast = async () => {
  const px = JSON.parse(await ev('JSON.stringify(lumosFreeze.pixies(0))')), A = px[0], B = px[px.length - 1], r = A.r;
  const d = Math.hypot(B.x - A.x, B.y - A.y), u = { x: (B.x - A.x) / d, y: (B.y - A.y) / d }, pts = [];
  for (let k = 0; k <= 15; k++) { const sk = -1.5 * r + (d + 3 * r) * k / 15; pts.push({ x: A.x + u.x * sk, y: A.y + u.y * sk }); }
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  const c0 = await clock(); await sleep(500); await snap(); await sleep(500); const c1 = await clock();
  for (const p of pts.slice(1)) { await sleep(70); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  await sleep(70); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(350); return { s: await st(), held: Math.round(c1.ms - c0.ms), rate: c1.rate };
};
const waitRow = async (lo, hi) => { for (let i = 0; i < 240; i++) { const m = Number(await ev('lumosFreeze.nextRow()')); if (m >= lo && m <= hi) return m; await sleep(25); } return -1; };

let s = await st();
verdict('the lesson opens: two at once, the guide up', s.round === 1 && s.guide === 1 && /two at once/.test(s.line), s.line);
s = await cast({ tap: true });
verdict('a tap: a line, not a dot', s.last.reason === 'tap' && /not a dot/.test(s.line), s.line);
s = await cast({ sag: 0.3 });
verdict('a curve to each: straight!', s.last.reason === 'curved' && /Straight/.test(s.line), s.line);
s = await cast({ off: 2.6 });
verdict('beside them both: missed both', s.last.reason === 'none' && /Missed them both/.test(s.line), s.line);
await snap();   // 1: the line run on in rose, both ringed
await sleep(1200);
s = await cast({ turn: 3 });
verdict('swung off the second: one got away, named', s.last.reason === 'missed' && s.last.missed === 1 && /got away/.test(s.line), s.line);
await sleep(1200);
s = await cast();
verdict('through both: frozen, one line', s.frozen && s.last.reason === 'frozen' && /exactly one straight line/.test(s.line) && s.learned, s.line);
await sleep(500); await snap();   // 2: frozen, the line run on, their paths dotted
s = await until(x => x.caged);
verdict('into the box', s.caged && /box/.test(s.line), s.line);
s = await until(x => x.round === 2);
verdict('flitting: no guide', s.round === 2 && s.guide === null && /No guide/.test(s.line), s.line);
verdict('flitting says they slow while the wand is down', /slow almost to a stop/.test(s.line), s.line);
const sc = await slowCast(); s = sc.s;   // 3: held, the frost in, the pixies crawling
verdict('held a second, they slow almost to a stop', sc.held < 250 && sc.rate < 0.1, 'their ms in 1000 held: ' + sc.held + ', rate ' + sc.rate.toFixed(3));
verdict('two flitting, a slow stroke aimed at the touch: frozen mid-flight', s.frozen && /mid-flight/.test(s.line), s.line + ' ' + JSON.stringify(s.last.off));
{ const c2 = await clock(); await sleep(500); const c3 = await clock();
  verdict('lifted, their clock runs free again', c3.ms - c2.ms > 420 && c3.ms - c2.ms < 580 && c3.rate > 0.99, Math.round(c3.ms - c2.ms) + ' ms in 500, rate ' + c3.rate.toFixed(3)); }
await sleep(500); await snap();   // 3: frozen mid-flight, the paths ahead dotted
s = await until(x => x.round === 3);
verdict('three in a row: wait for it', s.round === 3 && /in a row/.test(s.line), s.line);
await waitRow(1200, 1900);
s = await cast();
verdict('three out of a row: not in a row', s.last.reason === 'missed' && s.last.bend > 1.6 && /not in a row/.test(s.line), s.line + ' bend ' + s.last.bend);
await snap();   // 4: out of a row, the middle one ringed
await sleep(900);
await waitRow((await held()) + 10, (await held()) + 60);
await sleep(30);
s = await cast();
verdict('three in a row: all three', s.frozen && /All three/.test(s.line), s.line + ' ' + JSON.stringify(s.last));
s = await until(x => /here come/.test(x.line));
verdict('three caught: on to four', /Three at once, caught/.test(s.line), s.line);
await snap();   // 5: the three on their way to the cage
s = await until(x => x.round === 4);
verdict('four in a row: two fix the line', s.round === 4 && /Two points fix a line/.test(s.line), s.line);
await waitRow(1300, 1650);   // Q9's fix: a held stroke eats little of their time, so start where both are well off
s = await cast({ j: 2, upto: 3 });
verdict('both off the still two\'s line: not yet', s.last.reason === 'apart' && s.last.onFix === 2 && /Not yet/.test(s.line), s.line + ' ' + JSON.stringify(s.last.fixOff));
await snap();   // 6: the line the still two fix, the gap square to it
await sleep(900);
await waitRow(1963 + (await held()) - 80, 1963 + (await held()) + 80);
s = await cast({ j: 2, upto: 3 });
verdict('three on the line, one off', s.last.reason === 'apart' && s.last.onFix === 3 && /Three in a row, but/.test(s.line), s.line + ' ' + JSON.stringify(s.last.fixOff));
await snap();   // 7: three on it, the one off ringed and its gap drawn
await sleep(900);
await waitRow((await held()) + 10, (await held()) + 60); await sleep(30);
s = await cast({ j: 2 });
verdict('in a row, stopped short: run the line on', s.last.reason === 'missed' && /stopped short/.test(s.line), s.line + ' ' + JSON.stringify(s.last));
await sleep(900);
await waitRow((await held()) + 10, (await held()) + 60); await sleep(30);
s = await cast();
verdict('four in a row: all four', s.frozen && /All four/.test(s.line), s.line + ' ' + JSON.stringify(s.last));
await sleep(500); await snap();   // 8: the four frozen, the line run on
s = await until(x => x.done);
verdict('the end: all four', s.done && !/Full marks/.test(s.line) && /All four caught/.test(s.line), s.line);
await snap();   // 9: the four on their way to the cage
verdict('misses counted', s.misses >= 1, String(s.misses));

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
