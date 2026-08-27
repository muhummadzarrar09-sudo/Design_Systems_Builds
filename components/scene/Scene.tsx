"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { HiFi } from "./HiFi";
import { makeDeskWood } from "@/lib/textures";

const CAM_TARGET = new THREE.Vector3(0, 0.2, 10.8);

/* Gentle dolly-in on load; hands over to OrbitControls on first input */
function CameraIntro() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  const done = useRef(false);

  useEffect(() => {
    if (controls && !done.current) controls.enabled = false;
  }, [controls]);

  useEffect(() => {
    const finish = () => {
      if (!done.current) {
        done.current = true;
        if (controls) controls.enabled = true;
      }
    };
    const el = gl.domElement;
    el.addEventListener("pointerdown", finish);
    el.addEventListener("wheel", finish);
    return () => {
      el.removeEventListener("pointerdown", finish);
      el.removeEventListener("wheel", finish);
    };
  }, [gl, controls]);

  useFrame((st, dt) => {
    if (done.current) return;
    camera.position.lerp(CAM_TARGET, Math.min(1, dt * 2.0));
    camera.lookAt(0, -0.2, 0);
    if (st.clock.elapsedTime > 3 || camera.position.distanceTo(CAM_TARGET) < 0.04) {
      done.current = true;
      if (controls) controls.enabled = true;
    }
  });
  return null;
}

export function Scene() {
  const deskTex = useMemo(() => {
    const t = makeDeskWood();
    t.repeat.set(3, 2);
    return t;
  }, []);
  const deskEdgeTex = useMemo(() => {
    const t = makeDeskWood();
    t.repeat.set(4, 1);
    return t;
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.8, 13.8], fov: 40 }}
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

      {/* Studio backdrop wall (catches the rim light like the photo) */}
      <mesh position={[0, 4, -7]}>
        <planeGeometry args={[70, 30]} />
        <meshStandardMaterial color="#191512" roughness={0.95} metalness={0} />
      </mesh>
      {/* Soft halo pool on the wall behind the unit */}
      <spotLight
        position={[0, 3, -2.5]}
        angle={0.8}
        penumbra={1}
        intensity={45}
        color="#b89878"
        onUpdate={(s) => {
          s.target.position.set(0, 2, -7);
          s.target.updateMatrixWorld();
        }}
      />

      {/* Wood desk with a blurred reflection of the receiver */}
      <mesh position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 24]} />
        <MeshReflectorMaterial
          map={deskTex}
          blur={[280, 90]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.1}
          mixContrast={1.2}
          roughness={0.6}
          metalness={0.25}
          depthScale={0.3}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.5}
          color="#6a4a2c"
        />
      </mesh>
      {/* Desk edge below the polished top */}
      <mesh position={[0, -2.72, 0]}>
        <boxGeometry args={[40, 0.5, 24]} />
        <meshStandardMaterial map={deskEdgeTex} color="#8a5a34" roughness={0.5} metalness={0.05} />
      </mesh>

      <CameraIntro />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.56}
        target={[0, -0.2, 0]}
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
