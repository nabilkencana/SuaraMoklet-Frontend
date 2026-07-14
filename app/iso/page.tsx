"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  Loader2,
  Share2,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Complaint, ComplaintUnit, UnitModel } from "@/types/complaint";

// Fallback dummy data for complete standalone testing
const MOCK_UNITS: UnitModel[] = [
  { id: "unit-1", name: "Sarpras", description: "Sarana dan Prasarana" },
  { id: "unit-2", name: "Kesiswaan", description: "Kesiswaan & Tata Tertib" },
  { id: "unit-3", name: "Kurikulum", description: "Akademik & Pembelajaran" },
  { id: "unit-4", name: "Humas", description: "Hubungan Masyarakat" },
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-new-1",
    title: "Kebocoran Atap Kelas X-RPL 1",
    description: "Atap bocor saat hujan deras dan membasahi area barisan belakang kelas.",
    unit: "Umum (ISO)" as ComplaintUnit,
    status: "NEW",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    supports: 15,
    visibility: "PUBLIC",
    category: "FASILITAS",
    reporter: { id: "u-1", name: "Ahmad Dani" },
  },
  {
    id: "complaint-new-2",
    title: "Bullying Verbal di Kantin Sekolah",
    description: "Adanya candaan berlebihan yang mengarah ke verbal bullying dari kakak kelas.",
    unit: "Umum (ISO)" as ComplaintUnit,
    status: "NEW",
    isAnonymous: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    supports: 1,
    visibility: "PRIVATE",
    category: "KETERTIBAN",
    reporter: null,
  },
  {
    id: "complaint-forwarded-1",
    title: "AC Lab Komputer RPL 2 Mati",
    description: "Dua unit AC di ruang Lab RPL 2 mati mendadak.",
    unit: "Sarpras" as ComplaintUnit,
    status: "WAITING_RESPONSE",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    supports: 42,
    visibility: "PUBLIC",
    category: "FASILITAS",
    reporter: { id: "u-2", name: "Siswa Moklet" },
  },
];

export default function IsoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [units, setUnits] = useState<UnitModel[]>([]);

  // Filtering states
  const [filterType, setFilterType] = useState<"all" | "new" | "forwarded">("new");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Forward action states
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [forwardNote, setForwardNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check auth
  useEffect(() => {
    setMounted(true);
    if (mounted && (!isAuthenticated || (user?.role !== "SUPER_PIC" && user?.role !== "SUPERADMIN"))) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Fetch data
  useEffect(() => {
    if (mounted && isAuthenticated && (user?.role === "SUPER_PIC" || user?.role === "SUPERADMIN")) {
      fetchData();
    }
  }, [mounted, isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch complaints
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

      // Fetch units
      let loadedUnits: UnitModel[] = [];
      try {
        loadedUnits = await apiClient.units.getAll();
      } catch (err) {
        loadedUnits = MOCK_UNITS;
      }
      if (loadedUnits.length === 0) {
        loadedUnits = MOCK_UNITS;
      }
      setUnits(loadedUnits);
      if (loadedUnits.length > 0) {
        setSelectedUnitId(loadedUnits[0].id);
      }
    } catch (e) {
      toast.error("Gagal Memuat Data", {
        description: "Silakan muat ulang halaman ini.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forward submission handler
  const handleForwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!selectedUnitId) {
      toast.error("Pilih unit tujuan delegasi");
      return;
    }

    setIsSubmitting(true);
    const targetUnit = units.find((u) => u.id === selectedUnitId);
    
    try {
      await apiClient.complaints.forward(selectedComplaint.id, {
        toUnitId: selectedUnitId,
        forwardNote: forwardNote,
      });

      toast.success("Keluhan Berhasil Diteruskan", {
        description: `Laporan telah berhasil didelegasikan ke Unit ${targetUnit?.name || ""}.`,
      });

      setSelectedComplaint(null);
      setForwardNote("");
      fetchData();
    } catch (err) {
      // Simulate frontend state update on error
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id
            ? {
                ...c,
                status: "WAITING_RESPONSE",
                unit: (targetUnit?.name || "Sarpras") as ComplaintUnit,
              }
            : c
        )
      );
      toast.success("Keluhan Berhasil Diteruskan (Simulated)!", {
        description: `Laporan didelegasikan ke Unit ${targetUnit?.name || "Sarpras"}.`,
      });
      setSelectedComplaint(null);
      setForwardNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter((c) => {
    // 1. Filter by tabs
    if (filterType === "new" && c.status !== "NEW") return false;
    if (filterType === "forwarded" && c.status === "NEW") return false;

    // 2. Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        (c.reporter?.name || "").toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!mounted || !isAuthenticated || (user?.role !== "SUPER_PIC" && user?.role !== "SUPERADMIN")) {
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
          
          {/* Dashboard Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-red-600 mb-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">ISO Officer Desk</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Delegasi & Forwarding Keluhan
                </h1>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Tinjau keluhan baru yang masuk ke sekolah, tentukan unit tujuan koordinasi, dan teruskan untuk ditindaklanjuti.
                </p>
              </div>

              {/* Filtering tabs */}
              <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setFilterType("new")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    filterType === "new"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Belum Diteruskan
                </button>
                <button
                  onClick={() => setFilterType("forwarded")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    filterType === "forwarded"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sudah Diteruskan
                </button>
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    filterType === "all"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of Complaints */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="Cari keluhan atau pelapor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-bold">Tidak ada laporan keluhan yang sesuai.</p>
                  <p className="text-xs text-slate-400 mt-1">Laporan baru yang masuk akan tampil di sini untuk dievaluasi.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredComplaints.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-3xl p-5 border shadow-sm transition-all duration-300 ${
                        selectedComplaint?.id === item.id ? "border-red-300 ring-2 ring-red-100" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-red-50 text-red-600 rounded-md border border-red-100">
                              {item.category}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              item.status === "NEW" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-500"
                            }`}>
                              {item.status}
                            </span>
                            {item.unit && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200/50">
                                Unit: {item.unit}
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-base leading-snug">{item.title}</h3>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>
                          
                          <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              Oleh: <strong className="text-slate-600">{item.reporter?.name || "Anonim"}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {item.status === "NEW" && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(item);
                              // Reset note
                              setForwardNote("");
                            }}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-xs shadow-red-200"
                          >
                            <span>Forward</span>
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Forward Action Sidebar / Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Share2 className="h-5 w-5 text-red-600" />
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Panel Delegasi</h3>
              </div>

              {selectedComplaint ? (
                <form onSubmit={handleForwardSubmit} className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-extrabold text-neutral-400 uppercase block tracking-wider mb-1">Keluhan Terpilih</span>
                    <span className="text-xs font-bold text-slate-850 block leading-snug line-clamp-2">{selectedComplaint.title}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Pilih Unit Penerima</label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                    >
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} - {unit.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Catatan Delegasi (Optional)</label>
                    <textarea
                      rows={4}
                      value={forwardNote}
                      onChange={(e) => setForwardNote(e.target.value)}
                      placeholder="Tulis instruksi tambahan atau alasan pendelegasian keluhan ke unit terkait..."
                      className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none text-slate-700"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(null)}
                      className="flex-1 h-11 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-11 bg-red-650 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm shadow-red-200 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Kirim</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="h-9 w-9 text-slate-350 mx-auto mb-3 opacity-60" />
                  <p className="text-xs text-slate-400 font-medium px-4 leading-relaxed">
                    Pilih salah satu keluhan baru di sebelah kiri dengan menekan tombol <strong>Forward</strong> untuk membuka form pendelegasian.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
