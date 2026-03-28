import { NextResponse } from "next/server";

import { auth } from "@/auth";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/registro")) return true;
  if (pathname.startsWith("/auth/error")) return true;
  if (pathname.startsWith("/compartir")) return true;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (req.auth && (pathname.startsWith("/login") || pathname.startsWith("/registro"))) {
    return NextResponse.redirect(new URL("/cocinar", req.nextUrl.origin));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (req.auth) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
