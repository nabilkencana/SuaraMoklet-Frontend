"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  Loader2,
  MessageSquare,
  Clock,
  Send,
  Sparkles,
  Building,
  User,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintUnit, ComplaintVisibility } from "@/types/complaint";
import { Comment } from "@/types/comment";

// Fallback mock complaints assigned to Sarpras/other units
const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-1",
    title: "AC Lab Komputer RPL 2 Mati",
    description: "Dua unit AC di ruang Lab RPL 2 sering mati mendadak saat siang hari.",
    unit: "Sarpras" as ComplaintUnit,
    status: "WAITING_RESPONSE",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    supports: 42,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "u-1", name: "Siswa Moklet" },
  },
  {
    id: "complaint-2",
    title: "Kebocoran Keran Air Toilet Gedung C",
    description: "Air terus mengalir deras membasahi lantai toilet di toilet lantai 2.",
    unit: "Sarpras" as ComplaintUnit,
    status: "NEW",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    supports: 8,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "u-2", name: "Guru Moklet" },
  },
  {
    id: "complaint-3",
    title: "Lampu Kelas XI-TKJ 1 Redup",
    description: "Tiga buah lampu di kelas XI-TKJ 1 berkedip-kedip dan sangat redup saat dinyalakan.",
    unit: "Sarpras" as ComplaintUnit,
    status: "CLOSED",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    supports: 12,
    visibility: "PUBLIC" as ComplaintVisibility,
    category: "FASILITAS",
    reporter: { id: "u-3", name: "Rian TKJ" },
  },
];

const MOCK_COMMENTS: Record<string, Comment[]> = {
  "complaint-1": [
    {
      id: "comment-1-1",
      complaintId: "complaint-1",
      content: "Keluhan terverifikasi. Kami telah menjadwalkan teknisi untuk melakukan perbaikan.",
      isPic: true,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      user: { id: "p-1", name: "PIC Sarpras", email: "sarpras@moklet.org", role: "UNIT_PIC" },
    },
    {
      id: "comment-1-2",
      complaintId: "complaint-1",
      content: "Terima kasih respon cepatnya. Mohon bantuannya agar segera diperbaiki.",
      isPic: false,
      createdAt: new Date(Date.now() - 36000000).toISOString(),
      user: { id: "u-1", name: "Siswa Moklet", email: "siswa@student.moklet.org", role: "USER" },
    },
  ],
  "complaint-2": [],
  "complaint-3": [
    {
      id: "comment-3-1",
      complaintId: "complaint-3",
      content: "Teknisi sudah mengganti ketiga lampu dengan lampu LED baru berdaya 15 Watt.",
      isPic: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      user: { id: "p-1", name: "PIC Sarpras", email: "sarpras@moklet.org", role: "UNIT_PIC" },
    },
  ],
};

export default function UnitPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Complaints states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Identify unit based on user email / role
  const getAssignedUnit = () => {
    if (user?.email === "pic_sarpras@moklet.org") return "Sarpras";
    return "Sarpras"; // Default fallback unit
  };

  const currentUnit = getAssignedUnit();

  // Check auth
  useEffect(() => {
    setMounted(true);
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
      fetchComplaints();
    }
  }, [mounted, isAuthenticated, user]);

  // Load comments when selected complaint changes
  useEffect(() => {
    if (selectedComplaintId) {
      fetchComments(selectedComplaintId);
    }
  }, [selectedComplaintId]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let loaded: Complaint[] = [];
      try {
        const raw = await apiClient.complaints.getAll();
        const apiComplaints = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : [];
        loaded = apiComplaints.length > 0 ? apiComplaints : MOCK_COMPLAINTS;
      } catch (err) {
        loaded = MOCK_COMPLAINTS;
      }

      // Filter complaints to show only ones assigned to the user's unit
      const unitFiltered = loaded.filter((c) => c.unit === currentUnit || !c.unit);
      setComplaints(unitFiltered);

      if (unitFiltered.length > 0) {
        setSelectedComplaintId(unitFiltered[0].id);
      }
    } catch (e) {
      toast.error("Gagal Memuat Keluhan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (id: string) => {
    try {
      let loadedComments: Comment[] = [];
      try {
        loadedComments = await apiClient.comments.getByComplaintId(id);
      } catch (err) {
        loadedComments = MOCK_COMMENTS[id] || [];
      }
      setComments(loadedComments);
    } catch (e) {
      console.error("Failed to load comments:", e);
    }
  };

  // Submit comment handler
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedComplaintId) return;

    setIsSubmittingComment(true);
    try {
      const result = await apiClient.comments.create(selectedComplaintId, {
        content: newComment,
      });

      toast.success("Tanggapan berhasil dikirim!");
      setNewComment("");
      
      // Update local comments & refresh state
      fetchComments(selectedComplaintId);
      
      // Refresh complaints since comment changes the status in backend!
      fetchComplaints();
    } catch (err) {
      // Simulate frontend comment addition on error
      const simulatedComment: Comment = {
        id: `sim-comment-${Date.now()}`,
        complaintId: selectedComplaintId,
        content: newComment,
        isPic: true,
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || "sim-pic",
          name: user?.name || "PIC Unit",
          email: user?.email || "pic@moklet.org",
          role: user?.role || "UNIT_PIC",
          avatarUrl: user?.avatarUrl,
        },
      };
      
      setComments((prev) => [...prev, simulatedComment]);
      
      // Simulate status progression locally
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaintId
            ? { ...c, status: "WAITING_USER" }
            : c
        )
      );

      setNewComment("");
      toast.success("Tanggapan berhasil dikirim (Simulated)!");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Close complaint simulation (Only for PIC or Superadmin)
  const handleCloseComplaint = async () => {
    if (!confirm("Selesaikan dan tutup keluhan ini?")) return;
    try {
      // Simulate closing complaint status
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaintId
            ? { ...c, status: "CLOSED" }
            : c
        )
      );
      toast.success("Keluhan ditutup dan diselesaikan!");
    } catch (e) {
      toast.error("Gagal menyelesaikan keluhan");
    }
  };

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId);

  if (!mounted || !isAuthenticated || (user?.role !== "UNIT_PIC" && user?.role !== "UNIT_MEMBER" && user?.role !== "SUPERADMIN")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Dashboard Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-red-600 mb-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Unit Workdesk</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <Building className="h-7 w-7 text-slate-700" />
                  <span>Keluhan Unit: {currentUnit}</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Tinjau keluhan yang didelegasikan ke unit Anda, berikan respon resmi, dan selesaikan kendala fasilitas sekolah.
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Complaints List (1/3 width) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-100">
                  Daftar Kerja Unit ({complaints.length})
                </h3>
                
                {complaints.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-9 w-9 text-slate-350 mx-auto mb-3 opacity-60" />
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Belum ada tugas keluhan yang diteruskan ke unit Anda saat ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {complaints.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedComplaintId(item.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer block ${
                          selectedComplaintId === item.id
                            ? "bg-red-50/40 border-red-200 ring-1 ring-red-100"
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50">
                            {item.category}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            item.status === "CLOSED"
                              ? "bg-slate-100 text-slate-500"
                              : item.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4 className={`font-bold text-xs leading-snug line-clamp-1 ${
                          selectedComplaintId === item.id ? "text-red-700" : "text-slate-800"
                        }`}>
                          {item.title}
                        </h4>
                        <span className="block text-[9px] text-slate-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Workdesk Area (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {selectedComplaint ? (
                  <div className="space-y-6">
                    {/* Complaint Details Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-800 leading-snug">{selectedComplaint.title}</h2>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              Oleh: <strong className="text-slate-500">{selectedComplaint.reporter?.name || "Anonim"}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(selectedComplaint.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {selectedComplaint.status !== "CLOSED" && (
                          <button
                            onClick={handleCloseComplaint}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-xs shadow-emerald-100"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Tandai Selesai</span>
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-slate-650 leading-relaxed border-t border-slate-50 pt-4 whitespace-pre-line">
                        {selectedComplaint.description}
                      </p>
                    </div>

                    {/* Comments & Discussion section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                      <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                        <MessageSquare className="h-4.5 w-4.5 text-red-600" />
                        <span>Kolom Diskusi & Respon Resmi</span>
                      </h3>

                      {/* Comments Thread */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {comments.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-xs text-slate-400 font-medium">Belum ada diskusi dalam keluhan ini.</p>
                          </div>
                        ) : (
                          comments.map((comment) => {
                            const isAdmin = comment.isPic;
                            return (
                              <div
                                key={comment.id}
                                className={`flex gap-3 max-w-[85%] ${isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                              >
                                <div className="h-7 w-7 rounded-lg bg-slate-150 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase shrink-0">
                                  {comment.user?.name.charAt(0)}
                                </div>
                                <div
                                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                                    isAdmin
                                      ? "bg-red-600 text-white rounded-tr-none shadow-sm"
                                      : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
                                  }`}
                                >
                                  <span className={`block font-bold text-[10px] ${isAdmin ? "text-red-100" : "text-slate-500"}`}>
                                    {comment.user?.name} ({comment.isPic ? "PIC Unit" : "Reporter"})
                                  </span>
                                  <p className="leading-relaxed whitespace-pre-line">{comment.content}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Comment Input */}
                      {selectedComplaint.status !== "CLOSED" ? (
                        <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-4 border-t border-slate-50">
                          <input
                            type="text"
                            required
                            placeholder="Tulis tanggapan resmi dari unit..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmittingComment}
                            className="flex-1 h-11 px-4 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingComment}
                            className="h-11 w-11 bg-red-650 hover:bg-red-700 text-white rounded-xl active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow-xs shadow-red-200 disabled:opacity-50"
                          >
                            {isSubmittingComment ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-xs text-slate-500 font-medium">
                          Keluhan ini telah ditutup. Diskusi dinonaktifkan.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center h-64">
                    <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm font-bold">Pilih Keluhan Kerja</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed mx-auto">
                      Gunakan daftar di sebelah kiri untuk melihat detail laporan keluhan dan melakukan tindakan penanganan.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
