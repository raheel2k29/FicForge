import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "ficforge_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || "ficforge-production-fallback-secret-key-32-chars";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static assets, internal Next.js chunks, and auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Extract and verify session token from HTTP-only cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let sessionPayload: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey(), {
        algorithms: ["HS256"],
      });
      sessionPayload = payload;
    } catch {
      // Invalid, expired, or tampered token
      sessionPayload = null;
    }
  }

  // 3. Admin Route Protection (/admin/* except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!sessionPayload) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = sessionPayload.role;
    const isStaff = role === "SUPER_ADMIN" || role === "ADMIN" || role === "MODERATOR";

    if (!isStaff) {
      // Authenticated but non-staff: Redirect to homepage with alert or 403
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(homeUrl);
    }
  }

  // 4. Creator Studio Protection (/write/* and /my-stories/*)
  const isCreatorRoute =
    pathname.startsWith("/write") || pathname.startsWith("/my-stories");

  if (isCreatorRoute) {
    if (!sessionPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Append verified user headers for downstream server components and API routes
  const response = NextResponse.next();
  if (sessionPayload) {
    response.headers.set("x-user-id", String(sessionPayload.id || ""));
    response.headers.set("x-user-role", String(sessionPayload.role || ""));
    response.headers.set("x-user-username", String(sessionPayload.username || ""));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/write/:path*",
    "/my-stories/:path*",
  ],
};
