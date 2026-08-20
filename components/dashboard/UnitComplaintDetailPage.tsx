"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint } from "@/types/complaint";
import { Comment } from "@/types/comment";
import UnitSidebar from "@/components/dashboard/UnitSidebar";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

// Unit Detail Subcomponents
import ComplaintHeader from "./unit-detail/components/ComplaintHeader";
import ComplaintContentCard from "./unit-detail/components/ComplaintContentCard";
import DiscussionThread from "./unit-detail/components/DiscussionThread";
import ComplaintSidebar from "./unit-detail/components/ComplaintSidebar";

// Unit Detail Modals
import ProcessReportModal from "./unit-detail/modals/ProcessReportModal";
import CloseComplaintModal from "./unit-detail/modals/CloseComplaintModal";
import ForwardUnitModal from "./unit-detail/modals/ForwardUnitModal";

export default function UnitComplaintDetailPage({ complaintId }: { complaintId: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  // Discussion reply
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Modal: Process Report
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [rencanaText, setRencanaText] = useState("");
  const [isSubmittingOpen, setIsSubmittingOpen] = useState(false);

  // Modal: Close Complaint
  const [isCloseModal, setIsCloseModal] = useState(false);
  const [solusiText, setSolusiText] = useState("");
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

  // Modal: Forward
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardUnitId, setForwardUnitId] = useState("");
  const [forwardNote, setForwardNote] = useState("");
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  const loadComplaintData = async () => {
    setIsLoading(true);
    try {
      let activeDetail: Complaint | null = null;
      try {
        activeDetail = await apiClient.complaints.getById(complaintId);
      } catch (err: any) {
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
      } catch {
        loadedComments = [];
      }
      setComments(loadedComments);

      if (user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") {
        const u = await apiClient.units.getAll();
        setAvailableUnits(u);
      }
    } catch {
      toast.error("Gagal memuat detail keluhan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (user && user.role !== "SUPERADMIN" && user.role !== "SUPER_PIC" && user.role !== "PIC") {
        router.push("/login");
        return;
      }
      loadComplaintData();
    }
  }, [mounted, isAuthenticated, user, complaintId]);

  // Handlers
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const newComment = await apiClient.comments.create(complaintId, {
        content: replyText.trim(),
        isOfficialResponse: true,
      });

      setComments((prev) => [...prev, newComment]);
      setReplyText("");
      toast.success("Balasan terkirim ke pelapor");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengirim balasan");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleProsesLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rencanaText.trim() || isSubmittingOpen) return;

    setIsSubmittingOpen(true);
    try {
      await apiClient.complaints.updateStatus(complaintId, "OPEN", {
        handlingPlan: rencanaText.trim(),
      });
      toast.success("Status keluhan diperbarui menjadi DIPROSES");
      setIsOpenModal(false);
      setRencanaText("");
      loadComplaintData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memproses laporan");
    } finally {
      setIsSubmittingOpen(false);
    }
  };

  const handleTutupKeluhan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solusiText.trim() || isSubmittingClose) return;

    setIsSubmittingClose(true);
    try {
      await apiClient.complaints.updateStatus(complaintId, "DONE", {
        resolution: solusiText.trim(),
      });
      toast.success("Keluhan berhasil ditutup dan diselesaikan");
      setIsCloseModal(false);
      setSolusiText("");
      loadComplaintData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menutup keluhan");
    } finally {
      setIsSubmittingClose(false);
    }
  };

  const handleForwardComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardUnitId) {
      toast.error("Pilih unit kerja tujuan");
      return;
    }

    try {
      await apiClient.complaints.forward(complaintId, {
        toUnitId: forwardUnitId,
        forwardNote: forwardNote.trim(),
      });
      toast.success("Laporan berhasil didelegasikan");
      setIsForwardModalOpen(false);
      setForwardNote("");
      loadComplaintData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal meneruskan laporan");
    }
  };

  if (!mounted || isLoading || !complaint) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Memuat Data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Dynamic Sidebar based on role */}
      {user?.role === "SUPERADMIN" ? (
        <AdminSidebar activeTab="complaints" />
      ) : (
        <UnitSidebar
          activeTab="dashboard"
          userRole={user?.role}
          unitName={complaint?.unit || user?.unit?.name || "Unit"}
          badgeCount={0}
        />
      )}

      {/* Main Workspace */}
      <div className="grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">
        <div className="grow overflow-y-auto p-8 space-y-6">
          <ComplaintHeader userRole={user?.role} />

          {/* 2/3 Left & 1/3 Right Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <ComplaintContentCard complaint={complaint} />
              <DiscussionThread
                complaint={complaint}
                comments={comments}
                replyText={replyText}
                isSendingReply={isSendingReply}
                onChangeReplyText={setReplyText}
                onSubmitReply={handleSendReply}
              />
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              <ComplaintSidebar
                complaint={complaint}
                user={user}
                isTimelineExpanded={isTimelineExpanded}
                onToggleTimeline={() => setIsTimelineExpanded(!isTimelineExpanded)}
                onOpenProcessModal={() => setIsOpenModal(true)}
                onOpenForwardModal={() => setIsForwardModalOpen(true)}
                onOpenCloseModal={() => setIsCloseModal(true)}
                onReopenComplaint={() =>
                  apiClient.complaints
                    .updateStatus(complaint.id, "OPEN")
                    .then(() => loadComplaintData())
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProcessReportModal
        isOpen={isOpenModal}
        complaint={complaint}
        rencanaText={rencanaText}
        isSubmitting={isSubmittingOpen}
        onClose={() => {
          setIsOpenModal(false);
          setRencanaText("");
        }}
        onChangeText={setRencanaText}
        onSubmit={handleProsesLaporan}
      />

      <CloseComplaintModal
        isOpen={isCloseModal}
        complaint={complaint}
        solusiText={solusiText}
        isSubmitting={isSubmittingClose}
        onClose={() => {
          setIsCloseModal(false);
          setSolusiText("");
        }}
        onChangeText={setSolusiText}
        onSubmit={handleTutupKeluhan}
      />

      <ForwardUnitModal
        isOpen={isForwardModalOpen}
        complaint={complaint}
        forwardUnitId={forwardUnitId}
        forwardNote={forwardNote}
        availableUnits={availableUnits}
        onClose={() => setIsForwardModalOpen(false)}
        onSelectUnit={setForwardUnitId}
        onChangeNote={setForwardNote}
        onAppendNote={(chip) =>
          setForwardNote((prev) => (prev ? `${prev} | ${chip}` : chip))
        }
        onSubmit={handleForwardComplaint}
      />
    </div>
  );
}
