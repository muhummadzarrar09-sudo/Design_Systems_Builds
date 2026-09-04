"use client";

/* ===================================================================
   JETOUR T1 — studio showcase canvas.
   Two lighting presets (day / night) are kept switchable at all times.
   =================================================================== */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
  PerformanceMonitor,
  Sky,
  useProgress,
} from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CarModel } from "./CarModel";

/* Factory paint options (press-fleet colours) */
const PAINTS = [
  { id: "Sage Green", c: "#93b3a1" },
  { id: "Graphite", c: "#6d7175" },
  { id: "Phantom Black", c: "#15171a" },
  { id: "Glacier White", c: "#e6e8e9" },
  { id: "Desert Sand", c: "#bdae91" },
  { id: "Deep Sea", c: "#2f4a63" },
];

const VIEWS = [
  { id: "3/4", pos: [5.45, 1.85, 5.9], target: [0, 0.82, 0] },
  { id: "Side", pos: [8.2, 1.28, 0.15], target: [0, 0.86, 0] },
  { id: "Rear", pos: [-5.3, 1.95, -6.0], target: [0, 0.86, 0] },
  { id: "Front", pos: [0.35, 1.45, 7.9], target: [0, 0.9, 0] },
  { id: "Wheel", pos: [3.05, 0.95, 3.35], target: [0.84, 0.6, 1.3] },
  { id: "Cabin", pos: [1.75, 1.5, 2.75], target: [0.15, 1.12, 0.35] },
] as const;

/* ── turntable that yields to the user on first interaction ── */
function ShowcaseControls({ autoRotate }: { autoRotate: boolean }) {
  const controls = useThree((s) => s.controls) as unknown as
    | { autoRotate: boolean; addEventListener: (t: string, f: () => void) => void }
    | null;
  useEffect(() => {
    if (!controls) return;
    controls.autoRotate = autoRotate;
  }, [controls, autoRotate]);
  return null;
}

/* ── smooth camera moves for the view presets ── */
function CameraDirector({ view }: { view: number }) {
  const { camera, controls } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: { target: THREE.Vector3; update: () => void; addEventListener: (t: string, f: () => void) => void } | null;
  };
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);

  useEffect(() => {
    const v = VIEWS[view];
    if (!v) return;
    goal.current = {
      pos: new THREE.Vector3(...(v.pos as unknown as [number, number, number])),
      target: new THREE.Vector3(...(v.target as unknown as [number, number, number])),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (!controls) return;
    const cancel = () => (goal.current = null);
    controls.addEventListener("start", cancel);
  }, [controls]);

  useFrame((_, dt) => {
    if (!goal.current) return;
    const k = 1 - Math.pow(0.0015, Math.min(dt, 0.05));
    camera.position.lerp(goal.current.pos, k);
    if (controls) {
      controls.target.lerp(goal.current.target, k);
      controls.update();
    }
    if (camera.position.distanceTo(goal.current.pos) < 0.015) goal.current = null;
  });
  return null;
}

/* ── lighting rig: everything blends smoothly between day and night ── */
function Rig({ night }: { night: boolean }) {
  const blend = useRef(0); // 0 = day, 1 = night
  const { scene } = useThree();
  const amb = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const bg = useMemo(() => new THREE.Color("#b8c4cc"), []);
  const bgNight = useMemo(() => new THREE.Color("#05070c"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const t = 1 - Math.pow(0.001, Math.min(dt, 0.05));
    blend.current += ((night ? 1 : 0) - blend.current) * t;
    const b = blend.current;
    tmp.copy(bg).lerp(bgNight, b);
    scene.background = tmp;
    if (amb.current) amb.current.intensity = 0.35 + (0.1 - 0.35) * b;
    if (key.current) {
      key.current.intensity = 3.1 + (0.45 - 3.1) * b;
      key.current.color.setRGB(1, 0.95 - 0.03 * b, 0.88 - 0.06 * b).lerp(new THREE.Color("#8fa8d8"), b * 0.75);
    }
    if (fill.current) fill.current.intensity = 0.55 + (0.16 - 0.55) * b;
    if (rim.current) rim.current.intensity = 0.2 + (0.85 - 0.2) * b;
    void b;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.35} color={night ? "#3d4c66" : "#dfe8ee"} />
      <directionalLight
        ref={key}
        castShadow
        position={[6.5, 9.5, 5.5]}
        intensity={3.1}
        color="#fff3e2"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={5.5}
        shadow-camera-bottom={-5.5}
        shadow-camera-near={0.5}
        shadow-camera-far={26}
        shadow-bias={-0.00035}
        shadow-normalBias={0.022}
      />
      <directionalLight ref={fill} position={[-7, 3.4, -4.5]} intensity={0.55} color="#a9c2da" />
      <directionalLight ref={rim} position={[-2.5, 4.5, -8.5]} intensity={0.2} color="#7fb0ff" />

      <Suspense fallback={null}>
        <Environment key={night ? "night" : "day"} resolution={512} frames={1} background={false}>
          {/* soft overhead box — the main roof reflection */}
          <Lightformer
            form="rect"
            intensity={night ? 0.55 : 2.1}
            color={night ? "#b9cdf2" : "#ffffff"}
            position={[0, 7.5, 0.5]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[12, 7, 1]}
          />
          {/* long flank strips — the signature highlight down each side */}
          <Lightformer
            form="rect"
            intensity={night ? 0.45 : 1.5}
            color={night ? "#9fc0ff" : "#eaf2ff"}
            position={[6, 2.6, 2]}
            scale={[10, 1.4, 1]}
            onUpdate={(m) => m.lookAt(0, 1, 0)}
          />
          <Lightformer
            form="rect"
            intensity={night ? 0.35 : 1.1}
            color={night ? "#8fb2e8" : "#cddff2"}
            position={[-6, 2.6, -2]}
            scale={[10, 1.4, 1]}
            onUpdate={(m) => m.lookAt(0, 1, 0)}
          />
          {/* cool rim from behind + a warm bounce from the floor */}
          <Lightformer
            form="rect"
            intensity={night ? 0.9 : 0.5}
            color="#9fc4ff"
            position={[0, 2.2, -7]}
            scale={[8, 2.5, 1]}
            onUpdate={(m) => m.lookAt(0, 1, 0)}
          />
          <Lightformer
            form="circle"
            intensity={night ? 0.25 : 0.7}
            color={night ? "#1b2a44" : "#8e949a"}
            position={[0, -3, 0]}
            scale={[14, 14, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </Environment>
      </Suspense>

      {/* day sky (hidden at night — the background colour takes over) */}
      {!night && (
        <Sky sunPosition={[80, 26, 60]} turbidity={5} rayleigh={1.4} mieCoefficient={0.005} mieDirectionalG={0.8} />
      )}
    </>
  );
}

/* ── studio floor ── */
function Plaza({ night }: { night: boolean }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[70, 96]} />
        <MeshReflectorMaterial
          resolution={1024}
          blur={[420, 140]}
          mixBlur={1.1}
          mixStrength={night ? 2.6 : 1.35}
          mixContrast={1.05}
          roughness={night ? 0.72 : 0.82}
          metalness={0.28}
          depthScale={0.35}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.6}
          depthToBlurRatioBias={0.3}
          color={night ? "#0d1014" : "#9fa3a6"}
          mirror={0.35}
        />
      </mesh>
      {/* a slightly lighter podium ring so the car never floats on nothing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[3.4, 3.55, 96]} />
        <meshBasicMaterial color={night ? "#1d2a3a" : "#c9ced2"} transparent opacity={0.5} />
      </mesh>
      <ContactShadows
        position={[0, 0.012, 0]}
        scale={11}
        resolution={1024}
        blur={2.6}
        opacity={night ? 0.75 : 0.62}
        far={2.2}
        frames={Infinity}
        color="#05070a"
      />
    </>
  );
}

/* ── loading veil ── */
function LoadingVeil() {
  const { active, progress } = useProgress();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!active) {
      const t = setTimeout(() => setHidden(true), 350);
      return () => clearTimeout(t);
    }
    setHidden(false);
  }, [active]);
  if (hidden) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "#080a0d",
        color: "#cfd6dc",
        font: "500 12px/1.4 ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity: active ? 1 : 0,
        transition: "opacity .4s ease",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      JETOUR T1 · {Math.round(progress)}%
    </div>
  );
}

/* ── UI helpers ── */
const pill: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 12px",
  borderRadius: 999,
  background: "rgba(12,14,17,0.42)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.12)",
  pointerEvents: "auto",
};

const viewBtn = (on: boolean): React.CSSProperties => ({
  border: "none",
  background: on ? "rgba(255,255,255,0.92)" : "transparent",
  color: on ? "#0d0f12" : "rgba(255,255,255,0.72)",
  borderRadius: 999,
  padding: "5px 11px",
  font: "600 10.5px/1 ui-sans-serif, system-ui, -apple-system, sans-serif",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  cursor: "pointer",
});

export function CarScene() {
  const [night, setNight] = useState(false);
  const [paint, setPaint] = useState(PAINTS[0].c);
  const [view, setView] = useState(0);
  const [spin, setSpin] = useState(true);
  const [dpr, setDpr] = useState(1.6);

  return (
    <>
      <Canvas
        shadows="soft"
        camera={{ position: [5.45, 1.85, 5.9], fov: 38 }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        dpr={dpr}
      >
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(2, dpr + 0.25))}
          onDecline={() => setDpr(Math.max(1, dpr - 0.35))}
        />
        <AdaptiveDpr pixelated />

        <Rig night={night} />
        <Plaza night={night} />

        <Suspense fallback={null}>
          <CarModel paint={paint} night={night} />
        </Suspense>

        <ShowcaseControls autoRotate={spin} />
        <CameraDirector view={view} />
        <OrbitControls
          makeDefault
          enablePan={false}
          target={[0, 0.82, 0]}
          minDistance={2.6}
          maxDistance={18}
          minPolarAngle={0.12}
          maxPolarAngle={Math.PI / 2 - 0.02}
          autoRotateSpeed={0.65}
          enableDamping
          dampingFactor={0.075}
        />

        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={night ? 1.15 : 0.5} luminanceThreshold={1.02} luminanceSmoothing={0.22} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette eskil={false} offset={0.18} darkness={night ? 0.62 : 0.42} />
        </EffectComposer>
      </Canvas>

      <LoadingVeil />

      {/* ── minimal configurator strip ── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
          pointerEvents: "none",
          flexWrap: "wrap",
          padding: "0 12px",
        }}
      >
        <div style={pill}>
          {PAINTS.map((p) => (
            <button
              key={p.id}
              title={p.id}
              aria-label={p.id}
              onClick={() => setPaint(p.c)}
              style={{
                width: 19,
                height: 19,
                borderRadius: "50%",
                background: p.c,
                border: paint === p.c ? "2px solid #fff" : "2px solid rgba(255,255,255,0.22)",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={pill}>
          {VIEWS.map((v, i) => (
            <button key={v.id} onClick={() => setView(i)} style={viewBtn(view === i)}>
              {v.id}
            </button>
          ))}
          <button onClick={() => setSpin((s) => !s)} style={viewBtn(spin)} title="Turntable">
            Spin
          </button>
        </div>

        <div style={pill}>
          <button
            aria-label="day-night"
            onClick={() => setNight((n) => !n)}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: night
                ? "linear-gradient(90deg,#050810 50%,#f2e7c4 50%)"
                : "linear-gradient(90deg,#f2e7c4 50%,#050810 50%)",
              boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.55)",
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* caption */}
      <div
        style={{
          position: "fixed",
          left: 22,
          top: 20,
          zIndex: 10,
          pointerEvents: "none",
          color: night ? "rgba(226,234,242,0.9)" : "rgba(20,24,28,0.82)",
          font: "600 13px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif",
          letterSpacing: "0.04em",
        }}
      >
        JETOUR&nbsp;T1
        <div style={{ font: "500 10.5px/1.6 ui-sans-serif, system-ui, sans-serif", opacity: 0.68, letterSpacing: "0.16em" }}>
          4705 × 1967 × 1843 · WB 2800
        </div>
      </div>
    </>
  );
}
