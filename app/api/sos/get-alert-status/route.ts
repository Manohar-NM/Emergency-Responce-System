import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get("alertId")

    if (!alertId) {
      return NextResponse.json({ error: "Missing alertId" }, { status: 400 })
    }

    // Get SOS alert details
    const { data: alert, error: alertError } = await supabase.from("sos_alerts").select("*").eq("id", alertId).single()

    if (alertError || !alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    const { data: response } = await supabase
      .from("hospital_responses")
      .select("*, hospitals(name)")
      .eq("alert_id", alertId)
      .maybeSingle()

    return NextResponse.json({
      alert,
      response: response || null,
    })
  } catch (error) {
    console.error("Error fetching alert status:", error)
    return NextResponse.json({ error: "Failed to fetch alert status" }, { status: 500 })
  }
}
