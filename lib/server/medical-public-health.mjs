import pg from "pg";

const { Pool } = pg;

let pool;
const DEFAULT_DISTRICT_NAME = "เมืองพิษณุโลก";

const defaultMedicalPayload = {
  generalPublicForm: {
    surgicalDaily: "0",
    surgicalCumulative: "0",
    n95Daily: "0",
    n95Cumulative: "0",
  },
  targetedGroupForm: {
    children: { surgicalDaily: "0", n95Daily: "0" },
    pregnant: { surgicalDaily: "0", n95Daily: "0" },
    elderly: { surgicalDaily: "0", n95Daily: "0" },
    heart: { surgicalDaily: "0", n95Daily: "0" },
    respiratory: { surgicalDaily: "0", n95Daily: "0" },
  },
  cleanRoomForm: {
    advanced: { standardRooms: "0" },
    general: { standardRooms: "0" },
    community: { standardRooms: "0" },
    subdistrict: { standardRooms: "0" },
  },
  cleanRoomVisitors: "0",
  vulnerableServiceForm: {
    children: { dailyServed: "0" },
    pregnant: { dailyServed: "0" },
    elderly: { dailyServed: "0" },
    heart: { dailyServed: "0" },
    respiratory: { dailyServed: "0" },
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

function normalizeNumericString(value) {
  const raw = typeof value === "string" ? value : "";
  const digitsOnly = raw.replace(/[^\d]/g, "");
  return digitsOnly.length > 0 ? digitsOnly : "0";
}

function normalizeMedicalPayload(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  const generalSource =
    source.generalPublicForm && typeof source.generalPublicForm === "object"
      ? source.generalPublicForm
      : {};
  const targetedSource =
    source.targetedGroupForm && typeof source.targetedGroupForm === "object"
      ? source.targetedGroupForm
      : {};
  const cleanRoomSource =
    source.cleanRoomForm && typeof source.cleanRoomForm === "object"
      ? source.cleanRoomForm
      : {};
  const vulnerableSource =
    source.vulnerableServiceForm && typeof source.vulnerableServiceForm === "object"
      ? source.vulnerableServiceForm
      : {};
  const inventorySource =
    source.inventorySuppliesForm && typeof source.inventorySuppliesForm === "object"
      ? source.inventorySuppliesForm
      : {};

  return {
    generalPublicForm: {
      surgicalDaily: normalizeNumericString(generalSource.surgicalDaily),
      surgicalCumulative: normalizeNumericString(generalSource.surgicalCumulative),
      n95Daily: normalizeNumericString(generalSource.n95Daily),
      n95Cumulative: normalizeNumericString(generalSource.n95Cumulative),
    },
    targetedGroupForm: {
      children: {
        surgicalDaily: normalizeNumericString(
          targetedSource.children?.surgicalDaily,
        ),
        n95Daily: normalizeNumericString(targetedSource.children?.n95Daily),
      },
      pregnant: {
        surgicalDaily: normalizeNumericString(
          targetedSource.pregnant?.surgicalDaily,
        ),
        n95Daily: normalizeNumericString(targetedSource.pregnant?.n95Daily),
      },
      elderly: {
        surgicalDaily: normalizeNumericString(
          targetedSource.elderly?.surgicalDaily,
        ),
        n95Daily: normalizeNumericString(targetedSource.elderly?.n95Daily),
      },
      heart: {
        surgicalDaily: normalizeNumericString(targetedSource.heart?.surgicalDaily),
        n95Daily: normalizeNumericString(targetedSource.heart?.n95Daily),
      },
      respiratory: {
        surgicalDaily: normalizeNumericString(
          targetedSource.respiratory?.surgicalDaily,
        ),
        n95Daily: normalizeNumericString(targetedSource.respiratory?.n95Daily),
      },
    },
    cleanRoomForm: {
      advanced: {
        standardRooms: normalizeNumericString(cleanRoomSource.advanced?.standardRooms),
      },
      general: {
        standardRooms: normalizeNumericString(cleanRoomSource.general?.standardRooms),
      },
      community: {
        standardRooms: normalizeNumericString(cleanRoomSource.community?.standardRooms),
      },
      subdistrict: {
        standardRooms: normalizeNumericString(cleanRoomSource.subdistrict?.standardRooms),
      },
    },
    cleanRoomVisitors: normalizeNumericString(source.cleanRoomVisitors),
    vulnerableServiceForm: {
      children: {
        dailyServed: normalizeNumericString(vulnerableSource.children?.dailyServed),
      },
      pregnant: {
        dailyServed: normalizeNumericString(vulnerableSource.pregnant?.dailyServed),
      },
      elderly: {
        dailyServed: normalizeNumericString(vulnerableSource.elderly?.dailyServed),
      },
      heart: {
        dailyServed: normalizeNumericString(vulnerableSource.heart?.dailyServed),
      },
      respiratory: {
        dailyServed: normalizeNumericString(vulnerableSource.respiratory?.dailyServed),
      },
    },
    inventorySuppliesForm: {
      maskDistributed: normalizeNumericString(inventorySource.maskDistributed),
      n95Distributed: normalizeNumericString(inventorySource.n95Distributed),
    },
  };
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
        payload: normalizeMedicalPayload(defaultMedicalPayload),
        updatedAt: null,
      };
    }

    return {
      reportDate: normalizeReportDate(result.rows[0].report_date),
      districtName: normalizeDistrictName(result.rows[0].district_name),
      payload: normalizeMedicalPayload({
        ...defaultMedicalPayload,
        ...result.rows[0].payload,
      }),
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
      payload: normalizeMedicalPayload({
        ...defaultMedicalPayload,
        ...row.payload,
      }),
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
    const normalizedPayload = normalizeMedicalPayload({
      ...defaultMedicalPayload,
      ...(payload && typeof payload === "object" ? payload : {}),
    });
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
      [reportDate, normalizedDistrictName, JSON.stringify(normalizedPayload)],
    );

    return {
      reportDate: normalizeReportDate(result.rows[0].report_date),
      districtName: normalizeDistrictName(result.rows[0].district_name),
      payload: normalizeMedicalPayload({
        ...defaultMedicalPayload,
        ...result.rows[0].payload,
      }),
      updatedAt: result.rows[0].updated_at,
    };
  } finally {
    client.release();
  }
}
