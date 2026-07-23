"use client";

import React from "react";
import { User, Mail, Phone, ShieldCheck, Clock } from "lucide-react";
import useProfile from "@/hooks/useProfile";

const ROLE_LABEL: Record<string, string> = {
  USER: "Siswa",
  UNIT_MEMBER: "Anggota Unit",
  UNIT_PIC: "PIC Unit",
  SUPER_PIC: "Super PIC",
  SUPERADMIN: "Super Admin",
};

const ROLE_COLOR: Record<string, string> = {
  USER: "bg-blue-50 text-blue-600 border border-blue-200",
  UNIT_MEMBER: "bg-amber-50 text-amber-600 border border-amber-200",
  UNIT_PIC: "bg-red-50 text-red-600 border border-red-200",
  SUPER_PIC: "bg-purple-50 text-purple-600 border border-purple-200",
  SUPERADMIN: "bg-slate-800 text-white border border-slate-700",
};

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-all">
          {value || <span className="text-slate-400 italic font-normal">Tidak tersedia</span>}
        </p>
      </div>
    </div>
  );
}

export default function ProfileContainer() {
  const { profile, isLoading } = useProfile();

  // Loading skeleton
  if (isLoading || !profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <div className="h-20 w-20 rounded-full bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-100 rounded w-1/2" />
              <div className="h-3.5 bg-slate-100 rounded w-1/3" />
              <div className="h-6 bg-slate-100 rounded w-24" />
            </div>
          </div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 bg-slate-100 rounded w-16" />
                  <div className="h-4 bg-slate-100 rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initials = profile.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = ROLE_LABEL[profile.user.role] || profile.user.role;
  const roleColor = ROLE_COLOR[profile.user.role] || "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Read-only notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-bold">Data profil bersifat read-only.</span>{" "}
          Informasi akun disinkronkan dari sistem sekolah dan tidak dapat diubah melalui platform ini.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-slate-100">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.user.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-sm">
              {initials}
            </div>
          )}
          <div className="space-y-1.5 min-w-0">
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight truncate">{profile.user.name}</h2>
            <p className="text-xs text-slate-400 font-medium">{profile.user.email}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="px-6">
          <InfoRow icon={User} label="Nama Lengkap" value={profile.user.name} />
          <InfoRow icon={Mail} label="Email" value={profile.user.email} />
          <InfoRow icon={Phone} label="Nomor Telepon" value={profile.phone} />
          <InfoRow icon={ShieldCheck} label="Role" value={roleLabel} />
        </div>

        {/* Footer note */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Data disinkronkan dari sistem sekolah. Untuk perubahan data, hubungi administrator.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
