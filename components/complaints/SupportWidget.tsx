"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Loader2, LogIn, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";

interface SupportWidgetProps {
  complaintId: string;
  supports: number;
  isSupported?: boolean;
  isOwner?: boolean;
  onSupport: (id: string, name?: string, comment?: string) => Promise<boolean>;
}

export default function SupportWidget({
  complaintId,
  supports,
  isSupported = false,
  isOwner = false,
  onSupport,
}: SupportWidgetProps) {
  const { isAuthenticated } = useAuthStore();
  const [localLiked, setLocalLiked] = useState<boolean>(false);
  const [localDisliked, setLocalDisliked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedList = JSON.parse(localStorage.getItem("liked_complaints") || "[]");
      const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
      setLocalLiked(likedList.includes(complaintId) || isSupported);
      setLocalDisliked(dislikedList.includes(complaintId));
    }
  }, [complaintId, isSupported]);

  const handleLike = async () => {
    if (isOwner) {
      toast.error("Anda tidak bisa menyukai aspirasi milik Anda sendiri.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Silakan login untuk menyukai aspirasi ini.");
      return;
    }
    if (localLiked) return;

    setIsSubmitting(true);
    const success = await onSupport(complaintId);
    if (success) {
      setLocalLiked(true);
      setLocalDisliked(false);
      const likedList = JSON.parse(localStorage.getItem("liked_complaints") || "[]");
      if (!likedList.includes(complaintId)) {
        likedList.push(complaintId);
        localStorage.setItem("liked_complaints", JSON.stringify(likedList));
      }
      const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
      const updatedDisliked = dislikedList.filter((id: string) => id !== complaintId);
      localStorage.setItem("disliked_complaints", JSON.stringify(updatedDisliked));
      
      toast.success("Aspirasi disukai!");
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-disliked-change"));
      }
    }
    setIsSubmitting(false);
  };

  const handleDislike = () => {
    if (isOwner) {
      toast.error("Anda tidak bisa memberikan dislike pada aspirasi milik Anda sendiri.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Silakan login untuk memberikan dislike.");
      return;
    }

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
  };

  const handleUndoDislike = () => {
    setLocalDisliked(false);
    const dislikedList = JSON.parse(localStorage.getItem("disliked_complaints") || "[]");
    const updatedDisliked = dislikedList.filter((id: string) => id !== complaintId);
    localStorage.setItem("disliked_complaints", JSON.stringify(updatedDisliked));
    
    toast.success("Dislike dibatalkan.");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("local-disliked-change"));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="block text-2xl font-extrabold text-slate-800 leading-none">
            {supports}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 block">
            Jumlah Suka
          </span>
        </div>

        <div className="flex gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isSubmitting || localLiked}
            className={`h-11 px-4 rounded-xl flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
              localLiked
                ? "bg-red-50 border-red-200 text-red-650"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`h-4 w-4 ${localLiked ? "fill-red-600" : ""}`} />
            )}
            <span>Like</span>
          </button>

          {/* Dislike Button */}
          {localDisliked ? (
            <button
              onClick={handleUndoDislike}
              className="h-11 px-4 rounded-xl flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-wider transition-all bg-slate-100 border-slate-200 text-slate-800 cursor-pointer"
            >
              <ThumbsDown className="h-4 w-4 fill-slate-700" />
              <span>Undo Dislike</span>
            </button>
          ) : (
            <button
              onClick={handleDislike}
              className="h-11 px-4 rounded-xl flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-wider transition-all bg-white border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>Dislike</span>
            </button>
          )}
        </div>
      </div>

      {isOwner ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
            <Heart className="h-4 w-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aspirasi Anda</h5>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              Ini adalah aspirasi yang Anda buat sendiri.
            </p>
          </div>
        </div>
      ) : !isAuthenticated && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Ingin merespon?</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Login untuk menyukai atau menyembunyikan aspirasi.</p>
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
      )}
    </div>
  );
}
