"use client";

import React, { useState, useRef } from "react";
import { 
  MessageCircle, 
  Loader2, 
  Send, 
  User as UserIcon, 
  Image as ImageIcon, 
  X,
  FileText,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import useComments from "@/hooks/useComments";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/auth.store";

interface CommentSectionProps {
  complaintId: string;
  isClosed?: boolean;
  /** Only show the section to the complaint owner (pelapor). Others see nothing. */
  isOwner?: boolean;
}

export default function CommentSection({ complaintId, isClosed = false, isOwner = false }: CommentSectionProps) {
  // Private discussion: only visible to the complaint owner
  if (!isOwner) return null;
  const { comments, isLoading, isSubmitting, addComment } = useComments(complaintId);
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState("");

  // Attachment uploading state
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await apiClient.upload.uploadFile(file);
      setAttachedUrl(res.url);
      toast.success("Lampiran tanggapan berhasil diunggah!");
    } catch (err) {
      // Fallback: gunakan object URL lokal jika backend tidak tersedia
      console.warn("Upload API unavailable, using local URL:", err);
      const objectUrl = URL.createObjectURL(file);
      setAttachedUrl(objectUrl);
      toast.success("Lampiran berhasil dilampirkan! (Mode Demo)");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setAttachedUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await addComment({
      content: content.trim(),
      evidenceUrl: attachedUrl || undefined,
    });

    if (res) {
      setContent("");
      removeAttachment();
    }
  };

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
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
        <MessageCircle className="h-4.5 w-4.5 text-red-600" />
        <span>Diskusi & Tanggapan ({comments.length})</span>
      </h3>

      {/* Discussion List */}
      <div className="space-y-4 max-h-100 overflow-y-auto pr-1">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isOfficial = comment.isPic;
            return (
              <div 
                key={comment.id} 
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
                    <span className="font-bold text-slate-800">{comment.user.name || "Anonim"}</span>
                    {isOfficial && (
                      <span className="px-2 py-0.5 bg-[#b61722] text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md">
                        Respon Resmi Unit
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0">
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

                {/* Message Content */}
                <p className="text-slate-500 leading-relaxed font-semibold whitespace-pre-wrap">
                  {comment.content}
                </p>

              {/* Attached Image if exists */}
              {comment.evidenceUrl && (
                <div className="pt-1.5">
                  <div className="relative h-32 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <img 
                      src={comment.evidenceUrl} 
                      alt="Attachment" 
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => window.open(comment.evidenceUrl, "_blank")}
                    />
                  </div>
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

            {/* Attachment preview or picker */}
            {!attachedFile ? (
              <button
                type="button"
                onClick={() => commentFileInputRef.current?.click()}
                disabled={isSubmitting || isUploading}
                className="cursor-pointer bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-red-200 hover:text-red-600 inline-flex items-center gap-1.5 transition-all shadow-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Tambah Foto</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-slate-700 max-w-xs">
                <FileText className="h-3.5 w-3.5 text-red-500" />
                <span className="line-clamp-1">{attachedFile.name}</span>
                <button 
                  type="button" 
                  onClick={removeAttachment}
                  className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || !content.trim()}
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

          {isUploading && (
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-red-600" />
              Mengunggah lampiran tanggapan...
            </p>
          )}
        </form>
      )}
    </div>
  );
}

// Simple Helper class name merging
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
