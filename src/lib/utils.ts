import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a theme ID for display
 */
export function formatThemeId(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/**
 * Get the current theme from URL params or default
 */
export function getThemeFromParams(
  searchParams: URLSearchParams,
  defaultTheme: string
): string {
  const theme = searchParams.get("theme");
  if (theme && !theme.includes("/") && !theme.includes(".") && theme.length < 30) {
    return theme;
  }
  return defaultTheme;
}
