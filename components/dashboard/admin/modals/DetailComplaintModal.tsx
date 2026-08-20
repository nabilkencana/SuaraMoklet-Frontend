import React from "react";
import { X, Loader2, Forward } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailComplaintModalProps {
  isOpen: boolean;
  isLoading: boolean;
  data: any | null;
  onClose: () => void;
}

export default function DetailComplaintModal({
  isOpen,
  isLoading,
  data,
  onClose,
}: DetailComplaintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Detail Informasi Komprehensif
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#b61722]" />
              <p className="text-sm font-medium text-slate-500">
                Memuat data komprehensif...
              </p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Dibuat Pada
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {new Date(data.complaint.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Dibuat Oleh
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {data.complaint.author?.name || "Anonim"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Ditujukan Ke
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {data.complaint.unit?.name || "Umum"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Waktu Respon (Pertama)
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {data.hasResponded
                      ? `${Math.floor(data.responseTimeMs / 3600000)} Jam ${Math.floor(
                          (data.responseTimeMs % 3600000) / 60000
                        )} Menit`
                      : "Belum Direspon"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Rating Penyelesaian
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {data.complaint.rating
                      ? `${data.complaint.rating.score} ★`
                      : "Belum Ada Rating"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Prioritas (SLA)
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      data.otherInfo.prioritySLA.includes("Tinggi")
                        ? "text-red-600"
                        : "text-slate-700"
                    )}
                  >
                    {data.otherInfo.prioritySLA}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Media Bukti
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {data.otherInfo.hasAttachments ? "Ada Lampiran" : "Tidak Ada"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Update Terakhir
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {new Date(data.otherInfo.lastUpdatedAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Histori Forward ({data.forwardCount} kali)
                </h3>
                {data.forwardCount > 0 ? (
                  <div className="space-y-3">
                    {data.forwardHistory.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100"
                      >
                        <Forward className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-700">
                            Diteruskan pada{" "}
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            Catatan: {log.meta?.note || "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Belum pernah diteruskan.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
