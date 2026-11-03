// The hump check (req 163, openHump): node page/charms/checks/hump-check.mjs [WxH], port 8777.
// Drives LumosSpells.openHump on room-spells-test.html and dissendium-test.html through every answer; shots in %TEMP%/lumos-shots.
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
const touch = async (x, y, hold = 80) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await sleep(hold);
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const btnAt = label => ev(`(function(){var b=[].slice.call(document.querySelectorAll('#panel button')).filter(function(x){return x.textContent.indexOf(${JSON.stringify(label)})===0})[0];if(!b)return null;var r=b.getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)];})()`);
const layers = 'document.querySelectorAll("canvas[style*=\\"2147483000\\"]").length';
const results = [];
const verdict = (name, ok, detail) => { results.push((ok ? 'PASS ' : 'FAIL ') + name + ' ' + detail); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const load = async page => {
  await send('Page.navigate', { url: root + page }); await sleep(3000);
  await ev(`(function(){['leviosa','alohomora','aparecium','lumos'].forEach(function(s){LumosSpells.learn(s)});
    window.__clicks=0; document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-spell-exit],#back')) window.__clicks++; }, true);
    window.__answers=[]; var o={castOver:1,openLock:1,revealInk:1,levitate:1,measureSpan:1,openHump:1}; if(window.lumosRoomSpells) lumosRoomSpells.note(true);
    Object.keys(o).forEach(function(k){ var f=LumosSpells[k]; LumosSpells[k]=function(opts){ var a=f(opts); a.done.then(function(r){ window.__answers.push(k+':'+(r&&r.verdict)); }); return a; }; });})()`);
};
const state = () => ev(`JSON.stringify({layers:${layers},clicks:window.__clicks,answers:window.__answers,line:(document.getElementById('line')||{}).textContent})`);


// The hump (req 163): openHump on the room-spells page and on the Dissendium page, every answer, with shots
const shot = async name => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/hump-${name}-${W}x${H}.png`, Buffer.from(s.result.data, 'base64')); };
const hs = () => ev(`JSON.stringify(Object.assign(lumosRoomSpells.hump(),{layers:${layers},answers:window.__answers,last:lumosRoomSpells.state().last,line:document.getElementById('line').textContent}))`);
await load('room-spells-test.html');
await ev(`localStorage.removeItem('lumos.spells.learned.dissendium'); localStorage.removeItem('lumos.spells.cast.dissendium'); lumosRoomSpells.note(false); 1`);
{ const tb = await btnAt("The witch's hump"); await touch(tb[0], tb[1]); await sleep(300);
  const cast = await btnAt('Cast'); await touch(cast[0], cast[1]); await sleep(400);
  const a = JSON.parse(await hs());
  verdict('no note, no offer', a.layers === 0 && /Nothing happens/.test(a.line), JSON.stringify(a));
  await ev('lumosRoomSpells.note(true); 1');
  const cast2 = await btnAt('Cast'); await touch(cast2[0], cast2[1]); await sleep(400);
  const o = JSON.parse(await hs()).offer;
  await touch(Math.round(W * 0.06), Math.round(H * 0.3)); await sleep(200);   // a touch away: nothing
  const away = JSON.parse(await hs());
  await touch(Math.round(o.hump.x), Math.round(o.hump.y)); await sleep(500);   // the book's first tap: nothing
  const t1 = JSON.parse(await hs());
  await shot('card');
  await touch(Math.round(o.hump.x), Math.round(o.hump.y)); await sleep(300);   // again without the word: nothing
  const t2 = JSON.parse(await hs());
  const c = t2.offer.card; await touch(Math.round(c.x + c.w / 2), Math.round(c.y + c.h / 2)); await sleep(900);   // the card says the word
  const w = JSON.parse(await hs());
  await touch(Math.round(o.hump.x), Math.round(o.hump.y)); await sleep(1400);   // the second tap, with the word: it swings
  const mid = JSON.parse(await hs()); await shot('swing');
  await sleep(1700); const stop = JSON.parse(await hs()); await shot('stopped');
  await sleep(3200); const done = JSON.parse(await hs());
  verdict('a touch away costs nothing', away.layers === 1 && away.offer.taps === 0, '');
  verdict('first tap: nothing, the card', t1.offer.taps === 1 && t1.offer.stage === 'tap' && /Nothing happened/.test(t1.line), JSON.stringify(t1.offer.card));
  verdict('second tap without the word: nothing', t2.offer.taps === 2 && t2.offer.stage === 'tap', '');
  verdict('the card says the word', w.offer.said === true && /whisper/.test(w.line), '');
  verdict('it swings by itself', mid.offer.stage === 'swing' && mid.deg > 10 && mid.deg < 44, 'deg ' + mid.deg);
  verdict('it stops at 44, gap 13½ in', stop.offer.stage === 'stopped' && Math.round(stop.deg) === 44 && /44°/.test(stop.line) && /13½ in/.test(stop.line), stop.line);
  verdict('answers opened, first, learned', done.layers === 0 && done.answers.join() === 'openHump:opened' && done.last && done.last.first === true && done.last.gap === 13.5
    && (await ev(`LumosSpells.learned('dissendium')`)) === true, JSON.stringify(done.last));
  // again: not the first time
  await ev(`window.__answers=[]; 1`);
  const sh = await btnAt('Shut it again'); if (sh) { await touch(sh[0], sh[1]); await sleep(200); }
  const cast3 = await btnAt('Cast'); await touch(cast3[0], cast3[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); lumosRoomSpells.tap(); 1`); await sleep(2800 + 3300);
  const again = JSON.parse(await hs());
  verdict('a second open is not the first', again.answers.join() === 'openHump:opened' && again.last.first === false, JSON.stringify(again.last));
  // Step back during the swing
  await ev(`window.__answers=[]; window.__clicks=0; 1`);
  const sh2 = await btnAt('Shut it again'); if (sh2) { await touch(sh2[0], sh2[1]); await sleep(200); }
  const cast4 = await btnAt('Cast'); await touch(cast4[0], cast4[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); lumosRoomSpells.tap(); 1`); await sleep(1000);
  const sb = await btnAt('Step back'); await touch(sb[0], sb[1]); await sleep(500);
  const back = JSON.parse(await hs());
  verdict('step back during the swing', back.layers === 0 && back.answers.join() === 'openHump:cancelled' && back.deg === 0 && /stays shut/.test(back.line), JSON.stringify({ a: back.answers, deg: back.deg }));
}
// The Dissendium page: the same call, then the slide, the dark, Lumos, and the chalk line
await send('Page.navigate', { url: root + 'dissendium-test.html' }); await sleep(2500);
{ const ds = () => ev(`JSON.stringify(Object.assign(lumosDissendium.state(),{layers:${layers},line:document.getElementById('line').textContent}))`);
  await ev('lumosDissendium.tap(); 1'); await sleep(1700);
  const a = JSON.parse(await ds()); await shot('page-word');
  await ev('lumosDissendium.word(); lumosDissendium.tap(); 1'); await sleep(1500); await shot('page-swing');
  await sleep(1600); const b = JSON.parse(await ds()); await shot('page-stopped');
  await sleep(4300); const c = JSON.parse(await ds());
  await ev('lumosDissendium.climb(); 1'); await sleep(3900);
  const d = JSON.parse(await ds());
  const fl = []; for (let i = 0; i <= 10; i++) fl.push({ x: W / 2, y: H * 0.7 - i * H * 0.03, t: i * 20 });
  await ev(`lumosDissendium.flick(${JSON.stringify(fl)}); 1`); await sleep(1300); await shot('page-chalk');
  const e = JSON.parse(await ds());
  verdict('page: first tap, the dropped note, the card', a.taps === 1 && a.layers === 1 && /hurried scrawl.*Dissendium/.test(a.line), a.line);
  verdict('page: stops at 44', b.stage === 'swing' && Math.round(b.lid) === 44 && /13½ in/.test(b.line), JSON.stringify({ stage: b.stage, lid: b.lid }));
  verdict('page: opened, climb offered', c.stage === 'open' && c.layers === 0 && c.learned && /climb in/.test(c.line), c.line);
  verdict('page: slide to the dark', d.stage === 'dark', d.stage);
  verdict('page: Lumos lights the burrow', e.stage === 'lit', e.line);
}
ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
