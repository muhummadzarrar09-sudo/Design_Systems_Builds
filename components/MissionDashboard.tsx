"use client";

import Link from "next/link";
import { STYLES, type StyleMeta } from "@/lib/styles";
import MissionClock from "./MissionClock";
import TrajectoryChart from "./TrajectoryChart";

const STATS = [
  { label: "Altitude", value: "412 km", delta: "+0.8 km" },
  { label: "Velocity", value: "27,580 km/h", delta: "−12 km/h" },
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

const NAV = ["Overview", "Telemetry", "Crew", "Logs", "Settings"];

/**
 * Mission Control dashboard — one shared structure, re-skinned per
 * design system via the theme--{slug} class + CSS tokens.
 */
export default function MissionDashboard({ style }: { style: StyleMeta }) {
  return (
    <div className={`dash theme--${style.slug}`}>
      <aside className="dash-side">
        <div className="dash-logo" aria-hidden="true">
          Z<span>//MC</span>
        </div>
        <nav className="dash-nav" aria-label="Dashboard sections">
          {NAV.map((n, i) => (
            <button type="button" key={n} className={i === 0 ? "active" : ""}>
              {n}
            </button>
          ))}
        </nav>
        <div className="dash-side-foot">
          <p>aurora-9 · orbit 412 km</p>
          <Link className="dash-back" href="/">
            ← all styles
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-head">
          <div>
            <p className="dash-kicker">Mission control</p>
            <h1 className="dash-title">Aurora-9</h1>
            <span className="dash-status">
              <i aria-hidden="true" /> live telemetry
            </span>
          </div>
          <div className="dash-head-right">
            <MissionClock />
            <button type="button" className="dash-btn dash-btn--primary">
              Engage
            </button>
            <button type="button" className="dash-btn">
              Abort
            </button>
          </div>
        </header>

        <section className="dash-grid" aria-label="Key statistics">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-delta">{s.delta}</span>
            </div>
          ))}
        </section>

        <section className="dash-panels">
          <div className="panel panel--chart">
            <div className="panel-head">
              <h3>Trajectory · last 90 s</h3>
              <span className="panel-note">alt vs time</span>
            </div>
            <TrajectoryChart />
          </div>

          <div className="panel panel--telemetry">
            <h3>Subsystems</h3>
            <ul className="telemetry">
              {TELEMETRY.map((t) => (
                <li key={t.sub}>
                  <span className="t-sub">{t.sub}</span>
                  <span className="t-dot" data-ok={t.ok} aria-hidden="true" />
                  <span className="t-val">{t.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <nav className="dash-themes" aria-label="Switch design system">
          <span className="dash-themes-label">Style</span>
          {STYLES.map((s) => (
            <Link
              key={s.slug}
              href={`/dash/${s.slug}`}
              className={s.slug === style.slug ? "active" : ""}
            >
              {s.name}
            </Link>
          ))}
        </nav>
      </main>

      {style.slug === "material" && (
        <button type="button" className="dash-fab" aria-label="Quick action">
          ▶
        </button>
      )}
    </div>
  );
}
