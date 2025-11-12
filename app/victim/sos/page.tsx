"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  Heart,
  FileText,
  Phone,
  Droplet,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Edit2,
  Plus,
  Save,
  XIcon,
  MapPin,
  Loader,
  CheckCircle,
  Navigation,
  Building2,
} from "lucide-react"
import { getLocation, watchLocation, stopWatchingLocation } from "@/lib/geolocation"

interface AcceptedHospital {
  hospitalName: string
  ambulanceStatus: "dispatched" | "en-route" | "arrived"
  eta: number
  latitude: number
  longitude: number
}

interface MedicalRecord {
  id: string
  date: string
  type: string
  hospital: string
  notes: string
}

interface ProfileData {
  name: string
  email: string
  phone: string
  hometown: string
  bloodGroup: string
  allergies: string
  emergencyContact: string
  emergencyContactName: string
}

export default function SOSPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sosActive, setSosActive] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [addingRecord, setAddingRecord] = useState(false)
  const [locationTracking, setLocationTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([])
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [sosAlertId, setSosAlertId] = useState<string | null>(null)
  const [acceptedHospital, setAcceptedHospital] = useState<AcceptedHospital | null>(null)
  const [sosHistory, setSosHistory] = useState<any[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const watchIdRef = useRef<number>(-1)
  const ambulanceTrackingRef = useRef<NodeJS.Timeout | null>(null)

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    hometown: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    emergencyContactName: "",
  })

  const [editFormData, setEditFormData] = useState(profile)

  const [newRecord, setNewRecord] = useState({
    date: "",
    type: "",
    hospital: "",
    notes: "",
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem("victimProfile")
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfile(parsedProfile)
      setEditFormData(parsedProfile)
    }

    const savedRecords = localStorage.getItem("medicalRecords")
    if (savedRecords) {
      setMedicalRecords(JSON.parse(savedRecords))
    }

    const savedSosHistory = localStorage.getItem("sosHistory")
    if (savedSosHistory) {
      setSosHistory(JSON.parse(savedSosHistory))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("victimProfile", JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem("medicalRecords", JSON.stringify(medicalRecords))
  }, [medicalRecords])

  useEffect(() => {
    localStorage.setItem("sosHistory", JSON.stringify(sosHistory))
  }, [sosHistory])

  const handleSOS = async () => {
    setSosActive(true)
    setLoadingLocation(true)

    try {
      const location = await getLocation()
      setCurrentLocation(location)

      const sosResponse = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        victimName: profile.name || "Unknown",
        bloodGroup: profile.bloodGroup || "Unknown",
        allergies: profile.allergies || "None",
        emergencyContact: profile.emergencyContact || "Unknown",
        emergencyContactName: profile.emergencyContactName || "Unknown",
        status: "active",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        acceptedHospital: null as any,
      }

      setSosHistory((prev) => [sosResponse, ...prev])

      const sosAlertResponse = await fetch("/api/sos/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          victimId: "victim-1",
          victimName: profile.name || "Unknown",
          location: {
            lat: location.latitude,
            lng: location.longitude,
            accuracy: location.accuracy,
          },
          bloodGroup: profile.bloodGroup || "Unknown",
          allergies: profile.allergies || "None",
          emergencyContact: profile.emergencyContact || "Unknown",
          emergencyContactName: profile.emergencyContactName || "Unknown",
        }),
      })

      const sosData = await sosAlertResponse.json()
      setSosAlertId(sosData.alertId)

      const response = await fetch("/api/hospitals/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 10,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNearbyHospitals(data.hospitals)
      }

      setLocationTracking(true)
      watchIdRef.current = watchLocation(
        (newLocation) => {
          setCurrentLocation(newLocation)
          fetch("/api/location/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              victimId: "victim-1",
              latitude: newLocation.latitude,
              longitude: newLocation.longitude,
              accuracy: newLocation.accuracy,
            }),
          })
        },
        (error) => {
          console.error("Location tracking error:", error)
        },
      )

      if (sosData.alertId) {
        ambulanceTrackingRef.current = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/sos/get-alert-status?alertId=${sosData.alertId}`)
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              if (statusData.response) {
                setAcceptedHospital({
                  hospitalName: statusData.response.hospital_name,
                  ambulanceStatus: statusData.response.status,
                  eta: statusData.response.eta || 8,
                  latitude: statusData.alert.latitude,
                  longitude: statusData.alert.longitude,
                })

                setSosHistory((prev) =>
                  prev.map((sos) =>
                    sos.id === sosResponse.id
                      ? {
                          ...sos,
                          acceptedHospital: {
                            hospitalName: statusData.response.hospital_name,
                            ambulanceStatus: statusData.response.status,
                            eta: statusData.response.eta || 8,
                            latitude: statusData.alert.latitude,
                            longitude: statusData.alert.longitude,
                          },
                        }
                      : sos,
                  ),
                )
              }
            }
          } catch (error) {
            console.error("Alert status tracking error:", error)
          }
        }, 2000)
      }

      setTimeout(() => {
        alert("SOS activated! Nearby hospitals have been notified. Help is on the way!")
      }, 500)
    } catch (error) {
      console.error("SOS error:", error)
      alert("Error activating SOS. Please try again.")
      setSosActive(false)
    } finally {
      setLoadingLocation(false)
    }
  }

  const handleStopSOS = () => {
    setSosActive(false)
    setLocationTracking(false)
    setAcceptedHospital(null)
    setSosAlertId(null)
    if (watchIdRef.current >= 0) {
      stopWatchingLocation(watchIdRef.current)
    }
    if (ambulanceTrackingRef.current) {
      clearInterval(ambulanceTrackingRef.current)
    }
    setCurrentLocation(null)
    setNearbyHospitals([])

    setSosHistory((prev) => prev.map((sos, idx) => (idx === 0 ? { ...sos, status: "completed" } : sos)))
  }

  const handleEditProfile = () => {
    setEditFormData(profile)
    setEditingProfile(true)
  }

  const handleSaveProfile = () => {
    setProfile(editFormData)
    setEditingProfile(false)
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.type && newRecord.hospital) {
      const record: MedicalRecord = {
        id: Math.random().toString(36).substr(2, 9),
        ...newRecord,
      }
      setMedicalRecords([record, ...medicalRecords])
      setNewRecord({ date: "", type: "", hospital: "", notes: "" })
      setAddingRecord(false)
    }
  }

  const handleDeleteRecord = (id: string) => {
    setMedicalRecords(medicalRecords.filter((r) => r.id !== id))
  }

  const handleRecordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRecord({
      ...newRecord,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current >= 0) {
        stopWatchingLocation(watchIdRef.current)
      }
      if (ambulanceTrackingRef.current) {
        clearInterval(ambulanceTrackingRef.current)
      }
    }
  }, [])

  const isProfileEmpty = !profile.name || !profile.email || !profile.phone

  return (
    <div className="min-h-screen bg-background">
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
          <Link href="/">
            <Button variant="outline" size="sm" className="transition-smooth bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} hidden lg:block border-r border-border bg-card transition-all duration-300`}
        >
          <nav className="p-6 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Menu</div>
            {[
              { href: "#profile", label: "Profile", icon: Heart },
              { href: "#records", label: "Medical Records", icon: FileText },
              { href: "#history", label: "SOS History", icon: AlertCircle },
            ].map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-smooth"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            {isProfileEmpty && (
              <Card className="border-accent/50 bg-accent/5 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">Complete Your Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Please fill in your profile information before using SOS. This helps hospitals provide better
                        emergency care.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <button
              onClick={sosActive ? handleStopSOS : handleSOS}
              disabled={loadingLocation || isProfileEmpty}
              className={`w-full py-12 rounded-2xl font-bold text-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                sosActive
                  ? "bg-accent/50 text-accent-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:shadow-2xl hover:shadow-accent/50"
              }`}
            >
              {loadingLocation ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-6 h-6 animate-spin" />
                  Activating SOS...
                </span>
              ) : sosActive ? (
                "🚨 SOS ACTIVATED - HELP ON THE WAY"
              ) : (
                "🚨 PRESS FOR SOS"
              )}
            </button>
            {sosActive && (
              <div className="mt-4 space-y-3">
                <p className="text-center text-sm text-accent font-medium">
                  Your location is being shared with nearby hospitals
                </p>
                {acceptedHospital && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <p className="text-sm font-semibold text-foreground">Hospital Accepted</p>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 border border-primary/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Navigation className="w-5 h-5 text-primary animate-pulse" />
                            <p className="font-semibold text-foreground">Ambulance Tracking</p>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Hospital Name</p>
                              <p className="font-semibold text-foreground">{acceptedHospital.hospitalName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Ambulance Status</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                <p className="font-semibold text-foreground capitalize">
                                  {acceptedHospital.ambulanceStatus}
                                </p>
                              </div>
                            </div>
                            <div className="bg-background rounded p-2">
                              <p className="text-xs text-muted-foreground">Estimated Time of Arrival</p>
                              <p className="text-lg font-bold text-primary">{acceptedHospital.eta} minutes</p>
                            </div>
                            <div className="text-xs text-muted-foreground bg-background rounded p-2">
                              <p className="font-medium text-foreground mb-1">Ambulance Location</p>
                              <p>
                                Lat: {acceptedHospital.latitude.toFixed(4)}, Lng:{" "}
                                {acceptedHospital.longitude.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {currentLocation && (
                  <Card className="border-accent/50 bg-accent/5">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-accent" />
                        <p className="text-sm font-semibold text-foreground">Your Location</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Latitude:</span> {currentLocation.latitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Longitude:</span> {currentLocation.longitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Accuracy:</span> ±{currentLocation.accuracy.toFixed(0)} meters
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {nearbyHospitals.length > 0 && (
                  <Card className="border-secondary/50 bg-secondary/5">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-secondary" />
                        <p className="text-sm font-semibold text-foreground">
                          {nearbyHospitals.length} Nearby Hospital{nearbyHospitals.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {nearbyHospitals.slice(0, 5).map((hospital, idx) => (
                          <div key={hospital.id || idx} className="text-xs bg-background rounded p-2">
                            <p className="font-medium text-foreground">{hospital.name}</p>
                            <p className="text-muted-foreground">{hospital.distance} km away</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <section id="profile" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Profile</h2>
              {!editingProfile && (
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="transition-smooth bg-transparent"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {editingProfile ? (
              <Card className="border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Hometown</label>
                      <Input
                        type="text"
                        name="hometown"
                        value={editFormData.hometown}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Blood Group</label>
                      <Input
                        type="text"
                        name="bloodGroup"
                        value={editFormData.bloodGroup}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Allergic Medicines</label>
                      <Input
                        type="text"
                        name="allergies"
                        value={editFormData.allergies}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Emergency Contact Name</label>
                      <Input
                        type="text"
                        name="emergencyContactName"
                        value={editFormData.emergencyContactName}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Emergency Contact Phone</label>
                      <Input
                        type="tel"
                        name="emergencyContact"
                        value={editFormData.emergencyContact}
                        onChange={handleProfileChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 transition-smooth">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setEditingProfile(false)}
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
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-foreground">{profile.name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{profile.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground">{profile.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hometown</p>
                      <p className="font-semibold text-foreground">{profile.hometown || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Droplet className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Group</p>
                        <p className="font-semibold text-foreground">{profile.bloodGroup || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Allergic Medicines</p>
                        <p className="font-semibold text-foreground">{profile.allergies || "None"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-semibold text-foreground">
                          {profile.emergencyContactName || "Not provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">{profile.emergencyContact || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          <section id="records">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Medical Records</h2>
              {!addingRecord && (
                <Button
                  onClick={() => setAddingRecord(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 transition-smooth"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              )}
            </div>

            {addingRecord && (
              <Card className="border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Add Medical Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Date</label>
                      <Input
                        type="date"
                        name="date"
                        value={newRecord.date}
                        onChange={handleRecordChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Type</label>
                      <Input
                        type="text"
                        name="type"
                        placeholder="Checkup, Vaccination, Lab Test, etc."
                        value={newRecord.type}
                        onChange={handleRecordChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Hospital/Clinic</label>
                      <Input
                        type="text"
                        name="hospital"
                        placeholder="Hospital or clinic name"
                        value={newRecord.hospital}
                        onChange={handleRecordChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Notes</label>
                      <Input
                        type="text"
                        name="notes"
                        placeholder="Additional notes about the visit"
                        value={newRecord.notes}
                        onChange={handleRecordChange}
                        className="bg-input border-border mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddRecord} className="bg-primary hover:bg-primary/90 transition-smooth">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Record
                    </Button>
                    <Button
                      onClick={() => setAddingRecord(false)}
                      variant="outline"
                      size="sm"
                      className="transition-smooth bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {medicalRecords.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      No medical records yet. Add your first record to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                medicalRecords.map((record) => (
                  <Card key={record.id} className="border-border/50 hover:border-primary/50 transition-smooth">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground">{record.type}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{record.hospital}</p>
                          <p className="text-sm text-foreground">{record.notes}</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <p className="text-sm font-medium text-muted-foreground">{record.date}</p>
                          <Button
                            onClick={() => handleDeleteRecord(record.id)}
                            variant="outline"
                            size="sm"
                            className="transition-smooth bg-transparent text-destructive hover:bg-destructive/10"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section id="history" className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">SOS Response History</h2>
            <div className="space-y-4">
              {sosHistory.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No SOS responses yet.</p>
                  </CardContent>
                </Card>
              ) : (
                sosHistory.map((sos, idx) => (
                  <Card
                    key={sos.id}
                    className={`border-border/50 ${
                      sos.status === "active" ? "border-accent/50 bg-accent/5" : "border-primary/50 bg-primary/5"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle
                              className={`w-5 h-5 ${
                                sos.status === "active" ? "text-accent" : "text-primary"
                              } animate-pulse`}
                            />
                            <p className="font-semibold text-foreground capitalize">{sos.status} SOS</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(sos.timestamp).toLocaleString()}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Blood Group</p>
                            <p className="font-semibold text-foreground">{sos.bloodGroup}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Allergies</p>
                            <p className="font-semibold text-foreground">{sos.allergies}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Emergency Contact</p>
                            <p className="font-semibold text-foreground">{sos.emergencyContactName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Contact Phone</p>
                            <p className="font-semibold text-foreground">{sos.emergencyContact}</p>
                          </div>
                        </div>

                        {sos.location && (
                          <div className="bg-background rounded p-3">
                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                            <p className="text-sm font-mono">
                              {sos.location.latitude.toFixed(4)}, {sos.location.longitude.toFixed(4)}
                            </p>
                          </div>
                        )}

                        {sos.acceptedHospital && (
                          <div className="bg-background rounded p-3 border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-2">Accepted Hospital</p>
                            <p className="text-sm font-semibold text-foreground">{sos.acceptedHospital.hospitalName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Status: {sos.acceptedHospital.ambulanceStatus}
                            </p>
                            <p className="text-xs text-muted-foreground">ETA: {sos.acceptedHospital.eta} minutes</p>
                          </div>
                        )}
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
