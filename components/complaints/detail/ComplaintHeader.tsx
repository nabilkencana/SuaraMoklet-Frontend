import React, { useEffect, useState } from "react";
import { Tag, ThumbsUp, Calendar, User as UserIcon, Building2, AlertCircle, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import { apiClient } from "@/lib/api";
import { useComments } from "@/hooks/useComments";

const STATUS_CONFIG: Record<ComplaintStatus | "FORWARDED", { label: string; description: string; classes: string }> = {
  NEW: {
    label: "BARU",
    description: "Menunggu Peninjauan Unit",
    classes: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  OPEN: {
    label: "DIPROSES",
    description: "Sedang Ditindaklanjuti",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  DONE: {
    label: "SELESAI",
    description: "Solusi Telah Diberikan",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  FORWARDED: {
    label: "DITERUSKAN",
    description: "Disposisi Antar Unit",
    classes: "bg-purple-50 text-purple-700 border border-purple-200",
  },
};

interface ComplaintHeaderProps {
  complaint: Complaint;
}

export default function ComplaintHeader({ complaint }: ComplaintHeaderProps) {
  const statusInfo = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN;
  const [autoCloseWarning, setAutoCloseWarning] = useState<string | null>(null);

  const { comments } = useComments(complaint.id);

  useEffect(() => {
    const checkAutoClose = async () => {
      if (complaint.status !== "OPEN") {
        setAutoCloseWarning(null);
        return;
      }
      try {
        const config = await apiClient.complaints.getAutoCloseConfig();

        if (comments && comments.length > 0 && config?.daysToClose) {
          const lastComment = comments[comments.length - 1];
          if (lastComment.isPic || (lastComment as any).comment_by === "ADMIN") {
            const now = new Date();
            const lastDate = new Date(lastComment.createdAt);
            const hoursSinceLastMessage = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastMessage >= 24) {
              const deadlineDate = new Date(lastDate);
              deadlineDate.setDate(deadlineDate.getDate() + config.daysToClose);

              const formatted = deadlineDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              setAutoCloseWarning(`Laporan akan ditutup pada ${formatted} jika tidak direspons`);
            } else {
              setAutoCloseWarning(null);
            }
          } else {
            setAutoCloseWarning(null);
          }
        } else {
          setAutoCloseWarning(null);
        }
      } catch (err) {
        console.warn("Gagal mengecek jadwal auto-close", err);
      }
    };
    checkAutoClose();
  }, [complaint.id, complaint.status, comments]);

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
      <div className="lg:hidden bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide",
                statusInfo.classes
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              <span>{statusInfo.label}</span>
              <span className="opacity-70 text-[9px] font-medium hidden sm:inline">• {statusInfo.description}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              <Tag className="h-3 w-3" />
              {complaint.unit}
            </span>
            {complaint.visibility === "PRIVATE" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                <EyeOff className="h-3 w-3" />
                PRIVATE
              </span>
            )}
          </div>
        </div>

        <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-snug">
          {complaint.title}
        </h1>
        
        {autoCloseWarning && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-2.5 mt-2">
            <span className="text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {autoCloseWarning}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
          <ThumbsUp className="h-4 w-4" />
          <span>{(complaint.supports || 0).toLocaleString("id-ID")} Suka</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            {complaint.isAnonymous ? "Anonim" : complaint.reporter?.name || "Warga Moklet"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(complaint.createdAt)}
          </span>
        </div>
      </div>

      {/* ── DESKTOP HEADER ── */}
      <div className="hidden lg:block bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-3xs",
                    statusInfo.classes
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                  <span>{statusInfo.label}</span>
                  <span className="opacity-75 text-[11px] font-medium">• {statusInfo.description}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                  <Tag className="h-3.5 w-3.5" />
                  {complaint.unit}
                </span>
                {complaint.visibility === "PRIVATE" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                    <EyeOff className="h-3.5 w-3.5" />
                    PRIVATE
                  </span>
                )}
              </div>
            </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
          {complaint.title}
        </h1>
        
        {autoCloseWarning && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3 inline-block mt-2">
            <span className="text-sm font-bold flex items-center gap-2 animate-pulse">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              {autoCloseWarning}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4 text-slate-400" />
            <span>{complaint.isAnonymous ? "Anonim" : complaint.reporter?.name || "Warga Moklet"}</span>
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
