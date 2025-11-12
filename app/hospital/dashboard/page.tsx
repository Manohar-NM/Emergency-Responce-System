"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Hospital,
  AlertCircle,
  MapPin,
  Phone,
  Droplet,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  Edit2,
  Save,
  Bell,
} from "lucide-react"

interface SOSAlert {
  id: string
  victimId: string
  victimName: string
  location: { lat: number; lng: number }
  bloodGroup: string
  allergies: string
  emergencyContact: string
  emergencyContactName?: string
  timestamp: string
  status: "pending" | "accepted" | "rejected"
  distance?: string
  priority: "high" | "medium"
}

interface ResponseRecord {
  id: string
  victimName: string
  date: string
  time: string
  status: "completed" | "in-progress"
  distance: string
}

export default function HospitalDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingHospital, setEditingHospital] = useState(false)
  const [emergencies, setEmergencies] = useState<SOSAlert[]>([])
  const [responseHistory, setResponseHistory] = useState<ResponseRecord[]>([])

  const [hospitalData, setHospitalData] = useState<{
    id: string
    latitude: number
    longitude: number
  } | null>(null)

  const [hospitalInfo, setHospitalInfo] = useState({
    name: "City Hospital",
    email: "contact@cityhospital.com",
    phone: "+1 (555) 111-2222",
    address: "123 Medical Ave, New York, NY 10001",
    services: "Cardiac Care, Trauma Center, 24/7 ER, Pediatrics",
    ambulances: 5,
    availableStaff: 12,
  })

  const [editFormData, setEditFormData] = useState(hospitalInfo)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const userEmail = localStorage.getItem("userEmail")

    console.log("[v0] Dashboard loading - Role:", userRole, "Email:", userEmail)

    if (userRole !== "hospital" || !userEmail) {
      console.log("[v0] Invalid session, redirecting to login")
      router.push("/auth/login")
      return
    }

    const fetchHospitalData = async () => {
      try {
        console.log("[v0] Fetching hospital data for email:", userEmail)
        const response = await fetch(`/api/hospitals/get-current?email=${encodeURIComponent(userEmail)}`)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Received hospital data:", data.hospital)

          if (data.hospital) {
            if (data.hospital.email !== userEmail) {
              console.error("[v0] Email mismatch! Expected:", userEmail, "Got:", data.hospital.email)
              alert("Session error: Email mismatch. Please log in again.")
              localStorage.clear()
              router.push("/auth/login")
              return
            }

            setHospitalData({
              id: data.hospital.id,
              latitude: data.hospital.latitude,
              longitude: data.hospital.longitude,
            })

            const updatedInfo = {
              name: data.hospital.name,
              email: data.hospital.email,
              phone: data.hospital.phone,
              address: data.hospital.address,
              services: data.hospital.services || "Cardiac Care, Trauma Center, 24/7 ER, Pediatrics",
              ambulances: data.hospital.available_ambulances || 5,
              availableStaff: data.hospital.available_staff || 12,
            }

            console.log("[v0] Setting hospital info:", updatedInfo)
            setHospitalInfo(updatedInfo)
            setEditFormData(updatedInfo)
          }
        } else {
          console.error("[v0] Failed to fetch hospital data, status:", response.status)
          const errorData = await response.json()
          console.error("[v0] Error details:", errorData)
          alert("Failed to load hospital data. Please log in again.")
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("[v0] Error fetching hospital data:", error)
        alert("Error loading hospital data. Please log in again.")
        router.push("/auth/login")
      }
    }

    fetchHospitalData()
  }, [router])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/sos/get-alerts")
        if (response.ok) {
          const data = await response.json()
          setEmergencies(data.alerts)
        }
      } catch (error) {
        console.error("Error fetching alerts:", error)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleAccept = async (id: string) => {
    try {
      if (!hospitalData) {
        alert("Hospital data not loaded yet. Please wait.")
        return
      }

      const emergency = emergencies.find((e) => e.id === id)
      if (!emergency) return

      const dispatchResponse = await fetch("/api/ambulance/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: id,
          hospitalId: hospitalData.id,
          hospitalName: hospitalInfo.name,
          hospitalLat: hospitalData.latitude,
          hospitalLng: hospitalData.longitude,
        }),
      })

      if (dispatchResponse.ok) {
        const response = await fetch("/api/sos/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alertId: id, status: "accepted" }),
        })

        if (response.ok) {
          setResponseHistory([
            {
              id: Math.random().toString(36).substr(2, 9),
              victimName: emergency.victimName,
              date: new Date().toISOString().split("T")[0],
              time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              status: "in-progress",
              distance: emergency.distance || "N/A",
            },
            ...responseHistory,
          ])

          setEmergencies(emergencies.filter((e) => e.id !== id))
          alert("Emergency accepted! Ambulance dispatched.")
        }
      }
    } catch (error) {
      console.error("Error accepting emergency:", error)
      alert("Failed to accept emergency")
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch("/api/sos/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: id, status: "rejected" }),
      })

      if (response.ok) {
        setEmergencies(emergencies.filter((e) => e.id !== id))
      }
    } catch (error) {
      console.error("Error rejecting emergency:", error)
      alert("Failed to reject emergency")
    }
  }

  const handleEditHospital = () => {
    setEditFormData(hospitalInfo)
    setEditingHospital(true)
  }

  const handleSaveHospital = () => {
    setHospitalInfo(editFormData)
    setEditingHospital(false)
  }

  const handleHospitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogout = () => {
    console.log("[v0] Logging out")
    localStorage.clear()
    router.push("/auth/login")
  }

  const getPriorityColor = (priority: string) => {
    return priority === "high" ? "text-accent" : "text-secondary"
  }

  const getPriorityBg = (priority: string) => {
    return priority === "high" ? "bg-accent/10" : "bg-secondary/10"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Image src="/ers-logo.png" alt="ERS Logo" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-lg text-foreground">ERS</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-smooth" />
              {emergencies.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {emergencies.length}
                </span>
              )}
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="transition-smooth bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} hidden lg:block border-r border-border bg-card transition-all duration-300`}
        >
          <nav className="p-6 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Menu</div>
            {[
              { href: "#emergencies", label: "Active Emergencies", icon: AlertCircle },
              { href: "#hospital", label: "Hospital Info", icon: Hospital },
              { href: "#history", label: "Response History", icon: Clock },
            ].map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary/10 hover:text-secondary transition-smooth"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Active Emergencies Section */}
          <section id="emergencies" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Active Emergencies</h2>
              <div className="bg-accent/10 text-accent px-4 py-2 rounded-lg font-semibold">
                {emergencies.length} Pending
              </div>
            </div>

            {emergencies.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="pt-12 text-center">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No active emergencies at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {emergencies.map((emergency) => (
                  <Card
                    key={emergency.id}
                    className={`border-2 transition-smooth border-2 ${emergency.priority === "high" ? "border-accent/50 bg-accent/5" : "border-secondary/50 bg-secondary/5"}`}
                  >
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Victim Info */}
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Victim Name</p>
                              <p className="font-bold text-lg text-foreground">{emergency.victimName}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBg(emergency.priority)} ${getPriorityColor(emergency.priority)}`}
                            >
                              {emergency.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Droplet className="w-4 h-4" />
                                Blood Group
                              </p>
                              <p className="font-semibold text-foreground">{emergency.bloodGroup}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Allergies
                              </p>
                              <p className="font-semibold text-foreground">{emergency.allergies}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Emergency Contact
                            </p>
                            <p className="font-semibold text-foreground">{emergency.emergencyContact}</p>
                          </div>
                        </div>

                        {/* Location & Actions */}
                        <div className="space-y-4">
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              <p className="font-semibold text-foreground">Distance</p>
                            </div>
                            <p className="text-2xl font-bold text-primary">{emergency.distance || "Calculating..."}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Alert received {new Date(emergency.timestamp).toLocaleTimeString()}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleAccept(emergency.id)}
                              className="flex-1 bg-primary hover:bg-primary/90 transition-smooth"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleReject(emergency.id)}
                              variant="outline"
                              className="flex-1 transition-smooth"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Hospital Info Section */}
          <section id="hospital" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Hospital Information</h2>
              {!editingHospital && (
                <Button
                  onClick={handleEditHospital}
                  variant="outline"
                  size="sm"
                  className="transition-smooth bg-transparent"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Info
                </Button>
              )}
            </div>

            {editingHospital ? (
              <Card className="border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Hospital Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Hospital Name</label>
                      <Input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleHospitalChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleHospitalChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleHospitalChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Address</label>
                      <Input
                        type="text"
                        name="address"
                        value={editFormData.address}
                        onChange={handleHospitalChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Services Provided</label>
                      <Input
                        type="text"
                        name="services"
                        value={editFormData.services}
                        onChange={handleHospitalChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveHospital} className="bg-primary hover:bg-primary/90 transition-smooth">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setEditingHospital(false)}
                      variant="outline"
                      className="transition-smooth bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Hospital Name</p>
                      <p className="font-semibold text-foreground">{hospitalInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{hospitalInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground">{hospitalInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold text-foreground">{hospitalInfo.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Services Provided</p>
                      <p className="font-semibold text-foreground">{hospitalInfo.services}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Ambulances</p>
                        <p className="text-2xl font-bold text-primary">{hospitalInfo.ambulances}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Staff</p>
                        <p className="text-2xl font-bold text-secondary">{hospitalInfo.availableStaff}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          {/* Response History Section */}
          <section id="history">
            <h2 className="text-2xl font-bold text-foreground mb-6">Response History</h2>
            <div className="space-y-3">
              {responseHistory.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-8 text-center pb-8">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No response history yet</p>
                  </CardContent>
                </Card>
              ) : (
                responseHistory.map((record) => (
                  <Card key={record.id} className="border-border/50 hover:border-primary/50 transition-smooth">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{record.victimName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.date} at {record.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-muted-foreground">{record.distance}</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                              record.status === "completed"
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/10 text-secondary"
                            }`}
                          >
                            {record.status === "completed" ? "✓ Completed" : "In Progress"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
