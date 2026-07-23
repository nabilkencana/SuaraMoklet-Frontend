"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search, AlertCircle } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6 py-20">
        <div className="text-center space-y-6 max-w-md mx-auto">
          {/* Badge 404 */}
          <div className="relative inline-flex items-center justify-center">
            <span className="text-8xl font-black text-red-500/10 tracking-tight select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-xs">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Maaf, halaman yang Anda cari tidak ada, sudah dipindahkan, atau alamat URL yang dimasukkan salah.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/">
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 font-bold text-xs shadow-md shadow-red-200 h-10 px-6 cursor-pointer">
                <Home className="h-4 w-4 mr-2" />
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>

            <Link href="/search">
              <Button variant="outline" className="w-full sm:w-auto font-bold text-xs h-10 px-6 cursor-pointer">
                <Search className="h-4 w-4 mr-2" />
                <span>Cari Keluhan</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
