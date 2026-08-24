import React from "react";
import {
  RefreshCw,
  Share2,
  CheckCircle,
  ChevronDown,
  Globe,
  EyeOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { Comment } from "@/types/comment";

interface ComplaintSidebarProps {
  complaint: Complaint;
  user: any;
  isTimelineExpanded: boolean;
  comments?: Comment[];
  autoCloseDays?: number;
  onToggleTimeline: () => void;
  onOpenProcessModal: () => void;
  onOpenForwardModal: () => void;
  onOpenCollaborateModal: () => void;
  onOpenCloseModal: () => void;
  onReopenComplaint: () => void;
  onOpenPublishModal: () => void;
}

export default function ComplaintSidebar({
  complaint,
  user,
  isTimelineExpanded,
  comments = [],
  autoCloseDays = 7,
  onToggleTimeline,
  onOpenProcessModal,
  onOpenForwardModal,
  onOpenCollaborateModal,
  onOpenCloseModal,
  onReopenComplaint,
  onOpenPublishModal,
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

  // Auto Close Logic
  let autoCloseWarning = null;
  if (complaint.status === "OPEN" && comments.length > 0) {
    const lastComment = comments[comments.length - 1];
    // Hanya tampilkan peringatan jika pesan terakhir adalah dari Admin/Unit
    if (lastComment.isPic || (lastComment as any).comment_by === "ADMIN") {
      const now = new Date();
      const lastCommentDate = new Date(lastComment.createdAt);
      const hoursSinceLastMessage = (now.getTime() - lastCommentDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastMessage >= 24) {
        const deadlineDate = new Date(lastCommentDate);
        deadlineDate.setDate(deadlineDate.getDate() + autoCloseDays);
        
        const formattedDeadline = deadlineDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        autoCloseWarning = `Laporan akan ditutup pada ${formattedDeadline} jika ${complaint.reporter?.name || "Pelapor"} tidak merespons.`;
      }
    }
  }

  const timelineList = (isTimelineExpanded ? complaint.timeline : complaint.timeline?.slice(0, 3)) || [];
  const forwardCount = (complaint.timeline || []).filter(t => t.title?.includes('Diteruskan')).length;

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
          
          {/* Auto Close Warning */}
          {autoCloseWarning && (
            <div className="mt-3 pt-3 border-t border-amber-200/50 text-left">
              <span className="block text-[9.5px] font-bold text-red-600 uppercase tracking-widest mb-1">
                Peringatan Auto-Close
              </span>
              <p className="text-[10px] font-semibold text-slate-600 leading-tight">
                {autoCloseWarning}
              </p>
            </div>
          )}
        </div>

        {/* Support Info (Only shown when complaint is PUBLIC) */}
        {complaint.visibility === "PUBLIC" && (
          <div className="rounded-2xl p-4 border border-blue-200 bg-blue-50 text-center relative overflow-hidden transition-all mt-3">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-blue-700 opacity-80 mb-2">
              Statistik Dukungan Publik
            </span>
            <div className="flex items-center justify-center gap-6">
              <div>
                <span className="block text-xl font-extrabold text-blue-800 leading-none">
                  {complaint.supports || 0}
                </span>
                <span className="text-[10px] font-bold text-blue-700/80 uppercase tracking-wider mt-1 block">
                  Suka
                </span>
              </div>
              <div className="w-px h-8 bg-blue-200" />
              <div>
                <span className="block text-xl font-extrabold text-blue-800 leading-none">
                  {complaint.dislikes || 0}
                </span>
                <span className="text-[10px] font-bold text-blue-700/80 uppercase tracking-wider mt-1 block">
                  Dislike
                </span>
              </div>
            </div>
          </div>
        )}

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

          {complaint.collaboratorUnits && complaint.collaboratorUnits.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Unit Kolaborator
              </span>
              <div className="flex flex-wrap gap-2">
                {complaint.collaboratorUnits.map((cu: any) => (
                  <div key={cu.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-700">{cu.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            disabled={forwardCount >= 3}
            onClick={onOpenForwardModal}
            title={forwardCount >= 3 ? "Forward laporan telah mencapai batas maks 3x jika terjadi kesalahan silahkan laporkan ke unit iso." : ""}
            className={cn(
              "w-full h-11 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]",
              forwardCount >= 3
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-70"
                : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80"
            )}
          >
            <Share2 className={cn("h-4 w-4", forwardCount >= 3 ? "text-slate-400" : "text-slate-500")} />
            <span>Teruskan (Forward) {forwardCount >= 3 ? "(Maks)" : ""}</span>
          </button>

          {/* Kolaborasi */}
          <button
            onClick={onOpenCollaborateModal}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4" />
            <span>Kolaborasi Unit</span>
          </button>

          {/* Publikasikan / Jadikan Privat */}
          <button
            onClick={onOpenPublishModal}
            className={`w-full h-11 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
              complaint.visibility === "PUBLIC"
                ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
            }`}
          >
            {complaint.visibility === "PUBLIC" ? (
              <>
                <EyeOff className="h-4 w-4" /> <span>Jadikan Privat</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" /> <span>Publikasikan</span>
              </>
            )}
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
