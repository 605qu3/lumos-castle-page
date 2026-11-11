/* tones.js: the castle's plain tones, written by assets/design/materials/make-tones.py (req 643). A plain script
   tag loads it; the shell reads window.CASTLE_TONES.resolved["high-grey/ashlar"], .surfaces.oak.hex, .lights.torch. */
window.CASTLE_TONES = {
 "about": "The castle's plain tones (Design, req 643, 20 October 2026; provisional, Godric to confirm on the walk): each surface's colour by day as sRGB hex, its dressing a shade step, its flags its own stone a step darker, and the lights' colours and strengths against a torch. The surfaces are the Architect's schedule (docs/architect/materials.md); assets/design/materials/make-tones.py writes this file.",
 "surfaces": {
  "founders-rubble": {
   "hex": "#555656",
   "say": "P1 and P2: dark olive-grey, the darkest and roughest"
  },
  "houses-sandstone": {
   "hex": "#7b6340",
   "say": "P3: sand",
   "schedule": "#c4aa82"
  },
  "high-grey": {
   "hex": "#646769",
   "say": "P4: cool grey",
   "schedule": "#a7aeb2"
  },
  "tudor-pink": {
   "hex": "#516373",
   "say": "P5: slate blue-grey (req 2162)",
   "schedule": "#8a97a6"
  },
  "late-pale": {
   "hex": "#b3a079",
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
  },
  "far-stone": {
   "hex": "#82888b",
   "say": "the castle's own walls across a court or a lawn: high-grey as scheduled, taken toward founders-rubble as late-pale was (req 852), since daylight lifts it where a torch did not"
  },
  "far-rock": {
   "hex": "#6c695b",
   "say": "the crag under the castle: the founders' rubble is its own stone, the open face weathered paler"
  },
  "far-roof": {
   "hex": "#58606a",
   "say": "slate cones and roofs (P5) and lead flats (P1 to P4), one tone at that distance: a blue-grey slate"
  },
  "far-timber": {
   "hex": "#6f6455",
   "say": "outdoor oak, Hagrid's hut and the stands: oak-beams' wood weathered silver-brown in the rain"
  },
  "far-glass": {
   "hex": "#a7b5c6",
   "say": "the greenhouses' glass: the day's sky in it, greyed by the panes and the plants behind"
  },
  "far-window": {
   "hex": "#2b2f36",
   "say": "the castle's windows by day from across a court: dark glass, never black"
  },
  "far-window-night": {
   "hex": "#d9a65a",
   "say": "the same by night, lit from within ('windows sparkling', PS 6): the candle's gold; for farView to use if it takes it"
  },
  "far-water-day": {
   "hex": "#626c78",
   "say": "the lake by day: 'a great black lake' (PS 6), a dark peaty loch with the pale sky in it"
  },
  "far-water-night": {
   "hex": "#161b26",
   "say": "the lake by night: the night sky's own blue, a touch lighter so the shore line reads"
  },
  "far-lawn": {
   "hex": "#7d8a5c",
   "say": "the lawns, a Highland grass in autumn (invented; farView's provisional, kept)"
  },
  "far-pitch": {
   "hex": "#8d9a64",
   "say": "the pitch, mown: the lawn a step paler and greener (invented; farView's provisional, kept)"
  },
  "far-forest": {
   "hex": "#36412d",
   "say": "the Forbidden Forest: dark conifer and oak, a step below the lawn's green (invented)"
  },
  "far-hills": {
   "hex": "#7c8592",
   "say": "the far hills: heather and bracken gone blue-grey with distance (invented; near farView's provisional)"
  },
  "far-pasture": {
   "hex": "#777650",
   "say": "the village's rough pasture and the moraine: tussock, rush and bent grass, browner and duller than the castle's grass, never mown (invented)"
  },
  "far-scrub": {
   "hex": "#4d5034",
   "say": "scrub on the glen's sides and by the lane: gorse, broom and birch, a dark olive with a rust of dead bracken (invented)"
  },
  "far-boulders": {
   "hex": "#8a877b",
   "say": "the boulder-strewn ground past the stile toward the mountain (GoF 27): the crag's stone, lichened a step paler (invented)"
  },
  "far-thatch": {
   "hex": "#7b6d55",
   "say": "the cottages' roofs: 'the little thatched cottages' (PoA 10), straw weathered grey-brown, darker than the castle's slate is blue"
  },
  "far-cottage": {
   "hex": "#9e998c",
   "say": "the cottages' walls: lime-washed rubble gone grey with weather, a step warmer than the castle's far stone (invented; canon gives no colour)"
  },
  "far-garden": {
   "hex": "#5c6a40",
   "say": "the cottage gardens, fewer houses and larger gardens toward the stile (GoF 27): kale, potatoes and rough hedge, the one worked green, darker than the pasture (invented)"
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
  "founders-rubble/rubble": "#505151",
  "founders-rubble/coursed": "#555656",
  "founders-rubble/ashlar": "#575858",
  "flags-founders-rubble": "#4f5050",
  "flags-founders-rubble/worn": "#505152",
  "vault-founders-rubble": "#515253",
  "founders-rubble/rubble/below": "#424344",
  "founders-rubble/coursed/below": "#474848",
  "founders-rubble/ashlar/below": "#494a4a",
  "flags-founders-rubble/below": "#414243",
  "flags-founders-rubble/worn/below": "#434444",
  "vault-founders-rubble/below": "#444545",
  "houses-sandstone/rubble": "#745d3c",
  "houses-sandstone/coursed": "#7b6340",
  "houses-sandstone/ashlar": "#7e6542",
  "flags-houses-sandstone": "#735c3b",
  "flags-houses-sandstone/worn": "#755e3c",
  "vault-houses-sandstone": "#775f3d",
  "houses-sandstone/rubble/below": "#645031",
  "houses-sandstone/coursed/below": "#6b5535",
  "houses-sandstone/ashlar/below": "#6d5737",
  "flags-houses-sandstone/below": "#634f30",
  "flags-houses-sandstone/worn/below": "#655031",
  "vault-houses-sandstone/below": "#675232",
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
  "vault-high-grey/below": "#535557",
  "tudor-pink/rubble": "#4b5d6d",
  "tudor-pink/coursed": "#516373",
  "tudor-pink/ashlar": "#536576",
  "flags-tudor-pink": "#4a5c6c",
  "flags-tudor-pink/worn": "#4d5e6d",
  "vault-tudor-pink": "#4d5f6f",
  "tudor-pink/rubble/below": "#3f4f5e",
  "tudor-pink/coursed/below": "#445463",
  "tudor-pink/ashlar/below": "#465665",
  "flags-tudor-pink/below": "#3e4e5d",
  "flags-tudor-pink/worn/below": "#40505e",
  "vault-tudor-pink/below": "#41515f",
  "late-pale/rubble": "#aa9772",
  "late-pale/coursed": "#b3a079",
  "late-pale/ashlar": "#b7a37c",
  "flags-late-pale": "#a79670",
  "flags-late-pale/worn": "#ab9873",
  "vault-late-pale": "#ad9a74",
  "late-pale/rubble/below": "#998865",
  "late-pale/coursed/below": "#a1906c",
  "late-pale/ashlar/below": "#a4936f",
  "flags-late-pale/below": "#978764",
  "flags-late-pale/worn/below": "#9a8966",
  "vault-late-pale/below": "#9c8b68",
  "late-pale/limewash": "#e8d09a"
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
 },
 "period": {
  "founders-rubble": [
   -2,
   0.4,
   0.4,
   0,
   -3
  ],
  "houses-sandstone": [
   0,
   1.0,
   1.0,
   3,
   10
  ],
  "high-grey": [
   0,
   0.6,
   0.5,
   0,
   -1
  ],
  "tudor-pink": [
   -1,
   1.0,
   1.0,
   -2,
   -6
  ],
  "late-pale": [
   3,
   1.0,
   1.0,
   2,
   9
  ]
 }
};
