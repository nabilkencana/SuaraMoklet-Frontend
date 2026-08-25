// ─── Auth Rehydration Helper ──────────────────────────────────────────────────
//
// F2 FIX (MD-2 partial): Karena user PII tidak lagi disimpan di localStorage,
// state Zustand `user` akan null setiap kali halaman di-reload.
//
// Solusi: Jika accessToken cookie masih valid, panggil GET /users/me untuk
// mengisi ulang user state dari server — tanpa menyentuh localStorage.
//
// Dipanggil dari AuthRehydrator component di app/layout.tsx (client-side mount).

import { getCookie } from "@/lib/cookies";
import useAuthStore from "@/app/store/auth.store";
import { api } from "@/lib/axios";
import { isHttpOnlyMode } from "@/lib/auth-mode";

let rehydrationAttempted = false;

/**
 * Re-hydrate user state dari /users/me jika accessToken cookie ada (atau di HttpOnly mode)
 * tapi user state masih null (reload halaman).
 *
 * Guard `rehydrationAttempted` memastikan hanya dipanggil sekali per session.
 */
export async function rehydrateAuth(): Promise<void> {
  if (rehydrationAttempted) return;
  rehydrationAttempted = true;

  // Di mode cookie-js (saat ini): jika tidak ada cookie di JS, skip.
  // Di mode httponly (Fase 2): JS tidak bisa baca cookie HttpOnly, jadi langsung fetch /users/me
  // (browser otomatis mengirim cookie HttpOnly pada request).
  if (!isHttpOnlyMode) {
    const token = getCookie("accessToken");
    if (!token) return;
  }

  const store = useAuthStore.getState();
  // Kalau user sudah ada (misal login baru), skip
  if (store.user) return;

  try {
    // silent: true → 401 dari call ini TIDAK mentrigger redirect di axios interceptor.
    // Kenapa: rehydrateAuth berjalan saat mount di semua halaman termasuk halaman PUBLIK
    // (/, /complaints, /search). Jika token sudah invalid setelah JWT rotation dan user
    // sedang di halaman publik, kita cukup clearAuth() di sini — tidak perlu paksa redirect
    // ke /login. Halaman protected sudah dihandle oleh proxy.ts sebelum React render.
    const response = await api.get<any>("/users/me", { silent: true } as any);
    const u = response.data;
    store.setUser({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.profilePicture || undefined,
    });
    store.setIsAuthenticated(true);
  } catch {
    // Token tidak valid (expired/revoked setelah JWT rotation) → bersihkan sesi.
    // Proxy.ts sudah redirect halaman protected ke /login sebelum ini berjalan.
    // Halaman publik: cukup hapus cookie invalid, user tetap bisa browse.
    store.clearAuth();
  }
}

/** Reset guard — berguna untuk testing */
export function resetRehydrationGuard(): void {
  rehydrationAttempted = false;
}
