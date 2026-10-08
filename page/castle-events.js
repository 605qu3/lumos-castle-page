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
   Not yet: casts and marks, lines, bags, one_of, and the moments quiet, enter, outside and say; a record that
   needs one of them is skipped with a note in the console, never thrown.

   Test links: ?event=<id> loads that record alone and fires it whenever it holds; ?wait=N sets every wait to N s;
   ?fresh starts this iPad's castle afresh. */
(function () {
  'use strict';

  var STATE_KEY = 'lumos.castle.state.v1';
  var SETTINGS_KEY = 'lumos.castle.settings.v1';
  var LOG_LINES = 50;
  var SMALL_ODDS = 0.8;          /* small touches on most visits: about four in five */
  var BIG_ODDS = 1 / 3;          /* big events about one visit in three, at most one a day, never two visits running */
  var AWAY_S = 5 * 60;           /* hidden this long and coming back is a new visit */
  var DAY_MS = 86400000;
  var WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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
             open: {}, lastBigDay: null, lastBigVisit: null };
  }

  function start(opts) {
    var params = new URLSearchParams(location.search);
    var only = params.get('event');
    var waitOverride = params.has('wait') ? Math.max(0, +params.get('wait') || 0) : null;
    if (params.has('fresh')) { try { localStorage.removeItem(STATE_KEY); } catch (e) {} }

    var cues = opts.cues || {};
    var builtins = opts.builtins || {};
    var drawRoom = opts.drawRoom || function () {};
    var state = load(STATE_KEY);
    var fresh = !state || state.v !== 1;
    if (fresh) state = freshState();
    state.open = state.open || {};        /* records still open, by id: the day each fired, for its timeout */
    var settings = load(SETTINGS_KEY) || { leans: [], speech: 'on' };

    var chains = [];          /* the loaded files */
    var records = [];         /* every record, in file order */
    var byId = {};
    var stampNames = {};      /* every name a file stamps, so a condition knows it is a date */
    var visit = null;        /* this visit: its moments still to come and what fired */
    var hiddenAt = 0;
    var targets = {};         /* a tap's name mapped to another, from the chains' `targets` */
    var tapping = null;       /* the thing tapped, while its moment runs */

    /* ---------- reading state ---------- */

    function today() { return dayNumber(new Date()); }

    function builtin(name) {
      var now = new Date();
      if (builtins[name]) return builtins[name]();
      switch (name) {
        case 'today': return today();
        case 'hour': return now.getHours();
        case 'weekday': return WEEKDAYS[now.getDay()];
        case 'date': return ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        case 'slot': return state.slot ? 'taken' : 'free';
        case 'speech': return settings.speech || 'on';
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
      text = text.replace('{day}', WEEKDAYS[new Date().getDay()].replace(/^./, function (c) { return c.toUpperCase(); }));
      state.log.push({ day: today(), text: text });
      if (state.log.length > LOG_LINES) state.log.splice(0, state.log.length - LOG_LINES);
    }

    function effect(text, rec) {
      for (var i = 0; i < EFFECTS.length; i++) {
        var m = EFFECTS[i][1].exec(text);
        if (!m) continue;
        switch (EFFECTS[i][0]) {
          case 'set':
            if (/^(mark|from bag) /.test(m[2])) { note(rec.id + ': ' + text + ' waits on marks and bags'); return; }
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

    function changed() {
      save(STATE_KEY, state);
      drawRoom(shownCues());
    }

    function fire(rec) {
      var s = rec.starts || [];
      for (var i = 0; i < s.length; i++) effect(s[i], rec);
      var sh = rec.show || [];
      for (var j = 0; j < sh.length; j++) {
        if (cues[sh[j]]) cues[sh[j]]();
        else note(rec.id + ': this room has no cue "' + sh[j] + '"');
      }
      if (rec.tier === 'small') visit.small.push(rec.id);
      if (rec.tier === 'big') { state.lastBigDay = today(); state.lastBigVisit = state.visits; visit.bigDone = true; }
      if (rec.ends && rec.ends.length) state.open[rec.id] = { day: today() };
      changed();
      note('fired ' + rec.id);
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
      if (kind !== 'tap' || !end.on) return false;
      var m = /^tap any but (.+)$/.exec(end.on);
      if (m) return arg !== m[1];
      m = /^tap (.+)$/.exec(end.on);
      return !!m && arg === m[1];
    }

    function checkEnds(kind, arg) {
      for (var pass = 0; pass < 20; pass++) {      /* an end's effects may let another record's `when` end hold */
        var ended = false;
        for (var id in state.open) {
          var rec = byId[id];
          if (!rec) { delete state.open[id]; continue; }
          var ends = rec.ends || [];
          for (var j = 0; j < ends.length && !ended; j++) {
            if (!endMatches(ends[j], kind, arg, state.open[id])) continue;
            delete state.open[id];
            var d = ends[j]['do'] || [];
            for (var k = 0; k < d.length; k++) effect(d[k], rec);
            if (ends[j].lines && ends[j].lines.length) note(rec.id + ': an end\'s lines wait for lines');
            note('ended ' + rec.id + ' (end ' + j + ')');
            ended = true;
          }
          if (ended) break;
        }
        if (!ended) return;
        save(STATE_KEY, state);
        drawRoom(shownCues());
        kind = 'change';                              /* after the first end, only `when` ends can follow */
      }
    }

    /* ---------- the draw ---------- */

    function weightedOrder(list) {
      var pool = list.slice(), out = [];
      while (pool.length) {
        var total = 0, k;
        for (k = 0; k < pool.length; k++) total += weightOf(pool[k]);
        var x = Math.random() * total;
        for (k = 0; k < pool.length - 1; k++) { x -= weightOf(pool[k]); if (x < 0) break; }
        out.push(pool.splice(k, 1)[0]);
      }
      return out;
    }

    /* A record's weight, times its boost while the boost's conditions hold. */
    function weightOf(rec) {
      var w = rec.weight || 1;
      if (rec.boost && allHold(rec.boost.when)) w *= rec.boost.times || 1;
      return w;
    }

    function supported(rec) {
      if (rec.who && rec.who.length) return 'casts and marks';
      if (rec.lines && rec.lines.length) return 'lines';
      if (rec.one_of) return 'one_of';
      if (/^(quiet|enter|outside|say)\b/.test(rec.moment || '')) return 'the moment ' + rec.moment;
      return null;
    }

    /* Records fire one at a time, each seeing the state the last left. The eligible set is fixed when the moment
       starts; each is checked again just before it fires. At most one small touch fires per moment. */
    function moment(name) {
      if (!visit) return;
      var eligible = [];
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.moment !== name || !allHold(r.when)) continue;
        var missing = supported(r);
        if (missing) { note(r.id + ' skipped: the runtime does not yet do ' + missing); continue; }
        if (r.tier === 'small' && !only && (!visit.smallOn || state.lastSmall.indexOf(r.id) >= 0)) continue;
        if (r.tier === 'big' && !only && (!visit.bigOn || visit.bigDone)) continue;
        if (state.open[r.id]) continue;      /* still open from an earlier moment: it does not start again */
        eligible.push(r);
      }
      var order = weightedOrder(eligible), smallDone = false;
      for (var j = 0; j < order.length; j++) {
        var rec = order[j];
        if (rec.tier === 'small' && smallDone) continue;
        if (rec.tier === 'big' && visit.bigDone && !only) continue;
        if (!allHold(rec.when)) continue;
        fire(rec);
        if (rec.tier === 'small') smallDone = true;
      }
    }

    /* ---------- a visit ---------- */

    function arrive() {
      if (state.visitOpen) leave();        /* a visit that never left runs its leave records now, before anything */
      state.visits++;
      state.visitOpen = true;
      var bigOn = Math.random() < BIG_ODDS && state.lastBigDay !== today() && state.lastBigVisit !== state.visits - 1;
      visit = { smallOn: Math.random() < SMALL_ODDS, bigOn: bigOn, bigDone: false, small: [], waits: [],
                lastTap: {}, tapped: false };
      var seen = {};
      for (var i = 0; i < records.length; i++) {
        var m = WAIT.exec(records[i].moment || '');
        if (!m || m[1] !== 'wait' || seen[records[i].moment]) continue;
        seen[records[i].moment] = true;
        var secs = waitOverride != null ? waitOverride : between(+m[2], +m[3]);
        visit.waits.push({ name: records[i].moment, left: secs });
      }
      save(STATE_KEY, state);
      checkEnds('arrive');
      moment('arrive');
    }

    /* A tap on a named thing in the room. The first tap of a visit is also `first tap` (sound wakes then). */
    function tap(name) {
      if (!visit) return;
      name = targets[name] || name;
      if (!visit.tapped) { visit.tapped = true; moment('first tap'); }
      checkEnds('tap', name);
      tapping = name;
      moment('tap ' + name);
      tapping = null;
      visit.lastTap[name] = Date.now();
    }

    function leave() {
      if (visit) checkEnds('leave');
      if (visit) moment('leave');
      if (visit) state.lastSmall = visit.small;
      state.visitOpen = false;
      visit = null;
      save(STATE_KEY, state);
    }

    /* Called from the room's frame loop, so a wait counts only while the page is drawn: nothing fires while
       the iPad sleeps. */
    function tick(dt) {
      if (!visit) return;
      for (var i = 0; i < visit.waits.length; i++) {
        var w = visit.waits[i];
        if (w.left == null) continue;
        w.left -= dt;
        if (w.left <= 0) { w.left = null; moment(w.name); }
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { hiddenAt = Date.now(); save(STATE_KEY, state); return; }
      if (hiddenAt && Date.now() - hiddenAt > AWAY_S * 1000) { leave(); arrive(); }
      hiddenAt = 0;
    });
    window.addEventListener('pagehide', function () { leave(); });
    window.addEventListener('pageshow', function (e) { if (e.persisted && !visit) arrive(); });   /* Safari's back-forward cache */

    /* ---------- loading ---------- */

    var names = opts.chains || [];
    var ready = Promise.all(names.map(function (n) {
      return fetch('events/' + n + '.json', { cache: 'no-cache' })
        .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
        .catch(function (e) { note('could not read events/' + n + '.json (' + e.message + ')'); return null; });
    })).then(function (files) {
      for (var f = 0; f < files.length; f++) {
        if (!files[f]) continue;
        chains.push(files[f]);
        var tg = files[f].targets || {};
        for (var t in tg) targets[t] = tg[t];
        var rs = files[f].records || [];
        JSON.stringify(rs).replace(/"stamp ([a-z_]+)/g, function (s, n) { stampNames[n] = true; return s; });
        for (var i = 0; i < rs.length; i++) {
          if (only && rs[i].id !== only) continue;
          records.push(rs[i]);
          byId[rs[i].id] = rs[i];
        }
      }
      if (only && !byId[only]) note('?event=' + only + ' names no record in ' + names.join(', '));
      if (fresh) {
        for (var c = 0; c < chains.length; c++) {
          var fv = chains[c].first_visit || [];
          for (var k = 0; k < fv.length; k++) {
            var r = byId[fv[k]];
            if (r) { var st = r.starts || []; for (var e = 0; e < st.length; e++) effect(st[e], r); }
          }
        }
      }
      drawRoom(shownCues());
      arrive();
    });

    return {
      ready: ready,
      tick: tick,
      moment: moment,
      tap: tap,
      fire: function (id) { if (byId[id] && visit) fire(byId[id]); },
      state: function () { return state; },
      log: function () { return state.log.slice(); },
      settings: function () { return settings; },
      visit: function () { return visit; }
    };
  }

  window.CastleEvents = { start: start, dayNumber: dayNumber };
})();
