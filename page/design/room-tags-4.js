/* room-tags-4.js: the light, surface and acoustic tags of floor 4's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS["4"].rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS["4"] = {
 "_meta": {
  "written": "30 October 2026, 20:49 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "4",
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
  "fourth-floor-corridor": {
   "use": "passage",
   "age": "P4",
   "area": 156,
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "library-corridor": {
   "use": "library",
   "age": "P4",
   "area": 54,
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "forgotten-classroom": {
   "use": "teaching",
   "age": "P4",
   "area": 80,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "candle",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "library": {
   "use": "library",
   "age": "P4",
   "area": 320,
   "h": 9.7,
   "light": {
    "day": true,
    "windows": 7,
    "lamp": "candle",
    "lamps": 17,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "echoing"
  },
  "pince-office": {
   "use": "study",
   "age": "P4",
   "area": 43,
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
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "library-reading-room": {
   "use": "library",
   "age": "P4",
   "area": 57,
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
   "surface": "flagstone",
   "acoustic": "stone-room",
   "h_note": "default; the model gives this room no ceiling"
  },
  "library-map-room": {
   "use": "library",
   "age": "P4",
   "area": 44,
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
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "muggle-studies-room": {
   "use": "teaching",
   "age": "P4",
   "area": 19,
   "h": 3.0,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "muggle-studies-store": {
   "use": "store",
   "age": "P4",
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
   "acoustic": "close",
   "h_note": "default; the model gives this room no ceiling"
  },
  "muggle-studies-study": {
   "use": "study",
   "age": "P4",
   "area": 24,
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
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "back-stair-lobby-4": {
   "use": "stair",
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
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "elves-passage-4": {
   "use": "passage",
   "age": "P5",
   "area": 82,
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
  "drum-room-4": {
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
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "lake-corridor-4-east": {
   "use": "passage",
   "age": "P6",
   "area": 184,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 7,
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
  "astronomy-chart-room": {
   "use": "workroom",
   "age": "P2",
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
  "sw-stair-foot-4": {
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
  "whispering-room": {
   "use": "display",
   "age": "P2",
   "area": 72,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "sw-turret-passage": {
   "use": "passage",
   "age": "P2",
   "area": 5,
   "h": 2.2,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "close"
  },
  "stopped-clocks": {
   "use": "store",
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
  "model-room": {
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
  "north-stair-foot-4": {
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
  "first-schoolroom": {
   "use": "teaching",
   "age": "P2",
   "area": 113,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "west-tower-way-4": {
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
  "west-stair-foot-4": {
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
  "electives-passage-4": {
   "use": "passage",
   "age": "P4",
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "ancient-runes-classroom": {
   "use": "teaching",
   "age": "P4",
   "area": 86,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "candle",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry",
   "hearth": [
    "ancient-runes-stove-flue"
   ]
  },
  "muggle-studies-classroom": {
   "use": "teaching",
   "age": "P3",
   "area": 86,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "candle",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry",
   "hearth": [
    "muggle-studies-stove-flue"
   ]
  },
  "newspaper-room-4": {
   "use": "library",
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
  "elves-linen-room-4-lake": {
   "use": "service",
   "age": "P5",
   "area": 154,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "staff-bedroom-4-lake-west": {
   "use": "sleeping",
   "age": "P5",
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
  "landscape-painting-corridor-4": {
   "use": "display",
   "age": "P4",
   "area": 164,
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
  "disused-classroom-4-lake-east": {
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
  "study-room-4-lake-east": {
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
  "revision-rooms-4": {
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
  "muggle-studies-collection-4": {
   "use": "display",
   "age": "P6",
   "area": 164,
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "herbology-library-4": {
   "use": "library",
   "age": "P5",
   "area": 158,
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
  "staff-bedroom-4-north-east": {
   "use": "sleeping",
   "age": "P5",
   "area": 155,
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
  "study-room-4-north-east": {
   "use": "study",
   "age": "P5",
   "area": 158,
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
  "staff-bedrooms-4-north": {
   "use": "sleeping",
   "age": "P5",
   "area": 155,
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
  "teachers-study-4-north": {
   "use": "study",
   "age": "P5",
   "area": 155,
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
  "disused-classroom-4-east": {
   "use": "teaching",
   "age": "P3",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "runes-store-4": {
   "use": "store",
   "age": "P3",
   "area": 121,
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
  "elves-linen-room-4-east": {
   "use": "service",
   "age": "P3",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "staff-bedroom-4-east": {
   "use": "sleeping",
   "age": "P3",
   "area": 123,
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "runes-teachers-study-4": {
   "use": "study",
   "age": "P3",
   "area": 121,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "fourth-floor-washroom": {
   "use": "wash",
   "age": "P3",
   "area": 121,
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
   "acoustic": "stone-room"
  },
  "cleaning-cupboard-4": {
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
  "unused-classroom-4-mirror": {
   "use": "teaching",
   "age": "P4",
   "area": 43,
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "broom-cupboard-4-middle": {
   "use": "store",
   "age": "P4",
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
  "gryffindor-storeroom-4": {
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
  "teachers-study-4-lake-east": {
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
  "old-textbooks-store-4": {
   "use": "store",
   "age": "P4",
   "area": 55,
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
  "store-4-west": {
   "use": "store",
   "age": "P3",
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
  "astronomy-stair-foot-4": {
   "use": "stair",
   "age": "P4",
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
  "linen-cupboard-4": {
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
  "washrooms-4-west": {
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
  "spare-desks-store-4-middle": {
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
  "washrooms-4-north": {
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
  "washrooms-4-east": {
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
  "broom-cupboard-4-west": {
   "use": "store",
   "age": "P3",
   "area": 28,
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
  "spare-desks-store-4-east": {
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
  "lamp-candle-cupboard-4": {
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
  "passage-4-east": {
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
  "passage-4-west": {
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
  "passage-4-gate": {
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
  "passage-4-middle": {
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
  "passage-4-study": {
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
  "north-range-corridor-4": {
   "use": "passage",
   "age": "P5",
   "area": 222,
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
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "west-wing-corridor-4": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "east-wing-corridor-4": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "lake-corridor-4-west": {
   "use": "passage",
   "age": "P5",
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
   "acoustic": "passage"
  },
  "lake-corridor-4-keep": {
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
  "west-corridor-4-south": {
   "use": "passage",
   "age": "P3",
   "area": 39,
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
  "muggle-props-store-4": {
   "use": "store",
   "age": "P3",
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
  "runes-dictionary-room-4": {
   "use": "library",
   "age": "P4",
   "area": 39,
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
  "library-returns-store-4": {
   "use": "store",
   "age": "P4",
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
  "library-returns-store-4-east": {
   "use": "store",
   "age": "P4",
   "area": 8,
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
  "library-returns-desk-4": {
   "use": "library",
   "age": "P4",
   "area": 18,
   "h": 4.5,
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
   "acoustic": "vaulted"
  },
  "tudor-bay-4": {
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
  "tudor-bay-4-entry": {
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
  "tudor-bay-4-cushion-store": {
   "use": "store",
   "age": "P4",
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
  "lake-wall-lamp-store-4": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "ravenclaw-room-4": {
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
  "headmasters-room-4": {
   "use": "store",
   "age": "P3",
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
  "lake-tower-4": {
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
  "drum-bend-4-west": {
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
  "drum-bend-4": {
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
  "drum-bend-4-east": {
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
  "elves-linen-room-4-lake-nook": {
   "use": "service",
   "age": "P5",
   "area": 18,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "newspaper-room-4-nook": {
   "use": "library",
   "age": "P3",
   "area": 18,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "east-lift-shaft-4": {
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
  "west-pole-shaft-4": {
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
  "west-dumbwaiter-shaft-4": {
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
  "loop-gallery-stair-4": {
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
  "loop-gallery-4": {
   "use": "passage",
   "age": "P3",
   "area": 16,
   "h": 3.7,
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
  "library-gallery-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "sw-turret-stair": {
   "surface": "stone",
   "acoustic": "close"
  }
 }
};
