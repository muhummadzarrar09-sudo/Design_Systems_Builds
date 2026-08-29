"use client";

/* ===================================================================
   JETOUR T1 — 1:1 scale procedural model (website hero grade)
   Real dims (m): L 4.705 · W 1.967 · H 1.843 · WB 2.800
   clearance 0.20 · tire Ø 0.762 · track 1.695
   Body = extruded side-profile silhouettes with beveled shoulders and
   wheel arches cut into the bodywork. Full cabin: sage leather seats,
   15.6" floating screen, cluster, crystal shifter, ambient lighting.
   Engine bay: 1.5T PHEV cover, strut towers, radiator, HV-orange cables.
   +Z = front, +Y = up. LHD per press fleet.
   =================================================================== */

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

const L = 4.705;
const W = 1.967;
const WB = 2.8;
const TIRE_R = 0.381;
const TRACK_X = 0.8475;

/* ---------------- materials ---------------- */

function useMats() {
  return useMemo(() => {
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
      opacity: 0.4,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
    });
    const silver = new THREE.MeshStandardMaterial({ color: "#c8ccd0", roughness: 0.22, metalness: 1.0, envMapIntensity: 1.3 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: "#3a3d40", roughness: 0.4, metalness: 0.9 });
    const drl = new THREE.MeshStandardMaterial({ color: "#e8f4ff", emissive: "#cfe8ff", emissiveIntensity: 3.2 });
    const tail = new THREE.MeshStandardMaterial({ color: "#400808", emissive: "#ff1820", emissiveIntensity: 2.4 });
    const amber = new THREE.MeshStandardMaterial({ color: "#5a2c08", emissive: "#ff8010", emissiveIntensity: 1.2 });
    const tire = new THREE.MeshStandardMaterial({ color: "#0c0c0c", roughness: 0.95 });
    const seam = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.6 });
    // interior
    const cabin = new THREE.MeshStandardMaterial({ color: "#232527", roughness: 0.9, metalness: 0.05 });
    const leather = new THREE.MeshStandardMaterial({ color: "#79a496", roughness: 0.55, metalness: 0.02 });
    const leatherDark = new THREE.MeshStandardMaterial({ color: "#17191b", roughness: 0.6, metalness: 0.05 });
    const headliner = new THREE.MeshStandardMaterial({ color: "#3b3e41", roughness: 0.95 });
    const crystal = new THREE.MeshPhysicalMaterial({
      color: "#bcd8e8",
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.55,
      envMapIntensity: 2,
    });
    const ambient = new THREE.MeshStandardMaterial({ color: "#0a3a32", emissive: "#39d5bb", emissiveIntensity: 2.2 });
    const dome = new THREE.MeshStandardMaterial({ color: "#403018", emissive: "#ffd9a0", emissiveIntensity: 2.0 });
    const hv = new THREE.MeshStandardMaterial({ color: "#ff6a00", roughness: 0.5 });
    return { paint, plastic, plasticSoft, glass, silver, darkMetal, drl, tail, amber, tire, seam, cabin, leather, leatherDark, headliner, crystal, ambient, dome, hv };
  }, []);
}

/* ---------------- canvas textures ---------------- */

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
  // mountain range
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
  // lake
  const lake = x.createLinearGradient(0, 400, 0, 552);
  lake.addColorStop(0, "#4a86b8");
  lake.addColorStop(1, "#274f7c");
  x.fillStyle = lake;
  x.fillRect(0, 400, 1024, 152);
  // dock
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
  // gauge arcs
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

/* ---------------- extruded side-profile body ---------------- */

function profileShape(pts: [number, number][]) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

function useBodyGeometries() {
  return useMemo(() => {
    const lower = profileShape([
      [2.28, 0.24],
      [2.33, 0.34],
      [2.33, 0.66],
      [2.29, 0.78],
      [2.3, 1.0],
      [2.24, 1.1],
      [1.7, 1.13],
      [0.95, 1.16],
      [-1.9, 1.18],
      [-2.28, 1.16],
      [-2.33, 1.0],
      [-2.33, 0.6],
      [-2.28, 0.26],
      [-2.05, 0.21],
      [-1.94, 0.22],
      [-1.9, 0.6],
      [-1.66, 0.84],
      [-1.14, 0.84],
      [-0.9, 0.6],
      [-0.86, 0.22],
      [0.86, 0.22],
      [0.9, 0.6],
      [1.14, 0.84],
      [1.66, 0.84],
      [1.9, 0.6],
      [1.94, 0.22],
    ]);
    const lowerGeo = new THREE.ExtrudeGeometry(lower, {
      depth: 1.86,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
    lowerGeo.rotateY(-Math.PI / 2);
    lowerGeo.translate(1.86 / 2, 0, 0);

    const upper = profileShape([
      [1.0, 1.1],
      [0.78, 1.42],
      [0.58, 1.66],
      [0.4, 1.72],
      [-1.55, 1.75],
      [-1.85, 1.7],
      [-2.16, 1.32],
      [-2.2, 1.1],
    ]);
    const upperGeo = new THREE.ExtrudeGeometry(upper, {
      depth: 1.52,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 4,
    });
    upperGeo.rotateY(-Math.PI / 2);
    upperGeo.translate(1.52 / 2, 0, 0);

    const arch = profileShape([
      [-0.7, 0.18],
      [-0.66, 0.62],
      [-0.42, 0.94],
      [0.42, 0.94],
      [0.66, 0.62],
      [0.7, 0.18],
      [0.54, 0.18],
      [0.5, 0.56],
      [0.36, 0.8],
      [-0.36, 0.8],
      [-0.5, 0.56],
      [-0.54, 0.18],
    ]);
    const archGeo = new THREE.ExtrudeGeometry(arch, { depth: 0.12, bevelEnabled: false });
    archGeo.rotateY(-Math.PI / 2);

    return { lowerGeo, upperGeo, archGeo };
  }, []);
}

/* ---------------- wheel ---------------- */

function Wheel({ position, mats }: { position: [number, number, number]; mats: ReturnType<typeof useMats> }) {
  const spokes = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2), []);
  const out = position[0] > 0 ? 1 : -1;
  return (
    <group position={position}>
      <mesh material={mats.tire} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[TIRE_R - 0.02, TIRE_R - 0.02, 0.235, 40]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.tire} rotation={[0, Math.PI / 2, 0]} position={[s * 0.115, 0, 0]}>
          <torusGeometry args={[TIRE_R - 0.045, 0.028, 10, 40]} />
        </mesh>
      ))}
      <mesh material={mats.darkMetal} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.22, 32]} />
      </mesh>
      <mesh material={mats.silver} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, 0.03, 28]} />
      </mesh>
      <mesh material={mats.plastic} position={[0, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.12, 0.1]} />
      </mesh>
      <group position={[out * 0.118, 0, 0]}>
        {spokes.map((a, i) => (
          <group key={i} rotation={[a, 0, 0]}>
            <mesh material={mats.silver} position={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.028, 0.22, 0.06]} />
            </mesh>
            <mesh material={mats.silver} position={[0, 0.15, 0.045]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.028, 0.2, 0.02]} />
            </mesh>
          </group>
        ))}
        <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.25, 0.018, 12, 44]} />
        </mesh>
        <mesh material={mats.silver} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------- seat ---------------- */

function Seat({ position, mats, wide = false }: { position: [number, number, number]; mats: ReturnType<typeof useMats>; wide?: boolean }) {
  const w = wide ? 1.42 : 0.52;
  return (
    <group position={position}>
      {/* base + cushion */}
      <mesh material={mats.leatherDark} position={[0, 0.4, 0]}>
        <boxGeometry args={[w - 0.04, 0.16, 0.44]} />
      </mesh>
      <RoundedBox args={[w, 0.15, 0.52]} radius={0.05} material={mats.leather} position={[0, 0.52, 0.02]} rotation={[-0.08, 0, 0]} castShadow />
      {/* backrest + integrated shoulder */}
      <RoundedBox args={[w, 0.72, 0.16]} radius={0.06} material={mats.leather} position={[0, 0.94, -0.24]} rotation={[0.2, 0, 0]} castShadow />
      {/* headrests */}
      {(wide ? [-0.48, 0, 0.48] : [0]).map((dx) => (
        <RoundedBox key={dx} args={[0.28, 0.17, 0.11]} radius={0.05} material={mats.leather} position={[dx, 1.38, -0.33]} rotation={[0.2, 0, 0]} />
      ))}
      {/* side bolsters (front only) */}
      {!wide &&
        [1, -1].map((s) => (
          <group key={s}>
            <mesh material={mats.leatherDark} position={[s * 0.26, 0.56, 0.02]}>
              <boxGeometry args={[0.07, 0.14, 0.5]} />
            </mesh>
            <mesh material={mats.leatherDark} position={[s * 0.27, 0.92, -0.24]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.07, 0.6, 0.14]} />
            </mesh>
          </group>
        ))}
    </group>
  );
}

/* ---------------- the car ---------------- */

export function JetourT1() {
  const mats = useMats();
  const { lowerGeo, upperGeo, archGeo } = useBodyGeometries();
  const jetourTex = useMemo(() => makeLetterTexture("JETOUR", "#e0e4e8"), []);
  const plateTex = useMemo(() => makeLetterTexture("T1", "#e8e8e8", "#101010", 8), []);
  const screenTex = useMemo(() => makeScreenTexture(), []);
  const clusterTex = useMemo(() => makeClusterTexture(), []);
  const screenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: screenTex, emissiveIntensity: 1.5, roughness: 0.3 }),
    [screenTex]
  );
  const clusterMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: clusterTex, emissiveIntensity: 1.6, roughness: 0.3 }),
    [clusterTex]
  );

  const dashes = useMemo(() => {
    const d: [number, number][] = [];
    for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) d.push([-0.42 + i * 0.14, row === 0 ? 1.0 : 0.92]);
    return d;
  }, []);

  return (
    <group>
      {/* ══ BODY ══ */}
      <mesh geometry={lowerGeo} material={mats.paint} castShadow receiveShadow />
      <mesh geometry={upperGeo} material={mats.glass} castShadow />

      {/* Roof panel + panoramic glass */}
      <RoundedBox args={[1.56, 0.07, 2.5]} radius={0.03} position={[0, 1.73, -0.52]} material={mats.paint} castShadow />
      <mesh position={[0, 1.768, -0.5]} material={mats.glass}>
        <boxGeometry args={[1.1, 0.02, 1.5]} />
      </mesh>

      {/* Pillars */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={mats.paint} position={[s * 0.83, 1.42, 0.82]} rotation={[-0.66, 0, 0]}>
            <boxGeometry args={[0.05, 0.72, 0.06]} />
          </mesh>
          <mesh material={mats.seam} position={[s * 0.84, 1.4, -0.12]}>
            <boxGeometry args={[0.03, 0.5, 0.09]} />
          </mesh>
          <mesh material={mats.paint} position={[s * 0.83, 1.44, -1.86]} rotation={[0.55, 0, 0]}>
            <boxGeometry args={[0.05, 0.62, 0.06]} />
          </mesh>
        </group>
      ))}
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.84, 1.52, -1.52]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} material={mats.plasticSoft} position={[0, -i * 0.07, 0]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.02, 0.03, 0.3]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Beltline trim */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.seam} position={[s * 0.975, 1.165, -0.5]}>
          <boxGeometry args={[0.015, 0.035, 4.2]} />
        </mesh>
      ))}

      {/* Door seams */}
      {[0.88, -0.02, -0.92].map((z) =>
        [1, -1].map((s) => (
          <mesh key={`${z}${s}`} material={mats.seam} position={[s * 0.972, 0.72, z]}>
            <boxGeometry args={[0.012, 0.82, 0.008]} />
          </mesh>
        ))
      )}

      {/* ══ ARCH CLADDING ══ */}
      {[WB / 2, -WB / 2].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={archGeo} material={mats.plastic} position={[1.06, 0, 0]} castShadow />
          <mesh geometry={archGeo} material={mats.plastic} position={[-0.94, 0, 0]} castShadow />
        </group>
      ))}

      {/* Rockers + steps */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={mats.plastic} position={[s * 0.955, 0.36, -0.1]} castShadow>
            <boxGeometry args={[0.09, 0.2, 2.4]} />
          </mesh>
          <mesh material={mats.plasticSoft} position={[s * 0.93, 0.28, -0.1]} castShadow>
            <boxGeometry args={[0.18, 0.05, 2.1]} />
          </mesh>
        </group>
      ))}

      {/* ══ FRONT END ══ */}
      <mesh position={[0, 0.96, 2.29]} material={mats.plastic}>
        <boxGeometry args={[1.56, 0.3, 0.05]} />
      </mesh>
      {dashes.map(([x, y], i) => (
        <mesh key={i} material={mats.drl} position={[x, y, 2.325]}>
          <boxGeometry args={[0.095, 0.032, 0.02]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.77, 0.96, 2.3]}>
          <mesh material={mats.plasticSoft}>
            <boxGeometry args={[0.36, 0.3, 0.06]} />
          </mesh>
          {[
            [0.09, 0.07],
            [-0.09, 0.07],
            [0.09, -0.07],
            [-0.09, -0.07],
            [0, 0],
          ].map(([dx, dy], i) => (
            <mesh key={i} material={mats.drl} position={[dx, dy, 0.035]}>
              <boxGeometry args={[0.055, 0.055, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
      <RoundedBox args={[W + 0.01, 0.4, 0.3]} radius={0.06} position={[0, 0.42, 2.2]} material={mats.plastic} castShadow />
      <mesh position={[0, 0.3, 2.32]} material={mats.plasticSoft}>
        <boxGeometry args={[1.2, 0.16, 0.06]} />
      </mesh>
      <mesh position={[0, 0.21, 2.26]} material={mats.darkMetal}>
        <boxGeometry args={[1.4, 0.08, 0.22]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.amber} position={[s * 0.62, 0.44, 2.36]}>
          <boxGeometry args={[0.14, 0.06, 0.02]} />
        </mesh>
      ))}
      <mesh position={[0, 0.52, 2.37]}>
        <boxGeometry args={[0.48, 0.16, 0.02]} />
        <meshStandardMaterial map={plateTex} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.145, 2.05]} material={mats.silver}>
        <boxGeometry args={[0.12, 0.015, 0.06]} />
      </mesh>

      {/* ══ REAR END ══ */}
      <mesh position={[0, 1.16, -2.31]} material={mats.paint}>
        <boxGeometry args={[W - 0.2, 0.3, 0.06]} />
      </mesh>
      <mesh position={[0, 1.16, -2.345]}>
        <planeGeometry args={[1.3, 0.2]} />
        <meshStandardMaterial map={jetourTex} transparent roughness={0.4} metalness={0.6} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.8, 1.2, -2.32]}>
          <mesh material={mats.plasticSoft}>
            <boxGeometry args={[0.34, 0.28, 0.05]} />
          </mesh>
          {[
            [0.08, 0.06],
            [-0.08, 0.06],
            [0.08, -0.06],
            [-0.08, -0.06],
          ].map(([dx, dy], i) => (
            <mesh key={i} material={mats.tail} position={[dx, dy, -0.03]}>
              <boxGeometry args={[0.05, 0.05, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.73, -1.95]} material={mats.plastic} castShadow>
        <boxGeometry args={[W - 0.3, 0.09, 0.34]} />
      </mesh>
      <mesh position={[0, 1.71, -2.12]} material={mats.tail}>
        <boxGeometry args={[0.7, 0.025, 0.02]} />
      </mesh>
      <RoundedBox args={[W + 0.01, 0.42, 0.3]} radius={0.06} position={[0, 0.42, -2.2]} material={mats.plastic} castShadow />
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.tail} position={[s * 0.7, 0.42, -2.36]}>
          <boxGeometry args={[0.16, 0.05, 0.02]} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, -2.34]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.48, 0.16]} />
        <meshStandardMaterial map={plateTex} roughness={0.5} />
      </mesh>

      {/* ══ SIDES ══ */}
      {[
        [0.12, 1],
        [0.12, -1],
        [-0.78, 1],
        [-0.78, -1],
      ].map(([z, s], i) => (
        <mesh key={i} material={mats.paint} position={[s * 0.975, 1.1, z]}>
          <boxGeometry args={[0.03, 0.045, 0.22]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <group key={s} position={[s * 1.04, 1.26, 0.86]}>
          <mesh material={mats.plastic} position={[-s * 0.06, -0.04, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.06]} />
          </mesh>
          <RoundedBox args={[0.06, 0.13, 0.22]} radius={0.02} material={mats.paint} castShadow />
          <mesh material={mats.drl} position={[s * 0.032, 0, 0.06]}>
            <boxGeometry args={[0.008, 0.02, 0.12]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.972, 1.12, -1.75]} material={mats.paint}>
        <boxGeometry args={[0.015, 0.2, 0.24]} />
      </mesh>

      {/* ══ ROOF FURNITURE ══ */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={mats.plastic} position={[s * 0.74, 1.8, -0.5]} castShadow>
            <boxGeometry args={[0.05, 0.05, 2.0]} />
          </mesh>
          {[0.35, -1.35].map((z) => (
            <mesh key={z} material={mats.plastic} position={[s * 0.74, 1.775, z]}>
              <boxGeometry args={[0.05, 0.04, 0.12]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.81, -1.62]} material={mats.plastic}>
        <boxGeometry args={[0.03, 0.08, 0.16]} />
      </mesh>

      <mesh position={[0, 0.28, 0]} material={mats.plastic}>
        <boxGeometry args={[W - 0.35, 0.12, L - 0.9]} />
      </mesh>

      {/* ══════════ INTERIOR ══════════ */}
      {/* floor + headliner */}
      <mesh material={mats.cabin} position={[0, 0.36, -0.4]}>
        <boxGeometry args={[1.7, 0.06, 3.5]} />
      </mesh>
      <mesh material={mats.headliner} position={[0, 1.66, -0.55]}>
        <boxGeometry args={[1.5, 0.04, 2.9]} />
      </mesh>

      {/* dashboard stack */}
      <RoundedBox args={[1.62, 0.3, 0.55]} radius={0.05} material={mats.cabin} position={[0, 1.0, 0.82]} rotation={[-0.12, 0, 0]} castShadow />
      <mesh material={mats.leather} position={[0.38, 1.06, 0.6]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.66, 0.14, 0.04]} />
      </mesh>
      <mesh material={mats.silver} position={[0.38, 0.98, 0.62]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 12]} />
      </mesh>
      {/* cluster + 15.6" screen */}
      <mesh material={clusterMat} position={[-0.42, 1.12, 0.66]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.36, 0.14, 0.02]} />
      </mesh>
      <mesh material={screenMat} position={[0, 1.13, 0.5]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.42, 0.26, 0.02]} />
      </mesh>
      {/* vents: vertical outer + center pair */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.darkMetal} position={[s * 0.78, 1.08, 0.72]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.06, 0.18, 0.05]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.darkMetal} position={[s * 0.12, 0.9, 0.6]}>
          <boxGeometry args={[0.17, 0.06, 0.04]} />
        </mesh>
      ))}
      {/* piano-key toggles */}
      {[-0.15, -0.09, -0.03, 0.03, 0.09, 0.15].map((x) => (
        <mesh key={x} material={mats.silver} position={[x, 0.96, 0.6]}>
          <boxGeometry args={[0.035, 0.022, 0.02]} />
        </mesh>
      ))}
      {/* dash ambient strip */}
      <mesh material={mats.ambient} position={[0, 0.94, 0.66]}>
        <boxGeometry args={[1.5, 0.012, 0.012]} />
      </mesh>

      {/* steering wheel (LHD) */}
      <group position={[-0.42, 1.04, 0.68]} rotation={[-0.5, 0, 0]}>
        <mesh material={mats.leatherDark}>
          <torusGeometry args={[0.19, 0.022, 12, 40]} />
        </mesh>
        {[0, 2.1, -2.1].map((a) => (
          <mesh key={a} material={mats.silver} position={[Math.sin(a) * 0.1, Math.cos(a) * 0.1, 0]} rotation={[0, 0, -a]}>
            <boxGeometry args={[0.03, 0.14, 0.025]} />
          </mesh>
        ))}
        <mesh material={mats.leatherDark}>
          <boxGeometry args={[0.09, 0.07, 0.03]} />
        </mesh>
        <mesh material={mats.silver} position={[0, 0, 0.02]}>
          <boxGeometry args={[0.05, 0.02, 0.01]} />
        </mesh>
      </group>
      <mesh material={mats.cabin} position={[-0.42, 1.0, 0.78]} rotation={[1.1, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.25, 12]} />
      </mesh>

      {/* center console + crystal shifter */}
      <RoundedBox args={[0.34, 0.24, 0.95]} radius={0.04} material={mats.cabin} position={[0, 0.6, 0.05]} castShadow />
      <mesh material={mats.crystal} position={[0, 0.76, 0.28]}>
        <boxGeometry args={[0.06, 0.09, 0.06]} />
      </mesh>
      <mesh material={mats.silver} position={[0, 0.72, 0.28]}>
        <cylinderGeometry args={[0.045, 0.05, 0.03, 16]} />
      </mesh>
      <mesh material={mats.silver} position={[0, 0.73, 0.05]}>
        <cylinderGeometry args={[0.05, 0.05, 0.025, 20]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.leatherDark} position={[s * 0.09, 0.725, -0.15]}>
          <cylinderGeometry args={[0.045, 0.04, 0.02, 16]} />
        </mesh>
      ))}
      <RoundedBox args={[0.3, 0.1, 0.42]} radius={0.04} material={mats.leather} position={[0, 0.74, -0.42]} />

      {/* seats: 2 front + rear bench */}
      <Seat position={[-0.42, 0, 0.12]} mats={mats} />
      <Seat position={[0.42, 0, 0.12]} mats={mats} />
      <Seat position={[0, 0, -1.02]} mats={mats} wide />

      {/* door cards + ambient lighting */}
      {[
        [0.42, 0.95],
        [0.42, -0.95],
        [-0.46, 0.95],
        [-0.46, -0.95],
      ].map(([z, s], i) => (
        <group key={i}>
          <mesh material={mats.cabin} position={[s * 0.92, 0.85, z]}>
            <boxGeometry args={[0.06, 0.55, 0.95]} />
          </mesh>
          <mesh material={mats.leather} position={[s * 0.89, 0.95, z]}>
            <boxGeometry args={[0.03, 0.14, 0.7]} />
          </mesh>
          <mesh material={mats.silver} position={[s * 0.88, 1.02, z + 0.2]}>
            <boxGeometry args={[0.02, 0.03, 0.18]} />
          </mesh>
          <mesh material={mats.ambient} position={[s * 0.885, 1.08, z]}>
            <boxGeometry args={[0.012, 0.012, 0.8]} />
          </mesh>
          <mesh material={mats.leatherDark} position={[s * 0.88, 0.55, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 20]} />
          </mesh>
        </group>
      ))}
      {/* B-pillar grab handles */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.cabin} position={[s * 0.86, 1.32, -0.38]}>
          <boxGeometry args={[0.03, 0.22, 0.05]} />
        </mesh>
      ))}
      {/* parcel shelf */}
      <mesh material={mats.cabin} position={[0, 1.35, -2.0]}>
        <boxGeometry args={[1.5, 0.04, 0.5]} />
      </mesh>
      {/* interior mirror */}
      <mesh material={mats.cabin} position={[0, 1.56, 0.62]}>
        <boxGeometry args={[0.24, 0.07, 0.02]} />
      </mesh>

      {/* cabin lights: warm dome + teal wash */}
      <mesh material={mats.dome} position={[0, 1.63, -0.1]}>
        <boxGeometry args={[0.26, 0.02, 0.12]} />
      </mesh>
      <pointLight color="#ffd9a0" intensity={1.4} distance={2.6} position={[0, 1.5, -0.3]} />
      <pointLight color="#39d5bb" intensity={0.8} distance={2.2} position={[0, 0.85, -0.4]} />

      {/* ══════════ ENGINE BAY (1.5T PHEV) ══════════ */}
      <RoundedBox args={[0.95, 0.16, 0.75]} radius={0.05} material={mats.plasticSoft} position={[0, 0.98, 1.55]} castShadow />
      {[0.2, -0.2].map((z) => (
        <mesh key={z} material={mats.plastic} position={[0, 1.07, 1.55 + z]}>
          <boxGeometry args={[0.7, 0.02, 0.08]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.darkMetal} position={[s * 0.62, 1.0, 1.35]}>
          <cylinderGeometry args={[0.09, 0.1, 0.1, 16]} />
        </mesh>
      ))}
      <mesh material={mats.darkMetal} position={[0, 0.9, 2.05]}>
        <boxGeometry args={[1.3, 0.4, 0.06]} />
      </mesh>
      <mesh material={mats.hv} position={[0.45, 1.02, 1.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
      </mesh>
      <mesh material={mats.hv} position={[0.45, 1.02, 1.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
      </mesh>
      <mesh material={mats.crystal} position={[0.72, 0.95, 1.75]}>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 14]} />
      </mesh>
      <mesh material={mats.plastic} position={[-0.7, 0.95, 1.75]}>
        <boxGeometry args={[0.22, 0.14, 0.26]} />
      </mesh>

      {/* ══ WHEELS ══ */}
      <Wheel position={[TRACK_X, TIRE_R, WB / 2]} mats={mats} />
      <Wheel position={[-TRACK_X, TIRE_R, WB / 2]} mats={mats} />
      <Wheel position={[TRACK_X, TIRE_R, -WB / 2]} mats={mats} />
      <Wheel position={[-TRACK_X, TIRE_R, -WB / 2]} mats={mats} />
    </group>
  );
}
