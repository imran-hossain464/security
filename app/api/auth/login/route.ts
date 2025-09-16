import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import {
  sanitizeInput,
  isValidEmail,
  rateLimit,
  getClientIP,
  logSecurityEvent,
  generateCSRFToken,
} from "@/lib/security"

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // Rate limiting
    if (!rateLimit(`login-${clientIP}`, 5, 15 * 60 * 1000)) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { action: "login", ip: clientIP }, request)
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, captchaAnswer } = body

    if (!email || !password || captchaAnswer === undefined) {
      return NextResponse.json({ error: "Email, password, and CAPTCHA are required" }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // CAPTCHA verification
    const captchaAnswerFromCookie = request.cookies.get("captcha-answer")?.value
    if (!captchaAnswerFromCookie || Number.parseInt(captchaAnswerFromCookie) !== Number.parseInt(captchaAnswer)) {
      logSecurityEvent("LOGIN_CAPTCHA_FAILED", { email: sanitizedEmail, ip: clientIP }, request)
      return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find user by email
    const user = await db.collection("users").findOne({ email: sanitizedEmail })

    if (!user) {
      logSecurityEvent("LOGIN_FAILED", { email: sanitizedEmail, reason: "user_not_found", ip: clientIP }, request)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      logSecurityEvent("LOGIN_BLOCKED", { email: sanitizedEmail, reason: "account_locked", ip: clientIP }, request)
      return NextResponse.json(
        {
          error: "Account temporarily locked due to too many failed attempts. Please try again later.",
        },
        { status: 423 },
      )
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      logSecurityEvent("LOGIN_FAILED", { email: sanitizedEmail, reason: "email_not_verified", ip: clientIP }, request)
      return NextResponse.json(
        {
          error: "Please verify your email address before logging in.",
        },
        { status: 401 },
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      // Increment login attempts
      const loginAttempts = (user.loginAttempts || 0) + 1
      const updateData: any = {
        loginAttempts,
        updatedAt: new Date(),
      }

      // Lock account if too many attempts
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + LOCK_TIME)
        logSecurityEvent(
          "ACCOUNT_LOCKED",
          {
            email: sanitizedEmail,
            attempts: loginAttempts,
            ip: clientIP,
          },
          request,
        )
      }

      await db.collection("users").updateOne({ _id: user._id }, { $set: updateData })

      logSecurityEvent(
        "LOGIN_FAILED",
        {
          email: sanitizedEmail,
          reason: "invalid_password",
          attempts: loginAttempts,
          ip: clientIP,
        },
        request,
      )

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Reset login attempts on successful login
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          loginAttempts: 1,
          lockUntil: 1,
        },
      },
    )

    // Create JWT token with shorter expiry
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "2h" }, // Shorter session for security
    )

    // Generate CSRF token
    const csrfToken = generateCSRFToken()

    // Create response
    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        communityScore: user.communityScore || 0,
        joinedAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences || {
          notifications: {
            email: true,
            push: true,
            helpRequests: true,
            events: true,
            messages: true,
          },
          privacy: {
            showEmail: false,
            showPhone: false,
            showLocation: true,
          },
        },
      },
    })

    // Set secure HTTP-only cookies
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60, // 2 hours
      path: "/",
    })

    response.cookies.set("csrf-token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60, // 2 hours
      path: "/",
    })

    // Clear CAPTCHA cookie
    response.cookies.delete("captcha-answer")

    logSecurityEvent(
      "LOGIN_SUCCESS",
      {
        userId: user._id.toString(),
        email: sanitizedEmail,
        ip: clientIP,
      },
      request,
    )

    return response
  } catch (error) {
    console.error("Login error:", error)
    logSecurityEvent("LOGIN_ERROR", { error: error.message }, request)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
