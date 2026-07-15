"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import {
  Loader2,
  Mail,
  FileText,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Download,
  Eye,
  CornerUpLeft,
  Search,
  LogOut,
  HelpCircle,
  Settings as SettingsIcon,
  User,
  PlusCircle,
  Folder,
  Bell,
  LayoutDashboard,
  Building,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  X
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintUnit, ComplaintVisibility, ComplaintStatus } from "@/types/complaint";
import { Comment } from "@/types/comment";
import UnitSidebar from "@/components/dashboard/UnitSidebar";
import { cn } from "@/lib/utils";

// ─── Mockup Complaints from Figma Screenshot ──────────────────────────────────
const FIGMA_MOCKUP_COMPLAINTS = [
  {
    id: "cmp-1042",
    title: "AC Lab Komputer 2 Mati",
    description: "Kondisi AC yang sering mati di laboratorium sangat mengganggu konsentrasi belajar saat praktikum berlangsung hampir setiap hari.",
    unit: "Sarpras" as ComplaintUnit,
    status: "NEW" as ComplaintStatus,
    isAnonymous: false,
    createdAt: "2023-10-12T08:00:00.000Z",
    supports: 842,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "student-1", name: "Ahmad S. (Siswa)" },
    priority: "Tinggi"
  },
  {
    id: "cmp-1038",
    title: "Pintu Toilet Lantai 3 Rusak",
    description: "Engsel pintu toilet patah sehingga pintu tidak bisa ditutup rapat, mengganggu kenyamanan civitas sekolah.",
    unit: "Sarpras" as ComplaintUnit,
    status: "IN_PROGRESS" as ComplaintStatus,
    isAnonymous: false,
    createdAt: "2023-10-10T09:30:00.000Z",
    supports: 650,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "teacher-1", name: "Budi Santoso (Guru)" },
    priority: "Sedang"
  },
  {
    id: "cmp-1035",
    title: "Proyektor Kelas X-A Buram",
    description: "Lensa proyektor berdebu tebal di bagian dalam sehingga proyeksi materi pelajaran tidak terlihat jelas dari bangku belakang.",
    unit: "Sarpras" as ComplaintUnit,
    status: "WAITING_RESPONSE" as ComplaintStatus,
    isAnonymous: false,
    createdAt: "2023-10-09T14:15:00.000Z",
    supports: 412,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "student-2", name: "Siti Aminah (Siswa)" },
    priority: "Sedang"
  },
  {
    id: "cmp-1020",
    title: "Kursi Patah di Perpustakaan",
    description: "Beberapa kursi kayu di area baca perpustakaan patah kakinya, membahayakan siswa yang berkunjung.",
    unit: "Sarpras" as ComplaintUnit,
    status: "CLOSED" as ComplaintStatus,
    isAnonymous: false,
    createdAt: "2023-10-05T10:00:00.000Z",
    supports: 120,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "librarian-1", name: "Pustakawan" },
    priority: "Rendah"
  }
];

interface ExtendedComplaint extends Complaint {
  priority: string;
  reporterName: string;
}

export default function UnitDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Core collections
  const [backendComplaints, setBackendComplaints] = useState<Complaint[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<ComplaintStatus>("IN_PROGRESS");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [activeComplaintForReply, setActiveComplaintForReply] = useState<ExtendedComplaint | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [priorityFilter, setPriorityFilter] = useState("Semua Prioritas");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [statusFilter]);

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

  // Check auth
  useEffect(() => {
    if (
      mounted &&
      (!isAuthenticated ||
        (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN"))
    ) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load complaints
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

  // Merge dynamic backend complaints with our screenshot mockup data
  const getMergedComplaints = () => {
    const unitFilteredBackend = backendComplaints.filter((c) => c.unit === currentUnit || !c.unit);

    // Map backend complaints to include a stable hash priority
    const mappedBackend = unitFilteredBackend.map((bc) => {
      const hash = bc.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const val = hash % 3;
      const priority = val === 0 ? "Tinggi" : val === 1 ? "Sedang" : "Rendah";
      return {
        ...bc,
        priority,
        reporterName: bc.reporter?.name || "Anonim",
      };
    });

    // Map mockup complaints
    const mappedMockup = FIGMA_MOCKUP_COMPLAINTS.map((mc) => ({
      ...mc,
      reporterName: mc.reporter.name,
    }));

    // Merge them together preventing duplication
    const merged = [...mappedBackend];
    mappedMockup.forEach((mc) => {
      if (!merged.some((bc) => bc.id === mc.id || bc.title === mc.title)) {
        merged.push(mc as unknown as ExtendedComplaint);
      }
    });

    return merged;
  };

  const allComplaints = getMergedComplaints();

  // Stats calculation
  const statsNew = allComplaints.filter((c) => c.status === "NEW").length;
  const statsWaiting = allComplaints.filter((c) => c.status === "WAITING_RESPONSE").length;
  const statsProgress = allComplaints.filter((c) => c.status === "IN_PROGRESS").length;
  const statsClosed = allComplaints.filter((c) => c.status === "CLOSED").length;

  // Filter logic
  const filteredComplaints = allComplaints.filter((c) => {
    // Status translation
    let statusLabel = "Baru";
    if (c.status === "WAITING_RESPONSE") statusLabel = "Belum Direspon";
    else if (c.status === "IN_PROGRESS") statusLabel = "Diproses";
    else if (c.status === "CLOSED") statusLabel = "Selesai";

    const matchesStatus = statusFilter === "Semua Status" || statusLabel === statusFilter;
    const matchesPriority = priorityFilter === "Semua Prioritas" || c.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  // Pagination math
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const handleDownloadReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Mempersiapkan rangkuman laporan unit...",
        success: "Laporan bulanan unit berhasil diunduh (PDF)!",
        error: "Gagal memproses pengunduhan."
      }
    );
  };

  const handleOpenReplyModal = (complaint: ExtendedComplaint) => {
    setActiveComplaintForReply(complaint);
    setReplyText("");
    setReplyStatus(complaint.status === "NEW" ? "IN_PROGRESS" : "CLOSED");
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeComplaintForReply) return;

    toast.promise(
      (async () => {
        try {
          // Send to API if it is a real backend complaint
          if (!activeComplaintForReply.id.startsWith("cmp-")) {
            await apiClient.comments.create(activeComplaintForReply.id, {
              content: replyText,
            });
          }

          // Update local status mock in state
          setBackendComplaints((prev) =>
            prev.map((c) =>
              c.id === activeComplaintForReply.id
                ? { ...c, status: replyStatus }
                : c
            )
          );

          // Modify active item if it is a mockup entry
          if (activeComplaintForReply.id.startsWith("cmp-")) {
            const matchIndex = FIGMA_MOCKUP_COMPLAINTS.findIndex(m => m.id === activeComplaintForReply.id);
            if (matchIndex !== -1) {
              FIGMA_MOCKUP_COMPLAINTS[matchIndex].status = replyStatus;
            }
          }

          setIsReplyModalOpen(false);
          fetchComplaints();
        } catch (err) {
          throw err;
        }
      })(),
      {
        loading: "Mengirim tanggapan resmi unit...",
        success: "Tanggapan berhasil dikirim dan status diperbarui!",
        error: "Gagal memperbarui status keluhan."
      }
    );
  };

  // Indonesian date formatter
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "12 Okt 2023";
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

      {/* ─── LEFT SIDEBAR (Dark UI) ─── */}
      <UnitSidebar activeTab="dashboard" />

      {/* ─── MAIN WORKSPACE ─── */}
      <div className="flex-grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard Unit {currentUnit}</h1>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Ringkasan dan manajemen keluhan infrastruktur sekolah.</p>
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Keluhan Baru */}
            <div
              onClick={() => setStatusFilter(statusFilter === "Baru" ? "Semua Status" : "Baru")}
              className={cn(
                "bg-white rounded-3xl border p-5 shadow-xs flex items-center justify-between border-l-[5px] transition-all cursor-pointer hover:bg-slate-50/50 hover:scale-102",
                statusFilter === "Baru" ? "border-l-slate-600 border-slate-350 shadow-sm" : "border-slate-200/80 border-l-slate-400"
              )}
            >
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-450">Keluhan Baru</span>
                <span className="block text-3xl font-extrabold text-slate-800 leading-tight">{statsNew}</span>
                <span className="block text-[10px] text-slate-400 font-bold">+3 hari ini</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shadow-2xs">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            {/* Card 2: Belum Direspon */}
            <div
              onClick={() => setStatusFilter(statusFilter === "Belum Direspon" ? "Semua Status" : "Belum Direspon")}
              className={cn(
                "bg-white rounded-3xl border p-5 shadow-xs flex items-center justify-between border-l-[5px] transition-all cursor-pointer hover:bg-slate-50/50 hover:scale-102",
                statusFilter === "Belum Direspon" ? "border-l-amber-600 border-slate-350 shadow-sm" : "border-slate-200/80 border-l-amber-500"
              )}
            >
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-450">Belum Direspon</span>
                <span className="block text-3xl font-extrabold text-slate-800 leading-tight">{statsWaiting}</span>
                <span className="block text-[10px] text-red-650 font-bold">Perlu aksi segera</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-2xs">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            {/* Card 3: Sedang Diproses */}
            <div
              onClick={() => setStatusFilter(statusFilter === "Diproses" ? "Semua Status" : "Diproses")}
              className={cn(
                "bg-white rounded-3xl border p-5 shadow-xs flex items-center justify-between border-l-[5px] transition-all cursor-pointer hover:bg-slate-50/50 hover:scale-102",
                statusFilter === "Diproses" ? "border-l-orange-600 border-slate-350 shadow-sm" : "border-slate-200/80 border-l-orange-550"
              )}
            >
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-450">Sedang Diproses</span>
                <span className="block text-3xl font-extrabold text-slate-800 leading-tight">{statsProgress}</span>
                <span className="block text-[10px] text-slate-400 font-bold">Dalam penanganan</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-555 shadow-2xs">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>

            {/* Card 4: Selesai Bulan Ini */}
            <div
              onClick={() => setStatusFilter(statusFilter === "Selesai" ? "Semua Status" : "Selesai")}
              className={cn(
                "bg-white rounded-3xl border p-5 shadow-xs flex items-center justify-between border-l-[5px] transition-all cursor-pointer hover:bg-slate-50/50 hover:scale-102",
                statusFilter === "Selesai" ? "border-l-red-700 border-slate-350 shadow-sm" : "border-slate-200/80 border-l-red-600"
              )}
            >
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-450">Selesai Bulan Ini</span>
                <span className="block text-3xl font-extrabold text-slate-800 leading-tight">{statsClosed}</span>
                <span className="block text-[10px] text-slate-400 font-bold">Resolusi 92%</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-650 shadow-2xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">

            {/* Table Header Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Daftar Keluhan Masuk</h2>

              {/* Dropdowns */}
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-slate-250 bg-white px-3.5 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer transition-all"
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Baru">Baru</option>
                  <option value="Belum Direspon">Belum Direspon</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Table Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-slate-450 font-bold text-[11px] uppercase border-b border-slate-100 pb-3">
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
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#b61722]" />
                        Memuat data keluhan...
                      </td>
                    </tr>
                  ) : paginatedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold text-xs leading-relaxed">
                        <Building className="h-7 w-7 text-slate-350 mx-auto mb-2 opacity-50" />
                        Tidak ada keluhan masuk yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map((c) => {
                      const isClosed = c.status === "CLOSED";

                      // Status Label & Badge formatting
                      let statusText = "Baru";
                      let statusBadgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
                      if (c.status === "WAITING_RESPONSE") {
                        statusText = "Belum Direspon";
                        statusBadgeClass = "bg-rose-50 text-rose-600 border border-rose-200";
                      } else if (c.status === "IN_PROGRESS") {
                        statusText = "Diproses";
                        statusBadgeClass = "bg-orange-50 text-orange-600 border border-orange-200";
                      } else if (c.status === "CLOSED") {
                        statusText = "Selesai";
                        statusBadgeClass = "bg-slate-100 text-slate-500 border border-slate-200";
                      }

                      return (
                        <tr key={c.id} className="text-slate-700 text-xs hover:bg-slate-50/40 transition-all align-middle">
                          {/* ID */}
                          <td className="py-4 pl-2 font-bold text-slate-400 font-mono uppercase">
                            #{c.id.slice(0, 8)}
                          </td>

                          {/* Judul */}
                          <td className="py-4 pr-3 max-w-[220px]">
                            <span className={cn(
                              "block font-bold text-slate-800 leading-snug truncate",
                              isClosed && "line-through text-slate-400 font-medium"
                            )}>
                              {c.title}
                            </span>
                          </td>

                          {/* Pelapor */}
                          <td className="py-4 font-semibold text-slate-650">
                            {c.reporterName}
                          </td>

                          {/* Status */}
                          <td className="py-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                              statusBadgeClass
                            )}>
                              {statusText}
                            </span>
                          </td>

                          {/* Tanggal */}
                          <td className="py-4 font-semibold text-slate-500">
                            {formatDate(c.createdAt)}
                          </td>

                          {/* Aksi */}
                          <td className="py-4 text-right pr-2">
                            <div className="inline-flex items-center gap-2 justify-end">
                              {/* Detail button with optional notification badge for new/waiting complaints */}
                              <button
                                onClick={() => router.push(`/complaints/${c.id}`)}
                                className="relative h-8 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 shadow-3xs transition-all cursor-pointer active:scale-[0.96]"
                              >
                                {(c.status === "NEW" || c.status === "WAITING_RESPONSE") && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-650"></span>
                                  </span>
                                )}
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                <span>Detail</span>
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

            {/* Table Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
              <span>
                Menampilkan {filteredComplaints.length === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} dari {filteredComplaints.length} keluhan
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

      {/* ─── REPLY & UPDATE STATUS MODAL ─── */}
      {isReplyModalOpen && activeComplaintForReply && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">

            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Tanggapi Resmi Laporan</h3>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Judul Keluhan</span>
              <span className="block font-bold text-slate-800 text-xs">{activeComplaintForReply.title}</span>
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
                  onClick={() => setIsReplyModalOpen(false)}
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
