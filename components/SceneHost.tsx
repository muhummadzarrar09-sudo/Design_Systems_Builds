"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene/Scene").then((m) => m.Scene), {
  ssr: false,
  loading: () => <div className="loading">WARMING UP THE RECEIVER…</div>,
});

export default function SceneHost() {
  return (
    <div className="scene-host">
      <Scene />
    </div>
  );
}
