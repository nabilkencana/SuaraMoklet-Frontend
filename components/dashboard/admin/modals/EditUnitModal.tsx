import React from "react";
import { X, Pencil, Loader2 } from "lucide-react";

interface EditUnitModalProps {
  isOpen: boolean;
  unitName: string;
  unitDesc: string;
  isSubmitting: boolean;
  onChangeName: (val: string) => void;
  onChangeDesc: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditUnitModal({
  isOpen,
  unitName,
  unitDesc,
  isSubmitting,
  onChangeName,
  onChangeDesc,
  onClose,
  onSubmit,
}: EditUnitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Edit Unit Kerja</h3>
              <p className="text-[11px] text-slate-400">Perbarui informasi unit</p>
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
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Nama Unit
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kesiswaan"
              value={unitName}
              onChange={(e) => onChangeName(e.target.value)}
              className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Deskripsi (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi tugas dan tanggung jawab unit..."
              value={unitDesc}
              onChange={(e) => onChangeDesc(e.target.value)}
              className="w-full p-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none"
            />
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
              disabled={isSubmitting}
              className="flex-1 h-10 bg-[#b61722] hover:bg-red-650 text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
