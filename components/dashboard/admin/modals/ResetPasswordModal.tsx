import React, { useState, useEffect } from "react";
import { X, KeyRound, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { AdminUserRow } from "../types";

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: AdminUserRow | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (userId: string, newPassword: string) => Promise<void> | void;
}

export default function ResetPasswordModal({
  isOpen,
  user,
  isSubmitting,
  onClose,
  onSubmit,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setShowPassword(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 8) {
      setError("Password baru minimal 8 karakter");
      return;
    }
    setError(null);
    onSubmit(user.id, newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Reset Password Pengguna
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Atur ulang kata sandi pengguna secara langsung
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card Info */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Target Pengguna
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {user.role}
            </span>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{user.name}</div>
            <div className="text-slate-500 text-xs font-medium">{user.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                className="w-full h-11 px-4 pr-11 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white font-medium"
                placeholder="Minimal 8 karakter (cth: Rahasia123)"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-xs font-medium text-red-500 mt-1.5 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{error}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Setelah direset, pengguna dapat langsung login menggunakan password baru ini.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 bg-[#b61722] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mereset...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
