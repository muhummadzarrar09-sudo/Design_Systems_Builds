import { ThemeDefinition } from "@/types/theme";

/**
 * Theme registry. `pages` lists every routable page per theme — exactly what
 * ships, no inflation. Adding a page here requires a matching entry in the
 * SECTION_COMPONENTS map in src/app/app/page.tsx.
 */
export const THEME_DEFINITIONS: Record<string, ThemeDefinition> = {
  skeuomorphism: {
    id: "skeuomorphism",
    name: "Skeuomorphism",
    tagline: "Tactile Realism",
    description: "Buttons you want to press, textures you can feel. Real-world materials translated to the digital realm.",
    era: "2010-2013",
    icon: "🪵",
    pages: [
      { key: "hero", label: "Home", section: "hero" },
      { key: "dashboard", label: "Dashboard", section: "dashboard" },
    ],
  },
  flat: {
    id: "flat",
    name: "Flat Design",
    tagline: "Bold & Simple",
    description: "Clean 2D aesthetics with vibrant colors. No gradients, no shadows. Just pure functional beauty.",
    era: "2014-2016",
    icon: "🎨",
    pages: [
      { key: "hero", label: "Home", section: "hero" },
      { key: "pricing", label: "Pricing", section: "pricing" },
      { key: "team", label: "Team", section: "team" },
      { key: "stats", label: "Stats", section: "stats" },
    ],
  },
  material: {
    id: "material",
    name: "Material Design",
    tagline: "Purposeful Motion",
    description: "Google's design language — tangible surfaces, responsive interactions, and meaningful transitions.",
    era: "2014-Present",
    icon: "📐",
    pages: [
      { key: "hero", label: "Home", section: "hero" },
      { key: "features", label: "Principles", section: "features" },
      { key: "faq", label: "FAQ", section: "faq" },
    ],
  },
  neumorphism: {
    id: "neumorphism",
    name: "Neumorphism",
    tagline: "Soft UI",
    description: "Morphic harmony where elements appear to extrude from or embed into the background using soft dual shadows.",
    era: "2020-2021",
    icon: "🫧",
    pages: [
      { key: "media", label: "Media", section: "media" },
      { key: "settings", label: "Settings", section: "settings" },
      { key: "profile", label: "Profile", section: "profile" },
    ],
  },
  glassmorphism: {
    id: "glassmorphism",
    name: "Glassmorphism",
    tagline: "Frosted Elegance",
    description: "Translucent panels with backdrop blur create depth through layered transparency. Sleek and modern.",
    era: "2021-Present",
    icon: "🪟",
    pages: [
      { key: "hero", label: "Home", section: "hero" },
      { key: "features", label: "Features", section: "features" },
      { key: "pricing", label: "Pricing", section: "pricing" },
    ],
  },
  claymorphism: {
    id: "claymorphism",
    name: "Claymorphism",
    tagline: "Playful 3D",
    description: "Plump, bulging shapes with dual-toned shadows that make UI feel squishy and sculptable like clay.",
    era: "2022-2023",
    icon: "🏺",
    pages: [
      { key: "hero", label: "Home", section: "hero" },
      { key: "pricing", label: "Plans", section: "pricing" },
    ],
  },
  minimalism: {
    id: "minimalism",
    name: "Minimalism",
    tagline: "Less is More",
    description: "Essential elements only. Generous whitespace, restrained typography, one accent color.",
    era: "Timeless",
    icon: "✦",
    pages: [
      { key: "hero", label: "Home", section: "hero" },
      { key: "features", label: "Principles", section: "features" },
      { key: "blog", label: "Writings", section: "blog" },
      { key: "contact", label: "Contact", section: "contact" },
      { key: "gallery", label: "Works", section: "gallery" },
    ],
  },
};

export const THEME_IDS = Object.keys(THEME_DEFINITIONS);
export const DEFAULT_THEME = "minimalism";
