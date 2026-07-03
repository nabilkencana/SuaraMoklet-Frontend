import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "red" | "emerald" | "amber" | "blue" | "violet";
  subtitle?: string;
  showProgress?: boolean;
}

const COLOR_MAP = {
  red: {
    bg: "bg-red-50/50 border-red-100/60 text-red-650",
    ring: "stroke-red-600",
  },
  emerald: {
    bg: "bg-emerald-50/50 border-emerald-100/60 text-emerald-600",
    ring: "stroke-emerald-500",
  },
  amber: {
    bg: "bg-amber-50/50 border-amber-100/60 text-amber-600",
    ring: "stroke-amber-500",
  },
  blue: {
    bg: "bg-blue-50/50 border-blue-100/60 text-blue-600",
    ring: "stroke-blue-500",
  },
  violet: {
    bg: "bg-violet-50/50 border-violet-100/60 text-violet-600",
    ring: "stroke-violet-500",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  showProgress = false,
}: StatsCardProps) {
  const styles = COLOR_MAP[color] || COLOR_MAP.blue;
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;

  // SVG Progress circle calculations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numericValue / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Metric Icon Container */}
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", styles.bg)}>
          <Icon className="h-6 w-6" />
        </div>
        
        {/* Metric Texts */}
        <div className="space-y-0.5">
          <div className="text-2xl font-bold tracking-tight text-slate-800">{value}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</div>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>

      {/* Progress Ring Overlay */}
      {showProgress && (
        <div className="relative h-12 w-12 shrink-0">
          <svg className="h-full w-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth="4"
            />
            {/* Active ring */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className={cn("fill-none transition-all duration-500 ease-in-out", styles.ring)}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-700">
            {numericValue}%
          </div>
        </div>
      )}
    </div>
  );
}
