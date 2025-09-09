'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Clock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Calculator, 
  Image, 
  Puzzle, 
  Type, 
  Settings,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Hash,
  Palette
} from 'lucide-react'

// Type definitions for CAPTCHA question field
export type CaptchaQuestionType = 'text' | 'math' | 'image' | 'puzzle'
export type CaptchaDifficulty = 'easy' | 'medium' | 'hard'

export interface CaptchaQuestionConfig {
  // Question-specific settings
  questionType: CaptchaQuestionType
  difficulty: CaptchaDifficulty
  questionText: string
  customInstructions: string
  
  // Visual settings
  textColor: string
  backgroundColor: string
  fontSize: number
  fontFamily: string
  
  // Behavior settings
  caseSensitive: boolean
  allowRetry: boolean
  maxAttempts: number
  timeLimit: number
  
  // Advanced settings
  enableSound: boolean
  showHint: boolean
  hintText: string
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
  }
]

const difficultyLevels = [
  { value: 'easy', label: 'Easy', description: 'Simple challenges, 3 attempts' },
  { value: 'medium', label: 'Medium', description: 'Moderate difficulty, 2 attempts' },
  { value: 'hard', label: 'Hard', description: 'Complex challenges, 1 attempt' }
]

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' }
]

interface CaptchaQuestionConfigProps {
  config: CaptchaQuestionConfig
  onChange: (config: CaptchaQuestionConfig) => void
}

export function CaptchaQuestionConfig({ config, onChange }: CaptchaQuestionConfigProps) {
  const [activeTab, setActiveTab] = useState('question')

  const updateConfig = (updates: Partial<CaptchaQuestionConfig>) => {
    onChange({ ...config, ...updates })
  }

  const getCurrentTypeInfo = () => captchaTypes.find(type => type.id === config.questionType)!

  const renderQuestionTypeCard = (typeInfo: CaptchaTypeInfo) => {
    const isSelected = config.questionType === typeInfo.id
    const Icon = typeInfo.icon

    return (
      <Card 
        key={typeInfo.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-primary border-primary bg-primary/5' 
            : 'hover:border-gray-300'
        }`}
        onClick={() => {
          updateConfig({ 
            questionType: typeInfo.id,
            questionText: typeInfo.defaultQuestion
          })
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{typeInfo.label}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {typeInfo.description}
              </p>
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Example Questions:</label>
            <div className="flex flex-wrap gap-2">
              {typeInfo.examples.map((example, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderQuestionSettings = () => (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Question Text</label>
        <textarea
          value={config.questionText}
          onChange={(e) => updateConfig({ questionText: e.target.value })}
          placeholder="Enter the question text that will be displayed to users"
          className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          This text will appear above the CAPTCHA challenge
        </p>
      </div>

      {/* Custom Instructions */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Custom Instructions</label>
        <textarea
          value={config.customInstructions}
          onChange={(e) => updateConfig({ customInstructions: e.target.value })}
          placeholder="Enter additional instructions for users (optional)"
          className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          Optional additional guidance for users
        </p>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Difficulty Level</label>
        <Select 
          value={config.difficulty} 
          onValueChange={(value: string) => updateConfig({ difficulty: value as CaptchaDifficulty })}
        >
          <SelectTrigger>
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

      {/* Hint Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Show Hint</label>
            <p className="text-xs text-gray-500">
              Display a helpful hint to users
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.showHint}
            onChange={(e) => updateConfig({ showHint: e.target.checked })}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
        </div>
        {config.showHint && (
          <Input
            value={config.hintText}
            onChange={(e) => updateConfig({ hintText: e.target.value })}
            placeholder="Enter hint text"
            className="w-full"
          />
        )}
      </div>
    </div>
  )

  const renderVisualSettings = () => (
    <div className="space-y-6">
      {/* Font Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-medium">Font Family</label>
          <Select 
            value={config.fontFamily} 
            onValueChange={(value: string) => updateConfig({ fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium">Font Size (px)</label>
          <Input
            type="number"
            min="12"
            max="48"
            value={config.fontSize}
            onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) || 16 })}
            className="w-full"
          />
        </div>
      </div>

      {/* Color Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-medium">Text Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.textColor}
              onChange={(e) => updateConfig({ textColor: e.target.value })}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={config.textColor}
              onChange={(e) => updateConfig({ textColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={config.backgroundColor}
              onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Text Preview</label>
        <div 
          className="p-4 border border-gray-300 rounded-lg"
          style={{
            backgroundColor: config.backgroundColor,
            color: config.textColor,
            fontSize: `${config.fontSize}px`,
            fontFamily: config.fontFamily
          }}
        >
          {config.questionText || 'Preview text will appear here'}
        </div>
      </div>
    </div>
  )

  const renderBehaviorSettings = () => (
    <div className="space-y-6">
      {/* Attempts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Maximum Attempts</label>
          <Badge variant="outline">{config.maxAttempts}</Badge>
        </div>
        <Input
          type="number"
          min="1"
          max="5"
          value={config.maxAttempts}
          onChange={(e) => updateConfig({ maxAttempts: parseInt(e.target.value) || 1 })}
          className="w-full"
        />
      </div>

      {/* Time Limit */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Time Limit (seconds)</label>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Badge variant="outline">{config.timeLimit}s</Badge>
          </div>
        </div>
        <Input
          type="number"
          min="30"
          max="300"
          step="30"
          value={config.timeLimit}
          onChange={(e) => updateConfig({ timeLimit: parseInt(e.target.value) || 60 })}
          className="w-full"
        />
      </div>

      {/* Case Sensitivity */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium">Case Sensitive</label>
          <p className="text-xs text-gray-500">
            Require exact case matching for text inputs
          </p>
        </div>
        <input
          type="checkbox"
          checked={config.caseSensitive}
          onChange={(e) => updateConfig({ caseSensitive: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
      </div>

      {/* Allow Retry */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium">Allow Retry</label>
          <p className="text-xs text-gray-500">
            Allow users to retry after incorrect attempts
          </p>
        </div>
        <input
          type="checkbox"
          checked={config.allowRetry}
          onChange={(e) => updateConfig({ allowRetry: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
      </div>

      {/* Sound */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium">Enable Sound</label>
          <p className="text-xs text-gray-500">
            Play audio feedback for interactions
          </p>
        </div>
        <input
          type="checkbox"
          checked={config.enableSound}
          onChange={(e) => updateConfig({ enableSound: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
      </div>
    </div>
  )

  const renderQuestionPreview = () => {
    const typeInfo = getCurrentTypeInfo()
    const Icon = typeInfo.icon

    return (
      <Card className="sticky top-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Question Preview</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              See how your CAPTCHA question will appear
            </p>

            {/* Question Type */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{typeInfo.label}</p>
                <p className="text-sm text-gray-500">{typeInfo.description}</p>
              </div>
            </div>

            {/* Question Text Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <div 
                className="p-3 border border-gray-300 rounded-lg"
                style={{
                  backgroundColor: config.backgroundColor,
                  color: config.textColor,
                  fontSize: `${config.fontSize}px`,
                  fontFamily: config.fontFamily
                }}
              >
                {config.questionText || 'Question text will appear here'}
              </div>
            </div>

            {/* Custom Instructions */}
            {config.customInstructions && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{config.customInstructions}</p>
                </div>
              </div>
            )}

            {/* Hint */}
            {config.showHint && config.hintText && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Hint</label>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{config.hintText}</p>
                </div>
              </div>
            )}

            {/* Challenge Placeholder */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Challenge Area</label>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">CAPTCHA challenge will appear here</span>
                </div>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Settings Summary</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-gray-500" />
                  <span>Difficulty: {config.difficulty}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>Time: {config.timeLimit}s</span>
                </div>
                <div className="flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 text-gray-500" />
                  <span>Attempts: {config.maxAttempts}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {config.caseSensitive ? (
                    <Eye className="w-3 h-3 text-gray-500" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-500" />
                  )}
                  <span>Case: {config.caseSensitive ? 'Sensitive' : 'Insensitive'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Configuration Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-semibold">CAPTCHA Question Configuration</h2>
              </div>
              <p className="text-gray-600">
                Configure this CAPTCHA question field for your form
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="question" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Question</span>
                </TabsTrigger>
                <TabsTrigger value="visual" className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Visual</span>
                </TabsTrigger>
                <TabsTrigger value="behavior" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Behavior</span>
                </TabsTrigger>
                <TabsTrigger value="type" className="flex items-center space-x-2">
                  <Type className="w-4 h-4" />
                  <span>Type</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="question" className="mt-6">
                {renderQuestionSettings()}
              </TabsContent>

              <TabsContent value="visual" className="mt-6">
                {renderVisualSettings()}
              </TabsContent>

              <TabsContent value="behavior" className="mt-6">
                {renderBehaviorSettings()}
              </TabsContent>

              <TabsContent value="type" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {captchaTypes.map(renderQuestionTypeCard)}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Question Preview Panel */}
      <div className="lg:col-span-1">
        {renderQuestionPreview()}
      </div>
    </div>
  )
} 