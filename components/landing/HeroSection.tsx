"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Megaphone, ArrowRight } from "lucide-react";
import BlurText from "@/components/BlurText";
import SplitText from "@/components/SplitText";

interface HeroSectionProps {
  petitionTitle: string;
  onTitleChange: (title: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function HeroSection({
  petitionTitle,
  onTitleChange,
  onSubmit,
}: HeroSectionProps) {
  const [suaramuDone, setSuaramuDone] = useState(false);

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-white"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center animate-fade-in-up">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 flex flex-col items-center gap-0">
          {/* Baris 1: "Perubahan Sekolah" */}
          <BlurText
            text="Perubahan Sekolah"
            delay={120}
            animateBy="words"
            direction="top"
            stepDuration={0.4}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 justify-center"
          />
          {/* Baris 2: "Dimulai dari" + "Suaramu." merah */}
          <span className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-0 mt-1 sm:mt-0">
            <BlurText
              text="Dimulai dari"
              delay={120}
              animateBy="words"
              direction="top"
              stepDuration={0.4}
              animationFrom={{ filter: "blur(10px)", opacity: 0, y: -50 }}
              animationTo={[
                { filter: "blur(5px)", opacity: 0.5, y: 5 },
                { filter: "blur(0px)", opacity: 1, y: 0 },
              ]}
              easing={[0.25, 0.1, 0.25, 1]}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 justify-center"
            />
            <span className="relative inline-block px-1.5 sm:px-2 py-0.5 sm:py-1">
              <BlurText
                text="Suaramu."
                delay={120}
                animateBy="words"
                direction="top"
                stepDuration={0.5}
                animationFrom={{ filter: "blur(12px)", opacity: 0, y: -40 }}
                animationTo={[
                  { filter: "blur(6px)", opacity: 0.4, y: 6 },
                  { filter: "blur(0px)", opacity: 1, y: 0 },
                ]}
                easing={[0.25, 0.1, 0.25, 1]}
                onAnimationComplete={() => setSuaramuDone(true)}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-red-600 justify-center"
              />
              {/* Hand-drawn organic circle loop wrapping around "Suaramu." */}
              <motion.svg
                className="absolute -inset-x-3.5 -inset-y-2 sm:-inset-x-6 sm:-inset-y-3.5 w-[calc(100%+1.75rem)] sm:w-[calc(100%+3rem)] h-[calc(100%+1rem)] sm:h-[calc(100%+1.75rem)] overflow-visible pointer-events-none z-10"
                viewBox="0 0 280 90"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ opacity: 0 }}
                animate={suaramuDone ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <motion.path
                  d="M 18 42 C 16 14, 85 5, 160 7 C 235 9, 272 22, 268 50 C 262 76, 175 85, 90 81 C 28 78, 5 56, 14 34 C 22 18, 75 10, 140 8"
                  stroke="#B61722"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={suaramuDone ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.svg>
            </span>
          </span>
        </h1>

        <SplitText
          text="Platform pengaduan dan aspirasi terintegrasi SMK Telkom Malang. Laporkan kendala sarana, kurikulum, hingga kesiswaan secara transparan untuk lingkungan sekolah yang lebih baik."
          className="mt-6 sm:mt-8 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          delay={30}
          duration={0.8}
          ease="power3.out"
          splitType="words"
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-50px"
          textAlign="center"
          tag="p"
        />

        {/* CTA Input */}
        <div className="mt-14 sm:mt-16 max-w-2xl mx-auto">
          <form
            onSubmit={onSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:bg-white sm:rounded-2xl sm:border-2 sm:border-slate-200 sm:shadow-lg sm:shadow-slate-100 sm:hover:border-red-300 sm:focus-within:border-red-500 sm:focus-within:shadow-red-100/50 sm:focus-within:shadow-xl sm:transition-all sm:duration-300 sm:overflow-hidden sm:p-1.5"
          >
            <div className="flex items-center gap-2.5 flex-1 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-red-500 transition-all sm:border-0 sm:rounded-none sm:px-0 sm:py-0 sm:focus-within:border-0">
              <Megaphone className="h-5 w-5 text-red-500 shrink-0 sm:ml-3" />
              <input
                type="text"
                value={petitionTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Tuliskan keluhan atau ide perbaikan di sekolahmu..."
                className="flex-1 px-2 sm:px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none py-1 sm:py-3 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto sm:shrink-0 h-12 sm:h-11 px-6 rounded-2xl sm:rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.97] text-white text-sm font-bold transition-all shadow-md shadow-red-200/60 flex items-center justify-center gap-2 cursor-pointer"
            >
              Laporkan Masalah
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
