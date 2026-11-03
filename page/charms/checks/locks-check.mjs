// Req 282's three on the room spells page: node page/charms/checks/locks-check.mjs [WxH], port 8777.
// Drives page/charms/room-spells-test.html?ear=off with real taps and strokes (forty-first session; Magic for the
// boys' B18 to B20). The broom cupboard: locked before Alohomora is learned, the turn the wrong way (tight), the
// right one (it swings open on the broom leaning left), a tap on the broom (it stands up and leans left again). A
// polite door: Alohomora answers 'nothing' and it huffs; the ear's match hears please in a sentence and not in
// another; Say please, with no ear, opens it a hand's width. Percy's parchment: Aparecium's three taps bring up the
// twins' line, a tap on the sheet adds Mr George's, Look away blanks it, Aparecium brings it back. Shots to
// %TEMP%/lumos-shots/locks-<WxH>-<n>.png. LUMOS_PORT and LUMOS_ROOT drive a copy on a spare port.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [W, H] = (process.argv[2] || '1180x820').split('x').map(Number);
const OUT = process.env.TEMP + '/lumos-shots';
mkdirSync(OUT, { recursive: true });
const PORT = Number(process.env.LUMOS_PORT) || 8777, root = `http://localhost:${PORT}/page/charms/`;
const PAGE = 'room-spells-test.html?ear=off';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const up = async u => { try { const r = await fetch(u, { signal: AbortSignal.timeout(1500) }); await r.arrayBuffer(); return r.ok; } catch { return false; } };
let server = null;
if (!(await up(root + 'room-spells-test.html'))) {
  server = spawn('py', ['-m', 'http.server', String(PORT)], { cwd: process.env.LUMOS_ROOT || 'C:/Users/605qu3/Documents/lumos-castle', stdio: 'ignore', windowsHide: true });
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
let shot = 0;
const snap = async () => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/locks-${W}x${H}-${++shot}.png`, Buffer.from(s.result.data, 'base64')); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: root + PAGE }); await sleep(2500);
const J = async e => JSON.parse(await ev(`JSON.stringify(${e})`));
const line = () => ev('lumosRoomSpells.line()');
const touch = async (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
const tapAt = async p => { await touch('touchStart', p.x, p.y); await sleep(40); await touch('touchEnd'); };
// one stroke round the keyhole: from twelve, a quarter turn, dir 1 clockwise or -1
const turn = async (dir) => {
  const k = await J('lumosRoomSpells.keyhole()'), S = Math.min(W, H), r = S * 0.11 * 0.7;
  const at = th => ({ x: k.x + Math.sin(th) * r, y: k.y - Math.cos(th) * r });
  let p = at(0); await touch('touchStart', p.x, p.y);
  for (let i = 1; i <= 16; i++) { await sleep(35); p = at(dir * i / 16 * Math.PI / 2); await touch('touchMove', p.x, p.y); }
  await sleep(40); await touch('touchEnd'); await sleep(500);
};
const cast = async () => { await ev('lumosRoomSpells.cast()'); await sleep(300); };
const lock = async dir => { await cast(); await tapAt(await J('lumosRoomSpells.keyhole()')); await sleep(400); await turn(dir); };
const clickBtn = async label => ev(`(function(){ var b = [].slice.call(document.querySelectorAll('#panel button')).filter(function (x) { return x.textContent === ${JSON.stringify(label)}; })[0]; if (b) b.click(); return !!b; })()`);
const ink = async () => { await cast(); const R = await J('lumosRoomSpells.sheet()'), y = R.y + R.h * 0.5;
  for (const f of [0.25, 0.5, 0.75]) { await tapAt({ x: R.x + R.w * f, y }); await sleep(450); } await sleep(500); };
const idx = async name => ev(`[].slice.call(document.querySelectorAll('#panel button')).map(function (b) { return b.textContent; }).indexOf(${JSON.stringify(name)})`);

// the broom cupboard
await ev(`lumosRoomSpells.choose(${await idx('The broom cupboard')})`); await sleep(300);
await cast(); let L = await line();
verdict('the cupboard, before Alohomora: locked', /rattles\. Locked/.test(L), L);
await ev("LumosSpells.learn('alohomora'); LumosSpells.learn('aparecium')");
await ev(`lumosRoomSpells.choose(${await idx('The broom cupboard')})`); await sleep(300);
await lock(-1); L = await line(); let s = await J('lumosRoomSpells.state()');
verdict('the wrong way round: tight', s.last && s.last.verdict === 'tight' && /Clunk/.test(L) && !!s.last.why, L);
await lock(1); L = await line(); s = await J('lumosRoomSpells.state()');
verdict('a quarter turn, clockwise: it swings open', s.last && s.last.verdict === 'opened' && /broom/.test(L) && (await J('lumosRoomSpells.cupboard()')).target === 1, L);
await sleep(1400); let c = await J('lumosRoomSpells.cupboard()'); await snap();   // 1: open on the buckets, the mop, the broom leaning left
verdict('open, the broom leaning hard left', c.open > 0.9 && c.lean === 1, JSON.stringify(c));
await tapAt(c.broom); await sleep(350); c = await J('lumosRoomSpells.cupboard()'); L = await line();
verdict('a tap stands it up straight', c.lean < 0.3 && /stand the broom up/.test(L), JSON.stringify(c));
await sleep(1200); await snap();   // 2: leaning left again, slowly
await sleep(2600); c = await J('lumosRoomSpells.cupboard()');
verdict('and it leans left again', c.lean === 1, JSON.stringify(c));

// a polite door
await ev(`lumosRoomSpells.choose(${await idx('A polite door')})`); await sleep(300);
await lock(1); L = await line(); s = await J('lumosRoomSpells.state()'); await sleep(200); await snap();   // 3: the huff
verdict('Alohomora on a polite door: the huff', s.last && s.last.verdict === 'nothing' && /Not so much as a please/.test(L), L);
const h1 = await ev("lumosRoomSpells.heard('please open the door')"), h2 = await ev("lumosRoomSpells.heard('open up now')"), h3 = await ev("lumosRoomSpells.heard('pleeze')");
verdict('the ear hears please in a sentence, near enough, and not without it', h1 === true && h3 === true && h2 === false, [h1, h3, h2].join(' '));
verdict('Say please, with no ear: the tap stands for it', (await clickBtn('Say please')) && /hand.s width/.test(await line()), await line());
await sleep(1500); const pd = await J('lumosRoomSpells.polite()'); await snap();   // 4: a hand's width, warm light
verdict('a hand\u2019s width open, light spilling', pd.target === 1 && pd.open > 0.9 && pd.ear === false, JSON.stringify(pd));

// Percy's parchment
await ev(`lumosRoomSpells.choose(${await idx("Percy's parchment")})`); await sleep(300);
await ink(); L = await line(); let pc = await J('lumosRoomSpells.parchment()');
verdict('Aparecium: the twins\u2019 line', pc.lines === 1 && /Tap the parchment/.test(L), L);
await sleep(2200); await snap();   // 5: Mr Fred's line
const R = await J('lumosRoomSpells.sheet()'); await tapAt({ x: R.x + R.w * 0.5, y: R.y + R.h * 0.8 }); await sleep(300); pc = await J('lumosRoomSpells.parchment()');
verdict('a tap on it: Mr George adds his', pc.lines === 2 && /second hand/.test(await line()), JSON.stringify(pc));
await sleep(1700); await snap();   // 6: both lines
verdict('Look away: blank again', (await clickBtn('Look away')) && (await J('lumosRoomSpells.parchment()')).lines === 0 && /blank again/.test(await line()), await line());
await ink(); pc = await J('lumosRoomSpells.parchment()');
verdict('Aparecium again brings it back', pc.lines === 1, JSON.stringify(pc));

ws.close(); chrome.kill(); if (server) server.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length);
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
