/* The castle's one sound player, the same file on every page (board req 518; the Great Hall's *Sound, for every
   room*, 2 to 4 and 7, Godric's 1 on greathall-sound-plan-1015, 15 October 2026).

   What it plays, all from the chains: a room's bed (the cue strings its room rules show now, handed in at every
   drawRoom, each with a looping sound held while its cue holds) and a heard line (a record's line with `medium:
   heard` and its `sound`, handed in from showLines, played once). Interaction's tap answers (req 519) may come later
   through `once`. One table, `page/sounds/index.json`, gives each sound by a cue's opening words:
     { "sounds": [ { "cue": "the feast's roar", "file": "great-hall/feast-roar.mp3", "play": "loop", "level": 0.6 } ] }
   `play` is loop (a bed) or once; `level` 0 to 1 under the player's caps. A cue matches the entry whose `cue` is the
   longest start of its words (case and curly quotes aside); a cue with none stays silent and is noted.

   Quiet until a tap: Safari opens sound only inside a tap, so nothing plays before the page's first tap (the
   player listens for it itself, and a page may call `CastleSound.wake()` from its own). Then the bed fades in over
   two seconds; a change fades across in a second and a half, never cut. Beds sit low (BED_CAP); a once sound rises
   over them, capped (ONCE_CAP), so a feast's roar or a Howler startles and amuses, never hurts a young ear. A heard
   line before the first tap is dropped and noted, as it cannot sound.

   The page's part, nothing else in a room:
     CastleSound.bed(cues)        at every drawRoom, with the cues it was handed
     CastleSound.lines(list)      from showLines, with the list it was handed
     CastleSound.mute(on)         the frame's one mute (Interaction's to place, req 519); kept on this iPad
   `?sound=log` writes what plays or would play, and each cue without a sound, to the console with "[sound]" and to
   `CastleSound.log()`, so a state's sound is checked by its link; `?sound=off` keeps the page silent. */
(function (root) {
  'use strict';
  var BED_CAP = 0.35, ONCE_CAP = 0.7, FIRST_FADE = 2.0, FADE = 1.5, MUTE_FADE = 0.3, MUTE_KEY = 'castle-sound-muted';
  var script = root.document && root.document.currentScript;
  var BASE = script && script.src ? script.src.replace(/[^\/]*$/, '') + 'sounds/' : 'sounds/';
  var query = (root.location && root.location.search) || '';
  var LOG = /[?&]sound=log\b/.test(query), OFF = /[?&]sound=off\b/.test(query);

  var table = null, tableWait = [], ctx = null, master = null, awake = false;
  var wanted = [], playing = {}, buffers = {}, logged = [], muted = false;
  try { muted = root.localStorage && root.localStorage.getItem(MUTE_KEY) === 'yes'; } catch (e) { muted = false; }

  var noted = {};
  function say(s) {
    if (/^no sound: /.test(s)) { if (noted[s]) return; noted[s] = true; }   /* each silent cue noted once a page */
    logged.push(s); if (logged.length > 400) logged.shift();
    if (LOG && root.console) root.console.log('[sound] ' + s);
  }
  function plain(s) { return String(s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim(); }
  function find(words) {
    var w = plain(words), best = null;
    (table || []).forEach(function (t) {
      var c = plain(t.cue);
      if (c && w.indexOf(c) === 0 && (!best || c.length > plain(best.cue).length)) best = t;
    });
    return best;
  }
  function withTable(fn) { if (table) fn(); else tableWait.push(fn); }

  (function loadTable() {
    if (!root.fetch) { table = []; return; }
    root.fetch(BASE + 'index.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : { sounds: [] }; })
      .catch(function () { return { sounds: [] }; })
      .then(function (d) {
        table = (d && d.sounds) || [];
        var w = tableWait; tableWait = [];
        w.forEach(function (fn) { fn(); });
      });
  })();

  function load(t) {
    if (buffers[t.file]) return buffers[t.file];
    buffers[t.file] = root.fetch(BASE + t.file)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (a) { return new Promise(function (ok, no) { ctx.decodeAudioData(a, ok, no); }); })
      .catch(function () { say('could not load ' + t.file); return null; });
    return buffers[t.file];
  }
  function ramp(g, to, secs) {
    var now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(to, now + secs);
  }

  /* the bed: start what is wanted and not playing, fade out what is playing and no longer wanted */
  function settle(fade) {
    if (!awake || !ctx) return;
    var keep = {};
    wanted.forEach(function (t) {
      keep[t.file] = true;
      if (playing[t.file]) { ramp(playing[t.file].gain, BED_CAP * level(t), fade); return; }
      var p = playing[t.file] = { gain: ctx.createGain(), src: null, gone: false };
      p.gain.gain.value = 0;
      p.gain.connect(master);
      load(t).then(function (buf) {
        if (!buf || p.gone) return;
        p.src = ctx.createBufferSource();
        p.src.buffer = buf; p.src.loop = true;
        p.src.connect(p.gain); p.src.start();
        ramp(p.gain, BED_CAP * level(t), fade);
      });
    });
    Object.keys(playing).forEach(function (f) {
      if (keep[f]) return;
      var p = playing[f]; delete playing[f]; p.gone = true;
      ramp(p.gain, 0, FADE);
      root.setTimeout(function () { try { if (p.src) p.src.stop(); p.gain.disconnect(); } catch (e) {} }, FADE * 1000 + 100);
    });
  }
  function level(t) { var v = Number(t.level); return isFinite(v) ? Math.max(0, Math.min(1, v)) : 1; }

  function bed(cues) {
    withTable(function () {
      var next = [], seen = {};
      (cues || []).forEach(function (c) {
        var t = find(c);
        if (!t) { say('no sound: ' + c); return; }
        if (t.play === 'once') return;   /* a once sound is a heard line's or a tap's, never a bed's */
        if (seen[t.file]) return;
        seen[t.file] = true; next.push(t);
        say('bed: ' + c + ' -> ' + t.file);
      });
      wanted = next;
      settle(FADE);
    });
  }

  function once(words) {
    withTable(function () {
      var t = find(words);
      if (!t) { say('no sound: ' + words); return; }
      if (!awake || !ctx) { say('before the first tap, not played: ' + words); return; }
      say('once: ' + words + ' -> ' + t.file);
      load(t).then(function (buf) {
        if (!buf) return;
        var g = ctx.createGain(), s = ctx.createBufferSource();
        g.gain.value = ONCE_CAP * level(t);
        s.buffer = buf; s.connect(g); g.connect(master); s.start();
        s.onended = function () { try { g.disconnect(); } catch (e) {} };
      });
    });
  }

  function lines(list) {
    (list || []).forEach(function (l) { if (l && l.medium === 'heard' && l.sound && !l.held) once(l.sound); });
  }

  /* the first tap: make or resume the context inside it, unlock with a moment of silence, fade the bed in */
  function wake() {
    if (awake || OFF) return;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) { say('no sound on this device'); return; }
    try {
      ctx = ctx || new AC();
      master = master || ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
      if (ctx.resume) ctx.resume();
      var b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); s.start(0);
    } catch (e) { say('the sound would not wake'); return; }
    awake = true;
    say('awake');
    settle(FIRST_FADE);
  }
  function onTap() {
    if (awake) return;
    wake();
    if (awake && root.document) ['touchend', 'pointerup', 'click'].forEach(function (k) { root.document.removeEventListener(k, onTap, true); });
  }
  if (root.document && root.document.addEventListener) {
    ['touchend', 'pointerup', 'click'].forEach(function (k) { root.document.addEventListener(k, onTap, true); });
    root.document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (root.document.hidden) { if (ctx.suspend) ctx.suspend(); } else if (ctx.resume) ctx.resume();
    });
  }

  function mute(on) {
    muted = !!on;
    try { if (root.localStorage) root.localStorage.setItem(MUTE_KEY, muted ? 'yes' : 'no'); } catch (e) {}
    if (master && ctx) ramp(master, muted ? 0 : 1, MUTE_FADE);
    say(muted ? 'muted' : 'unmuted');
  }

  root.CastleSound = {
    bed: bed, lines: lines, once: once, wake: wake, mute: mute,
    muted: function () { return muted; },
    awake: function () { return awake; },
    log: function () { return logged.slice(); },
    playing: function () { return Object.keys(playing); }
  };
})(typeof window !== 'undefined' ? window : this);
