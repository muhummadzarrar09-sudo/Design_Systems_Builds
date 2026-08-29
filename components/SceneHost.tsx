"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene/CarScene").then((m) => m.CarScene), {
  ssr: false,
  loading: () => null,
});

export default function SceneHost() {
  return (
    <div className="scene-host">
      <Scene />
    </div>
  );
}
