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
   Then the full moon's owl (board req 101, forty-second session): `stamp X by night` and `nights since X`, a night
   counted from the evening it began, so once a night means once from dusk to dawn across midnight; `moon in view`
   is the page's own built-in (yes where the moon's disc is in a window's glass where his eye reaches it).
   Then the Omnioculars earned by looking (board req 127, forty-fourth session): the page calls `lookClose(name)`
   when he has held the zoom close on a thing (board req 126); each thing is counted once ever, `things looked at`
   reads the count and `look close` comes when a new one is counted; `parent parcel` is a parent's setting
   (settings.parcel, the thing a parent sends by owl, or none).
   Then the sofa's bag filled and the Chocolate Frog cards (board req 165 and 169, fifty-second session): a bag's
   thing may carry `states`, and drawing it sets `<var>_state` to one, never the one that thing came in last; `drawn X`
   is yes once the page names X in `opts.drawn` (its drawings that have landed); a chain's `decks` and `set X = from
   deck Y` (by weight, repeats allowed, never the one X holds), every card kept in order found and read with
   `found(name)`; `easter`, the fortnight round Easter Sunday.
   Then the cards' pace and repeats (fifty-fourth session; Godric's answers of 12 October 2026): drawing from a deck also sets
   `<var>_again`, yes when he has found that card before; each card's first-found date is kept (`foundOn(name)`, the
   lives shelf's link, Magic's B7); a deck's card may carry `say`, the name a line's `{card}` takes.
   Then the castle's secrets (board req 180, the Marauder's Map earned, Magic's B9): `secret X` counts a secret he has
   found, once ever; `secrets found` reads how many; `secrets()` lists them in the order found. `height()`, his height
   in metres from a grown-up's setting (board req 187). `learned X`, yes once he has cast spell X on the Charms page
   (its `learn(X)`, kept on the device), for the twins' note that waits for Lumos (board req 179).
   Then his line on the little door's list (board req 177, Magic's B6 t1): `tried X`, a page moment, comes when his
   spell on X's lock answers nothing (Charms' `openLock` with `stuck`); `{year}` in a line is this year.
   Then the Howler (board req 193, Godric's events-q-howler-voice): `home howler`, written or none, says whether a
   grown-up wrote a Howler line at the letter page (its `howler`, in the letter's own key); `{howler}` shouts it.
   Then the house points (board req 216, Magic's B11, Godric's option 1 with both touches): `point <kind> <thing> <n>`
   awards n points for that kind of learning and that thing, once ever however often its record fires (the thing a
   word or a `{name}` read from a variable or built-in, as `point card {card} 5`); each award is kept as a slip, its
   kind, thing, points, day and record, in the order earned, for the hourglass and the leaving feast (`points()`);
   `house points` reads the total; the page's `opts.point(slip)` is told of each new one as it lands, so its gems fall
   then; a line in the grown-ups' log. `first cast`, a page moment, comes when a spell's cast in a room answers its
   first true cast ever (Charms' `first`), with the page's built-in `spell` naming it.
   Then whose each point is (board req 227, Design's house cup, Godric's Q21 t1): a slip carries `house`, the earner's
   house as the hourglass draws it (lion, snake, badger, eagle), stamped as it lands from this castle's own, a
   grown-up's setting (settings.house, ?house= for a test; `house()` reads it, null till set), so it keeps it whichever
   way the two castles' slips merge later (v=23).
   Then the reasons (Magic's reasons' words, req 216): a chain's `reasons` give each kind's words, or a kind and a
   thing's (`card dumbledore`), "for ..." as the leaving feast reads them, `{thing}` the thing as said; every slip
   handed out (`points()`, `opts.point`) carries its `reason`, read fresh, never kept (v=24).
   Then the year's end (Magic's *Against the year*, Godric's magic-against-year-1013, 1): `feast(y)`, the leaving
   feast's day, the boys' own last school day as a grown-up sets it (settings.feast, ?feast= for a test), the last
   Friday of June till then; `year()`, the school year now, named by its feast's year; each slip handed out carries
   its `year` (v=24).
   Then the owl's post (board req 216; Godric's events-two-castles-server, 1, a small store online, the owl brings
   them, with his t1, Errol): each castle has a random id, made at its first start and kept apart from its state
   (`lumos.castle.owl.v1`, so ?fresh keeps it); a grown-up opens the pairing link once on each iPad (`#owl=`, the
   store's address and the family key, read and taken off the address at once). Then each castle posts a copy of
   each slip that has a house (only points and houses, never a name: `{ kind, thing, points, on, record, house,
   late }`), and fetches the other castle's at its start and each minute of a visit; a slip fetched lands with
   `from`, its house untouched, once however often it is fetched. In the common room the moment `owl post` brings
   the waiting ones (built-in `owl waited`: yes when a copy waited out of signal on either iPad, and the owl is
   Errol, CoS 6), then the page is told each slip as its own are. With no pairing, nothing is sent. The best-year
   slip (Magic's *Against the year*): the moment `points grow` after any slip lands, the built-in `best year` yes
   when this school year's heap, both boys', passes last year's (from the second year, once a year); a `year` slip
   is never posted (since 15 October 2026 the built-in `year` is the castle's year, the last book he has finished, 0
   to 7, `castle date` its date as `N mm-dd`, and `reading` a deprecated alias of `year`: Rework 2, req 431), since each castle reads the same heap and gives its own (v=25).
   Then a point taken back (Design's req 237, Godric's Q22 t2): only a grown-up takes one back, a slip given in
   error (`back(slip)`); it stays, marked `back: true` and `backOn` (yyyy-mm-dd), out of every heap and total, the
   page told by `opts.back(slip)`, and the owl carries it to the other castle, which marks its copy the same (v=25).
   Then the Marauder's Map (board req 242, Magic's B10 to B15): a chain's own `dots` (map.json) give who the dots are,
   each on rounds by the real clock through the castle model's places (page/castle-model.js, req 244), so both castles'
   Maps agree; `map()` hands the page the dots now (his own first, then each named one with its label, place and way
   of moving), the Great Hall's crowd at meals and the places not on the Map. A figure standing or heard on a page this
   visit is drawn there instead of on its round (the Map never lies, PoA 18). The built-ins `map here` (the model room
   his own dot is in, from the page; a page may answer it itself, as the den) and `map nearest` (the grown-up whose dot
   stands nearest his, by the model; Snape where the model is not loaded). His own dot's label is settings.name, never
   in a file (v=26). SET ASIDE (Godric, 14 and 15 October 2026; docs/ministry/set-aside.md; the change list's Rework 36):
   the Marauder's Map stays a wink, so its handover, oath, cheek, notes, first look (PoA 10's three), Pettigrew's dot
   and the twins' dots are marked `aside` in map.json and out of play; the dots' rounds and `map()` stay for Clementine's
   plan, which shows places first as he finds them and a few regulars later as a stacked reward, never the trio (the
   world rules; built with the first night and the plan, the change list's row 18, not before). `reading` is a
   deprecated alias of `year`, the castle's year (Rework 2); nothing is gated on the book he is reading. `era` is
   `1890s` or `books` (req 1376): the books' own castle, with Filch, Mrs Norris and Hagrid in it, is `era = books`.
   Then one castle (Godric's fawkes-one-castle-1013, his option 4: no passwords, a player selection, one castle,
   shared points, sending things to each other): the pairing link also names the two boys (`p`, each a random id made
   once at the deploy, with his name if the family file holds one, which stays on the iPad). On opening, and at a new
   visit a minute or more after the last tap, `players()` says ask, and the page draws the names to tap; `play(id)`
   is his tap. The first tap on an iPad takes the castle as it stands; his brother's packs every lumos. key into the
   boy's satchel (`lumos.player.<id>`, any lane's keys, so no page need know), unpacks his brother's and reloads the
   page. The store knows each boy by his id, so his slips are his on either iPad (his own from the other iPad land as
   his own, once ever wherever earned), and his brother's on this iPad come straight from the satchel. Where each boy
   last stood (`map here`, a model room's id, never a name) is kept on the iPad and carried by the owl; `map()` adds
   his brother's dot there, labelled by this iPad's name for him, `move` pace after fifteen minutes in one room, as
   Dumbledore's paces his study (Godric's events-map-brother-1013, 1, with t1, PoA 10), else still (v=27). Since 14
   October 2026 the brothers share one iPad (the charter): the player selection and the satchels hold, the owl post
   between two paired iPads is set aside (req 420) and the brother's dot with it (BROTHER_DOT_ASIDE); each visit ends
   with a turn of the hourglass home (OVERTAKEN, settled 49, req 1107: the boys may sleep once sorted, and nothing ends a visit but the boy), at the edge of the woods, and the first night, going home and the plan wait for
   the change list's rows 18, 24, 25 and 34 (the world rules; the Ministry's set-aside). `brother X` in a `when` reads
   the var X of the boy who is not playing, from his satchel (Godric's events-norris-lets-pass-1022: Mrs Norris
   trusts a boy a little for his brother's sake); unset, or with no brother in the link, a count reads 0.

   The dormitory door's year (board req 263, CoS 5): `yearIn()` reads the one clock, the castle's year (the change
   list's Rework 35, RM-24: the boys sleep at home, so they have no year of their own in the castle): the dormitory is
   Harry's year's, seen by day, so the sign reads FIRST YEARS in the Stone's castle and before any book, SECOND YEARS in
   the Chamber's, and so on; ?yearin=N for a test. The count by Septembers from his first visit is retired; the first
   visit's day is still kept in the state (v=28).

   The shut doors (board req 265, Godric's events-shut-doors-265 Try 1): the shells (page/shell.html) start the runtime
   at place `entrance hall` and tap a shut door's id from `lumosShell.onDoorTap`, so `doors.json` answers each door with
   a sound and a short line from the books by the time of day; a voice heard there stands on the Map in the model's
   `entrance-hall`; a shell's trip, `?from=<its place id>`, carries the visit to a shell started with that place (v=29).

   His castle backed up (Godric's events-q-one-ipad-1013, 1, 13 October 2026: the boys play on one iPad only, so a
   sealed backup, never a sync): each named boy's castle, every lumos. key of his, sealed on the iPad (AES-GCM, its
   key the SHA-256 of "lumos satchel " and the family key) and kept at the store, a blob it cannot read, never a name;
   it goes up at an owl's look when he has played since its last copy, at most once in ten minutes a boy. If Safari
   or a reset empties the iPad, the grown-up opens the pairing link again; on an iPad with no castle on it, each boy's
   copy comes down into his satchel, and his tap unpacks it, with his trunk already at the foot of his bed
   (`carried`, trunk.json, PS 7). Nothing posts over a backup until the restore has had its answer (v=30).

   Drawn states only (board req 274): where the page names any state of a find as drawn (`quill.goose` in
   `opts.drawn`), the find turns up in one of those only, so the thing in his hand is the one drawn (v=31).

   The owl post between the boys (Magic's B26, req 294): `canSend()` says whether he can send his brother a thing
   now ({ to, name, waiting }, null with one boy); `send({ kind: 'card', name })` or `send({ kind: 'knut' })`, from
   his den, takes it out of his castle (the card's last copy in `found('frogs')`, or a Knut from `knuts`) and gives
   it to the owl, raising `owl sent`. One parcel waits each way, in the iPad's owl, never packed into a satchel, so it
   waits for his brother's own turn, however long. There, `parcel` reads `coming`, then `sill` once a record's
   `land parcel` has set it down, and `open parcel` puts the thing into his castle, `parcel thing` naming it (the
   card, or `knut`); `parcel()` gives the page { from, name, kind, thing, landed } for the label. Free (v=32).
   Then the point for a thing given (Magic's req 298, `given`, Dumbledore's socks, PS 12): `point given {parcel thing}
   N` after `open parcel` gives the point to the sender, never the boy opening it. Only the first parcel opened each
   week each way earns it, so the owl stays for giving and a Knut sent to and fro is never a points mill. The slip's
   thing is the thing and the week's Monday (`morgana 2026-10-12`); its reason reads `given <thing>`, else `given`.
   At the opening his brother's copy (`from` the sender, the sender's house from his satchel's settings) goes
   straight to the page, so its gems fly from the sill where the parcel stood, with no second owl; the sender's own
   waits in the iPad's owl (`owl.given`) and is his from the start of his next turn, posted as his own (v=33).
   Then the heights (Hidden Ways' req 528, 15 October 2026): `heights`, a grown-up's per-boy limit (settings.heights),
   `eased` till one is set, `open` once it is; ?heights=open or eased for a test. A high place's rule reads it, so
   the lantern's shutters stay shut, the drop heard and not looked down, until a grown-up opens them.
   Then the Entrance Hall's glasses (Magic's req 632, Design's req 606, 16 October 2026): `schoolLevels()`, the school's
   own points in each house's glass by the castle's year and day, close, the lead changing week to week, never kept.
   Then the home's sky (the Curator's req 622; Godric's 2 on events-home-sky-1016, 16 October 2026): `home()`, the place
   the Astronomy top's telescopes show the sky over, for `CastleSky.at(date, home())` (page/castle-sky.js): the boys'
   town as a grown-up sets it once in the guarded setup (settings.home, { lat, lon, town }, kept on this iPad and
   never sent), else 42 north at the clock zone's own meridian; ?home=lat,lon for a test. `{ lat, lon, town, set }`.
   Then the clock's moment (Magic's req 676, the hospital wing's curtains at ten; Kingsley's 92293727: only if he is
   there, never calling him): `clock HH:MM` comes when the boys' own clock passes that minute while a page of the
   visit ticks, never at arriving, so a boy who comes at five past sees what it left; ?hour=21:59 a minute before.
   Then a chain's `places` (Magic's req 687, the corbels' faces in the 33 Tudor rooms under beams): named lists of
   places, `"places": {"corbelled": ["staff room", ...]}`, and `place = <list>` (or `!=`) holds when the page's place
   is (or is not) in it, so one rule names many rooms and still counts as naming its place off the first pages.

   Test links: ?event=<id> loads only that record's chain and lets the record skip the draw, so it fires whenever
   it holds and the rest of its chain follows it (in a one_of group it wins the group); ?wait=N sets every wait
   to N s; ?time=night (or morning, day, evening) overrides the clock; ?fresh starts this iPad's castle afresh;
   ?lines=all shows the lines still marked verify. */
(function () {
  'use strict';

  var STATE_KEY = 'lumos.castle.state.v1';
  var SETTINGS_KEY = 'lumos.castle.settings.v1';
  var OWL_KEY = 'lumos.castle.owl.v1';      /* this castle's id and the owl's store, kept apart so ?fresh keeps them (req 216) */
  var OWL_S = 60;                           /* the owl looks for the other castle's slips each minute of a visit */
  var SATCHEL = 'lumos.player.';            /* a boy's satchel while his brother plays: every lumos. key of his (one castle) */
  var ASK_S = 60;                           /* a new visit this long after a name was tapped asks again who is playing */
  var PACE_MIN = 15;                        /* his brother this long in one room: his dot paces there (map-brother t1) */
  var BROTHER_DOT_ASIDE = true;             /* the brother's dot is set aside (docs/ministry/set-aside.md) */
  /* A house as a grown-up may write it, read to the beast the hourglass draws (Design's house-hourglass.js; req 227) */
  var HOUSES = { lion: 'lion', gryffindor: 'lion', snake: 'snake', slytherin: 'snake',
                 badger: 'badger', hufflepuff: 'badger', eagle: 'eagle', ravenclaw: 'eagle' };
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
  /* The castle's day by the clock (docs/room-states.md §7 2 to 4, req 414), one table each, every chain and page
     reading the built-ins `meal`, `occasion` and `lessons`, never a copy. The meals' hours are the Map's of req 242,
     moved here as the one table (map.json keeps none of its own). Lessons from nine (PoA 6 L15206: "Nine o'clock,
     Divination"), until six (Godric, events-lesson-hours-1016, 16 October 2026); the rest of the hours ours. The
     Great Hall lane may ask other hours by row. */
  var MEALS = [{ meal: 'breakfast', from: '07:30', to: '08:30' }, { meal: 'lunch', from: '12:30', to: '13:30' },
               { meal: 'dinner', from: '18:30', to: '19:30' }];
  var LESSON_HOURS = [{ from: '09:00', to: '12:30' }, { from: '13:30', to: '18:00' }];
  /* The occasions any pupil sees every year, never a book's own night (the charter, 15 October 2026, holidays): the
     start of term on 1 September, Hallowe'en on 31 October, Christmas from the hall's decorating in the last days of
     term (PS 12 L4054 to L4056, a day before the holidays; the date ours) to 2 January with Christmas Day its own,
     Easter's fortnight (the `easter` built-in's), and the leaving feast on its day (`feast`). The feast of a day is
     the occasion with `meal = dinner`. */
  var OCCASIONS = ['start of term', 'halloween', 'christmas', 'christmas day', 'easter', 'leaving feast', 'none'];
  var CHRISTMAS = { from: '12-18', to: '01-02' };
  /* The Quidditch fixtures, ours (req 480, the `match` built-in): the season from November, its matches on a Saturday
     (PS 11 L3715 to L3717), six a year for four houses, clear of Christmas and of Easter's fortnight, never a book's own
     match day. Each is [month, which Saturday of it], 1 the first and -1 the last. */
  var MATCHES = [[11, 2], [11, -1], [2, 1], [2, -1], [3, 2], [5, 3]];
  /* The Duelling Club's evenings, ours (req 499; the charter's 15 October entry: a club of their own, an ordinary
     practice evening any pupil could join, run by a teacher): Fridays from eight (CoS 11 L10298's hour) to nine on an
     ordinary term day, from the spring term of the Chamber's castle, after its one canon night, in every castle after. */
  var CLUB = { day: 5, hour: 20, from: [2, '01-08'] };

  var COND = /^([a-z_\- ]+?)\s*(>=|<=|!=|=|<|>)\s*([A-Za-z0-9_\- ]+)$/;
  var WAIT = /^(wait|quiet) (\d+)-(\d+) s$/;
  var CLOCK = /^clock ([01]\d|2[0-3]):([0-5]\d)$/;
  var EFFECTS = [
    ['set', /^set ([a-z_]+) = (mark [a-z ,]+|from bag [a-z]+|from deck [a-z]+|\d+-\d+|-?\d+|[a-z\-]+)$/],
    ['add', /^add ([a-z_]+) (-?\d+)$/],
    ['stamp', /^stamp ([a-z_]+)(?: \+(\d+)(?:-(\d+))? days)?$/],
    ['stamp-night', /^stamp ([a-z_]+) by night$/],
    ['stamp-real', /^stamp ([a-z_]+) by real day$/],
    ['slot', /^(take|free) slot$/],
    ['log', /^log "(.+)"$/],
    ['secret', /^secret ([a-z\-]+)$/],
    ['point', /^point ([a-z\-]+) (\{[a-z_ ]+\}|[a-z\-]+) (\d+)$/],
    ['parcel', /^(land|open) parcel$/]
  ];

  /* The real moon (req 95, Magic's "The real moon, how real", Godric's pick of 10 October 2026, 5.16 pm), from the
     date and clock alone, in the castle's sky at 57 degrees north (req 439, the Architect's windows layer; Fawkes's
     3.00 pm on Events' Q1, option 1, confirmed by Godric, 15 October 2026, 3.28 pm; until then 42, the home's), no stored place. The moon's
     and sun's longitudes by the almanac's short series (within a few hours of the true new and full moons) give its
     phase and how much is lit; its height comes from its hour angle (the sun's, less the elongation, from a solar noon
     of twelve o'clock, one o'clock in summer time) and its declination from its longitude, so it rises about fifty
     minutes later each day, is up all night at full and only by day near new, and stands high on a winter's full
     moon and low on a summer's. */
  var RAD = Math.PI / 180, MOON_LAT = 57;
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

  /* The castle's sun (req 439; Fawkes's 3.00 pm on Events' Q1, option 1, confirmed by Godric at 3.28 pm), at 57
     degrees north like the moon, for the light through the windows: the time of day keeps the boy's own clock (the
     world rules, Time: an after-school visit is afternoon at Hogwarts too), and the sky is the castle's, so a
     December four o'clock is `time = day` with the sun down. Its height and its bearing (degrees from north, east 90)
     by the same short series, the clock hour read as solar time, summer time an hour ahead. */
  function sunAt(d) {
    var t = (d.getTime() - 946728000000) / DAY_MS;
    var g = (357.528 + 0.9856003 * t) * RAD;
    var ls = 280.46 + 0.9856474 * t + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    var dec = Math.asin(Math.sin(23.44 * RAD) * Math.sin(ls * RAD));
    var noon = 12 + (summerTime(d) ? 1 : 0);
    var ha = 15 * (d.getHours() + d.getMinutes() / 60 - noon) * RAD;
    var lat = MOON_LAT * RAD;
    var alt = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha)) / RAD;
    var az = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) / RAD + 180) % 360;
    return { up: alt > 0, altitude: Math.round(alt), bearing: Math.round(az), height: Math.round(Math.max(0, alt) / 90 * 100) / 100 };
  }

  /* The castle's weather (board req 113, the Corridor, Godric's wish of 10 October 2026, 6.52 pm): one weather a day for
     the whole castle, so every window agrees, worked from the date alone like dusk and the moon, so both castles agree
     and it needs no connection. A Highlands climate by month, in spells: a pressure and a warmth that drift from day to
     day (each day's nudge seeded by the date, carried on from 1 January 2026), so wet days come in runs and a cold snap
     lasts. From them the sky (clear, cloudy, rain, snow or fog), the wind (0 still to 1 blowing a gale), the ground (dry,
     wet with puddles after rain, frost on a cold clear morning, or snow lying), a warmth in degrees and the season. Two
     anchors from the book's own year: from November the weather turns very cold and most mornings the ground is white
     with frost (PS 11), and one morning in mid-December the castle wakes under deep snow, which lies until the new year
     (PS 12). */
  var WX_EPOCH = Date.UTC(2026, 0, 1) / DAY_MS;            /* the day the spells start from */
  var WX_WARM = [3.5, 4, 5.5, 7.5, 10, 12.5, 14, 13.5, 11, 8, 4.5, 3.5];          /* a day's mean warmth by month, C */
  var WX_WET = [0.6, 0.55, 0.52, 0.45, 0.42, 0.42, 0.47, 0.5, 0.52, 0.56, 0.3, 0.58];   /* the share of wet days */
  var WX_WIND = [0.08, 0.08, 0.05, 0, -0.03, -0.06, -0.06, -0.04, 0, 0.04, 0.08, 0.08];  /* windier in winter */
  var WX_SEASON = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
  var WX_SKY = /^(clear|cloudy|rain|snow|fog)$/, WX_GROUND = /^(dry|wet|frost|snow)$/;
  var wxDays = {}, wxLast = null;
  function wxRand(day, salt) {
    var h = ((day * 2654435761) ^ (salt * 40503 + 0x9e3779b9)) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; h ^= h >>> 16; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
    return ((h >>> 0) % 1000003) / 1000003;
  }
  function wxNormal(day, salt) {                          /* a seeded draw from the bell curve, by Box and Muller */
    return Math.sqrt(-2 * Math.log(1 - wxRand(day, salt) * 0.999999)) * Math.cos(2 * Math.PI * wxRand(day, salt + 1));
  }
  function wxWarmth(d) {                                  /* the month's mean warmth, eased between mid-months */
    var m = d.getMonth(), f = (d.getDate() - 15) / 30, n = (m + (f < 0 ? 11 : 1)) % 12;
    return WX_WARM[m] + (WX_WARM[n] - WX_WARM[m]) * Math.abs(f);
  }
  function wxDay(day, prev) {
    var u = new Date(day * DAY_MS), d = new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate(), 12);
    var m = d.getMonth(), date = d.getDate();
    var p = 0.7 * prev.p + 0.71 * wxNormal(day, 1), t = 0.75 * prev.t + 0.66 * wxNormal(day, 3);
    var warm = wxWarmth(d) + 2.6 * t;
    var snowDay = 12 + Math.floor(wxRand(d.getFullYear(), 9) * 4);        /* PS 12: one morning in mid-December */
    var deep = m === 11 && date >= snowDay;
    if (deep) warm = Math.min(warm, 0.5 + 0.8 * t);                      /* the lake froze solid: it stays cold to the year's end */
    var wet = wxRand(day, 5) < WX_WET[m] * Math.max(0.15, Math.min(1.8, 1 - 0.6 * p));
    var wind = Math.max(0, Math.min(1, 0.3 - 0.22 * p + 0.18 * wxNormal(day, 6) + WX_WIND[m]));
    var sky;
    if (deep && date === snowDay) sky = 'snow';
    else if (wet) sky = warm < 0.5 || deep ? 'snow' : 'rain';
    else if (wind < 0.3 && p > 0.4 && (m >= 8 || m <= 2) && wxRand(day, 7) < 0.4) sky = 'fog';
    else sky = p + 0.6 * wxNormal(day, 8) > 0.2 ? 'clear' : 'cloudy';
    var dawn = warm - (sky === 'clear' ? 5 : sky === 'fog' ? 3 : 2.5);    /* the night's cold by morning */
    var lying = prev.lying + (sky === 'snow' ? (deep && date === snowDay ? 3 : 0.6) : 0);
    if (warm > 1) lying -= 0.3 * (warm - 1) + (sky === 'rain' ? 0.5 : 0);
    lying = Math.max(0, lying);
    var ground;
    if (lying >= 0.3) ground = 'snow';
    else if (sky !== 'rain' && dawn < (m === 10 ? 2 : -0.5)) ground = 'frost';   /* PS 11: from November, frost most mornings */
    else if (sky === 'rain' || (prev.sky === 'rain' && sky !== 'clear') || (prev.lying >= 0.3 && warm > 1)) ground = 'wet';
    else ground = 'dry';
    return { p: p, t: t, lying: lying, sky: sky, wind: wind, ground: ground, warm: warm };
  }
  function weatherAt(d) {
    var day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
    if (!wxDays[day]) {
      var from = wxLast != null && wxLast < day ? wxLast : WX_EPOCH - 1, prev = wxLast != null && wxLast < day ? wxDays[wxLast] : { p: 0, t: 0, lying: 0, sky: 'cloudy' };
      if (day < WX_EPOCH) { from = day - 120; prev = { p: 0, t: 0, lying: 0, sky: 'cloudy' }; }
      for (var k = from + 1; k <= day; k++) { prev = wxDay(k, prev); if (day >= WX_EPOCH) wxDays[k] = prev; }
      wxDays[day] = prev;
      if (day >= WX_EPOCH && (wxLast == null || day > wxLast)) wxLast = day;
    }
    var w = wxDays[day];
    return { sky: w.sky, wind: Math.round(w.wind * 100) / 100, windy: w.wind >= 0.6, ground: w.ground, wet: w.ground === 'wet',
             frozen: w.ground === 'frost' || (w.ground === 'snow' && w.warm < 1), warmth: Math.round(w.warm), cold: w.warm < 7,
             season: WX_SEASON[d.getMonth()], date: ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) };
  }

  function note(msg) { if (window.console) console.info('[castle-events] ' + msg); }
  function between(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* A day is a whole local day counted from 1970, so dates compare as numbers and survive a reload. */
  function dayNumber(d) { return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / DAY_MS); }
  /* Easter Sunday of a year, by the Gregorian reckoning (the anonymous algorithm), for the Easter egg down the sofa. */
  function easterSunday(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31), day = (h + l - 7 * m + 114) % 31 + 1;
    return new Date(y, month - 1, day, 12);
  }
  /* The week as a whole number, turning over on Monday (password Monday), from the date alone, so both castles and
     every page agree on it: the moving stair's vanishing step holds all week by it. 1 January 1970 was a Thursday. */
  function weekNumber(d) { return Math.floor((dayNumber(d) + 3) / 7); }

  function load(key) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  var packed = false;            /* his satchel packed for his brother's turn: nothing more is saved before the reload */
  var dated = false;             /* a look on another day (?date=): it keeps nothing and posts nothing (req 414) */
  function save(key, v) {
    if (packed || dated) return;
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* private mode: the castle forgets, kindly */ }
  }

  function freshState() {
    return { v: 1, vars: {}, stamps: {}, slot: null, visits: 0, visitOpen: false, lastSmall: [], bags: {}, log: [],
             open: {}, started: {}, lastBigDay: null, lastBigVisit: null, visitPlace: null, leftAt: null, kept: null,
             said: {}, written: {}, thingStates: {}, deckFound: {}, deckFirst: {}, secrets: [], points: [], firstDay: null,
             owl: { after: 0, posted: {}, postFailed: false, fetchFailed: false, waiting: [], waited: false,
                    afterBack: 0, backsPosted: {} } };
  }

  function start(opts) {
    packed = false;
    var params = new URLSearchParams(location.search);
    var only = params.get('event');
    var waitOverride = params.has('wait') ? Math.max(0, +params.get('wait') || 0) : null;
    var timeOverride = /^(morning|day|evening|night)$/.test(params.get('time') || '') ? params.get('time') : null;
    var moonOverride = PHASE_AT.hasOwnProperty(params.get('moon')) || params.get('moon') === 'down' ? params.get('moon') : null;   /* a test link: ?moon=full, ?moon=down */
    /* a test link for the weather: ?weather=clear, cloudy, rain, snow, fog, windy, frost or wet (puddles), ?wind=0.8,
       ?season=spring. ?date=2026-12-20 moves the whole clock to that day at the real time of day (docs/room-states.md
       §7 1, req 414): `date`, `weekday`, `week`, `castle date`, `easter`, the weather, the moon and every stamp read
       from it, as if he had come that day; a dated look keeps nothing and posts nothing, so his own castle is as it
       was once the link is closed. (Settled 50, req 1110, 26 October 2026: the date is the real day only till Story
       settles the story day per boy; then `?date=` moves the story day, not the clock.) */
    var weatherOverride = /^(clear|cloudy|rain|snow|fog|windy|frost|wet)$/.test(params.get('weather') || '') ? params.get('weather') : null;
    /* ?tomorrow=rain (or clear) forces the front the signs read; otherwise the next day's own weather (Magic's req 1273, 1) */
    var tomorrowOverride = /^(rain|clear)$/.test(params.get('tomorrow') || '') ? params.get('tomorrow') : null;
    var seasonOverride = /^(spring|summer|autumn|winter)$/.test(params.get('season') || '') ? params.get('season') : null;
    var weatherDate = /^\d{4}-\d\d-\d\d$/.test(params.get('date') || '') ? params.get('date') : null;
    var dateShift = 0;        /* how far ?date= moves the clock, in ms, the real time of day kept */
    if (weatherDate) {
      var dn = new Date(), dt = new Date(+weatherDate.slice(0, 4), +weatherDate.slice(5, 7) - 1, +weatherDate.slice(8, 10),
                                         dn.getHours(), dn.getMinutes(), dn.getSeconds(), dn.getMilliseconds());
      if (isNaN(dt.getTime()) || dt.getDate() !== +weatherDate.slice(8, 10)) weatherDate = null;   /* 2027-02-30 is no day */
      else dateShift = dt.getTime() - dn.getTime();
    }
    /* ?hour=23 or ?hour=23:30 moves the clock to that hour of the day (req 488: the tower's lesson at midnight has a
       link): `hour`, `time`, `meal`, `last meal`, `lessons` and the sun follow it, as if he had come then; like ?date=
       it keeps nothing and posts nothing, and the two together name a day and an hour. */
    var hourLook = /^([01]?\d|2[0-3])(?::([0-5]\d))?$/.exec(params.get('hour') || '');
    if (hourLook) {
      var hn = new Date(Date.now() + dateShift), ht = new Date(hn.getFullYear(), hn.getMonth(), hn.getDate(), +hourLook[1], +(hourLook[2] || 0), 0, 0);
      dateShift += ht.getTime() - hn.getTime();
    }
    dated = !!weatherDate || !!hourLook;
    /* a test link for the day's drivers (docs/room-states.md §1): ?meal=breakfast, lunch, dinner or none;
       ?occasion=halloween, christmas-day and the rest (hyphens for spaces); ?lessons=on or off. With ?time= alone the
       meal reads none and lessons off, so a link shows only what it names. */
    var mealOverride = /^(breakfast|lunch|dinner|none)$/.test(params.get('meal') || '') ? params.get('meal') : null;
    var occasionOverride = (function (o) { return OCCASIONS.indexOf(o) >= 0 ? o : null; })(String(params.get('occasion') || '').replace(/[-_+]/g, ' ').trim());
    var lessonsOverride = /^(on|off)$/.test(params.get('lessons') || '') ? params.get('lessons') : null;
    /* the Great Hall's three (req 480): ?last-meal=breakfast, lunch, dinner or none for what a meal leaves; ?match=yes or
       no; ?summer=yes or no. With ?time= alone the last meal reads none, as the meal does. */
    var lastMealOverride = /^(breakfast|lunch|dinner|none)$/.test(params.get('last-meal') || '') ? params.get('last-meal') : null;
    var matchOverride = /^(yes|no)$/.test(params.get('match') || '') ? params.get('match') : null;
    var summerOverride = /^(yes|no)$/.test(params.get('summer') || '') ? params.get('summer') : null;
    var clubOverride = /^(duelling|none)$/.test(params.get('club') || '') ? params.get('club') : null;   /* ?club=duelling (req 499) */
    var sunOverride = /^(up|down)$/.test(params.get('sun') || '') ? params.get('sun') : null;   /* ?sun=up or down */
    if (params.has('fresh')) { try { localStorage.removeItem(STATE_KEY); } catch (e) {} }
    /* No castle on this iPad at all, neither a state nor a boy's satchel: the backup's restore may come down (v=30). */
    var bare = !params.has('fresh') && (function () {
      try {
        if (localStorage.getItem(STATE_KEY) !== null) return false;
        for (var i = 0; i < localStorage.length; i++) if ((localStorage.key(i) || '').indexOf(SATCHEL) === 0) return false;
        return true;
      } catch (e) { return false; }
    })();
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
    var placeDefs = {};                          /* each chain's named lists of places (req 687) */
    var deckDefs = {};                           /* each chain's decks, by name (the Chocolate Frog cards, req 165) */
    /* The things this page has drawings for (req 169): `opts.drawn`, a list of names or a function giving one, so a
       find joins the sofa's bag, or a card the deck, only once its drawing has landed in the page. */
    function drawnList() {
      var d = typeof opts.drawn === 'function' ? opts.drawn() : opts.drawn;
      return d || [];
    }
    var wordDefs = {};                           /* each chain's week-by-week words, by name (the password) */
    var dotDefs = null;                          /* the Marauder's Map's dots, one chain's own (map.json; req 242) */
    var reasonDefs = {};                         /* each house point's reason as the feast reads it, by kind or kind and thing (req 216) */
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
    if (!state.firstDay) state.firstDay = isoDay(nowDate());   /* his first visit, for his year (req 263); saved with the state */
    /* A parent's bedtime: a visit length in minutes, or off (settings.bedtime); ?bedtime=N sets it for a test. A bare
       &bedtime is the lights-out trip's own flag, not a length, so it leaves the parent's setting as it is (until
       9 October 2026 it read as 0 and turned the bedtime off on the page it opened); ?bedtime=off turns it off. */
    var bedtimeParam = params.get('bedtime');
    var bedtimeMin = bedtimeParam === 'off' ? 0 : +bedtimeParam > 0 ? +bedtimeParam : (+settings.bedtime || 0);
    /* This castle's own house, the house of the boy whose iPad this is (board req 227): a grown-up's setting
       (settings.house), ?house= for a test, as the beast the hourglass draws (lion, snake, badger, eagle; the house's
       own name is read to its beast); null until one is set. Each slip earned here is stamped with it as it lands, so
       a slip says whose it is and keeps it whichever way the two castles' slips merge later. A slip earned before a
       house was set is stamped at the first start that knows one; a slip with `from` came from the other castle and
       is never stamped here. */
    function castleHouse() {
      var h = String(params.get('house') || settings.house || '').trim().toLowerCase();
      return HOUSES[h] || null;
    }
    if (castleHouse()) (state.points || []).forEach(function (p) { if (!p.house && !p.from) p.house = castleHouse(); });
    /* The leaving feast, the school year's end (Magic's *Against the year*; Godric's magic-against-year-1013, 1, their
       own best year): the boys' own last school day, a grown-up's setting (settings.feast, month and day as 06-19, a
       whole date read for its month and day), ?feast= for a test; the last Friday of June until one is set (exams from
       the first of June, CoS 16, and the feast after their results). A school year runs from the day after one feast
       to the next and is named by the year its feast falls in. */
    function feastDay(y) {
      var m = /^(?:\d{4}-)?(\d{1,2})-(\d{1,2})$/.exec(String(params.get('feast') || settings.feast || '').trim());
      if (m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 31) return y + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
      var d = new Date(y, 5, 30);
      d.setDate(30 - (d.getDay() + 2) % 7);        /* back from 30 June to its Friday */
      return isoDay(d);
    }
    function schoolYear(day) { var y = +day.slice(0, 4); return day <= feastDay(y) ? y : y + 1; }
    /* The school's own points in the Entrance Hall's four glasses (Magic's req 632, *The Entrance Hall*, the hourglasses
       at rest; Design's req 606, its levels half), worked from the castle's year and day alone and kept nowhere, so both
       boys' castles of one year show the same glasses. Each glass is empty on 1 September and fills toward the leaving
       feast, low in September and fuller by June, about 400 at the feast against a full bulb's 600 (the Stone's year's
       feast stood at 312 to 472, PS 17 L6481): the school's points grow with its days in term, slowly over Christmas and
       Easter with the school mostly away, and each house stands a little above or below that, by up to about an eighth,
       drawn fresh each week and eased from one week's to the next, so the four stay close, which one leads changes from
       week to week, nothing in the hall naming it, and a glass now and then gives a little back. In the castles of the
       first three books Gryffindor's ends the year ahead, as the winner's hangings at the feast say (great-hall.json),
       its lead built over the last fortnight in ordinary weeks, never a swing; later years end as their weeks fall, held
       with the hangings (Godric's 2). From the feast's day through the summer the glasses stand still at the year's
       result, though the summer holds the feast week's earlier days (Kingsley's item 19, 19 October 2026: a trace
       keeping its date, never the feast replayed; hall.json's shower and lift wait for term). In points, as a slip's, for `LumosHourglass.hall({ levels, full })`; the boys' own slips heap on Gryffindor's. */
    var LEVEL_FULL = 600, LEVEL_FEAST = 400, LEVEL_HOUSES = ['lion', 'badger', 'eagle', 'snake'], levelYears = {};
    function levelRun(y, fy) {
      var key = y + ':' + fy + ':' + feastDay(fy);
      if (levelYears[key]) return levelYears[key];
      var start = new Date(fy - 1, 8, 1, 12), f = feastDay(fy), end = new Date(+f.slice(0, 4), +f.slice(5, 7) - 1, +f.slice(8, 10), 12);
      var days = Math.max(1, dayNumber(end) - dayNumber(start)), seed = (fy - 2000) * 8 + y, grown = [0], out = [], i;
      for (i = 1; i <= days; i++) {                      /* the school's days in term so far, a holiday's a sixth */
        var md = monthDay(new Date(fy - 1, 8, 1 + i, 12));
        grown.push(grown[i - 1] + (md >= CHRISTMAS.from || md <= CHRISTMAS.to || easterNear(new Date(fy - 1, 8, 1 + i, 12)) ? 1 / 6 : 1));
      }
      function lean(week, k) {                           /* a house's lean that week, -0.12 to 0.12; Gryffindor's last fortnight ahead */
        var w = (wxRand(seed * 400 + week, 40 + k) - 0.5) * 0.24;
        if (y >= 1 && y <= 3 && week * 7 >= days - 14) w = k === 0 ? 0.1 : Math.min(w, 0.05);
        return w;
      }
      for (i = 0; i <= days; i++) {
        var wk = Math.floor(i / 7), f7 = (i % 7) / 7, base = LEVEL_FEAST * grown[i] / grown[days], o = {};
        LEVEL_HOUSES.forEach(function (h, k) { o[h] = Math.max(0, base * (1 + lean(wk, k) * (1 - f7) + lean(wk + 1, k) * f7)); });
        out.push(o);
      }
      return (levelYears[key] = out);
    }
    function schoolLevels() {
      var d = castleDay(), fy = schoolYear(isoDay(d)), run = levelRun(castleYear(), fy);
      var i = summerNow() === 'yes' ? run.length - 1 : Math.max(0, Math.min(run.length - 1, dayNumber(d) - dayNumber(new Date(fy - 1, 8, 1, 12))));
      var at = run[i], levels = {};
      LEVEL_HOUSES.forEach(function (h) { levels[h] = Math.round(at[h]); });
      return { levels: levels, full: LEVEL_FULL };
    }
    /* The dormitory's year (req 263) on the one clock (Rework 35): the castle's year, the Stone's before any book. */
    function yearIn() {
      var t = +params.get('yearin');
      if (t >= 1 && t <= 7) return Math.floor(t);
      return Math.max(1, castleYear());
    }

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
    /* the Howler line a grown-up wrote at the letter page (page/letter-home.html keeps the letter in its own key), or '' */
    function homeHowler() { var o = load('lumos.letterHome'); return (o && typeof o.howler === 'string' && o.howler.trim()) || ''; }
    function nowDate() { return new Date((clock != null ? clock : Date.now()) + dateShift); }
    function today() { return dayNumber(nowDate()); }
    /* the night as one count, a night belonging to the evening it began, so 10 pm and 2 am are one night */
    function tonight() { return dayNumber(new Date(nowDate().getTime() - 12 * 3600000)); }
    /* the real day, for a stamp that must count real days when the story's date is paced by events (req 1127: a boy's seeds wait in real days) */
    function realToday() { return dayNumber(nowDate()); }

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

    /* The castle's sun now (req 439): { up, altitude, bearing, height }. With ?time= it is the sun of that time's own
       hour on this day (morning nine, day one, evening six, night midnight), so a link's sky matches the time it
       names; ?sun=up or down forces it, a little up in the south, or set. */
    var TIME_HOUR = { morning: 9, day: 13, evening: 18, night: 0 };
    function sunNow() {
      var d = nowDate();
      if (timeOverride) d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), TIME_HOUR[timeOverride], 0);
      var sn = sunAt(d);
      if (sunOverride === 'up' && !sn.up) { sn.up = true; sn.altitude = 10; sn.bearing = 180; sn.height = 0.11; }
      if (sunOverride === 'down') { sn.up = false; sn.altitude = Math.min(sn.altitude, -6); sn.height = 0; }
      return sn;
    }

    /* The day's weather where the castle stands (req 113): { sky, wind, windy, ground, wet, frozen, warmth, cold, season,
       date }, the same all day, `?weather=` and its kin honoured. */
    var FORCED = {
      clear: { sky: 'clear', wind: 0.2, ground: 'dry' }, cloudy: { sky: 'cloudy', wind: 0.3, ground: 'dry' },
      rain: { sky: 'rain', wind: 0.45, ground: 'wet' }, snow: { sky: 'snow', wind: 0.3, ground: 'snow', warmth: -1 },
      fog: { sky: 'fog', wind: 0.05, ground: 'dry' }, windy: { sky: 'clear', wind: 0.85, ground: 'dry' },
      frost: { sky: 'clear', wind: 0.1, ground: 'frost', warmth: 1 }, wet: { sky: 'cloudy', wind: 0.3, ground: 'wet' }
    };
    function weatherNow() {
      var w = weatherAt(nowDate()), f = FORCED[weatherOverride];
      if (f) {
        w.sky = f.sky; w.wind = f.wind; w.ground = f.ground;
        if (f.warmth != null) w.warmth = Math.min(w.warmth, f.warmth);
        else if (w.warmth < 2) w.warmth = 4;
      }
      if (params.has('wind')) w.wind = Math.max(0, Math.min(1, +params.get('wind') || 0));
      if (seasonOverride) w.season = seasonOverride;
      w.windy = w.wind >= 0.6; w.wet = w.ground === 'wet';
      w.frozen = w.ground === 'frost' || (w.ground === 'snow' && w.warmth < 1); w.cold = w.warmth < 7;
      return w;
    }

    function rainTomorrow() {
      var d = nowDate(), t = tomorrowOverride || weatherAt(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)).sky;
      return t === 'rain' && weatherNow().sky !== 'rain';
    }

    function builtin(name) {
      var now = nowDate();
      if (builtins[name]) return builtins[name]();
      switch (name) {
        case 'today': return today();
        case 'time': return timeOfDay();
        case 'moon': return moonNow().phase;          /* new, waxing-crescent, ... full, ... waning-crescent */
        case 'moon up': return moonNow().up ? 'yes' : 'no';
        case 'sun': return sunNow().up ? 'up' : 'down';        /* the castle's sun at 57 degrees (req 439) */
        case 'weather': return weatherNow().sky;      /* clear, cloudy, rain, snow or fog */
        case 'windy': return weatherNow().windy ? 'yes' : 'no';
        case 'ground': return weatherNow().ground;    /* dry, wet, frost or snow */
        case 'season': return weatherNow().season;
        case 'cold': return weatherNow().cold ? 'yes' : 'no';
        case 'rain tomorrow': return rainTomorrow() ? 'yes' : 'no';     /* a front the day after this: tomorrow rains and today does not (req 1273) */
        case 'place': return (leaving && state.visitPlace) || place;
        case 'at': return 'none';                 /* a page with stops answers this itself */
        case 'hour': return now.getHours();
        case 'weekday': return WEEKDAYS[castleDay().getDay()];
        case 'week': return weekNumber(now);
        case 'day of week': return (castleDay().getDay() + 6) % 7 + 1;      /* Monday 1 to Sunday 7, so `day of week >= 4` is Thursday on */
        case 'date': return monthDay(castleDay());
        case 'easter': return easterNear(castleDay()) ? 'yes' : 'no';
        case 'meal': return mealNow();                 /* breakfast, lunch, dinner or none (§7 2) */
        case 'occasion': return occasionNow();         /* start of term, halloween, christmas, christmas day, easter, leaving feast, none (§7 3) */
        case 'lessons': return lessonsNow();           /* on in a school day's teaching hours, off otherwise (§7 4) */
        case 'last meal': return lastMealNow();        /* the meal last ended today, none from midnight till breakfast's end (req 480) */
        case 'match': return matchNow();               /* yes on a Quidditch Saturday of ours (req 480) */
        case 'summer': return summerNow();             /* yes while the summer holds the castle in the feast week (req 480) */
        case 'club': return clubNow();                 /* duelling on a club evening, else none (req 499) */
        case 'slot': return state.slot ? 'taken' : 'free';
        /* off as a parent sets it, or where the browser cannot hear at all, so a spoken thing waits for a tap (the ear's promise) */
        case 'speech': return ear && ear.available && ear.available() ? settings.speech || 'on' : 'off';
        /* a grown-up's per-boy limit on high places, eased till set (req 528); ?heights=open or eased for a test */
        case 'heights':
          var hp = params.get('heights');
          return hp === 'open' || hp === 'eased' ? hp : settings.heights === 'open' ? 'open' : 'eased';
        case 'listening':                    /* the thing tapped, while the ear its tap opened listens, and a beat after */
          var ls = visit && visit.listen;
          return ls && (ls.open || Date.now() < ls.until) ? ls.name : 'none';
        case 'bedtime': return bedtimeMin > 0 ? 'set' : 'off';
        case 'things looked at': return (state.looked || []).length;   /* different things held close in the zoom, ever (req 127) */
        case 'secrets found': return (state.secrets || []).length;     /* the castle's secrets he has found, each once ever (req 180) */
        case 'house points': return (state.points || []).reduce(function (t, p) { return t + (p.back ? 0 : p.points); }, 0);   /* req 216; a slip taken back is out (req 237) */
        case 'owl waited': return owlWaited ? 'yes' : 'no';           /* the owl's copies waited out of signal: Errol (req 216, t1) */
        case 'best year': return bestYear() ? 'yes' : 'no';            /* this year's heap past last year's, once a year */
        case 'year': return castleYear();                              /* the last book he finished, 0 to 7 (Rework 2) */
        case 'castle date': return castleDateKey();                    /* compared with `N mm-dd` (docs/room-states.md) */
        case 'era': return castleEra();                                /* 1890s or books (req 1376, Godric's 2) */
        case 'who plays': return playersNow().ask ? 'ask' : (owl.players || []).length >= 2 ? 'chosen' : 'one';   /* one castle: his name to tap */
        case 'parcel': var pc = parcelFor(me()); return pc && playerOf(owl.playing) ? (pc.landed ? 'sill' : 'coming') : 'none';   /* B26 */
        case 'parcel thing': var pt = parcelFor(me()); return pt ? pt.name : parcelOpened || 'none';
        case 'map here': return PAGE_ROOM[(leaving && state.visitPlace) || place] || 'none';   /* his own dot's model room (req 242) */
        case 'map nearest': return mapNearest();                        /* the grown-up whose dot is nearest his (B14 t1) */
        case 'reading': return readingBook();                           /* the book he is reading, 0 till set (B12 t1) */
        case 'parent parcel': return settings.parcel || 'none';         /* what a parent sends by owl from the grown-up corner */
        case 'home howler': return homeHowler() ? 'written' : 'none';   /* a Howler line written at the letter page (req 193) */
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

    /* ---------- the Marauder's Map (board req 242) ---------- */

    /* The page he is on as the castle model's room, for his own dot; the den is the page's to say (`map here`). */
    var PAGE_ROOM = { 'common room': 'common-room', corridor: 'corridor', dormitory: 'dormitory', 'entrance hall': 'entrance-hall' };
    function readingBook() { return castleYear(); }   /* `reading` is deprecated: it reads the castle's year (Rework 2) */
    /* The castle's year (the world rules, Time; the Ministry's Rework 2, req 431): the last book he has finished, 0 to
       7, a grown-up's setting (settings.finished), ?year=N or ?finished=N for a test; 0 till set, the Stone's year
       with no book's traces. The old ?reading= and settings.reading still count, read as the same year, until every
       chain has moved to `year`. One clock: every chain and page reads this. A shared trip's lower year waits on the
       shared trip itself, not built yet. */
    function castleYear() {
      var r = Math.floor(+(params.get('year') || params.get('finished') || params.get('reading') || settings.finished || settings.reading || 0));
      return r >= 1 && r <= 7 ? r : 0;
    }
    /* The castle's era (req 1376, Godric's 2 of 28 October 2026): `1890s` always, the school the boys play in; `books`
       for the books' own castle, which the walk-throughs of Book 4 on will open (settled 41, 42). Filch, Mrs Norris and
       Hagrid, and anything else that belongs to the books' castle, carry `era = books` in their `when`. Only ?era=books
       (a test) turns it for now: no setting reads it until those walk-throughs are built. */
    function castleEra() { return params.get('era') === 'books' ? 'books' : '1890s'; }
    /* The castle's date as a school-year key (docs/room-states.md): the year, then the day from 1 September, so a
       trace of book N from its own date reads `castle date >= N mm-dd` and holds in every later year too (the world
       rules, traces keep their dates). Months September to August, each given 31 days. */
    function schoolKey(n, md) {
      var m = /^(\d\d)-(\d\d)$/.exec(md || '');
      return m ? n * 1000 + ((+m[1] + 3) % 12) * 31 + +m[2] : null;
    }
    function castleDateKey() { return schoolKey(castleYear(), monthDay(castleDay())); }   /* real calendar till req 1110's story day (settled 50) */
    /* The castle's calendar day (docs/room-states.md §7 6; the change list's Rework 3; the world rules, Time): the real
       day, except in the summer holidays, from the day after the leaving feast to 31 August, when the castle holds in
       the feast week of the term just finished, repeating, each day on the same weekday (a summer Tuesday is the feast
       week's Tuesday). `date`, `weekday`, `day of week`, `easter`, `castle date`, `occasion` and `lessons` read it; the
       hour, the weather, the moon, the week and every stamp stay real. OVERTAKEN IN PART (Godric, 25 October 2026,
       settled 50; req 1110): the real day and the summer hold below are the stand-in until Story settles a story day
       per boy, stepped by events; the hour of day keeps his own clock (req 439). Proposal: docs/handoff/events.md,
       "Req 1110, the story's date by progress". */
    var heldBack = {};        /* days the summer holds each day back, by its day number, worked once a day */
    function castleDay() {
      var now = nowDate(), k = dayNumber(now), off = heldBack[k];
      if (off === undefined) {
        var feast = feastDay(now.getFullYear());
        off = 0;
        if (isoDay(now) > feast && now.getMonth() < 8) {
          var f = new Date(+feast.slice(0, 4), +feast.slice(5, 7) - 1, +feast.slice(8, 10), 12);
          off = 7 * Math.ceil((k - dayNumber(f)) / 7);
        }
        heldBack[k] = off;
      }
      return off ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - off, now.getHours(), now.getMinutes(), now.getSeconds()) : now;
    }
    function clockMin(t) { var m = /^(\d\d):(\d\d)$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; }
    function inHours(from, to, mins) {
      var a = clockMin(from), b = clockMin(to);
      if (a == null || b == null) return true;
      return a <= b ? mins >= a && mins < b : mins >= a || mins < b;      /* a span may run past midnight */
    }
    function atMeals(mins) {
      return MEALS.some(function (m) { return inHours(m.from, m.to, mins); });
    }
    function minsNow() { var now = nowDate(); return now.getHours() * 60 + now.getMinutes(); }
    function monthDay(d) { return ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    function easterNear(d) { return Math.abs(dayNumber(d) - dayNumber(easterSunday(d.getFullYear()))) <= 7; }
    /* The meal now (§7 2): by the one table of hours, every day of the year. */
    function mealNow() {
      if (mealOverride) return mealOverride;
      if (timeOverride) return 'none';
      var mins = minsNow();
      for (var i = 0; i < MEALS.length; i++) if (inHours(MEALS[i].from, MEALS[i].to, mins)) return MEALS[i].meal;
      return 'none';
    }
    /* The occasion today (§7 3): the whole day, every year alike, never gated on `year`. */
    function occasionNow() {
      if (occasionOverride) return occasionOverride;
      var now = castleDay(), md = monthDay(now);
      if (md === '12-25') return 'christmas day';
      if (md >= CHRISTMAS.from || md <= CHRISTMAS.to) return 'christmas';
      if (md === '10-31') return 'halloween';
      if (md === '09-01') return 'start of term';      /* the story's is 3 September 1897 (settled 65); req 1110 */
      if (isoDay(now) === feastDay(now.getFullYear())) return 'leaving feast';
      if (easterNear(now)) return 'easter';
      return 'none';
    }
    /* Lessons (§7 4): on in the teaching hours (LESSON_HOURS, the one value) of every day in term, weekends included
       (the charter, 15 October 2026: "Lessons run whenever they visit, weekends included"; Fawkes's 1, 16 October
       2026, 9.48 am); off on a match day, the school at the pitch, over Christmas and Easter, and on the
       start-of-term and leaving-feast days. The summer holds in the feast week (§7 6), so its days but the feast's
       have lessons, the last week of term. (Req 1110: the day that decides it becomes the story day; classes open
       on the Monday after the sorting, settled 64.) */
    function lessonsNow() {
      if (lessonsOverride) return lessonsOverride;
      if (timeOverride) return 'off';
      var occ = occasionNow();
      if (matchNow() === 'yes') return 'off';
      if (/^(christmas|christmas day|easter|start of term|leaving feast)$/.test(occ)) return 'off';
      var mins = minsNow();
      return LESSON_HOURS.some(function (h) { return inHours(h.from, h.to, mins); }) ? 'on' : 'off';
    }
    /* The meal last ended (req 480), for what a meal leaves until the next: the latest of the day's meals whose hours
       are over, so lunch's leavings stand from half past one until dinner, and none from midnight until breakfast is
       done, the hall cleared in the night (the hours ours). With ?time= alone none; ?last-meal= sets it for a look. */
    function lastMealNow() {
      if (lastMealOverride) return lastMealOverride;
      if (timeOverride) return 'none';
      var mins = minsNow(), last = 'none';
      for (var i = 0; i < MEALS.length; i++) if (mins >= clockMin(MEALS[i].to)) last = MEALS[i].meal;
      return last;
    }
    /* A match day (req 480): the castle's day is one of MATCHES's Saturdays, read through the summer hold (whose June
       has none). The whole day; a match morning is `match = yes` with `meal = breakfast`. */
    function matchNow() {
      if (matchOverride) return matchOverride;
      var d = castleDay();
      if (d.getDay() !== 6) return 'no';
      var m = d.getMonth() + 1, nth = Math.ceil(d.getDate() / 7);
      var last = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getMonth() !== d.getMonth();
      return MATCHES.some(function (f) { return f[0] === m && (f[1] === nth || (f[1] === -1 && last)); }) ? 'yes' : 'no';
    }
    /* The summer (req 480): yes while the hold is on (§7 6), from the day after the leaving feast to 31 August, so a
       thing that stays from the feast through the summer visits (the winner's hangings) reads it. */
    function summerNow() {
      if (summerOverride) return summerOverride;
      return dayNumber(castleDay()) !== dayNumber(nowDate()) ? 'yes' : 'no';
    }
    /* The club now (req 499): `duelling` from eight to nine on a club Friday (CLUB), else none; with ?time= alone none,
       as the meal; ?club=duelling for a look. */
    function clubNow() {
      if (clubOverride) return clubOverride;
      if (timeOverride) return 'none';
      var d = castleDay();
      if (d.getDay() !== CLUB.day || nowDate().getHours() !== CLUB.hour || occasionNow() !== 'none') return 'none';
      return castleDateKey() >= schoolKey(CLUB.from[0], CLUB.from[1]) ? 'duelling' : 'none';
    }
    /* Each dot's place now: the first of its rounds whose hours and `when` hold, its places taken in turn every so
       many minutes (10 unless named) counted from the date and clock alone, so both castles' Maps agree. A figure
       standing or heard on a page this visit is drawn on that page instead (the Map never lies, PoA 18), then PoA 10's
       three on his first look; his own dot comes first, where he stands, labelled by a grown-up's settings.name. */
    function mapDots() {
      if (!dotDefs) return null;
      var now = nowDate(), mins = now.getHours() * 60 + now.getMinutes(), abs = dayNumber(now) * 1440 + mins;
      var fl = dotDefs.first_look || {}, first = fl.dots && allHold(fl.when || []) ? fl.dots : [];
      var seen = (visit && visit.seen) || {};
      var mine = playerOf(owl.playing);
      var out = [{ who: 'me', label: (mine && mine.name) || settings.name || null, place: value('map here'), move: 'walk', me: true }];
      /* his brother's dot where he last stood (Godric's events-map-brother-1013, 1), his name from this iPad; pacing
         when he stayed long in one room, as Dumbledore paces his study (t1, PoA 10) */
      /* set aside (changes/events.md, the brother's dot ruled out; docs/ministry/set-aside.md), kept until Godric's yes */
      if (!BROTHER_DOT_ASIDE) (owl.players || []).forEach(function (pl) {
        var w = (owl.where || {})[pl.id];
        if (pl.id === owl.playing || !mine || !w || !ROOM.test(w.room || '')) return;
        out.push({ who: 'brother', label: pl.name, place: w.room, brother: true, at: w.at,
                   move: w.at - w.since >= PACE_MIN * 60000 ? 'pace' : 'still' });
      });
      (dotDefs.people || []).forEach(function (p) {
        if (p.when && !allHold(p.when)) return;
        var dot = { who: p.who, label: p.label, move: p.move || 'walk', cheek: !!p.cheek };
        var met = (p.names || []).map(function (n) { return seen[n]; }).filter(Boolean)[0];
        var f = first.filter(function (x) { return x.who === p.who; })[0];
        if (met) { dot.place = PAGE_ROOM[met] || met; dot.met = true; }
        else if (f) { dot.place = f.place; dot.move = f.move || dot.move; dot.first = true; }
        else {
          var step = (p.rounds || []).filter(function (st) {
            var hours = st.at === 'meals' ? atMeals(mins) : inHours(st.from, st.to, mins);
            return hours && allHold(st.when || []);
          })[0];
          if (!step || !(step.places || []).length) return;              /* off the Map at this hour */
          dot.place = step.places[Math.floor(abs / (step.every || 10)) % step.places.length];
        }
        out.push(dot);
      });
      return out;
    }
    /* A place's middle in the castle's frame, x, y and z in metres, from the Architect's model if the page loaded it. */
    function placeAt(id) {
      var M = window.CASTLE_MODEL;
      if (!M) return null;
      function mid(sh) {
        if (!sh) return null;
        if (sh.point) return sh.point;
        if (sh.circle) return sh.circle;
        if (sh.c) return sh.c;
        if (sh.ellipse) return sh.ellipse.slice(0, 2);
        var r = sh.rect ? [sh.rect] : sh.rects, pts = sh.poly || sh.line;
        if (r) pts = r.map(function (q) { return [(q[0] + q[2]) / 2, (q[1] + q[3]) / 2]; });
        if (!pts || !pts.length) return null;
        return [pts.reduce(function (t, q) { return t + q[0]; }, 0) / pts.length, pts.reduce(function (t, q) { return t + q[1]; }, 0) / pts.length];
      }
      function levelZ(l) { var v = (M.levels || []).filter(function (x) { return x.id === l; })[0]; return v ? v.z : 0; }
      function inRoom(room, xy) {
        var g = room.group && (M.groups || []).filter(function (x) { return x.id === room.group; })[0];
        if (!g || !g.place) return [xy[0], xy[1], room.z != null ? room.z : levelZ(room.level)];
        var t = (g.place.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
        return [g.place.x + xy[0] * c - xy[1] * s, g.place.y + xy[0] * s + xy[1] * c, (g.place.z || 0) + (room.floor || 0)];
      }
      var room = (M.rooms || []).filter(function (x) { return x.id === id; })[0];
      if (room) { var m = mid(room.shape); return m && inRoom(room, m); }
      var ft = (M.features || []).filter(function (x) { return x.id === id; })[0];
      if (ft && ft.at) { var fr = (M.rooms || []).filter(function (x) { return x.id === ft.room; })[0]; return fr ? inRoom(fr, ft.at) : null; }
      var lists = [M.grounds, M.masses, M.courts, M.towers];
      for (var l = 0; l < lists.length; l++) {
        var e = (lists[l] || []).filter(function (x) { return x.id === id; })[0];
        if (e) { var em = mid(e.shape || e); return em && [em[0], em[1], 0]; }
      }
      return null;
    }
    /* The grown-up whose dot stands nearest his own (B14 t1: a pupil's dot is passed over), by the model; Snape where
       the model is not loaded or his own place is not in it, since the first tap ever is Snape's (B14). */
    function mapNearest() {
      var dots = mapDots() || [], here = placeAt(dots.length ? dots[0].place : null), best = 'snape', bd = Infinity;
      if (!here) return best;
      dots.forEach(function (d) {
        if (!d.cheek) return;
        var at = placeAt(d.place);
        if (!at) return;
        var dd = Math.pow(at[0] - here[0], 2) + Math.pow(at[1] - here[1], 2) + Math.pow(at[2] - here[2], 2);
        if (dd < bd) { bd = dd; best = d.who; }
      });
      return best;
    }

    /* The week's word from a chain's `words` (the password, board req 72): the nth of its list in the nth week since
       its `first_monday`, so the story starts where Harry's did and both castles agree; the list is only ever added
       to at its end, so no week's word moves. Past the end it starts again at `again_from` (the first invented
       word). Before the first Monday it is the first word; `last` before the first week is `none`.
       A list `by_year` (the password, Magic's req 596, the change list's Rework 19) gives each visited castle year its
       own list, its book's words alternating with the invented ones (`later` for a year not yet listed), and
       `first_monday: "term"` counts from the term's first Monday of the visited school year, the first Monday on or
       after 1 September, on the castle's calendar day, so both boys' castles of one year agree. */
    function termMonday(d) {
      var y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1, s = new Date(y, 8, 1, 12);
      return new Date(y, 8, 1 + (8 - s.getDay()) % 7, 12);
    }
    function weekWord(name, off) {
      var d = wordDefs[name], list = d.list || [];
      if (d.by_year) list = d.by_year[String(castleYear())] || d.by_year.later || list;
      var term = d.first_monday === 'term', day = term ? castleDay() : nowDate();
      var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(d.first_monday || '');
      if (!m && !term) note('words ' + name + ': no first_monday, so this week is its first');
      var first = term ? weekNumber(termMonday(day)) : m ? weekNumber(new Date(+m[1], +m[2] - 1, +m[3])) : weekNumber(day);
      var n = Math.max(0, weekNumber(day) - first) + off;
      if (n < 0 || !list.length) return 'none';
      var from = Math.min(Math.max(0, d.again_from || 0), list.length - 1);
      if (n >= list.length) n = from + (n - from) % (list.length - from);
      return list[n];
    }

    /* `brother X` reads the var X of the boy who is not playing, from his satchel (`lumos.player.<id>`, one iPad, two
       boys); undefined when there is no brother or he has never set it, so a count reads 0 and a flag reads unset. */
    function brotherVar(n) {
      var bro = brotherOf(me()), bag = bro ? load(SATCHEL + bro.id) : null, st = null;
      try { st = bag && bag[STATE_KEY] ? JSON.parse(bag[STATE_KEY]) : null; } catch (e) { st = null; }
      return st && st.vars ? st.vars[n] : undefined;
    }
    function value(name) {
      name = name.trim();
      if (name.indexOf('days since ') === 0) {
        var s = state.stamps[name.slice(11)];
        return s == null ? Infinity : today() - s;     /* a stamp never made reads as forever */
      }
      if (name.indexOf('real days since ') === 0) {     /* for a stamp made `by real day` (req 1127) */
        var sr = state.stamps[name.slice(16)];
        return sr == null ? Infinity : realToday() - sr;
      }
      if (name.indexOf('nights since ') === 0) {      /* for a stamp made `by night` (the full moon's owl, req 101) */
        var sn = state.stamps[name.slice(13)];
        return sn == null ? Infinity : tonight() - sn;
      }
      if (name.indexOf('mark ') === 0) return visit && visit.marks[name.slice(5)] ? 'taken' : 'free';   /* a mark a figure stands on this visit */
      if (name.indexOf('been ') === 0) return visit && visit.pages.indexOf(name.slice(5)) >= 0 ? 'yes' : 'no';   /* did this visit reach that page */
      if (name.indexOf('drawn ') === 0) return drawnList().indexOf(name.slice(6)) >= 0 ? 'yes' : 'no';         /* has the page a drawing of it */
      if (name.indexOf('learned ') === 0) return learnedSpell(name.slice(8)) ? 'yes' : 'no';                  /* has he cast it on the Charms page (req 125, 179) */
      if (name.indexOf('brother ') === 0) return brotherVar(name.slice(8));                                   /* his brother's var, from the satchel (events-norris-lets-pass-1022) */
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
      if (m[1] === 'place' && placeDefs[raw]) {
        if (op !== '=' && op !== '!=') { note('a list of places reads = or !=: ' + cond); return false; }
        return (placeDefs[raw].indexOf(lhs) >= 0) === (op === '=');
      }
      var rhs = /^-?\d+$/.test(raw) ? +raw : (raw === 'today' || stampNames[raw]) ? value(raw) : raw;
      if (m[1] === 'castle date') { var dm = /^([0-7]) (\d\d-\d\d)$/.exec(raw); rhs = dm ? schoolKey(+dm[1], dm[2]) : null; if (rhs == null) { note('castle date needs N mm-dd: ' + cond); return false; } }
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
      return t;
    }

    /* A thing's state as it turns up this time (req 169): by weight, never the one it came in last time. Where the
       page names any state of it as drawn (`<find>.<state>` in `opts.drawn`, req 274), only those, so the thing in
       his hand is the state drawn (v=31). */
    function drawState(t) {
      var all = (t.states || []).map(function (s) { return typeof s === 'string' ? { state: s, weight: 1 } : s; });
      var named = drawnList().filter(function (d) { return d.indexOf(t.item + '.') === 0; })
        .map(function (d) { return d.slice(t.item.length + 1); });
      if (named.length) {
        all = all.filter(function (s) { return named.indexOf(s.state) >= 0; });
        if (!all.length) note(t.item + ': the page draws ' + named.join(', ') + ', none of them a state of it');
      }
      if (!all.length) return undefined;
      var last = state.thingStates[t.item];
      var pool = all.length > 1 ? all.filter(function (s) { return s.state !== last; }) : all;
      var total = 0, k;
      for (k = 0; k < pool.length; k++) total += pool[k].weight == null ? 1 : pool[k].weight;
      var x = Math.random() * total;
      for (k = 0; k < pool.length - 1; k++) { x -= pool[k].weight == null ? 1 : pool[k].weight; if (x < 0) break; }
      return (state.thingStates[t.item] = pool[k].state);
    }

    /* A deck (req 165): of the cards whose `when` holds, one by weight, never the one the variable holds already (so
       Morgana comes often but never twice running); every card drawn is kept in order found, for the den, and the
       day each card first came, for the lives shelf (Magic's B7). Returns the card and whether he had it already. */
    function drawFromDeck(name, current, rec) {
      var cards = deckDefs[name];
      if (!cards) { note(rec.id + ': no deck named ' + name); return undefined; }
      var held = cards.filter(function (c) { return allHold(c.when); });
      var pool = held.length > 1 ? held.filter(function (c) { return c.item !== current; }) : held;
      if (!pool.length) { note(rec.id + ': no card in deck ' + name + ' holds now'); return undefined; }
      var total = 0, k;
      for (k = 0; k < pool.length; k++) total += pool[k].weight == null ? 1 : pool[k].weight;
      var x = Math.random() * total;
      for (k = 0; k < pool.length - 1; k++) { x -= pool[k].weight == null ? 1 : pool[k].weight; if (x < 0) break; }
      var had = (state.deckFound[name] = state.deckFound[name] || []).indexOf(pool[k].item) >= 0;
      state.deckFound[name].push(pool[k].item);
      var first = state.deckFirst[name] = state.deckFirst[name] || {};
      if (!had && !first[pool[k].item]) first[pool[k].item] = isoDay(nowDate());
      return { item: pool[k].item, again: had };
    }

    /* A spell he has learned, as the Charms page keeps it on the device (page/charms/spells.js, `learn(name)`). */
    function learnedSpell(spell) {
      try { return localStorage.getItem('lumos.spells.learned.' + spell) === '1'; } catch (e) { return false; }
    }

    function isoDay(d) {
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
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
              var thing = drawFromBag(m[2].slice(9), rec);
              if (thing !== undefined) {
                state.vars[m[1]] = thing.item;
                var st = drawState(thing);
                if (st !== undefined) state.vars[m[1] + '_state'] = st;
                else delete state.vars[m[1] + '_state'];
              }
              return;
            }
            if (m[2].indexOf('from deck ') === 0) {
              var card = drawFromDeck(m[2].slice(10), state.vars[m[1]], rec);
              if (card !== undefined) { state.vars[m[1]] = card.item; state.vars[m[1] + '_again'] = card.again ? 'yes' : 'no'; }
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
          case 'stamp-night': state.stamps[m[1]] = tonight(); return;
          case 'stamp-real': state.stamps[m[1]] = realToday(); return;
          case 'slot': state.slot = m[1] === 'take' ? rec.id : null; return;
          case 'log': logLine(m[1]); return;
          case 'secret': if (state.secrets.indexOf(m[1]) < 0) state.secrets.push(m[1]); return;   /* once ever (req 180) */
          case 'point': award(m[1], m[2], +m[3], rec); return;
          case 'parcel': parcelDo(m[1], rec); return;   /* the owl post between the boys (B26) */
        }
      }
      note(rec.id + ': effect does not parse: ' + text);
    }

    /* A house point (req 216): once ever by kind and thing, kept as a slip in the order earned; the page is told of
       each new one as it lands, so the gems fall as it is given. */
    function award(kind, thing, n, rec) {
      if (thing.charAt(0) === '{') {
        var v = value(thing.slice(1, -1));
        if (v === undefined || v === null || v === '') { note(rec.id + ': no ' + thing + ' to award a point for'); return; }
        thing = String(v);
      }
      if (kind === 'given') { giveFor(thing, n, rec); return; }
      for (var i = 0; i < state.points.length; i++) {
        var had = state.points[i];
        if (!had.from && had.kind === kind && had.thing === thing) return;   /* his brother's first lumos never blocks his own */
      }
      var slip = { kind: kind, thing: thing, points: n, on: isoDay(nowDate()), record: rec.id };
      if (castleHouse()) slip.house = castleHouse();               /* whose it is (req 227) */
      state.points.push(slip);
      logLine(n + ' house points for ' + kind + ' ' + thing + ', {day}');
      if (opts.point) { try { opts.point(withReason(slip)); } catch (e) { note('the page could not take a point: ' + e); } }
      heapGrew = true;
      if (kind !== 'year') owlSync();
    }

    /* A slip as handed out, with its reason as the leaving feast reads it (Magic's reasons' words, req 216): the
       words for its kind and thing, else for its kind, `{thing}` the thing as said (a card's `say`, a spell's words
       each with its capital, else its words, hyphens as spaces). Read fresh each time, never kept, so an old slip, or one from the other
       castle, reads the newest words; its `year` too, the school year it was earned in, read from its day. */
    function withReason(p) {
      var out = Object.assign({}, p);
      if (/^\d{4}-\d\d-\d\d$/.test(p.on || '')) out.year = schoolYear(p.on);   /* the school year it fell in */
      var what = p.kind === 'given' ? String(p.thing).split(' ')[0] : p.thing;   /* a gift's slip: the thing, its week after */
      var r = reasonDefs[p.kind + ' ' + what] || reasonDefs[p.kind];
      if (!r || !r.words) return out;
      var said = String(what).replace(/-/g, ' ');
      for (var d in deckDefs) {
        var c = deckDefs[d].filter(function (x) { return x.item === what && x.say; })[0];
        if (c) { said = c.say; break; }
      }
      if (p.kind === 'spell') said = said.replace(/(^| )\S/g, function (ch) { return ch.toUpperCase(); });
      out.reason = r.words.replace(/\{thing\}/g, said);
      return out;
    }

    /* ---------- the owl's post (board req 216; Godric's events-two-castles-server, 1, with t1) ---------- */
    /* Copies only: every slip stays on this iPad and is earned with no signal; the store (tools/owl-store, a small
       Worker on the free plan) carries copies between the two castles, so a castle offline, or a store gone, loses
       nothing here. Only points and houses travel, never a name. */
    function randomId() {
      var a = new Uint8Array(16), s = '';
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(a);
      else for (var i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
      for (var j = 0; j < a.length; j++) s += (a[j] % 36).toString(36);
      return s;
    }
    var owl = load(OWL_KEY) || {};
    if (!/^[a-z0-9]{8,32}$/.test(owl.castle || '')) owl.castle = randomId();
    var PLAYER = /^[a-z0-9]{8,32}$/, NAME = /^[\p{L}][\p{L} '\-]{0,23}$/u, ROOM = /^[a-z][a-z0-9\-]{1,39}$/;
    function playerOf(id) { return (owl.players || []).filter(function (x) { return x.id === id; })[0] || null; }
    /* Who this castle is at the store: the boy playing, once the boys are named in the link; else this iPad's id. */
    function me() { return (owl.players && playerOf(owl.playing)) ? owl.playing : owl.castle; }
    /* The pairing link, opened once on each iPad by a grown-up: #owl= the store's address and the family key, as
       base64 of { s, k }; read, kept and taken off the address at once, so it is never in a bookmark or a shot. */
    var pairing = /[#&]owl=([A-Za-z0-9_\-]+)/.exec(location.hash || '');
    if (pairing) {
      try {
        var pj = JSON.parse(atob(pairing[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (/^https:\/\/[a-z0-9.\-]+(:\d+)?\/?$/.test(pj.s || '') && /^[A-Za-z0-9_\-]{16,}$/.test(pj.k || '')) {
          owl.store = pj.s.replace(/\/+$/, ''); owl.key = pj.k;
          /* one castle (Godric's fawkes-one-castle-1013): the boys as `p`, each a random id made once at the deploy
             and the same on every iPad, with his name if the family file holds one; the name stays on the iPad */
          var ps = (Array.isArray(pj.p) ? pj.p : []).filter(function (x) { return x && PLAYER.test(x.i || ''); });
          if (ps.length) {
            owl.players = ps.map(function (x) {
              return { id: x.i, name: typeof x.n === 'string' && NAME.test(x.n.trim()) ? x.n.trim() : null };
            });
            if (!playerOf(owl.playing)) owl.playing = null;   /* the first name tapped takes the castle as it stands */
          }
          note('paired with the owl\'s store');
        } else note('the owl\'s link does not name a store and a key');
      } catch (e) { note('the owl\'s link does not read'); }
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* no history: nothing to tidy */ }
      if (bare && (owl.players || []).length && owl.store && owl.key) owl.restoring = true;   /* his castle backed up: bring it down */
    }
    save(OWL_KEY, owl);
    /* A point for a thing he gave (req 298), waiting in the iPad's owl since his brother opened it: his own from the
       start of his turn, so it is in his heap before the page draws it, and posted as his own. */
    if (owl.given && !owl.restoring && playerOf(owl.playing) && (owl.given[owl.playing] || []).length) {
      owl.given[owl.playing].forEach(function (g) {
        for (var i = 0; i < state.points.length; i++) {
          var p = state.points[i];
          if (!p.from && p.kind === g.kind && p.thing === g.thing) return;
        }
        var mine = { kind: g.kind, thing: g.thing, points: g.points, on: g.on, record: g.record };
        if (castleHouse()) mine.house = castleHouse();
        state.points.push(mine);
      });
      delete owl.given[owl.playing];
      save(OWL_KEY, owl);
      save(STATE_KEY, state);
    }
    var owlBusy = false, owlAgain = false, owlRun = null, owlClock = 0, owlWaited = false, heapGrew = false;
    function slipKey(p) { return p.kind + ' ' + p.thing; }
    function owlCall(method, path, body) {
      return fetch(owl.store + path, {
        method: method, cache: 'no-store', body: body ? JSON.stringify(body) : undefined,
        headers: { authorization: 'Bearer ' + owl.key, 'content-type': 'application/json' }
      }).then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); });
    }
    /* A slip lands here once, by whose it is, kind and thing, however often it comes (the store, or his brother's
       satchel on this iPad): his brother's with `from`; his own earned on the other iPad as his own, so it counts
       once ever wherever he plays (one castle). Returns true if it was new. */
    function landSlip(s, from, waited) {
      var own = from === me();
      for (var i = 0; i < state.points.length; i++) {
        var p = state.points[i];
        if ((own ? !p.from : p.from === from) && p.kind === s.kind && p.thing === s.thing) return false;   /* landed before */
      }
      var slip = { kind: s.kind, thing: s.thing, points: s.points, on: s.on, record: s.record };
      if (s.house) slip.house = s.house;
      if (own) state.owl.posted[slipKey(slip)] = 1;
      else slip.from = from;
      state.points.push(slip);
      state.owl.waiting.push(state.points.length - 1);
      if (waited) state.owl.waited = true;
      return true;
    }
    /* One castle, two boys on one iPad: his brother's slips come straight from his satchel here, signal or none, and
       a slip of his a grown-up took back is marked here too. */
    function landFromSatchels() {
      var landed = 0;
      state.owl.backsPosted = state.owl.backsPosted || {};
      (owl.players || []).forEach(function (pl) {
        if (pl.id === me()) return;
        var bag = load(SATCHEL + pl.id), st = null;
        try { st = bag && bag[STATE_KEY] ? JSON.parse(bag[STATE_KEY]) : null; } catch (e) { st = null; }
        ((st && st.points) || []).forEach(function (s) {
          if (s.from || !s.house || s.kind === 'year') return;
          if (landSlip(s, pl.id, false)) landed++;
          var mine = slipOf(pl.id, s.kind, s.thing);
          if (s.back && mine && !mine.back) { state.owl.backsPosted[pl.id + ' ' + s.kind + ' ' + s.thing] = 1; markBack(mine, s.backOn); }
        });
      });
      return landed;
    }
    /* Where each boy last stood, a castle model room's id and never a name (Godric's events-map-brother-1013, 1): kept
       on the iPad for both, so a brother on this iPad is known without signal, and carried by the owl. `since` is when
       he came into that room, so a long stay shows (t1, his dot paces there). */
    function noteWhere() {
      if (!owl.players || !playerOf(owl.playing)) return null;
      var room = value('map here');
      if (!ROOM.test(room || '') || room === 'none') return null;
      owl.where = owl.where || {};
      var w = owl.where[owl.playing], now = Date.now();
      if (!w || w.room !== room) w = { room: room, since: now };
      w.at = now;
      owl.where[owl.playing] = w;
      save(OWL_KEY, owl);
      return w;
    }
    /* Post this castle's new slips, then fetch the other's since the last. A slip waits to be posted till it has a
       house (stamped at the first start that knows one); a `year` slip is never posted. A slip posted after a post
       failed, or on a later day than it was earned, goes marked `late`. Resolves true if anything new landed. */
    function owlSync() {
      var near = owl.players ? landFromSatchels() : 0;
      var w = noteWhere();
      if (dated || !owl.store || !owl.key) {
        if (near) { save(STATE_KEY, state); owlDeliver(); }
        return Promise.resolve(near > 0);
      }
      if (owlBusy) { owlAgain = true; return owlRun; }     /* one at a time: a second asks the first to go again */
      owlBusy = true;
      var o = state.owl, day = isoDay(nowDate());
      var out = (state.points || []).filter(function (p) {
        return !p.from && p.house && p.kind !== 'year' && !o.posted[slipKey(p)];
      });
      var sent = !out.length ? Promise.resolve() : owlCall('POST', '/slips', { castle: me(), slips: out.map(function (p) {
        var c = { kind: p.kind, thing: String(p.thing), points: p.points, on: p.on, record: p.record, house: p.house };
        if (o.postFailed || p.on < day) c.late = true;
        return c;
      }) }).then(function () {
        out.forEach(function (p) { o.posted[slipKey(p)] = 1; });
        o.postFailed = false;
      }, function (e) { o.postFailed = true; note('the owl could not take this castle\'s slips (' + e.message + ')'); });
      var whereSent = !w ? Promise.resolve() : owlCall('POST', '/where', { castle: me(), room: w.room, since: w.since, at: w.at })
        .then(null, function (e) { note('the owl could not take where he stands (' + e.message + ')'); });
      owlRun = sent.then(postBacks).then(postSatchels).then(function () { return whereSent; }).then(function () {
        return owlCall('GET', '/slips?castle=' + me() + '&after=' + (o.after || 0) + '&afterBack=' + (o.afterBack || 0));
      }).then(function (got) {
        var landed = near;
        (got.slips || []).forEach(function (s) {
          if (!s || !PLAYER.test(s.castle || '')) return;
          if (landSlip(s, s.castle, s.late || o.fetchFailed)) landed++;
        });
        if (+got.last > (o.after || 0)) o.after = +got.last;
        (got.backs || []).forEach(function (b) {
          var p = slipOf(b.castle, b.kind, b.thing);
          o.backsPosted[b.castle + ' ' + b.kind + ' ' + b.thing] = 1;     /* known at the store: never posted again */
          if (p && !p.back) markBack(p, b.on);
        });
        if (+got.lastBack > (o.afterBack || 0)) o.afterBack = +got.lastBack;
        (got.wheres || []).forEach(function (x) {                         /* his brother's last room, the newer kept */
          if (!x || x.castle === me() || !playerOf(x.castle) || !ROOM.test(x.room || '')) return;
          owl.where = owl.where || {};
          var had = owl.where[x.castle];
          if (!had || +x.at > +had.at) owl.where[x.castle] = { room: x.room, since: +x.since || +x.at, at: +x.at };
        });
        save(OWL_KEY, owl);
        o.fetchFailed = false;
        return landed;
      }, function (e) {
        o.fetchFailed = true;
        note('the owl could not reach the store (' + e.message + ')');
        return near;
      }).then(function (landed) {
        owlBusy = false;
        save(STATE_KEY, state);
        owlDeliver();
        if (owlAgain) { owlAgain = false; return owlSync().then(function (more) { return landed > 0 || more; }); }
        return landed > 0;
      });
      return owlRun;
    }
    /* A slip by the castle that earned it, its kind and thing: this castle's own, or one with `from`. */
    function slipOf(castle, kind, thing) {
      for (var i = 0; i < state.points.length; i++) {
        var p = state.points[i];
        if (p.kind === kind && p.thing === thing && (castle === me() ? !p.from : p.from === castle)) return p;
      }
      return null;
    }
    /* A point taken back (Design's req 237): marked, never removed, and the page told, so its stones fly up. */
    function markBack(p, day) {
      p.back = true;
      p.backOn = /^\d{4}-\d\d-\d\d$/.test(day || '') ? day : isoDay(nowDate());
      save(STATE_KEY, state);
      logLine(p.points + ' house points for ' + p.kind + ' ' + p.thing + ' taken back, {day}');
      if (opts.back) { try { opts.back(withReason(p)); } catch (e) { note('the page could not take a point back: ' + e); } }
    }
    /* The backs this castle's grown-up took, posted once each, by the castle that earned the slip. */
    function postBacks() {
      var o = state.owl;
      o.backsPosted = o.backsPosted || {};
      var out = (state.points || []).filter(function (p) {
        return p.back && p.kind !== 'year' && !o.backsPosted[(p.from || me()) + ' ' + p.kind + ' ' + p.thing];
      });
      if (!out.length) return Promise.resolve();
      return owlCall('POST', '/backs', { castle: me(), backs: out.map(function (p) {
        return { castle: p.from || me(), kind: p.kind, thing: String(p.thing), on: p.backOn };
      }) }).then(function () {
        out.forEach(function (p) { o.backsPosted[(p.from || me()) + ' ' + p.kind + ' ' + p.thing] = 1; });
      }, function (e) { note('the owl could not take the slips taken back (' + e.message + ')'); });
    }

    /* ---------- one castle, a player for each boy (Godric's fawkes-one-castle-1013, his option 4) ---------- */
    /* No password: on opening, the castle asks who is playing and he taps his name. Each boy keeps his own place,
       finds and letters: every lumos. key on the iPad is his while he plays (every lane's, so no page need know),
       and at his brother's tap they are packed into his satchel (SATCHEL + his id), his brother's unpacked, and the
       page reloads, so every page reads the right boy's castle from its first line. The owl's pairing, the satchels
       and who is playing are the iPad's, never packed. The house points both boys earn reach each other's glass as
       before (the owl, or a satchel on this iPad). */
    function iPadKey(k) { return k === OWL_KEY || k.indexOf(SATCHEL) === 0; }
    function liveKeys() {
      var out = [];
      try { for (var i = 0; i < localStorage.length; i++) out.push(localStorage.key(i)); }
      catch (e) { return []; }
      return out.filter(function (k) { return k && k.indexOf('lumos.') === 0 && !iPadKey(k); });
    }
    function satchelHouse(id) {
      var raw = id === me() ? localStorage.getItem(SETTINGS_KEY) : ((load(SATCHEL + id) || {})[SETTINGS_KEY]);
      var s = null;
      try { s = raw ? JSON.parse(raw) : null; } catch (e) { s = null; }
      return (s && HOUSES[String(s.house || '').trim().toLowerCase()]) || null;
    }
    function playersNow() {
      var list = (owl.players || []).map(function (p) {
        return { id: p.id, name: p.name, house: satchelHouse(p.id), playing: p.id === owl.playing };
      });
      return { ask: list.length >= 2 && (!playerOf(owl.playing) || !!owl.ask), playing: playerOf(owl.playing) ? owl.playing : null,
               list: list };
    }
    /* ---------- the owl post between the boys (Magic's B26, req 294) ---------- */
    /* A thing from his den to his brother's, by a school owl, free (GoF 18: anyone can use them). The parcel waits in
       the iPad's owl, one each way, for his brother's own turn; it is gone from the sender's castle as the owl takes it
       and in his brother's once opened, nothing lost between. */
    var parcelOpened = null, parcelOpenedFrom = null;
    function brotherOf(id) { return (owl.players || []).filter(function (p) { return p.id !== id; })[0] || null; }
    function parcelFor(id) { return (owl.parcels || {})[id] || null; }
    function canSend() {
      if ((owl.players || []).length < 2 || !playerOf(owl.playing)) return null;
      var b = brotherOf(owl.playing);
      return b ? { to: b.id, name: b.name, waiting: !!parcelFor(b.id) } : null;
    }
    function send(thing) {
      var c = canSend();
      if (!c || c.waiting || !thing) return false;
      var name;
      if (thing.kind === 'card') {
        var list = (state.deckFound || {}).frogs || [], at = list.lastIndexOf(thing.name);
        if (at < 0) return false;
        list.splice(at, 1);                                    /* a spare goes first: the copy found last */
        name = thing.name;
      } else if (thing.kind === 'knut') {
        if (!(+state.vars.knuts > 0)) return false;
        state.vars.knuts = +state.vars.knuts - 1;
        name = 'knut';
      } else return false;
      owl.parcels = owl.parcels || {};
      owl.parcels[c.to] = { from: owl.playing, kind: thing.kind, name: name, at: Date.now(), landed: false };
      save(OWL_KEY, owl);
      save(STATE_KEY, state);
      logLine('Sent his brother ' + (name === 'knut' ? 'a Knut' : 'a card') + ' by owl, {day}');
      if (visit) { moment('owl sent'); changed(); }
      return true;
    }
    /* `land parcel`: the owl has set it on the sill; `open parcel`: the thing goes into his castle. */
    function parcelDo(how, rec) {
      var p = parcelFor(me());
      if (!p || !playerOf(owl.playing)) { note(rec.id + ': no parcel waiting for him'); return; }
      if (how === 'land') { p.landed = true; save(OWL_KEY, owl); return; }
      if (p.kind === 'card') {
        var found = (state.deckFound.frogs = state.deckFound.frogs || []), had = found.indexOf(p.name) >= 0;
        found.push(p.name);
        var first = state.deckFirst.frogs = state.deckFirst.frogs || {};
        if (!had && !first[p.name]) first[p.name] = isoDay(nowDate());
      } else state.vars.knuts = (+state.vars.knuts || 0) + 1;
      parcelOpened = p.name; parcelOpenedFrom = p.from;
      delete owl.parcels[me()];
      save(OWL_KEY, owl);
    }
    /* `point given`: the point is the sender's (Magic's req 298). The first parcel opened each week from him earns it;
       his copy goes to the page now, as his brother's slips do but from the sill and with no owl, and his own waits in
       the iPad's owl for his next turn. */
    function giveFor(thing, n, rec) {
      var from = parcelOpenedFrom;
      if (!from || !playerOf(from) || from === me()) { note(rec.id + ': no parcel opened from his brother to give a point for'); return; }
      var d = nowDate(), monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7);
      var week = isoDay(monday);
      for (var i = 0; i < state.points.length; i++) {
        var had = state.points[i];
        if (had.kind === 'given' && had.from === from && String(had.thing).split(' ')[1] === week) return;   /* one a week each way */
      }
      var slip = { kind: 'given', thing: thing + ' ' + week, points: n, on: isoDay(d), record: rec.id };
      var bag = load(SATCHEL + from), his = null;
      try { his = bag && bag[SETTINGS_KEY] ? JSON.parse(bag[SETTINGS_KEY]) : null; } catch (e) { his = null; }
      var house = his && HOUSES[String(his.house || '').trim().toLowerCase()];
      owl.given = owl.given || {};
      (owl.given[from] = owl.given[from] || []).push(Object.assign({}, slip));
      save(OWL_KEY, owl);
      if (house) slip.house = house;
      slip.from = from;
      state.points.push(slip);
      logLine(n + ' house points to his brother for a thing given, {day}');
      if (opts.point) { try { opts.point(withReason(slip)); } catch (e) { note('the page could not take a point: ' + e); } }
      heapGrew = true;
    }
    function parcelNow() {
      var p = parcelFor(me());
      if (!p || !playerOf(owl.playing)) return null;
      var from = playerOf(p.from);
      return { from: p.from, name: from ? from.name : null, kind: p.kind, thing: p.name, landed: !!p.landed };
    }
    /* ---------- his castle backed up (Godric's events-q-one-ipad-1013, 1, 13 October 2026) ---------- */
    /* One iPad, so a backup, never a sync. Each named boy's castle, every lumos. key of his, is sealed on the iPad
       (AES-GCM, its key drawn from the family key) and kept at the store, which holds a blob it cannot read and never
       a name. `owl.played` is when he last tapped anything; at an owl's look, when he has played since his copy last
       went up (`owl.sent`) and ten minutes have passed since then (`owl.sentAt`), the copy goes up, the live castle
       for the boy playing and the satchel for his brother. The pairing link opened on an iPad with no castle on it
       (Safari emptied it, or a reset) sets `owl.restoring`: each boy's copy comes down into his satchel, `carried`
       yes in its state for his trunk at his bed's foot (trunk.json, PS 7), and nothing posts until the store has
       answered, so an empty castle never goes up over his. No crypto, no store or no signal: the castle here. */
    var SEAL_MAX = 900000, BACKUP_S = 600;
    owl.played = owl.played || {}; owl.sent = owl.sent || {}; owl.sentAt = owl.sentAt || {};
    var sealKeyP = null, restoreRun = null, restoreLast = Promise.resolve(false);
    function sealable() {
      return !!(owl.store && owl.key && owl.players && window.crypto && window.crypto.subtle && window.TextEncoder);
    }
    function sealKey() {
      if (!sealKeyP) sealKeyP = window.crypto.subtle.digest('SHA-256', new TextEncoder().encode('lumos satchel ' + owl.key))
        .then(function (raw) { return window.crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']); });
      return sealKeyP;
    }
    function toB64(u) { var s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
    function fromB64(b) { var s = atob(b), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
    function seal(bag) {
      var iv = new Uint8Array(12);
      window.crypto.getRandomValues(iv);
      return sealKey().then(function (k) {
        return window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(JSON.stringify(bag)));
      }).then(function (ct) { var c = new Uint8Array(ct), all = new Uint8Array(12 + c.length); all.set(iv); all.set(c, 12); return toB64(all); });
    }
    function unseal(b) {
      var all = fromB64(b);
      return sealKey().then(function (k) { return window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.subarray(0, 12) }, k, all.subarray(12)); })
        .then(function (pt) { return JSON.parse(new TextDecoder().decode(pt)); });
    }
    function liveBag() { var bag = {}; liveKeys().forEach(function (k) { bag[k] = localStorage.getItem(k); }); return bag; }
    function playedNow() { if (owl.players && playerOf(owl.playing)) { owl.played[owl.playing] = Date.now(); save(OWL_KEY, owl); } }
    /* Up: each boy's castle he has played since its copy last went up, at most once in ten minutes a boy. */
    function postSatchels() {
      if (!sealable() || owl.restoring || packed) return Promise.resolve();
      return Promise.all(owl.players.map(function (pl) {
        var at = +owl.played[pl.id] || 0, now = Date.now();
        if (!at || at <= (+owl.sent[pl.id] || 0) || now - (+owl.sentAt[pl.id] || 0) < BACKUP_S * 1000) return null;
        if (pl.id === owl.playing) save(STATE_KEY, state);
        var bag = pl.id === owl.playing ? liveBag() : load(SATCHEL + pl.id);
        if (!bag) return null;
        return seal(bag).then(function (blob) {
          if (blob.length > SEAL_MAX) { note('his castle is too big for the owl to carry (' + blob.length + ')'); return null; }
          return owlCall('POST', '/satchel', { castle: pl.id, at: at, blob: blob }).then(function () {
            if ((+owl.sent[pl.id] || 0) < at) owl.sent[pl.id] = at;
            owl.sentAt[pl.id] = now;
            if (!packed) save(OWL_KEY, owl);
          });
        }).then(null, function (e) { note('the owl could not take his castle (' + e.message + ')'); });
      }));
    }
    /* Down, once, on an iPad emptied and paired again: each boy's copy into his satchel; for the boy already
       playing (he tapped before it came), his castle unpacked at once and the page reloaded. No answer from the
       store: `owl.restoring` stays, and the next start asks again. */
    function restoreBackup() {
      if (!owl.restoring || !sealable()) return Promise.resolve();
      if (restoreRun) return restoreRun;
      var failed = false, landed = [];
      restoreRun = Promise.all(owl.players.map(function (pl) {
        return owlCall('GET', '/satchel?castle=' + pl.id).then(function (got) {
          if (!got || typeof got.blob !== 'string' || !(+got.at > 0)) return null;
          return unseal(got.blob).then(function (bag) {
            var his = {};
            Object.keys(bag || {}).forEach(function (k) { if (k.indexOf('lumos.') === 0 && !iPadKey(k)) his[k] = bag[k]; });
            var st = null;
            try { st = his[STATE_KEY] ? JSON.parse(his[STATE_KEY]) : null; } catch (e) { st = null; }
            if (st) { st.vars = st.vars || {}; st.vars.carried = 'yes'; his[STATE_KEY] = JSON.stringify(st); }   /* t1, his trunk */
            save(SATCHEL + pl.id, his);
            owl.played[pl.id] = owl.sent[pl.id] = +got.at; owl.sentAt[pl.id] = Date.now();
            landed.push(pl.id);
          });
        }).then(null, function (e) { failed = true; note('the owl could not bring his castle back (' + e.message + ')'); });
      })).then(function () {
        restoreRun = null;
        if (failed) return false;
        owl.restoring = false;
        save(OWL_KEY, owl);
        note('his castle backed up: ' + landed.length + ' brought back');
        if (playerOf(owl.playing) && landed.indexOf(owl.playing) >= 0) unpack(owl.playing, null);
        return landed.length > 0;
      });
      restoreLast = restoreRun;
      return restoreRun;
    }
    /* His castle in for the castle here: the castle here into `away` (his brother's satchel), or kept one deep at
       `lumos.player.<id>.before` when no one else owns it; then the page reloads. */
    function unpack(id, away) {
      if (visit) leave();
      save(STATE_KEY, state);
      var bag = liveBag();
      save(away ? SATCHEL + away : SATCHEL + id + '.before', bag);
      var his = load(SATCHEL + id) || {};
      Object.keys(bag).forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      Object.keys(his).forEach(function (k) { if (k.indexOf('lumos.') === 0 && !iPadKey(k)) try { localStorage.setItem(k, his[k]); } catch (e) {} });
      try { localStorage.removeItem(SATCHEL + id); } catch (e) {}
      owl.playing = id;
      save(OWL_KEY, owl);
      packed = true;                                   /* nothing of the boy who went is saved over his brother's */
      (opts.reload || function () { location.reload(); })();
    }
    /* His tap on his name. The same boy, or the first tap on an iPad that had no player yet (he takes the castle as
       it stands): the castle carries on, false. His brother's, or a first tap with his castle brought back from the
       backup waiting in his satchel: the castles swap and the page reloads, true. */
    function play(id) {
      if (!playerOf(id)) { note('no player ' + id); return false; }
      var was = playerOf(owl.playing) ? owl.playing : null;
      owl.ask = false; owl.chosenAt = Date.now();
      if (was === id || (!was && !load(SATCHEL + id))) {
        owl.playing = id;
        save(OWL_KEY, owl);
        draw();
        owlSync();
        return false;
      }
      unpack(id, was);
      return true;
    }
    /* In the common room, the owl brings what has landed: the moment `owl post` (its cue the owl at the sill, or
       Errol when a copy waited out of signal), then the page is told each slip, so his brother's gems fall. Away
       from the common room they wait for his next time there. */
    function owlDeliver() {
      var o = state.owl;
      if (!visit || place !== 'common room' || !o.waiting.length) return;
      var slips = o.waiting.map(function (i) { return state.points[i]; }).filter(Boolean);
      owlWaited = o.waited;
      o.waiting = []; o.waited = false;
      save(STATE_KEY, state);
      heapGrew = true;
      moment('owl post');
      owlWaited = false;
      for (var i = 0; i < slips.length; i++) {
        if (opts.point) { try { opts.point(withReason(slips[i])); } catch (e) { note('the page could not take a point: ' + e); } }
      }
      settleHeap();
    }
    /* This school year's heap, both boys' gems, and whether it has passed last year's (Magic's *Against the year*):
       from the second year, once a year, the `year` slip itself left out of every heap. */
    function heap(y) {
      return (state.points || []).reduce(function (t, p) {
        return t + (p.kind !== 'year' && !p.back && /^\d{4}-\d\d-\d\d$/.test(p.on || '') && schoolYear(p.on) === y ? p.points : 0);
      }, 0);
    }
    function bestYear() {
      var y = schoolYear(isoDay(nowDate())), last = heap(y - 1);
      for (var i = 0; i < state.points.length; i++) {
        if (!state.points[i].from && state.points[i].kind === 'year' && state.points[i].thing === String(y)) return false;
      }
      return last > 0 && heap(y) > last;
    }
    /* After a slip lands, once the moment that gave it is over: `points grow`. */
    var momentDepth = 0;
    function settleHeap() {
      if (!heapGrew || momentDepth || !visit) return;
      heapGrew = false;
      moment('points grow');
    }

    /* A room rule that names no place was written for the first three pages, which share their chains (the common
       room, the corridor, the dormitory); on any other page it holds nowhere, so a new room shows only the rules that
       name it (the Great Hall lane's note, 15 October 2026: the chess set and the fire showed in the hall). */
    var FIRST_PAGES = ['common room', 'corridor', 'dormitory'];
    function roomRuleHolds(rule) {
      var w = rule.when || [];
      if (FIRST_PAGES.indexOf(builtin('place')) < 0 && !w.some(function (k) { return /^place\s*(=|!=)/.test(k); })) return false;
      return allHold(w);
    }
    function shownCues() {
      var out = [];
      for (var c = 0; c < chains.length; c++) {
        var rules = chains[c].room || [];
        for (var i = 0; i < rules.length; i++) if (roomRuleHolds(rules[i])) out = out.concat(rules[i].show || []);
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

    /* `{password}`, `{last password}`, `{next password}`: a chain's week's words in a line, after `{intro}`. `{card}`
       (any variable a deck sets): the `say` of the card it holds, the name a voice uses for it. `{year}`: this year,
       for his own line on the little door's list (board req 177). `{howler}`: the Howler line written at the letter
       page, in capitals, a Howler shouting (board req 193). */
    function fillWords(text) {
      return text.replace(/\{((?:last |next )?[a-z]+)\}/g, function (all, n) {
        if (n === 'year') return String(nowDate().getFullYear());
        if (n === 'howler') return homeHowler().toUpperCase();
        var v = /^(?:(?:last|next) )?([a-z]+)$/.exec(n);
        if (wordDefs[v[1]]) return String(value(n));
        var held = state.vars[n];
        for (var d in deckDefs) {
          var c = deckDefs[d].filter(function (x) { return x.item === held && x.say; })[0];
          if (c) return c.say;
        }
        return all;
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
        if (line.medium === 'written') state.written[line.key] = { record: rec.id, key: line.key, hand: line.hand, at: line.at, text: text, day: today(), t: (state.wseq = (state.wseq || 0) + 1) };
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
      /* Who stands or is heard on this page this visit, by name, so the Map draws his dot here (req 242) */
      var seenWho = rec.who || [];
      for (var sw = 0; sw < seenWho.length && !leaving; sw++) {
        if (seenWho[sw].name && /^(canon|ghost|voice)$/.test(seenWho[sw].role)) (visit.seen = visit.seen || {})[seenWho[sw].name] = place;
      }
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
      momentDepth++;
      try { momentNow(name); } finally { momentDepth--; }
      settleHeap();
    }
    function momentNow(name) {
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
                     warned: visit.warned, lightsOut: visit.lightsOut, waiting: visit.waiting, quiet: visit.quiet,
                     seen: visit.seen || {} };
    }
    function restore() {
      var k = state.kept || {};
      return { id: k.id, smallOn: !!k.smallOn, bigOn: !!k.bigOn, bigDone: k.bigDone !== false, small: k.small || [],
               marks: k.marks || {}, cast: k.cast || [], pages: k.pages || [state.visitPlace], waits: [], lastTap: {}, tapped: false,
               played: k.played || 0, warned: !!k.warned, lightsOut: !!k.lightsOut, waiting: k.waiting || {},
               quiet: k.quiet || quietSpans(), idle: 0, quietDone: {}, listen: null, seen: k.seen || {} };
    }

    /* A new visit on this page; one still open runs its leave first. */
    function arrive() {
      if (state.visitOpen) leave();
      if ((owl.players || []).length >= 2 && Date.now() - (owl.chosenAt || 0) > ASK_S * 1000) { owl.ask = true; save(OWL_KEY, owl); }   /* who is playing? */
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
      owlDeliver();
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
      owlDeliver();
    }

    /* The page that loads decides what the last one's going was. `?from=` names the page the visit was on, as the
       pages' own trips write it: `room` (the common room), `corridor`, `dormitory`, with `&bedtime` after it on the
       lights-out trip (`dormitory.html?from=room&bedtime`, `?from=corridor&bedtime`). `?from=sleep`, the waking, is
       always a new visit (Godric, 9 October 2026, 7.32 am), as is any word that names no page. A crossing needs the
       page it names to have run this runtime: the dormitory's stair carries the visit once that page starts it with
       place `dormitory`, and until then a trip down from it is a new visit. */
    var FROM = { room: 'common room', corridor: 'corridor', dormitory: 'dormitory' };
    /* the shells' own trips write their place's id (`shell.html?place=<to>&from=entrance-hall`, req 278): a shell
       started with that place, its hyphens as spaces, carries the visit as a room does */
    function fromPage(w) {
      if (FROM[w]) return FROM[w];
      return /^[a-z][a-z0-9\-]{1,39}$/.test(w || '') && w !== 'sleep' ? w.replace(/-/g, ' ') : null;
    }
    function begin() {
      var fromPlace = fromPage(params.get('from'));
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
      playedNow();
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
      owlClock += dt;
      if (owlClock >= OWL_S) { owlClock = 0; owlSync(); }
      for (var i = 0; i < visit.waits.length; i++) {
        var w = visit.waits[i];
        if (w.left == null) continue;
        w.left -= dt;
        if (w.left <= 0) { w.left = null; moment(w.name); if (!visit) return; }
      }
      clockTick(); if (!visit) return;
      visit.idle += dt;
      for (var q in visit.quiet) {
        if (visit.quietDone[q] || visit.idle < visit.quiet[q]) continue;
        visit.quietDone[q] = true;
        moment(q);
        if (!visit) return;
      }
      bedtimeTick(dt);
    }

    /* `clock HH:MM` (req 676): the clock passed that minute since this page's last tick, he here all the while; the
       first tick on a page only starts the count, so arriving, or crossing from another page, never brings it. */
    var clockMoments = [], clockFor = -1;
    function clockTick() {
      var t = nowDate().getTime(), was = visit.clockAt;
      visit.clockAt = t;
      if (clockFor !== records.length) {          /* the records' clock moments, found again only when a chain loads */
        clockMoments = []; clockFor = records.length;
        for (var i = 0; i < records.length; i++) {
          var name = records[i].moment || '', m = CLOCK.exec(name);
          if (m && !clockMoments.some(function (c) { return c.name === name; })) clockMoments.push({ name: name, h: +m[1], min: +m[2] });
        }
      }
      if (was == null || t <= was) return;
      for (var j = 0; j < clockMoments.length; j++) {
        var c = clockMoments[j];
        for (var back = 0; back < 2; back++) {        /* today's minute, or yesterday's when the span crossed midnight */
          var d = new Date(t - back * 86400000), at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), c.h, c.min, 0, 0).getTime();
          if (at > was && at <= t) { moment(c.name); if (!visit) return; break; }
        }
      }
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
    /* Set aside (the Ministry's sweep; Fawkes, 15 October 2026, 1.27 pm, provisional, Godric to confirm): a part
       of a chain marked `aside` (a record, a room rule, a bag's thing, a card, a dot, a line, or the whole chain) is
       out of play, every word kept in its file until Godric says yes to its line in docs/ministry/set-aside.md.
       It is taken out here, once, as the chain is read, so nothing else in the runtime ever sees it. */
    function unAside(x) {
      if (Array.isArray(x)) {
        return x.filter(function (v) { return !(v && typeof v === 'object' && 'aside' in v); }).map(unAside);
      }
      if (x && typeof x === 'object') {
        var out = {};
        for (var k in x) if (!(x[k] && typeof x[k] === 'object' && !Array.isArray(x[k]) && 'aside' in x[k])) out[k] = unAside(x[k]);
        return out;
      }
      return x;
    }
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
        if ('aside' in files[f]) { note(files[f].chain + ' is set aside'); continue; }
        files[f] = unAside(files[f]);
        chains.push(files[f]);
        var tg = files[f].targets || {};
        for (var t in tg) targets[t] = tg[t];
        var bg = files[f].bags || {};
        for (var b in bg) bagDefs[b] = bg[b];
        var pl = files[f].places || {};
        for (var pn in pl) placeDefs[pn] = pl[pn];
        var dk = files[f].decks || {};
        for (var d in dk) deckDefs[d] = dk[d];
        var wd = files[f].words || {};
        for (var w in wd) wordDefs[w] = wd[w];
        var rd = files[f].reasons || {};
        for (var rn in rd) reasonDefs[rn] = rd[rn];
        if (files[f].dots) dotDefs = files[f].dots;
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
      restoreBackup();
      owlSync();
    });

    return {
      ready: ready,
      tick: tick,
      moment: moment,
      tap: tap,
      password: function () { if (visit) checkEnds('password'); },   /* the password given and the Fat Lady swung open */
      /* He has held the zoom close on a thing (board req 126, the page's name for it): counted once ever, kept on the
         iPad, and a new one raises `look close` (the Omnioculars earned by looking, req 127). */
      lookClose: function (name) {
        name = String(name || '').trim().toLowerCase();
        if (!visit || !name) return;
        state.looked = state.looked || [];
        if (state.looked.indexOf(name) >= 0) return;
        state.looked.push(name);
        moment('look close');
        if (visit) changed();
      },
      /* A var as the records read it (req 954, the giant board's kept position): `read('giant')` is on, waiting, none
         or undefined; any var, a built-in's name too, so the page asks the one clock and never keeps a copy. */
      read: function (name) { return value(String(name || '').trim()); },
      /* A short string of the page's own, kept with the chain's vars on this iPad and so in this boy's satchel (req 954:
         the giant board's squares, to come back to). Only a name beginning `kept_`, the text 600 characters or fewer of
         letters, digits, spaces and . , : ; | / _ - ; `keep(name)` or `keep(name, '')` clears it. Read back by
         `read(name)`; a record may also end it (`set kept_giant = none`, which the page reads as no position).
         Returns true if it was written or cleared. */
      keep: function (name, text) {
        name = String(name || '').trim();
        if (!/^kept_[a-z][a-z0-9_]{0,30}$/.test(name)) return false;
        if (text == null || text === '') { delete state.vars[name]; save(STATE_KEY, state); return true; }
        text = String(text);
        if (text.length > 600 || !/^[A-Za-z0-9 .,:;|\/_\-]*$/.test(text)) return false;
        state.vars[name] = text;
        save(STATE_KEY, state);
        return true;
      },
      /* The cards of a deck he has found, in the order found, repeats and all (the Chocolate Frog cards for the den
         behind the brass key's door, req 165): `found('frogs')`. */
      found: function (name) { return ((state.deckFound || {})[name] || []).slice(); },
      /* The day each card of a deck first came to him, yyyy-mm-dd by card (the lives shelf, Magic's B7: a life
         arrives the day he first finds that person's card); a repeat leaves it as it was. `foundOn('frogs')`. */
      foundOn: function (name) { return Object.assign({}, (state.deckFirst || {})[name] || {}); },
      /* The Marauder's Map now (req 242): { dots, crowd, unmapped, here }. `dots` his own first ({ who: 'me', label,
         place, me: true }), then each named dot { who, label, place (a castle model id), move (pace, prowl, bounce,
         drift, stride, walk, still, flicker), cheek, met (seen on a page this visit), first (PoA 10's first look) };
         `crowd` the Great Hall's place at meals, or null; `unmapped` the places not on the Map just now (the Room of
         Requirement; the den till his first visit). Null if no chain has dots. Whether it is blank or inked is the
         room's cues (map.json's room rules). */
      map: function () {
        var dots = mapDots();
        if (!dots) return null;
        var now = nowDate(), mins = now.getHours() * 60 + now.getMinutes();
        return { dots: dots, here: dots[0].place,
                 crowd: dotDefs.crowd && atMeals(mins) ? dotDefs.crowd.place : null,
                 unmapped: (dotDefs.unmapped || []).filter(function (u) { return !(u.until && allHold(u.until)); })
                                                   .map(function (u) { return u.place; }) };
      },
      reading: readingBook,
      /* The castle's year, the last book he has finished, 0 to 7 (Rework 2, req 431): pages read this, never ?finished=. */
      year: castleYear,
      /* The castle's secrets he has found, in the order found, each once (req 180; for the Map, B10). */
      secrets: function () { return (state.secrets || []).slice(); },
      /* The house points earned on this iPad, a slip each in the order earned: { kind, thing, points, on (yyyy-mm-dd),
         record, house, reason } (req 216; for the hourglass and the leaving feast's slips, Magic's t1); `house` is the
         earner's (req 227), missing only while no house is set, when the hourglass reads it as this castle's own;
         `reason` is read from the records' reasons as the slip is handed out (Magic's reasons' words), and `year`,
         the school year it was earned in (its leaving feast's year, `feast()`). */
      points: function () { return (state.points || []).map(withReason); },
      /* This castle's own house as the hourglass draws it (lion, snake, badger, eagle), or null until a grown-up sets
         it (settings.house; ?house= for a test): the first of the hourglass's `houses` (req 227). */
      house: castleHouse,
      /* The owl's post (req 216): `owl()` gives this castle's id and whether it is paired, never the key; `sync()`
         posts and fetches now (the runtime does so at its start and each minute of a visit), resolving true if
         anything new landed. */
      owl: function () { return { castle: owl.castle, paired: !!(owl.store && owl.key), player: playerOf(owl.playing) ? owl.playing : null }; },
      /* One castle (Godric's fawkes-one-castle-1013): `players()` gives { ask, playing, list: [{ id, name, house,
         playing }] }; `ask` true when the castle should ask who is playing (on opening, a new visit a minute or more
         after the last tap, or no one chosen yet), the page drawing the boys' names to tap. `play(id)` is his tap:
         false, carry on; true, his brother's castle is unpacked and the page reloads (`opts.reload` for a test). The
         names come in the pairing link from the family file and stay on the iPad. */
      players: playersNow,
      /* resolves once a restore from the backup has had the store's answer (true if a castle came back) */
      restored: function () { return restoreRun || restoreLast; },
      play: play,
      /* The owl post between the boys (B26, v=32): whether he can send now, his send from the den, and the parcel
         waiting for him (its label's name is this iPad's name for his brother, never posted anywhere). */
      canSend: canSend,
      send: send,
      parcel: parcelNow,
      sync: owlSync,
      /* A grown-up takes a point back (Design's req 237; only a grown-up, a slip given in error: points are never lost
         in play, Magic's B11): `back(slip)`, the slip as `points()` handed it (its kind, thing and any `from`). It stays
         in the record marked `back: true` and `backOn`, out of the heap and every total; the page is told by
         `opts.back(slip)`; the owl carries it to the other castle. Resolves true if a slip was taken back. */
      back: function (slip) {
        if (!slip) return Promise.resolve(false);
        var p = slipOf(slip.from || me(), slip.kind, String(slip.thing));
        if (!p || p.back) return Promise.resolve(false);
        markBack(p);
        return owlSync().then(function () { return true; });
      },
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
      /* The castle's day as yyyy-mm-dd, `?date=` honoured (docs/room-states.md §7 1) and the summer held in the feast
         week (§7 6), so a page that dates a thing reads the one clock the records read, never its own copy of the link. */
      date: function () { return isoDay(castleDay()); },
      /* The real moon now (req 95): { phase, age (days since new), lit (0 to 1), waxing, up, altitude (degrees), height
         (0 to 1, of the way overhead), light (lit while up, else 0) }, `?moon=` honoured, so every room shows one moon. */
      moon: moonNow,
      /* The castle's sun now (req 439): { up, altitude (degrees, below 0 when set), bearing (degrees from north, east
         90), height (0 to 1) }, `?time=`, `?date=` and `?sun=` honoured, for the light through each face's windows. */
      sun: sunNow,
      /* The day's drivers for a page that draws before its chains ask (docs/room-states.md §7 2 to 4): the meal now,
         the occasion today, lessons on or off, each with its `?meal=`, `?occasion=`, `?lessons=` honoured. */
      meal: mealNow,
      occasion: occasionNow,
      lessons: lessonsNow,
      /* The Great Hall's three (req 480): the meal last ended, a match day, the summer hold, `?last-meal=`, `?match=`
         and `?summer=` honoured. */
      lastMeal: lastMealNow,
      match: matchNow,
      summer: summerNow,
      /* The Duelling Club's evening (req 499): duelling or none, `?club=` honoured. */
      club: clubNow,
      /* The day's weather (req 113): { sky (clear, cloudy, rain, snow, fog), wind (0 to 1), windy, ground (dry, wet,
         frost, snow), wet, frozen, warmth (C), cold, season (spring, summer, autumn, winter), date (mm-dd) }, one a day for
         the whole castle, `?weather=`, `?wind=`, `?season=` and `?date=` honoured, so every window shows one sky. */
      weather: weatherNow,
      cues: shownCues,
      fire: function (id) { if (byId[id] && visit) fire(byId[id]); },
      state: function () { return state; },
      log: function () { return state.log.slice(); },
      settings: function () { return settings; },
      /* His height in metres, a grown-up's setting (settings.height), for his line on the den's jamb (board req 187);
         ?height=1.32 sets it for a test; null until one is set, or if it is not a child's height (0.6 to 2 m). */
      height: function () {
        var h = +params.get('height') || +settings.height;
        return h >= 0.6 && h <= 2 ? h : null;
      },
      /* The home the telescopes' sky stands over (req 622; Godric's 2 on events-home-sky-1016): the town a grown-up
         sets once in the guarded setup (settings.home: lat and lon in degrees, north and east positive, and the
         town's name for the setup to show), kept on this iPad only; ?home=51.5,-0.1 for a test. Till one is set,
         42 north (the latitude the page kept before 15 October) at the meridian of the clock's zone in standard time,
         so the sky is the home's season and hour, a few degrees off at most. `set` says which. */
      home: function () {
        function ok(lat, lon) { return isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180; }
        var q = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(params.get('home') || '');
        if (q && ok(+q[1], +q[2])) return { lat: +q[1], lon: +q[2], town: null, set: true };
        var s = settings.home;
        if (s && s.lat !== '' && s.lon !== '' && s.lat != null && s.lon != null && ok(+s.lat, +s.lon))
          return { lat: +s.lat, lon: +s.lon, town: s.town ? String(s.town) : null, set: true };
        var y = new Date().getFullYear();
        var std = Math.max(new Date(y, 0, 1).getTimezoneOffset(), new Date(y, 6, 1).getTimezoneOffset());
        return { lat: 42, lon: -std / 4, town: null, set: false };
      },
      /* The school year now, named by the year its leaving feast falls in, and a year's feast day (yyyy-mm-dd; this
         year's if none is named): the boys' own last school day as a grown-up sets it, the last Friday of June till
         then, ?feast=06-19 for a test (Magic's *Against the year*). Each slip handed out carries its `year`. Named
         `schoolYear` since 15 October 2026: it had shared the key `year` with the castle's year above and won, so
         `year()` gave 2027, not 0 to 7 (the Corridor's find; Events' Q3, Fawkes's leave, 3.46 pm). */
      schoolYear: function () { return schoolYear(isoDay(nowDate())); },
      /* The dormitory door's year, 1 to 7, the castle's year on the one clock (req 263; Rework 35). */
      yearIn: yearIn,
      feast: function (y) { return feastDay(+y || schoolYear(isoDay(nowDate()))); },
      /* The school's own points in the Entrance Hall's four glasses today (req 632, Design's req 606): { levels: { lion,
         badger, eagle, snake }, full }, from the castle's year and day alone, `?date=` and `?year=` honoured, the same in
         both boys' castles of one year, for `LumosHourglass.hall({ levels, full })`. */
      schoolLevels: schoolLevels,
      visit: function () { return visit; },
      heard: heard,                                   /* guesses a page heard itself, as strings or { text } */
      listening: function () { return value('listening'); },
      /* The written lines' words as last drawn, by recording key, newest first: the room draws a pinned note from them
         (two in one day, as Percy's notes on his drawer after two visits, are told apart by the order drawn). */
      written: function () {
        var out = [];
        for (var k in state.written) out.push(state.written[k]);
        return out.sort(function (a, b) { return (b.day - a.day) || ((b.t || 0) - (a.t || 0)); });
      },
      /* Whether magic hides the thing a page names (its zoom's look name) now: a room rule's `hidden` list, read as
         its cues are, so the Omnioculars show only "something here" there until a spell opens it (req 145, 157). */
      hidden: function (name) {
        name = String(name || '').trim().toLowerCase();
        if (!name) return false;
        for (var c = 0; c < chains.length; c++) {
          var rules = chains[c].room || [];
          for (var i = 0; i < rules.length; i++) {
            if ((rules[i].hidden || []).indexOf(name) >= 0 && roomRuleHolds(rules[i])) return true;
          }
        }
        return false;
      }
    };
  }

  window.CastleEvents = { start: start, dayNumber: dayNumber, weatherAt: weatherAt, week: function (d) { return weekNumber(d || new Date()); } };
})();
