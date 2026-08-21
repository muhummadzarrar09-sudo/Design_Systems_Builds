"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { THEME_DEFINITIONS, THEME_IDS } from "@/themes/definitions";
import { ThemeId } from "@/types/theme";

interface ThemeSelectorProps {
  variant?: "default" | "compact";
}

/**
 * ThemeSelector — a single dropdown that always works.
 * - Trigger: shows current theme name + icon
 * - Menu: lists all 7 themes, click to switch
 * - On mobile / any frame, the menu opens downward and stays in normal DOM flow
 * - NO nested data-theme (that was the bug)
 */
export function ThemeSelector({ variant = "default" }: ThemeSelectorProps) {
  const { currentTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = THEME_DEFINITIONS[currentTheme];

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all"
        style={{
          backgroundColor: "var(--secondary)",
          color: "var(--secondary-fg)",
          border: "1px solid var(--border)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base">{current.icon}</span>
        {variant === "default" && <span className="hidden sm:inline">{current.name}</span>}
        <ChevronDown
          size={14}
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden z-[9990]"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--card-fg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
              borderBottom: "1px solid var(--border)",
              color: "var(--muted-fg)",
            }}
          >
            Pick a design style
          </div>
          <div className="py-1">
            {THEME_IDS.map((id) => {
              const def = THEME_DEFINITIONS[id];
              const active = id === currentTheme;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  key={id}
                  onClick={() => {
                    setTheme(id as ThemeId);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    backgroundColor: active ? "var(--secondary)" : "transparent",
                    color: "var(--fg)",
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {def.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold truncate">{def.name}</span>
                    <span
                      className="block text-[11px] truncate"
                      style={{ color: "var(--muted-fg)" }}
                    >
                      {def.tagline}
                    </span>
                  </span>
                  {active && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}