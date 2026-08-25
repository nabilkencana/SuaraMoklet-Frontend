// ─── Next.js Route Handler — Token Refresh Proxy ──────────────────────────────
//
// FASE 3 (Silent Refresh Proxy):
// Route handler ini bertindak sebagai proxy server-side untuk endpoint refresh backend.
//
// Alasan server-side proxy:
// 1. Browser mengirim HttpOnly cookie (refreshToken) ke domain frontend.
// 2. Route handler membaca cookie ini di server-side (`request.headers.get("cookie")`)
//    dan meneruskannya ke backend API.
// 3. Header `Set-Cookie` dari backend (berisi accessToken baru) diteruskan kembali
//    ke browser.
//
// DORMANT saat ini: Hanya aktif saat backend sudah mengimplementasikan
// endpoint POST /auth/refresh dengan Set-Cookie.

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const refreshUrl = `${backendBaseUrl.replace(/\/+$/, "")}/auth/refresh`;

  const cookieHeader = request.headers.get("cookie") || "";

  try {
    const backendRes = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    const data = await backendRes.json().catch(() => ({}));
    const response = NextResponse.json(data, {
      status: backendRes.status,
    });

    // Teruskan Set-Cookie header dari backend ke browser
    const setCookieHeaders = backendRes.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookieStr) => {
        response.headers.append("Set-Cookie", cookieStr);
      });
    } else {
      const rawSetCookie = backendRes.headers.get("set-cookie");
      if (rawSetCookie) {
        response.headers.set("Set-Cookie", rawSetCookie);
      }
    }

    return response;
  } catch (error) {
    console.error("[RouteHandler /api/auth/refresh] Proxy error:", error);
    return NextResponse.json(
      { message: "Refresh token service unavailable" },
      { status: 503 }
    );
  }
}
