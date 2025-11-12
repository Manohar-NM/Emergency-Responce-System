import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: alerts, error } = await supabase
      .from("sos_alerts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching SOS alerts:", error)
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    const transformedAlerts = (alerts || []).map((alert) => ({
      id: alert.id,
      victimId: alert.victim_id,
      victimName: alert.victim_name,
      location: {
        lat: Number(alert.latitude),
        lng: Number(alert.longitude),
        accuracy: alert.accuracy ? Number(alert.accuracy) : undefined,
      },
      bloodGroup: alert.blood_group,
      allergies: alert.allergies,
      emergencyContact: alert.emergency_contact,
      emergencyContactName: alert.emergency_contact_name,
      timestamp: alert.created_at,
      status: alert.status,
      distance: alert.distance ? `${alert.distance} km` : undefined,
      priority: alert.priority,
    }))

    return NextResponse.json({ alerts: transformedAlerts }, { status: 200 })
  } catch (error) {
    console.error("Error fetching SOS alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}
