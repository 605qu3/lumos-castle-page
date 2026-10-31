/* room-tags-6.js: the light, surface and acoustic tags of floor 6's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS["6"].rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS["6"] = {
 "_meta": {
  "written": "30 October 2026, 20:49 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "6",
  "model": 256,
  "floor_version": 6,
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
  "scroll-hall": {
   "use": "store",
   "age": "P4",
   "area": 378,
   "h": 20.8,
   "light": {
    "day": true,
    "windows": 7,
    "lamp": "torch",
    "lamps": 19,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "echoing"
  },
  "back-stair-lobby-6": {
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
  "elves-passage-6": {
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
  "elves-passage-6-west": {
   "use": "passage",
   "age": "P4",
   "area": 58,
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "secret-s4b": {
   "use": "store",
   "age": "P3",
   "area": 7,
   "h": 2.9,
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
  "drum-room-6": {
   "use": "store",
   "age": "P3",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "keep-wall-walk": {
   "use": "hidden",
   "age": "P4",
   "area": 7,
   "h": 2.2,
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
  "rose-room": {
   "use": "lookout",
   "age": "P4",
   "area": 35,
   "h": 7.0,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "rose-room-way": {
   "use": "hidden",
   "age": "P4",
   "area": 2,
   "h": 2.9,
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
  "lake-corridor-6-east": {
   "use": "passage",
   "age": "P6",
   "area": 184,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 8,
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
  "astronomy-telescope-store": {
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
  "sw-stair-foot-6": {
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
  "sw-corner-lobby-6": {
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
  "wind-dial-room": {
   "use": "lookout",
   "age": "P4",
   "area": 72,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "dovecote": {
   "use": "service",
   "age": "P4",
   "area": 79,
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "north-stair-foot-6": {
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
  "curiosities-cabinet": {
   "use": "display",
   "age": "P4",
   "area": 141,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "down-only-stair-way-6": {
   "use": "hidden",
   "age": "P3",
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
  "tally-room": {
   "use": "hidden",
   "age": "P6",
   "area": 8,
   "h": 5.2,
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
  "west-tower-way-6": {
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
  "west-stair-foot-6": {
   "use": "stair",
   "age": "P3",
   "area": 48,
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
  "lake-corridor-6-west": {
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
  "drum-bend-6-west": {
   "use": "passage",
   "age": "P5",
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
   "acoustic": "passage"
  },
  "drum-bend-6": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "drum-bend-6-east": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "gryffindor-lav-witches-6": {
   "use": "wash",
   "age": "P3",
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
  "gryffindor-lav-wizards-6": {
   "use": "wash",
   "age": "P3",
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
  "lake-corridor-6-middle": {
   "use": "passage",
   "age": "P3",
   "area": 41,
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
  "lake-corridor-6-turn": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "arithmancy-passage": {
   "use": "passage",
   "age": "P5",
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
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "arithmancy-classroom": {
   "use": "teaching",
   "age": "P5",
   "area": 88,
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
    "arithmancy-stove-flue"
   ]
  },
  "clock-room-6": {
   "use": "workroom",
   "age": "P3",
   "area": 163,
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
  "study-room-6-west": {
   "use": "study",
   "age": "P4",
   "area": 103,
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
  "staff-bedroom-6-west": {
   "use": "sleeping",
   "age": "P4",
   "area": 198,
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
  "staff-bedrooms-6-lake": {
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
  "elves-linen-room-6-lake": {
   "use": "service",
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "frog-choir-room-6": {
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
  "guest-rooms-6": {
   "use": "sleeping",
   "age": "P4",
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
  "disused-classroom-6-east": {
   "use": "teaching",
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
  "teachers-study-6-middle": {
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
  "teachers-study-6-east": {
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
  "staff-bedroom-6-east": {
   "use": "sleeping",
   "age": "P5",
   "area": 158,
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
  "staff-bedroom-6-middle": {
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
  "disused-classroom-6-middle": {
   "use": "teaching",
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
  "elves-linen-room-6-east-wing": {
   "use": "service",
   "age": "P4",
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
  "study-room-6-west-wing": {
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
  "staff-bedroom-6-east-wing": {
   "use": "sleeping",
   "age": "P4",
   "area": 124,
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
  "teachers-study-6-east-wing": {
   "use": "study",
   "age": "P4",
   "area": 123,
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
  "arithmancy-room-6": {
   "use": "teaching",
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
  "disused-classroom-6-west-wing": {
   "use": "teaching",
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
  "arithmancy-chart-store-6": {
   "use": "store",
   "age": "P5",
   "area": 67,
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
  "store-6-middle": {
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
  "teachers-study-6-astronomy": {
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
  "vectors-study-6": {
   "use": "study",
   "age": "P5",
   "area": 34,
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
  "gryffindor-storeroom-6": {
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
  "broom-cupboard-6-middle": {
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
  "broom-cupboard-6-west": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "linen-cupboard-6": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "teachers-study-6-lake-east": {
   "use": "study",
   "age": "P4",
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
  "elves-linen-room-6-middle": {
   "use": "service",
   "age": "P4",
   "area": 43,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "lamp-candle-cupboard-6": {
   "use": "store",
   "age": "P4",
   "area": 43,
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
  "astronomy-stair-foot-6": {
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
  "cleaning-cupboard-6-middle": {
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
  "old-textbooks-store-6-middle": {
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
  "washrooms-6-west": {
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
  "telescope-store-6": {
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
  "cleaning-cupboard-6-west": {
   "use": "store",
   "age": "P3",
   "area": 25,
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
  "washrooms-6-north": {
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
  "washrooms-6-east": {
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
  "old-textbooks-store-6-east": {
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
  "spare-desks-store-6": {
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
  "passage-6-east": {
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
  "service-passage-6-lobby": {
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
  "passage-6-west": {
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
  "passage-6-west-middle": {
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
  "passage-6-lobby-west": {
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
  "passage-6-cleaning": {
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
  "passage-6-astronomy": {
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
  "passage-6-middle": {
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
  "passage-6-east-middle": {
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
  "north-range-corridor-6": {
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
  "west-wing-corridor-6": {
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
  "east-wing-corridor-6": {
   "use": "passage",
   "age": "P4",
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
  "arithmancy-marking-room-6": {
   "use": "workroom",
   "age": "P5",
   "area": 34,
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "arithmancy-reading-room-6": {
   "use": "library",
   "age": "P5",
   "area": 30,
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
  "vectors-book-closet-6": {
   "use": "store",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "close"
  },
  "ravenclaw-tower-room-6": {
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
  "heads-tower-room-6": {
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
  "lake-tower-6": {
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
  "west-tower-room-6": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "east-lift-shaft-6": {
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
  "west-pole-shaft-6": {
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
  "west-dumbwaiter-shaft-6": {
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
  "loop-gallery-stair-6": {
   "use": "passage",
   "age": "P3",
   "area": 15,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "loop-gallery-6": {
   "use": "passage",
   "age": "P3",
   "area": 17,
   "h": 3.7,
   "light": {
    "day": true,
    "windows": 3,
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
  "core-stair-b": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "lake-tower-ladder-7": {
   "surface": "iron",
   "acoustic": "close"
  },
  "keep-wall-walk-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "scroll-hall-spiral": {
   "surface": "stone",
   "acoustic": "close"
  },
  "down-only-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "rose-room-steps": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "dovecote-stair": {
   "surface": "stone",
   "acoustic": "close"
  }
 }
};
