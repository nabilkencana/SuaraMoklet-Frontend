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
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import UnitSidebar from "@/components/dashboard/UnitSidebar";
import UnitComplaintsList from "@/components/dashboard/UnitComplaintsList";
import { cn } from "@/lib/utils";

interface ExtendedComplaint extends Complaint {
  priority: string;
  reporterName: string;
}

export default function UnitDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "keluhan">("dashboard");

  // Data dari backend
  const [complaints, setComplaints] = useState<ExtendedComplaint[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({
    NEW: 0, WAITING_RESPONSE: 0, IN_PROGRESS: 0, CLOSED: 0,
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
    router.push(`/complaints/${id}${hash}`);
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
  }, [mounted, isAuthenticated, user, fetchComplaints]);

  // Filter
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === "Semua Status") return true;
    if (statusFilter === "Baru") return c.status === "NEW";
    if (statusFilter === "Belum Direspon") return c.status === "WAITING_RESPONSE";
    if (statusFilter === "Diproses") return c.status === "IN_PROGRESS";
    if (statusFilter === "Selesai") return c.status === "CLOSED";
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

  if (!mounted || !isAuthenticated || (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN")) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f9f9f9]">

      {/* ─── LEFT SIDEBAR ─── */}
      <UnitSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" ? (
        /* ─── MAIN WORKSPACE ─── */
        <div className="flex-grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">
        <div className="flex-grow overflow-y-auto p-8 space-y-8">

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

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Keluhan Baru", key: "NEW", filter: "Baru", color: "border-l-slate-400", activeColor: "border-l-slate-600", icon: <Mail className="h-5 w-5" />, bg: "bg-slate-50", text: "text-slate-500" },
              { label: "Belum Direspon", key: "WAITING_RESPONSE", filter: "Belum Direspon", color: "border-l-amber-500", activeColor: "border-l-amber-600", icon: <FileText className="h-5 w-5" />, bg: "bg-amber-50", text: "text-amber-500" },
              { label: "Sedang Diproses", key: "IN_PROGRESS", filter: "Diproses", color: "border-l-orange-500", activeColor: "border-l-orange-600", icon: <RefreshCw className="h-5 w-5" />, bg: "bg-orange-50", text: "text-orange-500" },
              { label: "Selesai", key: "CLOSED", filter: "Selesai", color: "border-l-red-600", activeColor: "border-l-red-700", icon: <CheckCircle2 className="h-5 w-5" />, bg: "bg-red-50", text: "text-red-600" },
            ].map((card) => (
              <div
                key={card.key}
                onClick={() => setStatusFilter(statusFilter === card.filter ? "Semua Status" : card.filter)}
                className={cn(
                  "bg-white rounded-3xl border p-5 shadow-xs flex items-center justify-between border-l-[5px] transition-all cursor-pointer hover:bg-slate-50/50",
                  statusFilter === card.filter
                    ? `${card.activeColor} border-slate-300 shadow-sm`
                    : `border-slate-200/80 ${card.color}`
                )}
              >
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-450">{card.label}</span>
                  <span className="block text-3xl font-extrabold text-slate-800 leading-tight">
                    {isLoading ? <span className="text-slate-300">—</span> : (stats[card.key] ?? 0)}
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
                <option value="Belum Direspon">Belum Direspon</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
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
                      const isClosed = c.status === "CLOSED";
                      let statusText = "Baru";
                      let statusBadgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
                      if (c.status === "WAITING_RESPONSE") { statusText = "Belum Direspon"; statusBadgeClass = "bg-rose-50 text-rose-600 border border-rose-200"; }
                      else if (c.status === "IN_PROGRESS") { statusText = "Diproses"; statusBadgeClass = "bg-orange-50 text-orange-600 border border-orange-200"; }
                      else if (c.status === "CLOSED") { statusText = "Selesai"; statusBadgeClass = "bg-slate-100 text-slate-500 border border-slate-200"; }
                      else if (c.status === "WAITING_USER") { statusText = "Menunggu User"; statusBadgeClass = "bg-yellow-50 text-yellow-700 border border-yellow-200"; }

                      return (
                        <tr key={c.id} className="text-slate-700 text-xs hover:bg-slate-50/40 transition-all align-middle">
                          <td className="py-4 pl-2 font-bold text-slate-400 font-mono uppercase">
                            #{c.id.slice(0, 8)}
                          </td>
                          <td className="py-4 pr-3 max-w-[220px]">
                            <span className={cn("block font-bold text-slate-800 leading-snug truncate", isClosed && "line-through text-slate-400 font-medium")}>
                              {c.title}
                            </span>
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
                                onClick={() => handleOpenDetail(c.id)}
                                className="relative h-8 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 shadow-3xs transition-all cursor-pointer active:scale-[0.96]"
                              >
                                {(c.status === "NEW" || c.status === "WAITING_RESPONSE") && !readIds.has(c.id) && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-650" />
                                  </span>
                                )}
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                <span>Detail</span>
                              </button>
                              {user?.role === "UNIT_PIC" && !isClosed && (
                                <button
                                  onClick={() => handleOpenDetail(c.id, "#reply-form-section")}
                                  className="h-8 px-3 bg-[#b61722] hover:bg-[#a7151e] text-white font-bold rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-[0.96] text-[10px]"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Balas</span>
                                </button>
                              )}
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
      </div>
    ) : (
      <UnitComplaintsList hideSidebar={true} />
    )}
    </div>
  );
}
