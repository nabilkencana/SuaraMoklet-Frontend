import { create } from "zustand";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";
import { isHttpOnlyMode } from "@/lib/auth-mode";

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
  userType?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null; // null di mode httponly (token ada di HttpOnly cookie, tidak bisa dibaca JS)
  isAuthenticated: boolean;

  /**
   * Login mode "cookie-js" (saat ini): simpan token ke document.cookie.
   * Dipanggil dari LoginForm dan SSOPage selama backend masih return token di JSON body.
   */
  login: (user: AuthUser, accessToken: string) => void;

  /**
   * Login mode "httponly" (Fase 2): backend sudah set cookie via Set-Cookie header.
   * Frontend tidak perlu/tidak bisa menyimpan token — hanya set user state.
   * Aktif saat NEXT_PUBLIC_AUTH_MODE=httponly.
   */
  loginHttpOnly: (user: AuthUser) => void;

  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isClient = typeof window !== "undefined";

// ─── Store ────────────────────────────────────────────────────────────────────
//
// F2 FIX (MD-2): User PII tidak disimpan di localStorage — hanya Zustand in-memory.
// Saat reload, AuthRehydrator memanggil GET /users/me untuk re-populate user state.
//
// isHttpOnlyMode: jika true, tidak ada cookie yang dibaca/ditulis JS untuk token.
// Initial isAuthenticated = false di mode httponly (AuthRehydrator yang memverifikasi).

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: isClient && !isHttpOnlyMode ? getCookie("accessToken") : null,
  isAuthenticated: isClient && !isHttpOnlyMode ? !!getCookie("accessToken") : false,

  // ── Mode cookie-js (saat ini) ──
  login: (user, accessToken) => {
    if (!isHttpOnlyMode) {
      // Cookie-js mode: simpan token di JS-accessible cookie (TTL 1 hari)
      setCookie("accessToken", accessToken, 1);
    }
    // Di httponly mode, login() tidak boleh dipanggil — gunakan loginHttpOnly()
    set({ user, accessToken: isHttpOnlyMode ? null : accessToken, isAuthenticated: true });
  },

  // ── Mode httponly (Fase 2) ──
  loginHttpOnly: (user) => {
    // Backend sudah set cookie via Set-Cookie; kita tidak tahu token valuenya
    // (dan tidak perlu tahu — browser yang otomatis kirim ke setiap request API)
    set({ user, accessToken: null, isAuthenticated: true });
  },

  logout: () => {
    if (!isHttpOnlyMode) {
      // Cookie-js mode: hapus cookie JS
      deleteCookie("accessToken");
    }
    // HttpOnly mode: cookie akan dihapus oleh backend saat POST /auth/logout
    // atau expire sendiri. Frontend hanya clear state.
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
  },

  setToken: (token) => {
    if (!isHttpOnlyMode) {
      if (token) {
        setCookie("accessToken", token, 1);
        set({ accessToken: token, isAuthenticated: true });
      } else {
        deleteCookie("accessToken");
        set({ accessToken: null, isAuthenticated: false });
      }
    } else {
      // HttpOnly mode: token dikelola backend, hanya update authenticated state
      set({ accessToken: null, isAuthenticated: !!token });
    }
  },

  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  clearAuth: () => {
    if (!isHttpOnlyMode) {
      deleteCookie("accessToken");
    }
    // One-time migration cleanup: hapus sisa user key lama dari localStorage
    if (isClient) {
      try { localStorage.removeItem("user"); } catch { /* ignore */ }
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));

export default useAuthStore;