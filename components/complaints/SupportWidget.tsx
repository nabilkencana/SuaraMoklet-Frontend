"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Loader2, LogIn, Heart, Sparkles } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";

interface SupportWidgetProps {
  complaintId: string;
  supports: number;
  isSupported?: boolean;
  isOwner?: boolean;
  onSupport: (id: string, action: 'LIKE' | 'UNLIKE' | 'DISLIKE' | 'UNDISLIKE') => Promise<{ supports: number, dislikes: number } | null>;
}

export default function SupportWidget({
  complaintId,
  supports,
  isSupported = false,
  isOwner = false,
  onSupport,
  dislikes = 0,
  isDisliked = false,
}: SupportWidgetProps & { dislikes?: number; isDisliked?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  const [localLiked, setLocalLiked] = useState<boolean>(false);
  const [localDisliked, setLocalDisliked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(supports);
  const [dislikeCount, setDislikeCount] = useState<number>(dislikes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPrivileged = user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC";

  // Initialize from backend & local state
  useEffect(() => {
    setLikeCount(supports);
    setDislikeCount(dislikes);
    if (isAuthenticated) {
      setLocalLiked(isSupported);
      setLocalDisliked(isDisliked);
    } else {
      const likedList = JSON.parse(localStorage.getItem("liked_complaints") || "[]");
      const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
      setLocalLiked(likedList.includes(complaintId));
      setLocalDisliked(dislikedList.includes(complaintId));
    }
  }, [supports, dislikes, isSupported, isDisliked, complaintId, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk menyukai aspirasi ini.");
      return;
    }

    setIsSubmitting(true);

    if (localLiked) {
      // Toggle OFF (Unlike)
      const success = await onSupport(complaintId, 'UNLIKE');
      if (success) {
        setLocalLiked(false);
        setLikeCount(success.supports);
        const likedList = JSON.parse(localStorage.getItem("liked_complaints") || "[]");
        const updatedLiked = likedList.filter((id: string) => id !== complaintId);
        localStorage.setItem("liked_complaints", JSON.stringify(updatedLiked));
        toast.success("Batal menyukai aspirasi.");
      }
    } else {
      // Toggle ON (Like)
      const success = await onSupport(complaintId, 'LIKE');
      if (success) {
        setLocalLiked(true);
        setLikeCount(success.supports);
        setDislikeCount(success.dislikes);

        // If previously disliked, remove dislike
        if (localDisliked) {
          setLocalDisliked(false);
          const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
          const updatedDisliked = dislikedList.filter((id: string) => id !== complaintId);
          localStorage.setItem("disliked_complaints", JSON.stringify(updatedDisliked));
        }

        const likedList = JSON.parse(localStorage.getItem("liked_complaints") || "[]");
        if (!likedList.includes(complaintId)) {
          likedList.push(complaintId);
          localStorage.setItem("liked_complaints", JSON.stringify(likedList));
        }

        toast.success("Aspirasi disukai!");

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("local-disliked-change"));
        }
      }
    }

    setIsSubmitting(false);
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk memberikan dislike.");
      return;
    }

    const success = await onSupport(complaintId, 'DISLIKE');
    if (success) {
      setLikeCount(success.supports);
      setDislikeCount(success.dislikes);
      setLocalDisliked(true);
      setLocalLiked(false);

      const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
      if (!dislikedList.includes(complaintId)) {
        dislikedList.push(complaintId);
        localStorage.setItem("disliked_complaints", JSON.stringify(dislikedList));
      }
      const likedList = JSON.parse(localStorage.getItem("liked_complaints") || "[]");
      const updatedLiked = likedList.filter((id: string) => id !== complaintId);
      localStorage.setItem("liked_complaints", JSON.stringify(updatedLiked));

      toast.info("Aspirasi disembunyikan karena dislike.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-disliked-change"));
      }
    }
  };

  const handleUndoDislike = async () => {
    const success = await onSupport(complaintId, 'UNDISLIKE');
    if (success) {
      setLocalDisliked(false);
      setDislikeCount(success.dislikes);
      const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
      const updatedDisliked = dislikedList.filter((id: string) => id !== complaintId);
      localStorage.setItem("disliked_complaints", JSON.stringify(updatedDisliked));

      toast.success("Dislike dibatalkan.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-disliked-change"));
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4.5">
      {/* Stats Card: Dukungan Suka */}
      <div className="bg-linear-to-br from-red-50/70 to-rose-50/30 border border-red-100/90 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10.5px] font-extrabold text-red-700/80 uppercase tracking-wider block">
            Dukungan Suka
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block">
            {likeCount.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white shadow-2xs border border-red-100/80 flex items-center justify-center text-red-600 shrink-0">
          <ThumbsUp className={`h-5 w-5 ${localLiked ? "fill-red-600" : ""}`} />
        </div>
      </div>

      {/* Action Buttons Grid (Structured 2-column layout to prevent any overflow) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Like / Unlike Button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={isSubmitting}
          className={`h-11 px-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shadow-2xs ${
            localLiked
              ? "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20 border border-red-600"
              : "bg-white text-slate-700 hover:text-red-600 hover:bg-red-50/60 border border-slate-200/90 hover:border-red-200"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className={`h-4 w-4 shrink-0 ${localLiked ? "fill-white text-white" : "text-slate-500 group-hover:text-red-600"}`} />
          )}
          <span className="truncate">{localLiked ? "Disukai" : "Suka"}</span>
        </button>

        {/* Dislike / Undo Dislike Button */}
        {localDisliked ? (
          <button
            type="button"
            onClick={handleUndoDislike}
            className="h-11 px-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all bg-slate-800 text-white hover:bg-slate-900 border border-slate-800 shadow-md shadow-slate-900/10 cursor-pointer active:scale-95 select-none"
          >
            <ThumbsDown className="h-4 w-4 fill-white text-white shrink-0" />
            <span className="truncate">Batal Dislike</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDislike}
            className="h-11 px-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs cursor-pointer active:scale-95 select-none"
          >
            <ThumbsDown className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="truncate">Dislike</span>
          </button>
        )}
      </div>

      {/* Owner Notice or Login Prompt */}
      {isOwner ? (
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
            <Heart className="h-3.5 w-3.5 fill-red-500" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">Aspirasi Anda</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Ini adalah laporan yang Anda buat. Anda dapat memantau perkembangan penyelesaiannya di sini.
            </p>
          </div>
        </div>
      ) : (
        !isAuthenticated && (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <LogIn className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Ingin memberi dukungan?</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">Masuk untuk memberi suka atau masukan.</p>
              </div>
            </div>
            <Link
              href={`/login?redirect=/complaints/${complaintId}`}
              className="shrink-0 h-8 px-3.5 inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <LogIn className="h-3 w-3" />
              <span>Masuk</span>
            </Link>
          </div>
        )
      )}
    </div>
  );
}
