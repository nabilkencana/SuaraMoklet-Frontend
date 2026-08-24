import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Complaint, CreateComplaintRequest, ComplaintUnit, UnitModel } from "@/types/complaint";

export function useComplaint(complaintId?: string, options?: { skipFetchUnits?: boolean }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [units, setUnits] = useState<UnitModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOwnComplaints = async () => {
    setIsLoading(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const raw = await apiClient.complaints.getOwn();
      if (Array.isArray(raw)) {
        setComplaints(raw);
      } else {
        setComplaints([]);
      }
    } catch (err: any) {
      console.error("Failed to load own complaints:", err);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplaintById = async (id: string, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const data = await apiClient.complaints.getById(id, silent);
      if (data && data.id) {
        setCurrentComplaint(data);
        return data;
      }
      setCurrentComplaint(null);
      return null;
    } catch (err: any) {
      console.error("Failed to fetch complaint detail:", err);
      if (!silent) {
        toast.error("Keluhan tidak ditemukan atau Anda tidak memiliki akses.");
      }
      setCurrentComplaint(null);
      return null;
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const { apiClient } = await import("@/lib/api");
      const data = await apiClient.units.getAll();
      if (Array.isArray(data)) {
        setUnits(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch units list:", err);
    }
  };

  const createComplaint = async (data: CreateComplaintRequest) => {
    setIsSubmitting(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const res = await apiClient.complaints.create(data);
      if (res && res.id) {
        toast.success("Keluhan berhasil dibuat!");
        return res;
      }
      return null;
    } catch (err: any) {
      console.error("Failed to submit complaint:", err);
      const errMsg = err.response?.data?.message || "Gagal membuat keluhan.";
      toast.error(errMsg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportComplaint = async (id: string, action: 'LIKE' | 'UNLIKE' | 'DISLIKE' | 'UNDISLIKE') => {
    try {
      const { apiClient } = await import("@/lib/api");
      const res = await apiClient.complaints.support(id, { action });
      return res; // { supports: number, dislikes: number }
    } catch (err: any) {
      console.error("Failed to submit interaction:", err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan dukungan.");
      return null;
    }
  };

  const uploadEvidence = async (file: File): Promise<string | null> => {
    try {
      const { apiClient } = await import("@/lib/api");
      const res = await apiClient.upload.uploadFile(file);
      return res.url;
    } catch (err: any) {
      console.error("Failed to upload evidence file:", err);
      toast.error("Gagal mengunggah file bukti.");
      return null;
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchComplaintById(complaintId);
    }
    if (!options?.skipFetchUnits) {
      fetchUnits();
    }
  }, [complaintId, options?.skipFetchUnits]);

  return {
    complaints,
    currentComplaint,
    units,
    isLoading,
    isSubmitting,
    fetchOwnComplaints,
    fetchComplaintById,
    createComplaint,
    supportComplaint,
    uploadEvidence,
  };
}

export default useComplaint;
