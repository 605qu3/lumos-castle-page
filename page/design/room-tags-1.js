/* room-tags-1.js: the light, surface and acoustic tags of floor 1's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS.1.rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS.1 = {
 "_meta": {
  "written": "29 October 2026, 21:53 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "1",
  "model": 244,
  "floor_version": 5,
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
  "mcgonagalls-office": {
   "use": "study",
   "age": "P5",
   "area": 37,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "hearth": [
    "mcgonagalls-fireplace"
   ],
   "h_note": "default; the model gives this room no ceiling"
  },
  "first-floor-corridor": {
   "use": "passage",
   "age": "P5",
   "area": 205,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 9,
    "lamp": "torch",
    "lamps": 11,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "east-first-floor-corridor": {
   "use": "passage",
   "age": "P3",
   "area": 96,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "hospital-passage": {
   "use": "passage",
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "hospital-wing": {
   "use": "sick",
   "age": "P3",
   "area": 160,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 6,
    "lamp": "candle",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "pomfrey-office": {
   "use": "study",
   "age": "P3",
   "area": 16,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "candle",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry",
   "h_note": "default; the model gives this room no ceiling"
  },
  "pomfrey-bedroom": {
   "use": "living",
   "age": "P3",
   "area": 27,
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
  "hospital-dispensary": {
   "use": "store",
   "age": "P3",
   "area": 27,
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
  "hospital-linen": {
   "use": "store",
   "age": "P3",
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "transfiguration-passage": {
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
  "transfiguration-classroom": {
   "use": "teaching",
   "age": "P5",
   "area": 96,
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
    "transfiguration-stove-flue"
   ]
  },
  "back-stair-lobby-1": {
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
  "history-of-magic-classroom": {
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
    "history-hearth"
   ]
  },
  "history-of-magic-passage": {
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
  "history-hearth-way": {
   "use": "passage",
   "age": "P5",
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
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "hall-wall-passage": {
   "use": "hidden",
   "age": "P4",
   "area": 41,
   "h": 2.2,
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
   "acoustic": "close"
  },
  "hall-lug": {
   "use": "hidden",
   "age": "P4",
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
  "hall-wall-passage-west": {
   "use": "passage",
   "age": "P3",
   "area": 6,
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
   "surface": "flagstone",
   "acoustic": "close"
  },
  "portcullis-room": {
   "use": "defence",
   "age": "P2",
   "area": 70,
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
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "lake-tower-1": {
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
  "tudor-bay-1": {
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
  "drum-room-1": {
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
  "drum-way-1": {
   "use": "passage",
   "age": "P3",
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
   "surface": "flagstone",
   "acoustic": "close"
  },
  "lake-corridor-1-east": {
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
  "sw-stair-foot-1": {
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
  "tapestry-stairwell": {
   "use": "stair",
   "age": "P5",
   "area": 10,
   "h": 13.0,
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
  "still-room": {
   "use": "service",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "chandlery": {
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
   "acoustic": "vaulted",
   "hearth": [
    "chandlery-flue"
   ]
  },
  "se-round-room-1": {
   "use": "store",
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
  "north-stair-foot-1": {
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
  "mcgonagall-landing-passage-1": {
   "use": "passage",
   "age": "P5",
   "area": 18,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
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
  "transfiguration-store": {
   "use": "store",
   "age": "P2",
   "area": 88,
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
  "porters-squint": {
   "use": "hidden",
   "age": "P2",
   "area": 4,
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
  "down-only-stair-way-1": {
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
  "tapestry-broom-cupboard": {
   "use": "store",
   "age": "P5",
   "area": 4,
   "h": 1.9,
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
  "west-tower-way-1": {
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
  "west-stair-foot-1": {
   "use": "stair",
   "age": "P3",
   "area": 40,
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
  "history-of-magic-lecture-hall": {
   "use": "teaching",
   "age": "P4",
   "area": 327,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 17,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "exam-papers-archive": {
   "use": "store",
   "age": "P3",
   "area": 267,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 14,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "west-dispensary": {
   "use": "workroom",
   "age": "P3",
   "area": 197,
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
  "quiet-rooms": {
   "use": "sick",
   "age": "P3",
   "area": 193,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 10,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "transfiguration-beast-store": {
   "use": "store",
   "age": "P6",
   "area": 151,
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
   "acoustic": "vaulted"
  },
  "history-teachers-study": {
   "use": "study",
   "age": "P6",
   "area": 151,
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
  "transfiguration-teachers-rooms": {
   "use": "living",
   "age": "P3",
   "area": 148,
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
  "newt-transfiguration-classroom": {
   "use": "teaching",
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
  "deputy-heads-records-room": {
   "use": "workroom",
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "chandelier-classroom": {
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
  "empty-classroom-1": {
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
  "room-over-caretakers-office": {
   "use": "workroom",
   "age": "P5",
   "area": 101,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "broom-cupboard-1": {
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
  "teachers-study-1": {
   "use": "study",
   "age": "P3",
   "area": 62,
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
  "gryffindor-tower-storeroom": {
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
  "staff-library": {
   "use": "library",
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
  "linen-cupboard-1": {
   "use": "store",
   "age": "P5",
   "area": 56,
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
  "spare-desks-store-1": {
   "use": "store",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "old-textbooks-store": {
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
  "washrooms-1-gate": {
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
  "washrooms-1-east": {
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
  "washrooms-1-south-west": {
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
  "store-1-west": {
   "use": "store",
   "age": "P3",
   "area": 33,
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
  "west-linen-room": {
   "use": "store",
   "age": "P3",
   "area": 27,
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
  "cleaning-cupboard-1": {
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
  "passage-to-rooms-behind-1": {
   "use": "passage",
   "age": "P2",
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
   "surface": "flagstone",
   "acoustic": "close"
  },
  "service-passage-1": {
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
  "passage-behind-west-1": {
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
  "west-range-corridor-1": {
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
  "lake-corridor-1-west": {
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
  "lake-corridor-1-mid": {
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
  "west-cross-corridor-1": {
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
  "back-stair-corridor-1": {
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
  "caretakers-slip-room-1": {
   "use": "store",
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
  "caretakers-long-cupboard-1": {
   "use": "store",
   "age": "P5",
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
  "history-dates-room-1": {
   "use": "display",
   "age": "P5",
   "area": 40,
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
  "transfiguration-prep-room-1": {
   "use": "workroom",
   "age": "P5",
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
   "surface": "oak",
   "acoustic": "dry"
  },
  "transfiguration-teachers-study-1": {
   "use": "study",
   "age": "P5",
   "area": 26,
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
  "ravenclaw-tower-room-1": {
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
  "dumbledores-tower-room-1": {
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
  "gate-north-store-1": {
   "use": "store",
   "age": "P2",
   "area": 22,
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
  }
 },
 "stairs": {
  "gate-mural-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "tapestry-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "tapestry-stair-flight-2": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "tapestry-stair-flight-3": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "down-only-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "seat-newel-2-1": {
   "surface": "stone",
   "acoustic": "close"
  },
  "seat-newel-1-g": {
   "surface": "stone",
   "acoustic": "close"
  }
 }
};
