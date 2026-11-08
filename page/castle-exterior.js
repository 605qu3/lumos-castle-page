/* castle-exterior.js: the Exterior lane, 7 November 2026, req 3179. The castle seen whole from outside, a greybox stack.
   It reads the model only (the page's own book-filtered copy, caught as shell.html hands it to CastleShell.build) and
   docs/grounds/site-plan.json (embedded below); it edits nothing of castle-shell.js, castle-model.js or the walls.
   It does nothing unless the address carries exterior=1. Then it builds:
   - every floor: the model's rooms bucketed by floor height, each bucket one CastleShell.build(..., {floor: 'all'})
     from its largest room that builds, set into the main shell's frame and baked into one mesh per material
     (the main place's own floor skipped when the page itself already has floor=all);
   - every stair that is a place of its own (a shaft), baked the same way, all in one group;
   - the massing in plain grey: the ranges' roofs (hip, gable, crow as gable, flat with its parapet), the towers'
     cones, tops and parapet rings, the lantern, the cap house and the turret; the ground: the land round the lake,
     the plateau the castle stands on with its rock face to the lake, each grounds row a prism to its level, and the
     lake's surface.
   It leaves out: rooms with their own page (castle-shell.js skips them), the outer walls of the towers and ranges
   beyond what the rooms' own walls give, windows' glass and far views, lines and sprites (discarded in the bake),
   instanced meshes, paint, the grounds' real terrain (the Grounds lane's), and every thing in the rooms.
   The towers' drums (v2, 7 November 2026) are massing filler, not built walls: a plain open cylinder in a pale tone
   (0xb9b2a6) over the gaps the build leaves (v3): from the tower's base level to its eaves, every void over 0.3 m
   between the [floor, ceiling] spans of the built places whose plan centre lies in the drum; lumosExterior.drums lists
   each tower's voids, and any built place standing above the eaves (a finding; nothing is filled above the eaves).
   window.lumosExterior reports what was built and how long it took. */
(function () {
  if (!/(^|[?&])exterior=1(&|$)/.test(location.search)) return;
  if (!window.CastleShell || !window.THREE) return;

  /* docs/grounds/site-plan.json's rows with a numeric level_m, read 7 November 2026: coordinates to 0.1 m, the lake's
     814-point shore decimated to every 4th point */
  var SITE = [{"id":"lake","level":-46,"poly":[[-20,-8],[-5,-9.2],[17.6,-8.9],[29.8,-11],[57.5,-7.4],[72.6,-7.6],[94.9,-7.9],[112.4,-6.6],[130,-6.5],[147.6,-8.1],[162.5,-7.3],[184.6,-7.7],[191.4,-11.3],[199.8,-8.3],[201.4,-11.7],[204,-16.9],[207.9,-24.8],[218.9,-25.7],[232.4,-26.7],[249.7,-36.1],[263.7,-32],[267.1,-14.6],[271,6.9],[272.7,22.3],[274.2,42.5],[283.4,60.5],[287.6,78.3],[308.8,78.5],[312,68],[316,52.4],[320.9,35.9],[319.1,18.6],[318.9,1.6],[326.2,-9.9],[331.6,-17.8],[340.6,-30.8],[346,-46],[359.7,-53.1],[384.4,-61.1],[395.1,-68.1],[410.3,-74.8],[425,-85],[436,-98.7],[438.3,-111],[436.1,-125.9],[436.5,-138.2],[441,-151.9],[444.7,-156.3],[450.6,-165.2],[449.3,-176.1],[455.5,-186.1],[456.8,-201.2],[456.3,-217.9],[461.7,-234.9],[463.5,-251.4],[464.3,-259.8],[463.9,-270.2],[462.6,-276.3],[462.9,-288.5],[470.4,-301.9],[469.3,-315.7],[466.7,-322.6],[471.5,-328.4],[474.7,-337.2],[480.3,-356.5],[480.9,-362.3],[489.7,-387.1],[490.1,-400.5],[499.9,-449],[488.9,-484.2],[483.6,-490.9],[484.9,-501.7],[480,-510],[476.1,-518.3],[475.3,-533.6],[466.4,-547.1],[465,-555],[462.9,-562.6],[459.1,-572.1],[456.8,-577.7],[452.1,-592.4],[443.7,-601.8],[435.9,-604.3],[427.3,-608.2],[418.9,-609.9],[410.2,-609.3],[397.7,-615.5],[383.3,-620],[371.4,-622.4],[364,-625.5],[350,-630],[327.6,-625],[321.3,-629.7],[316.7,-640],[302.5,-644.7],[290.6,-643.4],[283.3,-650],[276.2,-652.3],[269.3,-653.6],[261.9,-649.1],[254.3,-654.3],[246.5,-656.2],[232.2,-658],[215.9,-660.8],[207.7,-661.8],[204.8,-665.2],[198.8,-668],[188.3,-670.5],[179.7,-659.8],[167.6,-653.9],[159,-656.6],[147.2,-658.2],[139.8,-655.4],[127.1,-664.3],[120.3,-663.5],[118.3,-656.1],[111.4,-654.3],[104.3,-655],[95.9,-650.1],[85.9,-649.5],[79.7,-650.6],[71.4,-652.9],[65,-662.7],[59.1,-659.4],[47.7,-656.4],[36.2,-653],[25.1,-644.8],[17.5,-644.8],[2.5,-648.8],[-7.4,-649.8],[-15,-647.5],[-23.1,-647.1],[-37.3,-638.5],[-46.5,-631.2],[-53.5,-628.4],[-63.7,-628.4],[-68,-630.9],[-77.9,-625.5],[-89.5,-621.9],[-107.1,-625],[-119.2,-622.2],[-130.8,-617.4],[-141.4,-616.6],[-151.9,-620.2],[-161.7,-614.7],[-165.1,-610.5],[-172.8,-603.2],[-178,-599.9],[-184.1,-595.7],[-193.1,-597.6],[-204.4,-592.1],[-215.8,-576],[-220.9,-561.1],[-227.8,-549],[-240.6,-532.1],[-247.6,-515.8],[-256.3,-506.6],[-271,-481.7],[-281.9,-455],[-291.7,-442],[-292.1,-423.6],[-295.5,-392.4],[-297.8,-373.7],[-297,-358.4],[-301.1,-331.9],[-303.4,-311],[-302.8,-291.4],[-304.2,-277.5],[-306.6,-259.3],[-310.2,-228.3],[-303.7,-202],[-298.9,-183.8],[-290.6,-164.9],[-292,-146.1],[-290.2,-126.2],[-284,-103.8],[-278.7,-84],[-277.4,-66.3],[-269.3,-48.5],[-270.2,-30.2],[-263.1,-9.4],[-255,8.8],[-250.5,26.7],[-235.5,47.6],[-214.6,67.5],[-200.1,84.8],[-175.4,88.8],[-147.2,91.7],[-130,95],[-117.6,88.6],[-111.1,81.6],[-96.7,71.5],[-85.2,62.2],[-79.5,54.8],[-76.4,45.5],[-69.3,43.2],[-62.5,40],[-58.6,31.5],[-54.7,25.2],[-49.1,19.4],[-40.8,16],[-41.7,10.3],[-28.7,2.8],[-24.5,-5.9]]},{"id":"forbidden-forest","level":0,"poly":[[300,440],[330,330],[362,240],[400,160],[425,100],[432,40],[425,-20],[440,-90],[470,-160],[490,-300],[640,-300],[640,440]]},{"id":"hagrids-cabin","level":-6,"point":[396.7,64.5]},{"id":"creatures-paddock","level":-4,"poly":[[320.5,353.3],[310,391.9],[281.1,384],[291.6,345.4]]},{"id":"beech","level":-44,"point":[297.8,89]},{"id":"whomping-willow","level":-8,"point":[255,110]},{"id":"greenhouses","level":-3,"rects":[[200,24,251.2,46],[200,49,236,55],[200,58,236,64],[200,67,236,73]]},{"id":"apiary","level":-2,"rect":[168,3,236,21.6]},{"id":"vegetable-patch","level":-2,"rect":[166,22,194,62]},{"id":"quidditch-pitch","level":-14,"ellipse":[-120,230,27.5,76]},{"id":"flying-lawn","level":-8,"rect":[-80,105,-20,145]},{"id":"gates","level":-20,"point":[80,330]},{"id":"drive","level":-10,"line":[[80,72],[86,140],[72,230],[80,330]]},{"id":"road-to-hogsmeade","level":-20,"line":[[80,330],[78,350],[0,362],[-150,382],[-320,404]]},{"id":"beauxbatons-carriage","level":-6,"point":[240,160]},{"id":"durmstrang-ship","level":-46,"point":[-170,52]},{"id":"white-tomb","level":-43,"point":[250,-30]},{"id":"station","level":-34,"point":[545,-445]},{"id":"harbour","level":-46,"point":[86,-6]}];

  var orig = CastleShell.build, page = null;
  CastleShell.build = function (F, M, placeId, o) {
    var out = orig.apply(this, arguments);
    if (!page) page = { M: M, placeId: placeId, o: o || {}, out: out };
    return out;
  };

  var X = window.lumosExterior = { done: false, ms: 0, floors: [], shafts: { tried: 0, built: 0, ms: 0 }, massing: null, skipped: [],
    drums: [], calls: function () { var g = window.lumosGreybox; return g && g.renderer ? g.renderer.info.render.calls : null; } };

  /* the factory: a fresh Lambert per call (castle-shell.js sets .side on some after making them), binned at the bake by
     their colour, side, transparency and emissive */
  var stubF = {
    solid: function (hex, opts) { var m = new THREE.MeshLambertMaterial(Object.assign({ color: hex }, opts || {})); return m; },
    register: function (mesh, layer) { mesh.userData.layer = layer; return mesh; },
    foot: { off: false }, renderer: null
  };
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  /* the bake: every visible plain mesh into one non-indexed geometry per material key, in the scene's frame */
  var keyMats = {};
  function matKey(m) {
    return [m.color ? m.color.getHexString() : '-', m.side, m.transparent ? 1 : 0, (m.opacity != null ? m.opacity : 1).toFixed(2),
      m.emissive ? m.emissive.getHexString() : '-'].join('|');
  }
  function keyMat(m, k) {
    if (!keyMats[k]) keyMats[k] = new THREE.MeshLambertMaterial({ color: m.color ? m.color.clone() : 0x888888, side: m.side,
      transparent: !!m.transparent, opacity: m.opacity != null ? m.opacity : 1, emissive: m.emissive ? m.emissive.clone() : 0x000000,
      depthWrite: m.transparent ? false : true });
    return keyMats[k];
  }
  function shown(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }
  function bake(groups, name) {
    var bins = {}, nm = 0, skip = 0, v = new THREE.Vector3(), nmx = new THREE.Matrix3();
    groups.forEach(function (g) {
      g.updateMatrixWorld(true);
      g.traverse(function (o) {
        if (!o.isMesh) return;
        if (o.isInstancedMesh || Array.isArray(o.material) || !o.geometry || !o.geometry.attributes.position || !shown(o)) { skip++; return; }
        var geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
        if (!geo.attributes.normal) { if (geo === o.geometry) geo = geo.clone(); geo.computeVertexNormals(); }
        var k = matKey(o.material), b = bins[k] || (bins[k] = { mat: keyMat(o.material, k), p: [], n: [] });
        var P = geo.attributes.position, N = geo.attributes.normal, mw = o.matrixWorld;
        nmx.getNormalMatrix(mw);
        for (var i = 0; i < P.count; i++) {
          v.fromBufferAttribute(P, i).applyMatrix4(mw); b.p.push(v.x, v.y, v.z);
          v.fromBufferAttribute(N, i).applyMatrix3(nmx).normalize(); b.n.push(v.x, v.y, v.z);
        }
        if (geo !== o.geometry) geo.dispose();
        nm++;
      });
      g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    });
    var G = new THREE.Group(); G.name = name;
    Object.keys(bins).forEach(function (k) {
      var b = bins[k], bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
      bg.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
      bg.computeBoundingSphere();
      var m = new THREE.Mesh(bg, b.mat); m.name = name + '-' + k; G.add(m);
    });
    return { group: G, meshes: nm, skipped: skip, bins: Object.keys(bins).length };
  }

  /* a room's floor height, findPlace's rule */
  function roomFloor(M, r) {
    function lz(id) { for (var i = 0; i < M.levels.length; i++) if (M.levels[i].id === id) return M.levels[i].z; return 0; }
    var gp = r.group ? ((M.groups || []).filter(function (g) { return g.id === r.group; })[0] || {}).place : null;
    var base = (r.z != null && !r.group) ? r.z : lz(r.level) + (gp ? gp.z - lz(r.level) : 0);
    return base + (r.floor || 0);
  }
  function roomArea(r) {
    var s = r.shape || {};
    if (s.rect) return Math.abs((s.rect[2] - s.rect[0]) * (s.rect[3] - s.rect[1]));
    if (s.circle) return Math.PI * (s.r || 1) * (s.r || 1);
    if (s.poly) { var a = 0; s.poly.forEach(function (p, i) { var q = s.poly[(i + 1) % s.poly.length]; a += p[0] * q[1] - q[0] * p[1]; }); return Math.abs(a / 2); }
    return 0;
  }

  /* the massing: triangles per material, every vertex through the main toLocal */
  var builtPlaces = [];
  function keepPlaces(out) { (out.places || []).forEach(function (q) { builtPlaces.push(q); }); }
  var GREYS = { filler: 0xb9b2a6, roof: 0x5f6670, parapet: 0x8a857e, ground: 0x7d8a5c, rock: 0x8b8478, water: 0x6f8797 };
  function massing(TL) {
    var T = {}; Object.keys(GREYS).forEach(function (k) { T[k] = []; });
    function tri(k, a, b, c) { [a, b, c].forEach(function (p) { var v = TL(p[0], p[1], p[2]); T[k].push(v.x, v.y, v.z); }); }
    function quad(k, a, b, c, d) { tri(k, a, b, c); tri(k, a, c, d); }
    function wallRing(k, pts, z0, z1) {   /* vertical faces round a plan */
      pts.forEach(function (p, i) { var q = pts[(i + 1) % pts.length]; quad(k, [p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]); });
    }
    function cap(k, contour, holes, z) {
      var c = contour.map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      if (!THREE.ShapeUtils.isClockWise(c)) c.reverse();
      var hs = (holes || []).map(function (h) { var hv = h.map(function (p) { return new THREE.Vector2(p[0], p[1]); }); if (THREE.ShapeUtils.isClockWise(hv)) hv.reverse(); return hv; });
      var all = c.concat.apply(c, hs), fs = THREE.ShapeUtils.triangulateShape(c, hs);
      fs.forEach(function (f) { tri(k, [all[f[0]].x, all[f[0]].y, z], [all[f[1]].x, all[f[1]].y, z], [all[f[2]].x, all[f[2]].y, z]); });
    }
    function rectPts(r) { return [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]; }
    function box(k, r, z0, z1) { cap(k, rectPts(r), null, z1); cap(k, rectPts(r), null, z0); wallRing(k, rectPts(r), z0, z1); }
    function parapetRect(r, z0, z1, t) {
      t = t || 0.4;
      box('parapet', [r[0], r[1], r[2], r[1] + t], z0, z1); box('parapet', [r[0], r[3] - t, r[2], r[3]], z0, z1);
      box('parapet', [r[0], r[1] + t, r[0] + t, r[3] - t], z0, z1); box('parapet', [r[2] - t, r[1] + t, r[2], r[3] - t], z0, z1);
    }
    function hip(r, e, h) {
      var x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3], w = x1 - x0, d = y1 - y0;
      if (w >= d) { var ym = (y0 + y1) / 2, a = [x0 + d / 2, ym, h], b = [x1 - d / 2, ym, h];
        quad('roof', [x0, y0, e], [x1, y0, e], b, a); quad('roof', [x1, y1, e], [x0, y1, e], a, b);
        tri('roof', [x0, y1, e], [x0, y0, e], a); tri('roof', [x1, y0, e], [x1, y1, e], b);
      } else { var xm = (x0 + x1) / 2, c = [xm, y0 + w / 2, h], f = [xm, y1 - w / 2, h];
        quad('roof', [x0, y1, e], [x0, y0, e], c, f); quad('roof', [x1, y0, e], [x1, y1, e], f, c);
        tri('roof', [x0, y0, e], [x1, y0, e], c); tri('roof', [x1, y1, e], [x0, y1, e], f); }
    }
    function gable(r, e, h) {
      var x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3];
      if (x1 - x0 >= y1 - y0) { var ym = (y0 + y1) / 2;
        quad('roof', [x0, y0, e], [x1, y0, e], [x1, ym, h], [x0, ym, h]); quad('roof', [x1, y1, e], [x0, y1, e], [x0, ym, h], [x1, ym, h]);
        tri('parapet', [x0, y0, e], [x0, y1, e], [x0, ym, h]); tri('parapet', [x1, y0, e], [x1, y1, e], [x1, ym, h]);
      } else { var xm = (x0 + x1) / 2;
        quad('roof', [x0, y1, e], [x0, y0, e], [xm, y0, h], [xm, y1, h]); quad('roof', [x1, y0, e], [x1, y1, e], [xm, y1, h], [xm, y0, h]);
        tri('parapet', [x0, y0, e], [x1, y0, e], [xm, y0, h]); tri('parapet', [x0, y1, e], [x1, y1, e], [xm, y1, h]); }
    }
    function flat(r, z, par) { box('roof', r, z - 0.3, z); if (par != null && par > z) parapetRect(r, z, par); }
    function circ(c, r, n) { var o = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return o; }
    function cone(c, r, z0, z1, n) { n = n || 32; var p = circ(c, r, n); p.forEach(function (a, i) { var b = p[(i + 1) % n]; tri('roof', [a[0], a[1], z0], [b[0], b[1], z0], [c[0], c[1], z1]); }); }
    function drum(k, c, r, z0, z1, n) { wallRing(k, circ(c, r, n || 32), z0, z1); }
    function ring(c, ri, ro, z0, z1) {
      var n = 32, A = circ(c, ro, n), B = circ(c, ri, n); wallRing('parapet', A, z0, z1); wallRing('parapet', B, z0, z1);
      A.forEach(function (a, i) { var j = (i + 1) % n; quad('parapet', [a[0], a[1], z1], [A[j][0], A[j][1], z1], [B[j][0], B[j][1], z1], [B[i][0], B[i][1], z1]); });
    }
    function roofPart(p, massPar) {
      var e = p.eaves, h = p.ridge != null ? p.ridge : e;
      if (p.kind === 'hip') hip(p.rect, e, h);
      else if (p.kind === 'gable' || p.kind === 'crow') gable(p.rect, e, h);
      else if (p.kind === 'flat') flat(p.rect, e, p.parapet != null ? p.parapet : massPar);
      else X.skipped.push('roof kind ' + p.kind + ' ' + (p.id || ''));
    }
    var M = page.M;
    (M.masses || []).forEach(function (m) {
      var R = m.roof;
      if (!R) { X.skipped.push('mass ' + m.id + ': no roof'); return; }
      var parts = R.parts && R.parts.length ? R.parts : (R.kind ? [R] : []);
      if (!parts.length && m.parapet != null) {   /* the south range's west half: a flat at its top storey's ceiling (7: 36.4 + 5.2) */
        flat(m.rect, 41.6, m.parapet); return;
      }
      parts.forEach(function (p) { roofPart(p, R.parapet); });
      if (R.flat) flat(R.flat.rect, R.flat.z, R.flat.lead);
    });
    function centre(q) {
      if (q.poly && q.poly.length) { var x = 0, y = 0; q.poly.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / q.poly.length, y / q.poly.length]; }
      if (q.round && q.round.c) return q.round.c;
      return null;
    }
    function lvl(id) { for (var i = 0; i < M.levels.length; i++) if (M.levels[i].id === id) return M.levels[i].z; return 0; }
    (M.towers || []).forEach(function (t) {
      var c = t.c, r = t.r, base = lvl(String(t.floors || 'G').split('-')[0]), iv = [], above = [], seen = {};
      builtPlaces.forEach(function (q) {
        var k = centre(q); if (!k || seen[q.id] || Math.hypot(k[0] - c[0], k[1] - c[1]) > r) return;
        seen[q.id] = 1;
        var top = q.ceiling != null ? q.ceiling : q.floor + 3;
        if (top > t.eaves + 0.01) above.push([q.id, +top.toFixed(2)]);
        var a = Math.max(base, q.floor), b = Math.min(t.eaves, top); if (b > a) iv.push([a, b]);
      });
      iv.sort(function (p, q) { return p[0] - q[0]; });
      var voids = [], at = base;
      iv.forEach(function (p) { if (p[0] > at) voids.push([at, p[0]]); at = Math.max(at, p[1]); });
      if (t.eaves > at) voids.push([at, t.eaves]);
      var mv = [];   /* voids under 0.3 m apart made one, then voids of 0.3 m or less dropped */
      voids.forEach(function (v) { var l = mv[mv.length - 1]; if (l && v[0] - l[1] < 0.3) l[1] = v[1]; else mv.push(v.slice()); });
      mv = mv.filter(function (v) { return v[1] - v[0] > 0.3; });
      var total = 0;
      mv.forEach(function (v) { drum('filler', c, r, v[0], v[1], 24); total += v[1] - v[0]; });
      var dr = { tower: t.id, voids: mv.map(function (v) { return [+v[0].toFixed(2), +v[1].toFixed(2)]; }), total: +total.toFixed(2) };
      if (above.length) dr.above_eaves = above;
      X.drums.push(dr);
      if (t.ridge != null) cone(c, r + 0.3, t.eaves, t.ridge, 40);
      if (t.top != null) { cap('roof', circ(c, r, 40), null, t.eaves); ring(c, r - 0.5, r, t.eaves, t.top); }
      if (t.lantern) { var L = t.lantern; drum('parapet', L.c, L.r, L.z, L.top, 32); if (L.ridge != null) cone(L.c, L.r + 0.2, L.top, L.ridge, 32); }
      if (t.cap_house) { var C = t.cap_house, z0 = t.top != null ? t.top : t.eaves;   /* its rect read as site metres (the tower stands at 0,0) */
        wallRing('parapet', rectPts(C.rect), z0, C.eaves); hip(C.rect, C.eaves, C.ridge); }
      if (t.turret) { var U = t.turret, ut = (t.top != null ? t.top : t.eaves) + 1; drum('parapet', U.c, U.r, t.eaves, ut, 24); if (U.cap != null) cone(U.c, U.r + 0.2, ut, U.cap, 24); }
    });
    /* the ground */
    var lake = SITE.filter(function (s) { return s.id === 'lake'; })[0], LO = -46;
    var sq = [[80 - 800, -800], [80 + 800, -800], [80 + 800, 800], [80 - 800, 800]];
    cap('ground', sq, lake ? [lake.poly] : null, -20); wallRing('rock', sq, LO, -20);
    if (lake) { wallRing('rock', lake.poly, LO, -20); cap('water', lake.poly, null, LO); }
    var pl = [-30, -6, 190, 110]; cap('ground', rectPts(pl), null, 0); wallRing('rock', rectPts(pl), LO, 0);
    SITE.forEach(function (s) {
      if (s.id === 'lake' || s.level <= LO + 0.05) return;
      var polys = [];
      if (s.poly) polys.push(s.poly);
      else if (s.point) polys.push(circ(s.point, 3, 16));
      else if (s.rect) polys.push(rectPts(s.rect));
      else if (s.rects) s.rects.forEach(function (r) { polys.push(rectPts(r)); });
      else if (s.ellipse) { var e = s.ellipse, ep = []; for (var i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2; ep.push([e[0] + e[2] * Math.cos(a), e[1] + e[3] * Math.sin(a)]); } polys.push(ep); }
      else if (s.line) s.line.forEach(function (p, i) {
        var q = s.line[i + 1]; if (!q) return;
        var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * 4, ny = dx / L * 4;
        polys.push([[p[0] + nx, p[1] + ny], [p[0] - nx, p[1] - ny], [q[0] - nx, q[1] - ny], [q[0] + nx, q[1] + ny]]);
      });
      else { X.skipped.push('site row ' + s.id + ': no shape'); return; }
      polys.forEach(function (pp) { cap('ground', pp, null, s.level); wallRing('rock', pp, LO, s.level); });
    });
    var G = new THREE.Group(); G.name = 'exterior-massing'; var tris = 0;
    Object.keys(T).forEach(function (k) {
      if (!T[k].length) return;
      var bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(T[k], 3));
      bg.computeVertexNormals(); bg.computeBoundingSphere(); tris += T[k].length / 9;
      G.add(new THREE.Mesh(bg, new THREE.MeshLambertMaterial({ color: GREYS[k], side: THREE.DoubleSide })));
    });
    return { group: G, tris: tris };
  }

  /* The slab band (req 3215 from 3191, 7 November 2026): a room's walls stop at its ceiling, 0.7 m under the next floor, and
     nothing faces the band outside, so the outer faces show a black slit. For every built place with a plan, each outer
     stretch (no other place beside it over the wall's height, tested at 1 m steps 0.1 m out) gets a plain wall piece from
     the wall's top up to the lowest floor above that covers the stretch (a point 0.1 m inside, 0.1 m outside or mid-wall);
     none above means roof, so no band. Same line and thickness as the wall below. Round places are not banded (the tower
     drums have their filler). ?bands=1 puts it in (off by default while it is refitted).
     v5 (7 Nov 11.15 pm): the open gap had shown the rooms' lit floors and wall tops as pale storey lines; the band hid
     them and the faces read flat, so each band carries a string course at its foot, 0.15 m proud, 0.35 m tall, 1.3 times
     the wall's tone (bandcourse=, bandcourseh=, bandtint= to try others; bandcourse=0 none). banddebug=1 draws band
     and course in flat red; bandrecess= sets the band's set-back behind the wall below (0.01). */
  var bandsOn = /(^|[?&])bands=1(&|$)/.test(location.search);   /* off by default from 7 Nov 10.15 pm: req 3215 failed the blind look */
  var bandRecess = (function () { var m = location.search.match(/[?&]bandrecess=([0-9.]+)/); return m ? +m[1] : 0.01; })();   /* req 3215 v5 trial: how far the band stands behind the wall face below */
  var bandCourse = (function () { var m = location.search.match(/[?&]bandcourse=([0-9.]+)/); return m ? +m[1] : 0.15; })();   /* req 3215 v5 trial: a string course this many metres proud of the wall below, at each band's foot */
  var bandTint = (function () { var m = location.search.match(/[?&]bandtint=([0-9.]+)/); return m ? +m[1] : 1.3; })();
  var bandCourseH = (function () { var m = location.search.match(/[?&]bandcourseh=([0-9.]+)/); return m ? +m[1] : 0.35; })();
  var bandDebug = /(^|[?&])banddebug=1(&|$)/.test(location.search);   /* req 3215 v5: every band piece flat unlit red, to see where the bands stand */
  function inPoly(pts, x, y) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var pi = pts[i], pj = pts[j];
      if ((pi[1] > y) !== (pj[1] > y) && x < (pj[0] - pi[0]) * (y - pi[1]) / (pj[1] - pi[1]) + pi[0]) c = !c;
    }
    return c;
  }
  function bands(TL, scene) {
    /* Refit 7 Nov 10.30 pm (req 3215 failed the blind look): fill only where no wall face stands. A ray from outside at the
       slit's mid height through each 1 m step finds any face near the wall plane (a taller wall, a ledge): none, and the
       step is open. The piece is one outer face only, set back 0.01 m from the innermost face found just below the slit (so
       never proud of a ledge), in that face's own material colour; no ends, no overlap into the wall, so no joint marks. */
    var seen = {}, P = [], probes = 0, CELL = 4, grid = {}, tri9 = [], tcol = [], stamp = [], qn = 0;
    /* a grid over the baked walls (normals within 60 degrees of level) so a probe tests a few triangles, not the castle */
    scene.updateMatrixWorld(true);
    (function () {
      var va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nn = new THREE.Vector3();
      scene.traverse(function (o) {
        if (!o.isMesh || o.name === 'exterior-bands' || !o.geometry || !o.geometry.attributes.position) return;
        var shownUp = true; for (var a = o; a; a = a.parent) if (!a.visible) shownUp = false; if (!shownUp) return;
        var P0 = o.geometry.attributes.position, ix = o.geometry.index, cnt = ix ? ix.count : P0.count, mw = o.matrixWorld;
        var col = o.material && o.material.color ? o.material.color.getHex() : null;
        for (var k = 0; k + 2 < cnt; k += 3) {
          va.fromBufferAttribute(P0, ix ? ix.getX(k) : k).applyMatrix4(mw); vb.fromBufferAttribute(P0, ix ? ix.getX(k + 1) : k + 1).applyMatrix4(mw); vc.fromBufferAttribute(P0, ix ? ix.getX(k + 2) : k + 2).applyMatrix4(mw);
          e1.subVectors(vb, va); e2.subVectors(vc, va); nn.crossVectors(e1, e2).normalize();
          if (Math.abs(nn.y) > 0.5) continue;
          var id = tri9.length / 9; tri9.push(va.x, va.y, va.z, vb.x, vb.y, vb.z, vc.x, vc.y, vc.z); tcol.push(col);
          var cx0 = Math.floor(Math.min(va.x, vb.x, vc.x) / CELL), cx1 = Math.floor(Math.max(va.x, vb.x, vc.x) / CELL),
              cz0 = Math.floor(Math.min(va.z, vb.z, vc.z) / CELL), cz1 = Math.floor(Math.max(va.z, vb.z, vc.z) / CELL);
          if ((cx1 - cx0 + 1) * (cz1 - cz0 + 1) > 400) continue;
          for (var cx = cx0; cx <= cx1; cx++) for (var cz = cz0; cz <= cz1; cz++) { var key = cx + ',' + cz; (grid[key] || (grid[key] = [])).push(id); }
        }
      });
    })();
    var S0v = new THREE.Vector3(), S1v = new THREE.Vector3(), dv = new THREE.Vector3();
    function probe(px, py, nx, ny, z) {
      var S0 = TL(px + nx * 3, py + ny * 3, z), S1 = TL(px, py, z); S0v.copy(S0); S1v.copy(S1);
      var len = dv.subVectors(S1v, S0v).length(); dv.multiplyScalar(1 / len); probes++; qn++;
      var far = len * 4 / 3, best = Infinity, bc = null, ox = S0v.x, oy = S0v.y, oz = S0v.z, dx = dv.x, dy = dv.y, dz = dv.z;
      for (var u = 0; u <= far; u += CELL / 2) {
        var cl = grid[Math.floor((ox + dx * u) / CELL) + ',' + Math.floor((oz + dz * u) / CELL)]; if (!cl) continue;
        for (var q = 0; q < cl.length; q++) {
          var id = cl[q]; if (stamp[id] === qn) continue; stamp[id] = qn;
          var b = id * 9, ax = tri9[b], ay = tri9[b + 1], az = tri9[b + 2];
          var e1x = tri9[b + 3] - ax, e1y = tri9[b + 4] - ay, e1z = tri9[b + 5] - az, e2x = tri9[b + 6] - ax, e2y = tri9[b + 7] - ay, e2z = tri9[b + 8] - az;
          var hx = dy * e2z - dz * e2y, hy = dz * e2x - dx * e2z, hz = dx * e2y - dy * e2x, det = e1x * hx + e1y * hy + e1z * hz;
          if (Math.abs(det) < 1e-9) continue;
          var f = 1 / det, sx = ox - ax, sy = oy - ay, sz = oz - az, uu = f * (sx * hx + sy * hy + sz * hz); if (uu < 0 || uu > 1) continue;
          var qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, vv = f * (dx * qx + dy * qy + dz * qz); if (vv < 0 || uu + vv > 1) continue;
          var tt = f * (e2x * qx + e2y * qy + e2z * qz); if (tt >= 0 && tt <= far && tt < best) { best = tt; bc = tcol[id]; }
        }
      }
      return best < Infinity ? { off: 3 - best * 3 / len, col: bc } : null;
    }
    builtPlaces.forEach(function (q) {
      if (!q.poly || q.poly.length < 3 || q.area || q.ceiling == null) return;
      var k = q.id + '@' + q.floor.toFixed(2); if (seen[k]) return; seen[k] = 1;
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, ar = 0;
      q.poly.forEach(function (p, i) { var n = q.poly[(i + 1) % q.poly.length]; ar += p[0] * n[1] - n[0] * p[1];
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      P.push({ q: q, poly: ar < 0 ? q.poly.slice().reverse() : q.poly, cw: ar < 0, b: [x0, y0, x1, y1], f: q.floor, c: q.ceiling });
    });
    function covers(R, x, y) { return x >= R.b[0] && x <= R.b[2] && y >= R.b[1] && y <= R.b[3] && inPoly(R.poly, x, y); }
    var tones = {}, later = [], gaps = {}, MAXGAP = 1.25, STEP = 0.25;
    function lum(h) { return ((h >> 16 & 255) * 0.3 + (h >> 8 & 255) * 0.59 + (h & 255) * 0.11) / 255; }
    var T = {}, pieces = 0, stretches = 0, tall = 0, faced = 0, bare = 0;
    function quad(col, a, b, c, d) { var arr = T[col] || (T[col] = []); [a, b, c, a, c, d].forEach(function (p) { var v = TL(p[0], p[1], p[2]); arr.push(v.x, v.y, v.z); }); }
    P.forEach(function (Q) {
      var E = Q.poly, top = Q.c, n = E.length;
      for (var i = 0; i < n; i++) {
        var a = E[i], b = E[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
        if (L < 0.3) continue;
        var ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
        var wl = Q.q.walls, t = Array.isArray(wl) ? wl[Q.cw ? (n - 1 - i - 1 + n) % n : i] : (wl && typeof wl === 'object' ? wl[['south', 'east', 'north', 'west'][i]] : null);
        t = t || Q.q.wall || 0.5;
        var steps = Math.max(1, Math.ceil(L / STEP)), runs = [], cur = null;
        for (var s = 0; s < steps; s++) {
          var m = (s + 0.5) / steps * L, px = a[0] + ux * m, py = a[1] + uy * m, ox = px + nx * 0.1, oy = py + ny * 0.1, ext = true, up = Infinity;
          for (var r = 0; r < P.length; r++) {
            var R = P[r]; if (R === Q) continue;
            if (R.f < top - 0.1 && R.c > Q.f + 0.1 && covers(R, ox, oy)) { ext = false; break; }
            if (R.f >= top - 0.05 && R.f < up && (covers(R, px - nx * 0.1, py - ny * 0.1) || covers(R, ox, oy) || covers(R, px + nx * t / 2, py + ny * t / 2))) up = R.f;
          }
          var z1 = ext && up < Infinity && up - top > 0.02 ? up : null, off = t, col = null, dbg = null;
          if (z1 != null && z1 - top > MAXGAP) { tall++; var hg = probe(px, py, nx, ny, top + 0.35), walled = hg && hg.off > -0.1 && hg.off < t + 0.4; if (!walled) { var gk = Q.q.id + '@' + Q.f.toFixed(2), g = gaps[gk] || (gaps[gk] = { id: Q.q.id, floor: +Q.f.toFixed(2), ceiling: +top.toFixed(2), up: +z1.toFixed(2), gap: +(z1 - top).toFixed(2), metres: 0 }); g.metres += +(L / steps).toFixed(2); g.gap = Math.max(g.gap, +(z1 - top).toFixed(2)); } z1 = null; }   /* a slab gap is 0.7 m; a taller gap is absent storeys, the Architect's (req 3191), not a band */
          if (z1 != null) {
            var hm = probe(px, py, nx, ny, (top + z1) / 2), hq = probe(px, py, nx, ny, top + Math.min(0.2, (z1 - top) / 2));
            dbg = { hm: hm ? +hm.off.toFixed(2) : null, hq: hq ? +hq.off.toFixed(2) : null };
            if ((hm && hm.off > -0.1 && hm.off < t + 0.4) || (hq && hq.off > -0.1 && hq.off < t + 0.4)) { z1 = null; faced++; }
            else {
              var lo = [probe(px, py, nx, ny, top - 0.15), probe(px, py, nx, ny, top - 0.7)].filter(function (h) { return h && h.off > 0.05 && h.off < t + 0.4; });
              if (lo.length) { lo.sort(function (p1, p2) { return p1.off - p2.off; }); off = lo[0].off;
                var lit = lo.filter(function (h) { return h.col != null && lum(h.col) >= 0.3; });
                col = lit.length ? lit[0].col : null; if (col != null) tones[col] = (tones[col] || 0) + 1; }
              else bare++;
            }
          }
          if (z1 != null && cur && Math.abs(cur.z1 - z1) < 0.01 && Math.abs(cur.off - off) < 0.02 && cur.col === col) cur.s1 = (s + 1) / steps * L;
          else if (z1 != null) runs.push(cur = { s0: s / steps * L, s1: (s + 1) / steps * L, z1: z1, off: off, col: col, dbg: dbg });
          else cur = null;
        }
        runs.forEach(function (R) {
          stretches++;
          var e0 = R.s0 < 0.01 ? t : 0, e1 = R.s1 > L - 0.01 ? t : 0;
          var A = [a[0] + ux * (R.s0 - e0 * 0) + nx * (R.off - bandRecess), a[1] + uy * R.s0 + ny * (R.off - bandRecess)], B = [a[0] + ux * (R.s1 + e1) + nx * (R.off - bandRecess), a[1] + uy * (R.s1 + e1) + ny * (R.off - bandRecess)];
          later.push({ col: R.col, A: A, B: B, ex: nx, ey: ny, z0: top, z1: R.z1, id: Q.q.id, fl: Q.f, edge: i, len: +(R.s1 - R.s0).toFixed(1), at: [+A[0].toFixed(1), +A[1].toFixed(1)], dbg: R.dbg });
        });
      }
    });
    var modal = 0xa39d92, mc = 0; Object.keys(tones).forEach(function (c) { if (tones[c] > mc) { mc = tones[c]; modal = +c; } });
    function paler(h) { var k = bandTint; return (Math.min(255, Math.round((h >> 16 & 255) * k)) << 16) | (Math.min(255, Math.round((h >> 8 & 255) * k)) << 8) | Math.min(255, Math.round((h & 255) * k)); }   /* the course in dressed stone, paler than the wall */
    later.forEach(function (w) { quad(w.col != null ? w.col : modal, [w.A[0], w.A[1], w.z0], [w.B[0], w.B[1], w.z0], [w.B[0], w.B[1], w.z1], [w.A[0], w.A[1], w.z1]); pieces++;
      if (bandCourse > 0) { var cc = paler(w.col != null ? w.col : modal), H = Math.min(bandCourseH, (w.z1 - w.z0) / 2), o = bandRecess + bandCourse, ex = w.ex, ey = w.ey,
          A2 = [w.A[0] + ex * o, w.A[1] + ey * o], B2 = [w.B[0] + ex * o, w.B[1] + ey * o];   /* the course: a front, a lit top and a shaded underside; open ends, bandCourseH tall at most */
        quad(cc, [A2[0], A2[1], w.z0], [B2[0], B2[1], w.z0], [B2[0], B2[1], w.z0 + H], [A2[0], A2[1], w.z0 + H]);
        quad(cc, [A2[0], A2[1], w.z0 + H], [B2[0], B2[1], w.z0 + H], [w.B[0], w.B[1], w.z0 + H], [w.A[0], w.A[1], w.z0 + H]);
        quad(cc, [w.A[0], w.A[1], w.z0], [w.B[0], w.B[1], w.z0], [B2[0], B2[1], w.z0], [A2[0], A2[1], w.z0]); }
    });
    var G = new THREE.Group(), tris = 0; G.name = 'exterior-bands';
    Object.keys(T).forEach(function (c) {
      var bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(T[c], 3));
      bg.computeVertexNormals(); bg.computeBoundingSphere(); tris += T[c].length / 9;
      G.add(new THREE.Mesh(bg, bandDebug ? new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ color: +c, side: THREE.DoubleSide })));
    });
    var log = later.map(function (w) { return { id: w.id, floor: +w.fl.toFixed(2), edge: w.edge, len: w.len, at: w.at, z0: +w.z0.toFixed(2), z1: +w.z1.toFixed(2), h: +(w.z1 - w.z0).toFixed(2), probe: w.dbg }; });
    return { gaps: Object.keys(gaps).map(function (k) { return gaps[k]; }).sort(function (p1, p2) { return p2.gap - p1.gap; }), log: log, group: G, pieces: pieces, tall: tall, faced: faced, bare: bare, probes: probes, places: P.length, tris: tris };
  }

  function placeInto(out, TL) {
    var a = TL(0, 0, 0), b = out.toLocal(0, 0, 0);
    out.group.position.copy(a.sub(b));
  }

  function run(gb) {
    var t0 = performance.now(), M = page.M, mo = page.out, TL = mo ? mo.toLocal : gb.toLocal;
    if (mo) keepPlaces(mo);
    var mainFloor = mo && mo.place ? mo.place.floor : null, floorAll = /(^|[?&])floor=all(&|$)/.test(location.search);
    var rooms = (M.rooms || []).filter(function (r) { return !r.page; }).map(function (r) { return { id: r.id, z: roomFloor(M, r), a: roomArea(r) }; });
    rooms.sort(function (p, q) { return p.z - q.z; });
    var buckets = [];
    rooms.forEach(function (r) { var b = buckets[buckets.length - 1]; if (!b || r.z - b.z > 0.05) buckets.push(b = { z: r.z, rooms: [] }); b.rooms.push(r); });
    var steps = [];
    buckets.forEach(function (b) {
      if (floorAll && mainFloor != null && Math.abs(b.z - mainFloor) <= 0.05) { X.skipped.push('floor ' + b.z.toFixed(2) + ': the page\'s own'); return; }
      steps.push(function () {
        var s0 = performance.now(), seeds = b.rooms.slice().sort(function (p, q) { return q.a - p.a; }), out = null, seed = null, errs = 0;
        for (var i = 0; i < seeds.length && !out; i++) {
          try { out = orig(stubF, M, seeds[i].id, { floor: 'all', far: false, paint: [], bays: 'piers', trim: 0, walls: page.o.walls }); seed = seeds[i].id; }
          catch (e) { out = null; if (!errs++) X.skipped.push('floor ' + b.z.toFixed(2) + ' seed ' + seeds[i].id + ': ' + String(e && e.message || e).slice(0, 120)); }
        }
        var rec = { z: +b.z.toFixed(2), seed: seed, rooms: b.rooms.length, built: 0, ms: 0 };
        if (out) {
          placeInto(out, TL);
          rec.built = (out.places || []).length; keepPlaces(out);
          var bk = bake([out.group], 'exterior-floor-' + rec.z); gb.scene.add(bk.group); rec.meshes = bk.meshes; rec.bins = bk.bins;
        } else X.skipped.push('floor ' + rec.z + ': no seed built');
        rec.ms = Math.round(performance.now() - s0); X.floors.push(rec);
      });
    });
    steps.push(function () {
      var s0 = performance.now(), gs = [];
      (M.stairs || []).forEach(function (st) {
        X.shafts.tried++;
        try {
          var out = orig(stubF, M, slug(st.id), { far: false, paint: [], trim: 0 });
          if (out && out.place && out.place.shaft) { keepPlaces(out); placeInto(out, TL); gs.push(out.group); X.shafts.built++; }
        } catch (e) { X.skipped.push('shaft ' + st.id + ': ' + String(e && e.message || e).slice(0, 120)); }
      });
      var bk = bake(gs, 'exterior-shafts'); gb.scene.add(bk.group); X.shafts.meshes = bk.meshes;
      X.shafts.ms = Math.round(performance.now() - s0);
    });
    if (bandsOn) steps.push(function () {
      var s0 = performance.now(), bd; try { bd = bands(TL, gb.scene); } catch (e) { X.skipped.push('bands: ' + String(e && e.stack || e).slice(0, 300)); return; } gb.scene.add(bd.group);
      X.bands = { gaps: bd.gaps, log: bd.log, pieces: bd.pieces, tris: Math.round(bd.tris), tallSkipped: bd.tall, faced: bd.faced, bare: bd.bare, probes: bd.probes, places: bd.places, ms: Math.round(performance.now() - s0) };
    });
    steps.push(function () {
      var s0 = performance.now(), m = massing(TL); gb.scene.add(m.group);
      X.massing = { tris: Math.round(m.tris), ms: Math.round(performance.now() - s0) };
    });
    (function next() {
      var f = steps.shift();
      if (!f) { X.ms = Math.round(performance.now() - t0); X.done = true; return; }
      try { f(); } catch (e) { X.skipped.push('step: ' + String(e && e.message || e).slice(0, 160)); }
      setTimeout(next, 0);
    })();
  }

  var poll = setInterval(function () {
    var gb = window.lumosGreybox;
    if (!gb || !gb.scene || !gb.camera || !page) return;
    clearInterval(poll);
    gb.scene.fog = null; gb.camera.far = 3000; gb.camera.updateProjectionMatrix();
    setTimeout(function () { run(gb); }, 0);
  }, 100);
})();
