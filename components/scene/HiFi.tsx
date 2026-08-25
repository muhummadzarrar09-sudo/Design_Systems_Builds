"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  makeWalnutCabinet,
  makeBrushedAluminum,
  makeChrome,
  makeVuMeterFace,
  makeTunerFace,
  makeTunerBacklight,
  makeCassetteFace,
  makeKnobNumberedFace,
  makeEngravedLabel,
} from "@/lib/textures";

/* ===================================================================
   SKEUO · HI-FI — 1970s stereo receiver (1:1 with inspo/skeuo-hifi.jpg)
   =================================================================== */

export function HiFi() {
  const wood = useMemo(() => makeWalnutCabinet(), []);
  const aluminum = useMemo(() => makeBrushedAluminum(), []);
  const chrome = useMemo(() => makeChrome(), []);

  // State for the interactive parts
  const [tunerFreq, setTunerFreq] = useState(98); // FM MHz
  const [volume, setVolume] = useState(6);
  const [bass, setBass] = useState(5);
  const [treble, setTreble] = useState(5);
  const [balance, setBalance] = useState(5);
  const [selectedInput, setSelectedInput] = useState(0); // POWER = 0, then PHONO 1, PHONO 2, AUX, FM, AM, TAPE 1, TAPE 2
  const [powerOn, setPowerOn] = useState(true);
  const [speakersOn, setSpeakersOn] = useState(true);
  const [filterOn, setFilterOn] = useState(false);
  const [tapeCount, setTapeCount] = useState(104);

  // Live VU needles — sway with the music
  const [vuLeft, setVuLeft] = useState(20);
  const [vuRight, setVuRight] = useState(20);
  useEffect(() => {
    const id = setInterval(() => {
      if (powerOn && speakersOn) {
        const peak = (volume / 10) * 95;
        setVuLeft(peak * (0.6 + Math.random() * 0.4));
        setVuRight(peak * (0.6 + Math.random() * 0.4));
      } else {
        setVuLeft(2);
        setVuRight(2);
      }
      setTapeCount((c) => (c >= 999 ? 0 : c + 1));
    }, 200);
    return () => clearInterval(id);
  }, [powerOn, speakersOn, volume]);

  // ── Materials ─────────────────────────────────────────────
  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wood,
        color: "#6a3a18",
        roughness: 0.7,
        metalness: 0.0,
      }),
    [wood]
  );
  const aluminumMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: aluminum,
        color: "#c8ccd0",
        roughness: 0.42,
        metalness: 0.85,
        envMapIntensity: 1.0,
      }),
    [aluminum]
  );

  // ── Layout constants (in 3D units) ───────────────────────
  // Image is 1280×640. We map it to roughly 8 × 4 world units.
  const W = 8.0; // total width
  const H = 3.4; // total face height
  const D = 1.6; // depth (back-to-front)
  const WOOD_W = 0.6; // wood cabinet width
  const AL_W = W - WOOD_W * 2; // aluminum face width
  const AL_X = 0; // aluminum is centered

  // Y positions of rows
  const ROW1_Y = 0.7; // VU meters + tuner
  const ROW2_Y = -0.05; // push-buttons + volume knob
  const ROW3_Y = -0.85; // switches + cassette + bass/tre/bal

  return (
    <group>
      {/* ── Wood end-caps (left & right) ──────────────────────── */}
      <mesh position={[-W / 2 + WOOD_W / 2, 0, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[WOOD_W, H, D]} />
      </mesh>
      <mesh position={[W / 2 - WOOD_W / 2, 0, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[WOOD_W, H, D]} />
      </mesh>

      {/* Wood top piece (across the top, behind the aluminum) */}
      <mesh position={[0, H / 2 - 0.05, -D / 2 + 0.1]} material={woodMat}>
        <boxGeometry args={[W, 0.1, D]} />
      </mesh>

      {/* ── Brushed aluminum faceplate (the main front) ──────── */}
      <mesh position={[0, 0, D / 2 - 0.05]} material={aluminumMat} castShadow receiveShadow>
        <boxGeometry args={[AL_W, H, 0.08]} />
      </mesh>

      {/* ── Engraved labels along the very top ────────────────── */}
      <EngravedLabel
        text="LEFT CHANNEL"
        position={[-AL_W / 2 + 0.9, H / 2 - 0.25, D / 2 - 0.005]}
        size={0.5}
        fontSize={28}
      />
      <EngravedLabel
        text="STEREO RECEIVER"
        position={[0, H / 2 - 0.25, D / 2 - 0.005]}
        size={0.5}
        fontSize={28}
      />
      <EngravedLabel
        text="RIGHT CHANNEL"
        position={[AL_W / 2 - 0.9, H / 2 - 0.25, D / 2 - 0.005]}
        size={0.5}
        fontSize={28}
      />

      {/* ── ROW 1: VU METER (LEFT) ────────────────────────────── */}
      <VuMeter
        position={[-AL_W / 2 + 0.9, ROW1_Y, D / 2 - 0.005]}
        radius={0.55}
        face={makeVuMeterFace({ title: "dB", subtitle: "LEFT CHANNEL" })}
        chrome={chrome}
        needleAngle={vuLeft}
      />

      {/* ── ROW 1: TUNER DIAL (CENTER) ───────────────────────── */}
      <Tuner
        position={[0, ROW1_Y, D / 2 - 0.005]}
        width={2.8}
        height={0.95}
        face={makeTunerFace()}
        backlight={makeTunerBacklight()}
        freq={tunerFreq}
        onChange={setTunerFreq}
      />

      {/* ── ROW 1: VU METER (RIGHT) ───────────────────────────── */}
      <VuMeter
        position={[AL_W / 2 - 0.9, ROW1_Y, D / 2 - 0.005]}
        radius={0.55}
        face={makeVuMeterFace({ title: "dB", subtitle: "RIGHT CHANNEL" })}
        chrome={chrome}
        needleAngle={vuRight}
      />

      {/* ── ROW 2: 8 PUSH-BUTTONS (CENTER) ────────────────────── */}
      <PushButtonRow
        y={ROW2_Y}
        z={D / 2 - 0.005}
        labels={["POWER", "PHONO 1", "PHONO 2", "AUX", "FM", "AM", "TAPE 1", "TAPE 2"]}
        selected={selectedInput}
        onSelect={(i) => {
          if (i === 0) setPowerOn(!powerOn);
          else setSelectedInput(i);
        }}
        powerOn={powerOn}
        chrome={chrome}
      />

      {/* ── ROW 2: VOLUME KNOB (RIGHT) ────────────────────────── */}
      <VolumeKnob
        position={[AL_W / 2 - 0.7, ROW2_Y + 0.15, D / 2 - 0.005]}
        value={volume}
        onChange={setVolume}
        chrome={chrome}
        numberedFace={makeKnobNumberedFace(10)}
      />

      {/* ── ROW 3 (left): PHONES + SPEAKER + FILTER ───────────── */}
      <PhonesJack position={[-AL_W / 2 + 0.3, ROW3_Y, D / 2 - 0.005]} chrome={chrome} />
      <MiniToggleSwitch
        position={[-AL_W / 2 + 0.8, ROW3_Y, D / 2 - 0.005]}
        label="SPEAKER"
        on={speakersOn}
        onChange={() => setSpeakersOn(!speakersOn)}
        chrome={chrome}
      />
      <MiniToggleSwitch
        position={[-AL_W / 2 + 1.4, ROW3_Y, D / 2 - 0.005]}
        label="HIGH FILTER"
        on={filterOn}
        onChange={() => setFilterOn(!filterOn)}
        chrome={chrome}
      />
      <EngravedLabel
        text="PHONES"
        position={[-AL_W / 2 + 0.3, ROW3_Y + 0.3, D / 2 - 0.005]}
        size={0.4}
        fontSize={22}
      />

      {/* ── ROW 3 (center): CASSETTE DECK ─────────────────────── */}
      <CassetteDeck
        position={[0, ROW3_Y, D / 2 - 0.005]}
        width={2.4}
        height={0.7}
        face={makeCassetteFace("70'S MIX")}
        count={tapeCount}
        chrome={chrome}
      />

      {/* ── ROW 3 (right): BASS / TREBLE / BALANCE knobs ──────── */}
      <SmallKnob
        position={[AL_W / 2 - 1.6, ROW3_Y, D / 2 - 0.005]}
        label="BASS"
        value={bass}
        onChange={setBass}
        chrome={chrome}
      />
      <SmallKnob
        position={[AL_W / 2 - 1.0, ROW3_Y, D / 2 - 0.005]}
        label="TREBLE"
        value={treble}
        onChange={setTreble}
        chrome={chrome}
      />
      <SmallKnob
        position={[AL_W / 2 - 0.4, ROW3_Y, D / 2 - 0.005]}
        label="BALANCE"
        value={balance}
        onChange={setBalance}
        chrome={chrome}
      />
    </group>
  );
}

/* ===================================================================
   ENGRAVED LABEL (thin plane with text texture)
   =================================================================== */

function EngravedLabel({
  text,
  position,
  size,
  fontSize = 32,
}: {
  text: string;
  position: [number, number, number];
  size: number;
  fontSize?: number;
}) {
  const tex = useMemo(() => makeEngravedLabel(text, fontSize), [text, fontSize]);
  const aspect = tex.image.width / tex.image.height;
  return (
    <mesh position={position}>
      <planeGeometry args={[size * aspect, size]} />
      <meshStandardMaterial map={tex} transparent roughness={0.6} metalness={0.4} />
    </mesh>
  );
}

/* ===================================================================
   VU METER (chrome bezel + cream face + orange needle + glass)
   =================================================================== */

function VuMeter({
  position,
  radius,
  face,
  chrome,
  needleAngle,
}: {
  position: [number, number, number];
  radius: number;
  face: THREE.Texture;
  chrome: THREE.Texture;
  needleAngle: number;
}) {
  const needleRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (needleRef.current) {
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z,
        ((needleAngle - 50) / 100) * (240 * Math.PI) / 180 - (120 * Math.PI) / 180,
        0.2
      );
    }
  });
  const bezelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#d8dce0",
        roughness: 0.18,
        metalness: 1.0,
        envMapIntensity: 1.4,
      }),
    [chrome]
  );
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: face,
        roughness: 0.55,
        metalness: 0.0,
      }),
    [face]
  );
  const needleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e85a10",
        roughness: 0.3,
        metalness: 0.2,
        emissive: "#3a1004",
        emissiveIntensity: 0.2,
      }),
    []
  );
  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a1208",
        roughness: 0.5,
        metalness: 0.5,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Chrome bezel ring */}
      <mesh material={bezelMat} castShadow>
        <torusGeometry args={[radius, radius * 0.12, 24, 64]} />
      </mesh>
      {/* Inner cylinder (the well behind the face) */}
      <mesh material={bezelMat} position={[0, 0, -0.02]}>
        <cylinderGeometry args={[radius * 0.95, radius * 0.95, 0.05, 64]} />
        <meshStandardMaterial color="#1a0a04" />
      </mesh>
      {/* Cream face plate */}
      <mesh material={faceMat} position={[0, 0, 0.005]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.01, 64]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      {/* Orange needle */}
      <group ref={needleRef} position={[0, 0, 0.02]}>
        <mesh material={needleMat} position={[0, radius * 0.35, 0]}>
          <boxGeometry args={[0.012, radius * 0.85, 0.005]} />
        </mesh>
        <mesh material={needleMat} position={[0, radius * 0.78, 0]}>
          <coneGeometry args={[0.02, 0.04, 3]} />
        </mesh>
      </group>
      {/* Center cap */}
      <mesh material={capMat} position={[0, 0, 0.03]}>
        <cylinderGeometry args={[radius * 0.08, radius * 0.08, 0.015, 24]} />
      </mesh>
      {/* Glass cover (semi-transparent) */}
      <mesh position={[0, 0, 0.04]}>
        <cylinderGeometry args={[radius * 0.88, radius * 0.88, 0.01, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.0}
          transparent
          opacity={0.15}
          envMapIntensity={1.0}
        />
      </mesh>
    </group>
  );
}

/* ===================================================================
   TUNER DIAL (recessed box with orange backlight + moving indicator)
   =================================================================== */

function Tuner({
  position,
  width,
  height,
  face,
  backlight,
  freq,
  onChange,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  face: THREE.Texture;
  backlight: THREE.Texture;
  freq: number;
  onChange: (f: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const indicatorRef = useRef<THREE.Mesh>(null);
  // FM range 88-108, map freq to x position within the tuner
  const t = (freq - 88) / (108 - 88);
  const indicatorX = -width / 2 + 0.3 + t * (width - 0.6);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const mesh = indicatorRef.current;
      if (!mesh) return;
      const wp = new THREE.Vector3();
      mesh.parent?.getWorldPosition(wp);
      const cam = (mesh as any).__r3f?.root?.getState?.().camera as THREE.Camera | undefined;
      if (!cam) return;
      const screenPos = wp.clone().project(cam);
      const sx = (screenPos.x + 1) / 2 * window.innerWidth;
      const ratio = (e.clientX - sx + width * 100) / (width * 200);
      const f = Math.round(88 + Math.max(0, Math.min(1, ratio)) * 20);
      onChange(f);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onChange, width]);

  const bezelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a0a04",
        roughness: 0.5,
        metalness: 0.6,
      }),
    []
  );
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: face,
        emissiveMap: backlight,
        emissive: "#ff8020",
        emissiveIntensity: 0.8,
        roughness: 0.6,
        metalness: 0.0,
      }),
    [face, backlight]
  );
  const indicatorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffaa40",
        emissive: "#ffaa40",
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.9,
      }),
    []
  );
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.05,
        metalness: 0.0,
        transparent: true,
        opacity: 0.15,
        envMapIntensity: 1.0,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Bezel/well (dark frame around the tuner) */}
      <mesh material={bezelMat} position={[0, 0, -0.02]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.04]} />
      </mesh>
      {/* Backlight glow plane (sits behind the face) */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width * 0.95, height * 0.95]} />
        <meshBasicMaterial map={backlight} />
      </mesh>
      {/* The face plate (with numbers + backlight showing through) */}
      <mesh
        material={faceMat}
        position={[0, 0, 0]}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setDragging(true);
        }}
      >
        <planeGeometry args={[width, height]} />
      </mesh>
      {/* Moving orange indicator line */}
      <mesh ref={indicatorRef} position={[indicatorX, 0, 0.01]} material={indicatorMat}>
        <planeGeometry args={[0.02, height * 0.95]} />
      </mesh>
      {/* Glass cover */}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.0}
          transparent
          opacity={0.15}
          envMapIntensity={1.0}
        />
      </mesh>
    </group>
  );
}

/* ===================================================================
   PUSH-BUTTON ROW (8 round chrome buttons)
   =================================================================== */

function PushButtonRow({
  y,
  z,
  labels,
  selected,
  onSelect,
  powerOn,
  chrome,
}: {
  y: number;
  z: number;
  labels: string[];
  selected: number;
  onSelect: (i: number) => void;
  powerOn: boolean;
  chrome: THREE.Texture;
}) {
  const buttonSpacing = 0.45;
  const startX = -((labels.length - 1) / 2) * buttonSpacing;
  return (
    <group position={[0, y, z]}>
      {labels.map((label, i) => (
        <PushButton
          key={i}
          x={startX + i * buttonSpacing}
          y={0}
          label={label}
          selected={selected === i}
          isPower={i === 0}
          powerOn={powerOn}
          onClick={() => onSelect(i)}
          chrome={chrome}
        />
      ))}
    </group>
  );
}

function PushButton({
  x,
  y,
  label,
  selected,
  isPower,
  powerOn,
  onClick,
  chrome,
}: {
  x: number;
  y: number;
  label: string;
  selected: boolean;
  isPower: boolean;
  powerOn: boolean;
  onClick: () => void;
  chrome: THREE.Texture;
}) {
  const bezelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#c8ccd0",
        roughness: 0.22,
        metalness: 1.0,
        envMapIntensity: 1.3,
      }),
    [chrome]
  );
  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: selected ? "#a0a4a8" : "#d8dce0",
        roughness: 0.25,
        metalness: 1.0,
        envMapIntensity: 1.3,
      }),
    [chrome, selected]
  );
  return (
    <group position={[x, y, 0]} onClick={onClick}>
      {/* Bezel ring */}
      <mesh material={bezelMat} castShadow>
        <torusGeometry args={[0.13, 0.025, 16, 32]} />
      </mesh>
      {/* Button cap */}
      <mesh
        material={capMat}
        position={[0, 0, selected ? -0.01 : 0.01]}
        castShadow
      >
        <cylinderGeometry args={[0.11, 0.11, 0.04, 24]} />
      </mesh>
      {/* Power LED */}
      {isPower && (
        <mesh position={[-0.22, 0, 0.02]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial
            color={powerOn ? "#5aff30" : "#1a3010"}
            emissive={powerOn ? "#5aff30" : "#000000"}
            emissiveIntensity={powerOn ? 1.5 : 0}
            roughness={0.2}
            metalness={0.0}
          />
        </mesh>
      )}
      {/* Engraved label above */}
      <EngravedLabel
        text={label}
        position={[0, 0.22, 0.005]}
        size={0.18}
        fontSize={selected ? 20 : 20}
      />
    </group>
  );
}

/* ===================================================================
   VOLUME KNOB (tall chrome cylinder, knurled, with 0-10 numbers)
   =================================================================== */

function VolumeKnob({
  position,
  value,
  onChange,
  chrome,
  numberedFace,
}: {
  position: [number, number, number];
  value: number;
  onChange: (v: number) => void;
  chrome: THREE.Texture;
  numberedFace: THREE.Texture;
}) {
  const knobRef = useRef<THREE.Group>(null);
  const indicatorRef = useRef<THREE.Mesh>(null);
  const [dragging, setDragging] = useState(false);
  // Value 0-10 → rotation -135 to +135
  const rotZ = ((value - 5) / 10) * (270 * Math.PI) / 180;

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const mesh = indicatorRef.current;
      if (!mesh) return;
      const wp = new THREE.Vector3();
      mesh.parent?.getWorldPosition(wp);
      const cam = (mesh as any).__r3f?.root?.getState?.().camera as THREE.Camera | undefined;
      if (!cam) return;
      const screenPos = wp.clone().project(cam);
      const x = (screenPos.x + 1) / 2 * window.innerWidth;
      const y = (1 - (screenPos.y + 1) / 2) * window.innerHeight;
      const dx = e.clientX - x;
      const dy = -(e.clientY - y);
      let a = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (a > 90) a -= 360;
      a = Math.max(-135, Math.min(135, a));
      const v = Math.round(((a + 135) / 270) * 10);
      onChange(v);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onChange]);

  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: numberedFace,
        roughness: 0.35,
        metalness: 0.7,
        envMapIntensity: 1.2,
      }),
    [numberedFace]
  );
  const knobMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#d8dce0",
        roughness: 0.2,
        metalness: 1.0,
        envMapIntensity: 1.5,
      }),
    [chrome]
  );
  const indicatorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a0a04",
        roughness: 0.3,
        metalness: 0.4,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Base disc with the 0-10 numbers */}
      <mesh material={baseMat} position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
      </mesh>
      {/* "VOLUME" label */}
      <EngravedLabel text="VOLUME" position={[0, 0.35, 0.01]} size={0.3} fontSize={24} />
      {/* The rotating knob body */}
      <group
        ref={knobRef}
        position={[0, 0, 0.03]}
        rotation={[0, 0, rotZ]}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setDragging(true);
        }}
      >
        <mesh material={knobMat} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.1, 32]} />
        </mesh>
        {/* Top cap */}
        <mesh material={knobMat} position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.14, 0.14, 0.01, 32]} />
        </mesh>
        {/* Indicator line */}
        <mesh ref={indicatorRef} material={indicatorMat} position={[0, 0.13, 0.055]}>
          <boxGeometry args={[0.02, 0.06, 0.005]} />
        </mesh>
      </group>
    </group>
  );
}

/* ===================================================================
   SMALL KNOB (bass / treble / balance) — same as volume but shorter
   =================================================================== */

function SmallKnob({
  position,
  label,
  value,
  onChange,
  chrome,
}: {
  position: [number, number, number];
  label: string;
  value: number;
  onChange: (v: number) => void;
  chrome: THREE.Texture;
}) {
  const indicatorRef = useRef<THREE.Mesh>(null);
  const [dragging, setDragging] = useState(false);
  const rotZ = ((value - 5) / 10) * (270 * Math.PI) / 180;

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const mesh = indicatorRef.current;
      if (!mesh) return;
      const wp = new THREE.Vector3();
      mesh.parent?.getWorldPosition(wp);
      const cam = (mesh as any).__r3f?.root?.getState?.().camera as THREE.Camera | undefined;
      if (!cam) return;
      const screenPos = wp.clone().project(cam);
      const x = (screenPos.x + 1) / 2 * window.innerWidth;
      const y = (1 - (screenPos.y + 1) / 2) * window.innerHeight;
      const dx = e.clientX - x;
      const dy = -(e.clientY - y);
      let a = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (a > 90) a -= 360;
      a = Math.max(-135, Math.min(135, a));
      const v = Math.round(((a + 135) / 270) * 10);
      onChange(v);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onChange]);

  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: makeKnobNumberedFace(10),
        roughness: 0.35,
        metalness: 0.7,
        envMapIntensity: 1.2,
      }),
    []
  );
  const knobMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#d8dce0",
        roughness: 0.2,
        metalness: 1.0,
        envMapIntensity: 1.5,
      }),
    [chrome]
  );
  const indicatorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a0a04",
        roughness: 0.3,
        metalness: 0.4,
      }),
    []
  );

  return (
    <group position={position}>
      <mesh material={baseMat} position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.14, 0.14, 0.015, 32]} />
      </mesh>
      <EngravedLabel text={label} position={[0, 0.24, 0.01]} size={0.18} fontSize={18} />
      <group
        position={[0, 0, 0.025]}
        rotation={[0, 0, rotZ]}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setDragging(true);
        }}
      >
        <mesh material={knobMat} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.07, 32]} />
        </mesh>
        <mesh ref={indicatorRef} material={indicatorMat} position={[0, 0.08, 0.04]}>
          <boxGeometry args={[0.015, 0.04, 0.005]} />
        </mesh>
      </group>
    </group>
  );
}

/* ===================================================================
   PHONES JACK (1/4" headphone socket)
   =================================================================== */

function PhonesJack({ position, chrome }: { position: [number, number, number]; chrome: THREE.Texture }) {
  const bezelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#a8acb0",
        roughness: 0.3,
        metalness: 1.0,
        envMapIntensity: 1.2,
      }),
    [chrome]
  );
  return (
    <group position={position}>
      <mesh material={bezelMat}>
        <torusGeometry args={[0.05, 0.012, 12, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
        <meshStandardMaterial color="#0a0402" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ===================================================================
   MINI TOGGLE SWITCH (2-position chrome lever)
   =================================================================== */

function MiniToggleSwitch({
  position,
  label,
  on,
  onChange,
  chrome,
}: {
  position: [number, number, number];
  label: string;
  on: boolean;
  onChange: () => void;
  chrome: THREE.Texture;
}) {
  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2018",
        roughness: 0.5,
        metalness: 0.5,
      }),
    []
  );
  const leverMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#d8dce0",
        roughness: 0.2,
        metalness: 1.0,
        envMapIntensity: 1.4,
      }),
    [chrome]
  );
  return (
    <group position={position} onClick={onChange}>
      {/* Base plate */}
      <mesh material={baseMat} position={[0, 0, 0.005]}>
        <boxGeometry args={[0.18, 0.22, 0.02]} />
      </mesh>
      {/* Lever (pivots) */}
      <group position={[0, on ? 0.05 : -0.05, 0.03]}>
        <mesh material={leverMat} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.2, 16]} />
        </mesh>
        <mesh material={leverMat} position={[0, on ? 0.1 : -0.1, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
        </mesh>
      </group>
      {/* Engraved label above */}
      <EngravedLabel text={label} position={[0, 0.2, 0.01]} size={0.2} fontSize={18} />
      {/* "ON" / "OFF" below */}
      <EngravedLabel text={on ? "ON" : "OFF"} position={[0, -0.2, 0.01]} size={0.15} fontSize={16} />
    </group>
  );
}

/* ===================================================================
   CASSETTE DECK (recessed window with the cassette face)
   =================================================================== */

function CassetteDeck({
  position,
  width,
  height,
  face,
  count,
  chrome,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  face: THREE.Texture;
  count: number;
  chrome: THREE.Texture;
}) {
  const bezelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chrome,
        color: "#b0b4b8",
        roughness: 0.3,
        metalness: 1.0,
        envMapIntensity: 1.2,
      }),
    [chrome]
  );
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: face,
        roughness: 0.7,
        metalness: 0.0,
      }),
    [face]
  );
  const countTex = useMemo(
    () =>
      makeEngravedLabel(String(count).padStart(3, "0"), 32, "#5aff30"),
    [count]
  );
  return (
    <group position={position}>
      {/* Window bezel */}
      <mesh material={bezelMat} position={[0, 0, 0.005]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.04]} />
      </mesh>
      {/* Window well (dark behind the cassette) */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color="#0a0402" roughness={0.9} />
      </mesh>
      {/* Cassette face */}
      <mesh material={faceMat} position={[-width * 0.25, 0, 0.025]}>
        <planeGeometry args={[width * 0.55, height * 0.75]} />
      </mesh>
      {/* Tape counter display (right side) */}
      <mesh position={[width * 0.3, 0, 0.025]}>
        <planeGeometry args={[width * 0.25, height * 0.4]} />
        <meshStandardMaterial map={countTex} transparent emissive="#5aff30" emissiveIntensity={0.4} />
      </mesh>
      {/* "TAPE COUNTER" label above the counter */}
      <EngravedLabel
        text="TAPE COUNTER"
        position={[width * 0.3, height * 0.35, 0.025]}
        size={0.13}
        fontSize={14}
      />
    </group>
  );
}