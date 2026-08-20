import React from "react";
import { X, Loader2 } from "lucide-react";
import { UnitModel } from "@/types/complaint";

interface AddMemberModalProps {
  isOpen: boolean;
  memberIsPic: boolean;
  selectedUnitForMember: string;
  newMemberEmail: string;
  units: UnitModel[];
  allDbUsers: any[];
  isSubmitting: boolean;
  onChangeUnit: (unitId: string) => void;
  onChangeEmail: (email: string) => void;
  onChangeIsPic: (isPic: boolean) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddMemberModal({
  isOpen,
  memberIsPic,
  selectedUnitForMember,
  newMemberEmail,
  units,
  allDbUsers,
  isSubmitting,
  onChangeUnit,
  onChangeEmail,
  onChangeIsPic,
  onClose,
  onSubmit,
}: AddMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
            {memberIsPic ? "Tunjuk Penanggung Jawab (PIC)" : "Tambah Anggota Unit"}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-150 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Unit Kerja
            </label>
            <select
              value={selectedUnitForMember}
              onChange={(e) => onChangeUnit(e.target.value)}
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
              Pilih Pengguna
            </label>
            <select
              required
              value={newMemberEmail}
              onChange={(e) => onChangeEmail(e.target.value)}
              className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
            >
              <option value="">-- Pilih Pengguna --</option>
              {allDbUsers.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1.5">
            <input
              type="checkbox"
              id="modalIsPicCheck"
              checked={memberIsPic}
              onChange={(e) => onChangeIsPic(e.target.checked)}
              className="h-4 w-4 text-[#b61722] rounded border-slate-200 focus:ring-red-500"
            />
            <label
              htmlFor="modalIsPicCheck"
              className="text-xs font-bold text-slate-600 cursor-pointer select-none"
            >
              Jadikan PIC Utama
            </label>
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
              <span>{memberIsPic ? "Tunjuk PIC" : "Tambahkan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
