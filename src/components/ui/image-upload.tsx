"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  currentImage?: string
  label?: string
  required?: boolean
}

export function ImageUpload({ onImageSelect, currentImage, label = "Image", required = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleClick}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
          </div>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {!preview && (
        <Button type="button" variant="outline" onClick={handleClick} className="w-full bg-transparent">
          <Upload className="h-4 w-4 mr-2" />
          Choose Image
        </Button>
      )}
    </div>
  )
}
