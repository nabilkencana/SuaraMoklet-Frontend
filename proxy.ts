import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Role type ────────────────────────────────────────────────────────────────

type UserRole = "SUPERADMIN" | "SUPER_PIC" | "UNIT_PIC" | "UNIT_MEMBER" | "USER";

// ─── Route access map ─────────────────────────────────────────────────────────

const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/dashboard":          ["SUPERADMIN", "SUPER_PIC", "UNIT_PIC", "UNIT_MEMBER"],
  "/unit":               ["SUPERADMIN", "UNIT_PIC", "UNIT_MEMBER"],
  "/iso":                ["SUPER_PIC"],
  "/admin":              ["SUPERADMIN"],
  "/complaints/create":  ["USER", "SUPERADMIN"],
  "/complaints":         ["USER", "SUPERADMIN", "SUPER_PIC", "UNIT_PIC", "UNIT_MEMBER"],
  "/profile":            ["USER", "SUPERADMIN", "SUPER_PIC", "UNIT_PIC", "UNIT_MEMBER"],
  "/search":             ["USER", "SUPERADMIN", "SUPER_PIC", "UNIT_PIC", "UNIT_MEMBER"],
};

const GUEST_ONLY = ["/login", "/register"];

const ROLE_DEFAULT_REDIRECT: Record<UserRole, string> = {
  SUPERADMIN:   "/dashboard",
  SUPER_PIC:    "/dashboard",
  UNIT_PIC:     "/dashboard",
  UNIT_MEMBER:  "/dashboard",
  USER:         "/complaints",
};

// ─── JWT decode (edge-compatible) ─────────────────────────────────────────────

interface JwtPayload {
  id: string;
  role: UserRole;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}

// ─── Proxy (Next.js Edge Proxy Handler) ───────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isGuestOnly = GUEST_ONLY.some((r) => pathname.startsWith(r));

  // 1. Guest-only pages: redirect authenticated users to their default page
  if (isGuestOnly) {
    if (!token) return NextResponse.next();
    const payload = decodeJwt(token);
    if (!payload || isTokenExpired(payload)) return NextResponse.next();
    return NextResponse.redirect(
      new URL(ROLE_DEFAULT_REDIRECT[payload.role] ?? "/", request.url)
    );
  }

  // 2. Find matching protected route
  const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
    pathname.startsWith(route)
  );
  if (!matchedRoute) return NextResponse.next(); // public page

  // 3. No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Invalid / expired token → clear cookie and redirect to login
  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    return response;
  }

  // 5. Role not allowed for this route → redirect to their default page
  const allowedRoles = ROLE_ROUTES[matchedRoute];
  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.redirect(
      new URL(ROLE_DEFAULT_REDIRECT[payload.role] ?? "/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/unit/:path*",
    "/iso/:path*",
    "/admin/:path*",
    "/complaints/:path*",
    "/profile/:path*",
    "/search/:path*",
    "/login",
    "/register",
  ],
};
