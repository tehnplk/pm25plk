import pg from "pg";

const { Pool } = pg;

const GISTDA_PROVINCE_URL = "https://pm25.gistda.or.th/rest/getPm25byProvince";
const GISTDA_AMPHOE_URL =
  "https://pm25.gistda.or.th/rest/getPm25byAmphoePred3?pv_idn=65";
const PHITSANULOK_PROVINCE_ID = 65;
const AIR4THAI_STATION_LIST_URL =
  "http://air4thai.com/forweb/getHistoryStation.php";
const AIR4THAI_STATION_DATA_URL =
  "http://air4thai.com/forweb/getStationData.php?stationID=";
const AIR4THAI_PHITSANULOK_STATION_ID = "86t";

const districtMetadata = {
  "เมืองพิษณุโลก": { affectedPop: 125000, patients: 450 },
  วังทอง: { affectedPop: 95000, patients: 380 },
  บางระกำ: { affectedPop: 85000, patients: 310 },
  บางกระทุ่ม: { affectedPop: 42000, patients: 150 },
  พรหมพิราม: { affectedPop: 65000, patients: 200 },
  นครไทย: { affectedPop: 45000, patients: 120 },
  วัดโบสถ์: { affectedPop: 32000, patients: 95 },
  ชาติตระการ: { affectedPop: 30000, patients: 80 },
  เนินมะปราง: { affectedPop: 28000, patients: 60 },
};

let pool;

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

function calculateAqiFromPm25(pm25) {
  const breakpoints = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
  ];

  const clamped = Math.max(0, Math.min(pm25, 500.4));
  const range =
    breakpoints.find(
      (entry) => clamped >= entry.cLow && clamped <= entry.cHigh,
    ) ?? breakpoints[breakpoints.length - 1];

  const aqi =
    ((range.iHigh - range.iLow) / (range.cHigh - range.cLow)) *
      (clamped - range.cLow) +
    range.iLow;

  return Math.round(aqi);
}

function getStatus(aqi) {
  if (aqi >= 151) return "Red";
  if (aqi >= 101) return "Orange";
  if (aqi >= 51) return "Yellow";
  return "Green";
}

function buildForecastSlots(updatedAt, pred1, pred2, pred3) {
  const baseHour = Number(updatedAt.slice(11, 13));
  const formatHour = (offset) =>
    `${((baseHour + offset) % 24).toString().padStart(2, "0")}:00`;

  return [
    {
      label: formatHour(0),
      value: null,
      kind: "current",
    },
    {
      label: formatHour(1),
      value: roundToTwoDecimals(pred1),
      kind: "forecast",
    },
    {
      label: formatHour(2),
      value: roundToTwoDecimals(pred2),
      kind: "forecast",
    },
    {
      label: formatHour(3),
      value: roundToTwoDecimals(pred3),
      kind: "forecast",
    },
  ];
}

async function fetchAir4ThaiProvinceCard() {
  const [stationListResponse, stationDataResponse] = await Promise.all([
    fetch(AIR4THAI_STATION_LIST_URL, { cache: "no-store" }),
    fetch(`${AIR4THAI_STATION_DATA_URL}${AIR4THAI_PHITSANULOK_STATION_ID}`, {
      cache: "no-store",
    }),
  ]);

  if (!stationListResponse.ok || !stationDataResponse.ok) {
    throw new Error("Failed to fetch data from Air4Thai");
  }

  const stationList = await stationListResponse.json();
  const station = stationList.find(
    (entry) => entry.ID === AIR4THAI_PHITSANULOK_STATION_ID,
  );

  if (!station) {
    throw new Error("Phitsanulok station not found in Air4Thai response");
  }

  const stationData = await stationDataResponse.json();
  const latest = Array.isArray(stationData) ? stationData[0] : null;

  if (!latest) {
    throw new Error("No Air4Thai readings found for Phitsanulok");
  }

  return {
    source: "Air4Thai",
    stationId: station.ID,
    stationName: station.Name,
    areaName: station.Area,
    pm25: roundToTwoDecimals(Number(latest.PM25) || 0),
    aqi: Number(latest.AQI) || null,
    updatedAt: latest.DATETIMEDATA,
    updatedLabel: latest.DATETIMEDATA,
  };
}

export async function fetchGistdaDashboardData() {
  const [provinceResponse, amphoeResponse, air4ThaiResult] = await Promise.all([
    fetch(GISTDA_PROVINCE_URL, { cache: "no-store" }),
    fetch(GISTDA_AMPHOE_URL, { cache: "no-store" }),
    fetchAir4ThaiProvinceCard().catch(() => null),
  ]);

  if (!provinceResponse.ok || !amphoeResponse.ok) {
    throw new Error("Failed to fetch data from GISTDA");
  }

  const provincePayload = await provinceResponse.json();
  const amphoePayload = await amphoeResponse.json();

  const province = provincePayload.data.find(
    (entry) => entry.pv_idn === PHITSANULOK_PROVINCE_ID,
  );

  if (!province) {
    throw new Error("Phitsanulok province data not found in GISTDA response");
  }

  const districts = amphoePayload.data
    .map((entry) => {
      const metadata = districtMetadata[entry.ap_tn] ?? {
        affectedPop: 0,
        patients: 0,
      };
      const aqi = calculateAqiFromPm25(entry.pm25Avg24hr);

      return {
        id: entry.ap_idn,
        name: entry.ap_tn,
        nameEn: entry.ap_en,
        pm25: roundToTwoDecimals(entry.pm25),
        pm25Avg24hr: roundToTwoDecimals(entry.pm25Avg24hr),
        pred1: roundToTwoDecimals(entry.pred1),
        pred2: roundToTwoDecimals(entry.pred2),
        pred3: roundToTwoDecimals(entry.pred3),
        forecastSlots: buildForecastSlots(
          entry.dt,
          entry.pred1,
          entry.pred2,
          entry.pred3,
        ),
        aqi,
        affectedPop: metadata.affectedPop,
        patients: metadata.patients,
        status: getStatus(aqi),
        updatedAt: entry.dt,
      };
    })
    .sort((a, b) => b.pm25 - a.pm25);

  return {
    source: "GISTDA",
    province: {
      id: province.pv_idn,
      name: province.pv_tn,
      nameEn: province.pv_en,
      pm25: roundToTwoDecimals(province.pm25),
      pm25Avg24hr: roundToTwoDecimals(province.pm25Avg24hr),
      aqi: calculateAqiFromPm25(province.pm25Avg24hr),
      updatedAt: province.dt,
    },
    provinceSource: air4ThaiResult,
    districts,
    updatedAt: province.dt,
    updatedLabel:
      [provincePayload.datetimeThai?.dateThai, provincePayload.datetimeThai?.timeThai]
        .filter(Boolean)
        .join(" ") || province.dt,
  };
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return pool;
}

export async function persistGistdaSnapshot(payload, options = {}) {
  const client = await getPool().connect();
  const note = options.note ?? "Hourly sync from GISTDA";

  try {
    await client.query("BEGIN");

    const runResult = await client.query(
      `
        insert into gistda_import_runs (
          source_name,
          province_id,
          province_name_th,
          province_name_en,
          source_updated_at,
          notes
        )
        values ($1, $2, $3, $4, $5, $6)
        on conflict (source_name, province_id, source_updated_at) do update
          set imported_at = now(),
              notes = excluded.notes
        returning id
      `,
      [
        payload.source,
        payload.province.id,
        payload.province.name,
        payload.province.nameEn,
        payload.updatedAt,
        note,
      ],
    );

    const importRunId = runResult.rows[0].id;

    await client.query(
      `
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
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        on conflict (province_id, source_updated_at) do update
          set import_run_id = excluded.import_run_id,
              province_name_th = excluded.province_name_th,
              province_name_en = excluded.province_name_en,
              pm25 = excluded.pm25,
              pm25_avg_24hr = excluded.pm25_avg_24hr,
              aqi = excluded.aqi,
              imported_at = now()
      `,
      [
        importRunId,
        payload.province.id,
        payload.province.name,
        payload.province.nameEn,
        payload.province.pm25,
        payload.province.pm25Avg24hr,
        payload.province.aqi,
        payload.updatedAt,
      ],
    );

    for (const district of payload.districts) {
      await client.query(
        `
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
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          on conflict (district_id, source_updated_at) do update
            set import_run_id = excluded.import_run_id,
                district_name_th = excluded.district_name_th,
                district_name_en = excluded.district_name_en,
                pm25 = excluded.pm25,
                pm25_avg_24hr = excluded.pm25_avg_24hr,
                aqi = excluded.aqi,
                risk_status = excluded.risk_status,
                affected_population = excluded.affected_population,
                patients = excluded.patients,
                imported_at = now()
        `,
        [
          importRunId,
          payload.province.id,
          district.id,
          district.name,
          district.nameEn,
          district.pm25,
          district.pm25Avg24hr,
          district.aqi,
          district.status,
          district.affectedPop,
          district.patients,
          district.updatedAt,
        ],
      );
    }

    await client.query("COMMIT");

    return {
      importRunId,
      provinceId: payload.province.id,
      districtCount: payload.districts.length,
      sourceUpdatedAt: payload.updatedAt,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function runGistdaSyncJob(options = {}) {
  const payload = await fetchGistdaDashboardData();
  const persisted = await persistGistdaSnapshot(payload, options);

  return {
    ...persisted,
    payload,
  };
}
