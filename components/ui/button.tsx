import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-255 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer",
          {
            // Variants
            "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm":
              variant === "default",
            "bg-slate-900 text-slate-100 hover:bg-slate-800 active:bg-slate-700 border border-slate-800":
              variant === "secondary",
            "bg-red-600/10 text-red-500 hover:bg-red-600/20":
              variant === "destructive",
            "border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-700":
              variant === "outline",
            "hover:bg-slate-100 hover:text-slate-900 text-slate-700":
              variant === "ghost",
            "text-red-600 underline-offset-4 hover:underline":
              variant === "link",
            
            // Sizes
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 rounded-2xl px-6 text-base": size === "lg",
            "h-10 w-10 p-0 rounded-xl": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
