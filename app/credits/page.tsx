"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { ArrowLeft, Globe } from "lucide-react";

interface CreditMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  bgClass?: string;
  imagePosition?: string;
  imageScale?: number;
  transformOrigin?: string;
  socials?: {
    website?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
}

function CreditCard({ item }: { item: CreditMember }) {
  const hasSocials = Object.values(item.socials || {}).some(Boolean);
  const baseScale = item.imageScale || 1;

  return (
    <div className="flex flex-col items-center group cursor-default w-full">
      {/* Portrait Image Card Wrapper — Enlarged to 4:5 with smooth lift & shadow on hover */}
      <div
        className={`w-full aspect-[4/5] relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-slate-200/80 transition-all duration-400 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:border-slate-300 ${
          item.bgClass || "bg-slate-100"
        }`}
      >
        {/* Base Scaling Wrapper for framing correction */}
        <div
          className="w-full h-full overflow-hidden"
          style={{
            transform: baseScale !== 1 ? `scale(${baseScale})` : undefined,
            transformOrigin: item.transformOrigin || "center 50%",
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            style={item.imagePosition ? { objectPosition: item.imagePosition } : { objectPosition: "center top" }}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          />
        </div>

        {/* Social Overlay on Hover */}
        {hasSocials && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
            {item.socials?.website && (
              <a
                href={item.socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-md cursor-pointer"
                aria-label="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
            {item.socials?.github && (
              <a
                href={item.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-red-650 hover:text-white transition-all shadow-md cursor-pointer"
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
            {item.socials?.linkedin && (
              <a
                href={item.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md cursor-pointer"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {item.socials?.instagram && (
              <a
                href={item.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-md cursor-pointer"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Text Block below Image (Ref Image Style) */}
      <div className="text-center mt-5 space-y-1 w-full px-1">
        <h2 className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight font-sans">
          {item.name}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
          {item.role}
        </p>
        <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xs mx-auto italic mt-1">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  const supervisorsList: CreditMember[] = [
    {
      id: "pembimbing-1",
      name: "Zainul Abidin, S.Kom",
      role: '"Project Supervisor"',
      description: "Pembimbing & Pengarah Pengembangan Sistem SuaraMoklet",
      image: "/images/pembimbing-1.png",
      bgClass: "bg-slate-100",
      imagePosition: "center 10%",
      imageScale: 1.2,
      transformOrigin: "center 10%",
    },
    {
      id: "pembimbing-2",
      name: "Zakaria, S.Pd",
      role: '"Technical Mentor"',
      description: "Pembimbing Teknis & Konsultan Arsitektur Perangkat Lunak",
      image: "/images/pembimbing-2.png",
      bgClass: "bg-slate-100",
      imagePosition: "center 15%",
    },
    {
      id: "pembimbing-3",
      name: "Whyna Agustin, S.Pd.",
      role: '"Product & Quality Advisor"',
      description: "Penasihat Mutu Produk & Kualitas Alur Pengaduan Sekolah",
      image: "/images/pembimbing-3.png",
      bgClass: "bg-slate-100",
      imagePosition: "center 12%",
    },
  ];

  const developersList: CreditMember[] = [
    {
      id: "nabil-kencana",
      name: "Nabil Kencana",
      role: '"Frontend Developer"',
      description:
        "Pengembang Utama Antarmuka, Animasi & UI Design System SuaraMoklet",
      image: "/images/nabilkencana.jpg",
      bgClass: "bg-slate-100",
      imagePosition: "center 55%",
      socials: {
        website: "https://canadev.my.id",
        github: "https://github.com/nabilkencana",
        linkedin: "https://linkedin.com/in/nabilkencana",
        instagram: "https://instagram.com/nabill.anwr",
      },
    },
    {
      id: "alfareza",
      name: "Alfareza",
      role: '"Backend Developer"',
      description:
        "Pengembang Utama Arsitektur Backend, Integrasi RESTful API & Basis Data SuaraMoklet",
      image: "/images/alfareza.jpg",
      bgClass: "bg-slate-100",
      imagePosition: "center 75%",
      socials: {
        website: "https://www.alfareza.site",
        github: "https://github.com/Alfareza-dev",
        linkedin: "https://www.linkedin.com/in/alfareza-dev",
        instagram: "https://www.instagram.com/alfareza.dev",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pt-16 font-sans">
      <Header />

      {/* Main Container */}
      <main className="grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Navigation Back Button */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-xs font-bold text-slate-800 transition-all shadow-2xs group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Centered Main Title (Ref Image Style) */}
        <div className="text-center space-y-2 pt-2">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 uppercase font-sans">
            OUR CREDITS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide uppercase">
            Tim Pengembang &amp; Guru Pembimbing Platform SuaraMoklet
          </p>
        </div>

        {/* Section 1: Guru Pembimbing (3 Columns) */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="h-px w-16 bg-slate-200" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-red-650 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
              Guru Pembimbing &amp; Pengarah
            </span>
            <div className="h-px w-16 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto">
            {supervisorsList.map((item) => (
              <CreditCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Section 2: Tim Pengembang (2 Columns Centered) */}
        <section className="space-y-8 pt-4">
          <div className="flex items-center gap-4 justify-center">
            <div className="h-px w-16 bg-slate-200" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
              Tim Pengembang Inti
            </span>
            <div className="h-px w-16 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 max-w-4xl mx-auto">
            {developersList.map((item) => (
              <CreditCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
