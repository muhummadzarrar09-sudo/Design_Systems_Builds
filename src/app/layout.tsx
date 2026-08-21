import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "Design System Playground",
  description:
    "Explore 7 design styles — Skeuomorphism, Flat, Material, Neumorphism, Glassmorphism, Claymorphism & Minimalism",
};

// Inline script: apply the persisted theme BEFORE first paint to avoid a flash
// of the wrong theme on refresh/hard-refresh (the user's requirement).
const themeBootScript = `
(function () {
  try {
    var t = localStorage.getItem("dsp:theme") || "minimalism";
    var m = localStorage.getItem("dsp:mode") || "light";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-mode", m);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}