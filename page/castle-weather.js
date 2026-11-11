/* castle-weather.js: the castle's weather and light effects, one module (Weather lane, req 5318 audit, Godric's 1 on
   req 5324: sunbeams with dust through the high windows first).

   It reads the runtime's sun ({ up, altitude, bearing }, degrees, bearing from north, east 90, as castle-events.js
   gives it) and sky ('clear' | 'cloudy' | 'rain' | ...) and Design's CastleLight.at() for the sun's colour and
   strength; it keeps no clock. A room only NAMES its windows; it never draws or aims a beam itself.

   CastleWeather.shafts(THREE, windows, o)  ->  { group, update(sun, sky, t), info() }
     windows  [{ at: [x,y,z] the glass's centre, in: [nx,nz] the horizontal unit normal pointing into the room,
                 w, h  the glass's width and height, floor: y of the floor the beam lands on, reach: longest beam (m) }]
     o        { north: [x,z] unit vector of north in the scene (default [0,-1]; east is then +x),
                dust: motes per window (default 70), density: 1 (the pass mark), light: CastleLight.at() sun block }
   Cost: two draw calls for a whole room (one beam mesh, one dust Points), one 1x1 shader, no texture, no fog pass.
   The world rules hold: the sun's own light through glass, nothing glows as a sign, nothing marks a thing. */
(function () {
  'use strict';
  var RAD = Math.PI / 180;

  function travelOf(sun, north) {
    /* the direction the light travels (from the sun toward the ground): the opposite of the sun's compass bearing */
    var nx = north[0], nz = north[1], ex = -nz, ez = nx;          /* east is north turned a quarter clockwise seen from above */
    var b = sun.bearing * RAD, a = sun.altitude * RAD, c = Math.cos(a);
    return [-(Math.sin(b) * ex + Math.cos(b) * nx) * c, -Math.sin(a), -(Math.sin(b) * ez + Math.cos(b) * nz) * c];
  }

  function strength(sun, sky, light) {
    if (!sun || !sun.up || sun.altitude <= 0) return 0;
    if (light && typeof light.intensity === 'number') return light.on ? light.intensity / 0.75 : 0;   /* CastleLight's clear 0.75 is 1 */
    if (sky === 'clear') return 1;
    if (sky === 'cloudy') return 0.3;
    return 0;                                                  /* rain, snow, fog: no direct sun, no beam */
  }

  var VERT = 'attribute float aAlong; attribute float aEdge; varying float vAlong; varying float vEdge; varying vec3 vN; varying vec3 vV;' +
    'void main(){ vAlong=aAlong; vEdge=aEdge; vec4 wp=modelMatrix*vec4(position,1.0); vV=cameraPosition-wp.xyz; vN=normalize(mat3(modelMatrix)*normal);' +
    'gl_Position=projectionMatrix*viewMatrix*wp; }';
  var FRAG = 'uniform vec3 uColour; uniform float uAmount; varying float vAlong; varying float vEdge; varying vec3 vN; varying vec3 vV;' +
    'void main(){ float f=abs(dot(normalize(vN),normalize(vV)));' +
    'float pool=step(1.5,vAlong); float fade=mix(smoothstep(0.18,0.7,vAlong)*pow(1.0-vAlong,0.7), 0.55, pool);' +                /* soft at the glass, thinning to nothing at the floor */
    'float edge=mix(pow(smoothstep(0.1,0.85,f),1.6), 1.0, pool);' +                                           /* a shaft seen edge-on thins, as a volume does */
    'gl_FragColor=vec4(uColour, uAmount*fade*edge*(0.55+0.45*(1.0-vEdge))); }';
  var DVERT = 'uniform float uTime; uniform float uSize; attribute vec3 aSeed; attribute float aAlong; varying float vA;' +
    'void main(){ vec3 p=position; float t=uTime;' +
    'p+=vec3(sin(t*0.21+aSeed.x*6.28),sin(t*0.17+aSeed.y*6.28)*0.6+t*0.0,cos(t*0.19+aSeed.z*6.28))*0.14;' +   /* a slow drift, never a swarm */
    'p.y+=sin(t*0.09+aSeed.x*12.0)*0.12;' +
    'vec4 mv=viewMatrix*modelMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv;' +
    'gl_PointSize=uSize*(1.0/max(0.5,-mv.z)); vA=pow(1.0-aAlong,1.2)*(0.55+0.45*sin(t*0.7+aSeed.z*20.0)); }';
  var DFRAG = 'uniform vec3 uColour; uniform float uAmount; varying float vA;' +
    'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard;' +
    'gl_FragColor=vec4(uColour, uAmount*vA*smoothstep(0.5,0.1,d)); }';

  function shafts(THREE, windows, o) {
    o = o || {};
    var north = o.north || [0, -1], density = o.density == null ? 1 : o.density, NDUST = o.dust || 70;
    var group = new THREE.Group(); group.name = 'castle-weather-shafts';
    var bm = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: { uColour: { value: new THREE.Color(0xfff0cf) }, uAmount: { value: 0 } } });
    var dm = new THREE.ShaderMaterial({ vertexShader: DVERT, fragmentShader: DFRAG, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
      uniforms: { uColour: { value: new THREE.Color(0xfff0cf) }, uAmount: { value: 0 }, uTime: { value: 0 }, uSize: { value: 60 } } });
    var beam = new THREE.Mesh(new THREE.BufferGeometry(), bm), dust = new THREE.Points(new THREE.BufferGeometry(), dm);
    beam.frustumCulled = dust.frustumCulled = false; beam.renderOrder = 5; dust.renderOrder = 6;
    group.add(beam, dust);
    var seeds = [], last = null, lit = 0;

    /* a window's beam is the glass's rectangle swept along the travel direction down to its floor (or its reach) */
    function rebuild(sun) {
      var tr = travelOf(sun, north), pos = [], nor = [], along = [], edge = [], idx = [], dp = [], da = [], ds = [], count = 0, vi = 0;
      var s = seeds;
      windows.forEach(function (w, wi) {
        var inx = w.in[0], inz = w.in[1];
        if (tr[0] * inx + tr[2] * inz <= 0.05 || tr[1] >= -0.02) return;      /* the sun is behind this glass: no beam through it */
        var ux = -inz, uz = inx, hw = w.w / 2, hh = w.h / 2, f = w.floor == null ? w.at[1] - 3 : w.floor;
        var low = w.at[1] - hh, len = Math.min(w.reach || 12, (low - f) / -tr[1]);
        if (len <= 0.2) return;
        var cs = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]], P0 = [], P1 = [];
        cs.forEach(function (c) {
          var p = [w.at[0] + ux * c[0], w.at[1] + c[1], w.at[2] + uz * c[0]]; P0.push(p);
          P1.push([p[0] + tr[0] * len, p[1] + tr[1] * len, p[2] + tr[2] * len]);
        });
        for (var k = 0; k < 4; k++) {                                          /* four side faces; the end is the floor's own pool, not drawn */
          var k2 = (k + 1) % 4, a = P0[k], b = P0[k2], c2 = P1[k2], d = P1[k];
          var e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
          var n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], nl = Math.hypot(n[0], n[1], n[2]) || 1;
          [a, b, c2, d].forEach(function (p, q) { pos.push(p[0], p[1], p[2]); nor.push(n[0] / nl, n[1] / nl, n[2] / nl); along.push(q < 2 ? 0 : 1); edge.push(k % 2); });
          idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3); vi += 4;
        }
        var pl = P0.map(function (p) { var k2 = (p[1] - f) / -tr[1]; return [p[0] + tr[0] * k2, f + 0.03, p[2] + tr[2] * k2]; });
        if (pl.every(function (p) { return Math.hypot(p[0] - w.at[0], p[2] - w.at[2]) <= (w.reach || 12) * 1.4; })) {   /* the sun's patch on the floor */
          pl.forEach(function (p) { pos.push(p[0], p[1], p[2]); nor.push(0, 1, 0); along.push(2); edge.push(0); });
          idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3); vi += 4;
        }
        /* the motes: a fixed set of seeds per window, placed inside the swept volume */
        if (!s[wi]) { s[wi] = []; for (var m = 0; m < NDUST; m++) s[wi].push([Math.random(), Math.random(), Math.random()]); }
        s[wi].forEach(function (q) {
          var al = q[2], x = (q[0] - 0.5) * w.w, y = (q[1] - 0.5) * w.h;
          dp.push(w.at[0] + ux * x + tr[0] * len * al, w.at[1] + y + tr[1] * len * al, w.at[2] + uz * x + tr[2] * len * al);
          da.push(al); ds.push(q[0], q[1], q[2]);
        });
        count++;
      });
      lit = count;
      var g = beam.geometry; g.dispose();
      g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1)); g.setAttribute('aEdge', new THREE.Float32BufferAttribute(edge, 1));
      g.setIndex(idx); beam.geometry = g;
      var h = new THREE.BufferGeometry();
      h.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)); h.setAttribute('aAlong', new THREE.Float32BufferAttribute(da, 1));
      h.setAttribute('aSeed', new THREE.Float32BufferAttribute(ds, 3)); dust.geometry.dispose(); dust.geometry = h;
      last = { bearing: sun.bearing, altitude: sun.altitude };
    }

    function update(sun, sky, t) {
      var amt = strength(sun, sky, o.light);
      beam.visible = dust.visible = amt > 0;
      if (!beam.visible) { lit = 0; last = null; return; }
      if (!last || Math.abs(last.bearing - sun.bearing) >= 1 || Math.abs(last.altitude - sun.altitude) >= 1) rebuild(sun);
      var col = o.light && o.light.colour != null ? o.light.colour : 0xfff0cf;
      bm.uniforms.uColour.value.set(col); dm.uniforms.uColour.value.set(col);
      /* a beam's strength rises with the sun's height and falls with a thin sky; the pass mark is 0.16 at 1 */
      var low = Math.min(1, sun.altitude / 28);
      bm.uniforms.uAmount.value = 0.5 * amt * density * (0.35 + 0.65 * low);
      dm.uniforms.uAmount.value = 0.9 * amt * density; dm.uniforms.uTime.value = t || 0;
    }

    return { group: group, update: update, info: function () {
      return { visible: beam.visible, windowsLit: lit, beamTris: beam.geometry.index ? beam.geometry.index.count / 3 : 0,
               motes: dust.geometry.attributes.position ? dust.geometry.attributes.position.count : 0, drawCalls: beam.visible ? 2 : 0 };
    } };
  }

  /* the checks a page or a test runs on the numbers, not by eye: the beam's direction must equal the sun's travel */
  function selfTest() {
    var out = [], tr = travelOf({ bearing: 90, altitude: 30 }, [0, -1]);           /* sun due east, low: light travels west and down */
    out.push(['sun east: travel -x', tr[0] < -0.8 && Math.abs(tr[2]) < 0.01]);
    tr = travelOf({ bearing: 180, altitude: 45 }, [0, -1]); out.push(['sun south: travel -z (north)', tr[2] < -0.6 && Math.abs(tr[0]) < 0.01]);
    out.push(['sun down: no beam', strength({ up: false, altitude: -5 }, 'clear') === 0]);
    out.push(['rain: no beam', strength({ up: true, altitude: 40 }, 'rain') === 0]);
    out.push(['clear beats cloudy', strength({ up: true, altitude: 40 }, 'clear') > strength({ up: true, altitude: 40 }, 'cloudy')]);
    return out;
  }

  window.CastleWeather = { shafts: shafts, travelOf: travelOf, strength: strength, selfTest: selfTest };
}());
