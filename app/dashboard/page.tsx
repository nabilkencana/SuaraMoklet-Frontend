"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, 
  User as UserIcon, 
  Shield, 
  PlusCircle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Prevent SSR flash
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari sesi saat ini.",
    });
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 bg-slate-800 rounded-xl" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-100">SuaraMoklet</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5">
              <Shield className="h-4 w-4 text-rose-400" />
              <span className="font-medium text-xs tracking-wider uppercase">{user?.role || "USER"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 border border-slate-850 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-300 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900/40 to-slate-900/10 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Akses Terverifikasi
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-50 mt-1">
              Halo, {user?.name || "Warga Moklet"}!
            </h2>
            <p className="text-sm text-slate-400">
              Selamat datang di dashboard pengaduan sekolah. Silakan buat laporan atau pantau progresnya.
            </p>
          </div>
          <div>
            <Link
              href="/complaints/create"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold rounded-xl py-3 px-5 shadow-lg shadow-rose-500/10 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Buat Pengaduan</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sedang Diproses</div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terselesaikan</div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">15</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Laporan</div>
            </div>
          </div>
        </div>

        {/* Main Grid: User Profile Details & Mock Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="glass-panel rounded-2xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-slate-50 border-b border-slate-900 pb-3 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-rose-400" />
              <span>Detail Akun</span>
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Nama Lengkap</span>
                <span className="text-sm font-medium text-slate-200 mt-1 block">{user?.name || "Tidak tersedia"}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Alamat Email</span>
                <span className="text-sm font-medium text-slate-200 mt-1 block">{user?.email || "Tidak tersedia"}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">ID Pengguna</span>
                <code className="text-xs font-mono text-amber-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded mt-1 inline-block">
                  {user?.id || "Unknown"}
                </code>
              </div>
            </div>
          </div>

          {/* Activity Logs (Verification of API client usage / Integration Example) */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-400" />
                <span>Pengaduan Terbaru</span>
              </h3>
              <span className="text-xs text-rose-400 font-semibold cursor-pointer flex items-center gap-0.5 hover:underline">
                Lihat semua <ChevronRight className="h-3 w-3" />
              </span>
            </div>
            
            {/* Mock complaints matching role structure */}
            <div className="space-y-4">
              <div className="border border-slate-900 hover:border-slate-800 bg-slate-950/30 rounded-xl p-4 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200">AC Kelas XI RPL 2 Rusak</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    Proses
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  AC di kelas XI RPL 2 tidak dingin sejak dua hari lalu. Suhu kelas menjadi panas dan mengganggu konsentrasi belajar siswa.
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Kategori: Sarana & Prasarana</span>
                  <span>Kemarin, 14:32</span>
                </div>
              </div>

              <div className="border border-slate-900 hover:border-slate-800 bg-slate-950/30 rounded-xl p-4 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200">Keran Air Toilet Gedung C Bocor</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Selesai
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  Keran air di toilet lantai 2 gedung C terus mengeluarkan air walaupun sudah diputar penuh. Harap segera diperbaiki agar air tidak terbuang.
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Kategori: Fasilitas Umum</span>
                  <span>20 Juni 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
