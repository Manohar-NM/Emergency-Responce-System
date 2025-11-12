import { updateAmbulanceLocation } from "@/lib/ambulance-store"

export async function POST(request: Request) {
  try {
    const { ambulanceId, latitude, longitude, eta, status } = await request.json()

    updateAmbulanceLocation(ambulanceId, latitude, longitude, eta, status)

    return Response.json({
      success: true,
      message: "Ambulance location updated",
    })
  } catch (error) {
    console.error("Update location error:", error)
    return Response.json({ success: false, error: "Failed to update location" }, { status: 500 })
  }
}
