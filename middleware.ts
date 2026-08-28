import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (pathname.startsWith("/onboarding")) {
    if (!user) {
      const login = new URL("/login", req.nextUrl);
      login.searchParams.set("callbackUrl", "/onboarding");
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (user) {
      return NextResponse.redirect(new URL(homeForRole(user.role), req.nextUrl));
    }
    return NextResponse.next();
  }

  const gated =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/user");

  if (!gated) return NextResponse.next();

  if (!user) {
    const login = new URL("/login", req.nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(user.role), req.nextUrl));
  }
  if (pathname.startsWith("/manager") && user.role !== "manager" && user.role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(user.role), req.nextUrl));
  }
  if (pathname.startsWith("/user") && user.role !== "user" && user.role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(user.role), req.nextUrl));
  }

  return NextResponse.next();
});

function homeForRole(role?: string) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "manager") return "/manager/dashboard";
  return "/user/dashboard";
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/user/:path*", "/login", "/register", "/onboarding"],
};
