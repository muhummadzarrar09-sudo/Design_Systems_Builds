"use client";

import StyleLoader from "@/components/StyleLoader";

/**
 * Suspense fallback for the dashboard route — keeps the handoff in the
 * same design language: the loader reads the style from the path.
 */
export default function DashLoading() {
  return <StyleLoader duration={900} />;
}
