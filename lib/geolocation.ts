// Geolocation utility functions

export interface LocationCoordinates {
  latitude: number
  longitude: number
  accuracy: number
}

export interface GeolocationError {
  code: number
  message: string
}

export const getLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "Geolocation is not supported by this browser",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}

export const watchLocation = (
  onSuccess: (location: LocationCoordinates) => void,
  onError: (error: GeolocationError) => void,
): number => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: "Geolocation is not supported by this browser",
    })
    return -1
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
    },
    (error) => {
      onError({
        code: error.code,
        message: error.message,
      })
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  )
}

export const stopWatchingLocation = (watchId: number): void => {
  if (watchId >= 0) {
    navigator.geolocation.clearWatch(watchId)
  }
}

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
