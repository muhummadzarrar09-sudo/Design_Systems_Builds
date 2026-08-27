// Procedural PBR texture generation — no external assets needed.
// Everything is generated on a <canvas> at module-load time, then wrapped
// in a CanvasTexture with proper sRGB / linear color space flags.

import * as THREE from "three";

function makeCanvas(w = 512, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
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

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, "#5a2410");
  grad.addColorStop(0.5, "#4a1a08");
  grad.addColorStop(1, "#3a1408");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  fbm(ctx, SIZE, 6, 4, { r: 60, g: 30, b: 15 }, 0.45);
  fbm(ctx, SIZE, 80, 2, { r: 30, g: 15, b: 8 }, 0.55, "multiply");
  fbm(ctx, SIZE, 20, 3, { r: 90, g: 50, b: 25 }, 0.18, "screen");

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

  const { c: nc, ctx: nctx } = makeCanvas(SIZE);
  const heightData = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const normalData = nctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const l = (y * SIZE + Math.max(0, x - 1)) * 4;
      const r = (y * SIZE + Math.min(SIZE - 1, x + 1)) * 4;
      const u = (Math.max(0, y - 1) * SIZE + x) * 4;
      const d = (Math.min(SIZE - 1, y + 1) * SIZE + x) * 4;
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

  ctx.fillStyle = "#f0e4c8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const vg = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.2, SIZE / 2, SIZE / 2, SIZE * 0.7);
  vg.addColorStop(0, "rgba(255,255,255,0)");
  vg.addColorStop(1, "rgba(180,150,100,0.18)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  fbm(ctx, SIZE, 120, 2, { r: 180, g: 160, b: 120 }, 0.18, "multiply");
  fbm(ctx, SIZE, 20, 3, { r: 220, g: 200, b: 160 }, 0.1, "screen");

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
  return { color };
}

/* ---------------- BRASS: brushed metal with patina ---------------- */

export function makeBrassTextures() {
  const SIZE = 512;
  const { c, ctx } = makeCanvas(SIZE);

  ctx.fillStyle = "#c89030";
  ctx.fillRect(0, 0, SIZE, SIZE);

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

  fbm(ctx, SIZE, 15, 3, { r: 100, g: 70, b: 30 }, 0.3, "overlay");
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
  return { color };
}

/* ---------------- WOOD (generic desk surface) ---------------- */

export function makeWoodTextures() {
  const SIZE = 1024;
  const { c, ctx } = makeCanvas(SIZE);

  ctx.fillStyle = "#2a1408";
  ctx.fillRect(0, 0, SIZE, SIZE);

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

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#6a3418");
  grad.addColorStop(0.45, "#4a2008");
  grad.addColorStop(1, "#2a1004");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Vertical wood grain — long thin streaks
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * W;
    const w = 1 + Math.random() * 4;
    const dark = Math.random() > 0.45;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    if (dark) {
      g.addColorStop(0, "rgba(0,0,0,0.5)");
      g.addColorStop(0.5, "rgba(0,0,0,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0.5)");
    } else {
      g.addColorStop(0, "rgba(200,130,70,0.4)");
      g.addColorStop(0.5, "rgba(200,130,70,0.15)");
      g.addColorStop(1, "rgba(200,130,70,0.4)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, H);
  }

  fbm(ctx, W, 8, 4, { r: 50, g: 25, b: 10 }, 0.25, "multiply");
  fbm(ctx, W, 20, 3, { r: 90, g: 50, b: 25 }, 0.15, "screen");

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
  topHL.addColorStop(0, "rgba(220,150,90,0.45)");
  topHL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topHL;
  ctx.fillRect(0, 0, W, H * 0.2);

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;
  return color;
}

/* Desk wood — horizontal grain, warmer reddish walnut like the photo */
export function makeDeskWood() {
  const W = 2048, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#5a2c14");
  grad.addColorStop(0.5, "#48200c");
  grad.addColorStop(1, "#30140a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 500; i++) {
    const y = Math.random() * H;
    const h = 1 + Math.random() * 3;
    const dark = Math.random() > 0.5;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    if (dark) {
      g.addColorStop(0, "rgba(0,0,0,0.45)");
      g.addColorStop(1, "rgba(0,0,0,0.45)");
    } else {
      g.addColorStop(0, "rgba(190,120,70,0.3)");
      g.addColorStop(1, "rgba(190,120,70,0.12)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, h);
  }

  // Long wavy grain lines
  ctx.strokeStyle = "rgba(20,8,4,0.35)";
  for (let i = 0; i < 60; i++) {
    const y0 = Math.random() * H;
    ctx.lineWidth = 0.6 + Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    for (let x = 0; x <= W; x += 64) {
      ctx.lineTo(x, y0 + Math.sin(x * 0.01 + i) * 6);
    }
    ctx.stroke();
  }

  fbm(ctx, W, 10, 3, { r: 60, g: 30, b: 14 }, 0.22, "multiply");

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 16;
  return color;
}

/* Brushed aluminum faceplate (horizontal grain) */
export function makeBrushedAluminum() {
  const W = 2048, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#b4b8bc");
  grad.addColorStop(0.35, "#c8ccd0");
  grad.addColorStop(0.75, "#b0b4b8");
  grad.addColorStop(1, "#989ca0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Horizontal brushed lines
  for (let i = 0; i < 9000; i++) {
    const y = Math.random() * H;
    const x = Math.random() * W;
    const len = 40 + Math.random() * 220;
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
    g.addColorStop(0, "rgba(60,50,30,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top edge highlight
  const topHL = ctx.createLinearGradient(0, 0, 0, H * 0.08);
  topHL.addColorStop(0, "rgba(255,255,255,0.4)");
  topHL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topHL;
  ctx.fillRect(0, 0, W, H * 0.08);

  // Bottom edge shadow
  const botSh = ctx.createLinearGradient(0, H * 0.9, 0, H);
  botSh.addColorStop(0, "rgba(0,0,0,0)");
  botSh.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = botSh;
  ctx.fillRect(0, H * 0.9, W, H * 0.1);

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
  const grad = ctx.createRadialGradient(SIZE * 0.35, SIZE * 0.3, 10, SIZE / 2, SIZE / 2, SIZE * 0.7);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.25, "#e0e4e8");
  grad.addColorStop(0.55, "#9aa0a4");
  grad.addColorStop(0.8, "#5a5e62");
  grad.addColorStop(1, "#3a3e42");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

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

/* Knurled chrome — vertical ridges for knob rims (maps around a cylinder side) */
export function makeKnurlChrome() {
  const W = 512, H = 256;
  const { c, ctx } = makeCanvas(W, H);

  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#e8ebee");
  base.addColorStop(0.5, "#a8acb0");
  base.addColorStop(1, "#585c60");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Ridges: alternating light/dark vertical stripes
  for (let x = 0; x < W; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 8, 0);
    g.addColorStop(0, "rgba(20,22,24,0.55)");
    g.addColorStop(0.35, "rgba(255,255,255,0.5)");
    g.addColorStop(0.65, "rgba(140,144,148,0.2)");
    g.addColorStop(1, "rgba(20,22,24,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 8, H);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/* Spun-metal knob top with a pointer line at 12 o'clock */
export function makeSpunMetalTop() {
  const SIZE = 512;
  const { c, ctx } = makeCanvas(SIZE);
  const cx = SIZE / 2;

  const base = ctx.createRadialGradient(cx * 0.75, cx * 0.7, 20, cx, cx, SIZE * 0.72);
  base.addColorStop(0, "#f2f4f6");
  base.addColorStop(0.45, "#c0c4c8");
  base.addColorStop(0.8, "#888c90");
  base.addColorStop(1, "#606468");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(cx, cx, cx, 0, Math.PI * 2);
  ctx.fill();

  // Concentric spinning marks
  for (let r = 8; r < cx; r += 3) {
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "40,44,48"},${0.05 + Math.random() * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Pointer line at top
  ctx.strokeStyle = "#16100a";
  ctx.lineCap = "round";
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(cx, SIZE * 0.1);
  ctx.lineTo(cx, SIZE * 0.24);
  ctx.stroke();

  // Center dimple
  const dim = ctx.createRadialGradient(cx, cx, 2, cx, cx, 40);
  dim.addColorStop(0, "rgba(30,32,34,0.55)");
  dim.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dim;
  ctx.beginPath();
  ctx.arc(cx, cx, 40, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Number ring 0..max around a -135°..+135° arc (transparent plane around knobs) */
export function makeNumberRing(max = 10) {
  const SIZE = 512;
  const { c, ctx } = makeCanvas(SIZE);
  const cx = SIZE / 2, cy = SIZE / 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= max; i++) {
    const a = -135 + (i * 270) / max;
    const rad = (a * Math.PI) / 180;
    // Tick dot (just outside the knob flange)
    ctx.fillStyle = "rgba(26,18,8,0.9)";
    ctx.beginPath();
    ctx.arc(cx + Math.sin(rad) * SIZE * 0.385, cy - Math.cos(rad) * SIZE * 0.385, 4, 0, Math.PI * 2);
    ctx.fill();
    // Engraved number (light shadow below = pressed-in look)
    const nx = cx + Math.sin(rad) * SIZE * 0.465;
    const ny = cy - Math.cos(rad) * SIZE * 0.465;
    ctx.font = "700 40px 'Helvetica Neue', 'Arial Black', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(String(i), nx, ny + 2);
    ctx.fillStyle = "#1a1208";
    ctx.fillText(String(i), nx, ny);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ===================================================================
   VU METER FACE — 1:1 with the reference photo
   =================================================================== */

/** Fraction of the meter radius the needle pivot sits below the disc center. */
export const VU_PIVOT_Y = -0.055;

export function makeVuMeterFace(opts: { subtitle: string }) {
  const SIZE = 1024;
  const { c, ctx } = makeCanvas(SIZE);
  const cx = SIZE / 2;
  const cy = SIZE * 0.54; // dial pivot slightly below disc center
  const R = SIZE * 0.47;

  // Cream parchment, warmly lit from below like a lamp-lit meter
  const bg = ctx.createRadialGradient(cx, cy - R * 0.35, R * 0.2, cx, cy, R * 1.15);
  bg.addColorStop(0, "#f8ecc8");
  bg.addColorStop(0.55, "#eedaa8");
  bg.addColorStop(1, "#b09468");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Aging stains
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 5 + Math.random() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${100 + Math.random() * 40},${80 + Math.random() * 30},${40 + Math.random() * 20},${0.05 + Math.random() * 0.08})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warm lamp glow rising from the bottom wedge
  const lamp = ctx.createRadialGradient(cx, cy + R * 0.55, 10, cx, cy + R * 0.55, R * 0.9);
  lamp.addColorStop(0, "rgba(255,170,70,0.35)");
  lamp.addColorStop(1, "rgba(255,170,70,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const polar = (aDeg: number, r: number) => {
    const rad = (aDeg * Math.PI) / 180; // 0 = straight up, + = right
    return [cx + Math.sin(rad) * r, cy - Math.cos(rad) * r] as const;
  };

  // Red zone band (values 70..100 on the right)
  ctx.strokeStyle = "rgba(200,32,20,0.85)";
  ctx.lineWidth = R * 0.075;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.885, ((70 - 90) * Math.PI) / 180, ((100 - 90) * Math.PI) / 180);
  ctx.stroke();

  // Ticks: majors every 20, minors every 5, across -50°..+50°
  for (let v = 0; v <= 100; v += 5) {
    const a = -50 + v; // degrees
    const major = v % 20 === 0;
    const [x1, y1] = polar(a, R * 0.93);
    const [x2, y2] = polar(a, R * (major ? 0.8 : 0.86));
    ctx.strokeStyle = "#1a1208";
    ctx.lineWidth = major ? 5 : 2.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Main numbers 0..100
  ctx.fillStyle = "#1a1208";
  ctx.font = "800 44px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let v = 0; v <= 100; v += 20) {
    const [x, y] = polar(-50 + v, R * 0.68);
    ctx.fillText(String(v), x, y);
  }

  // dB sub-scale
  ctx.font = "700 24px 'Helvetica Neue', sans-serif";
  const subs = ["-20", "-10", "-5", "-3", "0", "+3"];
  for (let i = 0; i < subs.length; i++) {
    const a = -50 + (i * 100) / (subs.length - 1);
    const [x1, y1] = polar(a, R * 0.52);
    const [x2, y2] = polar(a, R * 0.46);
    ctx.strokeStyle = "#1a1208";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const [x, y] = polar(a, R * 0.38);
    ctx.fillText(subs[i], x, y);
  }

  // "dB" title
  ctx.font = "900 68px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.fillText("dB", cx, cy - R * 0.12);

  // Black bottom wedge with white POWER OUTPUT text
  ctx.fillStyle = "#15100b";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R * 1.02, ((118 - 90) * Math.PI) / 180, ((242 - 90) * Math.PI) / 180);
  ctx.closePath();
  ctx.fill();
  const wedgeHL = ctx.createLinearGradient(0, cy, 0, cy + R);
  wedgeHL.addColorStop(0, "rgba(255,160,60,0.18)");
  wedgeHL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wedgeHL;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R * 1.02, ((118 - 90) * Math.PI) / 180, ((242 - 90) * Math.PI) / 180);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f2e8d4";
  ctx.font = "800 34px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.fillText("POWER OUTPUT", cx, cy + R * 0.42);
  ctx.font = "700 26px 'Helvetica Neue', sans-serif";
  ctx.fillStyle = "#d8ccb4";
  ctx.fillText(opts.subtitle, cx, cy + R * 0.56);

  // Inner rim shadow (recessed look)
  const rim = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.05);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(20,10,4,0.55)");
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
  ctx.fill();

  // Glass glare top-left
  const gl = ctx.createRadialGradient(cx * 0.72, cy * 0.42, 10, cx * 0.72, cy * 0.42, R * 0.7);
  gl.addColorStop(0, "rgba(255,255,255,0.28)");
  gl.addColorStop(0.5, "rgba(255,255,255,0.07)");
  gl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ===================================================================
   TUNER DIAL FACE — backlit amber glass with FM/AM scales
   =================================================================== */

export function makeTunerFace() {
  const W = 2048, H = 512;
  const { c, ctx } = makeCanvas(W, H);

  // Dark amber glass
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#2a1206");
  grad.addColorStop(0.5, "#200c04");
  grad.addColorStop(1, "#140802");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Hot backlight pooling in the center
  const hot = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.42);
  hot.addColorStop(0, "rgba(255,150,50,0.5)");
  hot.addColorStop(0.5, "rgba(255,110,30,0.18)");
  hot.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hot;
  ctx.fillRect(0, 0, W, H);

  const L = 240, Rt = W - 420; // scale span
  ctx.textBaseline = "middle";

  // FM row: label, numbers, unit
  ctx.fillStyle = "#ff9838";
  ctx.font = "800 46px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FM", 90, H * 0.3);
  ctx.textAlign = "right";
  ctx.fillText("MHz/kHz", W - 90, H * 0.3);

  const fm = ["88", "92", "96", "100", "104", "108"];
  ctx.textAlign = "center";
  ctx.font = "800 58px 'Helvetica Neue', 'Arial Black', sans-serif";
  for (let i = 0; i < fm.length; i++) {
    const x = L + (i * (Rt - L)) / (fm.length - 1);
    ctx.fillStyle = "#ffc070";
    ctx.fillText(fm[i], x, H * 0.28);
  }

  // Tick band between the rows
  ctx.strokeStyle = "#ff9838";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(L, H * 0.5);
  ctx.lineTo(Rt, H * 0.5);
  ctx.stroke();
  for (let i = 0; i <= 40; i++) {
    const x = L + (i * (Rt - L)) / 40;
    const major = i % 4 === 0;
    ctx.lineWidth = major ? 3 : 1.6;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.5 - (major ? 26 : 14));
    ctx.lineTo(x, H * 0.5);
    ctx.stroke();
  }

  // AM row
  ctx.fillStyle = "#e07820";
  ctx.font = "800 42px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("AM", 90, H * 0.74);
  ctx.textAlign = "right";
  ctx.fillText("kHz/kHz", W - 90, H * 0.74);

  const am = ["550", "700", "1000", "1300", "1600"];
  ctx.textAlign = "center";
  ctx.font = "700 46px 'Helvetica Neue', sans-serif";
  for (let i = 0; i < am.length; i++) {
    const x = L + (i * (Rt - L)) / (am.length - 1);
    ctx.fillStyle = "#ffab58";
    ctx.fillText(am[i], x, H * 0.74);
  }

  // Glass glare
  const gl = ctx.createLinearGradient(0, 0, 0, H);
  gl.addColorStop(0, "rgba(255,200,130,0.12)");
  gl.addColorStop(0.45, "rgba(0,0,0,0)");
  gl.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Soft radial glow sprite (LED halos, needle glow, indicator bloom helper) */
export function makeGlowTexture(inner = "#ffd9a0", outer = "#ff7010") {
  const SIZE = 256;
  const { c, ctx } = makeCanvas(SIZE);
  const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 2, SIZE / 2, SIZE / 2, SIZE / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, outer);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ===================================================================
   CASSETTE — shell + label, spools, mechanical counter
   =================================================================== */

export function makeCassetteFace(labelText: string) {
  const W = 1024, H = 512;
  const { c, ctx } = makeCanvas(W, H);

  // Shell
  ctx.fillStyle = "#241a10";
  ctx.fillRect(0, 0, W, H);
  const shellHL = ctx.createLinearGradient(0, 0, 0, H);
  shellHL.addColorStop(0, "rgba(255,240,200,0.14)");
  shellHL.addColorStop(0.2, "rgba(0,0,0,0)");
  shellHL.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = shellHL;
  ctx.fillRect(0, 0, W, H);

  // Paper label
  const lab = ctx.createLinearGradient(0, 60, 0, 300);
  lab.addColorStop(0, "#f0e2bc");
  lab.addColorStop(1, "#d8c498");
  ctx.fillStyle = lab;
  ctx.fillRect(70, 60, W - 140, 240);
  ctx.strokeStyle = "rgba(60,40,20,0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 250);
  ctx.lineTo(W - 70, 250);
  ctx.stroke();

  // "A" side chip
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(90, 80, 56, 56);
  ctx.fillStyle = "#f0e2bc";
  ctx.font = "900 40px 'Helvetica Neue', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", 118, 110);

  // Label text
  ctx.fillStyle = "#241812";
  ctx.font = "italic 900 74px 'Times New Roman', serif";
  ctx.fillText(labelText, W / 2, 170);

  // Window band
  ctx.fillStyle = "#0c0805";
  ctx.fillRect(120, 320, W - 240, 120);
  const winHL = ctx.createLinearGradient(0, 320, 0, 440);
  winHL.addColorStop(0, "rgba(255,255,255,0.08)");
  winHL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = winHL;
  ctx.fillRect(120, 320, W - 240, 120);

  // Spool holes (3D spools sit on top of these)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(W * 0.32, 380, 58, 0, Math.PI * 2);
  ctx.arc(W * 0.68, 380, 58, 0, Math.PI * 2);
  ctx.fill();

  // Bottom text
  ctx.fillStyle = "#c8b890";
  ctx.font = "700 30px 'Helvetica Neue', sans-serif";
  ctx.fillText("AUDIO CASSETTE", W / 2, 476);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* Cassette spool hub — cream hub with 6 teeth on black */
export function makeSpoolTexture() {
  const SIZE = 256;
  const { c, ctx } = makeCanvas(SIZE);
  const cx = SIZE / 2;

  ctx.fillStyle = "#050302";
  ctx.beginPath();
  ctx.arc(cx, cx, cx - 2, 0, Math.PI * 2);
  ctx.fill();

  // Wound tape edge
  ctx.strokeStyle = "#2a1a0c";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cx, SIZE * 0.36, 0, Math.PI * 2);
  ctx.stroke();

  // Cream hub
  ctx.fillStyle = "#e8dcb8";
  ctx.beginPath();
  ctx.arc(cx, cx, SIZE * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Teeth
  ctx.fillStyle = "#e8dcb8";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cx);
    ctx.rotate(a);
    ctx.fillRect(-7, -SIZE * 0.34, 14, SIZE * 0.12);
    ctx.restore();
  }

  // Center hole
  ctx.fillStyle = "#050302";
  ctx.beginPath();
  ctx.arc(cx, cx, SIZE * 0.09, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Mechanical tape counter — white digits on black cells */
export function makeCounterTexture(count: number) {
  const W = 512, H = 256;
  const { c, ctx } = makeCanvas(W, H);

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const digits = String(Math.max(0, Math.min(999, count))).padStart(3, "0");
  const cellW = W / 3;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 3; i++) {
    // Cell background with vertical sheen
    const g = ctx.createLinearGradient(0, 20, 0, H - 20);
    g.addColorStop(0, "#1a1a1a");
    g.addColorStop(0.5, "#3a3a3a");
    g.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = g;
    ctx.fillRect(i * cellW + 8, 28, cellW - 16, H - 56);
    ctx.fillStyle = "#f2f2ea";
    ctx.font = "900 130px 'Courier New', monospace";
    ctx.fillText(digits[i], i * cellW + cellW / 2, H / 2 + 4);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;
    ctx.strokeRect(i * cellW + 8, 28, cellW - 16, H - 56);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Engraved text on a thin plane (used for all the labels) */
export function makeEngravedLabel(text: string, fontSize = 32, color = "#1a1208"): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = Math.max(256, text.length * fontSize * 0.72);
  c.height = fontSize * 1.7;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = `800 ${fontSize}px "Helvetica Neue", "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Light edge below = pressed-into-metal look
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(text, c.width / 2, c.height / 2 + fontSize * 0.05);
  ctx.fillStyle = color;
  ctx.fillText(text, c.width / 2, c.height / 2 - fontSize * 0.03);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
