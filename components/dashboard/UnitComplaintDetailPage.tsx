"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import {
  Loader2,
  ArrowLeft,
  ChevronDown,
  Globe,
  User as UserIcon,
  Calendar,
  MoreVertical,
  MessageSquare,
  Building2,
  RefreshCw,
  Clock,
  LayoutDashboard,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Send,
  PlusCircle,
  Folder,
  Bell,
  Upload,
  X,
  Share2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  HeartHandshake,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintStatus, TimelineEvent, ComplaintVisibility, ComplaintUnit } from "@/types/complaint";
import { Comment } from "@/types/comment";
import { cn } from "@/lib/utils";
import UnitSidebar from "@/components/dashboard/UnitSidebar";

// ─── Extended Figma Mock Details ──────────────────────────────────────────────


interface ExtendedComplaint extends Complaint {
  priority: string;
  category: string;
  pic?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  attachments?: string[];
  timeline?: TimelineEvent[];
  comments?: Comment[];
}

export default function UnitComplaintDetailPage({ complaintId }: { complaintId: string }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [complaint, setComplaint] = useState<ExtendedComplaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  // Forward Modal State
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardUnitId, setForwardUnitId] = useState("");
  const [forwardNote, setForwardNote] = useState("");

  const loadComplaintData = async () => {
    setIsLoading(true);
    try {
      let activeDetail: ExtendedComplaint | null = null;

      try {
        const raw = await apiClient.complaints.getById(complaintId);
        const hash = raw.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const val = hash % 3;
        const priority = val === 0 ? "Tinggi" : val === 1 ? "Sedang" : "Rendah";

        activeDetail = {
          ...raw,
          priority,
          category: raw.category || "Fasilitas Fisik",
          pic: {
            name: "Rahmat Hidayat",
            role: "Teknisi Senior - Sarpras",
            avatarUrl: "/images/rahmat_hidayat.png"
          },
          timeline: raw.timeline || [
            {
              id: "t1",
              title: "Masuk ke Unit",
              description: "Sistem meneruskan keluhan secara otomatis.",
              createdAt: raw.createdAt
            },
            {
              id: "t2",
              title: "Keluhan Dibuat",
              description: `ID Keluhan: #${raw.id.slice(0, 8)}`,
              createdAt: raw.createdAt
            }
          ],
          comments: []
        };
      } catch (err) {
        console.error("Failed to load complaint by ID:", err);
      }

      if (!activeDetail) {
        toast.error("Keluhan tidak ditemukan");
        router.push("/dashboard");
        return;
      }

      setComplaint(activeDetail);

      // Load comments
      let loadedComments: Comment[] = [];
      try {
        loadedComments = await apiClient.comments.getByComplaintId(complaintId);
      } catch (err) {
        loadedComments = [];
      }
      setComments(loadedComments);

    } catch (e) {
      toast.error("Gagal memuat detail keluhan");
    } finally {
      setIsLoading(false);
    }
  };

  // Set mounted
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch detail
  useEffect(() => {
    if (mounted && isAuthenticated && complaintId) {
      const timer = setTimeout(() => {
        loadComplaintData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated, complaintId]);

  // Auto-scroll to reply form if hash #reply-form-section is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#reply-form-section" && !isLoading) {
      const timer = setTimeout(() => {
        const replyEl = document.getElementById("reply-form-section");
        if (replyEl) {
          replyEl.scrollIntoView({ behavior: "smooth", block: "center" });
          const textarea = replyEl.querySelector("textarea");
          if (textarea) textarea.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !complaint) return;

    toast.promise(
      (async () => {
        try {
          const isMock = complaintId.toLowerCase().includes("cmp-") || complaintId.toLowerCase().includes("req-") || complaintId.toLowerCase().includes("0892");

          if (!isMock) {
            await apiClient.comments.create(complaint.id, {
              content: replyText,
            });
          }

          // Append comment locally
          const newComment: Comment = {
            id: `local-c-${Date.now()}`,
            complaintId: complaint.id,
            content: replyText,
            isPic: true,
            createdAt: new Date().toISOString(),
            user: {
              id: user?.id || "pic-sarpras",
              name: "Unit Sarpras",
              email: user?.email || "pic_sarpras@moklet.org",
              role: "UNIT_PIC",
            }
          };

          setComments((prev) => [...prev, newComment]);

          setComments((prev) => [...prev, newComment]);

          // Append timeline event for response
          setComplaint((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              timeline: [
                {
                  id: `t-local-${Date.now()}`,
                  title: "Unit Memberi Respon",
                  description: "Tanggapan resmi dikirim oleh unit.",
                  createdAt: new Date().toISOString()
                },
                ...(prev.timeline || [])
              ]
            };
          });

          setReplyText("");
          toast.success("Tanggapan resmi unit terkirim!");
        } catch (err) {
          throw err;
        }
      })(),
      {
        loading: "Mengirim tanggapan resmi...",
        success: "Respon resmi terkirim dan status diperbarui!",
        error: "Gagal mengirimkan respon resmi."
      }
    );
  };

  const handleStatusTransition = async (nextStatus: ComplaintStatus) => {
    if (!complaint) return;
    toast.promise(
      (async () => {
        try {
          const isMock = complaintId.toLowerCase().includes("cmp-") || complaintId.toLowerCase().includes("req-") || complaintId.toLowerCase().includes("0892");

          // Update local status mock in state
          setComplaint((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: nextStatus,
              timeline: [
                {
                  id: `t-local-${Date.now()}`,
                  title: nextStatus === "CLOSED" ? "Keluhan Ditutup" : "Status Diperbarui",
                  description: `Status diubah oleh PIC menjadi ${nextStatus}.`,
                  createdAt: new Date().toISOString()
                },
                ...(prev.timeline || [])
              ]
            };
          });
        } catch (err) {
          throw err;
        }
      })(),
      {
        loading: "Memperbarui status...",
        success: `Status berhasil diubah menjadi ${nextStatus}!`,
        error: "Gagal memperbarui status."
      }
    );
  };

  const handleForwardComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardUnitId || !complaint) return;

    toast.promise(
      (async () => {
        const isMock = complaintId.toLowerCase().includes("cmp-") || complaintId.toLowerCase().includes("req-") || complaintId.toLowerCase().includes("0892");
        if (!isMock) {
          await apiClient.complaints.forward(complaint.id, {
            toUnitId: forwardUnitId,
            forwardNote: forwardNote
          });
        }
        setIsForwardModalOpen(false);
        toast.success(`Keluhan berhasil diteruskan ke Unit ID: ${forwardUnitId}`);
        router.push("/unit/complaints");
      })(),
      {
        loading: "Meneruskan keluhan...",
        success: "Keluhan berhasil didelegasikan ulang!",
        error: "Gagal meneruskan keluhan."
      }
    );
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar dari portal");
    router.push("/");
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "10:15";
    }
  };

  const formatDateShort = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return "12 Okt";
    }
  };

  const formatFullDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "12 Okt 2026";
    }
  };

  if (!mounted || !isAuthenticated || (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN")) {
    return null;
  }

  if (isLoading || !complaint) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const timelineList = (isTimelineExpanded ? complaint.timeline : complaint.timeline?.slice(0, 3)) || [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f9f9f9]">

      {/* ─── LEFT SIDEBAR (Dark UI) ─── */}
      <UnitSidebar activeTab="keluhan" />

      {/* ─── MAIN WORKSPACE ─── */}
      <div className="flex-grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6">

          {/* Breadcrumbs Row */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <button onClick={() => router.push("/dashboard")} className="hover:text-red-500 transition-colors">Dashboard Unit</button>
            <span>&gt;</span>
            <button onClick={() => router.push("/unit/complaints")} className="hover:text-red-500 transition-colors">Keluhan Masuk</button>
            <span>&gt;</span>
            <span className="text-slate-500">Detail Keluhan</span>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Detail Keluhan</h1>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Kelola keluhan yang masuk ke unit Anda.</p>
            </div>
          </div>

          {/* Split Content Grid (2/3 Left, 1/3 Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ─── LEFT COLUMN (2/3) ─── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Card 1: Summary */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">

                {/* Badges */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200">
                    {complaint.status}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Publik
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                  {complaint.title}
                </h2>

                {/* Meta details */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Terkait</span>
                    <span className="block font-bold text-slate-700">Sarana &amp; Prasarana (Sarpras)</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Dibuat</span>
                    <span className="block font-bold text-slate-700">{formatFullDate(complaint.createdAt)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pelapor</span>
                    <span className="block font-bold text-slate-750 flex items-center gap-1">
                      <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      {complaint.isAnonymous ? "Anonim" : (complaint.reporter?.name || "Pelapor")}
                    </span>
                  </div>
                </div>

              </div>

              {/* Card 2: Description */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Keluhan</span>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {complaint.description}
                </p>
              </div>

              {/* Card 3: Attachments */}
              {complaint.evidenceUrl && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lampiran Bukti</span>

                  <div className="max-w-md h-56 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-3xs group cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={complaint.evidenceUrl}
                      alt="Lampiran Bukti"
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      onClick={() => window.open(complaint.evidenceUrl, "_blank")}
                    />
                  </div>
                </div>
              )}

              {/* Card 4: Discussion & Responses */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diskusi &amp; Tanggapan</span>

                <div className="space-y-4">
                  {comments.map((comment) => {
                    const isOfficial = comment.isPic;
                    return (
                      <div
                        key={comment.id}
                        className={cn(
                          "p-4 rounded-2xl text-xs space-y-2 max-w-[90%] border shadow-3xs",
                          isOfficial
                            ? "bg-red-50/50 border-red-200/60 rounded-tr-none ml-auto"
                            : "bg-white border-slate-100 rounded-tl-none mr-auto"
                        )}
                      >
                        <div className="flex items-center justify-between gap-6">
                          <span className="font-bold text-slate-800">
                            {comment.user?.name || "Anonim"}
                          </span>

                          {isOfficial && (
                            <span className="px-2 py-0.5 bg-[#b61722] text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md">
                              Respon Resmi Unit
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 leading-relaxed font-semibold">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 5: Action Reply Form */}
              <div id="reply-form-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Kirim Tanggapan Unit</span>

                <form onSubmit={handleSendReply} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">Tanggapan Unit</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tuliskan respon atau update terbaru mengenai penanganan keluhan ini..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-3.5 text-xs rounded-xl border border-slate-250 bg-white focus:outline-none focus:border-red-400 font-medium"
                    />
                  </div>

                  {/* Attachment upload */}
                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">Lampiran Pendukung (Opsional)</label>
                    <button
                      type="button"
                      onClick={() => toast.info("Mengunggah foto bukti...")}
                      className="h-10 w-full border border-dashed border-slate-350 hover:bg-slate-50 text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Foto/Dokumen Bukti</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="h-11 px-6 bg-[#b61722] hover:bg-[#a7151e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Send className="h-4 w-4" />
                      <span>Kirim Respon</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>

            {/* ─── RIGHT COLUMN (1/3) ─── */}
            <div className="space-y-6">

              {/* Card 1: Status & Control */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status &amp; Kontrol</span>

                {/* Status Block */}
                {(() => {
                  let displayStatus = "BARU";
                  let bgClass = "bg-sky-50 border-sky-200/80 text-sky-700";
                  let dotClass = "bg-sky-500";
                  if (complaint.status === "WAITING_RESPONSE") {
                    displayStatus = "BELUM DIRESPON";
                    bgClass = "bg-rose-50 border-rose-200/80 text-rose-700";
                    dotClass = "bg-rose-500";
                  } else if (complaint.status === "IN_PROGRESS") {
                    displayStatus = "SEDANG DIPROSES";
                    bgClass = "bg-amber-50 border-amber-200/80 text-amber-800";
                    dotClass = "bg-amber-500 animate-pulse";
                  } else if (complaint.status === "CLOSED") {
                    displayStatus = "SELESAI";
                    bgClass = "bg-emerald-50 border-emerald-200/80 text-emerald-800";
                    dotClass = "bg-emerald-500";
                  }

                  return (
                    <div className={cn("rounded-2xl p-4 border text-center relative overflow-hidden transition-all", bgClass)}>
                      <span className="block text-[9px] font-bold uppercase tracking-widest opacity-70">Status Saat Ini</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", dotClass)} />
                        <span className="text-sm font-extrabold tracking-wider uppercase">
                          {displayStatus}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* PIC Info */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PIC Unit Bertanggung Jawab</span>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-extrabold text-xs shrink-0 select-none shadow-3xs">
                      RH
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-bold text-slate-800 text-xs leading-none">Rahmat Hidayat</span>
                      <span className="block text-[10px] text-slate-400 font-bold">Teknisi Senior - Sarpras</span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <button
                    disabled={complaint.status === "IN_PROGRESS" || complaint.status === "CLOSED"}
                    onClick={() => handleStatusTransition("IN_PROGRESS")}
                    className="w-full h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Proses Laporan</span>
                  </button>

                  <button
                    onClick={() => setIsForwardModalOpen(true)}
                    className="w-full h-11 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Share2 className="h-4 w-4 text-slate-500" />
                    <span>Teruskan (Forward)</span>
                  </button>

                  <button
                    disabled={complaint.status === "CLOSED"}
                    onClick={() => handleStatusTransition("CLOSED")}
                    className="w-full h-11 bg-white hover:bg-red-50/50 disabled:opacity-40 disabled:cursor-not-allowed border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <CheckCircle className="h-4 w-4 text-red-600" />
                    <span>Tutup Keluhan</span>
                  </button>
                </div>

              </div>

              {/* Card 2: Process Audit Trail */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Riwayat Proses</span>

                {/* Timeline */}
                <div className="relative border-l border-slate-100 pl-4.5 space-y-5 ml-1 pt-1.5 pb-1">
                  {timelineList.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative space-y-1">

                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute left-[-22px] top-1.5 h-2.5 w-2.5 rounded-full border border-white shrink-0",
                        idx === 0 ? "bg-red-600" : "bg-slate-300"
                      )} />

                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{formatDateShort(evt.createdAt)} - {formatTime(evt.createdAt)}</span>
                      </div>

                      <h4 className="font-extrabold text-slate-800 text-xs leading-tight">
                        {evt.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-450 font-medium leading-relaxed">
                        {evt.description}
                      </p>

                    </div>
                  ))}
                </div>

                {complaint.timeline && complaint.timeline.length > 3 && (
                  <div className="text-center pt-2 border-t border-slate-50">
                    <button
                      onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                      className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <span>{isTimelineExpanded ? "Sembunyikan Log" : "Lihat Log Lengkap"}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isTimelineExpanded && "rotate-180")} />
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ─── FORWARD / DELEGASI MODAL ─── */}
      {isForwardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-1">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 shadow-3xs">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Teruskan / Delegasikan Laporan</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Pindahkan alokasi penanganan ke unit kerja yang sesuai</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForwardModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Complaint Context Summary */}
            {complaint && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Judul Keluhan</span>
                  <span className="block font-bold text-slate-800 truncate">{complaint.title}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">ID Keluhan</span>
                  <span className="inline-block px-2 py-0.5 bg-slate-200/70 text-slate-700 font-mono font-bold rounded-md text-[10px]">
                    #{complaint.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleForwardComplaint} className="space-y-5">

              {/* Unit Selection Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
                    Pilih Unit Kerja Tujuan <span className="text-red-500">*</span>
                  </label>
                  {forwardUnitId && (
                    <span className="text-[10px] text-red-600 font-bold">Terpilih: {forwardUnitId}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "Sarpras",
                      name: "Sarana & Prasarana",
                      description: "Gedung, peralatan & infrastruktur",
                      icon: Building2,
                    },
                    {
                      id: "Kesiswaan",
                      name: "Kesiswaan",
                      description: "Kedisiplinan, OSIS & kegiatan siswa",
                      icon: Users,
                    },
                    {
                      id: "Kurikulum",
                      name: "Kurikulum",
                      description: "Akademik, jadwal kelas & ujian",
                      icon: BookOpen,
                    },
                    {
                      id: "Hubin",
                      name: "Hubin / Humas",
                      description: "Hubungan industri & PKL",
                      icon: Briefcase,
                    },
                    {
                      id: "Tata Usaha",
                      name: "Tata Usaha (TU)",
                      description: "Administrasi & keuangan",
                      icon: FileText,
                    },
                    {
                      id: "BK",
                      name: "Bimbingan Konseling",
                      description: "Konseling & bimbingan siswa",
                      icon: HeartHandshake,
                    },
                  ].map((unit) => {
                    const IconComp = unit.icon;
                    const isSelected = forwardUnitId === unit.id;
                    return (
                      <div
                        key={unit.id}
                        onClick={() => setForwardUnitId(unit.id)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative select-none",
                          isSelected
                            ? "border-2 border-red-600 bg-red-50/40 shadow-xs"
                            : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isSelected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0 pr-4">
                          <span className={cn("block text-xs font-bold leading-tight", isSelected ? "text-red-950" : "text-slate-800")}>
                            {unit.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 leading-snug line-clamp-2">
                            {unit.description}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-3xs">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Reasons */}
              <div className="space-y-2">
                <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
                  Alasan Pendelegasian (Pilih Cepat)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Salah Alokasi Unit",
                    "Membutuhkan Penanganan Khusus",
                    "Eskalasi Lanjutan",
                    "Koordinasi Lintas Unit",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setForwardNote((prev) => prev ? `${prev} | ${chip}` : chip)}
                      className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200/80 hover:border-red-200 text-slate-600 font-semibold text-[11px] rounded-lg transition-all cursor-pointer active:scale-95"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
                  Catatan Tambahan untuk Unit Kerja Target
                </label>
                <textarea
                  rows={3}
                  placeholder="Instruksi khusus atau catatan mengapa laporan ini dialihkan..."
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-2xl border border-slate-250 bg-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForwardModalOpen(false)}
                  className="flex-1 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!forwardUnitId}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Konfirmasi Delegasikan</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function setReplyStatus(nextStatus: string) {
  throw new Error("Function not implemented.");
}

