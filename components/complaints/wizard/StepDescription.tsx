import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ComplaintFormData } from "./types";

interface StepDescriptionProps {
  register: UseFormRegister<ComplaintFormData>;
  errors: FieldErrors<ComplaintFormData>;
}

export default function StepDescription({ register, errors }: StepDescriptionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Jelaskan keluhan Anda secara mendetail
        </h3>
        <p className="text-xs text-slate-500">
          Tulis permasalahan secara kronologis serta tuliskan pula hasil/harapan yang Anda inginkan.
        </p>
      </div>

      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Deskripsi Permasalahan <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Jelaskan detail permasalahan agar admin dapat meninjau dengan lengkap..."
          className={`flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.description ? "border-red-500/60 focus:border-red-500" : ""
          }`}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Hasil Yang Diharapkan <span className="text-slate-400">(Opsional)</span>
        </label>
        <textarea
          id="expectedOutput"
          rows={2}
          placeholder="Contoh: Pihak sekolah segera memanggil teknisi untuk memeriksa AC yang mati."
          className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10"
          {...register("expectedOutput")}
        />
      </div>
    </div>
  );
}
