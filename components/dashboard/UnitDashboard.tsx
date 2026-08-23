"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import {
  Loader2,
  Mail,
  FileText,
  RefreshCw,
  CheckCircle2,
  Eye,
  Send,
  X,
  Building,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import UnitSidebar from "@/components/dashboard/UnitSidebar";
import UnitComplaintsList from "@/components/dashboard/UnitComplaintsList";
import DetailComplaintModal from "@/components/dashboard/admin/modals/DetailComplaintModal";
import { cn, getSlaStatus } from "@/lib/utils";

interface ExtendedComplaint extends Complaint {
  priority: string;
  reporterName: string;
}

const VALID_UNIT_TABS: ("dashboard" | "keluhan")[] = ["dashboard", "keluhan"];

export default function UnitDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "keluhan">(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as any;
      if (tabParam && VALID_UNIT_TABS.includes(tabParam)) {
        return tabParam;
      }
      const savedTab = localStorage.getItem("unitActiveTab") as any;
      if (savedTab && VALID_UNIT_TABS.includes(savedTab)) {
        return savedTab;
      }
    }
    return "dashboard";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("unitActiveTab", activeTab);
      const url = new URL(window.location.href);
      if (url.searchParams.get("tab") !== activeTab) {
        url.searchParams.set("tab", activeTab);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [activeTab]);

  // Data dari backend
  const [complaints, setComplaints] = useState<ExtendedComplaint[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({
    NEW: 0, OPEN: 0, DONE: 0,
  });
  const [meta, setMeta] = useState({ totalKeluhan: 0, page: 1, limit: 20, totalPages: 1 });

  // Read complaints tracking
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("read_complaint_ids");
        if (stored) return new Set(JSON.parse(stored));
      } catch {}
    }
    return new Set();
  });

  const handleOpenDetail = (id: string, hash: string = "") => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("read_complaint_ids", JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });
    router.push(`/dashboard/complaints/${id}${hash}`);
  };

  // Modal Detail Komprehensif
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);

  const handleOpenDetailModal = async (id: string) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const data = await apiClient.complaints.getAdminDetail(id);
      setDetailModalData(data);
      if (typeof window !== "undefined") {
        localStorage.setItem(`lastViewed_${id}`, new Date().toISOString());
      }
    } catch (err: any) {
      toast.error("Gagal memuat detail komprehensif");
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Filter & pagination
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset halaman saat filter berubah
  useEffect(() => { setCurrentPage(1); }, [statusFilter]);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.complaints.getUnitComplaints({ limit: 100 });
      const mapped: ExtendedComplaint[] = result.data.map((bc) => {
        const hash = bc.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const val = hash % 3;
        const priority = val === 0 ? "Tinggi" : val === 1 ? "Sedang" : "Rendah";
        return {
          ...bc,
          priority,
          reporterName: bc.reporter?.name || "Anonim",
        };
      });
      setComplaints(mapped);
      setStats(result.stats);
      setMeta(result.meta);
    } catch (err: any) {
      console.error("Failed to fetch unit complaints:", err);
      toast.error("Gagal memuat data keluhan unit.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Auth guard
  useEffect(() => {
    if (mounted && (!isAuthenticated || (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN"))) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load data
  useEffect(() => {
    if (mounted && isAuthenticated && (user?.role === "UNIT_PIC" || user?.role === "UNIT_MEMBER" || user?.role === "SUPERADMIN")) {
      fetchComplaints();
    }
  }, [mounted, isAuthenticated, user, activeTab, fetchComplaints]);

  // Filter
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === "Semua Status") return true;
    if (statusFilter === "Baru") return c.status === "NEW";
    if (statusFilter === "Diproses") return c.status === "OPEN";
    if (statusFilter === "Selesai") return c.status === "DONE";
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "-";
    }
  };


  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar dari portal unit");
    router.push("/");
  };

  // Calculate Extra Stats
  const ratedComplaints = complaints.filter((c) => c.rating);
  const avgRatingVal = ratedComplaints.length > 0
    ? ratedComplaints.reduce((acc, c) => acc + c.rating!.score, 0) / ratedComplaints.length
    : 0;
  const avgRatingStr = avgRatingVal > 0 ? avgRatingVal.toFixed(1) : "-";

  const doneComplaints = complaints.filter((c) => c.status === "DONE");
  let avgTimeStr = "-";
  if (doneComplaints.length > 0) {
    const totalMs = doneComplaints.reduce((acc, c) => {
      const start = new Date(c.createdAt).getTime();
      const end = c.updatedAt ? new Date(c.updatedAt).getTime() : start;
      const diff = end - start;
      return acc + (diff > 0 ? diff : 0);
    }, 0);
    const avgMs = totalMs / doneComplaints.length;
    const avgDays = Math.floor(avgMs / (1000 * 60 * 60 * 24));
    const avgHours = Math.floor((avgMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (avgDays > 0) {
      avgTimeStr = `${avgDays}h ${avgHours}j`;
    } else if (avgHours > 0) {
      avgTimeStr = `${avgHours} jam`;
    } else {
      avgTimeStr = "< 1 jam";
    }
  }

  if (!mounted || !isAuthenticated || (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN")) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#f9f9f9] font-sans antialiased text-slate-800">
        <UnitSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="grow h-full flex items-center justify-center bg-[#f9f9f9]">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f9f9f9] font-sans antialiased text-slate-800">

      {/* ─── LEFT SIDEBAR ─── */}
      <UnitSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── MAIN CONTAINER ─── */}
      <div className="grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="relative w-96"></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || "PIC Unit"}
                </span>
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {user?.role === "UNIT_PIC" ? "Ketua PIC" : "Anggota PIC"}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#b61722] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                {(user?.name || "PIC")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" ? (
          /* ─── MAIN WORKSPACE ─── */
          <div className="grow overflow-y-auto p-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard Unit</h1>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Ringkasan dan manajemen keluhan yang ditugaskan ke unit Anda.</p>
            </div>
            <button
              onClick={fetchComplaints}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              { label: "Keluhan Baru", key: "NEW", filter: "Baru", isClickable: true, color: "border-l-slate-400", activeColor: "border-l-slate-600", icon: <Mail className="h-5 w-5" />, bg: "bg-slate-50", text: "text-slate-500", value: stats.NEW ?? 0 },
              { label: "Sedang Diproses", key: "OPEN", filter: "Diproses", isClickable: true, color: "border-l-orange-500", activeColor: "border-l-orange-600", icon: <RefreshCw className="h-5 w-5" />, bg: "bg-orange-50", text: "text-orange-500", value: stats.OPEN ?? 0 },
              { label: "Selesai", key: "DONE", filter: "Selesai", isClickable: true, color: "border-l-red-600", activeColor: "border-l-red-700", icon: <CheckCircle2 className="h-5 w-5" />, bg: "bg-red-50", text: "text-red-600", value: stats.DONE ?? 0 },
              { label: "Rata-Rata Rating", key: "RATING", filter: "Semua Status", isClickable: false, color: "border-l-yellow-400", activeColor: "border-l-yellow-500", icon: <Star className="h-5 w-5" />, bg: "bg-yellow-50", text: "text-yellow-600", value: avgRatingStr },
              { label: "Rata-Rata Waktu Respon", key: "TIME", filter: "Semua Status", isClickable: false, color: "border-l-blue-400", activeColor: "border-l-blue-500", icon: <Clock className="h-5 w-5" />, bg: "bg-blue-50", text: "text-blue-600", value: avgTimeStr },
            ].map((card) => (
              <div
                key={card.key}
                onClick={() => {
                  if (card.isClickable) {
                    setStatusFilter(statusFilter === card.filter ? "Semua Status" : card.filter);
                  }
                }}
                className={cn(
                  "bg-white rounded-3xl border p-5 shadow-xs flex items-center justify-between border-l-[5px] transition-all",
                  card.isClickable ? "cursor-pointer hover:bg-slate-50/50" : "cursor-default",
                  statusFilter === card.filter && card.isClickable
                    ? `${card.activeColor} border-slate-300 shadow-sm`
                    : `border-slate-200/80 ${card.color}`
                )}
              >
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-450">{card.label}</span>
                  <span className="block text-3xl font-extrabold text-slate-800 leading-tight">
                    {isLoading ? <span className="text-slate-300">—</span> : card.value}
                  </span>
                </div>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-2xs", card.bg, card.text)}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">

            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Daftar Keluhan Masuk</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-250 bg-white px-3.5 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-175">
                <thead>
                  <tr className="text-slate-450 font-bold text-[11px] uppercase border-b border-slate-100">
                    <th className="pb-3 pl-2 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Judul</th>
                    <th className="pb-3 font-semibold">Pelapor</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 text-right pr-2 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#b61722]" />
                        Memuat data keluhan...
                      </td>
                    </tr>
                  ) : paginatedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs leading-relaxed">
                        <Building className="h-7 w-7 text-slate-350 mx-auto mb-2 opacity-50" />
                        {statusFilter !== "Semua Status"
                          ? `Tidak ada keluhan dengan status "${statusFilter}".`
                          : "Belum ada keluhan yang ditugaskan ke unit Anda."}
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map((c) => {
                      const isClosed = c.status === "DONE";
                      let statusText = "Baru";
                      let statusBadgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
                      if (c.status === "OPEN") { statusText = "Diproses"; statusBadgeClass = "bg-orange-50 text-orange-600 border border-orange-200"; }
                      else if (c.status === "DONE") { statusText = "Selesai"; statusBadgeClass = "bg-slate-100 text-slate-500 border border-slate-200"; }

                      let hasNewUpdate = false;
                      if (typeof window !== "undefined") {
                        const lastViewedStr = localStorage.getItem(`lastViewed_${c.id}`);
                        const updatedTime = new Date(c.updatedAt || c.createdAt).getTime();
                        if (lastViewedStr) {
                          hasNewUpdate = updatedTime > new Date(lastViewedStr).getTime() + 2000;
                        } else {
                          hasNewUpdate = updatedTime > new Date(c.createdAt).getTime() + 5000;
                        }
                      }

                      return (
                        <tr key={c.id} className="text-slate-700 text-xs hover:bg-slate-50/40 transition-all align-middle">
                          <td className="py-4 pl-2 font-bold text-slate-400 font-mono uppercase">
                            #{c.id.slice(0, 8)}
                          </td>
                          <td className="py-4 pr-3 max-w-55">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="relative inline-flex items-center">
                                <span
                                  onClick={() => handleOpenDetail(c.id)}
                                  className={cn("block font-bold text-slate-800 leading-snug truncate cursor-pointer hover:text-[#b61722] hover:underline transition-colors pr-2", isClosed && "line-through text-slate-400 font-medium hover:text-slate-500")}
                                >
                                  {c.title}
                                </span>
                                {hasNewUpdate && (
                                  <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                                  </span>
                                )}
                              </div>
                              {c.status === "NEW" && (() => {
                                const sla = getSlaStatus(c.createdAt);
                                return (
                                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", sla.color)}>
                                    {sla.text}
                                  </span>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-slate-650">
                            {c.isAnonymous ? <span className="text-slate-400 italic">Anonim</span> : (c.reporter?.name || "—")}
                          </td>
                          <td className="py-4">
                            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider", statusBadgeClass)}>
                              {statusText}
                            </span>
                          </td>
                          <td className="py-4 font-semibold text-slate-500">{formatDate(c.createdAt)}</td>
                          <td className="py-4 text-right pr-2">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleOpenDetailModal(c.id)}
                                title="Detail Komprehensif"
                                className="h-8 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 shadow-3xs transition-all cursor-pointer active:scale-[0.96]"
                              >
                                <Info className="h-3.5 w-3.5 text-slate-500" />
                                <span>Detail</span>
                              </button>
                              <button
                                onClick={() => handleOpenDetail(c.id, "#reply-form-section")}
                                className="relative h-8 px-3 bg-[#b61722] hover:bg-red-650 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-[0.96] text-[11px]"
                              >
                                {(c.status === "NEW") && !readIds.has(c.id) && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400" />
                                  </span>
                                )}
                                <Send className="h-3 w-3" />
                                <span>Balas</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
              <span>
                Menampilkan {filteredComplaints.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredComplaints.length)} dari {filteredComplaints.length} keluhan
              </span>
              <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-7 w-7 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-7 px-2 rounded-lg bg-[#b61722] flex items-center justify-center text-white font-bold select-none text-[10px]">
                  {currentPage} / {totalPages}
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="h-7 w-7 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="grow overflow-y-auto">
          <UnitComplaintsList hideSidebar={true} />
        </div>
      )}
      </div>

      {/* Modal Detail */}
      <DetailComplaintModal
        isOpen={isDetailModalOpen}
        isLoading={isDetailLoading}
        data={detailModalData}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailModalData(null);
        }}
      />
    </div>
  );
}
