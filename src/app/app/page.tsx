"use client";

import React, { Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeSelector } from "@/components/dashboard/theme-selector";
import { useTheme } from "@/contexts/theme-context";
import { THEME_DEFINITIONS, THEME_IDS, DEFAULT_THEME } from "@/themes/definitions";
import { ThemeId } from "@/types/theme";

// ── Section imports (one folder per theme) ──
import { MinimalismHero, MinimalismBenefits } from "@/components/sections/minimalism/hero";
import { MinimalismBlog } from "@/components/sections/minimalism/blog";
import { MinimalismContact, MinimalismGallery } from "@/components/sections/minimalism/contact";
import { SkeuomorphismHero } from "@/components/sections/skeuomorphism/hero";
import { SkeuomorphismDashboard } from "@/components/sections/skeuomorphism/features";
import { FlatHero, FlatStats, FlatTeam } from "@/components/sections/flat/hero";
import { FlatPricing } from "@/components/sections/flat/pricing";
import { MaterialHero, MaterialFeatures } from "@/components/sections/material/hero";
import { MaterialFAQ } from "@/components/sections/material/faq";
import { NeumorphismMedia, NeumorphismSettings, NeumorphismProfile } from "@/components/sections/neumorphism/media";
import { GlassmorphismHero } from "@/components/sections/glassmorphism/hero";
import { GlassmorphismFeatures, GlassmorphismPricing } from "@/components/sections/glassmorphism/features";
import { ClaymorphismHero, ClaymorphismPricing } from "@/components/sections/claymorphism/hero";

/**
 * Single source of truth for theme/page → component. One entry per routable
 * page, keyed by `${themeId}/${section}` — must mirror THEME_DEFINITIONS.pages.
 * No aliases: if a page isn't mapped here, it doesn't render.
 */
const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  "skeuomorphism/hero": SkeuomorphismHero,
  "skeuomorphism/dashboard": SkeuomorphismDashboard,
  "flat/hero": FlatHero,
  "flat/pricing": FlatPricing,
  "flat/team": FlatTeam,
  "flat/stats": FlatStats,
  "material/hero": MaterialHero,
  "material/features": MaterialFeatures,
  "material/faq": MaterialFAQ,
  "neumorphism/media": NeumorphismMedia,
  "neumorphism/settings": NeumorphismSettings,
  "neumorphism/profile": NeumorphismProfile,
  "glassmorphism/hero": GlassmorphismHero,
  "glassmorphism/features": GlassmorphismFeatures,
  "glassmorphism/pricing": GlassmorphismPricing,
  "claymorphism/hero": ClaymorphismHero,
  "claymorphism/pricing": ClaymorphismPricing,
  "minimalism/hero": MinimalismHero,
  "minimalism/features": MinimalismBenefits,
  "minimalism/blog": MinimalismBlog,
  "minimalism/contact": MinimalismContact,
  "minimalism/gallery": MinimalismGallery,
};

function ThemedApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentTheme, currentMode, toggleMode, setTheme } = useTheme();

  const themeParam = searchParams.get("theme") || DEFAULT_THEME;
  const pageParam = searchParams.get("page") || "";
  const themeDef = THEME_DEFINITIONS[themeParam];

  // Resolve the page honestly: exact match, or the theme's first page.
  const activePage =
    themeDef?.pages.find((p) => p.key === pageParam) ?? themeDef?.pages[0];

  // Sync URL → theme context (deep links and nav-tab links drive the context)
  React.useEffect(() => {
    if (themeParam && THEME_IDS.includes(themeParam) && themeParam !== currentTheme) {
      setTheme(themeParam as ThemeId);
    }
  }, [themeParam, currentTheme, setTheme]);

  // Switching theme from the dropdown inside the app also updates the URL,
  // so the address bar always reflects what's on screen.
  const handleThemeSelect = useCallback(
    (id: ThemeId) => {
      setTheme(id);
      const firstPage = THEME_DEFINITIONS[id]?.pages[0];
      if (firstPage) {
        router.replace(`/app?theme=${id}&page=${firstPage.key}`);
      }
    },
    [router, setTheme]
  );

  if (!themeDef || !activePage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
      >
        <h1 className="text-3xl font-bold">Theme &quot;{themeParam}&quot; not found</h1>
      </div>
    );
  }

  const ActiveSection = SECTION_COMPONENTS[`${themeDef.id}/${activePage.section}`];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        transition: "all var(--transition-speed) ease",
      }}
    >
      {/* Sticky header with theme dropdown + light/dark toggle */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2 truncate">
            <span className="text-xl shrink-0">{themeDef.icon}</span>
            <h1 className="text-sm sm:text-base font-bold truncate">
              {themeDef.name} <span style={{ color: "var(--muted-fg)" }}>·</span>{" "}
              <span className="hidden sm:inline" style={{ color: "var(--muted-fg)" }}>
                {themeDef.tagline}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleMode}
              className="p-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-fg)",
                border: "1px solid var(--border)",
              }}
              title="Toggle light/dark"
            >
              {currentMode === "light" ? "🌙" : "☀️"}
            </button>
            <ThemeSelector onSelect={handleThemeSelect} />
          </div>
        </div>

        {/* Section navigation tabs — the theme's real, routable pages */}
        <nav
          aria-label="Section pages"
          className="border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex gap-1 overflow-x-auto">
            {themeDef.pages.map((page) => {
              const active = page.key === activePage.key;
              return (
                <Link
                  key={page.key}
                  href={`/app?theme=${themeDef.id}&page=${page.key}`}
                  aria-current={active ? "page" : undefined}
                  className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                  style={{
                    color: active ? "var(--primary)" : "var(--muted-fg)",
                    borderBottom: active
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  }}
                >
                  {page.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {ActiveSection ? (
          <ActiveSection />
        ) : (
          <section className="py-24 px-8 text-center">
            <h2 className="text-3xl font-bold">
              {themeDef.icon} {themeDef.name}
            </h2>
            <p className="text-lg mt-2" style={{ color: "var(--muted-fg)" }}>
              {themeDef.description}
            </p>
          </section>
        )}
      </main>

      <footer
        className="px-8 py-4 text-xs text-center border-t"
        style={{ borderColor: "var(--border)", color: "var(--muted-fg)" }}
      >
        {themeDef.name} theme &middot; Design System Playground
      </footer>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
        >
          Loading…
        </div>
      }
    >
      <ThemedApp />
    </Suspense>
  );
}
