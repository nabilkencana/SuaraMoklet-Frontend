import React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface DeleteComplaintModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteComplaintModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteComplaintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 sm:p-8 transform transition-all scale-100 opacity-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border-[6px] border-white shadow-sm ring-1 ring-red-100">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
            Konfirmasi Hapus
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
            Apakah Anda yakin ingin menghapus keluhan ini beserta semua data terkaitnya? Aksi ini
            bersifat <span className="font-bold text-slate-700">permanen</span>.
          </p>
          <div className="flex w-full gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#b61722] hover:bg-red-650 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(182,23,34,0.3)] transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
