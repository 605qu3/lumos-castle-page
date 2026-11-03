// The bluebell flames page check: node page/charms/checks/flames-check.mjs [WxH], port 8777.
// Drives page/charms/flames-test.html with real touches through every round: a tap, part way round, too small, too
// big, then the ring through all three (warm); a long oval, one moved aside, then the one ring; round three's ring,
// Neville's taps (too close, too far, on a friend, on the ring), Snape limping by and the close-up; then Three in a
// row (21st session): a ring near the row (no ring), a touch away from Harry, Harry dragged half a size out (still a
// row), a size and a half (one ring, too big), half the row (the smallest), and the ring drawn; then Four
// friends (27th session): on from Three in a row, the ring through the three while Neville walks far out ('apart'),
// his glow on kind while he is on it, and the ring drawn as he crosses it (each stroke timed from the last, ahead).
// Q9's fix (37th session): any closed loop through all three, judged by judgeLoop: a long oval names whom it misses,
// a lumpy loop through all three is warm with the jar at the one true middle (shot while drawn into the ring), and a
// triangle corner to corner is warm in Room for one more. Fourteen shots to %TEMP%/lumos-shots/flames-<WxH>-<n>.png;
// LUMOS_PORT and LUMOS_ROOT drive a copy on a spare port.
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
if (!(await up(root + 'flames-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: process.env.LUMOS_ROOT || 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'flames-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/flames-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'flames-test.html' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.bluebell')");
const st = async () => JSON.parse(await ev('JSON.stringify(lumosFlames.state())'));
const ringOf = async () => JSON.parse(await ev('JSON.stringify(lumosFlames.ring())'));
const R = Math.min(W, H) / 18;
/* a ring about the friends' own circle: grow (sizes), turns, squash (up-down over across), shift (sizes right) */
const ringPts = (c, o = {}) => { const out = [], n = 44, turns = o.turns || 1.05, r = c.r + (o.grow || 0) * R;
  for (let i = 0; i <= n; i++) { const a = turns * 2 * Math.PI * i / n; out.push({ x: c.x + (o.shift || 0) * R + r * Math.cos(a), y: c.y + r * (o.squash || 1) * Math.sin(a) }); }
  return out; };
/* a loop through the friends, lumpy on purpose: about their one ring, its radius r (1 + w g), g 0 at each friend */
const loopPts = (c, fr, w) => { const at = fr.map(f => Math.atan2(f.y - c.y, f.x - c.x)), g = th => at.reduce((m, a) => m * Math.sin((th - a) / 2) ** 2, 1);
  let gm = 0; for (let i = 0; i < 360; i++) gm = Math.max(gm, g(i * Math.PI / 180));
  const out = []; for (let i = 0; i <= 60; i++) { const th = at[0] - 0.3 + 1.05 * 2 * Math.PI * i / 60, r = c.r * (1 + w * g(th) / gm); out.push({ x: c.x + r * Math.cos(th), y: c.y + r * Math.sin(th) }); }
  return out; };
const triPts = (fr) => { const out = [], cs = [fr[0], fr[1], fr[2], fr[0]];
  for (let i = 0; i < 3; i++) for (let k = 0; k < 15; k++) out.push({ x: cs[i].x + (cs[i + 1].x - cs[i].x) * k / 15, y: cs[i].y + (cs[i + 1].y - cs[i].y) * k / 15 });
  out.push({ x: fr[0].x + (fr[1].x - fr[0].x) * 0.05, y: fr[0].y + (fr[1].y - fr[0].y) * 0.05 }); return out; };
const spotsNow = async () => JSON.parse(await ev('JSON.stringify(lumosFlames.friends().slice(0, 3))'));
const draw = async (pts) => { await drag(pts); await sleep(300); return st(); };
const tap = async (p) => { await drag([p, { x: p.x + 1, y: p.y }]); await sleep(300); return st(); };
let s = await st(), c = await ringOf();

verdict('the courtyard, the guide, the jam jar', s.round === 1 && s.guide !== null && /jam jar/.test(s.line), s.line);
await snap();   // 1: the three, shivering, the guide's ring
s = await tap({ x: c.x, y: c.y });
verdict('a tap: draw right round', s.last.reason === 'tap' && /right round/.test(s.line), s.line);
s = await draw(ringPts(c, { turns: 0.6 }));
verdict('part way round: close it up', s.last.reason === 'open' && /Close it up/.test(s.line), s.line);
s = await draw(ringPts(c, { grow: -2.4 }));
verdict('too small: all three left out in the cold', s.last.reason === 'out' && s.last.cold.length === 3 && /the Gryffindor, the Hufflepuff and the Ravenclaw/.test(s.line) && /cold/.test(s.line), s.line);
s = await draw(ringPts(c, { grow: 2.4 }));
verdict('too big: far too close, like Snape\'s hem', s.last.reason === 'out' && s.last.close.length === 3 && /far too close/.test(s.line), s.line);
await sleep(300); await snap();   // 2: the miss, his loop in rose, the three ringed
await sleep(2400);
s = await draw(ringPts(c));
verdict('through all three: warm, the same distance', s.warm && s.last.verdict === 'warm' && /same distance/.test(s.line) && s.learned, s.line);
await sleep(1500); await snap();   // 3: warm, the jar, the ring and the three gold lines
await sleep(3000); s = await st(); c = await ringOf();
verdict('on to Find the ring, no guide', s.round === 2 && s.guide === null && /No guide/.test(s.line), s.line);
s = await draw(ringPts(c, { squash: 0.55 }));
verdict('a long oval: a loop, but it misses someone', s.last.reason === 'out' && /Through/.test(s.line) && /the (Gryffindor|Hufflepuff|Ravenclaw)/.test(s.line), s.line);
await sleep(2400);
s = await draw(ringPts(c, { shift: 2.6 }));
verdict('moved to one side: names who is out', s.last.reason === 'out' && /Through/.test(s.line) && /the (Gryffindor|Hufflepuff|Ravenclaw)/.test(s.line), s.line);
await sleep(2400);
await drag(loopPts(c, await spotsNow(), 0.5)); await sleep(330); await snap();   // 4: the lumpy loop being drawn into the ring
s = await st();
verdict('a lumpy loop through all three: warm, exactly one ring, the jar at its true middle', s.warm && /exactly one/.test(s.line) && /same one/.test(s.line) && Math.hypot(s.jar.x - c.x, s.jar.y - c.y) < 1 && Math.abs(s.jar.r - c.r) < 1,
  s.line + ' jar ' + JSON.stringify(s.jar) + ' ring ' + JSON.stringify(c));
await sleep(4200); s = await st(); c = await ringOf();
verdict('on to Room for one more', s.round === 3 && /someone else/.test(s.line), s.line);
s = await draw(triPts(await spotsNow()));
verdict('a triangle corner to corner: warm again, the jar at the true middle', s.warm && Math.hypot(s.jar.x - c.x, s.jar.y - c.y) < 1, s.line + ' jar ' + JSON.stringify(s.jar));
await sleep(5600); s = await st();
verdict('Neville comes over, shivering', s.neville && s.neville.here && !s.neville.warm && /Neville/.test(s.line) && /Tap where/.test(s.line), s.line);
await snap();   // 5: Neville outside the ring, shivering
const J = s.jar, at = (deg, d) => ({ x: J.x + d * Math.cos(deg * Math.PI / 180), y: J.y + d * Math.sin(deg * Math.PI / 180) });
s = await tap(at(30, J.r * 0.3));
verdict('too close to the jar: robes catch', !s.neville.warm && /Too close/.test(s.line), s.line);
s = await tap(at(150, J.r + 4 * R));
verdict('too far: still shivering', !s.neville.warm && /Too far/.test(s.line), s.line);
const f0 = JSON.parse(await ev('JSON.stringify(lumosFlames.friends()[0])'));
s = await tap({ x: f0.x, y: f0.y });
verdict('on a friend: someone is already there', !s.neville.warm && /already standing/.test(s.line), s.line);
s = await tap(at(30, J.r));
verdict('on the ring: room for one more', s.neville.warm && /Room for one more/.test(s.line) && /same distance/.test(s.line), s.line);
await sleep(1200); await snap();   // 6: four round the jar, four gold lines
await sleep(2400); s = await st();
verdict('an icy gust: close up', s.closing && /icy gust/.test(s.line) && /close up/.test(s.line), s.line);
await sleep(3000); s = await st();
verdict('the end: a smaller ring, warmer', s.done && !/Full marks/.test(s.line) && /Warmer, too/.test(s.line), s.line);
await snap();   // 7: closed up, a smaller ring

// Three in a row: no ring through a row; Harry dragged out of line; the one ring
await sleep(4800); s = await st();
verdict('on to Three in a row', s.round === 4 && /in a row/.test(s.line) && s.step && !s.step.on && (await ringOf()) === null, s.line);
const fr = JSON.parse(await ev('JSON.stringify(lumosFlames.friends())')), half = Math.hypot(fr[2].x - fr[0].x, fr[2].y - fr[0].y) / 2, rowY = fr[1].y;
s = await draw(ringPts({ x: fr[1].x, y: fr[1].y, r: half }));
verdict('a ring near the row: no ring through three in a row, whatever loop, drag the middle one', s.last.reason === 'row' && /whatever loop/.test(s.line) && /three in a row/.test(s.line) && /Drag the middle one/.test(s.line) && s.step.on, s.line);
await sleep(300); await snap();   // 8: the miss in a row, Harry glowing to be dragged
s = await tap({ x: fr[0].x, y: fr[0].y });
verdict('a touch away from the middle one: drag him first', /First/.test(s.line) && !s.step.placed, s.line);
const pull = async (toY, hold) => {   // a finger on Harry, straight up to toY, held (and shot) before it lifts
  const h = JSON.parse(await ev('JSON.stringify(lumosFlames.friends()[1])')), pts = [];
  for (let i = 0; i <= 10; i++) pts.push({ x: h.x, y: h.y + (toY - h.y) * i / 10 });
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const p of pts.slice(1)) { await sleep(16); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  if (hold) await hold();
  await sleep(16); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); return st(); };
s = await pull(rowY - 0.5 * R);
verdict('half a size out: still in a row', !s.step.placed && /Still/.test(s.line), s.line + ' d ' + s.step.d);
s = await pull(rowY - 1.5 * R, async () => { await sleep(200); await snap(); });   // 9: held, one ring too big for the courtyard
verdict('a size and a half out: one ring, too big for the courtyard', !s.step.placed && !s.step.fits && /too big for the courtyard/.test(s.line), s.line + ' d ' + s.step.d);
s = await pull(rowY - half, async () => { await sleep(200); await snap(); });   // 10: held, half the row out, the smallest ring
verdict('half the row out: exactly one ring, the smallest', s.step.placed && s.step.fits && s.step.smallest && /exactly one/.test(s.line), s.line + ' d ' + s.step.d);
c = await ringOf();
s = await draw(ringPts(c));
verdict('the one ring: warm, the smallest, opposite each other', s.warm && /exactly one/.test(s.line) && /opposite each other/.test(s.line), s.line);
await sleep(1500); await snap();   // 11: warm, out of line
await sleep(3000); s = await st();
verdict('the end: no ring in a row, one out of line', s.done && !/Full marks/.test(s.line) && /no ring at all/.test(s.line), s.line);

// Four friends: the three fix the ring; Neville walks to and fro across it, 5 s each way
await sleep(4500); s = await st();
verdict('on to Four friends', s.round === 5 && !!s.four && /Neville/.test(s.line) && !s.done, s.line);
c = await ringOf();
let ahead = 700;   // how long a stroke takes to its lift, then measured from the last one
const offWhen = async (ok, a, ms = 14000) => { const t0 = Date.now();
  while (Date.now() - t0 < ms) { const w = JSON.parse(await ev(`JSON.stringify(lumosFlames.walker(${a}))`)); if (ok(w.off)) return w; await sleep(20); }
  return null; };
const drawTimed = async (pts) => { const t1 = Date.now(); await drag(pts); ahead = Date.now() - t1; await sleep(300); return st(); };
await offWhen(o => o > 2.1, ahead);
s = await drawTimed(ringPts(c));
verdict('the ring through the three, Neville far out: apart, wait till he is on it', s.last.reason === 'apart' && s.last.apart === 3 && /Wait till he is on it/.test(s.line) && /outside/.test(s.line) && !s.warm,
  s.line + ' fixOff ' + (s.last.fixOff || []).join(', ') + ' ahead ' + ahead);
await sleep(250); await snap();   // 12: apart, the three's ring, the gap along the line from its middle
await sleep(2500);
await offWhen(o => Math.abs(o) < 0.4, 0); s = await st();
verdict('on kind, Neville glows while on the ring', s.four && s.four.on && Math.abs(s.four.off) <= 1.4, JSON.stringify(s.four));
await snap();   // 13: the three's ring faint, Neville ringed gold on it
await offWhen(o => o > 1.6 || o < -1.6, 0);   // let him walk off it again
await offWhen(o => Math.abs(o) < 0.2, ahead);
s = await drawTimed(ringPts(c));
verdict('drawn as he crosses it: warm, all four on one ring', s.warm && /all four/.test(s.line) && /one ring through four/.test(s.line),
  s.line + ' fixOff ' + (s.last.fixOff || []).join(', ') + ' ahead ' + ahead);
await sleep(1500); await snap();   // 14: warm, the jar in the middle, a gold line to each of the four
await sleep(3000); s = await st();
verdict('the end: three fix one ring, a fourth only now and then', s.done && !/Full marks/.test(s.line) && /now and then/.test(s.line), s.line);

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
