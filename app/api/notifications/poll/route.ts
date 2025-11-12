import { type NextRequest, NextResponse } from "next/server"

// In-memory notification queue (in production, use a database)
const notificationQueue: Array<{
  id: string
  type: string
  title: string
  message: string
  data?: any
  timestamp: number
}> = []

export async function GET(request: NextRequest) {
  const lastId = request.nextUrl.searchParams.get("lastId") || ""

  // Find notifications after the last ID
  let notifications = notificationQueue

  if (lastId) {
    const lastIndex = notificationQueue.findIndex((n) => n.id === lastId)
    if (lastIndex !== -1) {
      notifications = notificationQueue.slice(lastIndex + 1)
    }
  }

  return NextResponse.json({
    notifications: notifications.slice(-10), // Return last 10 notifications
  })
}

// Function to add notification to queue (called from other routes)
export function addNotificationToQueue(notification: {
  type: string
  title: string
  message: string
  data?: any
}) {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  notificationQueue.push({
    id,
    ...notification,
    timestamp: Date.now(),
  })

  // Keep queue size manageable (max 100 notifications)
  if (notificationQueue.length > 100) {
    notificationQueue.shift()
  }
}
