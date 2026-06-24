import React, { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Silakan masuk menggunakan akun sekolah Anda."
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="text-xs text-neutral-400 font-medium">Memuat Formulir...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      <div className="mt-8 text-center text-sm text-neutral-500 border-t border-neutral-100 pt-6">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          Daftar Sekarang
        </Link>
      </div>
    </AuthLayout>
  );
}
