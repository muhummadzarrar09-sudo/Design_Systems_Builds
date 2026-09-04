import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jetour T1 · 3D Showcase",
  description:
    "A 1:1 procedural Jetour T1 (4705 × 1967 × 1843 mm, 2800 mm wheelbase) rendered with React Three Fiber.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
