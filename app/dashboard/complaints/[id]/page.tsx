"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import UnitComplaintDetailPage from "@/components/dashboard/UnitComplaintDetailPage";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

let isAppHydrated = false;

export default function DashboardComplaintPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(isAppHydrated);

  useEffect(() => {
    isAppHydrated = true;
    if (!mounted) setMounted(true);
  }, [mounted]);

  if (!mounted) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated || !["UNIT_PIC", "UNIT_MEMBER", "SUPERADMIN", "SUPER_PIC"].includes(user?.role || "")) {
    router.replace("/dashboard");
    return <FullScreenLoader />;
  }

  return <UnitComplaintDetailPage complaintId={params.id as string} />;
}
