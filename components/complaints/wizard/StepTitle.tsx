import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ComplaintFormData } from "./types";

interface StepTitleProps {
  register: UseFormRegister<ComplaintFormData>;
  errors: FieldErrors<ComplaintFormData>;
}

export default function StepTitle({ register, errors }: StepTitleProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Apa masalah utama yang ingin Anda sampaikan?
        </h3>
        <p className="text-xs text-slate-500">
          Berikan judul singkat dan jelas agar mudah dipahami oleh pihak sekolah.
        </p>
      </div>
      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Judul Keluhan <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Contoh: AC Laboratorium RPL 2 Sering Mati"
          className={errors.title ? "border-red-500/60 focus:border-red-500" : ""}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>
    </div>
  );
}
