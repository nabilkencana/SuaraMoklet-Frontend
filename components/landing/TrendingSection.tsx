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
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SectionEyebrow label="Trending Minggu Ini" icon={TrendingUp} />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
              Trending &amp; Dukungan Terbanyak
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
              Laporan dengan interaksi dan dukungan suara terbanyak dari warga sekolah
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll Kiri"
              className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center justify-center shadow-3xs cursor-pointer active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll Kanan"
              className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center justify-center shadow-3xs cursor-pointer active:scale-95"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth scroll-pl-4 sm:scroll-pl-0"
        >
          {isLoading ? (
            <div className="w-full py-12 flex justify-center text-slate-400 font-medium">
              Memuat data keluhan...
            </div>
          ) : trendingComplaints.length > 0 ? (
            trendingComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="w-[82vw] max-w-[320px] sm:w-[340px] md:w-90 shrink-0 snap-start"
              >
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
