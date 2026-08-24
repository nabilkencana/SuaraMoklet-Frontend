import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ComplaintFormData, getFallbackUnitDescription } from "./types";
import { UnitModel } from "@/types/complaint";

interface StepUnitCategoryProps {
  register: UseFormRegister<ComplaintFormData>;
  errors: FieldErrors<ComplaintFormData>;
  watchedUnit: string;
  units: UnitModel[];
}

export default function StepUnitCategory({
  register,
  errors,
  watchedUnit,
  units,
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
        <div className="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <span className="text-amber-500 text-sm mt-0.5 shrink-0">💡</span>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <span className="font-bold">Tidak tahu harus pilih unit mana?</span> Pilih{" "}
            <span className="font-bold">Umum (ISO)</span> — tim koordinator kami akan menelaah dan meneruskan laporan ke unit yang tepat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {units.map((item) => (
          <label
            key={item.id}
            className={`flex items-start gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
              watchedUnit === item.id
                ? "border-red-650 bg-red-50/50 text-red-750 shadow-xs"
                : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
            }`}
          >
            <input
              type="radio"
              value={item.id}
              className="mt-1 text-red-600 focus:ring-red-550/20 cursor-pointer"
              {...register("unit")}
            />
            <div className="space-y-1">
              <span className="text-sm font-bold block">{item.name}</span>
              <span
                className={`text-[10px] leading-relaxed block transition-colors ${
                  watchedUnit === item.id ? "text-red-700/80 font-medium" : "text-slate-400"
                }`}
              >
                {item.description || getFallbackUnitDescription(item.name)}
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
