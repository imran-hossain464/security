import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, collections } from "@/lib/mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const db = await getDatabase()

    const result = await db.collection(collections.helpPosts).updateOne(
      { _id: params.id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Help post not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Help post updated successfully",
    })
  } catch (error) {
    console.error("Error updating help post:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()

    const result = await db.collection(collections.helpPosts).deleteOne({ _id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Help post not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Help post deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting help post:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const post = await db.collection(collections.helpPosts).findOne({ _id: params.id })

    if (!post) {
      return NextResponse.json({ success: false, message: "Help post not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        id: post._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching help post:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
