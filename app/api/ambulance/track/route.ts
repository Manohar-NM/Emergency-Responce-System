import { getAmbulanceLocationByAlertId } from "@/lib/ambulance-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get("alertId")

    if (!alertId) {
      return Response.json({ success: false, error: "Alert ID required" }, { status: 400 })
    }

    const ambulanceLocation = getAmbulanceLocationByAlertId(alertId)

    if (!ambulanceLocation) {
      return Response.json({ success: false, error: "Ambulance not found" }, { status: 404 })
    }

    return Response.json({
      success: true,
      ambulance: ambulanceLocation,
    })
  } catch (error) {
    console.error("Track error:", error)
    return Response.json({ success: false, error: "Failed to track ambulance" }, { status: 500 })
  }
}
