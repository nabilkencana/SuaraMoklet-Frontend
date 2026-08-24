"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { useRoleViewStore } from "@/app/store/role-view.store";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import UnitDashboard from "@/components/dashboard/UnitDashboard";

let isAppHydrated = false;

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { activeView } = useRoleViewStore();
  const [mounted, setMounted] = useState(isAppHydrated);

  useEffect(() => {
    isAppHydrated = true;
    if (!mounted) setMounted(true);
  }, [mounted]);

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
    return <FullScreenLoader />;
  }

  // SUPERADMIN murni → selalu AdminDashboard
  if (user?.role === "SUPERADMIN") {
    return <AdminDashboard />;
  }

  // SUPER_PIC → bisa toggle antara iso view (UnitDashboard) dan admin view (AdminDashboard)
  if (user?.role === "SUPER_PIC") {
    if (activeView === "iso") {
      // Tampilan seperti PIC biasa / ketua PIC
      return <UnitDashboard />;
    }
    // Tampilan Super Admin penuh
    return <AdminDashboard />;
  }

  if (user?.role === "UNIT_PIC" || user?.role === "UNIT_MEMBER") {
    return <UnitDashboard />;
  }

  return <FullScreenLoader />;
}
