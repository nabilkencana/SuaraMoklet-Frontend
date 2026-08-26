import React, { useState, useEffect } from "react";
import { Globe, User as UserIcon, CheckCircle2, Clock, ImageIcon, Maximize2, X, FileText, ExternalLink, Download } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { isSafeMediaUrl } from "@/lib/utils";
import PdfViewer from "@/components/common/PdfViewer";

interface ComplaintContentCardProps {
  complaint: Complaint;
}

export default function ComplaintContentCard({ complaint }: ComplaintContentCardProps) {
  const [activeLightbox, setActiveLightbox] = useState<{
    url: string;
    title: string;
    type?: "image" | "pdf";
  } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightbox(null);
      }
    };
    if (activeLightbox) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeLightbox]);

  const formatFullDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "12 Okt 2026";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        {/* Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200">
            {complaint.status}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
          {complaint.title}
        </h2>

        {/* Meta details */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Unit Terkait
            </span>
            <span className="block font-bold text-slate-700">Unit {complaint.unit}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tanggal Dibuat
            </span>
            <span className="block font-bold text-slate-700">
              {formatFullDate(complaint.createdAt)}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pelapor
            </span>
            <span className="font-bold text-slate-750 flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5 text-slate-400" />
              {complaint.isAnonymous ? "Anonim" : complaint.reporter?.name || "Pelapor"}
            </span>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Deskripsi Keluhan
        </span>
        <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
          {complaint.description}
        </p>

        {complaint.expectedOutput && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Hasil yang Diharapkan
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {complaint.expectedOutput}
            </p>
          </div>
        )}
      </div>

      {/* Attachments Card (Complaint Evidence - Multiple) */}
      {(() => {
        const evidenceList =
          complaint.evidenceUrls && complaint.evidenceUrls.length > 0
            ? complaint.evidenceUrls
            : complaint.evidenceUrl
            ? [complaint.evidenceUrl]
            : [];

        if (evidenceList.length === 0) return null;

        const isPdf = (url: string) =>
          url.toLowerCase().includes(".pdf") || url.toLowerCase().endsWith(".pdf");

        return (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Lampiran Bukti Keluhan ({evidenceList.length} File)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Foto / Dokumen Terlampir
              </span>
            </div>

            {evidenceList.length === 1 ? (
              isPdf(evidenceList[0]) ? (
                <div
                  onClick={() =>
                    setActiveLightbox({
                      url: evidenceList[0],
                      title: "Dokumen Lampiran Bukti",
                      type: "pdf",
                    })
                  }
                  className="flex items-center justify-between p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 truncate">
                        Dokumen Lampiran Bukti (PDF)
                      </span>
                      <span className="block text-[10.5px] text-slate-400">
                        Klik untuk membuka dokumen di popup
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold shadow-3xs group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <span>Buka Dokumen PDF</span>
                    <Maximize2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    setActiveLightbox({
                      url: evidenceList[0],
                      title: "Lampiran Bukti Keluhan",
                      type: "image",
                    })
                  }
                  className="max-w-md h-56 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-3xs group cursor-pointer relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evidenceList[0]}
                    alt="Lampiran Bukti"
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Klik untuk Memperbesar</span>
                  </div>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {evidenceList.map((fileUrl, idx) => {
                  const isDoc = isPdf(fileUrl);
                  if (isDoc) {
                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setActiveLightbox({
                            url: fileUrl,
                            title: `Dokumen Bukti ${idx + 1}`,
                            type: "pdf",
                          })
                        }
                        className="h-44 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 p-4 flex flex-col justify-between transition-all group shadow-3xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">
                            PDF
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800 truncate">
                            Dokumen Bukti {idx + 1}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Klik untuk membuka
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 group-hover:text-rose-700 pt-1">
                          <span>Buka Dokumen PDF</span>
                          <Maximize2 className="h-3 w-3" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        setActiveLightbox({
                          url: fileUrl,
                          title: `Lampiran Bukti (${idx + 1}/${evidenceList.length})`,
                          type: "image",
                        })
                      }
                      className="h-44 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-3xs group cursor-pointer relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fileUrl}
                        alt={`Lampiran Bukti ${idx + 1}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 text-white text-[11px] font-bold pointer-events-none">
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Foto {idx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Rencana Penanganan (Jika Status OPEN) */}
      {complaint.status === "OPEN" && complaint.handlingPlan && (
        <div className="bg-amber-50/80 rounded-3xl border border-amber-200/80 p-6 shadow-xs space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Clock className="h-4 w-4 text-amber-600" />
            Rencana Penanganan Unit
          </span>
          <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-wrap pl-5.5 font-medium">
            {complaint.handlingPlan}
          </p>
        </div>
      )}

      {/* Solusi Resmi & Bukti Penyelesaian (Jika Status DONE - Multiple) */}
      {complaint.status === "DONE" &&
        (complaint.resolution ||
          complaint.resolutionImageUrl ||
          (complaint.resolutionImageUrls && complaint.resolutionImageUrls.length > 0)) && (
          <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200/80 p-6 shadow-xs space-y-4">
            {/* Header Solusi */}
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                    Solusi Resmi &amp; Tindakan Unit
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                Selesai
              </span>
            </div>

            {complaint.resolution && (
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap font-medium">
                {complaint.resolution}
              </p>
            )}

            {(() => {
              const solutionPhotos =
                complaint.resolutionImageUrls && complaint.resolutionImageUrls.length > 0
                  ? complaint.resolutionImageUrls
                  : complaint.resolutionImageUrl
                  ? [complaint.resolutionImageUrl]
                  : [];

              if (solutionPhotos.length === 0) return null;

              return (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-700" />
                      Foto Bukti Tindakan / Penyelesaian ({solutionPhotos.length} Foto)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveLightbox({
                          url: solutionPhotos[0],
                          title: "Foto Bukti Solusi Unit",
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                    >
                      <span>Lihat Foto Penuh</span>
                      <Maximize2 className="h-3 w-3" />
                    </button>
                  </div>

                  {solutionPhotos.length === 1 ? (
                    <div
                      onClick={() =>
                        setActiveLightbox({
                          url: solutionPhotos[0],
                          title: "Foto Bukti Solusi Unit",
                        })
                      }
                      className="relative w-full rounded-2xl overflow-hidden border border-emerald-200/90 bg-emerald-900/10 group cursor-pointer shadow-3xs max-h-[380px] flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={solutionPhotos[0]}
                        alt="Foto Bukti Solusi"
                        className="w-full h-auto max-h-[380px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-white text-xs font-bold pointer-events-none">
                        <Maximize2 className="h-4 w-4" />
                        <span>Klik untuk Memperbesar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {solutionPhotos.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            setActiveLightbox({
                              url: imgUrl,
                              title: `Foto Bukti Solusi (${idx + 1}/${solutionPhotos.length})`,
                            })
                          }
                          className="relative h-48 rounded-2xl overflow-hidden border border-emerald-200/90 bg-emerald-900/10 group cursor-pointer shadow-3xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Foto Bukti Solusi ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                            <Maximize2 className="h-4 w-4" />
                            <span>Foto {idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

      {/* PDF VIEWER MODAL & IMAGE LIGHTBOX POPUP MODAL */}
      {activeLightbox && (
        activeLightbox.type === "pdf" || activeLightbox.url.toLowerCase().includes(".pdf") ? (
          <PdfViewer
            url={activeLightbox.url}
            title={activeLightbox.title}
            onClose={() => setActiveLightbox(null)}
          />
        ) : (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
            onClick={() => setActiveLightbox(null)}
          >
            <div
              className="relative max-w-5xl w-full flex flex-col items-center justify-center space-y-3 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header controls */}
              <div className="w-full flex items-center justify-between px-2 text-white shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-white/90 truncate">
                    {activeLightbox.title}
                  </span>
                  <span className="text-[11px] text-white/60 font-mono shrink-0">
                    #{complaint.id?.slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveLightbox(null)}
                    className="h-8.5 w-8.5 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                    title="Tutup (Esc)"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Image container */}
              <div className="relative max-h-[80vh] w-auto max-w-full rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeLightbox.url}
                  alt={activeLightbox.title}
                  className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl select-none"
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
