"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import TextLoop from "@/components/TextLoop";

export default function CtaBannerSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-white">
      {/* TextLoop: absolute background, pointer-events-none so card stays interactive */}
      <div className="absolute inset-0 flex items-center pointer-events-none select-none">
        <TextLoop
          text="Suaramu Penting ✦ Laporkan Masalah ✦ Bersama Membangun Moklet ✦ Transparan & Terpercaya"
          shape="wave"
          speed={80}
          direction="forward"
          separator="✦"
          curviness={90}
          fontSize={46}
          fontWeight={800}
          letterSpacing={2}
          uppercase
          color="#ffffff"
          ribbon
          ribbonColor="#B61722"
          ribbonWidth={86}
          pauseOnHover={false}
        />
      </div>

      {/* Card — sits above the wave via z-10 */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative bg-linear-to-br from-red-600 to-red-700 rounded-3xl px-8 py-14 sm:py-20 overflow-hidden shadow-2xl shadow-red-200">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/3" />

          <div className="relative z-10">
            <SectionEyebrow label="Ayo Beraksi" variant="light" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mt-1">
              Suaramu Membawa Perubahan Nyata
            </h2>
            <p className="mt-4 text-red-100 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-medium">
              Ayo laporkan kendala sarana, fasilitas, atau aspirasi belajarmu dan kawal
              penyelesaiannya bersama civitas Moklet.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/complaints/create"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white text-red-650 font-extrabold text-sm hover:bg-red-50 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Buat Laporan
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Panduan Penggunaan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
