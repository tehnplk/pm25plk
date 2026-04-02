import pg from "pg";

const { Pool } = pg;

let pool;

const defaultMedicalPayload = {
  generalPublicForm: {
    surgicalDaily: "250",
    surgicalCumulative: "20,420",
    n95Daily: "100",
    n95Cumulative: "350",
  },
  targetedGroupForm: {
    children: { surgicalDaily: "0", n95Daily: "0" },
    pregnant: { surgicalDaily: "0", n95Daily: "0" },
    elderly: { surgicalDaily: "250", n95Daily: "0" },
    heart: { surgicalDaily: "0", n95Daily: "0" },
    respiratory: { surgicalDaily: "0", n95Daily: "0" },
  },
  cleanRoomForm: {
    advanced: { standardRooms: "1" },
    general: { standardRooms: "0" },
    community: { standardRooms: "8" },
    subdistrict: { standardRooms: "107" },
  },
  cleanRoomVisitors: "750",
  vulnerableServiceForm: {
    children: { dailyServed: "594" },
    pregnant: { dailyServed: "0" },
    elderly: { dailyServed: "4732" },
    heart: { dailyServed: "0" },
    respiratory: { dailyServed: "2385" },
  },
};

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

function getBangkokDateString() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function normalizeReportDate(value) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  }

  return getBangkokDateString();
}

export async function ensureMedicalPublicHealthSchema() {
  const client = await getPool().connect();

  try {
    await client.query(`
      create table if not exists medical_public_health_daily (
        report_date date primary key,
        payload jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
  } finally {
    client.release();
  }
}

export async function fetchMedicalPublicHealth(reportDate = getBangkokDateString()) {
  await ensureMedicalPublicHealthSchema();
  const client = await getPool().connect();

  try {
    const result = await client.query(
      `
        select report_date, payload, updated_at
        from medical_public_health_daily
        where report_date = $1
      `,
      [reportDate],
    );

    if (result.rowCount === 0) {
      return {
        reportDate,
        payload: defaultMedicalPayload,
        updatedAt: null,
      };
    }

    return {
      reportDate: normalizeReportDate(result.rows[0].report_date),
      payload: {
        ...defaultMedicalPayload,
        ...result.rows[0].payload,
      },
      updatedAt: result.rows[0].updated_at,
    };
  } finally {
    client.release();
  }
}

export async function saveMedicalPublicHealth(
  payload,
  reportDate = getBangkokDateString(),
) {
  await ensureMedicalPublicHealthSchema();
  const client = await getPool().connect();

  try {
    const result = await client.query(
      `
        insert into medical_public_health_daily (
          report_date,
          payload
        )
        values ($1, $2::jsonb)
        on conflict (report_date) do update
          set payload = excluded.payload,
              updated_at = now()
        returning report_date, payload, updated_at
      `,
      [reportDate, JSON.stringify(payload)],
    );

    return {
      reportDate: normalizeReportDate(result.rows[0].report_date),
      payload: result.rows[0].payload,
      updatedAt: result.rows[0].updated_at,
    };
  } finally {
    client.release();
  }
}
