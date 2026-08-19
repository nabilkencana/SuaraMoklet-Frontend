"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import UnitComplaintDetailPage from "@/components/dashboard/UnitComplaintDetailPage";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

export default function DashboardComplaintPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !["UNIT_PIC", "UNIT_MEMBER", "SUPERADMIN", "SUPER_PIC"].includes(user?.role || "")) {
        router.replace("/dashboard");
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || !["UNIT_PIC", "UNIT_MEMBER", "SUPERADMIN", "SUPER_PIC"].includes(user?.role || "")) {
    return <FullScreenLoader />;
  }

  return <UnitComplaintDetailPage complaintId={params.id as string} />;
}
