"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import imageCompression from "browser-image-compression";
import { 
  MessageCircle, 
  Loader2, 
  Send, 
  User as UserIcon, 
  Paperclip,
  X,
  FileText,
  ShieldCheck,
  LogIn,
  Eye,
  Reply,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import useComments from "@/hooks/useComments";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/auth.store";
import { isSafeMediaUrl } from "@/lib/utils";

interface CommentSectionProps {
  complaintId: string;
  isClosed?: boolean;
  /** Only show the section to the complaint owner (pelapor). Others see nothing. */
  isOwner?: boolean;
  // F4: Context anonimitas untuk sensor nama pelapor anonim di komentar
  complaintAuthorId?: string;
  isAnonymousComplaint?: boolean;
}

export default function CommentSection({
  complaintId,
  isClosed = false,
  isOwner = false,
  complaintAuthorId,
  isAnonymousComplaint,
}: CommentSectionProps) {
  const { comments, isLoading, isSubmitting, addComment } = useComments(complaintId, {
    complaintAuthorId,
    isAnonymousComplaint,
  });
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);
  const isAtBottom = useRef(true);

  // Attachment uploading state
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Previewing Uploaded files / Clicked discussion media
  const [selectedFile, setSelectedFile] = useState<{ url: string; isImage: boolean; name?: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMediaOnly, setFilterMediaOnly] = useState(false);

  const checkIsImage = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    return !cleanUrl.endsWith('.pdf');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      e.target.value = "";
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak didukung! Gunakan JPG, PNG, atau PDF.");
      e.target.value = "";
      return;
    }

    setAttachedFile(file);
    setIsUploading(true);
    try {
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          fileToUpload = await imageCompression(file, options);
        } catch (compressionError) {
          console.warn("Image compression failed, using original file:", compressionError);
        }
      }

      const res = await apiClient.upload.uploadFile(fileToUpload);
      setAttachedUrl(res.url);
      toast.success("Lampiran tanggapan berhasil diunggah!");
    } catch (err: any) {
      toast.error("Gagal mengunggah foto", {
        description: err.response?.data?.message || err.message || "Silakan coba lagi",
      });
      setAttachedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = async () => {
    if (attachedUrl && attachedUrl.startsWith("http")) {
      try {
        await apiClient.upload.deleteFile(attachedUrl);
      } catch (err) {
        console.warn("Gagal menghapus file dari S3", err);
      }
    }
    clearAttachmentState();
  };

  const clearAttachmentState = () => {
    setAttachedFile(null);
    setAttachedUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !attachedUrl) return;

    const res = await addComment({
      content: content.trim() || "(Lampiran Gambar)",
      evidenceUrl: attachedUrl || undefined,
      parentId: replyingTo?.id,
    });

    if (res) {
      setContent("");
      setReplyingTo(null);
      clearAttachmentState();
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filterMediaOnly && !c.evidenceUrl) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!c.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  React.useEffect(() => {
    if (scrollContainerRef.current && comments.length > 0) {
      if (!hasInitialScrolled.current || isAtBottom.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: hasInitialScrolled.current ? "smooth" : "auto",
        });
        hasInitialScrolled.current = true;
      }
    }
  }, [comments, filteredComments]);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-100 rounded" />
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <MessageCircle className="h-4.5 w-4.5 text-red-600" />
          <span>Diskusi & Tanggapan ({comments.length})</span>
        </h3>
        
        {/* Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-400 focus:bg-white transition-all w-full sm:w-40"
            />
          </div>
          <button
            onClick={() => setFilterMediaOnly(!filterMediaOnly)}
            className={cn(
              "p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
              filterMediaOnly 
                ? "bg-red-50 border-red-200 text-red-600 shadow-3xs" 
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
            title="Hanya tampilkan lampiran media"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Discussion List */}
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll}
        className="space-y-4 max-h-100 overflow-y-auto pr-1"
      >
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const isOfficial = comment.isPic;
            return (
              <div 
                key={comment.id} 
                id={`comment-${comment.id}`}
                className={cn(
                  "p-4 rounded-2xl text-xs space-y-2 max-w-[90%] border shadow-3xs",
                  isOfficial 
                    ? "bg-red-50/50 border-red-200/60 rounded-tl-none mr-auto" 
                    : "bg-white border-slate-100 rounded-tr-none ml-auto"
                )}
              >
                {/* User Identity info header */}
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {isAnonymousComplaint && !isOfficial ? "Anonim" : comment.user.name || "Anonim"}
                    </span>
                    {isOfficial && (
                      <span className="px-2 py-0.5 bg-[#b61722] text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md">
                        Respon Resmi Unit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => setReplyingTo(comment)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                      title="Balas pesan ini"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      {new Date(comment.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Parent Quote Block */}
                {comment.parent && (
                  <div 
                    onClick={() => {
                      const el = document.getElementById(`comment-${comment.parent!.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const originalBg = el.style.backgroundColor;
                        const originalTransition = el.style.transition;
                        el.style.transition = 'background-color 0.5s ease';
                        el.style.backgroundColor = '#fee2e2'; // Tailwind red-100
                        setTimeout(() => {
                          el.style.backgroundColor = originalBg;
                          setTimeout(() => {
                            el.style.transition = originalTransition;
                          }, 500);
                        }, 2000);
                      }
                    }}
                    className="p-2 bg-slate-100/80 border-l-2 border-red-500 rounded text-[10px] text-slate-500 font-medium cursor-pointer hover:bg-slate-200/50 transition-colors"
                  >
                    <p className="font-bold text-red-600 mb-0.5">
                      {isAnonymousComplaint && !comment.parent.isPic
                        ? "Anonim"
                        : comment.parent.user?.name || (comment.parent.isPic ? "Unit" : "Anonim")}
                    </p>
                    <p className="line-clamp-2">{comment.parent.content}</p>
                  </div>
                )}

                {/* Message Content */}
                <p className="text-slate-500 leading-relaxed font-semibold whitespace-pre-wrap">
                  {comment.content}
                </p>

              {/* Attached Image/File if exists */}
              {comment.evidenceUrl && (
                <div className="pt-1.5">
                  {checkIsImage(comment.evidenceUrl) ? (
                    <div 
                      className="relative h-32 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                      onClick={() => setSelectedFile({ url: comment.evidenceUrl!, isImage: true })}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={comment.evidenceUrl} 
                        alt="Attachment" 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setSelectedFile({ url: comment.evidenceUrl!, isImage: false, name: "Dokumen Lampiran" })}
                      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors max-w-sm"
                    >
                      <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">
                          Dokumen Lampiran
                        </p>
                        <p className="text-[10px] text-slate-500">Klik untuk melihat file</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
        ) : (
          /* Empty State */
          <div className="text-center py-8 text-slate-400 space-y-2">
            <MessageCircle className="h-8 w-8 mx-auto text-slate-350" />
            <p className="text-xs font-semibold">Belum ada tanggapan untuk keluhan ini.</p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {isClosed ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500 font-semibold">
          Keluhan telah ditutup. Diskusi dinonaktifkan.
        </div>
      ) : !isAuthenticated ? (
        /* Login gate for unauthenticated users */
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Ingin ikut berdiskusi?</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Login terlebih dahulu untuk mengirim tanggapan.</p>
            </div>
          </div>
          <Link
            href={`/login?redirect=/complaints/${complaintId}`}
            className="shrink-0 h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-100">
          
          {/* Reply Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-slate-50 border-l-2 border-red-500 p-2 rounded-r-xl">
              <div>
                <p className="text-[10px] font-bold text-red-600">
                  Membalas {isAnonymousComplaint && !replyingTo.isPic
                    ? "Anonim"
                    : replyingTo.user?.name || (replyingTo.isPic ? "Unit" : "Anonim")}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{replyingTo.content}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Pratinjau Lampiran Sebelum Kirim */}
          {(attachedUrl || isUploading) && (
            <div className="relative inline-block pb-2">
              {isUploading ? (
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mb-1" />
                  <span className="text-[9px] font-bold">Uploading</span>
                </div>
              ) : (
                <div className="relative h-20 w-20 rounded-xl border border-slate-200 shadow-3xs group">
                  {attachedFile?.type.startsWith("image/") || (attachedUrl && checkIsImage(attachedUrl)) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={attachedUrl!}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl cursor-pointer"
                      onClick={() => setSelectedFile({ url: attachedUrl!, isImage: true })}
                    />
                  ) : (
                    <div 
                      className="h-full w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setSelectedFile({ url: attachedUrl!, isImage: false, name: attachedFile?.name })}
                    >
                      <FileText className="h-6 w-6 text-red-500 mb-1" />
                      <span className="text-[8px] font-bold text-slate-500 truncate w-full px-2 text-center">
                        {attachedFile?.name || "Dokumen"}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeAttachment(); }}
                    className="absolute -top-1.5 -right-1.5 bg-white text-slate-500 hover:text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-slate-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              placeholder="Tulis tanggapan atau ajukan klarifikasi Anda di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10"
            />
          </div>

          {/* Form Actions (Attachment & Submit) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            {/* Hidden file input controlled via ref */}
            <input
              ref={commentFileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting || isUploading}
            />

            {/* Attachment picker */}
            <button
              type="button"
              onClick={() => commentFileInputRef.current?.click()}
              disabled={isSubmitting || isUploading}
              className="cursor-pointer bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-red-200 hover:text-red-600 inline-flex items-center gap-1.5 transition-all shadow-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Lampirkan Media</span>
            </button>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || (!content.trim() && !attachedFile)}
              size="sm"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 h-9 font-bold text-xs uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <span>Kirim Tanggapan</span>
                  <Send className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* File/Image Preview Modal */}
      {selectedFile && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedFile(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
            className="absolute top-4 right-4 z-[10000] bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
            {!isSafeMediaUrl(selectedFile.url) ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold text-center max-w-sm">
                Tautan media tidak valid atau tidak aman untuk ditampilkan.
              </div>
            ) : selectedFile.isImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={selectedFile.url} 
                alt="Preview Full" 
                className="w-full h-full object-contain drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <iframe 
                src={selectedFile.url}
                className="w-11/12 h-5/6 bg-white rounded-xl shadow-2xl"
                title="Document Preview"
                sandbox="allow-scripts allow-same-origin"
                onClick={(e: any) => e.stopPropagation()}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Simple Helper class name merging
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
