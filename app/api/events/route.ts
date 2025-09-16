import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Fetching events from database...")

    const { db } = await connectToDatabase()

    const events = await db.collection("events").find({}).sort({ createdAt: -1 }).toArray()

    // Get user details for each event
    const eventsWithUserDetails = await Promise.all(
      events.map(async (event) => {
        const user = await db.collection("users").findOne({
          _id: new ObjectId(event.organizerId),
        })

        return {
          ...event,
          id: event._id.toString(),
          organizer: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
          avatar: user?.avatar || null,
          date: event.date,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        }
      }),
    )

    console.log("✅ Fetched events from database:", eventsWithUserDetails.length, "events")
    return NextResponse.json(eventsWithUserDetails)
  } catch (error) {
    console.error("❌ Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
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

    console.log("🔄 Creating new event:", body)

    if (!body.title || !body.description || !body.category || !body.date || !body.location) {
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

    const newEvent = {
      title: body.title,
      description: body.description,
      category: body.category,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      organizerId: decoded.userId,
      maxAttendees: body.maxAttendees || 50,
      attendees: [],
      status: "upcoming",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("events").insertOne(newEvent)

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    // Update user's community score
    const newScore = (user.communityScore || 0) + 10
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { communityScore: newScore } })

    const createdEvent = {
      ...newEvent,
      id: result.insertedId.toString(),
      organizer: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
    }

    console.log("✅ Created event in database:", createdEvent)
    return NextResponse.json(createdEvent)
  } catch (error) {
    console.error("❌ Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
