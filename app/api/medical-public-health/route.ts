import { NextRequest, NextResponse } from "next/server";
import {
  fetchMedicalPublicHealth,
  saveMedicalPublicHealth,
} from "@/lib/server/medical-public-health.mjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const reportDate = request.nextUrl.searchParams.get("reportDate") ?? undefined;
    return NextResponse.json(await fetchMedicalPublicHealth(reportDate));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected medical data error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reportDate =
      typeof body.reportDate === "string" ? body.reportDate : undefined;
    const payload = body.payload;

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "payload is required" },
        { status: 400 },
      );
    }

    return NextResponse.json(await saveMedicalPublicHealth(payload, reportDate));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected medical save error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
