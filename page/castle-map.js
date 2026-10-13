/* The Marauder's Map in his hands: the play of board req 242 (the events lane's; Magic's B10 to B15) on Design's
   ink and hand (req 243, page/design/marauders-map.js, LumosMap.mount; docs/handoff/design.md, The Marauder's Map).
   It answers the cues of page/events/map.json and writes the Marauders' lines on the parchment; the record decides
   everything, this only shows it. The castle model (page/castle-model.js) and the Map's script and hands load the
   first time he unfolds it, so a room that never shows the Map pays nothing.

   A room takes it in three places, beside its own:
     var mapPlay = CastleMap.make({ castle: function () { return castle; } });
     cues: Object.assign({ ...the room's... }, mapPlay.cues),
     drawRoom: function (shows) { ...the room's...; mapPlay.drawRoom(shows); },
     showLines: function (lines) { showLines(mapPlay.lines(lines)); }
   The parchment folded in his pocket is a small button at the foot of the screen (`.castle-map-pocket`); unfolded,
   the Map fills the screen over the room. A tap on the parchment is `tap parchment` (the wand's touch: the ear opens
   for the oath, or the Marauders' cheek where speech is off); the oath's and Mischief managed's cards show where
   speech is off (`tap oath`, `tap managed`); a tap off the parchment folds it (`tap map`). "Closer" and "the whole
   castle" change the view; the ink stays. His brother's dot (one castle, events-map-brother-1013) is drawn as any
   other; its pacing is a question for Design's next look. */
(function () {
  'use strict';
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^\/]*$/, '') : '';
  })();
  /* map.json's cues, word for word (the tally reads this list against the record) */
  var POCKET = 'the old parchment folded small in his pocket';
  var BLANK = 'the old parchment open in his hands, blank';
  var INKED = "the Marauder's Map open in his hands, the castle and its dots in ink";
  var DEN = "the den on the Map in Clementine's older brown ink behind the little door, labelled C.A.'s";
  var UNFOLD = 'he unfolds the old parchment: blank';
  var OATH = "his wand's touch and the oath: thin ink lines spread like a spider's web from the dot by his own name, the curly green title blossoms across the top, then the castle and its dots";
  var DEN_NEW = "a beat after the Marauders' web, and more slowly, brown lines of an older ink spread on their own from the little door and draw the round den, labelled C.A.'s in Clementine's hand";
  var WIPE = 'he taps it and says Mischief managed: the ink sinks away and the parchment is blank again';
  var FOLD_INKED = 'he folds it away with the ink still on it';
  var FOLD_BLANK = 'he folds the blank parchment away';
  var FIRST = 'on his first look ever, Professor Dumbledore pacing his study, Mrs Norris prowling the second floor and Peeves bouncing around the trophy room';
  var GLINT = "the oath's card glints";
  var HANDS = { moony: /^Mr Moony\b|^Messrs\b/, padfoot: /^Mr Padfoot\b/, prongs: /^Mr Prongs\b/ };

  function loadScript(src) {
    return new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { no(new Error('could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  var loading = null;
  function ready() {
    if (loading) return loading;
    var font = document.createElement('link');
    loading = loadScript(BASE + 'design/marauders-map.js').then(function () {
      font.rel = 'stylesheet'; font.href = window.LumosMap.FONTS; document.head.appendChild(font);
      return window.CASTLE_MODEL ? null : loadScript(BASE + 'castle-model.js');
    }).then(function () {
      return document.fonts && document.fonts.load ? Promise.all(['moony', 'padfoot', 'prongs', 'title'].map(function (h) {
        return document.fonts.load('16px ' + window.LumosMap.HANDS[h].split(',')[0]);
      })).catch(function () {}) : null;
    });
    return loading;
  }

  /* A Marauders' line in its hands: each sentence that names one of them in his own hand, the rest in the line's. */
  function inHands(line) {
    var whole = /Padfoot/.test(line.hand || '') && !/Moony|Prongs/.test(line.hand || '') ? 'padfoot'
              : /Prongs/.test(line.hand || '') && !/Moony|Padfoot/.test(line.hand || '') ? 'prongs' : 'moony';
    return String(line.text || '').split(/(?<=[.!?])\s+(?=Mr |Messrs )/).map(function (s) {
      var hand = whole;
      for (var h in HANDS) if (HANDS[h].test(s)) hand = h;
      return { hand: hand, text: s };
    });
  }
  /* A sentence broken to the parchment's width, as a hand would write it down the sheet. */
  function wrap(text, chars) {
    var out = [], row = '';
    text.split(' ').forEach(function (w) {
      if (row && (row + ' ' + w).length > chars) { out.push(row); row = w; } else row = row ? row + ' ' + w : w;
    });
    if (row) out.push(row);
    return out;
  }

  function make(o) {
    o = o || {};
    var castle = o.castle || function () { return window.castle; };
    var css = document.createElement('style');
    css.textContent =
      '.castle-map-pocket{position:fixed;left:14px;bottom:14px;z-index:40;width:58px;height:44px;border:0;border-radius:4px;' +
      'background:linear-gradient(135deg,#e9d9ad,#cdb27a);box-shadow:0 2px 8px rgba(0,0,0,.45);cursor:pointer;display:none}' +
      '.castle-map-pocket::after{content:"";position:absolute;inset:7px 9px;border-top:1px solid rgba(59,37,22,.35);border-bottom:1px solid rgba(59,37,22,.35)}' +
      '.castle-map{position:fixed;inset:0;z-index:50;background:rgba(10,6,3,.72);display:none;align-items:center;justify-content:center;flex-direction:column}' +
      '.castle-map .sheet{position:relative;box-shadow:0 6px 30px rgba(0,0,0,.6);touch-action:none}' +
      '.castle-map .bar{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;justify-content:center}' +
      '.castle-map button{font:600 15px Georgia,serif;color:#3b2516;background:#e9d9ad;border:0;border-radius:6px;padding:9px 14px;cursor:pointer}' +
      '.castle-map button.card{font-style:italic}.castle-map button.glint{animation:castle-map-glint 1.2s ease 2}' +
      '@keyframes castle-map-glint{50%{box-shadow:0 0 18px 4px #f6e7a8;background:#fff3c8}}';
    document.head.appendChild(css);
    var pocket = document.createElement('button');
    pocket.className = 'castle-map-pocket'; pocket.setAttribute('aria-label', 'the old parchment');
    var shade = document.createElement('div'); shade.className = 'castle-map';
    var sheet = document.createElement('div'); sheet.className = 'sheet';
    var bar = document.createElement('div'); bar.className = 'bar';
    function button(label, cls, fn) {
      var b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls;
      b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); bar.appendChild(b); return b;
    }
    var oathCard = button('I solemnly swear that I am up to no good.', 'card', function () { tap('oath'); });
    var managedCard = button('Mischief managed!', 'card', function () { tap('managed'); });
    var closer = button('Closer', '', function () { zoom(!near); });
    shade.appendChild(sheet); shade.appendChild(bar);
    document.body.appendChild(pocket); document.body.appendChild(shade);

    var st = { pocket: false, open: null, den: false }, live = null, near = false, notesY = 0, queue = Promise.resolve();
    var pending = null;                                       /* the oath's cues of one moment, gathered, then played */
    function tap(name) { var c = castle(); if (c) c.tap(name); }
    function speechOff() {
      var c = castle(), s = c && c.settings ? c.settings() : {};
      return !(window.CastleEar && window.CastleEar.available && window.CastleEar.available()) || s.speech === 'off';
    }
    pocket.addEventListener('click', function () { tap('map'); });
    shade.addEventListener('click', function (e) { if (e.target === shade) tap('map'); });
    sheet.addEventListener('click', function () { if (st.open === 'blank') tap('parchment'); });

    function size() { return { w: Math.min(window.innerWidth - 24, 620), h: Math.min(window.innerHeight - 110, 760) }; }
    function view() {
      var M = window.CASTLE_MODEL, L = window.LumosMap, z = size(), c = castle(), m = c && c.map ? c.map() : null;
      var at = (m && m.dots[0] && L.locate(M, m.dots[0].place)) || [0, 0];
      if (near) return L.phone(at[0], at[1], 6, z.w, z.h);
      var k = Math.min(z.w, z.h) / 340;                      /* the castle whole, about 340 m across */
      return L.phone(at[0] * 0.3, at[1] * 0.3 + 40, k, z.w, z.h);
    }
    function dots() {
      var c = castle(), m = c && c.map ? c.map() : null;
      return ((m && m.dots) || []).map(function (d) { return { name: d.label || '', at: d.place, me: !!d.me }; })
        .filter(function (d) { return d.at; });
    }
    /* Draw the sheet afresh: blank, or inked at once (a reload, a zoom), or ready for the oath's spread. */
    function mount(inked, denNew) {
      var v = view();
      sheet.style.width = v.w + 'px'; sheet.style.height = v.h + 'px';
      live = window.LumosMap.mount(sheet, window.CASTLE_MODEL, { look: 'raised', view: v, dots: dots(), den: st.den && !denNew, denNew: !!denNew });
      notesY = 0;
      return inked ? live.open(1) : Promise.resolve();
    }
    function zoom(close) {
      near = close; closer.textContent = near ? 'The whole castle' : 'Closer';
      if (st.open) queue = queue.then(function () { return mount(st.open === 'inked'); });
    }
    function show(state) {
      var was = st.open;
      st.open = state;
      shade.style.display = state ? 'flex' : 'none';
      oathCard.style.display = state === 'blank' && speechOff() ? '' : 'none';
      managedCard.style.display = state === 'inked' && speechOff() ? '' : 'none';
      if (!state || state === was) return;
      queue = queue.then(ready).then(function () { if (!live || !was || state === 'inked') return mount(state === 'inked'); });
    }
    function note(line) {
      queue = queue.then(ready).then(function () {
        if (!live) return mount(st.open === 'inked');
      }).then(function () {
        var px = Math.max(11, Math.min(15, size().w / 30)), chars = Math.floor((size().w - 28) / (px * 0.52));
        return inHands(line).reduce(function (p, s) {
          return wrap(s.text, chars).reduce(function (q, row) {
            return q.then(function () { notesY += px * 1.55; return live.note(s.hand, row, 14, 24 + notesY, px, 500 + row.length * 28); });
          }, p);
        }, Promise.resolve());
      });
    }
    function playOath() {
      var denNew = pending.den;
      pending = null;
      queue = queue.then(ready).then(function () { return mount(false, denNew); }).then(function () { return live.open(2600); })
        .then(function () { if (denNew) st.den = true; });
    }

    var cues = {};
    cues[UNFOLD] = function () { show('blank'); };
    cues[OATH] = function () { pending = pending || { den: false }; setTimeout(function () { if (pending) playOath(); }, 0); };
    cues[DEN_NEW] = function () { pending = pending || { den: false }; pending.den = true; };
    cues[WIPE] = function () { queue = queue.then(function () { return live && live.wipe(1200); }).then(function () { notesY = 0; }); };
    cues[FOLD_INKED] = cues[FOLD_BLANK] = function () { show(null); };
    cues[FIRST] = function () {};                         /* the three are dots of map(), marked first, drawn with the rest */
    cues[GLINT] = function () { oathCard.classList.remove('glint'); void oathCard.offsetWidth; oathCard.classList.add('glint'); };

    function drawRoom(shows) {
      var inked = shows.indexOf(INKED) >= 0, blank = shows.indexOf(BLANK) >= 0;
      st.den = st.den || shows.indexOf(DEN) >= 0;
      pocket.style.display = shows.indexOf(POCKET) >= 0 && !inked && !blank ? 'block' : 'none';
      if (pending) return;                                    /* the oath's spread is on its way */
      if (inked && st.open !== 'inked') { st.open = 'inked'; shade.style.display = 'flex'; queue = queue.then(ready).then(function () { return mount(true); }); }
      else if (blank && st.open !== 'blank' && st.open !== 'inked') show('blank');
      else if (!inked && !blank && st.open) show(null);
      oathCard.style.display = st.open === 'blank' && speechOff() ? '' : 'none';
      managedCard.style.display = st.open === 'inked' && speechOff() ? '' : 'none';
    }
    function lines(list) {
      return (list || []).filter(function (l) {
        if (l.at !== 'map') return true;
        note(l);
        return false;
      });
    }
    return { cues: cues, drawRoom: drawRoom, lines: lines, state: function () { return { pocket: pocket.style.display === 'block', open: st.open, den: st.den }; },
             played: function () { return queue; } };
  }

  window.CastleMap = { make: make, CUES: [POCKET, BLANK, INKED, DEN, UNFOLD, OATH, DEN_NEW, WIPE, FOLD_INKED, FOLD_BLANK, FIRST, GLINT], inHands: inHands, wrap: wrap };
})();
