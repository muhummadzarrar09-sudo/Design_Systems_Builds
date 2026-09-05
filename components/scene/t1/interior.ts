/* ===================================================================
   JETOUR T1 — cabin.  Seen through 42 % glass, so this is a real
   interior shell: layered dash with a floating 15.6" screen,
   rectangular cluster, bridge console with an open storage void,
   quilted sage leather seats, door cards with ambient strips,
   pano-roof aperture in the headliner, belts, boot trims.
   Everything lives inside |x| < 0.823 (the bodyshell inner wall).
   =================================================================== */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { Kit, Mats, V3, loftY, loftZ } from "./kit";

/** place a thin strap between two points (seat-belt webbing) */
function strap(
  kit: Kit,
  a: V3,
  b: V3,
  w: number,
  mat: THREE.Material,
  thick = 0.007,
) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const d = B.clone().sub(A);
  const len = d.length() || 1e-4;
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    d.clone().normalize(),
  );
  const e = new THREE.Euler().setFromQuaternion(q);
  return kit.box(w, len, thick, mat, [mid.x, mid.y, mid.z], [e.x, e.y, e.z]);
}

/* one horizontal quilt seam, tilted to follow a panel */
function quilt(
  kit: Kit,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  w: number,
  rx: number,
) {
  return kit.box(w, 0.009, 0.012, mat, [x, y, z], [rx, 0, 0]);
}

export function buildInterior(
  kit: Kit,
  screenMat?: THREE.Material | null,
  clusterMat?: THREE.Material | null,
) {
  const m: Mats = kit.mats;
  const scr = screenMat ?? m.piano;
  const clu = clusterMat ?? m.piano;

  /* ══════════════ 1. FLOOR, SILLS, BOOT ══════════════ */
  kit.box(1.56, 0.035, 2.5, m.carpet, [0, 0.4, -0.28]); // flat cabin floor
  kit.box(1.4, 0.04, 0.76, m.carpet, [0, 0.645, -1.82]); // boot board
  kit.both((s) => kit.box(0.15, 0.2, 1.95, m.cabin, [s * 0.755, 0.4, -0.1])); // door sills
  /* brushed scuff plates */
  kit.both((s) => {
    kit.box(0.1, 0.012, 0.66, m.alu, [s * 0.71, 0.5, 0.28]);
    kit.box(0.1, 0.012, 0.58, m.alu, [s * 0.71, 0.5, -0.98]);
  });
  /* rubber mats with stitched binding */
  kit.both((s) => {
    kit.rbox(0.5, 0.014, 0.72, 0.02, m.rubber, [s * 0.36, 0.428, 0.72]);
    kit.box(0.52, 0.008, 0.74, m.seam, [s * 0.36, 0.422, 0.72]);
    kit.rbox(0.44, 0.014, 0.62, 0.02, m.rubber, [s * 0.4, 0.428, -0.62]);
    kit.box(0.46, 0.008, 0.64, m.seam, [s * 0.4, 0.422, -0.62]);
  });

  /* ══════════════ 2. DASHBOARD ══════════════ */
  /* fascia body — crown must stay below the 1.22 m cowl line */
  kit.rbox(1.62, 0.3, 0.32, 0.06, m.cabin, [0, 0.94, 0.92], [-0.16, 0, 0]);
  /* sage leather upper roll + stitch seam */
  kit.rbox(1.6, 0.095, 0.33, 0.042, m.leather, [0, 1.11, 0.94], [-0.19, 0, 0]);
  kit.box(1.52, 0.009, 0.01, m.seam, [0, 1.077, 0.792]);
  /* defroster vent strip tucked under the screen base */
  kit.box(1.36, 0.02, 0.07, m.plastic, [0, 1.168, 1.095], [-0.36, 0, 0]);
  /* gloss band + teal ambient light bar */
  kit.box(1.5, 0.055, 0.02, m.trim, [0, 1.029, 0.783], [-0.1, 0, 0]);
  kit.box(1.46, 0.014, 0.012, m.ambient, [0, 0.996, 0.774]);
  /* four horizontal air vents */
  for (const x of [-0.605, -0.212, 0.212, 0.605]) {
    kit.rbox(0.32, 0.075, 0.018, 0.008, m.silver, [x, 0.949, 0.762], [-0.22, 0, 0]);
    kit.rbox(0.295, 0.052, 0.05, 0.01, m.cabin, [x, 0.949, 0.792], [-0.22, 0, 0]);
    for (let i = 0; i < 3; i++)
      kit.box(0.275, 0.006, 0.03, m.plastic, [x, 0.937 + i * 0.013, 0.778], [-0.22, 0, 0]);
  }
  /* cowl speaker grille + tweeter */
  kit.both((s) => {
    kit.cyl(0.055, 0.055, 0.008, m.meshMat, [s * 0.42, 1.068, 1.02], [0.36, 0, 0], 16);
    kit.cyl(0.028, 0.028, 0.01, m.meshMat, [s * 0.78, 1.046, 0.99], [0.5, s * 0.4, 0], 12);
  });
  /* knee bolster / lower dash */
  kit.box(1.58, 0.34, 0.06, m.cabin, [0, 0.7, 0.845], [0.24, 0, 0]);
  kit.both((s) => kit.box(0.03, 0.32, 0.32, m.cabin, [s * 0.8, 0.94, 0.92], [-0.16, 0, 0]));
  /* glovebox seam + handle, driver cubby + hood release */
  kit.box(0.5, 0.008, 0.01, m.seam, [-0.44, 0.82, 0.8], [0, 0, 0]);
  kit.rbox(0.14, 0.032, 0.03, 0.01, m.chrome, [-0.44, 0.78, 0.788]);
  kit.rbox(0.22, 0.09, 0.05, 0.015, m.cabin, [0.52, 0.72, 0.8]);
  kit.box(0.09, 0.03, 0.02, m.alu, [0.52, 0.66, 0.79]);
  /* footwell ambient lighting */
  kit.both((s) => kit.box(0.12, 0.014, 0.014, m.ambient, [s * 0.34, 0.66, 0.79]));

  /* ══════════════ 3. FLOATING 15.6" SCREEN ══════════════ */
  /* built as a group: a framed pad that reads from the cabin AND
     through the windscreen (the bezel is a frame, never a lid) */
  {
    const g = new THREE.Group();
    g.position.set(0, 1.202, 0.632);
    g.rotation.set(-0.15, 0, 0);
    kit.group.add(g);
    const face = new THREE.Mesh(new RoundedBoxGeometry(0.352, 0.204, 0.012, 2, 0.004), scr);
    face.castShadow = false;
    g.add(face);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.192, 0.016), m.cabin);
    back.position.z = -0.012;
    g.add(back);
    for (const [w, h, x, y] of [
      [0.376, 0.018, 0, 0.111],
      [0.376, 0.018, 0, -0.111],
      [0.018, 0.204, 0.185, 0],
      [0.018, 0.204, -0.185, 0],
    ] as [number, number, number, number][]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.026), m.trim);
      bar.position.set(x, y, 0.002);
      g.add(bar);
    }
    kit.box(0.075, 0.055, 0.12, m.cabin, [0, 1.09, 0.715], [-0.2, 0, 0]); // mount arm
  }
  /* piano touch-bar under the screen */
  kit.rbox(0.36, 0.05, 0.02, 0.008, m.piano, [0, 1.071, 0.668], [-0.15, 0, 0]);
  for (let i = 0; i < 5; i++)
    kit.box(0.035, 0.012, 0.008, m.silver, [-0.12 + i * 0.06, 1.071, 0.656], [-0.15, 0, 0]);

  /* ══════════════ 4. CLUSTER BINNACLE ══════════════ */
  {
    const g = new THREE.Group();
    g.position.set(0.35, 1.168, 0.678);
    g.rotation.set(-0.32, -0.12, 0);
    kit.group.add(g);
    const face = new THREE.Mesh(new RoundedBoxGeometry(0.272, 0.116, 0.012, 2, 0.004), clu);
    face.castShadow = false;
    g.add(face);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.262, 0.106, 0.016), m.cabin);
    back.position.z = -0.012;
    g.add(back);
    for (const [w, h, x, y] of [
      [0.296, 0.016, 0, 0.066],
      [0.296, 0.016, 0, -0.066],
      [0.016, 0.116, 0.148, 0],
      [0.016, 0.116, -0.148, 0],
    ] as [number, number, number, number][]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.024), m.trim);
      bar.position.set(x, y, 0.002);
      g.add(bar);
    }
    /* hood + cheeks: open at the back so the pod never reads as a blob */
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.02, 0.17), m.cabin);
    hood.position.set(0, 0.082, -0.055);
    hood.rotation.x = 0.22;
    g.add(hood);
    for (const sx of [1, -1]) {
      const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.16), m.cabin);
      cheek.position.set(sx * 0.152, 0.012, -0.05);
      g.add(cheek);
    }
    const chin = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.02, 0.15), m.cabin);
    chin.position.set(0, -0.052, -0.05);
    g.add(chin);
  }

  /* ══════════════ 5. STEERING WHEEL + COLUMN ══════════════ */
  {
    const g = new THREE.Group();
    g.position.set(0.36, 1.088, 0.598);
    g.rotation.set(-0.44, 0.1, 0);
    kit.group.add(g);
    const R = 0.186;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      let x = Math.cos(a) * R;
      let y = Math.sin(a) * R;
      if (y < -0.105) y = -0.105 + (y + 0.105) * 0.25; // flat bottom
      pts.push(new THREE.Vector3(x, y, 0));
    }
    const rim = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 80, 0.021, 10, true),
      m.leatherDark,
    );
    rim.castShadow = true;
    g.add(rim);
    /* 3 spokes */
    for (const [a, len, wdt] of [
      [0.36, 0.115, 0.036],
      [Math.PI - 0.36, 0.115, 0.036],
      [-Math.PI / 2, 0.1, 0.032],
    ] as [number, number, number][]) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(wdt * 2.2, len, 0.019), m.darkMetal);
      sp.position.set(Math.cos(a) * len * 0.55, Math.sin(a) * len * 0.55, 0);
      sp.rotation.z = -a + Math.PI / 2;
      g.add(sp);
    }
    /* hub + JETOUR roundel + switch pods */
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.062, 0.036, 22), m.leatherDark);
    hub.rotation.x = Math.PI / 2;
    g.add(hub);
    const logo = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.041, 22), m.silver);
    logo.rotation.x = Math.PI / 2;
    g.add(logo);
    for (const s of [1, -1]) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.085, 0.016), m.piano);
      pod.position.set(s * 0.098, 0.045, 0.008);
      g.add(pod);
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.014, 0.008), m.silver);
        b.position.set(s * 0.098, 0.072 - i * 0.026, 0.017);
        g.add(b);
      }
    }
  }
  /* column shroud + stalks */
  kit.cyl(0.058, 0.072, 0.17, m.cabin, [0.36, 1.048, 0.712], [1.06, 0.1, 0], 16);
  kit.both((s) =>
    kit.box(0.026, 0.026, 0.13, m.plastic, [0.36 + s * 0.075, 1.075, 0.7], [0.42, s * 0.22, 0]),
  );
  /* pedals + dead rest */
  kit.box(0.055, 0.13, 0.02, m.alu, [0.36, 0.53, 1.0], [0.55, 0, 0]); // accelerator
  kit.box(0.085, 0.1, 0.02, m.alu, [0.47, 0.55, 1.0], [0.55, 0, 0]); // brake
  kit.box(0.12, 0.02, 0.22, m.rubber, [0.2, 0.425, 1.0], [0.35, 0, 0]); // dead pedal

  /* ══════════════ 6. BRIDGE CENTRE CONSOLE ══════════════ */
  kit.both((s) => kit.box(0.05, 0.42, 1.2, m.cabin, [s * 0.178, 0.6, 0.05])); // side walls
  kit.box(0.36, 0.012, 1.1, m.rubber, [0, 0.408, 0.05]); // open storage floor
  kit.rbox(0.4, 0.05, 1.16, 0.02, m.piano, [0, 0.818, 0.05]); // floating top deck
  kit.both((s) => kit.box(0.012, 0.013, 1.02, m.ambient, [s * 0.208, 0.798, 0.05]));
  /* crystal gear knob on a chrome collar + leather boot */
  kit.cyl(0.036, 0.055, 0.06, m.leatherDark, [0, 0.815, 0.3], [0, 0, 0], 16);
  kit.cyl(0.03, 0.038, 0.05, m.chrome, [0, 0.842, 0.3], [0, 0, 0], 16);
  const knob = kit.sphere(0.045, m.crystal, [0, 0.888, 0.3], 22);
  knob.scale.y = 1.16;
  /* rotary drive-mode dial */
  kit.cyl(0.056, 0.056, 0.032, m.alu, [0, 0.836, 0.1], [0, 0, 0], 24);
  kit.torus(0.056, 0.005, m.darkMetal, [0, 0.836, 0.1], [Math.PI / 2, 0, 0], 26);
  kit.cyl(0.031, 0.031, 0.038, m.trim, [0, 0.85, 0.1], [0, 0, 0], 20);
  /* piano-key toggles */
  kit.rbox(0.3, 0.014, 0.1, 0.006, m.piano, [0, 0.826, 0.5]);
  for (let i = 0; i < 6; i++)
    kit.box(0.042, 0.012, 0.072, m.silver, [-0.112 + i * 0.045, 0.836, 0.505], [0.1, 0, 0]);
  /* wireless charge pad */
  kit.rbox(0.21, 0.016, 0.17, 0.008, m.piano, [0, 0.824, -0.16]);
  kit.box(0.19, 0.006, 0.15, m.rubber, [0, 0.833, -0.16]);
  /* twin cup holders */
  kit.both((s) => {
    kit.cyl(0.046, 0.041, 0.09, m.plastic, [s * 0.076, 0.794, -0.34], [0, 0, 0], 18, true);
    kit.cyl(0.04, 0.04, 0.008, m.rubber, [s * 0.076, 0.752, -0.34], [0, 0, 0], 16);
  });
  /* sliding armrest + console rear face with vents & USB-C */
  kit.rbox(0.29, 0.1, 0.5, 0.04, m.leather, [0, 0.835, -0.8]);
  kit.box(0.27, 0.008, 0.46, m.seam, [0, 0.878, -0.8]);
  kit.box(0.4, 0.28, 0.05, m.cabin, [0, 0.66, -0.63]);
  kit.both((s) => {
    kit.box(0.08, 0.035, 0.014, m.cabin, [s * 0.09, 0.71, -0.652]);
    kit.box(0.06, 0.006, 0.006, m.plastic, [s * 0.09, 0.685, -0.652]);
    kit.box(0.03, 0.012, 0.012, m.chrome, [s * 0.09, 0.655, -0.652]);
  });

  /* ══════════════ 7. SEATS ══════════════ */
  /* closed 14-pt bolstered cross-section in X/Y (cushion) */
  const secCushion = (w: number, yT: number, yB: number, b: number): [number, number][] => {
    const w2 = w / 2;
    return [
      [-w2, yB + 0.02], [-w2, yT - 0.02],
      [-w2 + 0.05, yT + b], [-w2 + 0.14, yT + b * 0.5],
      [-0.09, yT], [0, yT - 0.02], [0.09, yT],
      [w2 - 0.14, yT + b * 0.5], [w2 - 0.05, yT + b],
      [w2, yT - 0.02], [w2, yB + 0.02],
      [w2 * 0.5, yB], [0, yB - 0.02], [-w2 * 0.5, yB],
    ];
  };
  /* closed 14-pt bolstered cross-section in X/Z (backrest, bolsters +Z) */
  const secBack = (w: number, b: number, t: number): [number, number][] => {
    const w2 = w / 2;
    return [
      [-w2, -t], [-w2, 0],
      [-w2 + 0.05, b], [-w2 + 0.15, b * 0.5],
      [-0.09, 0], [0, 0.02], [0.09, 0],
      [w2 - 0.15, b * 0.5], [w2 - 0.05, b],
      [w2, 0], [w2, -t],
      [w2 * 0.5, -t - 0.02], [0, -t - 0.03], [-w2 * 0.5, -t - 0.02],
    ];
  };

  const seat = (px: number, pz: number, w: number, head: number) => {
    const y0 = 0.44;
    kit.both((s) => kit.box(0.05, 0.05, 0.46, m.darkMetal, [px + s * 0.2, y0, pz])); // rails
    kit.rbox(w - 0.12, 0.1, 0.44, 0.03, m.cabin, [px, y0 + 0.06, pz]); // plinth

    /* sculpted cushion: lofted bolstered sections front→back */
    const cz: { z: number; pts: [number, number][] }[] = [
      { z: pz + 0.27, pts: secCushion(w * 0.9, 0.585, 0.47, 0.045) },
      { z: pz + 0.16, pts: secCushion(w, 0.605, 0.46, 0.07) },
      { z: pz + 0.02, pts: secCushion(w, 0.6, 0.46, 0.07) },
      { z: pz - 0.12, pts: secCushion(w * 0.98, 0.59, 0.46, 0.06) },
      { z: pz - 0.24, pts: secCushion(w * 0.9, 0.615, 0.47, 0.05) },
    ];
    const cush = new THREE.Mesh(loftZ(cz), m.leather);
    cush.castShadow = true;
    cush.receiveShadow = true;
    kit.group.add(cush);

    /* sculpted backrest: lofted bolstered sections base→shoulder, reclined */
    const by: { y: number; pts: [number, number][] }[] = [
      { y: 0.0, pts: secBack(w * 0.94, 0.05, 0.1) },
      { y: 0.2, pts: secBack(w, 0.075, 0.12) },
      { y: 0.42, pts: secBack(w, 0.07, 0.12) },
      { y: 0.6, pts: secBack(w * 0.96, 0.06, 0.11) },
      { y: 0.74, pts: secBack(w * 0.8, 0.05, 0.1) },
    ];
    const back = new THREE.Mesh(loftY(by), m.leather);
    back.rotation.x = -0.24;
    back.position.set(px, 0.6, pz - 0.26);
    back.castShadow = true;
    back.receiveShadow = true;
    kit.group.add(back);

    kit.rbox(w - 0.06, 0.1, 0.16, 0.04, m.leatherDark, [px, 1.235, pz - 0.4], [0.24, 0, 0]); // shoulder roll
    /* back panel + map pocket */
    kit.rbox(w - 0.12, 0.56, 0.028, 0.02, m.cabin, [px, 0.96, pz - 0.35], [0.24, 0, 0]);
    kit.rbox(w - 0.28, 0.24, 0.026, 0.02, m.leatherDark, [px, 0.8, pz - 0.42], [0.3, 0, 0]);
    if (head) {
      kit.rbox(0.24, 0.15, 0.12, 0.045, m.leather, [px, 1.34, pz - 0.41], [0.22, 0, 0]);
      kit.both((s) =>
        kit.cyl(0.011, 0.011, 0.1, m.chrome, [px + s * 0.06, 1.25, pz - 0.44], [0.22, 0, 0], 10),
      );
    }
  };
  seat(0.36, 0.16, 0.56, 1);
  seat(-0.36, 0.16, 0.56, 1);

  /* ══════════════ 8. REAR BENCH (60/40) ══════════════ */
  /* sculpted rear bench cushion (lofted, bolstered) */
  {
    const bz: { z: number; pts: [number, number][] }[] = [
      { z: -0.74, pts: secCushion(1.28, 0.72, 0.6, 0.04) },
      { z: -0.88, pts: secCushion(1.34, 0.75, 0.59, 0.06) },
      { z: -1.05, pts: secCushion(1.34, 0.74, 0.59, 0.06) },
      { z: -1.22, pts: secCushion(1.28, 0.77, 0.6, 0.05) },
    ];
    const bc = new THREE.Mesh(loftZ(bz), m.leather);
    bc.castShadow = true;
    bc.receiveShadow = true;
    kit.group.add(bc);
  }
  /* sculpted rear bench backrest */
  {
    const bb: { y: number; pts: [number, number][] }[] = [
      { y: 0.0, pts: secBack(1.3, 0.05, 0.1) },
      { y: 0.25, pts: secBack(1.34, 0.07, 0.12) },
      { y: 0.5, pts: secBack(1.32, 0.06, 0.11) },
      { y: 0.66, pts: secBack(1.2, 0.05, 0.1) },
    ];
    const bbk = new THREE.Mesh(loftY(bb), m.leather);
    bbk.rotation.x = -0.3;
    bbk.position.set(0, 0.78, -1.24);
    bbk.castShadow = true;
    bbk.receiveShadow = true;
    kit.group.add(bbk);
  }
  kit.box(0.012, 0.56, 0.016, m.seam, [0.22, 1.06, -1.35], [0.3, 0, 0]); // 60/40 split
  for (let i = 0; i < 2; i++)
    quilt(kit, m.seam, 0, 0.86 + i * 0.16, -1.36 + i * 0.048, 1.04, 0.3);
  for (const x of [-0.46, 0, 0.46]) {
    kit.rbox(0.24, 0.15, 0.12, 0.045, m.leather, [x, 1.36, -1.38], [0.28, 0, 0]);
    kit.both((s) => kit.cyl(0.011, 0.011, 0.09, m.chrome, [x + s * 0.06, 1.27, -1.41], [0.28, 0, 0], 10));
  }
  /* centre armrest with cup holders */
  kit.rbox(0.36, 0.09, 0.44, 0.03, m.leather, [0, 0.865, -1.2], [1.4, 0, 0]);
  kit.both((s) => kit.cyl(0.04, 0.036, 0.05, m.plastic, [s * 0.1, 0.9, -1.13], [1.4, 0, 0], 14, true));
  /* isofix + rear footwell vents */
  kit.both((s) => {
    kit.box(0.06, 0.02, 0.09, m.plastic, [s * 0.4, 0.74, -1.2]);
    kit.box(0.07, 0.05, 0.02, m.cabin, [s * 0.3, 0.47, -0.62]);
  });

  /* ══════════════ 9. DOOR CARDS ══════════════ */
  const doorCard = (z: number, dz: number) =>
    kit.both((s) => {
      const X = 0.785;
      kit.rbox(0.055, 0.26, dz - 0.06, 0.02, m.cabin, [s * X, 1.13, z]); // upper cap
      kit.box(0.014, 0.013, dz - 0.24, m.ambient, [s * (X - 0.03), 1.006, z]); // ambient strip
      kit.rbox(0.05, 0.3, dz - 0.2, 0.03, m.leather, [s * (X - 0.01), 0.9, z]); // leather insert
      for (let i = 0; i < 3; i++)
        kit.box(0.012, 0.008, dz - 0.28, m.seam, [s * (X - 0.038), 0.855 + i * 0.07, z]);
      kit.rbox(0.13, 0.09, dz * 0.6, 0.035, m.leather, [s * (X - 0.06), 0.79, z + 0.08]); // armrest
      kit.box(0.13, 0.008, dz * 0.6, m.seam, [s * (X - 0.06), 0.833, z + 0.08]);
      /* switch pack */
      kit.rbox(0.05, 0.018, 0.22, 0.008, m.piano, [s * (X - 0.075), 0.848, z + 0.2]);
      for (let i = 0; i < 4; i++)
        kit.box(0.028, 0.012, 0.028, m.silver, [s * (X - 0.105), 0.86, z + 0.13 + i * 0.047]);
      /* pull handle */
      kit.rbox(0.05, 0.028, 0.2, 0.012, m.chrome, [s * (X - 0.1), 0.862, z - 0.16]);
      for (const dz2 of [-0.07, -0.25])
        kit.box(0.03, 0.03, 0.02, m.chrome, [s * (X - 0.095), 0.845, z + dz2]);
      /* door bin + speaker + lower card */
      kit.box(0.06, 0.17, dz * 0.46, m.cabin, [s * (X - 0.045), 0.6, z - 0.14]);
      kit.box(0.1, 0.02, dz * 0.46, m.cabin, [s * (X - 0.065), 0.52, z - 0.14]);
      kit.cyl(0.075, 0.075, 0.014, m.meshMat, [s * (X - 0.025), 0.66, z - 0.3], [0, 0, Math.PI / 2], 20);
      kit.box(0.05, 0.26, dz - 0.1, m.cabin, [s * (X - 0.015), 0.5, z]);
      kit.box(0.012, 0.04, 0.11, m.amber, [s * (X - 0.045), 0.44, z - 0.32]);
    });
  doorCard(0.62, 0.95);
  doorCard(-0.28, 0.95);

  /* ══════════════ 10. PILLAR TRIMS ══════════════ */
  kit.both((s) => {
    kit.box(0.05, 0.66, 0.1, m.headliner, [s * 0.79, 1.5, 0.96], [-0.66, 0, 0]); // A
    kit.box(0.06, 0.62, 0.13, m.headliner, [s * 0.79, 1.06, -0.3]); // B
    kit.box(0.05, 0.05, 0.14, m.cabin, [s * 0.78, 0.76, -0.3]); // belt retractor
    kit.rbox(0.09, 0.05, 0.05, 0.015, m.cabin, [s * 0.78, 1.3, -0.3]); // height adjuster
    kit.box(0.06, 0.44, 0.32, m.cabin, [s * 0.79, 1.11, -1.5], [0.1, 0, 0]); // C / quarter, above the arch
    kit.box(0.06, 0.2, 0.32, m.cabin, [s * 0.655, 0.8, -1.5], [0.1, 0, 0]); // over the wheel tub
    kit.box(0.15, 0.06, 0.32, m.cabin, [s * 0.735, 0.92, -1.5], [0.1, 0, 0]); // step between them
    kit.cyl(0.06, 0.06, 0.012, m.meshMat, [s * 0.795, 1.06, -1.46], [0, 0, Math.PI / 2], 16);
    kit.box(0.014, 0.3, 0.014, m.ambient, [s * 0.755, 1.18, -1.5], [0.1, 0, 0]);
    kit.box(0.06, 0.5, 0.3, m.cabin, [s * 0.72, 1.0, -1.94], [0.1, 0, 0]); // D (boot)
  });

  /* ══════════════ 11. HEADLINER WITH PANO APERTURE ══════════════ */
  const hy = 1.708;
  kit.box(1.58, 0.026, 0.26, m.headliner, [0, hy, 0.42]); // ahead of the glass
  kit.box(1.58, 0.026, 0.46, m.headliner, [0, hy, -1.53]); // behind it
  kit.both((s) => kit.box(0.25, 0.026, 1.6, m.headliner, [s * 0.685, hy, -0.51]));
  /* aperture surround */
  kit.box(1.14, 0.012, 0.05, m.trim, [0, hy - 0.012, 0.29]);
  kit.box(1.1, 0.012, 0.05, m.trim, [0, hy - 0.012, -1.31]);
  kit.both((s) => kit.box(0.05, 0.012, 1.62, m.trim, [s * 0.565, hy - 0.012, -0.51]));
  /* grab handles */
  kit.both((s) =>
    [0.55, -0.85].forEach((z) => {
      kit.cyl(0.014, 0.014, 0.22, m.cabin, [s * 0.735, hy - 0.07, z], [Math.PI / 2, 0, 0], 10);
      for (const dz of [-0.09, 0.09])
        kit.box(0.022, 0.055, 0.022, m.cabin, [s * 0.735, hy - 0.035, z + dz]);
    }),
  );
  /* sun visors (stowed) + vanity mirror + light */
  kit.both((s) => {
    kit.rbox(0.42, 0.035, 0.27, 0.014, m.headliner, [s * 0.27, hy - 0.055, 0.62], [0.06, 0, 0]);
    kit.box(0.17, 0.1, 0.006, m.trim, [s * 0.27, hy - 0.078, 0.62], [0.06, 0, 0]);
    kit.box(0.06, 0.012, 0.012, m.dome, [s * 0.27, hy - 0.03, 0.55]);
  });
  /* rear-view mirror + 540° camera housing */
  kit.rbox(0.27, 0.075, 0.05, 0.015, m.cabin, [0, hy - 0.09, 0.95]);
  kit.box(0.25, 0.058, 0.006, m.piano, [0, hy - 0.09, 0.925], [0.06, 0, 0]);
  kit.box(0.04, 0.05, 0.05, m.cabin, [0, hy - 0.045, 0.97]);
  kit.box(0.15, 0.05, 0.07, m.plastic, [0, hy - 0.012, 0.99]);
  /* dome lights + roof ambient */
  kit.rbox(0.3, 0.018, 0.16, 0.008, m.dome, [0, hy - 0.028, 0.1]);
  kit.rbox(0.16, 0.018, 0.16, 0.008, m.dome, [0, hy - 0.028, -0.9]);
  kit.both((s) => kit.box(0.012, 0.012, 1.9, m.ambient, [s * 0.7, hy - 0.02, -0.5]));

  /* ══════════════ 12. SEAT BELTS ══════════════ */
  kit.both((s) => {
    const x = s * 0.36;
    strap(kit, [s * 0.79, 1.4, -0.3], [x + s * 0.16, 0.58, -0.02], 0.042, m.cabin);
    strap(kit, [x + s * 0.16, 0.58, -0.02], [s * 0.76, 0.5, -0.12], 0.04, m.cabin);
    kit.rbox(0.05, 0.09, 0.03, 0.01, m.plastic, [x + s * 0.16, 0.53, -0.01]); // buckle
    kit.box(0.02, 0.03, 0.016, m.chrome, [x + s * 0.16, 0.59, -0.01]);
    strap(kit, [s * 0.62, 1.2, -1.42], [s * 0.45, 0.72, -0.95], 0.04, m.cabin); // rear
  });

  /* ══════════════ 13. BOOT ══════════════ */
  kit.both((s) => {
    kit.box(0.06, 0.54, 0.34, m.cabin, [s * 0.78, 0.9, -2.0]); // behind the arch
    kit.box(0.06, 0.54, 0.4, m.cabin, [s * 0.655, 0.9, -1.63]); // over the wheel tub
    kit.box(0.15, 0.54, 0.03, m.cabin, [s * 0.735, 0.9, -1.835]); // step
    kit.box(0.05, 0.014, 0.6, m.alu, [s * 0.76, 0.672, -2.0]); // load sill
    kit.rbox(0.1, 0.06, 0.03, 0.012, m.chrome, [s * 0.72, 1.12, -1.62]); // seat release
    kit.cyl(0.1, 0.1, 0.05, m.meshMat, [s * 0.755, 0.8, -2.0], [0, 0, Math.PI / 2], 18);
  });
  kit.box(1.4, 0.03, 0.62, m.cabin, [0, 0.9, -1.45], [0.12, 0, 0]); // parcel shelf
  kit.both((s) => kit.cyl(0.08, 0.08, 0.016, m.meshMat, [s * 0.42, 0.915, -1.44], [0, 0, 0], 18));
  kit.box(0.09, 0.022, 0.05, m.dome, [0.62, 1.02, -1.92]); // boot lamp
  kit.box(1.3, 0.5, 0.03, m.cabin, [0, 1.06, -2.09]); // tailgate inner trim
}
