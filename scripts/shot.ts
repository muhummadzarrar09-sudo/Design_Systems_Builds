/* Headless software rasterizer: renders buildJetourT1() to PNG via sharp.
   Usage: npx tsx scripts/shot.ts <azimDeg> <elevDeg> <dist> <out.png>     */
import * as THREE from "three";
import sharp from "sharp";
import { buildJetourT1 } from "../components/scene/JetourT1";

const Wpx = 1100;
const Hpx = 700;
const azim = (parseFloat(process.argv[2] ?? "35") * Math.PI) / 180;
const elev = (parseFloat(process.argv[3] ?? "13") * Math.PI) / 180;
const dist = parseFloat(process.argv[4] ?? "8.8");
const out = process.argv[5] ?? "/tmp/shot.png";

async function main() {
  const { group } = buildJetourT1({ textures: false });
  const scene = new THREE.Scene();
  scene.add(group);
  scene.updateMatrixWorld(true);

  const camera = new THREE.PerspectiveCamera(42, Wpx / Hpx, 0.1, 200);
  camera.position.set(
    Math.sin(azim) * Math.cos(elev) * dist,
    Math.sin(elev) * dist + 0.8,
    Math.cos(azim) * Math.cos(elev) * dist
  );
  camera.lookAt(0, 0.8, 0);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

  const sun = new THREE.Vector3(7, 9, 5).normalize();

  type Tri = { pts: string; depth: number; fill: string; op: number };
  const tris: Tri[] = [];

  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const posAttr = geo.getAttribute("position");
    const normalAttr = geo.getAttribute("normal");
    const index = geo.getIndex();
    mesh.updateWorldMatrix(true, false);
    const m = mesh.matrixWorld;
    const nm = new THREE.Matrix3().getNormalMatrix(m);
    const base = new THREE.Color(mat.color ?? "#888888");
    const emis = new THREE.Color((mat as unknown as { emissive?: THREE.Color }).emissive ?? "#000000");
    const ei = (mat as unknown as { emissiveIntensity?: number }).emissiveIntensity ?? 0;
    const op = mat.transparent ? ((mat as unknown as { opacity?: number }).opacity ?? 1) : 1;
    const doubleSide = mat.side === THREE.DoubleSide;

    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
    const na = new THREE.Vector3(), view = new THREE.Vector3();
    const pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3();
    const count = index ? index.count : posAttr.count;

    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      va.fromBufferAttribute(posAttr, ia).applyMatrix4(m);
      vb.fromBufferAttribute(posAttr, ib).applyMatrix4(m);
      vc.fromBufferAttribute(posAttr, ic).applyMatrix4(m);
      if (normalAttr) na.fromBufferAttribute(normalAttr, ia).applyNormalMatrix(nm);
      else {
        na.copy(vb).sub(va).cross(vc.clone().sub(va)).normalize();
      }
      view.copy(va).add(vb).add(vc).divideScalar(3).sub(camera.position);
      if (!doubleSide && na.dot(view) > 0) continue;
      pa.copy(va).project(camera);
      pb.copy(vb).project(camera);
      pc.copy(vc).project(camera);
      if (pa.z > 1 || pb.z > 1 || pc.z > 1 || pa.z < -1 || pb.z < -1 || pc.z < -1) continue;
      const depth = view.length();
      const shade = 0.38 + 0.72 * Math.max(0, na.dot(sun));
      let r = base.r * shade, g = base.g * shade, b = base.b * shade;
      if (ei > 0) {
        r = Math.min(1, r + emis.r * Math.min(1, ei * 0.5));
        g = Math.min(1, g + emis.g * Math.min(1, ei * 0.5));
        b = Math.min(1, b + emis.b * Math.min(1, ei * 0.5));
      }
      const fill = `rgb(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0})`;
      const x1 = ((pa.x * 0.5 + 0.5) * Wpx).toFixed(1), y1 = ((1 - (pa.y * 0.5 + 0.5)) * Hpx).toFixed(1);
      const x2 = ((pb.x * 0.5 + 0.5) * Wpx).toFixed(1), y2 = ((1 - (pb.y * 0.5 + 0.5)) * Hpx).toFixed(1);
      const x3 = ((pc.x * 0.5 + 0.5) * Wpx).toFixed(1), y3 = ((1 - (pc.y * 0.5 + 0.5)) * Hpx).toFixed(1);
      tris.push({ pts: `${x1},${y1} ${x2},${y2} ${x3},${y3}`, depth, fill, op });
    }
  });

  tris.sort((a, b) => b.depth - a.depth);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wpx}" height="${Hpx}">`;
  svg += `<rect width="100%" height="100%" fill="#b8c4cc"/>`;
  svg += `<rect y="${Hpx * 0.56}" width="100%" height="${Hpx * 0.44}" fill="#a7abad"/>`;
  for (const t of tris)
    svg += `<polygon points="${t.pts}" fill="${t.fill}" fill-opacity="${t.op}" stroke="${t.fill}" stroke-opacity="${t.op}" stroke-width="0.7"/>`;
  svg += `</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log("wrote", out, "tris:", tris.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
