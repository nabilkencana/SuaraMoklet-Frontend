import React from "react";
import { X, Clock, Loader2 } from "lucide-react";

interface AutoCloseConfigModalProps {
  isOpen: boolean;
  autoCloseDays: number;
  isUpdating: boolean;
  onChangeDays: (days: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AutoCloseConfigModal({
  isOpen,
  autoCloseDays,
  isUpdating,
  onChangeDays,
  onClose,
  onSubmit,
}: AutoCloseConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Konfigurasi Auto-Close</h3>
              <p className="text-[11px] text-slate-400">Atur batas hari penutupan otomatis keluhan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Batas Waktu Auto-Close (Hari)
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={autoCloseDays}
              onChange={(e) => onChangeDays(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
              placeholder="Misal: 7"
              required
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Keluhan yang tidak ada aktivitas selama jumlah hari yang ditentukan akan ditutup otomatis (status DONE) oleh sistem.
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 h-10 bg-[#b61722] hover:bg-red-650 text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
