import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Fetching forum posts from database...")

    const { db } = await connectToDatabase()

    const forumPosts = await db.collection("forumPosts").find({}).sort({ createdAt: -1 }).toArray()

    // Get user details for each post
    const postsWithUserDetails = await Promise.all(
      forumPosts.map(async (post) => {
        const user = await db.collection("users").findOne({
          _id: new ObjectId(post.authorId),
        })

        return {
          ...post,
          id: post._id.toString(),
          author: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
          avatar: user?.avatar || null,
          authorLevel: user?.communityScore >= 100 ? "Expert" : user?.communityScore >= 50 ? "Helper" : "Member",
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        }
      }),
    )

    console.log("✅ Fetched forum posts from database:", postsWithUserDetails.length, "posts")
    return NextResponse.json(postsWithUserDetails)
  } catch (error) {
    console.error("❌ Error fetching forum posts:", error)
    return NextResponse.json({ error: "Failed to fetch forum posts" }, { status: 500 })
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

    console.log("🔄 Creating new forum post:", body)

    if (!body.title || !body.content || !body.category) {
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

    const newForumPost = {
      title: body.title,
      content: body.content,
      category: body.category,
      authorId: decoded.userId,
      likes: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("forumPosts").insertOne(newForumPost)

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create forum post" }, { status: 500 })
    }

    // Update user's community score
    const newScore = (user.communityScore || 0) + 2
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { communityScore: newScore } })

    const createdPost = {
      ...newForumPost,
      id: result.insertedId.toString(),
      author: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      authorLevel: user.communityScore >= 100 ? "Expert" : user.communityScore >= 50 ? "Helper" : "Member",
    }

    console.log("✅ Created forum post in database:", createdPost)
    return NextResponse.json(createdPost)
  } catch (error) {
    console.error("❌ Error creating forum post:", error)
    return NextResponse.json({ error: "Failed to create forum post" }, { status: 500 })
  }
}
