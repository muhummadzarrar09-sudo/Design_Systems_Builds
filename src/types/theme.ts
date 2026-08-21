// 🎨 Design Style Categories
export type ThemeId =
  | "skeuomorphism"
  | "flat"
  | "material"
  | "neumorphism"
  | "glassmorphism"
  | "claymorphism"
  | "minimalism";

export type ThemeMode = "light" | "dark";

// Which sections/content best fit this theme
export type SectionType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "faq"
  | "cta"
  | "stats"
  | "team"
  | "blog"
  | "contact"
  | "gallery"
  | "dashboard"
  | "forms"
  | "navigation"
  | "media"
  | "profile"
  | "settings"
  | "footer";

// Each theme has a unique identity
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  era: string;
  icon: string;
  sections: SectionType[];
}

// Theme context state
export interface ThemeContextType {
  currentTheme: ThemeId;
  currentMode: ThemeMode;
  isTransitioning: boolean;
  setTheme: (theme: ThemeId) => void;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

// Frontend route params
export interface ThemeRouteParams {
  theme: ThemeId;
}