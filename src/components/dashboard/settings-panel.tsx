"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { THEME_DEFINITIONS, THEME_IDS } from "@/themes/definitions";
import { ThemeId, ThemeMode } from "@/types/theme";

interface SettingsPanelProps {
  /**
   * Custom theme-selection handler. When provided it fully replaces the
   * default (the themed app passes one that also updates the URL).
   */
  onThemeSelect?: (id: ThemeId) => void;
}

/**
 * SettingsPanel — the gear-icon slide-in panel Sprint 5 claimed and the
 * merged tree never contained. Slide via CSS transform (snappy cubic-bezier —
 * no animation library needed). Live color swatches render each theme's real
 * palette via the same scoped data-theme trick as the hub preview islands.
 */
export function SettingsPanel({ onThemeSelect }: SettingsPanelProps) {
  const { currentTheme, currentMode, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pick = useCallback(
    (id: ThemeId) => {
      if (onThemeSelect) onThemeSelect(id);
      else setTheme(id);
    },
    [onThemeSelect, setTheme]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Open appearance settings"
        title="Appearance settings"
        className="p-2 rounded-lg transition-all"
        style={{
          backgroundColor: "var(--secondary)",
          color: "var(--secondary-fg)",
          border: "1px solid var(--border)",
        }}
      >
        <Settings size={16} aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="settings-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Appearance settings"
        aria-hidden={!open}
        className={`settings-panel${open ? " settings-panel--open" : ""}`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black uppercase tracking-[0.18em]">
            Appearance
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close settings"
            className="p-1.5 rounded-lg"
            style={{ color: "var(--muted-fg)" }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Light / Dark segmented control */}
        <div
          className="grid grid-cols-2 gap-1 p-1 rounded-lg mb-5"
          style={{ backgroundColor: "var(--muted)" }}
          role="group"
          aria-label="Color mode"
        >
          {(["light", "dark"] as ThemeMode[]).map((mode) => {
            const active = currentMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setMode(mode)}
                aria-pressed={active}
                className="py-1.5 px-3 text-xs font-bold rounded-md capitalize transition-colors"
                style={
                  active
                    ? {
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-fg)",
                      }
                    : { color: "var(--muted-fg)" }
                }
              >
                {mode === "light" ? "☀️ Light" : "🌙 Dark"}
              </button>
            );
          })}
        </div>

        {/* All 7 design styles with live swatches */}
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
          style={{ color: "var(--muted-fg)" }}
        >
          Design style
        </p>
        <div className="grid gap-1.5">
          {THEME_IDS.map((id) => {
            const def = THEME_DEFINITIONS[id];
            const active = id === currentTheme;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pick(id as ThemeId)}
                aria-pressed={active}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: active ? "var(--secondary)" : "transparent",
                  border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {/* Live swatch — real palette via scoped data-theme */}
                <span
                  data-theme={id}
                  data-mode={currentMode}
                  className="inline-flex items-center gap-1 p-1 rounded-md shrink-0"
                  style={{
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                  aria-hidden="true"
                >
                  <Swatch color="var(--primary)" />
                  <Swatch color="var(--accent)" />
                  <Swatch color="var(--secondary)" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold truncate">
                    {def.icon} {def.name}
                  </span>
                  <span
                    className="block text-[11px] truncate"
                    style={{ color: "var(--muted-fg)" }}
                  >
                    {def.tagline} · {def.pages.length} page
                    {def.pages.length === 1 ? "" : "s"}
                  </span>
                </span>
                {active && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--primary)" }}
                    aria-label="Active"
                  />
                )}
              </button>
            );
          })}
        </div>

        <p
          className="mt-5 text-[10px] text-center"
          style={{ color: "var(--muted-fg)" }}
        >
          Choices persist across visits — no flash on reload.
        </p>
      </aside>
    </>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}
