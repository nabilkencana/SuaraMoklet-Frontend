"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import {
  Loader2,
  Search,
  MoreVertical,
  PlusCircle,
  Folder,
  Bell,
  User,
  LayoutDashboard,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ArrowRight,
  Send,
  X,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintUnit, ComplaintVisibility, ComplaintStatus } from "@/types/complaint";
import { cn } from "@/lib/utils";
import UnitSidebar from "@/components/dashboard/UnitSidebar";

// ─── Feed Mockup Complaints from Figma Screenshot ─────────────────────────────
const FIGMA_FEED_COMPLAINTS = [
  {
    id: "REQ-2023-089",
    title: "Kerusakan AC di Laboratorium Komputer 2",
    description: "AC di ruangan lab komputer 2 mati total sejak pagi ini. Suhu ruangan sangat panas dan mengganggu kegiatan praktikum siswa kelas XII RPL. Mohon segera dicek dan diperbaiki agar pembelajaran kembali kondusif.",
    unit: "Sarpras" as ComplaintUnit,
    status: "NEW" as ComplaintStatus,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    supports: 320,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "Fasilitas Fisik",
    priority: "Tinggi",
    reporter: {
      id: "teacher-budi",
      name: "Budi Santoso, S.Kom",
      role: "Guru Produktif RPL",
      avatarUrl: "/images/budi_santoso.png"
    }
  },
  {
    id: "REQ-2023-087",
    title: "Koneksi Internet Perpustakaan Lambat",
    description: "Akses internet di area baca utama perpustakaan sangat lambat sejak dua hari lalu, menyulitkan siswa yang sedang mencari referensi jurnal online. Router sepertinya perlu di-restart atau dikonfigurasi ulang.",
    unit: "Sarpras" as ComplaintUnit,
    status: "IN_PROGRESS" as ComplaintStatus,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    supports: 145,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "Infrastruktur IT",
    priority: "Sedang",
    reporter: {
      id: "staff-maryam",
      name: "Siti Maryam",
      role: "Staf Perpustakaan",
      avatarUrl: undefined
    }
  }
];

interface ExtendedFeedComplaint extends Complaint {
  priority: string;
  category: string;
  reporterName: string;
  reporterRole: string;
  reporterAvatar?: string;
  customId?: string;
  formattedTime?: string;
}

export default function UnitComplaintsList() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data collections
  const [backendComplaints, setBackendComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<"Semua" | "Baru" | "Diproses" | "Selesai">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  // Reply Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ExtendedFeedComplaint | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<ComplaintStatus>("IN_PROGRESS");

  // Determine active unit dynamically
  const getAssignedUnit = () => {
    if (user?.email === "pic_sarpras@moklet.org") return "Sarpras";
    if (user?.email === "pic_kesiswaan@moklet.org") return "Kesiswaan";
    if (user?.email === "pic_kurikulum@moklet.org") return "Kurikulum";
    if (user?.name) {
      if (user.name.toLowerCase().includes("sarpras")) return "Sarpras";
      if (user.name.toLowerCase().includes("kesiswaan")) return "Kesiswaan";
      if (user.name.toLowerCase().includes("kurikulum")) return "Kurikulum";
    }
    return "Sarpras"; // Fallback unit
  };

  const currentUnit = getAssignedUnit();

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let loaded: Complaint[] = [];
      try {
        const raw = await apiClient.complaints.getAll();
        loaded = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as { data?: unknown[] })?.data)
            ? (raw as { data?: Complaint[] }).data || []
            : [];
      } catch (err) {
        loaded = [];
      }
      setBackendComplaints(loaded);
    } catch (e) {
      toast.error("Gagal Memuat Keluhan");
    } finally {
      setIsLoading(false);
    }
  };

  // Set mounted
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch complaints
  useEffect(() => {
    if (
      mounted &&
      isAuthenticated &&
      (user?.role === "UNIT_PIC" || user?.role === "UNIT_MEMBER" || user?.role === "SUPERADMIN")
    ) {
      const timer = setTimeout(() => {
        fetchComplaints();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated, user]);

  // Merge and normalize data matching Figma screenshot layout
  const getMergedComplaints = (): ExtendedFeedComplaint[] => {
    const unitFilteredBackend = backendComplaints.filter((c) => c.unit === currentUnit || !c.unit);

    // Map backend complaints to extended structure
    const mappedBackend = unitFilteredBackend.map((bc) => {
      const hash = bc.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const val = hash % 3;
      const priority = val === 0 ? "Tinggi" : val === 1 ? "Sedang" : "Rendah";
      
      // Determine time context label
      const timeDiff = Date.now() - new Date(bc.createdAt).getTime();
      let formattedTime = "Beberapa hari lalu";
      if (timeDiff < 86400000) {
        formattedTime = "Hari ini, " + new Date(bc.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      } else if (timeDiff < 172800000) {
        formattedTime = "Kemarin, " + new Date(bc.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }

      return {
        ...bc,
        priority,
        category: bc.category || "Fasilitas Fisik",
        reporterName: bc.reporter?.name || "Anonim",
        reporterRole: bc.reporter?.id ? "Siswa" : "Aspiran Umum",
        reporterAvatar: bc.reporter?.avatarUrl,
        customId: `REQ-${new Date(bc.createdAt).getFullYear()}-${bc.id.slice(0, 3).toUpperCase()}`,
        formattedTime
      };
    });

    // Map mockup complaints
    const mappedMockup = FIGMA_FEED_COMPLAINTS.map((mc) => {
      const timeDiff = Date.now() - new Date(mc.createdAt).getTime();
      let formattedTime = "Beberapa hari lalu";
      if (mc.id === "REQ-2023-089") {
        formattedTime = "Hari ini, 09:15 AM";
      } else if (mc.id === "REQ-2023-087") {
        formattedTime = "Kemarin, 14:30 PM";
      }

      return {
        ...mc,
        reporterName: mc.reporter.name,
        reporterRole: mc.reporter.role,
        reporterAvatar: mc.reporter.avatarUrl,
        customId: mc.id,
        formattedTime
      };
    });

    // Merge them and avoid duplicating by title
    const merged: ExtendedFeedComplaint[] = [...mappedBackend];
    mappedMockup.forEach((mc) => {
      if (!merged.some((bc) => bc.title === mc.title)) {
        merged.push(mc as unknown as ExtendedFeedComplaint);
      }
    });

    return merged;
  };

  const allComplaints = getMergedComplaints();

  // Tab filter categories
  const countAll = allComplaints.length;
  const countNew = allComplaints.filter((c) => c.status === "NEW").length;
  const countProgress = allComplaints.filter((c) => c.status === "IN_PROGRESS").length;
  const countClosed = allComplaints.filter((c) => c.status === "CLOSED").length;

  const filteredComplaints = allComplaints.filter((c) => {
    // Tab checks
    const matchesTab =
      activeTab === "Semua" ||
      (activeTab === "Baru" && c.status === "NEW") ||
      (activeTab === "Diproses" && c.status === "IN_PROGRESS") ||
      (activeTab === "Selesai" && c.status === "CLOSED");

    // Search checks
    const keyword = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !keyword ||
      c.title.toLowerCase().includes(keyword) ||
      c.description.toLowerCase().includes(keyword) ||
      c.customId?.toLowerCase().includes(keyword) ||
      c.reporterName.toLowerCase().includes(keyword);

    return matchesTab && matchesSearch;
  });

  const handleOpenActionModal = (complaint: ExtendedFeedComplaint) => {
    setSelectedComplaint(complaint);
    setReplyText("");
    setReplyStatus(complaint.status === "NEW" ? "IN_PROGRESS" : "CLOSED");
    setIsModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedComplaint) return;

    toast.promise(
      (async () => {
        try {
          // If it is a real database complaint, update it
          if (!selectedComplaint.id.startsWith("REQ-")) {
            await apiClient.comments.create(selectedComplaint.id, {
              content: replyText,
            });
          }

          // Mock state change
          setBackendComplaints((prev) =>
            prev.map((c) =>
              c.id === selectedComplaint.id ? { ...c, status: replyStatus } : c
            )
          );

          // Update mockup item
          if (selectedComplaint.id.startsWith("REQ-")) {
            const index = FIGMA_FEED_COMPLAINTS.findIndex((f) => f.id === selectedComplaint.id);
            if (index !== -1) {
              FIGMA_FEED_COMPLAINTS[index].status = replyStatus;
            }
          }

          setIsModalOpen(false);
          fetchComplaints();
        } catch (err) {
          throw err;
        }
      })(),
      {
        loading: "Memperbarui status keluhan unit...",
        success: "Tanggapan resmi berhasil dikirim!",
        error: "Gagal memproses tanggapan.",
      }
    );
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar dari portal");
    router.push("/");
  };

  if (!mounted || !isAuthenticated || (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN")) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f9f9f9]">
      
      {/* ─── LEFT SIDEBAR (Dark UI) ─── */}
      <UnitSidebar activeTab="keluhan" />

      {/* ─── MAIN WORKSPACE ─── */}
      <div className="flex-grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">
        
        {/* Scrollable workspace */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Keluhan Masuk Unit</h1>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Kelola dan respon laporan yang ditugaskan ke departemen Anda.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="Cari ID atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 transition-all font-medium shadow-2xs"
              />
            </div>
          </div>

          {/* Status Capsule Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { label: "Semua", count: countAll },
              { label: "Baru", count: countNew },
              { label: "Diproses", count: countProgress },
              { label: "Selesai", count: countClosed },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label as "Semua" | "Baru" | "Diproses" | "Selesai");
                  setVisibleCount(5);
                }}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border select-none",
                  activeTab === tab.label
                    ? "bg-[#b61722] border-[#b61722] text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Complaint Cards Feed List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#b61722]" />
                <span className="text-xs text-slate-400 mt-2 font-medium">Memuat daftar keluhan unit...</span>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-2">
                <Building className="h-10 w-10 text-slate-350 opacity-60" />
                <h3 className="text-sm font-bold text-slate-700">Daftar Keluhan Kosong</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Tidak ada keluhan masuk yang sesuai dengan filter pencarian atau kategori Anda saat ini.
                </p>
              </div>
            ) : (
              filteredComplaints.slice(0, visibleCount).map((c) => {
                const isNew = c.status === "NEW" || c.status === "WAITING_RESPONSE";
                const isProgress = c.status === "IN_PROGRESS";
                const isClosed = c.status === "CLOSED";

                let statusBadgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
                let statusLabel = "Baru";
                if (c.status === "WAITING_RESPONSE") {
                  statusBadgeClass = "bg-rose-50 text-rose-600 border border-rose-200";
                  statusLabel = "Belum Direspon";
                } else if (c.status === "IN_PROGRESS") {
                  statusBadgeClass = "bg-orange-50 text-orange-600 border border-orange-200";
                  statusLabel = "Diproses";
                } else if (c.status === "CLOSED") {
                  statusBadgeClass = "bg-slate-100 text-slate-500 border border-slate-200";
                  statusLabel = "Selesai";
                }

                let priorityClass = "border-slate-200 text-slate-500 bg-slate-50/50";
                if (c.priority === "Tinggi") {
                  priorityClass = "border-red-200 text-red-600 bg-red-50/30";
                } else if (c.priority === "Sedang") {
                  priorityClass = "border-slate-300 text-slate-700 bg-white";
                }

                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/complaints/${c.id}`)}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col lg:flex-row justify-between gap-6 shadow-xs hover:shadow-md transition-all duration-200 hover:border-slate-350 cursor-pointer hover:bg-slate-50/10"
                  >
                    
                    {/* Left Column: Complaint Details */}
                    <div className="flex-1 space-y-3.5">
                      
                      {/* ID, Timestamp & Options */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-extrabold text-[#b61722] font-mono tracking-wider">
                            #{c.customId}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-400">
                            {c.formattedTime}
                          </span>
                        </div>

                        {/* Dropdown Options Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Laporan #${c.customId} terpilih`);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Complaint Title */}
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-800 leading-snug">
                        {c.title}
                      </h2>

                      {/* Attribute Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-extrabold border uppercase tracking-wider",
                          priorityClass
                        )}>
                          ! Prioritas {c.priority}
                        </span>
                        
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                          statusBadgeClass
                        )}>
                          {statusLabel}
                        </span>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                          {c.category}
                        </span>
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                        {c.description}
                      </p>

                    </div>

                    {/* Right Column: Reporter Details & Actions */}
                    <div className="lg:w-60 shrink-0 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between gap-6 pt-4 lg:pt-0">
                      
                      {/* Reporter Information */}
                      <div className="flex items-center gap-3">
                        {c.reporterAvatar ? (
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.reporterAvatar} alt={c.reporterName} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-[#b61722]/10 border border-[#b61722]/20 text-[#b61722] flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase">
                            {c.reporterName.slice(0, 2)}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-800 text-xs leading-none">
                            {c.reporterName}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {c.reporterRole}
                          </span>
                        </div>
                      </div>

                      {/* Conditional Action Buttons */}
                      <div className="w-full">
                        {isNew && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenActionModal(c);
                            }}
                            className="w-full h-10 bg-[#b61722] hover:bg-[#a7151e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                          >
                            <span>Respon Sekarang</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}

                        {isProgress && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenActionModal(c);
                            }}
                            className="w-full h-10 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
                          >
                            <span>Perbarui Status</span>
                          </button>
                        )}

                        {isClosed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/complaints/${c.id}`);
                            }}
                            className="w-full h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
                          >
                            <span>Lihat Detail</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Load More Button */}
          {filteredComplaints.length > visibleCount && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="h-10 px-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-655 text-xs font-bold flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95"
              >
                <span>Muat Lebih Banyak</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* ─── REPLY & UPDATE STATUS MODAL ─── */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Tanggapi Resmi Laporan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Judul Keluhan</span>
              <span className="block font-bold text-slate-800 text-xs">{selectedComplaint.title}</span>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 pt-2">
              
              {/* official response text */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                  Tanggapan Resmi Unit Kerja
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ketik tanggapan resmi dari perwakilan unit terkait penanganan keluhan ini..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-250 bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* next status selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                  Ubah Status Keluhan Menjadi
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as ComplaintStatus)}
                  className="h-10 w-full rounded-xl border border-slate-250 bg-white px-3 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="IN_PROGRESS">Sedang Diproses (Penanganan)</option>
                  <option value="CLOSED">Selesai (Ditutup &amp; Selesai)</option>
                </select>
              </div>

              {/* buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-xl transition-all text-xs cursor-pointer active:scale-[0.98] flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#b61722] hover:bg-[#a7151e] text-white font-bold rounded-xl transition-all text-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1 shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
