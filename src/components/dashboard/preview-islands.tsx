"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/contexts/theme-context";
import { ThemeId } from "@/types/theme";

/**
 * ThemePreviewIsland — a real mini-UI rendered in a theme's OWN design
 * language, via a scoped data-theme wrapper on the island itself.
 *
 * Why this is safe now (and was "the bug all along" before):
 * - The wrapper carries BOTH data-theme and data-mode, so the attribute
 *   selectors ([data-theme="X"][data-mode="Y"]) resolve the full variable
 *   set locally on the island — nothing leaks to or from the document root.
 * - Islands are pointer-events-none: they are previews inside a link, not
 *   interactive surfaces, so no nested-interactive HTML and no rogue state.
 * - Micro-interaction selectors ([data-theme="X"] button:hover) match inside
 *   the island — which is exactly right: the island speaks its own language.
 */
export function ThemePreviewIsland({ id }: { id: ThemeId }) {
  const { currentMode } = useTheme();

  return (
    <div
      data-theme={id}
      data-mode={currentMode}
      className="island"
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        borderColor: "var(--border)",
        borderRadius: "calc(var(--radius-val) * 1.1)",
        fontFamily: "var(--font-stack)",
      }}
    >
      {ISLANDS[id]}
    </div>
  );
}

const ISLANDS: Record<ThemeId, ReactNode> = {
  /* Skeuomorphism: machined toolbar with a gradient button */
  skeuomorphism: (
    <div className="island-row">
      <span className="island-title" style={{ fontFamily: "var(--font-heading)" }}>
        📚 Library
      </span>
      <span
        className="island-chip"
        style={{
          background: "linear-gradient(180deg, var(--primary), color-mix(in srgb, var(--primary) 65%, black))",
          color: "var(--primary-fg)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.35)",
          borderRadius: "var(--radius-val)",
        }}
      >
        Open
      </span>
    </div>
  ),

  /* Flat: bold color blocks, zero shadows */
  flat: (
    <div>
      <div className="island-row">
        <span className="island-block" style={{ background: "var(--primary)" }} />
        <span className="island-block" style={{ background: "var(--accent)" }} />
        <span
          className="island-block"
          style={{ background: "var(--secondary)", border: "2px solid var(--fg)" }}
        />
      </div>
      <p className="island-caption" style={{ color: "var(--muted-fg)" }}>
        No shadows. All color.
      </p>
    </div>
  ),

  /* Material: an elevated card on the z-axis */
  material: (
    <div
      className="island-card"
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow)",
        borderRadius: "var(--radius-val)",
      }}
    >
      <span className="island-avatar" style={{ background: "var(--primary)" }} />
      <span className="island-lines">
        <span className="island-line" style={{ background: "var(--muted)", width: "68%" }} />
        <span className="island-line" style={{ background: "var(--muted)", width: "44%" }} />
      </span>
    </div>
  ),

  /* Neumorphism: soft extrusions from the surface */
  neumorphism: (
    <div className="island-row">
      <span
        className="island-disc"
        style={{ background: "var(--bg)", boxShadow: "var(--shadow)" }}
      />
      <span
        className="island-toggle"
        style={{ background: "var(--primary)", boxShadow: "var(--shadow-sm)" }}
      >
        <span
          className="island-knob"
          style={{ background: "var(--bg)", boxShadow: "var(--shadow-sm)" }}
        />
      </span>
    </div>
  ),

  /* Glassmorphism: frosted panel over a vivid gradient */
  glassmorphism: (
    <div
      className="island-glass-bg"
      style={{ background: "linear-gradient(135deg, #1a1b2f, #2d1b69)" }}
    >
      <div
        className="island-glass-panel"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        <span className="island-dot" style={{ background: "#6c63ff" }} />
        Frosted panel
      </div>
    </div>
  ),

  /* Claymorphism: puffy, squishable pills */
  claymorphism: (
    <div className="island-row">
      <span
        className="island-pill"
        style={{
          background: "var(--card)",
          color: "var(--fg)",
          borderRadius: "calc(var(--radius-val) * 1.3)",
          boxShadow: "var(--shadow)",
        }}
      >
        Squish
      </span>
      <span
        className="island-pill"
        style={{
          background: "var(--primary)",
          color: "var(--primary-fg)",
          borderRadius: "calc(var(--radius-val) * 1.3)",
          boxShadow: "var(--shadow)",
        }}
      >
        Mold
      </span>
    </div>
  ),

  /* Minimalism: one word, one whisper of accent */
  minimalism: (
    <div className="island-minimal">
      <p className="island-minimal-title" style={{ fontFamily: "var(--font-heading)" }}>
        Less.
      </p>
      <p className="island-caption" style={{ color: "var(--muted-fg)" }}>
        BUT ENOUGH
      </p>
    </div>
  ),
};
