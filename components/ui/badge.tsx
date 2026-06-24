import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
          {
            "bg-red-600 text-white border border-red-600 shadow": variant === "default",
            "bg-slate-100 text-slate-900 border border-slate-200": variant === "secondary",
            "bg-amber-50 text-amber-600 border border-amber-200": variant === "warning",
            "bg-emerald-50 text-emerald-600 border border-emerald-200": variant === "success",
            "bg-rose-50 text-rose-600 border border-rose-200": variant === "destructive",
            "border border-slate-200 text-slate-900 bg-white": variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
