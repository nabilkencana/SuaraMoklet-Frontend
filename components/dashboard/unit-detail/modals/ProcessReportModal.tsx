import React from "react";
import { X, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Complaint } from "@/types/complaint";

interface ProcessReportModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  rencanaText: string;
  isSubmitting: boolean;
  onClose: () => void;
  onChangeText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProcessReportModal({
  isOpen,
  complaint,
  rencanaText,
  isSubmitting,
  onClose,
  onChangeText,
  onSubmit,
}: ProcessReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <RefreshCw className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Proses Laporan Keluhan
              </h3>
              <p className="text-[11px] text-slate-400">
                Ubah status keluhan menjadi DIPROSES (OPEN)
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
            <div className="h-7 w-7 rounded-lg bg-red-100 text-red-700 font-extrabold text-xs flex items-center justify-center shrink-0">
              #
            </div>
            <div className="min-w-0">
              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Keluhan yang Diproses
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

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              Template Cepat (Opsional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Sedang dijadwalkan untuk ditinjau",
                "Tim teknis akan segera turun lapangan",
                "Koordinasi dengan pihak terkait",
                "Pengadaan material diproses",
              ].map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => onChangeText(tpl)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-600 font-semibold text-[11px] rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  + {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              Rencana / Tindakan Penanganan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan rencana langkah penanganan atau perkiraan waktu penyelesaian..."
              value={rencanaText}
              onChange={(e) => onChangeText(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none text-slate-800 placeholder:text-slate-350 leading-relaxed font-normal"
            />
            <p className="text-[10.5px] text-slate-400 leading-snug">
              Teks ini akan otomatis dikirimkan sebagai tanggapan resmi dari unit dan status
              keluhan diperbarui.
            </p>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-blue-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <p className="leading-relaxed text-[11px]">
              Pelapor akan menerima notifikasi bahwa laporannya sedang dalam penanganan aktif.
            </p>
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
              disabled={isSubmitting || !rencanaText.trim()}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>{isSubmitting ? "Memproses..." : "Mulai Proses Laporan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
