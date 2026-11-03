// The ways-out check (G2, Interaction's vocabulary §5 §9): node page/charms/checks/exits-check.mjs [WxH], port 8777.
// Charms G2 check, port 8777: a finger on Step back, or on a room's #back, ends every spell's offer.
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
    window.__answers=[]; var o={castOver:1,openLock:1,revealInk:1,levitate:1,measureSpan:1,openHump:1,moveThing:1}; if(window.lumosRoomSpells) lumosRoomSpells.note(true);
    Object.keys(o).forEach(function(k){ var f=LumosSpells[k]; LumosSpells[k]=function(opts){ var a=f(opts); a.done.then(function(r){ window.__answers.push(k+':'+(r&&r.verdict)); }); return a; }; });})()`);
};
const state = () => ev(`JSON.stringify({layers:${layers},clicks:window.__clicks,answers:window.__answers,line:(document.getElementById('line')||{}).textContent})`);

// 1. Step back on the room-spells page, for each thing
await load('room-spells-test.html');
for (const thing of ["Percy's drawer", 'The brass', "Wood's notice", 'A feather', 'A wand', 'Your hand', "The witch's hump"]) {
  await ev(`window.__clicks=0; window.__answers=[]`);
  const tb = await btnAt(thing); await touch(tb[0], tb[1]); await sleep(300);
  const cast = await btnAt('Cast'); await touch(cast[0], cast[1]); await sleep(600);
  const before = JSON.parse(await state());
  const sb = await btnAt('Step back'); await touch(sb[0], sb[1]); await sleep(600);
  const after = JSON.parse(await state());
  verdict('step back: ' + thing, before.layers === 1 && after.layers === 0 && after.clicks === 1 && after.answers.join() .includes('cancelled'), JSON.stringify({ before: before.layers, after }));
}
// 2. The feather floating: Step back puts it down
await ev(`window.__clicks=0; window.__answers=[]`);
{ const tb = await btnAt('A feather'); await touch(tb[0], tb[1]); await sleep(300);
  const cast = await btnAt('Cast'); await touch(cast[0], cast[1]); await sleep(500);
  await ev(`(function(){var a=lumosRoomSpells&&lumosRoomSpells.cur; return 1})()`);
  // a drawn swish and flick through the layer
  const pts = [];
  const G = 0.6 * Math.min(W, H), ox = W / 2 - G / 2, oy = H * 0.3, P = (x, y) => [ox + x * G, oy + y * G];
  for (let i = 0; i <= 24; i++) { const k = i / 24, x = 2 * (1 - k) * k * 0.08 + k * k * 0.8, y = 2 * (1 - k) * k * 0.75 + k * k * 0.55; pts.push(P(x, y)); }
  for (let i = 1; i <= 6; i++) { const k = i / 6; pts.push(P(0.8 + 0.15 * k, 0.55 - 0.7 * k)); }
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] });
  for (const p of pts.slice(1)) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p[0], y: p[1] }] }); await sleep(12); }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(2200);
  const mid = JSON.parse(await state());
  const sb = await btnAt('Step back'); if (sb) { await touch(sb[0], sb[1]); await sleep(700); }
  const after = JSON.parse(await state());
  verdict('feather floating, step back', after.layers === 0 && after.clicks === 1, JSON.stringify({ mid: { layers: mid.layers, answers: mid.answers, line: mid.line }, after }));
}
// 3. A room's #back, bottom right, as the frame draws it
await load('room-spells-test.html');
await ev(`(function(){var b=document.createElement('button');b.id='back';b.textContent='Back';b.style.cssText='position:fixed;right:16px;bottom:16px;width:124px;height:60px;z-index:20';b.onclick=function(){window.__back=(window.__back||0)+1};document.body.appendChild(b);})()`);
for (const [name, call] of [
  ['openLock', 'LumosSpells.openLock({at:{x:300,y:300}})'],
  ['revealInk', 'LumosSpells.revealInk({sheet:{x:200,y:200,w:200,h:260}})'],
  ['levitate', 'LumosSpells.levitate({at:{x:300,y:400}})'],
  ['measureSpan', 'LumosSpells.measureSpan({at:{x:300,y:400}})'],
  ['castOver', 'LumosSpells.castOver({at:{x:300,y:300}})'],
  ['openHump', 'LumosSpells.openHump({hump:{x:300,y:300}})'],
  ['moveThing', 'LumosSpells.moveThing({at:{x:300,y:300}})']]) {
  await ev(`window.__back=0; window.__answers=[]; window.__stray=[]; window.__a=${call.replace('})', ',stray:function(x,y){window.__stray.push([x,y])}})')}; 1`); await sleep(400);
  const b = await ev(`(function(){var r=document.getElementById('back').getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)]})()`);
  const top = await ev(`(function(){var e=document.elementFromPoint(${b[0]},${b[1]});return e.tagName})()`);
  await touch(b[0], b[1]); await sleep(500);
  const after = JSON.parse(await ev(`JSON.stringify({layers:${layers},back:window.__back,answers:window.__answers,stray:window.__stray.length})`));
  verdict('#back over ' + name, top === 'CANVAS' && after.layers === 0 && after.back === 1 && after.answers.join() === name + ':cancelled' && after.stray === 0, JSON.stringify({ top, after }));
}
// 4. A touch elsewhere still goes to the spell (no leak): a tap away from the lock costs nothing
await ev(`window.__answers=[]; window.__a=LumosSpells.openLock({at:{x:300,y:300}}); 1`); await sleep(300);
await touch(100, 100); await sleep(400);
verdict('tap elsewhere keeps the offer', JSON.parse(await ev(`JSON.stringify(${layers})`)) === 1, '');
await ev('window.__a.cancel()'); await sleep(200);
// 5. The quiet wait
for (const [name, call] of [['openLock', 'LumosSpells.openLock({at:{x:300,y:300},wait:1})'], ['castOver', 'LumosSpells.castOver({at:{x:300,y:300},wait:1})'], ['levitate', 'LumosSpells.levitate({at:{x:300,y:400},wait:1})'], ['openHump', 'LumosSpells.openHump({hump:{x:300,y:300},wait:1})'], ['moveThing', 'LumosSpells.moveThing({at:{x:300,y:300},wait:1})']]) {
  await ev(`window.__answers=[]; window.__a=${call}; 1`); await sleep(1800);
  const after = JSON.parse(await ev(`JSON.stringify({layers:${layers},answers:window.__answers})`));
  verdict('wait 1 s, ' + name, after.layers === 0 && after.answers.join() === name + ':cancelled', JSON.stringify(after));
}
// 6. Stand up on the cast-over page
await load('cast-over-test.html');
{ const sit = await btnAt('Sit at the desk'); await touch(sit[0], sit[1]); await sleep(2500);
  const before = JSON.parse(await state());
  const su = await btnAt('Stand up');
  if (su) { await touch(su[0], su[1]); await sleep(600); }
  const after = JSON.parse(await state());
  verdict('stand up over castOver', !!su && before.layers === 1 && after.layers === 0 && after.clicks === 1, JSON.stringify({ before: before.layers, after }));
}
// 7. A stray tap while an offer waits (req 230, Godric's Q4): stray(x, y) once, the offer still up, nothing answered
await load('room-spells-test.html');
const hook = 'stray:function(x,y){window.__stray.push([Math.round(x),Math.round(y)])}';
const strayState = () => ev(`JSON.stringify({layers:${layers},answers:window.__answers,stray:window.__stray})`);
for (const [name, call] of [
  ['openLock', `LumosSpells.openLock({at:{x:300,y:300},${hook}})`],
  ['revealInk', `LumosSpells.revealInk({sheet:{x:200,y:200,w:200,h:260},${hook}})`],
  ['levitate', `LumosSpells.levitate({at:{x:300,y:400},${hook}})`],
  ['measureSpan', `LumosSpells.measureSpan({ends:[{x:200,y:420},{x:330,y:420}],${hook}})`],
  ['castOver', `LumosSpells.castOver({at:{x:300,y:300},${hook}})`],
  ['openHump', `LumosSpells.openHump({hump:{x:300,y:300},${hook}})`],
  ['moveThing', `LumosSpells.moveThing({at:{x:300,y:300},${hook}})`]]) {
  await ev(`window.__answers=[]; window.__stray=[]; window.__a=${call}; 1`); await sleep(400);
  await touch(100, 100); await sleep(400);
  const after = JSON.parse(await strayState());
  verdict('stray tap, ' + name, after.layers === 1 && after.answers.length === 0 && after.stray.join() === '100,100', JSON.stringify(after));
  await ev('window.__a.cancel()'); await sleep(200);
}
// a drag off the lock, two fingers off it, a tap on the lock, and the tape with no ends: none of them stray
{ await ev(`window.__answers=[]; window.__stray=[]; window.__a=LumosSpells.openLock({at:{x:300,y:300},${hook}}); 1`); await sleep(400);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 100, y: 100 }] });
  for (let i = 1; i <= 6; i++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 100, y: 100 + i * 8 }] }); await sleep(16); }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300);
  const drag = JSON.parse(await strayState());
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 100, y: 100 }, { x: 140, y: 100 }] }); await sleep(80);
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300);
  const two = JSON.parse(await strayState());
  await touch(300, 300); await sleep(300);
  const on = JSON.parse(await strayState());
  verdict('no stray: a drag, two fingers, the lock itself', drag.stray.length === 0 && two.stray.length === 0 && on.stray.length === 0 && on.layers === 1, JSON.stringify({ drag, two, on }));
  await ev('window.__a.cancel()'); await sleep(200);
  await ev(`window.__answers=[]; window.__stray=[]; window.__a=LumosSpells.measureSpan({at:{x:300,y:400},${hook}}); 1`); await sleep(400);
  await touch(100, 100); await sleep(300);
  const span = JSON.parse(await strayState());
  verdict('no stray: the tape with no ends takes the tap as an end', span.stray.length === 0 && span.layers === 1, JSON.stringify(span));
  await ev('window.__a.cancel()'); await sleep(200);
}
const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/g2-${W}x${H}.png`, Buffer.from(s.result.data, 'base64'));
ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
