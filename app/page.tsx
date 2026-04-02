"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Wind,
  X,
} from "lucide-react";

type ForecastSlot = {
  label: string;
  value: number | null;
  kind: "current" | "forecast";
};

type DistrictData = {
  id: number;
  name: string;
  nameEn: string;
  pm25: number;
  pm25Avg24hr: number;
  pred1: number;
  pred2: number;
  pred3: number;
  forecastSlots: ForecastSlot[];
  aqi: number;
  affectedPop: number;
  patients: number;
  status: string;
  updatedAt: string;
};

type DashboardPayload = {
  source: string;
  province: {
    id: number;
    name: string;
    nameEn: string;
    pm25: number;
    pm25Avg24hr: number;
    aqi: number;
    updatedAt: string;
  };
  provinceSource: {
    source: string;
    stationId: string;
    stationName: string;
    areaName: string;
    pm25: number;
    aqi: number | null;
    updatedAt: string;
    updatedLabel: string;
  } | null;
  districts: DistrictData[];
  updatedAt: string;
  updatedLabel: string;
};

type MedicalMaskGroup = {
  surgicalDaily: string;
  n95Daily: string;
};

type CleanRoomEntry = {
  standardRooms: string;
};

type VulnerableDailyEntry = {
  dailyServed: string;
};

type InventorySupplyForm = {
  maskDistributed: string;
  n95Distributed: string;
};

type MedicalPublicHealthPayload = {
  generalPublicForm: typeof initialGeneralPublicForm;
  targetedGroupForm: typeof initialTargetedGroupForm;
  cleanRoomForm: typeof initialCleanRoomForm;
  cleanRoomVisitors: string;
  vulnerableServiceForm: typeof initialVulnerableServiceForm;
  inventorySuppliesForm: typeof initialInventorySuppliesForm;
};

type MedicalPublicHealthRecord = {
  reportDate: string;
  districtName: string;
  payload: MedicalPublicHealthPayload;
  updatedAt: string | null;
};

const medicalStorageKey = "pm25plk-medical-popup";
const medicalCardTitle = "ด้านการแพทย์/สาธารณสุข";

const targetedGroupMeta = [
  {
    id: "children",
    title: "2.1 กลุ่มเด็กเล็ก (0-5 ปี)",
    surgicalCumulative: "0",
    n95Cumulative: "0",
  },
  {
    id: "pregnant",
    title: "2.2 กลุ่มหญิงตั้งครรภ์",
    surgicalCumulative: "0",
    n95Cumulative: "0",
  },
  {
    id: "elderly",
    title: "2.3 กลุ่มผู้สูงอายุ",
    surgicalCumulative: "5,970",
    n95Cumulative: "463",
  },
  {
    id: "heart",
    title: "2.4 กลุ่มผู้ที่มีโรคหัวใจ",
    surgicalCumulative: "100",
    n95Cumulative: "50",
  },
  {
    id: "respiratory",
    title: "2.5 กลุ่มผู้ที่มีโรคระบบทางเดินหายใจ",
    surgicalCumulative: "2,310",
    n95Cumulative: "340",
  },
] as const;

const cleanRoomMeta = [
  {
    id: "advanced",
    label: "โรงพยาบาลศูนย์",
    hospitalCount: "0",
    targetRooms: "1",
  },
  {
    id: "general",
    label: "โรงพยาบาลทั่วไป",
    hospitalCount: "0",
    targetRooms: "0",
  },
  {
    id: "community",
    label: "โรงพยาบาลชุมชน",
    hospitalCount: "0",
    targetRooms: "8",
  },
  {
    id: "subdistrict",
    label: "โรงพยาบาลส่งเสริมสุขภาพตำบล",
    hospitalCount: "0",
    targetRooms: "107",
  },
] as const;

const vulnerableServiceMeta = [
  {
    id: "children",
    label: "กลุ่มเด็กเล็ก (0-5 ปี)",
    targetPeople: "16,303",
  },
  {
    id: "pregnant",
    label: "กลุ่มหญิงตั้งครรภ์",
    targetPeople: "3,075",
  },
  {
    id: "elderly",
    label: "กลุ่มผู้สูงอายุ",
    targetPeople: "182,195",
  },
  {
    id: "heart",
    label: "กลุ่มผู้ที่มีโรคหัวใจ",
    targetPeople: "87",
  },
  {
    id: "respiratory",
    label: "กลุ่มผู้ที่มีโรคระบบทางเดินหายใจ",
    targetPeople: "93,713",
  },
] as const;

const initialGeneralPublicForm = {
  surgicalDaily: "250",
  surgicalCumulative: "20,420",
  n95Daily: "100",
  n95Cumulative: "350",
};

const initialTargetedGroupForm: Record<
  (typeof targetedGroupMeta)[number]["id"],
  MedicalMaskGroup
> = {
  children: { surgicalDaily: "0", n95Daily: "0" },
  pregnant: { surgicalDaily: "0", n95Daily: "0" },
  elderly: { surgicalDaily: "250", n95Daily: "0" },
  heart: { surgicalDaily: "0", n95Daily: "0" },
  respiratory: { surgicalDaily: "0", n95Daily: "0" },
};

const initialCleanRoomForm: Record<
  (typeof cleanRoomMeta)[number]["id"],
  CleanRoomEntry
> = {
  advanced: { standardRooms: "1" },
  general: { standardRooms: "0" },
  community: { standardRooms: "8" },
  subdistrict: { standardRooms: "107" },
};

const initialVulnerableServiceForm: Record<
  (typeof vulnerableServiceMeta)[number]["id"],
  VulnerableDailyEntry
> = {
  children: { dailyServed: "594" },
  pregnant: { dailyServed: "0" },
  elderly: { dailyServed: "4732" },
  heart: { dailyServed: "0" },
  respiratory: { dailyServed: "2385" },
};

const initialInventorySuppliesForm: InventorySupplyForm = {
  maskDistributed: "0",
  n95Distributed: "0",
};

function getStatusColor(status: string) {
  switch (status) {
    case "Red":
      return "bg-red-500 text-white";
    case "Orange":
      return "bg-orange-500 text-white";
    case "Yellow":
      return "bg-yellow-400 text-slate-900";
    case "Green":
      return "bg-emerald-500 text-white";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

function getChartColor(status: string) {
  switch (status) {
    case "Red":
      return "#ef4444";
    case "Orange":
      return "#f97316";
    case "Yellow":
      return "#facc15";
    case "Green":
      return "#10b981";
    default:
      return "#cbd5e1";
  }
}

function formatPmValue(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDailyLabel(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
  }).format(new Date(value));
}

function parseNumberString(value: string) {
  const normalized = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(normalized) ? normalized : 0;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDistrictId, setActiveDistrictId] = useState<number | null>(null);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [generalPublicForm, setGeneralPublicForm] = useState(
    initialGeneralPublicForm,
  );
  const [targetedGroupForm, setTargetedGroupForm] = useState(
    initialTargetedGroupForm,
  );
  const [cleanRoomForm, setCleanRoomForm] = useState(initialCleanRoomForm);
  const [cleanRoomVisitors, setCleanRoomVisitors] = useState("750");
  const [vulnerableServiceForm, setVulnerableServiceForm] = useState(
    initialVulnerableServiceForm,
  );
  const [inventorySuppliesForm, setInventorySuppliesForm] = useState(
    initialInventorySuppliesForm,
  );
  const [medicalReportDate, setMedicalReportDate] = useState("");
  const [selectedMedicalDistrict, setSelectedMedicalDistrict] = useState("");
  const [isMedicalSaving, setIsMedicalSaving] = useState(false);
  const [medicalSaveMessage, setMedicalSaveMessage] = useState<string | null>(
    null,
  );
  const [allMedicalRecords, setAllMedicalRecords] = useState<
    MedicalPublicHealthRecord[]
  >([]);
  const [selectedActivityDate, setSelectedActivityDate] = useState("");
  const districtData = useMemo(() => data?.districts ?? [], [data]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/gistda", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load PM2.5 data from GISTDA");
        }

        const payload = (await response.json()) as DashboardPayload;
        if (!cancelled) {
          setData(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unexpected dashboard error",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    const intervalId = window.setInterval(loadDashboard, 60 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(medicalStorageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        generalPublicForm?: typeof initialGeneralPublicForm;
        targetedGroupForm?: typeof initialTargetedGroupForm;
        cleanRoomForm?: typeof initialCleanRoomForm;
        cleanRoomVisitors?: string;
        vulnerableServiceForm?: typeof initialVulnerableServiceForm;
        inventorySuppliesForm?: typeof initialInventorySuppliesForm;
      };

      if (parsed.generalPublicForm) {
        setGeneralPublicForm(parsed.generalPublicForm);
      }
      if (parsed.targetedGroupForm) {
        setTargetedGroupForm(parsed.targetedGroupForm);
      }
      if (parsed.cleanRoomForm) {
        setCleanRoomForm(parsed.cleanRoomForm);
      }
      if (typeof parsed.cleanRoomVisitors === "string") {
        setCleanRoomVisitors(parsed.cleanRoomVisitors);
      }
      if (parsed.vulnerableServiceForm) {
        setVulnerableServiceForm(parsed.vulnerableServiceForm);
      }
      if (parsed.inventorySuppliesForm) {
        setInventorySuppliesForm(parsed.inventorySuppliesForm);
      }
    } catch {
      window.localStorage.removeItem(medicalStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!selectedMedicalDistrict && districtData.length > 0) {
      setSelectedMedicalDistrict(districtData[0].name);
    }
  }, [districtData, selectedMedicalDistrict]);

  useEffect(() => {
    let cancelled = false;

    async function loadMedicalPublicHealth() {
      try {
        const params = new URLSearchParams();
        if (medicalReportDate) {
          params.set("reportDate", medicalReportDate);
        }
        if (selectedMedicalDistrict) {
          params.set("districtName", selectedMedicalDistrict);
        }

        const response = await fetch(
          `/api/medical-public-health${params.size ? `?${params.toString()}` : ""}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load medical public health form");
        }

        const result = (await response.json()) as {
          reportDate: string;
          districtName: string;
          payload: MedicalPublicHealthPayload;
          updatedAt: string | null;
        };

        if (cancelled) return;

        setMedicalReportDate(result.reportDate);
        setSelectedMedicalDistrict(result.districtName);
        setGeneralPublicForm(result.payload.generalPublicForm);
        setTargetedGroupForm(result.payload.targetedGroupForm);
        setCleanRoomForm(result.payload.cleanRoomForm);
        setCleanRoomVisitors(result.payload.cleanRoomVisitors);
        setVulnerableServiceForm(result.payload.vulnerableServiceForm);
        setInventorySuppliesForm(result.payload.inventorySuppliesForm);
      } catch {
        if (!cancelled) {
          setMedicalSaveMessage(
            "โหลดข้อมูลฟอร์มจากฐานข้อมูลไม่สำเร็จ ระบบจะใช้ค่าล่าสุดในเครื่องชั่วคราว",
          );
        }
      }
    }

    loadMedicalPublicHealth();

    return () => {
      cancelled = true;
    };
  }, [medicalReportDate, selectedMedicalDistrict]);

  useEffect(() => {
    let cancelled = false;

    async function loadAllMedicalRecords() {
      try {
        const response = await fetch("/api/medical-public-health?listAll=true", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load all medical public health records");
        }

        const result = (await response.json()) as MedicalPublicHealthRecord[];
        if (!cancelled) {
          setAllMedicalRecords(result);
        }
      } catch {
        if (!cancelled) {
          setAllMedicalRecords([]);
        }
      }
    }

    loadAllMedicalRecords();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      medicalStorageKey,
      JSON.stringify({
        generalPublicForm,
        targetedGroupForm,
        cleanRoomForm,
        cleanRoomVisitors,
        vulnerableServiceForm,
        inventorySuppliesForm,
      }),
    );
  }, [
    cleanRoomForm,
    cleanRoomVisitors,
    generalPublicForm,
    inventorySuppliesForm,
    targetedGroupForm,
    vulnerableServiceForm,
  ]);

  useEffect(() => {
    if (activeDistrictId === null && districtData.length) {
      setActiveDistrictId(districtData[0].id);
    }
  }, [activeDistrictId, districtData]);

  const activeDistrict = useMemo(
    () =>
      districtData.find((district) => district.id === activeDistrictId) ??
      districtData[0] ??
      null,
    [activeDistrictId, districtData],
  );

  const medicalActivitiesByDate = useMemo(() => {
    const sourceRecords =
      allMedicalRecords.length > 0
        ? allMedicalRecords
        : [
            {
              reportDate:
                medicalReportDate || new Date().toISOString().slice(0, 10),
              districtName: selectedMedicalDistrict || "เมืองพิษณุโลก",
              payload: {
                generalPublicForm,
                targetedGroupForm,
                cleanRoomForm,
                cleanRoomVisitors,
                vulnerableServiceForm,
                inventorySuppliesForm,
              },
              updatedAt: null,
            },
          ];

    return sourceRecords.reduce<
      Record<
        string,
        Array<{
          id: string;
          district: string;
          category: string;
          title: string;
          details: string;
          value?: string;
        }>
      >
    >((acc, record) => {
      const entries: Array<{
        id: string;
        district: string;
        category: string;
        title: string;
        details: string;
        value?: string;
      }> = [];

      entries.push({
        id: `${record.reportDate}-${record.districtName}-general-public`,
        district: record.districtName,
        category: "ประชาชนทั่วไป",
        title: "แจกหน้ากากให้ประชาชนทั่วไป",
        details: `Surgical Mask ${parseNumberString(
          record.payload.generalPublicForm.surgicalDaily,
        ).toLocaleString()} ชิ้น, N95 ${parseNumberString(
          record.payload.generalPublicForm.n95Daily,
        ).toLocaleString()} ชิ้น`,
        value: `${(
          parseNumberString(record.payload.generalPublicForm.surgicalDaily) +
          parseNumberString(record.payload.generalPublicForm.n95Daily)
        ).toLocaleString()} ชิ้น`,
      });

      const targetedDetails = targetedGroupMeta
        .map((group) => {
          const surgical = parseNumberString(
            record.payload.targetedGroupForm[group.id].surgicalDaily,
          );
          const n95 = parseNumberString(
            record.payload.targetedGroupForm[group.id].n95Daily,
          );
          const total = surgical + n95;

          if (total === 0) return null;

          return `${group.title.replace(/^\d+\.\d+\s*/, "")} ${total.toLocaleString()} ชิ้น`;
        })
        .filter(Boolean)
        .join(", ");

      entries.push({
        id: `${record.reportDate}-${record.districtName}-targeted-groups`,
        district: record.districtName,
        category: "กลุ่มเปราะบาง",
        title: "แจกหน้ากากแยกตามกลุ่มเป้าหมาย",
        details: targetedDetails || "ยังไม่มีการแจกเพิ่มเติมในวันนี้",
      });

      const standardRoomTotal = cleanRoomMeta.reduce(
        (sum, row) =>
          sum + parseNumberString(record.payload.cleanRoomForm[row.id].standardRooms),
        0,
      );

      entries.push({
        id: `${record.reportDate}-${record.districtName}-clean-room`,
        district: record.districtName,
        category: "ห้องปลอดฝุ่น",
        title: "การให้บริการห้องปลอดฝุ่นในสถานบริการสาธารณสุข",
        details: `ห้องที่ผ่านมาตรฐาน ${standardRoomTotal.toLocaleString()} ห้อง, ผู้รับบริการ ${parseNumberString(
          record.payload.cleanRoomVisitors,
        ).toLocaleString()} ราย`,
        value: `${parseNumberString(record.payload.cleanRoomVisitors).toLocaleString()} ราย`,
      });

      const vulnerableDetails = vulnerableServiceMeta
        .map((group) => {
          const served = parseNumberString(
            record.payload.vulnerableServiceForm[group.id].dailyServed,
          );
          if (served === 0) return null;
          return `${group.label} ${served.toLocaleString()} คน`;
        })
        .filter(Boolean)
        .join(", ");

      entries.push({
        id: `${record.reportDate}-${record.districtName}-vulnerable-groups-service`,
        district: record.districtName,
        category: "Vulnerable Groups",
        title: "ดูแลกลุ่มเปราะบางรายวัน",
        details:
          vulnerableDetails || "ยังไม่มีการบันทึกผู้ได้รับการดูแลในวันนี้",
      });

      entries.push({
        id: `${record.reportDate}-${record.districtName}-inventory-supplies`,
        district: record.districtName,
        category: "เวชภัณฑ์คงคลัง",
        title: "การแจกเวชภัณฑ์คงคลัง",
        details: `การแจกแมส ${parseNumberString(
          record.payload.inventorySuppliesForm.maskDistributed,
        ).toLocaleString()} ชิ้น, N95 ${parseNumberString(
          record.payload.inventorySuppliesForm.n95Distributed,
        ).toLocaleString()} ชิ้น`,
        value: `${(
          parseNumberString(record.payload.inventorySuppliesForm.maskDistributed) +
          parseNumberString(record.payload.inventorySuppliesForm.n95Distributed)
        ).toLocaleString()} ชิ้น`,
      });

      if (!acc[record.reportDate]) {
        acc[record.reportDate] = [];
      }

      acc[record.reportDate].push(...entries);
      return acc;
    }, {});
  }, [
    allMedicalRecords,
    cleanRoomForm,
    cleanRoomVisitors,
    generalPublicForm,
    inventorySuppliesForm,
    medicalReportDate,
    selectedMedicalDistrict,
    targetedGroupForm,
    vulnerableServiceForm,
  ]);

  const activityDateOptions = useMemo(
    () =>
      Object.keys(medicalActivitiesByDate).sort((left, right) =>
        right.localeCompare(left),
      ),
    [medicalActivitiesByDate],
  );

  useEffect(() => {
    if (activityDateOptions.length === 0) {
      setSelectedActivityDate("");
      return;
    }

    if (!selectedActivityDate || !activityDateOptions.includes(selectedActivityDate)) {
      setSelectedActivityDate(activityDateOptions[0]);
    }
  }, [activityDateOptions, selectedActivityDate]);

  const filteredActivityEntries = useMemo(
    () =>
      selectedActivityDate ? (medicalActivitiesByDate[selectedActivityDate] ?? []) : [],
    [medicalActivitiesByDate, selectedActivityDate],
  );

  const activityEntriesByCategory = useMemo(() => {
    return filteredActivityEntries.reduce<
      Record<
        string,
        Array<{
          id: string;
          district: string;
          category: string;
          title: string;
          details: string;
          value?: string;
        }>
      >
    >((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }

      acc[entry.category].push(entry);
      return acc;
    }, {});
  }, [filteredActivityEntries]);

  function openForecastModal(districtId: number) {
    setActiveDistrictId(districtId);
    setIsForecastModalOpen(true);
  }

  function closeForecastModal() {
    setIsForecastModalOpen(false);
  }

  function openMedicalModal() {
    setIsMedicalModalOpen(true);
  }

  function closeMedicalModal() {
    setIsMedicalModalOpen(false);
  }

  function handleGeneralPublicChange(
    field: keyof typeof initialGeneralPublicForm,
    value: string,
  ) {
    setGeneralPublicForm((current) => ({ ...current, [field]: value }));
  }

  function handleTargetedGroupChange(
    groupId: keyof typeof initialTargetedGroupForm,
    field: keyof MedicalMaskGroup,
    value: string,
  ) {
    setTargetedGroupForm((current) => ({
      ...current,
      [groupId]: {
        ...current[groupId],
        [field]: value,
      },
    }));
  }

  function handleCleanRoomChange(
    rowId: keyof typeof initialCleanRoomForm,
    value: string,
  ) {
    setCleanRoomForm((current) => ({
      ...current,
      [rowId]: {
        ...current[rowId],
        standardRooms: value,
      },
    }));
  }

  function handleVulnerableServiceChange(
    rowId: keyof typeof initialVulnerableServiceForm,
    value: string,
  ) {
    setVulnerableServiceForm((current) => ({
      ...current,
      [rowId]: {
        ...current[rowId],
        dailyServed: value,
      },
    }));
  }

  function handleInventorySuppliesChange(
    field: keyof typeof initialInventorySuppliesForm,
    value: string,
  ) {
    setInventorySuppliesForm((current) => ({ ...current, [field]: value }));
  }

  async function handleMedicalSave() {
    try {
      setIsMedicalSaving(true);
      setMedicalSaveMessage(null);

      const payload: MedicalPublicHealthPayload = {
        generalPublicForm,
        targetedGroupForm,
        cleanRoomForm,
        cleanRoomVisitors,
        vulnerableServiceForm,
        inventorySuppliesForm,
      };

      const response = await fetch("/api/medical-public-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportDate: medicalReportDate || undefined,
          districtName: selectedMedicalDistrict || undefined,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save medical public health form");
      }

      const result = (await response.json()) as {
        reportDate: string;
        districtName: string;
      };

      setMedicalReportDate(result.reportDate);
      setSelectedMedicalDistrict(result.districtName);
      setMedicalSaveMessage(
        `บันทึกข้อมูลวันที่ ${result.reportDate} ของอำเภอ ${result.districtName} เรียบร้อย`,
      );
      const recordsResponse = await fetch("/api/medical-public-health?listAll=true", {
        cache: "no-store",
      });
      if (recordsResponse.ok) {
        const records = (await recordsResponse.json()) as MedicalPublicHealthRecord[];
        setAllMedicalRecords(records);
      }
    } catch (saveError) {
      setMedicalSaveMessage(
        saveError instanceof Error
          ? saveError.message
          : "บันทึกข้อมูลไม่สำเร็จ",
      );
    } finally {
      setIsMedicalSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-orange-50/30 pb-12 font-sans text-slate-900">
      <header className="sticky top-0 z-10 border-b border-orange-700 bg-orange-600 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
              <Wind className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight text-white">
                ระบบเฝ้าระวังสถานการณ์ฝุ่น PM 2.5
              </h1>
              <p className="text-xs font-medium text-orange-100">
                Phitsanulok PM 2.5 Dashboard จากข้อมูล GISTDA
              </p>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">อัปเดตล่าสุด</p>
            <p className="text-xs text-orange-100">
              {data ? data.updatedLabel : "กำลังโหลดข้อมูล..."}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            ไม่สามารถดึงข้อมูลจาก GISTDA ได้: {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-500">
                ค่าเฉลี่ย PM 2.5 วันนี้
              </h3>
              <Wind className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {loading
                  ? "--"
                  : formatPmValue(
                      data?.provinceSource?.pm25 ?? data?.province.pm25 ?? 0,
                    )}
              </span>
              <span className="text-sm font-medium text-slate-500">ug/m3</span>
            </div>
            <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              ข้อมูลของจังหวัด
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-500">
                AQI ของจังหวัด
              </h3>
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {loading ? "--" : data?.province.aqi ?? "--"}
              </span>
              <span className="text-sm font-medium text-slate-500">AQI</span>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-500">
              จังหวัดพิษณุโลก PM2.5 เฉลี่ย 24 ชม.{" "}
              {loading
                ? "--"
                : formatPmValue(data?.province.pm25Avg24hr ?? 0)}{" "}
              ug/m3
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={openMedicalModal}
              className="flex h-full w-full items-start justify-between rounded-2xl border border-orange-100 bg-white p-6 text-left shadow-sm transition hover:border-orange-300 hover:bg-orange-50/30"
            >
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Activity className="h-5 w-5 text-orange-500" />
                  {medicalCardTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  กดเพื่อเปิด pop-up และกรอกรายละเอียดของหมวดงานด้านการแพทย์/สาธารณสุข
                </p>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                เปิดรายละเอียด
              </span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm lg:col-span-2"
          >
            <div className="flex items-center justify-between border-b border-orange-100 p-6">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  ค่า PM2.5 และ AQI รายอำเภอ จังหวัดพิษณุโลก
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  PM2.5 ปัจจุบันจาก GISTDA และ AQI คำนวณจากค่าเฉลี่ย 24 ชั่วโมง
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-orange-50/50 text-xs uppercase tracking-wider text-orange-800">
                    <th className="border-b border-orange-100 p-4 font-semibold">
                      อำเภอ
                    </th>
                    <th className="border-b border-orange-100 p-4 text-right font-semibold">
                      PM2.5 (ชม.ล่าสุด)
                    </th>
                    <th className="border-b border-orange-100 p-4 text-right font-semibold">
                      PM2.5 เฉลี่ย 24 ชม.
                    </th>
                    <th className="border-b border-orange-100 p-4 text-center font-semibold">
                      AQI
                    </th>
                    <th className="border-b border-orange-100 p-4 text-right font-semibold">
                      ประชากรได้รับผลกระทบ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {districtData.map((district) => (
                    <tr
                      key={district.id}
                      className="transition-colors hover:bg-orange-50/30"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        <button
                          type="button"
                          onClick={() => openForecastModal(district.id)}
                          className="font-medium text-slate-900 underline decoration-orange-300 underline-offset-4 transition hover:text-orange-700 hover:decoration-orange-600"
                        >
                          {district.name}
                        </button>
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-slate-700">
                        {formatPmValue(district.pm25)}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-600">
                        {formatPmValue(district.pm25Avg24hr)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${getStatusColor(district.status)}`}
                        >
                          {district.aqi}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        {district.affectedPop.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && districtData.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  ไม่พบข้อมูลรายอำเภอจาก GISTDA
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col rounded-2xl border border-orange-100 bg-white shadow-sm"
          >
            <div className="border-b border-orange-100 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Activity className="h-5 w-5 text-orange-500" />
                ผู้ป่วยรายอำเภอ
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                แสดงเทียบกับสีความเสี่ยงจาก AQI ของ GISTDA
              </p>
            </div>
            <div className="h-[420px] min-h-[350px] flex-1 p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={districtData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#ffedd5"
                    strokeDasharray="3 3"
                    horizontal
                    vertical={false}
                  />
                  <XAxis hide type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    width={88}
                  />
                  <Tooltip
                    cursor={{ fill: "#fff7ed" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #ffedd5",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [`${value ?? 0} ราย`, "จำนวนผู้ป่วย"]}
                  />
                  <Bar dataKey="patients" radius={[0, 4, 4, 0]} barSize={20}>
                    {districtData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getChartColor(entry.status)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {isForecastModalOpen && activeDistrict ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-orange-100 bg-orange-50/70 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    คาดการณ์ PM2.5 รายอำเภอ
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {activeDistrict.name} จากข้อมูล GISTDA
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForecastModal}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                  aria-label="ปิดหน้าต่างคาดการณ์"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-orange-200 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      PM2.5 (ชม.ล่าสุด)
                    </div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {formatPmValue(activeDistrict.pm25)}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">ug/m3</div>
                  </div>
                  <div className="rounded-2xl border border-orange-200 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      PM2.5 เฉลี่ย 24 ชม.
                    </div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {formatPmValue(activeDistrict.pm25Avg24hr)}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">ug/m3</div>
                  </div>
                  <div className="rounded-2xl border border-orange-200 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      AQI
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-2xl font-bold ${getStatusColor(activeDistrict.status)}`}
                      >
                        {activeDistrict.aqi}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {activeDistrict.forecastSlots[0]?.label ?? "ชั่วโมงนี้"}
                    </div>
                    <div className="mt-3 text-3xl font-bold text-slate-900">
                      {formatPmValue(activeDistrict.pm25)}
                    </div>
                    <div className="mt-2 text-sm text-orange-700">
                      ชั่วโมงล่าสุด
                    </div>
                  </div>
                  {activeDistrict.forecastSlots
                    .filter((slot) => slot.kind === "forecast")
                    .map((slot) => (
                      <div
                        key={slot.label}
                        className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5"
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {slot.label}
                        </div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">
                          {formatPmValue(slot.value ?? 0)}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          คาดการณ์ GISTDA
                        </div>
                      </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white">
                  <div className="border-b border-orange-100 px-5 py-4 text-sm font-semibold text-slate-900">
                    รายการคาดการณ์
                  </div>
                  <div className="divide-y divide-orange-50">
                    <div className="grid grid-cols-[140px_1fr] px-5 py-4 text-sm">
                      <div className="font-medium text-slate-500">
                        ชั่วโมงล่าสุด
                      </div>
                      <div className="font-semibold text-slate-900">
                        {activeDistrict.forecastSlots[0]?.label ?? "-"} :{" "}
                        {formatPmValue(activeDistrict.pm25)} ug/m3
                      </div>
                    </div>
                    {activeDistrict.forecastSlots
                      .filter((slot) => slot.kind === "forecast")
                      .map((slot) => (
                        <div
                          key={slot.label}
                          className="grid grid-cols-[140px_1fr] px-5 py-4 text-sm"
                        >
                          <div className="font-medium text-slate-500">
                            {slot.label}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {formatPmValue(slot.value ?? 0)} ug/m3
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isMedicalModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8">
            <div className="max-h-[92vh] w-full max-w-[1800px] overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-orange-100 bg-orange-50/70 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {medicalCardTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    แบบฟอร์มด้านการแพทย์/สาธารณสุขสำหรับกรอกข้อมูลรายวัน
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeMedicalModal}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                  aria-label="ปิดหน้าต่างด้านการแพทย์และสาธารณสุข"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[calc(92vh-96px)] space-y-6 overflow-y-auto p-6">
                <div className="grid gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm text-slate-700 lg:grid-cols-[1.1fr_0.8fr_1fr] lg:items-end">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      อำเภอ
                    </label>
                    <select
                      value={selectedMedicalDistrict}
                      onChange={(event) =>
                        setSelectedMedicalDistrict(event.target.value)
                      }
                      className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                    >
                      {districtData.map((district) => (
                        <option key={district.id} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      วันที่บันทึกข้อมูล
                    </label>
                    <input
                      type="date"
                      value={medicalReportDate}
                      onChange={(event) => setMedicalReportDate(event.target.value)}
                      className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                    />
                  </div>

                  {medicalSaveMessage ? (
                    <div className="font-medium text-orange-700 lg:text-right">
                      {medicalSaveMessage}
                    </div>
                  ) : (
                    <div className="text-slate-500 lg:text-right">
                      เลือกอำเภอและวันที่ก่อนบันทึกข้อมูล
                    </div>
                  )}
                </div>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-fuchsia-600 px-2 text-sm font-bold text-white">
                      1
                    </span>
                    <h3 className="text-2xl font-bold text-fuchsia-600">
                      ประชาชนทั่วไป
                    </h3>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-base font-medium text-slate-700">
                        หน้ากาก Surgical Mask (ชิ้น)
                        <span className="ml-1 text-sm text-slate-400">
                          (รายวัน)
                        </span>
                      </label>
                      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={generalPublicForm.surgicalDaily}
                          onChange={(event) =>
                            handleGeneralPublicChange(
                              "surgicalDaily",
                              event.target.value,
                            )
                          }
                          className="w-full flex-1 px-4 py-4 text-3xl text-slate-800 outline-none"
                        />
                        <div className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-base text-slate-600">
                          สะสม: {generalPublicForm.surgicalCumulative}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-base font-medium text-slate-700">
                        หน้ากาก N95 (ชิ้น)
                        <span className="ml-1 text-sm text-slate-400">
                          (รายวัน)
                        </span>
                      </label>
                      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={generalPublicForm.n95Daily}
                          onChange={(event) =>
                            handleGeneralPublicChange(
                              "n95Daily",
                              event.target.value,
                            )
                          }
                          className="w-full flex-1 px-4 py-4 text-3xl text-slate-800 outline-none"
                        />
                        <div className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-base text-slate-600">
                          สะสม: {generalPublicForm.n95Cumulative}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-fuchsia-600 px-2 text-sm font-bold text-white">
                      2
                    </span>
                    <h3 className="text-2xl font-bold text-fuchsia-600">
                      กลุ่มเปราะบาง (แยกตามกลุ่มเป้าหมาย)
                    </h3>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-3">
                    {targetedGroupMeta.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                      >
                        <h4 className="mb-8 text-xl font-bold text-slate-600">
                          {group.title}
                        </h4>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-base text-slate-700">
                              Surgical Mask (ชิ้น)
                            </label>
                            <div className="flex overflow-hidden rounded-2xl border border-slate-200">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={targetedGroupForm[group.id].surgicalDaily}
                                onChange={(event) =>
                                  handleTargetedGroupChange(
                                    group.id,
                                    "surgicalDaily",
                                    event.target.value,
                                  )
                                }
                                className="w-full flex-1 px-4 py-3 text-2xl text-slate-800 outline-none"
                              />
                              <div className="flex items-center bg-slate-50 px-4 text-sm text-slate-600">
                                สะสม: {group.surgicalCumulative}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-base text-slate-700">
                              N95 (ชิ้น)
                            </label>
                            <div className="flex overflow-hidden rounded-2xl border border-slate-200">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={targetedGroupForm[group.id].n95Daily}
                                onChange={(event) =>
                                  handleTargetedGroupChange(
                                    group.id,
                                    "n95Daily",
                                    event.target.value,
                                  )
                                }
                                className="w-full flex-1 px-4 py-3 text-2xl text-slate-800 outline-none"
                              />
                              <div className="flex items-center bg-slate-50 px-4 text-sm text-slate-600">
                                สะสม: {group.n95Cumulative}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                    <Activity className="h-7 w-7 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-indigo-600">
                      ห้องปลอดฝุ่น (Clean Room)
                    </h3>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr] bg-slate-50 px-4 py-4 text-center text-sm font-semibold text-slate-500">
                      <div className="text-left">ประเภทสถานพยาบาล</div>
                      <div>
                        จำนวนสถานพยาบาล
                        <br />
                        ในจังหวัด (แห่ง)
                      </div>
                      <div>
                        จำนวนห้องปลอดฝุ่น
                        <br />
                        ตามเป้าหมาย (ห้อง)
                      </div>
                      <div>
                        จำนวนห้องปลอดฝุ่นที่ผ่านมาตรฐาน
                        <br />
                        ห้องปลอดฝุ่นของกรมอนามัย
                      </div>
                    </div>

                    {cleanRoomMeta.map((row, index) => (
                      <div
                        key={row.id}
                        className={`grid grid-cols-[2fr_1fr_1fr_1.2fr] items-center px-4 py-3 ${
                          index % 2 === 1 ? "bg-slate-50/80" : "bg-white"
                        }`}
                      >
                        <div className="text-2xl text-slate-700">{row.label}</div>
                        <div className="text-center text-3xl font-semibold text-slate-700">
                          {row.hospitalCount}
                        </div>
                        <div className="text-center text-3xl font-semibold text-slate-700">
                          {row.targetRooms}
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cleanRoomForm[row.id].standardRooms}
                            onChange={(event) =>
                              handleCleanRoomChange(row.id, event.target.value)
                            }
                            className="w-40 rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl text-slate-700 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 max-w-xl rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <label className="block text-2xl font-bold text-slate-700">
                      จำนวนผู้รับบริการห้องปลอดฝุ่นในสถานบริการสาธารณสุข (ราย)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cleanRoomVisitors}
                      onChange={(event) => setCleanRoomVisitors(event.target.value)}
                      className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-4 text-3xl text-slate-800 outline-none"
                    />
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                    <Activity className="h-7 w-7 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-indigo-600">
                      กลุ่มเปราะบาง (Vulnerable Groups)
                    </h3>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-[2fr_1fr_1.2fr] bg-slate-50 px-4 py-4 text-center text-sm font-semibold text-slate-500">
                      <div className="text-left">กลุ่มเป้าหมาย</div>
                      <div>
                        จำนวนเป้าหมายทั้งจังหวัด (คน)
                        <br />
                        (จากรายงานเป้าหมาย)
                      </div>
                      <div>
                        ได้รับการดูแลวันนี้ (คน)
                        <br />
                        (รายวัน)
                      </div>
                    </div>

                    {vulnerableServiceMeta.map((row, index) => (
                      <div
                        key={row.id}
                        className={`grid grid-cols-[2fr_1fr_1.2fr] items-center px-4 py-3 ${
                          index % 2 === 1 ? "bg-slate-50/80" : "bg-white"
                        }`}
                      >
                        <div className="text-2xl text-slate-700">{row.label}</div>
                        <div className="text-center text-3xl font-semibold text-slate-700">
                          {row.targetPeople}
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={vulnerableServiceForm[row.id].dailyServed}
                            onChange={(event) =>
                              handleVulnerableServiceChange(
                                row.id,
                                event.target.value,
                              )
                            }
                            className="w-full max-w-md rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl text-slate-700 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                    <ShieldCheck className="h-7 w-7 text-orange-600" />
                    <h3 className="text-2xl font-bold text-orange-600">
                      เวชภัณฑ์คงคลัง
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-base font-medium text-slate-700">
                        การแจกแมส
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inventorySuppliesForm.maskDistributed}
                        onChange={(event) =>
                          handleInventorySuppliesChange(
                            "maskDistributed",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-3xl text-slate-800 outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-base font-medium text-slate-700">
                        N95
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inventorySuppliesForm.n95Distributed}
                        onChange={(event) =>
                          handleInventorySuppliesChange(
                            "n95Distributed",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-3xl text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </section>

                <div className="sticky bottom-0 flex justify-end border-t border-slate-100 bg-white/95 px-2 pt-4 backdrop-blur">
                  <button
                    type="button"
                    onClick={handleMedicalSave}
                    disabled={isMedicalSaving}
                    className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {isMedicalSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลวันนี้"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 gap-6"
        >
          <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div className="border-b border-orange-100 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                    รายการกิจกรรมรายวัน
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    แสดงสรุปรายการจากข้อมูลที่บันทึกในแบบฟอร์มด้านการแพทย์/สาธารณสุข
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    เลือกวันที่
                  </label>
                  <select
                    value={selectedActivityDate}
                    onChange={(event) => setSelectedActivityDate(event.target.value)}
                    className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                  >
                    {activityDateOptions.map((date) => (
                      <option key={date} value={date}>
                        {formatDailyLabel(date)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[720px] space-y-5 overflow-y-auto p-6">
              {selectedActivityDate ? (
                <div className="overflow-hidden rounded-2xl border border-orange-100">
                  <div className="flex items-center justify-between bg-orange-50/70 px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatDailyLabel(selectedActivityDate)}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {filteredActivityEntries.length} รายการ
                    </div>
                  </div>
                  <div className="space-y-5 bg-white p-5">
                    {Object.entries(activityEntriesByCategory).map(
                      ([category, entries]) => (
                        <div
                          key={category}
                          className="overflow-hidden rounded-2xl border border-orange-100"
                        >
                          <div className="bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800">
                            {category}
                          </div>
                          <div className="divide-y divide-orange-50 bg-white">
                            {entries.map((entry) => (
                              <div
                                key={entry.id}
                                className="grid gap-3 px-5 py-4 md:grid-cols-[180px_220px_1fr]"
                              >
                                <div>
                                  <div className="text-xs font-medium text-slate-500">
                                    อำเภอ
                                  </div>
                                  <div className="mt-1 font-semibold text-slate-900">
                                    {entry.district}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-slate-500">
                                    รายการ
                                  </div>
                                  <div className="mt-1 font-semibold text-slate-900">
                                    {entry.title}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-slate-500">
                                    รายละเอียด
                                  </div>
                                  <div className="mt-1 text-sm text-slate-700">
                                    {entry.details || "-"}
                                  </div>
                                  {entry.value ? (
                                    <div className="mt-1 text-xs text-slate-500">
                                      รวมวันนี้ {entry.value}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-6 text-sm text-slate-500">
                  ยังไม่มีข้อมูลกิจกรรมรายวันให้แสดง
                </div>
              )}
            </div>
          </section>
        </motion.div>

        {data ? (
          <div className="rounded-2xl border border-orange-100 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            จังหวัด {data.province.name} มี PM2.5 ปัจจุบัน{" "}
            {formatPmValue(data.province.pm25)} ug/m3, ค่าเฉลี่ย 24 ชั่วโมง{" "}
            {formatPmValue(data.province.pm25Avg24hr)} ug/m3, AQI{" "}
            {data.province.aqi} จากแหล่งข้อมูล {data.source}
          </div>
        ) : null}
      </main>
    </div>
  );
}
