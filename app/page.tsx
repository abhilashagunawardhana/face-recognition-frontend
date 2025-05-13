"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Wifi, WifiOff, Camera, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import ImageDisplay from "@/components/image-display"
import DoorControl from "@/components/door-control"
import type { CapturedImage } from "@/types/image"

export default function Home() {
  const [isConnected, setIsConnected] = useState(true)
  const [images, setImages] = useState<CapturedImage[]>([])
  const [isDoorLocked, setIsDoorLocked] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(true)

  // Backend API URL - replace with your Flask server address
  const API_URL = "http://192.168.89.2:5000"

  // Sample images for preview mode
  const sampleImages: CapturedImage[] = [
    {
      id: "1",
      imageData: "/diverse-person-faces.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      name: "Melanka",
    },
    {
      id: "2",
      imageData: "/serene-woman.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      name: "Unknown",
    },
    {
      id: "3",
      imageData: "/man-face.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      name: "Melanka",
    },
  ]

  // Function to fetch images from the backend
  const fetchImages = async () => {
    if (isPreview) {
      setImages(sampleImages)
      return
    }

    setIsLoading(true)
    try {
      // This endpoint doesn't exist in your current backend
      // You'll need to add it later without modifying existing code
      const response = await fetch(`${API_URL}/images`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      // Transform the data to match our CapturedImage type
      const formattedImages: CapturedImage[] = data.images.map((img: any) => ({
        id: img.filename,
        imageData: `${API_URL}/uploads/${img.filename}`,
        timestamp: img.timestamp || new Date().toISOString(),
        name: img.name || extractNameFromFilename(img.filename),
      }))

      setImages(formattedImages)
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to fetch images:", error)
      setIsConnected(false)

      // In case of error, use sample data in development
      if (process.env.NODE_ENV === "development") {
        setImages(sampleImages)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Extract name from filename (e.g., "detected_face_Melanka_20230515_123456.jpg")
  const extractNameFromFilename = (filename: string): string => {
    if (filename.includes("detected_face_")) {
      const parts = filename.split("_")
      if (parts.length >= 3) {
        return parts[2] // This should be the name part
      }
    }
    return "Unknown"
  }

  // Function to control the door
  const handleDoorControl = async () => {
    if (isPreview) {
      // In preview mode, just toggle the state locally
      setIsDoorLocked(!isDoorLocked)
      return
    }

    try {
      // This endpoint doesn't exist in your current backend
      // You'll need to add it later without modifying existing code
      const response = await fetch(`${API_URL}/door-control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isDoorLocked ? "unlock" : "lock",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // Toggle door state on successful response
      setIsDoorLocked(!isDoorLocked)
    } catch (error) {
      console.error("Failed to control door:", error)
      // Fallback: toggle state locally if API call fails
      setIsDoorLocked(!isDoorLocked)
    }
  }

  useEffect(() => {
    // Check if we're in a preview environment
    const isPreviewEnv =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("v0.dev"))

    setIsPreview(isPreviewEnv)

    // Initial fetch
    fetchImages()

    // Set up polling for new images (every 5 seconds)
    // This is a workaround since we're not modifying the backend to add WebSockets
    const intervalId = setInterval(() => {
      fetchImages()
    }, 5000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

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
              <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
                {isConnected ? (
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

              <Button variant="outline" size="icon" onClick={fetchImages} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Door Control Panel */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <DoorControl
                isLocked={isDoorLocked}
                isConnected={isConnected}
                onToggle={handleDoorControl}
                isPreview={isPreview}
              />
            </CardContent>
          </Card>

          {/* Backend Status */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Backend Status</h2>
                  <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="p-4 bg-gray-50 rounded-md border">
                  <h3 className="text-sm font-medium mb-2">Flask Server</h3>
                  <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">{API_URL}</code>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isPreview
                      ? "In production, replace this with your Flask server address."
                      : "This is the address of your Flask server. Make sure it's accessible from this device."}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                  <h3 className="text-sm font-medium mb-2 text-yellow-800">Required Backend Endpoints</h3>
                  <p className="text-xs text-yellow-700">
                    Your current backend needs these additional endpoints (to be added later):
                  </p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside mt-2 space-y-1">
                    <li>
                      <code>/images</code> - GET endpoint to list all captured images
                    </li>
                    <li>
                      <code>/uploads/{"{filename}"}</code> - GET endpoint to serve image files
                    </li>
                    <li>
                      <code>/door-control</code> - POST endpoint to control the door lock
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Display Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Camera className="mr-2 h-5 w-5" /> Captured Faces
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              {images.length} {images.length === 1 ? "image" : "images"}
            </Badge>
          </div>

          {isLoading && images.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-4 text-lg font-medium">Loading images...</h3>
            </div>
          ) : images.length > 0 ? (
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
