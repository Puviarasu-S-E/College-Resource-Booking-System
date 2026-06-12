import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = verifyToken(req.cookies.get("token")?.value ?? "");

  const isPublic = pathname === "/login" || pathname === "/register";
  const isAdmin = pathname.startsWith("/admin");
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/resources") || pathname.startsWith("/bookings") || isAdmin;

  if (isPublic && user) return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/dashboard", req.url));
  if (isProtected && !user) return NextResponse.redirect(new URL("/login", req.url));
  if (isAdmin && user?.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/resources/:path*", "/bookings/:path*", "/admin/:path*", "/login", "/register"],
};
