"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Menu, X, LogOut } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari sesi saat ini.",
    });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-sm shadow-red-200">
            <Megaphone className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-red-600 text-lg tracking-tight">SuaraMoklet</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/dashboard" className="text-slate-600 hover:text-red-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/complaints" className="text-slate-600 hover:text-red-600 transition-colors">
            Keluhan Saya
          </Link>
          <Link href="/complaints/create" className="text-slate-600 hover:text-red-600 transition-colors">
            Buat Keluhan
          </Link>
          <Link href="/profile" className="text-slate-600 hover:text-red-600 transition-colors">
            Profil
          </Link>
        </div>

        {/* Right tools: User profile / logout */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition-colors">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-3 rounded-lg text-slate-500 border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                <span>Keluar</span>
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="h-9 px-5 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 active:scale-[0.98]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2 shadow-lg">
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600">
            Dashboard
          </Link>
          <Link href="/complaints" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600">
            Keluhan Saya
          </Link>
          <Link href="/complaints/create" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600">
            Buat Keluhan
          </Link>
          <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600">
            Profil
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {mounted && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="h-9 flex items-center justify-center rounded-full bg-red-600 text-white text-sm font-semibold text-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
