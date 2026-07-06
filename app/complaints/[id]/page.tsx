"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Tag,
  FileText,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Building2,
  ChevronDown,
  Search,
  Megaphone,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  PenTool,
} from "lucide-react";
import SupportWidget from "@/components/complaints/SupportWidget";
import Timeline from "@/components/complaints/Timeline";
import CommentSection from "@/components/comments/CommentSection";
import useComplaint from "@/hooks/useComplaint";
import { useAuthStore } from "@/app/store/auth.store";
import { cn } from "@/lib/utils";
import { ComplaintStatus, TimelineEvent } from "@/types/complaint";

const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Jelajahi Petisi", href: "/search" },
  { label: "Tentang", href: "/#about" },
  { label: "Trending", href: "/search?sort=POPULAR" },
];

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; classes: string }> = {
  OPEN: { label: "OPEN", classes: "bg-slate-100 text-slate-600 border border-slate-200" },
  IN_PROGRESS: { label: "IN PROGRESS", classes: "bg-blue-50 text-blue-600 border border-blue-200" },
  WAITING_USER: { label: "WAITING USER", classes: "bg-amber-50 text-amber-600 border border-amber-200" },
  CLOSED: { label: "CLOSED", classes: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
};

function Accordion({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
          <Icon className="h-4 w-4 text-red-500" />
          {title}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="px-5 pb-5 text-xs text-slate-650 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const { currentComplaint, isLoading, fetchComplaintById, supportComplaint } = useComplaint(complaintId);
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearchVal, setNavSearchVal] = useState("");

  // True when logged-in user is the owner of this complaint
  const isOwner = !!(user && currentComplaint?.reporter?.id && user.id === currentComplaint.reporter.id);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && complaintId) {
      fetchComplaintById(complaintId).then((res) => {
        if (!res) setNotFound(true);
      });
    }
  }, [mounted, complaintId]);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(navSearchVal.trim())}`);
    }
  };

  const safeISO = (base: string | undefined, offsetMs = 0): string => {
    const ts = base ? new Date(base).getTime() : NaN;
    const resolved = isNaN(ts) ? Date.now() : ts;
    return new Date(resolved + offsetMs).toISOString();
  };

  // Shared public navbar
  const PublicNavbar = () => (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-sm shadow-red-200">
            <Megaphone className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-red-600 text-lg tracking-tight">SuaraMoklet</span>
        </Link>

        {/* Desktop Nav links */}
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

        {/* Desktop search + auth */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleNavSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              value={navSearchVal}
              onChange={(e) => setNavSearchVal(e.target.value)}
              placeholder="Cari keluhan..."
              className="h-9 w-52 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
            />
          </form>
          {mounted && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="h-9 px-5 flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 active:scale-[0.98]"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-9 px-5 flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
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
            <form onSubmit={handleNavSearch} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={navSearchVal}
                  onChange={(e) => setNavSearchVal(e.target.value)}
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
                className="h-9 flex items-center justify-center gap-2 rounded-full bg-red-600 text-white text-sm font-semibold"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );

  // Not-found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-16">
        <PublicNavbar />
        <main className="flex-grow flex items-center justify-center p-6 mt-8">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">Keluhan Tidak Ditemukan</h2>
            <p className="text-sm text-slate-500">Keluhan yang Anda cari tidak ada atau sudah dihapus.</p>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Pencarian
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Loading skeleton
  if (!mounted || isLoading || !currentComplaint) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-16">
        <PublicNavbar />
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 animate-pulse mt-4">
          <div className="h-6 w-20 bg-slate-200 rounded" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </main>
      </div>
    );
  }

  const displayTimeline: TimelineEvent[] = currentComplaint.timeline || [
    {
      id: "created",
      title: "Keluhan Dibuat",
      description: "Keluhan resmi diajukan ke platform SuaraMoklet.",
      createdAt: safeISO(currentComplaint.createdAt),
    },
    ...(currentComplaint.status !== "OPEN"
      ? [{
          id: "forwarded",
          title: "Diteruskan ke Unit",
          description: `Laporan diteruskan ke Unit ${currentComplaint.unit}.`,
          createdAt: safeISO(currentComplaint.createdAt, 60 * 60 * 1000),
        }]
      : []),
    ...(currentComplaint.status === "CLOSED"
      ? [{
          id: "closed",
          title: "Keluhan Diselesaikan",
          description: "Isu laporan telah ditangani dan dinyatakan selesai.",
          createdAt: safeISO(currentComplaint.createdAt, 2 * 24 * 60 * 60 * 1000),
        }]
      : []),
  ];

  const statusInfo = STATUS_CONFIG[currentComplaint.status] || STATUS_CONFIG.OPEN;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-16">
      <PublicNavbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        {/* ── MOBILE COMPACT HEADER CARD ─────────────────────── */}
        <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide", statusInfo.classes)}>
              {statusInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              <Tag className="h-3 w-3" />
              {currentComplaint.unit}
            </span>
          </div>
          {/* Title */}
          <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-snug">
            {currentComplaint.title}
          </h1>
          {/* Signature count */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
            <PenTool className="h-4 w-4" />
            <span>{(currentComplaint.supports || 0).toLocaleString("id-ID")} dukungan</span>
          </div>
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              {currentComplaint.isAnonymous
                ? <><EyeOff className="h-3.5 w-3.5" />Anonim</>
                : <><UserIcon className="h-3.5 w-3.5" />{currentComplaint.reporter?.name || "Siswa"}</>
              }
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(safeISO(currentComplaint.createdAt)).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ── DESKTOP FULL HERO BANNER ─────────────────────────── */}
        <div className="hidden lg:flex relative border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white min-h-[280px] flex-col justify-end">
          <div className="absolute inset-0 bg-slate-100">
            {currentComplaint.evidenceUrl ? (
              <img src={currentComplaint.evidenceUrl} alt={currentComplaint.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-red-500/10 to-amber-500/10 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-red-500/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-neutral-900/10" />
          </div>
          <div className="relative z-10 p-8 space-y-3 text-white">
            <div className="flex flex-wrap gap-2.5 items-center">
              <span className={cn("inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-sm shadow-sm", statusInfo.classes)}>
                {statusInfo.label}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-sm border border-white/10">
                <Tag className="h-3 w-3" />Unit {currentComplaint.unit}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight max-w-4xl">
              {currentComplaint.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm font-bold text-red-300">
              <PenTool className="h-4 w-4" />
              <span>{(currentComplaint.supports || 0).toLocaleString("id-ID")} dukungan</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                {currentComplaint.isAnonymous
                  ? <><EyeOff className="h-4 w-4 text-neutral-400" />Diajukan Anonim</>
                  : <><UserIcon className="h-4 w-4 text-neutral-400" />Diajukan oleh: {currentComplaint.reporter?.name || "Siswa"}</>
                }
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-neutral-400" />
                {new Date(safeISO(currentComplaint.createdAt)).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ── CONTENT GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4 lg:space-y-6">

            {/* Mobile: accordion sections */}
            <div className="lg:hidden space-y-3">
              <Accordion title="Permasalahan" icon={AlertCircle} defaultOpen={true}>
                <p className="whitespace-pre-wrap">{currentComplaint.description || <span className="text-slate-400 italic">Deskripsi belum tersedia.</span>}</p>
              </Accordion>

              {currentComplaint.expectedOutput && (
                <Accordion title="Yang Diharapkan" icon={HelpCircle}>
                  <p className="whitespace-pre-wrap">{currentComplaint.expectedOutput}</p>
                </Accordion>
              )}

              {currentComplaint.evidenceUrl && (
                <Accordion title="Lampiran Bukti" icon={FileText}>
                  <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={currentComplaint.evidenceUrl}
                      alt="Lampiran Bukti"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(currentComplaint.evidenceUrl, "_blank")}
                    />
                  </div>
                </Accordion>
              )}
            </div>

            {/* Desktop: full expanded cards */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500" />Permasalahan
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">
                  {currentComplaint.description || <span className="text-slate-400 italic">Deskripsi belum tersedia.</span>}
                </p>
              </div>

              {currentComplaint.expectedOutput && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <HelpCircle className="h-4.5 w-4.5 text-red-500" />Yang Diharapkan
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{currentComplaint.expectedOutput}</p>
                </div>
              )}

              {currentComplaint.evidenceUrl && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="h-4.5 w-4.5 text-red-500" />Lampiran Bukti
                  </h3>
                  <div className="relative max-w-md h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={currentComplaint.evidenceUrl}
                      alt="Lampiran Bukti"
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(currentComplaint.evidenceUrl, "_blank")}
                    />
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tujuan Keluhan</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-0.5">Unit {currentComplaint.unit}</h4>
                </div>
              </div>
            </div>

            {/* Comments — shown on both */}
            <CommentSection complaintId={currentComplaint.id} isClosed={currentComplaint.status === "CLOSED"} />
          </div>

          {/* Right Column: Support + Timeline */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            <SupportWidget
              complaintId={currentComplaint.id}
              supports={currentComplaint.supports}
              targetSupports={currentComplaint.targetSupports || 500}
              isSupported={currentComplaint.isSupported}
              isOwner={isOwner}
              onSupport={supportComplaint}
            />
            <Timeline events={displayTimeline} />
          </div>

        </div>
      </main>
    </div>
  );
}
