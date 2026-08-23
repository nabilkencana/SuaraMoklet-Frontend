import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Comment, CreateCommentRequest } from "@/types/comment";

const POLL_INTERVAL_MS = 5000; // 5 seconds

export function useComments(complaintId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchComments = useCallback(async (silent = false) => {
    if (!complaintId) return;
    if (!silent) setIsLoading(true);

    try {
      const { apiClient } = await import("@/lib/api");
      // api.ts flattenComments already returns a flat, sorted list with parent references
      const data = await apiClient.comments.getByComplaintId(complaintId);
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
  }, [complaintId]);

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
