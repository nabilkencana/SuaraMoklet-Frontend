import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, CreateComplaintRequest, ComplaintUnit } from "@/types/complaint";

// ─── Mock Demo Data (used when backend is unavailable) ────────────────────────

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "demo-001",
    title: "AC Laboratorium RPL 2 Sering Mati",
    description:
      "Kami siswa kelas XII RPL 2 sering mengalami kendala serius saat praktikum di laboratorium komputer lantai 3. Dua unit AC di ruangan tersebut sering mati mendadak atau tidak terasa dingin sama sekali, terutama pada jam 10.00–13.00 saat suhu di luar sangat panas.\n\nKondisi ini sangat mengganggu konsentrasi belajar. Ketika ruangan panas, siswa menjadi tidak fokus, cepat lelah, dan produktivitas belajar menurun drastis. Beberapa siswa bahkan pernah merasa pusing dan mual akibat kondisi tersebut. Hal ini sudah berlangsung selama lebih dari 3 minggu dan belum ada tindak lanjut dari pihak sekolah.\n\nKami juga telah mencoba melapor secara lisan kepada guru piket namun belum ada respons konkret hingga saat ini.",
    expectedOutput:
      "Kami memohon agar unit AC di Laboratorium RPL 2 segera diperiksa oleh teknisi berpengalaman. Jika kerusakan bersifat minor, harap segera diperbaiki. Jika unit sudah terlalu tua dan tidak layak, kami mengharapkan pertimbangan pengadaan unit AC baru demi kenyamanan kegiatan belajar-mengajar.",
    unit: "Sarpras",
    status: "IN_PROGRESS",
    isAnonymous: false,
    evidenceUrl: "/images/lab_ac_rusak.png",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 342,
    targetSupports: 500,
    isSupported: false,
    reporter: { id: "demo-user-001", name: "Andi Maulana" },
    timeline: [
      {
        id: "t1",
        title: "Keluhan Dibuat",
        description: "Keluhan resmi diajukan ke platform SuaraMoklet oleh Andi Maulana, perwakilan kelas XII RPL 2.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t2",
        title: "Diteruskan ke Unit Sarpras",
        description: "Admin SuaraMoklet telah memverifikasi laporan dan meneruskannya ke Kepala Unit Sarana dan Prasarana untuk ditindaklanjuti segera.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t3",
        title: "Jadwal Pengecekan Teknis",
        description: "Unit Sarpras telah menjadwalkan kunjungan teknisi pada Rabu, 26 Juni 2026 untuk melakukan pemeriksaan menyeluruh terhadap 2 unit AC di Lab RPL 2.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "demo-002",
    title: "Jadwal Ekskul Basket Bentrok dengan Pramuka",
    description:
      "Jadwal ekstrakurikuler basket dan pramuka yang ditetapkan oleh pihak Kesiswaan seringkali terjadi pada hari dan jam yang sama, yaitu setiap Rabu pukul 15.00–17.00 WIB.\n\nKondisi ini sangat menyulitkan siswa yang ingin mengikuti kedua kegiatan tersebut. Banyak siswa yang akhirnya harus memilih salah satu, padahal keduanya merupakan kegiatan yang wajib diikuti sebagai bagian dari penilaian ekstrakurikuler.\n\nSudah dua bulan masalah ini berlangsung dan sudah ada beberapa siswa yang mendapatkan nilai buruk di salah satu ekskul karena tidak bisa hadir akibat bentrok jadwal ini.",
    expectedOutput:
      "Mohon kepada pihak Kesiswaan untuk meninjau kembali jadwal ekstrakurikuler dan memisahkan jadwal basket dan pramuka ke hari yang berbeda. Alternatifnya, bisa dialihkan ke hari Kamis atau Jumat yang relatif lebih longgar.",
    unit: "Kesiswaan",
    status: "OPEN",
    isAnonymous: true,
    evidenceUrl: "/images/ekskul_bentrok.png",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 88,
    targetSupports: 200,
    isSupported: false,
    reporter: null,
    timeline: [
      {
        id: "t4",
        title: "Keluhan Dibuat",
        description: "Keluhan diajukan secara anonim ke platform SuaraMoklet. Identitas pelapor dijaga kerahasiaannya.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t5",
        title: "Menunggu Verifikasi",
        description: "Keluhan ini sedang dalam proses verifikasi oleh admin SuaraMoklet sebelum diteruskan ke unit terkait.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "demo-003",
    title: "Keran Air Toilet Gedung C Bocor",
    description:
      "Keran air di toilet lantai 2 Gedung C (dekat ruang kelas XII IPA 3) terus menerus mengeluarkan air walaupun sudah diputar penuh ke posisi tertutup. Kebocoran ini menyebabkan air tergenang di lantai toilet yang membuat kondisi menjadi licin dan berbahaya bagi siswa.\n\nSelain itu, pemborosan air akibat keran bocor ini jelas berdampak pada tagihan air sekolah. Sudah ada seorang siswa yang hampir terjatuh akibat lantai yang licin. Kami khawatir akan terjadi kecelakaan yang lebih serius jika tidak segera ditangani.\n\nMasalah ini sudah terjadi selama lebih dari 2 minggu. Kami telah melaporkan ke penjaga sekolah namun belum ada perbaikan.",
    expectedOutput:
      "Harap segera dilakukan perbaikan atau penggantian keran air yang bocor oleh teknisi dari Unit Sarpras. Selain itu, mohon juga dilakukan pengecekan rutin terhadap seluruh fasilitas toilet di gedung C agar kondisi serupa tidak terulang.",
    unit: "Sarpras",
    status: "CLOSED",
    isAnonymous: false,
    evidenceUrl: "/images/parkir_sekolah.png",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    supports: 45,
    targetSupports: 100,
    isSupported: true,
    reporter: { id: "demo-user-001", name: "Demo Siswa" },
    timeline: [
      {
        id: "t6",
        title: "Keluhan Dibuat",
        description: "Keluhan resmi diajukan ke platform SuaraMoklet.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t7",
        title: "Diteruskan ke Unit Sarpras",
        description: "Laporan diteruskan ke Unit Sarana dan Prasarana untuk pengecekan kondisi keran.",
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t8",
        title: "Perbaikan Dilakukan",
        description: "Teknisi dari Unit Sarpras telah memperbaiki keran bocor dan melakukan pengecekan menyeluruh pada toilet Gedung C.",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t9",
        title: "Keluhan Diselesaikan",
        description: "Keluhan dinyatakan selesai. Keran air telah berfungsi normal dan lantai toilet telah dibersihkan. Terima kasih atas laporan yang konstruktif!",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useComplaint(complaintId?: string) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [units, setUnits] = useState<ComplaintUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOwnComplaints = async () => {
    setIsLoading(true);
    try {
      const raw = await apiClient.complaints.getOwn();
      // Normalize: backend may wrap the list as { data: [...] } or return object
      const list: Complaint[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];
      setComplaints(list);
    } catch {
      // Fallback to mock data when backend is unavailable
      setComplaints(MOCK_COMPLAINTS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplaintById = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.complaints.getById(id);
      setCurrentComplaint(data);
      return data;
    } catch {
      // Fallback: find in mock data
      const mock = MOCK_COMPLAINTS.find((c) => c.id === id);
      if (mock) {
        setCurrentComplaint(mock);
        return mock;
      }
      toast.error("Keluhan tidak ditemukan");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await apiClient.units.getAll();
      setUnits(data);
    } catch {
      setUnits(["Umum (ISO)", "Sarpras", "Kurikulum", "Kesiswaan", "Hubin", "Tata Usaha"]);
    }
  };

  const createComplaint = async (data: CreateComplaintRequest) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.complaints.create(data);
      toast.success("Keluhan berhasil dibuat!");
      return res;
    } catch {
      // Mock: create a fake complaint when backend is unavailable
      await new Promise((r) => setTimeout(r, 800));
      const mockResult: Complaint = {
        id: `demo-${Date.now()}`,
        title: data.title,
        description: data.description,
        expectedOutput: data.expectedOutput,
        unit: data.unit,
        status: "OPEN",
        isAnonymous: data.isAnonymous,
        evidenceUrl: data.evidenceUrl,
        createdAt: new Date().toISOString(),
        supports: 0,
        targetSupports: 500,
        isSupported: false,
        reporter: { id: "demo-user-001", name: "Demo Siswa" },
        timeline: [
          {
            id: `t-${Date.now()}`,
            title: "Keluhan Dibuat",
            description: "Keluhan resmi diajukan ke platform SuaraMoklet.",
            createdAt: new Date().toISOString(),
          },
        ],
      };
      // Store it locally so detail page can show it
      MOCK_COMPLAINTS.unshift(mockResult);
      toast.success("Keluhan berhasil dibuat! (Mode Demo)");
      return mockResult;
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportComplaint = async (id: string, name?: string, comment?: string) => {
    try {
      const res = await apiClient.complaints.support(id, { name, comment });
      toast.success("Dukungan Anda berhasil dikirim!");
      if (currentComplaint && currentComplaint.id === id) {
        setCurrentComplaint((prev) =>
          prev ? { ...prev, supports: res.supports, isSupported: true } : null
        );
      }
      return true;
    } catch {
      // Mock: increment support count locally
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Dukungan Anda berhasil dikirim! (Mode Demo)");
      if (currentComplaint && currentComplaint.id === id) {
        setCurrentComplaint((prev) =>
          prev ? { ...prev, supports: prev.supports + 1, isSupported: true } : null
        );
      }
      return true;
    }
  };

  const uploadEvidence = async (file: File): Promise<string | null> => {
    try {
      const res = await apiClient.upload.uploadFile(file);
      return res.url;
    } catch {
      // Mock: create a temporary object URL for preview
      await new Promise((r) => setTimeout(r, 600));
      const objectUrl = URL.createObjectURL(file);
      toast.success("Foto berhasil diunggah! (Mode Demo — preview lokal)");
      return objectUrl;
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
