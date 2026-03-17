import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Multi-tenant check could go here if organizationId is in URL, 
  // but for now we just ensure they are logged in.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication APIs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
