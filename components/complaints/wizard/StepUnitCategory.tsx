import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ComplaintFormData, UNIT_DETAILS } from "./types";

interface StepUnitCategoryProps {
  register: UseFormRegister<ComplaintFormData>;
  errors: FieldErrors<ComplaintFormData>;
  watchedUnit: string;
}

export default function StepUnitCategory({
  register,
  errors,
  watchedUnit,
}: StepUnitCategoryProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Unit Sekolah Mana yang Berwenang?
        </h3>
        <p className="text-xs text-slate-500">
          Pilih departemen sekolah yang paling tepat untuk menindaklanjuti isu Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {UNIT_DETAILS.map((item) => (
          <label
            key={item.name}
            className={`flex items-start gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
              watchedUnit === item.name
                ? "border-red-650 bg-red-50/50 text-red-750 shadow-xs"
                : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
            }`}
          >
            <input
              type="radio"
              value={item.name}
              className="mt-1 text-red-600 focus:ring-red-550/20 cursor-pointer"
              {...register("unit")}
            />
            <div className="space-y-1">
              <span className="text-sm font-bold block">{item.name}</span>
              <span
                className={`text-[10px] leading-relaxed block transition-colors ${
                  watchedUnit === item.name ? "text-red-700/80 font-medium" : "text-slate-400"
                }`}
              >
                {item.desc}
              </span>
            </div>
          </label>
        ))}
      </div>
      {errors.unit && (
        <p className="text-xs font-medium text-red-600 mt-1">{errors.unit.message}</p>
      )}
    </div>
  );
}
