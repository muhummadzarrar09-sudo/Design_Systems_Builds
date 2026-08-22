"use client";

import { useEffect, useState } from "react";

const MET_BASE = 31 * 3600 + 14 * 60 + 55;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatMet(tick: number) {
  const s = MET_BASE + tick;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Live-feeling Aurora-9 readouts. Deterministic sine so SSR/CSR match on tick 0. */
export function useTelemetry() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 900);
    return () => window.clearInterval(id);
  }, []);

  const alt = 411.64 + Math.sin(tick / 4.2) * 0.62;
  const vel = 27580 + Math.cos(tick / 5.1) * 16;
  const fuel = Math.max(61.4, 68.18 - tick * 0.011);
  const signal = 98.86 + Math.sin(tick / 3.4) * 0.42;

  return {
    tick,
    met: formatMet(tick),
    altitude: alt.toFixed(1),
    velocity: Math.round(vel).toLocaleString("en-US"),
    fuel: fuel.toFixed(1),
    signal: signal.toFixed(1),
    fuelPct: fuel,
  };
}
