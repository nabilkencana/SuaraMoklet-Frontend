"use client";

import React, { useState } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  HelpCircle,
  User,
  ShieldCheck,
  Building,
  Sliders,
  CheckCircle2,
  FileText,
  MessageCircle,
  Eye,
  EyeOff,
  Star,
  Forward,
  Clock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleTab = "user" | "unit" | "admin";

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>("user");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16">
      <Header />

      <main className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 py-10 space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panduan Penggunaan SuaraMoklet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Petunjuk praktis pengoperasian platform pengaduan & aspirasi SMK Telkom Malang sesuai dengan peran akun Anda.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 max-w-md w-full">
            <button
              onClick={() => setActiveTab("user")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "user"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <User className="h-4 w-4 text-blue-500" />
              <span>Siswa / Pelapor</span>
            </button>

            <button
              onClick={() => setActiveTab("unit")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "unit"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Building className="h-4 w-4 text-red-500" />
              <span>PIC & Staf Unit</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "admin"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Sliders className="h-4 w-4 text-purple-500" />
              <span>Superadmin</span>
            </button>
          </div>
        </div>

        {/* Tab Content 1: Siswa / Pelapor */}
        {activeTab === "user" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-5 w-5 text-blue-500" />
                <span>Panduan untuk Siswa & Pelapor</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>1. Membuat Keluhan Baru</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Klik tombol <strong>Buat Keluhan</strong> di header, isi judul, deskripsi permasalahan, unit tujuan (Sarpras, Kesiswaan, Kurikulum, dll.), dan lampiran foto jika ada.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <EyeOff className="h-4 w-4 text-slate-600" />
                    <span>2. Mode Opsi Anonim</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Jika mencentang <strong>"Kirim Secara Anonim"</strong>, identitas nama dan email Anda akan disembunyikan secara otomatis dari penelusuran publik dan petugas unit.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <MessageCircle className="h-4 w-4 text-amber-500" />
                    <span>3. Memantau Status & Diskusi</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Buka halaman <strong>Keluhan Saya</strong> untuk memantau progres status keluhan (OPEN → IN PROGRESS → CLOSED) serta saling membalas tanggapan dengan unit.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>4. Memberikan Rating Penanganan</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setelah keluhan dinyatakan selesai (<strong>CLOSED</strong>), Anda dapat memberikan penilaian 1–5 bintang beserta ulasan terhadap pelayanan unit terkait.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: PIC & Staf Unit */}
        {activeTab === "unit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building className="h-5 w-5 text-red-500" />
                <span>Panduan untuk Staf & PIC Unit</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>1. Dashboard Unit</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Masuk ke menu <strong>Kelola</strong> untuk melihat daftar aspirasi yang masuk khusus ke unit Anda. Gunakan filter status <em>"Belum Direspon"</em> untuk prioritas penanganan.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span>2. Merespon Keluhan (PIC)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sebagai PIC Unit, Anda dapat mengirim tanggapan resmi dengan label <strong>"PIC"</strong>, melampirkan foto bukti tindakan, dan mengubah status laporan ke <strong>IN_PROGRESS</strong> atau <strong>CLOSED</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Forward className="h-4 w-4 text-purple-500" />
                    <span>3. Pendelegasian (Delegasi ISO)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Unit ISO / Koordinator dapat meneruskan laporan baru (FORWARDED) ke unit teknis yang lebih spesifik disertai catatan disposisi.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <ShieldCheck className="h-4 w-4 text-slate-600" />
                    <span>4. Perlindungan Data Anonim</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sistem secara otomatis mengaburkan identitas pelapor anonim pada tampilan staf unit untuk menjamin objektivitas penanganan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Superadmin */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="h-5 w-5 text-purple-500" />
                <span>Panduan untuk Superadmin</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Building className="h-4 w-4 text-[#b61722]" />
                    <span>1. Manajemen Unit & Anggota</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Membuat unit sekolah baru, menugaskan anggota staf berdasarkan email, dan menetapkan penanggung jawab utama (PIC Utama Unit).
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Eye className="h-4 w-4 text-emerald-600" />
                    <span>2. Kontrol Visibility (Private/Public)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Mengubah status visibilitas keluhan dari <strong>PUBLIC</strong> (tampil di penelusuran umum) menjadi <strong>PRIVATE</strong> (hanya dapat diakses setelah login).
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>3. Konfigurasi Auto-Close</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Mengatur batas waktu (jumlah hari) penutupan otomatis keluhan yang pasif tanpa aktivitas melalui menu <strong>Auto-Close Config</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Sliders className="h-4 w-4 text-blue-600" />
                    <span>4. Analitik & Rata-rata Rating</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Memantau metrik performa penanganan per unit, total keluhan masuk, serta nilai kepuasan rata-rata rating warga sekolah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
            Pertanyaan Sering Diajukan (FAQ)
          </h2>

          <div className="space-y-3">
            {[
              {
                q: "Apakah laporan anonim benar-benar aman dan rahasia?",
                a: "Ya. Identitas pelapor yang memilih mode anonim disembunyikan di tingkat sistem backend dan tidak ditampilkan kepada publik maupun staf unit.",
              },
              {
                q: "Berapa lama batas waktu respon laporan?",
                a: "Setiap laporan baru idealnya direspon oleh unit terkait maksimal 2x24 jam kerja sejak diteruskan.",
              },
              {
                q: "Siapa yang dapat memberikan rating bintang?",
                a: "Rating 1–5 bintang hanya dapat diberikan oleh pelapor asli pemilik keluhan setelah status laporan diubah menjadi CLOSED.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200/80 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left font-bold text-xs text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", openFaq === idx && "rotate-180")} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
