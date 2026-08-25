import axios from "axios";
import { getCookie } from "./cookies";
import { toast } from "sonner";
import useAuthStore from "@/app/store/auth.store";
import { isHttpOnlyMode, REFRESH_ENDPOINT } from "@/lib/auth-mode";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Mode cookie-js: Pasang Authorization Bearer header secara manual
    // Mode httponly (Fase 2): Skip header — browser otomatis kirim HttpOnly cookie via withCredentials
    if (!isHttpOnlyMode) {
      const token = getCookie("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// ─── 401 & Silent Refresh Handler ─────────────────────────────────────────────
//
// 1. Mode cookie-js (saat ini):
//    401 → handle401() langsung redirect ke /login dengan toast & debounce race-condition.
//
// 2. Mode httponly (Fase 2/3):
//    401 → Coba silent refresh via POST /api/auth/refresh (Next.js proxy route handler).
//    - Jika refresh sukses: replay request yang gagal + request concurrent lainnya.
//    - Jika refresh gagal (refresh token expired/invalid): baru panggil handle401().

let isHandling401 = false;
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

// Routes yang tidak perlu `?redirect=` (sudah di halaman publik/auth)
const NO_REDIRECT_PATHS = ["/login", "/register", "/sso", "/"];

function handle401(): void {
  if (typeof window === "undefined") return;
  if (isHandling401) return; // Guard: hanya satu handler yang jalan
  isHandling401 = true;

  // Bersihkan state auth (hapus cookie + clear Zustand)
  useAuthStore.getState().clearAuth();

  // Jangan redirect jika sudah di halaman login/publik
  const currentPath = window.location.pathname;
  if (NO_REDIRECT_PATHS.some((p) => currentPath.startsWith(p))) {
    isHandling401 = false;
    return;
  }

  // Toast dengan ID deterministik agar Sonner tidak menampilkan duplikat
  toast.error("Sesi Anda berakhir", {
    id: "session-expired",
    description:
      "Token login tidak lagi valid. Silakan masuk kembali untuk melanjutkan.",
    duration: 6000,
  });

  // Redirect ke /login dengan ?redirect= agar user bisa balik ke halaman asal
  const redirectParam = encodeURIComponent(
    currentPath + window.location.search
  );
  window.location.href = `/login?redirect=${redirectParam}`;

  setTimeout(() => {
    isHandling401 = false;
  }, 300);
}

/**
 * Mencoba refresh access token via backend (melalui Route Handler proxy)
 */
async function trySilentRefresh(): Promise<boolean> {
  try {
    const res = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isSilent = (error.config as any)?.silent || false;
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // Jika di mode httponly dan request belum pernah di-retry
      if (isHttpOnlyMode && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          // Masukkan ke antrean tunggu refresh selesai
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((success) => {
              if (success) {
                resolve(api(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        isRefreshing = true;
        const refreshSuccess = await trySilentRefresh();
        isRefreshing = false;
        onRefreshed(refreshSuccess);

        if (refreshSuccess) {
          return api(originalRequest);
        }
      }

      handle401();
      return Promise.reject(error);
    }

    if (typeof window !== "undefined" && !isSilent) {
      if (!error.response) {
        // Network connection error
        toast.error("Gagal terhubung ke server", {
          description: "Periksa koneksi internet Anda atau coba beberapa saat lagi.",
        });
      } else if (error.response.status >= 500) {
        // Server internal error
        toast.error("Terjadi kesalahan pada server", {
          description: "Sistem mengalami gangguan sementara. Tim teknis sedang menanganinya.",
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;