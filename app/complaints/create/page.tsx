"use client";

import React from "react";
import ComplaintWizard from "@/components/complaints/ComplaintWizard";
import { ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function CreateComplaintPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16">
      <Header />

      {/* Back Button Bar */}
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto pt-6">
        <button
          onClick={() => router.back()}
          className="h-9 px-4 flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Main Form Container */}
      <main className="flex-grow p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-4 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Information panel */}
          <div className="lg:col-span-5 space-y-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-red-650 leading-tight">
                Mulai Keluhan untuk Perubahan Sekolah
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Setiap suara memiliki kekuatan untuk menciptakan lingkungan sekolah yang lebih baik. Gunakan platform ini untuk melaporkan masalah dengan tegas namun bertanggung jawab.
              </p>
            </div>

            {/* Informational Cards */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Keamanan &amp; Privasi</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Laporan Anda ditangani dengan kerahasiaan tinggi. Anda dapat memilih untuk tetap anonim kepada publik, sementara administrasi menindaklanjuti secara resmi.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Panduan Laporan</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Harap sertakan bukti fisik berupa foto atau dokumen yang relevan di Step 4 untuk mempermudah unit pengelola melakukan inspeksi lapangan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form Wizard */}
          <div className="lg:col-span-7">
            <ComplaintWizard />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
