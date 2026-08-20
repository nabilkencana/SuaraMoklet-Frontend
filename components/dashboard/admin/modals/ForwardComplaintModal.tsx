import React from "react";
import { X } from "lucide-react";
import { Complaint, UnitModel } from "@/types/complaint";

interface ForwardComplaintModalProps {
  complaint: Complaint | null;
  units: UnitModel[];
  forwardUnitId: string;
  forwardNote: string;
  onSelectUnit: (unitId: string) => void;
  onChangeNote: (note: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForwardComplaintModal({
  complaint,
  units,
  forwardUnitId,
  forwardNote,
  onSelectUnit,
  onChangeNote,
  onClose,
  onSubmit,
}: ForwardComplaintModalProps) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
            Delegasikan Keluhan
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-150 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150 font-medium">
          Judul: <strong>{complaint.title}</strong>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Pilih Unit Penerima
            </label>
            <select
              value={forwardUnitId}
              onChange={(e) => onSelectUnit(e.target.value)}
              className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Catatan Tambahan (Instruksi)
            </label>
            <textarea
              rows={3}
              placeholder="Tulis instruksi pengerjaan..."
              value={forwardNote}
              onChange={(e) => onChangeNote(e.target.value)}
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
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Kirim Delegasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
