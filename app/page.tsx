"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Wifi, WifiOff, Camera } from "lucide-react"
import ImageDisplay from "../components/image-display"
import WebSocketManager from "../components/websocket-manager"
import DoorControl from "../components/door-control"
import type { CapturedImage } from "../types/image"

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [images, setImages] = useState<CapturedImage[]>([])
  const [isDoorLocked, setIsDoorLocked] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const [wsUrl, setWsUrl] = useState<string>("")
  const [isPreview, setIsPreview] = useState(true)

  // Sample images for preview mode
  const sampleImages: CapturedImage[] = [
    {
      id: "1",
      imageData: "/diverse-person-faces.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "2",
      imageData: "/serene-woman.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: "3",
      imageData: "/man-face.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ]

  useEffect(() => {
    // Check if we're in a preview environment
    const isPreviewEnv =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("v0.dev"))

    setIsPreview(isPreviewEnv)

    // Use sample data in preview mode
    if (isPreviewEnv) {
      console.log("Running in preview mode with sample data")
      setImages(sampleImages)
      return // Don't attempt WebSocket connection in preview mode
    }

    // In production, use the actual WebSocket connection
    // We'll use a valid WebSocket URL format as a placeholder
    // This should be replaced with the actual Arduino WebSocket server address in production
    const serverUrl = "ws://localhost:8080"
    setWsUrl(serverUrl)

    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(serverUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connection established")
        setIsConnected(true)
      }

      ws.onclose = () => {
        console.log("WebSocket connection closed")
        setIsConnected(false)

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log("Attempting to reconnect...")
          try {
            if (wsRef.current) {
              const newWs = new WebSocket(serverUrl)
              wsRef.current = newWs
            }
          } catch (error) {
            console.error("Failed to reconnect:", error)
          }
        }, 5000)
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setIsConnected(false)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          if (data.type === "image") {
            // Add new image to the beginning of the array (newest first)
            const newImage: CapturedImage = {
              id: Date.now().toString(),
              imageData: data.imageData, // Base64 encoded image
              timestamp: data.timestamp || new Date().toISOString(),
            }

            setImages((prevImages) => [newImage, ...prevImages])
          } else if (data.type === "doorStatus") {
            setIsDoorLocked(data.locked)
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      // Use sample data as fallback
      setImages(sampleImages)
    }

    // Clean up WebSocket connection on component unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  const handleDoorControl = () => {
    if (isPreview) {
      // In preview mode, just toggle the state locally
      setIsDoorLocked(!isDoorLocked)
      return
    }

    // Check if WebSocket is available and connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        // Send door control command to Arduino
        wsRef.current.send(
          JSON.stringify({
            type: "doorControl",
            action: isDoorLocked ? "unlock" : "lock",
          }),
        )
      } catch (error) {
        console.error("Error sending door control command:", error)
        // Fallback: toggle state locally if sending fails
        setIsDoorLocked(!isDoorLocked)
      }
    } else {
      console.warn("WebSocket not connected, toggling door state locally")
      // Fallback: toggle state locally if WebSocket is not connected
      setIsDoorLocked(!isDoorLocked)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Face Recognition System</h1>
              <p className="text-muted-foreground mt-1">Real-time monitoring and door control</p>
              {isPreview && (
                <Badge variant="outline" className="mt-2">
                  Preview Mode - Using Sample Data
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isConnected || isPreview ? "default" : "destructive"} className="px-3 py-1">
                {isConnected || isPreview ? (
                  <>
                    <Wifi className="h-4 w-4 mr-1" /> Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 mr-1" /> Disconnected
                  </>
                )}
              </Badge>

              <Badge variant={isDoorLocked ? "outline" : "default"} className="px-3 py-1">
                {isDoorLocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-1" /> Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-1" /> Unlocked
                  </>
                )}
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Door Control Panel */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <DoorControl
                isLocked={isDoorLocked}
                isConnected={isConnected || isPreview}
                onToggle={handleDoorControl}
                isPreview={isPreview}
              />
            </CardContent>
          </Card>

          {/* WebSocket Status and Connection Manager */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <WebSocketManager
                isConnected={isConnected || isPreview}
                url={wsUrl || "Not connected in preview mode"}
                onReconnect={() => {
                  if (isPreview) return

                  if (wsRef.current) {
                    wsRef.current.close()
                    try {
                      const newWs = new WebSocket(wsUrl)
                      wsRef.current = newWs
                    } catch (error) {
                      console.error("Failed to reconnect:", error)
                    }
                  }
                }}
                isPreview={isPreview}
              />
            </CardContent>
          </Card>
        </div>

        {/* Image Display Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Camera className="mr-2 h-5 w-5" /> Captured Images
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              {images.length} {images.length === 1 ? "image" : "images"}
            </Badge>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ImageDisplay images={images} />
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No images captured yet</h3>
              <p className="mt-1 text-sm text-gray-500">Images will appear here when the system detects faces</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
