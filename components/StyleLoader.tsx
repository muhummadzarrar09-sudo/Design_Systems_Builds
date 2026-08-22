"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { STYLES, type StyleMeta } from "@/lib/styles";

const PHASES = [
  "spooling engines",
  "acquiring downlink",
  "calibrating surfaces",
  "entering orbit",
];

type Props = {
  /** Which design language to load in. Falls back to the current /dash/:slug path. */
  slug?: string;
  /** Fires when the full loader beat is done (used by the picker to navigate). */
  onDone?: () => void;
  /** Total beat length in ms. Default 1800. */
  duration?: number;
};

function resolveStyle(slug?: string, pathname?: string): StyleMeta {
  return (
    (slug && STYLES.find((s) => s.slug === slug)) ||
    STYLES.find((s) => pathname?.startsWith(`/dash/${s.slug}`)) ||
    STYLES[0]
  );
}

/**
 * StyleLoader — the loading state speaks the design language it is
 * loading. Brass gauge sweep, blunt blocks, ripple rings, pressed-in
 * groove, de-frosting glass, a squish, or a single line. One structure,
 * seven skins (§13 LOADERS in globals.css).
 */
export default function StyleLoader({ slug, onDone, duration = 1800 }: Props) {
  const pathname = usePathname();
  const style = useMemo(() => resolveStyle(slug, pathname), [slug, pathname]);

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const beat = duration / (PHASES.length + 0.2);
    const phaseId = window.setInterval(
      () => setPhase((p) => Math.min(p + 1, PHASES.length - 1)),
      beat,
    );
    const doneId = onDone ? window.setTimeout(onDone, duration) : undefined;
    return () => {
      window.clearInterval(phaseId);
      if (doneId) window.clearTimeout(doneId);
    };
  }, [duration, onDone]);

  return (
    <div
      className={`ldr theme--${style.slug}`}
      style={{ "--ldr-dur": `${duration}ms` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-label={`Loading the ${style.name} dashboard`}
    >
      <div className="ldr-stage" aria-hidden="true">
        {/* per-style centerpiece (CSS decides what this becomes) */}
        <i className="ldr-elem">
          <i className="ldr-elem-2" />
          <i className="ldr-elem-3" />
        </i>
        <i className="ldr-track">
          <i className="ldr-fill" />
        </i>
      </div>
      <p className="ldr-title">
        Entering <span className="ldr-name">{style.name}</span>
      </p>
      <p className="ldr-status">{PHASES[phase]}</p>
    </div>
  );
}
