/* room-tags-T.js: the light, surface and acoustic tags of floor T's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS.T.rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS.T = {
 "_meta": {
  "written": "30 October 2026, 18:07 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "T",
  "model": 255,
  "floor_version": null,
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
  "divination-classroom": {
   "use": "teaching",
   "age": "P4",
   "area": 141,
   "h": 51.0,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "candle",
    "lamps": 8,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "echoing",
   "hearth": [
    "divination-hearth"
   ]
  },
  "north-tower-landing": {
   "use": "passage",
   "age": "P4",
   "area": 141,
   "h": 48.0,
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
   "acoustic": "echoing"
  },
  "dormitory": {
   "use": "sleeping",
   "age": "P3",
   "area": 99,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 5,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "oak",
   "acoustic": "dry"
  },
  "dumbledores-office": {
   "use": "study",
   "age": "P4",
   "area": 64,
   "h": 57.0,
   "light": {
    "day": true,
    "windows": 4,
    "lamp": "candle",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "oak",
   "acoustic": "echoing",
   "hearth": [
    "dumbledores-fireplace"
   ]
  },
  "secret-s1": {
   "use": "hidden",
   "age": "P4",
   "area": 141,
   "h": 44.7,
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
   "acoustic": "close"
  },
  "owlery": {
   "use": "service",
   "age": "P4",
   "area": 72,
   "h": 47.2,
   "light": {
    "day": true,
    "windows": 6,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "echoing"
  },
  "astronomy-tower-top": {
   "use": "teaching",
   "age": "P4",
   "area": 177,
   "h": 83.2,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "echoing"
  }
 },
 "stairs": {
  "marble-staircase": {
   "surface": "marble",
   "acoustic": "stairwell"
  },
  "astronomy-spiral": {
   "surface": "stone",
   "acoustic": "close"
  },
  "west-tower-spiral": {
   "surface": "stone",
   "acoustic": "close"
  }
 }
};
