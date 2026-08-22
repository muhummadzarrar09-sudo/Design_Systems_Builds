"use client";

import type { StyleMeta } from "@/lib/styles";
import MissionClock from "./MissionClock";
import ShowcaseChart from "./ShowcaseChart";

const STATS = [
  { label: "Altitude", value: "412 km", delta: "+0.8 km" },
  { label: "Velocity", value: "27,580", delta: "km/h · −12" },
  { label: "Fuel", value: "68%", delta: "−0.4%/min" },
  { label: "Signal", value: "99.2%", delta: "stable" },
];

const TELEMETRY = [
  { sub: "Propulsion", value: "NOMINAL", ok: true },
  { sub: "Thermal", value: "NOMINAL", ok: true },
  { sub: "Power", value: "−4%", ok: true },
  { sub: "Life support", value: "WARN", ok: false },
  { sub: "Comms", value: "LINK", ok: true },
];

/**
 * One Instagram-ready carousel slide: the Mission Control dashboard
 * recomposed at 4:5 and dressed in the given design system.
 */
export default function ShowcaseSlide({
  style,
  index,
}: {
  style: StyleMeta;
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className={`slide theme--${style.slug}`}>
      {/* top bar */}
      <header className="slide-head">
        <div className="slide-brand">
          <span className="slide-mark" aria-hidden="true">
            Z
          </span>
          <span className="slide-brand-text">
            Design Systems
            <em>Builds</em>
          </span>
        </div>
        <div className="slide-head-right">
          <MissionClock className="slide-clock" />
          <span className="slide-num">{num} / 07</span>
        </div>
      </header>

      {/* title block */}
      <section className="slide-title">
        <h1>{style.name}</h1>
        <p>{style.desc}</p>
        <span className="slide-tag">{style.tag}</span>
      </section>

      {/* stats */}
      <section className="slide-stats">
        {STATS.map((s, i) => (
          <div className={`sstat${style.slug === "skeu" && i === 0 ? " sstat--gauge" : ""}`} key={s.label}>
            <span className="sstat-label">{s.label}</span>
            <span className="sstat-value">{s.value}</span>
            <span className="sstat-delta">{s.delta}</span>
          </div>
        ))}
      </section>

      {/* chart */}
      <section className="s-panel s-panel--chart">
        <div className="s-panel-head">
          <h3>Trajectory · last 90 s</h3>
          <span className="s-panel-note">alt vs time</span>
        </div>
        <ShowcaseChart />
      </section>

      {/* telemetry */}
      <section className="s-panel s-panel--tele">
        <h3>Subsystems</h3>
        <ul className="stele">
          {TELEMETRY.map((t) => (
            <li key={t.sub}>
              <span className="stele-sub">{t.sub}</span>
              <span className="stele-dot" data-ok={t.ok} aria-hidden="true" />
              <span className="stele-val">{t.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* footer */}
      <footer className="slide-foot">
        <span>Aurora-9 · Mission Control</span>
        <span>Design Systems Builds — {num}/07</span>
      </footer>
    </div>
  );
}
