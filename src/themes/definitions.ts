import { ThemeDefinition } from "@/types/theme";

export const THEME_DEFINITIONS: Record<string, ThemeDefinition> = {
  skeuomorphism: {
    id: "skeuomorphism",
    name: "Skeuomorphism",
    tagline: "Tactile Realism",
    description: "Buttons you want to press, textures you can feel. Real-world materials translated to the digital realm.",
    era: "2010-2013",
    icon: "🪵",
    sections: ["hero", "features", "dashboard", "media", "settings", "profile", "navigation", "footer"],
  },
  flat: {
    id: "flat",
    name: "Flat Design",
    tagline: "Bold & Simple",
    description: "Clean 2D aesthetics with vibrant colors. No gradients, no shadows. Just pure functional beauty.",
    era: "2014-2016",
    icon: "🎨",
    sections: ["hero", "features", "pricing", "team", "stats", "cta", "testimonials", "footer"],
  },
  material: {
    id: "material",
    name: "Material Design",
    tagline: "Purposeful Motion",
    description: "Google's design language — tangible surfaces, responsive interactions, and meaningful transitions.",
    era: "2014-Present",
    icon: "📐",
    sections: ["hero", "features", "dashboard", "forms", "navigation", "faq", "stats", "footer"],
  },
  neumorphism: {
    id: "neumorphism",
    name: "Neumorphism",
    tagline: "Soft UI",
    description: "Morphic harmony where elements appear to extrude from or embed into the background using soft dual shadows.",
    era: "2020-2021",
    icon: "🫧",
    sections: ["media", "settings", "profile", "dashboard", "forms", "pricing", "gallery", "footer"],
  },
  glassmorphism: {
    id: "glassmorphism",
    name: "Glassmorphism",
    tagline: "Frosted Elegance",
    description: "Translucent panels with backdrop blur create depth through layered transparency. Sleek and modern.",
    era: "2021-Present",
    icon: "🪟",
    sections: ["hero", "features", "pricing", "testimonials", "gallery", "cta", "contact", "footer"],
  },
  claymorphism: {
    id: "claymorphism",
    name: "Claymorphism",
    tagline: "Playful 3D",
    description: "Plump, bulging shapes with dual-toned shadows that make UI feel squishy and sculptable like clay.",
    era: "2022-2023",
    icon: "🏺",
    sections: ["hero", "cta", "pricing", "team", "stats", "gallery", "features", "footer"],
  },
  minimalism: {
    id: "minimalism",
    name: "Minimalism",
    tagline: "Less is More",
    description: "Essential elements only. Generous whitespace, restrained typography, one accent color.",
    era: "Timeless",
    icon: "✦",
    sections: ["hero", "blog", "contact", "gallery", "profile", "testimonials", "footer"],
  },
};

export const THEME_IDS = Object.keys(THEME_DEFINITIONS);
export const DEFAULT_THEME = "minimalism";