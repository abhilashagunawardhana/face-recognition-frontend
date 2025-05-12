"use client"

import { Button } from "@/components/ui/button"
import { Lock, Unlock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DoorControlProps {
  isLocked: boolean
  isConnected: boolean
  onToggle: () => void
  isPreview?: boolean
}

export default function DoorControl({ isLocked, isConnected, onToggle, isPreview = false }: DoorControlProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Door Control</h2>
        <p className="text-sm text-muted-foreground">Manually control the door lock status</p>
        {isPreview && (
          <Badge variant="outline" className="mt-2">
            Preview Mode
          </Badge>
        )}
      </div>

      <div className="flex justify-center py-6">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
            isLocked ? "border-red-500 bg-red-100" : "border-green-500 bg-green-100"
          }`}
        >
          {isLocked ? <Lock className="h-16 w-16 text-red-500" /> : <Unlock className="h-16 w-16 text-green-500" />}
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-medium mb-4">Door is currently {isLocked ? "Locked" : "Unlocked"}</p>

        <Button
          size="lg"
          variant={isLocked ? "default" : "outline"}
          className={`w-full ${isLocked ? "bg-green-600 hover:bg-green-700" : "border-red-500 text-red-500 hover:bg-red-50"}`}
          onClick={onToggle}
          disabled={!isConnected && !isPreview}
        >
          {isLocked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Door
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Lock Door
            </>
          )}
        </Button>
      </div>

      {!isConnected && !isPreview && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-700">Door control unavailable while disconnected from the system</p>
        </div>
      )}

      {isPreview && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            In preview mode, door control is simulated and not connected to actual hardware.
          </p>
        </div>
      )}
    </div>
  )
}
