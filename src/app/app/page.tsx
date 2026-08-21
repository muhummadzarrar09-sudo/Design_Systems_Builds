"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function ThemedApp() {
  const searchParams = useSearchParams();
  const { currentTheme, currentMode, toggleMode, setTheme } = useTheme();

  const themeParam = searchParams.get("theme") || DEFAULT_THEME;
  const pageParam = searchParams.get("page") || "overview";
  const themeDef = THEME_DEFINITIONS[themeParam];

  // Sync URL → theme (so the dropdown selection also updates the URL)
  React.useEffect(() => {
    if (themeParam && THEME_IDS.includes(themeParam) && themeParam !== currentTheme) {
      setTheme(themeParam as ThemeId);
    }
  }, [themeParam, currentTheme, setTheme]);

  if (!themeDef) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
      >
        <h1 className="text-3xl font-bold">Theme &quot;{themeParam}&quot; not found</h1>
      </div>
    );
  }

  function renderActivePage() {
    switch (themeParam) {
      case "minimalism":
        switch (pageParam) {
          case "hero":
          case "overview":
            return <MinimalismHero />;
          case "features":
          case "benefits":
            return <MinimalismBenefits />;
          case "blog":
            return <MinimalismBlog />;
          case "contact":
            return <MinimalismContact />;
          case "gallery":
            return <MinimalismGallery />;
          default:
            return <MinimalismHero />;
        }
      case "skeuomorphism":
        switch (pageParam) {
          case "hero":
          case "overview":
            return <SkeuomorphismHero />;
          case "dashboard":
          case "features":
          case "settings":
          case "media":
          case "profile":
          case "navigation":
            return <SkeuomorphismDashboard />;
          default:
            return <SkeuomorphismHero />;
        }
      case "flat":
        switch (pageParam) {
          case "hero":
          case "overview":
            return <FlatHero />;
          case "features":
            return <FlatHero />;
          case "pricing":
            return <FlatPricing />;
          case "team":
          case "testimonials":
            return <FlatTeam />;
          case "stats":
            return <FlatStats />;
          default:
            return <FlatHero />;
        }
      case "material":
        switch (pageParam) {
          case "hero":
          case "overview":
            return <MaterialHero />;
          case "features":
          case "dashboard":
          case "forms":
          case "navigation":
          case "stats":
            return <MaterialFeatures />;
          case "faq":
            return <MaterialFAQ />;
          default:
            return <MaterialHero />;
        }
      case "neumorphism":
        switch (pageParam) {
          case "media":
          case "overview":
          case "gallery":
            return <NeumorphismMedia />;
          case "settings":
          case "forms":
            return <NeumorphismSettings />;
          case "profile":
          case "dashboard":
            return <NeumorphismProfile />;
          case "pricing":
            return <NeumorphismMedia />;
          default:
            return <NeumorphismMedia />;
        }
      case "glassmorphism":
        switch (pageParam) {
          case "hero":
          case "overview":
            return <GlassmorphismHero />;
          case "features":
          case "testimonials":
            return <GlassmorphismFeatures />;
          case "pricing":
            return <GlassmorphismPricing />;
          default:
            return <GlassmorphismHero />;
        }
      case "claymorphism":
        switch (pageParam) {
          case "hero":
          case "overview":
            return <ClaymorphismHero />;
          case "pricing":
          case "stats":
            return <ClaymorphismPricing />;
          default:
            return <ClaymorphismHero />;
        }
      default:
        return (
          <section className="py-24 px-8 text-center">
            <h2 className="text-3xl font-bold">
              {themeDef.icon} {themeDef.name}
            </h2>
            <p className="text-lg mt-2" style={{ color: "var(--muted-fg)" }}>
              {themeDef.description}
            </p>
          </section>
        );
    }
  }

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
            <ThemeSelector />
          </div>
        </div>
      </header>

      <main className="flex-1">{renderActivePage()}</main>

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