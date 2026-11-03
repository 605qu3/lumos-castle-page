// The move check (Mobiliarbus's room callable, moveThing; Q6, Godric, 13 October 2026): node page/charms/checks/move-check.mjs [WxH], port 8777.
// Drives LumosSpells.moveThing on room-spells-test.html's armchair through every answer, a stray tap and a floor mapping;
// then a chair standing up in a room drawn in perspective (req 256): strokes begun on its seat, by real touches; shots in %TEMP%/lumos-shots.
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

process.on('uncaughtException', e => { console.log(results.join(String.fromCharCode(10))); console.log('ERROR ' + e.message); try { chrome.kill(); } catch {} process.exit(1); });
const drag = async (pts, step = 14) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const p of pts.slice(1)) { await sleep(step); await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); }
  await sleep(step); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const seg = (a, b, n = 12) => Array.from({ length: n + 1 }, (_, i) => ({ x: Math.round(a.x + (b.x - a.x) * i / n), y: Math.round(a.y + (b.y - a.y) * i / n) }));
const shot = async name => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/move-${name}-${W}x${H}.png`, Buffer.from(s.result.data, 'base64')); };
const cs = () => ev(`JSON.stringify(Object.assign(lumosRoomSpells.chair(),{layers:${layers},answers:window.__answers,last:lumosRoomSpells.state().last,line:document.getElementById('line').textContent}))`);
const mid = (R, i, j) => ({ x: (i + 0.5) * R.c, y: (j + 0.5) * R.c });

// The armchair on room-spells-test.html: moveThing on a flat floor of squares seen from above
await load('room-spells-test.html');
await ev(`['mobiliarbus'].forEach(function(k){ localStorage.removeItem('lumos.spells.learned.'+k); localStorage.removeItem('lumos.spells.cast.'+k); });
  localStorage.removeItem('lumos.charms.mobiliarbusGuidedHits'); var f=LumosSpells.moveThing; LumosSpells.moveThing=function(o){ var a=f(o); a.done.then(function(r){ window.__answers.push('moveThing:'+(r&&r.verdict)); }); return a; }; 1`);
{ const tb = await btnAt('The armchair'); await touch(tb[0], tb[1]); await sleep(300);
  const cast = await btnAt('Cast'); await touch(cast[0], cast[1]); await sleep(400);
  const a = JSON.parse(await cs());
  verdict('not learned: no offer, it does not budge', a.layers === 0 && /does not budge/.test(a.line), a.line);
  await ev(`LumosSpells.learn('mobiliarbus'); 1`);
  const cast2 = await btnAt('Cast'); await touch(cast2[0], cast2[1]); await sleep(400);
  let R = JSON.parse(await cs()); const st = R.start;
  const p0 = mid(R, st.i, st.j);
  await touch(p0.x, p0.y); await sleep(300);
  const t = JSON.parse(await cs()); await shot('card');
  verdict('the tap: the word\'s card', t.layers === 1 && t.offer.stage === 'word' && /Mo-bi-li-ar-bus/.test(t.line), JSON.stringify(t.offer.card));
  const c = t.offer.card; await touch(Math.round(c.x + c.w / 2), Math.round(c.y + c.h / 2)); await sleep(500);
  const w = JSON.parse(await cs());
  verdict('the card says the word', w.offer.stage === 'slide' && w.offer.said === true && /3 right/.test(w.line), w.offer.stage);
  await sleep(900); await shot('guide');
  await drag(seg(p0, mid(R, st.i + 3, st.j))); await sleep(700);
  const m = JSON.parse(await cs()); await shot('drift');
  await sleep(1900); const d = JSON.parse(await cs()); await shot('moved');
  verdict('a line 3 right: it drifts', m.offer && m.offer.stage === 'moving' && !!m.drift && m.drift.lift > 0, JSON.stringify(m.drift));
  verdict('a line 3 right: moved, right, first, the Sickle', d.layers === 0 && d.answers.join() === 'moveThing:moved' && d.last.dx === 3 && d.last.dy === 0 && d.last.right === true
    && d.last.first === true && d.last.shape === 'line' && d.at.i === st.i + 3 && d.at.j === st.j && /soft thump/.test(d.line) && /Sickle/.test(d.line), JSON.stringify({ last: { dx: d.last.dx, dy: d.last.dy, right: d.last.right, first: d.last.first }, at: d.at, line: d.line }));
  // an L: 2 left, then 2 down
  await ev(`window.__answers=[]; 1`);
  const cast3 = await btnAt('Cast'); await touch(cast3[0], cast3[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); 1`); await sleep(300);
  const a1 = mid(R, st.i + 3, st.j), a2 = mid(R, st.i + 1, st.j), a3 = mid(R, st.i + 1, st.j + 2);
  await drag(seg(a1, a2, 10).concat(seg(a2, a3, 10).slice(1))); await sleep(1500); await shot('L');
  await sleep(1300); const e = JSON.parse(await cs());
  verdict('an L, 2 left and 2 down: moved, not right, not first', e.answers.join() === 'moveThing:moved' && e.last.shape === 'L' && e.last.dx === -2 && e.last.dy === 2 && e.last.right === false
    && e.last.first === false && e.at.i === st.i + 1 && e.at.j === st.j + 2 && /an L/.test(e.line), JSON.stringify({ shape: e.last.shape, dx: e.last.dx, dy: e.last.dy, at: e.at }));
  // a bump on the wall: up past the top row
  await ev(`window.__answers=[]; 1`);
  const cast4 = await btnAt('Cast'); await touch(cast4[0], cast4[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); 1`); await sleep(300);
  const up = st.j + 2 - (R.j0 - 1);
  await drag(seg(a3, mid(R, st.i + 1, R.j0 - 1))); await sleep(350); await shot('bump');
  await sleep(1200); const b = JSON.parse(await cs());
  verdict('a bump on the wall: blocked, lands back', b.answers.join() === 'moveThing:blocked' && b.last.what === 'the wall' && b.last.dy === -up && b.at.i === st.i + 1 && b.at.j === st.j + 2 && /bumps, and lands back/.test(b.line) && /bumps into the wall/.test(b.last.why[0]), JSON.stringify({ what: b.last.what, dy: b.last.dy, at: b.at, line: b.line }));
  // the fireplace in the way
  await ev(`window.__answers=[]; lumosRoomSpells.chair(); 1`);
  const cast5 = await btnAt('Cast'); await touch(cast5[0], cast5[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); 1`); await sleep(300);
  const fp = await ev(`(function(){ var c=lumosRoomSpells.chair(); return [c.fire[0]-c.at.i, c.j0-c.at.j]; })()`);
  const pts5 = seg(a3, mid(R, st.i + 1 + fp[0], st.j + 2)).concat(seg(mid(R, st.i + 1 + fp[0], st.j + 2), mid(R, st.i + 1 + fp[0], st.j + 2 + fp[1])).slice(1));
  await drag(pts5); await sleep(1300); const f = JSON.parse(await cs());
  verdict('the fireplace in the way: blocked', f.answers.join() === 'moveThing:blocked' && f.last.what === 'the fireplace' && f.at.i === st.i + 1, JSON.stringify({ what: f.last.what, dx: f.last.dx, dy: f.last.dy }));
  // a wiggly stroke, away from the guide (along it, the guide forgives a wobble): missed, the consequence shown, its why kept for the test pages (on the kind ease every end snaps to the nearest square, so never between)
  await ev(`window.__answers=[]; 1`);
  const cast6 = await btnAt('Cast'); await touch(cast6[0], cast6[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); 1`); await sleep(300);
  await drag(seg(a3, { x: a3.x - R.c * 2, y: a3.y }).map((p, i) => ({ x: p.x, y: p.y + (i % 2 ? 1 : -1) * Math.round(R.c * 0.45) * (i > 0 && i < 12) }))); await sleep(900); const g = JSON.parse(await cs());
  verdict('a wiggly stroke: missed, its why kept', g.answers.join() === 'moveThing:missed' && g.last.judge.reason === 'wiggly' && /shivers/.test(g.line) && /wobbles/.test(g.last.why.join(' ')) && g.at.i === st.i + 1, g.line);
  // Step back mid-drift: it lands at once, moved
  await ev(`window.__answers=[]; 1`);
  const cast7 = await btnAt('Cast'); await touch(cast7[0], cast7[1]); await sleep(300);
  await ev(`lumosRoomSpells.tap(); lumosRoomSpells.word(); 1`); await sleep(300);
  await ev(`lumosRoomSpells.judge(${JSON.stringify(seg(a3, mid(R, st.i + 3, st.j + 2)).map((p, i) => ({ x: p.x, y: p.y, t: i * 20 })))}); 1`); await sleep(500);
  const sb = await btnAt('Step back'); await touch(sb[0], sb[1]); await sleep(400);
  const h = JSON.parse(await cs());
  verdict('step back mid-drift: it lands at once', h.layers === 0 && h.answers.join() === 'moveThing:moved' && h.at.i === st.i + 3 && h.at.j === st.j + 2 && !h.drift, JSON.stringify({ answers: h.answers, at: h.at }));
  // Put it back
  const pb = await btnAt('Put it back'); if (pb) { await touch(pb[0], pb[1]); await sleep(300); }
  const k = JSON.parse(await cs());
  verdict('put it back', !!pb && k.at.i === st.i && k.at.j === st.j, JSON.stringify(k.at));
}
// A stray tap (req 230): off the piece while it waits, once; the tap on the piece and on the card never
{ await ev(`window.__answers=[]; window.__stray=[]; window.__a=LumosSpells.moveThing({at:{x:300,y:330},stray:function(x,y){window.__stray.push([Math.round(x),Math.round(y)])}}); 1`); await sleep(400);
  await touch(300, 330); await sleep(300);
  const s1 = JSON.parse(await ev(`JSON.stringify({stray:window.__stray,st:window.__a.state()})`));
  const cd = s1.st.card; await touch(Math.round(cd.x + cd.w / 2), Math.round(cd.y + cd.h / 2)); await sleep(300);
  const s2 = JSON.parse(await ev(`JSON.stringify({stray:window.__stray,st:window.__a.state()})`));
  await touch(Math.round(W * 0.9), Math.round(H * 0.85)); await sleep(300);
  const s3 = JSON.parse(await ev(`JSON.stringify({stray:window.__stray,st:window.__a.state(),layers:${layers}})`));
  await ev('window.__a.cancel(); 1'); await sleep(300);
  verdict('stray: none for the tap and the card, one away', s1.stray.length === 0 && s1.st.stage === 'word' && s2.stray.length === 0 && s2.st.stage === 'slide'
    && s3.stray.length === 1 && s3.layers === 1 && s3.st.stage === 'slide', JSON.stringify({ s1: s1.stray, s2: s2.stray, s3: s3.stray }));
}
// A room in perspective passes its own floor: a slanted floor, the word left out
{ const fl = '{toScreen:function(q){return {x:100+q.x*50+q.y*20,y:120+q.y*40}},toSquares:function(p){var y=(p.y-120)/40;return {x:(p.x-100-y*20)/50,y:y}}}';
  const toS = q => ({ x: 100 + q.x * 50 + q.y * 20, y: 120 + q.y * 40 });
  const A = toS({ x: 2.5, y: 2.5 }), B = toS({ x: 2.5, y: 4.5 }), C = toS({ x: 4.5, y: 2.5 });
  await ev(`window.__answers=[]; window.__a=LumosSpells.moveThing({at:${JSON.stringify(A)},floor:${fl},word:false}); 1`); await sleep(300);
  const o1 = await ev(`JSON.stringify(window.__a.judge(${JSON.stringify(seg(A, B).map((p, i) => ({ x: p.x, y: p.y, t: i * 20 })))}))`);
  await sleep(2300);
  const r1 = JSON.parse(o1), ans1 = JSON.parse(await ev('JSON.stringify(window.__answers)'));
  await ev(`window.__answers=[]; window.__a=LumosSpells.moveThing({at:${JSON.stringify(A)},floor:${fl},word:false}); 1`); await sleep(300);
  const r2 = JSON.parse(await ev(`JSON.stringify(window.__a.judge(${JSON.stringify(seg(A, C).map((p, i) => ({ x: p.x, y: p.y, t: i * 20 })))}))`));
  await sleep(2300);
  verdict('a floor mapping: the slant down is 2 down, across is 2 right', r1.verdict === 'moved' && r1.dx === 0 && r1.dy === 2 && ans1.join() === 'moveThing:moved'
    && r2.verdict === 'moved' && r2.dx === 2 && r2.dy === 0, JSON.stringify({ r1: [r1.verdict, r1.dx, r1.dy], r2: [r2.verdict, r2.dx, r2.dy] }));
  const st = JSON.parse(await ev(`(function(){ var a=LumosSpells.moveThing({at:{x:300,y:300},word:false}); a.tap(); var s=a.state(); a.cancel(); return JSON.stringify(s); })()`));
  verdict('word: false goes straight to the stroke', st.stage === 'slide' && st.said === false, st.stage);
}
// A chair standing up in a room drawn in perspective (req 256, the Common room): the eye 1.25 m up looking level, the
// chair's square 3.6 m off, squares 1.05 m, the chair 0.9 m wide and 0.9 m high; strokes begun on its seat by real touches
{ const room = `(function(){ var W=innerWidth,H=innerHeight,f=Math.min(W,H)/(2*Math.tan(Math.PI/6)),y0=H*0.3,eye=1.25,Z0=3.6,SQ=1.05,X0=-1.05;
    function scr(X,Y,Z){ return {x:W/2+f*X/Z,y:y0+f*(eye-Y)/Z}; }
    var lo=scr(X0-0.45,0,Z0), hi=scr(X0+0.45,0.9,Z0);
    window.__room={ scr:scr, foot:scr(X0,0,Z0), seat:scr(X0+0.1,0.45,Z0), at:function(dx,dy,Y){ return scr(X0+dx*SQ+(Y?0.1:0),Y||0,Z0-dy*SQ); },
      on:function(p){ return p.x>=lo.x&&p.x<=hi.x&&p.y>=hi.y&&p.y<=lo.y; },
      floor:{ toSquares:function(p){ var Z=p.y>y0+1?Math.min(60,f*eye/(p.y-y0)):60; return {x:((p.x-W/2)*Z/f-X0)/SQ,y:(Z0-Z)/SQ}; },
              toScreen:function(q){ return scr(X0+q.x*SQ,0,Z0-q.y*SQ); } } };
    return 1; })()`;
  await ev(room);
  const P = async e => JSON.parse(await ev(`JSON.stringify(${e})`));
  const R = await P('{foot:__room.foot,seat:__room.seat,a21:__room.at(2,1),a20h:__room.at(2,0,0.45),a11:__room.at(1,1),beside:__room.at(1.5,0),seatL:__room.scr(-1.35,0.45,3.6),b16:__room.at(1.5,1.6)}');
  const offer = async withHit => { await ev(`window.__ans4=[]; window.__a=LumosSpells.moveThing({at:__room.foot,floor:__room.floor,word:false${withHit ? ',onPiece:__room.on' : ''}}); window.__a.tap(); window.__a.done.then(function(r){ window.__ans4.push(r); }); 1`); await sleep(300); };
  const answer = async () => { await sleep(2800); const a = await P('window.__ans4'); return a[0] || {}; };
  const rd = p => ({ x: Math.round(p.x), y: Math.round(p.y) });
  // a line from the seat to 2 right and 1 down (toward him): moved 2, 1
  await offer(true); await drag(seg(rd(R.seat), rd(R.a21)));
  const r1 = await answer();
  verdict('req 256: a line begun on the seat, to 2 right and 1 down: moved 2, 1', r1.verdict === 'moved' && r1.dx === 2 && r1.dy === 1 && r1.shape === 'line', JSON.stringify([r1.verdict, r1.dx, r1.dy, r1.shape, r1.judge && r1.judge.pinned]));
  // an L from the seat: across at the seat's height, then down to the floor 2 right and 1 down
  await offer(true); await drag(seg(rd(R.seat), rd(R.a20h), 10).concat(seg(rd(R.a20h), rd(R.a21), 10).slice(1))); await shot('seat-L');
  const r2 = await answer();
  verdict('req 256: an L begun on the seat, across at its height then down: moved 2, 1, an L', r2.verdict === 'moved' && r2.dx === 2 && r2.dy === 1 && r2.shape === 'L', JSON.stringify([r2.verdict, r2.dx, r2.dy, r2.shape, r2.judge && r2.judge.pinned]));
  // without the room's hit: the seat within a reach above the foot still counts (a piece in a room stands up)
  await offer(false); const reach = await P('window.__a.state().reach');
  const near = { x: R.foot.x, y: R.foot.y - reach * 1.5 };
  await drag(seg(rd(near), rd(R.a11)));
  const r3 = await answer();
  verdict('req 256: no hit passed, a start a reach and a half above the foot: moved 1, 1', r3.verdict === 'moved' && r3.dx === 1 && r3.dy === 1, JSON.stringify([r3.verdict, r3.dx, r3.dy, Math.round(reach)]));
  // a little drag kept on the seat: it lifts and lands where it was, never read as the floor behind it
  await offer(true); 
  await drag(seg(rd(R.seat), rd(R.seatL), 8));
  const r4 = await answer();
  verdict('req 256: a little drag kept on the seat: missed, short, lands where it was', r4.verdict === 'missed' && r4.judge.reason === 'short' && r4.judge.pinned === 'drag' && /where it was/.test(r4.why[0]), JSON.stringify([r4.verdict, r4.judge && r4.judge.reason, r4.judge && r4.judge.pinned]));
  // begun beside the chair on the floor: off, it stays put
  await offer(true); await drag(seg(rd(R.beside), rd(R.b16)));
  const r5 = await answer();
  verdict('req 256: a start beside the chair: missed, off, it stays put', r5.verdict === 'missed' && r5.judge.reason === 'off' && /stays put/.test(r5.why[0]), JSON.stringify([r5.verdict, r5.judge && r5.judge.reason]));
}
ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(results.join('\n'));
console.log(results.filter(r => r.startsWith('PASS')).length + ' of ' + results.length + ' as meant');
console.log(problems.length ? 'console: ' + problems.join(' | ') : 'console: clean');
