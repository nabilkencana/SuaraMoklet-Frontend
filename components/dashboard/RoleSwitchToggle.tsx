"use client";

/**
 * RoleSwitchToggle.tsx
 *
 * Toggle untuk user SUPER_PIC agar bisa beralih
 * antara tampilan "Koordinator ISO" dan "Super Admin".
 */

import React from "react";
import { Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoleViewStore, RoleView } from "@/app/store/role-view.store";

interface RoleSwitchToggleProps {
  /** Ada keluhan NEW yang belum ditangani di sisi ISO */
  hasIsoNotification?: boolean;
  /** Ada keluhan OPEN yang belum selesai di sisi Admin */
  hasAdminNotification?: boolean;
  /** Apakah di dalam sidebar gelap */
  darkMode?: boolean;
}

export default function RoleSwitchToggle({
  hasIsoNotification = false,
  hasAdminNotification = false,
  darkMode = true,
}: RoleSwitchToggleProps) {
  const { activeView, setActiveView } = useRoleViewStore();

  const options: {
    key: RoleView;
    label: string;
    sublabel: string;
    icon: React.ComponentType<any>;
    hasNotif: boolean;
  }[] = [
    {
      key: "iso",
      label: "Koordinator ISO",
      sublabel: "Aksi: delegasi & teruskan",
      icon: UserCog,
      hasNotif: hasIsoNotification,
    },
    {
      key: "admin",
      label: "Super Admin",
      sublabel: "Aksi: kelola & pantau",
      icon: Shield,
      hasNotif: hasAdminNotification,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl p-1 border",
        darkMode
          ? "bg-white/[0.03] border-white/[0.06]"
          : "bg-slate-50 border-slate-200"
      )}
    >
      {/* Label atas */}
      <p
        className={cn(
          "text-[9px] font-bold uppercase tracking-widest mb-1.5 px-2 pt-1",
          darkMode ? "text-neutral-500" : "text-slate-400"
        )}
      >
        ROLE
      </p>

      {/* Toggle Buttons */}
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeView === opt.key;
          // Notifikasi hanya relevan ditampilkan saat opsi ini TIDAK aktif
          const showNotif = opt.hasNotif && !isActive;

          return (
            <button
              key={opt.key}
              onClick={() => setActiveView(opt.key)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group",
                isActive
                  ? darkMode
                    ? "bg-[#b61722] text-white shadow-sm shadow-red-900/40"
                    : "bg-[#b61722] text-white shadow-sm"
                  : darkMode
                  ? "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              {/* Icon */}
              <div className="relative shrink-0">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-white"
                      : darkMode
                      ? "text-neutral-500 group-hover:text-white"
                      : "text-slate-400"
                  )}
                />
                {/* Dot notifikasi di pojok kanan atas icon */}
                {showNotif && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[11px] font-bold leading-tight",
                    isActive ? "text-white" : ""
                  )}
                >
                  {opt.label}
                </span>
                <span
                  className={cn(
                    "block text-[9px] font-medium leading-tight mt-0.5",
                    isActive
                      ? "text-white/70"
                      : darkMode
                      ? "text-neutral-600"
                      : "text-slate-400"
                  )}
                >
                  {opt.sublabel}
                </span>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-white/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
