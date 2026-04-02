import { NextRequest, NextResponse } from "next/server";
import {
  fetchMedicalPublicHealth,
  listMedicalPublicHealthEntries,
  saveMedicalPublicHealth,
} from "@/lib/server/medical-public-health.mjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const listAll = request.nextUrl.searchParams.get("listAll");
    const reportDate = request.nextUrl.searchParams.get("reportDate") ?? undefined;
    const districtName =
      request.nextUrl.searchParams.get("districtName") ?? undefined;

    if (listAll === "true") {
      return NextResponse.json(await listMedicalPublicHealthEntries());
    }

    return NextResponse.json(
      await fetchMedicalPublicHealth(reportDate, districtName),
    );
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
    const districtName =
      typeof body.districtName === "string" ? body.districtName : undefined;
    const payload = body.payload;

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "payload is required" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      await saveMedicalPublicHealth(payload, reportDate, districtName),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected medical save error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
