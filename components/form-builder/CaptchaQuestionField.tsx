'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Calculator, 
  Image, 
  Puzzle, 
  Type, 
  MessageSquare,
  Eye,
  EyeOff,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Settings,
  Palette,
  Check
} from 'lucide-react'

// Type definitions for CAPTCHA question field
export type CaptchaQuestionType = 'text' | 'math' | 'image' | 'puzzle' | 'audio' | 'slider' | 'checkbox' | 'color' | 'word' | 'sequence' | 'recaptcha'
export type CaptchaDifficulty = 'easy' | 'medium' | 'hard'

export interface CaptchaQuestionField {
  // Question-specific settings
  type: CaptchaQuestionType
  difficulty: CaptchaDifficulty
  questionText: string
  customInstructions: string
  
  // Behavior settings
  caseSensitive: boolean
  maxAttempts: number
  timeLimit: number
  allowRetry: boolean
  
  // Visual settings
  textColor: string
  backgroundColor: string
  fontSize: number
}

interface CaptchaTypeInfo {
  id: CaptchaQuestionType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  examples: string[]
  color: string
  defaultQuestion: string
}

const captchaTypes: CaptchaTypeInfo[] = [
  {
    id: 'recaptcha',
    label: 'reCAPTCHA-style',
    description: 'Click to verify (modern single-tap)',
    icon: Shield,
    examples: ['Click to verify'],
    color: 'bg-emerald-500',
    defaultQuestion: 'Please verify you are human'
  },
  {
    id: 'text',
    label: 'Text CAPTCHA',
    description: 'Users type characters from a distorted image',
    icon: Type,
    examples: ['Enter: A7B9C', 'Type: 3K8M2', 'Input: X5Y1Z'],
    color: 'bg-blue-500',
    defaultQuestion: 'Please enter the characters you see in the image above'
  },
  {
    id: 'math',
    label: 'Math Challenge',
    description: 'Solve simple mathematical equations',
    icon: Calculator,
    examples: ['5 + 3 = ?', '12 - 7 = ?', '4 × 2 = ?'],
    color: 'bg-green-500',
    defaultQuestion: 'Please solve the following equation'
  },
  {
    id: 'image',
    label: 'Image Recognition',
    description: 'Select images matching a description',
    icon: Image,
    examples: ['Click all cars', 'Select traffic lights', 'Find animals'],
    color: 'bg-purple-500',
    defaultQuestion: 'Please select all images that match the description'
  },
  {
    id: 'puzzle',
    label: 'Puzzle Challenge',
    description: 'Complete simple puzzles or patterns',
    icon: Puzzle,
    examples: ['Drag to complete', 'Arrange in order', 'Match pairs'],
    color: 'bg-orange-500',
    defaultQuestion: 'Please complete the puzzle below'
  },
  {
    id: 'audio',
    label: 'Audio CAPTCHA',
    description: 'Listen and type what you hear',
    icon: MessageSquare,
    examples: ['Listen: "ABC123"', 'Audio: "Hello World"', 'Sound: "Test123"'],
    color: 'bg-red-500',
    defaultQuestion: 'Please listen to the audio and type what you hear'
  },
  {
    id: 'slider',
    label: 'Slider Verification',
    description: 'Slide to verify you are human',
    icon: RefreshCw,
    examples: ['Slide to verify', 'Drag to complete', 'Move slider'],
    color: 'bg-indigo-500',
    defaultQuestion: 'Please slide the bar to verify you are human'
  },
  {
    id: 'checkbox',
    label: 'Checkbox CAPTCHA',
    description: 'Simple checkbox with verification',
    icon: Shield,
    examples: ['I\'m not a robot', 'Verify humanity', 'Check to continue'],
    color: 'bg-teal-500',
    defaultQuestion: 'Please check the box to verify you are human'
  },
  {
    id: 'color',
    label: 'Color Recognition',
    description: 'Identify colors or color patterns',
    icon: Eye,
    examples: ['Click red squares', 'Find blue circles', 'Select green items'],
    color: 'bg-pink-500',
    defaultQuestion: 'Please identify the colors as requested'
  },
  {
    id: 'word',
    label: 'Word Association',
    description: 'Complete phrases or word associations',
    icon: Type,
    examples: ['Complete: "The sky is..."', 'Finish: "Happy..."', 'Match: "Hot - Cold"'],
    color: 'bg-yellow-500',
    defaultQuestion: 'Please complete the word association'
  },
  {
    id: 'sequence',
    label: 'Sequence Memory',
    description: 'Remember and repeat sequences',
    icon: Clock,
    examples: ['Remember: 1-2-3', 'Repeat: A-B-C', 'Follow: Red-Blue-Green'],
    color: 'bg-cyan-500',
    defaultQuestion: 'Please remember and repeat the sequence'
  }
]

const difficultyLevels = [
  { value: 'easy', label: 'Easy', description: 'Simple challenges, 3 attempts' },
  { value: 'medium', label: 'Medium', description: 'Moderate difficulty, 2 attempts' },
  { value: 'hard', label: 'Hard', description: 'Complex challenges, 1 attempt' }
]

interface CaptchaQuestionFieldProps {
  field: CaptchaQuestionField
  onChange: (field: CaptchaQuestionField) => void
}

export function CaptchaQuestionField({ field, onChange }: CaptchaQuestionFieldProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['type', 'basic']))

  const updateField = (updates: Partial<CaptchaQuestionField>) => {
    onChange({ ...field, ...updates })
  }

  const getCurrentTypeInfo = () => captchaTypes.find(type => type.id === field.type)!

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const isSectionExpanded = (section: string) => expandedSections.has(section)

  const renderSectionHeader = (title: string, section: string, icon: React.ReactNode) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 transition-colors rounded-lg"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {isSectionExpanded(section) ? (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500" />
      )}
    </button>
  )

  const renderTypeSelection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">CAPTCHA Type</h3>
        <Badge variant="outline" className="text-xs">
          {getCurrentTypeInfo().label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {captchaTypes.map((typeInfo) => {
          const isSelected = field.type === typeInfo.id
          const Icon = typeInfo.icon

          return (
                <button
              key={typeInfo.id}
              onClick={() => {
                updateField({ 
                  type: typeInfo.id,
                  questionText: typeInfo.defaultQuestion
                })
              }}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className={`p-1 rounded ${typeInfo.color} text-white`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium">{typeInfo.label}</span>
                  </div>
              <p className="text-xs text-gray-500 leading-tight">
                      {typeInfo.description}
                    </p>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderBasicSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <textarea
          value={field.questionText}
          onChange={(e) => updateField({ questionText: e.target.value })}
          placeholder="Enter the question text that will be displayed to users"
          className="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Instructions (Optional)
        </label>
        <textarea
          value={field.customInstructions}
          onChange={(e) => updateField({ customInstructions: e.target.value })}
          placeholder="Enter additional instructions for users"
          className="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <Select 
          value={field.difficulty} 
          onValueChange={(value: string) => updateField({ difficulty: value as CaptchaDifficulty })}
        >
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {difficultyLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{level.label}</span>
                  <span className="text-xs text-gray-500">{level.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderBehaviorSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Attempts
          </label>
        <Input
          type="number"
          min="1"
          max="5"
          value={field.maxAttempts}
          onChange={(e) => updateField({ maxAttempts: parseInt(e.target.value) || 1 })}
            className="text-sm"
        />
      </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (sec)
          </label>
        <Input
          type="number"
          min="30"
          max="300"
          step="30"
          value={field.timeLimit}
          onChange={(e) => updateField({ timeLimit: parseInt(e.target.value) || 60 })}
            className="text-sm"
        />
        </div>
      </div>

      <div className="space-y-3">
      <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Case Sensitive</label>
            <p className="text-xs text-gray-500">Require exact case matching</p>
        </div>
        <input
          type="checkbox"
          checked={field.caseSensitive}
          onChange={(e) => updateField({ caseSensitive: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
      </div>

      <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Allow Retry</label>
            <p className="text-xs text-gray-500">Allow users to retry after incorrect attempts</p>
        </div>
        <input
          type="checkbox"
          checked={field.allowRetry}
          onChange={(e) => updateField({ allowRetry: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        </div>
      </div>
    </div>
  )

  const renderVisualSettings = () => {
    const presetColors = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
      '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
      '#008000', '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0'
    ]

    // Convert hex to HSL
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

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

      return { h: h * 360, s: s * 100, l: l * 100 }
    }

    // Convert HSL to hex
    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360
      s /= 100
      l /= 100

      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs((h * 6) % 2 - 1))
      const m = l - c / 2
      let r = 0, g = 0, b = 0

      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0
      } else if (1/6 <= h && h < 1/3) {
        r = x; g = c; b = 0
      } else if (1/3 <= h && h < 1/2) {
        r = 0; g = c; b = x
      } else if (1/2 <= h && h < 2/3) {
        r = 0; g = x; b = c
      } else if (2/3 <= h && h < 5/6) {
        r = x; g = 0; b = c
      } else if (5/6 <= h && h <= 1) {
        r = c; g = 0; b = x
      }

      const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
      const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
      const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')

      return `#${rHex}${gHex}${bHex}`
    }

    const AdvancedColorPicker = ({ 
      value, 
      onChange, 
      label 
    }: { 
      value: string
      onChange: (color: string) => void
      label: string
    }) => {
      const [isOpen, setIsOpen] = useState(false)
      const [colorHistory, setColorHistory] = useState<string[]>([])
      const [currentHsl, setCurrentHsl] = useState(hexToHsl(value))
      const [activeTab, setActiveTab] = useState<'picker' | 'presets' | 'history'>('picker')
      const [isDragging, setIsDragging] = useState(false)

      const addToHistory = (color: string) => {
        const newHistory = [color, ...colorHistory.filter(c => c !== color)].slice(0, 10)
        setColorHistory(newHistory)
      }

      const handleColorChange = (color: string) => {
        onChange(color)
        addToHistory(color)
        setCurrentHsl(hexToHsl(color))
      }

      const handleHslChange = (h?: number, s?: number, l?: number) => {
        const newHsl = {
          h: h ?? currentHsl.h,
          s: s ?? currentHsl.s,
          l: l ?? currentHsl.l
        }
        setCurrentHsl(newHsl)
        const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l)
        handleColorChange(newHex)
      }

      // Moveable Color Navigator
      const ColorNavigator = () => {
        const navigatorRef = useRef<HTMLDivElement>(null)
        const [navigatorSize] = useState(200)

        const getColorFromPosition = (x: number, y: number) => {
          const centerX = navigatorSize / 2
          const centerY = navigatorSize / 2
          const deltaX = x - centerX
          const deltaY = y - centerY
          
          // Calculate hue from angle
          const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
          const hue = (angle + 360) % 360
          
          // Calculate saturation from distance from center
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const maxDistance = navigatorSize / 2
          const saturation = Math.min((distance / maxDistance) * 100, 100)
          
          return { h: hue, s: saturation, l: currentHsl.l }
        }

        const handleNavigatorClick = (e: React.MouseEvent) => {
          if (!navigatorRef.current) return
          const rect = navigatorRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const color = getColorFromPosition(x, y)
          handleHslChange(color.h, color.s, color.l)
        }

        const handleNavigatorMouseDown = (e: React.MouseEvent) => {
          setIsDragging(true)
          handleNavigatorClick(e)
        }

        const handleNavigatorMouseMove = (e: React.MouseEvent) => {
          if (!isDragging) return
          handleNavigatorClick(e)
        }

        const handleNavigatorMouseUp = () => {
          setIsDragging(false)
        }

        // Add global mouse event listeners
        useEffect(() => {
          if (isDragging) {
            const handleGlobalMouseMove = (e: MouseEvent) => {
              if (!navigatorRef.current) return
              const rect = navigatorRef.current.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              const color = getColorFromPosition(x, y)
              handleHslChange(color.h, color.s, color.l)
            }

            const handleGlobalMouseUp = () => {
              setIsDragging(false)
            }

            document.addEventListener('mousemove', handleGlobalMouseMove)
            document.addEventListener('mouseup', handleGlobalMouseUp)

            return () => {
              document.removeEventListener('mousemove', handleGlobalMouseMove)
              document.removeEventListener('mouseup', handleGlobalMouseUp)
            }
          }
        }, [isDragging, currentHsl.l])

        // Calculate picker position
        const pickerX = (currentHsl.s / 100) * Math.cos((currentHsl.h - 90) * Math.PI / 180) * (navigatorSize / 2) + navigatorSize / 2
        const pickerY = (currentHsl.s / 100) * Math.sin((currentHsl.h - 90) * Math.PI / 180) * (navigatorSize / 2) + navigatorSize / 2

        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg border border-gray-300"
                style={{ backgroundColor: value }}
              ></div>
              <div className="flex-1">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="#000000"
                />
              </div>
      </div>

            {/* Color Navigator */}
        <div className="space-y-3">
              <div className="text-center">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Color Navigator</h4>
                <div className="relative inline-block">
                  <div
                    ref={navigatorRef}
                    className="relative rounded-full cursor-crosshair"
                    style={{
                      width: navigatorSize,
                      height: navigatorSize,
                      background: `conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`
                    }}
                    onMouseDown={handleNavigatorMouseDown}
                    onMouseMove={handleNavigatorMouseMove}
                    onMouseUp={handleNavigatorMouseUp}
                  >
                    {/* Picker indicator */}
                    <div
                      className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
                      style={{
                        left: pickerX - 8,
                        top: pickerY - 8,
                        transform: 'translate(0, 0)'
                      }}
            />
          </div>
        </div>
              </div>

              {/* HSL Sliders */}
        <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Hue</span>
                    <span>{Math.round(currentHsl.h)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={currentHsl.h}
                    onChange={(e) => handleHslChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Saturation</span>
                    <span>{Math.round(currentHsl.s)}%</span>
                  </div>
            <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentHsl.s}
                    onChange={(e) => handleHslChange(undefined, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(${currentHsl.h}, 0%, ${currentHsl.l}%), hsl(${currentHsl.h}, 100%, ${currentHsl.l}%))`
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Lightness</span>
                    <span>{Math.round(currentHsl.l)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentHsl.l}
                    onChange={(e) => handleHslChange(undefined, undefined, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(${currentHsl.h}, ${currentHsl.s}%, 0%), hsl(${currentHsl.h}, ${currentHsl.s}%, 50%), hsl(${currentHsl.h}, ${currentHsl.s}%, 100%))`
                    }}
            />
          </div>
        </div>
      </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleColorChange('#000000')}
                className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Black
              </button>
              <button
                onClick={() => handleColorChange('#FFFFFF')}
                className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                White
              </button>
              <button
                onClick={() => {
                  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16)
                  handleColorChange(randomColor)
                }}
                className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Random
              </button>
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
            >
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: value }}
              ></div>
              <span className="text-sm text-gray-700">{value}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-1 p-4 bg-white border border-gray-300 rounded-lg shadow-xl z-10 min-w-[320px]">
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('picker')}
                      className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'picker' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Color Picker
                    </button>
                    <button
                      onClick={() => setActiveTab('presets')}
                      className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'presets' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'history' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      History
                    </button>
                  </div>

                  {/* Color Picker Tab */}
                  {activeTab === 'picker' && <ColorNavigator />}

                  {/* Presets Tab */}
                  {activeTab === 'presets' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Basic Colors</h4>
                        <div className="grid grid-cols-8 gap-1">
                          {presetColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                handleColorChange(color)
                                setIsOpen(false)
                              }}
                              className={`w-8 h-8 rounded border-2 transition-all ${
                                value === color 
                                  ? 'border-gray-800 scale-110' 
                                  : 'border-gray-300 hover:border-gray-500'
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {value === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Themes</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: 'Dark', bg: '#1F2937' },
                            { name: 'Light', bg: '#FFFFFF' },
                            { name: 'Blue', bg: '#3B82F6' },
                            { name: 'Green', bg: '#10B981' },
                            { name: 'Purple', bg: '#8B5CF6' },
                            { name: 'Orange', bg: '#F59E0B' }
                          ].map((theme) => (
                            <button
                              key={theme.name}
                              onClick={() => {
                                handleColorChange(theme.bg)
                                setIsOpen(false)
                              }}
                              className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                            >
                              <div 
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: theme.bg }}
                              ></div>
                              <span className="text-xs text-gray-700">{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700">Recent Colors</h4>
                      {colorHistory.length > 0 ? (
                        <div className="grid grid-cols-8 gap-1">
                          {colorHistory.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleColorChange(color)
                                setIsOpen(false)
                              }}
                              className={`w-8 h-8 rounded border-2 transition-all ${
                                value === color 
                                  ? 'border-gray-800 scale-110' 
                                  : 'border-gray-300 hover:border-gray-500'
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {value === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-4">
                          No color history yet
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
        </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size (px)
          </label>
          <Input
            type="number"
            min="12"
            max="48"
            value={field.fontSize}
            onChange={(e) => updateField({ fontSize: parseInt(e.target.value) || 16 })}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AdvancedColorPicker
            value={field.textColor}
            onChange={(color) => updateField({ textColor: color })}
            label="Text Color"
          />
          <AdvancedColorPicker
            value={field.backgroundColor}
            onChange={(color) => updateField({ backgroundColor: color })}
            label="Background Color"
          />
      </div>
    </div>
  )
  }

  const renderPreview = () => {
    const typeInfo = getCurrentTypeInfo()
    const Icon = typeInfo.icon

    const getPreviewContent = () => {
      switch (field.type) {
        case 'math':
          return (
            <div className="text-center space-y-3">
              <div className="text-lg font-mono">5 + 3 = ?</div>
              <div className="w-24 h-8 mx-auto border border-gray-300 rounded bg-white"></div>
            </div>
          )
        case 'text':
          return (
            <div className="text-center space-y-3">
              <div className="text-lg font-mono bg-gray-100 p-2 rounded">A7B9C</div>
              <div className="w-32 h-8 mx-auto border border-gray-300 rounded bg-white"></div>
            </div>
          )
        case 'audio':
          return (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">Listen to audio</span>
              </div>
              <div className="w-32 h-8 mx-auto border border-gray-300 rounded bg-white"></div>
            </div>
          )
        case 'slider':
          return (
            <div className="text-center space-y-3">
              <div className="text-sm">Slide to verify</div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="w-1/3 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          )
        case 'checkbox':
          return (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">I'm not a robot</span>
              </div>
            </div>
          )
        case 'color':
          return (
            <div className="text-center space-y-3">
              <div className="text-sm">Click red squares</div>
              <div className="grid grid-cols-3 gap-1">
                {['red', 'blue', 'green', 'yellow', 'red', 'purple', 'orange', 'pink', 'red'].map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>
          )
        case 'word':
    return (
            <div className="text-center space-y-3">
              <div className="text-sm">Complete: "The sky is..."</div>
              <div className="grid grid-cols-2 gap-1">
                {['blue', 'red', 'green', 'yellow'].map((option, i) => (
                  <button key={i} className="text-xs p-1 border rounded hover:bg-gray-50">
                    {option}
                  </button>
                ))}
            </div>
              </div>
          )
        case 'sequence':
          return (
            <div className="text-center space-y-3">
              <div className="text-sm">Remember: A - B - C</div>
              <div className="grid grid-cols-3 gap-1">
                {['A', 'B', 'C', '1', '2', '3', 'D', 'E', 'F'].map((item, i) => (
                  <button key={i} className="w-6 h-6 text-xs border rounded hover:bg-gray-50">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )
        default:
          return (
            <div className="text-center space-y-3">
              <div className="text-sm">Challenge preview</div>
              <div className="w-24 h-8 mx-auto border border-gray-300 rounded bg-white"></div>
            </div>
          )
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
          <Badge variant="outline" className="text-xs">
            {typeInfo.label}
          </Badge>
            </div>

            <div 
          className="p-4 rounded-lg border-2 border-dashed border-gray-200"
              style={{
                backgroundColor: field.backgroundColor,
                color: field.textColor,
                fontSize: `${field.fontSize}px`
              }}
            >
          <div className="space-y-3">
            {/* Question Text */}
            <div className="text-center">
              <p className="font-medium">{field.questionText || typeInfo.defaultQuestion}</p>
              {field.customInstructions && (
                <p className="text-xs opacity-75 mt-1">{field.customInstructions}</p>
              )}
            </div>

            {/* Challenge Preview */}
            <div className="flex justify-center">
              {getPreviewContent()}
            </div>

            {/* Settings Summary */}
            <div className="grid grid-cols-3 gap-2 text-xs opacity-75">
              <div className="text-center">
                <div className="font-medium">Difficulty</div>
                <div className="capitalize">{field.difficulty}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Time</div>
                <div>{field.timeLimit}s</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Attempts</div>
                <div>{field.maxAttempts}</div>
              </div>
              </div>
              </div>
            </div>
          </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* CAPTCHA Type Selection */}
        <Card>
        <CardContent className="p-4">
          {renderSectionHeader('CAPTCHA Type', 'type', <Shield className="w-4 h-4" />)}
          {isSectionExpanded('type') && (
            <div className="p-3 pt-0">
              {renderTypeSelection()}
              </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Settings */}
      <Card>
        <CardContent className="p-4">
          {renderSectionHeader('Basic Settings', 'basic', <Settings className="w-4 h-4" />)}
          {isSectionExpanded('basic') && (
            <div className="p-3 pt-0">
              {renderBasicSettings()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardContent className="p-4">
          {renderSectionHeader('Behavior Settings', 'behavior', <Settings className="w-4 h-4" />)}
          {isSectionExpanded('behavior') && (
            <div className="p-3 pt-0">
              {renderBehaviorSettings()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual and Preview removed; live card now shown on question card */}
    </div>
  )
} 