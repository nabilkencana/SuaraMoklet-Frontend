"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { ComplaintCard, ComplaintCardData } from "@/components/shared/complaint-card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { apiClient } from "@/lib/api";
const STEPS = [
  {
    num: 1,
    title: "Tulis Laporanmu",
    description: "Sampaikan isu atau ide perubahan dengan jelas dan konstruktif.",
  },
  {
    num: 2,
    title: "Kumpulkan Dukungan",
    description: "Bagikan laporanmu agar teman-teman lain ikut mendukung.",
  },
  {
    num: 3,
    title: "Tindakan Sekolah",
    description: "Laporan dengan dukungan tinggi akan ditindaklanjuti oleh pihak tata kelola.",
  },
];

// Local Navbar has been replaced by the unified Header component

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
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-red-200 transition-all duration-300">
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
  const statsRef = useRef<HTMLDivElement>(null);
  const [petitionTitle, setPetitionTitle] = useState("");
  const [trendingComplaints, setTrendingComplaints] = useState<ComplaintCardData[]>([]);
  const [latestComplaints, setLatestComplaints] = useState<ComplaintCardData[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [summaryStats, setSummaryStats] = useState({ total: 0, resolved: 0, avgRating: 0 });

  const handleStartPetition = (e: React.FormEvent) => {
    e.preventDefault();
    const title = petitionTitle.trim();
    if (!title) {
      toast.error("Silakan masukkan keluhan atau aspirasi Anda terlebih dahulu.");
      return;
    }

    // Read auth state fresh from the store at click-time to avoid stale closure
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
            image: c.evidenceUrl || undefined,
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

        // 2. Latest sorted by date or index
        setLatestComplaints(mapped.slice(0, 3));

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

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── Navbar ───────────────────────────────────── */}
      <Header />

      {/* ── SECTION 1: Hero ──────────────────────────── */}
      {/* ponytail: use min-h-[100dvh] and flex centering for simple full-viewport layout */}
      <section
        id="home"
        className="relative min-h-[100dvh] flex items-center justify-center pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-white"
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Perubahan Sekolah{" "}
            <br className="hidden sm:block" />
            Dimulai dari{" "}
            <span className="relative inline-block text-red-600">
              Suaramu.
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 4 Q50 0 100 4 Q150 8 200 4" stroke="#B61722" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Platform tata kelola sekolah yang transparan. Suarakan pendapatmu, kumpulkan dukungan, dan wujudkan lingkungan belajar yang lebih baik bersama-sama.
          </p>

          {/* CTA Input */}
          <div className="mt-16 sm:mt-20 max-w-2xl mx-auto">
            <form onSubmit={handleStartPetition} className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:bg-white sm:rounded-2xl sm:border-2 sm:border-slate-200 sm:shadow-lg sm:shadow-slate-100 sm:hover:border-red-300 sm:focus-within:border-red-500 sm:focus-within:shadow-red-100/50 sm:focus-within:shadow-xl sm:transition-all sm:duration-300 sm:overflow-hidden sm:p-1.5">

              {/* Input wrapper — bordered on mobile, borderless inside pill on desktop */}
              <div className="flex items-center gap-2.5 flex-1 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-red-500 transition-all sm:border-0 sm:rounded-none sm:px-0 sm:py-0 sm:focus-within:border-0">
                <Megaphone className="h-5 w-5 text-red-500 shrink-0 sm:ml-3" />
                <input
                  type="text"
                  value={petitionTitle}
                  onChange={(e) => setPetitionTitle(e.target.value)}
                  placeholder="Apa yang ingin kamu ubah di sekolah?"
                  className="flex-1 px-2 sm:px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none py-1 sm:py-3"
                />
              </div>

              {/* Submit button — full width on mobile */}
              <button
                type="submit"
                className="w-full sm:w-auto sm:shrink-0 h-12 sm:h-11 px-6 rounded-2xl sm:rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.97] text-white text-sm font-bold transition-all shadow-md shadow-red-200/60 flex items-center justify-center gap-2"
              >
                Mulai Petisi
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Stats Summary ──────────────────── */}
      <section ref={statsRef} className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {/* Total Keluhan */}
            <div className="space-y-1">
              <p className={`text-3xl sm:text-4xl font-extrabold text-red-600 transition-all duration-700 ${
                statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                {isLoadingComplaints ? "—" : summaryStats.total}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Total Keluhan Publik</p>
            </div>
            {/* Diselesaikan */}
            <div className="space-y-1">
              <p className={`text-3xl sm:text-4xl font-extrabold text-emerald-600 transition-all duration-700 delay-100 ${
                statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                {isLoadingComplaints ? "—" : summaryStats.resolved}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Sudah Diselesaikan</p>
            </div>
            {/* Rata-rata Dukungan */}
            <div className="space-y-1">
              <p className={`text-3xl sm:text-4xl font-extrabold text-blue-600 transition-all duration-700 delay-200 ${
                statsTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                {isLoadingComplaints ? "—" : `${summaryStats.avgRating}`}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Rata-rata Dukungan</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Trending Reports ──────────────── */}
      <section id="trending" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Trending & Dukungan Terbanyak
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Laporan paling banyak didukung minggu ini</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoadingComplaints ? (
              <div className="col-span-full py-12 flex justify-center text-slate-400">
                Memuat data keluhan...
              </div>
            ) : trendingComplaints.length > 0 ? (
              trendingComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} data={complaint} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                Belum ada keluhan publik saat ini.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: How It Works ──────────────────── */}
      <section id="about" className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4">
            Cara Kerja
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana SuaraMoklet Bekerja
          </h2>
          <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
            Tiga langkah sederhana untuk membuat perubahan nyata di sekolahmu.
          </p>

          {/* Steps */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines — desktop only */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-red-200 via-red-300 to-red-200" />

            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center gap-4 px-4">
                {/* Circle */}
                <div className="relative z-10 h-16 w-16 rounded-full border-2 border-red-200 bg-white shadow-md shadow-red-100 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-red-600">{step.num}</span>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full border border-red-300 animate-ping opacity-20" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Latest Reports ─────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Suara Terbaru</h2>
              <p className="text-xs text-slate-500 mt-0.5">Laporan yang baru saja masuk</p>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoadingComplaints ? (
              <div className="col-span-full py-12 flex justify-center text-slate-400">
                Memuat data keluhan...
              </div>
            ) : latestComplaints.length > 0 ? (
              latestComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} data={complaint} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
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

      {/* ── SECTION 7: CTA Banner ────────────────────── */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-gradient-to-br from-red-600 to-red-700 rounded-3xl px-8 py-14 sm:py-20 overflow-hidden shadow-2xl shadow-red-200">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/[0.03]" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Suaramu Bisa Membawa Perubahan
              </h2>
              <p className="mt-4 text-red-100 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Ayo mulai laporkan ide, masukan, atau permasalahan yang ada di sekolahmu dan jadilah bagian dari perubahan.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/complaints/create"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white text-red-600 font-bold text-sm hover:bg-red-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  Buat Laporan
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 active:scale-[0.98] transition-all"
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Footer ─────────────────────────── */}
      <Footer />
    </div>
  );
}
