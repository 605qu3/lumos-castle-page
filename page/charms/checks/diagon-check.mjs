// The Diagon Alley wall page check: node page/charms/checks/diagon-check.mjs [WxH], port 8777.
// Drives page/charms/diagon-test.html with real taps (fortieth session; Q10, option 1, coordinates). Hagrid's way:
// the bin (counted from), a brick level with the bin, a swapped count (two up, three across: the sneeze), one too
// high, one too far right, an uneven beat, then three up, two across at an even beat: the arch, then the sum.
// Harry's way: the second brick from the left, then the third (the whole column lit), a tap near the wanted brick's
// edge (in at kind), then the brick: the arch and the sum with 1st, 2nd, 3rd. The chalk grid, below. Shots to
// %TEMP%/lumos-shots/diagon-<WxH>-<n>.png. LUMOS_PORT and LUMOS_ROOT drive a copy on a spare port.
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
let server = null;
if (!(await up(root + 'diagon-test.html'))) {
  server = spawn('py', ['-m', 'http.server', String(PORT)], { cwd: process.env.LUMOS_ROOT || 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true });
  for (let i = 0; i < 20 && !(await up(root + 'diagon-test.html')); i++) await sleep(250);
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
let shot = 0;
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/diagon-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + 'diagon-test.html' }); await sleep(2500);
const st = async () => JSON.parse(await ev('JSON.stringify(lumosDiagon.state())'));
const wall = async () => JSON.parse(await ev('JSON.stringify(lumosDiagon.wall())'));
const mid = async (a, u) => JSON.parse(await ev(`JSON.stringify(lumosDiagon.mid(${a}, ${u}))`));
const tapAt = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(40);
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
// three taps at one point, gaps in ms between them; then a rest past the page's 1.5 s so the next count starts clean
const three = async (p, gaps = [380, 380], after = 500) => { await tapAt(p.x, p.y); for (const g of gaps) { await sleep(g); await tapAt(p.x, p.y); } await sleep(after); return st(); };
const rest = () => sleep(1700);

let s = await st(), w = await wall();
verdict('Hagrid\u2019s way opens with his words', s.round === 1 && s.stage === 'cast' && /Three up/.test(s.line), s.line);
verdict('the course is a finger\u2019s height', w.bh >= 40, 'course ' + w.bh.toFixed(1) + ' px, brick ' + w.bw.toFixed(1));
await snap();   // 1: the wall, the bin, his words
s = await three({ x: w.bin.x + w.bin.w / 2, y: w.bin.y + w.bin.h / 2 }); await rest();
verdict('the bin itself: count from it', s.last.j.reason === 'bin' && /coal scuttle itself/.test(s.line), s.line);
s = await three(await mid(3, 0)); await rest();
verdict('level with the bin: one up is above its lid', s.last.j.reason === 'below' && /one up/.test(s.line), s.line);
s = await three(await mid(3, 2)); await sleep(250); await snap();   // 2: the swapped brick sneezes
await rest();
verdict('two up, three across: swapped, the sneeze', s.last.j.reason === 'swapped' && /sneezed/.test(s.line) && /up first/.test(s.line), s.line);
s = await three(await mid(2, 4)); await rest();
verdict('one too high', s.last.j.reason === 'column' && /1 brick too high/.test(s.line), s.line);
s = await three(await mid(3, 3)); await rest();
verdict('one too far right', s.last.j.reason === 'row' && /1 brick too far right/.test(s.line), s.line);
s = await three(await mid(2, 3), [250, 900]); await rest();
verdict('the right brick, an uneven beat', s.stage === 'cast' && /even beat/.test(s.line), s.line);
s = await three(await mid(2, 3), [400, 400], 1600); await snap();   // 3: the hole growing into the arch
verdict('three up, two across: the brick quivers', s.stage === 'open' && /quivers/.test(s.line), s.line);
await sleep(5600); s = await st(); await snap();   // 4: the wall back, the sum drawn
verdict('the sum: two numbers name one brick', s.stage === 'done' && /3 up/.test(s.line) && /2 across/.test(s.line) && /one brick/.test(s.line), s.line);

await ev('lumosDiagon.choose(1)'); await sleep(400); s = await st();
verdict('Harry\u2019s way opens with his line', s.round === 2 && s.stage === 'column' && /third brick from the left/.test(s.line), s.line);
await tapAt(...Object.values(await mid(1, 4))); await sleep(400); s = await st();
verdict('the second from the left: count again', s.stage === 'column' && /second brick from the left/.test(s.line), s.line);
await tapAt(...Object.values(await mid(2, 5))); await sleep(600); s = await st(); await snap();   // 5: the whole column lit
verdict('the third from the left: one number, a whole column', s.stage === 'cast' && s.lit && /one number/.test(s.line) && /three up/.test(s.line), s.line);
w = await wall(); let c = await mid(2, 3);
s = await three({ x: c.x, y: w.y - 3 * w.bh - 0.2 * w.bh }, [400, 400], 1600);
verdict('a fifth of a course above it counts at kind', s.stage === 'open' && s.last.j.near === true, JSON.stringify(s.last.j));
await sleep(5600); s = await st(); await snap();   // 6: the sum with first, second, third
verdict('two ways to count, one brick', s.stage === 'done' && /two across/.test(s.line) && /the third/.test(s.line), s.line);

// The chalk grid (forty-first session): a pair named across first, swapped and the bottom course answered, (4, 2)
// found and its count drawn, then Hagrid's (2, 3) opens the arch; then the other way: the glowing brick named from the
// chalk, up first, a wrong across, the right one, a wrong up, the right one; the second from the bin and the field.
const across = async n => JSON.parse(await ev(`JSON.stringify(lumosDiagon.across(${n}))`));
const upNum = async k => JSON.parse(await ev(`JSON.stringify(lumosDiagon.upNum(${k}))`));
const one = async p => { await tapAt(p.x, p.y); await sleep(350); return st(); };
await ev('lumosDiagon.choose(2)'); await sleep(500); s = await st(); w = await wall();
const panelTop = await ev('document.getElementById("panel").getBoundingClientRect().top');
verdict('the chalk grid opens across first', s.round === 3 && s.stage === 'cast' && /along the corridor first/.test(s.line) && /\(4, 2\)/.test(s.line), s.line);
verdict('the ground clear of the buttons', w.y + w.below * w.bh <= panelTop, 'ground ' + (w.y + w.below * w.bh).toFixed(1) + ', buttons ' + panelTop.toFixed(1));
await snap();   // 7: the chalk numbers, along the bottom and up the bin's column
s = await three(await mid(2, 4)); await sleep(250); await snap();   // 8: (2, 4), the sneeze
await rest();
verdict('(2, 4) for (4, 2): across first, the other way round', s.last.j.reason === 'swapped' && /across first, then up/.test(s.line) && /other way round/.test(s.line), s.line);
s = await three(await mid(4, 0)); await rest();
verdict('the bottom course: the across numbers', s.last.j.reason === 'below' && /across numbers/.test(s.line), s.line);
s = await three(await mid(4, 2), [400, 400], 1300); await snap();   // 9: (4, 2) quivers, the count across first
verdict('(4, 2) found, the count across first', s.stage === 'shown' && /\(4, 2\)/.test(s.line) && /Along the corridor first/.test(s.line) && s.pair && s.pair.a === 4, s.line);
await sleep(2600); s = await st();
verdict('then Hagrid’s pair', s.stage === 'cast' && s.step === 1 && s.want.a === 2 && s.want.u === 3 && /\(2, 3\)/.test(s.line), s.line);
s = await three(await mid(2, 3), [400, 400], 1600);
verdict('(2, 3) opens the arch', s.stage === 'open', s.line);
await sleep(5800); s = await st(); await snap();   // 10: the wall back, (2, 3) counted across first
verdict('Hagrid says it the other way round', s.stage === 'done' && /three up/.test(s.line) && /other way round/.test(s.line), s.line);
await sleep(2400); s = await st();
verdict('the other way: a brick glows to name', s.stage === 'name' && s.target.a === 3 && s.target.u === 4 && /along the bottom/.test(s.line), s.line);
s = await one(await upNum(4));
verdict('up first: across first', s.last.j.reason === 'up first' && /Along the corridor first/.test(s.line), s.line);
s = await one(await across(2));
verdict('a wrong across: follow its column down', s.last.j.reason === 'across' && /2 along the bottom/.test(s.line), s.line);
s = await one(await across(3)); await sleep(200); await snap();   // 11: (3, ?) over the glowing brick
verdict('the right across: (3, ?)', s.picks.a === 3 && /3 across/.test(s.line), s.line);
s = await one(await upNum(3));
verdict('a wrong up: follow its course across', s.last.j.reason === 'up' && /3 up/.test(s.line), s.line);
s = await one(await upNum(4));
verdict('(3, 4) named', s.stage === 'named' && /\(3, 4\)/.test(s.line), s.line);
await sleep(3000); s = await st();
s = await one(await mid(3, 3));
verdict('the second: not the brick itself', s.target.a === 1 && s.target.u === 5 && s.last.j.reason === 'field', s.line);
s = await one(await across(0));
verdict('the bin is 0 along the bottom', s.last.j.reason === 'across' && /0 along the bottom/.test(s.line), s.line);
await one(await across(1)); s = await one(await upNum(5)); await sleep(1200); await snap();   // 12: (1, 5) named and ringed
verdict('(1, 5) named', s.stage === 'named' && /\(1, 5\)/.test(s.line), s.line);
await sleep(2200); s = await st();
verdict('two numbers, across first, one brick', s.stage === 'done' && /across first/.test(s.line) && /swap them/.test(s.line), s.line);
verdict('the chalk grid has no wall button, its wall straight', (await ev('!document.getElementById("wallKind")')) === true && s.running === false, 'running ' + s.running);

// The real wall (stage d): the button on Hagrid's way, every other course shifted half a brick, the bat counted;
// the swapped brick on a shifted course, Hagrid's brick opens; Harry's third brick zigzags up the wall.
await ev('lumosDiagon.choose(0)'); await sleep(400);
const btn = async () => ev('(document.getElementById("wallKind") || {}).textContent');
const b0 = await btn(); await ev('document.getElementById("wallKind").click()'); await sleep(400); s = await st();
verdict('Wall: straight, then real', b0 === 'Wall: straight' && (await btn()) === 'Wall: real' && s.running === true && s.round === 1 && s.stage === 'cast', b0 + ' to ' + (await btn()));
w = await wall(); const m31 = await mid(3, 1), m32 = await mid(3, 2);
verdict('every other course shifted half a brick', Math.abs((m31.x - m32.x) - w.bw / 2) < 0.5, 'shift ' + (m31.x - m32.x).toFixed(1) + ' of ' + (w.bw / 2).toFixed(1));
s = await three(m32); await rest();
verdict('two up, three across on a shifted course: swapped', s.last.j.reason === 'swapped' && /up first/.test(s.line), s.line);
s = await three(await mid(2, 3), [400, 400], 1600);
verdict('three up, two across on the real wall', s.stage === 'open', s.line);
await sleep(5600); await snap();   // 13: the real wall back, the sum drawn
await ev('lumosDiagon.choose(1)'); await sleep(400); s = await st();
verdict('the real wall stays for Harry’s way', s.running === true && (await btn()) === 'Wall: real', 'running ' + s.running);
await tapAt(...Object.values(await mid(2, 4))); await sleep(600); s = await st(); await snap();   // 14: the third brick zigzags up the real wall
verdict('the third from the left, on a shifted course: it zigzags', s.stage === 'cast' && s.lit && /zigzags/.test(s.line) && /square/.test(s.line), s.line);
s = await three(await mid(2, 3), [400, 400], 1600);
verdict('then three up on the real wall', s.stage === 'open', s.line);

ws.close(); chrome.kill(); if (server) server.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
