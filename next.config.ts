import type { NextConfig } from "next";
import path from "path";

// ─── Security Headers ─────────────────────────────────────────────────────────
// Skenario serangan ditutup:
//   - LO-4 / M-01: X-Powered-By fingerprinting → poweredByHeader: false
//   - clickjacking → X-Frame-Options: SAMEORIGIN
//   - MIME sniffing → X-Content-Type-Options: nosniff
//   - L-01: Downgrade attack → Strict-Transport-Security (HSTS)
//   - L-02: CSP connect-src tidak lagi izinkan http: di production
//   - M-03: CSP 'unsafe-inline' dipertahankan karena diperlukan Next.js

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // L-01 Fix: Tambah HSTS header agar browser hanya terhubung via HTTPS.
  // max-age=63072000 = 2 tahun. preload memungkinkan dimasukkan ke browser HSTS preload list.
  // CATATAN: Hanya aktif di production. Jangan aktifkan di dev karena akan break http://localhost.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  {
    // CSP hardening:
    // - M-03: 'unsafe-inline' dipertahankan karena Next.js membutuhkannya untuk inline scripts.
    //         Improvement: tambahkan 'strict-dynamic' untuk browser modern yang mendukungnya.
    // - L-02: Hapus `http:` dari connect-src di production. Dev tetap izinkan http://localhost.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://accounts.google.com/gsi/client${isDev ? " 'unsafe-eval'" : ""}`,
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' https: data: blob:",
      "media-src 'self' https:",
      // L-02 Fix: Hapus `http:` dari connect-src di production.
      // Production: hanya https: dan wss:. Development: tambah ws: dan http://localhost.
      isDev
        ? "connect-src 'self' https: ws: wss: http://localhost:* http://127.0.0.1:* https://accounts.google.com/gsi/"
        : "connect-src 'self' https: wss: https://accounts.google.com/gsi/",
      "frame-src 'self' https://accounts.google.com/gsi/ blob: data:",
      "frame-ancestors 'self'",
      "object-src 'self' blob: data:",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

// ─── H-03 Fix: Image Remote Patterns ─────────────────────────────────────────
// Sebelumnya: hostname: "**" + dangerouslyAllowLocalIP: true → SSRF via /_next/image
// Sekarang: allowlist hostname eksplisit dari env IMAGE_ALLOWED_HOSTS (comma-separated).
//
// Cara set di .env:
//   IMAGE_ALLOWED_HOSTS=s3-suaramoklet.open-preview.my.id,lh3.googleusercontent.com
//
// Jika IMAGE_ALLOWED_HOSTS tidak di-set, gunakan hostname dari PUBLIC_FILE_URL sebagai default.
function buildRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

  const envHosts = process.env.IMAGE_ALLOWED_HOSTS;
  if (envHosts) {
    for (const host of envHosts.split(",").map((h) => h.trim()).filter(Boolean)) {
      patterns.push({ protocol: "https", hostname: host });
    }
    return patterns;
  }

  // Fallback: ambil hostname dari PUBLIC_FILE_URL
  const publicFileUrl = process.env.PUBLIC_FILE_URL || process.env.NEXT_PUBLIC_PUBLIC_FILE_URL || "";
  if (publicFileUrl) {
    try {
      const { hostname } = new URL(publicFileUrl);
      patterns.push({ protocol: "https", hostname });
    } catch {
      // ignore
    }
  }

  // Jika masih kosong di development, izinkan semua untuk developer convenience
  if (patterns.length === 0 && isDev) {
    patterns.push({ protocol: "https", hostname: "**" });
    patterns.push({ protocol: "http", hostname: "localhost" });
    patterns.push({ protocol: "http", hostname: "127.0.0.1" });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  // M-01: Sembunyikan X-Powered-By header (fingerprinting prevention)
  poweredByHeader: false,

  turbopack: {
    // Pin the Turbopack root to this package so it doesn't pick up
    // the parent-level package-lock.json and emit a workspace warning.
    root: path.resolve(__dirname),
  },

  async headers() {
    return [
      {
        // Terapkan ke semua route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    // H-03 Fix: Hapus dangerouslyAllowLocalIP (was: true) → tidak ada akses ke internal host.
    // dangerouslyAllowLocalIP: false adalah default — cukup hapus baris ini.
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;
