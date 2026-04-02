import { NextResponse } from "next/server";
import { fetchGistdaDashboardData } from "@/lib/server/gistda-sync.mjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await fetchGistdaDashboardData());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected GISTDA error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
