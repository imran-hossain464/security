import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, collections } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json()
    const db = await getDatabase()

    const newMessage = {
      ...messageData,
      createdAt: new Date(),
      isRead: false,
    }

    const result = await db.collection(collections.messages).insertOne(newMessage)

    if (result.insertedId) {
      // Update conversation's last message and updatedAt
      await db.collection(collections.conversations).updateOne(
        { _id: messageData.conversationId },
        {
          $set: {
            lastMessage: {
              content: newMessage.content,
              senderId: newMessage.senderId,
              createdAt: newMessage.createdAt,
            },
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({
        success: true,
        message: {
          ...newMessage,
          id: result.insertedId.toString(),
        },
      })
    }

    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ success: false, message: "Conversation ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const messages = await db.collection(collections.messages).find({ conversationId }).sort({ createdAt: 1 }).toArray()

    const formattedMessages = messages.map((message) => ({
      ...message,
      id: message._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
