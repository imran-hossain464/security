import crypto from "crypto"
import type { NextRequest } from "next/server"

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return ""

  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
    .slice(0, 1000) // Limit length
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Password strength validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) errors.push("Password must be at least 8 characters long")
  if (password.length > 128) errors.push("Password must be less than 128 characters")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter")
  if (!/\d/.test(password)) errors.push("Password must contain at least one number")
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Password must contain at least one special character")

  return { isValid: errors.length === 0, errors }
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Generate math CAPTCHA
export function generateMathCaptcha(): { question: string; answer: number; token: string } {
  const num1 = Math.floor(Math.random() * 20) + 1
  const num2 = Math.floor(Math.random() * 20) + 1
  const operations = ["+", "-", "*"]
  const operation = operations[Math.floor(Math.random() * operations.length)]

  let answer: number
  let question: string

  switch (operation) {
    case "+":
      answer = num1 + num2
      question = `${num1} + ${num2}`
      break
    case "-":
      answer = Math.max(num1, num2) - Math.min(num1, num2)
      question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`
      break
    case "*":
      const smallNum1 = Math.floor(Math.random() * 10) + 1
      const smallNum2 = Math.floor(Math.random() * 10) + 1
      answer = smallNum1 * smallNum2
      question = `${smallNum1} × ${smallNum2}`
      break
    default:
      answer = num1 + num2
      question = `${num1} + ${num2}`
  }

  // Create encrypted token with answer
  const token = crypto.createHash("sha256").update(`${answer}-${Date.now()}-${process.env.JWT_SECRET}`).digest("hex")

  return { question, answer, token }
}

// Verify CAPTCHA
export function verifyCaptcha(userAnswer: number, token: string, originalAnswer: number): boolean {
  // In a real implementation, you'd decrypt the token to get the original answer
  // For now, we'll use a simple comparison
  return userAnswer === originalAnswer
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting
export function rateLimit(identifier: string, maxRequests = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// Get client IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.ip || "unknown"
}

// Secure error messages (don't leak sensitive info)
export function sanitizeError(error: any): string {
  if (typeof error === "string") {
    return error.includes("password") || error.includes("token") || error.includes("secret")
      ? "Authentication failed"
      : error
  }

  if (error?.message) {
    return error.message.includes("password") || error.message.includes("token") || error.message.includes("secret")
      ? "Authentication failed"
      : error.message
  }

  return "An error occurred"
}

// File upload validation
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 5MB" }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "File type not allowed. Only JPEG, PNG, GIF, and WebP are supported." }
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: "File extension not allowed" }
  }

  return { isValid: true }
}

// Security logging
export function logSecurityEvent(event: string, details: any, request?: NextRequest) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request ? getClientIP(request) : "unknown",
    userAgent: request?.headers.get("user-agent") || "unknown",
  }

  console.log("🔒 SECURITY EVENT:", JSON.stringify(logEntry))

  // In production, send to monitoring service
  // await sendToMonitoringService(logEntry)
}
