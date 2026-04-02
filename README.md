<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/433bf8a9-2749-42e5-915d-2c748e97136b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## GISTDA PM2.5 Sync

- The dashboard pulls fresh GISTDA PM2.5 data automatically every 1 hour in the browser.
- The server endpoint that normalizes the payload is [app/api/gistda/route.ts](./app/api/gistda/route.ts).
- PostgreSQL storage scripts for hourly snapshots are in [sql/gistda_pm25_schema.sql](./sql/gistda_pm25_schema.sql) and [sql/gistda_pm25_upsert_example.sql](./sql/gistda_pm25_upsert_example.sql).
- Server-side sync logic lives in [lib/server/gistda-sync.mjs](./lib/server/gistda-sync.mjs).
- One-off database import: `npm run sync:gistda`
- Persistent hourly worker: `npm run worker:gistda`
- Protected sync endpoint for external schedulers: `GET/POST /api/jobs/gistda-sync`

## Server-side hourly job

1. Apply [sql/gistda_pm25_schema.sql](./sql/gistda_pm25_schema.sql) to PostgreSQL.
2. Set `DATABASE_URL`, `DATABASE_SSL`, and `CRON_SECRET` in your environment.
3. Choose one of these scheduling approaches:
   - Run `npm run worker:gistda` under PM2, systemd, Docker, or another process manager.
   - Or call `/api/jobs/gistda-sync` every hour from your hosting platform's scheduler with `Authorization: Bearer <CRON_SECRET>`.

This is the reliable server-side path for hourly persistence. Next.js page refresh alone does not write to the database.

### PM2

1. Set `DATABASE_URL`, `DATABASE_SSL`, and `CRON_SECRET` in the machine environment.
2. Start the worker with:
   `pm2 start ecosystem.config.cjs`
3. Check status:
   `pm2 list`
4. View logs:
   `pm2 logs gistda-hourly-worker`
