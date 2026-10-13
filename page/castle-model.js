/* The castle model: the one to-scale record of where everything in the castle is, read by the room pages, the
   Marauder's Map and the plan sheets (tools/castle-model.py reads the same block). Plain data only, one JSON object,
   so the line below and the closing one are the only code. Metres. The plan: x east, y north; z up.
   A group (a suite of rooms built together) has its own plan frame, placed in the castle by its place: model point =
   (place.x, place.y) + the group's point turned by place.turn degrees (counter-clockwise), and z = place.z + z.
   A page's own three.js point (x, y, z) maps into its group as (x, -z) turned by the room's frame.turn and moved by
   frame.x, frame.y; its height y as frame.z + y. A state is built (on a page), designed (settled, not built),
   books (the books fix it), proposed (the Architect's, open), or pending (waiting on a question). A bearing is in
   degrees about a round room's centre, from the group's y toward its x (clockwise seen from above); a cant is the
   degrees a window's outer opening turns from its bearing. The castle's own frame (site): the block's south-west
   corner at x 0, y 0, y true north. A room with no group, and every mass, court and tower, is in that frame. */
window.CASTLE_MODEL = {
  "version": 8,
  "units": "metres",
  "site": {
    "block": [0, 0, 160, 72], "front": "north", "lake": "south", "state": "designed",
    "storey": 5.2, "storey_about": "Godric's 3.1 (12 October 2026, 6.23 pm): the corridor's built 4.5 m and a 0.7 m vault, every moving flight alike; the Great Hall and the Entrance Hall rise through two storeys, the Entrance Hall opening into the stair hall's well, its ceiling too high to make out (PS 7)",
    "about": "One long east-west block, the front doors on the north, the lake and the cliff on the south (Godric's 2.1, 12 October 2026, 5.57 pm). One stair hall runs from the north range to the south face, the marble and moving staircases in its well.",
    "cite": "the author's grounds sketch (the southern approach over the lake, the front entrance at the north); PS 7, PS 8, HBP 24"
  },
  "grounds": [
    {"id": "lake", "shape": {"poly": [[-20, -8], [180, -8], [215, -25], [262, -40], [268, 0], [276, 36], [285, 66], [291, 82], [302, 84], [311, 77], [316, 52], [319, 18], [328, -16], [346, -46], [380, -60], [425, -85], [450, -160], [470, -300], [500, -450], [450, -600], [250, -660], [0, -650], [-200, -600], [-290, -450], [-310, -250], [-280, -80], [-250, 30], [-200, 85], [-130, 95], [-80, 60], [-45, 20]]}, "state": "books", "about": "south under the cliff, its east arm round the south-east corner, a west bay; an arm about 140 m long reaching north from the east shore to the beech, 46 m below the lawn in a glen (Godric's 225.1)", "cite": "PS 6, OotP 29, HBP 30; Godric's 4.1 (12 October 2026, 7.01 pm); Godric's 225.1 (13 October 2026, 10.55 am)"},
    {"id": "forbidden-forest", "shape": {"poly": [[300, 440], [330, 330], [362, 240], [400, 160], [425, 100], [432, 40], [425, -20], [440, -90], [470, -160], [490, -300], [640, -300], [640, 440]]}, "state": "books", "about": "from the north-east down the east side to the water", "cite": "PS 8, PS 9, HBP 30; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "hagrids-cabin", "shape": {"point": [396.7, 64.5]}, "state": "books", "about": "on the forest's edge, 80 degrees and 360 m from Gryffindor Tower: into the April sunrise from the dormitory's W2, 9 degrees right of its axis (Godric's 225.1); a pumpkin patch behind, a paddock by it", "cite": "PS 8, CoS 7, PoA 6, OotP 11, OotP 29, GoF 24; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "beech", "shape": {"point": [297.8, 89.0]}, "state": "books", "about": "at the head of the lake's arm, on its edge, on the dormitory's W2 axis, the window beside Neville's corner bed (71.2 degrees, 270 m from Gryffindor Tower); one worn patch of grass under it (Godric's t2)", "cite": "OotP 17, OotP 28, OotP 29, CoS 15; Godric's 4.1 (12 October 2026, 7.01 pm); Godric's 225.1 (13 October 2026, 10.55 am)"},
    {"id": "whomping-willow", "shape": {"point": [255.0, 110.0]}, "state": "proposed", "about": "between the castle and the cabin, clear of the lake's arm, about 50 m north-west of the beech", "cite": "CoS 5, PoA 17; Godric's 4.1 (12 October 2026, 7.01 pm); Godric's 225.1 (13 October 2026, 10.55 am)"},
    {"id": "greenhouses", "shape": {"rects": [[200, 24, 236, 30], [200, 33, 236, 39], [200, 42, 236, 48], [200, 51, 236, 57]]}, "state": "proposed", "about": "across the vegetable patch at the castle's east end (\"behind the castle\")", "cite": "PS 8, CoS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "vegetable-patch", "shape": {"rect": [166, 22, 194, 62]}, "state": "proposed", "about": "between the castle and the greenhouses", "cite": "CoS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "quidditch-pitch", "shape": {"ellipse": [-120.0, 230.0, 27.5, 76]}, "state": "proposed", "about": "north-west, down the sloping lawns, opposite the forest", "cite": "CoS 7, OotP 19; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "flying-lawn", "shape": {"rect": [-80, 105, -20, 145]}, "state": "proposed", "about": "west, on the opposite side of the grounds to the forest", "cite": "PS 9; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "gates", "shape": {"point": [80.0, 330.0]}, "state": "books", "about": "stone pillars topped with winged boars, the drive sweeping up to the front doors (258 m)", "cite": "PoA 5, GoF 12; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "drive", "shape": {"line": [[80.0, 72.0], [86, 140], [72, 230], [80, 330]]}, "state": "proposed", "about": "the front doors to the gates", "cite": "GoF 12; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "road-to-hogsmeade", "shape": {"line": [[80, 330], [78, 350], [0, 362], [-150, 382], [-320, 404]]}, "state": "books", "about": "left out of the gates to the village", "cite": "OotP 16; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "beauxbatons-carriage", "shape": {"point": [240.0, 160.0]}, "state": "books", "about": "200 yards from Hagrid's door, in GoF's year only", "cite": "GoF 16; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "durmstrang-ship", "shape": {"point": [-170.0, 52.0]}, "state": "proposed", "about": "moored in the lake's west bay, in GoF's year only", "cite": "GoF 18, GoF 24, GoF 35; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "white-tomb", "shape": {"point": [250.0, -30.0]}, "state": "proposed", "about": "beside the lake, looking over the east arm to the forest", "cite": "HBP 30, DH 24; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "station", "shape": {"point": [545.0, -445.0]}, "state": "proposed", "about": "across the lake to the south-east; the boats cross to the harbour under the cliff", "cite": "PS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "harbour", "shape": {"point": [86.0, -6.0]}, "state": "books", "about": "under the cliff, a passage in the rock up to the grass by the front steps", "cite": "PS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"}
  ],
  "ages": [
    { "key": "P1", "name": "the founders", "years": "about 990" },
    { "key": "P2", "name": "the first walls", "years": "1100 to 1200" },
    { "key": "P3", "name": "the towers of the houses", "years": "1250 to 1350" },
    { "key": "P4", "name": "the high towers", "years": "1400 to 1500" },
    { "key": "P5", "name": "Tudor", "years": "1500 to 1600" },
    { "key": "P6", "name": "the turret builders", "years": "1600 to 1750" },
    { "key": "P7", "name": "the last additions", "years": "1800 to 1900" }
  ],
  "ages_about": "The history's seven ages (docs/architect/hogwarts-history-2026-10-12.md), proposed under Godric's 6.1 (13 October 2026, 7.13 am): each mass and tower lists the ages that built or raised it, the first the oldest (tools/architect-accreted-castle.py's pieces by footprint).",
  "masses": [
    { "id": "north range", "rect": [0, 50, 160, 72], "floors": "G-7", "state": "designed", "ages": ["P2", "P3", "P4", "P5"] },
    { "id": "south range, west", "rect": [0, 0, 68, 18], "floors": "G-7", "state": "designed", "ages": ["P3", "P5"], "roof": 41.6, "parapet": 42.6, "about": "rises to the seventh floor for the Gryffindor corridor; a lead flat behind battlements, low enough that the dormitory's east windows (sills at 44.9) see over it" },
    { "id": "south range, east", "rect": [92, 0, 160, 18], "floors": "G-6", "state": "designed", "ages": ["P3", "P4", "P6"] },
    { "id": "west range", "rect": [0, 18, 16, 50], "floors": "G-7", "state": "designed", "ages": ["P3", "P6"] },
    { "id": "east range", "rect": [144, 18, 160, 50], "floors": "G-7", "state": "designed", "ages": ["P3", "P4"] },
    { "id": "stair hall", "rect": [68, 0, 92, 50], "floors": "G-7", "core": true, "state": "designed", "ages": ["P1", "P4"], "about": "the front doors to the cliff face, the marble and moving staircases in one well" },
    { "id": "cellars", "rect": [0, 0, 160, 72], "floors": "B", "state": "designed" }
  ],
  "courts": [
    { "id": "west courtyard", "rect": [16, 18, 68, 50], "state": "designed" },
    { "id": "east courtyard", "rect": [92, 18, 144, 50], "state": "designed" }
  ],
  "towers": [
    { "id": "Astronomy Tower", "c": [80, 77], "r": 8, "floors": "G-T", "high": true, "state": "designed", "ages": ["P2", "P4", "P6"], "about": "over the front doors", "cite": "DH 31, OotP 31, HBP 27" },
    { "id": "Ravenclaw Tower", "c": [-7.5, 34], "r": 8.5, "floors": "G-T", "high": true, "state": "designed", "ages": ["P3", "P5", "P6"], "about": "on the west side", "cite": "DH 31, OotP 18, DH 29" },
    { "id": "Gryffindor Tower", "c": [42.19, 1.95], "r": 6.4, "floors": "G-T", "high": true, "group": "gryffindor-suite", "state": "designed", "ages": ["P3", "P5", "P6"], "about": "the suite's tower (5.6 inside, a 0.8 wall), standing 4.45 m proud of the south face", "cite": "DH 31, OotP 21, OotP 29" },
    { "id": "West Tower", "c": [0, 72], "r": 8, "floors": "G-T", "state": "proposed", "ages": ["P2", "P3", "P4", "P6"], "about": "lower than the three highest" },
    { "id": "North Tower", "c": [160, 72], "r": 7.5, "floors": "G-T", "state": "proposed", "ages": ["P2", "P4", "P5", "P6"], "about": "lower than the three highest", "cite": "PoA 6, PoA 16" },
    { "id": "south-west tower", "c": [0, 0], "r": 7, "floors": "G-T", "state": "proposed", "ages": ["P2", "P4", "P5", "P6"], "about": "lower than the three highest" },
    { "id": "Dumbledore's tower", "c": [166, 40], "r": 6, "floors": "G-T", "state": "proposed", "ages": ["P4", "P5", "P6"], "about": "lower than the three highest" }
  ],
  "groups": [
    {
      "id": "gryffindor-suite",
      "name": "Gryffindor Tower and the Fat Lady's corridor, seventh floor",
      "about": "The group's frame: the tower's centre at the origin, y out through the round hole along the corridor toward its stair, x to the right looking that way; z 0 the seventh floor.",
      "place": { "x": 42.19, "y": 1.95, "turn": -90, "z": 36.4, "state": "designed",
        "about": "Godric's 1.1 (12 October 2026, 5.57 pm): the corridor along the south front, its windows over the lake, the tower at its west end, its landing on the stair hall's seventh floor (the landing's end at x 68). The group's y points east, its x south. z is the seventh floor's (Godric's 3.1, 6.23 pm).",
        "cite": "OotP 21, OotP 29, PoA 14" }
    }
  ],
  "levels": [
    { "id": "B", "name": "the cellars", "z": -5.2, "state": "designed" },
    { "id": "G", "name": "ground floor", "z": 0.0, "state": "designed" },
    { "id": "1", "name": "first floor", "z": 5.2, "state": "designed" },
    { "id": "2", "name": "second floor", "z": 10.4, "state": "designed" },
    { "id": "3", "name": "third floor", "z": 15.6, "state": "designed" },
    { "id": "4", "name": "fourth floor", "z": 20.8, "state": "designed" },
    { "id": "5", "name": "fifth floor", "z": 26.0, "state": "designed" },
    { "id": "6", "name": "sixth floor", "z": 31.2, "state": "designed" },
    { "id": "7", "name": "seventh floor", "z": 36.4, "state": "designed" },
    { "id": "tower", "name": "Gryffindor Tower above the seventh floor: the dormitories", "z": 43.8, "state": "designed", "about": "the tower's levels are its own, apart from the ranges' storeys: the common room 7.0 m high on the seventh floor, the dormitory's floor 7.4 m above it" }
  ],
  "rooms": [
    {
      "id": "common-room", "name": "Gryffindor common room", "group": "gryffindor-suite", "level": "7",
      "shape": { "circle": [0, 0], "r": 5.6 }, "wall": 0.8, "floor": 0, "ceiling": 7.0,
      "page": "common-room.html", "frame": { "x": 0, "y": 0, "turn": -48.7, "z": 0 },
      "state": "built", "cite": "PS 7, PS 9"
    },
    {
      "id": "dormitory", "name": "the first years' dormitory", "group": "gryffindor-suite", "level": "tower",
      "shape": { "circle": [0, 0], "r": 5.6 }, "wall": 0.8, "floor": 7.4, "ceiling": 11.9,
      "page": "dormitory.html", "frame": { "x": 0, "y": 0, "turn": -48.7, "z": 7.4 },
      "state": "built", "cite": "PS 7"
    },
    {
      "id": "corridor", "name": "the Fat Lady's corridor", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-1.5, 6.41, 1.5, 25.81] }, "walls": { "west": 0.3, "east": 0.45, "north": 0.3 },
      "floor": 0, "ceiling": 4.5,
      "page": "corridor.html", "frame": { "x": -2.31, "y": 8.71, "turn": -90, "z": 0 },
      "state": "built", "cite": "PS 7"
    },
    {
      "id": "inglenook", "name": "the inglenook, where visitors wait", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-3.7, 15.11, -1.5, 19.51] }, "floor": 0, "ceiling": 2.4,
      "state": "built", "cite": ""
    },
    {
      "id": "study", "name": "Clementine's study, a turret corbelled out from the tower", "group": "gryffindor-suite", "level": "7",
      "shape": { "circle": [-3.27, 5.55], "r": 2.2, "clip": { "x_max": -1.8 } }, "wall": 0.35, "floor": 0, "ceiling": 3.0,
      "state": "designed", "cite": ""
    },
    {
      "id": "lost-things", "name": "the room of lost things, behind the polite door", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-5.21, 8.16, -1.8, 9.26] }, "magic": "bigger inside", "floor": 0,
      "state": "designed", "cite": ""
    },
    {
      "id": "den", "name": "the den, behind the little door", "group": "gryffindor-suite", "level": "7",
      "shape": { "circle": [6.5, -6.0], "r": 2.25 }, "magic": "bigger inside; drawn where its door looks", "floor": 0, "ceiling": 3.6,
      "page": "common-room.html", "state": "built", "cite": ""
    },
    {
      "id": "room-of-requirement", "name": "the Room of Requirement, on its own corridor in the north range", "level": "7",
      "shape": { "rect": [29.65, 46.6, 34.35, 50.0] }, "magic": "there when needed; behind the blank stretch, over the courtyard's air",
      "state": "designed", "cite": "OotP 18, HBP 21, HBP 24; Godric's Q48b, option 3 (12 October 2026, 6.48 pm)"
    },
    {
      "id": "room-corridor", "name": "the Room's corridor, along the north range's courtyard face", "level": "7",
      "shape": { "rect": [16, 50.6, 68, 53.6] }, "walls": { "south": 0.6, "north": 0.4 },
      "about": "3.0 m wide as hers, from the west range to the stair hall's north landing (the top of the last staircase); windows on the courtyard; about 110 m' walk from her portrait",
      "state": "designed", "cite": "OotP 18; Godric's Q48b, option 3 (12 October 2026, 6.48 pm)"
    },
    {
      "id": "dumbledores-office", "name": "Dumbledore's office, circular, at the top of his tower", "level": "T",
      "shape": { "circle": [166, 40], "r": 4.5 }, "z": 43.0, "ceiling": 49.0, "map": "PoA 10: pacing his study",
      "about": "z and ceiling in the castle's frame; circular, so a tower (CoS 11, OotP 22); which tower is ours, by the gargoyle of HBP 25",
      "state": "inferred", "cite": "CoS 11, CoS 12, PoA 10"
    },
    {
      "id": "second-floor-corridor", "name": "the second floor's corridor, from the stair hall west along the court", "level": "2",
      "shape": { "rect": [16, 14.5, 68, 17.5] }, "map": "PoA 10: Mrs Norris prowling the second floor",
      "about": "the books give the floor only; 3.0 m wide, along the south range's courtyard face to the west range",
      "state": "proposed", "cite": "PoA 10"
    },
    {
      "id": "trophy-room", "name": "the trophy room", "level": "3",
      "shape": { "rect": [0, 24, 16, 44] }, "map": "PoA 10: Peeves bouncing around the trophy room",
      "about": "its floor from the books, its spot in the west range ours (the spaces list, 24)",
      "state": "books", "cite": "PS 9, PoA 10"
    },
    {
      "id": "great-hall", "name": "the Great Hall", "level": "G",
      "shape": { "rect": [15, 51.5, 65, 69.5] }, "map": "the meals",
      "about": "through a doorway to the right on entering (PS 7); 50 by 18 m ours; rises through two storeys",
      "state": "books", "cite": "PS 7, OotP 11"
    },
    {
      "id": "filchs-office", "name": "Filch's office", "level": "G",
      "shape": { "rect": [104, 62, 118, 70] }, "map": "his rounds start and end here",
      "about": "Harry follows him \"back downstairs\" (CoS 8); the ground floor and the north range ours",
      "state": "inferred", "cite": "CoS 8"
    },
    {
      "id": "mcgonagalls-office", "name": "Professor McGonagall's study", "level": "1",
      "shape": { "rect": [146, 52, 158, 60] }, "map": "a teacher's dot",
      "about": "\"Professor McGonagall's study on the first floor\" (PS 15); its spot beside her classroom ours",
      "state": "books", "cite": "PS 15"
    },
    {
      "id": "dungeon-corridor", "name": "the dungeon corridors", "level": "B",
      "shape": { "rect": [16, 3, 120, 15] }, "map": "B14 t2: the dot on the dungeon corridor is Snape",
      "about": "the dungeons under the south ranges, Potions and the deathday party's corridors (CoS 8); the spot ours",
      "state": "books", "cite": "CoS 8"
    },
    {
      "id": "witch-landing", "name": "the one-eyed witch's landing, near the marble staircase", "level": "3",
      "shape": { "rect": [60, 31, 68, 34] }, "map": "the passage to Honeydukes behind her hump",
      "about": "8 by 3 m (req 178, B8); the spot inferred, the spaces list's 26; the Architect's step 3 recommends it directly beneath the corridor page's landing run (site x 68 to 76, y 0.45 to 3.45), waiting on Godric's marks",
      "state": "inferred", "cite": "PoA 10, PoA 14"
    }
  ],
  "openings": [
    { "id": "portrait-hole", "kind": "round hole behind the Fat Lady", "between": ["corridor", "common-room"],
      "at": [0, 6.41], "facing": 0, "r": 0.6, "z": 1.2, "depth": 0.81, "state": "built", "cite": "PS 7" },
    { "id": "polite-door", "kind": "door", "between": ["corridor", "lost-things"], "at": [-1.5, 8.71], "w": 1.0, "h": 2.2,
      "state": "built", "cite": "" },
    { "id": "nook-mouth", "kind": "open mouth", "between": ["corridor", "inglenook"], "span": [[-1.5, 15.11], [-1.5, 19.51]],
      "h": 2.4, "state": "built", "cite": "" },
    { "id": "corridor-window-1", "kind": "window", "room": "corridor", "at": [1.95, 11.21], "w": 1.2, "sill": 0.9, "h": 2.4,
      "view": "the grounds", "state": "built", "cite": "" },
    { "id": "corridor-window-2", "kind": "window", "room": "corridor", "at": [1.95, 13.31], "w": 1.2, "sill": 0.9, "h": 2.4,
      "state": "built", "cite": "" },
    { "id": "common-room-window-left", "kind": "window, a seat in a splayed reveal", "room": "common-room",
      "bearing": 17.2, "w": 1.2, "sill": 1.95, "h": 2.7, "cant": 6.9, "state": "built", "cite": "" },
    { "id": "common-room-window-right", "kind": "window, a seat in a splayed reveal", "room": "common-room",
      "bearing": 80.2, "w": 1.2, "sill": 1.95, "h": 2.7, "cant": -6.9, "state": "built", "cite": "" },
    { "id": "bookcase", "kind": "swinging bookcase", "between": ["common-room", "study"], "bearing": -31.3, "w": 1.2,
      "h": 3.4, "state": "built", "cite": "" },
    { "id": "little-door", "kind": "little door with a big lock", "between": ["common-room", "den"], "bearing": 132.7,
      "w": 0.7, "h": 1.1, "state": "built", "cite": "" },
    { "id": "dorm-W1", "kind": "window", "room": "dormitory", "bearing": 10.2, "w": 0.6, "sill": 1.1, "h": 1.9,
      "view": "Hagrid's hut, the forest edge", "state": "built", "cite": "" },
    { "id": "dorm-W2", "kind": "window", "room": "dormitory", "bearing": -18.8, "w": 0.6, "sill": 1.1, "h": 1.9,
      "view": "the lake, the mountains", "state": "built", "cite": "" },
    { "id": "dorm-W3", "kind": "window", "room": "dormitory", "bearing": 87.2, "w": 0.6, "sill": 1.1, "h": 1.9,
      "view": "the lawn, the castle's shadow", "state": "built", "cite": "PoA 15" }
  ],
  "features": [
    { "id": "hearth", "room": "common-room", "kind": "fireplace", "bearing": 48.7, "w": 3.0, "h": 2.5, "proud": 0.6, "state": "built" },
    { "id": "fat-lady", "room": "corridor", "kind": "portrait", "at": [0, 6.41], "w": 1.4, "h": 1.7, "state": "built", "cite": "PS 7" },
    { "id": "blank-stretch", "kind": "blank wall, the Room's door when needed", "between": ["room-corridor", "room-of-requirement"],
      "span": [[29.65, 50.6], [34.35, 50.6]], "state": "designed", "cite": "OotP 18" },
    { "id": "barnabas", "room": "room-corridor", "kind": "tapestry, Barnabas the Barmy teaching trolls ballet, opposite the blank stretch",
      "span": [[30.0, 53.6], [34.0, 53.6]], "w": 4.0, "h": 1.8, "state": "designed", "cite": "OotP 18, HBP 20, HBP 21" },
    { "id": "vase", "room": "room-corridor", "kind": "man-sized vase, east of the blank stretch", "at": [35.1, 51.05],
      "state": "designed", "cite": "OotP 18" },
    { "id": "window-just-beyond", "kind": "window", "room": "room-corridor", "at": [28.9, 50.3], "w": 1.2,
      "view": "the west courtyard", "state": "designed", "cite": "OotP 18 (its wall left open by the book)" }
  ],
  "stairs": [
    { "id": "tower-stair", "kind": "open newel stair", "rooms": ["common-room", "dormitory"], "newel": [4.13, -2.59], "r": 0.7,
      "from": 0, "to": 7.4, "treads": 37, "rise": 0.2, "hand": "clockwise up, seen from above", "state": "built", "cite": "PS 7",
      "drawn_to": 5.6, "drawn_treads": 28,
      "about": "Godric's Q68, 68.1 (12 October 2026, 6.51 pm; req 191, 201): the stair runs on unseen to the dormitory's floor at 7.4 m, two turns and nine treads at 14 a turn; the common room draws 28, since no view shows it above 5.37 m" },
    { "id": "corridor-flight", "kind": "straight flight down", "room": "corridor", "span": [[-1.5, 20.11], [1.5, 23.41]],
      "from": 0, "to": -1.98, "treads": 11, "rise": 0.18, "state": "built" },
    { "id": "corridor-landing", "kind": "landing, one of the moving stair's places", "room": "corridor",
      "shape": { "rect": [-1.5, 23.41, 1.5, 25.81] }, "z": -1.98, "state": "built" }
  ],
  "staircases": {
    "count": 142, "state": "proposed", "cite": "PS 8",
    "about": "PS 8's hundred and forty-two through the whole castle, one staircase one stair from a floor to the next landing: the well holds 14 (the marble staircase, the moving flights, the Friday one), the rest stand in the towers, the ranges, the walls and down (Godric's 7.18 am question, 13 October 2026; tools/architect-stairs.py, sheet architect-stairs-0735). In the castle's frame; 'ours' where no book places it.",
    "places": [
      { "kind": "well", "at": [84, 30], "name": "the marble staircase", "count": 7, "cite": "PS 7, HBP 24" },
      { "kind": "well", "at": [76, 22], "name": "the moving flights", "count": 6, "cite": "OotP 32" },
      { "kind": "odd", "at": [76, 40], "name": "the Friday staircase", "count": 1, "cite": "PS 8" },
      { "kind": "spiral", "at": [161.8, 33.4], "name": "the head's", "count": 1, "cite": "CoS 11" },
      { "kind": "spiral", "at": [-2, 42.8], "name": "Ravenclaw", "count": 9, "cite": "DH 29" },
      { "kind": "spiral", "at": [86.6, 82], "name": "Astronomy", "count": 9, "cite": "PS 14" },
      { "kind": "spiral", "at": [162.4, 63.6], "name": "North Tower", "count": 9, "cite": "PoA 6, GoF 13" },
      { "kind": "spiral", "at": [14, 73.6], "name": "West Tower", "count": 9, "cite": "GoF 15" },
      { "kind": "spiral", "at": [34.6, -1.8], "name": "Gryffindor's angle turret", "count": 7, "cite": "ours" },
      { "kind": "spiral", "at": [40.5, 4.5], "name": "Gryffindor's dormitories", "count": 4, "cite": "PS 7, OotP 17" },
      { "kind": "spiral", "at": [93.6, -2.6], "name": "the keep's", "count": 10, "cite": "ours" },
      { "kind": "spiral", "at": [5.4, -5], "name": "the south-west", "count": 4, "cite": "ours" },
      { "kind": "spiral", "at": [134.8, -7], "name": "the lake tower", "count": 3, "cite": "ours" },
      { "kind": "spiral", "at": [15.6, 73.8], "name": "the north-west", "count": 3, "cite": "ours" },
      { "kind": "range", "at": [8, 21], "name": "west range, south", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [8, 47], "name": "west range, north", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [62, 21], "name": "south range, by the keep", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [97, 15], "name": "hall range, by the keep", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [152, 34], "name": "east range", "count": 6, "cite": "ours" },
      { "kind": "range", "at": [100, 61], "name": "north range, east", "count": 7, "cite": "ours" },
      { "kind": "rickety", "at": [26, 12], "name": "the Tudor lodgings", "count": 3, "cite": "ours" },
      { "kind": "rickety", "at": [8, 34], "name": "the gallery storey", "count": 1, "cite": "ours" },
      { "kind": "rickety", "at": [130, 12], "name": "the link of 1647", "count": 2, "cite": "ours" },
      { "kind": "hidden", "at": [60, 12], "name": "the tapestry stair to Gryffindor", "count": 1, "cite": "GoF 12" },
      { "kind": "hidden", "at": [91, 8], "name": "in the keep's east wall", "count": 2, "cite": "ours" },
      { "kind": "hidden", "at": [79, -1], "name": "in the keep's south wall", "count": 1, "cite": "ours" },
      { "kind": "odd", "at": [67, 8], "name": "the vanishing step", "count": 2, "cite": "GoF 25, HBP 28" },
      { "kind": "down", "at": [72, 60], "name": "to the dungeons", "count": 2, "cite": "CoS 5" },
      { "kind": "down", "at": [62, 66], "name": "to the kitchens and Hufflepuff", "count": 2, "cite": "GoF 21, OotP 18" },
      { "kind": "down", "at": [80, 92], "name": "the stone steps", "count": 1, "cite": "PS 6" },
      { "kind": "down", "at": [84, -6], "name": "from the harbour", "count": 2, "cite": "PS 6" }
    ]
  },
  "open": [
    "The tower stair rises 5.6 m against the dormitory floor's 7.4 m."
  ]
};
