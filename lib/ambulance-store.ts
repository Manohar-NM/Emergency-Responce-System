export interface AmbulanceLocation {
  id: string
  alertId: string
  hospitalId: string
  hospitalName: string
  latitude: number
  longitude: number
  status: "dispatched" | "en-route" | "arrived"
  eta: number // in minutes
  timestamp: string
}

// In-memory store for ambulance locations
const ambulanceLocations = new Map<string, AmbulanceLocation>()

export function addAmbulanceLocation(location: AmbulanceLocation) {
  ambulanceLocations.set(location.id, location)
}

export function getAmbulanceLocationByAlertId(alertId: string) {
  return Array.from(ambulanceLocations.values()).find((a) => a.alertId === alertId)
}

export function updateAmbulanceLocation(
  id: string,
  latitude: number,
  longitude: number,
  eta: number,
  status: "dispatched" | "en-route" | "arrived",
) {
  const ambulance = ambulanceLocations.get(id)
  if (ambulance) {
    ambulance.latitude = latitude
    ambulance.longitude = longitude
    ambulance.eta = eta
    ambulance.status = status
    ambulance.timestamp = new Date().toISOString()
  }
}

export function removeAmbulanceLocation(id: string) {
  ambulanceLocations.delete(id)
}

export function getAllAmbulanceLocations() {
  return Array.from(ambulanceLocations.values())
}
