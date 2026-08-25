"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { useRoleViewStore } from "@/app/store/role-view.store";
import { Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
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
import CollaborateUnitModal from "./unit-detail/modals/CollaborateUnitModal";
import PublishCategoryModal from "./admin/modals/PublishCategoryModal";

export default function UnitComplaintDetailPage({ complaintId }: { complaintId: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { activeView } = useRoleViewStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"dashboard" | "keluhan">("keluhan");

  // States
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [autoCloseDays, setAutoCloseDays] = useState<number>(7);

  // Discussion reply
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Discussion File Upload
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [replyFileUrl, setReplyFileUrl] = useState<string | null>(null);
  const [isUploadingReplyFile, setIsUploadingReplyFile] = useState(false);

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

  // Modal: Collaborate
  const [isCollaborateModalOpen, setIsCollaborateModalOpen] = useState(false);
  const [collaborateUnitId, setCollaborateUnitId] = useState("");
  const [collaborateNote, setCollaborateNote] = useState("");

  // Modal: Publish
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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
      
      if (typeof window !== "undefined") {
        localStorage.setItem(`lastViewed_${complaintId}`, new Date().toISOString());
      }

      setComplaint(activeDetail);

      // Load comments (api.ts flattenComments already returns flat sorted list with parent refs)
      let loadedComments: Comment[] = [];
      try {
        loadedComments = await apiClient.comments.getByComplaintId(complaintId, {
          isAnonymousComplaint: activeDetail?.isAnonymous,
          complaintAuthorId: activeDetail?.reporter?.id,
        });
        if (Array.isArray(loadedComments)) {
          setComments(loadedComments);
        }
      } catch {
        loadedComments = [];
      }

      if (user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") {
        const u = await apiClient.units.getAll();
        setAvailableUnits(u);
      }

      // Fetch auto-close config
      try {
        const config = await apiClient.complaints.getAutoCloseConfig();
        if (config?.daysToClose) {
          setAutoCloseDays(config.daysToClose);
        }
      } catch (err) {
        console.warn("Failed to fetch auto close config:", err);
      }
    } catch {
      toast.error("Gagal memuat detail keluhan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      // Force active tab to be "keluhan" for complaint details
      localStorage.setItem("unitActiveTab", "keluhan");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (
        user &&
        user.role !== "SUPERADMIN" &&
        user.role !== "SUPER_PIC" &&
        user.role !== "UNIT_PIC" &&
        user.role !== "UNIT_MEMBER"
      ) {
        router.push("/login");
        return;
      }
      loadComplaintData();

      // Polling for realtime updates every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          // Poll comments
          const freshComments = await apiClient.comments.getByComplaintId(complaintId, {
            isAnonymousComplaint: complaint?.isAnonymous,
            complaintAuthorId: complaint?.reporter?.id,
          });
          if (Array.isArray(freshComments)) {
            setComments(freshComments);
          }
          // Poll complaint details for live stats
          const freshComplaint = await apiClient.complaints.getById(complaintId);
          if (freshComplaint && freshComplaint.id) {
            setComplaint((prev) => {
              if (!prev) return freshComplaint;
              return {
                ...prev,
                supports: freshComplaint.supports,
                dislikes: freshComplaint.dislikes,
                status: freshComplaint.status,
                visibility: freshComplaint.visibility,
                timeline: freshComplaint.timeline
              };
            });
          }
        } catch { /* ignore polling errors */ }
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [mounted, isAuthenticated, user, complaintId]);

  // Handlers
  
  const handleReplyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const rawFile = e.target.files[0];
      try {
        setIsUploadingReplyFile(true);
        let fileToUpload = rawFile;

        if (rawFile.type.startsWith("image/")) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          try {
            fileToUpload = await imageCompression(rawFile, options);
          } catch (compressionError) {
            console.warn("Image compression failed, using original file:", compressionError);
          }
        }

        setReplyFile(fileToUpload);
        const response = await apiClient.upload.uploadFile(fileToUpload);
        
        if (response && response.url) {
          setReplyFileUrl(response.url);
          toast.success("File berhasil diunggah");
        } else {
          throw new Error("Format respon tidak valid");
        }
      } catch (err: any) {
        toast.error("Gagal mengunggah file", {
          description: err.response?.data?.message || err.message || "Silakan coba lagi",
        });
        setReplyFile(null);
        setReplyFileUrl(null);
      } finally {
        setIsUploadingReplyFile(false);
      }
    }
  };

  const handleRemoveReplyFile = async () => {
    if (replyFileUrl) {
      try {
        await apiClient.upload.deleteFile(replyFileUrl);
        toast.success("File berhasil dihapus");
      } catch (err) {
        console.error("Failed to delete file from S3:", err);
      }
    }
    setReplyFile(null);
    setReplyFileUrl(null);
  };

  const handleSendReply = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if ((!replyText.trim() && !replyFileUrl) || isSendingReply || isUploadingReplyFile) return;

    setIsSendingReply(true);
    try {
      const newComment = await apiClient.comments.create(complaintId, {
        content: replyText.trim() || "Mengirim lampiran",
        evidenceUrl: replyFileUrl || undefined,
        parentId,
      });

      // Refetch all comments to get the populated parent relations
      const updatedComments = await apiClient.comments.getByComplaintId(complaintId);
      if (Array.isArray(updatedComments)) {
        setComments(updatedComments);
      } else {
        setComments((prev) => [...prev, newComment]);
      }

      setReplyText("");
      setReplyFile(null);
      setReplyFileUrl(null);
      toast.success("Balasan terkirim ke pelapor");
    } catch (err: any) {
      toast.error("Gagal mengirim balasan", {
        description: err.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleProsesLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rencanaText.trim() || isSubmittingOpen) return;

    setIsSubmittingOpen(true);
    try {
      await apiClient.complaints.updateStatus(complaintId, "OPEN", rencanaText.trim());
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
      await apiClient.complaints.updateStatus(complaintId, "DONE", undefined, solusiText.trim());
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
      
      if (user?.role === "UNIT_PIC" || user?.role === "UNIT_MEMBER") {
        router.push("/dashboard");
      } else {
        loadComplaintData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal meneruskan laporan");
    }
  };

  const handleCollaborateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaborateUnitId) {
      toast.error("Pilih unit kerja tujuan kolaborasi");
      return;
    }

    try {
      await apiClient.complaints.collaborate(complaintId, {
        targetUnitId: collaborateUnitId,
        collaborateNote: collaborateNote.trim(),
      });
      toast.success("Kolaborasi laporan berhasil dimulai");
      setIsCollaborateModalOpen(false);
      setCollaborateNote("");
      loadComplaintData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengajak kolaborasi laporan");
    }
  };

  const handleToggleVisibility = async () => {
    if (!complaint) return;
    if (complaint.visibility === "PRIVATE") {
      setIsPublishModalOpen(true);
      return;
    }
    
    // Making it PRIVATE
    try {
      await apiClient.complaints.updateVisibility(complaintId, "PRIVATE");
      toast.success("Visibilitas Diperbarui", {
        description: `Keluhan kini disetel menjadi PRIVATE.`,
      });
      loadComplaintData();
    } catch (err: any) {
      toast.error("Gagal Memperbarui Visibilitas", {
        description: err?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    }
  };

  const handlePublishComplaint = async (category: string) => {
    if (!complaint) return;
    setIsPublishing(true);
    try {
      await apiClient.complaints.updateVisibility(complaint.id, "PUBLIC", category);
      toast.success("Keluhan Dipublikasikan", {
        description: `Keluhan kini disetel menjadi PUBLIC dengan kategori ${category}.`,
      });
      setIsPublishModalOpen(false);
      loadComplaintData();
    } catch (err: any) {
      toast.error("Gagal Memperbarui Visibilitas", {
        description: err?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!mounted || isLoading || !complaint) {
    return (
      <div className="h-screen w-screen flex overflow-hidden bg-slate-50 font-sans text-slate-800">
        {user?.role === "SUPERADMIN" || (user?.role === "SUPER_PIC" && activeView === "admin") ? (
          <AdminSidebar activeTab="complaints" />
        ) : (
          <UnitSidebar activeTab={activeSidebarTab} />
        )}
        <div className="grow h-full flex items-center justify-center bg-[#f9f9f9]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Memuat Data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Dynamic Sidebar based on role */}
      {user?.role === "SUPERADMIN" || (user?.role === "SUPER_PIC" && activeView === "admin") ? (
        <AdminSidebar activeTab="complaints" />
      ) : (
        <UnitSidebar activeTab={activeSidebarTab} />
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
                
                replyFile={replyFile}
                replyFileUrl={replyFileUrl}
                isUploadingReplyFile={isUploadingReplyFile}
                onReplyFileChange={handleReplyFileChange}
                onRemoveReplyFile={handleRemoveReplyFile}
              />
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              <ComplaintSidebar
                complaint={complaint}
                user={user}
                isTimelineExpanded={isTimelineExpanded}
                comments={comments}
                autoCloseDays={autoCloseDays}
                onToggleTimeline={() => setIsTimelineExpanded(!isTimelineExpanded)}
                onOpenProcessModal={() => setIsOpenModal(true)}
                onOpenForwardModal={() => setIsForwardModalOpen(true)}
                onOpenCollaborateModal={() => setIsCollaborateModalOpen(true)}
                onOpenCloseModal={() => setIsCloseModal(true)}
                onOpenPublishModal={handleToggleVisibility}
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
        onAppendNote={(chip) => setForwardNote(chip)}
        onSubmit={handleForwardComplaint}
      />
      
      <CollaborateUnitModal
        isOpen={isCollaborateModalOpen}
        complaint={complaint}
        collaborateUnitId={collaborateUnitId}
        collaborateNote={collaborateNote}
        availableUnits={availableUnits}
        onClose={() => setIsCollaborateModalOpen(false)}
        onSelectUnit={setCollaborateUnitId}
        onChangeNote={setCollaborateNote}
        onAppendNote={(chip) => setCollaborateNote(chip)}
        onSubmit={handleCollaborateComplaint}
      />

      <PublishCategoryModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSubmit={handlePublishComplaint}
        complaintTitle={complaint?.title}
        complaintContent={complaint?.description}
        isSubmitting={isPublishing}
      />
    </div>
  );
}
