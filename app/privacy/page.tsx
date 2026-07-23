"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function PrivacyPage() {
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
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Kebijakan Privasi</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Terakhir diperbarui: 21 Juli 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-650 leading-relaxed">
            <p>
              SuaraMoklet berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan platform pengaduan aspirasi sekolah kami.
            </p>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">1. Informasi yang Kami Kumpulkan</h3>
              <p>
                Kami mengumpulkan informasi yang Anda berikan secara sukarela saat mendaftar akun atau mengirimkan aspirasi, termasuk nama, alamat email, nomor telepon, peran (siswa, guru, orang tua), dan bukti lampiran berupa dokumen/gambar pendukung.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">2. Mode Anonim</h3>
              <p>
                SuaraMoklet menyediakan fitur pelaporan anonim. Jika Anda memilih opsi anonim saat mengirim aspirasi, identitas Anda tidak akan ditampilkan ke publik maupun pengawas unit sekolah demi menjaga keamanan dan kerahasiaan pelapor.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">3. Penggunaan Informasi</h3>
              <p>
                Informasi Anda digunakan untuk memverifikasi laporan keluhan, meneruskan aspirasi ke unit kerja sekolah yang bertanggung jawab, mengirimkan notifikasi status pembaruan laporan, dan menyusun statistik analitik kinerja layanan sekolah secara makro.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">4. Keamanan Data</h3>
              <p>
                Kami menerapkan standar pengamanan teknis dan organisasi yang ketat untuk mencegah akses tanpa izin, kehilangan, atau penyalahgunaan data pribadi Anda. Lampiran media bukti disimpan dengan aman di server cloud terenkripsi.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
