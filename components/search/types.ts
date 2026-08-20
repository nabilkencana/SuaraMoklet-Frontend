import {
  Globe,
  GraduationCap,
  Wrench,
  Users,
  BookOpen,
  Building2,
  Leaf,
} from "lucide-react";

export const TOPICS = [
  "Semua Topik",
  "Pendidikan",
  "Fasilitas",
  "Kesiswaan",
  "Kurikulum",
  "Umum",
  "Lingkungan",
];

export const TOPIC_CONFIGS = [
  {
    label: "Semua Topik",
    icon: Globe,
  },
  {
    label: "Pendidikan",
    icon: GraduationCap,
  },
  {
    label: "Fasilitas",
    icon: Wrench,
  },
  {
    label: "Kesiswaan",
    icon: Users,
  },
  {
    label: "Kurikulum",
    icon: BookOpen,
  },
  {
    label: "Umum",
    icon: Building2,
  },
  {
    label: "Lingkungan",
    icon: Leaf,
  },
];

export const STATUSES = [
  { value: "ALL", label: "Semua Status" },
  { value: "NEW", label: "Baru Diajukan (NEW)" },
  { value: "OPEN", label: "Sedang Diproses (OPEN)" },
  { value: "DONE", label: "Selesai (DONE)" },
];
