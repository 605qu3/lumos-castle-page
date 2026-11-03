// The Mobiliarbus page check (twenty-fourth session, Q6 6.3): node page/charms/checks/mobiliarbus-check.mjs [WxH], port 8777.
// Drives page/charms/mobiliarbus-test.html with real touches through its three rounds: a tap on the tree, one
// straight line along the squares; on the slant, an L up first then left, shot mid-drift (the arrow growing from the
// lift) and landed (his legs in his order, joined into one); two moves add up (8.1, thirty-first session): a wrong
// first slide, never wasted, and the rest from there, kept end to end and summed from where the round began, the other
// order dashed through its own square; in the hiding round on past, back and down (a miss), then an L across first
// right in front of the table, hidden, the whisper praised; then again, the two moves as told (an L, then a line);
// eight shots to %TEMP%/lumos-shots/mob-<WxH>-<n>.png.
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
if (!(await up(root + 'mobiliarbus-test.html'))) {
  spawn('py', ['-m', 'http.server', String(PORT)], { cwd: 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true }).unref();
  for (let i = 0; i < 20 && !(await up(root + 'mobiliarbus-test.html')); i++) await sleep(250);
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
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/mob-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'mobiliarbus-test.html' }); await sleep(2500);
await ev("localStorage.removeItem('lumos.spells.learned.mobiliarbus'); true");
await send('Page.reload'); await sleep(2500);
const st = async () => JSON.parse(await ev('JSON.stringify(lumosMobiliarbus.state())'));
const until = async (fn, n = 60) => { let s; for (let i = 0; i < n; i++) { s = await st(); if (fn(s)) return s; await sleep(200); } return s; };
// a drawn stroke from the tree along legs ([dx, dy] in squares, in turn), 12 points a leg
const legs = async (list) => {
  const s = await st(), a = JSON.parse(await ev(`JSON.stringify(lumosMobiliarbus.centre(${JSON.stringify(s.pos)}))`)), c = await ev('lumosMobiliarbus.cell()');
  const pts = [{ x: a.x, y: a.y }]; let x = a.x, y = a.y;
  for (const L of list) { for (let i = 1; i <= 12; i++) pts.push({ x: x + L[0] * c * i / 12, y: y + L[1] * c * i / 12 }); x += L[0] * c; y += L[1] * c; }
  await drag(pts);
};
let s = await st();
const tall = s.layout === 'tall', slant = tall ? [-1, -3] : [-1, -2];
verdict('the opening line', s.round === 0 && /Slide it 3 squares right/.test(s.line) && !/two legs/.test(s.line), s.line);

await legs([[0, 0.02]]); await sleep(400); s = await st();
verdict('a tap on the tree: nothing moves', s.last.reason === 'tap' && !s.moving && s.round === 0, JSON.stringify(s.last.reason));
await legs([[3, 0]]); s = await until(x => !x.moving);
verdict('one straight line, 3 right', s.last.shape === 'line' && /just as it should/.test(s.line) && !/two legs/.test(s.line) && s.learned, s.line);
await sleep(300); await snap();   // 1: the first slide's arrow
s = await until(x => x.round === 1 && !x.waiting && !x.moving, 30);
verdict('the slant round offers both ways', /One slanted line, or two legs along the squares/.test(s.line), s.line);

await legs([[0, slant[1]], [slant[0], 0]]); await sleep(700); s = await st();
verdict('an L, up first then left: judged an L', s.last.shape === 'L' && JSON.stringify(s.last.legs) === JSON.stringify([[0, slant[1]], [slant[0], 0]]), JSON.stringify(s.last));
verdict('mid-drift, the arrow growing', s.moving && s.arrow && s.arrow.grow && s.arrow.ell && s.arrow.acrossFirst === false, JSON.stringify(s.arrow));
await snap();   // 2: mid-drift, his legs dashed, the arrow part grown
s = await until(x => !x.moving);
verdict('landed: his two legs join into one slide', /Your two legs, 3 up then 1 left|Your two legs, 2 up then 1 left/.test(s.line) && /join into one slide, 1 left and [23] up: just as it should/.test(s.line), s.line);
await sleep(300); await snap();   // 3: his legs in his order, labelled, the arrow whole
s = await until(x => x.round === 2 && !x.waiting && !x.moving, 30);
const same = (p, q) => !!p && !!q && p[0] === q[0] && p[1] === q[1];
verdict('two moves: the round tells two', /Two moves this time: first 2 squares right and 1 square down, then 3 squares left and 1 square down/.test(s.line) && same(s.roundStart, [3, 0]) && same(s.target, [2, 2]), s.line);
await legs([[2, 0]]); s = await until(x => !x.moving);
verdict('a wrong first slide: never wasted, the rest from here', /never wasted/.test(s.line) && /From here, 3 left and 2 down to go/.test(s.line) && s.round === 2, s.line);
await legs([[-3, 0], [0, 2]]); await sleep(700); s = await st();
verdict('the second slide drifts, the first kept as arrow 1', s.moving && s.kept === 1, JSON.stringify({ kept: s.kept, moving: s.moving }));
s = await until(x => !x.moving && x.arrow && x.arrow.sum, 40);
verdict('landed: the two add up, one arrow from where the round began', same(s.arrow.from, [3, 0]) && same(s.arrow.to, [2, 2]) && s.kept === 2 &&
  /Two moves end to end\. Added up: 2 right and 3 left make 1 left; 2 down: one slide from where it began\./.test(s.line), s.line);
verdict('the other order dashed, the same square; a wrong slide never wasted', same(s.ghost, [0, 2]) && /the other way round: the same square\. A wrong slide is never wasted\./.test(s.line), JSON.stringify(s.ghost));
await sleep(900); await snap();   // 4: his two arrows numbered, the sum, the other order dashed
s = await until(x => x.round === 3 && !x.waiting && !x.moving, 50);
verdict('the hiding round asks for a whisper', /Whisper it/.test(s.line) && /quietly/.test(s.line), s.line);

const hide = [s.target[0] - s.pos[0], s.target[1] - s.pos[1]];
await legs([[hide[0] + 2, 0], [-2, 0], [0, hide[1]]]); await sleep(500); s = await st();
verdict('on past, back and down: a miss, the words name two legs', s.last.reason === 'wiggly' && /two straight legs along the squares/.test(s.line) && !s.moving, s.line);
await sleep(300); await snap();   // 5: the miss
await legs([[hide[0], 0], [0, hide[1]]]); s = await until(x => x.done || (!x.moving && x.last && x.last.verdict === 'slide' && x.round === 3 && x.pos[0] === x.target[0]), 40);
verdict('an L across first: hidden, the whisper praised', s.done && s.last.shape === 'L' && /Hidden! Quietly done./.test(s.line) && !/Fudge/.test(s.line), s.line);
await sleep(600); await snap();   // 6: hidden, the moves summed
verdict('the moves summed, start to finish', /from where it began/.test(s.line) && s.moves.length === 5 && s.kept === 0 && !s.ghost, JSON.stringify(s.moves));

// again, the two moves as told: an L across first, then one line
await ev('lumosMobiliarbus.start(), true'); await sleep(300);
await ev('lumosMobiliarbus.slide(3, 0), true'); s = await until(x => x.round === 1 && !x.waiting && !x.moving, 40);
await ev(`lumosMobiliarbus.slide(${slant[0]}, ${slant[1]}), true`); s = await until(x => x.round === 2 && !x.waiting && !x.moving, 50);
await legs([[2, 0], [0, 1]]); s = await until(x => !x.moving);
verdict('as told, the first: now the second', s.last.shape === 'L' && /the first move\. Now the second: 3 squares left and 1 square down\./.test(s.line) && same(s.pos, [5, 1]), s.line);
await legs([[-3, 1]]); await sleep(900); s = await st();
verdict('the second drifting, the first kept', s.moving && s.kept === 1, JSON.stringify({ kept: s.kept }));
await snap();   // 7: mid-drift, arrow 1 kept
s = await until(x => !x.moving && x.arrow && x.arrow.sum, 40);
verdict('as told, landed: added up, the other order the same square', same(s.pos, [2, 2]) && s.kept === 2 && same(s.ghost, [0, 1]) &&
  /Added up: 2 right and 3 left make 1 left; 1 down and 1 down make 2 down: one slide from where it began\. Dashed, the other way round: the same square\.$/.test(s.line), s.line);
await sleep(900); await snap();   // 8: the two as told, summed

ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
