import { z } from "zod";

export const complaintSchema = z.object({
  title: z.string().min(5, "Judul keluhan minimal harus 5 karakter"),
  description: z
    .string()
    .min(1, "Deskripsi keluhan tidak boleh kosong")
    .trim()
    .refine((val) => val.length > 0, "Deskripsi keluhan wajib diisi"),
  expectedOutput: z.string().optional(),
  unit: z.string().min(1, "Harap pilih unit kerja yang berwenang"),
  isAnonymous: z.boolean(),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

export const getFallbackUnitDescription = (unitName: string) => {
  const norm = unitName.toLowerCase();
  if (norm.includes("kurikulum")) return "Proses pembelajaran kelas, jadwal pelajaran, kegiatan akademis, ujian/tes, dan rapor.";
  if (norm.includes("kesiswaan")) return "Tata tertib, kedisiplinan siswa, beasiswa, ekstrakurikuler, OSIS/MPK, dan pembinaan karakter.";
  if (norm.includes("humas") || norm.includes("hubin")) return "Kerjasama luar, program magang/PKL, kunjungan industri, dan hubungan alumni/karir.";
  if (norm.includes("sarpras")) return "Kerusakan sarana prasarana sekolah, fasilitas kelas, AC/listrik, kebersihan, dan gedung.";
  if (norm.includes("tata usaha") || norm.includes("tu")) return "Surat-menyurat, legalisir ijazah/rapor, kartu pelajar, keuangan, dan dokumen administrasi.";
  return "Kebijakan operasional umum, tata kelola, dan koordinasi manajemen sekolah.";
};
