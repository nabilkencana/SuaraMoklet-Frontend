import React from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Complaint } from "@/types/complaint";

interface CloseComplaintModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  solusiText: string;
  isSubmitting: boolean;
  onClose: () => void;
  onChangeText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CloseComplaintModal({
  isOpen,
  complaint,
  solusiText,
  isSubmitting,
  onClose,
  onChangeText,
  onSubmit,
}: CloseComplaintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Tutup Keluhan &amp; Berikan Solusi
              </h3>
              <p className="text-[11px] text-slate-400">
                Ubah status keluhan menjadi SELESAI (DONE)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Complaint info pill */}
        {complaint && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center shrink-0">
              ✓
            </div>
            <div className="min-w-0">
              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Keluhan yang Diselesaikan
              </span>
              <span className="block font-bold text-slate-800 text-xs truncate">
                {complaint.title}
              </span>
              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                #{complaint.id?.slice(0, 8)}
              </span>
            </div>
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Setelah ditutup, solusi ini akan ditampilkan sebagai <strong>Solusi Resmi</strong>{" "}
            kepada pelapor dan pelapor dapat memberikan penilaian (rating).
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              Template Cepat (Opsional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Kerusakan telah diperbaiki",
                "Penggantian peralatan selesai",
                "Koordinasi lintas unit tuntas",
                "Masalah teridentifikasi & diatasi",
              ].map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => onChangeText(tpl)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-600 font-semibold text-[11px] rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  + {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              Uraian Solusi / Tindakan yang Dilakukan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan secara detail tindakan dan perbaikan yang telah diselesaikan oleh tim unit..."
              value={solusiText}
              onChange={(e) => onChangeText(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white resize-none text-slate-800 placeholder:text-slate-350 leading-relaxed font-normal"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !solusiText.trim()}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{isSubmitting ? "Menyimpan..." : "Tutup & Terbitkan Solusi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
