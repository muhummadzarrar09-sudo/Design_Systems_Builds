"use client";

/* ===================================================================
   JETOUR T1 — 1:1 scale procedural model (website hero grade)
   Real dims (m): L 4.705 · W 1.967 · H 1.843 · WB 2.800
   clearance 0.20 · tire Ø 0.762 · track 1.695
   buildJetourT1() is pure three.js (single source of truth): the React
   component wraps it, and scripts/shot.ts rasterizes it headlessly so
   the model can be visually checked without a browser.
   +Z = front, +Y = up. LHD per press fleet.
   =================================================================== */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const L = 4.705;
const W = 1.967;
const WB = 2.8;
const TIRE_R = 0.381;
const TRACK_X = 0.8475;

type Mats = ReturnType<typeof makeMats>;

function makeMats() {
  const paint = new THREE.MeshPhysicalMaterial({
    color: "#9fb8a8",
    roughness: 0.3,
    metalness: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.15,
  });
  const plastic = new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.85, metalness: 0.1 });
  const plasticSoft = new THREE.MeshStandardMaterial({ color: "#1c1c1e", roughness: 0.7, metalness: 0.15 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#0d1418",
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0.5,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });
  const silver = new THREE.MeshStandardMaterial({ color: "#d6dadb", roughness: 0.3, metalness: 0.7, envMapIntensity: 1.3 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: "#3a3d40", roughness: 0.4, metalness: 0.9 });
  const drl = new THREE.MeshStandardMaterial({ color: "#e8f4ff", emissive: "#cfe8ff", emissiveIntensity: 3.2 });
  const tail = new THREE.MeshStandardMaterial({ color: "#400808", emissive: "#ff1820", emissiveIntensity: 2.4 });
  const amber = new THREE.MeshStandardMaterial({ color: "#5a2c08", emissive: "#ff8010", emissiveIntensity: 1.2 });
  const tire = new THREE.MeshStandardMaterial({ color: "#0c0c0c", roughness: 0.95 });
  const seam = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.6 });
  const cabin = new THREE.MeshStandardMaterial({ color: "#232527", roughness: 0.9, metalness: 0.05 });
  const leather = new THREE.MeshStandardMaterial({ color: "#79a496", roughness: 0.55, metalness: 0.02 });
  const leatherDark = new THREE.MeshStandardMaterial({ color: "#17191b", roughness: 0.6, metalness: 0.05 });
  const headliner = new THREE.MeshStandardMaterial({ color: "#3b3e41", roughness: 0.95 });
  const crystal = new THREE.MeshPhysicalMaterial({ color: "#bcd8e8", roughness: 0.05, metalness: 0, transparent: true, opacity: 0.55, envMapIntensity: 2 });
  const ambient = new THREE.MeshStandardMaterial({ color: "#0a3a32", emissive: "#39d5bb", emissiveIntensity: 2.2 });
  const dome = new THREE.MeshStandardMaterial({ color: "#403018", emissive: "#ffd9a0", emissiveIntensity: 2.0 });
  const hv = new THREE.MeshStandardMaterial({ color: "#ff6a00", roughness: 0.5 });
  return { paint, plastic, plasticSoft, glass, silver, darkMetal, drl, tail, amber, tire, seam, cabin, leather, leatherDark, headliner, crystal, ambient, dome, hv };
}

/* ---------------- canvas textures (browser only) ---------------- */

function makeLetterTexture(text: string, color = "#d8dce0", bg: string | null = null, spacing = 24) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 160;
  const ctx = c.getContext("2d")!;
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.fillStyle = color;
  ctx.font = "700 92px 'Helvetica Neue', 'Arial Black', sans-serif";
  ctx.textBaseline = "middle";
  const chars = text.split("");
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = (c.width - total) / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, c.height / 2);
    x += widths[i] + spacing;
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeScreenTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const x = c.getContext("2d")!;
  const sky = x.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, "#6ea8d8");
  sky.addColorStop(1, "#dcecf7");
  x.fillStyle = sky;
  x.fillRect(0, 0, 1024, 400);
  x.fillStyle = "#8a6a48";
  x.beginPath();
  x.moveTo(0, 400);
  x.lineTo(140, 240);
  x.lineTo(300, 380);
  x.lineTo(470, 210);
  x.lineTo(640, 380);
  x.lineTo(800, 250);
  x.lineTo(1024, 400);
  x.closePath();
  x.fill();
  x.fillStyle = "#f2f6f8";
  x.beginPath();
  x.moveTo(430, 250);
  x.lineTo(470, 210);
  x.lineTo(510, 250);
  x.closePath();
  x.fill();
  const lake = x.createLinearGradient(0, 400, 0, 552);
  lake.addColorStop(0, "#4a86b8");
  lake.addColorStop(1, "#274f7c");
  x.fillStyle = lake;
  x.fillRect(0, 400, 1024, 152);
  x.fillStyle = "rgba(16,20,24,0.92)";
  x.fillRect(0, 552, 1024, 88);
  const apps = ["#3a78d8", "#d85a3a", "#3ab878", "#8a5ad8", "#d8b83a", "#4aa8c8"];
  apps.forEach((col, i) => {
    x.fillStyle = col;
    x.fillRect(80 + i * 96, 572, 52, 52);
  });
  x.fillStyle = "rgba(240,246,250,0.9)";
  x.fillRect(700, 576, 240, 14);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeClusterTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 192;
  const x = c.getContext("2d")!;
  x.fillStyle = "#08090b";
  x.fillRect(0, 0, 512, 192);
  x.strokeStyle = "#39d5bb";
  x.lineWidth = 10;
  x.beginPath();
  x.arc(110, 96, 62, Math.PI * 0.7, Math.PI * 2.3);
  x.stroke();
  x.strokeStyle = "#4a90d8";
  x.beginPath();
  x.arc(402, 96, 62, Math.PI * 0.7, Math.PI * 2.3);
  x.stroke();
  x.fillStyle = "#e8f4ff";
  x.font = "700 64px 'Helvetica Neue', sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("30", 256, 88);
  x.font = "400 22px 'Helvetica Neue', sans-serif";
  x.fillStyle = "#9aa8b4";
  x.fillText("km/h", 256, 136);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const x = c.getContext("2d")!;
  x.fillStyle = "#26282a";
  x.fillRect(0, 0, 256, 64);
  x.fillStyle = "#0c0d0e";
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 4; j++) {
      x.beginPath();
      x.arc(8 + i * 16, 8 + j * 16, 4, 0, Math.PI * 2);
      x.fill();
    }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
}

/* ---------------- geometry helpers ---------------- */

function profileShape(pts: [number, number][]) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

type Sec = { z: number; hw: number; yt: number; b: number };

function lowerPts(sec: Sec): [number, number][] {
  const { hw, yt, b } = sec;
  const yb = 0.24;
  return [
    [-hw * 0.8, yb], [0, yb - 0.03], [hw * 0.8, yb],
    [hw, yb + 0.18], [hw + b, yt - 0.35], [hw + b * 0.6, yt - 0.08],
    [hw * 0.55, yt], [0, yt + 0.02], [-hw * 0.55, yt],
    [-hw - b * 0.6, yt - 0.08], [-hw - b, yt - 0.35], [-hw, yb + 0.18],
  ];
}

function ghPts(hw: number, yt: number): [number, number][] {
  const yb = 1.06;
  return [
    [-hw, yb + 0.05], [-hw, yt - 0.18], [-hw + 0.18, yt], [hw - 0.18, yt],
    [hw, yt - 0.18], [hw, yb + 0.05], [hw * 0.4, yb], [-hw * 0.4, yb],
  ];
}

function bridgeLoft(st: { z: number; pts: [number, number][] }[]): THREE.BufferGeometry {
  const n = st[0].pts.length;
  const pos: number[] = [];
  const idx: number[] = [];
  for (const sec of st) for (const [x, y] of sec.pts) pos.push(x, y, sec.z);
  for (let i = 0; i < st.length - 1; i++)
    for (let j = 0; j < n; j++) {
      const a = i * n + j, b = i * n + ((j + 1) % n), c = (i + 1) * n + ((j + 1) % n), d = (i + 1) * n + j;
      idx.push(a, c, b, a, d, c);
    }
  let cx = 0, cy = 0;
  for (const [x, y] of st[0].pts) { cx += x; cy += y; }
  cx /= n; cy /= n;
  pos.push(cx, cy, st[0].z);
  const cF = pos.length / 3 - 1;
  let cx2 = 0, cy2 = 0;
  for (const [x, y] of st[st.length - 1].pts) { cx2 += x; cy2 += y; }
  cx2 /= n; cy2 /= n;
  pos.push(cx2, cy2, st[st.length - 1].z);
  const cB = pos.length / 3 - 1;
  for (let j = 0; j < n; j++) {
    const j2 = (j + 1) % n;
    idx.push(cF, j, j2);
    idx.push(cB, (st.length - 1) * n + j2, (st.length - 1) * n + j);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function buildJetourT1(opts?: { textures?: boolean }) {
  const textures = opts?.textures ?? typeof document !== "undefined";
  const mats = makeMats();
  const group = new THREE.Group();

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, pos?: [number, number, number], rot?: [number, number, number]) =>
    add(new THREE.BoxGeometry(w, h, d), mat, pos, rot);
  const rbox = (w: number, h: number, d: number, r: number, mat: THREE.Material, pos?: [number, number, number], rot?: [number, number, number]) =>
    add(new RoundedBoxGeometry(w, h, d, 4, r), mat, pos, rot);
  const cyl = (rt: number, rb: number, h: number, mat: THREE.Material, pos?: [number, number, number], rot?: [number, number, number], seg = 24) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, pos, rot);
  const torus = (r: number, t: number, mat: THREE.Material, pos?: [number, number, number], rot?: [number, number, number]) =>
    add(new THREE.TorusGeometry(r, t, 12, 40), mat, pos, rot);

  /* letter / screen materials: canvas in browser, flat emissive headless */
  const jetourMat = textures
    ? new THREE.MeshStandardMaterial({ map: makeLetterTexture("JETOUR", "#e0e4e8"), transparent: true, roughness: 0.4, metalness: 0.6 })
    : new THREE.MeshStandardMaterial({ color: "#dfe3e7", roughness: 0.4 });
  const plateMat = textures
    ? new THREE.MeshStandardMaterial({ map: makeLetterTexture("T1", "#e8e8e8", "#101010", 8), roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: "#101010", roughness: 0.5 });
  const grilleMat = textures
    ? new THREE.MeshStandardMaterial({ color: "#08090a", emissive: "#ffffff", emissiveMap: makeLetterTexture("JETOUR", "#eaf2f8", "#08090a", 46), emissiveIntensity: 2.6, roughness: 0.4 })
    : new THREE.MeshStandardMaterial({ color: "#08090a", emissive: "#dfeaf2", emissiveIntensity: 1.2, roughness: 0.4 });
  const screenMat = textures
    ? new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: makeScreenTexture(), emissiveIntensity: 1.5, roughness: 0.3 })
    : new THREE.MeshStandardMaterial({ color: "#000", emissive: "#3a78d8", emissiveIntensity: 1.2 });
  const clusterMat = textures
    ? new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: makeClusterTexture(), emissiveIntensity: 1.6, roughness: 0.3 })
    : new THREE.MeshStandardMaterial({ color: "#000", emissive: "#39d5bb", emissiveIntensity: 1.2 });
  const dotMat = textures
    ? new THREE.MeshStandardMaterial({ map: makeDotTexture(), roughness: 0.8 })
    : new THREE.MeshStandardMaterial({ color: "#26282a", roughness: 0.8 });

  /* ══ BODY: lofted cross-sections + CSG arches ══ */
  const lowerStations: Sec[] = [
    { z: 2.3, hw: 0.9, yt: 1.06, b: 0 },
    { z: 2.05, hw: 0.93, yt: 1.1, b: 0.01 },
    { z: 1.7, hw: 0.96, yt: 1.12, b: 0.02 },
    { z: 1.4, hw: 0.98, yt: 1.12, b: 0.03 },
    { z: 0.9, hw: 0.95, yt: 1.14, b: 0.01 },
    { z: 0.0, hw: 0.94, yt: 1.16, b: 0 },
    { z: -0.9, hw: 0.95, yt: 1.17, b: 0.01 },
    { z: -1.4, hw: 0.98, yt: 1.17, b: 0.03 },
    { z: -1.9, hw: 0.96, yt: 1.17, b: 0.02 },
    { z: -2.3, hw: 0.92, yt: 1.16, b: 0 },
  ];
  const bodyGeo = bridgeLoft(lowerStations.map((st) => ({ z: st.z, pts: lowerPts(st) })));
  const bodyBrush = new Brush(bodyGeo, mats.paint);
  bodyBrush.updateMatrixWorld(true);
  const ev = new Evaluator();
  const cylGeo = () => {
    const g = new THREE.CylinderGeometry(0.47, 0.47, 2.6, 24);
    g.rotateZ(Math.PI / 2);
    return g;
  };
  const cutF = new Brush(cylGeo(), mats.plastic);
  cutF.position.set(0, 0.4, 1.4);
  cutF.updateMatrixWorld(true);
  const cutR = new Brush(cylGeo(), mats.plastic);
  cutR.position.set(0, 0.4, -1.4);
  cutR.updateMatrixWorld(true);
  const cut1 = ev.evaluate(bodyBrush, cutF, SUBTRACTION);
  const cut2 = ev.evaluate(cut1, cutR, SUBTRACTION);
  const bodyMesh = new THREE.Mesh(cut2.geometry, mats.paint);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  /* greenhouse: lofted glass cabin */
  const ghStations = [
    { z: 1.02, hw: 0.74, yt: 1.14 },
    { z: 0.72, hw: 0.77, yt: 1.44 },
    { z: 0.48, hw: 0.78, yt: 1.66 },
    { z: 0.0, hw: 0.8, yt: 1.73 },
    { z: -1.0, hw: 0.8, yt: 1.74 },
    { z: -1.6, hw: 0.78, yt: 1.7 },
    { z: -1.95, hw: 0.74, yt: 1.52 },
    { z: -2.18, hw: 0.7, yt: 1.14 },
  ];
  add(bridgeLoft(ghStations.map((st) => ({ z: st.z, pts: ghPts(st.hw, st.yt) }))), mats.glass);

  /* roof + pano */
  rbox(1.56, 0.07, 2.4, 0.03, mats.paint, [0, 1.745, -0.68]);
  box(1.1, 0.02, 1.5, mats.glass, [0, 1.782, -0.6]);

  /* pillars + louvers */
  for (const s of [1, -1]) {
    box(0.07, 0.72, 0.07, mats.paint, [s * 0.82, 1.4, 0.78], [-0.8, 0, 0]);
    box(0.03, 0.5, 0.09, mats.seam, [s * 0.84, 1.4, -0.12]);
    box(0.07, 0.62, 0.07, mats.paint, [s * 0.8, 1.42, -1.9], [0.8, 0, 0]);
    for (let i = 0; i < 4; i++) box(0.02, 0.03, 0.3, mats.plasticSoft, [s * 0.8, 1.52 - i * 0.065, -1.52], [0.5, 0, 0]);
  }

  /* beltline + shoulder crease + door sculpt + seams */
  for (const s of [1, -1]) {
    box(0.015, 0.035, 4.3, mats.seam, [s * 0.952, 1.165, 0]);
  }
  for (const z of [0.88, -0.02, -0.92]) for (const s of [1, -1]) box(0.012, 0.82, 0.008, mats.seam, [s * 0.947, 0.72, z]);

  /* arch cladding */
  const arch = profileShape([
    [-0.68, 0.18], [-0.64, 0.6], [-0.42, 0.88], [0.42, 0.88], [0.64, 0.6], [0.68, 0.18],
    [0.52, 0.18], [0.48, 0.54], [0.36, 0.78], [-0.36, 0.78], [-0.48, 0.54], [-0.52, 0.18],
  ]);
  const archGeo = new THREE.ExtrudeGeometry(arch, { depth: 0.12, bevelEnabled: false });
  archGeo.rotateY(-Math.PI / 2);
  for (const z of [WB / 2, -WB / 2]) {
    add(archGeo, mats.plastic, [1.03, 0, z]);
    add(archGeo, mats.plastic, [-0.91, 0, z]);
  }

  /* rockers + steps */
  for (const s of [1, -1]) {
    box(0.09, 0.2, 2.4, mats.plastic, [s * 0.955, 0.36, -0.1]);
    box(0.18, 0.05, 2.1, mats.plasticSoft, [s * 0.93, 0.28, -0.1]);
  }

  /* ══ FRONT END ══ */
  box(1.72, 0.28, 0.05, mats.plastic, [0, 0.92, 2.29]);
  add(new THREE.PlaneGeometry(1.12, 0.18), grilleMat, [0, 0.92, 2.322]);
  for (const s of [1, -1]) {
    box(0.36, 0.28, 0.06, mats.plasticSoft, [s * 0.8, 0.92, 2.3]);
    for (const [dx, dy] of [[0.075, 0.06], [-0.075, 0.06], [0.075, -0.06], [-0.075, -0.06], [0, 0]])
      box(0.055, 0.055, 0.02, mats.drl, [s * 0.8 + dx, 0.92 + dy, 2.335]);
  }
  box(1.5, 0.06, 0.05, mats.paint, [0, 0.78, 2.3]);
  box(1.4, 0.06, 0.05, mats.plastic, [0, 0.71, 2.31]);
  rbox(W + 0.01, 0.4, 0.3, 0.06, mats.plastic, [0, 0.42, 2.2]);
  for (const s of [1, -1]) {
    rbox(0.16, 0.52, 0.55, 0.04, mats.plastic, [s * 0.92, 0.52, 2.08]);
    box(0.12, 0.05, 0.02, mats.drl, [s * 0.78, 0.52, 2.355]);
    for (let i = 0; i < 3; i++) box(0.018, 0.26, 0.02, mats.plasticSoft, [s * (0.86 + i * 0.045), 0.5, 2.345]);
  }
  add(new THREE.PlaneGeometry(1.2, 0.16), dotMat, [0, 0.3, 2.357]);
  box(1.2, 0.16, 0.06, mats.plasticSoft, [0, 0.3, 2.32]);
  box(1.4, 0.08, 0.22, mats.darkMetal, [0, 0.21, 2.26]);
  for (const s of [1, -1]) box(0.14, 0.06, 0.02, mats.amber, [s * 0.62, 0.44, 2.36]);
  add(new THREE.PlaneGeometry(0.48, 0.16), plateMat, [0, 0.52, 2.37]);
  box(0.12, 0.015, 0.06, mats.silver, [0, 1.105, 2.05]);
  for (const s of [1, -1]) box(0.05, 0.02, 1.1, mats.paint, [s * 0.38, 1.115, 1.5], [0, 0, s * 0.05]);
  box(0.5, 0.015, 0.03, mats.plastic, [-0.28, 1.15, 0.94], [0, 0.5, 0]);
  box(0.45, 0.015, 0.03, mats.plastic, [0.3, 1.15, 0.96], [0, 0.35, 0]);

  /* ══ REAR END ══ */
  box(1.6, 0.55, 0.05, mats.plasticSoft, [0, 0.8, -2.315]);
  box(W - 0.2, 0.3, 0.06, mats.paint, [0, 1.16, -2.31]);
  add(new THREE.PlaneGeometry(1.3, 0.2), jetourMat, [0, 1.16, -2.345]);
  for (const s of [1, -1]) {
    box(0.34, 0.28, 0.05, mats.plasticSoft, [s * 0.8, 1.2, -2.32]);
    for (const [dx, dy] of [[0.08, 0.06], [-0.08, 0.06], [0.08, -0.06], [-0.08, -0.06]])
      box(0.05, 0.05, 0.02, mats.tail, [s * 0.8 + dx, 1.2 + dy, -2.35]);
  }
  box(W - 0.3, 0.09, 0.34, mats.plastic, [0, 1.72, -1.78]);
  box(0.7, 0.025, 0.02, mats.tail, [0, 1.7, -1.95]);
  rbox(W + 0.01, 0.42, 0.3, 0.06, mats.plastic, [0, 0.42, -2.2]);
  for (const s of [1, -1]) box(0.16, 0.05, 0.02, mats.tail, [s * 0.7, 0.42, -2.36]);
  add(new THREE.PlaneGeometry(0.48, 0.16), plateMat, [0, 0.82, -2.34], [0, Math.PI, 0]);

  /* ══ SIDES ══ */
  for (const [z, s] of [[0.12, 1], [0.12, -1], [-0.78, 1], [-0.78, -1]])
    box(0.03, 0.045, 0.22, mats.paint, [s * 0.955, 1.1, z]);
  for (const s of [1, -1]) {
    box(0.12, 0.04, 0.06, mats.plastic, [s * 1.04 - s * 0.06, 1.22, 0.86]);
    rbox(0.06, 0.13, 0.22, 0.02, mats.paint, [s * 1.04, 1.26, 0.86]);
    box(0.006, 0.015, 0.08, mats.drl, [s * 1.04 + s * 0.032, 1.26, 0.92]);
    box(0.015, 0.2, 0.24, mats.paint, [0.952, 1.12, -1.75]);
  }

  /* ══ ROOF FURNITURE ══ */
  for (const s of [1, -1]) {
    box(0.05, 0.05, 1.8, mats.plastic, [s * 0.74, 1.8, -0.5]);
    for (const z of [0.35, -1.35]) box(0.05, 0.04, 0.12, mats.plastic, [s * 0.74, 1.775, z]);
  }
  box(0.03, 0.08, 0.16, mats.plastic, [0, 1.81, -1.62]);
  box(W - 0.35, 0.12, L - 0.9, mats.plastic, [0, 0.28, 0]);

  /* ══ INTERIOR ══ */
  box(1.7, 0.06, 3.5, mats.cabin, [0, 0.36, -0.4]);
  box(1.5, 0.04, 2.9, mats.headliner, [0, 1.66, -0.55]);
  rbox(1.62, 0.3, 0.55, 0.05, mats.cabin, [0, 1.0, 0.82], [-0.12, 0, 0]);
  box(0.66, 0.14, 0.04, mats.leather, [0.38, 1.06, 0.6], [-0.12, 0, 0]);
  cyl(0.015, 0.015, 0.5, mats.silver, [0.38, 0.98, 0.62], [0, 0, Math.PI / 2], 12);
  box(0.36, 0.14, 0.02, clusterMat, [-0.42, 1.12, 0.66], [-0.15, 0, 0]);
  box(0.42, 0.26, 0.02, screenMat, [0, 1.13, 0.5], [-0.12, 0, 0]);
  for (const s of [1, -1]) box(0.06, 0.18, 0.05, mats.darkMetal, [s * 0.78, 1.08, 0.72], [-0.12, 0, 0]);
  for (const s of [1, -1]) box(0.17, 0.06, 0.04, mats.darkMetal, [s * 0.12, 0.9, 0.6]);
  for (const x of [-0.15, -0.09, -0.03, 0.03, 0.09, 0.15]) box(0.035, 0.022, 0.02, mats.silver, [x, 0.96, 0.6]);
  box(1.5, 0.012, 0.012, mats.ambient, [0, 0.94, 0.66]);

  /* steering wheel */
  const sw = new THREE.Group();
  sw.position.set(-0.42, 1.04, 0.68);
  sw.rotation.set(-0.5, 0, 0);
  const swRim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 12, 40), mats.leatherDark);
  sw.add(swRim);
  for (const a of [0, 2.1, -2.1]) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.025), mats.silver);
    sp.position.set(Math.sin(a) * 0.1, Math.cos(a) * 0.1, 0);
    sp.rotation.set(0, 0, -a);
    sw.add(sp);
  }
  const swHub = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.03), mats.leatherDark);
  sw.add(swHub);
  group.add(sw);
  cyl(0.035, 0.035, 0.25, mats.cabin, [-0.42, 1.0, 0.78], [1.1, 0, 0], 12);

  /* console */
  rbox(0.34, 0.24, 0.95, 0.04, mats.cabin, [0, 0.6, 0.05]);
  box(0.06, 0.09, 0.06, mats.crystal, [0, 0.76, 0.28]);
  cyl(0.045, 0.05, 0.03, mats.silver, [0, 0.72, 0.28], [0, 0, 0], 16);
  cyl(0.05, 0.05, 0.025, mats.silver, [0, 0.73, 0.05], [0, 0, 0], 20);
  for (const s of [1, -1]) cyl(0.045, 0.04, 0.02, mats.leatherDark, [s * 0.09, 0.725, -0.15], [0, 0, 0], 16);
  rbox(0.3, 0.1, 0.42, 0.04, mats.leather, [0, 0.74, -0.42]);

  /* seats */
  const seat = (px: number, pz: number, wide: boolean) => {
    const w = wide ? 1.42 : 0.52;
    box(w - 0.04, 0.16, 0.44, mats.leatherDark, [px, 0.4, pz]);
    rbox(w, 0.15, 0.52, 0.05, mats.leather, [px, 0.52, pz + 0.02], [-0.08, 0, 0]);
    rbox(w, 0.72, 0.16, 0.06, mats.leather, [px, 0.94, pz - 0.24], [0.2, 0, 0]);
    for (const dx of wide ? [-0.48, 0, 0.48] : [0])
      rbox(0.28, 0.17, 0.11, 0.05, mats.leather, [px + dx, 1.38, pz - 0.33], [0.2, 0, 0]);
    if (!wide)
      for (const s of [1, -1]) {
        box(0.07, 0.14, 0.5, mats.leatherDark, [px + s * 0.26, 0.56, pz + 0.02]);
        box(0.07, 0.6, 0.14, mats.leatherDark, [px + s * 0.27, 0.92, pz - 0.24], [0.2, 0, 0]);
      }
  };
  seat(-0.42, 0.12, false);
  seat(0.42, 0.12, false);
  seat(0, -1.02, true);

  /* door cards */
  for (const [z, s] of [[0.42, 0.95], [0.42, -0.95], [-0.46, 0.95], [-0.46, -0.95]]) {
    box(0.06, 0.55, 0.95, mats.cabin, [s * 0.92, 0.85, z]);
    box(0.03, 0.14, 0.7, mats.leather, [s * 0.89, 0.95, z]);
    box(0.02, 0.03, 0.18, mats.silver, [s * 0.88, 1.02, z + 0.2]);
    box(0.012, 0.012, 0.8, mats.ambient, [s * 0.885, 1.08, z]);
    cyl(0.07, 0.07, 0.02, mats.leatherDark, [s * 0.88, 0.55, z], [0, 0, Math.PI / 2], 20);
  }
  for (const s of [1, -1]) box(0.03, 0.22, 0.05, mats.cabin, [s * 0.86, 1.32, -0.38]);
  box(1.5, 0.04, 0.5, mats.cabin, [0, 1.35, -2.0]);
  box(0.24, 0.07, 0.02, mats.cabin, [0, 1.56, 0.62]);
  box(0.26, 0.02, 0.12, mats.dome, [0, 1.63, -0.1]);

  /* ══ ENGINE BAY ══ */
  rbox(0.95, 0.16, 0.75, 0.05, mats.plasticSoft, [0, 0.98, 1.55]);
  for (const z of [0.2, -0.2]) box(0.7, 0.02, 0.08, mats.plastic, [0, 1.07, 1.55 + z]);
  for (const s of [1, -1]) cyl(0.09, 0.1, 0.1, mats.darkMetal, [s * 0.62, 1.0, 1.35], [0, 0, 0], 16);
  box(1.3, 0.4, 0.06, mats.darkMetal, [0, 0.9, 2.05]);
  cyl(0.02, 0.02, 0.5, mats.hv, [0.45, 1.02, 1.7], [0, 0, Math.PI / 2], 8);
  cyl(0.02, 0.02, 0.4, mats.hv, [0.45, 1.02, 1.7], [Math.PI / 2, 0, 0], 8);
  cyl(0.06, 0.06, 0.14, mats.crystal, [0.72, 0.95, 1.75], [0, 0, 0], 14);
  box(0.22, 0.14, 0.26, mats.plastic, [-0.7, 0.95, 1.75]);

  /* ══ WHEELS ══ */
  const wheel = (px: number, pz: number) => {
    const out = px > 0 ? 1 : -1;
    cyl(TIRE_R - 0.02, TIRE_R - 0.02, 0.235, mats.tire, [px, TIRE_R, pz], [0, 0, Math.PI / 2], 40);
    for (const s of [1, -1]) torus(TIRE_R - 0.045, 0.028, mats.tire, [px + s * 0.115, TIRE_R, pz], [0, Math.PI / 2, 0]);
    cyl(0.26, 0.26, 0.22, mats.darkMetal, [px, TIRE_R, pz], [0, 0, Math.PI / 2], 32);
    cyl(0.17, 0.17, 0.03, mats.silver, [px, TIRE_R, pz], [0, 0, Math.PI / 2], 28);
    box(0.05, 0.12, 0.1, mats.plastic, [px, TIRE_R + 0.12, pz]);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const gx = px + out * 0.118;
      const sp = box(0.05, 0.2, 0.07, mats.silver, [gx, TIRE_R, pz]);
      sp.geometry.translate(0, 0.14, 0);
      sp.rotation.set(a, 0, 0);
      const sp2 = box(0.05, 0.18, 0.02, mats.silver, [gx, TIRE_R, pz]);
      sp2.geometry.translate(0, 0.14, 0.05);
      sp2.rotation.set(a, 0, 0);
      void sp2;
    }
    torus(0.25, 0.02, mats.silver, [px + out * 0.118, TIRE_R, pz], [0, Math.PI / 2, 0]);
    cyl(0.055, 0.055, 0.03, mats.silver, [px + out * 0.118, TIRE_R, pz], [0, 0, Math.PI / 2], 20);
  };
  wheel(TRACK_X, WB / 2);
  wheel(-TRACK_X, WB / 2);
  wheel(TRACK_X, -WB / 2);
  wheel(-TRACK_X, -WB / 2);

  return { group, mats };
}

/* ---------------- React wrapper ---------------- */

function HeadBeam({ x }: { x: number }) {
  const { light, target } = useMemo(() => {
    const l = new THREE.SpotLight("#eaf4ff", 90, 22, 0.5, 0.55, 1.4);
    l.position.set(x, 0.95, 2.3);
    const t = new THREE.Object3D();
    t.position.set(x * 1.6, 0.05, 13);
    l.target = t;
    return { light: l, target: t };
  }, [x]);
  return (
    <>
      <primitive object={light} />
      <primitive object={target} />
    </>
  );
}

export function JetourT1({ paint = "#9fb8a8", night = false }: { paint?: string; night?: boolean }) {
  const { group, mats } = useMemo(() => buildJetourT1(), []);
  useEffect(() => {
    mats.paint.color.set(paint);
  }, [mats, paint]);
  useEffect(() => {
    mats.drl.emissiveIntensity = night ? 5.5 : 3.2;
    mats.tail.emissiveIntensity = night ? 4.5 : 2.4;
    mats.ambient.emissiveIntensity = night ? 3.2 : 2.2;
    mats.dome.emissiveIntensity = night ? 3.2 : 2.0;
  }, [mats, night]);

  return (
    <>
      <primitive object={group} />
      {night && (
        <>
          <HeadBeam x={0.7} />
          <HeadBeam x={-0.7} />
          {[1, -1].map((sd) => (
            <mesh key={sd} position={[sd * 0.77, 0.96, 2.34]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshBasicMaterial color="#dff2ff" />
            </mesh>
          ))}
        </>
      )}
    </>
  );
}
