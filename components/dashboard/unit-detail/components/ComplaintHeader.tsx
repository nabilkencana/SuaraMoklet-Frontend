import React from "react";
import { useRouter } from "next/navigation";

interface ComplaintHeaderProps {
  userRole?: string;
}

export default function ComplaintHeader({ userRole }: ComplaintHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        {userRole === "SUPERADMIN" || userRole === "SUPER_PIC" ? (
          <>
            <button
              onClick={() => {
                localStorage.setItem("adminActiveTab", "dashboard");
                router.push("/dashboard");
              }}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Pusat Kontrol
            </button>
            <span>&gt;</span>
            <button
              onClick={() => {
                localStorage.setItem("adminActiveTab", "complaints");
                router.push("/dashboard");
              }}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Semua Aspirasi
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                localStorage.setItem("unitActiveTab", "dashboard");
                router.push("/dashboard");
              }}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Dashboard Unit
            </button>
            <span>&gt;</span>
            <button
              onClick={() => {
                localStorage.setItem("unitActiveTab", "keluhan");
                router.push("/dashboard");
              }}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Keluhan Masuk
            </button>
          </>
        )}
        <span>&gt;</span>
        <span className="text-slate-500">Detail Keluhan</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Detail Keluhan</h1>
        <p className="text-slate-500 text-xs mt-0.5 font-medium">
          Kelola keluhan yang masuk ke unit Anda.
        </p>
      </div>
    </div>
  );
}
