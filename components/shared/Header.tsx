"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut, Search, LogIn, Settings,
  Menu, X, Bell,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
    setSearchQuery("");
  };

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari sesi saat ini.",
      position: "bottom-right",
    });
    router.push("/");
  };

  const links = [
    { label: "Home",     href: "/" },
    { label: "Jelajahi", href: "/search" },
    { label: "Panduan",  href: "/help" },
    ...(mounted && isAuthenticated ? [{ label: "Keluhan Saya", href: "/complaints" }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/complaints")
      return pathname === "/complaints" ||
        (pathname?.startsWith("/complaints/") && !pathname?.startsWith("/complaints/create"));
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* ─── DESKTOP: Floating Notch Navbar ─── */}
      <header
        className={cn(
          "fixed top-0 left-1/2 -translate-x-1/2 z-50 hidden md:block font-sans",
          "w-max max-w-[calc(100%-2rem)]",
          "rounded-b-3xl transition-all duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)]"
            : "bg-white/70 backdrop-blur-md border border-white/50 shadow-md"
        )}
      >
        <div className="flex items-center gap-4 lg:gap-6 h-[60px] px-6 lg:px-8">

          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 pr-5 border-r border-slate-200/60 shrink-0 group select-none"
          >
            <img
              src="/logo.png"
              alt="Logo SuaraMoklet"
              className="h-7 w-7 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-extrabold text-[16px] tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
              Suara<span className="text-red-600">Moklet</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5" aria-label="Navigasi Utama">
            {links.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "h-9 flex items-center px-4 rounded-full text-[14px] font-semibold transition-colors duration-200",
                    active
                      ? "bg-red-600/10 text-red-600 font-bold"
                      : "text-slate-500 hover:text-red-600 hover:bg-red-50/70"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-2 pl-2">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white/50 rounded-full px-3 py-1.5 border border-slate-200/60 focus-within:border-red-400/60 focus-within:bg-white transition-all"
            >
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="bg-transparent border-none outline-none ring-0 text-[13px] font-medium text-slate-800 placeholder:text-slate-400 ml-2 w-28 focus:w-36 transition-all duration-300"
              />
            </form>

            {/* Kelola badge */}
            {mounted && isAuthenticated && user && user.role !== "USER" && (
              <Link
                href="/dashboard"
                className={cn(
                  "h-8 px-3 flex items-center gap-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shrink-0",
                  pathname === "/dashboard"
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                )}
              >
                <Settings className="h-3.5 w-3.5" style={{ animation: "spin 8s linear infinite" }} />
                <span>Kelola</span>
              </Link>
            )}

            {mounted && isAuthenticated && user ? (
              <div className="flex items-center gap-2 ml-1">
                <NotificationBell />
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all",
                    pathname === "/profile"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200/70 bg-white/50 hover:bg-white hover:border-slate-300"
                  )}
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 truncate max-w-[5.5rem]">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200/70 bg-white/50 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="h-9 px-5 ml-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── MOBILE: Full-width Fixed Navbar ─── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 md:hidden font-sans transition-all duration-300",
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-md"
            : "bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-xs"
        )}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 select-none group"
            onClick={() => setMobileOpen(false)}
          >
            <img src="/logo.png" alt="Logo SuaraMoklet" className="h-7 w-7 object-contain transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-[16px] tracking-tight text-slate-900">
              Suara<span className="text-red-600">Moklet</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {mounted && isAuthenticated && user && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/70 active:scale-95 text-slate-700 transition-all cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            mobileOpen ? "max-h-[580px] opacity-100 border-t border-slate-100" : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="bg-white/98 backdrop-blur-2xl px-4 pt-2.5 pb-5 space-y-1">
            {/* Links without dots */}
            <div className="space-y-1">
              {links.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all select-none",
                      active
                        ? "bg-red-50 text-red-600 font-bold border border-red-100/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3 mt-1.5">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari keluhan..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Search className="h-3.5 w-3.5" />
                  Cari
                </button>
              </form>

              {mounted && isAuthenticated && user ? (
                <div className="space-y-1.5 pt-1">
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-50/80 via-slate-50 to-slate-50 border border-red-100/60">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-black text-xs uppercase shadow-xs shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate leading-tight">{user.name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>

                  {user.role !== "USER" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        pathname === "/dashboard" ? "bg-red-50 text-red-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Settings className="h-4 w-4 text-slate-500" />
                      <span>Dashboard Kelola</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      pathname === "/profile" ? "bg-red-50 text-red-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px] uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span>Profil Saya</span>
                  </Link>

                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="h-10.5 w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xs shadow-red-500/20 active:scale-[0.98] transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under floating navbar */}
      <div className="h-[60px] md:hidden" />
    </>
  );
}
