import React from "react";
import { X, Share2, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { UNIT_META_MAP } from "../types";

interface ForwardUnitModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  forwardUnitId: string;
  forwardNote: string;
  availableUnits: any[];
  onClose: () => void;
  onSelectUnit: (id: string) => void;
  onChangeNote: (note: string) => void;
  onAppendNote: (chip: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForwardUnitModal({
  isOpen,
  complaint,
  forwardUnitId,
  forwardNote,
  availableUnits,
  onClose,
  onSelectUnit,
  onChangeNote,
  onAppendNote,
  onSubmit,
}: ForwardUnitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Teruskan Keluhan ke Unit Lain
              </h3>
              <p className="text-[11px] text-slate-400">
                Pindahkan tanggung jawab penanganan ke unit yang sesuai
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
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                Judul Keluhan
              </span>
              <span className="block font-bold text-slate-800 truncate">
                {complaint.title}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                ID Keluhan
              </span>
              <span className="inline-block px-2 py-0.5 bg-slate-200/70 text-slate-700 font-mono font-bold rounded-md text-[10px]">
                #{complaint.id.slice(0, 8)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Unit Selection Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
                Pilih Unit Kerja Tujuan <span className="text-red-500">*</span>
              </label>
              {forwardUnitId && (
                <span className="text-[10px] text-red-600 font-bold">
                  Terpilih:{" "}
                  {availableUnits.find((u) => u.id === forwardUnitId)?.name || forwardUnitId}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(availableUnits.length > 0
                ? availableUnits
                : [
                    { id: "Sarpras", name: "Sarpras", description: "Gedung, peralatan & infrastruktur" },
                    { id: "Kesiswaan", name: "Kesiswaan", description: "Kedisiplinan, OSIS & kegiatan siswa" },
                    { id: "Kurikulum", name: "Kurikulum", description: "Akademik, jadwal kelas & ujian" },
                    { id: "Hubin", name: "Hubin", description: "Hubungan industri & PKL" },
                    { id: "Tata Usaha", name: "Tata Usaha", description: "Administrasi & keuangan" },
                  ]
              ).map((unit) => {
                const meta = UNIT_META_MAP[unit.name] || {
                  icon: Building2,
                  name: unit.name,
                  description: unit.description || "Pengelolaan operasional sekolah",
                };
                const IconComp = meta.icon;
                const isSelected = forwardUnitId === unit.id;
                return (
                  <div
                    key={unit.id}
                    onClick={() => onSelectUnit(unit.id)}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative select-none",
                      isSelected
                        ? "border-2 border-red-600 bg-red-50/40 shadow-xs"
                        : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        isSelected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0 pr-4">
                      <span
                        className={cn(
                          "block text-xs font-bold leading-tight",
                          isSelected ? "text-red-950" : "text-slate-800"
                        )}
                      >
                        {meta.name}
                      </span>
                      <span className="block text-[10px] text-slate-400 leading-snug line-clamp-2">
                        {meta.description}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-3xs">
                        <Check className="h-2.5 w-2.5 stroke-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Reasons */}
          <div className="space-y-2">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              Alasan Pendelegasian (Pilih Cepat)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Salah Alokasi Unit",
                "Membutuhkan Penanganan Khusus",
                "Eskalasi Lanjutan",
                "Koordinasi Lintas Unit",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onAppendNote(chip)}
                  className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200/80 hover:border-red-200 text-slate-600 font-semibold text-[11px] rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              Catatan / Instruksi Pendelegasian (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Berikan instruksi tambahan atau alasan pendelegasian untuk unit penerima..."
              value={forwardNote}
              onChange={(e) => onChangeNote(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none text-slate-800 placeholder:text-slate-350 leading-relaxed font-normal"
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
              disabled={!forwardUnitId}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Teruskan Keluhan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
