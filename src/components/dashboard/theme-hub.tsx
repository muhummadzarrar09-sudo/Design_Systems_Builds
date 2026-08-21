"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { THEME_DEFINITIONS, THEME_IDS } from "@/themes/definitions";
import { ThemeSelector } from "@/components/dashboard/theme-selector";
import { ThemePreviewIsland } from "@/components/dashboard/preview-islands";

type ApiStatus = "checking" | "online" | "offline";

/**
 * ThemeHub — hub page.
 * - Brand title + a ThemeSelector dropdown (always works)
 * - Every card is a real link into that theme's app (/app?theme=X)
 * - Static grid — no nested data-theme (nested data-theme was the bug all along)
 */
export function ThemeHub() {
  // Live check of the internal API on mount — frontend ↔ backend wiring, for real
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [apiCount, setApiCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/themes", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { count?: number }) => {
        if (cancelled) return;
        setApiCount(data.count ?? 0);
        setApiStatus("online");
      })
      .catch(() => {
        if (!cancelled) setApiStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        transition: "all var(--transition-speed) ease",
      }}
    >
      <header
        className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">
            Design System Playground
          </h1>
          <p
            className="text-sm mt-0.5 truncate"
            style={{ color: "var(--muted-fg)" }}
          >
            Pick a design style. The whole app rebrands.
          </p>
        </div>

        <div className="shrink-0">
          <ThemeSelector />
        </div>
      </header>

      <main className="flex-1 px-6 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "var(--muted-fg)" }}>
            All design styles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEME_IDS.map((id) => {
              const def = THEME_DEFINITIONS[id];
              return (
                <Link
                  key={id}
                  href={`/app?theme=${id}&page=${def.pages[0].key}`}
                  className="theme-card block p-5"
                  style={{
                    backgroundColor: "var(--card)",
                    color: "var(--card-fg)",
                    borderRadius: "calc(var(--radius-val) * 1.4)",
                    boxShadow: "var(--shadow)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{def.icon}</span>
                    <h3 className="text-base font-black">{def.name}</h3>
                  </div>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--accent)" }}>
                    {def.tagline}
                  </p>
                  {/* Live preview — a real mini-UI in this theme's own language */}
                  <div className="mb-3">
                    <ThemePreviewIsland id={def.id} />
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "var(--muted)", color: "var(--muted-fg)" }}
                    >
                      {def.era}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
                    >
                      {def.pages.length} page{def.pages.length === 1 ? "" : "s"}
                    </span>
                    <span className="ml-auto font-bold" style={{ color: "var(--primary)" }}>
                      Open →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs" style={{ color: "var(--muted-fg)" }}>
            Click any card (or use the dropdown) to open that theme&apos;s app — the whole UI rebrands instantly.
          </p>
        </div>
      </main>

      <footer
        className="px-8 py-4 text-xs text-center border-t"
        style={{ borderColor: "var(--border)", color: "var(--muted-fg)" }}
      >
        Built with Next.js &amp; TypeScript &middot; 7 design styles &middot; Light + Dark per style
        <span className="mx-2" aria-hidden="true">·</span>
        {apiStatus === "checking" && <span>API: connecting…</span>}
        {apiStatus === "online" && (
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            API: {apiCount} themes online ✓
          </span>
        )}
        {apiStatus === "offline" && (
          <span style={{ color: "var(--destructive)", fontWeight: 600 }}>
            API offline ✗
          </span>
        )}
      </footer>
    </div>
  );
}