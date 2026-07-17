import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Comment, CreateCommentRequest } from "@/types/comment";

export function useComments(complaintId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!complaintId) return;
    setIsLoading(true);

    try {
      const { apiClient } = await import("@/lib/api");
      const data = await apiClient.comments.getByComplaintId(complaintId);
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err: any) {
      console.error("Failed to load comments:", err);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (data: CreateCommentRequest) => {
    if (!complaintId) return null;
    setIsSubmitting(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const newComment = await apiClient.comments.create(complaintId, data);
      if (newComment && newComment.id) {
        toast.success("Tanggapan berhasil dikirim!");
        await fetchComments();
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

  useEffect(() => {
    if (complaintId) {
      fetchComments();
    }
  }, [complaintId]);

  return {
    comments,
    isLoading,
    isSubmitting,
    refetch: fetchComments,
    addComment,
  };
}

export default useComments;
