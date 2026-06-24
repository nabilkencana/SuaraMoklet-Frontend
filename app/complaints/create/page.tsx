"use client";

import React from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ComplaintWizard from "@/components/complaints/ComplaintWizard";
import { ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";

export default function CreateComplaintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Navigation */}
      <Header />

      {/* Main Form Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Information panel */}
          <div className="lg:col-span-5 space-y-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-red-600 leading-tight">
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
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Keamanan & Privasi</h4>
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

      {/* Footer Branding */}
      <Footer />
    </div>
  );
}
