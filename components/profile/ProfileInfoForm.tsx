"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Camera, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const infoSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal harus 3 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal harus 10 digit"),
});

type InfoFormData = z.infer<typeof infoSchema>;

interface ProfileInfoFormProps {
  initialData: { name: string; phone?: string; avatarUrl?: string };
  onUpdate: (data: { name: string; phone: string; avatarUrl?: string }) => Promise<boolean>;
}

export default function ProfileInfoForm({ initialData, onUpdate }: ProfileInfoFormProps) {
  const [avatar, setAvatar] = useState<string | undefined>(initialData.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone || "",
    },
  });

  useEffect(() => {
    setValue("name", initialData.name);
    setValue("phone", initialData.phone || "");
    setAvatar(initialData.avatarUrl);
  }, [initialData, setValue]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await apiClient.upload.uploadFile(file);
      setAvatar(res.url);
      toast.success("Foto profil berhasil diunggah!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Gagal mengunggah foto profil");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: InfoFormData) => {
    setIsSaving(true);
    await onUpdate({
      name: data.name,
      phone: data.phone,
      avatarUrl: avatar,
    });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photo */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={initialData.name} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-10 w-10 text-slate-400" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="space-y-1.5 text-center sm:text-left">
          <label className="relative cursor-pointer bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-all shadow-sm">
            <Camera className="h-3.5 w-3.5" />
            <span>Pilih Foto</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading || isSaving} />
          </label>
          <p className="text-[10px] text-slate-400">Direkomendasikan rasio 1:1, JPG, JPEG, PNG, maks. 2MB</p>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Nama Lengkap
        </label>
        <Input
          id="name"
          type="text"
          disabled={isSaving}
          className={errors.name ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""}
          placeholder="Nama Lengkap Anda"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Phone Number Input */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Nomor Telepon
        </label>
        <Input
          id="phone"
          type="tel"
          disabled={isSaving}
          className={errors.phone ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""}
          placeholder="081234567890"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSaving || isUploading} className="w-full sm:w-auto">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Simpan Perubahan</span>
        )}
      </Button>
    </form>
  );
}
