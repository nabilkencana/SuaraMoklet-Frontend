"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, EyeOff, FileCheck2, Database } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function PrivacyPage() {
  const privacyList = [
    {
      icon: Lock,
      iconColor: "text-red-600 bg-red-50 border-red-150",
      title: "1. Autentikasi SSO Resmi",
      desc: "Masuk otomatis melalui SSO Moklet App / Google Workspace sekolah tanpa formulir pendaftaran manual.",
    },
    {
      icon: EyeOff,
      iconColor: "text-sky-600 bg-sky-50 border-sky-150",
      title: "2. Mode 100% Anonim",
      desc: "Jika memilih opsi anonim, identitas Anda disembunyikan total dari feed publik maupun dashboard petugas unit.",
    },
    {
      icon: FileCheck2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-150",
      title: "3. Penggunaan Data",
      desc: "Data keluhan hanya digunakan untuk verifikasi, tindak lanjut perbaikan, dan evaluasi mutu layanan sekolah.",
    },
    {
      icon: Database,
      iconColor: "text-purple-600 bg-purple-50 border-purple-150",
      title: "4. Keamanan & Enkripsi",
      desc: "Seluruh data dilindungi enkripsi HTTPS dan kontrol akses ketat. Data tidak akan pernah dibagikan ke pihak luar.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16 font-sans">
      <Header />

      <main className="grow max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Content Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-650 shrink-0 shadow-3xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Kebijakan Privasi</h1>
              <p className="text-[11px] text-slate-400 font-medium">Perlindungan data dan kerahasiaan pelapor</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Platform <strong>SuaraMoklet</strong> menjamin keamanan data dan kerahasiaan informasi seluruh warga sekolah melalui standar berikut:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {privacyList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 ${item.iconColor}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="font-bold text-xs text-slate-900 tracking-tight">{item.title}</h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-8">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
