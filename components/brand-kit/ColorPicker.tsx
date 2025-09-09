'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ColorValue } from '@/types/brand-kit'

interface ColorPickerProps {
  color: ColorValue
  onChange: (color: ColorValue) => void
  onDelete?: () => void
  showDelete?: boolean
  label?: string
  className?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onDelete,
  showDelete = false,
  label,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [value, setValue] = useState(1)
  const [alpha, setAlpha] = useState(1)
  const [hex, setHex] = useState('#000000')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Safety check for color object
  if (!color || typeof color !== 'object') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label || 'Color'}
          </label>
        </div>
        <div className="text-sm text-gray-500">Invalid color data</div>
      </div>
    )
  }

  // Predefined color palette
  const colorPalette = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#008000', '#000080', '#800000', '#808000', '#008080'
  ]

  useEffect(() => {
    // Convert hex to HSV when component mounts or color changes
    const { h, s, v } = hexToHsv(color.hex)
    setHue(h)
    setSaturation(s)
    setValue(v)
    setHex(color.hex)
  }, [color.hex])

  const hexToHsv = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    let s = max === 0 ? 0 : diff / max
    let v = max

    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff) % 6
          break
        case g:
          h = (b - r) / diff + 2
          break
        case b:
          h = (r - g) / diff + 4
          break
      }
      h = h * 60
      if (h < 0) h += 360
    }

    return { h, s, v }
  }

  const hsvToHex = (h: number, s: number, v: number) => {
    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')

    return `#${rHex}${gHex}${bHex}`
  }

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value)
    setHue(newHue)
    const newHex = hsvToHex(newHue, saturation, value)
    setHex(newHex)
    updateColor(newHex)
  }

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSaturation = parseInt(e.target.value) / 100
    setSaturation(newSaturation)
    const newHex = hsvToHex(hue, newSaturation, value)
    setHex(newHex)
    updateColor(newHex)
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) / 100
    setValue(newValue)
    const newHex = hsvToHex(hue, saturation, newValue)
    setHex(newHex)
    updateColor(newHex)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    if (newHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      setHex(newHex)
      updateColor(newHex)
    }
  }

  const updateColor = (newHex: string) => {
    onChange({
      ...color,
      hex: newHex,
      rgb: hexToRgb(newHex),
      hsl: hexToHsl(newHex)
    })
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '0, 0, 0'
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `${r}, ${g}, ${b}`
  }

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex).split(', ').map(Number)
    const r = rgb[0] / 255
    const g = rgb[1] / 255
    const b = rgb[2] / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }

      h /= 6
    }

    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
  }

  const handleColorClick = (paletteColor: string) => {
    setHex(paletteColor)
    updateColor(paletteColor)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="relative" ref={pickerRef}>
        {/* Color Preview Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-10 border border-gray-300 rounded-md flex items-center justify-between px-3 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-sm font-mono">{color.hex}</span>
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Color Picker Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-[280px]">
            {/* Main Color Square */}
            <div className="mb-4">
              <div 
                className="w-full h-32 rounded-lg border border-gray-300 relative cursor-crosshair"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 50%))`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const newSaturation = x / rect.width
                  const newValue = 1 - (y / rect.height)
                  setSaturation(newSaturation)
                  setValue(newValue)
                  const newHex = hsvToHex(hue, newSaturation, newValue)
                  setHex(newHex)
                  updateColor(newHex)
                }}
              >
                <div 
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${saturation * 100}%`,
                    top: `${(1 - value) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Hue Slider */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Hue</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-magenta-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`
                }}
              />
            </div>

            {/* Saturation and Value Sliders */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Saturation</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={saturation * 100}
                  onChange={handleSaturationChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Value</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value * 100}
                  onChange={handleValueChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Hex Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">HEX</label>
              <Input
                value={hex}
                onChange={handleHexChange}
                className="text-sm font-mono"
                placeholder="#000000"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Quick Colors</label>
              <div className="grid grid-cols-5 gap-2">
                {colorPalette.map((paletteColor) => (
                  <button
                    key={paletteColor}
                    onClick={() => handleColorClick(paletteColor)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      hex === paletteColor ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    title={paletteColor}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorPicker
