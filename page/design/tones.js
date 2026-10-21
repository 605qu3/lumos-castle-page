/* tones.js: the castle's plain tones, written by assets/design/materials/make-tones.py (req 643). A plain script
   tag loads it; the shell reads window.CASTLE_TONES.resolved["high-grey/ashlar"], .surfaces.oak.hex, .lights.torch. */
window.CASTLE_TONES = {
 "about": "The castle's plain tones (Design, req 643, 20 October 2026; provisional, Godric to confirm on the walk): each surface's colour by day as sRGB hex, its dressing a shade step, its flags its own stone a step darker, and the lights' colours and strengths against a torch. The surfaces are the Architect's schedule (docs/architect/materials.md); assets/design/materials/make-tones.py writes this file.",
 "surfaces": {
  "founders-rubble": {
   "hex": "#5e5b4f",
   "say": "P1 and P2: dark olive-grey, the darkest and roughest"
  },
  "houses-sandstone": {
   "hex": "#726551",
   "say": "P3: sand",
   "schedule": "#c4aa82"
  },
  "high-grey": {
   "hex": "#646769",
   "say": "P4: cool grey",
   "schedule": "#a7aeb2"
  },
  "tudor-pink": {
   "hex": "#766157",
   "say": "P5: warm pinkish",
   "schedule": "#c49a87"
  },
  "late-pale": {
   "hex": "#a29a81",
   "say": "P6 and P7: pale yellow to palest",
   "schedule": "#dcd2b0"
  },
  "limewash": {
   "hex": "#e6e0d0",
   "say": "P6 and P7 rooms' walls limewashed, a warm off-white"
  },
  "plaster": {
   "hex": "#e8e2d4",
   "say": "the P6 and P7 flat ceilings"
  },
  "marble": {
   "hex": "#e2ded6",
   "say": "the marble staircase's treads and banisters (PS 7 L2317), a warm white"
  },
  "oak": {
   "hex": "#684e38",
   "say": "old oak: doors, panelling, rails from P5"
  },
  "oak-boards": {
   "hex": "#765a40",
   "say": "broad oak boards, a step paler where feet wear them"
  },
  "oak-beams": {
   "hex": "#55402e",
   "say": "the beams and the roofs' open timbers, darker with age and smoke"
  },
  "iron": {
   "hex": "#34312e",
   "say": "wrought iron, black, never pure black: brackets, hinges, rails P1 to P4"
  },
  "brass": {
   "hex": "#b08a48",
   "say": "only where canon puts it (the head's griffin knocker, CoS 11 L10580)"
  },
  "sky-day": {
   "hex": "#b8cde6",
   "say": "the Great Hall's ceiling by a clear day: castle-light.js's noon sky"
  },
  "sky-night": {
   "hex": "#10141f",
   "say": "the Great Hall's ceiling by night: castle-light.js's night sky"
  }
 },
 "dressing": {
  "rubble": 0.88,
  "coursed": 1.0,
  "ashlar": 1.05
 },
 "steps": {
  "flags": 0.86,
  "flags-worn": 1.04,
  "vault": 0.92,
  "soot": 0.7
 },
 "lights": {
  "torch": {
   "hex": "#ffc28a",
   "gain": 1.0,
   "say": "a pitch torch in an iron bracket, as the eye takes it once used to the dark: warm, never orange (a plain multiply by a flame's own colour turns every stone to rust)"
  },
  "candle": {
   "hex": "#ffb466",
   "gain": 0.55,
   "say": "a candle or a field of them: castle-light.js's gold (req 476)"
  },
  "day": {
   "hex": "#dfe6ee",
   "gain": 0.8,
   "say": "daylight through a window, as the hemisphere's sky: castle-light.js's cloudy noon fill, a touch cool"
  },
  "sky": {
   "hex": "#27314f",
   "gain": 0.25,
   "say": "the enchanted ceiling's own light by night: castle-light.js's moonlit sky"
  }
 },
 "resolved": {
  "founders-rubble/rubble": "#58564a",
  "founders-rubble/coursed": "#5e5b4f",
  "founders-rubble/ashlar": "#605d51",
  "flags-founders-rubble": "#575549",
  "flags-founders-rubble/worn": "#59564b",
  "vault-founders-rubble": "#5a574c",
  "founders-rubble/rubble/below": "#4a483e",
  "founders-rubble/coursed/below": "#4f4d42",
  "founders-rubble/ashlar/below": "#514f44",
  "flags-founders-rubble/below": "#49473d",
  "flags-founders-rubble/worn/below": "#4b493e",
  "vault-founders-rubble/below": "#4c4a3f",
  "houses-sandstone/rubble": "#6b5f4c",
  "houses-sandstone/coursed": "#726551",
  "houses-sandstone/ashlar": "#756753",
  "flags-houses-sandstone": "#6a5e4b",
  "flags-houses-sandstone/worn": "#6c604d",
  "vault-houses-sandstone": "#6e614e",
  "houses-sandstone/rubble/below": "#5c5241",
  "houses-sandstone/coursed/below": "#625745",
  "houses-sandstone/ashlar/below": "#645947",
  "flags-houses-sandstone/below": "#5b5140",
  "flags-houses-sandstone/worn/below": "#5d5241",
  "vault-houses-sandstone/below": "#5e5442",
  "high-grey/rubble": "#5e6163",
  "high-grey/coursed": "#646769",
  "high-grey/ashlar": "#66696b",
  "flags-high-grey": "#5d6062",
  "flags-high-grey/worn": "#5f6264",
  "vault-high-grey": "#606365",
  "high-grey/rubble/below": "#515355",
  "high-grey/coursed/below": "#56585a",
  "high-grey/ashlar/below": "#585a5c",
  "flags-high-grey/below": "#505254",
  "flags-high-grey/worn/below": "#515355",
  "vault-high-grey/below": "#535556",
  "tudor-pink/rubble": "#6f5b52",
  "tudor-pink/coursed": "#766157",
  "tudor-pink/ashlar": "#796359",
  "flags-tudor-pink": "#6e5a51",
  "flags-tudor-pink/worn": "#705c52",
  "vault-tudor-pink": "#715d54",
  "tudor-pink/rubble/below": "#5f4e45",
  "tudor-pink/coursed/below": "#65534a",
  "tudor-pink/ashlar/below": "#67554c",
  "flags-tudor-pink/below": "#5e4d45",
  "flags-tudor-pink/worn/below": "#604f46",
  "vault-tudor-pink/below": "#615047",
  "late-pale/rubble": "#99917a",
  "late-pale/coursed": "#a29a81",
  "late-pale/ashlar": "#a69d84",
  "flags-late-pale": "#979078",
  "flags-late-pale/worn": "#9a927b",
  "vault-late-pale": "#9c947c",
  "late-pale/rubble/below": "#89826d",
  "late-pale/coursed/below": "#918a74",
  "late-pale/ashlar/below": "#948d77",
  "flags-late-pale/below": "#87816c",
  "flags-late-pale/worn/below": "#8a836e",
  "vault-late-pale/below": "#8c8570"
 },
 "toward": {
  "stones": [
   "houses-sandstone",
   "high-grey",
   "tudor-pink"
  ],
  "kept": 0.15,
  "chroma": 0.55,
  "below": {
   "L": -6.0,
   "chroma": 0.9
  },
  "late-pale": {
   "kept": 0.55,
   "chroma": 0.8
  }
 }
};
