"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, X, ArrowRight, FileText } from "lucide-react"

interface MedicalRecord {
  id: string
  date: string
  type: string
  hospital: string
  notes: string
}

export default function MedicalRecordsSetupPage() {
  const router = useRouter()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newRecord, setNewRecord] = useState({
    date: "",
    type: "",
    hospital: "",
    notes: "",
  })

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.type && newRecord.hospital) {
      const record: MedicalRecord = {
        id: Math.random().toString(36).substr(2, 9),
        ...newRecord,
      }
      setRecords([record, ...records])
      setNewRecord({ date: "", type: "", hospital: "", notes: "" })
      setShowForm(false)
    }
  }

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id))
  }

  const handleRecordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRecord({
      ...newRecord,
      [e.target.name]: e.target.value,
    })
  }

  const handleContinue = async () => {
    setLoading(true)
    // Save medical records to localStorage
    localStorage.setItem("medicalRecords", JSON.stringify(records))
    // Redirect to SOS page
    setTimeout(() => {
      router.push("/victim/sos")
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ers-logo.png" alt="ERS Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-semibold text-lg text-foreground">ERS</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">Account Created</p>
                <p className="text-sm text-muted-foreground">Your profile is ready</p>
              </div>
            </div>
            <div className="flex-1 h-1 bg-primary mx-4 rounded-full"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">Medical Records</p>
                <p className="text-sm text-muted-foreground">Add your health history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Add Your Medical Records</CardTitle>
            <CardDescription>
              Help hospitals provide better emergency care by sharing your medical history. You can add records now or
              skip and add them later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Records List */}
            {records.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Your Records ({records.length})</h3>
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-smooth"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{record.type}</p>
                          <p className="text-sm text-muted-foreground">{record.hospital}</p>
                          <p className="text-xs text-muted-foreground mt-1">{record.date}</p>
                          {record.notes && <p className="text-sm text-foreground mt-2">{record.notes}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-smooth text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Record Form */}
            {showForm ? (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h3 className="font-semibold text-foreground">Add New Record</h3>
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
                    <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
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
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleAddRecord} className="bg-primary hover:bg-primary/90 transition-smooth">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="transition-smooth bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="w-full transition-smooth bg-transparent border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medical Record
              </Button>
            )}

            {/* Info Box */}
            <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Tip:</span> Adding medical records helps hospitals understand your
                health conditions and provide faster, more accurate emergency care.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => router.push("/victim/dashboard")}
            variant="outline"
            className="transition-smooth bg-transparent"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 transition-smooth"
          >
            {loading ? "Setting up..." : "Continue to SOS"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}
