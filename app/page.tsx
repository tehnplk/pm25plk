"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import {
  Wind,
  Users,
  Activity,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';

// Mock Data
const districtData = [
  { id: 1, name: 'เมืองพิษณุโลก', pm25: 85, aqi: 165, affectedPop: 125000, patients: 450, status: 'Red' },
  { id: 2, name: 'วังทอง', pm25: 92, aqi: 175, affectedPop: 95000, patients: 380, status: 'Red' },
  { id: 3, name: 'บางระกำ', pm25: 78, aqi: 155, affectedPop: 85000, patients: 310, status: 'Red' },
  { id: 4, name: 'บางกระทุ่ม', pm25: 62, aqi: 140, affectedPop: 42000, patients: 150, status: 'Orange' },
  { id: 5, name: 'พรหมพิราม', pm25: 55, aqi: 130, affectedPop: 65000, patients: 200, status: 'Orange' },
  { id: 6, name: 'นครไทย', pm25: 45, aqi: 120, affectedPop: 45000, patients: 120, status: 'Orange' },
  { id: 7, name: 'วัดโบสถ์', pm25: 40, aqi: 110, affectedPop: 32000, patients: 95, status: 'Yellow' },
  { id: 8, name: 'ชาติตระการ', pm25: 35, aqi: 95, affectedPop: 30000, patients: 80, status: 'Yellow' },
  { id: 9, name: 'เนินมะปราง', pm25: 30, aqi: 85, affectedPop: 28000, patients: 60, status: 'Yellow' },
];

const activitiesData = [
  { id: 1, district: 'เมืองพิษณุโลก', activity: 'แจกหน้ากาก N95 ให้กลุ่มเปราะบาง', served: 15000, date: '2026-03-27' },
  { id: 2, district: 'วังทอง', activity: 'จัดตั้งห้องปลอดฝุ่น (Clean Room) ในศูนย์เด็กเล็ก', served: 3200, date: '2026-03-26' },
  { id: 3, district: 'บางระกำ', activity: 'ฉีดพ่นละอองน้ำลดฝุ่นละอองในเขตชุมชน', served: 8500, date: '2026-03-27' },
  { id: 4, district: 'นครไทย', activity: 'หน่วยแพทย์เคลื่อนที่ตรวจคัดกรองโรคปอด', served: 450, date: '2026-03-25' },
  { id: 5, district: 'พรหมพิราม', activity: 'แจกหน้ากากอนามัยและให้ความรู้ประชาชน', served: 5000, date: '2026-03-27' },
  { id: 6, district: 'เมืองพิษณุโลก', activity: 'ตรวจจับควันดำรถบรรทุกและรถโดยสาร', served: 120, date: '2026-03-26' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Red': return 'bg-red-500 text-white';
    case 'Orange': return 'bg-orange-500 text-white';
    case 'Yellow': return 'bg-yellow-400 text-slate-900';
    case 'Green': return 'bg-emerald-500 text-white';
    default: return 'bg-slate-200 text-slate-800';
  }
};

const getStatusBorder = (status: string) => {
  switch (status) {
    case 'Red': return 'border-red-500';
    case 'Orange': return 'border-orange-500';
    case 'Yellow': return 'border-yellow-400';
    case 'Green': return 'border-emerald-500';
    default: return 'border-slate-200';
  }
};

const getChartColor = (status: string) => {
  switch (status) {
    case 'Red': return '#ef4444';
    case 'Orange': return '#f97316';
    case 'Yellow': return '#facc15';
    case 'Green': return '#10b981';
    default: return '#cbd5e1';
  }
};

export default function Dashboard() {
  const totalAffected = districtData.reduce((acc, curr) => acc + curr.affectedPop, 0);
  const totalPatients = districtData.reduce((acc, curr) => acc + curr.patients, 0);
  const totalServed = activitiesData.reduce((acc, curr) => acc + curr.served, 0);
  const avgPm25 = Math.round(districtData.reduce((acc, curr) => acc + curr.pm25, 0) / districtData.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Wind className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">ระบบเฝ้าระวังสถานการณ์ฝุ่น PM 2.5</h1>
              <p className="text-xs text-slate-500 font-medium">จังหวัดพิษณุโลก (Phitsanulok PM 2.5 Dashboard)</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">อัปเดตล่าสุด</p>
            <p className="text-xs text-slate-500">27 มีนาคม 2026, 18:30 น.</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500">ค่าเฉลี่ย PM 2.5 วันนี้</h3>
              <Wind className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{avgPm25}</span>
              <span className="text-sm text-slate-500 font-medium">µg/m³</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full w-fit">
              <AlertTriangle className="w-3.5 h-3.5" />
              มีผลกระทบต่อสุขภาพ
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500">ประชากรที่ได้รับผลกระทบ</h3>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{totalAffected.toLocaleString()}</span>
              <span className="text-sm text-slate-500 font-medium">คน</span>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-500">
              จากทั้งหมด 9 อำเภอ
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500">ผู้ป่วยโรคที่เกี่ยวข้อง</h3>
              <Stethoscope className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{totalPatients.toLocaleString()}</span>
              <span className="text-sm text-slate-500 font-medium">ราย</span>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-500">
              ระบบทางเดินหายใจ, หัวใจและหลอดเลือด
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500">ประชาชนที่ได้รับบริการ</h3>
              <ShieldCheck className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{totalServed.toLocaleString()}</span>
              <span className="text-sm text-slate-500 font-medium">คน</span>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-500">
              ผ่านกิจกรรมช่วยเหลือต่างๆ
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: District Table */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-400" />
                ค่าฝุ่นและประชากรที่ได้รับผลกระทบ รายอำเภอ
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-200">อำเภอ</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-right">PM 2.5 (µg/m³)</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-center">ระดับ AQI</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-right">ประชากรที่กระทบ (คน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {districtData.map((district) => (
                    <tr key={district.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{district.name}</td>
                      <td className="p-4 text-right font-mono font-semibold text-slate-700">{district.pm25}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(district.status)}`}>
                          {district.aqi}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-600">{district.affectedPop.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Right Column: Patients Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                จำนวนผู้ป่วยโรคที่เกี่ยวข้อง
              </h2>
              <p className="text-xs text-slate-500 mt-1">ข้อมูลผู้ป่วยระบบทางเดินหายใจรายอำเภอ</p>
            </div>
            <div className="p-6 flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value} ราย`, 'จำนวนผู้ป่วย']}
                  />
                  <Bar dataKey="patients" radius={[0, 4, 4, 0]} barSize={20}>
                    {districtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Interventions / Activities */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                กิจกรรมดำเนินการและบริการประชาชน
              </h2>
              <p className="text-xs text-slate-500 mt-1">มาตรการช่วยเหลือและบรรเทาผลกระทบจากฝุ่น PM 2.5</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
            {activitiesData.map((item, index) => (
              <div key={item.id} className={`p-6 ${index >= 3 ? 'border-t border-slate-100' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {item.district}
                  </span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 line-clamp-2 h-10">{item.activity}</h3>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">ประชาชนที่ได้รับบริการ</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {item.served.toLocaleString()} คน
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </main>
    </div>
  );
}
