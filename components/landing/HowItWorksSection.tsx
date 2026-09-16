"use client";

import React from "react";
import FoldText from "@/components/FoldText";
import SplitText from "@/components/SplitText";
import HowItWorks, { Step, StepPosition } from "@/components/ui/how-it-works";

const STEPS: Step[] = [
  {
    title: "Tulis Laporan",
    description:
      "Sampaikan keluhan atau ide perbaikanmu secara jelas beserta foto bukti pendukung.",
    colorTheme: "red",
  },
  {
    title: "Proses Penanganan",
    description:
      "Unit terkait langsung memverifikasi dan menindaklanjuti keluhan secara terkoordinasi.",
    colorTheme: "blue",
  },
  {
    title: "Solusi & Evaluasi",
    description:
      "Pantau progres transparan, terima solusi resmi, dan berikan penilaian kepuasan.",
    colorTheme: "orange",
  },
];

const STEP_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[8%] lg:left-[12%]", rotate: "rotate-[5deg]" },
  {
    className: "md:absolute md:top-[120px] md:right-[8%] lg:right-[12%]",
    rotate: "-rotate-[5deg]",
  },
  {
    className: "md:absolute md:top-[450px] md:left-[8%] lg:left-[12%]",
    rotate: "rotate-[5deg]",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-t border-slate-100 overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 text-center mb-8">
        <h2 className="mt-1">
          <FoldText
            text="Bagaimana SuaraMoklet Bekerja"
            splitBy="char"
            hinge="top"
            trigger="scroll"
            duration={0.65}
            stagger={0.035}
            ease="power3.out"
            perspective={700}
            creaseShading={0.4}
            fontSize="clamp(1.5rem, 4vw, 2.25rem)"
            fontWeight={800}
            color="#0f172a"
            className="tracking-tight"
          />
        </h2>
        <SplitText
          text="Tiga langkah sederhana untuk membuat perubahan nyata di sekolahmu."
          className="mt-3 text-slate-500 text-sm max-w-md mx-auto"
          delay={25}
          duration={0.7}
          ease="power3.out"
          splitType="words"
          from={{ opacity: 0, y: 15 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-50px"
          textAlign="center"
          tag="p"
        />
      </div>

      {/* Interactive Pinned Cards with Animated Dotted Path */}
      <HowItWorks
        features={STEPS}
        stepPositions={STEP_POSITIONS}
        className="pt-4"
      />
    </section>
  );
}
