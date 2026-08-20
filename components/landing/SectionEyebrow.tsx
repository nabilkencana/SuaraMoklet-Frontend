import React from "react";
import { cn } from "@/lib/utils";

export interface SectionEyebrowProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "light";
}

export default function SectionEyebrow({
  label,
  icon: Icon,
  variant = "default",
}: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-3",
        variant === "light"
          ? "bg-white/15 text-white border border-white/20 backdrop-blur-xs"
          : "bg-red-50 text-red-650 border border-red-100"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            variant === "light" ? "text-white" : "text-red-600"
          )}
        />
      )}
      <span>{label}</span>
    </div>
  );
}
