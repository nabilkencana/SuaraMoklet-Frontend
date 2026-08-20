import { z } from "zod";

export const complaintSchema = z.object({
  title: z.string().min(5, "Judul keluhan minimal harus 5 karakter"),
  description: z
    .string()
    .min(1, "Deskripsi keluhan tidak boleh kosong")
    .trim()
    .refine((val) => val.length > 0, "Deskripsi keluhan wajib diisi"),
  expectedOutput: z.string().optional(),
  unit: z.enum([
    "Umum",
    "Umum (ISO)",
    "Sarpras",
    "Kurikulum",
    "Kesiswaan",
    "Hubin",
    "Tata Usaha",
  ] as const),
  isAnonymous: z.boolean(),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

export const UNIT_DETAILS = [
  {
    name: "Umum" as const,
    desc: "Kebijakan mutu pelayanan, kritik operasional umum, tata kelola, dan koordinasi sekolah.",
  },
  {
    name: "Sarpras" as const,
    desc: "Kerusakan sarana prasarana sekolah, fasilitas kelas, AC/listrik, kebersihan, dan gedung.",
  },
  {
    name: "Kurikulum" as const,
    desc: "Proses pembelajaran kelas, jadwal pelajaran, kegiatan akademis, ujian/tes, dan rapor.",
  },
  {
    name: "Kesiswaan" as const,
    desc: "Tata tertib, kedisiplinan siswa, beasiswa, ekstrakurikuler, OSIS/MPK, dan pembinaan karakter.",
  },
  {
    name: "Hubin" as const,
    desc: "Kerjasama luar, program magang/PKL, kunjungan industri, dan hubungan alumni/karir.",
  },
  {
    name: "Tata Usaha" as const,
    desc: "Surat-menyurat, legalisir ijazah/rapor, kartu pelajar, keuangan, dan dokumen administrasi.",
  },
];
