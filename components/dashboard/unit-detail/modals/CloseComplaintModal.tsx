import React, { useRef } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Ban,
  CheckCircle2,
  ImageIcon,
  Upload,
} from "lucide-react";
import { Complaint } from "@/types/complaint";

interface CloseComplaintModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  solusiText: string;
  solusiFiles?: File[];
  solusiFileUrls?: string[];
  isUploadingFile?: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onChangeText: (text: string) => void;
  onAddFiles?: (files: File[]) => void;
  onRemoveFile?: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const DIRECT_CLOSE_TEMPLATES = [
  {
    label: "Laporan Palsu / Tidak Valid",
    text: "Laporan telah diverifikasi dan dinyatakan tidak valid atau fiktif.",
  },
  {
    label: "Laporan Duplikat",
    text: "Laporan serupa sudah pernah diajukan sebelumnya dan sedang ditangani pada tiket lain.",
  },
  {
    label: "Sudah Terselesaikan",
    text: "Kendala yang dilaporkan telah terselesaikan sebelum proses tindak lanjut dimulai.",
  },
  {
    label: "Informasi Tidak Lengkap",
    text: "Laporan ditutup karena rincian bukti atau lokasi tidak memadai untuk ditindaklanjuti.",
  },
  {
    label: "Bukan Wewenang Sekolah",
    text: "Permasalahan yang dilaporkan berada di luar wewenang dan fasilitas operasional sekolah.",
  },
];

const NORMAL_CLOSE_TEMPLATES = [
  {
    label: "Perbaikan Fasilitas Selesai",
    text: "Kerusakan fasilitas telah diperbaiki dan dipastikan berfungsi normal.",
  },
  {
    label: "Penggantian Peralatan Selesai",
    text: "Peralatan yang rusak telah diganti dengan unit baru yang siap digunakan.",
  },
  {
    label: "Koordinasi Unit Tuntas",
    text: "Telah dikoordinasikan dan diselesaikan bersama unit penanggung jawab terkait.",
  },
  {
    label: "Solusi Telah Diterapkan",
    text: "Tindakan penanganan telah selesai dilaksanakan sesuai prosedur operasional.",
  },
];

export default function CloseComplaintModal({
  isOpen,
  complaint,
  solusiText,
  solusiFiles = [],
  solusiFileUrls = [],
  isUploadingFile = false,
  isSubmitting,
  onClose,
  onChangeText,
  onAddFiles,
  onRemoveFile,
  onSubmit,
}: CloseComplaintModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const maxPhotos = 5;

  if (!isOpen) return null;

  const isDirectClose = complaint?.status === "NEW" || !complaint?.status;
  const templates = isDirectClose ? DIRECT_CLOSE_TEMPLATES : NORMAL_CLOSE_TEMPLATES;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4.5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                isDirectClose
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}
            >
              {isDirectClose ? <Ban className="h-4.5 w-4.5" /> : <CheckCircle className="h-4.5 w-4.5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                {isDirectClose ? "Tutup Keluhan Langsung" : "Selesaikan & Berikan Solusi"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isDirectClose
                  ? "Tutup laporan baru tanpa melalui proses penanganan lanjutan"
                  : "Ubah status keluhan menjadi SELESAI (DONE)"}
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
            <div
              className={`h-7 w-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 ${
                isDirectClose
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isDirectClose ? "✕" : "✓"}
            </div>
            <div className="min-w-0">
              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {isDirectClose ? "Keluhan yang Ditutup Langsung" : "Keluhan yang Diselesaikan"}
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

        {/* Warning / Guidance Banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
            isDirectClose
              ? "bg-rose-50/70 border-rose-200/70 text-rose-900"
              : "bg-amber-50/80 border-amber-200/70 text-amber-800"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 shrink-0 mt-0.5 ${
              isDirectClose ? "text-rose-500" : "text-amber-500"
            }`}
          />
          <p className="leading-relaxed text-[11px]">
            {isDirectClose
              ? "Laporan ini akan langsung ditutup (SELESAI). Tuliskan alasan penutupan (misal: laporan tidak valid, duplikat, atau telah terselesaikan sebelumnya) sebagai catatan resmi bagi pelapor."
              : "Setelah ditutup, uraian tindakan ini akan ditampilkan sebagai Solusi Resmi kepada pelapor dan pelapor dapat memberikan penilaian (rating)."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              {isDirectClose ? "Pilihan Alasan Cepat (Opsional)" : "Template Cepat Solusi (Opsional)"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => onChangeText(tpl.text)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200 text-slate-655 font-semibold text-[11px] rounded-lg transition-all cursor-pointer active:scale-95 text-left"
                >
                  + {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
              {isDirectClose
                ? "Alasan Penutupan Keluhan"
                : "Uraian Solusi / Tindakan yang Dilakukan"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder={
                isDirectClose
                  ? "Tuliskan alasan penutupan langsung (contoh: Laporan tidak valid/palsu, duplikat, kendala sudah teratasi sebelumnya, atau informasi bukti tidak lengkap)..."
                  : "Jelaskan secara detail tindakan dan perbaikan yang telah diselesaikan oleh tim unit..."
              }
              value={solusiText}
              onChange={(e) => onChangeText(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none text-slate-800 placeholder:text-slate-400 leading-relaxed font-normal"
            />
          </div>

          {/* Optional Photo Attachment (Multiple) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
                Foto Bukti Penyelesaian / Solusi (Opsional)
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {solusiFileUrls.length}/{maxPhotos} Foto
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0 && onAddFiles) {
                  onAddFiles(Array.from(e.target.files));
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />

            {solusiFileUrls.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {solusiFileUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Bukti Solusi ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[11px] font-bold text-slate-800 truncate">
                            {solusiFiles[idx]?.name || `Foto Bukti ${idx + 1}`}
                          </span>
                          <span className="block text-[9.5px] text-emerald-700 font-semibold">
                            ✓ Siap dilampirkan
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveFile?.(idx)}
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Hapus foto"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {solusiFileUrls.length < maxPhotos && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-10 rounded-xl border border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-700 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>+ Tambah Foto Solusi Lainnya ({solusiFileUrls.length}/{maxPhotos})</span>
                  </button>
                )}
              </div>
            ) : isUploadingFile ? (
              <div className="h-12 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Mengunggah foto bukti...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-500 hover:text-emerald-700 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer group"
              >
                <ImageIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span>+ Lampirkan Foto Bukti Solusi (Maks. {maxPhotos} Foto)</span>
              </button>
            )}
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
              disabled={isSubmitting || isUploadingFile || !solusiText.trim()}
              className={`flex-1 h-11 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 ${
                isDirectClose
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isDirectClose ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>
                {isSubmitting
                  ? "Menyimpan..."
                  : isDirectClose
                  ? "Tutup Keluhan Sekarang"
                  : "Tutup & Terbitkan Solusi"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
