"use client";

import React, { useState } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  HelpCircle,
  User,
  ShieldCheck,
  Building2,
  Sliders,
  CheckCircle2,
  FileText,
  MessageCircle,
  EyeOff,
  Star,
  Share2,
  ChevronDown,
  Layers,
  Sparkles,
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
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16 font-sans">
      <Header />

      <main className="grow max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 py-10 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Pusat Bantuan &amp; Panduan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Panduan lengkap alur pengaduan, tindak lanjut, dan tata kelola aspirasi di SMK Telkom Malang.
          </p>
        </div>

        {/* Role Switcher Tabs (Accessible for everyone) */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 max-w-md w-full">
            <button
              onClick={() => setActiveTab("user")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "user"
                  ? "bg-white text-red-650 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <User className="h-4 w-4" />
              <span>Siswa &amp; Pelapor</span>
            </button>

            <button
              onClick={() => setActiveTab("unit")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "unit"
                  ? "bg-white text-red-650 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>Petugas Unit</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "admin"
                  ? "bg-white text-red-650 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Sliders className="h-4 w-4" />
              <span>Admin &amp; ISO</span>
            </button>
          </div>
        </div>

        {/* Tab Content 1: Siswa / Pelapor */}
        {activeTab === "user" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Panduan untuk Siswa &amp; Warga Sekolah
                  </h2>
                  <p className="text-xs text-slate-400">Langkah mudah menyampaikan aspirasi dan mengawal solusi.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>1. Masuk &amp; Buat Laporan</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Masuk menggunakan SSO Moklet App / Google Workspace sekolah. Klik tombol <strong>&quot;Buat Laporan&quot;</strong>, pilih unit tujuan yang sesuai (Sarpras, Kurikulum, Kesiswaan, Hubin, TU, atau ISO), lalu jelaskan kendala dengan jelas.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <EyeOff className="h-4 w-4 text-sky-600" />
                    <span>2. Opsi 100% Anonim</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Centang opsi <strong>&quot;Kirim Sebagai Anonim&quot;</strong> pada langkah akhir jika ingin merahasiakan identitasmu. Nama dan profilmu tidak akan ditampilkan kepada publik maupun petugas unit penanganan.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <MessageCircle className="h-4 w-4 text-amber-600" />
                    <span>3. Pantau Status &amp; Berdiskusi</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Buka menu <strong>&quot;Keluhan Saya&quot;</strong> untuk melihat linimasa progres (<strong>BARU</strong> → <strong>DIPROSES</strong> → <strong>SELESAI</strong>). Kamu bisa memberikan informasi tambahan melalui kolom diskusi tanggapan resmi.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Star className="h-4 w-4 text-emerald-600" />
                    <span>4. Solusi Resmi &amp; Beri Rating</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ketika status laporan telah <strong>SELESAI</strong>, kamu dapat membaca uraian solusi yang telah diterapkan sekolah dan memberikan penilaian 1–5 bintang beserta ulasan kepuasanmu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Petugas Unit */}
        {activeTab === "unit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Panduan untuk Petugas &amp; Tim Unit Kerja
                  </h2>
                  <p className="text-xs text-slate-400">Standar operasional penanganan keluhan dan tindak lanjut lapangan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    <span>1. Menerima &amp; Memverifikasi Laporan</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Keluhan baru yang ditujukan ke unit Anda akan berstatus <strong>BARU</strong> di dashboard. Periksa detail masalah, lampiran foto, serta lokasi kejadian sebelum memulai tindak lanjut.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <MessageCircle className="h-4 w-4 text-amber-600" />
                    <span>2. Mulai Proses &amp; Tulis Rencana</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Klik <strong>&quot;Mulai Proses Laporan&quot;</strong> untuk mengubah status ke <strong>DIPROSES</strong>. Tuliskan <em>Rencana Penanganan (Handling Plan)</em> secara transparan agar pelapor mengetahui langkah yang sedang dikerjakan.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Share2 className="h-4 w-4 text-indigo-600" />
                    <span>3. Kolaborasi &amp; Teruskan Laporan</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gunakan fitur <strong>Kolaborasi</strong> jika membutuhkan dukungan unit lain, atau tombol <strong>Teruskan (Forward)</strong> jika keluhan keliru ditujukan dan perlu dialihkan ke unit yang tepat.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>4. Selesaikan dengan Solusi Resmi</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setelah pekerjaan fisik/tindakan tuntas, klik <strong>&quot;Selesaikan &amp; Beri Solusi&quot;</strong> (status <strong>SELESAI</strong>) dan tuliskan penjelasan solusi konkret yang telah diselesaikan tim unit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Admin & ISO */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Panduan untuk Superadmin &amp; Koordinator ISO
                  </h2>
                  <p className="text-xs text-slate-400">Pengawasan makro, manajemen data anggota, dan pendelegasian tata kelola.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Layers className="h-4 w-4 text-red-600" />
                    <span>1. Manajemen Unit &amp; Anggota</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kelola daftar 6 unit sekolah resmi (Sarpras, Kurikulum, Kesiswaan, Hubin, TU, ISO) serta tugaskan staf/guru sebagai PIC Unit melalui menu <strong>Manajemen Pengguna</strong>.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Share2 className="h-4 w-4 text-indigo-600" />
                    <span>2. Pendelegasian Laporan ISO</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Koordinator ISO menerima keluhan umum yang membutuhkan disposisi ke unit teknis. Gunakan fitur *Forward* untuk meneruskan tiket ke unit yang bertanggung jawab.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>3. Kontrol Visibilitas &amp; Privasi</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Superadmin dapat mengubah visibilitas laporan dari <strong>Publik</strong> ke <strong>Privat</strong> apabila mengandung data sensitif atau membutuhkan penanganan internal khusus.
                  </p>
                </div>

                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>4. Pemantauan Log Audit &amp; Rating</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pantau jejak aktivitas sistem di menu <strong>Log Sistem</strong> dan evaluasi tingkat kepuasan warga sekolah secara transparan melalui ringkasan rating performa per unit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs text-slate-400">Jawaban praktis seputar penggunaan sistem SuaraMoklet.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Bagaimana cara login jika saya belum memiliki akun?",
                a: "SuaraMoklet menggunakan sistem Single Sign-On (SSO). Anda tidak perlu mendaftar akun baru, cukup klik tombol Masuk dan gunakan Akun Google resmi SMK Telkom Malang (@smktelkom-mlg.sch.id) atau login lewat Moklet App.",
              },
              {
                q: "Apakah laporan dengan mode anonim benar-benar tidak bisa dilihat identitasnya?",
                a: "Benar 100%. Saat Anda memilih mode anonim, sistem memutus relasi identitas pada data publik maupun dashboard petugas unit. Nama Anda tidak akan muncul pada feed publik, detail laporan, maupun notifikasi unit.",
              },
              {
                q: "Berapa lama estimasi waktu penanganan laporan?",
                a: "Laporan yang masuk akan ditinjau oleh unit terkait dalam kurun waktu 1 hingga 3 hari kerja. Progres dan rencana penanganan dapat dipantau langsung lewat linimasa tiket keluhan Anda.",
              },
              {
                q: "Siapa saja yang dapat memberikan rating dan ulasan?",
                a: "Penilaian rating (1–5 bintang) dan ulasan hanya dapat diberikan oleh pelapor asli yang mengajukan keluhan setelah laporan tersebut dinyatakan selesai (status SELESAI) oleh unit terkait.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4.5 text-left font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
                      openFaq === idx && "rotate-180 text-red-650"
                    )}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
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
