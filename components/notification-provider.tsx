"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { notificationService, type Notification, requestNotificationPermission } from "@/lib/notifications"

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission()

    // Subscribe to local notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev])
    })

    let pollInterval: NodeJS.Timeout | null = null
    let lastNotificationId = ""

    const pollNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/poll?lastId=${lastNotificationId}`)

        if (!response.ok) {
          console.error("[v0] Poll failed with status:", response.status)
          setIsConnected(false)
          return
        }

        setIsConnected(true)
        const data = await response.json()

        if (data.notifications && Array.isArray(data.notifications)) {
          data.notifications.forEach((notification: any) => {
            if (notification.id) {
              lastNotificationId = notification.id
            }
            notificationService.send({
              type: notification.type || "alert",
              title: notification.title,
              message: notification.message,
              data: notification.data,
            })
          })
        }
      } catch (error) {
        console.error("[v0] Poll error:", error)
        setIsConnected(false)
      }
    }

    // Initial poll
    pollNotifications()

    // Poll every 3 seconds
    pollInterval = setInterval(pollNotifications, 3000)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      unsubscribe()
    }
  }, [])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    notificationService.send(notification)
  }

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearNotifications = () => {
    notificationService.clear()
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
