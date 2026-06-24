"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  PlusCircle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles,
  User as UserIcon,
  Shield,
  FileText
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import useComplaint from "@/hooks/useComplaint";
import { ComplaintStatus } from "@/types/complaint";

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; classes: string }> = {
  OPEN: {
    label: "BARU",
    classes: "bg-slate-100 text-slate-600 border border-slate-200/80",
  },
  IN_PROGRESS: {
    label: "PROSES",
    classes: "bg-blue-50 text-blue-600 border border-blue-200/80",
  },
  WAITING_USER: {
    label: "RESPONS SISWA",
    classes: "bg-amber-50 text-amber-600 border border-amber-200/80",
  },
  CLOSED: {
    label: "SELESAI",
    classes: "bg-emerald-50 text-emerald-600 border border-emerald-200/80",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { complaints, isLoading, fetchOwnComplaints } = useComplaint();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchOwnComplaints();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-xl" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // Count statistics based on real user data
  const ownComplaints = Array.isArray(complaints) ? complaints : [];
  const totalCount = ownComplaints.length;
  const inProgressCount = ownComplaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "WAITING_USER").length;
  const solvedCount = ownComplaints.filter((c) => c.status === "CLOSED").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Welcome Section Banner */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-850 rounded-2xl p-6 md:p-8 text-white shadow-md overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-red-200" />
                Akses Terverifikasi
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Halo, {user?.name || "Warga Moklet"}!
              </h2>
              <p className="text-sm text-red-100 max-w-xl leading-relaxed">
                Selamat datang di dashboard pengaduan sekolah. Silakan buat laporan keluhan baru, pantau status investigasi, atau berpartisipasi dalam diskusi.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/complaints/create"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-red-600 font-bold text-sm hover:bg-red-50 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Buat Pengaduan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5"> 
          {/* Stats 1: Total Laporan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Laporan Anda</div>
            </div>
          </div>

          {/* Stats 2: Sedang Diproses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{inProgressCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Diproses</div>
            </div>
          </div>

          {/* Stats 3: Terselesaikan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{solvedCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terselesaikan</div>
            </div>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Account Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-red-600" />
              <span>Detail Akun</span>
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{user?.name || "Tidak tersedia"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Email</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{user?.email || "Tidak tersedia"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Latest Complaints list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-600" />
                <span>Pengaduan Terbaru Anda</span>
              </h3>
              <Link 
                href="/complaints" 
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-0.5"
              >
                <span>Lihat semua</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Complaints list container */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-24 w-full bg-slate-100 animate-pulse rounded-xl" />
                  <div className="h-24 w-full bg-slate-100 animate-pulse rounded-xl" />
                </div>
              ) : ownComplaints.length === 0 ? (
                <div className="py-10 text-center space-y-3.5">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Belum ada pengaduan</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Anda belum pernah mengirim laporan keluhan atau aspirasi ke sekolah.</p>
                  </div>
                  <Link
                    href="/complaints/create"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    <span>Mulai buat laporan sekarang</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                ownComplaints.slice(0, 3).map((complaint) => {
                  const statusInfo = STATUS_CONFIG[complaint.status] || { label: "UNKNOWN", classes: "bg-slate-50 text-slate-500 border-slate-150" };
                  return (
                    <Link
                      key={complaint.id}
                      href={`/complaints/${complaint.id}`}
                      className="block p-4 border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-1">
                          {complaint.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border shrink-0 tracking-wider uppercase ${statusInfo.classes}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {complaint.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Unit Penerima: <strong className="text-slate-500">{complaint.unit}</strong></span>
                        <span>{new Date(complaint.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Shared Footer Branding */}
      <Footer />
    </div>
  );
}
