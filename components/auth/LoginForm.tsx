"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles, ClipboardCopy } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/app/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Dummy Accounts ───────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    roleLabel: "Siswa",
    email: "demo@student.moklet.org",
    password: "demo12345",
    account: {
      id: "demo-user-001",
      name: "Demo Siswa",
      email: "demo@student.moklet.org",
      role: "USER" as const,
    },
    token: "demo-access-token-user-2026",
  },
  {
    roleLabel: "Super Admin",
    email: "superadmin@moklet.org",
    password: "superadmin123",
    account: {
      id: "demo-superadmin-001",
      name: "Super Admin",
      email: "superadmin@moklet.org",
      role: "SUPERADMIN" as const,
    },
    token: "demo-access-token-superadmin-2026",
  },
  {
    roleLabel: "ISO Officer",
    email: "iso@moklet.org",
    password: "iso12345",
    account: {
      id: "demo-iso-001",
      name: "ISO Officer",
      email: "iso@moklet.org",
      role: "SUPER_PIC" as const,
    },
    token: "demo-access-token-iso-2026",
  },
  {
    roleLabel: "PIC Sarpras",
    email: "pic_sarpras@moklet.org",
    password: "sarpras123",
    account: {
      id: "demo-pic-001",
      name: "PIC Sarpras",
      email: "pic_sarpras@moklet.org",
      role: "UNIT_PIC" as const,
    },
    token: "demo-access-token-pic-2026",
  },
];

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

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
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="text-xs text-neutral-400 font-medium">Mengalihkan ke Beranda...</span>
      </div>
    );
  }

  const fillDemo = (index: number) => {
    const demo = DEMO_USERS[index];
    setSelectedDemoIndex(index);
    setValue("email", demo.email);
    setValue("password", demo.password);
    toast.info(`Kredensial ${demo.roleLabel} telah diisi!`, {
      description: "Klik 'Masuk ke Akun' untuk melanjutkan.",
    });
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // ─── Dummy accounts bypass (no backend required) ───────────────────────────
    const matchedDemo = DEMO_USERS.find(
      (demo) =>
        data.email.trim() === demo.email &&
        data.password === demo.password
    );
    if (matchedDemo) {
      await new Promise((r) => setTimeout(r, 700)); // simulate network delay
      login(matchedDemo.account, matchedDemo.token);
      toast.success(`Selamat datang, ${matchedDemo.account.name}!`, {
        description: `Anda masuk sebagai ${matchedDemo.roleLabel} (akun demo).`,
      });
      setIsLoading(false);
      
      let finalRedirect = redirectUrl;
      if (redirectUrl === "/dashboard" || redirectUrl === "/complaints" || redirectUrl === "/") {
        finalRedirect = "/";
      }
      
      router.push(finalRedirect);
      router.refresh();
      return;
    }

    // ─── Real API login ───────────────────────────────────────────────────────
    try {
      const response = await apiClient.auth.login(data);
      login(response.user, response.accessToken);
      toast.success(`Selamat datang kembali, ${response.user.name}!`, {
        description: "Login berhasil.",
      });
      router.push(redirectUrl);
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

  const currentDemo = DEMO_USERS[selectedDemoIndex];

  return (
    <div className="space-y-5">
      {/* Demo account selector card */}
      <div className="relative rounded-2xl border border-dashed border-red-300 bg-red-50/60 p-4.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-red-600">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Akun Demo Multi-Role</span>
          </div>
          <span className="text-[9px] text-red-500/80 font-bold bg-red-100 px-2 py-0.5 rounded-full">
            Pilih Peran
          </span>
        </div>

        {/* Tabs for Roles */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-red-100/50 rounded-xl">
          {DEMO_USERS.map((demo, idx) => (
            <button
              key={demo.roleLabel}
              type="button"
              onClick={() => {
                setSelectedDemoIndex(idx);
                setValue("email", demo.email);
                setValue("password", demo.password);
              }}
              className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedDemoIndex === idx
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-red-700 hover:bg-red-200/50"
              }`}
            >
              {demo.roleLabel.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Selected Credentials */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-white/70 p-3 rounded-xl border border-red-100">
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">Email ({currentDemo.account.role})</span>
            <code className="text-[10.5px] font-mono text-neutral-700 font-semibold truncate block">{currentDemo.email}</code>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">Password</span>
            <code className="text-[10.5px] font-mono text-neutral-700 font-semibold block">{currentDemo.password}</code>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fillDemo(selectedDemoIndex)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white border border-red-200 text-[10px] font-extrabold uppercase tracking-wider text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all rounded-xl shadow-xs cursor-pointer select-none"
        >
          <ClipboardCopy className="h-3 w-3" />
          <span>Autofill Kredensial {currentDemo.roleLabel}</span>
        </button>
      </div>

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
