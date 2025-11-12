import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for victim locations (in production, use a database)
const victimLocations = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { victimId, latitude, longitude, accuracy } = body

    if (!victimId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update victim location
    const locationData = {
      victimId,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      timestamp: new Date().toISOString(),
    }

    victimLocations.set(victimId, locationData)

    // In production, this would:
    // 1. Store location in database
    // 2. Broadcast location update to subscribed hospitals via WebSocket
    // 3. Calculate distance to nearby hospitals
    // 4. Update ETA for ambulances

    return NextResponse.json(
      {
        success: true,
        message: "Location updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Location update error:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const locations = Array.from(victimLocations.values())
    return NextResponse.json({ locations }, { status: 200 })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}
