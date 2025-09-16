import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Fetching help posts from database...")

    const { db } = await connectToDatabase()

    const helpPosts = await db.collection("helpPosts").find({}).sort({ createdAt: -1 }).toArray()

    // Get user details for each post
    const postsWithUserDetails = await Promise.all(
      helpPosts.map(async (post) => {
        const user = await db.collection("users").findOne({
          _id: new ObjectId(post.authorId),
        })

        return {
          ...post,
          id: post._id.toString(),
          author: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
          avatar: user?.avatar || null,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        }
      }),
    )

    console.log("✅ Fetched help posts from database:", postsWithUserDetails.length, "posts")
    return NextResponse.json(postsWithUserDetails)
  } catch (error) {
    console.error("❌ Error fetching help posts:", error)
    return NextResponse.json({ error: "Failed to fetch help posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const body = await request.json()

    console.log("🔄 Creating new help post:", body)

    if (!body.title || !body.description || !body.category || !body.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user details
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newHelpPost = {
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      urgency: body.urgency || "medium",
      timeframe: body.timeframe,
      authorId: decoded.userId,
      status: "active",
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("helpPosts").insertOne(newHelpPost)

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create help post" }, { status: 500 })
    }

    // Update user's community score
    const newScore = (user.communityScore || 0) + 5
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { communityScore: newScore } })

    const createdPost = {
      ...newHelpPost,
      id: result.insertedId.toString(),
      author: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
    }

    console.log("✅ Created help post in database:", createdPost)
    return NextResponse.json(createdPost)
  } catch (error) {
    console.error("❌ Error creating help post:", error)
    return NextResponse.json({ error: "Failed to create help post" }, { status: 500 })
  }
}
