"use client";

import { useEffect } from "react";

/**
 * Ambient background: pure black + barely-there warm glows + film grain.
 * Also owns the global cursor-following gold spotlight (delegated to .row).
 */
export default function Background() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        ".row"
      ) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <i className="orb orb--a" />
      <i className="orb orb--b" />
      <i className="orb orb--c" />
      <i className="grain" />
    </div>
  );
}
