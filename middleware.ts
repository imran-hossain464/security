import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Security headers configuration
const securityHeaders = {
  // HTTPS Only
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; "),

  // XSS Protection
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Additional Security
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
}

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/api/users",
  "/api/help-posts",
  "/api/events",
  "/api/conversations",
  "/api/messages",
  "/api/forum-posts",
]

// Public API routes that don't require auth
const publicApiRoutes = ["/api/auth/login", "/api/auth/register", "/api/auth/verify-email", "/api/captcha"]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // HTTPS Redirect (in production)
  if (process.env.NODE_ENV === "production" && request.headers.get("x-forwarded-proto") !== "https") {
    return NextResponse.redirect(`https://${request.headers.get("host")}${request.nextUrl.pathname}`, 301)
  }

  const pathname = request.nextUrl.pathname

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !isPublicApiRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
      await jwtVerify(token, secret)
    } catch (error) {
      // Token is invalid or expired
      const response = pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Token expired" }, { status: 401 })
        : NextResponse.redirect(new URL("/login", request.url))

      // Clear invalid token
      response.cookies.delete("auth-token")
      return response
    }
  }

  // Skip CSRF check for authenticated API routes (since we have JWT)
  // Only enforce CSRF for public routes that change state
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const isAuthenticatedApiRoute = isProtectedRoute && pathname.startsWith("/api/")

    if (!isAuthenticatedApiRoute && !isPublicApiRoute && pathname.startsWith("/api/")) {
      const csrfToken = request.headers.get("x-csrf-token")
      const sessionCsrf = request.cookies.get("csrf-token")?.value

      if (csrfToken !== sessionCsrf) {
        return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 })
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
