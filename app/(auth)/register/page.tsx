import React, { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle="Isi data berikut untuk mendaftarkan akun sekolah Anda."
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="text-xs text-neutral-400 font-medium">Memuat Formulir...</span>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>

      <div className="mt-6 text-center text-sm text-neutral-500 border-t border-neutral-100 pt-5">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          Masuk Sekarang
        </Link>
      </div>
    </AuthLayout>
  );
}
