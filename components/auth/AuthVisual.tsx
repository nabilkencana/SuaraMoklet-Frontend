"use client";

import React from "react";
import { ShieldCheck, MessageSquare } from "lucide-react";

export default function AuthVisual() {
  return (
    <div className="relative w-full h-full min-h-90 lg:min-h-screen overflow-hidden group">
      {/* Background Video with poster fallback */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/auth-bg.jpg"
          className="w-full h-full object-cover scale-[1.02]"
        >
          <source src="/videos/DJI_0001.MP4" type="video/mp4" />
        </video>
        {/* Sleek Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/90 via-neutral-950/30 to-transparent lg:bg-linear-to-r lg:from-neutral-950/50 lg:via-transparent lg:to-transparent" />
      </div>

      {/* Content Container (Bottom on mobile/desktop) */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16 z-10">
        {/* Floating Glass Card */}
        <div className="max-w-md w-full backdrop-blur-md bg-neutral-950/40 border border-white/15 rounded-2xl p-6 md:p-8 shadow-2xl text-white transform transition-all duration-500 hover:-translate-y-1 hover:border-white/30">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-red-600/20">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-200">
              Transparansi & Tindakan
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            Sampaikan Pengaduan & Aspirasi Secara Terbuka
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed mb-4">
            SuaraMoklet menghubungkan siswa dengan pihak sekolah secara langsung. Setiap laporan dipantau secara real-time untuk memastikan penyelesaian yang tuntas.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-red-200 border-t border-white/10 pt-4">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-red-500" />
              <span>100% Terpantau</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span>Identitas Terlindungi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
