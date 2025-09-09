'use client'

import React from 'react'
import { 
  Cog6ToothIcon, 
  PaintBrushIcon, 
  CursorArrowRaysIcon, 
  ShieldCheckIcon, 
  EyeIcon, 
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline'
import { FormField } from '@/types'

interface StarRatingConfigProps {
  field: FormField
  updateField: (updates: Partial<FormField>) => void
}

export default function StarRatingConfig({ field, updateField }: StarRatingConfigProps) {
  const updateSettings = (updates: any) => {
    updateField({
      settings: {
        ...field.settings,
        ...updates
      }
    })
  }

  const updateValidation = (updates: any) => {
    updateSettings({
      validation: {
        ...field.settings?.validation,
        ...updates
      }
    })
  }

  const updateBehavior = (updates: any) => {
    updateSettings({
      behavior: {
        ...field.settings?.behavior,
        ...updates
      }
    })
  }

  const updateStyling = (updates: any) => {
    updateSettings({
      styling: {
        ...field.settings?.styling,
        ...updates
      }
    })
  }

  const updateAccessibility = (updates: any) => {
    updateSettings({
      accessibility: {
        ...field.settings?.accessibility,
        ...updates
      }
    })
  }

  const updateIntegration = (updates: any) => {
    updateSettings({
      integration: {
        ...field.settings?.integration,
        ...updates
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
        </div>
        
        <div className="space-y-4">
          {/* Rating Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Type
            </label>
            <select
              value={field.settings?.ratingType || 'stars'}
              onChange={(e) => updateSettings({
                ratingType: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="stars">Stars</option>
              <option value="hearts">Hearts</option>
              <option value="thumbs">Thumbs</option>
              <option value="circles">Circles</option>
              <option value="custom">Custom Icons</option>
            </select>
          </div>

          {/* Maximum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Rating
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={field.settings?.maxRating || 5}
              onChange={(e) => updateSettings({
                maxRating: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Value
            </label>
            <input
              type="number"
              min="0"
              max={field.settings?.maxRating || 5}
              value={field.settings?.defaultValue || 0}
              onChange={(e) => updateSettings({
                defaultValue: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Allow Half Ratings */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowHalfRatings"
              checked={field.settings?.allowHalfRatings || false}
              onChange={(e) => updateSettings({
                allowHalfRatings: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="allowHalfRatings" className="ml-2 block text-sm text-gray-900">
              Allow half ratings (e.g., 3.5 stars)
            </label>
          </div>

          {/* Show Rating Text */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showRatingText"
              checked={field.settings?.showRatingText || false}
              onChange={(e) => updateSettings({
                showRatingText: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="showRatingText" className="ml-2 block text-sm text-gray-900">
              Show rating text (e.g., "3 out of 5 stars")
            </label>
          </div>

          {/* Show Average Rating */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showAverageRating"
              checked={field.settings?.showAverageRating || false}
              onChange={(e) => updateSettings({
                showAverageRating: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="showAverageRating" className="ml-2 block text-sm text-gray-900">
              Show average rating from all users
            </label>
          </div>
        </div>
      </div>

      {/* Styling Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PaintBrushIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Styling</h3>
        </div>
        
        <div className="space-y-4">
          {/* Icon Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon Size
            </label>
            <select
              value={field.settings?.iconSize || 'medium'}
              onChange={(e) => updateSettings({
                iconSize: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Filled Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filled Color
            </label>
            <input
              type="color"
              value={field.settings?.filledColor || '#FFD700'}
              onChange={(e) => updateSettings({
                filledColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Empty Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empty Color
            </label>
            <input
              type="color"
              value={field.settings?.emptyColor || '#E5E7EB'}
              onChange={(e) => updateSettings({
                emptyColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Hover Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hover Color
            </label>
            <input
              type="color"
              value={field.settings?.hoverColor || '#FFA500'}
              onChange={(e) => updateSettings({
                hoverColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Icon Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon Spacing
            </label>
            <select
              value={field.settings?.iconSpacing || 'normal'}
              onChange={(e) => updateSettings({
                iconSpacing: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="loose">Loose</option>
            </select>
          </div>

          {/* Animation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation
            </label>
            <select
              value={field.settings?.animation || 'scale'}
              onChange={(e) => updateSettings({
                animation: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="none">None</option>
              <option value="scale">Scale</option>
              <option value="bounce">Bounce</option>
              <option value="pulse">Pulse</option>
              <option value="shake">Shake</option>
            </select>
          </div>
        </div>
      </div>

      {/* Behavior Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CursorArrowRaysIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Behavior</h3>
        </div>
        
        <div className="space-y-4">
          {/* Read Only */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="readOnly"
              checked={field.settings?.behavior?.readOnly || false}
              onChange={(e) => updateBehavior({
                readOnly: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="readOnly" className="ml-2 block text-sm text-gray-900">
              Read only (display only)
            </label>
          </div>

          {/* Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={field.required}
              onChange={(e) => updateField({
                required: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
              Required field
            </label>
          </div>

          {/* Disabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disabled"
              checked={field.settings?.behavior?.disabled || false}
              onChange={(e) => updateBehavior({
                disabled: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">
              Disabled
            </label>
          </div>

          {/* Clear Rating */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowClear"
              checked={field.settings?.allowClear || false}
              onChange={(e) => updateSettings({
                allowClear: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="allowClear" className="ml-2 block text-sm text-gray-900">
              Allow clearing rating
            </label>
          </div>

          {/* Show Tooltip */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showTooltip"
              checked={field.settings?.showTooltip || false}
              onChange={(e) => updateSettings({
                showTooltip: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="showTooltip" className="ml-2 block text-sm text-gray-900">
              Show tooltip on hover
            </label>
          </div>

          {/* Auto Save */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSave"
              checked={field.settings?.autoSave || false}
              onChange={(e) => updateSettings({
                autoSave: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-900">
              Auto-save on rating change
            </label>
          </div>
        </div>
      </div>

      {/* Validation Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Validation</h3>
        </div>
        
        <div className="space-y-4">
          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating Required
            </label>
            <input
              type="number"
              min="1"
              max={field.settings?.maxRating || 5}
              value={field.settings?.validation?.minRating || ''}
              onChange={(e) => updateValidation({
                minRating: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="No minimum"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Maximum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Rating Allowed
            </label>
            <input
              type="number"
              min="1"
              max={field.settings?.maxRating || 5}
              value={field.settings?.validation?.maxRating || ''}
              onChange={(e) => updateValidation({
                maxRating: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="No maximum"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Custom Validation Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Validation Pattern
            </label>
            <input
              type="text"
              value={field.settings?.validation?.customRules?.[0]?.pattern || ''}
              onChange={(e) => updateValidation({
                customRules: [{
                  type: 'pattern',
                  pattern: e.target.value,
                  message: 'Invalid rating value'
                }]
              })}
              placeholder="Enter regex pattern"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Error Messages */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Error Messages</h4>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Required</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.required || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    required: e.target.value
                  }
                })}
                placeholder="Please provide a rating"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum Rating</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.minRating || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    minRating: e.target.value
                  }
                })}
                placeholder="Rating must be at least {min}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum Rating</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.maxRating || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    maxRating: e.target.value
                  }
                })}
                placeholder="Rating cannot exceed {max}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <EyeIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Accessibility</h3>
        </div>
        
        <div className="space-y-4">
          {/* ARIA Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Label
            </label>
            <input
              type="text"
              value={field.settings?.accessibility?.ariaLabel || ''}
              onChange={(e) => updateAccessibility({
                ariaLabel: e.target.value
              })}
              placeholder="Enter ARIA label for screen readers"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* ARIA Described By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Described By
            </label>
            <input
              type="text"
              value={field.settings?.accessibility?.ariaDescribedBy || ''}
              onChange={(e) => updateAccessibility({
                ariaDescribedBy: e.target.value
              })}
              placeholder="ID of element that describes this field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Tab Index */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tab Index
            </label>
            <input
              type="number"
              value={field.settings?.accessibility?.tabIndex || ''}
              onChange={(e) => updateAccessibility({
                tabIndex: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Role
            </label>
            <select
              value={field.settings?.accessibility?.role || 'slider'}
              onChange={(e) => updateAccessibility({
                role: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="slider">Slider</option>
              <option value="radiogroup">Radio Group</option>
              <option value="group">Group</option>
              <option value="button">Button</option>
            </select>
          </div>
        </div>
      </div>

      {/* Integration Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <WrenchScrewdriverIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Integration</h3>
        </div>
        
        <div className="space-y-4">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={field.settings?.integration?.webhookUrl || ''}
              onChange={(e) => updateIntegration({
                webhookUrl: e.target.value
              })}
              placeholder="https://api.example.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom CSS
            </label>
            <textarea
              value={field.settings?.integration?.customCSS || ''}
              onChange={(e) => updateIntegration({
                customCSS: e.target.value
              })}
              placeholder="Enter custom CSS for this field"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Custom JavaScript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom JavaScript
            </label>
            <textarea
              value={field.settings?.integration?.customJS || ''}
              onChange={(e) => updateIntegration({
                customJS: e.target.value
              })}
              placeholder="Enter custom JavaScript for this field"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 