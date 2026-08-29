"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useEffect } from "react";
import { CarModel } from "./CarModel";

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

export function CarScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [5.8, 1.9, 6.4], fov: 42 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#b8c4cc"]} />

      {/* Sun + sky, like the seaside press shots */}
      <Sky sunPosition={[80, 28, 60]} turbidity={5} rayleigh={1.6} />
      <ambientLight intensity={0.35} color="#dfe8ee" />
      <directionalLight
        castShadow
        position={[7, 9, 5]}
        intensity={3.0}
        color="#fff2df"
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
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#a8c0d8" />

      {/* Studio reflections for the paint & glass */}
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.0} color="#ffffff" position={[0, 8, 0]} scale={[14, 8, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer intensity={1.4} color="#e8f0f8" position={[8, 2, 4]} scale={[8, 3, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
          <Lightformer intensity={1.0} color="#c8d8e8" position={[-8, 2, -4]} scale={[8, 3, 1]} onUpdate={(m) => m.lookAt(0, 0, 0)} />
        </Environment>
      </Suspense>

      {/* Polished concrete plaza — soft mirror for the hero shot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[90, 64]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.55}
          mixContrast={1.1}
          roughness={0.75}
          metalness={0.15}
          depthScale={0.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.5}
          color="#b4b7b9"
        />
      </mesh>

      <Suspense fallback={null}>
        <CarModel />
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
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={1.0} luminanceSmoothing={0.2} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.15} darkness={0.45} />
      </EffectComposer>
    </Canvas>
  );
}
