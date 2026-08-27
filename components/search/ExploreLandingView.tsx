"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Sparkles,
  Compass,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { getCategoryBadgeClass, getStatusBadgeConfig } from "@/components/shared/complaint-card";

interface ExploreLandingViewProps {
  searchVal: string;
  topicParam: string;
  statusParam: string;
  sortParam: string;
  isLoading: boolean;
  complaints: (Complaint & { category?: string; location?: string })[];
  categories?: { id: string; name: string; icon?: string }[];
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onTopicSelect: (topic: string) => void;
  onQuickAction?: (status?: string, sort?: string) => void;
}

const DEFAULT_UNITS = [
  "Semua Unit",
  "Sarpras",
  "Kesiswaan",
  "Kurikulum",
  "Hubin & Industri",
  "Kebersihan",
  "Keamanan",
  "Tata Usaha",
  "Umum",
];

const STATUS_FILTERS = [
  { value: "ALL", label: "Semua Status" },
  { value: "NEW", label: "Baru (New)" },
  { value: "OPEN", label: "Diproses (Open)" },
  { value: "DONE", label: "Selesai (Done)" },
];

const SORT_OPTIONS = [
  { value: "POPULAR", label: "Popularitas" },
  { value: "NEWEST", label: "Terbaru" },
];

export default function ExploreLandingView({
  searchVal,
  topicParam,
  statusParam,
  sortParam,
  isLoading,
  complaints,
  categories = [],
  onSearchChange,
  onSearchSubmit,
  onTopicSelect,
  onQuickAction,
}: ExploreLandingViewProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Combine default units with categories from backend
  const allUnitNames = Array.from(
    new Set([
      "Semua Unit",
      ...DEFAULT_UNITS.filter((u) => u !== "Semua Unit"),
      ...categories.map((c) => c.name),
    ])
  );

  const isFiltered =
    searchVal.trim() !== "" ||
    (topicParam !== "Semua Topik" && topicParam !== "Semua Unit") ||
    statusParam !== "ALL";

  const handleResetFilters = () => {
    onSearchChange("");
    onTopicSelect("Semua Unit");
    onQuickAction?.("ALL", "POPULAR");
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortParam)?.label || "Popularitas";

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFB]">
      {/* =========================================================================
          1. HERO HEADER (Vibrant Bright Moklet Red with Ambient Soundwave Lines & Animations)
      ========================================================================= */}
      <section className="relative bg-linear-to-b from-[#eb2d3b] via-[#d61e2b] to-[#b81622] text-white pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden select-none">
        {/* Animated Vector Soundwave Ambient Background Lines */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-20 overflow-hidden"
          animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-full h-full object-cover min-w-[900px]"
            viewBox="0 0 1440 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M-50 180 C 180 80, 320 280, 540 140 C 760 0, 940 310, 1160 160 C 1380 10, 1500 240, 1600 120"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              fill="none"
            />
            <path
              d="M-50 240 C 220 320, 420 110, 680 260 C 940 410, 1120 70, 1340 220 C 1480 320, 1560 180, 1600 260"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M-50 90 C 140 20, 360 190, 600 80 C 840 -30, 1080 240, 1280 90 C 1420 -10, 1520 140, 1600 70"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              fill="none"
            />
          </svg>
        </motion.div>

        {/* Ambient Subtle Gradients */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        {/* Centered Hero Titles with Staggered Entrance Animations */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3 sm:space-y-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md text-red-100 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pusat Integrasi Aspirasi</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white"
          >
            Jelajahi &amp; Cari Aspirasi Sekolah
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs sm:text-base text-red-100/90 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Temukan seluruh laporan, kebutuhan fasilitas, dan usulan ide siswa untuk perubahan
            nyata di SMK Telkom Malang secara transparan.
          </motion.p>

          {/* Floating Search Bar with Pop Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-2xl mx-auto pt-4 sm:pt-6"
          >
            <form
              onSubmit={onSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-red-950/30 border border-white/80 transition-all focus-within:ring-4 focus-within:ring-red-300/40"
            >
              <div className="pl-3 sm:pl-4 text-slate-400 shrink-0">
                <Search className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-slate-400" />
              </div>

              <input
                type="text"
                placeholder="Cari keluhan, fasilitas, kategori, atau nomor tiket..."
                value={searchVal}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 px-3 sm:px-4 text-xs sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
              />

              <AnimatePresence>
                {searchVal && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => onSearchChange("")}
                    aria-label="Hapus pencarian"
                    className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 mr-1 cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-red-500/25 flex items-center justify-center shrink-0 cursor-pointer"
              >
                Cari
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CONTENT (2-Column Layout: Left Sidebar + Right Results Grid)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-1">
        {/* Mobile Filter Toggle Button & Stats Bar */}
        <div className="lg:hidden mb-6 flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Hasil Ditemukan
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {complaints.length} Laporan
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter Unit &amp; Status</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ---------------------------------------------------------------------
              LEFT SIDEBAR: Categories & Status Filter Checkboxes (Sticky on Scroll)
          --------------------------------------------------------------------- */}
          <aside
            className={cn(
              "w-full lg:w-64 shrink-0 space-y-6 bg-white lg:bg-transparent p-5 lg:p-0 rounded-3xl lg:rounded-none border lg:border-0 border-slate-200/80 shadow-xs lg:shadow-none lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-none transition-all",
              mobileFilterOpen ? "block animate-fade-in" : "hidden lg:block"
            )}
          >
            {/* Group 1: Categories / Unit Sekolah */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Kategori Unit
                </h3>
                {topicParam !== "Semua Topik" && topicParam !== "Semua Unit" && (
                  <button
                    onClick={() => onTopicSelect("Semua Unit")}
                    className="text-[11px] font-bold text-red-650 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {allUnitNames.map((unit) => {
                  const isActive =
                    (unit === "Semua Unit" &&
                      (topicParam === "Semua Topik" || topicParam === "Semua Unit")) ||
                    topicParam === unit;

                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        onTopicSelect(unit === "Semua Unit" ? "Semua Topik" : unit);
                        setMobileFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]",
                        isActive
                          ? "bg-red-50 text-red-650 font-extrabold shadow-2xs border border-red-100"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      )}
                    >
                      <span className="truncate">{unit}</span>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-red-650 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/80" />

            {/* Group 2: Status Filter (Checkboxes Style) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Status Laporan
              </h3>

              <div className="space-y-2">
                {STATUS_FILTERS.map((s) => {
                  const isChecked = statusParam === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        onQuickAction?.(s.value, sortParam);
                        setMobileFilterOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer group select-none transition-colors active:scale-[0.98]"
                    >
                      <div
                        className={cn(
                          "h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all shrink-0",
                          isChecked
                            ? "bg-red-600 border-red-600 text-white shadow-2xs scale-105"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        )}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className={cn(isChecked ? "font-bold text-slate-900" : "text-slate-600")}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset All Filters Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full h-10 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-650 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </aside>

          {/* ---------------------------------------------------------------------
              RIGHT CONTENT AREA: Live Counter, Sort Dropdown & Animated Cards Grid
          --------------------------------------------------------------------- */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* Header Result Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div className="flex items-baseline gap-2 min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {topicParam === "Semua Topik" || topicParam === "Semua Unit"
                    ? "Semua Aspirasi"
                    : `Aspirasi ${topicParam}`}
                </h2>
                <span className="text-xs sm:text-sm font-bold text-slate-400 shrink-0">
                  {complaints.length} Laporan
                </span>
              </div>

              {/* Sort by Dropdown with Spring Menu Animation */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="h-9 px-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <span className="text-slate-400 font-medium">Urutkan:</span>
                  <span className="text-slate-800">{currentSortLabel}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                      sortDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setSortDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 z-30 space-y-1 origin-top-right"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              onQuickAction?.(statusParam, opt.value);
                              setSortDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer",
                              sortParam === opt.value
                                ? "bg-red-50 text-red-650 font-extrabold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            <span>{opt.label}</span>
                            {sortParam === opt.value && <Check className="h-3.5 w-3.5 text-red-650" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 py-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs animate-pulse space-y-4"
                  >
                    <div className="aspect-16/10 w-full bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-8 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-2xs"
              >
                <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                  <Compass className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900">
                    Tidak ada laporan yang cocok
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Tidak ditemukan aspirasi atau keluhan dengan filter saat ini. Coba gunakan kata
                    kunci lain atau reset filter pencarian.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Reset Filter
                  </button>
                  <Link
                    href="/complaints/create"
                    className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Buat Laporan Baru</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {complaints.map((item, idx) => {
                  const statusConfig = getStatusBadgeConfig(item.status);
                  const categoryClasses = getCategoryBadgeClass(item.category || "Umum");

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.35,
                        delay: Math.min(idx * 0.04, 0.4),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={`/complaints/${item.id}`}
                        className="group bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative cursor-pointer h-full"
                      >
                        <div>
                          {/* Top: Image Thumbnail / Placeholder */}
                          <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-slate-100 mb-3.5 border border-slate-100 shrink-0">
                            {item.evidenceUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.evidenceUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-tr from-red-50 to-slate-100 flex items-center justify-center">
                                <span className="text-3xl font-black text-red-200 select-none">SM</span>
                              </div>
                            )}

                            {/* Overlay Badges */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-2xs truncate max-w-28",
                                  categoryClasses
                                )}
                              >
                                {item.category || item.unit || "Umum"}
                              </span>

                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md shadow-2xs shrink-0",
                                  statusConfig.classes
                                )}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1.5">
                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-red-650 transition-colors">
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Card Bottom Footer: Likes Support & Action Arrow (CoinTracker Card Style) */}
                        <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{(item.supports || 0).toLocaleString("id-ID")} Suka</span>
                          </div>

                          <div className="h-7 w-7 rounded-lg bg-slate-50 group-hover:bg-red-50 group-hover:text-red-600 flex items-center justify-center text-slate-400 transition-all shrink-0">
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
