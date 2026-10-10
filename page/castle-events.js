/* The castle's events runtime, shared by every room's page.

   It reads the event files in events/ (one chain per file, the format in pipeline/events.py's docstring), keeps
   a small state per iPad, and checks records at their moments. A room gives it only what is the room's own: what
   each cue means there (`cues`), how to draw the room from the cues its state shows (`drawRoom`), and the
   built-ins only the room can answer, such as `portrait` (`builtins`). The design is in the handoff, The
   portrait hole and Magic for the boys; the brief is docs/events-brief.md.

   Built so far: the thin slice (7 October 2026): the state, a visit's arrive and leave, the `wait N-M s` moment,
   fixed and small records, conditions over state and built-ins, the effect verbs, `show` cues, `room`, the log.
   Then for the fire chain (8 October 2026): the moments `tap X` and `first tap` (the room calls `tap(name)`, and
   a chain's `targets` map one name to another, as the bellows to the fire), `seconds since last tap`, the big
   tier and its draw, `boost`, and a record's `ends` (when, on leave, on a tap, a timeout in days).
   Then for the armour and Peeves's sticks on the corridor page (8 October 2026, evening): `one_of` groups (of
   the eligible records in a group at one moment, one fires, drawn by weight), a chain's `bags` and `set X = from
   bag Y` (none twice until every one whose `when` holds has come, then it refills; what has come is kept in the
   state), a chain's `marks` and `set X = mark Y, not last` (a draw among the named marks, never the one X is at;
   unset reads as the first, the base drawing), the built-ins `place` (the page's, `opts.place`; a visit that
   never left runs its leave as the page it was on), `at` (the page's, `opts.builtins.at`: the corridor stop he
   stands at, or `none`) and `time` (morning, day, evening or night, night from a dusk worked from the month for
   a home in the northern mid-latitudes, never a stored place). A record with a figure in its cast (a pool
   student, a canon person, a ghost) is still skipped with a note; a trace or a voice fires.
   Then the hole as moving, not leaving (Godric, 9 October 2026): one visit across every page, `arrive` once per
   page per visit, `outside` and `enter` at the hole, `leave` when he really stops, run on the clock of his going
   when it runs late; the built-in `been <page>`; `chains: 'all'` from events/index.json; a record's `show_at`.
   Then the bedtime (9 October 2026, board req 37): a parent's visit length raises `bedtime warning` and `lights
   out` on whatever page he is on, the built-in `bedtime`, and ?bedtime=N (minutes) for a test.
   Then the ultra review's eleven (9 October 2026, board req 42): a chain's first visit per chain, an end `on:
   password` (the page calls `password()`), a cue may end the visit, an older saved state filled out, and the
   late leave, the hiding snapshot and the open records of chains a page did not load mended.
   Then figures on marks (9 October 2026, board req 40): a page lists the figures it can draw (`figures`), a
   record's cast is chosen from them when it fires and stands for the rest of the visit, on every page, and the page
   draws who stands (`drawFigures`). On a page with no list a record with a figure is skipped, as before.
   Then lines (9 October 2026, twenty-fourth session): the page's `showLines(list)` gets the lines of each record,
   end or tap in order, each with its variant drawn (never the one its key said last), `{intro}` filled, its speaker's
   cast entry and drawn figures; a line marked verify is held for the canon gate, handed as `held` with no words
   (?lines=all shows it); a written
   line's words are kept for the room (`written()`); `pose` turns the speaker, `then` walks him off; a line `on_tap`
   waits for a tap on its speaker. Then a mark drawn `by week` (Friday's places, board req 64).
   Then quiet and say with the ear (the same session): `quiet N-M s` when he has tapped nothing for a span drawn each
   visit, once a quiet stretch; a tap on a thing a `say` record listens for opens the ear (page/castle-ear.js, or
   `opts.ear`), the built-in `listening` names it while the ear is open and a beat after, and the guesses the ear
   hands are matched forgivingly to the `say` moments that hold (`heard()`, which a page may call itself).
   Then `mark next to X` (Trevor's hop, twenty-sixth session): one of the marks the page names next to X's
   (`neighbours`), or with none named another of its set. Nothing in the records waits on the runtime now.
   Then the password (board req 72, thirtieth session): a chain's `words`, the week's word by its `first_monday`
   (`password`, `last password`, `next password`, and `{password}` in a line or an intro); `say {password}` hears
   the word as it stands; `unheard X` when the ear a tap on X opened heard nothing near enough; `day of week`
   (Monday 1); `speech` reads off where the browser cannot hear, so a spoken thing waits for a tap.

   Test links: ?event=<id> loads only that record's chain and lets the record skip the draw, so it fires whenever
   it holds and the rest of its chain follows it (in a one_of group it wins the group); ?wait=N sets every wait
   to N s; ?time=night (or morning, day, evening) overrides the clock; ?fresh starts this iPad's castle afresh;
   ?lines=all shows the lines still marked verify. */
(function () {
  'use strict';

  var STATE_KEY = 'lumos.castle.state.v1';
  var SETTINGS_KEY = 'lumos.castle.settings.v1';
  var LOG_LINES = 50;
  var SMALL_ODDS = 0.8;          /* small touches on most visits: about four in five */
  var BIG_ODDS = 1 / 3;          /* big events about one visit in three, at most one a day, never two visits running */
  var AWAY_S = 5 * 60;           /* hidden this long and coming back is a new visit */
  var CROSS_S = 120;             /* a page opened with ?from= this soon after the last one went carries the visit on */
  var DAY_MS = 86400000;
  var WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  /* Dusk and dawn as a local hour by month, January first, for a home in the northern mid-latitudes with summer
     time from March to early November: worked from the month, never from a stored place. Night runs from dusk to
     dawn, morning from dawn to noon, day to five, evening from five to dusk (none in midwinter, when night comes
     before tea). */
  var DUSK = [17.0, 17.75, 18.75, 20.0, 20.5, 21.0, 21.0, 20.25, 19.25, 18.5, 17.0, 16.75];
  var DAWN = [7.25, 6.75, 7.0, 6.25, 5.5, 5.25, 5.5, 6.0, 6.5, 7.0, 6.75, 7.25];

  var COND = /^([a-z_ ]+?)\s*(>=|<=|!=|=|<|>)\s*([A-Za-z0-9_\- ]+)$/;
  var WAIT = /^(wait|quiet) (\d+)-(\d+) s$/;
  var EFFECTS = [
    ['set', /^set ([a-z_]+) = (mark [a-z ,]+|from bag [a-z]+|\d+-\d+|-?\d+|[a-z\-]+)$/],
    ['add', /^add ([a-z_]+) (-?\d+)$/],
    ['stamp', /^stamp ([a-z_]+)(?: \+(\d+)(?:-(\d+))? days)?$/],
    ['slot', /^(take|free) slot$/],
    ['log', /^log "(.+)"$/]
  ];

  /* The real moon (req 95, Magic's "The real moon, how real", Godric's pick of 10 October 2026, 5.16 pm), from the
     date and clock alone, for the same northern mid-latitude home as dusk (latitude 42), no stored place. The moon's
     and sun's longitudes by the almanac's short series (within a few hours of the true new and full moons) give its
     phase and how much is lit; its height comes from its hour angle (the sun's, less the elongation, from a solar noon
     of twelve o'clock, one o'clock in summer time) and its declination from its longitude, so it rises about fifty
     minutes later each day, is up all night at full and only by day near new, and stands high on a winter's full
     moon and low on a summer's. */
  var RAD = Math.PI / 180, MOON_LAT = 42;
  var PHASES = [[12, 'new'], [78, 'waxing-crescent'], [102, 'first-quarter'], [168, 'waxing-gibbous'], [192, 'full'],
                [258, 'waning-gibbous'], [282, 'last-quarter'], [348, 'waning-crescent'], [360, 'new']];
  var PHASE_AT = { 'new': 0, 'waxing-crescent': 45, 'first-quarter': 90, 'waxing-gibbous': 135, 'full': 180,
                   'waning-gibbous': 225, 'last-quarter': 270, 'waning-crescent': 315 };
  function summerTime(d) {
    var jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset(), jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
    return d.getTimezoneOffset() < Math.max(jan, jul);
  }
  function moonAt(d, forced) {
    var t = (d.getTime() - 946728000000) / DAY_MS;      /* days from noon, 1 January 2000, UTC */
    var lm = 218.316 + 13.176396 * t + 6.289 * Math.sin((134.963 + 13.064993 * t) * RAD);
    var g = (357.528 + 0.9856003 * t) * RAD;
    var ls = 280.46 + 0.9856474 * t + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    var e = forced ? PHASE_AT[forced] : (((lm - ls) % 360) + 360) % 360;   /* elongation: 0 new, 180 full */
    var phase = 'new';
    for (var i = 0; i < PHASES.length; i++) if (e < PHASES[i][0]) { phase = PHASES[i][1]; break; }
    var lit = (1 - Math.cos(e * RAD)) / 2;
    var dec = Math.asin(Math.sin(23.44 * RAD) * Math.sin((forced ? ls + e : lm) * RAD));
    var noon = 12 + (summerTime(d) ? 1 : 0);
    var ha = (15 * (d.getHours() + d.getMinutes() / 60 - noon) - e) * RAD;
    var alt = Math.asin(Math.sin(MOON_LAT * RAD) * Math.sin(dec) + Math.cos(MOON_LAT * RAD) * Math.cos(dec) * Math.cos(ha)) / RAD;
    return { phase: phase, age: Math.round(e / 360 * 29.53 * 10) / 10, lit: Math.round(lit * 100) / 100,
             waxing: e < 180, up: alt > 0, altitude: Math.round(Math.max(0, alt)), height: Math.round(Math.max(0, alt) / 90 * 100) / 100 };
  }

  function note(msg) { if (window.console) console.info('[castle-events] ' + msg); }
  function between(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* A day is a whole local day counted from 1970, so dates compare as numbers and survive a reload. */
  function dayNumber(d) { return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / DAY_MS); }
  /* The week as a whole number, turning over on Monday (password Monday), from the date alone, so both castles and
     every page agree on it: the moving stair's vanishing step holds all week by it. 1 January 1970 was a Thursday. */
  function weekNumber(d) { return Math.floor((dayNumber(d) + 3) / 7); }

  function load(key) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function save(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* private mode: the castle forgets, kindly */ }
  }

  function freshState() {
    return { v: 1, vars: {}, stamps: {}, slot: null, visits: 0, visitOpen: false, lastSmall: [], bags: {}, log: [],
             open: {}, started: {}, lastBigDay: null, lastBigVisit: null, visitPlace: null, leftAt: null, kept: null,
             said: {}, written: {} };
  }

  function start(opts) {
    var params = new URLSearchParams(location.search);
    var only = params.get('event');
    var waitOverride = params.has('wait') ? Math.max(0, +params.get('wait') || 0) : null;
    var timeOverride = /^(morning|day|evening|night)$/.test(params.get('time') || '') ? params.get('time') : null;
    var moonOverride = PHASE_AT.hasOwnProperty(params.get('moon')) || params.get('moon') === 'down' ? params.get('moon') : null;   /* a test link: ?moon=full, ?moon=down */
    if (params.has('fresh')) { try { localStorage.removeItem(STATE_KEY); } catch (e) {} }
    var allLines = params.get('lines') === 'all';   /* a test link: lines still marked verify are shown too */

    var cues = opts.cues || {};
    var builtins = opts.builtins || {};
    var drawRoom = opts.drawRoom || function () {};
    /* The figures this page can draw (board req 40): one entry per figure, pose and mark it can stand in, as
       `{ role: 'pool', cell: 0, pose: 'standing, listening', mark: 'fire' }` (a pool student by its cell on the pool
       sheet) or `{ role: 'canon', name: 'the fat lady', pose: ..., mark: 'her frame' }` (a canon figure or a ghost by
       name), and anything else the page wants handed back. A record's pose and mark must match an entry word for
       word. A page with no list draws no figures, and a record with a figure in its cast is skipped there. */
    var figures = opts.figures || null;
    var drawFigures = opts.drawFigures || function () {};
    /* Lines (twenty-fourth session): the runtime picks each line's variant and its speaker, and hands the page the
       lines of one record, or one end, or one tap, in order, as a list; the page draws them (said text by the
       speaker, a written line in its hand at its place, a heard one off stage) and paces them. */
    var showLines = opts.showLines || function () {};
    /* The ear (page/castle-ear.js, twenty-fourth session): `opts.ear`, else the page's CastleEar. It only hears; the
       runtime opens it on a tap on a thing a `say` record listens for and matches its guesses to the `say` moments. */
    var ear = opts.ear !== undefined ? opts.ear : (window.CastleEar || null);
    var earSession = null;
    var place = opts.place || 'common room';     /* the page this runtime runs on: `common room` or `corridor` */
    var markSets = {};                           /* named sets of the page's marks a draw picks from: the page's `opts.marks`, then each chain's `marks` */
    for (var ms in (opts.marks || {})) markSets[ms] = (opts.marks[ms] || []).slice();
    /* Which of the page's marks are next to which, for `mark next to X` (Trevor's hop, twenty-sixth session):
       `{ 'floor-a': ['floor-b'], 'floor-b': ['floor-a', 'floor-c'] }`. Nearness is the page's, which places them. */
    var neighbours = opts.neighbours || {};
    var bagDefs = {};                            /* each chain's bags, by name */
    var wordDefs = {};                           /* each chain's week-by-week words, by name (the password) */
    var leaving = false;                         /* while a visit's leave runs, `place` is the page that visit was on */
    var state = load(STATE_KEY);
    if (!state || state.v !== 1) state = freshState();
    /* A state saved by an earlier runtime lacks the fields added since (bags, lastSmall, open, started, ...) while
       `v` stayed 1: each missing one is filled from a fresh state (until 9 October 2026 only `open` was, so an old
       state threw at its first bag draw). `started` missing means this state predates the per-chain first visit. */
    var oldStarts = !state.started;
    var blank = freshState();
    for (var bk in blank) if (state[bk] === undefined || state[bk] === null && blank[bk] !== null) state[bk] = blank[bk];
    var settings = load(SETTINGS_KEY) || { leans: [], speech: 'on' };
    /* A parent's bedtime: a visit length in minutes, or off (settings.bedtime); ?bedtime=N sets it for a test. A bare
       &bedtime is the lights-out trip's own flag, not a length, so it leaves the parent's setting as it is (until
       9 October 2026 it read as 0 and turned the bedtime off on the page it opened); ?bedtime=off turns it off. */
    var bedtimeParam = params.get('bedtime');
    var bedtimeMin = bedtimeParam === 'off' ? 0 : +bedtimeParam > 0 ? +bedtimeParam : (+settings.bedtime || 0);

    var chains = [];          /* the loaded files */
    var records = [];         /* every record, in file order */
    var byId = {};
    var stampNames = {};      /* every name a file stamps, so a condition knows it is a date */
    var visit = null;        /* this visit: its moments still to come and what fired */
    var hiddenAt = 0;
    var clock = null;         /* while a deferred leave runs, the time he went */
    var targets = {};        /* a tap's name mapped to another, from the chains' `targets` */
    var tapping = null;       /* the thing tapped, while its moment runs */

    /* ---------- reading state ---------- */

    /* The clock every date, hour and time of day reads. A deferred leave sets it to the moment he went, so its
       `time` and its stamps are those of the leaving, not of the next arrival. */
    function nowDate() { return clock != null ? new Date(clock) : new Date(); }
    function today() { return dayNumber(nowDate()); }

    function timeOfDay() {
      if (timeOverride) return timeOverride;
      var now = nowDate(), h = now.getHours() + now.getMinutes() / 60, mo = now.getMonth();
      if (h < DAWN[mo] || h >= DUSK[mo]) return 'night';
      return h < 12 ? 'morning' : h < 17 ? 'day' : 'evening';
    }

    /* The moon now: ?moon=<phase> shows that phase up and well clear of the sill, ?moon=down the real phase set. Its
       light follows how much of it is lit while it is up, and is nothing while it is down. */
    function moonNow() {
      var m = moonAt(nowDate(), moonOverride !== 'down' ? moonOverride : null);
      if (moonOverride === 'down') { m.up = false; m.altitude = 0; m.height = 0; }
      else if (moonOverride) { m.up = true; m.altitude = 35; m.height = 0.39; }
      m.light = m.up ? m.lit : 0;
      return m;
    }

    function builtin(name) {
      var now = nowDate();
      if (builtins[name]) return builtins[name]();
      switch (name) {
        case 'today': return today();
        case 'time': return timeOfDay();
        case 'moon': return moonNow().phase;          /* new, waxing-crescent, ... full, ... waning-crescent */
        case 'moon up': return moonNow().up ? 'yes' : 'no';
        case 'place': return (leaving && state.visitPlace) || place;
        case 'at': return 'none';                 /* a page with stops answers this itself */
        case 'hour': return now.getHours();
        case 'weekday': return WEEKDAYS[now.getDay()];
        case 'week': return weekNumber(now);
        case 'day of week': return (now.getDay() + 6) % 7 + 1;      /* Monday 1 to Sunday 7, so `day of week >= 4` is Thursday on */
        case 'date': return ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        case 'slot': return state.slot ? 'taken' : 'free';
        /* off as a parent sets it, or where the browser cannot hear at all, so a spoken thing waits for a tap (the ear's promise) */
        case 'speech': return ear && ear.available && ear.available() ? settings.speech || 'on' : 'off';
        case 'listening':                    /* the thing tapped, while the ear its tap opened listens, and a beat after */
          var ls = visit && visit.listen;
          return ls && (ls.open || Date.now() < ls.until) ? ls.name : 'none';
        case 'bedtime': return bedtimeMin > 0 ? 'set' : 'off';
        /* how this page was reached, from its `?from=`: room, corridor, dormitory, sleep (the waking), or none (Neville's
           snore on a night waking, 10 October 2026) */
        case 'from': return /^(room|corridor|dormitory|sleep)$/.test(params.get('from') || '') ? params.get('from') : 'none';
        case 'visits since big': return state.lastBigVisit == null ? Infinity : state.visits - state.lastBigVisit;
        case 'seconds since last tap':      /* since his previous tap on the same thing; never tapped reads as long ago */
          if (!tapping || !visit || visit.lastTap[tapping] == null) return Infinity;
          return (Date.now() - visit.lastTap[tapping]) / 1000;
      }
      var wm = /^(?:(last|next) )?([a-z]+)$/.exec(name);
      if (wm && wordDefs[wm[2]]) return weekWord(wm[2], wm[1] === 'last' ? -1 : wm[1] === 'next' ? 1 : 0);
      return undefined;
    }

    /* The week's word from a chain's `words` (the password, board req 72): the nth of its list in the nth week since
       its `first_monday`, so the story starts where Harry's did and both castles agree; the list is only ever added
       to at its end, so no week's word moves. Past the end it starts again at `again_from` (the first invented
       word). Before the first Monday it is the first word; `last` before the first week is `none`. */
    function weekWord(name, off) {
      var d = wordDefs[name], list = d.list || [];
      var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(d.first_monday || '');
      if (!m) note('words ' + name + ': no first_monday, so this week is its first');
      var first = m ? weekNumber(new Date(+m[1], +m[2] - 1, +m[3])) : weekNumber(nowDate());
      var n = Math.max(0, weekNumber(nowDate()) - first) + off;
      if (n < 0 || !list.length) return 'none';
      var from = Math.min(Math.max(0, d.again_from || 0), list.length - 1);
      if (n >= list.length) n = from + (n - from) % (list.length - from);
      return list[n];
    }

    function value(name) {
      name = name.trim();
      if (name.indexOf('days since ') === 0) {
        var s = state.stamps[name.slice(11)];
        return s == null ? Infinity : today() - s;     /* a stamp never made reads as forever */
      }
      if (name.indexOf('mark ') === 0) return visit && visit.marks[name.slice(5)] ? 'taken' : 'free';   /* a mark a figure stands on this visit */
      if (name.indexOf('been ') === 0) return visit && visit.pages.indexOf(name.slice(5)) >= 0 ? 'yes' : 'no';   /* did this visit reach that page */
      var b = builtin(name);
      if (b !== undefined) return b;
      if (stampNames[name]) return name in state.stamps ? state.stamps[name] : -Infinity;   /* never stamped: long past */
      if (name in state.vars) return state.vars[name];
      return undefined;
    }

    function holds(cond) {
      var m = COND.exec(cond);
      if (!m) { note('condition does not parse: ' + cond); return false; }
      var lhs = value(m[1]), op = m[2], raw = m[3].trim();
      var rhs = /^-?\d+$/.test(raw) ? +raw : (raw === 'today' || stampNames[raw]) ? value(raw) : raw;
      if (lhs === undefined) {
        if (typeof rhs === 'number' || op === '<' || op === '>' || op === '<=' || op === '>=') lhs = 0;   /* a count never added to reads as 0 */
        else return op === '!=';                                                                         /* a flag never set equals nothing */
      }
      switch (op) {
        case '=': return lhs == rhs;
        case '!=': return lhs != rhs;
        case '<': return lhs < rhs;
        case '>': return lhs > rhs;
        case '<=': return lhs <= rhs;
        case '>=': return lhs >= rhs;
      }
      return false;
    }

    function allHold(list) {
      for (var i = 0; list && i < list.length; i++) if (!holds(list[i])) return false;
      return true;
    }

    /* ---------- changing state ---------- */

    function logLine(text) {
      text = text.replace('{day}', WEEKDAYS[nowDate().getDay()].replace(/^./, function (c) { return c.toUpperCase(); }));
      state.log.push({ day: today(), text: text });
      if (state.log.length > LOG_LINES) state.log.splice(0, state.log.length - LOG_LINES);
    }

    /* A shuffled bag: of the things whose `when` holds now, one not yet come this round, at random; when every one
       that holds has come, the round starts again. What has come is kept in the state, so a reload keeps the order. */
    function drawFromBag(name, rec) {
      var things = bagDefs[name];
      if (!things) { note(rec.id + ': no bag named ' + name); return undefined; }
      var drawn = state.bags[name] = state.bags[name] || [];
      function left() {
        return things.filter(function (t) { return allHold(t.when) && drawn.indexOf(t.item) < 0; });
      }
      var pool = left();
      if (!pool.length) { drawn.length = 0; pool = left(); }
      if (!pool.length) { note(rec.id + ': nothing in bag ' + name + ' holds now'); return undefined; }
      var t = pool[Math.floor(Math.random() * pool.length)];
      drawn.push(t.item);
      return t.item;
    }

    /* `mark Y, not last`: one of the marks named Y, never the one X is at (unset reads as the first, the base).
       `mark Y, by week`: the week's own, in the set's order by the week from the date, so both castles agree and a
       set of two alternates (Friday's places, board req 64). */
    function drawMark(spec, current, rec) {
      var nx = /^next to ([a-z_]+)$/.exec(spec);
      if (nx) return drawNextTo(state.vars[nx[1]], rec);
      var m = /^([a-z]+)(, not last|, by week)?$/.exec(spec);
      if (!m) { note(rec.id + ': the draw "mark ' + spec + '" does not parse'); return undefined; }
      var set = markSets[m[1]];
      if (!set || !set.length) { note(rec.id + ': no marks named ' + m[1]); return undefined; }
      if (m[2] === ', by week') return set[weekNumber(nowDate()) % set.length];
      var at = current == null ? set[0] : current;
      var pool = m[2] ? set.filter(function (n) { return n !== at; }) : set;
      return pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined;
    }

    /* `mark next to X`: one of the marks the page names next to the one X is at, never X's own. A page that names
       none for it gives another mark of the set X's mark is in, with a note, so a hop still lands somewhere. */
    function drawNextTo(at, rec) {
      var pool = (neighbours[at] || []).filter(function (n) { return n !== at; });
      if (!pool.length) {
        for (var name in markSets) if (markSets[name].indexOf(at) >= 0) {
          pool = markSets[name].filter(function (n) { return n !== at; });
          break;
        }
        note(rec.id + ': the page names no neighbours for ' + at + (pool.length ? ', so another of its set' : ''));
      }
      return pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined;
    }

    function effect(text, rec) {
      for (var i = 0; i < EFFECTS.length; i++) {
        var m = EFFECTS[i][1].exec(text);
        if (!m) continue;
        switch (EFFECTS[i][0]) {
          case 'set':
            if (m[2].indexOf('from bag ') === 0) {
              var item = drawFromBag(m[2].slice(9), rec);
              if (item !== undefined) state.vars[m[1]] = item;
              return;
            }
            if (m[2].indexOf('mark ') === 0) {
              var mark = drawMark(m[2].slice(5), state.vars[m[1]], rec);
              if (mark !== undefined) state.vars[m[1]] = mark;
              return;
            }
            var r = /^(\d+)-(\d+)$/.exec(m[2]);
            state.vars[m[1]] = r ? between(+r[1], +r[2]) : (/^-?\d+$/.test(m[2]) ? +m[2] : m[2]);
            return;
          case 'add': state.vars[m[1]] = (+state.vars[m[1]] || 0) + (+m[2]); return;
          case 'stamp': state.stamps[m[1]] = today() + (m[2] ? between(+m[2], +(m[3] || m[2])) : 0); return;
          case 'slot': state.slot = m[1] === 'take' ? rec.id : null; return;
          case 'log': logLine(m[1]); return;
        }
      }
      note(rec.id + ': effect does not parse: ' + text);
    }

    function shownCues() {
      var out = [];
      for (var c = 0; c < chains.length; c++) {
        var rules = chains[c].room || [];
        for (var i = 0; i < rules.length; i++) if (allHold(rules[i].when)) out = out.concat(rules[i].show || []);
      }
      return out;
    }

    /* The page draws the room from its cues and the figures standing this visit. */
    function draw() {
      drawRoom(shownCues());
      drawFigures(visit ? visit.cast.slice() : []);
    }

    function changed() {
      save(STATE_KEY, state);
      draw();
    }

    /* ---------- the cast ---------- */

    /* Who stands where: a record's `who` read against the page's figures. A figure is a pool student by its cell, a
       canon figure or a ghost by its name, so none stands in two places at once; a mark a figure already holds this
       visit takes no other. `count` is a number or a range ("2-3"), one when absent. With `pick`, the figures are
       chosen (at random among those that fit, as many as the range allows); without, it only says whether the cast
       can be filled, returning the reason it cannot. A trace or a voice needs no figure. */
    var FIGURE = /^(pool|canon|ghost)$/;
    function figureKey(f) { return f.role === 'pool' ? 'pool ' + f.cell : f.role + ' ' + f.name; }
    function castFor(rec, pick) {
      var who = rec.who || [], used = {}, chosen = [];
      for (var c = 0; visit && c < visit.cast.length; c++) used[figureKey(visit.cast[c])] = true;
      for (var w = 0; w < who.length; w++) {
        var role = who[w];
        if (!FIGURE.test(role.role)) continue;
        if (!figures) return 'figures on marks';
        if (visit && visit.marks[role.mark]) return 'the mark ' + role.mark + ' is taken this visit';
        var fit = figures.filter(function (f) {
          return f.role === role.role && (role.role === 'pool' || f.name === role.name) && f.mark === role.mark &&
                 f.pose === role.pose && !used[figureKey(f)];
        });
        var n = /^(\d+)(?:-(\d+))?$/.exec(String(role.count == null ? 1 : role.count));
        var lo = n ? +n[1] : 1, hi = n && n[2] ? +n[2] : lo;
        if (fit.length < lo) return 'no figure on this page for ' + (role.name || role.role) + ' "' + role.pose + '" at ' + role.mark;
        if (!pick) continue;
        var take = between(lo, Math.min(hi, fit.length));
        for (var t = 0; t < take; t++) {
          var f = fit.splice(Math.floor(Math.random() * fit.length), 1)[0];
          used[figureKey(f)] = true;
          chosen.push(Object.assign({}, f, { record: rec.id, as: role.as }));
        }
      }
      return pick ? chosen : null;
    }

    /* ---------- lines ---------- */

    /* A line marked verify goes through the canon gate before it reaches a boy (Magic for the boys): it is held,
       with a note, and ?lines=all shows it for a test. A held line still goes to the page, `held: true` with no text
       and no sound, so its speaker's pose and walk-off (`then`) still reach the page while no words do. A variant is drawn fresh, never the one this line's
       recording key said last (kept in the state, so not across visits either); `{intro}` takes the intro of the
       thing the record's own bag draw landed on. A written line's words are kept by key, so a note pinned to the
       board reads the same after a reload (`written()`). A line's `pose` turns its speaker to that pose (the page's
       figure of that pose at the same mark, when it lists one); a line's `then` walks the speaker off once said, so
       he stands no more, though his mark stays held for the visit. Nothing is shown while a leave runs: he has gone.
       A line `on_tap` says nothing when its record fires; it waits, for the rest of the visit, for a tap on its
       speaker (`tap(as)`), and says a fresh variant at each. */
    var VERIFY = /\bverify\b/;
    var BAG_SET = /^set ([a-z_]+) = from bag ([a-z]+)$/;
    function bagIntro(rec) {
      var st = rec.starts || [];
      for (var i = 0; i < st.length; i++) {
        var m = BAG_SET.exec(st[i]);
        if (!m) continue;
        var things = bagDefs[m[2]] || [];
        for (var t = 0; t < things.length; t++) if (things[t].item === state.vars[m[1]] && things[t].intro) return things[t].intro;
      }
      return '';
    }

    /* `{password}`, `{last password}`, `{next password}`: a chain's week's words in a line, after `{intro}`. */
    function fillWords(text) {
      return text.replace(/\{((?:last |next )?[a-z]+)\}/g, function (all, n) {
        var v = /^(?:(?:last|next) )?([a-z]+)$/.exec(n);
        return wordDefs[v[1]] ? String(value(n)) : all;
      });
    }

    /* A line's pose turns one figure, the one who speaks: of two or three heralds sharing the speaker's `as`, the first
       turns and the rest keep listening (board req 77); one already in that pose is the speaker still, and none turns. */
    function turnTo(rec, speaker, pose) {
      var mine = visit.cast.filter(function (f) { return f.record === rec.id && f.as === speaker; });
      if (!mine.length || mine.some(function (f) { return f.pose === pose; })) return;
      for (var c = 0; c < visit.cast.length; c++) {
        var f = visit.cast[c];
        if (f !== mine[0]) continue;
        var to = (figures || []).filter(function (g) {
          return g.role === f.role && g.mark === f.mark && g.pose === pose && (f.role === 'pool' || g.name === f.name);
        })[0];
        visit.cast[c] = to ? Object.assign({}, to, { record: f.record, as: f.as }) : Object.assign({}, f, { pose: pose });
        if (!to) note(rec.id + ': no figure on this page for ' + (f.name || f.role) + ' "' + pose + '" at ' + f.mark + '; the pose is passed on');
      }
    }

    function sayLine(rec, line, end) {
      if (line.pose) turnTo(rec, line.speaker, line.pose);
      var held = VERIFY.test(line.canon || '') && !allLines;
      if (held) note(rec.id + ': a line held for the canon gate (' + line.canon + ')');
      var text = null, n = null, k = held ? 0 : (line.text || []).length;
      if (k) {
        var last = state.said[line.key];
        if (last && k > 1 && last.n < k) { n = Math.floor(Math.random() * (k - 1)); if (n >= last.n) n++; }
        else n = Math.floor(Math.random() * k);
        text = fillWords(line.text[n].replace('{intro}', bagIntro(rec)));
        state.said[line.key] = { n: n };
        if (line.medium === 'written') state.written[line.key] = { record: rec.id, key: line.key, hand: line.hand, at: line.at, text: text, day: today() };
      }
      var who = (rec.who || []).filter(function (w) { return w.as === line.speaker; })[0] || null;
      return { record: rec.id, end: end, key: line.key, variant: n, speaker: line.speaker || null, medium: line.medium,
               held: held, text: text, sound: held ? null : line.sound || null, hand: line.hand || null, at: line.at || null, style: line.style || null,
               pose: line.pose || null, then: line.then || null, who: who,
               /* the speaker's figures, the one who speaks (in the line's pose) first */
               figures: visit.cast.filter(function (f) { return f.record === rec.id && f.as === line.speaker; })
                                  .sort(function (a, b) { return (b.pose === line.pose) - (a.pose === line.pose); }) };
    }

    /* The lines of a record (end null) or of one of its ends (its index), said in order. */
    function speak(rec, list, end) {
      if (!list || !list.length) return;
      if (leaving || !visit) { note(rec.id + ': its lines are not shown, as he has gone'); return; }
      var out = [], off = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].on_tap) {
          var w = visit.waiting[list[i].speaker] = visit.waiting[list[i].speaker] || [];
          w.push({ record: rec.id, end: end, line: i });
          continue;
        }
        out.push(sayLine(rec, list[i], end));
        if (list[i].then) off.push(list[i].speaker);
      }
      if (out.length) showLines(out);
      if (off.length) visit.cast = visit.cast.filter(function (f) { return f.record !== rec.id || off.indexOf(f.as) < 0; });
    }

    /* A tap on a speaker whose line waits for one: a fresh variant of each. */
    function tapLines(name) {
      var w = visit.waiting[name];
      if (!w) return;
      var out = [];
      for (var i = 0; i < w.length; i++) {
        var rec = byId[w[i].record];
        if (!rec) continue;
        var list = w[i].end == null ? rec.lines : rec.ends[w[i].end].lines;
        out.push(sayLine(rec, list[w[i].line], w[i].end));
      }
      if (out.length) showLines(out);
      save(STATE_KEY, state);
    }

    function fire(rec) {
      var s = rec.starts || [];
      for (var i = 0; i < s.length; i++) effect(s[i], rec);
      /* What the visit keeps of the record is written before its cues, since a cue may end the visit there and
         then (the dormitory's lights out calls `leave()`; until 9 October 2026 this came after and threw). */
      var cast = castFor(rec, true);                /* a figure holds its mark for the visit; a trace or a voice does not */
      if (typeof cast === 'string') {               /* fired by hand (`fire(id)`) with no figure to stand: the marks only */
        cast = [];
        var who = rec.who || [];
        for (var w = 0; w < who.length; w++) if (who[w].mark && FIGURE.test(who[w].role)) visit.marks[who[w].mark] = true;
      }
      for (var cf = 0; cf < cast.length; cf++) { visit.marks[cast[cf].mark] = true; visit.cast.push(cast[cf]); }
      if (rec.tier === 'small') visit.small.push(rec.id);
      if (rec.tier === 'big') { state.lastBigDay = today(); state.lastBigVisit = state.visits; visit.bigDone = true; }
      if (rec.ends && rec.ends.length) state.open[rec.id] = { day: today() };
      speak(rec, rec.lines, null);                  /* the words with the cues, before a cue can end the visit */
      var where = value('place');
      /* show_at: a cue by the page he is on, or by the time of day (an owl lands before the letter by night, req 93) */
      var sh = (rec.show || []).concat((rec.show_at || {})[where] || [], (rec.show_at || {})[value('time')] || []);
      for (var j = 0; j < sh.length; j++) {
        if (cues[sh[j]]) cues[sh[j]]();
        else note(rec.id + ': this room has no cue "' + sh[j] + '"');
      }
      note('fired ' + rec.id);
      if (!visit) { draw(); return; }              /* a cue ended the visit: its leave has saved and ended what it ends */
      changed();
      checkEnds('change');
    }

    /* ---------- ends ---------- */

    /* A record ends at the first of its ends that holds; its `do` effects run, its lines are said and it is no
       longer open. `kind` is why the check runs: 'change' (a `when` end), 'leave', 'tap' with the thing
       tapped, or 'arrive' (a timeout in days). */
    function endMatches(end, kind, arg, opened) {
      if (end.when) return allHold(end.when);
      if (end.timeout) return kind === 'arrive' && today() - opened.day >= parseInt(end.timeout, 10);
      if (end.on === 'leave') return kind === 'leave';
      if (end.on === 'password') return kind === 'password';   /* the page calls password() when she lets him in */
      if (kind !== 'tap' || !end.on) return false;
      var m = /^tap any but (.+)$/.exec(end.on);
      if (m) return arg !== m[1];
      m = /^tap (.+)$/.exec(end.on);
      return !!m && arg === m[1];
    }

    /* Were this chain's records read on this page? (?event reads one chain's records only.) */
    function loadedChain(name) {
      if (only && name !== only.split('.')[0]) return false;
      for (var c = 0; c < chains.length; c++) if (chains[c].chain === name) return true;
      return false;
    }

    /* Every open record is checked in each pass, so a leave or a tap ends all the records it ends (until 9 October
       2026 a pass stopped at the first, and the rest were checked only for `when` ends after it, so of two records
       ending on leave one stayed open). A record open from a chain this page did not load is left for a page that
       loads it (until 9 October 2026 it was dropped, so the common room, loading two chains, lost Trevor's escape). */
    function checkEnds(kind, arg) {
      for (var pass = 0; pass < 20; pass++) {      /* an end's effects may let another record's `when` end hold */
        var ended = false;
        for (var id in state.open) {
          var rec = byId[id];
          if (!rec) {                                 /* a chain this page did not load keeps its records open for a page that does */
            if (loadedChain(id.split('.')[0])) delete state.open[id];   /* its chain is loaded and the record is gone from it */
            continue;
          }
          var ends = rec.ends || [];
          for (var j = 0; j < ends.length; j++) {
            if (!endMatches(ends[j], kind, arg, state.open[id])) continue;
            delete state.open[id];
            var d = ends[j]['do'] || [];
            for (var k = 0; k < d.length; k++) effect(d[k], rec);
            speak(rec, ends[j].lines, j);
            note('ended ' + rec.id + ' (end ' + j + ')');
            ended = true;
            break;
          }
        }
        if (!ended) return;
        save(STATE_KEY, state);
        draw();
        kind = 'change';                              /* after the first end, only `when` ends can follow */
      }
    }

    /* ---------- the draw ---------- */

    /* Each record's weight is worked once per ordering (until 9 October 2026, again at every step of the draw). */
    function weightedOrder(list) {
      var pool = list.slice(), weights = pool.map(weightOf), out = [];
      while (pool.length) {
        var total = 0, k;
        for (k = 0; k < pool.length; k++) total += weights[k];
        var x = Math.random() * total;
        for (k = 0; k < pool.length - 1; k++) { x -= weights[k]; if (x < 0) break; }
        out.push(pool.splice(k, 1)[0]);
        weights.splice(k, 1);
      }
      return out;
    }

    /* A record's weight, times its boost while the boost's conditions hold. */
    function weightOf(rec) {
      var w = rec.weight || 1;
      if (rec.boost && allHold(rec.boost.when)) w *= rec.boost.times || 1;
      return w;
    }

    /* What a record needs that is not built: a figure on a page that draws none (a trace or a voice has no body to
       draw, so it fires and its lines are noted). */
    function supported(rec) {
      var who = rec.who || [];
      if (!figures) for (var w = 0; w < who.length; w++) if (FIGURE.test(who[w].role)) return 'figures on marks';
      return null;
    }

    /* Records fire one at a time, each seeing the state the last left. The eligible set is fixed when the moment
       starts; each is checked again just before it fires. At most one small touch fires per moment. Of a one_of
       group's eligible records, one is drawn by weight and the rest are dropped (a ?event record wins its group). */
    function moment(name) {
      if (!visit) return;
      var eligible = [], groups = {};
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.moment !== name || !allHold(r.when)) continue;
        var missing = supported(r);
        if (missing) { note(r.id + ' skipped: the runtime does not yet do ' + missing); continue; }
        var uncast = castFor(r, false);
        if (uncast) { note(r.id + ' not drawn: ' + uncast); continue; }
        if (r.tier === 'small' && r.id !== only && (!visit.smallOn || state.lastSmall.indexOf(r.id) >= 0)) continue;
        if (r.tier === 'big' && r.id !== only && (!visit.bigOn || visit.bigDone)) continue;
        if (state.open[r.id]) continue;      /* still open from an earlier moment: it does not start again */
        eligible.push(r);
        if (r.one_of) (groups[r.one_of] = groups[r.one_of] || []).push(r);
      }
      for (var g in groups) {
        if (groups[g].length < 2) continue;
        var pick = null;
        for (var k = 0; k < groups[g].length; k++) if (groups[g][k].id === only) pick = groups[g][k];
        if (!pick) pick = weightedOrder(groups[g])[0];
        eligible = eligible.filter(function (r) { return r.one_of !== g || r === pick; });
      }
      var order = weightedOrder(eligible), smallDone = false;
      for (var j = 0; j < order.length; j++) {
        var rec = order[j];
        if (rec.tier === 'small' && smallDone) continue;
        if (rec.tier === 'big' && visit.bigDone && rec.id !== only) continue;
        if (!allHold(rec.when) || castFor(rec, false)) continue;   /* one fired before it may hold its mark now */
        fire(rec);
        if (!visit) return;                          /* its cue ended the visit */
        if (rec.tier === 'small') smallDone = true;
      }
    }

    /* ---------- a visit ---------- */

    /* A visit is one sitting at the iPad, across every page he walks to (Godric, 9 October 2026: the trip through the
       hole is moving inside one visit, not leaving). It opens with `arrive` on the page it opens on and ends with
       `leave` when he really stops: the page closed or dropped without a trip, or the iPad put away five minutes.
       A trip is a page load, so a page cannot tell a trip from a close as it goes; `pagehide` keeps the visit and
       the time he went, and the next page to load decides. Opened with `?from=` naming the page the visit was on,
       soon after, it is a crossing (`cross`): the visit carries on. Otherwise the kept visit's leave runs first,
       on the clock of the moment he went, and a new visit opens. */

    function freshWaits() {
      var waits = [], seen = {};
      for (var i = 0; i < records.length; i++) {
        var m = WAIT.exec(records[i].moment || '');
        if (!m || m[1] !== 'wait' || seen[records[i].moment]) continue;
        seen[records[i].moment] = true;
        var secs = waitOverride != null ? waitOverride : between(+m[2], +m[3]);
        waits.push({ name: records[i].moment, left: secs });
      }
      return waits;
    }

    /* `quiet N-M s`: a span drawn once a visit for each, counted on each page from its load or his last tap there;
       each fires once a quiet stretch and is ready again after his next tap. */
    function quietSpans() {
      var out = {};
      for (var i = 0; i < records.length; i++) {
        var m = WAIT.exec(records[i].moment || '');
        if (!m || m[1] !== 'quiet' || out[records[i].moment] != null) continue;
        out[records[i].moment] = waitOverride != null ? waitOverride : between(+m[2], +m[3]);
      }
      return out;
    }

    /* What of a visit outlives a page: the draws, what fired, the marks taken and the pages reached. A tap's
       memory and the waits are the page's own; sound wakes again at the next page's first tap. */
    function keep() {
      if (!visit) return;
      state.kept = { id: visit.id, smallOn: visit.smallOn, bigOn: visit.bigOn, bigDone: visit.bigDone,
                     small: visit.small, marks: visit.marks, cast: visit.cast, pages: visit.pages, played: visit.played,
                     warned: visit.warned, lightsOut: visit.lightsOut, waiting: visit.waiting, quiet: visit.quiet };
    }
    function restore() {
      var k = state.kept || {};
      return { id: k.id, smallOn: !!k.smallOn, bigOn: !!k.bigOn, bigDone: k.bigDone !== false, small: k.small || [],
               marks: k.marks || {}, cast: k.cast || [], pages: k.pages || [state.visitPlace], waits: [], lastTap: {}, tapped: false,
               played: k.played || 0, warned: !!k.warned, lightsOut: !!k.lightsOut, waiting: k.waiting || {},
               quiet: k.quiet || quietSpans(), idle: 0, quietDone: {}, listen: null };
    }

    /* A new visit on this page; one still open runs its leave first. */
    function arrive() {
      if (state.visitOpen) leave();
      state.visits++;
      state.visitOpen = true;
      state.visitPlace = place;
      var bigOn = Math.random() < BIG_ODDS && state.lastBigDay !== today() && state.lastBigVisit !== state.visits - 1;
      visit = { id: state.visits, smallOn: Math.random() < SMALL_ODDS, bigOn: bigOn, bigDone: false, small: [],
                waits: freshWaits(), lastTap: {}, tapped: false, marks: {}, cast: [], pages: [place],
                played: 0, warned: false, lightsOut: false, waiting: {}, quiet: quietSpans(), idle: 0, quietDone: {},
                listen: null };
      save(STATE_KEY, state);
      checkEnds('arrive');
      moment('arrive');
      draw();
    }

    /* The visit carries on onto this page. `arrive` comes the first time a visit reaches a page, so a page's own
       draws (the armour's, the sticks') happen once a visit; then `outside` coming out of the hole into the
       corridor and `enter` coming back in by it, every time. A crossing between other pages (the dormitory's
       stair) has neither word. */
    function cross() {
      var was = state.visitPlace;
      visit = restore();
      visit.waits = freshWaits();
      state.visitPlace = place;
      state.leftAt = null;
      state.kept = null;
      save(STATE_KEY, state);
      checkEnds('arrive');
      if (visit.pages.indexOf(place) < 0) { visit.pages.push(place); moment('arrive'); }
      if (was === 'common room' && place === 'corridor') moment('outside');
      if (was === 'corridor' && place === 'common room') moment('enter');
      draw();
    }

    /* The page that loads decides what the last one's going was. `?from=` names the page the visit was on, as the
       pages' own trips write it: `room` (the common room), `corridor`, `dormitory`, with `&bedtime` after it on the
       lights-out trip (`dormitory.html?from=room&bedtime`, `?from=corridor&bedtime`). `?from=sleep`, the waking, is
       always a new visit (Godric, 9 October 2026, 7.32 am), as is any word that names no page. A crossing needs the
       page it names to have run this runtime: the dormitory's stair carries the visit once that page starts it with
       place `dormitory`, and until then a trip down from it is a new visit. */
    var FROM = { room: 'common room', corridor: 'corridor', dormitory: 'dormitory' };
    function begin() {
      var fromPlace = FROM[params.get('from')];
      var soon = state.leftAt != null && Date.now() - state.leftAt < CROSS_S * 1000;
      if (state.visitOpen && fromPlace && fromPlace === state.visitPlace && soon && state.kept) cross();
      else arrive();
    }

    /* `after tap X N-M s`: a delay drawn fresh at each tap on X, counted as the waits are, on this page only (the
       painting opposite the hole, 9 October 2026: she comes home a while after he opened the hole on her). */
    var AFTER_TAP = /^after tap (.+) (\d+)-(\d+) s$/;
    function afterTap(name) {
      var seen = {};
      for (var i = 0; i < records.length; i++) {
        var mo = records[i].moment || '', m = AFTER_TAP.exec(mo);
        if (!m || m[1] !== name || seen[mo]) continue;
        seen[mo] = true;
        visit.waits.push({ name: mo, left: waitOverride != null ? waitOverride : between(+m[2], +m[3]) });
      }
    }

    /* A tap on a named thing in the room. The first tap on a page is also `first tap` (sound wakes then). */
    function tap(name) {
      if (!visit) return;
      name = targets[name] || name;
      if (!visit.tapped) { visit.tapped = true; moment('first tap'); }
      if (!visit) return;
      checkEnds('tap', name);
      tapping = name;
      moment('tap ' + name);
      tapping = null;
      if (!visit) return;
      tapLines(name);
      visit.lastTap[name] = Date.now();
      visit.idle = 0;
      visit.quietDone = {};
      afterTap(name);
      openEar(name);
    }

    /* ---------- the ear ---------- */

    /* A tap opens the ear only on a thing a `say` record would hear just then (its `when` holding with that thing
       listening), and only inside the tap, as iOS asks. A new tap closes the last tap's ear. The thing listens while
       its ear is open and a beat after (a final guess can land as the ear closes); with no ear, for a few seconds. */
    var SAY = /^say (.+)$/;
    var LISTEN_AFTER_S = 2, LISTEN_BARE_S = 5;
    function listensFor(name) {
      var was = visit.listen, any = false;
      visit.listen = { name: name, open: true, until: 0 };
      for (var i = 0; i < records.length && !any; i++) {
        var r = records[i];
        if (SAY.test(r.moment || '') && (r.when || []).indexOf('listening = ' + name) >= 0 && allHold(r.when)) any = true;
      }
      visit.listen = was;
      return any;
    }
    function openEar(name) {
      if (earSession) { earSession.stop(); earSession = null; }
      if (!visit) return;
      var mine = visit.listen = { name: name, open: false, until: Date.now() + LISTEN_BARE_S * 1000, matched: false };
      if (!listensFor(name)) return;
      if (!ear || !ear.available()) { note('the ' + name + ' listens, but there is no ear on this page'); return; }
      mine.open = true;
      var session = ear.listen({
        onHeard: function (guesses) { if (visit && visit.listen === mine) heard(guesses); },
        onEnd: function (why) {
          mine.open = false;
          mine.until = Date.now() + LISTEN_AFTER_S * 1000;
          if (earSession === session) earSession = null;
          note('the ear closed: ' + why);
          /* Nothing near enough was heard: once the beat a late guess may land in has passed, `unheard <thing>`
             (the Fat Lady asks again, blaming her ears). Not when a new tap took the ear, or he has gone. */
          setTimeout(function () {
            if (visit && visit.listen === mine && !mine.matched) moment('unheard ' + name);
          }, LISTEN_AFTER_S * 1000);
        }
      });
      earSession = session;
    }

    /* Guesses from the ear (or a page's own): the `say` moment whose words come nearest, if near enough, once a tap. */
    function heard(guesses) {
      if (!visit || (visit.listen && visit.listen.matched)) return;
      var match = ear && ear.match ? ear.match : function (a, b) { return String(a).toLowerCase().trim() === b ? 1 : 0; };
      var loose = ear && ear.LOOSE != null ? ear.LOOSE : 1;
      var best = null, score = 0;
      for (var i = 0; i < records.length; i++) {
        var m = SAY.exec(records[i].moment || '');
        if (!m || !allHold(records[i].when)) continue;
        /* `say {password}` hears the week's word as it stands today; the braces are never words a boy says */
        var words = /^\{.+\}$/.test(m[1]) ? fillWords(m[1]) : m[1];
        if (/^\{.*\}$/.test(words) || words === 'none') continue;
        for (var g = 0; g < (guesses || []).length; g++) {
          var text = typeof guesses[g] === 'string' ? guesses[g] : guesses[g].text;
          var sc = match(text, words);
          if (sc > score) { score = sc; best = m[1]; }
        }
      }
      if (!best || score < loose) return;
      if (visit.listen) visit.listen.matched = true;
      if (earSession) earSession.stop();
      note('heard "' + best + '" (' + Math.round(score * 100) + '%)');
      moment('say ' + best);
    }

    /* The visit ends. Run on the page it ended on, or at the next page's load for a visit kept at its going (the
       iPad asleep, Safari dropping the page, a close): then it runs as the kept visit, with `place` as the page it
       was on and the clock at the time he went. One kept by an older runtime, with nothing saved, runs bare with
       the draws off. */
    function leave() {
      if (!visit && !state.visitOpen) return;
      leaving = true;
      if (!visit) {
        visit = restore();                         /* with nothing kept, a bare visit with the draws off */
        visit.tapped = true;
        if (state.leftAt != null) clock = state.leftAt;
      }
      checkEnds('leave');
      moment('leave');
      if (earSession) { earSession.stop(); earSession = null; }
      state.lastSmall = visit.small;
      clock = null;
      leaving = false;
      state.visitOpen = false;
      state.leftAt = null;
      state.kept = null;
      visit = null;
      save(STATE_KEY, state);
      draw();
    }

    /* Called from the room's frame loop, so a wait counts only while the page is drawn: nothing fires while
       the iPad sleeps. */
    function tick(dt) {
      if (!visit) return;
      for (var i = 0; i < visit.waits.length; i++) {
        var w = visit.waits[i];
        if (w.left == null) continue;
        w.left -= dt;
        if (w.left <= 0) { w.left = null; moment(w.name); if (!visit) return; }
      }
      visit.idle += dt;
      for (var q in visit.quiet) {
        if (visit.quietDone[q] || visit.idle < visit.quiet[q]) continue;
        visit.quietDone[q] = true;
        moment(q);
        if (!visit) return;
      }
      bedtimeTick(dt);
    }

    /* The bedtime counts the visit's own time, on every page it reaches and only while a page is drawn: `bedtime
       warning` ten minutes before the length a parent set (at once for a length of ten or less), `lights out` at
       it, each once a visit. After lights out the page carries him up to bed and ends the visit itself. */
    function bedtimeTick(dt) {
      if (!(bedtimeMin > 0) || visit.lightsOut) return;
      visit.played += dt;
      if (!visit.warned && visit.played >= Math.max(0, bedtimeMin - 10) * 60) { visit.warned = true; moment('bedtime warning'); }
      if (!visit) return;
      if (visit && !visit.lightsOut && visit.played >= bedtimeMin * 60) { visit.lightsOut = true; moment('lights out'); }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { hiddenAt = Date.now(); keep(); save(STATE_KEY, state); return; }
      if (hiddenAt && Date.now() - hiddenAt > AWAY_S * 1000 && (visit || state.visitOpen)) {   /* never reopens a visit its page ended */
        clock = hiddenAt;                          /* the leave runs at the time he put it down (until 9 October 2026, at his return) */
        leave(); arrive();
      } else if (state.kept) { state.kept = null; save(STATE_KEY, state); }   /* back soon: the snapshot taken at hiding is stale */
      hiddenAt = 0;
    });
    /* Going: keep the visit and the time, and let the next page decide. The visit stays in memory, so a page Safari
       brings back from its back-forward cache carries on as it was if no other page has taken the visit since. */
    window.addEventListener('pagehide', function () {
      if (!visit) return;
      keep();
      state.leftAt = Date.now();
      save(STATE_KEY, state);
    });
    window.addEventListener('pageshow', function (e) {   /* Safari's back-forward cache */
      if (!e.persisted) return;
      var saved = load(STATE_KEY);
      if (saved) state = saved;
      if (visit && state.visitOpen && state.kept && state.kept.id === visit.id && state.visitPlace === place) {
        state.leftAt = null; state.kept = null; save(STATE_KEY, state);
        return;
      }
      visit = null;
      arrive();
    });

    /* ---------- loading ---------- */

    /* `chains: 'all'` reads every chain from events/index.json, which `py events.py` keeps level with the folder:
       a visit's leave runs only over the chains its page has loaded, so every page loads every chain, and the
       records' `place` keeps each to its own page. */
    var names = [];
    function readJson(path) {
      return fetch(path, { cache: 'no-cache' })
        .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
        .catch(function (e) { note('could not read ' + path + ' (' + e.message + ')'); return null; });
    }
    var listed = opts.chains === 'all'
      ? readJson('events/index.json').then(function (ix) { return (ix && ix.chains) || []; })
      : Promise.resolve(opts.chains || []);
    var ready = listed.then(function (list) {
      names = list;
      return Promise.all(names.map(function (n) { return readJson('events/' + n + '.json'); }));
    }).then(function (files) {
      for (var f = 0; f < files.length; f++) {
        if (!files[f]) continue;
        chains.push(files[f]);
        var tg = files[f].targets || {};
        for (var t in tg) targets[t] = tg[t];
        var bg = files[f].bags || {};
        for (var b in bg) bagDefs[b] = bg[b];
        var wd = files[f].words || {};
        for (var w in wd) wordDefs[w] = wd[w];
        var mk = files[f].marks || {};
        for (var mn in mk) markSets[mn] = (mk[mn] || []).slice();
        var rs = files[f].records || [];
        JSON.stringify(rs).replace(/"stamp ([a-z_]+)/g, function (s, n) { stampNames[n] = true; return s; });
        for (var i = 0; i < rs.length; i++) {
          if (only && files[f].chain !== only.split('.')[0]) continue;    /* ?event: only that record's chain */
          records.push(rs[i]);
          byId[rs[i].id] = rs[i];
        }
      }
      if (only && !byId[only]) note('?event=' + only + ' names no record in ' + names.join(', '));
      /* A chain's first visit runs the first time a page loads that chain on this iPad, whichever page it is (until
         9 October 2026 it ran only on the castle's very first load, over that page's chains, so a castle first
         opened in the common room never set Trevor loose). A state from before this keeps a chain as begun when
         its first visit's `set` names are already in the state, so nothing begun runs twice. */
      for (var c = 0; c < chains.length; c++) {
        var cn = chains[c].chain;
        if (state.started[cn] || !loadedChain(cn)) continue;
        var fv = chains[c].first_visit || [], begun = false;
        for (var k = 0; k < fv.length && oldStarts; k++) {
          var sets = ((byId[fv[k]] || {}).starts || []).join('|');
          sets.replace(/(?:^|\|)set ([a-z_]+) =/g, function (x, n) { if (n in state.vars) begun = true; return x; });
        }
        for (k = 0; k < fv.length && !begun; k++) {
          var r = byId[fv[k]];
          if (r) { var st = r.starts || []; for (var e = 0; e < st.length; e++) effect(st[e], r); }
        }
        state.started[cn] = true;
      }
      save(STATE_KEY, state);
      draw();
      begin();
    });

    return {
      ready: ready,
      tick: tick,
      moment: moment,
      tap: tap,
      password: function () { if (visit) checkEnds('password'); },   /* the password given and the Fat Lady swung open */
      /* A chain's week's words as they stand today (the parents' page shows the password): last, now and next. */
      words: function (name) {
        name = name || 'password';
        return wordDefs[name] ? { last: weekWord(name, -1), now: weekWord(name, 0), next: weekWord(name, 1) } : null;
      },
      arrive: arrive,
      leave: leave,
      /* The castle's time of day (morning, day, evening, night), `?time=` honoured, so a page lights itself by the
         same dawn and dusk the records read and keeps no copy of them (req 87, the dormitory, 10 October 2026). It
         reads now, ready or not; only inside a deferred leave does it read the time he went, and nothing is drawn
         then. A page that wants to follow dusk while he plays asks again from its frame loop. */
      time: timeOfDay,
      /* The real moon now (req 95): { phase, age (days since new), lit (0 to 1), waxing, up, altitude (degrees), height
         (0 to 1, of the way overhead), light (lit while up, else 0) }, `?moon=` honoured, so every room shows one moon. */
      moon: moonNow,
      cues: shownCues,
      fire: function (id) { if (byId[id] && visit) fire(byId[id]); },
      state: function () { return state; },
      log: function () { return state.log.slice(); },
      settings: function () { return settings; },
      visit: function () { return visit; },
      heard: heard,                                   /* guesses a page heard itself, as strings or { text } */
      listening: function () { return value('listening'); },
      /* The written lines' words as last drawn, by recording key, newest first: the room draws a pinned note from them. */
      written: function () {
        var out = [];
        for (var k in state.written) out.push(state.written[k]);
        return out.sort(function (a, b) { return b.day - a.day; });
      }
    };
  }

  window.CastleEvents = { start: start, dayNumber: dayNumber, week: function (d) { return weekNumber(d || new Date()); } };
})();
