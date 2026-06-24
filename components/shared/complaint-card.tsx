import Image from "next/image";
import Link from "next/link";
import { Heart, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
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

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; classes: string }> = {
  OPEN: {
    label: "OPEN",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-100",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    classes: "bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100",
  },
  CLOSED: {
    label: "CLOSED",
    classes: "bg-slate-100 text-slate-500 border border-slate-200 ring-1 ring-slate-100",
  },
};

// Fallback color for categories that don't have a dedicated color
const CATEGORY_COLOR_MAP: Record<string, string> = {
  Sarpras: "bg-blue-50 text-blue-700 border border-blue-200",
  Kurikulum: "bg-purple-50 text-purple-700 border border-purple-200",
  Kesiswaan: "bg-rose-50 text-rose-700 border border-rose-200",
  Kebersihan: "bg-teal-50 text-teal-700 border border-teal-200",
  Keamanan: "bg-orange-50 text-orange-700 border border-orange-200",
  "Umum (ISO)": "bg-slate-50 text-slate-700 border border-slate-200",
  Hubin: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "Tata Usaha": "bg-pink-50 text-pink-700 border border-pink-200",
};

interface ComplaintCardProps {
  data: ComplaintCardData;
  className?: string;
}

export function ComplaintCard({ data, className }: ComplaintCardProps) {
  const status = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.OPEN;
  const categoryClasses =
    CATEGORY_COLOR_MAP[data.category] ??
    "bg-slate-50 text-slate-700 border border-slate-200";

  const href = data.href ?? `/complaints/${data.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "group block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm",
        "hover:shadow-xl hover:border-red-200 hover:-translate-y-1",
        "transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
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
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Left: rank + category */}
          <div className="flex items-center gap-1.5">
            {data.rank && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                #{data.rank}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm",
                categoryClasses
              )}
            >
              {data.category}
            </span>
          </div>

          {/* Right: status */}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-sm",
              status.classes
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
          {data.title}
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
          {data.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Support count */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 group-hover:text-red-600 transition-colors">
          <Heart className="h-3.5 w-3.5 fill-red-100 group-hover:fill-red-500 transition-all" />
          <span>{data.supports.toLocaleString("id-ID")} Dukungan</span>
        </div>

        {/* Reporter */}
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
            {data.reporterInitial}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-700 leading-none">{data.reporter}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{data.timeAgo}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
