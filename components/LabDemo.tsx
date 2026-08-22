"use client";

import { useState } from "react";
import Link from "next/link";
import { STYLES } from "@/lib/styles";

type LabState = "rest" | "hover" | "pressed" | "focus" | "disabled" | "loading";

const STATE_OPTS: { id: LabState; label: string }[] = [
  { id: "rest", label: "Rest" },
  { id: "hover", label: "Hover" },
  { id: "pressed", label: "Pressed" },
  { id: "focus", label: "Focus" },
  { id: "disabled", label: "Disabled" },
  { id: "loading", label: "Loading" },
];

/**
 * State Lab: forces a state and renders it in all seven design systems
 * at once. The is-* classes mirror the real :hover/:active/:focus rules
 * (generated alongside them in globals.css), so what you see here is
 * exactly what the dashboards do.
 */
export default function LabDemo() {
  const [state, setState] = useState<LabState>("rest");

  const forced =
    state === "hover"
      ? " is-hover"
      : state === "pressed"
        ? " is-active"
        : state === "focus"
          ? " is-focus"
          : "";

  const disabled = state === "disabled" || state === "loading";

  return (
    <div className="lab">
      <div className="lab-controls" role="group" aria-label="Force a state">
        {STATE_OPTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`lab-chip${state === s.id ? " active" : ""}`}
            aria-pressed={state === s.id}
            onClick={() => setState(s.id)}
          >
            {s.label}
          </button>
        ))}
        <span className="lab-hint">
          rendered in all seven systems, side by side
        </span>
      </div>

      <div className="lab-grid">
        {STYLES.map((style) => (
          <div key={style.slug} className={`lab-frame theme--${style.slug}`}>
            <div className="lab-frame-head">
              <span className="lab-frame-name">{style.name}</span>
              <Link className="lab-frame-link" href={`/dash/${style.slug}`}>
                dashboard ↗
              </Link>
            </div>
            <div className="lab-stage">
              <button
                type="button"
                className={`dash-btn dash-btn--primary${forced}`}
                disabled={disabled}
              >
                {state === "loading" ? (
                  <>
                    <span className="spin" aria-hidden="true" />
                    Engage…
                  </>
                ) : (
                  "Engage"
                )}
              </button>
              <div className={`stat${forced}`}>
                <span className="stat-label">Altitude</span>
                <span className="stat-value">412 km</span>
                <span className="stat-delta">+0.8 km</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="footnote">
        These are the exact styles from the dashboards — see the written
        contract on the <a href="/states">states spec</a>, or open a dashboard
        and hover / press / tab for real.
      </p>
    </div>
  );
}
