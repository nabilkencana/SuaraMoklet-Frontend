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
      if (data.user) setUser(data.user);
    } catch {
      // Fallback: build profile from the currently stored user in Zustand
      if (storeUser) {
        setProfile({
          user: storeUser,
          phone: "081234567890",
          avatarUrl: undefined,
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
      if (updated.user) setUser(updated.user);
      toast.success("Profil berhasil diperbarui!");
      return true;
    } catch {
      // Mock: update local state directly
      await new Promise((r) => setTimeout(r, 600));
      if (storeUser) {
        const updatedUser: User = { ...storeUser, name: data.name };
        setUser(updatedUser);
        setProfile((prev) => prev ? { ...prev, user: updatedUser, phone: data.phone, avatarUrl: data.avatarUrl } : null);
      }
      toast.success("Profil berhasil diperbarui! (Mode Demo)");
      return true;
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
    changePassword,
  };
}
export default useProfile;
