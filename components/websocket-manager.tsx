"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Info } from "lucide-react"

interface WebSocketManagerProps {
  isConnected: boolean
  url: string
  onReconnect: () => void
  isPreview?: boolean
}

export default function WebSocketManager({ isConnected, url, onReconnect, isPreview = false }: WebSocketManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connection Status</h2>
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
      </div>

      {isPreview ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Preview Mode Active</AlertTitle>
          <AlertDescription>
            Running in preview mode with sample data. No actual WebSocket connection is established. In production,
            replace the WebSocket URL with your Arduino's address.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant={isConnected ? "default" : "destructive"}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <AlertTitle>
                {isConnected ? "WebSocket Connection Established" : "WebSocket Connection Failed"}
              </AlertTitle>
              <AlertDescription>
                {isConnected
                  ? "Successfully connected to the Arduino system. Images will appear in real-time as they are captured."
                  : "Unable to connect to the Arduino system. Please check that your Arduino is online and the WebSocket server is running."}
              </AlertDescription>
            </div>

            {!isConnected && (
              <Button variant="outline" className="whitespace-nowrap" onClick={onReconnect}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
          </div>
        </Alert>
      )}

      <div className="p-4 bg-gray-50 rounded-md border">
        <h3 className="text-sm font-medium mb-2">WebSocket Server</h3>
        <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
          {isPreview ? "Not connected in preview mode" : url}
        </code>
        <p className="text-xs text-muted-foreground mt-2">
          {isPreview
            ? "In production, replace the WebSocket URL with your Arduino's address (e.g., ws://192.168.1.100:8080)."
            : "This is the address of your Arduino WebSocket server. Make sure it matches your Arduino's IP address and port."}
        </p>
      </div>
    </div>
  )
}
