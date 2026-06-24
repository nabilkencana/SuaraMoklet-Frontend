"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Kata sandi saat ini minimal 8 karakter"),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi kata sandi minimal 8 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi baru tidak cocok",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordFormProps {
  onChangePassword: (data: PasswordFormData) => Promise<boolean>;
}

export default function ChangePasswordForm({ onChangePassword }: ChangePasswordFormProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
    const success = await onChangePassword(data);
    if (success) {
      reset();
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Password */}
      <div className="space-y-1.5">
        <label htmlFor="currentPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Kata Sandi Saat Ini
        </label>
        <div className="relative group">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            disabled={isSaving}
            className={`pr-10 ${
              errors.currentPassword ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            placeholder="••••••••"
            {...register("currentPassword")}
          />
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-600 transition-colors"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Kata Sandi Baru
        </label>
        <div className="relative group">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            disabled={isSaving}
            className={`pr-10 ${
              errors.newPassword ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            placeholder="••••••••"
            {...register("newPassword")}
          />
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-600 transition-colors"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative group">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            disabled={isSaving}
            className={`pr-10 ${
              errors.confirmPassword ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-600 transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Memproses...</span>
          </>
        ) : (
          <span>Perbarui Kata Sandi</span>
        )}
      </Button>
    </form>
  );
}
