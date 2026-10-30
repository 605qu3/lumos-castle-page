/* room-tags-B.js: the light, surface and acoustic tags of floor B's rooms, written by
   assets/design/materials/make-room-tags.py (req 1598). A plain script tag loads it; the shell reads
   window.CASTLE_ROOM_TAGS.B.rooms[id].light / .surface / .acoustic and .stairs[id]. */
window.CASTLE_ROOM_TAGS = window.CASTLE_ROOM_TAGS || {};
window.CASTLE_ROOM_TAGS.B = {
 "_meta": {
  "written": "29 October 2026, 21:53 (Design, make-room-tags.py), req 1598, req 1650",
  "floor": "B",
  "model": 244,
  "floor_version": 4,
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
  "dungeon-corridor": {
   "use": "passage",
   "age": "P1",
   "area": 312,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 16,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "potions-dungeon": {
   "use": "cellar",
   "age": "P2",
   "area": 160,
   "h": 4.0,
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
   "acoustic": "vaulted",
   "hearth": [
    "marchpane-hearth"
   ]
  },
  "snape-office": {
   "use": "study",
   "age": "P2",
   "area": 20,
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
   "acoustic": "dry",
   "hearth": [
    "snape-fireplace"
   ],
   "h_note": "default; the model gives this room no ceiling"
  },
  "stone-pit": {
   "use": "hidden",
   "age": "P1",
   "area": 36,
   "h": 3.5,
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
  "stone-passage-down": {
   "use": "passage",
   "age": "P1",
   "area": 35,
   "h": 6.9,
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
  "stone-keys-chamber": {
   "use": "hidden",
   "age": "P1",
   "area": 120,
   "h": 8.0,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 6,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "stone-chess-chamber": {
   "use": "hidden",
   "age": "P1",
   "area": 440,
   "h": 7.0,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 22,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "stone-passage-up": {
   "use": "passage",
   "age": "P1",
   "area": 48,
   "h": 4.9,
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
  "stone-troll-room": {
   "use": "hidden",
   "age": "P1",
   "area": 64,
   "h": 5.5,
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
   "acoustic": "close"
  },
  "stone-potions-room": {
   "use": "hidden",
   "age": "P1",
   "area": 18,
   "h": 3.5,
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
  "stone-last-chamber": {
   "use": "hidden",
   "age": "P1",
   "area": 86,
   "h": 6.0,
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
   "acoustic": "close"
  },
  "kitchens": {
   "use": "service",
   "age": "P2",
   "area": 900,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 45,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "echoing",
   "hearth": [
    "kitchens-fire"
   ]
  },
  "dungeon-steps": {
   "use": "passage",
   "age": "P1",
   "area": 7,
   "h": 8.4,
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
  "dungeon-steps-way": {
   "use": "passage",
   "age": "P1",
   "area": 42,
   "h": 4.6,
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
  "kitchens-steps": {
   "use": "service",
   "age": "P4",
   "area": 28,
   "h": 8.4,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 2,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "kitchens-corridor": {
   "use": "service",
   "age": "P2",
   "area": 68,
   "h": 4.0,
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
  "barrel-nook-b": {
   "use": "service",
   "age": "P2",
   "area": 2,
   "h": 2.4,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "lantern",
    "lamps": 1,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "secret-s3": {
   "use": "cellar",
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
  "founders-undercroft": {
   "use": "cellar",
   "age": "P1",
   "area": 173,
   "h": 4.2,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 9,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "undercroft-west-way": {
   "use": "hidden",
   "age": "P1",
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
  "cliff-vault": {
   "use": "cellar",
   "age": "P4",
   "area": 56,
   "h": 4.2,
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
  "ice-house": {
   "use": "store",
   "age": "P2",
   "area": 28,
   "h": 5.2,
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
  "ice-house-way": {
   "use": "hidden",
   "age": "P2",
   "area": 3,
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
   "surface": "stone",
   "acoustic": "close"
  },
  "old-cells-passage": {
   "use": "hidden",
   "age": "P2",
   "area": 13,
   "h": 3.4,
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
  "old-cell-w1": {
   "use": "store",
   "age": "P3",
   "area": 11,
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
  "old-cell-w2": {
   "use": "store",
   "age": "P2",
   "area": 11,
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
  "old-cell-w3": {
   "use": "store",
   "age": "P2",
   "area": 11,
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
  "old-cell-w4": {
   "use": "store",
   "age": "P2",
   "area": 11,
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
  "old-cell-e1": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "close"
  },
  "old-cell-e2": {
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
  "old-cell-e3": {
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
  "old-cell-e4": {
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
  "lake-corridor-b-east": {
   "use": "passage",
   "age": "P6",
   "area": 184,
   "h": 4.5,
   "light": {
    "day": true,
    "windows": 5,
    "lamp": "torch",
    "lamps": 10,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "lake-corridor-b-keep": {
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
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "h82-way": {
   "use": "hidden",
   "age": "P4",
   "area": 11,
   "h": -56.5,
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
  "h82-glass-house": {
   "use": "hidden",
   "age": "P6",
   "area": 288,
   "h": -53.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 15,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "close"
  },
  "h82-gallery-way": {
   "use": "hidden",
   "age": "P6",
   "area": 8,
   "h": -55.6,
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
  "lake-tower-b": {
   "use": "unset",
   "age": "P7",
   "area": 68,
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "note": "the model gives this room no use; tagged as a plain room",
   "h_note": "default; the model gives this room no ceiling"
  },
  "shell-grotto": {
   "use": "cellar",
   "age": "P2",
   "area": 50,
   "h": 4.2,
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
  "lake-corridor-b-west": {
   "use": "passage",
   "age": "P3",
   "area": 86,
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "drum-room-b": {
   "use": "cellar",
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
   "surface": "earth",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "west-stair-foot-b": {
   "use": "stair",
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
   "surface": "flagstone",
   "acoustic": "stairwell",
   "h_note": "default; the model gives this room no ceiling"
  },
  "gun-casemate": {
   "use": "cellar",
   "age": "P4",
   "area": 122,
   "h": 3.3,
   "light": {
    "day": true,
    "windows": 3,
    "lamp": "torch",
    "lamps": 7,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "powder-room": {
   "use": "store",
   "age": "P4",
   "area": 79,
   "h": 3.3,
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
  "roomier-dungeon": {
   "use": "hall",
   "age": "P2",
   "area": 70,
   "h": 4.0,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 4,
    "day_floor": 0.3,
    "night_floor": 0.2,
    "read": false
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "hall-undercroft": {
   "use": "cellar",
   "age": "P2",
   "area": 197,
   "h": 4.0,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "torch",
    "lamps": 10,
    "day_floor": 0.3,
    "night_floor": 0.14,
    "read": false
   },
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "old-potions-store": {
   "use": "store",
   "age": "P2",
   "area": 15,
   "h": 3.4,
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
  "lake-passage-b": {
   "use": "passage",
   "age": "P3",
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
   "surface": "flagstone",
   "acoustic": "vaulted",
   "h_note": "default; the model gives this room no ceiling"
  },
  "slytherin-common-room": {
   "use": "living",
   "age": "P1",
   "area": 384,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 20,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "dry"
  },
  "potions-classroom-b": {
   "use": "teaching",
   "age": "P2",
   "area": 376,
   "h": 4.5,
   "light": {
    "day": false,
    "windows": 0,
    "lamp": "candle",
    "lamps": 19,
    "day_floor": 0.3,
    "night_floor": 0.3,
    "read": true
   },
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "hufflepuff-basement-corridor": {
   "use": "passage",
   "age": "P2",
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
  "wizard-chess-room": {
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
   "surface": "flagstone",
   "acoustic": "dry"
  },
  "dungeon-bench-store": {
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
  "armour-spare-parts-store": {
   "use": "store",
   "age": "P3",
   "area": 148,
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
  "coal-and-log-store": {
   "use": "store",
   "age": "P2",
   "area": 140,
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
  "banner-and-linen-store": {
   "use": "store",
   "age": "P5",
   "area": 140,
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
  "prefects-patrol-room": {
   "use": "study",
   "age": "P5",
   "area": 142,
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
   "surface": "marble",
   "acoustic": "dry"
  },
  "detention-dungeon": {
   "use": "workroom",
   "age": "P5",
   "area": 139,
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
  "christmas-decorations-store": {
   "use": "store",
   "age": "P5",
   "area": 139,
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
  "service-store-b": {
   "use": "store",
   "age": "P2",
   "area": 128,
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
  "portraits-store": {
   "use": "store",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "potions-dungeon-newt": {
   "use": "teaching",
   "age": "P2",
   "area": 48,
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
  "peeves-chalk-den": {
   "use": "store",
   "age": "P5",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "spell-practice-room": {
   "use": "teaching",
   "age": "P5",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "potions-dungeon-owl": {
   "use": "teaching",
   "age": "P2",
   "area": 48,
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
  "potions-ingredients-store": {
   "use": "store",
   "age": "P2",
   "area": 118,
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "east-corner-store-b": {
   "use": "store",
   "age": "P3",
   "area": 70,
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
  "ghosts-gathering-room": {
   "use": "hall",
   "age": "P5",
   "area": 49,
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "feast-cold-room": {
   "use": "cellar",
   "age": "P2",
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
  "house-elves-quarters": {
   "use": "living",
   "age": "P2",
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
   "surface": "flagstone",
   "acoustic": "dry"
  },
  "scullery": {
   "use": "service",
   "age": "P2",
   "area": 49,
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "quill-ink-store": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "candle-store": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "spare-robes-store": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "laundry": {
   "use": "service",
   "age": "P3",
   "area": 41,
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "bakery-ovens": {
   "use": "service",
   "age": "P3",
   "area": 46,
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "broom-cupboard": {
   "use": "store",
   "age": "P2",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "washrooms-sw": {
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
   "acoustic": "vaulted"
  },
  "sw-stair-foot-b": {
   "use": "stair",
   "age": "P3",
   "area": 32,
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
   "acoustic": "stairwell"
  },
  "spare-desks-store-b": {
   "use": "store",
   "age": "P3",
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
  "north-stair-foot-b": {
   "use": "stair",
   "age": "P5",
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
   "surface": "flagstone",
   "acoustic": "stairwell"
  },
  "potions-link-corridor": {
   "use": "passage",
   "age": "P2",
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
  "east-wing-corridor-b": {
   "use": "passage",
   "age": "P5",
   "area": 87,
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
   "acoustic": "vaulted"
  },
  "west-stair-corridor-b": {
   "use": "passage",
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
   "surface": "flagstone",
   "acoustic": "vaulted"
  },
  "slytherin-way": {
   "use": "hidden",
   "age": "P3",
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
   "acoustic": "close"
  },
  "kitchen-stores": {
   "use": "store",
   "age": "P2",
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
  "brewing-cellar": {
   "use": "cellar",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "butterbeer-cellar": {
   "use": "cellar",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "caretakers-confiscations-store": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "spare-cauldrons-store": {
   "use": "store",
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
   "surface": "stone",
   "acoustic": "vaulted"
  },
  "service-corridor-b": {
   "use": "passage",
   "age": "P5",
   "area": 237,
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
   "acoustic": "vaulted"
  },
  "boat-and-lamp-store": {
   "use": "store",
   "age": "P3",
   "area": 64,
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
  "drum-back-store-b": {
   "use": "store",
   "age": "P3",
   "area": 64,
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
  "trunk-room": {
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
   "acoustic": "vaulted"
  }
 },
 "stairs": {
  "back-stair-k": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "core-stair-a": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "hall-kitchens-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "vault-stair": {
   "surface": "stone",
   "acoustic": "close"
  },
  "ice-house-steps": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "shell-grotto-steps": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "dungeon-steps-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "kitchens-steps-stair": {
   "surface": "stone",
   "acoustic": "stairwell"
  },
  "h82-fern-well": {
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
  }
 }
};
