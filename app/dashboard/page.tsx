"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { Loader2 } from "lucide-react";

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import IsoDashboard from "@/components/dashboard/IsoDashboard";
import UnitDashboard from "@/components/dashboard/UnitDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role === "USER") {
        router.replace("/complaints");
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") {
    return <AdminDashboard />;
  }

  if (user?.role === "UNIT_PIC" || user?.role === "UNIT_MEMBER") {
    return <UnitDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  );
}
