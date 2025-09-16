import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import {
  sanitizeInput,
  isValidEmail,
  validatePassword,
  rateLimit,
  getClientIP,
  logSecurityEvent,
  generateCSRFToken,
} from "@/lib/security"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // Rate limiting
    if (!rateLimit(`register-${clientIP}`, 3, 15 * 60 * 1000)) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { action: "register", ip: clientIP }, request)
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { firstName, lastName, email, password, captchaAnswer, captchaToken } = body

    // Input validation and sanitization
    if (!firstName || !lastName || !email || !password || captchaAnswer === undefined) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const sanitizedFirstName = sanitizeInput(firstName)
    const sanitizedLastName = sanitizeInput(lastName)
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Email validation
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 })
    }

    // CAPTCHA verification
    const captchaAnswerFromCookie = request.cookies.get("captcha-answer")?.value
    if (!captchaAnswerFromCookie || Number.parseInt(captchaAnswerFromCookie) !== Number.parseInt(captchaAnswer)) {
      logSecurityEvent("CAPTCHA_FAILED", { email: sanitizedEmail, ip: clientIP }, request)
      return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: sanitizedEmail })

    if (existingUser) {
      logSecurityEvent("DUPLICATE_REGISTRATION", { email: sanitizedEmail, ip: clientIP }, request)
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Hash password with high cost
    const hashedPassword = await bcrypt.hash(password, 14)

    // Generate verification token
    const verificationToken = generateVerificationToken(sanitizedEmail)

    // Create user
    const newUser = {
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
      password: hashedPassword,
      avatar: null,
      bio: "",
      location: "",
      phone: "",
      communityScore: 0,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      loginAttempts: 0,
      lockUntil: null,
      preferences: {
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
    }

    const result = await db.collection("users").insertOne(newUser)

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(sanitizedEmail, verificationToken)

    if (!emailSent) {
      console.warn("Failed to send verification email to:", sanitizedEmail)
    }

    // Generate CSRF token
    const csrfToken = generateCSRFToken()

    // Create response (don't auto-login until email is verified)
    const response = NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      emailSent,
      userId: result.insertedId.toString(),
    })

    // Set CSRF token cookie
    response.cookies.set("csrf-token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    // Clear CAPTCHA cookie
    response.cookies.delete("captcha-answer")

    logSecurityEvent(
      "USER_REGISTERED",
      {
        userId: result.insertedId.toString(),
        email: sanitizedEmail,
        ip: clientIP,
      },
      request,
    )

    return response
  } catch (error) {
    console.error("Registration error:", error)
    logSecurityEvent("REGISTRATION_ERROR", { error: error.message }, request)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
