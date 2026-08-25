import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Skeuo Lab — Mission Control",
  description: "A skeuomorphic design system: cockpit, inspo, lab, dash variants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
