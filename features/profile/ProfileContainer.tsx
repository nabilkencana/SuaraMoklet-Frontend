"use client";

import React, { useState } from "react";
import { User as UserIcon, Shield, Mail, Phone, Lock, Settings } from "lucide-react";
import useProfile from "@/hooks/useProfile";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { cn } from "@/lib/utils";

export default function ProfileContainer() {
  const { profile, isLoading, updateProfile, changePassword } = useProfile();
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  if (isLoading || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
          <div className="md:col-span-2 h-96 bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  const { user, phone, avatarUrl } = profile;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Banner */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 md:p-8 text-white shadow-md overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
          <div className="h-20 w-20 rounded-full border-2 border-white/80 overflow-hidden bg-white/10 flex items-center justify-center text-3xl font-bold uppercase shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
            <p className="text-sm text-red-100 font-medium flex items-center justify-center sm:justify-start gap-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </p>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold tracking-wide uppercase mt-1">
              <Shield className="h-3 w-3" />
              <span>{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Form Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab("info")}
            className={cn(
              "w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer",
              activeTab === "info"
                ? "bg-red-50 text-red-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Edit Profil</span>
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={cn(
              "w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer",
              activeTab === "password"
                ? "bg-red-50 text-red-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Lock className="h-4.5 w-4.5" />
            <span>Ubah Kata Sandi</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {activeTab === "info" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Informasi Pribadi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui nama, nomor telepon, dan foto profil Anda.</p>
              </div>
              <hr className="border-slate-100" />
              <ProfileInfoForm
                initialData={{ name: user.name, phone, avatarUrl }}
                onUpdate={updateProfile}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Keamanan Akun</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ubah kata sandi secara berkala untuk menjaga akun tetap aman.</p>
              </div>
              <hr className="border-slate-100" />
              <ChangePasswordForm onChangePassword={changePassword} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
