import React from "react";
import { Tag, ThumbsUp, Calendar, User as UserIcon, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint, ComplaintStatus } from "@/types/complaint";

const STATUS_CONFIG: Record<ComplaintStatus | "FORWARDED", { label: string; classes: string }> = {
  NEW: { label: "BARU", classes: "bg-red-50 text-red-600 border border-red-200" },
  OPEN: { label: "DIPROSES", classes: "bg-amber-50 text-amber-700 border border-amber-200" },
  DONE: { label: "SELESAI", classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  FORWARDED: { label: "FORWARDED", classes: "bg-purple-50 text-purple-600 border border-purple-200" },
};

interface ComplaintHeaderProps {
  complaint: Complaint;
}

export default function ComplaintHeader({ complaint }: ComplaintHeaderProps) {
  const statusInfo = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Hari ini";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* ── MOBILE COMPACT HEADER CARD ── */}
      <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide",
              statusInfo.classes
            )}
          >
            {statusInfo.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
            <Tag className="h-3 w-3" />
            {complaint.unit}
          </span>
        </div>

        <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-snug">
          {complaint.title}
        </h1>

        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
          <ThumbsUp className="h-4 w-4" />
          <span>{(complaint.supports || 0).toLocaleString("id-ID")} Suka</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            {complaint.isAnonymous ? "Anonim" : complaint.reporter?.name || "Civitas Moklet"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(complaint.createdAt)}
          </span>
        </div>
      </div>

      {/* ── DESKTOP HEADER ── */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold tracking-wide",
                statusInfo.classes
              )}
            >
              {statusInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              <Tag className="h-3.5 w-3.5" />
              {complaint.unit}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
          {complaint.title}
        </h1>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4 text-slate-400" />
            <span>{complaint.isAnonymous ? "Anonim" : complaint.reporter?.name || "Civitas Moklet"}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Unit {complaint.unit}</span>
          </div>
        </div>
      </div>
    </>
  );
}
