import pg from "pg";

const { Pool } = pg;

let pool;
const DEFAULT_DISTRICT_NAME = "เมืองพิษณุโลก";

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
  inventorySuppliesForm: {
    maskDistributed: "0",
    n95Distributed: "0",
  },
};

const districtRepairMap = new Map([
  ["??????", "วังทอง"],
  ["ร ยธยงร ยธยฑร ยธยร ยธย—ร ยธยญร ยธย", "วังทอง"],
  ["ร ยธยร ยธยฒร ยธยร ยธยฃร ยธยฐร ยธยร ยธยณ", "บางระกำ"],
  ["ร ยธยงร ยธยฑร ยธย”ร ยนยร ยธยร ยธยชร ยธย–ร ยนย", "วัดโบสถ์"],
  [
    "ร ยนย€ร ยธยกร ยธยทร ยธยญร ยธยร ยธยร ยธยดร ยธยฉร ยธย“ร ยธยธร ยนยร ยธยฅร ยธย",
    "เมืองพิษณุโลก",
  ],
]);

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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

function decodeMojibake(value) {
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function normalizeDistrictName(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return DEFAULT_DISTRICT_NAME;
  }

  const trimmed = value.trim();

  if (districtRepairMap.has(trimmed)) {
    return districtRepairMap.get(trimmed);
  }

  if (/[\u0000-\u001f]/.test(trimmed) || trimmed.startsWith("@!7-")) {
    return DEFAULT_DISTRICT_NAME;
  }

  if (trimmed.includes("ร ") || trimmed.includes("à")) {
    const decoded = decodeMojibake(trimmed).trim();
    if (decoded && decoded !== trimmed) {
      return decoded;
    }
  }

  return trimmed;
}

export async function ensureMedicalPublicHealthSchema() {
  const client = await getPool().connect();

  try {
    await client.query(`
      create table if not exists medical_public_health_daily (
        report_date date not null,
        district_name text not null default 'เมืองพิษณุโลก',
        payload jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);

    await client.query(`
      alter table medical_public_health_daily
      add column if not exists district_name text not null default 'เมืองพิษณุโลก'
    `);

    for (const [badName, fixedName] of districtRepairMap.entries()) {
      await client.query(
        `
          update medical_public_health_daily
          set district_name = $2
          where district_name = $1
        `,
        [badName, fixedName],
      );
    }

    await client.query(
      `
        update medical_public_health_daily
        set district_name = $1
        where district_name ~ '[[:cntrl:]]'
           or district_name like '@!7-%'
      `,
      [DEFAULT_DISTRICT_NAME],
    );

    await client.query(`
      do $$
      begin
        if exists (
          select 1
          from pg_constraint
          where conname = 'medical_public_health_daily_pkey'
            and conrelid = 'medical_public_health_daily'::regclass
        ) then
          alter table medical_public_health_daily
          drop constraint medical_public_health_daily_pkey;
        end if;
      exception
        when undefined_table then null;
      end $$;
    `);

    await client.query(`
      do $$
      begin
        if not exists (
          select 1
          from pg_constraint
          where conname = 'medical_public_health_daily_report_date_district_key'
            and conrelid = 'medical_public_health_daily'::regclass
        ) then
          alter table medical_public_health_daily
          add constraint medical_public_health_daily_report_date_district_key
          primary key (report_date, district_name);
        end if;
      exception
        when duplicate_table then null;
      end $$;
    `);
  } finally {
    client.release();
  }
}

export async function fetchMedicalPublicHealth(
  reportDate = getBangkokDateString(),
  districtName = DEFAULT_DISTRICT_NAME,
) {
  await ensureMedicalPublicHealthSchema();
  const client = await getPool().connect();

  try {
    const normalizedDistrictName = normalizeDistrictName(districtName);
    const result = await client.query(
      `
        select report_date, district_name, payload, updated_at
        from medical_public_health_daily
        where report_date = $1
          and district_name = $2
      `,
      [reportDate, normalizedDistrictName],
    );

    if (result.rowCount === 0) {
      return {
        reportDate,
        districtName: normalizedDistrictName,
        payload: defaultMedicalPayload,
        updatedAt: null,
      };
    }

    return {
      reportDate: normalizeReportDate(result.rows[0].report_date),
      districtName: normalizeDistrictName(result.rows[0].district_name),
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

export async function listMedicalPublicHealthEntries() {
  await ensureMedicalPublicHealthSchema();
  const client = await getPool().connect();

  try {
    const result = await client.query(`
      select report_date, district_name, payload, updated_at
      from medical_public_health_daily
      order by report_date desc, district_name asc
    `);

    return result.rows.map((row) => ({
      reportDate: normalizeReportDate(row.report_date),
      districtName: normalizeDistrictName(row.district_name),
      payload: {
        ...defaultMedicalPayload,
        ...row.payload,
      },
      updatedAt: row.updated_at,
    }));
  } finally {
    client.release();
  }
}

export async function saveMedicalPublicHealth(
  payload,
  reportDate = getBangkokDateString(),
  districtName = DEFAULT_DISTRICT_NAME,
) {
  await ensureMedicalPublicHealthSchema();
  const client = await getPool().connect();

  try {
    const normalizedDistrictName = normalizeDistrictName(districtName);
    const result = await client.query(
      `
        insert into medical_public_health_daily (
          report_date,
          district_name,
          payload
        )
        values ($1, $2, $3::jsonb)
        on conflict (report_date, district_name) do update
          set payload = excluded.payload,
              updated_at = now()
        returning report_date, district_name, payload, updated_at
      `,
      [reportDate, normalizedDistrictName, JSON.stringify(payload)],
    );

    return {
      reportDate: normalizeReportDate(result.rows[0].report_date),
      districtName: normalizeDistrictName(result.rows[0].district_name),
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
