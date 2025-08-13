"use client"
import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Badge } from "./badge"
import { X, Plus } from "lucide-react"

interface ColorPickerProps {
  colors: string[]
  onColorsChange: (colors: string[]) => void
  label?: string
  required?: boolean
}

const predefinedColors = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#A52A2A", // Brown
  "#808080", // Gray
  "#000000", // Black
  "#FFFFFF", // White
  "#FFB6C1", // Light Pink
  "#90EE90", // Light Green
  "#87CEEB", // Sky Blue
  "#DDA0DD", // Plum
  "#F0E68C", // Khaki
  "#FF6347", // Tomato
  "#40E0D0", // Turquoise
]

export function ColorPicker({ colors, onColorsChange, label = "Colors", required = false }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState("#000000")
  const [isOpen, setIsOpen] = useState(false)

  const addColor = (color: string) => {
    if (!colors.includes(color)) {
      onColorsChange([...colors, color])
    }
    setIsOpen(false)
  }

  const removeColor = (colorToRemove: string) => {
    onColorsChange(colors.filter((color) => color !== colorToRemove))
  }

  const addCustomColor = () => {
    addColor(customColor)
  }

  const getColorName = (hex: string) => {
    const colorNames: { [key: string]: string } = {
      "#FF0000": "Red",
      "#00FF00": "Green",
      "#0000FF": "Blue",
      "#FFFF00": "Yellow",
      "#FF00FF": "Magenta",
      "#00FFFF": "Cyan",
      "#FFA500": "Orange",
      "#800080": "Purple",
      "#FFC0CB": "Pink",
      "#A52A2A": "Brown",
      "#808080": "Gray",
      "#000000": "Black",
      "#FFFFFF": "White",
    }
    return colorNames[hex.toUpperCase()] || hex
  }

  return (
    <div className="space-y-3">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Selected Colors */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <Badge key={index} variant="outline" className="flex items-center gap-2 pr-1">
            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color }} />
            <span className="text-xs">{getColorName(color)}</span>
            <button type="button" onClick={() => removeColor(color)} className="ml-1 hover:text-red-500">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Color Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Select Color</h4>

            {/* Predefined Colors */}
            <div>
              <Label className="text-sm">Predefined Colors</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => addColor(color)}
                    title={getColorName(color)}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div>
              <Label className="text-sm">Custom Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={addCustomColor}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {colors.length === 0 && required && <p className="text-sm text-red-500">At least one color is required</p>}
    </div>
  )
}
