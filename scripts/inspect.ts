/* ------------------------------------------------------------------
   Text rasterizer + geometry auditor for the procedural Jetour T1.
   Renders buildJetourT1() straight into the terminal (ASCII) so the
   model can be inspected without a GPU / without opening a browser.

   Usage:
     npx tsx scripts/inspect.ts view <azimDeg> <elevDeg> [dist] [targetY] [cols]
     npx tsx scripts/inspect.ts audit
   ------------------------------------------------------------------ */

import * as THREE from "three";
import { buildJetourT1 } from "../components/scene/JetourT1";

const RAMP = " .:-=+*oO#%@";

type Opts = {
  azim: number;
  elev: number;
  dist: number;
  target: THREE.Vector3;
  cols: number;
  mode: "shade" | "mat" | "both";
  fov: number;
};

function buildScene() {
  const { group } = buildJetourT1({ textures: false, merge: process.env.NOMERGE !== "1" });
  group.updateMatrixWorld(true);
  return group;
}

/* material -> single-char code (for "mat" mode) */
function matCode(mat: THREE.Material): string {
  const n = (mat.name || "").toLowerCase();
  const ei = (mat as THREE.MeshStandardMaterial).emissiveIntensity ?? 0;
  if (n === "paint") return "P";
  if (n.includes("glass")) return "G";
  if (n.includes("tire")) return "T";
  if (n === "silver" || n === "chrome" || n === "alu") return "S";
  if (n === "disc" || n === "metal-dark" || n === "caliper") return "M";
  if (n.includes("leather")) return "L";
  if (n === "cabin-plastic" || n === "headliner" || n === "carpet") return "I";
  if (n === "crystal" || n === "piano-black") return "C";
  if (ei > 1.0 || n.includes("lamp") || n === "drl" || n === "amber" || n === "indicator" || n === "beam" || n === "dome-light" || n === "ambient-light") return "*";
  if (n.includes("plastic") || n === "trim-gloss-black" || n === "cladding" || n === "seam" || n === "rubber" || n === "intake-mesh" || n === "liner") return "B";
  return "?";
}

function render(group: THREE.Group, o: Opts): string {
  const rows = Math.max(8, Math.round((o.cols * 0.5) / 1.0));
  const aspect = o.cols / rows / 2; // char cell is ~2x tall
  const camera = new THREE.PerspectiveCamera(o.fov, aspect, 0.05, 200);
  const a = (o.azim * Math.PI) / 180;
  const e = (o.elev * Math.PI) / 180;
  camera.position.set(
    o.target.x + Math.sin(a) * Math.cos(e) * o.dist,
    o.target.y + Math.sin(e) * o.dist,
    o.target.z + Math.cos(a) * Math.cos(e) * o.dist
  );
  camera.lookAt(o.target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  const W = o.cols;
  const H = rows;
  const depth = new Float32Array(W * H).fill(Infinity);
  const shade = new Float32Array(W * H).fill(-1);
  const codes = new Array<string>(W * H).fill(" ");

  const sun = new THREE.Vector3(0.6, 0.8, 0.5).normalize();
  const fill = new THREE.Vector3(-0.7, 0.35, -0.4).normalize();

  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
  const pa = new THREE.Vector4(), pb = new THREE.Vector4(), pc = new THREE.Vector4();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nrm = new THREE.Vector3();

  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const posAttr = geo.getAttribute("position");
    if (!posAttr) return;
    const index = geo.getIndex();
    const m = mesh.matrixWorld;
    const base = new THREE.Color(mat.color ?? "#888");
    const emis = new THREE.Color((mat as unknown as { emissive?: THREE.Color }).emissive ?? "#000");
    const ei = (mat as unknown as { emissiveIntensity?: number }).emissiveIntensity ?? 0;
    const code = matCode(mat);
    const lum0 = 0.2126 * base.r + 0.7152 * base.g + 0.0722 * base.b;
    const count = index ? index.count : posAttr.count;

    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      va.fromBufferAttribute(posAttr, ia).applyMatrix4(m);
      vb.fromBufferAttribute(posAttr, ib).applyMatrix4(m);
      vc.fromBufferAttribute(posAttr, ic).applyMatrix4(m);
      e1.copy(vb).sub(va);
      e2.copy(vc).sub(va);
      nrm.copy(e1).cross(e2);
      if (nrm.lengthSq() === 0) continue;
      nrm.normalize();

      pa.set(va.x, va.y, va.z, 1).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      pb.set(vb.x, vb.y, vb.z, 1).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      pc.set(vc.x, vc.y, vc.z, 1).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      if (pa.w <= 0 || pb.w <= 0 || pc.w <= 0) continue;
      const ax = (pa.x / pa.w * 0.5 + 0.5) * W, ay = (1 - (pa.y / pa.w * 0.5 + 0.5)) * H;
      const bx = (pb.x / pb.w * 0.5 + 0.5) * W, by = (1 - (pb.y / pb.w * 0.5 + 0.5)) * H;
      const cx = (pc.x / pc.w * 0.5 + 0.5) * W, cy = (1 - (pc.y / pc.w * 0.5 + 0.5)) * H;
      const dw = [pa.w, pb.w, pc.w];

      const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
      const maxX = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
      const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
      const maxY = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
      if (maxX < minX || maxY < minY) continue;

      const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
      if (Math.abs(area) < 1e-9) continue;

      const diff = Math.max(0, nrm.dot(sun)) * 1.0 + Math.max(0, nrm.dot(fill)) * 0.3;
      let v = Math.pow(lum0, 0.85) * (0.12 + 1.05 * diff);
      if (ei > 0) v = Math.min(1, v + Math.min(1, ei * 0.3) * (emis.r + emis.g + emis.b) / 3);
      v = Math.max(0.04, Math.min(1, v));
      const codeLum = lum0 * (0.35 + diff) * 0.9;

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / area;
          const w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < -0.002 || w1 < -0.002 || w2 < -0.002) continue;
          const z = w2 * dw[0] + w1 * dw[1] + w0 * dw[2];
          const idx = y * W + x;
          if (z < depth[idx]) {
            depth[idx] = z;
            shade[idx] = o.mode === "mat" ? codeLum : v;
            codes[idx] = code;
          }
        }
      }
    }
  });

  let out = "";
  for (let y = 0; y < H; y++) {
    let line = "";
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (depth[idx] === Infinity) line += " ";
      else if (o.mode === "mat") line += codes[idx];
      else line += RAMP[Math.min(RAMP.length - 1, Math.max(0, Math.round(shade[idx] * (RAMP.length - 1))))];
    }
    out += line.replace(/\s+$/, "") + "\n";
  }
  return out;
}

function audit(group: THREE.Group) {
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  let meshes = 0, tris = 0;
  const mats = new Set<string>();
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    meshes++;
    const g = m.geometry as THREE.BufferGeometry;
    const idx = g.getIndex();
    tris += ((idx ? idx.count : g.getAttribute("position")?.count ?? 0) / 3) | 0;
    const mm = m.material as THREE.Material[];
    (Array.isArray(mm) ? mm : [mm]).forEach((x) => mats.add(x.name || "(unnamed)"));
  });
  console.log("── AUDIT ─────────────────────────────────");
  console.log(`bbox        L ${size.z.toFixed(3)}  W ${size.x.toFixed(3)}  H ${size.y.toFixed(3)}`);
  console.log(`y range     ${box.min.y.toFixed(3)} .. ${box.max.y.toFixed(3)}`);
  console.log(`z range     ${box.min.z.toFixed(3)} .. ${box.max.z.toFixed(3)}`);
  console.log(`x range     ${box.min.x.toFixed(3)} .. ${box.max.x.toFixed(3)}`);
  console.log(`meshes ${meshes}   triangles ${tris}   materials ${mats.size}`);
  console.log("materials:", [...mats].join(", "));

  /* symmetry: compare mesh centroids across x=0 */
  const cents: { x: number; y: number; z: number }[] = [];
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const c = new THREE.Vector3();
    new THREE.Box3().setFromObject(m).getCenter(c);
    cents.push({ x: +c.x.toFixed(3), y: +c.y.toFixed(3), z: +c.z.toFixed(3) });
  });
  const names: string[] = [];
  const objs: THREE.Mesh[] = [];
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) { objs.push(o as THREE.Mesh); names.push((((o as THREE.Mesh).material as THREE.Material)?.name) || "?"); } });
  let mirrored = 0, onAxis = 0, off = 0;
  const unpaired: string[] = [];
  for (let i = 0; i < cents.length; i++) {
    const c = cents[i];
    if (Math.abs(c.x) < 0.02) { onAxis++; continue; }
    const hit = cents.some((d) => Math.abs(d.x + c.x) < 0.03 && Math.abs(d.y - c.y) < 0.06 && Math.abs(d.z - c.z) < 0.06);
    if (hit) mirrored++;
    else { off++; unpaired.push(`    ${names[i].padEnd(16)} x=${c.x.toFixed(3)} y=${c.y.toFixed(3)} z=${c.z.toFixed(3)}`); }
  }
  console.log(`symmetry    mirrored ${mirrored} · on-axis ${onAxis} · unpaired ${off}`);
  if (off) console.log(unpaired.join("\n"));
  console.log("──────────────────────────────────────────");
}

function extremes(group: THREE.Group) {
  const items: { name: string; box: THREE.Box3 }[] = [];
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    items.push({
      name: `${(m.material as THREE.Material).name || "?"}@${m.position.toArray().map((v) => v.toFixed(2)).join(",")}`,
      box: new THREE.Box3().setFromObject(m),
    });
  });
  const show = (
    label: string,
    pick: (a: { name: string; box: THREE.Box3 }, b: { name: string; box: THREE.Box3 }) => boolean,
    val: (b: THREE.Box3) => number,
  ) => {
    const sorted = [...items].sort((a, b) => (pick(b, a) ? 1 : -1)).slice(0, 3);
    for (const it of sorted) console.log(`${label.padEnd(6)} ${val(it.box).toFixed(3)}  <- ${it.name}`);
  };
  show("maxZ", (a, b) => a.box.max.z > b.box.max.z, (b) => b.max.z);
  show("minZ", (a, b) => a.box.min.z < b.box.min.z, (b) => b.min.z);
  show("maxX", (a, b) => a.box.max.x > b.box.max.x, (b) => b.max.x);
  show("minX", (a, b) => a.box.min.x < b.box.min.x, (b) => b.min.x);
  show("maxY", (a, b) => a.box.max.y > b.box.max.y, (b) => b.max.y);
  show("minY", (a, b) => a.box.min.y < b.box.min.y, (b) => b.min.y);
}


/* ── orthographic blueprint elevations (with rulers) ── */
function elevation(group: THREE.Group, mode: "side" | "front" | "plan", cols: number, rows: number, filter = "") {
  let cam: THREE.OrthographicCamera;
  if (mode === "side") {
    const halfW = 2.62, halfH = 1.08;
    cam = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, -10, 10);
    cam.position.set(10, 0.9, 0);
    cam.lookAt(0, 0.9, 0);
  } else if (mode === "front") {
    cam = new THREE.OrthographicCamera(-1.25, 1.25, 1.08, -1.08, -10, 10);
    cam.position.set(0, 0.9, 10);
    cam.lookAt(0, 0.9, 0);
  } else {
    cam = new THREE.OrthographicCamera(-1.25, 1.25, 2.62, -2.62, -10, 10);
    cam.position.set(0, 10, 0);
    cam.lookAt(0, 0, 0);
    cam.up.set(0, 0, -1);
  }
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();

  const W = cols, H = rows;
  const depth = new Float32Array(W * H).fill(Infinity);
  const codes = new Array<string>(W * H).fill(" ");
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
  const pa = new THREE.Vector4(), pb = new THREE.Vector4(), pc = new THREE.Vector4();

  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    const mat = mesh.material as THREE.Material;
    const posAttr = geo.getAttribute("position");
    if (!posAttr) return;
    const index = geo.getIndex();
    const m = mesh.matrixWorld;
    const code = matCode(mat);
    const count = index ? index.count : posAttr.count;
    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      va.fromBufferAttribute(posAttr, ia).applyMatrix4(m);
      vb.fromBufferAttribute(posAttr, ib).applyMatrix4(m);
      vc.fromBufferAttribute(posAttr, ic).applyMatrix4(m);
      const pj = (p: THREE.Vector3, out: THREE.Vector4) => {
        out.set(p.x, p.y, p.z, 1).applyMatrix4(cam.matrixWorldInverse).applyMatrix4(cam.projectionMatrix);
        return out;
      };
      pj(va, pa); pj(vb, pb); pj(vc, pc);
      const ax = (pa.x * 0.5 + 0.5) * W, ay = (1 - (pa.y * 0.5 + 0.5)) * H;
      const bx = (pb.x * 0.5 + 0.5) * W, by = (1 - (pb.y * 0.5 + 0.5)) * H;
      const cx = (pc.x * 0.5 + 0.5) * W, cy = (1 - (pc.y * 0.5 + 0.5)) * H;
      const dz = [pa.z, pb.z, pc.z];
      const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
      const maxX = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
      const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
      const maxY = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
      const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
      if (Math.abs(area) < 1e-9) continue;
      for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / area;
          const w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < -0.002 || w1 < -0.002 || w2 < -0.002) continue;
          const z = w2 * dz[0] + w1 * dz[1] + w0 * dz[2];
          const idx = y * W + x;
          if (z < depth[idx]) { depth[idx] = z; codes[idx] = filter && !filter.includes(code) ? " " : code; }
        }
    }
  });

  const lines: string[] = [];
  for (let y = 0; y < H; y++) {
    let line = "";
    for (let x = 0; x < W; x++) line += codes[y * W + x];
    lines.push(line.replace(/\s+$/, ""));
  }
  /* horizontal ruler (z for side/plan, x for front) */
  const span = mode === "front" ? 2.5 : 5.24;
  const zero = mode === "front" ? 1.25 : 2.62;
  let ruler = "";
  for (let x = 0; x < W; x++) {
    const world = (mode === "front" ? 1 : -1) * (((x + 0.5) / W) * span - zero);
    const tick = Math.abs(world % 0.5) < span / W;
    ruler += tick ? "|" : " ";
  }
  let labels = "";
  for (let x = 0; x < W; x += 10) {
    const world = (mode === "front" ? 1 : -1) * (((x + 0.5) / W) * span - zero);
    labels += world.toFixed(1).padEnd(10, " ").slice(0, 10);
  }
  console.log(`# ${mode} elevation  (P paint · G glass · B black trim · S bright · T tyre · I interior · * lamps · ? other)`);
  lines.forEach((l, i) => {
    const wy = mode === "plan" ? 2.62 - ((i + 0.5) / H) * 5.24 : 1.98 - ((i + 0.5) / H) * 2.16;
    console.log(`${wy.toFixed(2).padStart(5)} |${l}`);
  });
  console.log(`      +${"-".repeat(W)}`);
  console.log(`       ${ruler}`);
  console.log(`       ${labels}`);
}


/* ── ray probe grid: first surface hit looking along -X (side view) ── */
function probe(group: THREE.Group, axis: "x" | "z" | "y", z0: number, z1: number, dz: number, y0: number, y1: number, dy: number) {
  const rc = new THREE.Raycaster();
  const dir = axis === "x" ? new THREE.Vector3(-1, 0, 0) : axis === "z" ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, -1, 0);
  const meshes: THREE.Mesh[] = [];
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  group.updateMatrixWorld(true);

  const hit = (px: number, py: number, pz: number) => {
    const origin = axis === "x" ? new THREE.Vector3(6, py, pz) : axis === "z" ? new THREE.Vector3(px, py, 6) : new THREE.Vector3(px, 6, pz);
    rc.set(origin, dir);
    let best = Infinity;
    let code = ".";
    const target = new THREE.Vector3();
    for (const m of meshes) {
      m.geometry.computeBoundingSphere();
      const bs = m.geometry.boundingSphere;
      if (!bs) continue;
      const c = bs.center.clone().applyMatrix4(m.matrixWorld);
      if (rc.ray.distanceSqToPoint(c) > (bs.radius + 0.02) * (bs.radius + 0.02)) continue;
      const hits = rc.intersectObject(m, false);
      if (hits.length && hits[0].distance < best) { best = hits[0].distance; code = matCode(m.material as THREE.Material); }
    }
    return code;
  };

  const zs: number[] = [];
  for (let z = z0; z >= z1 - 1e-9; z -= dz) zs.push(+z.toFixed(3));
  const ys: number[] = [];
  for (let y = y1; y >= y0 - 1e-9; y -= dy) ys.push(+y.toFixed(3));

  const hAxis = axis === "x" ? "z" : axis === "z" ? "x" : "x";
  console.log(`# probe along ${axis.toUpperCase()}  ·  columns = ${hAxis}  ·  P paint G glass B black S bright T tyre I interior * lamp ? other`);
  console.log("      " + zs.map((z) => (Math.abs(z) < 0.05 ? " 0" : z.toFixed(1).replace("-", "-").replace("0.", "."))).map((t) => t.padStart(4)).join(""));
  for (const y of ys) {
    let line = "";
    for (const z of zs) {
      const p = axis === "x" ? [0, y, z] : axis === "z" ? [z, y, 0] : [z, 0, y];
      line += hit(p[0], p[1], p[2]).padStart(4);
    }
    console.log(`${y.toFixed(2).padStart(5)} ${line}`);
  }
}

/* ── single ray: list every hit with material name ── */
function probe1(group: THREE.Group, axis: string, a: number, b: number) {
  const rc = new THREE.Raycaster();
  const dir = axis === "x" ? new THREE.Vector3(-1, 0, 0) : axis === "z" ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, -1, 0);
  const origin = axis === "x" ? new THREE.Vector3(6, b, a) : axis === "z" ? new THREE.Vector3(a, b, 6) : new THREE.Vector3(a, 6, b);
  rc.set(origin, dir);
  const meshes: THREE.Mesh[] = [];
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  group.updateMatrixWorld(true);
  const rows: { d: number; name: string; pos: string }[] = [];
  for (const m of meshes) {
    const hits = rc.intersectObject(m, false);
    for (const h of hits)
      rows.push({ d: h.distance, name: (m.material as THREE.Material).name || "?", pos: m.position.toArray().map((v) => v.toFixed(2)).join(",") });
  }
  rows.sort((x, y) => x.d - y.d);
  console.log(`ray along -${axis.toUpperCase()} at ${axis === "x" ? `z=${a} y=${b}` : axis === "z" ? `x=${a} y=${b}` : `x=${a} z=${b}`}`);
  rows.slice(0, 8).forEach((r) => console.log(`  d=${r.d.toFixed(3)}  ${r.name.padEnd(20)} @${r.pos}`));
  if (!rows.length) console.log("  (no hits)");
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "proj") {
    projectLandmarks({ azim: parseFloat(rest[0] ?? "90"), elev: parseFloat(rest[1] ?? "5"), dist: parseFloat(rest[2] ?? "8.4"), cols: parseInt(rest[3] ?? "190", 10), targetY: parseFloat(rest[4] ?? "0.88") });
    return;
  }
  const group = buildScene();
  if (cmd === "audit") { audit(group); return; }
  if (cmd === "extremes") { extremes(group); return; }
  if (cmd === "probe1") { probe1(group, rest[0] ?? "x", parseFloat(rest[1] ?? "0"), parseFloat(rest[2] ?? "1")); return; }
  if (cmd === "probe") {
    const axis = (rest[0] ?? "x") as "x" | "z" | "y";
    probe(group, axis, parseFloat(rest[1] ?? "2.4"), parseFloat(rest[2] ?? "-2.4"), parseFloat(rest[3] ?? "0.2"), parseFloat(rest[4] ?? "0"), parseFloat(rest[5] ?? "1.9"), parseFloat(rest[6] ?? "0.1"));
    return;
  }
  if (cmd === "side" || cmd === "front" || cmd === "plan") {
    elevation(group, cmd, parseInt(rest[0] ?? "150", 10), parseInt(rest[1] ?? "40", 10), rest[2] ?? "");
    return;
  }

  const azim = parseFloat(rest[0] ?? "32");
  const elev = parseFloat(rest[1] ?? "12");
  const dist = parseFloat(rest[2] ?? "9");
  const targetY = parseFloat(rest[3] ?? "0.85");
  const cols = parseInt(rest[4] ?? "150", 10);
  const mode = (rest[5] ?? "shade") as Opts["mode"];
  const o: Opts = {
    azim, elev, dist, target: new THREE.Vector3(0, targetY, 0),
    cols, mode, fov: 32,
  };
  console.log(`# azim ${azim}° elev ${elev}° dist ${dist} mode ${mode}`);
  console.log(render(group, o));
}

try { main(); } catch (e) { console.error(e); process.exit(1); }

/* ── helper: project known landmark points to screen columns ── */
export function projectLandmarks(o: { azim: number; elev: number; dist: number; cols: number; targetY: number }) {
  const rows = Math.round(o.cols * 0.5);
  const camera = new THREE.PerspectiveCamera(32, o.cols / rows / 2, 0.05, 200);
  const a = (o.azim * Math.PI) / 180, e = (o.elev * Math.PI) / 180;
  const t = new THREE.Vector3(0, o.targetY, 0);
  camera.position.set(t.x + Math.sin(a) * Math.cos(e) * o.dist, t.y + Math.sin(e) * o.dist, t.z + Math.cos(a) * Math.cos(e) * o.dist);
  camera.lookAt(t);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  const pts: [string, THREE.Vector3][] = [
    ["front bumper", new THREE.Vector3(0, 0.6, 2.35)],
    ["rear bumper", new THREE.Vector3(0, 0.6, -2.35)],
    ["roof front", new THREE.Vector3(0, 1.78, 0.6)],
    ["roof rear", new THREE.Vector3(0, 1.78, -1.8)],
    ["wheel FR", new THREE.Vector3(0.85, 0.38, 1.4)],
    ["wheel RR", new THREE.Vector3(0.85, 0.38, -1.4)],
  ];
  for (const [name, p] of pts) {
    const v = p.clone().project(camera);
    console.log(`${name.padEnd(14)} col ${Math.round((v.x * 0.5 + 0.5) * o.cols)}  row ${Math.round((1 - (v.y * 0.5 + 0.5)) * rows)}`);
  }
}
