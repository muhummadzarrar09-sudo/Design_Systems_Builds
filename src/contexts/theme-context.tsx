"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ThemeId, ThemeMode, ThemeContextType } from "@/types/theme";
import { DEFAULT_THEME, THEME_IDS } from "@/themes/definitions";

const STORAGE_THEME = "dsp:theme";
const STORAGE_MODE = "dsp:mode";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeId;
  initialMode?: ThemeMode;
}

function readStored(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME as ThemeId,
  initialMode = "light",
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const stored = readStored(STORAGE_THEME, initialTheme);
    return THEME_IDS.includes(stored) ? (stored as ThemeId) : initialTheme;
  });
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => {
    const stored = readStored(STORAGE_MODE, initialMode);
    return stored === "dark" ? "dark" : "light";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: ThemeId, mode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-mode", mode);
    root.classList.add("theme-transitioning");
    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 600);
  }, []);

  // Persist choices
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_THEME, currentTheme);
      window.localStorage.setItem(STORAGE_MODE, currentMode);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [currentTheme, currentMode]);

  // Set theme — instant CSS variable swap, with ink-splash transition flag
  const setTheme = useCallback(
    (theme: ThemeId) => {
      if (theme === currentTheme) return;
      if (!THEME_IDS.includes(theme)) {
        console.warn(`Theme "${theme}" not found, using default`);
        return;
      }
      setIsTransitioning(true);
      setCurrentTheme(theme);
      applyTheme(theme, currentMode);
      // Release transition flag after the splash animation
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [currentTheme, currentMode, applyTheme]
  );

  const toggleMode = useCallback(() => {
    const newMode = currentMode === "light" ? "dark" : "light";
    setCurrentMode(newMode);
    applyTheme(currentTheme, newMode);
  }, [currentMode, currentTheme, applyTheme]);

  const setMode = useCallback(
    (mode: ThemeMode) => {
      setCurrentMode(mode);
      applyTheme(currentTheme, mode);
    },
    [currentTheme, applyTheme]
  );

  // Apply theme on mount (CSS vars active from first paint)
  useEffect(() => {
    applyTheme(currentTheme, currentMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        currentMode,
        isTransitioning,
        setTheme,
        toggleMode,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}