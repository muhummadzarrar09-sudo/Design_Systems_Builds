"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { HiFi } from "./HiFi";
import { makeDeskWood } from "@/lib/textures";

export function Scene() {
  const deskTex = useMemo(() => {
    const t = makeDeskWood();
    t.repeat.set(3, 2);
    return t;
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.25, 9.9], fov: 40 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#0b0908"]} />
      <fog attach="fog" args={["#0b0908", 15, 30]} />

      {/* Warm key from upper-right, like the photo's side-light */}
      <ambientLight intensity={0.28} color="#a89878" />
      <directionalLight
        castShadow
        position={[4.5, 4, 6]}
        intensity={2.6}
        color="#ffd9a8"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={25}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* Cool fill from the left */}
      <directionalLight position={[-6, 2, 4]} intensity={0.5} color="#90a8c8" />
      {/* Warm rim from behind/above */}
      <directionalLight position={[0, 5, -6]} intensity={0.6} color="#ffb060" />

      {/* Local studio environment for chrome/aluminum reflections (no network) */}
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#ffe8c8" position={[0, 6, 0]} scale={[10, 5, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer form="rect" intensity={3.0} color="#ffd9a0" position={[8, 2, 4]} scale={[6, 3, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer form="rect" intensity={1.1} color="#a8c0e0" position={[-8, 1, 3]} scale={[5, 2, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 3, 8]} scale={[8, 1.5, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer form="rect" intensity={0.8} color="#ff9040" position={[0, -4, 6]} scale={[8, 2, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
        </Environment>
      </Suspense>

      <Suspense fallback={null}>
        <HiFi />
      </Suspense>

      {/* Wood desk the receiver sits on */}
      <mesh position={[0, -2.35, 0]} receiveShadow>
        <boxGeometry args={[36, 0.5, 20]} />
        <meshStandardMaterial map={deskTex} roughness={0.34} metalness={0.05} envMapIntensity={0.5} />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.56}
        target={[0, -0.15, 0]}
        enableDamping
        dampingFactor={0.08}
      />

      {/* Glow for the backlight / LED / needles + filmic grade */}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1.0} luminanceSmoothing={0.25} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.22} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
