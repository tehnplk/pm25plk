-- Medical / Public Health daily form storage
-- PostgreSQL

create table if not exists medical_public_health_daily (
  report_date date primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medical_public_health_daily_updated_at_idx
  on medical_public_health_daily (updated_at desc);
