/* ────────────────────────────────────────────────────────────────
   Offline orthographic renderer — a QA tool so the model can be
   eyeballed without a browser.  Rasterises the built scene with a
   depth buffer + two-sided lambert shading and writes a PNG.

     npx tsx scripts/render.ts side   [out.png] [pxPerM]
     npx tsx scripts/render.ts front  [out.png]
     npx tsx scripts/render.ts persp  [out.png]   (3/4 view)
   ──────────────────────────────────────────────────────────────── */
import * as THREE from "three";
import * as zlib from "zlib";
import * as fs from "fs";
import * as path from "path";
import { buildJetourT1 } from "../components/scene/JetourT1";

/* ---------------- tiny PNG writer ---------------- */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function writePng(file: string, w: number, h: number, rgb: Uint8Array) {
  const stride = w * 3;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgb.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

/* ---------------- scene ---------------- */
const { group } = buildJetourT1({ textures: false, merge: false });
group.updateMatrixWorld(true);

type Tri = {
  a: THREE.Vector3;
  b: THREE.Vector3;
  c: THREE.Vector3;
  n: THREE.Vector3;
  col: [number, number, number];
  emissive: [number, number, number];
  alpha: number;
};
const tris: Tri[] = [];
group.traverse((o) => {
  const mesh = o as THREE.Mesh;
  if (!mesh.isMesh) return;
  const g = mesh.geometry as THREE.BufferGeometry;
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nrm = g.attributes.normal as THREE.BufferAttribute | undefined;
  const idx = g.index;
  const mat = mesh.material as THREE.MeshStandardMaterial;
  const col = mat.color ?? new THREE.Color("#888888");
  const em = (mat.emissive ?? new THREE.Color(0x000000)) as THREE.Color;
  const ei = mat.emissiveIntensity ?? 0;
  const alpha = mat.transparent ? (mat.opacity ?? 1) : 1;
  const count = idx ? idx.count : pos.count;
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  const na = new THREE.Vector3();
  for (let i = 0; i < count; i += 3) {
    const i0 = idx ? idx.getX(i) : i;
    const i1 = idx ? idx.getX(i + 1) : i + 1;
    const i2 = idx ? idx.getX(i + 2) : i + 2;
    va.fromBufferAttribute(pos, i0).applyMatrix4(mesh.matrixWorld);
    vb.fromBufferAttribute(pos, i1).applyMatrix4(mesh.matrixWorld);
    vc.fromBufferAttribute(pos, i2).applyMatrix4(mesh.matrixWorld);
    const n = new THREE.Vector3()
      .subVectors(vb, va)
      .cross(new THREE.Vector3().subVectors(vc, va))
      .normalize();
    if (!isFinite(n.x) || n.lengthSq() < 1e-12) continue;
    let sx = 0;
    if (nrm) {
      na.fromBufferAttribute(nrm, i0).transformDirection(mesh.matrixWorld);
      sx = na.dot(n) < 0 ? -1 : 1;
    }
    if (sx === 0) sx = 1;
    tris.push({
      a: va.clone(),
      b: vb.clone(),
      c: vc.clone(),
      n: n.multiplyScalar(sx),
      col: [col.r, col.g, col.b],
      emissive: [em.r * ei, em.g * ei, em.b * ei],
      alpha,
    });
  }
});

/* ---------------- camera ---------------- */
type Cam = { u: (p: THREE.Vector3) => number; v: (p: THREE.Vector3) => number; d: (p: THREE.Vector3) => number };
function ortho(dirSign: 1 | -1, axis: "x" | "z"): Cam {
  // side view: look down -X, screen right = -Z   |   front view: look down -Z, screen right = +X
  if (axis === "x")
    return { u: (p) => -p.z * dirSign, v: (p) => p.y, d: (p) => p.x * dirSign };
  return { u: (p) => p.x * dirSign, v: (p) => p.y, d: (p) => p.z * dirSign };
}
function persp(azim: number, elev: number, target = new THREE.Vector3(0, 0.85, 0)): Cam {
  const a = (azim * Math.PI) / 180;
  const e = (elev * Math.PI) / 180;
  const fwd = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), fwd).normalize();
  const up = new THREE.Vector3().crossVectors(fwd, right).normalize();
  return {
    u: (p) => p.clone().sub(target).dot(right),
    v: (p) => -p.clone().sub(target).dot(up),
    d: (p) => -p.clone().sub(target).dot(fwd),
  };
}

/* ---------------- raster ---------------- */
const KEY = new THREE.Vector3(0.46, 0.76, 0.46).normalize();
const FILL = new THREE.Vector3(-0.74, 0.38, -0.55).normalize();

function render(cam: Cam, W: number, H: number, uMin: number, uSpan: number, vMin: number, vSpan: number, bg: [number, number, number]) {
  const rgb = new Uint8Array(W * H * 3);
  const depth = new Float32Array(W * H).fill(Infinity);
  for (let i = 0; i < W * H; i++) {
    rgb[i * 3] = Math.round(bg[0] * 255);
    rgb[i * 3 + 1] = Math.round(bg[1] * 255);
    rgb[i * 3 + 2] = Math.round(bg[2] * 255);
  }
  const sx = (u: number) => ((u - uMin) / uSpan) * W;
  const sy = (v: number) => (1 - (v - vMin) / vSpan) * H;

  /* ACES-ish tone map + sRGB encode (three.js keeps colours linear) */
  const tone = (x: number) => {
    const v = x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14);
    return Math.min(1, Math.max(0, v));
  };
  const enc = (x: number) => (x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  const HV = new THREE.Vector3().addVectors(KEY, FILL).normalize();
  const shade = (t: Tri, n: THREE.Vector3) => {
    const lam = Math.max(0, n.dot(KEY)) * 1.05 + Math.max(0, n.dot(FILL)) * 0.4;
    const k = 0.12 + lam;
    const spec = Math.pow(Math.max(0, n.dot(HV)), 30) * 0.5;
    return [0, 1, 2].map((i) => enc(tone(t.col[i] * k + t.emissive[i] + spec))) as [number, number, number];
  };

  const DBG = process.env.DEBUGPX ? process.env.DEBUGPX.split(",").map(Number) : null;
  /* opaque pass */
  for (const t of tris) {
    if (t.alpha < 0.999) continue;
    const p = [t.a, t.b, t.c].map((w) => [sx(cam.u(w)), sy(cam.v(w)), cam.d(w)] as [number, number, number]);
    const minX = Math.max(0, Math.floor(Math.min(p[0][0], p[1][0], p[2][0])));
    const maxX = Math.min(W - 1, Math.ceil(Math.max(p[0][0], p[1][0], p[2][0])));
    const minY = Math.max(0, Math.floor(Math.min(p[0][1], p[1][1], p[2][1])));
    const maxY = Math.min(H - 1, Math.ceil(Math.max(p[0][1], p[1][1], p[2][1])));
    if (maxX < minX || maxY < minY) continue;
    const [ax, ay] = [p[0][0], p[0][1]];
    const [bx, by] = [p[1][0], p[1][1]];
    const [cx, cy] = [p[2][0], p[2][1]];
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) continue;
    const sh = shade(t, t.n);
    const r = Math.round(sh[0] * 255);
    const gg = Math.round(sh[1] * 255);
    const bb = Math.round(sh[2] * 255);
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / area;
        const w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / area;
        if (w0 < 0 || w1 < 0 || w0 + w1 > 1) continue;
        const w2 = 1 - w0 - w1;
        const z = w2 * p[0][2] + w1 * p[1][2] + w0 * p[2][2];
        const i = y * W + x;
        if (DBG && x === DBG[0] && y === DBG[1])
          console.log(`  opaque hit z=${z.toFixed(3)} col=${t.col.map((v) => v.toFixed(3)).join(",")} -> ${r},${gg},${bb}`);
        if (z >= depth[i]) continue;
        depth[i] = z;
        rgb[i * 3] = r;
        rgb[i * 3 + 1] = gg;
        rgb[i * 3 + 2] = bb;
      }
  }
  /* transparent pass (glass): nearest layer only, then blend once */
  const tDepth = new Float32Array(W * H).fill(Infinity);
  const tCol = new Float32Array(W * H * 3);
  const tAlpha = new Float32Array(W * H);
  for (const t of tris) {
    if (t.alpha >= 0.999) continue;
    const p = [t.a, t.b, t.c].map((w) => [sx(cam.u(w)), sy(cam.v(w)), cam.d(w)] as [number, number, number]);
    const minX = Math.max(0, Math.floor(Math.min(p[0][0], p[1][0], p[2][0])));
    const maxX = Math.min(W - 1, Math.ceil(Math.max(p[0][0], p[1][0], p[2][0])));
    const minY = Math.max(0, Math.floor(Math.min(p[0][1], p[1][1], p[2][1])));
    const maxY = Math.min(H - 1, Math.ceil(Math.max(p[0][1], p[1][1], p[2][1])));
    if (maxX < minX || maxY < minY) continue;
    const [ax, ay] = [p[0][0], p[0][1]];
    const [bx, by] = [p[1][0], p[1][1]];
    const [cx, cy] = [p[2][0], p[2][1]];
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) continue;
    const sh = shade(t, t.n);
    const al = t.alpha * 0.85;
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / area;
        const w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / area;
        if (w0 < 0 || w1 < 0 || w0 + w1 > 1) continue;
        const w2 = 1 - w0 - w1;
        const z = w2 * p[0][2] + w1 * p[1][2] + w0 * p[2][2];
        const i = y * W + x;
        if (DBG && x === DBG[0] && y === DBG[1])
          console.log(`  glass hit z=${z.toFixed(3)} a=${al.toFixed(2)} col=${t.col.map((v) => v.toFixed(4)).join(",")} sh=${sh.map((v) => v.toFixed(3)).join(",")} behind=${depth[i].toFixed(2)}`);
        if (z >= depth[i] || z >= tDepth[i]) continue;
        tDepth[i] = z;
        tAlpha[i] = al;
        tCol[i * 3] = sh[0];
        tCol[i * 3 + 1] = sh[1];
        tCol[i * 3 + 2] = sh[2];
      }
  }
  for (let i = 0; i < W * H; i++) {
    if (tAlpha[i] <= 0) continue;
    const a = tAlpha[i];
    rgb[i * 3] = Math.round(rgb[i * 3] * (1 - a) + tCol[i * 3] * 255 * a);
    rgb[i * 3 + 1] = Math.round(rgb[i * 3 + 1] * (1 - a) + tCol[i * 3 + 1] * 255 * a);
    rgb[i * 3 + 2] = Math.round(rgb[i * 3 + 2] * (1 - a) + tCol[i * 3 + 2] * 255 * a);
  }
  return rgb;
}

/* ---------------- main ---------------- */
const mode = process.argv[2] ?? "side";
const out = path.resolve(process.argv[3] ?? `out-${mode}.png`);
const ppm = parseFloat(process.argv[4] ?? "300");
let W = 0;
let H = 0;
let cam: Cam;
let uMin = 0;
let uSpan = 0;
const vMin = -0.34;
const vSpan = 2.3;
if (mode === "side") {
  cam = ortho(1, "x");
  uSpan = 5.3;
  uMin = -uSpan / 2;
  W = Math.round(uSpan * ppm);
  H = Math.round(vSpan * ppm);
} else if (mode === "front") {
  cam = ortho(1, "z");
  uSpan = 2.7;
  uMin = -uSpan / 2;
  W = Math.round(uSpan * ppm);
  H = Math.round(vSpan * ppm);
} else if (mode === "cabin") {
  /* the sandbox "Cabin" preset: through the windscreen at the dash */
  cam = persp(32.5, 13.5, new THREE.Vector3(0.15, 1.12, 0.35));
  uSpan = parseFloat(process.argv[5] ?? "3.0");
  uMin = -uSpan / 2;
  W = Math.round(uSpan * ppm);
  H = Math.round(vSpan * ppm);
} else {
  cam = persp(parseFloat(process.argv[5] ?? "34"), parseFloat(process.argv[6] ?? "13"));
  uSpan = 5.6;
  uMin = -uSpan / 2;
  W = Math.round(uSpan * ppm);
  H = Math.round(vSpan * ppm);
}
const bg: [number, number, number] = [0.055, 0.062, 0.07];
const bg8 = bg.map((v) => Math.round(v * 255));
const rgb = render(cam, W, H, uMin, uSpan, vMin, vSpan, bg);
/* studio backdrop: vertical gradient + soft contact shadow ellipse */
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (rgb[i] !== bg8[0] || rgb[i + 1] !== bg8[1] || rgb[i + 2] !== bg8[2]) continue; // only background pixels
    const u = uMin + ((x + 0.5) / W) * uSpan;
    const v = vMin + (1 - (y + 0.5) / H) * vSpan;
    const gy = Math.min(1, Math.max(0, (1.9 - v) / 2.3));
    let r = bg[0] + 0.09 * (1 - gy);
    let g = bg[1] + 0.09 * (1 - gy);
    let b = bg[2] + 0.11 * (1 - gy);
    if (v < 0.03) {
      const q = Math.pow(u / 2.62, 2) + Math.pow(v / 0.3, 2);
      const sh = q < 1 ? Math.pow(1 - q, 0.6) * 0.72 : 0;
      r *= 1 - sh;
      g *= 1 - sh;
      b *= 1 - sh;
    }
    rgb[i] = Math.round(r * 255);
    rgb[i + 1] = Math.round(g * 255);
    rgb[i + 2] = Math.round(b * 255);
  }
writePng(out, W, H, rgb);
console.log(`${mode} → ${out}  ${W}×${H}`);
if (process.env.ASCII === "1") {
  const cols = 118;
  const rows = Math.round((cols * H) / W / 2.1);
  const ramp = " .:-=+*#%@";
  let s = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = Math.floor(((c + 0.5) / cols) * W);
      const y = Math.floor(((r + 0.5) / rows) * H);
      const i = (y * W + x) * 3;
      const lum = (rgb[i] * 0.3 + rgb[i + 1] * 0.59 + rgb[i + 2] * 0.11) / 255;
      s += ramp[Math.min(9, Math.max(0, Math.round(lum * 9)))];
    }
    s += "\n";
  }
  console.log(s);
}
