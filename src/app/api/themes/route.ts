import { NextResponse } from "next/server";
import { THEME_DEFINITIONS, THEME_IDS } from "@/themes/definitions";

/**
 * Internal API — GET /api/themes
 * Returns metadata for all registered design styles.
 * No external services involved: pure frontend ↔ backend wiring.
 */
export async function GET() {
  return NextResponse.json(
    {
      count: THEME_IDS.length,
      defaultTheme: "minimalism",
      themes: THEME_IDS.map((id) => THEME_DEFINITIONS[id]),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}