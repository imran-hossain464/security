import { NextResponse } from "next/server"
import { generateMathCaptcha } from "@/lib/security"
export const runtime = "nodejs"

export async function GET() {
  try {
    const captcha = generateMathCaptcha()

    const response = NextResponse.json({
      question: captcha.question,
      token: captcha.token,
    })

    // Store answer in secure cookie for verification
    /*response.cookies.set("captcha-answer", captcha.answer.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60, // 5 minutes
    })*/
   response.cookies.set("captcha-answer", captcha.answer.toString(), {
  httpOnly: true,
  secure: true, // Always true in production, Vercel uses HTTPS
  sameSite: "lax", // More compatible than "strict"
  path: "/",       // Explicitly set cookie path
  maxAge: 5 * 60,
})


    return response
  } catch (error) {
    console.error("CAPTCHA generation error:", error)
    return NextResponse.json({ error: "Failed to generate CAPTCHA" }, { status: 500 })
  }
}
