"use client";

import React, { useState, useMemo } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import useProfile from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

interface ChangePasswordCardProps {
  userType?: string;
}

export default function ChangePasswordCard({
  userType,
}: ChangePasswordCardProps) {
  const { changePassword } = useProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password rules validation
  const rules = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpperAndLower:
        /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      hasNumberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
  }, [newPassword]);

  // Calculate strength score (0 to 3)
  const strengthScore = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (rules.minLength) score++;
    if (rules.hasUpperAndLower) score++;
    if (rules.hasNumberOrSpecial) score++;
    return score;
  }, [newPassword, rules]);

  const strengthMeta = [
    { label: "Belum Diisi", color: "bg-slate-200", text: "text-slate-400" },
    { label: "Lemah", color: "bg-red-500", text: "text-red-500" },
    { label: "Sedang", color: "bg-amber-500", text: "text-amber-500" },
    { label: "Kuat & Aman", color: "bg-emerald-500", text: "text-emerald-600" },
  ][strengthScore];

  const isMatching = confirmPassword.length > 0 && confirmPassword === newPassword;
  const isMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit =
    currentPassword.trim().length > 0 &&
    rules.minLength &&
    isMatching &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Kata sandi saat ini wajib diisi");
      return;
    }

    if (!rules.minLength) {
      toast.error("Kata sandi baru minimal harus 8 karakter");
      return;
    }

    if (!isMatching) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Kata sandi baru harus berbeda dari kata sandi saat ini");
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOrangTua = userType === "ORANGTUA";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 mt-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Ubah Kata Sandi
              </h2>
              {isOrangTua && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Akun Orang Tua
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola keamanan kata sandi akun Anda untuk akses mandiri ke aplikasi SuaraMoklet.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-5">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="currentPassword"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Kata Sandi Saat Ini
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi lama Anda"
              disabled={isSubmitting}
              className="w-full h-10.5 px-3.5 pr-11 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Kata Sandi Baru
            </label>
            {newPassword && (
              <span className={cn("text-[11px] font-bold tracking-tight", strengthMeta.text)}>
                {strengthMeta.label}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter baru"
              disabled={isSubmitting}
              className="w-full h-10.5 px-3.5 pr-11 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength Progress Bar */}
          {newPassword.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-3 gap-1.5 h-1.5">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      strengthScore >= level ? strengthMeta.color : "bg-slate-100"
                    )}
                  />
                ))}
              </div>

              {/* Requirement Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {rules.minLength ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span className={rules.minLength ? "text-emerald-700 font-medium" : "text-slate-400"}>
                    Min. 8 karakter
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {rules.hasUpperAndLower ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span className={rules.hasUpperAndLower ? "text-emerald-700 font-medium" : "text-slate-400"}>
                    Huruf besar & kecil
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {rules.hasNumberOrSpecial ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span className={rules.hasNumberOrSpecial ? "text-emerald-700 font-medium" : "text-slate-400"}>
                    Angka / simbol
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5 pt-1">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru Anda"
              disabled={isSubmitting}
              className={cn(
                "w-full h-10.5 px-3.5 pr-11 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium",
                isMismatch
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : isMatching
                  ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  : "border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Real-time Match Feedback */}
          {isMismatch && (
            <p className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              Konfirmasi kata sandi belum sesuai dengan kata sandi baru.
            </p>
          )}
          {isMatching && (
            <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Kata sandi cocok dan siap disimpan.
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 order-2 sm:order-1">
            Gunakan kata sandi yang kuat dan tidak digunakan di akun lain.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "w-full sm:w-auto h-10 px-6 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2",
              canSubmit
                ? "bg-red-600 hover:bg-red-700 active:scale-95 shadow-red-500/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Kata Sandi"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
