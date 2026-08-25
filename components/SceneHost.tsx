"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene/Scene").then((m) => m.Scene), {
  ssr: false,
  loading: () => <div className="loading">WARMING UP THE RECEIVER…</div>,
});

export default function SceneHost() {
  return (
    <div className="scene-host">
      <div className="hud hud-top">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-text">SKEUO · HI-FI</span>
        </div>
        <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, letterSpacing: "0.25em", color: "#b89a6a", textTransform: "uppercase" }}>
          MODEL MK·VII · STEREO RECEIVER
        </div>
      </div>

      <Scene />

      <div className="hud hud-bottom">
        <div className="hud-hint">
          <b>DRAG</b> TO ORBIT · <b>SCROLL</b> TO ZOOM · <b>DRAG</b> KNOBS &amp; TUNER
        </div>
        <div className="hud-hint">SKEUO · HI-FI · 1970s STEREO RECEIVER</div>
      </div>
    </div>
  );
}
