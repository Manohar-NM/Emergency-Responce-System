// Real-time notification management

export interface Notification {
  id: string
  type: "sos" | "alert" | "update" | "success" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: Record<string, any>
}

export interface NotificationService {
  subscribe: (callback: (notification: Notification) => void) => () => void
  send: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  getAll: () => Notification[]
  clear: () => void
}

class NotificationManager implements NotificationService {
  private notifications: Notification[] = []
  private subscribers: Set<(notification: Notification) => void> = new Set()

  subscribe(callback: (notification: Notification) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  send(notification: Omit<Notification, "id" | "timestamp" | "read">) {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(newNotification)

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Notify all subscribers
    this.subscribers.forEach((callback) => callback(newNotification))

    // Request notification permission and show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: "/favicon.ico",
        tag: newNotification.id,
      })
    }
  }

  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  getAll() {
    return [...this.notifications]
  }

  clear() {
    this.notifications = []
  }
}

export const notificationService = new NotificationManager()

// Request notification permission
export const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }
  return Notification.permission === "granted"
}
