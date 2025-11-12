"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react"
import { useNotifications } from "./notification-provider"

export function NotificationCenter() {
  const { notifications, markAsRead, clearNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-primary" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-accent" />
      case "sos":
        return <AlertCircle className="w-5 h-5 text-accent animate-pulse" />
      default:
        return <Info className="w-5 h-5 text-secondary" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-primary/5 border-primary/20"
      case "error":
        return "bg-accent/5 border-accent/20"
      case "sos":
        return "bg-accent/10 border-accent/30"
      default:
        return "bg-secondary/5 border-secondary/20"
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-muted rounded-lg transition-smooth">
        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-smooth" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 bg-card border border-border rounded-lg shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                onClick={clearNotifications}
                variant="outline"
                size="sm"
                className="transition-smooth bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-smooth ${getNotificationBg(notification.type)} ${
                      !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
