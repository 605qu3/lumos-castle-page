/* room-tags-5.js: the light, surface and acoustic tags of floor 5's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS["5"].rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS["5"] = {
 "_meta": {
  "written": "30 October 2026, 20:49 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "5",
  "model": 256,
  "floor_version": 8,
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
  "fifth-floor-south-corridor": {
   "use": "passage",
   "age": "P3",
   "area": 58,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "back-stair-lobby-5": {
   "use": "stair",
   "age": "P4",
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
  "elves-passage-5": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "library-gallery": {
   "use": "library",
   "age": "P4",
   "area": 48,
   "h": 2.4,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "candle",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "library-gallery-way": {
   "use": "library",
   "age": "P4",
   "area": 10,
   "h": 2.4,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "chimney-hide": {
   "use": "hidden",
   "age": "P5",
   "area": 1,
   "h": 2.0,
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
  "decoy-cupboard-5": {
   "use": "store",
   "age": "P5",
   "area": 1,
   "h": 2.2,
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
  "true-hide-5": {
   "use": "store",
   "age": "P5",
   "area": 11,
   "h": 3.6,
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
   "acoustic": "close"
  },
  "painted-door-room-5": {
   "use": "hidden",
   "age": "P6",
   "area": 4,
   "h": 2.6,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "close"
  },
  "falconers-room": {
   "use": "workroom",
   "age": "P2",
   "area": 72,
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
  "drum-room-5": {
   "use": "store",
   "age": "P3",
   "area": 79,
   "h": 3.6,
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
  "lake-corridor-5-east": {
   "use": "passage",
   "age": "P6",
   "area": 184,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 10,
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
  "lake-corridor-5-west": {
   "use": "passage",
   "age": "P5",
   "area": 86,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 4,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "astronomy-instrument-room": {
   "use": "store",
   "age": "P4",
   "area": 141,
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "sw-stair-foot-5": {
   "use": "stair",
   "age": "P5",
   "area": 35,
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
  "sw-corner-lobby-5": {
   "use": "passage",
   "age": "P5",
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
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "herbarium": {
   "use": "workroom",
   "age": "P2",
   "area": 72,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "oriel-bay": {
   "use": "lookout",
   "age": "P6",
   "area": 8,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "close"
  },
  "orrery-room": {
   "use": "display",
   "age": "P2",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "north-stair-foot-5": {
   "use": "stair",
   "age": "P5",
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
   "surface": "flagstone",
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "masquers-wardrobe": {
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
  "west-tower-way-5": {
   "use": "passage",
   "age": "P3",
   "area": 6,
   "h": 2.6,
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
  "west-stair-foot-5": {
   "use": "stair",
   "age": "P3",
   "area": 40,
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
  "drum-bend-5-west": {
   "use": "passage",
   "age": "P5",
   "area": 23,
   "h": 3.6,
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
   "acoustic": "passage"
  },
  "drum-bend-5": {
   "use": "passage",
   "age": "P3",
   "area": 38,
   "h": 3.6,
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
   "acoustic": "passage"
  },
  "drum-bend-5-east": {
   "use": "passage",
   "age": "P3",
   "area": 24,
   "h": 3.6,
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
   "acoustic": "passage"
  },
  "ink-room": {
   "use": "hidden",
   "age": "P3",
   "area": 8,
   "h": 3.6,
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
  "lamp-store-5": {
   "use": "store",
   "age": "P3",
   "area": 8,
   "h": 3.6,
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
  "east-wing-5": {
   "use": "hall",
   "age": "P3",
   "area": 504,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 26,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "head-boy-girl-study-5": {
   "use": "study",
   "age": "P3",
   "area": 225,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 12,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "prefects-bathroom": {
   "use": "wash",
   "age": "P3",
   "area": 213,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 11,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "marble",
   "acoustic": "stone-room"
  },
  "dormitory-linen-store-5": {
   "use": "store",
   "age": "P5",
   "area": 137,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "staff-bedroom-5-west": {
   "use": "sleeping",
   "age": "P5",
   "area": 140,
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
  "music-room-5": {
   "use": "study",
   "age": "P6",
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
  "disused-classroom-5-east": {
   "use": "teaching",
   "age": "P3",
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
  "armour-corridor-5": {
   "use": "display",
   "age": "P4",
   "area": 167,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "owl-examiners-rooms-5": {
   "use": "study",
   "age": "P4",
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
  "staff-bedrooms-5-east": {
   "use": "sleeping",
   "age": "P6",
   "area": 167,
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
  "star-chart-room-5": {
   "use": "study",
   "age": "P5",
   "area": 145,
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
  "staff-bedroom-5-east": {
   "use": "sleeping",
   "age": "P5",
   "area": 171,
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
  "teachers-study-5-east": {
   "use": "study",
   "age": "P5",
   "area": 171,
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
  "house-points-ledgers-5": {
   "use": "store",
   "age": "P5",
   "area": 142,
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
  "study-room-5": {
   "use": "study",
   "age": "P5",
   "area": 145,
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
  "teachers-study-5-southwest": {
   "use": "study",
   "age": "P4",
   "area": 153,
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
  "disused-classroom-5-west": {
   "use": "teaching",
   "age": "P3",
   "area": 153,
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
  "store-5-east": {
   "use": "store",
   "age": "P5",
   "area": 86,
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
  "teachers-study-5-west": {
   "use": "study",
   "age": "P3",
   "area": 113,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "elves-linen-room-5": {
   "use": "service",
   "age": "P4",
   "area": 105,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "teachers-study-5-middle": {
   "use": "study",
   "age": "P4",
   "area": 90,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "prefects-common-room": {
   "use": "living",
   "age": "P3",
   "area": 89,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "marble",
   "acoustic": "dry"
  },
  "gryffindor-storeroom-5": {
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
  "linen-cupboard-5": {
   "use": "store",
   "age": "P4",
   "area": 73,
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
  "lamp-candle-cupboard-5": {
   "use": "store",
   "age": "P4",
   "area": 73,
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
  "broom-cupboard-5-middle": {
   "use": "store",
   "age": "P4",
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
  "teachers-study-5-southeast": {
   "use": "study",
   "age": "P3",
   "area": 69,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "astronomy-stair-foot-5": {
   "use": "stair",
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
   "surface": "flagstone",
   "acoustic": "stairwell"
  },
  "cleaning-cupboard-5-middle": {
   "use": "store",
   "age": "P4",
   "area": 45,
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
  "old-textbooks-store-5": {
   "use": "store",
   "age": "P5",
   "area": 31,
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
  "washrooms-5-west": {
   "use": "wash",
   "age": "P5",
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
  "spare-desks-store-5-middle": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "linen-cupboard-5-west": {
   "use": "store",
   "age": "P3",
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
   "acoustic": "vaulted"
  },
  "washrooms-5-north": {
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
  "washrooms-5-east": {
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
  "cleaning-cupboard-5-east": {
   "use": "store",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "spare-desks-store-5-east": {
   "use": "store",
   "age": "P5",
   "area": 11,
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
   "acoustic": "close"
  },
  "passage-5-east": {
   "use": "passage",
   "age": "P5",
   "area": 7,
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
  "service-passage-5-lobby": {
   "use": "passage",
   "age": "P4",
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
  "passage-5-west": {
   "use": "passage",
   "age": "P3",
   "area": 7,
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
  "passage-5-southwest": {
   "use": "passage",
   "age": "P4",
   "area": 7,
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
  "passage-5-cleaning": {
   "use": "passage",
   "age": "P4",
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
  "passage-5-astronomy": {
   "use": "passage",
   "age": "P4",
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
  "passage-5-middle": {
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
  "passage-5-study": {
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
  "north-range-corridor-5": {
   "use": "passage",
   "age": "P4",
   "area": 400,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 20,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "west-wing-corridor-5-south": {
   "use": "passage",
   "age": "P3",
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
   "acoustic": "vaulted"
  },
  "west-wing-corridor-5-north": {
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
  "tudor-bay-5": {
   "use": "study",
   "age": "P5",
   "area": 35,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "tudor-bay-5-entry": {
   "use": "passage",
   "age": "P4",
   "area": 6,
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
   "acoustic": "close"
  },
  "ravenclaw-tower-room-5": {
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
  "headmasters-tower-room-5": {
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
  "lake-tower-5": {
   "use": "store",
   "age": "P7",
   "area": 68,
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
  "east-lift-shaft-5": {
   "use": "passage",
   "age": "P3",
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
   "acoustic": "vaulted"
  },
  "west-pole-shaft-5": {
   "use": "passage",
   "age": "P3",
   "area": 20,
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
  "west-dumbwaiter-shaft-5": {
   "use": "passage",
   "age": "P3",
   "area": 20,
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
  "loop-gallery-stair-5": {
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
  "loop-gallery-5": {
   "use": "passage",
   "age": "P3",
   "area": 36,
   "h": 3.7,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  }
 },
 "stairs": {
  "shortcut-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "library-gallery-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "dovecote-stair": {
   "surface": "stone",
   "acoustic": "close"
  }
 }
};
