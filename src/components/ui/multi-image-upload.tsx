"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Upload, X, ImageIcon, Plus } from "lucide-react"

export function MultiImageUpload({
  onImagesSelect,
  currentImages = [],
  label = "Product Images",
  required = false,
  maxImages = 10,
}: {
  onImagesSelect: (files: File[]) => void
  currentImages?: string[]
  label?: string
  required?: boolean
  maxImages?: number
}) {
  const [previews, setPreviews] = useState<string[]>(currentImages)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImageFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (previews.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    try {
      const newPreviews: string[] = []
      const newFiles: File[] = []

      // Process files sequentially
      for (const file of files) {
        const preview = await processImageFile(file)
        newPreviews.push(preview)
        newFiles.push(file)
      }

      setPreviews(prev => [...prev, ...newPreviews])
      const updatedFiles = [...selectedFiles, ...newFiles]
      setSelectedFiles(updatedFiles)
      onImagesSelect(updatedFiles)
    } catch (error) {
      console.error("Error processing images:", error)
      alert("Error processing images. Please try again.")
    }
  }

  const handleRemove = (index: number) => {
    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)

    if (index >= currentImages.length) {
      const newFiles = [...selectedFiles]
      newFiles.splice(index - currentImages.length, 1)
      setSelectedFiles(newFiles)
      onImagesSelect(newFiles)
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
        <span className="text-sm text-gray-500 ml-2">
          ({previews.length}/{maxImages})
        </span>
      </Label>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {previews.length < maxImages && (
        <>
          <div
            className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-accent/10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <div className="size-12 flex items-center justify-center bg-accent/10 rounded-full">
                {previews.length ? (
                  <Plus className="size-5 text-muted-foreground" />
                ) : (
                  <ImageIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {previews.length ? "Add more images" : "Click to upload images"}
              </p>
              <p className="text-xs text-muted-foreground/70">PNG, JPG, WEBP up to 5MB each</p>
            </div>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="size-4 mr-2" />
            {previews.length ? "Add More Images" : "Choose Images"}
          </Button>
        </>
      )}
    </div>
  )
}