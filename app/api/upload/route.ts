import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { validateFileUpload, sanitizeInput, logSecurityEvent, getClientIP, rateLimit } from "@/lib/security"
import crypto from "crypto"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // Rate limiting for file uploads
    if (!rateLimit(`upload-${clientIP}`, 10, 60 * 1000)) {
      // 10 uploads per minute
      logSecurityEvent("UPLOAD_RATE_LIMIT_EXCEEDED", { ip: clientIP }, request)
      return NextResponse.json({ error: "Too many upload attempts. Please try again later." }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const validation = validateFileUpload(file)
    if (!validation.isValid) {
      logSecurityEvent(
        "INVALID_FILE_UPLOAD",
        {
          filename: file.name,
          size: file.size,
          type: file.type,
          error: validation.error,
          ip: clientIP,
        },
        request,
      )
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate secure filename
    const fileExtension = file.name.substring(file.name.lastIndexOf("."))
    const secureFilename = `${crypto.randomUUID()}${fileExtension}`
    const sanitizedFilename = sanitizeInput(secureFilename)

    // Ensure upload directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Additional security: Check file header (magic bytes)
    const fileHeader = buffer.toString("hex", 0, 4)
    const validHeaders = {
      ffd8ffe0: "jpg",
      ffd8ffe1: "jpg",
      ffd8ffe2: "jpg",
      ffd8ffe3: "jpg",
      ffd8ffe8: "jpg",
      "89504e47": "png",
      "47494638": "gif",
      "52494646": "webp",
    }

    const detectedType = validHeaders[fileHeader.toLowerCase()]
    if (!detectedType) {
      logSecurityEvent(
        "INVALID_FILE_HEADER",
        {
          filename: file.name,
          header: fileHeader,
          ip: clientIP,
        },
        request,
      )
      return NextResponse.json({ error: "Invalid file format detected" }, { status: 400 })
    }

    // Write file to disk
    const filePath = join(UPLOAD_DIR, sanitizedFilename)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${sanitizedFilename}`

    logSecurityEvent(
      "FILE_UPLOADED",
      {
        filename: sanitizedFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        ip: clientIP,
      },
      request,
    )

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: sanitizedFilename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    logSecurityEvent("UPLOAD_ERROR", { error: error.message }, request)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
