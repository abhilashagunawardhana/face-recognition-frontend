export interface CapturedImage {
  id: string
  imageData: string // URL or Base64 encoded image
  timestamp: string
  name?: string // Name of the recognized person
}
