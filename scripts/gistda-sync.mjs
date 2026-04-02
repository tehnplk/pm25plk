import { loadLocalEnv } from "./load-env.mjs";
import { runGistdaSyncJob } from "../lib/server/gistda-sync.mjs";

loadLocalEnv();

try {
  const result = await runGistdaSyncJob({
    note: "Triggered from scripts/gistda-sync.mjs",
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        importRunId: result.importRunId,
        provinceId: result.provinceId,
        districtCount: result.districtCount,
        sourceUpdatedAt: result.sourceUpdatedAt,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Unexpected sync failure",
  );
  process.exit(1);
}
