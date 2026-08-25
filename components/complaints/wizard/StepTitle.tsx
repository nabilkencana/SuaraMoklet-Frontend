import React from "react";
import { UseFormRegister, FieldErrors, useWatch, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import { ComplaintFormData } from "./types";

interface StepTitleProps {
  register: UseFormRegister<ComplaintFormData>;
  errors: FieldErrors<ComplaintFormData>;
  control: Control<ComplaintFormData>;
}

// F7 FIX (MD-3): Karakter WhatsApp formatting yang bisa disalahgunakan.
// Jika diinterpolasi mentah ke template WA → pesan resmi sekolah bisa dipalsukan formatnya.
// Skenario: judul "*SEGERA* Admin Minta Dana" → pesan WA tampil bold, menyerupai notifikasi resmi.
const WA_INJECTION_REGEX = /[*_`~\n]/;

export default function StepTitle({ register, errors, control }: StepTitleProps) {
  const titleValue = useWatch({ control, name: "title", defaultValue: "" });
  const hasWaChars = WA_INJECTION_REGEX.test(titleValue ?? "");

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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const nextBtn = document.getElementById("stepper-next-button");
              if (nextBtn) nextBtn.click();
            }
          }}
        />
        {errors.title && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.title.message}</p>
        )}
        {/* F7: Warning karakter WhatsApp formatting — MD-3 defense-in-depth */}
        {hasWaChars && !errors.title && (
          <div className="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Judul mengandung karakter spesial (<code className="font-mono bg-amber-100 px-0.5 rounded">*</code>, <code className="font-mono bg-amber-100 px-0.5 rounded">_</code>, backtick, atau baris baru)
              yang dapat memengaruhi tampilan notifikasi WhatsApp. Pertimbangkan untuk menghapusnya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

