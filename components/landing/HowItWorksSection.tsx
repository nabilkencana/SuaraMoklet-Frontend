"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import FoldText from "@/components/FoldText";
import SplitText from "@/components/SplitText";

const STEPS = [
  {
    num: 1,
    title: "Tulis Laporan",
    description: "Sampaikan keluhanmu beserta bukti pendukung.",
  },
  {
    num: 2,
    title: "Proses Penanganan",
    description: "Unit sekolah langsung meninjau dan menindaklanjuti.",
  },
  {
    num: 3,
    title: "Selesai & Evaluasi",
    description: "Masalah terselesaikan dan kamu dapat memberi penilaian.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionEyebrow label="Cara Kerja" icon={Sparkles} />
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

        {/* Steps */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line 1: Step 1 -> Step 2 (desktop only) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.45, ease: "easeInOut" }}
            style={{ originX: 0 }}
            className="hidden md:block absolute top-8 left-[calc(16.67%+1.25rem)] w-[calc(33.33%-2.5rem)] h-0.5 bg-linear-to-r from-red-300 via-red-400 to-red-300 z-0"
          />

          {/* Connector line 2: Step 2 -> Step 3 (desktop only) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.05, ease: "easeInOut" }}
            style={{ originX: 0 }}
            className="hidden md:block absolute top-8 left-[calc(50%+1.25rem)] w-[calc(33.33%-2.5rem)] h-0.5 bg-linear-to-r from-red-300 via-red-400 to-red-300 z-0"
          />

          {STEPS.map((step, index) => {
            const stepDelay = index === 0 ? 0.1 : index === 1 ? 0.7 : 1.3;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: stepDelay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="relative flex flex-col items-center gap-4 px-4"
              >
                {/* Circle */}
                <div className="relative z-10 h-16 w-16 rounded-full border-2 border-red-200 bg-white shadow-md shadow-red-100 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-red-600">{step.num}</span>
                  <div className="absolute inset-0 rounded-full border border-red-300 animate-ping opacity-20" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
