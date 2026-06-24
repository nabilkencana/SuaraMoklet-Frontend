import { User } from "./auth";

export interface ProfileData {
  user: User;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
