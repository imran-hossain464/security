import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    const post = await db.collection("forumPosts").findOne({
      _id: new ObjectId(params.id),
    })

    if (!post) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    // Get user details
    const user = await db.collection("users").findOne({
      _id: new ObjectId(post.authorId),
    })

    return NextResponse.json({
      ...post,
      id: post._id.toString(),
      author: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
      avatar: user?.avatar || null,
      authorLevel: user?.communityScore ? getCommunityLevelName(user.communityScore) : "Newcomer",
    })
  } catch (error) {
    console.error("Fetch forum post error:", error)
    return NextResponse.json({ error: "Failed to fetch forum post" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const updates = await request.json()

    const { db } = await connectToDatabase()

    // Check if user owns the post or handle special actions
    const post = await db.collection("forumPosts").findOne({
      _id: new ObjectId(params.id),
    })

    if (!post) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    // Handle like/unlike
    if (updates.action === "like") {
      const likes = post.likes || []
      const userLiked = likes.includes(decoded.userId)

      const updatedLikes = userLiked ? likes.filter((id: string) => id !== decoded.userId) : [...likes, decoded.userId]

      await db.collection("forumPosts").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            likes: updatedLikes,
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({
        likes: updatedLikes,
        liked: !userLiked,
      })
    }

    // Handle reply
    if (updates.action === "reply") {
      const user = await db.collection("users").findOne({
        _id: new ObjectId(decoded.userId),
      })

      const newReply = {
        id: new ObjectId().toString(),
        content: updates.content,
        authorId: decoded.userId,
        author: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        avatar: user?.avatar || null,
        createdAt: new Date(),
        likes: [],
      }

      await db.collection("forumPosts").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $push: { replies: newReply },
          $set: { updatedAt: new Date() },
        },
      )

      // Update user's community score for commenting
      const newScore = (user?.communityScore || 0) + 1
      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { communityScore: newScore } })

      return NextResponse.json(newReply)
    }

    // Handle reply like
    if (updates.action === "likeReply") {
      const replyId = updates.replyId
      const replies = post.replies || []

      const updatedReplies = replies.map((reply: any) => {
        if (reply.id === replyId) {
          const likes = reply.likes || []
          const userLiked = likes.includes(decoded.userId)
          return {
            ...reply,
            likes: userLiked ? likes.filter((id: string) => id !== decoded.userId) : [...likes, decoded.userId],
          }
        }
        return reply
      })

      await db.collection("forumPosts").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            replies: updatedReplies,
            updatedAt: new Date(),
          },
        },
      )

      const updatedReply = updatedReplies.find((reply: any) => reply.id === replyId)
      return NextResponse.json({
        replyId,
        likes: updatedReply.likes,
        liked: updatedReply.likes.includes(decoded.userId),
      })
    }

    // Handle reply deletion
    if (updates.action === "deleteReply") {
      const replyId = updates.replyId
      const replies = post.replies || []

      // Check if user owns the reply
      const reply = replies.find((r: any) => r.id === replyId)
      if (!reply || reply.authorId !== decoded.userId) {
        return NextResponse.json({ error: "Not authorized to delete this reply" }, { status: 403 })
      }

      const updatedReplies = replies.filter((reply: any) => reply.id !== replyId)

      await db.collection("forumPosts").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            replies: updatedReplies,
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({ message: "Reply deleted successfully" })
    }

    // Regular update - check ownership
    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "Not authorized to edit this post" }, { status: 403 })
    }

    const result = await db.collection("forumPosts").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Forum post updated successfully" })
  } catch (error) {
    console.error("Update forum post error:", error)
    return NextResponse.json({ error: "Failed to update forum post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { db } = await connectToDatabase()

    // Check if user owns the post
    const post = await db.collection("forumPosts").findOne({
      _id: new ObjectId(params.id),
    })

    if (!post) {
      return NextResponse.json({ error: "Forum post not found" }, { status: 404 })
    }

    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "Not authorized to delete this post" }, { status: 403 })
    }

    await db.collection("forumPosts").deleteOne({
      _id: new ObjectId(params.id),
    })

    return NextResponse.json({ message: "Forum post deleted successfully" })
  } catch (error) {
    console.error("Delete forum post error:", error)
    return NextResponse.json({ error: "Failed to delete forum post" }, { status: 500 })
  }
}

function getCommunityLevelName(score: number): string {
  if (score >= 200) return "Legend"
  if (score >= 100) return "Champion"
  if (score >= 50) return "Contributor"
  if (score >= 25) return "Helper"
  return "Newcomer"
}
