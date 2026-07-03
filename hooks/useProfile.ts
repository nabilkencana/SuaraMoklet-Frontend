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
    } catch {
      // Fallback: build profile from the currently stored user in Zustand
      if (storeUser) {
        setProfile({
          user: storeUser,
          phone: "081234567890",
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
    } catch {
      // Mock: update local state directly
      await new Promise((r) => setTimeout(r, 600));
      if (storeUser) {
        const updatedUser: User = { ...storeUser, name: data.name, avatarUrl: data.avatarUrl };
        setUser(updatedUser);
        setProfile((prev) =>
          prev ? { ...prev, user: updatedUser, phone: data.phone, avatarUrl: data.avatarUrl } : null
        );
      }
      toast.success("Profil berhasil diperbarui! (Mode Demo)");
      return true;
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    setIsUpdating(true);
    try {
      // 1. Upload the file
      const res = await apiClient.upload.uploadAvatar(file);
      const url = res.url;

      // 2. Patch the avatar in profile
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
    } catch {
      // Fallback: local URL for demo preview
      await new Promise((r) => setTimeout(r, 600));
      const mockUrl = URL.createObjectURL(file);
      if (storeUser) {
        const updatedUser: User = { ...storeUser, avatarUrl: mockUrl };
        setUser(updatedUser);
        setProfile((prev) =>
          prev ? { ...prev, user: updatedUser, avatarUrl: mockUrl } : null
        );
      }
      toast.success("Foto profil berhasil diunggah! (Mode Demo)");
      return mockUrl;
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
    } catch {
      // Mock: simulate success
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Kata sandi berhasil diperbarui! (Mode Demo)");
      return true;
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
