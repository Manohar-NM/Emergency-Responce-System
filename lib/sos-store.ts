export interface SOSAlert {
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

// In-memory store for SOS alerts (in production, use a database)
const sosAlerts = new Map<string, SOSAlert>()

export function addSOSAlert(alert: SOSAlert) {
  sosAlerts.set(alert.id, alert)
}

export function getSOSAlerts() {
  return Array.from(sosAlerts.values()).filter((a) => a.status === "pending")
}

export function updateSOSAlertStatus(alertId: string, status: "pending" | "accepted" | "rejected") {
  const alert = sosAlerts.get(alertId)
  if (alert) {
    alert.status = status
  }
}

export function removeSOSAlert(alertId: string) {
  sosAlerts.delete(alertId)
}

export function getAllSOSAlerts() {
  return Array.from(sosAlerts.values())
}
