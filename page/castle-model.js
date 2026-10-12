/* The castle model: the one to-scale record of where everything in the castle is, read by the room pages, the
   Marauder's Map and the plan sheets (tools/castle-model.py reads the same block). Plain data only, one JSON object,
   so the line below and the closing one are the only code. Metres. The plan: x east, y north; z up.
   A group (a suite of rooms built together) has its own plan frame, placed in the castle by its place: model point =
   (place.x, place.y) + the group's point turned by place.turn degrees (counter-clockwise), and z = place.z + z.
   A page's own three.js point (x, y, z) maps into its group as (x, -z) turned by the room's frame.turn and moved by
   frame.x, frame.y; its height y as frame.z + y. A state is built (on a page), designed (settled, not built),
   books (the books fix it), proposed (the Architect's, open), or pending (waiting on a question). A bearing is in
   degrees about a round room's centre, from the group's y toward its x (clockwise seen from above); a cant is the
   degrees a window's outer opening turns from its bearing. */
window.CASTLE_MODEL = {
  "version": 1,
  "units": "metres",
  "groups": [
    {
      "id": "gryffindor-suite",
      "name": "Gryffindor Tower and the Fat Lady's corridor, seventh floor",
      "about": "The group's frame: the tower's centre at the origin, y out through the round hole along the corridor toward its stair, x to the right looking that way; z 0 the seventh floor.",
      "place": { "x": null, "y": null, "turn": null, "z": null, "state": "pending" }
    }
  ],
  "levels": [
    { "id": "7", "name": "seventh floor", "z": null, "state": "pending" }
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
      "id": "room-of-requirement", "name": "the Room of Requirement", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [1.95, 14.91, 5.09, 19.61] }, "magic": "there when needed",
      "state": "pending", "cite": "OotP 18, HBP 24"
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
    { "id": "fat-lady", "room": "corridor", "kind": "portrait", "at": [0, 6.41], "w": 1.4, "h": 1.7, "state": "built", "cite": "PS 7" }
  ],
  "stairs": [
    { "id": "tower-stair", "kind": "open newel stair", "rooms": ["common-room", "dormitory"], "newel": [4.13, -2.59], "r": 0.7,
      "from": 0, "to": 5.6, "treads": 28, "rise": 0.2, "hand": "clockwise up, seen from above", "state": "built", "cite": "PS 7" },
    { "id": "corridor-flight", "kind": "straight flight down", "room": "corridor", "span": [[-1.5, 20.11], [1.5, 23.41]],
      "from": 0, "to": -1.98, "treads": 11, "rise": 0.18, "state": "built" },
    { "id": "corridor-landing", "kind": "landing, one of the moving stair's places", "room": "corridor",
      "shape": { "rect": [-1.5, 23.41, 1.5, 25.81] }, "z": -1.98, "state": "built" }
  ],
  "open": [
    "The group's place and the levels' heights wait on the castle floor by floor (the Architect's step 3).",
    "The tower stair rises 5.6 m against the dormitory floor's 7.4 m.",
    "The Room of Requirement's meeting with the corridor waits on Q48b; drawn as its option 1."
  ]
};
