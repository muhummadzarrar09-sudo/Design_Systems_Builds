import type { Metadata } from "next";
import Link from "next/link";
import { SPECS } from "@/lib/states";

export const metadata: Metadata = {
  title: "States spec — Design Systems Builds",
  description:
    "How every state works in all seven design systems: rest, hover, pressed, focus, disabled, motion, scroll and zoom.",
};

const ROW_KEYS = ["rest", "hover", "pressed", "focus", "disabled"] as const;

export default function StatesPage() {
  return (
    <main className="wrap">
      <header className="hero">
        <div className="hero__row">
          <span className="mark" aria-hidden="true">
            Z
          </span>
          <p className="kicker">Design systems spec</p>
        </div>
        <h1>
          How each system <span className="grad">feels</span>.
        </h1>
        <p className="sub">
          The exact behavior of every state — rest, hover, pressed, focus,
          disabled — plus motion, scroll and zoom, for all seven design
          systems. This is the contract the dashboards are coded to.
        </p>
        <Link className="back-link" href="/">
          ← back to the picker
        </Link>
        <Link className="back-link" href="/lab" style={{ marginLeft: 8 }}>
          try the state lab →
        </Link>
      </header>

      <section className="spec-list">
        {SPECS.map((spec, i) => (
          <article className="spec-card" key={spec.slug}>
            <div className="spec-head">
              <span className="spec-num">{String(i + 1).padStart(2, "0")}</span>
              <h2>{spec.name}</h2>
              <span className="spec-tag">{spec.tagline}</span>
            </div>

            <div className="spec-grid">
              {ROW_KEYS.map((key) => (
                <div className="spec-row" key={key}>
                  <b>{key}</b>
                  <span>{spec.states[key]}</span>
                </div>
              ))}
            </div>

            <div className="spec-meta">
              <span className="spec-chip">motion — {spec.motion}</span>
              <span className="spec-chip">scroll — {spec.scroll}</span>
              <span className="spec-chip">zoom — {spec.zoom}</span>
            </div>
          </article>
        ))}
      </section>

      <p className="footnote">
        Research-driven · implemented in <b>every dashboard</b> · hover, press
        and focus a dashboard to verify
      </p>
    </main>
  );
}
