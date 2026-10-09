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
   student, a canon person, a ghost) is still skipped with a note; a trace or a voice fires, and its lines, text
   or sound, are noted as waiting.
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
   Not yet: lines, `mark next to X`, and the moments quiet and say; a record that needs one of them is skipped
   with a note in the console, never thrown.

   Test links: ?event=<id> loads only that record's chain and lets the record skip the draw, so it fires whenever
   it holds and the rest of its chain follows it (in a one_of group it wins the group); ?wait=N sets every wait
   to N s; ?time=night (or morning, day, evening) overrides the clock; ?fresh starts this iPad's castle afresh. */
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

  function note(msg) { if (window.console) console.info('[castle-events] ' + msg); }
  function between(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* A day is a whole local day counted from 1970, so dates compare as numbers and survive a reload. */
  function dayNumber(d) { return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / DAY_MS); }

  function load(key) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function save(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* private mode: the castle forgets, kindly */ }
  }

  function freshState() {
    return { v: 1, vars: {}, stamps: {}, slot: null, visits: 0, visitOpen: false, lastSmall: [], bags: {}, log: [],
             open: {}, started: {}, lastBigDay: null, lastBigVisit: null, visitPlace: null, leftAt: null, kept: null };
  }

  function start(opts) {
    var params = new URLSearchParams(location.search);
    var only = params.get('event');
    var waitOverride = params.has('wait') ? Math.max(0, +params.get('wait') || 0) : null;
    var timeOverride = /^(morning|day|evening|night)$/.test(params.get('time') || '') ? params.get('time') : null;
    if (params.has('fresh')) { try { localStorage.removeItem(STATE_KEY); } catch (e) {} }

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
    var place = opts.place || 'common room';     /* the page this runtime runs on: `common room` or `corridor` */
    var markSets = {};                           /* named sets of the page's marks a draw picks from: the page's `opts.marks`, then each chain's `marks` */
    for (var ms in (opts.marks || {})) markSets[ms] = (opts.marks[ms] || []).slice();
    var bagDefs = {};                            /* each chain's bags, by name */
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

    function builtin(name) {
      var now = nowDate();
      if (builtins[name]) return builtins[name]();
      switch (name) {
        case 'today': return today();
        case 'time': return timeOfDay();
        case 'place': return (leaving && state.visitPlace) || place;
        case 'at': return 'none';                 /* a page with stops answers this itself */
        case 'hour': return now.getHours();
        case 'weekday': return WEEKDAYS[now.getDay()];
        case 'date': return ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        case 'slot': return state.slot ? 'taken' : 'free';
        case 'speech': return settings.speech || 'on';
        case 'bedtime': return bedtimeMin > 0 ? 'set' : 'off';
        case 'visits since big': return state.lastBigVisit == null ? Infinity : state.visits - state.lastBigVisit;
        case 'seconds since last tap':      /* since his previous tap on the same thing; never tapped reads as long ago */
          if (!tapping || !visit || visit.lastTap[tapping] == null) return Infinity;
          return (Date.now() - visit.lastTap[tapping]) / 1000;
      }
      return undefined;
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

    /* `mark Y, not last`: one of the marks named Y, never the one X is at (unset reads as the first, the base). */
    function drawMark(spec, current, rec) {
      var m = /^([a-z]+)(, not last)?$/.exec(spec);
      if (!m) { note(rec.id + ': the draw "mark ' + spec + '" waits on the page\'s mark neighbours'); return undefined; }
      var set = markSets[m[1]];
      if (!set || !set.length) { note(rec.id + ': no marks named ' + m[1]); return undefined; }
      var at = current == null ? set[0] : current;
      var pool = m[2] ? set.filter(function (n) { return n !== at; }) : set;
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
      var where = value('place');
      var sh = (rec.show || []).concat((rec.show_at || {})[where] || []);   /* show_at: a cue by the page he is on */
      for (var j = 0; j < sh.length; j++) {
        if (cues[sh[j]]) cues[sh[j]]();
        else note(rec.id + ': this room has no cue "' + sh[j] + '"');
      }
      if (rec.lines && rec.lines.length) note(rec.id + ': its lines wait for lines');
      note('fired ' + rec.id);
      if (!visit) { draw(); return; }              /* a cue ended the visit: its leave has saved and ended what it ends */
      changed();
      checkEnds('change');
    }

    /* ---------- ends ---------- */

    /* A record ends at the first of its ends that holds; its `do` effects run and it is no longer open. An end's
       lines wait for lines. `kind` is why the check runs: 'change' (a `when` end), 'leave', 'tap' with the thing
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
            if (ends[j].lines && ends[j].lines.length) note(rec.id + ': an end\'s lines wait for lines');
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
       draw, so it fires and its lines are noted), a moment the page cannot raise, or a mark draw that needs
       neighbours. */
    function supported(rec) {
      var who = rec.who || [];
      if (!figures) for (var w = 0; w < who.length; w++) if (FIGURE.test(who[w].role)) return 'figures on marks';
      if (/^(quiet|say)\b/.test(rec.moment || '')) return 'the moment ' + rec.moment;
      if (/mark next to /.test((rec.starts || []).join('|'))) return 'the page\'s mark neighbours';
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

    /* What of a visit outlives a page: the draws, what fired, the marks taken and the pages reached. A tap's
       memory and the waits are the page's own; sound wakes again at the next page's first tap. */
    function keep() {
      if (!visit) return;
      state.kept = { id: visit.id, smallOn: visit.smallOn, bigOn: visit.bigOn, bigDone: visit.bigDone,
                     small: visit.small, marks: visit.marks, cast: visit.cast, pages: visit.pages, played: visit.played,
                     warned: visit.warned, lightsOut: visit.lightsOut };
    }
    function restore() {
      var k = state.kept || {};
      return { id: k.id, smallOn: !!k.smallOn, bigOn: !!k.bigOn, bigDone: k.bigDone !== false, small: k.small || [],
               marks: k.marks || {}, cast: k.cast || [], pages: k.pages || [state.visitPlace], waits: [], lastTap: {}, tapped: false,
               played: k.played || 0, warned: !!k.warned, lightsOut: !!k.lightsOut };
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
                played: 0, warned: false, lightsOut: false };
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
      if (visit) visit.lastTap[name] = Date.now();
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
      arrive: arrive,
      leave: leave,
      cues: shownCues,
      fire: function (id) { if (byId[id] && visit) fire(byId[id]); },
      state: function () { return state; },
      log: function () { return state.log.slice(); },
      settings: function () { return settings; },
      visit: function () { return visit; }
    };
  }

  window.CastleEvents = { start: start, dayNumber: dayNumber };
})();
