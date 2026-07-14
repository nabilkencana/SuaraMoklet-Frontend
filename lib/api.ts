import { api } from "./axios";
import { User, UserRole } from "@/types/auth";
import { UpdateProfileRequest, ChangePasswordRequest } from "@/types/profile";
import { Complaint, CreateComplaintRequest, ComplaintUnit, UnitModel } from "@/types/complaint";
import { Comment, CreateCommentRequest } from "@/types/comment";
import { DashboardStats } from "@/types/dashboard";

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};

export const profileApi = {
  getProfile: async (): Promise<{ user: User; phone?: string; avatarUrl?: string }> => {
    const response = await api.get<{ user: User; phone?: string; avatarUrl?: string }>("/users/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<{ user: User; phone?: string; avatarUrl?: string }> => {
    const response = await api.patch<{ user: User; phone?: string; avatarUrl?: string }>("/users/profile", data);
    return response.data;
  },

  updateAvatar: async (avatarUrl: string): Promise<{ user: User; phone?: string; avatarUrl?: string }> => {
    const response = await api.patch<{ user: User; phone?: string; avatarUrl?: string }>("/users/profile/avatar", { avatarUrl });
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>("/users/change-password", data);
    return response.data;
  },
};

export const complaintsApi = {
  getAll: async (params?: any): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>("/complaints", { params });
    return response.data;
  },

  getOwn: async (): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>("/complaints/my");
    return response.data;
  },

  getById: async (id: string): Promise<Complaint> => {
    const response = await api.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await api.post<Complaint>("/complaints", data);
    return response.data;
  },

  support: async (id: string, data?: { name?: string; comment?: string }): Promise<{ supports: number }> => {
    const response = await api.post<{ supports: number }>(`/complaints/${id}/support`, data);
    return response.data;
  },

  forward: async (id: string, data: { toUnitId: string; forwardNote?: string }): Promise<Complaint> => {
    const response = await api.patch<Complaint>(`/complaints/${id}/forward`, data);
    return response.data;
  },

  updateVisibility: async (id: string, visibility: "PUBLIC" | "PRIVATE"): Promise<Complaint> => {
    const response = await api.patch<Complaint>(`/complaints/${id}/visibility`, { visibility });
    return response.data;
  },
};

export const commentsApi = {
  getByComplaintId: async (complaintId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/complaints/${complaintId}/comments`);
    return response.data;
  },

  create: async (complaintId: string, data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>(`/complaints/${complaintId}/comments`, data);
    return response.data;
  },
};

export const unitsApi = {
  getAll: async (): Promise<UnitModel[]> => {
    const response = await api.get<UnitModel[]>("/units");
    return response.data;
  },

  create: async (data: { name: string; description?: string }): Promise<UnitModel> => {
    const response = await api.post<UnitModel>("/units", data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; description?: string }): Promise<UnitModel> => {
    const response = await api.patch<UnitModel>(`/units/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },

  addMember: async (unitId: string, data: { email: string; isPic?: boolean }): Promise<any> => {
    const response = await api.post(`/units/${unitId}/members`, data);
    return response.data;
  },

  removeMember: async (unitId: string, userId: string): Promise<any> => {
    const response = await api.delete(`/units/${unitId}/members/${userId}`);
    return response.data;
  },

  updateMemberPic: async (unitId: string, userId: string, data: { isPic: boolean }): Promise<any> => {
    const response = await api.patch(`/units/${unitId}/members/${userId}/pic`, data);
    return response.data;
  },
};

export const uploadApi = {
  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ url: string }>("/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export const statsApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/stats");
    return response.data;
  },
};

export const apiClient = {
  auth: authApi,
  profile: profileApi,
  complaints: complaintsApi,
  comments: commentsApi,
  units: unitsApi,
  upload: uploadApi,
  stats: statsApi,
};

export default apiClient;
