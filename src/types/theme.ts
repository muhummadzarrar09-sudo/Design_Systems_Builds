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

// Section taxonomy — what kind of content a page renders
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

// A page that ACTUALLY exists: key = ?page= value, section = component to render
export interface ThemePage {
  key: string;
  label: string;
  section: SectionType;
}

// Each theme has a unique identity.
// `pages` is the honest, complete list of routable pages for this theme —
// if it's not in here, it doesn't exist.
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  era: string;
  icon: string;
  pages: ThemePage[];
}

// Theme context state
export interface ThemeContextType {
  currentTheme: ThemeId;
  currentMode: ThemeMode;
  /** True while the ink-splash overlay is up during a theme switch. */
  isTransitioning: boolean;
  setTheme: (theme: ThemeId) => void;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}
