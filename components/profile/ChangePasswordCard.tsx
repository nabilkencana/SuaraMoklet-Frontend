import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface ChangePasswordCardProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  isSaving: boolean;
}

export default function ChangePasswordCard({
  register,
  errors,
  watch,
  isSaving,
}: ChangePasswordCardProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPassword = watch("newPassword") || "";

  // Validation rules check status
  const rules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const strengthCount = Object.values(rules).filter(Boolean).length;
  
  // Calculate progress bar color and text
  const getStrengthBar = () => {
    if (!newPassword) return { width: "0%", color: "bg-slate-200", label: "" };
    if (strengthCount <= 2) return { width: "33%", color: "bg-rose-500", label: "Lemah" };
    if (strengthCount <= 4) return { width: "66%", color: "bg-amber-500", label: "Sedang" };
    return { width: "100%", color: "bg-emerald-500", label: "Kuat" };
  };

  const strength = getStrengthBar();

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Ganti Password
        </h3>
        <p className="text-[11px] text-slate-400 font-medium">Ubah kata sandi secara berkala untuk meningkatkan keamanan akun Anda.</p>
      </div>

      <div className="space-y-5">
        {/* Current Password */}
        <div className="space-y-1.5 max-w-md">
          <label htmlFor="currentPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Password Saat Ini
          </label>
          <div className="relative group">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              disabled={isSaving}
              className={`pr-10 ${
                errors.currentPassword ? "border-red-500/60 focus:border-red-500" : ""
              }`}
              placeholder="••••••••"
              {...register("currentPassword")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-600 transition-colors"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs font-medium text-red-650 mt-1">
              {errors.currentPassword.message as string}
            </p>
          )}
        </div>

        {/* Password Baru & Konfirmasi Password Baru Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password Baru
            </label>
            <div className="relative group">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                disabled={isSaving}
                className={`pr-10 ${
                  errors.newPassword ? "border-red-500/60 focus:border-red-500" : ""
                }`}
                placeholder="••••••••"
                {...register("newPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-600 transition-colors"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs font-medium text-red-650 mt-1">
                {errors.newPassword.message as string}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Konfirmasi Password Baru
            </label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                disabled={isSaving}
                className={`pr-10 ${
                  errors.confirmPassword ? "border-red-500/60 focus:border-red-500" : ""
                }`}
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-600 mt-1">
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Password Strength Indicator Visual Panel */}
        {newPassword.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3.5 max-w-xl transition-all duration-350">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Kekuatan Kata Sandi:</span>
              <span className={
                strengthCount <= 2 ? "text-rose-500" : strengthCount <= 4 ? "text-amber-500" : "text-emerald-600"
              }>
                {strength.label}
              </span>
            </div>

            {/* Progress indicator bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${strength.color} transition-all duration-500`}
                style={{ width: strength.width }}
              />
            </div>

            {/* Criteria checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                {rules.length ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-slate-300" />}
                <span className={rules.length ? "text-slate-700" : ""}>Minimal 8 karakter</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.uppercase ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-slate-300" />}
                <span className={rules.uppercase ? "text-slate-700" : ""}>Mengandung huruf besar (A-Z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.lowercase ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-slate-300" />}
                <span className={rules.lowercase ? "text-slate-700" : ""}>Mengandung huruf kecil (a-z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.number ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-slate-300" />}
                <span className={rules.number ? "text-slate-700" : ""}>Mengandung angka (0-9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rules.special ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-slate-300" />}
                <span className={rules.special ? "text-slate-700" : ""}>Mengandung karakter khusus (@, #, $, dll)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
