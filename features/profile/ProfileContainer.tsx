"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import useProfile from "@/hooks/useProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordCard from "@/components/profile/ChangePasswordCard";
import ProfileActions from "@/components/profile/ProfileActions";

// Validation schema mapping all profile and change password fields
const profileFormSchema = z
  .object({
    name: z.string().min(3, "Nama lengkap wajib diisi (minimal 3 karakter)"),
    phone: z.string().min(10, "Nomor telepon tidak valid (minimal 10 digit)"),
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Require current password if new password is filled
      if (data.newPassword && data.newPassword.length > 0) {
        return !!data.currentPassword && data.currentPassword.length > 0;
      }
      return true;
    },
    {
      message: "Password saat ini wajib diisi untuk mengganti password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      // Enforce new password strength rules
      if (data.newPassword && data.newPassword.length > 0) {
        const hasUpper = /[A-Z]/.test(data.newPassword);
        const hasLower = /[a-z]/.test(data.newPassword);
        const hasNumber = /[0-9]/.test(data.newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(data.newPassword);
        return data.newPassword.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
      }
      return true;
    },
    {
      message: "Password baru harus minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan karakter khusus",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      // Ensure confirmation password matches the new password
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Konfirmasi password baru harus cocok",
      path: ["confirmPassword"],
    }
  );

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileContainer() {
  const {
    profile,
    isLoading,
    isUpdating,
    updateProfile,
    uploadAvatar,
    changePassword,
  } = useProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Sync profile data dynamically on successful fetch
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.user.name,
        phone: profile.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profile, reset]);

  // Loading skeleton state
  if (isLoading || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-200">
          <div className="h-28 w-28 rounded-full bg-slate-100 shrink-0" />
          <div className="space-y-2 w-full pt-2 flex flex-col items-center sm:items-start">
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-3.5 bg-slate-100 rounded w-1/5" />
            <div className="h-7 bg-slate-100 rounded w-1/4 pt-1" />
          </div>
        </div>
        
        <div className="space-y-6 pt-6">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    reset({
      name: profile.user.name,
      phone: profile.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.info("Perubahan dibatalkan.");
  };

  const handleAvatarUpload = async (file: File) => {
    return await uploadAvatar(file);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    let profileSuccess = true;
    let passwordSuccess = true;

    const isProfileChanged =
      values.name !== profile.user.name || values.phone !== profile.phone;

    // 1. Perform profile field updates
    if (isProfileChanged) {
      profileSuccess = await updateProfile({
        name: values.name,
        phone: values.phone,
        avatarUrl: profile.avatarUrl,
      });
    }

    // 2. Perform password update
    if (values.newPassword && values.newPassword.length > 0) {
      passwordSuccess = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      if (passwordSuccess) {
        // Reset password fields upon successful submission
        setValue("currentPassword", "");
        setValue("newPassword", "");
        setValue("confirmPassword", "");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8"
      >
        {/* Profile Header & Avatar controls */}
        <ProfileHeader
          userName={profile.user.name}
          role={profile.user.role}
          avatarUrl={profile.avatarUrl}
          isUploading={isUpdating}
          onUploadAvatar={handleAvatarUpload}
        />

        {/* Personal Details Form Section */}
        <ProfileForm
          register={register}
          errors={errors}
          email={profile.user.email}
          isSaving={isUpdating}
        />

        {/* Security Password Changes Section */}
        <ChangePasswordCard
          register={register}
          errors={errors}
          watch={watch}
          isSaving={isUpdating}
        />

        {/* Action Controls */}
        <ProfileActions
          onCancel={handleCancel}
          isSaving={isUpdating}
          isDirty={isDirty}
        />
      </form>
    </div>
  );
}
