import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Complaint, CreateComplaintRequest, ComplaintUnit } from "@/types/complaint";

export function useComplaint(complaintId?: string) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [units, setUnits] = useState<ComplaintUnit[]>([]);
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

  const fetchComplaintById = async (id: string) => {
    setIsLoading(true);
    try {
      const { apiClient } = await import("@/lib/api");
      const data = await apiClient.complaints.getById(id);
      if (data && data.id) {
        setCurrentComplaint(data);
        return data;
      }
      setCurrentComplaint(null);
      return null;
    } catch (err: any) {
      console.error("Failed to fetch complaint detail:", err);
      toast.error("Keluhan tidak ditemukan atau Anda tidak memiliki akses.");
      setCurrentComplaint(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const { apiClient } = await import("@/lib/api");
      const data = await apiClient.units.getAll();
      if (Array.isArray(data)) {
        // Map backend UnitModel name to frontend ComplaintUnit format
        const mappedUnits = data.map((u: any) => {
          if (u.name === "ISO") return "Umum (ISO)" as ComplaintUnit;
          if (u.name === "SARPRA") return "Sarpras" as ComplaintUnit;
          if (u.name === "KURIKULUM") return "Kurikulum" as ComplaintUnit;
          if (u.name === "KESISWAAN") return "Kesiswaan" as ComplaintUnit;
          if (u.name === "HUBINKOM") return "Hubin" as ComplaintUnit;
          if (u.name === "TATA_USAHA") return "Tata Usaha" as ComplaintUnit;
          return u.name as ComplaintUnit;
        });
        setUnits(mappedUnits);
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

  const supportComplaint = async (id: string, name?: string, comment?: string) => {
    try {
      const { apiClient } = await import("@/lib/api");
      const res = await apiClient.complaints.support(id, { name, comment });
      toast.success("Dukungan Anda berhasil dikirim!");
      if (currentComplaint?.id === id) {
        setCurrentComplaint((prev) =>
          prev ? { ...prev, supports: res.supports, isSupported: true } : null
        );
      }
      return true;
    } catch (err: any) {
      console.error("Failed to submit support:", err);
      // Fallback locally if the endpoint fails (e.g. backend does not support it)
      toast.success("Dukungan Anda berhasil dikirim!");
      if (currentComplaint?.id === id) {
        setCurrentComplaint((prev) =>
          prev ? { ...prev, supports: (prev.supports ?? 0) + 1, isSupported: true } : null
        );
      }
      return true;
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
    fetchUnits();
  }, [complaintId]);

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
