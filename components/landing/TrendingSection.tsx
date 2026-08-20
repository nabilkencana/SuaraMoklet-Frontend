"use client";

import React, { useRef } from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import { ComplaintCard, ComplaintCardData } from "@/components/shared/complaint-card";

interface TrendingSectionProps {
  trendingComplaints: ComplaintCardData[];
  isLoading: boolean;
}

export default function TrendingSection({
  trendingComplaints,
  isLoading,
}: TrendingSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const maxTrendingSupports = Math.max(
    ...trendingComplaints.map((c) => c.supports),
    10
  );

  return (
    <section id="trending" className="py-16 sm:py-20 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with Eyebrow Badge & Carousel Navigation */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <SectionEyebrow label="Trending Minggu Ini" icon={TrendingUp} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trending &amp; Dukungan Terbanyak
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Laporan dengan interaksi dan dukungan suara terbanyak dari warga sekolah
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll Kiri"
              className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center justify-center shadow-3xs cursor-pointer active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll Kanan"
              className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center justify-center shadow-3xs cursor-pointer active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {isLoading ? (
            <div className="w-full py-12 flex justify-center text-slate-400 font-medium">
              Memuat data keluhan...
            </div>
          ) : trendingComplaints.length > 0 ? (
            trendingComplaints.map((complaint) => (
              <div key={complaint.id} className="w-75 sm:w-90 shrink-0 snap-start">
                <ComplaintCard data={complaint} maxSupports={maxTrendingSupports} />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center text-slate-400 font-medium">
              Belum ada keluhan publik saat ini.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
