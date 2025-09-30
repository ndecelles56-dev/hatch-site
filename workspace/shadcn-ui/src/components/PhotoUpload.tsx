import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  minPhotos?: number
  maxPhotos?: number
}

export default function PhotoUpload({ 
  photos = [], 
  onPhotosChange, 
  minPhotos = 4, 
  maxPhotos = 20 
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    if (photos.length + imageFiles.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed. You can upload ${maxPhotos - photos.length} more photos.`)
      return
    }

    const newPhotoUrls: string[] = []
    imageFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      newPhotoUrls.push(url)
    })

    onPhotosChange([...photos, ...newPhotoUrls])
  }, [photos, onPhotosChange, maxPhotos])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const hasMinPhotos = photos.length >= minPhotos

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Upload Property Photos
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Drag and drop photos here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button type="button" variant="outline" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Photos
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            {photos.length}/{maxPhotos} photos • JPG, PNG up to 5MB each
          </p>
        </div>
      )}

      {/* Photo Requirements Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hasMinPhotos ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm ${hasMinPhotos ? 'text-green-700' : 'text-red-700'}`}>
            {photos.length} of {minPhotos} minimum photos uploaded
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photo}
                  alt={`Property photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                onClick={() => removePhoto(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {!hasMinPhotos && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You need at least {minPhotos - photos.length} more photo{minPhotos - photos.length !== 1 ? 's' : ''} 
            to meet MLS requirements.
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      {photos.length === 0 && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Photo Requirements:</strong> Upload high-quality photos of the property. 
            The first photo will be used as the main listing image. 
            Minimum {minPhotos} photos required for MLS compliance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}