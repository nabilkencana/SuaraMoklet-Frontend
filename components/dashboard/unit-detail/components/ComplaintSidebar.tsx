import React from "react";
import {
  Share2,
  CheckCircle2,
  ChevronDown,
  Globe,
  EyeOff,
  Users,
  Play,
  RotateCcw,
  ClipboardList,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Star,
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

  // Status Config & Helpers
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "OPEN":
        return {
          label: "SEDANG DIPROSES",
          cardBg: "bg-linear-to-br from-amber-50/90 via-orange-50/40 to-amber-50/20 border-amber-200/80",
          title: "Sedang Ditindaklanjuti",
          description: "Tim unit aktif menangani keluhan sesuai rencana kerja.",
          accentColor: "text-amber-800",
        };
      case "DONE":
        return {
          label: "SELESAI",
          cardBg: "bg-linear-to-br from-emerald-50/90 via-teal-50/40 to-emerald-50/20 border-emerald-200/80",
          title: "Penanganan Tuntas",
          description: "Keluhan telah diselesaikan oleh unit penanggung jawab.",
          accentColor: "text-emerald-800",
        };
      default:
        return {
          label: "BARU",
          cardBg: "bg-linear-to-br from-sky-50/90 via-blue-50/40 to-sky-50/20 border-sky-200/80",
          title: "Menunggu Peninjauan",
          description: "Laporan baru diterima dan siap ditindaklanjuti oleh unit.",
          accentColor: "text-sky-800",
        };
    }
  };

  const statusInfo = getStatusDetails(complaint.status);

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

        autoCloseWarning = `Laporan akan ditutup otomatis pada ${formattedDeadline} jika ${complaint.reporter?.name || "Pelapor"} tidak merespons.`;
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
          Status &amp; Penanganan
        </span>

        {/* Modern Dynamic Status Banner */}
        <div
          className={cn(
            "rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden space-y-3",
            statusInfo.cardBg
          )}
        >
          {/* Header Row: Badge & Indicator */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-white shadow-3xs",
                complaint.status === "DONE"
                  ? "bg-emerald-600"
                  : complaint.status === "OPEN"
                  ? "bg-amber-500"
                  : "bg-sky-500"
              )}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {complaint.status !== "DONE" && (
                  <span
                    className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      complaint.status === "OPEN" ? "bg-amber-300" : "bg-sky-300"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    complaint.status === "DONE"
                      ? "bg-emerald-200"
                      : complaint.status === "OPEN"
                      ? "bg-amber-200"
                      : "bg-sky-200"
                  )}
                />
              </span>
              <span>{statusInfo.label}</span>
            </div>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Status</span>
            </span>
          </div>

          {/* Title & Micro-description */}
          <div className="space-y-0.5 text-left">
            <h4 className={cn("text-xs font-extrabold leading-tight", statusInfo.accentColor)}>
              {statusInfo.title}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              {statusInfo.description}
            </p>
          </div>

          {/* Handling Plan (if OPEN) */}
          {complaint.status === "OPEN" && complaint.handlingPlan && (
            <div className="pt-2.5 border-t border-amber-200/60 text-left space-y-1 bg-white/70 backdrop-blur-xs rounded-xl p-2.5 border border-amber-200/50">
              <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-amber-800 uppercase tracking-wider">
                <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                <span>Rencana Penanganan</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                {complaint.handlingPlan}
              </p>
            </div>
          )}

          {/* Resolution (if DONE) */}
          {complaint.status === "DONE" && complaint.resolution && (
            <div className="pt-2.5 border-t border-emerald-200/60 text-left space-y-1 bg-white/70 backdrop-blur-xs rounded-xl p-2.5 border border-emerald-200/50">
              <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Solusi Resmi yang Diterapkan</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                {complaint.resolution}
              </p>
            </div>
          )}

          {/* Auto Close Warning (if any) */}
          {autoCloseWarning && (
            <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300/80 text-left space-y-1">
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-amber-900 uppercase tracking-wider">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Peringatan Auto-Close</span>
              </div>
              <p className="text-[10.5px] font-medium text-amber-800 leading-tight">
                {autoCloseWarning}
              </p>
            </div>
          )}
        </div>

        {/* Support Info (Only shown when complaint is PUBLIC) */}
        {complaint.visibility === "PUBLIC" && (
          <div className="rounded-2xl p-3.5 border border-slate-200/80 bg-slate-50/70 text-center relative overflow-hidden">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Dukungan Komunitas
            </span>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-extrabold text-slate-800 leading-none">
                    {complaint.supports || 0}
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Suka
                  </span>
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-extrabold text-slate-800 leading-none">
                    {complaint.dislikes || 0}
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Dislike
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Info */}
        {complaint.rating && (
          <div className="rounded-2xl p-3.5 border border-amber-200/80 bg-amber-50/50 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-700">
                Penilaian Pelapor
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < complaint.rating!.score
                        ? "text-amber-500 fill-amber-500"
                        : "text-amber-200"
                    )}
                  />
                ))}
              </div>
            </div>
            {complaint.rating.note && (
              <p className="text-xs text-amber-900/80 font-medium italic bg-white/60 p-2 rounded-lg border border-amber-200/40">
                &ldquo;{complaint.rating.note}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* PIC Info */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
            Unit Penanggung Jawab
          </span>

          <div className="flex items-center gap-3 bg-slate-50/60 p-2.5 rounded-2xl border border-slate-150/70">
            <div className="h-9 w-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none shadow-3xs">
              {complaint.unit.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-xs truncate">
                  Unit {complaint.unit}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100 text-[9px] font-extrabold shrink-0">
                  Utama
                </span>
              </div>
              <span className="block text-[10px] text-slate-400 font-medium truncate mt-0.5">
                Tim Pengelola &amp; Penanganan Resmi
              </span>
            </div>
          </div>

          {complaint.collaboratorUnits && complaint.collaboratorUnits.length > 0 && (
            <div className="space-y-1.5 pt-1 text-left">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Kolaborator Terlibat
              </span>
              <div className="flex flex-wrap gap-1.5">
                {complaint.collaboratorUnits.map((cu: any) => (
                  <div
                    key={cu.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[10px] font-bold"
                  >
                    <Users className="h-3 w-3 text-indigo-500" />
                    <span>Unit {cu.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls — Smart Action Hierarchy */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-left">
            Tindakan Penanganan
          </span>

          {/* 1. Hero Primary Action */}
          {complaint.status === "NEW" || !complaint.status ? (
            <button
              onClick={onOpenProcessModal}
              className="w-full h-11 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Mulai Proses Laporan</span>
            </button>
          ) : complaint.status === "OPEN" ? (
            <button
              onClick={onOpenCloseModal}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Selesaikan &amp; Beri Solusi</span>
            </button>
          ) : (user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") ? (
            <button
              onClick={onReopenComplaint}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Buka Kembali (Reopen)</span>
            </button>
          ) : (
            <div className="w-full py-2.5 px-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-center gap-2 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Keluhan telah diselesaikan</span>
            </div>
          )}

          {/* 2. Secondary Coordination Actions (2-Column Grid) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Teruskan (Forward) */}
            <button
              disabled={forwardCount >= 3 || complaint.status === "DONE"}
              onClick={onOpenForwardModal}
              title={
                forwardCount >= 3
                  ? "Forward laporan telah mencapai batas maksimal (3x)"
                  : complaint.status === "DONE"
                  ? "Keluhan telah selesai, tidak dapat diteruskan"
                  : "Teruskan laporan ke unit penanggung jawab lain"
              }
              className={cn(
                "h-10 px-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]",
                forwardCount >= 3 || complaint.status === "DONE"
                  ? "bg-slate-50 text-slate-300 border-slate-200/60 cursor-not-allowed opacity-60"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-3xs"
              )}
            >
              <Share2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="truncate">
                Teruskan {forwardCount > 0 ? `(${forwardCount}/3)` : ""}
              </span>
            </button>

            {/* Kolaborasi Unit */}
            <button
              disabled={complaint.status === "DONE"}
              onClick={onOpenCollaborateModal}
              title={complaint.status === "DONE" ? "Keluhan telah selesai" : "Ajak unit lain untuk berkolaborasi menangani keluhan"}
              className={cn(
                "h-10 px-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]",
                complaint.status === "DONE"
                  ? "bg-slate-50 text-slate-300 border-slate-200/60 cursor-not-allowed opacity-60"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-3xs"
              )}
            >
              <Users className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="truncate">Kolaborasi</span>
            </button>
          </div>

          {/* 3. Visibility Row Action */}
          <button
            onClick={onOpenPublishModal}
            className="w-full h-9 px-3 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-3xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              {complaint.visibility === "PUBLIC" ? (
                <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              )}
              <span className="text-[11px] truncate">
                Visibilitas: <strong className="text-slate-800 font-semibold">{complaint.visibility === "PUBLIC" ? "Publik" : "Privat"}</strong>
              </span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold shrink-0">
              Ubah →
            </span>
          </button>

          {/* 4. Secondary Action for NEW: Direct Close */}
          {(complaint.status === "NEW" || !complaint.status) && (
            <div className="text-center pt-0.5">
              <button
                onClick={onOpenCloseModal}
                className="text-[10.5px] font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Tutup keluhan langsung tanpa proses →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Process Audit Trail / Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
          Riwayat Proses
        </span>

        {/* Timeline */}
        <div className="relative border-l border-slate-100 pl-4.5 space-y-5 ml-1 pt-1.5 pb-1">
          {timelineList.map((evt, idx) => (
            <div key={evt.id || idx} className="relative space-y-1 text-left">
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
