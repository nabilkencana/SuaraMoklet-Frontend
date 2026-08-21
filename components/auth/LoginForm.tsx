"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/app/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal harus 8 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const isUnitOrAdmin = user?.role === "UNIT_PIC" || user?.role === "UNIT_MEMBER" || user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC";
      const isUser = user?.role === "USER";
      let finalRedirect = redirectUrl;
      if (isUnitOrAdmin && (redirectUrl === "/dashboard" || redirectUrl === "/complaints" || redirectUrl === "/unit" || redirectUrl === "/unit/complaints" || redirectUrl === "/")) {
        finalRedirect = "/dashboard";
      } else if (isUser && redirectUrl === "/") {
        // Default role USER (selaras dengan proxy.ts ROLE_DEFAULT_REDIRECT)
        finalRedirect = "/complaints";
      }
      router.replace(finalRedirect);
    }
  }, [isAuthenticated, router, redirectUrl, user]);

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="text-xs text-neutral-400 font-medium">Mengalihkan ke Dashboard...</span>
      </div>
    );
  }


  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // ─── Real API login ───────────────────────────────────────────────────────
    try {
      const response = await apiClient.auth.login(data);
      login(response.user, response.accessToken);
      toast.success(`Selamat datang kembali, ${response.user.name}!`, {
        description: "Login berhasil.",
      });
      const isUnitOrAdmin = response.user.role === "UNIT_PIC" || response.user.role === "UNIT_MEMBER" || response.user.role === "SUPERADMIN" || response.user.role === "SUPER_PIC";
      const isUser = response.user.role === "USER";
      let finalRedirect = redirectUrl;
      if (isUnitOrAdmin && (redirectUrl === "/dashboard" || redirectUrl === "/complaints" || redirectUrl === "/unit" || redirectUrl === "/unit/complaints" || redirectUrl === "/")) {
        finalRedirect = "/dashboard";
      } else if (isUser && redirectUrl === "/") {
        // Default role USER (selaras dengan proxy.ts ROLE_DEFAULT_REDIRECT)
        finalRedirect = "/complaints";
      }
      router.push(finalRedirect);
      router.refresh();
    } catch (error: unknown) {
      console.error("Login error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Email atau password salah.";
      toast.error("Gagal Masuk", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-5">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <Input
              id="email"
              type="email"
              disabled={isLoading}
              className={`pl-10 ${
                errors.email ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
              }`}
              placeholder="nama@student.moklet.org"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              disabled={isLoading}
              className={`pl-10 pr-10 ${
                errors.password ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
              }`}
              placeholder="••••••••"
              {...register("password")}
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full mt-2 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Memproses Masuk...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Akun</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
