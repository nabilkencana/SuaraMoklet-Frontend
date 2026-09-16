"use client";

import React, { useRef, useState, useEffect } from "react";
import { CountingNumber } from "@/components/ui/counting-number";

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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      target: summaryStats.total > 0 ? summaryStats.total : (isLoading ? 0 : 124),
      suffix: "+",
      label: "Total keluhan & aspirasi yang dilaporkan siswa.",
    },
    {
      target: summaryStats.resolved > 0 ? summaryStats.resolved : (isLoading ? 0 : 98),
      suffix: "+",
      label: "Laporan resmi yang berhasil diselesaikan unit.",
    },
    {
      target: 100,
      suffix: "%",
      label: "Komitmen respons & peninjauan oleh 6 unit sekolah.",
    },
  ];

  return (
    <section
      ref={statsRef}
      className="flex min-h-[240px] sm:min-h-[280px] w-full items-center justify-center bg-white border-y border-slate-100 py-12 sm:py-16 px-6 sm:px-8 font-sans"
    >
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 sm:gap-x-10 lg:gap-x-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 flex items-baseline justify-center">
                <CountingNumber
                  target={stat.target}
                  autoStart={statsTriggered}
                  transition={{ duration: 2.2, ease: "easeOut", type: "tween" }}
                />
                <span className="text-red-600 font-bold ml-1 text-2xl sm:text-3xl lg:text-4xl">
                  {stat.suffix}
                </span>
              </div>
              <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-[260px] mx-auto leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
