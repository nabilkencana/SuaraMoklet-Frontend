import React from "react";
import { UseFormRegister } from "react-hook-form";
import { ComplaintFormData } from "./types";

interface StepReviewSubmitProps {
  register: UseFormRegister<ComplaintFormData>;
  watchedTitle: string;
  watchedUnit: string;
  watchedIsAnonymous: boolean;
}

export default function StepReviewSubmit({
  register,
  watchedTitle,
  watchedUnit,
  watchedIsAnonymous,
}: StepReviewSubmitProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">Pengaturan Privasi &amp; Konfirmasi</h3>
        <p className="text-xs text-slate-500">Tentukan privasi nama Anda untuk keluhan ini.</p>
      </div>

      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-start gap-3.5">
        <input
          type="checkbox"
          id="isAnonymous"
          className="mt-1 text-red-600 focus:ring-red-500/20 h-4.5 w-4.5 rounded cursor-pointer"
          {...register("isAnonymous")}
        />
        <div className="space-y-1 cursor-pointer select-none flex-1">
          <label htmlFor="isAnonymous" className="text-sm font-bold text-slate-800 block cursor-pointer">
            Kirim Sebagai Anonim
          </label>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nama Anda tidak akan ditampilkan kepada publik atau siswa lain di platform. Hanya
            pihak unit pengelola berwenang yang dapat melihat identitas Anda untuk kebutuhan
            klarifikasi internal.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          Ringkasan Pengajuan
        </h4>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Judul Keluhan
            </span>
            <span className="text-sm font-bold text-slate-800 leading-snug mt-0.5 block">
              {watchedTitle}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Unit Sekolah
              </span>
              <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                {watchedUnit}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tingkat Privasi
              </span>
              <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                {watchedIsAnonymous ? "Anonim" : "Publik (Terlihat)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
