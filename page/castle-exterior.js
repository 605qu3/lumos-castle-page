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
    drums: [], dormers: [], calls: function () { var g = window.lumosGreybox; return g && g.renderer ? g.renderer.info.render.calls : null; } };

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
  var GREYS = { raiseFoot: 0xb8b2a8, filler: 0xb9b2a6, roof: 0x5f6670, parapet: 0x8a857e, ground: 0x7d8a5c, rock: 0x8b8478, water: 0x6f8797, raise: 0xa39d92, stripBand: 0xa39d92, stripTop: 0xa39d92, soffit: 0xd0c9bb, raiseCourse: 0x868077, slit: 0x18181a };   /* raise and raiseCourse are set from the probed wall tone (req 3222) */
  function massing(TL, scene) {
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
    /* req 3232 (Architect, 8 November 2026; model v300 raised nr-east and nr-gable's eaves 38.6 to 41.6): the walls were drawn
       to the rooms' tops (40.9) and the hip's foot stood 0.8 m behind the wall's outer face (roof rect y 72, face y 72.8), so a
       0.7 m open strip and a dark wedge showed under the eaves. For a pitched part, each side is probed every 0.5 m: a level ray
       at 1.5 m under the eaves finds the wall's outer face (up to 1.5 m outside the rect, 0.5 m inside); where a ray just under
       the eaves finds nothing in front of that face, a wall piece closes it from 1.25 m under the eaves to the eaves, 0.05 m
       behind the face; the roof's side is carried out to the face where most samples find one. ?eavesfit=1 puts it in. */
    /* v18 (a build with eavesfit=1 ran past 400 s: 20 casts a sample against the whole scene on every pitched roof): fitted
       only on the parts named, req 3232's nr-east and nr-gable by default (?eavesfit=1), ?eavesfit=all for every part or
       ?eavesfit=<id,id>; and each part's casts go only to the meshes whose box lies within 4 m of its rect and 7 m under its
       eaves */
    var eavesIds = ((location.search.match(/[?&]eavesfit=([^&]+)/) || [])[1] || ''), eavesAll = eavesIds === 'all';
    eavesIds = (eavesIds === '' || eavesIds === '1') ? ['nr-east', 'nr-gable'] : decodeURIComponent(eavesIds).split(',');
    /* v22 (Fawkes, 8 November 2026, 4.28 am, patrol entry on eye-3232/v24): ON by default, nr-east and nr-gable only; ?eavesfit=0 is
       the off switch, ?eavesfit=all or =<id,id> as before. It was OFF through v21 (wrap 1.30 am: at close-n the 40.1 face probe found
       no wall on nr-east's north, so nothing closed there, and 1063 pieces were placed on other roofs unchecked; v18 to v21 since
       limit it to the named parts, make the fit local and add the soffit and side returns). */
    var eavesFit = !/[?&]eavesfit=0/.test(location.search), erc = new THREE.Raycaster();
    X.eaves = [];
    function fitEaves(p) {
      var r = p.rect.slice(), e = p.eaves, sides = [[0, 1, r[3], r[0], r[2], true], [0, -1, r[1], r[0], r[2], true], [1, 0, r[2], r[1], r[3], false], [-1, 0, r[0], r[1], r[3], false]], log = { id: p.id, ext: [], closed: 0 }, fitted = [false, false, false, false], sideExt = [0, 0, 0, 0], slotPieces = [];
      var t0 = performance.now(), nc = 0;
      if (scene) scene.updateMatrixWorld(true);
      var near = [], bb = new THREE.Box3(), lo = TL(r[0] - 4, r[1] - 4, e - 7), hi = TL(r[2] + 4, r[3] + 4, e + 1), zone = new THREE.Box3().setFromPoints([lo, hi]);
      scene.traverse(function (q) { if (!q.isMesh || q.visible === false || /^exterior-massing$/.test(q.parent && q.parent.name || '')) return;
        bb.setFromObject(q); if (bb.intersectsBox(zone)) near.push(q); });
      log.near = near.length; log.msNear = Math.round(performance.now() - t0);
      /* v19 (req 3232 row 2: 8424 casts at about 10 ms each, 115 s load against 35 s): the casts scanned every triangle of
         the big merged floor meshes. Now the triangles of the nearby meshes that touch the part's zone are copied once into
         a small soup, one mesh per material side (so front-only faces still answer only from the front), and every cast
         goes to the soup: the same faces, so the same hits and the same pieces, at a fraction of the cost.
         ?eavessoup=0 casts to the meshes as v18 did. */
      var soup = near;
      if (!/[?&]eavessoup=0/.test(location.search)) {
        var bySide = {}, va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), tb = new THREE.Box3(), ntri = 0;
        near.forEach(function (q) {
          var G = q.geometry, P = G && G.attributes.position; if (!P || Array.isArray(q.material)) { (bySide.raw || (bySide.raw = [])).push(q); return; }
          var I = G.index, cnt = I ? I.count : P.count, side = q.material.side, arr = bySide[side] || (bySide[side] = []), mw = q.matrixWorld;
          for (var i = 0; i + 2 < cnt; i += 3) {
            var ia = I ? I.getX(i) : i, ib = I ? I.getX(i + 1) : i + 1, ic = I ? I.getX(i + 2) : i + 2;
            va.fromBufferAttribute(P, ia).applyMatrix4(mw); vb.fromBufferAttribute(P, ib).applyMatrix4(mw); vc.fromBufferAttribute(P, ic).applyMatrix4(mw);
            tb.makeEmpty(); tb.expandByPoint(va); tb.expandByPoint(vb); tb.expandByPoint(vc);
            if (!tb.intersectsBox(zone)) continue;
            arr.push(va.x, va.y, va.z, vb.x, vb.y, vb.z, vc.x, vc.y, vc.z); ntri++; } });
        soup = bySide.raw || [];
        Object.keys(bySide).forEach(function (sd) { if (sd === 'raw' || !bySide[sd].length) return;
          var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(bySide[sd], 3)); sg.computeBoundingSphere();
          var sm = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ side: +sd })); sm.updateMatrixWorld(true); soup.push(sm); });
        log.soupTris = ntri; log.msSoup = Math.round(performance.now() - t0); }
      function cast(s, L, nx, ny, alongX, z, far) {
        var o = alongX ? TL(s, L + ny * 3, z) : TL(L + nx * 3, s, z), t = alongX ? TL(s, L - ny * 1, z) : TL(L - nx * 1, s, z);
        erc.set(o, t.sub(o).normalize()); erc.far = far; nc++;
        var h = erc.intersectObjects(soup, false).filter(function (q) { return q.object.isMesh && q.object.visible !== false && !/^exterior-massing$/.test(q.object.parent && q.object.parent.name || ''); })[0];
        return h ? 3 - h.distance : null; }
      sides.forEach(function (S, k) {
        var nx = S[0], ny = S[1], L = S[2], alongX = S[5], offs = [], n = 0, closedHere = log.closed;
        /* v16 (picks at close-n, eye-3232/pick-col): on nr-east the seventh floor's north wall stands at y 69.8 (top 40.9),
           3 m behind the floor below's face at y 72.8, so the 1.5 m probe met the set-back wall or ran in. Now each sample
           casts every 0.3 m from just under the eaves down 6 m: the outermost face found (-0.5 to 1.5 m off the rect's edge)
           is the wall's face, its highest hit is the face's top, and above that top a wall piece is drawn on that face's line
           up to the eaves, closing the open shelf as wall body (as req 3221 item 7 ruled the Entrance Hall's strip) */
        var prevP = null;
        for (var u = S[3] + 0.25; u < S[4]; u += 0.5) { n++;
          /* v18: a wall that already reaches the eaves (the first cast, just under them, meets a face in range) needs no
             column of casts under it */
          var g0 = cast(u, L, nx, ny, alongX, e - 0.15, 7); if (g0 != null && g0 <= 1.5 && g0 >= -0.5) { offs.push(g0); continue; }
          var hs = [[e - 0.15, g0]]; for (var z = e - 0.45; z > e - 6; z -= 0.3) { var g = cast(u, L, nx, ny, alongX, z, 7); hs.push([z, g]); }
          var f = null; hs.forEach(function (H) { if (H[1] != null && H[1] <= 1.5 && H[1] >= -0.5 && (f == null || H[1] > f)) f = H[1]; });
          if (f == null) continue; offs.push(f);
          var top = null; hs.forEach(function (H) { if (top == null && H[1] != null && Math.abs(H[1] - f) < 0.1) top = H[0]; });
          if (top != null && top < e - 0.2) { var w = f - 0.05, A = u - 0.25, B = Math.min(S[4], u + 0.25), zb = top - 0.2;
            /* v21 (req 3232 row 3, picks eye-3232/v22 eaves-picks.json: the three small dark notches that show along nr-east's
               eaves once the fit is on, at model x 126.25, 115.5 and 100.45): where the facade has a 0.5 m slot between two
               rooms the fitted pieces step 0.8 m (y 72.75 to 71.95) with no side return, and an oblique ray crosses the step
               into the roof space. A side quad closes each step, from the lower of the two pieces' feet up to the eaves. */
            if (prevP && Math.abs(prevP.u - (u - 0.5)) < 1e-6 && Math.abs(prevP.w - w) > 0.02 && !/[?&]stepreturn=0/.test(location.search)) { var zr = Math.min(prevP.zb, zb), rl = u - 0.25;
              if (alongX) quad('raise', [rl, L + ny * prevP.w, zr], [rl, L + ny * w, zr], [rl, L + ny * w, e], [rl, L + ny * prevP.w, e]);
              else quad('raise', [L + nx * prevP.w, rl, zr], [L + nx * w, rl, zr], [L + nx * w, rl, e], [L + nx * prevP.w, rl, e]); }
            prevP = { u: u, w: w, zb: zb };
            /* v18: wound to face out on every side (the north and west pieces faced in, picks eye-3232/v18) */
            slotPieces.push({ k: k, lo: Math.min(A, B), hi: Math.max(A, B), w: w });
            if (ny > 0 || nx < 0) { var sw = A; A = B; B = sw; }
            if (alongX) quad('raise', [A, L + ny * w, zb], [B, L + ny * w, zb], [B, L + ny * w, e], [A, L + ny * w, e]);
            else quad('raise', [L + nx * w, A, zb], [L + nx * w, B, zb], [L + nx * w, B, e], [L + nx * w, A, e]);
            log.closed++; } }
        var ext = offs.length >= n / 2 ? Math.max(0, offs.sort(function (x, y) { return x - y; })[offs.length >> 1]) : 0;
        log.ext.push(+ext.toFixed(2)); sideExt[k] = ext; fitted[k] = ext > 0 || log.closed > closedHere;
        if (k === 0) r[3] += ext; else if (k === 1) r[1] -= ext; else if (k === 2) r[2] += ext; else r[0] -= ext; });
      /* v20 (req 3232 row 2, picks eye-3232/v20 pick-0 and pick-1: the r30-h dark slivers under the dormer): the fitted wall piece
         stands 0.05 m behind the roof's eave edge and tops out at the eaves, so a ray rising under the edge slipped through that
         wedge into the roof space and read the roof's dark underside. A soffit: a level strip at the eaves, from the fitted
         side's eave line 0.3 m inward along the side's whole length, so every ray under the edge meets it. ?soffit=0 leaves it out. */
      if (!/[?&]soffit=0/.test(location.search)) {
        var sd = 0.3; log.soffit = 0;
        if (fitted[0]) { quad('soffit', [r[0], r[3] - sd, e], [r[2], r[3] - sd, e], [r[2], r[3], e], [r[0], r[3], e]); log.soffit++; }
        if (fitted[1]) { quad('soffit', [r[0], r[1], e], [r[2], r[1], e], [r[2], r[1] + sd, e], [r[0], r[1] + sd, e]); log.soffit++; }
        if (fitted[2]) { quad('soffit', [r[2] - sd, r[1], e], [r[2], r[1], e], [r[2], r[3], e], [r[2] - sd, r[3], e]); log.soffit++; }
        if (fitted[3]) { quad('soffit', [r[0], r[1], e], [r[0] + sd, r[1], e], [r[0] + sd, r[3], e], [r[0], r[3], e]); log.soffit++; }
        /* v21 (req 3232 row 3): where a piece stands back in a facade slot (0.85 m behind the roof's edge), the overhang's
           underside showed as a 2 to 3 px dark sliver under the eaves; the soffit runs from the piece out to the edge there too. */
        slotPieces.forEach(function (P) { var S2 = sides[P.k], edge = sideExt[P.k]; if (!fitted[P.k] || edge - P.w <= 0.1) return;
          if (S2[5]) quad('soffit', [P.lo, S2[2] + S2[1] * P.w, e], [P.hi, S2[2] + S2[1] * P.w, e], [P.hi, S2[2] + S2[1] * edge, e], [P.lo, S2[2] + S2[1] * edge, e]);
          else quad('soffit', [S2[2] + S2[0] * P.w, P.lo, e], [S2[2] + S2[0] * P.w, P.hi, e], [S2[2] + S2[0] * edge, P.hi, e], [S2[2] + S2[0] * edge, P.lo, e]);
          log.soffit++; }); }
      soup.forEach(function (q) { if (near.indexOf(q) < 0) { q.geometry.dispose(); q.material.dispose(); } });
      log.casts = nc; log.ms = Math.round(performance.now() - t0); X.eaves.push(log); return r; }
    /* req 3274 (the model's roof part `dormers`, a count per long side): a gabled head per dormer on a gable or a hip's straight run, its front and peak flush with the eave line, 1.2 m of wall then 0.9 m of gable, cheeks as triangles, roof planes in the roof grey, a dark slit on the front. A head whose footprint meets a crow part's rect is left out. ?dormers=0 leaves them out. */
    function dormers(p, r, e, h, hipped, crows) {
      var n = p.dormers | 0, x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3], lg = { id: p.id, n: n, south: 0, north: 0, skipped: 0, at: [] };
      X.dormers.push(lg);
      if (!n || x1 - x0 < y1 - y0 || /[?&]dormers=0/.test(location.search)) return;
      var d = y1 - y0, ym = (y0 + y1) / 2, k = (h - e) / (ym - y0), wH = 1.2, gH = 0.9, dE = wH / k, dR = (wH + gH) / k;
      var a0 = hipped ? x0 + d / 2 : x0, a1 = hipped ? x1 - d / 2 : x1, sp = (a1 - a0) / n, hw = Math.min(0.9, sp * 0.3);
      [0, 1].forEach(function (s) {
        var yf = s ? y1 : y0, sg = s ? -1 : 1, sx = s ? -1 : 1;
        function Y(t) { return yf + sg * t; }
        for (var i = 0; i < n; i++) {
          var cx = a0 + sp * (i + 0.5), l = cx - hw, rr = cx + hw, yb = Y(dR);
          if ((crows || []).some(function (c) { return rr > c[0] && l < c[2] && Math.max(yf, yb) > c[1] && Math.min(yf, yb) < c[3]; })) { lg.skipped++; continue; }
          var z1 = e + wH, z2 = e + wH + gH;
          quad('filler', [l, yf, e], [rr, yf, e], [rr, yf, z1], [l, yf, z1]); tri('filler', [l, yf, z1], [rr, yf, z1], [cx, yf, z2]);
          var sy = yf - sg * 0.03; quad('slit', [cx - hw * 0.35, sy, e + 0.25], [cx + hw * 0.35, sy, e + 0.25], [cx + hw * 0.35, sy, e + 1.0], [cx - hw * 0.35, sy, e + 1.0]);
          tri('filler', [l, yf, e], [l, yf, z1], [l, Y(dE), z1]); tri('filler', [rr, yf, e], [rr, Y(dE), z1], [rr, yf, z1]);
          quad('roof', [l, yf, z1], [cx, yf, z2], [cx, yb, z2], [l, Y(dE), z1]); quad('roof', [cx, yf, z2], [rr, yf, z1], [rr, Y(dE), z1], [cx, yb, z2]);
          if (s) lg.north++; else lg.south++; lg.at.push([+cx.toFixed(2), s ? 'n' : 's']);
        }
      });
    }
    function roofPart(p, massPar) {
      var e = p.eaves, h = p.ridge != null ? p.ridge : e;
      if (eavesFit && scene && (eavesAll || eavesIds.indexOf(p.id) >= 0) && (p.kind === 'hip' || p.kind === 'gable' || p.kind === 'crow')) p = Object.assign({}, p, { rect: fitEaves(p) });
      if (p.kind === 'hip') hip(p.rect, e, h);
      else if (p.kind === 'gable' || p.kind === 'crow') gable(p.rect, e, h);
      else if (p.kind === 'flat') flat(p.rect, e, p.parapet != null ? p.parapet : massPar);
      else X.skipped.push('roof kind ' + p.kind + ' ' + (p.id || ''));
      if (p.dormers && (p.kind === 'hip' || p.kind === 'gable')) dormers(p, p.rect, e, h, p.kind === 'hip', curCrows);
    }
    var curCrows = [];
    var M = page.M;
    (M.masses || []).forEach(function (m) {
      var R = m.roof;
      if (!R) { X.skipped.push('mass ' + m.id + ': no roof'); return; }
      var parts = R.parts && R.parts.length ? R.parts : (R.kind ? [R] : []);
      if (!parts.length && m.parapet != null) {   /* the south range's west half: a flat at its top storey's ceiling (7: 36.4 + 5.2) */
        flat(m.rect, 41.6, m.parapet); return;
      }
      curCrows = parts.filter(function (q) { return q.kind === 'crow'; }).map(function (q) { return q.rect; });
      parts.forEach(function (p) { roofPart(p, R.parapet); });
      if (R.flat) flat(R.flat.rect, R.flat.z, R.flat.lead);
    });
    /* req 3239 (the Architect, 8 Nov 2026; docs/architect/r3197/plan.md): the P5 spur and any other work in the model's works list, a ring of filler from its base to its top,
       its cap in the wall's tone, and its parapet if it has one. ?works=0 leaves it out. */
    if (!/[?&]works=0/.test(location.search)) (M.works || []).forEach(function (w) { if (!w.poly || w.poly.length < 3) return;
      wallRing('filler', w.poly, w.base, w.top); cap('raise', w.poly, null, w.top);
      if (w.parapet > w.top) wallRing('parapet', w.poly, w.top, w.parapet); });
    /* req 3240 (the Architect, Fawkes's 5.58 am ruling, Godric's 1 on req 1480): the east wing's fifth storey (east-wing-5, first OotP, castle-model-5.js:15, rect [144,18.25,160,49.75],
       floor 26 to 31.2) is absent in the PS stack; the eye saw through it into the sixth floor's inner west wall at x 147.85. A closed wall body in the outer wall's place, outer face
       x 160.8, drawn only when the room is not in the page's (book-filtered) model, so the OotP stack keeps the room's own walls. 0.01 m inside the slabs above and below. ?ewing5=0 leaves it out. */
    if (!/[?&]ewing5=0/.test(location.search) && !(M.rooms || []).some(function (r) { return r.id === 'east-wing-5'; })) box('raise', [160.0, 18.25, 160.79, 49.75], 25.95, 31.25);   /* v27: the box overlaps the slabs above and below by 0.05 m (it stood 0.01 m inside the storey: a 0.02 m gap, which read as faint dotted seams at r120-h and r120-e; 0.03 inside read as a thin dark line), its outer face 0.01 m behind the neighbours' at x 160.8 */
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
    /* req 3222 (model v298, ledger 370): a mass's raise as filler with its flat lead and parapet; a round room's corbel
       courses (stepped, narrowing downward to z0), its outer drum up to its ceiling, and its bell cap */
    var x3222 = !/(^|[?&])x3222=0(&|$)/.test(location.search);   /* ?x3222=0 leaves req 3222's pieces out, for a fair before */
    if (x3222) (M.masses || []).forEach(function (m) {
      var Rz = m.raise; if (!Rz || !Rz.rect) return;
      /* rework (Fawkes's look, 11.45 pm): a whole box stood on the rooms' own east and north faces and covered their windows
         (P04, r120-e). The raise is drawn only where it stands proud: its outer 2 m on the west and south (the model: "2 m
         proud of the stair hall's west and south faces", no room there), the leads over it all, and its machicolated top as
         a course 0.35 m proud under the parapet on those two faces, so the raise reads as its own block */
      /* rework 2 (Fawkes's look, 0.17 am, r240-g): the south strip ran on past the stair hall as one pale plane over a window
         slot and ended ragged. Now a ray from outside at each 0.5 m along each strip, at every 1.5 m of its height, must meet
         a lit wall face within 2.6 m (the stair hall's face behind the 2 m strip): only those runs are built, so the strip stops
         where the hall stops or a window opens; it takes the commonest hit wall tone, not the pale filler, and a thin course
         every 2.6 m in a darker shade reads as coursed stone */
      var FB = +((location.search.match(/[?&]raisefootblue=([\d.]+)/) || [])[1] || 1.05), FL = +((location.search.match(/[?&]raisefootlight=([\d.]+)/) || [])[1] || 1.25), FH = +((location.search.match(/[?&]raisefoot=([\d.]+)/) || [])[1] || 4), R0 = Rz.rect, P = 2, mz = Rz.z1 - 1.2, rc = new THREE.Raycaster(), hits = {}, ok = [];
      if (scene) scene.updateMatrixWorld(true);
      function solid(x, y, nx, ny, zA, zB) {   /* outer face point, outward normal; heights zA to zB (default the strip's) */
        if (zA == null) { zA = Rz.z0 + 0.75; zB = mz - 0.3; }
        for (var z = zA; z < zB; z += 1.5) {
          var o = TL(x + nx * 3, y + ny * 3, z), e = TL(x - nx * 2.6, y - ny * 2.6, z), d = e.clone().sub(o), L = d.length();
          rc.set(o, d.normalize()); rc.far = L;
          var h = scene ? rc.intersectObject(scene, true).filter(function (q) { return q.object.isMesh && q.object.visible !== false && /^exterior-massing$/.test(q.object.parent && q.object.parent.name || '') === false; })[0] : null;
          var col = h && h.object.material && h.object.material.color ? h.object.material.color.getHex() : null;
          if (col == null || ((col >> 16 & 255) * 0.3 + (col >> 8 & 255) * 0.59 + (col & 255) * 0.11) / 255 < 0.3) return false;
          if (zA >= Rz.z0) hits[col] = (hits[col] || 0) + 1;
        }
        return true;
      }
      function runs(a, b, at) { var out = [], cur = null; for (var s = a; s < b - 0.01; s += 0.5) { var m = Math.min(b, s + 0.5);
          if (at(s + 0.25)) { if (cur && Math.abs(cur[1] - s) < 0.01) cur[1] = m; else out.push(cur = [s, m]); } else cur = null; } return out; }
      /* v14 (r240-g, rows 3-4): a pick at the stand showed the west strip starting at y -1, not the corner's -2, so a 2 by 1 m
         bite at the turret corner showed the south strip's end face and every course stepped round it; and three 0.5 m gaps
         broke the west strip into short boxes whose course ends read as zigzags. Gaps up to 1 m are bridged (a slot that narrow
         in a 2 m solid is no window from outside; the model's raise is solid there), and a run ending within 1.5 m of the
         shared corner is carried to it, so the courses wrap the corner unbroken */
      function bridge(rs, lo, hi) { var o = []; rs.forEach(function (r) { var l = o[o.length - 1]; if (l && r[0] - l[1] <= 1.01) l[1] = r[1]; else o.push(r.slice()); });
        if (o.length && lo != null && o[0][0] - lo <= 1.51) o[0][0] = lo; if (o.length && hi != null && hi - o[o.length - 1][1] <= 1.51) o[o.length - 1][1] = hi; return o; }
      var west = bridge(runs(R0[1], R0[3], function (y) { return solid(R0[0], y, -1, 0); }), R0[1], null), south = bridge(runs(R0[0] + P, R0[2], function (x) { return solid(x, R0[1], 0, -1); }), R0[0] + P, null);
      var tone = 0xa39d92, tc = 0; Object.keys(hits).forEach(function (c) { if (hits[c] > tc) { tc = hits[c]; tone = +c; } });
      GREYS.raise = tone; GREYS.raiseFoot = ((Math.min(255, (tone >> 16 & 255) * FL) | 0) << 16) | ((Math.min(255, (tone >> 8 & 255) * FL) | 0) << 8) | (Math.min(255, (tone & 255) * FL * FB) | 0);   /* v14: FB (1.05, ?raisefootblue=) takes out the warm cast the foot's light gave it (rendered 44,42,40 beside the wall's 44,43,42; a blind look read a tan slab). v13: the foot's underside takes no sun from the lake, so it is drawn FL (1.25) times lighter (1.6 read as a pale slab, 1.0 dark) to read as lit stone, not a dark slab */
      GREYS.raiseCourse = ((tone >> 16 & 255) * 0.82 << 16) | ((tone >> 8 & 255) * 0.82 << 8) | ((tone & 255) * 0.82 | 0);
      var X3222 = window.lumosExterior3222 = { west: west, south: south, tone: tone.toString(16), hits: tc };
      function foot(a, b, o, i, alongX) {   /* a sloped corbel foot, 2 m tall, from the hall's face up to the strip's outer face:
           the flat soffit of a 2 m overhang read as a dark underside from the lake (Fawkes, 0.17 am) */
        function P3(s, t, z) { return alongX ? [s, t, z] : [t, s, z]; }
        var z = Rz.z0, zl = Rz.z0 - FH;   /* v13: 2 m out over FH (4) m down, nearly upright so it takes the wall's light; at 45 degrees it read from the lake as a dark slab (helper, 0.32 am) */
        quad('raiseFoot', P3(a, o, z), P3(b, o, z), P3(b, i, zl), P3(a, i, zl));
        tri('raise', P3(a, o, z), P3(a, i, z), P3(a, i, zl)); tri('raise', P3(b, o, z), P3(b, i, z), P3(b, i, zl));
      }
      function strip(r, cr) { box('raise', r, Rz.z0, mz);   /* v13: courses 0.3 m tall, 0.08 proud: at 0.12 m they aliased into dotted, stepped lines from the lake */
        /* v14: proud only on the outer faces (cr), flush at the run's ends, so a course stops clean against the round shaft */
        /* v15b: the first course at the strip's foot (z0), where the corbel foot meets it, so the foot's top reads as one line */
        /* v16 (close shot, loops-v16 picks): the keep-wall-walk's own outer wall (floor 34) stands at y -2.1, 0.1 m proud of the
           strip, over x 76 to 86, and hid the 0.08 m foot course there; the foot course is 0.15 m proud on the outer faces */
        if (cr) for (var cz = Rz.z0; cz < mz - 0.5; cz += 2.6) { var c2 = cr.slice(); if (cz === Rz.z0) { if (c2[0] < R0[0]) c2[0] = R0[0] - 0.15; if (c2[1] < R0[1]) c2[1] = R0[1] - 0.15; } box('raiseCourse', c2, cz, cz + 0.3); } }
      /* v14 (r240-g, the ragged end): a round stair shaft bulges past the south face at x 91.4, so each proud piece (course
         0.08, parapet 0.35, foot) cut into its ten-sided wall at its own point. A ray 0.4 m out of the face, along the run
         from 3 m inside each end, finds a built wall standing across it; every proud piece then stops 0.05 m short of that
         one line, so the ends read as one clean vertical */
      function meet(r, alongX, face, out) {   /* r = [a, b]; out = outward normal sign of the face; returns the proud pieces' [a, b] */
        var q = r.slice(), zm = (Rz.z0 + mz) / 2;
        [[r[1], 1], [r[0], -1]].forEach(function (E) { var e = E[0], dir = E[1], s0 = e - dir * Math.min(3, (r[1] - r[0]) / 2), best = null;
          [zm - 4, zm, zm + 4, Rz.z0 - FH / 2].forEach(function (z) {
            var o = alongX ? TL(s0, face + out * 0.4, z) : TL(face + out * 0.4, s0, z), t = alongX ? TL(s0 + dir, face + out * 0.4, z) : TL(face + out * 0.4, s0 + dir, z);
            rc.set(o, t.sub(o).normalize()); rc.far = Math.abs(e - s0) + 0.5;
            var h = scene ? rc.intersectObject(scene, true).filter(function (k) { return k.object.isMesh && k.object.visible !== false && !/^exterior-massing$/.test(k.object.parent && k.object.parent.name || ''); })[0] : null;
            if (h) { var at = s0 + dir * h.distance; if (dir > 0 ? at < e : at > e) best = best == null ? at : (dir > 0 ? Math.min(best, at) : Math.max(best, at)); } });
          if (best != null) q[dir > 0 ? 1 : 0] = best - dir * 0.05; });
        return q; }
      /* the foot only where the hall's face below is solid too (a first foot covered the window slot under the south strip) */
      var footW = [], footS = [], FE = +((location.search.match(/[?&]footend=([\d.]+)/) || [])[1] || -1);
      /* v18 (the sliver left by v17, picks-sliver.json, probe of 8 November 2.40 am): the shaft's west face is not one x. It
         recedes east as the foot runs north (x 91.48 at y -2, 91.68 at -1.4, 92.27 at -0.85), so a foot cut square at one x
         left a plan triangle open, the shaft's facets and the hall face (y -0.8) showing through it. The foot's end now
         follows the deepest point of that face: level rays east across the foot's whole depth, every 0.2 m, at two heights,
         and the foot runs 0.15 m past the furthest hit, at most 1.5 m (the shaft runs on to x 100). ?footend=<m> gives the
         old fixed run (0.45 for v17, 0 for v16's stop) */
      function footEnd(b, o, i) { var far = b, z;
        for (var y = o + 0.05; y < i; y += 0.2) [Rz.z0 - 1.5, Rz.z0 - 3].forEach(function (z) {
          var a = TL(b - 0.5, y, z), t = TL(b + 0.5, y, z); rc.set(a, t.sub(a).normalize()); rc.far = 2;
          var h = scene ? rc.intersectObject(scene, true).filter(function (k) { return k.object.isMesh && k.object.visible !== false && !/^exterior-massing$/.test(k.object.parent && k.object.parent.name || ''); })[0] : null;
          if (h) { var at = b - 0.5 + h.distance; if (at > far) far = at; } });
        return Math.min(far + 0.15, b + 1.5); }
      west.forEach(function (w) { bridge(runs(w[0], w[1], function (y) { return solid(R0[0], y, -1, 0, Rz.z0 - FH + 0.25, Rz.z0); }), w[0], w[1]).forEach(function (f) { footW.push(f); var g = meet(f, false, R0[0], -1); if (f[0] <= R0[1] + 0.01) g[0] = f[0]; foot(g[0], g[1], R0[0], R0[0] + P, false); }); });
      south.forEach(function (w) { bridge(runs(w[0], w[1], function (x) { return solid(x, R0[1], 0, -1, Rz.z0 - FH + 0.25, Rz.z0); }), w[0], w[1]).forEach(function (f) { footS.push(f); var g = meet(f, true, R0[1], -1); if (f[0] <= R0[0] + P + 0.01) g[0] = f[0]; if (g[1] < f[1] - 0.01) g[1] = FE >= 0 ? g[1] + FE : footEnd(g[1], R0[1], R0[1] + P); (X3222.footEnds = X3222.footEnds || []).push(+g[1].toFixed(2)); foot(g[0], g[1], R0[1], R0[1] + P, true); });   /* v17 (Fawkes, 2.06 am, row 3's slanted cut): stopped 0.05 short of the round shaft, the foot's end showed the hall face (y -0.8) through the gap at x 91.3 to 91.7 (picks-plinth.json); it runs FE (0.45, ?footend=) on into the shaft */ });
      X3222.footW = footW; X3222.footS = footS;
      /* v15 (r240-g, Fawkes's look 1.06 am; picks at the stand, pick-v14.json and pick-v14b.json): (b) the west strip is a
         2.1 m return (y -2 to 0.1, where a floor-36.4 room stands proud of x 66 at y 0.15); its courses, seen end-on from the
         lake, read as short serrated dashes, so a return under 3 m carries no courses and the south courses turn the corner
         0.38 m and stop there; (c) the course ends at the round stair shaft lay on its re-entrant facets (x 91.3 to 91.7,
         y -2.1 to -2.7), so they stop CE (0.5) m short of the line where any body meets the run, one vertical on flat wall;
         (f) the west foot had been cut back from the corner by meet's ray (a dark notch: the strip's open underside at z 34),
         so a foot starting at the shared corner keeps it, as the strips do */
      var CE = +((location.search.match(/[?&]courseend=([\d.]+)/) || [])[1] || 0.5), wShort = false;
      function cend(r, m) { return [m[0] < r[0] - 0.01 || m[0] > r[0] + 0.01 ? m[0] + CE : m[0], m[1] < r[1] - 0.01 ? m[1] - CE : m[1]]; }
      X3222.meet = [];
      west.forEach(function (w) { var c0 = w[0] <= R0[1] + 0.01, m = meet(w, false, R0[0], -1); if (c0) m[0] = w[0]; X3222.meet.push(['west', m]);
        /* v16 (r240-g row v2, the blind look at 1.30 am; picks pick-v15v2): under walls=v2 the west run reads -2 to 18, but a
           floor-36.4 room stands proud of x 66 from y -0.35 on, so only 1.65 m of the west face shows and its courses read as
           short dashed returns at the turret end. A ray 0.25 m out of the face, along the run from the corner, finds the
           first body standing in front; the shown run is what counts as short */
        var seen = m[1] - m[0];
        if (c0 && scene) [Rz.z0 + 0.5, (Rz.z0 + mz) / 2, mz - 0.5].forEach(function (z) { var o = TL(R0[0] - 0.25, w[0] + 0.02, z);
          rc.set(o, TL(R0[0] - 0.25, w[0] + 1, z).sub(o).normalize()); rc.far = seen;
          var h = rc.intersectObject(scene, true).filter(function (k) { return k.object.isMesh && k.object.visible !== false && !/^exterior-massing$/.test(k.object.parent && k.object.parent.name || ''); })[0];
          if (h) seen = Math.min(seen, h.distance + 0.02); });
        X3222.westSeen = seen;
        var short = seen < 3, ce = cend(w, m); if (short && c0) wShort = true;
        strip([R0[0], w[0], R0[0] + P, w[1]], short ? null : [R0[0] - 0.08, ce[0] - (c0 ? 0.08 : 0), R0[0] + P, ce[1]]); box('parapet', [R0[0] - 0.35, m[0] - (c0 ? 0.35 : 0), R0[0] + P, short ? w[1] : m[1]], mz, Rz.z1 - 0.3); });   /* v15b: a short return's parapet runs its whole run (to y 2): stopped at 0.1 it left the lead's dark edge bare at x 66 (pick 766,136) */
      south.forEach(function (s) { var m = meet(s, true, R0[1], -1); if (s[0] <= R0[0] + P + 0.01) m[0] = s[0]; X3222.meet.push(['south', m]);
        var ce = cend(s, m), x0 = (wShort && s[0] <= R0[0] + P + 0.01) ? R0[0] + CE : ce[0];   /* v15b: a 0.38 m return still read as hooks (blind look, 1.19 am): the courses stop CE short of the corner too */
        strip([s[0], R0[1], s[1], R0[1] + P], [x0, R0[1] - 0.08, ce[1], R0[1] + 0.3]);
        /* v15 (req 3230, the Architect, 1.22 am): the south 2 m is the founders' old lake wall with keep-wall-walk inside it
           (H18: y -1.3 to -0.6, x 76 to 86, floor +34); its face is solid with five arrow loops, 0.1 m wide, sill +34.9, 0.9 m
           high, dark slits; the white piece the r240-g pick found at y -0.9 is the walk, seen only through a loop. ?loops=0 none */
        if (!/[?&]loops=0(&|$)/.test(location.search)) [77, 79, 81, 83, 85].forEach(function (lx) { if (lx > m[0] && lx < m[1])
          quad('slit', [lx - 0.05, R0[1] - 0.12, Rz.z0 + 0.9], [lx + 0.05, R0[1] - 0.12, Rz.z0 + 0.9], [lx + 0.05, R0[1] - 0.12, Rz.z0 + 1.8], [lx - 0.05, R0[1] - 0.12, Rz.z0 + 1.8]);   /* v16: on the walk's own wall face (y -2.1), not behind it */ }); box('parapet', [m[0], R0[1] - 0.35, m[1], R0[1] + P], mz, Rz.z1 - 0.3); });
      box('roof', R0, Rz.z1 - 0.3, Rz.z1); parapetRect(R0, Rz.z1, Rz.z1 + 0.6);
    });
    /* v23 (req 3221 item 7; Fawkes 1.30 am: solid masonry, the Exterior's wall body): the Entrance Hall's north strip, model y 69 to 70,
       x 72 to 88, +10.4 to under the gate raise's flat (46.3), holds no floor of any room above the hall. Rays from outside reach it
       (eye-item7/expose-before.json: from r30-h, r60-h, r90-h, r150-h, r270-h, r300-h, r330-h at z 20.3, and r30-e, r300-e, r330-e at
       the top, z 41 to 44, a ray runs through to the far side of the castle or to sky). One box in the wall's tone, 0.02 m inside its
       four sides so no face lies in another's plane. v27: on by default after the blind look passed (Fawkes 7.30 am); ?strip=0 leaves it out. */
    /* v24 (8 Nov 2026, eye-item7/v24/method-v2.md): v23's column covered faces that were already there, 0.18 to 0.43 m nearer the camera, and the
       massing renders paler than the floor groups, so it read as a pale proud column. The real gap, by ray (expose-bands.json, bands on), is the
       top, z 40.9 to 46.3, and three 0.7 m bands, 9.7 to 10.4, 20.1 to 20.8, 25.3 to 26.0: nothing else. Each piece is one outer face (no caps, no
       ends, as bands() does), 0.01 m behind the innermost +y face beside it at the exposed x (plane-b.json), running 0.02 m into the slab at each end;
       the bands in `raise` times 0.80 (?stripk=, the floor groups render 0.78 to 0.83 of the massing at one colour), the top in `raise`. 9.7 clears
       the lancets' top at 8.8 (card 3238, whose faces stay unwalled). On by default since v27, ?strip=0 leaves it out; judged with ?bands=1. */
    if (!/[?&]strip=0/.test(location.search)) {   /* v27 (8 Nov 2026, Fawkes 7.30 am: item 7 v27 PASSED): ON by default, ?strip=0 leaves it out */
      var sk = +((/[?&]stripk=([0-9.]+)/.exec(location.search) || [])[1] || 0.8), tn = GREYS.raise;
      GREYS.stripBand = ((tn >> 16 & 255) * sk << 16) | ((tn >> 8 & 255) * sk << 8) | ((tn & 255) * sk | 0);
      /* v25 (8 Nov 2026, eye-item7/v25/result.md): the top's own k, ?topk= (default 1, the v24 tone); the one retune M5 allows is run with ?topk=1.2 */
      var tk = +((/[?&]topk=([0-9.]+)/.exec(location.search) || [])[1] || 1), cl = function (v) { return Math.min(255, Math.round(v * tk)); };
      GREYS.stripTop = (cl(tn >> 16 & 255) << 16) | (cl(tn >> 8 & 255) << 8) | cl(tn & 255);
      [['stripBand', 9.7, 10.4, 69.79, 67.9], ['stripBand', 20.1, 20.8, 69.24, 68.76], ['stripBand', 25.3, 26.0, 69.24, 67.9], ['stripTop', 40.9, 46.3, 69.54, 67.9]].forEach(function (s) {
        quad(s[0], [72.02, s[3], s[1] - 0.02], [87.98, s[3], s[1] - 0.02], [87.98, s[3], s[2] + 0.02], [72.02, s[3], s[2] + 0.02]);
        /* v26 (8 Nov 2026, Fawkes 6.38 am; eye-item7/v26/result.md): the east end face. Rays from the east slipped past the end of the single face at
           x 87.5 (z 45.6 and 41.3) into the void behind it; an end face at x 87.98 from the strip's back (y 69.0) to the piece's own plane closes it.
           A fix by cause to the geometry, not a retune of a tuning number.
           v27 (8 Nov 2026, Fawkes 7.05 am; eye-item7/v27/south.json): the r150-e ray crosses x 88 at y 68.09, south of the face's back edge (69.0), so the
           face runs back (lower y) to the next solid along x 87.98 or to y 67.9, whichever is nearer: s[4]. Measured from y 69.0 at each piece's mid height:
           the top, the 9.7 band and the 25.3 band find nothing nearer than the stair hall's wall at y 50.8 or 59.4, so 67.9; the 20.1 band starts inside a
           mesh whose south face is y 68.76, so 68.76 (the face stays inside it). */
        quad(s[0], [87.98, s[4], s[1] - 0.02], [87.98, s[3], s[1] - 0.02], [87.98, s[3], s[2] + 0.02], [87.98, s[4], s[2] + 0.02]); });
    }
    if (x3222) (M.rooms || []).forEach(function (r) {
      if (!r.corbel && !r.cap) return;
      var c = r.shape && r.shape.circle; if (!c) return;
      var fz = roomFloor(M, r), top = fz + (r.ceiling - r.floor), R = r.corbel ? r.corbel.r : r.cap.r;
      if (r.corbel) {
        var z0 = r.corbel.z0, n = 3, h = (fz - z0) / n;
        /* each course its own ledge (rework: walls alone read as one taper): its soffit and top as rings, in the parapet tone */
        for (var i = 0; i < n; i++) {
          var ri = R * (0.45 + 0.55 * (i + 1) / n), rp = i ? R * (0.45 + 0.55 * i / n) : 0, zb = z0 + i * h;
          drum('parapet', c, ri, zb, zb + h, 24);
          cap('parapet', circ(c, ri, 24), rp ? [circ(c, rp, 24)] : null, zb);
        }
        drum('raise', c, R - 0.06, fz, top, 48);   /* v15: in the wall's own tone: the pale filler showed through the joints of the room's ring wall as vertical streaks (pick at 790,110: the wall at 64.56, the filler 0.06 behind) */   /* v14: just inside the room's own outer wall (r 1.4 + 0.5 = 1.9 = R): drawn on it, the two z-fought into vertical streaks (blind look, r240-g) */
      }
      if (r.cap && r.cap.kind === 'bell') cone(c, r.cap.r + 0.2, r.cap.z0, r.cap.ridge, 24);
    });
    /* the ground */
    var lake = SITE.filter(function (s) { return s.id === 'lake'; })[0], LR = (M.grounds || []).filter(function (g) { return g.id === 'lake'; })[0],
        LO = LR && LR.level_m != null ? +LR.level_m : -82;   /* v13 (Fawkes, 0.37 am): the loch from the model's lake row, -82 since req 3025; it was a fixed -46 (as the Architect's sections tool, 41323812e) */
    var sq = [[80 - 800, -800], [80 + 800, -800], [80 + 800, 800], [80 - 800, 800]];
    cap('ground', sq, lake ? [lake.poly] : null, -20); wallRing('rock', sq, LO, -20);
    if (lake) { wallRing('rock', lake.poly, LO, -20); cap('water', lake.poly, null, LO); }
    var pl = [-30, -6, 190, 110]; cap('ground', rectPts(pl), null, 0); wallRing('rock', rectPts(pl), LO, 0);
    /* req 3227 (Architect, 7 November 2026): a low place standing beyond the plateau's lake face showed its underside from the
       lake (P36, r240-g: a ray-pick at Exterior's station hits the -5.2 floor's slab at x 129 to 161 out to y -12; the
       Architect's hits shell-grotto, round under the south-west drum, to y -7). The rock carries them: under every built place
       at or below the ground with any corner outside the plateau, a rock prism on its plan from the lake bed to its floor. */
    var rocked = 0, noRock = ((/[?&]norock=([^&]*)/.exec(location.search) || [])[1] || '').split(',');
    function bbox(P2) { var r = [Infinity, Infinity, -Infinity, -Infinity]; P2.forEach(function (p) { r[0] = Math.min(r[0], p[0]); r[1] = Math.min(r[1], p[1]); r[2] = Math.max(r[2], p[0]); r[3] = Math.max(r[3], p[1]); }); return r; }
    builtPlaces.forEach(function (q) {
      if (noRock.indexOf(q.id) >= 0) return;
      if (!q.poly || q.poly.length < 3 || q.floor == null || q.floor > 0.5 || q.floor <= LO + 0.1) return;
      /* only a place crossing the lake face (the greenhouses stand on the grounds' own prisms), and only the lowest place at
         its spot: a first run put rock under lake-tower-g (floor 0) that swallowed lake-tower-b (-5.2) and its windows */
      if (!q.poly.some(function (p) { return p[1] < pl[1] && p[0] > pl[0] && p[0] < pl[2]; })) return;
      var qb = bbox(q.poly);
      /* the rock extends the cliff, it builds no island: a place standing wholly clear of the face (slytherin-common-room,
         5 m out at y -11, 41 m above the water, named "under the lake") got a bluff that hid the cliff's lit stack behind it
         from the lake (Exterior, 8 November 2026); its placement is the model's, raised to the Architect */
      if (qb[3] < pl[1] - 1.5) return;
      if (builtPlaces.some(function (o) { if (o === q || !o.poly || o.floor == null || o.floor >= q.floor - 0.1 || o.floor <= LO + 0.1) return false;
        var ob = bbox(o.poly); return Math.min(qb[2], ob[2]) - Math.max(qb[0], ob[0]) > 0.3 && Math.min(qb[3], ob[3]) - Math.max(qb[1], ob[1]) > 0.3; })) return;
      wallRing('rock', q.poly, LO, q.floor - 0.02); cap('rock', q.poly, null, q.floor - 0.02); rocked++;
      (window.lumosExteriorRocked = window.lumosExteriorRocked || []).push([q.id, +q.floor.toFixed(2), q.poly.map(function (p) { return [+p[0].toFixed(1), +p[1].toFixed(1)]; })]);
    });
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
  var closeOn = /(^|[?&])close=[12](&|$)/.test(location.search);   /* v29 (req 3223, Godric's 2: close each gap in plain stone, no ledge; method eye-close-3223/v1): runs bands() with course 0 (nothing proud), the wall's own tone, the run merge, round places never banded; bands=1 is untouched. Off until Fawkes passes it */
  var closeDeckOn = /(^|[?&])closedeck=1(&|$)/.test(location.search);   /* v29 (Amendment 4, proposed, Fawkes's word pending): with close=2 only, a plain horizontal deck at z1 from the piece plane back to the upper face where the upper storey is set back (upProud above 0.02), the piece's tone */
  var close2 = /(^|[?&])close=2(&|$)/.test(location.search);   /* v29 (Amendment 3, Fawkes's yes 8 Nov 2026 10.11 pm, provisional on Godric): close=1 stays as built for the compare. close=2 skips a step where a face stands in front and reaches the slit's top (probes at the quarter, mid and top heights, any offset to 3 m), skips a step inside a tower's circle plus 0.1 m, and takes the tone of the wall below, never the lit pier's */
  var bandRecess = (function () { var m = location.search.match(/[?&]bandrecess=([0-9.]+)/); return m ? +m[1] : 0.01; })();   /* req 3215 v5 trial: how far the band stands behind the wall face below */
  var bandCourse = (function () { var m = location.search.match(/[?&]bandcourse=([0-9.]+)/); return m ? +m[1] : (closeOn ? 0 : 0.15); })();   /* req 3215 v5 trial: a string course this many metres proud of the wall below, at each band's foot */
  var bandTint = (function () { var m = location.search.match(/[?&]bandtint=([0-9.]+)/); return m ? +m[1] : 1.3; })();
  var bandCourseH = (function () { var m = location.search.match(/[?&]bandcourseh=([0-9.]+)/); return m ? +m[1] : 0.35; })();
  var bandFill = /(^|[?&])bandfill=1(&|$)/.test(location.search);   /* req 3226 (Architect, from 3221): with bands=1, a room above up to 1.0 m
     inboard counts as the floor above; a gap taller than MAXGAP is filled to the floor above only where no real face stands
     anywhere in it; and every built place with no place over some of it gets a lid. Off by default until Fawkes's blind look */
  var bandWide = !/[?&]bandwide=0/.test(location.search);   /* v28 (req 3221 via 3226, the Architect's plan docs/architect/absent-storeys-3221.md): the outside test also looks past the whole wall (t + 0.1, t at most 1.5); round places stay in the match lists (never banded); a gap row says `below` when the ceiling is at or under z 0. ?bandwide=0 is the old check */
  var bandDebug = /(^|[?&])banddebug=1(&|$)/.test(location.search);   /* req 3215 v5: every band piece flat unlit red, to see where the bands stand */
  function inPoly(pts, x, y) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var pi = pts[i], pj = pts[j];
      if ((pi[1] > y) !== (pj[1] > y) && x < (pj[0] - pi[0]) * (y - pi[1]) / (pj[1] - pi[1]) + pi[0]) c = !c;
    }
    return c;
  }
  function bands(TL, scene, towers, rooms) {
    /* Refit 7 Nov 10.30 pm (req 3215 failed the blind look): fill only where no wall face stands. A ray from outside at the
       slit's mid height through each 1 m step finds any face near the wall plane (a taller wall, a ledge): none, and the
       step is open. The piece is one outer face only, set back 0.01 m from the innermost face found just below the slit (so
       never proud of a ledge), in that face's own material colour; no ends, no overlap into the wall, so no joint marks. */
    var roundSkipped = 0, roundIds = [], seen = {}, P = [], probes = 0, CELL = 4, grid = {}, gridS = {}, tri9 = [], tcol = [], stamp = [], qn = 0;
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
          var slopedT = Math.abs(nn.y) > 0.5; if (slopedT && !(bandFill && Math.abs(nn.y) < 0.94)) continue;   /* req 3226 r30-h: a sloped cap (30 to 70 degrees off vertical) goes in its own grid, read only by the fill's walled test */
          var id = tri9.length / 9; tri9.push(va.x, va.y, va.z, vb.x, vb.y, vb.z, vc.x, vc.y, vc.z); tcol.push(col);
          var GR = slopedT ? gridS : grid;
          var cx0 = Math.floor(Math.min(va.x, vb.x, vc.x) / CELL), cx1 = Math.floor(Math.max(va.x, vb.x, vc.x) / CELL),
              cz0 = Math.floor(Math.min(va.z, vb.z, vc.z) / CELL), cz1 = Math.floor(Math.max(va.z, vb.z, vc.z) / CELL);
          if ((cx1 - cx0 + 1) * (cz1 - cz0 + 1) > 400) continue;
          for (var cx = cx0; cx <= cx1; cx++) for (var cz = cz0; cz <= cz1; cz++) { var key = cx + ',' + cz; (GR[key] || (GR[key] = [])).push(id); }
        }
      });
    })();
    var gridB = grid, S0v = new THREE.Vector3(), S1v = new THREE.Vector3(), dv = new THREE.Vector3();
    function probe(px, py, nx, ny, z, gsel) {
      var grid = gsel || gridB;
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
      var isRound = false;
      if (q.poly.length >= 8) { var mx = 0, my = 0; q.poly.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= q.poly.length; my /= q.poly.length;   /* v6: a round place drawn as a many-sided ring is not banded (r270's drum foot showed the facets as dashes) */
        var rr = q.poly.map(function (p) { return Math.hypot(p[0] - mx, p[1] - my); }), rm = rr.reduce(function (u, v) { return u + v; }, 0) / rr.length;
        if (rr.every(function (v) { return Math.abs(v - rm) < 0.06 * rm; })) { roundSkipped++; roundIds.push({ id: q.id, floor: +q.floor.toFixed(2), cx: +mx.toFixed(2), cy: +my.toFixed(2), r: +rm.toFixed(2) }); if (!bandWide) return; isRound = true; } }
      var k = q.id + '@' + q.floor.toFixed(2); if (seen[k]) return; seen[k] = 1;
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, ar = 0;
      q.poly.forEach(function (p, i) { var n = q.poly[(i + 1) % q.poly.length]; ar += p[0] * n[1] - n[0] * p[1];
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      P.push({ q: q, poly: ar < 0 ? q.poly.slice().reverse() : q.poly, cw: ar < 0, b: [x0, y0, x1, y1], f: q.floor, c: q.ceiling, round: isRound });
    });
    function covers(R, x, y) { return x >= R.b[0] && x <= R.b[2] && y >= R.b[1] && y <= R.b[3] && inPoly(R.poly, x, y); }
    var tones = {}, later = [], gaps = {}, MAXGAP = 1.25, STEP = 0.25, wideKills = {};
    function lum(h) { return ((h >> 16 & 255) * 0.3 + (h >> 8 & 255) * 0.59 + (h & 255) * 0.11) / 255; }
    var T = {}, pieces = 0, stretches = 0, tall = 0, faced = 0, bare = 0, fillTall = 0, fillWalled = 0, fillSloped = 0, fillSolid = 0, lids = [], covered = 0, towerKills = 0, partFaced = 0, decks = 0, extDropped = 0;
    var circRooms = (rooms || []).filter(function (r) { return r && r.shape && r.shape.circle && r.shape.r; });   /* v29 (Amendment 3 correction, round 1 of v2): the 58 rooms with shape.circle that neither M.towers nor roundIds hold (oriel-bay, tally-room and others) */
    function inTower(x, y) {   /* close=2: the model's tower circles, the rooms' own shape.circle, and the round places (roundIds) plus 0.1 m (M7 ii by construction, the same circle set make-checks.py tests) */
      for (var ti = 0; ti < (towers || []).length; ti++) { var tw0 = towers[ti]; if (tw0 && tw0.c && Math.hypot(x - tw0.c[0], y - tw0.c[1]) <= tw0.r + 0.1) return true; }
      for (var ci = 0; ci < circRooms.length; ci++) { var cs = circRooms[ci].shape; if (Math.hypot(x - cs.circle[0], y - cs.circle[1]) <= cs.r + 0.1) return true; }
      for (var ri2 = 0; ri2 < roundIds.length; ri2++) { var rd = roundIds[ri2]; if (Math.hypot(x - rd.cx, y - rd.cy) <= rd.r + 0.1) return true; }
      return false; }
    /* req 3221 item 3 (the Architect, ledger 374, 8 November 2026): these gaps are solid wall, no room to add (mirror-passage-b at
       the Great Hall's north and cross walls, ice-house-way in the West Tower's 3.2 m drum wall, sw-turret-passage in the south-west
       drum's wall): the fill draws them whole even where a face stands part way up. drum-back-store-b gets none (the Gryffindor
       drum's wall, a curve length; round places are not banded). second-floor-corridor, defence-passage and stone-bay are seams
       within 0.5 m that wait on this fill's re-run */
    var SOLIDWALL = ['mirror-passage-b', 'ice-house-way', 'sw-turret-passage'];
    function quad(col, a, b, c, d) { var arr = T[col] || (T[col] = []); [a, b, c, a, c, d].forEach(function (p) { var v = TL(p[0], p[1], p[2]); arr.push(v.x, v.y, v.z); }); }
    P.forEach(function (Q) {
      if (Q.round) return;   /* v28: a round place is a match for the others, not banded itself (its drum has the filler) */
      var E = Q.poly, top = Q.c, n = E.length;
      for (var i = 0; i < n; i++) {
        var a = E[i], b = E[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
        if (L < 0.3) continue;
        var ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
        var wl = Q.q.walls, t = Array.isArray(wl) ? wl[Q.cw ? (n - 1 - i - 1 + n) % n : i] : (wl && typeof wl === 'object' ? wl[['south', 'east', 'north', 'west'][i]] : null);
        t = t || Q.q.wall || 0.5;
        var steps = Math.max(1, Math.ceil(L / STEP)), runs = [], cur = null;
        for (var s = 0; s < steps; s++) {
          var m = (s + 0.5) / steps * L, px = a[0] + ux * m, py = a[1] + uy * m, ox = px + nx * 0.1, oy = py + ny * 0.1, ext = true, up = Infinity,
              tw = Math.min(t, 1.5) + 0.1, wx = px + nx * tw, wy = py + ny * tw;
          for (var r = 0; r < P.length; r++) {
            var R = P[r]; if (R === Q) continue;
            if (R.f < top - 0.1 && R.c > Q.f + 0.1 && (covers(R, ox, oy) || (bandWide && covers(R, wx, wy)))) { if (bandWide && !covers(R, ox, oy)) { var wk = Q.q.id + ' <- ' + R.q.id; wideKills[wk] = (wideKills[wk] || 0) + 1; } ext = false; break; }
            if (R.f >= top - 0.05 && R.f < up && (covers(R, px - nx * 0.1, py - ny * 0.1) || covers(R, ox, oy) || covers(R, px + nx * t / 2, py + ny * t / 2) || (bandFill && covers(R, px - nx * 1.0, py - ny * 1.0)))) up = R.f;
          }
          var z1 = ext && up < Infinity && up - top > 0.02 ? up : null, off = t, col = null, dbg = null;
          if (close2 && z1 != null && (inTower(px, py) || inTower(px + nx * Math.min(t, 1.5), py + ny * Math.min(t, 1.5)))) { z1 = null; towerKills++; }   /* Amendment 3 item 2: no piece in a tower's circle plus 0.1 m (the edge point and the point one wall thickness out) */
          if (bandFill && z1 != null && z1 - top > MAXGAP) {   /* req 3226: the whole gap, but only where no face stands at any height in it (v2 covered real storeys and windows as flat slabs) */
            var walledAny = false;
            for (var hz = top + 0.2; hz < z1 - 0.1 && !walledAny; hz += 0.5) { var hh = probe(px, py, nx, ny, hz), hs = probe(px, py, nx, ny, hz, gridS); if ((hh && hh.off > -0.1 && hh.off < t + 0.4) || (hs && hs.off > -0.1 && hs.off < t + 0.4)) { walledAny = true; if (hs && !(hh && hh.off > -0.1 && hh.off < t + 0.4)) fillSloped++; } }
            if (walledAny && SOLIDWALL.indexOf(Q.q.id) >= 0) { walledAny = false; fillSolid++; }
            if (walledAny) { z1 = null; fillWalled++; } else fillTall++;
          }
          if (z1 != null && z1 - top > MAXGAP) { tall++; var hg = probe(px, py, nx, ny, top + 0.35), walled = hg && hg.off > -0.1 && hg.off < t + 0.4; if (!walled) { var gk = Q.q.id + '@' + Q.f.toFixed(2), g = gaps[gk] || (gaps[gk] = { id: Q.q.id, floor: +Q.f.toFixed(2), ceiling: +top.toFixed(2), up: +z1.toFixed(2), gap: +(z1 - top).toFixed(2), metres: 0, below: top <= 0, at: [] }); g.metres += +(L / steps).toFixed(2); if (g.at.length < 6) g.at.push([+px.toFixed(2), +py.toFixed(2)]); g.gap = Math.max(g.gap, +(z1 - top).toFixed(2)); } z1 = null; }   /* req 3344 Part B (the Architect, 9 November 2026): each gap keeps up to six of its probe points (at), for the judge; a mid-gap probe as well changed no gap on floor 1 (the slab-zone cause refuted, shell-gate-3344.md). A slab gap is 0.7 m; a taller gap is absent storeys, the Architect's (req 3191), not a band */
          if (z1 != null) {
            var hm = probe(px, py, nx, ny, (top + z1) / 2), hq = probe(px, py, nx, ny, top + Math.min(0.2, (z1 - top) / 2));
            dbg = { hm: hm ? +hm.off.toFixed(2) : null, hq: hq ? +hq.off.toFixed(2) : null };
            var hu = null, isFaced;
            if (close2) {   /* Amendment 3 item 1: a face at the quarter or mid height at ANY offset to 3 m, and a face still there just under the slit's top (the wall reaches z1): the slit is covered, no piece */
              hu = probe(px, py, nx, ny, z1 - 0.03); dbg.hu = hu ? +hu.off.toFixed(2) : null;
              isFaced = ((hm && hm.off > -0.1) || (hq && hq.off > -0.1)) && hu && hu.off > -0.1;
            } else isFaced = (hm && hm.off > -0.1 && hm.off < t + 0.4) || (hq && hq.off > -0.1 && hq.off < t + 0.4);
            if (isFaced) { z1 = null; faced++; if (close2) covered++; }
            else {
              if (close2 && ((hm && hm.off > -0.1) || (hq && hq.off > -0.1)) && !(hu && hu.off > -0.1)) partFaced++;   /* v29: a face at the mid or quarter probe but none at z1 - 0.03 (open above a wall behind it): the piece is still drawn; counted since covered equals faced by construction */
              var lo0 = [probe(px, py, nx, ny, top - 0.15), probe(px, py, nx, ny, top - 0.7)], lo = lo0.filter(function (h) { return h && h.off > 0.05 && h.off < t + 0.4; });
              if (closeOn) dbg.lo = lo.map(function (h) { return +h.off.toFixed(2); });   /* v29: the offsets the piece was set from (diagnostic only) */
              if (lo.length) { lo.sort(function (p1, p2) { return p1.off - p2.off; }); off = lo[0].off;
                if (close2) {   /* Amendment 3 item 3: the commonest of the two hits' tones, the innermost (the wall, not a pier) on a tie; no lit filter */
                  col = lo[0].col;   /* of at most two hits the shared tone is lo[0]'s too; on a tie the innermost wins */
                  if (col != null) tones[col] = (tones[col] || 0) + 1;
                } else {
                  var lit = lo.filter(function (h) { return h.col != null && lum(h.col) >= 0.3; });
                  col = lit.length ? lit[0].col : null; if (col != null) tones[col] = (tones[col] || 0) + 1; }
              }
              else {
                bare++; if (closeOn) dbg.bare = 1;
                if (close2) {   /* a bare piece takes the tone of the face the probe found (mid, then quarter, then the nearest below), not the modal grey */
                  var fb = hm || hq || lo0.filter(function (h) { return h && h.off > 0.05; }).sort(function (p1, p2) { return p1.off - p2.off; })[0] || null;
                  col = fb && fb.col != null ? fb.col : null; dbg.fbOff = fb ? +fb.off.toFixed(2) : null; }
              }
              if (close2 && inTower(px + nx * off, py + ny * off)) { z1 = null; towerKills++; }   /* the piece's own plane inside a tower circle plus 0.1 m */
            }
          }
          if (z1 != null && cur && Math.abs(cur.z1 - z1) < 0.01 && Math.abs(cur.off - off) < 0.02 && cur.col === col) cur.s1 = (s + 1) / steps * L;
          else if (z1 != null) runs.push(cur = { s0: s / steps * L, s1: (s + 1) / steps * L, z1: z1, off: off, col: col, dbg: dbg });
          else cur = null;
        }
        /* v21 (req 3232 row 3, picks eye-3232/v22 bands-log.json: the two dark notches where the band breaks at r30-h, model x 123.5
           to 124.0 and 121.3 to 121.5 on y 72.8, classroom-eleven's three runs with 0.5 m holes between them): neighbouring runs of
           one edge with the same top, depth and tone, a gap of 0.55 m or less apart, are one run. ?bandmerge=0 leaves them apart. */
        if (!/[?&]bandmerge=0/.test(location.search)) for (var ri = runs.length - 1; ri > 0; ri--) {
          var P0 = runs[ri - 1], P1 = runs[ri];
          if (P1.s0 - P0.s1 <= 0.55 && Math.abs(P0.z1 - P1.z1) < 0.01 && Math.abs(P0.off - P1.off) < 0.02 && P0.col === P1.col) { P0.s1 = P1.s1; runs.splice(ri, 1); } }
        runs.forEach(function (R) {
          stretches++;
          var e0 = R.s0 < 0.01 ? t : 0, e1 = R.s1 > L - 0.01 ? t : 0;
          if (close2 && e1 > 0) {   /* E1' (eye-close-3223 Amendment 7c, licensed by its dump): the end extension is drawn only where the page's own close=2 isFaced reads false at its midpoint, s1 + t / 2, the same three probes the body steps make; where a face already stands at the plane the extension is dropped */
            var xm = R.s1 + t / 2, xpx = a[0] + ux * xm, xpy = a[1] + uy * xm, xz1 = R.z1,
                xhm = probe(xpx, xpy, nx, ny, (top + xz1) / 2), xhq = probe(xpx, xpy, nx, ny, top + Math.min(0.2, (xz1 - top) / 2)), xhu = probe(xpx, xpy, nx, ny, xz1 - 0.03);
            if (((xhm && xhm.off > -0.1) || (xhq && xhq.off > -0.1)) && xhu && xhu.off > -0.1) { e1 = 0; extDropped++; }
          }
          var A = [a[0] + ux * (R.s0 - e0 * 0) + nx * (R.off - bandRecess), a[1] + uy * R.s0 + ny * (R.off - bandRecess)], B = [a[0] + ux * (R.s1 + e1) + nx * (R.off - bandRecess), a[1] + uy * (R.s1 + e1) + ny * (R.off - bandRecess)];
          var gq = null;
          if (closeOn) {   /* v29 (method eye-close-3223 Amendment 2 item 3): the piece plane against the faces round it, probed apart from the ones that built it, at 10, 50 and 90 percent of the run; positive is outward */
            var gmax = -Infinity, gmin = Infinity, umax = -Infinity, plane = R.off - bandRecess, okF = function (h) { return h && h.off > 0.05 && h.off < t + 0.4; };
            [0.1, 0.5, 0.9].forEach(function (fr) {
              var sm = R.s0 + (R.s1 - R.s0) * fr, qx = a[0] + ux * sm, qy = a[1] + uy * sm,
                  lw = [probe(qx, qy, nx, ny, top - 0.30), probe(qx, qy, nx, ny, top - 0.45)].filter(okF),
                  hi = [probe(qx, qy, nx, ny, R.z1 + 0.15), probe(qx, qy, nx, ny, R.z1 + 0.30)].filter(okF);
              if (lw.length) { var gg = plane - Math.max.apply(null, lw.map(function (h) { return h.off; })); gmax = Math.max(gmax, gg); gmin = Math.min(gmin, gg); }
              if (hi.length) umax = Math.max(umax, plane - Math.max.apply(null, hi.map(function (h) { return h.off; })));
            });
            gq = { g1: gmax > -Infinity ? +gmax.toFixed(3) : null, gv: gmin < Infinity ? +gmin.toFixed(3) : null, upProud: umax > -Infinity ? +umax.toFixed(3) : null };
          }
          later.push({ col: R.col, A: A, B: B, ex: nx, ey: ny, z0: top, z1: R.z1, id: Q.q.id, fl: Q.f, edge: i, len: +(R.s1 - R.s0).toFixed(1), at: [+A[0].toFixed(1), +A[1].toFixed(1)], dbg: R.dbg, g: gq, rr: { ax: a[0], ay: a[1], ux: ux, uy: uy, L: L, t: t, s0: R.s0, s1: R.s1, off: R.off } });   /* rr: read by the ?probehook=1 dump only (eye-close-3223 Amendment 7c), in memory, never drawn or logged */
        });
      }
    });
    /* req 3226 (3): only the Architect's 26 rows (docs/architect/r3221/out.json, classes c-ends and d-underground, the true
       ends, and unbuilt-notInYear, the room above built only in a later book; east-courtyard left out, an open court): a lid
       wherever no built place stands over part of them. A first run lidding every place so open closed the courts (203 lids) */
    var LIDS = ["stone-last-chamber", "stone-troll-room", "stone-potions-room", "potions-dungeon", "cliff-vault", "old-textbooks-store", "teachers-office-2-north", "east-lift-shaft-2", "right-hand-corridor-3", "tapestry-passage-3-west", "lamp-candle-cupboard-3", "defence-store", "keep-east-stairwell", "east-wing-corridor-4", "west-wing-corridor-4", "landscape-painting-corridor-4", "revision-rooms-4", "disused-classroom-4-east", "elves-linen-room-4-east", "staff-bedroom-4-east", "fourth-floor-washroom", "runes-teachers-study-4", "tudor-bay-4-cushion-store", "dormitory-linen-store-5", "true-hide-5", "decoy-cupboard-5"];
    if (bandFill) P.forEach(function (Q) {
      if (LIDS.indexOf(Q.q.id) < 0) return;
      var b = Q.b, open = 0, all = 0;
      for (var gx = b[0] + 0.5; gx < b[2]; gx += 1) for (var gy = b[1] + 0.5; gy < b[3]; gy += 1) {
        if (!inPoly(Q.poly, gx, gy)) continue; all++;
        var cov = false; for (var r = 0; r < P.length && !cov; r++) { var R = P[r]; if (R !== Q && R.f >= Q.c - 0.05 && covers(R, gx, gy)) cov = true; }
        if (!cov) open++;
      }
      if (open) lids.push({ Q: Q, open: open, all: all });
    });
    var modal = 0xa39d92, mc = 0; Object.keys(tones).forEach(function (c) { if (tones[c] > mc) { mc = tones[c]; modal = +c; } });
    function paler(h) { var k = bandTint; return (Math.min(255, Math.round((h >> 16 & 255) * k)) << 16) | (Math.min(255, Math.round((h >> 8 & 255) * k)) << 8) | Math.min(255, Math.round((h & 255) * k)); }   /* the course in dressed stone, paler than the wall */
    later.forEach(function (w) { quad(w.col != null ? w.col : modal, [w.A[0], w.A[1], w.z0], [w.B[0], w.B[1], w.z0], [w.B[0], w.B[1], w.z1], [w.A[0], w.A[1], w.z1]); pieces++;
      if (close2 && closeDeckOn && w.g && w.g.upProud != null && w.g.upProud > 0.02) {   /* Amendment 4: the lower wall's own top where the upper storey steps back: a horizontal quad at z1 from the piece plane inboard by upProud (the run's own normal), in the piece's tone */
        var dcol = w.col != null ? w.col : modal, du = w.g.upProud;
        quad(dcol, [w.A[0], w.A[1], w.z1], [w.B[0], w.B[1], w.z1], [w.B[0] - w.ex * du, w.B[1] - w.ey * du, w.z1], [w.A[0] - w.ex * du, w.A[1] - w.ey * du, w.z1]); decks++; }
      if (bandCourse > 0) { var cc = paler(w.col != null ? w.col : modal), H = Math.min(bandCourseH, (w.z1 - w.z0) / 2), o = bandRecess + bandCourse, ex = w.ex, ey = w.ey,
          A2 = [w.A[0] + ex * o, w.A[1] + ey * o], B2 = [w.B[0] + ex * o, w.B[1] + ey * o];   /* the course: a front, a lit top and a shaded underside; open ends, bandCourseH tall at most */
        quad(cc, [A2[0], A2[1], w.z0], [B2[0], B2[1], w.z0], [B2[0], B2[1], w.z0 + H], [A2[0], A2[1], w.z0 + H]);
        quad(cc, [A2[0], A2[1], w.z0 + H], [B2[0], B2[1], w.z0 + H], [w.B[0], w.B[1], w.z0 + H], [w.A[0], w.A[1], w.z0 + H]);
        quad(cc, [w.A[0], w.A[1], w.z0], [w.B[0], w.B[1], w.z0], [B2[0], B2[1], w.z0], [A2[0], A2[1], w.z0]); }
    });
    lids.forEach(function (Ld) {   /* a 0.3 m lid on the place's own line at its ceiling: faces round, lead on top */
      var E = Ld.Q.poly, z0 = Ld.Q.c, zt = z0 + 0.3, n = E.length, lc = bandDebug ? 0xff0000 : modal;
      for (var i = 0; i < n; i++) { var a = E[i], b = E[(i + 1) % n]; quad(lc, [a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], zt], [a[0], a[1], zt]); }
      var c2 = E.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), fs = THREE.ShapeUtils.triangulateShape(c2, []), arr = T[bandDebug ? 0xff0000 : GREYS.roof] || (T[bandDebug ? 0xff0000 : GREYS.roof] = []);
      fs.forEach(function (f) { f.forEach(function (j) { var v = TL(E[j][0], E[j][1], zt); arr.push(v.x, v.y, v.z); }); });
    });
    var G = new THREE.Group(), tris = 0; G.name = 'exterior-bands';
    Object.keys(T).forEach(function (c) {
      var bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(T[c], 3));
      bg.computeVertexNormals(); bg.computeBoundingSphere(); tris += T[c].length / 9;
      G.add(new THREE.Mesh(bg, bandDebug ? new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ color: +c, side: THREE.DoubleSide })));
    });
    var log = later.map(function (w) { var o = { id: w.id, floor: +w.fl.toFixed(2), edge: w.edge, len: w.len, at: w.at, from: [+w.A[0].toFixed(2), +w.A[1].toFixed(2)], to: [+w.B[0].toFixed(2), +w.B[1].toFixed(2)], z0: +w.z0.toFixed(2), z1: +w.z1.toFixed(2), h: +(w.z1 - w.z0).toFixed(2), probe: w.dbg };
      if (w.g) { o.g1 = w.g.g1; o.gv = w.g.gv; o.upProud = w.g.upProud; } return o; });
    if (/[?&]probehook=1/.test(location.search)) window.__extBandsProbe = { probe: probe, later: later };   /* Amendment 7c: exposes the page's own probe to the step-level dump; nothing else reads it, no output changes */
    return { gaps: Object.keys(gaps).map(function (k) { return gaps[k]; }).sort(function (p1, p2) { return p2.gap - p1.gap; }), log: log, group: G, pieces: pieces, tall: tall, faced: faced, covered: covered, towerKills: towerKills, partFaced: partFaced, extDropped: extDropped, decks: decks, bare: bare, probes: probes, places: P.length, roundSkipped: roundSkipped, roundIds: roundIds, wideKills: wideKills, tris: tris,
      fill: bandFill ? { tallFilled: fillTall, tallWalled: fillWalled, solid: fillSolid, lids: lids.map(function (L) { return { id: L.Q.q.id, floor: +L.Q.f.toFixed(2), ceiling: +L.Q.c.toFixed(2), open: L.open, of: L.all }; }) } : null };
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
    var bandsStep = function () {
      var s0 = performance.now(), bd; try { bd = bands(TL, gb.scene, M.towers, M.rooms); } catch (e) { X.skipped.push('bands: ' + String(e && e.stack || e).slice(0, 300)); return; }
      gb.scene.add(bd.group);   /* close=2 runs this step AFTER the massing (Amendment 5), so the massing's casts (the eaves fit, the strip, the raised foot) never read the pieces (in close=1 they did: pair14's dark patch at r90-e shows in c as in a, not red, eye-close-3223/v2/pair14-look.py) and the probe grid below holds the massing's own walls */
      X.bands = { gaps: bd.gaps, log: bd.log, pieces: bd.pieces, tris: Math.round(bd.tris), tallSkipped: bd.tall, roundSkipped: bd.roundSkipped, roundIds: bd.roundIds, close: closeOn, close2: close2, faced: bd.faced, covered: bd.covered, towerKills: bd.towerKills, partFaced: bd.partFaced, extDropped: bd.extDropped, decks: bd.decks, closeDeck: closeDeckOn, bare: bd.bare, probes: bd.probes, places: bd.places, wideKills: bd.wideKills, fill: bd.fill, ms: Math.round(performance.now() - s0) };
    };
    var massingStep = function () {
      var s0 = performance.now(), m = massing(TL, gb.scene); gb.scene.add(m.group);
      X.massing = { tris: Math.round(m.tris), ms: Math.round(performance.now() - s0) };
    };
    if (close2) { steps.push(massingStep); if (bandsOn || closeOn) steps.push(bandsStep); }   /* Amendment 5 (req 3223): the bands step reads the scene when it runs, so with close=2 it runs after the massing; close=1 and bands=1 keep the old order */
    else { if (bandsOn || closeOn) steps.push(bandsStep); steps.push(massingStep); }
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
    /* req 3222 rework (7 November 2026): shell.html's floor bounce (req 3199, an upward warm hemisphere at 1.8 by day, for
       undersides inside) lit every outer face and doubled the outside's brightness from the 4.20 pm eye pass (r120-e mean 45
       to 80; with ?bounce=0, 45 again). Outdoors the ground is grass, not a lit floor: the bounce is off here unless ?bounce= is given. */
    if (!/(^|[?&])bounce=/.test(location.search)) gb.scene.traverse(function (o) {
      if (o.isHemisphereLight && o.color && o.color.getHex() === 0 && o.groundColor && o.groundColor.getHex() === 0x9a8466) o.intensity = 0;
    });
    setTimeout(function () { run(gb); }, 0);
  }, 100);
})();
