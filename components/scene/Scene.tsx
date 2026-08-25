"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import { HiFi } from "./HiFi";

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 8.5], fov: 38 }}
      gl={{ antialias: true, toneMappingExposure: 1.0 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#0a0604"]} />
      <fog attach="fog" args={["#0a0604", 12, 24]} />

      <ambientLight intensity={0.3} color="#a89878" />

      {/* Warm key light from upper-right (matches the reference image's lighting) */}
      <directionalLight
        castShadow
        position={[4, 4, 5]}
        intensity={2.4}
        color="#ffe8c0"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      {/* Cool fill from the left */}
      <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#88a0c0" />

      {/* Warm back-rim */}
      <directionalLight position={[0, 1, -4]} intensity={0.4} color="#ffb060" />

      {/* IBL for proper chrome / aluminum reflections */}
      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.8} />
      </Suspense>

      <Suspense fallback={null}>
        <HiFi />
      </Suspense>

      {/* Soft contact shadow under the unit */}
      <ContactShadows
        position={[0, -1.75, 0]}
        opacity={0.6}
        scale={14}
        blur={2.8}
        far={2}
        resolution={1024}
        color="#000000"
      />

      <OrbitControls
        enablePan={false}
        minDistance={5.5}
        maxDistance={14}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
