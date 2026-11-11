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
   Behind `?sound=log` only (Events' req 2467; nothing sounds yet, no file exists): the castle's sound day. The table
   `page/sounds/mix.json` (tools/sound-mix.py, from Magic's schedules) gives each room and period its beds with a band
   each, the weather layer, the neighbours' leaks through doorways, and its spots:
     CastleSound.mix(room, period, o)   o = { weather: 'rain'|'clear'.., windy: bool }; beds and leaks at their bands'
                                        gain (hush .06, low .12, mid .22, full .35), the old bed down to its leak over
                                        1.5 s and out after 3 s, the new up over 2 s, and the room's spots started
     CastleSound.walking(on)            spots are held while a boy walks and come when he stands
     CastleSound.periodAt(h, m, dawn)   the nine periods from the clock, pure
   `?sound=log` writes what plays or would play, and each cue without a sound, to the console with "[sound]" and to
   `CastleSound.log()`, so a state's sound is checked by its link; `?sound=off` keeps the page silent. */
(function (root) {
  'use strict';
  var BED_CAP = 0.35, ONCE_CAP = 0.7, FIRST_FADE = 2.0, FADE = 1.5, OUT_FADE = 3.0, MUTE_FADE = 0.3, MUTE_KEY = 'castle-sound-muted';
  var BANDS = ['silent', 'hush', 'low', 'mid', 'full'];
  var BAND_BED = { hush: 0.06, low: 0.12, mid: 0.22, full: 0.35 }, BAND_SPOT = { hush: 0.15, low: 0.30, mid: 0.50, full: 0.70 };
  var SPOT_GAP = [45, 75];   /* seconds between spots: about one a minute, never regular (sound-day.md) */
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
  var lastVariant = {}, pinned = {};
  /* an entry with `variants` plays one of them: a once never the one it played last; a bed keeps the one it first drew */
  function pick(t, isOnce) {
    var v = t.variants;
    if (!v || v.length < 2) return t;
    var f;
    if (!isOnce && pinned[t.cue]) f = pinned[t.cue];
    else {
      var pool = v.filter(function (x) { return x !== lastVariant[t.cue]; });
      f = pool[Math.floor(Math.random() * pool.length)];
      lastVariant[t.cue] = f;
      if (!isOnce) pinned[t.cue] = f;
    }
    var c = {}; Object.keys(t).forEach(function (k) { c[k] = t[k]; });
    c.file = f;
    return c;
  }
  function find(words, isOnce) {
    var w = plain(words), best = null;
    (table || []).forEach(function (t) {
      var c = plain(t.cue);
      if (c && w.indexOf(c) === 0 && (!best || c.length > plain(best.cue).length)) best = t;
    });
    return best ? pick(best, !!isOnce) : null;
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
  function settle(fade, outFade) {
    if (!awake || !ctx) return;
    var keep = {};
    wanted.forEach(function (t) {
      keep[t.file] = true;
      if (playing[t.file]) { ramp(playing[t.file].gain, cap(t) * level(t), fade); return; }
      var p = playing[t.file] = { gain: ctx.createGain(), src: null, gone: false };
      p.gain.gain.value = 0;
      p.gain.connect(master);
      load(t).then(function (buf) {
        if (!buf || p.gone) return;
        p.src = ctx.createBufferSource();
        p.src.buffer = buf; p.src.loop = true;
        p.src.connect(p.gain); p.src.start();
        ramp(p.gain, cap(t) * level(t), fade);
      });
    });
    Object.keys(playing).forEach(function (f) {
      if (keep[f]) return;
      var p = playing[f]; delete playing[f]; p.gone = true;
      var out = outFade || FADE;
      ramp(p.gain, 0, out);
      root.setTimeout(function () { try { if (p.src) p.src.stop(); p.gain.disconnect(); } catch (e) {} }, out * 1000 + 100);
    });
  }
  function cap(t) { return t.gain != null ? t.gain : BED_CAP; }   /* a mixed entry carries its band's gain; a plain bed the cap */
  function level(t) { var v = Number(t.level); return isFinite(v) ? Math.max(0, Math.min(1, v)) : 1; }

  /* `g`, optional, 0 to 1: this call's own gain under the bed cap, so a room with three beds can sit each lower */
  function bed(cues, g) {
    withTable(function () {
      var next = [], seen = {};
      (cues || []).forEach(function (c) {
        var t = find(c);
        if (!t) { say('no sound: ' + c); return; }
        if (t.play === 'once') return;   /* a once sound is a heard line's or a tap's, never a bed's */
        if (seen[t.file]) return;
        seen[t.file] = true;
        if (isFinite(Number(g)) && g !== null && g !== undefined && g !== '') {
          var u = {}; Object.keys(t).forEach(function (k) { u[k] = t[k]; });
          u.gain = BED_CAP * Math.max(0, Math.min(1, Number(g))); t = u;
        }
        next.push(t);
        say('bed: ' + c + ' -> ' + t.file);
      });
      wanted = next;
      settle(FADE);
    });
  }

  function once(words, gain) {
    withTable(function () {
      var t = find(words, true);
      if (!t) { say('no sound: ' + words); return; }
      if (!awake || !ctx) { say('before the first tap, not played: ' + words); return; }
      say('once: ' + words + ' -> ' + t.file);
      load(t).then(function (buf) {
        if (!buf) return;
        var g = ctx.createGain(), s = ctx.createBufferSource();
        g.gain.value = (gain != null ? gain : ONCE_CAP) * level(t);
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
      /* a master limiter: three beds and a once together never clip (threshold -6 dB, hard knee, fast attack) */
      if (ctx.createDynamicsCompressor) {
        var lim = ctx.createDynamicsCompressor();
        lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.003; lim.release.value = 0.25;
        master.connect(lim); lim.connect(ctx.destination);
      } else master.connect(ctx.destination);
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


  /* ---- the castle's sound day (Events' req 2467), behind ?sound=log: the mix, the spot timer and the nine periods ---- */
  var mixTable = null, mixWait = [], spotTimer = null, spotState = { cues: [], i: 0, first: true, band: 'low' }, isWalking = false;
  function withMix(fn) {
    if (mixTable) { fn(); return; }
    mixWait.push(fn);
    if (mixWait.length > 1) return;
    if (!root.fetch) { mixTable = { rooms: {}, weather: {} }; var w0 = mixWait; mixWait = []; w0.forEach(function (f) { f(); }); return; }
    root.fetch(BASE + 'mix.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : { rooms: {}, weather: {} }; })
      .catch(function () { return { rooms: {}, weather: {} }; })
      .then(function (d) { mixTable = d; var w = mixWait; mixWait = []; w.forEach(function (f) { f(); }); });
  }
  function bandDown(b, n) { return BANDS[Math.max(BANDS.indexOf(b) - n, 0)]; }
  /* the nine periods from the shell's clock: dawn is the month's, passed in as a decimal hour (default 6.5) */
  function periodAt(h, m, dawn) {
    var t = h + (m || 0) / 60, d = dawn == null ? 6.5 : dawn;
    if (t < d) return 'small-hours';
    if (t < 7.5) return 'dawn';
    if (t < 8.5) return 'breakfast';
    if (t < 12.5) return 'morning';
    if (t < 13.5) return 'lunch';
    if (t < 18.5) return 'afternoon';
    if (t < 19.5) return 'dinner';
    if (t < 22) return 'evening';
    return 'night';
  }
  /* the list the player settles: own beds, leaks, the weather layer; one entry per cue, at its loudest band */
  function layers(entry, o) {
    var list = [], seen = {};
    function add(cue, band) {
      if (!cue || !BAND_BED[band]) return;
      if (seen[cue] != null) { if (BANDS.indexOf(band) > BANDS.indexOf(list[seen[cue]].band)) list[seen[cue]].band = band; return; }
      seen[cue] = list.length; list.push({ cue: cue, band: band });
    }
    (entry.beds || []).forEach(function (b) { add(b.cue, b.band); });
    (entry.leaks || []).forEach(function (b) { add(b.cue, b.band); });
    if (entry.weather && mixTable.weather) {
      if (o && o.weather === 'rain') add(mixTable.weather.rain, entry.weather);
      else if (o && o.windy) add(mixTable.weather.wind, entry.weather);
    }
    return list;
  }
  function mix(room, period, o) {
    if (!LOG) return;
    withTable(function () { withMix(function () {
      var e = (mixTable.rooms[room] || {})[period] || {}, list = layers(e, o), next = [], seen = {};
      list.forEach(function (l) {
        var t = find(l.cue);
        if (!t) { say('no sound: ' + l.cue); return; }
        if (t.play === 'once' || seen[t.file]) return;
        seen[t.file] = true;
        next.push({ file: t.file, level: t.level, cue: t.cue, gain: BAND_BED[l.band] });
        say('mix bed: ' + l.cue + ' at ' + l.band + ' -> ' + t.file);
      });
      wanted = next;
      settle(FIRST_FADE, OUT_FADE);
      var top = (e.beds && e.beds[0] && e.beds[0].band) || 'low';
      startSpots(e.spots || [], top);
      say('mix: ' + room + ' / ' + period + ': ' + list.length + ' layers, ' + (e.spots || []).length + ' spots');
    }); });
  }
  function startSpots(cues, band) {
    if (spotTimer && root.clearTimeout) root.clearTimeout(spotTimer);
    spotTimer = null;
    spotState = { cues: cues, i: 0, first: true, band: BAND_SPOT[band] ? band : 'low' };
    if (cues.length) later();
  }
  function later() {
    var secs = SPOT_GAP[0] + Math.random() * (SPOT_GAP[1] - SPOT_GAP[0]);
    spotTimer = root.setTimeout(function () { spotTimer = null; spotTick(); if (spotState.cues.length) later(); }, secs * 1000);
  }
  /* one spot, if he stands and the player is awake: the cues in turn, the first of a visit one band under the table's */
  function spotTick() {
    if (isWalking || !awake || !spotState.cues.length) return false;
    var cue = spotState.cues[spotState.i % spotState.cues.length];
    spotState.i++;
    var band = spotState.first ? bandDown(spotState.band, 1) : spotState.band;
    spotState.first = false;
    if (!BAND_SPOT[band]) return false;
    say('spot: ' + cue + ' at ' + band);
    once(cue, BAND_SPOT[band]);
    return true;
  }
  function walking(on) { isWalking = !!on; }

  function mute(on) {
    muted = !!on;
    try { if (root.localStorage) root.localStorage.setItem(MUTE_KEY, muted ? 'yes' : 'no'); } catch (e) {}
    if (master && ctx) ramp(master, muted ? 0 : 1, MUTE_FADE);
    say(muted ? 'muted' : 'unmuted');
  }

  root.CastleSound = {
    bed: bed, lines: lines, once: once, wake: wake, mute: mute,
    mix: mix, walking: walking, periodAt: periodAt, spotTick: spotTick,
    muted: function () { return muted; },
    awake: function () { return awake; },
    log: function () { return logged.slice(); },
    playing: function () { return Object.keys(playing); }
  };
})(typeof window !== 'undefined' ? window : this);
