import { NextResponse } from "next/server";
import { runGistdaSyncJob } from "@/lib/server/gistda-sync.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const bearer = request.headers.get("authorization");
  const customHeader = request.headers.get("x-cron-secret");

  return (
    bearer === `Bearer ${configuredSecret}` || customHeader === configuredSecret
  );
}

async function handleSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGistdaSyncJob({
      note: "Triggered from /api/jobs/gistda-sync",
    });

    return NextResponse.json({
      ok: true,
      importRunId: result.importRunId,
      provinceId: result.provinceId,
      districtCount: result.districtCount,
      sourceUpdatedAt: result.sourceUpdatedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected sync error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
