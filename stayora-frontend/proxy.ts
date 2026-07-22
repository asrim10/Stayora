import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookie";

const publicRoutes = [
  "/login",
  "/register",
  "/forget-password",
  "/reset-password",
  "/mfa",
];
const adminRoutes = ["/admin"];
const userRoutes = ["/user"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getAuthToken();
  const user = token ? await getUserData() : null;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && user) {
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (isUserRoute && user.role !== "user" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isPublicRoute && token) {
    // Redirect authenticated users to their dashboard
    // Pass ?from=oauth if the redirect originated from the OAuth callback
    const fromOAuth = pathname === "/login" && request.nextUrl.searchParams.has("oauth");

    if (user?.role === "admin") {
      const url = new URL("/admin", request.url);
      if (fromOAuth) url.searchParams.set("from", "oauth");
      return NextResponse.redirect(url);
    }
    if (user?.role === "user") {
      const url = new URL("/user/dashboard", request.url);
      if (fromOAuth) url.searchParams.set("from", "oauth");
      return NextResponse.redirect(url);
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    // what routes to protect/match
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
  ],
};
