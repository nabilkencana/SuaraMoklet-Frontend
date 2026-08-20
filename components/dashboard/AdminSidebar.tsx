"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  Users,
  MessageSquare,
  Bot,
  LayoutDashboard,
  House,
  ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminTab = "dashboard" | "complaints" | "units" | "members" | "whatsapp" | "audit_logs";

interface AdminSidebarProps {
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const router = useRouter();

  const handleTabClick = (tab: AdminTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      localStorage.setItem("adminActiveTab", tab);
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
            onClick={() => handleTabClick("complaints")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "complaints"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "complaints" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Keluhan</span>
          </button>

          <button
            onClick={() => handleTabClick("units")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "units"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "units" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <Building className="h-4.5 w-4.5" />
            <span>Units</span>
          </button>

          <button
            onClick={() => handleTabClick("members")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "members"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "members" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <Users className="h-4.5 w-4.5" />
            <span>Manajemen Pengguna</span>
          </button>
          
          <button
            onClick={() => handleTabClick("whatsapp")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "whatsapp"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "whatsapp" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <Bot className="h-4.5 w-4.5" />
            <span>WhatsApp Bot</span>
          </button>

          <button
            onClick={() => handleTabClick("audit_logs")}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
              activeTab === "audit_logs"
                ? "bg-[#1c1c1e] text-white"
                : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
            )}
          >
            {activeTab === "audit_logs" && (
              <div className="absolute -left-6 top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <ScrollText className="h-4.5 w-4.5" />
            <span>Log Sistem</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
