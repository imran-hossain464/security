import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, collections } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { participants, isGroup = false, groupName } = await request.json()
    const db = await getDatabase()

    // Check if conversation already exists between these participants
    if (!isGroup && participants.length === 2) {
      const existingConversation = await db.collection(collections.conversations).findOne({
        participants: { $all: participants, $size: 2 },
        isGroup: false,
      })

      if (existingConversation) {
        return NextResponse.json({
          success: true,
          conversation: {
            ...existingConversation,
            id: existingConversation._id.toString(),
          },
        })
      }
    }

    // Get participant names and avatars
    const users = await db
      .collection(collections.users)
      .find({ _id: { $in: participants } })
      .toArray()

    const participantNames = users.map((user) => `${user.firstName} ${user.lastName}`)
    const participantAvatars = users.map((user) => user.avatar || "/placeholder.svg?height=40&width=40")

    const newConversation = {
      participants,
      participantNames,
      participantAvatars,
      isGroup,
      groupName,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.conversations).insertOne(newConversation)

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        conversation: {
          ...newConversation,
          id: result.insertedId.toString(),
        },
      })
    }

    return NextResponse.json({ success: false, message: "Failed to create conversation" }, { status: 500 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const conversations = await db
      .collection(collections.conversations)
      .find({ participants: userId })
      .sort({ updatedAt: -1 })
      .toArray()

    const formattedConversations = conversations.map((conversation) => ({
      ...conversation,
      id: conversation._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
