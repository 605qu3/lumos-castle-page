// The spellbook render: node page/charms/checks/spellbook-render.mjs <entry id> [WxH]
// Opens docs/charms/spellbook.html from file:// in headless Chrome, scrolls the entry into view, reports the console
// and shoots the entry to %TEMP%/lumos-shots/spellbook-<id>.png (the whole entry, its drawing and picture).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const entry = process.argv[2] || 'lumos';
const [W, H] = (process.argv[3] || '1180x820').split('x').map(Number);
const OUT = process.env.TEMP + '/lumos-shots';
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'lumos-chrome-spellbook-'));
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, `--window-size=${W},${H}`, '--hide-scrollbars', '--mute-audio', '--allow-file-access-from-files',
  'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
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
try {
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Page.navigate', { url: 'file:///C:/Users/605qu3/Documents/lumos-castle/docs/charms/spellbook.html' });
  await sleep(2500);
  await ev(`(() => { const s = document.getElementById(${JSON.stringify(entry)}); if (s) s.scrollIntoView(); })()`);
  await sleep(1200);   /* the entry's picture loads once scrolled to */
  const box = await ev(`(() => { const s = document.getElementById(${JSON.stringify(entry)}); if (!s) return null;
    const r = s.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height,
    imgs: [...s.querySelectorAll('img')].map(i => i.naturalWidth + 'x' + i.naturalHeight), svgs: s.querySelectorAll('svg').length,
    updated: (document.body.innerText.match(/Updated[^\\n]*/) || [''])[0] }; })()`);
  console.log('entry:', JSON.stringify(box));
  if (box) {
    await sleep(800);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: box.w, height: Math.min(box.h, 3000), scale: 1 } });
    const file = `${OUT}/spellbook-${entry}.png`;
    writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
    console.log('shot:', file);
  }
  console.log(problems.length ? 'console:\n  ' + problems.join('\n  ') : 'console: clean');
} finally {
  ws.close(); chrome.kill(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
