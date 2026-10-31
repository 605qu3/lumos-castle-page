/* room-tags-3.js: the light, surface and acoustic tags of floor 3's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS["3"].rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS["3"] = {
 "_meta": {
  "written": "30 October 2026, 20:49 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "3",
  "model": 256,
  "floor_version": 7,
  "rule": "A tag is a check, not a tone: the shell sets no wall lighter to meet a brightness floor (a lifted wall turns to paint, design-bright-rooms-1021); a room under its floor gets one more lamp. Nothing glows. Fire light waits on its own key: a hearth is listed, never counted as a light.",
  "light": {
   "day": "the room has at least one window-family opening in the model (the day driver reaches it)",
   "lamp": "torch (an iron bracket), candle (where people work at night) or lantern (a cupboard)",
   "lamps": "how many by the type doc's rule 3, one per 20 m2 and at least one; a budget to check against the Architect's, not a placement",
   "day_floor": "the walls' value after the light is never below this (rule 4)",
   "night_floor": "the share of the 2 pm brightness the room keeps at 11 pm; 0.30 where a boy reads, else 0.14 or 0.20 (a place he stops and looks)",
   "read": "a boy is meant to read here"
  },
  "surface": {
   "flagstone": "laid flags, the ground floor's own (materials.md 4)",
   "stone": "worn or rough flags: stores, service, hidden ways, shafts",
   "oak": "oak boards over the floor (lived-in rooms, the type doc)",
   "marble": "the marble staircase (PS 7) and any room the schedule floors in marble",
   "earth": "beaten earth, where the schedule gives it (the bat cave)",
   "iron": "a ladder's rungs",
   "rug": "a rug is a Pass 2 object and carries its own kind"
  },
  "acoustic": {
   "echoing": "a vast stone hall (volume 2500 m3 and over)",
   "vaulted": "a barrel, rib, groin or umbrella vault, long tail",
   "stone-room": "flags and a flat or beamed ceiling, a bare room",
   "dry": "oak underfoot or a lived-in room: soft, short tail",
   "passage": "a beamed corridor",
   "stairwell": "a stair open to its well",
   "close": "under 12 m2, a hidden way, a shaft or a turret stair: tight and dead",
   "glasshouse": "a glass roof over earth and benches"
  },
  "second_table": "Halls, passages, hidden ways and defence rooms are not in the type doc: their night floors here are the second table's start, provisional till Godric's eye on the first rooms.",
  "sound": "The classes are tags for Events' sound catalogue to match; the player is Events'."
 },
 "rooms": {
  "trophy-room": {
   "use": "display",
   "age": "P3",
   "area": 320,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 16,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "witch-landing": {
   "use": "passage",
   "age": "P4",
   "area": 24,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "trophy-next-room": {
   "use": "store",
   "age": "P3",
   "area": 96,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "armour-gallery": {
   "use": "passage",
   "age": "P3",
   "area": 156,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "lost-games-room": {
   "use": "hidden",
   "age": "P3",
   "area": 25,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "third-floor-north-corridor": {
   "use": "passage",
   "age": "P4",
   "area": 156,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 9,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "defence-passage": {
   "use": "passage",
   "age": "P4",
   "area": 30,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "defence-classroom": {
   "use": "teaching",
   "age": "P4",
   "area": 88,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry",
   "hearth": [
    "defence-stove-flue"
   ],
   "h_note": "default; the model gives this room no ceiling"
  },
  "defence-store": {
   "use": "store",
   "age": "P4",
   "area": 38,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "charms-corridor": {
   "use": "passage",
   "age": "P5",
   "area": 165,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 9,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "forbidden-corridor": {
   "use": "passage",
   "age": "P5",
   "area": 43,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "stone-bay": {
   "use": "passage",
   "age": "P5",
   "area": 14,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "charms-passage": {
   "use": "passage",
   "age": "P5",
   "area": 37,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "charms-classroom": {
   "use": "teaching",
   "age": "P5",
   "area": 108,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "candle",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry",
   "hearth": [
    "charms-stove-flue"
   ]
  },
  "back-stair-lobby-3": {
   "use": "stair",
   "age": "P2",
   "area": 23,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "tapestry-passage-3-west": {
   "use": "passage",
   "age": "P4",
   "area": 37,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "tapestry-passage-3": {
   "use": "passage",
   "age": "P4",
   "area": 16,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "tapestry-passage-3-east": {
   "use": "passage",
   "age": "P5",
   "area": 69,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "west-armoury": {
   "use": "defence",
   "age": "P2",
   "area": 72,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "tracing-floor": {
   "use": "workroom",
   "age": "P2",
   "area": 95,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "gate-loft": {
   "use": "loft",
   "age": "P2",
   "area": 100,
   "h": 3.0,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "accounts-room-3": {
   "use": "store",
   "age": "P5",
   "area": 13,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "seat-den-3": {
   "use": "hidden",
   "age": "P6",
   "area": 4,
   "h": 2.1,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "lake-tower-3": {
   "use": "unset",
   "age": "P7",
   "area": 68,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry",
   "note": "the model gives this room no use; tagged as a plain room",
   "h_note": "default; the model gives this room no ceiling"
  },
  "tudor-bay-3": {
   "use": "unset",
   "age": "P5",
   "area": 35,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry",
   "note": "the model gives this room no use; tagged as a plain room",
   "h_note": "default; the model gives this room no ceiling"
  },
  "drum-room-3": {
   "use": "store",
   "age": "P3",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "lake-corridor-3-east": {
   "use": "passage",
   "age": "P6",
   "area": 184,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 6,
    "lamp": "torch",
    "lamps": 10,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "astronomy-night-books": {
   "use": "library",
   "age": "P2",
   "area": 141,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "sw-stair-foot-3": {
   "use": "stair",
   "age": "P3",
   "area": 35,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "keep-east-stairwell": {
   "use": "hidden",
   "age": "P4",
   "area": 9,
   "h": 7.4,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "glass-room": {
   "use": "workroom",
   "age": "P2",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "north-stair-foot-3": {
   "use": "stair",
   "age": "P5",
   "area": 41,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "charms-landing-passage-3": {
   "use": "passage",
   "age": "P5",
   "area": 21,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "tapestry-room": {
   "use": "store",
   "age": "P2",
   "area": 113,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "vanishing-step-hollow": {
   "use": "hidden",
   "age": "P4",
   "area": 8,
   "h": 1.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "west-stair-foot-3": {
   "use": "stair",
   "age": "P3",
   "area": 25,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "armour-repair-room-3": {
   "use": "workroom",
   "age": "P3",
   "area": 154,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "astronomy-stair-foot-3": {
   "use": "stair",
   "age": "P2",
   "area": 52,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stairwell"
  },
  "broom-cupboard-3-east": {
   "use": "store",
   "age": "P5",
   "area": 21,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "broom-cupboard-3-middle": {
   "use": "store",
   "age": "P2",
   "area": 54,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "charms-classroom-3-west": {
   "use": "teaching",
   "age": "P5",
   "area": 167,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "charms-store-3": {
   "use": "store",
   "age": "P5",
   "area": 84,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "cleaning-cupboard-3-lobby": {
   "use": "store",
   "age": "P2",
   "area": 36,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "cleaning-cupboard-3-west": {
   "use": "store",
   "age": "P3",
   "area": 23,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "defence-practice-room-3": {
   "use": "teaching",
   "age": "P4",
   "area": 159,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "defence-teachers-bedroom-3": {
   "use": "sleeping",
   "age": "P5",
   "area": 150,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "disused-classroom-3-lake": {
   "use": "teaching",
   "age": "P6",
   "area": 164,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "east-corridor-3-north": {
   "use": "passage",
   "age": "P3",
   "area": 10,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "elves-linen-room-3-east": {
   "use": "service",
   "age": "P3",
   "area": 69,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "elves-linen-room-3-middle": {
   "use": "service",
   "age": "P5",
   "area": 26,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "gryffindor-storeroom-3": {
   "use": "store",
   "age": "P3",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "lake-corridor-3-mid": {
   "use": "passage",
   "age": "P3",
   "area": 47,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "lake-corridor-3-west": {
   "use": "passage",
   "age": "P3",
   "area": 71,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "lamp-candle-cupboard-3": {
   "use": "store",
   "age": "P4",
   "area": 77,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "linen-cupboard-3-east": {
   "use": "store",
   "age": "P5",
   "area": 26,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "linen-cupboard-3-west": {
   "use": "store",
   "age": "P4",
   "area": 49,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "north-corridor-3-link": {
   "use": "passage",
   "age": "P2",
   "area": 53,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "passage-3-charms": {
   "use": "passage",
   "age": "P5",
   "area": 6,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "passage-3-middle": {
   "use": "passage",
   "age": "P2",
   "area": 6,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "passage-3-study": {
   "use": "passage",
   "age": "P2",
   "area": 6,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "passage-3-west": {
   "use": "passage",
   "age": "P4",
   "area": 5,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "right-hand-corridor-3": {
   "use": "passage",
   "age": "P3",
   "area": 440,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 22,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "room-beside-trophy-room-3": {
   "use": "store",
   "age": "P4",
   "area": 159,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "service-passage-3-lobby": {
   "use": "passage",
   "age": "P2",
   "area": 4,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "spare-desks-store-3-middle": {
   "use": "store",
   "age": "P2",
   "area": 24,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "spare-desks-store-3-west": {
   "use": "store",
   "age": "P4",
   "area": 38,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "staff-bedroom-3-lake": {
   "use": "sleeping",
   "age": "P4",
   "area": 164,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "staff-bedrooms-3-lake": {
   "use": "sleeping",
   "age": "P3",
   "area": 225,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 12,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "store-3-east": {
   "use": "store",
   "age": "P5",
   "area": 84,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "study-room-3-lake": {
   "use": "study",
   "age": "P6",
   "area": 164,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "swivelling-staircase-room-3": {
   "use": "hall",
   "age": "P4",
   "area": 193,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 10,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "teachers-study-3-east": {
   "use": "study",
   "age": "P3",
   "area": 49,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "teachers-study-3-lake-east": {
   "use": "study",
   "age": "P3",
   "area": 162,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "teachers-study-3-north": {
   "use": "study",
   "age": "P5",
   "area": 147,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "third-years-study-room-3": {
   "use": "study",
   "age": "P4",
   "area": 164,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "trophy-polishing-room-3": {
   "use": "workroom",
   "age": "P3",
   "area": 193,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 10,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "washrooms-3-east": {
   "use": "wash",
   "age": "P5",
   "area": 17,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "washrooms-3-middle": {
   "use": "wash",
   "age": "P5",
   "area": 29,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "washrooms-3-trophy": {
   "use": "wash",
   "age": "P3",
   "area": 37,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "west-cross-corridor-3": {
   "use": "passage",
   "age": "P3",
   "area": 10,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "west-cross-corridor-3-end": {
   "use": "passage",
   "age": "P3",
   "area": 12,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "west-wing-corridor-3": {
   "use": "passage",
   "age": "P3",
   "area": 14,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "drum-bend-3-west": {
   "use": "passage",
   "age": "P3",
   "area": 19,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "drum-bend-3": {
   "use": "passage",
   "age": "P3",
   "area": 37,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "drum-bend-3-east": {
   "use": "passage",
   "age": "P3",
   "area": 19,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "charms-preparation-room-3": {
   "use": "workroom",
   "age": "P3",
   "area": 51,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "armour-repair-room-3-nook": {
   "use": "workroom",
   "age": "P3",
   "area": 18,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "staff-bedrooms-3-lake-nook": {
   "use": "sleeping",
   "age": "P3",
   "area": 18,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "ravenclaw-tower-room-3": {
   "use": "store",
   "age": "P3",
   "area": 150,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "headmasters-tower-room-3": {
   "use": "store",
   "age": "P4",
   "area": 62,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "west-pole-shaft-3": {
   "use": "passage",
   "age": "P3",
   "area": 19,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "west-dumbwaiter-shaft-3": {
   "use": "passage",
   "age": "P3",
   "area": 19,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "loop-gallery-stair-3": {
   "use": "passage",
   "age": "P3",
   "area": 6,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "loop-gallery-3": {
   "use": "passage",
   "age": "P3",
   "area": 46,
   "h": 3.7,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "stair-lantern-3": {
   "use": "passage",
   "age": "P3",
   "area": 20,
   "h": 4.0,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  }
 },
 "stairs": {
  "tapestry-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "gate-loft-ladder": {
   "surface": "iron",
   "acoustic": "close"
  },
  "keep-east-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "stone-ladder": {
   "surface": "iron",
   "acoustic": "close"
  },
  "stair-lantern-steps-3": {
   "surface": "stone",
   "acoustic": "stairwell"
  }
 }
};
