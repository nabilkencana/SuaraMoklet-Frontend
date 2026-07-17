import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/app/store/auth.store";
import { User } from "@/types/auth";
import { UpdateProfileRequest, ChangePasswordRequest } from "@/types/profile";

export function useProfile() {
  const { user: storeUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState<{ user: User; phone?: string; avatarUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.profile.getProfile();
      setProfile(data);
      if (data.user) {
        setUser({
          ...data.user,
          avatarUrl: data.avatarUrl,
        });
      }
    } catch (err: any) {
      console.error("Failed to load user profile:", err);
      if (storeUser) {
        setProfile({
          user: storeUser,
          phone: "",
          avatarUrl: storeUser.avatarUrl || undefined,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    setIsUpdating(true);
    try {
      const updated = await apiClient.profile.updateProfile(data);
      setProfile(updated);
      if (updated.user) {
        setUser({
          ...updated.user,
          avatarUrl: updated.avatarUrl,
        });
      }
      toast.success("Profil berhasil diperbarui!");
      return true;
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      const msg = err.response?.data?.message || "Gagal memperbarui profil.";
      toast.error(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    setIsUpdating(true);
    try {
      // 1. Upload the file to S3
      const res = await apiClient.upload.uploadAvatar(file);
      const url = res.url;

      // 2. Patch the avatar url in database
      const updated = await apiClient.profile.updateAvatar(url);
      setProfile(updated);
      if (updated.user) {
        setUser({
          ...updated.user,
          avatarUrl: updated.avatarUrl,
        });
      }
      toast.success("Foto profil berhasil diunggah!");
      return url;
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      toast.error("Gagal mengunggah foto profil.");
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setIsUpdating(true);
    try {
      await apiClient.profile.changePassword(data);
      toast.success("Kata sandi berhasil diperbarui!");
      return true;
    } catch (err: any) {
      console.error("Failed to update password:", err);
      const msg = err.response?.data?.message || "Gagal memperbarui kata sandi.";
      toast.error(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    isUpdating,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
  };
}

export default useProfile;
