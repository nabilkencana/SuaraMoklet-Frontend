// ─── Auth Mode Configuration ──────────────────────────────────────────────────
//
// Mengontrol bagaimana accessToken dikelola antara frontend dan backend.
//
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │  Mode "cookie-js" (DEFAULT — saat ini)                                      │
// │                                                                             │
// │  - accessToken disimpan via document.cookie (JS-readable)                  │
// │  - Frontend menambahkan Authorization: Bearer header secara manual          │
// │  - Backend membaca token dari Authorization header                          │
// │  - Rentan terhadap XSS karena token bisa dibaca JS                          │
// ├─────────────────────────────────────────────────────────────────────────────┤
// │  Mode "httponly" (TARGET — aktifkan setelah backend siap)                  │
// │                                                                             │
// │  PRASYARAT backend (koordinasikan dulu sebelum deploy):                    │
// │  1. POST /auth/login → Set-Cookie: accessToken; HttpOnly; Secure; SameSite=Lax │
// │  2. POST /auth/sso/exchange → Set-Cookie yang sama                         │
// │  3. POST /auth/refresh → endpoint baru, return Set-Cookie baru             │
// │  4. JWT Strategy NestJS membaca dari cookie ATAU Authorization header      │
// │                                                                             │
// │  Setelah semua prasyarat terpenuhi, set di .env produksi:                  │
// │    NEXT_PUBLIC_AUTH_MODE=httponly                                           │
// │                                                                             │
// │  Behavior yang berubah di frontend:                                        │
// │  - Frontend TIDAK lagi panggil setCookie/getCookie untuk accessToken        │
// │  - axios interceptor TIDAK menambah Authorization: Bearer header            │
// │  - Browser otomatis kirim HttpOnly cookie ke setiap request API            │
// │  - Saat reload: langsung GET /users/me (tidak perlu cek cookie dulu)        │
// │  - 401 → coba POST /auth/refresh dulu → baru redirect /login               │
// └─────────────────────────────────────────────────────────────────────────────┘

export type AuthMode = "cookie-js" | "httponly";

/**
 * Mode autentikasi aktif.
 * Set `NEXT_PUBLIC_AUTH_MODE=httponly` di env setelah backend siap.
 */
export const AUTH_MODE: AuthMode =
  (process.env.NEXT_PUBLIC_AUTH_MODE ?? "cookie-js") as AuthMode;

/** `true` saat backend sudah mengelola token via Set-Cookie HttpOnly */
export const isHttpOnlyMode = AUTH_MODE === "httponly";

/**
 * URL endpoint refresh token di backend (via Next.js API Route proxy).
 * Hanya relevan di mode "httponly".
 *
 * Route handler di app/api/auth/refresh/route.ts mem-proxy request ini
 * ke backend agar refreshToken (HttpOnly) bisa dibaca server-side.
 */
export const REFRESH_ENDPOINT = "/api/auth/refresh";
