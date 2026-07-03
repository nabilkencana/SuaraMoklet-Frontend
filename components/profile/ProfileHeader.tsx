import React from "react";
import { Shield } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileHeaderProps {
  userName: string;
  role: string;
  avatarUrl?: string;
  isUploading: boolean;
  onUploadAvatar: (file: File) => Promise<string | null>;
}

export default function ProfileHeader({
  userName,
  role,
  avatarUrl,
  isUploading,
  onUploadAvatar,
}: ProfileHeaderProps) {
  // Determine user sub-heading (e.g. Student class or administrator portal role)
  const subtitle = role === "USER" ? "Siswa Kelas XI RPL 2" : `Pengelola — Unit ${role}`;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-200">
      {/* Profile avatar with edit and upload overlay */}
      <ProfileAvatar
        avatarUrl={avatarUrl}
        userName={userName}
        onUpload={onUploadAvatar}
        isUploading={isUploading}
      />

      {/* User name & role headings */}
      <div className="text-center sm:text-left space-y-1 pt-2">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">
          {userName}
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          {subtitle}
        </p>

        {/* Verification Shield Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-550 text-[10px] font-bold uppercase tracking-wider select-none shadow-sm shadow-slate-100/50">
          <Shield className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/10" />
          <span>Akun Terverifikasi</span>
        </div>
      </div>
    </div>
  );
}
