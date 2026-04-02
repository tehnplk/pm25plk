-- Example PostgreSQL upsert statements for one hourly GISTDA fetch.
-- Replace the sample values with your real payload.

with new_run as (
  insert into gistda_import_runs (
    source_name,
    province_id,
    province_name_th,
    province_name_en,
    source_updated_at,
    notes
  )
  values (
    'GISTDA',
    65,
    'พิษณุโลก',
    'Phitsanu Lok',
    '2026-04-01T15:00:00Z',
    'Hourly sync from /api/gistda'
  )
  on conflict (source_name, province_id, source_updated_at) do update
    set imported_at = now()
  returning id, province_id
)
insert into gistda_pm25_province_hourly (
  import_run_id,
  province_id,
  province_name_th,
  province_name_en,
  pm25,
  pm25_avg_24hr,
  aqi,
  source_updated_at
)
select
  id,
  province_id,
  'พิษณุโลก',
  'Phitsanu Lok',
  64.00,
  61.00,
  154,
  '2026-04-01T15:00:00Z'
from new_run
on conflict (province_id, source_updated_at) do update
set
  pm25 = excluded.pm25,
  pm25_avg_24hr = excluded.pm25_avg_24hr,
  aqi = excluded.aqi,
  imported_at = now();

-- District example
insert into gistda_pm25_district_hourly (
  import_run_id,
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
  source_updated_at
)
values (
  1,
  65,
  6501,
  'เมืองพิษณุโลก',
  'Mueang Phitsanu Lok',
  73.00,
  65.45,
  156,
  'Red',
  125000,
  450,
  '2026-04-01T15:00:00Z'
)
on conflict (district_id, source_updated_at) do update
set
  pm25 = excluded.pm25,
  pm25_avg_24hr = excluded.pm25_avg_24hr,
  aqi = excluded.aqi,
  risk_status = excluded.risk_status,
  affected_population = excluded.affected_population,
  patients = excluded.patients,
  imported_at = now();
