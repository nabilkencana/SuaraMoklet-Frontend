import { create } from "zustand";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "SUPERADMIN"
  | "SUPER_PIC"
  | "UNIT_PIC"
  | "UNIT_MEMBER"
  | "USER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  login: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isClient = typeof window !== "undefined";

function readStoredUser(): AuthUser | null {
  if (!isClient) return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set) => ({
  user: readStoredUser(),
  accessToken: isClient ? getCookie("accessToken") : null,
  isAuthenticated: isClient ? !!getCookie("accessToken") : false,

  login: (user, accessToken) => {
    setCookie("accessToken", accessToken);
    if (isClient) localStorage.setItem("user", JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    deleteCookie("accessToken");
    if (isClient) localStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setUser: (user) => {
    if (isClient) {
      user
        ? localStorage.setItem("user", JSON.stringify(user))
        : localStorage.removeItem("user");
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      setCookie("accessToken", token);
      set({ accessToken: token, isAuthenticated: true });
    } else {
      deleteCookie("accessToken");
      set({ accessToken: null, isAuthenticated: false });
    }
  },

  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  clearAuth: () => {
    deleteCookie("accessToken");
    if (isClient) localStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));

export default useAuthStore;