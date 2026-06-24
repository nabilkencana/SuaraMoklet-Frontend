import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Comment, CreateCommentRequest } from "@/types/comment";

// ─── Mock Demo Comments ───────────────────────────────────────────────────────

const MOCK_COMMENTS: Comment[] = [
  // ─── demo-001: AC Lab RPL 2 ───────────────────────────────────────────────
  {
    id: "c-001",
    complaintId: "demo-001",
    content:
      "Terima kasih atas laporannya. Tim kami sudah memeriksa kondisi AC di Lab RPL 2 dan menemukan bahwa 2 dari 3 unit memang memerlukan perbaikan komponen kapasitor. Teknisi dijadwalkan datang Rabu ini pukul 08.00 WIB.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: true,
    user: {
      id: "pic-001",
      name: "Bpk. Hendra — PIC Sarpras",
      email: "sarpras@moklet.sch.id",
      role: "UNIT_PIC",
    },
  },
  {
    id: "c-002",
    complaintId: "demo-001",
    content:
      "Terima kasih Pak Hendra! Kami sangat menghargai respons cepat dari Unit Sarpras. Kami akan pastikan ruangan Lab RPL 2 bisa diakses teknisi pada Rabu pagi.",
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: false,
    user: {
      id: "demo-user-001",
      name: "Andi Maulana",
      email: "demo@student.moklet.org",
      role: "USER",
    },
  },
  {
    id: "c-003",
    complaintId: "demo-001",
    content:
      "Saya juga merasakan hal yang sama saat praktikum minggu lalu. Suhu di dalam sangat tidak nyaman. Semoga perbaikan bisa segera selesai. Kami dukung penuh keluhan ini!",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    isPic: false,
    user: {
      id: "user-002",
      name: "Reza Pratama",
      email: "reza@student.moklet.org",
      role: "USER",
    },
  },
  {
    id: "c-004",
    complaintId: "demo-001",
    content:
      "Update: Teknisi sudah selesai melakukan pengecekan hari ini. Kapasitor pada 2 unit AC berhasil diganti. Kedua unit sudah berfungsi normal. Mohon konfirmasi dari pelapor apakah sudah terasa perbaikannya.",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isPic: true,
    user: {
      id: "pic-001",
      name: "Bpk. Hendra — PIC Sarpras",
      email: "sarpras@moklet.sch.id",
      role: "UNIT_PIC",
    },
  },

  // ─── demo-002: Ekskul Bentrok ─────────────────────────────────────────────
  {
    id: "c-005",
    complaintId: "demo-002",
    content:
      "Kami dari OSIS sudah mencoba mengkomunikasikan masalah ini ke Pembina Pramuka dan Pelatih Basket. Rencananya akan ada rapat koordinasi ekskul minggu depan untuk menyusun jadwal yang tidak bentrok.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: false,
    user: {
      id: "user-003",
      name: "Ketua OSIS",
      email: "osis@moklet.sch.id",
      role: "USER",
    },
  },
  {
    id: "c-006",
    complaintId: "demo-002",
    content:
      "Laporan ini sudah kami terima dan akan kami bahas dalam rapat koordinasi Kesiswaan pada Senin, 28 Juni 2026. Mohon sabar menunggu hasilnya.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: true,
    user: {
      id: "pic-002",
      name: "Ibu Sari — Waka Kesiswaan",
      email: "kesiswaan@moklet.sch.id",
      role: "UNIT_PIC",
    },
  },

  // ─── demo-003: Keran Bocor ────────────────────────────────────────────────
  {
    id: "c-007",
    complaintId: "demo-003",
    content:
      "Laporan ini sangat valid. Saya sendiri hampir terpeleset kemarin sore di toilet Gedung C. Kondisi lantai sangat licin akibat air yang terus mengalir dari keran bocor tersebut.",
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: false,
    user: {
      id: "user-004",
      name: "Siswa XII IPA 3",
      email: "siswa@student.moklet.org",
      role: "USER",
    },
  },
  {
    id: "c-008",
    complaintId: "demo-003",
    content:
      "Kami dari Unit Sarpras sudah mengirim teknisi pagi tadi. Keran air yang bocor sudah berhasil diganti dengan yang baru. Mohon konfirmasi apakah kondisi sudah normal.",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: true,
    user: {
      id: "pic-001",
      name: "Bpk. Hendra — PIC Sarpras",
      email: "sarpras@moklet.sch.id",
      role: "UNIT_PIC",
    },
  },
  {
    id: "c-009",
    complaintId: "demo-003",
    content:
      "Sudah normal Pak! Keran sudah tidak bocor lagi dan lantai sudah kering. Terima kasih banyak atas respons yang cepat dari Unit Sarpras. Sangat diapresiasi!",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isPic: false,
    user: {
      id: "demo-user-001",
      name: "Demo Siswa",
      email: "demo@student.moklet.org",
      role: "USER",
    },
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useComments(complaintId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!complaintId) return;
    setIsLoading(true);
    try {
      const data = await apiClient.comments.getByComplaintId(complaintId);
      setComments(data);
    } catch {
      // Fallback: return mock comments for the given complaint
      const mockForComplaint = MOCK_COMMENTS.filter(
        (c) => c.complaintId === complaintId
      );
      setComments(mockForComplaint);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (data: CreateCommentRequest) => {
    if (!complaintId) return null;
    setIsSubmitting(true);
    try {
      const newComment = await apiClient.comments.create(complaintId, data);
      toast.success("Tanggapan berhasil dikirim!");
      await fetchComments();
      return newComment;
    } catch {
      // Mock: append comment locally
      await new Promise((r) => setTimeout(r, 500));
      const mockNew: Comment = {
        id: `c-${Date.now()}`,
        complaintId,
        content: data.content,
        evidenceUrl: data.evidenceUrl,
        createdAt: new Date().toISOString(),
        isPic: false,
        user: {
          id: "demo-user-001",
          name: "Demo Siswa",
          email: "demo@student.moklet.org",
          role: "USER",
        },
      };
      setComments((prev) => [...prev, mockNew]);
      toast.success("Tanggapan berhasil dikirim! (Mode Demo)");
      return mockNew;
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
