function initWorld3D(playerData) {
  'use strict';

  // ============================================================
  // ENGINE + SCENE
  // ============================================================
  var canvas = document.getElementById('world3d-c');
  var engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true
  });
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2));

  var scene = new BABYLON.Scene(engine);
  scene.gravity             = new BABYLON.Vector3(0, -28, 0);
  scene.collisionsEnabled   = true;
  scene.fogMode             = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity          = 0.004;
  scene.fogColor            = new BABYLON.Color3(0.55, 0.72, 0.88);
  scene.clearColor          = new BABYLON.Color4(0.55, 0.72, 0.88, 1);
  scene.ambientColor        = new BABYLON.Color3(0.2, 0.2, 0.2);

  // ============================================================
  // CAMERA  (first-person)
  // ============================================================
  var camera = new BABYLON.UniversalCamera('player',
    new BABYLON.Vector3(-66, 1.75, -62), scene);
  camera.setTarget(new BABYLON.Vector3(-71, 1.75, -62));
  camera.attachControl(canvas, true);
  camera.speed            = 0.22;
  camera.angularSensibility = 420;
  camera.inertia          = 0.05;
  camera.checkCollisions  = true;
  camera.applyGravity     = true;
  camera.ellipsoid        = new BABYLON.Vector3(0.32, 0.88, 0.32);
  camera.ellipsoidOffset  = new BABYLON.Vector3(0, 0.88, 0);
  camera.minZ             = 0.05;
  camera.fov              = 1.2;
  camera.keysUp    = [87]; // W
  camera.keysDown  = [83]; // S
  camera.keysLeft  = [65]; // A
  camera.keysRight = [68]; // D

  // ============================================================
  // LIGHTS
  // ============================================================
  var hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity    = 0.75;
  hemi.diffuse      = new BABYLON.Color3(1, 0.97, 0.88);
  hemi.groundColor  = new BABYLON.Color3(0.28, 0.38, 0.22);
  hemi.specular     = new BABYLON.Color3(0, 0, 0);

  var sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.5, -1.4, -0.4), scene);
  sun.position  = new BABYLON.Vector3(80, 160, 60);
  sun.intensity = 1.8;
  sun.diffuse   = new BABYLON.Color3(1, 0.96, 0.82);

  var shadowGen = new BABYLON.ShadowGenerator(2048, sun);
  shadowGen.useBlurExponentialShadowMap = true;
  shadowGen.blurKernel = 8;

  var fill = new BABYLON.DirectionalLight('fill', new BABYLON.Vector3(0.6, -0.5, 0.5), scene);
  fill.intensity = 0.4;
  fill.diffuse   = new BABYLON.Color3(0.7, 0.82, 1);

  // ============================================================
  // POINTER LOCK
  // ============================================================
  var locked = false;
  canvas.addEventListener('click', function() {
    if (!locked && !window.MYTH_ORIENTATION_ACTIVE) canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', function() {
    locked = (document.pointerLockElement === canvas);
    var hint = document.getElementById('lock-hint');
    if (hint) hint.style.display = locked ? 'none' : 'block';
    if (!locked) camera.detachControl(canvas);
    else         camera.attachControl(canvas, true);
  });

  // ============================================================
  // MATERIAL FACTORY
  // ============================================================
  var _matCache = {};
  function mk(hex, rough, metal) {
    var k = hex + '_' + (rough||0) + '_' + (metal||0);
    if (_matCache[k]) return _matCache[k];
    var m = new BABYLON.PBRMaterial('m' + k, scene);
    m.albedoColor  = new BABYLON.Color3(((hex>>16)&255)/255, ((hex>>8)&255)/255, (hex&255)/255);
    m.roughness    = (rough !== undefined) ? rough : 0.85;
    m.metallic     = (metal !== undefined) ? metal : 0;
    m.useAmbientOcclusionFromMetallicTextureRed = false;
    _matCache[k] = m;
    return m;
  }

  // Material palette
  var MT = {
    grass:  mk(0x4a8c3a, 0.95),
    asph:   mk(0x404040, 0.9),
    conc:   mk(0xb0a898, 0.85),
    brick:  mk(0xc0784a, 0.88),
    wA:     mk(0xd4c4a8, 0.82),   // warm cream wall
    wB:     mk(0xc8bca0, 0.82),
    wG:     mk(0x9aaca0, 0.78),   // gym wall
    roof1:  mk(0x8a7060, 0.9),
    roof2:  mk(0x6a8070, 0.88),
    roofG:  mk(0x607868, 0.88),
    roofC:  mk(0x7a9a6a, 0.88),
    roofP:  mk(0x8a7888, 0.88),
    stt:    mk(0xc0b8a8, 0.85),   // steps/concrete
    win:    mk(0xa8c8e8, 0.05, 0.3),
    dr:     mk(0x7a5a38, 0.7),
    fnc:    mk(0x888888, 0.8, 0.2),
    park:   mk(0x383838, 0.92),
    pln:    mk(0xf5f5f5, 0.5),
    scr:    mk(0x111111, 0.95),
    eG:     mk(0x44ff44, 0.4, 0.0),
    wood:   mk(0xb08040, 0.75),
    court:  mk(0xd4aa66, 0.25, 0.05),
    water:  mk(0x2080c0, 0.05, 0.1),
    track1: mk(0xc04020, 0.9),
    track2: mk(0xd85a30, 0.9),
    sand:   mk(0xd8c890, 0.95),
  };

  // ============================================================
  // SCENE HELPERS
  // ============================================================
  var DOORS = [];  // { mesh, open, wallAxis, origPos, col }
  var NPCS  = [];  // { x, z, radius, label, msg }
  var ZONES = [];  // { x1,x2,z1,z2, name }

  function solidBox(w, h, d, mat, x, y, z) {
    var m = BABYLON.MeshBuilder.CreateBox('sb', {width: w, height: h, depth: d}, scene);
    m.position.set(x, y + h / 2, z);
    m.material = mat;
    m.checkCollisions = true;
    m.receiveShadows  = true;
    shadowGen.addShadowCaster(m);
    return m;
  }

  function visBox(w, h, d, mat, x, y, z) {
    var m = BABYLON.MeshBuilder.CreateBox('vb', {width: w, height: h, depth: d}, scene);
    m.position.set(x, y, z);
    m.material = mat;
    m.receiveShadows = true;
    return m;
  }

  function visCyl(rt, rb, h, segs, mat, x, y, z) {
    var m = BABYLON.MeshBuilder.CreateCylinder('vc', {
      diameterTop: rt * 2, diameterBottom: rb * 2,
      height: h, tessellation: segs || 8
    }, scene);
    m.position.set(x, y, z);
    m.material = mat;
    return m;
  }

  function visSph(r, mat, x, y, z) {
    var m = BABYLON.MeshBuilder.CreateSphere('vs', {diameter: r * 2, segments: 8}, scene);
    m.position.set(x, y, z);
    m.material = mat;
    return m;
  }

  function mkLabel(text, size) {
    var charW = size * 0.072, plH = size * 0.14;
    var plW   = text.length * charW;
    var pl = BABYLON.MeshBuilder.CreatePlane('lbl', {width: plW, height: plH}, scene);
    pl.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    pl.isPickable    = false;
    var dt = new BABYLON.DynamicTexture('ldt', {width: 1024, height: 128}, scene, false);
    var px = Math.round(128 * size / 12);
    dt.drawText(text, null, null, 'bold ' + px + 'px "DM Sans",sans-serif',
                'white', 'transparent', true, true);
    var lm = new BABYLON.StandardMaterial('lm', scene);
    lm.diffuseTexture     = dt;
    lm.emissiveColor      = new BABYLON.Color3(1, 1, 1);
    lm.backFaceCulling    = false;
    lm.disableLighting    = true;
    pl.material = lm;
    return pl;
  }

  // Simple line (for court markings etc.)
  function visLine(x1, y1, z1, x2, y2, z2, mat) {
    var dx = x2-x1, dy = y2-y1, dz = z2-z1;
    var len = Math.sqrt(dx*dx+dy*dy+dz*dz);
    if (len < 0.01) return;
    var m = BABYLON.MeshBuilder.CreateBox('ln', {width: len+0.04, height: 0.02, depth: 0.1}, scene);
    m.position.set((x1+x2)/2, y1, (z1+z2)/2);
    m.rotation.y = -Math.atan2(dz, dx);
    m.material = mat;
    return m;
  }

  // Ground
  var ground = BABYLON.MeshBuilder.CreateGround('gnd', {width: 400, height: 400}, scene);
  ground.material = MT.grass;
  ground.checkCollisions = true;
  ground.position.y = 0;

  // Loading progress
  function prog(pct, msg) {
    var b = document.getElementById('w3d-lbar');
    var t = document.getElementById('w3d-lmsg');
    if (b) b.style.width = pct + '%';
    if (t) t.textContent = msg || '';
  }

  // ============================================================
  // CAMPUS GROUND SURFACE
  // ============================================================
  prog(5, 'Ground...');
  // Main concrete areas
  solidBox(296, 0.1, 246, MT.grass, 0, -0.05, 33);
  // Sidewalk network
  solidBox(52, 0.12, 62,  MT.conc, -112, 0, -47);
  solidBox(52, 0.12, 82,  MT.conc, -112, 0, 41);
  solidBox(82, 0.12, 42,  MT.conc,  82,  0, -72);

  // Asphalt path network
  var pathMat = MT.asph;
  solidBox(8, 0.1, 160, pathMat, -138, 0,  33);
  solidBox(160, 0.1, 8, pathMat,  0,   0, -90);
  solidBox(160, 0.1, 8, pathMat,  0,   0,  155);
  solidBox(8, 0.1, 250, pathMat,  148, 0,  30);
  solidBox(8, 0.1, 250, pathMat, -148, 0,  30);

  // ============================================================
  // BUILDING FACTORY
  // ============================================================
  prog(8, 'Building factory...');

  function building(x, z, w, d, h, wmat, rmat, name, floors, type) {
    floors = floors || 1;
    // Walls
    solidBox(w, h, 0.5, wmat, x, 0, z - d/2 + 0.25); // north
    solidBox(w, h, 0.5, wmat, x, 0, z + d/2 - 0.25); // south (door gap handled below)
    solidBox(0.5, h, d, wmat, x - w/2 + 0.25, 0, z);  // west
    solidBox(0.5, h, d, wmat, x + w/2 - 0.25, 0, z);  // east
    // Roof slab
    solidBox(w + 0.5, 0.6, d + 0.5, rmat, x, h, z);
    // Floor inside
    solidBox(w - 1, 0.15, d - 1, MT.conc, x, 0, z);
    // Windows north/south
    for (var wz = z - d/2 + 2.8; wz < z + d/2 - 2; wz += 3) {
      var fy = floors > 1 ? h * 0.28 : h * 0.45;
      visBox(0.12, 1.4, 1.1, MT.win, x - w/2 - 0.02, fy, wz);
      visBox(0.12, 1.4, 1.1, MT.win, x + w/2 + 0.02, fy, wz);
    }
    // South wall with door gap
    var hw = (w - 2.8) / 2;
    solidBox(hw, h, 0.5, wmat, x - w/4 - 0.4, 0, z + d/2 - 0.25);
    solidBox(hw, h, 0.5, wmat, x + w/4 + 0.4, 0, z + d/2 - 0.25);
    solidBox(2.8, h - 3.1, 0.5, wmat, x, 3.1, z + d/2 - 0.25);
    // Door mesh with collision
    var dm = BABYLON.MeshBuilder.CreateBox('door', {width: 2.7, height: 3.1, depth: 0.12}, scene);
    dm.position.set(x, 1.55, z + d/2 - 0.06);
    dm.material = MT.dr;
    dm.checkCollisions = true;
    DOORS.push({ mesh: dm, open: false, wallAxis: 'z',
                 origPos: dm.position.clone(),
                 origRot: dm.rotation.clone() });
    NPCS.push({ x: x, z: z + d/2 + 1, radius: 6, label: name,
                msg: name + ' — Press F to open door.' });
    ZONES.push({ x1: x-w/2, x2: x+w/2, z1: z-d/2, z2: z+d/2, name: name });
    return dm;
  }

  // ============================================================
  // BUILD CAMPUS
  // ============================================================
  prog(12, 'A Row...');
  // A-row: 5 buildings along north edge
  var fbx = [-72, -44, -14, 16, 44];
  for (var fi = 0; fi < fbx.length; fi++)
    building(fbx[fi], -32, 18, 13, 8, MT.wA, MT.roof1, 'Bldg A' + (fi+1), 1, 'cls');

  prog(18, 'B + C Row...');
  building(-58, -55, 24, 14, 9,  MT.wA, MT.roof2,  'Bldg B1', 1, 'cls');
  building(-11, -55, 22, 14, 9,  MT.wA, MT.roof2,  'Bldg B2', 1, 'cls');
  building(-58, -18, 26, 14, 9,  MT.wB, MT.roof1,  'Bldg C1', 1, 'cls');
  building(-11, -18, 24, 14, 9,  MT.wB, MT.roof1,  'Bldg C2', 1, 'cls');
  building( 22, -18, 22, 14, 8,  MT.wB, MT.roof2,  'Bldg C3', 1, 'cls');
  building( 58, -18, 20, 14, 8,  MT.wB, MT.roof1,  'Bldg C4', 1, 'cls');

  prog(25, 'D + E Row...');
  building(-58, 10,  26, 15, 9,  MT.wA, MT.roof2,  'Bldg D1', 2, 'cls');
  building(-11, 10,  24, 15, 9,  MT.wA, MT.roof2,  'Bldg D2', 2, 'cls');
  building( 22, 10,  22, 14, 8,  MT.wB, MT.roof1,  'Bldg D3', 1, 'cls');
  var fbx2 = [-72, -44, -14, 16, 44];
  for (var fi2 = 0; fi2 < fbx2.length; fi2++)
    building(fbx2[fi2], 38, 18, 13, 8, MT.wB, MT.roof2, 'Bldg E' + (fi2+1), 1, 'cls');

  prog(32, 'F Row...');
  var fbx3 = [-72, -44, -14, 16, 44];
  for (var fi3 = 0; fi3 < fbx3.length; fi3++)
    building(fbx3[fi3], -32, 18, 13, 8, MT.wB, MT.roof2, 'Bldg F' + (fi3+1), 1, 'cls');

  prog(38, 'Library + Science...');
  building(76, -56, 24, 17, 10, MT.wB, MT.roofC, 'Library', 2, 'lib');
  ZONES.push({x1:64, x2:90, z1:-66, z2:-44, name:'Library'});
  building(76, -32, 24, 15, 9,  MT.wA, MT.roofP, 'Physics + Science', 2, 'cls');

  prog(44, 'Cafeteria + Admin...');
  building(-20, -10, 40, 24, 9,  MT.wA, MT.roof2, 'Cafeteria', 1, 'caf');
  building( 30, -10, 22, 17, 9,  MT.wB, MT.roof1, 'Admin',     1, 'adm');

  // ============================================================
  // TREES
  // ============================================================
  prog(48, 'Trees...');
  function tree(x, z, sc) {
    sc = sc || 1;
    var trunk = BABYLON.MeshBuilder.CreateCylinder('tr', {
      diameterTop: 0.28*sc, diameterBottom: 0.55*sc, height: 2.8*sc, tessellation: 8
    }, scene);
    trunk.position.set(x, 1.4*sc, z);
    trunk.material = mk(0x6a4828, 0.95);
    trunk.checkCollisions = true;
    var leafColors = [0x2d7a2a, 0x3a9a38, 0x258a25, 0x4aaa40];
    [[0,0,0,2.4],[0.7,0.5,0.4,1.9],[-.6,0.8,0.3,1.7],[0.2,1.2,-.5,1.5]].forEach(function(lp) {
      var leaf = BABYLON.MeshBuilder.CreateSphere('lf', {diameter: lp[3]*sc*2, segments:6}, scene);
      leaf.position.set(x + lp[0]*sc, 2.8*sc + lp[1]*sc, z + lp[2]*sc);
      leaf.material = mk(leafColors[Math.floor(Math.random()*leafColors.length)], 0.9);
      leaf.scaling.y = 0.82;
    });
  }
  var treeSpots = [[-128,26],[-120,38],[-115,55],[-130,65],[-108,70],[-88,80],
                   [8,70],[22,85],[38,78],[55,90],[80,72],[90,58],
                   [15,-75],[28,-80],[42,-75],[60,-80],
                   [-140,0],[-135,15],[-138,30],[-130,-10]];
  treeSpots.forEach(function(t) { tree(t[0], t[1], 0.85 + Math.random()*0.35); });

  // ============================================================
  // PARKING LOTS
  // ============================================================
  prog(52, 'Parking + paths...');
  function parkLot(cx, cz, w, d) {
    visBox(w, 0.06, d, MT.park, cx, 0.03, cz);
    for (var i = -w/2+4; i < w/2-2; i += 4)
      visBox(0.12, 0.07, d-1, MT.pln, cx+i, 0.07, cz);
  }
  parkLot(-128, -50, 42, 54);
  parkLot(100,   20, 60, 50);
  parkLot(-80,  140, 70, 40);
  parkLot(40,   140, 70, 40);

  // ============================================================
  // SPORTS AREAS
  // ============================================================
  prog(56, 'Sports fields...');
  // Football/soccer field
  solidBox(90, 0.08, 90, mk(0x3a8050, 0.95), -82, 0, 102);
  ZONES.push({x1:-130, x2:-34, z1:58, z2:146, name:'Athletic Field'});
  // Track stripes
  for (var ts = 0; ts < 6; ts++)
    visBox(88, 0.04, 1.5, ts%2===0 ? MT.track1 : MT.track2, -82, 0.06, 60+ts*1.8);
  // Baseball diamond
  solidBox(90, 0.08, 90, mk(0x3a7848, 0.95), 48, 0, 102);
  visBox(60, 0.04, 60, MT.sand, 48, 0.05, 102);
  // Pool
  solidBox(24, 1.2, 17, mk(0x1a7aaa, 0.05, 0.1), 36, -0.6, -46);
  visBox(22, 0.08, 15, mk(0x44aadd, 0.08, 0.08), 36, 0.09, -46);
  ZONES.push({x1:24, x2:48, z1:-54, z2:-38, name:'Swimming Pool'});
  // Tennis courts
  for (var tc = 0; tc < 3; tc++) {
    solidBox(24, 0.06, 11, mk(0x406060, 0.9), 82, 0, 58+tc*14);
    visBox(0.08, 0.1, 11, mk(0xffffff, 0.5), 82, 0.08, 58+tc*14);
  }
  // Running track oval
  var trackMat = mk(0xc04020, 0.9);
  var trackSegs = 48;
  for (var ti = 0; ti < trackSegs; ti++) {
    var a0 = ti/trackSegs*Math.PI*2, a1 = (ti+1)/trackSegs*Math.PI*2;
    var rx = 56, rz = 62;
    var x0 = -82+Math.cos(a0)*rx, z0 = 102+Math.sin(a0)*rz;
    var x1 = -82+Math.cos(a1)*rx, z1 = 102+Math.sin(a1)*rz;
    var sl = Math.sqrt((x1-x0)*(x1-x0)+(z1-z0)*(z1-z0));
    var seg = BABYLON.MeshBuilder.CreateBox('tr', {width:sl+0.1, height:0.07, depth:3.5}, scene);
    seg.position.set((x0+x1)/2, 0.04, (z0+z1)/2);
    seg.rotation.y = -Math.atan2(z1-z0, x1-x0);
    seg.material = trackMat;
  }

  // ============================================================
  // GYM
  // ============================================================
  prog(60, 'Gymnasium...');

  function buildGym(gx, gz) {
    var gw = 42, gd = 32, gh = 14;

    // -- WALLS --
    solidBox(0.5, gh, gd, MT.wG, gx - gw/2 + 0.25, 0, gz);            // west
    // East wall — split with 3.2-unit door gap at z=gz
    solidBox(0.5, gh, (gd-3.2)/2, MT.wG, gx+gw/2-0.25, 0, gz-(gd/4+0.8));
    solidBox(0.5, gh, (gd-3.2)/2, MT.wG, gx+gw/2-0.25, 0, gz+(gd/4+0.8));
    solidBox(0.5, gh-3.2, 3.2, MT.wG, gx+gw/2-0.25, 3.2, gz);
    solidBox(gw, gh, 0.5, MT.wG, gx, 0, gz + gd/2 - 0.25);            // south (solid)
    solidBox(gw + 0.6, 0.8, gd + 0.6, MT.roofG, gx, gh, gz);          // roof
    // East entrance curb
    solidBox(0.9, 0.18, 5.5, MT.stt, gx+gw/2+0.65, 0, gz);

    // East door
    var gymDoor = BABYLON.MeshBuilder.CreateBox('gymDoor',
      {width: 0.1, height: 3.1, depth: 2.8}, scene);
    gymDoor.position.set(gx + gw/2 - 0.05, 1.55, gz);
    gymDoor.material = MT.dr;
    gymDoor.checkCollisions = true;
    DOORS.push({ mesh: gymDoor, open: false, wallAxis: 'x',
                 origPos: gymDoor.position.clone(),
                 origRot: gymDoor.rotation.clone() });

    // -- NORTH WALL (split by tunnel) --
    var tunnelCX = gx - 8, tunnelW = 4.2, tunnelH = 2.3;
    var blRows = 8, blW = gw - 4;
    var tunRowLen = blRows * 0.85 + 1.5;
    var tunnelStartZ = gz - gd/2 + 0.8;
    var tunnelEndZ   = gz - gd/2 - tunRowLen + 0.3;
    var tunnelMidZ   = (tunnelStartZ + tunnelEndZ) / 2;
    var tunLen       = Math.abs(tunnelStartZ - tunnelEndZ);
    var halfGap      = tunnelW / 2;

    var nwLeftW = (tunnelCX - halfGap) - (gx - gw/2);
    solidBox(nwLeftW, gh, 0.5, MT.wG, gx-gw/2+nwLeftW/2, 0, gz-gd/2+0.25);
    var nwRightStart = tunnelCX + halfGap;
    var nwRightW = (gx + gw/2) - nwRightStart;
    solidBox(nwRightW, gh, 0.5, MT.wG, nwRightStart+nwRightW/2, 0, gz-gd/2+0.25);
    solidBox(tunnelW, gh-tunnelH, 0.5, MT.wG, tunnelCX, tunnelH, gz-gd/2+0.25);

    // -- GYM FLOOR --
    var gymFloor = solidBox(gw-1, 0.12, gd-1, MT.court, gx, 0, gz);

    // -- BASKETBALL COURT MARKINGS --
    var wLine = mk(0xffffff, 0.4);
    var rLine = mk(0xcc3322, 0.4);
    // Center circle
    for (var ci=0;ci<32;ci++){
      var a0=ci/32*Math.PI*2, a1=(ci+1)/32*Math.PI*2;
      var cx0=Math.cos(a0)*4.6, cz0=Math.sin(a0)*4.6;
      var cx1=Math.cos(a1)*4.6, cz1=Math.sin(a1)*4.6;
      visLine(gx+cx0,0.14,gz+cz0, gx+cx1,0.14,gz+cz1, wLine);
    }
    visBox(gw-2, 0.02, 0.1, wLine, gx, 0.14, gz); // half-court line
    // Hoops on east/west
    [-1,1].forEach(function(side) {
      var bx = gx + side*(gw/2-4);
      // 3-point arc
      for (var ai=0;ai<24;ai++){
        var ang0=(ai/24-0.5)*Math.PI*0.9, ang1=((ai+1)/24-0.5)*Math.PI*0.9;
        var x3a=bx+side*Math.cos(ang0)*7, z3a=gz+Math.sin(ang0)*7;
        var x3b=bx+side*Math.cos(ang1)*7, z3b=gz+Math.sin(ang1)*7;
        visLine(x3a,0.14,z3a, x3b,0.14,z3b, rLine);
      }
      // Key
      visBox(0.08,0.02,10, wLine, bx+side*2.5, 0.14, gz);
      visBox(0.08,0.02,10, wLine, bx+side*2.5-side*5, 0.14, gz);
      visBox(5,0.02,0.08, wLine, bx, 0.14, gz-5);
      visBox(5,0.02,0.08, wLine, bx, 0.14, gz+5);
      // Backboard
      solidBox(0.18,1.1,1.8, mk(0xf8f8f8,0.2), bx+side*0.5, 3.3, gz);
      visBox(0.1,0.5,0.85, mk(0xff4422,0.5), bx+side*0.44, 3.2, gz);
      // Rim
      var rimMat = mk(0xdd6600, 0.5, 0.3);
      for (var ri=0;ri<16;ri++){
        var ra0=ri/16*Math.PI*2, ra1=(ri+1)/16*Math.PI*2;
        var rsl=Math.sqrt(Math.pow((Math.cos(ra1)-Math.cos(ra0))*0.46,2)+
                          Math.pow((Math.sin(ra1)-Math.sin(ra0))*0.46,2));
        var rseg=BABYLON.MeshBuilder.CreateBox('rim',{width:0.04,height:rsl,depth:0.04},scene);
        rseg.rotation.x=Math.PI/2;
        rseg.rotation.z=-Math.atan2(Math.sin(ra1)-Math.sin(ra0),Math.cos(ra1)-Math.cos(ra0));
        rseg.position.set(bx+side*0.6+(Math.cos(ra0)+Math.cos(ra1))/2*0.46,
                          3.05, gz+(Math.sin(ra0)+Math.sin(ra1))/2*0.46);
        rseg.material=rimMat;
      }
      // Pole
      visCyl(0.06,0.06,3.05,6, mk(0xaaaaaa,0.4,0.5), bx+side*1.2, 1.525, gz);
    });

    // -- BLEACHERS --
    var blMats = [mk(0x3355aa,0.7), mk(0xcc3322,0.7)];
    // North bleachers (with tunnel)
    for (var br2=0;br2<blRows;br2++){
      var byN=br2*0.62, bzN=gz-gd/2+0.8+br2*0.85;
      var rowTop=byN+0.32;
      if (byN < tunnelH){
        var lEdge=gx-blW/2, lW=(tunnelCX-halfGap)-lEdge;
        if(lW>0.3){solidBox(lW,0.32,0.88,blMats[br2%2],lEdge+lW/2,byN,bzN);
          visBox(lW,rowTop,0.12,mk(0x444444,0.9),lEdge+lW/2,rowTop/2,bzN+0.38);}
        var rStart=tunnelCX+halfGap, rW=(gx+blW/2)-rStart;
        if(rW>0.3){solidBox(rW,0.32,0.88,blMats[br2%2],rStart+rW/2,byN,bzN);
          visBox(rW,rowTop,0.12,mk(0x444444,0.9),rStart+rW/2,rowTop/2,bzN+0.38);}
      } else {
        solidBox(blW,0.32,0.88,blMats[br2%2],gx,byN,bzN);
        visBox(blW,rowTop,0.12,mk(0x444444,0.9),gx,rowTop/2,bzN+0.38);
      }
    }
    // Tunnel walls + ceiling
    solidBox(0.28,tunnelH,tunLen,mk(0x888880,0.9),tunnelCX-halfGap-0.14,0,tunnelMidZ);
    solidBox(0.28,tunnelH,tunLen,mk(0x888880,0.9),tunnelCX+halfGap+0.14,0,tunnelMidZ);
    visBox(tunnelW+0.6,0.18,tunLen,mk(0xb0a898,0.95),tunnelCX,tunnelH,tunnelMidZ);
    // Tunnel lights
    var tlMat=mk(0xffffcc,0.1,0);
    tlMat.emissiveColor=new BABYLON.Color3(1,1,0.85);
    for(var tl=tunnelEndZ+0.8;tl<tunnelStartZ;tl+=2.2)
      visBox(tunnelW-0.5,0.05,0.35,tlMat,tunnelCX,tunnelH-0.1,tl);
    // Tunnel labels
    var tSp=mkLabel('GYM EXIT / ENTRANCE',8);
    tSp.position.set(tunnelCX,tunnelH+1.4,tunnelEndZ+0.6);
    NPCS.push({x:tunnelCX,z:tunnelEndZ+1,radius:5,label:'Gym Tunnel',
      msg:'Tunnel under the north bleachers — walk through to exit the gymnasium!'});
    // South bleachers — front rows near court, back near south wall
    for (var br3=0;br3<blRows;br3++){
      var byS=br3*0.62;
      var bzS=gz+gd/2-0.5-(blRows-1-br3)*0.85;
      solidBox(blW,0.32,0.88,blMats[br3%2],gx,byS,bzS);
      visBox(blW,byS+0.32,0.12,mk(0x444444,0.9),gx,(byS+0.32)/2,bzS-0.38);
    }

    // -- PODIUM --
    solidBox(1.4,1.1,0.8,mk(0x5a3010,0.7),gx,0,gz+4);
    visBox(1.45,0.08,0.82,mk(0x3a1a00,0.5),gx,1.1,gz+4);
    visCyl(0.04,0.04,1.2,6,mk(0x888888,0.4),gx,0.6,gz+3.4);

    // -- SCOREBOARDS --
    solidBox(10,3.2,0.25,MT.scr,gx,gh-2.2,gz-gd/2+0.35);
    visBox(9.2,2.7,0.06,MT.eG,gx,gh-2.2,gz-gd/2+0.5);
    solidBox(10,3.2,0.25,MT.scr,gx,gh-2.2,gz+gd/2-0.35);

    // -- CEILING LIGHTS --
    var ceilLightMat=mk(0xfffef0,0.1,0);
    ceilLightMat.emissiveColor=new BABYLON.Color3(1,1,0.92);
    for(var lxi=gx-gw/2+5;lxi<=gx+gw/2-4;lxi+=7){
      for(var lzi=gz-gd/2+5;lzi<=gz+gd/2-4;lzi+=7){
        visBox(0.6,0.12,0.6,ceilLightMat,lxi,gh-0.08,lzi);
      }
    }

    // -- RAFTERS --
    for(var rf=gz-gd/2+4;rf<=gz+gd/2-3;rf+=5)
      visBox(gw-1,0.28,0.26,mk(0x666666,0.75),gx,gh-0.5,rf);

    // -- WINDOWS --
    for(var ww=gz-gd/2+3;ww<gz+gd/2-2;ww+=4.5)
      visBox(0.1,1.8,2.2,MT.win,gx-gw/2-0.02,gh*0.6,ww); // west wall
    for(var ww2=gz-gd/2+3;ww2<gz+gd/2-2;ww2+=4.5){
      if(Math.abs(ww2-gz)<4.5) continue;
      visBox(0.1,1.8,2.2,MT.win,gx+gw/2+0.02,gh*0.6,ww2); // east wall (skip door area)
    }

    // Entrance sign
    var enSp=mkLabel('← ORIENTATION',11);
    enSp.position.set(gx+gw/2+0.8,gh*0.55,gz);

    // Label + zone
    var gymSp=mkLabel('Gymnasium',12);
    gymSp.position.set(gx,gh+4,gz);
    NPCS.push({x:gx,z:gz,radius:10,label:'Gymnasium',
      msg:'Westbrook Gymnasium — full basketball court, bleachers, orientation inside!'});
    ZONES.push({x1:gx-gw/2,x2:gx+gw/2,z1:gz-gd/2,z2:gz+gd/2,name:'Gymnasium'});
  }

  buildGym(-92, -62);

  // ============================================================
  // NPC CROWD  (orientation audience)
  // ============================================================
  prog(66, 'NPC crowd...');

  function npcBody(x, z, y, shirtHex, skinHex) {
    var sm = mk(shirtHex||0x3355aa, 0.7);
    var hm = mk(skinHex||0xf4c08a, 0.5);
    visCyl(0.18,0.22,0.9,8, sm, x, y+0.45, z);
    visSph(0.19, hm, x, y+1.12, z);
  }

  var shirtCols=[0x3355cc,0xcc3322,0x228833,0xcc8800,0x882299,
                 0x117788,0xcc4422,0x336688,0xee6644,0x3399aa,
                 0xaa2244,0x668833,0x4455bb,0xcc7700,0x559944];
  var skinCols=[0xf4c08a,0xe8a070,0xd08858,0xc07040,0xfad4a0,0xe8b880,0xd4906a,0xba7248];
  var npcIdx=0;
  function rndNPC(x,z,rowY){
    npcBody(x,z,rowY,shirtCols[npcIdx%shirtCols.length],
            skinCols[Math.floor(npcIdx/2)%skinCols.length]);
    npcIdx++;
  }

  var xSpots=[-108,-104,-100,-96,-92,-88,-84,-80,-76];
  // South bleachers crowd
  for(var srN=0;srN<7;srN++){
    var seatY=srN*0.62+0.32;
    var seatZ=-46.5-(7-srN)*0.85;
    for(var sx=0;sx<xSpots.length;sx++){
      if(srN===0&&sx===4) continue;
      rndNPC(xSpots[sx],seatZ-0.2,seatY);
    }
  }
  // North bleachers crowd
  for(var nrN=0;nrN<5;nrN++){
    var nseatY=nrN*0.62+0.32;
    var nseatZ=-62-16+0.8+nrN*0.85+0.2;
    for(var nx2=0;nx2<xSpots.length;nx2++){
      if(nrN<2&&(nx2<2||nx2>6)) continue;
      rndNPC(xSpots[nx2],nseatZ,nseatY);
    }
  }

  // Coach Rivera
  npcBody(-92,-58,0, 0x1a1a5a,0xe8b880);

  // Story NPCs
  NPCS.push({x:-64,z:-55,radius:3.5,label:'Alex Chen',
    msg:'"Hey — you\'re new too, right? First day. I don\'t know anyone either. The gym entrance is right there — orientation\'s about to start."'});
  npcBody(-64,-55,0,0x4488cc,0xf4c08a);
  NPCS.push({x:-74,z:-62,radius:3.5,label:'Jordan Park',
    msg:'"I heard the popular kids always claim the front bleachers on day one. No idea if that\'s true. Probably is."'});
  npcBody(-74,-62,0,0xcc4422,0xd08858);
  NPCS.push({x:-68,z:-68,radius:3.5,label:'Maya Torres',
    msg:'"My older sister said freshman orientation is basically just the principal telling you not to use your phone. Forty-five minutes."'});
  npcBody(-68,-68,0,0xaa44aa,0xe8a070);
  NPCS.push({x:-68,z:-54,radius:4,label:'Upperclassman',
    msg:'"Oh, freshmen. Every year." (He doesn\'t stop walking.)'});
  npcBody(-68,-54,0,0x222222,0xd4906a);
  NPCS.push({x:-92,z:-58,radius:5,label:'Coach Rivera',
    msg:'Coach Rivera adjusts the mic. "Welcome to Westbrook High. Please find your seats — orientation begins in two minutes."'});
  NPCS.push({x:-84,z:-56,radius:3,label:'Naomi Walsh',
    msg:'"Front row. I know everyone thinks it\'s try-hard, but I actually want to hear what they\'re saying." She has a pen out already.'});
  NPCS.push({x:-97,z:-55,radius:3,label:'Tyler Brooks',
    msg:'Tyler looks up from his phone. "You can sit here." A pause. "If you want." The offer doesn\'t last long.'});
  NPCS.push({x:-88,z:-76,radius:3,label:'Devon Clark',
    msg:'"Back row. You can see everything from up here and nobody bothers you. That\'s the whole thing."'});

  // Orientation sign
  var orSign=mkLabel('← FRESHMAN ORIENTATION',13);
  orSign.position.set(-62,5,-62);
  var orSign2=mkLabel('Enter gym for orientation',9);
  orSign2.position.set(-62,3.5,-62);

  // Extra story NPCs
  NPCS.push({x:-80,z:-40,radius:4,label:'Ms. Patel',
    msg:'Ms. Patel waves toward the gym. "Freshmen orientation is in the gym — east entrance, right over there."'});
  npcBody(-80,-40,0,0x2244aa,0xf0c090);
  NPCS.push({x:-100,z:-35,radius:4,label:'Kid Skipping Orientation',
    msg:'"I\'ve been to like four of these. New school, same speech. Coach says attendance mandatory though, so." He doesn\'t move.'});
  npcBody(-100,-35,0,0x334433,0xd4906a);
  NPCS.push({x:-65,z:-70,radius:3.5,label:'Nervous Freshman',
    msg:'"Is this where we go? For orientation? I\'ve walked past three times already trying to look like I know where I\'m going."'});
  npcBody(-65,-70,0,0x7788bb,0xfad4a0);
  NPCS.push({x:-125,z:-45,radius:4,label:'Sakura Yamamoto',
    msg:'"My brother warned me about freshman orientation. Said it\'s actually pretty important — first impressions and all that."'});
  npcBody(-125,-45,0,0xcc4488,0xe8b080);
  NPCS.push({x:-120,z:-55,radius:4,label:'Marcus Webb',
    msg:'"I heard there are already cliques forming. Like, people already know who\'s popular and who isn\'t. Day one. That\'s wild."'});
  npcBody(-120,-55,0,0x336699,0xba7248);
  NPCS.push({x:-70,z:-50,radius:3.5,label:'Quiet Student',
    msg:'She\'s writing something in a small notebook. "Sorry — just writing down first impressions. It\'s a thing I do."'});
  npcBody(-70,-50,0,0x886699,0xf0c090);
  NPCS.push({x:-100,z:-25,radius:5,label:'Campus Map',
    msg:'WESTBROOK HIGH SCHOOL\nFreshmen: report to the gym (east entrance) for orientation first.'});

  // ============================================================
  // FENCES + CAMPUS BOUNDARY
  // ============================================================
  prog(72, 'Fences + barriers...');

  function fence(x1,z1,x2,z2,fh,n) {
    fh=fh||2.5; n=n||18;
    var dx=x2-x1,dz=z2-z1,len=Math.sqrt(dx*dx+dz*dz);
    for(var i=0;i<=n;i++){
      var t=i/n;
      solidBox(0.1,fh,0.1,MT.fnc,x1+dx*t,0,z1+dz*t);
    }
    var rail=BABYLON.MeshBuilder.CreateCylinder('rl',{diameter:0.08,height:len,tessellation:6},scene);
    rail.rotation.x=Math.PI/2;
    rail.rotation.y=-Math.atan2(dz,dx);
    rail.position.set((x1+x2)/2,fh,(z1+z2)/2);
    rail.material=MT.fnc;
  }

  fence(-148,-90,148,-90,2.2); fence(-148,156,148,156,2.2);
  fence(-148,-90,-148,156,2.2); fence(148,-90,148,156,2.2);
  // Invisible boundary walls (low, at campus edge)
  solidBox(300,4,0.5,mk(0x888888,0.9),0,0,-91);
  solidBox(300,4,0.5,mk(0x888888,0.9),0,0,157);
  solidBox(0.5,4,250,mk(0x888888,0.9),-149,0,30);
  solidBox(0.5,4,250,mk(0x888888,0.9),149,0,30);

  // Freshman zone barriers
  fence(-64,-85,-64,-70,2.5,6);
  fence(-64,-54,-64,-22,2.5,10);
  fence(-138,-23,-64,-23,2.5,12);
  // Restriction signs
  var rSign1=mkLabel('SENIORS & JUNIORS ONLY',8);
  rSign1.position.set(-64,3.5,-55);
  var rSign2=mkLabel('— SENIORS & JUNIORS ONLY —',8);
  rSign2.position.set(-100,3.5,-23);
  // Cones
  function cone(cx,cz){
    visCyl(0,0.15,0.65,8,mk(0xff6600,0.6),cx,0.325,cz);
    visCyl(0.18,0.05,0.08,8,mk(0xffffff,0.7),cx,0.7,cz);
  }
  cone(-64,-22); cone(-64,-40); cone(-64,-85);
  cone(-138,-23); cone(-100,-23); cone(-80,-23);

  prog(80, 'Environment...');

  // Sky (large sphere inside-out)
  var sky = BABYLON.MeshBuilder.CreateSphere('sky',{diameter:600,segments:8},scene);
  sky.material = (function(){
    var sm=new BABYLON.StandardMaterial('skyM',scene);
    sm.backFaceCulling=false;
    sm.disableLighting=true;
    sm.diffuseColor=new BABYLON.Color3(0.53,0.72,0.88);
    sm.emissiveColor=new BABYLON.Color3(0.45,0.65,0.88);
    return sm;
  })();
  sky.isPickable=false;

  // Sun disc
  visSph(8, (function(){
    var m=new BABYLON.StandardMaterial('sunM',scene);
    m.disableLighting=true;
    m.emissiveColor=new BABYLON.Color3(1,0.96,0.75);
    return m;
  })(), 220, 120, 80);

  prog(100, 'Done!');
  setTimeout(function() {
    var l=document.getElementById('w3d-load');
    if(l) l.style.display='none';
  }, 300);

  // ============================================================
  // INTERACTION
  // ============================================================
  var ntimer=0;
  var notifEl=document.getElementById('notif');
  function showN(msg){
    if(notifEl){notifEl.textContent=msg;notifEl.style.display='block';}
    ntimer=4.5;
  }

  var iboxEl=document.getElementById('ibox');
  var itxtEl=document.getElementById('itxt');
  function updatePrompt(){
    var pos=camera.position, best=null, bestD=Infinity;
    for(var i=0;i<NPCS.length;i++){
      var n=NPCS[i],dx=pos.x-n.x,dz=pos.z-n.z,d=Math.sqrt(dx*dx+dz*dz);
      if(d<n.radius&&d<bestD){best=n;bestD=d;}
    }
    var nearDoor=false;
    for(var j=0;j<DOORS.length;j++){
      var dp=DOORS[j].mesh.position,dx2=pos.x-dp.x,dz2=pos.z-dp.z;
      if(Math.sqrt(dx2*dx2+dz2*dz2)<6){nearDoor=true;break;}
    }
    if(best){if(itxtEl)itxtEl.textContent=best.label;if(iboxEl)iboxEl.style.display='block';}
    else if(nearDoor){if(itxtEl)itxtEl.textContent='Press F to open/close door';if(iboxEl)iboxEl.style.display='block';}
    else{if(iboxEl)iboxEl.style.display='none';}
  }

  function doInfo(){
    var pos=camera.position,best=null,bestD=Infinity;
    for(var i=0;i<NPCS.length;i++){
      var n=NPCS[i],dx=pos.x-n.x,dz=pos.z-n.z,d=Math.sqrt(dx*dx+dz*dz);
      if(d<n.radius&&d<bestD){best=n;bestD=d;}
    }
    if(best)showN(best.msg);
    else showN('Nothing nearby. Walk up to a landmark and press E.');
  }

  function toggleDoor(){
    var pos=camera.position,best=null,bestD=Infinity;
    for(var i=0;i<DOORS.length;i++){
      var dr=DOORS[i],dp=dr.mesh.position;
      var dx=pos.x-dp.x,dz=pos.z-dp.z,d=Math.sqrt(dx*dx+dz*dz);
      if(d<7&&d<bestD){best=dr;bestD=d;}
    }
    if(!best){showN('No door nearby. Walk up to a building entrance and press F.');return;}
    best.open=!best.open;
    if(best.open){
      if(best.wallAxis==='x'){
        best.mesh.position.z=best.origPos.z-1.5;
        best.mesh.rotation.y=Math.PI/2;
      } else {
        best.mesh.position.x=best.origPos.x-1.5;
        best.mesh.rotation.y=-Math.PI/2;
      }
      best.mesh.checkCollisions=false;
    } else {
      best.mesh.position.copyFrom(best.origPos);
      best.mesh.rotation.copyFrom(best.origRot);
      best.mesh.checkCollisions=true;
    }
    showN(best.open?'Door opened — walk inside!':'Door closed.');
  }

  // ============================================================
  // ZONE + MINIMAP
  // ============================================================
  function getZone(){
    var p=camera.position;
    for(var i=0;i<ZONES.length;i++){
      var z=ZONES[i];
      if(p.x>=z.x1&&p.x<=z.x2&&p.z>=z.z1&&p.z<=z.z2) return z.name;
    }
    return 'MVHS Campus';
  }

  var mmLarge=false;
  var mmCtx=document.getElementById('mm').getContext('2d');
  function drawMM(){
    var mmSz=mmLarge?340:170;
    var sc=mmLarge?0.76:0.38;
    var pos=camera.position;
    var yaw=camera.rotation.y;
    var ox=mmSz/2,oy=mmSz/2;
    mmCtx.clearRect(0,0,mmSz,mmSz);
    mmCtx.fillStyle='#050a18';mmCtx.fillRect(0,0,mmSz,mmSz);
    function mr(x,z,w,d,col){
      mmCtx.fillStyle=col;
      mmCtx.fillRect(Math.round(ox+(x-pos.x)*sc),Math.round(oy+(z-pos.z)*sc),
                     Math.max(1,Math.round(w*sc)),Math.max(1,Math.round(d*sc)));
    }
    function ml(x1,z1,x2,z2,col,lw){
      mmCtx.strokeStyle=col;mmCtx.lineWidth=lw||1;
      mmCtx.beginPath();mmCtx.moveTo(ox+(x1-pos.x)*sc,oy+(z1-pos.z)*sc);
      mmCtx.lineTo(ox+(x2-pos.x)*sc,oy+(z2-pos.z)*sc);mmCtx.stroke();
    }
    mr(-148,-90,296,246,'#2e5c30');
    mr(-138,-78,52,62,'#7a7068');mr(-138,-2,52,82,'#7a7068');mr(41,-93,82,42,'#7a7068');
    if(window.MYTH_FRESHMAN_RESTRICTION){
      mmCtx.fillStyle='rgba(80,120,200,0.13)';
      mmCtx.fillRect(ox+(-138-pos.x)*sc,oy+(-85-pos.z)*sc,73*sc,63*sc);
      mmCtx.strokeStyle='rgba(100,160,255,0.38)';mmCtx.lineWidth=1.5;
      mmCtx.strokeRect(ox+(-138-pos.x)*sc,oy+(-85-pos.z)*sc,73*sc,63*sc);
    }
    var bldgs=[[-81,-89,18,14],[-53,-89,18,14],[-23,-89,18,14],[7,-89,18,14],[35,-89,18,14],
               [-67,-62,24,14],[-20,-62,22,14],[-67,-25,26,14],[-20,-25,24,14],[18,-25,22,14],[54,-25,20,14],
               [-81,-45,18,14],[-53,-45,18,14],[-23,-45,18,14],[7,-45,18,14],[35,-45,18,14],
               [-67,3,26,15],[-20,3,24,15],[18,3,22,14],[64,-65,24,17],[64,-39,24,15],
               [-29,-19,40,24],[21,-19,22,17]];
    for(var bi=0;bi<bldgs.length;bi++)mr(bldgs[bi][0],bldgs[bi][1],bldgs[bi][2],bldgs[bi][3],'#c05040');
    mr(-113,-78,42,32,'#c05040'); // gym
    mmCtx.strokeStyle='#6aaa50';mmCtx.lineWidth=Math.max(1,3*sc);
    mmCtx.beginPath();mmCtx.ellipse(ox+(-82-pos.x)*sc,oy+(102-pos.z)*sc,58*sc,64*sc,0,0,Math.PI*2);mmCtx.stroke();
    mr(-138,66,92,92,'#3a8050');mr(6,66,92,92,'#3a8050');mr(79,56,66,92,'#3a8050');
    mr(-128,26,42,52,'#337a40');mr(24,-54,24,17,'#1a80c0');
    ml(-64,-85,-64,-22,'rgba(255,160,60,0.7)',Math.max(1,1.5*sc));
    ml(-138,-22,-64,-22,'rgba(255,160,60,0.7)',Math.max(1,1.5*sc));
    mmCtx.fillStyle='#e8d070';
    mmCtx.beginPath();mmCtx.arc(ox,oy,mmLarge?6:4,0,Math.PI*2);mmCtx.fill();
    mmCtx.strokeStyle='#e8d070';mmCtx.lineWidth=mmLarge?2.5:1.5;
    var arLen=mmLarge?18:11;
    mmCtx.beginPath();mmCtx.moveTo(ox,oy);
    mmCtx.lineTo(ox+Math.sin(-yaw)*arLen,oy+Math.cos(-yaw)*arLen);mmCtx.stroke();
    mmCtx.fillStyle='rgba(232,208,112,0.7)';
    mmCtx.font='bold '+(mmLarge?10:8)+'px monospace';
    mmCtx.textAlign='center';mmCtx.fillText('N',mmSz/2,mmLarge?14:10);
    mmCtx.fillStyle='rgba(200,180,100,0.45)';
    mmCtx.font=(mmLarge?9:7)+'px monospace';
    mmCtx.textAlign='center';mmCtx.fillText('[M] toggle',mmSz/2,mmSz-4);
    mmCtx.strokeStyle='rgba(200,180,100,0.35)';mmCtx.lineWidth=1;
    mmCtx.strokeRect(1,1,mmSz-2,mmSz-2);
  }

  // Pause overlay
  function populatePauseStats(){
    if(typeof Engine==='undefined') return;
    var s=Engine.getState(); if(!s) return;
    var pi=document.getElementById('po-player-info');
    if(pi) pi.innerHTML='<div class="po-pname">'+(s.player.name||'')+'</div>'+
      '<div class="po-pdetail">Grade '+s.grade+' &nbsp;·&nbsp; '+(s.day||'')+'</div>';
    var ps=document.getElementById('po-stats'); if(!ps) return;
    ps.innerHTML=Object.entries(s.stats).map(function(e){
      var k=e[0],v=e[1];
      var col=(k==='toxicity'||k==='stress')?(v>=7?'#FC7B54':v>=4?'#F7B731':'#6BCB77'):
                                              (v>=7?'#F7B731':v>=4?'#6BCB77':'#FC7B54');
      return '<div class="po-stat-row"><span class="po-stat-name">'+k.toUpperCase()+'</span>'+
        '<div class="po-stat-bar"><div class="po-stat-fill" style="width:'+(v/10*100)+'%;background:'+col+'"></div></div>'+
        '<span class="po-stat-val">'+v.toFixed(1)+'</span></div>';
    }).join('');
  }

  // ============================================================
  // INPUT
  // ============================================================
  var orientationTriggered=false;

  window.addEventListener('keydown',function(e){
    if(e.code==='KeyE') doInfo();
    if(e.code==='KeyF') toggleDoor();
    if(e.code==='KeyM'){
      mmLarge=!mmLarge;
      var mmEl=document.getElementById('minimap');
      if(mmEl) mmEl.classList.toggle('large',mmLarge);
      var mmCv=document.getElementById('mm');
      if(mmCv){mmCv.width=mmLarge?340:170;mmCv.height=mmLarge?340:170;}
    }
    if(e.code==='KeyP'){
      var po=document.getElementById('pause-overlay');
      if(po){
        var nowOpen=po.classList.toggle('open');
        if(nowOpen){
          populatePauseStats();
          document.exitPointerLock();
        } else {
          canvas.requestPointerLock();
        }
      }
    }
  });

  var resumeBtn=document.getElementById('po-resume-btn');
  if(resumeBtn) resumeBtn.addEventListener('click',function(){
    var po=document.getElementById('pause-overlay');
    if(po) po.classList.remove('open');
    canvas.requestPointerLock();
  });

  // ============================================================
  // GAME LOOP
  // ============================================================
  engine.runRenderLoop(function() {
    var dt=engine.getDeltaTime()/1000;

    // Block camera movement during overlays
    if(window.MYTH_ORIENTATION_ACTIVE||
       (document.getElementById('pause-overlay')&&
        document.getElementById('pause-overlay').classList.contains('open'))){
      camera.speed=0;
    } else {
      camera.speed=0.22;
    }

    // Freshman zone restriction
    if(window.MYTH_FRESHMAN_RESTRICTION){
      camera.position.x=Math.max(-138,Math.min(-65,camera.position.x));
      camera.position.z=Math.max(-85, Math.min(-22,camera.position.z));
    }

    // Zone-entry orientation trigger
    var p=camera.position;
    if(!orientationTriggered&&!window.MYTH_ORIENTATION_ACTIVE){
      if(p.x>=-112&&p.x<=-72&&p.z>=-77&&p.z<=-47){
        orientationTriggered=true;
        window.MYTH_ORIENTATION_ACTIVE=true;
        if(typeof showOrientationOverlay==='function') showOrientationOverlay();
      }
    }

    // Notification timer
    ntimer=Math.max(0,ntimer-dt);
    if(ntimer<=0&&notifEl) notifEl.style.display='none';

    // HUD zone
    var hz=document.getElementById('hud-zone');
    if(hz) hz.textContent=getZone();

    updatePrompt();
    drawMM();
    scene.render();
  });

  window.addEventListener('resize',function(){engine.resize();});

  // Expose canvas for external pointer lock
  window.MYTH_WORLD3D_CANVAS=canvas;
  window.MYTH_BABYLON_ENGINE=engine;
  window.MYTH_BABYLON_SCENE=scene;
  window.MYTH_BABYLON_CAMERA=camera;
}
