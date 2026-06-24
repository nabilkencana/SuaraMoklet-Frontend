import { api } from "./axios";
import { User, UserRole } from "@/types/auth";
import { UpdateProfileRequest, ChangePasswordRequest } from "@/types/profile";
import { Complaint, CreateComplaintRequest, ComplaintUnit } from "@/types/complaint";
import { Comment, CreateCommentRequest } from "@/types/comment";

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

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>("/users/change-password", data);
    return response.data;
  },
};

export const complaintsApi = {
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
  getAll: async (): Promise<ComplaintUnit[]> => {
    const response = await api.get<ComplaintUnit[]>("/units");
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
};

export const apiClient = {
  auth: authApi,
  profile: profileApi,
  complaints: complaintsApi,
  comments: commentsApi,
  units: unitsApi,
  upload: uploadApi,
};

export default apiClient;
