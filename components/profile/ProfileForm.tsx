import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  email: string;
  isSaving: boolean;
}

export default function ProfileForm({
  register,
  errors,
  email,
  isSaving,
}: ProfileFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
        Informasi Pribadi
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            disabled={isSaving}
            className={errors.name ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""}
            placeholder="Masukkan nama lengkap Anda"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs font-medium text-red-650 mt-1">
              {errors.name.message as string}
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Email <span className="text-slate-400 font-semibold lowercase">(Read-only)</span>
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled={true}
            className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200/80 font-medium"
            placeholder="email@siswa.smktelkom-mlg.sch.id"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nomor Telepon <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            type="text"
            disabled={isSaving}
            className={errors.phone ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""}
            placeholder="Contoh: 081234567890"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs font-medium text-red-650 mt-1">
              {errors.phone.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
