"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Megaphone,
  TrendingUp,
  Tag,
  Calendar,
  User as UserIcon,
  EyeOff,
  ArrowRight,
  X,
  Award,
  Filter,
  Building2,
  LogIn,
  LayoutDashboard,
  Menu,
  PenTool,
  MessageSquare,
  CheckCheck,
  Flame,
  BookOpen,
  Wrench,
  Users,
  GraduationCap,
  Leaf,
  Globe,
  Compass,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import { cn } from "@/lib/utils";

// Real Unsplash image URLs for premium looking petitions
const PUBLIC_COMPLAINTS: (Complaint & { category?: string; location?: string })[] = [
  {
    id: "demo-001",
    title: "AC Laboratorium RPL 2 Sering Mati",
    description:
      "Kami siswa kelas XII RPL 2 sering mengalami kendala serius saat praktikum di laboratorium komputer lantai 3. Dua unit AC di ruangan tersebut sering mati mendadak atau tidak terasa dingin sama sekali, terutama pada jam 10.00–13.00 saat suhu di luar sangat panas.",
    expectedOutput:
      "Kami memohon agar unit AC di Laboratorium RPL 2 segera diperiksa oleh teknisi berpengalaman. Jika kerusakan bersifat minor, harap segera diperbaiki.",
    unit: "Sarpras",
    status: "IN_PROGRESS",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 342,
    targetSupports: 500,
    isSupported: false,
    reporter: { id: "demo-user-001", name: "Andi Maulana" },
    category: "Fasilitas",
    location: "Gedung A, Lantai 3",
  },
  {
    id: "demo-002",
    title: "Jadwal Ekskul Basket Bentrok dengan Pramuka",
    description:
      "Jadwal ekstrakurikuler basket dan pramuka yang ditetapkan oleh Kesiswaan seringkali terjadi pada hari dan jam yang sama, yaitu setiap Rabu pukul 15.00–17.00 WIB. Kondisi ini sangat menyulitkan siswa yang ingin aktif di kedua bidang tersebut.",
    expectedOutput:
      "Mohon kepada pihak Kesiswaan untuk meninjau kembali jadwal ekstrakurikuler dan memisahkan jadwal basket dan pramuka ke hari yang berbeda.",
    unit: "Kesiswaan",
    status: "OPEN",
    isAnonymous: true,
    evidenceUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 88,
    targetSupports: 200,
    isSupported: false,
    reporter: null,
    category: "Kesiswaan",
    location: "Lapangan Olahraga",
  },
  {
    id: "demo-003",
    title: "Keran Air Toilet Gedung C Bocor",
    description:
      "Keran air di toilet lantai 2 Gedung C terus menerus mengeluarkan air walaupun sudah diputar penuh ke posisi tertutup. Kebocoran ini menyebabkan air tergenang di lantai toilet yang membuat kondisi menjadi licin dan berisiko.",
    expectedOutput:
      "Harap segera dilakukan perbaikan atau penggantian keran air yang bocor oleh teknisi dari Unit Sarpras.",
    unit: "Sarpras",
    status: "CLOSED",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 121,
    targetSupports: 200,
    isSupported: false,
    reporter: { id: "demo-user-002", name: "Rina Astuti" },
    category: "Fasilitas",
    location: "Gedung C, Toilet Lantai 2",
  },
  {
    id: "search-004",
    title: "Renovasi Lapangan Basket & Futsal yang Retak-Retak",
    description:
      "Lapangan olahraga utama sekolah di area tengah mengalami retak serius di semen permukaannya, membahayakan siswa saat berolahraga atau bermain futsal pada jam istirahat. Banyak lubang kecil yang membuat bola memantul tidak teratur.",
    expectedOutput: "Dilakukan plester semen ulang dan pengecatan kembali garis lapangan agar aman digunakan.",
    unit: "Sarpras",
    status: "OPEN",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 194,
    targetSupports: 300,
    isSupported: false,
    reporter: { id: "user-004", name: "Budi Setyawan" },
    category: "Fasilitas",
    location: "Area Tengah Sekolah",
  },
  {
    id: "search-005",
    title: "Penyediaan Dispenser Air Minum Gratis di Koridor Kelas",
    description:
      "Siswa sering kehabisan air minum saat cuaca panas dan terpaksa harus terus membeli air mineral kemasan plastik sekali pakai di kantin. Penyediaan dispenser air bersih gratis di koridor akan menghemat pengeluaran siswa dan mengurangi sampah plastik.",
    expectedOutput: "Disediakan dispenser air galon bersih di setiap lantai koridor kelas utama.",
    unit: "Sarpras",
    status: "IN_PROGRESS",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 1437,
    targetSupports: 2000,
    isSupported: false,
    reporter: { id: "user-005", name: "Rina Astuti" },
    category: "Pendidikan",
    location: "Koridor Kelas Utama",
  },
  {
    id: "search-006",
    title: "Tolak Kenaikan Tarif Parkir Sepeda Motor Siswa",
    description:
      "Kenaikan tarif parkir harian kendaraan roda dua siswa dari Rp 1.000 menjadi Rp 3.000 dinilai sangat memberatkan uang saku siswa harian. Perubahan tarif ini juga tidak didahului dengan perbaikan sistem pengamanan parkir.",
    expectedOutput: "Kembalikan tarif parkir ke Rp 1.000 atau lakukan sosialisasi serta jaminan asuransi kehilangan barang di parkiran.",
    unit: "Tata Usaha",
    status: "WAITING_USER",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 821,
    targetSupports: 1000,
    isSupported: false,
    reporter: { id: "user-006", name: "Rivaldo" },
    category: "Umum (ISO)",
    location: "Area Parkir Belakang",
  },
  {
    id: "search-007",
    title: "Tambahkan Kelas Pemrograman Mobile & AI di Jurusan RPL",
    description:
      "Kurikulum Rekayasa Perangkat Lunak (RPL) saat ini dinilai kurang adaptif dengan kebutuhan industri startup modern yang mencari keahlian React Native, Flutter, dan integrasi API Artificial Intelligence. Kelas materi ini perlu dimasukkan.",
    expectedOutput: "Penyelenggaraan materi pemrograman mobile secara intensif di semester ganjil kelas XI dan XII.",
    unit: "Kurikulum",
    status: "OPEN",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 499,
    targetSupports: 500,
    isSupported: false,
    reporter: { id: "user-007", name: "Nabil Kencana" },
    category: "Pendidikan",
    location: "Lab Komputer RPL",
  },
  {
    id: "search-008",
    title: "Hapus Penggunaan Styrofoam Sekali Pakai di Kantin",
    description:
      "Kantin sekolah masih banyak menyajikan makanan menggunakan wadah styrofoam sekali pakai yang merusak lingkungan sekolah dan berbahaya bagi kesehatan siswa jika terkena makanan panas.",
    expectedOutput: "Kantin wajib beralih ke piring melamin cuci ulang atau pembungkus ramah lingkungan.",
    unit: "Umum (ISO)",
    status: "CLOSED",
    isAnonymous: false,
    evidenceUrl: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 288,
    targetSupports: 300,
    isSupported: false,
    reporter: { id: "user-008", name: "Alissa" },
    category: "Lingkungan",
    location: "Area Kantin",
  },
];

const TOPICS = [
  "Semua Topik",
  "Pendidikan",
  "Fasilitas",
  "Kesiswaan",
  "Kurikulum",
  "Umum (ISO)",
  "Lingkungan",
];

const TOPIC_CONFIGS = [
  {
    label: "Semua Topik",
    icon: Globe,
  },
  {
    label: "Pendidikan",
    icon: GraduationCap,
  },
  {
    label: "Fasilitas",
    icon: Wrench,
  },
  {
    label: "Kesiswaan",
    icon: Users,
  },
  {
    label: "Kurikulum",
    icon: BookOpen,
  },
  {
    label: "Umum (ISO)",
    icon: Building2,
  },
  {
    label: "Lingkungan",
    icon: Leaf,
  },
];

const STATUSES = [
  { value: "ALL", label: "Semua Status" },
  { value: "OPEN", label: "Baru Diajukan (OPEN)" },
  { value: "IN_PROGRESS", label: "Sedang Diproses (IN PROGRESS)" },
  { value: "WAITING_USER", label: "Menunggu Respon (WAITING USER)" },
  { value: "CLOSED", label: "Selesai (CLOSED)" },
];

const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Jelajahi Petisi", href: "/search" },
  { label: "Tentang", href: "/#about" },
  { label: "Trending", href: "/#trending" },
  { label: "FAQ", href: "/#faq" },
];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const statusParam = searchParams.get("status") || "ALL";
  const sortParam = searchParams.get("sort") || "POPULAR";
  const topicParam = searchParams.get("topic") || "Semua Topik";

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(query);
  const [navbarSearchQuery, setNavbarSearchQuery] = useState(query);
  const [selectedTopic, setSelectedTopic] = useState(topicParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    setMounted(true);
    setSearchVal(query);
    setNavbarSearchQuery(query);
    setSelectedStatus(statusParam);
    setSortBy(sortParam);
    setSelectedTopic(topicParam);
  }, [query, statusParam, sortParam, topicParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const handleNavbarSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(navbarSearchQuery.trim())}`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedTopic(category);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusParam !== "ALL") params.set("status", statusParam);
    if (sortBy !== "POPULAR") params.set("sort", sortBy);
    if (category !== "Semua Topik") params.set("topic", category);
    router.push(`/search?${params.toString()}`);
  };

  // Show results view when there's a query OR an active filter
  const isResultsView = !!query || statusParam !== "ALL" || sortParam !== "POPULAR" || topicParam !== "Semua Topik";

  const filteredResults = PUBLIC_COMPLAINTS.filter((item) => {
    const queryNormalized = query.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(queryNormalized);
    const descMatch = item.description.toLowerCase().includes(queryNormalized);
    const unitMatch = item.unit.toLowerCase().includes(queryNormalized);
    const categoryMatch = item.category?.toLowerCase().includes(queryNormalized);

    const matchesSearch = !query || titleMatch || descMatch || unitMatch || categoryMatch;

    const matchesTopic =
      topicParam === "Semua Topik" ||
      item.category === topicParam ||
      item.unit === topicParam;

    const matchesStatus = statusParam === "ALL" || item.status === statusParam;

    return matchesSearch && matchesTopic && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "POPULAR") {
      return (b.supports || 0) - (a.supports || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col pt-16">
      
      {/* ── Navbar (Identical to Homepage) ──────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
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
            {NAV_LINKS.map((link) => {
              const isActive = link.label === "Jelajahi Petisi";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-red-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-red-600" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search + Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleNavbarSearchSubmit} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                value={navbarSearchQuery}
                onChange={(e) => setNavbarSearchQuery(e.target.value)}
                placeholder="Cari keluhan..."
                className="h-9 w-52 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
              />
            </form>
            {mounted && isAuthenticated ? (
              <Link
                href="/dashboard"
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
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-655 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <form onSubmit={handleNavbarSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={navbarSearchQuery}
                    onChange={(e) => setNavbarSearchQuery(e.target.value)}
                    placeholder="Cari keluhan..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  Cari
                </button>
              </form>
              {mounted && isAuthenticated ? (
                <Link
                  href="/dashboard"
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

      {/* ── Search Mode Content ─────────────────────────────── */}
      {!isResultsView ? (
        /* Explore landing view (Image 1 Change.org style) */
        <div className="flex-1">
          
          {/* Hero search center segment */}
          <section className="bg-white border-b border-slate-200/60 py-16 px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Temukan tujuan Anda berikutnya
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                Jelajahi jutaan petisi dan temukan satu yang Anda pedulikan
              </p>

              {/* Large search input */}
              <div className="max-w-2xl mx-auto pt-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-1.5 focus-within:border-red-500 focus-within:shadow-xl focus-within:shadow-red-100/30 transition-all duration-300"
                >
                  <div className="pl-3.5 text-slate-400 shrink-0">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari petisi..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="flex-1 px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none py-3"
                  />
                  {searchVal && (
                    <button
                      type="button"
                      onClick={() => setSearchVal("")}
                      className="p-1 rounded-full hover:bg-slate-200 text-slate-400 shrink-0 mr-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="shrink-0 h-11 sm:h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Cari
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Explore contents */}
          <section className="max-w-6xl mx-auto px-4 py-12 space-y-12">
            
            {/* Quick sections cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Jelajahi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Keluhan Terbaru */}
                <button
                  onClick={() => router.push("/search?status=OPEN&sort=NEWEST")}
                  className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group"
                >
                  <div className="h-11 w-11 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-red-600 shrink-0 transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Keluhan Terbaru</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Aspirasi baru dari warga Moklet</p>
                  </div>
                </button>

                {/* Card 2: Paling Didukung */}
                <button
                  onClick={() => router.push("/search?sort=POPULAR")}
                  className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group"
                >
                  <div className="h-11 w-11 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 transition-colors">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Paling Didukung</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Petisi dengan dukungan terbanyak</p>
                  </div>
                </button>

                {/* Card 3: Berhasil Diselesaikan */}
                <button
                  onClick={() => router.push("/search?status=CLOSED")}
                  className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 transition-colors">
                    <CheckCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Berhasil Diselesaikan</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Keluhan yang telah ditangani sekolah</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Topics badge lists */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Topik</h3>
              <div className="flex flex-wrap gap-2.5">
                {TOPIC_CONFIGS.map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => handleCategorySelect(topic.label)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-[0.97] cursor-pointer shadow-sm",
                      topicParam === topic.label
                        ? "bg-red-600 text-white border-transparent shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    )}
                  >
                    <topic.icon className="h-3.5 w-3.5" />
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>


            {/* Featured Petitions Grid (Matching Change.org style) */}
            <div className="space-y-6 pt-6 border-t border-slate-200/60">
              <h2 className="text-xl font-extrabold text-slate-900">
                Petisi dipromosikan oleh pengguna lain SuaraMoklet
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PUBLIC_COMPLAINTS.slice(0, 6).map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group relative"
                  >
                    {/* Entire card clickable overlay link */}
                    <Link href={`/complaints/${item.id}`} className="absolute inset-0 z-10" />

                    {/* Image Header with hover overlay button */}
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden shrink-0">
                      {item.evidenceUrl ? (
                        <img 
                          src={item.evidenceUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-red-500/10 to-amber-500/10 flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-red-500/20" />
                        </div>
                      )}
                      
                      {/* Change.org style circular overlay arrow button */}
                      <Link 
                        href={`/complaints/${item.id}`} 
                        className="absolute right-3.5 top-3.5 h-8.5 w-8.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all shadow shadow-black/20 z-20"
                      >
                        <ArrowRight className="h-4.5 w-4.5" />
                      </Link>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4 relative z-20">
                      <div className="space-y-2">
                        {/* Reporter/Promoter info line */}
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.isAnonymous ? "diajukan oleh anonim" : `promosikan oleh ${item.reporter?.name || "Siswa"}`}
                        </div>
                        
                        {/* Title link */}
                        <Link href={`/complaints/${item.id}`} className="block relative z-20">
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-red-600 hover:underline transition-colors">
                            {item.title}
                          </h4>
                        </Link>
                        
                        {/* Description brief snippet */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Supports and Button Section */}
                      <div className="space-y-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <PenTool className="h-4 w-4" />
                          <span>{item.supports.toLocaleString("id-ID")} dukungan</span>
                        </div>
                        
                        {/* Tandatangani Petisi Button */}
                        <Link
                          href={`/complaints/${item.id}`}
                          className="w-full h-10 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative z-20"
                        >
                          Tandatangani petisi ini
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      ) : (
        /* Results view (Image 2 & 3 Change.org style) */
        <div className="flex-1 bg-white">
          
          {/* Header search input section */}
          <div className="border-b border-slate-200 bg-slate-50/50 py-6 px-4">
            <div className="max-w-6xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="flex items-center max-w-xl bg-white rounded-xl border border-slate-200 p-1">
                <div className="pl-3.5 text-slate-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="Cari keluhan atau petisi..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="flex-1 px-3 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none py-2.5"
                />
                {searchVal && (
                  <button
                    type="button"
                    onClick={() => { setSearchVal(""); router.push("/search"); }}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 shrink-0 mr-1.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Cari
                </button>
              </form>

              {/* Breadcrumb + Title and Result statistics */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                <div className="space-y-1">
                  <button
                    onClick={() => router.push("/search")}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition-colors font-medium"
                  >
                    <ArrowRight className="h-3 w-3 rotate-180" />
                    Kembali ke Jelajahi
                  </button>
                  <h2 className="text-lg font-extrabold text-slate-800">
                    {query
                      ? `Hasil "${query}" (${filteredResults.length})`
                      : statusParam === "OPEN"
                      ? `Keluhan Terbaru (${filteredResults.length})`
                      : statusParam === "CLOSED"
                      ? `Berhasil Diselesaikan (${filteredResults.length})`
                      : `Paling Didukung (${filteredResults.length})`}
                  </h2>
                </div>

                {/* Sort selection */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Urutkan berdasarkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const newSort = e.target.value;
                      setSortBy(newSort);
                      const params = new URLSearchParams();
                      if (query) params.set("q", query);
                      if (statusParam !== "ALL") params.set("status", statusParam);
                      if (newSort !== "POPULAR") params.set("sort", newSort);
                      router.push(`/search?${params.toString()}`);
                    }}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none cursor-pointer text-slate-700 font-bold"
                  >
                    <option value="POPULAR">Dukungan Terbanyak</option>
                    <option value="NEWEST">Terbaru</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Core Results container */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left sidebar filters */}
              <aside className="lg:col-span-3 space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
                    <Filter className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Filter Laporan</span>
                  </div>

                  {/* Status filter list */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">STATUS LAPORAN</span>
                    <div className="space-y-1">
                      {STATUSES.map((st) => (
                        <button
                          key={st.value}
                          onClick={() => {
                            setSelectedStatus(st.value);
                            const params = new URLSearchParams();
                            if (query) params.set("q", query);
                            if (st.value !== "ALL") params.set("status", st.value);
                            if (sortBy !== "POPULAR") params.set("sort", sortBy);
                            router.push(`/search?${params.toString()}`);
                          }}
                          className={cn(
                            "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                            selectedStatus === st.value
                              ? "bg-red-50 text-red-600 font-bold"
                              : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-800"
                          )}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic checklist filter */}
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">KATEGORI TOPIK</span>
                    <div className="space-y-1">
                      {TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setSelectedTopic(topic)}
                          className={cn(
                            "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                            selectedTopic === topic
                              ? "bg-red-50 text-red-600 font-bold"
                              : "text-slate-655 hover:bg-slate-100/50 hover:text-slate-800"
                          )}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Results Listing area (Image 3 design matching) */}
              <div className="lg:col-span-9 space-y-6">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <Compass className="h-12 w-12 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-700">Tidak ada petisi yang cocok</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Coba cari menggunakan kata kunci yang berbeda atau jelajahi topik populer lainnya.
                    </p>
                    <button
                      onClick={() => { setSelectedStatus("ALL"); setSelectedTopic("Semua Topik"); setSearchVal(""); router.push("/search"); }}
                      className="h-9.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 cursor-pointer"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                ) : (
                  filteredResults.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-100 hover:border-slate-150 hover:shadow-sm rounded-2xl p-5 transition-all flex flex-col sm:flex-row gap-6 relative group"
                    >
                      {/* Entire card clickable overlay link */}
                      <Link href={`/complaints/${item.id}`} className="absolute inset-0 z-10" />

                      {/* Left Side: Text details */}
                      <div className="flex-1 space-y-2 relative z-20">
                        {/* Title link */}
                        <Link href={`/complaints/${item.id}`} className="relative z-20">
                          <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug hover:text-red-600 hover:underline transition-colors">
                            {item.title}
                          </h3>
                        </Link>

                        {/* Description paragraph */}
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Signature count */}
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 pt-1">
                          <PenTool className="h-4 w-4" />
                          <span>{item.supports.toLocaleString("id-ID")} dukungan</span>
                        </div>

                        {/* Metadata line */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-2">
                          <span className="flex items-center gap-1 text-slate-500">
                            {item.isAnonymous ? (
                              "Anonim"
                            ) : (
                              item.reporter?.name || "Siswa"
                            )}
                          </span>
                          <span>·</span>
                          <span>{item.location || "Indonesia"}</span>
                          <span>·</span>
                          <span>
                            Dimulai {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Round cover image with hover overlay arrow button */}
                      <div className="sm:w-40 md:w-48 aspect-[1.4] sm:h-28 md:h-32 shrink-0 relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 z-20">
                        {item.evidenceUrl ? (
                          <img 
                            src={item.evidenceUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-red-500/5 to-amber-500/5 flex items-center justify-center">
                            <Building2 className="h-10 w-10 text-red-500/10" />
                          </div>
                        )}

                        {/* Circular hover action button on top right of image */}
                        <Link
                          href={`/complaints/${item.id}`}
                          className="absolute top-2.5 right-2.5 h-8.5 w-8.5 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/85 transition-all text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 z-20"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
