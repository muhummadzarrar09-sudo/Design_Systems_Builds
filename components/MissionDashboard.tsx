"use client";

import { useState } from "react";
import Link from "next/link";
import { STYLES, type StyleMeta } from "@/lib/styles";
import { CREW, LOGS, SUBSYSTEMS } from "@/lib/mission";
import { useTelemetry } from "@/lib/telemetry";
import MissionClock from "./MissionClock";
import TrajectoryChart from "./TrajectoryChart";
import SpaceViewport from "./SpaceViewport";

const NAV = ["Overview", "Telemetry", "Crew", "Logs", "Settings"] as const;
type NavId = (typeof NAV)[number];

export default function MissionDashboard({ style }: { style: StyleMeta }) {
  const [view, setView] = useState<NavId>("Overview");
  const [engaging, setEngaging] = useState(false);
  const t = useTelemetry();

  const engage = () => {
    if (engaging) return;
    setEngaging(true);
    window.setTimeout(() => setEngaging(false), 2200);
  };

  const stats = [
    { label: "Altitude", value: `${t.altitude} km`, delta: "+0.6 km" },
    { label: "Velocity", value: `${t.velocity} km/h`, delta: "−12 km/h" },
    { label: "Fuel", value: `${t.fuel}%`, delta: "−0.4%/min" },
    { label: "Signal", value: `${t.signal}%`, delta: "stable" },
  ];

  return (
    <div className={`dash theme--${style.slug}`}>
      <aside className="dash-side">
        <div className="dash-logo" aria-hidden="true">
          Z<span>//MC</span>
        </div>
        <nav className="dash-nav" aria-label="Dashboard sections">
          {NAV.map((n) => (
            <button
              type="button"
              key={n}
              className={n === view ? "active" : ""}
              aria-current={n === view ? "page" : undefined}
              onClick={() => setView(n)}
            >
              {n}
            </button>
          ))}
        </nav>
        <div className="dash-side-foot">
          <p>aurora-9 · orbit {t.altitude} km</p>
          <Link className="dash-back" href="/states">
            states spec →
          </Link>
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
            <button
              type="button"
              className="dash-btn dash-btn--primary"
              onClick={engage}
              disabled={engaging}
            >
              {engaging ? (
                <>
                  <span className="spin" aria-hidden="true" />
                  Engaging…
                </>
              ) : (
                "Engage"
              )}
            </button>
            <button type="button" className="dash-btn">
              Abort
            </button>
          </div>
        </header>

        {view === "Overview" && (
          <>
            <section className="dash-grid" aria-label="Key statistics">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-delta">{s.delta}</span>
                </div>
              ))}
            </section>

            <section className="dash-panels">
              <div className="panel panel--view">
                <div className="panel-head">
                  <h3>Viewport · Aurora-9</h3>
                  <span className="panel-note">earth · orbit · live</span>
                </div>
                <SpaceViewport style={style} />
              </div>

              <div className="panel panel--chart">
                <div className="panel-head">
                  <h3>Trajectory · last 90 s</h3>
                  <span className="panel-note">alt vs time</span>
                </div>
                <TrajectoryChart />
              </div>

              <div className="panel panel--telemetry">
                <h3>Subsystems</h3>
                <SubsystemList />
              </div>
            </section>
          </>
        )}

        {view === "Telemetry" && (
          <>
            <section className="dash-grid" aria-label="Key statistics">
              {stats.map((s) => (
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
                  <h3>Altitude profile</h3>
                  <span className="panel-note">450 km target</span>
                </div>
                <TrajectoryChart />
              </div>
              <div className="panel panel--telemetry">
                <h3>Subsystems</h3>
                <SubsystemList />
              </div>
              <div className="panel panel--view">
                <div className="panel-head">
                  <h3>Orbit</h3>
                  <span className="panel-note">live</span>
                </div>
                <SpaceViewport style={style} />
              </div>
            </section>
          </>
        )}

        {view === "Crew" && (
          <section className="dash-panels">
            <div className="panel panel--crew-full">
              <div className="panel-head">
                <h3>Crew</h3>
                <span className="panel-note">{CREW.length} on board</span>
              </div>
              <ul className="crew">
                {CREW.map((c) => (
                  <li key={c.name} data-status={c.status}>
                    <i aria-hidden="true">{c.name[0]}</i>
                    <div>
                      <b>
                        {c.role} {c.name}
                      </b>
                      <span>{c.note}</span>
                    </div>
                    <em>{c.status}</em>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {view === "Logs" && (
          <section className="dash-panels">
            <div className="panel panel--logs-full">
              <div className="panel-head">
                <h3>Event log</h3>
                <span className="panel-note">downlink</span>
              </div>
              <ol className="logs">
                {LOGS.map((l) => (
                  <li key={l.t + l.msg} data-level={l.level}>
                    <time>{l.t}</time>
                    <span>{l.msg}</span>
                    <em>{l.src}</em>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {view === "Settings" && (
          <section className="dash-panels">
            <div className="panel">
              <div className="panel-head">
                <h3>Design language</h3>
                <span className="panel-note">same mission</span>
              </div>
              <nav className="dash-themes" aria-label="Switch design system">
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
            </div>
          </section>
        )}

        {view !== "Settings" && (
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
        )}
      </main>

      {style.slug === "material" && (
        <button
          type="button"
          className="dash-fab"
          aria-label="Engage burn"
          onClick={engage}
        >
          ▶
        </button>
      )}
    </div>
  );
}

function SubsystemList() {
  return (
    <ul className="telemetry">
      {SUBSYSTEMS.map((row) => (
        <li key={row.sub}>
          <span className="t-sub">{row.sub}</span>
          <span className="t-dot" data-ok={row.ok} aria-hidden="true" />
          <span className="t-val">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
