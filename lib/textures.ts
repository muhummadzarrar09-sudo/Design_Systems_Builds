// Procedural PBR texture generation — no external assets needed.
// Everything is generated on a <canvas> at module-load time, then wrapped
// in a CanvasTexture with proper sRGB / linear color space flags.

import * as THREE from "three";

function makeCanvas(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return { c, ctx: c.getContext("2d")! };
}

function fbm(
  ctx: CanvasRenderingContext2D,
  size: number,
  baseFreq: number,
  octaves: number,
  tint: { r: number; g: number; b: number },
  alpha = 0.5,
  mode: GlobalCompositeOperation = "source-over"
) {
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = alpha;
  for (let o = 0; o < octaves; o++) {
    const f = baseFreq * Math.pow(2, o);
    const a = (1 / Math.pow(2, o)) * 255;
    ctx.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},${a / 255})`;
    const step = size / f;
    for (let y = 0; y < f; y++) {
      for (let x = 0; x < f; x++) {
        const r = (Math.sin(x * 12.9898 + y * 78.233 + o * 4.13) * 43758.5453) % 1;
        const v = Math.abs(r);
        ctx.fillRect(x * step, y * step, step + 1, step + 1);
        // Modulate brightness per cell
        ctx.fillStyle = `rgba(${tint.r * (0.7 + v * 0.3)},${tint.g * (0.7 + v * 0.3)},${tint.b * (0.7 + v * 0.3)},${a / 255})`;
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

/* ---------------- LEATHER: color + normal + roughness ---------------- */

export function makeLeatherTextures() {
  const SIZE = 1024;
  const { c, ctx } = makeCanvas(SIZE);

  // Base leather color: warm brown gradient
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, "#5a2410");
  grad.addColorStop(0.5, "#4a1a08");
  grad.addColorStop(1, "#3a1408");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Macro variation
  fbm(ctx, SIZE, 6, 4, { r: 60, g: 30, b: 15 }, 0.45);
  // Fine grain
  fbm(ctx, SIZE, 80, 2, { r: 30, g: 15, b: 8 }, 0.55, "multiply");
  // Highlights
  fbm(ctx, SIZE, 20, 3, { r: 90, g: 50, b: 25 }, 0.18, "screen");

  // Pebbled grain: little bumps everywhere
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 4 + Math.random() * 6;
    const isLight = Math.random() > 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (isLight) {
      g.addColorStop(0, "rgba(180,120,70,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      g.addColorStop(0, "rgba(20,10,5,0.4)");
      g.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  // Fine scratches
  ctx.strokeStyle = "rgba(20,10,5,0.25)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const len = 10 + Math.random() * 30;
    const a = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;

  // Normal map from a height pass
  const { c: nc, ctx: nctx } = makeCanvas(SIZE);
  const heightData = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const normalData = nctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const l = ((y * SIZE + Math.max(0, x - 1)) * 4);
      const r = ((y * SIZE + Math.min(SIZE - 1, x + 1)) * 4);
      const u = ((Math.max(0, y - 1) * SIZE + x) * 4);
      const d = ((Math.min(SIZE - 1, y + 1) * SIZE + x) * 4);
      const dx = (heightData[r] - heightData[l]) / 255;
      const dy = (heightData[d] - heightData[u]) / 255;
      const nx = -dx * 4;
      const ny = -dy * 4;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normalData.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      normalData.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      normalData.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      normalData.data[i + 3] = 255;
    }
  }
  nctx.putImageData(normalData, 0, 0);
  const normal = new THREE.CanvasTexture(nc);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.anisotropy = 8;

  // Roughness: leather is mostly mid-rough with some variation
  const { c: rc, ctx: rctx } = makeCanvas(SIZE);
  rctx.fillStyle = "#888";
  rctx.fillRect(0, 0, SIZE, SIZE);
  fbm(rctx, SIZE, 30, 3, { r: 100, g: 100, b: 100 }, 0.4, "overlay");
  const roughness = new THREE.CanvasTexture(rc);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  return { color, normal, roughness };
}

/* ---------------- PAPER: warm cream with grain ---------------- */

export function makePaperTextures() {
  const SIZE = 1024;
  const { c, ctx } = makeCanvas(SIZE);

  // Base cream
  ctx.fillStyle = "#f0e4c8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle vignette
  const vg = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.2, SIZE / 2, SIZE / 2, SIZE * 0.7);
  vg.addColorStop(0, "rgba(255,255,255,0)");
  vg.addColorStop(1, "rgba(180,150,100,0.18)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Paper grain
  fbm(ctx, SIZE, 120, 2, { r: 180, g: 160, b: 120 }, 0.18, "multiply");
  fbm(ctx, SIZE, 20, 3, { r: 220, g: 200, b: 160 }, 0.1, "screen");

  // Small fibers
  ctx.strokeStyle = "rgba(180,160,120,0.4)";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const len = 4 + Math.random() * 12;
    const a = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;

  // Normal: very subtle paper grain
  const { c: nc, ctx: nctx } = makeCanvas(SIZE);
  const heightData = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const normalData = nctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const l = ((y * SIZE + Math.max(0, x - 1)) * 4);
      const r = ((y * SIZE + Math.min(SIZE - 1, x + 1)) * 4);
      const u = ((Math.max(0, y - 1) * SIZE + x) * 4);
      const d = ((Math.min(SIZE - 1, y + 1) * SIZE + x) * 4);
      const dx = (heightData[r] - heightData[l]) / 255;
      const dy = (heightData[d] - heightData[u]) / 255;
      const nx = -dx * 1.2;
      const ny = -dy * 1.2;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normalData.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      normalData.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      normalData.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      normalData.data[i + 3] = 255;
    }
  }
  nctx.putImageData(normalData, 0, 0);
  const normal = new THREE.CanvasTexture(nc);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;

  // Paper is high roughness
  const { c: rc, ctx: rctx } = makeCanvas(SIZE);
  rctx.fillStyle = "#d8d8d8";
  rctx.fillRect(0, 0, SIZE, SIZE);
  const roughness = new THREE.CanvasTexture(rc);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  return { color, normal, roughness };
}

/* ---------------- BRASS: brushed metal with patina ---------------- */

export function makeBrassTextures() {
  const SIZE = 512;
  const { c, ctx } = makeCanvas(SIZE);

  // Base brass
  ctx.fillStyle = "#c89030";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Brushed lines (anisotropic)
  ctx.strokeStyle = "rgba(255,220,150,0.4)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 800; i++) {
    const y = Math.random() * SIZE;
    const x = Math.random() * SIZE;
    const len = 20 + Math.random() * 60;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(80,50,15,0.4)";
  for (let i = 0; i < 800; i++) {
    const y = Math.random() * SIZE;
    const x = Math.random() * SIZE;
    const len = 20 + Math.random() * 60;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // Patina
  fbm(ctx, SIZE, 15, 3, { r: 100, g: 70, b: 30 }, 0.3, "overlay");
  // Dark patches
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 20 + Math.random() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(60,40,15,0.4)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;

  // Normal: brushed lines
  const { c: nc, ctx: nctx } = makeCanvas(SIZE);
  for (let y = 0; y < SIZE; y++) {
    const v = ((Math.sin(y * 1.7) + Math.sin(y * 3.1) * 0.5) * 0.5 + 0.5);
    const r = Math.floor(v * 60 + 100);
    nctx.fillStyle = `rgb(${r},${r},255)`;
    nctx.fillRect(0, y, SIZE, 1);
  }
  const normal = new THREE.CanvasTexture(nc);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.anisotropy = 8;

  // Brass is fairly glossy
  const { c: rc, ctx: rctx } = makeCanvas(SIZE);
  rctx.fillStyle = "#444";
  rctx.fillRect(0, 0, SIZE, SIZE);
  fbm(rctx, SIZE, 30, 2, { r: 80, g: 80, b: 80 }, 0.3, "screen");
  const roughness = new THREE.CanvasTexture(rc);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  return { color, normal, roughness };
}

/* ---------------- WOOD (desk surface) ---------------- */

export function makeWoodTextures() {
  const SIZE = 1024;
  const { c, ctx } = makeCanvas(SIZE);

  // Dark walnut
  ctx.fillStyle = "#2a1408";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Wood grain: long vertical streaks
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * SIZE;
    const w = 1 + Math.random() * 3;
    const dark = Math.random() > 0.5;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    if (dark) {
      g.addColorStop(0, "rgba(0,0,0,0.5)");
      g.addColorStop(0.5, "rgba(0,0,0,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0.5)");
    } else {
      g.addColorStop(0, "rgba(160,100,60,0.25)");
      g.addColorStop(0.5, "rgba(160,100,60,0.1)");
      g.addColorStop(1, "rgba(160,100,60,0.25)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, SIZE);
  }

  // Knots
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 20 + Math.random() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(10,5,2,0.7)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  fbm(ctx, SIZE, 60, 2, { r: 50, g: 25, b: 10 }, 0.3, "multiply");

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;
  return { color };
}

/* ===================================================================
   HI-FI TEXTURES — the materials for the 1970s stereo receiver
   =================================================================== */

/* Walnut wood cabinet (warm, vertical grain) */
export function makeWalnutCabinet() {
  const W = 1024, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // Base dark walnut with vertical gradient (lighter top, darker bottom)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#5a2c14");
  grad.addColorStop(0.5, "#4a1c08");
  grad.addColorStop(1, "#2a1004");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Vertical wood grain — long thin streaks
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * W;
    const w = 1 + Math.random() * 4;
    const dark = Math.random() > 0.45;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    if (dark) {
      g.addColorStop(0, "rgba(0,0,0,0.5)");
      g.addColorStop(0.5, "rgba(0,0,0,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0.5)");
    } else {
      g.addColorStop(0, "rgba(180,120,70,0.4)");
      g.addColorStop(0.5, "rgba(180,120,70,0.15)");
      g.addColorStop(1, "rgba(180,120,70,0.4)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, H);
  }

  // Soft horizontal noise overlay (gives wood its natural variation)
  fbm(ctx, W, 8, 4, { r: 50, g: 25, b: 10 }, 0.25, "multiply");
  fbm(ctx, W, 20, 3, { r: 90, g: 50, b: 25 }, 0.15, "screen");

  // A few knots
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 30 + Math.random() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(15,8,3,0.7)");
    g.addColorStop(0.6, "rgba(15,8,3,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top highlight (light hitting the top edge of the cabinet)
  const topHL = ctx.createLinearGradient(0, 0, 0, H * 0.2);
  topHL.addColorStop(0, "rgba(200,140,80,0.4)");
  topHL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topHL;
  ctx.fillRect(0, 0, W, H * 0.2);

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;
  return color;
}

/* Brushed aluminum faceplate (horizontal grain) */
export function makeBrushedAluminum() {
  const W = 2048, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // Base silver gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#b8bcc0");
  grad.addColorStop(0.5, "#c8ccd0");
  grad.addColorStop(1, "#a8acaf");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Horizontal brushed lines (aluminum grain runs left-to-right)
  for (let i = 0; i < 8000; i++) {
    const y = Math.random() * H;
    const x = Math.random() * W;
    const len = 40 + Math.random() * 200;
    const isLight = Math.random() > 0.5;
    ctx.strokeStyle = isLight
      ? `rgba(255,255,255,${0.04 + Math.random() * 0.07})`
      : `rgba(60,60,60,${0.04 + Math.random() * 0.07})`;
    ctx.lineWidth = 0.5 + Math.random() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // Long horizontal scratches
  ctx.strokeStyle = "rgba(40,40,40,0.3)";
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * H;
    const x = Math.random() * W;
    const len = 200 + Math.random() * 600;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // Tarnish / aging patches
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 80 + Math.random() * 250;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(60,50,30,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top edge highlight (light catching the upper bevel)
  const topHL = ctx.createLinearGradient(0, 0, 0, H * 0.08);
  topHL.addColorStop(0, "rgba(255,255,255,0.35)");
  topHL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topHL;
  ctx.fillRect(0, 0, W, H * 0.08);

  // Bottom edge shadow
  const botSh = ctx.createLinearGradient(0, H * 0.92, 0, H);
  botSh.addColorStop(0, "rgba(0,0,0,0)");
  botSh.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = botSh;
  ctx.fillRect(0, H * 0.92, W, H * 0.08);

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 16;
  return color;
}

/* Chrome (polished metal — bezel rings, knob bodies) */
export function makeChrome() {
  const SIZE = 512;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;
  // Bright radial — top-left highlight
  const grad = ctx.createRadialGradient(SIZE * 0.35, SIZE * 0.3, 10, SIZE / 2, SIZE / 2, SIZE * 0.7);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.25, "#e0e4e8");
  grad.addColorStop(0.55, "#9aa0a4");
  grad.addColorStop(0.8, "#5a5e62");
  grad.addColorStop(1, "#3a3e42");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Brushed pattern (subtle)
  for (let i = 0; i < 1500; i++) {
    const y = Math.random() * SIZE;
    const x = Math.random() * SIZE;
    const len = 5 + Math.random() * 20;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* VU meter face: cream parchment with arc numbers, red zone, and "dB" */
export function makeVuMeterFace(opts: { title: string; subtitle: string }) {
  const SIZE = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const cx = SIZE / 2, cy = SIZE * 0.55;
  const R = SIZE * 0.42;

  // Clip to dial circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
  ctx.clip();

  // Cream parchment background
  const bg = ctx.createRadialGradient(cx, cy * 0.85, R * 0.3, cx, cy, R);
  bg.addColorStop(0, "#f8eed0");
  bg.addColorStop(0.6, "#e6d4a0");
  bg.addColorStop(1, "#a08868");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Aging stains
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 5 + Math.random() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${100 + Math.random() * 40},${80 + Math.random() * 30},${40 + Math.random() * 20},${0.06 + Math.random() * 0.1})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red zone (right side, 0% to 25% of arc)
  const redStart = -120 + 0.75 * 240; // start of red zone
  const redEnd = 120;
  ctx.fillStyle = "rgba(200, 30, 30, 0.25)";
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.88, ((redStart - 90) * Math.PI) / 180, ((redEnd - 90) * Math.PI) / 180);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();

  // Tick marks (major + minor)
  ctx.strokeStyle = "#1a1208";
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= 20; i++) {
    const a = -120 + (i * 240) / 20;
    const rad = ((a - 90) * Math.PI) / 180;
    const r1 = R * 0.85;
    const r2 = i % 5 === 0 ? R * 0.95 : R * 0.92;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
    ctx.stroke();
  }

  // VU sub-scale (lower arc, smaller)
  ctx.strokeStyle = "#1a1208";
  ctx.lineWidth = 1.2;
  for (let i = 0; i <= 10; i++) {
    const a = -120 + (i * 240) / 10;
    const rad = ((a - 90) * Math.PI) / 180;
    const r1 = R * 0.55;
    const r2 = R * 0.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
    ctx.stroke();
  }

  // Top arc numbers (0, 20, 40, 60, 80, 100)
  ctx.fillStyle = "#1a1208";
  ctx.font = "900 36px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 5; i++) {
    const a = -120 + (i * 240) / 5;
    const rad = ((a - 90) * Math.PI) / 180;
    const r = R * 0.75;
    ctx.fillText(String(i * 20), cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
  }

  // Sub-scale numbers
  ctx.font = "600 20px 'Helvetica Neue', sans-serif";
  const subNums = ["-20", "-10", "-5", "-3", "0"];
  for (let i = 0; i < subNums.length; i++) {
    const a = -120 + (i * 240) / (subNums.length - 1);
    const rad = ((a - 90) * Math.PI) / 180;
    const r = R * 0.5;
    ctx.fillText(subNums[i], cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
  }

  // "VU" letters at endpoints
  ctx.font = "italic 700 30px 'Times New Roman', serif";
  ctx.fillText("VU", cx - R * 0.95, cy - R * 0.1);
  ctx.fillText("VU", cx + R * 0.95, cy - R * 0.1);

  // Title (top center)
  ctx.font = "900 50px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.fillStyle = "#1a1208";
  ctx.fillText(opts.title, cx, cy - R * 0.18);

  // Subtitle
  ctx.font = "italic 700 28px 'Helvetica Neue', sans-serif";
  ctx.fillText(opts.subtitle, cx, cy + R * 0.05);

  // "POWER OUTPUT" / "LEFT CHANNEL" engraved at the bottom of the dial
  ctx.font = "900 24px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.fillText("POWER OUTPUT", cx, cy + R * 0.78);
  ctx.font = "700 18px 'Helvetica Neue', sans-serif";
  ctx.fillText(opts.subtitle, cx, cy + R * 0.88);

  ctx.restore();

  // Glass glare on top
  const gl = ctx.createRadialGradient(cx * 0.7, cy * 0.4, 10, cx * 0.7, cy * 0.4, R * 0.6);
  gl.addColorStop(0, "rgba(255,255,255,0.45)");
  gl.addColorStop(0.5, "rgba(255,255,255,0.1)");
  gl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Tuner dial face — backlit orange with FM/AM scales and frequency numbers */
export function makeTunerFace() {
  const W = 2048, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // Dark amber backlit background (the glow)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#3a1a04");
  grad.addColorStop(0.5, "#2a1004");
  grad.addColorStop(1, "#1a0a02");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Warm vignette — brightest in the center
  const vg = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.5);
  vg.addColorStop(0, "rgba(255, 160, 60, 0.4)");
  vg.addColorStop(0.4, "rgba(255, 120, 30, 0.15)");
  vg.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // "STEREO RECEIVER" engraved at the top
  ctx.font = "900 28px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 200, 120, 0.7)";
  ctx.fillText("STEREO RECEIVER", W / 2, 30);

  // FM scale (top)
  ctx.fillStyle = "rgba(255, 220, 160, 0.9)";
  ctx.font = "900 36px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FM", 80, H * 0.35);
  ctx.textAlign = "right";
  ctx.fillText("MHz", W - 200, H * 0.35);

  // FM tick marks and numbers (88, 92, 96, 100, 104, 108)
  const fmNumbers = ["88", "92", "96", "100", "104", "108"];
  const fmStartX = 200;
  const fmEndX = W - 200;
  for (let i = 0; i < fmNumbers.length; i++) {
    const x = fmStartX + (i * (fmEndX - fmStartX)) / (fmNumbers.length - 1);
    // Major tick
    ctx.strokeStyle = "rgba(255, 220, 160, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.22);
    ctx.lineTo(x, H * 0.42);
    ctx.stroke();
    // Number below
    ctx.fillStyle = "rgba(255, 230, 180, 0.95)";
    ctx.font = "900 40px 'Helvetica Neue', 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fmNumbers[i], x, H * 0.52);
  }
  // Minor ticks between
  for (let i = 0; i < (fmNumbers.length - 1) * 4; i++) {
    const x = fmStartX + (i * (fmEndX - fmStartX)) / ((fmNumbers.length - 1) * 4);
    ctx.strokeStyle = "rgba(255, 220, 160, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.25);
    ctx.lineTo(x, H * 0.4);
    ctx.stroke();
  }

  // AM scale (bottom)
  ctx.fillStyle = "rgba(255, 200, 120, 0.85)";
  ctx.font = "900 32px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("AM", 80, H * 0.75);
  ctx.textAlign = "right";
  ctx.fillText("kHz", W - 200, H * 0.75);

  const amNumbers = ["550", "700", "1000", "1300", "1600"];
  for (let i = 0; i < amNumbers.length; i++) {
    const x = fmStartX + (i * (fmEndX - fmStartX)) / (amNumbers.length - 1);
    ctx.strokeStyle = "rgba(255, 200, 120, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.65);
    ctx.lineTo(x, H * 0.82);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 220, 160, 0.85)";
    ctx.font = "700 30px 'Helvetica Neue', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(amNumbers[i], x, H * 0.9);
  }
  // Minor AM ticks
  for (let i = 0; i < (amNumbers.length - 1) * 5; i++) {
    const x = fmStartX + (i * (fmEndX - fmStartX)) / ((amNumbers.length - 1) * 5);
    ctx.strokeStyle = "rgba(255, 200, 120, 0.4)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.68);
    ctx.lineTo(x, H * 0.8);
    ctx.stroke();
  }

  // Glowing center line (the indicator) — will be drawn on top in 3D as a separate plane
  // Glass glare
  const gl = ctx.createLinearGradient(0, 0, 0, H);
  gl.addColorStop(0, "rgba(255, 200, 130, 0.15)");
  gl.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  gl.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Tuner backlight (separate emissive plane behind the face for the glow) */
export function makeTunerBacklight() {
  const W = 2048, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  // Hot orange in the center, darker at edges
  const grad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.6);
  grad.addColorStop(0, "#ff8030");
  grad.addColorStop(0.5, "#c85010");
  grad.addColorStop(1, "#1a0a04");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Cassette face — the "70'S MIX" tape label visible through the window */
export function makeCassetteFace(labelText: string) {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  // Dark cassette body
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(0, 0, W, H);
  // Inner window (lighter, like a label)
  ctx.fillStyle = "#e8d4a0";
  ctx.fillRect(W * 0.1, H * 0.15, W * 0.8, H * 0.7);
  // Label
  ctx.fillStyle = "#1a0a04";
  ctx.font = "italic 900 60px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText(labelText, W / 2, H * 0.4);
  // Tape spools (two circles on either side)
  ctx.fillStyle = "#3a2010";
  ctx.beginPath();
  ctx.arc(W * 0.2, H * 0.5, H * 0.18, 0, Math.PI * 2);
  ctx.arc(W * 0.8, H * 0.5, H * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Hub holes
  ctx.fillStyle = "#0a0402";
  ctx.beginPath();
  ctx.arc(W * 0.2, H * 0.5, H * 0.05, 0, Math.PI * 2);
  ctx.arc(W * 0.8, H * 0.5, H * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Tape strip between spools
  ctx.fillStyle = "#1a0a04";
  ctx.fillRect(W * 0.28, H * 0.49, W * 0.44, 4);
  // "A" side indicator
  ctx.fillStyle = "#1a0a04";
  ctx.font = "900 24px 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("A", W * 0.12, H * 0.2);
  // Bottom text
  ctx.font = "700 18px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("AUDIO CASSETTE", W / 2, H * 0.9);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Knob numbered face (0-10 around the bottom arc) */
export function makeKnobNumberedFace(max = 10) {
  const SIZE = 512;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const cx = SIZE / 2, cy = SIZE / 2;
  const R = SIZE * 0.42;
  // Chrome base
  const grad = ctx.createRadialGradient(cx * 0.7, cy * 0.7, 10, cx, cy, R);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.4, "#c8ccd0");
  grad.addColorStop(1, "#4a4e52");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  // Knurled marks around the perimeter
  ctx.strokeStyle = "rgba(40,40,40,0.5)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r1 = R * 0.95;
    const r2 = R * 1.02;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }
  // Numbers 0..max around the bottom arc
  ctx.fillStyle = "#1a1208";
  ctx.font = "900 32px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= max; i++) {
    const a = -135 + (i * 270) / max;
    const rad = ((a - 90) * Math.PI) / 180;
    const r = R * 1.18;
    ctx.fillText(String(i), cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Engraved text on a thin plane (used for all the labels) */
export function makeEngravedLabel(text: string, fontSize = 32, color = "#1a1208"): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = Math.max(256, text.length * fontSize * 0.7);
  c.height = fontSize * 1.6;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = `900 ${fontSize}px "Helvetica Neue", "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Drop shadow (engraved look)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(text, c.width / 2, c.height / 2 + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
