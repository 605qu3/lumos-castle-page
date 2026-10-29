/* room-tags-G.js: the light, surface and acoustic tags of floor G's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS.G.rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS.G = {
 "_meta": {
  "written": "29 October 2026, 18:30 (Design, make-room-tags.py), req 1598",
  "floor": "G",
  "model": 242,
  "floor_version": 9,
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
   "marble": "the marble staircase only (PS 7)",
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
  "entrance-hall": {
   "use": "hall",
   "age": "P2",
   "area": 480,
   "h": 9.7,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 24,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false,
    "own": "the shell: Interiors' brackets in shell.html place its torches; lamps here is the check count"
   },
   "surface": "flagstone",
   "acoustic": "echoing"
  },
  "great-hall": {
   "use": "hall",
   "age": "P4",
   "area": 900,
   "h": 14.9,
   "light": {
    "day": true,
    "windows": 14,
    "lamp": "floating candle",
    "lamps": 0,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false,
    "own": "the Great Hall (floating candles and the enchanted sky; Great Hall lane, req 612 held)"
   },
   "surface": "flagstone",
   "acoustic": "echoing",
   "hearth": [
    "great-hall-fire-n-32",
    "great-hall-fire-n-50",
    "great-hall-fire-s-32",
    "great-hall-fire-s-50",
    "great-hall-fire-w"
   ]
  },
  "hall-cupboard": {
   "use": "store",
   "age": "P2",
   "area": 2,
   "h": 2.4,
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
  "waiting-chamber": {
   "use": "hall",
   "age": "P2",
   "area": 50,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "candle",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "stone-room",
   "hearth": [
    "waiting-chamber-brazier"
   ]
  },
  "filchs-office": {
   "use": "study",
   "age": "P5",
   "area": 72,
   "h": 2.5,
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
   "acoustic": "dry",
   "surface_note": "flags by the schedule (req 1609, provisional, Godric to confirm); the type doc oak waits for floors above; Pass 2 rugs soften"
  },
  "filchs-store": {
   "use": "store",
   "age": "P5",
   "area": 51,
   "h": 2.5,
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
  "classroom-corridor": {
   "use": "passage",
   "age": "P5",
   "area": 107,
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
   "surface": "flagstone",
   "acoustic": "passage",
   "h_note": "default; the model gives this room no ceiling"
  },
  "staff-passage": {
   "use": "passage",
   "age": "P5",
   "area": 21,
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
  "staff-room": {
   "use": "living",
   "age": "P5",
   "area": 90,
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
   "surface": "flagstone",
   "acoustic": "dry",
   "surface_note": "flags by the schedule (req 1609, provisional, Godric to confirm); the type doc oak waits for floors above; Pass 2 rugs soften",
   "hearth": [
    "staff-fireplace"
   ]
  },
  "secret-s2": {
   "use": "hidden",
   "age": "P4",
   "area": 42,
   "h": 2.3,
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
  "elves-tunnel": {
   "use": "hidden",
   "age": "P2",
   "area": 48,
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
  "elves-linen-room": {
   "use": "store",
   "age": "P3",
   "area": 41,
   "h": 2.2,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "gate-passage": {
   "use": "passage",
   "age": "P2",
   "area": 60,
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
  "guard-room": {
   "use": "defence",
   "age": "P2",
   "area": 20,
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
  "gun-room": {
   "use": "defence",
   "age": "P4",
   "area": 50,
   "h": 2.4,
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
  "sun-hide-g": {
   "use": "hidden",
   "age": "P6",
   "area": 5,
   "h": 2.1,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "s2-level-way-g": {
   "use": "hidden",
   "age": "P4",
   "area": 3,
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
  "lake-tower-g": {
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
   "surface": "flagstone",
   "acoustic": "stone-room",
   "hearth": [
    "lake-tower-g-hearth"
   ],
   "note": "the model gives this room no use; tagged as a plain room",
   "h_note": "default; the model gives this room no ceiling"
  },
  "tudor-bay-g": {
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
   "surface": "flagstone",
   "acoustic": "stone-room",
   "note": "the model gives this room no use; tagged as a plain room",
   "h_note": "default; the model gives this room no ceiling"
  },
  "lake-corridor-g-east": {
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
  "free-classroom-g": {
   "use": "teaching",
   "age": "P4",
   "area": 163,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "stone-room",
   "hearth": [
    "free-classroom-g-hearth"
   ]
  },
  "visitors-parlour": {
   "use": "living",
   "age": "P4",
   "area": 177,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "hearth": [
    "visitors-parlour-hearth"
   ]
  },
  "post-room": {
   "use": "service",
   "age": "P6",
   "area": 177,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "treatment-room": {
   "use": "sick",
   "age": "P6",
   "area": 177,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "hearth": [
    "treatment-room-hearth"
   ]
  },
  "registers-archive": {
   "use": "store",
   "age": "P3",
   "area": 177,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "teachers-study-g": {
   "use": "study",
   "age": "P3",
   "area": 75,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "surface_note": "flags by the schedule (req 1609, provisional, Godric to confirm); the type doc oak waits for floors above; Pass 2 rugs soften"
  },
  "study-void": {
   "use": "hidden",
   "age": "P4",
   "area": 8,
   "h": 3.0,
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
  "lake-corridor-g-west": {
   "use": "passage",
   "age": "P3",
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "drum-bend-g-west": {
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "drum-bend-g": {
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "drum-bend-g-east": {
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "drum-room-g": {
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "west-tower-room-g": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "lake-corridor-g-mid": {
   "use": "passage",
   "age": "P3",
   "area": 58,
   "h": 4.5,
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "sw-corner-lobby-g": {
   "use": "passage",
   "age": "P3",
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "washrooms-g": {
   "use": "wash",
   "age": "P3",
   "area": 42,
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "duelling-practice-room": {
   "use": "teaching",
   "age": "P3",
   "area": 164,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "candle",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "stone-room",
   "hearth": [
    "duelling-practice-room-hearth"
   ]
  },
  "quidditch-kit-room": {
   "use": "store",
   "age": "P3",
   "area": 164,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "kit-broom-cupboard": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "boys-toilets-g": {
   "use": "wash",
   "age": "P3",
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
   "acoustic": "stone-room"
  },
  "girls-toilets-g": {
   "use": "wash",
   "age": "P3",
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
   "acoustic": "stone-room"
  },
  "south-store-g1": {
   "use": "store",
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
  "peeves-lumber-room": {
   "use": "store",
   "age": "P3",
   "area": 135,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "greenhouse-one": {
   "use": "teaching",
   "age": "P7",
   "area": 1125,
   "h": 9.78,
   "light": {
    "day": true,
    "windows": 0,
    "lamp": "none",
    "lamps": 0,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false,
    "own": "the glass roof is the light (the day driver's); no lamps counted",
    "night_note": "a glass roof at night is moon and sky, not a lamp: the night floor is for Godric's eye on the first shot"
   },
   "surface": "flagstone",
   "acoustic": "glasshouse"
  },
  "sw-stair-foot-g": {
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
  "apple-store": {
   "use": "store",
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
  "listeners-gallery": {
   "use": "hidden",
   "age": "P4",
   "area": 34,
   "h": 1.8,
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
   "acoustic": "close"
  },
  "bastion-flanker": {
   "use": "cellar",
   "age": "P5",
   "area": 38,
   "h": 3.0,
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
  "fencing-room": {
   "use": "teaching",
   "age": "P4",
   "area": 79,
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
   "acoustic": "vaulted"
  },
  "north-stair-foot-g": {
   "use": "stair",
   "age": "P5",
   "area": 30,
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
  "winter-store": {
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
  "punishments-room": {
   "use": "store",
   "age": "P2",
   "area": 45,
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "hall-chamber": {
   "use": "living",
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
   "surface": "flagstone",
   "acoustic": "dry",
   "hearth": [
    "hall-chamber-fireplace"
   ]
  },
  "west-tower-way-g": {
   "use": "passage",
   "age": "P3",
   "area": 7,
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
  "old-trophies-overflow": {
   "use": "store",
   "age": "P5",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "exam-desks-store": {
   "use": "store",
   "age": "P3",
   "area": 121,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "potting-room": {
   "use": "workroom",
   "age": "P3",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room",
   "hearth": [
    "potting-room-hearth"
   ]
  },
  "herbology-study-g": {
   "use": "study",
   "age": "P3",
   "area": 123,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "candle",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "surface_note": "flags by the schedule (req 1609, provisional, Godric to confirm); the type doc oak waits for floors above; Pass 2 rugs soften",
   "hearth": [
    "herbology-study-g-hearth"
   ]
  },
  "elves-service-stair-g": {
   "use": "service",
   "age": "P3",
   "area": 121,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "owl-treats-store": {
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
  "classroom-eleven": {
   "use": "teaching",
   "age": "P5",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "stone-room"
  },
  "staff-dining-room": {
   "use": "living",
   "age": "P5",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 2,
    "lamp": "candle",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "surface_note": "flags by the schedule (req 1609, provisional, Godric to confirm); the type doc oak waits for floors above; Pass 2 rugs soften",
   "hearth": [
    "staff-dining-room-hearth"
   ]
  },
  "elves-linen-room-g": {
   "use": "service",
   "age": "P5",
   "area": 124,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "gryffindor-store-g": {
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "washrooms-g-north": {
   "use": "wash",
   "age": "P5",
   "area": 48,
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "washrooms-g-east": {
   "use": "wash",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "staff-bedroom-g": {
   "use": "living",
   "age": "P5",
   "area": 50,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "candle",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry",
   "surface_note": "flags by the schedule (req 1609, provisional, Godric to confirm); the type doc oak waits for floors above; Pass 2 rugs soften",
   "hearth": [
    "staff-bedroom-g-hearth"
   ]
  },
  "cloakroom-g": {
   "use": "store",
   "age": "P5",
   "area": 41,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "porters-lodge": {
   "use": "service",
   "age": "P5",
   "area": 41,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 1,
    "lamp": "torch",
    "lamps": 3,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "school-brooms-store": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "spare-desks-store": {
   "use": "store",
   "age": "P2",
   "area": 22,
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
   "acoustic": "vaulted"
  },
  "linen-cupboard-g-west": {
   "use": "store",
   "age": "P3",
   "area": 24,
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
   "acoustic": "vaulted"
  },
  "hall-slot-cupboard": {
   "use": "store",
   "age": "P2",
   "area": 7,
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
   "surface": "stone",
   "acoustic": "close"
  },
  "classroom-corridor-east": {
   "use": "passage",
   "age": "P5",
   "area": 80,
   "h": 4.5,
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
   "acoustic": "passage"
  },
  "west-wing-corridor-g": {
   "use": "passage",
   "age": "P3",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 4,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "east-wing-corridor-g": {
   "use": "passage",
   "age": "P5",
   "area": 79,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 4,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "passage"
  },
  "hall-chamber-way": {
   "use": "passage",
   "age": "P3",
   "area": 8,
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
   "acoustic": "close"
  },
  "great-hall-doors-passage": {
   "use": "passage",
   "age": "P2",
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
  "ravenclaw-tower-room-g": {
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "headmasters-tower-room-g": {
   "use": "store",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "stone-room"
  },
  "loop-gallery-g": {
   "use": "passage",
   "age": "P3",
   "area": 17,
   "h": 3.0,
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
  "postern-lobby-g": {
   "use": "passage",
   "age": "P4",
   "area": 17,
   "h": 3.0,
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
  "countermine-gallery": {
   "use": "passage",
   "age": "P5",
   "area": 10,
   "h": 1.8,
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
  "countermine-chamber": {
   "use": "store",
   "age": "P5",
   "area": 12,
   "h": 1.8,
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
  "hoist-landing-g": {
   "use": "store",
   "age": "P5",
   "area": 17,
   "h": 3.0,
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
  "east-lift-shaft-g": {
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
   "surface": "stone",
   "acoustic": "close"
  },
  "west-pole-shaft-g": {
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
   "surface": "stone",
   "acoustic": "close"
  },
  "west-dumbwaiter-shaft-g": {
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
   "surface": "stone",
   "acoustic": "close"
  },
  "loop-gallery-stair-g": {
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
  }
 },
 "stairs": {
  "marble-staircase": {
   "surface": "marble",
   "acoustic": "stairwell"
  },
  "core-stair-b": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "core-stair-c": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "gate-mural-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "gun-room-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "astronomy-spiral": {
   "surface": "stone",
   "acoustic": "close"
  },
  "west-tower-spiral": {
   "surface": "stone",
   "acoustic": "close"
  },
  "up-only-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "s2-climbing-way": {
   "surface": "stone",
   "acoustic": "close"
  },
  "s2-double-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "seat-newel-1-g": {
   "surface": "stone",
   "acoustic": "close"
  },
  "gallery-flight-east": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "gallery-flight-west": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "sw-stair-b": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "north-stair-b": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "loop-gallery-stair": {
   "surface": "stone",
   "acoustic": "close"
  }
 }
};
