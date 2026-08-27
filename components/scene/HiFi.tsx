"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  makeWalnutCabinet,
  makeBrushedAluminum,
  makeKnurlChrome,
  makeSpunMetalTop,
  makeNumberRing,
  makeVuMeterFace,
  VU_PIVOT_Y,
  makeTunerFace,
  makeCassetteFace,
  makeSpoolTexture,
  makeCounterTexture,
  makeGlowTexture,
  makeEngravedLabel,
} from "@/lib/textures";

/* ===================================================================
   SKEUO · HI-FI — 1970s stereo receiver (1:1 with inspo/skeuo-hifi.jpg)

   Layout coordinates were measured off the reference photo
   (1280×640 px, aluminum face ≈ 1020 px wide ≈ 8.5 world units).
   =================================================================== */

const W = 9.6; // overall width incl. wood caps
const H = 3.9; // faceplate height
const D = 1.7; // cabinet depth
const WOOD_W = 0.55;
const AL_W = W - WOOD_W * 2; // 8.5
const FRONT = D / 2 - 0.01; // z of the aluminum surface

export function HiFi() {
  const wood = useMemo(() => makeWalnutCabinet(), []);
  const aluminum = useMemo(() => makeBrushedAluminum(), []);

  const [tunerFreq, setTunerFreq] = useState(98);
  const [volume, setVolume] = useState(7);
  const [bass, setBass] = useState(5);
  const [treble, setTreble] = useState(6);
  const [balance, setBalance] = useState(5);
  const [selectedInput, setSelectedInput] = useState(4); // FM
  const [powerOn, setPowerOn] = useState(true);
  const [speakersOn, setSpeakersOn] = useState(true);
  const [filterOn, setFilterOn] = useState(false);
  const [tapeCount, setTapeCount] = useState(104);

  // Mechanical tape counter ticks while the deck is "playing"
  useEffect(() => {
    if (!powerOn) return;
    const id = setInterval(() => setTapeCount((c) => (c >= 999 ? 0 : c + 1)), 900);
    return () => clearInterval(id);
  }, [powerOn]);

  // Shared audio-level simulation for the VU needles (smooth, musical)
  const level = useRef({ l: 0, r: 0 });
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    const peak = powerOn && speakersOn ? volume / 10 : 0;
    const mus = (p: number) => {
      const a = Math.sin(t * 2.7 + p) * 0.5 + Math.sin(t * 6.3 + p * 2) * 0.3 + Math.sin(t * 13.1 + p * 3) * 0.2;
      return Math.max(0, 0.28 + 0.72 * a);
    };
    const k = Math.min(1, dt * 7);
    level.current.l += (peak * mus(0.7) - level.current.l) * k;
    level.current.r += (peak * mus(2.9) - level.current.r) * k;
  });

  const woodMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: wood, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.5 }),
    [wood]
  );
  const aluminumMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: aluminum,
        color: "#d2d6da",
        roughness: 0.42,
        metalness: 0.85,
        envMapIntensity: 0.9,
      }),
    [aluminum]
  );
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#171310", roughness: 0.6, metalness: 0.4 }),
    []
  );

  return (
    <group>
      {/* ── Walnut end-caps ─────────────────────────────────────── */}
      <mesh position={[-W / 2 + WOOD_W / 2, 0, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[WOOD_W, H, D]} />
      </mesh>
      <mesh position={[W / 2 - WOOD_W / 2, 0, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[WOOD_W, H, D]} />
      </mesh>

      {/* ── Chassis body behind the faceplate ───────────────────── */}
      <mesh position={[0, 0, -0.06]} material={bodyMat} castShadow>
        <boxGeometry args={[AL_W + 0.02, H - 0.02, D - 0.12]} />
      </mesh>

      {/* ── Brushed aluminum faceplate ──────────────────────────── */}
      <mesh position={[0, 0, D / 2 - 0.05]} material={aluminumMat} castShadow receiveShadow>
        <boxGeometry args={[AL_W, H, 0.08]} />
      </mesh>

      {/* ── Feet ────────────────────────────────────────────────── */}
      {[
        [-W / 2 + 0.7, -D / 2 + 0.35],
        [-W / 2 + 0.7, D / 2 - 0.35],
        [W / 2 - 0.7, -D / 2 + 0.35],
        [W / 2 - 0.7, D / 2 - 0.35],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -H / 2 - 0.07, z]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.16, 20]} />
          <meshStandardMaterial color="#0c0a08" roughness={0.7} metalness={0.2} />
        </mesh>
      ))}

      {/* ── Engraved top-row labels ─────────────────────────────── */}
      <EngravedLabel text="LEFT CHANNEL" position={[-3.08, 1.71, FRONT + 0.002]} size={0.2} />
      <EngravedLabel text="STEREO RECEIVER" position={[-1.6, 1.71, FRONT + 0.002]} size={0.22} />
      <EngravedLabel text="RIGHT CHANNEL" position={[3.18, 1.71, FRONT + 0.002]} size={0.2} />
      <EngravedLabel text="STEREO RECEIVER" position={[-3.08, -0.28, FRONT + 0.002]} size={0.24} />
      <EngravedLabel text="VOLUME" position={[3.77, -0.13, FRONT + 0.002]} size={0.18} />

      {/* ── ROW 1: VU meters + tuner ────────────────────────────── */}
      <VuMeter position={[-3.08, 0.81, FRONT]} radius={0.72} subtitle="LEFT CHANNEL" level={level} side="l" powerOn={powerOn} />
      <Tuner position={[0, 0.92, FRONT]} width={4.12} height={1.18} freq={tunerFreq} onChange={setTunerFreq} powerOn={powerOn} />
      <VuMeter position={[3.08, 0.81, FRONT]} radius={0.72} subtitle="RIGHT CHANNEL" level={level} side="r" powerOn={powerOn} />

      {/* ── ROW 2: 8 push-buttons + volume knob ─────────────────── */}
      <group position={[0, -0.26, FRONT]}>
        {["POWER", "PHONO 1", "PHONO 2", "AUX", "FM", "AM", "TAPE 1", "TAPE 2"].map((label, i) => (
          <PushButton
            key={label}
            x={(i - 3.5) * 0.49}
            label={label}
            isPower={i === 0}
            pressed={i === 0 ? powerOn : selectedInput === i}
            powerOn={powerOn}
            onClick={() => (i === 0 ? setPowerOn((p) => !p) : setSelectedInput(i))}
          />
        ))}
      </group>
      <Knob position={[3.2, -0.48, FRONT]} radius={0.42} length={0.22} value={volume} onChange={setVolume} />

      {/* ── ROW 3 left: phones + toggles ────────────────────────── */}
      <PhonesJack position={[-3.69, -1.33, FRONT]} />
      <EngravedLabel text="PHONES" position={[-3.69, -1.0, FRONT + 0.002]} size={0.16} />
      <MiniToggle position={[-3.08, -1.33, FRONT]} label="SPEAKER" on={speakersOn} onChange={() => setSpeakersOn((v) => !v)} />
      <MiniToggle position={[-2.52, -1.33, FRONT]} label={"HIGH\nFILTER"} on={filterOn} onChange={() => setFilterOn((v) => !v)} />

      {/* ── ROW 3 center: cassette deck ─────────────────────────── */}
      <CassetteDeck position={[-0.46, -1.31, FRONT]} width={3.13} height={0.96} count={tapeCount} playing={powerOn} />

      {/* ── ROW 3 right: tone knobs ─────────────────────────────── */}
      <Knob position={[1.75, -1.33, FRONT]} radius={0.26} length={0.16} value={bass} onChange={setBass} label="BASS" />
      <Knob position={[2.6, -1.33, FRONT]} radius={0.26} length={0.16} value={treble} onChange={setTreble} label="TREBLE" />
      <Knob position={[3.48, -1.33, FRONT]} radius={0.26} length={0.16} value={balance} onChange={setBalance} label="BALANCE" />
    </group>
  );
}

/* ===================================================================
   ENGRAVED LABEL — transparent text plane pressed into the metal
   =================================================================== */

function EngravedLabel({
  text,
  position,
  size,
  fontSize = 34,
}: {
  text: string;
  position: [number, number, number];
  size: number;
  fontSize?: number;
}) {
  const tex = useMemo(() => makeEngravedLabel(text.replace("\n", " "), fontSize), [text, fontSize]);
  const aspect = tex.image.width / tex.image.height;
  return (
    <mesh position={position} renderOrder={4}>
      <planeGeometry args={[size * aspect, size]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={0.55} metalness={0.3} />
    </mesh>
  );
}

/* ===================================================================
   VU METER — chrome bezel, lamp-lit cream face, glowing orange needle
   =================================================================== */

function VuMeter({
  position,
  radius,
  subtitle,
  level,
  side,
  powerOn,
}: {
  position: [number, number, number];
  radius: number;
  subtitle: string;
  level: { current: { l: number; r: number } };
  side: "l" | "r";
  powerOn: boolean;
}) {
  const face = useMemo(() => makeVuMeterFace({ subtitle }), [subtitle]);
  const glow = useMemo(() => makeGlowTexture("#ffd9a0", "#ff7010"), []);
  const needleRef = useRef<THREE.Group>(null);
  const cur = useRef(0);

  useFrame((_, dt) => {
    const target = powerOn ? level.current[side] * 100 : 0;
    cur.current += (target - cur.current) * Math.min(1, dt * 8);
    if (needleRef.current) {
      const angle = -50 + cur.current; // degrees from vertical
      needleRef.current.rotation.z = -THREE.MathUtils.degToRad(angle);
    }
  });

  const chromeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d8dce0", roughness: 0.16, metalness: 1.0, envMapIntensity: 1.5 }),
    []
  );
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: face,
        roughness: 0.5,
        metalness: 0,
        emissive: "#ffc880",
        emissiveMap: face,
        emissiveIntensity: 0.32,
      }),
    [face]
  );
  faceMat.emissiveIntensity = powerOn ? 0.32 : 0.05;
  const needleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c84808",
        emissive: "#ff6a10",
        emissiveIntensity: 2.4,
        roughness: 0.35,
        metalness: 0.1,
      }),
    []
  );
  const brassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c89030", roughness: 0.28, metalness: 1.0, envMapIntensity: 1.3 }),
    []
  );

  const r = radius;
  return (
    <group position={position}>
      {/* Mounting flange + chrome bezel */}
      <mesh material={chromeMat} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]} castShadow>
        <cylinderGeometry args={[r * 1.08, r * 1.08, 0.06, 48]} />
      </mesh>
      <mesh material={chromeMat} position={[0, 0, 0.03]}>
        <torusGeometry args={[r * 1.0, r * 0.075, 24, 72]} />
      </mesh>
      {/* Dark well */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0]}>
        <cylinderGeometry args={[r * 0.97, r * 0.97, 0.08, 48]} />
        <meshStandardMaterial color="#0c0804" roughness={0.8} />
      </mesh>
      {/* Cream face */}
      <mesh material={faceMat} position={[0, 0, 0.045]}>
        <circleGeometry args={[r * 0.94, 64]} />
      </mesh>
      {/* Needle (pivot sits at the drawn dial center) */}
      <group ref={needleRef} position={[0, VU_PIVOT_Y * r, 0.075]}>
        <mesh material={needleMat} position={[0, r * 0.4, 0]}>
          <boxGeometry args={[0.016, r * 0.84, 0.008]} />
        </mesh>
        <mesh material={needleMat} position={[0, -r * 0.09, 0]}>
          <boxGeometry args={[0.034, r * 0.18, 0.008]} />
        </mesh>
        <sprite position={[0, r * 0.8, 0.01]} scale={[0.16, 0.16, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={powerOn ? 0.8 : 0} />
        </sprite>
      </group>
      {/* Brass center cap */}
      <mesh material={brassMat} rotation={[Math.PI / 2, 0, 0]} position={[0, VU_PIVOT_Y * r, 0.09]}>
        <cylinderGeometry args={[r * 0.075, r * 0.09, 0.03, 24]} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.11]} renderOrder={10}>
        <circleGeometry args={[r * 0.98, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.06}
          metalness={0}
          transparent
          opacity={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ===================================================================
   TUNER — chrome-framed amber glass, drag to tune
   =================================================================== */

function Tuner({
  position,
  width,
  height,
  freq,
  onChange,
  powerOn,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  freq: number;
  onChange: (f: number) => void;
  powerOn: boolean;
}) {
  const face = useMemo(() => makeTunerFace(), []);
  const glow = useMemo(() => makeGlowTexture("#ffd9a0", "#ff7010"), []);
  const indColor = useMemo(() => new THREE.Color("#ffb040").multiplyScalar(2.2), []);
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  const t = (freq - 88) / 20;
  // The printed scale spans 11.7%..79.5% of the face texture width
  const u = 0.1172 + t * (0.7949 - 0.1172);
  const indicatorX = (u - 0.5) * width;

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#9aa0a4", roughness: 0.3, metalness: 1.0, envMapIntensity: 1.2 }),
    []
  );
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: face,
        color: "#181008",
        roughness: 0.35,
        metalness: 0.1,
        emissive: "#ffffff",
        emissiveMap: face,
        emissiveIntensity: 1.35,
      }),
    [face]
  );

  const setFromUV = (uvx: number) => {
    const tt = Math.max(0, Math.min(1, (uvx - 0.1172) / (0.7949 - 0.1172)));
    onChange(Math.round((88 + tt * 20) * 2) / 2);
  };

  return (
    <group position={position}>
      {/* Chrome frame + recessed well */}
      <mesh material={frameMat} position={[0, 0, -0.015]} castShadow>
        <boxGeometry args={[width + 0.24, height + 0.24, 0.07]} />
      </mesh>
      <mesh position={[0, 0, 0.0]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.09]} />
        <meshStandardMaterial color="#0e0804" roughness={0.7} />
      </mesh>
      {/* Backlit face */}
      <mesh
        material={faceMat}
        position={[0, 0, 0.05]}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (controls) controls.enabled = false;
          (e.target as Element).setPointerCapture(e.pointerId);
          if (powerOn && e.uv) setFromUV(e.uv.x);
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          if (powerOn && e.buttons > 0 && e.uv) setFromUV(e.uv.x);
        }}
        onPointerUp={(e: ThreeEvent<PointerEvent>) => {
          if (controls) controls.enabled = true;
          (e.target as Element).releasePointerCapture(e.pointerId);
        }}
      >
        <planeGeometry args={[width, height]} />
      </mesh>
      {/* Tuned-frequency indicator */}
      {powerOn && (
        <group position={[indicatorX, 0, 0.062]}>
          <mesh>
            <planeGeometry args={[0.035, height * 0.94]} />
            <meshBasicMaterial color={indColor} toneMapped={false} />
          </mesh>
          <sprite scale={[0.5, height * 1.25, 1]}>
            <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.55} />
          </sprite>
        </group>
      )}
      {/* Glass */}
      <mesh position={[0, 0, 0.075]} renderOrder={10}>
        <planeGeometry args={[width + 0.06, height + 0.06]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.06}
          metalness={0}
          transparent
          opacity={0.07}
          clearcoat={1}
          envMapIntensity={1.2}
          depthWrite={false}
        />
      </mesh>
      {/* Warm light spilling out of the dial onto the plate */}
      <pointLight position={[0, 0, 0.7]} color="#ff8020" intensity={powerOn ? 1.6 : 0} distance={3.2} decay={2} />
    </group>
  );
}

/* ===================================================================
   PUSH-BUTTON — chrome bezel + cap, presses in when active
   =================================================================== */

function PushButton({
  x,
  label,
  isPower,
  pressed,
  powerOn,
  onClick,
}: {
  x: number;
  label: string;
  isPower: boolean;
  pressed: boolean;
  powerOn: boolean;
  onClick: () => void;
}) {
  const glow = useMemo(() => makeGlowTexture("#d8ffb0", "#40e020"), []);
  const bezelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c0c4c8", roughness: 0.22, metalness: 1.0, envMapIntensity: 1.3 }),
    []
  );
  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: pressed ? "#8a8e92" : "#e0e4e8",
        roughness: 0.24,
        metalness: 1.0,
        envMapIntensity: 1.4,
      }),
    [pressed]
  );
  return (
    <group position={[x, 0, 0]}>
      <mesh material={bezelMat} position={[0, 0, 0.015]}>
        <torusGeometry args={[0.125, 0.024, 16, 40]} />
      </mesh>
      <mesh
        material={capMat}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, pressed ? 0.005 : 0.03]}
        castShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <cylinderGeometry args={[0.105, 0.115, 0.06, 32]} />
      </mesh>
      {isPower && (
        <group position={[-0.3, 0, 0.02]}>
          <mesh material={bezelMat}>
            <torusGeometry args={[0.035, 0.01, 10, 24]} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial
              color={powerOn ? "#5aff30" : "#1a3010"}
              emissive={powerOn ? "#5aff30" : "#000000"}
              emissiveIntensity={powerOn ? 3 : 0}
              roughness={0.2}
            />
          </mesh>
          {powerOn && (
            <sprite scale={[0.22, 0.22, 1]} position={[0, 0, 0.02]}>
              <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.7} />
            </sprite>
          )}
        </group>
      )}
      <EngravedLabel text={label} position={[0, 0.26, 0.005]} size={0.15} />
    </group>
  );
}

/* ===================================================================
   KNOB — knurled chrome body, spun top, drag around its axis
   =================================================================== */

function Knob({
  position,
  radius,
  length,
  value,
  onChange,
  label,
}: {
  position: [number, number, number];
  radius: number;
  length: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const knurl = useMemo(() => makeKnurlChrome(), []);
  const spun = useMemo(() => makeSpunMetalTop(), []);
  const ring = useMemo(() => makeNumberRing(10), []);
  const bodyRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  const center = useRef<{ x: number; y: number } | null>(null);

  const rotZ = THREE.MathUtils.degToRad(135 - value * 27);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (controls) controls.enabled = false;
    (e.target as Element).setPointerCapture(e.pointerId);
    const wp = new THREE.Vector3();
    bodyRef.current?.getWorldPosition(wp);
    wp.project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    center.current = {
      x: rect.left + ((wp.x + 1) / 2) * rect.width,
      y: rect.top + (1 - (wp.y + 1) / 2) * rect.height,
    };
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!center.current || e.buttons === 0) return;
    const dx = e.clientX - center.current.x;
    const dy = e.clientY - center.current.y;
    if (Math.hypot(dx, dy) < 5) return;
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI; // 0 = up, clockwise +
    a = Math.max(-135, Math.min(135, a));
    onChange(Math.round(((a + 135) / 270) * 10));
  };
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    center.current = null;
    if (controls) controls.enabled = true;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: knurl, color: "#e8ebee", roughness: 0.25, metalness: 1.0, envMapIntensity: 1.4 }),
    [knurl]
  );
  const topMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: spun, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.2 }),
    [spun]
  );

  return (
    <group position={position}>
      {/* Numbered skirt ring */}
      <mesh position={[0, 0, 0.004]} renderOrder={2}>
        <planeGeometry args={[radius * 3.1, radius * 3.1]} />
        <meshStandardMaterial map={ring} transparent depthWrite={false} roughness={0.5} metalness={0.3} />
      </mesh>
      {label && <EngravedLabel text={label} position={[0, radius * 1.85, 0.004]} size={0.16} />}
      {/* Mounting flange */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.015]}>
        <cylinderGeometry args={[radius * 1.12, radius * 1.18, 0.04, 40]} />
        <meshStandardMaterial color="#5a5e62" roughness={0.35} metalness={1.0} envMapIntensity={1.0} />
      </mesh>
      {/* Rotating body */}
      <group
        ref={bodyRef}
        position={[0, 0, 0.03 + length / 2]}
        rotation={[0, 0, rotZ]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOver={() => (document.body.style.cursor = "grab")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <mesh material={bodyMat} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[radius * 0.96, radius, length, 48]} />
        </mesh>
        <mesh material={topMat} position={[0, 0, length / 2 + 0.002]}>
          <circleGeometry args={[radius * 0.95, 48]} />
        </mesh>
      </group>
    </group>
  );
}

/* ===================================================================
   PHONES JACK + MINI TOGGLE
   =================================================================== */

function PhonesJack({ position }: { position: [number, number, number] }) {
  const chromeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#b8bcc0", roughness: 0.28, metalness: 1.0, envMapIntensity: 1.2 }),
    []
  );
  return (
    <group position={position}>
      <mesh material={chromeMat} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.08, 0.05, 6]} />
      </mesh>
      <mesh material={chromeMat} position={[0, 0, 0.02]}>
        <torusGeometry args={[0.055, 0.016, 12, 32]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 20]} />
        <meshStandardMaterial color="#050302" roughness={0.9} />
      </mesh>
    </group>
  );
}

function MiniToggle({
  position,
  label,
  on,
  onChange,
}: {
  position: [number, number, number];
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  const chromeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d8dce0", roughness: 0.2, metalness: 1.0, envMapIntensity: 1.4 }),
    []
  );
  return (
    <group
      position={position}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onChange();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* Slot plate + hex nut */}
      <mesh position={[0, 0, 0.008]}>
        <boxGeometry args={[0.1, 0.3, 0.02]} />
        <meshStandardMaterial color="#2a241c" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh material={chromeMat} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 6]} />
      </mesh>
      {/* Lever */}
      <group position={[0, on ? 0.045 : -0.045, 0.05]} rotation={[on ? -0.22 : 0.22, 0, 0]}>
        <mesh material={chromeMat} castShadow>
          <cylinderGeometry args={[0.016, 0.022, 0.14, 12]} />
        </mesh>
        <mesh material={chromeMat} position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.032, 16, 16]} />
        </mesh>
      </group>
      <EngravedLabel text={label} position={[0, 0.3, 0.004]} size={0.14} />
      <EngravedLabel text={on ? "ON" : "OFF"} position={[0, -0.28, 0.004]} size={0.11} />
    </group>
  );
}

/* ===================================================================
   CASSETTE DECK — recessed well, spinning spools, tape counter
   =================================================================== */

function CassetteDeck({
  position,
  width,
  height,
  count,
  playing,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  count: number;
  playing: boolean;
}) {
  const cassette = useMemo(() => makeCassetteFace("70'S MIX"), []);
  const spool = useMemo(() => makeSpoolTexture(), []);
  const counter = useMemo(() => makeCounterTexture(count), [count]);
  useEffect(() => () => counter.dispose(), [counter]);

  const spoolL = useRef<THREE.Mesh>(null);
  const spoolR = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!playing) return;
    const s = dt * 2.2;
    if (spoolL.current) spoolL.current.rotation.z -= s;
    if (spoolR.current) spoolR.current.rotation.z -= s * 0.8;
  });

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a8acaf", roughness: 0.35, metalness: 0.9, envMapIntensity: 1.0 }),
    []
  );

  const cw = width * 0.55;
  const ch = height * 0.62;
  const winX = -width * 0.155;
  const spoolY = -ch * 0.242;

  return (
    <group position={position}>
      {/* Recessed panel */}
      <mesh material={frameMat} position={[0, 0, -0.005]}>
        <boxGeometry args={[width, height, 0.05]} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width - 0.08, height - 0.08, 0.02]} />
        <meshStandardMaterial color="#888c90" roughness={0.45} metalness={0.85} envMapIntensity={0.8} />
      </mesh>

      {/* Window well */}
      <mesh position={[winX, 0.02, 0.028]}>
        <boxGeometry args={[cw + 0.12, ch + 0.12, 0.03]} />
        <meshStandardMaterial color="#0a0603" roughness={0.8} />
      </mesh>
      {/* Cassette */}
      <mesh position={[winX, 0.02, 0.045]}>
        <planeGeometry args={[cw, ch]} />
        <meshStandardMaterial map={cassette} roughness={0.6} metalness={0} />
      </mesh>
      {/* Spinning spools */}
      <mesh ref={spoolL} position={[winX - cw * 0.18, 0.02 + spoolY, 0.052]}>
        <circleGeometry args={[ch * 0.19, 32]} />
        <meshStandardMaterial map={spool} roughness={0.5} />
      </mesh>
      <mesh ref={spoolR} position={[winX + cw * 0.18, 0.02 + spoolY, 0.052]}>
        <circleGeometry args={[ch * 0.19, 32]} />
        <meshStandardMaterial map={spool} roughness={0.5} />
      </mesh>
      {/* Window glass */}
      <mesh position={[winX, 0.02, 0.06]} renderOrder={10}>
        <planeGeometry args={[cw + 0.1, ch + 0.1]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.06} roughness={0.08} clearcoat={1} depthWrite={false} />
      </mesh>

      {/* Tape counter */}
      <mesh position={[width * 0.33, 0, 0.03]}>
        <boxGeometry args={[0.56, 0.3, 0.03]} />
        <meshStandardMaterial color="#14100c" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[width * 0.33, 0, 0.048]}>
        <planeGeometry args={[0.48, 0.24]} />
        <meshStandardMaterial map={counter} roughness={0.4} />
      </mesh>
      <EngravedLabel text="TAPE COUNTER" position={[width * 0.33, 0.26, 0.03]} size={0.12} />
      {/* Reset button */}
      <mesh position={[width * 0.33 + 0.38, 0, 0.04]}>
        <boxGeometry args={[0.09, 0.14, 0.03]} />
        <meshStandardMaterial color="#c0c4c8" roughness={0.3} metalness={1.0} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}
