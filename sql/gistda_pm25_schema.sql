-- GISTDA PM2.5 hourly storage schema
-- This script targets PostgreSQL.

create table if not exists gistda_import_runs (
  id bigserial primary key,
  source_name text not null default 'GISTDA',
  province_id integer not null,
  province_name_th text not null,
  province_name_en text,
  source_updated_at timestamptz not null,
  imported_at timestamptz not null default now(),
  notes text
);

create unique index if not exists gistda_import_runs_source_updated_at_idx
  on gistda_import_runs (source_name, province_id, source_updated_at);

create table if not exists gistda_pm25_province_hourly (
  id bigserial primary key,
  import_run_id bigint not null references gistda_import_runs(id) on delete cascade,
  province_id integer not null,
  province_name_th text not null,
  province_name_en text,
  pm25 numeric(8,2) not null,
  pm25_avg_24hr numeric(8,2) not null,
  aqi integer not null,
  source_updated_at timestamptz not null,
  imported_at timestamptz not null default now()
);

create unique index if not exists gistda_pm25_province_hourly_unique_idx
  on gistda_pm25_province_hourly (province_id, source_updated_at);

create table if not exists gistda_pm25_district_hourly (
  id bigserial primary key,
  import_run_id bigint not null references gistda_import_runs(id) on delete cascade,
  province_id integer not null,
  district_id integer not null,
  district_name_th text not null,
  district_name_en text,
  pm25 numeric(8,2) not null,
  pm25_avg_24hr numeric(8,2) not null,
  aqi integer not null,
  risk_status varchar(16) not null,
  affected_population integer,
  patients integer,
  source_updated_at timestamptz not null,
  imported_at timestamptz not null default now()
);

create unique index if not exists gistda_pm25_district_hourly_unique_idx
  on gistda_pm25_district_hourly (district_id, source_updated_at);

create index if not exists gistda_pm25_district_hourly_lookup_idx
  on gistda_pm25_district_hourly (province_id, source_updated_at desc);

create or replace view gistda_pm25_province_latest as
select distinct on (province_id)
  province_id,
  province_name_th,
  province_name_en,
  pm25,
  pm25_avg_24hr,
  aqi,
  source_updated_at,
  imported_at
from gistda_pm25_province_hourly
order by province_id, source_updated_at desc;

create or replace view gistda_pm25_district_latest as
select distinct on (district_id)
  province_id,
  district_id,
  district_name_th,
  district_name_en,
  pm25,
  pm25_avg_24hr,
  aqi,
  risk_status,
  affected_population,
  patients,
  source_updated_at,
  imported_at
from gistda_pm25_district_hourly
order by district_id, source_updated_at desc;

-- Example import flow
-- 1. Insert one row into gistda_import_runs for each hourly fetch.
-- 2. Insert one row into gistda_pm25_province_hourly.
-- 3. Insert one row per district into gistda_pm25_district_hourly.
-- 4. Use ON CONFLICT DO NOTHING if the source_updated_at snapshot was already imported.
