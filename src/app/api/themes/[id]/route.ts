import { NextResponse } from "next/server";
import { THEME_DEFINITIONS } from "@/themes/definitions";

/**
 * Internal API — GET /api/themes/[id]
 * Returns metadata for a single design style, or 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const theme = THEME_DEFINITIONS[id];

  if (!theme) {
    return NextResponse.json({ error: `Theme "${id}" not found` }, { status: 404 });
  }

  return NextResponse.json(theme, { headers: { "Cache-Control": "no-store" } });
}