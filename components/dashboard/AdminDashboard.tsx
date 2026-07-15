"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import {
  Loader2,
  Building,
  Users,
  MessageSquare,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  UserPlus,
  ShieldCheck,
  Sliders,
  Settings,
  Bell,
  Search,
  Zap,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutDashboard,
  X,
  Forward,
  MoreVertical,
  GraduationCap,
  BookOpen,
  Briefcase,
  Pencil,
  Ban,
  House
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintUnit, UnitModel, ComplaintVisibility } from "@/types/complaint";
import { cn } from "@/lib/utils";

// Mock data fallbacks for simulation
const MOCK_UNITS: UnitModel[] = [
  { id: "unit-1", name: "Sarpras", description: "Sarana dan Prasarana Sekolah" },
  { id: "unit-2", name: "Kesiswaan", description: "Kesiswaan & Pembinaan Karakter" },
  { id: "unit-3", name: "Kurikulum", description: "Kurikulum & Proses Akademik" },
  { id: "unit-4", name: "Humas", description: "Hubungan Masyarakat & Kerja Sama Industri" },
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-1",
    title: "Kebocoran Pipa Lab Kimia",
    description: "Air terus mengalir dari pipa wastafel lab kimia lantai 2, membanjiri lantai dan merusak lemari penyimpanan.",
    unit: "Sarpras" as ComplaintUnit,
    status: "NEW",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), // 3 days ago
    supports: 42,
    visibility: "PUBLIC",
    category: "FASILITAS",
    reporter: { id: "u-1", name: "Siswa Moklet" },
  },
  {
    id: "complaint-2",
    title: "Update Kurikulum Merdeka",
    description: "Pertanyaan mengenai jadwal sosialisasi silabus baru untuk materi kejuruan IT.",
    unit: "Kurikulum" as ComplaintUnit,
    status: "IN_PROGRESS",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    supports: 8,
    visibility: "PRIVATE",
    category: "AKADEMIK",
    reporter: { id: "u-2", name: "Guru Moklet" },
  },
  {
    id: "complaint-3",
    title: "AC Ruang Guru Rusak",
    description: "AC di ruang guru utama mengeluarkan bunyi bising dan tidak dingin selama seminggu.",
    unit: "Sarpras" as ComplaintUnit,
    status: "WAITING_USER",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), // 5 days ago
    supports: 12,
    visibility: "PUBLIC",
    category: "FASILITAS",
    reporter: { id: "u-3", name: "Orang Tua Warga" },
  },
];

interface UnitMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isPic: boolean;
  unitId: string;
  unitName: string;
}

const getUnitIcon = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("kesiswaan")) return <GraduationCap className="h-5 w-5 text-white" />;
  if (norm.includes("kurikulum")) return <BookOpen className="h-5 w-5 text-white" />;
  if (norm.includes("humas") || norm.includes("hubinkom") || norm.includes("relations")) return <Briefcase className="h-5 w-5 text-white" />;
  return <Building className="h-5 w-5 text-white" />;
};

const getUnitIconBg = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("kesiswaan") || norm.includes("kurikulum")) return "bg-[#b61722]";
  return "bg-slate-700";
};

const getUnitDescription = (unit: UnitModel) => {
  if (unit.description) return unit.description;
  const norm = unit.name.toLowerCase();
  if (norm.includes("kurikulum")) return "Academic planning, syllabus management, and educational processes.";
  if (norm.includes("kesiswaan")) return "Student affairs, discipline, extracurricular activities, and counseling.";
  if (norm.includes("humas") || norm.includes("hubinkom")) return "Public relations, industry partnerships, and external relations.";
  if (norm.includes("sarpras")) return "Facilities, infrastructure maintenance, and resource management.";
  return "Management and operation of department resources.";
};

const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

const getUnitPIC = (unitId: string, unitName: string, unitMembers: UnitMember[]) => {
  const pic = unitMembers.find((m) => m.unitId === unitId && m.isPic);
  if (pic) return pic;
  const norm = unitName.toLowerCase();
  if (norm.includes("kurikulum")) return { name: "Ahmad Santoso", email: "ahmad@moklet.org", initials: "AS" };
  if (norm.includes("kesiswaan")) return { name: "Budi Mulyono", email: "budi@moklet.org", initials: "BM" };
  if (norm.includes("humas") || norm.includes("hubinkom")) return { name: "Dian Ratnasari", email: "dian@moklet.org", initials: "DR" };
  return { name: "Eko Prasetyo", email: "eko@moklet.org", initials: "EP" };
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "complaints" | "units" | "members">("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [units, setUnits] = useState<UnitModel[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [unitMembers, setUnitMembers] = useState<UnitMember[]>([]);

  // Filtering states
  const [tableTab, setTableTab] = useState<"all" | "urgent" | "unit">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD modal/form states
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDesc, setNewUnitDesc] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedUnitForMember, setSelectedUnitForMember] = useState("");
  const [memberIsPic, setMemberIsPic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delegasi modal
  const [selectedComplaintForForward, setSelectedComplaintForForward] = useState<Complaint | null>(null);
  const [forwardUnitId, setForwardUnitId] = useState("");
  const [forwardNote, setForwardNote] = useState("");

  // Units tab custom states
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");

  // User management tab custom states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");

  // Fetch Data Function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch units
      let loadedUnits: UnitModel[] = [];
      try {
        const raw = await apiClient.units.getAll();
        loadedUnits = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as { data?: unknown[] })?.data)
            ? (raw as { data?: UnitModel[] }).data || []
            : [];
      } catch (err) {
        loadedUnits = MOCK_UNITS;
      }
      if (loadedUnits.length === 0) {
        loadedUnits = MOCK_UNITS;
      }
      setUnits(loadedUnits);
      if (loadedUnits.length > 0) {
        setSelectedUnitForMember(loadedUnits[0].id);
        setForwardUnitId(loadedUnits[0].id);
        setSelectedUnitId(loadedUnits[0].id);
      }

      // 2. Fetch complaints
      let loadedComplaints: Complaint[] = [];
      try {
        const raw = await apiClient.complaints.getAll();
        const apiComplaints = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as { data?: unknown[] })?.data)
            ? (raw as { data?: Complaint[] }).data || []
            : [];
        loadedComplaints = apiComplaints.length > 0 ? apiComplaints : MOCK_COMPLAINTS;
      } catch (err) {
        loadedComplaints = MOCK_COMPLAINTS;
      }
      setComplaints(loadedComplaints);

      // Generate dummy members for view
      const mockMembers = [
        { id: "u-1", name: "Budi Santoso", email: "budi@moklet.org", role: "UNIT_PIC", isPic: true, unitId: loadedUnits[0]?.id || "unit-1", unitName: loadedUnits[0]?.name || "Sarpras" },
        { id: "u-2", name: "Joko Widodo", email: "joko@moklet.org", role: "UNIT_MEMBER", isPic: false, unitId: loadedUnits[0]?.id || "unit-1", unitName: loadedUnits[0]?.name || "Sarpras" },
        { id: "u-3", name: "Siti Rahma", email: "siti@moklet.org", role: "UNIT_PIC", isPic: true, unitId: loadedUnits[1]?.id || "unit-2", unitName: loadedUnits[1]?.name || "Kesiswaan" },
      ];
      setUnitMembers(mockMembers);
    } catch (e) {
      toast.error("Gagal Memuat Data");
    } finally {
      setIsLoading(false);
    }
  };

  // Set mounted
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Check auth
  useEffect(() => {
    if (mounted && (!isAuthenticated || (user?.role !== "SUPERADMIN" && user?.role !== "SUPER_PIC"))) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load data
  useEffect(() => {
    if (mounted && isAuthenticated && (user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC")) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated, user]);

  // Toggle Visibility
  const handleToggleVisibility = async (id: string, current: string) => {
    const nextVisibility = current === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    try {
      await apiClient.complaints.updateVisibility(id, nextVisibility);
      toast.success("Visibilitas Diperbarui", {
        description: `Keluhan kini disetel menjadi ${nextVisibility}.`,
      });
      fetchData();
    } catch (err) {
      // Simulate state update
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, visibility: nextVisibility as ComplaintVisibility } : c))
      );
      toast.success("Visibilitas Diperbarui (Simulated)", {
        description: `Keluhan disetel menjadi ${nextVisibility}.`,
      });
    }
  };

  // Create Unit
  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.units.create({ name: newUnitName, description: newUnitDesc });
      toast.success("Unit Baru Berhasil Dibuat");
      setNewUnitName("");
      setNewUnitDesc("");
      fetchData();
    } catch (err) {
      const simulatedUnit: UnitModel = {
        id: `unit-${Date.now()}`,
        name: newUnitName,
        description: newUnitDesc,
      };
      setUnits((prev) => [...prev, simulatedUnit]);
      toast.success("Unit Baru Dibuat (Simulated)!");
      setNewUnitName("");
      setNewUnitDesc("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Unit
  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus unit ini secara permanen?")) return;

    try {
      await apiClient.units.delete(id);
      toast.success("Unit Berhasil Dihapus");
      fetchData();
    } catch (err) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.success("Unit Dihapus (Simulated)");
    }
  };

  // Add Member to Unit
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.units.addMember(selectedUnitForMember, {
        email: newMemberEmail,
        isPic: memberIsPic,
      });
      toast.success("Anggota berhasil ditambahkan ke unit");
      setNewMemberEmail("");
      fetchData();
    } catch (err) {
      const targetUnit = units.find((u) => u.id === selectedUnitForMember);
      const simulatedMember = {
        id: `user-${Date.now()}`,
        name: newMemberEmail.split("@")[0],
        email: newMemberEmail,
        role: memberIsPic ? "UNIT_PIC" : "UNIT_MEMBER",
        isPic: memberIsPic,
        unitId: selectedUnitForMember,
        unitName: targetUnit?.name || "Sarpras",
      };
      setUnitMembers((prev) => [...prev, simulatedMember]);
      toast.success("Anggota ditambahkan (Simulated)!");
      setNewMemberEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle PIC Role for Member
  const handleTogglePic = async (memberId: string, unitId: string, currentIsPic: boolean) => {
    try {
      await apiClient.units.updateMemberPic(unitId, memberId, { isPic: !currentIsPic });
      toast.success("Peran PIC Anggota Diperbarui");
      fetchData();
    } catch (err) {
      setUnitMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, isPic: !currentIsPic, role: !currentIsPic ? "UNIT_PIC" : "UNIT_MEMBER" } : m))
      );
      toast.success("Peran PIC Anggota Diperbarui (Simulated)");
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId: string, unitId: string) => {
    if (!confirm("Hapus anggota ini dari unit?")) return;

    try {
      await apiClient.units.removeMember(unitId, memberId);
      toast.success("Anggota Berhasil Dihapus");
      fetchData();
    } catch (err) {
      setUnitMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Anggota Dihapus (Simulated)");
    }
  };

  // Delegasi / Forward action
  const handleForwardComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintForForward) return;

    try {
      await apiClient.complaints.forward(selectedComplaintForForward.id, {
        toUnitId: forwardUnitId,
        forwardNote: forwardNote,
      });
      toast.success("Keluhan berhasil didelegasikan");
      setSelectedComplaintForForward(null);
      setForwardNote("");
      fetchData();
    } catch (err) {
      const targetUnit = units.find((u) => u.id === forwardUnitId);
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaintForForward.id
            ? { ...c, unit: (targetUnit?.name || "Sarpras") as ComplaintUnit, status: "WAITING_RESPONSE" }
            : c
        )
      );
      toast.success("Keluhan didelegasikan (Simulated)");
      setSelectedComplaintForForward(null);
      setForwardNote("");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (tableTab === "urgent" && c.status !== "NEW") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.reporter?.name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUnits = units.filter((u) => {
    const normSearch = unitSearchQuery.toLowerCase();
    const matchesName = u.name.toLowerCase().includes(normSearch);
    const matchesDesc = (u.description || "").toLowerCase().includes(normSearch);
    const pic = getUnitPIC(u.id, u.name, unitMembers);
    const matchesPIC = pic.name.toLowerCase().includes(normSearch);
    return matchesName || matchesDesc || matchesPIC;
  });

  const figmaUsers = [
    { id: "fallback-u1", name: "Budi Santoso", email: "budi.s@student.edu", phone: "+62 812-3456-7890", role: "Siswa", unitName: "Class 10-A", status: "Active", memberId: "2024001" },
    { id: "fallback-u2", name: "Ani Darmawan", email: "ani.d@teacher.edu", phone: "+62 856-1122-3344", role: "Guru", unitName: "PIC: Science Dept", status: "Active", memberId: "GUR092" },
    { id: "fallback-u3", name: "Siti Rohmah", email: "siti.r@parents.edu", phone: "-", role: "Orangtua", unitName: "Unassigned", status: "Inactive", memberId: "ORT551" }
  ];

  const dynamicUsers = unitMembers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: "+62 813-9988-7766",
    role: m.isPic ? "PIC Unit" : "Anggota Unit",
    unitName: m.unitName || "Umum",
    status: "Active",
    memberId: `USR-${m.id.substring(0, 4).toUpperCase()}`
  }));

  const allUsers = [...figmaUsers, ...dynamicUsers];

  const filteredUsers = allUsers.filter((u) => {
    const normSearch = userSearchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(normSearch) ||
      u.email.toLowerCase().includes(normSearch) ||
      u.phone.toLowerCase().includes(normSearch) ||
      u.memberId.toLowerCase().includes(normSearch);

    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === "All" || u.status === userStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar");
    router.push("/");
  };

  if (!mounted || !isAuthenticated || (user?.role !== "SUPERADMIN" && user?.role !== "SUPER_PIC")) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f9f9f9] flex font-sans antialiased text-slate-800">

      {/* ─── 1. LEFT SIDEBAR (Dark UI) ─── */}
      <aside className="w-70 h-full bg-[#000000] flex flex-col justify-between p-6 text-zinc-300 border-r border-zinc-900 shrink-0 overflow-y-auto relative">
        <div className="space-y-8">

          {/* Logo & Portal Branding */}
          <div className="flex flex-col gap-1 border-b border-zinc-800/40 pb-5 pl-2">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              <span className="font-bold text-white text-lg tracking-tight">SuaraMoklet</span>
            </div>
            <span className="text-[10px] font-bold text-[#b61722] tracking-wider uppercase">
              GOVERNANCE PORTAL
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 relative">

            {/* Top Sidebar items */}
            <div className="mb-10">
              <button
                onClick={() => router.push("/")}
                className="w-full h-11 bg-[#b61722] hover:bg-[#a7151e] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <House className="h-5 w-5" />
                <span>Kembali Beranda</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
                activeTab === "dashboard"
                  ? "bg-[#1c1c1e] text-white"
                  : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
              )}
            >
              {activeTab === "dashboard" && (
                <div className="absolute left-[-24px] top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
              )}
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("complaints")}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
                activeTab === "complaints"
                  ? "bg-[#1c1c1e] text-white"
                  : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
              )}
            >
              {activeTab === "complaints" && (
                <div className="absolute left-[-24px] top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
              )}
              <MessageSquare className="h-4.5 w-4.5" />
              <span>Keluhan</span>
            </button>

            <button
              onClick={() => setActiveTab("units")}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
                activeTab === "units"
                  ? "bg-[#1c1c1e] text-white"
                  : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
              )}
            >
              {activeTab === "units" && (
                <div className="absolute left-[-24px] top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
              )}
              <Building className="h-4.5 w-4.5" />
              <span>Units</span>
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
                activeTab === "members"
                  ? "bg-[#1c1c1e] text-white"
                  : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
              )}
            >
              {activeTab === "members" && (
                <div className="absolute left-[-24px] top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
              )}
              <Users className="h-4.5 w-4.5" />
              <span>Manajemen Pengguna</span>
            </button>
          </nav>
        </div>


      </aside>

      {/* ─── 2. MAIN CONTAINER ─── */}
      <div className="flex-grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">

        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-xs z-10">
          {/* Global Search */}
          <div className="relative w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari keluhan, unit, atau user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm rounded-full border border-slate-200 bg-[#f9f9f9] focus:outline-none focus:border-red-400 focus:bg-white transition-all"
            />
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-6">

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-800 leading-tight">Admin ISO</span>
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Superadmin</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#b61722] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                AI
              </div>
            </div>
          </div>
        </header>

        {/* ─── WORKSPACE (Internal Scroll) ─── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {activeTab === "dashboard" ? (
            /* Command Center Dashboard View */
            <div className="space-y-8">

              {/* Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Pusat Kontrol</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Pengawasan holistik terhadap tata kelola sekolah dan protokol respons yang tegas.
                  </p>
                </div>

                <button className="h-11 px-6 bg-[#b61722] hover:bg-[#a7151e] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]">
                  <PlusCircle className="h-5 w-5" />
                  <span>Membuat Pemberintahuan</span>
                </button>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="bg-[#fdf2f2] p-2.5 rounded-xl border border-[#fee2e2] text-[#b61722]">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#dcfce7]">
                      +12%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[13px] font-medium text-slate-500">Total Keluhan</span>
                    <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">5</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="bg-[#eff6ff] p-2.5 rounded-xl border border-[#dbeafe] text-[#2563eb]">
                      <Zap className="h-5 w-5 fill-[#2563eb]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      Avg
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[13px] font-medium text-slate-500">Rata-rata Respon</span>
                    <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">4.2h</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="bg-[#fdf2f2] p-2.5 rounded-xl border border-[#fee2e2] text-[#b61722]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full border border-[#ffb4ab]">
                      CRITICAL
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[13px] font-medium text-slate-500">Belum Di Tangani &gt; 48h</span>
                    <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">28</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="bg-[#f0fdf4] p-2.5 rounded-xl border border-[#dcfce7] text-[#16a34a]">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#dcfce7]">
                      94%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[13px] font-medium text-slate-500">Terselesaikan</span>
                    <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">892</span>
                  </div>
                </div>
              </div>

              {/* Global Complaint List Table Card */}
              <div className="bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] shadow-sm p-6 space-y-6">

                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">Semua Aspirasi</h3>

                    <div className="flex items-center gap-2 bg-[#f9f9f9] p-1 rounded-full border border-slate-200/60">
                      <button
                        onClick={() => setTableTab("all")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "all" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setTableTab("urgent")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "urgent" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Dalam Pengerjaan
                      </button>
                      <button
                        onClick={() => setTableTab("unit")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "unit" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="h-9 w-9 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
                      <Filter className="h-4 w-4" />
                    </button>
                    <button className="h-9 w-9 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                        <th className="pb-4 pl-2 font-semibold">Judul Keluhan</th>
                        <th className="pb-4 font-semibold">Unit Pelaksana</th>
                        <th className="pb-4 font-semibold">Status</th>
                        <th className="pb-4 font-semibold">Visibility</th>
                        <th className="pb-4 text-right pr-2 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredComplaints.map((c) => {
                        // Map units to friendly names
                        let friendlyUnitName = c.unit;
                        if (c.unit === "Sarpras") friendlyUnitName = "Sarana & Prasarana" as ComplaintUnit;

                        // Check status badges
                        const isNew = c.status === "NEW";
                        const isWaiting = c.status === "WAITING_USER";
                        const isClosed = c.status === "CLOSED";
                        const isInProgress = c.status === "IN_PROGRESS";

                        // Map complaint info details
                        let infoDetail = `#REQ-${c.id.substring(0, 4).toUpperCase()} • Disubmit ${new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
                        if (c.id === "complaint-1" || c.title.includes("Pipa")) {
                          infoDetail = "#REQ-8291 • Disubmit 3 hari lalu";
                        } else if (c.id === "complaint-2" || c.title.includes("Kurikulum")) {
                          infoDetail = "#REQ-8302 • Disubmit 4 jam lalu";
                        } else if (c.id === "complaint-3" || c.title.includes("AC")) {
                          infoDetail = "#REQ-8114 • Disubmit 5 hari lalu";
                        }

                        return (
                          <tr key={c.id} className="text-slate-700 text-sm hover:bg-slate-50/50 transition-all align-middle">
                            {/* Title & Info */}
                            <td className="py-5 pl-2 max-w-xs md:max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 leading-snug">{c.title}</span>
                                {isNew && (
                                  <span className="text-[10px] font-bold text-white bg-[#b61722] px-2 py-0.5 rounded-full">
                                    48H+
                                  </span>
                                )}
                                {isWaiting && c.title.includes("AC") && (
                                  <span className="text-[10px] font-bold text-white bg-[#b61722] px-2 py-0.5 rounded-full">
                                    72H+
                                  </span>
                                )}
                              </div>
                              <span className="block text-[11px] text-slate-400 mt-1.5 font-medium">
                                {infoDetail}
                              </span>
                            </td>

                            {/* Assigned Unit */}
                            <td className="py-5 font-medium text-slate-500">
                              {friendlyUnitName || "Umum (ISO)"}
                            </td>

                            {/* Status Badge */}
                            <td className="py-5">
                              <span className={`inline-flex items-center text-[10px] font-semibold uppercase px-3 py-1 rounded-full ${isClosed
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : isInProgress
                                  ? "bg-amber-50 text-amber-600 border border-amber-250"
                                  : isWaiting
                                    ? "bg-purple-50 text-purple-600 border border-purple-200"
                                    : "bg-blue-50 text-blue-600 border border-blue-200" // NEW shows as OPEN (blue)
                                }`}>
                                {isNew ? "OPEN" : c.status}
                              </span>
                            </td>

                            {/* Visibility Toggle */}
                            <td className="py-5">
                              <button
                                onClick={() => handleToggleVisibility(c.id, c.visibility || "PUBLIC")}
                                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                              >
                                <div className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all ${c.visibility === "PUBLIC" ? "bg-blue-600" : "bg-slate-300"
                                  }`}>
                                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all ${c.visibility === "PUBLIC" ? "translate-x-4.5" : "translate-x-0"
                                    }`} />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                  {c.visibility === "PUBLIC" ? "Public" : "Private"}
                                </span>
                              </button>
                            </td>

                            {/* Action buttons */}
                            <td className="py-5 text-right pr-2 shrink-0">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedComplaintForForward(c);
                                    setForwardUnitId(units[0]?.id || "");
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fdf2f2] text-[#b61722] font-bold rounded-lg text-xs transition-colors border border-[#fde2e2] cursor-pointer"
                                >
                                  <Forward className="h-3.5 w-3.5" />
                                  <span>Teruskan</span>
                                </button>

                                {isNew && (
                                  <button
                                    onClick={() => {
                                      toast.success("Instruksi Dikirim ke Unit!", {
                                        description: "Instruksi pengerjaan darurat telah diteruskan ke unit pelaksana terkait."
                                      });
                                    }}
                                    className="inline-flex items-center justify-center px-4 py-1.5 bg-[#b61722] hover:bg-[#a7151e] text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
                                  >
                                    Kirim Instruksi
                                  </button>
                                )}

                                <button className="h-8 w-8 text-slate-400 hover:text-slate-655 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                                  <MoreVertical className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                  <span>Menampilkan 1-{filteredComplaints.length} dari {complaints.length} keluhan</span>

                  <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="h-7 w-7 rounded-lg bg-[#b61722] flex items-center justify-center text-white font-bold">
                      1
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer">
                      2
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer">
                      3
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Heatmap & ISO Audit Trail Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Performance Heatmap Card (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">Evaluasi Kinerja Unit</h3>
                    <p className="text-slate-500 text-xs mt-1">Analisis efisiensi penyelesaian laporan masing-masing unit kerja</p>
                  </div>

                  <div className="space-y-5">
                    {/* Row 1 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>Kesiswaan</span>
                        <span className="text-[#16a34a]">88% Efisien</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#16a34a] rounded-full" style={{ width: "88%" }} />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>Sarpras</span>
                        <span className="text-[#ba1a1a]">42% (Rendah)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#b61722] rounded-full" style={{ width: "42%" }} />
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>Kurikulum</span>
                        <span className="text-[#d97706]">76% Efisien</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#d97706] rounded-full" style={{ width: "76%" }} />
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>Security</span>
                        <span className="text-[#16a34a]">95% Efisien</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#16a34a] rounded-full" style={{ width: "95%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
                    <button className="text-[#b61722] font-bold flex items-center gap-1 hover:underline cursor-pointer">
                      <span>Lihat Detail Analisis</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ISO Audit Trail Card (1/3 width) */}
                <div className="bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] p-6 shadow-sm space-y-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg tracking-tight">ISO Audit Trail</h3>
                      <p className="text-slate-500 text-xs mt-1">Riwayat aktivitas pengawasan log sistem</p>
                    </div>

                    {/* Audit timeline */}
                    <div className="space-y-4">
                      {/* Item 1 */}
                      <div className="flex gap-3 items-start">
                        <div className="h-2 w-2 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="block text-sm font-bold text-slate-800">Status Closed: #REQ-712</span>
                          <span className="block text-xs text-slate-400 font-medium">Oleh Unit Kesiswaan • 2m lalu</span>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="flex gap-3 items-start">
                        <div className="h-2 w-2 rounded-full bg-[#b61722] mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="block text-sm font-bold text-slate-800">Forwarded: #REQ-8291</span>
                          <span className="block text-xs text-slate-400 font-medium">Superadmin ➔ Sarpras • 15m lalu</span>
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div className="flex gap-3 items-start">
                        <div className="h-2 w-2 rounded-full bg-[#d97706] mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="block text-sm font-bold text-slate-800">Visibility Changed</span>
                          <span className="block text-xs text-slate-400 font-medium">Public ➔ Private (#REQ-901) • 1h lalu</span>
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div className="flex gap-3 items-start">
                        <div className="h-2 w-2 rounded-full bg-[#2563eb] mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="block text-sm font-bold text-slate-800">New Report Logged</span>
                          <span className="block text-xs text-slate-400 font-medium">User: Student-X • 3h lalu</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <Download className="h-4 w-4" />
                    <span>Download System Logs</span>
                  </button>
                </div>

              </div>
            </div>
          ) : activeTab === "complaints" ? (
            /* Full Complaints Workdesk Tab */
            <div className="space-y-8">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Keluhan Global</h1>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Monitor, telaah, dan kelola semua keluhan dan aspirasi warga sekolah secara langsung.</p>
              </div>

              {/* ponytail: reuse the exact table card layout for the dedicated Complaints tab workdesk */}
              <div className="bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] shadow-sm p-6 space-y-6">

                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">Semua Aspirasi</h3>

                    <div className="flex items-center gap-2 bg-[#f9f9f9] p-1 rounded-full border border-slate-200/60">
                      <button
                        onClick={() => setTableTab("all")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "all" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setTableTab("urgent")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "urgent" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Dalam Pengerjaan
                      </button>
                      <button
                        onClick={() => setTableTab("unit")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "unit" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="h-9 w-9 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
                      <Filter className="h-4 w-4" />
                    </button>
                    <button className="h-9 w-9 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                        <th className="pb-4 pl-2 font-semibold">Judul Keluhan</th>
                        <th className="pb-4 font-semibold">Unit Pelaksana</th>
                        <th className="pb-4 font-semibold">Status</th>
                        <th className="pb-4 font-semibold">Visibility</th>
                        <th className="pb-4 text-right pr-2 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredComplaints.map((c) => {
                        let friendlyUnitName = c.unit;
                        if (c.unit === "Sarpras") friendlyUnitName = "Sarana & Prasarana" as ComplaintUnit;

                        const isNew = c.status === "NEW";
                        const isWaiting = c.status === "WAITING_USER";
                        const isClosed = c.status === "CLOSED";
                        const isInProgress = c.status === "IN_PROGRESS";

                        let infoDetail = `#REQ-${c.id.substring(0, 4).toUpperCase()} • Disubmit ${new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
                        if (c.id === "complaint-1" || c.title.includes("Pipa")) {
                          infoDetail = "#REQ-8291 • Disubmit 3 hari lalu";
                        } else if (c.id === "complaint-2" || c.title.includes("Kurikulum")) {
                          infoDetail = "#REQ-8302 • Disubmit 4 jam lalu";
                        } else if (c.id === "complaint-3" || c.title.includes("AC")) {
                          infoDetail = "#REQ-8114 • Disubmit 5 hari lalu";
                        }

                        return (
                          <tr key={c.id} className="text-slate-700 text-sm hover:bg-slate-50/50 transition-all align-middle">
                            <td className="py-5 pl-2 max-w-xs md:max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 leading-snug">{c.title}</span>
                                {isNew && (
                                  <span className="text-[10px] font-bold text-white bg-[#b61722] px-2 py-0.5 rounded-full">
                                    48H+
                                  </span>
                                )}
                                {isWaiting && c.title.includes("AC") && (
                                  <span className="text-[10px] font-bold text-white bg-[#b61722] px-2 py-0.5 rounded-full">
                                    72H+
                                  </span>
                                )}
                              </div>
                              <span className="block text-[11px] text-slate-400 mt-1.5 font-medium">
                                {infoDetail}
                              </span>
                            </td>

                            <td className="py-5 font-medium text-slate-500">
                              {friendlyUnitName || "Umum (ISO)"}
                            </td>

                            <td className="py-5">
                              <span className={`inline-flex items-center text-[10px] font-semibold uppercase px-3 py-1 rounded-full ${isClosed
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : isInProgress
                                  ? "bg-amber-50 text-amber-600 border border-amber-250"
                                  : isWaiting
                                    ? "bg-purple-50 text-purple-600 border border-purple-200"
                                    : "bg-blue-50 text-blue-600 border border-blue-200"
                                }`}>
                                {isNew ? "OPEN" : c.status}
                              </span>
                            </td>

                            <td className="py-5">
                              <button
                                onClick={() => handleToggleVisibility(c.id, c.visibility || "PUBLIC")}
                                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                              >
                                <div className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all ${c.visibility === "PUBLIC" ? "bg-blue-600" : "bg-slate-300"
                                  }`}>
                                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all ${c.visibility === "PUBLIC" ? "translate-x-4.5" : "translate-x-0"
                                    }`} />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                  {c.visibility === "PUBLIC" ? "Public" : "Private"}
                                </span>
                              </button>
                            </td>

                            <td className="py-5 text-right pr-2 shrink-0">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedComplaintForForward(c);
                                    setForwardUnitId(units[0]?.id || "");
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fdf2f2] text-[#b61722] font-bold rounded-lg text-xs transition-colors border border-[#fde2e2] cursor-pointer"
                                >
                                  <Forward className="h-3.5 w-3.5" />
                                  <span>Teruskan</span>
                                </button>

                                {isNew && (
                                  <button
                                    onClick={() => {
                                      toast.success("Instruksi Dikirim ke Unit!", {
                                        description: "Instruksi pengerjaan darurat telah diteruskan ke unit pelaksana terkait."
                                      });
                                    }}
                                    className="inline-flex items-center justify-center px-4 py-1.5 bg-[#b61722] hover:bg-[#a7151e] text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
                                  >
                                    Kirim Instruksi
                                  </button>
                                )}

                                <button className="h-8 w-8 text-slate-400 hover:text-slate-655 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                                  <MoreVertical className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                  <span>Menampilkan 1-{filteredComplaints.length} dari {complaints.length} keluhan</span>

                  <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="h-7 w-7 rounded-lg bg-[#b61722] flex items-center justify-center text-white font-bold">
                      1
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer">
                      2
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer">
                      3
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "units" ? (
            /* Units CRUD Workdesk Tab */
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Unit Organisasi</h1>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Kelola unit sekolah dan personil yang ditugaskan.</p>
                </div>

                {/* Search and Create Unit */}
                <div className="flex items-center gap-3">
                  <div className="relative w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search units or PIC..."
                      value={unitSearchQuery}
                      onChange={(e) => setUnitSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 transition-all font-medium animate-all"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setNewUnitName("");
                      setNewUnitDesc("");
                      setIsCreateUnitModalOpen(true);
                    }}
                    className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Building className="h-4 w-4 text-slate-500" />
                    <span>Membuat Unit</span>
                  </button>
                </div>
              </div>

              {/* Core Layout Grid: 2/3 Left (Cards Grid), 1/3 Right (Selected Detail) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Panel: Unit Cards Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUnits.map((unit) => {
                      const isSelected = selectedUnitId === unit.id;
                      const icon = getUnitIcon(unit.name);
                      const iconBg = getUnitIconBg(unit.name);
                      const desc = getUnitDescription(unit);

                      // Calculate dynamic values
                      const dynamicMembersCount = unitMembers.filter((m) => m.unitId === unit.id).length;
                      const membersCount = dynamicMembersCount || (unit.name.includes("Kurikulum") ? 12 : unit.name.includes("Kesiswaan") ? 8 : unit.name.includes("Humas") || unit.name.includes("Hubinkom") ? 5 : 18);

                      const dynamicIssuesCount = complaints.filter((c) => c.unit === unit.name && c.status !== "CLOSED").length;
                      const activeIssuesCount = dynamicIssuesCount || (unit.name.includes("Kurikulum") ? 4 : unit.name.includes("Kesiswaan") ? 15 : unit.name.includes("Humas") || unit.name.includes("Hubinkom") ? 1 : 7);

                      const pic = getUnitPIC(unit.id, unit.name, unitMembers);
                      const picInitials = (pic as { initials?: string }).initials || getInitials(pic.name);

                      return (
                        <div
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={cn(
                            "bg-white p-6 rounded-3xl border shadow-sm transition-all duration-300 flex flex-col justify-between h-[240px] relative cursor-pointer group",
                            isSelected
                              ? "border-[#b61722] ring-1 ring-[#b61722] scale-[1.01]"
                              : "border-slate-200/80 hover:border-slate-350 hover:shadow-md"
                          )}
                        >
                          {/* Selected pill */}
                          {isSelected && (
                            <span className="absolute top-4 right-16 bg-[#b61722] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              TERPILIH
                            </span>
                          )}

                          {/* Top row: Name & icon badge */}
                          <div className="flex justify-between items-start">
                            <div className="space-y-1.5 pr-8">
                              <h3 className="font-extrabold text-slate-800 text-lg leading-tight group-hover:text-[#b61722] transition-colors">
                                {unit.name}
                              </h3>
                              <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">
                                {desc}
                              </p>
                            </div>
                            <div className={cn("p-2.5 rounded-2xl shadow-xs shrink-0 flex items-center justify-center", iconBg)}>
                              {icon}
                            </div>
                          </div>

                          {/* Middle row: Stats boxes */}
                          <div className="grid grid-cols-2 gap-4 my-2">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members</span>
                              <span className="text-xl font-extrabold text-slate-800 mt-0.5">{membersCount}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Issues</span>
                              <span className={cn("text-xl font-extrabold mt-0.5", activeIssuesCount > 5 ? "text-[#b61722]" : "text-slate-800")}>
                                {activeIssuesCount}
                              </span>
                            </div>
                          </div>

                          {/* Bottom row: Primary PIC info */}
                          <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {picInitials}
                            </div>
                            <div className="text-[11px] font-medium leading-none">
                              <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider pb-0.5">Primary PIC</span>
                              <span className="font-bold text-slate-800">{pic.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Selected Detail Sidebar */}
                <div className="lg:col-span-1">
                  {(() => {
                    const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];
                    if (!activeUnit) {
                      return (
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center text-slate-400 font-medium">
                          No Unit Selected
                        </div>
                      );
                    }

                    const pic = getUnitPIC(activeUnit.id, activeUnit.name, unitMembers);
                    const picInitials = (pic as { initials?: string }).initials || getInitials(pic.name);

                    // Filter members belonging to selected unit
                    const activeMembers = unitMembers.filter((m) => m.unitId === activeUnit.id);

                    // Fallback members for visual mockup if empty
                    const displayMembers = activeMembers.length > 0 ? activeMembers : [
                      { id: "fallback-1", name: "Fitri Tanjung", email: "fitri@moklet.org", role: "Counselor", initials: "FT" },
                      { id: "fallback-2", name: "Reza Yuliyanto", email: "reza@moklet.org", role: "Discipline Officer", initials: "RY" },
                      { id: "fallback-3", name: "Nita Saputri", email: "nita@moklet.org", role: "Extracurricular Coordinator", initials: "NS" },
                    ];

                    const totalMembers = activeMembers.length || 8;

                    return (
                      <div className="bg-white rounded-3xl border border-[#b61722] shadow-md p-6 flex flex-col justify-between min-h-[580px]">
                        <div className="space-y-6">
                          {/* Header section with Pencil icon */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5">
                              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{activeUnit.name}</h2>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {getUnitDescription(activeUnit)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus unit ${activeUnit.name}?`)) {
                                    handleDeleteUnit(activeUnit.id);
                                  }
                                }}
                                className="h-9 w-9 border border-red-100 hover:bg-red-50 rounded-xl flex items-center justify-center text-red-650 transition-colors cursor-pointer shrink-0"
                                title="Delete Unit"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  toast.info(`Mengedit Unit: ${activeUnit.name}`);
                                }}
                                className="h-9 w-9 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* CURRENT PIC details */}
                          <div className="space-y-3">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">PIC Saat Ini</span>

                            <div className="bg-slate-50/80 rounded-2xl border border-slate-150 p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 border border-red-100 text-sm font-extrabold flex items-center justify-center shrink-0">
                                  {picInitials}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="block text-xs font-bold text-slate-800">{pic.name}</span>
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Aktif
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedUnitForMember(activeUnit.id);
                                  setMemberIsPic(true);
                                  setNewMemberEmail("");
                                  setIsAddMemberModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                Ganti PIC
                              </button>
                            </div>
                          </div>

                          {/* Unit Members List */}
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Anggota Unit ({totalMembers})</span>

                              <button
                                onClick={() => {
                                  setSelectedUnitForMember(activeUnit.id);
                                  setMemberIsPic(false);
                                  setNewMemberEmail("");
                                  setIsAddMemberModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b61722] hover:text-[#a7151e] transition-colors cursor-pointer"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Tambah Anggota</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {displayMembers.map((member) => (
                                <div key={member.id} className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                                    {(member as { initials?: string }).initials || getInitials(member.name)}
                                  </div>
                                  <div className="space-y-0.5 leading-none">
                                    <span className="block text-xs font-bold text-slate-800">{member.name}</span>
                                    <span className="block text-[10px] text-slate-400 font-medium">{member.role || "Staff Member"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {totalMembers > 3 && (
                              <button
                                onClick={() => setActiveTab("members")}
                                className="block w-full text-center text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider pt-2"
                              >
                                LIHAT SEMUA {totalMembers} ANGGOTA
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Manage Settings Button */}
                        <div className="pt-6 border-t border-slate-100">
                          <button
                            onClick={() => {
                              toast.info(`Membuka Pengaturan Unit: ${activeUnit.name}`);
                            }}
                            className="w-full h-11 bg-[#b61722] hover:bg-[#a7151e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                          >
                            <Sliders className="h-4 w-4" />
                            <span>Kelola Pengaturan Unit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            /* Members / User assignment CRUD Tab */
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengelolaan Pengguna</h1>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Atur peran, unit, dan akses untuk semua pengguna platform.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toast.info("Mengimport Data Pengguna...")}
                    className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                    <span>Import</span>
                  </button>

                  <button
                    onClick={() => {
                      setNewMemberEmail("");
                      setMemberIsPic(false);
                      setIsAddMemberModalOpen(true);
                    }}
                    className="h-10 px-4 bg-[#b61722] hover:bg-[#a7151e] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 text-white" />
                    <span>Tambah Pengguna</span>
                  </button>
                </div>
              </div>

              {/* Search and Filters Row */}
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative w-full md:max-w-xs group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-slate-250 bg-white focus:outline-none focus:border-red-400 transition-all font-medium"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer select-none transition-all"
                  >
                    <option value="All">Semua Role</option>
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                    <option value="Orangtua">Orangtua</option>
                    <option value="PIC Unit">PIC Unit</option>
                    <option value="Anggota Unit">Anggota Unit</option>
                  </select>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer select-none transition-all"
                  >
                    <option value="All">Semua Status</option>
                    <option value="Active">Aktif</option>
                    <option value="Inactive">Tidak Aktif</option>
                  </select>

                  <button
                    onClick={() => toast.info("Filter Lanjutan Aktif")}
                    className="h-10 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sliders className="h-4 w-4" />
                    <span>Filter Lainnya</span>
                  </button>
                </div>
              </div>

              {/* User Management Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="text-slate-450 font-bold text-xs uppercase border-b border-slate-100 pb-4">
                        <th className="pb-4 pl-2 font-semibold">Nama Pengguna</th>
                        <th className="pb-4 font-semibold">Info Kontak</th>
                        <th className="pb-4 font-semibold">Role &amp; Unit</th>
                        <th className="pb-4 font-semibold">Status</th>
                        <th className="pb-4 text-right pr-2 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => {
                        const initials = getInitials(u.name);
                        const isPicUnit = u.role.includes("PIC");
                        const isTeacher = u.role.includes("Guru");

                        return (
                          <tr key={u.id} className="text-slate-700 text-sm hover:bg-slate-50/50 transition-all align-middle">
                            {/* User Name & ID */}
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {initials}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="block font-bold text-slate-800 leading-snug">{u.name}</span>
                                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {u.memberId}</span>
                                </div>
                              </div>
                            </td>

                            {/* Contact Info */}
                            <td className="py-4">
                              <div className="space-y-0.5 font-medium">
                                <span className="block text-xs text-slate-500">{u.email}</span>
                                <span className="block text-[10px] text-slate-400">{u.phone}</span>
                              </div>
                            </td>

                            {/* Role & Unit */}
                            <td className="py-4">
                              <div className="space-y-0.5">
                                <span className="block text-xs font-bold text-slate-800">{u.role}</span>
                                <span className={cn(
                                  "block text-[10px] font-bold uppercase tracking-wider",
                                  isPicUnit || isTeacher ? "text-[#b61722]" : "text-slate-400"
                                )}>
                                  {u.unitName}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}>
                                {u.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 text-right pr-2">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => {
                                    toast.success(u.status === "Active" ? "Pengguna Dinonaktifkan" : "Pengguna Diaktifkan");
                                  }}
                                  className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                                  title={u.status === "Active" ? "Suspend User" : "Activate User"}
                                >
                                  {u.status === "Active" ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedUnitForMember(units[0]?.id || "");
                                    setNewMemberEmail(u.email);
                                    setMemberIsPic(false);
                                    setIsAddMemberModalOpen(true);
                                  }}
                                  className="h-8 w-8 text-slate-400 hover:text-[#b61722] hover:bg-red-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                                  title="Edit Unit Assignment"
                                >
                                  <Building className="h-4 w-4" />
                                </button>

                                {/* Delete Member for dynamic users */}
                                {u.id.startsWith("fallback") ? (
                                  <button className="h-8 w-8 text-slate-300 rounded-lg flex items-center justify-center cursor-not-allowed">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Apakah Anda yakin ingin menghapus petugas ${u.name}?`)) {
                                        handleRemoveMember(u.id, units.find(un => un.name === u.unitName)?.id || "");
                                      }
                                    }}
                                    className="h-8 w-8 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                                    title="Hapus Petugas"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                  <span>Showing 1-{filteredUsers.length} of {allUsers.length} entries</span>

                  <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="h-7 w-7 rounded-lg bg-[#b61722] flex items-center justify-center text-white font-bold">
                      1
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer">
                      2
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all cursor-pointer">
                      3
                    </button>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ─── 3. DELEGASI MODAL POPUP ─── */}
      {selectedComplaintForForward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Delegasikan Keluhan</h3>
              <button
                onClick={() => setSelectedComplaintForForward(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-150 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150 font-medium">
              Judul: <strong>{selectedComplaintForForward.title}</strong>
            </p>

            <form onSubmit={handleForwardComplaint} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Pilih Unit Penerima</label>
                <select
                  value={forwardUnitId}
                  onChange={(e) => setForwardUnitId(e.target.value)}
                  className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Catatan Tambahan (Instruksi)</label>
                <textarea
                  rows={3}
                  placeholder="Tulis instruksi pengerjaan..."
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  className="w-full p-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintForForward(null)}
                  className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  Kirim Delegasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 4. CREATE UNIT MODAL POPUP ─── */}
      {isCreateUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Tambah Unit Kerja</h3>
              <button
                onClick={() => setIsCreateUnitModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-150 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              await handleCreateUnit(e);
              setIsCreateUnitModalOpen(false);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Nama Unit</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sarpras, Kesiswaan"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Deskripsi Unit</label>
                <textarea
                  rows={3}
                  placeholder="Tulis tugas pokok fungsi unit kerja..."
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  className="w-full p-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUnitModalOpen(false)}
                  className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#b61722] hover:bg-[#a7151e] text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Buat Unit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. ADD MEMBER / PIC MODAL POPUP ─── */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                {memberIsPic ? "Tunjuk Penanggung Jawab (PIC)" : "Tambah Anggota Unit"}
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-150 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              await handleAddMember(e);
              setIsAddMemberModalOpen(false);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Unit Kerja</label>
                <select
                  value={selectedUnitForMember}
                  onChange={(e) => setSelectedUnitForMember(e.target.value)}
                  className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Anggota</label>
                <input
                  type="email"
                  required
                  placeholder="contoh@moklet.org"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="modalIsPicCheck"
                  checked={memberIsPic}
                  onChange={(e) => setMemberIsPic(e.target.checked)}
                  className="h-4 w-4 text-[#b61722] rounded border-slate-200 focus:ring-red-500"
                />
                <label htmlFor="modalIsPicCheck" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                  Jadikan PIC Utama
                </label>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#b61722] hover:bg-[#a7151e] text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{memberIsPic ? "Simpan PIC" : "Tambah"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
