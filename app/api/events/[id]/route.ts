import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, collections } from "@/lib/mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const db = await getDatabase()

    const result = await db.collection(collections.events).updateOne(
      { _id: params.id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()

    const result = await db.collection(collections.events).deleteOne({ _id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const event = await db.collection(collections.events).findOne({ _id: params.id })

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        id: event._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
