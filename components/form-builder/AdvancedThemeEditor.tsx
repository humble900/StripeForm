'use client'

import React, { useState } from 'react'
import { FormTheme } from '@/types'

interface AdvancedThemeEditorProps {
  theme: FormTheme
  onUpdate: (theme: FormTheme) => void
}

export function AdvancedThemeEditor({ theme, onUpdate }: AdvancedThemeEditorProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'custom'>('colors')
  const [customCSS, setCustomCSS] = useState(theme.custom_css || '')

  const colorPresets = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#1E40AF', background: '#FFFFFF', text: '#1F2937' },
    { name: 'Green', primary: '#10B981', secondary: '#059669', background: '#FFFFFF', text: '#1F2937' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#7C3AED', background: '#FFFFFF', text: '#1F2937' },
    { name: 'Orange', primary: '#F59E0B', secondary: '#D97706', background: '#FFFFFF', text: '#1F2937' },
    { name: 'Red', primary: '#EF4444', secondary: '#DC2626', background: '#FFFFFF', text: '#1F2937' },
    { name: 'Dark', primary: '#1F2937', secondary: '#111827', background: '#F9FAFB', text: '#1F2937' },
  ]

  const fontPresets = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Open Sans', family: 'Open Sans, sans-serif' },
    { name: 'Lato', family: 'Lato, sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  ]

  const layoutPresets = [
    { name: 'Centered', borderRadius: 8, maxWidth: 600 },
    { name: 'Wide', borderRadius: 4, maxWidth: 800 },
    { name: 'Full Width', borderRadius: 0, maxWidth: 1200 },
    { name: 'Rounded', borderRadius: 16, maxWidth: 600 },
  ]

  const updateTheme = (updates: Partial<FormTheme>) => {
    onUpdate({ ...theme, ...updates })
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateTheme({
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      background_color: preset.background,
      text_color: preset.text,
    })
  }

  const applyFontPreset = (preset: typeof fontPresets[0]) => {
    updateTheme({
      font_family: preset.family,
    })
  }

  const applyLayoutPreset = (preset: typeof layoutPresets[0]) => {
    updateTheme({
      border_radius: preset.borderRadius,
    })
  }

  const handleCustomCSSChange = (css: string) => {
    setCustomCSS(css)
    updateTheme({ custom_css: css })
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'colors', label: 'Colors' },
            { id: 'typography', label: 'Typography' },
            { id: 'layout', label: 'Layout' },
            { id: 'custom', label: 'Custom CSS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Color Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Color Presets</h4>
            <div className="grid grid-cols-2 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Custom Colors</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.primary_color}
                    onChange={(e) => updateTheme({ primary_color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.primary_color}
                    onChange={(e) => updateTheme({ primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.secondary_color}
                    onChange={(e) => updateTheme({ secondary_color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.secondary_color}
                    onChange={(e) => updateTheme({ secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.background_color}
                    onChange={(e) => updateTheme({ background_color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.background_color}
                    onChange={(e) => updateTheme({ background_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.text_color}
                    onChange={(e) => updateTheme({ text_color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.text_color}
                    onChange={(e) => updateTheme({ text_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#1F2937"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          {/* Font Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Font Presets</h4>
            <div className="grid grid-cols-2 gap-3">
              {fontPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyFontPreset(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-gray-700">{preset.name}</div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: preset.family }}>
                    Sample text
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Font */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Font Family
            </label>
            <input
              type="text"
              value={theme.font_family}
              onChange={(e) => updateTheme({ font_family: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inter, sans-serif"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a font family (e.g., "Inter, sans-serif" or "Roboto, Arial, sans-serif")
            </p>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          {/* Layout Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Layout Presets</h4>
            <div className="grid grid-cols-2 gap-3">
              {layoutPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyLayoutPreset(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-700">{preset.name}</div>
                  <div className="text-xs text-gray-500">
                    Border radius: {preset.borderRadius}px
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius (px)
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={theme.border_radius}
              onChange={(e) => updateTheme({ border_radius: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span>{theme.border_radius}px</span>
              <span>24px</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom CSS
            </label>
            <textarea
              value={customCSS}
              onChange={(e) => handleCustomCSSChange(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="/* Add your custom CSS here */&#10;.form-container {&#10;  /* Your styles */&#10;}"
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Custom CSS will override theme settings. Use with caution.
            </p>
          </div>
        </div>
      )}

      {/* Theme Preview */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Theme Preview</h4>
          <button
            onClick={() => {
              const defaultTheme: FormTheme = {
                primary_color: '#3B82F6',
                secondary_color: '#1E40AF',
                background_color: '#FFFFFF',
                text_color: '#1F2937',
                border_radius: 8,
                font_family: 'Inter, sans-serif',
              }
              onUpdate(defaultTheme)
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset to Default
          </button>
        </div>
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: theme.background_color,
            color: theme.text_color,
            fontFamily: theme.font_family,
            borderRadius: `${theme.border_radius}px`,
          }}
        >
          <h3 className="text-lg font-medium mb-2">Sample Form</h3>
          <p className="text-sm mb-4">This is how your form will look with the current theme.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Sample Field</label>
              <input
                type="text"
                placeholder="Enter text here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.primary_color,
                  '--tw-ring-color': theme.primary_color,
                } as any}
              />
            </div>
            
            <button
              type="button"
              className="px-4 py-2 rounded-md text-white font-medium"
              style={{ backgroundColor: theme.primary_color }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 