"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, EyeOff, LogIn } from "lucide-react";
import useComplaint from "@/hooks/useComplaint";
import { useAuthStore } from "@/app/store/auth.store";
import { TimelineEvent } from "@/types/complaint";
import Header from "@/components/shared/Header";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

// Detail Subcomponents
import ComplaintHeader from "@/components/complaints/detail/ComplaintHeader";
import ComplaintBody from "@/components/complaints/detail/ComplaintBody";
import ComplaintSidebar from "@/components/complaints/detail/ComplaintSidebar";

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const { isAuthenticated, user } = useAuthStore();
  const { currentComplaint, isLoading, fetchComplaintById, supportComplaint } =
    useComplaint(complaintId, { skipFetchUnits: true });
  const [mounted, setMounted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const isOwner = Boolean(
    user && currentComplaint?.reporter?.id && user.id === currentComplaint.reporter.id
  );

  const checkDislikeStatus = () => {
    if (typeof window !== "undefined") {
      const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
      setIsDisliked(dislikedList.includes(complaintId));
    }
  };

  useEffect(() => {
    checkDislikeStatus();
    if (typeof window !== "undefined") {
      window.addEventListener("local-disliked-change", checkDislikeStatus);
      return () => {
        window.removeEventListener("local-disliked-change", checkDislikeStatus);
      };
    }
  }, [complaintId]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && complaintId) {
      fetchComplaintById(complaintId).then((res) => {
        if (!res) setNotFound(true);
      });
    }
  }, [mounted, complaintId]);

  const safeISO = (base: string | undefined, offsetMs = 0): string => {
    const ts = base ? new Date(base).getTime() : NaN;
    const resolved = isNaN(ts) ? 1700000000000 : ts;
    return new Date(resolved + offsetMs).toISOString();
  };

  // Not-found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-16">
        <Header />
        <main className="grow flex items-center justify-center p-6 mt-8">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">Keluhan Tidak Ditemukan</h2>
            <p className="text-sm text-slate-500">
              Keluhan yang Anda cari tidak ada atau sudah dihapus.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
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
    return <FullScreenLoader />;
  }

  // Visibility guard
  if (!isAuthenticated && currentComplaint.visibility === "PRIVATE") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-16">
        <Header />
        <main className="grow flex items-center justify-center p-6 mt-8">
          <div className="text-center space-y-5 max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
              <EyeOff className="h-8 w-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-slate-800">Keluhan Ini Bersifat Privat</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Keluhan ini hanya dapat dilihat oleh pengguna yang sudah masuk. Silakan login untuk
                melanjutkan.
              </p>
            </div>
            <button
              onClick={() => router.push(`/login?redirect=/complaints/${complaintId}`)}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              Masuk untuk Melihat
            </button>
          </div>
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
      ? [
          {
            id: "forwarded",
            title: "Diteruskan ke Unit",
            description: `Laporan diteruskan ke Unit ${currentComplaint.unit}.`,
            createdAt: safeISO(currentComplaint.createdAt, 60 * 60 * 1000),
          },
        ]
      : []),
    ...(currentComplaint.status === "DONE"
      ? [
          {
            id: "closed",
            title: "Keluhan Diselesaikan",
            description: "Isu laporan telah ditangani dan dinyatakan selesai.",
            createdAt: safeISO(currentComplaint.createdAt, 2 * 24 * 60 * 60 * 1000),
          },
        ]
      : []),
  ];

  const handleRestoreDisliked = () => {
    const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
    const updated = dislikedList.filter((id: string) => id !== complaintId);
    localStorage.setItem("disliked_complaints", JSON.stringify(updated));
    setIsDisliked(false);
    window.dispatchEvent(new Event("local-disliked-change"));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pt-16 font-sans">
      <Header />

      <main className="grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        {/* Header */}
        <ComplaintHeader complaint={currentComplaint} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
          <div className="lg:col-span-8">
            <ComplaintBody
              complaint={currentComplaint}
              isDisliked={isDisliked}
              isOwner={isOwner}
              onRestoreDisliked={handleRestoreDisliked}
            />
          </div>

          <div className="lg:col-span-4">
            <ComplaintSidebar
              complaint={currentComplaint}
              isOwner={isOwner}
              displayTimeline={displayTimeline}
              onSupport={supportComplaint}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
