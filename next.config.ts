import type { NextConfig } from "next";
import path from "path";

// ─── Security Headers ─────────────────────────────────────────────────────────
// F1 fix: Hapus X-Powered-By fingerprint & tambah header hardening.
// Skenario serangan ditutup:
//   - LO-4: X-Powered-By memungkinkan attacker fingerprint stack (Next.js/Express)
//     dan memilih exploit yang sesuai tanpa effort.
//   - clickjacking via X-Frame-Options: SAMEORIGIN
//   - MIME sniffing via X-Content-Type-Options: nosniff
//   - Information leakage via Referrer-Policy
//   - CSP blok koneksi ke origin tidak sah (defense-in-depth untuk LO-5 XSS stored)

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
  {
    // CSP: blok eval (walaupun Next.js butuh unsafe-inline untuk hydration),
    // batasi koneksi hanya ke origin yang dikenal.
    // CATATAN: 'unsafe-inline' di script-src diperlukan Next.js inline scripts.
    // Upgrade ke nonce-based CSP saat Next.js 14+ strict mode diaktifkan.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' https: data: blob:",
      "media-src 'self' https:",
      "connect-src 'self' https://api-suara.alfareza.site https://s3-suara.alfareza.site",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // F1: Sembunyikan X-Powered-By header (fingerprinting prevention — LO-4)
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
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
