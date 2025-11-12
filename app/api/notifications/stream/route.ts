import { type NextRequest, NextResponse } from "next/server"

// Store active SSE connections
const activeConnections = new Set<ReadableStreamDefaultController<Uint8Array>>()

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Add connection to active set
      activeConnections.add(controller)
      console.log("[v0] SSE client connected. Total connections:", activeConnections.size)

      // Send initial connection confirmation
      try {
        controller.enqueue(encoder.encode(":connected\n\n"))
      } catch (error) {
        console.error("[v0] Error sending initial message:", error)
        activeConnections.delete(controller)
        controller.close()
        return
      }

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":heartbeat\n\n"))
        } catch (error) {
          console.error("[v0] Heartbeat error:", error)
          clearInterval(heartbeatInterval)
          activeConnections.delete(controller)
        }
      }, 30000)

      // Handle client disconnect
      const cleanup = () => {
        clearInterval(heartbeatInterval)
        activeConnections.delete(controller)
        console.log("[v0] SSE client disconnected. Total connections:", activeConnections.size)
      }

      request.signal.addEventListener("abort", cleanup)
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

// Broadcast notification to all connected clients
export function broadcastNotification(notification: any) {
  const encoder = new TextEncoder()
  const message = `data: ${JSON.stringify(notification)}\n\n`

  console.log("[v0] Broadcasting to", activeConnections.size, "connections")

  activeConnections.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(message))
    } catch (error) {
      console.error("[v0] Error broadcasting to client:", error)
      activeConnections.delete(controller)
    }
  })
}
