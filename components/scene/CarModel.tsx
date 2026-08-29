"use client";

/* ===================================================================
   CarModel — drop-in slot for the REAL Jetour T1 asset.
   If /models/jetour-t1.glb exists (see public/models/README.md) it is
   loaded, auto-scaled to the true 4.705 m length, grounded and centered.
   Otherwise the research-built procedural JetourT1 is used.
   =================================================================== */

import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { JetourT1 } from "./JetourT1";

export const GLB_URL = "/models/jetour-t1.glb";
const TRUE_LENGTH = 4.705;

function RealGltf() {
  const { scene } = useGLTF(GLB_URL);
  const normalized = useMemo(() => {
    // orient: longest horizontal axis becomes +Z (car length)
    const raw = new THREE.Box3().setFromObject(scene);
    const rawSize = raw.getSize(new THREE.Vector3());
    if (rawSize.x > rawSize.z) scene.rotation.y = Math.PI / 2;
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = TRUE_LENGTH / size.z;
    scene.scale.setScalar(scale);
    scene.updateMatrixWorld(true);

    const box2 = new THREE.Box3().setFromObject(scene);
    const center2 = box2.getCenter(new THREE.Vector3());
    scene.position.x -= center2.x;
    scene.position.z -= center2.z;
    scene.position.y -= box2.min.y; // sit on the plaza
    scene.updateMatrixWorld(true);

    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return scene;
  }, [scene]);
  return <primitive object={normalized} />;
}

export function CarModel() {
  const [mode, setMode] = useState<"checking" | "glb" | "procedural">("checking");
  useEffect(() => {
    let on = true;
    fetch(GLB_URL, { method: "HEAD" })
      .then((r) => on && setMode(r.ok ? "glb" : "procedural"))
      .catch(() => on && setMode("procedural"));
    return () => {
      on = false;
    };
  }, []);

  if (mode === "glb")
    return (
      <Suspense fallback={<JetourT1 />}>
        <RealGltf />
      </Suspense>
    );
  return <JetourT1 />;
}
