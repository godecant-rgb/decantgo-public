import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isSociosRoute = pathname.startsWith("/socios");
  const isLoginRoute = pathname === "/socios/login";

  if (!isSociosRoute) return NextResponse.next();

  const authCookie = req.cookies.get("socios_auth")?.value;

  if (isLoginRoute) {
    if (authCookie === "ok") {
      return NextResponse.redirect(new URL("/socios", req.url));
    }
    return NextResponse.next();
  }

  if (authCookie !== "ok") {
    return NextResponse.redirect(new URL("/socios/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/socios/:path*"],
};
