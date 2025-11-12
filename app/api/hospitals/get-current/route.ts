import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    console.log("[v0] API: Getting hospital for email:", email)

    if (!email) {
      console.error("[v0] API: No email provided")
      return Response.json({ success: false, error: "Email parameter required" }, { status: 400 })
    }

    const { data: hospital, error } = await supabase.from("hospitals").select("*").eq("email", email).maybeSingle()

    if (error) {
      console.error("[v0] API: Error fetching hospital:", error)
      return Response.json({ success: false, error: "Failed to fetch hospital data" }, { status: 500 })
    }

    if (!hospital) {
      console.error("[v0] API: Hospital not found for email:", email)
      return Response.json({ success: false, error: "Hospital not found" }, { status: 404 })
    }

    console.log("[v0] API: Found hospital:", hospital.name, "ID:", hospital.id)
    return Response.json({ success: true, hospital })
  } catch (error) {
    console.error("[v0] API: Get hospital error:", error)
    return Response.json({ success: false, error: "Failed to fetch hospital data" }, { status: 500 })
  }
}
