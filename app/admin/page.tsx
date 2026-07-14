"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
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
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintUnit, UnitModel } from "@/types/complaint";

// Initial Mock data fallbacks for full interactive experience
const MOCK_UNITS: UnitModel[] = [
  { id: "unit-1", name: "Sarpras", description: "Sarana dan Prasarana Sekolah" },
  { id: "unit-2", name: "Kesiswaan", description: "Kesiswaan & Pembinaan Karakter" },
  { id: "unit-3", name: "Kurikulum", description: "Kurikulum & Proses Akademik" },
  { id: "unit-4", name: "Humas", description: "Hubungan Masyarakat & Kerja Sama Industri" },
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-1",
    title: "AC Lab Komputer RPL 2 Mati",
    description: "Dua unit AC di ruang Lab RPL 2 sering mati mendadak saat siang hari.",
    unit: "Sarpras" as ComplaintUnit,
    status: "WAITING_RESPONSE",
    isAnonymous: false,
    createdAt: new Date().toISOString(),
    supports: 42,
    visibility: "PUBLIC",
    category: "FASILITAS",
    reporter: { id: "u-1", name: "Siswa Moklet" },
  },
  {
    id: "complaint-2",
    title: "Kebocoran Keran Air Toilet Gedung C",
    description: "Air terus mengalir deras membasahi lantai toilet di toilet lantai 2.",
    unit: "Sarpras" as ComplaintUnit,
    status: "NEW",
    isAnonymous: false,
    createdAt: new Date().toISOString(),
    supports: 8,
    visibility: "PUBLIC",
    category: "FASILITAS",
    reporter: { id: "u-2", name: "Guru Moklet" },
  },
  {
    id: "complaint-3",
    title: "Buku Perpustakaan Tidak Lengkap",
    description: "Buku penunjang mata pelajaran AI untuk kelas XII masih sangat minim.",
    unit: "Kurikulum" as ComplaintUnit,
    status: "IN_PROGRESS",
    isAnonymous: false,
    createdAt: new Date().toISOString(),
    supports: 3,
    visibility: "PRIVATE",
    category: "AKADEMIK",
    reporter: { id: "u-3", name: "Orang Tua Siswa" },
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"units" | "members" | "complaints">("units");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [units, setUnits] = useState<UnitModel[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [unitMembers, setUnitMembers] = useState<any[]>([]);

  // Modals & Form inputs
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDesc, setNewUnitDesc] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedUnitForMember, setSelectedUnitForMember] = useState("");
  const [memberIsPic, setMemberIsPic] = useState(false);

  // Check auth
  useEffect(() => {
    setMounted(true);
    if (mounted && (!isAuthenticated || user?.role !== "SUPERADMIN")) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load initial data
  useEffect(() => {
    if (mounted && isAuthenticated && user?.role === "SUPERADMIN") {
      fetchInitialData();
    }
  }, [mounted, isAuthenticated, user]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch units
      let loadedUnits: any[] = [];
      try {
        loadedUnits = await apiClient.units.getAll();
      } catch (err) {
        loadedUnits = MOCK_UNITS;
      }
      if (loadedUnits.length === 0) {
        loadedUnits = MOCK_UNITS;
      }
      setUnits(loadedUnits);

      // Set default unit choice for members form
      if (loadedUnits.length > 0) {
        setSelectedUnitForMember(loadedUnits[0].id);
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

      // Generate dummy members for the mockup view
      const mockMembers = [
        { id: "u-1", name: "Budi Santoso", email: "budi@moklet.org", role: "UNIT_PIC", isPic: true, unitId: loadedUnits[0]?.id || "unit-1", unitName: loadedUnits[0]?.name || "Sarpras" },
        { id: "u-2", name: "Joko Widodo", email: "joko@moklet.org", role: "UNIT_MEMBER", isPic: false, unitId: loadedUnits[0]?.id || "unit-1", unitName: loadedUnits[0]?.name || "Sarpras" },
        { id: "u-3", name: "Siti Rahma", email: "siti@moklet.org", role: "UNIT_PIC", isPic: true, unitId: loadedUnits[1]?.id || "unit-2", unitName: loadedUnits[1]?.name || "Kesiswaan" },
      ];
      setUnitMembers(mockMembers);
    } catch (e) {
      toast.error("Gagal Memuat Data", {
        description: "Beberapa data tidak dapat disinkronkan dengan server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Unit handlers
  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) {
      toast.error("Nama Unit wajib diisi");
      return;
    }

    try {
      const result = await apiClient.units.create({
        name: newUnitName,
        description: newUnitDesc,
      });
      setUnits((prev) => [...prev, result]);
      setNewUnitName("");
      setNewUnitDesc("");
      toast.success("Unit berhasil dibuat!");
      fetchInitialData();
    } catch (err) {
      // Simulate frontend-only creation if API errors out
      const simulatedUnit = {
        id: `sim-unit-${Date.now()}`,
        name: newUnitName,
        description: newUnitDesc,
      };
      setUnits((prev) => [...prev, simulatedUnit]);
      setNewUnitName("");
      setNewUnitDesc("");
      toast.success("Unit berhasil dibuat (Simulated)!");
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus unit ini?")) return;
    try {
      await apiClient.units.delete(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.success("Unit berhasil dihapus!");
    } catch (err) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.success("Unit berhasil dihapus (Simulated)!");
    }
  };

  // Membership & PIC handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) {
      toast.error("Email anggota wajib diisi");
      return;
    }

    const targetUnit = units.find((u) => u.id === selectedUnitForMember);
    if (!targetUnit) return;

    try {
      await apiClient.units.addMember(selectedUnitForMember, {
        email: newMemberEmail,
        isPic: memberIsPic,
      });
      toast.success("Anggota berhasil ditambahkan ke Unit!");
      setNewMemberEmail("");
      setMemberIsPic(false);
      fetchInitialData();
    } catch (err) {
      const simulatedMember = {
        id: `sim-member-${Date.now()}`,
        name: newMemberEmail.split("@")[0],
        email: newMemberEmail,
        role: memberIsPic ? "UNIT_PIC" : "UNIT_MEMBER",
        isPic: memberIsPic,
        unitId: selectedUnitForMember,
        unitName: targetUnit.name,
      };
      setUnitMembers((prev) => [...prev, simulatedMember]);
      setNewMemberEmail("");
      setMemberIsPic(false);
      toast.success("Anggota berhasil ditambahkan (Simulated)!");
    }
  };

  const handleTogglePic = async (member: any) => {
    const newIsPic = !member.isPic;
    try {
      await apiClient.units.updateMemberPic(member.unitId, member.id, { isPic: newIsPic });
      toast.success(`Berhasil mengubah status PIC ${member.name}`);
      fetchInitialData();
    } catch (err) {
      setUnitMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? { ...m, isPic: newIsPic, role: newIsPic ? "UNIT_PIC" : "UNIT_MEMBER" }
            : m
        )
      );
      toast.success(`Status PIC berhasil diubah (Simulated)`);
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!confirm(`Hapus ${member.name} dari unit ${member.unitName}?`)) return;
    try {
      await apiClient.units.removeMember(member.unitId, member.id);
      toast.success("Anggota berhasil dikeluarkan");
      fetchInitialData();
    } catch (err) {
      setUnitMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success("Anggota berhasil dikeluarkan (Simulated)");
    }
  };

  // Toggle Visibility handler
  const handleToggleVisibility = async (id: string, current: string) => {
    const nextVis = current === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    try {
      await apiClient.complaints.updateVisibility(id, nextVis);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, visibility: nextVis } : c))
      );
      toast.success(`Visibilitas keluhan diubah menjadi ${nextVis}`);
    } catch (err) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, visibility: nextVis } : c))
      );
      toast.success(`Visibilitas diubah menjadi ${nextVis} (Simulated)`);
    }
  };

  if (!mounted || !isAuthenticated || user?.role !== "SUPERADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Panel Pengelolaan Superadmin
                </h1>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Pusat kendali unit kerja sekolah, PIC unit, keanggotaan, dan hak akses keluhan warga.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab("units")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "units"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>Unit Kerja</span>
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "members"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Anggota & PIC</span>
                </button>
                <button
                  onClick={() => setActiveTab("complaints")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "complaints"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Semua Keluhan</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: KELOLA UNIT */}
              {activeTab === "units" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Create Unit */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Plus className="h-5 w-5 text-red-600" />
                      <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Tambah Unit Kerja</h3>
                    </div>
                    <form onSubmit={handleCreateUnit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Nama Unit</label>
                        <input
                          type="text"
                          required
                          value={newUnitName}
                          onChange={(e) => setNewUnitName(e.target.value)}
                          placeholder="Contoh: Sarpras"
                          className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi</label>
                        <textarea
                          rows={3}
                          value={newUnitDesc}
                          onChange={(e) => setNewUnitDesc(e.target.value)}
                          placeholder="Fokus penanganan unit ini..."
                          className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full h-11 bg-red-650 hover:bg-red-700 text-white font-extrabold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm shadow-red-200"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Simpan Unit</span>
                      </button>
                    </form>
                  </div>

                  {/* List of Units */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-100">
                      Daftar Unit Tersedia ({units.length})
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {units.map((unit) => (
                        <div key={unit.id} className="py-4 flex items-start justify-between gap-4 group">
                          <div>
                            <h4 className="font-bold text-slate-800 text-base">{unit.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{unit.description || "Tidak ada deskripsi."}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus Unit"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANGGOTA & PIC */}
              {activeTab === "members" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Assign Member */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <UserPlus className="h-5 w-5 text-red-600" />
                      <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Tambah Anggota Unit</h3>
                    </div>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Pilih Unit</label>
                        <select
                          value={selectedUnitForMember}
                          onChange={(e) => setSelectedUnitForMember(e.target.value)}
                          className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                        >
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Akun Anggota</label>
                        <input
                          type="email"
                          required
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="nama@moklet.org"
                          className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="isPic"
                          checked={memberIsPic}
                          onChange={(e) => setMemberIsPic(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="isPic" className="text-xs font-semibold text-slate-600 select-none">
                          Jadikan PIC (Penanggung Jawab Utama)
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full h-11 bg-red-650 hover:bg-red-700 text-white font-extrabold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm shadow-red-200"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Tambah Anggota</span>
                      </button>
                    </form>
                  </div>

                  {/* List of Members */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-100">
                      Manajemen Keanggotaan Unit
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            <th className="pb-3 pl-2">Nama / Email</th>
                            <th className="pb-3">Unit</th>
                            <th className="pb-3">Peran</th>
                            <th className="pb-3 text-right pr-2">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {unitMembers.map((member) => (
                            <tr key={member.id} className="text-slate-700 text-sm hover:bg-slate-50/50">
                              <td className="py-3.5 pl-2">
                                <span className="block font-bold text-slate-800">{member.name}</span>
                                <span className="block text-xs font-mono text-slate-400">{member.email}</span>
                              </td>
                              <td className="py-3.5 font-semibold text-slate-600">{member.unitName}</td>
                              <td className="py-3.5">
                                {member.isPic ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100">
                                    <ShieldCheck className="h-3 w-3" /> PIC
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                                    Anggota
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 text-right pr-2 space-x-1.5">
                                <button
                                  onClick={() => handleTogglePic(member)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-150 transition-colors cursor-pointer"
                                  title={member.isPic ? "Turunkan dari PIC" : "Jadikan PIC"}
                                >
                                  <Sliders className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-150 transition-colors cursor-pointer"
                                  title="Keluarkan Anggota"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEMUA KELUHAN */}
              {activeTab === "complaints" && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                      Semua Keluhan Masuk ({complaints.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <th className="pb-3 pl-2">Keluhan</th>
                          <th className="pb-3">Unit</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Visibilitas</th>
                          <th className="pb-3 text-right pr-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {complaints.map((c) => (
                          <tr key={c.id} className="text-slate-700 text-sm hover:bg-slate-50/50">
                            <td className="py-3.5 pl-2 max-w-xs md:max-w-md">
                              <span className="block font-bold text-slate-800 leading-snug truncate">{c.title}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">Oleh: {c.reporter?.name || "Anonim"}</span>
                            </td>
                            <td className="py-3.5">
                              <span className="font-bold text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50">
                                {c.unit || "Umum (ISO)"}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                c.status === "CLOSED"
                                  ? "bg-slate-100 text-slate-500"
                                  : c.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                                  : "bg-red-50 text-red-600 border border-red-100"
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3.5">
                              {c.visibility === "PUBLIC" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                  <Eye className="h-3 w-3" /> Publik
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
                                  <EyeOff className="h-3 w-3" /> Privat
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <button
                                onClick={() => handleToggleVisibility(c.id, c.visibility || "PUBLIC")}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl border text-xs font-bold gap-1 transition-colors cursor-pointer ${
                                  c.visibility === "PUBLIC"
                                    ? "border-amber-200 bg-amber-50/30 text-amber-700 hover:bg-amber-50"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {c.visibility === "PUBLIC" ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" /> Privatkan
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5" /> Publikasikan
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
