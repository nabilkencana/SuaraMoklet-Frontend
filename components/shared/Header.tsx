"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [querySource, setQuerySource] = useState<string | null>(null);
  const [fixedLayer,  setFixedLayer]  = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setFixedLayer(document.getElementById("fixed-layer"));
    setQuerySource(new URLSearchParams(window.location.search).get("source"));
    const handler = () => {
      setScrolled(window.scrollY > 20);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

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
    
    // For "Keluhan Saya", highlight if on /complaints index OR if viewing detail with source=my-complaints
    if (href === "/complaints") {
      if (pathname === "/complaints") return true;
      if (pathname?.startsWith("/complaints/") && !pathname?.startsWith("/complaints/create")) {
        return querySource === "my-complaints";
      }
      return false;
    }

    // For "Jelajahi", highlight if on /search OR if viewing detail without source=my-complaints
    if (href === "/search") {
      if (pathname === "/search") return true;
      if (pathname?.startsWith("/complaints/") && !pathname?.startsWith("/complaints/create")) {
        return querySource !== "my-complaints";
      }
      return false;
    }

    return pathname === href || pathname?.startsWith(href + "/");
  };

  const isMobileActive = (href: string) => {
    if (href === "/") return pathname === "/";
    
    // For "Keluhan Saya", highlight if on /complaints index OR if viewing detail with source=my-complaints
    if (href === "/complaints") {
      if (pathname === "/complaints") return true;
      if (pathname?.startsWith("/complaints/") && !pathname?.startsWith("/complaints/create")) {
        return querySource === "my-complaints";
      }
      return false;
    }

    // For "Jelajahi", highlight if on /search OR if viewing detail without source=my-complaints
    if (href === "/search") {
      if (pathname === "/search") return true;
      if (pathname?.startsWith("/complaints/") && !pathname?.startsWith("/complaints/create")) {
        return querySource !== "my-complaints";
      }
      return false;
    }

    return pathname === href || pathname?.startsWith(href + "/");
  };

  // Dynamic max width on desktop for notch compactness with ample room for logged in users
  const isPrivileged = mounted && isAuthenticated && user && user.role !== "USER";
  const targetMaxWidth = !mounted || !isAuthenticated
    ? (scrolled ? 860 : 1060)
    : isPrivileged
    ? (scrolled ? 1160 : 1240)
    : (scrolled ? 1040 : 1160);

  // Chrome fixed (desktop navbar, backdrop & island mobile) di-portal ke #fixed-layer
  // yang berada di luar #smooth-wrapper agar tidak terpengaruh transform ScrollSmoother.
  const fixedChrome = (
    <>
      {/* ─── DESKTOP: Ultra-Smooth MacBook Notch Morphing Navbar ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none font-sans px-4">
        <motion.header
          initial={{ y: -80, opacity: 0, scale: 0.95, maxWidth: 1060 }}
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
            "w-full pointer-events-auto backdrop-blur-xl border border-t-0 select-none relative"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-400 ease-out",
              scrolled
                ? "h-13.5 px-4 lg:px-6 gap-2 lg:gap-4"
                : "h-15.5 px-5 lg:px-7 gap-3 lg:gap-6"
            )}
          >
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 border-r border-slate-200/60 shrink-0 group select-none transition-all duration-300",
                scrolled ? "pr-3 lg:pr-4" : "pr-4 lg:pr-5"
              )}
            >
              <img
                src="/logo.png"
                alt="Logo SuaraMoklet"
                className={cn(
                  "object-contain transition-transform duration-200 group-hover:scale-105 shrink-0",
                  scrolled ? "h-6.5 w-6.5" : "h-7.5 w-7.5"
                )}
              />
              <span
                className={cn(
                  "font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-all shrink-0",
                  scrolled ? "text-[14.5px]" : "text-[15.5px]"
                )}
              >
                Suara<span className="text-red-600">Moklet</span>
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-0.5 shrink-0" aria-label="Navigasi Utama">
              {links.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center rounded-full font-semibold transition-all duration-200 shrink-0",
                      scrolled ? "h-8 px-2.5 lg:px-3 text-xs lg:text-[13px]" : "h-9 px-3 lg:px-3.5 text-xs lg:text-[13.5px]",
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
            <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
              {/* Search Box */}
              <form
                onSubmit={handleSearch}
                className={cn(
                  "flex items-center bg-slate-100/70 hover:bg-slate-100 focus-within:bg-white rounded-full border border-slate-200/70 focus-within:border-red-400/80 focus-within:ring-2 focus-within:ring-red-500/15 transition-all duration-200 shrink-0",
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
                    "bg-transparent border-none outline-none ring-0 text-xs lg:text-[13px] font-medium text-slate-800 placeholder:text-slate-400 ml-1.5 transition-all duration-300",
                    scrolled ? "w-16 focus:w-28 lg:w-20 lg:focus:w-32" : "w-18 focus:w-32 lg:w-24 lg:focus:w-36"
                  )}
                />
              </form>

              {/* Kelola Badge (Admin / Unit PIC) */}
              {mounted && isAuthenticated && user && user.role !== "USER" && (
                <Link
                  href="/dashboard"
                  className={cn(
                    "h-8 px-2.5 lg:px-3 flex items-center gap-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shrink-0",
                    pathname === "/dashboard"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                  )}
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" style={{ animation: "spin 8s linear infinite" }} />
                  <span>Kelola</span>
                </Link>
              )}

              {/* Notification & User Profile / Login Button */}
              {mounted && isAuthenticated && user ? (
                <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                  <NotificationBell />
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-1.5 lg:gap-2 pl-1 pr-2.5 lg:pr-3 py-1 rounded-full border transition-all shrink-0",
                      pathname === "/profile"
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200/70 bg-white/60 hover:bg-white hover:border-slate-300 shadow-xs"
                    )}
                  >
                    <div className="h-6.5 w-6.5 lg:h-7 lg:w-7 rounded-full bg-linear-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm shrink-0">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-xs lg:text-[13px] font-bold text-slate-800 truncate max-w-18 lg:max-w-28">
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer shrink-0"
                    title="Keluar"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className={cn(
                    "rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs hover:shadow-red-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0",
                    scrolled ? "h-8 px-3.5 text-xs lg:text-[13px]" : "h-9 px-4 lg:px-5 text-xs lg:text-[14px]"
                  )}
                >
                  Masuk
                </button>
              )}
            </div>
          </div>
        </motion.header>
      </div>

      {/* ─── MOBILE: Top Curved Header matching reference screenshot ─── */}
      {/* Dimmed Backdrop */}
      <motion.div
        initial={false}
        animate={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-xs z-40 md:hidden"
      />

      {/* Top MacBook Notch Header Container (Centered with Left & Right margins) */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex justify-center px-3.5 font-sans pointer-events-none">
        <motion.header
          initial={{ y: -72, opacity: 0, scale: 0.95 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            borderBottomLeftRadius: mobileOpen ? 28 : (scrolled ? 24 : 28),
            borderBottomRightRadius: mobileOpen ? 28 : (scrolled ? 24 : 28),
            backgroundColor: mobileOpen
              ? "rgba(255, 255, 255, 0.98)"
              : scrolled
              ? "rgba(255, 255, 255, 0.92)"
              : "rgba(255, 255, 255, 0.85)",
            boxShadow: mobileOpen
              ? "0 24px 54px -10px rgba(0, 0, 0, 0.16), 0 8px 20px -4px rgba(0, 0, 0, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 1)"
              : scrolled
              ? "0 14px 34px -4px rgba(0, 0, 0, 0.11), 0 2px 8px -2px rgba(0, 0, 0, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)"
              : "0 8px 24px -4px rgba(0, 0, 0, 0.07), 0 2px 6px -2px rgba(0, 0, 0, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.85)",
            borderColor: scrolled
              ? "rgba(226, 232, 240, 0.9)"
              : "rgba(226, 232, 240, 0.75)",
          }}
          transition={{
            y: { type: "spring", stiffness: 220, damping: 30, mass: 0.8 },
            opacity: { duration: 0.45 },
            scale: { type: "spring", stiffness: 220, damping: 30, mass: 0.8 },
            borderBottomLeftRadius: { duration: 0.3 },
            borderBottomRightRadius: { duration: 0.3 },
            backgroundColor: { duration: 0.3 },
            boxShadow: { duration: 0.3 },
            borderColor: { duration: 0.3 },
          }}
          className={cn(
            "w-full max-w-[440px] pointer-events-auto backdrop-blur-2xl border border-t-0 select-none overflow-hidden"
          )}
        >
          {/* Header Bar Row: Notch Layout */}
          <div className="h-14.5 px-4.5 flex items-center justify-between">
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-2 select-none group min-w-0"
              onClick={() => setMobileOpen(false)}
            >
              <img
                src="/logo.png"
                alt="Logo SuaraMoklet"
                className="h-7 w-7 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-extrabold text-[15.5px] tracking-tight text-slate-900 shrink-0 select-none">
                Suara<span className="text-red-600">Moklet</span>
              </span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              {mounted && isAuthenticated && user && <NotificationBell />}

              {/* Exact Two-Line Minimalist Hamburger Icon */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                className="h-9 w-9 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-slate-100/80 active:scale-90 transition-all cursor-pointer"
              >
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-5 h-0.5 bg-slate-900 rounded-full origin-center block"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-5 h-0.5 bg-slate-900 rounded-full origin-center block"
                />
              </button>
            </div>
          </div>

          {/* Morphing Expanded Drawer Menu */}
          <motion.div
            initial={false}
            animate={{
              gridTemplateRows: mobileOpen ? "1fr" : "0fr",
              opacity: mobileOpen ? 1 : 0,
            }}
            transition={{
              gridTemplateRows: { duration: 0.38, ease: [0.25, 1, 0.5, 1] },
              opacity: {
                duration: mobileOpen ? 0.25 : 0.15,
                delay: mobileOpen ? 0.05 : 0,
                ease: "easeOut",
              },
            }}
            style={{ display: "grid" }}
          >
            <div style={{ overflow: "hidden" }}>
              <div className="px-6 pb-6 pt-2 space-y-3 border-t border-slate-100">
                {/* Navigation Links */}
                <div className="space-y-1 pt-1">
                  {links.map(({ label, href }, idx) => {
                    const active = isActive(href);
                    return (
                      <motion.div
                        key={href}
                        animate={
                          mobileOpen
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 6 }
                        }
                        transition={{
                          duration: mobileOpen ? 0.3 : 0.1,
                          delay: mobileOpen ? 0.08 + idx * 0.03 : 0,
                        }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all select-none",
                            active
                              ? "bg-red-50 text-red-600 font-bold border border-red-100"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                          )}
                        >
                          {label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Search Bar + Auth */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari keluhan..."
                      className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>Cari</span>
                    </button>
                  </form>

                  {/* User Auth Section */}
                  {mounted && isAuthenticated && user ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-8.5 w-8.5 rounded-full bg-linear-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-black text-xs uppercase shadow-xs shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-bold text-slate-900 truncate leading-tight">{user.name}</p>
                          <p className="text-[11px] text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
                        </div>
                      </div>

                      {user.role !== "USER" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all",
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
                          "flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all",
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
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all cursor-pointer"
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
                        className="h-11 w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs shadow-red-500/20 active:scale-[0.98] transition-all"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Masuk</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.header>
      </div>
    </>
  );

  return (
    <>
      {mounted && fixedLayer
        ? createPortal(fixedChrome, fixedLayer)
        : fixedChrome}
      {/* Spacer so content doesn't hide under mobile curved header */}
      <div className="h-18 md:hidden" />
    </>
  );
}
