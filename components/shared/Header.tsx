"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Megaphone, Menu, X, LogOut, Search, LogIn, Settings } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    });
    router.push("/");
  };

  // Dynamically determine links based on role
  let links = [
    { label: "Home", href: "/" },
    { label: "Jelajahi", href: "/search" },
  ];

  if (mounted && isAuthenticated) {
    links.push({ label: "Keluhan Saya", href: "/complaints" });
  } else {
    links = [
      { label: "Home", href: "/#home" },
      { label: "Jelajahi", href: "/search" },
      { label: "Tentang", href: "/#about" },
      { label: "Trending", href: "/#trending" },
      { label: "FAQ", href: "/#faq" },
    ];
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) {
      return pathname === "/" && typeof window !== "undefined" && window.location.hash === href.substring(1);
    }
    if (href === "/complaints") {
      return pathname === "/complaints" || (pathname?.startsWith("/complaints/") && !pathname?.startsWith("/complaints/create"));
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };


  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || pathname !== "/"
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain shrink-0" />
          <span className="font-extrabold text-red-600 text-lg tracking-tight">SuaraMoklet</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors",
                isActive(link.href)
                  ? "text-red-600"
                  : "text-slate-655 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-red-600" />
              )}
            </Link>
          ))}
        </div>

        {/* Search + Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari keluhan..."
              className="h-9 w-52 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
            />
          </form>

          {mounted && isAuthenticated && user && user.role !== "USER" && (
            <Link
              href="/dashboard"
              className={cn(
                "h-8 px-4 flex items-center justify-center rounded-full text-xs font-extrabold active:scale-[0.98] transition-all cursor-pointer border shrink-0",
                pathname === "/dashboard"
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-200"
                  : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100/60"
              )}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5 animate-spin-slow" style={{ animationDuration: '8s' }} />
              <span>Kelola</span>
            </Link>
          )}

          {mounted && isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:text-red-650 hover:bg-slate-50 transition-all",
                  pathname === "/profile" && "text-red-600 bg-slate-50"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-3 rounded-lg text-slate-500 border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                <span>Keluar</span>
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="h-9 px-5 flex items-center gap-2 justify-center rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                isActive(link.href)
                  ? "bg-red-50 text-red-600"
                  : "text-slate-700 hover:bg-slate-50 hover:text-red-650"
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari keluhan..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                Cari
              </button>
            </form>

            {mounted && isAuthenticated && user ? (
              <>
                {user.role !== "USER" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                      pathname === "/dashboard"
                        ? "bg-red-50 text-red-650"
                        : "text-slate-700 hover:bg-slate-50 hover:text-red-650"
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Kelola</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
                    pathname === "/profile" ? "bg-red-50 text-red-600" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-655 text-xs uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-slate-850">{user.name}</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 justify-start cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="h-9 flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold text-center"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
