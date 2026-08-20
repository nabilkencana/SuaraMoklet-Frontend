import { Building2, Users, BookOpen, Briefcase, FileText } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { Comment } from "@/types/comment";

export const UNIT_META_MAP: Record<string, { icon: any; name: string; description: string }> = {
  SARPRA: { icon: Building2, name: "Sarana & Prasarana", description: "Gedung, peralatan & infrastruktur" },
  Sarpras: { icon: Building2, name: "Sarana & Prasarana", description: "Gedung, peralatan & infrastruktur" },
  KESISWAAN: { icon: Users, name: "Kesiswaan", description: "Kedisiplinan, OSIS & kegiatan siswa" },
  Kesiswaan: { icon: Users, name: "Kesiswaan", description: "Kedisiplinan, OSIS & kegiatan siswa" },
  KURIKULUM: { icon: BookOpen, name: "Kurikulum", description: "Akademik, jadwal kelas & ujian" },
  Kurikulum: { icon: BookOpen, name: "Kurikulum", description: "Akademik, jadwal kelas & ujian" },
  HUBINKOM: { icon: Briefcase, name: "Hubin / Humas", description: "Hubungan industri & PKL" },
  Hubin: { icon: Briefcase, name: "Hubin / Humas", description: "Hubungan industri & PKL" },
  TATA_USAHA: { icon: FileText, name: "Tata Usaha (TU)", description: "Administrasi & keuangan" },
  "Tata Usaha": { icon: FileText, name: "Tata Usaha (TU)", description: "Administrasi & keuangan" },
  ISO: { icon: Building2, name: "Umum", description: "Kebijakan mutu & operasional umum" },
  Umum: { icon: Building2, name: "Umum", description: "Kebijakan mutu & operasional umum" },
};
