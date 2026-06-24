"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  FileText, 
  EyeOff, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  Building2,
  ChevronRight
} from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import SupportWidget from "@/components/complaints/SupportWidget";
import Timeline from "@/components/complaints/Timeline";
import CommentSection from "@/components/comments/CommentSection";
import useComplaint from "@/hooks/useComplaint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComplaintStatus, TimelineEvent } from "@/types/complaint";

// Status Badge Config
const STATUS_CONFIG: Record<ComplaintStatus, { label: string; classes: string }> = {
  OPEN: {
    label: "OPEN",
    classes: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    classes: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  WAITING_USER: {
    label: "WAITING USER",
    classes: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  CLOSED: {
    label: "CLOSED",
    classes: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
};

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const { currentComplaint, isLoading, fetchComplaintById, supportComplaint } = useComplaint(complaintId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Safe date helper ─────────────────────────────────────────────────────
  // Returns a valid ISO string, falling back to now() when input is invalid.
  const safeISO = (base: string | undefined, offsetMs = 0): string => {
    const ts = base ? new Date(base).getTime() : NaN;
    const resolved = isNaN(ts) ? Date.now() : ts;
    return new Date(resolved + offsetMs).toISOString();
  };

  if (!mounted || isLoading || !currentComplaint) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
          <div className="h-8 w-24 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-40 bg-slate-200 rounded-2xl" />
              <div className="h-40 bg-slate-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-4 h-80 bg-slate-200 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Generate dynamic timeline events if not served from backend
  const displayTimeline: TimelineEvent[] = currentComplaint.timeline || [
    {
      id: "created",
      title: "Keluhan Dibuat",
      description: "Keluhan resmi diajukan ke platform SuaraMoklet.",
      createdAt: safeISO(currentComplaint.createdAt),
    },
    ...(currentComplaint.status !== "OPEN"
      ? [
          {
            id: "forwarded",
            title: "Diteruskan ke Unit",
            description: `Laporan telah diverifikasi oleh admin dan diteruskan ke Unit ${currentComplaint.unit} untuk ditindaklanjuti.`,
            createdAt: safeISO(currentComplaint.createdAt, 60 * 60 * 1000),
          },
        ]
      : []),
    ...(currentComplaint.status === "CLOSED"
      ? [
          {
            id: "closed",
            title: "Keluhan Diselesaikan",
            description: "Isu laporan telah ditangani dan dinyatakan selesai oleh pihak unit pengelola terkait.",
            createdAt: safeISO(currentComplaint.createdAt, 2 * 24 * 60 * 60 * 1000),
          },
        ]
      : []),
  ];

  const statusInfo = STATUS_CONFIG[currentComplaint.status] || STATUS_CONFIG.OPEN;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar Header */}
      <Header />

      {/* Main Details Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Link */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar</span>
        </button>

        {/* Hero Banner Header Card */}
        <div className="relative border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white min-h-[300px] flex flex-col justify-end">
          {/* Banner Evidence Image or fallback grid */}
          <div className="absolute inset-0 bg-slate-100">
            {currentComplaint.evidenceUrl ? (
              <img 
                src={currentComplaint.evidenceUrl} 
                alt={currentComplaint.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-red-500/10 to-amber-500/10 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-red-500/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-neutral-900/10" />
          </div>

          {/* Hero Overlay Content */}
          <div className="relative z-10 p-6 md:p-8 space-y-4 text-white">
            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Status Badge */}
              <span className={cn("inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-sm shadow-sm", statusInfo.classes)}>
                {statusInfo.label}
              </span>
              {/* Category/Unit */}
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-sm shadow-sm border border-white/10">
                <Tag className="h-3 w-3" />
                <span>Unit {currentComplaint.unit}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight max-w-4xl">
              {currentComplaint.title}
            </h1>

            {/* Reporter details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-neutral-300">
              <div className="flex items-center gap-1.5">
                {currentComplaint.isAnonymous ? (
                  <>
                    <EyeOff className="h-4 w-4 text-neutral-400" />
                    <span>Diajukan Anonim</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-4 w-4 text-neutral-400" />
                    <span>Diajukan oleh: {currentComplaint.reporter?.name || "Siswa"}</span>
                  </>
                )}
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-600 hidden sm:inline" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <span>
                  {new Date(safeISO(currentComplaint.createdAt)).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Complaint details & Discussion */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Permasalahan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertCircle className="h-4.5 w-4.5 text-red-600" />
                <span>Permasalahan</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {currentComplaint.description}
              </p>
            </div>

            {/* Yang Diharapkan */}
            {currentComplaint.expectedOutput && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HelpCircle className="h-4.5 w-4.5 text-red-600" />
                  <span>Yang Diharapkan</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {currentComplaint.expectedOutput}
                </p>
              </div>
            )}

            {/* Lampiran preview */}
            {currentComplaint.evidenceUrl && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="h-4.5 w-4.5 text-red-600" />
                  <span>Lampiran Bukti</span>
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

            {/* Decisions department PIC Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengambil Keputusan (Tujuan Keluhan)</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-0.5">Unit {currentComplaint.unit}</h4>
                </div>
              </div>
            </div>

            {/* Discussions / Comment Section */}
            <CommentSection 
              complaintId={currentComplaint.id} 
              isClosed={currentComplaint.status === "CLOSED"} 
            />

          </div>

          {/* Right Column: Support endorsements & Timeline */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Support Widget */}
            <SupportWidget
              complaintId={currentComplaint.id}
              supports={currentComplaint.supports}
              targetSupports={currentComplaint.targetSupports || 500}
              isSupported={currentComplaint.isSupported}
              onSupport={supportComplaint}
            />

            {/* Developments / Timeline */}
            <Timeline events={displayTimeline} />

          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <Footer />
    </div>
  );
}
