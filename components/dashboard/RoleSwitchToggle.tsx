"use client";

/**
 * RoleSwitchToggle.tsx
 *
 * Komponen terintegrasi di footer sidebar ala Vercel / Slack / Notion:
 * Menampilkan profil user aktif dan popover switcher mode (Koordinator ISO / Super Admin)
 * untuk pengguna SUPER_PIC tanpa gangguan dot kuning.
 */

import React, { useState, useRef, useEffect } from "react";
import { Shield, UserCog, ChevronsUpDown, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store/auth.store";
import { useRoleViewStore, RoleView } from "@/app/store/role-view.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RoleSwitchToggleProps {
  hasIsoNotification?: boolean;
  hasAdminNotification?: boolean;
  darkMode?: boolean;
}

export default function RoleSwitchToggle({
  darkMode = true,
}: RoleSwitchToggleProps) {
  const { user, logout } = useAuthStore();
  const { activeView, setActiveView } = useRoleViewStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isSuperPic = user?.role === "SUPER_PIC";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (key: RoleView) => {
    setActiveView(key);
    setIsOpen(false);
    toast.success(`Beralih ke mode ${key === "admin" ? "Super Admin" : "Koordinator ISO"}`);
  };

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar dari portal");
    router.push("/");
  };

  const currentRoleLabel = isSuperPic
    ? activeView === "admin"
      ? "Super Admin"
      : "Koordinator ISO"
    : user?.role === "SUPERADMIN"
    ? "Superadmin"
    : user?.role === "UNIT_PIC"
    ? "Unit PIC"
    : "Tim Unit";

  const options: {
    key: RoleView;
    label: string;
    description: string;
    icon: React.ComponentType<any>;
  }[] = [
    {
      key: "admin",
      label: "Super Admin",
      description: "Kelola governance, anggota & sistem",
      icon: Shield,
    },
    {
      key: "iso",
      label: "Koordinator ISO",
      description: "Tindak lanjut & delegasi unit",
      icon: UserCog,
    },
  ];

  const userInitial = (user?.name || "Admin").charAt(0).toUpperCase();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Popover Dropdown (Appears Upward from footer) */}
      {isOpen && isSuperPic && (
        <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-[#141416] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {/* Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-white/[0.06] mb-1">
            <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-neutral-400">
              Ganti Mode Akses
            </span>
          </div>

          {/* Option List */}
          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeView === opt.key;

              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer group",
                    isActive
                      ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-xs"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isActive
                        ? "bg-[#b61722] text-white"
                        : "bg-white/[0.05] text-neutral-400 group-hover:text-white group-hover:bg-white/[0.08]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-white leading-tight">
                      {opt.label}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-medium truncate mt-0.5">
                      {opt.description}
                    </span>
                  </div>

                  {isActive && (
                    <div className="shrink-0 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider & Logout option */}
          <div className="pt-1 mt-1 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-neutral-400 hover:text-red-400 hover:bg-red-950/20 text-xs font-medium transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar dari Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Footer Profile Row / Trigger */}
      <button
        type="button"
        disabled={!isSuperPic}
        onClick={() => isSuperPic && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-2.5 rounded-2xl border transition-all duration-200 text-left select-none group",
          darkMode
            ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]"
            : "bg-slate-50 hover:bg-slate-100 border-slate-200",
          isSuperPic ? "cursor-pointer" : "cursor-default"
        )}
      >
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="h-8.5 w-8.5 rounded-xl bg-[#b61722] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ring-1 ring-white/10">
            {userInitial}
          </div>

          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-white leading-tight truncate">
              {user?.name || "Admin ISO"}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="block text-[10px] text-neutral-400 font-medium truncate">
                {currentRoleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Chevrons Up Down icon for Super PIC */}
        {isSuperPic && (
          <div className="h-6 w-6 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center shrink-0 transition-colors">
            <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
          </div>
        )}
      </button>
    </div>
  );
}
