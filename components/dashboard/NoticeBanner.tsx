import React from "react";
import { Info } from "lucide-react";

export default function NoticeBanner() {
  return (
    <div className="bg-[#FAF0F0] border border-red-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className="bg-red-50 p-2.5 rounded-xl border border-red-150 text-red-650 shrink-0">
        <Info className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-800">Pemberitahuan Sistem</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Seluruh laporan akan diproses dalam waktu <strong className="text-red-600 font-semibold">1-3 hari kerja</strong> sesuai dengan antrean dan urgensi. Mohon pastikan data yang Anda lampirkan sudah sesuai dengan fakta lapangan.
        </p>
      </div>
    </div>
  );
}
