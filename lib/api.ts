/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "./axios";
import { User, UserRole } from "@/types/auth";
import { UpdateProfileRequest, ChangePasswordRequest } from "@/types/profile";
import { Complaint, CreateComplaintRequest, ComplaintUnit, UnitModel } from "@/types/complaint";
import { Comment, CreateCommentRequest } from "@/types/comment";
import { DashboardStats, DashboardNotification } from "@/types/dashboard";

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

// ─── Mapper Helpers ───────────────────────────────────────────────────────────

export function mapFrontendUnitToBackend(unit: string): string {
  switch (unit) {
    case "Umum (ISO)":
      return "ISO";
    case "Sarpras":
      return "SARPRA";
    case "Kurikulum":
      return "KURIKULUM";
    case "Kesiswaan":
      return "KESISWAAN";
    case "Hubin":
      return "HUBINKOM";
    case "Tata Usaha":
      return "TATA_USAHA";
    default:
      return "ISO";
  }
}

export function mapBackendUnitToFrontend(name: string): ComplaintUnit {
  switch (name) {
    case "ISO":
      return "Umum (ISO)";
    case "SARPRA":
      return "Sarpras";
    case "KURIKULUM":
      return "Kurikulum";
    case "KESISWAAN":
      return "Kesiswaan";
    case "HUBINKOM":
      return "Hubin";
    case "TATA_USAHA":
      return "Tata Usaha";
    default:
      return "Umum (ISO)";
  }
}

export function mapBackendComplaintToFrontend(c: any): Complaint {
  let mappedUnit: ComplaintUnit = "Umum (ISO)";
  if (c.unit && c.unit.name) {
    mappedUnit = mapBackendUnitToFrontend(c.unit.name);
  } else if (c.forwardedToUnit && c.forwardedToUnit.name) {
    mappedUnit = mapBackendUnitToFrontend(c.forwardedToUnit.name);
  }

  const evidenceUrl = c.media && c.media.length > 0 ? c.media[0].url : undefined;

  let reporter = null;
  if (c.author) {
    reporter = {
      id: c.author.id,
      name: c.author.name,
      avatarUrl: c.author.profilePicture || undefined,
    };
  }

  // Build sequential timeline from fields
  const timeline = [
    {
      id: `${c.id}-created`,
      title: "Keluhan Dibuat",
      description: c.isAnonymous
        ? "Keluhan diajukan secara anonim ke platform SuaraMoklet."
        : `Keluhan resmi diajukan ke platform SuaraMoklet oleh ${c.author?.name || "Pelapor"}.`,
      createdAt: c.createdAt,
    },
  ];

  if (c.forwardedToUnit) {
    timeline.push({
      id: `${c.id}-forwarded`,
      title: `Diteruskan ke Unit ${mapBackendUnitToFrontend(c.forwardedToUnit.name)}`,
      description: c.forwardNote || `Laporan diteruskan ke Unit ${mapBackendUnitToFrontend(c.forwardedToUnit.name)}.`,
      createdAt: c.forwardedAt || c.createdAt,
    });
  }

  return {
    id: c.id,
    title: c.title,
    description: c.content || "",
    expectedOutput: c.expectedOutput || "",
    unit: mappedUnit,
    status: c.status,
    isAnonymous: c.isAnonymous,
    evidenceUrl,
    createdAt: c.createdAt,
    supports: c.supports || 0,
    reporter,
    visibility: c.visibility,
    timeline,
  };
}

export function flattenComments(tree: any[]): Comment[] {
  const result: Comment[] = [];
  function traverse(node: any) {
    if (!node) return;
    const isPic = node.comment_by === "ADMIN" || node.isPic || false;
    result.push({
      id: node.id,
      complaintId: node.complaintId,
      content: node.content,
      evidenceUrl: node.media && node.media.length > 0 ? node.media[0].url : undefined,
      createdAt: node.createdAt,
      isPic: isPic,
      user: {
        id: node.author?.id || node.authorId,
        name: node.author?.name || "User",
        email: node.author?.email || "",
        role: isPic ? "UNIT_PIC" : "USER",
        avatarUrl: node.author?.profilePicture || undefined,
      },
    });
    if (Array.isArray(node.replies)) {
      node.replies.forEach(traverse);
    }
  }
  if (Array.isArray(tree)) {
    tree.forEach(traverse);
  }
  return result;
}

// ─── API Clients ──────────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<any>("/auth/login", data);
    const user = response.data.user;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.profilePicture || undefined,
      },
      accessToken: response.data.accessToken,
    };
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    // throw error as registration is disabled on backend
    throw new Error("Pendaftaran akun baru dinonaktifkan. Silakan login melalui Moklet App.");
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<any>("/users/me");
    const user = response.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.profilePicture || undefined,
    };
  },
};

export const profileApi = {
  // GET /users/me — endpoint profil di backend
  getProfile: async (): Promise<{ user: User; phone?: string; avatarUrl?: string }> => {
    const response = await api.get<any>("/users/me");
    const user = response.data;
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.profilePicture || undefined,
    };
    return {
      user: mappedUser,
      phone: user.phone_number || undefined,
      avatarUrl: user.profilePicture || undefined,
    };
  },

  // Read-only: profil tidak dapat diubah (data dari database eksternal)
  updateProfile: async (_data: UpdateProfileRequest): Promise<{ user: User; phone?: string; avatarUrl?: string }> => {
    throw new Error("Profil tidak dapat diubah.");
  },
  updateAvatar: async (_avatarUrl: string): Promise<{ user: User; phone?: string; avatarUrl?: string }> => {
    throw new Error("Profil tidak dapat diubah.");
  },
  changePassword: async (_data: ChangePasswordRequest): Promise<{ message: string }> => {
    throw new Error("Password tidak dapat diubah.");
  },
};

export const complaintsApi = {
  getAll: async (params?: any): Promise<Complaint[]> => {
    const response = await api.get<any>("/complaints", { params });
    const rawList = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return rawList.map(mapBackendComplaintToFrontend);
  },

  getUnitComplaints: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    unitId?: string;
  }): Promise<{ meta: any; stats: Record<string, number>; data: Complaint[] }> => {
    const response = await api.get<any>("/complaints/unit", { params });
    const rawData = Array.isArray(response.data?.data) ? response.data.data : [];
    return {
      meta: response.data?.meta || {},
      stats: response.data?.stats || {},
      data: rawData.map(mapBackendComplaintToFrontend),
    };
  },

  getPublic: async (params?: any): Promise<Complaint[]> => {
    const response = await api.get<any>("/complaints/public", { params });
    const rawList = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return rawList.map(mapBackendComplaintToFrontend);
  },

  getOwn: async (): Promise<Complaint[]> => {
    const response = await api.get<any>("/complaints/my-complaints");
    const rawList = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return rawList.map(mapBackendComplaintToFrontend);
  },

  getById: async (id: string): Promise<Complaint> => {
    const response = await api.get<any>(`/complaint/${id}`);
    return mapBackendComplaintToFrontend(response.data);
  },

  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    let unitId: string | undefined;
    if (data.unit) {
      try {
        const units = await unitsApi.getAll();
        const mappedName = mapFrontendUnitToBackend(data.unit);
        const matched = units.find((u) => u.name === mappedName);
        if (matched) {
          unitId = matched.id;
        }
      } catch (err) {
        console.error("Failed to map unit to unitId:", err);
      }
    }
    const payload = {
      title: data.title,
      content: data.description,
      isAnonymous: data.isAnonymous,
      unitId,
      evidenceUrl: data.evidenceUrl,
    };
    const response = await api.post<any>("/complaints", payload);
    return mapBackendComplaintToFrontend(response.data);
  },

  support: async (id: string, data?: { name?: string; comment?: string }): Promise<{ supports: number }> => {
    // Fallback locally as backend doesn't store upvote/support entities
    return { supports: 1 };
  },

  forward: async (id: string, data: { toUnitId: string; forwardNote?: string }): Promise<Complaint> => {
    const response = await api.patch<any>(`/complaints/${id}/forward`, data);
    return mapBackendComplaintToFrontend(response.data);
  },

  updateVisibility: async (id: string, visibility: "PUBLIC" | "PRIVATE"): Promise<Complaint> => {
    const response = await api.patch<any>(`/complaints/${id}/visibility`, { visibility });
    return mapBackendComplaintToFrontend(response.data);
  },

  // ponytail: POST /complaints/:id/rating — only callable by complaint owner after CLOSED
  postRating: async (id: string, score: number, note?: string): Promise<void> => {
    await api.post(`/complaints/${id}/rating`, { score, note });
  },

  // PATCH /complaints/config/auto-close — set auto close threshold (daysToClose)
  updateAutoCloseConfig: async (daysToClose: number): Promise<any> => {
    const response = await api.patch<any>("/complaints/config/auto-close", { daysToClose });
    return response.data;
  },
};

export const commentsApi = {
  getByComplaintId: async (complaintId: string): Promise<Comment[]> => {
    const response = await api.get<any>(`/complaints/${complaintId}/comments`);
    return flattenComments(response.data);
  },

  create: async (complaintId: string, data: CreateCommentRequest): Promise<Comment> => {
    const payload = {
      content: data.content,
      evidenceUrl: data.evidenceUrl,
    };
    const response = await api.post<any>(`/complaints/${complaintId}/comments`, payload);
    const node = response.data;
    return {
      id: node.id,
      complaintId: node.complaintId,
      content: node.content,
      evidenceUrl: node.media && node.media.length > 0 ? node.media[0].url : undefined,
      createdAt: node.createdAt,
      isPic: node.comment_by === "ADMIN" || false,
      user: {
        id: node.author?.id || node.authorId,
        name: node.author?.name || "User",
        email: node.author?.email || "",
        role: node.comment_by === "ADMIN" ? "UNIT_PIC" : "USER",
        avatarUrl: node.author?.profilePicture || undefined,
      },
    };
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
    const payload = {
      email: data.email,
      isPIC: data.isPic,
    };
    const response = await api.post(`/units/${unitId}/members`, payload);
    return response.data;
  },

  removeMember: async (unitId: string, userId: string): Promise<any> => {
    const response = await api.delete(`/units/${unitId}/members/${userId}`);
    return response.data;
  },

  updateMemberPic: async (unitId: string, userId: string, data: { isPic: boolean }): Promise<any> => {
    const payload = {
      isPIC: data.isPic,
    };
    const response = await api.patch(`/units/${unitId}/members/${userId}/pic`, payload);
    return response.data;
  },
};

export const uploadApi = {
  // POST /upload — satu-satunya upload endpoint di backend (field name: "file")
  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // NOTE: Backend tidak punya /upload/avatar endpoint terpisah.
  // Gunakan endpoint /upload yang sama untuk semua file termasuk avatar.
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export const statsApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<any>("/stats");
      const data = response.data;

      const totalCount = data.global?.totalComplaints || 0;
      const resolvedCount = data.byStatus?.CLOSED || 0;
      const activeCount = totalCount - resolvedCount;
      const pendingCount = (data.byStatus?.WAITING_RESPONSE || 0) + (data.byStatus?.WAITING_USER || 0);
      const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

      let unreadNotifications = 0;
      try {
        const notifRes = await api.get<any>("/notifications", { params: { isRead: false } });
        unreadNotifications = Array.isArray(notifRes.data?.data) ? notifRes.data.data.length : 0;
      } catch (err) {
        console.error("Failed to load unread notification count:", err);
      }

      return {
        activeCount,
        resolvedCount,
        pendingCount,
        totalCount,
        unreadNotifications,
        resolutionRate,
      };
    } catch (err) {
      console.error("Failed to fetch stats from backend:", err);
      return {
        activeCount: 0,
        resolvedCount: 0,
        pendingCount: 0,
        totalCount: 0,
        unreadNotifications: 0,
        resolutionRate: 0,
      };
    }
  },
};

export const notificationsApi = {
  getAll: async (params?: { page?: number; limit?: number; isRead?: boolean }): Promise<DashboardNotification[]> => {
    const response = await api.get<any>("/notifications", { params });
    const rawList = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return rawList.map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      complaintId: n.link ? n.link.split("/").pop() : undefined,
    }));
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
};

export const usersApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get<any[]>("/users");
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
  notifications: notificationsApi,
  users: usersApi,
};

export default apiClient;
