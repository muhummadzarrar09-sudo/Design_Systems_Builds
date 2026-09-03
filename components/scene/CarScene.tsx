"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useState } from "react";
import { CarModel } from "./CarModel";

/* Factory paint options (from press fleet) */
const PAINTS = [
  { id: "sage", c: "#9fb8a8" },
  { id: "grey", c: "#797c80" },
  { id: "black", c: "#141516" },
  { id: "white", c: "#e9ebec" },
  { id: "sand", c: "#c0b193" },
];

/* Turntable that yields to the user on first interaction */
function ShowcaseControls() {
  const controls = useThree((s) => s.controls) as unknown as {
    autoRotate: boolean;
    addEventListener: (t: string, f: () => void) => void;
  } | null;
  useEffect(() => {
    if (!controls) return;
    controls.autoRotate = true;
    const stop = () => (controls.autoRotate = false);
    controls.addEventListener("start", stop);
  }, [controls]);
  return null;
}

function Rig({ night }: { night: boolean }) {
  return (
    <>
      <color attach="background" args={[night ? "#070a10" : "#b8c4cc"]} />
      {!night && <Sky sunPosition={[80, 28, 60]} turbidity={5} rayleigh={1.6} />}
      <ambientLight intensity={night ? 0.12 : 0.35} color={night ? "#3a4a66" : "#dfe8ee"} />
      <directionalLight
        castShadow
        position={night ? [-5, 8, -3] : [7, 9, 5]}
        intensity={night ? 0.35 : 3.0}
        color={night ? "#7a90b8" : "#fff2df"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3, -4]} intensity={night ? 0.12 : 0.6} color="#a8c0d8" />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={night ? 0.5 : 2.0} color="#ffffff" position={[0, 8, 0]} scale={[14, 8, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer intensity={night ? 0.35 : 1.4} color="#e8f0f8" position={[8, 2, 4]} scale={[8, 3, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer intensity={night ? 0.3 : 1.0} color="#c8d8e8" position={[-8, 2, -4]} scale={[8, 3, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
        </Environment>
      </Suspense>
    </>
  );
}

export function CarScene() {
  const [night, setNight] = useState(false);
  const [paint, setPaint] = useState(PAINTS[0].c);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [5.8, 1.9, 6.4], fov: 42 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <Rig night={night} />

        {/* Polished concrete plaza — soft mirror for the hero shot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[90, 64]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={night ? 0.85 : 0.55}
            mixContrast={1.1}
            roughness={0.75}
            metalness={0.15}
            depthScale={0.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.5}
            color={night ? "#101318" : "#b4b7b9"}
          />
        </mesh>

        <Suspense fallback={null}>
          <CarModel paint={paint} night={night} />
        </Suspense>

        <ShowcaseControls />
        <OrbitControls
          makeDefault
          enablePan={false}
          target={[0, 0.78, 0]}
          minDistance={3.2}
          maxDistance={18}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2 - 0.03}
          autoRotateSpeed={0.7}
          enableDamping
          dampingFactor={0.08}
        />

        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={night ? 0.9 : 0.55} luminanceThreshold={1.0} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette eskil={false} offset={0.15} darkness={night ? 0.6 : 0.45} />
        </EffectComposer>
      </Canvas>

      {/* Minimal configurator strip — paint dots + day/night */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 18,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(10,12,14,0.35)",
            backdropFilter: "blur(8px)",
            pointerEvents: "auto",
          }}
        >
          {PAINTS.map((p) => (
            <button
              key={p.id}
              aria-label={p.id}
              onClick={() => setPaint(p.c)}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: p.c,
                border: paint === p.c ? "2px solid #fff" : "2px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)" }} />
          <button
            aria-label="day-night"
            onClick={() => setNight((n) => !n)}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: night ? "linear-gradient(90deg,#0a0e18 50%,#f4e9c8 50%)" : "linear-gradient(90deg,#f4e9c8 50%,#0a0e18 50%)",
              boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.5)",
              padding: 0,
            }}
          />
        </div>
      </div>
    </>
  );
}
