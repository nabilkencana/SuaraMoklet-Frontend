"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { LayoutDashboard, Folder, PlusCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UnitSidebarProps {
  activeTab: "dashboard" | "keluhan";
}

export default function UnitSidebar({ activeTab }: UnitSidebarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar dari portal");
    router.push("/");
  };

  return (
    <aside className="w-64 bg-[#0B0F19] text-white flex flex-col justify-between shrink-0 select-none h-full">
      {/* Brand Section */}
      <div className="flex flex-col">
        <div className="p-6 border-b border-slate-800/60">
          <span className="block font-extrabold text-white text-lg tracking-tight">SuaraMoklet</span>
          <span className="block text-[9px] font-bold text-[#b61722] uppercase tracking-widest mt-0.5">GOVERNANCE PORTAL</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {/* Dashboard Tab */}
          <button
            onClick={() => router.push("/unit")}
            className={cn(
              "relative w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer",
              activeTab === "dashboard"
                ? "bg-neutral-900 text-white"
                : "text-slate-400 hover:text-white hover:bg-neutral-900/50"
            )}
          >
            {activeTab === "dashboard" && (
              <div className="absolute left-[-16px] top-1.5 bottom-1.5 w-1 bg-[#b61722] rounded-r-md" />
            )}
            <LayoutDashboard className={cn("h-4.5 w-4.5", activeTab === "dashboard" ? "text-[#b61722]" : "")} />
            <span>Dashboard</span>
          </button>

          {/* Keluhan Saya */}
          <button
            onClick={() => router.push("/complaints")}
            className={cn(
              "relative w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer",
              activeTab === "keluhan"
                ? "bg-neutral-900 text-white"
                : "text-slate-400 hover:text-white hover:bg-neutral-900/50"
            )}
          >
            {activeTab === "keluhan" && (
              <div className="absolute left-[-16px] top-1.5 bottom-1.5 w-1 bg-[#b61722] rounded-r-md" />
            )}
            <Folder className={cn("h-4.5 w-4.5", activeTab === "keluhan" ? "text-[#b61722]" : "")} />
            <span>Keluhan Saya</span>
          </button>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-4">
        <button
          onClick={() => router.push("/complaints/create")}
          className="w-full h-11 bg-[#b61722] hover:bg-[#a7151e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-red-950/20 active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Report</span>
        </button>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
