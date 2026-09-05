/* ===================================================================
   JETOUR T1 — modelling kit: dimensions, materials, geometry helpers.
   All units are metres.  +Z = nose, +X = right, +Y = up.
   =================================================================== */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ---------------- 1. TRUE DIMENSIONS (official spec) ---------------- */

export const DIM = {
  /* official: 4705 × 1967 × 1843 mm, wheelbase 2800 mm */
  length: 4.705,
  width: 1.967,
  height: 1.843,
  wheelbase: 2.8,
  nose: 2.3525, // +Z most forward point
  tail: -2.3525, // -Z most rearward point
  /* overhangs: front 918 mm, rear 987 mm  →  axle centres */
  axleF: 1.4345,
  axleR: -1.3655,
  /* tracks: 1690 front / 1700 rear */
  trackF: 1.69,
  trackR: 1.7,
  /* 235/60 R19 → 0.235 wide, 0.141 sidewall, 0.4826 rim */
  tireW: 0.235,
  tireR: 0.3823,
  rimR: 0.2413,
  /* body */
  hwMax: 0.965, // widest half-width (shoulder) → 1.93 + cladding ≈ 1.967
  sill: 0.285, // underside of the tub between the axles
  belt: 1.235, // beltline (bottom of the glass)
  roofY: 1.78, // roof skin peak
  cowlZ: 1.18, // windscreen base
  headerZ: 0.78, // windscreen top / roof front edge
  roofRearZ: -2.1, // roof trailing edge = tailgate top
  groundClearance: 0.19,
} as const;

/* ---------------- 2. PROCEDURAL TEXTURES (browser only) ---------------- */

const cache = new Map<string, THREE.Texture | null>();

function canvas2d(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  return cv;
}

function tex(
  key: string,
  make: () => THREE.Texture,
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  if (cache.has(key)) return cache.get(key)!;
  const t = make();
  cache.set(key, t);
  return t;
}

/** deterministic pseudo-random so every build looks identical */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/** grey-scale bump canvas → THREE texture */
function bumpTex(
  key: string,
  w: number,
  h: number,
  draw: (c: CanvasRenderingContext2D) => void,
  repeat: [number, number],
) {
  return tex(key, () => {
    const t = new THREE.CanvasTexture(canvas2d(w, h, draw));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 8;
    return t;
  });
}

/** metallic flake bump for car paint */
export function flakeBump() {
  return bumpTex(
    "flake",
    512,
    512,
    (c) => {
      const r = rng(7);
      c.fillStyle = "#808080";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 14000; i++) {
        const v = 128 + (r() - 0.5) * 150;
        c.fillStyle = `rgb(${v | 0},${v | 0},${v | 0})`;
        c.fillRect(r() * 512, r() * 512, 1.4, 1.4);
      }
    },
    [6, 6],
  );
}

/** tread + sidewall letters for the tyre (u = around, v = across the carcass) */
export function tireBump() {
  return bumpTex(
    "tire",
    1024,
    256,
    (c) => {
      const r = rng(21);
      c.fillStyle = "#6a6a6a";
      c.fillRect(0, 0, 1024, 256);
      /* shoulders (v 0..0.18 and 0.82..1) — mild ribs */
      for (const y0 of [0, 214]) {
        for (let i = 0; i < 64; i++) {
          c.fillStyle = i % 2 ? "#4a4a4a" : "#8a8a8a";
          c.fillRect(i * 16, y0, 8, 42);
        }
      }
      /* tread blocks (v 0.2..0.8): 5 ribs × 48 blocks */
      c.fillStyle = "#3c3c3c";
      c.fillRect(0, 46, 1024, 164);
      for (let i = 0; i < 48; i++) {
        const off = (i % 3) * 7;
        c.fillStyle = "#d8d8d8";
        /* five longitudinal ribs with sipes */
        for (const [x, w] of [
          [8, 26],
          [58, 22],
          [104, 26],
          [148, 22],
          [190, 26],
        ] as [number, number][]) {
          c.fillRect(x + i * 21.3 + off * 0.2, 50 + off, w, 62);
          c.fillRect(x + i * 21.3 + off * 0.2, 122 - off, w, 62);
        }
        /* sipes: dark cuts across the blocks */
        c.fillStyle = "#2c2c2c";
        for (let s = 0; s < 5; s++) c.fillRect(i * 21.3 + s * 4, 46, 1.6, 164);
      }
      for (let i = 0; i < 3000; i++) {
        const v = 90 + r() * 60;
        c.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},0.35)`;
        c.fillRect(r() * 1024, r() * 256, 2, 2);
      }
    },
    [1, 1],
  );
}

/** tyre sidewall: raised lettering laid around the ring.
    RingGeometry UVs are a planar projection over the OUTER radius, so the
    visible band is r 0.39–0.50 of the half-size — the text is drawn there. */
export function sidewallTex() {
  return tex("sidewall", () => {
    const S = 1024;
    const t = new THREE.CanvasTexture(
      canvas2d(S, S, (c) => {
        const h = S / 2;
        c.fillStyle = "#0d0e10";
        c.fillRect(0, 0, S, S);
        /* faint concentric sheen so the rubber is not dead flat */
        for (let r = 400; r <= 512; r += 2) {
          const a = 0.03 * Math.sin((r - 400) * 0.09);
          c.strokeStyle = `rgba(${a > 0 ? 150 : 0},${a > 0 ? 155 : 0},${a > 0 ? 160 : 0},${Math.abs(a)})`;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(h, h, r, 0, Math.PI * 2);
          c.stroke();
        }
        /* bead lines */
        c.strokeStyle = "rgba(190,195,200,0.22)";
        c.lineWidth = 3;
        for (const r of [404, 508]) {
          c.beginPath();
          c.arc(h, h, r, 0, Math.PI * 2);
          c.stroke();
        }
        const ring = (str: string, R: number, font: string, fill: string, reps: number) => {
          c.font = font;
          c.fillStyle = fill;
          c.textAlign = "center";
          c.textBaseline = "middle";
          for (let rep = 0; rep < reps; rep++)
            for (let i = 0; i < str.length; i++) {
              const a = ((rep + i / str.length) / reps) * Math.PI * 2;
              c.save();
              c.translate(h, h);
              c.rotate(a);
              c.translate(0, -R);
              c.fillText(str[i], 0, 0);
              c.restore();
            }
        };
        ring("JETOUR  235/60 R19 107V  M+S   ", 458, "700 30px ui-sans-serif, Arial, sans-serif", "#b6bbc0", 3);
        ring("TREADWEAR 320  TRACTION A  TEMPERATURE A  RADIAL TUBELESS  ", 424, "600 15px ui-sans-serif, Arial, sans-serif", "rgba(150,156,162,0.85)", 2);
      }),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** perforated leather grain */
export function leatherBump() {
  return bumpTex(
    "leather",
    512,
    512,
    (c) => {
      const r = rng(33);
      c.fillStyle = "#909090";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 26000; i++) {
        const v = 100 + (r() - 0.5) * 120;
        c.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},0.55)`;
        c.beginPath();
        c.arc(r() * 512, r() * 512, 1 + r() * 1.6, 0, Math.PI * 2);
        c.fill();
      }
      /* perforations */
      c.fillStyle = "#101010";
      for (let y = 0; y < 512; y += 16)
        for (let x = (y / 16) % 2 ? 8 : 0; x < 512; x += 16) {
          c.beginPath();
          c.arc(x, y, 3.1, 0, Math.PI * 2);
          c.fill();
        }
    },
    [4, 4],
  );
}

/** fine grain for exterior plastics / cladding */
export function plasticBump() {
  return bumpTex(
    "plastic",
    256,
    256,
    (c) => {
      const r = rng(51);
      c.fillStyle = "#8a8a8a";
      c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 18000; i++) {
        const v = 118 + (r() - 0.5) * 70;
        c.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},0.6)`;
        c.fillRect(r() * 256, r() * 256, 1.3, 1.3);
      }
    },
    [8, 8],
  );
}

/** honeycomb mesh for the lower air intake */
export function meshTex() {
  return tex("mesh", () => {
    const t = new THREE.CanvasTexture(
      canvas2d(128, 128, (c) => {
        c.fillStyle = "#0a0b0c";
        c.fillRect(0, 0, 128, 128);
        c.strokeStyle = "#2a2d30";
        c.lineWidth = 2.4;
        for (let y = 0; y < 128; y += 16)
          for (let x = 0; x < 128; x += 16) {
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + 8, y + 14);
            c.lineTo(x + 16, y);
            c.stroke();
          }
      }),
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 2);
    return t;
  });
}

/** drilled + slotted brake disc face */
export function discTex() {
  return tex("disc", () => {
    const t = new THREE.CanvasTexture(
      canvas2d(512, 512, (c) => {
        c.fillStyle = "#6e7378";
        c.fillRect(0, 0, 512, 512);
        const r = rng(9);
        /* radial machining */
        c.strokeStyle = "rgba(255,255,255,0.06)";
        for (let i = 0; i < 400; i++) {
          c.beginPath();
          c.arc(256, 256, 90 + r() * 165, r() * 6.28, r() * 6.28 + 0.5);
          c.stroke();
        }
        /* drill holes */
        for (let ring = 0; ring < 2; ring++)
          for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2 + ring * 0.13;
            const rr = 150 + ring * 62;
            c.fillStyle = "#15171a";
            c.beginPath();
            c.arc(256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr, 7.5, 0, Math.PI * 2);
            c.fill();
          }
        /* slots */
        c.strokeStyle = "#20232700";
        c.strokeStyle = "#1b1e21";
        c.lineWidth = 5;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          c.beginPath();
          c.moveTo(256 + Math.cos(a) * 130, 256 + Math.sin(a) * 130);
          c.lineTo(256 + Math.cos(a + 0.5) * 220, 256 + Math.sin(a + 0.5) * 220);
          c.stroke();
        }
      }),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** carpet / boot floor */
export function carpetBump() {
  return bumpTex(
    "carpet",
    256,
    256,
    (c) => {
      const r = rng(77);
      c.fillStyle = "#7c7c7c";
      c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 22000; i++) {
        const v = 110 + (r() - 0.5) * 110;
        c.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},0.5)`;
        c.fillRect(r() * 256, r() * 256, 2, 1);
      }
    },
    [10, 10],
  );
}

/** spaced wordmark with transparency (JETOUR badge / number plate) */
export function wordTex(
  text: string,
  opts: { color?: string; bg?: string | null; spacing?: number; size?: number; weight?: number } = {},
) {
  const key = `word:${text}:${JSON.stringify(opts)}`;
  return tex(key, () => {
    const { color = "#e2e6ea", bg = null, spacing = 26, size = 96, weight = 700 } = opts;
    const t = new THREE.CanvasTexture(
      canvas2d(1024, 160, (c) => {
        if (bg) {
          c.fillStyle = bg;
          c.fillRect(0, 0, 1024, 160);
        }
        c.fillStyle = color;
        c.font = `${weight} ${size}px 'Helvetica Neue', Arial, sans-serif`;
        c.textBaseline = "middle";
        const chars = text.split("");
        const w = chars.map((ch) => c.measureText(ch).width);
        const total = w.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
        let x = (1024 - total) / 2;
        chars.forEach((ch, i) => {
          c.fillText(ch, x, 80);
          x += w[i] + spacing;
        });
      }),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });
}

/** 15.6" infotainment UI */
export function screenTex() {
  return tex("screen", () => {
    const t = new THREE.CanvasTexture(
      canvas2d(1024, 640, (c) => {
        const g = c.createLinearGradient(0, 0, 0, 640);
        g.addColorStop(0, "#0b1620");
        g.addColorStop(1, "#132430");
        c.fillStyle = g;
        c.fillRect(0, 0, 1024, 640);
        /* status bar */
        c.fillStyle = "rgba(255,255,255,0.08)";
        c.fillRect(0, 0, 1024, 56);
        c.fillStyle = "#8fd8c8";
        c.font = "600 30px 'Helvetica Neue', Arial";
        c.fillText("JETOUR", 28, 38);
        c.textAlign = "right";
        c.fillStyle = "#cfe3ea";
        c.fillText("26°C  ·  21:40", 996, 38);
        c.textAlign = "left";
        /* map */
        c.fillStyle = "#16323d";
        c.beginPath();
        c.moveTo(0, 470);
        c.lineTo(1024, 470);
        c.lineTo(1024, 640);
        c.lineTo(0, 640);
        c.closePath();
        c.fill();
        c.strokeStyle = "#2f6b74";
        c.lineWidth = 5;
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          c.moveTo(-40 + i * 210, 640);
          c.lineTo(120 + i * 150, 470);
          c.stroke();
        }
        /* route */
        c.strokeStyle = "#39d5bb";
        c.lineWidth = 14;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(180, 620);
        c.lineTo(300, 520);
        c.lineTo(420, 540);
        c.lineTo(560, 470);
        c.stroke();
        /* cards */
        const cards = [
          ["NAV", "#1f6f8b"],
          ["MUSIC", "#7a3f8b"],
          ["CLIMA", "#2f7a5a"],
          ["CAR", "#8a5a2f"],
        ];
        cards.forEach(([label, col], i) => {
          c.fillStyle = col as string;
          c.beginPath();
          if (typeof c.roundRect === "function") c.roundRect(48 + i * 240, 100, 208, 200, 26);
          else c.rect(48 + i * 240, 100, 208, 200);
          c.fill();
          c.fillStyle = "rgba(255,255,255,0.9)";
          c.font = "600 34px 'Helvetica Neue', Arial";
          c.fillText(label as string, 74 + i * 240, 320);
        });
        /* media bar */
        c.fillStyle = "rgba(0,0,0,0.45)";
        c.fillRect(0, 540, 1024, 100);
        c.fillStyle = "#39d5bb";
        c.fillRect(48, 578, 260, 8);
        c.fillStyle = "#e6f2f5";
        c.font = "600 32px 'Helvetica Neue', Arial";
        c.fillText("Sony · Premium Audio", 48, 556);
      }),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });
}

/** 10.25" driver cluster */
export function clusterTex() {
  return tex("cluster", () => {
    const t = new THREE.CanvasTexture(
      canvas2d(640, 240, (c) => {
        c.fillStyle = "#06080a";
        c.fillRect(0, 0, 640, 240);
        const arc = (cx: number, col: string, frac: number) => {
          c.strokeStyle = col;
          c.lineWidth = 12;
          c.beginPath();
          c.arc(cx, 120, 74, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * frac);
          c.stroke();
        };
        c.strokeStyle = "#1b2530";
        c.lineWidth = 12;
        [110, 530].forEach((cx) => {
          c.beginPath();
          c.arc(cx, 120, 74, Math.PI * 0.75, Math.PI * 2.25);
          c.stroke();
        });
        arc(110, "#39d5bb", 0.62); // power / charge
        arc(530, "#4a90d8", 0.28); // fuel
        c.fillStyle = "#e8f4ff";
        c.font = "700 78px 'Helvetica Neue', Arial";
        c.textAlign = "center";
        c.fillText("62", 320, 118);
        c.font = "500 26px 'Helvetica Neue', Arial";
        c.fillStyle = "#7f93a3";
        c.fillText("km/h", 320, 162);
        c.fillStyle = "#39d5bb";
        c.font = "600 24px 'Helvetica Neue', Arial";
        c.fillText("EV", 110, 210);
        c.fillStyle = "#4a90d8";
        c.fillText("HEV", 530, 210);
        c.textAlign = "left";
      }),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/* ---------------- 3. MATERIALS ---------------- */

export type Mats = ReturnType<typeof makeMats>;

export function makeMats() {
  const flake = flakeBump();

  const paint = new THREE.MeshPhysicalMaterial({
    name: "paint",
    color: new THREE.Color("#93b3a1"),
    /* real metallic paint is a coloured dielectric base coat with metal
       flake in it, sealed under a hard clear coat — metalness 0.6+ reads
       as bare anodised metal and kills the body colour */
    roughness: 0.24,
    metalness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.028,
    envMapIntensity: 1.95,
    bumpMap: flake,
    bumpScale: 0.0032,
    specularIntensity: 1,
  });

  const trim = new THREE.MeshPhysicalMaterial({
    name: "trim-gloss-black",
    color: "#0b0c0d",
    roughness: 0.28,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
  });

  const plastic = new THREE.MeshStandardMaterial({
    name: "plastic",
    color: "#1a1c1e",
    roughness: 0.82,
    metalness: 0.05,
    bumpMap: plasticBump(),
    bumpScale: 0.004,
  });
  const plasticSoft = plastic.clone();
  plasticSoft.name = "plastic-soft";
  plasticSoft.color.set("#232628");
  plasticSoft.roughness = 0.9;
  const cladding = plastic.clone();
  cladding.name = "cladding";
  cladding.color.set("#15171a");
  cladding.roughness = 0.95;
  const liner = new THREE.MeshStandardMaterial({
    name: "liner",
    color: "#0e1012",
    roughness: 0.98,
    metalness: 0,
    side: THREE.DoubleSide,
    bumpMap: plasticBump(),
    bumpScale: 0.006,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    name: "glass",
    color: "#0a1218",
    roughness: 0.045,
    metalness: 0,
    transparent: true,
    opacity: 0.42,
    envMapIntensity: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glassDark = glass.clone();
  glassDark.name = "glass-privacy";
  glassDark.color.set("#070b0e");
  glassDark.opacity = 0.68;

  const chrome = new THREE.MeshStandardMaterial({
    name: "chrome",
    color: "#e9edf0",
    roughness: 0.11,
    metalness: 1,
    envMapIntensity: 1.6,
  });
  const silver = new THREE.MeshStandardMaterial({
    name: "silver",
    color: "#b9c0c6",
    roughness: 0.34,
    metalness: 0.95,
    envMapIntensity: 1.3,
  });
  const alu = new THREE.MeshStandardMaterial({
    name: "alu",
    color: "#8e959b",
    roughness: 0.42,
    metalness: 0.9,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    name: "metal-dark",
    color: "#33373b",
    roughness: 0.42,
    metalness: 0.92,
  });

  const tire = new THREE.MeshStandardMaterial({
    name: "tire",
    color: "#0d0e0f",
    roughness: 0.94,
    metalness: 0,
    bumpMap: tireBump(),
    bumpScale: 0.012,
  });
  const tread = tire.clone();
  tread.name = "tire-tread";
  tread.roughness = 0.98;
  const tireWall = new THREE.MeshStandardMaterial({
    name: "tire-sidewall",
    map: sidewallTex(),
    bumpMap: sidewallTex(),
    bumpScale: 0.0016,
    color: "#ffffff",
    roughness: 0.86,
    metalness: 0,
  });

  const drl = new THREE.MeshStandardMaterial({
    name: "drl",
    color: "#f2f8ff",
    emissive: new THREE.Color("#dcefff"),
    emissiveIntensity: 3.4,
    roughness: 0.25,
    metalness: 0,
  });
  const beam = new THREE.MeshStandardMaterial({
    name: "headlamp-lens",
    color: "#c8d8e6",
    emissive: new THREE.Color("#9fd0ff"),
    emissiveIntensity: 0.35,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.55,
  });
  const tail = new THREE.MeshStandardMaterial({
    name: "tail-lamp",
    color: "#5a0c0c",
    emissive: new THREE.Color("#ff2028"),
    emissiveIntensity: 2.6,
    roughness: 0.3,
  });
  const tailShell = new THREE.MeshStandardMaterial({
    name: "tail-shell",
    color: "#1a0508",
    roughness: 0.25,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const amber = new THREE.MeshStandardMaterial({
    name: "amber",
    color: "#7a3a08",
    emissive: new THREE.Color("#ff8c1a"),
    emissiveIntensity: 1.1,
    roughness: 0.4,
  });
  const stopLamp = new THREE.MeshStandardMaterial({
    name: "stop-lamp",
    color: "#3a0608",
    emissive: new THREE.Color("#ff1a20"),
    emissiveIntensity: 2.2,
  });
  const indicator = new THREE.MeshStandardMaterial({
    name: "indicator",
    color: "#4a2a06",
    emissive: new THREE.Color("#ffa42a"),
    emissiveIntensity: 1.6,
  });

  const leather = new THREE.MeshPhysicalMaterial({
    name: "leather",
    color: "#7ba291",
    roughness: 0.62,
    metalness: 0.02,
    sheen: 0.55,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#cfd9d3"),
    bumpMap: leatherBump(),
    bumpScale: 0.006,
  });
  const leatherDark = leather.clone();
  leatherDark.name = "leather-bolster";
  leatherDark.color.set("#191b1d");
  leatherDark.roughness = 0.55;
  const headliner = new THREE.MeshStandardMaterial({
    name: "headliner",
    color: "#3d4247",
    roughness: 0.98,
    metalness: 0,
  });
  const carpet = new THREE.MeshStandardMaterial({
    name: "carpet",
    color: "#17191b",
    roughness: 1,
    bumpMap: carpetBump(),
    bumpScale: 0.01,
  });
  const cabin = new THREE.MeshStandardMaterial({ name: "cabin-plastic", color: "#22262a", roughness: 0.72 });
  const piano = new THREE.MeshPhysicalMaterial({
    name: "piano-black",
    color: new THREE.Color("#0a0b0c"),
    roughness: 0.16,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4,
  });
  const crystal = new THREE.MeshPhysicalMaterial({
    name: "crystal",
    color: "#cfe6f2",
    roughness: 0.03,
    metalness: 0,
    transmission: 0.55,
    thickness: 0.08,
    ior: 1.6,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 2.4,
  });
  const ambient = new THREE.MeshStandardMaterial({
    name: "ambient-light",
    color: "#0a3a32",
    emissive: new THREE.Color("#38e0c4"),
    emissiveIntensity: 2.6,
    roughness: 0.4,
  });
  const dome = new THREE.MeshStandardMaterial({
    name: "dome-light",
    color: "#4a3418",
    emissive: new THREE.Color("#ffd9a4"),
    emissiveIntensity: 2.2,
  });
  const rubber = new THREE.MeshStandardMaterial({ name: "rubber", color: "#121314", roughness: 0.95 });
  const seam = new THREE.MeshStandardMaterial({ name: "seam", color: "#050607", roughness: 0.9 });
  seam.color.set("#0a0b0c");
  const caliper = new THREE.MeshStandardMaterial({ name: "caliper", color: "#1f8a7a", roughness: 0.35, metalness: 0.5 });
  const disc = new THREE.MeshStandardMaterial({
    name: "disc",
    map: discTex(),
    color: "#9aa1a7",
    roughness: 0.42,
    metalness: 0.85,
  });
  const meshMat = new THREE.MeshStandardMaterial({ name: "intake-mesh", map: meshTex(), color: "#8f959a", roughness: 0.7, metalness: 0.3 });
  const hv = new THREE.MeshStandardMaterial({ name: "hv-cable", color: "#ff6a00", roughness: 0.55 });

  return {
    paint, trim, plastic, plasticSoft, cladding, liner,
    glass, glassDark, chrome, silver, alu, darkMetal,
    tire, tread, tireWall, drl, beam, tail, tailShell, amber, stopLamp, indicator,
    leather, leatherDark, headliner, carpet, cabin, piano, crystal,
    ambient, dome, rubber, seam, caliper, disc, meshMat, hv,
  };
}

/* ---------------- 4. GEOMETRY HELPERS ---------------- */

export type V3 = [number, number, number];

export class Kit {
  group = new THREE.Group();
  private disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  constructor(public mats: Mats) {}

  add(geo: THREE.BufferGeometry, mat: THREE.Material, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  box(w: number, h: number, d: number, mat: THREE.Material, pos?: V3, rot?: V3) {
    return this.add(new THREE.BoxGeometry(w, h, d), mat, pos, rot);
  }

  rbox(w: number, h: number, d: number, r: number, mat: THREE.Material, pos?: V3, rot?: V3) {
    const rad = Math.min(r, Math.min(w, h, d) / 2 - 1e-4);
    return this.add(new RoundedBoxGeometry(w, h, d, 3, rad), mat, pos, rot);
  }

  plane(w: number, h: number, mat: THREE.Material, pos?: V3, rot?: V3) {
    const m = this.add(new THREE.PlaneGeometry(w, h), mat, pos, rot);
    return m;
  }

  cyl(rt: number, rb: number, h: number, mat: THREE.Material, pos?: V3, rot?: V3, seg = 24, open = false) {
    return this.add(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat, pos, rot);
  }

  sphere(r: number, mat: THREE.Material, pos?: V3, seg = 20) {
    return this.add(new THREE.SphereGeometry(r, seg, Math.max(8, seg / 2)), mat, pos);
  }

  torus(r: number, t: number, mat: THREE.Material, pos?: V3, rot?: V3, seg = 40) {
    return this.add(new THREE.TorusGeometry(r, t, 12, seg), mat, pos, rot);
  }

  /** revolve a 2-D profile (x = radius, y = height) around Y */
  lathe(pts: [number, number][], mat: THREE.Material, pos?: V3, rot?: V3, seg = 48) {
    const g = new THREE.LatheGeometry(
      pts.map(([x, y]) => new THREE.Vector2(x, y)),
      seg,
    );
    return this.add(g, mat, pos, rot);
  }

  /** extrude a 2-D shape along +Z, then optionally place/rotate */
  extrude(shape: THREE.Shape, depth: number, mat: THREE.Material, pos?: V3, rot?: V3, bevel = 0) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 2,
      curveSegments: 12,
    });
    return this.add(g, mat, pos, rot);
  }

  /** extrude a closed 2-D shape along X, from x0 to x1.
   *  shape.x → world Z, shape.y → world Y   (so shapes are drawn in side view) */
  prismX(shape: THREE.Shape, x0: number, x1: number, mat: THREE.Material) {
    const g = new THREE.ExtrudeGeometry(shape, { depth: Math.abs(x1 - x0), bevelEnabled: false, curveSegments: 8 });
    g.rotateY(-Math.PI / 2); // shape.x → +Z, extrude → -X
    g.translate(Math.max(x0, x1), 0, 0); // then shift so it spans [x0,x1]
    return this.add(g, mat);
  }

  /** instanced copies of one geometry (transform matrices in world/group space) */
  instances(geo: THREE.BufferGeometry, mat: THREE.Material, mats: THREE.Matrix4[]) {
    if (!mats.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    this.group.add(im);
    return im;
  }

  /** run `fn` for both sides (+1 / -1) */
  both(fn: (s: 1 | -1) => void) {
    fn(1);
    fn(-1);
  }
}

/** extrude an open polyline given as [z, y] along X → a curved trough
 *  (used for the wheel-arch liners so you can never see into the cabin) */
export function troughX(pts: [number, number][], x0: number, x1: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const n = pts.length;
  let xi = 0;
  for (const x of [x0, x1]) {
    for (let i = 0; i < n; i++) {
      pos.push(x, pts[i][1], pts[i][0]);
      uv.push(i / (n - 1), xi);
    }
    xi++;
  }
  for (let i = 0; i < n - 1; i++) {
    const a = i;
    const b = i + 1;
    const c = n + i + 1;
    const d = n + i;
    idx.push(a, b, c, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** merge every mesh under `parent` that shares a material into one draw
 *  call each.  Wheel groups stay separate so they can still be spun. */
export function mergeByMaterial(parent: THREE.Object3D) {
  parent.updateMatrixWorld(true);
  const inv = parent.matrixWorld.clone().invert();
  const byMat = new Map<THREE.Material, THREE.Mesh[]>();
  parent.traverse((o) => {
    const mesh = o as THREE.Mesh & { isInstancedMesh?: boolean };
    if (!mesh.isMesh || mesh.isInstancedMesh || o === parent) return;
    /* skip anything that lives inside a nested wheel group */
    let p = o.parent;
    while (p && p !== parent) {
      if (p.userData && p.userData.wheel) return;
      p = p.parent;
    }
    const mat = mesh.material as THREE.Material;
    const arr = byMat.get(mat) ?? [];
    arr.push(mesh);
    byMat.set(mat, arr);
  });

  for (const [mat, meshes] of byMat) {
    if (meshes.length < 2) continue;
    const geos: THREE.BufferGeometry[] = [];
    for (const mesh of meshes) {
      const g = mesh.geometry.clone();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld));
      /* keep only the attributes every geometry has */
      for (const key of Object.keys(g.attributes))
        if (!["position", "normal", "uv"].includes(key)) g.deleteAttribute(key);
      if (!g.index) {
        const n = g.attributes.position.count;
        const idx = new Uint32Array(n);
        for (let i = 0; i < n; i++) idx[i] = i;
        g.setIndex(new THREE.BufferAttribute(idx, 1));
      }
      geos.push(g);
    }
    let merged: THREE.BufferGeometry | null = null;
    try {
      merged = mergeGeometries(geos, false);
    } catch {
      merged = null;
    }
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    meshes.forEach((mesh) => {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    });
  }
}

/* ---------------- 5. SHAPE / LOFT UTILITIES ---------------- */

/** polygon → THREE.Shape */
export function poly(pts: [number, number][]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

/** rounded-rectangle path, clockwise, centred on (cx, cy) */
export function roundRectPts(w: number, h: number, r: number, cx = 0, cy = 0, steps = 4): [number, number][] {
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const out: [number, number][] = [];
  const corner = (ox: number, oy: number, a0: number) => {
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      out.push([cx + ox * hw + Math.cos(a) * r * ox, cy + oy * hh + Math.sin(a) * r * oy]);
    }
  };
  corner(1, 1, 0);
  corner(-1, 1, Math.PI / 2);
  corner(-1, -1, Math.PI);
  corner(1, -1, -Math.PI / 2);
  return out;
}

/** loft a list of stations (z + closed cross-section) into one surface */
export function loftZ(stations: { z: number; pts: [number, number][] }[]): THREE.BufferGeometry {
  const n = stations[0].pts.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  stations.forEach((st, i) => {
    st.pts.forEach(([x, y], j) => {
      pos.push(x, y, st.z);
      uv.push(j / n, i / (stations.length - 1));
    });
  });
  for (let i = 0; i < stations.length - 1; i++)
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      const a = i * n + j;
      const b = i * n + j2;
      const c = (i + 1) * n + j2;
      const d = (i + 1) * n + j;
      /* sections run clockwise seen from +Z, stations run front → rear */
      idx.push(a, b, c, a, c, d);
    }
  const cap = (ring: [number, number][], z: number, flip: boolean, off: number) => {
    const base = pos.length / 3;
    let cx = 0;
    let cy = 0;
    ring.forEach(([x, y]) => {
      cx += x;
      cy += y;
    });
    cx /= ring.length;
    cy /= ring.length;
    pos.push(cx, cy, z);
    uv.push(0.5, 0.5);
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      if (flip) idx.push(base, off + j2, off + j);
      else idx.push(base, off + j, off + j2);
    }
  };
  cap(stations[0].pts, stations[0].z, true, 0);
  cap(stations[stations.length - 1].pts, stations[stations.length - 1].z, false, (stations.length - 1) * n);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** loft along Y — each station is a closed cross-section in the XZ plane */
export function loftY(stations: { y: number; pts: [number, number][] }[]): THREE.BufferGeometry {
  const n = stations[0].pts.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  stations.forEach((st, i) => {
    st.pts.forEach(([x, z], j) => {
      pos.push(x, st.y, z);
      uv.push(j / n, i / (stations.length - 1));
    });
  });
  for (let i = 0; i < stations.length - 1; i++)
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      const a = i * n + j;
      const b = i * n + j2;
      const c = (i + 1) * n + j2;
      const d = (i + 1) * n + j;
      idx.push(a, b, c, a, c, d);
    }
  const cap = (ring: [number, number][], y: number, flip: boolean, off: number) => {
    const base = pos.length / 3;
    let cx = 0;
    let cz = 0;
    ring.forEach(([x, z]) => {
      cx += x;
      cz += z;
    });
    cx /= ring.length;
    cz /= ring.length;
    pos.push(cx, y, cz);
    uv.push(0.5, 0.5);
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      if (flip) idx.push(base, off + j, off + j2);
      else idx.push(base, off + j2, off + j);
    }
  };
  cap(stations[0].pts, stations[0].y, true, 0);
  cap(stations[stations.length - 1].pts, stations[stations.length - 1].y, false, (stations.length - 1) * n);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Catmull-Rom resample of a param list so lofts stay smooth */
export function smoothKeys<T extends { z: number }>(keys: T[], perSegment = 8): (T & { z: number })[] {
  const out: T[] = [];
  const at = (i: number) => keys[Math.min(keys.length - 1, Math.max(0, i))];
  for (let i = 0; i < keys.length - 1; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const merged = {} as Record<string, number>;
      const keySet = new Set<string>([
        ...Object.keys(p0),
        ...Object.keys(p1),
        ...Object.keys(p2),
        ...Object.keys(p3),
      ]);
      for (const k of keySet) {
        if (k === "z") continue;
        const a = (p0 as Record<string, number>)[k];
        const b = (p1 as Record<string, number>)[k];
        const c = (p2 as Record<string, number>)[k];
        const d = (p3 as Record<string, number>)[k];
        /* fall back to a linear blend when a control point lacks the key */
        if (a === undefined || b === undefined || c === undefined || d === undefined) {
          merged[k] = b === undefined ? (c ?? 0) : c === undefined ? b : b + (c - b) * t;
          continue;
        }
        merged[k] =
          0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      }
      merged.z = p1.z + (p2.z - p1.z) * t;
      out.push(merged as T);
    }
  }
  out.push(keys[keys.length - 1]);
  return out;
}

/** build a matrix from position / rotation / scale */
export function trs(pos: V3, rot: V3 = [0, 0, 0], scale: V3 = [1, 1, 1]) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
    new THREE.Vector3(...scale),
  );
}
