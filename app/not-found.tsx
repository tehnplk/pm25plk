export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6 py-16 text-slate-900">
      <div className="max-w-md rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">ไม่พบหน้าที่ต้องการ</h1>
        <p className="mt-3 text-sm text-slate-600">
          กรุณากลับไปยังหน้าแดชบอร์ดหลักของระบบเฝ้าระวังสถานการณ์ฝุ่น PM 2.5
        </p>
      </div>
    </main>
  );
}
