"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut, Search, LogIn, Settings,
  Menu, X,
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
    const handler = () => {
      setScrolled(window.scrollY > 20);
    };
    handler();
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

  // Dynamic max width on desktop for notch compactness
  const targetMaxWidth = scrolled ? 820 : 1060;

  return (
    <>
      {/* ─── DESKTOP: Ultra-Smooth MacBook Notch Morphing Navbar ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none font-sans px-4">
        <motion.header
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            maxWidth: targetMaxWidth,
            borderBottomLeftRadius: scrolled ? 24 : 32,
            borderBottomRightRadius: scrolled ? 24 : 32,
            boxShadow: scrolled
              ? "0 16px 42px -6px rgba(0, 0, 0, 0.13), 0 4px 14px -2px rgba(0, 0, 0, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)"
              : "0 10px 32px -4px rgba(0, 0, 0, 0.07), 0 2px 8px -2px rgba(0, 0, 0, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)",
            backgroundColor: scrolled
              ? "rgba(255, 255, 255, 0.92)"
              : "rgba(255, 255, 255, 0.82)",
            borderColor: scrolled
              ? "rgba(226, 232, 240, 0.9)"
              : "rgba(226, 232, 240, 0.75)",
          }}
          transition={{
            // Entrance drop
            y: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.65 },
            scale: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            // Ultra-smooth scroll expansion/contraction (cubic-bezier ease, NO bounce / NO stutter)
            maxWidth: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
            borderBottomLeftRadius: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            borderBottomRightRadius: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            backgroundColor: { duration: 0.3 },
            borderColor: { duration: 0.3 },
            boxShadow: { duration: 0.35 },
          }}
          className={cn(
            "w-full pointer-events-auto backdrop-blur-xl border border-t-0 select-none overflow-hidden"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-400 ease-out",
              scrolled
                ? "h-[54px] px-5 lg:px-6 gap-3.5 lg:gap-5"
                : "h-[62px] px-6 lg:px-8 gap-5 lg:gap-7"
            )}
          >
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 border-r border-slate-200/60 shrink-0 group select-none transition-all duration-300",
                scrolled ? "pr-3.5 lg:pr-4" : "pr-5 lg:pr-6"
              )}
            >
              <img
                src="/logo.png"
                alt="Logo SuaraMoklet"
                className={cn(
                  "object-contain transition-transform duration-200 group-hover:scale-105",
                  scrolled ? "h-6.5 w-6.5" : "h-7.5 w-7.5"
                )}
              />
              <span
                className={cn(
                  "font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-all",
                  scrolled ? "text-[15px]" : "text-[16px]"
                )}
              >
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
                      "flex items-center rounded-full font-semibold transition-all duration-200",
                      scrolled ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-[14px]",
                      active
                        ? "bg-red-600/10 text-red-600 font-bold shadow-xs shadow-red-500/5"
                        : "text-slate-600 hover:text-red-600 hover:bg-red-50/70"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Search, Kelola, Notif, Profile / Login */}
            <div className="flex items-center gap-2 pl-1 shrink-0">
              {/* Search Box */}
              <form
                onSubmit={handleSearch}
                className={cn(
                  "flex items-center bg-slate-100/70 hover:bg-slate-100 focus-within:bg-white rounded-full border border-slate-200/70 focus-within:border-red-400/80 focus-within:ring-2 focus-within:ring-red-500/15 transition-all duration-200",
                  scrolled ? "px-2.5 py-1" : "px-3 py-1.5"
                )}
              >
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className={cn(
                    "bg-transparent border-none outline-none ring-0 text-[13px] font-medium text-slate-800 placeholder:text-slate-400 ml-1.5 transition-all duration-300",
                    scrolled ? "w-20 focus:w-32" : "w-24 focus:w-36"
                  )}
                />
              </form>

              {/* Kelola Badge (Admin / Unit PIC) */}
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

              {/* Notification & User Profile / Login Button */}
              {mounted && isAuthenticated && user ? (
                <div className="flex items-center gap-2 ml-0.5">
                  <NotificationBell />
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all",
                      pathname === "/profile"
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200/70 bg-white/60 hover:bg-white hover:border-slate-300 shadow-xs"
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
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className={cn(
                    "rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs hover:shadow-red-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95",
                    scrolled ? "h-8 px-4 text-[13px]" : "h-9 px-5 text-[14px]"
                  )}
                >
                  Masuk
                </button>
              )}
            </div>
          </div>
        </motion.header>
      </div>

      {/* ─── MOBILE: True Morphing Dynamic Island Navbar ─── */}
      {/* Dimmed Backdrop — fade via opacity only (GPU composited) */}
      <motion.div
        initial={false}
        animate={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 bg-slate-950/20 backdrop-blur-[3px] z-40 md:hidden"
      />

      {/* Floating Dynamic Island */}
      <div className="fixed top-3 inset-x-3 z-50 md:hidden flex justify-center pointer-events-none font-sans">
        <motion.header
          initial={{ y: -72, opacity: 0, scale: 0.9 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            borderRadius: 26,
            backgroundColor: mobileOpen
              ? "rgba(255, 255, 255, 0.99)"
              : scrolled
              ? "rgba(255, 255, 255, 0.93)"
              : "rgba(255, 255, 255, 0.86)",
            boxShadow: mobileOpen
              ? "0 28px 64px -12px rgba(0, 0, 0, 0.20), 0 10px 28px -4px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1)"
              : scrolled
              ? "0 14px 34px -4px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)"
              : "0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)",
            borderColor: mobileOpen
              ? "rgba(226, 232, 240, 0.9)"
              : "rgba(220, 227, 234, 0.75)",
          }}
          transition={{
            // Entrance drop
            y: { type: "spring", stiffness: 220, damping: 32, mass: 0.85 },
            opacity: { duration: 0.55, ease: "easeOut" },
            scale: { type: "spring", stiffness: 220, damping: 32, mass: 0.85 },
            // Visual state changes
            backgroundColor: { duration: 0.32, ease: "easeOut" },
            boxShadow: { duration: 0.38, ease: "easeOut" },
            borderColor: { duration: 0.32, ease: "easeOut" },
          }}
          className={cn(
            "w-full max-w-md pointer-events-auto backdrop-blur-2xl border select-none overflow-hidden"
          )}
        >
          {/* Island Header Row */}
          <div className="h-[52px] px-4 flex items-center justify-between shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 select-none group shrink-0 min-w-0"
              onClick={() => setMobileOpen(false)}
            >
              <motion.img
                src="/logo.png"
                alt="Logo SuaraMoklet"
                animate={{
                  scale: mobileOpen ? 1.05 : 1,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-7 w-7 object-contain shrink-0"
              />
              <span className="font-extrabold text-[15.5px] tracking-tight text-slate-900 shrink-0 select-none">
                Suara<span className="text-red-600">Moklet</span>
              </span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              {mounted && isAuthenticated && user && <NotificationBell />}
              
              {/* Smooth Morphing Hamburger Button */}
              <motion.button
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                whileTap={{ scale: 0.88 }}
                className={cn(
                  "h-8.5 w-8.5 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer overflow-hidden shrink-0",
                  mobileOpen
                    ? "bg-red-50 text-red-600 border border-red-200 shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
                )}
              >
                <motion.div
                  key={mobileOpen ? "close-icon" : "menu-icon"}
                  initial={{ rotate: mobileOpen ? -90 : 90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: mobileOpen ? 90 : -90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center"
                >
                  {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Morphing Island Expanded Menu — Grid rows trick avoids height:auto jank */}
          <motion.div
            initial={false}
            animate={{
              gridTemplateRows: mobileOpen ? "1fr" : "0fr",
              opacity: mobileOpen ? 1 : 0,
            }}
            transition={{
              gridTemplateRows: { duration: 0.42, ease: [0.25, 1, 0.5, 1] },
              opacity: {
                duration: mobileOpen ? 0.28 : 0.18,
                delay: mobileOpen ? 0.06 : 0,
                ease: "easeOut",
              },
            }}
            style={{ display: "grid" }}
          >
            {/* Inner wrapper clips overflow so grid-rows transition is clean */}
            <div style={{ overflow: "hidden" }}>
            <div className="px-3.5 pb-4 pt-1 space-y-2.5 border-t border-slate-100/90">
              {/* Navigation Links — staggered slide-up on open, instant hide on close */}
              <div className="space-y-0.5 pt-1">
                {links.map(({ label, href }, idx) => {
                  const active = isActive(href);
                  return (
                    <motion.div
                      key={href}
                      animate={
                        mobileOpen
                          ? { opacity: 1, y: 0, filter: "blur(0px)" }
                          : { opacity: 0, y: 8, filter: "blur(2px)" }
                      }
                      transition={{
                        duration: mobileOpen ? 0.35 : 0.12,
                        delay: mobileOpen ? 0.1 + idx * 0.04 : 0,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors select-none",
                          active
                            ? "bg-red-50 text-red-600 font-bold border border-red-100/80"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Search Bar + Auth — staggered after nav links */}
              <motion.div
                animate={
                  mobileOpen
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 8, filter: "blur(2px)" }
                }
                transition={{
                  duration: mobileOpen ? 0.35 : 0.1,
                  delay: mobileOpen ? 0.18 + links.length * 0.04 : 0,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="pt-2 border-t border-slate-100 space-y-2.5"
              >
                <form onSubmit={handleSearch} className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari keluhan..."
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-9.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Cari
                  </button>
                </form>

                {/* User Auth Section */}
                {mounted && isAuthenticated && user ? (
                  <div className="space-y-1 pt-1">
                    {/* User Profile Summary */}
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-black text-xs uppercase shadow-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">{user.name}</p>
                        <p className="text-[10.5px] text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
                      </div>
                    </div>

                    {user.role !== "USER" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all",
                          pathname === "/dashboard" ? "bg-red-50 text-red-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-500" />
                        <span>Dashboard Kelola</span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all",
                        pathname === "/profile" ? "bg-red-50 text-red-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[9px] uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <span>Profil Saya</span>
                    </Link>

                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="h-10 w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs shadow-red-500/20 active:scale-[0.98] transition-all"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Masuk</span>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
            </div>{/* end grid inner wrapper */}
          </motion.div>
        </motion.header>
      </div>

      {/* Spacer so content doesn't hide under mobile floating Dynamic Island */}
      <div className="h-[68px] md:hidden" />
    </>
  );
}
