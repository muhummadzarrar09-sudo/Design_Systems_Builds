/* ===================================================================
   JETOUR T1 — body shell (lofted tub), greenhouse, roof, arches,
   tailgate, door hardware.  Everything is built from the true
   4705 × 1967 × 1843 mm / 2800 mm wheelbase envelope.
   =================================================================== */

import * as THREE from "three";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";
import { RoundedBoxGeometry } from "three-stdlib";
import { DIM, Kit, Mats, loftY, loftZ, poly, smoothKeys, troughX, trs, type V3 } from "./kit";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ---------------- cross-section ---------------- */

type Sec = {
  z: number;
  hw: number; // half width at the shoulder (widest)
  hwTop: number; // half width at the beltline
  yBot: number; // underside
  yTop: number; // hood line / beltline
  yFloor: number; // interior floor height
  tub: number; // 0 = closed deck (hood), 1 = open cabin
  cr?: number; // crown of the top face
};

/**
 * One closed section, always 22 points, wound clockwise seen from +Z:
 *   A: left-outer-top → right-outer-top   (crowned deck  ⇄  door tops + inner walls + floor)
 *   R: down the outer right flank
 *   B: across the underside
 *   L: up the outer left flank
 */
function section(s: Sec): [number, number][] {
  const { hw, hwTop, yBot, yTop } = s;
  /* clamp: the Catmull-Rom resample overshoots, and CSG hates a
     self-intersecting section (it produces NaN vertices) */
  const t = clamp(s.tub, 0, 1);
  const cr = s.cr ?? 0.014;
  const wall = 0.145; // door/side structure → 1.60 m interior width
  const inTop = Math.min(hwTop - wall, hw * 0.9);
  const yFl = Math.min(s.yFloor, yTop - 0.2);

  const deckA: [number, number][] = [
    [-hwTop, yTop],
    [-hwTop * 0.62, yTop + cr * 0.55],
    [-hwTop * 0.3, yTop + cr],
    [0, yTop + cr],
    [hwTop * 0.3, yTop + cr],
    [hwTop * 0.62, yTop + cr * 0.55],
    [hwTop, yTop],
  ];
  const tubA: [number, number][] = [
    [-hwTop, yTop],
    [-inTop, yTop - 0.03],
    [-inTop - 0.03, Math.min(yFl + 0.07, yTop - 0.12)],
    [0, yFl],
    [inTop + 0.03, Math.min(yFl + 0.07, yTop - 0.12)],
    [inTop, yTop - 0.03],
    [hwTop, yTop],
  ];
  const A = deckA.map((p, i) => [lerp(p[0], tubA[i][0], t), lerp(p[1], tubA[i][1], t)] as [number, number]);
  const R: [number, number][] = [
    [hwTop, yTop - 0.05],
    [hw, yTop - 0.26],
    [hw * 0.998, yBot + 0.42],
    [hw * 0.975, yBot + 0.2],
    [hw * 0.9, yBot + 0.06],
    [hw * 0.72, yBot],
    [hw * 0.4, yBot - 0.008],
  ];
  const B: [number, number][] = [
    [0, yBot - 0.012],
    [-hw * 0.4, yBot - 0.008],
  ];
  const L: [number, number][] = [
    [-hw * 0.72, yBot],
    [-hw * 0.9, yBot + 0.06],
    [-hw * 0.975, yBot + 0.2],
    [-hw * 0.998, yBot + 0.42],
    [-hw, yTop - 0.26],
    [-hwTop, yTop - 0.05],
  ];
  return [...A, ...R, ...B, ...L];
}

/* ---------------- the shell ---------------- */

/* ── deck surface model ─────────────────────────────────────────────
   Mirrors buildBodyShell exactly (same keys, same smoothing, same
   crown) so exterior trim can be laid ON the skin instead of near it.
   `cr` is only carried by the first key on purpose — smoothKeys then
   resolves it to 0.009 between z 2.20–2.26 and 0 everywhere else,
   which is what the loft actually does.
   ------------------------------------------------------------------ */
const DECK_KEYS = [
  { z: 2.26, hwTop: 0.855, yTop: 1.145, cr: 0.009 },
  { z: 2.2, hwTop: 0.888, yTop: 1.153 },
  { z: 2.05, hwTop: 0.923, yTop: 1.165 },
  { z: 1.85, hwTop: 0.94, yTop: 1.177 },
  { z: 1.6, hwTop: 0.947, yTop: 1.192 },
  { z: 1.4345, hwTop: 0.948, yTop: 1.203 },
  { z: 1.26, hwTop: 0.947, yTop: 1.215 },
  { z: 1.16, hwTop: 0.947, yTop: 1.225 },
  { z: 0.9, hwTop: 0.946, yTop: 1.23 },
  { z: 0.5, hwTop: 0.947, yTop: 1.238 },
  { z: 0.0, hwTop: 0.95, yTop: 1.245 },
  { z: -0.6, hwTop: 0.95, yTop: 1.248 },
  { z: -1.0, hwTop: 0.948, yTop: 1.245 },
  { z: -1.25, hwTop: 0.946, yTop: 1.243 },
  { z: -1.3655, hwTop: 0.945, yTop: 1.24 },
  { z: -1.7, hwTop: 0.938, yTop: 1.235 },
  { z: -1.95, hwTop: 0.929, yTop: 1.228 },
  { z: -2.08, hwTop: 0.919, yTop: 1.222 },
] as { z: number; hwTop: number; yTop: number; cr?: number }[];
const DECK_SAMPLES = smoothKeys(DECK_KEYS, 6);

/** Y of the painted deck skin over the bonnet at (x, z). */
/** Z of the tailgate's outer skin at (x, y) — the loft bulges rearward
    towards the centre line, so anything mounted on it has to follow. */
export function tailgateZ(x: number, y: number): number {
  const t = clamp((y - 0.85) / 0.918, 0, 1);
  const zR = -2.255 + t * 0.155;
  const hw = 0.9 - (1 - t) * 0.05;
  const r = 0.07 + t * 0.02;
  const ax = Math.min(Math.abs(x), hw);
  return ax <= hw - r ? zR - 1.05 * r + (ax / (hw - r)) * 0.05 * r : zR - r + (ax - hw + r);
}

/* rear-screen aperture (the tailgate is cut away so the glass shows) */
export const SCREEN = { x: 0.845, y0: 1.12, y1: 1.69, inset: 0.022 };

export function deckY(x: number, z: number): number {
  const S = DECK_SAMPLES;
  let i = 0;
  while (i < S.length - 2 && S[i + 1].z > z) i++;
  const a = S[i];
  const b = S[i + 1] ?? a;
  const t = b.z === a.z ? 0 : clamp((a.z - z) / (a.z - b.z), 0, 1);
  const yTop = lerp(a.yTop, b.yTop, t);
  const hwTop = lerp(a.hwTop, b.hwTop, t);
  /* cr is UNDEFINED once smoothKeys drops the key — section() then
     falls back to 0.014, so the crown has to be sampled the same way */
  const cr = lerp(a.cr ?? 0.014, b.cr ?? 0.014, t);
  const ax = Math.min(Math.abs(x), hwTop);
  const q = ax / hwTop;
  const crown = q <= 0.3 ? cr : q >= 0.62 ? cr * 0.55 * (1 - (q - 0.62) / 0.38) : cr * (1 - (q - 0.3) / 0.32 * 0.45);
  return yTop + crown;
}

export function buildBodyShell(kit: Kit) {
  const m: Mats = kit.mats;
  const keys: Sec[] = [
    /* ── front clip (closed deck = bonnet) ── */
    { z: 2.26, hw: 0.885, hwTop: 0.855, yBot: 0.56, yTop: 1.145, yFloor: 0.6, tub: 0, cr: 0.009 },
    { z: 2.2, hw: 0.914, hwTop: 0.888, yBot: 0.5, yTop: 1.153, yFloor: 0.6, tub: 0 },
    { z: 2.05, hw: 0.948, hwTop: 0.923, yBot: 0.44, yTop: 1.165, yFloor: 0.58, tub: 0 },
    { z: 1.85, hw: 0.962, hwTop: 0.94, yBot: 0.4, yTop: 1.177, yFloor: 0.56, tub: 0 },
    { z: 1.6, hw: 0.968, hwTop: 0.947, yBot: 0.366, yTop: 1.192, yFloor: 0.54, tub: 0 },
    { z: 1.4345, hw: 0.968, hwTop: 0.948, yBot: 0.352, yTop: 1.203, yFloor: 0.5, tub: 0 },
    /* ── cowl / scuttle: deck closes over 0.12 m ── */
    { z: 1.26, hw: 0.967, hwTop: 0.947, yBot: 0.34, yTop: 1.215, yFloor: 0.42, tub: 0.25 },
    { z: 1.16, hw: 0.966, hwTop: 0.947, yBot: 0.335, yTop: 1.225, yFloor: 0.375, tub: 1 },
    /* ── cabin (open tub so the interior reads through the glass) ── */
    { z: 0.9, hw: 0.964, hwTop: 0.946, yBot: 0.316, yTop: 1.23, yFloor: 0.372, tub: 1 },
    { z: 0.5, hw: 0.965, hwTop: 0.947, yBot: 0.3, yTop: 1.238, yFloor: 0.37, tub: 1 },
    { z: 0.0, hw: 0.968, hwTop: 0.95, yBot: 0.296, yTop: 1.245, yFloor: 0.37, tub: 1 },
    { z: -0.6, hw: 0.968, hwTop: 0.95, yBot: 0.296, yTop: 1.248, yFloor: 0.372, tub: 1 },
    { z: -1.0, hw: 0.966, hwTop: 0.948, yBot: 0.3, yTop: 1.245, yFloor: 0.4, tub: 1 },
    { z: -1.25, hw: 0.964, hwTop: 0.946, yBot: 0.305, yTop: 1.243, yFloor: 0.55, tub: 1 },
    /* ── boot ── */
    { z: -1.3655, hw: 0.962, hwTop: 0.945, yBot: 0.31, yTop: 1.24, yFloor: 0.62, tub: 1 },
    { z: -1.7, hw: 0.955, hwTop: 0.938, yBot: 0.325, yTop: 1.235, yFloor: 0.62, tub: 1 },
    { z: -1.95, hw: 0.946, hwTop: 0.929, yBot: 0.345, yTop: 1.228, yFloor: 0.62, tub: 1 },
    { z: -2.08, hw: 0.936, hwTop: 0.919, yBot: 0.36, yTop: 1.222, yFloor: 0.63, tub: 1 },
  ];
  const stations = smoothKeys(keys, 6).map((st) => ({ z: st.z, pts: section(st) }));
  const geo = loftZ(stations);

  /* ── angular wheel arches, 0.88 m openings ── */
  const archPts: [number, number][] = [
    [-0.44, -0.12],
    [-0.44, 0.14],
    [-0.425, 0.29],
    [-0.37, 0.4],
    [-0.26, 0.422],
    [-0.12, 0.435],
    [0.12, 0.435],
    [0.26, 0.422],
    [0.37, 0.4],
    [0.425, 0.29],
    [0.44, 0.14],
    [0.44, -0.12],
  ];

  const ev = new Evaluator();
  ev.useGroups = false;
  let body = new Brush(geo, m.paint);
  body.updateMatrixWorld(true);

  for (const az of [DIM.axleF, DIM.axleR]) {
    for (const side of [1, -1]) {
      /* only cut outboard of x = ±0.66 so the cabin floor survives */
      const shape = poly(archPts.map(([z, y]) => [z + az, y + 0.4] as [number, number]));
      const g = new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false, curveSegments: 3 });
      g.rotateY(-Math.PI / 2); // shape.x → +Z, extrude → −X
      g.translate(side > 0 ? 1.46 : 0.7, 0, 0); // spans |x| ∈ [0.70, 1.46]
      const cutter = new Brush(g, m.plastic);
      cutter.updateMatrixWorld(true);
      body = ev.evaluate(body, cutter, SUBTRACTION);
    }
  }

  const shell = new THREE.Mesh(body.geometry, m.paint);
  shell.castShadow = true;
  shell.receiveShadow = true;
  shell.name = "body-shell";
  kit.group.add(shell);

  /* ── closed wheel-arch liners (you can never see into the cabin) ── */
  const linerPts = archPts.map(([z, y]) => [z * 0.985, y * 0.985] as [number, number]);
  kit.both((s) => {
    for (const az of [DIM.axleF, DIM.axleR]) {
      const pts = linerPts.map(([z, y]) => [z + az, y + 0.4] as [number, number]);
      kit.add(troughX(pts, s > 0 ? 0.68 : -0.995, s > 0 ? 0.995 : -0.68), m.liner);
      /* inner fender wall: closes the well inboard so a side-on ray
         can never travel through the pocket into the cabin */
      kit.box(0.03, 0.64, 0.92, m.liner, [s * 0.705, 0.58, az]);
      for (const dz of [-0.435, 0.435]) kit.box(0.3, 0.5, 0.02, m.liner, [s * 0.84, 0.53, az + dz]);
    }
  });

  /* ── floor pan / underbody ── */
  kit.box(1.84, 0.08, 3.6, m.plasticSoft, [0, 0.3, -0.35]);
  kit.box(1.6, 0.06, 0.7, m.plasticSoft, [0, 0.33, 1.85]);
  kit.box(1.6, 0.06, 0.7, m.plasticSoft, [0, 0.33, -1.95]);
  kit.box(1.2, 0.1, 0.6, m.darkMetal, [0, 0.28, -1.9]);
  kit.cyl(0.055, 0.055, 1.1, m.darkMetal, [-0.4, 0.26, -1.0], [0, 0, Math.PI / 2], 12);
  kit.both((s) => kit.box(0.14, 0.2, 1.9, m.plastic, [s * 0.9, 0.36, -0.02]));

  return shell;
}

/* ---------------- curved panes ---------------- */

export function curvedQuad(c: [V3, V3, V3, V3], bulge: number, nu = 10, nv = 10) {
  const v = c.map((p) => new THREE.Vector3(...p));
  const right = v[1].clone().sub(v[0]);
  const up = v[3].clone().sub(v[0]);
  const n = right.clone().cross(up).normalize();
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= nv; j++)
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const w = j / nv;
      const p = v[0].clone().addScaledVector(right, u).addScaledVector(up, w);
      p.addScaledVector(n, bulge * Math.sin(Math.PI * u) * Math.sin(Math.PI * w));
      pos.push(p.x, p.y, p.z);
      uv.push(u, w);
    }
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i;
      idx.push(a, a + 1, a + nu + 2, a, a + nu + 2, a + nu + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ---------------- greenhouse ---------------- */

export function buildGreenhouse(kit: Kit) {
  const m: Mats = kit.mats;
  const belt = DIM.belt;

  /* windscreen */
  kit.add(
    curvedQuad(
      [
        [-0.885, 1.2, 1.185],
        [0.885, 1.2, 1.185],
        [0.9, 1.768, 0.795],
        [-0.9, 1.768, 0.795],
      ],
      0.045,
      14,
      10,
    ),
    m.glass,
  );

  /* A-pillars */
  kit.both((s) => {
    const a = new THREE.Vector3(s * 0.945, 1.2, 1.185);
    const b = new THREE.Vector3(s * 0.9, 1.783, 0.78);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    const ang = Math.atan2(dir.z, dir.y);
    kit.box(0.105, dir.length() + 0.02, 0.1, m.paint, [mid.x, mid.y, mid.z], [ang, 0, 0]);
    kit.box(0.05, dir.length(), 0.02, m.trim, [mid.x - s * 0.035, mid.y, mid.z + 0.03], [ang, 0, 0]);
  });

  /* door glass */
  const panes: [V3, V3, V3, V3][] = [
    [
      [0.925, belt - 0.028, 1.13],
      [0.925, belt - 0.028, 0.335],
      [0.905, 1.735, 0.335],
      [0.905, 1.735, 0.795],
    ],
    [
      [0.925, belt - 0.028, 0.275],
      [0.925, belt - 0.028, -0.72],
      [0.905, 1.735, -0.72],
      [0.905, 1.735, 0.275],
    ],
  ];
  kit.both((s) => {
    for (const p of panes)
      kit.add(curvedQuad(p.map((v) => [v[0] * s, v[1], v[2]] as V3) as [V3, V3, V3, V3], 0.022, 10, 8), m.glass);

    /* louvered quarter glass — the T1 signature */
    kit.add(
      curvedQuad(
        [
          [0.92 * s, belt - 0.028, -0.78],
          [0.915 * s, belt - 0.028, -1.46],
          [0.898 * s, 1.735, -1.46],
          [0.9 * s, 1.735, -0.78],
        ],
        0.02,
        10,
        8,
      ),
      m.glassDark,
    );
    for (let i = 0; i < 4; i++)
      kit.box(0.03, 0.032, 0.66, m.trim, [s * 0.928, 1.35 + i * 0.11, -1.12], [0, s * 0.02, 0]);

    /* B / C pillars */
    kit.box(0.05, 0.5, 0.115, m.trim, [s * 0.935, 1.48, 0.305]);
    kit.box(0.05, 0.5, 0.125, m.trim, [s * 0.93, 1.48, -0.75]);

    /* D-pillar / rear quarter */
    const dp: [number, number][] = [
      [0.905, 1.235],
      [0.932, 1.4],
      [0.93, 1.64],
      [0.9, 1.768],
      [0.86, 1.785],
      [0.86, 1.235],
    ];
    kit.extrude(poly(dp.map(([x, y]) => [x * s, y] as [number, number])), 0.5, m.paint, [0, 0, -1.95]);

    /* beltline strip + drip rail */
    kit.box(0.035, 0.022, 3.05, m.silver, [s * 0.938, 1.252, -0.42]);
    kit.box(0.05, 0.045, 2.75, m.paint, [s * 0.9, 1.735, -0.55]);
    kit.box(0.014, 0.014, 2.75, m.trim, [s * 0.918, 1.712, -0.55]);
  });

  /* rear screen — laid 22 mm inside the tailgate skin so it reads as
     glass set into an aperture instead of a pane floating behind it */
  {
    const nx = 14;
    const ny = 12;
    const y0 = 1.05;
    const y1 = 1.75;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let j = 0; j <= ny; j++)
      for (let i = 0; i <= nx; i++) {
        const y = y0 + ((y1 - y0) * j) / ny;
        /* taper with the tailgate so no sliver of glass escapes the shell */
        const hwv = 0.9 - (1 - (y - 0.85) / 0.918) * 0.05 - 0.008;
        const x = hwv * ((2 * i) / nx - 1);
        pos.push(x, y, tailgateZ(x, y) + SCREEN.inset);
        uv.push(i / nx, j / ny);
      }
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i;
        idx.push(a, a + 1, a + nx + 2, a, a + nx + 2, a + nx + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const scr = kit.add(g, m.glassDark);
    scr.name = "rear-screen";
  }
  /* black aperture surround, seated in the step between skin and glass */
  {
    const zAt = (x: number, y: number) => tailgateZ(x, y) + SCREEN.inset;
    const seg = 10;
    for (const sx of [1, -1])
      for (let i = 0; i < seg; i++) {
        const y = SCREEN.y0 + ((SCREEN.y1 - SCREEN.y0) * (i + 0.5)) / seg;
        kit.box(0.032, (SCREEN.y1 - SCREEN.y0) / seg, 0.05, m.trim, [sx * 0.862, y, zAt(0.862, y)]);
      }
    for (const y of [SCREEN.y0 - 0.016, SCREEN.y1 + 0.016])
      for (let i = 0; i < seg; i++) {
        const x = -0.875 + (1.75 * (i + 0.5)) / seg;
        kit.box(1.75 / seg, 0.032, 0.05, m.trim, [x, y, zAt(x, y)]);
      }
  }
}

/* ---------------- roof ---------------- */

export function buildRoof(kit: Kit) {
  const m: Mats = kit.mats;
  const keys = [
    { z: 0.795, hw: 0.905, y: 1.783, h: 0.05 },
    { z: 0.3, hw: 0.915, y: 1.803, h: 0.055 },
    { z: -0.5, hw: 0.915, y: 1.814, h: 0.055 },
    { z: -1.3, hw: 0.91, y: 1.808, h: 0.055 },
    { z: -1.95, hw: 0.9, y: 1.778, h: 0.05 },
    { z: -2.1, hw: 0.885, y: 1.763, h: 0.05 },
  ];
  const stations = smoothKeys(keys, 8).map((k) => {
    const cr = 0.014;
    const top: [number, number][] = [
      [-k.hw * 1.002, k.y - 0.085],
      [-k.hw, k.y - 0.045],
      [-k.hw * 0.75, k.y - 0.005],
      [-k.hw * 0.4, k.y + cr * 0.8],
      [k.hw * 0.4, k.y + cr * 0.8],
      [k.hw * 0.75, k.y - 0.005],
      [k.hw, k.y - 0.045],
      [k.hw * 1.002, k.y - 0.085],
    ];
    const bot: [number, number][] = [];
    for (let i = top.length - 1; i >= 0; i--) bot.push([top[i][0] * (1 - k.h * 0.35), top[i][1] - k.h]);
    return { z: k.z, pts: [...top, ...bot] as [number, number][] };
  });
  const roofGeo = loftZ(stations);
  /* cut the panoramic-roof aperture */
  {
    const ev = new Evaluator();
    ev.useGroups = false;
    let brush = new Brush(roofGeo, m.paint);
    brush.updateMatrixWorld(true);
    const cut = new Brush(new RoundedBoxGeometry(1.1, 0.3, 1.62, 2, 0.06), m.paint);
    cut.position.set(0, 1.818, -0.52);
    cut.updateMatrixWorld(true);
    brush = ev.evaluate(brush, cut, SUBTRACTION);
    kit.add(brush.geometry, m.paint);
  }

  /* panoramic roof */
  kit.add(
    curvedQuad(
      [
        [-0.56, 1.811, 0.28],
        [0.56, 1.811, 0.28],
        [0.54, 1.821, -1.3],
        [-0.54, 1.821, -1.3],
      ],
      0.012,
      12,
      10,
    ),
    m.glassDark,
  );
  kit.both((s) => kit.box(0.045, 0.03, 1.6, m.trim, [s * 0.575, 1.82, -0.51]));
  kit.box(1.16, 0.03, 0.05, m.trim, [0, 1.808, 0.3]);
  kit.box(1.1, 0.03, 0.05, m.trim, [0, 1.813, -1.28]);

  /* roof rails + cross bars */
  kit.both((s) => {
    kit.box(0.055, 0.05, 2.0, m.plastic, [s * 0.7, 1.798, -0.55]);
    kit.box(0.045, 0.026, 2.0, m.silver, [s * 0.7, 1.824, -0.55]);
    for (const z of [0.42, -1.52]) kit.box(0.07, 0.06, 0.13, m.plastic, [s * 0.7, 1.785, z]);
  });
  for (const z of [0.2, -1.3]) {
    kit.box(1.44, 0.035, 0.06, m.plastic, [0, 1.816, z]);
    kit.box(1.4, 0.018, 0.045, m.silver, [0, 1.833, z]);
  }

  /* shark fin */
  kit.extrude(
    poly([
      [0, 0],
      [0.17, 0],
      [0.13, 0.052],
      [0.035, 0.07],
    ]),
    0.05,
    m.plastic,
    [-0.085, 1.765, -1.87],
  );
}

/* ---------------- cladding, sills, steps ---------------- */

export function buildCladding(kit: Kit) {
  const m: Mats = kit.mats;
  /* angular arch cladding — outer polygon with the opening as a hole */
  const outer: [number, number][] = [
    [-0.53, -0.1],
    [-0.53, 0.16],
    [-0.512, 0.32],
    [-0.45, 0.453],
    [-0.31, 0.502],
    [-0.13, 0.522],
    [0.13, 0.522],
    [0.31, 0.502],
    [0.45, 0.453],
    [0.512, 0.32],
    [0.53, 0.16],
    [0.53, -0.1],
  ];
  const inner: [number, number][] = [
    [-0.44, -0.1],
    [-0.44, 0.14],
    [-0.425, 0.3],
    [-0.37, 0.42],
    [-0.26, 0.462],
    [-0.12, 0.478],
    [0.12, 0.478],
    [0.26, 0.462],
    [0.37, 0.42],
    [0.425, 0.3],
    [0.44, 0.14],
    [0.44, -0.1],
  ];
  const shape = poly(outer);
  const hole = new THREE.Path();
  hole.moveTo(inner[0][0], inner[0][1]);
  for (let i = 1; i < inner.length; i++) hole.lineTo(inner[i][0], inner[i][1]);
  hole.closePath();
  shape.holes.push(hole);

  for (const az of [DIM.axleF, DIM.axleR]) {
    for (const s of [1, -1]) {
      const g = new THREE.ExtrudeGeometry(shape, { depth: 0.085, bevelEnabled: false, curveSegments: 3 });
      g.rotateY(-Math.PI / 2);
      g.translate(0.9835, 0.4, az);
      if (s < 0) g.translate(-1.882, 0, 0);
      kit.add(g, m.cladding);
    }
  }

  /* exposed fasteners around each arch flange (instanced) */
  {
    const bolt = new THREE.CylinderGeometry(0.0125, 0.0125, 0.009, 8);
    const matsB: THREE.Matrix4[] = [];
    for (const az of [DIM.axleF, DIM.axleR])
      for (const s of [1, -1])
        for (const [dz, dy] of outer) {
          if (dy < -0.08) continue; // skip the buried bottom run
          matsB.push(trs([s * 0.9855, dy + 0.4, dz + az], [0, 0, Math.PI / 2]));
        }
    kit.instances(bolt, m.plastic, matsB);
  }

  /* rockers + side steps */
  kit.both((s) => {
    kit.box(0.1, 0.17, 1.9, m.cladding, [s * 0.955, 0.375, -0.0]);
    kit.box(0.13, 0.055, 1.7, m.cladding, [s * 0.985, 0.295, -0.0]);
    kit.box(0.16, 0.012, 1.5, m.alu, [s * 1.0, 0.325, -0.0]);
    for (let i = 0; i < 7; i++) kit.box(0.1, 0.016, 0.02, m.plastic, [s * 1.0, 0.332, 0.72 - i * 0.24]);
    kit.box(0.05, 0.11, 2.5, m.cladding, [s * 0.94, 0.5, -0.1]);
  });
}

/* ---------------- door hardware + mirrors ---------------- */

export function buildDoorHardware(kit: Kit) {
  const m: Mats = kit.mats;
  kit.both((s) => {
    for (const z of [1.13, 0.305, -0.735, -1.5]) kit.box(0.012, 0.9, 0.014, m.seam, [s * 0.962, 0.72, z]);
    kit.box(0.02, 0.03, 3.6, m.seam, [s * 0.958, 1.06, -0.15]);
    kit.box(0.014, 0.5, 0.014, m.seam, [s * 0.95, 0.62, 1.02]);
    kit.box(0.014, 0.5, 0.014, m.seam, [s * 0.95, 0.62, -0.95]);

    for (const z of [0.72, -0.28]) {
      kit.rbox(0.035, 0.05, 0.24, 0.015, m.trim, [s * 0.955, 1.11, z]);
      kit.box(0.02, 0.014, 0.2, m.chrome, [s * 0.976, 1.125, z]);
    }
  });

  /* mirrors */
  kit.both((s) => {
    kit.box(0.09, 0.05, 0.09, m.trim, [s * 0.985, 1.31, 1.0]);
    kit.rbox(0.19, 0.115, 0.1, 0.035, m.trim, [s * 1.055, 1.33, 1.0], [0, s * 0.12, 0]);
    kit.rbox(0.18, 0.05, 0.095, 0.02, m.paint, [s * 1.055, 1.372, 1.0], [0, s * 0.12, 0]);
    kit.plane(0.15, 0.085, m.glass, [s * 0.965, 1.325, 1.0], [0, -Math.PI / 2 + s * 0.5, 0]);
    kit.box(0.012, 0.022, 0.1, m.indicator, [s * 1.135, 1.305, 1.0], [0, s * 0.12, 0]);
    /* puddle lamp in the mirror base */
    const puddle = kit.box(0.05, 0.006, 0.05, m.dome, [s * 1.04, 1.268, 1.0]);
    puddle.castShadow = false;
  });
}

/* ---------------- tailgate ---------------- */

export function buildTailgate(kit: Kit, plateMat?: THREE.Material | null) {
  const m: Mats = kit.mats;
  const sec = (y: number) => {
    const t = (y - 0.85) / 0.918;
    const zR = -2.255 + t * 0.155;
    const hw = 0.9 - (1 - t) * 0.05;
    const r = 0.07 + t * 0.02;
    return {
      y,
      pts: [
        [hw, zR + 0.3],
        [hw, zR],
        [hw - r, zR - r],
        [0, zR - r * 1.05],
        [-hw + r, zR - r],
        [-hw, zR],
        [-hw, zR + 0.3],
        [0, zR + 0.34],
      ] as [number, number][],
    };
  };
  const stations = [];
  for (let i = 0; i <= 14; i++) stations.push(sec(0.85 + (i / 14) * 0.918));
  let tgGeo = loftY(stations);
  /* cut the rear-screen aperture right through the skin */
  {
    const cut = new THREE.BoxGeometry(SCREEN.x * 2, SCREEN.y1 - SCREEN.y0, 0.7);
    cut.translate(0, (SCREEN.y0 + SCREEN.y1) / 2, -2.05);
    const ev = new Evaluator();
    ev.useGroups = false;
    const a = new Brush(tgGeo);
    a.updateMatrixWorld(true);
    const b = new Brush(cut);
    b.updateMatrixWorld(true);
    const out = ev.evaluate(a, b, SUBTRACTION);
    const arr = out.geometry.getAttribute("position").array as ArrayLike<number>;
    let ok = true;
    for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) { ok = false; break; }
    if (ok) tgGeo = out.geometry;
  }
  kit.add(tgGeo, m.paint);

  /* tailgate shut line — traced on the (curved) outer skin */
  {
    const tg = (y: number, x: number) => tailgateZ(x, y) - 0.006; // outward is -Z
    for (let i = 0; i < 8; i++) {
      const x = -0.76 + (i + 0.5) * (1.52 / 8);
      kit.box(1.52 / 8, 0.012, 0.012, m.seam, [x, 0.872, tg(0.872, x)]);
      kit.box(1.66 / 8, 0.012, 0.012, m.seam, [x, 1.749, tg(1.749, x)]);
    }
    /* no side runs — the aperture surround reads as the tailgate edge */
  }

  /* body-colour band carrying the spaced JETOUR letters */
  kit.rbox(1.42, 0.2, 0.035, 0.02, m.paint, [0, 1.02, -2.238]);
  kit.rbox(0.52, 0.18, 0.03, 0.015, m.plastic, [0, 0.82, -2.245]);
  if (plateMat) kit.plane(0.46, 0.155, plateMat, [0, 0.82, -2.262], [0, Math.PI, 0]);
  kit.box(0.16, 0.035, 0.03, m.chrome, [0, 0.9, -2.26]);
}
