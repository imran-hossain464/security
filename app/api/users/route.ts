import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, collections } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection(collections.users).findOne({ email: userData.email })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      ...userData,
      _id: userData.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.users).insertOne(newUser)

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        user: { ...newUser, id: newUser._id },
        message: "User created successfully",
      })
    }

    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const users = await db.collection(collections.users).find({}).toArray()

    const formattedUsers = users.map((user) => ({
      ...user,
      id: user._id.toString(),
      joinDate: user.createdAt,
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
