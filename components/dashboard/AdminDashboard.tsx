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
  MoreVertical
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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "units" | "members">("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [units, setUnits] = useState<UnitModel[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [unitMembers, setUnitMembers] = useState<any[]>([]);

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

  // Check auth
  useEffect(() => {
    setMounted(true);
    if (mounted && (!isAuthenticated || user?.role !== "SUPERADMIN")) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load data
  useEffect(() => {
    if (mounted && isAuthenticated && user?.role === "SUPERADMIN") {
      fetchData();
    }
  }, [mounted, isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch units
      let loadedUnits: UnitModel[] = [];
      try {
        const raw = await apiClient.units.getAll();
        loadedUnits = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
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
      }

      // 2. Fetch complaints
      let loadedComplaints: Complaint[] = [];
      try {
        const raw = await apiClient.complaints.getAll();
        const apiComplaints = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
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

  // Filter complaints based on Search and Table tab
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

  const handleLogoutClick = () => {
    logout();
    toast.success("Berhasil keluar");
    router.push("/");
  };

  if (!mounted || !isAuthenticated || user?.role !== "SUPERADMIN") {
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
            {/* Dashboard active indicator bar */}
            {activeTab === "dashboard" && (
              <div className="absolute left-[-24px] top-1.5 bottom-1.5 w-1.5 bg-[#b61722] rounded-r-md" />
            )}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative",
                activeTab === "dashboard"
                  ? "bg-[#1c1c1e] text-white"
                  : "text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white"
              )}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => router.push("/complaints")}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white transition-all cursor-pointer"
            >
              <MessageSquare className="h-4.5 w-4.5" />
              <span>Keluhan Saya</span>
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

            <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white transition-all cursor-pointer opacity-40">
              <Sliders className="h-4.5 w-4.5" />
              <span>Departments</span>
            </button>

            <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/50 hover:text-white transition-all cursor-pointer opacity-40">
              <Bell className="h-4.5 w-4.5" />
              <span>Notifikasi</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar items */}
        <div className="space-y-4 pt-5 border-t border-zinc-900/60 mt-6">
          <button
            onClick={() => router.push("/complaints")}
            className="w-full h-11 bg-[#b61722] hover:bg-[#a7151e] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span>New Report</span>
          </button>

          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-semibold text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/40 hover:text-white transition-all cursor-pointer">
              <HelpCircle className="h-4 w-4" />
              <span>Help Center</span>
            </button>

            <button className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-semibold text-[rgba(226,226,226,0.7)] hover:bg-[#1c1c1e]/40 hover:text-white transition-all cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-red-950/20 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
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
              placeholder="Search complaints, units, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm rounded-full border border-slate-200 bg-[#f9f9f9] focus:outline-none focus:border-red-400 focus:bg-white transition-all"
            />
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-6">
            {/* Active Alerts Pill */}
            <div className="flex items-center gap-2 bg-[#fdf2f2] border border-[#fbd5d5] rounded-full px-3 py-1 text-[#b61722] text-[11px] font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b61722] animate-pulse" />
              <span>12 Active Alerts</span>
            </div>

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
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Command Center</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Holistic oversight of school governance and firm response protocols.
                  </p>
                </div>
                
                <button className="h-11 px-6 bg-[#b61722] hover:bg-[#a7151e] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]">
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Master Alert</span>
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
                    <span className="block text-[13px] font-medium text-slate-500">Total Complaints</span>
                    <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">1,284</span>
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
                    <span className="block text-[13px] font-medium text-slate-500">Response Time</span>
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
                    <span className="block text-[13px] font-medium text-slate-500">Unresolved &gt; 48h</span>
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
                    <span className="block text-[13px] font-medium text-slate-500">Resolution Rate</span>
                    <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">892</span>
                  </div>
                       {/* Global Complaint List Table Card */}
              <div className="bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] shadow-sm p-6 space-y-6">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">Global Complaint List</h3>
                    
                    <div className="flex items-center gap-2 bg-[#f9f9f9] p-1 rounded-full border border-slate-200/60">
                      <button
                        onClick={() => setTableTab("all")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "all" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTableTab("urgent")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "urgent" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Urgent
                      </button>
                      <button
                        onClick={() => setTableTab("unit")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                          tableTab === "unit" ? "bg-slate-200 text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        By Unit
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
                              <span className={`inline-flex items-center text-[10px] font-semibold uppercase px-3 py-1 rounded-full ${
                                isClosed
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
                                <div className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all ${
                                  c.visibility === "PUBLIC" ? "bg-blue-600" : "bg-slate-300"
                                }`}>
                                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all ${
                                    c.visibility === "PUBLIC" ? "translate-x-4.5" : "translate-x-0"
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
               {/* Performance Heatmap & ISO Audit Trail Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Performance Heatmap Card (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">Performance Heatmap</h3>
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
                        <span className="text-[#ba1a1a]">42% (Low)</span>
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
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#b61722]" />
                      <span className="text-slate-500 font-semibold">Action Required</span>
                    </div>
                    <button className="text-[#b61722] font-bold flex items-center gap-1 hover:underline cursor-pointer">
                      <span>View Detailed Analytics</span>
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
          ) : activeTab === "units" ? (
            /* Units CRUD Workdesk Tab */
            <div className="space-y-8">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Kelola Unit Sekolah</h1>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Daftarkan dan perbarui unit pelaksana di SMK Telkom Malang.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Create Unit (1/3) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-fit space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Building className="h-4 w-4 text-red-650" />
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Tambah Unit Kerja</h3>
                  </div>

                  <form onSubmit={handleCreateUnit} className="space-y-4">
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
                        rows={4}
                        placeholder="Tulis tugas pokok fungsi unit kerja..."
                        value={newUnitDesc}
                        onChange={(e) => setNewUnitDesc(e.target.value)}
                        className="w-full p-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buat Unit Kerja</span>
                    </button>
                  </form>
                </div>

                {/* Units List (2/3) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                    Daftar Unit Terdaftar ({units.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {units.map((unit) => (
                      <div
                        key={unit.id}
                        className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 hover:border-slate-350 transition-all flex justify-between items-start gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-xs">{unit.name}</h4>
                          <p className="text-xs text-slate-450 leading-relaxed font-medium">{unit.description || "Tidak ada deskripsi."}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Members / User assignment CRUD Tab */
            <div className="space-y-8">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pengguna &amp; PIC</h1>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Tugaskan anggota unit kerja dan tunjuk Penanggung Jawab (PIC).</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Add Member (1/3) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-fit space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <UserPlus className="h-4 w-4 text-red-650" />
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Tugaskan Anggota</h3>
                  </div>

                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Pengguna</label>
                      <input
                        type="email"
                        required
                        placeholder="Contoh: budi@moklet.org"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Unit Kerja Tujuan</label>
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

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isPicCheck"
                        checked={memberIsPic}
                        onChange={(e) => setMemberIsPic(e.target.checked)}
                        className="h-4 w-4 text-red-600 rounded border-slate-200 focus:ring-red-500"
                      />
                      <label htmlFor="isPicCheck" className="text-xs font-bold text-slate-650 cursor-pointer select-none">
                        Jadikan Penanggung Jawab (PIC)
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tugaskan Pengguna</span>
                    </button>
                  </form>
                </div>

                {/* Members list (2/3) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                    Daftar Petugas Terdaftar ({unitMembers.length})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider border-b border-slate-100">
                          <th className="pb-3 pl-2">Nama</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Unit</th>
                          <th className="pb-3">PIC status</th>
                          <th className="pb-3 text-right pr-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {unitMembers.map((m) => (
                          <tr key={m.id} className="text-slate-700 text-xs hover:bg-slate-50/50 transition-all">
                            <td className="py-3.5 pl-2 font-extrabold text-slate-800">{m.name}</td>
                            <td className="py-3.5 text-slate-500 font-medium">{m.email}</td>
                            <td className="py-3.5 font-bold text-slate-600">{m.unitName}</td>
                            <td className="py-3.5">
                              <button
                                onClick={() => handleTogglePic(m.id, m.unitId, m.isPic)}
                                className={cn(
                                  "flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-extrabold transition-all cursor-pointer",
                                  m.isPic
                                    ? "bg-red-50 text-red-655 border-red-200"
                                    : "bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100"
                                )}
                              >
                                <ShieldCheck className="h-3 w-3" />
                                <span>{m.isPic ? "PIC Utama" : "Biasa"}</span>
                              </button>
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <button
                                onClick={() => handleRemoveMember(m.id, m.unitId)}
                                className="h-7 w-7 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

    </div>
  );
}
