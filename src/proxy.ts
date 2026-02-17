import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/checkout"];

// Routes that should redirect authenticated users
const authRoutes = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth session cookie (Better Auth uses this pattern)
  const sessionCookie = request.cookies.get("nike.session_token");
  const isAuthenticated = !!sessionCookie?.value;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect checkout route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/sign-in", "/sign-up"],
};
