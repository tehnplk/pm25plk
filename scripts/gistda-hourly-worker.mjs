import { loadLocalEnv } from "./load-env.mjs";
import { runGistdaSyncJob } from "../lib/server/gistda-sync.mjs";

loadLocalEnv();

const intervalMs = 60 * 60 * 1000;
let shuttingDown = false;

async function runOnce(note) {
  console.log(`[${new Date().toISOString()}] Starting GISTDA hourly sync`);

  try {
    const result = await runGistdaSyncJob({ note });
    console.log(
      `[${new Date().toISOString()}] Completed importRunId=${result.importRunId} districts=${result.districtCount} sourceUpdatedAt=${result.sourceUpdatedAt}`,
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Sync failed:`,
      error instanceof Error ? error.message : error,
    );
  }
}

async function loop() {
  await runOnce("Triggered from scripts/gistda-hourly-worker.mjs");

  while (!shuttingDown) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (!shuttingDown) {
      await runOnce("Triggered from scripts/gistda-hourly-worker.mjs");
    }
  }
}

function shutdown(signal) {
  shuttingDown = true;
  console.log(`[${new Date().toISOString()}] Received ${signal}, shutting down`);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

await loop();
