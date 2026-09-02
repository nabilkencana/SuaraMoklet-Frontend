import { NextRequest, NextResponse } from "next/server";

/**
 * C-02 Fix: SSRF via PDF Proxy
 *
 * Sebelumnya: fetch(fileUrl) tanpa validasi apapun → attacker bisa probe internal network.
 * Sekarang: hanya izinkan URL dari hostname yang terdaftar di ALLOWED_PDF_HOSTS (env-driven).
 *
 * Proteksi berlapis:
 * 1. Skema HARUS https:// (bukan http://, file://, ftp://, dsb.)
 * 2. Hostname HARUS match salah satu dari ALLOWED_PDF_HOSTS
 * 3. Block private/loopback ranges secara eksplisit sebagai defense-in-depth
 */

// Baca allowlist dari env. Default: hostname PUBLIC_FILE_URL (S3 bucket kita).
// Format: comma-separated hostnames, tanpa protokol.
// Contoh: ALLOWED_PDF_HOSTS=s3-suaramoklet.open-preview.my.id,assets.suaramoklet.sch.id
function getAllowedHosts(): string[] {
  const envHosts = process.env.ALLOWED_PDF_HOSTS;
  if (envHosts) {
    return envHosts.split(",").map((h) => h.trim()).filter(Boolean);
  }
  // Fallback: ekstrak hostname dari PUBLIC_FILE_URL
  try {
    const publicFileUrl = process.env.PUBLIC_FILE_URL || "";
    if (publicFileUrl) {
      return [new URL(publicFileUrl).hostname];
    }
  } catch {
    // ignore parse error
  }
  return [];
}

// Regex untuk mendeteksi IP private/loopback/link-local
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./, // Link-local / cloud metadata
  /^::1$/,       // IPv6 loopback
  /^\[::1\]$/,
  /^fd[0-9a-f]{2}:/i, // IPv6 private
];

function isPrivateHost(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((re) => re.test(hostname));
}

function isUrlSafe(rawUrl: string): { safe: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "URL tidak valid" };
  }

  if (parsed.protocol !== "https:") {
    return { safe: false, reason: "Hanya protokol https:// yang diizinkan" };
  }

  if (isPrivateHost(parsed.hostname)) {
    return { safe: false, reason: "Akses ke host internal tidak diizinkan" };
  }

  const allowedHosts = getAllowedHosts();
  if (allowedHosts.length === 0) {
    // Jika env tidak dikonfigurasi, tolak semua untuk gagal dengan aman
    return { safe: false, reason: "PDF proxy belum dikonfigurasi (ALLOWED_PDF_HOSTS tidak di-set)" };
  }

  if (!allowedHosts.includes(parsed.hostname)) {
    return {
      safe: false,
      reason: `Host '${parsed.hostname}' tidak ada dalam daftar yang diizinkan`,
    };
  }

  return { safe: true };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // C-02 Fix: Validasi URL sebelum fetch
  const { safe, reason } = isUrlSafe(fileUrl);
  if (!safe) {
    return new NextResponse(`Invalid url: ${reason}`, { status: 400 });
  }

  try {
    const response = await fetch(fileUrl, {
      // Jangan ikuti redirect ke domain lain (SSRF via open redirect)
      redirect: "error",
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "application/pdf";

    // Pastikan content-type yang dikembalikan adalah document, bukan HTML (bisa XSS)
    const safeContentType = contentType.includes("pdf")
      ? "application/pdf"
      : contentType.startsWith("image/")
        ? contentType
        : "application/octet-stream";

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": safeContentType,
        "Content-Disposition": 'inline; filename="document.pdf"',
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        // Cegah browser dari sniffing content-type
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load document";
    // Jangan expose pesan error internal ke client
    return new NextResponse("Failed to load document", { status: 502 });
  }
}
