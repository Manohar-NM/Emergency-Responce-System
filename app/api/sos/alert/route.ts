import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { victimId, victimName, location, bloodGroup, allergies, emergencyContact, emergencyContactName } = body

    if (!victimId || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: hospitals } = await supabase.from("hospitals").select("*")

    let nearestHospital = null
    let minDistance = Number.POSITIVE_INFINITY

    if (hospitals && hospitals.length > 0) {
      for (const hospital of hospitals) {
        const distance = calculateDistance(location.lat, location.lng, hospital.latitude, hospital.longitude)
        if (distance < minDistance) {
          minDistance = distance
          nearestHospital = hospital
        }
      }
    }

    const { data: alert, error: insertError } = await supabase
      .from("sos_alerts")
      .insert({
        victim_id: victimId,
        victim_name: victimName,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy || null,
        blood_group: bloodGroup,
        allergies,
        emergency_contact: emergencyContact,
        emergency_contact_name: emergencyContactName,
        status: "pending",
        distance: minDistance.toFixed(1),
        priority: minDistance < 5 ? "high" : "medium",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting SOS alert:", insertError)
      return NextResponse.json({ error: "Failed to create SOS alert" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        alertId: alert.id,
        message: "SOS alert activated. Nearby hospitals have been notified.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("SOS alert error:", error)
    return NextResponse.json({ error: "Failed to create SOS alert" }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
