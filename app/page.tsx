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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TRENDING_COMPLAINTS: ComplaintCardData[] = [
  {
    id: "demo-001",
    rank: 1,
    title: "AC Lab RPL 2 Sering Mati",
    description:
      "Kondisi AC yang sering mati di laboratorium sangat mengganggu konsentrasi belajar saat praktikum berlangsung hampir setiap hari.",
    image: "/images/lab_ac_rusak.png",
    category: "Sarpras",
    status: "OPEN",
    supports: 842,
    reporter: "Andi M.",
    reporterInitial: "AM",
    timeAgo: "2 jam yang lalu",
  },
  {
    id: "demo-002",
    rank: 2,
    title: "Perbaikan Fasilitas Parkir Motor",
    description:
      "Area parkir saat musim hujan sangat becek dan licin, membahayakan siswa saat memarkir kendaraan mereka di pagi hari.",
    image: "/images/parkir_sekolah.png",
    category: "Sarpras",
    status: "OPEN",
    supports: 650,
    reporter: "Budi S.",
    reporterInitial: "BS",
    timeAgo: "2 hari yang lalu",
  },
  {
    id: "demo-003",
    rank: 3,
    title: "Penambahan Buku di Perpustakaan",
    description:
      "Mohon pengadaan buku referensi terbaru untuk jurusan Rekayasa Perangkat Lunak agar bisa mendukung pembelajaran lebih optimal.",
    image: "/images/perpus_sekolah.png",
    category: "Kurikulum",
    status: "IN_PROGRESS",
    supports: 412,
    reporter: "Siti A.",
    reporterInitial: "SA",
    timeAgo: "4 hari yang lalu",
  },
];

const LATEST_COMPLAINTS: ComplaintCardData[] = [
  {
    id: "demo-002",
    title: "Jadwal Ekskul Basket Bentrok",
    description:
      "Jadwal ekstrakurikuler basket dan pramuka seringkali dilaksanakan pada hari dan jam yang bersamaan sehingga siswa yang mengikuti keduanya bingung.",
    image: "/images/basket_telkom.jpeg",
    category: "Kesiswaan",
    status: "OPEN",
    supports: 88,
    reporter: "Anonim",
    reporterInitial: "AN",
    timeAgo: "1 hari yang lalu",
  },
  {
    id: "demo-003",
    title: "Keran Air Toilet Gedung C Bocor",
    description:
      "Keran air di toilet lantai 2 gedung C terus mengeluarkan air walaupun sudah diputar penuh. Air terbuang percuma setiap hari.",
    image: "/images/parkir_sekolah.png",
    category: "Sarpras",
    status: "CLOSED",
    supports: 45,
    reporter: "Demo Siswa",
    reporterInitial: "DS",
    timeAgo: "kemarin",
  },
  {
    id: "demo-001",
    title: "Penambahan Buku di Perpustakaan",
    description:
      "Mohon pengadaan buku referensi terbaru untuk jurusan Rekayasa Perangkat Lunak agar bisa mendukung pembelajaran lebih optimal.",
    image: "/images/perpus_sekolah.png",
    category: "Kurikulum",
    status: "IN_PROGRESS",
    supports: 210,
    reporter: "Siti A.",
    reporterInitial: "SA",
    timeAgo: "kemarin",
  },
];

const STATS = [
  { value: "12.000+", label: "Total Laporan", icon: FileText, color: "text-red-600", bg: "bg-red-50" },
  { value: "8.500+", label: "Siswa Aktif", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { value: "95%", label: "Laporan Ditindaklanjuti", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { value: "4.8/5", label: "Kepuasan Pengguna", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
];

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

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Reports", href: "#trending" },
  { label: "FAQ", href: "#faq"},
];

// ─── Counter Animation Hook ───────────────────────────────────────────────────

function useCountUp(target: string, duration = 1800, triggered = false) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!triggered) return;
    const numericStr = target.replace(/[^0-9.]/g, "");
    const suffix = target.replace(/[0-9.]/g, "");
    const end = parseFloat(numericStr);
    if (isNaN(end)) { setDisplay(target); return; }
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(target); clearInterval(timer); return; }
      const val = end % 1 !== 0 ? start.toFixed(1) : Math.floor(start).toLocaleString("id-ID");
      setDisplay(val + suffix);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, triggered]);
  return display;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ stat, triggered }: { stat: typeof STATS[0]; triggered: boolean }) {
  const display = useCountUp(stat.value, 1800, triggered);
  const Icon = stat.icon;
  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
        <Icon className={cn("h-6 w-6", stat.color)} />
      </div>
      <p className={cn("text-3xl font-extrabold tracking-tight", stat.color)}>{display}</p>
      <p className="text-sm text-slate-500 font-medium text-center">{stat.label}</p>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

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

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-sm shadow-red-200">
            <Megaphone className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-red-600 text-lg tracking-tight">SuaraMoklet</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveLink(link.label)}
              className={cn(
                "relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors",
                activeLink === link.label
                  ? "text-red-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {link.label}
              {activeLink === link.label && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-red-600" />
              )}
            </a>
          ))}
        </div>

        {/* Search + Auth Button */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari keluhan..."
              className="h-9 w-52 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
            />
          </div>
          {mounted && isAuthenticated ? (
            <Link
              href="/complaints"
              className="h-9 px-5 flex items-center gap-2 justify-center rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 active:scale-[0.98]"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-9 px-5 flex items-center gap-2 justify-center rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => { setActiveLink(link.label); setMobileOpen(false); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari keluhan..."
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
              />
            </div>
            {mounted && isAuthenticated ? (
              <Link
                href="/complaints"
                onClick={() => setMobileOpen(false)}
                className="h-9 flex items-center justify-center gap-2 rounded-full bg-red-600 text-white text-sm font-semibold"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="h-9 flex items-center justify-center rounded-full bg-red-600 text-white text-sm font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [statsTriggered, setStatsTriggered] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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
      <Navbar />

      {/* ── SECTION 1: Hero ──────────────────────────── */}
      <section
        id="home"
        className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-white"
      >
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-red-500/8 blur-[100px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Perubahan Sekolah{" "}
            <br className="hidden sm:block" />
            Dimulai dari{" "}
            <span className="relative inline-block text-red-600">
              Suaramu.
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 4 Q50 0 100 4 Q150 8 200 4" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Platform tata kelola sekolah yang transparan. Suarakan pendapatmu, kumpulkan dukungan, dan wujudkan lingkungan belajar yang lebih baik bersama-sama.
          </p>

          {/* CTA Input */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-lg shadow-slate-100 hover:border-red-300 focus-within:border-red-500 focus-within:shadow-red-100/50 focus-within:shadow-xl transition-all duration-300 overflow-hidden p-1.5">
              <div className="flex items-center gap-2.5 pl-3 shrink-0">
                <Megaphone className="h-5 w-5 text-red-500" />
              </div>
              <input
                type="text"
                placeholder="Apa yang ingin kamu ubah di sekolah?"
                className="flex-1 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
              />
              <button className="shrink-0 h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.97] text-white text-sm font-bold transition-all shadow-sm shadow-red-200 flex items-center gap-2">
                Mulai Petisi
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Trust indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                Lebih dari{" "}
                <span className="font-semibold text-slate-600">1.200 siswa</span>{" "}
                telah berpartisipasi bulan ini.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Trending Reports ──────────────── */}
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
            {TRENDING_COMPLAINTS.map((complaint) => (
              <ComplaintCard key={complaint.id} data={complaint} />
            ))}
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
            {LATEST_COMPLAINTS.map((complaint) => (
              <ComplaintCard key={complaint.id} data={complaint} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Stats ─────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white" ref={statsRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4">
              Platform dalam Angka
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dipercaya Ribuan Warga Sekolah
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat) => (
              <StatCard key={stat.label} stat={stat} triggered={statsTriggered} />
            ))}
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Bergabung Sekarang
              </div>
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
      <footer className="bg-white border-t border-slate-100 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-red-600 text-lg">SuaraMoklet</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Platform aspirasi dan pengaduan sekolah yang transparan.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 mt-5">
                {[
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                { label: "YouTube", path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
              ].map(({ label, path }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d={path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Navigasi */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Navigasi</h4>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "#home" },
                  { name: "About", href: "#about" },
                  { name: "Reports", href: "#trending" },
                  { name: "FAQ", href: "#faq" },
                ].map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-slate-500 hover:text-red-600 transition-colors">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Bantuan */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Bantuan</h4>
              <ul className="space-y-3">
                {["Contact School", "Support", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-red-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Social Media */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Social Media</h4>
              <ul className="space-y-3">
                {[
                  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                  { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                  { label: "YouTube", path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
                ].map(({ label, path }) => (
                  <li key={label}>
                    <a href="#" className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d={path} /></svg>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>© 2026 SuaraMoklet. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
