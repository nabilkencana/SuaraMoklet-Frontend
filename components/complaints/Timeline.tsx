"use client";

import React from "react";
import { TimelineEvent, ComplaintStatus } from "@/types/complaint";
import { Clock, CheckCircle2, ShieldCheck } from "lucide-react";

interface TimelineProps {
  events?: TimelineEvent[];
  status?: ComplaintStatus;
}

export default function Timeline({ events = [], status }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs text-center flex-1 flex flex-col justify-center">
        <p className="text-xs text-slate-400 font-semibold">Belum ada perkembangan terbaru.</p>
      </div>
    );
  }

  // Derive status if not explicitly passed
  const currentStatus =
    status ||
    (events.some((e) => e.title?.toLowerCase().includes("selesai"))
      ? "DONE"
      : events.some((e) => e.title?.toLowerCase().includes("proses"))
      ? "OPEN"
      : "NEW");

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex-1 flex flex-col">
      {/* Header */}
      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3.5">
        <Clock className="h-4 w-4 text-red-600 shrink-0" />
        <span>Perkembangan Terbaru</span>
      </h3>

      {/* Timeline List */}
      <div className="relative pt-1 pb-1">
        {events.map((event, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === events.length - 1;

          return (
            <div
              key={event.id || idx}
              className="relative pl-7 pb-6 last:pb-2 text-left"
            >
              {/* Connecting line to next dot (continuous and seamless without gaps) */}
              {!isLast && (
                <div className="absolute left-[7px] top-[14px] bottom-0 w-[2px] bg-slate-200/90 z-0" />
              )}

              {/* Indicator Dot */}
              <div
                className={`absolute left-0 top-[2px] h-4 w-4 rounded-full border-2 transition-all z-10 ${
                  isFirst
                    ? "bg-[#b61722] border-[#b61722] ring-4 ring-red-100/80"
                    : "bg-white border-slate-300 ring-2 ring-white"
                }`}
              />

              {/* Event Content */}
              <div className="space-y-0.5 min-w-0">
                <span className="block text-[10.5px] font-semibold text-slate-400">
                  {new Date(event.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {new Date(event.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {event.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Status Info & Transparansi Footer (Mengisi bagian bawah agar proporsional dan tidak kosong) ── */}
      <div className="mt-auto pt-4 border-t border-slate-100/90 space-y-2.5">
        {currentStatus === "DONE" && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-emerald-900">
                Tahapan Tuntas
              </span>
              <span className="block text-[10px] text-emerald-700/90 truncate">
                Solusi resmi telah diterbitkan oleh unit
              </span>
            </div>
          </div>
        )}

        {currentStatus === "OPEN" && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-amber-900">
                Sedang Ditangani
              </span>
              <span className="block text-[10px] text-amber-700/90 truncate">
                Estimasi penanganan 1-3 hari kerja
              </span>
            </div>
          </div>
        )}

        {currentStatus === "NEW" && (
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-sky-900">
                Dalam Antrean Unit
              </span>
              <span className="block text-[10px] text-sky-700/90 truncate">
                Menunggu verifikasi dan telaah tim unit
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-medium px-1">
          <ShieldCheck className="h-3 w-3 text-slate-400 shrink-0" />
          <span>Riwayat audit transparan &amp; terverifikasi sistem SuaraMoklet</span>
        </div>
      </div>
    </div>
  );
}
