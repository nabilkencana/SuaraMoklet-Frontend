"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { LayoutDashboard, Folder, PlusCircle , House } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RoleSwitchToggle from "@/components/dashboard/RoleSwitchToggle";

interface UnitSidebarProps {
  activeTab: "dashboard" | "keluhan";
  onTabChange?: (tab: "dashboard" | "keluhan") => void;
}

export default function UnitSidebar({ activeTab, onTabChange }: UnitSidebarProps) {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const isSuperPic = user?.role === "SUPER_PIC";

  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar dari portal");
    router.push("/");
  };

  const handleTabClick = (tab: "dashboard" | "keluhan") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      localStorage.setItem("unitActiveTab", tab);
      router.push("/dashboard");
    }
  };

  return (
    <aside className="w-70 h-full bg-[#000000] flex flex-col justify-between p-6 text-zinc-300 border-r border-zinc-900 shrink-0 overflow-y-auto relative">
      <div className="space-y-8">
        {/* Logo & Portal Branding */}
        <div className="flex flex-col gap-1 border-b border-zinc-800/40 pb-5 pl-2">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
            <span className="font-bold text-white text-lg tracking-tight">SuaraMoklet</span>
          </div>
          <span className="text-[10px] font-bold text-[#b61722] tracking-wider uppercase">
            GOVERNANCE PORTAL
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 relative">
          {/* Top Sidebar items */}
          <div className="mb-10">
            <button
              onClick={() => router.push("/")}
              className="w-full h-11 bg-[#b61722] hover:bg-red-650 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <House className="h-5 w-5" />
              <span>Kembali Beranda</span>
            </button>
          </div>

          <button
            onClick={() => handleTabClick("dashboard")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "dashboard"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "dashboard" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabClick("keluhan")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "keluhan"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "keluhan" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <Folder className="h-4.5 w-4.5" />
            <span>Keluhan</span>
          </button>
        </nav>
      </div>

      {/* Role Switch Toggle — only for SUPER_PIC */}
      {isSuperPic && (
        <div className="p-4 border-t border-zinc-900/60">
          <RoleSwitchToggle darkMode />
        </div>
      )}
    </aside>
  );
}
