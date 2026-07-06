"use client";

import React, { Suspense } from "react";
import SearchContent from "@/components/search/SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-10 w-44 bg-slate-200 rounded-xl animate-pulse mx-auto" />
          <p className="text-xs text-slate-400 font-semibold animate-pulse">Memuat halaman jelajah...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
