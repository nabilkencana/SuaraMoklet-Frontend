"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

function SsoHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSso = async () => {
      if (!token) {
        setError("Token SSO tidak ditemukan.");
        toast.error("Gagal login SSO: Token tidak ditemukan.");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      try {
        const response = await apiClient.auth.ssoExchange(token);
        login(response.user, response.accessToken);
        toast.success("Berhasil login via SSO Moklet App!");
        router.push("/dashboard");
      } catch (err: any) {
        console.error("SSO Error:", err);
        const msg = err?.response?.data?.message || "Gagal memverifikasi token SSO.";
        setError(msg);
        toast.error(msg);
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleSso();
  }, [token, router, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-4">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">!</div>
          <h1 className="text-xl font-extrabold text-slate-800">SSO Gagal</h1>
          <p className="text-slate-500 text-sm">{error}</p>
          <p className="text-xs text-slate-400">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-6 flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-[#b61722] animate-spin" />
        <div>
          <h1 className="text-lg font-extrabold text-slate-800">Memverifikasi SSO</h1>
          <p className="text-slate-500 text-sm mt-1">Harap tunggu sebentar, sedang menyinkronkan dengan Moklet App...</p>
        </div>
      </div>
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <SsoHandler />
    </Suspense>
  );
}
