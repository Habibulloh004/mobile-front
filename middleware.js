import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 1. Agar foydalanuvchi /sign-in yoki /admin-login da bo'lsa va token bo'lsa => /dashboard ga yo'naltir
  if ((pathname === "/sign-in" || pathname === "/admin-login") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Agar foydalanuvchi `/` yoki `/dashboard`dagi sahifalarga kirsa, lekin token bo'lmasa => /sign-in ga yo'naltir
  const isDashboardPath = pathname === "/" || pathname.startsWith("/dashboard");

  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (pathname == "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Static files va APIlar uchun ruxsat
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  // 4. Agar yuqoridagilardan birortasi bo'lmasa => davomi
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * faqat kerakli route'larda middleware ishga tushadi
     * bu yerda static fayllar, API va uploads chetlab o'tiladi
     */
    "/((?!_next|api|favicon.ico|uploads).*)",
  ],
};
