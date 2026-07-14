import React from "react";
import Link from "next/link";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import { cn } from "@/lib/utils";

interface RecentComplaintCardProps {
  complaint: Complaint;
  commentCount?: number;
}

const STATUS_BADGE_CONFIG: Record<ComplaintStatus, { label: string; classes: string }> = {
  OPEN: {
    label: "OPEN",
    classes: "bg-blue-50 text-blue-600 border border-blue-200/80",
  },
  NEW: {
    label: "NEW",
    classes: "bg-red-50 text-red-650 border border-red-200/80",
  },
  WAITING_RESPONSE: {
    label: "WAITING RESPONSE",
    classes: "bg-amber-50 text-amber-600 border border-amber-200/80",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    classes: "bg-amber-50 text-amber-600 border border-amber-200/80",
  },
  WAITING_USER: {
    label: "WAITING USER",
    classes: "bg-yellow-50 text-yellow-600 border border-yellow-200/80",
  },
  CLOSED: {
    label: "CLOSED",
    classes: "bg-emerald-50 text-emerald-600 border border-emerald-200/80",
  },
};

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "Beberapa waktu lalu";
  }
}

export default function RecentComplaintCard({ complaint, commentCount = 0 }: RecentComplaintCardProps) {
  const badge = STATUS_BADGE_CONFIG[complaint.status] || { label: "UNKNOWN", classes: "bg-slate-50 text-slate-500 border-slate-200" };
  const formattedId = `#SM-${new Date(complaint.createdAt).getFullYear()}-${complaint.id.split("-").pop()?.substring(0, 3).toUpperCase() || "000"}`;

  return (
    <Link
      href={`/complaints/${complaint.id}`}
      className="group block bg-white border border-slate-200/80 hover:border-red-200 hover:shadow-md rounded-2xl p-5 transition-all duration-300 relative overflow-hidden active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Status Badge */}
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase", badge.classes)}>
          {badge.label}
        </span>
        
        {/* Short ID code */}
        <span className="text-[10px] font-mono text-neutral-400 font-bold group-hover:text-red-500 transition-colors">
          {formattedId}
        </span>
      </div>

      <h4 className="text-sm font-bold text-slate-800 group-hover:text-red-650 transition-colors line-clamp-1 mb-2 pr-4">
        {complaint.title}
      </h4>

      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
        {complaint.description}
      </p>

      <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 text-[10px] text-slate-450 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formatTimeAgo(complaint.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            {commentCount} Komentar
          </span>
        </div>
        
        {/* Indicator arrow */}
        <div className="flex items-center gap-0.5 text-red-600 font-bold opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300">
          <span>Detail</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
