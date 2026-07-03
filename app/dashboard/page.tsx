"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertCircle,
  MessageSquare,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/auth.store";
import { useComplaint } from "@/hooks/useComplaint";
import { useDashboard } from "@/hooks/useDashboard";

// Import custom dashboard components
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentComplaintCard from "@/components/dashboard/RecentComplaintCard";
import HelpCard from "@/components/dashboard/HelpCard";
import NoticeBanner from "@/components/dashboard/NoticeBanner";

// Skeletons
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 h-22 flex items-center justify-between">
          <div className="flex items-center gap-4 w-full">
            <div className="h-12 w-12 bg-slate-100 border border-slate-150 rounded-xl shrink-0" />
            <div className="space-y-2 w-1/2">
              <div className="h-5 bg-slate-100 rounded w-12" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GuideSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm animate-pulse space-y-6">
      <div className="bg-slate-100 h-28 rounded-2xl" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
      <div className="space-y-4 pt-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4.5 items-start">
            <div className="h-8.5 w-8.5 bg-slate-100 rounded-xl shrink-0" />
            <div className="space-y-2 w-full">
              <div className="h-3.5 bg-slate-100 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 h-36 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="h-5 bg-slate-100 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-12" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-3/4 my-1" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <div className="h-3 bg-slate-100 rounded w-24" />
            <div className="h-3 bg-slate-100 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
function AspirationGuideCard({ userName }: { userName: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-6 md:p-8 space-y-6">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-tr from-red-600/10 to-amber-600/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-red-500/10">
          <div className="space-y-1.5">
            <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-1.5">
              Halo, {userName || "Siswa"}! 👋
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Siap membuat perubahan hari ini? Suaramu sangat berharga untuk menciptakan lingkungan SMK Telkom Malang yang lebih baik.
            </p>
          </div>
          <Link
            href="/complaints/create"
            className="h-10 px-5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm shadow-red-900/20 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Lapor Sekarang</span>
          </Link>
        </div>

        {/* Guideline Title */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800">Panduan Menulis Laporan Efektif</h4>
          <p className="text-xs text-slate-400 font-semibold">Ikuti langkah berikut agar keluhanmu cepat diverifikasi dan ditindaklanjuti oleh pihak sekolah:</p>
        </div>

        {/* Steps List */}
        <div className="space-y-5 pt-2">
          {/* Step 1 */}
          <div className="flex gap-4.5 items-start">
            <div className="h-8.5 w-8.5 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 border border-slate-200/50">
              1
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-slate-700">Tentukan Unit Kerja yang Tepat</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih unit tujuan yang sesuai (misal: Sarpras untuk fasilitas fisik, Kesiswaan untuk kegiatan siswa) agar laporan langsung masuk ke tim pengelola terkait.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4.5 items-start">
            <div className="h-8.5 w-8.5 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 border border-slate-200/50">
              2
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-slate-700">Tulis Kronologi & Ekspektasi Jelas</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deskripsikan permasalahan secara lengkap (apa, di mana, dan kapan) serta hasil konkret yang diharapkan agar unit kerja dapat memahami kebutuhan perbaikan secara akurat.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4.5 items-start">
            <div className="h-8.5 w-8.5 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 border border-slate-200/50">
              3
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-slate-700">Lampirkan Bukti Valid</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unggah dokumen pendukung atau foto keadaan riil di lapangan pada langkah unggah berkas untuk mempermudah unit pengelola melakukan investigasi langsung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { stats, fetchDashboardData, isLoading: statsLoading } = useDashboard();
  const { complaints, fetchOwnComplaints, isLoading: complaintsLoading } = useComplaint();
  const user = useAuthStore((s) => s.user);

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

  const handleRefresh = () => {
    fetchDashboardData();
    fetchOwnComplaints();
  };

  // Convert complaints list to active, pending, solved for displays
  const ownComplaints = Array.isArray(complaints) ? complaints : [];
  const activeReportsCount = stats?.activeCount ?? ownComplaints.filter(c => c.status === "OPEN").length;
  const resolvedReportsCount = stats?.resolvedCount ?? ownComplaints.filter(c => c.status === "CLOSED").length;
  const pendingReportsCount = stats?.pendingCount ?? ownComplaints.filter(c => c.status === "IN_PROGRESS" || c.status === "WAITING_USER").length;
  const resolutionRate = stats?.resolutionRate ?? (ownComplaints.length ? Math.round((resolvedReportsCount / ownComplaints.length) * 100) : 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-slate-800">

      {/* 1. Left Sidebar Navigation (Dark) */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Right Main Layout Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">

        {/* Header Greeting & Notifications */}
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {/* Dashboard Content Container */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* Quick Metrics row */}
          {statsLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatsCard
                title="Active Reports"
                value={activeReportsCount}
                icon={Clock}
                color="blue"
                subtitle="Menunggu tanggapan admin"
              />
              <StatsCard
                title="Resolved Reports"
                value={resolvedReportsCount}
                icon={CheckCircle2}
                color="emerald"
                subtitle="Keluhan sukses diselesaikan"
              />
              <StatsCard
                title="SLA Resolution Rate"
                value={resolutionRate}
                icon={TrendingUp}
                color="red"
                subtitle="Persentase penyelesaian"
                showProgress={true}
              />
            </div>
          )}

          {/* Main 2-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Aspiration & Complaint Guideline Card */}
            <div className="lg:col-span-7">
              {complaintsLoading ? (
                <GuideSkeleton />
              ) : (
                <AspirationGuideCard userName={user?.name || ""} />
              )}
            </div>

            {/* Right Column: Recent complaints and administrator help */}
            <div className="lg:col-span-5 space-y-6">

              {/* Recent Complaints Section Header */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-red-650" />
                    <span>Keluhan Saya</span>
                  </h3>
                  <Link
                    href="/complaints"
                    className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Lihat Semua &rsaquo;
                  </Link>
                </div>

                {/* Complaint list conditional states */}
                {complaintsLoading ? (
                  <ListSkeleton />
                ) : ownComplaints.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-350">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">Belum ada keluhan</p>
                      <p className="text-[10px] text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
                        Suarakan aspirasi Anda. Buat laporan keluhan pertama menggunakan form di sebelah kiri.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownComplaints.slice(0, 3).map((complaint) => (
                      <RecentComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        commentCount={complaint.timeline?.length || 0}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Support & Admin Help Box */}
              <HelpCard />
            </div>
          </div>

          {/* Bottom System Banner */}
          <NoticeBanner />
        </main>
      </div>
    </div>
  );
}
