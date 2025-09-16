import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { action, points } = await request.json()

    const { db } = await connectToDatabase()

    // Get current user
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate points based on action
    let pointsToAdd = points || 0

    switch (action) {
      case "help_post_created":
        pointsToAdd = 5
        break
      case "help_post_completed":
        pointsToAdd = 10
        break
      case "event_created":
        pointsToAdd = 15
        break
      case "event_attended":
        pointsToAdd = 3
        break
      case "forum_post_created":
        pointsToAdd = 2
        break
      case "comment_added":
        pointsToAdd = 1
        break
      case "like_received":
        pointsToAdd = 1
        break
      default:
        pointsToAdd = points || 0
    }

    const newScore = (user.communityScore || 0) + pointsToAdd

    // Update user score
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          communityScore: newScore,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      newScore,
      pointsAdded: pointsToAdd,
      action,
    })
  } catch (error) {
    console.error("Update score error:", error)
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 })
  }
}
