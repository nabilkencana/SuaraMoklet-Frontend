"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  Megaphone,
  Search,
  TrendingUp,
  Shield,
  ArrowRight,
  Heart,
  ChevronRight,
  ChevronLeft,
  FileText,
  Users,
  CheckCircle,
  Star,
  Menu,
  X,
  Sparkles,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { ComplaintCard, ComplaintCardData, LatestComplaintListItem } from "@/components/shared/complaint-card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store/auth.store";
import { useRouter } from "next/navigation";
import BlurText from "@/components/BlurText";
import SplitText from "@/components/SplitText";
import TextLoop from "@/components/TextLoop";
import FoldText from "@/components/FoldText";
import { toast } from "sonner";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { apiClient } from "@/lib/api";

function SectionEyebrow({
  label,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "light";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-3",
        variant === "light"
          ? "bg-white/15 text-white border border-white/20 backdrop-blur-xs"
          : "bg-red-50 text-red-650 border border-red-100"
      )}
    >
      {Icon && <Icon className={cn("h-3.5 w-3.5", variant === "light" ? "text-white" : "text-red-600")} />}
      <span>{label}</span>
    </div>
  );
}

const STEPS = [
  {
    num: 1,
    title: "Tulis Laporanmu",
    description: "Sampaikan isu atau ide perubahan dengan jelas dan konstruktif.",
  },
  {
    num: 2,
    title: "Kumpulkan Keluhan",
    description: "Bagikan laporanmu agar teman-teman lain ikut mendukung.",
  },
  {
    num: 3,
    title: "Tindakan Sekolah",
    description: "Laporan dengan dukungan tinggi akan ditindaklanjuti oleh pihak tata kelola.",
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "Apa itu SuaraMoklet?",
    answer: "SuaraMoklet adalah platform aspirasi dan pengaduan resmi untuk seluruh siswa SMK Telkom Malang guna menyampaikan masukan, ide, dan keluhan terkait sarana prasarana, kurikulum, kesiswaan, dan tata kelola sekolah secara transparan.",
  },
  {
    question: "Apakah saya bisa melapor secara anonim?",
    answer: "Ya! Pada langkah terakhir pengisian laporan (Langkah 5), Anda dapat mengaktifkan opsi 'Kirim Sebagai Anonim'. Nama Anda tidak akan ditampilkan kepada publik, namun tetap tersimpan secara aman di sistem untuk kebutuhan verifikasi pihak sekolah.",
  },
  {
    question: "Bagaimana proses tindak lanjut dari laporan saya?",
    answer: "Setiap laporan akan diverifikasi admin terlebih dahulu. Jika valid, laporan akan diteruskan ke Unit Kerja terkait (seperti Sarpras atau Kesiswaan) dan statusnya akan diubah menjadi 'PROSES'. Anda dapat memantau progres detailnya melalui visual timeline di halaman detail laporan.",
  },
  {
    question: "Apa fungsi fitur 'Dukung Laporan'?",
    answer: "Fitur dukungan memungkinkan siswa lain memberikan suara dukungan pada laporan Anda. Laporan dengan dukungan yang tinggi (mencapai target dukungan) akan diprioritaskan untuk segera ditindaklanjuti oleh manajemen sekolah.",
  },
  {
    question: "Format dokumen bukti apa saja yang didukung?",
    answer: "Kami mendukung berkas lampiran berupa gambar (JPG, JPEG, PNG) atau dokumen digital (PDF) dengan batas ukuran file maksimal sebesar 5MB untuk mempermudah unit pengelola melakukan inspeksi lapangan.",
  },
];

function FaqAccordionItem({ item, isOpen, onClick }: { item: FaqItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs hover:border-red-200 transition-all duration-300">
      <button
        onClick={onClick}
        type="button"
        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-red-650 transition-colors gap-4 select-none cursor-pointer"
      >
        <span className="text-sm md:text-base leading-snug">{item.question}</span>
        <ChevronDown
          className={cn("h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300",
            isOpen && "rotate-180 text-red-600"
          )}
        />
      </button>
      <div
        className={cn("grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 border-t border-slate-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="p-5 text-xs md:text-sm text-slate-500 leading-relaxed bg-slate-50/50">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [statsTriggered, setStatsTriggered] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [suaramuDone, setSuaramuDone] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [petitionTitle, setPetitionTitle] = useState("");
  const [trendingComplaints, setTrendingComplaints] = useState<ComplaintCardData[]>([]);
  const [latestComplaints, setLatestComplaints] = useState<ComplaintCardData[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [summaryStats, setSummaryStats] = useState({ total: 0, resolved: 0, avgRating: 0 });

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleStartPetition = (e: React.FormEvent) => {
    e.preventDefault();
    const title = petitionTitle.trim();
    if (!title) {
      toast.error("Silakan masukkan keluhan atau aspirasi Anda terlebih dahulu.");
      return;
    }

    const auth = useAuthStore.getState().isAuthenticated;
    const createUrl = `/complaints/create?title=${encodeURIComponent(title)}`;
    if (auth) {
      router.push(createUrl);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(createUrl)}`);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadPublicComplaints = async () => {
      try {
        const publicList = await apiClient.complaints.getPublic({ limit: 10 });

        const formatTimeAgo = (dateStr: string) => {
          const diffMs = Date.now() - new Date(dateStr).getTime();
          const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
          const diffHours = Math.floor(diffMs / (3600 * 1000));
          if (diffDays > 0) return `${diffDays} hari yang lalu`;
          if (diffHours > 0) return `${diffHours} jam yang lalu`;
          return "Baru saja";
        };

        const dislikedIds = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("disliked_complaints") || "[]") : [];
        const filteredList = publicList.filter(c => !dislikedIds.includes(c.id));

        const mapped: ComplaintCardData[] = filteredList.map((c) => {
          const reporterName = c.isAnonymous ? "Anonim" : (c.reporter?.name || "Warga Moklet");
          const reporterInitial = reporterName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "AN";
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            image: c.evidenceUrl && (c.evidenceUrl.startsWith("http") || c.evidenceUrl.startsWith("/")) && c.evidenceUrl !== "<string>" ? c.evidenceUrl : undefined,
            category: c.unit as any,
            status: c.status as any,
            supports: c.supports || 0,
            reporter: reporterName,
            reporterInitial,
            timeAgo: formatTimeAgo(c.createdAt),
          };
        });

        // 1. Trending sorted by supports count
        const trending = [...mapped].sort((a, b) => b.supports - a.supports).slice(0, 3).map((item, idx) => ({
          ...item,
          rank: idx + 1,
        }));
        setTrendingComplaints(trending);

        // 2. Latest sorted by date
        setLatestComplaints(mapped.slice(0, 4));

        // 3. Compute summary stats from public data
        const resolved = mapped.filter((c) => (c.status as string) === "CLOSED").length;
        const totalSupports = mapped.reduce((sum, c) => sum + (c.supports || 0), 0);
        const avgRating = mapped.length > 0 ? Math.round((totalSupports / mapped.length) * 10) / 10 : 0;
        setSummaryStats({ total: mapped.length, resolved, avgRating });
      } catch (err) {
        console.error("Failed to load public complaints:", err);
      } finally {
        setIsLoadingComplaints(false);
      }
    };

    loadPublicComplaints();
  }, []);

  // Intersection Observer for stats counter animation
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsTriggered(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxTrendingSupports = Math.max(...trendingComplaints.map((c) => c.supports), 10);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── Navbar ───────────────────────────────────── */}
      <Header />

      {/* ── SECTION 1: Hero ──────────────────────────── */}
      <section
        id="home"
        className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-white"
      >
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)",
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
                animationFrom={{ filter: 'blur(10px)', opacity: 0, y: -50 }}
                animationTo={[
                  { filter: 'blur(5px)', opacity: 0.5, y: 5 },
                  { filter: 'blur(0px)', opacity: 1, y: 0 },
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
                  animationFrom={{ filter: 'blur(12px)', opacity: 0, y: -40 }}
                  animationTo={[
                    { filter: 'blur(6px)', opacity: 0.4, y: 6 },
                    { filter: 'blur(0px)', opacity: 1, y: 0 },
                  ]}
                  easing={[0.25, 0.1, 0.25, 1]}
                  onAnimationComplete={() => setSuaramuDone(true)}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-red-600 justify-center"
                />
                {/* Hand-drawn organic circle loop wrapping around "Suaramu." - Responsive mobile & desktop */}
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
            text="Platform tata kelola sekolah yang transparan. Suarakan pendapatmu, kumpulkan dukungan, dan wujudkan lingkungan belajar yang lebih baik bersama-sama."
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
            <form onSubmit={handleStartPetition} className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:bg-white sm:rounded-2xl sm:border-2 sm:border-slate-200 sm:shadow-lg sm:shadow-slate-100 sm:hover:border-red-300 sm:focus-within:border-red-500 sm:focus-within:shadow-red-100/50 sm:focus-within:shadow-xl sm:transition-all sm:duration-300 sm:overflow-hidden sm:p-1.5">
              <div className="flex items-center gap-2.5 flex-1 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-red-500 transition-all sm:border-0 sm:rounded-none sm:px-0 sm:py-0 sm:focus-within:border-0">
                <Megaphone className="h-5 w-5 text-red-500 shrink-0 sm:ml-3" />
                <input
                  type="text"
                  value={petitionTitle}
                  onChange={(e) => setPetitionTitle(e.target.value)}
                  placeholder="Apa yang ingin kamu ubah di sekolah?"
                  className="flex-1 px-2 sm:px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none py-1 sm:py-3 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto sm:shrink-0 h-12 sm:h-11 px-6 rounded-2xl sm:rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.97] text-white text-sm font-bold transition-all shadow-md shadow-red-200/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                Mulai Petisi
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Stats Summary (Wrapped Card Trust Bar) ──────────────────── */}
      <section ref={statsRef} className="py-8 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50/80 rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center divide-x divide-slate-200/70">
              {/* Total Keluhan */}
              <div className="space-y-1 px-2">
                <p className={`text-3xl sm:text-4xl font-extrabold text-red-600 transition-all duration-700 ${statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                  {isLoadingComplaints ? "—" : summaryStats.total}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-600">Total Keluhan Publik</p>
              </div>
              {/* Diselesaikan */}
              <div className="space-y-1 px-2">
                <p className={`text-3xl sm:text-4xl font-extrabold text-red-600 transition-all duration-700 delay-100 ${statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                  {isLoadingComplaints ? "—" : summaryStats.resolved}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-600">Sudah Diselesaikan</p>
              </div>
              {/* Rata-rata Suka */}
              <div className="space-y-1 px-2">
                <p className={`text-3xl sm:text-4xl font-extrabold text-red-600 transition-all duration-700 delay-200 ${statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                  {isLoadingComplaints ? "—" : `${summaryStats.avgRating}`}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-600">Rata-rata Suka</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Trending Reports (Horizontal Scroll Carousel + Progress Bar) ──────────────── */}
      <section id="trending" className="py-16 sm:py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with Eyebrow Badge & Carousel Navigation */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <SectionEyebrow label="Trending Minggu Ini" icon={TrendingUp} />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trending &amp; Suka Terbanyak
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Laporan dengan keterlibatan dan suka tertinggi dari warga sekolah</p>
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
            {isLoadingComplaints ? (
              <div className="w-full py-12 flex justify-center text-slate-400 font-medium">
                Memuat data keluhan...
              </div>
            ) : trendingComplaints.length > 0 ? (
              trendingComplaints.map((complaint) => (
                <div key={complaint.id} className="w-75 sm:w-90 shrink-0 snap-start">
                  <ComplaintCard
                    data={complaint}
                    maxSupports={maxTrendingSupports}
                  />
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

      {/* ── SECTION 4: How It Works ──────────────────── */}
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
                  transition={{ duration: 0.45, delay: stepDelay, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative flex flex-col items-center gap-4 px-4"
                >
                  {/* Circle */}
                  <div className="relative z-10 h-16 w-16 rounded-full border-2 border-red-200 bg-white shadow-md shadow-red-100 flex items-center justify-center">
                    <span className="text-xl font-extrabold text-red-600">{step.num}</span>
                    <div className="absolute inset-0 rounded-full border border-red-300 animate-ping opacity-20" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Latest Reports (Compact Vertical Recency List) ─────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <SectionEyebrow label="Terbaru" icon={FileText} />
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Suara Terbaru</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Laporan dan aspirasi yang baru saja masuk ke sistem</p>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-red-600 hover:text-red-700 transition-colors shrink-0"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingComplaints ? (
              <div className="py-12 flex justify-center text-slate-400 font-medium">
                Memuat data keluhan terbaru...
              </div>
            ) : latestComplaints.length > 0 ? (
              latestComplaints.map((complaint) => (
                <LatestComplaintListItem key={complaint.id} data={complaint} />
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium">
                Belum ada keluhan publik saat ini.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FAQ Accordions ─────────────────── */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionEyebrow label="FAQ" icon={HelpCircle} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Temukan jawaban atas kebingungan Anda seputar penggunaan platform aspirasi SuaraMoklet.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <FaqAccordionItem
                key={faq.question}
                item={faq}
                isOpen={activeFaqIndex === index}
                onClick={() => setActiveFaqIndex(activeFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CTA Banner + TextLoop Background ──── */}
      {/* TextLoop wave runs as a background layer behind the card */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-white">

        {/* TextLoop: absolute background, pointer-events-none so card stays interactive */}
        <div className="absolute inset-0 flex items-center pointer-events-none select-none">
          <TextLoop
            text="Suaramu Penting ✦ Laporkan Sekarang ✦ Bersama Kita Bisa Berubah ✦ Transparan & Terpercaya"
            shape="wave"
            speed={80}
            direction="forward"
            separator="✦"
            curviness={90}
            fontSize={46}
            fontWeight={800}
            letterSpacing={2}
            uppercase
            color="#ffffff"
            ribbon
            ribbonColor="#B61722"
            ribbonWidth={86}
            pauseOnHover={false}
          />
        </div>

        {/* Card — sits above the wave via z-10 */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-linear-to-br from-red-600 to-red-700 rounded-3xl px-8 py-14 sm:py-20 overflow-hidden shadow-2xl shadow-red-200">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/3" />

            <div className="relative z-10">
              <SectionEyebrow label="Ayo Beraksi" variant="light" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mt-1">
                Suaramu Bisa Membawa Perubahan
              </h2>
              <p className="mt-4 text-red-100 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-medium">
                Ayo mulai laporkan ide, masukan, atau permasalahan yang ada di sekolahmu dan jadilah bagian dari perubahan.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/complaints/create"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white text-red-650 font-extrabold text-sm hover:bg-red-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  Buat Laporan
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 active:scale-[0.98] transition-all"
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: Footer ─────────────────────────── */}
      <Footer />
    </div>
  );
}
