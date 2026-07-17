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
  PlusCircle,
  Folder,
  Bell,
  LayoutDashboard,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Send,
  Upload,
  RefreshCw,
  X,
  Share2,
  CheckCircle,
  AlertCircle
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
  const [replyStatus, setReplyStatus] = useState<ComplaintStatus>("IN_PROGRESS");
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
      setReplyStatus(activeDetail.status);

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

          // Update complaint status locally
          setComplaint((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: replyStatus,
              timeline: [
                {
                  id: `t-local-${Date.now()}`,
                  title: "Unit Sarpras Memberi Respon",
                  description: `Tanggapan resmi dikirim. Status berubah menjadi ${replyStatus}.`,
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

          setReplyStatus(nextStatus);
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
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lampiran (2)</span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-40 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-3xs group cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/lab_ac_rusak.png"
                      alt="Lab computer"
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                      onClick={() => window.open("/images/lab_ac_rusak.png", "_blank")}
                    />
                  </div>
                  <div className="h-40 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-3xs group cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ac_indoor.png"
                      alt="AC indoor unit"
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                      onClick={() => window.open("/images/ac_indoor.png", "_blank")}
                    />
                  </div>
                </div>
              </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Status Update */}
                    <div className="space-y-1.5">
                      <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">Update Status</label>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value as ComplaintStatus)}
                        className="h-10 w-full rounded-xl border border-slate-250 bg-white px-3.5 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer"
                      >
                        <option value="IN_PROGRESS">IN_PROGRESS (Sedang Ditangani)</option>
                        <option value="CLOSED">CLOSED (Ditutup &amp; Selesai)</option>
                        <option value="WAITING_RESPONSE">WAITING_RESPONSE (Menunggu Respon)</option>
                      </select>
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
                  let statusColorClass = "text-sky-400";
                  if (complaint.status === "WAITING_RESPONSE") {
                    displayStatus = "BELUM DIRESPON";
                    statusColorClass = "text-rose-400";
                  } else if (complaint.status === "IN_PROGRESS") {
                    displayStatus = "SEDANG DIPROSES";
                    statusColorClass = "text-amber-500";
                  } else if (complaint.status === "CLOSED") {
                    displayStatus = "SELESAI";
                    statusColorClass = "text-emerald-500";
                  }

                  return (
                    <div className="bg-[#0B0F19] rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status Saat Ini</span>
                      <span className={cn("block text-base font-black tracking-widest mt-1.5", statusColorClass)}>
                        {displayStatus}
                      </span>
                    </div>
                  );
                })()}

                {/* PIC Info */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PIC Unit Bertanggung Jawab</span>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-50 text-[#b61722] border border-red-100 flex items-center justify-center font-extrabold text-xs shrink-0 select-none shadow-3xs">
                      RH
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-bold text-slate-800 text-xs leading-none">Rahmat Hidayat</span>
                      <span className="block text-[10px] text-slate-400 font-bold">Teknisi Senior - Sarpras</span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <button
                    disabled={complaint.status === "IN_PROGRESS" || complaint.status === "CLOSED"}
                    onClick={() => handleStatusTransition("IN_PROGRESS")}
                    className="w-full h-11 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                  >
                    <RefreshCw className="h-4 w-4 text-slate-400 animate-spin-slow" />
                    <span>Update Status</span>
                  </button>

                  <button
                    onClick={() => setIsForwardModalOpen(true)}
                    className="w-full h-11 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                  >
                    <Share2 className="h-4 w-4 text-[#b61722]" />
                    <span>Teruskan (Forward)</span>
                  </button>

                  <button
                    disabled={complaint.status === "CLOSED"}
                    onClick={() => handleStatusTransition("CLOSED")}
                    className="w-full h-11 bg-white hover:bg-red-50/50 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 text-[#b61722] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                  >
                    <CheckCircle className="h-4 w-4" />
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">

            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Teruskan / Delegasikan Laporan</h3>
              <button
                onClick={() => setIsForwardModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleForwardComplaint} className="space-y-4 pt-2">

              {/* Unit target */}
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">Unit Kerja Tujuan</label>
                <select
                  required
                  value={forwardUnitId}
                  onChange={(e) => setForwardUnitId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-250 bg-white px-3 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="">Pilih Unit Kerja</option>
                  <option value="Kurikulum">Kurikulum</option>
                  <option value="Kesiswaan">Kesiswaan</option>
                  <option value="Hubin">Hubin / Humas</option>
                  <option value="Sarpras">Sarana &amp; Prasarana (Sarpras)</option>
                  <option value="Tata Usaha">Tata Usaha</option>
                </select>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">Catatan Pendelegasian</label>
                <textarea
                  rows={3}
                  placeholder="Ketik catatan mengapa keluhan ini dialihkan ke unit tersebut..."
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-250 bg-white focus:outline-none focus:border-red-400 font-medium"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForwardModalOpen(false)}
                  className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-xl transition-all text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#b61722] hover:bg-[#a7151e] text-white font-bold rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Delegasikan</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
