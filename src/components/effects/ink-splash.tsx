"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import { THEME_DEFINITIONS } from "@/themes/definitions";

/**
 * InkSplash — theme-aware loading overlay, shown while switching themes.
 * The overlay renders in the NEW theme's colors (the CSS vars are already
 * swapped by the time it mounts), and the content is revealed after the
 * splash. Each design style gets its own spinner, in its own visual language.
 *
 * This is the loader PR #1's Sprint 4 comment claimed and the merged tree
 * never contained. This time it is real and consumed.
 */
export function InkSplash() {
  const { isTransitioning, currentTheme } = useTheme();

  // Keep the overlay mounted a beat longer than the flag so it can fade out
  // instead of vanishing between frames.
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setRender(true);
      return;
    }
    const t = setTimeout(() => setRender(false), 260);
    return () => clearTimeout(t);
  }, [isTransitioning]);

  if (!render) return null;

  const def = THEME_DEFINITIONS[currentTheme];

  return (
    <div
      className={`ink-splash${isTransitioning ? "" : " ink-splash--out"}`}
      role="status"
      aria-live="polite"
      aria-label={`Switching to ${def?.name ?? "theme"}`}
    >
      <div className="ink-splash__inner">
        <SplashSpinner />
        <p className="ink-splash__label">
          <span className="ink-splash__icon">{def?.icon}</span>
          {def?.name}
        </p>
      </div>
    </div>
  );
}

/** One spinner per design style — same language as the theme it announces. */
function SplashSpinner() {
  const { currentTheme } = useTheme();

  switch (currentTheme) {
    case "flat":
      return (
        <div className="splash bounce-squares" aria-hidden="true">
          {["var(--primary)", "var(--accent)", "var(--secondary)"].map(
            (color, i) => (
              <span
                key={i}
                className="sq"
                style={{ background: color, animationDelay: `${i * 0.12}s` }}
              />
            )
          )}
        </div>
      );
    case "material":
      return (
        <div className="splash ripple-rings" aria-hidden="true">
          <span />
          <span style={{ animationDelay: "0.35s" }} />
        </div>
      );
    case "skeuomorphism":
      return (
        <div className="splash skeuo-gear" aria-hidden="true">
          <span className="gear">⚙️</span>
        </div>
      );
    case "neumorphism":
      return <div className="splash neu-pulse" aria-hidden="true" />;
    case "glassmorphism":
      return (
        <div className="splash glass-ring" aria-hidden="true">
          <span className="arc" />
        </div>
      );
    case "claymorphism":
      return <div className="splash clay-blob" aria-hidden="true" />;
    default:
      return <div className="splash thin-ring" aria-hidden="true" />;
  }
}
