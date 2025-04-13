import { NextResponse } from "next/server";

export function middleware(request) {
  // Get the path
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/sign-in" || path === "/admin-login";

  // For handling static assets and API routes
  if (
    path.includes("_next") ||
    path.includes("/api/") ||
    path.includes("favicon.ico") ||
    path.includes("/uploads/")
  ) {
    return NextResponse.next();
  }

  // Note: In middleware, we can't access localStorage directly
  // The client-side components will handle redirects based on auth state
  // This approach works for SSR, but client-side JS will handle auth checks too

  // For public paths, let Next.js handle routing
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected paths, we'll redirect to login when the client detects no auth
  // But the middleware will also continue to allow the initial load
  return NextResponse.next();
}

// Define paths that will trigger the middleware
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|uploads).*)"],
};
