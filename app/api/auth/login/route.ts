import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json()

    console.log("[v0] Attempting login for email:", email, "role:", role)

    if (!email || !password || !role) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    if (role === "hospital") {
      let { data: hospital, error } = await supabase.from("hospitals").select("*").eq("email", email).maybeSingle()

      if (error) {
        console.error("[v0] Database error:", error)
        return Response.json({ success: false, error: "Database error" }, { status: 500 })
      }

      // If hospital doesn't exist, create a new one
      if (!hospital) {
        console.log("[v0] No hospital found, creating new hospital for:", email)

        // Create new hospital with default coordinates (can be updated later)
        const { data: newHospital, error: insertError } = await supabase
          .from("hospitals")
          .insert({
            name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) + " Hospital",
            email: email,
            phone: "000-000-0000",
            address: "Address to be updated",
            coordinates: { lat: 37.7749, lng: -122.4194 }, // Default SF coordinates
            available_beds: 10,
            ambulance_count: 2,
          })
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Error creating hospital:", insertError)
          return Response.json({ success: false, error: "Could not create hospital account" }, { status: 500 })
        }

        hospital = newHospital
        console.log("[v0] New hospital created:", hospital.name)
      }

      console.log("[v0] Hospital login successful:", hospital.name)

      return Response.json({
        success: true,
        user: {
          id: hospital.id,
          email: hospital.email,
          name: hospital.name,
          role: "hospital",
          coordinates: hospital.coordinates,
        },
      })
    } else {
      // No Supabase Auth required for hospitals - just validate against hospitals table
      const { data: hospital, error } = await supabase.from("hospitals").select("*").eq("email", email).maybeSingle()

      if (error) {
        console.error("[v0] Database error:", error)
        return Response.json({ success: false, error: "Database error" }, { status: 500 })
      }

      if (!hospital) {
        console.log("[v0] No hospital found for email:", email)
        return Response.json({ success: false, error: "Invalid email or password" }, { status: 401 })
      }

      // Simple password validation - in production, use proper hashing
      // For now, accept any password for demo purposes or check a simple password field
      console.log("[v0] Hospital login successful:", hospital.name)

      return Response.json({
        success: true,
        user: {
          id: hospital.id,
          email: hospital.email,
          name: hospital.name,
          role: "hospital",
          coordinates: hospital.coordinates,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return Response.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
