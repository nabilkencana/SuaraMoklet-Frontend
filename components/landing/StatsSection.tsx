"use client";

import React, { useRef, useState, useEffect } from "react";

interface StatsSectionProps {
  isLoading: boolean;
  summaryStats: {
    total: number;
    resolved: number;
  };
}

export default function StatsSection({ isLoading, summaryStats }: StatsSectionProps) {
  const [statsTriggered, setStatsTriggered] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={statsRef} className="py-10 sm:py-16 bg-white border-y border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 lg:gap-10">
          {/* Metric 1: Total Keluhan */}
          <div className="flex flex-col items-start space-y-1.5 sm:space-y-2 p-4 sm:p-0 rounded-2xl bg-slate-50/60 sm:bg-transparent border border-slate-100/80 sm:border-none shadow-2xs sm:shadow-none">
            <div className="w-10 sm:w-12 h-1 bg-red-600 rounded-full mb-1.5 sm:mb-3" />
            <div
              className={`flex items-baseline gap-1 transition-all duration-700 ${
                statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {isLoading ? "0" : summaryStats.total}
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">+</span>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-slate-500 leading-relaxed max-w-55">
              Total keluhan &amp; aspirasi yang dilaporkan siswa.
            </p>
          </div>

          {/* Metric 2: Sudah Diselesaikan */}
          <div className="flex flex-col items-start space-y-1.5 sm:space-y-2 p-4 sm:p-0 rounded-2xl bg-slate-50/60 sm:bg-transparent border border-slate-100/80 sm:border-none shadow-2xs sm:shadow-none">
            <div className="w-10 sm:w-12 h-1 bg-red-600 rounded-full mb-1.5 sm:mb-3" />
            <div
              className={`flex items-baseline gap-1 transition-all duration-700 delay-100 ${
                statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {isLoading ? "0" : summaryStats.resolved}
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">+</span>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-slate-500 leading-relaxed max-w-55">
              Laporan resmi yang berhasil diselesaikan unit.
            </p>
          </div>

          {/* Metric 3: Tingkat Penyelesaian */}
          <div className="flex flex-col items-start space-y-1.5 sm:space-y-2 p-4 sm:p-0 rounded-2xl bg-slate-50/60 sm:bg-transparent border border-slate-100/80 sm:border-none shadow-2xs sm:shadow-none">
            <div className="w-10 sm:w-12 h-1 bg-red-600 rounded-full mb-1.5 sm:mb-3" />
            <div
              className={`flex items-baseline gap-1 transition-all duration-700 delay-200 ${
                statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {isLoading
                  ? "0%"
                  : `${
                      summaryStats.total > 0
                        ? Math.round((summaryStats.resolved / summaryStats.total) * 100)
                        : 0
                    }%`}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-slate-500 leading-relaxed max-w-55">
              Tingkat komitmen tindak lanjut oleh sekolah.
            </p>
          </div>


        </div>
      </div>
    </section>
  );
}
