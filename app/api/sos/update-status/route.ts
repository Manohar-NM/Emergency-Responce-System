import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { alertId, status } = await request.json()

    if (!alertId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("sos_alerts").update({ status }).eq("id", alertId)

    if (error) {
      console.error("Error updating alert status:", error)
      return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: `Alert ${status} successfully`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating alert status:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}
