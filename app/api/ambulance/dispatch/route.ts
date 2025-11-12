import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { alertId, hospitalId, hospitalName, hospitalLat, hospitalLng } = await request.json()

    const { data: ambulance, error: ambulanceError } = await supabase
      .from("ambulance_locations")
      .insert({
        alert_id: alertId,
        hospital_id: hospitalId,
        hospital_name: hospitalName,
        latitude: hospitalLat,
        longitude: hospitalLng,
        status: "dispatched",
        eta: 8,
      })
      .select()
      .single()

    if (ambulanceError) {
      console.error("Error inserting ambulance:", ambulanceError)
      return Response.json({ success: false, error: "Failed to dispatch ambulance" }, { status: 500 })
    }

    const { error: responseError } = await supabase.from("hospital_responses").insert({
      alert_id: alertId,
      hospital_id: hospitalId,
      hospital_name: hospitalName,
      status: "dispatched",
      eta: 8,
    })

    if (responseError) {
      console.error("Error inserting hospital response:", responseError)
    }

    await supabase.from("sos_alerts").update({ status: "accepted" }).eq("id", alertId)

    return Response.json({
      success: true,
      ambulanceId: ambulance.id,
      message: "Ambulance dispatched successfully",
    })
  } catch (error) {
    console.error("Dispatch error:", error)
    return Response.json({ success: false, error: "Failed to dispatch ambulance" }, { status: 500 })
  }
}
