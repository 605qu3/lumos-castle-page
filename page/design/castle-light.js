// The castle's light, worked once for every room (docs/room-states.md §4: light is Design's, the windows the
// Architect's; board req 476, the Great Hall's ask, the first room to take it). A room's page reads the runtime's
// drivers (page/castle-events.js: sun(), weather(), moon(), time, occasion) and its chain's cues, asks
// CastleLight.at() for a recipe, and maps the recipe to its own lights; nothing here keeps a clock or draws.
//
// The world rules hold it: light only where it is the thing's own (the sun and the sky through a window, a candle's
// flame, a fire, a lamp, the moon); nothing glows to mark a thing or say tap me (docs/ministry/readers/GL.md). The
// dark is eased, never total: at night with every candle out a room keeps a floor of sky light through its windows
// (the charter, 15 October 2026: the dark and heights eased in, light near), set per boy later by his settings.
//
// CastleLight.at(d, o) d: { sun: { up, altitude, bearing, height }, weather: { sky }, moon: { up, light, phase,
//   altitude }, time, occasion, year } as the runtime gives them; o: { candles: 'pale' | 'gold' | 'out' (the chain's
//   cue: pale by day, gold from dusk, out at night, lookup-q1-lit-1013), windows: true (a room with windows) }.
// Returns { sky, fill, sun, moon, candles, occasion, level, note }, every colour a 0xRRGGBB number:
//   sky      the window panes' colour seen from inside (and a ceiling that mirrors it, Magic's to use or not)
//   fill     { sky, ground, intensity }: a hemisphere light, the daylight and night sky's spread through the room
//   ambient  a small even floor, so no corner is ever black
//   sun      { on, colour, intensity }: direct sun, only where the room's own window geometry lets it through
//   moon     { on, colour, intensity }: a bright moon's direct light, likewise
//   candles  { state, flame, colour, intensity, reach, decay, angle, penumbra }: the floating candles' own light as
//            pools under the bands (spot lights pointing down over the tables, Interiors' *The look up*, trick 5:
//            the gold plates lit under the bands, the aisles darker), the flames' own colour
//   occasion { pumpkin, tree, lantern }: each the emissive colour and strength of a thing lit by its own candle
//            (the pumpkins' carved faces, the trees' little candles, the lanterns by the cabin), or null when not that day;
//            the lanterns only with d.cabin (req 1263, Godric 27 October 2026: no cabin in 1897)
//   level    0..1, the daylight's strength, for a page's own uses (a sound's brightness, a shot's caption)
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  // mix two 0xRRGGBB colours, t 0..1
  const mix = (a, b, t) => {
    t = clamp(t, 0, 1);
    const c = s => [(a >> s) & 255, (b >> s) & 255];
    return [16, 8, 0].reduce((n, s) => { const [x, y] = c(s); return n | (Math.round(x + (y - x) * t) << s); }, 0);
  };
  // the sky's own colours, from inside a stone room looking out
  const SKY = {
    noon: 0xb8cde6, low: 0xe9c9a2, dusk: 0x56607a, night: 0x10141f, moonlit: 0x27314f,
    cloud: 0xa4a9b0, rain: 0x868d95, snow: 0xc6cacd, fog: 0xb2b5b4, cloudNight: 0x13161c,
  };
  // how much of a clear sky's light each weather lets through, and its tint
  const WET = { clear: [1, null], cloudy: [0.6, 'cloud'], rain: [0.42, 'rain'], snow: [0.72, 'snow'], fog: [0.5, 'fog'] };
  // the sun's colour by its height: warm and low at its rising and setting, near white by midday
  const sunColour = alt => alt < 4 ? 0xffa868 : alt < 12 ? mix(0xffa868, 0xffd8a8, (alt - 4) / 8) : mix(0xffd8a8, 0xfff2e0, (alt - 12) / 20);

  function at(d = {}, o = {}) {
    const sun = d.sun || {}, moon = d.moon || {}, sky = (d.weather && d.weather.sky) || 'clear';
    const [wk, wt] = WET[sky] || WET.clear, alt = typeof sun.altitude === 'number' ? sun.altitude : (sun.up ? 20 : -12);
    // daylight: from civil twilight (the sun six degrees under) to full at about forty degrees, then through the weather
    const day = ease((alt + 6) / 46), level = day * wk;
    // the panes: night, twilight, low warm sun, clear noon; then greyed by the weather
    let pane;
    if (alt <= -6) pane = moon.up && (moon.light || 0) > 0.3 ? mix(SKY.night, SKY.moonlit, (moon.light - 0.3) / 0.7) : SKY.night;
    else if (alt <= 0) pane = mix(SKY.night, SKY.dusk, (alt + 6) / 6);
    else if (alt < 14) pane = mix(SKY.low, SKY.noon, (alt - 3) / 11);
    else pane = SKY.noon;
    if (alt > -6 && alt <= 2) pane = mix(pane, SKY.low, alt > 0 ? 0.5 : 0.25 * (alt + 6) / 6);   // the afterglow
    if (wt) pane = alt > -6 ? mix(pane, SKY[wt], 0.7) : mix(pane, SKY.cloudNight, 0.8);
    // the fill: the daylight's spread, cool at noon, warm when the sun is low, a little moonlight at night
    const moonFill = alt <= -6 && moon.up && sky === 'clear' ? 0.06 * (moon.light || 0) : 0;
    const fillSky = alt < 14 && alt > -6 ? mix(0xd4c7b6, 0xcfd8e6, (alt + 6) / 20) : alt <= -6 ? 0x9aa6c8 : (wt ? 0xc9cdd2 : 0xcfd8e6);
    const fill = { sky: fillSky, ground: 0x3a332c, intensity: +(0.07 + 0.58 * level + moonFill).toFixed(3) };
    // the candles' own light, pools under the bands
    const cs = o.candles || 'pale';
    const candles = cs === 'gold'
      ? { state: 'gold', flame: 0xffc35a, colour: 0xffb466, intensity: 1.3, reach: 13, decay: 1.2, angle: 0.95, penumbra: 1 }
      : cs === 'pale'
        ? { state: 'pale', flame: 0xfff4dc, colour: 0xffe6c0, intensity: 0.3, reach: 12, decay: 1.4, angle: 0.95, penumbra: 1 }
        : { state: 'out', flame: 0, colour: 0, intensity: 0, reach: 0, decay: 1, angle: 0.95, penumbra: 1 };
    // thousands of flames light the whole room warmly, the pools under the bands only a little brighter
    if (cs === 'gold') { fill.sky = mix(fill.sky, 0xf0c890, 0.6 * (1 - level)); fill.ground = 0x5a4632; fill.intensity = +(fill.intensity + 0.42 * (1 - 0.6 * level)).toFixed(3); }
    else if (cs === 'pale') { fill.sky = mix(fill.sky, 0xeedcc0, 0.25); fill.intensity = +(fill.intensity + 0.1).toFixed(3); }
    // the sun direct: only through clear or thin skies, and the room's windows decide where it lands
    const sunOn = !!sun.up && alt > 0 && (sky === 'clear' || sky === 'cloudy');
    const sunI = sunOn ? (sky === 'clear' ? 0.75 : 0.22) * ease(alt / 18) : 0;
    const moonOn = !sun.up && !!moon.up && sky === 'clear' && (moon.light || 0) > 0.6;
    // the occasions' own lights: each a thing lit by its own candle
    const occ = String(d.occasion || 'none').replace(/-/g, ' ');
    const dark = 1 - level;   // a lit pumpkin or tree candle shows more as the day goes
    const occasion = {
      pumpkin: occ === 'halloween' ? { colour: 0xff8a2a, intensity: +(0.35 + 0.65 * dark).toFixed(3) } : null,
      tree: /^christmas/.test(occ) ? { colour: 0xffd27a, intensity: +(0.5 + 0.5 * dark).toFixed(3) } : null,
      lantern: occ === 'halloween' && d.year === 2 && d.cabin ? { colour: 0xff9a3a, intensity: +(0.4 + 0.6 * dark).toFixed(3) } : null,
    };
    if (occasion.pumpkin && cs === 'gold') candles.colour = mix(candles.colour, 0xff9a4a, 0.25);
    const note = `${sky}, the sun ${alt > 0 ? 'up at ' + alt : alt > -6 ? 'just set' : 'down'}; candles ${cs}`;
    return {
      sky: pane, fill, ambient: alt <= -6 ? 0.05 : 0.06, level: +level.toFixed(3), note,
      sun: { on: sunOn, colour: sunColour(Math.max(0, alt)), intensity: +sunI.toFixed(3) },
      moon: { on: moonOn, colour: 0xc8d4ff, intensity: moonOn ? +(0.12 * moon.light).toFixed(3) : 0 },
      candles, occasion,
    };
  }

  // a flame's own unsteadiness, for any flame-lit light (a torch, a lamp carried, a fire, a candle's pool): a
  // multiplier near 1, t in seconds, seed a light's own so no two flames move together; depth 0.06 for a lamp or a
  // torch, 0.12 for a fire, 0.03 for a candle's pool. Three slow waves and one quick one, never a strobe.
  function flicker(t, seed = 1, depth = 0.06) {
    const s = seed * 12.9898;
    const w = Math.sin(t * 1.7 + s) * 0.45 + Math.sin(t * 3.1 + s * 1.3) * 0.3 + Math.sin(t * 5.3 + s * 0.7) * 0.15 + Math.sin(t * 13.7 + s * 2.1) * 0.1;
    return 1 + depth * w;
  }
  // a lamp carried at a walk (req 452, Filch's on the corridor): its oil flame a little warmer and lower than a
  // torch's, its light a shade below the torches', swaying with his step
  const LAMP = { colour: 0xf2a860, intensity: 1.15, reach: 4.5, decay: 1.6, height: 0.85, sway: 0.04, bob: 0.03, step: 5.5 };

  const api = { at, mix, SKY, flicker, LAMP };
  if (typeof window !== 'undefined') window.CastleLight = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
