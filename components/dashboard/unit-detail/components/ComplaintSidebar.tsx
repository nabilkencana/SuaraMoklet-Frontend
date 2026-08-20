import React from "react";
import {
  RefreshCw,
  Share2,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";

interface ComplaintSidebarProps {
  complaint: Complaint;
  user: any;
  isTimelineExpanded: boolean;
  onToggleTimeline: () => void;
  onOpenProcessModal: () => void;
  onOpenForwardModal: () => void;
  onOpenCloseModal: () => void;
  onReopenComplaint: () => void;
}

export default function ComplaintSidebar({
  complaint,
  user,
  isTimelineExpanded,
  onToggleTimeline,
  onOpenProcessModal,
  onOpenForwardModal,
  onOpenCloseModal,
  onReopenComplaint,
}: ComplaintSidebarProps) {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "10:15";
    }
  };

  const formatDateShort = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return "12 Okt";
    }
  };

  let displayStatus = "BARU";
  let bgClass = "bg-sky-50 border-sky-200/80 text-sky-700";
  let dotClass = "bg-sky-500";
  if (complaint.status === "OPEN") {
    displayStatus = "SEDANG DIPROSES";
    bgClass = "bg-amber-50 border-amber-200/80 text-amber-800";
    dotClass = "bg-amber-500 animate-pulse";
  } else if (complaint.status === "DONE") {
    displayStatus = "SELESAI";
    bgClass = "bg-emerald-50 border-emerald-200/80 text-emerald-800";
    dotClass = "bg-emerald-500";
  }

  const timelineList = (isTimelineExpanded ? complaint.timeline : complaint.timeline?.slice(0, 3)) || [];

  return (
    <div className="space-y-6">
      {/* Card 1: Status & Control */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Status &amp; Kontrol
        </span>

        {/* Status Block */}
        <div
          className={cn(
            "rounded-2xl p-4 border text-center relative overflow-hidden transition-all",
            bgClass
          )}
        >
          <span className="block text-[9px] font-bold uppercase tracking-widest opacity-70">
            Status Saat Ini
          </span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={cn("h-2 w-2 rounded-full shrink-0", dotClass)} />
            <span className="text-sm font-extrabold tracking-wider uppercase">
              {displayStatus}
            </span>
          </div>

          {complaint.status === "OPEN" && complaint.handlingPlan && (
            <div className="mt-3 pt-3 border-t border-amber-200/50 text-left">
              <span className="block text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">
                Rencana Penanganan:
              </span>
              <p className="text-xs font-semibold whitespace-pre-wrap">
                {complaint.handlingPlan}
              </p>
            </div>
          )}

          {complaint.status === "DONE" && complaint.resolution && (
            <div className="mt-3 pt-3 border-t border-emerald-200/50 text-left">
              <span className="block text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">
                Solusi yang Telah Dilakukan:
              </span>
              <p className="text-xs font-semibold whitespace-pre-wrap">
                {complaint.resolution}
              </p>
            </div>
          )}
        </div>

        {/* Rating Info */}
        {complaint.rating && (
          <div className="rounded-2xl p-4 border border-yellow-200 bg-yellow-50 text-center relative overflow-hidden transition-all mt-3">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-yellow-700 opacity-80">
              Penilaian Pelapor
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm font-extrabold tracking-wider text-yellow-800">
                {complaint.rating.score} BINTANG
              </span>
            </div>
            {complaint.rating.note && (
              <p className="mt-2 text-xs text-yellow-700/80 font-medium italic">
                &ldquo;{complaint.rating.note}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* PIC Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Unit Penanggung Jawab
          </span>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-extrabold text-xs shrink-0 select-none shadow-3xs">
              {complaint.unit.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <span className="block font-bold text-slate-800 text-xs leading-none">
                Unit {complaint.unit}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold">
                Tim Pengelola &amp; Penanganan Resmi
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          {/* Proses Laporan */}
          <button
            disabled={complaint.status === "OPEN" || complaint.status === "DONE"}
            onClick={onOpenProcessModal}
            className="w-full h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Proses Laporan</span>
          </button>

          {/* Forward */}
          <button
            onClick={onOpenForwardModal}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4 text-slate-500" />
            <span>Teruskan (Forward)</span>
          </button>

          {/* Tutup / Reopen */}
          {(user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") &&
          complaint.status === "DONE" ? (
            <button
              onClick={onReopenComplaint}
              className="w-full h-11 bg-white hover:bg-amber-50/50 border border-amber-200 text-amber-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4 text-amber-600" />
              <span>Buka Lagi (Reopen)</span>
            </button>
          ) : (
            <button
              disabled={complaint.status === "DONE"}
              onClick={onOpenCloseModal}
              className="w-full h-11 bg-white hover:bg-red-50/50 disabled:opacity-40 disabled:cursor-not-allowed border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle className="h-4 w-4 text-red-600" />
              <span>Tutup Keluhan</span>
            </button>
          )}
        </div>
      </div>

      {/* Card 2: Process Audit Trail / Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Riwayat Proses
        </span>

        {/* Timeline */}
        <div className="relative border-l border-slate-100 pl-4.5 space-y-5 ml-1 pt-1.5 pb-1">
          {timelineList.map((evt, idx) => (
            <div key={evt.id || idx} className="relative space-y-1">
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute -left-5.5 top-1.5 h-2.5 w-2.5 rounded-full border border-white shrink-0",
                  idx === 0 ? "bg-red-600" : "bg-slate-300"
                )}
              />

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>
                  {formatDateShort(evt.createdAt)} - {formatTime(evt.createdAt)}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-800 text-xs leading-tight">
                {evt.title}
              </h4>
              <p className="text-[10.5px] text-slate-450 font-medium leading-relaxed">
                {evt.description}
              </p>
            </div>
          ))}
        </div>

        {complaint.timeline && complaint.timeline.length > 3 && (
          <div className="text-center pt-2 border-t border-slate-50">
            <button
              onClick={onToggleTimeline}
              className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span>{isTimelineExpanded ? "Sembunyikan Log" : "Lihat Log Lengkap"}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isTimelineExpanded && "rotate-180"
                )}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
