import React, { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle="Isi data berikut untuk mendaftarkan akun sekolah Anda."
    >
      <Suspense fallback={<FullScreenLoader />}>
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
