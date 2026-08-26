"use client";

import React from "react";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pt-16">
      <Header />

      <main className="grow relative flex items-center justify-center py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Giant Typographic 404 Background Outline (Mathematically balanced font geometry) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden px-2 sm:px-4"
          aria-hidden="true"
        >
          <svg
            className="w-full max-w-7xl h-auto select-none pointer-events-none"
            viewBox="0 0 1200 460"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              stroke="#B61722"
              strokeOpacity="0.18"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              fontSize="410"
              fontWeight="900"
              letterSpacing="48"
              style={{
                fontFamily: "var(--font-plus-jakarta-sans), var(--font-sans), system-ui, sans-serif",
                paintOrder: "stroke fill",
              }}
            >
              404
            </text>
          </svg>
        </div>

        {/* Foreground Centered Content */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-5 sm:space-y-6">
          {/* Standalone Asterisk Icon */}
          <div className="flex items-center justify-center text-slate-900">
            <svg
              className="w-9 h-9 sm:w-11 sm:h-11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Page not found<span className="text-[#B61722]">.</span>
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-[15px] text-slate-500 max-w-sm sm:max-w-md mx-auto leading-relaxed font-medium">
            Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan. Silakan kembali ke beranda untuk melanjutkan.
          </p>

          {/* Action Buttons with Suara Moklet Palette */}
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#B61722] hover:bg-[#9E141D] text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 hover:shadow-red-600/35 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Home className="h-4 w-4" />
              <span>Back to homepage</span>
            </Link>

            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200/60 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Search className="h-4 w-4" />
              <span>Jelajahi Aspirasi</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
