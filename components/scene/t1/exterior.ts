/* ===================================================================
   JETOUR T1 — front end, rear end, lamps, bumpers, badges.
   Signature cues: full-width black grille panel with two rows of
   illuminated dashes, square lamps with 4-point cloverleaf DRLs,
   chunky black bumpers with amber reflectors, body-colour band with
   spaced JETOUR letters, 4-point clover tail lamps.
   =================================================================== */

import * as THREE from "three";
import { deckY, SCREEN, tailgateZ } from "./body";
import { DIM, Kit, Mats, mergeByMaterial, poly, type V3 } from "./kit";

/* ---------------- FRONT ---------------- */

export function buildFront(kit: Kit, badge?: THREE.Material | null) {
  const m: Mats = kit.mats;
  const NZ = 2.27; // fascia plane

  /* full-width gloss-black grille panel */
  const panel = kit.rbox(1.8, 0.26, 0.055, 0.035, m.trim, [0, 1.0, NZ - 0.02]);
  panel.name = "grille-panel";

  /* "Horizon" light bar under the bonnet lip */
  kit.rbox(1.74, 0.02, 0.03, 0.008, m.drl, [0, 1.142, NZ + 0.028]);

  /* two rows of illuminated dashes (eight-piece, double strip) */
  const dashGeo = new THREE.BoxGeometry(0.058, 0.03, 0.022);
  const matsU: THREE.Matrix4[] = [];
  for (let i = -4; i <= 4; i++) {
    matsU.push(new THREE.Matrix4().setPosition(i * 0.132, 1.075, NZ + 0.03));
    if (i !== 4) matsU.push(new THREE.Matrix4().setPosition(i * 0.132 + 0.066, 0.955, NZ + 0.03));
  }
  kit.instances(dashGeo, m.drl, matsU);

  /* square headlamps with cloverleaf DRLs */
  kit.both((s) => {
    const cx = s * 0.79;
    kit.rbox(0.3, 0.25, 0.11, 0.03, m.trim, [cx, 1.0, NZ - 0.005]);
    /* dark inner */
    kit.rbox(0.27, 0.22, 0.03, 0.02, m.plasticSoft, [cx, 1.0, NZ + 0.048]);
    /* twin projectors */
    for (const dx of [-0.055, 0.005]) {
      kit.cyl(0.042, 0.042, 0.05, m.darkMetal, [cx - s * 0.06 - s * dx, 1.01, NZ + 0.035], [Math.PI / 2, 0, 0], 16);
      kit.torus(0.045, 0.008, m.chrome, [cx - s * 0.06 - s * dx, 1.01, NZ + 0.056], [0, 0, 0], 20);
      kit.sphere(0.028, m.beam, [cx - s * 0.06 - s * dx, 1.01, NZ + 0.058], 14);
    }
    /* 4-point cloverleaf DRL */
    for (const dx of [-0.04, 0.04])
      for (const dy of [-0.04, 0.04])
        kit.box(0.052, 0.05, 0.02, m.drl, [cx + s * 0.075 + dx, 1.0 + dy, NZ + 0.055]);
    /* chrome frame + lens */
    kit.rbox(0.31, 0.26, 0.012, 0.01, m.chrome, [cx, 1.0, NZ + 0.062]);
    const lens = kit.rbox(0.28, 0.23, 0.02, 0.02, m.beam, [cx, 1.0, NZ + 0.072]);
    lens.castShadow = false;
  });

  /* chunky front bumper (side profile extruded across the car) */
  const fb = poly([
    [2.08, 0.92],
    [2.27, 0.92],
    [DIM.nose, 0.68],
    [2.335, 0.47],
    [2.15, 0.38],
    [2.08, 0.48],
  ]);
  const bumper = new THREE.ExtrudeGeometry(fb, { depth: 1.86, bevelEnabled: false, curveSegments: 3 });
  bumper.rotateY(-Math.PI / 2);
  bumper.translate(0.93, 0, 0);
  kit.add(bumper, m.cladding);

  /* silver skid plate */
  kit.rbox(1.3, 0.055, 0.16, 0.03, m.alu, [0, 0.415, 2.26], [-0.25, 0, 0]);
  kit.box(0.9, 0.02, 0.05, m.silver, [0, 0.45, 2.29], [-0.25, 0, 0]);

  /* fog lamps + amber reflectors + lower intake + sensors.
     The bumper is a solid prism, so every fitting has to stand proud of
     its local face (z 2.3525 at y 0.68, falling to 2.335 by y 0.47). */
  kit.both((s) => {
    kit.cyl(0.056, 0.052, 0.055, m.plastic, [s * 0.72, 0.66, 2.329], [Math.PI / 2, 0, 0], 16);
    kit.cyl(0.046, 0.046, 0.02, m.beam, [s * 0.72, 0.66, 2.3425], [Math.PI / 2, 0, 0], 16);
    kit.torus(0.058, 0.01, m.chrome, [s * 0.72, 0.66, 2.344], [0, 0, 0], 20);
    kit.box(0.15, 0.05, 0.03, m.amber, [s * 0.87, 0.52, 2.33]);
    kit.cyl(0.022, 0.022, 0.02, m.plasticSoft, [s * 0.36, 0.63, 2.341], [Math.PI / 2, 0, 0], 12);
    kit.cyl(0.022, 0.022, 0.02, m.plasticSoft, [s * 0.62, 0.6, 2.339], [Math.PI / 2, 0, 0], 12);
  });
  const intake = poly([
    [-0.62, 0.46],
    [0.62, 0.46],
    [0.58, 0.58],
    [-0.58, 0.58],
  ]);
  kit.extrude(intake, 0.03, m.meshMat, [0, 0, 2.325]);

  /* number plate (T1 demonstrator plate) */
  if (badge) {
    kit.plane(0.48, 0.16, badge, [0, 0.79, 2.345]);
    kit.rbox(0.52, 0.2, 0.02, 0.01, m.plastic, [0, 0.79, 2.335]);
  }

  /* bonnet: shut lines + JETOUR wordmark on the leading edge */
  /* shut lines: a U traced over the crowned bonnet skin, plus the
     nose panel joint */
  /* 3 mm proud so the line reads, 11 mm sunk so it can never float */
  const SEAT = -0.004;
  kit.both((s) => {
    for (let i = 0; i < 18; i++) {
      const z = 1.26 + (i + 0.5) * (0.96 / 18);
      kit.box(0.012, 0.014, 0.96 / 18, m.seam, [s * 0.83, deckY(0.83, z) + SEAT, z]);
    }
    for (let i = 0; i < 8; i++) {
      const x = -0.83 + (i + 0.5) * (1.66 / 8);
      kit.box(1.66 / 8, 0.014, 0.012, m.seam, [x, deckY(x, 2.19) + SEAT, 2.19]);
    }
    for (let i = 0; i < 9; i++) {
      const z = 1.4 + (i + 0.5) * (0.66 / 9);
      kit.box(0.01, 0.016, 0.66 / 9, m.seam, [s * 0.56, deckY(0.56, z) + SEAT, z]);
    }
  });
}

/* cowl / scuttle + wipers (built with the greenhouse but kept here) */
export function buildCowl(kit: Kit) {
  const m: Mats = kit.mats;
  kit.rbox(1.76, 0.06, 0.2, 0.025, m.plastic, [0, 1.198, 1.13]);
  kit.box(1.6, 0.02, 0.1, m.plasticSoft, [0, 1.228, 1.13]);
  /* screen-washer jets */
  kit.both((s) => {
    kit.box(0.032, 0.014, 0.022, m.plastic, [s * 0.46, 1.231, 1.115], [0.3, 0, 0]);
    kit.box(0.012, 0.006, 0.008, m.chrome, [s * 0.46, 1.238, 1.104], [0.3, 0, 0]);
  });
  /* wiper arms + blades parked on the screen */
  kit.both((s) => {
    const rake = -0.62;
    kit.cyl(0.028, 0.028, 0.03, m.plastic, [s * 0.36, 1.215, 1.115], [rake, 0, 0], 12);
    kit.box(0.02, 0.42, 0.018, m.plastic, [s * 0.42, 1.31, 1.07], [rake, 0, s * 0.06]);
    kit.box(0.028, 0.52, 0.022, m.plastic, [s * 0.5, 1.4, 1.02], [rake, 0, s * 0.1]);
  });
}

/* ---------------- REAR ---------------- */

export function buildRear(kit: Kit, wordMat?: THREE.Material | null) {
  const m: Mats = kit.mats;

  /* tail lamps: square housings with 4-point clover lamps */
  kit.both((s) => {
    const cx = s * 0.79;
    kit.rbox(0.3, 0.24, 0.07, 0.025, m.trim, [cx, 1.03, -2.245]);
    kit.rbox(0.27, 0.21, 0.02, 0.015, m.plasticSoft, [cx, 1.03, -2.283]);
    for (const dx of [-0.055, 0.055])
      for (const dy of [-0.055, 0.055])
        kit.box(0.07, 0.068, 0.022, m.tail, [cx + dx, 1.03 + dy, -2.3]);
    kit.box(0.03, 0.19, 0.02, m.tail, [cx + s * 0.005, 1.03, -2.3]);
    const lens = kit.rbox(0.285, 0.225, 0.02, 0.02, m.tailShell, [cx, 1.03, -2.312]);
    lens.castShadow = false;
  });

  /* body-colour band with spaced JETOUR letters */
  if (wordMat) {
    const w = kit.plane(1.0, 0.1, wordMat, [0, 1.03, -2.268], [0, Math.PI, 0]);
    w.castShadow = false;
  } else {
    kit.box(0.9, 0.1, 0.01, m.silver, [0, 1.03, -2.268]);
  }
  /* i-DM badge */
  kit.box(0.13, 0.035, 0.01, m.chrome, [0.62, 0.93, -2.262]);
  /* rear camera above the plate */
  kit.cyl(0.02, 0.02, 0.03, m.plastic, [0, 0.93, -2.275], [Math.PI / 2, 0, 0], 12);

  /* rear wiper, parked along the base of the backlight */
  {
    const zg = (x: number, y: number) => tailgateZ(x, y) + SCREEN.inset - 0.02;
    const px = 0.44;
    const py = 1.17;
    const bx = 0.02;
    const by = 1.205;
    const len = Math.hypot(bx - px, by - py);
    const ang = Math.atan2(by - py, bx - px);
    kit.cyl(0.028, 0.028, 0.03, m.plastic, [px, py, zg(px, py)], [Math.PI / 2, 0, 0], 14);
    kit.box(len, 0.024, 0.02, m.trim, [(px + bx) / 2, (py + by) / 2, zg((px + bx) / 2, (py + by) / 2)], [0, 0, ang]);
    kit.box(0.46, 0.032, 0.016, m.plastic, [0, by, zg(0, by)], [0, 0, 0.02]);
    kit.box(0.46, 0.02, 0.014, m.rubber, [0, by - 0.014, zg(0, by - 0.014)], [0, 0, 0.02]);
  }

  /* roof spoiler + high-mount stop lamp */
  const sp = poly([
    [-1.98, 1.771],
    [-2.07, 1.802],
    [-2.17, 1.83],
    [-2.2, 1.814],
    [-2.1, 1.782],
    [-2.02, 1.765],
  ]);
  const spG = new THREE.ExtrudeGeometry(sp, { depth: 1.76, bevelEnabled: false, curveSegments: 3 });
  spG.rotateY(-Math.PI / 2);
  spG.translate(0.88, 0, 0);
  kit.add(spG, m.paint);
  kit.rbox(0.52, 0.03, 0.03, 0.01, m.stopLamp, [0, 1.806, -2.172], [0.35, 0, 0]);

  /* chunky rear bumper */
  const rb = poly([
    [-2.08, 0.92],
    [-2.26, 0.9],
    [DIM.tail, 0.68],
    [-2.335, 0.47],
    [-2.15, 0.385],
    [-2.08, 0.5],
  ]);
  const rbG = new THREE.ExtrudeGeometry(rb, { depth: 1.86, bevelEnabled: false, curveSegments: 3 });
  rbG.rotateY(-Math.PI / 2);
  rbG.translate(0.93, 0, 0);
  kit.add(rbG, m.cladding);

  kit.rbox(1.0, 0.05, 0.14, 0.03, m.alu, [0, 0.42, -2.28], [0.25, 0, 0]);
  kit.both((s) => {
    kit.box(0.16, 0.055, 0.03, m.tail, [s * 0.83, 0.56, -2.333]);
    kit.cyl(0.022, 0.022, 0.02, m.plasticSoft, [s * 0.34, 0.63, -2.341], [Math.PI / 2, 0, 0], 12);
    kit.cyl(0.022, 0.022, 0.02, m.plasticSoft, [s * 0.62, 0.6, -2.339], [Math.PI / 2, 0, 0], 12);
  });
  /* tow-eye cover */
  kit.cyl(0.035, 0.035, 0.02, m.plastic, [-0.55, 0.45, -2.33], [Math.PI / 2, 0, 0], 12);
}

/* ---------------- charge port + glasshouse details ---------------- */

export function buildDetails(kit: Kit) {
  const m: Mats = kit.mats;
  /* PHEV charge port on the front-left fender (driver's side in LHD) */
  kit.rbox(0.12, 0.12, 0.02, 0.03, m.paint, [0.965, 1.0, 1.72], [0, -0.06, 0]);
  kit.cyl(0.028, 0.028, 0.012, m.trim, [0.985, 1.0, 1.72], [0, Math.PI / 2, 0], 16);

  /* front parking sensors in the grille surround */
  kit.both((s) => kit.cyl(0.018, 0.018, 0.012, m.plasticSoft, [s * 0.5, 1.19, 2.31], [Math.PI / 2, 0, 0], 12));

  /* fuel flap (rear-right quarter, opposite the driver) */
  kit.rbox(0.15, 0.15, 0.02, 0.04, m.paint, [-0.95, 0.85, -1.42], [0, 0.05, 0]);

  /* side repeater in the front fender */
  kit.both((s) => kit.box(0.012, 0.03, 0.11, m.indicator, [s * 0.968, 1.16, 1.62]));

  /* door mirror puddle / lower trim */
  kit.both((s) => kit.box(0.01, 0.02, 0.1, m.trim, [s * 1.06, 1.28, 1.0], [0, s * 0.12, 0]));

  /* sunroof drain / roof seam */
  kit.box(1.4, 0.008, 0.02, m.seam, [0, 1.79, 0.34]);
}

/* ---------------- wheel ---------------- */

/** one wheel built around its local +Y axis (rotated into place later) */
export function makeWheelTemplate(kit: Kit) {
  const m: Mats = kit.mats;
  const g = new THREE.Group();

  const put = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };

  /* tyre: lathed carcass (axis = local Y) */
  const prof: [number, number][] = [
    [0.2455, 0.118],
    [0.272, 0.119],
    [0.31, 0.116],
    [0.345, 0.108],
    [0.368, 0.088],
    [0.381, 0.05],
    [0.3823, 0],
    [0.381, -0.05],
    [0.368, -0.088],
    [0.345, -0.108],
    [0.31, -0.116],
    [0.272, -0.119],
    [0.2455, -0.118],
  ];
  const tireGeo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 56);
  tireGeo.computeVertexNormals();
  put(new THREE.Mesh(tireGeo, m.tread));

  /* sidewall branding ring */
  const side1 = new THREE.Mesh(new THREE.RingGeometry(0.252, 0.322, 64), m.tireWall);
  side1.position.y = 0.1185;
  side1.rotation.x = -Math.PI / 2;
  g.add(side1);
  const side2 = side1.clone();
  side2.position.y = -0.1185;
  side2.rotation.x = Math.PI / 2;
  g.add(side2);

  /* rim: outer lip, 5 petal spokes, hub, nuts */
  const R = DIM.rimR;
  put(new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.99, 0.235, 40), m.alu));
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 0.995, 0.014, 10, 44), m.alu);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 0.117;
  g.add(lip);

  /* two-tone petal spokes: 5 petals, each a swept shape + a darker inset */
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.Shape();
    petal.moveTo(0.052, 0);
    petal.bezierCurveTo(0.07, 0.055, 0.062, 0.13, 0.036, 0.196);
    petal.lineTo(-0.036, 0.196);
    petal.bezierCurveTo(-0.07, 0.13, -0.075, 0.055, -0.052, 0);
    petal.closePath();
    const pg = new THREE.ExtrudeGeometry(petal, { depth: 0.055, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 10 });
    pg.translate(0, 0, 0.06);
    pg.rotateX(-Math.PI / 2);
    const pm = new THREE.Mesh(pg, m.alu);
    pm.rotation.y = a;
    put(pm);
    /* machined face insert */
    const inset = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.1), m.silver);
    inset.position.set(Math.sin(a) * 0.155, 0.118, Math.cos(a) * 0.155);
    inset.rotation.y = a;
    g.add(inset);
  }

  /* brake disc + caliper (inboard of the wheel face) */
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.022, 32), m.disc);
  disc.position.y = -0.015;
  g.add(disc);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.05, 20), m.darkMetal);
  hat.position.y = -0.02;
  g.add(hat);
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.11, 0.2), m.caliper);
  cal.position.set(0.17, -0.015, -0.02);
  cal.rotation.y = -0.35;
  g.add(cal);

  /* hub + centre cap */
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.078, 0.05, 24), m.darkMetal));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.062, 24), m.plastic);
  cap.position.y = 0.125;
  g.add(cap);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.02, 6), m.chrome);
    nut.position.set(Math.cos(a) * 0.045, 0.128, Math.sin(a) * 0.045);
    g.add(nut);
  }

  /* valve stem, sitting proud of the rim face */
  {
    const a = 0.9;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 8), m.rubber);
    stem.rotateY(-a);
    stem.rotateZ(-(Math.PI / 2 - 0.45));
    stem.position.set(Math.cos(a) * 0.205, 0.116, Math.sin(a) * 0.205);
    g.add(stem);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.014, 8), m.chrome);
    cap.rotateY(-a);
    cap.rotateZ(-(Math.PI / 2 - 0.45));
    cap.position.set(Math.cos(a) * 0.243, 0.136, Math.sin(a) * 0.243);
    g.add(cap);
  }
  return g;
}

/** clone the template onto the four hubs — local +Y always points outboard */
export function placeWheels(kit: Kit) {
  const template = makeWheelTemplate(kit);
  mergeByMaterial(template); // one draw call per material, per wheel
  const out: THREE.Group[] = [];
  for (const [side, az] of [
    [1, DIM.axleF],
    [-1, DIM.axleF],
    [1, DIM.axleR],
    [-1, DIM.axleR],
  ] as [1 | -1, number][]) {
    const w = template.clone(true);
    w.name = "wheel";
    w.userData.wheel = true;
    w.position.set((side * (az > 0 ? DIM.trackF : DIM.trackR)) / 2, DIM.tireR, az);
    w.rotation.set(0, 0, -side * Math.PI * 0.5);
    kit.group.add(w);
    out.push(w);
  }
  return out;
}

export type { V3 };
