import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route matching sets
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/complaints/create"];
const GUEST_ROUTES = ["/login", "/register"];

// Decode JWT token payload on edge side without node libraries
interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

function decodeJwt(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    // Decode base64url payload
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(payloadBase64);
    return JSON.parse(jsonPayload) as TokenPayload;
  } catch (error) {
    console.error("Failed to decode JWT in proxy:", error);
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const token = cookies.get("accessToken")?.value;
  const { pathname } = nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isGuest = GUEST_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated trying to access a protected route -> Redirect to /login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated trying to access login/register -> Redirect to /dashboard
  if (isGuest && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token) {
    const userPayload = decodeJwt(token);
    if (userPayload) {
      // Place additional role-based enforcement here if required
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/complaints/create",
    "/login",
    "/register",
  ],
};
