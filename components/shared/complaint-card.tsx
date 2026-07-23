import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, Clock, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "CLOSED" | "WAITING_RESPONSE";
export type ComplaintCategory =
  | "Sarpras"
  | "Kurikulum"
  | "Kesiswaan"
  | "Kebersihan"
  | "Keamanan"
  | "Umum (ISO)"
  | "Hubin"
  | "Tata Usaha";

export interface ComplaintCardData {
  id: number | string;
  rank?: number;
  title: string;
  description: string;
  image?: string;
  category: string;
  status: ComplaintStatus;
  supports: number;
  reporter: string;
  reporterInitial: string;
  timeAgo: string;
  /** Optional: override the link target. Defaults to /complaints/[id] */
  href?: string;
}

export const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  OPEN: {
    label: "OPEN",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-1 ring-emerald-100",
  },
  IN_PROGRESS: {
    label: "PROSES",
    classes: "bg-amber-50 text-amber-700 border border-amber-200/80 ring-1 ring-amber-100",
  },
  WAITING_RESPONSE: {
    label: "BELUM DIRESPON",
    classes: "bg-rose-50 text-rose-700 border border-rose-200/80 ring-1 ring-rose-100",
  },
  CLOSED: {
    label: "SELESAI",
    classes: "bg-slate-100 text-slate-600 border border-slate-200/80 ring-1 ring-slate-100",
  },
};

// Fixed category color token map (Single Source of Truth)
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  Sarpras: "bg-blue-50 text-blue-700 border border-blue-200/80",
  Kurikulum: "bg-purple-50 text-purple-700 border border-purple-200/80",
  Kesiswaan: "bg-rose-50 text-rose-700 border border-rose-200/80",
  Kebersihan: "bg-teal-50 text-teal-700 border border-teal-200/80",
  Keamanan: "bg-orange-50 text-orange-700 border border-orange-200/80",
  "Umum (ISO)": "bg-slate-100 text-slate-700 border border-slate-200/80",
  Hubin: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
  "Tata Usaha": "bg-pink-50 text-pink-700 border border-pink-200/80",
};

export function getCategoryBadgeClass(category: string): string {
  return CATEGORY_COLOR_MAP[category] ?? "bg-slate-100 text-slate-700 border border-slate-200/80";
}

export function getStatusBadgeConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
}

interface ComplaintCardProps {
  data: ComplaintCardData;
  className?: string;
  maxSupports?: number;
}

export function ComplaintCard({ data, className, maxSupports }: ComplaintCardProps) {
  const statusConfig = getStatusBadgeConfig(data.status);
  const categoryClasses = getCategoryBadgeClass(data.category);
  const href = data.href ?? `/complaints/${data.id}`;

  const progressPercent = maxSupports && maxSupports > 0
    ? Math.min(100, Math.round((data.supports / maxSupports) * 100))
    : null;

  return (
    <Link
      href={href}
      className={cn(
        "group block bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs",
        "hover:shadow-xl hover:border-red-200 hover:-translate-y-1",
        "transition-all duration-300 flex flex-col h-full",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 shrink-0">
        {data.image ? (
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-red-50 to-slate-100 flex items-center justify-center">
            <span className="text-4xl font-black text-red-200 select-none">SM</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Left: rank + category */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.rank !== undefined && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-black shadow-md">
                #{data.rank}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-2xs",
                categoryClasses
              )}
            >
              {data.category}
            </span>
          </div>

          {/* Right: status */}
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md shadow-2xs",
              statusConfig.classes
            )}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {data.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
            {data.description}
          </p>
        </div>

        {/* Visual Support Progress Bar (for Trending section) */}
        {progressPercent !== null && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] font-extrabold text-slate-600">
              <span className="text-slate-500 font-bold">Popularitas</span>
              <span className="text-slate-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-50 text-xs mt-auto">
        <div className="flex items-center gap-1.5 font-bold text-red-600">
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{data.supports.toLocaleString("id-ID")} Suka</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-[9.5px] font-extrabold shrink-0">
            {data.reporterInitial}
          </div>
          <div className="text-right leading-none">
            <p className="text-[10px] font-bold text-slate-700">{data.reporter}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{data.timeAgo}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Compact List Item for Recency-focused Sections like "Suara Terbaru" */
export function LatestComplaintListItem({ data }: { data: ComplaintCardData }) {
  const statusConfig = getStatusBadgeConfig(data.status);
  const categoryClasses = getCategoryBadgeClass(data.category);
  const href = data.href ?? `/complaints/${data.id}`;

  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-red-200 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Thumbnail & Main Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Small Thumbnail */}
          <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 overflow-hidden relative">
            {data.image ? (
              <Image
                src={data.image}
                alt={data.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-red-50 to-slate-100 flex items-center justify-center">
                <span className="text-xs font-black text-red-300">SM</span>
              </div>
            )}
          </div>

          {/* Title & Category/Meta */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("inline-block px-2 py-0.5 rounded-md text-[9.5px] font-bold", categoryClasses)}>
                {data.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <Clock className="h-3 w-3" />
                {data.timeAgo}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug truncate group-hover:text-red-600 transition-colors">
              {data.title}
            </h4>
          </div>
        </div>

        {/* Right: Status badge & Support count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center gap-2">
            <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold", statusConfig.classes)}>
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-extrabold text-[11px]">
              <ThumbsUp className="h-3 w-3" />
              {data.supports}
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
        </div>

      </div>
    </Link>
  );
}
