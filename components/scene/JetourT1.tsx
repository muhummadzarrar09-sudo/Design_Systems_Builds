"use client";

/* ===================================================================
   JETOUR T1 — 1:1 scale procedural model
   Real dimensions (m): L 4.705 · W 1.967 · H 1.843 · WB 2.800
   clearance 0.20 · tire Ø 0.762 · track 1.695
   Axis convention: +Z = front, +Y = up, +X = right
   =================================================================== */

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

const L = 4.705;
const W = 1.967;
const H = 1.843;
const WB = 2.8;
const TIRE_R = 0.381;
const TRACK_X = 0.8475;

/* ---------------- materials ---------------- */

function useMats() {
  return useMemo(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: "#9fb8a8", // sage green from the press shots
      roughness: 0.32,
      metalness: 0.55,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.1,
    });
    const plastic = new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.85, metalness: 0.1 });
    const plasticSoft = new THREE.MeshStandardMaterial({ color: "#1c1c1e", roughness: 0.7, metalness: 0.15 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#0b0e10",
      roughness: 0.08,
      metalness: 0.7,
      envMapIntensity: 1.4,
    });
    const silver = new THREE.MeshStandardMaterial({ color: "#c8ccd0", roughness: 0.25, metalness: 1.0, envMapIntensity: 1.3 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: "#3a3d40", roughness: 0.4, metalness: 0.9 });
    const drl = new THREE.MeshStandardMaterial({ color: "#e8f4ff", emissive: "#cfe8ff", emissiveIntensity: 3.0 });
    const tail = new THREE.MeshStandardMaterial({ color: "#400808", emissive: "#ff1820", emissiveIntensity: 2.2 });
    const amber = new THREE.MeshStandardMaterial({ color: "#5a2c08", emissive: "#ff8010", emissiveIntensity: 1.2 });
    const tire = new THREE.MeshStandardMaterial({ color: "#0c0c0c", roughness: 0.95 });
    return { paint, plastic, plasticSoft, glass, silver, darkMetal, drl, tail, amber, tire };
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
  // manual letter-spacing
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

/* ---------------- wheel ---------------- */

function Wheel({ position, mats }: { position: [number, number, number]; mats: ReturnType<typeof useMats> }) {
  const spokes = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) arr.push((i / 5) * Math.PI * 2);
    return arr;
  }, []);
  return (
    <group position={position}>
      {/* Tire */}
      <mesh material={mats.tire} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[TIRE_R, TIRE_R, 0.235, 40]} />
      </mesh>
      {/* Sidewall shoulder */}
      <mesh material={mats.tire} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[TIRE_R * 0.98, TIRE_R * 0.98, 0.25, 40]} />
      </mesh>
      {/* Rim barrel */}
      <mesh material={mats.darkMetal} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.24, 32]} />
      </mesh>
      {/* Petal spokes (outer face) */}
      <group position={[position[0] > 0 ? 0.125 : -0.125, 0, 0]}>
        {spokes.map((a, i) => (
          <group key={i} rotation={[a, 0, 0]}>
            <mesh material={mats.silver} position={[0, 0.14, 0]} castShadow>
              <boxGeometry args={[0.03, 0.24, 0.07]} />
            </mesh>
          </group>
        ))}
        {/* Rim lip */}
        <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.245, 0.02, 12, 40]} />
        </mesh>
        {/* Hub */}
        <mesh material={mats.silver} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------- angular wheel-arch cladding ---------------- */

function ArchCladding({ z, mats }: { z: number; mats: ReturnType<typeof useMats> }) {
  const geo = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(-0.66, 0.24);
    outer.lineTo(-0.66, 0.6);
    outer.lineTo(-0.48, 0.9);
    outer.lineTo(0.48, 0.9);
    outer.lineTo(0.66, 0.6);
    outer.lineTo(0.66, 0.24);
    outer.lineTo(0.52, 0.24);
    outer.lineTo(0.52, 0.56);
    outer.lineTo(0.4, 0.78);
    outer.lineTo(-0.4, 0.78);
    outer.lineTo(-0.52, 0.56);
    outer.lineTo(-0.52, 0.24);
    outer.closePath();
    const g = new THREE.ExtrudeGeometry(outer, { depth: 0.14, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    return g;
  }, []);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={geo} material={mats.plastic} position={[W / 2 - 0.05, 0, 0]} castShadow />
      <mesh geometry={geo} material={mats.plastic} position={[-W / 2 + 0.05 - 0.14, 0, 0]} castShadow />
    </group>
  );
}

/* ---------------- the car ---------------- */

export function JetourT1() {
  const mats = useMats();
  const jetourTex = useMemo(() => makeLetterTexture("JETOUR", "#e0e4e8"), []);
  const plateTex = useMemo(() => makeLetterTexture("T1", "#e8e8e8", "#101010", 8), []);

  const dashes = useMemo(() => {
    const d: [number, number][] = [];
    for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) d.push([-0.42 + i * 0.14, row === 0 ? 1.0 : 0.925]);
    return d;
  }, []);

  return (
    <group>
      {/* ══ MAIN BODY MASSES ══ */}
      {/* Lower tub */}
      <RoundedBox args={[W - 0.04, 0.6, L - 0.24]} radius={0.07} smoothness={4} position={[0, 0.66, 0]} material={mats.paint} castShadow receiveShadow />
      {/* Shoulder / beltline mass */}
      <RoundedBox args={[W - 0.02, 0.3, L - 0.1]} radius={0.06} smoothness={4} position={[0, 1.02, -0.1]} material={mats.paint} castShadow />
      {/* Hood block (slightly lower than beltline) */}
      <RoundedBox args={[W - 0.06, 0.14, 1.25]} radius={0.05} smoothness={4} position={[0, 1.06, 1.62]} material={mats.paint} castShadow />
      {/* Cabin */}
      <RoundedBox args={[W - 0.14, 0.56, 2.95]} radius={0.09} smoothness={4} position={[0, 1.42, -0.42]} material={mats.paint} castShadow />
      {/* Roof */}
      <RoundedBox args={[W - 0.28, 0.1, 2.55]} radius={0.05} smoothness={4} position={[0, 1.72, -0.5]} material={mats.paint} castShadow />

      {/* ══ GLASSHOUSE (dark privacy glass) ══ */}
      {/* Windshield — upright, ~62° */}
      <mesh position={[0, 1.4, 0.98]} rotation={[-0.62, 0, 0]} material={mats.glass}>
        <boxGeometry args={[W - 0.3, 0.78, 0.04]} />
      </mesh>
      {/* Side glass band */}
      <mesh position={[0, 1.42, -0.52]} material={mats.glass}>
        <boxGeometry args={[W - 0.12, 0.44, 2.62]} />
      </mesh>
      {/* Rear glass — slight rake */}
      <mesh position={[0, 1.44, -1.98]} rotation={[0.42, 0, 0]} material={mats.glass}>
        <boxGeometry args={[W - 0.3, 0.62, 0.04]} />
      </mesh>
      {/* C-pillar louver detail (both sides) */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * (W / 2 - 0.055), 1.5, -1.52]} rotation={[0, 0, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} material={mats.plasticSoft} position={[0, -i * 0.07, 0]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.02, 0.03, 0.3]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ══ FRONT END ══ */}
      {/* Fascia panel */}
      <RoundedBox args={[W - 0.05, 0.52, 0.16]} radius={0.04} position={[0, 0.86, L / 2 - 0.14]} material={mats.paint} castShadow />
      {/* Black grille panel */}
      <mesh position={[0, 0.96, L / 2 - 0.045]} material={mats.plastic}>
        <boxGeometry args={[1.56, 0.3, 0.05]} />
      </mesh>
      {/* Illuminated double-dash grille strips */}
      {dashes.map(([x, y], i) => (
        <mesh key={i} material={mats.drl} position={[x, y, L / 2 - 0.015]}>
          <boxGeometry args={[0.095, 0.032, 0.02]} />
        </mesh>
      ))}
      {/* Square headlights with 4-point cloverleaf DRLs */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.77, 0.96, L / 2 - 0.04]}>
          <mesh material={mats.plasticSoft}>
            <boxGeometry args={[0.36, 0.3, 0.06]} />
          </mesh>
          {[
            [0.09, 0.07],
            [-0.09, 0.07],
            [0.09, -0.07],
            [-0.09, -0.07],
          ].map(([dx, dy], i) => (
            <mesh key={i} material={mats.drl} position={[dx, dy, 0.035]}>
              <boxGeometry args={[0.055, 0.055, 0.02]} />
            </mesh>
          ))}
          <mesh material={mats.drl} position={[0, 0, 0.035]}>
            <boxGeometry args={[0.055, 0.055, 0.02]} />
          </mesh>
        </group>
      ))}
      {/* Chunky front bumper */}
      <RoundedBox args={[W + 0.02, 0.4, 0.4]} radius={0.06} position={[0, 0.42, L / 2 - 0.16]} material={mats.plastic} castShadow />
      {/* Lower intake + skid */}
      <mesh position={[0, 0.3, L / 2 - 0.05]} material={mats.plasticSoft}>
        <boxGeometry args={[1.2, 0.16, 0.06]} />
      </mesh>
      <mesh position={[0, 0.21, L / 2 - 0.12]} material={mats.darkMetal}>
        <boxGeometry args={[1.4, 0.08, 0.22]} />
      </mesh>
      {/* Amber reflectors */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.amber} position={[s * 0.62, 0.44, L / 2 + 0.03]}>
          <boxGeometry args={[0.14, 0.06, 0.02]} />
        </mesh>
      ))}
      {/* Front plate */}
      <mesh position={[0, 0.52, L / 2 + 0.045]}>
        <boxGeometry args={[0.48, 0.16, 0.02]} />
        <meshStandardMaterial map={plateTex} roughness={0.5} />
      </mesh>

      {/* ══ REAR END ══ */}
      {/* Tailgate */}
      <RoundedBox args={[W - 0.06, 0.9, 0.14]} radius={0.05} position={[0, 1.0, -L / 2 + 0.1]} material={mats.paint} castShadow />
      {/* Body-color letter band */}
      <mesh position={[0, 1.16, -L / 2 + 0.02]} material={mats.paint}>
        <boxGeometry args={[W - 0.2, 0.3, 0.06]} />
      </mesh>
      <mesh position={[0, 1.16, -L / 2 - 0.05]}>
        <planeGeometry args={[1.3, 0.2]} />
        <meshStandardMaterial map={jetourTex} transparent roughness={0.4} metalness={0.6} />
      </mesh>
      {/* 4-point tail lamps */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.82, 1.2, -L / 2 + 0.01]}>
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
      {/* Roof spoiler */}
      <mesh position={[0, 1.73, -1.95]} material={mats.plastic} castShadow>
        <boxGeometry args={[W - 0.3, 0.09, 0.34]} />
      </mesh>
      {/* Rear bumper */}
      <RoundedBox args={[W + 0.02, 0.42, 0.36]} radius={0.06} position={[0, 0.42, -L / 2 + 0.14]} material={mats.plastic} castShadow />
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.tail} position={[s * 0.7, 0.42, -L / 2 - 0.03]}>
          <boxGeometry args={[0.16, 0.05, 0.02]} />
        </mesh>
      ))}
      {/* Rear plate */}
      <mesh position={[0, 0.82, -L / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.48, 0.16]} />
        <meshStandardMaterial map={plateTex} roughness={0.5} />
      </mesh>

      {/* ══ SIDES ══ */}
      <ArchCladding z={WB / 2} mats={mats} />
      <ArchCladding z={-WB / 2} mats={mats} />
      {/* Rocker cladding */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.plastic} position={[s * (W / 2 - 0.02), 0.4, 0]} castShadow>
          <boxGeometry args={[0.1, 0.22, 2.5]} />
        </mesh>
      ))}
      {/* Side steps */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.plasticSoft} position={[s * (W / 2 - 0.06), 0.3, -0.1]} castShadow>
          <boxGeometry args={[0.18, 0.05, 2.1]} />
        </mesh>
      ))}
      {/* Door handles */}
      {[
        [0.55, 1],
        [-0.55, 1],
        [0.55, -1],
        [-0.62, -1],
      ].map(([z, s], i) => (
        <mesh key={i} material={mats.paint} position={[s * (W / 2 - 0.005), 1.12, z]}>
          <boxGeometry args={[0.03, 0.045, 0.22]} />
        </mesh>
      ))}
      {/* Mirrors */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * (W / 2 + 0.06), 1.28, 0.92]}>
          <mesh material={mats.plastic} position={[-s * 0.06, -0.04, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.06]} />
          </mesh>
          <RoundedBox args={[0.06, 0.12, 0.2]} radius={0.02} material={mats.paint} castShadow />
        </group>
      ))}
      {/* Fuel filler door */}
      <mesh position={[W / 2 - 0.004, 1.12, -1.75]} material={mats.paint}>
        <boxGeometry args={[0.015, 0.2, 0.24]} />
      </mesh>

      {/* ══ ROOF FURNITURE ══ */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.plastic} position={[s * 0.78, 1.8, -0.5]} castShadow>
          <boxGeometry args={[0.05, 0.06, 2.1]} />
        </mesh>
      ))}
      {/* Panoramic glass roof */}
      <mesh position={[0, 1.775, -0.45]} material={mats.glass}>
        <boxGeometry args={[1.2, 0.02, 1.6]} />
      </mesh>
      {/* Shark fin */}
      <mesh position={[0, 1.8, -1.62]} material={mats.plastic}>
        <boxGeometry args={[0.03, 0.08, 0.16]} />
      </mesh>

      {/* ══ UNDERBODY ══ */}
      <mesh position={[0, 0.3, 0]} material={mats.plastic}>
        <boxGeometry args={[W - 0.3, 0.14, L - 0.9]} />
      </mesh>

      {/* ══ WHEELS ══ */}
      <Wheel position={[TRACK_X, TIRE_R, WB / 2]} mats={mats} />
      <Wheel position={[-TRACK_X, TIRE_R, WB / 2]} mats={mats} />
      <Wheel position={[TRACK_X, TIRE_R, -WB / 2]} mats={mats} />
      <Wheel position={[-TRACK_X, TIRE_R, -WB / 2]} mats={mats} />
    </group>
  );
}
