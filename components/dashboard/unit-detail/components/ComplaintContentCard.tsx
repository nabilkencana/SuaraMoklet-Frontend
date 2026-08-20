import React from "react";
import { Globe, User as UserIcon } from "lucide-react";
import { Complaint } from "@/types/complaint";

interface ComplaintContentCardProps {
  complaint: Complaint;
}

export default function ComplaintContentCard({ complaint }: ComplaintContentCardProps) {
  const formatFullDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "12 Okt 2026";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        {/* Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200">
            {complaint.status}
          </span>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {complaint.visibility === "PUBLIC" ? "Publik" : "Privat"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
          {complaint.title}
        </h2>

        {/* Meta details */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Unit Terkait
            </span>
            <span className="block font-bold text-slate-700">Unit {complaint.unit}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tanggal Dibuat
            </span>
            <span className="block font-bold text-slate-700">
              {formatFullDate(complaint.createdAt)}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pelapor
            </span>
            <span className="font-bold text-slate-750 flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5 text-slate-400" />
              {complaint.isAnonymous ? "Anonim" : complaint.reporter?.name || "Pelapor"}
            </span>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Deskripsi Keluhan
        </span>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          {complaint.description}
        </p>
      </div>

      {/* Attachments Card */}
      {complaint.evidenceUrl && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Lampiran Bukti
          </span>

          <div className="max-w-md h-56 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-3xs group cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={complaint.evidenceUrl}
              alt="Lampiran Bukti"
              className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              onClick={() => window.open(complaint.evidenceUrl, "_blank")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
