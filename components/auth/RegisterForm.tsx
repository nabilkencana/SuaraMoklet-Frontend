"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/app/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const registerSchema = z
  .object({
    name: z.string().min(3, "Nama lengkap minimal harus 3 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    phone: z.string().min(10, "Nomor telepon minimal harus 10 digit"),
    password: z.string().min(8, "Password minimal harus 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi password minimal harus 8 karakter"),
    terms: z.boolean().refine((val) => val === true, "Anda harus menyetujui syarat & ketentuan"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.auth.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "USER",
      });

      login(response.user, response.accessToken);

      toast.success("Registrasi Berhasil!", {
        description: `Selamat datang di SuaraMoklet, ${response.user.name}!`,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat melakukan registrasi.";
      toast.error("Registrasi Gagal", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Nama Lengkap
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
            <User className="h-4.5 w-4.5" />
          </div>
          <Input
            id="name"
            type="text"
            disabled={isLoading}
            className={`pl-10 ${
              errors.name ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            placeholder="John Doe"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-xs font-medium text-red-600 mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

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

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Nomor Telepon
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
            <Phone className="h-4.5 w-4.5" />
          </div>
          <Input
            id="phone"
            type="tel"
            disabled={isLoading}
            className={`pl-10 ${
              errors.phone ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            placeholder="081234567890"
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-xs font-medium text-red-600 mt-1">
            {errors.phone.message}
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
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-red-600 transition-colors"
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

      {/* Confirm Password Input */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Konfirmasi Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            disabled={isLoading}
            className={`pl-10 pr-10 ${
              errors.confirmPassword ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-red-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className="space-y-1.5 pt-1">
        <label className="flex items-start gap-2.5 text-xs text-neutral-500 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isLoading}
            className="mt-0.5 rounded border-neutral-300 text-red-600 focus:ring-red-500/20"
            {...register("terms")}
          />
          <span>
            Saya menyetujui{" "}
            <a href="#" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
              Syarat & Ketentuan
            </a>{" "}
            serta{" "}
            <a href="#" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
              Kebijakan Privasi
            </a>.
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs font-medium text-red-600 mt-1">
            {errors.terms.message}
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
            <span>Memproses Daftar...</span>
          </>
        ) : (
          <>
            <span>Buat Akun Baru</span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}
