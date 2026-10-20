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
   "hex": "#c4aa82",
   "say": "P3: sand"
  },
  "high-grey": {
   "hex": "#a7aeb2",
   "say": "P4: cool grey"
  },
  "tudor-pink": {
   "hex": "#c49a87",
   "say": "P5: warm pinkish"
  },
  "late-pale": {
   "hex": "#dcd2b0",
   "say": "P6 and P7: pale yellow to palest"
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
   "hex": "#6e4c30",
   "say": "old oak: doors, panelling, rails from P5"
  },
  "oak-boards": {
   "hex": "#7d5937",
   "say": "broad oak boards, a step paler where feet wear them"
  },
  "oak-beams": {
   "hex": "#5a3d26",
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
  "houses-sandstone/rubble": "#b9a07b",
  "houses-sandstone/coursed": "#c4aa82",
  "houses-sandstone/ashlar": "#c8ae85",
  "flags-houses-sandstone": "#b79f79",
  "flags-houses-sandstone/worn": "#baa27b",
  "vault-houses-sandstone": "#bda47d",
  "high-grey/rubble": "#9ea4a8",
  "high-grey/coursed": "#a7aeb2",
  "high-grey/ashlar": "#abb2b6",
  "flags-high-grey": "#9ca3a6",
  "flags-high-grey/worn": "#9fa5a9",
  "vault-high-grey": "#a1a8ab",
  "tudor-pink/rubble": "#b9917f",
  "tudor-pink/coursed": "#c49a87",
  "tudor-pink/ashlar": "#c89d8a",
  "flags-tudor-pink": "#b7907e",
  "flags-tudor-pink/worn": "#ba9280",
  "vault-tudor-pink": "#bd9482",
  "late-pale/rubble": "#d0c6a6",
  "late-pale/coursed": "#dcd2b0",
  "late-pale/ashlar": "#e1d7b4",
  "flags-late-pale": "#cec4a4",
  "flags-late-pale/worn": "#d1c8a7",
  "vault-late-pale": "#d4caaa"
 }
};
