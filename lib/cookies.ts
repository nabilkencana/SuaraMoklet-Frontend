// ─── Cookie Utilities ─────────────────────────────────────────────────────────
//
// F2 FIX (MD-2 partial): Default TTL cookie dikurangi dari 7 hari → 1 hari.
// Skenario serangan: Token cookie yang berlaku 7 hari memperpanjang window eksploitasi
// jika token bocor (dari network inspection, shoulder surfing, atau XSS).
// TTL 1 hari meminimalkan dampak tanpa memutus sesi normal (user login ulang per hari
// bila tidak ada mekanisme refresh — acceptable trade-off sampai backend menyediakan
// endpoint POST /auth/refresh untuk silent token renewal).
//
// NOTE: Migrasi penuh ke HttpOnly cookie (tidak bisa dibaca JS sama sekali)
// membutuhkan backend support. Status: PENDING — koordinasikan dengan tim backend.

export const setCookie = (name: string, value: string, days = 1) => {
  if (typeof window === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};

export const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};
