"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 mt-4">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Content Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Syarat dan Ketentuan</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Terakhir diperbarui: 21 Juli 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-650 leading-relaxed">
            <p>
              Selamat datang di SuaraMoklet. Dengan menggunakan platform kami, Anda setuju untuk mematuhi dan terikat oleh syarat dan ketentuan penggunaan berikut ini.
            </p>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">1. Penggunaan Platform</h3>
              <p>
                Platform ini ditujukan bagi warga SMK Telkom Malang ("Moklet") untuk mengirimkan aspirasi, masukan, dan laporan keluhan secara objektif, sopan, dan bertanggung jawab demi perbaikan sarana dan sistem operasional sekolah.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">2. Etika Pelaporan</h3>
              <p>
                Pengguna dilarang mengirimkan konten yang mengandung unsur SARA, ujaran kebencian, fitnah, pelecehan pribadi, informasi palsu (hoax), atau mempromosikan materi ilegal. Pelanggaran etika akan dikenakan sanksi tata tertib sekolah.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">3. Verifikasi Keluhan</h3>
              <p>
                Setiap keluhan yang diajukan akan melalui peninjauan administratif oleh admin Super PIC dan admin internal ISO sekolah sebelum diteruskan ke unit kerja terkait untuk ditindaklanjuti. Laporan yang tidak relevan dapat ditolak atau ditutup.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">4. Perubahan Layanan</h3>
              <p>
                Pihak sekolah berhak melakukan modifikasi, pembaruan fitur, atau pembatasan akses sementara pada platform SuaraMoklet kapan saja untuk keperluan perawatan sistem atau penyempurnaan prosedur pelayanan internal.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
