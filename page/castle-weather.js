/* castle-weather.js: the castle's weather and light effects, one module (Weather lane, req 5318 audit, Godric's 1 on
   req 5324: sunbeams with dust through the high windows first).

   It reads the runtime's sun ({ up, altitude, bearing }, degrees, bearing from north, east 90, as castle-events.js
   gives it) and sky ('clear' | 'cloudy' | 'rain' | ...) and Design's CastleLight.at() for the sun's colour and
   strength; it keeps no clock. A room only NAMES its windows; it never draws or aims a beam itself.

   CastleWeather.shafts(THREE, windows, o)  ->  { group, update(sun, sky, t), info() }
     windows  [{ at: [x,y,z] the glass's centre, in: [nx,nz] the horizontal unit normal pointing into the room,
                 w, h  the glass's width and height, floor: y of the floor the beam lands on, reach: longest beam (m) }]
     o        { north: [x,z] unit vector of north in the scene (default [0,-1]; east is then +x),
                dust: motes per window (default 70), density: 1 (the pass mark), light: CastleLight.at() sun block,
                pool: false when the room draws its own patch of sun on the floor; a window may carry minAlt, the sun height below which it gives no beam }
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
        if (w.minAlt != null && sun.altitude < w.minAlt) return;              /* a roof or a wall shades this light below that sun height (the room names it) */
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
        if (o.pool !== false && pl.every(function (p) { return Math.hypot(p[0] - w.at[0], p[2] - w.at[2]) <= (w.reach || 12) * 1.4; })) {   /* the sun's patch on the floor */
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

  /* ---- weather on the windows: CastleWeather.panes(THREE, windows, o) -> { group, update(weather, t), info() }
     windows  the same list the shafts take ({ at, in, w, h }; floor and reach are ignored)
     weather  { sky: 'clear'|'cloudy'|'rain'|'snow'|'fog', ground: 'frozen' for frost, windy: bool } as CastleEvents.weatherAt gives it,
              or the sky word alone; o { density: 1 (pass mark), depth: metres of weather outside the glass (default 2.5), drops: per window }
     Three draw calls a room at most (the pane, the streaks, the flakes), never more than two at once: rain is pane + streaks,
     snow is pane + flakes, fog and frost are the pane alone, clear and cloudy draw nothing. Nothing glows as a sign. */
  function wkind(w) {
    var s = typeof w === 'string' ? w : (w && w.sky) || 'clear', ob = w && typeof w === 'object';
    return { sky: s, frost: !!(ob && (w.ground === 'frozen' || w.ground === 'frost' || w.frost || w.frozen)), windy: !!(ob && w.windy) };
  }
  var PVERT = 'attribute vec2 aSize; varying vec2 vUv; varying vec2 vSize;' +
    'void main(){ vUv=uv; vSize=aSize; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var PFRAG = 'uniform float uKind; uniform float uFrost; uniform float uTime; uniform float uAmount; uniform float uWind; varying vec2 vUv; varying vec2 vSize;' +
    'float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }' +
    'float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }' +
    'void main(){ vec2 m=vUv*vSize; vec3 col=vec3(0.82,0.86,0.9); float a=0.0;' +
    'if(uKind>0.5&&uKind<1.5){' +                                                                    /* rain: beads and runs */
      'vec2 p=m*vec2(7.0,5.0); vec2 g=floor(p), f=fract(p)-0.5; float hh=h21(g), h2=h21(g+7.1);' +
      'vec2 off=(vec2(hh,h2)-0.5)*0.5; float r=0.07+0.13*h2; float d=length((f-off)*vec2(1.0,0.85));' +
      'float bead=smoothstep(r,r*0.55,d)*step(0.35,hh);' +
      'float rim=smoothstep(r,r*0.8,d)-smoothstep(r*0.8,r*0.5,d);' +
      'float cx=floor(m.x*13.0), hc=h21(vec2(cx,3.0)); float lx=abs(fract(m.x*13.0)-0.5);' +
      'float yy=fract(m.y*0.45+uTime*(0.04+0.08*hc)+hc+m.x*uWind*0.15); float trail=smoothstep(0.0,0.5,yy)*(1.0-smoothstep(0.5,0.56,yy));' +
      'float run=step(0.55,hc)*smoothstep(0.09,0.02,lx)*trail*0.5;' +
      'a=(0.05+bead*0.46+rim*0.34+run)*uAmount; col=mix(vec3(0.55,0.62,0.7),vec3(0.93,0.96,0.98),bead);' +
    '} else if(uKind>1.5&&uKind<2.5){ a=0.07*uAmount; col=vec3(0.88,0.92,0.96);' +                   /* snow: a cold, pale pane */
    '} else if(uKind>2.5){ float n=vn(m*2.2+uTime*0.02)*0.5+vn(m*5.0)*0.3; a=(0.5+0.3*n)*min(1.0,uAmount); col=vec3(0.86,0.88,0.89); }' +   /* fog: the view blanked pale */
    'if(uFrost>0.0){ float e=min(min(vUv.x*vSize.x,(1.0-vUv.x)*vSize.x),min(vUv.y*vSize.y,(1.0-vUv.y)*vSize.y));' +
      'float n=vn(m*9.0)*0.6+vn(m*22.0)*0.4; float fr=smoothstep(0.34+0.12*n,0.0,e-0.1*n)*uFrost;' +
      'col=mix(col,vec3(0.94,0.97,1.0),fr); a=max(a,fr*(0.55+0.3*n)); }' +
    'gl_FragColor=vec4(col,a); }';
  var SVERT = 'uniform float uTime; uniform float uWind; uniform float uSpeed; uniform float uLen; attribute vec2 aRange; attribute vec3 aSeed; attribute vec2 aLean; attribute float aEnd; varying float vA;' +
    'void main(){ vec3 p=position; float hv=aRange.y; float y=aRange.x+mod(p.y-aRange.x-uTime*uSpeed*(0.8+0.4*aSeed.z),hv);' +
    'float k=uWind*0.35; p.y=y; p.x+=aLean.x*k*(y-aRange.x); p.z+=aLean.y*k*(y-aRange.x);' +
    'p+=vec3(aLean.x*k,0.0,aLean.y*k)*(-uLen*aEnd*2.0); p.y+=uLen*aEnd;' +
    'vA=(1.0-aEnd*0.9)*smoothstep(0.0,0.4,y-aRange.x)*smoothstep(0.0,0.4,aRange.x+hv-y);' +
    'gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(p,1.0); }';
  var SFRAG = 'uniform float uAmount; varying float vA; void main(){ gl_FragColor=vec4(0.8,0.85,0.9,0.85*uAmount*vA); }';
  var FVERT = 'uniform float uTime; uniform float uWind; uniform float uSize; attribute vec2 aRange; attribute vec3 aSeed; attribute vec2 aLean; varying float vA;' +
    'void main(){ vec3 p=position; float hv=aRange.y; float y=aRange.x+mod(p.y-aRange.x-uTime*(0.45+0.35*aSeed.z),hv);' +
    'p.y=y; float sw=sin(uTime*0.9+aSeed.x*30.0)*0.12+uWind*(y-aRange.x)*0.25; p.x+=aLean.x*sw; p.z+=aLean.y*sw;' +
    'vec4 mv=viewMatrix*modelMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=uSize*(0.6+0.8*aSeed.y)/max(0.5,-mv.z);' +
    'vA=smoothstep(0.0,0.4,y-aRange.x)*smoothstep(0.0,0.4,aRange.x+hv-y); }';
  var FFRAG = 'uniform float uAmount; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(0.97,0.98,1.0,uAmount*vA*smoothstep(0.5,0.15,d)); }';

  function panes(THREE, windows, o) {
    o = o || {};
    var density = o.density == null ? 1 : o.density, depth = o.depth || 2.5, N = o.drops || 40;
    var group = new THREE.Group(); group.name = 'castle-weather-panes';
    var pp = [], pu = [], ps = [], pi = [], v = 0;
    var sp = [], sr = [], sd = [], sl = [], se = [], fp = [], fr = [], fd = [], fl = [];
    windows.forEach(function (w) {
      var ux = -w.in[1], uz = w.in[0], hw = w.w / 2, hh = w.h / 2, o2 = 0.03;       /* the pane stands 3 cm inside the glass */
      [[-hw, -hh, 0, 0], [hw, -hh, 1, 0], [hw, hh, 1, 1], [-hw, hh, 0, 1]].forEach(function (c) {
        pp.push(w.at[0] + ux * c[0] + w.in[0] * o2, w.at[1] + c[1], w.at[2] + uz * c[0] + w.in[1] * o2); pu.push(c[2], c[3]); ps.push(w.w, w.h);
      });
      pi.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4;
      var y0 = w.at[1] - hh - 0.3, hv = w.h + 0.9;
      for (var i = 0; i < N; i++) {                                                  /* the weather outside: a slab of drops and flakes */
        var q = [Math.random(), Math.random(), Math.random()], x = (q[0] - 0.5) * (w.w + 0.8), dz = 0.15 + q[2] * depth;
        var bx = w.at[0] + ux * x - w.in[0] * dz, bz = w.at[2] + uz * x - w.in[1] * dz, by = y0 + q[1] * hv;
        for (var e = 0; e < 2; e++) { sp.push(bx, by, bz); sr.push(y0, hv); sd.push(q[0], q[1], q[2]); sl.push(ux, uz); se.push(e); }
      }
      for (var j = 0; j < N * 2; j++) {
        var r2 = [Math.random(), Math.random(), Math.random()], fx = (r2[0] - 0.5) * (w.w + 0.8), fz = 0.1 + r2[2] * depth;
        fp.push(w.at[0] + ux * fx - w.in[0] * fz, y0 + r2[1] * hv, w.at[2] + uz * fx - w.in[1] * fz); fr.push(y0, hv); fd.push(r2[0], r2[1], r2[2]); fl.push(ux, uz);
      }
    });
    function geo(attrs, idx) {
      var g = new THREE.BufferGeometry();
      attrs.forEach(function (a) { g.setAttribute(a[0], new THREE.Float32BufferAttribute(a[1], a[2])); });
      if (idx) g.setIndex(idx); return g;
    }
    var pm = new THREE.ShaderMaterial({ vertexShader: PVERT, fragmentShader: PFRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      uniforms: { uKind: { value: 0 }, uFrost: { value: 0 }, uTime: { value: 0 }, uAmount: { value: 1 }, uWind: { value: 0 } } });
    var sm = new THREE.ShaderMaterial({ vertexShader: SVERT, fragmentShader: SFRAG, transparent: true, depthWrite: false, fog: false,
      uniforms: { uTime: { value: 0 }, uWind: { value: 0 }, uSpeed: { value: 9 }, uLen: { value: 0.35 }, uAmount: { value: 1 } } });
    var fm = new THREE.ShaderMaterial({ vertexShader: FVERT, fragmentShader: FFRAG, transparent: true, depthWrite: false, fog: false,
      uniforms: { uTime: { value: 0 }, uWind: { value: 0 }, uSize: { value: 90 }, uAmount: { value: 1 } } });
    var pane = new THREE.Mesh(geo([['position', pp, 3], ['uv', pu, 2], ['aSize', ps, 2]], pi), pm);
    var streaks = new THREE.LineSegments(geo([['position', sp, 3], ['aRange', sr, 2], ['aSeed', sd, 3], ['aLean', sl, 2], ['aEnd', se, 1]]), sm);
    var flakes = new THREE.Points(geo([['position', fp, 3], ['aRange', fr, 2], ['aSeed', fd, 3], ['aLean', fl, 2]]), fm);
    [pane, streaks, flakes].forEach(function (m, i) { m.frustumCulled = false; m.renderOrder = 7 + i; m.visible = false; group.add(m); });
    var calls = 0;
    function update(weather, t) {
      var k = wkind(weather), kind = k.sky === 'rain' ? 1 : k.sky === 'snow' ? 2 : k.sky === 'fog' ? 3 : 0;
      pane.visible = kind > 0 || k.frost; streaks.visible = kind === 1; flakes.visible = kind === 2;
      calls = (pane.visible ? 1 : 0) + (streaks.visible ? 1 : 0) + (flakes.visible ? 1 : 0);
      var wind = k.windy ? 1 : 0.15;
      pm.uniforms.uKind.value = kind; pm.uniforms.uFrost.value = k.frost ? 1 : 0; pm.uniforms.uTime.value = t || 0;
      pm.uniforms.uAmount.value = density; pm.uniforms.uWind.value = wind;
      sm.uniforms.uTime.value = fm.uniforms.uTime.value = t || 0; sm.uniforms.uWind.value = fm.uniforms.uWind.value = wind;
      sm.uniforms.uAmount.value = fm.uniforms.uAmount.value = Math.min(1.6, density);
    }
    return { group: group, update: update, info: function () {
      return { pane: pane.visible, streaks: streaks.visible, flakes: flakes.visible, drawCalls: calls, windows: windows.length };
    } };
  }

  function paneTest() {
    var out = [];
    out.push(['rain is rain', wkind('rain').sky === 'rain']);
    out.push(['frost reads from ground', wkind({ sky: 'clear', ground: 'frozen' }).frost === true]);
    out.push(['clear has no frost', wkind({ sky: 'clear', ground: 'thawed' }).frost === false]);
    return out;
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

  window.CastleWeather = { shafts: shafts, panes: panes, paneTest: paneTest, travelOf: travelOf, strength: strength, selfTest: selfTest };
}());
