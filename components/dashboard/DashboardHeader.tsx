import React, { useEffect } from "react";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { useState } from "react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user } = useAuthStore();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center gap-3">
      {/* Mobile menu trigger */}
      <button
        onClick={onToggleSidebar}
        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer shrink-0"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </button>

      {/* Greeting */}
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight truncate">
          Welcome back, {mounted && user?.name ? user.name : "Warga Moklet"}
        </h2>
        <p className="text-[10px] text-slate-400 font-medium hidden sm:block truncate">
          "Your voice drives the excellence of our institution."
        </p>
      </div>
    </header>
  );
}
