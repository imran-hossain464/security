import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sanitizeInput, logSecurityEvent, getClientIP } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const body = await request.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedToken = sanitizeInput(token)

    const { db } = await connectToDatabase()

    // Find user with matching email and verification token
    const user = await db.collection("users").findOne({
      email: sanitizedEmail,
      emailVerificationToken: sanitizedToken,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      logSecurityEvent(
        "EMAIL_VERIFICATION_FAILED",
        {
          email: sanitizedEmail,
          reason: "invalid_token",
          ip: clientIP,
        },
        request,
      )
      return NextResponse.json(
        {
          error: "Invalid or expired verification token",
        },
        { status: 400 },
      )
    }

    // Update user as verified
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1,
        },
      },
    )

    logSecurityEvent(
      "EMAIL_VERIFIED",
      {
        userId: user._id.toString(),
        email: sanitizedEmail,
        ip: clientIP,
      },
      request,
    )

    return NextResponse.json({
      message: "Email verified successfully! You can now log in.",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    logSecurityEvent("EMAIL_VERIFICATION_ERROR", { error: error.message }, request)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
