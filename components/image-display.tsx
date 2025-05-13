"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Maximize2, Download, User } from "lucide-react"
import type { CapturedImage } from "@/types/image"

interface ImageDisplayProps {
  images: CapturedImage[]
}

export default function ImageDisplay({ images }: ImageDisplayProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Invalid date format:", error)
      return "Unknown date"
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString()
    } catch (error) {
      console.error("Invalid time format:", error)
      return "Unknown time"
    }
  }

  const handleExpandImage = (imageId: string) => {
    setExpandedImage(imageId === expandedImage ? null : imageId)
  }

  const handleDownloadImage = (image: CapturedImage) => {
    try {
      // For placeholder images, we can't download them directly
      if (image.imageData.startsWith("/placeholder")) {
        alert("Cannot download placeholder images in preview mode.")
        return
      }

      // Create a download link for the image
      const link = document.createElement("a")
      link.href = image.imageData
      link.download = `face-capture-${new Date(image.timestamp).toISOString().replace(/:/g, "-")}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
      alert("Failed to download image.")
    }
  }

  return (
    <>
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={image.imageData || "/placeholder.svg"}
                alt={`Captured face at ${formatDate(image.timestamp)} ${formatTime(image.timestamp)}`}
                className="w-full h-auto object-cover aspect-video"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = "/error-loading-abstract.png"
                }}
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => handleExpandImage(image.id)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {/* Recognition badge */}
              <Badge
                className={`absolute bottom-2 left-2 ${
                  image.name === "Unknown" ? "bg-yellow-500" : image.name === "Melanka" ? "bg-green-500" : "bg-blue-500"
                }`}
              >
                <User className="h-3 w-3 mr-1" />
                {image.name || "Unknown"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="p-3 flex flex-col items-start">
            <div className="flex justify-between w-full">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>{formatDate(image.timestamp)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{formatTime(image.timestamp)}</span>
              </div>
            </div>
            <div className="mt-2 w-full">
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadImage(image)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {/* Image Modal for expanded view */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={images.find((img) => img.id === expandedImage)?.imageData || "/placeholder.svg"}
                alt="Expanded view"
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = "/error-loading-abstract.png"
                }}
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => setExpandedImage(null)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Captured on{" "}
                  {expandedImage && formatDate(images.find((img) => img.id === expandedImage)?.timestamp || "")} at{" "}
                  {expandedImage && formatTime(images.find((img) => img.id === expandedImage)?.timestamp || "")}
                </p>

                <Badge
                  className={`${
                    expandedImage && images.find((img) => img.id === expandedImage)?.name === "Unknown"
                      ? "bg-yellow-500"
                      : expandedImage && images.find((img) => img.id === expandedImage)?.name === "Melanka"
                        ? "bg-green-500"
                        : "bg-blue-500"
                  }`}
                >
                  <User className="h-3 w-3 mr-1" />
                  {expandedImage && (images.find((img) => img.id === expandedImage)?.name || "Unknown")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
