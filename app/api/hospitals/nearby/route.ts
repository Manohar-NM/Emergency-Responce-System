import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { latitude, longitude, radius = 10 } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing location coordinates" }, { status: 400 })
    }

    const { data: hospitals, error } = await supabase.from("hospitals").select("*")

    if (error) {
      console.error("Error fetching hospitals:", error)
      return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 })
    }

    if (!hospitals || hospitals.length === 0) {
      return NextResponse.json(
        {
          success: true,
          hospitals: [],
          count: 0,
        },
        { status: 200 },
      )
    }

    const nearbyHospitals = hospitals
      .map((hospital) => ({
        ...hospital,
        distance: Number.parseFloat(
          calculateDistance(latitude, longitude, Number(hospital.latitude), Number(hospital.longitude)).toFixed(2),
        ),
      }))
      .filter((hospital) => hospital.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json(
      {
        success: true,
        hospitals: nearbyHospitals,
        count: nearbyHospitals.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error finding nearby hospitals:", error)
    return NextResponse.json({ error: "Failed to find nearby hospitals" }, { status: 500 })
  }
}
