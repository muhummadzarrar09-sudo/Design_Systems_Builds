"use client";

import { useEffect, useState, useRef } from "react";

/* ============================== Nav ============================== */

export function SiteBrand() {
  return (
    <div className="site-brand">
      <span className="brand-bolt" />
      <span className="brand-text">SKEUO·LAB</span>
    </div>
  );
}

/* ============================== Rivets ============================== */

export function Rivets() {
  return (
    <>
      <span className="rivet r-tl" />
      <span className="rivet r-tr" />
      <span className="rivet r-bl" />
      <span className="rivet r-br" />
    </>
  );
}

/* ============================== Gauge ============================== */

export function Gauge({
  label,
  value,
  unit,
  min = 0,
  max = 100,
  size = 180,
  accent = "#3a4a3a",
}: {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  size?: number;
  accent?: string;
}) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -120 + pct * 240;
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <div className="gauge-bezel">
        <div className="gauge-face">
          <div className="gauge-ticks">
            {Array.from({ length: 13 }).map((_, i) => {
              const a = -120 + (i * 240) / 12;
              return <span key={i} className="tick" style={{ transform: `rotate(${a}deg)` }} />;
            })}
          </div>
          <div className="gauge-numbers">
            {Array.from({ length: 6 }).map((_, i) => {
              const a = -120 + (i * 240) / 5;
              const n = Math.round((i * (max - min)) / 5 + min);
              return (
                <span
                  key={i}
                  className="num"
                  style={{ transform: `rotate(${a}deg) translate(0, -58px) rotate(${-a}deg)` }}
                >
                  {n}
                </span>
              );
            })}
          </div>
          <div
            className="needle"
            style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
          />
          <div className="needle-cap" />
          <div className="gauge-label">{label}</div>
          <div className="gauge-value" style={{ color: accent }}>
            {Math.round(value)}
            <span className="gauge-unit">{unit}</span>
          </div>
          <div className="glass-glare" />
        </div>
      </div>
    </div>
  );
}

/* ============================== Knob (drag or click) ============================== */

export function Knob({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  size = 78,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const drag = useRef(false);
  const pct = (value - min) / (max - min);
  const angle = -135 + pct * 270;

  const setFromEvent = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let a = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (a > 90) a -= 360;
    a = Math.max(-135, Math.min(135, a));
    const p = (a + 135) / 270;
    onChange(Math.round(min + p * (max - min)));
  };

  return (
    <div className="knob-wrap">
      <div
        ref={ref}
        className="knob"
        style={{ width: size, height: size }}
        onMouseDown={(e) => {
          drag.current = true;
          setFromEvent(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (drag.current) setFromEvent(e.clientX, e.clientY);
        }}
        onMouseUp={() => (drag.current = false)}
        onMouseLeave={() => (drag.current = false)}
        onTouchStart={(e) => {
          drag.current = true;
          setFromEvent(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (drag.current) setFromEvent(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={() => (drag.current = false)}
        onDoubleClick={() => onChange(Math.round((min + max) / 2))}
        title="Drag around the ring to set · double-click to reset"
      >
        <div className="knob-bezel">
          <div className="knob-face" style={{ transform: `rotate(${angle}deg)` }}>
            <span className="knob-indicator" />
          </div>
        </div>
        <div className="knob-ticks">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="kt" style={{ transform: `rotate(${i * 27 - 135}deg)` }} />
          ))}
        </div>
      </div>
      <div className="knob-label">{label}</div>
      <div className="knob-value">{Math.round(value)}</div>
    </div>
  );
}

/* ============================== Toggle (rocker) ============================== */

export function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button type="button" className={`toggle ${on ? "on" : "off"}`} onClick={onChange} aria-pressed={on}>
      <span className="toggle-label">{label}</span>
      <span className="toggle-paddle">
        <span className="toggle-paddle-grip" />
      </span>
    </button>
  );
}

/* ============================== Switch (lever) ============================== */

export function Switch({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button type="button" className={`switch ${on ? "on" : "off"}`} onClick={onChange} aria-pressed={on}>
      <span className="switch-label">{label}</span>
      <span className="switch-cover">
        <span className="switch-slot" />
        <span className="switch-lever" />
      </span>
    </button>
  );
}

/* ============================== LED ============================== */

export function Led({
  color = "amber",
  on = false,
  label,
}: {
  color?: "amber" | "green" | "red";
  on?: boolean;
  label?: string;
}) {
  return (
    <div className="led-cell">
      <div className={`led ${color} ${on ? "on" : ""}`} />
      {label && <div className="led-label">{label}</div>}
    </div>
  );
}

/* ============================== Brass plate ============================== */

export function BrassPlate({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="brass-plate">
      <div className="brass-engraving">
        <span className="brass-line" />
        {title}
        <span className="brass-line" />
      </div>
      {sub && <div className="brass-sub">{sub}</div>}
    </div>
  );
}

/* ============================== Strap ============================== */

export function Strap() {
  return (
    <div className="strap">
      <div className="strap-stitch left" />
      <div className="strap-buckle">
        <div className="buckle-frame">
          <div className="buckle-prong" />
        </div>
      </div>
      <div className="strap-stitch right" />
    </div>
  );
}

/* ============================== Glass tube ============================== */

export function GlassTube({
  label,
  percent,
  color = "amber",
}: {
  label: string;
  percent: number;
  color?: "amber" | "green";
}) {
  return (
    <div className="glass-meter">
      <div className="glass-meter-label">{label}</div>
      <div className="glass-tube">
        <div className={`glass-fluid ${color}`} style={{ height: `${Math.max(0, Math.min(100, percent))}%` }} />
        <div className="glass-bubble b1" />
        <div className="glass-bubble b2" />
        <div className="glass-bubble b3" />
      </div>
      <div className="glass-meter-val">{Math.round(percent)}%</div>
    </div>
  );
}

/* ============================== Live telemetry hook ============================== */

export function useTelemetry() {
  const [t, setT] = useState({ alt: 42, spd: 285, rpm: 72, heading: 74, fuel: 62, oxy: 88, hyd: 74 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((v) => ({
        alt: clamp(v.alt + (Math.random() - 0.5) * 2, 0, 100),
        spd: clamp(v.spd + (Math.random() - 0.5) * 4, 0, 100),
        rpm: clamp(v.rpm + (Math.random() - 0.5) * 3, 0, 100),
        heading: (v.heading + (Math.random() - 0.5) * 1.5 + 360) % 360,
        fuel: clamp(v.fuel - 0.05 + (Math.random() - 0.5) * 0.4, 20, 95),
        oxy: clamp(v.oxy + (Math.random() - 0.5) * 0.2, 60, 99),
        hyd: clamp(v.hyd + (Math.random() - 0.5) * 0.3, 40, 95),
      }));
    }, 1200);
    return () => clearInterval(id);
  }, []);
  return t;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
