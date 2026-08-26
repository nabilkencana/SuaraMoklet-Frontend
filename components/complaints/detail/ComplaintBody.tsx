import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  HelpCircle,
  ImageIcon,
  Building2,
  EyeOff,
  Clock,
  CheckCircle2,
  X,
  Maximize2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Complaint } from "@/types/complaint";
import CommentSection from "@/components/comments/CommentSection";

interface ComplaintBodyProps {
  complaint: Complaint;
  isDisliked: boolean;
  isOwner: boolean;
  showDiscussion: boolean;
  onRestoreDisliked: () => void;
}

export default function ComplaintBody({
  complaint,
  isDisliked,
  isOwner,
  showDiscussion,
  onRestoreDisliked,
}: ComplaintBodyProps) {
  const [activeLightbox, setActiveLightbox] = useState<{
    url: string;
    title: string;
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

  if (isDisliked) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs text-center space-y-4 py-12">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-450">
          <EyeOff className="h-6 w-6 text-slate-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800">Aspirasi Ini Disembunyikan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Anda memberikan dislike pada aspirasi ini. Isinya disembunyikan agar kenyamanan
            penelusuran Anda tetap terjaga.
          </p>
        </div>
        <button
          onClick={onRestoreDisliked}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl mx-auto block cursor-pointer transition-colors"
        >
          Tampilkan Kembali Aspirasi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* ── CARD UTAMA: Permasalahan, Bukti & Status Tindak Lanjut Terpadu ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 flex-1 flex flex-col">
        {/* Header Permasalahan */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Permasalahan &amp; Detail Kendala
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-600">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Unit {complaint.unit}</span>
          </div>
        </div>

        {/* Isi Deskripsi Permasalahan */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
            {complaint.description || (
              <span className="text-slate-400 italic">Deskripsi permasalahan belum tersedia.</span>
            )}
          </p>

          {/* Yang Diharapkan (Jika Ada) */}
          {complaint.expectedOutput && (
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5 mt-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-red-500" />
                Hasil yang Diharapkan
              </span>
              <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap pl-5">
                {complaint.expectedOutput}
              </p>
            </div>
          )}
        </div>

        {/* ── Lampiran Bukti Keluhan (Foto / Dokumen PDF) ── */}
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
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-red-500" />
                  Lampiran Bukti Keluhan ({evidenceList.length} File)
                </span>
                <span className="text-[10.5px] text-slate-400 font-medium">
                  Foto / Dokumen Terlampir
                </span>
              </div>

              {evidenceList.length === 1 ? (
                isPdf(evidenceList[0]) ? (
                  <a
                    href={evidenceList[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 transition-all group"
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
                          Klik untuk melihat atau mengunduh dokumen
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold shadow-3xs group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <span>Buka Dokumen PDF</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </a>
                ) : (
                  <div
                    onClick={() =>
                      setActiveLightbox({
                        url: evidenceList[0],
                        title: "Foto Bukti Keluhan",
                      })
                    }
                    className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900/5 group max-h-[380px] cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evidenceList[0]}
                      alt="Foto Bukti Keluhan"
                      className="w-full h-auto max-h-[380px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-white text-xs font-bold pointer-events-none">
                      <Maximize2 className="h-4 w-4" />
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
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-48 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 p-4 flex flex-col justify-between transition-all group shadow-3xs"
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
                              Dokumen Terlampir
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 group-hover:text-rose-700 pt-1">
                            <span>Buka Dokumen PDF</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </a>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setActiveLightbox({
                            url: fileUrl,
                            title: `Foto Bukti Keluhan (${idx + 1}/${evidenceList.length})`,
                          })
                        }
                        className="relative h-48 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900/5 group cursor-pointer shadow-3xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileUrl}
                          alt={`Bukti ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                          <Maximize2 className="h-4 w-4" />
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

        {/* ── Rencana Penanganan (Jika Status OPEN) ── */}
        {complaint.status === "OPEN" && complaint.handlingPlan && (
          <div className="border-t border-slate-100 pt-4">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Clock className="h-4 w-4 text-amber-600" />
                Rencana Penanganan (Sedang Diproses)
              </span>
              <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap pl-5.5">
                {complaint.handlingPlan}
              </p>
            </div>
          </div>
        )}

        {/* ── Solusi Resmi (Jika Status DONE) ── */}
        {complaint.status === "DONE" &&
          (complaint.resolution ||
            complaint.resolutionImageUrl ||
            (complaint.resolutionImageUrls && complaint.resolutionImageUrls.length > 0)) && (
            <div className="border-t border-slate-100 pt-4">
              <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs space-y-4">
                {/* Header Solusi */}
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                        Solusi Resmi Sekolah (Terselesaikan)
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                    Selesai
                  </span>
                </div>

                {/* Uraian Tindakan */}
                {complaint.resolution && (
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap font-medium">
                    {complaint.resolution}
                  </p>
                )}

                {/* Foto Bukti Penyelesaian / Solusi */}
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
                              title: "Foto Bukti Penyelesaian / Solusi",
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
                              title: "Foto Bukti Penyelesaian / Solusi",
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
                                alt={`Bukti Solusi ${idx + 1}`}
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
            </div>
          )}
      </div>

      {/* Discussion Section */}
      {showDiscussion && (
        <div className="space-y-4">
          {/* Banner: waiting for response (only for NEW status) */}
          {isOwner && complaint.status === "NEW" && (
            <div className="flex items-start gap-3.5 bg-blue-50 border border-blue-200 rounded-3xl p-4.5">
              <div className="h-9 w-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-blue-900">Laporan Anda Telah Diterima 🎉</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Tim unit terkait sedang menelaah laporan Anda. Tanggapan dan rencana tindak lanjut resmi akan diberikan dalam kurun waktu <span className="font-bold">1 hingga 3 hari kerja</span>. Anda akan mendapatkan notifikasi otomatis saat status diperbarui.
                </p>
                <p className="text-[11px] text-blue-600 font-medium pt-0.5">
                  💬 Anda juga dapat menambahkan informasi atau bukti pendukung tambahan melalui kolom diskusi di bawah.
                </p>
              </div>
            </div>
          )}

          <CommentSection
            complaintId={complaint.id}
            isClosed={complaint.status === "DONE"}
            isOwner={isOwner}
            isAnonymousComplaint={complaint.isAnonymous}
            complaintAuthorId={complaint.reporter?.id}
          />
        </div>
      )}

      {/* ── IMAGE LIGHTBOX POPUP MODAL (REUSABLE FOR EVIDENCE & SOLUTION) ── */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls */}
            <div className="w-full flex items-center justify-between px-2 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/90">{activeLightbox.title}</span>
                <span className="text-[11px] text-white/60 font-mono">
                  #{complaint.id?.slice(0, 8)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
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
      )}
    </div>
  );
}
