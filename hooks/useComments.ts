import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Comment, CreateCommentRequest } from "@/types/comment";

const POLL_INTERVAL_MS = 5000; // 5 seconds

// F4 FIX (HI-2): Tambahkan context anonimitas agar identitas pelapor anonim
// tersensor ketika mereka berkomentar di complaint mereka sendiri.
// Skenario serangan: nama asli pelapor anonim terekspos via endpoint komentar.
interface UseCommentsOptions {
  /** ID author complaint. Digunakan untuk sensor jika complaint anonim. */
  complaintAuthorId?: string;
  /** Apakah complaint ini anonim? */
  isAnonymousComplaint?: boolean;
}

export function useComments(complaintId: string, options: UseCommentsOptions = {}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchComments = useCallback(async (silent = false) => {
    if (!complaintId) return;
    if (!silent) setIsLoading(true);

    try {
      const { apiClient } = await import("@/lib/api");
      // F4: Teruskan context anonimitas ke API agar sensor diterapkan
      const data = await apiClient.comments.getByComplaintId(complaintId, {
        complaintAuthorId: options.complaintAuthorId,
        isAnonymousComplaint: options.isAnonymousComplaint,
      });
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err: any) {
      if (!silent) {
        console.error("Failed to load comments:", err);
        setComments([]);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId, options.complaintAuthorId, options.isAnonymousComplaint]);

  const addComment = async (data: CreateCommentRequest) => {
    if (!complaintId) return null;
    setIsSubmitting(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const newComment = await apiClient.comments.create(complaintId, data);
      if (newComment && newComment.id) {
        toast.success("Tanggapan berhasil dikirim!");
        // Refetch to get full parent relations
        await fetchComments(true);
        return newComment;
      }
      return null;
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      const msg = err.response?.data?.message || "Gagal mengirim tanggapan.";
      toast.error(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial fetch + polling
  useEffect(() => {
    if (complaintId) {
      fetchComments();
      // Start polling for realtime updates
      pollRef.current = setInterval(() => {
        fetchComments(true);
      }, POLL_INTERVAL_MS);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [complaintId, fetchComments]);

  return {
    comments,
    isLoading,
    isSubmitting,
    refetch: fetchComments,
    addComment,
  };
}

export default useComments;

