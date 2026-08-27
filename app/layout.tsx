import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skeuo · Hi-Fi — 1970s Stereo Receiver",
  description: "A skeuomorphic 1970s stereo receiver, rebuilt in 3D.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
